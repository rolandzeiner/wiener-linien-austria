"""Ad-hoc trip planning for the route card's From / To mode.

A configured route is polled once by the backend and shared by every
dashboard. An ad-hoc query is the opposite: any viewer picks any two stops,
and every open dashboard is a potential caller. Three guards keep that from
turning into a load the upstream notices:

- **Cache.** A plan is keyed on the query plus the Vienna wall-clock minute,
  which is the resolution the trip request itself carries (`itdTime=HHMM`).
  Two identical queries in the same minute are the same upstream request, so
  the second one never leaves Home Assistant. Entries live for
  `ADHOC_CACHE_TTL_SECONDS`.
- **Coalescing.** A query already on the wire is awaited, not repeated, so N
  dashboards opening on the same pair at once cost one request.
- **Budget.** A token bucket per HA instance (`ADHOC_BURST` tokens, refilled at
  `ADHOC_BUDGET_PER_HOUR`) caps what cache misses can add up to. Only a miss
  takes a token. An empty bucket raises `AdhocRateLimited` with the wait.

The 15 s routing cooldown in rate_limit.py is deliberately not taken: someone
is waiting for the answer, the same reasoning as `plan_trip`. The budget is
what bounds this path instead.

Nothing here is written to diagnostics, the recorder or an info-level log. A
stop pair picked on a dashboard is a movement pattern, and it stays in memory
for at most a minute.
"""

from __future__ import annotations

import asyncio
import logging
import math
from collections import OrderedDict
from dataclasses import dataclass
from datetime import datetime, tzinfo
from typing import Final

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN, ROUTING_TIME_ZONE
from .route_coordinator import async_plan_trips
from .routing import RouteOptions, RoutingError, Trip

_LOGGER = logging.getLogger(__name__)

ADHOC_PLANNER_KEY: Final = "adhoc_planner"

# One minute: the resolution of the trip request, so a longer TTL would serve
# a query for 07:41 an answer planned for 07:40.
ADHOC_CACHE_TTL_SECONDS: Final = 60
# Distinct queries kept at once. A household is a handful of dashboards.
ADHOC_CACHE_MAX_ENTRIES: Final = 32
# Upstream requests this path may add per HA instance. A configured route at
# its 300 s default makes 12 an hour; one viewer refreshing every 120 s while
# the card is on screen makes 30. 120 leaves room for a busy household and
# still caps a runaway client at a rate the upstream won't notice.
ADHOC_BUDGET_PER_HOUR: Final = 120
ADHOC_BURST: Final = 10


class AdhocRateLimited(Exception):
    """The instance's ad-hoc budget is spent for now."""

    def __init__(self, retry_after: int) -> None:
        """Remember how long until a token is back."""
        super().__init__(retry_after)
        self.retry_after = retry_after


@dataclass(slots=True, frozen=True)
class AdhocPlan:
    """Ranked connections and when the upstream produced them."""

    trips: tuple[Trip, ...]
    fetched_at: datetime


type _CacheKey = tuple[RouteOptions, str]


class AdhocPlanner:
    """Cache, coalesce and budget ad-hoc trip requests for one HA instance."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Start with a full bucket and an empty cache."""
        self._hass = hass
        self._tz: tzinfo | None = None
        self._cache: OrderedDict[_CacheKey, tuple[float, AdhocPlan]] = OrderedDict()
        self._in_flight: dict[_CacheKey, asyncio.Task[AdhocPlan]] = {}
        self._tokens = float(ADHOC_BURST)
        self._refilled_at = hass.loop.time()

    async def async_plan(self, options: RouteOptions) -> AdhocPlan:
        """Return connections for `options` departing now.

        Raises `AdhocRateLimited` when a fresh request is needed and the
        budget is spent, and `RoutingError` for upstream failures. Failures
        are not cached: the next caller retries, and the budget bounds how
        often that can happen.
        """
        tz = await self._async_tz()
        now = dt_util.now(tz)
        key: _CacheKey = (options, now.strftime("%Y%m%d%H%M"))
        loop_now = self._hass.loop.time()

        cached = self._cache.get(key)
        if cached is not None and cached[0] > loop_now:
            self._cache.move_to_end(key)
            return cached[1]

        task = self._in_flight.get(key)
        if task is None:
            self._take_token(loop_now)
            task = self._hass.async_create_background_task(
                self._async_fetch(key, now, tz),
                name=f"{DOMAIN}_adhoc_plan",
            )
            # HA starts background tasks eagerly, so a fetch that fails
            # without ever suspending is already done here. Only a task still
            # running is worth sharing; cleanup lives in the done callback
            # for the same reason, since a `finally` inside the coroutine
            # would run before this assignment.
            if not task.done():
                self._in_flight[key] = task
            task.add_done_callback(lambda done: self._forget(key, done))
        # Shielded: a dashboard closing mid-request cancels its own wait, not
        # the request every other waiter shares.
        return await asyncio.shield(task)

    async def _async_fetch(
        self, key: _CacheKey, now: datetime, tz: tzinfo
    ) -> AdhocPlan:
        try:
            trips = await async_plan_trips(self._hass, key[0], now, tz)
        except RoutingError as err:
            if err.translation_key != "route_no_connection":
                raise
            # Nothing left tonight is an answer, and worth caching.
            trips = []
        plan = AdhocPlan(trips=tuple(trips), fetched_at=dt_util.utcnow())
        self._store(key, plan)
        return plan

    def _forget(self, key: _CacheKey, task: asyncio.Task[AdhocPlan]) -> None:
        if self._in_flight.get(key) is task:
            del self._in_flight[key]
        # Marks a failure as retrieved even when every waiter went away.
        if not task.cancelled():
            task.exception()

    def _store(self, key: _CacheKey, plan: AdhocPlan) -> None:
        self._cache[key] = (self._hass.loop.time() + ADHOC_CACHE_TTL_SECONDS, plan)
        self._cache.move_to_end(key)
        while len(self._cache) > ADHOC_CACHE_MAX_ENTRIES:
            self._cache.popitem(last=False)

    def _take_token(self, loop_now: float) -> None:
        rate = ADHOC_BUDGET_PER_HOUR / 3600
        self._tokens = min(
            float(ADHOC_BURST), self._tokens + (loop_now - self._refilled_at) * rate
        )
        self._refilled_at = loop_now
        if self._tokens < 1:
            retry_after = math.ceil((1 - self._tokens) / rate)
            _LOGGER.debug(
                "Ad-hoc routing budget spent; next token in %d s", retry_after
            )
            raise AdhocRateLimited(retry_after)
        self._tokens -= 1

    async def _async_tz(self) -> tzinfo:
        if self._tz is None:
            self._tz = (
                await dt_util.async_get_time_zone(ROUTING_TIME_ZONE) or dt_util.UTC
            )
        return self._tz


def async_get_planner(hass: HomeAssistant) -> AdhocPlanner:
    """Return the instance-wide planner, creating it on first use."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    existing = domain_data.get(ADHOC_PLANNER_KEY)
    if isinstance(existing, AdhocPlanner):
        return existing
    planner = AdhocPlanner(hass)
    domain_data[ADHOC_PLANNER_KEY] = planner
    return planner
