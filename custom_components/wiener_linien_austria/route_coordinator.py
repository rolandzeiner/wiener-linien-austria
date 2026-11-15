"""DataUpdateCoordinator for A→B route entries."""

from __future__ import annotations

import logging
import random
from collections.abc import Sequence
from dataclasses import dataclass, field, replace
from datetime import date, datetime, time, timedelta, tzinfo
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from . import static
from .alerts import get_alerts_for, get_escalators_for, outage_station_matches
from .const import (
    CONF_ACTIVE_DAYS,
    CONF_ACTIVE_FROM,
    CONF_ACTIVE_TO,
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_LEAVE_MINUTES,
    CONF_ORIGIN_DIVA,
    CONF_ORIGIN_NAME,
    DEFAULT_LEAVE_MINUTES,
    DEFAULT_ROUTE_SCAN_INTERVAL,
    DOMAIN,
    MAX_ROUTE_POLL_SECONDS,
    MIN_ROUTE_POLL_SECONDS,
    MIN_ROUTE_ROLLOVER_SECONDS,
    ROUTE_DEPARTED_GRACE_SECONDS,
    ROUTE_KEEP_DEPARTED_SECONDS,
    ROUTE_ROLLOVER_SPREAD_SECONDS,
    USER_AGENT,
)
from .live import (
    LIVE_BOARD_KEY,
    LiveBoard,
    apply_live,
    async_get_live_board,
    async_live_trips,
    rbls_for_trips,
)
from .parsing import as_int, parse_aware_datetime
from .rate_limit import async_enforce_routing_cooldown, backoff_delay
from .routing import (
    RouteOptions,
    RoutingError,
    Trip,
    async_fetch_trip_body,
    async_routing_zone,
    build_trip_params,
    last_connection,
    parse_time_option,
    parse_trip_body,
    usable_trips,
    within_window,
)
from .static import current_catalogue, line_colors_for

_LOGGER = logging.getLogger(__name__)

# How many ranked connections a route publishes. The card shows the best one
# expanded plus a few alternatives; more than this is payload nothing renders.
MAX_TRIPS_PUBLISHED = 4

# The last connection without a bus, looked up once a night per route (one
# extra trip-planner request, agreed 2026-09-15). Only between these times,
# and only while the route refreshes anyway, so its window bounds it too.
LAST_CONNECTION_FROM = time(22, 0)
LAST_CONNECTION_UNTIL = time(3, 0)
# Asked as "arrive by 04:00": the U-Bahn has stopped by then on a weeknight,
# and the first morning trains don't arrive yet.
LAST_CONNECTION_ARRIVE_BY = time(4, 0)
LAST_CONNECTION_MAX_WAIT = timedelta(minutes=60)
# A trip arriving in the last hour before `LAST_CONNECTION_ARRIVE_BY` means
# the service runs through the night (the U-Bahn before Saturdays, Sundays and public holidays), so
# there is no last connection to show. On a weeknight nothing without a bus
# arrives between about 01:00 and 04:30.
LAST_CONNECTION_THROUGH_MARGIN = timedelta(minutes=60)
# City, regional and express buses (EFA motType 5, 6, 7). Night buses are
# city buses to the trip planner, so leaving them out means all buses.
LAST_CONNECTION_EXCLUDED_MEANS = ("5", "6", "7")

# Home Assistant runs a coordinator on a whole second of its loop clock, up
# to a second before the interval is over. A refresh this close to the time
# it was pulled up to is that refresh; any earlier one was asked for.
ROLLOVER_EARLY_SECONDS = 1.5

type WienerLinienRouteConfigEntry = ConfigEntry[WienerLinienRouteCoordinator]


def _ahead(trips: Sequence[Trip], now: datetime) -> list[Trip]:
    """The connections still ahead of `now`, in the order given.

    Ahead reaches `ROUTE_DEPARTED_GRACE_SECONDS` past the departure, the
    rule `RouteData.next_trip` and the route card apply to the same list.
    """
    return [
        trip
        for trip in trips
        if trip.departure is not None
        and (trip.departure - now).total_seconds() + ROUTE_DEPARTED_GRACE_SECONDS > 0
    ]


