"""Corrections to stops the open data gets wrong, and to entries saved with them.

`haltestellen.csv` and `haltepunkte.csv` don't agree with GTFS and the trip
planner on which stop some platforms belong to (issue #132, where the 60's
Maurer Lange Gasse was listed as "Valentingasse"). Two shapes:

- A stop whose platforms are filed under a neighbour, mostly because the list
  lacks its ID. Boards and routes found it only under the neighbour's name.
- Half of a stop filed under a second ID the planner doesn't know. A board at
  the stop missed that half's departures, and a route from the second ID
  failed.

Found by matching every timetabled platform and line in GTFS to the list, and
live `/monitor` departures to the timetable where lines were running. Checked
2026-11-22; the timetable changes in December.

Each correction to the list applies only while the open data still has the
error, so it steps aside when Wiener Linien fixes the files. Once a release
carries a minor version of the config entry, a correction added later needs
the next one, for `entry_corrections` to reach saved entries.
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
    """Platforms the open data files under another stop than their own."""

    listed_under: int
    diva: int
    name: str
    longitude: float
    latitude: float
    rbls: tuple[int, ...]
    # The lines that call at them, to tell which stop a saved board meant.
    lines: frozenset[str] = frozenset()
    # Those of `lines` that also call at a platform staying behind. A board
    # tracking one can't move without losing departures.
    shared: frozenset[str] = frozenset()
    # Every platform of `listed_under`, which is then no stop at all.
    whole: bool = False


# DIVA → (the station list's name, the stop's own).
STOP_NAME_FIXES: Final[dict[int, tuple[str, str]]] = {
    60200855: ("Valentingasse", "Maurer Lange Gasse"),
    60200283: ("Erdbergstraße, Schlachthausgasse", "Wällischgasse"),
}

# DIVA → (the station list's position, the stop's own), as (longitude, latitude).
# The list puts these three 78 to 117 km west of Vienna, so they were never a
# nearby stop and their map links pointed there. Own positions from the trip
# planner's stop list, which GTFS agrees with to 5 m.
STOP_POSITION_FIXES: Final[
    dict[int, tuple[tuple[float, float], tuple[float, float]]]
] = {
    60201954: ((15.3863442, 48.4036711), (16.423629, 48.263450)),
    60201955: ((15.0677477, 48.7235788), (16.486520, 48.256878)),
    60201956: ((15.5786106, 48.6945799), (16.452815, 48.268635)),
}

# Name and position of a stop the list lacks from the trip planner's stop list,
# spelled as the station list spells names; of one it has, from the list.
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
    # 76A and 76B stop at both. Enkplatz keeps the U3 and their other platform.
    StopSplit(
        listed_under=60200425,
        diva=60201987,
        name="Enkplatz, Grillgasse",
        longitude=16.416335,
        latitude=48.174191,
        rbls=(412, 435, 799, 2009, 2036, 5634, 5644),
        lines=frozenset({"6", "11", "15A", "71", "76A", "76B", "D", "N6", "N71"}),
        shared=frozenset({"76A", "76B"}),
    ),
    StopSplit(
        listed_under=60201505,
        diva=60201988,
        name="Wolkersbergenstraße",
        longitude=16.272954,
        latitude=48.177593,
        rbls=(8113, 8957),
        lines=frozenset({"53A"}),
    ),
    StopSplit(
        listed_under=60201305,
        diva=60201972,
        name="Johannesgasse",
        longitude=16.379701,
        latitude=48.201482,
        rbls=(5725,),
        lines=frozenset({"N75"}),
    ),
    # The route data also has N75 at a platform of Schlachthausgasse itself.
    StopSplit(
        listed_under=60201199,
        diva=60201968,
        name="Würtzlerstraße",
        longitude=16.408905,
        latitude=48.194548,
        rbls=(2507, 5088),
        lines=frozenset({"N75"}),
        shared=frozenset({"N75"}),
    ),
    # 60201742 is the Heizwerkstraße that vehicles call at.
    StopSplit(
        listed_under=60200228,
        diva=60201975,
        name="Deutschstraße",
        longitude=16.358097,
        latitude=48.139751,
        rbls=(2054, 2143),
        whole=True,
    ),
    # Halves of one stop. None shares a route with the platforms it joins, so
    # no board lists a vehicle twice.
    StopSplit(
        listed_under=60201326,
        diva=60200401,
        name="Stock im Weg",
        longitude=16.2601804,
        latitude=48.1803125,
        rbls=(8965,),
        whole=True,
    ),
    StopSplit(
        listed_under=60201850,
        diva=60200035,
        name="Altmannsdorfer Straße",
        longitude=16.3166125,
        latitude=48.1655993,
        rbls=(2609, 9171),
        whole=True,
    ),
    StopSplit(
        listed_under=60201591,
        diva=60201182,
        name="Schottenring",
        longitude=16.3711313,
        latitude=48.2169214,
        rbls=(5545,),
        whole=True,
    ),
    StopSplit(
        listed_under=60201789,
        diva=60201790,
        name="Bahnhofstraße",
        longitude=16.2639533,
        latitude=48.2007757,
        rbls=(3232,),
        whole=True,
    ),
    StopSplit(
        listed_under=60200335,
        diva=60200744,
        name="Lafitegasse",
        longitude=16.2677981,
        latitude=48.1761973,
        rbls=(8961,),
        whole=True,
    ),
)

_MERGED: Final[dict[int, StopSplit]] = {
    split.listed_under: split for split in STOP_SPLITS if split.whole
}


def merged_diva(diva: int) -> int:
    """The stop that took all of `diva`'s platforms, or `diva` itself."""
    split = _MERGED.get(diva)
    return split.diva if split is not None else diva


