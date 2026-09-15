"""Tests for matching a stop given by name, as `plan_trip` receives it."""

from __future__ import annotations

import pytest

from custom_components.wiener_linien_austria.static import (
    StaticCatalogue,
    Station,
    TripPatternIndex,
)
from custom_components.wiener_linien_austria.stops import (
    MAX_STOP_CANDIDATES,
    match_stops,
    stop_candidate_labels,
)

# Names spelled as the Wiener Linien stop list spells them.
_STOPS: tuple[tuple[int, str, str, int], ...] = (
    (60201349, "Hauptbahnhof", "Wien", 3),
    (60201350, "Hauptbahnhof Süd", "Wien", 1),
    (60201198, "Schönbrunn", "Wien", 2),
    (60201199, "Schönbrunner Allee", "Wien", 1),
    (60200562, "Bhf. Hütteldorf", "Wien", 2),
    (60200563, "Hütteldorfer Straße", "Wien", 1),
    (60201004, "Mitte-Landstraße", "Wien", 4),
    (60201005, "Neue Donau Mitte", "Wien", 1),
    (60200655, "Bösendorfer Str., Karlsplatz", "Wien", 1),
    (60200654, "Karlsplatz", "Wien", 4),
    (60200960, "Oper, Karlsplatz", "Wien", 2),
    (60201181, "Schottenring", "Wien", 4),
    (60201182, "Schottenring", "Wien", 1),
    (60203001, "Hauptplatz", "Schwechat", 1),
    (60203002, "Hauptplatz", "Groß-Enzersdorf", 1),
    (60201040, "Mariahilfer Straße", "Wien", 1),
    (60201041, "Kirchengasse", "Wien", 1),
    (60201042, "Zieglergasse", "Wien", 1),
)
# Only the bigger Schottenring is on a line, so it's the busier of the two.
_SCHOTTENRING_HUB = 60201181
# A stop without platforms can't be planned from, whatever its name.
_NO_PLATFORMS = 60209999


@pytest.fixture
def catalogue() -> StaticCatalogue:
    stations = {
        diva: Station(
            diva=diva,
            name=name,
            municipality=municipality,
            longitude=16.37,
            latitude=48.2,
            rbls=list(range(diva * 10, diva * 10 + platforms)),
        )
        for diva, name, municipality, platforms in _STOPS
    }
    stations[_NO_PLATFORMS] = Station(
        diva=_NO_PLATFORMS,
        name="Leerhaltestelle",
        municipality="Wien",
        longitude=16.37,
        latitude=48.2,
    )
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched="2026-09-15T00:00:00+00:00",
        trip_patterns=TripPatternIndex(
            lines_at_diva={_SCHOTTENRING_HUB: ("U2", "U4")},
        ),
    )


def _names(stations: list[Station]) -> list[str]:
    return [f"{s.name} ({s.municipality})" for s in stations]


@pytest.mark.parametrize(
    ("query", "expected"),
    [
        ("Hauptbahnhof", "Hauptbahnhof"),
        ("60201349", "Hauptbahnhof"),
        (" hauptbahnhof ", "Hauptbahnhof"),
        ("HAUPTBAHNHOF WIEN", "Hauptbahnhof"),
        ("Hauptbahnhof Süd", "Hauptbahnhof Süd"),
        ("Hauptbahnhof Sud", "Hauptbahnhof Süd"),
        ("Schonbrunn", "Schönbrunn"),
        ("Schoenbrunn", "Schönbrunn"),
        ("Hütteldorf", "Bhf. Hütteldorf"),
        ("Bahnhof Hütteldorf", "Bhf. Hütteldorf"),
        ("Hütteldorfer Str.", "Hütteldorfer Straße"),
        ("Wien Mitte", "Mitte-Landstraße"),
        ("Mitte Landstrasse", "Mitte-Landstraße"),
        ("Bösendorferstraße Karlsplatz", "Bösendorfer Str., Karlsplatz"),
        ("Karlsplatz", "Karlsplatz"),
        ("Karlsplats", "Karlsplatz"),
        ("Oper", "Oper, Karlsplatz"),
        ("Mariahilferstrasse", "Mariahilfer Straße"),
        ("Hauptplatz Schwechat", "Hauptplatz"),
    ],
)
def test_a_name_finds_its_stop(
    catalogue: StaticCatalogue, query: str, expected: str
) -> None:
    matches = match_stops(catalogue, query)
    assert [s.name for s in matches] == [expected]


def test_a_repeated_name_in_one_municipality_picks_the_busiest(
    catalogue: StaticCatalogue,
) -> None:
    assert [s.diva for s in match_stops(catalogue, "Schottenring")] == [
        _SCHOTTENRING_HUB
    ]


def test_the_same_name_in_two_municipalities_asks_which(
    catalogue: StaticCatalogue,
) -> None:
    matches = match_stops(catalogue, "Hauptplatz")
    assert sorted(_names(matches)) == [
        "Hauptplatz (Groß-Enzersdorf)",
        "Hauptplatz (Schwechat)",
    ]
    assert stop_candidate_labels(catalogue, matches) in (
        "Hauptplatz (Schwechat), Hauptplatz (Groß-Enzersdorf)",
        "Hauptplatz (Groß-Enzersdorf), Hauptplatz (Schwechat)",
    )


def test_a_vague_name_lists_a_few_stops_busiest_first(
    catalogue: StaticCatalogue,
) -> None:
    matches = match_stops(catalogue, "Wien")
    assert 1 < len(matches) <= MAX_STOP_CANDIDATES
    assert matches[0].diva == _SCHOTTENRING_HUB


@pytest.mark.parametrize(
    "query",
    ["", "   ", "Xyzzy", "Stephansplatz", "60209999", "99999999", "Leerhaltestelle"],
)
def test_no_stop_matches(catalogue: StaticCatalogue, query: str) -> None:
    assert match_stops(catalogue, query) == []
