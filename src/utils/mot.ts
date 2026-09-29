// Single source of truth for Wiener Linien MeansOfTransport values
// + their card-side icon mapping. Mirrors `LINE_TYPE_*` in
// `custom_components/wiener_linien_austria/const.py` byte-for-byte;
// test_line_type_constants_match_python_and_ts pins the five names.
//
// Duplicated rather than published as a sensor attribute: the strings
// are stable upstream constants, and an icon map on every state write would
// cost ~80 bytes to surface data that never changes.

export const LINE_TYPE_METRO = "ptMetro";
const LINE_TYPE_TRAM = "ptTram";
const LINE_TYPE_BUS_DAY = "ptBusCity";
const LINE_TYPE_BUS_NIGHT = "ptBusNight";
// Not a `/monitor` type: planned S-Bahn rows the integration adds to a board
// from the timetable. Those rows also carry `timetable: true`.
export const LINE_TYPE_S_BAHN = "ptTrainS";

/**
 * Resolve the MDI icon name for a `/monitor`-published vehicle type, or
 * null when the type is unrecognised — Wiener Linien has occasionally
 * added new MoT values (e.g. for tourist trains). Callers that need a
 * glyph regardless go through `headerIconForType` below, which supplies
 * the generic fallback; callers that want "no icon at all" branch on the
 * null themselves.
 */
export function lineTypeIcon(type: string | undefined): string | null {
  switch (type) {
    case LINE_TYPE_METRO:
      return "mdi:subway-variant";
    case LINE_TYPE_TRAM:
      return "mdi:tram";
    case LINE_TYPE_BUS_DAY:
    case LINE_TYPE_BUS_NIGHT:
      return "mdi:bus";
    case LINE_TYPE_S_BAHN:
      return "mdi:train";
    default:
      return null;
  }
}

/**
 * Header tile icon — derives from the next departure's vehicle type so
 * the card visually announces *what's coming* (bus / tram / metro).
 * Falls back to a generic transit glyph when no rows are available or
 * the type is unrecognised.
 */
export function headerIconForType(type: string | undefined): string {
  return lineTypeIcon(type) ?? "mdi:bus-stop";
}

// ---------------------------------------------------------------------------
// Transfer modes — the vehicle categories the stops-ahead trail can chip.
// ---------------------------------------------------------------------------
//
// These are derived from the LINE LABEL, not from a `type` field, because
// `stops_ahead[].lines` publishes bare labels: the trip-pattern index knows
// which lines call at a stop, not what each of them is. Extending the label
// heuristic the trail already applies (`/^[US]\d/` for the inline chips,
// `/^N\d/` for nightlines) keeps one rule rather than two that can disagree.

/** The categories a user can show or hide, in signage order. */
export const TRANSFER_MODES = [
  "metro",
  "sbahn",
  "tram",
  "badner",
  "bus",
  "night",
] as const;

export type TransferMode = (typeof TRANSFER_MODES)[number];

/** MDI glyph per category — the editor's chips and nothing else so far. */
export const TRANSFER_MODE_ICONS: Readonly<Record<TransferMode, string>> = {
  metro: "mdi:subway-variant",
  sbahn: "mdi:train",
  tram: "mdi:tram",
  // Distinct from the tram glyph on purpose: the whole point of the split is
  // that a WLB chip is not a tram chip, and two identical glyphs would undo
  // that in the one place the user actually looks.
  badner: "mdi:tram-side",
  bus: "mdi:bus",
  night: "mdi:weather-night",
};

/** The Badner Bahn's realtime label. `LB` is the `linien.csv` spelling; the
 *  integration rewrites it to `WLB` when it parses the catalogue
 *  (`REALTIME_LINE_LABELS` in const.py), so every label that reaches the card
 *  already carries the realtime spelling. */
const BADNER_BAHN_LABEL = "WLB";

/**
 * Classify a Wiener Linien line label into one of `TRANSFER_MODES`.
 *
 * `N25` is a bus by vehicle but a NightLine by category, and the user
 * toggles it as one. An N-prefixed label matches none of the other tests, so
 * without its own branch it would fall through to `tram`. After the three
 * prefixed families and the Badner Bahn's exact label, a digits-then-letter
 * label (`13A`, `25B`) is a city bus; everything left is a tram, which
 * correctly catches the numeric lines (`1`, `71`) and the letter lines
 * (`D`, `O`).
 *
 * The Badner Bahn is its own category rather than a tram, matching the rest
 * of the codebase: `linien.csv` tags LineID 399 `ptTramWLB` (not `ptTram`),
 * `_MOT_SORT_RANK` in static.py gives it a dedicated tier — so the chips
 * already arrive ordered Metro → Tram → Badner Bahn → Bus → Nightline — and
 * it carries the palette's only pure-black colour. It is a single named
 * line, so this is an exact match, not a heuristic like the tram fallback.
 *
 * An unrecognised future label lands in `tram` rather than being dropped:
 * a category toggle the user left ON should not silently swallow a line the
 * heuristic has not met yet.
 */
export function transferModeOf(label: string): TransferMode {
  const upper = label.toUpperCase();
  if (/^N\d/.test(upper)) return "night";
  if (/^U\d/.test(upper)) return "metro";
  if (/^S\d/.test(upper)) return "sbahn";
  if (upper === BADNER_BAHN_LABEL) return "badner";
  if (/^\d+[A-Z]$/.test(upper)) return "bus";
  return "tram";
}
