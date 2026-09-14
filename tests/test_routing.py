"""Tests for the A→B routing client, parser and scoring (routing.py)."""

from __future__ import annotations

import copy
import json
from datetime import datetime, time, timedelta
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock
from zoneinfo import ZoneInfo

import aiohttp
import pytest

from custom_components.wiener_linien_austria.routing import (
    RouteLeg,
    RouteOptions,
    RouteStop,
    RoutingError,
    Trip,
    assess_transfers,
    async_fetch_trip_body,
    build_trip_params,
    parse_time_option,
    parse_trip_body,
    rank_trips,
    route_type_option,
    within_window,
)

from .conftest import make_response_cm

FIXTURES = Path(__file__).parent / "fixtures"
VIENNA = ZoneInfo("Europe/Vienna")


def _load(name: str) -> dict[str, Any]:
    return json.loads((FIXTURES / name).read_text())


def _at(hour: int, minute: int, day: int = 14) -> datetime:
    return datetime(2026, 9, day, hour, minute, tzinfo=VIENNA)


def _stop(name: str, when: datetime | None, rt: datetime | None = None) -> RouteStop:
    return RouteStop(name=name, stop_id=None, platform=None, planned=when, estimated=rt)


def _leg(
    start: datetime,
    end: datetime,
    *,
    walk_after: int = 0,
    walk: bool = False,
    line: str = "U1",
    cancelled: bool = False,
    end_rt: datetime | None = None,
) -> RouteLeg:
    return RouteLeg(
        walk=walk,
        line=None if walk else line,
        type="walk" if walk else "ptMetro",
        product=None,
        towards=None,
        origin=_stop("A", start),
        destination=_stop("B", end, end_rt),
        realtime=False,
        stop_count=2,
        walk_after_minutes=walk_after,
        cancelled=cancelled,
    )


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


def test_parses_metro_trips_with_transfer_walk() -> None:
    """Westbahnhof → Praterstern: U3 then U1, footpath on the arriving leg."""
    trips = parse_trip_body(_load("routing_westbahnhof_praterstern.json"), VIENNA)
    assert len(trips) == 4
    first = trips[0]
    assert [leg.line for leg in first.legs] == ["U3", "U1"]
    assert [leg.type for leg in first.legs] == ["ptMetro", "ptMetro"]
    assert first.legs[0].origin.name == "Westbahnhof"
    assert first.legs[0].towards == "Simmering"
    assert first.legs[0].origin.platform == "1"
    assert first.legs[0].walk_after_minutes == 4
    assert first.departure == _at(7, 57)
    assert first.arrival == _at(8, 11)
    assert first.duration_minutes == 14
    assert first.interchanges == 1
    # stopSeq carries both ends; five stops ridden from Westbahnhof.
    assert first.legs[0].stop_count == 5


def test_zero_slack_transfer_is_tight() -> None:
    """The server plans arrive 08:04 + 4 min walk + depart 08:08 as normal."""
    trips = parse_trip_body(_load("routing_westbahnhof_praterstern.json"), VIENNA)
    transfer = trips[0].transfers[0]
    assert transfer.at == "Stephansplatz"
    assert transfer.walk_minutes == 4
    assert transfer.slack_minutes == 0
    assert transfer.risk == "tight"
    assert trips[0].risk == "tight"


def test_zero_buffer_setting_makes_the_same_transfer_ok() -> None:
    trips = parse_trip_body(
        _load("routing_westbahnhof_praterstern.json"),
        VIENNA,
        min_transfer_minutes=0,
    )
    assert trips[0].transfers[0].risk == "ok"


def test_realtime_delay_turns_transfer_at_risk() -> None:
    """A two-minute late arrival breaks a zero-slack change."""
    body = copy.deepcopy(_load("routing_westbahnhof_praterstern.json"))
    arriving = body["trips"][0]["legs"][0]["points"][1]["dateTime"]
    arriving["rtTime"] = "08:06"
    arriving["rtDate"] = arriving["date"]
    trips = parse_trip_body(body, VIENNA)
    assert trips[0].legs[0].destination.delay_minutes == 2
    assert trips[0].transfers[0].slack_minutes == -2
    assert trips[0].transfers[0].risk == "at_risk"
    assert trips[0].risk == "at_risk"


