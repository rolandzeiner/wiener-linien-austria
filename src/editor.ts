// Lovelace editor for the Wiener Linien Austria modern card (v2 editor system).
//
// Three tabs, flat sections, one shared stop block — see editor-shell.ts for
// why the structure is what it is.
//
// v1's modern editor was the worst offender on structure: seventeen fields in
// a single collapsible section, with no grouping by what the user was trying
// to do. Those seventeen are now three sections named after card regions
// (Aufbau / Abfahrtszeile / Störungen & Verspätungen), so "hide the platform
// number" is one tab away rather than twenty-five rows down.
//
// One invariant carried over from v1, load-bearing: the **storage-shape
// translator** at the entities boundary. ha-form's entity selector with
// `multiple: true` emits a flat `string[]`, while the saved config carries
// per-stop overrides. Without the translator (`rebuildStops`, wired up in
// MultiStopEditor) every add/remove cycle would silently wipe every stop's
// lines, direction and walk times.

import { html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { MultiStopEditor } from "./editor/board-editor.js";
import { renderFormSection, renderSection } from "./editor/editor-shell.js";
import {
  lineChipColors,
  normaliseModernConfig,
  type NormalisedModernConfig,
} from "./utils/config.js";
import { colorSchemeOf } from "./utils/color.js";
import {
  TRANSFER_MODES,
  TRANSFER_MODE_ICONS,
  type TransferMode,
} from "./utils/mot.js";
import { collectLinesInSelection } from "./utils/departures.js";
import { mergeLineColorsMaps } from "./utils/entities.js";

/** Editor label key per transfer mode. Spelled out rather than built as
 *  `mode_${mode}`: the orphaned-key check in localize/localize.test.ts finds a
 *  string by grepping the source for its leaf, so an interpolated key reads as
 *  unreferenced and the catalogue entry looks safe to delete. */
const TRANSFER_MODE_LABEL_KEYS: Readonly<Record<TransferMode, string>> = {
  metro: "mode_metro",
  sbahn: "mode_sbahn",
  tram: "mode_tram",
  badner: "mode_badner",
  bus: "mode_bus",
  night: "mode_night",
};

@customElement("wiener-linien-austria-card-editor")
export class WienerLinienAustriaCardEditor extends MultiStopEditor<NormalisedModernConfig> {
  protected readonly _namespace = "modern";

  protected override _normalise(raw: Record<string, unknown>): NormalisedModernConfig {
    return normaliseModernConfig(raw);
  }

  protected override _lineColorOverrides(cfg: NormalisedModernConfig): Record<string, string> {
    return cfg.line_colors;
  }

  protected override _helperOverrides(
    cfg: NormalisedModernConfig,
  ): Record<string, string | undefined> {
    const { et } = this._i18n;
    return {
      ...(cfg.show_accessibility
        ? {}
        : { accessibility_only: et("accessibility_only_requires") }),
      ...(cfg.show_delay ? {} : { show_delay_colors: et("show_delay_colors_requires") }),
      ...(cfg.show_stops_ahead
        ? {}
        : { show_stop_times: et("show_stop_times_requires") }),
      ...(cfg.entities.length >= 2 ? {} : { layout: et("layout_requires") }),
    };
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override _renderDisplay(cfg: NormalisedModernConfig): TemplateResult {
    const { et } = this._i18n;
    return html`
      ${renderFormSection({
        ...this._form,
        title: et("section_layout"),
        hint: et("section_layout_hint"),
        data: {
          layout: cfg.layout,
          max_departures: cfg.max_departures,
          hide_header: cfg.hide_header,
          show_hero_metric: cfg.show_hero_metric,
          show_departures: cfg.show_departures,
          show_stops_ahead: cfg.show_stops_ahead,
          show_stop_times: cfg.show_stop_times,
          show_qr_button: cfg.show_qr_button,
        },
        schema: [
          {
            name: "layout",
            // Only meaningful with more than one stop — with a single stop
            // there is nothing to stack or tab between.
            disabled: cfg.entities.length < 2,
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "stacked", label: et("layout_stacked") },
                  { value: "tabs", label: et("layout_tabs") },
                ],
              },
            },
          },
          {
            name: "max_departures",
            selector: { number: { min: 0, max: 20, step: 1, mode: "slider" } },
          },
          { name: "hide_header", selector: { boolean: {} } },
          { name: "show_hero_metric", selector: { boolean: {} } },
          { name: "show_departures", selector: { boolean: {} } },
          { name: "show_stops_ahead", selector: { boolean: {} } },
          {
            name: "show_stop_times",
            disabled: !cfg.show_stops_ahead,
            selector: { boolean: {} },
          },
          { name: "show_qr_button", selector: { boolean: {} } },
        ],
      })}
      ${this._renderTransferModes(cfg)}
      ${renderFormSection({
        ...this._form,
        title: et("section_departure_row"),
        hint: et("section_departure_row_hint"),
        data: {
          show_platform: cfg.show_platform,
          show_accessibility: cfg.show_accessibility,
          accessibility_only: cfg.accessibility_only,
          show_cooling: cfg.show_cooling,
          show_type_icon: cfg.show_type_icon,
        },
        schema: [
          { name: "show_platform", selector: { boolean: {} } },
          { name: "show_accessibility", selector: { boolean: {} } },
          {
            name: "accessibility_only",
            disabled: !cfg.show_accessibility,
            selector: { boolean: {} },
          },
          { name: "show_cooling", selector: { boolean: {} } },
          { name: "show_type_icon", selector: { boolean: {} } },
        ],
      })}
      ${renderFormSection({
        ...this._form,
        title: et("section_disruptions"),
        data: {
          show_traffic_info: cfg.show_traffic_info,
          show_elevator_info: cfg.show_elevator_info,
          show_delay: cfg.show_delay,
          show_delay_colors: cfg.show_delay_colors,
        },
        schema: [
          { name: "show_traffic_info", selector: { boolean: {} } },
          { name: "show_elevator_info", selector: { boolean: {} } },
          { name: "show_delay", selector: { boolean: {} } },
          {
            name: "show_delay_colors",
            disabled: !cfg.show_delay,
            selector: { boolean: {} },
          },
        ],
      })}
    `;
  }

  /** Which vehicle categories get a transfer chip in the stops-ahead trail.
   *
   *  A chip row rather than a `boolean` schema row per category: near-
   *  identical switches distinguish themselves only by their words, whereas a glyph
   *  reads at a glance — and the row visually rhymes with the chips it
   *  governs in the card. It reuses `.wl-chip`, the stop block's line-toggle
   *  idiom, deliberately WITHOUT a colour override: a category is not a line,
   *  and painting "Metro" in U1's red would assert something untrue. The
   *  glyph identifies, the accent fill carries state.
   *
   *  Bespoke rather than a `select` with `multiple: true` for the same reason
   *  the line colours are bespoke — this is a set, and ha-form's multi-select
   *  renders it as a dropdown of words. */
  private _renderTransferModes(cfg: NormalisedModernConfig): TemplateResult {
    const { et } = this._i18n;
    // The chips govern the stops-ahead trail, so with the trail switched off
    // there is nothing for them to act on.
    const inert = !cfg.show_stops_ahead;
    const picked = new Set(cfg.stops_ahead_modes);

    return renderSection(
      { title: et("section_transfers"), hint: et("section_transfers_hint") },
      html`<div class="wl-group">
        <span class="wl-note">
          ${inert ? et("transfer_modes_requires") : et("transfer_modes_hint")}
        </span>
        <div class="wl-chips">
          ${TRANSFER_MODES.map((mode) => {
            const on = picked.has(mode);
            const label = et(TRANSFER_MODE_LABEL_KEYS[mode]);
            return html`<button
              type="button"
              class="wl-chip"
              aria-pressed=${on ? "true" : "false"}
              aria-disabled=${inert ? "true" : "false"}
              aria-label=${et(on ? "mode_shown_aria" : "mode_hidden_aria").replace(
                "{mode}",
                label,
              )}
              @click=${(ev: Event) => {
                // aria-disabled, not `disabled` — see dirButton in
                // editor/stop-block.ts for why the button stays focusable.
                if (inert) {
                  ev.preventDefault();
                  return;
                }
                this._toggleTransferMode(mode);
              }}
            >
              <span class="wl-chip-mode"
                ><ha-icon icon=${TRANSFER_MODE_ICONS[mode]} aria-hidden="true"></ha-icon
              ></span>
              ${label}
            </button>`;
          })}
        </div>
      </div>`,
    );
  }

  private _toggleTransferMode(mode: TransferMode): void {
    const cfg = this._config;
    if (!cfg) return;
    const next = cfg.stops_ahead_modes.includes(mode)
      ? cfg.stops_ahead_modes.filter((m) => m !== mode)
      : [...cfg.stops_ahead_modes, mode];
    // Through the normaliser so the saved order stays signage order rather
    // than click order.
    this._patch({ stops_ahead_modes: next });
  }

  protected override _renderTweaks(cfg: NormalisedModernConfig): TemplateResult {
    const { et } = this._i18n;
    return html`
      ${this._renderColors(cfg)}
      ${renderFormSection({
        ...this._form,
        title: et("section_footer"),
        data: { hide_attribution: cfg.hide_attribution },
        schema: [{ name: "hide_attribution", selector: { boolean: {} } }],
      })}
    `;
  }

  /** Per-line colour overrides. Bespoke because this is a Record whose keys are
   *  discovered at runtime from the selected stops — exactly the residue
   *  ha-form is not meant to model. Only lines currently in the selection get a
   *  row; an override for a line no longer selected stays in the config
   *  untouched rather than being silently dropped. */
  private _renderColors(cfg: NormalisedModernConfig): TemplateResult {
    const { et } = this._i18n;
    const eids = cfg.entities.map((s) => s.entity);
    const lines = collectLinesInSelection(this.hass, eids);
    const gtfs = mergeLineColorsMaps(this.hass, eids);

    return renderSection(
      { title: et("section_colors"), hint: et("section_colors_hint") },
      lines.length
        ? html`<div class="wl-group">
            <span class="wl-note">${et("colors_hint")}</span>
            ${lines.map((line) => {
              // Same palette ladder the chips and badges use, so the preview
              // badge here matches what the stop block paints for this line.
              const palette = lineChipColors(
                line,
                cfg.line_colors,
                gtfs,
                colorSchemeOf(this.hass),
                "#888888",
              );
              const current = palette.fill;
              const hex = current.startsWith("#") ? current : "#888888";
              // Real `disabled` on the reset button below, not the stop
              // block's aria-disabled idiom: with no override in place there is
              // genuinely nothing to reset, and the swatch already shows that.
              // aria-disabled is reserved for options whose unavailability is
              // itself information the user needs (see dirButton).
              const overridden = Boolean(cfg.line_colors[line.toUpperCase()]);
              const pick = et("pick_color_for_line").replace("{line}", line);
              return html`
                <div class="wl-color-row">
                  <span
                    class="wl-badge"
                    style=${styleMap({
                      background: current,
                      ...(palette.ink ? { "--wl-chip-ink": palette.ink } : {}),
                    })}
                    aria-hidden="true"
                    >${line}</span
                  >
                  <label class="wl-color-field" title=${pick}>
                    <span
                      class="wl-swatch"
                      style=${styleMap({ background: hex })}
                      aria-hidden="true"
                    ></span>
                    <span class="wl-color-hex">${hex.toUpperCase()}</span>
                    <input
                      type="color"
                      class="wl-color-input"
                      .value=${hex}
                      aria-label=${pick}
                      @input=${(ev: Event) =>
                        this._setLineColor(line, (ev.target as HTMLInputElement).value)}
                      @change=${(ev: Event) =>
                        this._setLineColor(line, (ev.target as HTMLInputElement).value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="wl-icon-btn"
                    ?disabled=${!overridden}
                    aria-label=${et("reset_color_aria").replace("{line}", line)}
                    title=${et("reset_color")}
                    @click=${() => this._resetLineColor(line)}
                  >
                    <ha-icon icon="mdi:restore" aria-hidden="true"></ha-icon>
                  </button>
                </div>
              `;
            })}
          </div>`
        : html`<div class="wl-empty">
            <span class="wl-empty-title">${et("no_lines_title")}</span>
            <span class="wl-note">${et("colors_empty_hint")}</span>
          </div>`,
    );
  }

  /** Both `@input` and `@change` are wired on purpose: `input` fires
   *  continuously while the user drags inside the OS picker, `change` once on
   *  commit. Without `input` the card preview only recolours after the picker
   *  closes, so the user cannot see the colour they are choosing. */
  private _setLineColor(line: string, color: string): void {
    if (!this._config) return;
    this._commit({
      ...this._config,
      line_colors: { ...this._config.line_colors, [line.toUpperCase()]: color },
    });
  }

  private _resetLineColor(line: string): void {
    if (!this._config) return;
    const line_colors = { ...this._config.line_colors };
    delete line_colors[line.toUpperCase()];
    this._commit({ ...this._config, line_colors });
  }
}
