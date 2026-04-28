"""Diagnostics support for Wiener Linien Austria."""
from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .alerts import get_alerts_for
from .const import ATTRIBUTION, CONF_LINES, CONF_RBLS
from .coordinator import WienerLinienConfigEntry

# No credentials to redact today (Wiener Linien OGD has no API key), and
# RBL/DIVA values are public station identifiers, not PII. Coordinates
# are not currently surfaced in the diagnostics output, but redact them
# defensively: the user's *chosen* stop coords reveal location, so a
# future field addition that exposes lat/lon would otherwise leak it
# silently. `api_key` / `password` / `token` are defensive
# future-proofing — diagnostics dumps end up in public GitHub issues,
# so over-redacting is essentially free and protects against a future
# contributor adding a generically-named credential field without
# remembering to update this set. Treat the set as monotonically
# growing — never shrink.
TO_REDACT: set[str] = {
    "lat",
    "lon",
    "latitude",
    "longitude",
    "api_key",
    "password",
    "token",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: WienerLinienConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator = entry.runtime_data
    data = coordinator.data

    config = {**entry.data, **entry.options}
    selected_line_keys = config.get(CONF_LINES) or []
    line_names: set[str] = {
        k.split("|", 1)[0]
        for k in selected_line_keys
        if isinstance(k, str) and k
    }
    rbls = {int(r) for r in config.get(CONF_RBLS) or []}
    traffic, elevator = get_alerts_for(hass, line_names, rbls)

    # Surface trip-pattern index health so user-reported "stops_ahead is
    # missing" issues can be triaged from a redacted dump alone — the
    # signal is "did the static layer actually load the index for this
    # session" not "is the data correct for stop X".
    catalogue = getattr(coordinator, "_catalogue", None)
    trip_patterns = getattr(catalogue, "trip_patterns", None) if catalogue else None
    trip_pattern_summary: dict[str, Any] = {
        "loaded": trip_patterns is not None,
    }
    if trip_patterns is not None:
        trip_pattern_summary["line_count"] = trip_patterns.line_count
        trip_pattern_summary["pattern_count"] = trip_patterns.pattern_count

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
        "trip_patterns": trip_pattern_summary,
        "alerts": {
            "traffic_info": [t.to_dict() for t in traffic],
            "elevator_info": [e.to_dict() for e in elevator],
        },
    }
