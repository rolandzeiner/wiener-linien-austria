"""Config flow for Wiener Linien Austria.

Three-step flow:
  1. `user`           — user types a stop-name fragment.
  2. `select_stop`    — dropdown of matching stations from the static catalogue.
  3. `select_lines`   — live `/monitor` call with the station's RBLs; each
                        returned line × direction is presented as a pre-checked
                        option. Submitting saves the entry.
`async_step_reconfigure` re-enters `select_lines` for an existing entry,
preserving unique_id. Options flow tweaks the scan interval only.
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
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

from .const import (
    API_BASE_URL,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_SEARCH_QUERY,
    CONF_STOP_NAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_POLL_SECONDS,
    MIN_POLL_SECONDS,
    MONITOR_ENDPOINT,
    USER_AGENT,
)
from .static import Station, async_load_catalogue

_LOGGER = logging.getLogger(__name__)

# SelectOptionDict labels bypass HA's selector translation system, so we
# pick the right locale at runtime. English is the fallback for anything
# not explicitly listed.
_SEARCH_AGAIN_LABELS: dict[str, str] = {
    "en": "↩ Search again",
    "de": "↩ Erneut suchen",
}


def _line_key(line: str, direction: str, towards: str) -> str:
    """Stable identifier for a (line, direction, towards) triple.

    Mirrors the coordinator's `_line_key` — keep them in sync.
    """
    return f"{line}|{direction}|{towards}"


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
        resp = await session.get(
            url,
            params=params,
            headers={"User-Agent": USER_AGENT},
            timeout=aiohttp.ClientTimeout(total=10),
        )
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
            key = _line_key(name, direction, towards)
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


class WienerLinienAustriaConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a multi-step config flow for Wiener Linien Austria."""

    VERSION = 1

    def __init__(self) -> None:
        """Init in-flight selections."""
        self._query: str = ""
        self._matches: list[Station] = []
        self._selected_station: Station | None = None
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
    # Step 1 — user: search query
    # ------------------------------------------------------------------

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Prompt for a stop-name fragment."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self._query = str(user_input.get(CONF_SEARCH_QUERY, "")).strip()
            if len(self._query) < 2:
                errors[CONF_SEARCH_QUERY] = "query_too_short"
            else:
                try:
                    catalogue = await async_load_catalogue(self.hass)
                except (aiohttp.ClientError, asyncio.TimeoutError) as err:
                    _LOGGER.warning("Static catalogue load failed: %s", err)
                    errors["base"] = "catalogue_unavailable"
                else:
                    self._matches = catalogue.search(self._query)
                    if not self._matches:
                        errors[CONF_SEARCH_QUERY] = "no_matches"
                    else:
                        return await self.async_step_select_stop()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SEARCH_QUERY, default=self._query): TextSelector()
                }
            ),
            errors=errors,
        )

    # ------------------------------------------------------------------
    # Step 2 — select_stop: dropdown of matches
    # ------------------------------------------------------------------

    async def async_step_select_stop(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Let the user pick one station from the search hits."""
        errors: dict[str, str] = {}
        if user_input is not None:
            diva_str = user_input.get(CONF_DIVA)
            if diva_str == "__search_again__":
                return await self.async_step_user()
            try:
                diva = int(diva_str) if diva_str is not None else None
            except ValueError:
                diva = None
            station = next(
                (s for s in self._matches if s.diva == diva), None
            )
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
        search_again_label = _SEARCH_AGAIN_LABELS.get(
            lang, _SEARCH_AGAIN_LABELS["en"]
        )
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
            self._lines = await _probe_monitor_lines(self.hass, station.rbls)
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
                    return self.async_update_reload_and_abort(
                        self._reconfigure_entry,
                        data=data,
                    )
                await self.async_set_unique_id(f"diva_{station.diva}")
                self._abort_if_unique_id_configured()
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
            catalogue = await async_load_catalogue(self.hass)
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            _LOGGER.warning("Static catalogue load failed on reconfigure: %s", err)
            return self.async_abort(reason="catalogue_unavailable")

        diva = int(data[CONF_DIVA])
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