@dataclass(slots=True)
class RouteData:
    """Coordinator payload for a route entry."""

    trips: list[Trip] = field(default_factory=list)
    # False outside the configured time window: nothing was fetched, and
    # the empty trip list means "not looking", not "no connection".
    active: bool = True
    fetched_at: datetime | None = None
    # The night's last connection without a bus, once looked up; None
    # outside the evening or when there is none.
    last_connection: Trip | None = None

    def next_trip(self, now: datetime) -> Trip | None:
        """The first connection still ahead of `now`, in ranked order.

        What the sensors mean by the next connection, by the rule the route
        card applies to the same list (`upcomingTrips`): ahead reaches 30 s
        past the departure. `trips[0]` is not it. The list keeps a
        connection for a minute after it leaves, and the refresh just after
        a departure gets it back from the planner, so the first entry is
        often one that has gone.
        """
        cutoff = now - timedelta(seconds=ROUTE_DEPARTED_GRACE_SECONDS)
        return next(
            (
                trip
                for trip in self.trips
                if not trip.cancelled
                and trip.departure is not None
                and trip.departure >= cutoff
            ),
            None,
        )


class WienerLinienRouteCoordinator(DataUpdateCoordinator[RouteData]):
    """Plan connections for one origin → destination pair."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Read the route options off the entry."""
        config = {**entry.data, **entry.options}
        origin = as_int(config.get(CONF_ORIGIN_DIVA))
        destination = as_int(config.get(CONF_DESTINATION_DIVA))
        for value, raw in (
            (origin, config.get(CONF_ORIGIN_DIVA)),
            (destination, config.get(CONF_DESTINATION_DIVA)),
        ):
            if value is None:
                raise ConfigEntryError(
                    translation_domain=DOMAIN,
                    translation_key="invalid_diva",
                    translation_placeholders={"received": repr(raw)},
                )
        assert origin is not None
        assert destination is not None
        self.origin_name = str(config.get(CONF_ORIGIN_NAME) or origin)
        self.destination_name = str(config.get(CONF_DESTINATION_NAME) or destination)
        self.options = RouteOptions.from_config(origin, destination, config)
        self._active_from = parse_time_option(config.get(CONF_ACTIVE_FROM))
        self._active_to = parse_time_option(config.get(CONF_ACTIVE_TO))
        days = config.get(CONF_ACTIVE_DAYS)
        self._active_days: list[str] | None = (
            [str(d) for d in days] if isinstance(days, list) and days else None
        )
        # Clamped here as well as in the form, for an entry edited by hand.
        seconds = as_int(config.get(CONF_SCAN_INTERVAL)) or DEFAULT_ROUTE_SCAN_INTERVAL
        seconds = min(max(seconds, MIN_ROUTE_POLL_SECONDS), MAX_ROUTE_POLL_SECONDS)
        self.scan_interval = timedelta(seconds=seconds)
        self._failures = 0
        self._tz: tzinfo = dt_util.UTC
        # The published connections as planned, before live times. Every
        # `/monitor` answer is applied to these afresh, never to an already
        # adjusted copy.
        self._timetable: list[Trip] = []
        self._unsub_live: CALLBACK_TYPE | None = None
        self.leave_minutes = (
            as_int(config.get(CONF_LEAVE_MINUTES)) or DEFAULT_LEAVE_MINUTES
        )
        # The service day the last connection was looked up for, success or
        # not: one request a night, never a retry loop.
        self._last_connection_day: date | None = None
        self._last_connection: Trip | None = None
        # Set while the next refresh is one pulled up to a departure: when
        # it is due, how many connections were ahead when it was timed, and
        # when the configured interval asks regardless (`_await_departure`).
        self._rollover_at: datetime | None = None
        self._ahead_when_timed = 0
        self._regular_due: datetime | None = None
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_route",
            update_interval=self.scan_interval,
        )

    async def _async_setup(self) -> None:
        """Resolve the timetable zone and load the stop catalogue.

        The catalogue matches rides to the RBLs `/monitor` answers for, and
        gives stops their coordinates and lift outages. A departure board's
        coordinator loads it too, but an install with only routes has no
        such coordinator, and without this would run on the bare timetable
        until someone opened the card's planner or the weekly refresh came
        round. A failure isn't fatal: the route still plans, without those.
        """
        self._tz = await async_routing_zone()
        try:
            await static.async_get_catalogue(self.hass)
        except static.CATALOGUE_LOAD_ERRORS as err:
            _LOGGER.debug("Stop catalogue unavailable for routes: %s", err)
        self._unsub_live = async_get_live_board(self.hass).async_add_listener(
            self._on_live_times
        )

    async def async_shutdown(self) -> None:
        """Stop taking live times and take this route's stops off the request."""
        if self._unsub_live is not None:
            self._unsub_live()
            self._unsub_live = None
        # Unloading the last entry has already dropped the board; don't
        # create a new one just to release on it.
        board = self.hass.data.get(DOMAIN, {}).get(LIVE_BOARD_KEY)
        if isinstance(board, LiveBoard):
            board.release(self._live_owner)
        await super().async_shutdown()

    @property
    def _live_owner(self) -> str:
        assert self.config_entry is not None
        return f"route:{self.config_entry.entry_id}"

    @callback
    def _on_live_times(self) -> None:
        """Re-apply the newest `/monitor` answer without asking the planner.

        Updates the entities in place rather than through
        `async_set_updated_data`, which would reschedule the next planner
        refresh every time a departure board answers.
        """
        data = self.data
        if data is None or not data.active or not self._timetable:
            return
        board = async_get_live_board(self.hass)
        catalogue = current_catalogue(self.hass)
        rbls = rbls_for_trips(catalogue, self._timetable, dt_util.utcnow())
        data.trips = apply_live(
            self._timetable,
            board.rows_for(rbls),
            self.options.min_transfer_minutes,
            catalogue=catalogue,
            step_free=self.options.step_free,
        )[:MAX_TRIPS_PUBLISHED]
        self.async_update_listeners()

    @property
    def active_window(self) -> dict[str, object]:
        """The configured window, for attributes and diagnostics."""
        return {
            "from": self._active_from.isoformat() if self._active_from else None,
            "to": self._active_to.isoformat() if self._active_to else None,
            "days": list(self._active_days) if self._active_days else None,
        }

    def is_active(self, now: datetime | None = None) -> bool:
        """Whether the route should be refreshing right now."""
        local = (now or dt_util.utcnow()).astimezone(self._tz)
        return within_window(
            local, self._active_from, self._active_to, self._active_days
        )

    async def _async_update_data(self) -> RouteData:
        """Fetch and rank connections, or idle outside the window."""
        now = dt_util.utcnow().astimezone(self._tz)
        if not self.is_active(now):
            self._failures = 0
            self._rollover_at = None
            self.update_interval = self.scan_interval
            self._timetable = []
            async_get_live_board(self.hass).release(self._live_owner)
            return RouteData(trips=[], active=False, fetched_at=None)

        if self._await_departure():
            return self.data

        await async_enforce_routing_cooldown(self.hass)
        try:
            trips = await self.async_plan(now)
        except RoutingError as err:
            if err.translation_key == "route_no_connection":
                # Late at night a route can genuinely have nothing left.
                # That is an answer, not an outage.
                self._timetable = []
                async_get_live_board(self.hass).release(self._live_owner)
                self._note_success([])
                return RouteData(trips=[], active=True, fetched_at=dt_util.utcnow())
            self._note_failure()
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key=err.translation_key,
                translation_placeholders=err.placeholders,
            ) from err

        # Every connection the planner offered, not just the four published:
        # on live times one of the others can be the one that still works.
        self._timetable = trips
        published = (
            await async_live_trips(
                self.hass,
                self._live_owner,
                self._timetable,
                self.options.min_transfer_minutes,
                cooldown=True,
                step_free=self.options.step_free,
            )
        )[:MAX_TRIPS_PUBLISHED]
        self._note_success(published)
        return RouteData(
            trips=published,
            active=True,
            fetched_at=dt_util.utcnow(),
            last_connection=await self._async_last_connection(now),
        )

    async def _async_last_connection(self, now: datetime) -> Trip | None:
        """Tonight's last connection without a bus, fetched once a night.

        Failures are logged at debug and not retried until the next night:
        this is an extra, and the route itself already answered.
        """
        local = now.astimezone(self._tz)
        if local.time() >= LAST_CONNECTION_FROM:
            service_day = local.date()
        elif local.time() < LAST_CONNECTION_UNTIL:
            service_day = local.date() - timedelta(days=1)
        else:
            return None
        arrive_by = datetime.combine(
            service_day + timedelta(days=1), LAST_CONNECTION_ARRIVE_BY, self._tz
        )
        if self._last_connection_day != service_day:
            self._last_connection_day = service_day
            self._last_connection = None
            options = replace(
                self.options,
                excluded_means=tuple(
                    sorted(
                        {*self.options.excluded_means, *LAST_CONNECTION_EXCLUDED_MEANS}
                    )
                ),
            )
            await async_enforce_routing_cooldown(self.hass)
            try:
                trips = await async_plan_trips(
                    self.hass,
                    options,
                    arrive_by,
                    self._tz,
                    arrive_by=True,
                    planned=True,
                )
            except RoutingError as err:
                _LOGGER.debug("No last connection tonight: %s", err.translation_key)
            else:
                self._last_connection = last_connection(
                    trips,
                    now,
                    arrive_by,
                    LAST_CONNECTION_MAX_WAIT,
                    LAST_CONNECTION_THROUGH_MARGIN,
                )
        trip = self._last_connection
        if trip is None or trip.departure is None:
            return None
        kept_from = now - timedelta(seconds=ROUTE_KEEP_DEPARTED_SECONDS)
        return trip if trip.departure >= kept_from else None

    async def async_plan(
        self, when: datetime, *, arrive_by: bool = False
    ) -> list[Trip]:
        """Plan and rank connections at `when`. No cooldown, no state.

        The polling path's hook into `async_plan_trips`, bound to this
        entry's options and zone; the caller takes the routing cooldown.
        `plan_trip` doesn't come through here: it goes through adhoc.py's
        planner, which calls `async_plan_trips` directly. Connections that
        have already departed are dropped; for a query about later today
        or tomorrow that removes nothing.
        """
        return await async_plan_trips(
            self.hass, self.options, when, self._tz, arrive_by=arrive_by
        )

    def _note_success(self, trips: list[Trip]) -> None:
        """Reset backoff and pull the next refresh up to the next departure.

        The best connection leaving is the moment the published list goes
        out of date, so refresh shortly after it rather than waiting out
        the full interval — but never sooner than the rollover floor, so a
        connection leaving in ten seconds can't turn into a tight loop.
        Shortly after is 30 s plus a random wait
        (`ROUTE_ROLLOVER_SPREAD_SECONDS`), so installs showing the same
        connection don't all ask in the same second.

        Only a connection still ahead counts, the same rule the route card
        uses. `usable_trips` keeps one for a minute after it leaves, and the
        refresh just after a departure gets it back from the planner, so
        timing from it scheduled a second refresh 60 s later on every
        rollover: 24 requests an hour instead of 12 on a line every 5 minutes.
        Ahead here reaches 30 s past the departure, and the random wait is
        what keeps the rollover refresh clear of those 30 s; see the constant
        for why exactly 30 s wasn't enough.
        """
        self._failures = 0
        interval = self.scan_interval
        now = dt_util.utcnow()
        self._rollover_at = None
        ahead = _ahead(trips, now)
        if ahead:
            rollover = timedelta(
                seconds=max(
                    MIN_ROUTE_ROLLOVER_SECONDS, _rollover_seconds(ahead[0], now)
                )
            )
            if rollover < interval:
                interval = rollover
                self._rollover_at = now + rollover
                self._ahead_when_timed = len(ahead)
                self._regular_due = now + self.scan_interval
        self.update_interval = interval

    def _await_departure(self) -> bool:
        """Whether the refresh now due can wait, because nothing has left yet.

        A refresh pulled up to a departure is timed from the time that
        connection had when the plan was fetched. Every `/monitor` answer
        since has moved the published times (`_on_live_times`) but not the
        timer, so for a vehicle running later than it did then the refresh
        came while it was still ahead, got the same plan back, and timed a
        second one 60 s later: 7 of about 52 scheduled requests on a live
        route with a tram every 10 minutes (measured 2026-11-15). With as
        many connections ahead as when the timer was set, none has left and
        the planner has nothing new to say, so the refresh moves to the
        first one's time as it stands now, without a request. The times on
        screen are the live ones either way.

        Never past the configured interval, and only for the pulled-up
        refresh itself: one asked for in between (`update_entity`, a
        reload) asks the planner.
        """
        if self._rollover_at is None or self._regular_due is None:
            return False
        now = dt_util.utcnow()
        data = self.data
        remaining = (self._regular_due - now).total_seconds()
        early = (self._rollover_at - now).total_seconds() > ROLLOVER_EARLY_SECONDS
        ahead = [] if data is None or not data.active else _ahead(data.trips, now)
        if early or remaining <= 0 or len(ahead) != self._ahead_when_timed:
            return False
        wait = max(1.0, min(remaining, _rollover_seconds(ahead[0], now)))
        self._rollover_at = now + timedelta(seconds=wait)
        self.update_interval = timedelta(seconds=wait)
        return True

    def _note_failure(self) -> None:
        """Stretch the interval from the second consecutive failure on.

        The first failure goes back to the configured interval: the last
        success may have pulled the next refresh up to a departure, and a
        retry shouldn't inherit that.
        """
        self._failures += 1
        self._rollover_at = None
        if self._failures < 2:
            self.update_interval = self.scan_interval
            return
        seconds = backoff_delay(self.scan_interval, self._failures).total_seconds()
        if self.update_interval != timedelta(seconds=seconds):
            _LOGGER.info(
                "Route %s → %s failing %d times in a row; next try in %d s",
                self.origin_name,
                self.destination_name,
                self._failures,
                seconds,
            )
        self.update_interval = timedelta(seconds=seconds)


