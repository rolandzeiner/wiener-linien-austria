"""Static OGD data: stop catalogue, DIVA → RBL mapping, and line trip patterns.

Wiener Linien publishes a handful of CSVs at the same base URL as the realtime
API. We use four of them:

- `haltestellen.csv`     — one row per station (DIVA, name, coordinates).
- `haltepunkte.csv`      — one row per physical platform (RBL = StopID, parent
  DIVA, coordinates). Bridges stop names to the RBL list the monitor endpoint
  needs.
- `linien.csv`           — line catalogue (LineID → "U1", MeansOfTransport).
  Resolves the live `/monitor` line label to the numeric LineID used in the
  trip-pattern CSV, and exposes the canonical vehicle type per line.
- `fahrwegverlaeufe.csv` — ordered RBL sequence per (LineID, PatternID,
  Direction). Powers the per-departure "stops ahead" enrichment.

The catalogue is stable for days/weeks at a time so we fetch it once, cache it
on disk via `homeassistant.helpers.storage.Store`, and refresh weekly.
"""
from __future__ import annotations

import asyncio
import csv
import io
import re
import logging
from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    MAX_STOPS_AHEAD,
    STATIC_FILES,
    USER_AGENT,
)
from .http import CacheValidators, base_request_headers

_LOGGER = logging.getLogger(__name__)

# Natural-numeric sort for line labels, applied to lines_at_diva. The
# user-visible order should be ascending (so "2" < "10" < "13A" < "71"
# < "D" < "U1" < "U6") with nightlines (N + digit) pushed to the end —
# regardless of nightline service hours, the daytime view should not
# interleave N-lines with regular ones, and the +N reveal at hub stops
# reads more naturally when N66 sits after the trams.
_LINE_LEADING_DIGITS_RE = re.compile(r"^(\d+)?(.*)$")
_LINE_BUS_DAY_RE = re.compile(r"^\d+[A-Z]+$")
_LINE_SORT_LETTER_TIE = 10**9  # sentinel: letter-only labels rank after numerics

# Mode-of-transport sort tiers — applied first so the lines_at_diva
# changeover chips group by colour-coded mode (Metro → Tram → Bus →
# Nightline) rather than interleaving every mode by number alone.
# Matches the GTFS palette tiers the card now renders.
_MOT_SORT_RANK: dict[str, int] = {
    "ptMetro": 0,
    "ptTram": 1,
    "ptBusCity": 2,
    "ptBusNight": 3,
}
# Sentinel for unknown MoT values — derived from the table size so it
# always ranks AFTER every defined tier, even if Wiener Linien adds a
# fifth (tourist trains have been mentioned in past releases) and the
# table grows. Hard-coded `99` would collide if we expanded past it.
_MOT_SORT_UNKNOWN = len(_MOT_SORT_RANK)


def _heuristic_mot(label: str) -> str | None:
    """Best-effort MoT inference from label format alone.

    Used when no MoT lookup table is available (e.g. legacy cache entries
    that round-tripped through `_trip_patterns_from_store` before the
    table was built). Wiener Linien label conventions:
      - `U` + digit → Metro
      - `N` + digit → Nightline bus
      - digits + letter suffix (`7A`, `13A`) → city bus
      - everything else (digits-only, single letter, two-letter `WLB`) → tram

    Wiener Linien data is always uppercase, but the heuristic normalises
    via `.upper()` so every branch uses the same case-folding rule —
    keeps the rule applicable to user input or future schema surprises
    without one branch silently disagreeing with the others.

    Returns None only on empty input.
    """
    if not label:
        return None
    upper = label.upper()
    head = upper[0]
    if len(upper) >= 2 and head == "U" and upper[1].isdigit():
        return "ptMetro"
    if len(upper) >= 2 and head == "N" and upper[1].isdigit():
        return "ptBusNight"
    if _LINE_BUS_DAY_RE.match(upper):
        return "ptBusCity"
    return "ptTram"


def _line_sort_key(label: str, mot: str | None = None) -> tuple[int, int, int, str]:
    """Return a sort key for a Wiener Linien line label.

    Tier 1 — mode of transport (Metro → Tram → BusCity → BusNight →
    unknown). Groups colour-coded modes together on the per-stop
    changeover chips. When `mot` is None, falls back to a label-format
    heuristic (`_heuristic_mot`) so callers without an authoritative
    lookup still produce sensible ordering.
    Tier 2 — leading-digit integer (so "2" < "10" < "13A"); letter-only
    labels fall to the sentinel and sort alphabetically among themselves.
    Tier 3 — full remaining label so "13A" < "13B".
    """
    resolved_mot = mot or _heuristic_mot(label)
    mot_rank = (
        _MOT_SORT_RANK.get(resolved_mot, _MOT_SORT_UNKNOWN)
        if resolved_mot
        else _MOT_SORT_UNKNOWN
    )
    # Strip the mode-letter prefix from the body so within-mode sort is
    # purely numeric: "U1" / "U6" sort by 1 / 6, not as letter-only.
    if resolved_mot in ("ptMetro", "ptBusNight"):
        body = label[1:]
    else:
        body = label
    match = _LINE_LEADING_DIGITS_RE.match(body)
    if match is None:  # never happens — re matches empty string too
        return (mot_rank, 0, _LINE_SORT_LETTER_TIE, body)
    digits, rest = match.group(1), match.group(2)
    numeric = int(digits) if digits else _LINE_SORT_LETTER_TIE
    return (mot_rank, 0, numeric, rest)


def _sort_line_labels(
    labels: Iterable[str],
    mot_by_label: dict[str, str] | None = None,
) -> tuple[str, ...]:
    """Return labels grouped by mode of transport, then numerically.

    When `mot_by_label` is supplied, uses the authoritative MoT for each
    label; otherwise falls back to a label-format heuristic that handles
    the four standard Wiener Linien conventions (U-Bahn, tram, city bus,
    nightline). Both paths produce the same final ordering for the
    standard label formats.
    """
    if mot_by_label:
        return tuple(
            sorted(
                labels,
                key=lambda label: _line_sort_key(label, mot_by_label.get(label)),
            )
        )
    return tuple(sorted(labels, key=lambda label: _line_sort_key(label)))

