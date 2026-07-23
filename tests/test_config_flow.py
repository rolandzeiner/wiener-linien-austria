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
    _format_distance,
    _nearest_stations,
    _stop_options,
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
    CONF_STOP_NAME,
    DOMAIN,
)

DEFAULT_LINES = ["U1|H", "U1|R"]


async def _complete_flow(
    hass: HomeAssistant,
    *,
    diva: str = "60201012",
    lines: list[str] | None = None,
    scan_interval: int = 60,
) -> dict:
    """Walk the 2-step flow end-to-end and return the final result.

    Used by tests that only care about the *outcome* of a successful flow;
    tests that assert intermediate step transitions (step_id/type checks)
    stay in-line so those assertions remain readable.
    """
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
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




async def test_full_flow_creates_entry(hass: HomeAssistant, mock_fetch) -> None:
    """Pick stop → pick lines → entry created with correct data."""
    # Step 1: pick Stephansplatz straight out of the catalogue dropdown
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["step_id"] == "user"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_lines"

    # Step 2: accept defaults — config flow now writes (line, direction)
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


async def test_catalogue_unavailable_aborts_user_step(hass: HomeAssistant) -> None:
    """Without the catalogue there is no picker to render, so the flow aborts.

    There is no free-text fallback left to degrade to — an empty dropdown
    would be a dead end, so ending the flow with a reason the user can act
    on is the honest outcome.
    """
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=aiohttp.ClientError("upstream down"),
    ):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "catalogue_unavailable"



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
    hass: HomeAssistant, mock_fetch, mock_static_catalogue
) -> None:
    """Catalogue failure during select_lines must create a Repairs issue."""
    from homeassistant.helpers import issue_registry as ir

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )

    # The step-1 picker needs the catalogue to render at all, so let the
    # first load succeed and fail only the second — the one select_lines
    # makes when it merges the static line list into the live probe.
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
        new_callable=AsyncMock,
        side_effect=[
            mock_static_catalogue,
            aiohttp.ClientError("OGD endpoint down"),
        ],
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
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    assert result["step_id"] == "select_lines"

    assert (
        ir.async_get(hass).async_get_issue(DOMAIN, "catalogue_unavailable")
        is None
    )



# ----------------------------------------------------------------------
# Step 1 — the searchable all-stops dropdown
# ----------------------------------------------------------------------

# Right on top of the fixture's Stephansplatz (48.2085/16.3726). At this
# origin the sample catalogue puts exactly three stops inside the 2 km
# radius — Stephansplatz (~70 m), Schwarzenbergplatz (~850 m) and
# Taubstummengasse (~1.4 km) — while Leopoldau / Oberlaa / Alaudagasse
# sit several kilometres out and fall into the alphabetical remainder.
HOME_LATITUDE = 48.2080
HOME_LONGITUDE = 16.3720


def _set_home(hass: HomeAssistant, latitude: float, longitude: float) -> None:
    """Point the HA home location at the given coordinates."""
    hass.config.latitude = latitude
    hass.config.longitude = longitude


def _schema_keys(result: dict) -> list[str]:
    """Field names present in a form result's schema, in order."""
    return [str(key) for key in result["data_schema"].schema]


def _options(result: dict) -> list[dict]:
    """The SelectOptionDicts offered by the stop picker."""
    for key, validator in result["data_schema"].schema.items():
        if str(key) == CONF_DIVA:
            options = validator.config["options"]
            assert isinstance(options, list)
            return options
    raise AssertionError(f"{CONF_DIVA} not in schema: {_schema_keys(result)}")


async def test_picker_holds_every_trackable_stop(hass: HomeAssistant) -> None:
    """One field, one option per trackable stop — no separate search step."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["step_id"] == "user"
    assert _schema_keys(result) == [CONF_DIVA]

    options = _options(result)
    # All six fixture stations carry RBLs, so all six are offered exactly once.
    assert len(options) == 6
    values = [o["value"] for o in options]
    assert len(set(values)) == len(values)
    assert set(values) == {
        "60201012", "60200123", "60201468", "60201470", "60201471", "60201472",
    }


async def test_nearby_stops_pinned_first_with_distance(
    hass: HomeAssistant,
) -> None:
    """The nearest stops head the list, carrying their distance."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    options = _options(result)

    # First three: nearest-first, distance in the label.
    assert [o["value"] for o in options[:3]] == [
        "60201012", "60200123", "60201468",
    ]
    assert options[0]["label"].startswith("Stephansplatz (Wien) — ")
    assert options[0]["label"].endswith(" m")
    assert options[2]["label"].endswith(" km")

    # Remainder: alphabetical, no distance, no repeat of the pinned three.
    rest = options[3:]
    assert [o["label"] for o in rest] == [
        "Alaudagasse (Wien)", "Leopoldau (Wien)", "Oberlaa (Wien)",
    ]
    assert all("—" not in o["label"] for o in rest)


