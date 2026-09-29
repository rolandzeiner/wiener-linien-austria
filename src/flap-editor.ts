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
// The element plumbing and the multi-stop Stops tab come from
// editor/board-editor.ts, shared with the modern and retro editors.

import { html, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { editorStyles } from "./editor/editor-styles.js";
import { editorTokens } from "./editor/editor-tokens.js";
import { headerStripStyles } from "./editor/header-strip-styles.js";
import { renderFormSection } from "./editor/editor-shell.js";
import { MultiStopEditor } from "./editor/board-editor.js";
import type { WienerLinienAttrs, WienerLinienFlapCardConfig } from "./types.js";
import { normaliseFlapConfig, type NormalisedFlapConfig } from "./utils/flap-config.js";

@customElement("wiener-linien-austria-flap-card-editor")
export class WienerLinienAustriaFlapCardEditor extends MultiStopEditor<NormalisedFlapConfig> {
  protected readonly _namespace = "flap";

  public override setConfig(config: WienerLinienFlapCardConfig): void {
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
    super.setConfig(config);
  }

  protected override _normalise(raw: WienerLinienFlapCardConfig): NormalisedFlapConfig {
    return normaliseFlapConfig(raw);
  }

  protected override _helperOverrides(
    cfg: NormalisedFlapConfig,
  ): Record<string, string | undefined> {
    const { et } = this._i18n;
    return cfg.show_accessibility
      ? {}
      : { accessibility_only: et("accessibility_only_requires") };
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override _renderDisplay(cfg: NormalisedFlapConfig): TemplateResult {
    const { et } = this._i18n;
    return html`
      ${this._renderStationBand(cfg, this._stationBgOptions())}
      ${renderFormSection({
        ...this._form,
        title: et("section_departure_row"),
        hint: et("section_board"),
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
            // Disabled with the reason in its helper rather than hidden: a
            // vanished row makes the user hunt, a disabled one teaches the
            // rule. Why not `visible:` — see HaFormBaseSchema in types.ts.
            disabled: !cfg.show_accessibility,
            selector: { boolean: {} },
          },
        ],
      })}
    `;
  }

  protected override _renderTweaks(cfg: NormalisedFlapConfig): TemplateResult {
    const { et } = this._i18n;
    return html`
      ${renderFormSection({
        ...this._form,
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
        ...this._form,
        title: et("section_footer"),
        data: { hide_attribution: cfg.hide_attribution },
        schema: [{ name: "hide_attribution", selector: { boolean: {} } }],
      })}
    `;
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

  static override styles: CSSResultGroup = [
    editorTokens,
    editorStyles,
    // Only the two cards that render the strip pay for its rules.
    headerStripStyles,
  ];
}