STORE_VERSION = 1
STORE_KEY = f"{DOMAIN}_static"

# hass.data key for the shared catalogue (or in-flight load task). Holding it
# in domain_data means a multi-entry user only pays the static-fetch cost
# once per HA session — without this, each coordinator setup independently
# triggered _fetch_and_build, multiplying the bandwidth and Wiener-Linien
# Pi stresses by N entries. Exported (no leading underscore) so coordinator,
# sensor, and diagnostics consumers reference the same constant rather than
# duplicating the bare string — a typo in any caller would silently break
# the catalogue lookup on that one path only.
CATALOGUE_KEY = "static_catalogue"


@dataclass
class Station:
    """One Wiener Linien station (DIVA) with its RBL platforms."""

    diva: int
    name: str
    municipality: str
    longitude: float
    latitude: float
    rbls: list[int] = field(default_factory=list)


@dataclass(slots=True, frozen=True)
class TripPattern:
    """One ordered route variant: line + direction + RBL sequence.

    `stops` is a tuple of RBLs in the order the vehicle visits them. Direction
    is the numeric value Wiener Linien uses in the OGD CSVs (1 or 2) — we keep
    it as-is for diagnostics; matching itself uses RBL containment + terminus
    string, not the direction code, which sidesteps any ambiguity around how
    `/monitor`'s "H"/"R" maps to the CSV's 1/2.
    """

    line_id: int
    pattern_id: int
    direction: int
    stops: tuple[int, ...]


@dataclass
class TripPatternIndex:
    """Compact index over `fahrwegverlaeufe` + `linien` + GTFS `routes.txt`.

    `patterns_by_line` keys patterns by LineID; the inner list holds every
    PatternID variant (both directions, branching termini, short turns).
    `lines_by_label` resolves the live `/monitor` `line.name` ("U1") to its
    LineID. `means_by_line` carries the authoritative MeansOfTransport per
    line for diagnostics consumers.
    `lines_at_diva` powers the per-stop changeover badges: for every
    DIVA, the sorted set of line labels (e.g. "U1", "13A", "71") of every
    line whose schedule passes through that station. Built at parse time
    by walking every pattern's RBLs, resolving each to its parent DIVA via
    the haltepunkte index, and aggregating the line labels.
    `colors_by_line` / `text_colors_by_line` map a line label ("U1") to its
    Wiener-Linien-published `route_color` / `route_text_color` as 6-digit
    uppercase hex (no `#`). Sourced from GTFS `routes.txt`. Empty when the
    routes file hasn't been fetched yet (cache predates the feature, or
    fetch failed) — the card falls through to its built-in fallbacks.
    """

    patterns_by_line: dict[int, list[TripPattern]] = field(default_factory=dict)
    lines_by_label: dict[str, int] = field(default_factory=dict)
    means_by_line: dict[int, str] = field(default_factory=dict)
    lines_at_diva: dict[int, tuple[str, ...]] = field(default_factory=dict)
    colors_by_line: dict[str, str] = field(default_factory=dict)
    text_colors_by_line: dict[str, str] = field(default_factory=dict)

    @property
    def line_count(self) -> int:
        """Number of distinct LineIDs in the index."""
        return len(self.lines_by_label)

    @property
    def pattern_count(self) -> int:
        """Total number of TripPattern variants across all lines."""
        return sum(len(v) for v in self.patterns_by_line.values())


@dataclass
class StaticCatalogue:
    """In-memory catalogue of Wiener Linien stops and (optionally) trip patterns.

    `stations_by_diva` maps DIVA → Station (with its rbls populated).
    `last_fetched` is the UTC timestamp of the successful fetch that built it.
    `validators` is the per-CSV (ETag, Last-Modified) pair captured from the
    last successful fetch so the next refresh can short-circuit on 304.
    `trip_patterns` is None on caches written before v1.4 (the field was
    introduced additively); the next refresh fills it in.
    """

    stations_by_diva: dict[int, Station]
    last_fetched: str  # ISO 8601 UTC
    validators: dict[str, CacheValidators] = field(default_factory=dict)
    trip_patterns: TripPatternIndex | None = None
    # Reverse index: RBL → (DIVA, station name). Built lazily on first
    # call to `index_by_rbl()` and cached on the dataclass instance so
    # subsequent lookups are O(1). Without it, the trip-pattern matcher
    # ran a linear `for station in stations_by_diva.values()` per RBL
    # per departure per coordinator tick — ~9 k scans/min at busy hubs.
    _rbl_index: dict[int, tuple[int, str]] | None = field(
        default=None, repr=False, compare=False
    )

    def search(self, query: str, limit: int = 20) -> list[Station]:
        """Return stations whose name contains the query (case-insensitive)."""
        needle = query.strip().casefold()
        if not needle:
            return []
        results = [
            s for s in self.stations_by_diva.values()
            if needle in s.name.casefold()
        ]
        # Prefer name-starts-with matches, then lexicographic.
        results.sort(
            key=lambda s: (not s.name.casefold().startswith(needle), s.name)
        )
        return results[:limit]

    def index_by_rbl(self) -> dict[int, tuple[int, str]]:
        """Return (cached) RBL → (DIVA, station name) reverse index.

        Built once on first access by walking every Station's `rbls`. The
        index lives on the catalogue instance, so it survives every poll
        and only rebuilds when a new catalogue is fetched (which replaces
        the whole instance). Tens of thousands of `_diva_for_rbl` /
        `_station_name_for_rbl` calls per coordinator tick collapse to
        dict lookups.
        """
        if self._rbl_index is None:
            index: dict[int, tuple[int, str]] = {}
            for diva, station in self.stations_by_diva.items():
                for rbl in station.rbls:
                    index[rbl] = (diva, station.name)
            self._rbl_index = index
        return self._rbl_index


