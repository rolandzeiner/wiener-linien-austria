import { NIGHTLINE_BG, NIGHTLINE_FG } from "../const.js";
import type {
  LineColorsMap,
  RetroSize,
  RetroStationBg,
  RetroStyle,
  WalkTimes,
  WienerLinienCardConfig,
  WienerLinienRetroCardConfig,
} from "../types.js";

const RETRO_SIZES: ReadonlySet<RetroSize> = new Set(["small", "medium", "regular"] as const);
const RETRO_STATION_BG: ReadonlySet<RetroStationBg> = new Set([
  "default",
  "white",
  "black",
] as const);
const RETRO_STYLES: ReadonlySet<RetroStyle> = new Set(["classic", "warm", "pixel"] as const);

function normaliseWalkTimes(raw: unknown): WalkTimes | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: WalkTimes = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    if (!Number.isFinite(n)) continue;
    if (n < 0 || n > 120) continue;
    // Legacy keys carry the line-towards triple ("U1|R|Oberlaa"); the
    // current shape is a (line, direction) pair ("U1|R") so the
    // threshold applies to every train on that direction regardless of
    // which terminus the API currently labels them with. Collapse any
    // surviving triple keys to pairs and, on collision, keep the
    // larger value (more conservative for the user).
    const parts = k.split("|");
    const key = parts.length >= 3 ? `${parts[0]}|${parts[1]}` : k;
    const rounded = Math.round(n);
    const prev = out[key];
    out[key] = prev === undefined ? rounded : Math.max(prev, rounded);
  }
  return Object.keys(out).length ? out : undefined;
}

export interface NormalisedModernStop {
  entity: string;
  lines?: string[];
  direction?: "H" | "R";
  line_directions?: Record<string, "H" | "R">;
  walk_times?: WalkTimes;
}

function normaliseLineDirections(
  raw: unknown,
): Record<string, "H" | "R"> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, "H" | "R"> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string" || !k.length) continue;
    if (v === "H" || v === "R") out[k] = v;
    // Any other value (including "Both" / "" / undefined) means
    // "no override" — which is encoded as the absence of the key.
  }
  return Object.keys(out).length ? out : undefined;
}

function normaliseStopEntry(raw: unknown): NormalisedModernStop | null {
  if (typeof raw === "string") {
    return raw.startsWith("sensor.") ? { entity: raw } : null;
  }
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const entity = typeof r.entity === "string" ? r.entity : null;
  if (!entity?.startsWith("sensor.")) return null;
  const stop: NormalisedModernStop = { entity };
  if (Array.isArray(r.lines)) {
    const lines = r.lines.filter((l): l is string => typeof l === "string" && l.length > 0);
    if (lines.length) stop.lines = lines;
  }
  if (r.direction === "H" || r.direction === "R") stop.direction = r.direction;
  const lineDirs = normaliseLineDirections(r.line_directions);
  if (lineDirs) stop.line_directions = lineDirs;
  const walk = normaliseWalkTimes(r.walk_times);
  if (walk) stop.walk_times = walk;
  return stop;
}

export interface NormalisedModernConfigValidated {
  // HA's Lovelace editor wrapper re-validates every `config-changed` payload
  // against `type` — omit it and HA flags the card with "Kein Typ angegeben"
  // / "No type specified" and refuses to render. Preserve whatever the raw
  // config carried (including the `custom:` prefix) instead of hardcoding it
  // here so stripped/yaml-registered installs still round-trip cleanly.
  type: string;
  entities: NormalisedModernStop[];
  max_departures: number;
  line_colors: Record<string, string>;
  show_accessibility: boolean;
  accessibility_only: boolean;
  show_traffic_info: boolean;
  show_elevator_info: boolean;
  show_delay: boolean;
  show_type_icon: boolean;
  show_platform: boolean;
  show_hero_metric: boolean;
  show_departures: boolean;
  show_stops_ahead: boolean;
  show_qr_button: boolean;
  hide_header: boolean;
  hide_attribution: boolean;
  layout: "stacked" | "tabs";
}

// Passthrough fields HA injects on the card config itself — section-view
// grid sizing, legacy view layout, conditional visibility. The editor
// must round-trip these unchanged on every config-changed payload, else
// HA writes back the stripped config and the user's column choice resets.
// Kept as a separate type so `Omit<NormalisedModernConfigValidated, ...>`
// for MODERN_DEFAULTS doesn't get collapsed to `unknown` by the index
// signature (Omit + index signature loses explicit property types).
export type NormalisedModernConfig = NormalisedModernConfigValidated & {
  [key: string]: unknown;
};

