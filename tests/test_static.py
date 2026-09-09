"""Tests for the Wiener Linien Austria static catalogue layer."""

from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from custom_components.wiener_linien_austria.const import (
    DOMAIN,
    DOMAIN_COOLDOWN_SECONDS,
    DOMAIN_LAST_CALL_KEY,
    ENTRY_COUNT_KEY,
    USER_AGENT,
)
from custom_components.wiener_linien_austria.static import (
    CATALOGUE_KEY,
    STORE_KEY,
    STORE_VERSION,
    StaticCatalogue,
    Station,
    TripPattern,
    TripPatternIndex,
    _async_background_refresh,
    _catalogue_from_store,
    _catalogue_to_store,
    _download_or_fail_soft,
    _fetch_and_build,
    _merge_haltepunkte,
    _parse_all,
    _parse_haltestellen,
    _parse_route_colors,
    _parse_trip_patterns,
    async_get_catalogue,
    async_load_catalogue,
    async_refresh_catalogue,
    async_set_cached_catalogue,
    stops_ahead_for_match,
)
from tests.conftest import make_response_cm


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

# Subset of linien.csv covering U1 + a tram (71). Real columns:
# LineID;LineText;SortingHelp;Realtime;MeansOfTransport
LINIEN_CSV = (
    "LineID;LineText;SortingHelp;Realtime;MeansOfTransport\n"
    "301;U1;1;1;ptMetro\n"
    "771;71;71;1;ptTram\n"
)

# Subset of fahrwegverlaeufe.csv. PatternID 1 = U1 H (forward),
# PatternID 2 = U1 R (return), PatternID 3 = a hypothetical U1 short-turn.
# RBL 4111 is U1/H/Stephansplatz; the H-pattern goes 4001 → 4111 → 4222 → 4333.
# Sequence has gaps to mimic real CSV (rows 0/1/3/4) — sort key is the value.
FAHR_CSV = (
    "LineID;PatternID;StopSeqCount;StopID;Direction\n"
    # U1 H — Reumannplatz → Stephansplatz → Praterstern → Leopoldau
    "301;1;0;4001;1\n"
    "301;1;1;4111;1\n"
    "301;1;3;4222;1\n"
    "301;1;4;4333;1\n"
    # U1 R — reverse
    "301;2;0;4333;2\n"
    "301;2;1;4222;2\n"
    "301;2;2;4118;2\n"
    "301;2;3;4001;2\n"
)


def _build_catalogue(
    last_fetched: str = "2026-04-20T12:00:00+00:00",
) -> StaticCatalogue:
    """A minimal resolved catalogue. `last_fetched` drives the lost-update
    guard, which compares the ISO strings lexically."""
    return StaticCatalogue(
        stations_by_diva={},
        last_fetched=last_fetched,
        trip_patterns=None,
    )


def _build_sample_index() -> TripPatternIndex:
    """Helper: build a TripPatternIndex matching the LINIEN_CSV + FAHR_CSV.

    Stations are derived from HALTESTELLEN_CSV + HALTEPUNKTE_CSV so the
    parser populates `lines_at_diva` — without it the auto-refresh check
    in async_load_catalogue would treat the cache as stale and trigger
    an unwanted refresh during cache-hit tests. Colours are attached so
    the same check doesn't trip on `colors_by_line` being empty either.
    """
    stations = _parse_haltestellen(HALTESTELLEN_CSV)
    _merge_haltepunkte(stations, HALTEPUNKTE_CSV)
    index = _parse_trip_patterns(LINIEN_CSV, FAHR_CSV, stations)
    return TripPatternIndex(
        patterns_by_line=index.patterns_by_line,
        lines_by_label=index.lines_by_label,
        means_by_line=index.means_by_line,
        lines_at_diva=index.lines_at_diva,
        colors_by_line={"U1": "E3000F", "71": "C00808"},
        text_colors_by_line={"U1": "FFFFFF", "71": "FFFFFF"},
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
    """Search returns prefix matches first, then substring matches.

    A station that *contains* the needle as a substring but doesn't start
    with it must rank below a station that starts with the needle, even
    when the substring-match would sort earlier alphabetically.
    """
    # "Westbahnhof" sorts before "ZZZ Westbahnhof Areal" alphabetically; the
    # second station only matches via substring, so the *first* must rank
    # higher even though it sorts later by name.
    stations = {
        1: Station(
            diva=1,
            name="ZZZ Westbahnhof Areal",
            municipality="Wien",
            longitude=0,
            latitude=0,
        ),
        2: Station(
            diva=2, name="Westbahnhof", municipality="Wien", longitude=0, latitude=0
        ),
    }
    catalogue = StaticCatalogue(stations_by_diva=stations, last_fetched="t")

    results = catalogue.search("west")
    assert [s.name for s in results] == ["Westbahnhof", "ZZZ Westbahnhof Areal"]

    # Case-insensitive
    assert catalogue.search("WEST")[0].name == "Westbahnhof"
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
    """Build a minimal StaticCatalogue with one station and a trip-pattern index.

    The trip_patterns field is populated so this fixture round-trips through
    the auto-refresh-on-pre-1.4-cache branch in async_load_catalogue without
    triggering an unwanted refetch. Tests that specifically need a missing
    trip_patterns field strip it from the Store payload after serialisation.
    """
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
        trip_patterns=_build_sample_index(),
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


async def test_async_load_catalogue_store_read_error_falls_through(
    hass: HomeAssistant,
) -> None:
    """OSError from Store.async_load → log + fall through to fresh fetch.

    A disk-error / partial-write on the cache file must not crash the
    integration setup; the in-memory catalogue from the fresh fetch
    is enough to keep coordinators running.
    """
    fresh = _sample(diva=77777, name="ReadErrorFallback")
    with (
        patch(
            "homeassistant.helpers.storage.Store.async_load",
            new_callable=AsyncMock,
            side_effect=OSError("simulated disk error"),
        ),
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            return_value=fresh,
        ) as mock_fetch,
    ):
        result = await async_load_catalogue(hass)

    mock_fetch.assert_awaited_once()
    assert 77777 in result.stations_by_diva


async def test_async_load_catalogue_store_save_error_still_returns_catalogue(
    hass: HomeAssistant,
) -> None:
    """OSError from Store.async_save on first load → still return the catalogue.

    Persistence is best-effort; an in-memory catalogue is fine until
    the next refresh retries the write.
    """
    fresh = _sample(diva=88888, name="SaveErrorInMemory")
    with (
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            return_value=fresh,
        ),
        patch(
            "homeassistant.helpers.storage.Store.async_save",
            new_callable=AsyncMock,
            side_effect=OSError("simulated disk full"),
        ),
    ):
        result = await async_load_catalogue(hass)

    assert 88888 in result.stations_by_diva


async def test_async_refresh_catalogue_store_save_error_still_returns_fresh(
    hass: HomeAssistant,
) -> None:
    """OSError from Store.async_save during refresh → still return the new catalogue.

    Sensors hold a ref to the catalogue, so swallowing the save error
    while still returning the fresh result keeps the in-memory state
    consistent until the next refresh retries the write.
    """
    fresh = _sample(diva=99000, name="RefreshSaveErr")
    with (
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            return_value=fresh,
        ),
        patch(
            "homeassistant.helpers.storage.Store.async_save",
            new_callable=AsyncMock,
            side_effect=OSError("simulated disk full"),
        ),
    ):
        result = await async_refresh_catalogue(hass)

    assert result is not None
    assert 99000 in result.stations_by_diva


# ---------------------------------------------------------------------------
# _fetch_and_build: live network simulation
# ---------------------------------------------------------------------------


