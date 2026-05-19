// Schema-driven Lovelace editor for the Wiener Linien Austria retro card.
//
// Design notes
// ------------
// * The static fields use `<ha-form>` exclusively — entity/direction/line
//   selector + the two expandable display blocks. ha-form is the canonical
//   HA editor component: picks up the active theme, supports the standard
//   label/helper localisation chain, and keeps a11y / forced-colors /
//   focus-visible behaviour in lockstep with HA core.
//
// * **One bespoke section** — walk-times. The list of (line, direction,
//   terminus) rows is per-stop and per-direction, derived from the
//   selected sensor's live departures, so it can't be expressed as a
//   static schema. Renders below the `<ha-form>` block.
//
// * **Editor `_config` lifecycle gotcha** — custom-card editors do NOT
//   receive a re-`setConfig()` after dispatching `config-changed`. The
//   form-handler must therefore set `this._config = next` *before*
//   firing the event; otherwise the next render reads stale state and
//   the form reverts to the pre-change value.
//
// * **`expandable` + `flatten: true`** — without `flatten`, ha-form
//   scopes inner-schema values under `data[name]` and the card's
//   flat-key reads (`this._config.show_platform`) silently default.
//   Every expandable in this file ships `flatten: true`; the
//   `HaFormExpandableSchema` interface in `types.ts` declares the
//   field explicitly so a future maintainer can't add a nested
//   expandable by accident.

