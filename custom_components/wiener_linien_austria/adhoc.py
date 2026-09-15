"""On-demand trip planning: the route card's From / To mode and `plan_trip`.

A configured route is polled once by the backend and shared by every
dashboard. An on-demand query is the opposite: any viewer picks any two
stops, any script can call `plan_trip`, and every open dashboard is a
potential caller. Four guards keep that from turning into a load the
upstream notices:

- **Cache.** A plan for "now" is keyed on the query alone and lives for
  `ADHOC_CACHE_TTL_SECONDS`, so every dashboard showing the same pair shares
  one answer per minute however their refresh timers are phased. A plan up
  to a minute old is still
  correct for "now": departed connections are dropped when it is served. A
  plan for a given time is keyed on that minute, the request's resolution,
  and keeps every connection it found: planning tomorrow's trip at 23:00
  must not lose the 07:00 departures to today's clock.
- **Coalescing.** A query already on the wire is awaited, not repeated, so N
  callers asking at once cost one request.
- **Budget.** Only a cache miss takes a token, from two buckets at once: one
  per HA user (`ADHOC_USER_BURST`, `ADHOC_USER_BUDGET_PER_HOUR`) and one for
  the whole instance (`ADHOC_BURST`, `ADHOC_BUDGET_PER_HOUR`). The per-user
  bucket runs out first, so one noisy tab or script can't spend everybody's
  share. Calls without a user (automations) share one bucket.
- **Stale answer.** With the budget spent, a caller that allows it gets the
  last plan for the same query if it is at most `ADHOC_STALE_MAX_SECONDS`
  old, marked `stale`, instead of an error. Otherwise `AdhocRateLimited`.

The 15 s routing cooldown in rate_limit.py is deliberately not taken: someone
is waiting for the answer. The budget is what bounds this path instead.

Live times (live.py) are applied when a plan is served, never stored: the
cache keeps the timetable plan, and every answer takes the newest `/monitor`
rows. A fresh plan leases its boarding stops for `ADHOC_LEASE_SECONDS` so
the departure boards' shared request carries them, and makes a `/monitor`
call of its own only when those stops have no answer yet. That call rides on
the plan's budget token; a cache hit never makes one.

Nothing here is written to diagnostics, the recorder or an info-level log. A
stop pair picked on a dashboard is a movement pattern: a plan is purged once
it is older than `ADHOC_STALE_MAX_SECONDS`, and all of them when the last
entry unloads. The budget itself is kept, so removing and re-adding the
integration doesn't refill it.
"""

from __future__ import annotations

import asyncio
import logging
import math
from collections import OrderedDict
from dataclasses import dataclass, replace
from datetime import datetime, timedelta, tzinfo
from typing import Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .live import (
    ADHOC_LEASE_SECONDS,
    apply_live,
    async_get_live_board,
    async_live_trips,
    rbls_for_trips,
)
from .route_coordinator import async_plan_trips
from .routing import RouteOptions, RoutingError, Trip, async_routing_zone
from .static import current_catalogue

_LOGGER = logging.getLogger(__name__)

ADHOC_PLANNER_KEY: Final = "adhoc_planner"

# One minute. A plan for "now" that is up to a minute old still lists the
# right connections once departed ones are dropped; any older and a
# connection added in the meantime could be missing.
ADHOC_CACHE_TTL_SECONDS: Final = 60
# How old a plan may be to stand in when the budget is spent. The card says
# when it was fetched, so an older plan is honest, just less useful.
ADHOC_STALE_MAX_SECONDS: Final = 300
# Distinct queries kept at once. A household is a handful of dashboards.
ADHOC_CACHE_MAX_ENTRIES: Final = 32
# Upstream requests this path may add per HA instance. A configured route at
# its 300 s default makes 12 an hour in steady state (the refresh pulled up
# after a departure replaces the scheduled one, and never comes sooner than
# 60 s); one viewer refreshing every 60-120 s while the card is on screen
# makes 30-60. 120 leaves room for a busy
# household and still caps a runaway client at a rate the upstream won't
# notice.
ADHOC_BUDGET_PER_HOUR: Final = 120
ADHOC_BURST: Final = 10
# Per HA user: one viewer's refresh rate plus room to pick a few pairs, so a
# single user can never spend more than half the instance's budget.
ADHOC_USER_BUDGET_PER_HOUR: Final = 60
ADHOC_USER_BURST: Final = 5

# Bucket for calls that carry no user, e.g. `plan_trip` from an automation.
_NO_USER: Final = ""


