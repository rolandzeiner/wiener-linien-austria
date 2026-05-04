"""Tests for the Wiener Linien Austria config flow."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp

from tests.conftest import make_response_cm
from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.wiener_linien_austria.config_flow import (
    _probe_monitor_lines,
    _resolve_lines_for_picker,
    _static_lines_for_station,
)
from custom_components.wiener_linien_austria.static import (
    Station,
    StaticCatalogue,
    TripPattern,
    TripPatternIndex,
)
from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_SEARCH_QUERY,
    CONF_STOP_NAME,
    DOMAIN,
)

DEFAULT_LINES = ["U1|H", "U1|R"]


async def _complete_flow(
    hass: HomeAssistant,
    *,
    query: str = "Stephans",
    diva: str = "60201012",
    lines: list[str] | None = None,
    scan_interval: int = 60,
) -> dict:
    """Walk the 3-step flow end-to-end and return the final result.

    Used by tests that only care about the *outcome* of a successful flow;
    tests that assert intermediate step transitions (step_id/type checks)
    stay in-line so those assertions remain readable.
    """
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: query}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: diva}
    )
    return await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_LINES: lines if lines is not None else list(DEFAULT_LINES),
            CONF_SCAN_INTERVAL: scan_interval,
        },
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

    # Step 3: accept defaults — config flow now writes (line, direction)
    # pair keys, not (line, direction, towards) triples.
    lines_default = ["U1|H", "U1|R"]
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
    result = await _complete_flow(hass)
    assert result["type"] == FlowResultType.CREATE_ENTRY
    result = await _complete_flow(hass)
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
    await _complete_flow(hass)
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
        {CONF_LINES: ["U1|H"], CONF_SCAN_INTERVAL: 120},
    )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"

    refreshed = hass.config_entries.async_get_entry(entry.entry_id)
    assert refreshed is not None
    assert refreshed.unique_id == original_unique_id
    assert refreshed.data[CONF_LINES] == ["U1|H"]
    assert refreshed.data[CONF_SCAN_INTERVAL] == 120


async def test_options_flow_updates_interval(hass: HomeAssistant, mock_fetch) -> None:
    """Options flow changes only the scan interval."""
    await _complete_flow(hass)
    entry = hass.config_entries.async_entries(DOMAIN)[0]

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {CONF_SCAN_INTERVAL: 180}
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert entry.options[CONF_SCAN_INTERVAL] == 180


async def test_catalogue_unavailable_during_search(hass: HomeAssistant) -> None:
    """If the static catalogue can't be loaded, user step surfaces an error."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("upstream down"),
    ):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
        )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"]["base"] == "catalogue_unavailable"


async def test_search_again_returns_to_user_step(hass: HomeAssistant) -> None:
    """Picking the `__search_again__` sentinel on select_stop reopens search."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    assert result["step_id"] == "select_stop"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "__search_again__"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "user"


async def test_reconfigure_aborts_when_catalogue_unavailable(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Reconfigure with a failing catalogue load aborts with a clear reason."""
    await _complete_flow(hass)
    entry = hass.config_entries.async_entries(DOMAIN)[0]

    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("upstream down"),
    ):
        result = await hass.config_entries.flow.async_init(
            DOMAIN,
            context={
                "source": config_entries.SOURCE_RECONFIGURE,
                "entry_id": entry.entry_id,
            },
        )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "catalogue_unavailable"


