"""Tests for the Wiener Linien Austria diagnostics module."""
from __future__ import annotations

from homeassistant.core import HomeAssistant
from syrupy.assertion import SnapshotAssertion

from custom_components.wiener_linien_austria.alerts import (
    ElevatorInfo,
    TrafficInfo,
)
from custom_components.wiener_linien_austria.const import (
    ATTRIBUTION,
    CONF_DIVA,
    DOMAIN,
    ELEVATOR_INFO_KEY,
    TRAFFIC_INFO_KEY,
)
from custom_components.wiener_linien_austria.coordinator import _parse_monitor_body
from custom_components.wiener_linien_austria.diagnostics import (
    TO_REDACT,
    async_get_config_entry_diagnostics,
)

from .conftest import make_entry as _make_entry


async def test_diagnostics_includes_attribution_and_state(
    hass: HomeAssistant, mock_fetch, monitor_fixture
) -> None:
    """Diagnostics expose attribution, RBL list, error code, and exact count."""
    # Derive the expected departure count from the fixture itself so the test
    # stays honest if the captured fixture is ever refreshed.
    expected_count = len(
        _parse_monitor_body(monitor_fixture, None, None).departures
    )
    assert expected_count > 0, "fixture must have departures for the test to mean anything"

    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)

    assert diag["attribution"] == ATTRIBUTION
    assert diag["entry"]["title"] == "Stephansplatz"
    assert diag["entry"]["version"] == 1
    assert diag["entry"]["data"][CONF_DIVA] == 60201012
    coord = diag["coordinator"]
    assert coord["rbls"] == [4111, 4118]
    assert coord["last_update_success"] is True
    # Exact count — guards against a broken diagnostics that always returns 0.
    # Note: server_time and last_error_code come from inside the real fetch
    # method; mock_fetch patches it out so those stay None in this test. They
    # are covered separately in test_coordinator (test_fetch_success_real_chain).
    assert coord["departure_count"] == expected_count


async def test_diagnostics_redacts_coordinates_in_entry_data(
    hass: HomeAssistant, mock_fetch
) -> None:
    """latitude/longitude in entry.data are redacted; the RBL/DIVA stay public.

    `TO_REDACT` is defensive: the integration doesn't currently store coords on
    the entry, but a future field addition could. Asserting the redactor runs
    is what stops that future code from leaking the user's home location into
    diagnostics dumps.
    """
    entry = _make_entry({"latitude": 48.2085, "longitude": 16.3726})
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)
    data = diag["entry"]["data"]

    # The defensively-redacted keys must be present — so the test fails loudly
    # if anyone removes them from TO_REDACT — and their values must NOT be
    # the original raw coords.
    assert "latitude" in TO_REDACT and "longitude" in TO_REDACT
    assert data["latitude"] != 48.2085
    assert data["longitude"] != 16.3726
    # The DIVA is a public station id, MUST stay readable.
    assert data[CONF_DIVA] == 60201012


async def test_diagnostics_includes_matched_alerts(
    hass: HomeAssistant, mock_fetch
) -> None:
    """Traffic + elevator alerts matching this stop are surfaced in diagnostics."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][TRAFFIC_INFO_KEY] = [
        TrafficInfo(
            name="T1", title="U1: Störung", description="x",
            related_lines=["U1"], time_start=None, time_end=None, status="active",
        ),
        TrafficInfo(
            name="T2", title="49A: unrelated", description="y",
            related_lines=["49A"], time_start=None, time_end=None, status="active",
        ),
    ]
    hass.data[DOMAIN][ELEVATOR_INFO_KEY] = [
        ElevatorInfo(
            name="E1", station="Stephansplatz", description="U1 exit",
            reason="", status="außer Betrieb",
            related_lines=["U1"], related_stops=[4111],
            time_start=None, time_end=None,
        ),
    ]

    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert [t["name"] for t in diag["alerts"]["traffic_info"]] == ["T1"]
    assert [e["name"] for e in diag["alerts"]["elevator_info"]] == ["E1"]


async def test_diagnostics_snapshot(
    hass: HomeAssistant, mock_fetch, snapshot: SnapshotAssertion
) -> None:
    """Pin the full redacted diagnostics shape so silent format changes surface.

    A failing diff usually means: a field was added to the entry/coordinator
    payload, or the redaction set changed. Update the snapshot
    (`pytest --snapshot-update`) only after confirming the change is intentional.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag == snapshot


async def test_diagnostics_handles_no_coordinator_data(hass: HomeAssistant) -> None:
    """When the coordinator never produced data, departure_count is 0, not crash.

    Guards [diagnostics.py:52](../custom_components/wiener_linien_austria/diagnostics.py#L52):
    the `data is not None` ternary that prevents an AttributeError if
    diagnostics is requested before the first refresh succeeded.
    """
    from custom_components.wiener_linien_austria.coordinator import (
        WienerLinienAustriaCoordinator,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    # `data` stays None (no refresh) — exercise the guarded branch.
    assert coordinator.data is None
    entry.runtime_data = coordinator

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["coordinator"]["departure_count"] == 0
    # `server_time` and `last_error_code` are None before any successful fetch.
    assert diag["coordinator"]["server_time"] is None
    assert diag["coordinator"]["last_error_code"] is None
