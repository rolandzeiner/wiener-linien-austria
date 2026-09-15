"""Stop picker options and stop resolution, shared by every stop picker.

The setup dialog (config_flow.py) and the route card's ad-hoc mode
(websocket.py) offer the same list and accept the same stops: only a stop
with platforms can be tracked or planned from, since `/monitor` is queried
per RBL. The `plan_trip` action accepts the same stops, by name as well
(`match_stops`).
"""

from __future__ import annotations

import logging
import re
import unicodedata
from difflib import SequenceMatcher
from typing import Any, Final

from homeassistant.helpers.selector import SelectOptionDict
from homeassistant.util.location import distance

from .const import NEARBY_STOP_LIMIT, NEARBY_STOP_MAX_METERS
from .static import StaticCatalogue, Station

_LOGGER = logging.getLogger(__name__)


def nearest_stations(
    catalogue: StaticCatalogue,
    latitude: float,
    longitude: float,
    *,
    limit: int = NEARBY_STOP_LIMIT,
    max_meters: float = NEARBY_STOP_MAX_METERS,
) -> list[tuple[Station, float]]:
    """Return the closest stations to (latitude, longitude), nearest first.

    Each tuple is `(station, metres)`. Stations further away than
    `max_meters` are dropped entirely — an empty result means the home
    location is outside the network and the picker simply opens on the
    alphabetical list instead of a nearby block.

    Stations with no RBLs are skipped: `/monitor` is queried per RBL, so
    a platform-less DIVA can only ever produce a `cannot_connect` dead
    end in `select_lines`. Never suggest a stop that can't be tracked.

    Uses HA's own Vincenty implementation rather than a hand-rolled
    haversine. Measured at ~17 ms for a full 4 500-station sweep, which
    is well inside what a config-flow step can absorb, so there is no
    bounding-box pre-filter to keep correct.
    """
    scored: list[tuple[Station, float]] = []
    for station in catalogue.stations_by_diva.values():
        if not station.rbls:
            continue
        meters = distance(latitude, longitude, station.latitude, station.longitude)
        if meters is None or meters > max_meters:
            continue
        scored.append((station, meters))
    # Name is the tie-breaker so the ordering is stable across renders —
    # dict iteration order is stable too, but co-located stops would
    # otherwise shuffle if the catalogue is refreshed mid-flow.
    scored.sort(key=lambda row: (row[1], row[0].name))
    return scored[:limit]


def format_distance(meters: float, language: str) -> str:
    """Render a distance for a picker label: '450 m' / '1.2 km' / '1,2 km'.

    Rounded to 10 m because the underlying coordinates are stop-centre
    points, not the platform the user actually walks to — more precision
    would be false precision. German locales get the decimal comma:
    SelectOptionDict labels bypass HA's translation system entirely, so
    any locale-dependent formatting has to happen here.
    """
    if meters < 1000:
        return f"{round(meters / 10) * 10} m"
    text = f"{meters / 1000:.1f} km"
    if language.startswith("de"):
        text = text.replace(".", ",")
    return text


def _nearby_label(label: str, meters: float, language: str) -> str:
    """Append a distance to a stop label: 'Stephansplatz (Wien) — 450 m'."""
    return f"{label} — {format_distance(meters, language)}"


def _line_suffix(catalogue: StaticCatalogue, station: Station, limit: int = 4) -> str:
    """The lines serving a stop, for telling same-named stops apart.

    Truncated because a hub like Schottenring is served by 14 lines and a
    label that long is unreadable in a dropdown. Empty when the cache
    predates the trip-pattern index or the stop has no scheduled lines —
    callers fall back to the DIVA.
    """
    tpi = catalogue.trip_patterns
    labels = tpi.lines_at_diva.get(station.diva, ()) if tpi is not None else ()
    if not labels:
        return ""
    shown = list(labels[:limit])
    if len(labels) > limit:
        shown.append("…")
    return ", ".join(shown)


def _unique_stop_labels(catalogue: StaticCatalogue) -> dict[int, str]:
    """Map every trackable DIVA to a label no other stop shares.

    Vienna has a dozen stop names that repeat across two DIVAs inside the
    same municipality — "Schottenring (Wien)" is both the U2/U4 hub and a
    nightline-only stop. Rendering both as the same string leaves the user
    picking blind, so colliding names get the lines that serve them
    appended ("Schottenring (Wien) · U2, U4, 1, 2, …").

    A handful of collisions are served by an identical line set
    (Lafitegasse, both 54A). Those get the DIVA appended as well — ugly,
    but a label that can't be told apart is worse than an ugly one.
    """
    groups: dict[str, list[Station]] = {}
    for station in catalogue.stations_by_diva.values():
        if station.rbls:
            groups.setdefault(_stop_label(station), []).append(station)

    labels: dict[int, str] = {}
    for base, group in groups.items():
        if len(group) == 1:
            labels[group[0].diva] = base
            continue
        resolved = {}
        for station in group:
            suffix = _line_suffix(catalogue, station)
            resolved[station.diva] = f"{base} · {suffix}" if suffix else base
        if len(set(resolved.values())) < len(group):
            resolved = {diva: f"{label} · #{diva}" for diva, label in resolved.items()}
        labels.update(resolved)
    return labels


