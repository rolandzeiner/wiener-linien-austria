"""Platforms the open data files under another stop, network-wide (issue #132).

The fixture holds the upstream rows of every affected stop, verbatim.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from functools import cache
from itertools import combinations
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria import async_migrate_entry
from custom_components.wiener_linien_austria.const import (
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_DIVA,
    CONF_ENTRY_TYPE,
    CONF_LINES,
    CONF_ORIGIN_DIVA,
    CONF_ORIGIN_NAME,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
    ENTRY_TYPE_ROUTE,
)
from custom_components.wiener_linien_austria.live import rbls_for_trips
from custom_components.wiener_linien_austria.routing import (
    RouteOptions,
    build_trip_params,
)
from custom_components.wiener_linien_austria.static import (
    StaticCatalogue,
    _catalogue_from_store,
    _catalogue_to_store,
    _merge_haltepunkte,
    _parse_all,
    _parse_haltestellen,
    _parse_trip_patterns,
)
from custom_components.wiener_linien_austria.stop_corrections import (
    LIVE_ALIASES,
    PLANNER_ALIASES,
    STOP_SPLITS,
    StopSplit,
    corrected_diva,
    entry_corrections,
    planner_diva,
)
from custom_components.wiener_linien_austria.stops import (
    match_stops,
    stop_options,
    trackable_station,
)

from .conftest import FIXTURES

FETCHED = "2026-11-22T12:00:00+00:00"
ROWS: dict[str, Any] = json.loads((FIXTURES / "ogd_misfiled_stops.json").read_text())
HALTE, PUNKTE, LINIEN, FAHR = (
    "\n".join(ROWS[name]) + "\n"
    for name in ("haltestellen", "haltepunkte", "linien", "fahrwegverlaeufe")
)
SPLIT_IDS = [f"{split.listed_under}-{split.name}" for split in STOP_SPLITS]
MERGES = [split for split in STOP_SPLITS if split.whole]

ENKPLATZ, GRILLGASSE = 60200425, 60201987
SCHLACHTHAUSGASSE = 60201199
STADTPARK, JOHANNESGASSE = 60201305, 60201972
STOCK_IM_WEG_SECOND, STOCK_IM_WEG = 60201326, 60200401


@cache
def _listed() -> StaticCatalogue:
    """The open data as it is."""
    stations = _parse_haltestellen(HALTE)
    _merge_haltepunkte(stations, PUNKTE)
    patterns = _parse_trip_patterns(LINIEN, FAHR, stations)
    return StaticCatalogue(stations, FETCHED, patterns)


@cache
def _corrected() -> StaticCatalogue:
    parsed = _parse_all(HALTE, PUNKTE, LINIEN, FAHR, None)
    return StaticCatalogue(parsed.stations, FETCHED, parsed.trip_patterns)


@cache
def _calls() -> frozenset[tuple[int, str, str]]:
    """(platform, line, direction) of every call in the route data."""
    patterns = _listed().trip_patterns
    assert patterns is not None
    return frozenset(
        (rbl, patterns.label_for_line[line_id], "H" if route.direction == 1 else "R")
        for line_id, routes in patterns.patterns_by_line.items()
        if line_id in patterns.label_for_line
        for route in routes
        for rbl in route.stops
    )


def _lines_at(rbls: list[int] | tuple[int, ...]) -> set[str]:
    return {line for rbl, line, _ in _calls() if rbl in rbls}


# --- The table against the rows it corrects -------------------------


@pytest.mark.parametrize("split", STOP_SPLITS, ids=SPLIT_IDS)
def test_split_describes_the_platforms_it_moves(split: StopSplit) -> None:
    source = _listed().stations_by_diva[split.listed_under]
    staying = [rbl for rbl in source.rbls if rbl not in split.rbls]

    assert set(split.rbls) <= set(source.rbls)
    assert split.whole is (not staying)
    if not split.whole:
        assert _lines_at(split.rbls) <= split.lines
        assert _lines_at(split.rbls) & _lines_at(staying) <= split.shared
        assert split.shared <= split.lines


@pytest.mark.parametrize("split", MERGES, ids=lambda split: split.name)
def test_merge_lists_no_vehicle_twice(split: StopSplit) -> None:
    """Two platforms on one route would be two calls of the same vehicle."""
    patterns = _listed().trip_patterns
    joined = _listed().stations_by_diva.get(split.diva)
    assert patterns is not None
    if joined is None:
        return
    for routes in patterns.patterns_by_line.values():
        for route in routes:
            stops = set(route.stops)
            assert not (stops & set(split.rbls) and stops & set(joined.rbls))


def test_corrections_dont_chain() -> None:
    moved = [rbl for split in STOP_SPLITS for rbl in split.rbls]
    assert len(moved) == len(set(moved))
    assert not {s.diva for s in STOP_SPLITS} & {s.listed_under for s in STOP_SPLITS}


@pytest.mark.parametrize("split", STOP_SPLITS, ids=SPLIT_IDS)
def test_platforms_move_to_their_own_stop(split: StopSplit) -> None:
    catalogue = _corrected()
    station = catalogue.stations_by_diva[split.diva]

    assert station.name == split.name
    assert set(split.rbls) <= set(station.rbls)
    assert not set(split.rbls) & set(
        catalogue.stations_by_diva[split.listed_under].rbls
    )
    assert split.diva in [stop.diva for stop in catalogue.search(split.name)]
    assert split.diva in [stop.diva for stop in match_stops(catalogue, split.name)]
    assert (station.longitude, station.latitude) == (split.longitude, split.latitude)
    for rbl in split.rbls:
        assert corrected_diva(rbl, str(split.listed_under)) == str(split.diva)


def test_cache_from_before_matches_a_fresh_download() -> None:
    cached = _catalogue_from_store(_catalogue_to_store(_listed()))
    fresh = _corrected()

    assert cached.stations_by_diva == fresh.stations_by_diva
    assert cached.trip_patterns is not None
    assert fresh.trip_patterns is not None
    assert cached.trip_patterns.lines_at_diva == fresh.trip_patterns.lines_at_diva


def test_corrected_cache_loads_unchanged() -> None:
    stored = _catalogue_to_store(_corrected())
    assert _catalogue_to_store(_catalogue_from_store(stored)) == stored


@pytest.mark.parametrize("split", MERGES, ids=lambda split: split.name)
def test_merged_stop_is_one_stop(split: StopSplit) -> None:
    catalogue = _corrected()
    options = {option["value"] for option in stop_options(catalogue, 0, 0, "de")}

    assert str(split.diva) in options
    assert str(split.listed_under) not in options
    # Free text shortlists it once, and a saved ID still resolves.
    found = [stop.diva for stop in catalogue.search(split.name)]
    assert split.listed_under not in found
    resolved = trackable_station(catalogue, split.listed_under)
    assert resolved is not None
    assert resolved.diva == split.diva


@pytest.mark.parametrize("split", MERGES, ids=lambda split: split.name)
def test_planner_is_asked_with_the_id_it_knows(split: StopSplit) -> None:
    old, new = split.listed_under, str(split.diva)
    when = datetime(2026, 11, 24, 10, tzinfo=UTC)
    start = dict(build_trip_params(RouteOptions.from_config(old, 1, {}), when))
    end = dict(build_trip_params(RouteOptions.from_config(1, old, {}), when))

    assert start["name_origin"] == new
    assert end["name_destination"] == new


def test_planner_gets_other_stops_unchanged() -> None:
    assert planner_diva(60201468) == 60201468


# --- Stops the planner counts as part of another --------------------


@pytest.mark.parametrize(("listed", "planned"), PLANNER_ALIASES.items())
def test_alias_stays_a_stop_and_is_planned_as_the_bigger_one(
    listed: int, planned: int
) -> None:
    catalogue = _corrected()
    station = catalogue.stations_by_diva[listed]
    when = datetime(2026, 11, 24, 10, tzinfo=UTC)
    start = dict(build_trip_params(RouteOptions.from_config(listed, 1, {}), when))
    end = dict(build_trip_params(RouteOptions.from_config(1, listed, {}), when))

    assert start["name_origin"] == end["name_destination"] == str(planned)
    assert trackable_station(catalogue, listed) is station
    assert station.rbls == _listed().stations_by_diva[listed].rbls
    assert planned in catalogue.stations_by_diva


@pytest.mark.parametrize(("listed", "planned"), PLANNER_ALIASES.items())
def test_only_a_live_alias_joins_on_the_planners_id(listed: int, planned: int) -> None:
    rbl = _listed().stations_by_diva[listed].rbls[0]
    expected = planned if listed in LIVE_ALIASES else listed
    assert corrected_diva(rbl, str(listed)) == str(expected)


@pytest.mark.parametrize(
    ("stop_id", "line", "rbls"),
    [
        pytest.param(str(ENKPLATZ), "11", {2584}, id="Gottschalkgasse's platform"),
        pytest.param(str(ENKPLATZ), "76A", {2606}, id="Enkplatz's own"),
        pytest.param(None, "11", set(), id="no stop"),
        pytest.param("1", "11", set(), id="unknown stop"),
    ],
)
def test_live_times_at_enkplatz_come_from_the_platform_boarded(
    stop_id: str | None, line: str, rbls: set[int]
) -> None:
    now = datetime(2026, 11, 24, 10, tzinfo=UTC)
    leg = MagicMock(walk=False, wiener_linien=True, line=line)
    leg.origin.planned, leg.origin.stop_id = now, stop_id

    assert rbls_for_trips(_corrected(), [MagicMock(legs=[leg])], now) == rbls


# --- Saved entries --------------------------------------------------


@pytest.mark.parametrize("split", STOP_SPLITS, ids=SPLIT_IDS)
@pytest.mark.parametrize("taken", [False, True], ids=["free", "taken"])
def test_no_saved_board_loses_a_departure(split: StopSplit, taken: bool) -> None:
    """Every possible line selection at every affected stop."""
    source = _listed().stations_by_diva[split.listed_under]
    here = {call for call in _calls() if call[0] in source.rbls}
    lines = sorted({line for _, line, _ in here})
    hass = MagicMock()
    hass.config_entries.async_entry_for_domain_unique_id.return_value = (
        MagicMock() if taken else None
    )
    for size in range(len(lines) + 1):
        for chosen in combinations(lines, size):
            entry = MagicMock(
                title=source.name,
                options={},
                data={
                    CONF_DIVA: source.diva,
                    CONF_STOP_NAME: source.name,
                    CONF_RBLS: list(source.rbls),
                    CONF_LINES: [f"{line}|{way}" for line in chosen for way in "HR"],
                },
            )
            changes = entry_corrections(hass, entry)
            kept = changes.get("data", entry.data)[CONF_RBLS]
            # No selection tracks every line.
            before = {call for call in here if not chosen or call[1] in chosen}
            assert all(rbl in kept for rbl, _, _ in before), chosen
            if taken:
                assert "unique_id" not in changes


def _board(
    hass: HomeAssistant, diva: int, lines: list[str], title: str | None = None
) -> MockConfigEntry:
    station = _listed().stations_by_diva[diva]
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        minor_version=1,
        title=title or station.name,
        unique_id=f"diva_{diva}",
        data={
            CONF_DIVA: diva,
            CONF_STOP_NAME: station.name,
            CONF_RBLS: list(station.rbls),
            CONF_LINES: lines,
        },
    )
    entry.add_to_hass(hass)
    return entry


@pytest.mark.parametrize(
    ("diva", "lines", "new_diva", "name"),
    [
        pytest.param(
            ENKPLATZ, ["71|H", "11|R"], GRILLGASSE, "Enkplatz, Grillgasse", id="tram"
        ),
        pytest.param(ENKPLATZ, ["76A|H"], ENKPLATZ, "Enkplatz", id="bus at both"),
        pytest.param(ENKPLATZ, ["U3|H", "71|H"], ENKPLATZ, "Enkplatz", id="mixed"),
        pytest.param(ENKPLATZ, [], ENKPLATZ, "Enkplatz", id="every line"),
        pytest.param(
            STADTPARK, ["N75|H"], JOHANNESGASSE, "Johannesgasse", id="night bus"
        ),
        pytest.param(
            SCHLACHTHAUSGASSE,
            ["N75|H"],
            SCHLACHTHAUSGASSE,
            "Schlachthausgasse",
            id="night bus at both",
        ),
        pytest.param(60200228, [], 60201975, "Deutschstraße", id="merged, every line"),
        pytest.param(
            STOCK_IM_WEG_SECOND, ["53A|R"], STOCK_IM_WEG, "Stock im Weg", id="half"
        ),
    ],
)
async def test_board_ends_up_at_the_stop_it_means(
    hass: HomeAssistant, diva: int, lines: list[str], new_diva: int, name: str
) -> None:
    entry = _board(hass, diva, lines)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.unique_id == f"diva_{new_diva}"
    assert entry.data[CONF_DIVA] == new_diva
    assert entry.data[CONF_STOP_NAME] == name
    assert entry.title == name


async def test_board_without_the_moved_lines_gives_their_platforms_up(
    hass: HomeAssistant,
) -> None:
    entry = _board(hass, ENKPLATZ, ["U3|H"])

    assert await async_migrate_entry(hass, entry) is True
    assert entry.data[CONF_RBLS] == _corrected().stations_by_diva[ENKPLATZ].rbls


async def test_moved_board_keeps_a_title_the_user_chose(hass: HomeAssistant) -> None:
    entry = _board(hass, ENKPLATZ, ["71|H"], title="Bim")

    assert await async_migrate_entry(hass, entry) is True
    assert entry.title == "Bim"
    assert entry.data[CONF_STOP_NAME] == "Enkplatz, Grillgasse"


@pytest.mark.parametrize("target_first", [True, False])
async def test_both_halves_set_up_stay_two_boards(
    hass: HomeAssistant, target_first: bool
) -> None:
    half = _board(hass, STOCK_IM_WEG_SECOND, ["53A|R"])
    stop = _board(hass, STOCK_IM_WEG, ["54B|R"])
    for entry in (stop, half) if target_first else (half, stop):
        assert await async_migrate_entry(hass, entry) is True

    assert half.unique_id == f"diva_{STOCK_IM_WEG_SECOND}"
    assert half.data[CONF_RBLS] == [8965]
    assert stop.unique_id == f"diva_{STOCK_IM_WEG}"
    assert 8965 in stop.data[CONF_RBLS]


async def test_merged_board_left_in_place_can_be_reconfigured(
    hass: HomeAssistant,
) -> None:
    half = _board(hass, STOCK_IM_WEG_SECOND, ["53A|R"])
    _board(hass, STOCK_IM_WEG, ["54B|R"])
    assert await async_migrate_entry(hass, half) is True
    flow = "custom_components.wiener_linien_austria.config_flow"

    with (
        patch(f"{flow}.async_get_catalogue", AsyncMock(return_value=_corrected())),
        patch(f"{flow}._probe_monitor_lines", AsyncMock(return_value=[])),
        patch(f"{flow}.async_probe_picker_rows", AsyncMock(return_value=[])),
    ):
        result: dict[str, Any] = await hass.config_entries.flow.async_init(
            DOMAIN,
            context={
                "source": config_entries.SOURCE_RECONFIGURE,
                "entry_id": half.entry_id,
            },
        )

    assert result["step_id"] == "select_lines"
    field = next(
        value
        for key, value in result["data_schema"].schema.items()
        if key == CONF_LINES
    )
    offered = {option["value"] for option in field.config["options"]}
    assert "53A|R" in offered


async def test_route_from_a_merged_stop_takes_its_name(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        minor_version=1,
        title="Linzer Straße, Flötzersteig → Westbahnhof",
        data={
            CONF_ENTRY_TYPE: ENTRY_TYPE_ROUTE,
            CONF_ORIGIN_DIVA: 60201789,
            CONF_ORIGIN_NAME: "Linzer Straße, Flötzersteig",
            CONF_DESTINATION_DIVA: 60201468,
            CONF_DESTINATION_NAME: "Westbahnhof",
        },
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.title == "Bahnhofstraße → Westbahnhof"
    assert entry.data[CONF_ORIGIN_DIVA] == 60201789


async def test_route_without_a_stop_id_is_left_alone(hass: HomeAssistant) -> None:
    data = {CONF_ENTRY_TYPE: ENTRY_TYPE_ROUTE, CONF_ORIGIN_NAME: "Stadtpark"}
    entry = MockConfigEntry(
        domain=DOMAIN, version=2, minor_version=1, title="Route", data=data
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert dict(entry.data) == data
