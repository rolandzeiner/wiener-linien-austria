// Lovelace editor for the Wiener Linien Austria flap card (v2 editor system).
//
// Three tabs — Stops / Anzeige / Feinheiten — in the same order as the modern
// and retro editors, so what you learn in one transfers to the others. Inside a
// tab the content is a flat list of sections; there is no `expandable`
// anywhere, which is what retires v1's `flatten: true` footgun along with the
// two-collapse-level header config nobody could find.
//
// Everything ha-form can express goes through ha-form, one schema slice per
// section. What is left bespoke is the residue ha-form genuinely cannot model:
// the per-stop line/direction filters and walk-time Record (keys discovered
// from live departures), and the station-header strip, whose whole point is
// that you edit it on a picture of the bar.
//
// Editor `_config` lifecycle gotcha, unchanged from v1: custom editors do NOT
// receive a re-`setConfig()` after dispatching `config-changed`, so `_commit`
// assigns `this._config` BEFORE firing. A fireEvent-only path leaves `_config`
// stale and the next render reverts the form to its pre-change value.

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
import { editorTranslators, type EditorTranslators } from "./editor/editor-i18n.js";
import {
  renderFormSection,
  renderPanel,
  renderSection,
  renderTabs,
  type TabKey,
} from "./editor/editor-shell.js";
import {
  renderHeaderStrip,
  type HeaderSideKey,
} from "./editor/header-strip.js";
import { renderStopBlock, type StopBlockCallbacks } from "./editor/stop-block.js";
import {
  editorHelper,
  editorLabel,
  multiStopCallbacks,
  patchHeaderSide,
  rebuildStops,
} from "./editor/editor-common.js";
import type {
  HaFormSchema,
  HomeAssistant,
  LovelaceCardEditor,
  RetroHeaderSide,
  WienerLinienAttrs,
  WienerLinienFlapCardConfig,
} from "./types.js";
import { fireEvent } from "./utils.js";
import {
  normaliseFlapConfig,
  type NormalisedFlapConfig,
  type NormalisedFlapStop,
} from "./utils/flap-config.js";

