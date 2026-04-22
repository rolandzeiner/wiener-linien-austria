import type { HomeAssistant } from "custom-card-helpers";

import type { WienerLinienAttrs } from "../types.js";

// Discover WL stop sensors by attribute fingerprint. Entity-id prefix is not
// stable (the sensor slug is built from the stop name, e.g.
// `sensor.westbahnhof_abfahrten`), so we fingerprint on:
//   diva (int)  +  departures (array)  +  attribution marker ("Wiener Linien")
// Any sensor that passes all three is ours — this survives user renames,
// locale-specific slugs, and any future translation of the entity name.
export function findWienerLinienEntities(hass: HomeAssistant | undefined): string[] {
  if (!hass) return [];
  const matches: string[] = [];
  for (const [eid, state] of Object.entries(hass.states ?? {})) {
    if (!eid.startsWith("sensor.")) continue;
    const attrs = (state?.attributes ?? {}) as WienerLinienAttrs;
    if (typeof attrs.diva !== "number") continue;
    if (!Array.isArray(attrs.departures)) continue;
    const attribution = attrs.attribution ?? "";
    if (!attribution.toLowerCase().includes("wiener linien")) continue;
    matches.push(eid);
  }
  matches.sort();
  return matches;
}

// Pretty name for the picker — falls back to the entity id if no friendly
// name / stop_name is present. Never throws.
export function stopLabel(hass: HomeAssistant | undefined, entityId: string): string {
  const state = hass?.states?.[entityId];
  const attrs = (state?.attributes ?? {}) as WienerLinienAttrs;
  return attrs.stop_name || attrs.friendly_name || entityId;
}