def test_mode_types_cover_tram_sbahn_and_nightbus() -> None:
    types = {
        leg.type
        for trip in parse_trip_body(
            _load("routing_breitensee_schottentor.json"), VIENNA
        )
        for leg in trip.legs
    }
    assert {"ptTram", "ptMetro", "ptTrainS"} <= types
    night = parse_trip_body(_load("routing_nightbus_floridsdorf_meidling.json"), VIENNA)
    assert night[0].legs[0].type == "ptBusNight"
    assert night[0].legs[0].line == "N31"


def test_to_dict_is_json_serialisable() -> None:
    trips = parse_trip_body(_load("routing_breitensee_schottentor.json"), VIENNA)
    payload = json.loads(json.dumps([trip.to_dict() for trip in trips]))
    assert payload[0]["legs"][0]["origin"]["planned"].endswith("+02:00")
    assert payload[0]["transfers"][0]["risk"] in {"ok", "tight", "at_risk"}


def test_single_trip_object_shape_is_accepted() -> None:
    """EFA collapses a one-element list into {"trip": {...}}."""
    body = copy.deepcopy(_load("routing_westbahnhof_praterstern.json"))
    body["trips"] = {"trip": body["trips"][0]}
    assert len(parse_trip_body(body, VIENNA)) == 1


def test_walk_leg_and_cancellation_are_recognised() -> None:
    body = copy.deepcopy(_load("routing_westbahnhof_praterstern.json"))
    leg = body["trips"][0]["legs"][1]
    leg["mode"]["type"] = "100"
    body["trips"][1]["legs"][0]["mode"]["realtimeStatus"] = "TRIP_CANCELLED"
    trips = parse_trip_body(body, VIENNA)
    assert trips[0].legs[1].walk is True
    assert trips[0].legs[1].line is None
    assert trips[0].interchanges == 0
    assert trips[1].cancelled is True


@pytest.mark.parametrize(
    ("fixture", "key"),
    [
        ("routing_too_close.json", "route_too_close"),
        ("routing_stop_invalid.json", "route_stop_invalid"),
    ],
)
def test_upstream_errors_raise_translated(fixture: str, key: str) -> None:
    with pytest.raises(RoutingError) as err:
        parse_trip_body(_load(fixture), VIENNA)
    assert err.value.translation_key == key


def test_stop_invalid_names_which_end() -> None:
    with pytest.raises(RoutingError) as err:
        parse_trip_body(_load("routing_stop_invalid.json"), VIENNA)
    assert err.value.placeholders == {"which": "origin"}


def test_unknown_and_outside_timetable_codes() -> None:
    body = {"itdMessageList": [_message(-4001, "date outside")]}
    with pytest.raises(RoutingError) as err:
        parse_trip_body(body, VIENNA)
    assert err.value.translation_key == "route_outside_timetable"

    body = {"itdMessageList": [_message(-9999, "odd")]}
    with pytest.raises(RoutingError) as err:
        parse_trip_body(body, VIENNA)
    assert err.value.translation_key == "route_upstream_error"
    assert err.value.placeholders == {"code": "-9999", "value": "odd"}


def test_informational_codes_and_missing_trips() -> None:
    """A non-negative code is not an error; no trips at all still is."""
    body = {"itdMessageList": [_message(1, "info"), {"message": "not a list"}]}
    with pytest.raises(RoutingError) as err:
        parse_trip_body(body, VIENNA)
    assert err.value.translation_key == "route_no_connection"


def test_trips_without_usable_legs_raise_no_connection() -> None:
    body = {
        "trips": [
            "junk",
            {"legs": [{"points": [{}]}, "junk", {"points": ["a", "b"]}]},
        ]
    }
    with pytest.raises(RoutingError) as err:
        parse_trip_body(body, VIENNA)
    assert err.value.translation_key == "route_no_connection"


def test_malformed_times_and_codes_degrade_quietly() -> None:
    body = copy.deepcopy(_load("routing_westbahnhof_praterstern.json"))
    leg = body["trips"][0]["legs"][0]
    leg["points"][0]["dateTime"] = {"date": "99.99.2026", "time": "xx"}
    leg["footpath"] = [{"position": "AFTER", "duration": "n/a"}, "junk"]
    body["itdMessageList"] = [{"message": [{"name": "code", "value": "abc"}]}]
    trips = parse_trip_body(body, VIENNA)
    assert trips[0].legs[0].origin.planned is None
    assert trips[0].legs[0].duration_minutes is None
    assert trips[0].legs[0].walk_after_minutes == 0


def _message(code: int, text: str) -> dict[str, Any]:
    return {
        "message": [
            {"name": "code", "value": str(code)},
            {"name": "error", "value": text},
        ]
    }


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------


