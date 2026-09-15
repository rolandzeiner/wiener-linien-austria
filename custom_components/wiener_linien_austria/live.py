"""Live times for planned connections, from the departure boards' `/monitor`.

The trip planner sends no live times (every leg had `rtTime == time` in
probes on 2026-09-14 and 2026-09-15), but `/monitor` does, and its planned
times match the trip planner's to the minute. So a ride is matched on
boarding stop (DIVA) + line + direction (`mode.diva.dir` ↔ `/monitor`
`direction`, verified for U-Bahn, tram and bus) + planned minute, and takes
its live departure from there. S-Bahn and ÖBB rides aren't in `/monitor` and
stay on the timetable.

No new recurring request where one can be avoided:

- **Leases.** Every route entry and every on-demand plan registers the RBLs
  of its boarding stops here. The fastest departure-board batch group
  (batch.py) adds them to the one combined `/monitor` request it makes
  anyway, and every successful batch answer is recorded here. A route's
  live times then follow the boards' cadence without asking the trip
  planner again.
- **One call of its own, only when needed.** With a batch group running, a
  plan makes its own `/monitor` call only for stops that have no answer at
  all yet (a new route, a changed transfer); the next batch tick takes them
  over. Without one (an install with routes but no departure board), a
  refresh makes the call itself, carrying every leased stop, and any answer
  under `LIVE_REUSE_SECONDS` old serves every caller. Route refreshes take
  the realtime domain cooldown; on-demand plans don't, since someone is
  waiting, and are bounded by adhoc.py's budget instead.
- **Silent fallback.** A failed or refused call leaves the plan on the
  timetable. Nothing raises past this module.

Rows are kept per RBL for `LIVE_PURGE_SECONDS`. A stop pair is a movement
pattern, so nothing here reaches diagnostics, and everything goes when the
last entry unloads.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from itertools import pairwise
from statistics import median
from typing import Any, Final

import aiohttp
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .const import (
    API_BASE_URL,
    BATCH_REGISTRY_KEY,
    DOMAIN,
    MONITOR_ENDPOINT,
    USER_AGENT,
)
from .http import base_request_headers
from .parsing import as_int, as_mapping
from .rate_limit import async_enforce_domain_cooldown
from .routing import Trip, assess_transfers
from .static import StaticCatalogue, current_catalogue

_LOGGER = logging.getLogger(__name__)

LIVE_BOARD_KEY: Final = "live_board"

# Rows older than this don't count as live. Two missed batch ticks at the
# default 60 s cadence; any older and a delay could have moved on. A slower
# batch cadence raises it (`_row_max_age`): leased stops are only refreshed
# once per tick of the fastest group, so at 600 s a fixed 180 s would put
# routes on the timetable for most of every cycle.
LIVE_ROW_MAX_AGE_SECONDS: Final = 180
# Slack on top of that cadence, so a tick delayed by the domain cooldown or
# a slow answer doesn't drop its stops to the timetable for a moment.
LIVE_ROW_GRACE_SECONDS: Final = 60
# Without a batch group, an answer this fresh serves every caller, so routes
# refreshing a few seconds apart share one request.
LIVE_REUSE_SECONDS: Final = 60
# Rows are dropped entirely after this. With a batch group running, a leased
# stop without rows is what earns a call of its own.
LIVE_PURGE_SECONDS: Final = 600
# How long an on-demand plan keeps its stops in the shared request. The card
# asks again every 2 minutes while on screen, which renews it.
ADHOC_LEASE_SECONDS: Final = 300
# `/monitor` lists roughly the next hour. A ride further out has nothing to
# match, so its stops aren't leased or fetched.
LIVE_HORIZON: Final = timedelta(minutes=75)
LIVE_REQUEST_TIMEOUT_SECONDS: Final = 15
MAX_NEXT_DEPARTURES: Final = 2


@dataclass(slots=True, frozen=True)
class LiveRow:
    """One departure from a `/monitor` answer."""

    diva: str
    line: str
    direction: str
    planned: datetime
    real: datetime | None


def parse_monitor_rows(body: Mapping[str, Any]) -> dict[int, list[LiveRow]]:
    """Every departure in a `/monitor` answer, grouped by RBL.

    Monitors without an RBL or a DIVA, lines without a name or direction, and
    departures without a planned time are skipped: they can't be matched.
    """
    by_rbl: dict[int, list[LiveRow]] = {}
    data = body.get("data")
    monitors = data.get("monitors") if isinstance(data, Mapping) else None
    for monitor in monitors if isinstance(monitors, list) else []:
        if not isinstance(monitor, Mapping):
            continue
        properties = as_mapping(
            as_mapping(monitor.get("locationStop")).get("properties")
        )
        rbl = as_int(as_mapping(properties.get("attributes")).get("rbl"))
        diva = str(properties.get("name") or "").strip()
        if rbl is None or not diva:
            continue
        rows = by_rbl.setdefault(rbl, [])
        for line in monitor.get("lines") or []:
            if not isinstance(line, Mapping):
                continue
            name = str(line.get("name") or "").strip()
            direction = str(line.get("direction") or "").strip()
            if not name or not direction:
                continue
            departures = as_mapping(line.get("departures")).get("departure")
            for departure in departures if isinstance(departures, list) else []:
                stamps = as_mapping(as_mapping(departure).get("departureTime"))
                planned = _parse_stamp(stamps.get("timePlanned"))
                if planned is None:
                    continue
                rows.append(
                    LiveRow(
                        diva=diva,
                        line=name,
                        direction=direction,
                        planned=planned,
                        real=_parse_stamp(stamps.get("timeReal")),
                    )
                )
    return by_rbl


def rbls_for_trips(
    catalogue: StaticCatalogue | None,
    trips: Iterable[Trip],
    now: datetime,
) -> set[int]:
    """The RBLs whose `/monitor` rows can give these trips live times.

    One boarding stop per Wiener Linien ride that leaves within the
    horizon. A station's RBLs are narrowed to those its line stops at, when
    the trip patterns know the line, so a change at Karlsplatz doesn't put
    every platform of the station into the shared request.
    """
    if catalogue is None:
        return set()
    patterns = catalogue.trip_patterns
    rbls: set[int] = set()
    for trip in trips:
        for leg in trip.legs:
            departure = leg.origin.planned
            if (
                leg.walk
                or not leg.wiener_linien
                or not leg.line
                or departure is None
                or not now - timedelta(minutes=5) <= departure <= now + LIVE_HORIZON
            ):
                continue
            diva = as_int(leg.origin.stop_id)
            station = catalogue.stations_by_diva.get(diva) if diva is not None else None
            if station is None or not station.rbls:
                continue
            station_rbls = set(station.rbls)
            line_id = patterns.lines_by_label.get(leg.line) if patterns else None
            if patterns is not None and line_id is not None:
                on_line = {
                    rbl
                    for pattern in patterns.patterns_by_line.get(line_id, ())
                    for rbl in pattern.stops
                    if rbl in station_rbls
                }
                station_rbls = on_line or station_rbls
            rbls.update(station_rbls)
    return rbls


def apply_live(
    trips: Sequence[Trip],
    rows: Iterable[LiveRow],
    min_transfer_minutes: int,
) -> list[Trip]:
    """Copies of `trips` with live departures, frequencies and re-scored changes.

    A matched ride takes its live departure, and its arrival moves by the
    same delay (`/monitor` has no arrival times); that is the estimate the
    next change is scored against. Every ride with rows, matched or not, gets
    its next departures and how often it runs. The input is never mutated,
    so a caller keeps the timetable plan and re-applies fresher rows to it.
    """
    index: dict[tuple[str, str, str], list[LiveRow]] = {}
    for row in rows:
        index.setdefault((row.diva, row.line, row.direction), []).append(row)
    for departures in index.values():
        departures.sort(key=lambda row: row.planned)

    result: list[Trip] = []
    for trip in trips:
        legs = []
        for leg in trip.legs:
            planned = leg.origin.planned
            group: list[LiveRow] | None = (
                index.get((leg.origin.stop_id, leg.line, leg.direction))
                if leg.origin.stop_id and leg.line and leg.direction and not leg.walk
                else None
            )
            if not group or planned is None:
                legs.append(leg)
                continue
            match = _match(group, planned)
            origin, destination, realtime = leg.origin, leg.destination, leg.realtime
            stops = leg.stops
            if match is not None and match.real is not None:
                # The delay, not the raw real time: `/monitor` plans to the
                # second (06:17:30) and the planner to the minute (06:17), so
                # a tram 1 s late would otherwise read as a minute late.
                delay = match.real - match.planned
                origin = replace(origin, estimated=planned + delay)
                stops = tuple(
                    replace(stop, time=stop.time + delay)
                    if stop.time is not None
                    else stop
                    for stop in stops
                )
                if destination.planned is not None:
                    destination = replace(
                        destination, estimated=destination.planned + delay
                    )
                realtime = True
            later = [
                row
                for row in group
                if row is not match and _minute(row.planned) > _minute(planned)
            ]
            legs.append(
                replace(
                    leg,
                    origin=origin,
                    destination=destination,
                    realtime=realtime,
                    stops=stops,
                    next_departures=tuple(
                        (row.real or row.planned).astimezone(planned.tzinfo)
                        for row in later[:MAX_NEXT_DEPARTURES]
                    ),
                    headway_minutes=_headway(group),
                )
            )
        live_trip = Trip(legs=legs)
        live_trip.transfers = assess_transfers(legs, min_transfer_minutes)
        result.append(live_trip)
    return result


def _match(group: Sequence[LiveRow], planned: datetime) -> LiveRow | None:
    """The row for a ride planned at `planned`.

    `/monitor` plans to the second (06:17:30) where the trip planner prints
    the minute rounded down (06:17), so the same minute wins. Failing that,
    the nearest row within a minute either way, which still can't reach the
    next vehicle: nothing in Vienna runs more often than every two minutes.
    """
    target = _minute(planned)
    for row in group:
        if _minute(row.planned) == target:
            return row
    near = [
        row
        for row in group
        if abs((_minute(row.planned) - target).total_seconds()) <= 60
    ]
    return (
        min(near, key=lambda row: abs((row.planned - planned).total_seconds()))
        if near
        else None
    )


def _headway(group: Sequence[LiveRow]) -> int | None:
    """Typical minutes between departures, or None with too few to tell."""
    times = sorted({_minute(row.planned) for row in group})
    gaps = [
        round((later - earlier).total_seconds() / 60)
        for earlier, later in pairwise(times)
    ]
    if len(gaps) < 2:
        return None
    return max(1, round(median(gaps)))


class LiveBoard:
    """Latest `/monitor` rows per RBL, and who needs which stops."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Start empty."""
        self._hass = hass
        self._rows: dict[int, tuple[float, tuple[LiveRow, ...]]] = {}
        self._leases: dict[str, tuple[frozenset[int], float | None]] = {}
        self._listeners: list[Callable[[], None]] = []
        self._in_flight: asyncio.Task[None] | None = None

    # -- leases ---------------------------------------------------------

    @callback
    def lease(self, owner: str, rbls: Iterable[int], ttl: float | None = None) -> None:
        """Keep `rbls` in the shared request for `owner` (forever without `ttl`)."""
        stops = frozenset(rbls)
        if not stops:
            self._leases.pop(owner, None)
            return
        expires = None if ttl is None else self._hass.loop.time() + ttl
        self._leases[owner] = (stops, expires)

    @callback
    def release(self, owner: str) -> None:
        """Drop `owner`'s stops from the shared request."""
        self._leases.pop(owner, None)

    @callback
    def leased_rbls(self) -> set[int]:
        """Every stop someone currently needs live times for."""
        now = self._hass.loop.time()
        expired = [
            owner
            for owner, (_stops, expires) in self._leases.items()
            if expires is not None and expires <= now
        ]
        for owner in expired:
            del self._leases[owner]
        return {rbl for stops, _expires in self._leases.values() for rbl in stops}

    # -- rows -----------------------------------------------------------

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Call `listener` after every recorded answer."""
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove

    @callback
    def ingest(self, body: Mapping[str, Any], requested: Iterable[int] = ()) -> None:
        """Record a successful `/monitor` answer and tell the listeners.

        `/monitor` leaves out a stop it doesn't know instead of erroring, so
        every `requested` stop is recorded, with no rows if it was left out.
        Otherwise a decommissioned RBL would look unanswered and earn a call
        of its own on every plan.
        """
        now = self._hass.loop.time()
        answered = parse_monitor_rows(body)
        for rbl in requested:
            self._rows[rbl] = (now, tuple(answered.pop(rbl, ())))
        for rbl, rows in answered.items():
            self._rows[rbl] = (now, tuple(rows))
        # Purge well after rows stop counting as live: with a batch running,
        # a purged stop looks unanswered and earns a request of its own.
        purge_after = max(LIVE_PURGE_SECONDS, 2 * _row_max_age(self._hass))
        stale = [
            rbl
            for rbl, (stored, _rows) in self._rows.items()
            if now - stored >= purge_after
        ]
        for rbl in stale:
            del self._rows[rbl]
        for listener in list(self._listeners):
            try:
                listener()
            except Exception:  # one listener must not starve the rest
                _LOGGER.exception("Applying live times failed")

    @callback
    def rows_for(self, rbls: Iterable[int]) -> list[LiveRow]:
        """Rows recent enough to count as live, for these stops."""
        now = self._hass.loop.time()
        max_age = _row_max_age(self._hass)
        rows: list[LiveRow] = []
        for rbl in rbls:
            stored = self._rows.get(rbl)
            if stored is not None and now - stored[0] <= max_age:
                rows.extend(stored[1])
        return rows

    async def async_ensure(self, rbls: Iterable[int], *, cooldown: bool) -> None:
        """Make sure `rbls` have live rows, spending at most one request.

        See the module docstring for when that request is made. Concurrent
        callers share one request; a failure is logged at debug and leaves
        the rows as they were.
        """
        wanted = set(rbls)
        if not wanted:
            return
        if self._running():
            assert self._in_flight is not None
            await asyncio.shield(self._in_flight)
        missing = self._missing(wanted)
        if not missing:
            return
        if not self._running():
            if not _batch_running(self._hass):
                # Carry every stop that is due anyway, so the next route's
                # refresh finds its answer already here.
                missing |= self._missing(self.leased_rbls())
            task = self._hass.async_create_background_task(
                self._async_fetch(sorted(missing), cooldown),
                name=f"{DOMAIN}_live_monitor",
            )
            task.add_done_callback(self._forget)
            self._in_flight = task
        if self._in_flight is not None:
            await asyncio.shield(self._in_flight)

    def _running(self) -> bool:
        # A finished task's done callback runs a loop turn later, so the slot
        # can still hold it; only a task still running is worth sharing.
        return self._in_flight is not None and not self._in_flight.done()

    def _forget(self, task: asyncio.Task[None]) -> None:
        if self._in_flight is task:
            self._in_flight = None

    def _missing(self, rbls: set[int]) -> set[int]:
        now = self._hass.loop.time()
        if _batch_running(self._hass):
            # The batch refreshes leased stops; only a stop it has never
            # answered for is worth a request. An old row means the batch is
            # failing, and another request wouldn't help.
            return {rbl for rbl in rbls if rbl not in self._rows}
        return {
            rbl
            for rbl in rbls
            if rbl not in self._rows or now - self._rows[rbl][0] > LIVE_REUSE_SECONDS
        }

    async def _async_fetch(self, rbls: list[int], cooldown: bool) -> None:
        try:
            if cooldown:
                await async_enforce_domain_cooldown(self._hass)
            body = await async_fetch_monitor_body(
                async_get_clientsession(self._hass), rbls, USER_AGENT
            )
        except (TimeoutError, aiohttp.ClientError, ValueError) as err:
            _LOGGER.debug("Live times unavailable, keeping timetable: %s", err)
            return
        self.ingest(body, rbls)


async def async_fetch_monitor_body(
    session: aiohttp.ClientSession, rbls: Sequence[int], user_agent: str
) -> dict[str, Any]:
    """GET `/monitor` for `rbls`; raise `ValueError` unless it answered OK.

    Same request shape as the batch group's (repeated `stopId`). Tests patch
    this at `live.async_fetch_monitor_body`.
    """
    async with session.get(
        f"{API_BASE_URL}{MONITOR_ENDPOINT}",
        params=[("stopId", str(rbl)) for rbl in rbls],
        headers=base_request_headers(user_agent),
        timeout=aiohttp.ClientTimeout(total=LIVE_REQUEST_TIMEOUT_SECONDS),
    ) as resp:
        resp.raise_for_status()
        body = await resp.json()
    if not isinstance(body, dict):
        raise ValueError(f"expected an object, got {type(body).__name__}")
    code = as_int(as_mapping(body.get("message")).get("messageCode"))
    if code is not None and code != 1:
        raise ValueError(f"monitor answered messageCode {code}")
    return body


@callback
def async_get_live_board(hass: HomeAssistant) -> LiveBoard:
    """The instance-wide board, created on first use."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    board = domain_data.get(LIVE_BOARD_KEY)
    if not isinstance(board, LiveBoard):
        board = LiveBoard(hass)
        domain_data[LIVE_BOARD_KEY] = board
    return board


