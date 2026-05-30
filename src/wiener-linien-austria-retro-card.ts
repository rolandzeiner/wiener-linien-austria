import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { keyed } from "lit/directives/keyed.js";
import { styleMap } from "lit/directives/style-map.js";
import type {
  HomeAssistant,
  LovelaceCardEditor,
  WindowWithCustomCards,
} from "./types.js";

import { RETRO_CARD_VERSION } from "./const.js";
import { deText } from "./utils.js";
import { LINE_TYPE_METRO } from "./utils/mot.js";
import { translate } from "./localize/localize.js";
import {
  checkCardVersionWS,
  renderVersionBanner,
} from "./shared-render.js";
import type {
  DepartureAttr,
  RetroHeaderSide,
  WienerLinienAttrs,
  WienerLinienRetroCardConfig,
} from "./types.js";
import { chipPalette, normaliseRetroConfig, type NormalisedRetroConfig } from "./utils/config.js";
import { filterDepartures } from "./utils/departures.js";
import { findWienerLinienEntities } from "./utils/entities.js";
import { formatDate, formatClock } from "./utils/time.js";
import type { LineColorsMap } from "./types.js";
import { registerWlFonts } from "./font-face.js";
import {
  RETRO_HEADER_ICONS,
  RETRO_HEADER_MDI_EXITS,
  isRetroHeaderMdiExit,
  renderRetroHeaderIcon,
  renderRetroHeaderMdiIcon,
  renderRetroHeaderMdiTile,
  type RetroHeaderIconKey,
} from "./utils/retro-station-icons.js";
import {
  RACE_FINISH_X_FALLBACK_CQW,
  computeRaceParams,
  type Racer,
} from "./utils/race.js";

import "./retro-editor.js";

type RaceState = "idle" | "countdown" | "racing" | "freeze" | "victory";
const VICTORY_DURATION_MS = 4000;
// Via / over alternation tick. When any visible row carries a `via`
// hint, the destination text cross-fades with `ÜBER {via}` every
// VIA_TICK_MS. Chosen at 4 s so each phase has time to register
// without the row feeling restless. Cross-fade duration lives in the
// CSS .retro-dest-text transition (0.4 s) — keep them in sync.
const VIA_TICK_MS = 4000;
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
// Message ticker — when `message_ticker` is on, the LED panel clears
// every MESSAGE_TICKER_INTERVAL_MS and scrolls `message_text` across
// once as a marquee. Enabling the toggle or editing the text
// reschedules a run after the short MESSAGE_TICKER_PREVIEW_DELAY_MS —
// a burst of keystrokes debounces (the scheduler clears its prior
// handle) into one near-instant in-editor preview. If a wheelchair
// race is mid-flight when the ticker is due, it retries after
// MESSAGE_TICKER_RACE_DEFER_MS.
const MESSAGE_TICKER_INTERVAL_MS = 5 * 60_000;
const MESSAGE_TICKER_PREVIEW_DELAY_MS = 1_500;
const MESSAGE_TICKER_RACE_DEFER_MS = 20_000;
// Race constants and physics live in `utils/race.ts`. The card keeps
// only the DOM-touching `_measureRaceStartPositions` and the timer
// state machine; the math is a pure function fed those measurements.

