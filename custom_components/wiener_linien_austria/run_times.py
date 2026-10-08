"""Scheduled run times from a stop to the stops ahead, fetched on demand.

`/monitor` gives a departure's time at this stop and nothing downstream. The
routing server's departure monitor does: with stop sequences, every vehicle
in the answer lists when it reaches each stop after this one. One answer
covers every line and direction at the stop, so a card can turn any
departure on the board into an estimated arrival per stop by adding the
scheduled minutes to the live departure. `const.py` records the measurements.

Nothing here runs unattended. A sample is fetched when a card asks for a
stop's run times (`websocket.py`, `wiener_linien_austria/run_times`) and the
answer isn't already held, which bounds the requests four ways:

- **Per stop, per week.** A sample is kept for `RUN_TIME_MAX_AGE` in a Store,
  so a restart costs nothing. Only stops with a departure board can be asked
  for; the WebSocket command checks that.
- **Two samples at most.** Trams and buses are timetabled slower by day than
  in the evening, so a sample stands for the part of the day it was taken in
  (`RUN_TIME_DAY_HOURS`). A stop whose trail is only ever opened by day makes
  one request a week.
- **The other sample first.** A line missing from the current part's sample
  is served from the other part's, a few minutes off at worst, before
  anything is fetched.
- **One top-up per line.** A line no sample holds (it runs less often than
  the rows span) earns one more request, once per line and sample and not
  within `RUN_TIME_TOP_UP_AFTER` of the last one for the stop. Never for the
  S-Bahn, which the request leaves out: its run times come from the board's
  own timetable rows.

Callers asking at once share one request. A failure keeps whatever samples
exist and spaces the retries like the S-Bahn timetable does. The 15 s routing
cooldown is not taken: someone has just opened a trail and is waiting.
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Mapping
from dataclasses import dataclass, field
from datetime import datetime, timedelta, tzinfo
from typing import Any, Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CONF_DIVA,
    DOMAIN,
    ROUTING_DEPARTURE_ENDPOINT,
    RUN_TIME_DAY_HOURS,
    RUN_TIME_DEPARTURES_REQUESTED,
    RUN_TIME_MAX_AGE,
    RUN_TIME_TOP_UP_AFTER,
    TIMETABLE_RETRY_AFTER,
    USER_AGENT,
)
from .parsing import as_int
from .rate_limit import backoff_delay
from .routing import RoutingError, async_fetch_trip_body, async_routing_zone
from .static import is_s_bahn_label
from .timetable import build_departure_params, parse_run_times

_LOGGER = logging.getLogger(__name__)

STORE_VERSION = 1
STORE_KEY = f"{DOMAIN}_run_times"

RUN_TIMES_KEY: Final = "run_times"

REGIME_DAY: Final = "day"
REGIME_NIGHT: Final = "night"

# EFA `motType` codes left out of the request: trains (0), the S-Bahn (1) and
# everything from regional buses up (6-11). What stays is what `/monitor`
# lists: U-Bahn (2), Badner Bahn (3 / 4), tram (4) and city bus (5).
_EXCLUDED_MOTS: Final = ("0", "1", *(str(code) for code in range(6, 12)))

# A line and its `/monitor` direction code, e.g. `("U1", "H")`.
type Pair = tuple[str, str]


@dataclass(slots=True)
class RunTimeSample:
    """One answer for a stop: minutes to each stop ahead, per line and direction."""

    fetched_at: datetime
    # (line, direction) → DIVA → scheduled minutes from departing here.
    pairs: dict[Pair, dict[int, float]]
    # Pairs a top-up was already spent on, found or not.
    asked: set[Pair] = field(default_factory=set)


@dataclass(slots=True, frozen=True)
class RunTimeAnswer:
    """What a caller gets: the merged run times and how long they hold."""

    pairs: Mapping[Pair, Mapping[int, float]]
    # When the current part of the day's sample was fetched; None when the
    # answer rests on the other part's alone.
    fetched_at: datetime | None
    # The card asks again after this.
    valid_until: datetime


@dataclass(slots=True)
class _StopState:
    """Everything kept for one stop."""

    samples: dict[str, RunTimeSample] = field(default_factory=dict)
    # The last request, answered or not. In memory only: after a restart a
    # sample's own `fetched_at` still spaces the top-ups.
    attempted_at: datetime | None = None
    failures: int = 0
    retry_spacing: timedelta = TIMETABLE_RETRY_AFTER
    last_error: RoutingError | None = None


def regime_at(local: datetime) -> str:
    """Which timetable a Vienna wall-clock time falls in, day or night."""
    start, end = RUN_TIME_DAY_HOURS
    return REGIME_DAY if start <= local.hour < end else REGIME_NIGHT


def regime_ends(local: datetime) -> datetime:
    """The next switch between the two after a Vienna wall-clock time."""
    start, end = RUN_TIME_DAY_HOURS
    midnight = local.replace(hour=0, minute=0, second=0, microsecond=0)
    for hour in (start, end):
        switch = midnight.replace(hour=hour)
        if switch > local:
            return switch
    return (midnight + timedelta(days=1)).replace(hour=start)


class RunTimes:
    """Every stop's run-time samples: fetched on demand, shared, persisted."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Start empty; the Store is read on the first request."""
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
        self._stops: dict[int, _StopState] = {}
        self._loaded = False
        self._load_lock = asyncio.Lock()
        self._in_flight: dict[int, asyncio.Task[RoutingError | None]] = {}

    async def async_get(self, diva: int, pair: Pair | None = None) -> RunTimeAnswer:
        """Run times for the stop, fetching a sample only when one is due.

        `pair` is the line the caller is about to show; it is what can earn
        a top-up. Raises `RoutingError` only when a request failed and there
        is no sample at all to answer with.
        """
        await self._async_load()
        zone = await async_routing_zone()
        now = dt_util.utcnow()
        regime = regime_at(now.astimezone(zone))
        state = self._stops.setdefault(diva, _StopState())
        error: RoutingError | None = None
        if self._is_due(state, regime, pair, now):
            error = await self._async_fetch_shared(diva, state, regime, pair, zone)
        elif state.failures:
            error = state.last_error
        if error is not None and not state.samples:
            raise error
        return self._answer(state, regime, now, zone)

    def _is_due(
        self, state: _StopState, regime: str, pair: Pair | None, now: datetime
    ) -> bool:
        """Whether this call should fetch: no sample, an old one, or a top-up."""
        if (
            state.failures
            and state.attempted_at is not None
            and now - state.attempted_at < state.retry_spacing
        ):
            return False
        sample = state.samples.get(regime)
        if sample is None or now - sample.fetched_at >= RUN_TIME_MAX_AGE:
            return True
        if pair is None or is_s_bahn_label(pair[0]) or pair in sample.asked:
            return False
        if any(pair in held.pairs for held in state.samples.values()):
            return False
        last = max(sample.fetched_at, state.attempted_at or sample.fetched_at)
        return now - last >= RUN_TIME_TOP_UP_AFTER

    async def _async_fetch_shared(
        self,
        diva: int,
        state: _StopState,
        regime: str,
        pair: Pair | None,
        zone: tzinfo,
    ) -> RoutingError | None:
        """Join the request already on the wire for this stop, or start one."""
        task = self._in_flight.get(diva)
        if task is None:
            task = self._hass.async_create_background_task(
                self._async_fetch(diva, state, regime, pair, zone),
                name=f"{DOMAIN}_run_times_{diva}",
            )
            # Started eagerly, so a fetch that never suspends is done here
            # already; only one still running is worth sharing.
            if not task.done():
                self._in_flight[diva] = task
            task.add_done_callback(lambda done: self._forget(diva, done))
        # Shielded: a dashboard closing mid-request cancels its own wait, not
        # the request the other waiters share.
        return await asyncio.shield(task)

    def _forget(self, diva: int, task: asyncio.Task[RoutingError | None]) -> None:
        if self._in_flight.get(diva) is task:
            del self._in_flight[diva]
        # Marks a failure as retrieved even when every waiter went away.
        if not task.cancelled():
            task.exception()

    async def _async_fetch(
        self,
        diva: int,
        state: _StopState,
        regime: str,
        pair: Pair | None,
        zone: tzinfo,
    ) -> RoutingError | None:
        """One request for the stop; the error instead of raising it.

        A new or expired sample is replaced. A top-up only adds the lines
        the sample lacked and keeps its age, so the whole sample still
        expires a week after it was first fetched.
        """
        started = state.attempted_at = dt_util.utcnow()
        try:
            body = await async_fetch_trip_body(
                async_get_clientsession(self._hass),
                build_departure_params(
                    diva,
                    RUN_TIME_DEPARTURES_REQUESTED,
                    with_stops=True,
                    excluded_mots=_EXCLUDED_MOTS,
                ),
                USER_AGENT,
                endpoint=ROUTING_DEPARTURE_ENDPOINT,
            )
        except RoutingError as err:
            state.failures += 1
            state.retry_spacing = backoff_delay(
                TIMETABLE_RETRY_AFTER, state.failures, jitter=True
            )
            state.last_error = err
            if state.failures == 1:
                _LOGGER.warning(
                    "Run times for stop %s unavailable: %s %s. Retrying when "
                    "a card asks again, less often the longer it lasts.",
                    diva,
                    err.translation_key,
                    err.placeholders,
                )
            return err
        if state.failures:
            state.failures = 0
            state.retry_spacing = TIMETABLE_RETRY_AFTER
            state.last_error = None
            _LOGGER.info("Run times for stop %s are back", diva)
        pairs = parse_run_times(body, zone)
        sample = state.samples.get(regime)
        if sample is None or started - sample.fetched_at >= RUN_TIME_MAX_AGE:
            sample = state.samples[regime] = RunTimeSample(
                fetched_at=started, pairs=pairs
            )
        else:
            for found, minutes in pairs.items():
                sample.pairs.setdefault(found, minutes)
        if pair is not None:
            sample.asked.add(pair)
        _LOGGER.debug(
            "Run times for stop %s (%s): %d lines and directions",
            diva,
            regime,
            len(sample.pairs),
        )
        await self._async_save()
        return None

    def _answer(
        self, state: _StopState, regime: str, now: datetime, zone: tzinfo
    ) -> RunTimeAnswer:
        """The current part's sample laid over the other part's."""
        merged: dict[Pair, Mapping[int, float]] = {}
        for name, held in state.samples.items():
            if name != regime:
                merged.update(held.pairs)
        current = state.samples.get(regime)
        if current is not None:
            merged.update(current.pairs)
        if current is not None and now - current.fetched_at < RUN_TIME_MAX_AGE:
            valid_until = min(
                regime_ends(now.astimezone(zone)),
                current.fetched_at + RUN_TIME_MAX_AGE,
            )
        else:
            # Standing in for a sample that couldn't be fetched: ask again
            # once the retry spacing allows a request.
            valid_until = now + state.retry_spacing
        return RunTimeAnswer(
            pairs=merged,
            fetched_at=current.fetched_at if current is not None else None,
            valid_until=valid_until,
        )

    async def _async_load(self) -> None:
        """Read the stored samples once; an unreadable Store starts empty."""
        async with self._load_lock:
            if self._loaded:
                return
            self._loaded = True
            try:
                raw = await self._store.async_load()
            except (OSError, json.JSONDecodeError) as err:
                _LOGGER.warning("Failed to read the stored run times (%s)", err)
                return
            if not raw:
                return
            try:
                self._stops = _stops_from_store(raw)
            except (KeyError, TypeError, ValueError, AttributeError) as err:
                _LOGGER.warning("Ignoring corrupt stored run times (%s)", err)

    async def _async_save(self) -> None:
        """Persist the samples of the stops that still have a departure board."""
        configured = {
            as_int({**entry.data, **entry.options}.get(CONF_DIVA))
            for entry in self._hass.config_entries.async_entries(DOMAIN)
        }
        for diva in [diva for diva in self._stops if diva not in configured]:
            del self._stops[diva]
        try:
            await self._store.async_save(_stops_to_store(self._stops))
        except OSError as err:
            _LOGGER.warning("Failed to persist run times (%s); in-memory only", err)


