"""Tests for the shared MonitorBatchGroup fetcher.

These cover the HTTP / 304 / rate-limit / backoff / domain-cooldown behaviour
that used to live on the per-entry coordinator, now re-homed to the batch
group, PLUS the batching-specific behaviour: RBL union/dedupe, one combined
request for N members, and per-member fan-out (each member keeps only its own
stops, a missing RBL yields empty-not-error).
"""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import UpdateFailed
from homeassistant.util import dt as dt_util

from custom_components.wiener_linien_austria.batch import (
    BatchResult,
    MonitorBatchGroup,
)
from custom_components.wiener_linien_austria.const import (
    BACKOFF_CAP_SECONDS,
    CONF_RBLS,
    DOMAIN,
    DOMAIN_COOLDOWN_SECONDS,
    DOMAIN_LAST_CALL_KEY,
    ERR_RATE_LIMIT,
)
from custom_components.wiener_linien_austria.coordinator import (
    WienerLinienAustriaCoordinator,
)

from .conftest import make_entry, make_response_cm

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _ok_response(body: dict, headers: dict | None = None) -> MagicMock:
    """A MagicMock aiohttp response that returns `body` from .json()."""
    resp = MagicMock()
    resp.status = 200
    resp.headers = headers if headers is not None else {}
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    return resp


def _member(
    hass: HomeAssistant,
    *,
    data: dict | None = None,
    unique_id: str = "diva_60201012",
) -> WienerLinienAustriaCoordinator:
    """Build a config entry + coordinator without running full setup."""
    entry = make_entry(data, unique_id=unique_id)
    entry.add_to_hass(hass)
    return WienerLinienAustriaCoordinator(hass, entry)


def _group_with_member(
    hass: HomeAssistant,
    *,
    interval: int = 60,
    data: dict | None = None,
) -> tuple[MonitorBatchGroup, WienerLinienAustriaCoordinator]:
    """A batch group with one attached member coordinator."""
    group = MonitorBatchGroup(hass, interval)
    coordinator = _member(hass, data=data)
    group.add_member(coordinator)
    coordinator.attach_batch(group)
    return group, coordinator


def _patch_get(group: MonitorBatchGroup, mock_get: MagicMock) -> object:
    return patch.object(group._session, "get", new=mock_get)


# ---------------------------------------------------------------------------
# Membership / RBL union
# ---------------------------------------------------------------------------


def test_union_rbls_dedupes_and_sorts(hass: HomeAssistant) -> None:
    """union_rbls merges every member's RBLs, deduped and sorted."""
    group = MonitorBatchGroup(hass, 60)
    a = _member(hass, data={CONF_RBLS: [4111, 4118]}, unique_id="a")
    b = _member(hass, data={CONF_RBLS: [4118, 1491]}, unique_id="b")
    group.add_member(a)
    group.add_member(b)
    assert group.union_rbls() == [1491, 4111, 4118]


def test_remove_member_reports_empty(hass: HomeAssistant) -> None:
    """remove_member returns True only once the group has no members left."""
    group = MonitorBatchGroup(hass, 60)
    a = _member(hass, unique_id="a")
    b = _member(hass, data={CONF_RBLS: [1491]}, unique_id="b")
    group.add_member(a)
    group.add_member(b)
    assert group.remove_member(a.entry_id) is False
    assert group.remove_member(b.entry_id) is True


