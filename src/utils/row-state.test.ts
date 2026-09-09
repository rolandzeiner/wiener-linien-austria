import { describe, expect, it } from "vitest";

import { deriveRowState, type RowStateOptions } from "./row-state.js";
import type { DepartureAttr } from "../types.js";

const ALL_OFF: RowStateOptions = {
  showDelayColors: false,
  showAccessibility: false,
  showCooling: false,
  showPlatform: false,
};
const ALL_ON: RowStateOptions = {
  showDelayColors: true,
  showAccessibility: true,
  showCooling: true,
  showPlatform: true,
};

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

/** planned/real pair `n` minutes apart — negative n means early. */
function delayed(n: number): Partial<DepartureAttr> {
  const planned = new Date("2026-09-07T10:00:00Z");
  const real = new Date(planned.getTime() + n * 60_000);
  return {
    time_planned: planned.toISOString(),
    time_real: real.toISOString(),
  };
}

describe("deriveRowState — countdown", () => {
  it("passes a finite countdown through", () => {
    expect(deriveRowState(dep({ countdown: 7 }), ALL_OFF).countdown).toBe(7);
    expect(deriveRowState(dep({ countdown: 0 }), ALL_OFF).countdown).toBe(0);
  });

  it("reports null for a countdown the feed did not give us", () => {
    expect(
      deriveRowState(dep({ countdown: NaN }), ALL_OFF).countdown,
    ).toBeNull();
    expect(
      deriveRowState(dep({ countdown: Infinity }), ALL_OFF).countdown,
    ).toBeNull();
  });
});

describe("deriveRowState — the countdown state ladder", () => {
  it("calls a departure at or past the platform 'now'", () => {
    expect(deriveRowState(dep({ countdown: 0 }), ALL_ON).cdState).toBe("now");
    expect(deriveRowState(dep({ countdown: -2 }), ALL_ON).cdState).toBe("now");
  });

  it("keeps 'now' even with delay colours switched off", () => {
    // `now` is the line's own accent, not a schedule-deviation signal.
    expect(deriveRowState(dep({ countdown: 0 }), ALL_OFF).cdState).toBe("now");
  });

  it("lets 'now' outrank a late or early reading", () => {
    expect(
      deriveRowState(dep({ countdown: 0, ...delayed(9) }), ALL_ON).cdState,
    ).toBe("now");
    expect(
      deriveRowState(dep({ countdown: 0, ...delayed(-9) }), ALL_ON).cdState,
    ).toBe("now");
  });

  it("marks late and early once the threshold is reached", () => {
    expect(
      deriveRowState(dep({ countdown: 5, ...delayed(1) }), ALL_ON).cdState,
    ).toBe("late");
    expect(
      deriveRowState(dep({ countdown: 5, ...delayed(-1) }), ALL_ON).cdState,
    ).toBe("early");
  });

  it("treats a sub-minute deviation as no state at all", () => {
    expect(
      deriveRowState(dep({ countdown: 5, ...delayed(0) }), ALL_ON).cdState,
    ).toBe("");
  });

  it("suppresses late and early — but only those — with colours off", () => {
    const late = dep({ countdown: 5, ...delayed(4) });
    expect(deriveRowState(late, ALL_ON).cdState).toBe("late");
    expect(deriveRowState(late, ALL_OFF).cdState).toBe("");
  });

  it("has no state when the feed reports no realtime pair", () => {
    expect(deriveRowState(dep({ countdown: 5 }), ALL_ON).cdState).toBe("");
    expect(deriveRowState(dep({ countdown: 5 }), ALL_ON).signedDelay).toBeNull();
  });
});

describe("deriveRowState — flag strip", () => {
  it("shows for a traffic jam regardless of the other toggles", () => {
    expect(deriveRowState(dep({ traffic_jam: true }), ALL_OFF).hasFlags).toBe(
      true,
    );
  });

  it("shows step-free and cooling only when their toggle is on", () => {
    expect(deriveRowState(dep({ barrier_free: true }), ALL_OFF).hasFlags).toBe(
      false,
    );
    expect(deriveRowState(dep({ barrier_free: true }), ALL_ON).hasFlags).toBe(
      true,
    );
    expect(deriveRowState(dep({ cooling: true }), ALL_OFF).hasFlags).toBe(false);
    expect(deriveRowState(dep({ cooling: true }), ALL_ON).hasFlags).toBe(true);
  });

  it("stays hidden when nothing is flagged", () => {
    expect(deriveRowState(dep(), ALL_ON).hasFlags).toBe(false);
  });
});

describe("deriveRowState — platform", () => {
  it("stringifies a platform when shown, and hides it when off", () => {
    expect(deriveRowState(dep({ platform: "3" }), ALL_ON).platform).toBe("3");
    expect(deriveRowState(dep({ platform: "3" }), ALL_OFF).platform).toBeNull();
  });

  it("reports null when the feed carries no platform", () => {
    expect(deriveRowState(dep(), ALL_ON).platform).toBeNull();
    expect(deriveRowState(dep({ platform: null }), ALL_ON).platform).toBeNull();
  });
});