import { LitElement, html, nothing, type CSSResultGroup, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "./types.js";

import { editorBaseStyles } from "./editor-shared-styles.js";
import { resolveEditorHelper, resolveEditorLabel } from "./editor-shared.js";
import { fireEvent } from "./utils.js";
import { translate } from "./localize/localize.js";
import type {
  HaFormSchema,
  WienerLinienAttrs,
  WienerLinienRetroCardConfig,
} from "./types.js";
import { normaliseRetroConfig, type NormalisedRetroConfig } from "./utils/config.js";
import {
  formatDirectionPillLabel,
  lineDirKey,
  linesForDirection,
  pairsAtStop,
} from "./utils/departures.js";
import {
  RETRO_HEADER_MDI_EXIT_KEYS,
  RETRO_HEADER_MDI_EXITS,
} from "./utils/retro-station-icons.js";

@customElement("wiener-linien-austria-retro-card-editor")
export class WienerLinienAustriaRetroCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRetroConfig;

  // Coalesces direction-autocorrect runs so render storms (typing in
  // another field) don't queue multiple config-changed dispatches.
  // Plain field, not @state — this is render bookkeeping, not UI state.
  private _pendingDirectionFix = false;

  public setConfig(config: WienerLinienRetroCardConfig): void {
    this._config = normaliseRetroConfig(config);
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (changed.has("_config")) return true;
    // hass fires for every state tick across HA — only re-render when the
    // single configured entity changed. Without this guard, the form
    // schema, line dropdown, walk-time list and direction-autocorrect all
    // recompute on unrelated state changes while the dialog is open.
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eid = this._config.entity;
    if (!eid) return true;
    return prev.states[eid] !== this.hass.states[eid];
  }

  /** Translate `key` against the active HA language for retro-card UI strings. */
  private _t(key: string): string {
    return translate(`retro.${key}`, { hassLanguage: this.hass?.language });
  }

  /** Translate an editor-namespaced key. */
  private _et(key: string): string {
    return translate(`retro.editor.${key}`, { hassLanguage: this.hass?.language });
  }

  private _attrs(eid: string | undefined): WienerLinienAttrs | undefined {
    return eid
      ? (this.hass?.states?.[eid]?.attributes as WienerLinienAttrs | undefined)
      : undefined;
  }

  /** Lines reported by the live sensor for the currently selected
   *  direction. Used to populate the `line` select dropdown — the
   *  list is per-(stop, direction) so it can't live in a static
   *  schema. Allows `custom_value: true` so users can preserve a
   *  saved line that's temporarily not flowing. */
  private _linesForCurrent(): string[] {
    if (!this._config) return [];
    return linesForDirection(this._attrs(this._config.entity), this._config.direction);
  }

  /** Distinct termini ("Oberlaa", "Alaudagasse", …) seen in `dir` for the
   *  picker. When a line is already selected, narrow to that line's
   *  termini. When no line is selected (the typical case — the form
   *  asks for direction BEFORE line), fall back to all termini at the
   *  stop in that direction so the user can decide direction by
   *  destination, not by the abstract H/R. */
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

  /** Direction-dropdown label. Two formats:
   *  - With terminus(es): `H: Oberlaa` (compact letter prefix so the
   *    pill doesn't blow out at narrow widths).
   *  - Without terminus (no data flowing right now): full word
   *    `Hinfahrt` / `Rückfahrt` so the meaning is clear when no
   *    destination context is available.
   *  Caps at 3 termini joined by " / " plus a trailing "+N" for hub
   *  stops with many lines.
   */
  private _directionLabel(dir: "H" | "R"): string {
    return formatDirectionPillLabel(this._terminiForDirection(dir), {
      full: this._t(dir === "H" ? "dir_h" : "dir_r"),
      short: this._t(dir === "H" ? "dir_h_short" : "dir_r_short"),
    });
  }

  /** Distinct directions ("H" / "R") tracked at the currently-selected
   *  entity. Tracked-line keys win — once the user has configured which
   *  lines to track in the integration's config flow, only directions
   *  that have at least one tracked line are offered. Lines tracked in
   *  one direction (a nightline tracked R-only) reduce the dropdown to
   *  that direction so the line picker isn't empty when the user
   *  finishes configuring the retro card. Falls back to live departures
   *  for older sensor caches; empty result lets the schema show both
   *  options as a last resort. */
  private _availableDirections(): Set<"H" | "R"> {
    const attrs = this._attrs(this._config?.entity);
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

  /** Build the ha-form schema. Called per render so option labels
   *  pick up the current `hass.language` AND the current selected
   *  entity (which determines the line dropdown options).
   *
   *  Two saved-state robustness rules:
   *    - The line dropdown's `options` always includes the currently-saved
   *      `line` even if it's not flowing right now (off-hours, cold
   *      sensor, the line not yet observed in this direction). Without
   *      this, ha-form renders the trigger empty and the user thinks
   *      their config got wiped.
   *    - The direction dropdown hides the option for a direction with
   *      no live departures so the user can't pick a one-way stop's
   *      missing direction. When ONLY one direction has data and the
   *      saved value is the other, _scheduleDirectionAutocorrect (in
   *      render) flips the saved value to the available one. When the
   *      stop has no data yet, both options stay visible.
   */
  /** Shared options list for both sides' "Exit icon" dropdown.
   *  Built once so the two sides can never drift, and so new MDI
   *  options added to `RETRO_HEADER_MDI_EXIT_KEYS` flow into the
   *  editor automatically. */
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
    // Prepend the saved line if it's not in the live list — keeps the
    // dropdown trigger populated when the line isn't currently flowing.
    const allLines =
      savedLine && !liveLines.includes(savedLine)
        ? [savedLine, ...liveLines]
        : liveLines;
    const lineOptions = allLines.map((line) => ({
      value: line,
      label: line,
    }));

    const avail = this._availableDirections();
    const dirOptions: Array<{ value: string; label: string }> = [];
    // Empty avail → no entity / no data yet → show both so the user
    // can pre-pick a direction. Otherwise show only what the stop has.
    if (avail.size === 0 || avail.has("H")) {
      dirOptions.push({ value: "H", label: this._directionLabel("H") });
    }
    if (avail.size === 0 || avail.has("R")) {
      dirOptions.push({ value: "R", label: this._directionLabel("R") });
    }

    return [
      {
        // Filter to wiener-linien-austria sensors only — picking an
        // unrelated `sensor.*` would render an empty card.
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
          select: {
            mode: "dropdown",
            options: dirOptions,
          },
        },
      },
      {
        // `custom_value: true` so a previously-saved line that's
        // currently not flowing (off-hours, holidays) is preserved
        // rather than silently dropped to undefined on next save.
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
        // Station header strip — black band above the orange station
        // band, mimics the real Wiener Linien U-Bahn signage. Sits
        // *above* the station section in the editor to match the
        // top-down visual order: header → station band → departures.
        //
        // `flatten: true` on the outer wrapper spreads `header_left`
        // / `header_right` into the parent (root) config. The inner
        // expandables use `flatten: false` (the inverse of every
        // other expandable in this editor) because the config shape
        // for each side IS nested — `RetroHeaderSide` is an object
        // with `{exit, text, show_wc, show_escalator, show_elevator}`.
        type: "expandable",
        name: "header",
        title: this._et("section_header"),
        flatten: true,
        schema: [
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
            ],
          },
        ],
      },
      {
        // `flatten: true` is non-negotiable — see HaFormExpandableSchema
        // docstring in types.ts.
        type: "expandable",
        name: "station",
        title: this._et("section_station"),
        flatten: true,
        schema: [
          { name: "show_station_name", selector: { boolean: {} } },
          {
            // `mode: "list"` renders as radio buttons stacked vertically.
            // Three short options earn the column readout (one tap to
            // change vs a click-to-open dropdown). ha-selector-select
            // forces `ha-formfield { display: flex }` internally so the
            // options can't be made horizontal without piercing the
            // shadow boundary — left as a column by design.
            name: "station_bg",
            selector: {
              select: {
                mode: "list",
                options: [
                  { value: "default", label: this._et("station_bg_default") },
                  { value: "white", label: this._et("station_bg_white") },
                  { value: "black", label: this._et("station_bg_black") },
                ],
              },
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "display",
        title: this._et("section_display"),
        flatten: true,
        schema: [
          { name: "show_platform", selector: { boolean: {} } },
          { name: "accessibility_only", selector: { boolean: {} } },
          { name: "flicker", selector: { boolean: {} } },
          { name: "wheelchair_race", selector: { boolean: {} } },
          {
            // `grid` lays its child fields out side-by-side in a
            // two-column row — size + style are short enum-typed
            // pickers with three options each, so the radio columns
            // pack neatly next to each other instead of consuming
            // double the vertical space stacked.
            //
            // `name: ""` is required by ha-form's grid schema shape
            // (HaFormGridSchema in src/types.ts).
            type: "grid",
            name: "",
            schema: [
              {
                // mode "list" → radio column. See station_bg above.
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
              {
                name: "style",
                selector: {
                  select: {
                    mode: "list",
                    options: [
                      { value: "classic", label: this._et("style_classic") },
                      { value: "warm", label: this._et("style_warm") },
                      { value: "pixel", label: this._et("style_pixel") },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    ];
  }

  /** Field-label / helper-text resolution lives in `editor-shared.ts`
   *  so the modern and retro editors can't drift on the lookup chain.
   *  Retro adds a second card-bundle fallback (`retro.<field>`) on top
   *  of the modern editor's chain. */
  private _computeLabel = (field: { name: string }): string =>
    resolveEditorLabel(field, {
      hass: this.hass,
      et: (k) => this._et(k),
      editorNamespace: "retro.editor",
      cardLookup: (k) => this._t(k),
      cardNamespace: "retro",
    });

  private _computeHelper = (field: { name: string }): string | undefined =>
    resolveEditorHelper(field, {
      et: (k) => this._et(k),
      editorNamespace: "retro.editor",
    });

  /** ha-form input shape mirrors the saved-config shape one-to-one
   *  (no entity-array translation needed for the retro card). */
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
    // Pipe through normaliseRetroConfig so the boolean coercion + enum
    // narrowing stay consistent with the card's setConfig path.
    const next = normaliseRetroConfig({
      ...this._config,
      ...(value as Partial<WienerLinienRetroCardConfig>),
    });
    // Entity changed → the previous `line` is meaningless on the new
    // stop. Drop it and auto-pick the first tracked line in the
    // (possibly auto-corrected) direction. Tracked list survives off
    // hours (a nightline configured for an N-prefix entity still picks
    // the nightline at noon); falls back to the live-departure
    // derivation when the cache predates `tracked_line_keys`.
    if (next.entity !== prevEntity) {
      const sorted = linesForDirection(this._attrs(next.entity), next.direction);
      next.line = sorted[0];
    }
    // CRITICAL: set _config BEFORE fireEvent. Custom editors don't
    // receive a re-setConfig after config-changed, so a fireEvent-only
    // path leaves _config stale and the next render reverts the form
    // to its pre-change value.
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  };

  private _setWalkTime(key: string, raw: string): void {
    if (!this._config) return;
    const n = parseInt(raw, 10);
    const clean = Number.isFinite(n) && n > 0 ? Math.min(120, n) : null;
    const cur = { ...(this._config.walk_times ?? {}) };
    if (clean === null) delete cur[key];
    else cur[key] = clean;
    const next: NormalisedRetroConfig = { ...this._config };
    if (Object.keys(cur).length) next.walk_times = cur;
    else delete next.walk_times;
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  private _swallowKeys(ev: KeyboardEvent): void {
    ev.stopPropagation();
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    // After this render lands, swap the saved direction to whichever
    // direction the stop actually has data for IF it's currently
    // mismatched (e.g. user picked a one-way terminus stop while
    // direction was set to "R" from a previous bidirectional stop).
    // Deferred via Promise.resolve() so we never write to _config from
    // inside render() (Lit warns; queues a redundant re-render).
    this._scheduleDirectionAutocorrect();
    // Entity disappeared from HA (integration removed, entity disabled,
    // typo in saved config) — surface an explicit alert so the user
    // knows why their walk-time table is empty. ha-form's entity
    // selector flags the row visually but emits no user-readable
    // error; this fills the WCAG 3.3.1 (Error Identification) gap.
    const cfg = this._config;
    const entityMissing =
      !!cfg.entity && !this.hass?.states?.[cfg.entity];
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
          ? html`
              <ha-alert alert-type="warning">
                ${this._t("entity_missing").replace("{entity}", cfg.entity!)}
              </ha-alert>
            `
          : nothing}
        ${this._renderWalkTimeSection()}
      </div>
    `;
  }

  /** When the current entity exposes only one direction AND the saved
   *  config disagrees, dispatch a one-shot config-changed that swaps to
   *  the available direction. Coalesced via `_pendingDirectionFix` so
   *  render storms don't fire multiple corrections. No-op when both
   *  directions exist or no data has streamed yet (keeps the saved
   *  value untouched until the sensor reports). */
  private _scheduleDirectionAutocorrect(): void {
    if (!this._config || this._pendingDirectionFix) return;
    const avail = this._availableDirections();
    if (avail.size !== 1) return;  // both / neither → don't autocorrect
    const onlyAvail = avail.has("H") ? "H" : "R";
    if (this._config.direction === onlyAvail) return;
    this._pendingDirectionFix = true;
    Promise.resolve().then(() => {
      this._pendingDirectionFix = false;
      if (!this._config) return;
      // Re-check after the async hop — entity might have changed in
      // the meantime; the new entity might have both directions again.
      const stillAvail = this._availableDirections();
      if (stillAvail.size !== 1) return;
      const target = stillAvail.has("H") ? "H" : "R";
      if (this._config.direction === target) return;
      const next: NormalisedRetroConfig = { ...this._config, direction: target };
      // CRITICAL: assign _config BEFORE fireEvent, same lifecycle rule
      // as _onFormChanged — otherwise the next render reads stale data.
      this._config = next;
      fireEvent(this, "config-changed", { config: next });
    });
  }

  /** Bespoke section: per-(line, direction) walk-time inputs. The row
   *  list is derived from the live sensor's departures so it can't be
   *  expressed in a static ha-form schema. */
  private _renderWalkTimeSection(): TemplateResult {
    const cfg = this._config!;
    const attrs = this._attrs(cfg.entity);
    // One row per (line, direction) pair, not per (line, direction,
    // towards) triple — line.towards flips poll-to-poll on branching
    // termini, so a triple-keyed threshold would silently miss every
    // train labelled with the "other" terminus. See lineDirKey docs.
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
                  p.termini.length > 1 ? this._et("walk_time_branching_hint") : "";
                return html`
                  <div class="walk-time-row">
                    <span class="walk-time-badge">${p.line}</span>
                    <span
                      class="walk-time-towards"
                      title=${branchingHint || terminusLabel}
                    >→ ${terminusLabel}</span>
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
                      .value=${val !== undefined ? String(val) : ""}
                      @keydown=${this._swallowKeys}
                      @keyup=${this._swallowKeys}
                      @keypress=${this._swallowKeys}
                      @change=${(ev: Event) =>
                        this._setWalkTime(
                          key,
                          (ev.target as HTMLInputElement).value,
                        )}
                    />
                  </div>
                `;
              })
            : html`<div class="editor-hint">${this._et("walk_time_no_data")}</div>`}
        </div>
      </div>
    `;
  }

  // Retro editor needs only the shared base — no bespoke selectors
  // beyond what editor-shared-styles already provides.
  static override styles: CSSResultGroup = [editorBaseStyles];
}
