"""WebSocket commands the cards call: ad-hoc routes and run times.

Three commands, all open to any signed-in user rather than admins only: the
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
- `wiener_linien_austria/run_times` — the scheduled minutes from a stop to
  every stop ahead, per line and direction, keyed by the stop names the
  stops-ahead trail prints. The modern card adds them to a departure's time
  for an estimated arrival at each stop. `no_stop` names, the same way, the
  stations a trail passes without the train calling there, each with the
  date the stop is back where a notice says so clearly (skipped_stops.py).
  `calling` says, for those stations, which runs call there after all:
  the station's planned departures of that line and direction, the stretch
  of time they cover, and the minutes from here to the calls either side,
  so the card can tell one departure from the next. Only for a stop with a
  departure board set up; run_times.py and skipped_stops.py say when it
  costs a request.

Registered once per HA process in `async_setup`. `websocket_api` has no
deregister hook, so the handlers outlive a removed integration; each one
therefore answers `not_loaded` unless an entry of this domain is loaded. By
then the card's resource is gone too, so nothing should be calling.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Final

import voluptuous as vol
from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util

from . import static
from .adhoc import AdhocRateLimited, async_get_planner
from .api import WienerLinienApiError
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
    STOP_CALLS_RETRY_AFTER,
    WALK_SPEEDS,
)
from .coordinator import WienerLinienAustriaCoordinator
from .route_coordinator import MAX_TRIPS_PUBLISHED, route_trip_attributes
from .routing import (
    ROUTE_QUERY_ERRORS,
    RouteOptions,
    RoutingError,
    async_routing_zone,
)
from .run_times import Pair, RunTimeAnswer, async_get_run_times
from .skipped_stops import (
    SkippedStation,
    async_get_stop_calls,
    async_get_stop_notices,
    closed_until,
    noticed_stations,
    skipped_stations,
    stand_ins,
)
from .static import StaticCatalogue, trail_name
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
    async_register_command(hass, _websocket_run_times)


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
    except WienerLinienApiError:
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
    planner = async_get_planner(hass)
    try:
        # A stale plan beats an error on a dashboard: the card shows when it
        # was fetched and refreshes once the budget allows.
        plan = await planner.async_plan(
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

    # What is left after this answer, so the card can say so before the
    # budget runs out instead of after.
    budget = planner.budget(connection.user.id)
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
            "requests_left": budget.left,
            "requests_next_in": budget.next_in,
            "requests_max": budget.capacity,
            "requests_refill_s": budget.refill_seconds,
        },
    )


@websocket_command(
    {
        vol.Required("type"): "wiener_linien_austria/run_times",
        vol.Required("diva"): vol.Coerce(int),
        # The line the card is about to show. Only used to decide whether a
        # line no sample holds is worth one more request.
        vol.Optional("line"): cv.string,
        vol.Optional("direction"): vol.In(("H", "R")),
    }
)
@async_response
async def _websocket_run_times(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Scheduled minutes from a stop to the stops ahead, per line and direction."""
    msg_id: int = msg["id"]
    if not _is_loaded(hass):
        _send_not_loaded(connection, msg_id)
        return
    diva: int = msg["diva"]
    boards = _stop_boards(hass, diva)
    if not boards:
        # Only stops with a departure board: that is what keeps the stops
        # this can be asked for to the handful someone set up.
        connection.send_error(
            msg_id,
            ERR_INVALID_STOP,
            f"No departure board for stop {diva}.",
            translation_domain=DOMAIN,
            translation_key="adhoc_invalid_stop",
            translation_placeholders={"diva": str(diva)},
        )
        return
    catalogue = await _async_catalogue(hass, connection, msg_id)
    if catalogue is None:
        return

    line, direction = msg.get("line"), msg.get("direction")
    try:
        answer = await async_get_run_times(hass).async_get(
            diva, (line, direction) if line and direction else None
        )
    except RoutingError as err:
        connection.send_error(
            msg_id,
            ERR_UPSTREAM,
            str(err),
            translation_domain=DOMAIN,
            translation_key=err.translation_key,
            translation_placeholders=err.placeholders,
        )
        return

    # Keyed by the stop's trail name (`static.trail_name`), the one thing a
    # trail entry carries. Both sides read it from the same catalogue row,
    # so the join is exact; a DIVA the catalogue doesn't know has no trail
    # entry to join either.
    run_times: dict[str, dict[str, float]] = {}
    patterns = catalogue.trip_patterns
    for (label, way), minutes_by_diva in answer.pairs.items():
        named: dict[str, float] = {}
        line_id = patterns.lines_by_label.get(label) if patterns is not None else None
        for stop_diva, minutes in minutes_by_diva.items():
            stop = trail_name(catalogue, line_id, stop_diva)
            if stop is not None:
                named.setdefault(stop, minutes)
        # A stop the timetable knows by an id the catalogue lacks.
        for name, minutes in stand_ins(
            catalogue, diva, label, way, minutes_by_diva
        ).items():
            named.setdefault(name, minutes)
        if named:
            run_times[f"{label}|{way}"] = named
    now = dt_util.utcnow()
    for board in boards:
        run_times.update(_timetable_run_times(board, now))
    works = await _async_works(hass, catalogue, diva, answer)
    valid_until = answer.valid_until
    if works.refresh_by is not None:
        valid_until = min(valid_until, works.refresh_by)

    connection.send_result(
        msg_id,
        {
            "diva": diva,
            "fetched_at": answer.fetched_at.isoformat() if answer.fetched_at else None,
            "valid_until": valid_until.isoformat(),
            "run_times": run_times,
            "no_stop": works.no_stop,
            "calling": works.calling,
            "attribution": ATTRIBUTION,
        },
    )


