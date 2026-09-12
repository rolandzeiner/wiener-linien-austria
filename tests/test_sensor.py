"""Tests for the Wiener Linien Austria sensor platform."""

from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria.batch import BatchResult
from custom_components.wiener_linien_austria.const import (
    ATTRIBUTION,
    CONF_DIVA,
    CONF_LINES,
    DOMAIN,
    MAX_DEPARTURES_IN_ATTRS,
)
from custom_components.wiener_linien_austria.coordinator import (
    Departure,
    MonitorData,
    WienerLinienAustriaCoordinator,
)
from custom_components.wiener_linien_austria.sensor import WienerLinienStopSensor

from .conftest import make_entry as _make_entry


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


def _make_coordinator(
    hass: HomeAssistant, entry: MockConfigEntry, data: MonitorData | None
) -> WienerLinienAustriaCoordinator:
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


async def test_native_value_none_when_coordinator_has_no_data(
    hass: HomeAssistant,
) -> None:
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
    coordinator = _make_coordinator(
        hass, entry, MonitorData(departures=[], server_time=None)
    )
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.native_unit_of_measurement == UnitOfTime.MINUTES
    assert sensor.device_class == SensorDeviceClass.DURATION


async def test_unique_id_format_is_frozen(hass: HomeAssistant) -> None:
    """unique_id MUST be f'{entry_id}_stop' — changes would wipe registries."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(
        hass, entry, MonitorData(departures=[], server_time=None)
    )
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.unique_id == f"{entry.entry_id}_stop"


async def test_device_info_fields(hass: HomeAssistant) -> None:
    """DeviceInfo carries name/manufacturer/model/configuration_url + identifier."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = _make_coordinator(
        hass, entry, MonitorData(departures=[], server_time=None)
    )
    sensor = WienerLinienStopSensor(coordinator, entry)
    info = sensor.device_info
    assert info is not None
    assert info["name"] == "Stephansplatz"
    assert info["manufacturer"] == "Wiener Linien"
    assert info["model"] == "Abfahrtsmonitor"
    assert info["configuration_url"] == "https://www.wienerlinien.at/"
    assert (DOMAIN, entry.entry_id) in info["identifiers"]


