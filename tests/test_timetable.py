"""Tests for planned S-Bahn departures on departure boards (timetable.py)."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, patch
from zoneinfo import ZoneInfo

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers.update_coordinator import UpdateFailed
from homeassistant.util import dt as dt_util

from custom_components.wiener_linien_austria.batch import BatchResult
from custom_components.wiener_linien_austria.config_flow import _line_label
from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    DOMAIN,
    LINE_TYPE_S_BAHN,
    MAX_STOPS_AHEAD,
    ROUTING_DEPARTURE_ENDPOINT,
    TIMETABLE_DEPARTURES_REQUESTED,
    TIMETABLE_MAX_AGE,
)
from custom_components.wiener_linien_austria.coordinator import (
    Departure,
    WienerLinienAustriaCoordinator,
    timetable_departures,
)
from custom_components.wiener_linien_austria.routing import RoutingError
from custom_components.wiener_linien_austria.timetable import (
    PlannedDeparture,
    PlannedStop,
    TimetableBoard,
    async_fetch_planned_departures,
    async_probe_picker_rows,
    build_departure_params,
    parse_calling_points,
    parse_departure_body,
    picker_rows,
)

from .conftest import make_entry

VIENNA = ZoneInfo("Europe/Vienna")
PRATERSTERN = 60201040
FIXTURE = Path(__file__).parent / "fixtures" / "timetable_praterstern.json"
# The fixture's first train, the S2 at 15:14 Vienna time.
FIRST_TRAIN = datetime(2026, 9, 15, 15, 14, tzinfo=VIENNA)

# Every (line, direction) in the Praterstern fixture. Boards built with
# this count their whole batch as tracked, which is the semantics the tests
# predating the picked-lines rule were written against; the tests that
# exercise that rule pass a narrower set.
ALL_PAIRS = frozenset({("S1", "R"), ("S2", "R"), ("S3", "R"), ("S4", "R")})

_FETCH = "custom_components.wiener_linien_austria.timetable.async_fetch_trip_body"
_COOLDOWN = (
    "custom_components.wiener_linien_austria.timetable.async_enforce_routing_cooldown"
)


def _body() -> dict[str, Any]:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def _padded_body(rows: int) -> dict[str, Any]:
    """The fixture's 12 trains padded to `rows` with copies of its first one.

    The copies all sit at FIRST_TRAIN, so any `now` past that counts none
    of them as upcoming: a long batch that is nearly spent, which is the
    state the running-low rule exists to catch.
    """
    body = _body()
    deps = body["departureList"]
    body["departureList"] = deps + [deps[0]] * (rows - len(deps))
    return body


def _planned(
    line: str = "S1",
    direction: str = "R",
    minutes: float = 5,
    towards: str = "Marchegg",
) -> PlannedDeparture:
    return PlannedDeparture(
        line=line,
        towards=towards,
        direction=direction,
        platform="3",
        planned=FIRST_TRAIN + timedelta(minutes=minutes),
    )


# ---------------------------------------------------------------------------
# Request and parsing
# ---------------------------------------------------------------------------


def test_params_ask_for_the_s_bahn_only() -> None:
    """Every mode but the S-Bahn (motType 1) is excluded server-side."""
    params = dict(build_departure_params(PRATERSTERN, 30))
    assert params["name_dm"] == str(PRATERSTERN)
    assert params["type_dm"] == "stopID"
    assert params["limit"] == "30"
    assert params["excludedMeans"] == "checkbox"
    excluded = {key for key in params if key.startswith("exclMOT_")}
    assert "exclMOT_1" not in excluded
    assert {"exclMOT_0", "exclMOT_2", "exclMOT_4", "exclMOT_5"} <= excluded


def test_params_can_ask_for_a_later_time() -> None:
    """`itdDate` / `itdTime` carry the given wall clock; absent by default."""
    params = dict(
        build_departure_params(
            PRATERSTERN, 40, at=datetime(2026, 9, 16, 10, 0, tzinfo=VIENNA)
        )
    )
    assert (params["itdDate"], params["itdTime"]) == ("20260916", "1000")
    assert "itdDate" not in dict(build_departure_params(PRATERSTERN, 40))


def test_calling_points_cover_the_whole_run() -> None:
    """Stops before and after, the row's own stop, S-Bahn rows only."""
    body = {
        "departureList": [
            {
                "stopID": "60201040",
                "servingLine": {"number": "S3", "motType": "1"},
                # A single previous stop arrives as a bare point.
                "prevStopSeq": {"name": "Wien Meidling", "ref": {"id": "60201015"}},
                "onwardStopSeq": [
                    {"name": "Wien Floridsdorf", "ref": {"id": "60200334"}},
                    {"name": "Stockerau Bahnhof", "ref": {"id": "no-id"}},
                ],
            },
            {
                "stopID": "60201040",
                "servingLine": {"number": "S80", "motType": "1"},
                "onwardStopSeq": [
                    {"name": "Wien Floridsdorf", "ref": {"id": "60200334"}}
                ],
            },
            {
                "stopID": "60201040",
                "servingLine": {"number": "U1", "motType": "2"},
                "onwardStopSeq": [{"name": "Wien Vorgartenstr.", "ref": {"id": "1"}}],
            },
            {"servingLine": {"motType": "1"}},
            "garbage",
        ]
    }
    assert parse_calling_points(body) == {
        60201015: {"S3"},
        60201040: {"S3", "S80"},
        60200334: {"S3", "S80"},
    }


