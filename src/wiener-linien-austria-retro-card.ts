import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { keyed } from "lit/directives/keyed.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { LINE_TYPE_METRO, RETRO_CARD_VERSION } from "./const.js";
import { translate } from "./localize/localize.js";
import type { DepartureAttr, WienerLinienAttrs, WienerLinienRetroCardConfig } from "./types.js";
import { normaliseRetroConfig, type NormalisedRetroConfig } from "./utils/config.js";
import { filterDepartures } from "./utils/departures.js";
import { findWienerLinienEntities } from "./utils/entities.js";

import "./retro-editor.js";

console.info(
  `%c WIENER-LINIEN-AUSTRIA-RETRO-CARD %c ${RETRO_CARD_VERSION} `,
  "color: #FFC700; background: #000; font-weight: 700;",
  "color: #000; background: #FFC700; font-weight: 700;",
);

type RaceState = "idle" | "countdown" | "racing" | "freeze" | "victory";
const VICTORY_DURATION_MS = 4000;
// Hold both wheelchair animations paused for this long after the winner
// crosses the finish line. Gives the viewer a still frame of the photo
// finish — winner at the strip, loser caught a step behind — before
// the trophy badge appears. Delay accounts for the ~30ms drift between
// the linear cross-time math and the actual cubic-bezier eased motion
// so the freeze still lands AFTER the wheelchair has visibly crossed.
const FREEZE_DELAY_AFTER_WINNER_MS = 150;
const FREEZE_DURATION_MS = 1500;
const NEXT_RACE_MIN_MS = 60_000;
const NEXT_RACE_MAX_MS = 180_000;
// 90s game-show pre-race countdown: "3", "2", "1" — each digit held for
// COUNTDOWN_DIGIT_MS, total = COUNTDOWN_TOTAL_MS. Punching the digits in
// before the racers leave the gate gives the race a bigger sense of
// "starting" than just appearing mid-screen.
const COUNTDOWN_DIGIT_MS = 800;
const COUNTDOWN_TOTAL_MS = COUNTDOWN_DIGIT_MS * 3;
// Nailbiter racing — each race picks a lead-change pattern (who's ahead
// at 25%, 50%, 75%) so there's at least one overtake per race. Winner of
// the last checkpoint gets the shorter duration.
type Racer = "A" | "B";
const RACE_PATTERNS: ReadonlyArray<readonly [Racer, Racer, Racer]> = [
  ["A", "A", "B"], ["B", "B", "A"],   // single late swap
  ["A", "B", "B"], ["B", "A", "A"],   // single mid swap
  ["A", "B", "A"], ["B", "A", "B"],   // double swap (ping-pong)
];
// Wheelchair race — the WINNER is whoever crosses the finish line
// (RACE_FINISH_X_CQW) first, computed from each racer's trajectory
// post-clamp. The swap-pattern only choreographs mid-race overtakes
// for visual fun; it doesn't decide the outcome anymore. See
// _randomizeRaceParams() for the full algorithm.
//
// When the winner crosses the finish line (ms from race start). The
// winner duration runs slightly longer so the wheelchair smoothly
// exits past the right edge after the cross.
const RACE_CROSS_BASE_MIN_MS = 2400;
const RACE_CROSS_BASE_MAX_MS = 2700;
// Animation duration / cross time — the after-finish-line tail.
const RACE_DUR_TAIL_MIN = 1.08;
const RACE_DUR_TAIL_MAX = 1.15;
// Finish-margin distribution (ms between winner's and loser's crossing
// of the finish line). Mix of close (photo finish), medium and decisive
// finishes so consecutive races feel different. Close minimum is set
// high enough that even the photo finish has a clear visual gap (~6cqw
// at 580px card width) — sub-100ms gaps were too tight to call by eye.
const RACE_MARGIN_CLOSE_MS: readonly [number, number] = [100, 250];
const RACE_MARGIN_MEDIUM_MS: readonly [number, number] = [200, 500];
const RACE_MARGIN_DECISIVE_MS: readonly [number, number] = [500, 900];
const RACE_PROB_CLOSE = 0.4;
const RACE_PROB_MEDIUM = 0.35;
// (rest = decisive)
// Probability the swap pattern's 75% leader is actually the LOSER —
// i.e. the winner pulls ahead in the home stretch. Drives the
// "comeback" feel; the rest are led-from-front finishes.
const RACE_PROB_COMEBACK = 0.3;
// Race "track" geometry, in cqw (relative to card width). Each
// wheelchair starts at its natural position after its destination text
// (preserving the gag that the wheelchair sits *on* the departure),
// and we back out per-racer translate values from absolute checkpoint
// targets. Targets are anchored to whichever racer starts furthest
// right (`maxStart`) so both racers always move forward.
const RACE_TRACK_END_CQW = 92;
const RACE_TRACK_MIN_LENGTH_CQW = 20;
const RACE_CHECKPOINT_FRACS = [0.25, 0.5, 0.75] as const;
const RACE_CHECKPOINT_HALF_GAPS_CQW = [3, 2.5, 2.5] as const;
// Fallback finish-line x (cqw) if the live strip position can't be
// measured. The real value is the .retro-finish-line's left edge,
// computed per race from card width — keeps the math glued to the
// thing the user actually watches.
const RACE_FINISH_X_FALLBACK_CQW = 96;
// Absolute exit position bounds (cqw). Outside this band the
// finish-margin math is approximate; the announced winner is still
// reconciled from the actual post-clamp trajectories.
const RACE_EXIT_MIN_CQW = 102;
const RACE_EXIT_MAX_CQW = 135;

// Wrap API-sourced German strings so assistive tech pronounces them correctly
// under non-German HA locales. ASCII fallbacks stay unwrapped.
function deText(raw: string | undefined | null, fallback?: string): TemplateResult | string {
  if (raw) return html`<span lang="de">${raw}</span>`;
  return fallback ?? "";
}

(window as unknown as { customCards?: unknown[] }).customCards =
  (window as unknown as { customCards?: unknown[] }).customCards ?? [];
(window as unknown as { customCards: Array<Record<string, unknown>> }).customCards.push({
  type: "wiener-linien-austria-retro-card",
  name: "Wiener Linien Austria — Retro",
  description: "LED-Anzeige im Stil der Wiener-Linien-Stationen",
  preview: true,
});

