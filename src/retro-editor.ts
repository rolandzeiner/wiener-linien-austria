// Lovelace editor for the Wiener Linien Austria retro card (v2 editor system).
//
// Same three tabs, same order, same flat sections as the modern and flap
// editors. Retro is the single-stop case of the shared stop block: it can
// still select multiple lines and configure their directions independently.
//
// v1 asked for direction and line as two ha-form dropdowns above a walk-time
// table, which is a third affordance for a job the other two editors did with
// chips. Routing retro through the same block is most of why the three editors
// are now one thing configured three ways.
//
// Direction choices are not autocorrected from live departures: a direction
// with no current service can still be a deliberate configuration.

import {
  LitElement,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { editorStyles } from "./editor/editor-styles.js";
import { editorTokens } from "./editor/editor-tokens.js";
import { headerStripStyles } from "./editor/header-strip-styles.js";
import { editorTranslators, type EditorTranslators } from "./editor/editor-i18n.js";
import {
  renderFormSection,
  renderPanel,
  renderTabs,
  type TabKey,
} from "./editor/editor-shell.js";
import { renderHeaderSection, type HeaderSideKey } from "./editor/header-strip.js";
import {
  renderStopBlock,
  type StopBlockCallbacks,
  type StopView,
} from "./editor/stop-block.js";
import type {
  HaFormSchema,
  HomeAssistant,
  LovelaceCardEditor,
  WienerLinienRetroCardConfig,
} from "./types.js";
import { fireEvent } from "./utils.js";
import {
  editorHelper,
  editorLabel,
} from "./editor/editor-common.js";
import { normaliseRetroConfig, type NormalisedRetroConfig } from "./utils/config.js";
import { departureBoardOptions } from "./utils/entities.js";

@customElement("wiener-linien-austria-retro-card-editor")
export class WienerLinienAustriaRetroCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRetroConfig;
  @state() private _tab: TabKey = "stops";
  @state() private _headerSide: HeaderSideKey = "header_left";

  public setConfig(config: WienerLinienRetroCardConfig): void {
    this._config = normaliseRetroConfig(config);
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (changed.has("_config") || changed.has("_tab") || changed.has("_headerSide")) {
      return true;
    }
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eid = this._config.entity;
    if (!eid) return true;
    return prev.states[eid] !== this.hass.states[eid];
  }

  private get _i18n(): EditorTranslators {
    return editorTranslators("retro", this.hass?.language);
  }

  /** Assign `_config` BEFORE dispatching — see editor/editor-common.ts.
   *  Centralised so the write paths cannot drift on the invariant. */
  private _commit(next: NormalisedRetroConfig): void {
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  private _patch(value: Record<string, unknown>): void {
    if (!this._config) return;
    this._commit(
      normaliseRetroConfig({
        ...this._config,
        ...(value as Partial<WienerLinienRetroCardConfig>),
      }),
    );
  }

  // ------------------------------------------------------------------
  // Stop block adapter — retro's flat config into the shared shape
  // ------------------------------------------------------------------

  private get _stopView(): StopView {
    const cfg = this._config!;
    return {
      entity: cfg.entity ?? "",
      lines: cfg.lines,
      // The block spells "both directions" as absence, the same as it does
      // for the modern and flap editors. Our config spells it "both": this
      // getter maps "both" to absence, and setDirections below maps it back.
      direction: cfg.direction === "both" ? undefined : cfg.direction,
      line_directions: cfg.line_directions,
      walk_times: cfg.walk_times,
    };
  }

  private get _stopCallbacks(): StopBlockCallbacks {
    return {
      toggleLine: (_eid, line) => {
        if (!this._config) return;
        const next = { ...this._config };
        const lines = new Set(next.lines ?? []);
        if (lines.has(line)) lines.delete(line);
        else lines.add(line);
        if (lines.size) {
          next.lines = [...lines];
          next.line = next.lines[0];
        } else {
          delete next.lines;
          delete next.line;
        }
        this._commit(next);
      },
      setDirections: (_eid, next) => {
        if (!this._config) return;
        // The block's null is "both"; persist that as the explicit value so
        // reopening the card doesn't read it back as an omission and snap to
        // the legacy H default.
        const cfg: NormalisedRetroConfig = {
          ...this._config,
          direction: next.direction ?? "both",
        };
        if (Object.keys(next.lineDirections).length) {
          cfg.line_directions = next.lineDirections;
        } else {
          delete cfg.line_directions;
        }
        this._commit(cfg);
      },
      setWalkTime: (_eid, key, minutes) => {
        if (!this._config) return;
        const cur = { ...(this._config.walk_times ?? {}) };
        if (minutes === null) delete cur[key];
        else cur[key] = minutes;
        const next: NormalisedRetroConfig = { ...this._config };
        if (Object.keys(cur).length) next.walk_times = cur;
        else delete next.walk_times;
        this._commit(next);
      },
    };
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
            { key: "stops", label: et("tab_stop") },
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
        return this._renderStop();
      case "display":
        return this._renderDisplay();
      case "tweaks":
        return this._renderTweaks();
    }
  }

  private _renderStop(): TemplateResult {
    const cfg = this._config!;
    const { t, et } = this._i18n;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ entity: cfg.entity }}
        .schema=${[
          {
            name: "entity",
            required: true,
            selector: {
              entity: {
                include_entities: departureBoardOptions(
                  this.hass,
                  cfg.entity ? [cfg.entity] : [],
                ),
              },
            },
          },
        ] satisfies ReadonlyArray<HaFormSchema>}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntityChanged}
      ></ha-form>
      ${cfg.entity
        ? renderStopBlock(
            this.hass,
            this._stopView,
            {
              index: 1,
              total: 1,
              lineColorOverrides: {},
              t,
              et,
            },
            this._stopCallbacks,
          )
        : nothing}
    `;
  }

  private _onEntityChanged = (
    ev: CustomEvent<{ value: Record<string, unknown> }>,
  ): void => {
    ev.stopPropagation();
    if (!this._config) return;
    const raw = ev.detail.value["entity"];
    const entity = typeof raw === "string" ? raw : undefined;
    if (entity === this._config.entity) return;

    const next: NormalisedRetroConfig = { ...this._config, entity };
    delete next.line;
    delete next.lines;
    delete next.line_directions;
    this._commit(next);
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
      ${renderHeaderSection({
        hass: this.hass,
        showHeader: cfg.show_header,
        left: cfg.header_left,
        right: cfg.header_right,
        selected: this._headerSide,
        et,
        computeLabel: this._computeLabel,
        computeHelper: this._computeHelper,
        currentSide: (side) => this._config?.[side],
        onChange: (v) => this._patch(v),
        selectSide: (side) => {
          this._headerSide = side;
        },
      })}
      ${renderFormSection({
        ...common,
        title: et("section_station"),
        data: { show_station_name: cfg.show_station_name, station_bg: cfg.station_bg },
        schema: [
          { name: "show_station_name", selector: { boolean: {} } },
          {
            name: "station_bg",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "default", label: et("station_bg_default") },
                  { value: "white", label: et("station_bg_white") },
                  { value: "black", label: et("station_bg_black") },
                ],
              },
            },
          },
        ],
      })}
      ${renderFormSection({
        ...common,
        title: et("section_departure_row"),
        hint: et("section_led_panel"),
        data: {
          show_platform: cfg.show_platform,
          platform_side: cfg.platform_side,
          accessibility_only: cfg.accessibility_only,
        },
        schema: [
          { name: "show_platform", selector: { boolean: {} } },
          {
            name: "platform_side",
            disabled: !cfg.show_platform,
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "auto", label: et("platform_side_auto") },
                  { value: "left", label: et("platform_side_left") },
                  { value: "right", label: et("platform_side_right") },
                ],
              },
            },
          },
          { name: "accessibility_only", selector: { boolean: {} } },
        ],
      })}
      ${renderFormSection({
        ...common,
        title: et("section_extras"),
        hint: et("section_extras_hint"),
        data: {
          message_ticker: cfg.message_ticker,
          message_text: cfg.message_text ?? "",
          wheelchair_race: cfg.wheelchair_race,
        },
        schema: [
          { name: "message_ticker", selector: { boolean: {} } },
          {
            name: "message_text",
            disabled: !cfg.message_ticker,
            selector: { text: {} },
          },
          { name: "wheelchair_race", selector: { boolean: {} } },
        ],
      })}
    `;
  }

  private _renderTweaks(): TemplateResult {
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
        title: et("section_led_panel"),
        // size and style lead: they are the coarse choices the rest of the
        // section refines, and they used to sit a tab away from the tweaks
        // that modify the same surface.
        data: {
          size: cfg.size,
          style: cfg.style,
          show_unit: cfg.show_unit,
          show_line_pill: cfg.show_line_pill,
          line_stripe: cfg.line_stripe,
          housing: cfg.housing,
          flicker: cfg.flicker,
        },
        schema: [
          {
            name: "size",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "small", label: et("size_small") },
                  { value: "medium", label: et("size_medium") },
                  { value: "regular", label: et("size_regular") },
                ],
              },
            },
          },
          {
            name: "style",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "classic", label: et("style_classic") },
                  { value: "warm", label: et("style_warm") },
                  { value: "pixel", label: et("style_pixel") },
                ],
              },
            },
          },
          { name: "show_unit", selector: { boolean: {} } },
          { name: "show_line_pill", selector: { boolean: {} } },
          { name: "line_stripe", selector: { boolean: {} } },
          { name: "housing", selector: { boolean: {} } },
          { name: "flicker", selector: { boolean: {} } },
        ],
      })}
    `;
  }

  private _computeLabel = (field: { name: string }): string =>
    editorLabel(this.hass, this._i18n, field.name);

  private _computeHelper = (field: { name: string }): string | undefined => {
    const { et } = this._i18n;
    return editorHelper(this._i18n, field.name, {
      ...(this._config?.message_ticker
        ? {}
        : { message_text: et("message_text_requires") }),
      ...(this._config?.show_platform
        ? {}
        : { platform_side: et("platform_side_requires") }),
    });
  };

  static override styles: CSSResultGroup = [
    editorTokens,
    editorStyles,
    // Only the two cards that render the strip pay for its rules.
    headerStripStyles,
  ];
}
