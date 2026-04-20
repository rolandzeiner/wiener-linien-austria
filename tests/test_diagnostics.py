"""Tests for the Wiener Linien Austria diagnostics module."""
from __future__ import annotations

from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria.const import (
    ATTRIBUTION,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
)
from custom_components.wiener_linien_austria.coordinator import _parse_monitor_body
from custom_components.wiener_linien_austria.diagnostics import (
    async_get_config_entry_diagnostics,
)

BASE_DATA = {
    CONF_DIVA: 60201012,
    CONF_STOP_NAME: "Stephansplatz",
    CONF_RBLS: [4111, 4118],
    CONF_LINES: ["U1|H|Leopoldau", "U1|R|Alaudagasse"],
    CONF_SCAN_INTERVAL: 60,
}


async def test_diagnostics_includes_attribution_and_state(
    hass: HomeAssistant, mock_fetch, monitor_fixture
) -> None:
    """Diagnostics expose attribution, RBL list, error code, and exact count."""
    # Derive the expected departure count from the fixture itself so the test
    # stays honest if the captured fixture is ever refreshed.
    expected_count = len(
        _parse_monitor_body(monitor_fixture, None, None).departures
    )
    assert expected_count > 0, "fixture must have departures for the test to mean anything"

    entry = MockConfigEntry(
        domain=DOMAIN, data=BASE_DATA, options={}, title="Stephansplatz"
    )
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)

    assert diag["attribution"] == ATTRIBUTION
    assert diag["entry"]["title"] == "Stephansplatz"
    assert diag["entry"]["version"] == 1
    assert diag["entry"]["data"][CONF_DIVA] == 60201012
    coord = diag["coordinator"]
    assert coord["rbls"] == [4111, 4118]
    assert coord["last_update_success"] is True
    # Exact count — guards against a broken diagnostics that always returns 0.
    # Note: server_time and last_error_code come from inside the real fetch
    # method; mock_fetch patches it out so those stay None in this test. They
    # are covered separately in test_coordinator (test_fetch_success_real_chain).
    assert coord["departure_count"] == expected_count
