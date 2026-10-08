"""Tests for the scheduled run times behind the cards' estimated arrivals."""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Generator
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, patch
from zoneinfo import ZoneInfo

import aiohttp
import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.wiener_linien_austria.const import (
    ATTRIBUTION,
    CONF_DIVA,
    CONF_LINES,
    DOMAIN,
    ROUTING_DEPARTURE_ENDPOINT,
    RUN_TIME_DEPARTURES_REQUESTED,
    RUN_TIME_MAX_AGE,
    RUN_TIME_TOP_UP_AFTER,
    TIMETABLE_RETRY_AFTER,
    USER_AGENT,
)
from custom_components.wiener_linien_austria.routing import RoutingError
from custom_components.wiener_linien_austria.run_times import (
    REGIME_DAY,
    REGIME_NIGHT,
    RUN_TIMES_KEY,
    STORE_KEY,
    STORE_VERSION,
    RunTimes,
    async_get_run_times,
    regime_at,
    regime_ends,
)
from custom_components.wiener_linien_austria.static import StaticCatalogue, Station
from custom_components.wiener_linien_austria.timetable import (
    build_departure_params,
    parse_departure_body,
    parse_run_times,
)

from .conftest import async_setup_entry_and_wait, make_entry, route_entry

VIENNA = ZoneInfo("Europe/Vienna")
PRATERSTERN = 60201040
MEIDLING = 60201015
VORGARTENSTRASSE = 60201433
LEOPOLDAU = 60200769
WESTBAHNHOF = 60201468
KRIEAU = 60201893
FIXTURES = Path(__file__).parent / "fixtures"

# The capture: 30 departures at Praterstern from 12:19 on Thursday 2026-10-08.
DAY = datetime(2026, 10, 8, 12, 30, tzinfo=VIENNA)
NIGHT = datetime(2026, 10, 8, 21, 0, tzinfo=VIENNA)

_MODULE = "custom_components.wiener_linien_austria.run_times"
_FETCH = f"{_MODULE}.async_fetch_trip_body"


def _captured() -> dict[str, Any]:
    body: dict[str, Any] = json.loads(
        (FIXTURES / "run_times_praterstern.json").read_text(encoding="utf-8")
    )
    return body


def _point(stop_id: str, minute: int, key: str = "arrDateTime") -> dict[str, Any]:
    return {
        "name": "Wien Stop",
        "ref": {"id": stop_id, key: f"20261008 12:{minute:02d}"},
    }


def _run(
    line: str, direction: str | None, points: Any, *, minute: int = 0
) -> dict[str, Any]:
    """One vehicle leaving at 12:`minute`, calling at `points`."""
    return {
        "stopID": str(PRATERSTERN),
        "dateTime": {
            "year": "2026",
            "month": "10",
            "day": "8",
            "hour": "12",
            "minute": str(minute),
        },
        "servingLine": {"number": line, "liErgRiProj": {"direction": direction}},
        "onwardStopSeq": points,
    }


def _body(*runs: dict[str, Any]) -> dict[str, Any]:
    return {"departureList": list(runs)}


@pytest.fixture(autouse=True)
def storage(hass_storage: dict[str, Any]) -> dict[str, Any]:
    """Keep every Store write in memory."""
    return hass_storage


@pytest.fixture
def board(hass: HomeAssistant) -> MockConfigEntry:
    """A departure board at Praterstern, which is what keeps its samples."""
    entry = make_entry({CONF_DIVA: PRATERSTERN})
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
def dm_fetch() -> Generator[AsyncMock]:
    """The departure-monitor request, answering with the capture."""
    with patch(_FETCH, new_callable=AsyncMock, return_value=_captured()) as mock:
        yield mock


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


def test_one_answer_holds_every_line_and_direction_at_the_stop() -> None:
    pairs = parse_run_times(_captured(), VIENNA)

    assert set(pairs) == {
        ("U1", "H"),
        ("U1", "R"),
        ("U2", "H"),
        ("U2", "R"),
        ("5", "H"),
        ("O", "H"),
        ("O", "R"),
        ("5B", "R"),
        ("80A", "H"),
        ("82A", "H"),
    }
    u1 = pairs[("U1", "H")]
    assert len(u1) == 10
    assert u1[VORGARTENSTRASSE] == 1
    # Five runs say 14, 14, 15, 15, 14. The server cuts the seconds off both
    # ends, so the timetable's own figure lies between the two.
    assert u1[LEOPOLDAU] == 14.4
    tram = pairs[("5", "H")]
    assert len(tram) == 22
    assert tram[WESTBAHNHOF] == 38
    # Short runs to Alaudagasse and full ones to Oberlaa share the pair, so
    # the trail reaches the last stop any of them serves.
    assert len(pairs[("U1", "R")]) == 13


