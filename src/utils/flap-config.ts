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
//
// Multi-stop model: the canonical config shape carries an `entities`
// array of `NormalisedFlapStop` entries. Legacy single-stop YAML
// (entity + direction + line/lines + walk_times at the root) is
// promoted into entities[0] at normalise time, so old configs keep
// working without migration.

import type {
  FlapSize,
  FlapStationBg,
  FlapStopConfig,
  RetroHeaderSide,
  WalkTimes,
  WienerLinienFlapCardConfig,
} from "../types.js";
import { filterPassthrough, normaliseRetroHeaderSide } from "./config.js";

const FLAP_SIZES: ReadonlySet<FlapSize> = new Set([
  "small",
  "medium",
  "regular",
] as const);

/** Whitelist for station_bg. `"line"` (sentinel) and the two literal
 *  colour values are exact-match; `"line:<X>"` is matched by prefix in
 *  the normaliser. The renderer resolves `"line"`/`"line:<X>"` against
 *  the live GTFS palette at paint time. */
const FLAP_STATION_BG_LITERALS: ReadonlySet<FlapStationBg> = new Set([
  "line",
  "white",
  "black",
] as const);

function normaliseStationBg(raw: unknown): FlapStationBg {
  if (typeof raw !== "string") return "line";
  if (FLAP_STATION_BG_LITERALS.has(raw as FlapStationBg)) {
    return raw as FlapStationBg;
  }
  if (raw.startsWith("line:") && raw.length > 5) {
    // Trust whatever line key the user typed — the renderer falls
    // back gracefully if the line isn't in the live `line_colors`
    // map (typo, removed line, off-network sensor).
    return raw as FlapStationBg;
  }
  return "line";
}

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

function normaliseLineDirections(
  raw: unknown,
): Record<string, "H" | "R"> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, "H" | "R"> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string" || !k.length) continue;
    if (v === "H" || v === "R") out[k] = v;
    // Any other value ("Both" / "" / undefined) = no override = absence.
  }
  return Object.keys(out).length ? out : undefined;
}

/** A stop after normalisation. Optional fields use plain `?:` (no
 *  `| undefined`) so under `exactOptionalPropertyTypes` callers can't
 *  set them to explicit `undefined` — the normaliser only ever
 *  produces absence, and absence is what the rest of the renderer
 *  branches on (e.g. `stop.direction === undefined` = "no direction
 *  filter"). The raw config interface keeps `| undefined` because
 *  user-authored YAML can legitimately carry the explicit form. */
export interface NormalisedFlapStop {
  entity: string;
  lines?: string[];
  direction?: "H" | "R";
  line_directions?: Record<string, "H" | "R">;
  walk_times?: WalkTimes;
}

function normaliseStopEntry(raw: unknown): NormalisedFlapStop | null {
  if (typeof raw === "string") {
    return raw.startsWith("sensor.") ? { entity: raw } : null;
  }
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const entity = typeof r.entity === "string" ? r.entity : null;
  if (!entity?.startsWith("sensor.")) return null;
  const stop: NormalisedFlapStop = { entity };
  if (Array.isArray(r.lines)) {
    const lines = r.lines.filter(
      (l): l is string => typeof l === "string" && l.length > 0,
    );
    if (lines.length) stop.lines = lines;
  }
  if (r.direction === "H" || r.direction === "R") stop.direction = r.direction;
  const lineDirs = normaliseLineDirections(r.line_directions);
  if (lineDirs) stop.line_directions = lineDirs;
  const walk = normaliseWalkTimes(r.walk_times);
  if (walk) stop.walk_times = walk;
  return stop;
}

export interface NormalisedFlapConfigValidated {
  // HA's Lovelace editor wrapper re-validates every `config-changed`
  // payload against `type` — preserving the raw value (including any
  // `custom:` prefix) lets yaml-registered installs round-trip cleanly.
  type: string;
  entities: NormalisedFlapStop[];
  size: FlapSize;
  max_rows: number;
  show_platform: boolean;
  show_station_name: boolean;
  station_bg: FlapStationBg;
  show_min_unit: boolean;
  show_accessibility: boolean;
  accessibility_only: boolean;
  show_header: boolean;
  header_left?: RetroHeaderSide | undefined;
  header_right?: RetroHeaderSide | undefined;
  hide_attribution: boolean;
  line_pill: boolean;
  housing: boolean;
}

// Mirror retro/modern: a NormalisedFlapConfig is the validated set + the
// passthrough dashboard layout fields keyed by an index signature so
// HA's `grid_options` etc. survive a normalise round-trip.
export type NormalisedFlapConfig = NormalisedFlapConfigValidated & {
  [key: string]: unknown;
};

