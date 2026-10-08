"""Planned S-Bahn departures for a departure board.

`/monitor` lists only Wiener Linien's own lines, so a board at Praterstern
shows the U1 and the trams but no S-Bahn. The routing server (a Mentz EFA,
see routing.py) also answers departure-monitor requests
(`XML_DM_REQUEST`) for the same stop IDs, and those include the S-Bahn,
with platform, on the published timetable. There are no live times: every
row carries `realtime: "0"`, so the boards mark these rows as timetable
rows rather than passing them off as live.

The rows are planned times, so they don't need `/monitor`'s cadence. A
board fetches a batch of upcoming trains and counts them down locally on
every tick, refetching when the batch gets old or the board's picked
lines run low (see `TimetableBoard.is_due`). Normally one request per
`TIMETABLE_MAX_AGE` per stop.

A stop's S-Bahn lines are opted into through the line picker like any
other line (`S1|R`), which is also what keeps them in `tracked_lines`, the
list the cards filter departures against.

The same request, asked for other modes, is where the scheduled run times
to the stops ahead come from (`parse_run_times`, used by run_times.py).
"""

from __future__ import annotations

import logging
from collections import Counter
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime, tzinfo
from statistics import median
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .const import (
    GTFS_LINE_LABEL_ALIASES,
    LINE_TYPE_S_BAHN,
    ROUTING_DEPARTURE_ENDPOINT,
    TIMETABLE_DEPARTURES_REQUESTED,
    TIMETABLE_MAX_AGE,
    TIMETABLE_MIN_UPCOMING,
    TIMETABLE_PICKER_DEPARTURES,
    TIMETABLE_RETRY_AFTER,
    USER_AGENT,
)
from .parsing import as_mapping, as_text, s_bahn_number
from .rate_limit import async_enforce_routing_cooldown, backoff_delay
from .routing import (
    RoutingError,
    async_fetch_trip_body,
    async_routing_zone,
    parse_compact_stamp,
)

_LOGGER = logging.getLogger(__name__)

# EFA `motType` of the S-Bahn (routing.py `_MOT_TYPES`).
_MOT_S_BAHN = "1"
# Every other code the interface defines, excluded server-side so the
# answer carries only trains the boards don't already have.
_EXCLUDED_MOTS = ("0", *(str(code) for code in range(2, 12)))


@dataclass(slots=True, frozen=True)
class PlannedStop:
    """A stop a train calls at after this one."""

    name: str
    # The stop's DIVA, which joins it to the Wiener Linien catalogue for
    # transfer lines. None when the server sends none.
    stop_id: int | None
    # Scheduled minutes from this train's departure here to its arrival
    # there. None when the request didn't say when the train leaves, or the
    # server sent no time for the stop.
    minutes: int | None = None


@dataclass(slots=True, frozen=True)
class PlannedDeparture:
    """One S-Bahn departure from the timetable."""

    line: str
    towards: str
    # `H` / `R`, the same direction code `/monitor` and the line keys use.
    direction: str
    platform: str | None
    planned: datetime
    # The stops still ahead, down to the terminus. Empty when the request
    # didn't ask for them (the line picker's probe).
    stops: tuple[PlannedStop, ...] = ()


def build_departure_params(
    diva: int,
    limit: int,
    *,
    with_stops: bool = False,
    at: datetime | None = None,
    excluded_mots: Sequence[str] = _EXCLUDED_MOTS,
) -> list[tuple[str, str]]:
    """Query string for the next `limit` S-Bahn departures at a stop.

    `excluded_mots` are the EFA mode codes to leave out, by default all but
    the S-Bahn. run_times.py asks for the U-Bahn, trams and buses instead.

    `with_stops` adds each train's stop sequence (`includeCompleteStopSeq`),
    for the stops-ahead trail. It costs about 10 KB per train before gzip,
    because the server sends the stops already passed too, so the line
    picker's probe, which only needs the lines, leaves it off.

    `at` asks for departures from that time instead of from now. Its wall
    clock is sent as-is, so pass it in `ROUTING_TIME_ZONE`.
    """
    params: list[tuple[str, str]] = [
        ("outputFormat", "JSON"),
        ("language", "de"),
        ("type_dm", "stopID"),
        ("name_dm", str(diva)),
        ("mode", "direct"),
        ("limit", str(limit)),
        ("useRealtime", "1"),
        ("depType", "stopEvents"),
        ("excludedMeans", "checkbox"),
    ]
    params.extend((f"exclMOT_{code}", "1") for code in excluded_mots)
    if with_stops:
        params.append(("includeCompleteStopSeq", "1"))
    if at is not None:
        params.append(("itdDate", at.strftime("%Y%m%d")))
        params.append(("itdTime", at.strftime("%H%M")))
    return params


