"""Tests for the Wiener Linien Austria config flow."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest

from tests.conftest import make_response_cm
from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType, InvalidData

from custom_components.wiener_linien_austria.config_flow import (
    WienerLinienAustriaConfigFlow,
    _format_distance,
    _nearest_stations,
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
    CONF_NEARBY_STOP,
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


# ---------------------------------------------------------------------------
# Repairs issue surfacing when the catalogue load fails inside select_lines.
# The pre-fix fallback was silent — picker just lost any off-service lines
# (nightlines during the day) with no user-visible signal.
# ---------------------------------------------------------------------------


async def test_select_lines_raises_repairs_issue_when_catalogue_fails(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Catalogue failure during select_lines must create a Repairs issue."""
    from homeassistant.helpers import issue_registry as ir

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    assert result["step_id"] == "select_stop"

    # Override the autouse-success patch for the select_lines call only.
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("OGD endpoint down"),
    ):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_DIVA: "60201012"}
        )

    # Flow still progresses to select_lines — the degraded picker is
    # better than blocking entirely on a transient OGD outage.
    assert result["step_id"] == "select_lines"

    issue = ir.async_get(hass).async_get_issue(DOMAIN, "catalogue_unavailable")
    assert issue is not None
    assert issue.translation_key == "catalogue_unavailable"
    assert issue.severity == ir.IssueSeverity.WARNING


async def test_select_lines_clears_repairs_issue_on_recovery(
    hass: HomeAssistant, mock_fetch
) -> None:
    """A successful catalogue load clears any prior catalogue_unavailable issue."""
    from homeassistant.helpers import issue_registry as ir

    # Pre-seed the issue as if a previous attempt failed.
    ir.async_create_issue(
        hass,
        DOMAIN,
        "catalogue_unavailable",
        is_fixable=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key="catalogue_unavailable",
    )
    assert (
        ir.async_get(hass).async_get_issue(DOMAIN, "catalogue_unavailable")
        is not None
    )

    # Run the flow normally — the autouse mock_static_catalogue fixture
    # makes async_get_catalogue succeed, so the issue should be cleared.
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    assert result["step_id"] == "select_lines"

    assert (
        ir.async_get(hass).async_get_issue(DOMAIN, "catalogue_unavailable")
        is None
    )



# ----------------------------------------------------------------------
# Nearby-stop suggestions on the `user` step
# ----------------------------------------------------------------------

# Right on top of the fixture's Stephansplatz (48.2085/16.3726). At this
# origin the sample catalogue yields exactly three stops inside the 2 km
# radius — Stephansplatz (~70 m), Schwarzenbergplatz (~850 m) and
# Taubstummengasse (~1.4 km) — while Leopoldau / Oberlaa / Alaudagasse
# sit several kilometres out and must be filtered away.
HOME_LATITUDE = 48.2080
HOME_LONGITUDE = 16.3720


def _set_home(hass: HomeAssistant, latitude: float, longitude: float) -> None:
    """Point the HA home location at the given coordinates."""
    hass.config.latitude = latitude
    hass.config.longitude = longitude


def _schema_keys(result: dict) -> list[str]:
    """Field names present in a form result's schema, in order."""
    return [str(key) for key in result["data_schema"].schema]


def _nearby_options(result: dict) -> list[dict]:
    """The SelectOptionDicts offered by the nearby-stop field."""
    for key, validator in result["data_schema"].schema.items():
        if str(key) == CONF_NEARBY_STOP:
            options = validator.config["options"]
            assert isinstance(options, list)
            return options
    raise AssertionError(f"{CONF_NEARBY_STOP} not in schema: {_schema_keys(result)}")


async def test_nearby_suggestions_sorted_by_distance(hass: HomeAssistant) -> None:
    """With a home location inside Vienna, the user step offers nearby stops."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["step_id"] == "user"
    # Suggestions come first, search box stays available underneath.
    assert _schema_keys(result) == [CONF_NEARBY_STOP, CONF_SEARCH_QUERY]

    options = _nearby_options(result)
    assert [o["value"] for o in options] == ["60201012", "60200123", "60201468"]
    # Distance is part of the label so the list is scannable without a map.
    assert options[0]["label"].startswith("Stephansplatz (Wien) — ")
    assert options[0]["label"].endswith(" m")
    assert options[2]["label"].endswith(" km")
    # Stops beyond the 2 km radius are dropped entirely.
    assert "60201470" not in [o["value"] for o in options]


async def test_nearby_pick_skips_the_search_steps(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Picking a suggestion jumps straight to line selection and saves."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_NEARBY_STOP: "60201012"}
    )
    # No `select_stop` in between — the suggestion already is the station.
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_lines"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_LINES: list(DEFAULT_LINES), CONF_SCAN_INTERVAL: 60},
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["title"] == "Stephansplatz"
    assert result["data"][CONF_DIVA] == 60201012
    assert result["data"][CONF_RBLS] == [4111, 4118]
    assert result["result"].unique_id == "diva_60201012"


async def test_search_still_works_when_suggestions_are_shown(
    hass: HomeAssistant,
) -> None:
    """Leaving the dropdown empty and typing a name keeps the old path."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "Leopoldau"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_stop"


