"""Tests for live times on planned connections (live.py).

Fixtures are real answers from 2026-09-15 06:15, stripped down: a trip
Breitensee → Schottentor (tram 49 R, then U2 R at Volkstheater, plus an
S-Bahn alternative) and the `/monitor` rows for both boarding stops, with
tram 49 H at the same station to keep the directions honest.
"""

from __future__ import annotations

import asyncio
import copy
import json
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch
from zoneinfo import ZoneInfo

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant

from custom_components.wiener_linien_austria import adhoc, live
from custom_components.wiener_linien_austria.batch import MonitorBatchGroup
from custom_components.wiener_linien_austria.const import (
    BATCH_REGISTRY_KEY,
    CONF_RBLS,
    DOMAIN,
)
from custom_components.wiener_linien_austria.live import (
    LiveRow,
    apply_live,
    async_get_live_board,
    parse_monitor_rows,
    rbls_for_trips,
)
from custom_components.wiener_linien_austria.routing import (
    RouteOptions,
    Trip,
    parse_trip_body,
)
from custom_components.wiener_linien_austria.static import (
    CATALOGUE_KEY,
    StaticCatalogue,
    Station,
    TripPattern,
    TripPatternIndex,
)

from .conftest import (
    FIXTURES,
    async_setup_entry_and_wait,
    make_response_cm,
    route_entry,
    routing_body,
)
from .test_batch import _member, _ok_response, _patch_get

VIENNA = ZoneInfo("Europe/Vienna")
NOW = datetime(2026, 9, 15, 6, 15, tzinfo=VIENNA)
BREITENSEE, VOLKSTHEATER = 60200166, 60201430
TRAM_49_R, TRAM_49_H, U2_R = 1471, 1452, 4206
# Bound before the autouse `live_fetch` fixture patches the module attribute.
REAL_MONITOR_FETCH = live.async_fetch_monitor_body


def _monitor_body() -> dict[str, Any]:
    body: dict[str, Any] = json.loads(
        (FIXTURES / "monitor_live_breitensee.json").read_text()
    )
    return body


def _trips() -> list[Trip]:
    return parse_trip_body(
        routing_body("routing_live_breitensee_schottentor.json"), VIENNA
    )


def _rows(body: dict[str, Any] | None = None) -> list[LiveRow]:
    return [
        row
        for rows in parse_monitor_rows(body or _monitor_body()).values()
        for row in rows
    ]


def _catalogue() -> StaticCatalogue:
    """Breitensee and Volkstheater with a platform no used line stops at."""
    return StaticCatalogue(
        stations_by_diva={
            BREITENSEE: Station(
                diva=BREITENSEE,
                name="Breitensee",
                municipality="Wien",
                longitude=16.30,
                latitude=48.21,
                rbls=[TRAM_49_R, TRAM_49_H, 9001],
            ),
            VOLKSTHEATER: Station(
                diva=VOLKSTHEATER,
                name="Volkstheater",
                municipality="Wien",
                longitude=16.36,
                latitude=48.21,
                rbls=[U2_R, 9002],
            ),
        },
        last_fetched="2026-09-15T00:00:00+00:00",
        trip_patterns=TripPatternIndex(
            patterns_by_line={
                49: [
                    TripPattern(49, 1, 1, (TRAM_49_H,)),
                    TripPattern(49, 2, 2, (TRAM_49_R,)),
                ]
            },
            lines_by_label={"49": 49},
        ),
    )


def _delay(body: dict[str, Any], rbl: int, planned: str, real: str) -> dict[str, Any]:
    """`body` with one departure's real time moved."""
    body = copy.deepcopy(body)
    for monitor in body["data"]["monitors"]:
        if monitor["locationStop"]["properties"]["attributes"]["rbl"] != rbl:
            continue
        for line in monitor["lines"]:
            for departure in line["departures"]["departure"]:
                if departure["departureTime"]["timePlanned"].startswith(planned):
                    departure["departureTime"]["timeReal"] = real
    return body


# ---------------------------------------------------------------------------
# Parsing and matching
# ---------------------------------------------------------------------------


