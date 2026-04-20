"""Tests for the Wiener Linien Austria sensor platform."""
from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import CONF_SCAN_INTERVAL, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria.const import (
    ATTRIBUTION,
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
)
from custom_components.wiener_linien_austria.coordinator import (
    Departure,
    MonitorData,
    WienerLinienAustriaCoordinator,
)
from custom_components.wiener_linien_austria.sensor import WienerLinienStopSensor

BASE_DATA = {
    CONF_DIVA: 60201012,
    CONF_STOP_NAME: "Stephansplatz",
    CONF_RBLS: [4111, 4118],
    CONF_LINES: ["U1|H|Leopoldau", "U1|R|Alaudagasse"],
    CONF_SCAN_INTERVAL: 60,
}


def _make_entry(data: dict | None = None) -> MockConfigEntry:
    """Build a MockConfigEntry with realistic Stephansplatz data."""
    entry_data = {**BASE_DATA, **(data or {})}
    return MockConfigEntry(
        domain=DOMAIN, data=entry_data, options={}, title="Stephansplatz"
    )


def _make_departures() -> list[Departure]:
    """Two U1 departures in opposite directions, different countdowns."""
    return [
        Departure(
            line="U1",
            towards="Leopoldau",
            direction="H",
            type="ptMetro",
            countdown=2,
            time_planned="2026-04-20T14:42:00.000+0200",
            time_real="2026-04-20T14:42:30.000+0200",
            realtime=True,
            barrier_free=True,
            traffic_jam=False,
        ),
        Departure(
            line="U1",
            towards="Alaudagasse",
            direction="R",
            type="ptMetro",
            countdown=5,
            time_planned="2026-04-20T14:45:00.000+0200",
            time_real="2026-04-20T14:45:12.000+0200",
            realtime=True,
            barrier_free=True,
            traffic_jam=False,
        ),
        Departure(
            line="U1",
            towards="Leopoldau",
            direction="H",
            type="ptMetro",
            countdown=7,
            time_planned="2026-04-20T14:47:00.000+0200",
            time_real=None,
            realtime=False,
            barrier_free=True,
            traffic_jam=False,
        ),
    ]


# ---------------------------------------------------------------------------
# Sensor attribute hydrogen bomb — state, attrs, device_info, unique_id
# ---------------------------------------------------------------------------


def _make_coordinator(hass: HomeAssistant, entry: MockConfigEntry, data: MonitorData | None) -> WienerLinienAustriaCoordinator:
    """Instantiate a coordinator with pre-set data — no network."""
    coordinator = WienerLinienAustriaCoordinator(hass, entry)
    coordinator.data = data
    coordinator.last_update_success = data is not None
    return coordinator


async def test_native_value_is_next_countdown(hass: HomeAssistant) -> None:
    """State = countdown of the first (sorted) departure."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.native_value == 2


async def test_native_value_none_when_no_departures(hass: HomeAssistant) -> None:
    """State is None when the board is empty (e.g. overnight)."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=[], server_time=None)
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.native_value is None


async def test_native_value_none_when_coordinator_has_no_data(hass: HomeAssistant) -> None:
    """State is None before the first successful fetch."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(hass, entry, None)
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.native_value is None


async def test_available_tolerates_transient_failures(hass: HomeAssistant) -> None:
    """A single failed poll must NOT flip the sensor to unavailable while
    the coordinator still holds prior data — otherwise the card blanks
    out between polls on transient hiccups."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.available is True

    # Simulate a failed poll — CoordinatorEntity.available would now be
    # False under the HA default, but our relaxed rule keeps us available
    # as long as we still have cached data to serve.
    coordinator.last_update_success = False
    assert sensor.available is True

    # Having no data at all (never successfully fetched) is the only case
    # that legitimately renders the sensor unavailable.
    coordinator.data = None
    assert sensor.available is False


