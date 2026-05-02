// Schema-driven Lovelace editor for the Wiener Linien Austria modern card.
//
// Design notes
// ------------
// * Static fields go through `<ha-form>`: the `entities` selector
//   (multi-select sensor picker, integration-filtered), `layout`, the
//   `max_departures` slider, and the boolean toggles in the "display"
//   expandable. ha-form is the canonical HA editor component: theme
//   integration, label/helper localisation chain, a11y / forced-colors
//   / focus-visible all match HA core.
//
// * **Three bespoke sections** stay below `<ha-form>` because their
//   row lists are derived from the live data (lines/direction/walk-time
//   per stop, colour swatches per line in the user's selection):
//   - Per-stop filters (line chips + direction picker + per-line dir
//     overrides + walk-times) — one block per configured entity.
//   - Per-line colour swatches — native `<input type="color">` is the
//     right primitive for this; ha-form has no equivalent selector.
//
// * **Storage-shape translator** at the form-changed boundary —
//   ha-form's entity selector with `multiple: true` emits a flat
//   `string[]`; the saved config carries `Array<NormalisedModernStop>`
//   to preserve per-stop overrides (lines, direction, walk_times) when
//   the user adds/removes a stop. Without the translator, every
//   add/remove cycle would wipe every per-stop override silently.
//
// * **Editor `_config` lifecycle gotcha** — custom editors do NOT
//   receive a re-`setConfig()` after dispatching `config-changed`. The
//   form-handler must therefore set `this._config = next` BEFORE
//   firing the event; otherwise the next render reads stale state.
//
// * **`expandable` + `flatten: true`** — without `flatten`, ha-form
//   scopes inner-schema values under `data[name]` and the card's
//   flat-key reads (`this._config.show_platform`) silently default.

import { LitElement, css, html, nothing, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { editorBaseStyles } from "./editor-shared-styles.js";
import { translate } from "./localize/localize.js";
import type {
  HaFormSchema,
  WienerLinienAttrs,
  WienerLinienCardConfig,
} from "./types.js";
import {
  colorForLine,
  normaliseModernConfig,
  type NormalisedModernConfig,
  type NormalisedModernStop,
} from "./utils/config.js";
import {
  collectLinesInSelection,
  lineDirKey,
  pairsAtStop,
  tripletsAtStop,
} from "./utils/departures.js";
import { lineTypeIcon } from "./utils/mot.js";

/** Local minimal `fireEvent` shim — `bubbles: true` + `composed: true`
 *  are required so the event crosses our shadow boundary and reaches
 *  the dashboard's card-editor listener. */
function fireEvent<T>(node: HTMLElement, type: string, detail: T): void {
  node.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true }),
  );
}

