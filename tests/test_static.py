"""Tests for the Wiener Linien Austria static catalogue layer."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from custom_components.wiener_linien_austria.static import (
    STORE_KEY,
    STORE_VERSION,
    Station,
    StaticCatalogue,
    TripPattern,
    TripPatternIndex,
    _catalogue_from_store,
    _catalogue_to_store,
    _merge_haltepunkte,
    _parse_haltestellen,
    _parse_trip_patterns,
    async_load_catalogue,
    async_refresh_catalogue,
    stops_ahead_for_match,
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


def _build_sample_index() -> TripPatternIndex:
    """Helper: build a TripPatternIndex matching the LINIEN_CSV + FAHR_CSV."""
    return _parse_trip_patterns(LINIEN_CSV, FAHR_CSV)


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
        1: Station(diva=1, name="ZZZ Westbahnhof Areal", municipality="Wien",
                   longitude=0, latitude=0),
        2: Station(diva=2, name="Westbahnhof", municipality="Wien",
                   longitude=0, latitude=0),
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


# ---------------------------------------------------------------------------
# _fetch_and_build: live network simulation, conditional GET branches
# ---------------------------------------------------------------------------


def _csv_response(text: str, *, etag: str = '"v1"', status: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status = status
    resp.headers = {"ETag": etag, "Last-Modified": "Wed, 22 Apr 2026 10:00:00 GMT"}
    resp.raise_for_status = MagicMock()
    resp.text = AsyncMock(return_value=text)
    return resp


async def test_fetch_and_build_both_csvs_fresh(hass: HomeAssistant) -> None:
    """Cold-start: every CSV comes back 200, parse + merge into a catalogue."""
    from custom_components.wiener_linien_austria import static as static_mod

    haltestellen_resp = _csv_response(HALTESTELLEN_CSV, etag='"halte-v1"')
    haltepunkte_resp = _csv_response(HALTEPUNKTE_CSV, etag='"punkte-v1"')
    linien_resp = _csv_response(LINIEN_CSV, etag='"linien-v1"')
    fahr_resp = _csv_response(FAHR_CSV, etag='"fahr-v1"')

    fake_session = MagicMock()
    fake_session.get = AsyncMock(
        side_effect=[haltestellen_resp, haltepunkte_resp, linien_resp, fahr_resp]
    )

    with patch(
        "custom_components.wiener_linien_austria.static.async_get_clientsession",
        return_value=fake_session,
    ):
        catalogue = await static_mod._fetch_and_build(hass, prior=None)

    assert sorted(catalogue.stations_by_diva.keys()) == [60200123, 60201012]
    assert sorted(catalogue.stations_by_diva[60201012].rbls) == [4111, 4118]
    # Validators captured for the next conditional GET.
    assert catalogue.validators["haltestellen"].etag == '"halte-v1"'
    assert catalogue.validators["haltepunkte"].etag == '"punkte-v1"'
    assert catalogue.validators["linien"].etag == '"linien-v1"'
    assert catalogue.validators["fahrwegverlaeufe"].etag == '"fahr-v1"'
    # Trip-pattern index built from the fresh linien + fahrwegverlaeufe.
    assert catalogue.trip_patterns is not None
    assert catalogue.trip_patterns.lines_by_label["U1"] == 301


async def test_fetch_and_build_all_304_returns_prior_unchanged(
    hass: HomeAssistant,
) -> None:
    """Every CSV unchanged → return prior catalogue verbatim, no rewrite."""
    from custom_components.wiener_linien_austria import static as static_mod
    from custom_components.wiener_linien_austria.http import CacheValidators

    prior = _sample()
    prior.validators = {
        "haltestellen": CacheValidators(etag='"halte-v1"'),
        "haltepunkte": CacheValidators(etag='"punkte-v1"'),
        "linien": CacheValidators(etag='"linien-v1"'),
        "fahrwegverlaeufe": CacheValidators(etag='"fahr-v1"'),
    }
    prior.trip_patterns = _build_sample_index()

    def _not_modified() -> MagicMock:
        nm = MagicMock()
        nm.status = 304
        nm.headers = {}
        nm.raise_for_status = MagicMock()
        nm.text = AsyncMock(
            side_effect=AssertionError("must not call .text() on 304")
        )
        return nm

    fake_session = MagicMock()
    fake_session.get = AsyncMock(
        side_effect=[_not_modified(), _not_modified(), _not_modified(), _not_modified()]
    )

    with patch(
        "custom_components.wiener_linien_austria.static.async_get_clientsession",
        return_value=fake_session,
    ):
        result = await static_mod._fetch_and_build(hass, prior=prior)

    # Same object — identity check, the optimisation we want to lock in.
    assert result is prior


async def test_fetch_and_build_one_304_one_fresh(
    hass: HomeAssistant,
) -> None:
    """Half-and-half: haltestellen 304, haltepunkte fresh — re-merge correctly.

    This is the trickiest branch in static._fetch_and_build. The prior
    station list is reused, but RBLs are rebuilt from the freshly-fetched
    haltepunkte CSV. A bug here would either drop stations entirely or
    duplicate RBLs across loads. The trip-pattern CSVs are 304 too so
    the prior trip-pattern index carries forward unchanged.
    """
    from custom_components.wiener_linien_austria import static as static_mod
    from custom_components.wiener_linien_austria.http import CacheValidators

    # Prior already has Stephansplatz with RBLs [9999] (intentionally weird so
    # we can detect whether the merge correctly REPLACED them with [4111, 4118]).
    prior_stations = _parse_haltestellen(HALTESTELLEN_CSV)
    prior_stations[60201012].rbls = [9999]  # placeholder
    prior = StaticCatalogue(
        stations_by_diva=prior_stations,
        last_fetched="2026-04-20T12:00:00+00:00",
        validators={
            "haltestellen": CacheValidators(etag='"halte-v1"'),
            "haltepunkte": CacheValidators(etag='"punkte-v1"'),
            "linien": CacheValidators(etag='"linien-v1"'),
            "fahrwegverlaeufe": CacheValidators(etag='"fahr-v1"'),
        },
        trip_patterns=_build_sample_index(),
    )

    def _304() -> MagicMock:
        nm = MagicMock()
        nm.status = 304
        nm.headers = {}
        nm.raise_for_status = MagicMock()
        nm.text = AsyncMock(side_effect=AssertionError("304 has no body"))
        return nm

    punkte_fresh = _csv_response(HALTEPUNKTE_CSV, etag='"punkte-v2"')

    fake_session = MagicMock()
    fake_session.get = AsyncMock(side_effect=[_304(), punkte_fresh, _304(), _304()])

    with patch(
        "custom_components.wiener_linien_austria.static.async_get_clientsession",
        return_value=fake_session,
    ):
        result = await static_mod._fetch_and_build(hass, prior=prior)

    # Stations preserved (haltestellen 304), RBLs rebuilt from fresh haltepunkte.
    assert sorted(result.stations_by_diva.keys()) == [60200123, 60201012]
    assert sorted(result.stations_by_diva[60201012].rbls) == [4111, 4118]
    # Trip-pattern index carried forward from prior (both pattern CSVs 304).
    assert result.trip_patterns is not None
    assert "U1" in result.trip_patterns.lines_by_label


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
        60201012: Station(60201012, "Stephansplatz", "Wien", 16.37, 48.21, [4111, 4118]),
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
    h_pattern = next(
        p for p in index.patterns_by_line[301] if p.pattern_id == 1
    )
    # H pattern: Reumannplatz(0) → Stephansplatz(1) → Praterstern(3) → Leopoldau(4)
    assert h_pattern.stops == (4001, 4111, 4222, 4333)
    assert h_pattern.direction == 1


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
    result = stops_ahead_for_match(
        catalogue, "U1", [4111, 4118], "Leopoldau"
    )
    assert result is not None
    assert all(s["name"] != "Stephansplatz" for s in result)


def test_stops_ahead_for_match_unknown_line_returns_none() -> None:
    """Replacement service / unmatched line → None (card hides chevron)."""
    catalogue = _u1_catalogue()
    assert (
        stops_ahead_for_match(catalogue, "U99", [4111], "Wherever") is None
    )


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
    result = stops_ahead_for_match(
        catalogue, "U1", [4111, 4118], "Leopoldau S+U"
    )
    assert result is not None
    assert result[-1]["name"] == "Leopoldau"


def test_stops_ahead_for_match_returns_empty_at_terminus() -> None:
    """When our RBL IS the terminus, return an empty list (not None)."""
    catalogue = _u1_catalogue()
    # Approach Leopoldau (RBL 4333) as if we're already there.
    result = stops_ahead_for_match(catalogue, "U1", [4333], "Leopoldau")
    assert result == []


def test_stops_ahead_hybrid_truncation_keeps_head_plus_terminus() -> None:
    """When the tail exceeds STOPS_AHEAD_MAX_FULL, truncate to head + … + end."""
    # Build a long line: 8 stops ahead of our position. That's more than
    # STOPS_AHEAD_MAX_FULL (4 + 1 + 1 = 6) so the truncator kicks in.
    stations = {
        i: Station(i, f"Stop{i}", "Wien", 16.0, 48.0, [i])
        for i in range(1, 11)
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
    # 4 head + 1 ellipsis + 1 terminus
    assert len(result) == 6
    assert [s["name"] for s in result[:4]] == ["Stop2", "Stop3", "Stop4", "Stop5"]
    assert result[4].get("is_ellipsis") is True
    assert result[4]["name"] == "…"
    assert result[5]["name"] == "Stop10"
    assert result[5].get("is_terminus") is True


def test_stops_ahead_no_truncation_when_short() -> None:
    """Lists at or below the cap come back fully."""
    catalogue = _u1_catalogue()
    # H pattern from Stephansplatz has 2 stops ahead — no truncation.
    result = stops_ahead_for_match(catalogue, "U1", [4111], "Leopoldau")
    assert result is not None
    assert len(result) == 2
    assert all(not s.get("is_ellipsis") for s in result)


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


async def test_async_load_catalogue_pre_1_4_cache_triggers_refetch(
    hass: HomeAssistant,
) -> None:
    """A cache without trip_patterns forces an inline refetch.

    1.4.0 introduced trip_patterns additively. Without this auto-refresh,
    existing installs would wait up to a week for the periodic refresh
    to populate it; users would see no chevrons until then.
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

    mock_fetch.assert_awaited_once()
    assert result.trip_patterns is not None


async def test_async_load_catalogue_pre_1_4_cache_falls_back_on_network_failure(
    hass: HomeAssistant,
) -> None:
    """If the auto-refetch fails, return the stale cache rather than raising."""
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

    assert result.trip_patterns is None
    assert 60201012 in result.stations_by_diva
