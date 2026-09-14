import { describe, expect, it } from "vitest";

import type { HomeAssistant, RouteTripAttr } from "../types.js";
import {
  ADHOC_REFRESH_MS,
  ADHOC_ROLLOVER_FLOOR_MS,
  adhocRefreshDelay,
  adhocRetryDelay,
  clockOf,
  filterStops,
  foldStopText,
  findRouteEntities,
  legTypeIcon,
  minutesUntil,
  normaliseRouteConfig,
  transitLegs,
  upcomingTrips,
  viennaClock,
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
      from: "",
      to: "",
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
    expect(() => normaliseRouteConfig({ type: "x", to: "Praterstern" })).toThrow(/stop number/);
  });

  it("passes HA's layout keys through, but never a raw validated key", () => {
    const cfg = normaliseRouteConfig({
      type: "x",
      alternatives: 9,
      grid_options: { columns: "full" },
      view_layout: { position: "sidebar" },
    });
    expect(cfg["grid_options"]).toEqual({ columns: "full" });
    expect(cfg["view_layout"]).toEqual({ position: "sidebar" });
    expect(cfg.alternatives).toBe(3);
  });

  it("keeps ad-hoc defaults as digit strings", () => {
    const cfg = normaliseRouteConfig({ type: "x", from: 60201468, to: " 60201040 " });
    expect([cfg.from, cfg.to]).toEqual(["60201468", "60201040"]);
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

describe("legTypeIcon", () => {
  it("covers the modes only routes reach", () => {
    expect(legTypeIcon("ptTrainS", "S80")).toBe("mdi:train");
    expect(legTypeIcon("ptOther", "S45")).toBe("mdi:train");
    expect(legTypeIcon(null, "s7")).toBe("mdi:train");
    expect(legTypeIcon("ptTrain", "REX")).toBe("mdi:train");
    expect(legTypeIcon("ptBusRegion", "200")).toBe("mdi:bus");
    expect(legTypeIcon("ptBusOnDemand", "25B")).toBe("mdi:bus");
    expect(legTypeIcon("ptCableCar", null)).toBe("mdi:gondola");
    expect(legTypeIcon("ptShip", null)).toBe("mdi:ferry");
    expect(legTypeIcon("ptMetro", "U1")).toBe("mdi:subway-variant");
    expect(legTypeIcon("ptSomethingNew", "X1")).toBeNull();
  });
});

describe("ad-hoc timing", () => {
  const departing = (iso: string): RouteTripAttr =>
    ({ departure: iso, cancelled: false }) as unknown as RouteTripAttr;

  it("refreshes after the next departure, within floor and cadence", () => {
    // Leaves in 7 min: the cadence comes first.
    expect(adhocRefreshDelay([departing("2026-09-14T07:57:00+02:00")], NOW)).toBe(ADHOC_REFRESH_MS);
    // Leaves in 60 s: refresh 30 s after it has gone.
    expect(adhocRefreshDelay([departing("2026-09-14T07:51:00+02:00")], NOW)).toBe(90_000);
    // Leaves now: never sooner than the floor.
    expect(adhocRefreshDelay([departing("2026-09-14T07:50:10+02:00")], NOW)).toBe(
      ADHOC_ROLLOVER_FLOOR_MS,
    );
    // Only trips that already left: nothing to roll over to.
    expect(adhocRefreshDelay([departing("2026-09-14T07:40:00+02:00")], NOW)).toBe(ADHOC_REFRESH_MS);
    expect(adhocRefreshDelay([], NOW)).toBe(ADHOC_REFRESH_MS);
  });

  it("retries only what can succeed on its own", () => {
    expect(adhocRetryDelay("rate_limited", 30)).toBe(30_000);
    expect(adhocRetryDelay("rate_limited", null)).toBe(60_000);
    expect(adhocRetryDelay("upstream", null)).toBe(60_000);
    expect(adhocRetryDelay("not_loaded", null)).toBeNull();
    expect(adhocRetryDelay("invalid_stop", null)).toBeNull();
    expect(adhocRetryDelay("same_stop", null)).toBeNull();
  });

  it("prints fetched_at in Vienna time, whatever zone the stamp carries", () => {
    expect(viennaClock("2026-09-14T05:48:00+00:00")).toBe("07:48");
    expect(viennaClock("2026-01-14T05:48:00+00:00")).toBe("06:48");
    expect(viennaClock("nonsense")).toBe("");
    expect(viennaClock(null)).toBe("");
  });
});

describe("stop filtering", () => {
  const stops = [
    { value: "1", label: "Neubaugasse (Wien) — 300 m" },
    { value: "2", label: "Stephansplatz (Wien)" },
    { value: "3", label: "Währinger Straße-Volksoper (Wien)" },
    { value: "4", label: "Schottenring (Wien) · U2, U4" },
    { value: "5", label: "Rathaus (Wien)" },
  ];
  const values = (query: string, limit?: number): string[] =>
    filterStops(stops, query, limit).matches.map((s) => s.value);

  it("folds case, accents and ß", () => {
    expect(foldStopText("Währinger Straße")).toBe("wahringer strasse");
    expect(values("WAHRINGER strasse")).toEqual(["3"]);
  });

  it("needs every word and ranks label, then word, then any hit", () => {
    // Substring hits only, so the list order (nearest first) stands.
    expect(values("gasse")).toEqual(["1"]);
    expect(values("ring")).toEqual(["3", "4"]);
    // "Stephansplatz" starts with it; "Straße" is a later word.
    expect(values("st")).toEqual(["2", "3"]);
    // A hit inside a word counts too.
    expect(values("oper")).toEqual(["3"]);
    expect(values("haus")).toEqual(["5"]);
    expect(values("u4 schotten")).toEqual(["4"]);
    expect(values("nothing here")).toEqual([]);
  });

  it("returns the list unchanged for an empty query, and caps it", () => {
    expect(values("   ")).toEqual(["1", "2", "3", "4", "5"]);
    expect(filterStops(stops, "", 2)).toEqual({ matches: stops.slice(0, 2), total: 5 });
    expect(filterStops(stops, "wien", 3).total).toBe(5);
  });
});
