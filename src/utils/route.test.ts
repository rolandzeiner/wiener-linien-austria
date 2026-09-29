import { describe, expect, it } from "vitest";

import type { HomeAssistant, RouteTripAttr } from "../types.js";
import {
  accessIcon,
  ADHOC_REFRESH_MS,
  ADHOC_ROLLOVER_FLOOR_MS,
  adhocPlanRefreshDelay,
  adhocRefreshDelay,
  ADHOC_NO_TIMETABLE_RETRY_MS,
  ADHOC_NOT_LOADED_RETRY_MS,
  adhocErrorSpec,
  adhocRetryDelay,
  clockOf,
  filterStops,
  foldStopText,
  findRouteEntities,
  legTypeIcon,
  minutesUntil,
  normaliseRouteConfig,
  sameStop,
  transitLegs,
  upcomingTrips,
  viennaClock,
  viennaDayOffset,
  viennaInputValue,
  replanDeparture,
  ADHOC_PLANNED_REFRESH_MS,
  rideFrequency,
  roundedClock,
  catchableDeparture,
  delayedClock,
  isInputDateTime,
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
      step_free: false,
      show_map_pins: true,
      replan_from_change: false,
    });
    expect(normaliseRouteConfig({ type: "x", show_map_pins: false }).show_map_pins).toBe(false);
    expect(
      normaliseRouteConfig({ type: "x", replan_from_change: true }).replan_from_change,
    ).toBe(true);
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
    // Leaves in 10 s: never sooner than the floor.
    expect(adhocRefreshDelay([departing("2026-09-14T07:50:10+02:00")], NOW)).toBe(
      ADHOC_ROLLOVER_FLOOR_MS,
    );
    // Only trips that already left: nothing to roll over to.
    expect(adhocRefreshDelay([departing("2026-09-14T07:40:00+02:00")], NOW)).toBe(ADHOC_REFRESH_MS);
    expect(adhocRefreshDelay([], NOW)).toBe(ADHOC_REFRESH_MS);
  });

  it("waits out the budget after a stale plan", () => {
    const trips = [departing("2026-09-14T07:57:00+02:00")];
    expect(adhocPlanRefreshDelay({ trips }, NOW)).toBe(ADHOC_REFRESH_MS);
    // Stale with a long wait: don't ask again before a token is back.
    expect(adhocPlanRefreshDelay({ trips, stale: true, retry_after: 900 }, NOW)).toBe(900_000);
    // Stale with a short wait: the usual cadence is already later.
    expect(adhocPlanRefreshDelay({ trips, stale: true, retry_after: 5 }, NOW)).toBe(ADHOC_REFRESH_MS);
    // retry_after without stale is ignored.
    expect(adhocPlanRefreshDelay({ trips, retry_after: 900 }, NOW)).toBe(ADHOC_REFRESH_MS);
  });

  it("retries only what can succeed on its own", () => {
    const retry = (code: string, after: number | null, key?: string) =>
      adhocRetryDelay(adhocErrorSpec(code, key), after);
    expect(retry("rate_limited", 30)).toBe(30_000);
    expect(retry("rate_limited", null)).toBe(60_000);
    expect(retry("upstream", 5)).toBe(5_000);
    expect(retry("upstream", null)).toBe(60_000);
    expect(retry("something_new", null)).toBe(60_000);
    // Right after a restart the integration may not be loaded yet.
    expect(retry("not_loaded", null)).toBe(ADHOC_NOT_LOADED_RETRY_MS);
    expect(retry("invalid_stop", null)).toBeNull();
    expect(retry("same_stop", null)).toBeNull();
    // A query the trip planner refused isn't asked again on its own ...
    expect(retry("invalid_query", null, "route_too_close")).toBeNull();
    expect(retry("invalid_query", null, "route_stop_invalid")).toBeNull();
    expect(retry("invalid_query", null, "who_knows")).toBeNull();
    // ... except a missing timetable, much later.
    expect(retry("invalid_query", null, "route_outside_timetable")).toBe(
      ADHOC_NO_TIMETABLE_RETRY_MS,
    );
  });

  it("describes a refused query by what the trip planner said", () => {
    expect(adhocErrorSpec("invalid_query", "route_too_close").title).toBe("adhoc_error_too_close");
    expect(adhocErrorSpec("invalid_query", null).title).toBe("adhoc_error_refused");
    expect(adhocErrorSpec("upstream").title).toBe("adhoc_error_upstream");
    expect(adhocErrorSpec("something_new").title).toBe("adhoc_error_unknown");
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

describe("chosen-time planning", () => {
  it("starts the time field at the next five minutes on the Vienna clock", () => {
    expect(viennaInputValue(Date.parse("2026-09-14T07:51:30+02:00"))).toBe("2026-09-14T07:55");
    expect(viennaInputValue(Date.parse("2026-09-14T07:55:00+02:00"))).toBe("2026-09-14T07:55");
    // Rolls over midnight in Vienna, not in UTC.
    expect(viennaInputValue(Date.parse("2026-09-14T21:58:00Z"))).toBe("2026-09-15T00:00");
  });

  it("plans from a change at the minute the ride gets in, plus the walk", () => {
    const stop = (planned: string, estimated: string | null = null) => ({
      name: "Stephansplatz",
      stop_id: "60201012",
      platform: null,
      planned,
      estimated,
      delay_minutes: null,
    });
    // 08:04 arrival + 4 min between platforms, and not rounded up to 08:10 —
    // that would hide whatever leaves at 08:09.
    expect(replanDeparture(stop("2026-09-14T08:04:00+02:00"), 4, NOW)).toBe("2026-09-14T08:08");
    // A late ride moves the question with it.
    expect(
      replanDeparture(stop("2026-09-14T08:04:00+02:00", "2026-09-14T08:11:00+02:00"), 4, NOW),
    ).toBe("2026-09-14T08:15");
    // A change already behind us asks for now, not for this morning.
    expect(replanDeparture(stop("2026-09-14T06:00:00+02:00"), 0, NOW)).toBe("2026-09-14T07:50");
    expect(replanDeparture(stop(""), 4, NOW)).toBeNull();
  });

  it("accepts only a complete datetime-local value", () => {
    expect(isInputDateTime("2026-09-15T08:30")).toBe(true);
    expect(isInputDateTime("")).toBe(false);
    expect(isInputDateTime("2026-09-15")).toBe(false);
  });

  it("counts calendar days on the Vienna clock", () => {
    expect(viennaDayOffset("2026-09-14T23:30:00+02:00", NOW)).toBe(0);
    expect(viennaDayOffset("2026-09-15T00:10:00+02:00", NOW)).toBe(1);
    expect(viennaDayOffset("2026-09-13T12:00:00+02:00", NOW)).toBe(-1);
    expect(viennaDayOffset("nonsense", NOW)).toBeNull();
  });

  it("keeps a planned answer's connections and refreshes it slowly", () => {
    const plan = { trips: [trip("2026-09-14T06:00:00+02:00")], planned_for: "2026-09-14T06:00:00+02:00" };
    expect(upcomingTrips(plan, NOW)).toHaveLength(1);
    expect(upcomingTrips({ trips: plan.trips }, NOW)).toHaveLength(0);
    expect(adhocPlanRefreshDelay(plan, NOW)).toBe(ADHOC_PLANNED_REFRESH_MS);
    expect(adhocPlanRefreshDelay({ ...plan, stale: true, retry_after: 900 }, NOW)).toBe(900_000);
  });
});

describe("rideFrequency", () => {
  // Only the two fields rideFrequency reads.
  const leg = (headway: number | null, next: string[] = []) =>
    ({ headway_minutes: headway, next_departures: next }) as unknown as Parameters<typeof rideFrequency>[0];

  it("gives the headway for a frequent line and the next times otherwise", () => {
    const next = ["2026-09-14T08:07:00+02:00", "2026-09-14T08:14:00+02:00"];
    expect(rideFrequency(leg(5, next))).toEqual({ every: 5 });
    expect(rideFrequency(leg(7, next))).toEqual({ then: ["08:07", "08:14"] });
    expect(rideFrequency(leg(12))).toEqual({ every: 12 });
    expect(rideFrequency(leg(null))).toBeNull();
  });
});

describe("delayedClock", () => {
  const at = (time: string) => `2026-09-14T${time}+02:00`;

  it("pairs the planned time with the expected one, rounded to the minute", () => {
    expect(delayedClock({ planned: at("09:22:00"), estimated: at("09:25:10") })).toEqual({
      planned: "09:22",
      expected: "09:25",
    });
    expect(delayedClock({ planned: at("09:22:00"), estimated: at("09:24:40") })).toEqual({
      planned: "09:22",
      expected: "09:25",
    });
  });

  it("stays quiet for on-time, early, sub-minute or missing times", () => {
    expect(delayedClock({ planned: at("09:22:00"), estimated: at("09:22:00") })).toBeNull();
    expect(delayedClock({ planned: at("09:22:00"), estimated: at("09:22:20") })).toBeNull();
    expect(delayedClock({ planned: at("09:22:00"), estimated: at("09:21:00") })).toBeNull();
    expect(delayedClock({ planned: at("09:22:00"), estimated: null })).toBeNull();
    expect(delayedClock({ planned: null, estimated: at("09:25:00") })).toBeNull();
  });
});

describe("roundedClock", () => {
  it("rounds live seconds to the nearest minute on the Vienna clock", () => {
    expect(roundedClock("2026-09-14T09:37:40+02:00")).toBe("09:38");
    expect(roundedClock("2026-09-14T09:37:20+02:00")).toBe("09:37");
    expect(roundedClock(null)).toBe("");
  });
});

describe("catchableDeparture", () => {
  const leg = (fields: Record<string, unknown>) => fields as unknown as Parameters<typeof catchableDeparture>[0];
  const arriving = leg({ destination: { planned: "2026-09-14T09:44:00+02:00", estimated: "2026-09-14T09:46:00+02:00" } });
  const departing = leg({
    next_departures: ["2026-09-14T09:52:11+02:00", "2026-09-14T09:59:56+02:00"],
  });
  const transfer = (risk: string, walk = 4) =>
    ({ at: "Ottakring", walk_minutes: walk, slack_minutes: -2, risk }) as never;

  it("picks the first later departure reachable after the walk", () => {
    expect(catchableDeparture(arriving, transfer("at_risk"), departing)).toBe("2026-09-14T09:52:11+02:00");
    expect(catchableDeparture(arriving, transfer("at_risk", 7), departing)).toBe("2026-09-14T09:59:56+02:00");
    expect(catchableDeparture(arriving, transfer("at_risk", 20), departing)).toBeNull();
  });

  it("only speaks up for a change at risk", () => {
    expect(catchableDeparture(arriving, transfer("tight"), departing)).toBeNull();
  });
});

describe("sameStop", () => {
  const stop = (stop_id: string | null, latitude?: number, longitude?: number) => ({
    stop_id,
    ...(latitude === undefined ? {} : { latitude }),
    ...(longitude === undefined ? {} : { longitude }),
  });

  it("matches one DIVA under two names, or the same coordinates", () => {
    expect(sameStop(stop("60200981"), stop("60200981"))).toBe(true);
    expect(sameStop(stop(null, 48.212, 16.3117), stop("1", 48.212, 16.3117))).toBe(true);
  });

  it("tells different stops apart, and never guesses without data", () => {
    expect(sameStop(stop("60201206", 48.2066, 16.3851), stop("60200657", 48.2053, 16.3854))).toBe(false);
    expect(sameStop(stop(null), stop(null))).toBe(false);
  });
});

describe("accessIcon", () => {
  it("gives a ramp down the downhill slope and every other step one icon", () => {
    expect(accessIcon({ kind: "ramp", level: "up", stop_id: null })).toBe("mdi:slope-uphill");
    expect(accessIcon({ kind: "ramp", level: null, stop_id: null })).toBe("mdi:slope-uphill");
    expect(accessIcon({ kind: "ramp", level: "down", stop_id: null })).toBe("mdi:slope-downhill");
    expect(accessIcon({ kind: "elevator", level: "down", stop_id: null })).toBe(
      "mdi:elevator-passenger",
    );
    expect(accessIcon({ kind: "teleporter", level: null, stop_id: null })).toBe("mdi:walk");
  });
});
