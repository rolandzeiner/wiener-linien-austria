import { describe, expect, it } from "vite-plus/test";

import {
  RUN_TIMES_REASK_MS,
  RUN_TIMES_RETRY_MS,
  needsRunTimes,
  runTimeKey,
  runTimesAnswered,
  runTimesFailed,
  skipUntilText,
  stopEta,
  stopSkip,
  stopVerdict,
  type RunTimesAnswer,
  type RunTimesState,
  type StationCalls,
} from "./run-times.js";

const NOW = Date.parse("2026-10-08T10:30:00Z");
const HOUR = 60 * 60_000;
const U1 = runTimeKey("U1", "H");
const TRAM = runTimeKey("5", "H");

function answer(overrides: Partial<RunTimesAnswer> = {}): RunTimesAnswer {
  return {
    diva: 60201040,
    fetched_at: "2026-10-08T10:30:00+00:00",
    valid_until: "2026-10-08T19:00:00+02:00",
    run_times: { [U1]: { Vorgartenstraße: 1, Leopoldau: 14 } },
    ...overrides,
  };
}

function held(overrides: Partial<RunTimesState> = {}): RunTimesState {
  return {
    runTimes: { [U1]: { Leopoldau: 14 } },
    noStop: {},
    calling: {},
    validUntil: NOW + 6 * HOUR,
    asked: new Map(),
    ...overrides,
  };
}

describe("needsRunTimes", () => {
  it("asks when nothing is held for the stop", () => {
    expect(needsRunTimes(undefined, U1, NOW)).toBe(true);
  });

  it("doesn't ask for a line the answer holds", () => {
    expect(needsRunTimes(held(), U1, NOW)).toBe(false);
  });

  it("asks again once the answer has run out, even for a line it holds", () => {
    const state = held({ validUntil: NOW });
    expect(needsRunTimes(state, U1, NOW - 1)).toBe(false);
    expect(needsRunTimes(state, U1, NOW)).toBe(true);
  });

  it("asks once for a line the answer lacks, then waits an hour", () => {
    expect(needsRunTimes(held(), TRAM, NOW)).toBe(true);
    const asked = held({ asked: new Map([[TRAM, NOW]]) });
    expect(needsRunTimes(asked, TRAM, NOW + RUN_TIMES_REASK_MS - 1)).toBe(false);
    expect(needsRunTimes(asked, TRAM, NOW + RUN_TIMES_REASK_MS)).toBe(true);
  });

  // `"constructor" in {}` is true: a line can't be mistaken for held because
  // an object prototype happens to carry a property of its name.
  it("isn't fooled by a line named like an object property", () => {
    expect(needsRunTimes(held(), "constructor", NOW)).toBe(true);
  });
});

describe("runTimesAnswered", () => {
  it("holds the answer until the server's valid_until", () => {
    const state = runTimesAnswered(undefined, U1, answer(), NOW);
    expect(state.runTimes[U1]).toEqual({ Vorgartenstraße: 1, Leopoldau: 14 });
    expect(state.validUntil).toBe(Date.parse("2026-10-08T17:00:00Z"));
    expect([...state.asked]).toEqual([[U1, NOW]]);
  });

  it("holds an answer that is already past its date for a few minutes only", () => {
    // A browser clock running ahead of the server's: without the floor every
    // render would ask again.
    for (const valid_until of ["2026-10-08T10:00:00Z", "soon"]) {
      const state = runTimesAnswered(undefined, U1, answer({ valid_until }), NOW);
      expect(state.validUntil).toBe(NOW + RUN_TIMES_RETRY_MS);
    }
  });

  it("keeps the lines asked about while the answer they were asked under holds", () => {
    const prev = held({ asked: new Map([[TRAM, NOW - HOUR]]) });
    const state = runTimesAnswered(prev, U1, answer(), NOW);
    expect([...state.asked]).toEqual([
      [TRAM, NOW - HOUR],
      [U1, NOW],
    ]);
  });

  it("starts the asked list over with a new answer", () => {
    const prev = held({ validUntil: NOW - 1, asked: new Map([[TRAM, NOW - HOUR]]) });
    const state = runTimesAnswered(prev, U1, answer(), NOW);
    expect([...state.asked]).toEqual([[U1, NOW]]);
  });

  it("reads a malformed answer as no run times", () => {
    const state = runTimesAnswered(
      undefined,
      U1,
      answer({ run_times: null as unknown as RunTimesAnswer["run_times"] }),
      NOW,
    );
    expect(state.runTimes).toEqual({});
  });

  it("holds the stations passed without a call", () => {
    const no_stop = { [U1]: { Messestraße: "2026-12-31T23:59:00+01:00" } };
    const state = runTimesAnswered(undefined, U1, answer({ no_stop }), NOW);
    expect(state.noStop).toEqual(no_stop);
  });

  it("reads an answer without them, from an older backend, as none", () => {
    expect(runTimesAnswered(undefined, U1, answer(), NOW).noStop).toEqual({});
    const broken = answer({ no_stop: "x" as unknown as NonNullable<RunTimesAnswer["no_stop"]> });
    expect(runTimesAnswered(undefined, U1, broken, NOW).noStop).toEqual({});
  });

  it("holds which runs call at those stations after all", () => {
    const calling = {
      [U1]: {
        Messestraße: {
          between: [1, 3] as [number, number],
          calls: [],
          from: "2026-10-08T10:30:00Z",
          until: "2026-10-08T16:30:00Z",
        },
      },
    };
    expect(runTimesAnswered(undefined, U1, answer({ calling }), NOW).calling).toEqual(calling);
    expect(runTimesAnswered(undefined, U1, answer(), NOW).calling).toEqual({});
  });
});

