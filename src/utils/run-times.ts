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

/** `"U6|H"` → stop name as the trail prints it → when its stop is back (ISO),
 *  or null where no notice says so clearly. The stations the timetable has
 *  the line going through without a call, at least at some hours, or a
 *  notice says are shut for it. */
export type NoStopByLine = Record<string, Record<string, string | null>>;

/** Which runs of a line call at a station in `no_stop` after all: the
 *  station's own departures, from the same timetable. */
export interface StationCalls {
  /** Minutes from here to the calls either side of the station on the
   *  route: a run calling there does so in between. */
  between: [number, number];
  /** When the line leaves the station in this direction, planned, ISO. */
  calls: string[];
  /** The stretch of time the calls cover, ISO. Outside it they say
   *  nothing. */
  from: string;
  until: string;
}

/** `"U6|H"` → stop name as the trail prints it → its calls. */
export type CallingByLine = Record<string, Record<string, StationCalls>>;

/** The `wiener_linien_austria/run_times` answer. */
export interface RunTimesAnswer {
  diva: number;
  fetched_at: string | null;
  valid_until: string;
  run_times: RunTimesByLine;
  /** Absent from a backend older than the feature. */
  no_stop?: NoStopByLine;
  /** Absent from a backend older than the feature, and for a station whose
   *  departures couldn't be fetched. */
  calling?: CallingByLine;
  attribution?: string;
}

/** What a card holds per stop between asks. */
export interface RunTimesState {
  runTimes: RunTimesByLine;
  noStop: NoStopByLine;
  calling: CallingByLine;
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
  const noStop = answer.no_stop;
  const calling = answer.calling;
  return {
    runTimes: runTimes && typeof runTimes === "object" ? runTimes : {},
    noStop: noStop && typeof noStop === "object" ? noStop : {},
    calling: calling && typeof calling === "object" ? calling : {},
    validUntil: Number.isFinite(until) && until > nowMs ? until : nowMs + RUN_TIMES_RETRY_MS,
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
    noStop: prev?.noStop ?? {},
    calling: prev?.calling ?? {},
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

/** A station the trail passes without the train calling there. */
export interface StopSkip {
  /** When the stop is back, where a notice says so clearly. */
  until: Date | null;
  /** When the next run of the line does call there, planned, where the
   *  station's own departures show one. */
  next?: Date;
}

/** The answer's entry for a stop as a skip, or null when it isn't one.
 *
 *  An entry whose date has passed is no skip any more: the run times that
 *  showed the gap can be days older than the stop's reopening, and an empty
 *  time then claims less than "no stop" would. */
export function stopSkip(entry: string | null | undefined, nowMs: number): StopSkip | null {
  if (entry === undefined) return null;
  if (entry === null) return { until: null };
  const until = Date.parse(entry);
  if (!Number.isFinite(until)) return { until: null };
  return until > nowMs ? { until: new Date(until) } : null;
}

/** What a trail shows at one station for one departure: a time, from
 *  `minutes`, or "no stop". */
export interface StopVerdict {
  minutes?: number | undefined;
  skip: StopSkip | null;
}

/** How far outside the calls either side a run's call at the station may
 *  print. Early: the timetable cuts the seconds off it. Late: the run times
 *  are one sample, and a tram or bus runs to another timetable at other
 *  hours, about a minute off by the middle of its line. A neighbouring
 *  run's call lies a headway away, further than that. */
const CALL_LEEWAY_MS = 60_000;

/** "22:02", Vienna time, like the times on the trail. */
export function viennaClockAt(at: Date): string {
  return VIENNA_CLOCK.format(at);
}

/** Whether a departure calls at a station of its trail.
 *
 *  `minutes` is the run-time sample's for the station, `entry` its
 *  `no_stop` entry, `calls` its `calling` one. A station not in `no_stop`
 *  shows its time. One in it is decided by the station's own departures
 *  where they cover this run: a run of the line leaving there between the
 *  calls either side means a stop, none means "no stop". Where they can't
 *  tell (not fetched, the run outside the stretch they cover, no planned
 *  time), the sample decides, as it always did: a time if it has one.
 *
 *  A "no stop" names the next run of the line that does call there, where
 *  the departures show one ("until 22:02"). The notice's date stays off
 *  wherever some runs call there: "until 31.12." would read as no train
 *  stopping before then. */
export function stopVerdict(
  dep: Pick<DepartureAttr, "time_planned">,
  minutes: number | undefined,
  entry: string | null | undefined,
  calls: StationCalls | undefined,
  nowMs: number,
): StopVerdict {
  const skip = stopSkip(entry, nowMs);
  if (!skip) return { minutes, skip: null };
  const call = callingRun(dep, calls);
  if (call === undefined) {
    return minutes === undefined ? { skip } : { minutes, skip: null };
  }
  if ("minutes" in call) return { minutes: minutes ?? call.minutes, skip: null };
  if (call.next) return { skip: { until: null, next: call.next } };
  return { skip: calls?.calls.length ? { until: null } : skip };
}

/** For a run that calls at the station, the minutes from here; for one
 *  that goes through, the next call there after it, if any; undefined when
 *  the calls can't tell. */
function callingRun(
  dep: Pick<DepartureAttr, "time_planned">,
  calls: StationCalls | undefined,
): { minutes: number } | { next: Date | null } | undefined {
  if (!calls || !Array.isArray(calls.between) || !Array.isArray(calls.calls)) {
    return undefined;
  }
  const planned = dep.time_planned ? Date.parse(dep.time_planned) : Number.NaN;
  const [before, after] = calls.between;
  const from = Date.parse(calls.from);
  const until = Date.parse(calls.until);
  if (![planned, before, after, from, until].every(Number.isFinite)) return undefined;
  const earliest = planned + before * 60_000 - CALL_LEEWAY_MS;
  const latest = planned + after * 60_000 + CALL_LEEWAY_MS;
  if (earliest < from || latest > until) return undefined;
  let next: number | null = null;
  for (const iso of calls.calls) {
    const at = Date.parse(iso);
    if (at >= earliest && at <= latest) return { minutes: (at - planned) / 60_000 };
    if (at > latest && (next === null || at < next)) next = at;
  }
  return { next: next === null ? null : new Date(next) };
}

const VIENNA_YEAR = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  timeZone: "Europe/Vienna",
});

/** "31.12." / "31 Dec" in Vienna time, with the year when it isn't this one. */
export function skipUntilText(until: Date, lang: string, nowMs: number): string {
  const sameYear = VIENNA_YEAR.format(until) === VIENNA_YEAR.format(nowMs);
  const en = lang === "en";
  return new Intl.DateTimeFormat(en ? "en-GB" : "de-AT", {
    day: en ? "numeric" : "2-digit",
    month: en ? "short" : "2-digit",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "Europe/Vienna",
  }).format(until);
}