class AdhocRateLimited(Exception):
    """The caller's or the instance's budget is spent for now."""

    def __init__(self, retry_after: int) -> None:
        """Remember how long until a token is back."""
        super().__init__(retry_after)
        self.retry_after = retry_after


@dataclass(slots=True, frozen=True)
class AdhocPlan:
    """Ranked connections and when the upstream produced them.

    `stale` marks a plan served past its TTL because the budget was spent;
    `retry_after` then says when a fresh one can be had.
    """

    trips: tuple[Trip, ...]
    fetched_at: datetime
    stale: bool = False
    retry_after: int | None = None


class _TokenBucket:
    """`burst` tokens, refilled continuously at `per_hour`."""

    __slots__ = ("_burst", "_rate", "_refilled_at", "_tokens")

    def __init__(self, burst: int, per_hour: int, now: float) -> None:
        self._burst = float(burst)
        self._rate = per_hour / 3600
        self._tokens = float(burst)
        self._refilled_at = now

    def wait(self, now: float) -> int:
        """Seconds until a token is available; 0 when one is now."""
        self._tokens = min(
            self._burst, self._tokens + (now - self._refilled_at) * self._rate
        )
        self._refilled_at = now
        if self._tokens >= 1:
            return 0
        return math.ceil((1 - self._tokens) / self._rate)

    def take(self) -> None:
        """Spend one token. Call only right after `wait` returned 0."""
        self._tokens -= 1


type _CacheKey = tuple[RouteOptions, str | None, bool]


