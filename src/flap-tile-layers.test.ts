// @vitest-environment happy-dom

// The split-flap board keeps its 3D properties on the tiles that flip.
//
// perspective on every tile and backface-visibility on every half made a
// board of ~150 tiles a stack of compositing layers that was redrawn on
// every frame anything on screen animated: +16 points of CPU per frame on a
// Galaxy Tab A8 wall tablet, 0 once only flipping tiles carry them
// (measured 2026-11-27). Nothing looks different at rest: the leaf exists
// only while a tile flips, and the halves never rotate.

import { describe, expect, it } from "vite-plus/test";

import { WienerLinienAustriaFlapCard } from "./wiener-linien-austria-flap-card.js";

interface Rule {
  selector: string;
  body: string;
}

/** Innermost rules (inside @media too), comments stripped. */
function rules(): Rule[] {
  const styles = WienerLinienAustriaFlapCard.styles;
  const sheets = Array.isArray(styles) ? styles : [styles];
  const css = sheets
    .map((s) => ("cssText" in s ? s.cssText : ""))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: (m[1] ?? "").trim(),
    body: m[2] ?? "",
  }));
}

function selectorsWith(property: RegExp): string[] {
  return rules()
    .filter((r) => property.test(r.body))
    .map((r) => r.selector);
}

describe("flap tile layers", () => {
  it("gives perspective only to a flipping tile", () => {
    const selectors = selectorsWith(/(^|[;\s])perspective\s*:/);
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) expect(selector).toContain(".flap-tile--flipping");
  });

  it("sets backface-visibility only on the leaf, which exists only while flipping", () => {
    for (const selector of selectorsWith(/backface-visibility\s*:/)) {
      expect(selector).toMatch(/\.flap-tile__leaf$/);
    }
  });
});
