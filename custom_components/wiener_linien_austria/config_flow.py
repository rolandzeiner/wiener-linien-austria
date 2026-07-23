"""Config flow for Wiener Linien Austria.

Two-step flow:
  1. `user`           — one searchable dropdown carrying every trackable stop
                        in the static catalogue. The stops nearest the Home
                        Assistant home location are pinned to the top with
                        their distance; the rest follow alphabetically. HA
                        renders this as a combo box, so typing filters the
                        whole catalogue client-side.
  2. `select_lines`   — live `/monitor` call with the station's RBLs; each
                        returned line × direction is presented as a pre-checked
                        option. Submitting saves the entry.
`async_step_reconfigure` re-enters `select_lines` for an existing entry,
preserving unique_id. Options flow tweaks the scan interval only.

Superseded design (pre-1.6): a free-text `search_query` step feeding a
`select_stop` shortlist. It forced the user to know and correctly spell a
stop name before seeing anything, and the distance-sorted suggestion list
that replaced it only helped installs sitting inside the network — a home
location 37 km out got no suggestions at all. The searchable dropdown
serves both cases from one control.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)
from homeassistant.util.location import distance

from .const import (
    API_BASE_URL,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_POLL_SECONDS,
    MIN_POLL_SECONDS,
    MONITOR_ENDPOINT,
    NEARBY_STOP_LIMIT,
    NEARBY_STOP_MAX_METERS,
    USER_AGENT,
)
from .http import base_request_headers
from .static import StaticCatalogue, Station, async_get_catalogue

_LOGGER = logging.getLogger(__name__)


def _nearest_stations(
    catalogue: StaticCatalogue,
    latitude: float,
    longitude: float,
    *,
    limit: int = NEARBY_STOP_LIMIT,
    max_meters: float = NEARBY_STOP_MAX_METERS,
) -> list[tuple[Station, float]]:
    """Return the closest stations to (latitude, longitude), nearest first.

    Each tuple is `(station, metres)`. Stations further away than
    `max_meters` are dropped entirely — an empty result is the signal
    that nearby suggestions aren't useful here (home location outside
    the Wiener Linien network) and the caller should fall back to the
    free-text search alone.

    Stations with no RBLs are skipped: `/monitor` is queried per RBL, so
    a platform-less DIVA can only ever produce a `cannot_connect` dead
    end in `select_lines`. Never suggest a stop that can't be tracked.

    Uses HA's own Vincenty implementation rather than a hand-rolled
    haversine. Measured at ~17 ms for a full 4 500-station sweep, which
    is well inside what a config-flow step can absorb, so there is no
    bounding-box pre-filter to keep correct.
    """
    scored: list[tuple[Station, float]] = []
    for station in catalogue.stations_by_diva.values():
        if not station.rbls:
            continue
        meters = distance(latitude, longitude, station.latitude, station.longitude)
        if meters is None or meters > max_meters:
            continue
        scored.append((station, meters))
    # Name is the tie-breaker so the ordering is stable across renders —
    # dict iteration order is stable too, but co-located stops would
    # otherwise shuffle if the catalogue is refreshed mid-flow.
    scored.sort(key=lambda row: (row[1], row[0].name))
    return scored[:limit]


def _format_distance(meters: float, language: str) -> str:
    """Render a distance for a picker label: '450 m' / '1.2 km' / '1,2 km'.

    Rounded to 10 m because the underlying coordinates are stop-centre
    points, not the platform the user actually walks to — more precision
    would be false precision. German locales get the decimal comma;
    SelectOptionDict labels bypass HA's translation system (same reason
    `_SEARCH_AGAIN_LABELS` exists), so the formatting happens here.
    """
    if meters < 1000:
        return f"{round(meters / 10) * 10} m"
    text = f"{meters / 1000:.1f} km"
    if language.startswith("de"):
        text = text.replace(".", ",")
    return text


def _nearby_label(station: Station, meters: float, language: str) -> str:
    """Render a nearby-stop option: 'Stephansplatz (Wien) — 450 m'."""
    return (
        f"{station.name} ({station.municipality}) "
        f"— {_format_distance(meters, language)}"
    )


def _station_for_value(
    catalogue: StaticCatalogue, value: Any
) -> Station | None:
    """Resolve a picker value back to a trackable Station, or None.

    The SelectSelector already constrains submissions to values we
    offered, so this is the second line of defence — it also re-checks
    `rbls`, which keeps the resolution honest if the catalogue was
    refreshed between rendering the form and submitting it.
    """
    try:
        diva = int(value)
    except (TypeError, ValueError):
        # Only reachable if the selector contract changes under us or the
        # flow state is hand-edited; the user-visible `invalid_stop` is
        # already the right answer, so this stays at DEBUG.
        _LOGGER.debug("Failed to parse diva %r", value)
        return None
    station = catalogue.stations_by_diva.get(diva)
    if station is None or not station.rbls:
        return None
    return station


def _stop_label(station: Station) -> str:
    """Render a plain stop option: 'Stephansplatz (Wien)'."""
    return f"{station.name} ({station.municipality})"


def _stop_options(
    catalogue: StaticCatalogue,
    latitude: float,
    longitude: float,
    language: str,
) -> list[SelectOptionDict]:
    """Every trackable stop as one picker option, nearest to home first.

    HA renders a DROPDOWN SelectSelector as a combo box that filters on
    the option labels client-side, so shipping the whole catalogue in one
    control gives type-to-filter over every stop without a round trip —
    the user never has to know a stop's exact spelling, and there is no
    second shortlist step.

    Ordering carries the useful default: the stops closest to the home
    location head the list with their distance shown, so the unfiltered
    dropdown opens on "probably one of these". Everything else follows
    alphabetically. `sort=False` on the selector preserves this order.

    Stops the nearby block already pinned are dropped from the
    alphabetical remainder — a duplicate `value` in a select is
    ambiguous, and the pinned row is the more informative of the two.

    Falls back to a purely alphabetical list when the home location is
    unset or nothing is in range; the dropdown is equally usable either
    way, the nearby block is only a shortcut.
    """
    nearby: list[tuple[Station, float]] = []
    if latitude or longitude:
        nearby = _nearest_stations(catalogue, latitude, longitude)

    options = [
        SelectOptionDict(
            value=str(station.diva),
            label=_nearby_label(station, meters, language),
        )
        for station, meters in nearby
    ]
    pinned = {station.diva for station, _ in nearby}
    remainder = sorted(
        (
            station
            for station in catalogue.stations_by_diva.values()
            # Same exclusion as `_nearest_stations`: /monitor is queried
            # per RBL, so a platform-less DIVA can only dead-end.
            if station.rbls and station.diva not in pinned
        ),
        key=lambda station: (station.name.casefold(), station.municipality.casefold()),
    )
    options.extend(
        SelectOptionDict(value=str(station.diva), label=_stop_label(station))
        for station in remainder
    )
    return options


def _line_key(line: str, direction: str) -> str:
    """Stable identifier for a (line, direction) pair.

    Mirrors how the coordinator's `_parse_monitor_body` filters
    departures — `line.towards` flips on branching termini, so saved
    selections must not include it. The `towards` value is still shown
    to the user as a label in the dropdown but is not part of the key.
    """
    return f"{line}|{direction}"


async def _probe_monitor_lines(
    hass: HomeAssistant, rbls: list[int]
) -> list[dict[str, str]]:
    """Call /monitor once for the given RBLs and return one dict per line/direction.

    Each dict: {key, line, towards, direction, type}. Empty list on any failure
    — caller must handle by surfacing a `cannot_connect` form error.
    """
    session = async_get_clientsession(hass)
    url = f"{API_BASE_URL}{MONITOR_ENDPOINT}"
    params = [("stopId", str(r)) for r in rbls]
    try:
        async with session.get(
            url,
            params=params,
            headers=base_request_headers(USER_AGENT),
            timeout=aiohttp.ClientTimeout(total=10),
        ) as resp:
            resp.raise_for_status()
            body = await resp.json()
    except (asyncio.TimeoutError, aiohttp.ClientError, ValueError) as err:
        _LOGGER.warning("Line-probe failed for RBLs %s: %s", rbls, err)
        return []

    if not isinstance(body, dict):
        return []
    message = body.get("message") or {}
    if message.get("messageCode") not in (1, None):
        return []

    seen: set[str] = set()
    out: list[dict[str, str]] = []
    for monitor in (body.get("data") or {}).get("monitors") or []:
        for line in monitor.get("lines") or []:
            name = str(line.get("name") or "").strip()
            direction = str(line.get("direction") or "").strip()
            towards = str(line.get("towards") or "").strip()
            if not name or not towards:
                continue
            key = _line_key(name, direction)
            # Multiple `line.towards` values can appear under the same
            # (line, direction) pair on branching termini (e.g. U1/R
            # reports both "Oberlaa" and "Alaudagasse"). Show the first
            # seen as the picker label; the saved key collapses them.
            if key in seen:
                continue
            seen.add(key)
            out.append(
                {
                    "key": key,
                    "line": name,
                    "towards": towards,
                    "direction": direction,
                    "type": str(line.get("type") or "").strip(),
                }
            )
    out.sort(key=lambda r: (r["line"], r["towards"]))
    return out


def _static_lines_for_station(
    catalogue: StaticCatalogue, station: Station
) -> list[dict[str, str]]:
    """Enumerate every line × direction that serves this station, regardless
    of time-of-day, from the static trip-pattern index.

    Solves the "nightlines vanish from the picker between 06:00–23:00 / day
    lines vanish at 03:00" bug: the live `/monitor` endpoint only returns
    departures inside the next ~75 minutes, so any line currently out of
    service is invisible to `_probe_monitor_lines`. The static catalogue
    knows the full schedule graph (`fahrwegverlaeufe.csv` × `linien.csv`)
    and exposes every (line, direction) pair plus its terminus name from
    the published timetable, which is the right source for a "what's
    trackable here" picker.

    Returns the same shape as `_probe_monitor_lines` so the two sources
    can be merged. Returns an empty list when the cache predates the
    trip-pattern index (older v1.4 caches) — caller falls through to the
    live-only path in that case.
    """
    tpi = catalogue.trip_patterns
    if tpi is None:
        return []
    diva_labels = tpi.lines_at_diva.get(station.diva, ())
    if not diva_labels:
        return []
    # Reuse the catalogue's cached RBL → (DIVA, name) reverse index —
    # it's the same lookup the coordinator's stops_ahead matcher uses,
    # built once per catalogue instance and dict-resolved per call.
    rbl_index = catalogue.index_by_rbl()
    station_rbl_set = set(station.rbls)
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for label in diva_labels:
        line_id = tpi.lines_by_label.get(label)
        if line_id is None:
            continue
        mot = tpi.means_by_line.get(line_id, "")
        for pattern in tpi.patterns_by_line.get(line_id, ()):
            # Pattern must actually pass through this station — a line
            # can have multiple patterns (short turns, branches) and
            # only some visit a given DIVA's RBLs.
            intersection = station_rbl_set.intersection(pattern.stops)
            if not intersection:
                continue
            # Skip self-terminating short-turn patterns: when this
            # station is itself the terminus, the picker would surface
            # "U1 → Westbahnhof" while the user is configuring at
            # Westbahnhof. The live /monitor never emits these (the
            # vehicle has already arrived), so they only show up via
            # the static merge.
            terminus_rbl = pattern.stops[-1] if pattern.stops else None
            if terminus_rbl is not None and terminus_rbl in station_rbl_set:
                continue
            # Direction codes: H="hin" (CSV 1), R="retour" (CSV 2).
            # Mirrors the live /monitor convention so saved keys round-
            # trip cleanly when the user reconfigures.
            direction_str = "H" if pattern.direction == 1 else "R"
            key = _line_key(label, direction_str)
            if key in seen:
                continue
            terminus_entry = (
                rbl_index.get(terminus_rbl) if terminus_rbl else None
            )
            towards = terminus_entry[1] if terminus_entry is not None else ""
            if not towards:
                continue
            seen.add(key)
            out.append(
                {
                    "key": key,
                    "line": label,
                    "towards": towards,
                    "direction": direction_str,
                    "type": mot,
                }
            )
    out.sort(key=lambda r: (r["line"], r["towards"]))
    return out


async def _resolve_lines_for_picker(
    hass: HomeAssistant, catalogue: StaticCatalogue, station: Station
) -> list[dict[str, str]]:
    """Merge live + static line lists. Live wins where both have a key —
    the live `/monitor` row carries the most accurate towards label for
    branching termini (U1/R reports the active pattern's terminus,
    "Oberlaa" or "Alaudagasse"); static fills in everything not currently
    running so off-service lines (nightlines during the day, day-only
    lines after midnight) still appear in the picker.
    """
    live = await _probe_monitor_lines(hass, station.rbls)
    static = _static_lines_for_station(catalogue, station)
    if not static:
        return live
    live_keys = {row["key"] for row in live}
    merged = list(live)
    for row in static:
        if row["key"] not in live_keys:
            merged.append(row)
    merged.sort(key=lambda r: (r["line"], r["towards"]))
    return merged


class WienerLinienAustriaConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a multi-step config flow for Wiener Linien Austria."""

    # Bump VERSION + add async_migrate_entry when entry.data shape changes
    # in a non-additive way (renames, removals, type changes). MINOR_VERSION
    # bumps for additive changes that older HA versions can still load.
    # Tracks the config-entry schema, NOT the integration release version.
    # v2: CONF_LINES stores `{line}|{direction}` pairs (was triples) —
    # line.towards is unstable across polls on branching termini.
    VERSION = 2
    MINOR_VERSION = 1

    def __init__(self) -> None:
        """Init in-flight selections."""
        self._selected_station: Station | None = None
        # None = not built yet. Built once per flow; ~2 000 options.
        self._stop_options: list[SelectOptionDict] | None = None
        self._lines: list[dict[str, str]] = []
        self._reconfigure_entry: ConfigEntry | None = None

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ) -> WienerLinienAustriaOptionsFlow:
        """Return the options flow handler."""
        return WienerLinienAustriaOptionsFlow()

    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # Step 1 — user: searchable dropdown over the whole catalogue
    # ------------------------------------------------------------------

    async def _async_stop_options(
        self, catalogue: StaticCatalogue
    ) -> list[SelectOptionDict]:
        """Build (and memoise) the stop picker options for this flow.

        Memoised so re-rendering the form after a validation error does
        not repeat the distance sweep and the ~2 000-entry sort.
        """
        if self._stop_options is None:
            self._stop_options = _stop_options(
                catalogue,
                self.hass.config.latitude,
                self.hass.config.longitude,
                self.hass.config.language,
            )
        return self._stop_options

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick a stop from the full catalogue, nearest to home first."""
        try:
            catalogue = await async_get_catalogue(self.hass)
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            # Without the catalogue there is no picker to render and no
            # free-text fallback left to offer, so end the flow cleanly
            # rather than showing an empty dropdown the user can't use.
            _LOGGER.warning("Static catalogue load failed: %s", err)
            return self.async_abort(reason="catalogue_unavailable")

        options = await self._async_stop_options(catalogue)
        errors: dict[str, str] = {}

        if user_input is not None:
            station = _station_for_value(catalogue, user_input.get(CONF_DIVA))
            if station is None:
                errors[CONF_DIVA] = "invalid_stop"
            else:
                self._selected_station = station
                return await self.async_step_select_lines()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_DIVA): SelectSelector(
                        SelectSelectorConfig(
                            options=options,
                            mode=SelectSelectorMode.DROPDOWN,
                            # Keep the nearest-first ordering built above;
                            # HA would otherwise re-sort alphabetically and
                            # bury the nearby block.
                            sort=False,
                        )
                    )
                }
            ),
            errors=errors,
        )

    # ------------------------------------------------------------------
    # Step 3 — select_lines: live /monitor probe + checkbox selection
    # ------------------------------------------------------------------

    async def async_step_select_lines(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Probe /monitor for live lines at the chosen station and let the user pick."""
        assert self._selected_station is not None
        station = self._selected_station
        errors: dict[str, str] = {}

        if not self._lines:
            try:
                catalogue = await async_get_catalogue(self.hass)
            except (aiohttp.ClientError, asyncio.TimeoutError) as err:
                _LOGGER.warning("Static catalogue load failed: %s", err)
                catalogue = None
            if catalogue is not None:
                self._lines = await _resolve_lines_for_picker(
                    self.hass, catalogue, station
                )
                # Catalogue is healthy again — drop any prior Repairs
                # issue from a previous failed attempt so the user's
                # dashboard doesn't carry stale warnings forever.
                ir.async_delete_issue(
                    self.hass, DOMAIN, "catalogue_unavailable"
                )
            else:
                # Catalogue unavailable — fall back to the live-only
                # path so the user can still proceed if the OGD data
                # store is temporarily down. Picker will be missing
                # any currently-out-of-service lines (e.g. nightlines
                # during the day), so surface a Repairs issue too —
                # the warning log alone is invisible to anyone who
                # isn't tailing the HA logs.
                ir.async_create_issue(
                    self.hass,
                    DOMAIN,
                    "catalogue_unavailable",
                    is_fixable=False,
                    severity=ir.IssueSeverity.WARNING,
                    translation_key="catalogue_unavailable",
                )
                self._lines = await _probe_monitor_lines(
                    self.hass, station.rbls
                )
            if not self._lines:
                return self.async_show_form(
                    step_id="select_lines",
                    errors={"base": "cannot_connect"},
                    data_schema=vol.Schema({}),
                    description_placeholders={
                        "stop_name": station.name,
                        "line_count": "0",
                    },
                )

        if user_input is not None:
            picked: list[str] = [
                str(x) for x in user_input.get(CONF_LINES, [])
            ]
            if not picked:
                errors[CONF_LINES] = "no_lines"
            else:
                interval = int(
                    user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
                )
                data: dict[str, Any] = {
                    CONF_DIVA: station.diva,
                    CONF_STOP_NAME: station.name,
                    CONF_RBLS: list(station.rbls),
                    CONF_LINES: picked,
                    CONF_SCAN_INTERVAL: interval,
                }
                if self._reconfigure_entry is not None:
                    await self.async_set_unique_id(f"diva_{station.diva}")
                    self._abort_if_unique_id_mismatch()
                    return self.async_update_and_abort(
                        self._reconfigure_entry,
                        data=data,
                    )
                await self.async_set_unique_id(f"diva_{station.diva}")
                self._abort_if_unique_id_configured(reload_on_update=False)
                return self.async_create_entry(title=station.name, data=data)

        line_options: list[SelectOptionDict] = [
            SelectOptionDict(
                value=row["key"],
                label=_line_label(row),
            )
            for row in self._lines
        ]
        # Default scan interval comes from the existing entry if reconfiguring,
        # otherwise the system default.
        existing = self._reconfigure_entry
        default_interval = (
            int({**existing.data, **existing.options}.get(
                CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
            ))
            if existing is not None
            else DEFAULT_SCAN_INTERVAL
        )
        # New entries start with nothing pre-selected — busy stops have
        # 20+ lines and users typically only want one or two, so opt-in
        # is the cheaper interaction. Reconfigure preserves whatever the
        # user had before.
        default_lines = (
            [str(k) for k in {**existing.data, **existing.options}.get(CONF_LINES, [])]
            if existing is not None
            else []
        )

        return self.async_show_form(
            step_id="select_lines",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_LINES, default=default_lines): SelectSelector(
                        SelectSelectorConfig(
                            options=line_options,
                            multiple=True,
                            mode=SelectSelectorMode.LIST,
                        )
                    ),
                    vol.Required(
                        CONF_SCAN_INTERVAL, default=default_interval
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=MIN_POLL_SECONDS,
                            max=MAX_POLL_SECONDS,
                            step=5,
                            unit_of_measurement="s",
                            mode=NumberSelectorMode.BOX,
                        )
                    ),
                }
            ),
            errors=errors,
            description_placeholders={
                "stop_name": station.name,
                "line_count": str(len(self._lines)),
            },
        )

    # ------------------------------------------------------------------
    # Reconfigure
    # ------------------------------------------------------------------

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Re-enter the line selection for an existing entry."""
        entry = self._get_reconfigure_entry()
        self._reconfigure_entry = entry
        data = entry.data

        try:
            catalogue = await async_get_catalogue(self.hass)
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            _LOGGER.warning("Static catalogue load failed on reconfigure: %s", err)
            return self.async_abort(reason="catalogue_unavailable")

        # A corrupt / hand-edited / fork-migrated entry may carry a missing
        # or non-numeric DIVA. Abort cleanly with the same "stop_gone" reason
        # used below rather than throwing an unknown-error stack trace.
        try:
            diva = int(data[CONF_DIVA])
        except (KeyError, TypeError, ValueError):
            return self.async_abort(reason="stop_gone")
        station = catalogue.stations_by_diva.get(diva)
        if station is None:
            return self.async_abort(reason="stop_gone")
        self._selected_station = station
        return await self.async_step_select_lines(user_input)


class WienerLinienAustriaOptionsFlow(OptionsFlow):
    """Options flow: scan interval only.

    Stop/line changes go through `async_step_reconfigure` in the main flow so
    the entry's unique_id stays stable and entities are preserved.
    """

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle options."""
        config = {**self.config_entry.data, **self.config_entry.options}
        if user_input is not None:
            interval = int(
                user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
            )
            return self.async_create_entry(
                data={CONF_SCAN_INTERVAL: interval}
            )

        default_interval = int(
            config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        )
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SCAN_INTERVAL, default=default_interval
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=MIN_POLL_SECONDS,
                            max=MAX_POLL_SECONDS,
                            step=5,
                            unit_of_measurement="s",
                            mode=NumberSelectorMode.BOX,
                        )
                    )
                }
            ),
        )


def _line_label(row: dict[str, str]) -> str:
    """Render a line selection label: 'U1 → Leopoldau'."""
    return f"{row['line']} → {row['towards']}"