async def async_get_catalogue(hass: HomeAssistant) -> StaticCatalogue:
    """Return a process-wide memoized catalogue, sharing across all callers.

    The first caller triggers the actual `async_load_catalogue` and stores
    the in-flight Task in `hass.data[DOMAIN]`. Concurrent callers (the
    config flow, every coordinator's `async_setup`, the periodic refresh)
    await the same Task and pay zero additional download cost. Once the
    Task resolves, the StaticCatalogue replaces it in domain_data so
    subsequent calls are O(1).

    This is the entry point coordinators / config-flow should use; the
    underlying `async_load_catalogue` stays public for the periodic
    refresher and tests that exercise the load path directly.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    cached = domain_data.get(CATALOGUE_KEY)
    if isinstance(cached, StaticCatalogue):
        return cached
    if isinstance(cached, asyncio.Task):
        # already loading — await the in-flight task
        result: StaticCatalogue = await cached
        return result

    task: asyncio.Task[StaticCatalogue] = asyncio.create_task(
        async_load_catalogue(hass)
    )
    domain_data[CATALOGUE_KEY] = task
    try:
        catalogue = await task
    except BaseException:
        # Drop the failed task so the next caller retries from scratch.
        domain_data.pop(CATALOGUE_KEY, None)
        raise
    domain_data[CATALOGUE_KEY] = catalogue
    return catalogue


def async_set_cached_catalogue(
    hass: HomeAssistant, catalogue: StaticCatalogue
) -> None:
    """Replace the shared catalogue ref (called by the periodic refresher).

    Existing coordinators continue to hold their captured ref from setup
    — acceptable because trip patterns / stops / RBLs change on a
    weeks-to-months cadence. This call ensures only that *new*
    coordinators (after entry reload) and the next config-flow
    invocation see the refreshed data.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[CATALOGUE_KEY] = catalogue


async def async_load_catalogue(hass: HomeAssistant) -> StaticCatalogue:
    """Return the current static catalogue, loading from cache or network.

    If both cache and network are unavailable, raises RuntimeError.

    When the cache predates the additive `trip_patterns` field,
    schedules a *background* refetch and returns the stale cache
    immediately so coordinator setup never blocks on the multi-MB
    fahrwegverlaeufe.csv download. The background task updates the
    shared catalogue ref via `async_set_cached_catalogue` when it
    completes; running coordinators that read the ref live (rather than
    capturing it once at setup) pick up the refreshed data without a
    restart.
    """
    store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
    cached = await store.async_load()
    if cached:
        try:
            catalogue = _catalogue_from_store(cached)
        except (KeyError, ValueError, TypeError) as err:
            _LOGGER.warning(
                "Ignoring corrupt static cache (%s); refetching from upstream",
                err,
            )
        else:
            needs_refresh_reason: str | None = None
            if catalogue.trip_patterns is None:
                needs_refresh_reason = "predates trip_patterns"
            elif not catalogue.trip_patterns.lines_at_diva:
                # Older cache wrote trip_patterns without the
                # lines_at_diva index — refresh to populate it.
                needs_refresh_reason = "missing lines_at_diva index"
            elif not catalogue.trip_patterns.colors_by_line:
                # Cache predates GTFS routes.txt — background-refresh
                # so the card isn't stuck on the fallback palette until
                # the next weekly tick.
                needs_refresh_reason = "missing route colours"
            if needs_refresh_reason is not None:
                _LOGGER.warning(
                    "Static cache %s; scheduling background refresh",
                    needs_refresh_reason,
                )
                hass.async_create_background_task(
                    _async_background_refresh(hass, prior=catalogue, store=store),
                    name=f"{DOMAIN}_trip_patterns_migration",
                )
            return catalogue

    catalogue = await _fetch_and_build(hass, prior=None)
    await store.async_save(_catalogue_to_store(catalogue))
    return catalogue


async def _async_background_refresh(
    hass: HomeAssistant,
    prior: StaticCatalogue,
    store: Store[dict[str, Any]],
) -> None:
    """Background-task helper: refresh + persist + publish the catalogue.

    Catches every refresh failure mode (network, timeout, parse, cancel)
    and logs at WARNING. On success, writes the new payload to Store and
    swaps the shared catalogue ref so coordinators that read it live see
    the refreshed data on their next parse.
    """
    try:
        refreshed = await _fetch_and_build(hass, prior=prior)
    except asyncio.CancelledError:
        # HA stopping or task explicitly cancelled — don't log noisily.
        raise
    except Exception as err:  # noqa: BLE001
        # Network, parse, schema-surprise — none should crash the
        # integration. Log + retry on the next weekly tick.
        _LOGGER.warning(
            "Background refresh failed (%s: %s); will retry on the next weekly tick",
            type(err).__name__,
            err,
        )
        return
    if refreshed is not prior:
        await store.async_save(_catalogue_to_store(refreshed))
    async_set_cached_catalogue(hass, refreshed)
    if refreshed.trip_patterns is not None:
        _LOGGER.warning(
            "Trip-pattern refresh complete: %d lines, %d patterns",
            refreshed.trip_patterns.line_count,
            refreshed.trip_patterns.pattern_count,
        )


async def async_refresh_catalogue(hass: HomeAssistant) -> StaticCatalogue | None:
    """Best-effort refresh: on network failure, keep the existing cache.

    Returns the new catalogue on success, None on failure or 304.
    """
    store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
    cached_payload = await store.async_load()
    prior: StaticCatalogue | None = None
    if cached_payload:
        try:
            prior = _catalogue_from_store(cached_payload)
        except (KeyError, ValueError, TypeError):
            prior = None

    try:
        catalogue = await _fetch_and_build(hass, prior=prior)
    except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as err:
        _LOGGER.warning("Static catalogue refresh failed, keeping cache: %s", err)
        return None

    # _fetch_and_build returns the prior catalogue verbatim when every CSV
    # came back 304 — no parse, no diff, just skip the Store write too.
    if prior is not None and catalogue is prior:
        _LOGGER.debug("Static catalogue unchanged (all CSVs 304); skipping rewrite")
        return None

    await store.async_save(_catalogue_to_store(catalogue))
    return catalogue


