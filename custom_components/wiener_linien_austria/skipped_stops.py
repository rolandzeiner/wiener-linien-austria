"""Stations a ride passes without calling there, until when, and exceptions.

A stops-ahead trail names the stations of the line's static route
(`fahrwegverlaeufe`); the times beside them are run times from the routing
server's departure monitor, which lists only the stations a train calls at.
Where the two part, the timetable has the train going through: U6 towards
Floridsdorf skips Neue Donau while that platform is rebuilt (14 Sep to the
end of 2026), and its trail showed the station with no time. This module
finds those stations, and the card says "no stop" there.

A skipped station is one with no run time whose neighbours on the route
are two calls in a row in the timetable (see `skipped_stations`). That
keeps the end of a short run, a variant of the route the sampled trains
didn't take and a stop the timetable knows by another id from reading as
skips. The last of those gets the other id's run time instead
(`stand_ins`): N6 ends at Enkplatz on its route and at "Enkplatz/Grillgasse"
in the timetable, an id the station list doesn't have.

A run-time sample is one moment held for a week, and a works zone can close
a platform at some hours only: Neue Donau is served towards Floridsdorf on
some weeknights from 22:00 after all. Works also start in the middle of a
sample's week, which then still has the trains calling. So for a station a
sample shows skipped, or a notice in force says is shut for the line
(`noticed_stations`), the station's own departures say which runs call there
(`StopCalls`), and the card decides per departure.

The notices come from `/newsList`, which also gives the date the stop is
back where one notice answers it without doubt (see `closed_until`). Notices
and calls are fetched on demand like the run times: when a card asks for a
trail's run times, and the calls only for a station that needs them; held
for a while, callers asking at once sharing one request. Neither takes a
domain cooldown slot, for the reason `rate_limit.py` gives for the run times:
someone has just opened a trail and is waiting.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Iterable, Iterator, Mapping
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .api import ROUTING_DEPARTURE_ENDPOINT, WienerLinienApiError, fetch_news
from .const import (
    DOMAIN,
    STOP_CALLS_AHEAD,
    STOP_CALLS_DEPARTURES_REQUESTED,
    STOP_CALLS_MAX_AGE,
    STOP_CALLS_MIN_AGE,
    STOP_CALLS_RETRY_AFTER,
    STOP_NOTICES_MAX_AGE,
    STOP_NOTICES_RETRY_AFTER,
    STOP_NOTICES_TIMEOUT_SECONDS,
    USER_AGENT,
)
from .routing import RoutingError, async_fetch_trip_body, async_routing_zone
from .run_times import RUN_TIME_EXCLUDED_MOTS
from .static import StaticCatalogue
from .timetable import LineCalls, build_departure_params, parse_line_calls

_LOGGER = logging.getLogger(__name__)

STOP_NOTICES_KEY: Final = "stop_notices"
STOP_CALLS_KEY: Final = "stop_calls"

# The wall-clock end Wiener Linien gives a notice that has no real end: a
# moved bus stop or a missing lift "until" 11:11 on some date years out.
_OPEN_END: Final = (11, 11)


@dataclass(slots=True, frozen=True)
class SkippedStation:
    """A station a line's route passes without the timetable calling there."""

    diva: int
    # The route's platforms there, and those of the stations either side,
    # where the train does call.
    rbls: frozenset[int]
    neighbour_rbls: frozenset[int]
    # Minutes from the board to the calls either side, from the sample it
    # was found in: a run calling here does so in between.
    between: tuple[float, float]


def skipped_stations(
    catalogue: StaticCatalogue,
    board_diva: int,
    line: str,
    direction: str,
    minutes: Mapping[int, float],
) -> dict[str, SkippedStation]:
    """The stations after `board_diva` a line passes without calling, by name.

    `minutes` is the run-time sample for `line` and `direction`
    (`/monitor`'s "U6", "H"): DIVA → minutes from the board. Only routes in
    that direction that pass the board count; a route listing the board
    twice is read from its first call.

    Both neighbours must be calls the sample has one right after the other:
    the second later than the first, nothing called in between. That keeps
    out a station on an old or rare variant of the route (13A's
    Neubaugasse, Volkstheater, Kellermanngasse, where its buses now run via
    Siebensterngasse), a route the trains take the other way round (tram 1
    on the Ring during works), and a stop the timetable knows by another
    DIVA, which it lists at a time between the two.
    """
    calls = {**minutes, board_diva: 0.0}
    found: dict[str, tuple[int, set[int], set[int], tuple[float, float]]] = {}
    for stops in _routes_from(catalogue, board_diva, line, direction):
        divas = [entry[0] if entry else None for _, entry in stops]
        for at in range(1, len(stops) - 1):
            rbl, entry = stops[at]
            before = _minutes_at(calls, divas[at - 1])
            after = _minutes_at(calls, divas[at + 1])
            if (
                entry is None
                or entry[0] in calls
                or before is None
                or after is None
                or not _back_to_back(calls, before, after)
            ):
                continue
            _, platforms, neighbours, _ = found.setdefault(
                entry[1], (entry[0], set(), set(), (before, after))
            )
            platforms.add(rbl)
            neighbours.update((stops[at - 1][0], stops[at + 1][0]))
    return {
        name: SkippedStation(diva, frozenset(rbls), frozenset(neighbours), between)
        for name, (diva, rbls, neighbours, between) in found.items()
    }


