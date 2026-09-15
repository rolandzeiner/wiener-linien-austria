"""WebSocket commands behind the route card's ad-hoc From / To mode.

Two commands, both open to any signed-in user rather than admins only: the
dashboard that shows the card is often a wall tablet signed in as a regular
user.

- `wiener_linien_austria/stops` — every trackable stop as a picker option,
  nearest to the HA home first. The same list the setup dialog offers.
- `wiener_linien_austria/plan` — connections between two stops, now or at
  a chosen `datetime` (departing then, or arriving by then with
  `arrive_by`). A `datetime` without an offset is Vienna wall-clock time,
  the time the timetable and the station signs speak. Answers in the shape
  of the route sensor's attributes so the card renders both through one
  path. It also takes a route entry's trip options (`route_type`,
  `max_changes`, `walk_speed`, `excluded_means`, `min_transfer_minutes`,
  `step_free`) with the same defaults. The card sends only `step_free`; each
  distinct combination is its own cache entry.

Registered once per HA process in `async_setup`. `websocket_api` has no
deregister hook, so the handlers outlive a removed integration; each one
therefore answers `not_loaded` unless an entry of this domain is loaded. By
then the card's resource is gone too, so nothing should be calling.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Final

import aiohttp
import voluptuous as vol
from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from . import static
from .adhoc import AdhocRateLimited, async_get_planner
from .const import (
    ATTRIBUTION,
    DEFAULT_MIN_TRANSFER_MINUTES,
    DEFAULT_ROUTE_TYPE,
    DEFAULT_WALK_SPEED,
    DOMAIN,
    EXCLUDABLE_MEANS,
    MAX_CHANGES_ANY,
    MAX_CHANGES_CHOICES,
    MAX_MIN_TRANSFER_MINUTES,
    ROUTE_TYPES,
    WALK_SPEEDS,
)
from .route_coordinator import MAX_TRIPS_PUBLISHED, route_trip_attributes
from .routing import (
    ROUTE_QUERY_ERRORS,
    RouteOptions,
    RoutingError,
    async_routing_zone,
)
from .static import StaticCatalogue
from .stops import stop_options, trackable_station

# Error codes the card maps onto its own copy. Stable: the card matches them.
ERR_NOT_LOADED: Final = "not_loaded"
ERR_CATALOGUE: Final = "catalogue_unavailable"
ERR_INVALID_STOP: Final = "invalid_stop"
# The trip planner refused this query (stops too close, unknown to it, no
# timetable). Asking again soon gets the same answer.
ERR_INVALID_QUERY: Final = "invalid_query"
ERR_SAME_STOP: Final = "same_stop"
ERR_RATE_LIMITED: Final = "rate_limited"
ERR_UPSTREAM: Final = "upstream"

STOPS_CACHE_KEY: Final = "adhoc_stops"


@callback
def async_setup_websocket(hass: HomeAssistant) -> None:
    """Register the ad-hoc commands (once per HA process)."""
    async_register_command(hass, _websocket_stops)
    async_register_command(hass, _websocket_plan)


def _is_loaded(hass: HomeAssistant) -> bool:
    return bool(hass.config_entries.async_loaded_entries(DOMAIN))


def _send_not_loaded(connection: ActiveConnection, msg_id: int) -> None:
    connection.send_error(
        msg_id,
        ERR_NOT_LOADED,
        "Wiener Linien Austria isn't loaded.",
        translation_domain=DOMAIN,
        translation_key="adhoc_not_loaded",
    )


async def _async_catalogue(
    hass: HomeAssistant, connection: ActiveConnection, msg_id: int
) -> StaticCatalogue | None:
    """The shared catalogue, or None after answering the error."""
    try:
        return await static.async_get_catalogue(hass)
    except (TimeoutError, aiohttp.ClientError):
        connection.send_error(
            msg_id,
            ERR_CATALOGUE,
            "The stop catalogue isn't available.",
            translation_domain=DOMAIN,
            translation_key="adhoc_catalogue_unavailable",
        )
        return None


@websocket_command({vol.Required("type"): "wiener_linien_austria/stops"})
@async_response
async def _websocket_stops(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Every trackable stop as `{value, label}`, nearest to home first."""
    if not _is_loaded(hass):
        _send_not_loaded(connection, msg["id"])
        return
    catalogue = await _async_catalogue(hass, connection, msg["id"])
    if catalogue is None:
        return
    config = hass.config
    signature = (catalogue, config.latitude, config.longitude, config.language)
    domain_data = hass.data.setdefault(DOMAIN, {})
    cached = domain_data.get(STOPS_CACHE_KEY)
    # Identity, not equality: a background refresh replaces the catalogue
    # object, and comparing two 1,800-station catalogues field by field on
    # every card load would cost more than rebuilding the list.
    if cached is None or any(
        a is not b for a, b in zip(cached[0], signature, strict=True)
    ):
        options = stop_options(
            catalogue, config.latitude, config.longitude, config.language
        )
        cached = (signature, [dict(option) for option in options])
        domain_data[STOPS_CACHE_KEY] = cached
    connection.send_result(msg["id"], {"stops": cached[1]})