async def test_submitting_nothing_with_suggestions_shown(
    hass: HomeAssistant,
) -> None:
    """Neither field filled is a distinct error, not `query_too_short`."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["step_id"] == "user"
    assert result["errors"]["base"] == "no_selection"
    # The form still offers the suggestions after the error.
    assert _schema_keys(result) == [CONF_NEARBY_STOP, CONF_SEARCH_QUERY]


async def test_unknown_nearby_diva_rejected_by_selector(
    hass: HomeAssistant,
) -> None:
    """The SelectSelector is the first line of defence for an unlisted DIVA."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    with pytest.raises(InvalidData):
        await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_NEARBY_STOP: "60201470"}  # 5 km away
        )


async def test_unknown_nearby_diva_rejected_by_handler(
    hass: HomeAssistant,
) -> None:
    """And the handler refuses it too, driven past the selector directly.

    Guards the case where the selector contract changes under us (an HA
    upgrade, or a future non-dropdown rendering of the same step) — the
    step must still refuse a DIVA it never offered rather than reaching
    into the catalogue for an arbitrary stop.
    """
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    flow = WienerLinienAustriaConfigFlow()
    flow.hass = hass
    flow.flow_id = "test"
    flow.handler = DOMAIN

    result = await flow.async_step_user({CONF_NEARBY_STOP: "60201470"})
    assert result["step_id"] == "user"
    assert result["errors"][CONF_NEARBY_STOP] == "invalid_stop"


async def test_no_suggestions_when_home_location_unset(hass: HomeAssistant) -> None:
    """A never-onboarded 0/0 home location falls back to search-only."""
    _set_home(hass, 0.0, 0.0)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert _schema_keys(result) == [CONF_SEARCH_QUERY]

    # And the search box is still Required, so an empty submit reports the
    # pre-existing error rather than the new `no_selection` one.
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["errors"][CONF_SEARCH_QUERY] == "query_too_short"


async def test_no_suggestions_when_home_is_outside_vienna(
    hass: HomeAssistant,
) -> None:
    """No stop within the radius means the form is the old search-only one."""
    _set_home(hass, 47.0707, 15.4395)  # Graz — 145 km from any sample stop

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert _schema_keys(result) == [CONF_SEARCH_QUERY]


async def test_suggestions_survive_catalogue_outage(hass: HomeAssistant) -> None:
    """A catalogue failure degrades to search-only instead of blocking the form."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("boom"),
    ):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        assert _schema_keys(result) == [CONF_SEARCH_QUERY]
        # The search path is the one that reports the outage to the user.
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Stephans"}
        )
        assert result["errors"]["base"] == "catalogue_unavailable"


def test_nearest_stations_skips_platformless_stops() -> None:
    """A DIVA with no RBLs can't be polled, so it is never suggested."""
    catalogue = StaticCatalogue(
        stations_by_diva={
            1: Station(
                diva=1,
                name="Trackable",
                municipality="Wien",
                longitude=16.3720,
                latitude=48.2080,
                rbls=[4111],
            ),
            2: Station(
                diva=2,
                name="No platforms",
                municipality="Wien",
                longitude=16.3721,
                latitude=48.2081,
                rbls=[],
            ),
        },
        last_fetched="2026-04-20T12:00:00+00:00",
    )
    nearest = _nearest_stations(catalogue, HOME_LATITUDE, HOME_LONGITUDE)
    assert [station.diva for station, _ in nearest] == [1]


def test_nearest_stations_honours_limit() -> None:
    """The suggestion list is capped even when many stops are in range."""
    catalogue = StaticCatalogue(
        stations_by_diva={
            diva: Station(
                diva=diva,
                name=f"Stop {diva}",
                municipality="Wien",
                longitude=16.3720,
                # ~11 m apart, so all 5 sit well inside the radius.
                latitude=48.2080 + diva * 0.0001,
                rbls=[diva],
            )
            for diva in range(1, 6)
        },
        last_fetched="2026-04-20T12:00:00+00:00",
    )
    nearest = _nearest_stations(catalogue, HOME_LATITUDE, HOME_LONGITUDE, limit=2)
    assert [station.diva for station, _ in nearest] == [1, 2]


def test_format_distance_localises_the_decimal_separator() -> None:
    """Metres below 1 km, kilometres above — with a German decimal comma."""
    assert _format_distance(72.4, "en") == "70 m"
    assert _format_distance(846.0, "de") == "850 m"
    assert _format_distance(1412.0, "en") == "1.4 km"
    assert _format_distance(1412.0, "de") == "1,4 km"