async def test_attributes_carry_attribution_and_identity(hass: HomeAssistant) -> None:
    """attribution + diva + stop_name + server_time + coords are surfaced."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    # Coordinates flow from the static catalogue via async_setup. Set them
    # directly to avoid the async_setup round-trip in this attribute test.
    coordinator._latitude = 48.2085
    coordinator._longitude = 16.3726
    sensor = WienerLinienStopSensor(coordinator, entry)
    # `attribution` is now declared on the entity class via `_attr_attribution`
    # — HA core merges it into `state.attributes` (covered by the end-to-end
    # test below where state.attributes["attribution"] is asserted). It is NOT
    # present in `extra_state_attributes` directly.
    assert sensor.attribution == ATTRIBUTION
    attrs = sensor.extra_state_attributes
    assert "attribution" not in attrs
    assert attrs["diva"] == 60201012
    assert attrs["stop_name"] == "Stephansplatz"
    assert attrs["server_time"] == "2026-04-20T14:40:00+0200"
    # lat/lon must round-trip from coordinator → attributes; otherwise the
    # card's "show on map" link silently breaks.
    assert attrs["latitude"] == 48.2085
    assert attrs["longitude"] == 16.3726


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


async def test_attributes_next_by_line_and_no_grouped_duplicate(
    hass: HomeAssistant,
) -> None:
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
                line="U1",
                towards="Leopoldau",
                direction="H",
                type="ptMetro",
                countdown=2,
                time_planned=None,
                time_real=None,
                realtime=True,
                barrier_free=True,
                traffic_jam=False,
            ),
            Departure(
                line="71",
                towards="Schottentor",
                direction="H",
                type="ptTram",
                countdown=4,
                time_planned=None,
                time_real=None,
                realtime=True,
                barrier_free=False,
                traffic_jam=False,
            ),
            Departure(
                line="U1",
                towards="Leopoldau",
                direction="H",
                type="ptMetro",
                countdown=7,
                time_planned=None,
                time_real=None,
                realtime=False,
                barrier_free=True,
                traffic_jam=False,
            ),
        ],
        server_time=None,
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    next_by_line = sensor.extra_state_attributes["next_by_line"]
    assert next_by_line == {"U1": 2, "71": 4}


async def test_line_colors_is_scoped_to_the_lines_this_stop_can_render(
    hass: HomeAssistant,
) -> None:
    """The palette carries the lines this entity can be asked to colour.

    It used to carry the entire GTFS catalogue — 179 lines, 7,242 bytes,
    byte-identical on every entry in the install. The scope below is the
    contract, and each term is here because something renders it:

      * `lines_at_stop` — departure chips and the editor's colour picker
      * live departure lines — belt-and-braces against a live feed that
        names something the weekly catalogue doesn't
      * `stops_ahead[].lines` — transfer chips for lines at OTHER stops,
        which is the case that made publishing unscoped correct until
        the cards learned to merge palettes across entities
      * `traffic_info` / `elevator_info` `related_lines` — notice badges,
        which routinely name lines that don't serve this stop

    A label the cards render but this set omits silently falls through to
    the neutral fallback, which looks like a design choice rather than a
    bug — hence pinning the whole union rather than a sample of it.
    """
    from custom_components.wiener_linien_austria.alerts import TrafficInfo
    from custom_components.wiener_linien_austria.const import TRAFFIC_INFO_KEY
    from custom_components.wiener_linien_austria.static import (
        CATALOGUE_KEY,
        StaticCatalogue,
        TripPatternIndex,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    diva = int(entry.data[CONF_DIVA])

    data = MonitorData(
        departures=[
            Departure(
                line="U1",
                towards="Leopoldau",
                direction="H",
                type="ptMetro",
                countdown=2,
                time_planned=None,
                time_real=None,
                realtime=True,
                barrier_free=True,
                traffic_jam=False,
                # A transfer chip at a stop further down the line.
                stops_ahead=[{"name": "Karlsplatz", "lines": ["U2", "U4"]}],
            ),
        ],
        server_time=None,
    )
    coordinator = _make_coordinator(hass, entry, data)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][CATALOGUE_KEY] = StaticCatalogue(
        stations_by_diva={},
        last_fetched="2026-04-30T12:00:00+00:00",
        trip_patterns=TripPatternIndex(
            lines_at_diva={diva: ("U1", "71")},
            colors_by_line={
                "U1": "E3000F",
                "U2": "A862A4",
                "U4": "07A64F",
                "71": "C00808",
                "13A": "0A295D",
                "N60": "1C1C1C",
            },
            text_colors_by_line={"U1": "FFFFFF", "U2": "FFFFFF"},
        ),
    )
    # A disruption that reaches this entity because it names U1, and whose
    # badge row therefore also renders 13A — a line that neither serves
    # this stop nor appears in any stops_ahead trail. `get_alerts_for`
    # scopes which notices arrive; it does not trim `related_lines`, so
    # the badge is rendered and needs a colour.
    hass.data[DOMAIN][TRAFFIC_INFO_KEY] = [
        TrafficInfo(
            name="stoerung-u1-13a",
            title="Umleitung",
            description="",
            description_html="",
            related_lines=["U1", "13A"],
            related_stops=[],
            line_types=[],
            location="",
            time_start=None,
            time_end=None,
            time_created=None,
            time_last_update=None,
            status="",
            category="stoerunglang",
        )
    ]

    sensor = WienerLinienStopSensor(coordinator, entry)
    line_colors = sensor.extra_state_attributes["line_colors"]

    # U1 + 71 from lines_at_stop, U2 + U4 from the stops_ahead trail,
    # 13A from the traffic notice. N60 is in the catalogue and nothing
    # renders it, so it is not published.
    assert set(line_colors) == {"U1", "71", "U2", "U4", "13A"}
    assert line_colors["U1"] == {"bg": "E3000F", "fg": "FFFFFF"}
    # Lines without an fg recorded omit the key (card falls through to
    # default white).
    assert line_colors["71"] == {"bg": "C00808"}


async def test_line_colors_omits_a_label_the_catalogue_has_no_colour_for(
    hass: HomeAssistant,
) -> None:
    """A rendered line with no GTFS entry is omitted, not published empty.

    An entry with a blank `bg` would defeat the card's fallback ladder:
    `chipPalette` checks whether the GTFS map HAS the line, so a present
    key with no colour paints an empty background instead of falling
    through to the nightline rule or the neutral default.
    """
    from custom_components.wiener_linien_austria.static import (
        CATALOGUE_KEY,
        StaticCatalogue,
        TripPatternIndex,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    diva = int(entry.data[CONF_DIVA])
    data = MonitorData(departures=_make_departures(), server_time=None)
    coordinator = _make_coordinator(hass, entry, data)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][CATALOGUE_KEY] = StaticCatalogue(
        stations_by_diva={},
        last_fetched="2026-04-30T12:00:00+00:00",
        trip_patterns=TripPatternIndex(
            lines_at_diva={diva: ("U1", "N60")},
            colors_by_line={"U1": "E3000F"},
            text_colors_by_line={},
        ),
    )

    sensor = WienerLinienStopSensor(coordinator, entry)

    assert set(sensor.extra_state_attributes["line_colors"]) == {"U1"}


async def test_attributes_line_colors_empty_when_catalogue_missing(
    hass: HomeAssistant,
) -> None:
    """Without a loaded catalogue, the attribute is `{}` — card uses fallbacks."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(departures=_make_departures(), server_time=None)
    coordinator = _make_coordinator(hass, entry, data)
    # Deliberately don't put a catalogue in hass.data — simulates fresh boot.
    sensor = WienerLinienStopSensor(coordinator, entry)
    assert sensor.extra_state_attributes["line_colors"] == {}


