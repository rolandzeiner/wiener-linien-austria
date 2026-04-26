"""Tests for the alerts module (traffic info + elevator info)."""
from __future__ import annotations

import asyncio
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from homeassistant.core import HomeAssistant

from custom_components.wiener_linien_austria.alerts import (
    ElevatorInfo,
    TrafficInfo,
    _fetch_info_list,
    _parse_elevator,
    _parse_traffic,
    async_refresh_alerts,
    get_alerts_for,
)
from custom_components.wiener_linien_austria.const import (
    DOMAIN,
    ELEVATOR_INFO_KEY,
    TRAFFIC_INFO_KEY,
)


# ---------------------------------------------------------------------------
# Parse
# ---------------------------------------------------------------------------


def test_parse_traffic_extracts_core_fields() -> None:
    raw = {
        "name": "I20260420-0032",
        "title": "49A: Verkehrsunfall",
        "description": "Linie 49A: Unregelmäßige Intervalle.",
        "descriptionHTML": "Linie 49A:<br>Unregelmäßige Intervalle.",
        "location": "Stadionallee",
        "status": "active",
        "time": {
            "start": "2026-04-20T16:42:00+0200",
            "end": "2026-04-20T23:55:00+0200",
            "created": "2026-04-20T16:42:00+0200",
            "lastUpdate": "2026-04-20T17:00:00+0200",
        },
        "relatedLines": ["49A"],
        "attributes": {"relatedLineTypes": {"49A": "ptBusCity"}},
    }
    t = _parse_traffic(raw)
    assert t.name == "I20260420-0032"
    assert t.title == "49A: Verkehrsunfall"
    assert t.related_lines == ["49A"]
    assert t.line_types == {"49A": "ptBusCity"}
    assert t.location == "Stadionallee"
    assert t.description_html == "Linie 49A:<br>Unregelmäßige Intervalle."
    assert t.time_start == "2026-04-20T16:42:00+0200"
    assert t.time_end == "2026-04-20T23:55:00+0200"
    assert t.time_created == "2026-04-20T16:42:00+0200"
    assert t.time_last_update == "2026-04-20T17:00:00+0200"
    assert t.status == "active"


def test_parse_elevator_pulls_attributes_fallback() -> None:
    """Elevator entries carry related info under `attributes` as well as top-level."""
    raw = {
        "name": "ftazS_475",
        "title": "Tscherttegasse",
        "description": "U6 Bahnsteig Richtung Siebenhirten - Ausgang Tscherttegasse",
        "attributes": {
            "reason": "AUFZUGSERNEUERUNG",
            "station": "Tscherttegasse",
            "relatedLines": ["U6"],
            "relatedStops": [4629],
            "status": "außer Betrieb",
            "location": "U6 Bahnsteig Richtung Siebenhirten",
        },
        "time": {"start": "2026-05-28T01:15:00+0200"},
    }
    e = _parse_elevator(raw)
    assert e.station == "Tscherttegasse"
    assert e.reason == "AUFZUGSERNEUERUNG"
    assert e.status == "außer Betrieb"
    assert e.related_lines == ["U6"]
    assert e.related_stops == [4629]


def test_parse_elevator_tolerates_missing_fields() -> None:
    """Entries with no attributes at all still parse without raising."""
    e = _parse_elevator({"name": "x"})
    assert isinstance(e, ElevatorInfo)
    assert e.station == ""
    assert e.related_stops == []


# ---------------------------------------------------------------------------
# Filter
# ---------------------------------------------------------------------------