def _rollover_seconds(trip: Trip, now: datetime) -> float:
    """Seconds from `now` to the refresh after `trip` leaves, spread included."""
    assert trip.departure is not None
    return (
        (trip.departure - now).total_seconds()
        + ROUTE_DEPARTED_GRACE_SECONDS
        + random.uniform(*ROUTE_ROLLOVER_SPREAD_SECONDS)
    )


async def async_plan_trips(
    hass: HomeAssistant,
    options: RouteOptions,
    when: datetime,
    tz: tzinfo,
    *,
    arrive_by: bool = False,
    planned: bool = False,
) -> list[Trip]:
    """Fetch, parse and filter one trip request. No cooldown, no state.

    The one planning path shared by route entries, the `plan_trip` action
    and the route card's ad-hoc mode (the last two via adhoc.py), plus the
    config flow's setup probe, so every caller sees the same connections
    for the same query. `planned` marks a query for a time the caller chose
    rather than "now": its connections are kept even when they left
    already. An arrive-by query loses what arrives after `when`, a planned
    leave-at query what leaves before it (`usable_trips`). Comparing the
    rest waits for live times (live.async_live_trips). Tests patch the
    fetch at `route_coordinator.async_fetch_trip_body`.
    """
    body = await async_fetch_trip_body(
        async_get_clientsession(hass),
        build_trip_params(
            options,
            when.astimezone(tz),
            arrive_by=arrive_by,
            language=hass.config.language,
        ),
        USER_AGENT,
    )
    trips = parse_trip_body(body, tz, min_transfer_minutes=options.min_transfer_minutes)
    return usable_trips(
        trips,
        None if planned else dt_util.utcnow(),
        arrive_by=when if arrive_by else None,
        leave_at=when if planned and not arrive_by else None,
    )


