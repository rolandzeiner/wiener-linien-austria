"""Tests for the Wiener Linien Austria diagnostics module."""
from unittest.mock import AsyncMock, patch

from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria.const import CONF_API_KEY, DOMAIN
from custom_components.wiener_linien_austria.diagnostics import (
    async_get_config_entry_diagnostics,
)

BASE_DATA = {
    CONF_API_KEY: "super-secret-key",
    CONF_SCAN_INTERVAL: 30,
}


async def test_diagnostics_redacts_credentials(hass: HomeAssistant) -> None:
    """Credentials are redacted from the diagnostics output."""
    entry = MockConfigEntry(domain=DOMAIN, data=BASE_DATA, options={}, title="Test")
    entry.add_to_hass(hass)

    with patch(
        "custom_components.wiener_linien_austria.coordinator.WienerLinienAustriaCoordinator._async_update_data",
        new_callable=AsyncMock,
        return_value={"value": 42},
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["entry"]["data"][CONF_API_KEY] == "**REDACTED**"
    assert diag["entry"]["title"] == "Test"
    assert diag["coordinator"]["last_update_success"] is True
