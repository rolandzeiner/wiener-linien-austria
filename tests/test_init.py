"""Tests for the integration setup/unload lifecycle.

Covers `async_unload_entry`'s reference-count teardown — a documented
behaviour with no other test home. The card-registration paths in
`__init__.py` are version-fragile and not exercised here; they're
covered by the `test_card_version` invariants and live-HA smoke tests.
"""
from __future__ import annotations

from homeassistant.core import HomeAssistant

from custom_components.wiener_linien_austria.const import (
    ALERT_CACHE_VALIDATORS_KEY,
    ALERTS_REFRESH_UNSUB_KEY,
    DOMAIN,
    DOMAIN_LAST_CALL_KEY,
    ELEVATOR_INFO_KEY,
    ENTRY_COUNT_KEY,
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
