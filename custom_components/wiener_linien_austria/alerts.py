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

A third user-visible feed, `stoerungkurz` (the stop display's own short
text, scoped to platforms), rides along in the same request — see
`_parse_traffic_short`. One further category exists and is deliberately not
requested yet: `fahrtreppeninfo` (escalator outages; parses with the same
shape as `aufzugsinfo`). It would ride along for zero extra requests, but it
needs sensor attributes, translations and card rendering to be useful, so it
is its own change.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field, replace
from typing import Any, Final

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    ALERT_FEED_ELEVATOR,
    ALERT_FEED_TRAFFIC,
    ALERT_FEED_TRAFFIC_SHORT,
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
from .static import CATALOGUE_KEY, StaticCatalogue

_LOGGER = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data shapes
# ---------------------------------------------------------------------------


@dataclass(slots=True)
class TrafficInfo:
    """One service notice, from either the long or the short disruption feed.

    `category` says which feed it came from, and that decides how
    `get_alerts_for` matches it:

    - `stoerunglang` — control-centre disruptions, scoped to whole LINES
      ("U1: Verspätungen"). Matched against the sensor's tracked lines;
      `related_stops` is empty for these.
    - `stoerungkurz` — the text the physical stop displays, scoped to
      individual PLATFORMS ("Ersatzverkehr / Busse halten bei Haltestelle
      N71"). Matched against the sensor's RBLs, never its lines: a works
      notice naming one platform must not surface at every other stop on
      the same line.
    """

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
    category: str = ALERT_FEED_TRAFFIC
    related_stops: list[int] = field(default_factory=list)  # RBLs (short feed)
    # Tracked lines calling at the matched platform, for a short notice that
    # names no lines of its own. Never set on the shared cache — only on the
    # per-sensor copy `get_alerts_for` hands out, because which lines count
    # depends on the sensor asking. Kept apart from `related_lines` so that
    # field stays exactly what upstream published.
    inferred_lines: list[str] = field(default_factory=list)
    # Pre-computed frozensets — used by `get_alerts_for` for the per-sensor
    # set-intersection that runs on every state attribute read AND every
    # template fetch. Without this cache, each read built a fresh
    # `set(t.related_lines)` per traffic info per call, churning ~hundreds
    # of allocations across busy dashboards. Built in __post_init__ from
    # the immutable parsed lists so they're correct from construction on.
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
            "title": self.title,
            "description": self.description,
            "description_html": self.description_html,
            "related_lines": list(self.related_lines),
            "related_stops": list(self.related_stops),
            "inferred_lines": list(self.inferred_lines),
            "line_types": dict(self.line_types),
            "location": self.location,
            "time_start": self.time_start,
            "time_end": self.time_end,
            "time_created": self.time_created,
            "time_last_update": self.time_last_update,
            "status": self.status,
            "category": self.category,
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
_REQUESTED_FEEDS: Final[tuple[str, ...]] = (
    ALERT_FEED_TRAFFIC,
    ALERT_FEED_TRAFFIC_SHORT,
    ALERT_FEED_ELEVATOR,
)


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
        # the card. Only the long feed carries a status; see
        # `_parse_traffic_short` for why the short one can't be filtered
        # this way.
        short = _merge_short_duplicates(
            [_parse_traffic_short(x) for x in result[ALERT_FEED_TRAFFIC_SHORT]]
        )
        # One list, one card banner. `category` keeps them distinguishable
        # for the matcher and for anyone reading the attribute.
        domain_data[TRAFFIC_INFO_KEY] = [
            t for t in parsed if t.status == "active"
        ] + short
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


def _parse_traffic_short(raw: dict[str, Any]) -> TrafficInfo:
    """Parse one trafficInfos entry for name=stoerungkurz.

    Three things differ from the long feed and all three bite if ignored
    (measured across all 19 live entries, 2026-09-07):

    - **No `status` field at all.** The long feed is filtered to
      `status == "active"`; applying that here would drop every entry.
      These are bounded by `time.start`/`time.end` instead.
    - **`title` and `description` are byte-identical** in all 19. Emitting
      both would make the card render the same sentence as its own summary
      and again as its body, so we split one field into the two the card
      wants.
    - **No `descriptionHTML`.** Left empty; the card falls back to
      `description`.

    The split: 15 of 19 titles carry a category label on the first line
    ("Bauarbeiten", "Ersatzverkehr", "3A Netzänderung") followed by the
    detail, which maps exactly onto title + description. The remaining 4
    are one long sentence with no newline, so we split after the first
    sentence instead — leaving the whole paragraph as a collapsed summary
    reads badly at ~130 characters.
    """
    text = str(raw.get("title") or raw.get("description") or "").strip()
    title, description = _split_short_text(text)
    time = raw.get("time") or {}
    return TrafficInfo(
        name=str(raw.get("name") or ""),
        title=title,
        description=description,
        related_lines=_as_str_list(raw.get("relatedLines")),
        related_stops=_as_int_list(raw.get("relatedStops")),
        time_start=_str_or_none(time.get("start")),
        time_end=_str_or_none(time.get("end")),
        # No upstream status on this feed. "active" is the honest value:
        # presence in the feed IS the active signal, and it keeps the
        # attribute shape uniform for consumers that filter on it.
        status="active",
        category=ALERT_FEED_TRAFFIC_SHORT,
    )


