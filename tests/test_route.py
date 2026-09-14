"""Tests for A→B route entries: coordinator, entities, flow, action, diagnostics."""

from __future__ import annotations

import copy
import json
from collections.abc import Generator
from datetime import timedelta
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

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
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria import rate_limit
from custom_components.wiener_linien_austria.config_flow import _probe_route
from custom_components.wiener_linien_austria.const import (
    CONF_ACTIVE_DAYS,
    CONF_ACTIVE_FROM,
    CONF_ACTIVE_TO,
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_ENTRY_TYPE,
    CONF_EXCLUDED_MEANS,
    CONF_MAX_CHANGES,
    CONF_MIN_TRANSFER_MINUTES,
    CONF_ORIGIN_DIVA,
    CONF_ORIGIN_NAME,
    CONF_ROUTE_TYPE,
    CONF_WALK_SPEED,
    DOMAIN,
    ENTRY_TYPE_ROUTE,
    S_BAHN_COLORS,
    S_BAHN_DEFAULT_COLOR,
    S_BAHN_TEXT_COLOR,
)
from custom_components.wiener_linien_austria.diagnostics import (
    async_get_config_entry_diagnostics,
)
from custom_components.wiener_linien_austria.route_coordinator import (
    WienerLinienRouteCoordinator,
)
from custom_components.wiener_linien_austria.routing import RoutingError
from custom_components.wiener_linien_austria.sensor import line_colors_for

from .conftest import make_entry

FIXTURES = Path(__file__).parent / "fixtures"
FETCH = (
    "custom_components.wiener_linien_austria.route_coordinator.async_fetch_trip_body"
)
PROBE = "custom_components.wiener_linien_austria.config_flow._probe_route"
# 07:50 in Vienna on the capture day — every captured trip is still ahead.
NOW = "2026-09-14 05:50:00+00:00"

ROUTE_DATA: dict[str, Any] = {
    CONF_ENTRY_TYPE: ENTRY_TYPE_ROUTE,
    CONF_ORIGIN_DIVA: 60201468,
    CONF_ORIGIN_NAME: "Westbahnhof",
    CONF_DESTINATION_DIVA: 60201040,
    CONF_DESTINATION_NAME: "Praterstern",
    CONF_ROUTE_TYPE: "LEASTTIME",
    CONF_MAX_CHANGES: "any",
    CONF_WALK_SPEED: "normal",
    CONF_MIN_TRANSFER_MINUTES: 2,
    CONF_EXCLUDED_MEANS: [],
    CONF_ACTIVE_DAYS: [],
    CONF_SCAN_INTERVAL: 300,
}


def _body(name: str = "routing_westbahnhof_praterstern.json") -> dict[str, Any]:
    return json.loads((FIXTURES / name).read_text())


def _route_entry(**overrides: Any) -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        data={**ROUTE_DATA, **overrides},
        title="Westbahnhof → Praterstern",
        version=2,
        unique_id="route_60201468_60201040",
    )


@pytest.fixture
def frozen(freezer: FrozenDateTimeFactory) -> FrozenDateTimeFactory:
    freezer.move_to(NOW)
    return freezer


@pytest.fixture
def fetch() -> Generator[AsyncMock]:
    with patch(FETCH, new_callable=AsyncMock, return_value=_body()) as mock:
        yield mock


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


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
    entry = _route_entry()
    await _setup(hass, entry)
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
    body = copy.deepcopy(_body())
    for trip in body["trips"]:
        arrival = trip["legs"][0]["points"][1]["dateTime"]
        hour, minute = arrival["time"].split(":")
        arrival["rtTime"] = f"{hour}:{int(minute) + 3:02d}"
        arrival["rtDate"] = arrival["date"]
    with patch(FETCH, new_callable=AsyncMock, return_value=body):
        entry = _route_entry()
        await _setup(hass, entry)
    risk = hass.states.get(_entity_id(hass, entry, "route_at_risk"))
    assert risk is not None
    assert risk.state == "on"
    assert risk.attributes["risk"] == "at_risk"


async def test_no_connection_is_not_an_outage(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    with patch(FETCH, new_callable=AsyncMock, return_value={"trips": None}):
        entry = _route_entry()
        await _setup(hass, entry)
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
    entry = _route_entry(**{CONF_ACTIVE_FROM: "17:00:00", CONF_ACTIVE_TO: "19:00:00"})
    await _setup(hass, entry)
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
        FETCH,
        new_callable=AsyncMock,
        side_effect=RoutingError("api_timeout", {"seconds": "20"}),
    ):
        entry = _route_entry()
        await _setup(hass, entry)
    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_invalid_diva_is_a_setup_error(
    hass: HomeAssistant, fetch: AsyncMock
) -> None:
    entry = _route_entry(**{CONF_ORIGIN_DIVA: "nope"})
    await _setup(hass, entry)
    assert entry.state is ConfigEntryState.SETUP_ERROR
    fetch.assert_not_called()


