"""DataUpdateCoordinator for A→B route entries."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta, tzinfo
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    BACKOFF_CAP_SECONDS,
    CONF_ACTIVE_DAYS,
    CONF_ACTIVE_FROM,
    CONF_ACTIVE_TO,
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_EXCLUDED_MEANS,
    CONF_MAX_CHANGES,
    CONF_MIN_TRANSFER_MINUTES,
    CONF_ORIGIN_DIVA,
    CONF_ORIGIN_NAME,
    CONF_ROUTE_TYPE,
    CONF_WALK_SPEED,
    DEFAULT_MIN_TRANSFER_MINUTES,
    DEFAULT_ROUTE_SCAN_INTERVAL,
    DEFAULT_ROUTE_TYPE,
    DEFAULT_WALK_SPEED,
    DOMAIN,
    EXCLUDABLE_MEANS,
    MAX_CHANGES_ANY,
    MIN_ROUTE_ROLLOVER_SECONDS,
    ROUTING_TIME_ZONE,
    USER_AGENT,
)
from .rate_limit import async_enforce_routing_cooldown
from .routing import (
    RouteOptions,
    RoutingError,
    Trip,
    async_fetch_trip_body,
    build_trip_params,
    parse_time_option,
    parse_trip_body,
    rank_trips,
    within_window,
)

_LOGGER = logging.getLogger(__name__)

# How many ranked connections a route publishes. The card shows the best one
# expanded plus a few alternatives; more than this is payload nothing renders.
MAX_TRIPS_PUBLISHED = 4

type WienerLinienRouteConfigEntry = ConfigEntry[WienerLinienRouteCoordinator]


@dataclass(slots=True)
class RouteData:
    """Coordinator payload for a route entry."""

    trips: list[Trip] = field(default_factory=list)
    # False outside the configured time window: nothing was fetched, and
    # the empty trip list means "not looking", not "no connection".
    active: bool = True
    fetched_at: datetime | None = None


class WienerLinienRouteCoordinator(DataUpdateCoordinator[RouteData]):
    """Plan connections for one origin → destination pair."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Read the route options off the entry."""
        config = {**entry.data, **entry.options}
        origin = _safe_int(config.get(CONF_ORIGIN_DIVA))
        destination = _safe_int(config.get(CONF_DESTINATION_DIVA))
        for value, raw in (
            (origin, config.get(CONF_ORIGIN_DIVA)),
            (destination, config.get(CONF_DESTINATION_DIVA)),
        ):
            if value is None:
                raise ConfigEntryError(
                    translation_domain=DOMAIN,
                    translation_key="invalid_diva",
                    translation_placeholders={"received": repr(raw)},
                )
        assert origin is not None
        assert destination is not None
        self.origin_name = str(config.get(CONF_ORIGIN_NAME) or origin)
        self.destination_name = str(config.get(CONF_DESTINATION_NAME) or destination)
        self.options = RouteOptions(
            origin_diva=origin,
            destination_diva=destination,
            route_type=str(config.get(CONF_ROUTE_TYPE) or DEFAULT_ROUTE_TYPE),
            max_changes=str(config.get(CONF_MAX_CHANGES) or MAX_CHANGES_ANY),
            walk_speed=str(config.get(CONF_WALK_SPEED) or DEFAULT_WALK_SPEED),
            excluded_means=tuple(
                EXCLUDABLE_MEANS[name]
                for name in config.get(CONF_EXCLUDED_MEANS) or ()
                if name in EXCLUDABLE_MEANS
            ),
            min_transfer_minutes=_int_or(
                config.get(CONF_MIN_TRANSFER_MINUTES), DEFAULT_MIN_TRANSFER_MINUTES
            ),
        )
        self._active_from = parse_time_option(config.get(CONF_ACTIVE_FROM))
        self._active_to = parse_time_option(config.get(CONF_ACTIVE_TO))
        days = config.get(CONF_ACTIVE_DAYS)
        self._active_days: list[str] | None = (
            [str(d) for d in days] if isinstance(days, list) and days else None
        )
        seconds = (
            _safe_int(config.get(CONF_SCAN_INTERVAL)) or DEFAULT_ROUTE_SCAN_INTERVAL
        )
        self.scan_interval = timedelta(seconds=seconds)
        self._failures = 0
        self._tz: tzinfo = dt_util.UTC
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_route",
            update_interval=self.scan_interval,
        )

    async def _async_setup(self) -> None:
        """Resolve the timetable zone without blocking the event loop."""
        zone = await dt_util.async_get_time_zone(ROUTING_TIME_ZONE)
        if zone is not None:
            self._tz = zone

    @property
    def active_window(self) -> dict[str, object]:
        """The configured window, for attributes and diagnostics."""
        return {
            "from": self._active_from.isoformat() if self._active_from else None,
            "to": self._active_to.isoformat() if self._active_to else None,
            "days": list(self._active_days) if self._active_days else None,
        }

    def is_active(self, now: datetime | None = None) -> bool:
        """Whether the route should be refreshing right now."""
        local = (now or dt_util.utcnow()).astimezone(self._tz)
        return within_window(
            local, self._active_from, self._active_to, self._active_days
        )

    async def _async_update_data(self) -> RouteData:
        """Fetch and rank connections, or idle outside the window."""
        now = dt_util.utcnow().astimezone(self._tz)
        if not self.is_active(now):
            self._failures = 0
            self.update_interval = self.scan_interval
            return RouteData(trips=[], active=False, fetched_at=None)

        await async_enforce_routing_cooldown(self.hass)
        try:
            trips = await self.async_plan(now)
        except RoutingError as err:
            if err.translation_key == "route_no_connection":
                # Late at night a route can genuinely have nothing left.
                # That is an answer, not an outage.
                self._note_success([])
                return RouteData(trips=[], active=True, fetched_at=dt_util.utcnow())
            self._note_failure()
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key=err.translation_key,
                translation_placeholders=err.placeholders,
            ) from err

        published = trips[:MAX_TRIPS_PUBLISHED]
        self._note_success(published)
        return RouteData(trips=published, active=True, fetched_at=dt_util.utcnow())

    async def async_plan(
        self, when: datetime, *, arrive_by: bool = False
    ) -> list[Trip]:
        """Plan and rank connections at `when`. No cooldown, no state.

        Shared by the polling path and the `plan_trip` action. Connections
        that have already left in real time are dropped either way; for a
        query about later today or tomorrow that removes nothing.
        """
        return await async_plan_trips(
            self.hass, self.options, when, self._tz, arrive_by=arrive_by
        )

    def _note_success(self, trips: list[Trip]) -> None:
        """Reset backoff and pull the next refresh up to the next departure.

        The best connection leaving is the moment the published list goes
        out of date, so refresh shortly after it rather than waiting out
        the full interval — but never sooner than the rollover floor, so a
        connection leaving in ten seconds can't turn into a tight loop.
        """
        self._failures = 0
        interval = self.scan_interval
        departure = trips[0].departure if trips else None
        if departure is not None:
            until = (departure - dt_util.utcnow()).total_seconds() + 30
            rollover = timedelta(seconds=max(MIN_ROUTE_ROLLOVER_SECONDS, until))
            interval = min(interval, rollover)
        self.update_interval = interval

    def _note_failure(self) -> None:
        """Stretch the interval from the second consecutive failure on."""
        self._failures += 1
        if self._failures < 2:
            return
        stretched = self.scan_interval.total_seconds() * 2 ** (self._failures - 1)
        seconds = min(stretched, BACKOFF_CAP_SECONDS)
        if self.update_interval != timedelta(seconds=seconds):
            _LOGGER.info(
                "Route %s → %s failing %d times in a row; next try in %d s",
                self.origin_name,
                self.destination_name,
                self._failures,
                seconds,
            )
        self.update_interval = timedelta(seconds=seconds)


