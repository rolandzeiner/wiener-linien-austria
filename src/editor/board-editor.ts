// The element plumbing the three departure-board editors share.
//
// Each editor used to carry its own copy of all of this: the reactive state,
// the hass filter in shouldUpdate, the tab shell and its switch, the
// `_commit` / `_patch` pair, the label resolver and the `{hass, computeLabel,
// computeHelper, onChange}` block every form section takes. A function cannot
// own Lit state, so this is the one place the editors use a base class. Logic
// that needs no element (editor-common.ts, stop-block.ts) stays in plain
// functions.
//
// What differs per card stays in that card's editor: the config shape and its
// normaliser, which entities to watch, each tab's sections, and which fields
// gate which. Retro is single-stop and extends BoardEditor directly; modern and
// flap share the multi-stop Stops tab through MultiStopEditor.

import {
  LitElement,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { property, state } from "lit/decorators.js";

import { editorStyles } from "./editor-styles.js";
import { editorTokens } from "./editor-tokens.js";
import { editorTranslators, type EditorTranslators } from "./editor-i18n.js";
import {
  renderFormSection,
  renderPanel,
  renderTabs,
  type FormSectionOptions,
  type TabKey,
} from "./editor-shell.js";
import { renderHeaderSection, type HeaderSideKey } from "./header-strip.js";
import { renderStopsTab } from "./stop-block.js";
import {
  editorHelper,
  editorLabel,
  multiStopCallbacks,
  rebuildStops,
  type MutableStop,
} from "./editor-common.js";
import type {
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceCardEditor,
  RetroHeaderSide,
} from "../types.js";
import { fireEvent } from "../utils.js";

/** The fields every section form is handed. */
type FormContext = Pick<
  FormSectionOptions,
  "hass" | "computeLabel" | "computeHelper" | "onChange"
>;

/** The slice of config behind the header strip and station band, which the
 *  flap and retro cards share. */
interface StationBandConfig extends LovelaceCardConfig {
  show_header: boolean;
  header_left?: RetroHeaderSide | undefined;
  header_right?: RetroHeaderSide | undefined;
  show_station_name: boolean;
  station_bg: string;
}

export abstract class BoardEditor<C extends LovelaceCardConfig>
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() protected _config?: C;
  @state() protected _tab: TabKey = "stops";
  /** Which header side the slot panel is editing. Editor-local UI state — it
   *  never reaches the config, and resetting it on dialog reopen is fine. Only
   *  the two cards with a header strip ever change it. */
  @state() protected _headerSide: HeaderSideKey = "header_left";

  /** Catalogue namespace for this card's strings. */
  protected abstract readonly _namespace: "modern" | "retro" | "flap";
  /** Editor catalogue key for the first tab's label. */
  protected readonly _stopsTabLabel: string = "tab_stops";

  /** The card's own normaliser, so the editor holds exactly what the card
   *  would render from. */
  protected abstract _normalise(raw: LovelaceCardConfig): C;
  /** The entities whose state the editor renders from. */
  protected abstract _watchedEntities(cfg: C): readonly string[];
  /** Dependency reasons ("needs X switched on") keyed by the field they gate.
   *  Which field gates which is per card; see `editorHelper`. */
  protected abstract _helperOverrides(cfg: C): Record<string, string | undefined>;
  protected abstract _renderStops(cfg: C): TemplateResult;
  protected abstract _renderDisplay(cfg: C): TemplateResult;
  protected abstract _renderTweaks(cfg: C): TemplateResult;

  public setConfig(config: LovelaceCardConfig): void {
    this._config = this._normalise(config);
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (changed.has("_config") || changed.has("_tab") || changed.has("_headerSide")) {
      return true;
    }
    // hass fires for every state change anywhere in HA — only re-render when
    // one of the configured entities actually changed. With none configured
    // there is nothing to compare against, and the entity picker on screen
    // takes its options from hass.
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eids = this._watchedEntities(this._config);
    if (eids.length === 0) return true;
    return eids.some((eid) => prev.states[eid] !== this.hass!.states[eid]);
  }

  protected get _i18n(): EditorTranslators {
    return editorTranslators(this._namespace, this.hass?.language);
  }

  /** Every config write goes through here, and it assigns `_config` BEFORE
   *  dispatching. Custom editors get no re-`setConfig()` after
   *  `config-changed`, so a fireEvent-only path leaves `_config` stale and the
   *  next render reverts the form. */
  protected _commit(next: C): void {
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  /** Merge one section form's partial value into the config. Sections emit
   *  only their own fields, so this is a merge, never a replace — and spreading
   *  the existing config first keeps `type` and dashboard passthrough fields,
   *  which ha-form's value carries neither of. */
  protected _patch(value: Record<string, unknown>): void {
    if (!this._config) return;
    this._commit(this._normalise({ ...this._config, ...value }));
  }

  protected get _form(): FormContext {
    return {
      hass: this.hass,
      computeLabel: this._computeLabel,
      computeHelper: this._computeHelper,
      onChange: (v) => this._patch(v),
    };
  }

  protected _computeLabel = (field: { name: string }): string =>
    editorLabel(this.hass, this._i18n, field.name);

  // The dependency reason belongs on the field it gates, not in a note the
  // user has to associate by eye.
  protected _computeHelper = (field: { name: string }): string | undefined =>
    editorHelper(this._i18n, field.name, this._config && this._helperOverrides(this._config));

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    const cfg = this._config;
    if (!cfg) return nothing;
    const { et } = this._i18n;
    return html`
      <div class="wl-editor">
        ${renderTabs(
          [
            { key: "stops", label: et(this._stopsTabLabel) },
            { key: "display", label: et("tab_display") },
            { key: "tweaks", label: et("tab_tweaks") },
          ],
          this._tab,
          (key) => {
            this._tab = key;
          },
        )}
        ${renderPanel(this._tab, this._renderTab(this._tab, cfg))}
      </div>
    `;
  }

  private _renderTab(tab: TabKey, cfg: C): TemplateResult {
    switch (tab) {
      case "stops":
        return this._renderStops(cfg);
      case "display":
        return this._renderDisplay(cfg);
      case "tweaks":
        return this._renderTweaks(cfg);
    }
  }

  /** The header strip and the station band section. Flap and retro render
   *  these identically apart from the band colours on offer, which is why the
   *  options come in as a parameter. The `this` type restricts callers to
   *  editors whose config has a station band. */
  protected _renderStationBand(
    this: BoardEditor<StationBandConfig>,
    cfg: StationBandConfig,
    bgOptions: ReadonlyArray<{ value: string; label: string }>,
  ): TemplateResult {
    const { et } = this._i18n;
    return html`
      ${renderHeaderSection({
        ...this._form,
        showHeader: cfg.show_header,
        left: cfg.header_left,
        right: cfg.header_right,
        selected: this._headerSide,
        et,
        currentSide: (side) => this._config?.[side],
        selectSide: (side) => {
          this._headerSide = side;
        },
      })}
      ${renderFormSection({
        ...this._form,
        title: et("section_station"),
        data: { show_station_name: cfg.show_station_name, station_bg: cfg.station_bg },
        schema: [
          { name: "show_station_name", selector: { boolean: {} } },
          {
            name: "station_bg",
            selector: { select: { mode: "dropdown", options: bgOptions } },
          },
        ],
      })}
    `;
  }

  static override styles: CSSResultGroup = [editorTokens, editorStyles];
}

