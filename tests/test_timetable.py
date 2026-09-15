"""Tests for planned S-Bahn departures on departure boards (timetable.py)."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, patch
from zoneinfo import ZoneInfo

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.wiener_linien_austria.batch import BatchResult
from custom_components.wiener_linien_austria.config_flow import _line_label
from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    DOMAIN,
    LINE_TYPE_S_BAHN,
    ROUTING_DEPARTURE_ENDPOINT,
)
from custom_components.wiener_linien_austria.coordinator import (
    Departure,
    WienerLinienAustriaCoordinator,
    timetable_departures,
)
from custom_components.wiener_linien_austria.routing import RoutingError
from custom_components.wiener_linien_austria.timetable import (
    PlannedDeparture,
    TimetableBoard,
    async_fetch_planned_departures,
    async_probe_picker_rows,
    build_departure_params,
    parse_departure_body,
    picker_rows,
)

from .conftest import make_entry

VIENNA = ZoneInfo("Europe/Vienna")
PRATERSTERN = 60201040
FIXTURE = Path(__file__).parent / "fixtures" / "timetable_praterstern.json"
# The fixture's first train, the S2 at 15:14 Vienna time.
FIRST_TRAIN = datetime(2026, 9, 15, 15, 14, tzinfo=VIENNA)

_FETCH = "custom_components.wiener_linien_austria.timetable.async_fetch_trip_body"
_COOLDOWN = (
    "custom_components.wiener_linien_austria.timetable.async_enforce_routing_cooldown"
)


def _body() -> dict[str, Any]:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


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
    board = TimetableBoard(hass, PRATERSTERN)
    now = FIRST_TRAIN - timedelta(minutes=1)
    assert board.is_due(now)

    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()),
    ):
        assert await board.async_refresh() is True
    assert len(board.departures) == 12
    assert board.fetched_at is not None

    # Fresh and plenty ahead.
    assert not board.is_due(now + timedelta(minutes=10))
    # Too old.
    assert board.is_due(now + timedelta(minutes=30))
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
    board = TimetableBoard(hass, PRATERSTERN)
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
        await hass.async_block_till_done()

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

    with (
        patch(_COOLDOWN, new_callable=AsyncMock),
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()) as fetch,
    ):
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        # The refresh lands and re-publishes the tick with the S-Bahn in it.
        await hass.async_block_till_done()
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
        await hass.async_block_till_done()
        assert fetch.await_count == 1
        s2 = [dep for dep in coordinator.data.departures if dep.line == "S2"]
        assert s2[0].countdown == 4
        # S2 only: the fixture's S1/S3/S4 rows aren't picked.
        assert {dep.line for dep in coordinator.data.departures} == {"U1", "S2"}

        # Once the train's time has passed it is gone.
        freezer.move_to(FIRST_TRAIN + timedelta(seconds=1))
        coordinator.batch_apply(BatchResult(body=_monitor_body(), server_time=None))
        await hass.async_block_till_done()
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
        await hass.async_block_till_done()
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
