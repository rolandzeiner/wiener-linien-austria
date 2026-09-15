"""Tests for the S-Bahn network behind the stops-ahead transfer chips."""

from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime, timedelta
from typing import Any
from unittest.mock import AsyncMock, patch
from zoneinfo import ZoneInfo

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant

from custom_components.wiener_linien_austria.const import (
    DOMAIN,
    ENTRY_COUNT_KEY,
    S_BAHN_NETWORK_DEPARTURES,
    S_BAHN_NETWORK_HUBS,
    S_BAHN_NETWORK_MAX_AGE,
)
from custom_components.wiener_linien_austria.routing import RoutingError
from custom_components.wiener_linien_austria.s_bahn_network import (
    S_BAHN_NETWORK_KEY,
    S_BAHN_NETWORK_TASK_KEY,
    STORE_KEY,
    STORE_VERSION,
    HubSample,
    SBahnNetwork,
    async_schedule_network_update,
    async_update_network,
    current_lines_at_diva,
    merge_transfer_lines,
    sample_time,
    sort_s_bahn_labels,
)

from .conftest import make_entry

VIENNA = ZoneInfo("Europe/Vienna")
NOW = datetime(2026, 9, 15, 20, 0, tzinfo=UTC)
PRATERSTERN, MEIDLING = S_BAHN_NETWORK_HUBS[0], S_BAHN_NETWORK_HUBS[1]
FLORIDSDORF = 60200334
HANDELSKAI = 60201705

_MODULE = "custom_components.wiener_linien_austria.s_bahn_network"
_FETCH = f"{_MODULE}.async_fetch_trip_body"
_COOLDOWN = f"{_MODULE}.async_enforce_routing_cooldown"


def _point(stop_id: str, name: str = "Wien Stop") -> dict[str, Any]:
    return {"name": name, "ref": {"id": stop_id}}


def _train(line: str, stop_ids: list[str], mot: str = "1") -> dict[str, Any]:
    return {
        "stopID": stop_ids[0],
        "servingLine": {"number": line, "motType": mot},
        "prevStopSeq": _point(stop_ids[0]),
        "onwardStopSeq": [_point(stop_id) for stop_id in stop_ids[1:]],
    }


def _body(*trains: dict[str, Any]) -> dict[str, Any]:
    return {"departureList": list(trains)}


def _sample(lines_at_stop: dict[int, set[str]], age: timedelta) -> HubSample:
    return HubSample(
        fetched_at=NOW - age,
        lines_at_stop={
            diva: frozenset(labels) for diva, labels in lines_at_stop.items()
        },
    )


def _fresh_network(**hub_lines: dict[int, set[str]]) -> SBahnNetwork:
    """Every hub fresh; hubs named in `hub_lines` carry those samples."""
    named = {"praterstern": PRATERSTERN, "meidling": MEIDLING}
    hubs = {hub: _sample({}, timedelta(hours=1)) for hub in S_BAHN_NETWORK_HUBS}
    for key, lines in hub_lines.items():
        hubs[named[key]] = _sample(lines, timedelta(hours=1))
    return SBahnNetwork(hubs=hubs)