def trackable_station(catalogue: StaticCatalogue, value: Any) -> Station | None:
    """Resolve a picker value (a DIVA) back to a trackable Station, or None.

    The combo box accepts free text (`custom_value=True`), and the WebSocket
    `plan` command and `plan_trip` pass values from outside any picker, so
    anything may arrive here. It also re-checks `rbls`, which keeps the
    resolution honest if the catalogue was refreshed between rendering the
    form and submitting it.
    """
    try:
        diva = int(value)
    except (TypeError, ValueError):
        # Typed text that isn't a DIVA. Callers fall back to a name search
        # or their own error, so this stays at DEBUG.
        _LOGGER.debug("Failed to parse diva %r", value)
        return None
    station = catalogue.stations_by_diva.get(diva)
    if station is None or not station.rbls:
        return None
    return station


# A spoken or typed name that is this close to a stop name counts as that stop
# when nothing matches more exactly: "Schoenbrunn" for "Schönbrunn", a letter
# lost to speech recognition. Low enough for one wrong letter in a ten-letter
# name, high enough that a different street with the same ending doesn't match.
FUZZY_STOP_CUTOFF: Final = 0.85
# How many stops an ambiguous name lists, so the error stays readable aloud.
MAX_STOP_CANDIDATES: Final = 5

# Abbreviations the stop list uses, spelled out: "Bösendorfer Str., Karlsplatz"
# and "Bhf. Hütteldorf" are said as "Straße" and "Bahnhof".
_ABBREVIATIONS: Final = (
    (re.compile(r"str\.", re.IGNORECASE), "strasse "),
    (re.compile(r"\bbhf\b\.?", re.IGNORECASE), "bahnhof "),
)
_NON_WORD: Final = re.compile(r"[^0-9a-z]+")


def _normalise_stop_name(text: str) -> str:
    """Fold a stop name to what matching compares: 'bahnhof hutteldorf'.

    Case, accents, `ß`, punctuation and spacing don't tell stops apart, and
    are exactly what speech recognition and typing get wrong.
    """
    for pattern, replacement in _ABBREVIATIONS:
        text = pattern.sub(replacement, text)
    decomposed = unicodedata.normalize("NFKD", text.casefold())
    stripped = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return _NON_WORD.sub(" ", stripped).strip()


def _station_rank(catalogue: StaticCatalogue, station: Station) -> tuple[int, int]:
    """Busier stops first: more lines, then more platforms."""
    lines = (
        catalogue.trip_patterns.lines_at_diva.get(station.diva, ())
        if catalogue.trip_patterns is not None
        else ()
    )
    return (len(lines), len(station.rbls))