// Keys this normaliser actively handles — used to filter the raw
// passthrough so dashboard layout fields survive while no
// pre-normalisation version of a validated key leaks through.
// Includes legacy flat fields (entity / line / lines / direction /
// walk_times) that get promoted to entities[0] and must NOT leak.
const FLAP_VALIDATED_KEYS: ReadonlySet<string> = new Set([
  "type",
  "entities",
  "entity",
  "line",
  "lines",
  "direction",
  "walk_times",
  "size",
  "max_rows",
  "show_platform",
  "show_station_name",
  // Legacy alias for show_station_name — accepted by the normaliser
  // for back-compat, must NOT leak into the passthrough.
  "show_station_header",
  "station_bg",
  "show_min_unit",
  "show_accessibility",
  "accessibility_only",
  "show_header",
  "header_left",
  "header_right",
  "hide_attribution",
  "line_pill",
  "housing",
]);

export function normaliseFlapConfig(
  raw: WienerLinienFlapCardConfig,
): NormalisedFlapConfig {
  // Default = "small" (which the editor surfaces as "Normal"). The
  // smaller pitch keeps the board readable in mixed-height dashboard
  // grids; users who want the bigger pitch can opt into "regular"
  // (now labelled "Groß" / "Large").
  const size: FlapSize = FLAP_SIZES.has(raw.size as FlapSize)
    ? (raw.size as FlapSize)
    : "small";

  // max_rows 1..8 — multi-stop merge can produce 6-8 imminent departures.
  const maxRowsRaw = Number(raw.max_rows);
  const max_rowsValid = Number.isFinite(maxRowsRaw);
  if (raw.max_rows !== undefined && !max_rowsValid) {
    // eslint-disable-next-line no-console
    console.warn(
      `[wiener-linien-austria-flap-card] max_rows ${JSON.stringify(raw.max_rows)} is not a number — falling back to 2`,
    );
  }
  const max_rows = max_rowsValid
    ? Math.max(1, Math.min(8, Math.round(maxRowsRaw)))
    : 2;

  // Back-compat: flat single-entity shape gets promoted to entities[0].
  // Conditional spread (not undefined-pass-through) because
  // `exactOptionalPropertyTypes` rejects `{ lines: undefined }` against
  // the `lines?: string[]` declaration in FlapStopConfig.
  let rawEntities: unknown[] = [];
  if (Array.isArray(raw.entities)) {
    rawEntities = raw.entities;
  } else if (typeof raw.entity === "string") {
    let legacyLines: string[] | undefined;
    if (Array.isArray(raw.lines)) {
      legacyLines = raw.lines.filter(
        (l): l is string => typeof l === "string" && l.length > 0,
      );
    } else if (typeof raw.line === "string" && raw.line) {
      legacyLines = [raw.line];
    }
    rawEntities = [
      {
        entity: raw.entity,
        ...(legacyLines && legacyLines.length ? { lines: legacyLines } : {}),
        ...(raw.direction !== undefined ? { direction: raw.direction } : {}),
        ...(raw.walk_times !== undefined
          ? { walk_times: raw.walk_times }
          : {}),
      } satisfies Partial<FlapStopConfig> & { entity: string },
    ];
  }

  const entities: NormalisedFlapStop[] = [];
  const seen = new Set<string>();
  for (const r of rawEntities) {
    const stop = normaliseStopEntry(r);
    if (!stop) {
      // eslint-disable-next-line no-console
      console.warn(
        "[wiener-linien-austria-flap-card] dropping malformed stop entry",
        r,
      );
      continue;
    }
    if (seen.has(stop.entity)) continue;
    seen.add(stop.entity);
    entities.push(stop);
  }

  const passthrough = filterPassthrough(raw, FLAP_VALIDATED_KEYS);

  const station_bg = normaliseStationBg(raw.station_bg);

  // Accept either `show_station_name` (current) or the legacy
  // `show_station_header` so configs from before the rename keep
  // working. Existing field wins only if explicitly set; otherwise
  // fall through to the new name's default (true).
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const legacyStation = raw.show_station_header;
  const show_station_name =
    typeof raw.show_station_name === "boolean"
      ? raw.show_station_name
      : typeof legacyStation === "boolean"
        ? legacyStation
        : true;

  return {
    ...passthrough,
    type: raw.type || "custom:wiener-linien-austria-flap-card",
    entities,
    size,
    max_rows,
    show_platform: asBool(raw.show_platform, true),
    show_station_name,
    station_bg,
    show_min_unit: asBool(raw.show_min_unit, true),
    show_accessibility: asBool(raw.show_accessibility, true),
    accessibility_only: raw.accessibility_only === true,
    // Master gate for the signage header strip — defaults `false` so
    // pre-feature flap cards render byte-identical. Per-side configs
    // are preserved either way (so toggling back on restores them).
    show_header: raw.show_header === true,
    header_left: normaliseRetroHeaderSide(raw.header_left),
    header_right: normaliseRetroHeaderSide(raw.header_right),
    // Footer is opt-out, not opt-in — Wiener Linien OGD requires
    // visible CC-BY credit unless the user deliberately suppresses
    // it. Mirrors the modern card's default.
    hide_attribution: raw.hide_attribution === true,
    // Tweaks — default values preserve the pre-tweak look:
    //   line_pill = false → line column visible
    //   housing  = true  → cream cabinet wraps the board
    line_pill: raw.line_pill === true,
    housing: asBool(raw.housing, true),
  };
}
