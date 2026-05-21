"""Sensor platform for Wiener Linien Austria."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .alerts import get_alerts_for
from .const import (
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
from .static import CATALOGUE_KEY, StaticCatalogue

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WienerLinienConfigEntry,
    async_add_entities: AddEntitiesCallback,
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
        line_names: set[str] = {
            k.split("|", 1)[0]
            for k in selected_line_keys
            if isinstance(k, str) and k
        }
        if not line_names:
            line_names = {d.line for d in departures if d.line}
        rbls = {int(r) for r in config.get(CONF_RBLS) or []}

        # Prefer `self.hass` (the standard Entity reference, set by HA
        # during `async_added_to_hass`); fall back to the coordinator's
        # ref so tests that read `extra_state_attributes` without
        # routing through HA core still resolve.
        hass = self.hass if self.hass is not None else self.coordinator.hass
        traffic, elevator = get_alerts_for(hass, line_names, rbls)

        # Cap the list at MAX_DEPARTURES_IN_ATTRS so busy multi-line stops
        # (e.g. Stephansplatz tracking U1/U3/U4 ≈ ~40 entries) stay under HA's
        # 16 KB recorder attribute cap. The card respects its own
        # max_departures setting (≤ 20) so nothing the UI shows is lost.
        capped = [d.to_dict() for d in departures[:MAX_DEPARTURES_IN_ATTRS]]

        # GTFS-derived per-line palette. Published unscoped (every line in
        # the Wiener Linien catalogue, not just lines at this stop) because
        # the card's stops_ahead trail can render chips for transfer lines
        # at OTHER stops — scoping here would leave those chips colourless.
        # Total size is ~3 KB regardless of stop, well under the recorder's
        # 16 KB attribute cap, and the data is identical across sensors so
        # the recorder dedupes it via the state-diff path.
        line_colors = self._line_colors()

        # Static-catalogue line list for THIS stop — every line that
        # serves the DIVA per the Wiener Linien schedule, regardless of
        # whether it has a departure inside the live `/monitor` window
        # right now. Falls back to the live-derived list when the
        # catalogue/trip-pattern index isn't loaded yet.
        lines_at_stop = self._lines_at_stop(diva)

        # User-tracked subset of `lines_at_stop` — the lines selected in
        # the integration's config flow (`CONF_LINES` is a list of
        # `{line}|{direction}` keys). Both card editors prefer this
        # filtered list so the per-stop pickers don't surface lines the
        # user has explicitly opted out of, while still including ones
        # that aren't currently driving (nightlines during the day,
        # day-only lines after midnight). Empty when nothing's tracked,
        # in which case the editors fall through to `lines_at_stop`.
        tracked_keys = [
            str(k)
            for k in (selected_line_keys or [])
            if isinstance(k, str) and k
        ]
        tracked_lines = sorted({k.split("|", 1)[0] for k in tracked_keys})

        # `attribution` lives on the entity class via `_attr_attribution`
        # (HA core renders it in the same dict) — don't duplicate here, that
        # would just add bytes to every recorder write at busy stops.
        return {
            "diva": diva,
            "stop_name": stop_name,
            "latitude": self.coordinator.latitude,
            "longitude": self.coordinator.longitude,
            "server_time": data.server_time if data is not None else None,
            "departures": capped,
            "next_by_line": next_by_line,
            "lines_at_stop": lines_at_stop,
            "tracked_lines": tracked_lines,
            "tracked_line_keys": tracked_keys,
            "line_colors": line_colors,
            "traffic_info": [t.to_dict() for t in traffic],
            "elevator_info": [e.to_dict() for e in elevator],
        }

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

    def _line_colors(self) -> dict[str, dict[str, str]]:
        """Return the full GTFS palette as `{label: {bg, fg}}`.

        Reads the shared catalogue ref live so a background trip-pattern
        refresh (which also refreshes route colours) is picked up on the
        very next sensor read. Returns `{}` when the catalogue isn't
        loaded yet or the routes payload hasn't landed — the card has its
        own fallbacks (nightline rule + neutral default).
        """
        domain_data = self.coordinator.hass.data.get(DOMAIN, {})
        catalogue = domain_data.get(CATALOGUE_KEY)
        if not isinstance(catalogue, StaticCatalogue):
            return {}
        index = catalogue.trip_patterns
        if index is None or not index.colors_by_line:
            return {}
        out: dict[str, dict[str, str]] = {}
        for label, bg in index.colors_by_line.items():
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

        Mitigation: surface staleness through the `server_time`
        attribute (templates that care about freshness can compare
        it to `now()` and decide). For users who need
        availability-based automations to fire on actual outages,
        document the workaround: a template binary_sensor that
        flips on `(now() - server_time) > threshold`.

        DO NOT lift this pattern naively to other integrations
        without the same UX-vs-contract trade-off being made
        deliberately. Especially not for entities driving
        automations more than dashboards. See
        `~/.claude/skills/austria-portfolio-workflow/PORTFOLIO_LIFTABLES.md`
        item 13 for the cleaner alternative (separate
        `binary_sensor.<...>_stale` entity).
        """
        return self.coordinator.data is not None
