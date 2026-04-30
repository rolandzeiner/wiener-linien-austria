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

// MeansOfTransport values + icon mapping moved to ./utils/mot.ts —
// single source of truth, no longer mirrored on three files.
// Re-exported here so existing import paths continue to resolve, but
// new code should import directly from ./utils/mot.js.
export {
  LINE_TYPE_BUS_DAY,
  LINE_TYPE_BUS_NIGHT,
  LINE_TYPE_METRO,
  LINE_TYPE_TRAM,
  headerIconForType,
  lineTypeIcon,
} from "./utils/mot.js";
