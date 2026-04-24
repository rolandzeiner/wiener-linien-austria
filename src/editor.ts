import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { translate } from "./localize/localize.js";
import type { WienerLinienAttrs, WienerLinienCardConfig } from "./types.js";
import {
  colorForLine,
  normaliseModernConfig,
  type NormalisedModernConfig,
  type NormalisedModernStop,
} from "./utils/config.js";
import {
  collectLinesInSelection,
  lineKey,
  linesAtStop,
  tripletsAtStop,
} from "./utils/departures.js";
import { findWienerLinienEntities, stopLabel } from "./utils/entities.js";

type ToggleField =
  | "show_accessibility"
  | "show_traffic_info"
  | "show_elevator_info"
  | "show_delay"
  | "show_type_icon"
  | "hide_attribution";

@customElement("wiener-linien-austria-card-editor")
export class WienerLinienAustriaCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedModernConfig;

  public setConfig(config: WienerLinienCardConfig): void {
    this._config = normaliseModernConfig(config);
  }

  private _lang(): string {
    return this.hass?.language?.startsWith("de") ? "de" : "en";
  }

  private _et(key: string): string {
    return translate(`modern.editor.${key}`, { hassLanguage: this.hass?.language });
  }

  private _t(key: string): string {
    return translate(`modern.${key}`, { hassLanguage: this.hass?.language });
  }

  private _fire(next: NormalisedModernConfig): void {
    this._config = next;
    // bubbles + composed: must cross the shadow boundary, else HA never sees
    // the change. Both flags are required.
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _updateStop(eid: string, mutator: (s: NormalisedModernStop) => NormalisedModernStop): void {
    if (!this._config) return;
    const entities = this._config.entities.map((s) => (s.entity === eid ? mutator({ ...s }) : s));
    this._fire({ ...this._config, entities });
  }

  private _toggleStop(eid: string): void {
    if (!this._config) return;
    const idx = this._config.entities.findIndex((s) => s.entity === eid);
    const entities =
      idx >= 0
        ? this._config.entities.filter((_, i) => i !== idx)
        : [...this._config.entities, { entity: eid }];
    this._fire({ ...this._config, entities });
  }

  private _toggleLine(eid: string, line: string): void {
    this._updateStop(eid, (s) => {
      const cur = new Set(s.lines ?? []);
      if (cur.has(line)) cur.delete(line);
      else cur.add(line);
      if (cur.size > 0) s.lines = [...cur];
      else delete s.lines;
      return s;
    });
  }

  private _setDirection(eid: string, dir: "H" | "R" | null): void {
    this._updateStop(eid, (s) => {
      if (dir === null) delete s.direction;
      else s.direction = dir;
      return s;
    });
  }

  private _setWalkTime(eid: string, key: string, raw: string): void {
    const n = parseInt(raw, 10);
    const clean = Number.isFinite(n) && n > 0 ? Math.min(120, n) : null;
    this._updateStop(eid, (s) => {
      const cur = { ...(s.walk_times ?? {}) };
      if (clean === null) delete cur[key];
      else cur[key] = clean;
      if (Object.keys(cur).length) s.walk_times = cur;
      else delete s.walk_times;
      return s;
    });
  }

  private _setLineColor(line: string, color: string): void {
    if (!this._config) return;
    const line_colors = { ...this._config.line_colors, [line.toUpperCase()]: color };
    this._fire({ ...this._config, line_colors });
  }

  private _resetLineColor(line: string): void {
    if (!this._config) return;
    const line_colors = { ...this._config.line_colors };
    delete line_colors[line.toUpperCase()];
    this._fire({ ...this._config, line_colors });
  }

  private _setLayout(layout: "stacked" | "tabs"): void {
    if (!this._config || this._config.layout === layout) return;
    this._fire({ ...this._config, layout });
  }

  private _setMaxDepartures(v: number): void {
    if (!this._config) return;
    const max_departures = Math.max(1, Math.min(20, Math.round(v)));
    if (max_departures === this._config.max_departures) return;
    this._fire({ ...this._config, max_departures });
  }

  private _toggleField(field: ToggleField, checked: boolean): void {
    if (!this._config) return;
    this._fire({ ...this._config, [field]: checked });
  }

  // HA's card-editor steals arrow keys for navigation; stop propagation on
  // number/range inputs so the user can actually edit values.
  private _swallowKeys(ev: KeyboardEvent): void {
    ev.stopPropagation();
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;
    const cfg = this._config;

    const available = findWienerLinienEntities(this.hass);
    const selectedIds = new Set(cfg.entities.map((s) => s.entity));

    return html`
      <div class="editor">
        ${this._renderStopsSection(available, selectedIds)}
        ${this._renderFiltersSection()}
        ${this._renderDisplaySection()}
        ${this._renderColorsSection()}
      </div>
    `;
  }

  private _renderStopsSection(available: string[], selectedIds: Set<string>): TemplateResult {
    const chips = available.length
      ? available.map((eid) => {
          const name = stopLabel(this.hass, eid);
          const slug = eid.split(".")[1] ?? eid;
          const isSelected = selectedIds.has(eid);
          return html`
            <button
              type="button"
              class=${classMap({ chip: true, selected: isSelected })}
              @click=${() => this._toggleStop(eid)}
            >
              <span class="stop-name">${name}</span>
              <span class="eid">${slug}</span>
            </button>
          `;
        })
      : html`<div class="editor-hint">${this._et("no_sensors_available")}</div>`;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_sensors")}</div>
        <div class="editor-hint">${this._et("sensors_hint")}</div>
        <div class="entity-chips">${chips}</div>
      </div>
    `;
  }

  private _renderFiltersSection(): TemplateResult {
    const cfg = this._config!;
    const body = cfg.entities.length
      ? cfg.entities.map((stop) => this._renderStopFilter(stop))
      : html`<div class="editor-hint">${this._et("sensors_hint")}</div>`;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_filters")}</div>
        <div class="editor-hint">${this._et("filters_hint")}</div>
        ${body}
      </div>
    `;
  }

  private _renderStopFilter(stop: NormalisedModernStop): TemplateResult {
    const attrs = this.hass?.states?.[stop.entity]?.attributes as WienerLinienAttrs | undefined;
    if (!attrs) return html``;
    const stopName = attrs.stop_name || stop.entity;
    const overrides = this._config!.line_colors;
    const lines = linesAtStop(attrs);
    const picked = new Set(stop.lines ?? []);
    const dir = stop.direction ?? null;
    // Walk-time rows track the selected direction so the editor doesn't
    // show irrelevant rows when the user locks to H or R.
    const triplets = tripletsAtStop(attrs).filter((t) => !dir || t.direction === dir);

    return html`
      <div class="stop-filter">
        <div class="stop-filter-header">${stopName}</div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("lines_label")}</div>
          <div class="line-chips">
            ${lines.length
              ? lines.map((l) => {
                  const isOn = picked.size === 0 || picked.has(l);
                  const color = colorForLine(l, overrides);
                  const style = isOn
                    ? { background: color, borderColor: color, color: "#fff" }
                    : {};
                  return html`<button
                    type="button"
                    class=${classMap({ chip: true, selected: isOn })}
                    style=${styleMap(style)}
                    @click=${() => this._toggleLine(stop.entity, l)}
                  >${l}</button>`;
                })
              : html`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
          </div>
        </div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("direction_label")}</div>
          <div class="direction-buttons">
            <button
              type="button"
              class=${classMap({ active: dir === "H" })}
              @click=${() => this._setDirection(stop.entity, "H")}
            >${this._t("dir_h")}</button>
            <button
              type="button"
              class=${classMap({ active: dir === "R" })}
              @click=${() => this._setDirection(stop.entity, "R")}
            >${this._t("dir_r")}</button>
            <button
              type="button"
              class=${classMap({ active: dir === null })}
              @click=${() => this._setDirection(stop.entity, null)}
            >${this._t("dir_both")}</button>
          </div>
        </div>

        ${triplets.length
          ? html`
              <div class="stop-filter-row">
                <div class="stop-filter-row-label">${this._et("walk_time_label")}</div>
                <div class="editor-hint">${this._et("walk_time_hint")}</div>
                <div class="walk-time-list">
                  ${triplets.map((t) => {
                    const color = colorForLine(t.line, overrides);
                    const key = lineKey(t.line, t.direction, t.towards);
                    const val = stop.walk_times?.[key];
                    const arrow = t.towards ? `→ ${t.towards}` : "";
                    return html`
                      <div class="walk-time-row">
                        <span class="walk-time-badge" style=${styleMap({ background: color })}>${t.line}</span>
                        <span class="walk-time-towards" title=${t.towards}>${arrow}</span>
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
                            .replace("{towards}", t.towards || "")}
                          .value=${val !== undefined ? String(val) : ""}
                          @keydown=${this._swallowKeys}
                          @keyup=${this._swallowKeys}
                          @keypress=${this._swallowKeys}
                          @change=${(ev: Event) =>
                            this._setWalkTime(
                              stop.entity,
                              key,
                              (ev.target as HTMLInputElement).value,
                            )}
                        />
                      </div>
                    `;
                  })}
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderDisplaySection(): TemplateResult {
    const cfg = this._config!;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_display")}</div>

        <div class="toggle-row" style="gap:12px;">
          <span style="font-size:0.8125rem;">${this._et("layout_label")}</span>
          <div class="direction-buttons">
            <button
              type="button"
              class=${classMap({ active: cfg.layout === "stacked" })}
              @click=${() => this._setLayout("stacked")}
            >${this._et("layout_stacked")}</button>
            <button
              type="button"
              class=${classMap({ active: cfg.layout === "tabs" })}
              @click=${() => this._setLayout("tabs")}
            >${this._et("layout_tabs")}</button>
          </div>
        </div>

        <div class="slider-row">
          <span class="slider-label">${this._et("max_departures")}</span>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            .value=${String(cfg.max_departures)}
            @keydown=${this._swallowKeys}
            @keyup=${this._swallowKeys}
            @keypress=${this._swallowKeys}
            @change=${(ev: Event) =>
              this._setMaxDepartures(Number((ev.target as HTMLInputElement).value))}
          />
          <span class="slider-value">${cfg.max_departures}</span>
        </div>

        ${this._renderSwitch("show_accessibility", cfg.show_accessibility)}
        ${this._renderSwitch("show_type_icon", cfg.show_type_icon)}
        ${this._renderSwitch("show_traffic_info", cfg.show_traffic_info)}
        ${this._renderSwitch("show_elevator_info", cfg.show_elevator_info)}
        ${this._renderSwitch("show_delay", cfg.show_delay)}
        ${this._renderSwitch("hide_attribution", cfg.hide_attribution)}
      </div>
    `;
  }

  private _renderSwitch(field: ToggleField, checked: boolean): TemplateResult {
    const id = `wl-${field.replace(/_/g, "-")}-toggle`;
    return html`
      <div class="toggle-row">
        <label for=${id}>${this._et(field)}</label>
        <ha-switch
          id=${id}
          .checked=${checked}
          @change=${(ev: Event) =>
            this._toggleField(field, (ev.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>
    `;
  }

  private _renderColorsSection(): TemplateResult {
    const cfg = this._config!;
    const lines = collectLinesInSelection(this.hass, cfg.entities.map((s) => s.entity));
    const overrides = cfg.line_colors;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_colors")}</div>
        <div class="editor-hint">${this._et("colors_hint")}</div>
        ${lines.length
          ? lines.map((line) => {
              const current = colorForLine(line, overrides, "#888888");
              const hex = current.startsWith("#") ? current : "#888888";
              const hasOverride = Boolean(overrides[line.toUpperCase()]);
              return html`
                <div class="color-row">
                  <div class="line-preview" aria-hidden="true" style=${styleMap({ background: current })}>${line}</div>
                  <span>${line}</span>
                  <input
                    type="color"
                    aria-label=${this._et("pick_color_for_line").replace("{line}", line)}
                    .value=${hex}
                    @change=${(ev: Event) =>
                      this._setLineColor(line, (ev.target as HTMLInputElement).value)}
                  />
                  <button
                    type="button"
                    class="reset-btn"
                    ?disabled=${!hasOverride}
                    @click=${() => hasOverride && this._resetLineColor(line)}
                  >${this._et("reset_color")}</button>
                </div>
              `;
            })
          : html`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
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
    .entity-chips, .line-chips {
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
    .stop-filter {
      padding: 8px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stop-filter-header {
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .stop-filter-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stop-filter-row-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }
    .direction-buttons {
      display: inline-flex;
      gap: 4px;
    }
    .direction-buttons button {
      padding: 10px 16px;
      border-radius: 22px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      min-height: 44px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .color-row {
      display: grid;
      grid-template-columns: 44px 1fr auto auto;
      align-items: center;
      gap: 10px;
    }
    .color-row .line-preview {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.9em;
    }
    .color-row input[type="color"] {
      width: 40px;
      height: 28px;
      padding: 0;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
    }
    .color-row .reset-btn {
      font-size: 0.6875rem;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .color-row .reset-btn[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slider-row input[type="range"] {
      flex: 1;
      accent-color: var(--primary-color);
    }
    .slider-row .slider-label {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      min-width: 180px;
    }
    .slider-value {
      min-width: 24px;
      text-align: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--primary-color);
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
    .walk-time-input::-webkit-outer-spin-button,
    .walk-time-input::-webkit-inner-spin-button {
      margin: 0;
    }
  `;
}
