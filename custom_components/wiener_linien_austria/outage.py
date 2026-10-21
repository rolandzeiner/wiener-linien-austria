"""Sustained-outage detection for the Wiener Linien real-time API.

When /monitor goes down, every board entry fails its first refresh and sits
in setup retry, its entities go unavailable, and the log stays quiet because
each failure is an ordinary ``UpdateFailed``. From the user's side that looks
exactly like a broken install. This module tells the two apart: once /monitor
has been failing *on Wiener Linien's side* for ``OUTAGE_REPAIR_AFTER_SECONDS``,
it raises one domain-wide Repairs issue saying so, and clears it on the first
answer that shows the service is back.

The state is domain-wide rather than per batch group because the timer of a
group whose members are all in setup retry isn't running: during an outage
the failures arrive through each entry's first refresh, not the group tick.
``MonitorBatchGroup.async_fetch`` is the one path both take, so it reports
here.

Every failure falls in one of three classes, and only the first may claim the
fault is upstream's:

- **outage** — a 5xx, a 2xx whose body isn't a JSON object, or the API's own
  "database unavailable" code (311). The server provably answered, and
  answered broken.
- **inconclusive** — a timeout or a connection error. That can just as well
  be the user's own network, so it neither starts nor stops the clock.
- **answered** — everything else (4xx, rate limit, unknown stop, rejected
  request). A working service sent a real reply, which ends any outage.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import UpdateFailed
from homeassistant.util import dt as dt_util

from .const import DOMAIN, OUTAGE_ISSUE_ID, OUTAGE_KEY, OUTAGE_REPAIR_AFTER_SECONDS

_OUTAGE_KEYS: Final = frozenset({"api_invalid_response", "api_db_unavailable"})
_INCONCLUSIVE_KEYS: Final = frozenset({"api_timeout", "api_connection_error"})


@dataclass(slots=True)
class OutageState:
    """When the current upstream outage began, and whether it was reported."""

    since: datetime | None = None
    raised: bool = False


def _state(hass: HomeAssistant) -> OutageState:
    domain_data = hass.data.setdefault(DOMAIN, {})
    state = domain_data.get(OUTAGE_KEY)
    if not isinstance(state, OutageState):
        state = domain_data[OUTAGE_KEY] = OutageState()
    return state


def is_upstream_fault(err: UpdateFailed) -> bool:
    """Whether this failure proves the fault is on Wiener Linien's side."""
    key = err.translation_key
    if key in _OUTAGE_KEYS:
        return True
    if key == "api_http_error":
        status = (err.translation_placeholders or {}).get("status", "")
        return status.isdigit() and int(status) >= 500
    return False


@callback
def async_note_monitor_failure(hass: HomeAssistant, err: UpdateFailed) -> None:
    """Record a failed /monitor request; raise the issue once it has lasted."""
    if not is_upstream_fault(err):
        if err.translation_key not in _INCONCLUSIVE_KEYS:
            async_note_monitor_success(hass)
        return
    state = _state(hass)
    now = dt_util.utcnow()
    if state.since is None:
        state.since = now
        return
    if state.raised:
        return
    if (now - state.since).total_seconds() < OUTAGE_REPAIR_AFTER_SECONDS:
        return
    state.raised = True
    ir.async_create_issue(
        hass,
        DOMAIN,
        OUTAGE_ISSUE_ID,
        is_fixable=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=OUTAGE_ISSUE_ID,
    )


@callback
def async_note_monitor_success(hass: HomeAssistant) -> None:
    """End any outage in progress and clear its Repairs issue."""
    state = hass.data.get(DOMAIN, {}).get(OUTAGE_KEY)
    if not isinstance(state, OutageState) or state.since is None:
        return
    raised = state.raised
    state.since = None
    state.raised = False
    if raised:
        ir.async_delete_issue(hass, DOMAIN, OUTAGE_ISSUE_ID)


@callback
def async_clear_outage(hass: HomeAssistant) -> None:
    """Forget the outage and drop its issue; used when the last entry goes."""
    hass.data.get(DOMAIN, {}).pop(OUTAGE_KEY, None)
    ir.async_delete_issue(hass, DOMAIN, OUTAGE_ISSUE_ID)
