"""Tests for the Wiener Linien Austria static catalogue layer."""
from __future__ import annotations

from unittest.mock import AsyncMock, patch

import aiohttp
import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from custom_components.wiener_linien_austria.static import (
    STORE_KEY,
    STORE_VERSION,
    Station,
    StaticCatalogue,
    _catalogue_from_store,
    _catalogue_to_store,
    _merge_haltepunkte,
    _parse_haltestellen,
    async_load_catalogue,
    async_refresh_catalogue,
)


@pytest.fixture(autouse=True)
def mock_static_catalogue():
    """Override conftest autouse — these tests exercise the real loader.

    The conftest autouse stubs `static.async_load_catalogue` /
    `static.async_refresh_catalogue`, which would short-circuit every
    test in this file. Re-yielding the tuple of real function names is
    unnecessary; we just disable the global stub here.
    """
    yield

HALTESTELLEN_CSV = (
    "DIVA;PlatformText;Municipality;MunicipalityID;Longitude;Latitude\n"
    "60201012;Stephansplatz;Wien;49000001;16.3726000;48.2085000\n"
    "60200123;Schwarzenbergplatz;Wien;49000001;16.3740000;48.2005000\n"
    # Row with non-numeric DIVA should be skipped defensively.
    "abc;Bad Row;Wien;49000001;0;0\n"
)

HALTEPUNKTE_CSV = (
    "StopID;DIVA;StopText;Municipality;MunicipalityID;Longitude;Latitude\n"
    "4111;60201012;U1 H Stephansplatz;Wien;49000001;16.3726;48.2085\n"
    "4118;60201012;U1 R Stephansplatz;Wien;49000001;16.3726;48.2085\n"
    "1491;60200123;71 Schwarzenbergplatz;Wien;49000001;16.3740;48.2005\n"
    # RBL with unknown DIVA — should be skipped, not error.
    "9999;99999999;Orphan;Wien;49000001;0;0\n"
)


def test_parse_haltestellen() -> None:
    """Parse produces a DIVA-keyed dict with correct field types."""
    stations = _parse_haltestellen(HALTESTELLEN_CSV)
    assert set(stations.keys()) == {60201012, 60200123}
    s = stations[60201012]
    assert s.name == "Stephansplatz"
    assert s.municipality == "Wien"
    assert s.longitude == 16.3726
    assert s.latitude == 48.2085
    assert s.rbls == []


def test_merge_haltepunkte_populates_rbls() -> None:
    """Merging attaches only RBLs whose DIVA matches a known station."""
    stations = _parse_haltestellen(HALTESTELLEN_CSV)
    _merge_haltepunkte(stations, HALTEPUNKTE_CSV)
    assert sorted(stations[60201012].rbls) == [4111, 4118]
    assert stations[60200123].rbls == [1491]


def test_search_is_case_insensitive_and_prefers_prefix() -> None:
    """Search returns prefix matches first, then substring matches."""
    stations = _parse_haltestellen(HALTESTELLEN_CSV)
    catalogue = StaticCatalogue(stations_by_diva=stations, last_fetched="t")
    results = catalogue.search("steph")
    assert results and results[0].name == "Stephansplatz"

    # Case-insensitive substring
    assert catalogue.search("STEPH")[0].name == "Stephansplatz"
    # No hits
    assert catalogue.search("XYZ-nope") == []


def test_search_empty_query_returns_empty() -> None:
    """A whitespace-only query yields no results."""
    catalogue = StaticCatalogue(
        stations_by_diva={
            1: Station(diva=1, name="X", municipality="Wien", longitude=0, latitude=0)
        },
        last_fetched="t",
    )
    assert catalogue.search("   ") == []