def route_trip_attributes(hass: HomeAssistant, trips: Sequence[Trip]) -> dict[str, Any]:
    """`trips`, `line_colors` and the notices and outages for connections.

    Shared by the route sensor and the route card's ad-hoc answer
    (websocket.py), so both modes of the card read the same shape.
    """
    labels = {
        leg.line for trip in trips for leg in trip.legs if leg.line and not leg.walk
    }
    # `get_alerts_for` reads an empty line set as "every line". A plan with
    # no ride in it has no disruption of its own to show.
    traffic = get_alerts_for(hass, labels, set())[0] if labels else []
    rendered = [trip.to_dict() for trip in trips]
    add_stop_coordinates(hass, rendered)
    return {
        "trips": rendered,
        "line_colors": line_colors_for(hass, labels),
        "traffic_info": [t.to_dict() for t in traffic],
        "elevator_info": _access_outages(hass, trips, "elevator"),
        "escalator_info": _access_outages(hass, trips, "escalator"),
    }


def add_stop_coordinates(hass: HomeAssistant, trips: list[dict[str, Any]]) -> None:
    """Give each rendered stop the catalogue's `latitude` and `longitude`.

    The card links a stop to the city map with them. A stop's `stop_id` is
    its DIVA, the catalogue's key. Stops the catalogue doesn't hold (an
    S-Bahn-only station) and every stop while it is still loading get no
    keys, and the card falls back to a search by name.
    """
    catalogue = current_catalogue(hass)
    if catalogue is None:
        return
    for trip in trips:
        for leg in trip["legs"]:
            for stop in (leg["origin"], leg["destination"], *leg["stops"]):
                diva = as_int(stop.get("stop_id"))
                station = (
                    catalogue.stations_by_diva.get(diva) if diva is not None else None
                )
                if station is not None:
                    stop["latitude"] = station.latitude
                    stop["longitude"] = station.longitude


