"""Tests for the route card's ad-hoc mode: WebSocket commands and planner."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import timedelta
from typing import Any
from unittest.mock import AsyncMock, patch

import aiohttp
import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.wiener_linien_austria import adhoc
from custom_components.wiener_linien_austria.alerts import TrafficInfo
from custom_components.wiener_linien_austria.const import DOMAIN, TRAFFIC_INFO_KEY
from custom_components.wiener_linien_austria.routing import RouteOptions, RoutingError
from custom_components.wiener_linien_austria.websocket import STOPS_CACHE_KEY

from .conftest import (
    ROUTE_NOW,
    async_setup_entry_and_wait,
    route_entry,
    routing_body,
)

STEPHANSPLATZ = 60201012
SCHWARZENBERGPLATZ = 60200123


async def _load_route(hass: HomeAssistant) -> MockConfigEntry:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    return entry


async def _connect(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
) -> Any:
    """Authenticate, then freeze the clock and load a route entry.

    Order matters: the auth token is stamped with the real time, and a clock
    frozen before its issue time rejects it.
    """
    client = await hass_ws_client(hass)
    freezer.move_to(ROUTE_NOW)
    await _load_route(hass)
    return client


async def _plan(client: Any, **payload: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": "wiener_linien_austria/plan", **payload})
    response: dict[str, Any] = await client.receive_json()
    return response


def _query(n: int = 0, *, reverse: bool = False) -> RouteOptions:
    """A distinct query per `n`, so each one is a cache miss."""
    origin, destination = STEPHANSPLATZ, SCHWARZENBERGPLATZ
    if reverse:
        origin, destination = destination, origin
    return RouteOptions(
        origin_diva=origin, destination_diva=destination, min_transfer_minutes=n
    )


def _gated(fetch: AsyncMock) -> asyncio.Event:
    """Hold every trip request until the returned event is set."""
    gate = asyncio.Event()

    async def slow(*_args: Any) -> dict[str, Any]:
        await gate.wait()
        return routing_body()

    fetch.side_effect = slow
    return gate


async def _until(condition: Callable[[], bool]) -> None:
    """Let the loop run until `condition` holds, without waiting on real time."""
    for _ in range(100):
        if condition():
            return
        await asyncio.sleep(0)
    raise AssertionError("condition never held")


async def test_stops_lists_trackable_stops(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    await client.send_json_auto_id({"type": "wiener_linien_austria/stops"})
    response = await client.receive_json()
    assert response["success"]
    values = {stop["value"] for stop in response["result"]["stops"]}
    assert str(STEPHANSPLATZ) in values
    assert all(stop["label"] for stop in response["result"]["stops"])

    # Built once per catalogue, then served from memory.
    cached = hass.data[DOMAIN][STOPS_CACHE_KEY]
    await client.send_json_auto_id({"type": "wiener_linien_austria/stops"})
    assert (await client.receive_json())["success"]
    assert hass.data[DOMAIN][STOPS_CACHE_KEY] is cached


@pytest.mark.parametrize(
    "request_payload",
    [
        {"type": "wiener_linien_austria/stops"},
        {
            "type": "wiener_linien_austria/plan",
            "origin": STEPHANSPLATZ,
            "destination": SCHWARZENBERGPLATZ,
        },
    ],
)
async def test_commands_report_an_unavailable_catalogue(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
    request_payload: dict[str, Any],
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    before = fetch.await_count
    with patch(
        "custom_components.wiener_linien_austria.static.async_get_catalogue",
        side_effect=aiohttp.ClientError,
    ):
        await client.send_json_auto_id(request_payload)
        response = await client.receive_json()
    assert response["error"]["code"] == "catalogue_unavailable"
    assert response["error"]["translation_key"] == "adhoc_catalogue_unavailable"
    # Nothing to validate stops against, so nothing is planned either.
    assert fetch.await_count == before


async def test_plan_accepts_either_spelling_of_route_type(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    before = fetch.await_count
    ends = {"origin": STEPHANSPLATZ, "destination": SCHWARZENBERGPLATZ}
    assert (await _plan(client, **ends, route_type="LEASTWALKING"))["success"]
    assert dict(fetch.call_args.args[1])["routeType"] == "LEASTWALKING"
    # The same query in the stored spelling is a cache hit, not a new request.
    assert (await _plan(client, **ends, route_type="leastwalking"))["success"]
    assert fetch.await_count == before + 1


async def test_commands_answer_not_loaded_without_an_entry(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    # Component setup registers the commands; with no entry nothing is loaded,
    # which is also the state after the integration has been removed.
    assert await async_setup_component(hass, DOMAIN, {})
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "wiener_linien_austria/stops"})
    assert (await client.receive_json())["error"]["code"] == "not_loaded"
    response = await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert response["error"]["code"] == "not_loaded"


async def test_plan_answers_in_the_route_sensor_shape(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    response = await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert response["success"], response
    result = response["result"]
    assert result["origin"] == "Stephansplatz"
    assert result["destination"] == "Schwarzenbergplatz"
    assert result["fetched_at"].startswith("2026-09-14T05:50:00")
    assert len(result["trips"]) == 4
    assert isinstance(result["line_colors"], dict)
    assert result["attribution"]
    params = dict(fetch.call_args.args[1])
    assert params["name_origin"] == str(STEPHANSPLATZ)
    assert params["name_destination"] == str(SCHWARZENBERGPLATZ)


async def test_plan_with_no_ride_carries_no_disruptions(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    hass.data[DOMAIN][TRAFFIC_INFO_KEY] = [
        TrafficInfo(
            name="T1",
            title="U4: Kurze Unterbrechung",
            description="Linie U4.",
            related_lines=["U4"],
            time_start=None,
            time_end=None,
            status="active",
        )
    ]
    fetch.return_value = {"trips": None}
    response = await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert response["success"], response
    assert response["result"]["trips"] == []
    # An empty line set must not read as "every line".
    assert response["result"]["traffic_info"] == []


async def test_plan_is_cached_for_the_ttl_across_minutes(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    before = fetch.await_count
    for _ in range(3):
        assert (
            await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
        )["success"]
    assert fetch.await_count == before + 1

    # Different options are a different query.
    await _plan(
        client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ, walk_speed="slow"
    )
    assert fetch.await_count == before + 2

    # Crossing into the next minute inside the TTL still shares the answer,
    # so dashboards refreshing at different moments share one request.
    freezer.tick(45)
    response = await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert response["success"]
    assert response["result"]["stale"] is False
    assert fetch.await_count == before + 2

    # Past the TTL it's a new request.
    freezer.tick(16)
    await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert fetch.await_count == before + 3


async def test_a_cached_plan_drops_connections_that_left(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    planner = adhoc.async_get_planner(hass)
    fresh = await planner.async_plan(_query())
    first = fresh.trips[0].departure
    assert first is not None
    # The fixture's first connection may leave later than one TTL from now,
    # so widen the TTL (and the purge with it) to reach the cache-hit path.
    frozen.move_to(first + timedelta(minutes=1, seconds=1))
    with (
        patch.object(adhoc, "ADHOC_CACHE_TTL_SECONDS", 24 * 3600),
        patch.object(adhoc, "ADHOC_STALE_MAX_SECONDS", 24 * 3600),
    ):
        served = await planner.async_plan(_query())
    assert all(t.departure is None or t.departure > first for t in served.trips)
    assert len(served.trips) < len(fresh.trips)


async def test_one_user_cannot_spend_everyones_budget(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    planner = adhoc.async_get_planner(hass)
    for n in range(adhoc.ADHOC_USER_BURST):
        await planner.async_plan(_query(n), user_id="tablet")
    with pytest.raises(adhoc.AdhocRateLimited) as err:
        await planner.async_plan(_query(99), user_id="tablet")
    # 60/h refills a token every 60 s.
    assert 0 < err.value.retry_after <= 60

    # Another user still has their own share of the instance budget.
    await planner.async_plan(_query(99), user_id="phone")


async def test_instance_budget_caps_all_users_together(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    planner = adhoc.async_get_planner(hass)
    for n in range(adhoc.ADHOC_BURST):
        await planner.async_plan(_query(n), user_id=f"user{n}")
    with pytest.raises(adhoc.AdhocRateLimited):
        await planner.async_plan(_query(reverse=True), user_id="someone_new")


async def test_spent_budget_serves_a_recent_plan_as_stale(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    hass.data[DOMAIN].pop(adhoc.ADHOC_PLANNER_KEY, None)
    # One token, refilled once an hour: nothing comes back during the test.
    with (
        patch.object(adhoc, "ADHOC_BURST", 1),
        patch.object(adhoc, "ADHOC_BUDGET_PER_HOUR", 1),
    ):
        first = await _plan(
            client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ
        )
        assert first["success"]
        before = fetch.await_count

        # Past the TTL, no token left: the last plan stands in, marked stale.
        freezer.tick(90)
        response = await _plan(
            client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ
        )
        assert response["success"], response
        result = response["result"]
        assert result["stale"] is True
        assert result["retry_after"] > 0
        assert result["fetched_at"] == first["result"]["fetched_at"]
        assert fetch.await_count == before

        # Too old to stand in: an error instead.
        freezer.tick(adhoc.ADHOC_STALE_MAX_SECONDS)
        response = await _plan(
            client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ
        )
    assert response["error"]["code"] == "rate_limited"


async def test_plans_too_old_to_serve_leave_memory(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    planner = adhoc.async_get_planner(hass)
    await planner.async_plan(_query())
    frozen.tick(adhoc.ADHOC_STALE_MAX_SECONDS)
    # Any later request purges it; the stop pair isn't kept on the side.
    await planner.async_plan(_query(reverse=True))
    assert [key[0] for key in planner._cache] == [_query(reverse=True)]


async def test_last_unload_forgets_plans_but_keeps_the_budget(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    hass.data.setdefault(DOMAIN, {}).pop(adhoc.ADHOC_PLANNER_KEY, None)
    with (
        patch.object(adhoc, "ADHOC_BURST", 2),
        patch.object(adhoc, "ADHOC_BUDGET_PER_HOUR", 1),
    ):
        entry = await _load_route(hass)
        planner = adhoc.async_get_planner(hass)
        await planner.async_plan(_query())

        assert await hass.config_entries.async_unload(entry.entry_id)
        await hass.async_block_till_done()
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        assert adhoc.async_get_planner(hass) is planner

        # The plan is gone, so the same query goes out again ...
        before = fetch.await_count
        await planner.async_plan(_query())
        assert fetch.await_count == before + 1
        # ... and that spent the second token: re-adding refilled nothing.
        with pytest.raises(adhoc.AdhocRateLimited):
            await planner.async_plan(_query(reverse=True))


async def test_a_clear_during_a_request_keeps_its_plan_out_of_the_cache(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    before = fetch.await_count
    gate = _gated(fetch)
    planner = adhoc.async_get_planner(hass)
    waiter = asyncio.ensure_future(planner.async_plan(_query()))
    await _until(lambda: fetch.await_count == before + 1)
    planner.async_clear_cache()
    gate.set()
    plan = await waiter
    assert plan.trips  # whoever waited still gets the answer
    await planner.async_plan(_query())
    assert fetch.await_count == before + 2


async def test_concurrent_identical_plans_share_one_request(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    before = fetch.await_count
    gate = _gated(fetch)
    planner = adhoc.async_get_planner(hass)
    waiters = [asyncio.ensure_future(planner.async_plan(_query())) for _ in range(3)]
    await _until(lambda: fetch.await_count >= before + 1)
    # Give every waiter the chance to start a request of its own; with the
    # request still held, none can have been answered from the cache.
    for _ in range(20):
        await asyncio.sleep(0)
    assert fetch.await_count == before + 1
    assert not any(waiter.done() for waiter in waiters)
    gate.set()
    plans = await asyncio.gather(*waiters)
    assert fetch.await_count == before + 1
    # Copies, since live times are applied per answer, but of one plan.
    assert plans[0] == plans[1] == plans[2]


async def test_a_cancelled_waiter_does_not_cancel_the_shared_request(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    before = fetch.await_count
    gate = _gated(fetch)
    planner = adhoc.async_get_planner(hass)
    leaving = asyncio.ensure_future(planner.async_plan(_query()))
    staying = asyncio.ensure_future(planner.async_plan(_query()))
    # Both are waiting on the one request before the first one leaves.
    await _until(lambda: fetch.await_count == before + 1)
    for _ in range(20):
        await asyncio.sleep(0)
    assert not leaving.done()
    assert not staying.done()
    leaving.cancel()
    gate.set()
    plan = await staying
    assert leaving.cancelled()
    assert len(plan.trips) > 0
    # The request ran to completion and was cached for the next caller.
    await planner.async_plan(_query())
    assert fetch.await_count == before + 1


@pytest.mark.parametrize(
    ("payload", "code"),
    [
        ({"origin": 1, "destination": STEPHANSPLATZ}, "invalid_stop"),
        ({"origin": STEPHANSPLATZ, "destination": STEPHANSPLATZ}, "same_stop"),
        (
            {
                "origin": STEPHANSPLATZ,
                "destination": SCHWARZENBERGPLATZ,
                "route_type": "X",
            },
            "invalid_format",
        ),
        (
            {
                "origin": STEPHANSPLATZ,
                "destination": SCHWARZENBERGPLATZ,
                "min_transfer_minutes": 99,
            },
            "invalid_format",
        ),
        (
            {
                "origin": STEPHANSPLATZ,
                "destination": SCHWARZENBERGPLATZ,
                "datetime": "tomorrow morning",
            },
            "invalid_format",
        ),
    ],
)
async def test_plan_rejects_bad_input(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
    payload: dict[str, Any],
    code: str,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    before = fetch.await_count
    response = await _plan(client, **payload)
    assert response["error"]["code"] == code
    assert fetch.await_count == before


async def test_plan_budget_runs_out_and_says_when(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    hass.data[DOMAIN].pop(adhoc.ADHOC_PLANNER_KEY, None)
    with patch.object(adhoc, "ADHOC_BURST", 1):
        assert (
            await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
        )["success"]
        # A cache hit costs nothing ...
        assert (
            await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
        )["success"]
        # ... a new query needs a token.
        response = await _plan(
            client, origin=SCHWARZENBERGPLATZ, destination=STEPHANSPLATZ
        )
    error = response["error"]
    assert error["code"] == "rate_limited"
    assert error["translation_key"] == "adhoc_rate_limited"
    assert 0 < int(error["translation_placeholders"]["retry_after"]) <= 30


async def test_plan_upstream_failure_and_empty_answer(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)

    fetch.side_effect = RoutingError("api_timeout", {"seconds": "20"})
    response = await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert response["error"]["code"] == "upstream"
    assert response["error"]["translation_key"] == "api_timeout"

    # A failure isn't cached; the retry reaches the upstream again.
    fetch.side_effect = None
    fetch.return_value = {"trips": None}
    response = await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert response["success"], response
    assert response["result"]["trips"] == []


@pytest.mark.parametrize(
    "key", ["route_too_close", "route_stop_invalid", "route_outside_timetable"]
)
async def test_plan_refused_query_is_not_an_outage(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
    key: str,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    fetch.side_effect = RoutingError(key)
    response = await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    # Its own code, so the card stops retrying what can't succeed.
    assert response["error"]["code"] == "invalid_query"
    assert response["error"]["translation_key"] == key


async def test_last_unload_drops_the_stop_list(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await client.send_json_auto_id({"type": "wiener_linien_austria/stops"})
    assert (await client.receive_json())["success"]
    assert STOPS_CACHE_KEY in hass.data[DOMAIN]
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert STOPS_CACHE_KEY not in hass.data[DOMAIN]


async def test_plan_at_a_chosen_time(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    before = fetch.await_count
    ends = {"origin": STEPHANSPLATZ, "destination": SCHWARZENBERGPLATZ}

    # No offset: Vienna wall clock, whatever zone HA itself is in.
    response = await _plan(client, **ends, datetime="2026-09-15T07:30")
    assert response["success"], response
    result = response["result"]
    assert result["planned_for"] == "2026-09-15T07:30:00+02:00"
    assert result["arrive_by"] is False
    params = dict(fetch.call_args.args[1])
    assert (params["itdDate"], params["itdTime"]) == ("20260915", "0730")
    assert params["itdTripDateTimeDepArr"] == "dep"

    # The same minute is a cache hit; arriving by it is a different query.
    assert (await _plan(client, **ends, datetime="2026-09-15T07:30:00"))["success"]
    assert fetch.await_count == before + 1
    response = await _plan(client, **ends, datetime="2026-09-15T07:30", arrive_by=True)
    assert response["result"]["arrive_by"] is True
    assert dict(fetch.call_args.args[1])["itdTripDateTimeDepArr"] == "arr"
    assert fetch.await_count == before + 2

    # An explicit offset is honoured, not reread as Vienna time.
    await _plan(client, **ends, datetime="2026-09-15T05:45:00+00:00")
    assert dict(fetch.call_args.args[1])["itdTime"] == "0745"

    # "Now" plans don't carry a time.
    response = await _plan(client, **ends)
    assert response["result"]["planned_for"] is None


async def test_a_plan_for_a_chosen_time_keeps_connections_that_left(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await _connect(hass, hass_ws_client, freezer)
    ends = {"origin": STEPHANSPLATZ, "destination": SCHWARZENBERGPLATZ}
    # Two hours after every connection in the captured answer has left.
    freezer.tick(timedelta(hours=2))
    now = await _plan(client, **ends)
    assert now["result"]["trips"] == []

    planned = await _plan(client, **ends, datetime="2026-09-14T07:50")
    assert len(planned["result"]["trips"]) == 4

    # Served again from the cache, still whole.
    freezer.tick(30)
    again = await _plan(client, **ends, datetime="2026-09-14T07:50")
    assert again["result"]["trips"] == planned["result"]["trips"]
