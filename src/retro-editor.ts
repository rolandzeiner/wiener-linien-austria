// Lovelace editor for the Wiener Linien Austria retro card (v2 editor system).
//
// Same three tabs, same order, same flat sections as the modern and flap
// editors. Retro is the constrained case of the shared stop block: the card
// renders exactly one line in one direction, so the block runs in
// `singleLine` mode — the line filter behaves as a radio, there is no "both
// directions" option and no per-line overrides.
//
// v1 asked for direction and line as two ha-form dropdowns above a walk-time
// table, which is a third affordance for a job the other two editors did with
// chips. Routing retro through the same block is most of why the three editors
// are now one thing configured three ways.
//
// Direction autocorrect (a stop that serves only one direction, with the saved
// config pointing at the other) is kept from v1 and still runs in willUpdate,
// not render — it dispatches config-changed, and Lit requires render() to be
// side-effect-free.

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
  renderSection,
  renderTabs,
  type TabKey,
} from "./editor/editor-shell.js";
import { renderHeaderStrip, type HeaderSideKey } from "./editor/header-strip.js";
import {
  renderStopBlock,
  type StopBlockCallbacks,
  type StopView,
} from "./editor/stop-block.js";
import type {
  HaFormSchema,
  HomeAssistant,
  LovelaceCardEditor,
  RetroHeaderSide,
  WienerLinienAttrs,
  WienerLinienRetroCardConfig,
} from "./types.js";
import { fireEvent } from "./utils.js";
import {
  editorHelper,
  editorLabel,
  patchHeaderSide,
} from "./editor/editor-common.js";
import { normaliseRetroConfig, type NormalisedRetroConfig } from "./utils/config.js";
import { directionSurface, linesForDirection } from "./utils/departures.js";

@customElement("wiener-linien-austria-retro-card-editor")
export class WienerLinienAustriaRetroCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRetroConfig;
  @state() private _tab: TabKey = "stops";
  @state() private _headerSide: HeaderSideKey = "header_left";

  /** Coalesces direction-autocorrect runs so render storms (typing in another
   *  field) don't queue multiple config-changed dispatches. Plain field, not
   *  @state — render bookkeeping, not UI state. */
  private _pendingDirectionFix = false;

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

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("_config") || changed.has("hass")) {
      this._scheduleDirectionAutocorrect();
    }
  }

  private get _i18n(): EditorTranslators {
    return editorTranslators("retro", this.hass?.language);
  }

  private _attrs(eid: string | undefined): WienerLinienAttrs | undefined {
    return eid
      ? (this.hass?.states?.[eid]?.attributes as WienerLinienAttrs | undefined)
      : undefined;
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
      lines: cfg.line ? [cfg.line] : [],
      direction: cfg.direction,
      walk_times: cfg.walk_times,
    };
  }

  private get _stopCallbacks(): StopBlockCallbacks {
    return {
      // Radio behaviour: picking a line replaces the selection. Picking the
      // selected line again clears it, which is what the chip's pressed state
      // implies — the card then falls back to the first tracked line.
      toggleLine: (_eid, line) => {
        if (!this._config) return;
        const next = { ...this._config };
        if (next.line === line) delete next.line;
        else next.line = line;
        this._commit(next);
      },
      // Retro always renders one direction, so the block's "both" (null) is
      // unreachable — singleLine suppresses that button — and per-line
      // overrides never render, so `lineDirections` is ignored here.
      setDirections: (_eid, next) => {
        if (!this._config || next.direction === null) return;
        const cfg: NormalisedRetroConfig = { ...this._config, direction: next.direction };
        // Re-pick the line if the saved one doesn't run in the new direction,
        // so the user never lands on a coherent-looking but empty card.
        const linesNow = linesForDirection(this._attrs(cfg.entity), next.direction);
        if (!cfg.line || !linesNow.includes(cfg.line)) cfg.line = linesNow[0];
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
                filter: { domain: "sensor", integration: "wiener_linien_austria" },
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
              singleLine: true,
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
    // The previous line is meaningless at a new stop. If the new stop is
    // one-way, snap direction FIRST so the line is picked for a direction the
    // stop actually serves — otherwise the line is chosen for the
    // about-to-be-corrected direction and ends up stranded.
    const avail = this._availableDirections(entity);
    if (avail.size === 1) next.direction = avail.has("H") ? "H" : "R";
    next.line = linesForDirection(this._attrs(entity), next.direction)[0];
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

  private _patchHeaderSide(
    side: HeaderSideKey,
    field: keyof RetroHeaderSide,
    value: unknown,
  ): void {
    if (!this._config) return;
    this._patch({ [side]: patchHeaderSide(this._config[side], field, value) });
  }

  /** Directions tracked at `entity`. Tracked-line keys win — once the user has
   *  chosen which lines to follow in the integration's config flow, only
   *  directions with at least one tracked line are offered; live departures are
   *  the fallback for older sensor caches.
   *
   *  Shares `directionSurface` with the stop block, which is the point: this
   *  method and the block's direction buttons used to answer the same question
   *  from different data, so the editor could autocorrect to a direction whose
   *  button the block had disabled. */
  private _availableDirections(
    entity: string | undefined = this._config?.entity,
  ): ReadonlySet<"H" | "R"> {
    return directionSurface(this._attrs(entity)).available;
  }

  /** When the entity serves only one direction AND the saved config disagrees,
   *  dispatch a one-shot correction. No-op when both or neither direction has
   *  data, so a cold sensor never rewrites a deliberate choice. */
  private _scheduleDirectionAutocorrect(): void {
    if (!this._config || this._pendingDirectionFix) return;
    const avail = this._availableDirections();
    if (avail.size !== 1) return;
    const only = avail.has("H") ? "H" : "R";
    if (this._config.direction === only) return;
    this._pendingDirectionFix = true;
    void Promise.resolve().then(() => {
      try {
        if (!this._config) return;
        // Re-check after the async hop — the entity may have changed, and the
        // new one may serve both directions again.
        const still = this._availableDirections();
        if (still.size !== 1) return;
        const target = still.has("H") ? "H" : "R";
        if (this._config.direction === target) return;
        const next: NormalisedRetroConfig = { ...this._config, direction: target };
        const linesNow = linesForDirection(this._attrs(next.entity), target);
        if (!next.line || !linesNow.includes(next.line)) next.line = linesNow[0];
        // Silently rewriting saved config is user-meaningful — their direction
        // just changed under them.
        // eslint-disable-next-line no-console
        console.info(
          `[wiener-linien-austria-retro-card-editor] direction autocorrected to "${target}" for entity "${next.entity ?? ""}" — only one direction has live data`,
        );
        this._commit(next);
      } finally {
        // Clear AFTER the work: clearing at the top would let a rapid entity
        // change queue a second correction against the same render frame and
        // double-fire when both microtasks resolved.
        this._pendingDirectionFix = false;
      }
    });
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
