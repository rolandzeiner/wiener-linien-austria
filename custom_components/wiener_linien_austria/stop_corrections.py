"""Corrections to stops the open data gets wrong, and to entries saved with them.

`haltestellen.csv` and `haltepunkte.csv` disagree with GTFS and the trip
planner on some stops (issue #132):

- `STOP_SPLITS`: platforms filed under a neighbour because the list lacks
  their stop, or half of a stop filed under a second ID the planner doesn't
  know. `whole`: every platform of the listed ID moves.
- `STOP_NAME_FIXES`, `STOP_POSITION_FIXES`: a wrong name or position.
- `PLANNER_ALIASES`: no error, a stop of its own that the timetable counts as
  part of a bigger one.

The corrections to the list apply only while the open data still has the
error. The ID translations don't check it: compare them again when the
timetable changes (last compared with GTFS, the trip planner and `/monitor` on
2026-11-22).

A correction added after a release needs the next minor version (the flow's
`MINOR_VERSION` and the gate in `async_migrate_entry`) to reach saved entries.
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
    # For a split that isn't whole: the lines that call at them, to tell which
    # stop a saved board meant. A merge moves every board.
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
# The list puts these three 78 to 117 km from where they are, too far west to be
# a nearby stop or a usable map link. Own positions from the trip planner's
# stop list, within 1 m of the middle of their GTFS platforms.
STOP_POSITION_FIXES: Final[
    dict[int, tuple[tuple[float, float], tuple[float, float]]]
] = {
    60201954: ((15.3863442, 48.4036711), (16.423629, 48.263450)),
    60201955: ((15.0677477, 48.7235788), (16.486520, 48.256878)),
    60201956: ((15.5786106, 48.6945799), (16.452815, 48.268635)),
}

# A stop the list lacks takes name and position from the trip planner's stop
# list, the name spelled the station list's way. One it has repeats the list's.
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
    # Both platforms of the listed "Heizwerkstraße" 60200228 are Deutschstraße's.
    # The real Heizwerkstraße is 60201742, which the list has as well.
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

# Stops of their own whose calls GTFS and the trip planner count as a bigger
# stop's: listed DIVA → that stop's. Asked with the listed one, the planner
# rejects it or finds no connection. Not merged: on some routes a vehicle calls
# at both, and one board would list it twice (Gottschalkgasse, which shares no
# route with Enkplatz's own platforms, stays apart for its name). The trip
# request and skip detection take the planner's ID, live rows and trail times
# only for `LIVE_ALIASES`.
PLANNER_ALIASES: Final[dict[int, int]] = {
    60201974: 60200094,  # Atzgersdorf S, Knotzenbachgasse → Atzgersdorf
    60201757: 60200425,  # Enkplatz, Gottschalkgasse → Enkplatz
    60201785: 60200956,  # Ober St. Veit, Franz-Boos-Gasse → Ober St. Veit
    60201964: 60200910,  # Aspern Nord, Mayrederbrücke → Aspern Nord
    60202502: 60201894,  # Stadion U, Handelskai → Stadion
    60202501: 60200949,  # Oberlaa, Laaer-Berg-Straße → Oberlaa
}

# Aliases where a call under the planner's ID can only be the listed stop's for
# the lines there (the trams' other Enkplatz stop, Grillgasse, has an ID of its
# own), so their live rows and trail times join on the planner's ID.
LIVE_ALIASES: Final[frozenset[int]] = frozenset({60201757})

_MERGED: Final[dict[int, StopSplit]] = {
    split.listed_under: split for split in STOP_SPLITS if split.whole
}


def merged_diva(diva: int) -> int:
    """The stop that took all of `diva`'s platforms, or `diva` itself."""
    split = _MERGED.get(diva)
    return split.diva if split is not None else diva


def planner_diva(diva: int) -> int:
    """The planner's ID for a listed stop: to ask with, and in its answers."""
    return PLANNER_ALIASES.get(diva, merged_diva(diva))


def live_alias_stops(diva: int) -> list[int]:
    """The listed stops whose live rows are calls at the planner's `diva`."""
    return [listed for listed in LIVE_ALIASES if PLANNER_ALIASES[listed] == diva]


def corrected_diva(rbl: int, diva: str) -> str:
    """The DIVA a `/monitor` row joins a planned ride on.

    Its own stop's where the open data misfiles the platform, the planner's
    for `LIVE_ALIASES`, else the one `/monitor` sends.
    """
    for split in STOP_SPLITS:
        if rbl in split.rbls and diva == str(split.listed_under):
            return str(split.diva)
    listed = as_int(diva)
    if listed is not None and listed in LIVE_ALIASES:
        return str(PLANNER_ALIASES[listed])
    return diva


def split_off_platforms(diva: int, rbls: Iterable[Any]) -> list[int]:
    """Those of a board's saved platforms that are now filed under another stop."""
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
    """What `async_update_entry` changes on an entry saved with uncorrected stops."""
    if entry.data.get(CONF_ENTRY_TYPE) == ENTRY_TYPE_ROUTE:
        return _route_corrections(entry)
    return _board_corrections(hass, entry)


def _board_corrections(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """A board follows the lines it tracks, and loses none of their departures.

    - At a merged stop it moves to the stop it joined, with the platforms it
      had. A board already at that stop gets them too.
    - At a split stop it moves if it tracks only lines that call at the new
      stop alone, gives those platforms up if it tracks none that call there,
      and keeps them otherwise, also when it tracks all lines (no selection).
    - It never moves onto a stop that is set up already, and then keeps them.

    A title changes only while it is still the stop's name.
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
    """A route keeps its stop IDs, its identity, and takes the corrected names.

    `planner_diva` translates the IDs on each request.
    """
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