def test_walk_legs_count_towards_transfer_walk() -> None:
    legs = [
        _leg(_at(8, 0), _at(8, 10)),
        _leg(_at(8, 10), _at(8, 13), walk=True),
        _leg(_at(8, 20), _at(8, 30)),
    ]
    transfers = assess_transfers(legs, 2)
    assert transfers[0].walk_minutes == 3
    assert transfers[0].slack_minutes == 7
    assert transfers[0].risk == "ok"


def test_transfer_with_missing_times_is_skipped() -> None:
    legs = [
        RouteLeg(
            walk=False,
            line="U1",
            type="ptMetro",
            product=None,
            towards=None,
            origin=_stop("A", _at(8, 0)),
            destination=_stop("B", None),
            realtime=False,
            stop_count=1,
            walk_after_minutes=0,
        ),
        _leg(_at(8, 20), _at(8, 30)),
    ]
    assert assess_transfers(legs, 2) == []


def test_rank_drops_departed_cancelled_and_dominated() -> None:
    now = _at(8, 0)
    gone = Trip(legs=[_leg(_at(7, 50), _at(8, 10))])
    cancelled = Trip(legs=[_leg(_at(8, 5), _at(8, 15), cancelled=True)])
    fast = Trip(legs=[_leg(_at(8, 5), _at(8, 20))])
    # Same departure, later arrival, one more change: dominated by `fast`.
    slow = Trip(legs=[_leg(_at(8, 5), _at(8, 15)), _leg(_at(8, 18), _at(8, 25))])
    later = Trip(legs=[_leg(_at(8, 10), _at(8, 26))])
    ranked = rank_trips([later, slow, gone, cancelled, fast], now)
    assert ranked == [fast, later]


def test_rank_keeps_a_safer_alternative() -> None:
    """An earlier but riskier trip must not hide a safe one."""
    now = _at(8, 0)
    risky = Trip(legs=[_leg(_at(8, 5), _at(8, 10)), _leg(_at(8, 10), _at(8, 20))])
    risky.transfers = assess_transfers(risky.legs, 2)
    safe = Trip(legs=[_leg(_at(8, 5), _at(8, 10)), _leg(_at(8, 15), _at(8, 22))])
    safe.transfers = assess_transfers(safe.legs, 2)
    assert risky.risk == "tight"
    assert safe.risk == "ok"
    assert rank_trips([risky, safe], now) == [risky, safe]


def test_trip_without_legs_has_no_times() -> None:
    empty = Trip(legs=[])
    assert empty.departure is None
    assert empty.arrival is None
    assert empty.duration_minutes is None
    assert rank_trips([empty], _at(8, 0)) == []


# ---------------------------------------------------------------------------
# Request building + transport
# ---------------------------------------------------------------------------


def test_build_params_defaults() -> None:
    params = dict(build_trip_params(RouteOptions(60201468, 60201040), _at(8, 5)))
    assert params["name_origin"] == "60201468"
    assert params["name_destination"] == "60201040"
    assert params["itdDate"] == "20260914"
    assert params["itdTime"] == "0805"
    assert params["itdTripDateTimeDepArr"] == "dep"
    assert params["outputFormat"] == "JSON"
    assert params["useRealtime"] == "1"
    assert "maxChanges" not in params
    assert "excludedMeans" not in params


def test_build_params_options() -> None:
    options = RouteOptions(
        1,
        2,
        route_type="leastinterchange",
        max_changes="1",
        walk_speed="slow",
        excluded_means=("4", "5"),
    )
    params = build_trip_params(options, _at(8, 5), arrive_by=True, language="en-GB")
    as_dict = dict(params)
    # Stored lower-case, sent in the server's own spelling.
    assert as_dict["routeType"] == "LEASTINTERCHANGE"
    assert as_dict["maxChanges"] == "1"
    assert as_dict["changeSpeed"] == "slow"
    assert as_dict["itdTripDateTimeDepArr"] == "arr"
    assert as_dict["language"] == "en"
    assert ("exclMOT_4", "1") in params
    assert ("exclMOT_5", "1") in params
    assert as_dict["excludedMeans"] == "checkbox"


def _session_returning(resp: Any) -> MagicMock:
    session = MagicMock()
    session.get = MagicMock(return_value=make_response_cm(resp))
    return session