def test_calling_points_of_an_empty_or_collapsed_answer() -> None:
    assert parse_calling_points({}) == {}
    collapsed = {
        "departureList": {
            "departure": {
                "stopID": "60201040",
                "servingLine": {"number": "S7", "motType": "1"},
            }
        }
    }
    assert parse_calling_points(collapsed) == {60201040: {"S7"}}


def test_parse_praterstern_fixture() -> None:
    """The live answer parses into S-Bahn rows with Vienna times and platforms."""
    departures = parse_departure_body(_body(), PRATERSTERN, VIENNA)

    assert len(departures) == 12
    first = departures[0]
    assert first == PlannedDeparture(
        line="S2",
        towards="Wolkersdorf",
        direction="R",
        platform="4",
        planned=FIRST_TRAIN,
    )
    assert [dep.planned for dep in departures] == sorted(
        dep.planned for dep in departures
    )
    assert {dep.line for dep in departures} == {"S1", "S2", "S3", "S4"}


def test_parse_skips_other_stops_other_modes_and_broken_rows() -> None:
    """Only S-Bahn rows at the requested stop with a readable time survive."""
    body = _body()
    rows = body["departureList"]
    rows[0]["stopID"] = "60200334"
    rows[1]["servingLine"]["motType"] = "2"
    rows[2]["dateTime"] = {"year": "2026"}
    rows[3]["servingLine"]["number"] = ""
    body["departureList"] = [*rows, "garbage"]

    departures = parse_departure_body(body, PRATERSTERN, VIENNA)

    assert len(departures) == 8


def test_parse_single_departure_collapsed_into_a_mapping() -> None:
    """EFA collapses a one-element list into `{"departure": {...}}`."""
    body = _body()
    body["departureList"] = {"departure": body["departureList"][0]}
    assert len(parse_departure_body(body, PRATERSTERN, VIENNA)) == 1


def test_parse_stop_without_s_bahn_is_empty() -> None:
    """A known stop with no trains answers `departureList: null`."""
    assert parse_departure_body({"departureList": None}, PRATERSTERN, VIENNA) == []


def test_parse_unknown_stop_raises() -> None:
    """-2000 on the `dm` block is an unknown stop, not an empty board."""
    body = {
        "dm": {
            "message": [
                {"name": "code", "value": "-2000"},
                {"name": "error", "value": "stop invalid"},
            ]
        },
        "departureList": None,
    }
    with pytest.raises(RoutingError) as err:
        parse_departure_body(body, 99999999, VIENNA)
    assert err.value.translation_key == "route_stop_invalid"


@pytest.mark.parametrize(
    ("direction", "expected"),
    [
        ("Wien Floridsdorf", "Floridsdorf"),
        ("Gänserndorf Bahnhof", "Gänserndorf"),
        ("Wiener Neustadt Hauptbahnhof", "Wiener Neustadt Hauptbahnhof"),
        ("Wien", "Wien"),
        (None, ""),
    ],
)
def test_parse_towards_reads_like_a_board(direction: str | None, expected: str) -> None:
    body = _body()
    body["departureList"] = body["departureList"][:1]
    if direction is None:
        del body["departureList"][0]["servingLine"]["direction"]
    else:
        body["departureList"][0]["servingLine"]["direction"] = direction
    assert parse_departure_body(body, PRATERSTERN, VIENNA)[0].towards == expected