def test_rides_carry_direction_and_operator() -> None:
    trips = _trips()
    tram, metro = trips[2].legs
    assert (tram.line, tram.direction, tram.wiener_linien) == ("49", "R", True)
    assert (metro.line, metro.direction) == ("U2", "R")
    sbahn = trips[1].legs[0]
    assert (sbahn.line, sbahn.wiener_linien) == ("S45", False)
    leg = tram.to_dict()
    assert leg["direction"] == "R"
    assert leg["next_departures"] == []
    assert leg["headway_minutes"] is None


def test_monitor_rows_skip_what_cannot_be_matched() -> None:
    body = _monitor_body()
    body["data"]["monitors"].append({"locationStop": {"properties": {"name": "1"}}})
    body["data"]["monitors"][0]["lines"].append({"name": "", "direction": "H"})
    rows = parse_monitor_rows(body)
    assert set(rows) == {TRAM_49_H, TRAM_49_R, U2_R}
    assert rows[TRAM_49_R][0].planned == datetime(2026, 9, 15, 6, 17, 30, tzinfo=VIENNA)
    assert parse_monitor_rows({"data": None}) == {}


def test_live_rows_give_rides_their_departure_and_frequency() -> None:
    timetable = _trips()
    trips = apply_live(timetable, _rows(), 2)

    tram, metro = trips[2].legs
    assert tram.realtime and metro.realtime
    # 06:17:30 planned, 06:17:31 real: one second late is on time, not a
    # minute late because the planner prints 06:17.
    assert tram.origin.estimated == datetime(2026, 9, 15, 6, 17, 1, tzinfo=VIENNA)
    assert tram.origin.delay_minutes == 0
    assert [t.strftime("%H:%M") for t in tram.next_departures] == ["06:23", "06:29"]
    assert tram.headway_minutes == 5
    assert metro.headway_minutes == 5
    assert tram.to_dict()["next_departures"][0].startswith("2026-09-15T06:23:40")

    # A ride the board no longer lists stays on the timetable, but still
    # learns how often its line runs.
    early = trips[0].legs[0]
    assert early.realtime is False
    assert early.headway_minutes == 5
    # S-Bahn isn't on the boards at all.
    assert trips[1].legs[0] == timetable[1].legs[0]
    # The input is left alone.
    assert timetable[2].legs[0].realtime is False


def test_a_delay_moves_the_arrival_and_rescores_the_change() -> None:
    timetable = _trips()
    assert timetable[2].risk == "tight"
    late = _delay(
        _monitor_body(), TRAM_49_R, "2026-09-15T06:17", "2026-09-15T06:20:30.000+0200"
    )
    trip = apply_live(timetable, _rows(late), 2)[2]
    tram = trip.legs[0]
    assert tram.origin.delay_minutes == 3
    assert tram.destination.estimated == datetime(2026, 9, 15, 6, 39, tzinfo=VIENNA)
    # Arrive 06:39, walk 3 min, U2 leaves 06:39:30: the change no longer fits.
    assert trip.transfers[0].risk == "at_risk"
    assert trip.risk == "at_risk"
    assert timetable[2].risk == "tight"


def test_directions_at_one_station_stay_apart() -> None:
    only_h = [row for row in _rows() if row.direction == "H"]
    trip = apply_live(_trips(), only_h, 2)[2]
    assert trip.legs[0].realtime is False
    assert trip.legs[0].headway_minutes is None


@pytest.mark.parametrize(
    ("planned", "matches"),
    [("06:17:50", True), ("06:18:10", True), ("06:16:05", True), ("06:19:00", False)],
)
def test_matching_allows_a_minute_but_never_the_next_vehicle(
    planned: str, matches: bool
) -> None:
    hour, minute, second = (int(part) for part in planned.split(":"))
    stamp = datetime(2026, 9, 15, hour, minute, second, tzinfo=VIENNA)
    row = LiveRow("60200166", "49", "R", stamp, stamp + timedelta(minutes=2))
    tram = apply_live(_trips(), [row], 2)[2].legs[0]
    assert tram.realtime is matches


def test_rbls_follow_the_rides_and_their_lines() -> None:
    trips = _trips()
    catalogue = _catalogue()
    # Tram 49 narrowed to its own platforms; U2 unknown to the patterns, so
    # every Volkstheater platform. S-Bahn and the 44 at an unknown station
    # add nothing.
    assert rbls_for_trips(catalogue, trips, NOW) == {TRAM_49_R, TRAM_49_H, U2_R, 9002}
    assert rbls_for_trips(None, trips, NOW) == set()
    # Rides beyond the board's horizon need nothing yet.
    assert rbls_for_trips(catalogue, trips, NOW - timedelta(hours=2)) == set()


