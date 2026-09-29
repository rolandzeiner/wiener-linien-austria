// Wheelchair-race choreography for the retro card.
//
// Pure helper — no DOM, no Lit. The card measures both wheelchairs'
// natural start x and the finish-line x from the rendered shadow DOM,
// hands them in here, and gets back one densely sampled trajectory per
// racer (offset + absolute x, in cqw), a per-racer duration, and the
// reconciled winner. The caller turns the samples into px offsets from
// each racer's start and plays them with `Element.animate()`.
//
// Why sampled keyframes instead of the five CSS keyframes at 0 / 25 /
// 50 / 75 / 100 % this used to emit: fixed time fractions force very
// different distances into equal slices of the run, so a racer's mean
// speed jumped by up to 15x between segments, the last quarter was
// systematically ~1.9x the rest, and the per-keyframe easing that was
// meant to smooth the junctions instead decelerated to a standstill at
// the 25 % checkpoint. On cards where long destination text pushes the
// start x past ~70cqw, the fixed checkpoint gaps also exceeded the
// available quarter and the wheelchair rolled *backwards*.
//
// The path here is built from a velocity profile rather than from
// positions, so smooth motion is the construction and the geometry
// falls out of it:
//
//   x_r(u) = start_r + span_r * s(u) + sign_r * amplitude * duel(u)
//
//   s(u)    shared progress curve — a launch ramp into a flat cruise,
//           integrated, so acceleration itself is continuous.
//   duel(u) the lead / trail choreography, a smooth ±1 signal built
//           from the swap pattern.
//   span_r  each racer's own runway, from where its row's destination
//           text leaves it to just off the panel. A racer starting
//           closer to the line simply travels slower; no racer ever
//           has to sprint to join a shared track.
//
// `amplitude` is solved up to a tuned ceiling (DUEL_MAX_CQW): the largest
// duel whose contribution to every keyframe step stays within
// DUEL_SPEED_BUDGET of the shorter-runway racer's base step for that same
// step (see duelAmplitude). With the budget below 1 the duel can never
// cancel the base motion, so every trajectory is strictly monotonic by
// construction — no clamp, no special case.

export type Racer = "A" | "B";

// Which racer gets the lead bias around each of the three checkpoints.
// Every pattern swaps at least once, but the bias is only ±DUEL_MAX_CQW
// around each racer's own track, so many races show no overtake on
// screen: about half in simulation, and every one when both racers start
// close to the strip.
const RACE_PATTERNS: ReadonlyArray<readonly [Racer, Racer, Racer]> = [
  ["A", "A", "B"], ["B", "B", "A"],   // single late swap
  ["A", "B", "B"], ["B", "A", "A"],   // single mid swap
  ["A", "B", "A"], ["B", "A", "B"],   // double swap (ping-pong)
];

// When the winner reaches the line, in ms from the gate opening.
const RACE_CROSS_BASE_MIN_MS = 2400;
const RACE_CROSS_BASE_MAX_MS = 2700;

// How long the card holds both racers still after the winner crosses:
// the photo-finish frame, winner at the strip and loser caught a step
// behind, before the trophy badge appears. A small cushion, so the freeze
// lands after the winner has visibly crossed rather than exactly on it.
export const FREEZE_DELAY_AFTER_WINNER_MS = 150;

// Finish-margin distribution (ms between winner / loser crossings).
// The closest finish stays above FREEZE_DELAY_AFTER_WINNER_MS, so the
// photo-finish frame never catches the loser already over the line.
const RACE_MARGIN_CLOSE_MS: readonly [number, number] = [200, 250];
const RACE_MARGIN_MEDIUM_MS: readonly [number, number] = [200, 500];
const RACE_MARGIN_DECISIVE_MS: readonly [number, number] = [500, 900];
const RACE_PROB_CLOSE = 0.4;
const RACE_PROB_MEDIUM = 0.35;

// Probability the swap pattern's 75% leader is actually the LOSER —
// drives the "comeback" feel; the rest are led-from-front finishes.
const RACE_PROB_COMEBACK = 0.3;

