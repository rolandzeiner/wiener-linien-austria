"""Tests for step-free routes: request flags, lifts on the way, lift outages.

The fixture is a real step-free answer from 2026-09-15 06:29, stripped down:
Westbahnhof → Praterstern by U3 and U2, with a lift down to the U3 platform,
a lift up at the Volkstheater change and a lift up at Praterstern.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from unittest.mock import AsyncMock
from zoneinfo import ZoneInfo

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.wiener_linien_austria.alerts import ElevatorInfo
from custom_components.wiener_linien_austria.const import DOMAIN, ELEVATOR_INFO_KEY
from custom_components.wiener_linien_austria.route_coordinator import (
    route_trip_attributes,
)
from custom_components.wiener_linien_austria.routing import (
    AccessStep,
    RouteOptions,
    build_trip_params,
    parse_trip_body,
)
from custom_components.wiener_linien_austria.static import (
    CATALOGUE_KEY,
    StaticCatalogue,
    Station,
)

from .conftest import ROUTE_NOW, async_setup_entry_and_wait, route_entry, routing_body

VIENNA = ZoneInfo("Europe/Vienna")
WESTBAHNHOF, VOLKSTHEATER, PRATERSTERN = "60201468", "60201430", "60201040"
STEPHANSPLATZ, SCHWARZENBERGPLATZ = 60201012, 60200123
ROUTE_NOW_DT = datetime(2026, 9, 15, 6, 30, tzinfo=VIENNA)


def _trip() -> Any:
    body = routing_body("routing_step_free_westbahnhof_praterstern.json")
    return parse_trip_body(body, VIENNA)[0]


def _outage(rbls: list[int], station: str = "Volkstheater") -> ElevatorInfo:
    return ElevatorInfo(
        name="A1",
        station=station,
        description="Ausgang Burggasse",
        reason="Reparatur",
        status="außer Betrieb",
        related_lines=["U2", "U3"],
        related_stops=rbls,
        time_start=None,
        time_end=None,
    )


def test_step_free_asks_for_it_and_only_when_set() -> None:
    options = RouteOptions.from_config(1, 2, {"step_free": True})
    params = dict(build_trip_params(options, ROUTE_NOW_DT))
    assert params["imparedOptionsActive"] == "1"
    assert params["wheelchair"] == params["noSolidStairs"] == "on"
    assert params["noEscalators"] == params["lowPlatformVhcl"] == "on"
    assert "noElevators" not in params
    plain = dict(build_trip_params(RouteOptions(1, 2), ROUTE_NOW_DT))
    assert "imparedOptionsActive" not in plain
    # Only a real boolean turns it on; an entry saved before the option
    # existed reads as off.
    assert RouteOptions.from_config(1, 2, {"step_free": "yes"}).step_free is False
    assert RouteOptions.from_config(1, 2, {}).step_free is False


def test_lifts_and_low_floor_rides_are_parsed() -> None:
    trip = _trip()
    to_platform, u3, u2, from_platform = trip.legs
    assert to_platform.walk and from_platform.walk
    assert to_platform.access == (AccessStep("elevator", "down", WESTBAHNHOF),)
    assert from_platform.access == (AccessStep("elevator", "up", PRATERSTERN),)
    assert u3.low_floor and u2.low_floor
    assert not to_platform.low_floor
    # The change's lift arrives on the ride before it.
    assert u3.access == ()
    assert u3.access_after == (AccessStep("elevator", "up", VOLKSTHEATER),)
    assert trip.transfers[0].access == u3.access_after
    # "Leave in" counts from the walk to the platform, not the train.
    assert trip.departure == to_platform.origin.planned

    leg = u3.to_dict()
    assert leg["low_floor"] is True
    assert leg["access"] == []
    assert to_platform.to_dict()["access"] == [
        {"kind": "elevator", "level": "down", "stop_id": WESTBAHNHOF}
    ]
    assert trip.to_dict()["transfers"][0]["access"] == [
        {"kind": "elevator", "level": "up", "stop_id": VOLKSTHEATER}
    ]


def test_a_malformed_footpath_is_skipped() -> None:
    body = routing_body("routing_step_free_westbahnhof_praterstern.json")
    first = body["trips"][0]["legs"][0]
    first["footpath"] = [
        "junk",
        {
            "position": "IDEST",
            "footpathElem": ["junk", {"level": "UP"}, {"type": "RAMP"}],
        },
    ]
    first["attrs"] = [{"name": "PlanLowFloorVehicle", "value": "0"}]
    walk = parse_trip_body(body, VIENNA)[0].legs[0]
    assert walk.access == (AccessStep("ramp", None, None),)


async def test_lift_outages_on_the_trip_are_published(hass: HomeAssistant) -> None:
    trip = _trip()
    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[CATALOGUE_KEY] = StaticCatalogue(
        stations_by_diva={
            int(VOLKSTHEATER): Station(
                diva=int(VOLKSTHEATER),
                name="Volkstheater",
                municipality="Wien",
                longitude=16.36,
                latitude=48.21,
                rbls=[4206, 4909],
            ),
        },
        last_fetched="2026-09-15T00:00:00+00:00",
    )
    domain_data[ELEVATOR_INFO_KEY] = [_outage([4909]), _outage([1], "Karlsplatz")]
    outages = route_trip_attributes(hass, [trip])["elevator_info"]
    assert [outage["station"] for outage in outages] == ["Volkstheater"]
    assert outages[0]["stop_ids"] == [VOLKSTHEATER]

    # No catalogue, or no lift on the trip: nothing to match.
    del domain_data[CATALOGUE_KEY]
    assert route_trip_attributes(hass, [trip])["elevator_info"] == []
    plain = parse_trip_body(routing_body(), VIENNA)
    assert route_trip_attributes(hass, plain)["elevator_info"] == []


async def test_plan_command_takes_step_free(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    freezer: FrozenDateTimeFactory,
    fetch: AsyncMock,
) -> None:
    client = await hass_ws_client(hass)
    freezer.move_to(ROUTE_NOW)
    await async_setup_entry_and_wait(hass, route_entry())
    before = fetch.await_count
    ends = {"origin": STEPHANSPLATZ, "destination": SCHWARZENBERGPLATZ}
    for step_free in (False, True, True):
        await client.send_json_auto_id(
            {"type": "wiener_linien_austria/plan", **ends, "step_free": step_free}
        )
        response = await client.receive_json()
        assert response["success"], response
        assert response["result"]["step_free"] is step_free
    # Step-free is its own query, then a cache hit.
    assert fetch.await_count == before + 2
    assert dict(fetch.call_args.args[1])["wheelchair"] == "on"


async def test_route_entry_plans_step_free(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await async_setup_entry_and_wait(hass, route_entry(step_free=True))
    assert dict(fetch.call_args.args[1])["lowPlatformVhcl"] == "on"
