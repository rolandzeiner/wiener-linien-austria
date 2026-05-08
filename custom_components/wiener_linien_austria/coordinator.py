"""DataUpdateCoordinator for Wiener Linien Austria."""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import timedelta
from typing import Any

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    API_BASE_URL,
    BACKOFF_CAP_SECONDS,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    ERR_RATE_LIMIT,
    MONITOR_ENDPOINT,
    USER_AGENT,
)
from .http import CacheValidators, base_request_headers
from .rate_limit import async_enforce_domain_cooldown
# `static` is loaded eagerly: `stops_ahead_for_match` runs in the
# /monitor parser's hot loop (was the original reason this file pulled
# `static` to module level), and once that's eager every other name we
# read from `static` is already in `sys.modules` — there's no
# import-time saving from keeping `async_get_catalogue` /
# `CATALOGUE_KEY` / `StaticCatalogue` lazy, just lint-suppression
# annotations to maintain on a hot integration-load path.
from .static import (
    CATALOGUE_KEY,
    StaticCatalogue,
    async_get_catalogue,
    stops_ahead_for_match,
)

_LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class Departure:
    """One departure row from the monitor endpoint."""

    line: str
    towards: str
    direction: str  # "H" | "R"
    type: str  # ptMetro | ptTram | ptBusCity | ptBusNight | …
    countdown: int
    time_planned: str | None
    time_real: str | None
    realtime: bool
    barrier_free: bool
    traffic_jam: bool
    platform: str | None = None  # "1" / "2" / "A" / "B" — Gleis as published
    # Ordered list of upcoming stops on the trip the vehicle is running.
    # None when the static trip-pattern index hasn't loaded or no pattern
    # matches the row (replacement service, short-turn variant, etc.). The
    # card treats None and missing-key as identical: render no chevron.
    stops_ahead: list[dict[str, Any]] | None = None

    def to_dict(self) -> dict[str, Any]:
        """Render as a plain dict for HA attributes / diagnostics."""
        out: dict[str, Any] = {
            "line": self.line,
            "towards": self.towards,
            "direction": self.direction,
            "type": self.type,
            "countdown": self.countdown,
            "time_planned": self.time_planned,
            "time_real": self.time_real,
            "realtime": self.realtime,
            "barrier_free": self.barrier_free,
            "traffic_jam": self.traffic_jam,
            "platform": self.platform,
        }
        if self.stops_ahead is not None:
            out["stops_ahead"] = self.stops_ahead
        return out


@dataclass(slots=True)
class MonitorData:
    """Coordinator payload: sorted departures + the latest server timestamp."""

    departures: list[Departure]
    server_time: str | None