async def async_plan_trips(
    hass: HomeAssistant,
    options: RouteOptions,
    when: datetime,
    tz: tzinfo,
    *,
    arrive_by: bool = False,
) -> list[Trip]:
    """Fetch, parse and rank one trip request. No cooldown, no state.

    The one planning path shared by route entries, the `plan_trip` action
    and the route card's ad-hoc mode (adhoc.py), so all three see the same
    connections for the same query.
    """
    body = await async_fetch_trip_body(
        async_get_clientsession(hass),
        build_trip_params(
            options,
            when.astimezone(tz),
            arrive_by=arrive_by,
            language=hass.config.language,
        ),
        USER_AGENT,
    )
    trips = parse_trip_body(body, tz, min_transfer_minutes=options.min_transfer_minutes)
    return rank_trips(trips, dt_util.utcnow())


def route_device_info(entry: ConfigEntry) -> DeviceInfo:
    """Device shared by both route entities and set up front in __init__."""
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.title,
        manufacturer="Wiener Linien",
        model="Verbindung",
        configuration_url="https://www.wienerlinien.at/",
    )


def _int_or(value: Any, default: int) -> int:
    parsed = _safe_int(value)
    return default if parsed is None else parsed


def _safe_int(value: Any) -> int | None:
    """Best-effort integer coercion; returns None on failure."""
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
