"""Tests for the route card's ad-hoc mode: WebSocket commands and planner."""

from __future__ import annotations

import asyncio
import json
from collections.abc import Generator
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.wiener_linien_austria import adhoc
from custom_components.wiener_linien_austria.const import (
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_ENTRY_TYPE,
    CONF_ORIGIN_DIVA,
    CONF_ORIGIN_NAME,
    DOMAIN,
    ENTRY_TYPE_ROUTE,
)
from custom_components.wiener_linien_austria.routing import RoutingError
from custom_components.wiener_linien_austria.websocket import STOPS_CACHE_KEY

FIXTURES = Path(__file__).parent / "fixtures"
FETCH = (
    "custom_components.wiener_linien_austria.route_coordinator.async_fetch_trip_body"
)
NOW = "2026-09-14 05:50:00+00:00"
STEPHANSPLATZ = 60201012
SCHWARZENBERGPLATZ = 60200123
TAUBSTUMMENGASSE = 60201468


def _body() -> dict[str, Any]:
    return json.loads((FIXTURES / "routing_westbahnhof_praterstern.json").read_text())


@pytest.fixture
def frozen(freezer: FrozenDateTimeFactory) -> FrozenDateTimeFactory:
    freezer.move_to(NOW)
    return freezer


@pytest.fixture
def fetch() -> Generator[AsyncMock]:
    with patch(FETCH, new_callable=AsyncMock, return_value=_body()) as mock:
        yield mock


async def _load_route(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={
            CONF_ENTRY_TYPE: ENTRY_TYPE_ROUTE,
            CONF_ORIGIN_DIVA: TAUBSTUMMENGASSE,
            CONF_ORIGIN_NAME: "Taubstummengasse",
            CONF_DESTINATION_DIVA: STEPHANSPLATZ,
            CONF_DESTINATION_NAME: "Stephansplatz",
        },
        title="Taubstummengasse → Stephansplatz",
        version=2,
        unique_id="route_adhoc_test",
    )
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
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
    freezer.move_to(NOW)
    await _load_route(hass)
    return client


async def _plan(client: Any, **payload: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": "wiener_linien_austria/plan", **payload})
    response: dict[str, Any] = await client.receive_json()
    return response


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


async def test_plan_is_cached_within_the_minute(
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

    # The next minute is a new request.
    freezer.tick(60)
    await _plan(client, origin=STEPHANSPLATZ, destination=SCHWARZENBERGPLATZ)
    assert fetch.await_count == before + 3


async def test_concurrent_identical_plans_share_one_request(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    before = fetch.await_count
    gate = asyncio.Event()

    async def slow(*_args: Any) -> dict[str, Any]:
        await gate.wait()
        return _body()

    fetch.side_effect = slow
    planner = adhoc.async_get_planner(hass)
    options = adhoc.RouteOptions(
        origin_diva=STEPHANSPLATZ, destination_diva=SCHWARZENBERGPLATZ
    )
    waiters = [asyncio.ensure_future(planner.async_plan(options)) for _ in range(3)]
    await asyncio.sleep(0)
    gate.set()
    plans = await asyncio.gather(*waiters)
    assert fetch.await_count == before + 1
    assert plans[0] is plans[1] is plans[2]


async def test_a_cancelled_waiter_does_not_cancel_the_shared_request(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await _load_route(hass)
    gate = asyncio.Event()

    async def slow(*_args: Any) -> dict[str, Any]:
        await gate.wait()
        return _body()

    fetch.side_effect = slow
    planner = adhoc.async_get_planner(hass)
    options = adhoc.RouteOptions(
        origin_diva=STEPHANSPLATZ, destination_diva=SCHWARZENBERGPLATZ
    )
    leaving = asyncio.ensure_future(planner.async_plan(options))
    staying = asyncio.ensure_future(planner.async_plan(options))
    await asyncio.sleep(0)
    leaving.cancel()
    gate.set()
    plan = await staying
    assert len(plan.trips) > 0


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