def stand_ins(
    catalogue: StaticCatalogue,
    board_diva: int,
    line: str,
    direction: str,
    minutes: Mapping[int, float],
) -> dict[str, float]:
    """Route stations the timetable calls at under an id the catalogue lacks.

    N6 ends at Enkplatz (60200425) on its route; the timetable's last call
    is "Enkplatz/Grillgasse", 60201987, which the open-data station list
    doesn't have, so the trail's last stop had no time. A station without a
    call of its own takes such a call's minutes when that call is the next
    one after the route's station before it, alone in its minute, and the
    route's station after it, if there is one, is the call right after.
    Returns station name → minutes; same arguments as `skipped_stations`.
    """
    known = catalogue.stations_by_diva
    if all(diva in known for diva in minutes):
        return {}
    calls = {**minutes, board_diva: 0.0}
    found: dict[str, float] = {}
    for stops in _routes_from(catalogue, board_diva, line, direction):
        divas = [entry[0] if entry else None for _, entry in stops]
        for at in range(1, len(stops)):
            entry = stops[at][1]
            before = _minutes_at(calls, divas[at - 1])
            if entry is None or entry[0] in calls or before is None:
                continue
            later = [value for value in calls.values() if value > before]
            if not later:
                continue
            nearest = min(later)
            ids = [diva for diva, value in calls.items() if value == nearest]
            if len(ids) != 1 or ids[0] in known:
                continue
            if at + 1 < len(stops):
                after = _minutes_at(calls, divas[at + 1])
                if after is None or not _back_to_back(calls, nearest, after):
                    continue
            found.setdefault(entry[1], nearest)
    return found


def _routes_from(
    catalogue: StaticCatalogue, board_diva: int, line: str, direction: str
) -> Iterator[list[tuple[int, tuple[int, str] | None]]]:
    """Each route of the line that way passing the board, from the board on.

    As (RBL, catalogue entry) pairs, the board first. A route listing the
    board twice is read from its first call.
    """
    patterns = catalogue.trip_patterns
    if patterns is None or direction not in ("H", "R"):
        return
    line_id = patterns.lines_by_label.get(line)
    if line_id is None:
        return
    wanted = 1 if direction == "H" else 2
    index = catalogue.index_by_rbl()
    for pattern in patterns.patterns_by_line.get(line_id, ()):
        if pattern.direction != wanted:
            continue
        stops = [(rbl, index.get(rbl)) for rbl in pattern.stops]
        divas = [entry[0] if entry else None for _, entry in stops]
        if board_diva in divas:
            yield stops[divas.index(board_diva) :]


def _minutes_at(calls: Mapping[int, float], diva: int | None) -> float | None:
    return calls.get(diva) if diva is not None else None


def _back_to_back(calls: Mapping[int, float], first: float, then: float) -> bool:
    """Whether a run calls at `then` right after `first`, nothing between."""
    return then > first and not any(first < at < then for at in calls.values())


@dataclass(slots=True, frozen=True)
class StopNotice:
    """One `/newsList` notice, as far as a skipped station needs it."""

    lines: frozenset[str]
    rbls: frozenset[int]
    start: datetime | None
    end: datetime | None


