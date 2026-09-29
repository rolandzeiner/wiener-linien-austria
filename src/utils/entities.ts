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
// a derived template sensor). The structural keys come from the stop
// sensor's `extra_state_attributes` property (sensor.py) and are unique
// to our sensor shape.
export function findWienerLinienEntities(hass: HomeAssistant | undefined): string[] {
  return findSensors<WienerLinienAttrs>(
    hass,
    (attrs) =>
      typeof attrs.diva === "number" &&
      Array.isArray(attrs.departures) &&
      !!attrs.next_by_line &&
      typeof attrs.next_by_line === "object",
  );
}

/** The entity ids a departure-board editor's picker offers: every stop
 *  sensor, plus whatever the card already has configured.
 *
 *  `include_entities` rather than an integration filter, for the mirror of
 *  the reason in route-editor.ts: the integration also owns the route
 *  sensors, and picking one of those gives a board with nothing to show.
 *  Configured ids are kept even when they no longer fingerprint as a stop —
 *  an unavailable sensor publishes no attributes, and dropping it from its
 *  own picker would make the entry look unset. */
export function departureBoardOptions(
  hass: HomeAssistant | undefined,
  selected: readonly string[] = [],
): string[] {
  const options = new Set(findWienerLinienEntities(hass));
  for (const id of selected) {
    if (id) options.add(id);
  }
  return [...options].sort();
}

/** Sensor entity ids whose attributes pass `matches`, sorted. The walk the
 *  stop and route cards share; each supplies its own fingerprint, which is
 *  the part that must keep the two from picking up each other's sensors. */
export function findSensors<Attrs>(
  hass: HomeAssistant | undefined,
  matches: (attrs: Partial<Attrs>) => boolean,
): string[] {
  if (!hass) return [];
  const found: string[] = [];
  for (const [eid, state] of Object.entries(hass.states ?? {})) {
    if (!eid.startsWith("sensor.")) continue;
    if (matches((state?.attributes ?? {}) as Partial<Attrs>)) found.push(eid);
  }
  return found.sort();
}

// `line_colors` map for a single entity; empty `{}` when missing or
// the catalogue hasn't loaded yet. Card helpers (`chipPalette`,
// `colorForLine`) treat empty as "fall through to the nightline rule
// or the neutral fallback".
export function lineColorsFor(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
): NonNullable<WienerLinienAttrs["line_colors"]> {
  if (!hass || !entityId) return {};
  const attrs = hass.states?.[entityId]?.attributes as WienerLinienAttrs | undefined;
  return attrs?.line_colors ?? {};
}

// Union of the `line_colors` maps across the supplied entities, for the
// render paths that aren't scoped to a single stop: the flap board's
// card-wide palette, traffic/elevator notice badges aggregated over
// every configured stop, and the editor's colour picker.
//
// This used to be `firstLineColorsMap` — first non-empty map wins —
// which was correct only while every sensor published the identical
// full GTFS catalogue (179 lines, ~7 KB, byte-for-byte the same on
// every entity). As of v2.0.0 each sensor publishes only the lines it
// can actually be asked to colour, so two stops legitimately carry
// different maps and taking one of them would paint the other's lines
// with the neutral fallback. Merging is also what the old code MEANT:
// it assumed one map covered every stop on the card.
//
// Earlier entities win on key collision, which is arbitrary and safe —
// the values come from the same GTFS `routes.txt` for every stop, so a
// collision is the same colour twice.
export function mergeLineColorsMaps(
  hass: HomeAssistant | undefined,
  entityIds: ReadonlyArray<string>,
): NonNullable<WienerLinienAttrs["line_colors"]> {
  if (!hass) return {};
  const merged: Record<string, { bg: string; fg?: string }> = {};
  for (const eid of entityIds) {
    for (const [label, palette] of Object.entries(lineColorsFor(hass, eid))) {
      if (!(label in merged)) merged[label] = palette;
    }
  }
  return merged;
}