def test_runs_are_averaged_because_the_server_cuts_the_seconds_off() -> None:
    """Half a minute is the difference between the right minute and the next."""
    # Nestroyplatz 1, 2, 1, 2 and Schwedenplatz 2, 3, 2, 3 across four runs:
    # a whole number would be half a minute out for every one of them.
    u1 = parse_run_times(_captured(), VIENNA)[("U1", "R")]
    assert (u1[60200916], u1[60201198]) == (1.5, 2.5)
    for stops in parse_run_times(_captured(), VIENNA).values():
        minutes = list(stops.values())
        assert minutes == sorted(minutes)


def test_a_vehicle_on_another_stopping_pattern_does_not_drag_the_average() -> None:
    rows = [_run("13A", "H", [_point("1", m)]) for m in (5, 5, 6, 20)]
    assert parse_run_times(_body(*rows), VIENNA) == {("13A", "H"): {1: 5.3}}
    # Two runs that far apart have no typical value; neither is thrown away.
    rows = [_run("13A", "H", [_point("1", m)]) for m in (5, 20)]
    assert parse_run_times(_body(*rows), VIENNA) == {("13A", "H"): {1: 12.5}}


def test_badner_bahn_gets_the_label_the_boards_use() -> None:
    pairs = parse_run_times(_body(_run("BB", "R", [_point("60200980", 2)])), VIENNA)
    assert pairs == {("WLB", "R"): {60200980: 2}}


def test_a_single_onward_stop_and_a_single_row_arrive_unwrapped() -> None:
    """EFA collapses one-element lists, at both levels."""
    row = _run("59A", "R", _point("60200980", 1))
    assert parse_run_times({"departureList": {"departure": row}}, VIENNA) == {
        ("59A", "R"): {60200980: 1}
    }


def test_a_stop_passed_twice_counts_at_its_first_call() -> None:
    row = _run("5B", "R", [_point("1", 3), _point("2", 5), _point("1", 9)])
    assert parse_run_times(_body(row), VIENNA) == {("5B", "R"): {1: 3, 2: 5}}


def test_departure_time_stands_in_for_a_missing_arrival() -> None:
    row = _run("O", "H", [_point("1", 4, key="depDateTime")], minute=1)
    assert parse_run_times(_body(row), VIENNA) == {("O", "H"): {1: 3}}


def test_unusable_rows_and_points_are_skipped() -> None:
    undated = _run("U1", "H", [_point("1", 2)])
    undated["dateTime"] = {"year": "2026"}
    body = _body(
        "garbage",
        _run("", "H", [_point("1", 2)]),
        _run("U1", None, [_point("1", 2)]),
        undated,
        {**_run("U1", "H", [_point("1", 2)]), "dateTime": "soon"},
        # Nothing usable on this run: no id, no time, and a time before it left.
        _run(
            "13A",
            "H",
            [
                {"name": "Wien Stop", "ref": {"arrDateTime": "20261008 12:05"}},
                {"name": "Wien Stop", "ref": {"id": "7"}},
                {"name": "Wien Stop", "ref": {"id": "8", "arrDateTime": "soon"}},
                _point("9", 0),
            ],
            minute=4,
        ),
        _run("U2", "H", [_point("1", 2)]),
    )
    assert parse_run_times(body, VIENNA) == {("U2", "H"): {1: 2}}
    assert parse_run_times({"departureList": "none"}, VIENNA) == {}
    assert parse_run_times({}, VIENNA) == {}