def noticed_stations(
    catalogue: StaticCatalogue,
    board_diva: int,
    line: str,
    direction: str,
    minutes: Mapping[int, float],
    notices: Iterable[StopNotice],
    now: datetime,
) -> dict[str, SkippedStation]:
    """Stations the sample has a call at that a notice says are shut for the line.

    A sample is held for a week and works start in the middle of one:
    Meidling's U6 sample from 4 November still had the trains calling at
    Neue Donau after that platform had closed. A station counts when the
    sample calls there between the calls either side of it on the route,
    and a notice in force names the line and the station's platform on this
    route but neither neighbour's (the test `closed_until` uses, without the
    date). Same arguments as `skipped_stations`, plus the notices.
    """
    live = [notice for notice in notices if _in_force_for(notice, line, now)]
    if not live:
        return {}
    calls = {**minutes, board_diva: 0.0}
    found: dict[str, SkippedStation] = {}
    for stops in _routes_from(catalogue, board_diva, line, direction):
        divas = [entry[0] if entry else None for _, entry in stops]
        for at in range(1, len(stops) - 1):
            rbl, entry = stops[at]
            if entry is None or entry[1] in found:
                continue
            own = calls.get(entry[0])
            before = _minutes_at(calls, divas[at - 1])
            after = _minutes_at(calls, divas[at + 1])
            if own is None or before is None or after is None:
                continue
            if not before < own < after:
                continue
            neighbours = frozenset((stops[at - 1][0], stops[at + 1][0]))
            if any(
                rbl in notice.rbls and not notice.rbls & neighbours for notice in live
            ):
                found[entry[1]] = SkippedStation(
                    entry[0], frozenset({rbl}), neighbours, (before, after)
                )
    return found


class NewsShapeError(ValueError):
    """A `/newsList` answer without the envelope of one."""


def parse_news(body: Mapping[str, Any]) -> list[StopNotice]:
    """The notices out of a `/newsList` answer that name a platform.

    Raises `NewsShapeError` unless the body carries `messageCode` 1 and a
    `data.pois` list: anything else is a failed fetch, not "no notices".
    """
    message = body.get("message")
    data = body.get("data")
    pois = data.get("pois") if isinstance(data, Mapping) else None
    if (
        not isinstance(message, Mapping)
        or message.get("messageCode") != 1
        or not isinstance(pois, list)
    ):
        raise NewsShapeError("not a newsList answer")
    notices: list[StopNotice] = []
    for poi in pois:
        if not isinstance(poi, Mapping):
            continue
        rbls = frozenset(_ints(poi.get("relatedStops")))
        lines = frozenset(
            line
            for line in _list(poi.get("relatedLines"))
            if isinstance(line, str) and line
        )
        if not rbls or not lines:
            continue
        time = poi.get("time")
        span = time if isinstance(time, Mapping) else {}
        notices.append(
            StopNotice(
                lines=lines,
                rbls=rbls,
                start=_parse_time(span.get("start")),
                end=_parse_time(span.get("end")),
            )
        )
    return notices


def closed_until(
    notices: Iterable[StopNotice],
    line: str,
    station: SkippedStation,
    now: datetime,
) -> datetime | None:
    """When a skipped station's notice says the stop is back, if it says so clearly.

    A notice counts when it is running now, names the line and one of the
    station's platforms on this route, and names neither neighbour: one
    naming those too is about a stretch or the whole line ("U1: Starke
    Nachfrage" lists all 48 U1 platforms), not this stop. The date stands
    only when exactly one end is left and it is a real one, not an open end.
    """
    ends = {
        notice.end
        for notice in notices
        if _in_force_for(notice, line, now)
        and notice.rbls & station.rbls
        and not notice.rbls & station.neighbour_rbls
    }
    if len(ends) != 1:
        return None
    end = ends.pop()
    if end is None or (end.hour, end.minute) == _OPEN_END:
        return None
    return end


def _in_force_for(notice: StopNotice, line: str, now: datetime) -> bool:
    return (
        line in notice.lines
        and (notice.start is None or notice.start <= now)
        and (notice.end is None or notice.end > now)
    )


