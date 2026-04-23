"""Domain-wide rate limiting for Wiener Linien API calls.

Both the per-entry monitor polls (coordinator.py) and the shared alerts refresh
(alerts.py) must stay above the 15s fair-use floor *in aggregate*. An
asyncio.Lock serialises the check-then-update, so concurrent callers can't
both observe the same `last_call_ts` and skip the sleep.
"""
from __future__ import annotations

import asyncio
from datetime import datetime

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN, DOMAIN_COOLDOWN_SECONDS, DOMAIN_LAST_CALL_KEY

_LOCK_KEY = "cooldown_lock"


async def async_enforce_domain_cooldown(hass: HomeAssistant) -> None:
    """Serialise outbound calls across all entries under the 15s floor."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    lock: asyncio.Lock = domain_data.setdefault(_LOCK_KEY, asyncio.Lock())
    async with lock:
        last: datetime | None = domain_data.get(DOMAIN_LAST_CALL_KEY)
        now = dt_util.utcnow()
        if last is not None:
            elapsed = (now - last).total_seconds()
            if elapsed < DOMAIN_COOLDOWN_SECONDS:
                await asyncio.sleep(DOMAIN_COOLDOWN_SECONDS - elapsed)
        domain_data[DOMAIN_LAST_CALL_KEY] = dt_util.utcnow()
