"""Which S-Bahn lines call at which stop, for the stops-ahead transfer chips.

The chips on a stops-ahead trail come from Wiener Linien's trip patterns
(`static.TripPatternIndex.lines_at_diva`), which only know Wiener Linien's
own lines, so a U6 trail passed Handelskai without a word about the S-Bahn.
This module fills that gap from the routing server: departures at a handful
of hub stations (`S_BAHN_NETWORK_HUBS`), each with its trains' complete runs,
add up to every S-Bahn line and the stops it calls at. `const.py` records the
measurements behind the hub list.

Each hub is a separate sample with its own age, stored in its own Store
file. A hub that fails keeps its previous sample and is retried at the next
daily check, so one timeout never empties a section of the map for a week.

The data is timetable, not live: a chip says the S-Bahn stops there, not
that a train is coming. A closure shows up once the timetable carries it.
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    ENTRY_COUNT_KEY,
    ROUTING_DEPARTURE_ENDPOINT,
    S_BAHN_NETWORK_DEPARTURES,
    S_BAHN_NETWORK_HUBS,
    S_BAHN_NETWORK_MAX_AGE,
    S_BAHN_NETWORK_SAMPLE_HOUR,
    USER_AGENT,
)
from .parsing import s_bahn_number
from .rate_limit import async_enforce_routing_cooldown
from .routing import RoutingError, async_fetch_trip_body, async_routing_zone
from .timetable import build_departure_params, parse_calling_points

_LOGGER = logging.getLogger(__name__)

STORE_VERSION = 1
STORE_KEY = f"{DOMAIN}_s_bahn_network"

# hass.data keys: the published network, and the in-flight update task so
# the last-entry teardown can cancel it.
S_BAHN_NETWORK_KEY = "s_bahn_network"
S_BAHN_NETWORK_TASK_KEY = "s_bahn_network_task"


@dataclass(slots=True, frozen=True)
class HubSample:
    """One hub's departures, reduced to the S-Bahn lines at every stop."""

    fetched_at: datetime
    lines_at_stop: Mapping[int, frozenset[str]]


@dataclass(slots=True)
class SBahnNetwork:
    """Every hub's latest sample, merged into one stop → lines lookup."""

    hubs: dict[int, HubSample] = field(default_factory=dict)
    lines_at_diva: dict[int, tuple[str, ...]] = field(
        default_factory=dict, init=False, repr=False
    )

    def __post_init__(self) -> None:
        """Merge the hub samples; rebuilt whenever a network is constructed."""
        merged: dict[int, set[str]] = {}
        for sample in self.hubs.values():
            for diva, labels in sample.lines_at_stop.items():
                merged.setdefault(diva, set()).update(labels)
        self.lines_at_diva = {
            diva: sort_s_bahn_labels(labels) for diva, labels in merged.items()
        }

    def stale_hubs(self, now: datetime) -> list[int]:
        """The configured hubs with no sample or one older than the max age."""
        return [
            hub
            for hub in S_BAHN_NETWORK_HUBS
            if (sample := self.hubs.get(hub)) is None
            or now - sample.fetched_at >= S_BAHN_NETWORK_MAX_AGE
        ]


def sort_s_bahn_labels(labels: Iterable[str]) -> tuple[str, ...]:
    """`S2` before `S45`: by line number, then by label."""
    return tuple(sorted(labels, key=lambda label: (s_bahn_number(label), label)))


def merge_transfer_lines(
    wiener_linien: Sequence[str],
    s_bahn: Sequence[str],
    exclude: str | None = None,
) -> list[str]:
    """Wiener Linien transfer labels with the S-Bahn ones placed after the U-Bahn.

    The Wiener Linien list arrives sorted by mode (U-Bahn, tram, Badner Bahn,
    bus, night bus); the S-Bahn slots in behind the U-Bahn, the order the
    network map and the station signs use. `exclude` drops the line the
    trail belongs to.
    """
    metro_end = 0
    while metro_end < len(wiener_linien) and _is_metro(wiener_linien[metro_end]):
        metro_end += 1
    trains = [label for label in s_bahn if label != exclude]
    merged = [*wiener_linien[:metro_end], *trains, *wiener_linien[metro_end:]]
    return [label for label in merged if label != exclude]


def current_network(hass: HomeAssistant) -> SBahnNetwork | None:
    """The published S-Bahn network, or None until the first load."""
    network = hass.data.get(DOMAIN, {}).get(S_BAHN_NETWORK_KEY)
    return network if isinstance(network, SBahnNetwork) else None


def current_lines_at_diva(hass: HomeAssistant) -> Mapping[int, tuple[str, ...]]:
    """The published stop → S-Bahn lines lookup; empty until the first load."""
    network = current_network(hass)
    return network.lines_at_diva if network is not None else {}


def sample_time(now: datetime, zone: Any) -> datetime:
    """Tomorrow at `S_BAHN_NETWORK_SAMPLE_HOUR`, Vienna wall clock.

    Tomorrow, not the next occurrence of the hour: every hub in one run then
    samples the same day, even when the run straddles the hour.
    """
    local = now.astimezone(zone)
    day = local.date() + timedelta(days=1)
    return datetime.combine(day, time(S_BAHN_NETWORK_SAMPLE_HOUR), tzinfo=zone)