class AdhocPlanner:
    """Cache, coalesce and budget on-demand trip requests for one HA instance."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Start with full buckets and an empty cache."""
        self._hass = hass
        self._tz: tzinfo | None = None
        self._cache: OrderedDict[_CacheKey, tuple[float, AdhocPlan]] = OrderedDict()
        self._in_flight: dict[_CacheKey, asyncio.Task[AdhocPlan]] = {}
        self._bucket = _TokenBucket(
            ADHOC_BURST, ADHOC_BUDGET_PER_HOUR, hass.loop.time()
        )
        self._user_buckets: dict[str, _TokenBucket] = {}
        # Bumped by `async_clear_cache`, so a fetch started before a clear
        # doesn't put its plan back afterwards.
        self._generation = 0

    async def async_plan(
        self,
        options: RouteOptions,
        *,
        user_id: str | None = None,
        when: datetime | None = None,
        arrive_by: bool = False,
        allow_stale: bool = False,
    ) -> AdhocPlan:
        """Return connections for `options`, now or at `when`.

        Raises `AdhocRateLimited` when a fresh request is needed, the budget
        is spent and no stale plan may stand in, and `RoutingError` for
        upstream failures. Failures are not cached: the next caller retries,
        and the budget bounds how often that can happen.
        """
        tz = await self._async_tz()
        now = dt_util.now(tz)
        at = now if when is None else when.astimezone(tz)
        key: _CacheKey = (
            options,
            None if when is None else at.strftime("%Y%m%d%H%M"),
            arrive_by,
        )
        loop_now = self._hass.loop.time()
        self._purge(loop_now)

        cached = self._cache.get(key)
        if cached is not None and loop_now - cached[0] < ADHOC_CACHE_TTL_SECONDS:
            self._cache.move_to_end(key)
            return self._with_live_rows(key, self._serve(key, cached[1], now))

        task = self._in_flight.get(key)
        if task is None:
            retry_after = self._take_token(user_id, loop_now)
            if retry_after:
                if (
                    allow_stale
                    and cached is not None
                    and loop_now - cached[0] < ADHOC_STALE_MAX_SECONDS
                ):
                    plan = self._with_live_rows(key, self._serve(key, cached[1], now))
                    return replace(plan, stale=True, retry_after=retry_after)
                raise AdhocRateLimited(retry_after)
            task = self._hass.async_create_background_task(
                self._async_fetch(key, at, tz),
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
        plan = await asyncio.shield(task)
        trips = await async_live_trips(
            self._hass,
            _lease_owner(key),
            plan.trips,
            key[0].min_transfer_minutes,
            cooldown=False,
            lease_seconds=ADHOC_LEASE_SECONDS,
        )
        return replace(plan, trips=tuple(trips))

    @callback
    def _with_live_rows(self, key: _CacheKey, plan: AdhocPlan) -> AdhocPlan:
        """A cached plan with the newest rows applied and its lease renewed.

        No request: whatever the shared `/monitor` answer holds is used.
        """
        board = async_get_live_board(self._hass)
        rbls = rbls_for_trips(
            current_catalogue(self._hass), plan.trips, dt_util.utcnow()
        )
        board.lease(_lease_owner(key), rbls, ADHOC_LEASE_SECONDS)
        if not rbls:
            return plan
        trips = apply_live(
            plan.trips, board.rows_for(rbls), key[0].min_transfer_minutes
        )
        return replace(plan, trips=tuple(trips))

    async def _async_fetch(self, key: _CacheKey, at: datetime, tz: tzinfo) -> AdhocPlan:
        generation = self._generation
        try:
            trips = await async_plan_trips(
                self._hass,
                key[0],
                at,
                tz,
                arrive_by=key[2],
                planned=key[1] is not None,
            )
        except RoutingError as err:
            if err.translation_key != "route_no_connection":
                raise
            # Nothing left tonight is an answer, and worth caching.
            trips = []
        plan = AdhocPlan(trips=tuple(trips), fetched_at=dt_util.utcnow())
        if generation == self._generation:
            self._store(key, plan)
        return plan

    def _forget(self, key: _CacheKey, task: asyncio.Task[AdhocPlan]) -> None:
        if self._in_flight.get(key) is task:
            del self._in_flight[key]
        # Marks a failure as retrieved even when every waiter went away.
        if not task.cancelled():
            task.exception()

    @callback
    def async_clear_cache(self) -> None:
        """Forget every plan, including any a request on the wire returns.

        That request still answers whoever is waiting for it; only the
        cache doesn't keep it.
        """
        self._cache.clear()
        self._generation += 1

    def _purge(self, loop_now: float) -> None:
        """Drop plans too old to serve, even as stale."""
        expired = [
            key
            for key, (stored_at, _plan) in self._cache.items()
            if loop_now - stored_at >= ADHOC_STALE_MAX_SECONDS
        ]
        for key in expired:
            del self._cache[key]

    def _store(self, key: _CacheKey, plan: AdhocPlan) -> None:
        # Stored with its fetch time, not an expiry: the same entry is fresh
        # for the TTL and may stand in as stale for longer.
        self._cache[key] = (self._hass.loop.time(), plan)
        self._cache.move_to_end(key)
        while len(self._cache) > ADHOC_CACHE_MAX_ENTRIES:
            self._cache.popitem(last=False)

    @classmethod
    def _serve(cls, key: _CacheKey, plan: AdhocPlan, now: datetime) -> AdhocPlan:
        """A cached plan as served: "now" plans lose what left since."""
        return plan if key[1] is not None else cls._drop_departed(plan, now)

    @staticmethod
    def _drop_departed(plan: AdhocPlan, now: datetime) -> AdhocPlan:
        """Serve a cached plan without connections that left since.

        Same one-minute grace as `rank_trips`. Returns `plan` itself when
        nothing left, so callers sharing a plan keep sharing the object.
        """
        cutoff = now - timedelta(minutes=1)
        kept = tuple(
            trip
            for trip in plan.trips
            if trip.departure is None or trip.departure >= cutoff
        )
        return plan if len(kept) == len(plan.trips) else replace(plan, trips=kept)

    def _take_token(self, user_id: str | None, loop_now: float) -> int:
        """Take one token from both buckets, or neither.

        Returns 0 on success, else the seconds until both have one again.
        """
        user_key = user_id or _NO_USER
        user_bucket = self._user_buckets.get(user_key)
        if user_bucket is None:
            user_bucket = _TokenBucket(
                ADHOC_USER_BURST, ADHOC_USER_BUDGET_PER_HOUR, loop_now
            )
            self._user_buckets[user_key] = user_bucket
        retry_after = max(user_bucket.wait(loop_now), self._bucket.wait(loop_now))
        if retry_after:
            _LOGGER.debug("Routing budget spent; next token in %d s", retry_after)
            return retry_after
        user_bucket.take()
        self._bucket.take()
        return 0

    async def _async_tz(self) -> tzinfo:
        if self._tz is None:
            self._tz = await async_routing_zone()
        return self._tz


def _lease_owner(key: _CacheKey) -> str:
    """One lease per distinct query, so two dashboards share it."""
    return f"adhoc:{hash(key)}"


@callback
def async_get_planner(hass: HomeAssistant) -> AdhocPlanner:
    """Return the instance-wide planner, creating it on first use."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    existing = domain_data.get(ADHOC_PLANNER_KEY)
    if isinstance(existing, AdhocPlanner):
        return existing
    planner = AdhocPlanner(hass)
    domain_data[ADHOC_PLANNER_KEY] = planner
    return planner