# ---------------------------------------------------------------------------
# The board: when a request is made
# ---------------------------------------------------------------------------


def _with_batch(hass: HomeAssistant) -> None:
    group = MonitorBatchGroup(hass, 60)
    group.add_member(_member(hass, data={CONF_RBLS: [1]}, unique_id="board"))
    hass.data.setdefault(DOMAIN, {})[BATCH_REGISTRY_KEY] = {60: group}


async def test_without_a_board_one_call_serves_every_route(
    hass: HomeAssistant, live_fetch: AsyncMock
) -> None:
    live_fetch.return_value = _monitor_body()
    board = async_get_live_board(hass)
    board.lease("route:b", {U2_R})
    await board.async_ensure({TRAM_49_R}, cooldown=False)
    assert live_fetch.await_count == 1
    # Every stop that was due rode along.
    assert sorted(live_fetch.call_args.args[1]) == [TRAM_49_R, U2_R]
    await board.async_ensure({U2_R}, cooldown=False)
    assert live_fetch.await_count == 1
    assert board.rows_for({U2_R})

    with patch.object(live, "LIVE_REUSE_SECONDS", -1):
        await board.async_ensure({U2_R}, cooldown=True)
    assert live_fetch.await_count == 2


async def test_with_a_board_only_unseen_stops_cost_a_call(
    hass: HomeAssistant, live_fetch: AsyncMock
) -> None:
    _with_batch(hass)
    live_fetch.return_value = _monitor_body()
    board = async_get_live_board(hass)
    await board.async_ensure({TRAM_49_R}, cooldown=False)
    assert live_fetch.await_count == 1
    # Old rows mean the board's request is failing: another call won't help.
    with patch.object(live, "LIVE_REUSE_SECONDS", -1):
        await board.async_ensure({TRAM_49_R}, cooldown=False)
    assert live_fetch.await_count == 1
    # A stop the answer leaves out is recorded, so it can't cost a call on
    # every plan.
    await board.async_ensure({4242}, cooldown=False)
    await board.async_ensure({4242}, cooldown=False)
    assert live_fetch.await_count == 2
    assert board.rows_for({4242}) == []


async def test_a_failed_call_leaves_the_timetable(
    hass: HomeAssistant, live_fetch: AsyncMock
) -> None:
    live_fetch.side_effect = ValueError("monitor answered messageCode 316")
    board = async_get_live_board(hass)
    await board.async_ensure({TRAM_49_R}, cooldown=False)
    assert board.rows_for({TRAM_49_R}) == []


async def test_concurrent_plans_share_one_call(
    hass: HomeAssistant, live_fetch: AsyncMock
) -> None:
    gate = asyncio.Event()

    async def slow(*_args: Any) -> dict[str, Any]:
        await gate.wait()
        return _monitor_body()

    live_fetch.side_effect = slow
    board = async_get_live_board(hass)
    waiters = [
        asyncio.ensure_future(board.async_ensure({rbl}, cooldown=False))
        for rbl in (TRAM_49_R, TRAM_49_R, U2_R)
    ]
    for _ in range(10):
        await asyncio.sleep(0)
    gate.set()
    await asyncio.gather(*waiters)
    # The third caller's stop came back in the second call only if the first
    # didn't carry it; either way no caller asked twice.
    assert live_fetch.await_count <= 2
    assert board.rows_for({TRAM_49_R}) and board.rows_for({U2_R})


async def test_leases_expire_and_release(hass: HomeAssistant) -> None:
    board = async_get_live_board(hass)
    board.lease("route:a", {1, 2})
    board.lease("adhoc:x", {3}, ttl=0)
    board.lease("adhoc:y", {4}, ttl=300)
    assert board.leased_rbls() == {1, 2, 4}
    board.release("route:a")
    board.lease("adhoc:y", ())
    assert board.leased_rbls() == set()


async def test_one_failing_listener_does_not_starve_the_rest(
    hass: HomeAssistant,
) -> None:
    board = async_get_live_board(hass)
    calls: list[str] = []

    def broken() -> None:
        raise RuntimeError("boom")

    board.async_add_listener(broken)
    remove: Callable[[], None] = board.async_add_listener(lambda: calls.append("ok"))
    board.ingest(_monitor_body())
    assert calls == ["ok"]
    remove()
    board.ingest(_monitor_body())
    assert calls == ["ok"]


