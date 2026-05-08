// Wheelchair-race physics for the retro card.
//
// Pure helper — no DOM, no Lit. The card measures wheelchair start
// positions + finish-line position from the rendered shadow DOM, hands
// them in here, and gets back: per-racer durations, per-checkpoint
// translates (cqw), exit positions, and the reconciled winner. The
// caller maps those onto CSS custom properties.
//
// Lives outside the card so the rendering class focuses on UI concerns
// instead of carrying ~140 lines of probability + linear-interpolation
// math inline.

export type Racer = "A" | "B";

// Tuning constants — kept module-private. Only `RACE_FINISH_X_FALLBACK_CQW`
// is `export`ed (consumed by the retro card as a fallback when the live
// finish-line measurement isn't available yet); every other tunable is
// referenced solely by `computeRaceParams` in this file. Re-exporting
// them would bloat the bundle's public surface without buying anything.
const RACE_PATTERNS: ReadonlyArray<readonly [Racer, Racer, Racer]> = [
  ["A", "A", "B"], ["B", "B", "A"],   // single late swap
  ["A", "B", "B"], ["B", "A", "A"],   // single mid swap
  ["A", "B", "A"], ["B", "A", "B"],   // double swap (ping-pong)
];

// Cross-time + animation duration spread.
const RACE_CROSS_BASE_MIN_MS = 2400;
const RACE_CROSS_BASE_MAX_MS = 2700;
const RACE_DUR_TAIL_MIN = 1.08;
const RACE_DUR_TAIL_MAX = 1.15;

// Finish-margin distribution (ms between winner / loser crossings).
// Close minimum is set high enough that even a photo finish has a
// visible gap (~6cqw at 580px card width).
const RACE_MARGIN_CLOSE_MS: readonly [number, number] = [100, 250];
const RACE_MARGIN_MEDIUM_MS: readonly [number, number] = [200, 500];
const RACE_MARGIN_DECISIVE_MS: readonly [number, number] = [500, 900];
const RACE_PROB_CLOSE = 0.4;
const RACE_PROB_MEDIUM = 0.35;

// Probability the swap pattern's 75% leader is actually the LOSER —
// drives the "comeback" feel; the rest are led-from-front finishes.
const RACE_PROB_COMEBACK = 0.3;

// Track geometry, in cqw (relative to card width).
const RACE_TRACK_END_CQW = 92;
const RACE_TRACK_MIN_LENGTH_CQW = 20;
const RACE_CHECKPOINT_FRACS = [0.25, 0.5, 0.75] as const;
const RACE_CHECKPOINT_HALF_GAPS_CQW = [3, 2.5, 2.5] as const;
export const RACE_FINISH_X_FALLBACK_CQW = 96;

// Exit-position bounds (cqw). Outside this band the finish-margin math
// is approximate; the announced winner is still reconciled from the
// actual post-clamp trajectories.
const RACE_EXIT_MIN_CQW = 102;
const RACE_EXIT_MAX_CQW = 135;

export interface RaceMeasurements {
  /** Racer A's natural start x (cqw, 0–100). */
  a: number;
  /** Racer B's natural start x (cqw, 0–100). */
  b: number;
  /** Live finish-line x (cqw). Falls back to RACE_FINISH_X_FALLBACK_CQW. */
  finishCqw: number;
}

export interface RaceParams {
  /** Reconciled winner from the actual post-clamp trajectories. */
  winner: Racer;
  /** Earliest cross time across both racers (ms from race start). */
  winnerCrossT: number;
  /** CSS custom properties to apply on the card host. */
  cssVars: Readonly<Record<string, string>>;
}

/** Compute every per-racer parameter for one race, given measured
 *  start positions and finish line. Returns the reconciled winner
 *  AND the CSS variables the card should set on its host element.
 *  Pure: no DOM access, no internal state. The math itself is the
 *  same algorithm as the previous in-card implementation. */
