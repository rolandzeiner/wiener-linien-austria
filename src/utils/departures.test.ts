import { describe, expect, it } from "vitest";

import {
  directionSurface,
  effectiveLines,
  filterDepartures,
  lineDirKey,
  shouldShowStopsAhead,
  walkTimePairs,
} from "./departures.js";
import type { DepartureAttr, WienerLinienAttrs } from "../types.js";

function dep(over: Partial<DepartureAttr> = {}): DepartureAttr {
  return {
    line: "U1",
    towards: "Oberlaa",
    direction: "H",
    type: "ptMetro",
    countdown: 5,
    ...over,
  };
}

describe("filterDepartures — line and direction", () => {
  const feed = [
    dep({ line: "U1", direction: "H", countdown: 2 }),
    dep({ line: "U1", direction: "R", countdown: 4 }),
    dep({ line: "U3", direction: "H", countdown: 6 }),
  ];

  it("returns everything when no filter is set", () => {
    expect(filterDepartures(feed, {})).toHaveLength(3);
  });

  it("keeps only the configured lines", () => {
    const out = filterDepartures(feed, { lines: ["U3"] });
    expect(out.map((d) => d.line)).toEqual(["U3"]);
  });

  it("treats an empty lines array as no line filter", () => {
    expect(filterDepartures(feed, { lines: [] })).toHaveLength(3);
  });

  // Issue #110: the retro card passes its single `line` config straight
  // into this filter, so a config saved with the static-catalogue label
  // has to be folded onto the spelling live departures carry.
  it("matches a legacy line label against the realtime spelling", () => {
    const wlb = [dep({ line: "WLB", direction: "H" })];
    expect(filterDepartures(wlb, { lines: ["LB"] }).map((d) => d.line)).toEqual([
      "WLB",
    ]);
    expect(filterDepartures(wlb, { lines: ["WLB"] })).toHaveLength(1);
    expect(filterDepartures(wlb, { lines: ["U1"] })).toHaveLength(0);
  });

  it("applies a stop-wide direction to every line", () => {
    const out = filterDepartures(feed, { direction: "H" });
    expect(out.map((d) => `${d.line}/${String(d.direction)}`)).toEqual([
      "U1/H",
      "U3/H",
    ]);
  });

  it("lets a per-line direction override the stop-wide one", () => {
    // U1 is pinned to R by the override; U3 falls back to the stop-wide H.
    const out = filterDepartures(feed, {
      direction: "H",
      line_directions: { U1: "R" },
    });
    expect(out.map((d) => `${d.line}/${String(d.direction)}`)).toEqual([
      "U1/R",
      "U3/H",
    ]);
  });

  it("applies a per-line direction even with no stop-wide direction set", () => {
    const out = filterDepartures(feed, { line_directions: { U1: "H" } });
    // U1 is constrained to H; U3 has no override and no stop-wide rule.
    expect(out.map((d) => `${d.line}/${String(d.direction)}`)).toEqual([
      "U1/H",
      "U3/H",
    ]);
  });

  it("preserves upstream order rather than re-sorting", () => {
    const out = filterDepartures(feed, {});
    expect(out.map((d) => d.countdown)).toEqual([2, 4, 6]);
  });
});

describe("filterDepartures — walk times", () => {
  const feed = [
    dep({ line: "U1", direction: "H", countdown: 3 }),
    dep({ line: "U1", direction: "H", countdown: 9 }),
  ];

  it("drops departures the user cannot physically reach", () => {
    const out = filterDepartures(feed, { walk_times: { "U1|H": 5 } });
    expect(out.map((d) => d.countdown)).toEqual([9]);
  });

  it("keeps a departure exactly at the threshold", () => {
    const out = filterDepartures(feed, { walk_times: { "U1|H": 3 } });
    expect(out.map((d) => d.countdown)).toEqual([3, 9]);
  });

  it("ignores a threshold keyed for a different line or direction", () => {
    expect(
      filterDepartures(feed, { walk_times: { "U3|H": 99 } }),
    ).toHaveLength(2);
    expect(
      filterDepartures(feed, { walk_times: { "U1|R": 99 } }),
    ).toHaveLength(2);
  });

  it("keys thresholds by line and direction only, not by terminus", () => {
    // A branching line flips its `towards` between polls, so a triple key
    // would make the threshold flicker on and off.
    expect(lineDirKey("U1", "H")).toBe("U1|H");
    const branching = [
      dep({ line: "U1", direction: "H", towards: "Oberlaa", countdown: 1 }),
      dep({ line: "U1", direction: "H", towards: "Alaudagasse", countdown: 8 }),
    ];
    const out = filterDepartures(branching, { walk_times: { "U1|H": 5 } });
    expect(out.map((d) => d.towards)).toEqual(["Alaudagasse"]);
  });
});

