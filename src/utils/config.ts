import { METRO_COLORS } from "../const.js";
import type {
  ModernStopConfig,
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

export interface NormalisedModernConfig {
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
  hide_attribution: boolean;
  layout: "stacked" | "tabs";
}

const MODERN_DEFAULTS: Omit<NormalisedModernConfig, "entities" | "line_colors" | "type"> = {
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
  const maxClamped = Number.isFinite(maxRaw) ? Math.max(1, Math.min(20, Math.round(maxRaw))) : MODERN_DEFAULTS.max_departures;

  const lineColors: Record<string, string> = {};
  if (raw.line_colors && typeof raw.line_colors === "object") {
    for (const [k, v] of Object.entries(raw.line_colors)) {
      if (typeof v === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(v.trim())) {
        lineColors[k.toUpperCase()] = v.trim();
      }
    }
  }

  return {
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
    hide_attribution: raw.hide_attribution ?? MODERN_DEFAULTS.hide_attribution,
    layout: raw.layout === "tabs" ? "tabs" : "stacked",
  };
}

export interface NormalisedRetroConfig {
  // See NormalisedModernConfig.type — HA requires `type` on every config
  // in the `config-changed` payload or it flags "Kein Typ angegeben".
  type: string;
  entity: string | undefined;
  direction: "H" | "R";
  line?: string;
  show_platform: boolean;
  show_station_name: boolean;
  station_bg: RetroStationBg;
  size: RetroSize;
  style: RetroStyle;
  flicker: boolean;
  wheelchair_race: boolean;
  accessibility_only: boolean;
  walk_times?: WalkTimes;
}

export function normaliseRetroConfig(raw: WienerLinienRetroCardConfig): NormalisedRetroConfig {
  const direction = raw.direction === "R" ? "R" : "H";
  const size: RetroSize = RETRO_SIZES.has(raw.size as RetroSize) ? (raw.size as RetroSize) : "regular";
  const station_bg: RetroStationBg = RETRO_STATION_BG.has(raw.station_bg as RetroStationBg)
    ? (raw.station_bg as RetroStationBg)
    : "default";
  const style: RetroStyle = RETRO_STYLES.has(raw.style as RetroStyle)
    ? (raw.style as RetroStyle)
    : "classic";
  return {
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

export function colorForLine(
  line: string,
  overrides: Record<string, string>,
  fallback = "var(--primary-color)",
): string {
  const upper = line.toUpperCase();
  return overrides[upper] ?? METRO_COLORS[upper] ?? fallback;
}
