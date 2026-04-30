// CARD_VERSION and RETRO_CARD_VERSION must match the corresponding
// constants in custom_components/wiener_linien_austria/const.py
// byte-for-byte. If they drift, the WebSocket version check sees a
// mismatch, shows a reload banner, the reload re-serves the same JS,
// and the banner loops forever.
//
// Bump in the same commit as const.py. manifest.json + README badge
// stay at the clean version; these constants + const.py can carry a
// `-beta-N` suffix during development.
export const CARD_VERSION = "1.3.0";
export const RETRO_CARD_VERSION = "1.3.0";

export const DOMAIN = "wiener_linien_austria";

// Per-line palette is sourced from the integration's GTFS-backed
// `line_colors` sensor attribute (Wiener Linien `routes.txt`). The
// hardcoded `METRO_COLORS` map this file used to carry was removed once
// the static catalogue gained colours — keeping a stale copy in the
// bundle would silently diverge from upstream after every WL palette
// change (e.g. the U5 launch).
//
// Nightlines (N-prefix bus) are a deliberate exception: GTFS treats them
// as regular buses (navy on white), but Wiener Linien's signage convention
// pairs a deeper navy with bright yellow numerals — much higher contrast
// at chip size on dark dashboards. We keep the rule here as a category
// override, applied only when the user hasn't set a `line_colors` value
// for that specific line. NIGHTLINE_FG is fixed (no per-line text-colour
// override surface yet).
export const NIGHTLINE_BG = "#1b1464";
export const NIGHTLINE_FG = "#fef200";

// MeansOfTransport values from /monitor — used to pick icons + apply
// typographic conventions (trams/buses use the line-number badge, metro
// uses the line-letter shield).
export const LINE_TYPE_METRO = "ptMetro";
export const LINE_TYPE_TRAM = "ptTram";
export const LINE_TYPE_BUS_DAY = "ptBusCity";
export const LINE_TYPE_BUS_NIGHT = "ptBusNight";
