"""Config flow for Wiener Linien Austria.

Flow:
  0. `user`           — a menu: a departure board (`stop`) or an A→B route
                        (`route`, then `route_options`). Everything below
                        describes the departure-board branch.
  1. `stop`           — a combo box (`custom_value=True`) over every trackable
                        stop. Typing filters the catalogue live, so the user
                        gets autocomplete instead of a blind search; the stops
                        nearest the Home Assistant home location are pinned to
                        the top with their distance. Picking a suggestion goes
                        straight to `select_lines`.
  2. `select_stop`    — only reached when the submitted text matched no stop
                        exactly (a partial name, a typo). Runs the catalogue
                        search over what was typed and offers the hits as a
                        shortlist, plus a "search again" escape hatch.
  3. `select_lines`   — the station's line × direction pairs, merged from a
                        live `/monitor` call and the static catalogue, plus the
                        stop's S-Bahn lines from the timetable, offered as an
                        opt-in checklist with the scan interval. A new entry
                        starts with nothing selected; reconfigure restores the
                        saved picks. Submitting saves the entry.
`async_step_reconfigure` re-enters `select_lines` for a stop entry, or
`route_options` for a route, preserving unique_id. Options flow tweaks the
scan interval only.

The combo box is what makes step 1 usable at both extremes: a plain
free-text box gave no feedback until submit, and a plain dropdown of ~1800
stops is unscannable. `custom_value=True` gets both — autocomplete while
typing, and free text that step 2 can still resolve.
"""

from __future__ import annotations

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
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TimeSelector,
)
from homeassistant.util import dt as dt_util

from .const import (
    API_BASE_URL,
    CONF_ACTIVE_DAYS,
    CONF_ACTIVE_FROM,
    CONF_ACTIVE_TO,
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_DIVA,
    CONF_ENTRY_TYPE,
    CONF_EXCLUDED_MEANS,
    CONF_LEAVE_MINUTES,
    CONF_LINES,
    CONF_MAX_CHANGES,
    CONF_MIN_TRANSFER_MINUTES,
    CONF_ORIGIN_DIVA,
    CONF_ORIGIN_NAME,
    CONF_RBLS,
    CONF_ROUTE_TYPE,
    CONF_STEP_FREE,
    CONF_STOP_NAME,
    CONF_WALK_SPEED,
    DEFAULT_LEAVE_MINUTES,
    DEFAULT_MIN_TRANSFER_MINUTES,
    DEFAULT_ROUTE_SCAN_INTERVAL,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_WALK_SPEED,
    DOMAIN,
    ENTRY_TYPE_ROUTE,
    ENTRY_TYPE_STOP,
    EXCLUDABLE_MEANS,
    LINE_TYPE_S_BAHN,
    MAX_CHANGES_ANY,
    MAX_CHANGES_CHOICES,
    MAX_LEAVE_MINUTES,
    MAX_MIN_TRANSFER_MINUTES,
    MAX_POLL_SECONDS,
    MAX_ROUTE_POLL_SECONDS,
    MIN_POLL_SECONDS,
    MIN_ROUTE_POLL_SECONDS,
    MONITOR_ENDPOINT,
    ROUTE_TYPES,
    USER_AGENT,
    WALK_SPEEDS,
    WEEKDAYS,
)
from .http import base_request_headers
from .route_coordinator import async_plan_trips
from .routing import (
    ROUTE_STOP_ERRORS,
    RouteOptions,
    RoutingError,
    async_routing_zone,
    route_type_option,
)
from .static import (
    StaticCatalogue,
    Station,
    async_get_catalogue,
    canonical_line_key,
    is_s_bahn_label,
)
from .stops import stop_options, trackable_station
from .timetable import async_probe_picker_rows

_LOGGER = logging.getLogger(__name__)