async def _fetch_and_build(
    hass: HomeAssistant, prior: StaticCatalogue | None
) -> StaticCatalogue:
    """Download the four OGD CSVs, merge into a StaticCatalogue.

    When `prior` is set, sends If-None-Match / If-Modified-Since per file.
    If *every* CSV replies 304, returns `prior` unchanged so the caller can
    skip the disk write. The trip-pattern CSV pair (linien + fahrwegverlaeufe)
    is fail-soft: if either download throws, the existing trip_patterns from
    `prior` are preserved and stations/RBLs still refresh.
    """
    session = async_get_clientsession(hass)
    timeout = aiohttp.ClientTimeout(total=30)

    halte_validators = (
        prior.validators.get("haltestellen") if prior else None
    ) or CacheValidators()
    punkte_validators = (
        prior.validators.get("haltepunkte") if prior else None
    ) or CacheValidators()
    linien_validators = (
        prior.validators.get("linien") if prior else None
    ) or CacheValidators()
    fahr_validators = (
        prior.validators.get("fahrwegverlaeufe") if prior else None
    ) or CacheValidators()
    routes_validators = (
        prior.validators.get("routes") if prior else None
    ) or CacheValidators()

    (
        haltestellen_result,
        haltepunkte_result,
        linien_result,
        fahr_result,
        routes_result,
    ) = await asyncio.gather(
        _download_text(
            session, STATIC_FILES["haltestellen"], timeout, halte_validators
        ),
        _download_text(
            session, STATIC_FILES["haltepunkte"], timeout, punkte_validators
        ),
        _download_or_fail_soft(
            session, STATIC_FILES["linien"], timeout, linien_validators
        ),
        _download_or_fail_soft(
            session,
            STATIC_FILES["fahrwegverlaeufe"],
            timeout,
            fahr_validators,
        ),
        _download_or_fail_soft(
            session, STATIC_FILES["routes"], timeout, routes_validators
        ),
    )

    halte_text, halte_validators_new = haltestellen_result
    punkte_text, punkte_validators_new = haltepunkte_result
    linien_text, linien_validators_new, linien_failed = linien_result
    fahr_text, fahr_validators_new, fahr_failed = fahr_result
    routes_text, routes_validators_new, routes_failed = routes_result

    # All-304 fast path: only valid if every optional fetch actually
    # happened (not failed) and also returned 304. A failed fetch is NOT
    # the same as 304 — we lose the freshness signal, so we fall through
    # and rebuild from prior.
    all_304 = (
        halte_text is None
        and punkte_text is None
        and linien_text is None
        and fahr_text is None
        and routes_text is None
        and not linien_failed
        and not fahr_failed
        and not routes_failed
        and prior is not None
    )
    if all_304:
        return prior  # type: ignore[return-value]

    # Stations: either freshly parsed or carried over from prior unchanged.
    if halte_text is None and prior is not None:
        stations = {
            diva: Station(
                diva=s.diva,
                name=s.name,
                municipality=s.municipality,
                longitude=s.longitude,
                latitude=s.latitude,
                rbls=[],  # rebuilt below from fresh haltepunkte
            )
            for diva, s in prior.stations_by_diva.items()
        }
    elif halte_text is not None:
        stations = _parse_haltestellen(halte_text)
    else:
        # No prior, no fresh — shouldn't happen, but be defensive.
        stations = {}

    if punkte_text is not None:
        _merge_haltepunkte(stations, punkte_text)
    elif prior is not None:
        # Reuse prior RBL assignments since haltepunkte didn't change.
        for diva, s in stations.items():
            prior_station = prior.stations_by_diva.get(diva)
            if prior_station is not None:
                s.rbls = list(prior_station.rbls)

    # Trip-pattern index: re-parse only when at least one of the two source
    # CSVs came back fresh AND neither failed. On any failure / both-304,
    # carry the prior index forward unchanged. Carrying prior is the
    # important fail-soft guarantee — a temporary fetch hiccup must not
    # wipe the stops_ahead feature for the next 7 days.
    trip_patterns = prior.trip_patterns if prior is not None else None
    pattern_status = "preserved"
    if not linien_failed and not fahr_failed:
        if linien_text is not None or fahr_text is not None or prior is None:
            # Need both bodies to (re)build. If exactly one is 304, we have
            # to refetch the other unconditionally — simpler to just skip
            # the rebuild and keep the prior index. The next weekly refresh
            # will catch any change.
            if linien_text is not None and fahr_text is not None:
                try:
                    trip_patterns = _parse_trip_patterns(
                        linien_text, fahr_text, stations
                    )
                    pattern_status = "fresh"
                except (KeyError, ValueError) as err:
                    _LOGGER.warning(
                        "Trip-pattern CSV parse failed, keeping prior index: %s",
                        err,
                    )
            elif prior is None:
                # First-ever load: only one of the two arrived. Skip the
                # index for this cycle; next refresh will complete it.
                trip_patterns = None
                pattern_status = "partial-skip"
    else:
        pattern_status = "fetch-failed"

    # Route colours (GTFS routes.txt). Independent of the trip-pattern
    # rebuild — the colour map only depends on routes.txt, so a fresh
    # routes payload can refresh colours even when linien/fahr were 304.
    # Attached onto whichever TripPatternIndex we end up returning so
    # the card has a single per-line catalogue to read.
    color_status = "preserved"
    if trip_patterns is not None:
        if routes_text is not None and not routes_failed:
            try:
                bg, fg = _parse_route_colors(routes_text)
                trip_patterns = TripPatternIndex(
                    patterns_by_line=trip_patterns.patterns_by_line,
                    lines_by_label=trip_patterns.lines_by_label,
                    means_by_line=trip_patterns.means_by_line,
                    lines_at_diva=trip_patterns.lines_at_diva,
                    colors_by_line=bg,
                    text_colors_by_line=fg,
                )
                color_status = "fresh"
            except (KeyError, ValueError) as err:
                _LOGGER.warning(
                    "Route-colour CSV parse failed, keeping prior colours: %s",
                    err,
                )
        elif routes_failed:
            color_status = "fetch-failed"

    _LOGGER.info(
        "Loaded Wiener Linien static catalogue: %d stations, %d platforms"
        " (haltestellen=%s, haltepunkte=%s, linien=%s, fahrwegverlaeufe=%s,"
        " routes=%s, trip_patterns=%s, colors=%s)",
        len(stations),
        sum(len(s.rbls) for s in stations.values()),
        "fresh" if halte_text is not None else "304",
        "fresh" if punkte_text is not None else "304",
        "fresh" if linien_text is not None else ("failed" if linien_failed else "304"),
        "fresh" if fahr_text is not None else ("failed" if fahr_failed else "304"),
        "fresh" if routes_text is not None else ("failed" if routes_failed else "304"),
        pattern_status,
        color_status,
    )
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched=dt_util.utcnow().isoformat(),
        validators={
            "haltestellen": halte_validators_new,
            "haltepunkte": punkte_validators_new,
            "linien": linien_validators_new,
            "fahrwegverlaeufe": fahr_validators_new,
            "routes": routes_validators_new,
        },
        trip_patterns=trip_patterns,
    )