// Keys this normaliser actively handles — used to filter the raw
// passthrough so a future schema addition can't accidentally surface
// pre-normalisation through the spread. Includes both validated keys
// AND the v0.1.x flat back-compat keys (`entity` / `lines` / `direction`
// / `walk_times`) which are promoted into `entities[0]` and must NOT
// leak through unchanged.
const MODERN_VALIDATED_KEYS: ReadonlySet<string> = new Set([
  "type",
  "entities",
  "entity",
  "lines",
  "direction",
  "walk_times",
  "max_departures",
  "line_colors",
  "show_accessibility",
  "accessibility_only",
  "show_traffic_info",
  "show_elevator_info",
  "show_delay",
  "show_type_icon",
  "show_platform",
  "show_hero_metric",
  "show_departures",
  "show_stops_ahead",
  "show_qr_button",
  "hide_header",
  "hide_attribution",
  "layout",
]);

const MODERN_DEFAULTS: Omit<NormalisedModernConfigValidated, "entities" | "line_colors" | "type"> = {
  max_departures: 6,
  show_accessibility: false,
  accessibility_only: false,
  show_traffic_info: true,
  show_elevator_info: true,
  show_delay: true,
  show_type_icon: false,
  show_platform: true,
  show_hero_metric: true,
  show_departures: true,
  show_stops_ahead: true,
  show_qr_button: true,
  hide_header: false,
  hide_attribution: false,
  layout: "stacked",
};

export function normaliseModernConfig(raw: WienerLinienCardConfig): NormalisedModernConfig {
  // Back-compat: flat single-entity shape gets promoted to entities[0].
  let rawEntities: unknown[] = [];
  if (Array.isArray(raw.entities)) {
    rawEntities = raw.entities;
  } else if (typeof raw.entity === "string") {
    rawEntities = [
      {
        entity: raw.entity,
        lines: raw.lines,
        direction: raw.direction,
        walk_times: raw.walk_times,
      },
    ];
  }

  const entities: NormalisedModernStop[] = [];
  const seen = new Set<string>();
  for (const r of rawEntities) {
    const stop = normaliseStopEntry(r);
    if (!stop) continue;
    if (seen.has(stop.entity)) continue;
    seen.add(stop.entity);
    entities.push(stop);
  }

  const maxRaw = Number(raw.max_departures);
  // Lower bound 0 enables hero-only mode: user sees the upcoming
  // departure(s) in the hero block and no row list. Useful for tight
  // dashboards where the next bus/tram is the only thing the user
  // cares about. Upper bound 20 stays — pragmatic limit before the
  // row list becomes a wall of text.
  const maxClamped = Number.isFinite(maxRaw) ? Math.max(0, Math.min(20, Math.round(maxRaw))) : MODERN_DEFAULTS.max_departures;

  const lineColors: Record<string, string> = {};
  if (raw.line_colors && typeof raw.line_colors === "object") {
    for (const [k, v] of Object.entries(raw.line_colors)) {
      if (typeof v === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(v.trim())) {
        lineColors[k.toUpperCase()] = v.trim();
      }
    }
  }

  // Filter raw to ONLY the keys this normaliser doesn't handle —
  // passes through dashboard layout fields (grid_options, view_layout,
  // visibility, layout_options) without smuggling pre-normalisation
  // versions of validated keys into the result.
  const passthrough: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!MODERN_VALIDATED_KEYS.has(k)) passthrough[k] = v;
  }

  return {
    ...passthrough,
    type: raw.type || "custom:wiener-linien-austria-card",
    entities,
    max_departures: maxClamped,
    line_colors: lineColors,
    show_accessibility: raw.show_accessibility ?? MODERN_DEFAULTS.show_accessibility,
    accessibility_only: raw.accessibility_only ?? MODERN_DEFAULTS.accessibility_only,
    show_traffic_info: raw.show_traffic_info ?? MODERN_DEFAULTS.show_traffic_info,
    show_elevator_info: raw.show_elevator_info ?? MODERN_DEFAULTS.show_elevator_info,
    show_delay: raw.show_delay ?? MODERN_DEFAULTS.show_delay,
    show_type_icon: raw.show_type_icon ?? MODERN_DEFAULTS.show_type_icon,
    show_platform: raw.show_platform ?? MODERN_DEFAULTS.show_platform,
    show_hero_metric: raw.show_hero_metric ?? MODERN_DEFAULTS.show_hero_metric,
    show_departures: raw.show_departures ?? MODERN_DEFAULTS.show_departures,
    show_stops_ahead: raw.show_stops_ahead ?? MODERN_DEFAULTS.show_stops_ahead,
    show_qr_button: raw.show_qr_button ?? MODERN_DEFAULTS.show_qr_button,
    hide_header: raw.hide_header ?? MODERN_DEFAULTS.hide_header,
    hide_attribution: raw.hide_attribution ?? MODERN_DEFAULTS.hide_attribution,
    layout: raw.layout === "tabs" ? "tabs" : "stacked",
  };
}