def match_stops(catalogue: StaticCatalogue, query: str) -> list[Station]:
    """Resolve a stop given by name or DIVA; exactly one result is a match.

    For the `plan_trip` action, where the stop comes from a script or a voice
    assistant rather than a picker. Tried in order, the first tier that finds
    anything wins:

    1. A DIVA number.
    2. The name, ignoring case, accents and punctuation, optionally followed
       by the municipality ("Westbahnhof Wien"). "Bahnhof" in front may be
       left out, so "Hütteldorf" finds "Bhf. Hütteldorf".
    3. The start of a name, on a word boundary, optionally after the
       municipality: "Wien Mitte" finds "Mitte-Landstraße".
    4. Every word of the query appearing in one stop's name and municipality
       ("Hauptbahnhof Süd").
    5. The closest name by spelling, at `FUZZY_STOP_CUTOFF` or above.

    A few names repeat within one municipality ("Schottenring" is the U2/U4
    hub and a nightline-only stop nearby). Those resolve to the busiest of
    them instead of asking, since the trip planner walks between the two
    anyway. The same name in different municipalities, or different names
    matched equally well, returns them all, busiest first, capped at
    `MAX_STOP_CANDIDATES`. No match returns an empty list.
    """
    text = query.strip()
    if text.isdigit():
        station = trackable_station(catalogue, text)
        return [station] if station is not None else []
    wanted = _normalise_stop_name(text)
    if not wanted:
        return []

    stations = [s for s in catalogue.stations_by_diva.values() if s.rbls]
    names = {s.diva: _normalise_stop_name(s.name) for s in stations}
    places = {s.diva: _normalise_stop_name(s.municipality) for s in stations}

    def aliases(station: Station) -> set[str]:
        name = names[station.diva]
        found = {name, f"{name} {places[station.diva]}"}
        if name.startswith("bahnhof "):
            short = name.removeprefix("bahnhof ")
            found |= {short, f"{short} {places[station.diva]}"}
        return found

    matches = [s for s in stations if wanted in aliases(s)]
    if not matches:
        # "Wien Mitte" is how people say "Mitte-Landstraße (Wien)".
        prefix = f"{wanted} "
        matches = [
            s
            for s in stations
            if any(
                alias.startswith(prefix)
                for alias in (names[s.diva], f"{places[s.diva]} {names[s.diva]}")
            )
        ]
    if not matches:
        words = set(wanted.split())
        matches = [
            s
            for s in stations
            if words <= set(f"{names[s.diva]} {places[s.diva]}".split())
        ]
        if len(matches) > 1:
            # "Hauptbahnhof" also finds "Hauptbahnhof Süd": the fewest extra
            # words is the stop that was meant.
            fewest = min(len(names[s.diva].split()) for s in matches)
            matches = [s for s in matches if len(names[s.diva].split()) == fewest]
    if not matches:
        # The matcher caches what it learns about `wanted`, and the cheap upper
        # bounds skip most of the ~2,000 names before the full comparison.
        matcher = SequenceMatcher(None)
        matcher.set_seq2(wanted)
        best = FUZZY_STOP_CUTOFF
        for station in stations:
            score = 0.0
            for alias in aliases(station):
                matcher.set_seq1(alias)
                if matcher.real_quick_ratio() >= best and matcher.quick_ratio() >= best:
                    score = max(score, matcher.ratio())
            if score > best:
                best, matches = score, [station]
            elif score == best:
                matches.append(station)

    matches.sort(key=lambda s: _station_rank(catalogue, s), reverse=True)
    if len({(names[s.diva], places[s.diva]) for s in matches}) == 1:
        return matches[:1]
    return matches[:MAX_STOP_CANDIDATES]


def stop_candidate_labels(catalogue: StaticCatalogue, stations: list[Station]) -> str:
    """Name ambiguous stops so they can be told apart: 'A (Wien), B (Schwechat)'."""
    labels = _unique_stop_labels(catalogue)
    return ", ".join(labels.get(s.diva, _stop_label(s)) for s in stations)


def _stop_label(station: Station) -> str:
    """Render a plain stop option: 'Stephansplatz (Wien)'."""
    return f"{station.name} ({station.municipality})"


def stop_options(
    catalogue: StaticCatalogue,
    latitude: float,
    longitude: float,
    language: str,
) -> list[SelectOptionDict]:
    """Every trackable stop as one picker option, nearest to home first.

    HA renders a DROPDOWN SelectSelector as a combo box that filters on
    the option labels client-side, so shipping the whole catalogue in one
    control gives type-to-filter over every stop without a round trip.
    Picking a suggestion goes straight to line selection; only free text
    that matched no stop exactly falls through to `select_stop`. The route
    card gets the same list over `wiener_linien_austria/stops` and filters
    it in its own combobox (src/stop-combobox.ts), not HA's selector.

    Ordering carries the useful default: the stops closest to the home
    location head the list with their distance shown, so the unfiltered
    dropdown opens on "probably one of these". Everything else follows
    alphabetically. `sort=False` on the selector preserves this order.

    Stops the nearby block already pinned are dropped from the
    alphabetical remainder — a duplicate `value` in a select is
    ambiguous, and the pinned row is the more informative of the two.

    Falls back to a purely alphabetical list when the home location is
    unset or nothing is in range; the dropdown is equally usable either
    way, the nearby block is only a shortcut.
    """
    labels = _unique_stop_labels(catalogue)

    nearby: list[tuple[Station, float]] = []
    if latitude or longitude:
        nearby = nearest_stations(catalogue, latitude, longitude)

    options = [
        SelectOptionDict(
            value=str(station.diva),
            label=_nearby_label(labels[station.diva], meters, language),
        )
        for station, meters in nearby
    ]
    pinned = {station.diva for station, _ in nearby}
    remainder = sorted(
        (
            station
            for station in catalogue.stations_by_diva.values()
            # Same exclusion as `nearest_stations`: /monitor is queried
            # per RBL, so a platform-less DIVA can only dead-end.
            if station.rbls and station.diva not in pinned
        ),
        key=lambda station: (station.name.casefold(), station.municipality.casefold()),
    )
    options.extend(
        SelectOptionDict(value=str(station.diva), label=labels[station.diva])
        for station in remainder
    )
    return options
