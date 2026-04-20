"""Sensor platform for Wiener Linien Austria."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import WienerLinienAustriaCoordinator

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor entities from a config entry."""
    coordinator: WienerLinienAustriaCoordinator = entry.runtime_data
    async_add_entities([ExampleWienerLinienAustriaSensor(coordinator, entry)])


class ExampleWienerLinienAustriaSensor(
    CoordinatorEntity[WienerLinienAustriaCoordinator], SensorEntity
):
    """Example sensor — replace or extend per integration.

    The three `_attr_*` identity fields (`_attr_unique_id`, `_attr_translation_key`,
    `_attr_device_info`) are the Platinum-critical ones. Changing them post-release
    invalidates existing entity registrations.
    """

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: WienerLinienAustriaCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialise the sensor."""
        super().__init__(coordinator)
        self._entry = entry
        # KEEP THIS FORMAT STABLE — changes here wipe existing registry rows.
        self._attr_unique_id = f"{entry.entry_id}_example"
        # The translation_key must match a key under entity.sensor.* in
        # strings.json, translations/*.json, and icons.json.
        self._attr_translation_key = "example"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Wiener Linien",
            model="Abfahrtsmonitor",
            configuration_url="https://www.wienerlinien.at/",
        )

    @property
    def native_value(self) -> Any:
        """Return the current value from the coordinator."""
        data = self.coordinator.data or {}
        return data.get("value")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return any useful attributes for templates and the Lovelace card."""
        data = self.coordinator.data or {}
        return {
            "raw": data,
        }