def _seed(hass: HomeAssistant) -> None:
    """Populate hass.data with one traffic + one elevator entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][TRAFFIC_INFO_KEY] = [
        TrafficInfo(
            name="T1",
            title="49A: Verkehrsunfall",
            description="Linie 49A unregelmäßig.",
            related_lines=["49A"],
            time_start=None,
            time_end=None,
            status="active",
        ),
        TrafficInfo(
            name="T2",
            title="U4: Kurze Unterbrechung",
            description="Linie U4.",
            related_lines=["U4"],
            time_start=None,
            time_end=None,
            status="active",
        ),
    ]
    hass.data[DOMAIN][ELEVATOR_INFO_KEY] = [
        ElevatorInfo(
            name="E1",
            station="Tscherttegasse",
            description="U6 Bahnsteig",
            reason="AUFZUGSERNEUERUNG",
            status="außer Betrieb",
            related_lines=["U6"],
            related_stops=[4629],
            time_start=None,
            time_end=None,
        ),
        ElevatorInfo(
            name="E2",
            station="Stephansplatz",
            description="U1 Ausgang",
            reason="",
            status="außer Betrieb",
            related_lines=["U1"],
            related_stops=[4111],
            time_start=None,
            time_end=None,
        ),
    ]


async def test_get_alerts_for_line_match(hass: HomeAssistant) -> None:
    _seed(hass)
    traffic, elevator = get_alerts_for(hass, {"U4"}, set())
    assert [t.name for t in traffic] == ["T2"]
    # No RBLs supplied, no line-only elevator fallback path → empty.
    assert elevator == []


async def test_get_alerts_for_rbl_match(hass: HomeAssistant) -> None:
    _seed(hass)
    traffic, elevator = get_alerts_for(hass, {"U6"}, {4629})
    # Line match on the traffic side wouldn't hit (we have no U6 traffic).
    assert traffic == []
    assert [e.name for e in elevator] == ["E1"]


async def test_get_alerts_for_empty_cache(hass: HomeAssistant) -> None:
    """With no cached alerts, both sides are empty lists, not None."""
    traffic, elevator = get_alerts_for(hass, {"U1"}, {4111})
    assert traffic == []
    assert elevator == []


async def test_get_alerts_for_no_lines_returns_all_traffic(hass: HomeAssistant) -> None:
    """Empty `lines` set falls through to all traffic alerts."""
    _seed(hass)
    traffic, _ = get_alerts_for(hass, None, {4111})
    assert {t.name for t in traffic} == {"T1", "T2"}


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------


async def test_async_refresh_alerts_populates_caches(hass: HomeAssistant) -> None:
    """One fetch for stoerunglang + one for aufzugsinfo, caches populated."""
    traffic_body = {
        "message": {"messageCode": 1},
        "data": {
            "trafficInfos": [
                {
                    "name": "T1",
                    "title": "U4: Short",
                    "description": "x",
                    "relatedLines": ["U4"],
                    "status": "active",
                    "time": {},
                }
            ]
        },
    }
    elevator_body = {
        "message": {"messageCode": 1},
        "data": {
            "trafficInfos": [
                {
                    "name": "E1",
                    "title": "Stephansplatz",
                    "description": "U1 exit",
                    "attributes": {
                        "station": "Stephansplatz",
                        "reason": "renovation",
                        "relatedLines": ["U1"],
                        "relatedStops": [4111],
                        "status": "außer Betrieb",
                    },
                    "time": {},
                }
            ]
        },
    }

    resp_traffic = MagicMock()
    resp_traffic.raise_for_status = MagicMock()
    resp_traffic.json = AsyncMock(return_value=traffic_body)
    resp_elevator = MagicMock()
    resp_elevator.raise_for_status = MagicMock()
    resp_elevator.json = AsyncMock(return_value=elevator_body)

    async def fake_get(url: str, **kwargs: object) -> MagicMock:
        name = next((v for k, v in kwargs["params"] if k == "name"), None)
        return resp_elevator if name == "aufzugsinfo" else resp_traffic

    fake_session = MagicMock()
    fake_session.get = AsyncMock(side_effect=fake_get)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        await async_refresh_alerts(hass)

    traffic = hass.data[DOMAIN][TRAFFIC_INFO_KEY]
    elevator = hass.data[DOMAIN][ELEVATOR_INFO_KEY]
    assert [t.name for t in traffic] == ["T1"]
    assert [e.name for e in elevator] == ["E1"]
    assert elevator[0].related_stops == [4111]


async def test_async_refresh_drops_resolved_traffic(hass: HomeAssistant) -> None:
    """`status: resolved` entries must not reach the cache."""
    traffic_body = {
        "message": {"messageCode": 1},
        "data": {
            "trafficInfos": [
                {
                    "name": "ACTIVE",
                    "title": "U4: disrupt",
                    "description": "x",
                    "relatedLines": ["U4"],
                    "status": "active",
                    "time": {},
                },
                {
                    "name": "DONE",
                    "title": "U1: over",
                    "description": "y",
                    "relatedLines": ["U1"],
                    "status": "resolved",
                    "time": {},
                },
            ]
        },
    }
    elevator_body = {"message": {"messageCode": 1}, "data": {"trafficInfos": []}}

    def _resp(body: dict[str, Any]) -> MagicMock:
        r = MagicMock()
        r.raise_for_status = MagicMock()
        r.json = AsyncMock(return_value=body)
        return r

    async def fake_get(url: str, **kwargs: object) -> MagicMock:
        name = next((v for k, v in kwargs["params"] if k == "name"), None)
        return _resp(elevator_body if name == "aufzugsinfo" else traffic_body)

    fake_session = MagicMock()
    fake_session.get = AsyncMock(side_effect=fake_get)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        await async_refresh_alerts(hass)

    names = [t.name for t in hass.data[DOMAIN][TRAFFIC_INFO_KEY]]
    assert names == ["ACTIVE"]


async def test_async_refresh_alerts_swallows_errors(hass: HomeAssistant) -> None:
    """Fetch failures must not raise — alerts are advisory."""
    fake_session = MagicMock()
    fake_session.get = AsyncMock(side_effect=asyncio.TimeoutError())

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        # Should not raise.
        await async_refresh_alerts(hass)

    # Caches are empty lists, not missing keys.
    assert hass.data[DOMAIN][TRAFFIC_INFO_KEY] == []
    assert hass.data[DOMAIN][ELEVATOR_INFO_KEY] == []


async def test_fetch_info_list_propagates_unexpected_errors(
    hass: HomeAssistant,
) -> None:
    """Unexpected exceptions (programming errors) must propagate.

    The except-list in `_fetch_info_list` is deliberately narrow
    (aiohttp.ClientError, aiohttp.ContentTypeError, asyncio.TimeoutError,
    ValueError) so real bugs surface during development instead of being
    silently swallowed by the 5-min periodic refresh. HA's
    async_track_time_interval logs the traceback for us.
    """
    fake_session = MagicMock()
    fake_session.get = AsyncMock(side_effect=RuntimeError("unexpected"))

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        with pytest.raises(RuntimeError):
            await _fetch_info_list(hass, "stoerunglang")


# ---------------------------------------------------------------------------
# _fetch_info_list: direct tests of the per-name helper's error branches
# ---------------------------------------------------------------------------


def _mock_session(resp: MagicMock) -> MagicMock:
    """Build a fake aiohttp session whose .get() returns `resp`."""
    fake = MagicMock()
    fake.get = AsyncMock(return_value=resp)
    return fake


async def test_fetch_info_list_http_error_returns_empty(
    hass: HomeAssistant,
) -> None:
    """A 5xx from upstream yields []; advisory alerts never raise up."""
    req_info = MagicMock()
    req_info.real_url = "https://example/trafficInfoList"
    err = aiohttp.ClientResponseError(
        request_info=req_info, history=(), status=503, message="boom"
    )
    resp = MagicMock()
    resp.raise_for_status = MagicMock(side_effect=err)
    resp.json = AsyncMock()
    fake_session = _mock_session(resp)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        result = await _fetch_info_list(hass, "stoerunglang")
    assert result == []


async def test_fetch_info_list_non_ok_message_code_returns_empty(
    hass: HomeAssistant,
) -> None:
    """messageCode ≠ 1 drops the payload even if trafficInfos is populated."""
    body = {
        "message": {"messageCode": 316, "value": "Rate limit"},
        "data": {"trafficInfos": [{"name": "T1", "title": "x"}]},
    }
    resp = MagicMock()
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    fake_session = _mock_session(resp)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        result = await _fetch_info_list(hass, "stoerunglang")
    assert result == []


async def test_fetch_info_list_non_dict_body_returns_empty(
    hass: HomeAssistant,
) -> None:
    """JSON that decodes to a non-object falls through to []."""
    resp = MagicMock()
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=["not", "a", "dict"])
    fake_session = _mock_session(resp)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        result = await _fetch_info_list(hass, "stoerunglang")
    assert result == []


async def test_fetch_info_list_filters_non_dict_entries(
    hass: HomeAssistant,
) -> None:
    """trafficInfos items that aren't dicts are silently filtered out."""
    body = {
        "message": {"messageCode": 1},
        "data": {
            "trafficInfos": [
                {"name": "good", "title": "y"},
                "not-a-dict",
                None,
                42,
            ]
        },
    }
    resp = MagicMock()
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    fake_session = _mock_session(resp)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        result = await _fetch_info_list(hass, "stoerunglang")
    assert result == [{"name": "good", "title": "y"}]


