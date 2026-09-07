"""Tests for the alerts module (traffic info + elevator info)."""

from __future__ import annotations

import logging
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from homeassistant.core import HomeAssistant

from custom_components.wiener_linien_austria.alerts import (
    ElevatorInfo,
    TrafficInfo,
    _fetch_info_lists,
    _FetchFailed,
    _parse_elevator,
    _parse_traffic,
    _split_by_category,
    async_refresh_alerts,
    get_alerts_for,
)
from custom_components.wiener_linien_austria.const import (
    ALERT_FEED_ELEVATOR,
    ALERT_FEED_TRAFFIC,
    DOMAIN,
    ELEVATOR_INFO_KEY,
    ENTRY_COUNT_KEY,
    TRAFFIC_INFO_KEY,
)
from tests.conftest import make_response_cm

ALERTS_LOGGER = "custom_components.wiener_linien_austria.alerts"


@pytest.fixture(autouse=True)
def _seed_active_domain(hass: HomeAssistant) -> None:
    """Seed `ENTRY_COUNT_KEY=1` so `async_refresh_alerts` doesn't bail.

    Production code now bails when no entries are loaded (so a refresh
    racing with last-unload can't re-poison `hass.data[DOMAIN]`). Tests
    don't go through `async_setup_entry`, so we pretend an entry is
    active here.
    """
    hass.data.setdefault(DOMAIN, {})[ENTRY_COUNT_KEY] = 1


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


def _combined_body(
    traffic: list[dict[str, Any]] | None = None,
    elevator: list[dict[str, Any]] | None = None,
    *,
    traffic_id: int = 2,
    elevator_id: int = 1,
) -> dict[str, Any]:
    """Build a realistic multi-`name` /trafficInfoList payload.

    Mirrors the live shape measured 2026-09-07: one flat `trafficInfos`
    list, every entry tagged with `refTrafficInfoCategoryId`, resolved
    through a `trafficInfoCategories` table. The default ids deliberately
    put `aufzugsinfo` at 1 and `stoerunglang` at 2 — the reverse of the
    order the `name=` params are sent in — because that is what upstream
    actually returns and the routing must not depend on request order.
    """
    infos: list[dict[str, Any]] = []
    categories: list[dict[str, Any]] = []
    if elevator is not None:
        categories.append({"id": elevator_id, "name": ALERT_FEED_ELEVATOR})
        infos += [{**e, "refTrafficInfoCategoryId": elevator_id} for e in elevator]
    if traffic is not None:
        categories.append({"id": traffic_id, "name": ALERT_FEED_TRAFFIC})
        infos += [{**t, "refTrafficInfoCategoryId": traffic_id} for t in traffic]
    return {
        "message": {"messageCode": 1},
        "data": {"trafficInfos": infos, "trafficInfoCategories": categories},
    }


def _json_response(body: dict[str, Any]) -> MagicMock:
    """A MagicMock response whose .json() resolves to `body`."""
    resp = MagicMock()
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    return resp


async def test_async_refresh_alerts_populates_caches(hass: HomeAssistant) -> None:
    """ONE fetch carrying both names populates both caches.

    Also pins the request shape that makes that possible: repeated `name=`
    params in a single GET. Two separate calls would still populate the
    caches, so asserting the call count is the only thing that stops a
    refactor silently reintroducing the second request — and with it the
    15-second domain-lock stall it used to cost every cycle.
    """
    body = _combined_body(
        traffic=[
            {
                "name": "T1",
                "title": "U4: Short",
                "description": "x",
                "relatedLines": ["U4"],
                "status": "active",
                "time": {},
            }
        ],
        elevator=[
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
        ],
    )

    fake_session = MagicMock()
    fake_session.get = MagicMock(return_value=make_response_cm(_json_response(body)))

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        await async_refresh_alerts(hass)

    assert fake_session.get.call_count == 1, "both feeds must ride in one request"
    params = fake_session.get.call_args.kwargs["params"]
    assert [v for k, v in params if k == "name"] == [
        ALERT_FEED_TRAFFIC,
        ALERT_FEED_ELEVATOR,
    ]

    traffic = hass.data[DOMAIN][TRAFFIC_INFO_KEY]
    elevator = hass.data[DOMAIN][ELEVATOR_INFO_KEY]
    assert [t.name for t in traffic] == ["T1"]
    assert [e.name for e in elevator] == ["E1"]
    assert elevator[0].related_stops == [4111]


