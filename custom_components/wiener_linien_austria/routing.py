"""A→B connection planning against the Wiener Linien OGD routing service.

The routing service is a Mentz EFA server (`ogd_routing/XML_TRIP_REQUEST2`,
interface described in "Beschreibung der EFA XML-Schnittstelle", Wiener
Linien OGD, 2013). It does the actual routing server-side, so this module
never searches a timetable itself. The interface carries realtime-adjusted
times (`rtTime`) and they are used when the upstream supplies them, but none
were observed (every leg had `rtTime == time` on 2026-09-14 and 2026-09-15,
and `XML_DM_REQUEST` reported `realtime: "0"` even for U-Bahn lines
`/monitor` shows live). Live times come from `/monitor` instead, matched
onto the parsed rides in live.py, which re-scores the changes with them.
Its job is the three things the server does not do:

1. **Parse** the JSON variant (`outputFormat=JSON`) into typed trips. The
   server stamps Vienna wall-clock time with no offset, regardless of Home
   Assistant's own zone.
2. **Score transfer risk.** For every change between two vehicles the slack
   is `next departure - previous arrival - transfer walk`, using realtime
   times where the server supplies them. The server happily plans a connection
   with zero slack (U3 → U1 at Stephansplatz: arrive 08:04, 4 min walk,
   depart 08:08), which is exactly the connection a two-minute delay breaks.
3. **Drop dominated connections** (Pareto over departure, arrival, number
   of changes and transfer risk), so a later but safer connection survives
   while one that leaves earlier, arrives later and changes more does not.

Why not a local router (RAPTOR / CSA) over the published GTFS: the timetable
is ~7.8 M `stop_times` rows, Wiener Linien publishes no trip-wide realtime
feed to patch delays in with, and walking legs need the street graph the
EFA server already has. Measured and decided 2026-09-14.
"""

from __future__ import annotations

import logging
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta, tzinfo
from typing import Any, Final, Literal

import aiohttp
from homeassistant.util import dt as dt_util

from .const import (
    CONF_EXCLUDED_MEANS,
    CONF_MAX_CHANGES,
    CONF_MIN_TRANSFER_MINUTES,
    CONF_ROUTE_TYPE,
    CONF_STEP_FREE,
    CONF_WALK_SPEED,
    DEFAULT_MIN_TRANSFER_MINUTES,
    DEFAULT_ROUTE_TYPE,
    DEFAULT_WALK_SPEED,
    EXCLUDABLE_MEANS,
    MAX_CHANGES_ANY,
    ROUTE_TYPES,
    ROUTING_BASE_URL,
    ROUTING_REQUEST_TIMEOUT_SECONDS,
    ROUTING_TIME_ZONE,
    ROUTING_TRIP_ENDPOINT,
    ROUTING_TRIPS_REQUESTED,
    WEEKDAYS,
)
from .http import base_request_headers
from .parsing import as_mapping, as_text

_LOGGER = logging.getLogger(__name__)

RiskLevel = Literal["ok", "tight", "at_risk"]
_RISK_RANK: Final[dict[str, int]] = {"ok": 0, "tight": 1, "at_risk": 2}

# EFA `motType` (the `code` on a leg's `mode`) → the vehicle-type vocabulary
# the cards already speak (`ptMetro` etc., see const.LINE_TYPE_*), extended
# with the modes a route can use that a Wiener Linien stop board never
# shows. Codes per the interface description, §5.2 "Fahrtoptionen (6)".
_MOT_TYPES: Final[dict[str, str]] = {
    "0": "ptTrain",
    "1": "ptTrainS",
    "2": "ptMetro",
    "3": "ptTram",  # Stadtbahn — the Badner Bahn (WLB)
    "4": "ptTram",
    "5": "ptBusCity",
    "6": "ptBusRegion",
    "7": "ptBusRegion",
    "8": "ptCableCar",
    "9": "ptShip",
    "10": "ptBusOnDemand",
}
# EFA marks walking legs with these mode `type` values (99 = footpath,
# 100 = walking to/from a stop, 105 = "Umstieg" transfer walk). Not seen in
# stop-to-stop answers so far — transfers arrive as a `footpath` block on
# the arriving leg instead — but handled so a changed answer shape degrades
# into a walk leg rather than a nameless vehicle.
_WALK_MODE_TYPES: Final = frozenset({"99", "100", "105"})