export interface NormalisedRetroConfigValidated {
  // See NormalisedModernConfig.type — HA requires `type` on every config
  // in the `config-changed` payload or it flags "Kein Typ angegeben".
  type: string;
  // `?: T | undefined` is the dual form that lets callers EITHER omit the
  // key (e.g. `delete next.line`) OR assign `undefined` explicitly. The
  // bare `?:` form alone would reject explicit `undefined` under
  // `exactOptionalPropertyTypes`, so we widen with the union.
  entity?: string | undefined;
  direction: "H" | "R";
  line?: string | undefined;
  show_platform: boolean;
  show_station_name: boolean;
  station_bg: RetroStationBg;
  size: RetroSize;
  style: RetroStyle;
  flicker: boolean;
  wheelchair_race: boolean;
  accessibility_only: boolean;
  walk_times?: WalkTimes | undefined;
}

// See NormalisedModernConfig — same passthrough rule for dashboard
// layout fields injected onto the card config.
export type NormalisedRetroConfig = NormalisedRetroConfigValidated & {
  [key: string]: unknown;
};

// See MODERN_VALIDATED_KEYS — retro card's mirror set.
const RETRO_VALIDATED_KEYS: ReadonlySet<string> = new Set([
  "type",
  "entity",
  "direction",
  "line",
  "show_platform",
  "show_station_name",
  "station_bg",
  "size",
  "style",
  "flicker",
  "wheelchair_race",
  "accessibility_only",
  "walk_times",
]);

export function normaliseRetroConfig(raw: WienerLinienRetroCardConfig): NormalisedRetroConfig {
  const direction = raw.direction === "R" ? "R" : "H";
  const size: RetroSize = RETRO_SIZES.has(raw.size as RetroSize) ? (raw.size as RetroSize) : "regular";
  const station_bg: RetroStationBg = RETRO_STATION_BG.has(raw.station_bg as RetroStationBg)
    ? (raw.station_bg as RetroStationBg)
    : "default";
  const style: RetroStyle = RETRO_STYLES.has(raw.style as RetroStyle)
    ? (raw.style as RetroStyle)
    : "classic";
  const passthrough: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!RETRO_VALIDATED_KEYS.has(k)) passthrough[k] = v;
  }

  return {
    ...passthrough,
    type: raw.type || "custom:wiener-linien-austria-retro-card",
    entity: typeof raw.entity === "string" && raw.entity.startsWith("sensor.") ? raw.entity : undefined,
    direction,
    line: typeof raw.line === "string" && raw.line ? raw.line : undefined,
    show_platform: raw.show_platform ?? true,
    show_station_name: raw.show_station_name ?? false,
    station_bg,
    size,
    style,
    flicker: raw.flicker === true,
    wheelchair_race: raw.wheelchair_race === true,
    accessibility_only: raw.accessibility_only === true,
    walk_times: normaliseWalkTimes(raw.walk_times),
  };
}

// Resolves the paired (background, foreground) palette for a line chip.
// Precedence:
//   1. user-config `line_colors` (per-line override) — `color` is left
//      unset so the card's CSS default (white) applies, since we can't
//      know what reads well on an arbitrary user colour.
//   2. nightline category rule (`^N\d`) — wins OVER GTFS for N-prefix
//      lines. GTFS publishes nightlines as bus navy (`0A295D`), but
//      Wiener Linien's signage convention pairs a deeper navy with
//      bright yellow numerals; that pairing only reads correctly when
//      the nightline rule beats the GTFS lookup.
//   3. GTFS `routes.txt` from the integration's `line_colors` attribute
//   4. neutral fallback (`var(--primary-color)`)
//
// `overrides` keys are case-folded to uppercase to match the editor's
// own normalisation; the GTFS map is probed by both upper and as-given
// label for robustness against future schema surprises.
export function chipPalette(
  line: string,
  overrides: Record<string, string>,
  gtfsColors: LineColorsMap = {},
  fallback = "var(--primary-color)",
): { background: string; color?: string } {
  const upper = line.toUpperCase();
  if (overrides[upper] !== undefined) return { background: overrides[upper] };
  if (/^N\d/.test(upper)) return { background: NIGHTLINE_BG, color: NIGHTLINE_FG };
  const gtfs = gtfsColors[line] ?? gtfsColors[upper];
  if (gtfs?.bg) {
    return gtfs.fg
      ? { background: `#${gtfs.bg}`, color: `#${gtfs.fg}` }
      : { background: `#${gtfs.bg}` };
  }
  return { background: fallback };
}

// Background-only convenience over `chipPalette` for callers that only
// need the bg colour (badge swatches, filter pills). One ladder, two
// surfaces — keeping these as separate ladders previously let the
// nightline / GTFS precedence drift between bg-only and bg+fg sites.
export function colorForLine(
  line: string,
  overrides: Record<string, string>,
  gtfsColors: LineColorsMap = {},
  fallback = "var(--primary-color)",
): string {
  return chipPalette(line, overrides, gtfsColors, fallback).background;
}