@callback
def async_get_run_times(hass: HomeAssistant) -> RunTimes:
    """The instance's run-time registry, created on first use."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    registry = domain_data.get(RUN_TIMES_KEY)
    if not isinstance(registry, RunTimes):
        registry = domain_data[RUN_TIMES_KEY] = RunTimes(hass)
    return registry


def _pair_key(pair: Pair) -> str:
    return f"{pair[0]}|{pair[1]}"


def _pair_from_key(key: str) -> Pair:
    line, _, direction = key.rpartition("|")
    if not line or not direction:
        raise ValueError(f"unreadable line key {key!r}")
    return line, direction


def _stops_to_store(stops: Mapping[int, _StopState]) -> dict[str, Any]:
    return {
        "stops": {
            str(diva): {
                regime: {
                    "fetched_at": sample.fetched_at.isoformat(),
                    "pairs": {
                        _pair_key(pair): {str(stop): m for stop, m in minutes.items()}
                        for pair, minutes in sample.pairs.items()
                    },
                    "asked": sorted(_pair_key(pair) for pair in sample.asked),
                }
                for regime, sample in state.samples.items()
            }
            for diva, state in stops.items()
            if state.samples
        }
    }


def _stops_from_store(raw: Mapping[str, Any]) -> dict[int, _StopState]:
    """Rebuild the stored samples. Raises on a malformed payload."""
    stops: dict[int, _StopState] = {}
    for diva_key, regimes in raw["stops"].items():
        state = _StopState()
        for regime, stored in regimes.items():
            if regime not in (REGIME_DAY, REGIME_NIGHT):
                continue
            fetched_at = dt_util.parse_datetime(stored["fetched_at"])
            if fetched_at is None:
                raise ValueError(f"unreadable fetched_at for stop {diva_key}")
            state.samples[regime] = RunTimeSample(
                fetched_at=fetched_at,
                pairs={
                    _pair_from_key(key): {
                        int(stop): float(m) for stop, m in minutes.items()
                    }
                    for key, minutes in stored["pairs"].items()
                },
                asked={_pair_from_key(key) for key in stored.get("asked", ())},
            )
        stops[int(diva_key)] = state
    return stops