def parse_departure_body(
    body: Mapping[str, Any], diva: int, tz: tzinfo
) -> list[PlannedDeparture]:
    """S-Bahn departures at `diva` out of a departure-monitor answer.

    Raises `RoutingError("route_stop_invalid")` when the server doesn't
    know the stop (-2000 on the `dm` block, with no `departureList`). A
    known stop without S-Bahn is an empty list. Rows for another stop or
    another mode are skipped even though the request already excludes
    them, and so is anything without a line or a readable time.
    """
    dm = body.get("dm")
    if isinstance(dm, Mapping) and _has_stop_invalid(dm.get("message")):
        raise RoutingError("route_stop_invalid", {"which": "dm"})
    raw = body.get("departureList")
    if isinstance(raw, Mapping):
        # EFA collapses a one-element list into `{"departure": {...}}`.
        raw = [raw.get("departure")]
    if not isinstance(raw, list):
        return []
    departures: list[PlannedDeparture] = []
    for row in raw:
        if not isinstance(row, Mapping):
            continue
        stop_id = as_text(row.get("stopID"))
        if stop_id is not None and stop_id != str(diva):
            continue
        line = as_mapping(row.get("servingLine"))
        label = as_text(line.get("number"))
        if label is None or str(line.get("motType") or "") != _MOT_S_BAHN:
            continue
        planned = _parse_date_time(row.get("dateTime"), tz)
        if planned is None:
            continue
        departures.append(
            PlannedDeparture(
                line=label,
                towards=_towards(as_text(line.get("direction"))),
                direction=as_text(as_mapping(line.get("liErgRiProj")).get("direction"))
                or "",
                platform=as_text(row.get("platformName")),
                planned=planned,
                stops=_onward_stops(row.get("onwardStopSeq"), planned),
            )
        )
    departures.sort(key=lambda dep: (dep.planned, dep.line))
    return departures


def parse_calling_points(body: Mapping[str, Any]) -> dict[int, set[str]]:
    """Every stop each S-Bahn line in a departure-monitor answer calls at.

    Reads the whole run of every train, the stops before this one
    (`prevStopSeq`) as well as after, so a hub's departures map its lines in
    both directions. Keyed by DIVA; points without a numeric id are skipped,
    since nothing could join them to a stop. Unlike `parse_departure_body`
    the rows aren't filtered to the asked stop: any train's run is true
    wherever the server lists it.
    """
    raw = body.get("departureList")
    if isinstance(raw, Mapping):
        raw = [raw.get("departure")]
    if not isinstance(raw, list):
        return {}
    lines_at: dict[int, set[str]] = {}
    for row in raw:
        if not isinstance(row, Mapping):
            continue
        line = as_mapping(row.get("servingLine"))
        label = as_text(line.get("number"))
        if label is None or str(line.get("motType") or "") != _MOT_S_BAHN:
            continue
        stop_ids = [
            stop.stop_id
            for sequence in ("prevStopSeq", "onwardStopSeq")
            for stop in _onward_stops(row.get(sequence))
        ]
        own = as_text(row.get("stopID"))
        if own is not None and own.isdigit():
            stop_ids.append(int(own))
        for stop_id in stop_ids:
            if stop_id is not None:
                lines_at.setdefault(stop_id, set()).add(label)
    return lines_at