async def test_picker_is_alphabetical_without_a_home_location(
    hass: HomeAssistant,
) -> None:
    """A never-onboarded 0/0 home location just drops the pinned block."""
    _set_home(hass, 0.0, 0.0)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    options = _options(result)
    assert [o["label"] for o in options] == [
        "Alaudagasse (Wien)",
        "Leopoldau (Wien)",
        "Oberlaa (Wien)",
        "Schwarzenbergplatz (Wien)",
        "Stephansplatz (Wien)",
        "Taubstummengasse (Wien)",
    ]


async def test_picker_is_alphabetical_when_home_is_far_away(
    hass: HomeAssistant,
) -> None:
    """A home location outside the network still gets the full catalogue.

    This is the case that motivated the design: an install 37 km from the
    nearest stop got nothing from a radius-gated suggestion list, but the
    dropdown is equally usable at any distance.
    """
    _set_home(hass, 47.0707, 15.4395)  # Graz — 145 km out

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    options = _options(result)
    assert len(options) == 6
    assert options[0]["label"] == "Alaudagasse (Wien)"
    assert all("—" not in o["label"] for o in options)


async def test_picking_a_stop_goes_straight_to_lines(
    hass: HomeAssistant, mock_fetch
) -> None:
    """One pick is enough to reach line selection and save the entry."""
    _set_home(hass, HOME_LATITUDE, HOME_LONGITUDE)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "60201012"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_lines"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_LINES: list(DEFAULT_LINES), CONF_SCAN_INTERVAL: 60},
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["title"] == "Stephansplatz"
    assert result["data"][CONF_RBLS] == [4111, 4118]
    assert result["result"].unique_id == "diva_60201012"


async def test_typed_text_with_several_matches_shows_the_shortlist(
    hass: HomeAssistant,
) -> None:
    """Ambiguous free text falls through to the match list, as before."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    # "gasse" hits Taubstummengasse, Lafitegasse-style names — several stops.
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "gasse"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_stop"
    assert result["description_placeholders"]["query"] == "gasse"

    options = _options(result)
    values = [o["value"] for o in options]
    # Every hit plus the escape hatch back to step 1.
    assert "__search_again__" in values
    assert "60201468" in values  # Taubstummengasse


async def test_typed_text_with_one_match_skips_the_shortlist(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Unambiguous free text is clear enough — go straight to the lines."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "Stephans"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "select_lines"


async def test_search_again_returns_to_step_one(hass: HomeAssistant) -> None:
    """The shortlist keeps its escape hatch back to the picker."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "gasse"}
    )
    assert result["step_id"] == "select_stop"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "__search_again__"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "user"


async def test_typed_text_matching_nothing_reports_no_matches(
    hass: HomeAssistant,
) -> None:
    """Free text that matches no stop stays on step 1 with a clear error."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "XYZ-nope"}
    )
    assert result["step_id"] == "user"
    assert result["errors"][CONF_DIVA] == "no_matches"


async def test_typed_text_too_short_is_rejected(hass: HomeAssistant) -> None:
    """A single character is not a search — say so rather than scanning."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_DIVA: "a"}
    )
    assert result["errors"][CONF_DIVA] == "query_too_short"


