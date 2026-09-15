"""Tests for A→B route entries: coordinator, entities, flow, action, diagnostics."""

from __future__ import annotations

import copy
import json
import re
from datetime import timedelta
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch
from zoneinfo import ZoneInfo

import aiohttp
import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria import adhoc, rate_limit
from custom_components.wiener_linien_austria.config_flow import _probe_route
from custom_components.wiener_linien_austria.const import (
    CONF_ACTIVE_DAYS,
    CONF_ACTIVE_FROM,
    CONF_ACTIVE_TO,
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_ENTRY_TYPE,
    CONF_EXCLUDED_MEANS,
    CONF_LEAVE_MINUTES,
    CONF_MAX_CHANGES,
    CONF_MIN_TRANSFER_MINUTES,
    CONF_ORIGIN_DIVA,
    CONF_ROUTE_TYPE,
    CONF_STEP_FREE,
    CONF_WALK_SPEED,
    DOMAIN,
    ENTRY_TYPE_ROUTE,
    MAX_CHANGES_CHOICES,
    ROUTE_TYPES,
    ROUTING_TIME_ZONE,
    S_BAHN_COLORS,
    S_BAHN_DEFAULT_COLOR,
    S_BAHN_TEXT_COLOR,
    WALK_SPEEDS,
)
from custom_components.wiener_linien_austria.diagnostics import (
    async_get_config_entry_diagnostics,
)
from custom_components.wiener_linien_austria.live import async_get_live_board
from custom_components.wiener_linien_austria.route_coordinator import (
    WienerLinienRouteCoordinator,
    route_trip_attributes,
)
from custom_components.wiener_linien_austria.routing import (
    RoutingError,
    parse_trip_body,
)
from custom_components.wiener_linien_austria.static import (
    CATALOGUE_KEY,
    StaticCatalogue,
    Station,
    line_colors_for,
)

from .conftest import (
    ROUTE_DATA,
    ROUTE_FETCH,
    ROUTE_NOW,
    async_setup_entry_and_wait,
    make_entry,
    route_entry,
    routing_body,
)

FIXTURES = Path(__file__).parent / "fixtures"
PROBE = "custom_components.wiener_linien_austria.config_flow._probe_route"


def _entity_id(hass: HomeAssistant, entry: MockConfigEntry, suffix: str) -> str:
    platform = "binary_sensor" if suffix == "route_at_risk" else "sensor"
    entity_id = er.async_get(hass).async_get_entity_id(
        platform, DOMAIN, f"{entry.entry_id}_{suffix}"
    )
    assert entity_id is not None
    return entity_id


# ---------------------------------------------------------------------------
# Setup + entities
# ---------------------------------------------------------------------------


async def test_route_entry_sets_up_sensor_and_risk(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.LOADED
    assert isinstance(entry.runtime_data, WienerLinienRouteCoordinator)

    state = hass.states.get(_entity_id(hass, entry, "route"))
    assert state is not None
    assert dt_util.parse_datetime(state.state) == dt_util.parse_datetime(
        "2026-09-14T07:57:00+02:00"
    )
    attrs = state.attributes
    assert attrs["origin"] == "Westbahnhof"
    assert attrs["destination"] == "Praterstern"
    assert attrs["active"] is True
    assert attrs["risk"] == "tight"
    assert attrs["interchanges"] == 1
    assert attrs["duration_minutes"] == 14
    assert len(attrs["trips"]) == 4
    assert attrs["trips"][0]["legs"][0]["line"] == "U3"
    assert attrs["traffic_info"] == []

    risk = hass.states.get(_entity_id(hass, entry, "route_at_risk"))
    assert risk is not None
    assert risk.state == "off"
    assert risk.attributes["transfer_at"] == "Stephansplatz"
    assert risk.attributes["slack_minutes"] == 0

    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, entry.entry_id), entry.entry_id
    )
    assert device is not None
    assert device.model == "Verbindung"

    params = dict(fetch.call_args.args[1])
    assert params["name_origin"] == "60201468"
    assert params["itdTime"] == "0750"


