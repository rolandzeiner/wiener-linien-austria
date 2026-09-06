// The tab shell every v2 editor sits on.
//
// v1 had three information architectures for one knob vocabulary: modern
// dumped seventeen fields into a single collapsible section, while retro and
// flap used four. Nothing you learned in one editor transferred to the next.
//
// v2 gives all three the same three tabs, in the same order, always:
//
//   Stops       everything per stop — entity, line filter, direction, walk times
//   Anzeige     everything that changes what the card shows
//   Feinheiten  cosmetics and easter eggs
//
// Inside a tab the content is a flat list of sections — one collapse level
// only. The per-stop block is the sole nested unit, because only its length is
// data-driven (a stop yields anywhere from one to a dozen walk-time rows).
//
// Sections are named after card regions (Stationsband, Abfahrtszeile,
// Stationsanzeige) rather than after config groups. That is the deliberate,
// cheap link to the live preview sitting beside the editor: the user reads a
// section name and knows which part of the card it moves.

import { html, nothing, type TemplateResult } from "lit";

import type { HaFormSchema, HomeAssistant } from "../types.js";

export type TabKey = "stops" | "display" | "tweaks";

export const TAB_ORDER: ReadonlyArray<TabKey> = ["stops", "display", "tweaks"];

export interface TabDef {
  key: TabKey;
  label: string;
}

/** Tab bar. `tablist` / `tab` roles rather than plain buttons so a screen
 *  reader announces "tab 2 of 3" and arrow keys behave the way users expect
 *  from every other tabbed surface in HA. */
export function renderTabs(
  tabs: ReadonlyArray<TabDef>,
  active: TabKey,
  onSelect: (key: TabKey) => void,
): TemplateResult {
  const focusSibling = (ev: KeyboardEvent, index: number): void => {
    const delta = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    ev.preventDefault();
    // Wrap, so arrowing past either end lands on the far tab rather than
    // dead-ending — matches the ARIA authoring practices for tabs.
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (next) onSelect(next.key);
  };

  return html`
    <div class="wl-tabs" role="tablist">
      ${tabs.map(
        (tab, i) => html`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${tab.key}`}
          aria-selected=${active === tab.key ? "true" : "false"}
          aria-controls=${`wl-panel-${tab.key}`}
          tabindex=${active === tab.key ? "0" : "-1"}
          @click=${() => onSelect(tab.key)}
          @keydown=${(ev: KeyboardEvent) => focusSibling(ev, i)}
        >
          ${tab.label}
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`,
      )}
    </div>
  `;
}

export function renderPanel(
  active: TabKey,
  content: TemplateResult | typeof nothing,
): TemplateResult {
  return html`
    <div
      class=${active === "stops" ? "wl-panel wl-panel--stops" : "wl-panel"}
      role="tabpanel"
      id=${`wl-panel-${active}`}
      aria-labelledby=${`wl-tab-${active}`}
    >
      ${content}
    </div>
  `;
}

export interface SectionOptions {
  title: string;
  /** Right-aligned micro-label. Says which card region the section moves. */
  hint?: string;
}

/** Section chrome around arbitrary content — used for the bespoke sections
 *  (line colours, the header strip). */
export function renderSection(
  opts: SectionOptions,
  content: TemplateResult | typeof nothing,
): TemplateResult {
  return html`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${opts.title}</span>
        ${opts.hint ? html`<span class="wl-section-hint">${opts.hint}</span>` : nothing}
      </header>
      <div class="wl-section-body">${content}</div>
    </section>
  `;
}

export interface FormSectionOptions extends SectionOptions {
  hass: HomeAssistant | undefined;
  schema: ReadonlyArray<HaFormSchema>;
  data: Record<string, unknown>;
  computeLabel: (field: { name: string }) => string;
  computeHelper: (field: { name: string }) => string | undefined;
  onChange: (value: Record<string, unknown>) => void;
}

/** Section whose rows are one `<ha-form>` schema slice.
 *
 *  One form per section rather than one form for the whole tab: it is what
 *  lets a section carry its own header and hint while its rows stay HA-native
 *  components, and it keeps each slice small enough to read. The change handler
 *  receives only that section's fields, so the editor merges rather than
 *  replacing the whole config.
 *
 *  Note there is no `expandable` anywhere in v2's schemas. The tab already did
 *  the hiding, and nesting a collapsible inside a tab inside a dialog is the
 *  depth that made v1's header config unfindable. That also sidesteps the
 *  `flatten: true` footgun entirely — with no expandable, there is no nesting
 *  for ha-form to scope values under. */
export function renderFormSection(opts: FormSectionOptions): TemplateResult {
  return renderSection(
    opts,
    html`<ha-form
      .hass=${opts.hass}
      .data=${opts.data}
      .schema=${opts.schema}
      .computeLabel=${opts.computeLabel}
      .computeHelper=${opts.computeHelper}
      @value-changed=${(ev: CustomEvent<{ value: Record<string, unknown> }>) => {
        // Stop the event here: a section form's change is not the editor's
        // config-changed. The editor re-dispatches after merging.
        ev.stopPropagation();
        opts.onChange(ev.detail.value);
      }}
    ></ha-form>`,
  );
}
