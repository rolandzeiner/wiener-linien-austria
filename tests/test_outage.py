"""Tests for the domain-wide upstream-outage Repairs issue (outage.py)."""

from __future__ import annotations

from contextlib import suppress
from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import UpdateFailed

from custom_components.wiener_linien_austria.batch import MonitorBatchGroup
from custom_components.wiener_linien_austria.const import (
    DOMAIN,
    ERR_DB_UNAVAILABLE,
    OUTAGE_ISSUE_ID,
    OUTAGE_KEY,
    OUTAGE_REPAIR_AFTER_SECONDS,
)
from custom_components.wiener_linien_austria.coordinator import (
    WienerLinienAustriaCoordinator,
)
from custom_components.wiener_linien_austria.outage import (
    async_clear_outage,
    async_note_monitor_failure,
    is_upstream_fault,
)

from .conftest import make_entry, make_response_cm

_PAST_THRESHOLD = timedelta(seconds=OUTAGE_REPAIR_AFTER_SECONDS + 1)


def _group(hass: HomeAssistant) -> MonitorBatchGroup:
    group = MonitorBatchGroup(hass, 60)
    entry = make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    group.add_member(coordinator)
    coordinator.attach_batch(group)
    return group


def _status(status: int) -> MagicMock:
    """A /monitor answer that fails raise_for_status with `status`."""
    req_info = MagicMock()
    req_info.real_url = "https://example/monitor"
    resp = MagicMock()
    resp.status = status
    resp.raise_for_status = MagicMock(
        side_effect=aiohttp.ClientResponseError(
            request_info=req_info, history=(), status=status, message="Bad Gateway"
        )
    )
    return MagicMock(return_value=make_response_cm(resp))


def _body(body: dict) -> MagicMock:
    resp = MagicMock()
    resp.status = 200
    resp.headers = {}
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    return MagicMock(return_value=make_response_cm(resp))


async def _fetch(group: MonitorBatchGroup, mock_get: MagicMock) -> None:
    with patch.object(group._session, "get", new=mock_get), suppress(UpdateFailed):
        await group.async_fetch()


def _issue(hass: HomeAssistant) -> ir.IssueEntry | None:
    return ir.async_get(hass).async_get_issue(DOMAIN, OUTAGE_ISSUE_ID)


def _failure(key: str, **placeholders: str) -> UpdateFailed:
    return UpdateFailed(
        translation_domain=DOMAIN,
        translation_key=key,
        translation_placeholders=placeholders,
    )


@pytest.mark.parametrize(
    ("err", "expected"),
    [
        (_failure("api_http_error", status="502", reason=""), True),
        (_failure("api_http_error", status="500", reason=""), True),
        (_failure("api_http_error", status="404", reason=""), False),
        (_failure("api_http_error", status="429", reason=""), False),
        (_failure("api_invalid_response", status="200", error="x"), True),
        (_failure("api_db_unavailable", code="311", value=""), True),
        (_failure("api_timeout", seconds="30"), False),
        (_failure("api_connection_error", error_type="E", error=""), False),
        (_failure("api_rate_limited"), False),
        (_failure("api_stop_unknown", code="312", value=""), False),
    ],
)
def test_is_upstream_fault(err: UpdateFailed, expected: bool) -> None:
    """Only failures that prove a broken server count against Wiener Linien."""
    assert is_upstream_fault(err) is expected


