"""DataUpdateCoordinator for Wiener Linien Austria."""

from __future__ import annotations

import asyncio
import logging
import math
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    LINE_TYPE_S_BAHN,
    MAX_POLL_SECONDS,
    MAX_STOPS_AHEAD,
    MIN_POLL_SECONDS,
    STALE_DEPARTURE_MAX_AGE,
)
from .parsing import as_int
from .s_bahn_network import current_lines_at_diva as current_s_bahn_lines
from .s_bahn_network import merge_transfer_lines
from .static import (
    CATALOGUE_LOAD_ERRORS,
    StaticCatalogue,
    async_get_catalogue,
    canonical_line_key,
    current_catalogue,
    is_s_bahn_label,
    stops_ahead_for_match,
)
from .timetable import PlannedDeparture, TimetableBoard

if TYPE_CHECKING:
    from .batch import BatchResult, MonitorBatchGroup

_LOGGER = logging.getLogger(__name__)


# Public type alias — threaded through every signature that reads
# `entry.runtime_data` (Platinum `runtime-data` + `strict-typing` rules).
# Signatures that only use the entry for construction or for IDs/title
# keep plain `ConfigEntry`. Declared here rather than below the class
# because PEP 695 `type` evaluates its RHS lazily, so the forward
# reference resolves at use-time.
type WienerLinienConfigEntry = ConfigEntry[WienerLinienAustriaCoordinator]


@dataclass(slots=True)
class Departure:
    """One departure row from the monitor endpoint."""

    line: str
    towards: str
    direction: str  # "H" | "R"
    type: str  # ptMetro | ptTram | ptBusCity | ptBusNight | ptTrainS | …
    countdown: int
    time_planned: str | None
    time_real: str | None
    realtime: bool
    barrier_free: bool
    traffic_jam: bool
    platform: str | None = None  # "1" / "2" / "A" / "B" — Gleis as published
    # Air conditioning, per VEHICLE rather than per line: the monitor
    # endpoint only carries `cooling` inside `departure.vehicle`, which the
    # API docs (V1.5, 21.05.2026) mark optional and populate "nur wenn
    # abweichend von der Linie". A missing key therefore means "not
    # reported", not "not cooled" — we render only the positive case, so
    # collapsing both to False costs nothing.
    cooling: bool = False
    # Ordered list of upcoming stops on the trip the vehicle is running.
    # None when the static trip-pattern index hasn't loaded or no pattern
    # matches the row (replacement service, short-turn variant, etc.). The
    # card treats None and missing-key as identical: render no chevron.
    stops_ahead: list[dict[str, Any]] | None = None
    # A planned S-Bahn row from the timetable (timetable.py), not a live
    # `/monitor` row. The cards mark these so a planned time isn't read as
    # a live one.
    timetable: bool = False

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
            "cooling": self.cooling,
        }
        if self.stops_ahead is not None:
            out["stops_ahead"] = self.stops_ahead
        if self.timetable:
            out["timetable"] = True
        return out


