"""Config flow for Wiener Linien Austria."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
)

from .const import (
    CONF_API_KEY,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
)
from homeassistant.const import CONF_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)


async def _test_api_connection(hass: HomeAssistant, api_key: str) -> bool:
    """Return True if the upstream API is reachable with the given credentials.

    Replace with a real trial call for your integration. Return False on any
    failure so the config flow surfaces a cannot_connect error to the UI.
    """
    session = async_get_clientsession(hass)
    _ = session  # TODO: actually probe the API here.
    return bool(api_key)


def _build_schema(defaults: dict[str, Any], include_name: bool = False) -> vol.Schema:
    """Build the shared config/options form schema."""
    fields: dict[Any, Any] = {}
    if include_name:
        fields[vol.Required("name", default=defaults.get("name", "Wiener Linien Austria"))] = (
            TextSelector()
        )
    fields[vol.Required(CONF_API_KEY, default=defaults.get(CONF_API_KEY, ""))] = (
        TextSelector()
    )
    fields[
        vol.Required(
            CONF_SCAN_INTERVAL,
            default=defaults.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
        )
    ] = NumberSelector(
        NumberSelectorConfig(
            min=5,
            max=720,
            step=5,
            unit_of_measurement="min",
            mode=NumberSelectorMode.BOX,
        )
    )
    return vol.Schema(fields)


def _validate_user_input(
    user_input: dict[str, Any],
) -> tuple[str, dict[str, str]]:
    """Extract + validate required fields. Returns (api_key, errors)."""
    errors: dict[str, str] = {}
    api_key = user_input.get(CONF_API_KEY, "").strip()
    if not api_key:
        errors[CONF_API_KEY] = "invalid_api_key"
    return api_key, errors


def _build_entry_data(user_input: dict[str, Any], api_key: str) -> dict[str, Any]:
    """Pack validated input into ConfigEntry.data shape."""
    return {
        CONF_API_KEY: api_key,
        CONF_SCAN_INTERVAL: user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
    }


def _compute_unique_id(api_key: str) -> str:
    """Stable unique_id formula. NEVER CHANGE THIS after v0.1.0 — existing
    installs are keyed by it and would be wiped.

    If the upstream has a stable account ID, prefer that. Hashing the API key
    avoids leaking it but still produces a stable key per account.
    """
    return f"apikey_{hash(api_key) & 0xFFFFFFFF:x}"


class WienerLinienAustriaConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Wiener Linien Austria."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> WienerLinienAustriaOptionsFlow:
        """Return the options flow handler."""
        return WienerLinienAustriaOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            api_key, errors = _validate_user_input(user_input)
            if not errors:
                if not await _test_api_connection(self.hass, api_key):
                    errors["base"] = "cannot_connect"
                else:
                    await self.async_set_unique_id(_compute_unique_id(api_key))
                    self._abort_if_unique_id_configured()
                    title = user_input.get("name", "Wiener Linien Austria")
                    return self.async_create_entry(
                        title=title,
                        data=_build_entry_data(user_input, api_key),
                    )

        defaults: dict[str, Any] = {"name": "Wiener Linien Austria"}
        return self.async_show_form(
            step_id="user",
            data_schema=_build_schema(defaults, include_name=True),
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle reconfiguration of an existing entry.

        Lets the user change API credentials or the scan interval without
        deleting the entry — entity unique_ids are preserved.
        """
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            api_key, errors = _validate_user_input(user_input)
            if not errors:
                if not await _test_api_connection(self.hass, api_key):
                    errors["base"] = "cannot_connect"
                else:
                    await self.async_set_unique_id(_compute_unique_id(api_key))
                    self._abort_if_unique_id_mismatch()
                    return self.async_update_reload_and_abort(
                        entry,
                        data=_build_entry_data(user_input, api_key),
                    )

        current = {**entry.data, **entry.options}
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_build_schema(current),
            errors=errors,
        )


class WienerLinienAustriaOptionsFlow(OptionsFlow):
    """Handle options for Wiener Linien Austria."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle options."""
        errors: dict[str, str] = {}
        config = {**self.config_entry.data, **self.config_entry.options}
        if user_input is not None:
            api_key, errors = _validate_user_input(user_input)
            if not errors:
                if not await _test_api_connection(self.hass, api_key):
                    errors["base"] = "cannot_connect"
                else:
                    return self.async_create_entry(
                        data=_build_entry_data(user_input, api_key)
                    )
        return self.async_show_form(
            step_id="init",
            data_schema=_build_schema(config),
            errors=errors,
        )
