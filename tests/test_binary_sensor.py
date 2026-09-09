"""Tests for the Wiener Linien Austria staleness binary sensor.

The entity exists because `WienerLinienStopSensor.available` deliberately
breaks HA's availability contract to keep cached boards on screen during a
transient outage. These tests pin the behaviour that replaces it: an
entity automations can gate on, which stays available exactly when it has
something to report.
"""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import AsyncMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.binary_sensor import BinarySensorDeviceClass
from homeassistant.const import CONF_SCAN_INTERVAL, STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.wiener_linien_austria.binary_sensor import (
    WienerLinienStaleBinarySensor,
)
from custom_components.wiener_linien_austria.const import (
    ATTRIBUTION,
    BATCH_REGISTRY_KEY,
    DOMAIN,
    STALE_INTERVAL_MULTIPLIER,
)
from custom_components.wiener_linien_austria.coordinator import (
    MonitorData,
    WienerLinienAustriaCoordinator,
)

from .conftest import make_entry as _make_entry


def _make_coordinator(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    data: MonitorData | None,
    *,
    server_time: str | None = None,
) -> WienerLinienAustriaCoordinator:
    """Instantiate a coordinator with pre-set data — no network."""
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    coordinator.data = data
    coordinator.last_update_success = data is not None
    if server_time is not None:
        coordinator.apply_upstream_meta(server_time, None)
    return coordinator


def _fresh(offset_seconds: int = 0) -> str:
    """A serverTime `offset_seconds` in the past, in the feed's own shape."""
    return (dt_util.now() - timedelta(seconds=offset_seconds)).isoformat()


async def test_unknown_before_the_first_successful_fetch(
    hass: HomeAssistant,
) -> None:
    """`None`, not False — we have never had fresh data to go stale.

    Reporting False here would assert a freshness the integration has
    never actually observed.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(hass, entry, None)
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    assert sensor.is_on is None
    assert sensor.available is False


async def test_off_while_the_feed_is_current(hass: HomeAssistant) -> None:
    """A recent serverTime and a successful poll is the healthy case."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=[], server_time=_fresh(5))
    coordinator = _make_coordinator(hass, entry, data, server_time=_fresh(5))
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    assert sensor.is_on is False
    assert sensor.available is True


async def test_on_when_the_coordinator_reports_failure(hass: HomeAssistant) -> None:
    """The signal the stop sensor's `available` override deliberately hides.

    This is the whole point of the entity: `last_update_success` going
    False is invisible to any automation watching the stop sensor,
    because that sensor stays available on purpose.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=[], server_time=_fresh(5))
    coordinator = _make_coordinator(hass, entry, data, server_time=_fresh(5))
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)
    assert sensor.is_on is False

    coordinator.last_update_success = False

    assert sensor.is_on is True
    # Still available — an outage detector that goes unavailable during an
    # outage would be useless, which is why stock CoordinatorEntity
    # availability is overridden here too.
    assert sensor.available is True


async def test_on_when_server_time_ages_past_the_threshold(
    hass: HomeAssistant,
) -> None:
    """A 'successful' poll holding an old payload still counts as stale."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    interval = int(
        WienerLinienAustriaCoordinator(hass, entry).scan_interval.total_seconds()
    )
    old = _fresh(interval * STALE_INTERVAL_MULTIPLIER + 30)
    data = MonitorData(departures=[], server_time=old)
    coordinator = _make_coordinator(hass, entry, data, server_time=old)
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    assert coordinator.last_update_success is True
    assert sensor.is_on is True


async def test_one_missed_poll_is_not_stale(hass: HomeAssistant) -> None:
    """The threshold is a multiple of the cadence, not the cadence itself.

    A single missed poll is routine — a 5xx, a rate limit, a domain
    cooldown collision — and absorbing it is exactly what the relaxed
    availability rule exists for. Flagging it here would make the entity
    noisy enough that nobody would automate on it.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    interval = int(
        WienerLinienAustriaCoordinator(hass, entry).scan_interval.total_seconds()
    )
    recent = _fresh(interval + 5)
    data = MonitorData(departures=[], server_time=recent)
    coordinator = _make_coordinator(hass, entry, data, server_time=recent)
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    assert sensor.is_on is False


async def test_unparseable_server_time_is_not_a_problem(
    hass: HomeAssistant,
) -> None:
    """A missing/garbage timestamp on a succeeding fetch invents no fault."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=[], server_time="not-a-timestamp")
    coordinator = _make_coordinator(hass, entry, data, server_time="not-a-timestamp")
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    assert sensor.is_on is False


async def test_stale_departures_do_not_flip_the_entity(hass: HomeAssistant) -> None:
    """The frozen-feed fault is a different one, already surfaced elsewhere.

    During the 2026-08-27 ptMetro outage `serverTime` kept advancing and
    our polling was healthy — only `timePlanned` froze. That belongs to
    `stale_departures` / `stale_since` on the stop sensor, not here.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=[],
        server_time=_fresh(5),
        stale_dropped=12,
        stale_since="2026-08-27T06:42:00+02:00",
    )
    coordinator = _make_coordinator(hass, entry, data, server_time=_fresh(5))
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    assert sensor.is_on is False


async def test_attributes_expose_the_inputs_behind_the_state(
    hass: HomeAssistant,
) -> None:
    """A user should be able to see why the entity decided what it decided."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    server_time = _fresh(12)
    data = MonitorData(departures=[], server_time=server_time)
    coordinator = _make_coordinator(hass, entry, data, server_time=server_time)
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    attrs = sensor.extra_state_attributes

    assert attrs["server_time"] == server_time
    assert attrs["last_update_success"] is True
    assert 10 <= attrs["seconds_since_server_time"] <= 15
    assert attrs["stale_after_seconds"] == int(
        coordinator.scan_interval.total_seconds() * STALE_INTERVAL_MULTIPLIER
    )