# ---------------------------------------------------------------------------
# Riding in the departure boards' request
# ---------------------------------------------------------------------------


async def test_leased_stops_ride_in_the_fastest_board_request(
    hass: HomeAssistant,
) -> None:
    fast = MonitorBatchGroup(hass, 30)
    slow = MonitorBatchGroup(hass, 120)
    fast.add_member(_member(hass, data={CONF_RBLS: [1]}, unique_id="fast"))
    slow.add_member(_member(hass, data={CONF_RBLS: [2]}, unique_id="slow"))
    hass.data.setdefault(DOMAIN, {})[BATCH_REGISTRY_KEY] = {30: fast, 120: slow}
    async_get_live_board(hass).lease("route:a", {TRAM_49_R})
    assert fast.union_rbls() == [1, TRAM_49_R]
    assert slow.union_rbls() == [2]
    # An empty group asks for nothing, leases or not.
    assert MonitorBatchGroup(hass, 10).union_rbls() == []


async def test_a_board_answer_is_recorded_for_routes(hass: HomeAssistant) -> None:
    group = MonitorBatchGroup(hass, 60)
    group.add_member(_member(hass, data={CONF_RBLS: [TRAM_49_R]}, unique_id="a"))
    hass.data.setdefault(DOMAIN, {})[BATCH_REGISTRY_KEY] = {60: group}
    mock_get = MagicMock(return_value=make_response_cm(_ok_response(_monitor_body())))
    with _patch_get(group, mock_get):
        await group.async_fetch()
    board = async_get_live_board(hass)
    assert {row.line for row in board.rows_for({TRAM_49_R, U2_R})} == {"49", "U2"}


# ---------------------------------------------------------------------------
# A route entry end to end
# ---------------------------------------------------------------------------


async def test_route_follows_the_board_without_replanning(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
    live_fetch: AsyncMock,
) -> None:
    # 06:17:30 Vienna: the S-Bahn has left, the 06:17 tram is the best trip.
    freezer.move_to("2026-09-15 04:17:30+00:00")
    hass.data.setdefault(DOMAIN, {})[CATALOGUE_KEY] = _catalogue()
    fetch.return_value = routing_body("routing_live_breitensee_schottentor.json")
    live_fetch.return_value = _monitor_body()
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    assert live_fetch.await_count == 1

    sensor = hass.states.get("sensor.westbahnhof_praterstern_next_connection")
    assert sensor is not None
    legs = {
        (leg["line"], leg["origin"]["planned"][11:16]): leg
        for trip in sensor.attributes["trips"]
        for leg in trip["legs"]
    }
    assert legs[("49", "06:17")]["realtime"] is True
    assert legs[("49", "06:17")]["headway_minutes"] == 5
    at_risk = "binary_sensor.westbahnhof_praterstern_connection_at_risk"

    # A board answer with the tram late flips the at-risk sensor, with no new
    # trip request and no request of its own.
    trips_before = fetch.await_count
    late = _delay(
        _monitor_body(), TRAM_49_R, "2026-09-15T06:17", "2026-09-15T06:20:30.000+0200"
    )
    board = async_get_live_board(hass)
    assert hass.states.get(at_risk).state == "off"
    board.ingest(late)
    await hass.async_block_till_done()
    assert hass.states.get(at_risk).state == "on"
    assert fetch.await_count == trips_before
    assert live_fetch.await_count == 1

    # Shutting the route down takes its stops off the shared request, and the
    # last entry unloading drops the rows too.
    assert board.leased_rbls()
    await entry.runtime_data.async_shutdown()
    assert not board.leased_rbls()
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert live.LIVE_BOARD_KEY not in hass.data[DOMAIN]


# ---------------------------------------------------------------------------
# The request and the edges that fail quietly
# ---------------------------------------------------------------------------


def _session(body: Any) -> MagicMock:
    session = MagicMock()
    session.get = MagicMock(return_value=make_response_cm(_ok_response(body)))
    return session


