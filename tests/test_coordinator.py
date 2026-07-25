"""Tests for the Wiener Linien Austria coordinator."""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import UpdateFailed
from custom_components.wiener_linien_austria.batch import BatchResult
from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    DOMAIN,
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
    assert with_platform, (
        "fixture should contain at least one departure with a platform"
    )
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
        60201012: Station(
            60201012, "Stephansplatz", "Wien", 16.37, 48.21, [4111, 4118]
        ),
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

    # Patch the symbol bound in coordinator (where it's actually called)
    # — the import is now at module level, so the historical
    # `static.stops_ahead_for_match` patch path no longer intercepts.
    with patch(
        "custom_components.wiener_linien_austria.coordinator.stops_ahead_for_match",
        side_effect=_boom,
    ):
        result = _parse_monitor_body(
            body, None, None, catalogue=catalogue, entry_rbls=[4111]
        )
    # Departure parsed; stops_ahead silently None.
    assert len(result.departures) == 1
    assert result.departures[0].stops_ahead is None


# ---------------------------------------------------------------------------
# Parser edge cases + first-refresh / setup behaviour
# ---------------------------------------------------------------------------


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
                                    {
                                        "departureTime": {
                                            "timePlanned": "2026-01-01T00:00:00+0000"
                                        }
                                    },
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


# ---------------------------------------------------------------------------
# async_setup: lat/lon population from the static catalogue
# ---------------------------------------------------------------------------


async def test_async_setup_populates_coordinates(hass: HomeAssistant) -> None:
    """Coordinator pulls the station's lat/lon from the cached catalogue."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    await coordinator._async_setup()
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

    # Patch the binding `coordinator` resolves at runtime, not the source
    # in `static`. After hoist (no more lazy import), patching the source
    # module no longer affects `coordinator.async_get_catalogue` — it was
    # bound at import time.
    with patch(
        "custom_components.wiener_linien_austria.coordinator.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=RuntimeError("upstream unreachable"),
    ):
        await coordinator._async_setup()

    assert coordinator.latitude is None
    assert coordinator.longitude is None


async def test_async_setup_no_coords_when_diva_not_in_catalogue(
    hass: HomeAssistant,
) -> None:
    """Catalogue load succeeds but the DIVA is absent → coords stay None."""
    entry = _make_entry({CONF_DIVA: 99999999})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    await coordinator._async_setup()
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
# Batch delegation — the coordinator no longer fetches; it parses its slice
# out of a shared batch result. The HTTP / 304 / backoff / rate-limit / domain
# cooldown behaviour lives in test_batch.py against MonitorBatchGroup.
# ---------------------------------------------------------------------------


class _FakeBatch:
    """Minimal stand-in for a MonitorBatchGroup with a scripted async_fetch."""

    def __init__(self, result: BatchResult | Exception) -> None:
        self._result = result

    async def async_fetch(self) -> BatchResult:
        if isinstance(self._result, Exception):
            raise self._result
        return self._result


def _batch_result(body: dict, server_time: str | None = None) -> BatchResult:
    return BatchResult(body=body, server_time=server_time)


async def test_async_update_data_parses_slice_from_batch(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """_async_update_data returns this entry's parsed slice of the batch body."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    server_time = monitor_fixture["message"]["serverTime"]
    coordinator.attach_batch(
        _FakeBatch(_batch_result(monitor_fixture, server_time))  # type: ignore[arg-type]
    )

    data = await coordinator._async_update_data()

    assert isinstance(data, MonitorData)
    assert len(data.departures) > 0
    assert data.departures == sorted(
        data.departures, key=lambda d: (d.countdown, d.line, d.towards)
    )
    assert data.server_time == server_time


async def test_async_update_data_raises_without_batch(hass: HomeAssistant) -> None:
    """Reaching _async_update_data before a batch is attached fails cleanly."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    with pytest.raises(UpdateFailed) as exc:
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_invalid_response"


async def test_async_update_data_propagates_batch_failure(
    hass: HomeAssistant,
) -> None:
    """An UpdateFailed from the batch fetch surfaces unchanged."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    coordinator.attach_batch(
        _FakeBatch(
            UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="api_timeout",
                translation_placeholders={"seconds": "30"},
            )
        )  # type: ignore[arg-type]
    )

    with pytest.raises(UpdateFailed) as exc:
        await coordinator._async_update_data()
    assert exc.value.translation_key == "api_timeout"


async def test_batch_apply_pushes_parsed_data(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """batch_apply parses the slice and pushes it as a successful update."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    coordinator.batch_apply(_batch_result(monitor_fixture, "2026-04-20T14:00:00+0200"))

    assert coordinator.last_update_success is True
    assert coordinator.data is not None
    assert len(coordinator.data.departures) > 0


async def test_batch_apply_only_includes_own_lines(hass: HomeAssistant) -> None:
    """Two entries sharing a body each keep only their own selected lines."""
    body = {
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
                                    {"departureTime": {"countdown": 2}},
                                ]
                            },
                        },
                        {
                            "name": "U3",
                            "towards": "Simmering",
                            "direction": "H",
                            "type": "ptMetro",
                            "barrierFree": True,
                            "realtimeSupported": True,
                            "trafficjam": False,
                            "departures": {
                                "departure": [
                                    {"departureTime": {"countdown": 5}},
                                ]
                            },
                        },
                    ]
                }
            ]
        },
        "message": {"messageCode": 1},
    }
    entry_u1 = _make_entry({CONF_LINES: ["U1|H"]}, unique_id="diva_u1")
    entry_u3 = _make_entry({CONF_LINES: ["U3|H"]}, unique_id="diva_u3")
    entry_u1.add_to_hass(hass)
    entry_u3.add_to_hass(hass)
    coord_u1 = WienerLinienAustriaCoordinator(hass, entry_u1)
    coord_u3 = WienerLinienAustriaCoordinator(hass, entry_u3)

    coord_u1.batch_apply(_batch_result(body))
    coord_u3.batch_apply(_batch_result(body))

    assert coord_u1.data is not None and coord_u3.data is not None
    assert {d.line for d in coord_u1.data.departures} == {"U1"}
    assert {d.line for d in coord_u3.data.departures} == {"U3"}


async def test_batch_set_error_marks_unsuccessful(hass: HomeAssistant) -> None:
    """batch_set_error flips the coordinator to an unsuccessful update."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    coordinator.batch_apply(_batch_result({"message": {"messageCode": 1}}))
    assert coordinator.last_update_success is True

    coordinator.batch_set_error(
        UpdateFailed(
            translation_domain=DOMAIN,
            translation_key="api_timeout",
            translation_placeholders={"seconds": "30"},
        )
    )
    assert coordinator.last_update_success is False


async def test_apply_upstream_meta_records_server_time_and_code(
    hass: HomeAssistant,
) -> None:
    """apply_upstream_meta records the last server time and message code."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    coordinator.apply_upstream_meta("2026-04-20T14:00:00+0200", 1)
    assert coordinator.server_time == "2026-04-20T14:00:00+0200"
    assert coordinator.last_error_code == 1


async def test_scan_interval_reflects_config(hass: HomeAssistant) -> None:
    """The configured scan interval is exposed and drives batch grouping.

    The coordinator no longer self-polls (update_interval is None); the shared
    batch group is keyed on this value instead.
    """
    entry = _make_entry({CONF_SCAN_INTERVAL: 120})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    assert coordinator.scan_interval == timedelta(seconds=120)
    assert coordinator.update_interval is None
