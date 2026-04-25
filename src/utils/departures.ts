import type { HomeAssistant } from "custom-card-helpers";

import type { DepartureAttr, WalkTimes, WienerLinienAttrs } from "../types.js";

// Stable (line, direction, towards) identifier used as a walk-times map key
// and as an editor row identity. Mirrors the backend's line_key in
// coordinator.py — keep them in sync.
export function lineKey(line: string, direction: string, towards: string): string {
  return `${line}|${direction}|${towards}`;
}

export interface Triplet {
  line: string;
  direction: string;
  towards: string;
  type: string;
}

// Every distinct (line, direction, towards) triple visible at a stop.
// Used by the editor to render one walk-time row per triple and to populate
// the line multi-picker.
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
}

// Apply line/direction/walk-time filters to a departure list, preserving
// upstream sort order (coordinator has already sorted by countdown).
export function filterDepartures(
  departures: DepartureAttr[],
  filter: ModernStopFilter,
): DepartureAttr[] {
  const { lines, direction, line_directions, walk_times } = filter;
  const lineSet = lines && lines.length ? new Set(lines) : null;
  return departures.filter((d) => {
    if (lineSet && !lineSet.has(d.line)) return false;
    // Per-line direction wins; fall back to stop-wide; "no override and
    // no stop-wide setting" means show all directions for this line.
    const effectiveDir = line_directions?.[d.line] ?? direction;
    if (effectiveDir && d.direction !== effectiveDir) return false;
    if (walk_times) {
      const min = walk_times[lineKey(d.line, String(d.direction ?? ""), d.towards)];
      if (typeof min === "number" && d.countdown < min) return false;
    }
    return true;
  });
}
