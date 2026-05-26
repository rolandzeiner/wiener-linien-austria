"""Tests for the integration setup/unload lifecycle.

Covers `async_unload_entry`'s reference-count teardown — a documented
behaviour with no other test home. The card-registration paths in
`__init__.py` are version-fragile and not exercised here; they're
covered by the `test_card_version` invariants and live-HA smoke tests.
"""
from __future__ import annotations

from homeassistant.core import HomeAssistant

from unittest.mock import AsyncMock, patch

from custom_components.wiener_linien_austria.const import (
    ALERT_CACHE_VALIDATORS_KEY,
    ALERTS_REFRESH_UNSUB_KEY,
    DOMAIN,
    DOMAIN_LAST_CALL_KEY,
    ELEVATOR_INFO_KEY,
    ENTRY_COUNT_KEY,
    RESOURCES_REGISTERED_KEY,
    TRAFFIC_INFO_KEY,
)

from .conftest import make_entry as _make_entry


async def test_unload_last_entry_tears_down_domain_state(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Unloading the last entry cancels timers and drops in-memory caches.

    Without this teardown, HA keeps polling Wiener Linien for an integration
    the user has fully removed — invisible in dev, painful for users who
    reinstall and end up double-polling.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    domain_data = hass.data[DOMAIN]
    # Setup attached the alert refresh timer + bumped the entry count.
    assert ALERTS_REFRESH_UNSUB_KEY in domain_data
    assert domain_data[ENTRY_COUNT_KEY] == 1

    # Seed a cache entry to verify it's dropped on last-entry unload.
    domain_data[TRAFFIC_INFO_KEY] = ["sentinel"]
    domain_data[ELEVATOR_INFO_KEY] = ["sentinel"]
    domain_data[ALERT_CACHE_VALIDATORS_KEY] = {"x": "y"}
    domain_data[DOMAIN_LAST_CALL_KEY] = "fake-ts"

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    assert domain_data[ENTRY_COUNT_KEY] == 0
    assert ALERTS_REFRESH_UNSUB_KEY not in domain_data
    for key in (
        TRAFFIC_INFO_KEY,
        ELEVATOR_INFO_KEY,
        ALERT_CACHE_VALIDATORS_KEY,
        DOMAIN_LAST_CALL_KEY,
    ):
        assert key not in domain_data, f"{key} should be dropped on last unload"


async def test_unload_with_remaining_entry_keeps_domain_state(
    hass: HomeAssistant, mock_fetch
) -> None:
    """When unloading isn't the *last* entry, domain timers must survive.

    A user removing one of two configured stops shouldn't kill the alerts
    refresh for the other one.
    """
    from homeassistant.config_entries import ConfigEntryState

    entry_a = _make_entry()
    entry_a.add_to_hass(hass)
    await hass.config_entries.async_setup(entry_a.entry_id)
    await hass.async_block_till_done()

    # Second entry — different DIVA so the unique_id check passes.
    entry_b = _make_entry({"diva": 60200123, "stop_name": "Schwarzenbergplatz"})
    entry_b.add_to_hass(hass)
    if entry_b.state is ConfigEntryState.NOT_LOADED:
        await hass.config_entries.async_setup(entry_b.entry_id)
        await hass.async_block_till_done()

    assert hass.data[DOMAIN][ENTRY_COUNT_KEY] == 2

    assert await hass.config_entries.async_unload(entry_a.entry_id)
    await hass.async_block_till_done()

    # One entry remains → timer must still be live, count drops to 1.
    assert hass.data[DOMAIN][ENTRY_COUNT_KEY] == 1
    assert ALERTS_REFRESH_UNSUB_KEY in hass.data[DOMAIN]


async def test_delete_then_readd_re_registers_resources(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Regression: re-adding an entry after the last delete must re-register cards.

    Reproducer (bug introduced 2026-04-30, fixed 2026-05-26):
    1. User deletes the last config entry → async_remove_entry runs,
       JSModuleRegistration.async_unregister tears down Lovelace
       resource records for every bundled card.
    2. User re-adds via the config flow → async_setup_entry runs but
       async_setup does NOT (it's process-scoped, runs once per HA
       boot). Resources stay torn down; every dashboard referencing
       custom:wiener-linien-austria-card resolves to 'unknown custom
       element' until a full HA restart.

    The fix routes re-registration through _ensure_domain_timers via
    the RESOURCES_REGISTERED_KEY sentinel — popped by
    _teardown_domain_state on last-entry unload, re-set on the next
    first-entry boot. This test drives the full cycle and asserts the
    register helper fires the second time around.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    # First boot: async_setup's register call already set the sentinel.
    assert hass.data[DOMAIN].get(RESOURCES_REGISTERED_KEY) is True

    # Unload + remove the last entry — async_remove_entry fires its
    # unregister, _teardown_domain_state pops the sentinel.
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert RESOURCES_REGISTERED_KEY not in hass.data.get(DOMAIN, {})

    # Re-add a fresh entry — different DIVA so unique_id is unique vs
    # whatever HA cached. Patch async_register so we can assert the
    # NEW first-entry boot called it (the bug's symptom: it didn't).
    with patch(
        "custom_components.wiener_linien_austria.JSModuleRegistration.async_register",
        new_callable=AsyncMock,
    ) as register_mock:
        entry_new = _make_entry({"diva": 60200007, "stop_name": "Praterstern"})
        entry_new.add_to_hass(hass)
        await hass.config_entries.async_setup(entry_new.entry_id)
        await hass.async_block_till_done()

    # The fix's contract: _ensure_domain_timers re-runs the register
    # helper after the sentinel was popped on the previous teardown.
    register_mock.assert_awaited()
    # And the sentinel is re-flagged for the duration of this run so a
    # second entry add doesn't double-register.
    assert hass.data[DOMAIN].get(RESOURCES_REGISTERED_KEY) is True