# ---------------------------------------------------------------------------
# End-to-end: sensor actually registers with HA and reports state
# ---------------------------------------------------------------------------


async def test_sensor_registers_with_expected_entity_id(
    hass: HomeAssistant, mock_fetch
) -> None:
    """A full async_setup_entry lands both entities in the entity registry.

    Verifies each object_id is stable — device name 'Stephansplatz' plus the
    translated entity name, giving "stephansplatz_departures" and
    "stephansplatz_departure_data_stale". If either side drifts, the
    registry rows move, which means users' automations break. This is our
    canary for that.

    The entity COUNT is asserted too, because adding a platform is exactly
    the kind of change that silently renames things: an entity added
    without its four translation files lands as an untranslated object_id
    and nothing else in the suite would notice.
    """
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    entities = er.async_entries_for_config_entry(registry, entry.entry_id)
    assert len(entities) == 2
    by_domain = {e.domain: e for e in entities}

    # unique_id formats are frozen (see test_unique_id_format_is_frozen)
    assert by_domain["sensor"].unique_id == f"{entry.entry_id}_stop"
    assert by_domain["binary_sensor"].unique_id == f"{entry.entry_id}_stale"
    # Entity_id pattern check — device_slug + translated entity name slug
    assert by_domain["sensor"].entity_id == "sensor.stephansplatz_departures"
    assert (
        by_domain["binary_sensor"].entity_id
        == "binary_sensor.stephansplatz_departure_data_stale"
    )


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
    # Select by domain, not by position: the entry now owns a binary_sensor
    # too and registry order is not the setup order.
    stop_entity = next(e for e in entities if e.domain == "sensor")
    state = hass.states.get(stop_entity.entity_id)
    assert state is not None
    # State is the next countdown; exact value depends on fixture contents.
    # The fixture's smallest countdown is 0 so the state is stringified "0".
    assert state.attributes["attribution"] == ATTRIBUTION
    assert state.attributes["diva"] == 60201012
    assert len(state.attributes["departures"]) >= 1