async def test_realtime_delay_turns_risk_sensor_on(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    body = copy.deepcopy(routing_body())
    for trip in body["trips"]:
        arrival = trip["legs"][0]["points"][1]["dateTime"]
        hour, minute = arrival["time"].split(":")
        arrival["rtTime"] = f"{hour}:{int(minute) + 3:02d}"
        arrival["rtDate"] = arrival["date"]
    with patch(ROUTE_FETCH, new_callable=AsyncMock, return_value=body):
        entry = route_entry()
        await async_setup_entry_and_wait(hass, entry)
    risk = hass.states.get(_entity_id(hass, entry, "route_at_risk"))
    assert risk is not None
    assert risk.state == "on"
    assert risk.attributes["risk"] == "at_risk"


async def test_no_connection_is_not_an_outage(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    with patch(ROUTE_FETCH, new_callable=AsyncMock, return_value={"trips": None}):
        entry = route_entry()
        await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.LOADED
    state = hass.states.get(_entity_id(hass, entry, "route"))
    assert state is not None
    assert state.state == "unknown"
    assert state.attributes["active"] is True
    assert state.attributes["trips"] == []
    risk = hass.states.get(_entity_id(hass, entry, "route_at_risk"))
    assert risk is not None
    assert risk.state == "unknown"
    assert risk.attributes["risk"] is None


async def test_outside_window_does_not_fetch(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry(**{CONF_ACTIVE_FROM: "17:00:00", CONF_ACTIVE_TO: "19:00:00"})
    await async_setup_entry_and_wait(hass, entry)
    fetch.assert_not_called()
    state = hass.states.get(_entity_id(hass, entry, "route"))
    assert state is not None
    assert state.state == "unknown"
    assert state.attributes["active"] is False
    assert state.attributes["active_window"] == {
        "from": "17:00:00",
        "to": "19:00:00",
        "days": None,
    }


async def test_upstream_failure_retries_setup(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    with patch(
        ROUTE_FETCH,
        new_callable=AsyncMock,
        side_effect=RoutingError("api_timeout", {"seconds": "20"}),
    ):
        entry = route_entry()
        await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_failed_setup_leaves_no_live_listener_behind(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Each setup retry builds a new coordinator; the failed one lets go.

    `_async_setup` registers with the shared live board before the first
    refresh. Nothing here shuts a failed coordinator down: HA does, since
    `DataUpdateCoordinator` registers `async_shutdown` on the entry's
    unload callbacks (present since at least the 2025.6.0 floor), and those
    run on SETUP_RETRY too. Pinned because the leak it would be is silent.
    """
    board = async_get_live_board(hass)
    with patch(
        ROUTE_FETCH,
        new_callable=AsyncMock,
        side_effect=RoutingError("api_timeout", {"seconds": "20"}),
    ):
        entry = route_entry()
        await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.SETUP_RETRY
    assert board._listeners == []


async def test_route_setup_loads_the_stop_catalogue(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    """An install with only routes still gets live times and coordinates."""
    with patch(
        "custom_components.wiener_linien_austria.static.async_get_catalogue",
        new_callable=AsyncMock,
    ) as load:
        entry = route_entry()
        await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.LOADED
    load.assert_awaited_with(hass)


async def test_route_setup_survives_a_missing_catalogue(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    with patch(
        "custom_components.wiener_linien_austria.static.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=TimeoutError,
    ):
        entry = route_entry()
        await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.LOADED


async def test_invalid_diva_is_a_setup_error(
    hass: HomeAssistant, fetch: AsyncMock
) -> None:
    entry = route_entry(**{CONF_ORIGIN_DIVA: "nope"})
    await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.SETUP_ERROR
    fetch.assert_not_called()


async def test_unload_last_route_entry_tears_down(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    assert hass.data[DOMAIN]["entry_count"] == 1
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert hass.data[DOMAIN]["entry_count"] == 0
    assert "alerts_refresh_unsub" not in hass.data[DOMAIN]


async def test_platform_failure_rolls_back_route_setup(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    entry.add_to_hass(hass)
    with patch.object(
        hass.config_entries,
        "async_forward_entry_setups",
        side_effect=RuntimeError("boom"),
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_ERROR
    assert hass.data[DOMAIN].get("entry_count", 0) == 0


# ---------------------------------------------------------------------------
# Coordinator scheduling
# ---------------------------------------------------------------------------


async def test_refresh_is_pulled_up_to_the_next_departure(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    # 07:55 in Vienna; the best connection leaves at 07:57. Refresh 30 s
    # after it goes rather than waiting out the 300 s interval.
    freezer.move_to("2026-09-14 05:55:00+00:00")
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    assert entry.runtime_data.update_interval == timedelta(seconds=150)


async def test_distant_departure_keeps_the_scan_interval(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    # Seven and a half minutes to the rollover is later than the interval.
    assert entry.runtime_data.update_interval == timedelta(seconds=300)


async def test_rollover_never_drops_below_the_floor(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to("2026-09-14 05:56:50+00:00")
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    assert entry.runtime_data.update_interval == timedelta(seconds=60)


async def test_a_connection_that_left_does_not_time_the_rollover(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    # 07:57:30: the 07:57 connection left 30 s ago but is still in the list
    # (rank_trips keeps it for a minute). The refresh waits for the 08:00 one
    # rather than coming back in 60 s, which doubled the trip requests on a
    # frequent line.
    freezer.move_to("2026-09-14 05:57:30+00:00")
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    coordinator: WienerLinienRouteCoordinator = entry.runtime_data
    assert str(coordinator.data.trips[0].departure).startswith("2026-09-14 07:57")
    assert coordinator.update_interval == timedelta(seconds=180)


async def test_first_failure_does_not_keep_a_pulled_up_refresh(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to("2026-09-14 05:55:00+00:00")
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    coordinator: WienerLinienRouteCoordinator = entry.runtime_data
    assert coordinator.update_interval == timedelta(seconds=150)
    fetch.side_effect = RoutingError("api_timeout", {"seconds": "20"})
    await coordinator.async_refresh()
    assert coordinator.update_interval == timedelta(seconds=300)


@pytest.mark.parametrize(("stored", "effective"), [(10, 120), (99999, 1800)])
async def test_route_interval_is_clamped_to_its_range(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, stored: int, effective: int
) -> None:
    """A hand-edited entry never skips the form's range."""
    coordinator = WienerLinienRouteCoordinator(
        hass, route_entry(**{CONF_SCAN_INTERVAL: stored})
    )
    assert coordinator.scan_interval == timedelta(seconds=effective)


async def test_backoff_stretches_and_resets(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    coordinator: WienerLinienRouteCoordinator = entry.runtime_data
    fetch.side_effect = RoutingError("api_http_error", {"status": "503", "reason": ""})
    await coordinator.async_refresh()
    assert coordinator.last_update_success is False
    assert coordinator.update_interval == timedelta(seconds=300)
    await coordinator.async_refresh()
    assert coordinator.update_interval == timedelta(seconds=600)
    for _ in range(5):
        await coordinator.async_refresh()
    assert coordinator.update_interval == timedelta(seconds=1800)
    # Unavailable, not a stale plan, while failing.
    state = hass.states.get(_entity_id(hass, entry, "route"))
    assert state is not None
    assert state.state == "unavailable"

    fetch.side_effect = None
    await coordinator.async_refresh()
    assert coordinator.last_update_success is True
    assert coordinator.update_interval == timedelta(seconds=300)


async def test_leaving_the_window_resets_backoff(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to(ROUTE_NOW)
    entry = route_entry(**{CONF_ACTIVE_FROM: "07:00:00", CONF_ACTIVE_TO: "08:00:00"})
    await async_setup_entry_and_wait(hass, entry)
    coordinator: WienerLinienRouteCoordinator = entry.runtime_data
    fetch.side_effect = RoutingError("api_timeout", {"seconds": "20"})
    await coordinator.async_refresh()
    await coordinator.async_refresh()
    assert coordinator.update_interval == timedelta(seconds=600)
    freezer.move_to("2026-09-14 07:00:00+00:00")  # 09:00 in Vienna
    await coordinator.async_refresh()
    assert coordinator.update_interval == timedelta(seconds=300)
    assert coordinator.data.active is False


@pytest.mark.real_domain_cooldown
async def test_routing_cooldown_waits_out_the_slice(hass: HomeAssistant) -> None:
    hass.data.setdefault(DOMAIN, {})[rate_limit.ROUTING_LAST_CALL_KEY] = (
        dt_util.utcnow() - timedelta(seconds=5)
    )
    with patch(
        "custom_components.wiener_linien_austria.rate_limit.asyncio.sleep",
        new_callable=AsyncMock,
    ) as sleep:
        await rate_limit.async_enforce_routing_cooldown(hass)
    sleep.assert_awaited_once()
    assert abs(sleep.call_args.args[0] - 10) < 0.5
    # The realtime slot is untouched: separate backends, separate budgets.
    assert rate_limit.DOMAIN_LAST_CALL_KEY not in hass.data[DOMAIN]


# ---------------------------------------------------------------------------
# Diagnostics
# ---------------------------------------------------------------------------


async def test_route_diagnostics_carry_counts_not_connections(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["coordinator"]["trip_count"] == 4
    assert diag["coordinator"]["risks"] == ["tight", "tight", "tight", "tight"]
    assert diag["coordinator"]["active"] is True
    assert "07:57" not in json.dumps(diag)


# ---------------------------------------------------------------------------
# plan_trip action
# ---------------------------------------------------------------------------


async def test_plan_trip_returns_connections(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    response = await hass.services.async_call(
        DOMAIN,
        "plan_trip",
        {"config_entry_id": entry.entry_id, "arrive_by": True},
        blocking=True,
        return_response=True,
    )
    assert response is not None
    assert response["origin"] == "Westbahnhof"
    assert len(response["trips"]) == 4
    assert dict(fetch.call_args.args[1])["itdTripDateTimeDepArr"] == "arr"
    # The same shape as the sensor's trips, so no catalogue means no coordinates.
    assert "latitude" not in response["trips"][0]["legs"][0]["origin"]

    hass.data[DOMAIN][CATALOGUE_KEY] = StaticCatalogue(
        stations_by_diva={
            60201468: Station(
                diva=60201468,
                name="Westbahnhof",
                municipality="Wien",
                longitude=16.3376511,
                latitude=48.1966562,
                rbls=[],
            )
        },
        last_fetched="2026-09-15T00:00:00+00:00",
    )
    response = await hass.services.async_call(
        DOMAIN,
        "plan_trip",
        {"config_entry_id": entry.entry_id, "arrive_by": True},
        blocking=True,
        return_response=True,
    )
    assert response is not None
    assert response["trips"][0]["legs"][0]["origin"]["latitude"] == 48.1966562


async def test_plan_trip_at_a_given_time(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    await hass.services.async_call(
        DOMAIN,
        "plan_trip",
        {"config_entry_id": entry.entry_id, "datetime": "2026-09-14 07:52:00"},
        blocking=True,
        return_response=True,
    )
    params = dict(fetch.call_args.args[1])
    assert params["itdDate"] == "20260914"


async def test_plan_trip_no_connection_is_an_empty_answer(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    fetch.return_value = {"trips": None}
    response = await hass.services.async_call(
        DOMAIN,
        "plan_trip",
        {"config_entry_id": entry.entry_id},
        blocking=True,
        return_response=True,
    )
    assert response is not None
    assert response["trips"] == []


async def test_plan_trip_routing_failure_is_translated(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    fetch.side_effect = RoutingError("route_too_close")
    with pytest.raises(HomeAssistantError) as err:
        await hass.services.async_call(
            DOMAIN,
            "plan_trip",
            {"config_entry_id": entry.entry_id},
            blocking=True,
            return_response=True,
        )
    assert err.value.translation_key == "route_too_close"


async def test_plan_trip_rejects_bad_targets(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock, mock_fetch
) -> None:
    route = route_entry()
    await async_setup_entry_and_wait(hass, route)
    stop = make_entry()
    await async_setup_entry_and_wait(hass, stop)
    not_loaded = route_entry()
    not_loaded.add_to_hass(hass)

    for entry_id, key in (
        ("missing", "route_entry_not_found"),
        (stop.entry_id, "route_entry_not_route"),
        (not_loaded.entry_id, "route_entry_not_loaded"),
    ):
        with pytest.raises(ServiceValidationError) as err:
            await hass.services.async_call(
                DOMAIN,
                "plan_trip",
                {"config_entry_id": entry_id},
                blocking=True,
                return_response=True,
            )
        assert err.value.translation_key == key


async def test_plan_trip_repeated_now_is_served_from_the_cache(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    before = fetch.await_count
    for _ in range(3):
        await hass.services.async_call(
            DOMAIN,
            "plan_trip",
            {"config_entry_id": entry.entry_id},
            blocking=True,
            return_response=True,
        )
    assert fetch.await_count == before + 1


async def test_plan_trip_in_a_loop_hits_the_budget(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    # Distinct times are distinct queries, so each one needs a token. An
    # automation carries no user and draws on the shared no-user bucket.
    with pytest.raises(HomeAssistantError) as err:
        for minute in range(adhoc.ADHOC_USER_BURST + 1):
            await hass.services.async_call(
                DOMAIN,
                "plan_trip",
                {
                    "config_entry_id": entry.entry_id,
                    "datetime": f"2026-09-14 08:{minute:02d}:00",
                },
                blocking=True,
                return_response=True,
            )
    assert err.value.translation_key == "adhoc_rate_limited"
    assert int(err.value.translation_placeholders["retry_after"]) > 0
    assert fetch.await_count >= adhoc.ADHOC_USER_BURST


async def test_plan_trip_between_two_stops_by_name(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await async_setup_entry_and_wait(hass, route_entry())
    response = await hass.services.async_call(
        DOMAIN,
        "plan_trip",
        # As a voice assistant hands it over: lower case, no accents needed.
        {"origin": "stephansplatz", "destination": "60200123", "arrive_by": True},
        blocking=True,
        return_response=True,
    )
    assert response is not None
    assert response["origin"] == "Stephansplatz"
    assert response["destination"] == "Schwarzenbergplatz"
    assert len(response["trips"]) == 4
    params = dict(fetch.call_args.args[1])
    assert params["name_origin"] == "60201012"
    assert params["name_destination"] == "60200123"
    assert params["itdTripDateTimeDepArr"] == "arr"


async def test_plan_trip_needs_a_route_or_two_stops(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    for data in (
        {},
        {"origin": "Stephansplatz"},
        {"destination": "Stephansplatz"},
        {"config_entry_id": entry.entry_id, "origin": "Stephansplatz"},
        {
            "config_entry_id": entry.entry_id,
            "origin": "Stephansplatz",
            "destination": "Schwarzenbergplatz",
        },
    ):
        with pytest.raises(ServiceValidationError) as err:
            await hass.services.async_call(
                DOMAIN, "plan_trip", data, blocking=True, return_response=True
            )
        assert err.value.translation_key == "plan_trip_route_or_stops", data


async def test_plan_trip_explains_stops_it_cannot_use(
    hass: HomeAssistant,
    frozen: FrozenDateTimeFactory,
    fetch: AsyncMock,
    mock_static_catalogue: StaticCatalogue,
) -> None:
    await async_setup_entry_and_wait(hass, route_entry())
    for municipality in ("Schwechat", "Groß-Enzersdorf"):
        diva = 60203000 + len(mock_static_catalogue.stations_by_diva)
        mock_static_catalogue.stations_by_diva[diva] = Station(
            diva=diva,
            name="Hauptplatz",
            municipality=municipality,
            longitude=16.47,
            latitude=48.14,
            rbls=[diva],
        )
    before = fetch.await_count

    for origin, destination, key in (
        ("Xyzzy", "Stephansplatz", "plan_trip_stop_not_found"),
        ("Stephansplatz", "Hauptplatz", "plan_trip_stop_ambiguous"),
        ("Stephansplatz", "60201012", "adhoc_same_stop"),
    ):
        with pytest.raises(ServiceValidationError) as err:
            await hass.services.async_call(
                DOMAIN,
                "plan_trip",
                {"origin": origin, "destination": destination},
                blocking=True,
                return_response=True,
            )
        assert err.value.translation_key == key
    # Nothing was planned for a stop pair that didn't resolve.
    assert fetch.await_count == before

    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN,
            "plan_trip",
            {"origin": "Hauptplatz", "destination": "Stephansplatz"},
            blocking=True,
            return_response=True,
        )
    placeholders = err.value.translation_placeholders
    assert placeholders is not None
    assert placeholders["stop"] == "Hauptplatz"
    assert "Hauptplatz (Schwechat)" in placeholders["candidates"]
    assert "Hauptplatz (Groß-Enzersdorf)" in placeholders["candidates"]


async def test_plan_trip_between_stops_needs_the_integration_and_its_catalogue(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    await async_setup_component(hass, DOMAIN, {})
    stops = {"origin": "Stephansplatz", "destination": "Schwarzenbergplatz"}
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN, "plan_trip", stops, blocking=True, return_response=True
        )
    assert err.value.translation_key == "adhoc_not_loaded"

    await async_setup_entry_and_wait(hass, route_entry())
    with (
        patch(
            "custom_components.wiener_linien_austria.static.async_get_catalogue",
            side_effect=aiohttp.ClientError,
        ),
        pytest.raises(HomeAssistantError) as err,
    ):
        await hass.services.async_call(
            DOMAIN, "plan_trip", stops, blocking=True, return_response=True
        )
    assert err.value.translation_key == "adhoc_catalogue_unavailable"


# ---------------------------------------------------------------------------
# Config flow
# ---------------------------------------------------------------------------


async def _start_route_flow(hass: HomeAssistant) -> Any:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == FlowResultType.MENU
    assert result["menu_options"] == ["stop", "route"]
    return await hass.config_entries.flow.async_configure(
        result["flow_id"], {"next_step_id": "route"}
    )


OPTIONS_INPUT: dict[str, Any] = {
    CONF_ROUTE_TYPE: "leastinterchange",
    CONF_MAX_CHANGES: "1",
    CONF_WALK_SPEED: "slow",
    CONF_MIN_TRANSFER_MINUTES: 3,
    CONF_EXCLUDED_MEANS: ["bus"],
    CONF_STEP_FREE: True,
    CONF_LEAVE_MINUTES: 8,
    CONF_ACTIVE_DAYS: ["mon", "fri"],
    CONF_SCAN_INTERVAL: 240,
}


async def test_route_flow_creates_entry(hass: HomeAssistant) -> None:
    result = await _start_route_flow(hass)
    assert result["step_id"] == "route"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_ORIGIN_DIVA: "60201012", CONF_DESTINATION_DIVA: "Schwarzenberg"},
    )
    assert result["step_id"] == "route_options"
    assert result["description_placeholders"] == {
        "origin": "Stephansplatz",
        "destination": "Schwarzenbergplatz",
    }
    with (
        patch(PROBE, new_callable=AsyncMock, return_value=None) as probe,
        patch(
            "custom_components.wiener_linien_austria.async_setup_entry",
            return_value=True,
        ),
    ):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {**OPTIONS_INPUT, CONF_ACTIVE_FROM: "06:30:00", CONF_ACTIVE_TO: "09:00:00"},
        )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["title"] == "Stephansplatz → Schwarzenbergplatz"
    data = result["data"]
    assert data[CONF_ENTRY_TYPE] == ENTRY_TYPE_ROUTE
    assert data[CONF_ORIGIN_DIVA] == 60201012
    assert data[CONF_DESTINATION_NAME] == "Schwarzenbergplatz"
    assert data[CONF_ROUTE_TYPE] == "leastinterchange"
    assert data[CONF_EXCLUDED_MEANS] == ["bus"]
    assert data[CONF_STEP_FREE] is True
    assert data[CONF_LEAVE_MINUTES] == 8
    assert data[CONF_ACTIVE_DAYS] == ["mon", "fri"]
    assert data[CONF_ACTIVE_FROM] == "06:30:00"
    assert result["result"].unique_id == "route_60201012_60200123"
    probe.assert_awaited_once()


async def test_route_flow_field_errors(hass: HomeAssistant) -> None:
    result = await _start_route_flow(hass)
    flow_id = result["flow_id"]
    result = await hass.config_entries.flow.async_configure(
        flow_id, {CONF_ORIGIN_DIVA: "gasse", CONF_DESTINATION_DIVA: "x"}
    )
    assert result["errors"] == {
        CONF_ORIGIN_DIVA: "route_stop_unresolved",
        CONF_DESTINATION_DIVA: "route_stop_unresolved",
    }
    result = await hass.config_entries.flow.async_configure(
        flow_id, {CONF_ORIGIN_DIVA: "60201012", CONF_DESTINATION_DIVA: "60201012"}
    )
    assert result["errors"] == {"base": "same_stop"}


async def test_route_flow_aborts_on_duplicate(hass: HomeAssistant) -> None:
    MockConfigEntry(
        domain=DOMAIN, data=ROUTE_DATA, unique_id="route_60201012_60200123"
    ).add_to_hass(hass)
    result = await _start_route_flow(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_ORIGIN_DIVA: "60201012", CONF_DESTINATION_DIVA: "60200123"},
    )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "already_configured_route"


@pytest.mark.parametrize(
    ("user_input", "probe_result", "error"),
    [
        ({CONF_ACTIVE_FROM: "06:30:00"}, None, "window_incomplete"),
        ({}, "route_too_close", "route_too_close"),
        ({}, "cannot_connect_routing", "cannot_connect_routing"),
    ],
)
async def test_route_options_errors(
    hass: HomeAssistant,
    user_input: dict[str, Any],
    probe_result: str | None,
    error: str,
) -> None:
    result = await _start_route_flow(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_ORIGIN_DIVA: "60201012", CONF_DESTINATION_DIVA: "60200123"},
    )
    with patch(PROBE, new_callable=AsyncMock, return_value=probe_result):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {**OPTIONS_INPUT, **user_input}
        )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"] == {"base": error}


async def test_route_flow_catalogue_unavailable(hass: HomeAssistant) -> None:
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=TimeoutError,
    ):
        result = await _start_route_flow(hass)
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "catalogue_unavailable"


async def test_route_reconfigure_keeps_the_ends(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    result = await entry.start_reconfigure_flow(hass)
    assert result["step_id"] == "route_options"
    with patch(PROBE, new_callable=AsyncMock, return_value=None):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {**OPTIONS_INPUT, CONF_MIN_TRANSFER_MINUTES: 5}
        )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.data[CONF_MIN_TRANSFER_MINUTES] == 5
    assert entry.data[CONF_ORIGIN_DIVA] == 60201468
    assert entry.unique_id == "route_60201468_60201040"


async def test_route_saved_in_upper_case_still_plans_and_preselects(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    """A route saved with the EFA spelling, before the values went lower-case."""
    entry = route_entry(**{CONF_ROUTE_TYPE: "LEASTWALKING"})
    await async_setup_entry_and_wait(hass, entry)
    assert entry.state is ConfigEntryState.LOADED
    assert entry.runtime_data.options.route_type == "leastwalking"
    assert dict(fetch.call_args.args[1])["routeType"] == "LEASTWALKING"

    result = await entry.start_reconfigure_flow(hass)
    (route_type_key,) = (
        key for key in result["data_schema"].schema if key == CONF_ROUTE_TYPE
    )
    assert route_type_key.default() == "leastwalking"


def test_selector_option_keys_pass_hassfest() -> None:
    """Selector option keys must be `[a-z0-9-_]+`, or hassfest rejects the file.

    Also checks every option the config flow offers has a label, so a value
    renamed in const.py can't leave the dropdown showing the raw key.
    """
    root = Path(__file__).parents[1] / "custom_components" / DOMAIN
    offered = {
        CONF_ROUTE_TYPE: set(ROUTE_TYPES),
        CONF_WALK_SPEED: set(WALK_SPEEDS),
        CONF_MAX_CHANGES: set(MAX_CHANGES_CHOICES),
    }
    valid = re.compile(r"^[a-z0-9]([a-z0-9-_]*[a-z0-9])?$")
    for name in ("strings.json", "translations/en.json", "translations/de.json"):
        selectors = json.loads((root / name).read_text(encoding="utf-8"))["selector"]
        for selector, block in selectors.items():
            for key in block.get("options", {}):
                assert valid.match(key), f"{name}: selector.{selector}.options.{key}"
        for selector, values in offered.items():
            assert set(selectors[selector]["options"]) >= values, (name, selector)


async def test_route_reconfigure_with_corrupt_data_aborts(hass: HomeAssistant) -> None:
    entry = route_entry(**{CONF_ORIGIN_DIVA: None})
    entry.add_to_hass(hass)
    result = await entry.start_reconfigure_flow(hass)
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "stop_gone"


async def test_route_options_flow_uses_route_range(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = route_entry()
    await async_setup_entry_and_wait(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    selector = next(iter(result["data_schema"].schema.values()))
    assert selector.config["min"] == 120
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {CONF_SCAN_INTERVAL: 600}
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["data"] == {CONF_SCAN_INTERVAL: 600}


# ---------------------------------------------------------------------------
# _probe_route
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("outcome", "expected"),
    [
        (routing_body(), None),
        ({"trips": None}, None),
        (RoutingError("route_too_close"), "route_too_close"),
        (RoutingError("route_stop_invalid", {"which": "origin"}), "route_stop_invalid"),
        (RoutingError("api_timeout", {"seconds": "20"}), "cannot_connect_routing"),
    ],
)
async def test_probe_route_outcomes(
    hass: HomeAssistant, outcome: Any, expected: str | None
) -> None:
    mock = (
        AsyncMock(side_effect=outcome)
        if isinstance(outcome, Exception)
        else AsyncMock(return_value=outcome)
    )
    with (
        patch(
            "custom_components.wiener_linien_austria.route_coordinator.async_fetch_trip_body",
            mock,
        ),
        patch(
            "custom_components.wiener_linien_austria.route_coordinator.async_get_clientsession",
            MagicMock(),
        ),
    ):
        data = {**ROUTE_DATA, CONF_EXCLUDED_MEANS: ["tram"]}
        assert await _probe_route(hass, data) == expected
    params = dict(mock.call_args.args[1])
    assert params["exclMOT_4"] == "1"


# ---------------------------------------------------------------------------
# Stop coordinates
# ---------------------------------------------------------------------------


async def test_route_stops_carry_catalogue_coordinates(hass: HomeAssistant) -> None:
    """Stops the catalogue knows get its coordinates; the rest get no keys."""
    trips = parse_trip_body(routing_body(), ZoneInfo(ROUTING_TIME_ZONE))[:1]
    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[CATALOGUE_KEY] = StaticCatalogue(
        stations_by_diva={
            diva: Station(
                diva=diva,
                name=name,
                municipality="Wien",
                longitude=longitude,
                latitude=latitude,
                rbls=[],
            )
            for diva, name, latitude, longitude in (
                (60201468, "Westbahnhof", 48.1966562, 16.3376511),
                (60200056, "Neubaugasse", 48.1982909, 16.3502006),
            )
        },
        last_fetched="2026-09-15T00:00:00+00:00",
    )

    ride = route_trip_attributes(hass, trips)["trips"][0]["legs"][0]
    assert ride["origin"]["stop_id"] == "60201468"
    assert (ride["origin"]["latitude"], ride["origin"]["longitude"]) == (
        48.1966562,
        16.3376511,
    )
    neubaugasse = next(s for s in ride["stops"] if s["stop_id"] == "60200056")
    assert neubaugasse["latitude"] == 48.1982909
    # Stephansplatz isn't in this catalogue: no keys, not nulls.
    assert "latitude" not in ride["destination"]
    assert "longitude" not in ride["destination"]

    # No catalogue loaded yet: the same shape as before, no coordinates.
    del domain_data[CATALOGUE_KEY]
    ride = route_trip_attributes(hass, trips)["trips"][0]["legs"][0]
    assert "latitude" not in ride["origin"]
    assert all("latitude" not in stop for stop in ride["stops"])


# ---------------------------------------------------------------------------
# S-Bahn colours
# ---------------------------------------------------------------------------


def _contrast(first: str, second: str) -> float:
    """WCAG 2 contrast ratio of two 6-digit hex colours."""

    def luminance(hex_colour: str) -> float:
        channels = [int(hex_colour[i : i + 2], 16) / 255 for i in (0, 2, 4)]
        linear = [
            c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
            for c in channels
        ]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    light, dark = sorted((luminance(first), luminance(second)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


def test_s_bahn_chip_colours_meet_wcag_aa() -> None:
    """White S-Bahn chip text clears 4.5:1 on every fill (see const.py)."""
    for bg in (S_BAHN_DEFAULT_COLOR, *S_BAHN_COLORS.values()):
        assert _contrast(bg, S_BAHN_TEXT_COLOR) >= 4.5, bg
    # The flap card writes its cream (--flap-on-color-fg) on every tile.
    assert _contrast(S_BAHN_COLORS["S45"], "F3EACD") >= 4.5


async def test_line_colors_cover_s_bahn_without_catalogue(hass: HomeAssistant) -> None:
    hass.data.pop(DOMAIN, None)
    colors = line_colors_for(hass, {"S80", "S45", "s7", "U1", "SEV"})
    assert colors == {
        "S80": {"bg": "107AA8", "fg": "FFFFFF"},
        "S45": {"bg": "566F1F", "fg": "FFFFFF"},
        "s7": {"bg": "107AA8", "fg": "FFFFFF"},
    }


async def test_line_colors_merge_s_bahn_with_gtfs(
    hass: HomeAssistant, mock_static_catalogue: Any
) -> None:
    assert mock_static_catalogue.trip_patterns is not None
    mock_static_catalogue.trip_patterns.colors_by_line["U1"] = "E3000F"
    hass.data.setdefault(DOMAIN, {})["static_catalogue"] = mock_static_catalogue
    colors = line_colors_for(hass, {"S45", "U1"})
    assert colors["S45"] == {"bg": "566F1F", "fg": "FFFFFF"}
    assert colors["U1"]["bg"] == "E3000F"