@pytest.fixture
def live(hass: HomeAssistant) -> dict[str, Any]:
    """Domain data as a running board entry leaves it."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[ENTRY_COUNT_KEY] = 1
    return domain_data


# ---------------------------------------------------------------------------
# Label order
# ---------------------------------------------------------------------------


def test_s_bahn_labels_sort_by_line_number() -> None:
    assert sort_s_bahn_labels({"S45", "S7", "S1", "S80", "S40"}) == (
        "S1",
        "S7",
        "S40",
        "S45",
        "S80",
    )


def test_merge_places_s_bahn_after_the_u_bahn() -> None:
    assert merge_transfer_lines(("U2", "U6", "2", "5A"), ("S1", "S45")) == [
        "U2",
        "U6",
        "S1",
        "S45",
        "2",
        "5A",
    ]


def test_merge_leads_with_s_bahn_where_there_is_no_u_bahn() -> None:
    assert merge_transfer_lines(("11A",), ("S80",)) == ["S80", "11A"]
    assert merge_transfer_lines((), ("S1",)) == ["S1"]
    assert merge_transfer_lines(("U1",), ()) == ["U1"]


def test_merge_drops_the_trail_s_own_line() -> None:
    assert merge_transfer_lines(("U6",), ("S1", "S2"), exclude="S1") == ["U6", "S2"]
    assert merge_transfer_lines(("U1", "U6"), ("S1",), exclude="U6") == ["U1", "S1"]
    assert merge_transfer_lines((), ("S3",), exclude="S3") == []


# ---------------------------------------------------------------------------
# Network model
# ---------------------------------------------------------------------------


def test_network_merges_hub_samples() -> None:
    network = SBahnNetwork(
        hubs={
            PRATERSTERN: _sample({FLORIDSDORF: {"S2", "S1"}}, timedelta(0)),
            MEIDLING: _sample(
                {FLORIDSDORF: {"S80"}, HANDELSKAI: {"S45"}}, timedelta(0)
            ),
        }
    )
    assert network.lines_at_diva == {
        FLORIDSDORF: ("S1", "S2", "S80"),
        HANDELSKAI: ("S45",),
    }


def test_stale_hubs_are_missing_or_old() -> None:
    network = _fresh_network()
    assert network.stale_hubs(NOW) == []

    network.hubs[MEIDLING] = _sample({}, S_BAHN_NETWORK_MAX_AGE)
    del network.hubs[PRATERSTERN]
    assert network.stale_hubs(NOW) == [PRATERSTERN, MEIDLING]


def test_sample_time_is_tomorrow_ten_o_clock_in_vienna() -> None:
    # 23:30 UTC is already the next day in Vienna; tomorrow counts from there.
    late = datetime(2026, 9, 15, 23, 30, tzinfo=UTC)
    assert sample_time(late, VIENNA) == datetime(2026, 9, 17, 10, 0, tzinfo=VIENNA)
    assert sample_time(NOW, VIENNA) == datetime(2026, 9, 16, 10, 0, tzinfo=VIENNA)


async def test_current_lines_empty_until_published(hass: HomeAssistant) -> None:
    assert current_lines_at_diva(hass) == {}
    hass.data.setdefault(DOMAIN, {})[S_BAHN_NETWORK_KEY] = _fresh_network(
        praterstern={FLORIDSDORF: {"S1"}}
    )
    assert current_lines_at_diva(hass) == {FLORIDSDORF: ("S1",)}


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


async def test_first_update_fetches_every_hub_then_persists(
    hass: HomeAssistant,
    live: dict[str, Any],
    hass_storage: dict[str, Any],
    freezer: FrozenDateTimeFactory,
) -> None:
    freezer.move_to(NOW)
    body = _body(
        _train("S1", ["60201040", str(FLORIDSDORF)]),
        _train("S45", [str(HANDELSKAI), "60200560"]),
    )
    with (
        patch(_FETCH, new_callable=AsyncMock, return_value=body) as fetch,
        patch(_COOLDOWN, new_callable=AsyncMock) as cooldown,
    ):
        network = await async_update_network(hass)

    assert fetch.await_count == len(S_BAHN_NETWORK_HUBS)
    assert cooldown.await_count == len(S_BAHN_NETWORK_HUBS)
    params = dict(fetch.await_args_list[0].args[1])
    assert params["name_dm"] == str(PRATERSTERN)
    assert params["limit"] == str(S_BAHN_NETWORK_DEPARTURES)
    assert params["includeCompleteStopSeq"] == "1"
    assert (params["itdDate"], params["itdTime"]) == ("20260916", "1000")

    assert live[S_BAHN_NETWORK_KEY] is network
    assert network.lines_at_diva[FLORIDSDORF] == ("S1",)
    assert network.lines_at_diva[HANDELSKAI] == ("S45",)
    stored = hass_storage[STORE_KEY]["data"]["hubs"][str(PRATERSTERN)]
    assert stored["lines_at_stop"][str(FLORIDSDORF)] == ["S1"]

    # Fresh now: a second check asks for nothing.
    with patch(_FETCH, new_callable=AsyncMock) as fetch:
        assert await async_update_network(hass) is network
    fetch.assert_not_awaited()


async def test_restart_publishes_stored_network_without_fetching(
    hass: HomeAssistant,
    live: dict[str, Any],
    hass_storage: dict[str, Any],
    freezer: FrozenDateTimeFactory,
) -> None:
    freezer.move_to(NOW)
    fetched_at = (NOW - timedelta(days=1)).isoformat()
    hubs = {
        str(hub): {"fetched_at": fetched_at, "lines_at_stop": {}}
        for hub in S_BAHN_NETWORK_HUBS
    }
    hubs[str(MEIDLING)]["lines_at_stop"] = {str(HANDELSKAI): ["S45"]}
    # A hub dropped from the list since the store was written.
    hubs["60299999"] = {"fetched_at": fetched_at, "lines_at_stop": {"1": ["S9"]}}
    hass_storage[STORE_KEY] = {
        "version": STORE_VERSION,
        "key": STORE_KEY,
        "data": {"hubs": hubs},
    }
    with patch(_FETCH, new_callable=AsyncMock) as fetch:
        network = await async_update_network(hass)

    fetch.assert_not_awaited()
    assert network.lines_at_diva == {HANDELSKAI: ("S45",)}
    assert live[S_BAHN_NETWORK_KEY] is network


async def test_corrupt_store_is_ignored_and_refetched(
    hass: HomeAssistant,
    live: dict[str, Any],
    hass_storage: dict[str, Any],
    caplog: pytest.LogCaptureFixture,
) -> None:
    hass_storage[STORE_KEY] = {
        "version": STORE_VERSION,
        "key": STORE_KEY,
        "data": {"hubs": {str(PRATERSTERN): {"fetched_at": "not a date"}}},
    }
    with (
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()) as fetch,
        patch(_COOLDOWN, new_callable=AsyncMock),
    ):
        await async_update_network(hass)

    assert "corrupt stored S-Bahn network" in caplog.text
    assert fetch.await_count == len(S_BAHN_NETWORK_HUBS)


async def test_unreadable_store_is_ignored(
    hass: HomeAssistant, live: dict[str, Any], caplog: pytest.LogCaptureFixture
) -> None:
    with (
        patch(f"{_MODULE}.Store.async_load", side_effect=OSError("disk")),
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()),
        patch(_COOLDOWN, new_callable=AsyncMock),
    ):
        network = await async_update_network(hass)
    assert "Failed to read the stored S-Bahn network" in caplog.text
    assert network.stale_hubs(datetime.now(UTC)) == []


async def test_failed_hub_keeps_its_previous_sample(
    hass: HomeAssistant,
    live: dict[str, Any],
    freezer: FrozenDateTimeFactory,
    caplog: pytest.LogCaptureFixture,
) -> None:
    freezer.move_to(NOW)
    previous = _fresh_network(praterstern={FLORIDSDORF: {"S1"}})
    previous.hubs[PRATERSTERN] = _sample({FLORIDSDORF: {"S1"}}, S_BAHN_NETWORK_MAX_AGE)
    previous.hubs[MEIDLING] = _sample({}, S_BAHN_NETWORK_MAX_AGE)
    live[S_BAHN_NETWORK_KEY] = previous

    async def _fetch(_session: Any, params: Any, *_args: Any, **_kw: Any) -> Any:
        if dict(params)["name_dm"] == str(PRATERSTERN):
            raise RoutingError("api_timeout", {"seconds": "20"})
        return _body(_train("S80", [str(MEIDLING), str(HANDELSKAI)]))

    with (
        patch(_FETCH, side_effect=_fetch),
        patch(_COOLDOWN, new_callable=AsyncMock),
        caplog.at_level(logging.WARNING),
    ):
        network = await async_update_network(hass)

    assert network is not previous
    assert network.hubs[PRATERSTERN] is previous.hubs[PRATERSTERN]
    assert network.lines_at_diva[FLORIDSDORF] == ("S1",)
    assert network.lines_at_diva[HANDELSKAI] == ("S80",)
    assert "1 of 2 hub requests failed" in caplog.text
    # The failed hub is still stale, so tomorrow's check retries it.
    assert network.stale_hubs(NOW) == [PRATERSTERN]


async def test_all_hubs_failing_publishes_nothing_new(
    hass: HomeAssistant, live: dict[str, Any], hass_storage: dict[str, Any]
) -> None:
    with (
        patch(
            _FETCH,
            new_callable=AsyncMock,
            side_effect=RoutingError("api_timeout", {"seconds": "20"}),
        ),
        patch(_COOLDOWN, new_callable=AsyncMock),
    ):
        network = await async_update_network(hass)

    assert network.hubs == {}
    assert live[S_BAHN_NETWORK_KEY] is network
    assert STORE_KEY not in hass_storage


async def test_update_after_last_unload_does_not_republish(
    hass: HomeAssistant, live: dict[str, Any]
) -> None:
    live[S_BAHN_NETWORK_KEY] = SBahnNetwork()

    async def _unload_meanwhile(*_args: Any, **_kw: Any) -> dict[str, Any]:
        live[ENTRY_COUNT_KEY] = 0
        live.pop(S_BAHN_NETWORK_KEY, None)
        return _body(_train("S1", [str(FLORIDSDORF)]))

    with (
        patch(_FETCH, side_effect=_unload_meanwhile),
        patch(_COOLDOWN, new_callable=AsyncMock),
    ):
        await async_update_network(hass)
    assert S_BAHN_NETWORK_KEY not in live


async def test_store_write_failure_keeps_the_network_in_memory(
    hass: HomeAssistant, live: dict[str, Any], caplog: pytest.LogCaptureFixture
) -> None:
    with (
        patch(f"{_MODULE}.Store.async_save", side_effect=OSError("read-only")),
        patch(_FETCH, new_callable=AsyncMock, return_value=_body()),
        patch(_COOLDOWN, new_callable=AsyncMock),
    ):
        network = await async_update_network(hass)
    assert live[S_BAHN_NETWORK_KEY] is network
    assert "Failed to persist the S-Bahn network" in caplog.text


# ---------------------------------------------------------------------------
# Scheduling and entry lifecycle
# ---------------------------------------------------------------------------


async def test_schedule_runs_one_update_at_a_time(
    hass: HomeAssistant, live: dict[str, Any]
) -> None:
    release = asyncio.Event()

    async def _slow(_hass: HomeAssistant) -> SBahnNetwork:
        await release.wait()
        return SBahnNetwork()

    with patch(f"{_MODULE}.async_update_network", side_effect=_slow) as update:
        async_schedule_network_update(hass)
        first = live[S_BAHN_NETWORK_TASK_KEY]
        async_schedule_network_update(hass)
        assert live[S_BAHN_NETWORK_TASK_KEY] is first
        release.set()
        await hass.async_block_till_done()
    assert update.await_count == 1


async def test_scheduled_update_failure_is_logged_not_raised(
    hass: HomeAssistant, live: dict[str, Any], caplog: pytest.LogCaptureFixture
) -> None:
    with patch(
        f"{_MODULE}.async_update_network",
        new_callable=AsyncMock,
        side_effect=RuntimeError("boom"),
    ):
        async_schedule_network_update(hass)
        await hass.async_block_till_done()
    assert "S-Bahn network update failed: boom" in caplog.text


async def test_board_setup_starts_the_network_and_unload_clears_it(
    hass: HomeAssistant, mock_fetch, mock_s_bahn_network_update
) -> None:
    entry = make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    mock_s_bahn_network_update.assert_called_once_with(hass)
    domain_data = hass.data[DOMAIN]
    assert "s_bahn_network_unsub" in domain_data
    domain_data[S_BAHN_NETWORK_KEY] = SBahnNetwork()

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert "s_bahn_network_unsub" not in domain_data
    assert S_BAHN_NETWORK_KEY not in domain_data
