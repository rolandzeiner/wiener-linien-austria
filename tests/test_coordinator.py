"""Tests for the Wiener Linien Austria coordinator."""
from __future__ import annotations

import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import UpdateFailed
from homeassistant.util import dt as dt_util
from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    DOMAIN,
    DOMAIN_COOLDOWN_SECONDS,
    DOMAIN_LAST_CALL_KEY,
    ERR_RATE_LIMIT,
)
from custom_components.wiener_linien_austria.coordinator import (
    MonitorData,
    WienerLinienAustriaCoordinator,
    _parse_monitor_body,
)

from .conftest import make_entry as _make_entry


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


def test_parse_monitor_body_sorts_by_countdown(monitor_fixture) -> None:
    """_parse_monitor_body sorts all departures by countdown ascending."""
    result = _parse_monitor_body(monitor_fixture, None, "2026-04-20T14:00:00+0200")
    countdowns = [d.countdown for d in result.departures]
    assert countdowns == sorted(countdowns)
    assert result.server_time == "2026-04-20T14:00:00+0200"


def test_parse_monitor_body_surfaces_platform(monitor_fixture) -> None:
    """The `platform` field (Gleis, e.g. "1" / "2") round-trips through Departure."""
    result = _parse_monitor_body(monitor_fixture, None, None)
    # At least one departure in the fixture has a platform — capture it and
    # confirm it also appears in the dict form surfaced to sensor attributes.
    with_platform = [d for d in result.departures if d.platform]
    assert with_platform, "fixture should contain at least one departure with a platform"
    d = with_platform[0]
    assert isinstance(d.platform, str)
    assert d.to_dict()["platform"] == d.platform


def test_parse_monitor_body_filters_by_selected_lines(monitor_fixture) -> None:
    """Only selected line keys are included when `selected` is provided."""
    selected = {"U1|H|Leopoldau"}
    result = _parse_monitor_body(monitor_fixture, selected, None)
    assert all(
        d.line == "U1" and d.direction == "H" and d.towards == "Leopoldau"
        for d in result.departures
    )


def test_parse_monitor_body_empty_returns_empty() -> None:
    """Missing `data` or empty monitors list returns an empty MonitorData."""
    result = _parse_monitor_body({}, None, None)
    assert result.departures == []
    assert result.server_time is None


def test_parse_monitor_body_preserves_vehicle_towards_on_branching_lines() -> None:
    """Each departure keeps its own `vehicle.towards`, not the line's.

    Regression for #18: U1 stop "Taubstummengasse" — the API returns one
    line block with `line.towards` set to whichever terminus the *next*
    vehicle is heading to (Oberlaa or Alaudagasse), but individual
    departures within that block carry their actual `vehicle.towards`.
    The parser must surface those per-vehicle destinations and must not
    drop the whole block when `line.towards` differs from the user's
    saved selection key.
    """
    body = {
        "data": {
            "monitors": [
                {
                    "lines": [
                        {
                            "name": "U1",
                            "towards": "Alaudagasse",
                            "direction": "R",
                            "type": "ptMetro",
                            "barrierFree": True,
                            "realtimeSupported": True,
                            "trafficjam": False,
                            "departures": {
                                "departure": [
                                    {
                                        "departureTime": {"countdown": 0},
                                        "vehicle": {"towards": "Oberlaa"},
                                    },
                                    {
                                        "departureTime": {"countdown": 3},
                                        "vehicle": {"towards": "Alaudagasse"},
                                    },
                                ]
                            },
                        }
                    ]
                }
            ]
        }
    }
    # User selected the OTHER terminus (Oberlaa) at config-flow time.
    selected = {"U1|R|Oberlaa"}
    result = _parse_monitor_body(body, selected, None)
    # Line block is not dropped, both departures kept, towards reflects
    # the actual vehicle destination.
    assert {d.towards for d in result.departures} == {"Oberlaa", "Alaudagasse"}
    assert all(d.line == "U1" and d.direction == "R" for d in result.departures)


def test_parse_monitor_body_falls_back_to_line_towards_when_vehicle_missing() -> None:
    """If `vehicle.towards` is absent, fall back to `line.towards`."""
    body = {
        "data": {
            "monitors": [
                {
                    "lines": [
                        {
                            "name": "U2",
                            "towards": "Seestadt",
                            "direction": "H",
                            "type": "ptMetro",
                            "barrierFree": True,
                            "realtimeSupported": True,
                            "trafficjam": False,
                            "departures": {
                                "departure": [
                                    {"departureTime": {"countdown": 1}},
                                ]
                            },
                        }
                    ]
                }
            ]
        }
    }
    result = _parse_monitor_body(body, None, None)
    assert [d.towards for d in result.departures] == ["Seestadt"]