def test_picker_rows_one_per_line_and_direction() -> None:
    """Rows collapse on (line, direction), labelled with the commonest terminus."""
    departures = parse_departure_body(_body(), PRATERSTERN, VIENNA)
    departures.append(_planned("S45", "H", towards="Hütteldorf"))
    departures.append(_planned("S2", "", towards="Nowhere"))

    rows = picker_rows(departures)

    assert [row["key"] for row in rows] == ["S1|R", "S2|R", "S3|R", "S4|R", "S45|H"]
    s2 = rows[1]
    assert s2["towards"] == "Wolkersdorf"
    assert s2["type"] == LINE_TYPE_S_BAHN


async def test_fetch_uses_the_departure_endpoint(hass: HomeAssistant) -> None:
    with patch(_FETCH, new_callable=AsyncMock, return_value=_body()) as fetch:
        departures = await async_fetch_planned_departures(hass, PRATERSTERN, 30)
    assert len(departures) == 12
    assert fetch.await_args.kwargs["endpoint"] == ROUTING_DEPARTURE_ENDPOINT


async def test_picker_probe_swallows_failures(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """A failed probe costs the S-Bahn options, not the dialog."""
    with patch(_FETCH, new_callable=AsyncMock, side_effect=RoutingError("api_timeout")):
        assert await async_probe_picker_rows(hass, PRATERSTERN) == []
    assert "S-Bahn line probe failed" in caplog.text

    with patch(_FETCH, new_callable=AsyncMock, return_value=_body()):
        rows = await async_probe_picker_rows(hass, PRATERSTERN)
    assert [row["key"] for row in rows] == ["S1|R", "S2|R", "S3|R", "S4|R"]


# ---------------------------------------------------------------------------
# TimetableBoard refresh policy
# ---------------------------------------------------------------------------


async def test_board_refresh_policy(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Due when empty, old, or running low; never within five minutes."""
    freezer.move_to(FIRST_TRAIN - timedelta(minutes=1))
    board = TimetableBoard(hass, PRATERSTERN, ALL_PAIRS)
    now = FIRST_TRAIN - timedelta(minutes=1)
    assert board.is_due(now)

    # A full answer: as many trains as asked for, so the server may have
    # more.
    full = _padded_body(TIMETABLE_DEPARTURES_REQUESTED)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=full),
    ):
        assert await board.async_refresh() is True
    assert len(board.departures) == TIMETABLE_DEPARTURES_REQUESTED
    assert board.fetched_at is not None

    # Fresh and plenty ahead.
    assert not board.is_due(now + timedelta(minutes=10))
    # Too old.
    assert board.is_due(now + TIMETABLE_MAX_AGE)
    # Running low: at 16:15 only four trains are still ahead. Pretend the
    # batch was fetched a minute earlier so the age rule stays out of it.
    board._fetched_at = FIRST_TRAIN + timedelta(minutes=60)
    board._attempted_at = board._fetched_at
    later = FIRST_TRAIN + timedelta(minutes=61)
    assert not board.is_due(later)  # within the retry spacing
    assert board.is_due(later + timedelta(minutes=5))


async def test_board_failure_keeps_rows_and_logs_once(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    board = TimetableBoard(hass, PRATERSTERN, ALL_PAIRS)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()),
    ):
        await board.async_refresh()

    caplog.set_level(logging.INFO)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, side_effect=RoutingError("api_timeout")),
    ):
        assert await board.async_refresh() is False
        assert await board.async_refresh() is False
    assert len(board.departures) == 12
    assert caplog.text.count("S-Bahn timetable for stop") == 1

    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value={"departureList": None}),
    ):
        assert await board.async_refresh() is True
    assert board.departures == ()
    assert "is back" in caplog.text


async def test_board_backs_off_while_failing(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """5, 10, 20, then 30 min between retries; an answer resets it."""
    start = FIRST_TRAIN - timedelta(minutes=1)
    freezer.move_to(start)
    board = TimetableBoard(hass, PRATERSTERN, ALL_PAIRS)
    failing = patch(
        _FETCH, new_callable=AsyncMock, side_effect=RoutingError("api_timeout")
    )
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch("random.uniform", return_value=1.0),
        failing,
    ):
        for minutes in (5, 10, 20, 30, 30):
            assert board.is_due(dt_util.utcnow())
            assert await board.async_refresh() is False
            attempted = dt_util.utcnow()
            assert not board.is_due(attempted + timedelta(minutes=minutes - 1))
            assert board.is_due(attempted + timedelta(minutes=minutes))
            freezer.tick(timedelta(minutes=minutes))

    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()),
    ):
        assert await board.async_refresh() is True
    answered = dt_util.utcnow()
    # Back to the normal spacing (only the age and running-low rules now).
    board._departures = ()
    assert not board.is_due(answered + timedelta(minutes=4))
    assert board.is_due(answered + TIMETABLE_MAX_AGE)


async def test_board_retry_spacing_is_jittered(hass: HomeAssistant) -> None:
    board = TimetableBoard(hass, PRATERSTERN, ALL_PAIRS)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, side_effect=RoutingError("api_timeout")),
        patch("random.uniform", return_value=1.1) as uniform,
    ):
        await board.async_refresh()
    uniform.assert_called_once_with(0.9, 1.1)
    attempted = board._attempted_at
    assert attempted is not None
    assert not board.is_due(attempted + timedelta(minutes=5, seconds=29))
    assert board.is_due(attempted + timedelta(minutes=5, seconds=30))


# ---------------------------------------------------------------------------
# Merging into the board
# ---------------------------------------------------------------------------


def test_timetable_departures_rows() -> None:
    """Picked pairs only, countdown rounded down, gone once the time passes."""
    planned = (
        _planned("S1", "R", minutes=-0.5),  # left half a minute ago
        _planned("S1", "R", minutes=0.5),
        _planned("S1", "R", minutes=7.9),
        _planned("S1", "H", minutes=3),  # direction not picked
        _planned("S2", "R", minutes=4),  # line not picked
    )
    rows = timetable_departures(planned, frozenset({("S1", "R")}), FIRST_TRAIN)

    assert [row.countdown for row in rows] == [0, 7]
    row = rows[0]
    assert row.type == LINE_TYPE_S_BAHN
    assert row.timetable is True
    assert row.realtime is False
    assert row.time_real is None
    assert row.platform == "3"
    assert row.time_planned == (FIRST_TRAIN + timedelta(seconds=30)).isoformat()
    assert row.to_dict()["timetable"] is True


def test_live_departure_dict_has_no_timetable_key() -> None:
    """Live rows keep their attribute shape; the flag appears only when set."""
    dep = Departure(
        line="U1",
        towards="Leopoldau",
        direction="H",
        type="ptMetro",
        countdown=2,
        time_planned=None,
        time_real=None,
        realtime=True,
        barrier_free=True,
        traffic_jam=False,
    )
    assert "timetable" not in dep.to_dict()


def _monitor_body() -> dict[str, Any]:
    return {
        "data": {
            "monitors": [
                {
                    "lines": [
                        {
                            "name": "U1",
                            "towards": "Leopoldau",
                            "direction": "H",
                            "type": "ptMetro",
                            "departures": {
                                "departure": [
                                    {"departureTime": {"countdown": 2}},
                                    {"departureTime": {"countdown": 9}},
                                ]
                            },
                        }
                    ]
                }
            ]
        }
    }


async def test_coordinator_without_s_bahn_never_fetches(hass: HomeAssistant) -> None:
    entry = make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    assert coordinator.timetable is None

    with patch(_FETCH, new_callable=AsyncMock) as fetch:
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        await hass.async_block_till_done(wait_background_tasks=True)

    fetch.assert_not_awaited()
    assert [dep.line for dep in coordinator.data.departures] == ["U1", "U1"]


async def test_coordinator_merges_s_bahn_after_background_refresh(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """The refresh pushes an update; later ticks merge and count down."""
    freezer.move_to(FIRST_TRAIN - timedelta(minutes=5))
    entry = make_entry({CONF_DIVA: PRATERSTERN, CONF_LINES: ["U1|H", "S2|R"]})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    assert coordinator.timetable is not None
    # The board counts its running-low rule against these, so it must get
    # the S-Bahn pairs the entry picked and nothing else: the U1 is a
    # /monitor line and never appears in a timetable answer, so including
    # it would hold the rule permanently below its threshold.
    assert coordinator.timetable._pairs == frozenset({("S2", "R")})

    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()) as fetch,
    ):
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        # The refresh lands and re-publishes the tick with the S-Bahn in it.
        await hass.async_block_till_done(wait_background_tasks=True)
        rows = coordinator.data.departures
        assert [(dep.line, dep.countdown) for dep in rows[:3]] == [
            ("U1", 2),
            ("S2", 5),
            ("U1", 9),
        ]
        assert fetch.await_count == 1

        # A tick one minute later counts the train down without refetching.
        freezer.tick(timedelta(minutes=1))
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        await hass.async_block_till_done(wait_background_tasks=True)
        assert fetch.await_count == 1
        s2 = [dep for dep in coordinator.data.departures if dep.line == "S2"]
        assert s2[0].countdown == 4
        # S2 only: the fixture's S1/S3/S4 rows aren't picked.
        assert {dep.line for dep in coordinator.data.departures} == {"U1", "S2"}

        # Once the train's time has passed it is gone.
        freezer.move_to(FIRST_TRAIN + timedelta(seconds=1))
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        await hass.async_block_till_done(wait_background_tasks=True)
        planned = {
            dep.time_planned for dep in coordinator.data.departures if dep.line == "S2"
        }
        assert FIRST_TRAIN.isoformat() not in planned
        assert planned


async def test_coordinator_failed_refresh_pushes_nothing(hass: HomeAssistant) -> None:
    entry = make_entry({CONF_LINES: ["S1|R"]})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, side_effect=RoutingError("api_timeout")),
        patch.object(coordinator, "async_set_updated_data") as push,
    ):
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        await hass.async_block_till_done(wait_background_tasks=True)
    assert push.call_count == 1  # the tick itself, not the refresh


# ---------------------------------------------------------------------------
# Line picker
# ---------------------------------------------------------------------------


def test_line_label_marks_s_bahn_rows() -> None:
    s_bahn = {"key": "S1|R", "line": "S1", "towards": "Marchegg", "direction": "R"}
    s_bahn["type"] = LINE_TYPE_S_BAHN
    assert _line_label(s_bahn, "de") == "S1 → Marchegg (nur Fahrplan)"
    assert _line_label(s_bahn, "fr") == "S1 → Marchegg (timetable only)"
    assert _line_label({**s_bahn, "towards": ""}, "en") == "S1 → R (timetable only)"
    u1 = {"key": "U1|H", "line": "U1", "towards": "Leopoldau", "direction": "H"}
    assert _line_label({**u1, "type": "ptMetro"}, "de") == "U1 → Leopoldau"


async def _open_picker(hass: HomeAssistant, source: dict[str, Any]) -> Any:
    return await hass.config_entries.flow.async_init(DOMAIN, context=source)


def _offered(result: Any) -> dict[str, str]:
    schema = result["data_schema"].schema
    selector = next(value for key, value in schema.items() if str(key) == CONF_LINES)
    return {option["value"]: option["label"] for option in selector.config["options"]}


async def test_picker_offers_s_bahn_lines(
    hass: HomeAssistant, mock_fetch, mock_s_bahn_picker_probe
) -> None:
    mock_s_bahn_picker_probe.return_value = picker_rows(
        parse_departure_body(_body(), PRATERSTERN, VIENNA)
    )
    result = await _open_picker(hass, {"source": config_entries.SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"next_step_id": "stop"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    offered = _offered(result)
    assert offered["S2|R"].endswith("(timetable only)")
    assert "U1|H" in offered

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_LINES: ["U1|H", "S2|R"], CONF_SCAN_INTERVAL: 60}
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["data"][CONF_LINES] == ["U1|H", "S2|R"]


async def test_reconfigure_keeps_tracked_s_bahn_lines_offered(
    hass: HomeAssistant, mock_fetch, mock_s_bahn_picker_probe
) -> None:
    """A tracked S-Bahn line stays selectable when the probe comes back empty."""
    entry = make_entry({CONF_LINES: ["U1|H", "S7|H"]})
    entry.add_to_hass(hass)
    result = await _open_picker(
        hass,
        {"source": config_entries.SOURCE_RECONFIGURE, "entry_id": entry.entry_id},
    )
    offered = _offered(result)
    assert offered["S7|H"] == "S7 → H (timetable only)"
    assert "U1|R" in offered
    mock_s_bahn_picker_probe.assert_awaited_once()


# ---------------------------------------------------------------------------
# Stops ahead
# ---------------------------------------------------------------------------

MEIDLING = 60201015
STOPS_FIXTURE = Path(__file__).parent / "fixtures" / "timetable_meidling_stops.json"
# The fixture's first train, the S80 at 15:39 towards Leobersdorf.
S80_AT = datetime(2026, 9, 15, 15, 39, tzinfo=VIENNA)


def _stops_body() -> dict[str, Any]:
    return json.loads(STOPS_FIXTURE.read_text(encoding="utf-8"))


def test_board_request_asks_for_stops_and_the_picker_does_not() -> None:
    assert ("includeCompleteStopSeq", "1") in build_departure_params(
        MEIDLING, 30, with_stops=True
    )
    assert ("includeCompleteStopSeq", "1") not in build_departure_params(MEIDLING, 100)


async def test_board_refresh_fetches_with_stops(hass: HomeAssistant) -> None:
    board = TimetableBoard(hass, MEIDLING, ALL_PAIRS)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_stops_body()) as fetch,
    ):
        await board.async_refresh()
    params = fetch.await_args.args[1]
    assert ("includeCompleteStopSeq", "1") in params


def test_parse_onward_stops() -> None:
    """Names read like a board; a single onward stop arrives as a bare point."""
    s80, s2, s60 = parse_departure_body(_stops_body(), MEIDLING, VIENNA)

    assert s80.towards == "Leobersdorf"
    assert [stop.name for stop in s80.stops[:4]] == [
        "Hetzendorf",
        "Atzgersdorf",
        "Liesing",
        "Perchtoldsdorf",
    ]
    assert s80.stops[0].stop_id == 60200511
    assert s80.stops[-1].name == "Leobersdorf"
    # EFA collapses the S2's one onward stop into a mapping.
    assert [stop.name for stop in s2.stops] == ["Hauptbahnhof"]
    assert len(s60.stops) == 10


def test_parse_onward_stops_skips_nameless_points() -> None:
    body = _stops_body()
    row = body["departureList"][0]
    row["onwardStopSeq"][0] = {"name": "", "ref": {"id": "1"}}
    row["onwardStopSeq"][1]["ref"] = {"id": "not-a-number"}
    row["onwardStopSeq"].append("garbage")
    stops = parse_departure_body(body, MEIDLING, VIENNA)[0].stops
    assert stops[0].name == "Atzgersdorf"
    assert stops[0].stop_id is None


def test_timetable_rows_carry_stops_ahead() -> None:
    """Terminus only when the last stop is the destination; WL transfers by DIVA."""
    s80, s2, _ = parse_departure_body(_stops_body(), MEIDLING, VIENNA)
    catalogue = SimpleNamespace(
        trip_patterns=SimpleNamespace(lines_at_diva={60200788: ("60A", "U6")})
    )
    rows = timetable_departures(
        (s80, s2),
        frozenset({("S80", "H"), ("S2", "R")}),
        S80_AT - timedelta(minutes=2),
        catalogue=catalogue,  # type: ignore[arg-type]
    )
    by_line = {row.line: row for row in rows}

    trail = by_line["S80"].stops_ahead
    assert trail is not None
    assert trail[2] == {"name": "Liesing", "lines": ["60A", "U6"]}
    assert trail[-1] == {"name": "Leobersdorf", "is_terminus": True}
    assert all("is_terminus" not in stop for stop in trail[:-1])
    # The S2's sequence stops at Hauptbahnhof but the train runs on to
    # Wolfsthal: no terminus flag on a stop that isn't one.
    assert by_line["S2"].stops_ahead == [{"name": "Hauptbahnhof"}]


def test_timetable_trail_lists_the_other_s_bahn_lines() -> None:
    """S-Bahn transfers follow the U-Bahn; the train's own line is left out."""
    s80, _, _ = parse_departure_body(_stops_body(), MEIDLING, VIENNA)
    # Mode-sorted, as the real index is.
    catalogue = SimpleNamespace(
        trip_patterns=SimpleNamespace(lines_at_diva={60200788: ("U6", "60A")})
    )
    rows = timetable_departures(
        (s80,),
        frozenset({("S80", "H")}),
        S80_AT - timedelta(minutes=2),
        catalogue=catalogue,  # type: ignore[arg-type]
        s_bahn_lines_at_diva={
            60200788: ("S1", "S2", "S80"),
            60200511: ("S80",),
        },
    )
    trail = rows[0].stops_ahead
    assert trail is not None
    assert trail[0] == {"name": "Hetzendorf"}
    assert trail[2] == {"name": "Liesing", "lines": ["U6", "S1", "S2", "60A"]}


def test_timetable_rows_without_stops_have_no_trail() -> None:
    rows = timetable_departures(
        (_planned(),), frozenset({("S1", "R")}), FIRST_TRAIN, catalogue=None
    )
    assert rows[0].stops_ahead is None
    assert "stops_ahead" not in rows[0].to_dict()


def test_timetable_trail_is_capped_without_a_terminus() -> None:
    stops = tuple(PlannedStop(name=f"Stop {i}", stop_id=None) for i in range(40))
    dep = PlannedDeparture(
        line="S1",
        towards="Stop 39",
        direction="R",
        platform=None,
        planned=FIRST_TRAIN + timedelta(minutes=5),
        stops=stops,
    )
    rows = timetable_departures((dep,), frozenset({("S1", "R")}), FIRST_TRAIN)
    trail = rows[0].stops_ahead
    assert trail is not None
    assert len(trail) == MAX_STOPS_AHEAD
    assert all("is_terminus" not in stop for stop in trail)


def test_terminus_ignores_a_bracketed_qualifier() -> None:
    """An S1 towards Hauptbahnhof ends at "Hauptbahnhof (S-Bahn-Station)"."""
    dep = PlannedDeparture(
        line="S1",
        towards="Hauptbahnhof",
        direction="H",
        platform=None,
        planned=FIRST_TRAIN + timedelta(minutes=5),
        stops=(PlannedStop(name="Hauptbahnhof (S-Bahn-Station)", stop_id=None),),
    )
    lookalike = PlannedDeparture(
        line="S2",
        towards="Hauptbahnhof",
        direction="R",
        platform=None,
        planned=FIRST_TRAIN + timedelta(minutes=6),
        stops=(PlannedStop(name="Hauptbahnhof Süd", stop_id=None),),
    )
    rows = timetable_departures(
        (dep, lookalike), frozenset({("S1", "H"), ("S2", "R")}), FIRST_TRAIN
    )
    assert rows[0].stops_ahead == [
        {"name": "Hauptbahnhof (S-Bahn-Station)", "is_terminus": True}
    ]
    assert rows[1].stops_ahead == [{"name": "Hauptbahnhof Süd"}]


async def test_short_answer_is_complete_and_not_refetched_early(
    hass: HomeAssistant,
) -> None:
    """Fewer trains than asked for is all there is; only age triggers a refetch."""
    board = TimetableBoard(hass, PRATERSTERN, ALL_PAIRS)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value={"departureList": None}),
    ):
        await board.async_refresh()
    assert board.departures == ()
    fetched = board.fetched_at
    assert fetched is not None
    assert not board.is_due(fetched + timedelta(minutes=6))
    # Two hours, not the 30 minutes that cost a busy stop 48 requests a day.
    assert not board.is_due(fetched + timedelta(minutes=30))
    assert not board.is_due(fetched + TIMETABLE_MAX_AGE - timedelta(minutes=1))
    assert board.is_due(fetched + TIMETABLE_MAX_AGE)