async def async_update_network(hass: HomeAssistant) -> SBahnNetwork:
    """Load the network, refetch the stale hubs, publish and persist it.

    Publishes the stored network before fetching anything, so the chips are
    back within a second of a restart rather than after seven routing
    cooldowns. Returns the network that ended up published.
    """
    store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
    domain_data = hass.data.setdefault(DOMAIN, {})
    published = domain_data.get(S_BAHN_NETWORK_KEY)
    network: SBahnNetwork
    if isinstance(published, SBahnNetwork):
        network = published
    else:
        network = await _async_load(store)
        domain_data[S_BAHN_NETWORK_KEY] = network

    stale = network.stale_hubs(dt_util.utcnow())
    if not stale:
        return network

    zone = await async_routing_zone()
    at = sample_time(dt_util.utcnow(), zone)
    hubs = dict(network.hubs)
    failed: list[str] = []
    for hub in stale:
        await async_enforce_routing_cooldown(hass)
        try:
            body = await async_fetch_trip_body(
                async_get_clientsession(hass),
                build_departure_params(
                    hub, S_BAHN_NETWORK_DEPARTURES, with_stops=True, at=at
                ),
                USER_AGENT,
                endpoint=ROUTING_DEPARTURE_ENDPOINT,
            )
        except RoutingError as err:
            failed.append(f"{hub} ({err.translation_key})")
            continue
        hubs[hub] = HubSample(
            fetched_at=dt_util.utcnow(),
            lines_at_stop={
                diva: frozenset(labels)
                for diva, labels in parse_calling_points(body).items()
            },
        )

    if failed:
        _LOGGER.warning(
            "S-Bahn network: %d of %d hub requests failed (%s); keeping their "
            "previous sample and retrying at the next daily check",
            len(failed),
            len(stale),
            ", ".join(failed),
        )
    if len(failed) == len(stale):
        return network

    network = SBahnNetwork(hubs=hubs)
    # The last entry may have unloaded while the requests queued behind the
    # routing cooldown. Its teardown sets the count to 0 rather than popping
    # it, so check the value; publishing now would re-create domain state
    # the teardown just cleared.
    if domain_data.get(ENTRY_COUNT_KEY):
        domain_data[S_BAHN_NETWORK_KEY] = network
    try:
        await store.async_save(_network_to_store(network))
    except OSError as err:
        _LOGGER.warning(
            "Failed to persist the S-Bahn network (%s); in-memory only", err
        )
    _LOGGER.debug(
        "S-Bahn network: %d hubs, %d stops", len(hubs), len(network.lines_at_diva)
    )
    return network


def async_schedule_network_update(hass: HomeAssistant) -> None:
    """Run `async_update_network` in the background unless one is running."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    existing = domain_data.get(S_BAHN_NETWORK_TASK_KEY)
    if isinstance(existing, asyncio.Task) and not existing.done():
        return
    domain_data[S_BAHN_NETWORK_TASK_KEY] = hass.async_create_background_task(
        _async_update_safely(hass), name=f"{DOMAIN}_s_bahn_network"
    )


async def _async_update_safely(hass: HomeAssistant) -> None:
    """The background task body: a failure here must not escape the task."""
    try:
        await async_update_network(hass)
    except asyncio.CancelledError:
        raise
    except Exception as err:  # noqa: BLE001 — background task safety net
        _LOGGER.warning("S-Bahn network update failed: %s", err)


async def _async_load(store: Store[dict[str, Any]]) -> SBahnNetwork:
    """The stored network, or an empty one when there is none or it's unreadable."""
    try:
        raw = await store.async_load()
    except (OSError, json.JSONDecodeError) as err:
        _LOGGER.warning("Failed to read the stored S-Bahn network (%s)", err)
        return SBahnNetwork()
    if not raw:
        return SBahnNetwork()
    try:
        return _network_from_store(raw)
    except (KeyError, TypeError, ValueError, AttributeError) as err:
        _LOGGER.warning("Ignoring a corrupt stored S-Bahn network (%s)", err)
        return SBahnNetwork()


def _network_to_store(network: SBahnNetwork) -> dict[str, Any]:
    return {
        "hubs": {
            str(hub): {
                "fetched_at": sample.fetched_at.isoformat(),
                "lines_at_stop": {
                    str(diva): sorted(labels)
                    for diva, labels in sample.lines_at_stop.items()
                },
            }
            for hub, sample in network.hubs.items()
        }
    }


def _network_from_store(raw: Mapping[str, Any]) -> SBahnNetwork:
    """Rebuild a stored network. Raises on a malformed payload.

    Hubs no longer in `S_BAHN_NETWORK_HUBS` are dropped, so a hub removed
    from the list stops contributing stops it alone knew about.
    """
    hubs: dict[int, HubSample] = {}
    for hub_key, sample in raw["hubs"].items():
        hub = int(hub_key)
        if hub not in S_BAHN_NETWORK_HUBS:
            continue
        fetched_at = dt_util.parse_datetime(sample["fetched_at"])
        if fetched_at is None:
            raise ValueError(f"unreadable fetched_at for hub {hub}")
        hubs[hub] = HubSample(
            fetched_at=fetched_at,
            lines_at_stop={
                int(diva): frozenset(str(label) for label in labels)
                for diva, labels in sample["lines_at_stop"].items()
            },
        )
    return SBahnNetwork(hubs=hubs)


def _is_metro(label: str) -> bool:
    return len(label) >= 2 and label[0] == "U" and label[1].isdigit()
