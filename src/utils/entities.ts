import type { HomeAssistant } from "../types.js";

import type { WienerLinienAttrs } from "../types.js";

// Discover WL stop sensors by attribute fingerprint. Entity-id prefix is not
// stable (the sensor slug is built from the stop name, e.g.
// `sensor.westbahnhof_abfahrten`), so we fingerprint on the structural
// attributes the integration always emits:
//   diva (int)  +  departures (array)  +  next_by_line (record)
// All three together don't appear on any non-WL sensor — the previous
// substring match on `attribution.includes("wiener linien")` could
// false-positive on any third-party integration whose attribution
// happened to mention Wiener Linien (e.g. a custom dashboard widget,
// a derived template sensor). The structural keys are emitted by
// our coordinator's `_attr_extra_state_attributes` and are unique to
// our sensor shape.
export function findWienerLinienEntities(hass: HomeAssistant | undefined): string[] {
  if (!hass) return [];
  const matches: string[] = [];
  for (const [eid, state] of Object.entries(hass.states ?? {})) {
    if (!eid.startsWith("sensor.")) continue;
    const attrs = (state?.attributes ?? {}) as WienerLinienAttrs;
    if (typeof attrs.diva !== "number") continue;
    if (!Array.isArray(attrs.departures)) continue;
    if (!attrs.next_by_line || typeof attrs.next_by_line !== "object") continue;
    matches.push(eid);
  }
  matches.sort();
  return matches;
}

// First non-empty `line_colors` map across the supplied entities. Every
// WL sensor publishes the same GTFS palette, so the first hit is enough
// to seed render paths that aren't scoped to a single stop. Returns
// `{}` when nothing matches so callers can `Object.keys(...).length`
// without a null guard.
export function firstLineColorsMap(
  hass: HomeAssistant | undefined,
  entityIds: ReadonlyArray<string>,
): NonNullable<WienerLinienAttrs["line_colors"]> {
  if (!hass) return {};
  for (const eid of entityIds) {
    const attrs = hass.states?.[eid]?.attributes as WienerLinienAttrs | undefined;
    const colors = attrs?.line_colors;
    if (colors && Object.keys(colors).length) return colors;
  }
  return {};
}
