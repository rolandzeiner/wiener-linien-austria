// All four must equal CARD_VERSION in
// custom_components/wiener_linien_austria/const.py: every card's banner
// compares its own constant with the card_version answer. One that drifts
// shows the banner, and after a reload the clear-the-cache message, until it
// is fixed. tests/test_card_version.py pins all four.
export const CARD_VERSION = "2.6.0";
export const RETRO_CARD_VERSION = "2.6.0";
export const FLAP_CARD_VERSION = "2.6.0";
export const ROUTE_CARD_VERSION = "2.6.0";

/** The integration's domain; the version banner asks `<DOMAIN>/card_version`. */
export const DOMAIN = "wiener_linien_austria";

// CC-BY credit shown in a card footer until the sensor reports its own
// `attribution` attribute (fresh card, sensor not up yet). Same text as
// ATTRIBUTION in const.py.
export const ATTRIBUTION_FALLBACK = "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";

// Per-line palette is sourced from the integration's GTFS-backed
// `line_colors` sensor attribute (Wiener Linien `routes.txt`); a
// hardcoded copy here would silently diverge after every WL palette
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