// Track geometry, in cqw (relative to card width).
export const RACE_FINISH_X_FALLBACK_CQW = 96;
// Where a racer leaves the panel. Jittered per racer so the two don't
// stack on the exact same pixel as they run off the right edge.
const RACE_EXIT_X_CQW = 112;
const RACE_EXIT_JITTER_CQW = 5;
// Shortest runway we accept. Guards the degenerate case where the row's
// destination text leaves the wheelchair already at (or past) the line.
const RACE_MIN_SPAN_CQW = 16;

// Launch profile. Velocity ramps from LAUNCH_FLOOR x cruise up to
// cruise over the first LAUNCH_SPAN of the run. Smoothstepped, so the
// ramp has no kink at either end — a racer accelerates out of the gate
// and then holds its pace.
const LAUNCH_FLOOR = 0.25;
const LAUNCH_SPAN = 0.22;

// Duel choreography. DUEL_SPEED_BUDGET caps how far the lead / trail
// swings may bend a racer's own speed; it MUST stay below 1 —
// duelAmplitude compares it per step against the base step, which is what
// keeps every trajectory strictly monotonic (see header).
const DUEL_MAX_CQW = 3;
const DUEL_SPEED_BUDGET = 0.35;
// Each lead change is spread over this much of the run rather than
// being crammed into the quarter between two checkpoints — that width
// is what keeps the overtakes readable without a lurch.
const DUEL_TRANSITION_WIDTH = 0.45;
// The duel fades in once the racers are moving and out again before the
// exit, so the gate and the run-off stay clean.
const DUEL_FADE_IN: readonly [number, number] = [0.1, 0.42];
const DUEL_FADE_OUT: readonly [number, number] = [0.86, 1];
const RACE_CHECKPOINTS = [0.25, 0.5, 0.75] as const;

// Keyframe count. The path is smooth, so linear interpolation between
// 48 samples keeps the speed change between consecutive keyframe
// segments within 25% of the mean speed (race.test.ts pins it; ~17%
// measured).
const SAMPLE_COUNT = 48;

// Duration is solved from each racer's geometry, so it needs bounds for
// the degenerate starts. A clamp here means the racer misses its
// scripted cross time, which is exactly what the winner reconciliation
// at the end exists to absorb.
const DURATION_MIN_MS = 1800;
const DURATION_MAX_MS = 6500;
const CROSS_PROGRESS_FLOOR = 0.05;

export interface RaceMeasurements {
  /** Racer A's natural start x (cqw, 0–100). */
  a: number;
  /** Racer B's natural start x (cqw, 0–100). */
  b: number;
  /** Live finish-line x (cqw). Falls back to RACE_FINISH_X_FALLBACK_CQW. */
  finishCqw: number;
}

export interface RaceSample {
  /** Keyframe offset, 0–1. */
  offset: number;
  /** Absolute x (cqw) at that offset. */
  xCqw: number;
}

export interface RacerTrack {
  /** Where this racer's row leaves it standing (cqw). */
  startCqw: number;
  /** Animation duration (ms) that lands the crossing on its target. */
  durationMs: number;
  /** When this racer reaches the finish line (ms from the gate). */
  crossMs: number;
  /** The path in cqw; the card converts it to px offsets for
   *  `Element.animate()`. */
  samples: readonly RaceSample[];
}

export interface RaceParams {
  /** Reconciled winner from the actual sampled trajectories. */
  winner: Racer;
  /** Earliest cross time across both racers (ms from race start). */
  winnerCrossT: number;
  /** Per-racer trajectory. */
  tracks: Readonly<Record<Racer, RacerTrack>>;
}

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
const smoothstep = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const ramp = (u: number, from: number, to: number): number =>
  smoothstep((u - from) / (to - from));

/** Shared normalised progress s(u), sampled on the keyframe grid.
 *  Trapezoidal integral of the launch-into-cruise velocity profile,
 *  scaled so s(0) = 0 and s(1) = 1. */
