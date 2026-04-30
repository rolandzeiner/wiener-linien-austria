// Single source of truth for Wiener Linien MeansOfTransport values
// + their card-side icon mapping. Mirrors `LINE_TYPE_*` in
// `custom_components/wiener_linien_austria/const.py` byte-for-byte; the
// parity test in tests/test_card_version.py asserts both directions.
//
// Why a card-side SoT and not "trust the coordinator" (sensor attribute)?
// The four MeansOfTransport strings are stable URL-published constants
// from the live /monitor endpoint and have been the same for 30+ years
// (ptMetro/ptTram/ptBusCity/ptBusNight). Publishing an icon map as a
// sensor attribute would burn ~80 bytes per recorder write to surface
// data that never changes. The local SoT keeps the const in one place
// without paying the per-state-write cost.

export const LINE_TYPE_METRO = "ptMetro";
export const LINE_TYPE_TRAM = "ptTram";
export const LINE_TYPE_BUS_DAY = "ptBusCity";
export const LINE_TYPE_BUS_NIGHT = "ptBusNight";

/**
 * Resolve the MDI icon name for a `/monitor`-published vehicle type.
 * Falls through to a generic transit glyph for unknown types — Wiener
 * Linien has occasionally added new MoT values (e.g. for tourist trains)
 * and the card should degrade gracefully rather than crash on unknowns.
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