def _mixed_body(rows: list[tuple[str, int]]) -> dict[str, Any]:
    """A batch of `(line, minutes after FIRST_TRAIN)` rows, all direction R.

    Built from the fixture's first row so the parser sees the shape it
    expects, with only the line and the time varied. Lets a test set the
    share of the answer that belongs to a board's picked lines, which is
    the whole point of the running-low rule.
    """
    body = _body()
    template = body["departureList"][0]
    out = []
    for line, minutes in rows:
        when = FIRST_TRAIN + timedelta(minutes=minutes)
        row = json.loads(json.dumps(template))
        row["servingLine"]["number"] = line
        row["servingLine"]["symbol"] = line
        row["dateTime"] |= {
            "year": str(when.year),
            "month": str(when.month),
            "day": str(when.day),
            "hour": str(when.hour),
            "minute": str(when.minute),
        }
        out.append(row)
    body["departureList"] = out
    return body


async def test_running_low_counts_the_picked_lines_not_the_batch(
    hass: HomeAssistant,
) -> None:
    """A board refetches when its own rows run out, not the whole answer's.

    The stop here runs S1 every 10 minutes and the board's S2 every 20, so
    the picked line is a third of a full batch — the shape of a busy
    interchange where a board tracks one or two of its S-Bahn lines.
    Counting the batch, the answer still looks full long after the board
    is down to its last rows, which is exactly the state that left a real
    Meidling board showing two departures.
    """
    board = TimetableBoard(hass, PRATERSTERN, frozenset({("S2", "R")}))
    rows = [("S1", n * 10) for n in range(40)] + [("S2", n * 20) for n in range(20)]
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_mixed_body(rows)),
    ):
        assert await board.async_refresh() is True
    assert board._tracked_at_fetch == 20

    # Far enough in that 15 of the 20 S2 have gone: five left on the board,
    # under the threshold, while the batch as a whole still holds plenty.
    now = FIRST_TRAIN + timedelta(minutes=299)
    board._fetched_at = now - timedelta(minutes=30)
    board._attempted_at = board._fetched_at
    assert board._tracked_upcoming(now) == 5
    assert sum(1 for dep in board.departures if dep.planned >= now) == 15
    assert board.is_due(now)