async def test_fetch_returns_body_and_sends_user_agent() -> None:
    resp = MagicMock(status=200)
    resp.json = AsyncMock(return_value={"trips": []})
    session = _session_returning(resp)
    body = await async_fetch_trip_body(session, [("a", "b")], "UA/1")
    assert body == {"trips": []}
    kwargs = session.get.call_args.kwargs
    assert kwargs["headers"]["User-Agent"] == "UA/1"
    assert "Accept-Encoding" not in kwargs["headers"]
    resp.json.assert_awaited_once_with(content_type=None)


@pytest.mark.parametrize(
    ("setup", "key"),
    [
        (lambda r: setattr(r, "status", 503), "api_http_error"),
        (
            lambda r: setattr(r, "json", AsyncMock(side_effect=ValueError("bad"))),
            "api_invalid_response",
        ),
        (
            lambda r: setattr(r, "json", AsyncMock(return_value=[])),
            "api_invalid_response",
        ),
    ],
)
async def test_fetch_maps_response_failures(setup: Any, key: str) -> None:
    resp = MagicMock(status=200, reason="Service Unavailable")
    resp.json = AsyncMock(return_value={})
    setup(resp)
    with pytest.raises(RoutingError) as err:
        await async_fetch_trip_body(_session_returning(resp), [], "UA")
    assert err.value.translation_key == key


@pytest.mark.parametrize(
    ("exc", "key"),
    [
        (TimeoutError(), "api_timeout"),
        (aiohttp.ClientConnectionError("down"), "api_connection_error"),
    ],
)
async def test_fetch_maps_transport_failures(exc: Exception, key: str) -> None:
    session = MagicMock()
    session.get = MagicMock(side_effect=exc)
    with pytest.raises(RoutingError) as err:
        await async_fetch_trip_body(session, [], "UA")
    assert err.value.translation_key == key


# ---------------------------------------------------------------------------
# Active window
# ---------------------------------------------------------------------------


def test_window_unset_means_always_on_selected_days() -> None:
    monday = _at(3, 0)  # 2026-09-14 is a Monday
    assert within_window(monday, None, None, None) is True
    assert within_window(monday, None, None, ["tue"]) is False


def test_window_same_day() -> None:
    start, end = time(6, 30), time(9, 0)
    assert within_window(_at(7, 0), start, end, ["mon"]) is True
    assert within_window(_at(9, 30), start, end, ["mon"]) is False
    assert within_window(_at(7, 0), start, end, ["tue"]) is False


def test_window_overnight_uses_the_start_day() -> None:
    start, end = time(22, 0), time(2, 0)
    friday_night = _at(23, 0, day=18)
    saturday_small_hours = _at(1, 0, day=19)
    saturday_noon = _at(12, 0, day=19)
    assert within_window(friday_night, start, end, ["fri"]) is True
    assert within_window(saturday_small_hours, start, end, ["fri"]) is True
    assert within_window(saturday_small_hours, start, end, ["sat"]) is False
    assert within_window(saturday_noon, start, end, ["fri", "sat"]) is False


def test_parse_time_option() -> None:
    assert parse_time_option("06:30:00") == time(6, 30)
    assert parse_time_option("06:30") == time(6, 30)
    assert parse_time_option("") is None
    assert parse_time_option(None) is None
    assert parse_time_option("late") is None


def test_effective_prefers_realtime() -> None:
    stop = _stop("A", _at(8, 0), _at(8, 3))
    assert stop.effective == _at(8, 3)
    assert stop.delay_minutes == 3
    assert _stop("A", _at(8, 0)).delay_minutes is None
    assert _at(8, 3) - timedelta(minutes=3) == _at(8, 0)


def test_route_options_from_config_fills_defaults_and_drops_unknowns() -> None:
    options = RouteOptions.from_config(
        1,
        2,
        {
            "route_type": "",
            "excluded_means": ["tram", "hovercraft"],
            "min_transfer_minutes": "not a number",
        },
    )
    assert options == RouteOptions(
        origin_diva=1, destination_diva=2, excluded_means=("4",)
    )
    # An entry saved with the EFA spelling reads as the stored spelling, so
    # both share cache entries; an unknown value never reaches the server.
    assert RouteOptions.from_config(
        1, 2, {"route_type": "LEASTWALKING"}
    ).route_type == ("leastwalking")
    assert route_type_option(" LeastInterchange ") == "leastinterchange"
    assert route_type_option("FASTEST") == "leasttime"
    assert route_type_option(None) == "leasttime"
    assert RouteOptions.from_config(
        1, 2, {"walk_speed": "slow", "min_transfer_minutes": "5"}
    ) == RouteOptions(
        origin_diva=1, destination_diva=2, walk_speed="slow", min_transfer_minutes=5
    )
