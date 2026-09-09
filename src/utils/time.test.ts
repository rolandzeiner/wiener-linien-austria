import { describe, expect, it } from "vitest";

import { delayMinutes, formatClock, formatDate } from "./time.js";

describe("delayMinutes", () => {
  it("reports the signed difference in whole minutes", () => {
    expect(
      delayMinutes("2026-09-07T10:00:00+02:00", "2026-09-07T10:03:00+02:00"),
    ).toBe(3);
    expect(
      delayMinutes("2026-09-07T10:00:00+02:00", "2026-09-07T09:58:00+02:00"),
    ).toBe(-2);
  });

  it("reports 0 rather than null when the two timestamps are equal", () => {
    // Upstream emits equal planned/real even with no delay; the caller
    // decides whether to label it, so the helper must not collapse to null.
    expect(
      delayMinutes("2026-09-07T10:00:00+02:00", "2026-09-07T10:00:00+02:00"),
    ).toBe(0);
  });

  it("returns null when either side is missing or unparseable", () => {
    expect(delayMinutes(null, "2026-09-07T10:00:00+02:00")).toBeNull();
    expect(delayMinutes("2026-09-07T10:00:00+02:00", undefined)).toBeNull();
    expect(delayMinutes("nonsense", "2026-09-07T10:00:00+02:00")).toBeNull();
    expect(delayMinutes("", "")).toBeNull();
  });
});

describe("formatClock", () => {
  it("pads to HH:MM", () => {
    const d = new Date(2026, 8, 7, 9, 5);
    expect(formatClock(d.toISOString())).toBe("09:05");
  });

  it("returns null instead of painting NaN:NaN", () => {
    expect(formatClock(null)).toBeNull();
    expect(formatClock(undefined)).toBeNull();
    expect(formatClock("not-a-date")).toBeNull();
  });
});

describe("formatDate — PHP-style tokens", () => {
  // Fixed local date: Monday 2026-09-07, 08:07:09.
  const d = new Date(2026, 8, 7, 8, 7, 9);

  it("formats day and month tokens, padded and unpadded", () => {
    expect(formatDate(d, "d")).toBe("07");
    expect(formatDate(d, "j")).toBe("7");
    expect(formatDate(d, "m")).toBe("09");
    expect(formatDate(d, "n")).toBe("9");
  });

  it("formats year tokens", () => {
    expect(formatDate(d, "Y")).toBe("2026");
    expect(formatDate(d, "y")).toBe("26");
  });

  it("formats 24-hour, minute and second tokens", () => {
    expect(formatDate(d, "H")).toBe("08");
    expect(formatDate(d, "G")).toBe("8");
    expect(formatDate(d, "i")).toBe("07");
    expect(formatDate(d, "s")).toBe("09");
  });

  it("wraps 12-hour tokens correctly at midnight, noon and 13:00", () => {
    const at = (h: number): Date => new Date(2026, 8, 7, h, 0, 0);
    expect(formatDate(at(0), "h")).toBe("12");
    expect(formatDate(at(0), "g")).toBe("12");
    expect(formatDate(at(12), "h")).toBe("12");
    expect(formatDate(at(13), "h")).toBe("01");
    expect(formatDate(at(13), "g")).toBe("1");
    expect(formatDate(at(23), "g")).toBe("11");
  });

  it("passes separators and unknown characters through untouched", () => {
    expect(formatDate(d, "d.m.Y")).toBe("07.09.2026");
    expect(formatDate(d, "H:i")).toBe("08:07");
    expect(formatDate(d, "d/m")).toBe("07/09");
  });

  it("treats a backslash as an escape for the next character", () => {
    // Without the escape, "d" would render the day number.
    expect(formatDate(d, "\\d")).toBe("d");
    expect(formatDate(d, "\\Y\\e\\a\\r: Y")).toBe("Year: 2026");
  });

  it("returns an empty string for an empty format", () => {
    expect(formatDate(d, "")).toBe("");
  });

  it("localises weekday and month names", () => {
    expect(formatDate(d, "l", "en")).toBe("Monday");
    expect(formatDate(d, "D", "en")).toBe("Mon");
    expect(formatDate(d, "F", "en")).toBe("September");
    // German is the default locale for this integration.
    expect(formatDate(d, "l", "de")).toBe("Montag");
  });
});
