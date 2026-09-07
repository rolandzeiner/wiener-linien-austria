// Direct-manipulation editor for the station signage strip.
//
// The problem it replaces: the strip has a left and a right side, each with the
// same ten fields, and v1 expressed that as two `flatten: false` expandables
// nested inside a third — roughly twenty form rows, two collapse levels deep,
// to configure a thin black bar with a handful of pictograms on each end.
//
// Here the bar IS the control. Two tappable zones render their configured
// content as live tokens in the order the card draws them; picking a zone swaps
// a single four-field panel beneath. Twenty rows become one bar plus four
// fields, and the user watches the sign assemble as they fill it.
//
// A second thing falls out of moving off ha-form: `ha-icon-picker` works again.
// v1 could not use it — the picker's popover does not round-trip its click
// commit when nested two levels deep inside a `flatten: false` expandable, so
// the editors fell back to a `select` carrying the entire ~7,500-entry MDI
// catalogue as autocomplete options. Outside ha-form we own the event plumbing,
// so the real visual picker goes back in and the catalogue blob goes away.

import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";

import type { RetroHeaderExit, RetroHeaderSide } from "../types.js";
import {
  RETRO_HEADER_MDI_EXIT_KEYS,
  RETRO_HEADER_MDI_EXITS,
} from "../utils/retro-station-icons.js";
import { swallowEditorKeys } from "../editor-shared.js";
import {
  HEADER_MAX_CHIPS,
  HEADER_MAX_CHIP_LEN,
  HEADER_MAX_DATE_FORMAT_LEN,
  HEADER_MAX_ICONS,
  HEADER_MAX_TEXT_LEN,
} from "../utils/config.js";

export type HeaderSideKey = "header_left" | "header_right";

/** Amenity toggles, in the order the card renders them into the chip lane.
 *  Keeping this list in render order is what lets the bar preview double as
 *  documentation of what the sign will look like. */
const AMENITIES = [
  { key: "show_wc", icon: "mdi:human-male-female", labelKey: "show_wc_short" },
  { key: "show_escalator", icon: "mdi:escalator", labelKey: "show_escalator_short" },
  { key: "show_elevator", icon: "mdi:elevator", labelKey: "show_elevator_short" },
  { key: "show_clock", icon: "mdi:clock-outline", labelKey: "show_clock_short" },
  { key: "show_date", icon: "mdi:calendar", labelKey: "show_date_short" },
] as const satisfies ReadonlyArray<{
  key: keyof RetroHeaderSide;
  icon: string;
  labelKey: string;
}>;

/** Exit pictogram choices as a visual grid. The three bespoke signage glyphs
 *  come first (they are what the real Vienna signs use), then the MDI
 *  alternatives, then "none". */
const EXIT_CHOICES: ReadonlyArray<{ value: RetroHeaderExit; icon: string; labelKey: string }> = [
  { value: "regular", icon: "mdi:exit-run", labelKey: "header_exit_regular" },
  { value: "accessible", icon: "mdi:wheelchair-accessibility", labelKey: "header_exit_accessible" },
  ...RETRO_HEADER_MDI_EXIT_KEYS.map((key) => ({
    value: key as RetroHeaderExit,
    icon: key,
    labelKey: RETRO_HEADER_MDI_EXITS[key].labelKey,
  })),
  { value: "none", icon: "mdi:close-circle-outline", labelKey: "header_exit_none" },
];

export interface HeaderStripCallbacks {
  /** Patch one field on one side. The editor merges and normalises. */
  patch(side: HeaderSideKey, field: keyof RetroHeaderSide, value: unknown): void;
  /** Which side the panel is editing. Editor-local UI state, never config. */
  selectSide(side: HeaderSideKey): void;
}

export interface HeaderStripOptions {
  left: RetroHeaderSide | undefined;
  right: RetroHeaderSide | undefined;
  selected: HeaderSideKey;
  et(key: string): string;
}

interface Token {
  label: string;
  icon?: string;
  kind: "icon" | "text" | "chip";
  /** What a screen reader should hear for this token. Icon tokens render no
   *  text, so without this the zone button announced only "left" / "right" and
   *  a non-sighted user could not tell what the sign was configured to show —
   *  on a control whose entire premise is that the bar IS the preview. */
  name: string;
}

/** Build the token list for one side in the exact order the card renders it:
 *  exit pictogram, free text, amenity icons, extra icons, then text chips. */