# The impaired-mobility options that make the server plan step-free
# (verified 2026-09-14 and 2026-09-15: the answer reroutes, echoes the flags
# in `option.ptOption`, and adds walk legs whose footpath elements name the
# lifts). `noElevators` stays off, since lifts are the point.
_STEP_FREE_PARAMS: Final = (
    ("imparedOptionsActive", "1"),
    ("wheelchair", "on"),
    ("noSolidStairs", "on"),
    ("noEscalators", "on"),
    ("lowPlatformVhcl", "on"),
)

# Error codes seen from the live service (2026-09-14) and the interface
# description. Anything else still raises, with the raw code shown.
ERR_STOP_INVALID: Final = -2000
ERR_TOO_CLOSE: Final = -4007
ERR_OUTSIDE_TIMETABLE: Final = -4001

# Answers about the stops themselves. Asking again can't change them: the
# setup dialog shows them as form errors, the route card stops retrying.
ROUTE_STOP_ERRORS: Final = frozenset({"route_stop_invalid", "route_too_close"})
# Answers about the query that won't change within minutes either. The route
# card doesn't retry these on its short cadence.
ROUTE_QUERY_ERRORS: Final = ROUTE_STOP_ERRORS | {"route_outside_timetable"}


class RoutingError(Exception):
    """A routing request failed; carries a translation key for the caller."""

    def __init__(
        self,
        translation_key: str,
        placeholders: Mapping[str, str] | None = None,
    ) -> None:
        """Store the translation key and its placeholders."""
        super().__init__(translation_key)
        self.translation_key = translation_key
        self.placeholders: dict[str, str] = dict(placeholders or {})


def route_type_option(value: object) -> str:
    """A stored or requested route type as one of `ROUTE_TYPES`.

    Case-insensitive, so a route saved with the upper-case EFA spelling still
    loads and still shares cache entries with a lower-case request. Anything
    unrecognised takes the default rather than reaching the server.
    """
    folded = str(value or "").strip().lower()
    return folded if folded in ROUTE_TYPES else DEFAULT_ROUTE_TYPE


@dataclass(slots=True, frozen=True)
class RouteOptions:
    """What a route entry asks the server for, independent of the time."""

    origin_diva: int
    destination_diva: int
    route_type: str = DEFAULT_ROUTE_TYPE
    max_changes: str = MAX_CHANGES_ANY
    walk_speed: str = DEFAULT_WALK_SPEED
    excluded_means: tuple[str, ...] = ()
    min_transfer_minutes: int = DEFAULT_MIN_TRANSFER_MINUTES
    step_free: bool = False

    @classmethod
    def from_config(
        cls, origin_diva: int, destination_diva: int, config: Mapping[str, Any]
    ) -> RouteOptions:
        """Build options from a route entry, the setup form or a card request.

        All three name the fields alike. A missing, empty or unknown route
        type takes its default and an unknown means of transport is dropped,
        so an entry saved by an older version still loads.
        """
        raw_transfer = config.get(CONF_MIN_TRANSFER_MINUTES)
        try:
            min_transfer = (
                DEFAULT_MIN_TRANSFER_MINUTES
                if raw_transfer is None
                else int(raw_transfer)
            )
        except (TypeError, ValueError):
            min_transfer = DEFAULT_MIN_TRANSFER_MINUTES
        return cls(
            origin_diva=origin_diva,
            destination_diva=destination_diva,
            route_type=route_type_option(config.get(CONF_ROUTE_TYPE)),
            max_changes=str(config.get(CONF_MAX_CHANGES) or MAX_CHANGES_ANY),
            walk_speed=str(config.get(CONF_WALK_SPEED) or DEFAULT_WALK_SPEED),
            excluded_means=tuple(
                EXCLUDABLE_MEANS[name]
                for name in config.get(CONF_EXCLUDED_MEANS) or ()
                if name in EXCLUDABLE_MEANS
            ),
            min_transfer_minutes=min_transfer,
            step_free=config.get(CONF_STEP_FREE) is True,
        )


@dataclass(slots=True, frozen=True)
class RouteStop:
    """One end of a leg: where and when."""

    name: str
    stop_id: str | None
    platform: str | None
    planned: datetime | None
    estimated: datetime | None

    @property
    def effective(self) -> datetime | None:
        """Realtime time when the server has one, else the timetable."""
        return self.estimated or self.planned

    @property
    def delay_minutes(self) -> int | None:
        """Minutes late (negative = early), or None without both times."""
        if self.planned is None or self.estimated is None:
            return None
        return round((self.estimated - self.planned).total_seconds() / 60)

    def to_dict(self) -> dict[str, Any]:
        """Render for sensor attributes and action responses."""
        return {
            "name": self.name,
            "stop_id": self.stop_id,
            "platform": self.platform,
            "planned": _iso(self.planned),
            "estimated": _iso(self.estimated),
            "delay_minutes": self.delay_minutes,
        }


