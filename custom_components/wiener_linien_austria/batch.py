"""Shared monitor batch fetcher — one /monitor request per interval group.

Every config entry configured with the same scan interval shares a single
``MonitorBatchGroup``. On each tick the group issues ONE ``/monitor`` request
carrying the deduped union of all member RBLs as repeated ``stopId`` params,
then fans the response out to each member coordinator, which parses its own
slice (its RBLs, its line/direction filters, its ``stops_ahead`` enrichment).

Why a shared timer rather than per-entry coordinators coalescing their own
requests: per-entry ``DataUpdateCoordinator`` timers are phase-shifted (each
entry starts at a different instant), so overlapping in-flight requests can't
be coalesced reliably. A single group timer fetches for the whole group at
once — collapsing N requests to one and eliminating the ~N x 15 s serialised
drain the domain cooldown otherwise imposed (see rate_limit.py).

The upstream API omits unknown/decommissioned ``stopId``s from an otherwise
``messageCode: 1`` response rather than erroring (verified empirically), so a
single stale RBL never fails the batch — the affected member simply parses
zero departures for that stop, exactly as a per-entry fetch would today.
"""

from __future__ import annotations

import asyncio
import logging
import random
from dataclasses import dataclass
from datetime import timedelta
from typing import TYPE_CHECKING, Any

import aiohttp
from homeassistant.core import CALLBACK_TYPE, HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.update_coordinator import UpdateFailed

from .const import (
    API_BASE_URL,
    BACKOFF_CAP_SECONDS,
    DOMAIN,
    ERR_RATE_LIMIT,
    MONITOR_ENDPOINT,
    USER_AGENT,
)
from .http import CacheValidators, base_request_headers
from .rate_limit import async_enforce_domain_cooldown

if TYPE_CHECKING:
    from .coordinator import WienerLinienAustriaCoordinator

_LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class BatchResult:
    """Outcome of one combined /monitor fetch, shared by all group members.

    ``body`` is the validated raw JSON (``messageCode == 1``); members parse
    their own slice from it. ``not_modified`` is True on a 304 revalidation —
    the body is the previously-cached one and members should keep their data.
    """

    body: dict[str, Any]
    server_time: str | None
    not_modified: bool = False


