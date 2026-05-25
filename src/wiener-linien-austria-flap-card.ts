// Wiener Linien Austria — Flap Card (Solari split-flap board).
//
// A standalone Lovelace card distinct from the LED retro card. Every
// visible character — line code, destination, countdown digit, GLEIS
// number, wheelchair pictogram — renders as a warm-cream mechanical
// flap tile on a dark housing. Only positions that actually changed
// since the last render flap, ripple-staggered left-to-right.
//
// Design language: classic Italian Solari di Udine boards as
// historically used in ÖBB / WL stations. Not backlit, not amber-LED:
// printed cream cards with overhead light, visible seam through every
// glyph, hinge pins at the slot edges, soft drop shadow under each
// card. The aesthetic is the entire point of the card — themes are
// out of scope.
//
// State model:
//   _flipSnapshots: Record<string, string>      — last-rendered text per field
//   _flipFlipping:  Record<string, Record<i, string>> — pending OLD-char map
//   _flipCleanupTimer: one shared timer that clears _flipFlipping after
//                     the longest stagger-delayed animation has settled.
//
// willUpdate diffs each visible row's line / destination / countdown
// against its keyed snapshot, populates flipping maps, schedules the
// cleanup. Per Lit lifecycle, state set in willUpdate folds into the
// same render cycle that paints the new value — no extra render.
//
// Reduced motion: the rotation is replaced with a 60 ms cross-fade so
// motion-sensitive users still get a smooth swap rather than an
// abrupt snap. WCAG 2.3.3.