async def _download_text(
    session: aiohttp.ClientSession,
    url: str,
    timeout: aiohttp.ClientTimeout,
    validators: CacheValidators,
) -> tuple[str | None, CacheValidators]:
    """GET a CSV URL with conditional caching.

    Returns (body_text, updated_validators). body_text is None when the
    server replies 304 — caller treats that as "no change, reuse prior".
    The validators object is updated in-place from response headers and
    returned so callers can persist it.
    """
    resp = await session.get(
        url,
        headers={**base_request_headers(USER_AGENT), **validators.to_request_headers()},
        timeout=timeout,
    )
    if resp.status == 304:
        validators.update_from_response(resp)
        return (None, validators)
    resp.raise_for_status()
    body = await resp.text()
    validators.update_from_response(resp)
    return (body, validators)


async def _download_or_fail_soft(
    session: aiohttp.ClientSession,
    url: str,
    timeout: aiohttp.ClientTimeout,
    validators: CacheValidators,
) -> tuple[str | None, CacheValidators, bool]:
    """Like `_download_text` but never raises.

    Returns (body_text, validators, failed). On any error, body is None,
    validators are returned unchanged, and `failed` is True so the caller
    can distinguish a soft failure from a 304.
    """
    try:
        body, new_validators = await _download_text(session, url, timeout, validators)
    except (aiohttp.ClientError, asyncio.TimeoutError) as err:
        _LOGGER.warning("Optional static CSV fetch failed (%s): %s", url, err)
        return (None, validators, True)
    return (body, new_validators, False)


def _parse_haltestellen(csv_text: str) -> dict[int, Station]:
    """Parse the haltestellen.csv into {diva: Station}.

    Columns: DIVA;PlatformText;Municipality;MunicipalityID;Longitude;Latitude
    Wiener Linien call the station name column `PlatformText` for historical
    reasons — in practice it's the human-readable stop name.
    """
    stations: dict[int, Station] = {}
    reader = csv.DictReader(io.StringIO(csv_text), delimiter=";")
    for row in reader:
        try:
            diva = int(row["DIVA"])
            lon = float(row["Longitude"])
            lat = float(row["Latitude"])
        except (KeyError, ValueError, TypeError):
            continue
        stations[diva] = Station(
            diva=diva,
            name=row.get("PlatformText", "").strip(),
            municipality=row.get("Municipality", "").strip(),
            longitude=lon,
            latitude=lat,
        )
    return stations


def _merge_haltepunkte(
    stations: dict[int, Station], csv_text: str
) -> None:
    """Populate station.rbls from haltepunkte.csv.

    Columns: StopID;DIVA;StopText;Municipality;MunicipalityID;Longitude;Latitude
    StopID is the RBL number.
    """
    reader = csv.DictReader(io.StringIO(csv_text), delimiter=";")
    for row in reader:
        try:
            rbl = int(row["StopID"])
            diva = int(row["DIVA"])
        except (KeyError, ValueError, TypeError):
            continue
        station = stations.get(diva)
        if station is not None:
            station.rbls.append(rbl)


def _parse_trip_patterns(
    linien_text: str,
    fahr_text: str,
    stations: dict[int, Station] | None = None,
) -> TripPatternIndex:
    """Build a TripPatternIndex from linien.csv + fahrwegverlaeufe.csv.

    `linien.csv` columns: LineID;LineText;SortingHelp;Realtime;MeansOfTransport
    `fahrwegverlaeufe.csv` columns: LineID;PatternID;StopSeqCount;StopID;Direction

    Patterns are grouped by (LineID, PatternID), sorted by StopSeqCount, and
    materialised as immutable RBL tuples. Real-world data has gaps in
    StopSeqCount (e.g. 0,1,3,4) — we sort by the value, the gaps don't
    affect the resulting order.

    When `stations` is provided, also builds the `lines_at_diva` index that
    powers the per-stop changeover-line badges on the card. Without it the
    feature is silently disabled (an empty dict).
    """
    lines_by_label: dict[str, int] = {}
    means_by_line: dict[int, str] = {}
    line_reader = csv.DictReader(io.StringIO(linien_text), delimiter=";")
    for row in line_reader:
        try:
            line_id = int(row["LineID"])
        except (KeyError, ValueError, TypeError):
            continue
        label = (row.get("LineText") or "").strip()
        if label:
            lines_by_label[label] = line_id
        means = (row.get("MeansOfTransport") or "").strip()
        if means:
            means_by_line[line_id] = means

    label_for_line: dict[int, str] = {v: k for k, v in lines_by_label.items()}

    # RBL → parent DIVA, derived once from the stations index. Skipped
    # when stations is None — the feature degrades to no transfer chips.
    rbl_to_diva: dict[int, int] = {}
    if stations is not None:
        for diva, station in stations.items():
            for rbl in station.rbls:
                rbl_to_diva[rbl] = diva

    # Group fahrwegverlaeufe rows by (line_id, pattern_id) and collect
    # (sequence, rbl, direction) tuples. We sort by sequence at the end.
    # Concurrently aggregate `lines_at_diva`: per DIVA, the set of line
    # labels of every line whose pattern visits that station.
    grouped: dict[tuple[int, int], list[tuple[int, int, int]]] = {}
    lines_per_diva: dict[int, set[str]] = {}
    fahr_reader = csv.DictReader(io.StringIO(fahr_text), delimiter=";")
    for row in fahr_reader:
        try:
            line_id = int(row["LineID"])
            pattern_id = int(row["PatternID"])
            seq = int(row["StopSeqCount"])
            rbl = int(row["StopID"])
            direction = int(row["Direction"])
        except (KeyError, ValueError, TypeError):
            continue
        grouped.setdefault((line_id, pattern_id), []).append(
            (seq, rbl, direction)
        )
        if rbl_to_diva:
            label = label_for_line.get(line_id)
            stop_diva = rbl_to_diva.get(rbl)
            if label and stop_diva is not None:
                lines_per_diva.setdefault(stop_diva, set()).add(label)

    patterns_by_line: dict[int, list[TripPattern]] = {}
    for (line_id, pattern_id), entries in grouped.items():
        entries.sort(key=lambda t: t[0])
        # All rows for one PatternID share a Direction; take the first.
        direction = entries[0][2]
        stops = tuple(rbl for _seq, rbl, _dir in entries)
        if not stops:
            continue
        patterns_by_line.setdefault(line_id, []).append(
            TripPattern(
                line_id=line_id,
                pattern_id=pattern_id,
                direction=direction,
                stops=stops,
            )
        )

    # Build label → MoT for the per-stop chip sort: groups Metro / Tram /
    # Bus / Nightline together so the colour-coded chips on the card line
    # up by mode rather than interleaving every mode by number.
    mot_by_label: dict[str, str] = {}
    for label, line_id in lines_by_label.items():
        mot = means_by_line.get(line_id)
        if mot:
            mot_by_label[label] = mot

    lines_at_diva: dict[int, tuple[str, ...]] = {
        diva: _sort_line_labels(labels, mot_by_label)
        for diva, labels in lines_per_diva.items()
    }
    return TripPatternIndex(
        patterns_by_line=patterns_by_line,
        lines_by_label=lines_by_label,
        means_by_line=means_by_line,
        lines_at_diva=lines_at_diva,
    )