class MonitorBatchGroup:
    """One combined /monitor poller shared by all entries at a given interval."""

    def __init__(self, hass: HomeAssistant, interval_seconds: int) -> None:
        """Initialise a batch group for the given scan-interval cadence."""
        self.hass = hass
        self._interval_seconds = interval_seconds
        self._normal_interval = timedelta(seconds=interval_seconds)
        self._current_interval = self._normal_interval
        self._members: dict[str, WienerLinienAustriaCoordinator] = {}
        self._session = async_get_clientsession(hass)
        # Conditional-GET validators for the combined request. Reset whenever
        # the member RBL set changes so a stale ETag can't yield a misleading
        # 304 against a different query (the server would 200 anyway, but
        # resetting keeps the intent explicit).
        self._cache = CacheValidators()
        self._cached_rbls: tuple[int, ...] = ()
        self._last_body: dict[str, Any] | None = None
        # Single-flight: serialise the group's own fetches so a manual
        # refresh and a timer tick can't both fire the request at once.
        self._fetch_lock = asyncio.Lock()
        self._unsub: CALLBACK_TYPE | None = None
        self._consecutive_failures = 0

    # ------------------------------------------------------------------
    # Membership
    # ------------------------------------------------------------------

    def add_member(self, coordinator: WienerLinienAustriaCoordinator) -> None:
        """Register a coordinator into this group and invalidate the RBL cache."""
        self._members[coordinator.entry_id] = coordinator
        self._invalidate_rbl_cache()

    def remove_member(self, entry_id: str) -> bool:
        """Deregister a coordinator; return True if the group is now empty."""
        self._members.pop(entry_id, None)
        self._invalidate_rbl_cache()
        return not self._members

    def _invalidate_rbl_cache(self) -> None:
        """Drop conditional-GET validators when the union RBL set may change."""
        self._cache = CacheValidators()
        self._cached_rbls = ()
        self._last_body = None

    def union_rbls(self) -> list[int]:
        """Deduplicated, sorted union of every member's RBLs."""
        seen: set[int] = set()
        for coordinator in self._members.values():
            seen.update(coordinator.rbls)
        return sorted(seen)

    # ------------------------------------------------------------------
    # Timer lifecycle
    # ------------------------------------------------------------------

    def start(self) -> None:
        """Begin periodic polling at the group's configured cadence."""
        if self._unsub is not None:
            return
        self._unsub = async_track_time_interval(
            self.hass, self._async_timer_tick, self._current_interval
        )

    def stop(self) -> None:
        """Cancel the group timer."""
        if self._unsub is not None:
            self._unsub()
            self._unsub = None

    def _reschedule(self, interval: timedelta) -> None:
        """Swap the timer to a new cadence (used by backoff)."""
        if interval == self._current_interval:
            return
        self._current_interval = interval
        if self._unsub is not None:
            self._unsub()
            self._unsub = async_track_time_interval(
                self.hass, self._async_timer_tick, interval
            )

    async def _async_timer_tick(self, _now: Any) -> None:
        """Fetch once for the whole group and fan the result out to members."""
        # Snapshot members up front — the fetch awaits, and a concurrent
        # unload could mutate the dict mid-iteration otherwise.
        members = list(self._members.values())
        if not members:
            return
        try:
            result = await self.async_fetch()
        except UpdateFailed as err:
            self._note_failure()
            for coordinator in members:
                coordinator.batch_set_error(err)
            return
        self._note_success()
        if result.not_modified:
            # Nothing changed upstream — members keep their prior data.
            return
        for coordinator in members:
            coordinator.batch_apply(result)

    # ------------------------------------------------------------------
    # Fetch
    # ------------------------------------------------------------------

    async def async_fetch(self) -> BatchResult:
        """Perform one combined /monitor request for the union of member RBLs.

        Raises ``UpdateFailed`` on any transport/upstream error. Applies
        per-member side effects (server-time / error-code meta, rate-limit
        Repairs issue) so both the timer path and a member's
        ``async_config_entry_first_refresh`` observe identical behaviour.
        """
        async with self._fetch_lock:
            return await self._async_fetch_locked()

    async def _async_fetch_locked(self) -> BatchResult:
        await async_enforce_domain_cooldown(self.hass)

        rbls = self.union_rbls()
        rbl_tuple = tuple(rbls)
        if rbl_tuple != self._cached_rbls:
            # Membership changed since the last fetch — the cached validators
            # belong to a different query. Drop them.
            self._cache = CacheValidators()
            self._cached_rbls = rbl_tuple
            self._last_body = None

        url = f"{API_BASE_URL}{MONITOR_ENDPOINT}"
        params: list[tuple[str, str]] = [("stopId", str(rbl)) for rbl in rbls]
        headers = base_request_headers(USER_AGENT)
        headers.update(self._cache.to_request_headers())
        timeout = aiohttp.ClientTimeout(total=30)

        try:
            async with self._session.get(
                url, params=params, headers=headers, timeout=timeout
            ) as resp:
                status = resp.status
                if status == 304:
                    if self._last_body is not None:
                        self._cache.update_from_response(resp)
                        return BatchResult(
                            body=self._last_body,
                            server_time=self._last_body.get("message", {}).get(
                                "serverTime"
                            ),
                            not_modified=True,
                        )
                    # 304 with no cached body to revalidate — treat as a
                    # transient (practically unreachable: validators reset on
                    # init and on membership change).
                    raise UpdateFailed(
                        translation_domain=DOMAIN,
                        translation_key="api_invalid_response",
                        translation_placeholders={
                            "status": "304",
                            "error": "no cached data to revalidate",
                        },
                    )
                resp.raise_for_status()

                try:
                    body = await resp.json()
                except (aiohttp.ContentTypeError, ValueError) as err:
                    raise UpdateFailed(
                        translation_domain=DOMAIN,
                        translation_key="api_invalid_response",
                        translation_placeholders={
                            "status": str(status),
                            "error": str(err),
                        },
                    ) from err

                if not isinstance(body, dict):
                    raise UpdateFailed(
                        translation_domain=DOMAIN,
                        translation_key="api_invalid_response",
                        translation_placeholders={
                            "status": str(status),
                            "error": f"expected object, got {type(body).__name__}",
                        },
                    )

                message = body.get("message") or {}
                code = _safe_int(message.get("messageCode"))
                server_time = message.get("serverTime")
                # Propagate the latest server-time / error-code to every member
                # before any raise, so diagnostics reflect the last observed
                # upstream state even on an error tick.
                for coordinator in self._members.values():
                    coordinator.apply_upstream_meta(server_time, code)

                if code == ERR_RATE_LIMIT:
                    for coordinator in self._members.values():
                        coordinator.note_rate_limited()
                    raise UpdateFailed(
                        translation_domain=DOMAIN,
                        translation_key="api_rate_limited",
                    )

                if code is not None and code != 1:
                    raise UpdateFailed(
                        translation_domain=DOMAIN,
                        translation_key="api_upstream_error",
                        translation_placeholders={
                            "code": str(code),
                            "value": str(message.get("value") or ""),
                        },
                    )

                for coordinator in self._members.values():
                    coordinator.note_not_rate_limited()
                # Capture validators only on a fully-validated 200 — never for
                # an error reply, else the next tick would send If-None-Match
                # against a payload we never accepted.
                self._cache.update_from_response(resp)
                self._last_body = body
        except TimeoutError as err:
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="api_timeout",
                translation_placeholders={"seconds": "30"},
            ) from err
        except aiohttp.ClientResponseError as err:
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="api_http_error",
                translation_placeholders={
                    "status": str(err.status),
                    "reason": err.message or "",
                },
            ) from err
        except aiohttp.ClientError as err:
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="api_connection_error",
                translation_placeholders={
                    "error_type": type(err).__name__,
                    "error": str(err),
                },
            ) from err

        return BatchResult(body=body, server_time=server_time)

    # ------------------------------------------------------------------
    # Backoff (group-wide — a combined request fails or succeeds as a whole)
    # ------------------------------------------------------------------

    def _note_success(self) -> None:
        """Reset the failure counter and restore the normal cadence."""
        if self._consecutive_failures == 0:
            return
        self._consecutive_failures = 0
        self._reschedule(self._normal_interval)

    def _note_failure(self) -> None:
        """Bump the failure counter and widen the cadence with jittered backoff.

        First failure holds the configured cadence (transient hiccups
        shouldn't slow the loop). From the second onward the interval doubles,
        capped at ``BACKOFF_CAP_SECONDS``. Jitter (+/-10%) avoids a
        thundering-herd retry when the API recovers. Reset on the next success.
        """
        self._consecutive_failures += 1
        if self._consecutive_failures < 2:
            return
        normal_secs = self._normal_interval.total_seconds()
        backoff_secs = min(
            normal_secs * (2 ** (self._consecutive_failures - 1)),
            BACKOFF_CAP_SECONDS,
        )
        jittered = backoff_secs * random.uniform(0.9, 1.1)
        self._reschedule(timedelta(seconds=jittered))


def _safe_int(value: Any) -> int | None:
    """Best-effort integer coercion; returns None on failure."""
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