class WienerLinienAustriaCoordinator(DataUpdateCoordinator[MonitorData]):
    """Fetch departures from the Wiener Linien monitor endpoint."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialise the coordinator."""
        config = {**entry.data, **entry.options}
        self._entry = entry
        self._rbls: list[int] = [int(x) for x in config[CONF_RBLS]]
        self._selected_lines: set[str] | None = _normalise_lines(
            config.get(CONF_LINES)
        )
        self._session = async_get_clientsession(hass)
        self._rate_limited: bool = False
        self._last_error_code: int | None = None
        self._server_time: str | None = None
        self._diva: int = int(config[CONF_DIVA])
        self._latitude: float | None = None
        self._longitude: float | None = None
        # De-dupe stops_ahead matcher exceptions per line label so a
        # genuine schema change surfaces once at WARNING (loud enough to
        # be noticed) without spamming the logbook every poll.
        self._stops_ahead_warned_lines: set[str] = set()
        # Conditional-GET validators captured from the previous /monitor
        # response. The CDN sets ETag + Last-Modified on every reply; we
        # echo them back as If-None-Match / If-Modified-Since so unchanged
        # ticks come back as 304 (no body) and cost only headers.
        self._monitor_cache = CacheValidators()
        # Exponential-backoff bookkeeping for sustained API outages. We
        # leave self._normal_interval immutable as the user-configured
        # cadence; self.update_interval is what HA actually reads, and we
        # bump it temporarily after consecutive UpdateFailed.
        self._consecutive_failures = 0
        self._normal_interval = timedelta(
            seconds=int(config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
        )

        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=self._normal_interval,
            # Absorb request storms (options-flow save, manual reload,
            # dashboard edit-mode flip) so /monitor isn't hit 3-4× back
            # to back. Cooldown matches the 15s domain-wide floor.
            # `immediate=False` makes the FIRST call wait too — matters
            # during config-flow setup where test-before-configure and
            # first-refresh land back-to-back.
            request_refresh_debouncer=Debouncer(
                hass,
                _LOGGER,
                cooldown=15,
                immediate=False,
            ),
        )

    async def _async_setup(self) -> None:
        """Load the cached static catalogue and pluck this stop's coords.

        Auto-called by `async_config_entry_first_refresh()` per HA core
        contract — do NOT invoke from `async_setup_entry`. Failure is
        non-fatal: coords stay None and the sensor falls back to a
        text-based Google Maps query instead of lat/lon. The catalogue is
        usually already in hass storage from the config flow, so this is a
        memory read, not a network call.
        """
        try:
            catalogue = await async_get_catalogue(self.hass)
        except (
            aiohttp.ClientError,
            asyncio.TimeoutError,
            KeyError,
            TypeError,
            ValueError,
            RuntimeError,
        ) as err:
            _LOGGER.debug("Could not load static catalogue for coords: %s", err)
            return
        station = catalogue.stations_by_diva.get(self._diva)
        if station is not None:
            self._latitude = station.latitude
            self._longitude = station.longitude

    # ------------------------------------------------------------------
    # Properties surfaced to diagnostics and the sensor platform
    # ------------------------------------------------------------------

    @property
    def last_error_code(self) -> int | None:
        """Return the API errorCode of the most recent unsuccessful call."""
        return self._last_error_code

    @property
    def server_time(self) -> str | None:
        """Return the last `serverTime` Wiener Linien reported."""
        return self._server_time

    @property
    def rbls(self) -> list[int]:
        return list(self._rbls)

    @property
    def latitude(self) -> float | None:
        """Stop latitude from the static catalogue (None if lookup failed)."""
        return self._latitude

    @property
    def longitude(self) -> float | None:
        """Stop longitude from the static catalogue (None if lookup failed)."""
        return self._longitude

    # ------------------------------------------------------------------
    # Repair-issue helpers
    # ------------------------------------------------------------------

    def _raise_rate_limit_issue(self) -> None:
        """Raise a Repairs issue the first time Wiener Linien rate-limits us."""
        if self._rate_limited:
            return
        self._rate_limited = True
        ir.async_create_issue(
            self.hass,
            DOMAIN,
            f"rate_limited_{self._entry.entry_id}",
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="rate_limited",
            translation_placeholders={"entry_title": self._entry.title},
        )

    def _clear_rate_limit_issue(self) -> None:
        """Clear the rate-limit Repairs issue once the API recovers."""
        if not self._rate_limited:
            return
        self._rate_limited = False
        ir.async_delete_issue(
            self.hass, DOMAIN, f"rate_limited_{self._entry.entry_id}"
        )

    # ------------------------------------------------------------------
    # Fetch
    # ------------------------------------------------------------------

    async def _async_update_data(self) -> MonitorData:
        """Fetch departures and return a sorted MonitorData."""
        try:
            data = await self._fetch_monitor_data()
        except UpdateFailed:
            self._note_failure()
            raise
        self._note_success()
        return data

    async def _fetch_monitor_data(self) -> MonitorData:
        """Inner fetch — separated so backoff bookkeeping can wrap it."""
        await async_enforce_domain_cooldown(self.hass)

        url = f"{API_BASE_URL}{MONITOR_ENDPOINT}"
        params: list[tuple[str, str]] = [
            ("stopId", str(rbl)) for rbl in self._rbls
        ]
        headers = base_request_headers(USER_AGENT)
        headers.update(self._monitor_cache.to_request_headers())
        timeout = aiohttp.ClientTimeout(total=30)

        # Single `async with` block keeps the response scoped tightly so
        # aiohttp returns the connection to the pool the moment we're
        # done — even on early `raise UpdateFailed(...)` paths. The
        # body read AND the validator capture both need `resp`, so the
        # whole parse/validate flow lives inside the context manager.
        try:
            async with self._session.get(
                url, params=params, headers=headers, timeout=timeout
            ) as resp:
                status = resp.status
                # 304 = our cached data is still fresh. Return the previous
                # MonitorData unchanged; HA's coordinator handles "same value"
                # by not re-emitting state changes to entities.
                if status == 304:
                    if self.data is not None:
                        self._monitor_cache.update_from_response(resp)
                        return self.data
                    # First tick after restart with no `self.data` yet — a 304
                    # has an empty body, so falling through to `resp.json()`
                    # would surface as a misleading "invalid response". Treat
                    # it as a transient and retry. Practically unreachable
                    # today (validators reset on init), but defends against a
                    # future change that persists them across restarts.
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
                self._last_error_code = code
                self._server_time = message.get("serverTime")

                if code == ERR_RATE_LIMIT:
                    self._raise_rate_limit_issue()
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

                self._clear_rate_limit_issue()
                # Capture validators only on a fully-validated 200 response —
                # never store them for an error reply, else next tick would
                # send If-None-Match against a payload we never accepted.
                self._monitor_cache.update_from_response(resp)
        except asyncio.TimeoutError as err:
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
        # Read the shared catalogue ref live so a background trip-pattern
        # refresh that lands after this coordinator's setup is picked up
        # on the very next parse — no restart needed.
        catalogue = self._current_catalogue()
        return _parse_monitor_body(
            body,
            self._selected_lines,
            self._server_time,
            catalogue=catalogue,
            entry_rbls=self._rbls,
            warned_lines=self._stops_ahead_warned_lines,
        )

    def _current_catalogue(self) -> Any:
        """Fetch the live catalogue ref from hass.data, or None.

        The catalogue may be a `StaticCatalogue` (resolved), an
        `asyncio.Task` (still loading on a fresh start), or absent
        (load hasn't been triggered yet). Only the resolved form is
        useful for enrichment; the others fall through to None and
        the parser skips stops_ahead.
        """
        domain_data = self.hass.data.get(DOMAIN, {})
        cached = domain_data.get(CATALOGUE_KEY)
        if isinstance(cached, StaticCatalogue):
            return cached
        return None

    def _note_success(self) -> None:
        """Reset the consecutive-failure counter and restore normal cadence."""
        if self._consecutive_failures == 0:
            return
        self._consecutive_failures = 0
        if self.update_interval != self._normal_interval:
            self.update_interval = self._normal_interval

    def _note_failure(self) -> None:
        """Bump the consecutive-failure counter and apply exponential backoff.

        First failure stays at the user-configured cadence (transient hiccups
        shouldn't slow down the loop). From the second failure onwards, the
        update interval doubles each time, capped at BACKOFF_CAP_SECONDS so
        a sustained outage settles into a slow poll instead of hammering
        the API every minute. The next successful tick resets it.
        """
        self._consecutive_failures += 1
        if self._consecutive_failures < 2:
            return
        normal_secs = self._normal_interval.total_seconds()
        backoff_secs = min(
            normal_secs * (2 ** (self._consecutive_failures - 1)),
            BACKOFF_CAP_SECONDS,
        )
        new_interval = timedelta(seconds=backoff_secs)
        if self.update_interval != new_interval:
            self.update_interval = new_interval