class StopNotices:
    """`/newsList`, fetched when needed and held for `STOP_NOTICES_MAX_AGE`."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._notices: list[StopNotice] | None = None
        self._fetched_at: datetime | None = None
        self._not_before: datetime | None = None
        self._in_flight: asyncio.Task[None] | None = None

    async def async_get(self) -> list[StopNotice] | None:
        """The notices, fetching them when stale; None when there are none to give."""
        now = dt_util.utcnow()
        fresh = (
            self._fetched_at is not None
            and now - self._fetched_at < STOP_NOTICES_MAX_AGE
        )
        waiting = self._not_before is not None and now < self._not_before
        if not fresh and not waiting:
            # A finished task is no fetch to join. It can't be dropped from a
            # done callback: HA starts tasks eagerly, so a fetch that never
            # suspends is finished before its callback gets a turn.
            task = self._in_flight
            if task is None or task.done():
                task = self._in_flight = self._hass.async_create_task(
                    self._async_fetch(), name=f"{DOMAIN}_stop_notices"
                )
            # Shielded: a caller that goes away mustn't cancel the others' fetch.
            await asyncio.shield(task)
        return self._notices

    async def _async_fetch(self) -> None:
        try:
            body = await fetch_news(
                async_get_clientsession(self._hass),
                user_agent=USER_AGENT,
                timeout_seconds=STOP_NOTICES_TIMEOUT_SECONDS,
            )
            notices = parse_news(body)
        except (WienerLinienApiError, NewsShapeError) as err:
            # Advisory: the trail still says "no stop", only without a date.
            _LOGGER.debug("Failed to fetch stop notices: %s", err)
            self._not_before = dt_util.utcnow() + STOP_NOTICES_RETRY_AFTER
            return
        self._notices = notices
        self._fetched_at = dt_util.utcnow()
        self._not_before = None


@callback
def async_get_stop_notices(hass: HomeAssistant) -> StopNotices:
    """The instance's notice cache, created on first use."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    cache = domain_data.get(STOP_NOTICES_KEY)
    if not isinstance(cache, StopNotices):
        cache = domain_data[STOP_NOTICES_KEY] = StopNotices(hass)
    return cache


@dataclass(slots=True, frozen=True)
class CallsAt:
    """A skipped station's departures, per line, as one answer gave them."""

    fetched_at: datetime
    line_calls: LineCalls

    @property
    def expires_at(self) -> datetime:
        """When to ask again: before the answer runs short of the departures
        a board shows, within the bounds `const.py` gives."""
        return min(
            max(
                self.line_calls.last - STOP_CALLS_AHEAD,
                self.fetched_at + STOP_CALLS_MIN_AGE,
            ),
            self.fetched_at + STOP_CALLS_MAX_AGE,
        )


@dataclass(slots=True)
class _StationCalls:
    held: CallsAt | None = None
    not_before: datetime | None = None
    in_flight: asyncio.Task[None] | None = None


class StopCalls:
    """Skipped stations' own departures, fetched when a trail needs them."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._stations: dict[int, _StationCalls] = {}

    async def async_get(self, diva: int) -> CallsAt | None:
        """The station's departures, fetching them when due; None if none held.

        An answer past its time is still given while a refetch failed: it
        covers hours ahead, and the card checks each departure against it.
        """
        state = self._stations.setdefault(diva, _StationCalls())
        now = dt_util.utcnow()
        due = state.held is None or now >= state.held.expires_at
        waiting = state.not_before is not None and now < state.not_before
        if due and not waiting:
            # As in StopNotices: a finished task is no fetch to join.
            task = state.in_flight
            if task is None or task.done():
                task = state.in_flight = self._hass.async_create_task(
                    self._async_fetch(diva, state), name=f"{DOMAIN}_stop_calls_{diva}"
                )
            await asyncio.shield(task)
        return state.held

    async def _async_fetch(self, diva: int, state: _StationCalls) -> None:
        started = dt_util.utcnow()
        try:
            body = await async_fetch_trip_body(
                async_get_clientsession(self._hass),
                build_departure_params(
                    diva,
                    STOP_CALLS_DEPARTURES_REQUESTED,
                    excluded_mots=RUN_TIME_EXCLUDED_MOTS,
                ),
                USER_AGENT,
                endpoint=ROUTING_DEPARTURE_ENDPOINT,
            )
            line_calls = parse_line_calls(body, await async_routing_zone())
        except RoutingError as err:
            line_calls = None
            reason = f"{err.translation_key} {err.placeholders}"
        else:
            reason = "no departures in the answer"
        if line_calls is None:
            # Advisory: the trail falls back to the run-time sample.
            _LOGGER.debug("Failed to fetch the calls at stop %s: %s", diva, reason)
            state.not_before = dt_util.utcnow() + STOP_CALLS_RETRY_AFTER
            return
        state.held = CallsAt(fetched_at=started, line_calls=line_calls)
        state.not_before = None


@callback
def async_get_stop_calls(hass: HomeAssistant) -> StopCalls:
    """The instance's cache of skipped stations' departures, created on first use."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    cache = domain_data.get(STOP_CALLS_KEY)
    if not isinstance(cache, StopCalls):
        cache = domain_data[STOP_CALLS_KEY] = StopCalls(hass)
    return cache


def _list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _ints(value: Any) -> Iterable[int]:
    for item in _list(value):
        if isinstance(item, int) and not isinstance(item, bool):
            yield item
        elif isinstance(item, str) and item.isdigit():
            yield int(item)


def _parse_time(value: Any) -> datetime | None:
    """`2026-12-31T23:59:00.000+0100` → aware datetime; None if unreadable."""
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None
