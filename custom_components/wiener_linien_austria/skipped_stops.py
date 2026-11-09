"""Stations a ride passes without calling there, and until when.

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
skips.

The date the stop is back comes from `/newsList`, and only when one notice
answers it without doubt (see `closed_until`). The list is fetched on demand
like the run times: only when an answer has a skipped station, at most every
`STOP_NOTICES_MAX_AGE`, callers asking at once sharing one request. It takes
no domain cooldown slot, for the reason `rate_limit.py` gives for the run
times: someone has just opened a trail and is waiting.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .api import WienerLinienApiError, fetch_news
from .const import (
    DOMAIN,
    STOP_NOTICES_MAX_AGE,
    STOP_NOTICES_RETRY_AFTER,
    STOP_NOTICES_TIMEOUT_SECONDS,
    USER_AGENT,
)
from .static import StaticCatalogue

_LOGGER = logging.getLogger(__name__)

STOP_NOTICES_KEY: Final = "stop_notices"

# The wall-clock end Wiener Linien gives a notice that has no real end: a
# moved bus stop or a missing lift "until" 11:11 on some date years out.
_OPEN_END: Final = (11, 11)


@dataclass(slots=True, frozen=True)
class SkippedStation:
    """A station a line's route passes without the timetable calling there."""

    # The route's platforms there, and those of the stations either side,
    # where the train does call.
    rbls: frozenset[int]
    neighbour_rbls: frozenset[int]


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
    patterns = catalogue.trip_patterns
    if patterns is None or direction not in ("H", "R"):
        return {}
    line_id = patterns.lines_by_label.get(line)
    if line_id is None:
        return {}
    wanted = 1 if direction == "H" else 2
    index = catalogue.index_by_rbl()
    calls = {**minutes, board_diva: 0.0}
    found: dict[str, tuple[set[int], set[int]]] = {}
    for pattern in patterns.patterns_by_line.get(line_id, ()):
        if pattern.direction != wanted:
            continue
        stops = [(rbl, index.get(rbl)) for rbl in pattern.stops]
        divas = [entry[0] if entry else None for _, entry in stops]
        if board_diva not in divas:
            continue
        for at in range(divas.index(board_diva) + 1, len(stops) - 1):
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
            platforms, neighbours = found.setdefault(entry[1], (set(), set()))
            platforms.add(rbl)
            neighbours.update((stops[at - 1][0], stops[at + 1][0]))
    return {
        name: SkippedStation(frozenset(rbls), frozenset(neighbours))
        for name, (rbls, neighbours) in found.items()
    }


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
        if line in notice.lines
        and notice.rbls & station.rbls
        and not notice.rbls & station.neighbour_rbls
        and (notice.start is None or notice.start <= now)
        and (notice.end is None or notice.end > now)
    }
    if len(ends) != 1:
        return None
    end = ends.pop()
    if end is None or (end.hour, end.minute) == _OPEN_END:
        return None
    return end


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