# Wiener Linien GTFS publishes two agencies in routes.txt: `04` is Wiener
# Linien proper, `03` is Wiener Lokalbahnen (WLB / Badener Bahn). On a
# label collision we prefer `04` so the "11" tram colour, not the WLB
# "BB" navy, wins for the Wiener Linien customers this integration
# primarily serves.
_AGENCY_WIENER_LINIEN = "04"
# 6-char uppercase hex matcher. Used to validate `route_color` /
# `route_text_color` from GTFS routes.txt before passing the value
# through to the card as `#HHHHHH`.
_HEX6_RE = re.compile(r"^[0-9A-F]{6}$")


def _parse_route_colors(routes_text: str) -> tuple[dict[str, str], dict[str, str]]:
    """Parse GTFS routes.txt → (colors_by_line, text_colors_by_line).

    Columns (utf-8 BOM may prefix the first header):
        route_id,agency_id,route_short_name,route_long_name,
        route_type,route_color,route_text_color

    The relevant fields are `route_short_name` (line label as the user
    sees it: "U1", "13A", "N66") and the two colour columns. We keep
    only rows with a non-empty `route_color` — SEV (Schienenersatzverkehr)
    and other temporary entries leave it blank, and falling through to
    the card's fallback is the right behaviour for those. Colours are
    normalised to 6-digit uppercase hex without the `#` prefix so the
    JSON payload stays compact.

    On label conflict between agency 04 (Wiener Linien) and 03 (WLB),
    Wiener Linien wins — see `_AGENCY_WIENER_LINIEN` above.
    """
    bg: dict[str, str] = {}
    fg: dict[str, str] = {}
    bg_agency: dict[str, str] = {}
    reader = csv.DictReader(io.StringIO(routes_text), delimiter=",")
    for row in reader:
        label = (row.get("route_short_name") or "").strip()
        color = (row.get("route_color") or "").strip().upper()
        # Validate as 6-char hex — `len() == 6` alone accepts garbage like
        # "ZZZZZZ" which the card would render as `#ZZZZZZ` (CSS-invalid,
        # browser ignores). Falling through to the card's fallback palette
        # is the right behaviour for a malformed upstream row.
        if not label or not _HEX6_RE.match(color):
            continue
        agency = (row.get("agency_id") or "").strip()
        prior_agency = bg_agency.get(label)
        # Skip if a Wiener Linien row already claimed this label and the
        # current row is a different agency — we don't want WLB overwriting U1.
        if prior_agency == _AGENCY_WIENER_LINIEN and agency != _AGENCY_WIENER_LINIEN:
            continue
        bg[label] = color
        bg_agency[label] = agency
        text_color = (row.get("route_text_color") or "").strip().upper()
        if _HEX6_RE.match(text_color):
            fg[label] = text_color
    return bg, fg