async def test_issue_appears_only_after_the_threshold(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """A 502 starts the clock; the issue waits until it has run out."""
    group = _group(hass)
    await _fetch(group, _status(502))
    assert _issue(hass) is None

    freezer.tick(timedelta(seconds=OUTAGE_REPAIR_AFTER_SECONDS - 60))
    await _fetch(group, _status(502))
    assert _issue(hass) is None

    freezer.tick(timedelta(seconds=61))
    await _fetch(group, _status(502))
    issue = _issue(hass)
    assert issue is not None
    assert issue.translation_key == OUTAGE_ISSUE_ID
    assert issue.severity is ir.IssueSeverity.WARNING
    assert issue.is_fixable is False


async def test_recovery_clears_the_issue(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, monitor_fixture
) -> None:
    """The first good answer ends the outage and removes the issue."""
    group = _group(hass)
    await _fetch(group, _status(503))
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(group, _status(503))
    assert _issue(hass) is not None

    await _fetch(group, _body(monitor_fixture))
    assert _issue(hass) is None
    assert hass.data[DOMAIN][OUTAGE_KEY].since is None

    # The next outage has to earn its own threshold again.
    await _fetch(group, _status(503))
    assert _issue(hass) is None


async def test_database_unavailable_counts_as_an_outage(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, monitor_fixture
) -> None:
    """The API's own 311 'database unavailable' is a fault on its side."""
    group = _group(hass)
    down = {
        **monitor_fixture,
        "message": {"value": "", "messageCode": ERR_DB_UNAVAILABLE},
    }
    await _fetch(group, _body(down))
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(group, _body(down))
    assert _issue(hass) is not None


async def test_network_errors_never_start_the_clock(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Timeouts and connection errors can be the user's own network."""
    group = _group(hass)
    await _fetch(group, MagicMock(side_effect=TimeoutError()))
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(group, MagicMock(side_effect=aiohttp.ClientConnectionError("down")))
    await _fetch(group, _status(502))
    assert _issue(hass) is None


async def test_network_errors_keep_a_running_outage_going(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """A timeout in the middle of an outage doesn't reset its clock."""
    group = _group(hass)
    await _fetch(group, _status(502))
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(group, MagicMock(side_effect=TimeoutError()))
    await _fetch(group, _status(502))
    assert _issue(hass) is not None


async def test_a_real_client_error_answer_ends_the_outage(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """A 4xx comes from a working server, so the clock starts over."""
    group = _group(hass)
    await _fetch(group, _status(502))
    freezer.tick(timedelta(seconds=OUTAGE_REPAIR_AFTER_SECONDS - 60))
    await _fetch(group, _status(404))
    freezer.tick(timedelta(seconds=120))
    await _fetch(group, _status(502))
    assert _issue(hass) is None


async def test_issue_is_created_once(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Later failures leave the raised issue alone instead of re-creating it."""
    err = _failure("api_http_error", status="502", reason="")
    async_note_monitor_failure(hass, err)
    freezer.tick(_PAST_THRESHOLD)
    with patch(
        "custom_components.wiener_linien_austria.outage.ir.async_create_issue"
    ) as create:
        async_note_monitor_failure(hass, err)
        async_note_monitor_failure(hass, err)
    assert create.call_count == 1


async def test_clear_outage_forgets_state_and_issue(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Removing the last entry drops both the clock and the issue."""
    err = _failure("api_http_error", status="502", reason="")
    async_note_monitor_failure(hass, err)
    freezer.tick(_PAST_THRESHOLD)
    async_note_monitor_failure(hass, err)
    assert _issue(hass) is not None

    async_clear_outage(hass)
    assert _issue(hass) is None
    assert OUTAGE_KEY not in hass.data[DOMAIN]


async def test_entries_in_setup_retry_raise_and_clear_the_issue(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, monitor_fixture
) -> None:
    """The 2026-10-21 incident, end to end through real config-entry setups.

    /monitor answered an empty 502 for hours, so every entry sat in setup
    retry with no group timer running. The setup attempts themselves have to
    feed the clock, or the issue never appears in exactly the case it was
    built for. Pinned here because nobody can stage a real outage to check.
    """
    session = MagicMock()
    session.get = _status(502)
    entry = make_entry()
    entry.add_to_hass(hass)
    with patch(
        "custom_components.wiener_linien_austria.batch.async_get_clientsession",
        return_value=session,
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        assert entry.state is ConfigEntryState.SETUP_RETRY
        assert _issue(hass) is None

        freezer.tick(_PAST_THRESHOLD)
        await hass.config_entries.async_reload(entry.entry_id)
        await hass.async_block_till_done()
        assert entry.state is ConfigEntryState.SETUP_RETRY
        assert _issue(hass) is not None

        session.get = _body(monitor_fixture)
        await hass.config_entries.async_reload(entry.entry_id)
        await hass.async_block_till_done()
        assert entry.state is ConfigEntryState.LOADED
        assert _issue(hass) is None