function buildProgress(): number[] {
  const velocity = (u: number): number =>
    u >= LAUNCH_SPAN
      ? 1
      : LAUNCH_FLOOR + (1 - LAUNCH_FLOOR) * smoothstep(u / LAUNCH_SPAN);
  const s: number[] = [0];
  for (let i = 1; i <= SAMPLE_COUNT; i += 1) {
    const u0 = (i - 1) / SAMPLE_COUNT;
    const u1 = i / SAMPLE_COUNT;
    s.push(s[i - 1]! + (velocity(u0) + velocity(u1)) / 2 / SAMPLE_COUNT);
  }
  const total = s[SAMPLE_COUNT]!;
  return s.map((x) => x / total);
}

/** The lead signal for racer A, sampled on the keyframe grid: +1 where
 *  A is meant to be ahead, -1 where B is, with each change of lead
 *  spread over DUEL_TRANSITION_WIDTH and the whole thing enveloped so
 *  it starts and ends at zero. Racer B gets the same curve negated, so
 *  the pair stays centred on the shared progress. */
function buildDuel(pattern: readonly [Racer, Racer, Racer]): number[] {
  const lead = pattern.map((p) => (p === "A" ? 1 : -1));
  const transitions: Array<{ centre: number; delta: number }> = [];
  for (let k = 0; k + 1 < lead.length; k += 1) {
    if (lead[k + 1] !== lead[k]) {
      transitions.push({
        centre: (RACE_CHECKPOINTS[k]! + RACE_CHECKPOINTS[k + 1]!) / 2,
        delta: lead[k + 1]! - lead[k]!,
      });
    }
  }
  const half = DUEL_TRANSITION_WIDTH / 2;
  const out: number[] = [];
  for (let i = 0; i <= SAMPLE_COUNT; i += 1) {
    const u = i / SAMPLE_COUNT;
    let sigma = lead[0]!;
    for (const t of transitions) {
      sigma += t.delta * smoothstep((u - t.centre + half) / DUEL_TRANSITION_WIDTH);
    }
    const envelope =
      ramp(u, DUEL_FADE_IN[0], DUEL_FADE_IN[1]) *
      (1 - ramp(u, DUEL_FADE_OUT[0], DUEL_FADE_OUT[1]));
    out.push(sigma * envelope);
  }
  return out;
}

/** Largest duel amplitude (cqw) that keeps the choreography's
 *  contribution to any single keyframe step within DUEL_SPEED_BUDGET of
 *  the smaller racer's base step for that same step. Compared per step,
 *  not globally: the duel is enveloped to zero exactly where the base
 *  motion is slowest (the gate), so a global comparison would shrink
 *  the overtakes to nothing for no gain. */
function duelAmplitude(
  duel: readonly number[],
  progress: readonly number[],
  spans: readonly number[],
): number {
  const minSpan = Math.min(...spans);
  let limit = DUEL_MAX_CQW;
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const duelStep = Math.abs(duel[i + 1]! - duel[i]!);
    if (duelStep <= 0) continue;
    const baseStep = minSpan * (progress[i + 1]! - progress[i]!);
    limit = Math.min(limit, (DUEL_SPEED_BUDGET * baseStep) / duelStep);
  }
  return Math.max(0, limit);
}

/** Progress (0–1) at which this trajectory reaches the finish line,
 *  interpolated inside the sample it happens in. 0 when the racer is
 *  already at or past the line at the gate. */
function crossingProgress(
  samples: readonly RaceSample[],
  finishX: number,
): number {
  if (samples[0]!.xCqw >= finishX) return 0;
  for (let i = 1; i < samples.length; i += 1) {
    const prev = samples[i - 1]!;
    const cur = samples[i]!;
    if (cur.xCqw >= finishX) {
      const frac = (finishX - prev.xCqw) / (cur.xCqw - prev.xCqw);
      return prev.offset + frac * (cur.offset - prev.offset);
    }
  }
  return 1;
}