async def test_unload_last_route_entry_tears_down(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = _route_entry()
    await _setup(hass, entry)
    assert hass.data[DOMAIN]["entry_count"] == 1
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert hass.data[DOMAIN]["entry_count"] == 0
    assert "alerts_refresh_unsub" not in hass.data[DOMAIN]


async def test_platform_failure_rolls_back_route_setup(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = _route_entry()
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
    entry = _route_entry()
    await _setup(hass, entry)
    assert entry.runtime_data.update_interval == timedelta(seconds=150)


async def test_distant_departure_keeps_the_scan_interval(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = _route_entry()
    await _setup(hass, entry)
    # Seven and a half minutes to the rollover is later than the interval.
    assert entry.runtime_data.update_interval == timedelta(seconds=300)


async def test_rollover_never_drops_below_the_floor(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    freezer.move_to("2026-09-14 05:56:50+00:00")
    entry = _route_entry()
    await _setup(hass, entry)
    assert entry.runtime_data.update_interval == timedelta(seconds=60)


async def test_backoff_stretches_and_resets(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = _route_entry()
    await _setup(hass, entry)
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
    freezer.move_to(NOW)
    entry = _route_entry(**{CONF_ACTIVE_FROM: "07:00:00", CONF_ACTIVE_TO: "08:00:00"})
    await _setup(hass, entry)
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
    entry = _route_entry()
    await _setup(hass, entry)
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
    entry = _route_entry()
    await _setup(hass, entry)
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


async def test_plan_trip_at_a_given_time(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = _route_entry()
    await _setup(hass, entry)
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
    entry = _route_entry()
    await _setup(hass, entry)
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
    entry = _route_entry()
    await _setup(hass, entry)
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
    route = _route_entry()
    await _setup(hass, route)
    stop = make_entry()
    await _setup(hass, stop)
    not_loaded = _route_entry()
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
    CONF_ROUTE_TYPE: "LEASTINTERCHANGE",
    CONF_MAX_CHANGES: "1",
    CONF_WALK_SPEED: "slow",
    CONF_MIN_TRANSFER_MINUTES: 3,
    CONF_EXCLUDED_MEANS: ["bus"],
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
    assert data[CONF_EXCLUDED_MEANS] == ["bus"]
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
    entry = _route_entry()
    await _setup(hass, entry)
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


async def test_route_reconfigure_with_corrupt_data_aborts(hass: HomeAssistant) -> None:
    entry = _route_entry(**{CONF_ORIGIN_DIVA: None})
    entry.add_to_hass(hass)
    result = await entry.start_reconfigure_flow(hass)
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "stop_gone"


async def test_route_options_flow_uses_route_range(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, fetch: AsyncMock
) -> None:
    entry = _route_entry()
    await _setup(hass, entry)
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
        (_body(), None),
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
            "custom_components.wiener_linien_austria.config_flow.async_fetch_trip_body",
            mock,
        ),
        patch(
            "custom_components.wiener_linien_austria.config_flow.async_get_clientsession",
            MagicMock(),
        ),
    ):
        data = {**ROUTE_DATA, CONF_EXCLUDED_MEANS: ["tram"]}
        assert await _probe_route(hass, data) == expected
    params = dict(mock.call_args.args[1])
    assert params["exclMOT_4"] == "1"


# ---------------------------------------------------------------------------
# S-Bahn colours
# ---------------------------------------------------------------------------


def test_s_bahn_text_is_white_by_choice() -> None:
    """White matches the signage; see the const.py note on its contrast."""
    assert S_BAHN_TEXT_COLOR == "FFFFFF"
    assert S_BAHN_DEFAULT_COLOR == "469CD4"
    assert S_BAHN_COLORS == {"S45": "C1D781"}


async def test_line_colors_cover_s_bahn_without_catalogue(hass: HomeAssistant) -> None:
    hass.data.pop(DOMAIN, None)
    colors = line_colors_for(hass, {"S80", "S45", "s7", "U1", "SEV"})
    assert colors == {
        "S80": {"bg": "469CD4", "fg": "FFFFFF"},
        "S45": {"bg": "C1D781", "fg": "FFFFFF"},
        "s7": {"bg": "469CD4", "fg": "FFFFFF"},
    }


async def test_line_colors_merge_s_bahn_with_gtfs(
    hass: HomeAssistant, mock_static_catalogue: Any
) -> None:
    assert mock_static_catalogue.trip_patterns is not None
    mock_static_catalogue.trip_patterns.colors_by_line["U1"] = "E3000F"
    hass.data.setdefault(DOMAIN, {})["static_catalogue"] = mock_static_catalogue
    colors = line_colors_for(hass, {"S45", "U1"})
    assert colors["S45"] == {"bg": "C1D781", "fg": "FFFFFF"}
    assert colors["U1"]["bg"] == "E3000F"
