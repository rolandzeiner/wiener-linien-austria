"""Wiener Linien Austria integration."""
from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.websocket_api import ActiveConnection  # type: ignore[attr-defined]
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.event import async_track_time_interval

from .const import CARD_URL, CARD_VERSION, DOMAIN, STATIC_CACHE_REFRESH_HOURS
from .coordinator import WienerLinienAustriaCoordinator
from .static import async_refresh_catalogue

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.SENSOR]

STATIC_REFRESH_UNSUB_KEY = "static_refresh_unsub"


@websocket_api.websocket_command(  # type: ignore[attr-defined]
    {vol.Required("type"): "wiener_linien_austria/card_version"}
)
@websocket_api.async_response  # type: ignore[attr-defined]
async def _websocket_card_version(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the current card version so the frontend can detect mismatches."""
    connection.send_result(msg["id"], {"version": CARD_VERSION})


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Wiener Linien Austria component.

    Schedules a weekly refresh of the stop catalogue. First fetch happens
    lazily on first config-flow use — no need to eagerly download at startup.
    Also registers the Lovelace card once when the domain is loaded.
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

    websocket_api.async_register_command(hass, _websocket_card_version)

    async def _register_frontend(_event: Event | None = None) -> None:
        await _async_register_card(hass)

    if hass.state == CoreState.running:
        await _register_frontend()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_frontend)

    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    """Serve the card JS and add it to Lovelace resources."""
    card_path = Path(__file__).parent / "www" / "wiener-linien-austria-card.js"
    if not card_path.is_file():
        _LOGGER.warning("Card JS not found at %s", card_path)
        return

    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_URL, str(card_path), False)]
        )
    except Exception:  # noqa: BLE001
        _LOGGER.debug("Static path already registered or unavailable")

    try:
        lovelace = hass.data.get("lovelace")
        if lovelace is None:
            _LOGGER.debug(
                "Lovelace not yet available in hass.data — resource URL not updated. "
                "The WebSocket version check will notify the user if the card JS is stale."
            )
            return

        # HA <2024.x exposed .mode directly; newer versions use LovelaceData
        # where mode lives on .config. Fall back gracefully when neither exists.
        mode = getattr(lovelace, "mode", None) or getattr(
            getattr(lovelace, "config", None), "mode", None
        )
        if mode is not None and mode != "storage":
            _LOGGER.debug(
                "Lovelace is in %s mode — resource URL must be managed manually", mode
            )
            return

        resources = getattr(lovelace, "resources", None)
        if resources is None:
            _LOGGER.debug("Lovelace resources not accessible on this HA version")
            return
        await resources.async_load()

        versioned_url = f"{CARD_URL}?v={CARD_VERSION}"

        for item in resources.async_items():
            existing_base = item.get("url", "").split("?")[0]
            if existing_base == CARD_URL:
                if item.get("url") == versioned_url:
                    return  # already up to date
                try:
                    await resources.async_update_item(
                        item["id"],
                        {"res_type": "module", "url": versioned_url},
                    )
                except Exception as update_err:  # noqa: BLE001
                    _LOGGER.debug(
                        "async_update_item failed (%s), trying delete+recreate",
                        update_err,
                    )
                    await resources.async_delete_item(item["id"])
                    await resources.async_create_item(
                        {"res_type": "module", "url": versioned_url}
                    )
                _LOGGER.info("Updated Lovelace resource to %s", versioned_url)
                return

        await resources.async_create_item(
            {"res_type": "module", "url": versioned_url}
        )
        _LOGGER.info("Registered Lovelace resource %s", versioned_url)

    except Exception as err:  # noqa: BLE001
        _LOGGER.warning(
            "Could not register Lovelace resource (%s) – add manually: "
            "Settings → Dashboards → Resources → %s (JavaScript module)",
            err,
            CARD_URL,
        )


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
