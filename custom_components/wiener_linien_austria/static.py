"""Static OGD data: stop catalogue and DIVA → RBL mapping.

Wiener Linien publishes a handful of CSVs at the same base URL as the realtime
API. We only need two of them in v0.1:

- `haltestellen.csv` — one row per station (DIVA, name, coordinates).
- `haltepunkte.csv`  — one row per physical platform (RBL = StopID, parent DIVA,
  coordinates). This is how we go from a stop name to the list of RBLs the
  monitor endpoint needs.

The catalogue is stable for days/weeks at a time so we fetch it once, cache it
on disk via `homeassistant.helpers.storage.Store`, and refresh weekly.
"""
from __future__ import annotations

import asyncio
import csv
import io
import logging
from dataclasses import dataclass, field
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN, STATIC_FILES, USER_AGENT
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


@dataclass
class StaticCatalogue:
    """In-memory catalogue of Wiener Linien stops.

    `stations_by_diva` maps DIVA → Station (with its rbls populated).
    `last_fetched` is the UTC timestamp of the successful fetch that built it.
    `validators` is the per-CSV (ETag, Last-Modified) pair captured from the
    last successful fetch so the next refresh can short-circuit on 304.
    """

    stations_by_diva: dict[int, Station]
    last_fetched: str  # ISO 8601 UTC
    validators: dict[str, CacheValidators] = field(default_factory=dict)

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
    """
    store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
    cached = await store.async_load()
    if cached:
        try:
            return _catalogue_from_store(cached)
        except (KeyError, ValueError, TypeError) as err:
            _LOGGER.warning(
                "Ignoring corrupt static cache (%s); refetching from upstream",
                err,
            )

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

    # _fetch_and_build returns the prior catalogue verbatim when both CSVs
    # came back 304 — no parse, no diff, just skip the Store write too.
    if prior is not None and catalogue is prior:
        _LOGGER.debug("Static catalogue unchanged (both CSVs 304); skipping rewrite")
        return None

    await store.async_save(_catalogue_to_store(catalogue))
    return catalogue


async def _fetch_and_build(
    hass: HomeAssistant, prior: StaticCatalogue | None
) -> StaticCatalogue:
    """Download haltestellen + haltepunkte, merge into a StaticCatalogue.

    When `prior` is set, sends If-None-Match / If-Modified-Since per file. If
    *both* CSVs reply 304, returns `prior` unchanged so the caller can skip
    the disk write. If only one is 304, falls back to its prior text body so
    the parse step still has something to chew on.
    """
    session = async_get_clientsession(hass)
    timeout = aiohttp.ClientTimeout(total=30)

    halte_validators = (prior.validators.get("haltestellen") if prior else None) or CacheValidators()
    punkte_validators = (prior.validators.get("haltepunkte") if prior else None) or CacheValidators()

    haltestellen_result, haltepunkte_result = await asyncio.gather(
        _download_text(session, STATIC_FILES["haltestellen"], timeout, halte_validators),
        _download_text(session, STATIC_FILES["haltepunkte"], timeout, punkte_validators),
    )

    halte_text, halte_validators_new = haltestellen_result
    punkte_text, punkte_validators_new = haltepunkte_result

    # Both 304 = nothing changed upstream. Reuse the prior catalogue
    # outright (caller skips the Store rewrite).
    if halte_text is None and punkte_text is None and prior is not None:
        return prior

    # If exactly one is 304, we'd need the *prior text* to re-merge — but
    # the prior catalogue was already merged into station+rbls, so we
    # don't need to re-parse. Re-build by combining the prior parsed data
    # with the freshly-fetched half.
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

    _LOGGER.info(
        "Loaded Wiener Linien static catalogue: %d stations, %d platforms"
        " (haltestellen=%s, haltepunkte=%s)",
        len(stations),
        sum(len(s.rbls) for s in stations.values()),
        "fresh" if halte_text is not None else "304",
        "fresh" if punkte_text is not None else "304",
    )
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched=dt_util.utcnow().isoformat(),
        validators={
            "haltestellen": halte_validators_new,
            "haltepunkte": punkte_validators_new,
        },
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


def _catalogue_to_store(catalogue: StaticCatalogue) -> dict[str, Any]:
    """Serialise a StaticCatalogue for Store-backed persistence."""
    return {
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


def _catalogue_from_store(data: dict[str, Any]) -> StaticCatalogue:
    """Rebuild a StaticCatalogue from a Store payload."""
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
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched=data["last_fetched"],
        validators=validators,
    )