async def async_live_trips(
    hass: HomeAssistant,
    owner: str,
    trips: Sequence[Trip],
    min_transfer_minutes: int,
    *,
    cooldown: bool,
    lease_seconds: float | None = None,
) -> list[Trip]:
    """Lease the stops `trips` need, make sure they have rows, apply them."""
    board = async_get_live_board(hass)
    rbls = rbls_for_trips(current_catalogue(hass), trips, dt_util.utcnow())
    board.lease(owner, rbls, lease_seconds)
    if not rbls:
        return list(trips)
    await board.async_ensure(rbls, cooldown=cooldown)
    return apply_live(trips, board.rows_for(rbls), min_transfer_minutes)


def _row_max_age(hass: HomeAssistant) -> float:
    """How old a row may be and still count as live.

    `LIVE_ROW_MAX_AGE_SECONDS`, or the fastest running batch group's
    cadence plus `LIVE_ROW_GRACE_SECONDS` when that is longer, since that
    group is the one refreshing leased stops.
    """
    registry = hass.data.get(DOMAIN, {}).get(BATCH_REGISTRY_KEY)
    running: list[int] = (
        [group.interval_seconds for group in registry.values() if group.has_members]
        if isinstance(registry, dict)
        else []
    )
    if not running:
        return LIVE_ROW_MAX_AGE_SECONDS
    return max(LIVE_ROW_MAX_AGE_SECONDS, min(running) + LIVE_ROW_GRACE_SECONDS)


def _batch_running(hass: HomeAssistant) -> bool:
    registry = hass.data.get(DOMAIN, {}).get(BATCH_REGISTRY_KEY)
    return isinstance(registry, dict) and any(
        group.has_members for group in registry.values()
    )


def _minute(value: datetime) -> datetime:
    return value.replace(second=0, microsecond=0)


def _parse_stamp(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None
