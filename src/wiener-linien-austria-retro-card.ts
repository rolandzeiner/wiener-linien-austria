import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { LINE_TYPE_BUS_DAY, LINE_TYPE_BUS_NIGHT, LINE_TYPE_METRO, METRO_COLORS, RETRO_CARD_VERSION } from "./const.js";
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

type RaceState = "idle" | "racing" | "victory";
const VICTORY_DURATION_MS = 4000;
const NEXT_RACE_MIN_MS = 60_000;
const NEXT_RACE_MAX_MS = 180_000;
// Nailbiter racing — each race picks a lead-change pattern (who's ahead
// at 25%, 50%, 75%) so there's at least one overtake per race. Winner of
// the last checkpoint gets the shorter duration.
type Racer = "A" | "B";
const RACE_PATTERNS: ReadonlyArray<readonly [Racer, Racer, Racer]> = [
  ["A", "A", "B"], ["B", "B", "A"],   // single late swap
  ["A", "B", "B"], ["B", "A", "A"],   // single mid swap
  ["A", "B", "A"], ["B", "A", "B"],   // double swap (ping-pong)
];
const RACE_END_OFFSET_MIN_PX = 40;
const RACE_END_OFFSET_MAX_PX = 120;
// Winner duration range (shorter), loser runs 150-400ms longer so the
// finish reads as "close but decisive".
const RACE_WINNER_MIN_MS = 2900;
const RACE_WINNER_MAX_MS = 3100;
const RACE_LOSER_LAG_MIN_MS = 150;
const RACE_LOSER_LAG_MAX_MS = 400;
// Checkpoint x positions in cqw. Leader is ahead, trailer is behind;
// the gap is big enough that overtakes read clearly without making the
// slope change at each waypoint look like a pause. Positions are near-
// proportional to time so adjacent-segment slopes stay similar.
const RACE_CHECKPOINTS: ReadonlyArray<readonly [number, number]> = [
  [28, 22], // 25%: [lead, trail]
  [53, 48], // 50%
  [78, 73], // 75%
];

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

  private _versionCheckDone = false;
  private _raceTimers: Array<ReturnType<typeof setTimeout>> = [];
  // Wall-clock target times so state transitions survive the disconnect/
  // reconnect cycles HA triggers during dashboard rebuilds.
  private _raceEndAt: number | null = null;
  private _victoryEndAt: number | null = null;

  public setConfig(config: WienerLinienRetroCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("wiener-linien-austria-retro-card: config must be an object");
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
    return {
      columns: 6,
      rows: "auto",
      min_columns: 4,
      min_rows: 2,
    };
  }

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement("wiener-linien-austria-retro-card-editor");
  }

  public static getStubConfig(hass: HomeAssistant): WienerLinienRetroCardConfig {
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
      type: "custom:wiener-linien-austria-retro-card",
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
      changed.has("_raceState")
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
      this._raceEndAt = null;
      this._victoryEndAt = null;
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
    const maxDur = this._randomizeRaceParams();
    this._raceState = "racing";
    const now = Date.now();
    this._raceEndAt = now + maxDur;
    this._victoryEndAt = this._raceEndAt + VICTORY_DURATION_MS;
    this._armStateTransitions();
  }

  // Picks a random lead-change pattern plus per-racer duration and end
  // offset, then writes them as CSS custom properties on the host so the
  // keyframes can read them via var(). Winner is the racer leading at the
  // 75% checkpoint; winner gets the shorter duration and bigger end
  // offset so they visibly cross the finish first. Returns the longer of
  // the two durations so the state machine waits for the slower racer to
  // exit before flipping to victory.
  private _randomizeRaceParams(): number {
    const rand = (min: number, max: number): number =>
      min + Math.random() * (max - min);
    const jitter = (base: number, amount: number): number =>
      base + (Math.random() * 2 - 1) * amount;

    const pattern = RACE_PATTERNS[Math.floor(Math.random() * RACE_PATTERNS.length)]!;
    const winner = pattern[2];

    const winnerDur = rand(RACE_WINNER_MIN_MS, RACE_WINNER_MAX_MS);
    const loserDur = winnerDur + rand(RACE_LOSER_LAG_MIN_MS, RACE_LOSER_LAG_MAX_MS);
    const durA = winner === "A" ? winnerDur : loserDur;
    const durB = winner === "B" ? winnerDur : loserDur;

    // Winner gets the larger end offset so the exit frame reads as
    // "pulled away at the line". Loser gets a more modest one.
    const endSpan = RACE_END_OFFSET_MAX_PX - RACE_END_OFFSET_MIN_PX;
    const endA = winner === "A"
      ? rand(RACE_END_OFFSET_MIN_PX + endSpan * 0.6, RACE_END_OFFSET_MAX_PX)
      : rand(RACE_END_OFFSET_MIN_PX, RACE_END_OFFSET_MIN_PX + endSpan * 0.4);
    const endB = winner === "B"
      ? rand(RACE_END_OFFSET_MIN_PX + endSpan * 0.6, RACE_END_OFFSET_MAX_PX)
      : rand(RACE_END_OFFSET_MIN_PX, RACE_END_OFFSET_MIN_PX + endSpan * 0.4);

    const posFor = (racer: Racer, idx: 0 | 1 | 2): number => {
      const [lead, trail] = RACE_CHECKPOINTS[idx]!;
      const base = pattern[idx] === racer ? lead : trail;
      return jitter(base, 1);
    };

    this.style.setProperty("--race-a-duration", `${durA}ms`);
    this.style.setProperty("--race-b-duration", `${durB}ms`);
    this.style.setProperty("--race-a-end", `${endA}px`);
    this.style.setProperty("--race-b-end", `${endB}px`);
    this.style.setProperty("--race-a-x-25", `${posFor("A", 0)}cqw`);
    this.style.setProperty("--race-a-x-50", `${posFor("A", 1)}cqw`);
    this.style.setProperty("--race-a-x-75", `${posFor("A", 2)}cqw`);
    this.style.setProperty("--race-b-x-25", `${posFor("B", 0)}cqw`);
    this.style.setProperty("--race-b-x-50", `${posFor("B", 1)}cqw`);
    this.style.setProperty("--race-b-x-75", `${posFor("B", 2)}cqw`);
    return Math.max(durA, durB);
  }

  // Arms timers for whichever transition is pending next, based on the
  // wall-clock target times stored in _raceEndAt / _victoryEndAt. Safe to
  // call repeatedly — clears prior timers first.
  private _armStateTransitions(): void {
    this._clearRaceTimers();
    const now = Date.now();
    if (this._raceState === "racing" && this._raceEndAt !== null) {
      const delay = Math.max(0, this._raceEndAt - now);
      this._raceTimers.push(
        setTimeout(() => {
          this._raceState = "victory";
          this._raceEndAt = null;
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
    });
    const rows = matching.slice(0, 2);

    const rawPlatform = rows.find((d) => d.platform)?.platform ?? null;
    const platform = cfg.show_platform ? rawPlatform : null;
    const gleisLeft = platform === "2";
    const type = rows[0]?.type ?? "";
    const isBus = type === LINE_TYPE_BUS_DAY || type === LINE_TYPE_BUS_NIGHT;
    const platformLabel = this._t(isBus ? "steig" : "gleis");

    const stopName = attrs.stop_name || attrs.friendly_name || "";
    const showStationName = cfg.show_station_name && !!stopName;
    const stationPanel = showStationName
      ? this._renderStationName(stopName, matching, departures, cfg.station_bg)
      : nothing;

    const raceActive = cfg.wheelchair_race && this._raceState === "racing";
    const raceVictory = cfg.wheelchair_race && this._raceState === "victory";
    const retroClasses = {
      retro: true,
      "retro--gleis-left": !!platform && gleisLeft,
      "retro--gleis-right": !!platform && !gleisLeft,
      "retro--no-gleis": !platform,
      [`retro--size-${cfg.size}`]: cfg.size !== "regular",
      [`retro--style-${cfg.style}`]: cfg.style !== "classic",
      "retro--flicker": cfg.flicker,
      "retro--race-active": raceActive,
      "retro--race-victory": raceVictory,
    };

    return html`
      <ha-card style="background:#000;padding:0;overflow:hidden;">
        <div class=${classMap(retroClasses)}>
          ${this._versionMismatch ? this._renderBanner() : nothing}
          ${stationPanel}
          <div class="retro-led">
            ${this._renderMain(eid, rows, matching, departures, platform, platformLabel, attrs.server_time)}
            ${raceActive
              ? html`<div class="retro-finish-line" aria-hidden="true"></div>`
              : nothing}
            ${raceVictory
              ? html`<div class="retro-victory" role="status" aria-live="polite">
                  <div class="retro-victory-flag" aria-hidden="true"></div>
                  <span class="retro-victory-sr">
                    ${this._t("race_finished")}
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
    if (!eid) return html`<div class="retro-empty">${this._t("no_entity")}</div>`;
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
      return html`<div class="retro-empty">${this._t(key)}</div>`;
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
    const rowLabel = [line, towards, cdLabel].filter(Boolean).join(" — ");
    return html`
      <li class="retro-row" aria-label=${rowLabel}>
        <div class="retro-line" aria-hidden="true">${line}</div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-text">${towards}</span>
          ${d.barrier_free
            ? html`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title="Barrierefrei"
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
      bg = METRO_COLORS[metroLine.toUpperCase()] ?? "var(--primary-color)";
      fg = "#fff";
    } else {
      bg = "#fff";
      fg = "#000";
    }

    return html`
      <div class="retro-station" style=${styleMap({ background: bg, color: fg })}>
        <div class="retro-station-name">${stopName}</div>
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
    .retro--style-warm {
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
       Per-keyframe timing-functions keep the middle segments linear so
       the motion doesn't visibly decelerate approaching each waypoint;
       only the launch eases out of rest. */
    @keyframes retroWheelExit {
      0%   { transform: translate(0, 0.18em); animation-timing-function: ease-out; }
      25%  { transform: translate(var(--race-x-25, 25cqw), 0.18em); animation-timing-function: linear; }
      50%  { transform: translate(var(--race-x-50, 50cqw), 0.18em); animation-timing-function: linear; }
      75%  { transform: translate(var(--race-x-75, 75cqw), 0.18em); animation-timing-function: linear; }
      100% { transform: translate(calc(100cqw + var(--race-end, 60px)), 0.18em); }
    }
    @media (prefers-reduced-motion: no-preference) {
      .retro--race-active .retro-dest {
        overflow: visible;
      }
      .retro--race-active .retro-cd {
        opacity: 0;
      }
      /* Only fade Gleis/Steig during the race when it's on the right —
         that's the wheelchairs' path. Left-side Gleis stays lit. */
      .retro--race-active.retro--gleis-right .retro-gleis {
        opacity: 0;
      }
      .retro--race-active .retro-row:nth-child(1) .retro-wheelchair {
        --race-end: var(--race-a-end, 60px);
        --race-x-25: var(--race-a-x-25, 25cqw);
        --race-x-50: var(--race-a-x-50, 50cqw);
        --race-x-75: var(--race-a-x-75, 75cqw);
        animation: retroWheelExit var(--race-a-duration, 3.3s) linear forwards;
      }
      .retro--race-active .retro-row:nth-child(2) .retro-wheelchair {
        --race-end: var(--race-b-end, 60px);
        --race-x-25: var(--race-b-x-25, 25cqw);
        --race-x-50: var(--race-b-x-50, 50cqw);
        --race-x-75: var(--race-b-x-75, 75cqw);
        animation: retroWheelExit var(--race-b-duration, 3.3s) linear forwards;
      }
      /* Pass wheelchairs in front of the finish-line strip so the
         crossing reads as "through" rather than "behind the barrier". */
      .retro--race-active .retro-wheelchair {
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
