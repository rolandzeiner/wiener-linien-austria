// The stop helpers the multi-stop editors share. They are what stands between
// a click in the editor and a stop's saved lines, directions and walk times,
// and a mistake here loses config without an error anywhere.

import { describe, expect, it, vi } from "vite-plus/test";

import { multiStopCallbacks, rebuildStops, type MutableStop } from "./editor-common.js";

const WEST = "sensor.westbahnhof_abfahrten";
const TAUB = "sensor.taubstummengasse_abfahrten";

describe("rebuildStops", () => {
  const current: MutableStop[] = [
    { entity: WEST, lines: ["U3"], walk_times: { "U3|H": 4 } },
    { entity: TAUB, direction: "H" },
  ];

  it("keeps each surviving stop's overrides and follows the selector's order", () => {
    expect(rebuildStops(current, [TAUB, WEST])).toEqual([current[1], current[0]]);
  });

  it("gives a newly picked stop a bare entry and drops a removed one", () => {
    expect(rebuildStops(current, [WEST, "sensor.neu_abfahrten"])).toEqual([
      current[0],
      { entity: "sensor.neu_abfahrten" },
    ]);
  });

  it("ignores what is no entity id", () => {
    expect(rebuildStops(current, [WEST, "", 7, null])).toEqual([current[0]]);
    expect(rebuildStops(current, undefined)).toEqual([]);
  });
});

describe("multiStopCallbacks", () => {
  /** The callbacks over `stops`, and what they commit. */
  function setup(stops: MutableStop[] | undefined) {
    const commit = vi.fn<(next: MutableStop[]) => void>();
    return { cb: multiStopCallbacks(() => stops, commit), commit };
  }
  const saved = (commit: ReturnType<typeof setup>["commit"]): MutableStop[] =>
    commit.mock.calls.at(-1)![0];

  it("sets and clears a walk time, leaving no empty map behind", () => {
    const { cb, commit } = setup([{ entity: WEST }, { entity: TAUB }]);
    cb.setWalkTime(WEST, "U3|H", 4);
    expect(saved(commit)).toEqual([{ entity: WEST, walk_times: { "U3|H": 4 } }, { entity: TAUB }]);

    const filled = setup([{ entity: WEST, walk_times: { "U3|H": 4 } }]);
    filled.cb.setWalkTime(WEST, "U3|H", null);
    expect(saved(filled.commit)).toEqual([{ entity: WEST }]);
  });

  it("writes both direction levels at once and tidies them to absence", () => {
    const { cb, commit } = setup([{ entity: WEST, direction: "R" }]);
    cb.setDirections(WEST, { direction: "H", lineDirections: { U6: "R" } });
    expect(saved(commit)).toEqual([{ entity: WEST, direction: "H", line_directions: { U6: "R" } }]);

    cb.setDirections(WEST, { direction: null, lineDirections: {} });
    expect(saved(commit)).toEqual([{ entity: WEST }]);
  });

  it("toggles a line and drops the list with its last line", () => {
    const { cb, commit } = setup([{ entity: WEST, lines: ["U3"] }]);
    cb.toggleLine(WEST, "U6");
    expect(saved(commit)[0]!.lines).toEqual(["U3", "U6"]);
    cb.toggleLine(WEST, "U3");
    expect(saved(commit)).toEqual([{ entity: WEST }]);
  });

  it("removes one stop and never mutates the stops it was given", () => {
    const stops: MutableStop[] = [{ entity: WEST, lines: ["U3"] }, { entity: TAUB }];
    const { cb, commit } = setup(stops);
    cb.remove?.(WEST);
    expect(saved(commit)).toEqual([{ entity: TAUB }]);
    cb.toggleLine(WEST, "U3");
    expect(stops).toEqual([{ entity: WEST, lines: ["U3"] }, { entity: TAUB }]);
  });

  it("does nothing before the config has arrived", () => {
    const { cb, commit } = setup(undefined);
    cb.toggleLine(WEST, "U3");
    cb.remove?.(WEST);
    expect(commit).not.toHaveBeenCalled();
  });
});
