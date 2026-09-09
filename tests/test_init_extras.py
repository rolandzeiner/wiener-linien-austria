"""Coverage for the corners of __init__.py the lifecycle test doesn't reach.

The main lifecycle test (`test_init.py`) covers entry setup/unload and the
reference-counted teardown. The card-registration internals moved to
`tests/test_card_registration.py` after the JSModuleRegistration extraction.
This file fills in:

- All three WebSocket `card_version` handlers (modern + retro + flap)
- The HOMEASSISTANT_STARTED-deferred frontend registration
- async_migrate_entry placeholder
- async_unload_entry's "platform unload failed" early return
"""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import CoreState, HomeAssistant

from custom_components.wiener_linien_austria import (
    _websocket_card_version,
    _websocket_flap_card_version,
    _websocket_retro_card_version,
    async_migrate_entry,
    async_setup,
    async_unload_entry,
)
from custom_components.wiener_linien_austria.const import (
    CARD_VERSION,
    DOMAIN,
    FLAP_CARD_VERSION,
    RETRO_CARD_VERSION,
)

from .conftest import make_entry as _make_entry

# ---------------------------------------------------------------------------
# WebSocket card-version handlers
# ---------------------------------------------------------------------------


def _make_connection() -> SimpleNamespace:
    return SimpleNamespace(send_result=MagicMock())


async def test_websocket_modern_card_version(hass: HomeAssistant) -> None:
    """The undecorated handler returns the modern card version."""
    conn = _make_connection()
    # The @async_response decorator turns the public function into a sync
    # scheduler; the actual coroutine is preserved on `__wrapped__`.
    await _websocket_card_version.__wrapped__(hass, conn, {"id": 17, "type": "x"})
    conn.send_result.assert_called_once_with(17, {"version": CARD_VERSION})


async def test_websocket_retro_card_version(hass: HomeAssistant) -> None:
    """The undecorated handler returns the retro card version."""
    conn = _make_connection()
    await _websocket_retro_card_version.__wrapped__(hass, conn, {"id": 18, "type": "x"})
    conn.send_result.assert_called_once_with(18, {"version": RETRO_CARD_VERSION})


async def test_websocket_flap_card_version(hass: HomeAssistant) -> None:
    """The undecorated handler returns the flap card version."""
    conn = _make_connection()
    await _websocket_flap_card_version.__wrapped__(hass, conn, {"id": 19, "type": "x"})
    conn.send_result.assert_called_once_with(19, {"version": FLAP_CARD_VERSION})


# ---------------------------------------------------------------------------
# Card registration internals: see tests/test_card_registration.py — the
# logic moved out of __init__.py into a dedicated JSModuleRegistration
# module after the v1.4.0 platinum-baseline pass.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# async_setup — HOMEASSISTANT_STARTED listener path
# ---------------------------------------------------------------------------


async def test_setup_defers_frontend_until_started_event(
    hass: HomeAssistant,
) -> None:
    """When HA isn't running yet, registration is deferred to the start event."""
    hass.set_state(CoreState.starting)
    hass.data.pop(DOMAIN, None)

    with patch(
        "custom_components.wiener_linien_austria.JSModuleRegistration.async_register",
        new_callable=AsyncMock,
    ) as register:
        assert await async_setup(hass, {})
        # Not called immediately because HA isn't running.
        register.assert_not_awaited()


# ---------------------------------------------------------------------------
# async_unload_entry — platform-unload-failed early return
# ---------------------------------------------------------------------------


async def test_unload_entry_returns_false_when_platforms_fail(
    hass: HomeAssistant, mock_fetch: AsyncMock
) -> None:
    """If async_unload_platforms returns False, unload short-circuits to False."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    with patch.object(
        hass.config_entries,
        "async_unload_platforms",
        new=AsyncMock(return_value=False),
    ):
        assert await async_unload_entry(hass, entry) is False


async def test_unload_entry_bails_when_domain_dict_missing(
    hass: HomeAssistant, mock_fetch: AsyncMock
) -> None:
    """If hass.data[DOMAIN] was never created, unload returns True without
    recreating an empty dict purely to record a 0 in it. Mirrors the
    "setup failed before any bookkeeping" rollback path."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    # Pretend the entry never set up — the platform unload still resolves
    # cleanly because nothing was actually loaded.
    hass.data.pop(DOMAIN, None)
    with patch.object(
        hass.config_entries,
        "async_unload_platforms",
        new=AsyncMock(return_value=True),
    ):
        assert await async_unload_entry(hass, entry) is True
    assert DOMAIN not in hass.data


