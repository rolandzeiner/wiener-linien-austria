"""Wiener Linien Austria integration."""
from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from typing import Any

import voluptuous as vol
from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_track_time_interval

from .alerts import async_refresh_alerts
from .card_registration import JSModuleRegistration
from .const import (
    ALERT_CACHE_VALIDATORS_KEY,
    ALERTS_REFRESH_SECONDS,
    ALERTS_REFRESH_UNSUB_KEY,
    CARD_VERSION,
    CONF_LINES,
    DOMAIN,
    DOMAIN_LAST_CALL_KEY,
    ELEVATOR_INFO_KEY,
    ENTRY_COUNT_KEY,
    FLAP_CARD_VERSION,
    RESOURCES_REGISTERED_KEY,
    RETRO_CARD_VERSION,
    STATIC_CACHE_REFRESH_HOURS,
    TRAFFIC_INFO_KEY,
)
from .coordinator import WienerLinienAustriaCoordinator, WienerLinienConfigEntry
from .rate_limit import LOCK_KEY, LOCK_LOOP_KEY
from .static import (
    BACKGROUND_REFRESH_TASK_KEY,
    CATALOGUE_KEY,
    async_refresh_catalogue,
    async_set_cached_catalogue,
)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.SENSOR]

STATIC_REFRESH_UNSUB_KEY = "static_refresh_unsub"