async def test_a_batch_already_thin_for_the_picked_lines_waits_for_the_age(
    hass: HomeAssistant,
) -> None:
    """Thin on arrival means the stop is short, not the batch.

    A line that has finished for the day, or one closed for works, leaves a
    board permanently under the threshold. Refetching cannot conjure a
    train, so only the age rule applies — otherwise the board would ask
    again every five minutes for the rest of the day.
    """
    board = TimetableBoard(hass, PRATERSTERN, frozenset({("S2", "R")}))
    rows = [("S1", n * 10) for n in range(58)] + [("S2", 5), ("S2", 25)]
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_mixed_body(rows)),
    ):
        assert await board.async_refresh() is True
    assert board._complete is False  # the server cut the answer; it has more
    assert board._tracked_at_fetch == 2

    now = FIRST_TRAIN + timedelta(minutes=60)
    board._fetched_at = now - timedelta(minutes=30)
    board._attempted_at = board._fetched_at
    assert board._tracked_upcoming(now) == 0  # nothing left to show
    assert not board.is_due(now)
    assert board.is_due(board._fetched_at + TIMETABLE_MAX_AGE)


@pytest.mark.parametrize(
    ("rows", "complete", "due"),
    [
        (TIMETABLE_DEPARTURES_REQUESTED, False, True),
        (TIMETABLE_DEPARTURES_REQUESTED - 1, True, False),
    ],
    ids=["full batch", "one short"],
)
async def test_complete_guard_gates_the_running_low_rule(
    hass: HomeAssistant, rows: int, complete: bool, due: bool
) -> None:
    """One row short of the ask turns the running-low rule off.

    Both batches are nearly spent — four trains still ahead, under
    TIMETABLE_MIN_UPCOMING — so the only thing separating them is whether
    the server cut the answer at the requested size. A full one may have
    more behind it and is worth refetching; a short one was everything the
    server had, and asking again in five minutes would not add a train.
    """
    board = TimetableBoard(hass, PRATERSTERN, ALL_PAIRS)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_padded_body(rows)),
    ):
        assert await board.async_refresh() is True
    assert len(board.departures) == rows
    assert board._complete is complete

    # Past the retry spacing and well inside TIMETABLE_MAX_AGE, so the
    # running-low rule is the only thing left that can answer.
    board._fetched_at = FIRST_TRAIN + timedelta(minutes=60)
    board._attempted_at = board._fetched_at
    now = FIRST_TRAIN + timedelta(minutes=66)
    assert sum(1 for dep in board.departures if dep.planned >= now) == 4
    assert board.is_due(now) is due
    # The age rule outranks the guard either way.
    assert board.is_due(board._fetched_at + TIMETABLE_MAX_AGE)