// Dedupe by `type` so a double-load (cache-bust race, HMR, etc.)
// doesn't surface the retro card twice in the picker.
{
  const win = window as unknown as WindowWithCustomCards;
  win.customCards = win.customCards ?? [];
  if (!win.customCards.some((c) => c["type"] === "wiener-linien-austria-retro-card")) {
    win.customCards.push({
      type: "wiener-linien-austria-retro-card",
      name: "Wiener Linien Austria — Retro",
      description: "LED-Anzeige im Stil der Wiener-Linien-Stationen",
      preview: true,
    });
  }
}

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
  // Message-ticker state. `_tickerActive` drives the marquee overlay;
  // `_tickerTimer` is the single repeating scheduler handle (cleared on
  // disconnect, re-armed on reconnect).
  @state() private _tickerActive = false;
  private _tickerTimer: ReturnType<typeof setTimeout> | null = null;
  // Via / over alternation. `_viaPhase` flips between "towards" and
  // "via" every VIA_TICK_MS so the destination text cross-fades to
  // `ÜBER {via}` when any visible row carries via routing. The
  // interval handle is held in `_viaTimer`; both are reset on
  // disconnect and re-armed on reconnect.
  @state() private _viaPhase: "towards" | "via" = "towards";
  private _viaTimer: ReturnType<typeof setInterval> | null = null;
  // Whether the last render saw any row carrying `via`. Written in
  // render() (a plain field — no reactive trigger) and consumed in
  // updated() to arm/clear the via timer as a post-render side effect.
  private _anyViaInRows = false;

  private _versionCheckDone = false;
  // One-shot flag so the "configured entity missing → fell back" console
  // warning doesn't spam on every re-render.
  private _fallbackWarned = false;
  // Resolved entity id cached across hass ticks — _resolveEntity is hot
  // path (called from both shouldUpdate and render) and was iterating
  // hass.states for the fallback path on every tick.
  private _cachedEid: string | null = null;
  private _raceTimers = new Set<ReturnType<typeof setTimeout>>();
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
    // Reset every timer / state-machine handle on config swap. Without
    // this, toggling `wheelchair_race` off mid-race leaves a victory
    // overlay + orphan timers ticking against absent CSS hooks, and
    // swapping the message text mid-marquee leaves `_tickerActive=true`
    // forever.
    this._clearRaceTimers();
    this._clearTickerTimer();
    this._clearViaTimer();
    this._raceState = "idle";
    this._countdownDigit = null;
    this._countdownStartAt = null;
    this._raceEndAt = null;
    this._freezeEndAt = null;
    this._victoryEndAt = null;
    this._raceWinner = null;
    this._tickerActive = false;
    this._fallbackWarned = false;
    this._cachedEid = null;
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

  public override connectedCallback(): void {
    super.connectedCallback();
    // Register the WL webfaces on document.head — see font-face.ts for
    // why Shadow-DOM @font-face can't be trusted on Android WebView.
    registerWlFonts();
    // Font-loading diagnostic. WL Mono is the authentic departure-board
    // face; the Courier-New fallback is visibly less accurate. If the
    // woff2 didn't land — fetch blocked, MIME misconfigured, integration
    // static path off — warn so installers don't silently end up on the
    // fallback. `document.fonts.ready` resolves once every pending
    // font-face has settled (loaded or errored); the check runs against
    // the actual computed availability at that point.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (!document.fonts.check('700 16px "WL Mono"')) {
            // eslint-disable-next-line no-console
            console.warn(
              '[wiener-linien-austria-retro-card] "WL Mono" 700 not loaded — falling back to Courier New (less authentic). Check /wiener-linien-austria/fonts/ is served by the integration.',
            );
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn(
            "[wiener-linien-austria-retro-card] document.fonts.ready rejected",
            err,
          );
        });
    }
    if (!this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
    // HA rebuilds the dashboard on load — the card gets detached and
    // re-attached mid-race. Re-arm transitions against wall-clock time.
    // Bail if the user toggled `wheelchair_race` off while the card was
    // detached: the state machine would otherwise tick uselessly for a
    // few seconds (CSS hides everything, but the timers run anyway).
    if (this._raceState !== "idle") {
      if (this._config?.wheelchair_race) {
        this._armStateTransitions();
      } else {
        this._raceState = "idle";
        this._clearRaceTimers();
      }
    }
    // Re-arm the message ticker after a detach/reattach (HA rebuilds
    // the dashboard on load). `updated()` won't fire when `_config` is
    // unchanged across the reconnect, so the repeating schedule has to
    // be re-established here. A scroll interrupted by the detach is
    // abandoned — reset the flag and let the interval queue the next.
    if (this._config?.message_ticker && this._config?.message_text) {
      this._scheduleTicker(MESSAGE_TICKER_INTERVAL_MS);
    }
    // Via timer is armed on demand from render() when a visible row
    // carries via routing — no unconditional arm here.
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearRaceTimers();
    this._clearTickerTimer();
    this._clearViaTimer();
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (
      changed.has("_config") ||
      changed.has("_versionMismatch") ||
      changed.has("_raceState") ||
      changed.has("_countdownDigit") ||
      changed.has("_raceWinner") ||
      changed.has("_tickerActive") ||
      changed.has("_viaPhase")
    ) {
      return true;
    }
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eid = this._resolveEntity();
    if (!eid) return false;
    return prev.states[eid] !== this.hass.states[eid];
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    // Arm/clear the via-tick timer as a post-render side effect. This must
    // NOT happen in render(): _clearViaTimer writes the reactive @state
    // `_viaPhase`, and mutating reactive state mid-render is forbidden by
    // Lit (dev warning + a redundant extra update cycle).
    if (this._anyViaInRows) this._armViaTimer();
    else if (this._viaTimer !== null) this._clearViaTimer();
  }

  protected override willUpdate(changed: PropertyValues): void {
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

    // Message ticker — "on" means the toggle is set AND there's text to
    // scroll, so clearing the message counts as turning the feature
    // off. Enabling it, or editing the text, reschedules a run for a
    // near-instant preview; the falling edge stops the schedule and
    // clears any in-flight scroll.
    const tickerWasOn = prev?.message_ticker === true && !!prev?.message_text;
    const tickerIsOn =
      this._config?.message_ticker === true && !!this._config?.message_text;
    const textChanged = prev?.message_text !== this._config?.message_text;
    if (tickerIsOn && (!tickerWasOn || textChanged)) {
      // Toggle just enabled, OR the message text changed (the user is
      // editing it). Drop any in-flight scroll and reschedule after a
      // short delay — _scheduleTicker clears the prior handle, so a
      // burst of keystrokes debounces into a single run once typing
      // pauses: a near-instant in-editor preview of the current text.
      this._tickerActive = false;
      this._scheduleTicker(MESSAGE_TICKER_PREVIEW_DELAY_MS);
    } else if (!tickerIsOn && tickerWasOn) {
      this._clearTickerTimer();
      this._tickerActive = false;
    }
  }

  private _t(key: string, replacements?: Record<string, string | number>): string {
    return translate(`retro.${key}`, { hassLanguage: this.hass?.language }, replacements);
  }

  private async _checkCardVersion(): Promise<void> {
    try {
      this._versionMismatch = await checkCardVersionWS(
        this.hass,
        "wiener_linien_austria/retro_card_version",
        RETRO_CARD_VERSION,
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        "[wiener-linien-austria-retro-card] version probe failed",
        err,
      );
    }
  }

  /** Cache-aware: returns the configured entity if it's in hass.states,
   *  else the first auto-discovered WL sensor as a fallback. Cached on
   *  this._cachedEid because both shouldUpdate and render call it on
   *  every hass tick — recomputing the fallback (which iterates
   *  hass.states) on every tick adds up on large dashboards. The cache
   *  is invalidated on setConfig and when the configured entity's
   *  presence in hass.states changes. */
  private _resolveEntity(): string | null {
    const configured = this._config?.entity;
    if (configured && this.hass?.states?.[configured]) {
      this._cachedEid = configured;
      return configured;
    }
    if (this._cachedEid && this.hass?.states?.[this._cachedEid]) {
      return this._cachedEid;
    }
    const available = findWienerLinienEntities(this.hass);
    const first = available[0] ?? null;
    if (first && configured && !this._fallbackWarned) {
      // Configured entity is gone (rename, integration removal). The
      // fallback keeps the card useful, but make the swap auditable so
      // the user notices their dashboard is now showing a different stop.
      this._fallbackWarned = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[wiener-linien-austria-retro-card] configured entity "${configured}" not in hass.states; falling back to "${first}"`,
      );
    }
    this._cachedEid = first;
    return first;
  }

  // ------------------------------------------------------------------
  // Wheelchair race scheduler
  // ------------------------------------------------------------------

  private _clearRaceTimers(): void {
    for (const t of this._raceTimers) clearTimeout(t);
    this._raceTimers.clear();
  }

  /** Schedule a timeout AND track it on `_raceTimers` so a teardown can
   *  cancel it. The handle self-removes on fire so the set doesn't
   *  accumulate dead handles between `_clearRaceTimers` calls. Use this
   *  in place of bare `setTimeout`. */
  private _scheduleRaceTimer(cb: () => void, delayMs: number): void {
    const handle = setTimeout(() => {
      this._raceTimers.delete(handle);
      cb();
    }, delayMs);
    this._raceTimers.add(handle);
  }

  private _scheduleRace(delayMs: number): void {
    this._scheduleRaceTimer(() => this._startRace(), delayMs);
  }

  // Click-to-race: tapping the card while idle kicks off a race
  // immediately, cancelling any pending auto-scheduled race. No-op
  // if the toggle is off, a race is already in progress, or
  // prefers-reduced-motion is set (matches the auto-loop's gating).
  private _handleCardClick = (): void => {
    // Tap to dismiss an active scrolling message — this is also the
    // WCAG 2.2.2 "hide" mechanism for the auto-starting marquee. The
    // next run is rescheduled at the normal interval.
    if (this._tickerActive) {
      this._tickerActive = false;
      this._scheduleTicker(MESSAGE_TICKER_INTERVAL_MS);
      return;
    }
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

  /** Keyboard equivalent of the tap handler — Enter or Space triggers
   *  the same path. Without this, keyboard-only users can't dismiss
   *  the marquee (WCAG 2.1.1) or start a race when wheelchair_race is
   *  on, even though the click handler exists. */
  private _handleCardKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    this._handleCardClick();
  };

  // ------------------------------------------------------------------
  // Message ticker scheduler
  // ------------------------------------------------------------------

  private _clearTickerTimer(): void {
    if (this._tickerTimer !== null) {
      clearTimeout(this._tickerTimer);
      this._tickerTimer = null;
    }
  }

  /** Arm the single ticker timer. Clears any pending handle first so
   *  the scheduler can never fan out into multiple overlapping runs. */
  private _scheduleTicker(delayMs: number): void {
    this._clearTickerTimer();
    this._tickerTimer = setTimeout(() => {
      this._tickerTimer = null;
      this._runTicker();
    }, delayMs);
  }

  /** Fire one marquee run — or defer it. The next run is armed by
   *  `_onTickerDone` (on animationend), so the interval counts from
   *  when a message finishes scrolling, not when it starts. */
  private _runTicker(): void {
    // Toggle flipped off / message cleared since the timer armed.
    if (!this._config?.message_ticker || !this._config?.message_text) return;
    // A wheelchair race owns the LED panel — wait it out, retry soon.
    if (this._raceState !== "idle") {
      this._scheduleTicker(MESSAGE_TICKER_RACE_DEFER_MS);
      return;
    }
    // A marquee is moving content — respect `prefers-reduced-motion`.
    // Skip the scroll for those users but keep the schedule alive so
    // it resumes if the preference changes later.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      this._scheduleTicker(MESSAGE_TICKER_INTERVAL_MS);
      return;
    }
    this._tickerActive = true;
  }

  private _onTickerDone = (): void => {
    this._tickerActive = false;
    this._scheduleTicker(MESSAGE_TICKER_INTERVAL_MS);
  };

  /** Scroll duration in seconds — proportional to message length so the
   *  reading pace stays roughly constant. Clamped so a one-word message
   *  still lingers and a maxed-out 160-char message doesn't crawl. */
  private _tickerDurationSeconds(text: string): number {
    return Math.min(40, Math.max(8, 5 + text.length * 0.18));
  }

  // ------------------------------------------------------------------
  // Via / over alternation
  // ------------------------------------------------------------------

  /** Arm the via-tick interval only when at least one visible row
   *  actually carries `via`. _viaPhase is in shouldUpdate's change-key
   *  list, so an always-on tick would re-render every retro card on
   *  every dashboard every VIA_TICK_MS — a non-trivial cost when
   *  multiplied across the board. Re-evaluated on hass / config tick
   *  via _evaluateViaTimer. */
  private _armViaTimer(): void {
    if (this._viaTimer !== null) return;
    this._viaTimer = setInterval(() => {
      this._viaPhase = this._viaPhase === "towards" ? "via" : "towards";
    }, VIA_TICK_MS);
  }

  private _clearViaTimer(): void {
    if (this._viaTimer !== null) {
      clearInterval(this._viaTimer);
      this._viaTimer = null;
    }
    this._viaPhase = "towards";
  }

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
    if (this._tickerActive) {
      // The message ticker owns the LED panel right now — defer the
      // race so the two LED takeovers never overlap.
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

  // Digit derives from elapsed wall-clock time so a disconnect /
  // reconnect mid-countdown resumes on the correct digit instead of
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
    this._scheduleRaceTimer(() => this._scheduleCountdownTick(), wait);
  }

  // Race-end / victory-end targets were computed once in _startRace
  // and aren't recomputed here — guarantees the winner badge matches
  // the animation that just played.
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
  // photo-finish freeze and then victory.
  private _randomizeRaceParams(): { winnerCrossT: number } {
    const measured = this._measureRaceStartPositions();
    const params = computeRaceParams({
      a: measured?.a ?? 0,
      b: measured?.b ?? 0,
      finishCqw: measured?.finishCqw ?? RACE_FINISH_X_FALLBACK_CQW,
    });
    this._raceWinner = params.winner;
    for (const [name, value] of Object.entries(params.cssVars)) {
      this.style.setProperty(name, value);
    }
    return { winnerCrossT: params.winnerCrossT };
  }

  // Safe to call repeatedly — clears prior timers first. Re-entered
  // on every state advance and on reconnect-mid-race.
  private _armStateTransitions(): void {
    this._clearRaceTimers();
    const now = Date.now();
    // Switch + exhaustive `never` check so a future RaceState arm
    // can't silently fall through with no timer armed.
    switch (this._raceState) {
      case "idle":
        return;
      case "countdown":
        if (this._countdownStartAt !== null) {
          // Reconnect-mid-countdown: resume from elapsed wall-clock.
          this._scheduleCountdownTick();
        }
        return;
      case "racing":
        if (this._raceEndAt !== null) {
          this._scheduleRaceTimer(() => {
            this._raceState = "freeze";
            this._raceEndAt = null;
            this._armStateTransitions();
          }, Math.max(0, this._raceEndAt - now));
        }
        return;
      case "freeze":
        if (this._freezeEndAt !== null) {
          this._scheduleRaceTimer(() => {
            this._raceState = "victory";
            this._freezeEndAt = null;
            this._armStateTransitions();
          }, Math.max(0, this._freezeEndAt - now));
        }
        return;
      case "victory":
        if (this._victoryEndAt !== null) {
          this._scheduleRaceTimer(() => {
            this._raceState = "idle";
            this._victoryEndAt = null;
            if (this._config?.wheelchair_race) {
              this._scheduleRace(this._nextRaceDelay());
            }
          }, Math.max(0, this._victoryEndAt - now));
        }
        return;
      default: {
        const _exhaustive: never = this._raceState;
        throw new Error(`unhandled race state: ${String(_exhaustive)}`);
      }
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

  protected override render(): TemplateResult | typeof nothing {
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
    // Side resolution: explicit user override wins over the auto rule
    // (platform "2" lands on the left, else right — the U-Bahn signage
    // convention). "auto" preserves pre-feature behaviour; "left" /
    // "right" let users mirror a real-station view that disagrees
    // with the heuristic (e.g. a tram stop where the published platform
    // is "1" but the user wants the GLEIS column on the left for
    // consistency with the next card on their dashboard).
    let gleisLeft: boolean;
    switch (cfg.platform_side) {
      case "left":
        gleisLeft = true;
        break;
      case "right":
        gleisLeft = false;
        break;
      default:
        gleisLeft = platform === "2";
    }
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
          cfg.line,
        )
      : nothing;
    // Master gate — when `show_header` is off (the default), the
    // strip is suppressed regardless of per-side config. This keeps
    // the per-side state in memory so toggling back on restores
    // exactly what the user had set.
    const stationHeader = cfg.show_header
      ? this._renderStationHeader(cfg.header_left, cfg.header_right, attrs.server_time)
      : nothing;

    const raceCountdown = cfg.wheelchair_race && this._raceState === "countdown";
    const raceActive = cfg.wheelchair_race && this._raceState === "racing";
    const raceFreeze = cfg.wheelchair_race && this._raceState === "freeze";
    const raceVictory = cfg.wheelchair_race && this._raceState === "victory";
    // Card is interactive when it can accept a tap to start a race OR
    // to dismiss the scrolling message — both paths are handled by
    // _handleCardClick / _handleCardKeydown.
    const clickable =
      (cfg.wheelchair_race && this._raceState === "idle") || this._tickerActive;
    const winnerLane: 1 | 2 | null =
      this._raceWinner === "A" ? 1 : this._raceWinner === "B" ? 2 : null;
    this._anyViaInRows = rows.some((d) => !!d.via);
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
      "retro--line-pill": cfg.line_pill,
      "retro--line-stripe": cfg.line_stripe,
      "retro--housing": cfg.housing,
    };

    // When the card is clickable, expose it as a button to assistive
    // tech (role + label) AND make it reachable via keyboard (tabindex +
    // keydown). Without the keyboard path, screen-reader / keyboard-only
    // users have no way to dismiss the marquee (WCAG 2.2.2) or start a
    // race — a WCAG 2.1.1 (Keyboard) + 4.1.2 (Name/Role/Value) fail.
    const interactiveAttrs = clickable
      ? {
          role: "button",
          tabindex: "0",
          "aria-label": this._tickerActive
            ? this._t("aria_dismiss_message")
            : this._t("aria_start_race"),
        }
      : {};
    return html`
      <ha-card style="padding:0;overflow:hidden;">
        <div
          class=${classMap(retroClasses)}
          role=${interactiveAttrs.role ?? nothing}
          tabindex=${interactiveAttrs.tabindex ?? nothing}
          aria-label=${interactiveAttrs["aria-label"] ?? nothing}
          @click=${this._handleCardClick}
          @keydown=${clickable ? this._handleCardKeydown : nothing}>
          ${renderVersionBanner(this._versionMismatch, (k) => this._t(k), "retro-banner")}
          ${stationHeader}
          ${stationPanel}
          <div class="retro-led">
            ${this._renderMain(eid, rows, departures, platform, platformLabel, attrs.server_time, attrs.line_colors ?? {})}
            ${this._tickerActive && cfg.message_text
              ? html`<div class="retro-ticker" role="status" aria-live="polite">
                  <div
                    class="retro-ticker-text"
                    style=${`animation-duration:${this._tickerDurationSeconds(
                      cfg.message_text,
                    )}s`}
                    @animationend=${this._onTickerDone}
                  >
                    ${cfg.message_text}
                  </div>
                </div>`
              : nothing}
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
    allDepartures: DepartureAttr[],
    platform: string | null,
    platformLabel: string,
    serverTime: string | null | undefined,
    lineColors: LineColorsMap,
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
    return html`
      <ul class="retro-rows" role="list" aria-label=${this._t("departures_list")}>
        ${rows.map((d, i) => this._renderRow(d, i, lineColors))}
      </ul>
      ${platform ? this._renderGleis(platform, platformLabel) : nothing}
    `;
  }

  /** Format an ISO timestamp as HH:MM in the user's locale. Returns
   *  `null` on missing / unparseable input so the caller can omit the
   *  rendering entirely instead of painting "NaN:NaN". Shared by the
   *  optional left- and right-side header clock chips. */
  private _formatClock(serverTime: string | null | undefined): string | null {
    return formatClock(serverTime);
  }

  /** Format an ISO timestamp as a PHP-style date string for the
   *  optional header date chip. Returns `null` when server_time is
   *  missing/unparseable or the format string is empty — caller
   *  omits the chip rather than painting an obvious placeholder. */
  private _formatDateChip(
    serverTime: string | null | undefined,
    format: string | undefined,
  ): string | null {
    if (!serverTime || !format) return null;
    const ts = Date.parse(serverTime);
    if (!Number.isFinite(ts)) return null;
    return formatDate(new Date(ts), format, this.hass?.language);
  }

  private _renderRow(d: DepartureAttr, rowIndex: number, lineColors: LineColorsMap): TemplateResult {
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const isAtPlatform = cd !== null && cd <= 0;
    const line = d.line || "?";
    const towards = d.towards || "";
    const via = typeof d.via === "string" && d.via.trim() ? d.via.trim() : null;
    const cdLabel =
      cd === null
        ? this._t("no_data")
        : isAtPlatform
          ? this._t("at_platform")
          : this._t("countdown_minutes", { n: String(cd) });
    const a11yLabel = d.barrier_free ? this._t("barrier_free_title") : "";
    const viaA11y = via ? `${this._t("via_prefix")} ${via}` : "";
    const rowLabel = [line, towards, viaA11y, cdLabel, a11yLabel].filter(Boolean).join(" — ");
    // Resolve the line's WL palette through the same precedence ladder
    // chips use elsewhere: GTFS routes.txt first, then the nightline
    // override, then a CSS-var fallback that doesn't read well on the
    // LED panel. Unknown lines fall back to amber for the stripe (so
    // it still looks at home on the board) and to white text on amber-
    // glow-substrate for the pill (the LED-amber gloss would dissolve
    // the digit). The resolved palette feeds two opt-in Tweaks:
    //   --retro-line-color — pill background AND stripe colour.
    //   --retro-line-fg    — pill foreground.
    // Both Tweaks default off; without them the line code renders as
    // plain amber text and the row matches the pre-Tweak look.
    const palette = chipPalette(line, {}, lineColors);
    const hasResolvedColor = palette.background !== "var(--primary-color)";
    const stripeColor = hasResolvedColor ? palette.background : "var(--led-amber)";
    const pillFg = palette.color ?? (hasResolvedColor ? "#fff" : "var(--led-bg)");
    const rowStyle = styleMap({
      "--row-i": String(rowIndex),
      "--retro-line-color": stripeColor,
      "--retro-line-fg": pillFg,
    });
    // Cross-fade towards ↔ via: render BOTH spans absolutely positioned
    // on top of each other, swap which one carries the visible-opacity
    // class on _viaPhase ticks. The fallback span keeps the row sized
    // (it sets the layout height) so the absolute pair don't collapse
    // to zero. When there's no via, the absolute pair are omitted and
    // the layout span carries the only label.
    const showVia = !!via;
    return html`
      <li class="retro-row" style=${rowStyle} aria-label=${rowLabel}>
        <div class="retro-line" aria-hidden="true">
          <span class="retro-line__label">${line}</span>
        </div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-stack">
            <span class="retro-dest-text retro-dest-text--layout">${deText(towards)}</span>
            ${showVia
              ? html`
                  <span
                    class=${classMap({
                      "retro-dest-text": true,
                      "retro-dest-text--absolute": true,
                      "retro-dest-text--visible": this._viaPhase === "towards",
                    })}
                  >${deText(towards)}</span>
                  <span
                    class=${classMap({
                      "retro-dest-text": true,
                      "retro-dest-text--absolute": true,
                      "retro-dest-text--via": true,
                      "retro-dest-text--visible": this._viaPhase === "via",
                    })}
                  >${this._t("via_prefix")} ${deText(via)}</span>
                `
              : nothing}
          </span>
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
              : this._config?.show_unit
                ? html`<span class="retro-cd-num">${cd}</span><span class="retro-cd-unit">${this._t("unit_min")}</span>`
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

  /** Render the black header strip above the orange station band —
   *  a homage to the real Wiener Linien U-Bahn station signage.
   *  Returns `nothing` when neither side is configured, so existing
   *  retro cards (no `header_left`/`header_right` in YAML) are
   *  byte-identical to pre-change behaviour.
   *
   *  Per-side render order — amenity order is mirrored so the same
   *  glyph always sits the same distance from the station name on
   *  both sides: elevator nearest the text, then escalator, then WC:
   *   - LEFT:  [exit] [text] [Elevator] [Escalator] [WC]
   *   - RIGHT: [WC] [Escalator] [Elevator] [text] [exit]
   *
   *  Exit-icon auto-flip: `exit` glyph natively points LEFT; on the
   *  right side it's flipped so the arrow points right. `exit-access`
   *  is the mirror case — natively points RIGHT, flipped on left.
   *  Users pick "regular" / "accessible" per side and the renderer
   *  derives orientation; no separate config knob. */
  private _renderStationHeader(
    left: RetroHeaderSide | undefined,
    right: RetroHeaderSide | undefined,
    serverTime: string | null | undefined,
  ): TemplateResult | typeof nothing {
    if (!left && !right) return nothing;
    return html`
      <div class="retro-station-header" role="group">
        <div class="retro-station-header__side retro-station-header__side--left">
          ${left ? this._renderHeaderSide(left, "left", serverTime) : nothing}
        </div>
        <div class="retro-station-header__side retro-station-header__side--right">
          ${right ? this._renderHeaderSide(right, "right", serverTime) : nothing}
        </div>
      </div>
    `;
  }

  private _renderHeaderSide(
    side: RetroHeaderSide,
    pos: "left" | "right",
    serverTime: string | null | undefined,
  ): TemplateResult {
    // Resolve the exit corner to a render node. Three paths:
    //   "regular" / "accessible" → WL traced SVG glyph (auto-flips
    //                              per side via glyphPointsTo).
    //   "mdi:…"                  → curated MDI icon inside the same
    //                              tile (auto-flip only for icons
    //                              whose registry entry declares a
    //                              `glyphPointsTo`).
    //   anything else            → no icon.
    let exitNode: TemplateResult | typeof nothing = nothing;
    if (side.exit === "regular" || side.exit === "accessible") {
      const key: "exit" | "exit-access" =
        side.exit === "regular" ? "exit" : "exit-access";
      exitNode = renderRetroHeaderIcon(key, {
        ariaLabel: this._t(`header.${RETRO_HEADER_ICONS[key].labelKey}`),
        // Glyph's native direction is `pointsTo`. Flip when the side
        // it sits on doesn't match — e.g. `exit` (points left) on the
        // right side flips to point right.
        flipX: RETRO_HEADER_ICONS[key].glyphPointsTo !== pos,
      });
    } else if (side.exit && isRetroHeaderMdiExit(side.exit)) {
      const meta = RETRO_HEADER_MDI_EXITS[side.exit];
      exitNode = renderRetroHeaderMdiIcon(side.exit, {
        ariaLabel: this._t(`header.${meta.labelKey}`),
        // Only directional MDI icons (exit-run / exit-to-app) declare
        // glyphPointsTo. Vehicle / amenity glyphs don't flip.
        flipX: meta.glyphPointsTo !== undefined && meta.glyphPointsTo !== pos,
      });
    }
    const textNode = side.text
      ? html`<span class="retro-station-header__text">${side.text}</span>`
      : nothing;
    const amenityKey = (key: RetroHeaderIconKey) =>
      renderRetroHeaderIcon(key, {
        ariaLabel: this._t(`header.${RETRO_HEADER_ICONS[key].labelKey}`),
      });
    const wc = side.show_wc ? amenityKey("wc") : nothing;
    const esc = side.show_escalator ? amenityKey("escalator") : nothing;
    const elv = side.show_elevator ? amenityKey("elevator") : nothing;
    // Free-form MDI tiles — same-tile styling as the curated MDI exit
    // variants (white square, --mdi padding modifier). Sit between
    // the WC tile and the text chips. Aria-label is the MDI key
    // itself, the closest semantic label we have without an
    // explicit per-row label field.
    const mdiTileNodes = (side.extra_icons ?? []).map((icon) =>
      renderRetroHeaderMdiTile(icon, icon),
    );
    const mdiTilesRightOrder = [...mdiTileNodes].reverse();
    // Text chips — same-height white boxes with dynamic width. Sit
    // beyond the MDI tiles (further from the sign text than any
    // amenity icon or extra icon) so they read as the outer-edge
    // content on each side. Mirrored across sides so chip[0] is
    // always the closest-to-extra-icons entry regardless of which
    // side it lives on.
    const chipNodes = (side.chips ?? []).map(
      (chipText) => html`<span class="retro-station-header__chip">${chipText}</span>`,
    );
    const chipsRightOrder = [...chipNodes].reverse();
    // Optional clock + date chips — `show_clock` / `show_date` per
    // side. Both sit beyond the chips at the innermost edge of their
    // side (rightmost on `left`, leftmost on `right`). Order from
    // outermost to innermost: chips → date → clock. So when a side
    // enables both, the time is closest to the centre of the strip
    // (the primary station-board info), with the supporting date
    // one slot further out. Suppressed if server_time hasn't arrived
    // yet (no "NaN:NaN" while the integration warms up) or if the
    // user's format string evaluates empty.
    const clockText = side.show_clock ? this._formatClock(serverTime) : null;
    const clockNode = clockText
      ? html`<span class="retro-station-header__chip retro-station-header__chip--clock">
          <ha-icon class="retro-station-header__chip-icon" icon="mdi:clock-outline"></ha-icon>
          <span>${clockText}</span>
        </span>`
      : nothing;
    const dateText = side.show_date
      ? this._formatDateChip(serverTime, side.date_format ?? "d.m.Y")
      : null;
    // Date chip — text-only, no leading icon. The calendar glyph fought
    // the chip's signage-label voice (it read more like a UI element
    // than part of the sign); plain text matches the user-provided
    // chips in the same lane. The clock chip keeps its icon because
    // the icon there reads as the station-clock symbol, not a UI
    // affordance.
    const dateNode = dateText
      ? html`<span class="retro-station-header__chip retro-station-header__chip--date">${dateText}</span>`
      : nothing;
    // Canonical render order mirrors the original signage. Right side
    // mirrors the left: exit always at the outer edge of the card,
    // amenities ordered so the *same* glyph (elevator) is always
    // closest to the text on both sides — wheelchair-relevant info
    // gets the same visual prominence regardless of header side.
    // Mirror invariant for extra_icons + chips: index 0 of either
    // array sits closest to the WC tile on both sides. Date and
    // clock chips sit at the innermost edge: date one slot out,
    // clock at the very edge so time stays closest to the centre.
    return pos === "left"
      ? html`${exitNode}${textNode}${elv}${esc}${wc}${mdiTileNodes}${chipNodes}${dateNode}${clockNode}`
      : html`${clockNode}${dateNode}${chipsRightOrder}${mdiTilesRightOrder}${wc}${esc}${elv}${textNode}${exitNode}`;
  }

  private _renderStationName(
    stopName: string,
    matching: DepartureAttr[],
    allDepartures: DepartureAttr[],
    bgChoice: "default" | "white" | "black",
    lineColors: NonNullable<WienerLinienAttrs["line_colors"]>,
    configuredLine: string | undefined,
  ): TemplateResult {
    let bg: string;
    let fg: string;
    if (bgChoice === "white") {
      bg = "#fff";
      fg = "#000";
    } else if (bgChoice === "black") {
      bg = "#000";
      fg = "#fff";
    } else {
      // Default: tint the station tile with the selected line's
      // Wiener-Linien-published palette. Goes through chipPalette so
      // the precedence rules elsewhere on the card carry over —
      // notably the nightline rule (`^N\d`), which overrides the
      // GTFS bus-navy with the deeper signage navy + bright yellow
      // numerals so N-prefix tiles match the in-station NightLine
      // signage.
      //
      // Source-line precedence: configured cfg.line wins over live
      // departures so a nightline configured during the day still
      // tints the panel in nightline-blue (no live U-Bahn rows would
      // otherwise overwrite it with U-Bahn-red). Falls back to the
      // first live departure when no line is configured. Final fall-
      // through is white — chipPalette's `var(--primary-color)` floor
      // reads poorly on the LED aesthetic.
      const pool = matching.length ? matching : allDepartures;
      const sourceLine = configuredLine || pool[0]?.line;
      if (sourceLine) {
        // No user line_colors overrides on the retro tile — the panel
        // follows upstream branding only. Pass {} for overrides.
        const palette = chipPalette(sourceLine, {}, lineColors);
        bg = palette.background;
        fg = palette.color ?? "#fff";
        // chipPalette's bottom-tier fallback is a CSS var that doesn't
        // print well on the LED aesthetic — promote to white if the
        // line is unknown to GTFS / not a nightline / no override.
        if (bg === "var(--primary-color)") {
          bg = "#fff";
          fg = "#000";
        }
      } else {
        bg = "#fff";
        fg = "#000";
      }
    }

    return html`
      <div class="retro-station" style=${styleMap({ background: bg, color: fg })}>
        <div class="retro-station-name">${deText(stopName)}</div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------------

  static override styles = css`
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
      /* WL Mono is the subsetted TeX Gyre Cursor face shipped with
         this integration — Courier-metric so the Courier New stack is
         a clean fallback during the woff2 fetch window. The bold
         variant ships separately so weight: 700 picks up real glyphs
         instead of faux-bold synthesis. */
      font-family: "WL Mono", "Courier New", Courier, monospace;
      font-weight: 700;
      letter-spacing: 0.08em;
      overflow: hidden;
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
      /* <ul> for semantic departure list — reset UA list chrome. */
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .retro-row {
      display: grid;
      grid-template-columns: 2.5em 1fr auto;
      /* Baseline alignment — not center. Both grid cells render the
         same uppercase WL Mono at the same font-size, so aligning by
         alphabetic baseline makes the cap-tops line up automatically
         (by construction, not by tuning). Center alignment used to
         centre the cells' BOXES, but WL Mono's uppercase glyphs sit
         in the upper-middle of their line-box — so identical boxes
         centred geometrically still showed mismatched visible ink.
         Baseline alignment retires both empirical translateY hacks
         that used to live on the pill and its inner label. */
      align-items: baseline;
      gap: 12px;
      white-space: nowrap;
      /* Position context for the line-stripe ::before Tweak and the
         absolute via-cross-fade pair inside .retro-dest. */
      position: relative;
    }
    .retro-line {
      /* Default (no Tweak): plain amber text, left-aligned. The pill
         layout below kicks in only under .retro--line-pill so the
         pre-Tweak look is byte-identical. Center alignment matches
         the row's align-items: center so the line cell vertically
         lines up with the destination text and countdown digits. */
      font-weight: 400;
      text-align: left;
      transition: opacity 0.15s ease-out;
    }
    /* Line-pill Tweak — render the line code inside a filled rounded
       rectangle using --retro-line-color (resolved per row in JS).
       Structural decisions (NOT empirical magic numbers — see below
       for the history):
       1. align-items: baseline (inherited from .retro-row). Pill text
          shares its baseline with the destination text in the next
          grid cell; same font + same size means cap-tops line up by
          construction. No translateY needed.
       2. NO fixed height. Pill grows from symmetric em padding
          around its inner label, so the visual capsule is always
          centred top-to-bottom on the text. Previous height: 1em
          made the pill BOX drift relative to its visible glyph,
          which every per-em translateY hack was empirically fighting.
       3. NO transform optical-nudge. Earlier passes tried -0.05em,
          0, +0.03em on the pill and -0.04em, 0, +0.08em on the
          label; baseline alignment retires all of them.
       Padding 0.08em block / 0.4em inline is the design spec; em
       sizing lets medium / small variants inherit proportions
       automatically. */
    .retro--line-pill .retro-line {
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      box-sizing: border-box;
      font-weight: 700;
      text-align: center;
      min-width: 2em;
      padding: 0.08em 0.4em;
      border-radius: 0.18em;
      background: var(--retro-line-color, transparent);
      color: var(--retro-line-fg, var(--led-amber));
      text-shadow: none;
      box-shadow: 0 0 6px var(--retro-line-color, rgb(var(--led-glow-rgb) / 0.4));
    }
    .retro--line-pill .retro-line__label {
      /* Kept as a render-time wrapper so the markup stays uniform
         across pill and non-pill modes (the renderer always emits
         the span — keying off it from --race-victory or future
         tweaks stays cheap). inline-block makes the span a valid
         transform target if a future tweak needs one; currently no
         transform is applied because baseline alignment on the
         grid row handles centring structurally. */
      display: inline-block;
    }
    .retro-dest {
      display: flex;
      align-items: center;
      gap: 0.35em;
      /* No overflow: hidden on the flex container itself — the
         destination-text stack carries its own overflow:hidden /
         text-overflow:ellipsis, and clipping at this level would
         shave the bottom off the wheelchair icon at the row's
         right edge. Keeping overflow visible lets the icon render
         in full while the text inside still ellipsises. */
      text-transform: uppercase;
      min-width: 0;
      transition: opacity 0.15s ease-out;
    }
    /* Stack the towards / via labels on top of each other. The
       --layout span occupies the row height (so the row never
       collapses on cross-fade); the two --absolute spans sit on top
       and swap visibility via --visible. Rows with no via payload
       skip the absolute pair entirely and render only the layout span,
       so existing dashboards are unaffected. */
    .retro-dest-stack {
      position: relative;
      display: inline-block;
      overflow: hidden;
      flex: 0 1 auto;
      min-width: 0;
      max-width: 100%;
    }
    .retro-dest-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
      max-width: 100%;
      display: block;
    }
    .retro-dest-text--layout {
      /* Sized but invisible while via-cross-fade is mounted — the two
         absolute siblings carry the painted text. A row without a via
         payload omits the absolute pair, so the layout span stays
         visible and renders the towards text directly. */
      visibility: visible;
    }
    .retro-dest-stack:has(.retro-dest-text--absolute) .retro-dest-text--layout {
      visibility: hidden;
    }
    .retro-dest-text--absolute {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
      will-change: opacity;
    }
    .retro-dest-text--visible {
      opacity: 1;
    }
    .retro-wheelchair {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* Sized slightly smaller than 1em so the icon sits comfortably
         inside the row's line-height: 1 box with the row centred —
         a full-em icon was clipping at the bottom under the previous
         overflow:hidden + baseline-translate combo on smaller sizes. */
      --mdc-icon-size: 0.9em;
      width: 0.9em;
      height: 0.9em;
      color: inherit;
      filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
      /* Optical-centre correction. WL Mono is a Courier-derived face
         with a tall ascender / shallow descender, so uppercase glyphs
         (SIMMERING) sit in the upper-middle of their line-box. An
         icon centred in the line-box geometrically ends up visibly
         above the cap-height of the text next to it. Nudging the
         icon down ~0.12em lands its visual centre on the cap-height
         centre of the adjacent SIMMERING glyphs. */
      transform: translateY(0.12em);
    }
    .retro-cd {
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 2.5em;
      transition: opacity 0.4s ease-out;
      display: inline-flex;
      align-items: baseline;
      justify-content: flex-end;
      gap: 0.25em;
    }
    .retro-cd-num {
      /* Holds the tabular-nums alignment for the digit while letting
         the unit sit at a smaller size next to it without throwing off
         the right-edge alignment of the column. */
      display: inline-block;
    }
    .retro-cd-unit {
      /* Small amber-caps unit ("min") trailing the countdown number.
         Tied to em so it tracks the row's font-size token. Hidden at
         narrow widths via a container query below — the row prefers
         to surrender the unit over the destination text when room is
         tight. The text-shadow inherited from .retro-rows is already
         the right glow, so no overrides here. */
      display: inline-block;
      font-size: 0.5em;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      opacity: 0.85;
      transform: translateY(-0.05em);
    }
    @container (inline-size < 360px) {
      .retro-cd-unit { display: none; }
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
      /* LED prep: countdown, racing, and the photo-finish freeze all
         share the same row-clearing + overflow-visible setup. */
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
    /* Message-ticker overlay — when \`message_ticker\` is on, this fills
       the LED panel every few minutes and scrolls \`message_text\`
       across once as a marquee, then removes itself (animationend → a
       JS handler clears _tickerActive). Opaque --led-bg plus the same
       substrate dot-pattern as .retro-led so the departures vanish
       cleanly and the panel material stays consistent. z-index 16
       keeps it below the countdown (18) / victory (20) AND below the
       pixel screen-door ::after (30), so in pixel style the scrolling
       text is dotted like the rest of the board. */
    .retro-ticker {
      position: absolute;
      inset: 0;
      z-index: 16;
      overflow: hidden;
      display: flex;
      align-items: center;
      pointer-events: none;
      background: var(--led-bg);
      background-image: radial-gradient(
        circle,
        var(--led-substrate) var(--led-dot-size),
        transparent var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      border-radius: inherit;
      /* Query container so the scroll keyframes can start the text one
         full panel-width off the right edge via 100cqw. */
      container-type: inline-size;
    }
    .retro-ticker-text {
      /* flex: none keeps the text's natural (over-wide) width — the
         parent's overflow:hidden clips it. The parent's align-items:
         center handles vertical centring, so the keyframes touch only
         translateX and never fight a translateY. */
      flex: none;
      white-space: nowrap;
      /* Match the departure rows: same amber, glow, size and uppercase
         board lettering. Font, weight and tracking inherit from .retro. */
      font-size: 1.9em;
      line-height: 1;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      text-transform: uppercase;
      will-change: transform;
      animation-name: retroTickerScroll;
      animation-timing-function: linear;
      animation-iteration-count: 1;
      /* both → text waits off-screen-right before the run and rests
         off-screen-left after it, with no flash at the layout origin.
         animation-duration is set inline, scaled to message length. */
      animation-fill-mode: both;
    }
    @keyframes retroTickerScroll {
      /* Start one full panel-width off the right (100cqw), end one
         full text-width off the left (-100%). */
      from { transform: translateX(100cqw); }
      to   { transform: translateX(-100%); }
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
      /* +10% over the previous 41cqmin / 82px / 172px sizing so the
         trophy + lane number have more breathing room inside the LED
         ring without crowding the embossed numerals. */
      width: 45cqmin;
      height: 45cqmin;
      min-width: 90px;
      min-height: 90px;
      max-width: 190px;
      max-height: 190px;
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
    /* Lane number on the trophy cup. Coloured with --led-substrate (the
       same dot colour the rest of the panel uses for unlit pixels) so
       the digit reads as a hole punched out of the trophy's lit amber
       — matching the dotted-board / Punktmatrix aesthetic across all
       three style variants. No text-shadow / embossing: with the
       substrate-tone digit, any lit-edge highlight reads as a halo
       around a "missing pixel" hole, which is the wrong material. */
    .retro-winner-num {
      position: absolute;
      top: 44%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      text-align: center;
      font-family: "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-weight: 900;
      /* -10% from the previous 22cqmin so the digit sits inside the
         cup bowl rather than overflowing onto the trophy stem. */
      font-size: 20cqmin;
      line-height: 1;
      color: var(--led-substrate);
      letter-spacing: -0.04em;
      pointer-events: none;
    }
    /* Tighter on the small variant so trophy + number still fit. */
    .retro--size-small .retro-winner-trophy {
      --mdc-icon-size: 51cqmin;
    }
    .retro--size-small .retro-winner-num {
      /* -10% from the previous 19cqmin, same rationale as base. */
      font-size: 17cqmin;
      /* On small the badge hits its 82px min-width while the trophy
         icon scales down independently — so the cup ends up a touch
         higher in the badge than on regular/medium. Nudge the number
         up the same amount so it lands on the cup body, not below it. */
      top: 37%;
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
      transition: opacity 0.4s ease-out;
      /* Position context for the dotted-divider pseudo. The previous
         border-left: 1px hairline read as a CSS edge, not LED material.
         A 2 px-wide column painted with the same substrate radial-
         gradient as the panel renders the divider as missing pixels —
         i.e. an unlit column on the dot-matrix. Pitch + dot size + dot
         edge inherit from the same custom properties .retro-led uses
         (4 px classic, 3 px warm / pixel) so the column always lines
         up with the substrate behind it. */
      position: relative;
    }
    .retro-gleis::before {
      content: '';
      position: absolute;
      top: 8%;
      bottom: 8%;
      left: 0;
      width: 2px;
      background-image: radial-gradient(
        circle,
        rgb(var(--led-glow-rgb) / 0.55) var(--led-dot-size),
        transparent var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      pointer-events: none;
    }
    .retro--gleis-left .retro-gleis {
      padding: 0 18px 0 14px;
      margin-left: 0;
      margin-right: 12px;
    }
    .retro--gleis-left .retro-gleis::before {
      left: auto;
      right: 0;
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

    /* ----- Station header strip -----------------------------------
       A homage to the real Wiener Linien U-Bahn station signage —
       a black band above the orange station name with per-side
       exit / amenity icons + a destination label. Colours are
       hardcoded (#000 / #fff) on purpose: the original signage is
       intentionally black-and-white, the same authenticity rule the
       .retro-station rule above follows. Spacing flows through HA
       Design System tokens with px fallbacks per
       ha-portfolio-design (§ 4). */
    .retro-station-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #000;
      color: #fff;
      padding: var(--ha-spacing-2, 8px) var(--ha-spacing-3, 12px);
      gap: var(--ha-spacing-2, 8px);
      /* WL Sans Condensed is the subsetted TeX Gyre Heros Cn face —
         the condensed proportion matches real Wiener Linien station
         signage. Ships only at weight 700 (the only weight the
         signage uses); a regular-weight request would fall through
         to WL Sans regular, then the Apple system stack. */
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
                   BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
                   Arial, sans-serif;
      font-weight: 700;
      /* 1.1em (up from 1em): more device pixels per glyph is the only
         lever that genuinely de-steps the small condensed signage text
         on every engine — CSS antialiasing can't. The whole strip is
         em-based (text, chips, tiles), so this one knob scales it all
         together. The retro--size-medium / -small variants below carry
         their own absolute em values and are unaffected. */
      font-size: 1.1em;
      letter-spacing: 0.02em;
    }
    .retro-station-header__side {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1 1 0;
    }
    .retro-station-header__side--right {
      justify-content: flex-end;
    }
    .retro-station-header__text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      /* Bumped from inherited 1em — WL Sans Condensed is ~25% narrower
         than the regular Apple-stack sans, so the sign text can scale
         up without crowding the amenity tiles next to it. Stays
         proportional with the retro--size-* tokens because the parent
         .retro-station-header's font-size scales (1em / 0.9em / 0.8em),
         and this multiplier compounds on top. */
      font-size: 1.2em;
      /* White-on-black signage text — render it with grayscale
         antialiasing instead of subpixel. On a dark strip subpixel AA
         fringes the glyph edges and blooms the condensed strokes
         heavier than drawn; grayscale keeps them crisp. Scoped to this
         element (NOT the strip) on purpose: the chips and WC monogram
         are black-on-white, the opposite polarity, and keep the
         default subpixel AA which renders dark-on-light more solidly.
         A WebKit/Blink-on-macOS + iOS lever only — the Android System
         WebView always uses grayscale AA, so it's a no-op there. */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .retro-station-header__tile {
      /* White SQUARE tile hosting the (black) glyph — mirrors the
         real Wiener Linien station signage where each icon sits on
         a small white square within the black header strip. The
         square aspect is non-negotiable per the reference photo;
         the inner SVG fits via preserveAspectRatio=meet so portrait
         glyphs (elevator) and landscape glyphs (exit, wc) both
         centre cleanly inside the same square.
         Default 0.12em padding suits the WL-traced glyphs and the
         WC monogram — their authored paths use the full viewBox so a
         small white margin matches the look of the real station-sign
         photos. The --mdi modifier overrides to a tighter padding
         (see rule below) because MDI icons carry their own viewBox
         padding internally. */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      color: #000;
      flex-shrink: 0;
      width: 1.4em;
      height: 1.4em;
      padding: 0.12em;
      box-sizing: border-box;
    }
    .retro-station-header__tile--mdi {
      /* MDI glyphs ship with ~10% internal viewBox padding baked
         into the icon set, so the default tile padding stacks on top
         and makes them look noticeably smaller than the WL-traced
         tiles next to them. Halving the tile padding to 0.06em
         compensates — the rendered glyph ends up the same visual
         weight as a WL-traced glyph in a default-padded tile. */
      padding: 0.06em;
    }
    .retro-station-header__icon {
      width: 100%;
      height: 100%;
      display: block;
      /* SVG default fill is black per spec, but be explicit so the
         tile's color: #000 propagates if a future glyph adopts
         fill=currentColor. */
      fill: currentColor;
    }
    .retro-station-header__icon--flip-x {
      transform: scaleX(-1);
    }
    .retro-station-header__mdi {
      /* MDI variant sibling to .retro-station-header__icon. ha-icon
         renders an inline SVG sized by the --mdc-icon-size token; we
         pin it to fill the tile's content box (1.4em tile − 2 ×
         0.06em padding = 1.28em). Color cascades from the tile's
         color: #000 via ha-icon's currentColor fill. */
      --mdc-icon-size: 1.28em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
    }
    .retro-station-header__mdi--flip-x {
      transform: scaleX(-1);
    }
    .retro-station-header__monogram {
      /* WC tile content. Tile is already flex-centred, so the span
         positions itself. font-size is 0.9em — em-tied so it
         scales with the parent header's em-scale (1em / 0.9em /
         0.8em via retro--size-* tokens), shrunk ~10 % from the
         original 1em so the W / C letterforms don't overpower the
         surrounding amenity glyphs (the WL signage WC monogram
         reads as a small, paired label, not a heavyweight chip).
         font-family + weight are declared explicitly (rather than
         relying on inheritance from .retro-station-header) so a
         future header-rule rewrite can't accidentally regress the
         letterforms back to a non-condensed face. */
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
                   BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
                   Arial, sans-serif;
      font-weight: 700;
      font-size: 0.9em;
      line-height: 1;
    }
    .retro-station-header__chip {
      /* Auxiliary text label — same height as the icon tiles
         (1.4em) but with dynamic width so short labels (platform
         numbers, line designators) sit in a snug white box and
         longer labels grow horizontally. Composes visually with the
         icon tiles next to it via the same height + colour scheme.
         Padding is horizontal-only — the flex-centred line shares
         vertical alignment with the icon glyphs on the same row.
         Font is WL Sans Condensed 700 — the SAME signage face as the
         destination text and WC monogram. The strip is a signage
         homage; one coherent typographic voice across the whole band
         reads "station sign", whereas a regular-width or lighter face
         reads "web UI element stuck onto a sign".
         No explicit font-size: chip inherits the parent header's
         em-scale (1em / 0.9em / 0.8em via retro--size-* tokens), so
         height: 1.4em resolves to the SAME pixel value as the icon
         tiles. Setting a different font-size here (e.g. 0.75rem)
         would produce visibly shorter chips next to the tiles
         because em is relative to the element's own font-size. */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      color: #000;
      flex-shrink: 0;
      height: 1.4em;
      padding: 0 0.4em;
      box-sizing: border-box;
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
                   BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
                   Arial, sans-serif;
      /* 700 — WL Sans Condensed ships only at 700, and that IS the
         intent: chips should read as solid signage, not as a lighter
         UI tier. Hierarchy on the strip comes from size and position
         (the destination text is condensed 1.2em), never from mixing
         weight or width onto the same band. */
      font-weight: 700;
      line-height: 1;
      /* Reset the 0.02em letter-spacing inherited from .retro-station-header
         — the tracked-out feel of the header text doesn't suit
         chip-style labels where width is dynamic and longer entries
         (Schlafzimmer, etc.) add up visibly. */
      letter-spacing: 0;
      white-space: nowrap;
    }
    /* Size-token alignment — match the .retro--size-* scale. */
    .retro--size-medium .retro-station-header {
      font-size: 0.9em;
      padding: 6px var(--ha-spacing-2, 10px);
    }
    .retro--size-small .retro-station-header {
      font-size: 0.8em;
      padding: 5px var(--ha-spacing-2, 8px);
    }
    /* Narrow-width reflow (WCAG 1.4.10 AA) — drop the destination
       label so the icons stay visible at a 320 px section-view
       column. Unnamed container query — matches the nearest
       inline-size container, which is .retro (the outer wrapper).
       The size containers on overlays are not ancestors of the
       header strip, so they don't interfere. */
    @container (inline-size < 320px) {
      .retro-station-header__text {
        display: none;
      }
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

    /* First-paint stagger — LED rows cascade in on mount via
       per-row style="--row-i: N"; capped at 6 so long boards don't
       take ages to settle. Collapsed to instant by the
       prefers-reduced-motion catch-all below. */
    @keyframes retroRowReveal {
      from {
        opacity: 0;
        transform: translateY(3px);
        filter: brightness(0.4);
      }
      to {
        opacity: 1;
        transform: none;
        filter: brightness(1);
      }
    }
    .retro-row {
      animation: retroRowReveal 380ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
      animation-delay: calc(min(var(--row-i, 0), 6) * 80ms);
    }

    /* Optional clock chip inside the station-header strip. Renders
       as a base .retro-station-header__chip (white box, black text,
       condensed WL signage face) with a small clock glyph in front
       of the HH:MM digits. Inherits everything else from the chip
       rule — no font / weight / spacing override here, so it sits
       indistinguishably next to the other chips except for the
       leading icon. */
    .retro-station-header__chip--clock {
      gap: 0.25em;
    }
    .retro-station-header__chip-icon {
      /* MDI icon sized to the chip's cap height so it sits centred
         next to the digits. ha-icon ships an inline SVG controlled
         by --mdc-icon-size; pin it to 1em and let the chip's flex
         centring handle vertical alignment. */
      --mdc-icon-size: 1em;
      display: inline-flex;
      align-items: center;
      color: inherit;
      flex-shrink: 0;
    }

    /* Line-stripe Tweak — 4 px coloured bar at the left edge of each
       row in the line's resolved colour with a faint matching glow.
       --retro-line-color is the same var the line pill paints with, so
       the stripe always matches the pill (one source of truth). */
    .retro--line-stripe .retro-row {
      padding-left: 10px;
    }
    .retro--line-stripe .retro-row::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      background: var(--retro-line-color, var(--led-amber));
      filter: drop-shadow(0 0 4px var(--retro-line-color, rgb(var(--led-glow-rgb) / 0.45)));
      pointer-events: none;
      border-radius: 1px;
    }

    /* Housing Tweak — wrap the LED panel in an outer dark frame with
       a soft inner highlight and a glass-reflection gradient over
       the display. Defaults off; existing dashboards keep their
       flush edge-to-edge look. */
    .retro--housing {
      padding: 6px;
      background: #111;
      border-radius: 10px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.5);
    }
    .retro--housing .retro-led {
      border-radius: 6px;
    }
    /* Glass reflection — a 30 % top gradient sitting OVER the LED
       content (z=2). 4 % white is subtle enough to not wash out the
       row text but reads as a real reflection on a glossy bezel. */
    .retro--housing .retro-led::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%);
      pointer-events: none;
      z-index: 2;
      border-radius: inherit;
    }
    /* Housing-on station header and station name plate also pick up
       the inner border-radius so the bezel corners look right. */
    .retro--housing .retro-station-header {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    .retro--housing .retro-station:last-child,
    .retro--housing .retro-station-header:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
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