@dataclass(slots=True)
class MonitorData:
    """Coordinator payload: sorted departures + the latest server timestamp."""

    departures: list[Departure]
    server_time: str | None
    # How many records this poll dropped as stale upstream data, and the
    # newest `timePlanned` among them — i.e. roughly when the feed froze.
    # Both are surfaced in sensor attributes so the cards can say why a
    # stop is empty instead of mislabelling a frozen feed "Betriebsschluss".
    stale_dropped: int = 0
    stale_since: str | None = None


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
            rbl for rbl in (as_int(x) for x in raw_rbls) if rbl is not None
        ]
        if not self._rbls:
            raise ConfigEntryError(
                translation_domain=DOMAIN,
                translation_key="invalid_rbls",
                translation_placeholders={"received": repr(raw_rbls)},
            )
        self._selected_lines: set[str] | None = _normalise_lines(config.get(CONF_LINES))
        # The S-Bahn lines picked for this stop, as (line, direction). Empty
        # for most stops, which then never ask the timetable for anything.
        self._timetable_pairs: frozenset[tuple[str, str]] = frozenset(
            (parts[0], parts[1])
            for key in self._selected_lines or ()
            if len(parts := key.split("|", 2)) >= 2 and is_s_bahn_label(parts[0])
        )
        self._rate_limited: bool = False
        self._last_error_code: int | None = None
        self._server_time: str | None = None
        # Memoised `extra_state_attributes` payload — HA calls that
        # property on every state read AND every attribute read, so a
        # busy dashboard can hammer it 10+ Hz. The build path queries
        # hass.data (alerts, line colours, catalogue) and re-parses
        # CONF_LINES every time; caching collapses that to once per
        # coordinator tick OR alerts refresh. Invalidated by:
        #   • `_invalidate_attrs_cache`, called before every data or error
        #     push (`_async_update_data`, `batch_apply`, `batch_set_error`
        #     and the timetable refresh), and
        #   • `cached_attrs` seeing `ALERTS_SEQ_KEY` advance past
        #     `_attrs_cache_alerts_seq`.
        # Read and written through `cached_attrs` / `store_attrs` — see
        # those for why the pair is not two plain public attributes.
        self._attrs_cache: dict[str, Any] | None = None
        self._attrs_cache_alerts_seq: int | None = None
        diva_int = as_int(config.get(CONF_DIVA))
        if diva_int is None:
            raise ConfigEntryError(
                translation_domain=DOMAIN,
                translation_key="invalid_diva",
                translation_placeholders={"received": repr(config.get(CONF_DIVA))},
            )
        self._diva: int = diva_int
        self._timetable: TimetableBoard | None = (
            TimetableBoard(hass, diva_int, self._timetable_pairs)
            if self._timetable_pairs
            else None
        )
        # The last `/monitor` slice before the timetable rows were merged in,
        # so a timetable refresh landing between ticks can re-merge.
        self._last_monitor: MonitorData | None = None
        self._latitude: float | None = None
        self._longitude: float | None = None
        # De-dupe stops_ahead matcher exceptions per line label so a
        # genuine schema change surfaces once at WARNING (loud enough to
        # be noticed) without spamming the logbook every poll.
        self._stops_ahead_warned_lines: set[str] = set()
        # Latch for the stale-feed warning; see _note_stale_departures.
        self._stale_warned: bool = False
        # Clamped here as well as in the forms: an entry edited by hand in
        # `.storage` never passes the selector, and the batch group polls at
        # whatever this says.
        scan_secs = as_int(config.get(CONF_SCAN_INTERVAL)) or DEFAULT_SCAN_INTERVAL
        scan_secs = min(max(scan_secs, MIN_POLL_SECONDS), MAX_POLL_SECONDS)
        self._scan_interval = timedelta(seconds=scan_secs)
        # The shared batch group that owns this entry's fetching. Assigned by
        # `attach_batch` during entry setup, before the first refresh.
        self._batch: MonitorBatchGroup | None = None
        self._timetable_task: asyncio.Task[None] | None = None

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
        except CATALOGUE_LOAD_ERRORS as err:
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
    def server_time_parsed(self) -> datetime | None:
        """Return `server_time` as an aware datetime, or None if unusable.

        Exists so `binary_sensor.py` can age the payload without importing
        `_parse_iso` across a module boundary. Always aware — see
        `_parse_iso` for why a naive upstream value gets HA's configured
        zone rather than UTC.
        """
        return _parse_iso(self._server_time)

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
    def timetable(self) -> TimetableBoard | None:
        """This stop's S-Bahn timetable, or None when no S-Bahn line is picked."""
        return self._timetable

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
        catalogue = current_catalogue(self.hass)
        data = _parse_monitor_body(
            result.body,
            self._selected_lines,
            result.server_time,
            catalogue=catalogue,
            entry_rbls=self._rbls,
            warned_lines=self._stops_ahead_warned_lines,
            s_bahn_lines_at_diva=current_s_bahn_lines(self.hass),
        )
        self._note_stale_departures(data)
        self._last_monitor = data
        self._schedule_timetable_refresh()
        return self._with_timetable(data)

    def _with_timetable(self, data: MonitorData) -> MonitorData:
        """Merge the picked S-Bahn lines' planned departures into a slice."""
        if self._timetable is None:
            return data
        planned = timetable_departures(
            self._timetable.departures,
            self._timetable_pairs,
            dt_util.utcnow(),
            catalogue=current_catalogue(self.hass),
            s_bahn_lines_at_diva=current_s_bahn_lines(self.hass),
        )
        if not planned:
            return data
        merged = [*data.departures, *planned]
        merged.sort(key=_departure_sort_key)
        return replace(data, departures=merged)

    def _schedule_timetable_refresh(self) -> None:
        """Start a timetable refresh in the background when one is due.

        Background, because `batch_apply` is synchronous and a slow routing
        server must not hold up the live rows. The refresh pushes its own
        update when it lands.
        """
        board = self._timetable
        if board is None or not board.is_due(dt_util.utcnow()):
            return
        if self._timetable_task is not None and not self._timetable_task.done():
            return
        self._timetable_task = self._entry.async_create_background_task(
            self.hass,
            self._async_refresh_timetable(board),
            name=f"{DOMAIN} timetable {self._diva}",
        )

    async def _async_refresh_timetable(self, board: TimetableBoard) -> None:
        """Refetch the timetable and re-publish the last slice with it."""
        if not await board.async_refresh() or self._last_monitor is None:
            return
        # A `/monitor` failure may have landed while the refresh was waiting
        # (it queues behind the routing cooldown). Republishing the last good
        # slice now would mark the coordinator successful and hide the
        # outage; the next good tick merges the new timetable anyway.
        if not self.last_update_success:
            return
        self._invalidate_attrs_cache()
        self.async_set_updated_data(self._with_timetable(self._last_monitor))

    def _note_stale_departures(self, data: MonitorData) -> None:
        """Log an upstream freeze once per episode, not once per poll.

        A frozen feed persists for days (the 2026-08-27 ptMetro outage ran
        60+ hours), so an unconditional warning here would emit thousands
        of identical lines. Latch on the first tick that drops records and
        clear it once the feed recovers, so a *later* freeze warns again.
        """
        if data.stale_dropped == 0:
            if self._stale_warned:
                _LOGGER.info(
                    "Upstream departure data is current again for RBLs %s",
                    self._rbls,
                )
                self._stale_warned = False
            return
        if self._stale_warned:
            return
        self._stale_warned = True
        _LOGGER.warning(
            "Dropped %d stale departure(s) for RBLs %s: upstream stopped "
            "advancing them (newest planned time %s, server time %s). "
            "Further occurrences stay silent until the feed recovers.",
            data.stale_dropped,
            self._rbls,
            data.stale_since,
            data.server_time,
        )

    def cached_attrs(self, alerts_seq: int) -> dict[str, Any] | None:
        """Return the memoised attrs payload, or None if it needs rebuilding.

        The cache is valid only while BOTH halves of its key still hold:
        the coordinator hasn't ticked (which nulls the payload) and the
        domain-wide alerts sequence hasn't advanced. Handing callers the
        pair as two public attributes invited each of them to
        re-implement that conjunction; this method is the only place it
        is written down.

        Returns the SAME dict object, not a copy. `extra_state_attributes`
        is a 10 Hz read path on a busy dashboard and the payload is ~27 KB
        at a hub stop, so a defensive copy here would cost more than the
        memoisation saves. The contract is therefore that callers treat
        the result as read-only; the one writer goes through
        `store_attrs`.
        """
        if self._attrs_cache is not None and self._attrs_cache_alerts_seq == alerts_seq:
            return self._attrs_cache
        return None

    def store_attrs(self, attrs: dict[str, Any], alerts_seq: int) -> None:
        """Memoise a freshly built attrs payload against the alerts sequence."""
        self._attrs_cache = attrs
        self._attrs_cache_alerts_seq = alerts_seq

    def _invalidate_attrs_cache(self) -> None:
        """Drop the memoised extra_state_attributes payload before a state change."""
        self._attrs_cache = None
        self._attrs_cache_alerts_seq = None


