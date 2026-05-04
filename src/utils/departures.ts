import type { HomeAssistant } from "../types.js";

import type { DepartureAttr, WalkTimes, WienerLinienAttrs } from "../types.js";

// Stable (line, direction, towards) identifier — used by tripletsAtStop's
// seen-dedupe and as a stable picker key. Walk-times key by pair instead;
// see lineDirKey below.
function lineKey(line: string, direction: string, towards: string): string {
  return `${line}|${direction}|${towards}`;
}

// (line, direction) identifier used for walk-times lookup. The towards
// component is intentionally omitted: the /monitor API reports both
// `line.towards` and per-departure `vehicle.towards` based on whichever
// terminus the next vehicle is heading to, so a line that branches
// (U1/R: Oberlaa ↔ Alaudagasse) flips its towards label across polls.
// Walk-time semantics are "minutes I need to reach this platform" —
// independent of which terminus a given train is going to. Keying by
// pair instead of triple makes the threshold apply to every train on
// the same direction regardless of branching.
export function lineDirKey(line: string, direction: string): string {
  return `${line}|${direction}`;
}

export interface Triplet {
  line: string;
  direction: string;
  towards: string;
  type: string;
}

// Every distinct (line, direction, towards) triple visible at a stop.
// Used by the line multi-picker and direction picker — display surfaces
// where every visible terminus matters. Walk-times use pairsAtStop.
export function tripletsAtStop(attrs: WienerLinienAttrs | undefined): Triplet[] {
  const out: Triplet[] = [];
  const seen = new Set<string>();
  for (const d of attrs?.departures ?? []) {
    const key = lineKey(d.line, String(d.direction ?? ""), d.towards);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ line: d.line, direction: String(d.direction ?? ""), towards: d.towards, type: d.type });
  }
  out.sort((a, b) => (a.line === b.line ? a.towards.localeCompare(b.towards) : a.line.localeCompare(b.line)));
  return out;
}

export interface Pair {
  line: string;
  direction: string;
  type: string;
  // Display-only label: list of every terminus seen for this pair, in
  // first-seen order. The walk-time row uses the joined string (e.g.
  // "Oberlaa / Alaudagasse") in the UI so the user knows what their
  // threshold covers, but the saved key is the pair, not the label.
  termini: string[];
}

// Every distinct (line, direction) pair visible at a stop. Used by both
// editors to render one walk-time row per pair regardless of how many
// termini the API currently exposes. The first-seen `type` is captured
// for icon rendering; `termini` accumulates every towards label seen.
export function pairsAtStop(attrs: WienerLinienAttrs | undefined): Pair[] {
  const byKey = new Map<string, Pair>();
  for (const d of attrs?.departures ?? []) {
    const dir = String(d.direction ?? "");
    const k = lineDirKey(d.line, dir);
    let pair = byKey.get(k);
    if (!pair) {
      pair = { line: d.line, direction: dir, type: d.type, termini: [] };
      byKey.set(k, pair);
    }
    if (d.towards && !pair.termini.includes(d.towards)) {
      pair.termini.push(d.towards);
    }
  }
  const out = Array.from(byKey.values());
  out.sort((a, b) =>
    a.line === b.line ? a.direction.localeCompare(b.direction) : a.line.localeCompare(b.line),
  );
  return out;
}

// Lines tracked at a stop in one direction. Tracked-line keys (config-flow
// selection) win — only surface lines the user opted into. Falls back to
// live departures for older sensor caches that pre-date `tracked_line_keys`.
// Used by the retro editor's line dropdown and its entity-changed line
// auto-pick path; one resolver keeps both surfaces in sync.
export function linesForDirection(
  attrs: WienerLinienAttrs | undefined,
  dir: "H" | "R" | undefined,
): string[] {
  if (!attrs) return [];
  const out = new Set<string>();
  if (attrs.tracked_line_keys?.length) {
    for (const key of attrs.tracked_line_keys) {
      const [line, keyDir] = key.split("|", 2);
      if (!line) continue;
      if (dir && keyDir !== dir) continue;
      out.add(line);
    }
    if (out.size > 0) return [...out].sort();
  }
  for (const d of attrs.departures ?? []) {
    if (dir && d.direction !== dir) continue;
    if (d.line) out.add(d.line);
  }
  return [...out].sort();
}