# ---------------------------------------------------------------------------
# get_alerts_for: elevator line-fallback branch (related_stops empty,
# matches via related_lines). This branch was previously untested.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Conditional GET — 304 Not Modified
# ---------------------------------------------------------------------------


async def test_async_refresh_alerts_304_keeps_existing_cache(
    hass: HomeAssistant,
) -> None:
    """A 304 from `/trafficInfoList` must leave the existing parsed cache alone.

    Regression guard for the conditional-GET path. If 304 incorrectly fell
    through to `resp.json()` we'd either crash (304 has no body) or wipe
    the existing cache. The fix: detect status==304 and return the
    `_NOT_MODIFIED` sentinel, which `async_refresh_alerts` interprets as
    "don't touch the cache".
    """
    # Pre-seed the cache so we can assert it survives.
    pre_existing_traffic = TrafficInfo(
        name="PRE", title="U1: prior", description="x",
        related_lines=["U1"], time_start=None, time_end=None, status="active",
    )
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][TRAFFIC_INFO_KEY] = [pre_existing_traffic]
    hass.data[DOMAIN][ELEVATOR_INFO_KEY] = []

    resp_304 = MagicMock()
    resp_304.status = 304
    resp_304.headers = {"ETag": '"abc"'}
    resp_304.raise_for_status = MagicMock()
    resp_304.json = AsyncMock(side_effect=AssertionError("must not call .json() on 304"))

    fake_session = MagicMock()
    fake_session.get = AsyncMock(return_value=resp_304)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        await async_refresh_alerts(hass)

    # Cache survives 304 untouched.
    assert hass.data[DOMAIN][TRAFFIC_INFO_KEY] == [pre_existing_traffic]


