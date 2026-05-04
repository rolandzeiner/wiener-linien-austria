"""Traffic disruptions and elevator status from the Wiener Linien `/trafficInfoList` endpoint.

Both user-visible alert types are surfaced by the same endpoint, just via the
`name=` filter:

- `stoerunglang` — line/route disruptions (scope: city-wide)
- `aufzugsinfo` — elevator out-of-service notices (scope: per station + per RBL)

Fetched on a slow (5 min) domain-wide cadence — these don't change any faster
than a few times an hour and aggregating across all entries keeps the
integration's outbound request rate trivial. Each sensor filters the cached
lists by its own (lines, RBLs) at attribute-read time.
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
    ALERT_CACHE_VALIDATORS_KEY,
    API_BASE_URL,
    DOMAIN,
    ELEVATOR_INFO_KEY,
    ENTRY_COUNT_KEY,
    TRAFFIC_INFO_ENDPOINT,
    TRAFFIC_INFO_KEY,
    USER_AGENT,
)
from .http import CacheValidators, base_request_headers
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


# Sentinels for 304 responses + soft failures. Dedicated classes so the
# return-type union narrows under `mypy --strict` and callers can
# distinguish "kept cache (304)" / "kept cache (fetch failed)" from
# "200 returned an empty list" — the third case must overwrite the
# cache (resolved disruption was the only entry), the first two must
# leave it alone.
class _NotModified:
    """Sentinel type for 304 Not Modified responses."""


class _FetchFailed:
    """Sentinel type for fetch / parse failures."""


_NOT_MODIFIED: Final[_NotModified] = _NotModified()
_FETCH_FAILED: Final[_FetchFailed] = _FetchFailed()


async def _fetch_info_list(
    hass: HomeAssistant, name: str
) -> list[dict[str, Any]] | _NotModified | _FetchFailed:
    """GET /trafficInfoList?name=<name> with conditional-GET caching.

    Returns:
    - `list[dict]`        on a successful 200 (possibly empty)
    - `_NOT_MODIFIED`     on a 304 (cache still fresh)
    - `_FETCH_FAILED`     on any fetch/parse failure (advisory, never fatal)
    """
    session = async_get_clientsession(hass)
    url = f"{API_BASE_URL}{TRAFFIC_INFO_ENDPOINT}"
    # Use `get` not `setdefault` — if the domain dict was torn down
    # during a prior await, don't recreate it just to stash validators.
    # Caller (`async_refresh_alerts`) already guarded on entry; this is
    # belt-and-braces for an unload that races mid-fetch.
    domain_data = hass.data.get(DOMAIN)
    if not domain_data:
        return _FETCH_FAILED
    validators_by_name: dict[str, CacheValidators] = domain_data.setdefault(
        ALERT_CACHE_VALIDATORS_KEY, {}
    )
    validators = validators_by_name.setdefault(name, CacheValidators())
    headers = base_request_headers(USER_AGENT)
    headers.update(validators.to_request_headers())
    try:
        await async_enforce_domain_cooldown(hass)
        async with session.get(
            url,
            params=[("name", name)],
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=15),
        ) as resp:
            if resp.status == 304:
                validators.update_from_response(resp)
                return _NOT_MODIFIED
            resp.raise_for_status()
            body = await resp.json()
            if not isinstance(body, dict):
                return _FETCH_FAILED
            message = body.get("message") or {}
            if message.get("messageCode") not in (1, None):
                _LOGGER.debug(
                    "trafficInfoList?name=%s returned non-OK messageCode %s",
                    name,
                    message.get("messageCode"),
                )
                return _FETCH_FAILED
            # Only capture validators after the body has fully validated —
            # never for an error reply we wouldn't accept anyway.
            validators.update_from_response(resp)
            infos = (body.get("data") or {}).get("trafficInfos") or []
            return [x for x in infos if isinstance(x, dict)]
    except asyncio.CancelledError:
        # Cooperative cancellation — usually fired when HA is shutting
        # down and our `_periodic_alerts` task is being torn down with
        # an in-flight fetch still pending. The aiohttp session may
        # already be closed too, surfacing as one of the broader errors
        # below. Re-raise without logging so the shutdown signal
        # propagates cleanly and we don't pollute the log with a noisy
        # warning that the user can do nothing about.
        raise
    except (
        aiohttp.ClientError,
        aiohttp.ContentTypeError,
        asyncio.TimeoutError,
        ValueError,
    ):
        _LOGGER.warning("Failed to refresh %s alerts", name, exc_info=True)
        return _FETCH_FAILED


async def async_refresh_alerts(hass: HomeAssistant) -> None:
    """Refresh both traffic and elevator alerts into hass.data.

    Safe to call whenever; failures keep the previous cache, and a 304
    response from the conditional-GET path also keeps it untouched.

    Bails immediately when the domain has been torn down (no entries
    left). The periodic timer is unsubscribed in `async_unload_entry`,
    but a task already in flight at unload time would otherwise
    re-poison `hass.data[DOMAIN]` with the alerts we just deliberately
    dropped.
    """
    domain_data = hass.data.get(DOMAIN)
    if not domain_data or not domain_data.get(ENTRY_COUNT_KEY):
        return

    traffic_result, elevator_result = await asyncio.gather(
        _fetch_info_list(hass, "stoerunglang"),
        _fetch_info_list(hass, "aufzugsinfo"),
    )

    # Re-check after the gather — `await` boundaries are cancellation
    # points, and unload may have run while we were waiting on the
    # network. Same risk as the entry guard above.
    domain_data = hass.data.get(DOMAIN)
    if not domain_data or not domain_data.get(ENTRY_COUNT_KEY):
        return

    # 304 Not Modified → leave the existing cache exactly as it was.
    # Fetch/parse failure → also leave it. Only an actual successful
    # 200 (possibly empty) overwrites — a legitimately empty list must
    # clear stale resolved entries.
    traffic_not_modified = isinstance(traffic_result, _NotModified)
    elevator_not_modified = isinstance(elevator_result, _NotModified)

    if isinstance(traffic_result, list):
        parsed = [_parse_traffic(x) for x in traffic_result]
        # Drop resolved entries — upstream keeps them in the feed for a
        # while after the disruption ends, but users don't want them on
        # the card.
        domain_data[TRAFFIC_INFO_KEY] = [t for t in parsed if t.status == "active"]
    elif TRAFFIC_INFO_KEY not in domain_data:
        domain_data[TRAFFIC_INFO_KEY] = []

    if isinstance(elevator_result, list):
        domain_data[ELEVATOR_INFO_KEY] = [_parse_elevator(x) for x in elevator_result]
    elif ELEVATOR_INFO_KEY not in domain_data:
        domain_data[ELEVATOR_INFO_KEY] = []

    _LOGGER.debug(
        "Alerts refreshed: %d traffic, %d elevator (traffic_304=%s, elevator_304=%s)",
        len(domain_data.get(TRAFFIC_INFO_KEY, [])),
        len(domain_data.get(ELEVATOR_INFO_KEY, [])),
        traffic_not_modified,
        elevator_not_modified,
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
    line_types: dict[str, str] = {}
    if isinstance(line_types_raw, dict):
        for k, v in line_types_raw.items():
            if isinstance(k, str) and isinstance(v, str):
                line_types[k] = v
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

    related_lines = _as_str_list(raw.get("relatedLines"))
    if not related_lines:
        related_lines = _as_str_list(attrs.get("relatedLines"))

    related_stops = _as_int_list(raw.get("relatedStops"))
    if not related_stops:
        related_stops = _as_int_list(attrs.get("relatedStops"))

    station = str(
        attrs.get("station") or raw.get("title") or ""
    ).strip()
    description = str(
        raw.get("description") or attrs.get("location") or ""
    ).strip()
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
        return [str(k).strip() for k in val.keys() if isinstance(k, str) and k.strip()]
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

    matched_traffic: list[TrafficInfo] = []
    if lines:
        for t in all_traffic:
            if t.related_lines_set & lines:
                matched_traffic.append(t)
    else:
        matched_traffic = list(all_traffic)

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