async def test_monitor_request_shape_and_refusals() -> None:
    session = _session(_monitor_body())
    body = await REAL_MONITOR_FETCH(session, [TRAM_49_R, U2_R], "UA/1")
    assert body["data"]["monitors"]
    args, kwargs = session.get.call_args
    assert args[0].endswith("/ogd_realtime/monitor")
    assert kwargs["params"] == [("stopId", "1471"), ("stopId", "4206")]
    assert kwargs["headers"]["User-Agent"] == "UA/1"

    with pytest.raises(ValueError, match="messageCode 316"):
        await REAL_MONITOR_FETCH(
            _session({"message": {"messageCode": 316}}), [1], "UA/1"
        )
    with pytest.raises(ValueError, match="expected an object"):
        await REAL_MONITOR_FETCH(_session([]), [1], "UA/1")


def test_malformed_rows_are_skipped() -> None:
    body = {
        "data": {
            "monitors": [
                "not a monitor",
                {
                    "locationStop": {
                        "properties": {"name": "60200166", "attributes": {"rbl": 7}}
                    },
                    "lines": [
                        "not a line",
                        {
                            "name": "49",
                            "direction": "R",
                            "departures": {
                                "departure": [
                                    {"departureTime": {}},
                                    {"departureTime": {"timePlanned": "06:17"}},
                                    {
                                        "departureTime": {
                                            "timePlanned": "2026-09-15T06:17:30"
                                        }
                                    },
                                    {
                                        "departureTime": {
                                            "timePlanned": "2026-09-15T06:17:30.000+0200",
                                            "timeReal": "soon",
                                        }
                                    },
                                ]
                            },
                        },
                    ],
                },
            ]
        }
    }
    rows = parse_monitor_rows(body)[7]
    assert len(rows) == 1
    assert rows[0].real is None


def _age_rows(board: live.LiveBoard, seconds: float) -> None:
    now = board._hass.loop.time()
    board._rows = {rbl: (now - seconds, rows) for rbl, (_, rows) in board._rows.items()}


async def test_rows_stay_live_for_a_slow_board_cadence(hass: HomeAssistant) -> None:
    """At a 600 s board cadence a 400 s old row is the newest there is.

    Leased stops only refresh on the fastest batch group's tick, so the
    fixed 180 s limit put routes on the timetable for most of each cycle.
    """
    board = async_get_live_board(hass)
    board.ingest(_monitor_body())
    _age_rows(board, 400)
    assert board.rows_for({TRAM_49_R}) == []  # no board running: 180 s rule

    group = MonitorBatchGroup(hass, 600)
    group.add_member(_member(hass, data={CONF_RBLS: [1]}, unique_id="slow"))
    hass.data.setdefault(DOMAIN, {})[BATCH_REGISTRY_KEY] = {600: group}
    assert board.rows_for({TRAM_49_R}) != []
    _age_rows(board, 600 + live.LIVE_ROW_GRACE_SECONDS + 1)
    assert board.rows_for({TRAM_49_R}) == []


async def test_rows_age_by_the_fastest_board(hass: HomeAssistant) -> None:
    """The fastest group carries the leases, so its cadence sets the limit."""
    fast = MonitorBatchGroup(hass, 60)
    fast.add_member(_member(hass, data={CONF_RBLS: [1]}, unique_id="fast"))
    slow = MonitorBatchGroup(hass, 600)
    slow.add_member(_member(hass, data={CONF_RBLS: [2]}, unique_id="slow"))
    hass.data.setdefault(DOMAIN, {})[BATCH_REGISTRY_KEY] = {60: fast, 600: slow}
    board = async_get_live_board(hass)
    board.ingest(_monitor_body())
    _age_rows(board, 400)
    assert board.rows_for({TRAM_49_R}) == []


async def test_rows_outlive_their_live_window_before_purge(hass: HomeAssistant) -> None:
    """A purged leased stop looks unanswered and earns a request of its own."""
    group = MonitorBatchGroup(hass, 600)
    group.add_member(_member(hass, data={CONF_RBLS: [1]}, unique_id="slow"))
    hass.data.setdefault(DOMAIN, {})[BATCH_REGISTRY_KEY] = {600: group}
    board = async_get_live_board(hass)
    board.ingest(_monitor_body())
    _age_rows(board, 700)
    board.ingest({"data": {"monitors": []}}, [U2_R])
    assert TRAM_49_R in board._rows


