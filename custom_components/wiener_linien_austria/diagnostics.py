"""Diagnostics support for Wiener Linien Austria."""
from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import ATTRIBUTION
from .coordinator import WienerLinienAustriaCoordinator

# No credentials to redact (Wiener Linien OGD has no API key), and RBL/DIVA
# values are public station identifiers, not PII. Keep the set defensive in
# case a future field needs redaction.
TO_REDACT: set[str] = set()


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator: WienerLinienAustriaCoordinator = entry.runtime_data
    data = coordinator.data
    return {
        "attribution": ATTRIBUTION,
        "entry": {
            "title": entry.title,
            "version": entry.version,
            "data": async_redact_data(dict(entry.data), TO_REDACT),
            "options": async_redact_data(dict(entry.options), TO_REDACT),
        },
        "coordinator": {
            "last_update_success": coordinator.last_update_success,
            "last_error_code": coordinator.last_error_code,
            "update_interval": str(coordinator.update_interval),
            "server_time": coordinator.server_time,
            "rbls": list(coordinator.rbls),
            "departure_count": len(data.departures) if data is not None else 0,
        },
    }