def parse_run_times(
    body: Mapping[str, Any], tz: tzinfo
) -> dict[tuple[str, str], dict[int, int]]:
    """Scheduled minutes to every stop ahead, per line and direction.

    Out of a departure-monitor answer with stop sequences, for any mode:
    `(line, direction)` → DIVA → minutes from departing here. Each row is one
    vehicle's run; the median over a pair's rows evens out the minute the
    timetable's rounding moves a stop by from one departure to the next. A
    median of x.5 rounds up: Python's round-half-even would put two stops
    in a row on the same minute (1.5 and 2.5 both giving 2).
    Runs that end early (a U1 to Alaudagasse among Oberlaa trains) simply
    contribute fewer stops. A stop a run passes twice counts once, at its
    first call.

    The label is mapped onto `/monitor`'s where the two differ, so the
    Badner Bahn comes out as "WLB". Rows without a line, a direction or a
    readable time are skipped, and so are points without a numeric id.
    """
    raw = body.get("departureList")
    if isinstance(raw, Mapping):
        raw = [raw.get("departure")]
    if not isinstance(raw, list):
        return {}
    samples: dict[tuple[str, str], dict[int, list[int]]] = {}
    for row in raw:
        if not isinstance(row, Mapping):
            continue
        line = as_mapping(row.get("servingLine"))
        label = as_text(line.get("number"))
        direction = as_text(as_mapping(line.get("liErgRiProj")).get("direction"))
        departs = _parse_date_time(row.get("dateTime"), tz)
        if label is None or direction is None or departs is None:
            continue
        label = GTFS_LINE_LABEL_ALIASES.get(label, label)
        per_stop = samples.setdefault((label, direction), {})
        seen: set[int] = set()
        for stop in _onward_stops(row.get("onwardStopSeq"), departs):
            if stop.stop_id is None or stop.minutes is None or stop.stop_id in seen:
                continue
            seen.add(stop.stop_id)
            per_stop.setdefault(stop.stop_id, []).append(stop.minutes)
    return {
        pair: {diva: int(median(minutes) + 0.5) for diva, minutes in per_stop.items()}
        for pair, per_stop in samples.items()
        if per_stop
    }


def picker_rows(departures: list[PlannedDeparture]) -> list[dict[str, str]]:
    """One line-picker row per S-Bahn line and direction.

    Same shape as the config flow's `/monitor` probe. A direction with
    several termini (S2 towards Wolkersdorf or Mistelbach) is labelled
    with the one it serves most often in the sample.
    """
    termini: dict[tuple[str, str], Counter[str]] = {}
    for dep in departures:
        if dep.direction:
            termini.setdefault((dep.line, dep.direction), Counter())[dep.towards] += 1
    rows = [
        {
            "key": f"{line}|{direction}",
            "line": line,
            "towards": counts.most_common(1)[0][0],
            "direction": direction,
            "type": LINE_TYPE_S_BAHN,
        }
        for (line, direction), counts in termini.items()
    ]
    rows.sort(key=lambda row: (s_bahn_number(row["line"]), row["line"], row["towards"]))
    return rows


async def async_fetch_planned_departures(
    hass: HomeAssistant, diva: int, limit: int, *, with_stops: bool = False
) -> list[PlannedDeparture]:
    """Fetch and parse one stop's upcoming S-Bahn departures.

    Raises `RoutingError` on any failure. No cooldown: `TimetableBoard`
    takes the routing slot for the unattended refresh, and the config
    flow's picker probe doesn't, for the reason given at
    `config_flow._probe_monitor_lines`.
    """
    zone = await async_routing_zone()
    body = await async_fetch_trip_body(
        async_get_clientsession(hass),
        build_departure_params(diva, limit, with_stops=with_stops),
        USER_AGENT,
        endpoint=ROUTING_DEPARTURE_ENDPOINT,
    )
    return parse_departure_body(body, diva, zone)


async def async_probe_picker_rows(
    hass: HomeAssistant, diva: int
) -> list[dict[str, str]]:
    """The S-Bahn lines at a stop, for the line picker. Empty on any failure.

    A failure costs the user the S-Bahn options, not the dialog: the
    Wiener Linien lines still come from `/monitor` and the catalogue.
    """
    try:
        departures = await async_fetch_planned_departures(
            hass, diva, TIMETABLE_PICKER_DEPARTURES
        )
    except RoutingError as err:
        _LOGGER.warning(
            "S-Bahn line probe failed for stop %s: %s %s",
            diva,
            err.translation_key,
            err.placeholders,
        )
        return []
    return picker_rows(departures)


