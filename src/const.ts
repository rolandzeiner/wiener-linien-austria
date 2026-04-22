// CARD_VERSION and RETRO_CARD_VERSION must match the corresponding
// constants in custom_components/wiener_linien_austria/const.py
// byte-for-byte. If they drift, the WebSocket version check sees a
// mismatch, shows a reload banner, the reload re-serves the same JS,
// and the banner loops forever.
//
// Bump in the same commit as const.py. manifest.json + README badge
// stay at the clean version; these constants + const.py can carry a
// `-beta-N` suffix during development.
export const CARD_VERSION = "1.2.0-beta-1";
export const RETRO_CARD_VERSION = "1.2.0-beta-1";

export const DOMAIN = "wiener_linien_austria";

// Wiener Linien corporate-identity metro colours. Authoritative — don't
// substitute "close enough" CSS-named colours. Non-metro lines stay neutral
// until the user supplies overrides via `line_colors`.
export const METRO_COLORS: Record<string, string> = {
  U1: "#E3000F",
  U2: "#A862A4",
  U3: "#EF7C00",
  U4: "#00963F",
  U5: "#008F95",
  U6: "#9D6830",
};

// MeansOfTransport values from /monitor — used to pick icons + apply
// typographic conventions (trams/buses use the line-number badge, metro
// uses the line-letter shield).
export const LINE_TYPE_METRO = "ptMetro";
export const LINE_TYPE_TRAM = "ptTram";
export const LINE_TYPE_BUS_DAY = "ptBusCity";
export const LINE_TYPE_BUS_NIGHT = "ptBusNight";
