import { describe, expect, it, vi, afterEach } from "vitest";

import {
  computeRaceParams,
  FREEZE_DELAY_AFTER_WINNER_MS,
  RACE_FINISH_X_FALLBACK_CQW,
  type RaceMeasurements,
  type RacerTrack,
} from "./race.js";

// `computeRaceParams` is pure but heavily randomised, so most of these are
// invariants asserted over many rolls rather than fixed expectations. Two
// matter more than the rest:
//
//   - The reconciliation: the announced winner is derived from the paths
//     that will ACTUALLY play, not from the intended winner picked at the
//     top. Those two disagree whenever the duration clamp bites, and a
//     regression there shows up as the victory badge naming the racer the
//     viewer just watched lose.
//   - The smoothness invariants (monotonic, bounded speed change). The
//     previous engine satisfied neither, and the reason it looked green
//     was a fixture starting both racers at 10/12cqw — far left of where
//     any real destination text leaves them. Every geometry case below
//     therefore spans the realistic range, up to the degenerate starts a
//     small card with long destination names actually produces.

const ROLLS = 200;

function measurements(over: Partial<RaceMeasurements> = {}): RaceMeasurements {
  return { a: 10, b: 12, finishCqw: RACE_FINISH_X_FALLBACK_CQW, ...over };
}

// Start positions the card really measures: a row's wheelchair sits after
// its destination text, so a short name leaves it mid-panel and a long one
// (or a `size: small` card, or a narrow dashboard column) pushes it close
// to the finish strip.
const GEOMETRIES: ReadonlyArray<[string, RaceMeasurements]> = [
  ["short destinations", measurements({ a: 35, b: 35, finishCqw: 93.5 })],
  ["mismatched destination lengths", measurements({ a: 28, b: 58, finishCqw: 93.5 })],
  ["long destinations", measurements({ a: 68, b: 76, finishCqw: 93.5 })],
  ["wheelchair almost at the strip", measurements({ a: 88, b: 91, finishCqw: 93.5 })],
  ["start already past the line", measurements({ a: 95, b: 97 })],
];

/** Per-keyframe speed (cqw/s) along a track — this is the motion the
 *  browser actually plays, since the samples are interpolated linearly. */