async def test_probe_monitor_lines_dedupes_and_sorts(hass: HomeAssistant) -> None:
    """Multi-RBL responses with overlapping (line, direction) collapse to one row.

    The probe is the source of truth for the line-selection step. Wiener Linien
    sometimes returns the same line twice across RBLs (e.g. inbound + outbound
    platforms both list the connecting U-Bahn) and may also list the same
    (line, direction) under different `towards` termini on branching lines.
    The probe must dedupe by `(line, direction)` — the towards segment is
    label-only, not part of the saved key.
    """
    body = {
        "message": {"messageCode": 1},
        "data": {
            "monitors": [
                {
                    "lines": [
                        {"name": "U1", "direction": "H", "towards": "Leopoldau", "type": "ptMetro"},
                        {"name": "U1", "direction": "H", "towards": "Leopoldau", "type": "ptMetro"},  # dup
                    ]
                },
                {
                    "lines": [
                        {"name": "U1", "direction": "R", "towards": "Alaudagasse", "type": "ptMetro"},
                        # Empty towards must be dropped, not crash.
                        {"name": "U1", "direction": "H", "towards": "", "type": "ptMetro"},
                        # Empty name must be dropped.
                        {"name": "", "direction": "H", "towards": "X", "type": "ptMetro"},
                    ]
                },
            ]
        },
    }
    resp = MagicMock()
    resp.status = 200
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    session = MagicMock()
    session.get = MagicMock(return_value=make_response_cm(resp))

    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_clientsession",
        return_value=session,
    ):
        rows = await _probe_monitor_lines(hass, [4111, 4118])

    # Two unique (line, direction) pairs, sorted by (line, towards label).
    # "Alaudagasse" sorts before "Leopoldau" so U1|R comes first.
    assert [r["key"] for r in rows] == ["U1|R", "U1|H"]


