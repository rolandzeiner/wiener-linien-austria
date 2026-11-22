"""Stops the open data files under another stop's name or ID (issue #132)."""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria import async_migrate_entry
from custom_components.wiener_linien_austria.config_flow import (
    _static_lines_for_station,
)
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
from custom_components.wiener_linien_austria.live import parse_monitor_rows
from custom_components.wiener_linien_austria.static import (
    StaticCatalogue,
    _catalogue_from_store,
    _catalogue_to_store,
    _merge_haltepunkte,
    _parse_all,
    _parse_haltestellen,
    _parse_trip_patterns,
    stops_ahead_for_match,
)
from custom_components.wiener_linien_austria.stops import match_stops, stop_options

MAURER_LANGE_GASSE = 60200855
VALENTINGASSE = 60201936

# The upstream rows as served on 2026-11-22.
HALTESTELLEN = (
    "DIVA;PlatformText;Municipality;MunicipalityID;Longitude;Latitude\n"
    "60200852;Maurer Berg;Wien;49000001;16.2622735;48.1445225\n"
    "60200854;Maurer Hauptplatz;Wien;49000001;16.2688401;48.1505522\n"
    "60200855;Valentingasse;Wien;49000001;16.2681844;48.1474715\n"
)
HALTEPUNKTE = (
    "StopID;DIVA;StopText;Municipality;MunicipalityID;Longitude;Latitude\n"
    "1620;60200854;Maurer Hauptplatz;Wien;49000001;16.2686335;48.1498869\n"
    "1621;60200855;Maurer Lange Gasse;Wien;49000001;16.2681215;48.1474355\n"
    "1628;60200855;Maurer Lange Gasse;Wien;49000001;16.2682293;48.1474355\n"
    "1629;60200854;Maurer Hauptplatz;Wien;49000001;16.2691545;48.1510976\n"
    "1641;60200852;Maurer Berg;Wien;49000001;16.2619860;48.1445825\n"
    "1676;60200852;Maurer Berg;Wien;49000001;16.2621567;48.1442528\n"
    "3862;60200855;Valentingasse;Wien;49000001;16.2629113;48.1481728\n"
    "3863;60200855;Valentingasse;Wien;49000001;16.2629113;48.1480709\n"
)
LINIEN = (
    "LineID;LineText;SortingHelp;Realtime;MeansOfTransport\n"
    "160;60;160;1;ptTram\n"
    "560;N60;760;1;ptBusNight\n"
)
# The platforms are real, the routes are cut to the stops above.
FAHRWEGVERLAEUFE = (
    "LineID;PatternID;StopSeqCount;StopID;Direction\n"
    "160;1;0;1620;1\n160;1;1;1621;1\n160;1;2;1641;1\n"
    "160;2;0;1676;2\n160;2;1;1628;2\n160;2;2;1629;2\n"
    "560;19;0;1620;1\n560;19;1;3862;1\n560;19;2;1641;1\n"
    "560;20;0;1676;2\n560;20;1;3863;2\n560;20;2;1629;2\n"
)
FETCHED = "2026-11-22T12:00:00+00:00"


def _catalogue() -> StaticCatalogue:
    parsed = _parse_all(HALTESTELLEN, HALTEPUNKTE, LINIEN, FAHRWEGVERLAEUFE, None)
    return StaticCatalogue(parsed.stations, FETCHED, parsed.trip_patterns)


def _uncorrected_catalogue() -> StaticCatalogue:
    """What a version before the fix built, and left in the cache."""
    stations = _parse_haltestellen(HALTESTELLEN)
    _merge_haltepunkte(stations, HALTEPUNKTE)
    patterns = _parse_trip_patterns(LINIEN, FAHRWEGVERLAEUFE, stations)
    return StaticCatalogue(stations, FETCHED, patterns)


def _assert_corrected(catalogue: StaticCatalogue) -> None:
    tram = catalogue.stations_by_diva[MAURER_LANGE_GASSE]
    bus = catalogue.stations_by_diva[VALENTINGASSE]
    assert (tram.name, tram.rbls) == ("Maurer Lange Gasse", [1621, 1628])
    assert (bus.name, bus.rbls) == ("Valentingasse", [3862, 3863])
    assert bus.municipality == "Wien"
    assert catalogue.trip_patterns is not None
    assert catalogue.trip_patterns.lines_at_diva[MAURER_LANGE_GASSE] == ("60",)
    assert catalogue.trip_patterns.lines_at_diva[VALENTINGASSE] == ("N60",)


def test_fresh_download_is_corrected() -> None:
    _assert_corrected(_catalogue())


def test_cache_from_before_the_fix_is_corrected_without_a_download() -> None:
    _assert_corrected(
        _catalogue_from_store(_catalogue_to_store(_uncorrected_catalogue()))
    )


def test_corrected_cache_loads_unchanged() -> None:
    stored = _catalogue_to_store(_catalogue())
    assert _catalogue_to_store(_catalogue_from_store(stored)) == stored