async def test_attributes_cap_at_max_departures(hass: HomeAssistant) -> None:
    """`departures` is capped at MAX_DEPARTURES_IN_ATTRS to stay under the
    recorder's 16 KB attribute limit at busy multi-line stops (Stephansplatz
    tracks U1/U3/U4 ≈ ~40 entries). If this cap regresses the recorder
    silently truncates and state history goes weird — this is the canary."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    many = [
        Departure(
            line="U1",
            towards="Leopoldau",
            direction="H",
            type="ptMetro",
            countdown=i,
            time_planned=None,
            time_real=None,
            realtime=True,
            barrier_free=True,
            traffic_jam=False,
        )
        for i in range(MAX_DEPARTURES_IN_ATTRS + 10)
    ]
    data = MonitorData(departures=many, server_time=None)
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    attrs = sensor.extra_state_attributes
    assert len(attrs["departures"]) == MAX_DEPARTURES_IN_ATTRS
    # The cap keeps the *earliest* departures — check the countdown order.
    assert attrs["departures"][0]["countdown"] == 0
    assert attrs["departures"][-1]["countdown"] == MAX_DEPARTURES_IN_ATTRS - 1


async def test_tracked_lines_publish_the_realtime_spelling(
    hass: HomeAssistant,
) -> None:
    """A selection saved as "LB|H" is published as "WLB|H".

    The cards filter `departure.line` — always the feed's spelling — against
    `tracked_lines`, so publishing the static-catalogue label would leave a
    Badner Bahn card permanently empty (issue #110). Stored entry data is
    left untouched; only what goes out is canonicalised.
    """
    entry = _make_entry({CONF_LINES: ["LB|H", "U1|H"]})
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)

    attrs = WienerLinienStopSensor(coordinator, entry).extra_state_attributes

    assert attrs["tracked_lines"] == ["U1", "WLB"]
    assert attrs["tracked_line_keys"] == ["WLB|H", "U1|H"]
    # The config entry itself is not rewritten.
    assert entry.data[CONF_LINES] == ["LB|H", "U1|H"]


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


# ---------------------------------------------------------------------------
# extra_state_attributes caching (HA calls this on every read; cache collapses
# the rebuild to once per coordinator tick OR alerts refresh — see
# WienerLinienAustriaCoordinator._attrs_cache for the invalidation contract.)
# ---------------------------------------------------------------------------


async def test_extra_state_attributes_cached_within_tick(
    hass: HomeAssistant,
) -> None:
    """Repeat reads inside the same tick return the cached dict object."""
    from unittest.mock import patch

    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)

    with patch(
        "custom_components.wiener_linien_austria.sensor.get_alerts_for",
        return_value=([], []),
    ) as mock_alerts:
        first = sensor.extra_state_attributes
        second = sensor.extra_state_attributes
        third = sensor.extra_state_attributes

    # Same object identity — the cache returned the stored ref, not a fresh
    # build. The build path is what calls get_alerts_for; if the assertion
    # below ever rises above 1, the cache regressed.
    assert first is second is third
    assert mock_alerts.call_count == 1


async def test_extra_state_attributes_rebuilt_when_alerts_seq_bumps(
    hass: HomeAssistant,
) -> None:
    """Alerts refreshing on its own cadence must invalidate the cached attrs."""
    from unittest.mock import patch

    from custom_components.wiener_linien_austria.const import ALERTS_SEQ_KEY

    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)
    hass.data.setdefault(DOMAIN, {})[ALERTS_SEQ_KEY] = 1

    with patch(
        "custom_components.wiener_linien_austria.sensor.get_alerts_for",
        return_value=([], []),
    ) as mock_alerts:
        _ = sensor.extra_state_attributes  # build + cache at seq=1
        _ = sensor.extra_state_attributes  # served from cache
        hass.data[DOMAIN][ALERTS_SEQ_KEY] = 2  # alerts refresh tick
        _ = sensor.extra_state_attributes  # rebuild at seq=2
        _ = sensor.extra_state_attributes  # served from cache at seq=2

    assert mock_alerts.call_count == 2


async def test_batch_apply_clears_attrs_cache(
    hass: HomeAssistant,
) -> None:
    """A batch push wipes the attrs cache so the next read rebuilds."""
    from unittest.mock import patch

    from custom_components.wiener_linien_austria.batch import BatchResult

    entry = _make_entry()
    entry.add_to_hass(hass)
    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)

    with patch(
        "custom_components.wiener_linien_austria.sensor.get_alerts_for",
        return_value=([], []),
    ) as mock_alerts:
        _ = sensor.extra_state_attributes
        _ = sensor.extra_state_attributes
        # Drive a successful batch fan-out — the cache must drop even though
        # departures + alerts didn't change, because the recorder writes the
        # attrs dict per state and a stale cache would freeze whatever was
        # captured at the previous tick.
        coordinator.batch_apply(
            BatchResult(
                body={"data": {"monitors": []}, "message": {"messageCode": 1}},
                server_time="2026-04-20T14:41:00+0200",
            )
        )
        _ = sensor.extra_state_attributes

    assert mock_alerts.call_count == 2


async def test_stale_feed_yields_unknown_state_and_signals(
    hass: HomeAssistant, stale_metro_fixture
) -> None:
    """A frozen upstream feed reports no countdown at all — not a stuck 0.

    This is the half of issue #103 the reporter didn't see. The card's
    four-digit delay was cosmetic; the sensor state was worse. Every
    U-Bahn stop's countdown sat at 0 for 60 hours because the ghost
    record's `countdown` never moved, so any "next train in ≤ N minutes"
    automation fired continuously for two and a half days.
    """
    from unittest.mock import AsyncMock, patch

    from custom_components.wiener_linien_austria.coordinator import (
        _parse_monitor_body,
    )

    # Parse the U1 monitors only, so the stop is entirely stale — the
    # healthy 48A in the same capture belongs to a different RBL.
    metro_only = {
        "data": {
            "monitors": [
                m
                for m in stale_metro_fixture["data"]["monitors"]
                if m["locationStop"]["properties"]["attributes"]["rbl"] != 1401
            ]
        },
        "message": stale_metro_fixture["message"],
    }
    parsed = _parse_monitor_body(metro_only, None, metro_only["message"]["serverTime"])
    assert parsed.stale_dropped == 2
    assert parsed.departures == []

    entry = _make_entry()
    entry.add_to_hass(hass)
    with patch(
        "custom_components.wiener_linien_austria.coordinator"
        ".WienerLinienAustriaCoordinator._async_update_data",
        new_callable=AsyncMock,
        return_value=parsed,
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    registry = er.async_get(hass)
    entities = er.async_entries_for_config_entry(registry, entry.entry_id)
    # Select by domain, not by position: the entry now owns a binary_sensor
    # too and registry order is not the setup order.
    stop_entity = next(e for e in entities if e.domain == "sensor")
    state = hass.states.get(stop_entity.entity_id)
    assert state is not None
    assert state.state == "unknown"
    assert state.attributes["departures"] == []
    # The signals the cards read to explain the empty board.
    assert state.attributes["stale_departures"] == 2
    assert state.attributes["stale_since"] == "2026-08-27T06:42:00+02:00"


async def test_line_colors_refresh_lands_on_the_next_tick_not_the_next_read(
    hass: HomeAssistant,
) -> None:
    """Pins what `_line_colors` actually does, which is not what it said.

    Its docstring claimed a background trip-pattern refresh was picked up
    "on the very next sensor read". It is not: `_line_colors` runs inside
    `extra_state_attributes`, whose result is memoised on the coordinator,
    and `static.async_set_cached_catalogue` publishes a new catalogue
    without invalidating that cache. So a refresh lands on the next
    coordinator tick — bounded by the entry's scan interval, 60 s by
    default and up to 600 s at the ceiling.

    That is fine for data on a weeks-to-months cadence, and the docstring
    is now honest about it. This test is here so the next person to
    "optimise" the cache finds out which of the two behaviours is the
    documented one.
    """
    from custom_components.wiener_linien_austria.const import ENTRY_COUNT_KEY
    from custom_components.wiener_linien_austria.static import (
        CATALOGUE_KEY,
        StaticCatalogue,
        TripPatternIndex,
        async_set_cached_catalogue,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    diva = int(entry.data[CONF_DIVA])

    def _catalogue(colors: dict[str, str]) -> StaticCatalogue:
        return StaticCatalogue(
            stations_by_diva={},
            last_fetched="2026-04-20T12:00:00+00:00",
            trip_patterns=TripPatternIndex(
                patterns_by_line={},
                lines_by_label={},
                means_by_line={},
                # Anchored on `lines_at_stop`, not on live departures: the
                # tick below pushes an empty board, and `line_colors` is
                # now scoped to what the entity can render. Without this
                # the palette would empty for that reason rather than the
                # caching reason under test.
                lines_at_diva={diva: ("U1",)},
                colors_by_line=colors,
                text_colors_by_line={},
            ),
        )

    data = MonitorData(
        departures=_make_departures(), server_time="2026-04-20T14:40:00+0200"
    )
    coordinator = _make_coordinator(hass, entry, data)
    sensor = WienerLinienStopSensor(coordinator, entry)

    hass.data.setdefault(DOMAIN, {})[ENTRY_COUNT_KEY] = 1
    hass.data[DOMAIN][CATALOGUE_KEY] = _catalogue({"U1": "E20D17"})
    assert sensor.extra_state_attributes["line_colors"] == {"U1": {"bg": "E20D17"}}

    # A background refresh publishes new colours...
    async_set_cached_catalogue(hass, _catalogue({"U1": "FFFFFF"}))

    # ...and the very next read still serves the memoised payload.
    assert sensor.extra_state_attributes["line_colors"] == {"U1": {"bg": "E20D17"}}

    # A coordinator tick is what drops the cache — and specifically
    # `batch_apply`, the path the shared group timer actually uses.
    # Note that stock `async_set_updated_data` on its own does NOT
    # invalidate: invalidation lives in `batch_apply` / `_async_update_data`
    # / `batch_set_error`, which call it before pushing. Any future code
    # path that pushes state without going through one of those three
    # would leave this cache stale indefinitely.
    coordinator.batch_apply(BatchResult(body={}, server_time=None))
    assert sensor.extra_state_attributes["line_colors"] == {"U1": {"bg": "FFFFFF"}}