def _csv_response(text: str, *, status: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status = status
    resp.raise_for_status = MagicMock()
    resp.text = AsyncMock(return_value=text)
    return resp


async def test_fetch_and_build_both_csvs_fresh(hass: HomeAssistant) -> None:
    """Cold-start: every CSV comes back 200, parse + merge into a catalogue."""
    from custom_components.wiener_linien_austria import static as static_mod

    haltestellen_resp = _csv_response(HALTESTELLEN_CSV)
    haltepunkte_resp = _csv_response(HALTEPUNKTE_CSV)
    linien_resp = _csv_response(LINIEN_CSV)
    fahr_resp = _csv_response(FAHR_CSV)
    routes_resp = _csv_response(ROUTES_CSV)

    fake_session = MagicMock()
    fake_session.get = MagicMock(
        side_effect=[
            make_response_cm(haltestellen_resp),
            make_response_cm(haltepunkte_resp),
            make_response_cm(linien_resp),
            make_response_cm(fahr_resp),
            make_response_cm(routes_resp),
        ]
    )

    with patch(
        "custom_components.wiener_linien_austria.static.async_get_clientsession",
        return_value=fake_session,
    ):
        catalogue = await static_mod._fetch_and_build(hass, prior=None)

    assert sorted(catalogue.stations_by_diva.keys()) == [60200123, 60201012]
    assert sorted(catalogue.stations_by_diva[60201012].rbls) == [4111, 4118]
    # Trip-pattern index built from the fresh linien + fahrwegverlaeufe,
    # enriched with the GTFS route colours from the fresh routes payload.
    assert catalogue.trip_patterns is not None
    assert catalogue.trip_patterns.lines_by_label["U1"] == 301
    assert catalogue.trip_patterns.colors_by_line["U1"] == "E3000F"


# ---------------------------------------------------------------------------
# Domain cooldown + request headers on the static burst
# ---------------------------------------------------------------------------


def _all_csvs_ok() -> MagicMock:
    """A fake session serving every one of the five static files."""
    session = MagicMock()
    session.get = MagicMock(
        side_effect=[
            make_response_cm(_csv_response(HALTESTELLEN_CSV)),
            make_response_cm(_csv_response(HALTEPUNKTE_CSV)),
            make_response_cm(_csv_response(LINIEN_CSV)),
            make_response_cm(_csv_response(FAHR_CSV)),
            make_response_cm(_csv_response(ROUTES_CSV)),
        ]
    )
    return session


@pytest.mark.real_domain_cooldown
async def test_fetch_and_build_takes_the_domain_cooldown(hass: HomeAssistant) -> None:
    """The weekly static burst waits out the domain cooldown before firing.

    Regression guard: `static.py` used to bypass `rate_limit` entirely, so a
    weekly five-file burst could land directly on top of a `/monitor` tick
    while `rate_limit.py`'s docstring claimed to cover every outbound call.
    """
    from custom_components.wiener_linien_austria import static as static_mod

    elapsed = 1.0
    hass.data.setdefault(DOMAIN, {})[DOMAIN_LAST_CALL_KEY] = (
        dt_util.utcnow() - timedelta(seconds=elapsed)
    )

    with (
        patch(
            "custom_components.wiener_linien_austria.static.async_get_clientsession",
            return_value=_all_csvs_ok(),
        ),
        patch(
            "custom_components.wiener_linien_austria.rate_limit.asyncio.sleep",
            new_callable=AsyncMock,
        ) as mock_sleep,
    ):
        await static_mod._fetch_and_build(hass, prior=None)

    mock_sleep.assert_awaited_once()
    assert abs(mock_sleep.call_args.args[0] - (DOMAIN_COOLDOWN_SECONDS - elapsed)) < 0.5


@pytest.mark.real_domain_cooldown
async def test_fetch_and_build_takes_the_cooldown_once_not_per_file(
    hass: HomeAssistant,
) -> None:
    """One cooldown slot for the whole burst, not one per file.

    Taking it per file would serialise a fail-soft background refresh into
    5 x DOMAIN_COOLDOWN_SECONDS of held lock and stall every `/monitor` tick
    behind it — strictly worse than the bypass it replaced.
    """
    from custom_components.wiener_linien_austria import static as static_mod

    hass.data.setdefault(DOMAIN, {})[DOMAIN_LAST_CALL_KEY] = (
        dt_util.utcnow() - timedelta(seconds=1.0)
    )
    session = _all_csvs_ok()

    with (
        patch(
            "custom_components.wiener_linien_austria.static.async_get_clientsession",
            return_value=session,
        ),
        patch(
            "custom_components.wiener_linien_austria.rate_limit.asyncio.sleep",
            new_callable=AsyncMock,
        ) as mock_sleep,
    ):
        await static_mod._fetch_and_build(hass, prior=None)

    assert session.get.call_count == 5
    assert mock_sleep.await_count == 1


async def test_static_downloads_send_user_agent_and_gzip(
    hass: HomeAssistant,
) -> None:
    """Every static download carries the canonical User-Agent.

    The fourth outbound call site alongside the three in test_user_agent.py.
    """
    from custom_components.wiener_linien_austria import static as static_mod

    session = _all_csvs_ok()
    with patch(
        "custom_components.wiener_linien_austria.static.async_get_clientsession",
        return_value=session,
    ):
        await static_mod._fetch_and_build(hass, prior=None)

    assert session.get.call_count == 5
    for call in session.get.call_args_list:
        headers = call.kwargs["headers"]
        assert headers["User-Agent"] == USER_AGENT
        # Unset on purpose — pinning would narrow aiohttp's own offer.
        assert "Accept-Encoding" not in headers
        # No conditional-GET validators: the upstream never answers 304.
        assert "If-None-Match" not in headers
        assert "If-Modified-Since" not in headers


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


# ---------------------------------------------------------------------------
# Trip-pattern index: parsing, lookup, hybrid truncation, fail-soft branches
# ---------------------------------------------------------------------------


def _u1_catalogue() -> StaticCatalogue:
    """Build a catalogue spanning U1 H + R with named station fixtures.

    Each station carries the RBLs the FAHR_CSV references so
    `stops_ahead_for_match` can resolve them back to display names.
    """
    stations: dict[int, Station] = {
        62000001: Station(62000001, "Reumannplatz", "Wien", 16.37, 48.18, [4001]),
        60201012: Station(
            60201012, "Stephansplatz", "Wien", 16.37, 48.21, [4111, 4118]
        ),
        62000002: Station(62000002, "Praterstern", "Wien", 16.39, 48.22, [4222]),
        62000003: Station(62000003, "Leopoldau", "Wien", 16.47, 48.27, [4333]),
    }
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched="2026-04-28T12:00:00+00:00",
        trip_patterns=_build_sample_index(),
    )


def test_parse_trip_patterns_builds_line_label_lookup() -> None:
    """linien.csv yields LineText → LineID + MeansOfTransport mappings."""
    index = _parse_trip_patterns(LINIEN_CSV, FAHR_CSV)
    assert index.lines_by_label == {"U1": 301, "71": 771}
    assert index.means_by_line[301] == "ptMetro"
    assert index.means_by_line[771] == "ptTram"


def test_parse_trip_patterns_orders_stops_by_seq_count() -> None:
    """Sequence gaps are tolerated; sort is by StopSeqCount value."""
    index = _parse_trip_patterns(LINIEN_CSV, FAHR_CSV)
    h_pattern = next(p for p in index.patterns_by_line[301] if p.pattern_id == 1)
    # H pattern: Reumannplatz(0) → Stephansplatz(1) → Praterstern(3) → Leopoldau(4)
    assert h_pattern.stops == (4001, 4111, 4222, 4333)
    assert h_pattern.direction == 1