import {
  LitElement,
  css,
  html,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { keyed } from "lit/directives/keyed.js";
import { styleMap } from "lit/directives/style-map.js";

import { FLAP_CARD_VERSION } from "./const.js";
import { registerWlFonts } from "./font-face.js";
import { translate } from "./localize/localize.js";
import {
  checkCardVersionWS,
  renderVersionBanner,
} from "./shared-render.js";
import "./flap-editor.js";
import type {
  DepartureAttr,
  HomeAssistant,
  LineColorPair,
  LovelaceCardEditor,
  RetroHeaderSide,
  WienerLinienAttrs,
  WienerLinienFlapCardConfig,
  WindowWithCustomCards,
} from "./types.js";
import { LINE_TYPE_METRO } from "./utils/mot.js";
import { chipPalette } from "./utils/config.js";
import { filterDepartures } from "./utils/departures.js";
import { findWienerLinienEntities } from "./utils/entities.js";
import {
  normaliseFlapConfig,
  type NormalisedFlapConfig,
} from "./utils/flap-config.js";
import { formatDate } from "./utils/time.js";
import {
  RETRO_HEADER_ICONS,
  RETRO_HEADER_MDI_EXITS,
  isRetroHeaderMdiExit,
  renderRetroHeaderIcon,
  renderRetroHeaderMdiIcon,
  renderRetroHeaderMdiTile,
  type RetroHeaderIconKey,
} from "./utils/retro-station-icons.js";

// Animation timing — single-leaf flip lasts FLAP_LEAF_MS; the stagger
// delays each tile in a changed run by FLAP_STAGGER_MS × index so the
// row ripples left-to-right. Cleanup waits until the last tile in a
// 12-tile destination row has finished, plus a small grace so the
// flap stays parked at -90° momentarily before the static halves
// take over (avoids any 1-frame seam at the cleanup boundary).
// March tick interval — matches the CSS leaf animation duration
// (130 ms, see .flap-tile--flipping rule below) so each tick is one
// complete flap with no half-rotation overlap between steps. 130 ms
// is the Solari sweet spot: fast enough that a 13-letter walk lands
// in ~1.7 s, slow enough that each individual flap reads as a
// discrete mechanical motion.
const FLAP_MARCH_INTERVAL_MS = 130;

// Letter + digit sequences for marching. Real Solari drums are split
// by section — letters cycle through letters, digits cycle through
// digits. Cross-section transitions (letter → digit, space → letter)
// jump directly because a real board would have a separate drum and
// would set the new value in one step.
const FLAP_LETTER_SEQUENCE = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß";
const FLAP_DIGIT_SEQUENCE = "0123456789";

function flapNextChar(from: string, to: string): string {
  if (from === to) return to;
  if (
    FLAP_LETTER_SEQUENCE.includes(from) &&
    FLAP_LETTER_SEQUENCE.includes(to)
  ) {
    const i = FLAP_LETTER_SEQUENCE.indexOf(from);
    return FLAP_LETTER_SEQUENCE[(i + 1) % FLAP_LETTER_SEQUENCE.length]!;
  }
  if (
    FLAP_DIGIT_SEQUENCE.includes(from) &&
    FLAP_DIGIT_SEQUENCE.includes(to)
  ) {
    const i = FLAP_DIGIT_SEQUENCE.indexOf(from);
    return FLAP_DIGIT_SEQUENCE[(i + 1) % FLAP_DIGIT_SEQUENCE.length]!;
  }
  return to;
}

// Dedupe by `type` so a double-load (cache-bust race, HMR) doesn't
// surface the card twice in the picker.
{
  const win = window as unknown as WindowWithCustomCards;
  win.customCards = win.customCards ?? [];
  if (
    !win.customCards.some((c) => c["type"] === "wiener-linien-austria-flap-card")
  ) {
    win.customCards.push({
      type: "wiener-linien-austria-flap-card",
      name: "Wiener Linien Austria — Flap Board",
      description: "Solari-style split-flap departure board",
      preview: true,
    });
  }
}

@customElement("wiener-linien-austria-flap-card")
export class WienerLinienAustriaFlapCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedFlapConfig;
  @state() private _versionMismatch: string | null = null;
  // Marching-flap state. Each text field on the board is keyed by an
  // opaque id like row0-line / row0-dest / row1-cd.
  //   _displayed[key]   — the string currently painted on screen.
  //   _target[key]      — the string we want to land on.
  //   _justFlipped[key] — for each position that ADVANCED on the
  //                       most recent tick, the OLD char that's now
  //                       rotating away on the leaf.
  // A single march timer ticks every FLAP_MARCH_INTERVAL_MS; each
  // tick advances every active tile by ONE step along its letter /
  // digit sequence (see flapNextChar). When every displayed string
  // equals its target, the timer is cleared.
  @state() private _displayed: Record<string, string> = {};
  @state() private _target: Record<string, string> = {};
  @state() private _justFlipped: Record<string, Record<number, string>> = {};
  private _marchTimer: ReturnType<typeof setInterval> | null = null;

  private _versionCheckDone = false;
  // One-shot guard so the "configured entity gone → fell back" warning
  // doesn't spam on every re-render after an entity is removed.
  private _fallbackWarned = false;

  public setConfig(config: WienerLinienFlapCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("wiener-linien-austria-flap-card: config must be an object");
    }
    if (config.entity !== undefined && typeof config.entity !== "string") {
      throw new Error(
        "wiener-linien-austria-flap-card: 'entity' must be a string",
      );
    }
    this._config = normaliseFlapConfig(config);
  }

  public getCardSize(): number {
    return 3;
  }

  public getGridOptions(): {
    columns: number | "full";
    rows: number | "auto";
    min_columns: number;
    min_rows: number;
  } {
    // 12 = full width by default. Mechanical board is wide-format —
    // a narrow column makes the tiles too small for the seam + pins
    // to register as physical.
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: 3,
    };
  }

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement(
      "wiener-linien-austria-flap-card-editor",
    ) as LovelaceCardEditor;
  }

  public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
    const entities = findWienerLinienEntities(hass);
    const first = entities[0] || "";
    let direction: "H" | "R" = "H";
    const deps = hass?.states?.[first]?.attributes?.departures as
      | DepartureAttr[]
      | undefined;
    if (Array.isArray(deps)) {
      const hasH = deps.some((d) => d.direction === "H");
      const hasR = deps.some((d) => d.direction === "R");
      if (!hasH && hasR) direction = "R";
    }
    return { entity: first, direction };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    registerWlFonts();
    if (!this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearFlipTimer();
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (
      changed.has("_config") ||
      changed.has("_versionMismatch") ||
      changed.has("_displayed") ||
      changed.has("_justFlipped")
    ) {
      return true;
    }
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    // Multi-stop: re-render when ANY configured stop's state changed.
    const eids = this._resolveStopEids();
    if (eids.length === 0) return false;
    return eids.some((eid) => prev.states[eid] !== this.hass!.states[eid]);
  }

  protected override willUpdate(_changed: PropertyValues): void {
    if (!this._config) return;
    const rows = this._gatherRows();
    // Uniform-width destination column. Every visible row is padded
    // to the longest destination's length with trailing spaces so the
    // platform column lines up visually. The padding tiles are blank
    // pockets (no glyph), so any spurious diff against a previously
    // shorter snapshot flips one blank into another — invisible.
    const maxDestLen = this._maxDestLen(rows);
    // Diff each visible row's three flip-card fields. Keys are row
    // INDEX (not departure ID) so the next train's content inherits
    // the previous row's snapshot and flaps from THAT — which is the
    // intuitive behaviour ("the next departure just flipped in").
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      this._diffFlipField(`row${i}-line`, (row.line ?? "").toUpperCase());
      this._diffFlipField(
        `row${i}-dest`,
        (row.towards ?? "").toUpperCase().padEnd(maxDestLen, " "),
      );
      // Pad the cd snapshot to a fixed 2-char width — matches the
      // 2-tile render so per-position diff aligns with the rendered
      // tiles. A 9 → 10 transition flips both tiles (" 9" → "10");
      // a 10 → 9 flips both (because the blank slides in). 0 ↔ N
      // also flips the digit position cleanly.
      const cd = Number.isFinite(row.countdown) ? row.countdown : null;
      const cdSnapshot =
        cd === null
          ? "--"
          : String(cd <= 0 ? 0 : cd).padStart(2, " ");
      this._diffFlipField(`row${i}-cd`, cdSnapshot);
    }
    // Drop snapshots for rows the departure queue no longer holds, so
    // a re-appearance many minutes later doesn't flap from a stale
    // value.
    for (let i = rows.length; i < this._config.max_rows; i++) {
      this._diffFlipField(`row${i}-line`, null);
      this._diffFlipField(`row${i}-dest`, null);
      this._diffFlipField(`row${i}-cd`, null);
    }
  }

  // ------------------------------------------------------------------
  // Marching-flap engine — Solari boards rotate their drums one card
  // at a time until the target glyph faces forward. Each text field
  // (line / dest / cd, keyed by row index) walks independently; the
  // single march timer advances every active field by one step per
  // tick.
  // ------------------------------------------------------------------

  private _clearFlipTimer(): void {
    if (this._marchTimer !== null) {
      clearInterval(this._marchTimer);
      this._marchTimer = null;
    }
  }

  /** Push a new target value for a field. First sighting adopts the
   *  value without marching (initial paint shouldn't flap from
   *  emptiness through the whole alphabet). Subsequent calls set
   *  the target and arm the march timer; the tick handler advances
   *  the displayed string toward the target one char at a time. */
  private _diffFlipField(key: string, currentValue: string | null): void {
    if (currentValue === null) {
      delete this._displayed[key];
      delete this._target[key];
      delete this._justFlipped[key];
      return;
    }
    if (this._displayed[key] === undefined) {
      // First sighting — adopt instantly.
      this._displayed = { ...this._displayed, [key]: currentValue };
      this._target = { ...this._target, [key]: currentValue };
      return;
    }
    if (this._target[key] === currentValue) return;
    this._target = { ...this._target, [key]: currentValue };
    this._ensureMarchTimer();
  }

  private _ensureMarchTimer(): void {
    if (this._marchTimer !== null) return;
    this._marchTimer = setInterval(
      () => this._marchTick(),
      FLAP_MARCH_INTERVAL_MS,
    );
  }

  private _marchTick(): void {
    const nextDisplayed: Record<string, string> = { ...this._displayed };
    const nextJustFlipped: Record<string, Record<number, string>> = {};
    let activeAny = false;
    for (const [key, target] of Object.entries(this._target)) {
      const cur = nextDisplayed[key] ?? "";
      if (cur === target) continue;
      const maxLen = Math.max(cur.length, target.length);
      const newChars: string[] = [];
      const flipped: Record<number, string> = {};
      for (let i = 0; i < maxLen; i++) {
        const c = cur[i] ?? " ";
        const t = target[i] ?? " ";
        if (c === t) {
          newChars.push(c);
        } else {
          flipped[i] = c;
          newChars.push(flapNextChar(c, t));
        }
      }
      const joined = newChars.join("");
      nextDisplayed[key] = joined;
      if (Object.keys(flipped).length > 0) {
        nextJustFlipped[key] = flipped;
        activeAny = true;
      }
    }
    this._displayed = nextDisplayed;
    this._justFlipped = nextJustFlipped;
    if (!activeAny) {
      this._clearFlipTimer();
    }
  }

  private async _checkCardVersion(): Promise<void> {
    this._versionMismatch = await checkCardVersionWS(
      this.hass,
      "wiener_linien_austria/flap_card_version",
      FLAP_CARD_VERSION,
    );
  }

  /** Configured stop entity ids that actually exist in hass.states.
   *  When `entities` is empty (fresh card from the picker), fall back
   *  to the first auto-discovered WL sensor so the preview is
   *  populated. */
  private _resolveStopEids(): string[] {
    const stops = this._config?.entities ?? [];
    const states = this.hass?.states;
    const out: string[] = [];
    for (const s of stops) {
      if (states?.[s.entity]) out.push(s.entity);
    }
    if (out.length === 0 && stops.length === 0) {
      const first = findWienerLinienEntities(this.hass)[0];
      if (first) out.push(first);
    }
    if (out.length === 0 && stops.length > 0 && !this._fallbackWarned) {
      this._fallbackWarned = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[wiener-linien-austria-flap-card] none of the configured entities exist in hass.states (${stops.map((s) => s.entity).join(", ")})`,
      );
    }
    return out;
  }

  /** Longest destination text across the merged row set — drives the
   *  trailing-blank padding so every row carries the same number of
   *  destination tiles. Recomputed per render so a new long
   *  destination arriving (or an old one leaving) updates the
   *  column width on the next paint. */
  private _maxDestLen(rows: DepartureAttr[]): number {
    let max = 0;
    for (const row of rows) {
      const len = (row.towards ?? "").length;
      if (len > max) max = len;
    }
    return max;
  }

  /** Gather and merge departures from every configured stop, applying
   *  per-stop filters (lines, direction, walk_times) + the card-wide
   *  `accessibility_only`. Result is sorted by countdown ascending
   *  and sliced to `max_rows`. Used by both willUpdate (to feed the
   *  flip diff) and render (to paint the rows). */
  private _gatherRows(): DepartureAttr[] {
    if (!this._config) return [];
    const stops = this._config.entities ?? [];
    const accessibilityOnly = this._config.accessibility_only;
    const merged: DepartureAttr[] = [];
    for (const stop of stops) {
      const attrs = (this.hass?.states?.[stop.entity]?.attributes ?? {}) as WienerLinienAttrs;
      const departures = Array.isArray(attrs.departures) ? attrs.departures : [];
      // `filterDepartures` accepts direction `"H" | "R" | undefined`.
      // Undefined / empty-string direction = both directions. The
      // ModernStopFilter shape carries optional lines / walk_times so
      // per-stop scoping comes for free.
      const dir =
        stop.direction === "H" || stop.direction === "R"
          ? stop.direction
          : undefined;
      const filtered = filterDepartures(departures, {
        ...(dir !== undefined ? { direction: dir } : {}),
        ...(stop.lines && stop.lines.length ? { lines: stop.lines } : {}),
        ...(stop.walk_times ? { walk_times: stop.walk_times } : {}),
        accessibility_only: accessibilityOnly,
      });
      merged.push(...filtered);
    }
    // Stable sort by countdown ascending. Departures with non-finite
    // countdown sink to the bottom so the visible rows start with
    // imminent trains.
    merged.sort((a, b) => {
      const ac = Number.isFinite(a.countdown) ? a.countdown : Number.POSITIVE_INFINITY;
      const bc = Number.isFinite(b.countdown) ? b.countdown : Number.POSITIVE_INFINITY;
      return ac - bc;
    });
    return merged.slice(0, this._config.max_rows);
  }

  private _t(key: string, replacements?: Record<string, string | number>): string {
    return translate(
      `flap.${key}`,
      { hassLanguage: this.hass?.language },
      replacements,
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const cfg = this._config;
    const eids = this._resolveStopEids();
    const rows = this._gatherRows();
    // Card-wide metadata sourced from the FIRST stop: WL-orange band
    // station name, server_time for the header chips, GTFS palette
    // for line tiles. line_colors come from the same GTFS feed so a
    // multi-stop board uses identical colours for shared lines.
    const firstEid = eids[0] ?? "";
    const firstAttrs = (firstEid
      ? this.hass?.states?.[firstEid]?.attributes ?? {}
      : {}) as WienerLinienAttrs;
    const stationName =
      firstAttrs.stop_name || firstAttrs.friendly_name || "";
    const lineColors = firstAttrs.line_colors ?? {};
    const serverTime = firstAttrs.server_time;

    // Per-row platform column. The column is allocated when
    // show_platform is on AND at least one visible row actually has
    // a platform value — otherwise (tram / bus stops with no
    // platform metadata) the column would just be empty cream
    // pockets next to the cd, wasted horizontal space.
    const hasAnyPlatform =
      cfg.show_platform && rows.some((d) => d.platform);
    const isMetro = (rows[0]?.type ?? "") === LINE_TYPE_METRO;
    const platformLabel = this._t(isMetro ? "gleis" : "steig");

    // Light mode follows HA's theme, not OS/browser appearance.
    // hass.themes.darkMode is `false` on a light HA theme, `true`
    // on dark; `undefined` before themes have loaded — fall through
    // to the dark default in that window so we never flash light.
    const isLightTheme = this.hass?.themes?.darkMode === false;
    const classes = {
      flap: true,
      [`flap--size-${cfg.size}`]: cfg.size !== "regular",
      "flap--has-platform": hasAnyPlatform,
      "flap--light": isLightTheme,
    };

    const stationHeaderStrip = cfg.show_header
      ? this._renderStationHeader(cfg.header_left, cfg.header_right, serverTime)
      : nothing;

    return html`
      <ha-card style="padding:0;overflow:hidden;">
        <div class=${classMap(classes)}>
          ${renderVersionBanner(this._versionMismatch, (k) => this._t(k), "flap-banner")}
          ${stationHeaderStrip}
          ${cfg.show_station_header
            ? html`<div class="flap-header" role="group">
                <div class="flap-header__station">${stationName}</div>
              </div>`
            : nothing}
          <div class="flap-panel">
            ${this._renderBoard(eids, rows, hasAnyPlatform, platformLabel, lineColors)}
          </div>
        </div>
      </ha-card>
    `;
  }

  // ------------------------------------------------------------------
  // Station-header strip — same per-side grammar as the retro card
  // (RetroHeaderSide), recoloured for the cream / dark housing
  // palette. Helpers from utils/retro-station-icons.ts are reused
  // verbatim — they emit `.retro-station-header__*` classes that the
  // flap card defines its own CSS for inside its shadow DOM. The
  // retro card's CSS for the same classes lives in its own shadow
  // root and can't bleed in either direction.
  // ------------------------------------------------------------------

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
    let exitNode: TemplateResult | typeof nothing = nothing;
    if (side.exit === "regular" || side.exit === "accessible") {
      const key: "exit" | "exit-access" =
        side.exit === "regular" ? "exit" : "exit-access";
      exitNode = renderRetroHeaderIcon(key, {
        ariaLabel: this._t(`header.${RETRO_HEADER_ICONS[key].labelKey}`),
        flipX: RETRO_HEADER_ICONS[key].glyphPointsTo !== pos,
      });
    } else if (side.exit && isRetroHeaderMdiExit(side.exit)) {
      const meta = RETRO_HEADER_MDI_EXITS[side.exit];
      exitNode = renderRetroHeaderMdiIcon(side.exit, {
        ariaLabel: this._t(`header.${meta.labelKey}`),
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
    const mdiTileNodes = (side.extra_icons ?? []).map((icon) =>
      renderRetroHeaderMdiTile(icon, icon),
    );
    const mdiTilesLeftOrder = mdiTileNodes;
    const mdiTilesRightOrder = [...mdiTileNodes].reverse();
    const chipNodes = (side.chips ?? []).map(
      (chipText) =>
        html`<span class="retro-station-header__chip">${chipText}</span>`,
    );
    const chipsLeftOrder = chipNodes;
    const chipsRightOrder = [...chipNodes].reverse();
    const clockText = side.show_clock ? this._formatClock(serverTime) : null;
    const clockNode = clockText
      ? html`<span
          class="retro-station-header__chip retro-station-header__chip--clock"
        >
          <ha-icon
            class="retro-station-header__chip-icon"
            icon="mdi:clock-outline"
          ></ha-icon>
          <span>${clockText}</span>
        </span>`
      : nothing;
    const dateText = side.show_date
      ? this._formatDateChip(serverTime, side.date_format ?? "d.m.Y")
      : null;
    const dateNode = dateText
      ? html`<span
          class="retro-station-header__chip retro-station-header__chip--date"
          >${dateText}</span
        >`
      : nothing;
    return pos === "left"
      ? html`${exitNode}${textNode}${elv}${esc}${wc}${mdiTilesLeftOrder}${chipsLeftOrder}${dateNode}${clockNode}`
      : html`${clockNode}${dateNode}${chipsRightOrder}${mdiTilesRightOrder}${wc}${esc}${elv}${textNode}${exitNode}`;
  }

  private _formatClock(serverTime: string | null | undefined): string | null {
    if (!serverTime) return null;
    const ts = Date.parse(serverTime);
    if (!Number.isFinite(ts)) return null;
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  private _formatDateChip(
    serverTime: string | null | undefined,
    format: string | undefined,
  ): string | null {
    if (!serverTime || !format) return null;
    const ts = Date.parse(serverTime);
    if (!Number.isFinite(ts)) return null;
    return formatDate(new Date(ts), format, this.hass?.language);
  }

  private _renderBoard(
    eids: string[],
    rows: DepartureAttr[],
    hasAnyPlatform: boolean,
    platformLabel: string,
    lineColors: Record<string, LineColorPair>,
  ): TemplateResult {
    const maxDestLen = this._maxDestLen(rows);
    if (eids.length === 0) {
      return html`<div class="flap-empty">${this._t("no_entity")}</div>`;
    }
    if (rows.length === 0) {
      let totalDepartures = 0;
      for (const eid of eids) {
        const attrs = (this.hass?.states?.[eid]?.attributes ?? {}) as WienerLinienAttrs;
        if (Array.isArray(attrs.departures)) totalDepartures += attrs.departures.length;
      }
      const key = totalDepartures === 0 ? "betriebsschluss" : "no_data";
      return html`<div class="flap-empty">${this._t(key)}</div>`;
    }
    // Optional thin column-header caption above the rows. Renders
    // only when the platform column is allocated, gives the new
    // column reading context ("GLEIS" / "STEIG") without repeating
    // a label on every row. Aligned to the platform column via the
    // same grid template the rows use.
    // The board is one outer CSS grid; the colheader + each row are
    // subgrids that inherit its column tracks. That's how the GLEIS
    // caption stays pinned to the platform column — auto-sized
    // tracks across independent grids resolve independently, so the
    // pre-subgrid layout drifted whenever line/dest content widths
    // changed. role="list" + role="listitem" preserve the list
    // semantics that the dropped <ul>/<li> pair was carrying.
    return html`
      <div
        class=${classMap({
          "flap-board": true,
          "flap-board--has-platform": hasAnyPlatform,
        })}
        role="list"
        aria-label=${this._t("departures_list")}
      >
        ${hasAnyPlatform
          ? html`<div class="flap-colheader" aria-hidden="true">
              <span></span><span></span
              ><span class="flap-colheader__platform">${platformLabel}</span
              ><span></span>
            </div>`
          : nothing}
        ${rows.map((d, i) =>
          this._renderRow(d, i, lineColors, hasAnyPlatform, maxDestLen),
        )}
      </div>
    `;
  }

  private _renderRow(
    d: DepartureAttr,
    rowIndex: number,
    lineColors: Record<string, LineColorPair>,
    hasAnyPlatform: boolean,
    maxDestLen: number,
  ): TemplateResult {
    const cfg = this._config!;
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const isAtPlatform = cd !== null && cd <= 0;
    const line = (d.line ?? "?").toUpperCase();
    const towards = (d.towards ?? "").toUpperCase();
    const cdLabel =
      cd === null
        ? this._t("no_data")
        : isAtPlatform
          ? this._t("at_platform")
          : this._t("countdown_minutes", { n: String(cd) });
    const rowLabel = [line, towards, cdLabel].filter(Boolean).join(" — ");

    // Resolve the line palette through chipPalette so each character
    // tile in the line column is painted with the official WL line
    // colour. Fallback (unknown line) stays cream — same as text
    // tiles — rather than dragging in the HA primary colour which
    // would clash with the cream palette.
    const palette = chipPalette(line, {}, lineColors);
    const hasResolvedColor = palette.background !== "var(--primary-color)";
    // Only the BACKGROUND comes from the GTFS palette. Foreground
    // stays at the cream-hi default (set in CSS on .flap-tile--color)
    // so every line letter reads as one cohesive material with the
    // rest of the cream tiles — even on lines whose GTFS fg is
    // white or nightline-yellow.
    const lineTileOpts: { tileBg?: string; tileFg?: string } = {};
    if (hasResolvedColor) {
      lineTileOpts.tileBg = palette.background;
    }

    // Always two countdown tiles. Single-digit values (including the
    // at-platform 0) pad with a leading blank tile so the visual
    // width is constant — no jumping width on the 10→9 boundary, no
    // tile disappearing when a train pulls in. The previous blinking-
    // asterisks variant for at-platform broke the mechanical material
    // (it wasn't a flap card) and made the row briefly narrower.
    const cdText =
      cd === null
        ? "--"
        : String(isAtPlatform ? 0 : cd).padStart(2, " ");
    const cdContent = this._renderFlipString(
      cdText,
      `row${rowIndex}-cd`,
      { blankSpace: true },
    );

    // Per-row platform tile — wide tile in its own column between
    // dest and cd. When the row has no platform value, render a
    // blank tile placeholder so the column stays aligned for all
    // rows in the same board.
    const platformCell = hasAnyPlatform
      ? html`<div class="flap-cell flap-cell--platform" aria-hidden="true">
          ${d.platform
            ? this._renderTile(d.platform, undefined, 0, { wide: true })
            : this._renderTile(" ", undefined, 0, {
                wide: true,
                blankSpace: true,
              })}
        </div>`
      : nothing;

    return html`
      <div class="flap-row" role="listitem" aria-label=${rowLabel}>
        <div class="flap-cell flap-cell--line" aria-hidden="true">
          ${this._renderFlipString(line, `row${rowIndex}-line`, lineTileOpts)}
        </div>
        <div class="flap-cell flap-cell--dest" aria-hidden="true">
          ${this._renderFlipString(
            towards.padEnd(maxDestLen, " "),
            `row${rowIndex}-dest`,
            { blankSpace: true },
          )}
          ${cfg.show_accessibility
            ? d.barrier_free
              ? this._renderPictogramTile(
                  "mdi:wheelchair-accessibility",
                  this._t("barrier_free_title"),
                )
              : this._renderAccessibilityBlankTile(
                  this._t("not_barrier_free_title"),
                )
            : nothing}
        </div>
        ${platformCell}
        <div class="flap-cell flap-cell--cd" aria-hidden="true">
          <span class="flap-cd-tiles">${cdContent}</span>
          ${cfg.show_min_unit && cd !== null
            ? html`<span class="flap-cd-unit">${this._t("unit_min")}</span>`
            : nothing}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Tile primitives
  // ------------------------------------------------------------------

  private _renderFlipString(
    text: string,
    key: string,
    opts: { tileBg?: string; tileFg?: string; blankSpace?: boolean } = {},
  ): TemplateResult {
    // _displayed[key] is the currently-painted string — advances one
    // step per march tick toward _target[key]. Falls back to `text`
    // for the very first render (willUpdate adopts the value before
    // the next render, so this fallback only matters when
    // _displayed hasn't been initialised yet, e.g. an empty board).
    const displayed = this._displayed[key] ?? text;
    const chars = displayed.split("");
    const flipping = this._justFlipped[key] ?? {};
    // keyed() forces Lit to re-mount the tile when its current char
    // changes — which restarts the CSS flap animation from 0° each
    // tick, giving the marching cycle its discrete flap-per-step
    // motion. Tiles whose char is unchanged (already at target)
    // keep their key and don't re-mount, so no spurious animation.
    return html`<span class="flap-tiles" aria-label=${text}
      >${chars.map((char, i) =>
        keyed(`${i}:${char}`, this._renderTile(char, flipping[i], i, opts)),
      )}</span
    >`;
  }

  private _renderTile(
    current: string,
    flippingFrom: string | undefined,
    index: number,
    opts: {
      tileBg?: string;
      tileFg?: string;
      wide?: boolean;
      /** When true, spaces render as a full blank tile (cream pocket
       *  + seam + pins, no glyph) instead of a thin inline space.
       *  Used by the countdown padder so single-digit countdowns
       *  keep a stable 2-tile footprint instead of jumping width on
       *  every 10→9 / 9→10 boundary. Destination text leaves this
       *  off so word separators stay as natural spaces. */
      blankSpace?: boolean;
    } = {},
  ): TemplateResult {
    if (current === " " && !opts.blankSpace) {
      return html`<span class="flap-space" aria-hidden="true">&nbsp;</span>`;
    }
    const isFlipping = flippingFrom !== undefined;
    const tileStyle = styleMap({
      "--tile-i": String(index),
      ...(opts.tileBg ? { "--tile-bg": opts.tileBg } : {}),
      ...(opts.tileFg ? { "--tile-fg": opts.tileFg } : {}),
    });
    const tileClass = classMap({
      "flap-tile": true,
      "flap-tile--wide": opts.wide === true,
      "flap-tile--color": opts.tileBg !== undefined,
      "flap-tile--flipping": isFlipping,
      // Blank tile — full pocket structure with no glyph. The
      // overflow:hidden on each half already clips any whitespace
      // content; the empty glyph spans below preserve the layout
      // box so the seam + pins still paint at the right positions.
      "flap-tile--blank": current === " ",
    });
    const glyphContent = current === " " ? "" : current;
    return html`<span class=${tileClass} style=${tileStyle}>
      <span class="flap-tile__half flap-tile__half--top"
        ><span class="flap-tile__glyph">${glyphContent}</span></span
      >
      <span class="flap-tile__half flap-tile__half--bottom"
        ><span class="flap-tile__glyph">${glyphContent}</span></span
      >
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
      ${isFlipping
        ? html`<span class="flap-tile__leaf"
            ><span class="flap-tile__glyph">${flippingFrom === " " ? "" : flippingFrom}</span></span
          >`
        : nothing}
    </span>`;
  }

  private _renderPictogramTile(
    icon: string,
    ariaLabel: string,
  ): TemplateResult {
    // Cream halves stay empty — the pictogram overlay paints a SINGLE
    // ha-icon centred over the full tile, and the seam draws on top
    // of it (z-index 2 on the seam vs 1 on the overlay). The earlier
    // try at putting one ha-icon in EACH half rendered two stacked
    // icons because ha-icon refuses to clip itself to its parent half.
    return html`<span
      class="flap-tile flap-tile--pictogram"
      aria-label=${ariaLabel}
    >
      <span class="flap-tile__half flap-tile__half--top"></span>
      <span class="flap-tile__half flap-tile__half--bottom"></span>
      <span class="flap-tile__pictogram-overlay">
        <ha-icon class="flap-tile__pictogram" .icon=${icon}></ha-icon>
      </span>
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
    </span>`;
  }

  /** Empty white-faced tile used in the accessibility slot when a
   *  departure is NOT step-free. Same flap geometry as the cream +
   *  blue tiles — keeps the column width consistent across rows so
   *  the wheelchair tile, when it does appear, sits in the same
   *  horizontal position every time. White (vs cream) so the
   *  "no accessibility info here" reading is distinct from the
   *  cream destination tiles next to it. */
  private _renderAccessibilityBlankTile(ariaLabel: string): TemplateResult {
    return html`<span
      class="flap-tile flap-tile--a11y-blank"
      aria-label=${ariaLabel}
    >
      <span class="flap-tile__half flap-tile__half--top"></span>
      <span class="flap-tile__half flap-tile__half--bottom"></span>
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
    </span>`;
  }

  // ------------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------------

  static override styles = css`
    :host {
      display: block;
      /* Stacking context for the housing shadow + tile drop-shadows
         so they only compete with each other, not the surrounding
         HA dashboard chrome. */
      isolation: isolate;
      /* Tells the browser this card supports both light and dark
         schemes so form controls / scrollbars match whichever
         palette the .flap--light class below selects. */
      color-scheme: light dark;
      /* Solari palette — exposed as custom properties so the
         .flap--light block below can flip the board theme in one
         place. Default values = dark mode. */
      --flap-housing: #1a1612;
      --flap-bg: #0d0b08;
      --flap-cream-hi: #f3eacd;
      --flap-cream: #e8ddbe;
      --flap-cream-lo: #cfc29c;
      --flap-ink: #1a1410;
      --flap-seam: rgba(0, 0, 0, 0.6);
      --flap-pin: rgba(0, 0, 0, 0.7);
      --wl-orange: #e97e00;
      /* International Symbol of Access blue (PMS 285 ≈ #0079c2).
         Used for wheelchair pictogram tiles so they read as the
         universally-recognised accessibility marker instead of
         blending into the cream voice of the rest of the board. */
      --flap-a11y: #0079c2;
      --flap-a11y-hi: #1c93d8;
      --flap-a11y-lo: #006099;
      /* Cross-theme semantic values. The board palette flips
         between light and dark modes, but these stay constant so
         saturated coloured surfaces (line tiles, ISA blue tile,
         WL orange band) keep their light glyph in both modes. */
      --flap-on-color-fg: #f3eacd;
      --flap-header-fg: #f3eacd;
      /* Quiet body text (empty state, ticker) — adapts via the
         .flap--light block below so it stays readable on whichever
         board surface is current. */
      --flap-quiet-fg: rgba(255, 255, 255, 0.85);
    }
    /* Light mode — driven by HA's theme (hass.themes.darkMode === false),
       not the OS/browser prefers-color-scheme. HA themes are
       deliberately decoupled from system appearance, so a user on
       a light HA theme inside a dark OS should still see the light
       board. The flag is wired via a class on the .flap element so
       CSS vars cascade to every descendant just like :host. Saturated
       coloured surfaces (WL orange band, line tiles, ISA-blue
       pictogram tile) keep their cream glyph via the --flap-*-fg
       vars which stay constant across both modes. */
    .flap--light {
      --flap-housing: #e0d5b5;
      --flap-bg: #f3eacd;
      --flap-cream-hi: #3a3a3a;
      --flap-cream: #2c2c2c;
      --flap-cream-lo: #1f1f1f;
      --flap-ink: #ffffff;
      --flap-seam: rgba(0, 0, 0, 0.7);
      --flap-pin: rgba(0, 0, 0, 0.85);
      --flap-quiet-fg: rgba(0, 0, 0, 0.6);
    }
    .flap {
      background: var(--flap-housing);
      border-radius: 10px;
      padding: 6px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        inset 0 -1px 0 rgba(0, 0, 0, 0.6),
        0 6px 22px rgba(0, 0, 0, 0.45);
      font-family: "Barlow Condensed", "Saira Condensed", "WL Sans Condensed",
        "WL Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
      color: var(--flap-cream);
      box-sizing: border-box;
    }
    /* WL orange station header band — sits inside the housing, top
       corners rounded to match the housing's inner radius. Station
       name centred, clock right-aligned. Same Solari font for the
       clock so it ties typographically into the board below.
       This is NOT the retro card's station-header strip; it's the
       flap card's own header, intentionally just the orange band. */
    .flap-header {
      background: var(--wl-orange);
      color: var(--flap-header-fg);
      border-radius: 4px 4px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      height: 50px;
      font-family: "Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Helvetica, Arial, sans-serif;
      font-weight: 800;
      letter-spacing: 0.02em;
      box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.18);
    }
    .flap-header__station {
      text-align: center;
      font-size: 22px;
      letter-spacing: 0.04em;
    }
    .flap-panel {
      background: var(--flap-bg);
      border-radius: 0 0 4px 4px;
      padding: 10px 14px 12px;
      /* Faint top-down gradient (~3% white) suggests glass cover. */
      background-image: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.025) 0%,
        rgba(255, 255, 255, 0) 30%
      );
    }
    /* When the header is hidden, the panel takes the full housing
       inner radius. */
    .flap > .flap-panel:first-of-type {
      border-radius: 4px;
    }
    /* Board layout — single CSS grid containing the optional column
       header + every row. The header and rows are subgrids that
       inherit the board's column tracks, so the "GLEIS" caption
       aligns to the platform column by construction (vs the
       pre-subgrid version where each row was its own grid and the
       auto-track widths drifted independently). */
    .flap-board {
      display: grid;
      grid-template-columns: auto 1fr auto;
      column-gap: 14px;
      row-gap: 6px;
      align-items: center;
    }
    .flap-board--has-platform {
      grid-template-columns: auto 1fr auto auto;
    }
    .flap-colheader {
      display: grid;
      grid-template-columns: subgrid;
      grid-column: 1 / -1;
      align-items: end;
      padding-bottom: 2px;
      font-family: "Work Sans", "WL Sans", sans-serif;
      font-weight: 600;
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--flap-cream-lo);
    }
    .flap-colheader__platform {
      text-align: center;
    }
    .flap-row {
      display: grid;
      grid-template-columns: subgrid;
      grid-column: 1 / -1;
      align-items: center;
      min-height: 44px;
    }
    .flap-cell--line {
      display: inline-flex;
    }
    .flap-cell--dest {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
    }
    .flap-cell--platform {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .flap-cell--cd {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      justify-content: flex-end;
    }
    .flap-cd-tiles {
      display: inline-flex;
      gap: 2px;
    }
    .flap-cd-unit {
      font-family: "Work Sans", "WL Sans", sans-serif;
      font-weight: 600;
      font-size: 13px;
      color: var(--flap-cream-lo);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      align-self: end;
      padding-bottom: 6px;
    }
    .flap-tiles {
      display: inline-flex;
      gap: 2px;
    }
    .flap-space {
      display: inline-block;
      width: 0.45em;
    }

    /* ====================================================================
       Tile — the unit cell. Each character is its own perspective
       container so the leaf can rotate without coupling to neighbours.
       drop-shadow renders outside the layout box (overflow:visible on
       the tile keeps it unclipped) — that 1.5 px below the tile is
       what sells "card sits forward of the board".
       ==================================================================== */
    .flap-tile {
      position: relative;
      display: inline-block;
      width: 32px;
      height: 44px;
      perspective: 220px;
      overflow: visible;
      filter: drop-shadow(0 1.5px 0 rgba(0, 0, 0, 0.5));
      /* When opts.tileBg / opts.tileFg are set, --tile-bg / --tile-fg
         override the cream gradient on every face below. */
    }
    .flap-tile--wide {
      width: 38px;
    }
    .flap-tile__half {
      position: absolute;
      left: 0;
      right: 0;
      height: 50%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      color: var(--flap-ink);
      backface-visibility: hidden;
    }
    .flap-tile__half--top {
      top: 0;
      align-items: flex-start;
      background: linear-gradient(
        180deg,
        var(--flap-cream-hi) 0%,
        var(--flap-cream) 100%
      );
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
      border-radius: 2.5px 2.5px 0 0;
    }
    .flap-tile__half--bottom {
      bottom: 0;
      align-items: flex-end;
      background: linear-gradient(
        180deg,
        var(--flap-cream) 0%,
        var(--flap-cream-lo) 100%
      );
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.18);
      border-radius: 0 0 2.5px 2.5px;
    }
    /* Glyph spans the FULL tile height (44 px) inside a half-height
       container — overflow:hidden + align-items clips it to the top
       or bottom half. flex-start on top reveals the top half of the
       glyph; flex-end on bottom reveals the bottom. */
    .flap-tile__glyph {
      display: block;
      height: 44px;
      font-size: 30px;
      line-height: 44px;
      font-weight: 700;
      font-feature-settings: "tnum" 1;
    }
    .flap-tile--wide .flap-tile__half {
      /* Wide tile (GLEIS digit) — same glyph height, just a wider
         pocket so a 2-digit platform doesn't crowd the seam. */
    }
    .flap-tile--wide .flap-tile__glyph {
      font-size: 32px;
    }
    /* Seam — 1 px dark line + 1 px highlight below. THIS is the
       detail that sells the mechanical look. It must visibly cut
       through the glyph; no fade, no gradient — sharp + crisp. */
    .flap-tile__seam {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(50% - 0.5px);
      height: 1px;
      background: var(--flap-seam);
      z-index: 2;
      pointer-events: none;
    }
    .flap-tile__seam::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 1px;
      height: 1px;
      background: rgba(255, 255, 255, 0.18);
    }
    /* Hinge pins — 3 × 3 px dark dots at the seam's left + right
       edges. The detail that pushes the look from "plausible" to
       "physical". Skip these and the tile reads as a digital
       simulation. */
    .flap-tile__pin {
      position: absolute;
      top: calc(50% - 1.5px);
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--flap-pin);
      z-index: 3;
      pointer-events: none;
    }
    .flap-tile__pin--l {
      left: -1px;
    }
    .flap-tile__pin--r {
      right: -1px;
    }
    /* Coloured tile (line code) — inherits the same seam + pins +
       glyph alignment as a cream tile; only the face gradient swaps.
       --tile-bg / --tile-fg come from styleMap on the rendered tile. */
    .flap-tile--color .flap-tile__half--top {
      background: linear-gradient(
        180deg,
        color-mix(in oklab, var(--tile-bg, #888) 78%, white 22%) 0%,
        var(--tile-bg, #888) 100%
      );
      color: var(--tile-fg, var(--flap-on-color-fg));
    }
    .flap-tile--color .flap-tile__half--bottom {
      background: linear-gradient(
        180deg,
        var(--tile-bg, #888) 0%,
        color-mix(in oklab, var(--tile-bg, #888) 84%, black 16%) 100%
      );
      color: var(--tile-fg, var(--flap-on-color-fg));
    }
    .flap-tile--color .flap-tile__seam {
      background: rgba(0, 0, 0, 0.4);
    }
    .flap-tile--color .flap-tile__seam::after {
      background: rgba(255, 255, 255, 0.22);
    }
    /* Pictogram tile — same flap geometry as a glyph tile but the
       cream halves swap to the International Symbol of Access blue
       and the ha-icon overlay paints in white. The seam still draws
       at z-index 2 so the mechanical hinge visibly cuts through
       the pictogram, matching the design spec ("vertically centred
       so the seam crosses it"). */
    .flap-tile--pictogram .flap-tile__half--top {
      background: linear-gradient(
        180deg,
        var(--flap-a11y-hi) 0%,
        var(--flap-a11y) 100%
      );
    }
    .flap-tile--pictogram .flap-tile__half--bottom {
      background: linear-gradient(
        180deg,
        var(--flap-a11y) 0%,
        var(--flap-a11y-lo) 100%
      );
    }
    /* Darker seam + slightly brighter highlight on the blue face —
       the cream-palette seam vanishes against the saturated blue. */
    .flap-tile--pictogram .flap-tile__seam {
      background: rgba(0, 0, 0, 0.45);
    }
    .flap-tile--pictogram .flap-tile__seam::after {
      background: rgba(255, 255, 255, 0.28);
    }
    /* Blank a11y tile — used when a row is NOT step-free, so the
       accessibility column always carries a tile and the column
       width stays uniform across rows. Inherits the cream face +
       seam + pins from the base .flap-tile rule (no overrides
       needed — the tile is intentionally identical in material to
       a destination tile, just faceless). The semantic
       differentiator is the absence of the wheelchair icon. */
    .flap-tile__pictogram-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      color: var(--flap-on-color-fg);
      pointer-events: none;
    }
    .flap-tile__pictogram {
      --mdc-icon-size: 26px;
      color: var(--flap-on-color-fg);
    }
    .flap--size-medium .flap-tile__pictogram {
      --mdc-icon-size: 22px;
    }
    .flap--size-small .flap-tile__pictogram {
      --mdc-icon-size: 18px;
    }
    /* Leaf — the OLD top half hinged at the seam, rotating 0 → -90°
       to reveal the static-top NEW glyph underneath. Single leaf
       (real Solari boards only have ONE flapping card visible at a
       time — the static bottom is already the new value, only the
       top needs to flap away). */
    .flap-tile__leaf {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 50%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background: linear-gradient(
        180deg,
        var(--flap-cream-hi) 0%,
        var(--flap-cream) 100%
      );
      color: var(--flap-ink);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.45),
        0 1px 2px rgba(0, 0, 0, 0.35);
      border-radius: 2.5px 2.5px 1px 1px;
      z-index: 4;
      backface-visibility: hidden;
      transform-origin: bottom center;
      transform: rotateX(0deg);
    }
    .flap-tile--color .flap-tile__leaf {
      background: linear-gradient(
        180deg,
        color-mix(in oklab, var(--tile-bg, #888) 78%, white 22%) 0%,
        var(--tile-bg, #888) 100%
      );
      color: var(--tile-fg, var(--flap-on-color-fg));
    }
    /* Each tile's leaf rotates 0° → -90° in one flap. With marching,
       every tile re-mounts (via keyed()) on the next step so this
       animation re-fires from the start every tick — visually
       producing the continuous cycle of physical flap cards. Per-
       tile stagger dropped because marching tiles desync naturally
       (each tile reaches its target after a different number of
       steps based on its letter distance). */
    .flap-tile--flipping .flap-tile__leaf {
      animation: flapLeaf 130ms cubic-bezier(0.4, 0, 0.7, 1) forwards;
    }
    @keyframes flapLeaf {
      to {
        transform: rotateX(-90deg);
      }
    }

    /* GLEIS column moved to per-row tiles — see .flap-cell--platform
       above and the .flap-colheader caption that sits above it. No
       more global side column. */

    /* Empty state — same cream / quiet voice as the cd-unit caption
       so the board reads as one cohesive material when no
       departures are flowing. */
    .flap-empty {
      text-align: center;
      padding: 24px 0;
      font-family: "Barlow Condensed", "WL Sans Condensed", sans-serif;
      font-weight: 600;
      font-size: 20px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--flap-quiet-fg);
    }
    .flap-stars {
      display: inline-flex;
      gap: 4px;
      color: var(--flap-cream);
      font-weight: 700;
      font-size: 28px;
    }
    .flap-stars > span {
      animation: flapStarBlink 1s infinite;
    }
    .flap-stars > span:nth-child(2) {
      animation-delay: 0.5s;
    }
    @keyframes flapStarBlink {
      0%,
      49.99% {
        opacity: 1;
      }
      50%,
      100% {
        opacity: 0;
      }
    }

    /* Size variants — shrink the tile + glyph proportionally. The
       seam + pins stay at their pixel scale (the mechanical details
       look wrong if they scale linearly with the tile). */
    .flap--size-medium .flap-tile {
      width: 28px;
      height: 38px;
    }
    .flap--size-medium .flap-tile--wide {
      width: 34px;
    }
    .flap--size-medium .flap-tile__glyph {
      height: 38px;
      font-size: 26px;
      line-height: 38px;
    }
    .flap--size-medium .flap-row {
      min-height: 38px;
    }
    .flap--size-small .flap-tile {
      width: 22px;
      height: 30px;
    }
    .flap--size-small .flap-tile--wide {
      width: 28px;
    }
    .flap--size-small .flap-tile__glyph {
      height: 30px;
      font-size: 20px;
      line-height: 30px;
    }
    .flap--size-small .flap-row {
      min-height: 30px;
    }

    /* Banner (version-mismatch handshake) — quieter cream-on-housing
       than the LED card's amber banner, so it doesn't shout against
       the warm palette. */
    .flap-banner {
      background: #ffa000;
      color: #1a1410;
      padding: 6px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-family: "Work Sans", sans-serif;
      border-radius: 4px;
      font-size: 12px;
    }
    .flap-banner button {
      background: #1a1410;
      color: #ffa000;
      border: none;
      border-radius: 3px;
      padding: 3px 10px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    /* Accessibility — visible focus ring for keyboard users. */
    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--flap-cream-hi);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* ====================================================================
       Station-header strip (signage homage above the WL-orange band).
       Reuses the retro card's helpers from utils/retro-station-icons.ts
       — same .retro-station-header__* classes emitted by those
       helpers — but recoloured for the flap card's warm-cream palette
       so chips + amenity tiles read as flap-pocket material rather
       than as bright-white signage chips. Each card's static-styles
       block is shadow-DOM scoped, so the two cards' CSS for the same
       class names live in independent worlds.
       ==================================================================== */
    .retro-station-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--flap-housing);
      color: var(--flap-cream-hi);
      padding: 6px 10px;
      gap: 8px;
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
        BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 700;
      font-size: 1.1em;
      letter-spacing: 0.02em;
      border-radius: 4px 4px 0 0;
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.6);
    }
    /* When the WL-orange .flap-header is also rendered below the
       signage strip, drop the strip's bottom corners to seam cleanly
       into the orange band. */
    .retro-station-header + .flap-header {
      border-radius: 0;
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
      font-size: 1.2em;
      color: var(--flap-cream-hi);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    /* Tile (exit / amenity icons) — recoloured from white-on-black
       to cream-on-dark so the tiles read as flap-pocket material.
       The cream chosen (var(--flap-cream-hi)) is the SAME warm
       gradient top stop the flap tiles use; the icons inside
       inherit dark ink via color: var(--flap-ink). */
    .retro-station-header__tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--flap-cream-hi);
      color: var(--flap-ink);
      flex-shrink: 0;
      width: 1.4em;
      height: 1.4em;
      padding: 0.12em;
      box-sizing: border-box;
      border-radius: 2px;
    }
    .retro-station-header__tile--mdi {
      padding: 0.06em;
    }
    .retro-station-header__icon {
      width: 100%;
      height: 100%;
      display: block;
      fill: currentColor;
    }
    .retro-station-header__icon--flip-x {
      transform: scaleX(-1);
    }
    .retro-station-header__mdi {
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
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
        BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 700;
      font-size: 0.9em;
      line-height: 1;
    }
    /* Chip — same cream pocket as the tile, dynamic width for short
       text labels. Matches the flap tiles' warm-cream voice so the
       strip reads as one cohesive material with the board below. */
    .retro-station-header__chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--flap-cream-hi);
      color: var(--flap-ink);
      flex-shrink: 0;
      height: 1.4em;
      padding: 0 0.4em;
      box-sizing: border-box;
      border-radius: 2px;
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
        BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0;
      white-space: nowrap;
    }
    .retro-station-header__chip--clock {
      gap: 0.25em;
      font-variant-numeric: tabular-nums;
    }
    .retro-station-header__chip--date {
      font-variant-numeric: tabular-nums;
    }
    .retro-station-header__chip-icon {
      --mdc-icon-size: 1em;
      display: inline-flex;
      align-items: center;
      color: inherit;
      flex-shrink: 0;
    }
    /* Size-token alignment — match the .flap--size-* scale. */
    .flap--size-medium .retro-station-header {
      font-size: 1em;
      padding: 5px 10px;
    }
    .flap--size-small .retro-station-header {
      font-size: 0.9em;
      padding: 4px 8px;
    }
    /* Narrow-width reflow — drop the destination label so the
       icons stay visible at narrow widths. Container query matches
       the nearest inline-size container. */
    @container (inline-size < 360px) {
      .retro-station-header__text {
        display: none;
      }
    }

    /* prefers-reduced-motion — Solari is showy and continuous. Drop
       the rotation, swap to a 60 ms crossfade. Static bottom still
       carries the value; user sees a smooth swap rather than an
       abrupt snap. */
    @media (prefers-reduced-motion: reduce) {
      .flap-tile--flipping .flap-tile__leaf {
        animation: flapLeafFade 60ms ease-out forwards;
        animation-delay: 0ms;
      }
      .flap-stars > span {
        animation: none;
      }
      @keyframes flapLeafFade {
        to {
          opacity: 0;
        }
      }
    }
  `;
}