def stops_ahead_for_match(
    catalogue: StaticCatalogue,
    line_label: str,
    entry_rbls: Iterable[int],
    towards: str,
    live_direction: str | None = None,
) -> list[dict[str, Any]] | None:
    """Resolve the next-stops list for a live monitor row.

    `live_direction` is the `/monitor` row's "H" / "R" string; when given,
    we filter candidate patterns to the matching numeric Direction (Wiener
    Linien convention: H=1, R=2) BEFORE the RBL-containment match. Without
    this filter, an entry that tracks both platforms at one DIVA (e.g.
    Taubstummengasse RBLs [4107 north, 4122 south]) would match patterns
    in both directions and the longest-tail tiebreaker could pick the
    wrong one for branching termini.

    Returns None when no pattern matched (unknown line, replacement service,
    short-turn variant not in the schedule), an empty list when the matched
    pattern places `entry_rbls` at the terminus (no further stops), or the
    truncated list of `{diva, name, is_terminus?, is_ellipsis?}` dicts.

    Truncation: when the raw tail exceeds STOPS_AHEAD_MAX_FULL items, returns
    the first STOPS_AHEAD_HEAD_COUNT entries plus a single ellipsis marker
    plus the terminus, preserving the user's mental anchor (destination)
    while bounding the recorder attribute payload.
    """
    if catalogue.trip_patterns is None:
        return None
    line_id = catalogue.trip_patterns.lines_by_label.get(line_label)
    if line_id is None:
        return None

    candidates = catalogue.trip_patterns.patterns_by_line.get(line_id)
    if not candidates:
        return None

    # Direction filter: H="hin" maps to CSV Direction 1, R="retour" to 2.
    # Fall back to the unfiltered candidate list if the filter empties it
    # (lines that buck the convention still match by terminus below).
    if live_direction in ("H", "R"):
        target_dir = 1 if live_direction == "H" else 2
        dir_filtered = [p for p in candidates if p.direction == target_dir]
        if dir_filtered:
            candidates = dir_filtered

    rbl_set = {int(r) for r in entry_rbls}
    # First-pass filter: patterns that contain one of our RBLs.
    matching = [p for p in candidates if rbl_set.intersection(p.stops)]
    if not matching:
        return None

    # Tiebreaker: prefer the pattern whose terminus station name matches
    # `towards` (case-insensitive substring, both directions). Falls back
    # to the longest-tail pattern when no terminus matches — produces the
    # most informative list and is correct on a single-pattern line.
    needle = (towards or "").strip().casefold()
    best: TripPattern | None = None
    best_tail_len = -1
    if needle:
        for pattern in matching:
            terminus_rbl = pattern.stops[-1]
            terminus_name = _station_name_for_rbl(catalogue, terminus_rbl)
            if not terminus_name:
                continue
            if (
                needle in terminus_name.casefold()
                or terminus_name.casefold() in needle
            ):
                # Among matching-by-terminus patterns, prefer the one with
                # the longest remaining tail from our RBL — handles cases
                # where one branch's pattern is a prefix of another.
                idx = _first_index_in_pattern(pattern, rbl_set)
                tail_len = len(pattern.stops) - idx - 1 if idx >= 0 else -1
                if tail_len > best_tail_len:
                    best = pattern
                    best_tail_len = tail_len
    if best is None:
        # No terminus match. Two cases to handle:
        #
        # 1) The caller had a terminus name but we couldn't disambiguate
        #    by it (typo, casing variant, branching name not in any
        #    pattern's terminus). Falling through to "longest tail" is
        #    fine because a name was at least supplied — best-effort.
        #
        # 2) `towards` was empty (replacement-service row, malformed
        #    monitor payload) AND multiple patterns / both directions
        #    matched the RBL set. Picking the longest tail produces a
        #    deterministic-but-arbitrary direction; surfacing arbitrary
        #    "next 8 stops" as truth is worse than no panel. Return None
        #    so the row renders without a chevron.
        if not needle and len(matching) > 1:
            distinct_dirs = {p.direction for p in matching}
            if len(distinct_dirs) > 1:
                return None
        for pattern in matching:
            idx = _first_index_in_pattern(pattern, rbl_set)
            tail_len = len(pattern.stops) - idx - 1 if idx >= 0 else -1
            if tail_len > best_tail_len:
                best = pattern
                best_tail_len = tail_len
    if best is None:
        return None

    start_idx = _first_index_in_pattern(best, rbl_set)
    if start_idx < 0:
        return None
    tail = best.stops[start_idx + 1 :]
    if not tail:
        return []  # We're at the terminus on this pattern.

    # Short-turn truncation. When the live `towards` matches a stop on
    # the pattern *before* its natural terminus, truncate the tail
    # there. Handles cases like an Alaudagasse-bound U1 (Oberlaa pattern
    # truncated at Alaudagasse) or a Michelbeuern–AKH-bound U6
    # (Floridsdorf pattern truncated at Michelbeuern).
    #
    # Match uses the live `towards`'s primary segment — Wiener Linien
    # often appends a sub-stop descriptor with " - " or " (" (e.g.
    # "Michelbeuern - AKH", "Wien Mitte (Landstr.)"). Stripping to the
    # first segment lets it substring-match the catalogue's canonical
    # station name. Match is one-directional (primary substring of
    # stop name): bidirectional would catch "Stop3" inside "Stop35"
    # and truncate too eagerly.
    if needle:
        primary = needle
        for sep in (" - ", " (", ", "):
            head, _, _ = primary.partition(sep)
            if head:
                primary = head
        primary = primary.strip()
        if primary:
            for i, rbl in enumerate(tail):
                name = _station_name_for_rbl(catalogue, rbl) or ""
                if not name:
                    continue
                if primary in name.casefold():
                    if i < len(tail) - 1:
                        tail = tail[: i + 1]
                    break

    # Build the full ordered list. Each stop carries its name, an optional
    # `is_terminus` flag on the last entry, and an optional `lines` list
    # of OTHER lines (excluding the one we're on) that pass through that
    # stop — sourced from the trip-pattern index's `lines_at_diva`. The
    # `diva` key is dropped from the attribute on purpose: keeping the
    # per-stop dict small lets MAX_STOPS_AHEAD-bounded full routes fit
    # under the 16 KB recorder cap on busy multi-line stops.
    current_label = next(
        (
            label
            for label, lid in catalogue.trip_patterns.lines_by_label.items()
            if lid == best.line_id
        ),
        None,
    )
    lines_at_diva = catalogue.trip_patterns.lines_at_diva

    full: list[dict[str, Any]] = []
    last_idx = len(tail) - 1
    for i, rbl in enumerate(tail):
        name = _station_name_for_rbl(catalogue, rbl) or ""
        diva = _diva_for_rbl(catalogue, rbl)
        if diva is None or not name:
            # An unknown RBL would render as an empty bullet; skip it
            # rather than poison the list.
            continue
        entry: dict[str, Any] = {"name": name}
        if i == last_idx:
            entry["is_terminus"] = True
        # Transfer chips: every line at this DIVA except the one we're
        # already on. Skipped silently when the index is empty (e.g. a
        # cache built without stations passed through).
        transfers = lines_at_diva.get(diva)
        if transfers:
            other = [t for t in transfers if t != current_label]
            if other:
                entry["lines"] = other
        full.append(entry)
        if len(full) >= MAX_STOPS_AHEAD:
            break

    return full