@websocket_command(
    {vol.Required("type"): "wiener_linien_austria/card_version"}
)
@async_response
async def _websocket_card_version(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the modern card version so the frontend can detect mismatches."""
    connection.send_result(msg["id"], {"version": CARD_VERSION})


@websocket_command(
    {vol.Required("type"): "wiener_linien_austria/retro_card_version"}
)
@async_response
async def _websocket_retro_card_version(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the retro card version so its frontend can detect mismatches."""
    connection.send_result(msg["id"], {"version": RETRO_CARD_VERSION})


@websocket_command(
    {vol.Required("type"): "wiener_linien_austria/flap_card_version"}
)
@async_response
async def _websocket_flap_card_version(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the flap card version so its frontend can detect mismatches."""
    connection.send_result(msg["id"], {"version": FLAP_CARD_VERSION})


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Wiener Linien Austria component.

    Process-scoped concerns only: register the WebSocket card-version
    commands and the Lovelace JS resource. Domain-wide *timers* are
    booted from the FIRST `async_setup_entry` and torn down by the LAST
    `async_unload_entry` — see `_ensure_domain_timers` and the unload
    cleanup tuple. Putting the timers here would leak across the
    "remove last entry, add a new one" flow because `async_setup` only
    runs once per HA process.
    """
    # WS commands are process-scoped — HA core has no deregister API.
    # `async_setup` only runs once per HA process, so duplicate
    # registration can't happen.
    async_register_command(hass, _websocket_card_version)
    async_register_command(hass, _websocket_retro_card_version)
    async_register_command(hass, _websocket_flap_card_version)

    registration = JSModuleRegistration(hass)

    async def _register_frontend(_event: Event | None = None) -> None:
        await registration.async_register()
        # Flag the sentinel so the first-entry boot doesn't double-
        # register on the happy path. _ensure_domain_timers re-runs
        # registration on its own if the sentinel is missing — which
        # is exactly what we want after async_remove_entry tore the
        # resources down.
        hass.data.setdefault(DOMAIN, {})[RESOURCES_REGISTERED_KEY] = True

    if hass.state == CoreState.running:
        await _register_frontend()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_frontend)

    return True


def _ensure_domain_timers(hass: HomeAssistant) -> None:
    """(Re)create domain-wide refresh timers if they're not running.

    Idempotent: safe to call from every `async_setup_entry`, only does
    work when the previous unsub is missing. Booted from the first
    entry, torn down by the last entry, recreated on a re-add.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})

    # Re-register Lovelace resources every time `_ensure_domain_timers`
    # finds the sentinel missing. `async_setup` only runs ONCE per HA
    # process — its JSModuleRegistration call can't recover from an
    # async_remove_entry that fired on a previous (now-deleted) last
    # entry. The delete + re-add cycle would otherwise leave the cards
    # silently unloaded until a full HA restart. `_teardown_domain_state`
    # pops the sentinel so the next first-entry boot re-runs this.
    # async_register is idempotent — short-circuits on already-current
    # resources, skips entirely in yaml-mode Lovelace.
    if RESOURCES_REGISTERED_KEY not in domain_data:
        domain_data[RESOURCES_REGISTERED_KEY] = True
        hass.async_create_task(
            JSModuleRegistration(hass).async_register(),
            name=f"{DOMAIN}_resource_register",
        )

    if STATIC_REFRESH_UNSUB_KEY not in domain_data:
        async def _periodic_refresh(_now: Any) -> None:
            # Belt-and-braces: async_refresh_catalogue catches the known
            # network / parse errors, but Store I/O can still raise
            # OSError / JSONDecodeError. Without this guard, a refresh
            # failure inside an async_track_time_interval callback only
            # logs to HA core's generic listener log — invisible to the
            # user under this integration's namespace.
            try:
                refreshed = await async_refresh_catalogue(hass)
            except Exception as err:  # noqa: BLE001 — periodic callback safety net
                _LOGGER.warning(
                    "Static-catalogue periodic refresh failed: %s", err
                )
                return
            if refreshed is not None:
                # Surface the new catalogue to future config-flow / entry-load
                # callers. Already-running coordinators keep their captured
                # ref — accepted because trip patterns and stops change on a
                # weeks-to-months cadence.
                async_set_cached_catalogue(hass, refreshed)

        domain_data[STATIC_REFRESH_UNSUB_KEY] = async_track_time_interval(
            hass,
            _periodic_refresh,
            timedelta(hours=STATIC_CACHE_REFRESH_HOURS),
            cancel_on_shutdown=True,
        )

    if ALERTS_REFRESH_UNSUB_KEY not in domain_data:
        async def _periodic_alerts(_now: Any) -> None:
            # Same safety-net rationale as _periodic_refresh above —
            # exceptions inside an async_track_time_interval callback
            # log to HA core's generic listener log, not under this
            # integration's namespace.
            try:
                await async_refresh_alerts(hass)
            except Exception as err:  # noqa: BLE001 — periodic callback safety net
                _LOGGER.warning(
                    "Alerts periodic refresh failed: %s", err
                )

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


async def async_setup_entry(hass: HomeAssistant, entry: WienerLinienConfigEntry) -> bool:
    """Set up Wiener Linien Austria from a config entry."""
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    # `_async_setup` is auto-called by `async_config_entry_first_refresh`
    # (HA core contract) — do NOT invoke it explicitly here.
    await coordinator.async_config_entry_first_refresh()

    # Reach this line ONLY when first_refresh succeeded. Bumping the
    # counter and booting the timers AFTER first_refresh keeps the
    # accounting in sync with reality: a `ConfigEntryNotReady` retry
    # storm doesn't accumulate phantom entries, and we don't strand
    # timers without a running entry to consume them.
    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[ENTRY_COUNT_KEY] = domain_data.get(ENTRY_COUNT_KEY, 0) + 1
    # Boot the domain-wide refresh timers if they're not already running.
    # Idempotent — only the FIRST entry actually creates them; subsequent
    # entries no-op. After a last-entry teardown + add cycle this also
    # recreates them, which `async_setup` (process-scoped, runs once)
    # cannot do.
    _ensure_domain_timers(hass)

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

    # If platform setup raises, HA puts the entry in setup-error state
    # and may NOT call `async_unload_entry`. We've already incremented
    # the counter and booted the timers above, so roll those back here
    # to keep `ENTRY_COUNT_KEY` honest. Without this, a
    # `forward_entry_setups` failure leaves a phantom entry in the
    # count and a subsequent removal can prematurely tear down domain
    # state that other live entries still need.
    try:
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    except Exception:  # noqa: BLE001
        # Catch broad: HA core may surface platform-setup failures from
        # third-party libraries as anything from `ImportError` to
        # `ValueError`; we don't want to enumerate them here. Reraise
        # AFTER rolling back the bookkeeping above so the caller sees
        # the original exception and HA's setup-error path runs.
        await _rollback_setup_failure(hass, coordinator)
        raise
    # Register cleanup ONLY after platform forwarding succeeds. The
    # rollback path above already runs `coordinator.async_shutdown()`;
    # registering before forward_entry_setups would mean a double call
    # on setup-failure rollback (HA invokes `async_on_unload` callbacks
    # on both successful unload AND setup-failure paths).
    entry.async_on_unload(coordinator.async_shutdown)
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    return True


def _teardown_domain_state(domain_data: dict[str, Any]) -> None:
    """Tear down every domain-wide resource that should die with the LAST entry.

    Single source of truth used by both `async_unload_entry` (normal
    last-unload path) and `_rollback_setup_failure` (setup-failure
    path) so a new cleanup key only has to land in one place.

    Cancels timer subscriptions, in-flight bg tasks, and pops every
    cache + validator key.

    Note on the modern HA alternative: per-resource cleanup
    (one timer, one listener, one lock) is better expressed via
    `entry.async_on_unload(callable)` — HA core invokes those
    callbacks on BOTH successful unload AND setup-failure, so no
    explicit rollback is needed for entry-scoped resources.
    `_teardown_domain_state` exists because the cleanup here is
    DOMAIN-WIDE (refcount-driven, shared across entries) and
    `async_on_unload` is per-entry — which is the wrong granularity
    for "fire when the LAST entry removes." Keep this pattern for
    domain-wide state; for new per-entry cleanup, prefer
    `entry.async_on_unload`. See PORTFOLIO_LIFTABLES.md item 6.
    """
    for unsub_key in (ALERTS_REFRESH_UNSUB_KEY, STATIC_REFRESH_UNSUB_KEY):
        unsub = domain_data.pop(unsub_key, None)
        if callable(unsub):
            unsub()
    # Cancel any in-flight static-refresh background task so it can't
    # complete after teardown and re-poison the catalogue ref. The
    # task's done-callback also self-clears the slot; popping here is
    # belt-and-braces.
    bg_task = domain_data.pop(BACKGROUND_REFRESH_TASK_KEY, None)
    if isinstance(bg_task, asyncio.Task) and not bg_task.done():
        bg_task.cancel()
    # Drop the rest of the domain-wide state — caches and validators
    # are stale by definition once no entry is around to consume them.
    # RESOURCES_REGISTERED_KEY pops too so the next first-entry boot
    # re-runs JSModuleRegistration.async_register — covers the user's
    # delete-last-entry + async_remove_entry-tore-down-resources case.
    for stale_key in (
        TRAFFIC_INFO_KEY,
        ELEVATOR_INFO_KEY,
        ALERT_CACHE_VALIDATORS_KEY,
        DOMAIN_LAST_CALL_KEY,
        LOCK_KEY,
        LOCK_LOOP_KEY,
        CATALOGUE_KEY,
        RESOURCES_REGISTERED_KEY,
    ):
        domain_data.pop(stale_key, None)


async def _rollback_setup_failure(
    hass: HomeAssistant, coordinator: WienerLinienAustriaCoordinator
) -> None:
    """Decrement counter + tear down domain state on a partial-setup failure.

    Called when `async_forward_entry_setups` raises after the bookkeeping
    above already counted the entry. Shares the cleanup body with
    `async_unload_entry` via `_teardown_domain_state` because HA core
    won't call that path for a setup that never reached the loaded
    state.
    """
    await coordinator.async_shutdown()
    domain_data = hass.data.get(DOMAIN)
    if not domain_data:
        return
    remaining = max(0, domain_data.get(ENTRY_COUNT_KEY, 1) - 1)
    domain_data[ENTRY_COUNT_KEY] = remaining
    if remaining == 0:
        _teardown_domain_state(domain_data)


async def _async_reload_entry(hass: HomeAssistant, entry: WienerLinienConfigEntry) -> None:
    """Reload the config entry when its options or data change.

    Fires for options-flow updates AND for reconfigure-flow data changes
    (the config flow now calls ``async_update_and_abort`` without a
    built-in reload), making this the single reload owner.
    """
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

    # Bail if the domain dict is gone — entry was never fully set up
    # (rare but possible after a setup-error rollback) and there's
    # nothing to tear down. Using `.get` instead of `.setdefault` so we
    # don't recreate an empty dict purely to put a 0 in it.
    domain_data = hass.data.get(DOMAIN)
    if not domain_data:
        return True
    remaining = max(0, domain_data.get(ENTRY_COUNT_KEY, 1) - 1)
    domain_data[ENTRY_COUNT_KEY] = remaining
    if remaining == 0:
        _teardown_domain_state(domain_data)
    return True


async def async_remove_entry(
    hass: HomeAssistant, entry: WienerLinienConfigEntry
) -> None:
    """Drop the Lovelace resources when the LAST config entry is removed.

    Both card resources are registered once globally per integration, so
    reloading or removing a single entry must not remove them. Only when
    no other entries of this domain remain do we unregister.
    """
    # Always clear this entry's per-entry Repairs issue. If the user is
    # removing a rate-limited entry, leaving the issue behind would keep
    # warning the user about a config entry that no longer exists.
    ir.async_delete_issue(hass, DOMAIN, f"rate_limited_{entry.entry_id}")
    remaining = [
        e
        for e in hass.config_entries.async_entries(DOMAIN)
        if e.entry_id != entry.entry_id
    ]
    if remaining:
        return
    registration = JSModuleRegistration(hass)
    await registration.async_unregister()


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
            # dict.fromkeys preserves first-seen order while deduping.
            collapsed = list(
                dict.fromkeys(
                    "|".join(item.split("|", 2)[:2])
                    for item in raw
                    if isinstance(item, str) and item
                )
            )
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
