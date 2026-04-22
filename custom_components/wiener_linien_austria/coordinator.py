"""DataUpdateCoordinator for Wiener Linien Austria."""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    API_BASE_URL,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    DOMAIN_COOLDOWN_SECONDS,
    DOMAIN_LAST_CALL_KEY,
    ERR_RATE_LIMIT,
    MONITOR_ENDPOINT,
    USER_AGENT,
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

    def to_dict(self) -> dict[str, Any]:
        """Render as a plain dict for HA attributes / diagnostics."""
        return {
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

        scan = int(config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=scan),
        )

    async def async_setup(self) -> None:
        """Load the cached static catalogue and pluck this stop's coords.

        Failure is non-fatal — coords stay None and the sensor falls back to
        a text-based Google Maps query instead of lat/lon. The catalogue is
        usually already in hass storage from the config flow, so this is a
        memory read, not a network call.
        """
        # Local import to avoid pulling static.py into coordinator import
        # cycles; static.py is a leaf that doesn't import this module.
        from .static import async_load_catalogue  # noqa: PLC0415
        try:
            catalogue = await async_load_catalogue(self.hass)
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

    @callback
    def async_teardown(self) -> None:
        """No-op: no listeners to cancel."""
        return None

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
        """Return the RBL list this coordinator queries."""
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
        await self._enforce_domain_cooldown()

        url = f"{API_BASE_URL}{MONITOR_ENDPOINT}"
        params: list[tuple[str, str]] = [
            ("stopId", str(rbl)) for rbl in self._rbls
        ]
        headers = {"User-Agent": USER_AGENT}
        timeout = aiohttp.ClientTimeout(total=30)

        try:
            resp = await self._session.get(
                url, params=params, headers=headers, timeout=timeout
            )
            resp.raise_for_status()
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

        try:
            body = await resp.json()
        except (aiohttp.ContentTypeError, ValueError) as err:
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="api_invalid_response",
                translation_placeholders={
                    "status": str(resp.status),
                    "error": str(err),
                },
            ) from err

        if not isinstance(body, dict):
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="api_invalid_response",
                translation_placeholders={
                    "status": str(resp.status),
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
        return _parse_monitor_body(body, self._selected_lines, self._server_time)

    async def _enforce_domain_cooldown(self) -> None:
        """Serialise outbound calls across all entries under the 15s floor."""
        domain_data = self.hass.data.setdefault(DOMAIN, {})
        last: datetime | None = domain_data.get(DOMAIN_LAST_CALL_KEY)
        now = dt_util.utcnow()
        if last is not None:
            elapsed = (now - last).total_seconds()
            if elapsed < DOMAIN_COOLDOWN_SECONDS:
                await asyncio.sleep(DOMAIN_COOLDOWN_SECONDS - elapsed)
        domain_data[DOMAIN_LAST_CALL_KEY] = dt_util.utcnow()


def _normalise_lines(raw: Any) -> set[str] | None:
    """Coerce CONF_LINES into a set of selected line keys.

    An entry missing/empty CONF_LINES means "track every line at this stop".
    """
    if raw is None:
        return None
    if not isinstance(raw, list):
        return None
    return {str(x) for x in raw} or None


def _line_key(line: str, direction: str, towards: str) -> str:
    """Stable identifier for a given (line, direction, towards) triple."""
    return f"{line}|{direction}|{towards}"


def _parse_monitor_body(
    body: dict[str, Any],
    selected: set[str] | None,
    server_time: str | None,
) -> MonitorData:
    """Parse a successful /monitor response into a MonitorData."""
    departures: list[Departure] = []
    monitors = (body.get("data") or {}).get("monitors") or []

    for monitor in monitors:
        for line in (monitor.get("lines") or []):
            line_name = str(line.get("name") or "").strip()
            if not line_name:
                continue
            towards = str(line.get("towards") or "").strip()
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

            if selected is not None and _line_key(line_name, direction, towards) not in selected:
                continue

            for entry in (line.get("departures") or {}).get("departure") or []:
                dep_time = entry.get("departureTime") or {}
                countdown = _safe_int(dep_time.get("countdown"))
                if countdown is None:
                    continue
                departures.append(
                    Departure(
                        line=line_name,
                        towards=towards,
                        direction=direction,
                        type=line_type,
                        countdown=countdown,
                        time_planned=dep_time.get("timePlanned"),
                        time_real=dep_time.get("timeReal"),
                        realtime=realtime,
                        barrier_free=barrier_free,
                        traffic_jam=traffic_jam,
                        platform=platform,
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