describe("filterDepartures — accessibility", () => {
  const feed = [
    dep({ line: "U1", barrier_free: true }),
    dep({ line: "U3", barrier_free: false }),
    dep({ line: "U6" }),
  ];

  it("keeps only step-free departures when asked", () => {
    const out = filterDepartures(feed, { accessibility_only: true });
    expect(out.map((d) => d.line)).toEqual(["U1"]);
  });

  it("treats a missing barrier_free flag as not step-free", () => {
    const out = filterDepartures(feed, { accessibility_only: true });
    expect(out.map((d) => d.line)).not.toContain("U6");
  });

  it("keeps everything when the filter is off", () => {
    expect(filterDepartures(feed, { accessibility_only: false })).toHaveLength(
      3,
    );
  });
});

describe("shouldShowStopsAhead", () => {
  const withStops = dep({ stops_ahead: [{ name: "Karlsplatz" }] as never });

  it("needs both the toggle and actual upstream data", () => {
    expect(shouldShowStopsAhead(true, withStops)).toBe(true);
    expect(shouldShowStopsAhead(false, withStops)).toBe(false);
    expect(shouldShowStopsAhead(true, dep())).toBe(false);
    expect(shouldShowStopsAhead(true, dep({ stops_ahead: [] }))).toBe(false);
  });

  it("defaults to on when the toggle is unset", () => {
    expect(shouldShowStopsAhead(undefined, withStops)).toBe(true);
  });
});

describe("walkTimePairs — rows the walk-time control offers", () => {
  const NONE = new Set<string>();
  // Westbahnhof at 15:00: U3 and U6 are running, the N6 nightline is not.
  const daytime = {
    departures: [
      dep({ line: "U3", direction: "H", towards: "Simmering" }),
      dep({ line: "U3", direction: "R", towards: "Ottakring" }),
      dep({ line: "U6", direction: "H", towards: "Floridsdorf" }),
      dep({ line: "U6", direction: "R", towards: "Siebenhirten" }),
    ],
    tracked_lines: ["N6", "U3", "U6"],
  } as never;
  const tracked = ["N6", "U3", "U6"];

  it("gives a tracked nightline rows even with no live departures", () => {
    // The bug: N6 got no row at all, so its walk time could only be set
    // between roughly 00:30 and 05:00, when the line actually runs.
    const rows = walkTimePairs(daytime, {
      lines: tracked,
      picked: NONE,
      lineDirections: {},
      stopDirection: null,
    });
    const n6 = rows.filter((p) => p.line === "N6");
    expect(n6.map((p) => p.direction)).toEqual(["H", "R"]);
  });

  it("leaves synthetic rows without termini, so the caller names them", () => {
    const rows = walkTimePairs(daytime, {
      lines: tracked,
      picked: NONE,
      lineDirections: {},
      stopDirection: null,
    });
    expect(rows.find((p) => p.line === "N6")?.termini).toEqual([]);
    // A line with live data keeps its real terminus.
    expect(
      rows.find((p) => p.line === "U3" && p.direction === "H")?.termini,
    ).toEqual(["Simmering"]);
  });

  it("does not duplicate a line that already has live rows", () => {
    const rows = walkTimePairs(daytime, {
      lines: tracked,
      picked: NONE,
      lineDirections: {},
      stopDirection: null,
    });
    expect(rows.filter((p) => p.line === "U3")).toHaveLength(2);
    expect(rows).toHaveLength(6);
  });

  it("narrows a synthetic line to the stop-wide direction", () => {
    const rows = walkTimePairs(daytime, {
      lines: tracked,
      picked: NONE,
      lineDirections: {},
      stopDirection: "H",
    });
    expect(rows.filter((p) => p.line === "N6").map((p) => p.direction)).toEqual([
      "H",
    ]);
  });

  it("lets a per-line override beat the stop-wide direction", () => {
    const rows = walkTimePairs(daytime, {
      lines: tracked,
      picked: NONE,
      lineDirections: { N6: "R" },
      stopDirection: "H",
    });
    expect(rows.filter((p) => p.line === "N6").map((p) => p.direction)).toEqual([
      "R",
    ]);
  });

  it("honours the user's line selection for synthetic rows too", () => {
    const rows = walkTimePairs(daytime, {
      lines: tracked,
      picked: new Set(["U3"]),
      lineDirections: {},
      stopDirection: null,
    });
    expect(rows.every((p) => p.line === "U3")).toBe(true);
    expect(rows).toHaveLength(2);
  });

  it("sorts by line then direction so rows do not jump between polls", () => {
    const rows = walkTimePairs(daytime, {
      lines: tracked,
      picked: NONE,
      lineDirections: {},
      stopDirection: null,
    });
    expect(rows.map((p) => `${p.line}|${p.direction}`)).toEqual([
      "N6|H",
      "N6|R",
      "U3|H",
      "U3|R",
      "U6|H",
      "U6|R",
    ]);
  });

  it("returns nothing when the stop tracks no lines at all", () => {
    expect(
      walkTimePairs(undefined, {
        lines: [],
        picked: NONE,
        lineDirections: {},
        stopDirection: null,
      }),
    ).toEqual([]);
  });
});