def _split_short_text(text: str) -> tuple[str, str]:
    """Split a stoerungkurz text into (summary, detail).

    Prefers the first line break, falling back to the first sentence end.
    Returns `(text, "")` when neither offers a split point — a short
    single-clause notice is fine as a summary with no body.
    """
    head, sep, rest = text.partition("\n")
    if not sep:
        head, sep, rest = text.partition(". ")
        if sep:
            head += "."
    return (_collapse_ws(head), _collapse_ws(rest))


def _collapse_ws(text: str) -> str:
    """Collapse whitespace runs to single spaces and trim.

    Upstream pads these fields with stray newlines — one entry ends
    "Frauenstiftgasse 7\n\n\n" and another breaks a street number across
    three lines. Left alone they render as blank paragraphs in the card.
    """
    return " ".join(text.split())


def _merge_short_duplicates(items: list[TrafficInfo]) -> list[TrafficInfo]:
    """Collapse short notices that carry identical text AND belong together.

    Upstream publishes one entry per (stop, line) pair, so a single
    incident arrives many times over: `R500-408` and `R500-101` are both
    "Bhf. Hütteldorf / ÖBB-Ersatzbus für <80" at RBL 500, differing only
    in `relatedLines`, and a line-5 obstruction shows up once per affected
    platform. The card dedupes by `name`, so each of those would render as
    its own copy of the same banner. Merge them into one notice carrying
    the union of lines and stops, keeping the first entry's id so the
    card's expand-state key stays stable.

    Identical text alone is NOT enough to conclude "same incident", which
    is what this used to key on. The operator writes from a small fixed
    vocabulary — "Fahrtbehinderung / Falschparker" is boilerplate — so
    unrelated incidents on opposite sides of the city collide on it. On
    2026-09-09 a line-42 obstruction around Volksoper and a line-5 one at
    Westbahnhof merged into a single notice whose union of RBLs then
    matched stops neither incident touched, and whose `time_end` came from
    whichever happened to be parsed first.

    So two entries only merge when something ties them to the same
    incident: the same set of lines (one line, several of its platforms),
    an overlapping platform (one sign, several of its lines), or — for
    entries naming no lines at all, where equal empty sets say nothing —
    the same dispatch timestamp. Merging
    is transitive — three lines sharing two of three platforms are one
    incident — so entries are grouped by connected component rather than
    folded into whichever arrived first.
    """
    # One bucket per identical text; grouping only ever happens inside a
    # bucket, so the O(n^2) linking below runs over a handful of entries.
    buckets: dict[tuple[str, str], list[TrafficInfo]] = {}
    for item in items:
        buckets.setdefault((item.title, item.description), []).append(item)

    out: list[TrafficInfo] = []
    for bucket in buckets.values():
        groups: list[TrafficInfo] = []
        for item in bucket:
            linked = [g for g in groups if _same_short_incident(g, item)]
            if not linked:
                groups.append(item)
                continue
            # Fold `item` and every group it links to into the earliest of
            # them — that keeps the surviving id (and `time_end`) the one
            # the feed listed first, and it is what makes the relation
            # transitive: a late entry bridging two groups unites them.
            head, *rest = linked
            for other in (*rest, item):
                _absorb_short(head, other)
            absorbed = {id(g) for g in rest}
            groups = [g for g in groups if id(g) not in absorbed]
        out.extend(groups)
    return out


def _same_short_incident(a: TrafficInfo, b: TrafficInfo) -> bool:
    """Whether two same-text short notices describe one incident.

    Overlapping stops covers "one platform, reported per line". Equal line
    sets covers "one line, reported per platform". Either is enough.

    Entries naming no lines need a different tie. Two empty sets are
    trivially equal, so the line rule would merge every line-less copy of
    a stock phrase city-wide — "Fahrtbehinderung / wegen Rettungseinsatz"
    is exactly as generic as the "Falschparker" collision the rule above
    was fixed for. The operator dispatches one incident's platform texts
    in a single batch, so they share `time.start` to the second (live
    2026-09-10: all six "Betrieb ab Eichenstraße" platforms at 10:27:56,
    the neighbouring "Fahrtbehinderung" batch at 10:26:56). That is the
    tie; an entry with no start time links on shared platforms only.
    """
    if a.related_stops_set & b.related_stops_set:
        return True
    if a.related_lines_set or b.related_lines_set:
        return a.related_lines_set == b.related_lines_set
    return a.time_start is not None and a.time_start == b.time_start