async def test_reconfigure_aborts_when_stop_removed_from_catalogue(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Reconfigure aborts with `stop_gone` if the DIVA vanished upstream."""
    from custom_components.wiener_linien_austria.static import StaticCatalogue

    await _complete_flow(hass)
    entry = hass.config_entries.async_entries(DOMAIN)[0]

    empty = StaticCatalogue(stations_by_diva={}, last_fetched="t")
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        return_value=empty,
    ):
        result = await hass.config_entries.flow.async_init(
            DOMAIN,
            context={
                "source": config_entries.SOURCE_RECONFIGURE,
                "entry_id": entry.entry_id,
            },
        )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "stop_gone"


# ---------------------------------------------------------------------------
# Static-catalogue / merged line picker (off-service line visibility)
# ---------------------------------------------------------------------------


def _u1_catalogue() -> tuple[StaticCatalogue, Station]:
    """Tiny catalogue with U1 in both directions for static-line tests.

    Mirrors the conftest fixture's branching-terminus shape but local
    so this test file doesn't depend on the autouse mock_static_catalogue
    swap-in path.
    """
    taubstummengasse = Station(
        diva=60201468,
        name="Taubstummengasse",
        municipality="Wien",
        longitude=16.3711,
        latitude=48.1953,
        rbls=[90011, 90012],
    )
    leopoldau = Station(
        diva=60201470,
        name="Leopoldau",
        municipality="Wien",
        longitude=16.4660,
        latitude=48.2613,
        rbls=[90015],
    )
    oberlaa = Station(
        diva=60201471,
        name="Oberlaa",
        municipality="Wien",
        longitude=16.4019,
        latitude=48.1646,
        rbls=[90016],
    )
    trip_patterns = TripPatternIndex(
        patterns_by_line={
            1: [
                TripPattern(line_id=1, pattern_id=101, direction=1, stops=(90011, 90015)),
                TripPattern(line_id=1, pattern_id=102, direction=2, stops=(90012, 90016)),
            ],
        },
        lines_by_label={"U1": 1},
        means_by_line={1: "ptMetro"},
        lines_at_diva={60201468: ("U1",), 60201470: ("U1",), 60201471: ("U1",)},
    )
    catalogue = StaticCatalogue(
        stations_by_diva={
            60201468: taubstummengasse,
            60201470: leopoldau,
            60201471: oberlaa,
        },
        last_fetched="t",
        trip_patterns=trip_patterns,
    )
    return catalogue, taubstummengasse


def test_static_lines_for_station_returns_both_directions() -> None:
    """Off-service U1 visible from the static catalogue alone."""
    catalogue, station = _u1_catalogue()
    rows = _static_lines_for_station(catalogue, station)
    assert {r["key"] for r in rows} == {"U1|H", "U1|R"}
    h = next(r for r in rows if r["key"] == "U1|H")
    r = next(r for r in rows if r["key"] == "U1|R")
    assert h["towards"] == "Leopoldau"
    assert r["towards"] == "Oberlaa"
    assert h["type"] == "ptMetro"


def test_static_lines_for_station_empty_when_no_trip_patterns() -> None:
    """Catalogue without a trip-pattern index yields an empty list."""
    catalogue, station = _u1_catalogue()
    catalogue_no_idx = StaticCatalogue(
        stations_by_diva=catalogue.stations_by_diva,
        last_fetched="t",
        trip_patterns=None,
    )
    assert _static_lines_for_station(catalogue_no_idx, station) == []


def test_static_lines_for_station_empty_when_diva_not_in_index() -> None:
    """Stations missing from `lines_at_diva` produce no rows."""
    catalogue, _ = _u1_catalogue()
    orphan = Station(
        diva=99999,
        name="Nowhere",
        municipality="Wien",
        longitude=0.0,
        latitude=0.0,
        rbls=[],
    )
    assert _static_lines_for_station(catalogue, orphan) == []


async def test_resolve_lines_for_picker_merges_live_and_static(
    hass: HomeAssistant,
) -> None:
    """Merge keeps live entries (accurate towards) and adds static-only ones."""
    catalogue, station = _u1_catalogue()

    # Live response covers only U1|H — U1|R is "off service" right now.
    body = {
        "message": {"messageCode": 1},
        "data": {
            "monitors": [
                {
                    "lines": [
                        {
                            "name": "U1",
                            "direction": "H",
                            "towards": "Leopoldau",
                            "type": "ptMetro",
                        },
                    ]
                },
            ]
        },
    }
    resp = MagicMock()
    resp.status = 200
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    session = MagicMock()
    session.get = MagicMock(return_value=make_response_cm(resp))
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_clientsession",
        return_value=session,
    ):
        rows = await _resolve_lines_for_picker(hass, catalogue, station)

    keys = {r["key"] for r in rows}
    assert keys == {"U1|H", "U1|R"}
    # U1|H came from the live row, U1|R from static — both present.


async def test_resolve_lines_for_picker_falls_back_to_live_only(
    hass: HomeAssistant,
) -> None:
    """When the catalogue has no trip-pattern index, return the live list verbatim."""
    catalogue, station = _u1_catalogue()
    catalogue_no_idx = StaticCatalogue(
        stations_by_diva=catalogue.stations_by_diva,
        last_fetched="t",
        trip_patterns=None,
    )
    body = {
        "message": {"messageCode": 1},
        "data": {
            "monitors": [
                {
                    "lines": [
                        {
                            "name": "U1",
                            "direction": "H",
                            "towards": "Leopoldau",
                            "type": "ptMetro",
                        },
                    ]
                },
            ]
        },
    }
    resp = MagicMock()
    resp.status = 200
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    session = MagicMock()
    session.get = MagicMock(return_value=make_response_cm(resp))
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_clientsession",
        return_value=session,
    ):
        rows = await _resolve_lines_for_picker(hass, catalogue_no_idx, station)

    assert {r["key"] for r in rows} == {"U1|H"}


def test_static_catalogue_index_by_rbl_caches() -> None:
    """index_by_rbl builds once and re-uses the cached dict."""
    catalogue, station = _u1_catalogue()
    first = catalogue.index_by_rbl()
    second = catalogue.index_by_rbl()
    assert first is second
    # 90011 belongs to Taubstummengasse, 90015 to Leopoldau.
    assert first[90011] == (station.diva, "Taubstummengasse")
    assert first[90015] == (60201470, "Leopoldau")
    assert 99999 not in first

