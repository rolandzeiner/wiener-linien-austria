"""Sensor platform for Wiener Linien Austria."""
from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTRIBUTION, CONF_DIVA, CONF_STOP_NAME, DOMAIN
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
        """Return the departure board + grouped views."""
        config = {**self._entry.data, **self._entry.options}
        diva = int(config[CONF_DIVA])
        stop_name = str(config.get(CONF_STOP_NAME, self._entry.title))

        data: MonitorData | None = self.coordinator.data
        departures = data.departures if data is not None else []

        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        next_by_line: dict[str, int] = {}
        for dep in departures:
            grouped[dep.line].append(dep.to_dict())
            next_by_line.setdefault(dep.line, dep.countdown)

        return {
            "attribution": ATTRIBUTION,
            "diva": diva,
            "stop_name": stop_name,
            "server_time": data.server_time if data is not None else None,
            "departures": [d.to_dict() for d in departures],
            "departures_by_line": dict(grouped),
            "next_by_line": next_by_line,
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
