import { describe, expect, it } from "vitest";

import { accentTextColor, colorSchemeOf, contrastRatio } from "./color.js";
import { lineChipColors } from "./config.js";
import { NIGHTLINE_BG, NIGHTLINE_FG } from "../const.js";
import type { HomeAssistant } from "../types.js";

/** The grounds the card's dev palette panel measures against. */
const GROUND = { dark: "#1c1c1c", light: "#ffffff" } as const;

/** The card's DEV_PALETTE fixture: the distinct published palette plus the two
 *  edge cases that motivated the clamp — pure black and pure white. */
const PALETTE: ReadonlyArray<[string, string]> = [
  ["U1", "#E3000F"],
  ["U2", "#A862A4"],
  ["U3", "#EF7C00"],
  ["U4", "#319F49"],
  ["U6", "#9D6830"],
  ["Tram", "#C00808"],
  ["Bus", "#0A295D"],
  ["Nightline", NIGHTLINE_BG],
  ["Badner Bahn", "#000000"],
  ["Weiss", "#FFFFFF"],
];

describe("colorSchemeOf", () => {
  const hass = (darkMode?: boolean): HomeAssistant =>
    ({ states: {}, themes: darkMode === undefined ? {} : { darkMode } }) as HomeAssistant;

  it("reads the polarity from HA's themes state", () => {
    expect(colorSchemeOf(hass(true))).toBe("dark");
    expect(colorSchemeOf(hass(false))).toBe("light");
  });

  // "Not known yet" must stay distinguishable from "light": guessing a polarity
  // is what puts an unreadable accent on screen.
  it("returns undefined rather than guessing", () => {
    expect(colorSchemeOf(hass())).toBeUndefined();
    expect(colorSchemeOf(undefined)).toBeUndefined();
  });
});

describe("line colour written as text clears WCAG AA", () => {
  for (const scheme of ["dark", "light"] as const) {
    for (const [label, hex] of PALETTE) {
      it(`${label} on the ${scheme} card ground`, () => {
        const text = accentTextColor(hex, scheme);
        expect(text).not.toBeNull();
        const ratio = contrastRatio(text!, GROUND[scheme]);
        expect(ratio).not.toBeNull();
        expect(ratio!).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  // The regression this guards: the editor's outlined chips painted the line's
  // BACKGROUND colour as their label. Bus navy is 1.21:1 that way — an empty
  // outline where a line code should be.
  it("shows why the raw fill cannot be used as text", () => {
    expect(contrastRatio("#0A295D", GROUND.dark)!).toBeLessThan(1.5);
    expect(contrastRatio(NIGHTLINE_BG, GROUND.dark)!).toBeLessThan(2);
  });
});

describe("lineChipColors — one ladder, three surfaces", () => {
  it("pairs a nightline with its signage yellow, not white", () => {
    const c = lineChipColors("N25", {}, {}, "dark");
    expect(c.fill).toBe(NIGHTLINE_BG);
    expect(c.ink).toBe(NIGHTLINE_FG);
  });

  it("lifts the nightline fill into a legible label colour", () => {
    const c = lineChipColors("N25", {}, {}, "dark");
    expect(c.text).toBeDefined();
    expect(contrastRatio(c.text!, GROUND.dark)!).toBeGreaterThanOrEqual(4.5);
  });

  it("carries a GTFS pair through to fill and ink", () => {
    const c = lineChipColors("U6", {}, { U6: { bg: "9D6830", fg: "FFFFFF" } }, "light");
    expect(c.fill).toBe("#9D6830");
    expect(c.ink).toBe("#FFFFFF");
    expect(contrastRatio(c.text!, GROUND.light)!).toBeGreaterThanOrEqual(4.5);
  });

  // chipPalette deliberately declines to guess a foreground for an arbitrary
  // user colour, so the caller's white default stands. The label colour is
  // still clamped, because that one is computable.
  it("leaves ink unset for a user override but still clamps the label", () => {
    const c = lineChipColors("U1", { U1: "#0A295D" }, {}, "dark");
    expect(c.fill).toBe("#0A295D");
    expect(c.ink).toBeUndefined();
    expect(contrastRatio(c.text!, GROUND.dark)!).toBeGreaterThanOrEqual(4.5);
  });

  // Unknown polarity must leave the token unset so the CSS default
  // (--primary-text-color) stands: hueless but legible, never invisible.
  it("returns no label colour when the polarity is unknown", () => {
    expect(lineChipColors("U1", {}, {}, undefined).text).toBeUndefined();
  });

  it("returns no label colour for the neutral var() fallback", () => {
    const c = lineChipColors("U1", {}, {}, "dark");
    expect(c.fill).toBe("var(--primary-color)");
    expect(c.text).toBeUndefined();
  });
});