async def test_unit_and_device_class(hass: HomeAssistant) -> None:
    """Unit = minutes, device_class = duration."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(hass, entry, MonitorData(departures=[], server_time=None))
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.native_unit_of_measurement == UnitOfTime.MINUTES
    assert sensor.device_class == SensorDeviceClass.DURATION


async def test_unique_id_format_is_frozen(hass: HomeAssistant) -> None:
    """unique_id MUST be f'{entry_id}_stop' — changes would wipe registries."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(hass, entry, MonitorData(departures=[], server_time=None))
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.unique_id == f"{entry.entry_id}_stop"


async def test_device_info_fields(hass: HomeAssistant) -> None:
    """DeviceInfo carries name/manufacturer/model/configuration_url + identifier."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(hass, entry, MonitorData(departures=[], server_time=None))
    sensor = WienerLinienStopSensor(coordinator, entry)
    info = sensor.device_info
    assert info is not None
    assert info["name"] == "Stephansplatz"
    assert info["manufacturer"] == "Wiener Linien"
    assert info["model"] == "Abfahrtsmonitor"
    assert info["configuration_url"] == "https://www.wienerlinien.at/"
    assert (DOMAIN, entry.entry_id) in info["identifiers"]


async def test_attributes_carry_attribution_and_identity(hass: HomeAssistant) -> None:
    """attribution + diva + stop_name are always present."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    attrs = sensor.extra_state_attributes
    assert attrs["attribution"] == ATTRIBUTION
    assert attrs["diva"] == 60201012
    assert attrs["stop_name"] == "Stephansplatz"
    assert attrs["server_time"] == "2026-04-20T14:40:00+0200"


async def test_attributes_full_departure_list(hass: HomeAssistant) -> None:
    """`departures` mirrors coordinator data with all fields round-tripped."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=_make_departures(), server_time=None)
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    attrs = sensor.extra_state_attributes
    assert len(attrs["departures"]) == 3
    first = attrs["departures"][0]
    assert first["line"] == "U1"
    assert first["towards"] == "Leopoldau"
    assert first["direction"] == "H"
    assert first["countdown"] == 2
    assert first["realtime"] is True
    assert first["barrier_free"] is True
    assert first["traffic_jam"] is False


async def test_attributes_next_by_line_and_no_grouped_duplicate(hass: HomeAssistant) -> None:
    """next_by_line gives cheap per-line access; we deliberately do NOT publish
    a full `departures_by_line` grouping because it duplicates every departure
    dict under `departures` and blows past the recorder's 16 KB attribute cap
    at busy stops."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=_make_departures(), server_time=None)
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    attrs = sensor.extra_state_attributes

    # next_by_line uses the *first* occurrence per line, which is the earliest
    # countdown because the coordinator always feeds a sorted list.
    assert attrs["next_by_line"] == {"U1": 2}

    # The grouped view is intentionally NOT published — consumers derive it
    # from `departures` themselves.
    assert "departures_by_line" not in attrs


async def test_attributes_next_by_line_with_multiple_lines(hass: HomeAssistant) -> None:
    """Multiple distinct lines each contribute one next_by_line entry."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=[
            Departure(
                line="U1", towards="Leopoldau", direction="H", type="ptMetro",
                countdown=2, time_planned=None, time_real=None,
                realtime=True, barrier_free=True, traffic_jam=False,
            ),
            Departure(
                line="71", towards="Schottentor", direction="H", type="ptTram",
                countdown=4, time_planned=None, time_real=None,
                realtime=True, barrier_free=False, traffic_jam=False,
            ),
            Departure(
                line="U1", towards="Leopoldau", direction="H", type="ptMetro",
                countdown=7, time_planned=None, time_real=None,
                realtime=False, barrier_free=True, traffic_jam=False,
            ),
        ],
        server_time=None,
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    next_by_line = sensor.extra_state_attributes["next_by_line"]
    assert next_by_line == {"U1": 2, "71": 4}


async def test_availability_requires_any_cached_data(hass: HomeAssistant) -> None:
    """Sensor is available whenever the coordinator has ANY cached data,
    even an empty one — transient fetch failures no longer flip us to
    unavailable (see test_available_tolerates_transient_failures)."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(
        hass, entry, MonitorData(departures=[], server_time=None)
    )
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.available is True
    # Only "no data at all" renders unavailable.
    coordinator.data = None
    assert sensor.available is False