export function computeRaceParams(measurements: RaceMeasurements): RaceParams {
  const rand = (min: number, max: number): number =>
    min + Math.random() * (max - min);
  const jitter = (base: number, amount: number): number =>
    base + (Math.random() * 2 - 1) * amount;

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

  const winnerCrossT = rand(RACE_CROSS_BASE_MIN_MS, RACE_CROSS_BASE_MAX_MS);
  const loserCrossT = winnerCrossT + margin;
  const winnerDur = winnerCrossT * rand(RACE_DUR_TAIL_MIN, RACE_DUR_TAIL_MAX);
  const loserDur = loserCrossT * rand(RACE_DUR_TAIL_MIN, RACE_DUR_TAIL_MAX);
  const durA = intendedWinner === "A" ? winnerDur : loserDur;
  const durB = intendedWinner === "B" ? winnerDur : loserDur;
  const crossTargetA = intendedWinner === "A" ? winnerCrossT : loserCrossT;
  const crossTargetB = intendedWinner === "B" ? winnerCrossT : loserCrossT;

  const startA = measurements.a;
  const startB = measurements.b;
  const finishX = measurements.finishCqw;
  const maxStart = Math.max(startA, startB);
  const trackLength = Math.max(
    RACE_TRACK_MIN_LENGTH_CQW,
    RACE_TRACK_END_CQW - maxStart,
  );

  const targetXAbs = (racer: Racer, idx: 0 | 1 | 2): number => {
    const center = maxStart + RACE_CHECKPOINT_FRACS[idx] * trackLength;
    const isLead = pattern[idx] === racer;
    const halfGap = RACE_CHECKPOINT_HALF_GAPS_CQW[idx];
    return jitter(center + (isLead ? halfGap : -halfGap), 0.6);
  };
  const t25A = targetXAbs("A", 0);
  const t50A = targetXAbs("A", 1);
  const t75A = targetXAbs("A", 2);
  const t25B = targetXAbs("B", 0);
  const t50B = targetXAbs("B", 1);
  const t75B = targetXAbs("B", 2);

  // Solve the linear-interp 75%→100% segment for `exit` so this racer
  // crosses finishX at their target time:
  //   crossT = 0.75*dur + 0.25*dur * (finishX - t75) / (exit - t75)
  //   => exit = t75 + (finishX - t75) * 0.25*dur / (crossT - 0.75*dur)
  const computeExit = (crossT: number, dur: number, t75: number): number => {
    const distance = finishX - t75;
    const segmentTime = crossT - 0.75 * dur;
    if (distance <= 0 || segmentTime <= 1) {
      // Edge case: finish line was already past by the 75% checkpoint.
      // Let the racer exit naturally with a small offset.
      return Math.max(t75 + 5, RACE_EXIT_MIN_CQW);
    }
    const exit = t75 + (distance * 0.25 * dur) / segmentTime;
    return Math.max(RACE_EXIT_MIN_CQW, Math.min(RACE_EXIT_MAX_CQW, exit));
  };
  const exitA = computeExit(crossTargetA, durA, t75A);
  const exitB = computeExit(crossTargetB, durB, t75B);

  // Reconcile the announced winner from actual clamped trajectories so
  // the visible cross order can't disagree with the victory badge. On
  // smaller card variants long destination text can push maxStart high
  // enough that the wheelchair is already past finishX by the 75%
  // checkpoint — a hardcoded 75→100% formula would collapse both
  // racers' cross times to the same value.
  const actualCrossT = (
    startX: number,
    t25: number,
    t50: number,
    t75: number,
    exit: number,
    dur: number,
  ): number => {
    const segments: ReadonlyArray<readonly [number, number, number, number]> = [
      [0, 0.25, startX, t25],
      [0.25, 0.5, t25, t50],
      [0.5, 0.75, t50, t75],
      [0.75, 1.0, t75, exit],
    ];
    for (const [tStart, tEnd, xStart, xEnd] of segments) {
      if (xStart >= finishX) return tStart * dur;
      if (xEnd >= finishX) {
        const frac = (finishX - xStart) / (xEnd - xStart);
        return (tStart + frac * (tEnd - tStart)) * dur;
      }
    }
    return Number.POSITIVE_INFINITY;
  };
  const crossA = actualCrossT(startA, t25A, t50A, t75A, exitA, durA);
  const crossB = actualCrossT(startB, t25B, t50B, t75B, exitB, durB);
  const winner: Racer = crossA <= crossB ? "A" : "B";

  return {
    winner,
    winnerCrossT: Math.min(crossA, crossB),
    cssVars: {
      "--race-a-duration": `${durA}ms`,
      "--race-b-duration": `${durB}ms`,
      "--race-a-end": `${exitA - startA}cqw`,
      "--race-b-end": `${exitB - startB}cqw`,
      "--race-a-x-25": `${t25A - startA}cqw`,
      "--race-a-x-50": `${t50A - startA}cqw`,
      "--race-a-x-75": `${t75A - startA}cqw`,
      "--race-b-x-25": `${t25B - startB}cqw`,
      "--race-b-x-50": `${t50B - startB}cqw`,
      "--race-b-x-75": `${t75B - startB}cqw`,
    },
  };
}
