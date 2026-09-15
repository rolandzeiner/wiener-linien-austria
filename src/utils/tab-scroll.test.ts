import { describe, expect, it } from "vitest";

import { arrowStep, revealOffset, tabEdges } from "./tab-scroll.js";

describe("tabEdges", () => {
  it("reports nothing hidden when the tabs fit", () => {
    expect(tabEdges(0, 400, 400)).toEqual({ start: false, end: false });
  });

  it("reports hidden tabs on each side as the strip scrolls", () => {
    expect(tabEdges(0, 300, 700)).toEqual({ start: false, end: true });
    expect(tabEdges(200, 300, 700)).toEqual({ start: true, end: true });
    expect(tabEdges(400, 300, 700)).toEqual({ start: true, end: false });
  });

  it("ignores sub-pixel remainders at the ends", () => {
    expect(tabEdges(0.5, 300, 700)).toEqual({ start: false, end: true });
    expect(tabEdges(399.6, 300, 700)).toEqual({ start: true, end: false });
  });

  it("reads a right-to-left strip's negative offset as distance from the start", () => {
    expect(tabEdges(-400, 300, 700)).toEqual({ start: true, end: false });
  });
});

describe("revealOffset", () => {
  // A 300px view onto 900px of tabs, 40px kept clear of each edge.
  const reveal = (tabStart: number, tabWidth: number, scroll: number) =>
    revealOffset(tabStart, tabWidth, scroll, 300, 900, 40);

  it("leaves a fully visible tab alone", () => {
    expect(reveal(100, 100, 0)).toBeNull();
  });

  it("scrolls forward so a tab past the end clears the fade", () => {
    // Tab spans 350–470; its end plus the inset must fit in the view.
    expect(reveal(350, 120, 0)).toBe(210);
  });

  it("scrolls back so a tab before the start clears the fade", () => {
    expect(reveal(300, 100, 400)).toBe(260);
  });

  it("lands the first and last tabs flush instead of past the ends", () => {
    expect(reveal(0, 100, 200)).toBe(0);
    expect(reveal(780, 120, 0)).toBe(600);
  });

  it("returns null when the clamped target is where the strip already is", () => {
    expect(reveal(0, 100, 0)).toBeNull();
    expect(reveal(20, 100, 0)).toBeNull();
  });
});

describe("arrowStep", () => {
  it("moves most of a view, never less than a tab's worth", () => {
    expect(arrowStep(300)).toBe(210);
    expect(arrowStep(40)).toBe(48);
  });
});
