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
