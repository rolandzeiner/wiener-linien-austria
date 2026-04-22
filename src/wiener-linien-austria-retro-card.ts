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

  private _versionCheckDone = false;

  public setConfig(config: WienerLinienRetroCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("wiener-linien-austria-retro-card: config must be an object");
    }
    this._config = normaliseRetroConfig(config);
  }

  public getCardSize(): number {
    return 2;
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
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (changed.has("_config") || changed.has("_versionMismatch")) return true;
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eid = this._resolveEntity();
    if (!eid) return false;
    return prev.states[eid] !== this.hass.states[eid];
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

    const retroClasses = {
      retro: true,
      "retro--gleis-left": !!platform && gleisLeft,
      "retro--gleis-right": !!platform && !gleisLeft,
      "retro--no-gleis": !platform,
      [`retro--size-${cfg.size}`]: cfg.size !== "regular",
    };

    return html`
      <ha-card style="background:#000;padding:0;overflow:hidden;">
        <div class=${classMap(retroClasses)}>
          ${this._versionMismatch ? this._renderBanner() : nothing}
          ${stationPanel}
          <div class="retro-main">
            ${this._renderMain(eid, rows, matching, departures, platform, platformLabel)}
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
  ): TemplateResult {
    if (!eid) return html`<div class="retro-empty">${this._t("no_entity")}</div>`;
    if (rows.length === 0) {
      // Diagnose the empty state so users know whether to flip direction,
      // drop the line filter, or just wait for data.
      const dir = this._config!.direction;
      const lineFilter = this._config!.line;
      const inDirection = allDepartures.filter((d) => d.direction === dir);
      let key = "no_data";
      if (allDepartures.length > 0 && inDirection.length === 0) {
        key = "no_data_wrong_direction";
      } else if (lineFilter && inDirection.length > 0) {
        key = "no_data_wrong_line";
      }
      return html`<div class="retro-empty">${this._t(key)}</div>`;
    }
    // Silence the noop-var warning until used.
    void matching;
    return html`
      <div class="retro-rows">
        ${rows.map((d) => this._renderRow(d))}
      </div>
      ${platform ? this._renderGleis(platform, platformLabel) : nothing}
    `;
  }

  private _renderRow(d: DepartureAttr): TemplateResult {
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const isAtPlatform = cd !== null && cd <= 0;
    return html`
      <div class="retro-row">
        <div class="retro-line">${d.line || "?"}</div>
        <div class="retro-dest">
          <span class="retro-dest-text">${d.towards || ""}</span>
          ${d.barrier_free
            ? html`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title="Barrierefrei"
              ></ha-icon>`
            : nothing}
        </div>
        <div class="retro-cd">
          ${cd === null
            ? "--"
            : isAtPlatform
              ? html`<span class="retro-stars"><span>*</span><span>*</span></span>`
              : String(cd)}
        </div>
      </div>
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
      --led-amber: #FFC700;
      --led-bg: #000;
      --led-substrate: #1a0d2a;
    }
    .retro {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--led-bg);
      background-image: radial-gradient(
        circle, var(--led-substrate) 0.5px, transparent 1px
      );
      background-size: 4px 4px;
      padding: 14px 22px;
      font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
      font-weight: 700;
      letter-spacing: 0.08em;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
      min-height: 110px;
    }
    .retro-main {
      display: flex;
      align-items: stretch;
      flex: 1;
    }
    .retro--gleis-left .retro-gleis { order: -1; }
    .retro--gleis-right { padding-right: 14px; }
    .retro--gleis-left { padding-left: 14px; }
    .retro-rows {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
      font-size: 1.9em;
      line-height: 1;
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
    }
    .retro-dest {
      display: flex;
      align-items: baseline;
      gap: 0.35em;
      overflow: hidden;
      text-transform: uppercase;
      min-width: 0;
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
      filter: drop-shadow(0 0 4px rgba(255, 199, 0, 0.7));
      transform: translateY(0.18em);
    }
    .retro-cd {
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 2.5em;
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
    .retro-gleis {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 14px 0 18px;
      margin-left: 12px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
      border-left: 1px solid rgba(255, 199, 0, 0.25);
    }
    .retro--gleis-left .retro-gleis {
      padding: 0 18px 0 14px;
      margin-left: 0;
      margin-right: 12px;
      border-left: none;
      border-right: 1px solid rgba(255, 199, 0, 0.25);
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
      padding: 11px 18px;
      min-height: 92px;
    }
    .retro--size-medium.retro--gleis-right { padding-right: 10px; }
    .retro--size-medium.retro--gleis-left { padding-left: 10px; }
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
      padding: 8px 14px;
      min-height: 72px;
    }
    .retro--size-small.retro--gleis-right { padding-right: 6px; }
    .retro--size-small.retro--gleis-left { padding-left: 6px; }
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
      text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
      font-size: 1.4em;
      padding: 20px 0;
      letter-spacing: 2px;
    }
    .retro-station {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin: -14px -22px 10px;
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
      margin: -11px -18px 8px;
      padding: 9px 14px;
      font-size: 1.65em;
    }
    .retro--size-small .retro-station {
      margin: -8px -14px 6px;
      padding: 7px 10px;
      font-size: 1.35em;
    }
    .retro--gleis-right .retro-station { margin-right: -14px; }
    .retro--gleis-left .retro-station { margin-left: -14px; }
    .retro--size-medium.retro--gleis-right .retro-station { margin-right: -10px; }
    .retro--size-medium.retro--gleis-left .retro-station { margin-left: -10px; }
    .retro--size-small.retro--gleis-right .retro-station { margin-right: -6px; }
    .retro--size-small.retro--gleis-left .retro-station { margin-left: -6px; }
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
  `;
}
