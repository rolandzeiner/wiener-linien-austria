"""Domain-wide rate limiting for Wiener Linien API calls.

Every outbound call this integration makes stays above the conventional
15-second minimum interval circulated for the OGD real-time endpoint, *in
aggregate*. An asyncio.Lock serialises the check-then-update, so concurrent
callers can't both observe the same `last_call_ts` and skip the sleep.

Four callers, each taking exactly one slot per request:

- batch.py — one combined `/monitor` request per interval group per tick.
- alerts.py — one combined `/trafficInfoList` request per 5-minute cycle
  (all three feed names ride in it as repeated `name=` params).
- static.py — one slot for the whole weekly five-file burst, taken before
  the `asyncio.gather` rather than per file. Per-file would serialise a
  fail-soft background refresh into 5 x 15 s of held lock and stall every
  `/monitor` tick behind it; one slot still keeps the burst from landing on
  top of a monitor tick, which is the part the upstream notices.
- live.py — the `/monitor` request a route refresh makes when its stops
  aren't in a batch answer (see live.py for when). An on-demand plan's
  request doesn't take it.

The routing backend has a separate 15 s slot
(`async_enforce_routing_cooldown`), taken by route refreshes, the S-Bahn
timetable refresh (timetable.py) and the daily S-Bahn network sample
(s_bahn_network.py, one slot per hub). Requests someone is waiting for take
no slot at all: `plan_trip` and the route card's From / To mode go through
the cache, coalescing and token-bucket budget in adhoc.py instead, and the
config flow's probes skip both slots. A cooldown bounds what runs
unattended; the budget bounds what people ask for.
"""

from __future__ import annotations

import asyncio
import random
from datetime import datetime, timedelta

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import (
    BACKOFF_CAP_SECONDS,
    DOMAIN,
    DOMAIN_COOLDOWN_SECONDS,
    DOMAIN_LAST_CALL_KEY,
)

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

    Shares `_async_enforce_cooldown` with `async_enforce_domain_cooldown`,
    on separate keys. Only the unattended callers take it (route
    coordinators, the S-Bahn `TimetableBoard` and the S-Bahn network
    update); the user-initiated `plan_trip` action and the route card's
    ad-hoc mode do not, for the same reason the config-flow line probe skips
    the realtime slot — someone is waiting. adhoc.py's budget bounds those
    instead.
    """
    await _async_enforce_cooldown(
        hass,
        lock_key=ROUTING_LOCK_KEY,
        loop_key=ROUTING_LOCK_LOOP_KEY,
        last_call_key=ROUTING_LAST_CALL_KEY,
        seconds=ROUTING_COOLDOWN_SECONDS,
    )


async def async_enforce_domain_cooldown(hass: HomeAssistant) -> None:
    """Serialise outbound calls across all callers under the 15s floor.

    The `asyncio.sleep` runs *inside* the lock — that's by design. Concurrent
    callers queue up and each waits its full 15s slice, so N simultaneous
    callers take ~N × 15s to drain. This is exactly the conventional
    15-second minimum interval the OGD endpoint asks for; it's not a bug.

    The queue stays short because callers are shared rather than per entry:
    every entry sharing a scan interval fetches through ONE combined
    /monitor request (batch.py), and the alerts refresh runs on its own
    5-min cadence through ONE combined /trafficInfoList request. Adding stops
    doesn't lengthen the queue — see batch.py's module docstring.
    """
    await _async_enforce_cooldown(
        hass,
        lock_key=LOCK_KEY,
        loop_key=LOCK_LOOP_KEY,
        last_call_key=DOMAIN_LAST_CALL_KEY,
        seconds=DOMAIN_COOLDOWN_SECONDS,
    )


async def _async_enforce_cooldown(
    hass: HomeAssistant,
    *,
    lock_key: str,
    loop_key: str,
    last_call_key: str,
    seconds: float,
) -> None:
    """Wait out `seconds` since the last call on these keys, under their lock.

    Both public cooldowns are this body on their own keys. The callers pass
    the module-level seconds constant at call time, not as a default, so
    tests that patch those constants still take effect.
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
    cached_loop = domain_data.get(loop_key)
    if cached_loop is not current_loop:
        domain_data[lock_key] = asyncio.Lock()
        domain_data[loop_key] = current_loop
    lock: asyncio.Lock = domain_data[lock_key]
    async with lock:
        last: datetime | None = domain_data.get(last_call_key)
        now = dt_util.utcnow()
        if last is not None:
            elapsed = (now - last).total_seconds()
            if elapsed < seconds:
                await asyncio.sleep(seconds - elapsed)
        domain_data[last_call_key] = dt_util.utcnow()


def backoff_delay(base: timedelta, failures: int, *, jitter: bool = False) -> timedelta:
    """The wait after `failures` failures in a row: `base`, doubling per failure.

    One failure waits `base`, two wait twice that, three four times, capped
    at `BACKOFF_CAP_SECONDS`. `jitter` spreads the result by +/-10% so
    installs that failed on the same tick don't all retry on the same one.
    The monitor batch, the route coordinators and the S-Bahn timetable share
    this curve; each decides for itself what a first failure does.
    """
    doubled = base * (1 << max(failures - 1, 0))
    delay = min(doubled, timedelta(seconds=BACKOFF_CAP_SECONDS))
    return delay * random.uniform(0.9, 1.1) if jitter else delay
