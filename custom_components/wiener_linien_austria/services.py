"""Service actions for Wiener Linien Austria."""

from __future__ import annotations

from datetime import datetime
from typing import Any

import aiohttp
import voluptuous as vol
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    callback,
)
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util

from . import static
from .adhoc import AdhocRateLimited, async_get_planner
from .const import DOMAIN
from .route_coordinator import (
    MAX_TRIPS_PUBLISHED,
    WienerLinienRouteCoordinator,
    add_stop_coordinates,
)
from .routing import RouteOptions, RoutingError
from .static import StaticCatalogue, Station
from .stops import match_stops, stop_candidate_labels

SERVICE_PLAN_TRIP = "plan_trip"
ATTR_CONFIG_ENTRY_ID = "config_entry_id"
ATTR_ORIGIN = "origin"
ATTR_DESTINATION = "destination"
ATTR_DATETIME = "datetime"
ATTR_ARRIVE_BY = "arrive_by"

PLAN_TRIP_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
        vol.Optional(ATTR_ORIGIN): cv.string,
        vol.Optional(ATTR_DESTINATION): cv.string,
        vol.Optional(ATTR_DATETIME): cv.datetime,
        vol.Optional(ATTR_ARRIVE_BY, default=False): cv.boolean,
    }
)


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register the integration's actions (once per HA process)."""
    hass.services.async_register(
        DOMAIN,
        SERVICE_PLAN_TRIP,
        _async_plan_trip,
        schema=PLAN_TRIP_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )


@callback
def _route_coordinator(
    hass: HomeAssistant, entry_id: str
) -> WienerLinienRouteCoordinator:
    """Resolve the action's target to a loaded route entry."""
    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None or entry.domain != DOMAIN:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="route_entry_not_found",
            translation_placeholders={"entry_id": entry_id},
        )
    if entry.state is not ConfigEntryState.LOADED:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="route_entry_not_loaded",
            translation_placeholders={"title": entry.title},
        )
    coordinator = entry.runtime_data
    if not isinstance(coordinator, WienerLinienRouteCoordinator):
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="route_entry_not_route",
            translation_placeholders={"title": entry.title},
        )
    return coordinator


def _resolve_stop(catalogue: StaticCatalogue, query: str) -> Station:
    """One stop for a name or DIVA, or an error saying what to change."""
    matches = match_stops(catalogue, query)
    if not matches:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="plan_trip_stop_not_found",
            translation_placeholders={"stop": query},
        )
    if len(matches) > 1:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="plan_trip_stop_ambiguous",
            translation_placeholders={
                "stop": query,
                "candidates": stop_candidate_labels(catalogue, matches),
            },
        )
    return matches[0]


async def _async_stop_pair_options(
    hass: HomeAssistant, origin_query: str, destination_query: str
) -> tuple[RouteOptions, str, str]:
    """Options and stop names for two stops given by name or DIVA.

    The same checks as the card's From / To mode (websocket.py), with the
    trip options at a route entry's defaults.
    """
    if not hass.config_entries.async_loaded_entries(DOMAIN):
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="adhoc_not_loaded"
        )
    try:
        catalogue = await static.async_get_catalogue(hass)
    except (TimeoutError, aiohttp.ClientError) as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="adhoc_catalogue_unavailable",
        ) from err
    origin = _resolve_stop(catalogue, origin_query)
    destination = _resolve_stop(catalogue, destination_query)
    if origin.diva == destination.diva:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="adhoc_same_stop"
        )
    options = RouteOptions.from_config(origin.diva, destination.diva, {})
    return options, origin.name, destination.name


async def _async_plan_trip(call: ServiceCall) -> ServiceResponse:
    """Plan connections for a route entry or two stops, now or at a given time.

    Returns the same trip shape the route sensor publishes, so a script
    or a voice assistant sees exactly what the card shows. Skips the routing
    cooldown, since someone is waiting for the answer, and goes through the
    on-demand planner instead: its cache, per-user and instance budget bound
    a script that calls this in a loop. A script gets an error rather than a
    stale plan when the budget is spent, since it can't see how old a plan is.

    Takes either `config_entry_id` or both `origin` and `destination`, as a
    stop name or DIVA. Names come from voice assistants and scripts, so they
    are matched loosely (stops.match_stops); the response names the stops
    that were picked, so a reply can say which ones.
    """
    entry_id: str | None = call.data.get(ATTR_CONFIG_ENTRY_ID)
    origin_query: str | None = call.data.get(ATTR_ORIGIN)
    destination_query: str | None = call.data.get(ATTR_DESTINATION)
    if entry_id and not (origin_query or destination_query):
        coordinator = _route_coordinator(call.hass, entry_id)
        options = coordinator.options
        origin_name = coordinator.origin_name
        destination_name = coordinator.destination_name
    elif origin_query and destination_query and not entry_id:
        options, origin_name, destination_name = await _async_stop_pair_options(
            call.hass, origin_query, destination_query
        )
    else:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="plan_trip_route_or_stops"
        )
    raw_when: datetime | None = call.data.get(ATTR_DATETIME)
    try:
        plan = await async_get_planner(call.hass).async_plan(
            options,
            user_id=call.context.user_id,
            when=dt_util.as_local(raw_when) if raw_when is not None else None,
            arrive_by=bool(call.data[ATTR_ARRIVE_BY]),
        )
    except AdhocRateLimited as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="adhoc_rate_limited",
            translation_placeholders={"retry_after": str(err.retry_after)},
        ) from err
    except RoutingError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key=err.translation_key,
            translation_placeholders=err.placeholders,
        ) from err
    trips = [trip.to_dict() for trip in plan.trips[:MAX_TRIPS_PUBLISHED]]
    add_stop_coordinates(call.hass, trips)
    response: dict[str, Any] = {
        "origin": origin_name,
        "destination": destination_name,
        "trips": trips,
    }
    return response