interface MultiStopConfig extends LovelaceCardConfig {
  entities: MutableStop[];
}

/** The modern and flap editors: an `entities` array, one stop block per
 *  entry, and the entity picker in front of them. */
export abstract class MultiStopEditor<
  C extends MultiStopConfig,
> extends BoardEditor<C> {
  protected override _watchedEntities(cfg: C): readonly string[] {
    return cfg.entities.map((s) => s.entity);
  }

  /** Per-line colour overrides the stop blocks paint with. */
  protected _lineColorOverrides(_cfg: C): Record<string, string> {
    return {};
  }

  protected override _renderStops(cfg: C): TemplateResult {
    const { t, et } = this._i18n;
    return renderStopsTab({
      hass: this.hass,
      stops: cfg.entities,
      lineColorOverrides: this._lineColorOverrides(cfg),
      t,
      et,
      computeLabel: this._computeLabel,
      computeHelper: this._computeHelper,
      onEntitiesChanged: this._onEntitiesChanged,
      callbacks: multiStopCallbacks(
        () => this._config?.entities,
        (entities) => {
          if (this._config) this._commit({ ...this._config, entities });
        },
      ),
    });
  }

  private _onEntitiesChanged = (
    ev: CustomEvent<{ value: Record<string, unknown> }>,
  ): void => {
    ev.stopPropagation();
    if (!this._config) return;
    // Re-normalised, unlike the stop-block edits: a bare `{ entity }`
    // placeholder is a raw stop entry, and the normaliser is what validates
    // and dedupes it.
    this._patch({
      entities: rebuildStops(this._config.entities, ev.detail.value["entities"]),
    });
  };
}