def _normalise_lines(raw: Any) -> set[str] | None:
    """Coerce CONF_LINES into a set of selected line keys.

    An entry missing/empty CONF_LINES means "track every line at this stop".

    Keys are mapped through `canonical_line_key`, so a selection saved
    before the catalogue learned the realtime spelling ("LB|H") compares
    against the label the feed actually sends ("WLB|H"). Matching the same
    way the sensor and the reconfigure form already read these keys keeps
    one vocabulary across the entry (issue #110).
    """
    if raw is None:
        return None
    if not isinstance(raw, list):
        return None
    return {canonical_line_key(str(x)) for x in raw} or None


def _row_is_selected(
    selected_pairs: set[tuple[str, str]],
    line_name: str,
    direction: str,
    line_id: int | None,
    catalogue: StaticCatalogue | None,
) -> bool:
    """Does this live monitor row fall inside the user's line selection?

    A row matches on either:

      * its own `line.name` from the feed, or
      * the catalogue's label for its `line.lineId`.

    `_normalise_lines` has already folded the saved keys onto the realtime
    spelling for the divergences we know about, so the first arm carries
    the normal case. The second is for the ones we don't: a label the feed
    and the catalogue disagree on that is *not* in `REALTIME_LINE_LABELS`
    (the night Rufbus lines, which no daytime probe can observe), and the
    window after an upgrade where the cached catalogue still holds the
    pre-alias labels. Both are joins on an identifier both sides publish
    rather than a guess about spelling.
    """
    if (line_name, direction) in selected_pairs:
        return True
    if line_id is None or catalogue is None or catalogue.trip_patterns is None:
        return False
    catalogue_label = catalogue.trip_patterns.label_for_line.get(line_id)
    if catalogue_label is None or catalogue_label == line_name:
        return False
    return (catalogue_label, direction) in selected_pairs


