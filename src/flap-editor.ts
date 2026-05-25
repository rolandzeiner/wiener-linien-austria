// Schema-driven Lovelace editor for the Wiener Linien Austria flap card.
//
// Mirrors the retro card editor's pattern (ha-form for the static
// schema, one bespoke walk-time section below) but the option set is
// shorter — the flap card has no themes, no header strip, no race or
// ticker. Just the fields the card actually consumes.

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
  formatDirectionPillLabel,
  lineDirKey,
  linesForDirection,
  pairsAtStop,
} from "./utils/departures.js";
import {
  normaliseFlapConfig,
  type NormalisedFlapConfig,
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

  // Coalesces direction-autocorrect runs (same pattern as the retro
  // editor) so render storms don't fan out multiple config-changed
  // dispatches when the user types in another field.
  private _pendingDirectionFix = false;

  public setConfig(config: WienerLinienFlapCardConfig): void {
    this._config = normaliseFlapConfig(config);
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (changed.has("_config")) return true;
    // hass fires for every state tick across HA — only re-render when
    // the configured entity changed.
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

  private _t(key: string): string {
    return translate(`flap.${key}`, { hassLanguage: this.hass?.language });
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

  private _linesForCurrent(): string[] {
    if (!this._config) return [];
    return linesForDirection(
      this._attrs(this._config.entity),
      this._config.direction,
    );
  }

  private _terminiForDirection(dir: "H" | "R"): string[] {
    const attrs = this._attrs(this._config?.entity);
    if (!attrs) return [];
    const line = this._config?.line;
    const towards = new Set<string>();
    for (const d of attrs.departures ?? []) {
      if (d.direction !== dir || !d.towards) continue;
      if (line && d.line !== line) continue;
      towards.add(d.towards);
    }
    return [...towards].sort();
  }

  private _directionLabel(dir: "H" | "R"): string {
    return formatDirectionPillLabel(this._terminiForDirection(dir), {
      full: this._t(dir === "H" ? "dir_h" : "dir_r"),
      short: this._t(dir === "H" ? "dir_h_short" : "dir_r_short"),
    });
  }

  private _availableDirections(
    entity: string | undefined = this._config?.entity,
  ): Set<"H" | "R"> {
    const attrs = this._attrs(entity);
    const out = new Set<"H" | "R">();
    if (attrs?.tracked_line_keys?.length) {
      for (const key of attrs.tracked_line_keys) {
        const [, dir] = key.split("|", 2);
        if (dir === "H" || dir === "R") out.add(dir);
      }
      if (out.size > 0) return out;
    }
    for (const d of attrs?.departures ?? []) {
      if (d.direction === "H" || d.direction === "R") out.add(d.direction);
    }
    return out;
  }

  /** Shared options list for both header sides' "Exit icon" dropdown.
   *  Built once per render so the two sides can never drift, and so
   *  new MDI options added to RETRO_HEADER_MDI_EXIT_KEYS flow into
   *  the editor automatically. */
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
    const liveLines = this._linesForCurrent();
    const savedLine = this._config?.line;
    const allLines =
      savedLine && !liveLines.includes(savedLine)
        ? [savedLine, ...liveLines]
        : liveLines;
    const lineOptions = allLines.map((l) => ({ value: l, label: l }));
    const avail = this._availableDirections();
    const dirOptions: Array<{ value: string; label: string }> = [];
    if (avail.size === 0 || avail.has("H")) {
      dirOptions.push({ value: "H", label: this._directionLabel("H") });
    }
    if (avail.size === 0 || avail.has("R")) {
      dirOptions.push({ value: "R", label: this._directionLabel("R") });
    }

    return [
      {
        name: "entity",
        required: true,
        selector: {
          entity: {
            domain: "sensor",
            integration: "wiener_linien_austria",
          },
        },
      },
      {
        name: "direction",
        selector: {
          select: { mode: "dropdown", options: dirOptions },
        },
      },
      {
        name: "line",
        selector: {
          select: {
            mode: "dropdown",
            custom_value: true,
            options: lineOptions,
          },
        },
      },
      {
        type: "expandable",
        name: "display",
        title: this._et("section_display"),
        flatten: true,
        schema: [
          {
            name: "max_rows",
            selector: {
              number: { min: 1, max: 4, step: 1, mode: "slider" },
            },
          },
          { name: "show_station_header", selector: { boolean: {} } },
          { name: "show_accessibility", selector: { boolean: {} } },
          { name: "accessibility_only", selector: { boolean: {} } },
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
        ],
      },
      {
        type: "expandable",
        name: "platform_section",
        title: this._et("section_platform"),
        flatten: true,
        schema: [
          { name: "show_platform", selector: { boolean: {} } },
          {
            name: "platform_side",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "auto", label: this._et("platform_side_auto") },
                  { value: "left", label: this._et("platform_side_left") },
                  { value: "right", label: this._et("platform_side_right") },
                ],
              },
            },
          },
        ],
      },
      {
        // Station-header strip (signage homage above the WL-orange
        // band) — same per-side grammar as the retro card's header.
        // See the retro editor's header section for the rationale on
        // flatten: true on the outer wrapper vs flatten: false on the
        // two per-side expandables.
        type: "expandable",
        name: "header",
        title: this._et("section_header"),
        flatten: true,
        schema: [
          { name: "show_header", selector: { boolean: {} } },
          {
            type: "expandable",
            name: "header_left",
            title: this._et("header_left"),
            flatten: false,
            schema: [
              {
                name: "exit",
                selector: {
                  select: {
                    mode: "dropdown",
                    options: this._exitOptions(),
                  },
                },
              },
              { name: "text", selector: { text: {} } },
              { name: "show_wc", selector: { boolean: {} } },
              { name: "show_escalator", selector: { boolean: {} } },
              { name: "show_elevator", selector: { boolean: {} } },
              { name: "show_clock", selector: { boolean: {} } },
              { name: "show_date", selector: { boolean: {} } },
              ...(this._config?.header_left?.show_date
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
          },
          {
            type: "expandable",
            name: "header_right",
            title: this._et("header_right"),
            flatten: false,
            schema: [
              {
                name: "exit",
                selector: {
                  select: {
                    mode: "dropdown",
                    options: this._exitOptions(),
                  },
                },
              },
              { name: "text", selector: { text: {} } },
              { name: "show_wc", selector: { boolean: {} } },
              { name: "show_escalator", selector: { boolean: {} } },
              { name: "show_elevator", selector: { boolean: {} } },
              { name: "show_clock", selector: { boolean: {} } },
              { name: "show_date", selector: { boolean: {} } },
              ...(this._config?.header_right?.show_date
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
          },
        ],
      },
    ];
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

  private _formData(): Record<string, unknown> {
    if (!this._config) return {};
    return { ...this._config };
  }

  private _onFormChanged = (
    ev: CustomEvent<{ value: Record<string, unknown> }>,
  ): void => {
    if (!this._config) return;
    const prevEntity = this._config.entity;
    const value = ev.detail.value;
    const next = normaliseFlapConfig({
      ...this._config,
      ...(value as Partial<WienerLinienFlapCardConfig>),
    });
    if (next.entity !== prevEntity) {
      const availNext = this._availableDirections(next.entity);
      if (availNext.size === 1) {
        next.direction = availNext.has("H") ? "H" : "R";
      }
      const sorted = linesForDirection(
        this._attrs(next.entity),
        next.direction,
      );
      next.line = sorted[0];
    }
    this._commit(next);
  };

  private _commit(next: NormalisedFlapConfig): void {
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  private _setWalkTime(key: string, raw: string): void {
    if (!this._config) return;
    const n = parseInt(raw, 10);
    const clean = Number.isFinite(n) && n > 0 ? Math.min(120, n) : null;
    const cur = { ...(this._config.walk_times ?? {}) };
    if (clean === null) delete cur[key];
    else cur[key] = clean;
    const next: NormalisedFlapConfig = { ...this._config };
    if (Object.keys(cur).length) next.walk_times = cur;
    else delete next.walk_times;
    this._commit(next);
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const cfg = this._config;
    const entityMissing = !!cfg.entity && !this.hass?.states?.[cfg.entity];
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
        ${entityMissing
          ? html`<ha-alert alert-type="warning"
              >${this._t("entity_missing").replace("{entity}", cfg.entity!)}</ha-alert
            >`
          : nothing}
        ${this._renderWalkTimeSection()}
      </div>
    `;
  }

  private _scheduleDirectionAutocorrect(): void {
    if (!this._config || this._pendingDirectionFix) return;
    const avail = this._availableDirections();
    if (avail.size !== 1) return;
    const onlyAvail = avail.has("H") ? "H" : "R";
    if (this._config.direction === onlyAvail) return;
    this._pendingDirectionFix = true;
    Promise.resolve().then(() => {
      this._pendingDirectionFix = false;
      if (!this._config) return;
      const stillAvail = this._availableDirections();
      if (stillAvail.size !== 1) return;
      const target = stillAvail.has("H") ? "H" : "R";
      if (this._config.direction === target) return;
      const next: NormalisedFlapConfig = { ...this._config, direction: target };
      const linesNow = linesForDirection(this._attrs(next.entity), target);
      if (!next.line || !linesNow.includes(next.line)) {
        next.line = linesNow[0];
      }
      this._commit(next);
    });
  }

  private _renderWalkTimeSection(): TemplateResult {
    const cfg = this._config!;
    const attrs = this._attrs(cfg.entity);
    const pairs = cfg.entity
      ? pairsAtStop(attrs).filter((p) => p.direction === cfg.direction)
      : [];
    const walkTimes = cfg.walk_times ?? {};
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_walk_time")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${pairs.length
            ? pairs.map((p) => {
                const key = lineDirKey(p.line, p.direction);
                const val = walkTimes[key];
                const terminusLabel = p.termini.join(" / ");
                const branchingHint =
                  p.termini.length > 1
                    ? this._et("walk_time_branching_hint")
                    : "";
                return html`<div class="walk-time-row">
                  <span class="walk-time-badge">${p.line}</span>
                  <span class="walk-time-towards" title=${branchingHint || terminusLabel}
                    >→ ${terminusLabel}</span
                  >
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
                        key,
                        (ev.target as HTMLInputElement).value,
                      )}
                  />
                </div>`;
              })
            : html`<div class="editor-hint">
                ${this._et("walk_time_no_data")}
              </div>`}
        </div>
      </div>
    `;
  }

  static override styles: CSSResultGroup = [editorBaseStyles];
}
