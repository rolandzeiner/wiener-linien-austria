import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { coerceWalkTime } from "./editor-shared.js";

describe("coerceWalkTime", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rounds and clamps a number to 1..120 minutes", () => {
    expect(coerceWalkTime(" 4.6 ", "sensor.x/U1|H")).toBe(5);
    expect(coerceWalkTime("500", "sensor.x/U1|H")).toBe(120);
  });

  it("clears on empty, zero or negative input without a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(coerceWalkTime("", "sensor.x/U1|H")).toBeNull();
    expect(coerceWalkTime("0", "sensor.x/U1|H")).toBeNull();
    expect(coerceWalkTime("-3", "sensor.x/U1|H")).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns, naming the field, before clearing input that is not a number", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(coerceWalkTime("5min", "sensor.x/U1|H")).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]![0]).toContain("sensor.x/U1|H");
  });
});
