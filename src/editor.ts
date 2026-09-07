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
// Two invariants carried over from v1, both load-bearing:
//
// * **Storage-shape translator** at the entities boundary — ha-form's entity
//   selector with `multiple: true` emits a flat `string[]`, while the saved
//   config carries per-stop overrides. Without the translator every add/remove
//   cycle would silently wipe every stop's lines, direction and walk times.
//
// * **`_config` before `fireEvent`** — see `multiStopCallbacks` in
//   editor/editor-common.ts.

import {
  LitElement,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { editorStyles } from "./editor/editor-styles.js";
import { editorTokens } from "./editor/editor-tokens.js";
import { editorTranslators, type EditorTranslators } from "./editor/editor-i18n.js";
import {
  renderFormSection,
  renderPanel,
  renderSection,
  renderTabs,
  type TabKey,
} from "./editor/editor-shell.js";
import { renderStopBlock, type StopBlockCallbacks } from "./editor/stop-block.js";
import {
  editorHelper,
  editorLabel,
  multiStopCallbacks,
  rebuildStops,
} from "./editor/editor-common.js";
import type {
  HaFormSchema,
  HomeAssistant,
  LovelaceCardEditor,
  WienerLinienCardConfig,
} from "./types.js";
import { fireEvent } from "./utils.js";
import {
  lineChipColors,
  normaliseModernConfig,
  type NormalisedModernConfig,
  type NormalisedModernStop,
} from "./utils/config.js";
import { colorSchemeOf } from "./utils/color.js";
import { collectLinesInSelection } from "./utils/departures.js";
import { firstLineColorsMap } from "./utils/entities.js";

@customElement("wiener-linien-austria-card-editor")
export class WienerLinienAustriaCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedModernConfig;
  @state() private _tab: TabKey = "stops";

  public setConfig(config: WienerLinienCardConfig): void {
    this._config = normaliseModernConfig(config);
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (changed.has("_config") || changed.has("_tab")) return true;
    // hass fires for every state change anywhere in HA — only re-render when
    // one of the configured entities actually changed.
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eids = this._config.entities.map((s) => s.entity);
    return eids.some((eid) => prev.states[eid] !== this.hass!.states[eid]);
  }

  private get _i18n(): EditorTranslators {
    return editorTranslators("modern", this.hass?.language);
  }

  private _commit(next: NormalisedModernConfig): void {
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  private _patch(value: Record<string, unknown>): void {
    if (!this._config) return;
    // Spread the existing config first so dashboard passthrough fields AND
    // `type` survive — ha-form's value carries neither.
    this._commit(normaliseModernConfig({ ...this._config, ...value }));
  }

  private get _stopCallbacks(): StopBlockCallbacks {
    return multiStopCallbacks<NormalisedModernStop>(
      () => this._config?.entities,
      (entities) => {
        if (this._config) this._commit({ ...this._config, entities });
      },
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const { et } = this._i18n;
    return html`
      <div class="wl-editor">
        ${renderTabs(
          [
            { key: "stops", label: et("tab_stops") },
            { key: "display", label: et("tab_display") },
            { key: "tweaks", label: et("tab_tweaks") },
          ],
          this._tab,
          (key) => {
            this._tab = key;
          },
        )}
        ${renderPanel(this._tab, this._renderActiveTab())}
      </div>
    `;
  }

  private _renderActiveTab(): TemplateResult | typeof nothing {
    switch (this._tab) {
      case "stops":
        return this._renderStops();
      case "display":
        return this._renderDisplay();
      case "tweaks":
        return this._renderMisc();
    }
  }

  private _renderStops(): TemplateResult {
    const cfg = this._config!;
    const { t, et } = this._i18n;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ entities: cfg.entities.map((s) => s.entity) }}
        .schema=${[
          {
            name: "entities",
            required: true,
            selector: {
              entity: {
                multiple: true,
                filter: { domain: "sensor", integration: "wiener_linien_austria" },
              },
            },
          },
        ] satisfies ReadonlyArray<HaFormSchema>}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntitiesChanged}
      ></ha-form>
      ${cfg.entities.map((stop, i) =>
        renderStopBlock(
          this.hass,
          stop,
          {
            index: i + 1,
            total: cfg.entities.length,
            lineColorOverrides: cfg.line_colors,
            t,
            et,
          },
          this._stopCallbacks,
        ),
      )}
    `;
  }

  private _onEntitiesChanged = (
    ev: CustomEvent<{ value: Record<string, unknown> }>,
  ): void => {
    ev.stopPropagation();
    if (!this._config) return;
    this._commit(
      normaliseModernConfig({
        ...this._config,
        entities: rebuildStops(this._config.entities, ev.detail.value["entities"]),
      }),
    );
  };

  private _renderDisplay(): TemplateResult {
    const cfg = this._config!;
    const { et } = this._i18n;
    const common = {
      hass: this.hass,
      computeLabel: this._computeLabel,
      computeHelper: this._computeHelper,
      onChange: (v: Record<string, unknown>) => this._patch(v),
    };

    return html`
      ${renderFormSection({
        ...common,
        title: et("section_layout"),
        hint: et("section_layout_hint"),
        data: {
          layout: cfg.layout,
          max_departures: cfg.max_departures,
          hide_header: cfg.hide_header,
          show_hero_metric: cfg.show_hero_metric,
          show_departures: cfg.show_departures,
          show_stops_ahead: cfg.show_stops_ahead,
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
          { name: "show_qr_button", selector: { boolean: {} } },
        ],
      })}
      ${renderFormSection({
        ...common,
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
        ...common,
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

  private _renderMisc(): TemplateResult {
    const cfg = this._config!;
    const { et } = this._i18n;
    return html`
      ${this._renderColors()}
      ${renderFormSection({
        hass: this.hass,
        title: et("section_footer"),
        data: { hide_attribution: cfg.hide_attribution },
        schema: [{ name: "hide_attribution", selector: { boolean: {} } }],
        computeLabel: this._computeLabel,
        computeHelper: this._computeHelper,
        onChange: (v) => this._patch(v),
      })}
    `;
  }

  /** Per-line colour overrides. Bespoke because this is a Record whose keys are
   *  discovered at runtime from the selected stops — exactly the residue
   *  ha-form is not meant to model. Only lines currently in the selection get a
   *  row; an override for a line no longer selected stays in the config
   *  untouched rather than being silently dropped. */
  private _renderColors(): TemplateResult {
    const cfg = this._config!;
    const { et } = this._i18n;
    const eids = cfg.entities.map((s) => s.entity);
    const lines = collectLinesInSelection(this.hass, eids);
    const gtfs = firstLineColorsMap(this.hass, eids);

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

  private _computeLabel = (field: { name: string }): string =>
    editorLabel(this.hass, this._i18n, field.name);

  private _computeHelper = (field: { name: string }): string | undefined => {
    const { et } = this._i18n;
    const cfg = this._config;
    return editorHelper(this._i18n, field.name, {
      ...(cfg?.show_accessibility
        ? {}
        : { accessibility_only: et("accessibility_only_requires") }),
      ...(cfg?.show_delay ? {} : { show_delay_colors: et("show_delay_colors_requires") }),
      ...((cfg?.entities.length ?? 0) >= 2 ? {} : { layout: et("layout_requires") }),
    });
  };

  static override styles: CSSResultGroup = [editorTokens, editorStyles];
}