def _absorb_short(target: TrafficInfo, other: TrafficInfo) -> None:
    """Union `other`'s lines and stops into `target`, in first-seen order."""
    for line in other.related_lines:
        if line not in target.related_lines:
            target.related_lines.append(line)
    for stop in other.related_stops:
        if stop not in target.related_stops:
            target.related_stops.append(stop)
    # Rebuild the lookup sets after mutating the backing lists.
    target.related_lines_set = frozenset(target.related_lines)
    target.related_stops_set = frozenset(target.related_stops)


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

    - Traffic (`stoerunglang`): match if any `related_lines` overlaps
      `lines`. If `lines` is empty/None, return all of them (fall-through).
    - Traffic (`stoerungkurz`): needs an RBL hit AND, when it names its
      lines, a line hit. No line fall-through and no all-traffic
      fall-through: these are the texts a single platform's display
      shows, so a works notice for one stop must never appear at the
      other 30 stops on that line. An entry with no `related_stops` is
      unmatchable and therefore dropped — in practice upstream sets it on
      every one.

      The RBL half alone is not the filter it looks like: `CONF_RBLS`
      holds every platform of the DIVA, not just the ones the tracked
      lines call at, so at a hub it lets in every line the station sees.
      A Westbahnhof entry tracking only U3 surfaced a tram-5 obstruction
      that way (2026-09-09), while the same stop's departure list
      correctly showed no tram 5 at all. Hence the second half: an entry
      that names lines must name one of ours.

      An entry with an empty `related_lines` gets the same treatment by
      another route: the static schedule says which lines call at the
      platform it hit, and one of them must be tracked. Upstream leaves
      the field empty for stop-wide texts ("Haltestelle Parlament …
      aufgelassen") but also for plain incident texts, and matching those
      on RBL alone put a tram 6/18 "Betrieb ab Eichenstraße" on a U3-only
      Westbahnhof card (2026-09-10) through the Gürtel tram platforms in
      its DIVA. The tracked lines found there go out as `inferred_lines`
      so the card can badge a notice that otherwise names nothing. When
      the catalogue isn't loaded or doesn't know the platform, the entry
      matches on RBL alone as before — a missing schedule must not hide
      notices.

      Every matched short entry also gets `location` set to its platform's
      station name, since upstream publishes none for this feed. Both
      additions land on a copy; the shared cache is never touched.
    - Elevator: match if any `related_stops` overlaps `rbls`. If `rbls` is
      empty/None, return []. An elevator outage with no `related_stops` is
      only surfaced when it also matches on `related_lines`.
    """
    domain_data = hass.data.get(DOMAIN, {})
    all_traffic: list[TrafficInfo] = domain_data.get(TRAFFIC_INFO_KEY, []) or []
    all_elevator: list[ElevatorInfo] = domain_data.get(ELEVATOR_INFO_KEY, []) or []
    cached = domain_data.get(CATALOGUE_KEY)
    catalogue = cached if isinstance(cached, StaticCatalogue) else None

    matched_traffic: list[TrafficInfo] = []
    for t in all_traffic:
        if t.category != ALERT_FEED_TRAFFIC_SHORT:
            if not lines or t.related_lines_set & lines:
                matched_traffic.append(t)
            continue
        hit = t.related_stops_set & rbls if rbls else frozenset()
        if not hit:
            continue
        inferred: tuple[str, ...] = ()
        if t.related_lines_set:
            if lines and not t.related_lines_set & lines:
                continue
        elif lines:
            served = _lines_at_platforms(catalogue, hit)
            if served is not None:
                inferred = tuple(line for line in served if line in lines)
                if not inferred:
                    continue
        matched_traffic.append(_with_stop_context(t, hit, catalogue, inferred))

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


def _lines_at_platforms(
    catalogue: StaticCatalogue | None, rbls: frozenset[int]
) -> tuple[str, ...] | None:
    """Scheduled lines at `rbls`, or None when the schedule can't say."""
    if catalogue is None or catalogue.trip_patterns is None:
        return None
    return catalogue.trip_patterns.lines_at_rbls(rbls)


def _with_stop_context(
    t: TrafficInfo,
    hit: frozenset[int],
    catalogue: StaticCatalogue | None,
    inferred: tuple[str, ...],
) -> TrafficInfo:
    """Per-sensor copy of a short notice carrying where and for whom it applies.

    Returns `t` itself when there is nothing to add, so the common case
    allocates nothing.
    """
    location = t.location
    if location is None and catalogue is not None:
        index = catalogue.index_by_rbl()
        names = dict.fromkeys(
            entry[1] for rbl in sorted(hit) if (entry := index.get(rbl)) is not None
        )
        location = ", ".join(names) or None
    if location == t.location and not inferred:
        return t
    return replace(t, location=location, inferred_lines=list(inferred))