# Real-shape sample of GTFS routes.txt: header includes a UTF-8 BOM as the
# upstream feed actually serves. Covers: U-Bahn (own colour, agency 04),
# tram (shared red, agency 04), bus (shared navy, agency 04), an SEV row
# with empty colour (must be skipped, not crash), a WLB row claiming a
# label that Wiener Linien also claims (agency 04 must win), and a row
# with a malformed colour (must be skipped silently).
ROUTES_CSV = (
    "﻿route_id,agency_id,route_short_name,route_long_name,"
    "route_type,route_color,route_text_color\n"
    "21-U1-j26-1,04,U1,Oberlaa - Leopoldau,1,E3000F,FFFFFF\n"
    "22-71-j26-1,04,71,Kaiserebersdorf - Schwarzenbergplatz,0,C00808,FFFFFF\n"
    "23-13A-j26-1,04,13A,Skodagasse - Hauptbahnhof,3,0A295D,FFFFFF\n"
    "11-SEV-1-j26-1,03,SEV BB,Vösendorf - Wiener Neudorf,3,,\n"
    # WLB also publishes a "13A" — Wiener Linien's claim must win.
    "11-13A-WLB,03,13A,WLB ghost,3,000000,FFFFFF\n"
    # Malformed: colour too short. Skipped, doesn't break the rest.
    "22-99-j26-1,04,99,Bad row,0,ABC,FFFFFF\n"
)


def test_parse_route_colors_keeps_only_valid_rows() -> None:
    """SEV (empty colour) and malformed rows are skipped; colours uppercased."""
    bg, fg = _parse_route_colors(ROUTES_CSV)
    assert bg == {
        "U1": "E3000F",
        "71": "C00808",
        "13A": "0A295D",  # Wiener Linien wins over WLB's "000000"
    }
    assert fg == {"U1": "FFFFFF", "71": "FFFFFF", "13A": "FFFFFF"}
    assert "99" not in bg  # malformed colour skipped
    assert "SEV BB" not in bg  # empty colour skipped


def test_parse_route_colors_wiener_linien_wins_on_label_collision() -> None:
    """When agency 03 (WLB) and agency 04 (Wiener Linien) both publish a label,
    the Wiener Linien row wins regardless of file order."""
    csv_text = (
        "route_id,agency_id,route_short_name,route_long_name,"
        "route_type,route_color,route_text_color\n"
        # WLB row appears FIRST in the file.
        "11-13A-WLB,03,13A,WLB ghost,3,000000,FFFFFF\n"
        # Wiener Linien row arrives later — should still win.
        "23-13A-j26-1,04,13A,Skodagasse - Hauptbahnhof,3,0A295D,FFFFFF\n"
    )
    bg, _ = _parse_route_colors(csv_text)
    assert bg["13A"] == "0A295D"


def test_parse_route_colors_empty_text_color_omits_fg() -> None:
    """A row with bg but blank text_color records bg only — no fg key."""
    csv_text = (
        "route_id,agency_id,route_short_name,route_long_name,"
        "route_type,route_color,route_text_color\n"
        "21-U1-j26-1,04,U1,Oberlaa - Leopoldau,1,E3000F,\n"
    )
    bg, fg = _parse_route_colors(csv_text)
    assert bg == {"U1": "E3000F"}
    assert fg == {}


def test_trip_pattern_index_round_trips_colors_through_store() -> None:
    """Colours survive a Store write/read cycle without loss."""
    bg, fg = _parse_route_colors(ROUTES_CSV)
    index = TripPatternIndex(
        lines_by_label={"U1": 301},
        means_by_line={301: "ptMetro"},
        colors_by_line=bg,
        text_colors_by_line=fg,
    )
    catalogue = StaticCatalogue(
        stations_by_diva={},
        last_fetched="2026-04-30T12:00:00+00:00",
        trip_patterns=index,
    )
    payload = _catalogue_to_store(catalogue)
    restored = _catalogue_from_store(payload)
    assert restored.trip_patterns is not None
    assert restored.trip_patterns.colors_by_line == bg
    assert restored.trip_patterns.text_colors_by_line == fg


def test_stops_ahead_for_match_returns_tail_after_current_rbl() -> None:
    """From Stephansplatz on U1/H, the next stops are Praterstern + Leopoldau."""
    catalogue = _u1_catalogue()
    result = stops_ahead_for_match(
        catalogue,
        line_label="U1",
        entry_rbls=[4111, 4118],  # both H and R RBLs at our DIVA
        towards="Leopoldau",
    )
    assert result is not None
    names = [s["name"] for s in result]
    assert names == ["Praterstern", "Leopoldau"]
    assert result[-1].get("is_terminus") is True
    assert "is_terminus" not in result[0]


def test_stops_ahead_for_match_excludes_current_stop() -> None:
    """The current stop is never in the returned tail."""
    catalogue = _u1_catalogue()
    result = stops_ahead_for_match(catalogue, "U1", [4111, 4118], "Leopoldau")
    assert result is not None
    assert all(s["name"] != "Stephansplatz" for s in result)


def test_stops_ahead_for_match_unknown_line_returns_none() -> None:
    """Replacement service / unmatched line → None (card hides chevron)."""
    catalogue = _u1_catalogue()
    assert stops_ahead_for_match(catalogue, "U99", [4111], "Wherever") is None


def test_stops_ahead_for_match_no_trip_patterns_returns_none() -> None:
    """Catalogue without a trip-pattern index → None."""
    stations = _u1_catalogue().stations_by_diva
    catalogue = StaticCatalogue(
        stations_by_diva=stations, last_fetched="t", trip_patterns=None
    )
    assert stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau") is None


def test_stops_ahead_for_match_terminus_substring_picks_branch() -> None:
    """Branching termini: substring match selects the right pattern.

    U1/H ends at Leopoldau. Even with a fuzzy `towards` like "Leopoldau"
    or "Leopoldau S+U", the substring matcher resolves to the H pattern
    rather than the R pattern (which terminates at Reumannplatz).
    """
    catalogue = _u1_catalogue()
    result = stops_ahead_for_match(catalogue, "U1", [4111, 4118], "Leopoldau S+U")
    assert result is not None
    assert result[-1]["name"] == "Leopoldau"


def test_stops_ahead_short_turn_truncates_tail_at_towards() -> None:
    """When `towards` is a stop ON the pattern (not its terminus), truncate.

    Regression: Alaudagasse-bound U1 short-turns hit the Oberlaa pattern
    (no Alaudagasse-terminating variant in fahrwegverlaeufe.csv) and
    rendered the full path to Oberlaa with Oberlaa marked terminus —
    contradicting the row's "Alaudagasse" header. The truncation walks
    the matched pattern's tail looking for `towards` and ends the list
    there, keeping the panel's terminus consistent with the live row.
    """
    # Build a 4-stop H pattern: Reumannplatz → Stephansplatz → Praterstern → Leopoldau
    # Then ask for towards="Praterstern" — should truncate at Praterstern.
    catalogue = _u1_catalogue()
    result = stops_ahead_for_match(
        catalogue,
        "U1",
        [4001],  # at Reumannplatz, going H
        "Praterstern",  # short-turn before the real terminus (Leopoldau)
        live_direction="H",
    )
    assert result is not None
    assert [s["name"] for s in result] == ["Stephansplatz", "Praterstern"]
    assert result[-1].get("is_terminus") is True
    # Real terminus (Leopoldau) absent — we truncated.
    assert all(s["name"] != "Leopoldau" for s in result)


