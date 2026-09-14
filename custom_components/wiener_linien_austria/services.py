"""Service actions for Wiener Linien Austria."""

from __future__ import annotations

from datetime import datetime
from typing import Any

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

from .adhoc import AdhocRateLimited, async_get_planner
from .const import DOMAIN
from .route_coordinator import MAX_TRIPS_PUBLISHED, WienerLinienRouteCoordinator
from .routing import RoutingError

SERVICE_PLAN_TRIP = "plan_trip"
ATTR_CONFIG_ENTRY_ID = "config_entry_id"
ATTR_DATETIME = "datetime"
ATTR_ARRIVE_BY = "arrive_by"

PLAN_TRIP_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_CONFIG_ENTRY_ID): cv.string,
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


async def _async_plan_trip(call: ServiceCall) -> ServiceResponse:
    """Plan a route entry's connections, now or at a given time.

    Returns the same trip shape the route sensor publishes, so a script
    or a voice assistant sees exactly what the card shows. Skips the routing
    cooldown, since someone is waiting for the answer, and goes through the
    on-demand planner instead: its cache, per-user and instance budget bound
    a script that calls this in a loop. A script gets an error rather than a
    stale plan when the budget is spent, since it can't see how old a plan is.
    """
    coordinator = _route_coordinator(call.hass, call.data[ATTR_CONFIG_ENTRY_ID])
    raw_when: datetime | None = call.data.get(ATTR_DATETIME)
    try:
        plan = await async_get_planner(call.hass).async_plan(
            coordinator.options,
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
    response: dict[str, Any] = {
        "origin": coordinator.origin_name,
        "destination": coordinator.destination_name,
        "trips": [trip.to_dict() for trip in plan.trips[:MAX_TRIPS_PUBLISHED]],
    }
    return response