describe("runTimesFailed", () => {
  it("keeps what was held and waits before the next ask", () => {
    const prev = held({ noStop: { [U1]: { Messestraße: null } } });
    const state = runTimesFailed(prev, TRAM, NOW);
    expect(state.runTimes[U1]).toEqual({ Leopoldau: 14 });
    expect(state.noStop).toEqual(prev.noStop);
    expect(state.validUntil).toBe(NOW + RUN_TIMES_RETRY_MS);
    // Recorded, so the failure doesn't turn into an ask per render.
    expect(needsRunTimes(state, TRAM, NOW + 1)).toBe(false);
    expect(needsRunTimes(state, TRAM, NOW + RUN_TIMES_RETRY_MS)).toBe(true);
  });

  it("holds nothing after a first ask that failed", () => {
    const state = runTimesFailed(undefined, U1, NOW);
    expect(state.runTimes).toEqual({});
    expect(state.noStop).toEqual({});
    expect(state.calling).toEqual({});
    expect(needsRunTimes(state, U1, NOW + 1)).toBe(false);
  });
});

describe("stopEta", () => {
  const dep = {
    time_planned: "2026-09-09T16:38:00.000+0200",
    time_real: "2026-09-09T16:40:20.000+0200",
    countdown: 5,
  };

  it("adds the scheduled minutes to the live departure", () => {
    // 16:40:20 + 7 min = 16:47:20, which is 16:47.
    expect(stopEta(dep, 7, NOW)).toMatchObject({
      iso: "2026-09-09T14:47:00.000Z",
      clock: "16:47",
    });
  });

  it("prints the minute the arrival falls in, as the board at that stop does", () => {
    const late = { ...dep, time_real: "2026-09-09T16:40:50.000+0200" };
    expect(stopEta(late, 1, NOW)?.clock).toBe("16:41");
  });

  it("carries a run time's half minute into the sum", () => {
    // The 48A from Neubaugasse to Ottakring, timetabled 15 min 30 s: the
    // 12:42:30 bus is due 12:58:00 there and the 12:50:00 one 13:05:30.
    const bus = (time: string) => ({
      time_planned: `2026-10-08T${time}.000+0200`,
      time_real: `2026-10-08T${time}.000+0200`,
      countdown: 6,
    });
    expect(stopEta(bus("12:42:30"), 15.5, NOW)?.clock).toBe("12:58");
    expect(stopEta(bus("12:50:00"), 15.5, NOW)?.clock).toBe("13:05");
  });

  it("counts from the planned time when there is no live one", () => {
    expect(stopEta({ ...dep, time_real: null }, 7, NOW)?.clock).toBe("16:45");
    expect(stopEta({ ...dep, time_real: "soon" }, 7, NOW)?.clock).toBe("16:45");
  });

  it("counts from the countdown when the row carries no time", () => {
    // 10:30 UTC is 12:30 in Vienna; in 5 min + 7 min.
    const eta = stopEta({ time_planned: null, time_real: null, countdown: 5 }, 7, NOW);
    expect(eta?.clock).toBe("12:42");
  });

  it("prints Vienna time whatever zone the stamp is written in", () => {
    const utc = { ...dep, time_real: "2026-09-09T14:40:20Z" };
    expect(stopEta(utc, 7, NOW)?.clock).toBe("16:47");
  });

  describe("a late departure", () => {
    const at = (real: string | null) => ({
      time_planned: "2026-09-09T16:38:00.000+0200",
      time_real: real === null ? null : `2026-09-09T${real}.000+0200`,
      countdown: 5,
    });

    it("keeps the arrival the timetable had, and how late the new one is", () => {
      // 2 min 20 s behind: 16:45 on time, 16:47 as it runs.
      expect(stopEta(at("16:40:20"), 7, NOW)).toEqual({
        iso: "2026-09-09T14:47:00.000Z",
        clock: "16:47",
        planned: { clock: "16:45", late: 2 },
      });
    });

    it("counts as late from a full minute behind", () => {
      expect(stopEta(at("16:39:00"), 7, NOW)?.planned).toEqual({
        clock: "16:45",
        late: 1,
      });
      // 59 s behind prints the same minute at this stop and the next one at
      // others; such a trail isn't struck through at all.
      expect(stopEta(at("16:38:59"), 7, NOW)?.planned).toBeUndefined();
    });

    it("is late by the same minutes at every stop of the trail", () => {
      const lates = [0.5, 1, 2.3, 7, 15.5, 38].map(
        (minutes) => stopEta(at("16:39:40"), minutes, NOW)?.planned?.late,
      );
      // 1 min 40 s behind: one or two printed minutes, never none.
      expect(lates.every((late) => late === 1 || late === 2)).toBe(true);
    });

    it("leaves an early or an unreported departure unmarked", () => {
      expect(stopEta(at("16:36:00"), 7, NOW)).toEqual({
        iso: "2026-09-09T14:43:00.000Z",
        clock: "16:43",
      });
      expect(stopEta(at(null), 7, NOW)?.planned).toBeUndefined();
      expect(
        stopEta(
          { time_planned: null, time_real: "2026-09-09T16:40:20.000+0200", countdown: 5 },
          7,
          NOW,
        )?.planned,
      ).toBeUndefined();
    });
  });

  it("has no time for a stop the timetable gave none for", () => {
    expect(stopEta(dep, undefined, NOW)).toBeNull();
    expect(stopEta(dep, Number.NaN, NOW)).toBeNull();
  });

  it("has no time for a row with nothing to count from", () => {
    const blank = { time_planned: null, time_real: null, countdown: Number.NaN };
    expect(stopEta(blank, 7, NOW)).toBeNull();
  });
});