def test_stops_ahead_short_turn_strips_descriptor_in_towards() -> None:
    """`towards` with a " - <descriptor>" suffix still truncates at the right stop.

    Regression: a U6 short-turn to "Michelbeuern - AKH" stopped at the
    Floridsdorf terminus instead of Michelbeuern because the matcher
    used the full `towards` as a substring needle and "michelbeuern -
    akh" is not contained in the catalogue's "Michelbeuern" name. Now
    we strip to the first segment before " - " (or " (" / ", ") so
    the canonical station name matches.
    """
    catalogue = _u1_catalogue()
    # The H pattern is Reumannplatz → Stephansplatz → Praterstern →
    # Leopoldau. Asking for towards="Praterstern - DescriptorX" should
    # truncate at Praterstern as if towards were just "Praterstern".
    result = stops_ahead_for_match(
        catalogue,
        "U1",
        [4001],
        "Praterstern - Tegetthoff",
        live_direction="H",
    )
    assert result is not None
    assert [s["name"] for s in result] == ["Stephansplatz", "Praterstern"]
    assert result[-1].get("is_terminus") is True


def test_stops_ahead_for_match_returns_empty_at_terminus() -> None:
    """When our RBL IS the terminus, return an empty list (not None)."""
    catalogue = _u1_catalogue()
    # Approach Leopoldau (RBL 4333) as if we're already there.
    result = stops_ahead_for_match(catalogue, "U1", [4333], "Leopoldau")
    assert result == []


def test_stops_ahead_full_route_no_truncation() -> None:
    """Full path is returned (no head+ellipsis+terminus truncation)."""
    stations = {
        i: Station(i, f"Stop{i}", "Wien", 16.0, 48.0, [i]) for i in range(1, 11)
    }
    long_pattern = TripPattern(
        line_id=999,
        pattern_id=1,
        direction=1,
        stops=tuple(range(1, 11)),  # 1..10
    )
    catalogue = StaticCatalogue(
        stations_by_diva=stations,
        last_fetched="t",
        trip_patterns=TripPatternIndex(
            patterns_by_line={999: [long_pattern]},
            lines_by_label={"X1": 999},
        ),
    )
    result = stops_ahead_for_match(catalogue, "X1", [1], "Stop10")
    assert result is not None
    # All 9 downstream stops, no ellipsis marker.
    assert [s["name"] for s in result] == [f"Stop{i}" for i in range(2, 11)]
    assert result[-1].get("is_terminus") is True
    assert all("is_ellipsis" not in s for s in result)


def test_stops_ahead_capped_at_max_stops_ahead() -> None:
    """The hard MAX_STOPS_AHEAD safety cap bounds runaway data."""
    from custom_components.wiener_linien_austria.const import MAX_STOPS_AHEAD

    # Build a pattern longer than MAX_STOPS_AHEAD.
    n = MAX_STOPS_AHEAD + 5
    stations = {
        i: Station(i, f"Stop{i}", "Wien", 16.0, 48.0, [i]) for i in range(n + 1)
    }
    long_pattern = TripPattern(
        line_id=999,
        pattern_id=1,
        direction=1,
        stops=tuple(range(n + 1)),
    )
    catalogue = StaticCatalogue(
        stations_by_diva=stations,
        last_fetched="t",
        trip_patterns=TripPatternIndex(
            patterns_by_line={999: [long_pattern]},
            lines_by_label={"X1": 999},
        ),
    )
    result = stops_ahead_for_match(catalogue, "X1", [0], f"Stop{n}")
    assert result is not None
    assert len(result) == MAX_STOPS_AHEAD


def test_stops_ahead_includes_transfer_lines() -> None:
    """Stops carry a `lines` list of OTHER lines that pass through."""
    catalogue = _u1_catalogue()
    # Inject a transfer entry: Stephansplatz also has U3 + U4 in the index.
    catalogue.trip_patterns.lines_at_diva = {
        60201012: ("U1", "U3", "U4"),  # Stephansplatz transfer hub
    }
    result = stops_ahead_for_match(
        catalogue, "U1", [4001], "Leopoldau", live_direction="H"
    )
    assert result is not None
    stephansplatz = next(s for s in result if s["name"] == "Stephansplatz")
    # Current line (U1) excluded; only U3 + U4 surface as transfers.
    assert stephansplatz.get("lines") == ["U3", "U4"]


def test_lines_at_diva_sort_groups_by_mode_of_transport() -> None:
    """lines_at_diva groups by MoT first (Metro → Tram → Bus → Night),
    then by leading-digit number within each mode.

    Without an authoritative MoT lookup, the sort uses a label-format
    heuristic: U-prefix → Metro, N-prefix → Nightline, digit+letter
    suffix → city bus, everything else → tram. Both paths produce the
    same ordering for the four standard Wiener Linien label formats.
    """
    from custom_components.wiener_linien_austria.static import _sort_line_labels

    labels = ["U6", "13A", "N66", "2", "U1", "62", "N25", "D", "10A"]
    # Metro (U1, U6) → Tram (2, 62, D — D sorts last among trams as
    # letter-only) → city bus (10A, 13A) → Nightline (N25, N66).
    assert _sort_line_labels(labels) == (
        "U1",
        "U6",
        "2",
        "62",
        "D",
        "10A",
        "13A",
        "N25",
        "N66",
    )


def test_sort_line_labels_uses_mot_lookup_when_provided() -> None:
    """Authoritative MoT lookup overrides the label-format heuristic.

    "WLB" is two-letter (heuristic would call it tram) but the live
    catalogue may say it's something else; the lookup path wins.
    """
    from custom_components.wiener_linien_austria.static import _sort_line_labels

    labels = ["U6", "WLB", "71"]
    mot = {"U6": "ptMetro", "WLB": "ptTram", "71": "ptTram"}
    # Metro first, then trams sorted numerically (71 before letter-only
    # WLB which falls to the letter-tie sentinel).
    assert _sort_line_labels(labels, mot) == ("U6", "71", "WLB")


def test_stops_ahead_omits_lines_when_no_transfers() -> None:
    """Stops without transfer data don't add an empty `lines` field."""
    catalogue = _u1_catalogue()  # lines_at_diva empty by default
    result = stops_ahead_for_match(
        catalogue, "U1", [4001], "Leopoldau", live_direction="H"
    )
    assert result is not None
    assert all("lines" not in s for s in result)


def test_stops_ahead_direction_filter_picks_right_branch() -> None:
    """H/R direction filter resolves the right pattern when both H+R match.

    Regression: the U1/Taubstummengasse entry tracks both platforms (4107
    H and 4122 R). Without the direction filter, an R departure towards
    Alaudagasse matched the H pattern (which contains 4107) and rendered
    northbound stops. The filter restricts candidates to patterns whose
    numeric Direction matches the live row's H/R before the RBL search.
    """
    catalogue = _u1_catalogue()
    # Live row: U1, direction R, towards Reumannplatz — entry has both H
    # (RBL 4111) and R (RBL 4118) RBLs at this DIVA.
    result = stops_ahead_for_match(
        catalogue,
        "U1",
        [4111, 4118],
        "Reumannplatz",
        live_direction="R",
    )
    assert result is not None
    # R pattern goes 4333 → 4222 → 4118 → 4001; from 4118 the tail is [4001].
    # Reumannplatz (DIVA 62000001) is the only stop in the tail.
    assert [s["name"] for s in result] == ["Reumannplatz"]
    assert result[-1].get("is_terminus") is True


def test_stops_ahead_short_route_returned_intact() -> None:
    """Short lists come back fully."""
    catalogue = _u1_catalogue()
    # H pattern from Stephansplatz has 2 stops ahead.
    result = stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau")
    assert result is not None
    assert len(result) == 2
    assert "diva" not in result[0]  # diva field dropped from output
    assert all("is_ellipsis" not in s for s in result)