def test_s_bahn_rows_carry_minutes_to_their_stops() -> None:
    """The board's own timetable rows, which the run-time request leaves out."""
    body = json.loads(
        (FIXTURES / "timetable_meidling_stops.json").read_text(encoding="utf-8")
    )
    s80, s2, _s60 = parse_departure_body(body, MEIDLING, VIENNA)
    assert [(stop.name, stop.minutes) for stop in s80.stops[:3]] == [
        ("Hetzendorf", 3),
        ("Atzgersdorf", 6),
        ("Liesing", 8),
    ]
    assert (s80.stops[-1].name, s80.stops[-1].minutes) == ("Leobersdorf", 52)
    assert [(stop.name, stop.minutes) for stop in s2.stops] == [("Hauptbahnhof", 5)]


def test_request_can_ask_for_other_modes_than_the_s_bahn() -> None:
    excluded = ("0", "1")
    params = build_departure_params(PRATERSTERN, 60, excluded_mots=excluded)
    assert [name for name, _ in params if name.startswith("exclMOT_")] == [
        "exclMOT_0",
        "exclMOT_1",
    ]


# ---------------------------------------------------------------------------
# Day and night
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("clock", "regime"),
    [
        ("05:59", REGIME_NIGHT),
        ("06:00", REGIME_DAY),
        ("18:59", REGIME_DAY),
        ("19:00", REGIME_NIGHT),
        ("00:30", REGIME_NIGHT),
    ],
)
def test_a_sample_stands_for_its_part_of_the_day(clock: str, regime: str) -> None:
    hour, minute = (int(part) for part in clock.split(":"))
    assert regime_at(datetime(2026, 10, 8, hour, minute, tzinfo=VIENNA)) == regime


@pytest.mark.parametrize(
    ("clock", "switch"),
    [
        ((8, 3, 0), (8, 6, 0)),
        ((8, 12, 30), (8, 19, 0)),
        ((8, 19, 0), (9, 6, 0)),
        ((8, 23, 59), (9, 6, 0)),
    ],
)
def test_regime_ends_at_the_next_switch(
    clock: tuple[int, int, int], switch: tuple[int, int, int]
) -> None:
    day, hour, minute = clock
    local = datetime(2026, 10, day, hour, minute, tzinfo=VIENNA)
    assert regime_ends(local) == datetime(2026, 10, *switch, tzinfo=VIENNA)


# ---------------------------------------------------------------------------
# When a request is made
# ---------------------------------------------------------------------------


