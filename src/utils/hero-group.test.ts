import { describe, expect, it } from "vitest";

import { computeHeroGroup, splitHeroAndRows } from "./hero-group.js";
import type { DepartureAttr } from "../types.js";

function dep(countdown: number, line = "U1"): DepartureAttr {
  return {
    line,
    towards: "Oberlaa",
    direction: "H",
    type: "ptMetro",
    countdown,
  };
}

describe("computeHeroGroup", () => {
  it("returns nothing for an empty feed", () => {
    expect(computeHeroGroup([])).toEqual([]);
  });

  it("picks every departure sharing the soonest countdown", () => {
    const a = dep(3, "U1");
    const b = dep(3, "U3");
    const c = dep(8, "U6");
    expect(computeHeroGroup([a, b, c])).toEqual([a, b]);
  });

  it("groups everything already due or overdue, not just the soonest", () => {
    // Two trams both at the platform both belong in the hero.
    const a = dep(0, "U1");
    const b = dep(-3, "U3");
    const c = dep(4, "U6");
    expect(computeHeroGroup([a, b, c])).toEqual([a, b]);
  });

  it("surfaces the first entry when no countdown is usable", () => {
    const a = dep(NaN, "U1");
    const b = dep(NaN, "U3");
    expect(computeHeroGroup([a, b])).toEqual([a]);
  });

  it("ignores unusable countdowns when a usable one exists", () => {
    const bad = dep(NaN, "U1");
    const good = dep(6, "U3");
    expect(computeHeroGroup([bad, good])).toEqual([good]);
  });

  it("returns references into the input, so identity dedupe works", () => {
    const a = dep(2);
    expect(computeHeroGroup([a, dep(9)])[0]).toBe(a);
  });
});

describe("splitHeroAndRows", () => {
  const feed = [dep(2, "U1"), dep(5, "U3"), dep(9, "U6")];

  it("keeps the hero out of the row list when the hero is shown", () => {
    const s = splitHeroAndRows(feed, {
      showHeroMetric: true,
      maxDepartures: 10,
    });
    expect(s.heroLead?.line).toBe("U1");
    expect(s.rows.map((d) => d.line)).toEqual(["U3", "U6"]);
  });

  it("shows every departure in the list when the hero is hidden", () => {
    // Nothing above the list is duplicating them, so nothing is removed.
    const s = splitHeroAndRows(feed, {
      showHeroMetric: false,
      maxDepartures: 10,
    });
    expect(s.rows.map((d) => d.line)).toEqual(["U1", "U3", "U6"]);
    // The lead is still computed for callers that want it.
    expect(s.heroLead?.line).toBe("U1");
  });

  it("caps the row list after the hero is removed", () => {
    const s = splitHeroAndRows(feed, {
      showHeroMetric: true,
      maxDepartures: 1,
    });
    expect(s.rows.map((d) => d.line)).toEqual(["U3"]);
  });

  it("supports the hero-only layout via a zero cap", () => {
    const s = splitHeroAndRows(feed, {
      showHeroMetric: true,
      maxDepartures: 0,
    });
    expect(s.heroLead?.line).toBe("U1");
    expect(s.rows).toEqual([]);
  });

  it("returns an undefined lead for an empty feed", () => {
    const s = splitHeroAndRows([], { showHeroMetric: true, maxDepartures: 6 });
    expect(s.heroLead).toBeUndefined();
    expect(s.rows).toEqual([]);
  });
});
