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

import { html, nothing, type TemplateResult } from "lit";
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

/** Pictures for the multi-stop layout's box select: two stop panels stacked,
 *  or one panel under a tab strip. Inline SVG data URIs so the bundle needs no
 *  asset files; a dark variant because ha-form shows `src_dark` on dark themes
 *  and a light-grey drawing would vanish there. */
const layoutImage = (body: string, ink: string, fill: string, fill2: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 44" fill="none" stroke="${ink}" stroke-width="1.5">${body
      .replaceAll("FILL2", fill2)
      .replaceAll("FILL", fill)}</svg>`,
  )}`;
const STACKED_SVG =
  '<rect x="14" y="4" width="44" height="16" rx="3" fill="FILL"/><rect x="14" y="24" width="44" height="16" rx="3" fill="FILL2"/><path d="M19 12h14M19 32h14"/>';
const TABS_SVG =
  '<rect x="14" y="10" width="44" height="30" rx="3" fill="FILL"/><path d="M14 10h14V4h14v6" fill="FILL2"/><path d="M19 22h20M19 30h14"/>';
const LAYOUT_IMAGES = {
  stacked: {
    src: layoutImage(STACKED_SVG, "#5b6470", "#d4e9f2", "#b7d9e8"),
    src_dark: layoutImage(STACKED_SVG, "#a9b1b8", "#1f3f4c", "#2a5869"),
  },
  tabs: {
    src: layoutImage(TABS_SVG, "#5b6470", "#d4e9f2", "#b7d9e8"),
    src_dark: layoutImage(TABS_SVG, "#a9b1b8", "#1f3f4c", "#2a5869"),
  },
} as const;

/** Joins the values a section header names, ` · ` between them. */
const joinSummary = (parts: ReadonlyArray<string | null>): string =>
  parts.filter((p): p is string => Boolean(p)).join(" · ");

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
  // Section summaries
  //
  // Each section header names what the section is set to, so the user can
  // read the card's state down the right edge without parsing every switch.
  // ------------------------------------------------------------------

  private _layoutSummary(cfg: NormalisedModernConfig): string {
    const { et } = this._i18n;
    const list = cfg.show_departures && cfg.max_departures > 0;
    return joinSummary([
      cfg.hide_header ? et("summary_header_off") : null,
      cfg.show_hero_metric ? et("summary_hero") : null,
      list
        ? cfg.max_departures === 1
          ? et("summary_departure_one")
          : et("summary_departures").replace("{n}", String(cfg.max_departures))
        : et("summary_no_list"),
      cfg.show_stops_ahead ? et("summary_stops_ahead") : null,
    ]);
  }

  private _transfersSummary(cfg: NormalisedModernConfig): string {
    const { et } = this._i18n;
    const n = cfg.stops_ahead_modes.length;
    if (!cfg.show_stops_ahead) return et("summary_off");
    if (n === TRANSFER_MODES.length) return et("summary_all_modes");
    if (n === 0) return et("summary_no_modes");
    return et("summary_some_modes")
      .replace("{n}", String(n))
      .replace("{total}", String(TRANSFER_MODES.length));
  }

  private _rowSummary(cfg: NormalisedModernConfig): string {
    const { et } = this._i18n;
    return (
      joinSummary([
        cfg.show_platform ? et("summary_platform") : null,
        cfg.show_accessibility
          ? et(cfg.accessibility_only ? "summary_step_free_only" : "summary_step_free")
          : null,
        cfg.show_cooling ? et("summary_cooling") : null,
        cfg.show_type_icon ? et("summary_type_icon") : null,
      ]) || et("summary_row_bare")
    );
  }

  private _disruptionsSummary(cfg: NormalisedModernConfig): string {
    const { et } = this._i18n;
    return (
      joinSummary([
        cfg.show_traffic_info ? et("summary_alerts") : null,
        cfg.show_elevator_info ? et("summary_elevators") : null,
        cfg.show_delay
          ? et(cfg.show_delay_colors ? "summary_delays_colored" : "summary_delays")
          : null,
      ]) || et("summary_off")
    );
  }

  private _colorsSummary(cfg: NormalisedModernConfig): string {
    const { et } = this._i18n;
    const n = Object.keys(cfg.line_colors).length;
    return n
      ? et("summary_colors_changed").replace("{n}", String(n))
      : et("summary_colors_official");
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
        hint: this._layoutSummary(cfg),
        data: {
          layout: cfg.layout,
          max_departures: cfg.max_departures,
          hide_header: cfg.hide_header,
          show_hero_metric: cfg.show_hero_metric,
          show_departures: cfg.show_departures,
          show_departure_time: cfg.show_departure_time,
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
                mode: "box",
                options: [
                  {
                    value: "stacked",
                    label: et("layout_stacked"),
                    description: et("layout_stacked_description"),
                    image: LAYOUT_IMAGES.stacked,
                  },
                  {
                    value: "tabs",
                    label: et("layout_tabs"),
                    description: et("layout_tabs_description"),
                    image: LAYOUT_IMAGES.tabs,
                  },
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
          { name: "show_departure_time", selector: { boolean: {} } },
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
        hint: this._rowSummary(cfg),
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
        hint: this._disruptionsSummary(cfg),
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
      { title: et("section_transfers"), hint: this._transfersSummary(cfg) },
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
        hint: et(cfg.hide_attribution ? "summary_credit_hidden" : "summary_credit_shown"),
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
      { title: et("section_colors"), hint: this._colorsSummary(cfg) },
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
              // The reset button only exists while an override does: with
              // nothing to reset there is nothing to offer, and a permanently
              // greyed-out button beside every line is noise (house rule:
              // reset appears only when there is something to reset).
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
                  ${overridden
                    ? html`<button
                        type="button"
                        class="wl-icon-btn"
                        aria-label=${et("reset_color_aria").replace("{line}", line)}
                        title=${et("reset_color")}
                        @click=${() => this._resetLineColor(line)}
                      >
                        <ha-icon icon="mdi:restore" aria-hidden="true"></ha-icon>
                      </button>`
                    : nothing}
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
