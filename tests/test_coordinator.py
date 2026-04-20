"""Tests for the Wiener Linien Austria coordinator."""
from __future__ import annotations

import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
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


async def test_fetch_success(hass: HomeAssistant, mock_fetch) -> None:
    """Coordinator exposes a sorted MonitorData after refresh."""
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


async def test_scan_interval_honours_config(hass: HomeAssistant) -> None:
    """The configured scan interval lands on the DataUpdateCoordinator."""
    entry = _make_entry({CONF_SCAN_INTERVAL: 120})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    assert coordinator.update_interval == timedelta(seconds=120)