def _parse_monitor_body(
    body: dict[str, Any],
    selected: set[str] | None,
    server_time: str | None,
    *,
    catalogue: StaticCatalogue | None = None,
    entry_rbls: list[int] | None = None,
    warned_lines: set[str] | None = None,
    s_bahn_lines_at_diva: Mapping[int, Sequence[str]] | None = None,
) -> MonitorData:
    """Parse a successful /monitor response into a MonitorData.

    `catalogue` and `entry_rbls`, when provided, drive the per-row
    `stops_ahead` enrichment via `static.stops_ahead_for_match`. Both are
    optional: tests construct MonitorData directly and this parser is
    re-used in fixtures that don't carry the static layer.

    `warned_lines`, when supplied, is a per-coordinator de-dupe set so
    a stops_ahead matcher exception logs once at WARNING per line label
    rather than spamming on every poll.

    `s_bahn_lines_at_diva` adds the S-Bahn to the trails' transfer lines.
    """
    departures: list[Departure] = []
    stale_dropped = 0
    stale_since: datetime | None = None
    # Plausibility floor for `timePlanned`. Anchored on the payload's own
    # `serverTime` rather than the local clock: the upstream timestamp is
    # what the records are consistent with, so a skewed HA clock can't
    # start hiding real departures. Falls back to our clock only when the
    # response carried no usable serverTime.
    #
    # No naive/aware guard on the comparisons below: `_parse_iso` stamps a
    # zone on anything the feed sends without one, and `dt_util.utcnow()` is
    # aware, so both sides of `planned_at < stale_cutoff` are aware by
    # construction. That invariant lives in `_parse_iso` — keep it there
    # rather than re-guarding every comparison site.
    reference_time = _parse_iso(server_time) or dt_util.utcnow()
    stale_cutoff = reference_time - STALE_DEPARTURE_MAX_AGE
    monitors = (body.get("data") or {}).get("monitors") or []
    # Narrow `catalogue` once for the loop below: enrichment needs both
    # "not None" and "has a trip-pattern index", and folding the pair into
    # one alias keeps that test out of the per-row hot path.
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
    # match `(line_name, direction)` anyway.
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
    # include-all.
    rbl_filter: set[int] | None = set(entry_rbls) if entry_rbls else None

    for monitor in monitors:
        if rbl_filter is not None:
            monitor_rbl = as_int(
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
            # `line.lineId` is the same identifier `linien.csv` publishes
            # as `LineID`, so it joins a live row to the catalogue without
            # going through the label — which the two sources do not
            # always spell the same way (issue #110: the Badner Bahn is
            # "WLB" live and "LB" in the CSV).
            line_id = as_int(line.get("lineId"))
            line_towards = str(line.get("towards") or "").strip()
            direction = str(line.get("direction") or "").strip()
            line_type = str(line.get("type") or "").strip()
            barrier_free = bool(line.get("barrierFree"))
            realtime = bool(line.get("realtimeSupported"))
            traffic_jam = bool(line.get("trafficjam"))
            platform = str(line.get("platform") or "").strip() or None

            if selected_pairs is not None and not _row_is_selected(
                selected_pairs,
                line_name,
                direction,
                line_id,
                pattern_catalogue,
            ):
                continue

            for entry in (line.get("departures") or {}).get("departure") or []:
                dep_time = entry.get("departureTime") or {}
                countdown = as_int(dep_time.get("countdown"))
                if countdown is None:
                    continue
                # Drop records the upstream feed has stopped advancing.
                # Checked before the stops_ahead enrichment below so a
                # frozen feed costs no matcher work. A row whose
                # `timePlanned` is missing or unparseable is kept — we
                # only drop what we can prove is stale.
                planned_at = _parse_iso(dep_time.get("timePlanned"))
                if planned_at is not None and planned_at < stale_cutoff:
                    stale_dropped += 1
                    if stale_since is None or planned_at > stale_since:
                        stale_since = planned_at
                    continue
                vehicle = entry.get("vehicle") or {}
                cooling = bool(vehicle.get("cooling"))
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
                            line_id=line_id,
                            s_bahn_lines_at_diva=s_bahn_lines_at_diva,
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
                        cooling=cooling,
                        stops_ahead=stops_ahead,
                    )
                )

    departures.sort(key=_departure_sort_key)
    return MonitorData(
        departures=departures,
        server_time=server_time,
        stale_dropped=stale_dropped,
        stale_since=stale_since.isoformat() if stale_since is not None else None,
    )