function stepSpeeds(track: RacerTrack): number[] {
  const speeds: number[] = [];
  for (let i = 1; i < track.samples.length; i += 1) {
    const prev = track.samples[i - 1]!;
    const cur = track.samples[i]!;
    const seconds = ((cur.offset - prev.offset) * track.durationMs) / 1000;
    speeds.push((cur.xCqw - prev.xCqw) / seconds);
  }
  return speeds;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("computeRaceParams", () => {
  it("always names a racer and a finite winning cross time", () => {
    for (const [, m] of GEOMETRIES) {
      for (let i = 0; i < ROLLS; i += 1) {
        const p = computeRaceParams(m);
        expect(["A", "B"]).toContain(p.winner);
        expect(Number.isFinite(p.winnerCrossT)).toBe(true);
        expect(p.winnerCrossT).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("emits a complete, well-formed keyframe list for both racers", () => {
    const p = computeRaceParams(measurements({ a: 35, b: 48, finishCqw: 93.5 }));
    for (const racer of ["A", "B"] as const) {
      const track = p.tracks[racer];
      expect(track.samples.length).toBeGreaterThan(16);
      expect(track.samples[0]!.offset).toBe(0);
      expect(track.samples[track.samples.length - 1]!.offset).toBe(1);
      // The first keyframe must sit exactly on the racer's measured
      // start, or attaching the animation teleports it.
      expect(track.samples[0]!.xCqw).toBeCloseTo(track.startCqw, 10);
      expect(track.durationMs).toBeGreaterThan(0);
      for (const sample of track.samples) {
        expect(Number.isFinite(sample.offset)).toBe(true);
        expect(Number.isFinite(sample.xCqw)).toBe(true);
      }
    }
  });

  // This is the invariant the old engine broke. Asserted across every
  // geometry and on every keyframe step, not just at three checkpoints:
  // with realistic start positions the previous checkpoint gaps could
  // exceed the distance available in a quarter, and the wheelchair rolled
  // backwards in ~45% of races.
  it("never lets a racer stall or roll backwards, at any geometry", () => {
    for (const [label, m] of GEOMETRIES) {
      for (let i = 0; i < ROLLS; i += 1) {
        const p = computeRaceParams(m);
        for (const racer of ["A", "B"] as const) {
          const slowest = Math.min(...stepSpeeds(p.tracks[racer]));
          expect(
            slowest,
            `${label} / racer ${racer} went backwards or stalled`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  // The complaint the rewrite answers: speed used to swing ~29x within a
  // single run, including a full stop at the 25% checkpoint. Cruise is
  // measured past the launch ramp, since accelerating out of the gate is
  // intended motion rather than a lurch.
  it("holds cruise speed inside a narrow band once the racers are away", () => {
    for (const [label, m] of GEOMETRIES) {
      for (let i = 0; i < ROLLS; i += 1) {
        const p = computeRaceParams(m);
        for (const racer of ["A", "B"] as const) {
          const speeds = stepSpeeds(p.tracks[racer]);
          const cruise = speeds.slice(Math.ceil(0.3 * speeds.length));
          const ratio = Math.max(...cruise) / Math.min(...cruise);
          expect(ratio, `${label} / racer ${racer}`).toBeLessThan(2.5);
        }
      }
    }
  });

  it("changes speed gradually from one keyframe to the next", () => {
    for (const [label, m] of GEOMETRIES) {
      for (let i = 0; i < 50; i += 1) {
        const p = computeRaceParams(m);
        for (const racer of ["A", "B"] as const) {
          const speeds = stepSpeeds(p.tracks[racer]);
          const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
          for (let k = 1; k < speeds.length; k += 1) {
            const jump = Math.abs(speeds[k]! - speeds[k - 1]!) / mean;
            expect(jump, `${label} / racer ${racer} at step ${k}`).toBeLessThan(0.25);
          }
        }
      }
    }
  });

  it("keeps the racers close enough to read as one race", () => {
    // Both must reach the strip; the loser trails by a visible but not
    // absurd margin. Guards against a duration clamp quietly turning one
    // racer into a spectator.
    for (let i = 0; i < ROLLS; i += 1) {
      const p = computeRaceParams(measurements({ a: 35, b: 44, finishCqw: 93.5 }));
      const gap = Math.abs(p.tracks.A.crossMs - p.tracks.B.crossMs);
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThan(1500);
    }
  });

  it("leaves the loser short of the line in the photo-finish frame", () => {
    // The card freezes both racers FREEZE_DELAY_AFTER_WINNER_MS after the
    // winner crosses. A loser crossing sooner than that is already over the
    // line in the frame meant to show it a step behind.
    for (const [label, m] of GEOMETRIES) {
      if (m.a >= m.finishCqw || m.b >= m.finishCqw) continue; // no race to freeze
      for (let i = 0; i < ROLLS; i += 1) {
        const p = computeRaceParams(m);
        const gap = Math.abs(p.tracks.A.crossMs - p.tracks.B.crossMs);
        expect(gap, label).toBeGreaterThan(FREEZE_DELAY_AFTER_WINNER_MS);
      }
    }
  });

  it("runs every racer past the finish line", () => {
    for (const [label, m] of GEOMETRIES) {
      for (let i = 0; i < ROLLS; i += 1) {
        const p = computeRaceParams(m);
        for (const racer of ["A", "B"] as const) {
          const track = p.tracks[racer];
          const last = track.samples[track.samples.length - 1]!.xCqw;
          expect(last, `${label} / racer ${racer}`).toBeGreaterThan(m.finishCqw);
        }
      }
    }
  });

  it("survives a finish line at zero without producing NaN", () => {
    const p = computeRaceParams(measurements({ finishCqw: 0 }));
    expect(["A", "B"]).toContain(p.winner);
    expect(Number.isFinite(p.winnerCrossT)).toBe(true);
    for (const racer of ["A", "B"] as const) {
      expect(Number.isFinite(p.tracks[racer].durationMs)).toBe(true);
      expect(Number.isFinite(p.tracks[racer].crossMs)).toBe(true);
      for (const sample of p.tracks[racer].samples) {
        expect(Number.isNaN(sample.xCqw)).toBe(false);
      }
    }
  });

  it("reconciles the winner against the trajectories, not the intent", () => {
    // The announced winner must be whichever racer's path reaches the
    // line first, at every geometry — including the ones where the
    // duration clamp bites and the scripted margin can't be honoured.
    for (const [label, m] of GEOMETRIES) {
      for (let i = 0; i < ROLLS; i += 1) {
        const p = computeRaceParams(m);
        const expected = p.tracks.A.crossMs <= p.tracks.B.crossMs ? "A" : "B";
        expect(p.winner, label).toBe(expected);
        expect(p.winnerCrossT).toBeCloseTo(
          Math.min(p.tracks.A.crossMs, p.tracks.B.crossMs),
          10,
        );
      }
    }
  });

  it("is deterministic once randomness is frozen", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const first = computeRaceParams(measurements());
    const second = computeRaceParams(measurements());
    expect(second.winner).toBe(first.winner);
    expect(second.winnerCrossT).toBeCloseTo(first.winnerCrossT, 10);
    expect(second.tracks.A.samples).toEqual(first.tracks.A.samples);
  });

  it("gives both starting orders a definite result", () => {
    for (const m of [measurements({ a: 5, b: 40 }), measurements({ a: 40, b: 5 })]) {
      for (let i = 0; i < 50; i += 1) {
        expect(["A", "B"]).toContain(computeRaceParams(m).winner);
      }
    }
  });
});
