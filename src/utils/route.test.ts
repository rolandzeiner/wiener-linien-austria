import { describe, expect, it } from "vitest";

import type { HomeAssistant, RouteTripAttr } from "../types.js";
import {
  clockOf,
  findRouteEntities,
  minutesUntil,
  normaliseRouteConfig,
  transitLegs,
  upcomingTrips,
  windowDays,
  windowRange,
} from "./route.js";

const NOW = Date.parse("2026-09-14T07:50:00+02:00");

function trip(departure: string, extra: Partial<RouteTripAttr> = {}): RouteTripAttr {
  return {
    departure,
    arrival: departure,
    duration_minutes: 10,
    interchanges: 0,
    risk: "ok",
    cancelled: false,
    legs: [],
    transfers: [],
    ...extra,
  };
}

describe("findRouteEntities", () => {
  it("matches only the route sensor fingerprint", () => {
    const hass = {
      states: {
        "sensor.route": {
          attributes: { trips: [], origin: "A", destination: "B", active: true },
        },
        "sensor.stop": { attributes: { diva: 1, departures: [], next_by_line: {} } },
        "sensor.half": { attributes: { trips: [], origin: "A" } },
        "sensor.inactive_flag_missing": {
          attributes: { trips: [], origin: "A", destination: "B" },
        },
        "binary_sensor.route": {
          attributes: { trips: [], origin: "A", destination: "B", active: true },
        },
      },
    } as unknown as HomeAssistant;
    expect(findRouteEntities(hass)).toEqual(["sensor.route"]);
    expect(findRouteEntities(undefined)).toEqual([]);
  });
});

describe("normaliseRouteConfig", () => {
  it("defaults and clamps", () => {
    const cfg = normaliseRouteConfig({ type: "x", alternatives: 9 });
    expect(cfg).toEqual({
      type: "x",
      entity: "",
      title: "",
      alternatives: 3,
      hide_attribution: false,
    });
    expect(normaliseRouteConfig({ type: "x", alternatives: -1 }).alternatives).toBe(0);
    expect(normaliseRouteConfig({ type: "x", alternatives: "no" as never }).alternatives).toBe(2);
  });

  it("rejects malformed configs", () => {
    expect(() => normaliseRouteConfig(null as never)).toThrow(/object/);
    expect(() => normaliseRouteConfig({ type: "x", entity: 3 as never })).toThrow(/string/);
    expect(() => normaliseRouteConfig({ type: "x", entity: "light.a" })).toThrow(/sensor/);
  });
});

describe("time helpers", () => {
  it("counts whole minutes and never goes negative", () => {
    expect(minutesUntil("2026-09-14T07:57:00+02:00", NOW)).toBe(7);
    expect(minutesUntil("2026-09-14T07:50:59+02:00", NOW)).toBe(0);
    expect(minutesUntil("2026-09-14T07:40:00+02:00", NOW)).toBe(0);
    expect(minutesUntil("nonsense", NOW)).toBeNull();
    expect(minutesUntil(null, NOW)).toBeNull();
  });

  it("prints the server's wall-clock time", () => {
    expect(clockOf("2026-09-14T07:57:00+02:00")).toBe("07:57");
    expect(clockOf(null)).toBe("");
    expect(clockOf("07:57")).toBe("");
  });
});

describe("upcomingTrips", () => {
  it("drops departed and cancelled connections", () => {
    const attrs = {
      trips: [
        trip("2026-09-14T07:40:00+02:00"),
        trip("2026-09-14T07:52:00+02:00", { cancelled: true }),
        trip("2026-09-14T07:55:00+02:00"),
        trip("garbage"),
      ],
    };
    expect(upcomingTrips(attrs, NOW).map((t) => t.departure)).toEqual([
      "2026-09-14T07:55:00+02:00",
      "garbage",
    ]);
    expect(upcomingTrips(undefined, NOW)).toEqual([]);
  });

  it("keeps only rides in transitLegs", () => {
    const stop = { name: "A", stop_id: null, platform: null, planned: null, estimated: null, delay_minutes: null };
    const leg = {
      walk: false, line: "U1", type: "ptMetro", product: null, towards: null,
      origin: stop, destination: stop, realtime: false, stop_count: 1,
      duration_minutes: 1, walk_after_minutes: 0, cancelled: false,
    };
    const t = trip("x", { legs: [leg, { ...leg, walk: true, line: null }] });
    expect(transitLegs(t)).toHaveLength(1);
  });
});

describe("window labels", () => {
  it("formats the range and the days", () => {
    const window = { from: "06:30:00", to: "09:00:00", days: ["fri", "mon"] };
    expect(windowRange(window)).toBe("06:30–09:00");
    expect(windowRange({ from: null, to: null, days: null })).toBe("");
    expect(windowDays(window, "en")).toBe("Mon, Fri");
    expect(windowDays(window, "de")).toMatch(/^Mo\.?, Fr\.?$/);
    expect(windowDays({ from: null, to: null, days: [] }, "de")).toBe("");
    const weekdays = { from: null, to: null, days: ["mon", "tue", "wed", "thu", "fri"] };
    expect(windowDays(weekdays, "en")).toBe("Mon–Fri");
    const mixed = { from: null, to: null, days: ["mon", "tue", "thu", "fri", "sat"] };
    expect(windowDays(mixed, "en")).toBe("Mon, Tue, Thu–Sat");
    const all = { from: null, to: null, days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] };
    expect(windowDays(all, "en")).toBe("");
  });
});
