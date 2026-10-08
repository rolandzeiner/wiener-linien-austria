// Estimated arrival times on the stops-ahead trail.
//
// `/monitor` says when a vehicle leaves this stop and nothing about the stops
// after it. The backend's `wiener_linien_austria/run_times` command answers
// with the timetable's minutes from here to every stop ahead, per line and
// direction; a departure's own time plus those minutes is when it should
// reach each stop. This file is the pure half of that: the answer's shape,
// when a card should ask again, and the sum. The card owns the request.

import type { DepartureAttr } from "../types.js";

/** `"U1|H"` → stop name as the trail prints it → scheduled minutes, which
 *  may carry a decimal. */
export type RunTimesByLine = Record<string, Record<string, number>>;

/** The `wiener_linien_austria/run_times` answer. */
export interface RunTimesAnswer {
  diva: number;
  fetched_at: string | null;
  valid_until: string;
  run_times: RunTimesByLine;
  attribution?: string;
}

/** What a card holds per stop between asks. */
export interface RunTimesState {
  runTimes: RunTimesByLine;
  /** Epoch ms from which the answer is asked for again. */
  validUntil: number;
  /** Lines asked about under this answer, and when. A line the answer lacks
   *  is worth another ask later, when the backend may fetch it, not on every
   *  render. */
  asked: ReadonlyMap<string, number>;
}

/** How long a line the answer lacks waits before it is asked about again.
 *  The backend spends at most one request per line on it, and none within an
 *  hour of the last one for the stop, so sooner could only get the same
 *  answer. */
export const RUN_TIMES_REASK_MS = 60 * 60_000;
/** How long a failed ask, or an answer that is already past its date, holds
 *  before the next one. */
export const RUN_TIMES_RETRY_MS = 5 * 60_000;

export function runTimeKey(line: string, direction: string): string {
  return `${line}|${direction}`;
}

/** Whether the card should ask for a stop's run times now, given the line it
 *  is about to show. The caller keeps two asks for one stop from overlapping. */
export function needsRunTimes(
  state: RunTimesState | undefined,
  key: string,
  nowMs: number,
): boolean {
  if (!state || nowMs >= state.validUntil) return true;
  if (Object.hasOwn(state.runTimes, key)) return false;
  const askedAt = state.asked.get(key);
  return askedAt === undefined || nowMs - askedAt >= RUN_TIMES_REASK_MS;
}

/** The lines asked about so far, with `key` added. Starts over once the
 *  answer they were asked under has run out. */
function askedWith(
  prev: RunTimesState | undefined,
  key: string,
  nowMs: number,
): Map<string, number> {
  const asked = new Map(prev && nowMs < prev.validUntil ? prev.asked : []);
  asked.set(key, nowMs);
  return asked;
}

/** The state after an answer. `valid_until` is the server's; one that is
 *  unreadable or already past (a browser clock running ahead) holds for
 *  `RUN_TIMES_RETRY_MS` instead, so it can't turn into an ask per render. */
export function runTimesAnswered(
  prev: RunTimesState | undefined,
  key: string,
  answer: RunTimesAnswer,
  nowMs: number,
): RunTimesState {
  const until = Date.parse(answer.valid_until);
  const runTimes = answer.run_times;
  return {
    runTimes: runTimes && typeof runTimes === "object" ? runTimes : {},
    validUntil:
      Number.isFinite(until) && until > nowMs ? until : nowMs + RUN_TIMES_RETRY_MS,
    asked: askedWith(prev, key, nowMs),
  };
}

/** The state after a failed ask: whatever was held stays on screen, and the
 *  next ask waits `RUN_TIMES_RETRY_MS`. */
export function runTimesFailed(
  prev: RunTimesState | undefined,
  key: string,
  nowMs: number,
): RunTimesState {
  return {
    runTimes: prev?.runTimes ?? {},
    validUntil: nowMs + RUN_TIMES_RETRY_MS,
    asked: askedWith(prev, key, nowMs),
  };
}

// One formatter for every stop of every trail: constructing an
// Intl.DateTimeFormat costs far more than formatting with it. Vienna time
// whatever zone the dashboard's browser sits in, like the station signs.
const VIENNA_CLOCK = new Intl.DateTimeFormat("de-AT", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Vienna",
});

export interface StopEta {
  /** For `<time datetime>`. */
  iso: string;
  /** "07:42", Vienna time. */
  clock: string;
  /** Only when the departure runs late: the arrival the timetable had, which
   *  `clock` replaces, and how many minutes lie between the two as printed. */
  planned?: { clock: string; late: number };
}

/** From this much behind its planned departure a vehicle's arrivals count as
 *  late. A full minute, not the 30 s that rounds to "1 min late" on the row:
 *  with less, the planned and the expected arrival print as the same minute
 *  at some stops of a trail and a minute apart at others, and a trail struck
 *  through here and there says less than one left alone. From a minute on
 *  every stop's two times differ. */
const LATE_FROM_MS = 60_000;

function minuteOf(ms: number): Date {
  return new Date(Math.floor(ms / 60_000) * 60_000);
}

/** When a departure should reach a stop `minutes` down the line: its live
 *  departure, or the planned one, plus the scheduled run. Printed as the
 *  minute the arrival falls in, seconds cut off, which is how a timetable and
 *  the board at that stop print the same moment: 16:58:10 is 16:58 there, so
 *  rounding it up here would put the two a minute apart. A row without
 *  either time counts from its countdown. Null when there is nothing to
 *  count from.
 *
 *  A departure running a minute or more late also gets `planned`, the
 *  arrival it would have made on time, for the card to strike through. An
 *  early one doesn't: vehicles wait out an early run at the next stops, so
 *  the timetable's arrival is no more wrong than the estimate. */
export function stopEta(
  dep: Pick<DepartureAttr, "time_real" | "time_planned" | "countdown">,
  minutes: number | undefined,
  nowMs: number,
): StopEta | null {
  if (minutes === undefined || !Number.isFinite(minutes)) return null;
  const departs = departureMs(dep, nowMs);
  if (departs === null) return null;
  const run = minutes * 60_000;
  const at = minuteOf(departs + run);
  const eta: StopEta = { iso: at.toISOString(), clock: VIENNA_CLOCK.format(at) };
  const planned = dep.time_planned ? Date.parse(dep.time_planned) : Number.NaN;
  const real = dep.time_real ? Date.parse(dep.time_real) : Number.NaN;
  if (real - planned >= LATE_FROM_MS) {
    const was = minuteOf(planned + run);
    eta.planned = {
      clock: VIENNA_CLOCK.format(was),
      late: (at.getTime() - was.getTime()) / 60_000,
    };
  }
  return eta;
}

function departureMs(
  dep: Pick<DepartureAttr, "time_real" | "time_planned" | "countdown">,
  nowMs: number,
): number | null {
  for (const iso of [dep.time_real, dep.time_planned]) {
    const ts = iso ? Date.parse(iso) : Number.NaN;
    if (Number.isFinite(ts)) return ts;
  }
  return Number.isFinite(dep.countdown) ? nowMs + dep.countdown * 60_000 : null;
}