async def test_setup_entry_rolls_back_on_forward_setup_failure(
    hass: HomeAssistant, mock_fetch: AsyncMock
) -> None:
    """A `forward_entry_setups` failure must decrement ENTRY_COUNT_KEY and
    tear down domain timers — HA core may not call `async_unload_entry`
    on a setup that never reached the loaded state, so the rollback has
    to happen inline. Drive the setup through `hass.config_entries.async_setup`
    so HA puts the entry into SETUP_IN_PROGRESS before our coordinator's
    `async_config_entry_first_refresh` runs (HA 2026.x rejects calls
    from any other state)."""
    from custom_components.wiener_linien_austria.const import ENTRY_COUNT_KEY

    entry = _make_entry()
    entry.add_to_hass(hass)

    with patch.object(
        hass.config_entries,
        "async_forward_entry_setups",
        new=AsyncMock(side_effect=RuntimeError("platform boom")),
    ):
        # HA core swallows the RuntimeError into a setup-error state;
        # async_setup itself returns without re-raising so we don't
        # need a try/except here.
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    # Counter rolled back to 0; domain timers torn down.
    domain_data = hass.data.get(DOMAIN, {})
    assert domain_data.get(ENTRY_COUNT_KEY, 0) == 0
    assert "static_refresh_unsub" not in domain_data
    assert "alerts_refresh_unsub" not in domain_data


# ---------------------------------------------------------------------------
# async_migrate_entry — v1 → v2 collapses CONF_LINES triples to pairs
# ---------------------------------------------------------------------------


async def test_migrate_entry_v2_is_noop(hass: HomeAssistant) -> None:
    """An already-current entry passes through unchanged."""
    entry = _make_entry()  # version=2 by default in conftest
    assert await async_migrate_entry(hass, entry) is True


async def test_migrate_entry_collapses_v1_triples_to_pairs(
    hass: HomeAssistant,
) -> None:
    """v1 triples ("U1|R|Oberlaa") are rewritten to pairs ("U1|R")."""
    from custom_components.wiener_linien_austria.const import CONF_LINES

    from .conftest import make_v1_entry

    # Two triples for the same (line, direction) — must dedupe to one.
    entry = make_v1_entry(lines=["U1|R|Oberlaa", "U1|R|Alaudagasse", "U1|H|Leopoldau"])
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.version == 2
    # Order preserved (first-seen), duplicates collapsed.
    assert entry.data[CONF_LINES] == ["U1|R", "U1|H"]


async def test_migrate_entry_handles_options_bucket(hass: HomeAssistant) -> None:
    """CONF_LINES living in entry.options (reconfigure path) is migrated too."""
    from custom_components.wiener_linien_austria.const import CONF_LINES

    from .conftest import make_v1_entry

    entry = make_v1_entry(rbls=[4111], options_lines=["U1|H|Leopoldau"])
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.version == 2
    assert entry.options[CONF_LINES] == ["U1|H"]


async def test_migrate_entry_v1_without_lines_just_bumps_version(
    hass: HomeAssistant,
) -> None:
    """Old entries without CONF_LINES still get the version bump."""
    from .conftest import make_v1_entry

    entry = make_v1_entry(rbls=[4111])  # no `lines` → omitted from data
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.version == 2