async def test_async_refresh_drops_resolved_traffic(hass: HomeAssistant) -> None:
    """`status: resolved` entries must not reach the cache."""
    traffic_body = _combined_body(
        traffic=[
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
        ],
        elevator=[],
    )
    fake_session = MagicMock()
    fake_session.get = MagicMock(
        return_value=make_response_cm(_json_response(traffic_body))
    )

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
    fake_session.get = MagicMock(side_effect=TimeoutError())

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        # Should not raise.
        await async_refresh_alerts(hass)

    # Caches are empty lists, not missing keys.
    assert hass.data[DOMAIN][TRAFFIC_INFO_KEY] == []
    assert hass.data[DOMAIN][ELEVATOR_INFO_KEY] == []


async def test_fetch_info_lists_propagates_unexpected_errors(
    hass: HomeAssistant,
) -> None:
    """Unexpected exceptions (programming errors) must propagate.

    The except-list in `_fetch_info_lists` is deliberately narrow
    (aiohttp.ClientError, aiohttp.ContentTypeError, asyncio.TimeoutError,
    ValueError) so real bugs surface during development instead of being
    silently swallowed by the 5-min periodic refresh. HA's
    async_track_time_interval logs the traceback for us.
    """
    fake_session = MagicMock()
    fake_session.get = MagicMock(side_effect=RuntimeError("unexpected"))

    with (
        patch(
            "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
            return_value=fake_session,
        ),
        pytest.raises(RuntimeError),
    ):
        await _fetch_info_lists(hass)


# ---------------------------------------------------------------------------
# _fetch_info_lists: direct tests of the combined helper's error branches
# ---------------------------------------------------------------------------


def _mock_session(resp: MagicMock) -> MagicMock:
    """Build a fake aiohttp session whose .get() returns `resp`.

    Production code uses `async with session.get(...) as resp:`, so the
    return value of .get must be an async context manager. We use the
    shared `make_response_cm` helper from conftest to wrap the response.
    """
    fake = MagicMock()
    fake.get = MagicMock(return_value=make_response_cm(resp))
    return fake


async def test_fetch_info_lists_http_error_returns_failed(
    hass: HomeAssistant,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """A 5xx from upstream yields _FETCH_FAILED so the caller leaves the
    cache untouched (vs an empty `[]`, which would now overwrite it).

    It is logged at debug, not warning: the ÖDV endpoint sheds load with
    502/503 routinely, alerts are advisory, and a warning-level traceback
    per occurrence drowns out real faults.
    """
    req_info = MagicMock()
    req_info.real_url = "https://example/trafficInfoList"
    err = aiohttp.ClientResponseError(
        request_info=req_info, history=(), status=503, message="boom"
    )
    resp = MagicMock()
    resp.raise_for_status = MagicMock(side_effect=err)
    resp.json = AsyncMock()
    fake_session = _mock_session(resp)

    with (
        caplog.at_level(logging.DEBUG, logger=ALERTS_LOGGER),
        patch(
            "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
            return_value=fake_session,
        ),
    ):
        result = await _fetch_info_lists(hass)
    assert isinstance(result, _FetchFailed)

    records = [r for r in caplog.records if r.name == ALERTS_LOGGER]
    assert [r.levelno for r in records] == [logging.DEBUG]
    assert "stoerunglang" in records[0].getMessage()
    # No traceback attached — that is the whole point of the downgrade.
    assert records[0].exc_info is None


async def test_fetch_info_lists_bad_content_type_still_warns(
    hass: HomeAssistant,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """A non-JSON body is a contract break, not routine load-shedding, so
    it keeps its warning-level traceback while 5xx is demoted to debug."""
    req_info = MagicMock()
    req_info.real_url = "https://example/trafficInfoList"
    err = aiohttp.ContentTypeError(
        request_info=req_info, history=(), message="not json"
    )
    resp = MagicMock()
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(side_effect=err)
    fake_session = _mock_session(resp)

    with (
        caplog.at_level(logging.DEBUG, logger=ALERTS_LOGGER),
        patch(
            "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
            return_value=fake_session,
        ),
    ):
        result = await _fetch_info_lists(hass)
    assert isinstance(result, _FetchFailed)

    records = [r for r in caplog.records if r.name == ALERTS_LOGGER]
    assert [r.levelno for r in records] == [logging.WARNING]
    assert records[0].exc_info is not None


async def test_fetch_info_lists_non_ok_message_code_returns_failed(
    hass: HomeAssistant,
) -> None:
    """messageCode ≠ 1 drops the payload as _FETCH_FAILED — the cache
    survives instead of being overwritten with an empty list."""
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
        result = await _fetch_info_lists(hass)
    assert isinstance(result, _FetchFailed)


async def test_fetch_info_lists_non_dict_body_returns_failed(
    hass: HomeAssistant,
) -> None:
    """JSON that decodes to a non-object returns _FETCH_FAILED so the
    cache isn't overwritten."""
    resp = MagicMock()
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=["not", "a", "dict"])
    fake_session = _mock_session(resp)

    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=fake_session,
    ):
        result = await _fetch_info_lists(hass)
    assert isinstance(result, _FetchFailed)


