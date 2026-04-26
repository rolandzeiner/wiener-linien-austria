import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { translate } from "./localize/localize.js";
import type {
  RetroSize,
  RetroStationBg,
  RetroStyle,
  WienerLinienAttrs,
  WienerLinienRetroCardConfig,
} from "./types.js";
import { normaliseRetroConfig, type NormalisedRetroConfig } from "./utils/config.js";
import { lineKey, tripletsAtStop } from "./utils/departures.js";
import { findWienerLinienEntities, stopLabel } from "./utils/entities.js";

const SIZES: readonly RetroSize[] = ["small", "medium", "regular"] as const;
const STATION_BGS: readonly RetroStationBg[] = ["default", "white", "black"] as const;
const STYLES: readonly RetroStyle[] = ["classic", "warm", "pixel"] as const;

@customElement("wiener-linien-austria-retro-card-editor")
export class WienerLinienAustriaRetroCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRetroConfig;

  public setConfig(config: WienerLinienRetroCardConfig): void {
    this._config = normaliseRetroConfig(config);
  }

  private _t(key: string): string {
    return translate(`retro.${key}`, { hassLanguage: this.hass?.language });
  }

  private _et(key: string): string {
    return translate(`retro.editor.${key}`, { hassLanguage: this.hass?.language });
  }

  private _fire(next: NormalisedRetroConfig): void {
    this._config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _attrs(eid: string | undefined): WienerLinienAttrs | undefined {
    return eid ? (this.hass?.states?.[eid]?.attributes as WienerLinienAttrs | undefined) : undefined;
  }

  private _directionsWithData(): Set<"H" | "R"> {
    const attrs = this._attrs(this._config?.entity);
    const out = new Set<"H" | "R">();
    for (const d of attrs?.departures ?? []) {
      if (d.direction === "H" || d.direction === "R") out.add(d.direction);
    }
    return out;
  }

  private _linesForCurrent(): string[] {
    if (!this._config) return [];
    const attrs = this._attrs(this._config.entity);
    const dir = this._config.direction;
    const s = new Set<string>();
    for (const d of attrs?.departures ?? []) {
      if (d.direction === dir && d.line) s.add(d.line);
    }
    return [...s].sort();
  }

  private _swallowKeys(ev: KeyboardEvent): void {
    ev.stopPropagation();
  }

  // ------------------------------------------------------------------
  // Mutators
  // ------------------------------------------------------------------

  private _pickEntity(eid: string): void {
    if (!this._config) return;
    this._fire({ ...this._config, entity: eid });
  }

  private _setDirection(dir: "H" | "R"): void {
    if (!this._config || this._config.direction === dir) return;
    this._fire({ ...this._config, direction: dir });
  }

  private _pickLine(line: string): void {
    if (!this._config) return;
    const next: NormalisedRetroConfig = { ...this._config };
    if (next.line === line) delete next.line;
    else next.line = line;
    this._fire(next);
  }

  private _setShowPlatform(on: boolean): void {
    if (!this._config) return;
    this._fire({ ...this._config, show_platform: on });
  }

  private _setShowStationName(on: boolean): void {
    if (!this._config) return;
    this._fire({ ...this._config, show_station_name: on });
  }

  private _setStationBg(bg: RetroStationBg): void {
    if (!this._config || this._config.station_bg === bg) return;
    this._fire({ ...this._config, station_bg: bg });
  }

  private _setSize(size: RetroSize): void {
    if (!this._config || this._config.size === size) return;
    this._fire({ ...this._config, size });
  }

  private _setStyle(style: RetroStyle): void {
    if (!this._config || this._config.style === style) return;
    this._fire({ ...this._config, style });
  }

  private _setFlicker(on: boolean): void {
    if (!this._config) return;
    this._fire({ ...this._config, flicker: on });
  }

  private _setWheelchairRace(on: boolean): void {
    if (!this._config) return;
    this._fire({ ...this._config, wheelchair_race: on });
  }

  private _setAccessibilityOnly(on: boolean): void {
    if (!this._config) return;
    this._fire({ ...this._config, accessibility_only: on });
  }

  private _setWalkTime(key: string, raw: string): void {
    if (!this._config) return;
    const n = parseInt(raw, 10);
    const clean = Number.isFinite(n) && n > 0 ? Math.min(120, n) : null;
    const cur = { ...(this._config.walk_times ?? {}) };
    if (clean === null) delete cur[key];
    else cur[key] = clean;
    const next: NormalisedRetroConfig = { ...this._config };
    if (Object.keys(cur).length) next.walk_times = cur;
    else delete next.walk_times;
    this._fire(next);
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;
    const cfg = this._config;
    const available = findWienerLinienEntities(this.hass);
    const directionsWithData = this._directionsWithData();

    return html`
      <div class="editor">
        ${this._renderSensorSection(available)}
        ${this._renderDirectionSection(directionsWithData)}
        ${this._renderLineSection()}
        ${this._renderWalkTimeSection()}
        ${this._renderStationSection(cfg.show_station_name, cfg.station_bg)}
        ${this._renderDisplaySection(
          cfg.show_platform,
          cfg.size,
          cfg.style,
          cfg.flicker,
          cfg.wheelchair_race,
          cfg.accessibility_only,
        )}
      </div>
    `;
  }

  private _renderSensorSection(available: string[]): TemplateResult {
    const selected = this._config!.entity;
    const chips = available.length
      ? available.map((eid) => {
          const name = stopLabel(this.hass, eid);
          const slug = eid.split(".")[1] ?? eid;
          const isSel = eid === selected;
          return html`
            <button
              type="button"
              class=${classMap({ chip: true, selected: isSel })}
              @click=${() => this._pickEntity(eid)}
            >
              <span class="stop-name">${name}</span>
              <span class="eid">${slug}</span>
            </button>
          `;
        })
      : html`<div class="editor-hint">${this._et("no_sensors")}</div>`;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_sensor")}</div>
        <div class="editor-hint">${this._et("sensor_hint")}</div>
        <div class="entity-chips">${chips}</div>
      </div>
    `;
  }

  private _renderDirectionSection(withData: Set<"H" | "R">): TemplateResult {
    const cfg = this._config!;
    const warn = cfg.entity && !withData.has(cfg.direction);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_direction")}</div>
        <div class="editor-hint">${this._et("direction_hint")}</div>
        <div class="direction-buttons">
          <button
            type="button"
            class=${classMap({
              active: cfg.direction === "H",
              "no-data": !withData.has("H"),
            })}
            @click=${() => this._setDirection("H")}
          >${this._t("dir_h")}</button>
          <button
            type="button"
            class=${classMap({
              active: cfg.direction === "R",
              "no-data": !withData.has("R"),
            })}
            @click=${() => this._setDirection("R")}
          >${this._t("dir_r")}</button>
        </div>
        ${warn
          ? html`<div class="direction-warning">${this._et("direction_no_data")}</div>`
          : nothing}
      </div>
    `;
  }

  private _renderLineSection(): TemplateResult {
    const cfg = this._config!;
    const lines = this._linesForCurrent();
    const chips = lines.length
      ? lines.map((line) => {
          const isSel = line === cfg.line;
          return html`
            <button
              type="button"
              class=${classMap({ chip: true, selected: isSel })}
              @click=${() => this._pickLine(line)}
            >
              <span class="stop-name">${line}</span>
            </button>
          `;
        })
      : html`<div class="editor-hint">${this._et("no_lines")}</div>`;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_line")}</div>
        <div class="editor-hint">${this._et("line_hint")}</div>
        <div class="entity-chips">${chips}</div>
      </div>
    `;
  }

  private _renderWalkTimeSection(): TemplateResult {
    const cfg = this._config!;
    const attrs = this._attrs(cfg.entity);
    const triplets = cfg.entity
      ? tripletsAtStop(attrs).filter((t) => t.direction === cfg.direction)
      : [];
    const walkTimes = cfg.walk_times ?? {};

    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_walk_time")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${triplets.length
            ? triplets.map((t) => {
                const key = lineKey(t.line, t.direction, t.towards);
                const val = walkTimes[key];
                return html`
                  <div class="walk-time-row">
                    <span class="walk-time-badge">${t.line}</span>
                    <span class="walk-time-towards" title=${t.towards}>→ ${t.towards}</span>
                    <input
                      type="number"
                      class="walk-time-input"
                      min="0"
                      max="120"
                      step="1"
                      inputmode="numeric"
                      placeholder=${this._et("walk_time_placeholder")}
                      aria-label=${this._et("walk_time_aria")
                        .replace("{line}", t.line)
                        .replace("{towards}", t.towards)}
                      .value=${val !== undefined ? String(val) : ""}
                      @keydown=${this._swallowKeys}
                      @keyup=${this._swallowKeys}
                      @keypress=${this._swallowKeys}
                      @change=${(ev: Event) =>
                        this._setWalkTime(key, (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                `;
              })
            : html`<div class="editor-hint">${this._et("walk_time_no_data")}</div>`}
        </div>
      </div>
    `;
  }

  private _renderStationSection(showStationName: boolean, stationBg: RetroStationBg): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_station")}</div>
        <div class="editor-hint">${this._et("station_hint")}</div>
        <div class="toggle-row">
          <label for="retro-show-station">${this._et("show_station_name")}</label>
          <ha-switch
            id="retro-show-station"
            .checked=${showStationName}
            @change=${(ev: Event) =>
              this._setShowStationName((ev.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${showStationName
          ? html`
              <div class="segmented-row">
                <span class="segmented-label">${this._et("station_bg_label")}</span>
                <div class="direction-buttons">
                  ${STATION_BGS.map(
                    (bg) => html`
                      <button
                        type="button"
                        class=${classMap({ active: stationBg === bg })}
                        @click=${() => this._setStationBg(bg)}
                      >${this._et(`station_bg_${bg}`)}</button>
                    `,
                  )}
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderDisplaySection(
    showPlatform: boolean,
    size: RetroSize,
    style: RetroStyle,
    flicker: boolean,
    wheelchairRace: boolean,
    accessibilityOnly: boolean,
  ): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_display")}</div>
        <div class="toggle-row">
          <label for="retro-show-platform">${this._et("show_platform")}</label>
          <ha-switch
            id="retro-show-platform"
            .checked=${showPlatform}
            @change=${(ev: Event) =>
              this._setShowPlatform((ev.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        <div class="toggle-row">
          <label for="retro-accessibility-only">${this._et("accessibility_only")}</label>
          <ha-switch
            id="retro-accessibility-only"
            .checked=${accessibilityOnly}
            @change=${(ev: Event) =>
              this._setAccessibilityOnly((ev.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        <div class="toggle-row">
          <label for="retro-flicker">${this._et("flicker_label")}</label>
          <ha-switch
            id="retro-flicker"
            .checked=${flicker}
            @change=${(ev: Event) =>
              this._setFlicker((ev.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        <div class="toggle-row">
          <label for="retro-wheelchair-race">${this._et("wheelchair_race_label")}</label>
          <ha-switch
            id="retro-wheelchair-race"
            .checked=${wheelchairRace}
            @change=${(ev: Event) =>
              this._setWheelchairRace((ev.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        <div class="segmented-row">
          <span class="segmented-label">${this._et("size_label")}</span>
          <div class="direction-buttons">
            ${SIZES.map(
              (s) => html`
                <button
                  type="button"
                  class=${classMap({ active: size === s })}
                  @click=${() => this._setSize(s)}
                >${this._et(`size_${s}`)}</button>
              `,
            )}
          </div>
        </div>
        <div class="segmented-row">
          <span class="segmented-label">${this._et("style_label")}</span>
          <div class="direction-buttons">
            ${STYLES.map(
              (s) => html`
                <button
                  type="button"
                  class=${classMap({ active: style === s })}
                  @click=${() => this._setStyle(s)}
                >${this._et(`style_${s}`)}</button>
              `,
            )}
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host { display: block; }
    .editor {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .editor-section {
      background: var(--secondary-background-color, rgba(0,0,0,0.04));
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .section-header {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .editor-hint {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .entity-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      padding: 10px 16px;
      border-radius: 22px;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .chip.selected {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .chip:hover { opacity: 0.85; }
    .chip .stop-name { font-weight: 500; }
    .chip .eid {
      font-size: 0.6875rem;
      opacity: 0.7;
    }
    .direction-buttons {
      display: inline-flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .direction-buttons button {
      padding: 10px 16px;
      border-radius: 22px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      min-width: 48px;
      min-height: 44px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .direction-buttons button.no-data {
      opacity: 0.45;
    }
    .direction-warning {
      margin-top: 4px;
      font-size: 0.75rem;
      color: var(--warning-color, #ffa000);
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .toggle-row label {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .segmented-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 4px;
      flex-wrap: wrap;
    }
    .segmented-label {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
    }
    .walk-time-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .walk-time-row {
      display: grid;
      grid-template-columns: 44px 1fr 72px;
      align-items: center;
      gap: 8px;
    }
    .walk-time-badge {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.9em;
      background: var(--primary-color);
    }
    .walk-time-towards {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .walk-time-input {
      width: 100%;
      box-sizing: border-box;
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      text-align: right;
    }
  `;
}
