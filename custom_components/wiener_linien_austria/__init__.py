"""Wiener Linien Austria integration."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.event import async_track_time_interval

from .const import DOMAIN, STATIC_CACHE_REFRESH_HOURS
from .coordinator import WienerLinienAustriaCoordinator
from .static import async_refresh_catalogue

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.SENSOR]

STATIC_REFRESH_UNSUB_KEY = "static_refresh_unsub"


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Wiener Linien Austria component.

    Schedules a weekly refresh of the stop catalogue. First fetch happens
    lazily on first config-flow use — no need to eagerly download at startup.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})

    if STATIC_REFRESH_UNSUB_KEY not in domain_data:
        async def _periodic_refresh(_now: Any) -> None:
            await async_refresh_catalogue(hass)

        domain_data[STATIC_REFRESH_UNSUB_KEY] = async_track_time_interval(
            hass,
            _periodic_refresh,
            timedelta(hours=STATIC_CACHE_REFRESH_HOURS),
            cancel_on_shutdown=True,
        )

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Wiener Linien Austria from a config entry."""
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    coordinator.async_setup()
    entry.async_on_unload(coordinator.async_teardown)
    await coordinator.async_config_entry_first_refresh()

    entry.runtime_data = coordinator

    # Register the device up-front so the Devices panel shows the entry
    # even before any entity reports state.
    dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.title,
        manufacturer="Wiener Linien",
        model="Abfahrtsmonitor",
        configuration_url="https://www.wienerlinien.at/",
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the config entry when options are updated."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Placeholder for future schema migrations.

    v0.1.0 ships with `entry.version = 1`. When we change the schema we bump
    the version and fill this function in. Returning True lets HA load the
    entry unmodified.
    """
    return True