async def test_custom_value_is_enabled_on_the_picker(hass: HomeAssistant) -> None:
    """The picker must accept typed text, not just a pick from the list."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    for key, validator in result["data_schema"].schema.items():
        if str(key) == CONF_DIVA:
            assert validator.config["custom_value"] is True
            assert validator.config["mode"] == "dropdown"
            break
    else:
        raise AssertionError("stop picker not in schema")


def test_platformless_stops_are_never_offered() -> None:
    """A DIVA with no RBLs can't be polled, so it is left out of the picker."""
    catalogue = StaticCatalogue(
        stations_by_diva={
            1: Station(
                diva=1, name="Trackable", municipality="Wien",
                longitude=16.3720, latitude=48.2080, rbls=[4111],
            ),
            2: Station(
                diva=2, name="No platforms", municipality="Wien",
                longitude=16.3721, latitude=48.2081, rbls=[],
            ),
        },
        last_fetched="2026-04-20T12:00:00+00:00",
    )
    # Nearby block and alphabetical remainder must both exclude it.
    assert [s.diva for s, _ in _nearest_stations(
        catalogue, HOME_LATITUDE, HOME_LONGITUDE)] == [1]
    assert [o["value"] for o in _stop_options(
        catalogue, HOME_LATITUDE, HOME_LONGITUDE, "en")] == ["1"]


def test_nearest_stations_honours_limit() -> None:
    """The pinned block is capped even when many stops are in range."""
    catalogue = StaticCatalogue(
        stations_by_diva={
            diva: Station(
                diva=diva, name=f"Stop {diva}", municipality="Wien",
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


def test_same_named_stops_are_disambiguated() -> None:
    """Two DIVAs sharing a name get the lines that serve them appended.

    Vienna really does this — "Schottenring (Wien)" is both the U2/U4 hub
    and a nightline-only stop — and identical labels leave the user
    picking blind.
    """
    catalogue = StaticCatalogue(
        stations_by_diva={
            1: Station(
                diva=1, name="Schottenring", municipality="Wien",
                longitude=16.3720, latitude=48.2080, rbls=[11],
            ),
            2: Station(
                diva=2, name="Schottenring", municipality="Wien",
                longitude=16.3730, latitude=48.2090, rbls=[22],
            ),
            3: Station(
                diva=3, name="Unique", municipality="Wien",
                longitude=16.3740, latitude=48.2100, rbls=[33],
            ),
        },
        last_fetched="2026-04-20T12:00:00+00:00",
        trip_patterns=TripPatternIndex(
            lines_at_diva={1: ("U2", "U4", "1", "2", "31"), 2: ("N31",)},
        ),
    )
    labels = {o["value"]: o["label"] for o in _stop_options(catalogue, 0.0, 0.0, "en")}
    # Truncated at 4 lines — a 14-line hub would be unreadable otherwise.
    assert labels["1"] == "Schottenring (Wien) · U2, U4, 1, 2, …"
    assert labels["2"] == "Schottenring (Wien) · N31"
    # A name nobody shares is left alone.
    assert labels["3"] == "Unique (Wien)"


def test_identical_line_sets_fall_back_to_the_diva() -> None:
    """When the lines match too (Lafitegasse, both 54A), the DIVA breaks the tie."""
    catalogue = StaticCatalogue(
        stations_by_diva={
            1: Station(
                diva=1, name="Lafitegasse", municipality="Wien",
                longitude=16.3720, latitude=48.2080, rbls=[11],
            ),
            2: Station(
                diva=2, name="Lafitegasse", municipality="Wien",
                longitude=16.3730, latitude=48.2090, rbls=[22],
            ),
        },
        last_fetched="2026-04-20T12:00:00+00:00",
        trip_patterns=TripPatternIndex(
            lines_at_diva={1: ("54A",), 2: ("54A",)},
        ),
    )
    labels = sorted(o["label"] for o in _stop_options(catalogue, 0.0, 0.0, "en"))
    assert labels == [
        "Lafitegasse (Wien) · 54A · #1",
        "Lafitegasse (Wien) · 54A · #2",
    ]
    assert len(set(labels)) == 2


def test_collision_without_line_data_still_resolves() -> None:
    """A cache with no trip-pattern index falls straight through to DIVAs."""
    catalogue = StaticCatalogue(
        stations_by_diva={
            1: Station(
                diva=1, name="Kirchengasse", municipality="Wien",
                longitude=16.3720, latitude=48.2080, rbls=[11],
            ),
            2: Station(
                diva=2, name="Kirchengasse", municipality="Wien",
                longitude=16.3730, latitude=48.2090, rbls=[22],
            ),
        },
        last_fetched="2026-04-20T12:00:00+00:00",
    )
    labels = sorted(o["label"] for o in _stop_options(catalogue, 0.0, 0.0, "en"))
    assert labels == ["Kirchengasse (Wien) · #1", "Kirchengasse (Wien) · #2"]
