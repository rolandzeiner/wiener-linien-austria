"""Domain-wide rate limiting for Wiener Linien API calls.

Both the per-entry monitor polls (coordinator.py) and the shared alerts refresh
(alerts.py) must stay above the conventional 15-second minimum interval
circulated for the OGD real-time endpoint, *in aggregate*. An asyncio.Lock
serialises the check-then-update, so concurrent callers can't both observe
the same `last_call_ts` and skip the sleep.
"""
from __future__ import annotations

import asyncio
from datetime import datetime

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN, DOMAIN_COOLDOWN_SECONDS, DOMAIN_LAST_CALL_KEY

LOCK_KEY = "cooldown_lock"
LOCK_LOOP_KEY = "cooldown_lock_loop"


async def async_enforce_domain_cooldown(hass: HomeAssistant) -> None:
    """Serialise outbound calls across all entries under the 15s floor.

    The `asyncio.sleep` runs *inside* the lock — that's by design. Concurrent
    callers queue up and each waits its full 15s slice, so N simultaneous
    callers take ~N × 15s to drain. This is exactly the conventional
    15-second minimum interval the OGD endpoint asks for; it's not a bug.

    Practical implication: at the default 60s `update_interval` the queue
    drains comfortably for ~3 entries (3 × 15s = 45s < 60s). With more
    entries the slowest coordinator's wait may exceed its 30s monitor
    timeout — users with 4+ stops should bump the interval. The
    coordinator's exponential backoff handles sustained queue overruns
    by widening the cadence on consecutive failures.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    # Loop-pin the lock — `asyncio.Lock()` lazy-binds to the running
    # loop on first use, so a lock created on a torn-down loop (test
    # fixtures, or a future HA loop swap) raises `RuntimeError: …
    # attached to a different loop`. We keep the loop reference next to
    # the lock and drop both if we ever observe a mismatch, recreating
    # against the current loop. The cooldown timestamp survives the
    # swap so we don't lose rate-limit state across the boundary.
    current_loop = asyncio.get_running_loop()
    cached_loop = domain_data.get(LOCK_LOOP_KEY)
    if cached_loop is not current_loop:
        domain_data[LOCK_KEY] = asyncio.Lock()
        domain_data[LOCK_LOOP_KEY] = current_loop
    lock: asyncio.Lock = domain_data[LOCK_KEY]
    async with lock:
        last: datetime | None = domain_data.get(DOMAIN_LAST_CALL_KEY)
        now = dt_util.utcnow()
        if last is not None:
            elapsed = (now - last).total_seconds()
            if elapsed < DOMAIN_COOLDOWN_SECONDS:
                await asyncio.sleep(DOMAIN_COOLDOWN_SECONDS - elapsed)
        domain_data[DOMAIN_LAST_CALL_KEY] = dt_util.utcnow()