def planner_diva(diva: int) -> int:
    """The ID to ask the trip planner with for a stop of the list."""
    return merged_diva(diva)


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

    A board at a stop that was merged whole moves with it. One at a stop that
    was split moves if every line it tracks calls at the new stop alone, gives
    those platforms up if none calls there, and keeps all of them otherwise.
    A board never moves onto a stop that is set up already. A board at a stop
    that took another's platforms gets them.
    """
    data = dict(entry.data)
    diva = as_int(data.get(CONF_DIVA))
    if diva is None:
        return {}
    keys = {**entry.data, **entry.options}.get(CONF_LINES) or []
    tracked = {str(key).partition("|")[0] for key in keys}
    changes: dict[str, Any] = {}
    for split in STOP_SPLITS:
        saved = list(data.get(CONF_RBLS) or [])
        if split.whole and split.diva == diva:
            data[CONF_RBLS] = saved + [rbl for rbl in split.rbls if rbl not in saved]
        if split.listed_under != diva:
            continue
        moves = split.whole or (bool(tracked) and tracked <= split.lines - split.shared)
        unique_id = f"diva_{split.diva}"
        if moves and not (
            hass.config_entries.async_entry_for_domain_unique_id(DOMAIN, unique_id)
        ):
            if entry.title == data.get(CONF_STOP_NAME) != split.name:
                changes["title"] = split.name
            data |= {
                CONF_DIVA: split.diva,
                CONF_STOP_NAME: split.name,
                CONF_RBLS: list(split.rbls),
            }
            return {**changes, "data": data, "unique_id": unique_id}
        if not moves and tracked and not tracked & split.lines:
            data[CONF_RBLS] = [rbl for rbl in saved if as_int(rbl) not in split.rbls]

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
        if diva is None:
            continue
        if (merged := _MERGED.get(diva)) is not None:
            data[name_key] = merged.name
        elif (fix := STOP_NAME_FIXES.get(diva)) and data.get(name_key) == fix[0]:
            data[name_key] = fix[1]
    if data == entry.data:
        return {}
    changes: dict[str, Any] = {"data": data}
    if entry.title == _route_title(entry.data):
        changes["title"] = _route_title(data)
    return changes


def _route_title(data: Mapping[str, Any]) -> str:
    return f"{data.get(CONF_ORIGIN_NAME)} → {data.get(CONF_DESTINATION_NAME)}"