# ---------------------------------------------------------------------------
# End-to-end: sensor actually registers with HA and reports state
# ---------------------------------------------------------------------------


async def test_sensor_registers_with_expected_entity_id(
    hass: HomeAssistant, mock_fetch
) -> None:
    """A full async_setup_entry lands the sensor in the entity registry.

    Verifies the sensor's object_id is stable ("stephansplatz_departures"
    because device name = 'Stephansplatz' + entity translated name = 'Departures').
    If either side drifts, the registry row moves — which means users'
    automations break. This is our canary for that.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    entities = er.async_entries_for_config_entry(registry, entry.entry_id)
    assert len(entities) == 1
    entry_row = entities[0]
    # unique_id format is frozen (see test_unique_id_format_is_frozen)
    assert entry_row.unique_id == f"{entry.entry_id}_stop"
    # Entity_id pattern check — device_slug + translated entity name slug
    assert entry_row.entity_id.startswith("sensor.stephansplatz")


async def test_sensor_state_present_after_setup(
    hass: HomeAssistant, mock_fetch
) -> None:
    """After async_setup_entry runs the state is populated from mock_fetch data."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    entities = er.async_entries_for_config_entry(registry, entry.entry_id)
    state = hass.states.get(entities[0].entity_id)
    assert state is not None
    # State is the next countdown; exact value depends on fixture contents.
    # The fixture's smallest countdown is 0 so the state is stringified "0".
    assert state.attributes["attribution"] == ATTRIBUTION
    assert state.attributes["diva"] == 60201012
    assert len(state.attributes["departures"]) >= 1


async def test_attributes_include_matched_alerts(hass: HomeAssistant) -> None:
    """traffic_info + elevator_info attributes surface the alerts that match this stop."""
    from custom_components.wiener_linien_austria.alerts import (
        ElevatorInfo,
        TrafficInfo,
    )
    from custom_components.wiener_linien_austria.const import (
        ELEVATOR_INFO_KEY,
        TRAFFIC_INFO_KEY,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][TRAFFIC_INFO_KEY] = [
        TrafficInfo(
            name="T1",
            title="U1: Störung",
            description="Linie U1",
            related_lines=["U1"],
            time_start=None,
            time_end=None,
            status="active",
        ),
        TrafficInfo(
            name="T2",
            title="49A: unrelated",
            description="other line",
            related_lines=["49A"],
            time_start=None,
            time_end=None,
            status="active",
        ),
    ]
    hass.data[DOMAIN][ELEVATOR_INFO_KEY] = [
        ElevatorInfo(
            name="E1",
            station="Stephansplatz",
            description="U1 exit",
            reason="maintenance",
            status="außer Betrieb",
            related_lines=["U1"],
            related_stops=[4111],
            time_start=None,
            time_end=None,
        ),
        ElevatorInfo(
            name="E2",
            station="Tscherttegasse",
            description="U6 platform",
            reason="",
            status="außer Betrieb",
            related_lines=["U6"],
            related_stops=[4629],
            time_start=None,
            time_end=None,
        ),
    ]

    sensor = WienerLinienStopSensor(coordinator, entry)
    attrs = sensor.extra_state_attributes

    # Only the U1-related traffic alert is surfaced (CONF_LINES filters).
    assert [t["name"] for t in attrs["traffic_info"]] == ["T1"]
    # Only the RBL 4111 elevator alert is surfaced (CONF_RBLS filters).
    assert [e["name"] for e in attrs["elevator_info"]] == ["E1"]