@dataclass(slots=True)
class _Works:
    """The stations a stop's trails pass without a call, as the card gets them."""

    # "U6|H" → station → ISO date the stop is back, or None.
    no_stop: dict[str, dict[str, str | None]] = field(default_factory=dict)
    # "U6|H" → station → which runs call there after all.
    calling: dict[str, dict[str, dict[str, Any]]] = field(default_factory=dict)
    # When the card should ask again for fresher calls.
    refresh_by: datetime | None = None


async def _async_works(
    hass: HomeAssistant,
    catalogue: StaticCatalogue,
    diva: int,
    answer: RunTimeAnswer,
) -> _Works:
    """Per line and direction, the stations passed without a call, by name.

    A station counts when any held sample shows it skipped, the current
    part of the day's first, or when the sample has a call there that a
    notice in force contradicts: a sample is one moment held for a week, a
    platform shut by day may be served at night (U6 Neue Donau), and works
    start in the middle of a sample's week. Each such station maps to the
    date its stop is back, or None where no notice says so clearly, and,
    where its own departures could be fetched, to the runs that call there
    after all. The S-Bahn's trails come from the same timetable as their
    times, so they can't part from them and aren't asked about. Calls are
    only fetched for a station that counts.
    """
    if not answer.pairs:
        return _Works()
    notices = await async_get_stop_notices(hass).async_get() or []
    now = dt_util.utcnow()
    skipped: dict[Pair, dict[str, SkippedStation]] = {}
    for pair, merged in answer.pairs.items():
        stations: dict[str, SkippedStation] = {}
        for sample in answer.samples or (answer.pairs,):
            if (minutes := sample.get(pair)) is not None:
                for name, station in skipped_stations(
                    catalogue, diva, *pair, minutes
                ).items():
                    stations.setdefault(name, station)
        for name, station in noticed_stations(
            catalogue, diva, *pair, merged, notices, now
        ).items():
            stations.setdefault(name, station)
        if stations:
            skipped[pair] = stations
    works = _Works()
    if not skipped:
        return works
    calls_cache = async_get_stop_calls(hass)
    divas = sorted(
        {station.diva for stations in skipped.values() for station in stations.values()}
    )
    held = await asyncio.gather(*(calls_cache.async_get(station) for station in divas))
    calls_by_diva = dict(zip(divas, held, strict=True))
    refresh = []
    for (label, way), stations in skipped.items():
        key = f"{label}|{way}"
        for name, station in stations.items():
            until = closed_until(notices, label, station, now)
            works.no_stop.setdefault(key, {})[name] = (
                until.isoformat() if until else None
            )
            calls = calls_by_diva[station.diva]
            if calls is None:
                refresh.append(now + STOP_CALLS_RETRY_AFTER)
                continue
            # Past its time only while a refetch is failing: ask once that
            # may have changed.
            refresh.append(
                calls.expires_at
                if calls.expires_at > now
                else now + STOP_CALLS_RETRY_AFTER
            )
            line_calls = calls.line_calls
            works.calling.setdefault(key, {})[name] = {
                "between": list(station.between),
                "calls": [
                    when.isoformat() for when in line_calls.calls.get((label, way), ())
                ],
                "from": line_calls.first.isoformat(),
                "until": line_calls.last.isoformat(),
            }
    works.refresh_by = min(refresh)
    return works


def _stop_boards(
    hass: HomeAssistant, diva: int
) -> list[WienerLinienAustriaCoordinator]:
    """The loaded departure boards at a stop."""
    return [
        coordinator
        for entry in hass.config_entries.async_loaded_entries(DOMAIN)
        if isinstance(coordinator := entry.runtime_data, WienerLinienAustriaCoordinator)
        and coordinator.diva == diva
    ]


def _timetable_run_times(
    board: WienerLinienAustriaCoordinator, now: datetime
) -> dict[str, dict[str, float]]:
    """Run times of a board's S-Bahn lines, from the rows it already holds.

    The run-time request leaves the S-Bahn out; the board's timetable rows
    carry each train's stops with their times, so the next train of every
    picked line and direction stands for it. No request.
    """
    timetable = board.timetable
    if timetable is None:
        return {}
    run_times: dict[str, dict[str, float]] = {}
    for dep in timetable.departures:
        key = f"{dep.line}|{dep.direction}"
        if key in run_times or dep.planned < now:
            continue
        named: dict[str, float] = {
            stop.name: stop.minutes for stop in dep.stops if stop.minutes is not None
        }
        if named:
            run_times[key] = named
    return run_times


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