def test_store_roundtrip() -> None:
    """Serialising and deserialising the catalogue preserves all fields."""
    stations = _parse_haltestellen(HALTESTELLEN_CSV)
    _merge_haltepunkte(stations, HALTEPUNKTE_CSV)
    catalogue = StaticCatalogue(
        stations_by_diva=stations, last_fetched="2026-04-20T12:00:00+00:00"
    )
    payload = _catalogue_to_store(catalogue)
    rebuilt = _catalogue_from_store(payload)
    assert rebuilt.last_fetched == catalogue.last_fetched
    assert set(rebuilt.stations_by_diva.keys()) == set(
        catalogue.stations_by_diva.keys()
    )
    original = catalogue.stations_by_diva[60201012]
    restored = rebuilt.stations_by_diva[60201012]
    assert restored.name == original.name
    assert sorted(restored.rbls) == sorted(original.rbls)


# ---------------------------------------------------------------------------
# async_load_catalogue: cache hit / corrupt cache / no cache
# ---------------------------------------------------------------------------


def _sample(diva: int = 60201012, name: str = "Stephansplatz") -> StaticCatalogue:
    """Build a minimal StaticCatalogue with one station."""
    return StaticCatalogue(
        stations_by_diva={
            diva: Station(
                diva=diva,
                name=name,
                municipality="Wien",
                longitude=16.37,
                latitude=48.21,
                rbls=[4111, 4118],
            )
        },
        last_fetched="2026-04-20T12:00:00+00:00",
    )


async def test_async_load_catalogue_returns_cached(hass: HomeAssistant) -> None:
    """Pre-saved catalogue is returned without triggering a network fetch."""
    store: Store[dict] = Store(hass, STORE_VERSION, STORE_KEY)
    await store.async_save(_catalogue_to_store(_sample()))

    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        side_effect=AssertionError("network fetch must not be called on cache hit"),
    ) as mock_fetch:
        result = await async_load_catalogue(hass)

    mock_fetch.assert_not_called()
    assert 60201012 in result.stations_by_diva
    assert result.stations_by_diva[60201012].rbls == [4111, 4118]


async def test_async_load_catalogue_corrupt_cache_refetches(
    hass: HomeAssistant,
) -> None:
    """A cache payload that can't be rebuilt falls back to _fetch_and_build."""
    store: Store[dict] = Store(hass, STORE_VERSION, STORE_KEY)
    # Save a dict that _catalogue_from_store can't parse (missing "stations").
    await store.async_save({"version": 1, "last_fetched": "t"})

    fresh = _sample(diva=99999999, name="Fresh")
    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        return_value=fresh,
    ) as mock_fetch:
        result = await async_load_catalogue(hass)

    mock_fetch.assert_awaited_once()
    assert 99999999 in result.stations_by_diva


async def test_async_load_catalogue_no_cache_fetches_and_saves(
    hass: HomeAssistant,
) -> None:
    """Empty Store triggers a fetch AND persists the result to the Store."""
    fresh = _sample(diva=12345, name="New")
    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        return_value=fresh,
    ) as mock_fetch:
        result = await async_load_catalogue(hass)

    mock_fetch.assert_awaited_once()
    assert 12345 in result.stations_by_diva

    # A subsequent load hits the Store (no second fetch).
    store: Store[dict] = Store(hass, STORE_VERSION, STORE_KEY)
    saved = await store.async_load()
    assert saved is not None
    assert any(s["diva"] == 12345 for s in saved["stations"])


async def test_async_refresh_catalogue_keeps_cache_on_failure(
    hass: HomeAssistant,
) -> None:
    """When _fetch_and_build raises, the existing cache survives intact."""
    store: Store[dict] = Store(hass, STORE_VERSION, STORE_KEY)
    await store.async_save(_catalogue_to_store(_sample(diva=60201012, name="Keep")))

    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("upstream unreachable"),
    ):
        result = await async_refresh_catalogue(hass)

    assert result is None
    saved = await store.async_load()
    assert saved is not None
    assert any(s["name"] == "Keep" for s in saved["stations"])
