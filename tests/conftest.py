"""Shared pytest fixtures for Wiener Linien Austria tests."""
from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

from custom_components.wiener_linien_austria.static import Station, StaticCatalogue

pytest_plugins = "pytest_homeassistant_custom_component"

FIXTURES = Path(__file__).parent / "fixtures"


def _load_fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


def _sample_catalogue() -> StaticCatalogue:
    """A tiny in-memory catalogue covering Stephansplatz + Schwarzenbergplatz."""
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
    }
    return StaticCatalogue(
        stations_by_diva=stations, last_fetched="2026-04-20T12:00:00+00:00"
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
            "custom_components.wiener_linien_austria.config_flow.async_load_catalogue",
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
def mock_fetch(monitor_fixture):
    """Stub the coordinator's fetch + the config-flow live probe."""
    parsed_lines = [
        {
            "key": f"{line['name']}|{line['direction']}|{line['towards']}",
            "line": line["name"],
            "towards": line["towards"],
            "direction": line["direction"],
            "type": line["type"],
        }
        for monitor in monitor_fixture["data"]["monitors"]
        for line in monitor["lines"]
    ]
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