async def test_old_rows_are_purged(hass: HomeAssistant) -> None:
    board = async_get_live_board(hass)
    board.ingest(_monitor_body())
    with (
        patch.object(live, "LIVE_PURGE_SECONDS", 0),
        patch.object(live, "LIVE_ROW_MAX_AGE_SECONDS", 0),
    ):
        board.ingest({"data": {"monitors": []}}, [U2_R])
    assert board.rows_for({TRAM_49_R}) == []


async def test_recording_live_times_never_fails_a_board(hass: HomeAssistant) -> None:
    group = MonitorBatchGroup(hass, 60)
    group.add_member(_member(hass, data={CONF_RBLS: [TRAM_49_R]}, unique_id="a"))
    mock_get = MagicMock(return_value=make_response_cm(_ok_response(_monitor_body())))
    with (
        _patch_get(group, mock_get),
        patch.object(live.LiveBoard, "ingest", side_effect=RuntimeError("boom")),
    ):
        result = await group.async_fetch()
    assert result.body["data"]["monitors"]


async def test_a_group_outside_the_registry_still_carries_leases(
    hass: HomeAssistant,
) -> None:
    group = MonitorBatchGroup(hass, 60)
    group.add_member(_member(hass, data={CONF_RBLS: [1]}, unique_id="a"))
    async_get_live_board(hass).lease("route:a", {2})
    assert group.union_rbls() == [1, 2]
    hass.data.setdefault(DOMAIN, {})[BATCH_REGISTRY_KEY] = {
        60: MonitorBatchGroup(hass, 60)
    }
    assert group.union_rbls() == [1, 2]


async def test_on_demand_plans_lease_their_stops_and_reuse_the_rows(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
    live_fetch: AsyncMock,
) -> None:
    freezer.move_to("2026-09-15 04:17:30+00:00")
    await async_setup_entry_and_wait(hass, route_entry())
    hass.data[DOMAIN][CATALOGUE_KEY] = _catalogue()
    fetch.return_value = routing_body("routing_live_breitensee_schottentor.json")
    live_fetch.reset_mock()
    live_fetch.return_value = _monitor_body()
    planner = adhoc.async_get_planner(hass)
    query = RouteOptions(origin_diva=BREITENSEE, destination_diva=60201184)

    first = await planner.async_plan(query)
    assert live_fetch.await_count == 1
    assert any(leg.realtime for trip in first.trips for leg in trip.legs)
    board = async_get_live_board(hass)
    assert {TRAM_49_R, U2_R} <= board.leased_rbls()

    # A cache hit reads the rows it has: no request of either kind.
    trips_before = fetch.await_count
    again = await planner.async_plan(query)
    assert fetch.await_count == trips_before
    assert live_fetch.await_count == 1
    assert again.trips == first.trips


def test_stops_along_a_ride_carry_their_times_and_follow_a_delay() -> None:
    tram = _trips()[2].legs[0]
    # Breitensee and Volkstheater are the ride's own ends; 11 stops between.
    assert len(tram.stops) == 11
    first, last = tram.stops[0], tram.stops[-1]
    assert (first.name, first.stop_id) == ("Hütteldorfer Straße", "60201035")
    assert first.time == datetime(2026, 9, 15, 6, 19, tzinfo=VIENNA)
    assert last.name == "Stiftgasse"
    assert tram.to_dict()["stops"][0] == {
        "name": "Hütteldorfer Straße",
        "stop_id": "60201035",
        "time": "2026-09-15T06:19:00+02:00",
    }
    late = _delay(
        _monitor_body(), TRAM_49_R, "2026-09-15T06:17", "2026-09-15T06:20:30.000+0200"
    )
    live_tram = apply_live(_trips(), _rows(late), 2)[2].legs[0]
    assert live_tram.stops[0].time == datetime(2026, 9, 15, 6, 22, tzinfo=VIENNA)


def test_a_short_or_malformed_stop_list_gives_no_stops() -> None:
    body = routing_body("routing_live_breitensee_schottentor.json")
    leg = body["trips"][2]["legs"][0]
    seq = leg["stopSeq"]
    leg["stopSeq"] = [
        seq[0],
        "junk",
        {"name": "Wien X", "ref": {"depDateTime": "soon"}},
        seq[-1],
    ]
    stops = parse_trip_body(body, VIENNA)[2].legs[0].stops
    assert [(stop.name, stop.time) for stop in stops] == [("X", None)]
    leg["stopSeq"] = seq[:2]
    assert parse_trip_body(body, VIENNA)[2].legs[0].stops == ()
