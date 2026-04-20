"""Shared pytest fixtures for Wiener Linien Austria tests."""
from unittest.mock import AsyncMock, patch

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests in this package."""
    yield


@pytest.fixture(autouse=True)
def mock_aiohttp_session():
    """Mock the aiohttp session to prevent pycares DNS from starting its background thread.

    pytest-homeassistant-custom-component's verify_cleanup fixture asserts no
    stray threads remain at teardown; the DNS-resolver thread violates that.
    Patching async_get_clientsession in the coordinator module is enough.
    """
    with patch(
        "custom_components.wiener_linien_austria.coordinator.async_get_clientsession",
    ):
        yield


@pytest.fixture
def mock_fetch():
    """Mock the coordinator's upstream fetch + config flow's trial connection."""
    with (
        patch(
            "custom_components.wiener_linien_austria.coordinator.WienerLinienAustriaCoordinator._async_update_data",
            new_callable=AsyncMock,
            return_value={"value": 42},
        ) as m,
        patch(
            "custom_components.wiener_linien_austria.config_flow._test_api_connection",
            new_callable=AsyncMock,
            return_value=True,
        ),
    ):
        yield m
