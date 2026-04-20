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
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
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

BASE_DATA = {
    CONF_DIVA: 60201012,
    CONF_STOP_NAME: "Stephansplatz",
    CONF_RBLS: [4111, 4118],
    CONF_LINES: ["U1|H|Leopoldau", "U1|R|Alaudagasse"],
    CONF_SCAN_INTERVAL: 60,
}


def _make_entry(data: dict | None = None) -> MockConfigEntry:
    entry_data = {**BASE_DATA, **(data or {})}
    return MockConfigEntry(
        domain=DOMAIN, data=entry_data, options={}, title="Stephansplatz"
    )


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


def test_parse_monitor_body_sorts_by_countdown(monitor_fixture) -> None:
    """_parse_monitor_body sorts all departures by countdown ascending."""
    result = _parse_monitor_body(monitor_fixture, None, "2026-04-20T14:00:00+0200")
    countdowns = [d.countdown for d in result.departures]
    assert countdowns == sorted(countdowns)
    assert result.server_time == "2026-04-20T14:00:00+0200"


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

    This is the `test-before-setup` Platinum rule.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)

    with patch(
        "custom_components.wiener_linien_austria.coordinator.WienerLinienAustriaCoordinator._async_update_data",
        side_effect=Exception("connection refused"),
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_fetch_success(hass: HomeAssistant, mock_fetch) -> None:
    """Smoke-test that mock_fetch-driven paths still round-trip data cleanly.

    Kept after replacing the earlier version with test_fetch_success_real_chain
    because most other coordinator tests rely on mock_fetch and this gives us a
    canary that the fixture itself stays aligned with MonitorData's contract.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    await coordinator.async_refresh()
    data = coordinator.data
    assert isinstance(data, MonitorData)
    assert len(data.departures) > 0


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
    """Back-to-back entries from the same domain respect the 15s cooldown."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    # Prime domain-wide timestamp to "just now" so the cooldown must fire.
    hass.data.setdefault(DOMAIN, {})[DOMAIN_LAST_CALL_KEY] = dt_util.utcnow()

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
            "custom_components.wiener_linien_austria.coordinator.asyncio.sleep",
            new_callable=AsyncMock,
        ) as mock_sleep,
    ):
        await coordinator._async_update_data()
    mock_sleep.assert_awaited_once()
    # The sleep duration must be positive (cooldown not elapsed).
    assert mock_sleep.call_args.args[0] > 0


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
            "custom_components.wiener_linien_austria.coordinator.asyncio.sleep",
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
