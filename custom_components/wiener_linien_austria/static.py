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
    """

    stations_by_diva: dict[int, Station]
    last_fetched: str  # ISO 8601 UTC

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

    catalogue = await _fetch_and_build(hass)
    await store.async_save(_catalogue_to_store(catalogue))
    return catalogue


async def async_refresh_catalogue(hass: HomeAssistant) -> StaticCatalogue | None:
    """Best-effort refresh: on network failure, keep the existing cache.

    Returns the new catalogue on success, None on failure.
    """
    try:
        catalogue = await _fetch_and_build(hass)
    except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as err:
        _LOGGER.warning("Static catalogue refresh failed, keeping cache: %s", err)
        return None

    store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
    await store.async_save(_catalogue_to_store(catalogue))
    return catalogue


async def _fetch_and_build(hass: HomeAssistant) -> StaticCatalogue:
    """Download haltestellen + haltepunkte, merge into a StaticCatalogue."""
    session = async_get_clientsession(hass)
    timeout = aiohttp.ClientTimeout(total=30)

    haltestellen_csv, haltepunkte_csv = await asyncio.gather(
        _download_text(session, STATIC_FILES["haltestellen"], timeout),
        _download_text(session, STATIC_FILES["haltepunkte"], timeout),
    )

    stations = _parse_haltestellen(haltestellen_csv)
    _merge_haltepunkte(stations, haltepunkte_csv)

    _LOGGER.info(
        "Loaded Wiener Linien static catalogue: %d stations, %d platforms",
        len(stations),
        sum(len(s.rbls) for s in stations.values()),
    )
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched=dt_util.utcnow().isoformat(),
    )


async def _download_text(
    session: aiohttp.ClientSession, url: str, timeout: aiohttp.ClientTimeout
) -> str:
    """GET a CSV URL and return its UTF-8 text body."""
    resp = await session.get(
        url, headers={"User-Agent": USER_AGENT}, timeout=timeout
    )
    resp.raise_for_status()
    return await resp.text()


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
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched=data["last_fetched"],
    )