async def test_first_ask_fetches_one_sample_for_the_whole_stop(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    freezer.move_to(DAY)
    answer = await async_get_run_times(hass).async_get(PRATERSTERN, ("U1", "H"))

    assert dm_fetch.await_count == 1
    _session, params, user_agent = dm_fetch.await_args.args
    assert user_agent == USER_AGENT
    assert dm_fetch.await_args.kwargs == {"endpoint": ROUTING_DEPARTURE_ENDPOINT}
    assert ("name_dm", str(PRATERSTERN)) in params
    assert ("limit", str(RUN_TIME_DEPARTURES_REQUESTED)) in params
    assert ("includeCompleteStopSeq", "1") in params
    # U-Bahn (2), Badner Bahn and tram (3, 4) and bus (5) are what is asked for.
    assert {name for name, _ in params if name.startswith("exclMOT_")} == {
        f"exclMOT_{code}" for code in (0, 1, 6, 7, 8, 9, 10, 11)
    }
    assert answer.pairs[("U1", "H")][LEOPOLDAU] == 14.4
    assert len(answer.pairs) == 10
    assert answer.fetched_at == DAY
    assert answer.valid_until == datetime(2026, 10, 8, 19, 0, tzinfo=VIENNA)


async def test_a_sample_answers_every_line_for_a_week(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    registry = async_get_run_times(hass)
    freezer.move_to(DAY)
    await registry.async_get(PRATERSTERN, ("U1", "H"))

    freezer.move_to(DAY + timedelta(hours=3))
    await registry.async_get(PRATERSTERN, ("5", "H"))
    await registry.async_get(PRATERSTERN)
    # The last hour of its week: the answer ends with the sample, not the day.
    freezer.move_to(DAY + RUN_TIME_MAX_AGE - timedelta(hours=1))
    answer = await registry.async_get(PRATERSTERN, ("82A", "H"))
    assert dm_fetch.await_count == 1
    assert answer.valid_until == DAY + RUN_TIME_MAX_AGE

    freezer.move_to(DAY + RUN_TIME_MAX_AGE)
    answer = await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 2
    assert answer.fetched_at == DAY + RUN_TIME_MAX_AGE


async def test_the_evening_gets_a_sample_of_its_own(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    """The slower daytime sample doesn't stand in for the evening timetable."""
    registry = async_get_run_times(hass)
    freezer.move_to(DAY)
    await registry.async_get(PRATERSTERN)

    dm_fetch.return_value = _body(_run("5", "H", [_point(str(WESTBAHNHOF), 33)]))
    freezer.move_to(NIGHT)
    answer = await registry.async_get(PRATERSTERN, ("5", "H"))

    assert dm_fetch.await_count == 2
    assert answer.pairs[("5", "H")] == {WESTBAHNHOF: 33}
    assert answer.fetched_at == NIGHT
    assert answer.valid_until == datetime(2026, 10, 9, 6, 0, tzinfo=VIENNA)
    # Back in the daytime the first sample still holds.
    freezer.move_to(DAY + timedelta(days=1))
    answer = await registry.async_get(PRATERSTERN, ("5", "H"))
    assert dm_fetch.await_count == 2
    assert answer.pairs[("5", "H")][WESTBAHNHOF] == 38


async def test_a_line_missing_tonight_is_served_from_the_daytime_sample(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A few minutes off beats a request: the 82A isn't in the evening rows."""
    registry = async_get_run_times(hass)
    freezer.move_to(DAY)
    await registry.async_get(PRATERSTERN)
    dm_fetch.return_value = _body(_run("5", "H", [_point(str(WESTBAHNHOF), 33)]))
    freezer.move_to(NIGHT)
    await registry.async_get(PRATERSTERN)

    freezer.move_to(NIGHT + timedelta(hours=2))
    answer = await registry.async_get(PRATERSTERN, ("82A", "H"))

    assert dm_fetch.await_count == 2
    assert answer.pairs[("82A", "H")][KRIEAU] == 11


async def test_a_line_no_sample_holds_earns_one_top_up(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    registry = async_get_run_times(hass)
    dm_fetch.return_value = _body(_run("U1", "H", [_point(str(LEOPOLDAU), 15)]))
    freezer.move_to(DAY)
    await registry.async_get(PRATERSTERN, ("U1", "H"))

    # A sample minutes old would return the same rows.
    freezer.move_to(DAY + RUN_TIME_TOP_UP_AFTER - timedelta(minutes=1))
    answer = await registry.async_get(PRATERSTERN, ("13A", "H"))
    assert dm_fetch.await_count == 1
    assert ("13A", "H") not in answer.pairs

    dm_fetch.return_value = _body(
        _run("13A", "H", [_point("60200001", 4)]),
        _run("U1", "H", [_point(str(LEOPOLDAU), 20)]),
    )
    freezer.move_to(DAY + RUN_TIME_TOP_UP_AFTER)
    answer = await registry.async_get(PRATERSTERN, ("13A", "H"))
    assert dm_fetch.await_count == 2
    assert answer.pairs[("13A", "H")] == {60200001: 4}
    # Only the missing line is added: the sample keeps its rows and its age.
    assert answer.pairs[("U1", "H")] == {LEOPOLDAU: 15}
    assert answer.fetched_at == DAY


async def test_a_top_up_is_spent_once_per_line(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A line the timetable doesn't know can't cost a request an hour."""
    registry = async_get_run_times(hass)
    freezer.move_to(DAY)
    await registry.async_get(PRATERSTERN)

    freezer.move_to(DAY + timedelta(hours=1))
    await registry.async_get(PRATERSTERN, ("25B", "H"))
    assert dm_fetch.await_count == 2
    # Another unknown line right after: the stop was asked a moment ago.
    freezer.move_to(DAY + timedelta(hours=1, minutes=5))
    await registry.async_get(PRATERSTERN, ("N25", "H"))
    assert dm_fetch.await_count == 2

    freezer.move_to(DAY + timedelta(hours=3))
    await registry.async_get(PRATERSTERN, ("25B", "H"))
    assert dm_fetch.await_count == 2
    await registry.async_get(PRATERSTERN, ("N25", "H"))
    assert dm_fetch.await_count == 3


async def test_no_top_up_for_the_s_bahn(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    """The request leaves the S-Bahn out, so asking again can't find it."""
    registry = async_get_run_times(hass)
    freezer.move_to(DAY)
    await registry.async_get(PRATERSTERN)
    freezer.move_to(DAY + timedelta(hours=2))
    await registry.async_get(PRATERSTERN, ("S1", "R"))
    assert dm_fetch.await_count == 1


async def test_callers_asking_at_once_share_one_request(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    freezer.move_to(DAY)
    gate = asyncio.Event()

    async def slow(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        await gate.wait()
        return _captured()

    dm_fetch.side_effect = slow
    registry = async_get_run_times(hass)
    callers = [
        hass.async_create_task(registry.async_get(PRATERSTERN, pair))
        for pair in (("U1", "H"), ("5", "H"), None)
    ]
    for _ in range(20):
        await asyncio.sleep(0)
    gate.set()
    answers = await asyncio.gather(*callers)

    assert dm_fetch.await_count == 1
    assert all(answer.pairs == answers[0].pairs for answer in answers)
    assert registry._in_flight == {}


# ---------------------------------------------------------------------------
# Failures
# ---------------------------------------------------------------------------


async def test_a_failure_without_a_sample_raises_and_backs_off(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    caplog: pytest.LogCaptureFixture,
) -> None:
    registry = async_get_run_times(hass)
    dm_fetch.side_effect = RoutingError("api_timeout", {"seconds": "20"})
    freezer.move_to(DAY)
    with caplog.at_level(logging.INFO), pytest.raises(RoutingError):
        await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 1

    # Inside the retry spacing nothing is sent; the caller hears why.
    freezer.move_to(DAY + timedelta(minutes=2))
    with pytest.raises(RoutingError, match="api_timeout"):
        await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 1

    # 5 min +/-10% has passed. The second failure doubles the wait.
    freezer.move_to(DAY + timedelta(minutes=6))
    with caplog.at_level(logging.INFO), pytest.raises(RoutingError):
        await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 2
    freezer.move_to(DAY + timedelta(minutes=14))
    with pytest.raises(RoutingError):
        await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 2
    assert caplog.text.count("Run times for stop 60201040 unavailable") == 1

    dm_fetch.side_effect = None
    freezer.move_to(DAY + timedelta(minutes=18))
    with caplog.at_level(logging.INFO):
        answer = await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 3
    assert answer.pairs[("U1", "H")][LEOPOLDAU] == 14.4
    assert "Run times for stop 60201040 are back" in caplog.text
    assert registry._stops[PRATERSTERN].retry_spacing == TIMETABLE_RETRY_AFTER


async def test_a_failure_keeps_the_sample_it_was_meant_to_replace(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    registry = async_get_run_times(hass)
    freezer.move_to(DAY)
    await registry.async_get(PRATERSTERN)

    dm_fetch.side_effect = RoutingError("api_timeout", {"seconds": "20"})
    expired = DAY + RUN_TIME_MAX_AGE
    freezer.move_to(expired)
    answer = await registry.async_get(PRATERSTERN)

    assert dm_fetch.await_count == 2
    assert answer.pairs[("U1", "H")][LEOPOLDAU] == 14.4
    assert answer.fetched_at == DAY
    # Ask again once a retry is allowed, not at the end of the day.
    wait = answer.valid_until - expired
    assert TIMETABLE_RETRY_AFTER * 0.9 <= wait <= TIMETABLE_RETRY_AFTER * 1.1

    freezer.move_to(expired + timedelta(minutes=1))
    answer = await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 2
    assert answer.pairs[("U1", "H")][LEOPOLDAU] == 14.4


async def test_a_waiter_going_away_leaves_the_request_running(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A dashboard closing mid-request cancels its wait, not the fetch."""
    freezer.move_to(DAY)
    gate = asyncio.Event()

    async def slow(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        await gate.wait()
        return _captured()

    dm_fetch.side_effect = slow
    registry = async_get_run_times(hass)
    waiter = hass.async_create_task(registry.async_get(PRATERSTERN))
    for _ in range(20):
        await asyncio.sleep(0)
    waiter.cancel()
    with pytest.raises(asyncio.CancelledError):
        await waiter
    gate.set()
    await hass.async_block_till_done(wait_background_tasks=True)

    dm_fetch.side_effect = None
    answer = await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 1
    assert len(answer.pairs) == 10


# ---------------------------------------------------------------------------
# Store
# ---------------------------------------------------------------------------


async def test_samples_survive_a_restart(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    storage: dict[str, Any],
) -> None:
    freezer.move_to(DAY)
    first = async_get_run_times(hass)
    assert async_get_run_times(hass) is first
    await first.async_get(PRATERSTERN)
    freezer.move_to(DAY + RUN_TIME_TOP_UP_AFTER)
    before = await first.async_get(PRATERSTERN, ("25B", "H"))
    assert dm_fetch.await_count == 2

    stored = storage[STORE_KEY]["data"]["stops"][str(PRATERSTERN)][REGIME_DAY]
    assert stored["fetched_at"] == before.fetched_at.isoformat()
    assert stored["pairs"]["U1|H"][str(LEOPOLDAU)] == 14.4
    assert stored["asked"] == ["25B|H"]

    hass.data[DOMAIN].pop(RUN_TIMES_KEY)
    restarted = async_get_run_times(hass)
    assert restarted is not first
    freezer.move_to(DAY + timedelta(hours=3))
    after = await restarted.async_get(PRATERSTERN, ("25B", "H"))

    # Neither a new sample nor a second top-up for the line already asked.
    assert dm_fetch.await_count == 2
    assert after.pairs == before.pairs
    assert after.fetched_at == before.fetched_at


@pytest.mark.parametrize(
    "data",
    [
        {"stops": {str(PRATERSTERN): {"day": {"fetched_at": "not a date"}}}},
        {"stops": {str(PRATERSTERN): {"day": {"fetched_at": DAY.isoformat()}}}},
        {
            "stops": {
                str(PRATERSTERN): {
                    "day": {"fetched_at": DAY.isoformat(), "pairs": {"U1": {}}}
                }
            }
        },
        {"stops": []},
    ],
)
async def test_corrupt_store_is_ignored(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    storage: dict[str, Any],
    caplog: pytest.LogCaptureFixture,
    data: dict[str, Any],
) -> None:
    storage[STORE_KEY] = {"version": STORE_VERSION, "key": STORE_KEY, "data": data}
    freezer.move_to(DAY)
    answer = await async_get_run_times(hass).async_get(PRATERSTERN)

    assert "Ignoring corrupt stored run times" in caplog.text
    assert dm_fetch.await_count == 1
    assert len(answer.pairs) == 10


async def test_stored_samples_of_another_layout_are_left_out(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    storage: dict[str, Any],
) -> None:
    """A part of the day this version doesn't know is dropped, not misread."""
    storage[STORE_KEY] = {
        "version": STORE_VERSION,
        "key": STORE_KEY,
        "data": {
            "stops": {
                str(PRATERSTERN): {
                    "peak": {"fetched_at": DAY.isoformat(), "pairs": {}},
                    "day": {
                        "fetched_at": DAY.isoformat(),
                        "pairs": {"U1|H": {str(LEOPOLDAU): 15}},
                    },
                }
            }
        },
    }
    freezer.move_to(DAY + timedelta(hours=1))
    answer = await async_get_run_times(hass).async_get(PRATERSTERN)

    assert dm_fetch.await_count == 0
    assert answer.pairs == {("U1", "H"): {LEOPOLDAU: 15}}


async def test_unreadable_store_is_ignored(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    caplog: pytest.LogCaptureFixture,
) -> None:
    freezer.move_to(DAY)
    with patch(f"{_MODULE}.Store.async_load", side_effect=OSError("disk")):
        answer = await async_get_run_times(hass).async_get(PRATERSTERN)
    assert "Failed to read the stored run times" in caplog.text
    assert len(answer.pairs) == 10


async def test_a_failed_save_keeps_the_sample_in_memory(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    caplog: pytest.LogCaptureFixture,
) -> None:
    freezer.move_to(DAY)
    registry = async_get_run_times(hass)
    with patch(f"{_MODULE}.Store.async_save", side_effect=OSError("read-only")):
        await registry.async_get(PRATERSTERN)
    assert "Failed to persist run times" in caplog.text
    await registry.async_get(PRATERSTERN)
    assert dm_fetch.await_count == 1


async def test_a_removed_board_takes_its_samples_with_it(
    hass: HomeAssistant,
    board: MockConfigEntry,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    storage: dict[str, Any],
) -> None:
    other = make_entry({CONF_DIVA: MEIDLING}, unique_id=f"diva_{MEIDLING}")
    other.add_to_hass(hass)
    freezer.move_to(DAY)
    registry = async_get_run_times(hass)
    await registry.async_get(MEIDLING)
    assert str(MEIDLING) in storage[STORE_KEY]["data"]["stops"]

    await hass.config_entries.async_remove(other.entry_id)
    await registry.async_get(PRATERSTERN)

    assert list(storage[STORE_KEY]["data"]["stops"]) == [str(PRATERSTERN)]


# ---------------------------------------------------------------------------
# WebSocket command
# ---------------------------------------------------------------------------


def _name_stops(catalogue: StaticCatalogue, names: dict[int, str]) -> None:
    for diva, name in names.items():
        catalogue.stations_by_diva[diva] = Station(
            diva=diva,
            name=name,
            municipality="Wien",
            longitude=16.39,
            latitude=48.22,
            rbls=[],
        )


async def _connect(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
    now: datetime = DAY,
) -> Any:
    """Authenticate before freezing the clock: the token carries the real time."""
    client = await hass_ws_client(hass)
    freezer.move_to(now)
    await async_setup_entry_and_wait(hass, entry)
    return client


async def _ask(client: Any, **payload: Any) -> dict[str, Any]:
    await client.send_json_auto_id(
        {"type": "wiener_linien_austria/run_times", **payload}
    )
    response: dict[str, Any] = await client.receive_json()
    return response


async def test_command_answers_by_the_names_the_trail_prints(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    mock_fetch: AsyncMock,
    mock_static_catalogue: StaticCatalogue,
    dm_fetch: AsyncMock,
) -> None:
    _name_stops(
        mock_static_catalogue,
        {VORGARTENSTRASSE: "Vorgartenstraße", LEOPOLDAU: "Leopoldau"},
    )
    client = await _connect(
        hass, hass_ws_client, freezer, make_entry({CONF_DIVA: PRATERSTERN})
    )

    response = await _ask(client, diva=PRATERSTERN, line="U1", direction="H")

    assert response["success"], response
    result = response["result"]
    # Only the stops the catalogue names: nothing else could match a trail.
    assert result["run_times"]["U1|H"] == {"Vorgartenstraße": 1, "Leopoldau": 14.4}
    assert result["diva"] == PRATERSTERN
    assert datetime.fromisoformat(result["fetched_at"]) == DAY
    assert datetime.fromisoformat(result["valid_until"]) == datetime(
        2026, 10, 8, 19, 0, tzinfo=VIENNA
    )
    assert result["attribution"] == ATTRIBUTION
    assert dm_fetch.await_args.args[2] == USER_AGENT

    # A second trail at the same stop is answered from the sample.
    again = await _ask(client, diva=PRATERSTERN, line="5", direction="H")
    assert again["result"]["run_times"] == result["run_times"]
    assert dm_fetch.await_count == 1


async def test_command_passes_the_line_on_for_a_top_up(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    mock_fetch: AsyncMock,
) -> None:
    client = await _connect(
        hass, hass_ws_client, freezer, make_entry({CONF_DIVA: PRATERSTERN})
    )
    with patch.object(RunTimes, "async_get", autospec=True) as get:
        get.side_effect = RoutingError("api_timeout", {"seconds": "20"})
        await _ask(client, diva=PRATERSTERN, line="82A", direction="H")
        await _ask(client, diva=PRATERSTERN, line="82A")
        await _ask(client, diva=str(PRATERSTERN))
    assert [call.args[1:] for call in get.await_args_list] == [
        (PRATERSTERN, ("82A", "H")),
        (PRATERSTERN, None),
        (PRATERSTERN, None),
    ]


async def test_command_adds_the_s_bahn_from_the_board_without_a_request(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    mock_fetch: AsyncMock,
    dm_fetch: AsyncMock,
) -> None:
    """The next train of each picked line stands for it; one gone doesn't."""
    body = json.loads(
        (FIXTURES / "timetable_meidling_stops.json").read_text(encoding="utf-8")
    )
    planned = parse_departure_body(body, MEIDLING, VIENNA)
    s80, _s2, s60 = planned
    entry = make_entry(
        {CONF_DIVA: MEIDLING, CONF_LINES: ["U6|H", "S80|H", "S2|R", "S60|R"]},
        unique_id=f"diva_{MEIDLING}",
    )
    # A minute after the S80 left: it is still in the batch, but gone.
    client = await _connect(
        hass, hass_ws_client, freezer, entry, s80.planned + timedelta(seconds=30)
    )
    board = entry.runtime_data.timetable
    # A later S60 with one stop fewer must not replace the next one's run.
    later = type(s60)(
        line=s60.line,
        towards=s60.towards,
        direction=s60.direction,
        platform=s60.platform,
        planned=s60.planned + timedelta(minutes=30),
        stops=s60.stops[:1],
    )
    board._departures = (*planned, later)
    dm_fetch.return_value = _body()

    response = await _ask(client, diva=MEIDLING, line="S60", direction="R")

    run_times = response["result"]["run_times"]
    assert set(run_times) == {"S2|R", "S60|R"}
    assert run_times["S2|R"] == {"Hauptbahnhof": 5}
    assert len(run_times["S60|R"]) == len(s60.stops)
    assert run_times["S60|R"]["Bruck/Leitha"] == 47
    assert dm_fetch.await_count == 1


async def test_command_only_serves_stops_with_a_departure_board(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    mock_fetch: AsyncMock,
    fetch: AsyncMock,
    dm_fetch: AsyncMock,
) -> None:
    """Neither an unconfigured stop nor a route's end points can be asked for."""
    client = await _connect(
        hass, hass_ws_client, freezer, make_entry({CONF_DIVA: PRATERSTERN})
    )
    await async_setup_entry_and_wait(hass, route_entry())

    for diva in (MEIDLING, WESTBAHNHOF):
        response = await _ask(client, diva=diva)
        assert not response["success"]
        assert response["error"]["code"] == "invalid_stop"
    assert dm_fetch.await_count == 0

    invalid = await _ask(client, diva=PRATERSTERN, direction="X")
    assert invalid["error"]["code"] == "invalid_format"


async def test_command_reports_an_upstream_failure(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    mock_fetch: AsyncMock,
    dm_fetch: AsyncMock,
) -> None:
    client = await _connect(
        hass, hass_ws_client, freezer, make_entry({CONF_DIVA: PRATERSTERN})
    )
    dm_fetch.side_effect = RoutingError("api_timeout", {"seconds": "20"})

    response = await _ask(client, diva=PRATERSTERN)

    assert response["error"]["code"] == "upstream"
    assert response["error"]["translation_key"] == "api_timeout"


async def test_command_reports_an_unavailable_catalogue(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    mock_fetch: AsyncMock,
    dm_fetch: AsyncMock,
) -> None:
    client = await _connect(
        hass, hass_ws_client, freezer, make_entry({CONF_DIVA: PRATERSTERN})
    )
    with patch(
        "custom_components.wiener_linien_austria.static.async_get_catalogue",
        side_effect=aiohttp.ClientError("down"),
    ):
        response = await _ask(client, diva=PRATERSTERN)
    assert response["error"]["code"] == "catalogue_unavailable"
    assert dm_fetch.await_count == 0


async def test_command_answers_not_loaded_without_an_entry(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    from homeassistant.setup import async_setup_component

    assert await async_setup_component(hass, DOMAIN, {})
    client = await hass_ws_client(hass)
    response = await _ask(client, diva=PRATERSTERN)
    assert response["error"]["code"] == "not_loaded"


async def test_unloading_the_last_entry_drops_the_registry(
    hass: HomeAssistant,
    mock_fetch: AsyncMock,
    dm_fetch: AsyncMock,
    freezer: FrozenDateTimeFactory,
    storage: dict[str, Any],
) -> None:
    """The samples stay in the Store for the next setup."""
    freezer.move_to(DAY)
    entry = make_entry({CONF_DIVA: PRATERSTERN})
    await async_setup_entry_and_wait(hass, entry)
    await async_get_run_times(hass).async_get(PRATERSTERN)

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    assert RUN_TIMES_KEY not in hass.data[DOMAIN]
    assert str(PRATERSTERN) in storage[STORE_KEY]["data"]["stops"]