function tokensFor(
  side: RetroHeaderSide | undefined,
  emptyLabel: string,
  et: (key: string) => string,
): Token[] {
  const out: Token[] = [];
  if (!side) return [{ label: emptyLabel, kind: "text", name: emptyLabel }];

  if (side.exit && side.exit !== "none") {
    const choice = EXIT_CHOICES.find((c) => c.value === side.exit);
    out.push({
      label: "",
      icon: choice?.icon ?? side.exit,
      kind: "icon",
      name: choice ? et(choice.labelKey) : side.exit,
    });
  }
  if (side.text) out.push({ label: side.text, kind: "text", name: side.text });
  for (const a of AMENITIES) {
    if (side[a.key]) {
      out.push({ label: "", icon: a.icon, kind: "icon", name: et(a.labelKey) });
    }
  }
  for (const icon of side.extra_icons ?? []) {
    // A user-picked MDI key has no catalogue entry — the key itself is the
    // most specific name available.
    out.push({ label: "", icon, kind: "icon", name: icon });
  }
  for (const chip of side.chips ?? []) {
    out.push({ label: chip, kind: "chip", name: chip });
  }
  if (!out.length) out.push({ label: emptyLabel, kind: "text", name: emptyLabel });
  return out;
}

export function renderHeaderStrip(
  opts: HeaderStripOptions,
  cb: HeaderStripCallbacks,
): TemplateResult {
  const cfg = opts.selected === "header_left" ? opts.left : opts.right;
  const side = cfg ?? {};
  const empty = opts.et("header_slot_empty");

  const patch = (field: keyof RetroHeaderSide, value: unknown): void =>
    cb.patch(opts.selected, field, value);

  return html`
    <div class="wl-strip">
      <div class="wl-strip-bar" role="group" aria-label=${opts.et("header_bar_aria")}>
        ${renderZone("header_left", opts, cb, empty)}
        ${renderZone("header_right", opts, cb, empty)}
      </div>

      <div class="wl-strip-switch">
        <span class="wl-note wl-label--grow">${opts.et("header_pick_side_hint")}</span>
        <div class="wl-seg" role="group" aria-label=${opts.et("header_side_aria")}>
          ${(["header_left", "header_right"] as const).map(
            (key) => html`<button
              type="button"
              class="wl-seg-btn"
              aria-pressed=${opts.selected === key ? "true" : "false"}
              @click=${() => cb.selectSide(key)}
            >
              ${opts.et(key === "header_left" ? "header_left" : "header_right")}
            </button>`,
          )}
        </div>
      </div>

      <div class="wl-slot">
        <div class="wl-group">
          <span class="wl-label">${opts.et("exit")}</span>
          <div class="wl-pict-grid">
            ${EXIT_CHOICES.map((choice) => {
              const on = (side.exit ?? "none") === choice.value;
              const label = opts.et(choice.labelKey);
              return html`<button
                type="button"
                class="wl-pict"
                aria-pressed=${on ? "true" : "false"}
                aria-label=${label}
                title=${label}
                @click=${() => patch("exit", choice.value)}
              >
                <ha-icon icon=${choice.icon} aria-hidden="true"></ha-icon>
              </button>`;
            })}
          </div>
        </div>

        <div class="wl-group">
          <span class="wl-label">${opts.et("text")}</span>
          <input
            type="text"
            class="wl-text"
            maxlength=${HEADER_MAX_TEXT_LEN}
            .value=${side.text ?? ""}
            aria-label=${opts.et("text")}
            placeholder=${opts.et("text_placeholder")}
            @keydown=${swallowEditorKeys}
            @keyup=${swallowEditorKeys}
            @keypress=${swallowEditorKeys}
            @change=${(ev: Event) =>
              patch("text", (ev.target as HTMLInputElement).value.trim() || undefined)}
          />
        </div>

        <div class="wl-group">
          <span class="wl-label">${opts.et("header_amenities")}</span>
          <div class="wl-tray">
            ${AMENITIES.map((a) => {
              const on = Boolean(side[a.key]);
              const label = opts.et(a.labelKey);
              return html`<button
                type="button"
                class="wl-tray-btn"
                aria-pressed=${on ? "true" : "false"}
                aria-label=${label}
                @click=${() => patch(a.key, !on)}
              >
                <ha-icon icon=${a.icon} aria-hidden="true"></ha-icon>
                ${label}
              </button>`;
            })}
          </div>
          ${side.show_date
            ? html`<input
                type="text"
                class="wl-text"
                maxlength=${HEADER_MAX_DATE_FORMAT_LEN}
                .value=${side.date_format ?? ""}
                aria-label=${opts.et("date_format")}
                placeholder=${opts.et("date_format_placeholder")}
                @keydown=${swallowEditorKeys}
                @keyup=${swallowEditorKeys}
                @keypress=${swallowEditorKeys}
                @change=${(ev: Event) =>
                  patch(
                    "date_format",
                    (ev.target as HTMLInputElement).value.trim() || undefined,
                  )}
              />`
            : nothing}
        </div>

        ${renderChipsAndIcons(side, opts, patch)}
      </div>
    </div>
  `;
}

