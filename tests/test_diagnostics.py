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
    hass: HomeAssistant, mock_fetch
) -> None:
    """Diagnostics expose attribution, RBL list, error code, and counts."""
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
    assert coord["departure_count"] >= 0