@customElement("wiener-linien-austria-retro-card")
export class WienerLinienAustriaRetroCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRetroConfig;
  @state() private _versionMismatch: string | null = null;
  @state() private _raceState: RaceState = "idle";
  // Currently displayed countdown digit (3, 2, or 1) — null when not in
  // the countdown phase. Reactive so the digit overlay re-renders.
  @state() private _countdownDigit: 1 | 2 | 3 | null = null;
  // Winner of the most recently completed race ("A" = top row, "B" =
  // bottom row). Drives the circular winner badge on the victory
  // overlay. null while idle or during the first race ever.
  @state() private _raceWinner: Racer | null = null;

  private _versionCheckDone = false;
  private _raceTimers: Array<ReturnType<typeof setTimeout>> = [];
  // Wall-clock target times so state transitions survive the disconnect/
  // reconnect cycles HA triggers during dashboard rebuilds.
  private _countdownStartAt: number | null = null;
  private _raceEndAt: number | null = null;
  private _freezeEndAt: number | null = null;
  private _victoryEndAt: number | null = null;

  public setConfig(config: WienerLinienRetroCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("wiener-linien-austria-retro-card: config must be an object");
    }
    // Validate the *shape*, not just the type. Without an entity the
    // retro display has nothing to render; surface that as a Lovelace
    // error card instead of a silently-empty LED panel. Allow an empty
    // string (the picker's stub state) so the editor still loads.
    if (
      config.entity !== undefined &&
      typeof config.entity !== "string"
    ) {
      throw new Error(
        "wiener-linien-austria-retro-card: 'entity' must be a string",
      );
    }
    this._config = normaliseRetroConfig(config);
  }

  public getCardSize(): number {
    return 2;
  }

  public getGridOptions(): {
    columns: number | "full";
    rows: number | "auto";
    min_columns: number;
    min_rows: number;
  } {
    // 12 = full width by default. The LED board is wide-format and
    // looks cramped at half-width; users can shrink it manually if they
    // want it narrower.
    return {
      columns: 12,
      rows: "auto",
      min_columns: 4,
      min_rows: 2,
    };
  }

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement("wiener-linien-austria-retro-card-editor");
  }

  // getStubConfig must NOT include `type:` — HA prepends it. Returning
  // Record<string, unknown> sidesteps the WienerLinienRetroCardConfig
  // contract which marks `type` as required.
  public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
    const entities = findWienerLinienEntities(hass);
    const first = entities[0] || "";
    // Default direction: prefer whichever side has departures right now so
    // the Lovelace preview renders with data instead of an empty LED board.
    let direction: "H" | "R" = "H";
    const deps = hass?.states?.[first]?.attributes?.departures as
      | DepartureAttr[]
      | undefined;
    if (Array.isArray(deps)) {
      const hasH = deps.some((d) => d.direction === "H");
      const hasR = deps.some((d) => d.direction === "R");
      if (!hasH && hasR) direction = "R";
    }
    return {
      entity: first,
      direction,
      size: "small",
    };
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (!this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
    // HA rebuilds the dashboard on load — the card gets detached and
    // re-attached mid-race. Re-arm transitions against wall-clock time.
    if (this._raceState !== "idle") {
      this._armStateTransitions();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearRaceTimers();
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (
      changed.has("_config") ||
      changed.has("_versionMismatch") ||
      changed.has("_raceState") ||
      changed.has("_countdownDigit") ||
      changed.has("_raceWinner")
    ) {
      return true;
    }
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eid = this._resolveEntity();
    if (!eid) return false;
    return prev.states[eid] !== this.hass.states[eid];
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has("_config")) return;
    const prev = changed.get("_config") as NormalisedRetroConfig | undefined;
    const wasOn = prev?.wheelchair_race === true;
    const isOn = this._config?.wheelchair_race === true;
    if (isOn && !wasOn) {
      // Fire immediately whenever the toggle flips to on — covers both
      // editor-preview remounts (prev undefined) and a same-instance
      // toggle. Subsequent races fall back to the "sometimes" interval.
      this._clearRaceTimers();
      this._startRace();
    } else if (!isOn && wasOn) {
      this._clearRaceTimers();
      this._raceState = "idle";
      this._countdownStartAt = null;
      this._countdownDigit = null;
      this._raceEndAt = null;
      this._freezeEndAt = null;
      this._victoryEndAt = null;
      this._raceWinner = null;
    }
  }

  private _lang(): string {
    return this.hass?.language?.startsWith("de") ? "de" : "en";
  }

  private _t(key: string, replacements?: Record<string, string | number>): string {
    return translate(`retro.${key}`, { hassLanguage: this.hass?.language }, replacements);
  }

  private async _checkCardVersion(): Promise<void> {
    try {
      const result = (await this.hass!.callWS({
        type: "wiener_linien_austria/retro_card_version",
      })) as { version?: string } | undefined;
      if (result?.version && result.version !== RETRO_CARD_VERSION) {
        this._versionMismatch = result.version;
      }
    } catch {
      // backend may be older; ignore
    }
  }

  private _resolveEntity(): string | null {
    if (this._config?.entity && this.hass?.states?.[this._config.entity]) {
      return this._config.entity;
    }
    const available = findWienerLinienEntities(this.hass);
    return available[0] ?? null;
  }

  // ------------------------------------------------------------------
  // Wheelchair race scheduler
  // ------------------------------------------------------------------

  private _clearRaceTimers(): void {
    for (const t of this._raceTimers) clearTimeout(t);
    this._raceTimers = [];
  }

  private _scheduleRace(delayMs: number): void {
    const t = setTimeout(() => this._startRace(), delayMs);
    this._raceTimers.push(t);
  }

  // Click-to-race: tapping the card while idle kicks off a race
  // immediately, cancelling any pending auto-scheduled race. No-op
  // if the toggle is off, a race is already in progress, or
  // prefers-reduced-motion is set (matches the auto-loop's gating).
  private _handleCardClick = (): void => {
    if (!this._config?.wheelchair_race) return;
    if (this._raceState !== "idle") return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    this._clearRaceTimers();
    this._startRace();
  };

  private _startRace(): void {
    if (!this._config?.wheelchair_race) return;
    // Respect `prefers-reduced-motion: reduce` at the scheduler level.
    // Without this, the CSS animations would be suppressed but the state
    // machine would still flip briefly to "racing" → "victory" — giving
    // motion-sensitive users an abrupt checkered-flag appearance instead
    // of a race. Re-schedule so the loop resumes if the preference
    // changes later.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      this._scheduleRace(this._nextRaceDelay());
      return;
    }
    if (this._currentBarrierFreeCount() < 2) {
      this._scheduleRace(this._nextRaceDelay());
      return;
    }
    // Pre-race countdown: "3, 2, 1" punched onto the LED before the
    // racers leave the gate. Random params get rolled now so the winner
    // is decided by the time the gate opens — the badge on the victory
    // overlay already knows who'll win.
    const { winnerCrossT } = this._randomizeRaceParams();
    const now = Date.now();
    this._raceState = "countdown";
    this._countdownStartAt = now;
    this._countdownDigit = 3;
    // Schedule the photo-finish freeze at winner cross + small delta,
    // then victory after the freeze. This gives the viewer a still
    // frame of the wheelchairs at the line before the trophy appears.
    this._raceEndAt =
      now +
      COUNTDOWN_TOTAL_MS +
      winnerCrossT +
      FREEZE_DELAY_AFTER_WINNER_MS;
    this._freezeEndAt = this._raceEndAt + FREEZE_DURATION_MS;
    this._victoryEndAt = this._freezeEndAt + VICTORY_DURATION_MS;
    this._scheduleCountdownTick();
  }

  // Countdown ticker: walks the visible digit from 3 → 2 → 1 → race.
  // Computes the digit from elapsed wall-clock time so a disconnect/
  // reconnect mid-countdown lands on the correct digit instead of
  // restarting from 3.
  private _scheduleCountdownTick(): void {
    if (this._raceState !== "countdown" || this._countdownStartAt === null) return;
    const now = Date.now();
    const elapsed = now - this._countdownStartAt;
    if (elapsed >= COUNTDOWN_TOTAL_MS) {
      this._beginRacing();
      return;
    }
    const digit = Math.max(
      1,
      Math.min(3, 3 - Math.floor(elapsed / COUNTDOWN_DIGIT_MS)),
    ) as 1 | 2 | 3;
    if (this._countdownDigit !== digit) this._countdownDigit = digit;
    const nextDigitAt =
      this._countdownStartAt +
      (Math.floor(elapsed / COUNTDOWN_DIGIT_MS) + 1) * COUNTDOWN_DIGIT_MS;
    const wait = Math.max(50, nextDigitAt - now);
    this._raceTimers.push(setTimeout(() => this._scheduleCountdownTick(), wait));
  }

  // Flips countdown → racing. Called from the countdown ticker once the
  // total countdown duration has elapsed. The race-end / victory-end
  // wall-clock targets were already computed in _startRace so this
  // doesn't recompute them — guarantees the winner badge matches the
  // animation that just played.
  private _beginRacing(): void {
    this._raceState = "racing";
    this._countdownDigit = null;
    this._countdownStartAt = null;
    this._armStateTransitions();
  }

  // Measures each wheelchair's natural starting x AND the live finish-
  // line position, all in cqw relative to the card width. Returns null
  // if the DOM isn't ready or there aren't two racers — caller falls
  // back to sensible defaults.
  //
  // finishCqw is the x where the wheelchair's LEFT edge needs to be so
  // that its RIGHT edge (the leading edge in the direction of motion)
  // touches the strip's left edge — that's the "wheelchair hits the
  // line" moment a viewer naturally calls the finish. Without the
  // wheelchair-width offset, the math considers "crossed" when the
  // wheelchair body is already fully past the strip's left edge —
  // visibly half a wheelchair width late.
  private _measureRaceStartPositions(): {
    a: number;
    b: number;
    finishCqw: number;
  } | null {
    const card = this.shadowRoot?.querySelector(".retro") as HTMLElement | null;
    if (!card) return null;
    const cardRect = card.getBoundingClientRect();
    if (cardRect.width <= 0) return null;
    const wheels = this.shadowRoot?.querySelectorAll<HTMLElement>(
      ".retro-row .retro-wheelchair",
    );
    if (!wheels || wheels.length < 2) return null;
    const wheelA = wheels[0];
    const wheelB = wheels[1];
    if (!wheelA || !wheelB) return null;  // length-guard above; satisfies noUncheckedIndexedAccess
    const aRect = wheelA.getBoundingClientRect();
    const bRect = wheelB.getBoundingClientRect();
    const aLeft = aRect.left - cardRect.left;
    const bLeft = bRect.left - cardRect.left;
    const stripWidthPx = this._config?.size === "small" ? 10 : 14;
    const stripLeftCqw = 100 - (stripWidthPx / cardRect.width) * 100;
    const wheelWidthCqw = (aRect.width / cardRect.width) * 100;
    const finishCqw = stripLeftCqw - wheelWidthCqw;
    return {
      a: (aLeft / cardRect.width) * 100,
      b: (bLeft / cardRect.width) * 100,
      finishCqw,
    };
  }

  // Race-engine: derives every per-racer trajectory parameter from a
  // chosen "intended winner" + finish-margin + comeback flag, then
  // reconciles the announced winner from the actual post-clamp
  // trajectories so the visible cross order can never disagree with the
  // victory badge.
  //
  // Algorithm:
  //   1. Pick the intended finish-line winner (A or B, 50/50).
  //   2. Pick a finish margin: close / medium / decisive (weighted).
  //   3. Pick whether this race is a "comeback" — the swap pattern's
  //      75% leader is the LOSER, and the winner pulls ahead in the
  //      home stretch.
  //   4. Pick a swap pattern matching that constraint (the pattern
  //      still drives mid-race overtakes for visual storytelling).
  //   5. Measure each wheelchair's natural start x (cqw).
  //   6. Compute absolute target x at each checkpoint per racer.
  //   7. Solve for each racer's exit position so they cross
  //      RACE_FINISH_X_CQW at their target time. Clamped — extremes
  //      just under-/overshoot the intended margin.
  //   8. Recompute actual cross times from the clamped trajectories
  //      and assign _raceWinner from those, so announced == visible.
  //
  // Returns the time (ms from race start) at which the WINNER crosses
  // the finish line. The state machine uses that to schedule the
  // freeze (DEBUG) and then victory.
  private _randomizeRaceParams(): { winnerCrossT: number } {
    const rand = (min: number, max: number): number =>
      min + Math.random() * (max - min);
    const jitter = (base: number, amount: number): number =>
      base + (Math.random() * 2 - 1) * amount;

    // (1)(3)(4) Pick intended winner + comeback flag + swap pattern.
    const intendedWinner: Racer = Math.random() < 0.5 ? "A" : "B";
    const isComeback = Math.random() < RACE_PROB_COMEBACK;
    const patternLeader: Racer = isComeback
      ? intendedWinner === "A"
        ? "B"
        : "A"
      : intendedWinner;
    const patternPool = RACE_PATTERNS.filter((p) => p[2] === patternLeader);
    const pattern =
      patternPool[Math.floor(Math.random() * patternPool.length)]!;

    // (2) Pick finish margin (ms between winner and loser crossings).
    const marginRoll = Math.random();
    const margin =
      marginRoll < RACE_PROB_CLOSE
        ? rand(RACE_MARGIN_CLOSE_MS[0], RACE_MARGIN_CLOSE_MS[1])
        : marginRoll < RACE_PROB_CLOSE + RACE_PROB_MEDIUM
          ? rand(RACE_MARGIN_MEDIUM_MS[0], RACE_MARGIN_MEDIUM_MS[1])
          : rand(RACE_MARGIN_DECISIVE_MS[0], RACE_MARGIN_DECISIVE_MS[1]);

    // Cross times + total animation durations. Each racer's animation
    // runs slightly past their cross time (the "tail") so the
    // wheelchair smoothly exits past the right edge after winning.
    const winnerCrossT = rand(RACE_CROSS_BASE_MIN_MS, RACE_CROSS_BASE_MAX_MS);
    const loserCrossT = winnerCrossT + margin;
    const winnerDur = winnerCrossT * rand(RACE_DUR_TAIL_MIN, RACE_DUR_TAIL_MAX);
    const loserDur = loserCrossT * rand(RACE_DUR_TAIL_MIN, RACE_DUR_TAIL_MAX);
    const durA = intendedWinner === "A" ? winnerDur : loserDur;
    const durB = intendedWinner === "B" ? winnerDur : loserDur;
    const crossTargetA = intendedWinner === "A" ? winnerCrossT : loserCrossT;
    const crossTargetB = intendedWinner === "B" ? winnerCrossT : loserCrossT;

    // (5)(6) Measure starts + live finish line, then compute per-
    // checkpoint absolute targets. finishX matches the actual left
    // edge of the visible checkered strip — math winner == strip-
    // crossing winner the user observes.
    const measured = this._measureRaceStartPositions();
    const startA = measured?.a ?? 0;
    const startB = measured?.b ?? 0;
    const finishX = measured?.finishCqw ?? RACE_FINISH_X_FALLBACK_CQW;
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

    // (7) Solve the linear interp 75%→100% segment for `exit` so this
    // racer crosses finishX at their target time:
    //   crossT = 0.75*dur + 0.25*dur * (finishX - t75) / (exit - t75)
    //   => exit = t75 + (finishX - t75) * 0.25*dur / (crossT - 0.75*dur)
    const computeExit = (
      crossT: number,
      dur: number,
      t75: number,
    ): number => {
      const distance = finishX - t75;
      const segmentTime = crossT - 0.75 * dur;
      if (distance <= 0 || segmentTime <= 1) {
        // Edge case: finish line was already passed by the 75%
        // checkpoint. Let the racer exit naturally with a small offset.
        return Math.max(t75 + 5, RACE_EXIT_MIN_CQW);
      }
      const exit = t75 + (distance * 0.25 * dur) / segmentTime;
      return Math.max(RACE_EXIT_MIN_CQW, Math.min(RACE_EXIT_MAX_CQW, exit));
    };
    const exitA = computeExit(crossTargetA, durA, t75A);
    const exitB = computeExit(crossTargetB, durB, t75B);

    // (8) Recompute actual cross times by walking every animation
    // segment in time order. Necessary because on the smaller card
    // variants — where row font size is 1.25em vs 1.9em — long
    // destination text pushes maxStart high enough that the wheelchair
    // can already be past finishX by the 75% checkpoint. In that case
    // the cross happens in the 50→75% segment (or earlier), and a
    // hardcoded 75→100% formula collapses both racers to the same
    // 0.75*dur, breaking winner reconciliation. Visible-on-screen
    // winner is whoever crosses first; assign _raceWinner from that so
    // the trophy badge always matches what the user just watched.
    //
    // Segment 0→25% actually uses ease-out (not linear), so the cross
    // time in that segment is approximate — but a cross that early
    // requires extreme maxStart values that don't occur in practice.
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
    this._raceWinner = crossA <= crossB ? "A" : "B";

    // Per-racer translate (cqw) = absolute target - measured start.
    this.style.setProperty("--race-a-duration", `${durA}ms`);
    this.style.setProperty("--race-b-duration", `${durB}ms`);
    this.style.setProperty("--race-a-end", `${exitA - startA}cqw`);
    this.style.setProperty("--race-b-end", `${exitB - startB}cqw`);
    this.style.setProperty("--race-a-x-25", `${t25A - startA}cqw`);
    this.style.setProperty("--race-a-x-50", `${t50A - startA}cqw`);
    this.style.setProperty("--race-a-x-75", `${t75A - startA}cqw`);
    this.style.setProperty("--race-b-x-25", `${t25B - startB}cqw`);
    this.style.setProperty("--race-b-x-50", `${t50B - startB}cqw`);
    this.style.setProperty("--race-b-x-75", `${t75B - startB}cqw`);
    return { winnerCrossT: Math.min(crossA, crossB) };
  }

  // Arms timers for whichever transition is pending next, based on the
  // wall-clock target times stored in _raceEndAt / _victoryEndAt. Safe to
  // call repeatedly — clears prior timers first.
  private _armStateTransitions(): void {
    this._clearRaceTimers();
    const now = Date.now();
    if (this._raceState === "countdown" && this._countdownStartAt !== null) {
      // Reconnect-mid-countdown: resume ticking from wherever we left
      // off. _scheduleCountdownTick computes the right digit and the
      // right next-tick delay from elapsed wall-clock time.
      this._scheduleCountdownTick();
    } else if (this._raceState === "racing" && this._raceEndAt !== null) {
      const delay = Math.max(0, this._raceEndAt - now);
      this._raceTimers.push(
        setTimeout(() => {
          this._raceState = "freeze";
          this._raceEndAt = null;
          this._armStateTransitions();
        }, delay),
      );
    } else if (this._raceState === "freeze" && this._freezeEndAt !== null) {
      const delay = Math.max(0, this._freezeEndAt - now);
      this._raceTimers.push(
        setTimeout(() => {
          this._raceState = "victory";
          this._freezeEndAt = null;
          this._armStateTransitions();
        }, delay),
      );
    } else if (this._raceState === "victory" && this._victoryEndAt !== null) {
      const delay = Math.max(0, this._victoryEndAt - now);
      this._raceTimers.push(
        setTimeout(() => {
          this._raceState = "idle";
          this._victoryEndAt = null;
          if (this._config?.wheelchair_race) {
            this._scheduleRace(this._nextRaceDelay());
          }
        }, delay),
      );
    }
  }

  private _nextRaceDelay(): number {
    return NEXT_RACE_MIN_MS + Math.random() * (NEXT_RACE_MAX_MS - NEXT_RACE_MIN_MS);
  }

  private _currentBarrierFreeCount(): number {
    if (!this._config) return 0;
    const eid = this._resolveEntity();
    if (!eid || !this.hass) return 0;
    const attrs = (this.hass.states[eid]?.attributes ?? {}) as WienerLinienAttrs;
    const departures = Array.isArray(attrs.departures) ? attrs.departures : [];
    const matching = filterDepartures(departures, {
      direction: this._config.direction,
      lines: this._config.line ? [this._config.line] : undefined,
      walk_times: this._config.walk_times,
      accessibility_only: this._config.accessibility_only,
    });
    return matching.slice(0, 2).filter((r) => r.barrier_free).length;
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const cfg = this._config;
    const eid = this._resolveEntity();
    const attrs = (eid ? (this.hass?.states?.[eid]?.attributes ?? {}) : {}) as WienerLinienAttrs;
    const departures = Array.isArray(attrs.departures) ? attrs.departures : [];

    const matching = filterDepartures(departures, {
      direction: cfg.direction,
      lines: cfg.line ? [cfg.line] : undefined,
      walk_times: cfg.walk_times,
      accessibility_only: cfg.accessibility_only,
    });
    const rows = matching.slice(0, 2);

    const rawPlatform = rows.find((d) => d.platform)?.platform ?? null;
    const platform = cfg.show_platform ? rawPlatform : null;
    const gleisLeft = platform === "2";
    const type = rows[0]?.type ?? "";
    const isMetro = type === LINE_TYPE_METRO;
    const platformLabel = this._t(isMetro ? "gleis" : "steig");

    const stopName = attrs.stop_name || attrs.friendly_name || "";
    const showStationName = cfg.show_station_name && !!stopName;
    const stationPanel = showStationName
      ? this._renderStationName(
          stopName,
          matching,
          departures,
          cfg.station_bg,
          attrs.line_colors ?? {},
        )
      : nothing;

    const raceCountdown = cfg.wheelchair_race && this._raceState === "countdown";
    const raceActive = cfg.wheelchair_race && this._raceState === "racing";
    const raceFreeze = cfg.wheelchair_race && this._raceState === "freeze";
    const raceVictory = cfg.wheelchair_race && this._raceState === "victory";
    const clickable = cfg.wheelchair_race && this._raceState === "idle";
    const winnerLane = this._raceWinner === "A" ? 1 : this._raceWinner === "B" ? 2 : null;
    const retroClasses = {
      retro: true,
      "retro--gleis-left": !!platform && gleisLeft,
      "retro--gleis-right": !!platform && !gleisLeft,
      "retro--no-gleis": !platform,
      [`retro--size-${cfg.size}`]: cfg.size !== "regular",
      [`retro--style-${cfg.style}`]: cfg.style !== "classic",
      "retro--flicker": cfg.flicker,
      "retro--race-countdown": raceCountdown,
      "retro--race-active": raceActive,
      "retro--race-freeze": raceFreeze,
      "retro--race-victory": raceVictory,
      "retro--clickable": clickable,
    };

    return html`
      <ha-card style="background:#000;padding:0;overflow:hidden;">
        <div
          class=${classMap(retroClasses)}
          @click=${this._handleCardClick}>
          ${this._versionMismatch ? this._renderBanner() : nothing}
          ${stationPanel}
          <div class="retro-led">
            ${this._renderMain(eid, rows, matching, departures, platform, platformLabel, attrs.server_time)}
            ${raceCountdown && this._countdownDigit !== null
              ? html`<div class="retro-countdown" role="status" aria-live="polite">
                  ${keyed(
                    this._countdownDigit,
                    html`<span class="retro-countdown-digit" aria-hidden="true">${this._countdownDigit}</span>`,
                  )}
                  <span class="retro-victory-sr">
                    ${this._t("race_starting_in", { n: this._countdownDigit })}
                  </span>
                </div>`
              : nothing}
            ${raceCountdown || raceActive || raceFreeze
              ? html`<div class="retro-finish-line" aria-hidden="true"></div>`
              : nothing}
            ${raceVictory
              ? html`<div class="retro-victory" role="status" aria-live="polite">
                  <div class="retro-victory-flag" aria-hidden="true"></div>
                  ${winnerLane !== null
                    ? html`<div class="retro-victory-winner" aria-hidden="true">
                        <ha-icon class="retro-winner-trophy" icon="mdi:trophy"></ha-icon>
                        <span class="retro-winner-num">${winnerLane}</span>
                      </div>`
                    : nothing}
                  <span class="retro-victory-sr">
                    ${winnerLane !== null
                      ? this._t("race_winner_announce", { n: winnerLane })
                      : this._t("race_finished")}
                  </span>
                </div>`
              : nothing}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderMain(
    eid: string | null,
    rows: DepartureAttr[],
    matching: DepartureAttr[],
    allDepartures: DepartureAttr[],
    platform: string | null,
    platformLabel: string,
    serverTime: string | null | undefined,
  ): TemplateResult {
    if (!eid) return html`<div class="retro-empty" role="status" aria-live="polite">${this._t("no_entity")}</div>`;
    if (rows.length === 0) {
      // Diagnose the empty state so users know whether to flip direction,
      // drop the line filter, or just wait for data. If the API is still
      // responding (server_time present) but the stop has nothing left,
      // that's end-of-service, not a data outage.
      const dir = this._config!.direction;
      const lineFilter = this._config!.line;
      const inDirection = allDepartures.filter((d) => d.direction === dir);
      let key = "no_data";
      if (allDepartures.length === 0 && serverTime) {
        key = "betriebsschluss";
      } else if (allDepartures.length > 0 && inDirection.length === 0) {
        key = "no_data_wrong_direction";
      } else if (lineFilter && inDirection.length > 0) {
        key = "no_data_wrong_line";
      }
      return html`<div class="retro-empty" role="status" aria-live="polite">${this._t(key)}</div>`;
    }
    // Silence the noop-var warning until used.
    void matching;
    return html`
      <ul class="retro-rows" role="list" aria-label=${this._t("departures_list")}>
        ${rows.map((d) => this._renderRow(d))}
      </ul>
      ${platform ? this._renderGleis(platform, platformLabel) : nothing}
    `;
  }

  private _renderRow(d: DepartureAttr): TemplateResult {
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const isAtPlatform = cd !== null && cd <= 0;
    const line = d.line || "?";
    const towards = d.towards || "";
    const cdLabel =
      cd === null
        ? this._t("no_data")
        : isAtPlatform
          ? this._t("at_platform")
          : this._t("countdown_minutes", { n: String(cd) });
    const a11yLabel = d.barrier_free ? this._t("barrier_free_title") : "";
    const rowLabel = [line, towards, cdLabel, a11yLabel].filter(Boolean).join(" — ");
    return html`
      <li class="retro-row" aria-label=${rowLabel}>
        <div class="retro-line" aria-hidden="true">${line}</div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-text">${deText(towards)}</span>
          ${d.barrier_free
            ? html`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title=${this._t("barrier_free_title")}
              ></ha-icon>`
            : nothing}
        </div>
        <div class="retro-cd" aria-hidden="true">
          ${cd === null
            ? "--"
            : isAtPlatform
              ? html`<span class="retro-stars"><span>*</span><span>*</span></span>`
              : String(cd)}
        </div>
      </li>
    `;
  }

  private _renderGleis(platform: string, label: string): TemplateResult {
    return html`
      <div class="retro-gleis">
        <div class="retro-gleis-label">${label}</div>
        <div class="retro-gleis-number">${platform}</div>
      </div>
    `;
  }

  private _renderStationName(
    stopName: string,
    matching: DepartureAttr[],
    allDepartures: DepartureAttr[],
    bgChoice: "default" | "white" | "black",
    lineColors: NonNullable<WienerLinienAttrs["line_colors"]>,
  ): TemplateResult {
    const pool = matching.length ? matching : allDepartures;
    const metroDep = pool.find((d) => d.type === LINE_TYPE_METRO);
    const metroLine = metroDep?.line;

    let bg: string;
    let fg: string;
    if (bgChoice === "white") {
      bg = "#fff";
      fg = "#000";
    } else if (bgChoice === "black") {
      bg = "#000";
      fg = "#fff";
    } else if (metroLine) {
      // Pull the GTFS-published colour for the soonest metro line at this
      // stop. The retro panel doesn't honour user `line_colors` overrides
      // here — the station tile follows upstream branding by design,
      // matching the in-station signage aesthetic the card emulates.
      const upper = metroLine.toUpperCase();
      const palette = lineColors[metroLine] ?? lineColors[upper];
      bg = palette?.bg ? `#${palette.bg}` : "var(--primary-color)";
      fg = palette?.fg ? `#${palette.fg}` : "#fff";
    } else {
      bg = "#fff";
      fg = "#000";
    }

    return html`
      <div class="retro-station" style=${styleMap({ background: bg, color: fg })}>
        <div class="retro-station-name">${deText(stopName)}</div>
      </div>
    `;
  }

  private _renderBanner(): TemplateResult {
    const msg = this._t("version_update", { v: this._versionMismatch ?? "" });
    return html`
      <div class="retro-banner">
        <span>${msg}</span>
        <button type="button" @click=${this._reload}>${this._t("version_reload")}</button>
      </div>
    `;
  }

  private async _reload(): Promise<void> {
    try {
      if (window.caches?.keys) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
    } catch {
      // best-effort
    }
    window.location.reload();
  }

  // ------------------------------------------------------------------
  // Styles — ported verbatim from the vanilla RETRO_STYLE
  // ------------------------------------------------------------------

  static styles = css`
    :host {
      display: block;
      /* Create a stacking context on the host so the high z-indexes
         inside (screen-door overlay z=30, victory overlay z=20,
         winner badge z=22, etc.) only compete with other elements
         inside this card. Without this, race overlays and the LED
         dot pattern can render above HA's dashboard chrome. */
      isolation: isolate;
    }
    .retro {
      /* Classic defaults — swapped wholesale by .retro--style-warm below. */
      --led-amber: #FFC700;
      --led-bg: #000;
      --led-substrate: #1a0d2a;
      --led-glow-rgb: 255 199 0;
      --led-dot-size: 0.5px;
      --led-dot-edge: 1px;
      --led-dot-pitch: 4px;

      /* LED area inner padding. Lives on the LED element; declared here so
         size/gleis variants can override via the .retro cascade. */
      --retro-pad-y: 14px;
      --retro-pad-r: 22px;
      --retro-pad-l: 22px;

      /* Establish a container so the race exit animation can translate
         wheelchairs by 100cqw (= full card width) regardless of size. */
      container-type: inline-size;
      position: relative;
      display: flex;
      flex-direction: column;
      font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
      font-weight: 700;
      letter-spacing: 0.08em;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
      min-height: 110px;
    }
    .retro-led {
      /* The actual LED display area — own positioning context so the
         race finish-line and victory overlay fill it edge-to-edge with a
         simple inset:0, no negative-margin gymnastics. */
      flex: 1;
      position: relative;
      display: flex;
      align-items: stretch;
      background: var(--led-bg);
      background-image: radial-gradient(
        circle,
        var(--led-substrate) var(--led-dot-size),
        transparent var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      padding: var(--retro-pad-y) var(--retro-pad-r) var(--retro-pad-y) var(--retro-pad-l);
    }
    /* Pixel style — vintage LED-dot-matrix departure-board look. A
       layer above all panel content is transparent at the substrate-
       dot positions and opaque LED-bg between them, so amber text +
       glow + race choreography (wheelchairs, finish strip, countdown
       digit, victory flag, trophy badge) all show through *only* at
       dot positions — aligned with the substrate dot pattern beneath.
       Everything in the LED area becomes discrete "lit LED dots" for a
       consistently dotty panel material.
       Pixel inherits the warm color palette (3px dot pitch) because
       the classic style's 4px pitch is too coarse for the screen-door
       and small text becomes illegible. z-index 30 sits above the
       wheelchair (4), finish strip (3), countdown (18), victory (20)
       — and the trophy badge inside victory's isolated stacking
       context (which appears at z=20 from .retro-led's perspective). */
    .retro--style-pixel .retro-led::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(
        circle,
        transparent var(--led-dot-size),
        var(--led-bg) var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      pointer-events: none;
      z-index: 30;
    }
    .retro--clickable {
      cursor: pointer;
    }
    .retro--style-warm,
    .retro--style-pixel {
      --led-amber: #FFB000;
      --led-bg: #050302;
      --led-substrate: #2a1805;
      --led-glow-rgb: 255 176 0;
      --led-dot-size: 0.9px;
      --led-dot-edge: 1.4px;
      --led-dot-pitch: 3px;
    }
    .retro--gleis-left .retro-gleis { order: -1; }
    .retro--gleis-right { --retro-pad-r: 14px; }
    .retro--gleis-left { --retro-pad-l: 14px; }
    .retro-rows {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      font-size: 1.9em;
      line-height: 1;
      /* Was a <div>; now a <ul> for semantic departure list. Reset the
         default user-agent list chrome so layout is unchanged. */
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .retro-row {
      display: grid;
      grid-template-columns: 2.5em 1fr auto;
      align-items: baseline;
      gap: 12px;
      white-space: nowrap;
    }
    .retro-line {
      font-weight: 400;
      text-align: left;
      transition: opacity 0.15s ease-out;
    }
    .retro-dest {
      display: flex;
      align-items: baseline;
      gap: 0.35em;
      overflow: hidden;
      text-transform: uppercase;
      min-width: 0;
      transition: opacity 0.15s ease-out;
    }
    .retro-dest-text {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 0 1 auto;
      min-width: 0;
    }
    .retro-wheelchair {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      --mdc-icon-size: 1em;
      color: inherit;
      filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
      transform: translateY(0.18em);
    }
    .retro-cd {
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 2.5em;
      transition: opacity 0.4s ease-out;
    }
    .retro-stars {
      display: inline-flex;
      gap: 0.08em;
      justify-content: flex-end;
    }
    .retro-stars > span {
      animation: retroStarBlink 1s infinite;
    }
    .retro-stars > span:nth-child(2) {
      animation-delay: 0.5s;
    }
    @keyframes retroStarBlink {
      0%, 49.99% { opacity: 1; }
      50%, 100%  { opacity: 0; }
    }
    /* Irregular, mostly-on flicker — brief dips and rare blackouts on the
       line badge. Keeps full opacity ~95% of the loop so it reads as a
       struggling bulb rather than a blinking sign. */
    @keyframes retroLineFlicker {
      0%, 6.9%   { opacity: 1; }
      7.1%       { opacity: 0.38; }
      7.5%       { opacity: 1; }
      22.9%      { opacity: 1; }
      23.1%      { opacity: 0.08; }
      23.35%     { opacity: 1; }
      23.7%      { opacity: 0.55; }
      24%        { opacity: 1; }
      51.9%      { opacity: 1; }
      52.15%     { opacity: 0.45; }
      52.4%      { opacity: 1; }
      75.9%      { opacity: 1; }
      76.1%      { opacity: 0.15; }
      76.35%     { opacity: 1; }
      77%        { opacity: 0.6; }
      77.3%      { opacity: 1; }
      100%       { opacity: 1; }
    }
    @media (prefers-reduced-motion: no-preference) {
      .retro--flicker .retro-line {
        animation: retroLineFlicker 7.3s infinite;
        will-change: opacity;
      }
      /* Offset the second row so the two badges don't flicker in lockstep. */
      .retro--flicker .retro-row:nth-child(2) .retro-line {
        animation-duration: 8.1s;
        animation-delay: -2.4s;
      }
    }
    /* Wheelchair race — per-race pattern encodes who's ahead at 25/50/
       75%, so each run has at least one overtake. Per-racer waypoints
       (--race-x-25/50/75), end offset, and duration come from CSS
       custom properties that JS sets at race start. Keyframe preserves
       the 0.18em baseline offset so the icon doesn't jump vertically.
       Per-keyframe timing-functions: ease-out for the launch (burst
       out of the gate) and a symmetric cubic-bezier for every middle
       segment. The cubic-bezier (0.4, 0.2, 0.6, 0.8) has endpoint
       slopes of ~0.5× the segment's average velocity, peaking ~1.5×
       in the middle — so when the swap pattern flips lead/trail at a
       checkpoint, the velocity transition reads as a smooth ease
       instead of an abrupt lurch. */
    @keyframes retroWheelExit {
      0%   { transform: translate(0, 0.18em); animation-timing-function: ease-out; }
      25%  { transform: translate(var(--race-x-25, 25cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      50%  { transform: translate(var(--race-x-50, 50cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      75%  { transform: translate(var(--race-x-75, 75cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      100% { transform: translate(var(--race-end, 110cqw), 0.18em); }
    }
    @media (prefers-reduced-motion: no-preference) {
      /* LED prep: countdown, racing, and the DEBUG freeze (paused mid-
         race for visual verification) all share the same row-clearing
         + overflow-visible setup. */
      .retro--race-countdown .retro-dest,
      .retro--race-active .retro-dest,
      .retro--race-freeze .retro-dest {
        overflow: visible;
      }
      .retro--race-countdown .retro-cd,
      .retro--race-active .retro-cd,
      .retro--race-freeze .retro-cd {
        opacity: 0;
      }
      /* Only fade Gleis/Steig during the prep when it's on the right —
         that's the wheelchairs' path. Left-side Gleis stays lit. */
      .retro--race-countdown.retro--gleis-right .retro-gleis,
      .retro--race-active.retro--gleis-right .retro-gleis,
      .retro--race-freeze.retro--gleis-right .retro-gleis {
        opacity: 0;
      }
      /* Animation declarations apply during both active and freeze so
         the in-flight animation keeps its identity across the state
         flip — animation-play-state: paused below freezes the frame
         instead of restarting from 0%. */
      .retro--race-active .retro-row:nth-child(1) .retro-wheelchair,
      .retro--race-freeze .retro-row:nth-child(1) .retro-wheelchair {
        --race-end: var(--race-a-end, 110cqw);
        --race-x-25: var(--race-a-x-25, 25cqw);
        --race-x-50: var(--race-a-x-50, 50cqw);
        --race-x-75: var(--race-a-x-75, 75cqw);
        animation: retroWheelExit var(--race-a-duration, 3.3s) linear forwards;
      }
      .retro--race-active .retro-row:nth-child(2) .retro-wheelchair,
      .retro--race-freeze .retro-row:nth-child(2) .retro-wheelchair {
        --race-end: var(--race-b-end, 110cqw);
        --race-x-25: var(--race-b-x-25, 25cqw);
        --race-x-50: var(--race-b-x-50, 50cqw);
        --race-x-75: var(--race-b-x-75, 75cqw);
        animation: retroWheelExit var(--race-b-duration, 3.3s) linear forwards;
      }
      /* Photo-finish freeze: pauses both wheelchair animations at
         the moment shortly after the winner crosses the finish line.
         The viewer gets a clear still frame — winner at the strip,
         loser caught a step behind — before the trophy appears. */
      .retro--race-freeze .retro-wheelchair {
        animation-play-state: paused;
      }
      /* Pass wheelchairs in front of the finish-line strip so the
         crossing reads as "through" rather than "behind the barrier". */
      .retro--race-active .retro-wheelchair,
      .retro--race-freeze .retro-wheelchair {
        position: relative;
        z-index: 4;
      }
      /* Victory holds the racers off-screen until the idle reset. */
      .retro--race-victory .retro-wheelchair {
        opacity: 0;
      }
    }
    /* Hide all row text during victory so nothing bleeds through the
       (slightly transparent) checker flag. */
    .retro--race-victory .retro-line,
    .retro--race-victory .retro-dest,
    .retro--race-victory .retro-cd,
    .retro--race-victory .retro-gleis {
      opacity: 0;
    }
    /* Flicker keyframes set their own opacity values, which win over
       the static opacity:0 above while the animation is running.
       Disable the flicker entirely during victory so the line badge
       hides cleanly with the rest of the row text. */
    .retro--race-victory.retro--flicker .retro-line {
      animation: none;
    }
    /* Pixelated finish-line strip on the right edge during the race.
       Same conic-gradient checker technique as the victory flag, but
       as a narrow 14px column so ~2 squares wide read as chunky "8-bit
       goal posts". Clipped by the card's border-radius via overflow. */
    .retro-finish-line {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 14px;
      z-index: 3;
      pointer-events: none;
      background-image: conic-gradient(
        transparent 0deg 90deg,
        var(--led-amber) 90deg 180deg,
        transparent 180deg 270deg,
        var(--led-amber) 270deg 360deg
      );
      background-size: 14px 14px;
      filter: drop-shadow(0 0 4px rgb(var(--led-glow-rgb) / 0.7));
      animation: retroFinishLineAppear 0.3s ease-out both;
    }
    @keyframes retroFinishLineAppear {
      0%   { opacity: 0; transform: scaleX(0.2); transform-origin: right; }
      100% { opacity: 1; transform: scaleX(1); }
    }
    /* Smaller strip on the small variant so it doesn't dominate. */
    .retro--size-small .retro-finish-line {
      width: 10px;
      background-size: 10px 10px;
    }
    /* Victory overlay: 90s-racing-sim checkered flag scrolling horizontally
       with a pulsing trophy centered on top. */
    .retro-victory {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      overflow: hidden;
      border-radius: inherit;
      opacity: 1;
      isolation: isolate;
      /* Size container so the flag can query card height via cqh and
         keep its checker squares actually square regardless of size. */
      container-type: size;
      animation: retroVictoryAppear 0.22s ease-out both;
    }
    /* Screen-reader-only label inside the victory overlay. The overlay
       is purely visual (checkered flag animation) so we ship a hidden
       text announcement in a role="status"/aria-live region — screen
       readers speak it when the race finishes, sighted users see the
       animation. */
    .retro-victory-sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .retro-victory-flag {
      position: absolute;
      inset: 0;
      /* Transparent "dark" tiles let the LED substrate dot pattern of the
         card show through; only the amber rectangles are painted, then the
         drop-shadow filter gives each one the same glow as the row text. */
      background-image: conic-gradient(
        transparent 0deg 90deg,
        var(--led-amber) 90deg 180deg,
        transparent 180deg 270deg,
        var(--led-amber) 270deg 360deg
      );
      /* Tile = 50cqh × 50cqh — square, so height divides the card into
         2 tile rows (= 4 rectangle rows) and the individual rectangles
         stay square at every card size. */
      background-size: 50cqh 50cqh;
      filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
      animation: retroVictoryFlag 0.4s linear infinite;
    }
    @keyframes retroVictoryAppear {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes retroVictoryFlag {
      0%   { background-position: 0 0; }
      100% { background-position: 100cqh 0; }
    }

    /* Pre-race countdown overlay — "3, 2, 1" punch-in over the LED
       panel before the racers leave the gate. Single big chunky
       monospace numeral in LED-amber, glowing, with a punch-scale
       animation per digit (Lit re-mounts the <span> via keyed() so
       the keyframe re-fires each tick). The overlay dims the LED
       behind it slightly so the digit reads cleanly. */
    .retro-countdown {
      position: absolute;
      inset: 0;
      z-index: 18;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.6);
      border-radius: inherit;
      overflow: hidden;
      isolation: isolate;
      container-type: size;
      animation: retroCountdownAppear 0.18s ease-out both;
    }
    @keyframes retroCountdownAppear {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }
    .retro-countdown-digit {
      display: block;
      font-family: ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      font-size: 60cqh;
      line-height: 1;
      color: var(--led-amber);
      letter-spacing: -0.04em;
      text-shadow:
        0 0 10px rgb(var(--led-glow-rgb) / 0.9),
        0 0 24px rgb(var(--led-glow-rgb) / 0.7),
        0 0 40px rgb(var(--led-glow-rgb) / 0.4);
      animation: retroCountdownPunch 0.8s ease-out both;
      will-change: transform, opacity;
    }
    @keyframes retroCountdownPunch {
      0%   { opacity: 0; transform: scale(0.4); }
      18%  { opacity: 1; transform: scale(1.18); }
      30%  {              transform: scale(1); }
      72%  { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.85); }
    }

    /* Winner badge — circular cut-out centered on the victory checker
       flag. Background = the card's LED substrate (--led-bg, black in
       classic, dark warm-amber in warm mode) so the badge reads as
       "punched through" the checker flag rather than sitting on top of
       it. Amber LED ring + glow gives it the same lit-from-within
       feel as the rest of the LED panel. mdi:trophy is the visual
       anchor; the lane number sits on its plinth. */
    .retro-victory-winner {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 22;
      width: 41cqmin;
      height: 41cqmin;
      min-width: 82px;
      min-height: 82px;
      max-width: 172px;
      max-height: 172px;
      border-radius: 50%;
      background-color: var(--led-bg);
      background-image: radial-gradient(
        circle,
        var(--led-substrate) var(--led-dot-size),
        transparent var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--led-amber);
      box-shadow:
        0 0 12px rgb(var(--led-glow-rgb) / 0.85),
        0 0 28px rgb(var(--led-glow-rgb) / 0.55),
        inset 0 0 10px rgb(var(--led-glow-rgb) / 0.25);
      transform: translate(-50%, -50%) scale(0.2);
      opacity: 0;
      animation: retroWinnerBadgeAppear 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s forwards;
    }
    @keyframes retroWinnerBadgeAppear {
      0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
      100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .retro-winner-trophy {
      --mdc-icon-size: 57cqmin;
      color: var(--led-amber);
      filter: drop-shadow(0 0 4px rgb(var(--led-glow-rgb) / 0.85))
              drop-shadow(0 0 10px rgb(var(--led-glow-rgb) / 0.45));
    }
    /* Lane number on the trophy cup. Amber so it reads as part of the
       trophy material. Embossed via a subtle highlight on top-left
       (light from above) + soft shadow on bottom-right (depth), plus
       a faint LED glow to tie it to the rest of the panel. No heavy
       drop-shadow extrusion or thick stroke — those read as a
       separate label sitting on top of the trophy, not as letters
       pressed into the metal. */
    .retro-winner-num {
      position: absolute;
      top: 40%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      text-align: center;
      font-family: "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-weight: 900;
      font-size: 22cqmin;
      line-height: 1;
      color: var(--led-amber);
      letter-spacing: -0.04em;
      pointer-events: none;
      text-shadow:
        -1px -1px 0 rgba(255, 240, 180, 0.55),
        1px 1px 1px rgba(0, 0, 0, 0.4),
        0 0 6px rgb(var(--led-glow-rgb) / 0.35);
    }
    /* Tighter on the small variant so trophy + number still fit. */
    .retro--size-small .retro-winner-trophy {
      --mdc-icon-size: 51cqmin;
    }
    .retro--size-small .retro-winner-num {
      font-size: 19cqmin;
      /* On small the badge hits its 82px min-width while the trophy
         icon scales down independently — so the cup ends up a touch
         higher in the badge than on regular/medium. Nudge the number
         up the same amount so it lands on the cup body, not below it. */
      top: 33%;
    }
    /* Pixel style: both the trophy icon and the number are screened
       by the LED dot overlay above. Color the number with
       --led-substrate (the same tone the rest of the panel uses for
       its substrate dots) so the letter's dots match the substrate
       dots of the surrounding panel — the number reads as "unlit
       pixels" within the trophy's lit amber, not as a darker hole
       below the panel background. The embossed shadow stack stops
       making sense once everything is dotty, so drop it. */
    .retro--style-pixel .retro-winner-num {
      color: var(--led-substrate);
      text-shadow: none;
      -webkit-text-stroke: 0;
    }
    /* Pixel mode alignment fix: drop the trophy badge's own substrate
       gradient. The badge's gradient origin doesn't coregister with
       the panel-wide screen-door overlay, so its dots fight the
       overlay's dots inside the badge area. Without it, the trophy
       circle is a clean solid LED-bg cutout from the dotted panel —
       a dark frame around the dotted trophy icon and number. */
    .retro--style-pixel .retro-victory-winner {
      background-image: none;
    }
    /* Pixel style: add 1px of breathing room between the countdown
       digits and the gleis indicator. The screen-door overlay can
       make the dotted digits feel jammed against the gleis dots, so
       a single extra pixel of separation reads cleanly. Covers
       gleis-right (default), gleis-left (platform 2), and the small
       size variant where the base margin starts smaller. */
    .retro--style-pixel .retro-gleis {
      margin-left: 13px;
    }
    .retro--style-pixel.retro--gleis-left .retro-gleis {
      margin-right: 13px;
    }
    .retro--style-pixel.retro--size-small .retro-gleis {
      margin-left: 9px;
    }
    .retro--style-pixel.retro--size-small.retro--gleis-left .retro-gleis {
      margin-right: 9px;
    }

    .retro-gleis {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 14px 0 18px;
      margin-left: 12px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      border-left: 1px solid rgb(var(--led-glow-rgb) / 0.25);
      transition: opacity 0.4s ease-out;
    }
    .retro--gleis-left .retro-gleis {
      padding: 0 18px 0 14px;
      margin-left: 0;
      margin-right: 12px;
      border-left: none;
      border-right: 1px solid rgb(var(--led-glow-rgb) / 0.25);
    }
    .retro-gleis-label {
      font-size: 0.9em;
      letter-spacing: 2px;
      margin-bottom: 2px;
      opacity: 0.9;
    }
    .retro-gleis-number {
      font-size: 3em;
      line-height: 1;
      font-weight: 400;
    }

    /* ---- size variants ---- */
    .retro--size-medium {
      --retro-pad-y: 11px;
      --retro-pad-r: 18px;
      --retro-pad-l: 18px;
      min-height: 92px;
    }
    .retro--size-medium.retro--gleis-right { --retro-pad-r: 10px; }
    .retro--size-medium.retro--gleis-left { --retro-pad-l: 10px; }
    .retro--size-medium .retro-rows { font-size: 1.55em; gap: 6px; }
    .retro--size-medium .retro-gleis { padding: 0 10px 0 14px; min-width: 48px; }
    .retro--size-medium.retro--gleis-left .retro-gleis {
      padding: 0 14px 0 10px;
    }
    .retro--size-medium .retro-gleis-number { font-size: 2.3em; }
    .retro--size-medium .retro-gleis-label {
      font-size: 0.8em;
      letter-spacing: 1.5px;
    }

    .retro--size-small {
      --retro-pad-y: 8px;
      --retro-pad-r: 14px;
      --retro-pad-l: 14px;
      min-height: 72px;
    }
    .retro--size-small.retro--gleis-right { --retro-pad-r: 6px; }
    .retro--size-small.retro--gleis-left { --retro-pad-l: 6px; }
    .retro--size-small .retro-rows { font-size: 1.25em; gap: 4px; }
    .retro--size-small .retro-row {
      grid-template-columns: 2em 1fr auto;
      gap: 8px;
    }
    .retro--size-small .retro-gleis {
      padding: 0 8px 0 10px;
      min-width: 38px;
      margin-left: 8px;
    }
    .retro--size-small.retro--gleis-left .retro-gleis {
      padding: 0 10px 0 8px;
      margin-left: 0;
      margin-right: 8px;
    }
    .retro--size-small .retro-gleis-number { font-size: 1.75em; }
    .retro--size-small .retro-gleis-label {
      font-size: 0.68em;
      letter-spacing: 1px;
      margin-bottom: 0;
    }
    .retro-empty {
      flex: 1;
      text-align: center;
      align-self: center;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      font-size: 1.4em;
      padding: 20px 0;
      letter-spacing: 2px;
    }
    .retro-station {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 11px 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   Helvetica, Arial, sans-serif;
      font-weight: 700;
      letter-spacing: 0.01em;
      line-height: 1.05;
      font-size: 1.95em;
      border-radius: var(--ha-card-border-radius, 12px)
                     var(--ha-card-border-radius, 12px) 0 0;
    }
    .retro-station-name {
      text-shadow: none;
    }
    .retro--size-medium .retro-station {
      padding: 9px 14px;
      font-size: 1.65em;
    }
    .retro--size-small .retro-station {
      padding: 7px 10px;
      font-size: 1.35em;
    }
    .retro-banner {
      background: #ffa000;
      color: #000;
      padding: 6px 10px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-family: sans-serif;
      border-radius: 4px;
      letter-spacing: normal;
      font-size: 0.75em;
    }
    .retro-banner button {
      background: #000;
      color: #ffa000;
      border: none;
      border-radius: 3px;
      padding: 3px 10px;
      font-weight: 600;
      cursor: pointer;
      font-family: sans-serif;
    }

    /* Accessibility: visible focus ring for keyboard users. */
    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--led-amber, #ffa000);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Accessibility: honour user motion preference.
       Catch-all: nukes any animation/transition the feature-gated
       @media (prefers-reduced-motion: no-preference) blocks above
       don't already exclude. */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `;
}
