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
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.event import async_track_time_interval

from .alerts import async_refresh_alerts
from .const import (
    ALERT_CACHE_VALIDATORS_KEY,
    ALERTS_REFRESH_SECONDS,
    ALERTS_REFRESH_UNSUB_KEY,
    CARD_URL,
    CARD_VERSION,
    CONF_LINES,
    DOMAIN,
    DOMAIN_LAST_CALL_KEY,
    ELEVATOR_INFO_KEY,
    ENTRY_COUNT_KEY,
    RETRO_CARD_URL,
    RETRO_CARD_VERSION,
    STATIC_CACHE_REFRESH_HOURS,
    TRAFFIC_INFO_KEY,
)
from .coordinator import WienerLinienAustriaCoordinator, WienerLinienConfigEntry
from .static import async_refresh_catalogue

# Registered Lovelace cards shipped with this integration. Each tuple is
# (lovelace-served URL, version string, on-disk filename in www/).
# `_async_register_card` iterates over this list; adding a third card is
# just an append here.
_CARDS: tuple[tuple[str, str, str], ...] = (
    (CARD_URL, CARD_VERSION, "wiener-linien-austria-card.js"),
    (RETRO_CARD_URL, RETRO_CARD_VERSION, "wiener-linien-austria-retro-card.js"),
)

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
    """Return the modern card version so the frontend can detect mismatches."""
    connection.send_result(msg["id"], {"version": CARD_VERSION})


@websocket_api.websocket_command(  # type: ignore[attr-defined]
    {vol.Required("type"): "wiener_linien_austria/retro_card_version"}
)
@websocket_api.async_response  # type: ignore[attr-defined]
async def _websocket_retro_card_version(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the retro card version so its frontend can detect mismatches."""
    connection.send_result(msg["id"], {"version": RETRO_CARD_VERSION})


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

    if ALERTS_REFRESH_UNSUB_KEY not in domain_data:
        async def _periodic_alerts(_now: Any) -> None:
            await async_refresh_alerts(hass)

        # No eager first fetch — the periodic timer populates the cache after
        # ALERTS_REFRESH_SECONDS. During the warm-up window (up to 5 min after
        # start) sensors simply expose empty traffic_info / elevator_info
        # lists; not surfacing a possibly-stale alert during the first few
        # minutes is a reasonable trade for keeping startup non-blocking and
        # side-effect-free.
        domain_data[ALERTS_REFRESH_UNSUB_KEY] = async_track_time_interval(
            hass,
            _periodic_alerts,
            timedelta(seconds=ALERTS_REFRESH_SECONDS),
            cancel_on_shutdown=True,
        )

    websocket_api.async_register_command(hass, _websocket_card_version)
    websocket_api.async_register_command(hass, _websocket_retro_card_version)

    async def _register_frontend(_event: Event | None = None) -> None:
        await _async_register_cards(hass)

    if hass.state == CoreState.running:
        await _register_frontend()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_frontend)

    return True


async def _async_register_cards(hass: HomeAssistant) -> None:
    """Register every bundled Lovelace card JS + its storage resource."""
    for url, version, filename in _CARDS:
        await _async_register_one_card(hass, url, version, filename)


async def _async_register_one_card(
    hass: HomeAssistant, url: str, version: str, filename: str
) -> None:
    """Serve one card JS and upsert its Lovelace resource with ?v=version."""
    card_path = Path(__file__).parent / "www" / filename
    if not card_path.is_file():
        _LOGGER.warning("Card JS not found at %s", card_path)
        return

    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(url, str(card_path), False)]
        )
    except Exception:  # noqa: BLE001
        _LOGGER.debug("Static path already registered or unavailable: %s", url)

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

        versioned_url = f"{url}?v={version}"

        for item in resources.async_items():
            existing_base = item.get("url", "").split("?")[0]
            if existing_base == url:
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

    except Exception:  # noqa: BLE001
        _LOGGER.warning(
            "Could not register Lovelace resource – add manually: "
            "Settings → Dashboards → Resources → %s (JavaScript module)",
            url,
            exc_info=True,
        )


async def async_setup_entry(hass: HomeAssistant, entry: WienerLinienConfigEntry) -> bool:
    """Set up Wiener Linien Austria from a config entry."""
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    await coordinator.async_setup()
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

    # Reference-count active entries so the *last* unload tears down the
    # domain-wide refresh timers and in-memory caches. Without this, the
    # alerts/static timers keep firing after the user removes every entry.
    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[ENTRY_COUNT_KEY] = domain_data.get(ENTRY_COUNT_KEY, 0) + 1
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: WienerLinienConfigEntry) -> None:
    """Reload the config entry when options are updated."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: WienerLinienConfigEntry) -> bool:
    """Unload a config entry.

    When the *last* entry is removed, also tear down the domain-wide
    refresh timers and drop the in-memory caches so HA isn't left
    polling Wiener Linien for an integration that no longer exists.
    """
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if not unloaded:
        return False

    domain_data = hass.data.get(DOMAIN, {})
    remaining = max(0, domain_data.get(ENTRY_COUNT_KEY, 1) - 1)
    domain_data[ENTRY_COUNT_KEY] = remaining
    if remaining == 0:
        for unsub_key in (ALERTS_REFRESH_UNSUB_KEY, STATIC_REFRESH_UNSUB_KEY):
            unsub = domain_data.pop(unsub_key, None)
            if callable(unsub):
                unsub()
        # Drop the rest of the domain-wide state — caches and validators
        # are stale by definition once no entry is around to consume them.
        for stale_key in (
            TRAFFIC_INFO_KEY,
            ELEVATOR_INFO_KEY,
            ALERT_CACHE_VALIDATORS_KEY,
            DOMAIN_LAST_CALL_KEY,
        ):
            domain_data.pop(stale_key, None)
    return True


async def async_migrate_entry(hass: HomeAssistant, entry: WienerLinienConfigEntry) -> bool:
    """Migrate legacy entry data to the current schema.

    v1 → v2: collapse `CONF_LINES` triples (`line|direction|towards`) to
    `(line|direction)` pairs. The `line.towards` segment is unstable
    across /monitor polls on branching termini (e.g. U1/R alternates
    between Oberlaa and Alaudagasse), so it must not participate in the
    saved selection key — it survived only as a now-meaningless label.
    """
    if entry.version > 2:
        return False
    if entry.version < 2:
        config = {**entry.data, **entry.options}
        raw = config.get(CONF_LINES)
        if isinstance(raw, list):
            collapsed: list[str] = []
            seen: set[str] = set()
            for item in raw:
                if not isinstance(item, str) or not item:
                    continue
                parts = item.split("|", 2)
                key = "|".join(parts[:2]) if len(parts) >= 2 else item
                if key in seen:
                    continue
                seen.add(key)
                collapsed.append(key)
            new_data = {**entry.data}
            new_options = {**entry.options}
            # CONF_LINES may live in either bucket depending on whether
            # the user set it via initial flow (data) or reconfigure
            # (options). Update wherever it currently is, leaving the
            # other bucket alone.
            if CONF_LINES in entry.options:
                new_options[CONF_LINES] = collapsed
            if CONF_LINES in entry.data:
                new_data[CONF_LINES] = collapsed
            hass.config_entries.async_update_entry(
                entry, data=new_data, options=new_options, version=2
            )
        else:
            hass.config_entries.async_update_entry(entry, version=2)
    return True