async def test_migrate_entry_rejects_future_version(hass: HomeAssistant) -> None:
    """An entry created by a future schema cannot be downgraded."""
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    entry = MockConfigEntry(
        domain=DOMAIN,
        version=99,
        data={},
        title="Future",
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is False


# ---------------------------------------------------------------------------
# The two domain-wide periodic timers
# ---------------------------------------------------------------------------
#
# Both callbacks wrap their body in a broad `except` on purpose: an exception
# escaping an `async_track_time_interval` callback is logged by HA core under
# its own generic listener namespace, not this integration's, so a repeating
# failure would be invisible to anyone reading the integration's log. These
# tests pin both legs — the success path publishing its result, and the
# failure path staying inside the guard.


async def test_static_refresh_timer_publishes_the_new_catalogue(
    hass: HomeAssistant, mock_fetch, freezer
) -> None:
    """A successful weekly refresh swaps the shared catalogue ref."""
    from datetime import timedelta

    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    from custom_components.wiener_linien_austria.const import (
        STATIC_CACHE_REFRESH_HOURS,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    sentinel = object()
    with (
        patch(
            "custom_components.wiener_linien_austria.async_refresh_catalogue",
            new=AsyncMock(return_value=sentinel),
        ),
        patch(
            "custom_components.wiener_linien_austria.async_set_cached_catalogue"
        ) as publish,
    ):
        freezer.tick(timedelta(hours=STATIC_CACHE_REFRESH_HOURS + 1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()

    publish.assert_called_once()
    assert publish.call_args.args[1] is sentinel


async def test_static_refresh_timer_swallows_a_store_error(
    hass: HomeAssistant, mock_fetch, freezer, caplog
) -> None:
    """Store I/O can raise past async_refresh_catalogue's own handlers.

    The refresh helper catches network and parse failures itself; OSError
    and JSONDecodeError from the Store write are what reach this guard.
    """
    import logging
    from datetime import timedelta

    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    from custom_components.wiener_linien_austria.const import (
        STATIC_CACHE_REFRESH_HOURS,
    )

    caplog.set_level(logging.WARNING)
    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    with patch(
        "custom_components.wiener_linien_austria.async_refresh_catalogue",
        new=AsyncMock(side_effect=OSError("disk full")),
    ):
        freezer.tick(timedelta(hours=STATIC_CACHE_REFRESH_HOURS + 1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()

    assert "Static-catalogue periodic refresh failed" in caplog.text


async def test_static_refresh_timer_ignores_a_failed_refresh(
    hass: HomeAssistant, mock_fetch, freezer
) -> None:
    """`async_refresh_catalogue` returning None must not publish None.

    Publishing it would replace a good catalogue with nothing and take
    stops_ahead and line colours down until the next weekly tick.
    """
    from datetime import timedelta

    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    from custom_components.wiener_linien_austria.const import (
        STATIC_CACHE_REFRESH_HOURS,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    with (
        patch(
            "custom_components.wiener_linien_austria.async_refresh_catalogue",
            new=AsyncMock(return_value=None),
        ),
        patch(
            "custom_components.wiener_linien_austria.async_set_cached_catalogue"
        ) as publish,
    ):
        freezer.tick(timedelta(hours=STATIC_CACHE_REFRESH_HOURS + 1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()

    publish.assert_not_called()


async def test_alerts_refresh_timer_swallows_a_failure(
    hass: HomeAssistant, mock_fetch, freezer, caplog
) -> None:
    """Same safety net on the 5-minute alerts timer."""
    import logging
    from datetime import timedelta

    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    from custom_components.wiener_linien_austria.const import ALERTS_REFRESH_SECONDS

    caplog.set_level(logging.WARNING)
    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    with patch(
        "custom_components.wiener_linien_austria.async_refresh_alerts",
        new=AsyncMock(side_effect=RuntimeError("upstream exploded")),
    ):
        freezer.tick(timedelta(seconds=ALERTS_REFRESH_SECONDS + 1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()

    assert "Alerts periodic refresh failed" in caplog.text


# ---------------------------------------------------------------------------
# Batch deregistration guards
# ---------------------------------------------------------------------------


async def test_deregister_from_batch_is_safe_after_teardown(
    hass: HomeAssistant,
) -> None:
    """Dereg runs AFTER `_teardown_domain_state` popped the registry.

    HA runs `entry.async_on_unload` callbacks after `async_unload_entry`
    returns, so on the last entry the dereg fires against domain state
    that has already been dismantled. It must be read-only there — a
    `setdefault` would resurrect the dict this teardown just dropped, and
    the resurrected copy would never be torn down again.

    Driven against a bare coordinator rather than a live entry on
    purpose: the point is that the function tolerates missing state, and
    a real setup would keep putting the state back.
    """
    from custom_components.wiener_linien_austria import _deregister_from_batch
    from custom_components.wiener_linien_austria.const import BATCH_REGISTRY_KEY
    from custom_components.wiener_linien_austria.coordinator import (
        WienerLinienAustriaCoordinator,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    # Domain dict absent entirely.
    hass.data.pop(DOMAIN, None)
    _deregister_from_batch(hass, coordinator)
    assert DOMAIN not in hass.data

    # Domain dict present but the registry key was popped by teardown.
    hass.data[DOMAIN] = {}
    _deregister_from_batch(hass, coordinator)
    assert BATCH_REGISTRY_KEY not in hass.data[DOMAIN]

    # Registry present but empty.
    hass.data[DOMAIN][BATCH_REGISTRY_KEY] = {}
    _deregister_from_batch(hass, coordinator)
    assert hass.data[DOMAIN][BATCH_REGISTRY_KEY] == {}


async def test_deregister_from_batch_ignores_an_unknown_interval(
    hass: HomeAssistant,
) -> None:
    """No group at this coordinator's cadence is a no-op, not a KeyError.

    Reachable whenever an entry's scan interval changed between
    registration and unload — an options-flow save mid-unload.
    """
    from custom_components.wiener_linien_austria import _deregister_from_batch
    from custom_components.wiener_linien_austria.const import BATCH_REGISTRY_KEY
    from custom_components.wiener_linien_austria.coordinator import (
        WienerLinienAustriaCoordinator,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    other = MagicMock()
    hass.data[DOMAIN] = {BATCH_REGISTRY_KEY: {99999: other}}

    _deregister_from_batch(hass, coordinator)

    assert 99999 in hass.data[DOMAIN][BATCH_REGISTRY_KEY]
    other.remove_member.assert_not_called()
    other.stop.assert_not_called()


# ---------------------------------------------------------------------------
# async_remove_entry
# ---------------------------------------------------------------------------


async def test_remove_entry_keeps_resources_while_another_entry_remains(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Card resources are registered once per HA process, not per entry.

    Unregistering on the removal of one of two entries would tear the
    cards out of every dashboard while the other stop is still set up.
    """
    from homeassistant.config_entries import ConfigEntryState

    from custom_components.wiener_linien_austria import async_remove_entry

    first = _make_entry()
    first.add_to_hass(hass)
    assert await hass.config_entries.async_setup(first.entry_id)
    await hass.async_block_till_done()

    second = _make_entry({"diva": 60200123, "stop_name": "Schwarzenbergplatz"})
    second.add_to_hass(hass)
    if second.state is ConfigEntryState.NOT_LOADED:
        assert await hass.config_entries.async_setup(second.entry_id)
        await hass.async_block_till_done()

    with patch(
        "custom_components.wiener_linien_austria.JSModuleRegistration"
    ) as registration:
        await async_remove_entry(hass, first)

    registration.assert_not_called()


async def test_remove_last_entry_unregisters_resources(
    hass: HomeAssistant, mock_fetch
) -> None:
    """The last entry going away takes the Lovelace resources with it.

    Also clears the entry's Repairs issue: leaving it behind would keep
    warning about a config entry the user has just deleted.
    """
    from custom_components.wiener_linien_austria import async_remove_entry

    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await hass.config_entries.async_remove(entry.entry_id)

    with (
        patch(
            "custom_components.wiener_linien_austria.JSModuleRegistration"
        ) as registration,
        patch(
            "custom_components.wiener_linien_austria.ir.async_delete_issue"
        ) as delete_issue,
    ):
        registration.return_value.async_unregister = AsyncMock()
        await async_remove_entry(hass, entry)

    registration.return_value.async_unregister.assert_awaited_once()
    delete_issue.assert_called_once()
