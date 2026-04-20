"""Tests for the Wiener Linien Austria static catalogue layer."""
from __future__ import annotations

from custom_components.wiener_linien_austria.static import (
    Station,
    StaticCatalogue,
    _catalogue_from_store,
    _catalogue_to_store,
    _merge_haltepunkte,
    _parse_haltestellen,
)

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