@customElement("wiener-linien-austria-flap-card-editor")
export class WienerLinienAustriaFlapCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedFlapConfig;
  @state() private _tab: TabKey = "stops";
  /** Which header side the slot panel is editing. Editor-local UI state — it
   *  never reaches the config, and resetting it on dialog reopen is fine. */
  @state() private _headerSide: HeaderSideKey = "header_left";

  public setConfig(config: WienerLinienFlapCardConfig): void {
    // Mirror the card's setConfig guards. Without them malformed YAML silently
    // becomes an empty config in the editor — the user opens it, sees defaults,
    // and may overwrite a broken-but-recoverable file.
    if (!config || typeof config !== "object") {
      throw new Error(
        "wiener-linien-austria-flap-card-editor: config must be an object",
      );
    }
    if (config.entity !== undefined && typeof config.entity !== "string") {
      throw new Error(
        "wiener-linien-austria-flap-card-editor: 'entity' must be a string",
      );
    }
    this._config = normaliseFlapConfig(config);
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (changed.has("_config") || changed.has("_tab") || changed.has("_headerSide")) {
      return true;
    }
    // hass fires for every state tick across HA — only re-render when one of
    // the configured entities actually changed.
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eids = this._config.entities.map((s) => s.entity);
    if (eids.length === 0) return true;
    return eids.some((eid) => prev.states[eid] !== this.hass!.states[eid]);
  }

  private get _i18n(): EditorTranslators {
    return editorTranslators("flap", this.hass?.language);
  }

  private _commit(next: NormalisedFlapConfig): void {
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  /** Merge one section form's partial value into the config. Sections emit
   *  only their own fields, so this is a merge, never a replace. */
  private _patch(value: Record<string, unknown>): void {
    if (!this._config) return;
    this._commit(
      normaliseFlapConfig({
        ...this._config,
        ...(value as Partial<WienerLinienFlapCardConfig>),
      } as WienerLinienFlapCardConfig),
    );
  }

  private get _stopCallbacks(): StopBlockCallbacks {
    return multiStopCallbacks<NormalisedFlapStop>(
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
        return this._renderTweaks();
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
            lineColorOverrides: {},
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
    // Re-normalise, matching the modern editor: a bare `{ entity }` placeholder
    // is a raw stop entry, and the normaliser is what validates and dedupes it.
    this._commit(
      normaliseFlapConfig({
        ...this._config,
        entities: rebuildStops(this._config.entities, ev.detail.value["entities"]),
      } as WienerLinienFlapCardConfig),
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
      ${renderSection(
        { title: et("section_header"), hint: et("section_header_hint") },
        html`
          <ha-form
            .hass=${this.hass}
            .data=${{ show_header: cfg.show_header }}
            .schema=${[
              { name: "show_header", selector: { boolean: {} } },
            ] satisfies ReadonlyArray<HaFormSchema>}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${(ev: CustomEvent<{ value: Record<string, unknown> }>) => {
              ev.stopPropagation();
              this._patch(ev.detail.value);
            }}
          ></ha-form>
          ${cfg.show_header
            ? renderHeaderStrip(
                {
                  left: cfg.header_left,
                  right: cfg.header_right,
                  selected: this._headerSide,
                  et,
                },
                {
                  selectSide: (side) => {
                    this._headerSide = side;
                  },
                  patch: (side, field, value) => this._patchHeaderSide(side, field, value),
                },
              )
            : nothing}
        `,
      )}
      ${renderFormSection({
        ...common,
        title: et("section_station"),
        data: { show_station_name: cfg.show_station_name, station_bg: cfg.station_bg },
        schema: [
          { name: "show_station_name", selector: { boolean: {} } },
          {
            name: "station_bg",
            selector: {
              select: { mode: "dropdown", options: this._stationBgOptions() },
            },
          },
        ],
      })}
      ${renderFormSection({
        ...common,
        title: et("section_display"),
        hint: et("section_display_hint"),
        data: {
          max_rows: cfg.max_rows,
          show_platform: cfg.show_platform,
          show_accessibility: cfg.show_accessibility,
          accessibility_only: cfg.accessibility_only,
        },
        schema: [
          { name: "max_rows", selector: { number: { min: 1, max: 8, step: 1, mode: "slider" } } },
          { name: "show_platform", selector: { boolean: {} } },
          { name: "show_accessibility", selector: { boolean: {} } },
          {
            name: "accessibility_only",
            // Shown disabled with the reason in its helper rather than hidden.
            // Hiding a dependent field makes the user hunt for a row that
            // vanished; disabling it teaches the rule. (`visible:` would be the
            // declarative way, but it needs frontend 2026.8 and this repo's
            // hacs.json floor is 2025.1.0.)
            disabled: !cfg.show_accessibility,
            selector: { boolean: {} },
          },
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
        title: et("section_board"),
        data: {
          size: cfg.size,
          show_min_unit: cfg.show_min_unit,
          show_line_column: cfg.show_line_column,
          housing: cfg.housing,
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
          { name: "show_min_unit", selector: { boolean: {} } },
          { name: "show_line_column", selector: { boolean: {} } },
          { name: "housing", selector: { boolean: {} } },
        ],
      })}
      ${renderFormSection({
        ...common,
        title: et("section_footer"),
        data: { hide_attribution: cfg.hide_attribution },
        schema: [{ name: "hide_attribution", selector: { boolean: {} } }],
      })}
    `;
  }

  private _patchHeaderSide(
    side: HeaderSideKey,
    field: keyof RetroHeaderSide,
    value: unknown,
  ): void {
    if (!this._config) return;
    this._patch({ [side]: patchHeaderSide(this._config[side], field, value) });
  }

  /** Station-band background options: the sentinel, then one entry per line the
   *  board actually tracks, then the two static colours. Per-line entries come
   *  from each stop's `lines` filter, or the sensor's `tracked_lines` when no
   *  filter is set, so the dropdown offers what this board can actually show. */
  private _stationBgOptions(): ReadonlyArray<{ value: string; label: string }> {
    const { et } = this._i18n;
    const options = [{ value: "line", label: et("station_bg_line") }];
    const tracked = new Set<string>();
    for (const stop of this._config?.entities ?? []) {
      const attrs = this.hass?.states?.[stop.entity]?.attributes as
        | WienerLinienAttrs
        | undefined;
      const stopLines =
        stop.lines && stop.lines.length > 0 ? stop.lines : attrs?.tracked_lines;
      for (const ln of stopLines ?? []) {
        if (typeof ln === "string" && ln) tracked.add(ln);
      }
    }
    // Fallback: nothing tracked yet (fresh entry, sensor cold, no filter and an
    // unconfigured integration) — offer the live palette so the dropdown is not
    // trapped at sentinel-only.
    if (tracked.size === 0) {
      const firstEid = this._config?.entities?.[0]?.entity;
      const lineColors = firstEid
        ? (this.hass?.states?.[firstEid]?.attributes as WienerLinienAttrs | undefined)
            ?.line_colors
        : undefined;
      for (const ln of Object.keys(lineColors ?? {})) tracked.add(ln);
    }
    for (const line of [...tracked].sort()) {
      options.push({ value: `line:${line}`, label: line });
    }
    options.push({ value: "white", label: et("station_bg_white") });
    options.push({ value: "black", label: et("station_bg_black") });
    return options;
  }

  private _computeLabel = (field: { name: string }): string =>
    editorLabel(this.hass, this._i18n, field.name);

  private _computeHelper = (field: { name: string }): string | undefined => {
    const { et } = this._i18n;
    // The dependency reason belongs on the field it gates, not in a note the
    // user has to associate by eye.
    return editorHelper(this._i18n, field.name, {
      ...(this._config?.show_accessibility
        ? {}
        : { accessibility_only: et("accessibility_only_requires") }),
    });
  };

  static override styles: CSSResultGroup = [editorTokens, editorStyles];
}