# ---------------------------------------------------------------------------
# Store v1 → v1+trip_patterns roundtrip + backwards compat
# ---------------------------------------------------------------------------


def test_store_roundtrip_with_trip_patterns() -> None:
    """A catalogue with trip_patterns serialises and re-loads losslessly."""
    catalogue = _u1_catalogue()
    payload = _catalogue_to_store(catalogue)
    rebuilt = _catalogue_from_store(payload)
    assert rebuilt.trip_patterns is not None
    assert rebuilt.trip_patterns.lines_by_label["U1"] == 301
    h_pattern = next(
        p for p in rebuilt.trip_patterns.patterns_by_line[301] if p.pattern_id == 1
    )
    assert h_pattern.stops == (4001, 4111, 4222, 4333)


def test_store_load_pre_trip_pattern_payload_treats_field_as_missing() -> None:
    """Old caches without `trip_patterns` deserialise with None — no crash."""
    catalogue = _sample()
    payload = _catalogue_to_store(catalogue)
    # Simulate a v1.3 cache: strip the new key entirely.
    payload.pop("trip_patterns", None)
    rebuilt = _catalogue_from_store(payload)
    assert rebuilt.trip_patterns is None
    # Stations + RBLs preserved as before.
    assert 60201012 in rebuilt.stations_by_diva


async def test_async_load_catalogue_pre_1_4_cache_schedules_background_refetch(
    hass: HomeAssistant,
) -> None:
    """A cache without trip_patterns spawns a background refetch.

    1.4.0 introduced trip_patterns additively. The refetch runs in the
    background so coordinator.async_setup never blocks on the multi-MB
    fahrwegverlaeufe.csv download — without this, the per-entry setup
    timeout cancels the load on a Pi-class host. The stale cache is
    returned synchronously; running coordinators read the shared ref
    live and pick up the refreshed catalogue when the task completes.
    """
    store: Store[dict] = Store(hass, STORE_VERSION, STORE_KEY)
    payload = _catalogue_to_store(_sample())
    payload.pop("trip_patterns", None)  # simulate pre-1.4 cache
    await store.async_save(payload)

    refreshed = _u1_catalogue()  # has a populated trip_patterns
    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        return_value=refreshed,
    ) as mock_fetch:
        result = await async_load_catalogue(hass)
        # Stale cache returned synchronously — refetch hasn't run yet.
        assert result.trip_patterns is None
        # Drain the background task queue.
        await hass.async_block_till_done()

    mock_fetch.assert_awaited_once()
    saved = await store.async_load()
    assert saved is not None
    assert saved.get("trip_patterns") is not None


async def test_async_load_catalogue_pre_1_4_cache_swallows_network_failure(
    hass: HomeAssistant,
) -> None:
    """A failing background refetch leaves the stale cache intact, no raise."""
    store: Store[dict] = Store(hass, STORE_VERSION, STORE_KEY)
    payload = _catalogue_to_store(_sample())
    payload.pop("trip_patterns", None)
    await store.async_save(payload)

    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("upstream unreachable"),
    ):
        result = await async_load_catalogue(hass)
        await hass.async_block_till_done()

    assert result.trip_patterns is None
    assert 60201012 in result.stations_by_diva
    # Store unchanged — failed background refresh must not corrupt it.
    saved = await store.async_load()
    assert saved is not None
    assert saved.get("trip_patterns") is None


# ---------------------------------------------------------------------------
# The CSV parse block runs off the event loop
# ---------------------------------------------------------------------------


async def test_fetch_and_build_parses_in_the_executor(hass: HomeAssistant) -> None:
    """The whole parse block goes through `async_add_executor_job`, once.

    Measured on live data, the four parsers cost ~137 ms on Apple silicon
    and roughly 0.5-0.9 s on a Pi 4 — dominated by fahrwegverlaeufe.csv at
    ~87,000 rows. That lands on first setup and on every weekly refresh, so
    inlining it back onto the loop is a real regression that no other test
    would notice.

    The "once" half matters too: `_merge_haltepunkte` mutates the stations
    dict that `_parse_trip_patterns` then reads, so three separate hops
    would drag that mutation across a thread boundary twice.
    """
    with (
        patch(
            "custom_components.wiener_linien_austria.static"
            ".async_enforce_domain_cooldown",
            new=AsyncMock(),
        ),
        patch(
            "custom_components.wiener_linien_austria.static._download_text",
            new=AsyncMock(side_effect=[HALTESTELLEN_CSV, HALTEPUNKTE_CSV]),
        ),
        patch(
            "custom_components.wiener_linien_austria.static._download_or_fail_soft",
            new=AsyncMock(
                side_effect=[
                    (LINIEN_CSV, False),
                    (FAHR_CSV, False),
                    (ROUTES_CSV, False),
                ]
            ),
        ),
        patch.object(
            hass, "async_add_executor_job", wraps=hass.async_add_executor_job
        ) as executor,
    ):
        catalogue = await _fetch_and_build(hass, prior=None)

    assert catalogue.stations_by_diva
    assert catalogue.trip_patterns is not None
    parse_calls = [
        call for call in executor.call_args_list if call.args[0] is _parse_all
    ]
    assert len(parse_calls) == 1


def test_parse_all_touches_neither_hass_nor_the_logger() -> None:
    """`_parse_all` must stay pure — it runs in a worker thread.

    Returning errors as values instead of logging them is what keeps every
    fail-soft decision, and every `_LOGGER` call, on the event loop.
    """
    result = _parse_all(HALTESTELLEN_CSV, HALTEPUNKTE_CSV, LINIEN_CSV, FAHR_CSV, None)

    assert result.stations
    assert result.trip_patterns is not None
    assert result.trip_pattern_error is None
    assert result.route_colors is None
    assert result.route_color_error is None


def test_parse_all_returns_a_broken_trip_pattern_csv_as_a_value() -> None:
    """A parse failure comes back as `trip_pattern_error`, not as a raise.

    `_fetch_and_build` relies on this to carry the prior index forward — a
    raise here would take the station refresh down with it.
    """
    result = _parse_all(
        HALTESTELLEN_CSV, HALTEPUNKTE_CSV, "not;a;linien;csv\n", "", None
    )

    assert result.stations
    assert result.trip_patterns is None or not result.trip_patterns.patterns_by_line


# ---------------------------------------------------------------------------
# async_get_catalogue — process-wide memoisation
# ---------------------------------------------------------------------------
#
# The conftest autouse fixture patches `static.async_get_catalogue`, so
# nothing else in the suite ever runs this function. These tests import it
# directly at module load, which binds the real object before the fixture
# swaps the module attribute — the inner `async_load_catalogue` call still
# resolves through module globals and stays stubbed, so there is no network.


async def test_get_catalogue_returns_a_resolved_cache_without_loading(
    hass: HomeAssistant,
) -> None:
    """A StaticCatalogue already in hass.data is returned as-is, O(1)."""
    catalogue = _build_catalogue()
    hass.data.setdefault(DOMAIN, {})[CATALOGUE_KEY] = catalogue

    with patch(
        "custom_components.wiener_linien_austria.static.async_load_catalogue",
        new_callable=AsyncMock,
    ) as loader:
        assert await async_get_catalogue(hass) is catalogue

    loader.assert_not_awaited()


