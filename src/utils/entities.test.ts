import { describe, expect, it } from "vitest";

import { mergeLineColorsMaps } from "./entities.js";
import type { HomeAssistant } from "../types.js";

function hassWith(
  maps: Record<string, Record<string, { bg: string; fg?: string }>>,
): HomeAssistant {
  const states: Record<string, unknown> = {};
  for (const [eid, line_colors] of Object.entries(maps)) {
    states[eid] = { entity_id: eid, state: "3", attributes: { line_colors } };
  }
  return { states } as unknown as HomeAssistant;
}

describe("mergeLineColorsMaps", () => {
  // This replaced a first-non-empty-map-wins helper. That was correct only
  // while every sensor published the identical full GTFS catalogue; as of
  // v2.0.0 each publishes only the lines it can be asked to colour, so a
  // multi-stop card taking one stop's map would paint the other's lines
  // with the neutral fallback — silently, and looking like a design choice.

  it("unions the palettes of every configured stop", () => {
    const hass = hassWith({
      "sensor.a": { U1: { bg: "E3000F" } },
      "sensor.b": { "71": { bg: "C00808" } },
    });

    expect(mergeLineColorsMaps(hass, ["sensor.a", "sensor.b"])).toEqual({
      U1: { bg: "E3000F" },
      "71": { bg: "C00808" },
    });
  });

  it("does not stop at the first non-empty map", () => {
    // The exact regression the old helper had: stop A answers, stop B's
    // lines never get a colour.
    const hass = hassWith({
      "sensor.a": { U1: { bg: "E3000F" } },
      "sensor.b": { U2: { bg: "A862A4" } },
    });

    const merged = mergeLineColorsMaps(hass, ["sensor.a", "sensor.b"]);

    expect(Object.keys(merged).sort()).toEqual(["U1", "U2"]);
  });

  it("skips entities with no palette without losing later ones", () => {
    const hass = hassWith({
      "sensor.empty": {},
      "sensor.b": { U4: { bg: "07A64F" } },
    });

    expect(mergeLineColorsMaps(hass, ["sensor.empty", "sensor.b"])).toEqual({
      U4: { bg: "07A64F" },
    });
  });

  it("keeps the first entity's value on a key collision", () => {
    // Arbitrary but safe: every stop sources the same GTFS routes.txt, so
    // a collision is the same colour twice. Pinned so a future change to
    // that assumption is a visible test change, not a silent repaint.
    const hass = hassWith({
      "sensor.a": { U1: { bg: "AAAAAA" } },
      "sensor.b": { U1: { bg: "BBBBBB" } },
    });

    expect(mergeLineColorsMaps(hass, ["sensor.a", "sensor.b"])).toEqual({
      U1: { bg: "AAAAAA" },
    });
  });

  it("preserves the foreground colour when one is published", () => {
    const hass = hassWith({ "sensor.a": { U1: { bg: "E3000F", fg: "FFFFFF" } } });

    expect(mergeLineColorsMaps(hass, ["sensor.a"])).toEqual({
      U1: { bg: "E3000F", fg: "FFFFFF" },
    });
  });

  it("returns an empty map without hass, and for an unknown entity", () => {
    expect(mergeLineColorsMaps(undefined, ["sensor.a"])).toEqual({});
    expect(mergeLineColorsMaps(hassWith({}), ["sensor.missing"])).toEqual({});
  });
});