@dataclass(slots=True, frozen=True)
class LegStop:
    """A stop a ride passes between boarding and alighting."""

    name: str
    stop_id: str | None
    time: datetime | None

    def to_dict(self) -> dict[str, Any]:
        """Render compactly: four trips of these sit in one attribute."""
        return {"name": self.name, "stop_id": self.stop_id, "time": _iso(self.time)}


@dataclass(slots=True, frozen=True)
class AccessStep:
    """A lift, stairs or ramp on the way to, from or between platforms.

    From the EFA `footpathElem` list. `kind` is the upstream `type`
    lower-cased (`elevator`, `stairs`, `escalator`, `ramp`, …), `level` is
    `up` or `down` where the server says, and `stop_id` the DIVA of the
    station it belongs to, which is how a lift outage is matched to it.
    """

    kind: str
    level: str | None
    stop_id: str | None

    def to_dict(self) -> dict[str, Any]:
        """Render for sensor attributes and action responses."""
        return {"kind": self.kind, "level": self.level, "stop_id": self.stop_id}


@dataclass(slots=True, frozen=True)
class RouteLeg:
    """A ride on one vehicle, or a walk."""

    walk: bool
    line: str | None
    type: str | None
    product: str | None
    towards: str | None
    origin: RouteStop
    destination: RouteStop
    realtime: bool
    stop_count: int
    # Transfer walk the server attached to the END of this leg (the EFA
    # `footpath` block with `position: AFTER`), in minutes.
    walk_after_minutes: int
    cancelled: bool = False
    # `H` / `R` from `mode.diva.dir`, the same code `/monitor` uses.
    direction: str | None = None
    # Run by Wiener Linien (`mode.diva.opPublicCode == "WL"`), so `/monitor`
    # can know it. S-Bahn and ÖBB rides can't get live times.
    wiener_linien: bool = False
    # From `/monitor` (live.py): the departures after this one, and how many
    # minutes apart the line typically runs here.
    next_departures: tuple[datetime, ...] = ()
    headway_minutes: int | None = None
    # The server plans this ride with a low-floor vehicle
    # (`attrs: PlanLowFloorVehicle`).
    low_floor: bool = False
    # Lifts and stairs on this leg's own walk (a walk leg's footpath), and on
    # the transfer walk after it (a ride's `AFTER` footpath).
    access: tuple[AccessStep, ...] = ()
    access_after: tuple[AccessStep, ...] = ()
    # The stops in between, from `stopSeq` without its two ends.
    stops: tuple[LegStop, ...] = ()

    @property
    def duration_minutes(self) -> int | None:
        """Ride time from effective departure to effective arrival."""
        start, end = self.origin.effective, self.destination.effective
        if start is None or end is None:
            return None
        return round((end - start).total_seconds() / 60)

    def to_dict(self) -> dict[str, Any]:
        """Render for sensor attributes and action responses."""
        return {
            "walk": self.walk,
            "line": self.line,
            "type": self.type,
            "product": self.product,
            "towards": self.towards,
            "origin": self.origin.to_dict(),
            "destination": self.destination.to_dict(),
            "realtime": self.realtime,
            "stop_count": self.stop_count,
            "duration_minutes": self.duration_minutes,
            "walk_after_minutes": self.walk_after_minutes,
            "cancelled": self.cancelled,
            "direction": self.direction,
            "next_departures": [_iso(value) for value in self.next_departures],
            "headway_minutes": self.headway_minutes,
            "low_floor": self.low_floor,
            "access": [step.to_dict() for step in self.access],
            "stops": [stop.to_dict() for stop in self.stops],
        }