def _normalise_lines(raw: Any) -> set[str] | None:
    """Coerce CONF_LINES into a set of selected line keys.

    An entry missing/empty CONF_LINES means "track every line at this stop".
    """
    if raw is None:
        return None
    if not isinstance(raw, list):
        return None
    return {str(x) for x in raw} or None


def _parse_monitor_body(
    body: dict[str, Any],
    selected: set[str] | None,
    server_time: str | None,
    *,
    catalogue: Any = None,
    entry_rbls: list[int] | None = None,
    warned_lines: set[str] | None = None,
) -> MonitorData:
    """Parse a successful /monitor response into a MonitorData.

    `catalogue` and `entry_rbls`, when provided, drive the per-row
    `stops_ahead` enrichment via `static.stops_ahead_for_match`. Both are
    optional: tests construct MonitorData directly and this parser is
    re-used in fixtures that don't carry the static layer.

    `warned_lines`, when supplied, is a per-coordinator de-dupe set so
    a stops_ahead matcher exception logs once at WARNING per line label
    rather than spamming on every poll.
    """
    departures: list[Departure] = []
    monitors = (body.get("data") or {}).get("monitors") or []
    # Resolve once per parse — cheap, but no point doing it per row.
    _trip_patterns_loaded = (
        catalogue is not None and getattr(catalogue, "trip_patterns", None) is not None
    )

    # Match the user's selection on (line, direction) only — `line.towards`
    # is unstable for branching termini (e.g. U1/R reports "Oberlaa" or
    # "Alaudagasse" depending on which vehicle is next), so a strict triple
    # match would intermittently drop the whole line block. Each departure
    # keeps its own `vehicle.towards` so the actual destination is preserved.
    selected_pairs: set[tuple[str, str]] | None
    if selected is None:
        selected_pairs = None
    else:
        # Each key is `line|direction` (post-v2-migration shape). Build the
        # pair set explicitly so mypy can narrow to `tuple[str, str]` —
        # using `tuple(k.split("|", 2)[:2])` produced a `tuple[str, ...]`
        # that needed a `# type: ignore[misc]` to land in the typed set.
        # Malformed keys (no pipe) are dropped silently — they could never
        # match `(line_name, direction)` anyway.
        selected_pairs = set()
        for k in selected:
            parts = k.split("|", 2)
            if len(parts) >= 2:
                selected_pairs.add((parts[0], parts[1]))

    for monitor in monitors:
        for line in (monitor.get("lines") or []):
            line_name = str(line.get("name") or "").strip()
            if not line_name:
                continue
            line_towards = str(line.get("towards") or "").strip()
            direction = str(line.get("direction") or "").strip()
            line_type = str(line.get("type") or "").strip()
            barrier_free = bool(line.get("barrierFree"))
            realtime = bool(line.get("realtimeSupported"))
            traffic_jam = bool(line.get("trafficjam"))
            platform_raw = line.get("platform")
            platform = (
                str(platform_raw).strip()
                if platform_raw is not None and str(platform_raw).strip()
                else None
            )

            if selected_pairs is not None and (line_name, direction) not in selected_pairs:
                continue

            for entry in (line.get("departures") or {}).get("departure") or []:
                dep_time = entry.get("departureTime") or {}
                countdown = _safe_int(dep_time.get("countdown"))
                if countdown is None:
                    continue
                vehicle = entry.get("vehicle") or {}
                vehicle_towards = str(vehicle.get("towards") or "").strip()
                resolved_towards = vehicle_towards or line_towards
                stops_ahead: list[dict[str, Any]] | None = None
                if _trip_patterns_loaded and entry_rbls:
                    try:
                        stops_ahead = stops_ahead_for_match(
                            catalogue,
                            line_name,
                            entry_rbls,
                            resolved_towards,
                            live_direction=direction,
                        )
                    except Exception:  # noqa: BLE001
                        # Fail-soft: a single matcher hiccup must not poison
                        # the rest of the parse. `except Exception` (not
                        # `BaseException`) is deliberate — it lets
                        # `asyncio.CancelledError` propagate so an HA
                        # shutdown landing mid-parse is honoured rather
                        # than swallowed. First time we see a line blow
                        # up, log at WARNING so a real upstream schema
                        # change is visible without enabling debug
                        # logging; subsequent ticks for the same line
                        # stay quiet via the per-coordinator warned set.
                        if warned_lines is not None and line_name not in warned_lines:
                            warned_lines.add(line_name)
                            _LOGGER.warning(
                                "stops_ahead lookup failed for %s towards %s "
                                "(further failures for this line will be silent)",
                                line_name,
                                resolved_towards,
                                exc_info=True,
                            )
                        else:
                            _LOGGER.debug(
                                "stops_ahead lookup failed for %s towards %s",
                                line_name,
                                resolved_towards,
                                exc_info=True,
                            )
                        stops_ahead = None
                departures.append(
                    Departure(
                        line=line_name,
                        towards=resolved_towards,
                        direction=direction,
                        type=line_type,
                        countdown=countdown,
                        time_planned=dep_time.get("timePlanned"),
                        time_real=dep_time.get("timeReal"),
                        realtime=realtime,
                        barrier_free=barrier_free,
                        traffic_jam=traffic_jam,
                        platform=platform,
                        stops_ahead=stops_ahead,
                    )
                )

    departures.sort(key=lambda d: (d.countdown, d.line, d.towards))
    return MonitorData(departures=departures, server_time=server_time)


def _safe_int(value: Any) -> int | None:
    """Best-effort integer coercion; returns None on failure."""
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# Threaded through every signature that reads `entry.runtime_data` — required
# by Platinum `runtime-data` + `strict-typing`. Signatures that only use the
# entry for construction (coordinator __init__) or for IDs/title (sensor
# __init__, options-flow staticmethod) keep plain `ConfigEntry`.
type WienerLinienConfigEntry = ConfigEntry[WienerLinienAustriaCoordinator]
