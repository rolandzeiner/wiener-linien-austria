"""Sensor platform for Wiener Linien Austria."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .alerts import get_alerts_for
from .const import (
    ATTRIBUTION,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
    MAX_DEPARTURES_IN_ATTRS,
)
from .coordinator import Departure, MonitorData, WienerLinienAustriaCoordinator

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the single stop sensor for this entry."""
    coordinator: WienerLinienAustriaCoordinator = entry.runtime_data
    async_add_entities([WienerLinienStopSensor(coordinator, entry)])


class WienerLinienStopSensor(
    CoordinatorEntity[WienerLinienAustriaCoordinator], SensorEntity
):
    """One sensor per stop. State = countdown of the next overall departure.

    Attributes carry the full departure board, grouped views (per line), and
    the CC-BY attribution string.
    """

    _attr_has_entity_name = True
    _attr_translation_key = "stop"
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES

    def __init__(
        self,
        coordinator: WienerLinienAustriaCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialise the sensor — unique_id format is frozen."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_stop"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Wiener Linien",
            model="Abfahrtsmonitor",
            configuration_url="https://www.wienerlinien.at/",
        )

    @property
    def native_value(self) -> int | None:
        """Return the countdown of the next overall departure, or None."""
        data = self.coordinator.data
        if data is None or not data.departures:
            return None
        return data.departures[0].countdown

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the departure board + grouped views + matched alerts."""
        config = {**self._entry.data, **self._entry.options}
        diva = int(config[CONF_DIVA])
        stop_name = str(config.get(CONF_STOP_NAME, self._entry.title))

        data: MonitorData | None = self.coordinator.data
        departures = data.departures if data is not None else []

        # next_by_line is a tiny per-line → int map for cheap template access.
        # We deliberately don't publish a full `departures_by_line` grouping
        # because it would duplicate every departure dict under `departures`,
        # doubling attribute size and tripping the recorder's 16 KB limit at
        # busy stops. Consumers that need a grouped view can reduce over
        # `departures` themselves.
        next_by_line: dict[str, int] = {}
        for dep in departures:
            next_by_line.setdefault(dep.line, dep.countdown)

        # Match domain-wide alert caches against this entry's lines + RBLs.
        # Lines derived from CONF_LINES ("U1|H|Leopoldau") — the user's own
        # selection, stable even when no departures are flowing right now.
        # Fall back to live departures for the "all lines" case.
        selected_line_keys = config.get(CONF_LINES) or []
        line_names: set[str] = {
            k.split("|", 1)[0]
            for k in selected_line_keys
            if isinstance(k, str) and k
        }
        if not line_names:
            line_names = {d.line for d in departures if d.line}
        rbls = {int(r) for r in config.get(CONF_RBLS) or []}

        # Use the coordinator's hass reference — `self.hass` is only set after
        # async_added_to_hass, but tests instantiate the sensor directly.
        traffic, elevator = get_alerts_for(
            self.coordinator.hass, line_names, rbls
        )

        # Cap the list at MAX_DEPARTURES_IN_ATTRS so busy multi-line stops
        # (e.g. Stephansplatz tracking U1/U3/U4 ≈ ~40 entries) stay under HA's
        # 16 KB recorder attribute cap. The card respects its own
        # max_departures setting (≤ 20) so nothing the UI shows is lost.
        capped = [d.to_dict() for d in departures[:MAX_DEPARTURES_IN_ATTRS]]

        return {
            "attribution": ATTRIBUTION,
            "diva": diva,
            "stop_name": stop_name,
            "latitude": self.coordinator.latitude,
            "longitude": self.coordinator.longitude,
            "server_time": data.server_time if data is not None else None,
            "departures": capped,
            "next_by_line": next_by_line,
            "traffic_info": [t.to_dict() for t in traffic],
            "elevator_info": [e.to_dict() for e in elevator],
        }

    @property
    def available(self) -> bool:
        """Match the coordinator's availability.

        Even when the stop has no departures right now (e.g. overnight) we
        stay available — native_value just reports None.
        """
        return self.coordinator.last_update_success


# Explicit re-export so mypy sees the full type contract.
_Departure = Departure
