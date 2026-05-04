"""Shared pytest fixtures for Wiener Linien Austria tests."""
from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.const import CONF_SCAN_INTERVAL
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.syrupy import HomeAssistantSnapshotExtension
from syrupy.assertion import SnapshotAssertion

from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
)
from custom_components.wiener_linien_austria.static import (
    Station,
    StaticCatalogue,
    TripPattern,
    TripPatternIndex,
)

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture
def snapshot(snapshot: SnapshotAssertion) -> SnapshotAssertion:
    """Use the HA snapshot extension so diagnostics / state dumps diff cleanly.

    Create/update snapshots with: pytest --snapshot-update
    Stored under tests/snapshots/ next to the test module.
    """
    return snapshot.use_extension(HomeAssistantSnapshotExtension)

FIXTURES = Path(__file__).parent / "fixtures"

# Canonical entry data used by every test that builds a MockConfigEntry.
# Stephansplatz with two RBLs (4111 inbound, 4118 outbound) carrying U1.
BASE_ENTRY_DATA: dict = {
    CONF_DIVA: 60201012,
    CONF_STOP_NAME: "Stephansplatz",
    CONF_RBLS: [4111, 4118],
    CONF_LINES: ["U1|H", "U1|R"],
    CONF_SCAN_INTERVAL: 60,
}


def make_entry(
    data: dict | None = None,
    *,
    unique_id: str = "diva_60201012",
) -> MockConfigEntry:
    """Build a MockConfigEntry with realistic Stephansplatz data.

    `unique_id` defaults to the production formula (`diva_{diva}`) so the
    diagnostics snapshot is reproducible across runs — without it MockConfigEntry
    generates a fresh random id each run and the snapshot diff is unstable.
    """
    entry_data = {**BASE_ENTRY_DATA, **(data or {})}
    return MockConfigEntry(
        domain=DOMAIN,
        data=entry_data,
        options={},
        title="Stephansplatz",
        version=2,
        unique_id=unique_id,
    )


def make_v1_entry(
    *,
    lines: list[str] | None = None,
    options_lines: list[str] | None = None,
    rbls: list[int] | None = None,
    diva: int = 60201012,
    stop_name: str = "Stephansplatz",
    title: str = "Stephansplatz",
) -> MockConfigEntry:
    """Build a v1-shaped MockConfigEntry for `async_migrate_entry` tests.

    The v1 schema carries `CONF_LINES` triples (`line|direction|towards`)
    rather than the v2 pairs (`line|direction`). Tests for the migration
    path must explicitly construct v1 data — the default `make_entry`
    helper hardcodes `version=2` because every other test should run
    against the current schema.

    Pass `options_lines` to put CONF_LINES in `entry.options` (the
    reconfigure path) instead of `entry.data`.
    """
    from homeassistant.const import CONF_SCAN_INTERVAL

    data: dict = {
        CONF_DIVA: diva,
        CONF_STOP_NAME: stop_name,
        CONF_RBLS: rbls if rbls is not None else [4111, 4118],
        CONF_SCAN_INTERVAL: 60,
    }
    if lines is not None:
        data[CONF_LINES] = lines
    options: dict = {}
    if options_lines is not None:
        options[CONF_LINES] = options_lines
    return MockConfigEntry(
        domain=DOMAIN,
        version=1,
        data=data,
        options=options,
        title=title,
    )


def _load_fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