def timetable_departures(
    planned: tuple[PlannedDeparture, ...],
    pairs: frozenset[tuple[str, str]],
    now: datetime,
    *,
    catalogue: StaticCatalogue | None = None,
    s_bahn_lines_at_diva: Mapping[int, Sequence[str]] | None = None,
) -> list[Departure]:
    """Board rows for the picked S-Bahn lines that haven't left yet.

    A train drops off the moment its planned time has passed: there is no
    live time to say it's still at the platform. The countdown is whole
    minutes rounded down, as `/monitor` counts, so a train due within the
    minute reads 0.

    `barrier_free` stays False because the timetable doesn't say. The
    cards only render the positive case, so that shows nothing rather
    than a false "not step-free".

    `stops_ahead` comes from the timetable's own stop sequence rather than
    the Wiener Linien trip patterns, which don't know the S-Bahn. Same
    shape as `/monitor` rows get; `catalogue` adds the Wiener Linien lines
    at each stop as transfers, and `s_bahn_lines_at_diva` the other S-Bahn
    lines.
    """
    rows: list[Departure] = []
    for dep in planned:
        if (dep.line, dep.direction) not in pairs:
            continue
        seconds = (dep.planned - now).total_seconds()
        if seconds < 0:
            continue
        rows.append(
            Departure(
                line=dep.line,
                towards=dep.towards,
                direction=dep.direction,
                type=LINE_TYPE_S_BAHN,
                countdown=math.floor(seconds / 60),
                time_planned=dep.planned.isoformat(),
                time_real=None,
                realtime=False,
                barrier_free=False,
                traffic_jam=False,
                platform=dep.platform,
                stops_ahead=_timetable_stops_ahead(
                    dep, catalogue, s_bahn_lines_at_diva
                ),
                timetable=True,
            )
        )
    return rows


