"""Tests for the "Time to leave" sensor and the night's last connection.

`routing_last_connection_breitensee_praterstern.json` is a real arrive-by
04:00 answer with buses excluded, from 2026-09-15: the last usable trip
leaves 00:20 (S45, then S7), and two trips wait out the night for the first
morning U-Bahn (00:50 → 04:43 and 00:50 → 04:45).
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from unittest.mock import AsyncMock
from zoneinfo import ZoneInfo

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.wiener_linien_austria.routing import (
    RoutingError,
    last_connection,
    parse_trip_body,
)

from .conftest import async_setup_entry_and_wait, route_entry, routing_body

VIENNA = ZoneInfo("Europe/Vienna")
LAST = "routing_last_connection_breitensee_praterstern.json"
ARRIVE_BY = datetime(2026, 9, 16, 4, 0, tzinfo=VIENNA)
LEAVE = "binary_sensor.westbahnhof_praterstern_time_to_leave"
NEXT = "sensor.westbahnhof_praterstern_next_connection"


def _at(hour: int, minute: int, day: int = 15) -> datetime:
    return datetime(2026, 9, day, hour, minute, tzinfo=VIENNA)


# ---------------------------------------------------------------------------
# Last connection
# ---------------------------------------------------------------------------


def test_last_connection_skips_trips_that_wait_for_the_morning() -> None:
    trips = parse_trip_body(routing_body(LAST), VIENNA)
    best = last_connection(trips, _at(23, 30), ARRIVE_BY, timedelta(minutes=60))
    assert best is not None
    assert best.departure == _at(0, 20, day=16)
    assert [leg.line for leg in best.legs] == ["S45", "S7"]
    # With that one gone too, nothing usable is left.
    assert (
        last_connection(trips, _at(0, 22, day=16), ARRIVE_BY, timedelta(minutes=60))
        is None
    )
    # Without the wait filter the overnight trips would win.
    overnight = last_connection(
        trips, _at(23, 30), _at(6, 0, day=16), timedelta(hours=6)
    )
    assert overnight is not None
    assert overnight.departure == _at(0, 50, day=16)


def _answers(fetch: AsyncMock, *, last: Any = None) -> list[dict[str, str]]:
    """Answer the night query with `last`, everything else with no trips left."""
    calls: list[dict[str, str]] = []

    async def answer(_session: Any, params: Any, _ua: str) -> dict[str, Any]:
        query = dict(params)
        calls.append(query)
        if query["itdTripDateTimeDepArr"] == "arr":
            if isinstance(last, Exception):
                raise last
            return routing_body(LAST)
        return routing_body()

    fetch.side_effect = answer
    return calls


async def test_route_looks_up_the_last_connection_once_a_night(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to("2026-09-15 21:30:00+00:00")  # 23:30 in Vienna
    calls = _answers(fetch)
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)

    night = [call for call in calls if call["itdTripDateTimeDepArr"] == "arr"]
    assert len(night) == 1
    assert (night[0]["itdDate"], night[0]["itdTime"]) == ("20260916", "0400")
    assert (
        night[0]["exclMOT_5"] == night[0]["exclMOT_6"] == night[0]["exclMOT_7"] == "1"
    )
    attrs = hass.states.get(NEXT).attributes
    assert attrs["last_connection"]["departure"].startswith("2026-09-16T00:20")

    # Further refreshes that night reuse it.
    await entry.runtime_data.async_refresh()
    await entry.runtime_data.async_refresh()
    assert len([c for c in calls if c["itdTripDateTimeDepArr"] == "arr"]) == 1

    # Once it has left, it's gone, still without asking again.
    freezer.move_to("2026-09-15 22:25:00+00:00")  # 00:25
    await entry.runtime_data.async_refresh()
    assert hass.states.get(NEXT).attributes["last_connection"] is None
    assert len([c for c in calls if c["itdTripDateTimeDepArr"] == "arr"]) == 1


async def test_no_night_query_during_the_day_and_no_retry_after_a_failure(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to("2026-09-15 10:00:00+00:00")  # 12:00
    calls = _answers(fetch, last=RoutingError("api_timeout", {"seconds": "20"}))
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    assert all(call["itdTripDateTimeDepArr"] == "dep" for call in calls)
    assert hass.states.get(NEXT).attributes["last_connection"] is None

    freezer.move_to("2026-09-15 20:05:00+00:00")  # 22:05
    await entry.runtime_data.async_refresh()
    await entry.runtime_data.async_refresh()
    assert len([c for c in calls if c["itdTripDateTimeDepArr"] == "arr"]) == 1
    assert hass.states.get(NEXT).state != "unavailable"
    assert hass.states.get(NEXT).attributes["last_connection"] is None


# ---------------------------------------------------------------------------
# Time to leave
# ---------------------------------------------------------------------------


async def test_time_to_leave_follows_the_next_connection(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to("2026-09-14 05:50:00+00:00")  # 07:50, first trip 07:57
    await async_setup_entry_and_wait(hass, route_entry())
    state = hass.states.get(LEAVE)
    assert state.state == "off"
    assert state.attributes["leave_minutes"] == 5
    assert state.attributes["leave_at"].startswith("2026-09-14T07:52")
    assert state.attributes["departure"].startswith("2026-09-14T07:57")
    assert state.attributes["lines"] == ["U3", "U1"]

    freezer.move_to("2026-09-14 05:52:00+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(LEAVE).state == "on"

    # 07:57 leaves; the 08:00 is already inside its own window.
    freezer.move_to("2026-09-14 05:57:00+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    state = hass.states.get(LEAVE)
    assert state.state == "on"
    assert state.attributes["departure"].startswith("2026-09-14T08:00")

    # Past every connection: off, with nothing left to point at.
    freezer.move_to("2026-09-14 07:00:00+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    state = hass.states.get(LEAVE)
    assert state.state == "off"
    assert state.attributes["departure"] is None


async def test_time_to_leave_uses_the_route_setting(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to("2026-09-14 05:50:00+00:00")
    entry = route_entry(leave_minutes=10)
    await async_setup_entry_and_wait(hass, entry)
    assert hass.states.get(LEAVE).state == "on"
    assert hass.states.get(LEAVE).attributes["leave_minutes"] == 10
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
