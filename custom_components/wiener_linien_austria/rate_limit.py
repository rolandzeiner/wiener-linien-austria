"""Domain-wide rate limiting for Wiener Linien API calls.

Every outbound call this integration makes stays above the conventional
15-second minimum interval circulated for the OGD real-time endpoint, *in
aggregate*. An asyncio.Lock serialises the check-then-update, so concurrent
callers can't both observe the same `last_call_ts` and skip the sleep.

Three callers, each taking exactly one slot per cycle:

- batch.py — one combined `/monitor` request per interval group per tick.
- alerts.py — one combined `/trafficInfoList` request per 5-minute cycle
  (both feed names ride in it as repeated `name=` params).
- static.py — one slot for the whole weekly five-file burst, taken before
  the `asyncio.gather` rather than per file. Per-file would serialise a
  fail-soft background refresh into 5 x 15 s of held lock and stall every
  `/monitor` tick behind it; one slot still keeps the burst from landing on
  top of a monitor tick, which is the part the upstream notices.

Route entries take a separate 15 s slot on the routing backend
(`async_enforce_routing_cooldown`). Requests someone is waiting for take no
slot at all: `plan_trip` and the route card's From / To mode go through the
cache, coalescing and token-bucket budget in adhoc.py instead. A cooldown
bounds what runs unattended; the budget bounds what people ask for.
"""

from __future__ import annotations

import asyncio
from datetime import datetime

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN, DOMAIN_COOLDOWN_SECONDS, DOMAIN_LAST_CALL_KEY

LOCK_KEY = "cooldown_lock"
LOCK_LOOP_KEY = "cooldown_lock_loop"

# The routing endpoint is served by a different backend (the VOR EFA
# server behind `ogd_routing`) than `/monitor` and `/trafficInfoList`
# (`ogd_realtime`), so it gets its own slot. Sharing the realtime slot
# would make every route refresh push a departure tick back by up to 15 s
# while buying the realtime backend nothing — it never sees the request.
ROUTING_LAST_CALL_KEY = "routing_last_call_ts"
ROUTING_LOCK_KEY = "routing_cooldown_lock"
ROUTING_LOCK_LOOP_KEY = "routing_cooldown_lock_loop"
ROUTING_COOLDOWN_SECONDS = 15


async def async_enforce_routing_cooldown(hass: HomeAssistant) -> None:
    """Serialise unattended routing requests under their own 15 s floor.

    Same lock-then-sleep shape as `async_enforce_domain_cooldown`, on
    separate keys. Only the recurring route coordinators take it; the
    user-initiated `plan_trip` action and the route card's ad-hoc mode do
    not, for the same reason the config-flow line probe skips the realtime
    slot — someone is waiting. adhoc.py's budget bounds those instead.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    current_loop = asyncio.get_running_loop()
    if domain_data.get(ROUTING_LOCK_LOOP_KEY) is not current_loop:
        domain_data[ROUTING_LOCK_KEY] = asyncio.Lock()
        domain_data[ROUTING_LOCK_LOOP_KEY] = current_loop
    lock: asyncio.Lock = domain_data[ROUTING_LOCK_KEY]
    async with lock:
        last: datetime | None = domain_data.get(ROUTING_LAST_CALL_KEY)
        now = dt_util.utcnow()
        if last is not None:
            elapsed = (now - last).total_seconds()
            if elapsed < ROUTING_COOLDOWN_SECONDS:
                await asyncio.sleep(ROUTING_COOLDOWN_SECONDS - elapsed)
        domain_data[ROUTING_LAST_CALL_KEY] = dt_util.utcnow()


async def async_enforce_domain_cooldown(hass: HomeAssistant) -> None:
    """Serialise outbound calls across all callers under the 15s floor.

    The `asyncio.sleep` runs *inside* the lock — that's by design. Concurrent
    callers queue up and each waits its full 15s slice, so N simultaneous
    callers take ~N × 15s to drain. This is exactly the conventional
    15-second minimum interval the OGD endpoint asks for; it's not a bug.

    Since batching landed there is at most one caller per tick, not one per
    entry: every entry sharing a scan interval fetches through ONE combined
    /monitor request (batch.py), and the alerts refresh runs on its own
    5-min cadence through ONE combined /trafficInfoList request. Adding stops
    no longer lengthens the queue — see batch.py's module docstring for why
    that drain was worth eliminating.
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
