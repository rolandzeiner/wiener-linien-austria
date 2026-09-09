"""Binary sensor platform for Wiener Linien Austria."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import ATTRIBUTION, DOMAIN, STALE_INTERVAL_MULTIPLIER
from .coordinator import WienerLinienAustriaCoordinator, WienerLinienConfigEntry

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WienerLinienConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the staleness binary sensor for this entry."""
    coordinator = entry.runtime_data
    async_add_entities([WienerLinienStaleBinarySensor(coordinator, entry)])


class WienerLinienStaleBinarySensor(
    CoordinatorEntity[WienerLinienAustriaCoordinator], BinarySensorEntity
):
    """Reports whether this stop's departure board is still being refreshed.

    This entity exists because `WienerLinienStopSensor.available` does NOT
    follow HA's documented contract: it stays True as long as the
    coordinator holds any prior data, so a transient outage keeps serving
    the last known board instead of blanking three cards mid-render. That
    is right for a dashboard and wrong for an automation — with it in
    place, `availability_template`, `is_state(..., 'unavailable')` and
    every outage-gated automation condition never fire.

    So the availability signal moves here instead of the override being
    reverted. Dashboards keep the cached board; automations get an entity
    whose whole job is to say "the board you are looking at is old".
    Its own `available` is deliberately relaxed the same way — an entity
    that goes unavailable exactly when it has something to report would
    be useless.
    """

    _attr_has_entity_name = True
    _attr_translation_key = "stale"
    _attr_attribution = ATTRIBUTION
    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_entity_registry_enabled_default = True

    def __init__(
        self,
        coordinator: WienerLinienAustriaCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialise the entity — unique_id format is frozen."""
        super().__init__(coordinator)
        self._entry = entry
        # Last value HA was actually told about, so the self-scheduled
        # re-check below can write only on a real transition.
        self._last_is_on: bool | None = None
        self._attr_unique_id = f"{entry.entry_id}_stale"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Wiener Linien",
            model="Abfahrtsmonitor",
            configuration_url="https://www.wienerlinien.at/",
        )

    @property
    def _threshold_seconds(self) -> int:
        """How old the payload may get before it counts as stale.

        A multiple of the entry's own cadence rather than a constant: a
        stop polled every 30 s and one polled every 10 minutes have very
        different ideas of "late". `STALE_INTERVAL_MULTIPLIER` is 3, so
        two consecutive missed polls plus slack — one missed poll is
        routine (a 5xx, a rate-limit, a domain-cooldown collision), which
        is exactly what the relaxed `available` override exists to absorb.
        """
        return int(
            self.coordinator.scan_interval.total_seconds() * STALE_INTERVAL_MULTIPLIER
        )

    @property
    def is_on(self) -> bool | None:
        """Return True when this stop's board is no longer being refreshed.

        Two independent signals, because they fail differently:

        * `last_update_success` is False — the fetch itself is failing.
          Catches transport errors, rate limits and upstream 5xx, and
          flips on the first tick after the failure.
        * `server_time` has aged past the threshold — the fetch reports
          success but the payload we are holding is old anyway. Catches
          an upstream serving a cached response, and a batch group timer
          that has silently stopped. The second of those produces no
          coordinator push at all, which is why `async_added_to_hass`
          arms an independent re-check rather than relying on
          `CoordinatorEntity`'s push-only state writes.

        Deliberately NOT wired to `stale_departures`. That counts records
        the feed stopped advancing (the 2026-08-27 ptMetro outage), during
        which `serverTime` kept advancing normally and our own polling was
        perfectly healthy — a different fault, already surfaced on the stop
        sensor as `stale_departures` / `stale_since`.

        Returns None before the first successful fetch: "unknown" is
        honest there, where False would assert freshness we have never had.
        """
        if self.coordinator.data is None:
            return None
        if not self.coordinator.last_update_success:
            return True
        parsed = self.coordinator.server_time_parsed
        if parsed is None:
            # No usable upstream timestamp. The fetch is succeeding, so
            # don't manufacture a problem out of a missing field.
            return False
        age = (dt_util.utcnow() - parsed).total_seconds()
        return age > self._threshold_seconds

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the inputs behind `is_on`, so a user can see why.

        Small and fixed-size, unlike the stop sensor's payload — no
        recorder exclusion needed.
        """
        parsed = self.coordinator.server_time_parsed
        age = (
            round((dt_util.utcnow() - parsed).total_seconds())
            if parsed is not None
            else None
        )
        return {
            "server_time": self.coordinator.server_time,
            "seconds_since_server_time": age,
            "stale_after_seconds": self._threshold_seconds,
            "last_update_success": self.coordinator.last_update_success,
        }

    async def async_added_to_hass(self) -> None:
        """Subscribe to the coordinator, then arm an independent re-check.

        `CoordinatorEntity.should_poll` is False and its only state write
        is `_handle_coordinator_update`, so without this the entity is
        re-evaluated ONLY when the coordinator pushes. That is fine for
        the two failure modes that still produce a push — a failing fetch
        (`batch_set_error`) and a frozen-but-successful upstream
        (`batch_apply` every tick) — and useless for the third: a batch
        group timer that has silently stopped produces no push at all, so
        nothing re-reads `is_on` and the entity holds `off` forever.

        An outage detector that only updates while the thing it monitors
        is working cannot report the outage it exists for, so it gets its
        own clock. Note this is invisible to any test that reads the
        `is_on` property directly — the property is pure and always
        computes correctly; what was missing was HA ever asking again.
        See `test_stale_flips_on_when_the_coordinator_stops_pushing`,
        which goes through `hass.states` for exactly that reason.

        Cadence is the entry's own scan interval, so the worst-case
        detection lag is one interval past the threshold. Writes happen
        only on a transition — `seconds_since_server_time` changes on
        every evaluation, and writing unconditionally would push a state
        change (and a recorder row) every interval, forever, on an entity
        whose whole point is to be boring.
        """
        await super().async_added_to_hass()
        self._last_is_on = self.is_on
        self.async_on_remove(
            async_track_time_interval(
                self.hass,
                self._async_recheck_staleness,
                self.coordinator.scan_interval,
            )
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Track what the push is about to publish, then publish it."""
        self._last_is_on = self.is_on
        super()._handle_coordinator_update()

    @callback
    def _async_recheck_staleness(self, _now: Any) -> None:
        """Re-evaluate on our own clock; write only if the answer changed."""
        current = self.is_on
        if current is self._last_is_on:
            return
        self._last_is_on = current
        self.async_write_ha_state()

    @property
    def available(self) -> bool:
        """Mirror the stop sensor's relaxed availability, on purpose.

        Stock `CoordinatorEntity.available` follows `last_update_success`,
        which would take this entity unavailable at precisely the moment
        `is_on` would have become True — an outage detector that switches
        itself off during an outage. It stays available as long as there
        is any prior data to judge, and unavailable only before the first
        successful fetch, when there is genuinely nothing to say.
        """
        return self.coordinator.data is not None