async def test_threshold_tracks_the_entry_cadence(hass: HomeAssistant) -> None:
    """A 10-minute stop and a 30-second stop get different thresholds."""
    slow = _make_entry({CONF_SCAN_INTERVAL: 600})
    slow.add_to_hass(hass)
    data = MonitorData(departures=[], server_time=_fresh(5))
    coordinator = _make_coordinator(hass, slow, data, server_time=_fresh(5))
    sensor = WienerLinienStaleBinarySensor(coordinator, slow)

    assert sensor.extra_state_attributes["stale_after_seconds"] == (
        600 * STALE_INTERVAL_MULTIPLIER
    )


async def test_entity_identity_is_frozen(hass: HomeAssistant) -> None:
    """unique_id, device, device_class and attribution.

    `unique_id` in particular: changing the formula wipes the entity for
    every existing install, so it is pinned here on purpose.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=[], server_time=_fresh(5))
    coordinator = _make_coordinator(hass, entry, data, server_time=_fresh(5))
    sensor = WienerLinienStaleBinarySensor(coordinator, entry)

    assert sensor.unique_id == f"{entry.entry_id}_stale"
    assert sensor.device_class is BinarySensorDeviceClass.PROBLEM
    assert sensor.attribution == ATTRIBUTION
    assert sensor.device_info is not None
    assert sensor.device_info["identifiers"] == {(DOMAIN, entry.entry_id)}


async def test_platform_registers_the_entity(hass: HomeAssistant, mock_fetch) -> None:
    """End to end: the entity lands in the registry on a real setup."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    matches = [
        e
        for e in registry.entities.values()
        if e.config_entry_id == entry.entry_id and e.domain == "binary_sensor"
    ]
    assert len(matches) == 1
    assert matches[0].unique_id == f"{entry.entry_id}_stale"


async def test_stale_flips_on_when_the_coordinator_stops_pushing(
    hass: HomeAssistant, mock_fetch, freezer: FrozenDateTimeFactory
) -> None:
    """The failure mode the other tests structurally cannot see.

    `is_on` is a pure property and `CoordinatorEntity.should_poll` is
    False, so HA only re-evaluates it when the coordinator pushes. Every
    other test here reads the property directly, which asks the question
    itself and therefore always gets a fresh answer.

    A silently stopped batch-group timer produces no push at all, so
    nothing ever re-reads the property and the entity holds its last
    value forever — an outage detector that switches itself off during
    the one outage it cannot otherwise detect. This test goes through
    `hass.states` precisely so it depends on HA asking, not on us asking.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = entry.runtime_data
    entity_id = "binary_sensor.stephansplatz_departure_data_stale"

    # Land a fresh serverTime through the normal push path.
    coordinator.apply_upstream_meta(_fresh(0), None)
    coordinator.async_set_updated_data(coordinator.data)
    await hass.async_block_till_done()
    assert hass.states.get(entity_id).state == STATE_OFF

    # The batch group timer stops without the entry unloading. Nothing
    # will call batch_apply / batch_set_error again.
    for group in hass.data[DOMAIN][BATCH_REGISTRY_KEY].values():
        group.stop()

    threshold = int(
        coordinator.scan_interval.total_seconds() * STALE_INTERVAL_MULTIPLIER
    )
    # Patch the domain alerts timer out of the way: the jump below is long
    # enough to fire it too, and its real fetch would reach the network.
    with patch(
        "custom_components.wiener_linien_austria.async_refresh_alerts",
        new=AsyncMock(),
    ):
        freezer.tick(timedelta(seconds=threshold + 120))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()

    assert hass.states.get(entity_id).state == STATE_ON


async def test_the_recheck_does_not_write_state_when_nothing_changed(
    hass: HomeAssistant, mock_fetch, freezer: FrozenDateTimeFactory
) -> None:
    """The independent clock must stay quiet while the board is healthy.

    `seconds_since_server_time` moves on every evaluation, so writing
    unconditionally would push a state change — and a recorder row —
    every scan interval, forever, on an entity whose entire value is
    being boring. That is a worse bug than the one the clock fixes,
    because it is silent and permanent rather than conditional.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = entry.runtime_data
    entity_id = "binary_sensor.stephansplatz_departure_data_stale"

    coordinator.apply_upstream_meta(_fresh(0), None)
    coordinator.async_set_updated_data(coordinator.data)
    await hass.async_block_till_done()
    before = hass.states.get(entity_id)
    assert before.state == STATE_OFF

    # Stop the pushes, then advance by less than the staleness threshold.
    for group in hass.data[DOMAIN][BATCH_REGISTRY_KEY].values():
        group.stop()
    freezer.tick(coordinator.scan_interval)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    after = hass.states.get(entity_id)
    assert after.state == STATE_OFF
    assert after.last_updated == before.last_updated