def _timetable_stops_ahead(
    dep: PlannedDeparture,
    catalogue: StaticCatalogue | None,
    s_bahn_lines_at_diva: Mapping[int, Sequence[str]] | None = None,
) -> list[dict[str, Any]] | None:
    """A planned train's onward stops as a `stops_ahead` list.

    None without a stop sequence, so the row shows no chevron. Capped at
    `MAX_STOPS_AHEAD` like the `/monitor` trail. The last stop is flagged
    as the terminus only when it is the train's destination: a capped list
    isn't, and neither is a sequence the server ends early (seen
    2026-09-15: an S2 towards Wolfsthal listing only Hauptbahnhof, where
    the run continues under another number). Transfer lines are the Wiener
    Linien lines at the stop's DIVA plus the other S-Bahn lines there, the
    train's own line left out.
    """
    if not dep.stops:
        return None
    lines_at_diva = (
        catalogue.trip_patterns.lines_at_diva
        if catalogue is not None and catalogue.trip_patterns is not None
        else {}
    )
    out: list[dict[str, Any]] = []
    last = len(dep.stops) - 1
    for index, stop in enumerate(dep.stops[:MAX_STOPS_AHEAD]):
        entry: dict[str, Any] = {"name": stop.name}
        if index == last and _same_stop_name(stop.name, dep.towards):
            entry["is_terminus"] = True
        if stop.stop_id is not None:
            lines = merge_transfer_lines(
                lines_at_diva.get(stop.stop_id, ()),
                (s_bahn_lines_at_diva or {}).get(stop.stop_id, ()),
                exclude=dep.line,
            )
            if lines:
                entry["lines"] = lines
        out.append(entry)
    return out


def _same_stop_name(stop_name: str, towards: str) -> bool:
    """Whether a stop is the terminus a train is signed for.

    The stop sequence can qualify a name the direction doesn't: an S1
    towards "Hauptbahnhof" lists its last stop as "Hauptbahnhof
    (S-Bahn-Station)" (seen 2026-09-15), so a trailing bracket is ignored.
    """
    base, bracket, _ = stop_name.partition(" (")
    return stop_name == towards or (bool(bracket) and base == towards)


def _departure_sort_key(dep: Departure) -> tuple[int, str, str]:
    return (dep.countdown, dep.line, dep.towards)


def _parse_iso(value: Any) -> datetime | None:
    """Best-effort ISO-8601 parse of an upstream timestamp, always tz-aware.

    The /monitor feed emits `2026-08-27T06:55:30.000+0200`, which
    `datetime.fromisoformat` handles natively on every Python this
    integration supports. Returns None on anything else so callers can
    fail open rather than act on a timestamp they couldn't read.

    A parsed value with no UTC offset is stamped with HA's configured
    time zone, NOT with UTC. Both matter:

    * Returning it naive is what makes `planned_at < stale_cutoff` in
      `_parse_monitor_body` a `TypeError`, because the cutoff is derived
      from `dt_util.utcnow()` whenever `serverTime` itself is missing or
      unparseable — so one naive field is enough to reach it, not two.
      On the batch timer path that raise is caught per member; on
      `async_config_entry_first_refresh` it becomes a
      `ConfigEntryNotReady` that retries forever.
    * Forcing UTC instead would silently shift a naive Vienna timestamp
      by one or two hours. Against a `STALE_DEPARTURE_MAX_AGE` cutoff a
      shift that size starts dropping real departures, which is a worse
      failure than the crash it fixes. Every sample the feed has ever
      sent carries `+0100`/`+0200`, so the only sane reading of a naive
      value is local wall-clock.

    `dt_util.get_default_time_zone()` is HA's configured zone rather
    than a hardcoded Europe/Vienna: an install whose clock is set
    somewhere else is already interpreting every other naive timestamp
    that way, and disagreeing with the rest of HA would be its own bug.
    """
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=dt_util.get_default_time_zone())
    return parsed