def test_cache_without_trip_patterns_is_corrected() -> None:
    stored = _catalogue_to_store(_uncorrected_catalogue())
    del stored["trip_patterns"]
    catalogue = _catalogue_from_store(stored)
    assert catalogue.stations_by_diva[VALENTINGASSE].rbls == [3862, 3863]


def test_corrections_step_aside_once_upstream_fixes_its_list() -> None:
    halte = (
        HALTESTELLEN.replace(
            "60200855;Valentingasse", "60200855;Maurer Lange Gasse (neu)"
        )
        + "60201936;Valentingasse (neu);Wien;49000001;16.2630000;48.1481000\n"
    )
    punkte = HALTEPUNKTE.replace("3862;60200855", "3862;60201936").replace(
        "3863;60200855", "3863;60201936"
    )
    stations = _parse_all(halte, punkte, None, None, None).stations
    assert stations[MAURER_LANGE_GASSE].name == "Maurer Lange Gasse (neu)"
    assert stations[VALENTINGASSE].name == "Valentingasse (neu)"
    assert stations[VALENTINGASSE].rbls == [3862, 3863]


@pytest.mark.parametrize(
    ("query", "diva"),
    [
        ("Maurer Lange Gasse", MAURER_LANGE_GASSE),
        ("Valentingasse", VALENTINGASSE),
    ],
)
def test_each_stop_is_found_by_its_own_name(query: str, diva: int) -> None:
    catalogue = _catalogue()
    assert [stop.diva for stop in catalogue.search(query)] == [diva]
    assert [stop.diva for stop in match_stops(catalogue, query)] == [diva]
    labels = {o["value"]: o["label"] for o in stop_options(catalogue, 0, 0, "de")}
    assert labels[str(diva)] == f"{query} (Wien)"


@pytest.mark.parametrize(
    ("diva", "keys"),
    [
        (MAURER_LANGE_GASSE, {"60|H", "60|R"}),
        (VALENTINGASSE, {"N60|H", "N60|R"}),
    ],
)
def test_each_stop_offers_its_own_lines(diva: int, keys: set[str]) -> None:
    catalogue = _catalogue()
    rows = _static_lines_for_station(catalogue, catalogue.stations_by_diva[diva])
    assert {row["key"] for row in rows} == keys


@pytest.mark.parametrize(
    ("line", "name"), [("60", "Maurer Lange Gasse"), ("N60", "Valentingasse")]
)
def test_trail_names_the_stop_the_line_calls_at(line: str, name: str) -> None:
    trail = stops_ahead_for_match(_catalogue(), line, [1620], "Maurer Berg", "H")
    assert trail is not None
    assert [stop["name"] for stop in trail] == [name, "Maurer Berg"]


@pytest.mark.parametrize(
    ("rbl", "diva"), [(1621, MAURER_LANGE_GASSE), (3862, VALENTINGASSE)]
)
def test_live_rows_carry_the_trip_planners_stop_id(rbl: int, diva: int) -> None:
    """The planner boards N60 at 60201936; live times join on that ID."""
    body = {
        "data": {
            "monitors": [
                {
                    "locationStop": {
                        "properties": {
                            "name": str(MAURER_LANGE_GASSE),
                            "attributes": {"rbl": rbl},
                        }
                    },
                    "lines": [
                        {
                            "name": "60",
                            "direction": "H",
                            "towards": "Rodaun",
                            "departures": {
                                "departure": [
                                    {
                                        "departureTime": {
                                            "timePlanned": "2026-11-22T19:30:00+01:00"
                                        }
                                    }
                                ]
                            },
                        }
                    ],
                }
            ]
        }
    }
    assert parse_monitor_rows(body)[rbl][0].diva == str(diva)


# --- Entries saved before the fix -----------------------------------


def _board(
    hass: HomeAssistant,
    lines: list[str],
    *,
    title: str = "Valentingasse",
    version: int = 2,
) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=version,
        minor_version=1,
        title=title,
        unique_id=f"diva_{MAURER_LANGE_GASSE}",
        data={
            CONF_DIVA: MAURER_LANGE_GASSE,
            CONF_STOP_NAME: "Valentingasse",
            CONF_RBLS: [1621, 1628, 3862, 3863],
            CONF_LINES: lines,
            CONF_SCAN_INTERVAL: 60,
        },
    )
    entry.add_to_hass(hass)
    return entry


@pytest.mark.parametrize(
    ("lines", "diva", "name", "rbls"),
    [
        pytest.param(
            ["60|H", "60|R"],
            MAURER_LANGE_GASSE,
            "Maurer Lange Gasse",
            [1621, 1628],
            id="tram only",
        ),
        pytest.param(
            ["N60|H"],
            VALENTINGASSE,
            "Valentingasse",
            [3862, 3863],
            id="night bus only",
        ),
        pytest.param(
            ["60|R", "N60|R"],
            MAURER_LANGE_GASSE,
            "Maurer Lange Gasse",
            [1621, 1628, 3862, 3863],
            id="both keep their departures",
        ),
        pytest.param(
            [],
            MAURER_LANGE_GASSE,
            "Maurer Lange Gasse",
            [1621, 1628, 3862, 3863],
            id="all lines keep their departures",
        ),
    ],
)
async def test_saved_board_is_migrated(
    hass: HomeAssistant, lines: list[str], diva: int, name: str, rbls: list[int]
) -> None:
    entry = _board(hass, lines)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.minor_version == 2
    assert entry.unique_id == f"diva_{diva}"
    assert entry.title == name
    assert entry.data[CONF_DIVA] == diva
    assert entry.data[CONF_STOP_NAME] == name
    assert entry.data[CONF_RBLS] == rbls
    assert entry.data[CONF_LINES] == lines


