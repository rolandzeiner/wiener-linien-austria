"""Sensor platform for Wiener Linien Austria."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .alerts import get_alerts_for, line_names_from_keys
from .const import (
    ALERTS_SEQ_KEY,
    ATTRIBUTION,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
    MAX_DEPARTURES_IN_ATTRS,
)
from .coordinator import (
    MonitorData,
    WienerLinienAustriaCoordinator,
    WienerLinienConfigEntry,
)
from .static import CATALOGUE_KEY, StaticCatalogue, canonical_line_key

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WienerLinienConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the single stop sensor for this entry."""
    coordinator = entry.runtime_data
    async_add_entities([WienerLinienStopSensor(coordinator, entry)])


class WienerLinienStopSensor(
    CoordinatorEntity[WienerLinienAustriaCoordinator], SensorEntity
):
    """One sensor per stop. State = countdown of the next overall departure.

    Attributes carry the full departure board, grouped views (per line), and
    the CC-BY attribution string.
    """

    _attr_has_entity_name = True
    _attr_translation_key = "stop"
    _attr_attribution = ATTRIBUTION
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES

    # Excluded from the recorder: combined size at busy stops (~26 KB) trips
    # the 16 KB attribute cap, so the recorder was already refusing to store
    # them. Frontend (card, templates, /api/states) still receives them in
    # real time — only history is skipped. Mirrors the pattern used by
    # weather.forecast and other high-frequency-attribute entities.
    _unrecorded_attributes = frozenset(
        {
            "departures",
            "line_colors",
            "traffic_info",
            "elevator_info",
            "next_by_line",
            # Static structural metadata — useful to the card live, but
            # never useful in history. On hub stops these are 30+ items
            # each and would write to the recorder on every state tick.
            "lines_at_stop",
            "tracked_lines",
            "tracked_line_keys",
        }
    )

    def __init__(
        self,
        coordinator: WienerLinienAustriaCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialise the sensor — unique_id format is frozen."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_stop"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Wiener Linien",
            model="Abfahrtsmonitor",
            configuration_url="https://www.wienerlinien.at/",
        )

    @property
    def native_value(self) -> int | None:
        """Return the countdown of the next overall departure, or None."""
        data = self.coordinator.data
        if data is None or not data.departures:
            return None
        return data.departures[0].countdown

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the departure board + grouped views + matched alerts."""
        # HA calls this property on every state read AND every attribute
        # read — a busy dashboard easily hits double-digit Hz. The cache
        # below collapses repeat builds to one per coordinator tick OR
        # alerts refresh; see WienerLinienAustriaCoordinator._attrs_cache
        # for invalidation rules.
        hass = self.hass if self.hass is not None else self.coordinator.hass
        domain_data = hass.data.get(DOMAIN, {})
        current_alerts_seq = int(domain_data.get(ALERTS_SEQ_KEY, 0))
        cached = self.coordinator.cached_attrs(current_alerts_seq)
        if cached is not None:
            return cached

        config = {**self._entry.data, **self._entry.options}
        diva = int(config[CONF_DIVA])
        stop_name = str(config.get(CONF_STOP_NAME, self._entry.title))

        data: MonitorData | None = self.coordinator.data
        departures = data.departures if data is not None else []

        # next_by_line is a tiny per-line → int map for cheap template access.
        # We deliberately don't publish a full `departures_by_line` grouping
        # because it would duplicate every departure dict under `departures`,
        # doubling attribute size and tripping the recorder's 16 KB limit at
        # busy stops. Consumers that need a grouped view can reduce over
        # `departures` themselves.
        next_by_line: dict[str, int] = {}
        for dep in departures:
            next_by_line.setdefault(dep.line, dep.countdown)

        # Match domain-wide alert caches against this entry's lines + RBLs.
        # Lines derived from CONF_LINES ("U1|H|Leopoldau") — the user's own
        # selection, stable even when no departures are flowing right now.
        # Fall back to live departures for the "all lines" case.
        selected_line_keys = config.get(CONF_LINES) or []
        line_names = line_names_from_keys(selected_line_keys)
        if not line_names:
            line_names = {d.line for d in departures if d.line}
        rbls = {int(r) for r in config.get(CONF_RBLS) or []}

        traffic, elevator = get_alerts_for(hass, line_names, rbls)

        # Cap the list at MAX_DEPARTURES_IN_ATTRS so busy multi-line stops
        # (e.g. Stephansplatz tracking U1/U3/U4 ≈ ~40 entries) don't pay to
        # publish rows nothing renders. NOT a recorder budget — `departures`
        # is in `_unrecorded_attributes` below; see MAX_DEPARTURES_IN_ATTRS in
        # const.py for what the cap actually bounds. The card respects its own
        # max_departures setting (≤ 20) so nothing the UI shows is lost.
        capped = [d.to_dict() for d in departures[:MAX_DEPARTURES_IN_ATTRS]]

        # Static-catalogue line list for THIS stop — every line that
        # serves the DIVA per the Wiener Linien schedule, regardless of
        # whether it has a departure inside the live `/monitor` window
        # right now. Falls back to the live-derived list when the
        # catalogue/trip-pattern index isn't loaded yet.
        lines_at_stop = self._lines_at_stop(diva)

        # GTFS-derived per-line palette, scoped to the lines this entity
        # can actually be asked to colour.
        #
        # It used to publish the whole Wiener Linien catalogue. Measured
        # 2026-09-09 against the live feed: 7,242 bytes for 179 lines with
        # bg+fg — ~26% of a 27.4 KB payload at a hub stop, and
        # byte-identical on every entry, so a five-stop install pushed
        # ~36 KB of the same palette on every state write. (An earlier
        # revision of this comment claimed "~3 KB"; it was never
        # re-measured after `text_colors_by_line` landed.)
        #
        # The union below is the contract, and every term is load-bearing
        # — a label the cards render but this set omits gets the neutral
        # fallback instead of its GTFS colour, which is silent and looks
        # like a design choice:
        #   * lines_at_stop  — departure chips, and the editor's colour
        #                      picker (collectLinesInSelection reads it)
        #   * live departures — belt-and-braces; normally a subset of the
        #                      above, but the live feed is not bound by
        #                      the weekly catalogue
        #   * stops_ahead lines — transfer chips for lines at OTHER stops,
        #                      which is why publishing unscoped was right
        #                      until the cards learned to merge palettes
        #   * traffic/elevator related_lines — notice badges, which name
        #                      lines that need not serve this stop at all
        #                      (plus a short notice's inferred_lines, the
        #                      badges it gets when it names none itself)
        #
        # Cross-entity reuse is the other half. The flap board and the
        # modern card's notice badges render lines from EVERY configured
        # stop off one palette; they now merge across entities
        # (`mergeLineColorsMaps`) rather than taking the first stop's map,
        # which only worked while every map was the identical catalogue.
        # Don't narrow this set without checking that helper's callers.
        needed_labels: set[str] = set(lines_at_stop)
        needed_labels.update(d.line for d in departures if d.line)
        for row in capped:
            for stop in row.get("stops_ahead") or []:
                needed_labels.update(stop.get("lines") or ())
        for traffic_alert in traffic:
            needed_labels.update(traffic_alert.related_lines)
            needed_labels.update(traffic_alert.inferred_lines)
        for elevator_alert in elevator:
            needed_labels.update(elevator_alert.related_lines)
        line_colors = self._line_colors(needed_labels)

        # User-tracked subset of `lines_at_stop` — the lines selected in
        # the integration's config flow (`CONF_LINES` is a list of
        # `{line}|{direction}` keys). All three card editors prefer this
        # filtered list so the per-stop pickers don't surface lines the
        # user has explicitly opted out of, while still including ones
        # that aren't currently driving (nightlines during the day,
        # day-only lines after midnight). Empty when nothing's tracked,
        # in which case the editors fall through to `lines_at_stop`.
        # Canonicalised on the way out: a selection saved as "LB|H" is
        # published as "WLB|H", the spelling the live departures carry.
        # The cards filter `departure.line` against this list, so a legacy
        # key published verbatim silently empties the board (issue #110).
        # Stored entry data is deliberately left alone — every reader
        # canonicalises, so there is nothing to migrate and nothing to
        # break if a user downgrades.
        tracked_keys = [
            canonical_line_key(k)
            for k in (selected_line_keys or [])
            if isinstance(k, str) and k
        ]
        tracked_lines = sorted({k.split("|", 1)[0] for k in tracked_keys})

        # `attribution` lives on the entity class via `_attr_attribution`
        # (HA core renders it in the same dict) — don't duplicate here, that
        # would just add bytes to every recorder write at busy stops.
        attrs: dict[str, Any] = {
            "diva": diva,
            "stop_name": stop_name,
            "latitude": self.coordinator.latitude,
            "longitude": self.coordinator.longitude,
            "server_time": data.server_time if data is not None else None,
            # Upstream plausibility signal. `stale_departures` counts the
            # records this poll dropped because the feed stopped advancing
            # them; `stale_since` is the newest planned time among those,
            # i.e. roughly when it froze. The cards read both to explain an
            # empty board instead of mislabelling it "Betriebsschluss".
            "stale_departures": data.stale_dropped if data is not None else 0,
            "stale_since": data.stale_since if data is not None else None,
            "departures": capped,
            "next_by_line": next_by_line,
            "lines_at_stop": lines_at_stop,
            "tracked_lines": tracked_lines,
            "tracked_line_keys": tracked_keys,
            "line_colors": line_colors,
            "traffic_info": [t.to_dict() for t in traffic],
            "elevator_info": [e.to_dict() for e in elevator],
        }
        self.coordinator.store_attrs(attrs, current_alerts_seq)
        return attrs

    def _lines_at_stop(self, diva: int) -> list[str]:
        """Static-catalogue line list for this DIVA.

        Returns `[]` when the catalogue or trip-pattern index isn't
        loaded yet — callers (the card editor) fall through to the
        live-derived list in that case so behaviour degrades gracefully.
        """
        domain_data = self.coordinator.hass.data.get(DOMAIN, {})
        catalogue = domain_data.get(CATALOGUE_KEY)
        if not isinstance(catalogue, StaticCatalogue):
            return []
        index = catalogue.trip_patterns
        if index is None:
            return []
        labels = index.lines_at_diva.get(diva)
        return list(labels) if labels else []

    def _line_colors(self, labels: set[str]) -> dict[str, dict[str, str]]:
        """Return the GTFS palette for `labels`, as `{label: {bg, fg}}`.

        Reads the shared catalogue ref live rather than capturing it at
        setup, so a background trip-pattern refresh (which also refreshes
        route colours) is picked up without a restart.

        NOT on the very next sensor read, which an earlier revision of
        this docstring claimed. This runs inside
        `extra_state_attributes`, whose result is memoised on the
        coordinator, and `static.async_set_cached_catalogue` publishes a
        new catalogue without invalidating that cache. So the refreshed
        colours land on the next coordinator tick — bounded by the
        entry's scan interval, 60 s by default and up to 600 s at the
        ceiling. Harmless for data that changes on a weeks-to-months
        cadence; wrong to rely on if something ever needs the catalogue
        promptly.

        A label with no GTFS entry is omitted rather than published with
        an empty colour, and so is any label the catalogue doesn't know.
        Returns `{}` when the catalogue isn't loaded yet or the routes
        payload hasn't landed — the card has its own fallbacks
        (nightline rule + neutral default), which is also what an omitted
        label gets. See the call site for which labels have to be in
        `labels` and why.
        """
        domain_data = self.coordinator.hass.data.get(DOMAIN, {})
        catalogue = domain_data.get(CATALOGUE_KEY)
        if not isinstance(catalogue, StaticCatalogue):
            return {}
        index = catalogue.trip_patterns
        if index is None or not index.colors_by_line:
            return {}
        out: dict[str, dict[str, str]] = {}
        for label in labels:
            bg = index.colors_by_line.get(label)
            if not bg:
                continue
            entry = {"bg": bg}
            fg = index.text_colors_by_line.get(label)
            if fg:
                entry["fg"] = fg
            out[label] = entry
        return out

    @property
    def available(self) -> bool:
        """Stay available while we have any cached data.

        HA's default `CoordinatorEntity.available` follows
        `last_update_success`, which flips to False on any single fetch
        failure. That would blank the card between polls for transient
        hiccups (one-off timeouts, brief 5xx's, momentary rate-limits).
        We relax it: as long as the coordinator has prior data from any
        past successful fetch, keep serving it. Templates can still
        detect staleness via the `server_time` attribute if they care.
        If we've never had a successful fetch, the coordinator's
        `data` is None and we stay unavailable — nothing to show.

        ⚠ Trade-off — this DELIBERATELY violates HA's documented
        `available` contract: HA defines `available=False` as "this
        entity has no current valid data; templates and automations
        should treat it as unknown." With this override, templates
        using `is_state(..., 'unavailable')`, `availability_template:`,
        and automation conditions that gate on `unavailable` will
        NEVER fire on a transient outage — the entity stays
        `available=True` and the state keeps reporting the cached
        last-known value.

        Mitigation, shipped in v2.0.0: `binary_sensor.<stop>_stale`
        (device_class `problem`) carries the signal this override
        suppresses — it goes on when `last_update_success` flips False
        or when `server_time` ages past three polling intervals. Gate
        outage automations on that entity, not on this one's
        availability. `server_time` remains on this entity for
        templates that want to judge freshness themselves.

        Don't lift this override to a sibling integration without
        taking the binary_sensor with it. On its own it is a silent
        removal of the availability contract; the pair is the design.
        """
        return self.coordinator.data is not None
