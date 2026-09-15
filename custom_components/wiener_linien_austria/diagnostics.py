"""Diagnostics support for Wiener Linien Austria."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .alerts import get_alerts_for, line_names_from_keys
from .const import ATTRIBUTION, CONF_LINES, CONF_RBLS
from .coordinator import WienerLinienConfigEntry
from .route_coordinator import WienerLinienRouteCoordinator
from .s_bahn_network import current_network
from .static import current_catalogue

# Treat as monotonically growing — never shrink. Diagnostics dumps end
# up in public GitHub issues, so over-redacting is essentially free and
# defends future generically-named credential / coord fields against a
# silent leak. Today: no credentials, but coords leak the user's chosen
# stop location; the credential keys are defensive future-proofing.
#
# `entry.title` is deliberately NOT redacted, even though the stop name it
# carries is coarse location data of the same kind as the coordinates
# below. The two are not inconsistent: coordinates pin a household to a
# few metres, whereas the title is a user-chosen label that is what makes
# a shared dump readable at all — "which entry is this?" is the first
# question every triage starts with. Redacting it buys little and costs
# the dump most of its usefulness. Ratified 2026-08-07.
TO_REDACT: set[str] = {
    "lat",
    "lon",
    "latitude",
    "longitude",
    "api_key",
    "password",
    "token",
    "secret",
    "bearer",
    "client_id",
    "client_secret",
    "access_token",
    "refresh_token",
    "Authorization",
    "Cookie",
    "Set-Cookie",
    "Referer",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: WienerLinienConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    if isinstance(entry.runtime_data, WienerLinienRouteCoordinator):
        return _route_diagnostics(entry, entry.runtime_data)
    coordinator = entry.runtime_data
    data = coordinator.data

    config = {**entry.data, **entry.options}
    line_names = line_names_from_keys(config.get(CONF_LINES))
    rbls = {int(r) for r in config.get(CONF_RBLS) or []}
    traffic, elevator = get_alerts_for(hass, line_names, rbls)

    # Surface trip-pattern index health so user-reported "stops_ahead is
    # missing" issues can be triaged from a redacted dump alone — the
    # signal is "did the static layer actually load the index for this
    # session" not "is the data correct for stop X". Read from the live
    # shared catalogue ref, the same one every parse uses.
    catalogue = current_catalogue(hass)
    trip_patterns = catalogue.trip_patterns if catalogue is not None else None
    trip_pattern_summary: dict[str, Any] = {
        "loaded": trip_patterns is not None,
    }
    if trip_patterns is not None:
        trip_pattern_summary["line_count"] = trip_patterns.line_count
        trip_pattern_summary["pattern_count"] = trip_patterns.pattern_count
        # Surface migration health — empty dicts on either of these are
        # the symptom of an older cache that hasn't completed its
        # background refresh. Lets a user-supplied diagnostics dump
        # answer "why don't I see transfer chips / line colours"
        # without having to crack open the logs.
        trip_pattern_summary["lines_at_diva_count"] = len(trip_patterns.lines_at_diva)
        trip_pattern_summary["colors_by_line_count"] = len(trip_patterns.colors_by_line)

    # Same triage question for the S-Bahn transfer chips: did the network
    # load, and how old is each hub's sample.
    network = current_network(hass)
    s_bahn_summary: dict[str, Any] = {"loaded": network is not None}
    if network is not None:
        s_bahn_summary["stop_count"] = len(network.lines_at_diva)
        s_bahn_summary["hub_fetched_at"] = {
            str(hub): sample.fetched_at.isoformat()
            for hub, sample in network.hubs.items()
        }

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
            # `repr()` preserves both the exception class name and its args
            # (e.g. `aiohttp.ClientResponseError(0, ())`) without leaking
            # response-body fragments — most useful triage signal when
            # last_update_success is False.
            "last_exception": repr(coordinator.last_exception),
            "last_error_code": coordinator.last_error_code,
            # The coordinator doesn't self-poll (a shared batch group drives
            # fetches), so `update_interval` is None. Report the configured
            # scan interval instead — the cadence the batch group is keyed on.
            "scan_interval": str(coordinator.scan_interval),
            "server_time": coordinator.server_time,
            "rbls": list(coordinator.rbls),
            "departure_count": len(data.departures) if data is not None else 0,
            # Non-zero means the last poll carried records whose planned
            # times had stopped advancing — an upstream freeze, not a
            # config problem. First triage question for "my stop is empty".
            "stale_dropped": data.stale_dropped if data is not None else 0,
            "stale_since": data.stale_since if data is not None else None,
        },
        "trip_patterns": trip_pattern_summary,
        "s_bahn_network": s_bahn_summary,
        "alerts": {
            "traffic_info": [t.to_dict() for t in traffic],
            "elevator_info": [e.to_dict() for e in elevator],
        },
    }


def _route_diagnostics(
    entry: WienerLinienConfigEntry, coordinator: WienerLinienRouteCoordinator
) -> dict[str, Any]:
    """Diagnostics for a route entry.

    Counts and shape only, never the connections themselves: a dump of
    "leaves Floridsdorf at 07:44 every weekday" in a public issue is the
    routine this integration should not publish on the user's behalf. The
    origin and destination are in the entry data already, on the same
    ratified terms as a stop entry's title.
    """
    data = coordinator.data
    trips = data.trips if data is not None else []
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
            "last_exception": repr(coordinator.last_exception),
            "scan_interval": str(coordinator.scan_interval),
            "update_interval": str(coordinator.update_interval),
            "active": data.active if data is not None else None,
            "active_window": coordinator.active_window,
            "trip_count": len(trips),
            "risks": [trip.risk for trip in trips],
            "realtime_legs": sum(
                1 for trip in trips for leg in trip.legs if leg.realtime
            ),
        },
    }