def _access_outages(
    hass: HomeAssistant, trips: Sequence[Trip], kind: str
) -> list[dict[str, Any]]:
    """Outages at the stations whose lifts or escalators these trips use.

    `kind` is the step kind, `elevator` or `escalator`. The trip names each
    by its station (DIVA); the outage feed names the platforms (RBLs) it
    affects, or only the station. The catalogue joins them, so this is
    station-level: an outage anywhere at a station a planned lift or
    escalator belongs to counts, and `stop_ids` says which of the trip's
    stations it is about. An escalator outage counts only where a trip
    takes an escalator the way the broken one runs (`ElevatorInfo.direction`).

    An outage only announced for later is left out: the feeds list
    maintenance days ahead as "außer Betrieb", and the one on this trip
    still runs.
    """
    # Per station, the ways the trips take one there; None is a step the
    # planner gave no direction for.
    stations: dict[int, set[str | None]] = {}
    for trip in trips:
        for leg in trip.legs:
            for step in (*leg.access, *leg.access_after):
                if step.kind == kind and (diva := as_int(step.stop_id)) is not None:
                    stations.setdefault(diva, set()).add(step.level)
    catalogue = current_catalogue(hass)
    if not stations or catalogue is None:
        return []
    rbl_to_diva = {
        rbl: diva
        for diva in stations
        if (station := catalogue.stations_by_diva.get(diva)) is not None
        for rbl in station.rbls
    }
    rbls = set(rbl_to_diva)
    outages = (
        get_alerts_for(hass, None, rbls)[1]
        if kind == "elevator"
        else get_escalators_for(hass, None, rbls)
    )
    now = dt_util.utcnow()
    found: list[dict[str, Any]] = []
    for outage in outages:
        start = parse_aware_datetime(outage.time_start)
        if start is not None and start > now:
            continue
        divas = {
            rbl_to_diva[rbl] for rbl in outage.related_stops if rbl in rbl_to_diva
        } or {
            # Named by station only: every one of the trip's stations that
            # the outage matched through.
            diva
            for diva in stations
            if (station := catalogue.stations_by_diva.get(diva)) is not None
            and outage_station_matches(outage, station.name)
        }
        # An escalator running the other way is not the one on the trip.
        # One with no direction, or switched either way, can be.
        if outage.direction in ("up", "down"):
            divas = {
                diva for diva in divas if stations[diva] & {outage.direction, None}
            }
        if divas:
            found.append(
                {**outage.to_dict(), "stop_ids": sorted(str(diva) for diva in divas)}
            )
    return found


def route_device_info(entry: ConfigEntry) -> DeviceInfo:
    """Device shared by both route entities and set up front in __init__."""
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.title,
        manufacturer="Wiener Linien",
        model="Verbindung",
        configuration_url="https://www.wienerlinien.at/",
    )