async def test_concurrent_callers_share_one_load(hass: HomeAssistant) -> None:
    """The config flow, every coordinator's setup and the refresher collide.

    On a cold start they all ask at once. Without the in-flight task in
    hass.data each would start its own multi-MB download of the same five
    CSVs. This is the guarantee that they don't.
    """
    catalogue = _build_catalogue()
    started = asyncio.Event()
    release = asyncio.Event()
    calls = 0

    async def _slow_load(_hass: HomeAssistant) -> StaticCatalogue:
        nonlocal calls
        calls += 1
        started.set()
        await release.wait()
        return catalogue

    hass.data.setdefault(DOMAIN, {}).pop(CATALOGUE_KEY, None)
    with patch(
        "custom_components.wiener_linien_austria.static.async_load_catalogue",
        new=_slow_load,
    ):
        first = asyncio.create_task(async_get_catalogue(hass))
        await started.wait()
        second = asyncio.create_task(async_get_catalogue(hass))
        await asyncio.sleep(0)
        release.set()
        results = await asyncio.gather(first, second)

    assert calls == 1
    assert results[0] is catalogue
    assert results[1] is catalogue
    # Resolved value replaces the task, so later callers are O(1).
    assert hass.data[DOMAIN][CATALOGUE_KEY] is catalogue


async def test_a_failed_load_is_not_cached(hass: HomeAssistant) -> None:
    """The next caller must retry from scratch, not await a dead task.

    Leaving the failed task in hass.data would make one transient network
    failure permanent for the life of the HA process.
    """
    hass.data.setdefault(DOMAIN, {}).pop(CATALOGUE_KEY, None)

    with (
        patch(
            "custom_components.wiener_linien_austria.static.async_load_catalogue",
            new_callable=AsyncMock,
            side_effect=RuntimeError("no cache, no network"),
        ),
        pytest.raises(RuntimeError),
    ):
        await async_get_catalogue(hass)

    assert CATALOGUE_KEY not in hass.data[DOMAIN]


# ---------------------------------------------------------------------------
# async_set_cached_catalogue — the post-teardown race
# ---------------------------------------------------------------------------


async def test_set_cached_catalogue_is_a_noop_after_the_last_unload(
    hass: HomeAssistant,
) -> None:
    """A background refresh finishing after teardown must not re-poison.

    `_teardown_domain_state` sets ENTRY_COUNT_KEY to 0 rather than popping
    it, so a presence-only check would let this through — the value is
    what has to be tested.
    """
    hass.data[DOMAIN] = {ENTRY_COUNT_KEY: 0}
    async_set_cached_catalogue(hass, _build_catalogue())
    assert CATALOGUE_KEY not in hass.data[DOMAIN]

    hass.data[DOMAIN] = {}
    async_set_cached_catalogue(hass, _build_catalogue())
    assert CATALOGUE_KEY not in hass.data[DOMAIN]


async def test_set_cached_catalogue_publishes_while_entries_remain(
    hass: HomeAssistant,
) -> None:
    """With a live entry, the refreshed catalogue does get published."""
    catalogue = _build_catalogue()
    hass.data[DOMAIN] = {ENTRY_COUNT_KEY: 1}
    async_set_cached_catalogue(hass, catalogue)
    assert hass.data[DOMAIN][CATALOGUE_KEY] is catalogue


# ---------------------------------------------------------------------------
# _async_background_refresh — every way it declines to publish
# ---------------------------------------------------------------------------


async def test_background_refresh_logs_and_returns_on_failure(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """A failed refresh retries next week rather than crashing the task."""
    caplog.set_level(logging.WARNING)
    prior = _build_catalogue()
    store = MagicMock()
    store.async_save = AsyncMock()

    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("upstream down"),
    ):
        await _async_background_refresh(hass, prior, store)

    assert "Background refresh failed" in caplog.text
    store.async_save.assert_not_awaited()


async def test_background_refresh_propagates_cancellation(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """HA shutting down mid-fetch is not a failure to log noisily about."""
    caplog.set_level(logging.WARNING)
    store = MagicMock()
    store.async_save = AsyncMock()

    with (
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            side_effect=asyncio.CancelledError,
        ),
        pytest.raises(asyncio.CancelledError),
    ):
        await _async_background_refresh(hass, _build_catalogue(), store)

    assert "Background refresh failed" not in caplog.text


async def test_background_refresh_skips_the_write_when_nothing_changed(
    hass: HomeAssistant,
) -> None:
    """`refreshed is prior` means no write and, importantly, no re-publish.

    Re-publishing `prior` could itself clobber a newer catalogue the
    weekly refresh installed while this one was downloading.
    """
    prior = _build_catalogue()
    store = MagicMock()
    store.async_save = AsyncMock()

    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        return_value=prior,
    ):
        await _async_background_refresh(hass, prior, store)

    store.async_save.assert_not_awaited()


async def test_background_refresh_declines_to_clobber_a_newer_catalogue(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """The lost-update guard: weekly refresh won the race, we stand down.

    This task started from `prior` and spent a while downloading. If the
    weekly refresh published something newer meanwhile, writing our
    result would silently roll the catalogue backwards.
    """
    caplog.set_level(logging.WARNING)
    prior = _build_catalogue(last_fetched="2026-01-01T00:00:00+00:00")
    newer = _build_catalogue(last_fetched="2026-06-01T00:00:00+00:00")
    ours = _build_catalogue(last_fetched="2026-03-01T00:00:00+00:00")
    hass.data[DOMAIN] = {ENTRY_COUNT_KEY: 1, CATALOGUE_KEY: newer}
    store = MagicMock()
    store.async_save = AsyncMock()

    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        return_value=ours,
    ):
        await _async_background_refresh(hass, prior, store)

    assert "superseded by a newer catalogue" in caplog.text
    store.async_save.assert_not_awaited()
    assert hass.data[DOMAIN][CATALOGUE_KEY] is newer


async def test_background_refresh_publishes_even_if_the_store_write_fails(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """A full disk costs persistence, not the in-memory refresh."""
    caplog.set_level(logging.WARNING)
    prior = _build_catalogue(last_fetched="2026-01-01T00:00:00+00:00")
    fresh = _build_catalogue(last_fetched="2026-03-01T00:00:00+00:00")
    hass.data[DOMAIN] = {ENTRY_COUNT_KEY: 1, CATALOGUE_KEY: prior}
    store = MagicMock()
    store.async_save = AsyncMock(side_effect=OSError("disk full"))

    with patch(
        "custom_components.wiener_linien_austria.static._fetch_and_build",
        new_callable=AsyncMock,
        return_value=fresh,
    ):
        await _async_background_refresh(hass, prior, store)

    assert "in-memory only" in caplog.text
    assert hass.data[DOMAIN][CATALOGUE_KEY] is fresh


# ---------------------------------------------------------------------------
# async_refresh_catalogue — the weekly path
# ---------------------------------------------------------------------------


async def test_refresh_starts_from_scratch_on_an_unreadable_cache(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """A truncated or unreadable store file is "no prior", not a crash."""
    caplog.set_level(logging.WARNING)
    fresh = _build_catalogue()

    with (
        patch.object(Store, "async_load", AsyncMock(side_effect=OSError("truncated"))),
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            return_value=fresh,
        ) as build,
        patch.object(Store, "async_save", AsyncMock()),
    ):
        result = await async_refresh_catalogue(hass)

    assert result is fresh
    assert "starting from scratch" in caplog.text
    assert build.await_args.kwargs["prior"] is None


async def test_refresh_treats_a_corrupt_payload_as_no_prior(
    hass: HomeAssistant,
) -> None:
    """A cache payload that can't be rebuilt must not become `prior`.

    Passing a half-built catalogue in would let `_fetch_and_build`
    "preserve" garbage on a fail-soft leg.
    """
    fresh = _build_catalogue()

    with (
        patch.object(Store, "async_load", AsyncMock(return_value={"bogus": 1})),
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            return_value=fresh,
        ) as build,
        patch.object(Store, "async_save", AsyncMock()),
    ):
        assert await async_refresh_catalogue(hass) is fresh

    assert build.await_args.kwargs["prior"] is None