def _first_index_in_pattern(
    pattern: TripPattern, rbl_set: set[int]
) -> int:
    """Index of the first matching RBL in `pattern.stops`, or -1."""
    for i, rbl in enumerate(pattern.stops):
        if rbl in rbl_set:
            return i
    return -1


def _station_name_for_rbl(
    catalogue: StaticCatalogue, rbl: int
) -> str | None:
    """Look up the station name for a given RBL (None if unknown).

    Backed by the catalogue's cached RBL index — O(1) per call after
    the first hit on any catalogue instance.
    """
    entry = catalogue.index_by_rbl().get(rbl)
    return entry[1] if entry is not None else None


def _diva_for_rbl(catalogue: StaticCatalogue, rbl: int) -> int | None:
    """Look up the parent DIVA for a given RBL (None if unknown).

    Backed by the catalogue's cached RBL index — O(1) per call after
    the first hit on any catalogue instance.
    """
    entry = catalogue.index_by_rbl().get(rbl)
    return entry[0] if entry is not None else None


def _catalogue_to_store(catalogue: StaticCatalogue) -> dict[str, Any]:
    """Serialise a StaticCatalogue for Store-backed persistence."""
    payload: dict[str, Any] = {
        "version": 1,
        "last_fetched": catalogue.last_fetched,
        "validators": {
            name: {"etag": v.etag, "last_modified": v.last_modified}
            for name, v in catalogue.validators.items()
        },
        "stations": [
            {
                "diva": s.diva,
                "name": s.name,
                "municipality": s.municipality,
                "longitude": s.longitude,
                "latitude": s.latitude,
                "rbls": list(s.rbls),
            }
            for s in catalogue.stations_by_diva.values()
        ],
    }
    if catalogue.trip_patterns is not None:
        payload["trip_patterns"] = _trip_patterns_to_store(catalogue.trip_patterns)
    return payload


def _trip_patterns_to_store(index: TripPatternIndex) -> dict[str, Any]:
    """Serialise a TripPatternIndex into a Store-friendly dict."""
    return {
        "lines_by_label": dict(index.lines_by_label),
        "means_by_line": {str(k): v for k, v in index.means_by_line.items()},
        "lines_at_diva": {
            str(diva): list(labels) for diva, labels in index.lines_at_diva.items()
        },
        "colors_by_line": dict(index.colors_by_line),
        "text_colors_by_line": dict(index.text_colors_by_line),
        "patterns": [
            {
                "line_id": p.line_id,
                "pattern_id": p.pattern_id,
                "direction": p.direction,
                "stops": list(p.stops),
            }
            for plist in index.patterns_by_line.values()
            for p in plist
        ],
    }


def _trip_patterns_from_store(
    raw: dict[str, Any] | None,
) -> TripPatternIndex | None:
    """Rebuild a TripPatternIndex from a Store payload (None on missing)."""
    if not raw:
        return None
    try:
        lines_by_label = {
            str(k): int(v) for k, v in (raw.get("lines_by_label") or {}).items()
        }
        means_by_line = {
            int(k): str(v) for k, v in (raw.get("means_by_line") or {}).items()
        }
        # Build label → MoT for the per-stop sort tier — same as the
        # parse path. Re-sort on read so a cache written under the old
        # numeric-only sort gets reordered to the new MoT-grouped order
        # without a network refresh.
        mot_by_label_load: dict[str, str] = {}
        for label, line_id in lines_by_label.items():
            mot = means_by_line.get(line_id)
            if mot:
                mot_by_label_load[label] = mot
        lines_at_diva = {
            int(k): _sort_line_labels(
                [str(label) for label in (v or [])], mot_by_label_load
            )
            for k, v in (raw.get("lines_at_diva") or {}).items()
        }
        colors_by_line = {
            str(k): str(v).upper()
            for k, v in (raw.get("colors_by_line") or {}).items()
            if isinstance(v, str) and len(v) == 6
        }
        text_colors_by_line = {
            str(k): str(v).upper()
            for k, v in (raw.get("text_colors_by_line") or {}).items()
            if isinstance(v, str) and len(v) == 6
        }
        patterns_by_line: dict[int, list[TripPattern]] = {}
        for entry in raw.get("patterns") or []:
            line_id = int(entry["line_id"])
            pattern = TripPattern(
                line_id=line_id,
                pattern_id=int(entry["pattern_id"]),
                direction=int(entry["direction"]),
                stops=tuple(int(r) for r in entry.get("stops") or []),
            )
            if not pattern.stops:
                continue
            patterns_by_line.setdefault(line_id, []).append(pattern)
    except (KeyError, ValueError, TypeError) as err:
        _LOGGER.warning(
            "Ignoring corrupt trip-pattern cache (%s); will refetch next refresh",
            err,
        )
        return None
    return TripPatternIndex(
        patterns_by_line=patterns_by_line,
        lines_by_label=lines_by_label,
        means_by_line=means_by_line,
        lines_at_diva=lines_at_diva,
        colors_by_line=colors_by_line,
        text_colors_by_line=text_colors_by_line,
    )


def _catalogue_from_store(data: dict[str, Any]) -> StaticCatalogue:
    """Rebuild a StaticCatalogue from a Store payload.

    Older payloads may lack the `trip_patterns` key — default to None
    and let the next refresh fill it in.
    """
    stations: dict[int, Station] = {}
    for row in data["stations"]:
        diva = int(row["diva"])
        stations[diva] = Station(
            diva=diva,
            name=row["name"],
            municipality=row["municipality"],
            longitude=float(row["longitude"]),
            latitude=float(row["latitude"]),
            rbls=[int(r) for r in row.get("rbls", [])],
        )
    validators: dict[str, CacheValidators] = {}
    for name, raw in (data.get("validators") or {}).items():
        if not isinstance(raw, dict):
            continue
        validators[name] = CacheValidators(
            etag=raw.get("etag"), last_modified=raw.get("last_modified")
        )
    trip_patterns = _trip_patterns_from_store(data.get("trip_patterns"))
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched=data["last_fetched"],
        validators=validators,
        trip_patterns=trip_patterns,
    )
