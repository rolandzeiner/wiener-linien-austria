import type { HomeAssistant } from "custom-card-helpers";

import type { DepartureAttr, WalkTimes, WienerLinienAttrs } from "../types.js";

// Stable (line, direction, towards) identifier. Retained for the editor's
// per-triple `seen` deduplication in tripletsAtStop and as a stable React-
// like key for the line picker. NOT used for walk-times any more — see
// lineDirKey below for why.
export function lineKey(line: string, direction: string, towards: string): string {
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
// where every visible terminus matters. NOT used for walk-times any more
// (see pairsAtStop).
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

export function linesAtStop(attrs: WienerLinienAttrs | undefined): string[] {
  const s = new Set<string>();
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
  lines?: string[];
  direction?: "H" | "R";
  // Per-line direction override. Takes precedence over `direction`.
  // Absence of an entry for a line falls back to `direction`, then to
  // "no direction filter" if `direction` is also unset.
  line_directions?: Record<string, "H" | "R">;
  walk_times?: WalkTimes;
  // When true, drop any departure whose `barrier_free` flag isn't set —
  // wheelchair-only view. Card-wide on the modern card, card-wide on
  // retro; both pass it through this filter.
  accessibility_only?: boolean;
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