async def test_async_refresh_alerts_sends_validators_on_subsequent_call(
    hass: HomeAssistant,
) -> None:
    """After a 200 captures ETag/Last-Modified, the next call sends them back."""
    body = {
        "message": {"messageCode": 1},
        "data": {"trafficInfos": [{"name": "T1", "title": "U1: x", "relatedLines": ["U1"], "status": "active", "time": {}}]},
    }
    resp_first = MagicMock()
    resp_first.status = 200
    resp_first.headers = {"ETag": '"v1"', "Last-Modified": "Wed, 22 Apr 2026 10:00:00 GMT"}
    resp_first.raise_for_status = MagicMock()
    resp_first.json = AsyncMock(return_value=body)

    resp_second = MagicMock()
    resp_second.status = 200
    resp_second.headers = {}
    resp_second.raise_for_status = MagicMock()
    resp_second.json = AsyncMock(return_value=body)

    fake_session = MagicMock()
    fake_session.get = AsyncMock(side_effect=[resp_first, resp_first, resp_second, resp_second])

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        await async_refresh_alerts(hass)
        await async_refresh_alerts(hass)

    # Find the third call (start of the second refresh, stoerunglang again).
    second_pass_calls = fake_session.get.call_args_list[2:]
    assert any(
        c.kwargs["headers"].get("If-None-Match") == '"v1"'
        for c in second_pass_calls
    ), "second refresh must echo the ETag captured on first response"


async def test_get_alerts_for_elevator_line_fallback(hass: HomeAssistant) -> None:
    """An elevator outage with no RBL mapping still matches via related_lines.

    Upstream sometimes publishes elevator alerts that carry a line list but
    no `relatedStops` — e.g. "elevators on U1 in general". The line-fallback
    branch of `get_alerts_for` surfaces those when any of the user's tracked
    RBLs is set AND a line matches. Without this branch, the user would see
    no elevator warning at all for line-scoped outages.
    """
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][TRAFFIC_INFO_KEY] = []
    hass.data[DOMAIN][ELEVATOR_INFO_KEY] = [
        ElevatorInfo(
            name="LINE_ONLY",
            station="U1",
            description="line-wide note",
            reason="",
            status="außer Betrieb",
            related_lines=["U1"],
            related_stops=[],  # no RBL mapping
            time_start=None,
            time_end=None,
        ),
    ]
    _traffic, elevator = get_alerts_for(hass, {"U1"}, {4111})
    assert [e.name for e in elevator] == ["LINE_ONLY"]