async def test_fetch_sends_combined_stopid_params(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """One request carries the deduped union of every member's RBLs."""
    group = MonitorBatchGroup(hass, 60)
    a = _member(hass, data={CONF_RBLS: [4111, 4118]}, unique_id="a")
    b = _member(hass, data={CONF_RBLS: [4118, 1491]}, unique_id="b")
    group.add_member(a)
    group.add_member(b)

    mock_get = MagicMock(return_value=make_response_cm(_ok_response(monitor_fixture)))
    with _patch_get(group, mock_get):
        await group.async_fetch()

    args, kwargs = mock_get.call_args
    assert args[0].endswith("/monitor")
    assert kwargs["params"] == [
        ("stopId", "1491"),
        ("stopId", "4111"),
        ("stopId", "4118"),
    ]


# ---------------------------------------------------------------------------
# Fetch — success + error mapping
# ---------------------------------------------------------------------------


async def test_fetch_success_returns_body_and_sets_meta(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """A 200 returns the raw body and stamps server-time/code on every member."""
    group, coordinator = _group_with_member(hass)
    mock_get = MagicMock(return_value=make_response_cm(_ok_response(monitor_fixture)))
    with _patch_get(group, mock_get):
        result = await group.async_fetch()

    assert isinstance(result, BatchResult)
    assert result.not_modified is False
    assert result.body is monitor_fixture
    assert coordinator.last_error_code == 1
    assert coordinator.server_time == monitor_fixture["message"]["serverTime"]


async def test_fetch_http_error(hass: HomeAssistant) -> None:
    """aiohttp.ClientResponseError → UpdateFailed(api_http_error)."""
    group, _ = _group_with_member(hass)
    req_info = MagicMock()
    req_info.real_url = "https://example/monitor"
    err = aiohttp.ClientResponseError(
        request_info=req_info, history=(), status=503, message="boom"
    )
    resp = MagicMock()
    resp.status = 503
    resp.raise_for_status = MagicMock(side_effect=err)
    with (
        _patch_get(group, MagicMock(return_value=make_response_cm(resp))),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()
    assert exc.value.translation_key == "api_http_error"
    assert exc.value.translation_placeholders["status"] == "503"


async def test_fetch_connection_error(hass: HomeAssistant) -> None:
    """aiohttp.ClientError → UpdateFailed(api_connection_error)."""
    group, _ = _group_with_member(hass)
    with (
        _patch_get(
            group, MagicMock(side_effect=aiohttp.ClientConnectionError("unreachable"))
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()
    assert exc.value.translation_key == "api_connection_error"
    assert exc.value.translation_placeholders["error_type"] == "ClientConnectionError"


async def test_fetch_timeout(hass: HomeAssistant) -> None:
    """Request timeout → UpdateFailed(api_timeout)."""
    group, _ = _group_with_member(hass)
    with (
        _patch_get(group, MagicMock(side_effect=TimeoutError())),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()
    assert exc.value.translation_key == "api_timeout"


async def test_fetch_invalid_json(hass: HomeAssistant) -> None:
    """Non-JSON body → UpdateFailed(api_invalid_response)."""
    group, _ = _group_with_member(hass)
    resp = MagicMock()
    resp.status = 200
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(side_effect=ValueError("bad json"))
    with (
        _patch_get(group, MagicMock(return_value=make_response_cm(resp))),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()
    assert exc.value.translation_key == "api_invalid_response"


async def test_fetch_non_dict_body(hass: HomeAssistant) -> None:
    """JSON that isn't an object → UpdateFailed(api_invalid_response)."""
    group, _ = _group_with_member(hass)
    resp = _ok_response({})
    resp.json = AsyncMock(return_value=["not", "a", "dict"])
    with (
        _patch_get(group, MagicMock(return_value=make_response_cm(resp))),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()
    assert exc.value.translation_key == "api_invalid_response"
    assert "list" in exc.value.translation_placeholders["error"]


async def test_fetch_upstream_error_code(hass: HomeAssistant, monitor_fixture) -> None:
    """messageCode not in {1, 316} → UpdateFailed(api_upstream_error)."""
    group, coordinator = _group_with_member(hass)
    bad = dict(monitor_fixture)
    bad["message"] = {"value": "Something else", "messageCode": 500}
    with (
        _patch_get(group, MagicMock(return_value=make_response_cm(_ok_response(bad)))),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()
    assert exc.value.translation_key == "api_upstream_error"
    assert exc.value.translation_placeholders["code"] == "500"
    # A non-rate-limit upstream error must NOT raise the rate-limit issue.
    assert coordinator._rate_limited is False
    # …but the code is still recorded for diagnostics.
    assert coordinator.last_error_code == 500


@pytest.mark.parametrize(
    ("code", "expected_key"),
    [
        (311, "api_db_unavailable"),
        (312, "api_stop_unknown"),
        (320, "api_request_rejected"),
        (321, "api_request_rejected"),
        (322, "api_no_data"),
        (500, "api_upstream_error"),
    ],
    ids=[
        "db-down",
        "stop-unknown",
        "param-invalid",
        "param-missing",
        "no-data",
        "unmapped",
    ],
)
async def test_documented_error_codes_get_their_own_message(
    hass: HomeAssistant, monitor_fixture, code, expected_key
) -> None:
    """Each documented `messageCode` raises its own translated message.

    An unmapped code still falls back to `api_upstream_error`, which prints
    the raw code and the upstream text, so a future code the docs gain is
    reported rather than swallowed.
    """
    group, coordinator = _group_with_member(hass)
    bad = dict(monitor_fixture)
    bad["message"] = {"value": "upstream text", "messageCode": code}
    with (
        _patch_get(group, MagicMock(return_value=make_response_cm(_ok_response(bad)))),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()

    assert exc.value.translation_key == expected_key
    # Every message carries both placeholders, mapped or not.
    assert exc.value.translation_placeholders["code"] == str(code)
    assert exc.value.translation_placeholders["value"] == "upstream text"
    assert coordinator.last_error_code == code
    # None of these is the rate limit, so none may trip that flag.
    assert coordinator._rate_limited is False


# ---------------------------------------------------------------------------
# Rate-limit Repairs issue (stays per-member)
# ---------------------------------------------------------------------------


async def test_rate_limit_raises_issue_per_member(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """Code 316 raises UpdateFailed and a per-entry Repairs issue for members."""
    group, coordinator = _group_with_member(hass)
    limited = dict(monitor_fixture)
    limited["message"] = {"value": "Rate limit", "messageCode": ERR_RATE_LIMIT}
    with (
        _patch_get(
            group, MagicMock(return_value=make_response_cm(_ok_response(limited)))
        ),
        pytest.raises(UpdateFailed) as exc,
    ):
        await group.async_fetch()
    assert exc.value.translation_key == "api_rate_limited"

    registry = ir.async_get(hass)
    assert (
        registry.async_get_issue(DOMAIN, f"rate_limited_{coordinator.entry_id}")
        is not None
    )
    assert coordinator._rate_limited is True
    assert coordinator.last_error_code == ERR_RATE_LIMIT


async def test_recovery_clears_rate_limit_issue(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """A successful fetch after a rate-limit clears the per-entry issue."""
    group, coordinator = _group_with_member(hass)
    coordinator.note_rate_limited()
    registry = ir.async_get(hass)
    assert (
        registry.async_get_issue(DOMAIN, f"rate_limited_{coordinator.entry_id}")
        is not None
    )

    with _patch_get(
        group, MagicMock(return_value=make_response_cm(_ok_response(monitor_fixture)))
    ):
        await group.async_fetch()

    assert (
        registry.async_get_issue(DOMAIN, f"rate_limited_{coordinator.entry_id}") is None
    )
    assert coordinator._rate_limited is False


# ---------------------------------------------------------------------------
# Domain cooldown (aggregate 15s floor)
# ---------------------------------------------------------------------------


@pytest.mark.real_domain_cooldown
async def test_domain_cooldown_serialises(hass: HomeAssistant, monitor_fixture) -> None:
    """A recent domain call forces the group to wait out the remaining slice."""
    group, _ = _group_with_member(hass)
    elapsed = 1.0
    hass.data.setdefault(DOMAIN, {})[DOMAIN_LAST_CALL_KEY] = (
        dt_util.utcnow() - timedelta(seconds=elapsed)
    )
    mock_get = MagicMock(return_value=make_response_cm(_ok_response(monitor_fixture)))
    with (
        _patch_get(group, mock_get),
        patch(
            "custom_components.wiener_linien_austria.rate_limit.asyncio.sleep",
            new_callable=AsyncMock,
        ) as mock_sleep,
    ):
        await group.async_fetch()
    mock_sleep.assert_awaited_once()
    expected = DOMAIN_COOLDOWN_SECONDS - elapsed
    actual = mock_sleep.call_args.args[0]
    assert abs(actual - expected) < 0.5


@pytest.mark.real_domain_cooldown
async def test_domain_cooldown_no_sleep_when_elapsed(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """No sleep when the last domain call is older than the cooldown."""
    group, _ = _group_with_member(hass)
    hass.data.setdefault(DOMAIN, {})[DOMAIN_LAST_CALL_KEY] = (
        dt_util.utcnow() - timedelta(seconds=DOMAIN_COOLDOWN_SECONDS + 10)
    )
    mock_get = MagicMock(return_value=make_response_cm(_ok_response(monitor_fixture)))
    with (
        _patch_get(group, mock_get),
        patch(
            "custom_components.wiener_linien_austria.rate_limit.asyncio.sleep",
            new_callable=AsyncMock,
        ) as mock_sleep,
    ):
        await group.async_fetch()
    mock_sleep.assert_not_called()


# ---------------------------------------------------------------------------
# Conditional GET — 304 Not Modified
# ---------------------------------------------------------------------------


async def test_304_returns_cached_body(hass: HomeAssistant, monitor_fixture) -> None:
    """A 304 revalidation returns the cached body with not_modified=True."""
    group, _ = _group_with_member(hass)
    headers = {"ETag": '"abc"', "Last-Modified": "Wed, 22 Apr 2026 10:00:00 GMT"}
    resp_200 = _ok_response(monitor_fixture, headers=headers)
    resp_304 = MagicMock()
    resp_304.status = 304
    resp_304.headers = headers
    resp_304.raise_for_status = MagicMock()
    resp_304.json = AsyncMock(
        side_effect=AssertionError("must not call .json() on 304")
    )

    mock_get = MagicMock(
        side_effect=[make_response_cm(resp_200), make_response_cm(resp_304)]
    )
    with _patch_get(group, mock_get):
        first = await group.async_fetch()
        second = await group.async_fetch()

    assert first.not_modified is False
    assert second.not_modified is True
    assert second.body is first.body
    # Conditional header was echoed on the second call.
    assert mock_get.call_args_list[1].kwargs["headers"].get("If-None-Match") == '"abc"'


async def test_304_without_cached_body_raises(hass: HomeAssistant) -> None:
    """A 304 with no cached body to revalidate surfaces as UpdateFailed."""
    group, _ = _group_with_member(hass)
    resp_304 = MagicMock()
    resp_304.status = 304
    resp_304.headers = {}
    resp_304.raise_for_status = MagicMock()
    resp_304.json = AsyncMock(side_effect=ValueError("304 has no body"))
    with (
        _patch_get(group, MagicMock(return_value=make_response_cm(resp_304))),
        pytest.raises(UpdateFailed),
    ):
        await group.async_fetch()


# ---------------------------------------------------------------------------
# Fan-out — timer tick distributes the shared body to members
# ---------------------------------------------------------------------------


async def test_timer_tick_fans_out_per_member_slice(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """Each member keeps only the monitors at its own RBLs; a member whose RBL
    is absent gets empty departures (NOT a failure) — matching the API's
    omit-unknown-stopId behaviour."""
    group = MonitorBatchGroup(hass, 60)
    # Member A owns the fixture's stops (4111 / 4118); member B owns a stop
    # that isn't in the response at all.
    a = _member(hass, data={CONF_RBLS: [4111, 4118]}, unique_id="a")
    b = _member(hass, data={CONF_RBLS: [1491]}, unique_id="b")
    for coordinator in (a, b):
        group.add_member(coordinator)
        coordinator.attach_batch(group)

    with _patch_get(
        group, MagicMock(return_value=make_response_cm(_ok_response(monitor_fixture)))
    ):
        await group._async_timer_tick(None)

    assert a.last_update_success is True
    assert b.last_update_success is True
    assert a.data is not None and a.data.departures
    assert b.data is not None and b.data.departures == []


async def test_timer_tick_error_marks_all_members(hass: HomeAssistant) -> None:
    """A failed combined fetch flips every member to an unsuccessful update."""
    group = MonitorBatchGroup(hass, 60)
    a = _member(hass, unique_id="a")
    b = _member(hass, data={CONF_RBLS: [1491]}, unique_id="b")
    for coordinator in (a, b):
        group.add_member(coordinator)
        coordinator.attach_batch(group)

    with _patch_get(
        group, MagicMock(side_effect=aiohttp.ClientConnectionError("down"))
    ):
        await group._async_timer_tick(None)

    assert a.last_update_success is False
    assert b.last_update_success is False


async def test_timer_tick_not_modified_keeps_prior_data(
    hass: HomeAssistant, monitor_fixture
) -> None:
    """A 304 tick leaves each member's existing data untouched."""
    group, coordinator = _group_with_member(hass)
    headers = {"ETag": '"abc"'}
    resp_200 = _ok_response(monitor_fixture, headers=headers)
    resp_304 = MagicMock()
    resp_304.status = 304
    resp_304.headers = headers
    resp_304.raise_for_status = MagicMock()
    resp_304.json = AsyncMock(side_effect=AssertionError("no body on 304"))

    mock_get = MagicMock(
        side_effect=[make_response_cm(resp_200), make_response_cm(resp_304)]
    )
    with _patch_get(group, mock_get):
        await group._async_timer_tick(None)
        first_data = coordinator.data
        await group._async_timer_tick(None)

    assert coordinator.data is first_data


async def test_timer_tick_no_members_noop(hass: HomeAssistant) -> None:
    """A tick with no members returns without touching the network."""
    group = MonitorBatchGroup(hass, 60)
    mock_get = MagicMock()
    with _patch_get(group, mock_get):
        await group._async_timer_tick(None)
    mock_get.assert_not_called()


# ---------------------------------------------------------------------------
# Timer lifecycle + backoff
# ---------------------------------------------------------------------------


def test_start_and_stop_manage_timer(hass: HomeAssistant) -> None:
    """start arms the interval timer; stop cancels it; start is idempotent."""
    group, _ = _group_with_member(hass)
    group.start()
    assert group._unsub is not None
    first = group._unsub
    group.start()  # idempotent — no second timer
    assert group._unsub is first
    group.stop()
    assert group._unsub is None


async def test_backoff_widens_then_resets(hass: HomeAssistant) -> None:
    """Consecutive failures widen the cadence with jitter; success resets it."""
    group, _ = _group_with_member(hass, interval=60)
    base = 60.0

    def _within_jitter(actual: timedelta, expected: float) -> bool:
        return expected * 0.9 <= actual.total_seconds() <= expected * 1.1

    # First failure holds the base cadence.
    group._note_failure()
    assert group._current_interval == timedelta(seconds=base)
    # Second doubles, third quadruples (± jitter).
    group._note_failure()
    assert _within_jitter(group._current_interval, base * 2)
    group._note_failure()
    assert _within_jitter(group._current_interval, base * 4)
    # Pile on until clamped at the cap.
    for _ in range(20):
        group._note_failure()
    assert _within_jitter(group._current_interval, BACKOFF_CAP_SECONDS)
    # A success restores the normal cadence.
    group._note_success()
    assert group._current_interval == timedelta(seconds=base)
