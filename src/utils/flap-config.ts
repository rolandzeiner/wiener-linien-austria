// Config normaliser for the Wiener Linien Austria flap card.
//
// Mirrors the pattern of utils/config.ts (retro/modern card normalisers):
// the editor and setConfig both hand a raw, untyped object in; the
// normaliser validates each field, coerces types, applies sensible
// defaults, and returns a `NormalisedFlapConfig` the renderer can
// trust without per-field guards.
//
// Validated keys are filtered out of the passthrough so HA-injected
// dashboard layout fields (grid_options, view_layout, visibility) round-
// trip unchanged while no pre-normalised value of a validated key
// sneaks through via the spread.

import type {
  FlapPlatformSide,
  FlapSize,
  WalkTimes,
  WienerLinienFlapCardConfig,
} from "../types.js";

const FLAP_SIZES: ReadonlySet<FlapSize> = new Set([
  "small",
  "medium",
  "regular",
] as const);
const FLAP_PLATFORM_SIDES: ReadonlySet<FlapPlatformSide> = new Set([
  "auto",
  "left",
  "right",
] as const);

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function normaliseWalkTimes(raw: unknown): WalkTimes | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: WalkTimes = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n =
      typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    if (!Number.isFinite(n)) continue;
    if (n < 0 || n > 120) continue;
    // Same key collapse as the retro card normaliser — legacy triples
    // ("U1|R|Oberlaa") become pairs ("U1|R"); on collision keep the
    // larger (more conservative) value.
    const parts = k.split("|");
    const key = parts.length >= 3 ? `${parts[0]}|${parts[1]}` : k;
    const rounded = Math.round(n);
    const prev = out[key];
    out[key] = prev === undefined ? rounded : Math.max(prev, rounded);
  }
  return Object.keys(out).length ? out : undefined;
}

export interface NormalisedFlapConfigValidated {
  // HA's Lovelace editor wrapper re-validates every `config-changed`
  // payload against `type` — preserving the raw value (including any
  // `custom:` prefix) lets yaml-registered installs round-trip cleanly.
  type: string;
  entity?: string | undefined;
  direction: "H" | "R";
  line?: string | undefined;
  size: FlapSize;
  max_rows: number;
  show_platform: boolean;
  platform_side: FlapPlatformSide;
  show_station_header: boolean;
  show_min_unit: boolean;
  show_accessibility: boolean;
  accessibility_only: boolean;
  walk_times?: WalkTimes | undefined;
}

// Mirror retro/modern: a NormalisedFlapConfig is the validated set + the
// passthrough dashboard layout fields keyed by an index signature so
// HA's `grid_options` etc. survive a normalise round-trip.
export type NormalisedFlapConfig = NormalisedFlapConfigValidated & {
  [key: string]: unknown;
};

const FLAP_VALIDATED_KEYS: ReadonlySet<string> = new Set([
  "type",
  "entity",
  "direction",
  "line",
  "size",
  "max_rows",
  "show_platform",
  "platform_side",
  "show_station_header",
  "show_min_unit",
  "show_accessibility",
  "accessibility_only",
  "walk_times",
]);

export function normaliseFlapConfig(
  raw: WienerLinienFlapCardConfig,
): NormalisedFlapConfig {
  const direction: "H" | "R" = raw.direction === "R" ? "R" : "H";
  const size: FlapSize = FLAP_SIZES.has(raw.size as FlapSize)
    ? (raw.size as FlapSize)
    : "regular";
  const platform_side: FlapPlatformSide = FLAP_PLATFORM_SIDES.has(
    raw.platform_side as FlapPlatformSide,
  )
    ? (raw.platform_side as FlapPlatformSide)
    : "auto";

  // Clamp max_rows to a reasonable range. 1..4 keeps the board readable
  // at any size variant; 0 would render an empty board (bad UX), >4
  // overflows the WL signage convention (a real DFI usually shows 2-3).
  const maxRowsRaw = Number(raw.max_rows);
  const max_rows = Number.isFinite(maxRowsRaw)
    ? Math.max(1, Math.min(4, Math.round(maxRowsRaw)))
    : 2;

  const passthrough: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!FLAP_VALIDATED_KEYS.has(k)) passthrough[k] = v;
  }

  return {
    ...passthrough,
    type: raw.type || "custom:wiener-linien-austria-flap-card",
    entity:
      typeof raw.entity === "string" && raw.entity.startsWith("sensor.")
        ? raw.entity
        : undefined,
    direction,
    line: typeof raw.line === "string" && raw.line ? raw.line : undefined,
    size,
    max_rows,
    show_platform: asBool(raw.show_platform, true),
    platform_side,
    show_station_header: asBool(raw.show_station_header, true),
    show_min_unit: asBool(raw.show_min_unit, true),
    show_accessibility: asBool(raw.show_accessibility, true),
    accessibility_only: raw.accessibility_only === true,
    walk_times: normaliseWalkTimes(raw.walk_times),
  };
}
