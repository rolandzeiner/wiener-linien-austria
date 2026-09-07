"""Traffic disruptions and elevator status from the Wiener Linien `/trafficInfoList` endpoint.

Both user-visible alert types are surfaced by the same endpoint, just via the
`name=` filter:

- `stoerunglang` — line/route disruptions (scope: city-wide)
- `aufzugsinfo` — elevator out-of-service notices (scope: per station + per RBL)

Both names travel in ONE request. `name=` may be repeated (Schnittstellen-
dokumentation V1.5 §4.2.1), and the response tags every entry with a
`refTrafficInfoCategoryId` that resolves through `data.trafficInfoCategories`.
That halves the alert request count (576/day to 288/day) and — the reason it
actually matters — removes a 15-second stall from the domain lock every cycle:
two `_fetch_info_list` calls gathered concurrently both took
`async_enforce_domain_cooldown`, which sleeps *inside* the lock by design, so
the second always waited its full slice while any `/monitor` tick queued behind
it. Category ids are assigned per response and NOT in request order (measured
2026-09-07: `stoerunglang` sent first came back as id 2), so always resolve
through the category table rather than assuming an ordering.

Fetched on a slow (5 min) domain-wide cadence — these don't change any faster
than a few times an hour and aggregating across all entries keeps the
integration's outbound request rate trivial. Each sensor filters the cached
lists by its own (lines, RBLs) at attribute-read time.

Two further categories exist and are deliberately not requested yet:
`stoerungkurz` (stop-display short text; every live entry carries
`relatedStops`) and `fahrtreppeninfo` (escalator outages; parses with the same
shape as `aufzugsinfo`). Both would ride along for zero extra requests, but
they need sensor attributes, translations and card rendering to be useful, so
they are their own change.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any, Final

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    ALERT_FEED_ELEVATOR,
    ALERT_FEED_TRAFFIC,
    ALERTS_SEQ_KEY,
    API_BASE_URL,
    DOMAIN,
    ELEVATOR_INFO_KEY,
    ENTRY_COUNT_KEY,
    TRAFFIC_INFO_ENDPOINT,
    TRAFFIC_INFO_KEY,
    USER_AGENT,
)
from .http import base_request_headers
from .rate_limit import async_enforce_domain_cooldown

_LOGGER = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data shapes
# ---------------------------------------------------------------------------


@dataclass(slots=True)
class TrafficInfo:
    """One service disruption affecting one or more lines."""

    name: str  # stable upstream id, e.g. "I20260420-0032"
    title: str  # "49A: Verkehrsunfall"
    description: str
    related_lines: list[str]
    time_start: str | None
    time_end: str | None
    status: str  # "active", "resolved", ...
    description_html: str = ""  # same text but with <br> breaks preserved
    line_types: dict[str, str] = field(default_factory=dict)
    location: str | None = None  # free-text locality, e.g. "Stadionallee"
    time_created: str | None = None  # when the alert was first posted
    time_last_update: str | None = None  # when the alert was last edited
    # Pre-computed frozenset over `related_lines` — used by
    # `get_alerts_for` for the per-sensor set-intersection that runs on
    # every state attribute read AND every template fetch. Without this
    # cache, each read built a fresh `set(t.related_lines)` per traffic
    # info per call, churning ~hundreds of allocations across busy
    # dashboards. Built in __post_init__ from the immutable parsed
    # `related_lines` list so it's correct from construction onward.
    related_lines_set: frozenset[str] = field(
        init=False, default=frozenset(), repr=False, compare=False
    )

    def __post_init__(self) -> None:
        self.related_lines_set = frozenset(self.related_lines)

    def to_dict(self) -> dict[str, Any]:
        """Render as plain dict for sensor attributes / diagnostics."""
        return {
            "name": self.name,
            "title": self.title,
            "description": self.description,
            "description_html": self.description_html,
            "related_lines": list(self.related_lines),
            "line_types": dict(self.line_types),
            "location": self.location,
            "time_start": self.time_start,
            "time_end": self.time_end,
            "time_created": self.time_created,
            "time_last_update": self.time_last_update,
            "status": self.status,
        }


@dataclass(slots=True)
class ElevatorInfo:
    """One elevator outage."""

    name: str
    station: str
    description: str  # usually the physical location of the elevator
    reason: str  # free-text reason in German
    status: str  # "außer Betrieb" etc.
    related_lines: list[str]
    related_stops: list[int]  # RBLs where this elevator applies
    time_start: str | None
    time_end: str | None
    # Pre-computed frozensets — see `TrafficInfo.related_lines_set` for
    # the rationale. Both the line and stop list participate in the
    # `get_alerts_for` matcher's intersection per attribute read.
    related_lines_set: frozenset[str] = field(
        init=False, default=frozenset(), repr=False, compare=False
    )
    related_stops_set: frozenset[int] = field(
        init=False, default=frozenset(), repr=False, compare=False
    )

    def __post_init__(self) -> None:
        self.related_lines_set = frozenset(self.related_lines)
        self.related_stops_set = frozenset(self.related_stops)

    def to_dict(self) -> dict[str, Any]:
        """Render as plain dict for sensor attributes / diagnostics."""
        return {
            "name": self.name,
            "station": self.station,
            "description": self.description,
            "reason": self.reason,
            "status": self.status,
            "related_lines": list(self.related_lines),
            "related_stops": list(self.related_stops),
            "time_start": self.time_start,
            "time_end": self.time_end,
        }


# ---------------------------------------------------------------------------
# Fetch
# ---------------------------------------------------------------------------


# Sentinel for soft failures. A dedicated class so the return-type union
# narrows under `mypy --strict` and callers can distinguish "kept cache
# (fetch failed)" from "200 returned an empty list" — the latter must
# overwrite the cache (a resolved disruption was the only entry), the
# former must leave it alone.
class _FetchFailed:
    """Sentinel type for fetch / parse failures."""


_FETCH_FAILED: Final[_FetchFailed] = _FetchFailed()

# Feed names requested in the single combined call, in a fixed order so the
# request URL is stable across ticks.
_REQUESTED_FEEDS: Final[tuple[str, ...]] = (ALERT_FEED_TRAFFIC, ALERT_FEED_ELEVATOR)


async def _fetch_info_lists(
    hass: HomeAssistant,
) -> dict[str, list[dict[str, Any]]] | _FetchFailed:
    """GET /trafficInfoList once for every feed name we care about.

    Returns a `{feed name: entries}` dict on a successful 200 — with a key
    present for every requested feed, empty list included, because the
    upstream omits `trafficInfoCategories` entries that currently have no
    disruptions. Returns `_FETCH_FAILED` on any fetch/parse failure
    (advisory, never fatal — the caller keeps the previous cache).
    """
    session = async_get_clientsession(hass)
    url = f"{API_BASE_URL}{TRAFFIC_INFO_ENDPOINT}"
    headers = base_request_headers(USER_AGENT)
    names = ",".join(_REQUESTED_FEEDS)
    try:
        await async_enforce_domain_cooldown(hass)
        async with session.get(
            url,
            params=[("name", name) for name in _REQUESTED_FEEDS],
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=15),
        ) as resp:
            resp.raise_for_status()
            body = await resp.json()
            if not isinstance(body, dict):
                return _FETCH_FAILED
            message = body.get("message") or {}
            if message.get("messageCode") not in (1, None):
                _LOGGER.debug(
                    "trafficInfoList?name=%s returned non-OK messageCode %s",
                    names,
                    message.get("messageCode"),
                )
                return _FETCH_FAILED
            return _split_by_category(body.get("data") or {})
    except asyncio.CancelledError:
        # HA shutting down with a fetch in flight. Re-raise without logging:
        # the user can do nothing about it, and the noise buries real faults.
        raise
    except (aiohttp.ContentTypeError, ValueError):
        # The endpoint answered, but not with the JSON object we expect —
        # a contract break upstream, or a proxy error page served with the
        # wrong content type. Rare and actionable, so keep the traceback.
        # Must be caught before ClientError below: ContentTypeError is a
        # subclass of ClientResponseError, which is a subclass of ClientError.
        _LOGGER.warning("Failed to refresh %s alerts", names, exc_info=True)
        return _FETCH_FAILED
    except (TimeoutError, aiohttp.ClientError) as err:
        # Transient upstream trouble — the OGD endpoint sheds load with
        # 502/503 and times out sporadically. Alerts are advisory and the
        # previous cache survives, so there is nothing for the user to act
        # on. Debug, not warning: a traceback per occurrence buried real
        # faults (29 of them in one week on an otherwise healthy install).
        _LOGGER.debug("Failed to refresh %s alerts: %s", names, err)
        return _FETCH_FAILED


def _split_by_category(data: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    """Route a combined `trafficInfoList` payload back into per-feed lists.

    `data.trafficInfoCategories` maps `id` to `name`; every entry in
    `data.trafficInfos` points at one through `refTrafficInfoCategoryId`.
    The ids are assigned per response and carry no relationship to the order
    the `name=` params were sent in, so the table is the only safe route.

    Every requested feed gets a key even when upstream omits its category —
    the docs are explicit that a category appears only when it currently has
    disruptions, and "no disruptions" must clear the cache rather than
    preserve a resolved one. Entries whose category is unknown (a fifth
    category appearing upstream, or a malformed row) are dropped: we only
    ever asked for the feeds in `_REQUESTED_FEEDS`.
    """
    names_by_id: dict[int, str] = {}
    for category in data.get("trafficInfoCategories") or []:
        if not isinstance(category, dict):
            continue
        cat_id = category.get("id")
        cat_name = category.get("name")
        if isinstance(cat_id, int) and isinstance(cat_name, str):
            names_by_id[cat_id] = cat_name

    out: dict[str, list[dict[str, Any]]] = {name: [] for name in _REQUESTED_FEEDS}
    for entry in data.get("trafficInfos") or []:
        if not isinstance(entry, dict):
            continue
        cat_id = entry.get("refTrafficInfoCategoryId")
        if not isinstance(cat_id, int):
            continue
        feed = names_by_id.get(cat_id)
        if feed is not None and feed in out:
            out[feed].append(entry)
    return out


async def async_refresh_alerts(hass: HomeAssistant) -> None:
    """Refresh both traffic and elevator alerts into hass.data.

    Safe to call whenever; a failed fetch keeps the previous cache.

    Bails immediately when the domain has been torn down (no entries
    left). The periodic timer is unsubscribed in `async_unload_entry`,
    but a task already in flight at unload time would otherwise
    re-poison `hass.data[DOMAIN]` with the alerts we just deliberately
    dropped.
    """
    domain_data = hass.data.get(DOMAIN)
    if not domain_data or not domain_data.get(ENTRY_COUNT_KEY):
        return

    result = await _fetch_info_lists(hass)

    # Re-check after the fetch — `await` boundaries are cancellation
    # points, and unload may have run while we were waiting on the
    # network. Same risk as the entry guard above.
    domain_data = hass.data.get(DOMAIN)
    if not domain_data or not domain_data.get(ENTRY_COUNT_KEY):
        return

    # Fetch/parse failure → leave both caches exactly as they were. Only an
    # actual successful 200 (possibly empty) overwrites — a legitimately
    # empty list must clear stale resolved entries. Both feeds now travel in
    # one request, so they succeed or fail together; there is no longer a
    # mixed case to reason about.
    failed = isinstance(result, _FetchFailed)
    if not isinstance(result, _FetchFailed):
        parsed = [_parse_traffic(x) for x in result[ALERT_FEED_TRAFFIC]]
        # Drop resolved entries — upstream keeps them in the feed for a
        # while after the disruption ends, but users don't want them on
        # the card.
        domain_data[TRAFFIC_INFO_KEY] = [t for t in parsed if t.status == "active"]
        domain_data[ELEVATOR_INFO_KEY] = [
            _parse_elevator(x) for x in result[ALERT_FEED_ELEVATOR]
        ]
    else:
        domain_data.setdefault(TRAFFIC_INFO_KEY, [])
        domain_data.setdefault(ELEVATOR_INFO_KEY, [])

    # Bump even on the failure path: the sensor cache treats "alerts seq
    # advanced" as "rebuild," and that's the cheapest signal we have. A
    # spurious rebuild every ~5 min is fine; missing a real change for hours
    # because the cache key didn't move is not.
    domain_data[ALERTS_SEQ_KEY] = int(domain_data.get(ALERTS_SEQ_KEY, 0)) + 1

    _LOGGER.debug(
        "Alerts refreshed: %d traffic, %d elevator (failed=%s)",
        len(domain_data.get(TRAFFIC_INFO_KEY, [])),
        len(domain_data.get(ELEVATOR_INFO_KEY, [])),
        failed,
    )


# ---------------------------------------------------------------------------
# Parse
# ---------------------------------------------------------------------------


def _parse_traffic(raw: dict[str, Any]) -> TrafficInfo:
    """Parse one trafficInfos entry for name=stoerunglang."""
    time = raw.get("time") or {}
    related_lines = _as_str_list(raw.get("relatedLines"))
    attrs = raw.get("attributes") or {}
    line_types_raw = attrs.get("relatedLineTypes") or {}
    line_types: dict[str, str] = (
        {
            k: v
            for k, v in line_types_raw.items()
            if isinstance(k, str) and isinstance(v, str)
        }
        if isinstance(line_types_raw, dict)
        else {}
    )
    return TrafficInfo(
        name=str(raw.get("name") or ""),
        title=str(raw.get("title") or "").strip(),
        description=str(raw.get("description") or "").strip(),
        description_html=str(raw.get("descriptionHTML") or "").strip(),
        related_lines=related_lines,
        line_types=line_types,
        location=_str_or_none(raw.get("location")),
        time_start=_str_or_none(time.get("start")),
        time_end=_str_or_none(time.get("end")),
        time_created=_str_or_none(time.get("created")),
        time_last_update=_str_or_none(time.get("lastUpdate")),
        status=str(raw.get("status") or ""),
    )


def _parse_elevator(raw: dict[str, Any]) -> ElevatorInfo:
    """Parse one trafficInfos entry for name=aufzugsinfo.

    Shape is less regular than stoerunglang — pulls fallbacks from
    `attributes` when top-level fields are absent.
    """
    attrs = raw.get("attributes") or {}
    time = raw.get("time") or {}

    related_lines = _as_str_list(raw.get("relatedLines")) or _as_str_list(
        attrs.get("relatedLines")
    )
    related_stops = _as_int_list(raw.get("relatedStops")) or _as_int_list(
        attrs.get("relatedStops")
    )

    station = str(attrs.get("station") or raw.get("title") or "").strip()
    description = str(raw.get("description") or attrs.get("location") or "").strip()
    reason = str(attrs.get("reason") or "").strip()
    status = str(attrs.get("status") or "").strip()

    return ElevatorInfo(
        name=str(raw.get("name") or ""),
        station=station,
        description=description,
        reason=reason,
        status=status,
        related_lines=related_lines,
        related_stops=related_stops,
        time_start=_str_or_none(time.get("start")),
        time_end=_str_or_none(time.get("end")),
    )


def _as_str_list(val: Any) -> list[str]:
    """Coerce to a list of non-empty stripped strings."""
    if isinstance(val, list):
        return [str(x).strip() for x in val if isinstance(x, str) and x.strip()]
    if isinstance(val, dict):
        return [str(k).strip() for k in val if isinstance(k, str) and k.strip()]
    return []


def _as_int_list(val: Any) -> list[int]:
    """Coerce to a list of ints, dropping non-numeric entries."""
    if not isinstance(val, list):
        return []
    out: list[int] = []
    for item in val:
        try:
            out.append(int(item))
        except (ValueError, TypeError):
            continue
    return out


def _str_or_none(val: Any) -> str | None:
    """Return val as a string if truthy, else None."""
    if val is None:
        return None
    s = str(val).strip()
    return s or None


# ---------------------------------------------------------------------------
# Query
# ---------------------------------------------------------------------------


def line_names_from_keys(keys: Any) -> set[str]:
    """Extract the line-name prefix of every `line|direction` key.

    Centralises the "split on the first pipe, keep the line code" rule
    so the alert-filter callers in `diagnostics` and `sensor` agree on
    one parse. Non-string / empty entries are dropped silently — they
    can never carry a line name anyway.
    """
    if not keys:
        return set()
    return {k.split("|", 1)[0] for k in keys if isinstance(k, str) and k}


def get_alerts_for(
    hass: HomeAssistant,
    lines: set[str] | None,
    rbls: set[int] | None,
) -> tuple[list[TrafficInfo], list[ElevatorInfo]]:
    """Return traffic + elevator alerts relevant to a given stop.

    - Traffic: match if any `related_lines` overlaps `lines`. If `lines` is
      empty/None, return all traffic alerts (fall-through).
    - Elevator: match if any `related_stops` overlaps `rbls`. If `rbls` is
      empty/None, return []. An elevator outage with no `related_stops` is
      only surfaced when it also matches on `related_lines`.
    """
    domain_data = hass.data.get(DOMAIN, {})
    all_traffic: list[TrafficInfo] = domain_data.get(TRAFFIC_INFO_KEY, []) or []
    all_elevator: list[ElevatorInfo] = domain_data.get(ELEVATOR_INFO_KEY, []) or []

    matched_traffic: list[TrafficInfo] = (
        [t for t in all_traffic if t.related_lines_set & lines]
        if lines
        else list(all_traffic)
    )

    matched_elevator: list[ElevatorInfo] = []
    if rbls:
        for e in all_elevator:
            stop_hit = bool(e.related_stops_set & rbls)
            if stop_hit:
                matched_elevator.append(e)
                continue
            # No explicit RBL match — fall back to line match if present.
            if not e.related_stops and lines and e.related_lines_set & lines:
                matched_elevator.append(e)

    return matched_traffic, matched_elevator