describe("stopSkip", () => {
  it("isn't a skip for a stop the answer doesn't name", () => {
    expect(stopSkip(undefined, NOW)).toBeNull();
  });

  it("is a skip without a date where no notice gives one", () => {
    expect(stopSkip(null, NOW)).toEqual({ until: null });
    expect(stopSkip("someday", NOW)).toEqual({ until: null });
  });

  it("carries the date the stop is back", () => {
    expect(stopSkip("2026-12-31T23:59:00+01:00", NOW)).toEqual({
      until: new Date("2026-12-31T22:59:00Z"),
    });
  });

  it("is no skip once that date has passed", () => {
    // Run times held for a week can predate the stop's reopening.
    expect(stopSkip("2026-10-08T10:30:00Z", NOW)).toBeNull();
  });
});

describe("stopVerdict", () => {
  // U6 from Westbahnhof towards Floridsdorf on a Tuesday evening: Neue Donau
  // is shut that way by day, and served from about 22:00 while the line runs
  // single-track. Handelskai is 16 minutes out, Floridsdorf 19.
  const UNTIL = "2026-12-31T23:59:00+01:00";
  const evening = Date.parse("2026-11-10T20:00:00+01:00");
  const neueDonau: StationCalls = {
    between: [16, 19],
    calls: ["2026-11-10T22:02:00+01:00", "2026-11-10T22:09:00+01:00"],
    from: "2026-11-10T20:03:00+01:00",
    until: "2026-11-11T07:52:00+01:00",
  };
  const leaving = (clock: string) => ({ time_planned: `2026-11-10T${clock}:00+01:00` });

  it("shows the time at a station no notice or sample doubts", () => {
    expect(stopVerdict(leaving("21:00"), 17, undefined, undefined, evening)).toEqual({
      minutes: 17,
      skip: null,
    });
  });

  it("stops a run the station's departures list between the calls either side", () => {
    // Leaves 21:45, Handelskai 22:01, Floridsdorf 22:04: the 22:02 call is it.
    expect(stopVerdict(leaving("21:45"), undefined, UNTIL, neueDonau, evening)).toEqual({
      minutes: 17,
      skip: null,
    });
  });

  it("prefers the sample's own minutes for a run that calls", () => {
    expect(stopVerdict(leaving("21:45"), 17.4, UNTIL, neueDonau, evening).minutes).toBe(17.4);
  });

  it("allows for the seconds the timetable cuts off a call", () => {
    // Handelskai at 22:02:30 by the averaged minutes; the call prints 22:02.
    const late = { ...neueDonau, between: [16.5, 19] as [number, number] };
    expect(stopVerdict(leaving("21:46"), undefined, UNTIL, late, evening).skip).toBeNull();
  });

  it("allows for a run a minute slower than the sample", () => {
    // By the sample Floridsdorf is reached at 22:01; this run calls at
    // Neue Donau at 22:02, timetabled slower at this hour.
    expect(stopVerdict(leaving("21:42"), undefined, UNTIL, neueDonau, evening)).toEqual({
      minutes: 20,
      skip: null,
    });
  });

  it("passes through on a run between the calls, without a date while others stop", () => {
    // Leaves 21:30: Handelskai 21:46, Floridsdorf 21:49, no call between.
    expect(stopVerdict(leaving("21:30"), undefined, UNTIL, neueDonau, evening)).toEqual({
      skip: { until: null },
    });
  });

  it("says until when the stop is back where no run calls there", () => {
    const shut = { ...neueDonau, calls: [] };
    expect(stopVerdict(leaving("21:30"), 17, UNTIL, shut, evening)).toEqual({
      skip: { until: new Date(UNTIL) },
    });
  });

  it("goes by the sample where the departures don't reach the run", () => {
    const short = { ...neueDonau, until: "2026-11-10T21:00:00+01:00" };
    expect(stopVerdict(leaving("21:30"), undefined, UNTIL, short, evening).skip).toEqual({
      until: new Date(UNTIL),
    });
    expect(stopVerdict(leaving("21:30"), 17, UNTIL, short, evening).minutes).toBe(17);
    // Nor before they start.
    expect(stopVerdict(leaving("19:45"), 17, UNTIL, neueDonau, evening).minutes).toBe(17);
  });

  it("goes by the sample without the departures or a planned time", () => {
    expect(stopVerdict(leaving("21:45"), undefined, null, undefined, evening)).toEqual({
      skip: { until: null },
    });
    expect(stopVerdict({ time_planned: null }, 17, null, neueDonau, evening).minutes).toBe(17);
    const broken = { ...neueDonau, between: null } as unknown as StationCalls;
    expect(stopVerdict(leaving("21:30"), 17, null, broken, evening).minutes).toBe(17);
  });

  it("shows the time once the stop is back", () => {
    const after = Date.parse("2027-01-02T10:00:00+01:00");
    expect(stopVerdict(leaving("21:30"), 17, UNTIL, neueDonau, after)).toEqual({
      minutes: 17,
      skip: null,
    });
  });
});

describe("skipUntilText", () => {
  const newYearsEve = new Date("2026-12-31T22:59:00Z");

  it("prints the Vienna day, without the year when it is this one", () => {
    expect(skipUntilText(newYearsEve, "de", NOW)).toBe("31.12.");
    expect(skipUntilText(newYearsEve, "en", NOW)).toBe("31 Dec");
  });

  it("adds the year when it is another", () => {
    const march = new Date("2027-03-01T03:00:00Z");
    expect(skipUntilText(march, "de", NOW)).toBe("01.03.2027");
    expect(skipUntilText(march, "en", NOW)).toBe("1 Mar 2027");
  });

  it("reads the day in Vienna, not in the browser's zone", () => {
    // 23:30 UTC on the 31st is already 1 January in Vienna.
    const late = new Date("2026-12-31T23:30:00Z");
    expect(skipUntilText(late, "de", NOW)).toBe("01.01.2027");
  });
});
