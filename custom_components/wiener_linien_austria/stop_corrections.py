"""Corrections to stops the open data gets wrong, and to entries saved with them.

`haltestellen.csv` names 60200855 "Valentingasse", and `haltepunkte.csv` files
that stop's night bus platforms under it. The GTFS feed, the trip planner and
`/monitor` all call 60200855 "Maurer Lange Gasse", the 60's stop. Valentingasse
is 60201936 in GTFS and the trip planner, 400 m west, an ID the station list
doesn't have at all (issue #132).
Checked 2026-11-22.

Each correction applies only while the open data still has the error, so it
steps aside when Wiener Linien fixes the files. A new one also needs a minor
version of the config entry, for `entry_corrections` to reach saved entries.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any, Final, NamedTuple

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback

from .const import (
    CONF_DESTINATION_DIVA,
    CONF_DESTINATION_NAME,
    CONF_DIVA,
    CONF_ENTRY_TYPE,
    CONF_LINES,
    CONF_ORIGIN_DIVA,
    CONF_ORIGIN_NAME,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
    ENTRY_TYPE_ROUTE,
)
from .parsing import as_int


class StopSplit(NamedTuple):
    """A stop whose platforms the open data files under its neighbour."""

    listed_under: int
    diva: int
    name: str
    longitude: float
    latitude: float
    rbls: tuple[int, ...]
    # The lines that call there, to tell which stop a saved board meant.
    lines: frozenset[str]


# DIVA → (the station list's name, the stop's own).
STOP_NAME_FIXES: Final[dict[int, tuple[str, str]]] = {
    60200855: ("Valentingasse", "Maurer Lange Gasse"),
}

# Position from GTFS `stops.txt`, between the stop's two platforms.
STOP_SPLITS: Final[tuple[StopSplit, ...]] = (
    StopSplit(
        listed_under=60200855,
        diva=60201936,
        name="Valentingasse",
        longitude=16.2625834,
        latitude=48.1481219,
        rbls=(3862, 3863),
        lines=frozenset({"N60"}),
    ),
)


def corrected_diva(rbl: int, diva: str) -> str:
    """The trip planner's ID for the stop of a `/monitor` row's platform."""
    for split in STOP_SPLITS:
        if rbl in split.rbls and diva == str(split.listed_under):
            return str(split.diva)
    return diva


def split_off_platforms(diva: int, rbls: Iterable[Any]) -> list[int]:
    """Those of a board's saved platforms that are now a stop of their own."""
    saved = {as_int(rbl) for rbl in rbls}
    return [
        rbl
        for split in STOP_SPLITS
        if split.listed_under == diva
        for rbl in split.rbls
        if rbl in saved
    ]


@callback
def entry_corrections(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """What `async_update_entry` has to change on an entry saved before the fix."""
    if entry.data.get(CONF_ENTRY_TYPE) == ENTRY_TYPE_ROUTE:
        return _route_corrections(entry)
    return _board_corrections(hass, entry)


def _board_corrections(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """A board follows the lines it tracks, and loses none of their departures.

    One that tracks only the split-off stop's lines moves to that stop. One
    that tracks none of them gives those platforms up. One that tracks both,
    or every line, keeps its platforms.
    """
    data = dict(entry.data)
    diva = as_int(data.get(CONF_DIVA))
    if diva is None:
        return {}
    keys = {**entry.data, **entry.options}.get(CONF_LINES) or []
    tracked = {str(key).partition("|")[0] for key in keys}
    rbls = list(data.get(CONF_RBLS) or [])
    for split in STOP_SPLITS:
        if split.listed_under != diva or not tracked:
            continue
        unique_id = f"diva_{split.diva}"
        if tracked <= split.lines and not (
            hass.config_entries.async_entry_for_domain_unique_id(DOMAIN, unique_id)
        ):
            data |= {
                CONF_DIVA: split.diva,
                CONF_STOP_NAME: split.name,
                CONF_RBLS: list(split.rbls),
            }
            return {"data": data, "unique_id": unique_id}
        if not tracked & split.lines:
            data[CONF_RBLS] = [rbl for rbl in rbls if as_int(rbl) not in split.rbls]

    changes: dict[str, Any] = {}
    if (fix := STOP_NAME_FIXES.get(diva)) is not None:
        listed, own = fix
        if data.get(CONF_STOP_NAME) == listed:
            data[CONF_STOP_NAME] = own
        if entry.title == listed:
            changes["title"] = own
    if data != entry.data:
        changes["data"] = data
    return changes


def _route_corrections(entry: ConfigEntry) -> dict[str, Any]:
    """A route keeps its stop IDs, which are what it was planned with."""
    data = dict(entry.data)
    for diva_key, name_key in (
        (CONF_ORIGIN_DIVA, CONF_ORIGIN_NAME),
        (CONF_DESTINATION_DIVA, CONF_DESTINATION_NAME),
    ):
        diva = as_int(data.get(diva_key))
        fix = STOP_NAME_FIXES.get(diva) if diva is not None else None
        if fix is not None and data.get(name_key) == fix[0]:
            data[name_key] = fix[1]
    if data == entry.data:
        return {}
    changes: dict[str, Any] = {"data": data}
    if entry.title == _route_title(entry.data):
        changes["title"] = _route_title(data)
    return changes


def _route_title(data: Mapping[str, Any]) -> str:
    return f"{data.get(CONF_ORIGIN_NAME)} → {data.get(CONF_DESTINATION_NAME)}"
