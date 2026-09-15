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
every tick, refetching when the batch gets old or runs low (see
`TimetableBoard.is_due`). A few requests an hour per stop.

A stop's S-Bahn lines are opted into through the line picker like any
other line (`S1|R`), which is also what keeps them in `tracked_lines`, the
list the cards filter departures against.
"""

from __future__ import annotations

import logging
from collections import Counter
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime, tzinfo
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .const import (
    LINE_TYPE_S_BAHN,
    ROUTING_DEPARTURE_ENDPOINT,
    ROUTING_TIME_ZONE,
    TIMETABLE_DEPARTURES_REQUESTED,
    TIMETABLE_MAX_AGE,
    TIMETABLE_MIN_UPCOMING,
    TIMETABLE_PICKER_DEPARTURES,
    TIMETABLE_RETRY_AFTER,
    USER_AGENT,
)
from .rate_limit import async_enforce_routing_cooldown
from .routing import RoutingError, async_fetch_trip_body

_LOGGER = logging.getLogger(__name__)

# EFA `motType` of the S-Bahn (routing.py `_MOT_TYPES`).
_MOT_S_BAHN = "1"
# Every other code the interface defines, excluded server-side so the
# answer carries only trains the boards don't already have.
_EXCLUDED_MOTS = ("0", *(str(code) for code in range(2, 12)))


@dataclass(slots=True, frozen=True)
class PlannedDeparture:
    """One S-Bahn departure from the timetable."""

    line: str
    towards: str
    # `H` / `R`, the same direction code `/monitor` and the line keys use.
    direction: str
    platform: str | None
    planned: datetime


def build_departure_params(diva: int, limit: int) -> list[tuple[str, str]]:
    """Query string for the next `limit` S-Bahn departures at a stop."""
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
    params.extend((f"exclMOT_{code}", "1") for code in _EXCLUDED_MOTS)
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
        stop_id = _text(row.get("stopID"))
        if stop_id is not None and stop_id != str(diva):
            continue
        line = _mapping(row.get("servingLine"))
        label = _text(line.get("number"))
        if label is None or str(line.get("motType") or "") != _MOT_S_BAHN:
            continue
        planned = _parse_date_time(row.get("dateTime"), tz)
        if planned is None:
            continue
        departures.append(
            PlannedDeparture(
                line=label,
                towards=_towards(_text(line.get("direction"))),
                direction=_text(_mapping(line.get("liErgRiProj")).get("direction"))
                or "",
                platform=_text(row.get("platformName")),
                planned=planned,
            )
        )
    departures.sort(key=lambda dep: (dep.planned, dep.line))
    return departures


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
    rows.sort(key=lambda row: (_line_number(row["line"]), row["line"], row["towards"]))
    return rows


async def async_fetch_planned_departures(
    hass: HomeAssistant, diva: int, limit: int
) -> list[PlannedDeparture]:
    """Fetch and parse one stop's upcoming S-Bahn departures.

    Raises `RoutingError` on any failure. No cooldown: `TimetableBoard`
    takes the routing slot for the unattended refresh, and the config
    flow's picker probe doesn't, for the reason given at
    `config_flow._probe_monitor_lines`.
    """
    zone = await dt_util.async_get_time_zone(ROUTING_TIME_ZONE) or dt_util.UTC
    body = await async_fetch_trip_body(
        async_get_clientsession(hass),
        build_departure_params(diva, limit),
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

    def __init__(self, hass: HomeAssistant, diva: int) -> None:
        """Start empty; the first `is_due` asks for a fetch."""
        self._hass = hass
        self._diva = diva
        self._departures: tuple[PlannedDeparture, ...] = ()
        self._fetched_at: datetime | None = None
        self._attempted_at: datetime | None = None
        # Latch so a lasting failure logs once, not every five minutes.
        self._failing = False

    @property
    def departures(self) -> tuple[PlannedDeparture, ...]:
        """The last fetched batch, including rows that have since left."""
        return self._departures

    @property
    def fetched_at(self) -> datetime | None:
        """When the current batch was fetched (diagnostics)."""
        return self._fetched_at

    def is_due(self, now: datetime) -> bool:
        """Whether the batch should be refetched at `now`.

        Never within `TIMETABLE_RETRY_AFTER` of the last attempt, success or
        not. Otherwise when nothing was fetched yet, when the batch is older
        than `TIMETABLE_MAX_AGE` (a replacement timetable can be published
        within the day), or when fewer than `TIMETABLE_MIN_UPCOMING` rows are
        still ahead. A short batch at night keeps asking every few minutes;
        the server returns the next morning's trains by then, so that ends
        after one request.
        """
        if (
            self._attempted_at is not None
            and now - self._attempted_at < TIMETABLE_RETRY_AFTER
        ):
            return False
        if self._fetched_at is None or now - self._fetched_at >= TIMETABLE_MAX_AGE:
            return True
        upcoming = sum(1 for dep in self._departures if dep.planned >= now)
        return upcoming < TIMETABLE_MIN_UPCOMING

    async def async_refresh(self) -> bool:
        """Refetch the batch; True when it was replaced.

        A failure keeps the previous batch: planned times stay right until
        they pass, which beats emptying the board over one timeout.
        """
        await async_enforce_routing_cooldown(self._hass)
        self._attempted_at = dt_util.utcnow()
        try:
            departures = await async_fetch_planned_departures(
                self._hass, self._diva, TIMETABLE_DEPARTURES_REQUESTED
            )
        except RoutingError as err:
            if not self._failing:
                self._failing = True
                _LOGGER.warning(
                    "S-Bahn timetable for stop %s unavailable: %s %s. "
                    "Retrying quietly until it answers again.",
                    self._diva,
                    err.translation_key,
                    err.placeholders,
                )
            return False
        if self._failing:
            self._failing = False
            _LOGGER.info("S-Bahn timetable for stop %s is back", self._diva)
        self._fetched_at = self._attempted_at
        self._departures = tuple(departures)
        return True


def _has_stop_invalid(message: Any) -> bool:
    """Whether an EFA name/value message list carries code -2000."""
    return isinstance(message, list) and any(
        isinstance(item, Mapping)
        and item.get("name") == "code"
        and str(item.get("value")) == "-2000"
        for item in message
    )


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


def _line_number(label: str) -> int:
    """`S45` → 45, so the picker lists S2 before S45."""
    digits = label[1:]
    return int(digits) if digits.isdigit() else 0


def _mapping(value: Any) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def _text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