@dataclass(slots=True, frozen=True)
class Transfer:
    """The change between two consecutive vehicles."""

    at: str
    walk_minutes: int
    slack_minutes: int
    risk: RiskLevel
    # Lifts and stairs on the way from one vehicle to the next.
    access: tuple[AccessStep, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        """Render for sensor attributes and action responses."""
        return {
            "at": self.at,
            "walk_minutes": self.walk_minutes,
            "slack_minutes": self.slack_minutes,
            "risk": self.risk,
            "access": [step.to_dict() for step in self.access],
        }


@dataclass(slots=True)
class Trip:
    """One connection from origin to destination."""

    legs: list[RouteLeg]
    transfers: list[Transfer] = field(default_factory=list)

    @property
    def departure(self) -> datetime | None:
        """Effective departure of the first leg."""
        return self.legs[0].origin.effective if self.legs else None

    @property
    def arrival(self) -> datetime | None:
        """Effective arrival of the last leg."""
        return self.legs[-1].destination.effective if self.legs else None

    @property
    def interchanges(self) -> int:
        """Number of changes between vehicles."""
        return max(0, sum(1 for leg in self.legs if not leg.walk) - 1)

    @property
    def risk(self) -> RiskLevel:
        """The worst transfer on the trip; `ok` for a direct connection."""
        worst: RiskLevel = "ok"
        for transfer in self.transfers:
            if _RISK_RANK[transfer.risk] > _RISK_RANK[worst]:
                worst = transfer.risk
        return worst

    @property
    def cancelled(self) -> bool:
        """True when the server flagged any leg as cancelled."""
        return any(leg.cancelled for leg in self.legs)

    @property
    def duration_minutes(self) -> int | None:
        """Door-to-door minutes, from first departure to last arrival."""
        if self.departure is None or self.arrival is None:
            return None
        return round((self.arrival - self.departure).total_seconds() / 60)

    def to_dict(self) -> dict[str, Any]:
        """Render for sensor attributes and action responses."""
        return {
            "departure": _iso(self.departure),
            "arrival": _iso(self.arrival),
            "duration_minutes": self.duration_minutes,
            "interchanges": self.interchanges,
            "risk": self.risk,
            "cancelled": self.cancelled,
            "legs": [leg.to_dict() for leg in self.legs],
            "transfers": [transfer.to_dict() for transfer in self.transfers],
        }


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------


def build_trip_params(
    options: RouteOptions,
    when: datetime,
    *,
    arrive_by: bool = False,
    language: str = "de",
) -> list[tuple[str, str]]:
    """Build the query string for one trip request.

    `when` must already be Vienna wall-clock time — the server reads
    `itdDate` / `itdTime` in its own zone. A list of pairs rather than a
    dict because `exclMOT_<code>` may repeat the checkbox shape once per
    excluded mode.
    """
    params: list[tuple[str, str]] = [
        ("outputFormat", "JSON"),
        ("language", "en" if language.startswith("en") else "de"),
        ("type_origin", "stopID"),
        ("name_origin", str(options.origin_diva)),
        ("type_destination", "stopID"),
        ("name_destination", str(options.destination_diva)),
        ("itdDate", when.strftime("%Y%m%d")),
        ("itdTime", when.strftime("%H%M")),
        ("itdTripDateTimeDepArr", "arr" if arrive_by else "dep"),
        ("calcNumberOfTrips", str(ROUTING_TRIPS_REQUESTED)),
        ("useRealtime", "1"),
        ("ptOptionsActive", "1"),
        ("routeType", options.route_type.upper()),
        ("changeSpeed", options.walk_speed),
    ]
    if options.max_changes != MAX_CHANGES_ANY:
        params.append(("maxChanges", options.max_changes))
    if options.excluded_means:
        params.append(("excludedMeans", "checkbox"))
        params.extend((f"exclMOT_{code}", "1") for code in options.excluded_means)
    if options.step_free:
        params.extend(_STEP_FREE_PARAMS)
    return params


async def async_routing_zone() -> tzinfo:
    """The routing server's zone, `ROUTING_TIME_ZONE`; UTC if it can't load.

    Every query and parse that speaks the server's wall clock resolves the
    zone through here, so the fallback is decided once.
    """
    return await dt_util.async_get_time_zone(ROUTING_TIME_ZONE) or dt_util.UTC


async def async_fetch_trip_body(
    session: aiohttp.ClientSession,
    params: Sequence[tuple[str, str]],
    user_agent: str,
    *,
    endpoint: str = ROUTING_TRIP_ENDPOINT,
) -> dict[str, Any]:
    """GET one request from the routing server and return the decoded JSON body.

    A trip request by default; timetable.py passes the departure-monitor
    endpoint, which answers in the same envelope. The server labels its
    JSON `text/html`, so `content_type=None` is required, not defensive.
    Raises `RoutingError` for every failure so callers map one exception
    type onto their own surface (UpdateFailed for the coordinator,
    HomeAssistantError for the action).
    """
    url = f"{ROUTING_BASE_URL}{endpoint}"
    try:
        async with session.get(
            url,
            params=list(params),
            headers=base_request_headers(user_agent),
            timeout=aiohttp.ClientTimeout(total=ROUTING_REQUEST_TIMEOUT_SECONDS),
        ) as resp:
            if resp.status >= 400:
                raise RoutingError(
                    "api_http_error",
                    {"status": str(resp.status), "reason": str(resp.reason or "")},
                )
            body = await resp.json(content_type=None)
    except TimeoutError as err:
        raise RoutingError(
            "api_timeout", {"seconds": str(ROUTING_REQUEST_TIMEOUT_SECONDS)}
        ) from err
    except aiohttp.ClientError as err:
        raise RoutingError(
            "api_connection_error",
            {"error_type": type(err).__name__, "error": str(err)},
        ) from err
    except ValueError as err:
        raise RoutingError(
            "api_invalid_response", {"status": "200", "error": str(err)}
        ) from err
    if not isinstance(body, dict):
        raise RoutingError(
            "api_invalid_response",
            {
                "status": "200",
                "error": f"expected an object, got {type(body).__name__}",
            },
        )
    return body


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------


def parse_trip_body(
    body: Mapping[str, Any],
    tz: Any,
    *,
    min_transfer_minutes: int = DEFAULT_MIN_TRANSFER_MINUTES,
) -> list[Trip]:
    """Turn a trip response into scored trips, or raise `RoutingError`.

    `tz` is the zone the server's wall-clock stamps are in (Vienna). An
    answer without trips is an error, never an empty list: the server
    only omits `trips` when it could not route at all, and a silent empty
    list would render as "no connections" on a route that has plenty.
    """
    _raise_for_messages(body)
    raw_trips = body.get("trips")
    if isinstance(raw_trips, Mapping):
        # EFA collapses a one-element list into `{"trip": {...}}`.
        raw_trips = [raw_trips.get("trip")]
    if not isinstance(raw_trips, list) or not raw_trips:
        raise RoutingError("route_no_connection")

    trips: list[Trip] = []
    for raw_trip in raw_trips:
        if isinstance(raw_trip, Mapping) and isinstance(raw_trip.get("trip"), Mapping):
            raw_trip = raw_trip["trip"]
        if not isinstance(raw_trip, Mapping):
            continue
        legs = [
            leg
            for raw_leg in raw_trip.get("legs") or []
            if isinstance(raw_leg, Mapping)
            and (leg := _parse_leg(raw_leg, tz)) is not None
        ]
        if not legs:
            continue
        trip = Trip(legs=legs)
        trip.transfers = assess_transfers(trip.legs, min_transfer_minutes)
        trips.append(trip)
    if not trips:
        raise RoutingError("route_no_connection")
    return trips


def _raise_for_messages(body: Mapping[str, Any]) -> None:
    """Raise for an error the server reported instead of routing.

    Errors land in three places: `itdMessageList` (e.g. -4007, origin too
    close to destination) and a `message` list on the `origin` or
    `destination` block (e.g. -2000, stop invalid). Codes are negative
    integers carried as strings.
    """
    codes: list[tuple[int, str, str]] = []
    for entry in body.get("itdMessageList") or []:
        if isinstance(entry, Mapping):
            codes.extend(_codes_in(entry.get("message"), "trip"))
    for usage in ("origin", "destination"):
        block = body.get(usage)
        if isinstance(block, Mapping):
            codes.extend(_codes_in(block.get("message"), usage))
    for code, text, usage in codes:
        if code >= 0:
            continue
        if code == ERR_STOP_INVALID:
            raise RoutingError("route_stop_invalid", {"which": usage})
        if code == ERR_TOO_CLOSE:
            raise RoutingError("route_too_close")
        if code == ERR_OUTSIDE_TIMETABLE:
            raise RoutingError("route_outside_timetable")
        raise RoutingError("route_upstream_error", {"code": str(code), "value": text})


def _codes_in(message: Any, usage: str) -> Iterable[tuple[int, str, str]]:
    """Yield `(code, error text, usage)` out of an EFA name/value list."""
    if not isinstance(message, list):
        return
    fields = {
        str(item.get("name")): str(item.get("value") or "")
        for item in message
        if isinstance(item, Mapping)
    }
    try:
        code = int(fields.get("code", ""))
    except ValueError:
        return
    yield code, fields.get("error", ""), usage


def _parse_leg(raw: Mapping[str, Any], tz: Any) -> RouteLeg | None:
    """One leg, or None when it has no usable end points."""
    points = raw.get("points")
    if not isinstance(points, list) or len(points) < 2:
        return None
    start, end = points[0], points[-1]
    if not isinstance(start, Mapping) or not isinstance(end, Mapping):
        return None
    mode = as_mapping(raw.get("mode"))
    diva = as_mapping(mode.get("diva"))
    walk = str(mode.get("type") or "") in _WALK_MODE_TYPES
    stop_seq = raw.get("stopSeq")
    # stopSeq includes both the boarding and the alighting stop.
    stop_count = max(0, len(stop_seq) - 1) if isinstance(stop_seq, list) else 0
    return RouteLeg(
        walk=walk,
        line=None
        if walk
        else (as_text(mode.get("number")) or as_text(mode.get("name"))),
        type="walk" if walk else _vehicle_type(mode),
        product=as_text(mode.get("product")),
        towards=None if walk else _strip_place(as_text(mode.get("destination"))),
        origin=_parse_point(start, tz),
        destination=_parse_point(end, tz),
        realtime=str(mode.get("realtime") or "0") == "1",
        stop_count=stop_count,
        walk_after_minutes=_walk_after(raw.get("footpath")),
        cancelled=_is_cancelled(raw, mode),
        direction=None if walk else as_text(diva.get("dir")),
        wiener_linien=not walk and as_text(diva.get("opPublicCode")) == "WL",
        low_floor=not walk and _has_attr(raw.get("attrs"), "PlanLowFloorVehicle"),
        access=_access_steps(raw.get("footpath"), after=False),
        access_after=_access_steps(raw.get("footpath"), after=True),
        stops=() if walk else _intermediate_stops(stop_seq, tz),
    )


def _parse_point(raw: Mapping[str, Any], tz: Any) -> RouteStop:
    """A leg end point: name, platform and the two times."""
    stamp = as_mapping(raw.get("dateTime"))
    ref = as_mapping(raw.get("ref"))
    return RouteStop(
        name=_strip_place(as_text(raw.get("name"))) or "",
        stop_id=as_text(ref.get("id")),
        platform=as_text(raw.get("platformName")),
        planned=_parse_stamp(stamp.get("date"), stamp.get("time"), tz),
        estimated=_parse_stamp(stamp.get("rtDate"), stamp.get("rtTime"), tz),
    )


def _parse_stamp(date_text: Any, time_text: Any, tz: Any) -> datetime | None:
    """`14.09.2026` + `07:56` in the server's zone → aware datetime."""
    if not isinstance(date_text, str) or not isinstance(time_text, str):
        return None
    try:
        return datetime.strptime(f"{date_text} {time_text}", "%d.%m.%Y %H:%M").replace(
            tzinfo=tz
        )
    except ValueError:
        return None


def _walk_after(footpath: Any) -> int:
    """Minutes of transfer walk attached to the end of a leg."""
    if not isinstance(footpath, list):
        return 0
    total = 0
    for block in footpath:
        if not isinstance(block, Mapping) or block.get("position") != "AFTER":
            continue
        try:
            total += int(str(block.get("duration") or "0"))
        except ValueError:
            continue
    return total


def _intermediate_stops(stop_seq: Any, tz: Any) -> tuple[LegStop, ...]:
    """The stops between boarding and alighting, each with its time.

    `stopSeq` lists both ends too; the leg's own points already carry
    those. A stop's time is its departure (`ref.depDateTime`,
    `20260915 06:19`), or its arrival where the server gives no departure.
    """
    if not isinstance(stop_seq, list) or len(stop_seq) < 3:
        return ()
    stops: list[LegStop] = []
    for raw in stop_seq[1:-1]:
        if not isinstance(raw, Mapping):
            continue
        ref = as_mapping(raw.get("ref"))
        stamp = ref.get("depDateTime") or ref.get("arrDateTime")
        stops.append(
            LegStop(
                name=_strip_place(as_text(raw.get("name"))) or "",
                stop_id=as_text(ref.get("id")),
                time=_parse_compact_stamp(stamp, tz),
            )
        )
    return tuple(stops)


def _parse_compact_stamp(value: Any, tz: Any) -> datetime | None:
    """`20260915 06:19` in the server's zone → aware datetime."""
    if not isinstance(value, str):
        return None
    try:
        return datetime.strptime(value, "%Y%m%d %H:%M").replace(tzinfo=tz)
    except ValueError:
        return None


def _access_steps(footpath: Any, *, after: bool) -> tuple[AccessStep, ...]:
    """Lifts and stairs from the footpath blocks at (or not at) `AFTER`.

    A transfer walk arrives as `position: AFTER` on the ride before it; the
    walk to or from a platform arrives on a walk leg of its own (seen as
    `IDEST`). Elements without a type are skipped.
    """
    steps: list[AccessStep] = []
    for block in footpath if isinstance(footpath, list) else []:
        if (
            not isinstance(block, Mapping)
            or (block.get("position") == "AFTER") != after
        ):
            continue
        elements = block.get("footpathElem")
        for element in elements if isinstance(elements, list) else []:
            if not isinstance(element, Mapping):
                continue
            kind = as_text(element.get("type"))
            if kind is None:
                continue
            level = as_text(element.get("level"))
            steps.append(
                AccessStep(
                    kind=kind.lower(),
                    level=level.lower() if level else None,
                    stop_id=as_text(as_mapping(element.get("orig")).get("stopID")),
                )
            )
    return tuple(steps)


def _has_attr(attrs: Any, name: str) -> bool:
    """Whether an EFA name/value attribute list carries `name` set."""
    return isinstance(attrs, list) and any(
        isinstance(item, Mapping)
        and item.get("name") == name
        and str(item.get("value", "1")) not in ("0", "false")
        for item in attrs
    )


def _is_cancelled(raw: Mapping[str, Any], mode: Mapping[str, Any]) -> bool:
    """True when the server marks the leg's trip as cancelled."""
    for source in (raw, mode):
        status = source.get("realtimeStatus") or source.get("realtimeTripStatus")
        if isinstance(status, str) and "CANCEL" in status.upper():
            return True
        if isinstance(status, list) and any(
            "CANCEL" in str(item).upper() for item in status
        ):
            return True
    return False


def _vehicle_type(mode: Mapping[str, Any]) -> str:
    """Map the EFA mode onto the cards' vehicle-type vocabulary."""
    mapped = _MOT_TYPES.get(str(mode.get("code") or ""), "ptOther")
    product = str(mode.get("product") or "").casefold()
    if mapped == "ptBusCity" and "nacht" in product:
        return "ptBusNight"
    return mapped


def _strip_place(name: str | None) -> str | None:
    """Drop the `Wien ` place prefix the server puts on every stop name."""
    if name is None:
        return None
    for prefix in ("Wien, ", "Wien "):
        if name.startswith(prefix) and len(name) > len(prefix):
            return name[len(prefix) :]
    return name


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------


def assess_transfers(
    legs: Sequence[RouteLeg], min_transfer_minutes: int
) -> list[Transfer]:
    """Score every change between two consecutive vehicles.

    `slack = next departure - previous arrival - walking in between`, on
    effective (realtime-where-known) times, rounded to whole minutes the
    way the server's own stamps are.

    * `at_risk` — slack below zero: on current times the walk no longer
      fits, so the connection only holds if the second vehicle is late too.
    * `tight` — slack below the entry's buffer. The server plans zero-slack
      changes as a matter of course; this is the one a small delay breaks.
    * `ok` — at least the buffer to spare.

    Walk legs between the two vehicles add their ride time to the walk.
    A change whose times are missing is skipped rather than guessed at.
    """
    transfers: list[Transfer] = []
    previous: RouteLeg | None = None
    walk = 0
    walk_access: list[AccessStep] = []
    for leg in legs:
        if leg.walk:
            walk += leg.duration_minutes or 0
            walk_access.extend(leg.access)
            continue
        if previous is not None:
            arrival = previous.destination.effective
            departure = leg.origin.effective
            if arrival is not None and departure is not None:
                gap = round((departure - arrival).total_seconds() / 60)
                total_walk = previous.walk_after_minutes + walk
                slack = gap - total_walk
                risk: RiskLevel
                if slack < 0:
                    risk = "at_risk"
                elif slack < min_transfer_minutes:
                    risk = "tight"
                else:
                    risk = "ok"
                transfers.append(
                    Transfer(
                        at=previous.destination.name,
                        walk_minutes=total_walk,
                        slack_minutes=slack,
                        risk=risk,
                        access=(*previous.access_after, *walk_access),
                    )
                )
        previous = leg
        walk = 0
        walk_access = []
    return transfers


def last_connection(
    trips: Iterable[Trip],
    now: datetime,
    arrive_by: datetime,
    max_wait: timedelta,
) -> Trip | None:
    """The latest usable trip from an arrive-by query for the small hours.

    Asked to arrive by 04:00, the server also offers trips that wait out the
    night at a stop and catch the first morning train (verified 2026-09-15:
    00:50 S45, then 41 to 01:16, then U6 at 04:43, arriving 04:59). Those
    are dropped: any wait between two rides longer than `max_wait`, or an
    arrival after `arrive_by`. Of the rest, the one leaving last still ahead.
    """
    usable = [
        trip
        for trip in trips
        if not trip.cancelled
        and trip.departure is not None
        and trip.arrival is not None
        and trip.departure >= now - timedelta(minutes=1)
        and trip.arrival <= arrive_by
        and _longest_wait(trip) <= max_wait
    ]
    return max(usable, key=lambda trip: trip.departure or now, default=None)


def _longest_wait(trip: Trip) -> timedelta:
    """The longest gap between one leg arriving and the next leaving."""
    longest = timedelta(0)
    for previous, leg in zip(trip.legs, trip.legs[1:], strict=False):
        arrival, departure = previous.destination.effective, leg.origin.effective
        if arrival is not None and departure is not None:
            longest = max(longest, departure - arrival)
    return longest


def rank_trips(trips: Iterable[Trip], now: datetime | None) -> list[Trip]:
    """Keep the useful connections, soonest first.

    1. Drop cancelled connections, and those that have already left `now`.
       A query for a chosen time passes `now=None`: someone planning
       tomorrow's trip, or checking what they could have caught, wants
       every connection the server found for that time.
    2. Drop dominated ones: B is dominated when some A departs no earlier,
       arrives no later, changes no more often and is no riskier — and is
       strictly better on at least one of those. Departure counts in the
       leaving-later direction, so the next few connections in time all
       survive; only a strictly worse alternative to one of them goes.
    3. Order by departure, then arrival.
    """
    candidates = [
        trip
        for trip in trips
        if not trip.cancelled
        and trip.departure is not None
        and trip.arrival is not None
        and (now is None or trip.departure >= now - timedelta(minutes=1))
    ]

    def criteria(trip: Trip) -> tuple[float, float, int, int]:
        assert trip.departure is not None
        assert trip.arrival is not None
        # Every criterion "smaller is better": negate departure.
        return (
            -trip.departure.timestamp(),
            trip.arrival.timestamp(),
            trip.interchanges,
            _RISK_RANK[trip.risk],
        )

    scored = [(criteria(trip), trip) for trip in candidates]
    survivors = [
        trip
        for key, trip in scored
        if not any(
            other is not trip
            and all(a <= b for a, b in zip(other_key, key, strict=True))
            and other_key != key
            for other_key, other in scored
        )
    ]
    survivors.sort(key=lambda trip: (trip.departure, trip.arrival))
    return survivors


# ---------------------------------------------------------------------------
# Active window
# ---------------------------------------------------------------------------


def within_window(
    now: datetime,
    active_from: time | None,
    active_to: time | None,
    active_days: Sequence[str] | None,
) -> bool:
    """Whether a route should be refreshing at `now` (local time).

    No window at all means always. A window whose end is before its start
    runs overnight (22:00–02:00); the day filter then applies to the day
    the window *started* on, so a Friday-night window still covers the
    small hours of Saturday.
    """
    days = set(active_days or WEEKDAYS)
    if active_from is None or active_to is None:
        return WEEKDAYS[now.weekday()] in days
    current = now.time().replace(tzinfo=None)
    if active_from <= active_to:
        return WEEKDAYS[now.weekday()] in days and active_from <= current <= active_to
    if current >= active_from:
        return WEEKDAYS[now.weekday()] in days
    if current <= active_to:
        return WEEKDAYS[(now.weekday() - 1) % 7] in days
    return False


def parse_time_option(value: Any) -> time | None:
    """Read a stored `HH:MM[:SS]` option; None when unset or malformed."""
    if not isinstance(value, str) or not value:
        return None
    try:
        return time.fromisoformat(value)
    except ValueError:
        return None