class TimetableBoard:
    """One stop's planned S-Bahn departures, refreshed as they run out."""

    def __init__(
        self, hass: HomeAssistant, diva: int, pairs: frozenset[tuple[str, str]]
    ) -> None:
        """Start empty; the first `is_due` asks for a fetch.

        `pairs` are the (line, direction) keys this stop's board shows,
        the same set `coordinator.timetable_departures` filters with. The
        request cannot narrow to them — it selects a mode, not a line — so
        they are applied here instead, to keep `is_due` counting the trains
        that reach the board rather than every S-Bahn train at the stop.
        """
        self._hass = hass
        self._diva = diva
        self._pairs = pairs
        self._departures: tuple[PlannedDeparture, ...] = ()
        self._fetched_at: datetime | None = None
        self._attempted_at: datetime | None = None
        # The last answer held every train the server had, not just the
        # first TIMETABLE_DEPARTURES_REQUESTED of them.
        self._complete = False
        # Tracked trains the last answer carried, which is what the board
        # could show at the moment it was fetched. See `is_due` for why a
        # batch that started at or below the threshold disables the
        # running-low rule instead of tripping it immediately.
        self._tracked_at_fetch = 0
        # Failures since the last answer; each one widens `_retry_spacing`.
        # Its non-zero value is also the latch that logs a lasting failure
        # once rather than on every retry.
        self._failures = 0
        self._retry_spacing = TIMETABLE_RETRY_AFTER

    @property
    def departures(self) -> tuple[PlannedDeparture, ...]:
        """The last fetched batch, including rows that have since left."""
        return self._departures

    @property
    def fetched_at(self) -> datetime | None:
        """When the current batch was fetched (diagnostics)."""
        return self._fetched_at

    def _tracked_upcoming(self, now: datetime) -> int:
        """Trains still ahead that this board's picked lines would show."""
        return sum(
            1
            for dep in self._departures
            if dep.planned >= now and (dep.line, dep.direction) in self._pairs
        )

    def is_due(self, now: datetime) -> bool:
        """Whether the batch should be refetched at `now`.

        Never within the retry spacing of the last attempt: `TIMETABLE_RETRY_AFTER`
        after an answer, doubling with each failure in a row up to the shared
        backoff cap (`rate_limit.backoff_delay`). Otherwise when nothing was
        fetched yet, when the batch is older than `TIMETABLE_MAX_AGE` (a
        replacement timetable can be published within the day), or when the
        board is running low.

        Running low counts the picked lines, not the batch. A stop served by
        several S-Bahn lines spends most of its answer on trains the board
        discards, so counting the batch measured a pool several times larger
        than what the user sees and left a board sitting on its last row or
        two while the batch still looked full.

        Two guards keep that from turning into a refetch every five minutes
        at a stop that simply has no more to give, since neither a closure
        nor a line that has finished for the day can be told apart from a
        drained board by the count alone:

        * `_complete` — the server cut nothing, so it has handed over
          everything it had and asking again adds no train.
        * `_tracked_at_fetch` at or below the threshold — the answer was
          already this thin for these lines when it arrived, so the batch
          is not what is short, the stop is. Only the age rule refetches
          such a board.
        """
        if (
            self._attempted_at is not None
            and now - self._attempted_at < self._retry_spacing
        ):
            return False
        if self._fetched_at is None or now - self._fetched_at >= TIMETABLE_MAX_AGE:
            return True
        if self._complete or self._tracked_at_fetch <= TIMETABLE_MIN_UPCOMING:
            return False
        return self._tracked_upcoming(now) < TIMETABLE_MIN_UPCOMING

    async def async_refresh(self) -> bool:
        """Refetch the batch; True when it was replaced.

        A failure keeps the previous batch: planned times stay right until
        they pass, which beats emptying the board over one timeout.
        """
        await async_enforce_routing_cooldown(self._hass)
        self._attempted_at = dt_util.utcnow()
        try:
            departures = await async_fetch_planned_departures(
                self._hass,
                self._diva,
                TIMETABLE_DEPARTURES_REQUESTED,
                with_stops=True,
            )
        except RoutingError as err:
            self._failures += 1
            self._retry_spacing = backoff_delay(
                TIMETABLE_RETRY_AFTER, self._failures, jitter=True
            )
            if self._failures == 1:
                _LOGGER.warning(
                    "S-Bahn timetable for stop %s unavailable: %s %s. "
                    "Retrying quietly, less often the longer it lasts.",
                    self._diva,
                    err.translation_key,
                    err.placeholders,
                )
            return False
        if self._failures:
            self._failures = 0
            self._retry_spacing = TIMETABLE_RETRY_AFTER
            _LOGGER.info("S-Bahn timetable for stop %s is back", self._diva)
        self._fetched_at = self._attempted_at
        self._departures = tuple(departures)
        self._complete = len(departures) < TIMETABLE_DEPARTURES_REQUESTED
        self._tracked_at_fetch = sum(
            1 for dep in departures if (dep.line, dep.direction) in self._pairs
        )
        return True