@customElement("wiener-linien-austria-card-editor")
export class WienerLinienAustriaCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedModernConfig;

  public setConfig(config: WienerLinienCardConfig): void {
    this._config = normaliseModernConfig(config);
  }

  private _et(key: string): string {
    return translate(`modern.editor.${key}`, { hassLanguage: this.hass?.language });
  }

  private _t(key: string): string {
    return translate(`modern.${key}`, { hassLanguage: this.hass?.language });
  }

  private _fire(next: NormalisedModernConfig): void {
    // CRITICAL: set _config BEFORE fireEvent. Custom editors don't
    // receive a re-setConfig after config-changed, so a fireEvent-only
    // path leaves _config stale and the next render reverts the form
    // to its pre-change value.
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }

  // ------------------------------------------------------------------
  // ha-form schema + computed labels/helpers
  // ------------------------------------------------------------------

  private _schema(): ReadonlyArray<HaFormSchema> {
    return [
      {
        name: "entities",
        required: true,
        selector: {
          entity: {
            domain: "sensor",
            integration: "wiener_linien_austria",
            multiple: true,
          },
        },
      },
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "stacked", label: this._et("layout_stacked") },
              { value: "tabs", label: this._et("layout_tabs") },
            ],
          },
        },
      },
      {
        // `flatten: true` — every toggle below writes flat to `data`
        // (e.g. `data.show_hero_metric`), matching the card's flat
        // config-key reads. See HaFormExpandableSchema docstring.
        type: "expandable",
        name: "display",
        title: this._et("section_display"),
        flatten: true,
        schema: [
          {
            name: "max_departures",
            selector: {
              number: { min: 0, max: 20, step: 1, mode: "slider" },
            },
          },
          { name: "hide_header", selector: { boolean: {} } },
          { name: "show_hero_metric", selector: { boolean: {} } },
          { name: "show_departures", selector: { boolean: {} } },
          { name: "show_stops_ahead", selector: { boolean: {} } },
          { name: "show_qr_button", selector: { boolean: {} } },
          { name: "show_platform", selector: { boolean: {} } },
          { name: "show_accessibility", selector: { boolean: {} } },
          { name: "accessibility_only", selector: { boolean: {} } },
          { name: "show_type_icon", selector: { boolean: {} } },
          { name: "show_traffic_info", selector: { boolean: {} } },
          { name: "show_elevator_info", selector: { boolean: {} } },
          { name: "show_delay", selector: { boolean: {} } },
          { name: "hide_attribution", selector: { boolean: {} } },
        ],
      },
    ];
  }

  /** Field-label resolver. Three-step chain:
   *  1. HA core's own translations for common field names.
   *  2. Card's editor-namespaced bundle (`editor.<field>`).
   *  3. Last resort: raw field name. */
  private _computeLabel = (field: { name: string }): string => {
    const haKey = `ui.panel.lovelace.editor.card.generic.${field.name}`;
    const ha = this.hass?.localize?.(haKey);
    if (ha) return ha;
    const editorTrans = this._et(field.name);
    if (editorTrans !== `modern.editor.${field.name}` && editorTrans !== field.name) {
      return editorTrans;
    }
    return field.name;
  };

  /** Helper-text resolver. Returns undefined on miss so empty helper
   *  lines don't eat vertical space. */
  private _computeHelper = (field: { name: string }): string | undefined => {
    const key = `${field.name}_helper`;
    const editorTrans = this._et(key);
    if (editorTrans !== `modern.editor.${key}` && editorTrans !== key) {
      return editorTrans;
    }
    return undefined;
  };

  /** Translate the saved-config shape (Array<NormalisedModernStop>) to
   *  ha-form's input shape (flat string[]). Per-stop overrides are
   *  rendered separately below the form. */
  private _formData(): Record<string, unknown> {
    if (!this._config) return {};
    const entities = this._config.entities.map((s) => s.entity);
    return {
      ...this._config,
      entities,
    };
  }

  /** Translate ha-form's value back to NormalisedModernConfig. The
   *  storage-shape translator is the critical piece: when the user
   *  adds/removes a stop via the entity selector, ha-form emits a
   *  flat `string[]`, but we must preserve per-stop overrides
   *  (lines, direction, walk_times, line_directions) for the surviving
   *  entities. Match by entity id; new entities get a bare
   *  `{ entity: id }` placeholder. */
  private _onFormChanged = (
    ev: CustomEvent<{ value: Record<string, unknown> }>,
  ): void => {
    if (!this._config) return;
    const value = ev.detail.value;
    const rawEntities = value["entities"];
    const newEntityIds: string[] = Array.isArray(rawEntities)
      ? rawEntities.filter((s): s is string => typeof s === "string" && s.length > 0)
      : [];
    // Index current per-stop overrides by entity id.
    const byEntity = new Map<string, NormalisedModernStop>();
    for (const stop of this._config.entities) {
      byEntity.set(stop.entity, stop);
    }
    // Rebuild in the order ha-form produced (so user-visible order
    // tracks the selector). New entities get a placeholder; surviving
    // entities preserve their overrides.
    const nextEntities: NormalisedModernStop[] = newEntityIds.map(
      (eid) => byEntity.get(eid) ?? { entity: eid },
    );

    // Pipe through normaliseModernConfig so the boolean coercion + slider
    // clamp + layout narrowing stay consistent with the card's setConfig.
    // Spread existing _config first to preserve dashboard passthrough
    // fields AND `type` (which ha-form's value never carries).
    const next = normaliseModernConfig({
      ...(this._config as unknown as WienerLinienCardConfig),
      ...(value as Partial<WienerLinienCardConfig>),
      entities: nextEntities,
    });
    this._fire(next);
  };

  // ------------------------------------------------------------------
  // Bespoke per-stop mutators (line chips, direction, walk-times)
  // ------------------------------------------------------------------

  private _updateStop(
    eid: string,
    mutator: (s: NormalisedModernStop) => NormalisedModernStop,
  ): void {
    if (!this._config) return;
    const entities = this._config.entities.map((s) =>
      s.entity === eid ? mutator({ ...s }) : s,
    );
    this._fire({ ...this._config, entities });
  }

  private _toggleLine(eid: string, line: string): void {
    this._updateStop(eid, (s) => {
      const cur = new Set(s.lines ?? []);
      if (cur.has(line)) cur.delete(line);
      else cur.add(line);
      if (cur.size > 0) s.lines = [...cur];
      else delete s.lines;
      return s;
    });
  }

  private _setDirection(eid: string, dir: "H" | "R" | null): void {
    this._updateStop(eid, (s) => {
      if (dir === null) delete s.direction;
      else s.direction = dir;
      return s;
    });
  }

  private _setLineDirection(
    eid: string,
    line: string,
    dir: "H" | "R" | null,
  ): void {
    this._updateStop(eid, (s) => {
      const cur = { ...(s.line_directions ?? {}) };
      if (dir === null) delete cur[line];
      else cur[line] = dir;
      if (Object.keys(cur).length) s.line_directions = cur;
      else delete s.line_directions;
      return s;
    });
  }

  private _setWalkTime(eid: string, key: string, raw: string): void {
    const n = parseInt(raw, 10);
    const clean = Number.isFinite(n) && n > 0 ? Math.min(120, n) : null;
    this._updateStop(eid, (s) => {
      const cur = { ...(s.walk_times ?? {}) };
      if (clean === null) delete cur[key];
      else cur[key] = clean;
      if (Object.keys(cur).length) s.walk_times = cur;
      else delete s.walk_times;
      return s;
    });
  }

  private _setLineColor(line: string, color: string): void {
    if (!this._config) return;
    const line_colors = {
      ...this._config.line_colors,
      [line.toUpperCase()]: color,
    };
    this._fire({ ...this._config, line_colors });
  }

  private _resetLineColor(line: string): void {
    if (!this._config) return;
    const line_colors = { ...this._config.line_colors };
    delete line_colors[line.toUpperCase()];
    this._fire({ ...this._config, line_colors });
  }

  // HA's card-editor steals arrow keys for navigation; stop propagation
  // on number inputs so the user can actually edit values.
  private _swallowKeys(ev: KeyboardEvent): void {
    ev.stopPropagation();
  }

  private _attrs(eid: string): WienerLinienAttrs | undefined {
    return this.hass?.states?.[eid]?.attributes as WienerLinienAttrs | undefined;
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected render(): TemplateResult | typeof nothing {
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
        ${this._renderColorsSection()}
      </div>
    `;
  }

  /** One bespoke per-stop section per configured entity. Holds the
   *  line chips + direction picker + per-line direction overrides +
   *  walk-time inputs. Derived from the live sensor's departures so
   *  the row list can't be expressed as a static schema. */
  private _renderPerStopSections(): TemplateResult | typeof nothing {
    const cfg = this._config!;
    if (!cfg.entities.length) return nothing;
    return html`${cfg.entities.map((stop) => this._renderStopFilter(stop))}`;
  }

  /** Build a direction-button label that prefers the live terminus(es)
   *  with a compact "H:" / "R:" prefix; falls back to the full word
   *  ("Hinfahrt" / "Rückfahrt") when no terminus data is available.
   *  Caps at 3 termini joined by " / " plus a trailing "+N" so hub
   *  stops with many lines stay readable in narrow pills. */
  private _directionLabelFromTermini(
    dir: "H" | "R",
    termini: string[],
  ): string {
    if (!termini.length) {
      return this._t(dir === "H" ? "dir_h" : "dir_r");
    }
    const prefix = this._t(dir === "H" ? "dir_h_short" : "dir_r_short");
    const head = termini.slice(0, 3).join(" / ");
    const more = termini.length > 3 ? ` +${termini.length - 3}` : "";
    return `${prefix}: ${head}${more}`;
  }

  /** Stop-wide direction-button label: pools every terminus visible in
   *  `dir` across every line at the stop. Useful at hub stops where the
   *  user wants to know "Hinfahrt = which destinations?" before
   *  committing to the filter. */
  private _stopWideDirectionLabel(
    triplets: ReadonlyArray<{ line: string; direction: string; towards: string }>,
    dir: "H" | "R",
  ): string {
    const termini = new Set<string>();
    for (const t of triplets) {
      if (t.direction === dir && t.towards) termini.add(t.towards);
    }
    return this._directionLabelFromTermini(dir, [...termini].sort());
  }

  /** Per-line direction-button label: terminus(es) for one specific line
   *  in `dir`. Same compact / fallback behaviour as the stop-wide label. */
  private _perLineDirectionLabel(
    triplets: ReadonlyArray<{ line: string; direction: string; towards: string }>,
    line: string,
    dir: "H" | "R",
  ): string {
    const termini = new Set<string>();
    for (const t of triplets) {
      if (t.line === line && t.direction === dir && t.towards) {
        termini.add(t.towards);
      }
    }
    return this._directionLabelFromTermini(dir, [...termini].sort());
  }

  private _renderStopFilter(stop: NormalisedModernStop): TemplateResult {
    const attrs = this._attrs(stop.entity);
    if (!attrs) return html``;
    const stopName = attrs.stop_name || stop.entity;
    const overrides = this._config!.line_colors;
    const lineColors = attrs.line_colors ?? {};
    const lines = [...new Set(
      (attrs.departures ?? []).map((d) => d.line).filter((l): l is string => !!l),
    )].sort();
    // Per-line vehicle type lookup so each chip can render its MoT icon
    // (mdi:subway-variant / mdi:tram / mdi:bus). First-seen-wins on
    // collision because Wiener Linien lines have a stable single MoT.
    const typeByLine = new Map<string, string>();
    for (const d of attrs.departures ?? []) {
      if (d.line && d.type && !typeByLine.has(d.line)) {
        typeByLine.set(d.line, d.type);
      }
    }
    const picked = new Set(stop.lines ?? []);
    const dir = stop.direction ?? null;
    const lineDirs = stop.line_directions ?? {};

    const effectiveLines = picked.size > 0 ? lines.filter((l) => picked.has(l)) : lines;
    const showPerLineDir = effectiveLines.length >= 2;

    const allTriplets = tripletsAtStop(attrs);
    const triplets = allTriplets.filter((t) => {
      if (picked.size > 0 && !picked.has(t.line)) return false;
      const effDir = lineDirs[t.line] ?? dir;
      if (effDir && t.direction !== effDir) return false;
      return true;
    });

    const dirsForLine = (line: string): Set<"H" | "R"> => {
      const out = new Set<"H" | "R">();
      for (const t of allTriplets) {
        if (t.line !== line) continue;
        if (t.direction === "H" || t.direction === "R") out.add(t.direction);
      }
      return out;
    };
    const stopAvailableDirs = new Set<"H" | "R">();
    for (const t of allTriplets) {
      if (t.direction === "H" || t.direction === "R") stopAvailableDirs.add(t.direction);
    }
    const stopHasH = stopAvailableDirs.has("H");
    const stopHasR = stopAvailableDirs.has("R");
    const stopOnlyOne = stopAvailableDirs.size === 1;
    const stopActiveH = dir === "H" || (dir === null && stopOnlyOne && stopHasH);
    const stopActiveR = dir === "R" || (dir === null && stopOnlyOne && stopHasR);
    const stopActiveBoth = dir === null && !stopOnlyOne;

    return html`
      <div class="stop-filter">
        <div class="stop-filter-header">${stopName}</div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("lines_label")}</div>
          <div class="line-chips">
            ${lines.length
              ? lines.map((l) => {
                  const isOn = picked.size === 0 || picked.has(l);
                  const color = colorForLine(l, overrides, lineColors);
                  const icon = lineTypeIcon(typeByLine.get(l)) ?? "mdi:bus-stop";
                  return html`<button
                    type="button"
                    class=${classMap({ chip: true, selected: isOn })}
                    style=${styleMap({ "--chip-color": color })}
                    aria-pressed=${isOn ? "true" : "false"}
                    aria-label="${this._et("lines_label")}: ${l}"
                    @click=${() => this._toggleLine(stop.entity, l)}
                  >
                    <ha-icon icon=${icon} aria-hidden="true"></ha-icon>
                    <span>${l}</span>
                  </button>`;
                })
              : html`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
          </div>
        </div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("direction_label")}</div>
          <div class="direction-buttons">
            <button
              type="button"
              class=${classMap({ active: stopActiveH })}
              ?disabled=${!stopHasH}
              title=${!stopHasH ? this._et("direction_unavailable") : ""}
              @click=${() => stopHasH && this._setDirection(stop.entity, "H")}
            >${this._stopWideDirectionLabel(allTriplets, "H")}</button>
            <button
              type="button"
              class=${classMap({ active: stopActiveR })}
              ?disabled=${!stopHasR}
              title=${!stopHasR ? this._et("direction_unavailable") : ""}
              @click=${() => stopHasR && this._setDirection(stop.entity, "R")}
            >${this._stopWideDirectionLabel(allTriplets, "R")}</button>
            <button
              type="button"
              class=${classMap({ active: stopActiveBoth })}
              ?disabled=${stopOnlyOne}
              title=${stopOnlyOne ? this._et("direction_unavailable") : ""}
              @click=${() => !stopOnlyOne && this._setDirection(stop.entity, null)}
            >${this._t("dir_both")}</button>
          </div>
        </div>

        ${showPerLineDir
          ? html`
              <div class="stop-filter-row">
                <div class="stop-filter-row-label">${this._et("per_line_direction_label")}</div>
                <div class="editor-hint">${this._et("per_line_direction_hint")}</div>
                <div class="per-line-dir-list">
                  ${effectiveLines.map((l) => {
                    const color = colorForLine(l, overrides, lineColors);
                    const lineDir = lineDirs[l] ?? null;
                    const lineAvail = dirsForLine(l);
                    const lineHasH = lineAvail.has("H");
                    const lineHasR = lineAvail.has("R");
                    const lineOnlyOne = lineAvail.size === 1;
                    const lineActiveH = lineDir === "H" || (lineDir === null && lineOnlyOne && lineHasH);
                    const lineActiveR = lineDir === "R" || (lineDir === null && lineOnlyOne && lineHasR);
                    const lineActiveBoth = lineDir === null && !lineOnlyOne;
                    const ariaLabel = this._et("per_line_direction_aria").replace("{line}", l);
                    const dirUnavailable = this._et("direction_unavailable");
                    // Show this line's actual termini per direction
                    // (e.g. "H: Oberlaa") so the user picks by destination,
                    // not abstract H/R. Falls back to the full word
                    // ("Hinfahrt"/"Rückfahrt") when no data flows.
                    const labelFor = (d: "H" | "R"): string =>
                      this._perLineDirectionLabel(allTriplets, l, d);
                    return html`
                      <div class="per-line-dir-row" role="group" aria-label=${ariaLabel}>
                        <span class="per-line-dir-badge" style=${styleMap({ background: color })}>${l}</span>
                        <div class="direction-buttons">
                          <button
                            type="button"
                            class=${classMap({ active: lineActiveH })}
                            aria-pressed=${lineActiveH ? "true" : "false"}
                            ?disabled=${!lineHasH}
                            title=${!lineHasH ? dirUnavailable : ""}
                            @click=${() => lineHasH && this._setLineDirection(stop.entity, l, "H")}
                          >${labelFor("H")}</button>
                          <button
                            type="button"
                            class=${classMap({ active: lineActiveR })}
                            aria-pressed=${lineActiveR ? "true" : "false"}
                            ?disabled=${!lineHasR}
                            title=${!lineHasR ? dirUnavailable : ""}
                            @click=${() => lineHasR && this._setLineDirection(stop.entity, l, "R")}
                          >${labelFor("R")}</button>
                          <button
                            type="button"
                            class=${classMap({ active: lineActiveBoth })}
                            aria-pressed=${lineActiveBoth ? "true" : "false"}
                            ?disabled=${lineOnlyOne}
                            title=${lineOnlyOne ? dirUnavailable : ""}
                            @click=${() => !lineOnlyOne && this._setLineDirection(stop.entity, l, null)}
                          >${this._t("dir_both")}</button>
                        </div>
                      </div>
                    `;
                  })}
                </div>
              </div>
            `
          : nothing}

        ${this._renderWalkTimes(stop, triplets, dir, lineDirs)}
      </div>
    `;
  }

  private _renderWalkTimes(
    stop: NormalisedModernStop,
    triplets: ReturnType<typeof tripletsAtStop>,
    dir: "H" | "R" | null,
    lineDirs: Record<string, "H" | "R">,
  ): TemplateResult | typeof nothing {
    void triplets; // direction visibility handled per pair below
    const overrides = this._config!.line_colors;
    const attrs = this._attrs(stop.entity);
    const lineColors = attrs?.line_colors ?? {};
    const allPairs = pairsAtStop(attrs);
    const picked = new Set(stop.lines ?? []);
    const pairs = allPairs.filter((p) => {
      if (picked.size > 0 && !picked.has(p.line)) return false;
      const effDir = lineDirs[p.line] ?? dir;
      if (effDir && p.direction !== effDir) return false;
      return true;
    });
    if (!pairs.length) return nothing;
    return html`
      <div class="stop-filter-row">
        <div class="stop-filter-row-label">${this._et("walk_time_label")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${pairs.map((p) => {
            const color = colorForLine(p.line, overrides, lineColors);
            const key = lineDirKey(p.line, p.direction);
            const val = stop.walk_times?.[key];
            const terminusLabel = p.termini.join(" / ");
            const arrow = terminusLabel ? `→ ${terminusLabel}` : "";
            const branchingHint =
              p.termini.length > 1 ? this._et("walk_time_branching_hint") : "";
            return html`
              <div class="walk-time-row">
                <span class="walk-time-badge" style=${styleMap({ background: color })}>${p.line}</span>
                <span class="walk-time-towards" title=${branchingHint || terminusLabel}>${arrow}</span>
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
                      stop.entity,
                      key,
                      (ev.target as HTMLInputElement).value,
                    )}
                />
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  /** Per-line colour swatch grid — bespoke because native
   *  `<input type="color">` is the right primitive for picking a
   *  hex value, and ha-form has no equivalent selector. */
  private _renderColorsSection(): TemplateResult {
    const cfg = this._config!;
    const lines = collectLinesInSelection(this.hass, cfg.entities.map((s) => s.entity));
    const overrides = cfg.line_colors;
    // Every sensor publishes the same GTFS palette; pick the first non-empty
    // map across configured entities so the swatches preview the upstream
    // default rather than the neutral fallback.
    let lineColors: NonNullable<WienerLinienAttrs["line_colors"]> = {};
    for (const stop of cfg.entities) {
      const attrs = this.hass?.states?.[stop.entity]?.attributes as WienerLinienAttrs | undefined;
      if (attrs?.line_colors && Object.keys(attrs.line_colors).length) {
        lineColors = attrs.line_colors;
        break;
      }
    }
    return html`
      <div class="editor-section">
        <div class="section-header">${this._et("section_colors")}</div>
        <div class="editor-hint">${this._et("colors_hint")}</div>
        ${lines.length
          ? lines.map((line) => {
              const current = colorForLine(line, overrides, lineColors, "#888888");
              const hex = current.startsWith("#") ? current : "#888888";
              const hasOverride = Boolean(overrides[line.toUpperCase()]);
              const ariaPick = this._et("pick_color_for_line").replace("{line}", line);
              return html`
                <div class="color-row">
                  <span class="line-preview" aria-hidden="true" style=${styleMap({ background: current })}>${line}</span>
                  <label
                    class="color-swatch"
                    style=${`--swatch-color: ${hex};`}
                    title=${ariaPick}
                  >
                    <ha-icon icon="mdi:palette-swatch-variant" aria-hidden="true"></ha-icon>
                    <span class="color-swatch-hex">${hex.toUpperCase()}</span>
                    <input
                      type="color"
                      class="color-swatch-input"
                      .value=${hex}
                      aria-label=${ariaPick}
                      @input=${(ev: Event) =>
                        this._setLineColor(line, (ev.target as HTMLInputElement).value)}
                      @change=${(ev: Event) =>
                        this._setLineColor(line, (ev.target as HTMLInputElement).value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="reset-btn"
                    ?disabled=${!hasOverride}
                    @click=${() => hasOverride && this._resetLineColor(line)}
                  >${this._et("reset_color")}</button>
                </div>
              `;
            })
          : html`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
      </div>
    `;
  }

  static styles: CSSResultGroup = [
    editorBaseStyles,
    css`
    .stop-filter {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .stop-filter-header {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .stop-filter-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .stop-filter-row-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .line-chips,
    .per-line-dir-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .per-line-dir-list {
      flex-direction: column;
      gap: 4px;
    }
    .per-line-dir-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .per-line-dir-badge {
      min-width: 36px;
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.8125rem;
    }
    /* Line chip — outlined-by-default, filled-when-selected, with the
       MoT icon beside the line label. Mirrors linz-linien's chip
       pattern: --chip-color is set inline per line (GTFS palette →
       colorForLine), the CSS does state via .selected + the
       color-mix hover tint. */
    .chip {
      --chip-color: var(--primary-color);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      transition:
        background-color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease),
        color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
      border: 1.5px solid var(--chip-color);
      background: transparent;
      color: var(--primary-text-color);
      forced-color-adjust: none;
    }
    .chip ha-icon {
      --mdc-icon-size: 16px;
      color: var(--chip-color);
      flex-shrink: 0;
      transition: color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
    }
    .chip:hover {
      background: color-mix(in srgb, var(--chip-color) 16%, transparent);
    }
    .chip.selected {
      background: var(--chip-color);
      color: #fff;
    }
    .chip.selected ha-icon {
      color: #fff;
    }
    .chip:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .direction-buttons {
      display: inline-flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .direction-buttons button {
      padding: 8px 14px;
      border-radius: 18px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      min-width: 44px;
      min-height: 36px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .direction-buttons button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    /* walk-time rules live in editor-shared-styles. The modern editor
       styles its badge bg per-line via styleMap (vs the shared default
       var(--primary-color)), but the box-model rules are identical. */
    .color-row {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      align-items: center;
      gap: 12px;
      margin-top: 6px;
    }
    .line-preview {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 0.8125rem;
    }
    .color-swatch {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      cursor: pointer;
    }
    .color-swatch::before {
      content: "";
      width: 16px;
      height: 16px;
      border-radius: 4px;
      background: var(--swatch-color, #888888);
    }
    .color-swatch-hex {
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
    }
    .color-swatch-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .reset-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
      font-size: 0.75rem;
      cursor: pointer;
    }
    .reset-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
  ];
}
