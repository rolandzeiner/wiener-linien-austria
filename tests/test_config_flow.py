"""Tests for the Wiener Linien Austria config flow."""
from __future__ import annotations

from unittest.mock import AsyncMock, patch

from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_SEARCH_QUERY,
    CONF_STOP_NAME,
    DOMAIN,
)


async def test_search_too_short_shows_error(hass: HomeAssistant) -> None:
    """A query shorter than 2 characters is rejected client-side."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "a"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"][CONF_SEARCH_QUERY] == "query_too_short"


async def test_search_no_matches(hass: HomeAssistant) -> None:
    """Queries that match no known station show `no_matches`."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "XYZ-nope"}
    )
    assert result["errors"][CONF_SEARCH_QUERY] == "no_matches"


async def test_full_flow_creates_entry(hass: HomeAssistant, mock_fetch) -> None:
    """Search → pick stop → pick lines → entry created with correct data."""
    # Step 1: search
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_stop"

    # Step 2: pick Stephansplatz
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_lines"

    # Step 3: accept defaults
    lines_default = [
        f"{name}|H|Leopoldau" if towards == "Leopoldau" else f"{name}|R|Alaudagasse"
        for name, towards in [("U1", "Leopoldau"), ("U1", "Alaudagasse")]
    ]
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_LINES: lines_default, CONF_SCAN_INTERVAL: 60},
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["title"] == "Stephansplatz"
    assert result["data"][CONF_DIVA] == 60201012
    assert result["data"][CONF_STOP_NAME] == "Stephansplatz"
    assert result["data"][CONF_RBLS] == [4111, 4118]
    assert set(result["data"][CONF_LINES]) == set(lines_default)


async def test_duplicate_entry_aborted(hass: HomeAssistant, mock_fetch) -> None:
    """A second entry for the same DIVA is aborted on unique_id."""
    for _ in range(2):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_DIVA: "60201012"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {
                CONF_LINES: ["U1|H|Leopoldau", "U1|R|Alaudagasse"],
                CONF_SCAN_INTERVAL: 60,
            },
        )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_empty_line_selection_rejected(hass: HomeAssistant, mock_fetch) -> None:
    """Submitting the lines step with no lines selected shows `no_lines`."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_LINES: [], CONF_SCAN_INTERVAL: 60}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"][CONF_LINES] == "no_lines"


async def test_cannot_connect_during_probe(hass: HomeAssistant) -> None:
    """Live /monitor probe failure surfaces cannot_connect."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    with patch(
        "custom_components.wiener_linien_austria.config_flow._probe_monitor_lines",
        new_callable=AsyncMock,
        return_value=[],
    ):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_DIVA: "60201012"}
        )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"]["base"] == "cannot_connect"


async def test_reconfigure_preserves_unique_id(hass: HomeAssistant, mock_fetch) -> None:
    """Reconfigure updates data, keeps unique_id + entity identity stable."""
    # Create an entry first
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_LINES: ["U1|H|Leopoldau", "U1|R|Alaudagasse"],
            CONF_SCAN_INTERVAL: 60,
        },
    )
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    original_unique_id = entry.unique_id

    flow = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={
            "source": config_entries.SOURCE_RECONFIGURE,
            "entry_id": entry.entry_id,
        },
    )
    # reconfigure jumps straight to select_lines
    assert flow["step_id"] == "select_lines"
    result = await hass.config_entries.flow.async_configure(
        flow["flow_id"],
        {CONF_LINES: ["U1|H|Leopoldau"], CONF_SCAN_INTERVAL: 120},
    )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"

    refreshed = hass.config_entries.async_get_entry(entry.entry_id)
    assert refreshed is not None
    assert refreshed.unique_id == original_unique_id
    assert refreshed.data[CONF_LINES] == ["U1|H|Leopoldau"]
    assert refreshed.data[CONF_SCAN_INTERVAL] == 120


async def test_options_flow_updates_interval(hass: HomeAssistant, mock_fetch) -> None:
    """Options flow changes only the scan interval."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_LINES: ["U1|H|Leopoldau", "U1|R|Alaudagasse"],
            CONF_SCAN_INTERVAL: 60,
        },
    )
    entry = hass.config_entries.async_entries(DOMAIN)[0]

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {CONF_SCAN_INTERVAL: 180}
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert entry.options[CONF_SCAN_INTERVAL] == 180