# ---------------------------------------------------------------------------
# stops_ahead enrichment (per-departure trip-pattern lookup)
# ---------------------------------------------------------------------------


def _u1_catalogue_for_coord():
    """Catalogue + trip-pattern index covering U1 H + R for enrichment tests."""
    from custom_components.wiener_linien_austria.static import (
        Station,
        StaticCatalogue,
        TripPattern,
        TripPatternIndex,
    )

    stations = {
        62000001: Station(62000001, "Reumannplatz", "Wien", 16.37, 48.18, [4001]),
        60201012: Station(60201012, "Stephansplatz", "Wien", 16.37, 48.21, [4111, 4118]),
        62000002: Station(62000002, "Praterstern", "Wien", 16.39, 48.22, [4222]),
        62000003: Station(62000003, "Leopoldau", "Wien", 16.47, 48.27, [4333]),
    }
    h_pattern = TripPattern(
        line_id=301, pattern_id=1, direction=1, stops=(4001, 4111, 4222, 4333)
    )
    r_pattern = TripPattern(
        line_id=301, pattern_id=2, direction=2, stops=(4333, 4222, 4118, 4001)
    )
    index = TripPatternIndex(
        patterns_by_line={301: [h_pattern, r_pattern]},
        lines_by_label={"U1": 301},
        means_by_line={301: "ptMetro"},
    )
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched="t",
        trip_patterns=index,
    )


def _u1_h_body() -> dict:
    """A /monitor body with one U1/H departure towards Leopoldau."""
    return {
        "data": {
            "monitors": [
                {
                    "lines": [
                        {
                            "name": "U1",
                            "towards": "Leopoldau",
                            "direction": "H",
                            "type": "ptMetro",
                            "barrierFree": True,
                            "realtimeSupported": True,
                            "trafficjam": False,
                            "departures": {
                                "departure": [
                                    {
                                        "departureTime": {"countdown": 2},
                                        "vehicle": {"towards": "Leopoldau"},
                                    },
                                ]
                            },
                        }
                    ]
                }
            ]
        }
    }


def test_parse_monitor_body_enriches_with_stops_ahead() -> None:
    """When catalogue + entry_rbls are passed, departures get stops_ahead."""
    catalogue = _u1_catalogue_for_coord()
    result = _parse_monitor_body(
        _u1_h_body(),
        None,
        None,
        catalogue=catalogue,
        entry_rbls=[4111, 4118],
    )
    assert len(result.departures) == 1
    sa = result.departures[0].stops_ahead
    assert sa is not None
    assert [s["name"] for s in sa] == ["Praterstern", "Leopoldau"]
    assert sa[-1].get("is_terminus") is True


def test_parse_monitor_body_omits_stops_ahead_for_unknown_line() -> None:
    """Unknown line label → stops_ahead absent on the dict, None on the dataclass."""
    catalogue = _u1_catalogue_for_coord()
    body = _u1_h_body()
    body["data"]["monitors"][0]["lines"][0]["name"] = "U99"
    result = _parse_monitor_body(
        body, None, None, catalogue=catalogue, entry_rbls=[4111]
    )
    assert result.departures[0].stops_ahead is None
    assert "stops_ahead" not in result.departures[0].to_dict()


def test_parse_monitor_body_skips_enrichment_when_no_catalogue() -> None:
    """Without catalogue/entry_rbls, the parser leaves stops_ahead None."""
    result = _parse_monitor_body(_u1_h_body(), None, None)
    assert result.departures[0].stops_ahead is None


def test_parse_monitor_body_failsoft_on_match_exception() -> None:
    """A throwing matcher must not poison the rest of the parse."""
    catalogue = _u1_catalogue_for_coord()
    body = _u1_h_body()

    def _boom(*_args, **_kwargs):
        raise RuntimeError("synthetic matcher failure")

    with patch(
        "custom_components.wiener_linien_austria.static.stops_ahead_for_match",
        side_effect=_boom,
    ):
        result = _parse_monitor_body(
            body, None, None, catalogue=catalogue, entry_rbls=[4111]
        )
    # Departure parsed; stops_ahead silently None.
    assert len(result.departures) == 1
    assert result.departures[0].stops_ahead is None