@websocket_command(
    {
        vol.Required("type"): "wiener_linien_austria/plan",
        vol.Required("origin"): vol.Coerce(int),
        vol.Required("destination"): vol.Coerce(int),
        # Lower-cased first, so the EFA spelling (`LEASTTIME`) is accepted too.
        vol.Optional("route_type", default=DEFAULT_ROUTE_TYPE): vol.All(
            vol.Lower, vol.In(ROUTE_TYPES)
        ),
        vol.Optional("max_changes", default=MAX_CHANGES_ANY): vol.In(
            MAX_CHANGES_CHOICES
        ),
        vol.Optional("walk_speed", default=DEFAULT_WALK_SPEED): vol.In(WALK_SPEEDS),
        vol.Optional("excluded_means", default=list): [vol.In(list(EXCLUDABLE_MEANS))],
        vol.Optional(
            "min_transfer_minutes", default=DEFAULT_MIN_TRANSFER_MINUTES
        ): vol.All(vol.Coerce(int), vol.Range(min=0, max=MAX_MIN_TRANSFER_MINUTES)),
        vol.Optional("datetime"): vol.Any(None, cv.datetime),
        vol.Optional("arrive_by", default=False): cv.boolean,
        vol.Optional("step_free", default=False): cv.boolean,
    }
)
@async_response
async def _websocket_plan(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Plan connections between two stops, now or at a chosen time."""
    msg_id: int = msg["id"]
    if not _is_loaded(hass):
        _send_not_loaded(connection, msg_id)
        return
    catalogue = await _async_catalogue(hass, connection, msg_id)
    if catalogue is None:
        return

    stations = []
    for diva in (msg["origin"], msg["destination"]):
        # Same rule as the setup picker: only stops it offers are accepted.
        station = trackable_station(catalogue, diva)
        if station is None:
            connection.send_error(
                msg_id,
                ERR_INVALID_STOP,
                f"Unknown stop {diva}.",
                translation_domain=DOMAIN,
                translation_key="adhoc_invalid_stop",
                translation_placeholders={"diva": str(diva)},
            )
            return
        stations.append(station)
    origin, destination = stations
    if origin.diva == destination.diva:
        connection.send_error(
            msg_id,
            ERR_SAME_STOP,
            "Origin and destination are the same stop.",
            translation_domain=DOMAIN,
            translation_key="adhoc_same_stop",
        )
        return

    options = RouteOptions.from_config(origin.diva, destination.diva, msg)
    when = await _async_vienna_time(msg.get("datetime"))
    arrive_by = bool(msg["arrive_by"])
    try:
        # A stale plan beats an error on a dashboard: the card shows when it
        # was fetched and refreshes once the budget allows.
        plan = await async_get_planner(hass).async_plan(
            options,
            user_id=connection.user.id,
            when=when,
            arrive_by=arrive_by,
            allow_stale=True,
        )
    except AdhocRateLimited as err:
        connection.send_error(
            msg_id,
            ERR_RATE_LIMITED,
            f"Too many requests. Try again in {err.retry_after} s.",
            translation_domain=DOMAIN,
            translation_key="adhoc_rate_limited",
            translation_placeholders={"retry_after": str(err.retry_after)},
        )
        return
    except RoutingError as err:
        connection.send_error(
            msg_id,
            ERR_INVALID_QUERY
            if err.translation_key in ROUTE_QUERY_ERRORS
            else ERR_UPSTREAM,
            str(err),
            translation_domain=DOMAIN,
            translation_key=err.translation_key,
            translation_placeholders=err.placeholders,
        )
        return

    connection.send_result(
        msg_id,
        {
            "origin": origin.name,
            "destination": destination.name,
            "fetched_at": plan.fetched_at.isoformat(),
            "min_transfer_minutes": options.min_transfer_minutes,
            "step_free": options.step_free,
            "planned_for": when.isoformat() if when is not None else None,
            "arrive_by": arrive_by,
            **route_trip_attributes(hass, plan.trips[:MAX_TRIPS_PUBLISHED]),
            "attribution": ATTRIBUTION,
            "stale": plan.stale,
            "retry_after": plan.retry_after,
        },
    )


async def _async_vienna_time(value: datetime | None) -> datetime | None:
    """A requested time as an aware datetime; naive means Vienna wall clock.

    The card's time field has no zone, and the dashboard's browser or HA
    itself may sit elsewhere. The trip planner, the timetable and the signs
    at the stop all speak Vienna time, so that is what the person typed.
    """
    if value is None or value.tzinfo is not None:
        return value
    zone = await async_routing_zone()
    return value.replace(tzinfo=zone)