async def test_refresh_keeps_the_cache_when_the_fetch_fails(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """Returns None so the caller leaves the existing catalogue alone."""
    caplog.set_level(logging.WARNING)

    with (
        patch.object(Store, "async_load", AsyncMock(return_value=None)),
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            side_effect=TimeoutError,
        ),
    ):
        assert await async_refresh_catalogue(hass) is None

    assert "keeping cache" in caplog.text


async def test_refresh_survives_a_failed_persist(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """The refreshed catalogue is still returned when the write fails."""
    caplog.set_level(logging.WARNING)
    fresh = _build_catalogue()

    with (
        patch.object(Store, "async_load", AsyncMock(return_value=None)),
        patch(
            "custom_components.wiener_linien_austria.static._fetch_and_build",
            new_callable=AsyncMock,
            return_value=fresh,
        ),
        patch.object(Store, "async_save", AsyncMock(side_effect=OSError("disk full"))),
    ):
        assert await async_refresh_catalogue(hass) is fresh

    assert "in-memory only" in caplog.text


# ---------------------------------------------------------------------------
# Malformed CSV rows — skip the row, keep the file
# ---------------------------------------------------------------------------
#
# Wiener Linien publish these files as a nightly export; a single bad row
# has appeared before and must not cost the whole catalogue. Every parser
# guards its own coercions, so these tests feed one broken row per parser
# and assert the good rows around it survive.


def test_merge_haltepunkte_skips_rows_with_unparseable_ids() -> None:
    """A non-numeric StopID or DIVA drops that platform, not the file."""
    stations = _parse_haltestellen(HALTESTELLEN_CSV)
    broken = (
        "StopID;DIVA;StopText;Municipality;MunicipalityID;Longitude;Latitude\n"
        "abc;60201012;Bad StopID;Wien;49000001;16.37;48.20\n"
        "4111;xyz;Bad DIVA;Wien;49000001;16.37;48.20\n"
        ";;Empty;Wien;49000001;16.37;48.20\n"
        "4118;60201012;Good row;Wien;49000001;16.3726;48.2085\n"
    )

    _merge_haltepunkte(stations, broken)

    assert stations[60201012].rbls == [4118]


def test_parse_trip_patterns_skips_broken_linien_rows() -> None:
    """A non-numeric LineID drops that line, not the index."""
    linien = (
        "LineID;LineText;SortingHelp;Realtime;MeansOfTransport\n"
        "not-a-number;U9;9;1;ptMetro\n"
        "301;U1;1;1;ptMetro\n"
        # Present but unlabelled — nothing to key `lines_by_label` on.
        "999;;9;1;ptMetro\n"
    )

    index = _parse_trip_patterns(linien, FAHR_CSV)

    assert index.lines_by_label == {"U1": 301}


def test_parse_trip_patterns_skips_broken_fahrweg_rows() -> None:
    """A row with any unparseable numeric column is dropped alone."""
    fahr = (
        "LineID;PatternID;StopSeqCount;StopID;Direction\n"
        "301;1;zero;4001;1\n"
        "301;1;1;not-an-rbl;1\n"
        ";;;;\n"
        "301;1;2;4111;1\n"
        "301;1;3;4222;1\n"
    )

    index = _parse_trip_patterns(LINIEN_CSV, fahr)

    assert index.patterns_by_line[301][0].stops == (4111, 4222)


def test_parse_all_returns_a_route_colour_failure_as_a_value() -> None:
    """A broken routes.txt must not take the trip-pattern rebuild with it.

    The two are independent by design: colours only depend on routes.txt,
    so a fresh routes payload can refresh colours even when the pattern
    CSVs failed, and vice versa.
    """
    with patch(
        "custom_components.wiener_linien_austria.static._parse_route_colors",
        side_effect=ValueError("no route_color column"),
    ):
        result = _parse_all(
            HALTESTELLEN_CSV, HALTEPUNKTE_CSV, LINIEN_CSV, FAHR_CSV, "garbage"
        )

    assert isinstance(result.route_color_error, ValueError)
    assert result.route_colors is None
    # The trip-pattern half is untouched.
    assert result.trip_patterns is not None
    assert result.trip_pattern_error is None


# ---------------------------------------------------------------------------
# _fetch_and_build — the fail-soft legs
# ---------------------------------------------------------------------------


async def _build_with(
    hass: HomeAssistant,
    *,
    linien: str | None,
    fahr: str | None,
    routes: str | None,
    prior: StaticCatalogue | None,
) -> StaticCatalogue:
    """Run `_fetch_and_build` with the optional downloads stubbed."""
    with (
        patch(
            "custom_components.wiener_linien_austria.static"
            ".async_enforce_domain_cooldown",
            new=AsyncMock(),
        ),
        patch(
            "custom_components.wiener_linien_austria.static._download_text",
            new=AsyncMock(side_effect=[HALTESTELLEN_CSV, HALTEPUNKTE_CSV]),
        ),
        patch(
            "custom_components.wiener_linien_austria.static._download_or_fail_soft",
            new=AsyncMock(
                side_effect=[
                    (linien, linien is None),
                    (fahr, fahr is None),
                    (routes, routes is None),
                ]
            ),
        ),
    ):
        return await _fetch_and_build(hass, prior=prior)


async def test_fetch_carries_the_prior_index_when_the_pattern_csvs_fail(
    hass: HomeAssistant,
) -> None:
    """The load-bearing fail-soft guarantee.

    A temporary fetch hiccup must not wipe stops_ahead for the next seven
    days — stations and RBLs still refresh, the trip-pattern index is
    carried forward untouched.
    """
    prior = StaticCatalogue(
        stations_by_diva={},
        last_fetched="2026-01-01T00:00:00+00:00",
        trip_patterns=_build_sample_index(),
    )

    catalogue = await _build_with(
        hass, linien=None, fahr=None, routes=None, prior=prior
    )

    assert catalogue.stations_by_diva  # stations DID refresh
    assert catalogue.trip_patterns is prior.trip_patterns


async def test_fetch_keeps_the_prior_index_when_the_pattern_parse_fails(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """Downloads succeeded but the CSV was unusable — same guarantee.

    Distinct from the fetch-failure leg above: this one reaches the
    parser and gets an exception back as a value from `_parse_all`.
    """
    caplog.set_level(logging.WARNING)
    prior = StaticCatalogue(
        stations_by_diva={},
        last_fetched="2026-01-01T00:00:00+00:00",
        trip_patterns=_build_sample_index(),
    )

    with patch(
        "custom_components.wiener_linien_austria.static._parse_trip_patterns",
        side_effect=ValueError("unexpected column layout"),
    ):
        catalogue = await _build_with(
            hass, linien=LINIEN_CSV, fahr=FAHR_CSV, routes=None, prior=prior
        )

    assert "keeping prior index" in caplog.text
    assert catalogue.trip_patterns is prior.trip_patterns


async def test_fetch_keeps_prior_colours_when_the_routes_parse_fails(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """A broken routes.txt costs the colour refresh, nothing else."""
    caplog.set_level(logging.WARNING)

    with patch(
        "custom_components.wiener_linien_austria.static._parse_route_colors",
        side_effect=ValueError("no route_color column"),
    ):
        catalogue = await _build_with(
            hass, linien=LINIEN_CSV, fahr=FAHR_CSV, routes="garbage", prior=None
        )

    assert "keeping prior colours" in caplog.text
    assert catalogue.trip_patterns is not None
    assert catalogue.trip_patterns.patterns_by_line  # patterns still fresh


async def test_download_or_fail_soft_reports_failure_without_raising(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """The optional CSVs signal failure as a flag, never an exception."""
    caplog.set_level(logging.WARNING)
    session = MagicMock()

    with patch(
        "custom_components.wiener_linien_austria.static._download_text",
        new=AsyncMock(side_effect=aiohttp.ClientError("connection reset")),
    ):
        body, failed = await _download_or_fail_soft(
            session, "https://example.invalid/x.csv", None
        )

    assert body is None
    assert failed is True
    assert "Optional static CSV fetch failed" in caplog.text


# ---------------------------------------------------------------------------
# _catalogue_from_store — corrupt persisted payloads
# ---------------------------------------------------------------------------


def test_catalogue_from_store_drops_a_corrupt_trip_pattern_block(
    caplog: pytest.LogCaptureFixture,
) -> None:
    """A malformed cached index degrades to None, not to an exception.

    Raising here would make a corrupt cache file a hard setup failure on
    every restart; returning None just means one refetch on the next
    weekly tick, with stations still loading from the same payload.
    """
    caplog.set_level(logging.WARNING)
    stations = _parse_haltestellen(HALTESTELLEN_CSV)
    payload = _catalogue_to_store(
        StaticCatalogue(
            stations_by_diva=stations,
            last_fetched="2026-04-20T12:00:00+00:00",
            trip_patterns=_build_sample_index(),
        )
    )
    payload["trip_patterns"]["patterns"][0]["pattern_id"] = "not-an-int"

    catalogue = _catalogue_from_store(payload)

    assert catalogue.trip_patterns is None
    assert catalogue.stations_by_diva  # stations still usable
    assert "corrupt trip-pattern cache" in caplog.text


def test_catalogue_from_store_drops_patterns_with_no_stops() -> None:
    """A pattern whose stop list is empty carries no information.

    Keeping it would put an entry in `patterns_by_line` that the matcher
    then has to skip on every single departure row.
    """
    payload = _catalogue_to_store(
        StaticCatalogue(
            stations_by_diva={},
            last_fetched="2026-04-20T12:00:00+00:00",
            trip_patterns=_build_sample_index(),
        )
    )
    for entry in payload["trip_patterns"]["patterns"]:
        entry["stops"] = []

    catalogue = _catalogue_from_store(payload)

    assert catalogue.trip_patterns is not None
    assert catalogue.trip_patterns.patterns_by_line == {}


# ---------------------------------------------------------------------------
# stops_ahead_for_match — the ways it declines to guess
# ---------------------------------------------------------------------------
#
# Every branch below returns None or []. That is the point: the trail
# renders a chevron on a departure row, and a wrong trail is worse than no
# trail — it tells the user the vehicle calls at stops it does not.


def _matcher_catalogue(
    patterns: list[TripPattern],
    *,
    stations: dict[int, Station] | None = None,
    lines_by_label: dict[str, int] | None = None,
) -> StaticCatalogue:
    """A catalogue carrying exactly the patterns a matcher test needs."""
    by_line: dict[int, list[TripPattern]] = {}
    for pattern in patterns:
        by_line.setdefault(pattern.line_id, []).append(pattern)
    return StaticCatalogue(
        stations_by_diva=stations if stations is not None else {},
        last_fetched="2026-04-20T12:00:00+00:00",
        trip_patterns=TripPatternIndex(
            patterns_by_line=by_line,
            lines_by_label=(
                lines_by_label if lines_by_label is not None else {"U1": 301}
            ),
            means_by_line={301: "ptMetro"},
            lines_at_diva={},
        ),
    )


def test_stops_ahead_returns_none_without_a_trip_pattern_index() -> None:
    """A catalogue loaded before the index landed — degrade, don't raise."""
    catalogue = StaticCatalogue(
        stations_by_diva={}, last_fetched="t", trip_patterns=None
    )
    assert stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau") is None


def test_stops_ahead_returns_none_for_a_line_with_no_patterns() -> None:
    """The label resolves to a line id that carries an empty pattern list.

    Reachable on a half-built index, where `lines_by_label` was populated
    from linien.csv but the matching fahrwegverlaeufe rows were dropped.
    """
    catalogue = _matcher_catalogue([])
    assert stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau") is None


def test_stops_ahead_returns_none_when_no_pattern_touches_our_rbls() -> None:
    """Every pattern for this line runs somewhere else entirely."""
    catalogue = _matcher_catalogue(
        [TripPattern(line_id=301, pattern_id=1, direction=1, stops=(900, 901))]
    )
    assert stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau") is None


def test_stops_ahead_skips_a_pattern_whose_terminus_has_no_name() -> None:
    """An unnameable terminus cannot be compared against `towards`.

    It falls through to the no-terminus-match path rather than matching
    on an empty string, which would match everything.
    """
    catalogue = _matcher_catalogue(
        [TripPattern(line_id=301, pattern_id=1, direction=1, stops=(4111, 999))],
        stations={
            1: Station(
                diva=1,
                name="Stephansplatz",
                municipality="Wien",
                longitude=16.37,
                latitude=48.20,
                rbls=[4111],
            )
        },
    )

    result = stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau")

    # RBL 999 belongs to no station, so the single tail entry is dropped
    # and the trail comes back empty rather than as a nameless bullet.
    assert result == []


def test_stops_ahead_refuses_to_guess_between_opposite_directions() -> None:
    """No `towards` and patterns running both ways — return None.

    Picking one would surface an arbitrary "next 8 stops" as truth, on a
    row the user reads as a fact about their train. Silence is correct.
    """
    catalogue = _matcher_catalogue(
        [
            TripPattern(line_id=301, pattern_id=1, direction=1, stops=(4111, 5000)),
            TripPattern(line_id=301, pattern_id=2, direction=2, stops=(4111, 6000)),
        ]
    )

    assert stops_ahead_for_match(catalogue, "U1", [4111], "") is None


def test_stops_ahead_still_answers_when_both_patterns_run_one_way() -> None:
    """Ambiguity is about direction, not about pattern count.

    Two same-direction branches are a normal short-turn pair; the matcher
    picks the longer tail rather than giving up.
    """
    stations = {
        i: Station(
            diva=i,
            name=f"Stop{i}",
            municipality="Wien",
            longitude=16.0,
            latitude=48.0,
            rbls=[4110 + i],
        )
        for i in range(1, 5)
    }
    catalogue = _matcher_catalogue(
        [
            TripPattern(line_id=301, pattern_id=1, direction=1, stops=(4111, 4112)),
            TripPattern(
                line_id=301, pattern_id=2, direction=1, stops=(4111, 4112, 4113)
            ),
        ],
        stations=stations,
    )

    result = stops_ahead_for_match(catalogue, "U1", [4111], "")

    assert result is not None
    assert [s["name"] for s in result] == ["Stop2", "Stop3"]


def test_stops_ahead_returns_empty_at_the_terminus() -> None:
    """`[]`, not None: we matched a pattern, the tail is genuinely empty.

    The card distinguishes the two — None means "no trail available",
    `[]` means "this is the last stop".
    """
    catalogue = _matcher_catalogue(
        [TripPattern(line_id=301, pattern_id=1, direction=1, stops=(4000, 4111))],
        stations={
            1: Station(
                diva=1,
                name="Leopoldau",
                municipality="Wien",
                longitude=16.4,
                latitude=48.2,
                rbls=[4111],
            )
        },
    )

    assert stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau") == []