async def test_refresh_asks_for_the_size_the_complete_guard_compares_against(
    hass: HomeAssistant,
) -> None:
    """The request's `limit` is the number `_complete` is measured against.

    `_complete` reads "the server gave everything it had" out of
    `len(answer) < TIMETABLE_DEPARTURES_REQUESTED`, which only says that
    while the same constant is what the request asked for. Were the two to
    drift, the board would be pinned to one branch of `is_due` forever:
    a smaller ask never fills, so the running-low rule would be dead; a
    larger one always fills, so it would fire on every spent batch.
    """
    board = TimetableBoard(hass, PRATERSTERN, ALL_PAIRS)
    fetch = AsyncMock(return_value=_body())
    with patch(_COOLDOWN, new_callable=AsyncMock), patch(_FETCH, fetch):
        await board.async_refresh()
    params = dict(fetch.await_args.args[1])
    assert params["limit"] == str(TIMETABLE_DEPARTURES_REQUESTED)


async def test_refresh_does_not_hide_a_monitor_failure(hass: HomeAssistant) -> None:
    """A timetable landing after a failed poll must not flip the board back."""
    entry = make_entry({CONF_LINES: ["S1|R"]})
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value={"departureList": None}),
    ):
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        await hass.async_block_till_done(wait_background_tasks=True)
    assert coordinator.last_update_success

    coordinator.batch_set_error(UpdateFailed("down"))
    assert not coordinator.last_update_success
    board = coordinator.timetable
    assert board is not None
    with (
        patch.object(board, "async_refresh", new_callable=AsyncMock, return_value=True),
        patch.object(coordinator, "async_set_updated_data") as push,
    ):
        await coordinator._async_refresh_timetable(board)
    push.assert_not_called()
    assert not coordinator.last_update_success
