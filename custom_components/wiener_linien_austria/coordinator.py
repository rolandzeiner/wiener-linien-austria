"""DataUpdateCoordinator for Wiener Linien Austria."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import timedelta
from typing import TYPE_CHECKING, Any

import aiohttp
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
)

# Eager import — `stops_ahead_for_match` runs in the /monitor parser's
# hot loop, so the other names from `static` are already in sys.modules
# anyway. No import-time saving from lazy imports here.
from .static import (
    CATALOGUE_KEY,
    StaticCatalogue,
    async_get_catalogue,
    stops_ahead_for_match,
)

if TYPE_CHECKING:
    from .batch import BatchResult, MonitorBatchGroup

_LOGGER = logging.getLogger(__name__)


# Public type alias — threaded through every signature that reads
# `entry.runtime_data` (Platinum `runtime-data` + `strict-typing` rules).
# Signatures that only use the entry for construction (coordinator
# `__init__`) or for IDs/title (sensor `__init__`, options-flow
# staticmethod) keep plain `ConfigEntry`. Hoisted to the top of the
# module so external readers see the public-API shape before the
# implementation; PEP 695 `type` evaluates the RHS lazily, so the
# forward reference to `WienerLinienAustriaCoordinator` resolves at
# use-time, not definition-time.
type WienerLinienConfigEntry = ConfigEntry[WienerLinienAustriaCoordinator]


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
        # Filter non-int RBLs before the empty-check below so corrupt
        # entries (hand-edited storage, fork migration) hit
        # ConfigEntryError with an actionable message rather than a
        # generic KeyError / ValueError from __init__.
        raw_rbls = config.get(CONF_RBLS) or []
        self._rbls: list[int] = [
            rbl for rbl in (_safe_int(x) for x in raw_rbls) if rbl is not None
        ]
        if not self._rbls:
            raise ConfigEntryError(
                f"Entry has no valid integer RBLs (received {raw_rbls!r})"
            )
        self._selected_lines: set[str] | None = _normalise_lines(config.get(CONF_LINES))
        self._rate_limited: bool = False
        self._last_error_code: int | None = None
        self._server_time: str | None = None
        # Memoised `extra_state_attributes` payload — HA calls that
        # property on every state read AND every attribute read, so a
        # busy dashboard can hammer it 10+ Hz. The build path queries
        # hass.data (alerts, line colours, catalogue) and re-parses
        # CONF_LINES every time; caching collapses that to once per
        # coordinator tick OR alerts refresh. Invalidated by:
        #   • `_async_update_data` setting cache=None at the top, and
        #   • sensor.py noticing `ALERTS_SEQ_KEY` advanced past
        #     `_attrs_cache_alerts_seq`.
        self._attrs_cache: dict[str, Any] | None = None
        self._attrs_cache_alerts_seq: int | None = None
        diva_int = _safe_int(config.get(CONF_DIVA))
        if diva_int is None:
            raise ConfigEntryError(
                f"Entry has no valid DIVA (received {config.get(CONF_DIVA)!r})"
            )
        self._diva: int = diva_int
        self._latitude: float | None = None
        self._longitude: float | None = None
        # De-dupe stops_ahead matcher exceptions per line label so a
        # genuine schema change surfaces once at WARNING (loud enough to
        # be noticed) without spamming the logbook every poll.
        self._stops_ahead_warned_lines: set[str] = set()
        scan_secs = _safe_int(config.get(CONF_SCAN_INTERVAL)) or DEFAULT_SCAN_INTERVAL
        self._scan_interval = timedelta(seconds=scan_secs)
        # The shared batch group that owns this entry's fetching. Assigned by
        # `attach_batch` during entry setup, before the first refresh.
        self._batch: MonitorBatchGroup | None = None

        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            # No self-scheduled polling: the shared MonitorBatchGroup timer
            # (keyed on this entry's scan interval) drives every fetch and
            # pushes results via `batch_apply` → `async_set_updated_data`. A
            # non-None interval here would double-poll, because the sensor is
            # a CoordinatorEntity and therefore a listener that would arm the
            # coordinator's own timer.
            update_interval=None,
            # Absorb request storms (options-flow save, manual reload,
            # dashboard edit-mode flip) on the first-refresh / manual-refresh
            # path so /monitor isn't hit back-to-back. Cooldown matches the
            # 15s domain-wide floor. `immediate=False` makes the FIRST call
            # wait too — matters during config-flow setup where
            # test-before-configure and first-refresh land back-to-back.
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
            TimeoutError,
            aiohttp.ClientError,
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
    def entry_id(self) -> str:
        """The config entry id this coordinator serves (batch member key)."""
        return self._entry.entry_id

    @property
    def scan_interval(self) -> timedelta:
        """User-configured polling cadence; the batch group is keyed on this."""
        return self._scan_interval

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

    def note_rate_limited(self) -> None:
        """Raise a per-entry Repairs issue the first time we're rate-limited.

        Called by the shared batch group when the combined request comes back
        rate-limited — the issue stays per-entry so its title names this stop.
        """
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

    def note_not_rate_limited(self) -> None:
        """Clear this entry's rate-limit Repairs issue once the API recovers."""
        if not self._rate_limited:
            return
        self._rate_limited = False
        ir.async_delete_issue(self.hass, DOMAIN, f"rate_limited_{self._entry.entry_id}")

    # ------------------------------------------------------------------
    # Fetch (delegated to the shared MonitorBatchGroup)
    # ------------------------------------------------------------------

    async def _async_update_data(self) -> MonitorData:
        """Fetch via the shared batch group and return this entry's slice.

        Only the manual paths reach here: `async_config_entry_first_refresh()`
        at setup and any explicit `async_request_refresh()`. Steady-state
        ticks arrive through `batch_apply` instead — the group timer fans one
        combined response out to every member, bypassing this method.
        """
        # Drop the attrs cache before the fetch, not after — failures also
        # produce a state change (CoordinatorEntity flips to unavailable per
        # its own logic), and a stale cached attrs dict would survive that.
        self._invalidate_attrs_cache()
        if self._batch is None:
            # Unreachable in normal operation: setup attaches the group before
            # the first refresh. Guard so a misuse fails loudly-but-cleanly.
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="api_invalid_response",
                translation_placeholders={
                    "status": "0",
                    "error": "batch group not attached",
                },
            )
        result = await self._batch.async_fetch()
        return self._parse_slice(result)

    def attach_batch(self, group: MonitorBatchGroup) -> None:
        """Bind the shared batch group that owns this entry's fetching."""
        self._batch = group

    def batch_apply(self, result: BatchResult) -> None:
        """Apply a fanned-out batch result: parse this entry's slice and push.

        Called by the group timer (not via `_async_update_data`), so it drives
        the entity update directly through `async_set_updated_data`.
        """
        self._invalidate_attrs_cache()
        self.async_set_updated_data(self._parse_slice(result))

    def batch_set_error(self, err: UpdateFailed) -> None:
        """Propagate a batch fetch failure to this entry's coordinator state."""
        self._invalidate_attrs_cache()
        self.async_set_update_error(err)

    def apply_upstream_meta(self, server_time: str | None, code: int | None) -> None:
        """Record the latest server time and API message code from a fetch.

        Called by the batch group for every member on each fetch — including
        error ticks — so diagnostics reflect the last observed upstream state.
        """
        self._server_time = server_time
        self._last_error_code = code

    def _parse_slice(self, result: BatchResult) -> MonitorData:
        """Parse this entry's departures out of a shared combined response.

        Reads the live catalogue ref so a background trip-pattern refresh that
        lands after setup is picked up on the next parse — no restart needed.
        """
        catalogue = self._current_catalogue()
        return _parse_monitor_body(
            result.body,
            self._selected_lines,
            result.server_time,
            catalogue=catalogue,
            entry_rbls=self._rbls,
            warned_lines=self._stops_ahead_warned_lines,
        )

    def _invalidate_attrs_cache(self) -> None:
        """Drop the memoised extra_state_attributes payload before a state change."""
        self._attrs_cache = None
        self._attrs_cache_alerts_seq = None

    def _current_catalogue(self) -> StaticCatalogue | None:
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
    catalogue: StaticCatalogue | None = None,
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
    # Narrow `catalogue` once for the loop below — mypy carries the
    # narrowing across the closure boundary if we hand it through a
    # local alias that's either the catalogue or None.
    pattern_catalogue: StaticCatalogue | None = (
        catalogue
        if catalogue is not None and catalogue.trip_patterns is not None
        else None
    )

    # Match the user's selection on (line, direction) only — `line.towards`
    # is unstable for branching termini (e.g. U1/R reports "Oberlaa" or
    # "Alaudagasse" depending on which vehicle is next), so a strict triple
    # match would intermittently drop the whole line block. Each departure
    # keeps its own `vehicle.towards` so the actual destination is preserved.
    # Malformed keys (no pipe) are dropped silently — they could never
    # match `(line_name, direction)` anyway. The walrus binds the split
    # once per key so the comp can both length-check and index it.
    selected_pairs: set[tuple[str, str]] | None = (
        None
        if selected is None
        else {
            (parts[0], parts[1]) for k in selected if len(parts := k.split("|", 2)) >= 2
        }
    )

    # Restrict to this entry's own stops. A shared batch /monitor response
    # carries the monitors of EVERY member entry (one combined request), so
    # each member must keep only the monitors at its own RBLs — identified by
    # `locationStop.properties.attributes.rbl`. Applied only when `entry_rbls`
    # is given AND the monitor actually carries an rbl: a monitor with no rbl
    # (older payloads, hand-built test fixtures) falls through to
    # include-all, matching the pre-batch single-request behaviour where the
    # request already scoped the response.
    rbl_filter: set[int] | None = set(entry_rbls) if entry_rbls else None

    for monitor in monitors:
        if rbl_filter is not None:
            monitor_rbl = _safe_int(
                (monitor.get("locationStop") or {})
                .get("properties", {})
                .get("attributes", {})
                .get("rbl")
            )
            if monitor_rbl is not None and monitor_rbl not in rbl_filter:
                continue
        for line in monitor.get("lines") or []:
            line_name = str(line.get("name") or "").strip()
            if not line_name:
                continue
            line_towards = str(line.get("towards") or "").strip()
            direction = str(line.get("direction") or "").strip()
            line_type = str(line.get("type") or "").strip()
            barrier_free = bool(line.get("barrierFree"))
            realtime = bool(line.get("realtimeSupported"))
            traffic_jam = bool(line.get("trafficjam"))
            platform = str(line.get("platform") or "").strip() or None

            if (
                selected_pairs is not None
                and (line_name, direction) not in selected_pairs
            ):
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
                if pattern_catalogue is not None and entry_rbls:
                    try:
                        stops_ahead = stops_ahead_for_match(
                            pattern_catalogue,
                            line_name,
                            entry_rbls,
                            resolved_towards,
                            live_direction=direction,
                        )
                    except Exception:
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
