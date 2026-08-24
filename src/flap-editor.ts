// Schema-driven Lovelace editor for the Wiener Linien Austria flap card.
//
// Multi-stop model — the top entities selector accepts an array of
// sensors. When the entity-list changes, `_onFormChanged` rebuilds
// the `entities` array preserving per-stop overrides (lines,
// direction, walk_times) for surviving entities; new entities get a
// bare `{entity: id}` placeholder.
//
// Per-stop direction + lines live in their own per-entity expandable
// section beneath the static schema. Walk-time inputs are rendered
// per stop (each train station has its own walking distance).

import {
  LitElement,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import { editorBaseStyles } from "./editor-shared-styles.js";
import {
  coerceWalkTime,
  resolveEditorHelper,
  resolveEditorLabel,
  swallowEditorKeys,
} from "./editor-shared.js";
import { translate } from "./localize/localize.js";
import type {
  HaFormSchema,
  HomeAssistant,
  LovelaceCardEditor,
  WienerLinienAttrs,
  WienerLinienFlapCardConfig,
} from "./types.js";
import { fireEvent } from "./utils.js";
import {
  lineDirKey,
  linesAtStop,
  pairsAtStop,
} from "./utils/departures.js";
import {
  normaliseFlapConfig,
  type NormalisedFlapConfig,
  type NormalisedFlapStop,
} from "./utils/flap-config.js";
import {
  RETRO_HEADER_MDI_EXIT_KEYS,
  RETRO_HEADER_MDI_EXITS,
} from "./utils/retro-station-icons.js";
import mdiIconNames from "./mdi-icon-names.json";

// Module-level memoised options for the MDI chip-input — same pattern
// as retro-editor: built once at first reference so the ~7.5k-entry
// array isn't re-allocated on every form change.
const MDI_ICON_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  mdiIconNames.map((name) => ({ value: name, label: name }));

@customElement("wiener-linien-austria-flap-card-editor")
export class WienerLinienAustriaFlapCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedFlapConfig;

  public setConfig(config: WienerLinienFlapCardConfig): void {
    // Mirror the card's setConfig guards. Without them, malformed YAML
    // silently becomes an empty config in the editor — the user opens
    // it, sees defaults, may overwrite a broken-but-recoverable file.
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
    if (changed.has("_config")) return true;
    // hass fires for every state tick across HA — only re-render when
    // one of the configured entities actually changed.
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eids = this._config.entities.map((s) => s.entity);
    if (eids.length === 0) return true;
    return eids.some((eid) => prev.states[eid] !== this.hass!.states[eid]);
  }

  private _t(key: string, replacements?: Record<string, string | number>): string {
    return translate(
      `flap.${key}`,
      { hassLanguage: this.hass?.language },
      replacements,
    );
  }

  private _et(key: string): string {
    return translate(`flap.editor.${key}`, {
      hassLanguage: this.hass?.language,
    });
  }

  private _attrs(eid: string | undefined): WienerLinienAttrs | undefined {
    return eid
      ? (this.hass?.states?.[eid]?.attributes as WienerLinienAttrs | undefined)
      : undefined;
  }

  /** Options for the station-band background selector.
   *
   *  Order: sentinel ("First line"), per-line entries scoped to the
   *  lines the user is actually tracking on this board, then the two
   *  static colour options (white, black).
   *
   *  Per-line entries come from the union of:
   *    1. Each stop's per-stop `lines` filter (card-level scope), OR
   *    2. The sensor's `tracked_lines` attribute when no per-stop
   *       filter is set (integration-level scope — the lines the
   *       user picked in the integration's config flow).
   *
   *  Falls back to the sensor's full `line_colors` keys only when
   *  neither source produced any lines — guarantees the dropdown
   *  always has at least the sentinel + colour options + something
   *  to point at even on a fresh stop with no live data. */
  private _stationBgOptions(): ReadonlyArray<{ value: string; label: string }> {
    const options: { value: string; label: string }[] = [
      { value: "line", label: this._et("station_bg_line") },
    ];
    const tracked = new Set<string>();
    for (const stop of this._config?.entities ?? []) {
      const attrs = this.hass?.states?.[stop.entity]?.attributes as
        | WienerLinienAttrs
        | undefined;
      const stopLines = stop.lines && stop.lines.length > 0
        ? stop.lines
        : attrs?.tracked_lines;
      if (stopLines) {
        for (const ln of stopLines) {
          if (typeof ln === "string" && ln) tracked.add(ln);
        }
      }
    }
    // Fallback: if no stop produced any tracked lines (fresh entry,
    // sensor not yet reporting, no per-stop filter and integration
    // unconfigured), surface every line in the live palette so the
    // dropdown isn't trapped at sentinel-only.
    if (tracked.size === 0) {
      const firstEid = this._config?.entities?.[0]?.entity;
      const lineColors = firstEid
        ? (this.hass?.states?.[firstEid]?.attributes as
            | WienerLinienAttrs
            | undefined)?.line_colors
        : undefined;
      if (lineColors) {
        for (const ln of Object.keys(lineColors)) tracked.add(ln);
      }
    }
    for (const line of [...tracked].sort()) {
      options.push({ value: `line:${line}`, label: line });
    }
    options.push({ value: "white", label: this._et("station_bg_white") });
    options.push({ value: "black", label: this._et("station_bg_black") });
    return options;
  }

  /** Shared options list for both header sides' "Exit icon" dropdown. */
  private _exitOptions(): ReadonlyArray<{ value: string; label: string }> {
    const base: { value: string; label: string }[] = [
      { value: "none", label: this._et("header_exit_none") },
      { value: "regular", label: this._et("header_exit_regular") },
      { value: "accessible", label: this._et("header_exit_accessible") },
    ];
    const mdi = RETRO_HEADER_MDI_EXIT_KEYS.map((key) => ({
      value: key,
      label: this._et(RETRO_HEADER_MDI_EXITS[key].labelKey),
    }));
    return [...base, ...mdi];
  }

  private _schema(): ReadonlyArray<HaFormSchema> {
    return [
      {
        // Multi-entity selector. ha-form returns `string[]` here; the
        // form-change handler translates back to NormalisedFlapStop[]
        // preserving per-stop overrides.
        name: "entities",
        required: true,
        selector: {
          entity: {
            multiple: true,
            filter: { domain: "sensor", integration: "wiener_linien_austria" },
          },
        },
      },
      {
        // Station-header strip — same per-side grammar as retro card.
        // Placed before "Station" + "Display" because the header is the
        // topmost visual element; the editor section order mirrors the
        // visual stack so top-down scanning finds the right knob.
        type: "expandable",
        name: "header",
        title: this._et("section_header"),
        flatten: true,
        schema: [
          { name: "show_header", selector: { boolean: {} } },
          this._headerSideSchema("header_left"),
          this._headerSideSchema("header_right"),
        ],
      },
      {
        // Station-name band — mirrors retro-card's `station` section
        // verbatim (show_station_name + station_bg). Sits between the
        // signage header above and the departure board below to match
        // the on-card vertical order.
        type: "expandable",
        name: "station",
        title: this._et("section_station"),
        flatten: true,
        schema: [
          { name: "show_station_name", selector: { boolean: {} } },
          {
            // Dropdown mode — the per-line options expand with every
            // tracked line, so a "list" (radio column) would grow
            // tall on multi-line boards. Dropdown stays compact.
            name: "station_bg",
            selector: {
              select: {
                mode: "dropdown",
                options: this._stationBgOptions(),
              },
            },
          },
        ],
      },
      {
        // Field order mirrors retro-card's `display` section:
        // column-allocation feature toggles (show_platform-equivalent
        // in retro is also first), then accessibility-related filter,
        // then the behaviour knob (max_rows is flap-specific — retro
        // has no max-rows because it tracks one line/direction), then
        // presentation (min caption), then the size grid at the
        // bottom. Keeping the two cards in step lets users move
        // between them without re-learning the editor's spatial
        // mnemonic.
        type: "expandable",
        name: "display",
        title: this._et("section_display"),
        flatten: true,
        schema: [
          { name: "show_platform", selector: { boolean: {} } },
          { name: "show_accessibility", selector: { boolean: {} } },
          { name: "accessibility_only", selector: { boolean: {} } },
          {
            name: "max_rows",
            selector: {
              number: { min: 1, max: 8, step: 1, mode: "slider" },
            },
          },
          { name: "show_min_unit", selector: { boolean: {} } },
          {
            type: "grid",
            name: "",
            schema: [
              {
                name: "size",
                selector: {
                  select: {
                    mode: "list",
                    options: [
                      { value: "small", label: this._et("size_small") },
                      { value: "medium", label: this._et("size_medium") },
                      { value: "regular", label: this._et("size_regular") },
                    ],
                  },
                },
              },
            ],
          },
          // Last entry in display, mirroring the modern card. CC-BY
          // footer is opt-out, so the toggle reads as "hide" not
          // "show" — keeps the safe default obvious.
          { name: "hide_attribution", selector: { boolean: {} } },
        ],
      },
      {
        // Visual flourishes — mirrors retro-card's `tweaks` section.
        // Subset only: flap doesn't have an LED-amber voice, so
        // retro's `show_unit` / `line_stripe` have no analogue. The
        // two flap tweaks both mirror retro's relative order:
        // `line_pill` first (line-slot presentation), `housing` last
        // (outer chrome).
        type: "expandable",
        name: "tweaks",
        title: this._et("section_tweaks"),
        flatten: true,
        schema: [
          { name: "line_pill", selector: { boolean: {} } },
          { name: "housing", selector: { boolean: {} } },
        ],
      },
    ];
  }

  /** Build one of the two header-side expandable schemas. Extracted so
   *  the left/right sides can never drift on the shared field list. */
  private _headerSideSchema(name: "header_left" | "header_right"): HaFormSchema {
    const sideCfg = this._config?.[name];
    return {
      type: "expandable",
      name,
      title: this._et(name),
      flatten: false,
      schema: [
        {
          name: "exit",
          selector: {
            select: { mode: "dropdown", options: this._exitOptions() },
          },
        },
        { name: "text", selector: { text: {} } },
        { name: "show_wc", selector: { boolean: {} } },
        { name: "show_escalator", selector: { boolean: {} } },
        { name: "show_elevator", selector: { boolean: {} } },
        { name: "show_clock", selector: { boolean: {} } },
        { name: "show_date", selector: { boolean: {} } },
        ...(sideCfg?.show_date
          ? [{ name: "date_format", selector: { text: {} } }]
          : []),
        {
          name: "extra_icons",
          selector: {
            select: {
              multiple: true,
              custom_value: true,
              options: MDI_ICON_OPTIONS,
            },
          },
        },
        {
          name: "chips",
          selector: {
            select: {
              multiple: true,
              custom_value: true,
              options: [],
            },
          },
        },
      ],
    };
  }

  private _computeLabel = (field: { name: string }): string =>
    resolveEditorLabel(field, {
      hass: this.hass,
      et: (k) => this._et(k),
      editorNamespace: "flap.editor",
      cardLookup: (k) => this._t(k),
      cardNamespace: "flap",
    });

  private _computeHelper = (field: { name: string }): string | undefined =>
    resolveEditorHelper(field, {
      et: (k) => this._et(k),
      editorNamespace: "flap.editor",
    });

  /** Form data for ha-form: spread the normalised config + flatten
   *  entities to a `string[]` (the multi-entity selector's shape). */
  private _formData(): Record<string, unknown> {
    if (!this._config) return {};
    return {
      ...this._config,
      entities: this._config.entities.map((s) => s.entity),
    };
  }

  /** Translate ha-form's value back to a config the normaliser can
   *  accept. The critical translation: when entities is a `string[]`
   *  (entity selector output), rebuild the entities array preserving
   *  per-stop overrides for surviving entries. */
  private _onFormChanged = (
    ev: CustomEvent<{ value: Record<string, unknown> }>,
  ): void => {
    if (!this._config) return;
    const value = ev.detail.value;
    const rawEntities = value["entities"];
    const newEntityIds: string[] = Array.isArray(rawEntities)
      ? rawEntities.filter(
          (s): s is string => typeof s === "string" && s.length > 0,
        )
      : [];
    const byEntity = new Map<string, NormalisedFlapStop>();
    for (const stop of this._config.entities) {
      byEntity.set(stop.entity, stop);
    }
    const nextEntities: NormalisedFlapStop[] = newEntityIds.map(
      (eid) => byEntity.get(eid) ?? { entity: eid },
    );
    const next = normaliseFlapConfig({
      ...this._config,
      ...(value as Partial<WienerLinienFlapCardConfig>),
      entities: nextEntities,
    } as WienerLinienFlapCardConfig);
    this._commit(next);
  };

  private _commit(next: NormalisedFlapConfig): void {
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  // ------------------------------------------------------------------
  // Per-stop mutators
  // ------------------------------------------------------------------

  private _updateStop(
    eid: string,
    mutator: (s: NormalisedFlapStop) => NormalisedFlapStop,
  ): void {
    if (!this._config) return;
    const entities = this._config.entities.map((s) =>
      s.entity === eid ? mutator({ ...s }) : s,
    );
    this._commit({ ...this._config, entities });
  }

  private _setStopDirection(eid: string, dir: "H" | "R" | null): void {
    this._updateStop(eid, (s) => {
      if (dir === null) delete s.direction;
      else s.direction = dir;
      return s;
    });
  }

  private _setStopLines(eid: string, lines: string[]): void {
    this._updateStop(eid, (s) => {
      if (lines.length === 0) delete s.lines;
      else s.lines = lines;
      return s;
    });
  }

  private _setWalkTime(eid: string, key: string, raw: string): void {
    if (!this._config) return;
    const clean = coerceWalkTime(raw, `${eid}/${key}`);
    this._updateStop(eid, (s) => {
      const cur = { ...(s.walk_times ?? {}) };
      if (clean === null) delete cur[key];
      else cur[key] = clean;
      if (Object.keys(cur).length) s.walk_times = cur;
      else delete s.walk_times;
      return s;
    });
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData()}
          .schema=${this._schema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._onFormChanged}
        ></ha-form>
        ${this._renderPerStopSections()}
      </div>
    `;
  }

  private _renderPerStopSections(): TemplateResult | typeof nothing {
    const cfg = this._config!;
    if (!cfg.entities.length) return nothing;
    return html`${cfg.entities.map((stop) => this._renderStopSection(stop))}`;
  }

  private _renderStopSection(stop: NormalisedFlapStop): TemplateResult {
    const attrs = this._attrs(stop.entity);
    if (!attrs) {
      return html`
        <ha-alert alert-type="warning">
          ${this._t("entity_missing").replace("{entity}", stop.entity)}
        </ha-alert>
      `;
    }
    const stopName = attrs.stop_name || stop.entity;
    const allLines = linesAtStop(attrs);
    const currentDir = stop.direction;
    const selectedLines = stop.lines ?? [];

    const dirButton = (
      dir: "H" | "R" | null,
      label: string,
    ): TemplateResult => {
      const active =
        (dir === null && currentDir === undefined) || currentDir === dir;
      return html`<button
        type="button"
        class=${"editor-pill" + (active ? " editor-pill--active" : "")}
        @click=${() => this._setStopDirection(stop.entity, dir)}
      >
        ${label}
      </button>`;
    };

    return html`
      <div class="editor-section">
        <div class="section-header">${stopName}</div>
        <div class="editor-hint">${this._et("stop_section_hint")}</div>

        <div class="editor-row">
          <span class="editor-row-label">${this._et("direction_label")}</span>
          <div class="editor-pills">
            ${dirButton(null, this._t("dir_both"))}
            ${dirButton("H", this._t("dir_h"))}
            ${dirButton("R", this._t("dir_r"))}
          </div>
        </div>

        ${allLines.length
          ? html`<div class="editor-row">
              <span class="editor-row-label">${this._et("lines_label")}</span>
              <div class="editor-pills">
                ${allLines.map((line) => {
                  const active = selectedLines.includes(line);
                  return html`<button
                    type="button"
                    class=${"editor-pill" + (active ? " editor-pill--active" : "")}
                    @click=${() =>
                      this._setStopLines(
                        stop.entity,
                        active
                          ? selectedLines.filter((l) => l !== line)
                          : [...selectedLines, line],
                      )}
                  >
                    ${line}
                  </button>`;
                })}
              </div>
            </div>`
          : nothing}

        ${this._renderWalkTimes(stop, attrs)}
      </div>
    `;
  }

  private _renderWalkTimes(
    stop: NormalisedFlapStop,
    attrs: WienerLinienAttrs,
  ): TemplateResult {
    // Walk-time inputs are per-(line, direction). Direction filter for
    // the picker mirrors the stop's direction filter — if the user
    // chose H, only H pairs are configurable.
    const pairs = pairsAtStop(attrs).filter((p) =>
      stop.direction ? p.direction === stop.direction : true,
    );
    const walkTimes = stop.walk_times ?? {};
    if (!pairs.length) {
      return html`<div class="editor-hint">
        ${this._et("walk_time_no_data")}
      </div>`;
    }
    return html`
      <div class="editor-row">
        <span class="editor-row-label">${this._et("section_walk_time")}</span>
      </div>
      <div class="editor-hint">${this._et("walk_time_hint")}</div>
      <div class="walk-time-list">
        ${pairs.map((p) => {
          const key = lineDirKey(p.line, p.direction);
          const val = walkTimes[key];
          const terminusLabel = p.termini.join(" / ");
          return html`<div class="walk-time-row">
            <span class="walk-time-badge">${p.line}</span>
            <span class="walk-time-towards">→ ${terminusLabel}</span>
            <input
              type="number"
              class="walk-time-input"
              min="0"
              max="120"
              step="1"
              inputmode="numeric"
              placeholder=${this._et("walk_time_placeholder")}
              aria-label=${this._et("walk_time_aria")
                .replace("{line}", p.line)
                .replace("{towards}", terminusLabel)}
              .value=${live(val !== undefined ? String(val) : "")}
              @keydown=${swallowEditorKeys}
              @keyup=${swallowEditorKeys}
              @keypress=${swallowEditorKeys}
              @change=${(ev: Event) =>
                this._setWalkTime(
                  stop.entity,
                  key,
                  (ev.target as HTMLInputElement).value,
                )}
            />
          </div>`;
        })}
      </div>
    `;
  }

  static override styles: CSSResultGroup = [editorBaseStyles];
}