function renderZone(
  key: HeaderSideKey,
  opts: HeaderStripOptions,
  cb: HeaderStripCallbacks,
  empty: string,
): TemplateResult {
  const cfg = key === "header_left" ? opts.left : opts.right;
  const selected = opts.selected === key;
  const tokens = tokensFor(cfg, empty, opts.et);
  const sideName = opts.et(key === "header_left" ? "header_left" : "header_right");
  return html`<button
    type="button"
    class=${classMap({
      "wl-zone": true,
      "wl-zone--selected": selected,
      "wl-zone--right": key === "header_right",
    })}
    aria-pressed=${selected ? "true" : "false"}
    aria-label=${`${sideName}: ${tokens.map((t) => t.name).join(", ")}`}
    @click=${() => cb.selectSide(key)}
  >
    <span class="wl-zone-tokens">
      ${tokens.map(
        (t) => html`<span
          class=${classMap({ "wl-token": true, "wl-token--chip": t.kind === "chip" })}
          >${t.icon
            ? html`<ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>`
            : t.label}</span
        >`,
      )}
    </span>
  </button>`;
}

function renderChipsAndIcons(
  side: RetroHeaderSide,
  opts: HeaderStripOptions,
  patch: (field: keyof RetroHeaderSide, value: unknown) => void,
): TemplateResult {
  const chips = side.chips ?? [];
  const icons = side.extra_icons ?? [];

  return html`
    <div class="wl-group">
      <span class="wl-label"
        >${opts
          .et("header_chips_and_icons")
          .replace("{chips}", String(HEADER_MAX_CHIPS))
          .replace("{icons}", String(HEADER_MAX_ICONS))}</span
      >
      <div class="wl-tray">
        ${icons.map(
          (icon, i) => html`<span class="wl-pill">
            <ha-icon icon=${icon} aria-hidden="true"></ha-icon>
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${opts.et("remove_icon_aria").replace("{icon}", icon)}
              @click=${() => patch("extra_icons", removeAt(icons, i))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`,
        )}
        ${chips.map(
          (chip, i) => html`<span class="wl-pill">
            ${chip}
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${opts.et("remove_chip_aria").replace("{chip}", chip)}
              @click=${() => patch("chips", removeAt(chips, i))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`,
        )}
      </div>

      ${icons.length < HEADER_MAX_ICONS
        ? // live() is load-bearing here. A plain .value="" binding makes Lit
          // compare the previous bound value ("") against the new one ("") and
          // skip the update — so after the first pick the element keeps showing
          // the icon it chose and no further pick registers. live() compares
          // against the element's actual DOM value instead, so it is cleared on
          // every render and ready for the next pick.
          html`<ha-icon-picker
            .value=${live("")}
            .label=${opts.et("add_icon")}
            @value-changed=${(ev: CustomEvent<{ value?: string }>) => {
              const v = ev.detail?.value;
              // The picker re-fires with an empty value when it clears itself
              // after a commit; ignore that echo or we would append "".
              if (!v) return;
              patch("extra_icons", [...icons, v].slice(0, HEADER_MAX_ICONS));
            }}
          ></ha-icon-picker>`
        : nothing}
      ${chips.length < HEADER_MAX_CHIPS
        ? html`<input
            type="text"
            class="wl-text"
            maxlength=${HEADER_MAX_CHIP_LEN}
            aria-label=${opts.et("add_chip")}
            placeholder=${opts.et("add_chip")}
            @keydown=${(ev: KeyboardEvent) => {
              swallowEditorKeys(ev);
              if (ev.key !== "Enter") return;
              const el = ev.target as HTMLInputElement;
              const v = el.value.trim();
              if (!v) return;
              patch("chips", [...chips, v].slice(0, HEADER_MAX_CHIPS));
              el.value = "";
            }}
            @keyup=${swallowEditorKeys}
            @keypress=${swallowEditorKeys}
          />`
        : nothing}
    </div>
  `;
}

function removeAt<T>(list: ReadonlyArray<T>, index: number): T[] | undefined {
  const next = list.filter((_, i) => i !== index);
  // Tidy state on empty — drop the key rather than persist `[]`, so saved YAML
  // stays free of orphan empty arrays.
  return next.length ? next : undefined;
}