async def test_migration_keeps_a_title_the_user_chose(hass: HomeAssistant) -> None:
    entry = _board(hass, ["60|R"], title="Bim ins Büro")

    assert await async_migrate_entry(hass, entry) is True
    assert entry.title == "Bim ins Büro"
    assert entry.data[CONF_STOP_NAME] == "Maurer Lange Gasse"


async def test_v1_board_gets_both_migrations(hass: HomeAssistant) -> None:
    entry = _board(hass, ["60|R|Westbahnhof"], version=1)

    assert await async_migrate_entry(hass, entry) is True
    assert (entry.version, entry.minor_version) == (2, 2)
    assert entry.data[CONF_LINES] == ["60|R"]
    assert entry.data[CONF_RBLS] == [1621, 1628]


async def test_night_board_stays_put_when_its_stop_is_already_set_up(
    hass: HomeAssistant,
) -> None:
    MockConfigEntry(
        domain=DOMAIN, unique_id=f"diva_{VALENTINGASSE}", data={}
    ).add_to_hass(hass)
    entry = _board(hass, ["N60|H"])

    assert await async_migrate_entry(hass, entry) is True
    assert entry.unique_id == f"diva_{MAURER_LANGE_GASSE}"
    assert entry.data[CONF_RBLS] == [1621, 1628, 3862, 3863]


@pytest.mark.parametrize(
    ("title", "migrated_title"),
    [
        ("Valentingasse → Westbahnhof", "Maurer Lange Gasse → Westbahnhof"),
        ("In die Arbeit", "In die Arbeit"),
    ],
)
async def test_saved_route_is_renamed(
    hass: HomeAssistant, title: str, migrated_title: str
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        minor_version=1,
        title=title,
        data={
            CONF_ENTRY_TYPE: ENTRY_TYPE_ROUTE,
            CONF_ORIGIN_DIVA: MAURER_LANGE_GASSE,
            CONF_ORIGIN_NAME: "Valentingasse",
            CONF_DESTINATION_DIVA: 60201468,
            CONF_DESTINATION_NAME: "Westbahnhof",
        },
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.data[CONF_ORIGIN_NAME] == "Maurer Lange Gasse"
    assert entry.data[CONF_DESTINATION_NAME] == "Westbahnhof"
    assert entry.title == migrated_title


async def test_reconfigure_keeps_a_night_line_the_board_tracks(
    hass: HomeAssistant,
) -> None:
    """A selected line missing from the options would be dropped on save."""
    entry = _board(hass, ["60|R", "N60|R"])
    assert await async_migrate_entry(hass, entry) is True
    flow = "custom_components.wiener_linien_austria.config_flow"

    with (
        patch(f"{flow}.async_get_catalogue", AsyncMock(return_value=_catalogue())),
        patch(f"{flow}._probe_monitor_lines", AsyncMock(return_value=[])),
        patch(f"{flow}.async_probe_picker_rows", AsyncMock(return_value=[])),
    ):
        result: dict[str, Any] = await hass.config_entries.flow.async_init(
            DOMAIN,
            context={
                "source": config_entries.SOURCE_RECONFIGURE,
                "entry_id": entry.entry_id,
            },
        )
        field = next(
            value
            for key, value in result["data_schema"].schema.items()
            if key == CONF_LINES
        )
        offered = {option["value"] for option in field.config["options"]}
        assert offered == {"60|H", "60|R", "N60|H", "N60|R"}

        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_LINES: ["60|R", "N60|R"], CONF_SCAN_INTERVAL: 60},
        )

    assert result["reason"] == "reconfigure_successful"
    assert entry.data[CONF_STOP_NAME] == "Maurer Lange Gasse"
    assert entry.data[CONF_RBLS] == [1621, 1628, 3862, 3863]


@pytest.mark.parametrize(
    "data",
    [
        pytest.param(
            {CONF_DIVA: 60201012, CONF_STOP_NAME: "Stephansplatz"}, id="other board"
        ),
        pytest.param({CONF_STOP_NAME: "Valentingasse"}, id="board without its DIVA"),
        pytest.param(
            {
                CONF_ENTRY_TYPE: ENTRY_TYPE_ROUTE,
                CONF_ORIGIN_DIVA: 60201468,
                CONF_ORIGIN_NAME: "Westbahnhof",
            },
            id="other route",
        ),
    ],
)
async def test_other_entries_only_get_the_version(
    hass: HomeAssistant, data: dict[str, Any]
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN, version=2, minor_version=1, title="Valentingasse", data=data
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.minor_version == 2
    assert (entry.title, dict(entry.data)) == ("Valentingasse", data)