// Tracked list wins; without it, union the static catalogue with live
// departures so a brand-new line that hasn't made it into the static
// catalogue yet is still listed once it appears in the realtime feed.
// Exported so the modern editor and the per-stop colour previews share
// the same resolver — divergence between two copies caused subtle drift
// in the past on stops with both `lines_at_stop` AND new live lines.
export function linesAtStop(attrs: WienerLinienAttrs | undefined): string[] {
  if (attrs?.tracked_lines?.length) {
    return [...attrs.tracked_lines].sort();
  }
  const s = new Set<string>();
  if (attrs?.lines_at_stop?.length) {
    for (const l of attrs.lines_at_stop) s.add(l);
  }
  for (const d of attrs?.departures ?? []) {
    if (d.line) s.add(d.line);
  }
  return Array.from(s).sort();
}

export function collectLinesInSelection(
  hass: HomeAssistant | undefined,
  entityIds: string[],
): string[] {
  const s = new Set<string>();
  for (const eid of entityIds) {
    const attrs = hass?.states?.[eid]?.attributes as WienerLinienAttrs | undefined;
    for (const l of linesAtStop(attrs)) s.add(l);
  }
  return Array.from(s).sort();
}

export interface ModernStopFilter {
  // `?: T | undefined` — see NormalisedRetroConfigValidated comment for
  // the dual-form rationale under exactOptionalPropertyTypes.
  lines?: string[] | undefined;
  direction?: "H" | "R" | undefined;
  // Per-line direction override. Takes precedence over `direction`.
  // Absence of an entry for a line falls back to `direction`, then to
  // "no direction filter" if `direction` is also unset.
  line_directions?: Record<string, "H" | "R"> | undefined;
  walk_times?: WalkTimes | undefined;
  // When true, drop any departure whose `barrier_free` flag isn't set —
  // wheelchair-only view. Card-wide on the modern card, card-wide on
  // retro; both pass it through this filter.
  accessibility_only?: boolean | undefined;
}

// Apply line/direction/walk-time filters to a departure list, preserving
// upstream sort order (coordinator has already sorted by countdown).
export function filterDepartures(
  departures: DepartureAttr[],
  filter: ModernStopFilter,
): DepartureAttr[] {
  const { lines, direction, line_directions, walk_times, accessibility_only } = filter;
  const lineSet = lines && lines.length ? new Set(lines) : null;
  return departures.filter((d) => {
    if (lineSet && !lineSet.has(d.line)) return false;
    // Per-line direction wins; fall back to stop-wide; "no override and
    // no stop-wide setting" means show all directions for this line.
    const effectiveDir = line_directions?.[d.line] ?? direction;
    if (effectiveDir && d.direction !== effectiveDir) return false;
    if (walk_times) {
      const min = walk_times[lineDirKey(d.line, String(d.direction ?? ""))];
      if (typeof min === "number" && d.countdown < min) return false;
    }
    if (accessibility_only && !d.barrier_free) return false;
    return true;
  });
}

/** Whether the given departure should render its stops_ahead expandable
 *  affordance — gated on the user-configurable `show_stops_ahead`
 *  toggle (default true) AND on the actual presence of upstream
 *  trip-pattern data. Centralised so the modern card's three render
 *  helpers (row list, hero entry, hero-panel companion) share one
 *  rule rather than each carrying their own copy of the gate. */
export function shouldShowStopsAhead(
  showStopsAhead: boolean | undefined,
  d: DepartureAttr,
): boolean {
  return (
    showStopsAhead !== false &&
    Array.isArray(d.stops_ahead) &&
    d.stops_ahead.length > 0
  );
}