/** Compute both racers' trajectories for one race, given measured start
 *  positions and finish line. Returns the reconciled winner AND the
 *  sampled paths the card hands to `Element.animate()`. Pure: no DOM
 *  access, no internal state. */
export function computeRaceParams(measurements: RaceMeasurements): RaceParams {
  const rand = (min: number, max: number): number =>
    min + Math.random() * (max - min);

  const intendedWinner: Racer = Math.random() < 0.5 ? "A" : "B";
  const isComeback = Math.random() < RACE_PROB_COMEBACK;
  const patternLeader: Racer = isComeback
    ? intendedWinner === "A" ? "B" : "A"
    : intendedWinner;
  const patternPool = RACE_PATTERNS.filter((p) => p[2] === patternLeader);
  const pattern = patternPool[Math.floor(Math.random() * patternPool.length)]!;

  const marginRoll = Math.random();
  const margin =
    marginRoll < RACE_PROB_CLOSE
      ? rand(RACE_MARGIN_CLOSE_MS[0], RACE_MARGIN_CLOSE_MS[1])
      : marginRoll < RACE_PROB_CLOSE + RACE_PROB_MEDIUM
        ? rand(RACE_MARGIN_MEDIUM_MS[0], RACE_MARGIN_MEDIUM_MS[1])
        : rand(RACE_MARGIN_DECISIVE_MS[0], RACE_MARGIN_DECISIVE_MS[1]);

  const winnerCross = rand(RACE_CROSS_BASE_MIN_MS, RACE_CROSS_BASE_MAX_MS);
  const loserCross = winnerCross + margin;
  const crossTarget: Record<Racer, number> = {
    A: intendedWinner === "A" ? winnerCross : loserCross,
    B: intendedWinner === "B" ? winnerCross : loserCross,
  };

  const finishX = measurements.finishCqw;
  const starts: Record<Racer, number> = {
    A: measurements.a,
    B: measurements.b,
  };
  // Each racer runs its own track, from wherever its row's destination
  // text leaves it to just off the panel. Nobody is snapped onto a
  // shared start, which is what used to make the racer with the shorter
  // destination sprint the opening quarter.
  const spanFor = (start: number): number =>
    Math.max(
      RACE_EXIT_X_CQW + rand(-RACE_EXIT_JITTER_CQW, RACE_EXIT_JITTER_CQW) - start,
      RACE_MIN_SPAN_CQW,
      finishX + RACE_MIN_SPAN_CQW - start,
    );
  const spans: Record<Racer, number> = {
    A: spanFor(starts.A),
    B: spanFor(starts.B),
  };

  const progress = buildProgress();
  const duel = buildDuel(pattern);
  const amplitude = duelAmplitude(duel, progress, [spans.A, spans.B]);

  const trackFor = (racer: Racer): RacerTrack => {
    const start = starts[racer];
    const span = spans[racer];
    const sign = racer === "A" ? 1 : -1;
    const samples: RaceSample[] = [];
    for (let i = 0; i <= SAMPLE_COUNT; i += 1) {
      samples.push({
        offset: i / SAMPLE_COUNT,
        xCqw: start + span * progress[i]! + sign * amplitude * duel[i]!,
      });
    }
    const crossU = crossingProgress(samples, finishX);
    const durationMs = Math.min(
      DURATION_MAX_MS,
      Math.max(
        DURATION_MIN_MS,
        crossTarget[racer] / Math.max(crossU, CROSS_PROGRESS_FLOOR),
      ),
    );
    return { startCqw: start, durationMs, crossMs: durationMs * crossU, samples };
  };

  const a = trackFor("A");
  const b = trackFor("B");
  // Reconcile the announced winner from the trajectories that will
  // actually play, so the badge can never name the racer the viewer
  // just watched lose. The two disagree whenever the duration clamp
  // bites on a degenerate start.
  const winner: Racer = a.crossMs <= b.crossMs ? "A" : "B";

  return {
    winner,
    winnerCrossT: Math.min(a.crossMs, b.crossMs),
    tracks: { A: a, B: b },
  };
}