async def test_fetch_info_lists_filters_non_dict_entries(
    hass: HomeAssistant,
) -> None:
    """trafficInfos items that aren't dicts are silently filtered out."""
    body = {
        "message": {"messageCode": 1},
        "data": {
            "trafficInfoCategories": [{"id": 2, "name": ALERT_FEED_TRAFFIC}],
            "trafficInfos": [
                {"name": "good", "title": "y", "refTrafficInfoCategoryId": 2},
                "not-a-dict",
                None,
                42,
            ],
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
        result = await _fetch_info_lists(hass)
    assert not isinstance(result, _FetchFailed)
    assert result[ALERT_FEED_TRAFFIC] == [
        {"name": "good", "title": "y", "refTrafficInfoCategoryId": 2}
    ]
    # The feed we asked for but upstream had nothing for is present and empty,
    # never missing — the caller indexes both keys unconditionally.
    assert result[ALERT_FEED_ELEVATOR] == []


# ---------------------------------------------------------------------------
# get_alerts_for: elevator line-fallback branch (related_stops empty,
# matches via related_lines). This branch was previously untested.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# _split_by_category: routing a combined payload back into per-feed lists
# ---------------------------------------------------------------------------


def test_split_by_category_ignores_request_order() -> None:
    """Routing follows the category table, never the order names were sent.

    Measured against the live API 2026-09-07: `stoerunglang` sent as the
    FIRST `name=` param came back as category id 2, `aufzugsinfo` as id 1.
    Anything that infers the feed from parameter position gets both feeds
    backwards, and the failure is silent — elevator outages would render as
    line disruptions and vice versa.
    """
    data = {
        "trafficInfoCategories": [
            {"id": 1, "name": ALERT_FEED_ELEVATOR},
            {"id": 2, "name": ALERT_FEED_TRAFFIC},
        ],
        "trafficInfos": [
            {"name": "E1", "refTrafficInfoCategoryId": 1},
            {"name": "T1", "refTrafficInfoCategoryId": 2},
        ],
    }
    out = _split_by_category(data)
    assert [e["name"] for e in out[ALERT_FEED_ELEVATOR]] == ["E1"]
    assert [t["name"] for t in out[ALERT_FEED_TRAFFIC]] == ["T1"]


def test_split_by_category_absent_category_yields_empty_list() -> None:
    """A feed with no current disruptions is absent upstream, empty here.

    The docs are explicit that `trafficInfoCategories` lists a category only
    when it has entries. That absence means "nothing active", which must
    CLEAR the cache — returning a missing key instead would either KeyError
    in the caller or preserve a resolved disruption forever.
    """
    data = {
        "trafficInfoCategories": [{"id": 7, "name": ALERT_FEED_TRAFFIC}],
        "trafficInfos": [{"name": "T1", "refTrafficInfoCategoryId": 7}],
    }
    out = _split_by_category(data)
    assert set(out) == {ALERT_FEED_TRAFFIC, ALERT_FEED_ELEVATOR}
    assert out[ALERT_FEED_ELEVATOR] == []


def test_split_by_category_drops_unknown_and_malformed() -> None:
    """Entries we can't attribute to a requested feed are dropped.

    Covers a fifth category appearing upstream (we only ever asked for two),
    a non-integer category ref, and non-dict rows in either list.
    """
    data = {
        "trafficInfoCategories": [
            {"id": 1, "name": ALERT_FEED_ELEVATOR},
            {"id": 4, "name": "fahrtreppeninfo"},
            "not-a-dict",
            {"id": "5", "name": ALERT_FEED_TRAFFIC},
        ],
        "trafficInfos": [
            {"name": "E1", "refTrafficInfoCategoryId": 1},
            {"name": "ESCALATOR", "refTrafficInfoCategoryId": 4},
            {"name": "NO_REF"},
            {"name": "BAD_REF", "refTrafficInfoCategoryId": "1"},
            "not-a-dict",
        ],
    }
    out = _split_by_category(data)
    assert [e["name"] for e in out[ALERT_FEED_ELEVATOR]] == ["E1"]
    assert out[ALERT_FEED_TRAFFIC] == []


def test_split_by_category_handles_empty_payload() -> None:
    """A `data` object with neither key still yields both feeds, empty."""
    assert _split_by_category({}) == {ALERT_FEED_TRAFFIC: [], ALERT_FEED_ELEVATOR: []}


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