# ---------------------------------------------------------------------------
# Fetch behaviour
# ---------------------------------------------------------------------------


def _ok_response(body: dict) -> MagicMock:
    """Build a MagicMock aiohttp response that returns `body` from .json()."""
    resp = MagicMock()
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    resp.status = 200
    return resp


async def test_fetch_success_real_chain(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """Drive the *real* _async_update_data through a patched session.get.

    This replaces the earlier tautological test that only checked the mocked
    return value. Here we verify: URL built correctly (one stopId per RBL),
    raise_for_status called, JSON parsed into MonitorData, server_time and
    last_error_code stored on the coordinator.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    mock_resp = _ok_response(monitor_fixture)
    mock_get = AsyncMock(return_value=mock_resp)
    with patch.object(coordinator._session, "get", new=mock_get):
        data = await coordinator._async_update_data()

    # URL + params
    args, kwargs = mock_get.call_args
    assert args[0].endswith("/monitor")
    assert kwargs["params"] == [("stopId", "4111"), ("stopId", "4118")]
    # Response consumed
    mock_resp.raise_for_status.assert_called_once()
    mock_resp.json.assert_awaited_once()
    # Parsed correctly
    assert isinstance(data, MonitorData)
    assert len(data.departures) > 0
    assert data.departures == sorted(
        data.departures, key=lambda d: (d.countdown, d.line, d.towards)
    )
    # Side-effects on coordinator state
    assert coordinator.last_error_code == 1
    assert coordinator.server_time == monitor_fixture["message"]["serverTime"]


async def test_http_error_raises_update_failed(
    hass: HomeAssistant,
) -> None:
    """aiohttp.ClientResponseError → UpdateFailed(api_http_error)."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    req_info = MagicMock()
    req_info.real_url = "https://example/monitor"
    err = aiohttp.ClientResponseError(
        request_info=req_info, history=(), status=503, message="boom"
    )
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock(side_effect=err)
    mock_resp.json = AsyncMock()
    mock_resp.status = 503

    with (
        patch.object(
            coordinator._session, "get", new=AsyncMock(return_value=mock_resp)
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_http_error"
    assert exc.value.translation_placeholders["status"] == "503"


async def test_connection_error_raises_update_failed(hass: HomeAssistant) -> None:
    """aiohttp.ClientError → UpdateFailed(api_connection_error)."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    with (
        patch.object(
            coordinator._session,
            "get",
            new=AsyncMock(side_effect=aiohttp.ClientConnectionError("unreachable")),
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_connection_error"
    assert exc.value.translation_placeholders["error_type"] == "ClientConnectionError"


async def test_invalid_json_raises_update_failed(hass: HomeAssistant) -> None:
    """Body that is not valid JSON → UpdateFailed(api_invalid_response)."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json = AsyncMock(side_effect=ValueError("bad json"))
    mock_resp.status = 200

    with (
        patch.object(
            coordinator._session, "get", new=AsyncMock(return_value=mock_resp)
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_invalid_response"


async def test_non_dict_body_raises_update_failed(hass: HomeAssistant) -> None:
    """JSON that decodes to something other than an object → UpdateFailed."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    mock_resp = _ok_response(body={})  # placeholder, overridden below
    mock_resp.json = AsyncMock(return_value=["not", "a", "dict"])

    with (
        patch.object(
            coordinator._session, "get", new=AsyncMock(return_value=mock_resp)
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_invalid_response"
    assert "list" in exc.value.translation_placeholders["error"]


async def test_upstream_error_code_raises_update_failed(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """messageCode != 1 AND != 316 → UpdateFailed(api_upstream_error)."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    bad = dict(monitor_fixture)
    bad["message"] = {"value": "Something else", "messageCode": 500}
    mock_resp = _ok_response(bad)

    with (
        patch.object(
            coordinator._session, "get", new=AsyncMock(return_value=mock_resp)
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_upstream_error"
    assert exc.value.translation_placeholders["code"] == "500"
    # A non-rate-limit upstream error must NOT raise the rate-limit Repairs issue.
    assert coordinator._rate_limited is False


async def test_parser_skips_departures_without_countdown() -> None:
    """Departures with no countdown are silently dropped, not crashed on."""
    body = {
        "data": {
            "monitors": [
                {
                    "locationStop": {"properties": {"name": "x", "title": "x"}},
                    "lines": [
                        {
                            "name": "U1",
                            "towards": "Leopoldau",
                            "direction": "H",
                            "type": "ptMetro",
                            "departures": {
                                "departure": [
                                    # Missing countdown — should be skipped
                                    {"departureTime": {"timePlanned": "2026-01-01T00:00:00+0000"}},
                                    # Well-formed — should survive
                                    {"departureTime": {"countdown": 3}},
                                ]
                            },
                        }
                    ],
                }
            ]
        },
        "message": {"messageCode": 1},
    }
    result = _parse_monitor_body(body, None, None)
    assert len(result.departures) == 1
    assert result.departures[0].countdown == 3


async def test_config_entry_not_ready_on_first_refresh_failure(
    hass: HomeAssistant,
) -> None:
    """If the first fetch fails, the config entry ends up in SETUP_RETRY state.

    This is the `test-before-setup` Platinum rule. Uses the real UpdateFailed
    type that production code raises, so the test exercises the actual path
    HA takes — not just "any exception becomes SETUP_RETRY".
    """
    entry = _make_entry()
    entry.add_to_hass(hass)

    with patch(
        "custom_components.wiener_linien_austria.coordinator.WienerLinienAustriaCoordinator._async_update_data",
        side_effect=UpdateFailed(
            translation_domain=DOMAIN,
            translation_key="api_timeout",
            translation_placeholders={"seconds": "30"},
        ),
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_rate_limit_raises_update_failed_and_issue(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """Error code 316 raises UpdateFailed and creates a Repairs issue."""
    from homeassistant.helpers import issue_registry as ir

    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    rate_limited = dict(monitor_fixture)
    rate_limited["message"] = {"value": "Rate limit", "messageCode": ERR_RATE_LIMIT}

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json = AsyncMock(return_value=rate_limited)
    mock_resp.status = 200

    with (
        patch.object(
            coordinator._session,
            "get",
            new=AsyncMock(return_value=mock_resp),
        ),
        pytest.raises(UpdateFailed),
    ):
        await coordinator._async_update_data()

    registry = ir.async_get(hass)
    issue = registry.async_get_issue(
        DOMAIN, f"rate_limited_{entry.entry_id}"
    )
    assert issue is not None
    assert coordinator._rate_limited is True
    assert coordinator.last_error_code == ERR_RATE_LIMIT


async def test_recovery_clears_rate_limit_issue(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """Successful fetch after a rate-limit clears the Repairs issue."""
    from homeassistant.helpers import issue_registry as ir

    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    coordinator._raise_rate_limit_issue()
    registry = ir.async_get(hass)
    assert registry.async_get_issue(
        DOMAIN, f"rate_limited_{entry.entry_id}"
    ) is not None

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json = AsyncMock(return_value=monitor_fixture)
    mock_resp.status = 200
    with patch.object(
        coordinator._session,
        "get",
        new=AsyncMock(return_value=mock_resp),
    ):
        await coordinator._async_update_data()

    assert registry.async_get_issue(
        DOMAIN, f"rate_limited_{entry.entry_id}"
    ) is None
    assert coordinator._rate_limited is False


async def test_timeout_raises_update_failed(hass: HomeAssistant) -> None:
    """Request timeout → UpdateFailed with api_timeout translation key."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    with (
        patch.object(
            coordinator._session,
            "get",
            new=AsyncMock(side_effect=asyncio.TimeoutError()),
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_timeout"


async def test_domain_cooldown_serialises_calls(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """Back-to-back entries from the same domain respect the 15s cooldown.

    Tightened: assert the sleep duration is in the right neighbourhood, not
    just `> 0`. A bug that always slept for 0.001s would otherwise pass.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    # Prime domain-wide timestamp to "just now" so the cooldown must fire.
    # Push it back a tiny known amount so we can predict the remaining sleep.
    elapsed = 1.0
    hass.data.setdefault(DOMAIN, {})[DOMAIN_LAST_CALL_KEY] = (
        dt_util.utcnow() - timedelta(seconds=elapsed)
    )

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json = AsyncMock(return_value=monitor_fixture)
    mock_resp.status = 200

    with (
        patch.object(
            coordinator._session,
            "get",
            new=AsyncMock(return_value=mock_resp),
        ),
        patch(
            "custom_components.wiener_linien_austria.rate_limit.asyncio.sleep",
            new_callable=AsyncMock,
        ) as mock_sleep,
    ):
        await coordinator._async_update_data()
    mock_sleep.assert_awaited_once()
    # Sleep must close the gap to DOMAIN_COOLDOWN_SECONDS — give a generous
    # margin for the small wall-clock cost of getting from prime → check.
    expected = DOMAIN_COOLDOWN_SECONDS - elapsed
    actual = mock_sleep.call_args.args[0]
    assert abs(actual - expected) < 0.5, (
        f"expected sleep ≈{expected}s, got {actual}s"
    )


async def test_domain_cooldown_no_sleep_when_elapsed(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """When the last call is older than the cooldown, no sleep is issued.

    Guards against a regression where `_enforce_domain_cooldown` always sleeps
    — every test would still pass if we forgot the "elapsed ≥ cooldown" branch.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    # Last call was long ago (well past DOMAIN_COOLDOWN_SECONDS).
    hass.data.setdefault(DOMAIN, {})[DOMAIN_LAST_CALL_KEY] = dt_util.utcnow() - timedelta(
        seconds=DOMAIN_COOLDOWN_SECONDS + 10
    )

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json = AsyncMock(return_value=monitor_fixture)
    mock_resp.status = 200

    with (
        patch.object(
            coordinator._session,
            "get",
            new=AsyncMock(return_value=mock_resp),
        ),
        patch(
            "custom_components.wiener_linien_austria.rate_limit.asyncio.sleep",
            new_callable=AsyncMock,
        ) as mock_sleep,
    ):
        await coordinator._async_update_data()
    mock_sleep.assert_not_called()


async def test_scan_interval_honours_config(hass: HomeAssistant) -> None:
    """The configured scan interval lands on the DataUpdateCoordinator."""
    entry = _make_entry({CONF_SCAN_INTERVAL: 120})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    assert coordinator.update_interval == timedelta(seconds=120)


# ---------------------------------------------------------------------------
# async_setup: lat/lon population from the static catalogue
# ---------------------------------------------------------------------------


async def test_async_setup_populates_coordinates(hass: HomeAssistant) -> None:
    """Coordinator pulls the station's lat/lon from the cached catalogue."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    await coordinator.async_setup()
    # Sample catalogue in conftest carries Stephansplatz @ 48.2085, 16.3726.
    assert coordinator.latitude == 48.2085
    assert coordinator.longitude == 16.3726


async def test_async_setup_no_coords_when_catalogue_load_fails(
    hass: HomeAssistant,
) -> None:
    """Failure loading the catalogue leaves lat/lon as None, not fatal."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    with patch(
        "custom_components.wiener_linien_austria.static.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=RuntimeError("upstream unreachable"),
    ):
        await coordinator.async_setup()

    assert coordinator.latitude is None
    assert coordinator.longitude is None


async def test_async_setup_no_coords_when_diva_not_in_catalogue(
    hass: HomeAssistant,
) -> None:
    """Catalogue load succeeds but the DIVA is absent → coords stay None."""
    entry = _make_entry({CONF_DIVA: 99999999})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    await coordinator.async_setup()
    assert coordinator.latitude is None
    assert coordinator.longitude is None


# ---------------------------------------------------------------------------
# Parser against the bus/tram fixture — guards ptBusCity + platform handling
# ---------------------------------------------------------------------------


def test_parse_monitor_body_handles_bus_fixture(tram_fixture) -> None:
    """Line 4A (ptBusCity) round-trips type + platform + barrier_free."""
    result = _parse_monitor_body(tram_fixture, None, None)
    assert result.departures, "tram fixture should yield at least one departure"
    first = result.departures[0]
    assert first.line == "4A"
    assert first.type == "ptBusCity"
    assert first.platform == "1"
    assert first.barrier_free is True
    # All parsed departures are the same line/direction in this fixture.
    assert all(d.line == "4A" and d.direction == "H" for d in result.departures)


# ---------------------------------------------------------------------------
# Conditional GET — 304 Not Modified
# ---------------------------------------------------------------------------


async def test_304_returns_prior_data_unchanged(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """A 304 response reuses the previous MonitorData without re-parsing.

    The conditional-GET cache is the integration's main bandwidth saver. If
    a regression made 304 fall through to `resp.json()`, we'd crash on every
    cache hit because 304 has no body. This test feeds a 200 first to seed
    coordinator.data, then a 304 and verifies the cached object is returned.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    # First pass — 200, with ETag/Last-Modified for the validators to capture.
    resp_200 = MagicMock()
    resp_200.status = 200
    resp_200.headers = {"ETag": '"abc"', "Last-Modified": "Wed, 22 Apr 2026 10:00:00 GMT"}
    resp_200.raise_for_status = MagicMock()
    resp_200.json = AsyncMock(return_value=monitor_fixture)

    # Second pass — 304, no body. resp.json() would raise if accidentally
    # called, surfacing the regression we want to guard against.
    resp_304 = MagicMock()
    resp_304.status = 304
    resp_304.headers = {"ETag": '"abc"', "Last-Modified": "Wed, 22 Apr 2026 10:00:00 GMT"}
    resp_304.raise_for_status = MagicMock()
    resp_304.json = AsyncMock(side_effect=AssertionError("must not call .json() on 304"))

    mock_get = AsyncMock(side_effect=[resp_200, resp_304])
    with patch.object(coordinator._session, "get", new=mock_get):
        first = await coordinator._async_update_data()
        coordinator.data = first  # mimic DataUpdateCoordinator caching
        second = await coordinator._async_update_data()

    assert second is first  # same object, no re-parse
    # Conditional headers were sent on the second call.
    second_headers = mock_get.call_args_list[1].kwargs["headers"]
    assert second_headers.get("If-None-Match") == '"abc"'


# ---------------------------------------------------------------------------
# Exponential backoff on consecutive failures
# ---------------------------------------------------------------------------


async def test_backoff_does_not_kick_in_on_single_failure(
    hass: HomeAssistant,
) -> None:
    """A one-off failure leaves the user-configured cadence intact.

    Transient hiccups are common (single timeout, brief 5xx). Doubling the
    interval after every single failure would make a user's 60s cadence
    creep up to 120s after one bad poll, which is surprising. Backoff only
    starts at the *second* consecutive failure.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    original = coordinator.update_interval

    coordinator._note_failure()
    assert coordinator.update_interval == original


async def test_backoff_doubles_on_consecutive_failures(
    hass: HomeAssistant,
) -> None:
    """Each failure past the first doubles the interval, up to BACKOFF_CAP_SECONDS."""
    from custom_components.wiener_linien_austria.const import BACKOFF_CAP_SECONDS

    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    base_secs = coordinator.update_interval.total_seconds()

    # 1st failure: still at base. 2nd: 2x. 3rd: 4x. … capped at BACKOFF_CAP.
    coordinator._note_failure()
    coordinator._note_failure()
    assert coordinator.update_interval == timedelta(seconds=base_secs * 2)

    coordinator._note_failure()
    assert coordinator.update_interval == timedelta(seconds=base_secs * 4)

    # Drive past the cap by piling on failures.
    for _ in range(20):
        coordinator._note_failure()
    assert coordinator.update_interval == timedelta(seconds=BACKOFF_CAP_SECONDS)


async def test_backoff_resets_on_success(hass: HomeAssistant) -> None:
    """A successful tick after a backoff cycle restores the user-configured interval."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    original = coordinator.update_interval

    # Build up backoff.
    for _ in range(4):
        coordinator._note_failure()
    assert coordinator.update_interval != original

    coordinator._note_success()
    assert coordinator.update_interval == original
    assert coordinator._consecutive_failures == 0


async def test_304_with_no_prior_data_falls_through(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """If we somehow get a 304 before any 200 (e.g. stale validator from
    persistence), we fall through to raise_for_status which won't error on
    304 but the coordinator must NOT return None — that would crash sensors.

    Here we simulate the sequence: validator pre-seeded → 304 with no prior
    data → coordinator should treat 304 as success-but-empty by raising for
    status (304 < 400, so it doesn't raise) and then attempting to parse,
    which will fail on the empty body — surfaced as UpdateFailed. This is
    the safer behaviour than silently returning None.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    # No prior data — coordinator.data is None.
    resp_304 = MagicMock()
    resp_304.status = 304
    resp_304.headers = {}
    resp_304.raise_for_status = MagicMock()
    resp_304.json = AsyncMock(side_effect=ValueError("304 has no body"))

    with (
        patch.object(coordinator._session, "get", new=AsyncMock(return_value=resp_304)),
        pytest.raises(UpdateFailed),
    ):
        await coordinator._async_update_data()
