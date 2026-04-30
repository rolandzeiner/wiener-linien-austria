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

import { LitElement, html, nothing, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { editorBaseStyles } from "./editor-shared-styles.js";
import { translate } from "./localize/localize.js";
import type {
  HaFormSchema,
  WienerLinienAttrs,
  WienerLinienRetroCardConfig,
} from "./types.js";
import { normaliseRetroConfig, type NormalisedRetroConfig } from "./utils/config.js";
import { lineDirKey, pairsAtStop } from "./utils/departures.js";

/** Local minimal `fireEvent` shim — `bubbles: true` + `composed: true`
 *  are required so the event crosses our shadow boundary and reaches
 *  the dashboard's card-editor listener. */
function fireEvent<T>(node: HTMLElement, type: string, detail: T): void {
  node.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true }),
  );
}

@customElement("wiener-linien-austria-retro-card-editor")
export class WienerLinienAustriaRetroCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRetroConfig;

  public setConfig(config: WienerLinienRetroCardConfig): void {
    this._config = normaliseRetroConfig(config);
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
    const attrs = this._attrs(this._config.entity);
    const dir = this._config.direction;
    const s = new Set<string>();
    for (const d of attrs?.departures ?? []) {
      if (d.direction === dir && d.line) s.add(d.line);
    }
    return [...s].sort();
  }

  /** Build the ha-form schema. Called per render so option labels
   *  pick up the current `hass.language` AND the current selected
   *  entity (which determines the line dropdown options). */
  private _schema(): ReadonlyArray<HaFormSchema> {
    const lineOptions = this._linesForCurrent().map((line) => ({
      value: line,
      label: line,
    }));

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
            options: [
              { value: "H", label: this._t("dir_h") },
              { value: "R", label: this._t("dir_r") },
            ],
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
        // `flatten: true` is non-negotiable — see HaFormExpandableSchema
        // docstring in types.ts.
        type: "expandable",
        name: "station",
        title: this._et("section_station"),
        flatten: true,
        schema: [
          { name: "show_station_name", selector: { boolean: {} } },
          {
            name: "station_bg",
            selector: {
              select: {
                mode: "dropdown",
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
            name: "size",
            selector: {
              select: {
                mode: "dropdown",
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
                mode: "dropdown",
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
    ];
  }

  /** Field-label resolver. Three-step chain:
   *  1. HA core's own translations for common field names ("entity",
   *     "name"). `hass.localize` returns "" on miss, not the key.
   *  2. The card's editor-namespaced bundle (`editor.<field>` first,
   *     `<field>` second).
   *  3. Last resort: raw field name (still functional, dev sees the gap). */
  private _computeLabel = (field: { name: string }): string => {
    const haKey = `ui.panel.lovelace.editor.card.generic.${field.name}`;
    const ha = this.hass?.localize?.(haKey);
    if (ha) return ha;
    const editorTrans = this._et(field.name);
    if (editorTrans !== `retro.editor.${field.name}` && editorTrans !== field.name) {
      return editorTrans;
    }
    const cardTrans = this._t(field.name);
    if (cardTrans !== `retro.${field.name}` && cardTrans !== field.name) {
      return cardTrans;
    }
    return field.name;
  };

  /** Helper-text resolver. Surfaces a helper only when an
   *  `editor.<field>_helper` key actually exists in the bundle —
   *  otherwise ha-form's empty helper line eats vertical space. */
  private _computeHelper = (field: { name: string }): string | undefined => {
    const key = `${field.name}_helper`;
    const editorTrans = this._et(key);
    if (editorTrans !== `retro.editor.${key}` && editorTrans !== key) {
      return editorTrans;
    }
    return undefined;
  };

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
    const value = ev.detail.value;
    // Pipe through normaliseRetroConfig so the boolean coercion + enum
    // narrowing stay consistent with the card's setConfig path.
    const next = normaliseRetroConfig({
      ...this._config,
      ...(value as Partial<WienerLinienRetroCardConfig>),
    });
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
        ${this._renderWalkTimeSection()}
      </div>
    `;
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
  static styles: CSSResultGroup = [editorBaseStyles];
}