def _has_stop_invalid(message: Any) -> bool:
    """Whether an EFA name/value message list carries code -2000."""
    return isinstance(message, list) and any(
        isinstance(item, Mapping)
        and item.get("name") == "code"
        and str(item.get("value")) == "-2000"
        for item in message
    )


def _onward_stops(raw: Any, departs: datetime | None = None) -> tuple[PlannedStop, ...]:
    """The stops after this one, named the way the boards name a terminus.

    A single onward stop arrives as a bare point, not a one-element list.

    With `departs`, the train's departure here, each stop also gets the
    scheduled minutes until it arrives there (`ref.arrDateTime`, or the
    departure where the server gives no arrival). A time before `departs`
    is dropped rather than shown as a negative run.
    """
    if isinstance(raw, Mapping):
        raw = [raw]
    if not isinstance(raw, list):
        return ()
    stops: list[PlannedStop] = []
    for point in raw:
        if not isinstance(point, Mapping):
            continue
        name = _towards(as_text(point.get("name")))
        if not name:
            continue
        ref = as_mapping(point.get("ref"))
        stop_id = as_text(ref.get("id"))
        stops.append(
            PlannedStop(
                name=name,
                stop_id=int(stop_id) if stop_id and stop_id.isdigit() else None,
                minutes=_minutes_after(departs, ref),
            )
        )
    return tuple(stops)


def _minutes_after(departs: datetime | None, ref: Mapping[str, Any]) -> int | None:
    """Whole minutes from `departs` to the arrival a stop's `ref` gives."""
    if departs is None:
        return None
    arrives = parse_compact_stamp(
        ref.get("arrDateTime") or ref.get("depDateTime"), departs.tzinfo
    )
    if arrives is None or arrives < departs:
        return None
    return round((arrives - departs).total_seconds() / 60)


def _parse_date_time(raw: Any, tz: tzinfo) -> datetime | None:
    """`{year, month, day, hour, minute}` in the server's zone → aware datetime."""
    if not isinstance(raw, Mapping):
        return None
    try:
        return datetime(
            int(raw["year"]),
            int(raw["month"]),
            int(raw["day"]),
            int(raw["hour"]),
            int(raw["minute"]),
            tzinfo=tz,
        )
    except (KeyError, TypeError, ValueError):
        return None


def _towards(direction: str | None) -> str:
    """A terminus as the boards print one: `Wien Floridsdorf` → `Floridsdorf`.

    Drops the `Wien ` place prefix and a trailing ` Bahnhof`, which every
    S-Bahn terminus outside Vienna carries (`Gänserndorf Bahnhof`). A
    `Hauptbahnhof` is a different word and stays.
    """
    if direction is None:
        return ""
    name = direction
    if name.startswith("Wien ") and len(name) > len("Wien "):
        name = name[len("Wien ") :]
    return name.removesuffix(" Bahnhof")