describe("directionSurface — unknown is not 'not served'", () => {
  const attrs = (over: Partial<WienerLinienAttrs> = {}): WienerLinienAttrs =>
    ({ departures: [], ...over }) as WienerLinienAttrs;

  it("reports unknown when there is no data at all", () => {
    const s = directionSurface(attrs());
    expect(s.unknown).toBe(true);
    expect(s.oneWay).toBeNull();
    expect(s.available.size).toBe(0);
  });

  it("reports unknown for a sensor that is missing entirely", () => {
    expect(directionSurface(undefined).unknown).toBe(true);
  });

  // The regression that motivated the whole helper: a tracked nightline has no
  // live departures in the afternoon, and reading that as "not served" left its
  // direction buttons disabled — permanently, for a retro card, since the block
  // suppresses the "both" button in singleLine mode.
  it("keeps a tracked line's directions alive with no live departures", () => {
    const s = directionSurface(
      attrs({ tracked_line_keys: ["N25|H", "N25|R"], departures: [] }),
      "N25",
    );
    expect(s.unknown).toBe(false);
    expect([...s.available].sort()).toEqual(["H", "R"]);
    expect(s.oneWay).toBeNull();
  });

  it("reports a genuinely one-way tracked line as oneWay, not unknown", () => {
    const s = directionSurface(attrs({ tracked_line_keys: ["13A|H"] }), "13A");
    expect(s.unknown).toBe(false);
    expect(s.oneWay).toBe("H");
  });

  it("narrows tracked keys to the requested line", () => {
    const a = attrs({ tracked_line_keys: ["U1|H", "U1|R", "13A|H"] });
    expect(directionSurface(a, "13A").oneWay).toBe("H");
    expect([...directionSurface(a, "U1").available].sort()).toEqual(["H", "R"]);
  });

  it("falls back to live departures when no tracked keys exist", () => {
    const s = directionSurface(
      attrs({ departures: [dep({ line: "U1", direction: "R" })] }),
      "U1",
    );
    expect(s.oneWay).toBe("R");
  });

  it("prefers tracked keys over live departures", () => {
    // Live data says H only; the user tracks both. Tracked wins, so the R
    // button stays enabled outside the hours R runs.
    const s = directionSurface(
      attrs({
        tracked_line_keys: ["U1|H", "U1|R"],
        departures: [dep({ line: "U1", direction: "H" })],
      }),
      "U1",
    );
    expect([...s.available].sort()).toEqual(["H", "R"]);
  });

  it("ignores malformed direction components", () => {
    expect(directionSurface(attrs({ tracked_line_keys: ["U1|X", "U1|"] })).unknown).toBe(
      true,
    );
  });
});

describe("effectiveLines — a configured line is never silently dropped", () => {
  it("returns every line when nothing is picked", () => {
    expect(effectiveLines(["U1", "U3"], new Set())).toEqual(["U1", "U3"]);
  });

  it("narrows to the picked lines", () => {
    expect(effectiveLines(["U1", "U3", "U6"], new Set(["U3"]))).toEqual(["U3"]);
  });

  // A saved card whose stop later dropped that line from tracked_lines used to
  // end up with no walk-time rows and an empty {line} in the one-way note.
  it("keeps a picked line the stop list no longer mentions", () => {
    expect(effectiveLines(["U1"], new Set(["N25"]))).toEqual(["N25"]);
  });

  it("keeps both the known and the stranded picks", () => {
    expect(effectiveLines(["U1", "U3"], new Set(["U1", "N25"]))).toEqual(["U1", "N25"]);
  });

  it("does not duplicate a pick that is already in the list", () => {
    expect(effectiveLines(["U1"], new Set(["U1"]))).toEqual(["U1"]);
  });
});