def _sample_catalogue() -> StaticCatalogue:
    """A tiny in-memory catalogue covering a few central Vienna stops.

    Includes Taubstummengasse with U1 in both directions because that
    line has two terminus variants per direction (Oberlaa and
    Alaudagasse on R; Leopoldau on H) — the same kind of branching
    that historically tripped up the trip-pattern matcher and the
    config-flow line picker. Keeping it in the shared fixture means
    every test that loads the catalogue exercises that edge case.
    """
    # Synthetic RBLs for U1 patterns. RBLs 90011/90012 are at
    # Taubstummengasse (one per direction), 90013/90014 at the H/R
    # mid-stops, and 90015/90016/90017 at the three terminus stops:
    # Leopoldau (H), Oberlaa (R) and Alaudagasse (R short-turn).
    stations = {
        60201012: Station(
            diva=60201012,
            name="Stephansplatz",
            municipality="Wien",
            longitude=16.3726,
            latitude=48.2085,
            rbls=[4111, 4118],
        ),
        60200123: Station(
            diva=60200123,
            name="Schwarzenbergplatz",
            municipality="Wien",
            longitude=16.3740,
            latitude=48.2005,
            rbls=[1491],
        ),
        60201468: Station(
            diva=60201468,
            name="Taubstummengasse",
            municipality="Wien",
            longitude=16.3711,
            latitude=48.1953,
            rbls=[90011, 90012],
        ),
        60201470: Station(
            diva=60201470,
            name="Leopoldau",
            municipality="Wien",
            longitude=16.4660,
            latitude=48.2613,
            rbls=[90015],
        ),
        60201471: Station(
            diva=60201471,
            name="Oberlaa",
            municipality="Wien",
            longitude=16.4019,
            latitude=48.1646,
            rbls=[90016],
        ),
        60201472: Station(
            diva=60201472,
            name="Alaudagasse",
            municipality="Wien",
            longitude=16.4006,
            latitude=48.1660,
            rbls=[90017],
        ),
    }
    # U1 trip-pattern set: 1 H-direction pattern (Leopoldau terminus)
    # plus 2 R-direction patterns (Oberlaa full line + Alaudagasse
    # short-turn). The matcher uses the towards string to disambiguate
    # the two R variants — same pattern Wiener Linien runs in real
    # service when capacity is reduced overnight.
    u1_line_id = 1
    trip_patterns = TripPatternIndex(
        patterns_by_line={
            u1_line_id: [
                TripPattern(
                    line_id=u1_line_id,
                    pattern_id=101,
                    direction=1,  # H — Leopoldau
                    stops=(90013, 90011, 90015),
                ),
                TripPattern(
                    line_id=u1_line_id,
                    pattern_id=102,
                    direction=2,  # R — Oberlaa (full)
                    stops=(90014, 90012, 90016),
                ),
                TripPattern(
                    line_id=u1_line_id,
                    pattern_id=103,
                    direction=2,  # R — Alaudagasse (short turn)
                    stops=(90014, 90012, 90017),
                ),
            ],
        },
        lines_by_label={"U1": u1_line_id},
        means_by_line={u1_line_id: "ptMetro"},
        lines_at_diva={
            60201468: ("U1",),  # Taubstummengasse
            60201470: ("U1",),  # Leopoldau
            60201471: ("U1",),  # Oberlaa
            60201472: ("U1",),  # Alaudagasse
        },
    )
    return StaticCatalogue(
        stations_by_diva=stations,
        last_fetched="2026-04-20T12:00:00+00:00",
        trip_patterns=trip_patterns,
    )


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests in this package."""
    yield


@pytest.fixture(autouse=True)
def mock_aiohttp_session():
    """Stub the aiohttp session to prevent pycares DNS thread leaks."""
    with patch(
        "custom_components.wiener_linien_austria.coordinator.async_get_clientsession",
    ):
        yield


@pytest.fixture(autouse=True)
def mock_static_catalogue():
    """Stub the static catalogue loader so tests never hit the network."""
    catalogue = _sample_catalogue()
    with (
        patch(
            "custom_components.wiener_linien_austria.static.async_load_catalogue",
            new_callable=AsyncMock,
            return_value=catalogue,
        ),
        patch(
            "custom_components.wiener_linien_austria.static.async_get_catalogue",
            new_callable=AsyncMock,
            return_value=catalogue,
        ),
        patch(
            "custom_components.wiener_linien_austria.config_flow.async_get_catalogue",
            new_callable=AsyncMock,
            return_value=catalogue,
        ),
        patch(
            "custom_components.wiener_linien_austria.static.async_refresh_catalogue",
            new_callable=AsyncMock,
            return_value=catalogue,
        ),
    ):
        yield catalogue


@pytest.fixture
def monitor_fixture() -> dict:
    """Canonical monitor response captured against the live API."""
    return _load_fixture("monitor_stephansplatz.json")


@pytest.fixture
def tram_fixture() -> dict:
    """Canonical /monitor response for a bus stop (line 4A, ptBusCity)."""
    return _load_fixture("monitor_tram.json")


@pytest.fixture
def mock_fetch(monitor_fixture):
    """Stub the coordinator's fetch + the config-flow live probe."""
    # Mirror _probe_monitor_lines: dedupe on (line, direction) pair and
    # keep the first-seen `towards` as a display-only label.
    parsed_lines: list[dict] = []
    seen: set[str] = set()
    for monitor in monitor_fixture["data"]["monitors"]:
        for line in monitor["lines"]:
            key = f"{line['name']}|{line['direction']}"
            if key in seen:
                continue
            seen.add(key)
            parsed_lines.append(
                {
                    "key": key,
                    "line": line["name"],
                    "towards": line["towards"],
                    "direction": line["direction"],
                    "type": line["type"],
                }
            )
    from custom_components.wiener_linien_austria.coordinator import _parse_monitor_body

    parsed = _parse_monitor_body(
        monitor_fixture,
        None,
        monitor_fixture.get("message", {}).get("serverTime"),
    )

    with (
        patch(
            "custom_components.wiener_linien_austria.coordinator.WienerLinienAustriaCoordinator._async_update_data",
            new_callable=AsyncMock,
            return_value=parsed,
        ) as m,
        patch(
            "custom_components.wiener_linien_austria.config_flow._probe_monitor_lines",
            new_callable=AsyncMock,
            return_value=parsed_lines,
        ),
    ):
        yield m
