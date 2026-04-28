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
    STATIC_FILES,
    STOPS_AHEAD_HEAD_COUNT,
    STOPS_AHEAD_MAX_FULL,
    USER_AGENT,
)
from .http import CacheValidators, base_request_headers

_LOGGER = logging.getLogger(__name__)

STORE_VERSION = 1
STORE_KEY = f"{DOMAIN}_static"


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
    """Compact index over `fahrwegverlaeufe` + `linien`.

    `patterns_by_line` keys patterns by LineID; the inner list holds every
    PatternID variant (both directions, branching termini, short turns).
    `lines_by_label` resolves the live `/monitor` `line.name` ("U1") to its
    LineID. `means_by_line` carries the authoritative MeansOfTransport per
    line for diagnostics consumers; the coordinator does not currently rely
    on it.
    """

    patterns_by_line: dict[int, list[TripPattern]] = field(default_factory=dict)
    lines_by_label: dict[str, int] = field(default_factory=dict)
    means_by_line: dict[int, str] = field(default_factory=dict)

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


async def async_load_catalogue(hass: HomeAssistant) -> StaticCatalogue:
    """Return the current static catalogue, loading from cache or network.

    If both cache and network are unavailable, raises RuntimeError.

    When the cache predates the additive `trip_patterns` field (1.4.0),
    forces an inline refetch so users get the stops-ahead feature on the
    first entry-load instead of waiting for the next weekly refresh
    (which would otherwise be up to 7 days away). Network failure falls
    back to the stale cache so the integration still works.
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
            if catalogue.trip_patterns is None:
                _LOGGER.info(
                    "Static cache predates trip_patterns; refetching to populate it"
                )
                try:
                    refreshed = await _fetch_and_build(hass, prior=catalogue)
                except (
                    aiohttp.ClientError,
                    asyncio.TimeoutError,
                    ValueError,
                ) as err:
                    _LOGGER.warning(
                        "Could not refresh trip_patterns (%s); using stale cache",
                        err,
                    )
                    return catalogue
                if refreshed is not catalogue:
                    await store.async_save(_catalogue_to_store(refreshed))
                return refreshed
            return catalogue

    catalogue = await _fetch_and_build(hass, prior=None)
    await store.async_save(_catalogue_to_store(catalogue))
    return catalogue


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

    haltestellen_result, haltepunkte_result, linien_result, fahr_result = (
        await asyncio.gather(
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
        )
    )

    halte_text, halte_validators_new = haltestellen_result
    punkte_text, punkte_validators_new = haltepunkte_result
    linien_text, linien_validators_new, linien_failed = linien_result
    fahr_text, fahr_validators_new, fahr_failed = fahr_result

    # All-304 fast path: only valid if the trip-pattern fetches actually
    # happened (not failed) and also returned 304. A failed fetch is NOT
    # the same as 304 — we lose the freshness signal, so we fall through
    # and rebuild from prior.
    all_304 = (
        halte_text is None
        and punkte_text is None
        and linien_text is None
        and fahr_text is None
        and not linien_failed
        and not fahr_failed
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
                    trip_patterns = _parse_trip_patterns(linien_text, fahr_text)
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

    _LOGGER.info(
        "Loaded Wiener Linien static catalogue: %d stations, %d platforms"
        " (haltestellen=%s, haltepunkte=%s, linien=%s, fahrwegverlaeufe=%s,"
        " trip_patterns=%s)",
        len(stations),
        sum(len(s.rbls) for s in stations.values()),
        "fresh" if halte_text is not None else "304",
        "fresh" if punkte_text is not None else "304",
        "fresh" if linien_text is not None else ("failed" if linien_failed else "304"),
        "fresh" if fahr_text is not None else ("failed" if fahr_failed else "304"),
        pattern_status,
    )
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched=dt_util.utcnow().isoformat(),
        validators={
            "haltestellen": halte_validators_new,
            "haltepunkte": punkte_validators_new,
            "linien": linien_validators_new,
            "fahrwegverlaeufe": fahr_validators_new,
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
        except (KeyError, ValueError):
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
        except (KeyError, ValueError):
            continue
        station = stations.get(diva)
        if station is not None:
            station.rbls.append(rbl)


def _parse_trip_patterns(
    linien_text: str, fahr_text: str
) -> TripPatternIndex:
    """Build a TripPatternIndex from linien.csv + fahrwegverlaeufe.csv.

    `linien.csv` columns: LineID;LineText;SortingHelp;Realtime;MeansOfTransport
    `fahrwegverlaeufe.csv` columns: LineID;PatternID;StopSeqCount;StopID;Direction

    Patterns are grouped by (LineID, PatternID), sorted by StopSeqCount, and
    materialised as immutable RBL tuples. Real-world data has gaps in
    StopSeqCount (e.g. 0,1,3,4) — we sort by the value, the gaps don't
    affect the resulting order.
    """
    lines_by_label: dict[str, int] = {}
    means_by_line: dict[int, str] = {}
    line_reader = csv.DictReader(io.StringIO(linien_text), delimiter=";")
    for row in line_reader:
        try:
            line_id = int(row["LineID"])
        except (KeyError, ValueError):
            continue
        label = (row.get("LineText") or "").strip()
        if label:
            lines_by_label[label] = line_id
        means = (row.get("MeansOfTransport") or "").strip()
        if means:
            means_by_line[line_id] = means

    # Group fahrwegverlaeufe rows by (line_id, pattern_id) and collect
    # (sequence, rbl, direction) tuples. We sort by sequence at the end.
    grouped: dict[tuple[int, int], list[tuple[int, int, int]]] = {}
    fahr_reader = csv.DictReader(io.StringIO(fahr_text), delimiter=";")
    for row in fahr_reader:
        try:
            line_id = int(row["LineID"])
            pattern_id = int(row["PatternID"])
            seq = int(row["StopSeqCount"])
            rbl = int(row["StopID"])
            direction = int(row["Direction"])
        except (KeyError, ValueError):
            continue
        grouped.setdefault((line_id, pattern_id), []).append(
            (seq, rbl, direction)
        )

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

    return TripPatternIndex(
        patterns_by_line=patterns_by_line,
        lines_by_label=lines_by_label,
        means_by_line=means_by_line,
    )


def stops_ahead_for_match(
    catalogue: StaticCatalogue,
    line_label: str,
    entry_rbls: Iterable[int],
    towards: str,
) -> list[dict[str, Any]] | None:
    """Resolve the next-stops list for a live monitor row.

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
        # No terminus match — pick the matching pattern with the longest
        # tail from our position (best-effort).
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

    # Build full dict list, then apply hybrid truncation.
    full: list[dict[str, Any]] = []
    last_idx = len(tail) - 1
    for i, rbl in enumerate(tail):
        name = _station_name_for_rbl(catalogue, rbl) or ""
        diva = _diva_for_rbl(catalogue, rbl)
        if diva is None:
            # An unknown RBL would render as an empty bullet; skip it
            # rather than poison the list.
            continue
        entry: dict[str, Any] = {"diva": diva, "name": name}
        if i == last_idx:
            entry["is_terminus"] = True
        full.append(entry)

    if len(full) <= STOPS_AHEAD_MAX_FULL:
        return full

    head = full[:STOPS_AHEAD_HEAD_COUNT]
    terminus = full[-1]
    ellipsis: dict[str, Any] = {"diva": None, "name": "…", "is_ellipsis": True}
    return [*head, ellipsis, terminus]


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
    """Look up the station name for a given RBL (None if unknown)."""
    for station in catalogue.stations_by_diva.values():
        if rbl in station.rbls:
            return station.name
    return None


def _diva_for_rbl(catalogue: StaticCatalogue, rbl: int) -> int | None:
    """Look up the parent DIVA for a given RBL (None if unknown)."""
    for diva, station in catalogue.stations_by_diva.items():
        if rbl in station.rbls:
            return diva
    return None


def _catalogue_to_store(catalogue: StaticCatalogue) -> dict[str, Any]:
    """Serialise a StaticCatalogue for Store-backed persistence.

    `trip_patterns` is omitted when None so older clients (and the very
    first cache write before the trip-pattern CSVs land) round-trip
    unchanged.
    """
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
    )


def _catalogue_from_store(data: dict[str, Any]) -> StaticCatalogue:
    """Rebuild a StaticCatalogue from a Store payload.

    Tolerates payloads written before v1.4 (no `trip_patterns` key) by
    defaulting that field to None — the next refresh fills it in.
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