# SelectOptionDict labels bypass HA's selector translation system, so we
# pick the right locale at runtime. English is the fallback for anything
# not explicitly listed.
_SEARCH_AGAIN_LABELS: dict[str, str] = {
    "en": "↩ Search again",
    "de": "↩ Erneut suchen",
}
# Suffix on S-Bahn options: they get planned times only, and the picker is
# where someone decides whether that is worth tracking.
_TIMETABLE_SUFFIXES: dict[str, str] = {
    "en": "timetable only",
    "de": "nur Fahrplan",
}


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

    This call deliberately does NOT take `async_enforce_domain_cooldown`.
    Every unattended caller does (batch.py, alerts.py, static.py, and live.py
    for route refreshes), because their aggregate rate is what the upstream
    notices. This one is user-initiated, runs once each time someone opens
    the line picker (setup or reconfigure), and the cooldown sleeps *inside*
    the lock — taking it would freeze the config-flow dialog for up to
    DOMAIN_COOLDOWN_SECONDS while someone is watching it, to spare a free
    public API a single request. Not a trade worth making. The S-Bahn picker
    probe and `_probe_route` skip the routing slot for the same reason.

    If you are here because a linter or an audit flagged the inconsistency:
    it is deliberate, and README's Data Updates section documents it.
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
    except (TimeoutError, aiohttp.ClientError, ValueError) as err:
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
            terminus_entry = rbl_index.get(terminus_rbl) if terminus_rbl else None
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
    merged.extend(row for row in static if row["key"] not in live_keys)
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
        # None = not built yet. Built once per flow; ~1 800 options.
        self._stop_options: list[SelectOptionDict] | None = None
        # Free-text fallback state: what was typed, and what it matched.
        self._query: str = ""
        self._matches: list[Station] = []
        self._lines: list[dict[str, str]] = []
        self._reconfigure_entry: ConfigEntry | None = None
        # Route flow: (diva, name) for each end, set by `route`.
        self._route_origin: tuple[int, str] | None = None
        self._route_destination: tuple[int, str] | None = None

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ) -> WienerLinienAustriaOptionsFlow:
        """Return the options flow handler."""
        return WienerLinienAustriaOptionsFlow()

    # ------------------------------------------------------------------
    # Step 1 — stop: searchable dropdown over the whole catalogue
    # ------------------------------------------------------------------

    async def _async_stop_options(
        self, catalogue: StaticCatalogue
    ) -> list[SelectOptionDict]:
        """Build (and memoise) the stop picker options for this flow.

        Memoised so re-rendering the form after a validation error does
        not repeat the distance sweep and the ~1 800-entry sort.
        """
        if self._stop_options is None:
            self._stop_options = stop_options(
                catalogue,
                self.hass.config.latitude,
                self.hass.config.longitude,
                self.hass.config.language,
            )
        return self._stop_options

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask what to add: a departure board or an A→B route."""
        return self.async_show_menu(
            step_id="user", menu_options=[ENTRY_TYPE_STOP, ENTRY_TYPE_ROUTE]
        )

    async def async_step_stop(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick a stop from the full catalogue, nearest to home first."""
        try:
            catalogue = await async_get_catalogue(self.hass)
        except (TimeoutError, aiohttp.ClientError) as err:
            # Without the catalogue there is no picker to render and no
            # free-text fallback left to offer, so end the flow cleanly
            # rather than showing an empty dropdown the user can't use.
            _LOGGER.warning("Static catalogue load failed: %s", err)
            return self.async_abort(reason="catalogue_unavailable")

        options = await self._async_stop_options(catalogue)
        errors: dict[str, str] = {}

        if user_input is not None:
            raw = str(user_input.get(CONF_DIVA) or "").strip()
            station = trackable_station(catalogue, raw)
            if station is not None:
                # A suggestion was picked — its value is the DIVA.
                self._selected_station = station
                return await self.async_step_select_lines()

            # Anything else is free text the combo box let through: a
            # partial name, a typo, or a name typed out without opening
            # the suggestion list. Search the catalogue for it and offer the
            # hits as a shortlist.
            self._query = raw
            # Clamp pathologically long queries — `catalogue.search` does
            # an O(stations × len(query)) `casefold` substring scan per
            # call, so a misclick paste of, say, a 10 MB clipboard would
            # otherwise spin the event loop. 100 chars is comfortably
            # past any real Vienna stop name.
            if len(raw) < 2 or len(raw) > 100:
                errors[CONF_DIVA] = "query_too_short"
            else:
                self._matches = catalogue.search(raw)
                if not self._matches:
                    errors[CONF_DIVA] = "no_matches"
                elif len(self._matches) == 1:
                    # Unambiguous — the shortlist would be a one-item form
                    # asking the user to confirm what they already typed.
                    self._selected_station = self._matches[0]
                    return await self.async_step_select_lines()
                else:
                    return await self.async_step_select_stop()

        return self.async_show_form(
            step_id="stop",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_DIVA): SelectSelector(
                        SelectSelectorConfig(
                            options=options,
                            mode=SelectSelectorMode.DROPDOWN,
                            # The whole point: the field accepts typed text
                            # as well as a pick, so the user gets filtered
                            # suggestions while typing and the free-text
                            # fallback below can still resolve a partial
                            # name that matched nothing exactly.
                            custom_value=True,
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
    # Step 2 — select_stop: shortlist for text that matched no stop exactly
    # ------------------------------------------------------------------

    async def async_step_select_stop(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Let the user pick one station from the search hits.

        Only reached from the free-text branch of `async_step_stop` — a
        picked suggestion already carries its DIVA and skips straight to
        line selection.
        """
        errors: dict[str, str] = {}
        if user_input is not None:
            diva_str = user_input.get(CONF_DIVA)
            if diva_str == "__search_again__":
                return await self.async_step_stop()
            try:
                diva = int(diva_str) if diva_str is not None else None
            except ValueError as err:
                # Selector should only ever feed us numeric strings — a
                # non-numeric value here means the selector contract
                # changed (HA upgrade) or someone hand-edited the flow
                # state. DEBUG only since the user-visible behaviour
                # (invalid_stop error) is already correct.
                _LOGGER.debug("Failed to parse diva %r: %s", diva_str, err)
                diva = None
            station = next((s for s in self._matches if s.diva == diva), None)
            if station is None:
                errors[CONF_DIVA] = "invalid_stop"
            else:
                self._selected_station = station
                return await self.async_step_select_lines()

        options: list[SelectOptionDict] = [
            SelectOptionDict(
                value=str(s.diva),
                label=f"{s.name} ({s.municipality})",
            )
            for s in self._matches
        ]
        lang = self.hass.config.language
        search_again_label = _SEARCH_AGAIN_LABELS.get(lang, _SEARCH_AGAIN_LABELS["en"])
        options.append(
            SelectOptionDict(value="__search_again__", label=search_again_label)
        )

        return self.async_show_form(
            step_id="select_stop",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_DIVA): SelectSelector(
                        SelectSelectorConfig(
                            options=options,
                            mode=SelectSelectorMode.LIST,
                        )
                    )
                }
            ),
            errors=errors,
            description_placeholders={"query": self._query},
        )

    # ------------------------------------------------------------------
    # Step 3 — select_lines: line probes + checkbox selection
    # ------------------------------------------------------------------

    async def async_step_select_lines(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """List the lines at the chosen station and let the user pick.

        Live `/monitor` lines, merged with the catalogue's scheduled lines,
        plus the stop's S-Bahn lines from the timetable.
        """
        assert self._selected_station is not None
        station = self._selected_station
        errors: dict[str, str] = {}

        if not self._lines:
            try:
                catalogue = await async_get_catalogue(self.hass)
            except (TimeoutError, aiohttp.ClientError) as err:
                _LOGGER.warning("Static catalogue load failed: %s", err)
                catalogue = None
            if catalogue is not None:
                self._lines = await _resolve_lines_for_picker(
                    self.hass, catalogue, station
                )
                # Catalogue is healthy again — drop any prior Repairs
                # issue from a previous failed attempt so the user's
                # dashboard doesn't carry stale warnings forever.
                ir.async_delete_issue(self.hass, DOMAIN, "catalogue_unavailable")
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
                self._lines = await _probe_monitor_lines(self.hass, station.rbls)
            if self._lines:
                self._lines.extend(
                    await _s_bahn_picker_rows(
                        self.hass, station.diva, self._reconfigure_entry
                    )
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
            picked: list[str] = [str(x) for x in user_input.get(CONF_LINES, [])]
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
                label=_line_label(row, self.hass.config.language),
            )
            for row in self._lines
        ]
        # Default scan interval comes from the existing entry if reconfiguring,
        # otherwise the system default.
        existing = self._reconfigure_entry
        default_interval = (
            int(
                {**existing.data, **existing.options}.get(
                    CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
                )
            )
            if existing is not None
            else DEFAULT_SCAN_INTERVAL
        )
        # New entries start with nothing pre-selected — busy stops have
        # 20+ lines and users typically only want one or two, so opt-in
        # is the cheaper interaction. Reconfigure preserves whatever the
        # user had before, mapped onto the realtime spelling so a key
        # saved as "LB|H" still ticks the "WLB|H" option the picker now
        # offers — an unmapped key matches nothing and silently shows the
        # user an empty selection over their own configured lines.
        default_lines = (
            [
                canonical_line_key(str(k))
                for k in {**existing.data, **existing.options}.get(CONF_LINES, [])
            ]
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
    # Route — pick two stops, then how to plan between them
    # ------------------------------------------------------------------

    async def async_step_route(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick where a route starts and ends."""
        try:
            catalogue = await async_get_catalogue(self.hass)
        except (TimeoutError, aiohttp.ClientError) as err:
            _LOGGER.warning("Static catalogue load failed: %s", err)
            return self.async_abort(reason="catalogue_unavailable")

        options = await self._async_stop_options(catalogue)
        errors: dict[str, str] = {}
        if user_input is not None:
            origin = _resolve_route_stop(catalogue, user_input.get(CONF_ORIGIN_DIVA))
            destination = _resolve_route_stop(
                catalogue, user_input.get(CONF_DESTINATION_DIVA)
            )
            if origin is None:
                errors[CONF_ORIGIN_DIVA] = "route_stop_unresolved"
            if destination is None:
                errors[CONF_DESTINATION_DIVA] = "route_stop_unresolved"
            if origin is not None and destination is not None:
                if origin.diva == destination.diva:
                    errors["base"] = "same_stop"
                else:
                    await self.async_set_unique_id(
                        f"route_{origin.diva}_{destination.diva}"
                    )
                    self._abort_if_unique_id_configured(
                        reload_on_update=False, error="already_configured_route"
                    )
                    self._route_origin = (origin.diva, origin.name)
                    self._route_destination = (destination.diva, destination.name)
                    return await self.async_step_route_options()

        picker = SelectSelector(
            SelectSelectorConfig(
                options=options,
                mode=SelectSelectorMode.DROPDOWN,
                custom_value=True,
                sort=False,
            )
        )
        return self.async_show_form(
            step_id="route",
            data_schema=self.add_suggested_values_to_schema(
                vol.Schema(
                    {
                        vol.Required(CONF_ORIGIN_DIVA): picker,
                        vol.Required(CONF_DESTINATION_DIVA): picker,
                    }
                ),
                user_input or {},
            ),
            errors=errors,
        )

    async def async_step_route_options(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Choose how the route is planned and when it refreshes."""
        assert self._route_origin is not None
        assert self._route_destination is not None
        origin_diva, origin_name = self._route_origin
        destination_diva, destination_name = self._route_destination
        errors: dict[str, str] = {}

        if user_input is not None:
            active_from = user_input.get(CONF_ACTIVE_FROM)
            active_to = user_input.get(CONF_ACTIVE_TO)
            if bool(active_from) != bool(active_to):
                errors["base"] = "window_incomplete"
            else:
                data: dict[str, Any] = {
                    CONF_ENTRY_TYPE: ENTRY_TYPE_ROUTE,
                    CONF_ORIGIN_DIVA: origin_diva,
                    CONF_ORIGIN_NAME: origin_name,
                    CONF_DESTINATION_DIVA: destination_diva,
                    CONF_DESTINATION_NAME: destination_name,
                    CONF_ROUTE_TYPE: route_type_option(user_input.get(CONF_ROUTE_TYPE)),
                    CONF_MAX_CHANGES: str(
                        user_input.get(CONF_MAX_CHANGES, MAX_CHANGES_ANY)
                    ),
                    CONF_WALK_SPEED: str(
                        user_input.get(CONF_WALK_SPEED, DEFAULT_WALK_SPEED)
                    ),
                    CONF_MIN_TRANSFER_MINUTES: int(
                        user_input.get(
                            CONF_MIN_TRANSFER_MINUTES, DEFAULT_MIN_TRANSFER_MINUTES
                        )
                    ),
                    CONF_EXCLUDED_MEANS: [
                        str(x)
                        for x in user_input.get(CONF_EXCLUDED_MEANS, [])
                        if str(x) in EXCLUDABLE_MEANS
                    ],
                    CONF_STEP_FREE: bool(user_input.get(CONF_STEP_FREE, False)),
                    CONF_LEAVE_MINUTES: int(
                        user_input.get(CONF_LEAVE_MINUTES, DEFAULT_LEAVE_MINUTES)
                    ),
                    CONF_SCAN_INTERVAL: int(
                        user_input.get(CONF_SCAN_INTERVAL, DEFAULT_ROUTE_SCAN_INTERVAL)
                    ),
                    CONF_ACTIVE_DAYS: [
                        str(d)
                        for d in user_input.get(CONF_ACTIVE_DAYS, [])
                        if str(d) in WEEKDAYS
                    ],
                }
                if active_from and active_to:
                    data[CONF_ACTIVE_FROM] = str(active_from)
                    data[CONF_ACTIVE_TO] = str(active_to)
                error = await _probe_route(self.hass, data)
                if error is not None:
                    errors["base"] = error
                elif self._reconfigure_entry is not None:
                    return self.async_update_and_abort(
                        self._reconfigure_entry, data=data, options={}
                    )
                else:
                    return self.async_create_entry(
                        title=f"{origin_name} → {destination_name}", data=data
                    )

        existing: dict[str, Any] = (
            {**self._reconfigure_entry.data, **self._reconfigure_entry.options}
            if self._reconfigure_entry is not None
            else {}
        )
        defaults = {**existing, **(user_input or {})}
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_ROUTE_TYPE,
                    # Normalised so a route saved in upper case preselects
                    # its option on reconfigure.
                    default=route_type_option(defaults.get(CONF_ROUTE_TYPE)),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(ROUTE_TYPES),
                        translation_key=CONF_ROUTE_TYPE,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_MAX_CHANGES,
                    default=str(defaults.get(CONF_MAX_CHANGES, MAX_CHANGES_ANY)),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(MAX_CHANGES_CHOICES),
                        translation_key=CONF_MAX_CHANGES,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_WALK_SPEED,
                    default=defaults.get(CONF_WALK_SPEED, DEFAULT_WALK_SPEED),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(WALK_SPEEDS),
                        translation_key=CONF_WALK_SPEED,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_MIN_TRANSFER_MINUTES,
                    default=int(
                        defaults.get(
                            CONF_MIN_TRANSFER_MINUTES, DEFAULT_MIN_TRANSFER_MINUTES
                        )
                    ),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=0,
                        max=MAX_MIN_TRANSFER_MINUTES,
                        step=1,
                        unit_of_measurement="min",
                        mode=NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_EXCLUDED_MEANS,
                    default=list(defaults.get(CONF_EXCLUDED_MEANS, [])),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(EXCLUDABLE_MEANS),
                        translation_key=CONF_EXCLUDED_MEANS,
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                    )
                ),
                vol.Optional(
                    CONF_STEP_FREE,
                    default=defaults.get(CONF_STEP_FREE) is True,
                ): BooleanSelector(),
                vol.Required(
                    CONF_LEAVE_MINUTES,
                    default=int(
                        defaults.get(CONF_LEAVE_MINUTES, DEFAULT_LEAVE_MINUTES)
                    ),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=1,
                        max=MAX_LEAVE_MINUTES,
                        step=1,
                        unit_of_measurement="min",
                        mode=NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_ACTIVE_FROM,
                    description={"suggested_value": defaults.get(CONF_ACTIVE_FROM)},
                ): TimeSelector(),
                vol.Optional(
                    CONF_ACTIVE_TO,
                    description={"suggested_value": defaults.get(CONF_ACTIVE_TO)},
                ): TimeSelector(),
                vol.Optional(
                    CONF_ACTIVE_DAYS,
                    default=list(defaults.get(CONF_ACTIVE_DAYS, [])),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(WEEKDAYS),
                        translation_key="weekday",
                        multiple=True,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_SCAN_INTERVAL,
                    default=int(
                        defaults.get(CONF_SCAN_INTERVAL, DEFAULT_ROUTE_SCAN_INTERVAL)
                    ),
                ): _route_interval_selector(),
            }
        )
        return self.async_show_form(
            step_id="route_options",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "origin": origin_name,
                "destination": destination_name,
            },
        )

    # ------------------------------------------------------------------
    # Reconfigure
    # ------------------------------------------------------------------

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Re-enter line selection for a stop entry, or the options for a route."""
        entry = self._get_reconfigure_entry()
        self._reconfigure_entry = entry
        data = entry.data
        if data.get(CONF_ENTRY_TYPE) == ENTRY_TYPE_ROUTE:
            # The two ends are the entry's identity (its unique_id), so a
            # reconfigure changes how the route is planned, never where it
            # goes. A different route is a different entry.
            try:
                self._route_origin = (
                    int(data[CONF_ORIGIN_DIVA]),
                    str(data.get(CONF_ORIGIN_NAME) or data[CONF_ORIGIN_DIVA]),
                )
                self._route_destination = (
                    int(data[CONF_DESTINATION_DIVA]),
                    str(data.get(CONF_DESTINATION_NAME) or data[CONF_DESTINATION_DIVA]),
                )
            except (KeyError, TypeError, ValueError):
                return self.async_abort(reason="stop_gone")
            return await self.async_step_route_options(user_input)

        try:
            catalogue = await async_get_catalogue(self.hass)
        except (TimeoutError, aiohttp.ClientError) as err:
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
        is_route = config.get(CONF_ENTRY_TYPE) == ENTRY_TYPE_ROUTE
        fallback = DEFAULT_ROUTE_SCAN_INTERVAL if is_route else DEFAULT_SCAN_INTERVAL
        if user_input is not None:
            interval = int(user_input.get(CONF_SCAN_INTERVAL, fallback))
            return self.async_create_entry(data={CONF_SCAN_INTERVAL: interval})

        default_interval = int(config.get(CONF_SCAN_INTERVAL, fallback))
        selector = (
            _route_interval_selector()
            if is_route
            else NumberSelector(
                NumberSelectorConfig(
                    min=MIN_POLL_SECONDS,
                    max=MAX_POLL_SECONDS,
                    step=5,
                    unit_of_measurement="s",
                    mode=NumberSelectorMode.BOX,
                )
            )
        )
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {vol.Required(CONF_SCAN_INTERVAL, default=default_interval): selector}
            ),
        )


async def _s_bahn_picker_rows(
    hass: HomeAssistant, diva: int, existing: ConfigEntry | None
) -> list[dict[str, str]]:
    """The S-Bahn lines at a stop, for the picker, from the timetable.

    On reconfigure, S-Bahn lines the entry already tracks are kept as
    options even when the probe fails or doesn't see them right now:
    a selected value missing from the options would be dropped from the
    user's selection without a word.
    """
    rows = await async_probe_picker_rows(hass, diva)
    if existing is None:
        return rows
    offered = {row["key"] for row in rows}
    for key in {**existing.data, **existing.options}.get(CONF_LINES, []):
        line, _, direction = str(key).partition("|")
        direction = direction.split("|", 1)[0]
        if is_s_bahn_label(line) and direction and f"{line}|{direction}" not in offered:
            offered.add(f"{line}|{direction}")
            rows.append(
                {
                    "key": f"{line}|{direction}",
                    "line": line,
                    "towards": "",
                    "direction": direction,
                    "type": LINE_TYPE_S_BAHN,
                }
            )
    return rows


def _line_label(row: dict[str, str], language: str) -> str:
    """Render a line selection label: 'U1 → Leopoldau'.

    S-Bahn rows add that they carry planned times only, and one kept for
    a reconfigure without a known terminus shows its direction code.
    """
    towards = row["towards"] or row["direction"]
    label = f"{row['line']} → {towards}"
    if row.get("type") == LINE_TYPE_S_BAHN:
        suffix = _TIMETABLE_SUFFIXES.get(language, _TIMETABLE_SUFFIXES["en"])
        label = f"{label} ({suffix})"
    return label


def _route_interval_selector() -> NumberSelector:
    """Scan-interval field for a route entry (its own, slower range)."""
    return NumberSelector(
        NumberSelectorConfig(
            min=MIN_ROUTE_POLL_SECONDS,
            max=MAX_ROUTE_POLL_SECONDS,
            step=30,
            unit_of_measurement="s",
            mode=NumberSelectorMode.BOX,
        )
    )


def _resolve_route_stop(catalogue: StaticCatalogue, value: Any) -> Station | None:
    """A picked suggestion, or typed text that matches exactly one stop.

    Unlike the stop flow there is no shortlist step to fall back on — a
    route form has two fields, and bouncing through a shortlist for
    either would lose the other — so ambiguous text is an error that asks
    the user to pick from the suggestions instead.
    """
    station = trackable_station(catalogue, value)
    if station is not None:
        return station
    text = str(value or "").strip()
    if not 2 <= len(text) <= 100:
        return None
    matches = catalogue.search(text)
    return matches[0] if len(matches) == 1 else None


async def _probe_route(hass: HomeAssistant, data: dict[str, Any]) -> str | None:
    """Plan the route once before saving; return a form error key or None.

    Test-before-configure for a route: catches a pair the routing service
    refuses (too close together, a stop it does not know) while the user
    can still change it. "No connection right now" is accepted — at 02:00
    that is the honest answer for most routes, not a broken one.

    Like the line probe, this skips the routing cooldown on purpose:
    someone is watching the dialog.
    """
    options = RouteOptions.from_config(
        int(data[CONF_ORIGIN_DIVA]), int(data[CONF_DESTINATION_DIVA]), data
    )
    zone = await async_routing_zone()
    try:
        await async_plan_trips(hass, options, dt_util.utcnow(), zone)
    except RoutingError as err:
        if err.translation_key == "route_no_connection":
            return None
        if err.translation_key in ROUTE_STOP_ERRORS:
            return err.translation_key
        _LOGGER.warning(
            "Route probe failed: %s %s", err.translation_key, err.placeholders
        )
        return "cannot_connect_routing"
    return None
