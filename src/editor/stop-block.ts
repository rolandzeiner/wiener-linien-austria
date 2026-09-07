// The per-stop block — the single most duplicated thing in the v1 editors.
//
// v1 shipped three near-copies of "line chips + direction + walk times":
// modern's `_renderStopFilter` (coloured chips with MoT icons, terminus-
// labelled direction buttons, per-line overrides), flap's `_renderStopSection`
// (plain buttons referencing CSS classes that were never defined, so they
// rendered unstyled) and retro's `_renderWalkTimeSection` (walk times only,
// direction picked from an ha-form dropdown instead). Same job, three
// affordances, one of them broken.
//
// This module owns the whole thing: derivation from live sensor attributes AND
// render. The editors supply a view of the saved stop plus mutation callbacks;
// they no longer decide what a direction button looks like.
//
// Retro is the constrained case: one line, one direction. It passes
// `singleLine: true`, which turns the chip row into radio behaviour (picking a
// chip replaces the selection rather than adding to it) and suppresses the
// per-line override group, which is meaningless with one line.

import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";
import { styleMap } from "lit/directives/style-map.js";

import type { HomeAssistant, WienerLinienAttrs } from "../types.js";
import { colorForLine } from "../utils/config.js";
import {
  formatDirectionPillLabel,
  lineDirKey,
  linesAtStop,
  pairsAtStop,
  tripletsAtStop,
  type Triplet,
} from "../utils/departures.js";
import { lineTypeIcon } from "../utils/mot.js";
import { coerceWalkTime, swallowEditorKeys } from "../editor-shared.js";

/** The saved shape every card's per-stop config structurally satisfies.
 *  Retro adapts its flat `{entity, line, direction, walk_times}` into this at
 *  the call site. */
export interface StopView {
  entity: string;
  // `?: T | undefined` is the dual form used across this codebase: it lets a
  // caller either omit the key or assign an explicit `undefined` (retro passes
  // `cfg.walk_times` straight through, which is `WalkTimes | undefined`). The
  // bare `?:` form alone is rejected under `exactOptionalPropertyTypes`.
  lines?: string[] | undefined;
  direction?: "H" | "R" | undefined;
  line_directions?: Record<string, "H" | "R"> | undefined;
  walk_times?: Record<string, number> | undefined;
}

export interface StopBlockCallbacks {
  toggleLine(entity: string, line: string): void;
  /** Both direction levels write through here, as one atomic change.
   *
   *  They cannot be two independent setters. `line_directions` has no "both"
   *  value — absence means "inherit the stop-wide direction" — so with
   *  `stop.direction` set, clearing a line's override does not give that line
   *  both directions, it silently re-inherits. The block therefore computes
   *  the whole desired state (materialising inherited values and clearing the
   *  stop-wide key when the per-line level takes over) and the editor just
   *  writes it. */
  setDirections(
    entity: string,
    next: { direction: "H" | "R" | null; lineDirections: Record<string, "H" | "R"> },
  ): void;
  setWalkTime(entity: string, key: string, minutes: number | null): void;
  /** Omitted on single-stop cards (retro), where removing the only stop would
   *  leave an unrenderable card. */
  remove?(entity: string): void;
}

export interface StopBlockOptions {
  /** 1-based position, shown in the index pill. */
  index: number;
  /** Total stops — the index pill is suppressed when there is only one, since
   *  numbering a list of one is noise. */
  total: number;
  /** Retro: chips are radio, no per-line overrides. */
  singleLine?: boolean;
  /** Per-line colour overrides from the card config. */
  lineColorOverrides: Record<string, string>;
  /** Card-namespaced translator (`dir_h`, `dir_both`, `entity_missing`, …). */
  t(key: string): string;
  /** Editor-namespaced translator (`lines_label`, `walk_time_hint`, …). */
  et(key: string): string;
}

const WALK_MIN = 1;
const WALK_MAX = 120;

function attrsOf(
  hass: HomeAssistant | undefined,
  entity: string,
): WienerLinienAttrs | undefined {
  return hass?.states?.[entity]?.attributes as WienerLinienAttrs | undefined;
}

/** Termini reachable in `dir`, optionally narrowed to one line. Feeds the
 *  direction-button labels, which name real destinations rather than the
 *  abstract H/R the API uses — the one v1 affordance worth keeping verbatim. */
function terminiFor(
  triplets: ReadonlyArray<Triplet>,
  dir: "H" | "R",
  line?: string,
): string[] {
  const out = new Set<string>();
  for (const t of triplets) {
    if (t.direction !== dir) continue;
    if (line && t.line !== line) continue;
    if (t.towards) out.add(t.towards);
  }
  return [...out].sort();
}

function directionsAvailable(
  triplets: ReadonlyArray<Triplet>,
  line?: string,
): Set<"H" | "R"> {
  const out = new Set<"H" | "R">();
  for (const t of triplets) {
    if (line && t.line !== line) continue;
    if (t.direction === "H" || t.direction === "R") out.add(t.direction);
  }
  return out;
}

/** Per-line rows replace the stop-wide control once two or more lines are in
 *  play. Below that the stop-wide control is the only direction picker there
 *  is — which is the whole of retro's model, so it can never be dropped
 *  outright. */
function showPerLineDirections(
  opts: StopBlockOptions,
  ctx: { lines: string[]; picked: Set<string> },
): boolean {
  if (opts.singleLine) return false;
  return effectiveLines(ctx.lines, ctx.picked).length >= 2;
}

/** An empty selection means "all lines", so effective lines are the picked
 *  ones when there are any and every line at the stop otherwise. */
function effectiveLines(lines: string[], picked: Set<string>): string[] {
  return picked.size > 0 ? lines.filter((l) => picked.has(l)) : lines;
}

export function renderStopBlock(
  hass: HomeAssistant | undefined,
  stop: StopView,
  opts: StopBlockOptions,
  cb: StopBlockCallbacks,
): TemplateResult {
  const attrs = attrsOf(hass, stop.entity);
  const missing = !attrs;
  const stopName = attrs?.stop_name || stop.entity;
  const lineColors = attrs?.line_colors ?? {};
  const colorOf = (line: string): string =>
    colorForLine(line, opts.lineColorOverrides, lineColors, "#5b6470");

  const lines = linesAtStop(attrs);
  const picked = new Set(stop.lines ?? []);
  const triplets = tripletsAtStop(attrs);

  // Per-line vehicle type so each chip carries its mode icon. First-seen wins:
  // Wiener Linien lines have a stable single mode.
  const typeByLine = new Map<string, string>();
  for (const d of attrs?.departures ?? []) {
    if (d.line && d.type && !typeByLine.has(d.line)) typeByLine.set(d.line, d.type);
  }

  const dirStrings = (dir: "H" | "R"): { full: string; short: string } => ({
    full: opts.t(dir === "H" ? "dir_h" : "dir_r"),
    short: opts.t(dir === "H" ? "dir_h_short" : "dir_r_short"),
  });

  return html`
    <section class="wl-section">
      <header class="wl-section-header">
        ${opts.total > 1
          ? html`<span class="wl-index" aria-hidden="true">${opts.index}</span>`
          : nothing}
        <span class="wl-section-title">${stopName}</span>
      </header>
      <div class="wl-stop-body">
        ${missing ? renderMissing(stop, opts, cb) : nothing}
        ${renderLines(stop, opts, cb, { lines, picked, colorOf, typeByLine })}
        ${!missing && lines.length
          ? // Exactly one direction control is shown at a time. Two levels at
            // once read as contradicting each other (the stop-wide row says R
            // while a line row says H), and the stop-wide label degrades into
            // soup at a hub because it pools termini across every line.
            showPerLineDirections(opts, { lines, picked })
            ? renderOverrides(stop, opts, cb, { triplets, picked, lines, colorOf, dirStrings })
            : renderDirection(stop, opts, cb, { triplets, picked, lines, dirStrings })
          : nothing}
        ${!missing ? renderWalkTimes(stop, opts, cb, { attrs, picked, colorOf }) : nothing}
      </div>
    </section>
  `;
}

function renderMissing(
  stop: StopView,
  opts: StopBlockOptions,
  cb: StopBlockCallbacks,
): TemplateResult {
  // A stop whose entity vanished keeps its saved config — the user may be
  // mid-rename. Say so explicitly rather than rendering an empty block:
  // ha-form's entity selector flags the row visually but emits no readable
  // error (WCAG 3.3.1).
  return html`
    <ha-alert alert-type="error">
      ${opts.t("entity_missing").replace("{entity}", stop.entity)}
      ${cb.remove
        ? html`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${() => cb.remove?.(stop.entity)}
          >
            ${opts.et("remove_stop")}
          </button>`
        : nothing}
    </ha-alert>
  `;
}

function renderLines(
  stop: StopView,
  opts: StopBlockOptions,
  cb: StopBlockCallbacks,
  ctx: {
    lines: string[];
    picked: Set<string>;
    colorOf: (l: string) => string;
    typeByLine: Map<string, string>;
  },
): TemplateResult {
  const { lines, picked, colorOf, typeByLine } = ctx;
  const hint = picked.size
    ? opts.et("lines_selected").replace("{n}", String(picked.size)).replace("{total}", String(lines.length))
    : opts.et("lines_empty_means_all");

  return html`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${opts.et("lines_label")}</span>
        ${lines.length ? html`<span class="wl-note">${hint}</span>` : nothing}
      </div>
      ${lines.length
        ? html`<div class="wl-chips">
            ${lines.map((line) => {
              // Empty selection means "all lines" on multi-line cards, so every
              // chip reads as active. Retro always has exactly one line
              // selected, so an empty set there means nothing is chosen yet.
              const on = opts.singleLine
                ? picked.has(line)
                : picked.size === 0 || picked.has(line);
              const icon = lineTypeIcon(typeByLine.get(line));
              return html`<button
                type="button"
                class="wl-chip"
                style=${styleMap({ "--wl-chip-color": colorOf(line) })}
                aria-pressed=${on ? "true" : "false"}
                aria-label=${opts
                  .et(on ? "line_active_aria" : "line_inactive_aria")
                  .replace("{line}", line)}
                @click=${() => cb.toggleLine(stop.entity, line)}
              >
                ${icon
                  ? html`<span class="wl-chip-mode"
                      ><ha-icon icon=${icon} aria-hidden="true"></ha-icon
                    ></span>`
                  : nothing}
                ${line}
              </button>`;
            })}
          </div>`
        : html`<div class="wl-empty">
            <span class="wl-empty-title">${opts.et("no_lines_title")}</span>
            <span class="wl-note">${opts.et("no_lines_hint")}</span>
          </div>`}
    </div>
  `;
}

function renderDirection(
  stop: StopView,
  opts: StopBlockOptions,
  cb: StopBlockCallbacks,
  ctx: {
    triplets: ReadonlyArray<Triplet>;
    picked: Set<string>;
    lines: string[];
    dirStrings: (d: "H" | "R") => { full: string; short: string };
  },
): TemplateResult {
  const { triplets, picked, lines, dirStrings } = ctx;
  const effective = effectiveLines(lines, picked);
  // This control only renders with at most one line in play, so scope the
  // terminus labels to that line. Pooling termini across every line at the
  // stop is what produced labels like
  // "H: Enkplatz U, Grillgasse / Floridsdorf / Michelbeuern - AKH +1".
  const scope = effective.length === 1 ? effective[0] : undefined;
  const dir = stop.direction ?? null;
  const avail = directionsAvailable(triplets, scope);
  const hasH = avail.has("H");
  const hasR = avail.has("R");
  const onlyOne = avail.size === 1;

  // With one direction served, that is what the card shows whether or not the
  // config says so — reflect it rather than leaving all three buttons unset.
  const activeH = dir === "H" || (dir === null && onlyOne && hasH);
  const activeR = dir === "R" || (dir === null && onlyOne && hasR);
  const activeBoth = dir === null && !onlyOne;

  // Changing the stop-wide value drops any override on the lines it governs,
  // so the control the user is looking at is the one that actually applies.
  const commit = (next: "H" | "R" | null): void => {
    const kept: Record<string, "H" | "R"> = {};
    for (const [line, value] of Object.entries(stop.line_directions ?? {})) {
      if (!effective.includes(line)) kept[line] = value;
    }
    cb.setDirections(stop.entity, { direction: next, lineDirections: kept });
  };

  const label = (d: "H" | "R"): string =>
    avail.size === 0 || avail.has(d)
      ? formatDirectionPillLabel(terminiFor(triplets, d, scope), dirStrings(d))
      : `${dirStrings(d).short}: ${opts.et("direction_not_served")}`;

  const note = !hasR && effective.length
    ? opts.et("direction_note_one_way").replace("{line}", effective[0] ?? "")
    : "";

  return html`
    <div class="wl-group">
      <span class="wl-label">${opts.et("direction_label")}</span>
      <div class="wl-dirs">
        ${dirButton({
          label: label("H"),
          active: activeH,
          disabled: !hasH,
          title: hasH ? opts.t("dir_h") : opts.et("direction_unavailable"),
          onClick: () => commit("H"),
        })}
        ${dirButton({
          label: label("R"),
          active: activeR,
          disabled: !hasR,
          title: hasR ? opts.t("dir_r") : opts.et("direction_unavailable"),
          onClick: () => commit("R"),
        })}
        ${opts.singleLine
          ? nothing
          : dirButton({
              label: opts.t("dir_both"),
              active: activeBoth,
              disabled: onlyOne,
              title: onlyOne ? opts.et("direction_unavailable") : opts.t("dir_both"),
              onClick: () => commit(null),
            })}
      </div>
      ${note ? html`<span class="wl-note">${note}</span>` : nothing}
    </div>
  `;
}

interface DirButtonSpec {
  label: string;
  active: boolean;
  disabled: boolean;
  title: string;
  ariaLabel?: string;
  icon?: string;
  compact?: boolean;
  onClick: () => void;
}

function dirButton(spec: DirButtonSpec): TemplateResult {
  // aria-disabled rather than the `disabled` attribute: a disabled button drops
  // out of the tab order, so a keyboard user sweeping the group never learns
  // the option exists or why it is unavailable. This keeps it focusable and
  // announced, and the click handler no-ops.
  return html`<button
    type="button"
    class=${classMap({ "wl-dir": true, "wl-dir--compact": !!spec.compact })}
    aria-pressed=${spec.active ? "true" : "false"}
    aria-disabled=${spec.disabled ? "true" : "false"}
    aria-label=${spec.ariaLabel ?? spec.label}
    title=${spec.title}
    @click=${(ev: Event) => {
      if (spec.disabled) {
        ev.preventDefault();
        return;
      }
      spec.onClick();
    }}
  >
    ${spec.icon
      ? html`<ha-icon icon=${spec.icon} aria-hidden="true"></ha-icon>`
      : spec.label}
  </button>`;
}

function renderOverrides(
  stop: StopView,
  opts: StopBlockOptions,
  cb: StopBlockCallbacks,
  ctx: {
    triplets: ReadonlyArray<Triplet>;
    picked: Set<string>;
    lines: string[];
    colorOf: (l: string) => string;
    dirStrings: (d: "H" | "R") => { full: string; short: string };
  },
): TemplateResult {
  const { triplets, picked, lines, colorOf, dirStrings } = ctx;
  const effective = effectiveLines(lines, picked);
  const lineDirs = stop.line_directions ?? {};
  const stopDir = stop.direction ?? null;

  /** What a line actually resolves to right now. A line with no override
   *  inherits the stop-wide value, and showing that inherited value is the
   *  point: v1 displayed "both" for every un-overridden line, so the per-line
   *  rows appeared to contradict the stop-wide row above them. */
  const effectiveDir = (line: string): "H" | "R" | null => lineDirs[line] ?? stopDir;

  /** Write the whole picture at once: materialise every line's currently
   *  effective direction, apply the user's change, and clear the stop-wide key.
   *  Clearing it is what makes the "both" button mean both — while
   *  `stop.direction` is set, an absent override re-inherits instead. */
  const commit = (line: string, next: "H" | "R" | null): void => {
    const lineDirections: Record<string, "H" | "R"> = {};
    for (const l of effective) {
      const value = l === line ? next : effectiveDir(l);
      if (value) lineDirections[l] = value;
    }
    // Overrides for lines outside the current selection are none of this
    // control's business — carry them through untouched.
    for (const [l, value] of Object.entries(lineDirs)) {
      if (!effective.includes(l)) lineDirections[l] = value;
    }
    cb.setDirections(stop.entity, { direction: null, lineDirections });
  };

  return html`
    <div class="wl-group">
      <span class="wl-label">${opts.et("direction_label")}</span>
      ${effective.map((line) => {
        const avail = directionsAvailable(triplets, line);
        const cur = effectiveDir(line);
        const hasH = avail.has("H");
        const hasR = avail.has("R");
        const onlyOne = avail.size === 1;
        const aria = (d: "H" | "R" | null): string =>
          opts
            .et("per_line_direction_aria")
            .replace("{line}", line)
            .replace(
              "{direction}",
              d === null
                ? opts.t("dir_both")
                : formatDirectionPillLabel(terminiFor(triplets, d, line), dirStrings(d)),
            );
        return html`
          <div class="wl-override-row">
            <span class="wl-badge" style=${styleMap({ background: colorOf(line) })}
              >${line}</span
            >
            <div class="wl-dirs">
              ${dirButton({
                label: dirStrings("H").short,
                active: cur === "H" || (cur === null && onlyOne && hasH),
                disabled: !hasH,
                compact: true,
                title: terminiFor(triplets, "H", line).join(" / ") || opts.t("dir_h"),
                ariaLabel: aria("H"),
                onClick: () => commit(line, "H"),
              })}
              ${dirButton({
                label: dirStrings("R").short,
                active: cur === "R" || (cur === null && onlyOne && hasR),
                disabled: !hasR,
                compact: true,
                title: terminiFor(triplets, "R", line).join(" / ") || opts.t("dir_r"),
                ariaLabel: aria("R"),
                onClick: () => commit(line, "R"),
              })}
              ${dirButton({
                label: "",
                icon: "mdi:swap-horizontal",
                active: cur === null && !onlyOne,
                disabled: onlyOne,
                compact: true,
                title: opts.t("dir_both"),
                ariaLabel: aria(null),
                onClick: () => commit(line, null),
              })}
            </div>
          </div>
        `;
      })}
    </div>
  `;
}

function renderWalkTimes(
  stop: StopView,
  opts: StopBlockOptions,
  cb: StopBlockCallbacks,
  ctx: {
    attrs: WienerLinienAttrs | undefined;
    picked: Set<string>;
    colorOf: (l: string) => string;
  },
): TemplateResult | typeof nothing {
  const { attrs, picked, colorOf } = ctx;
  const lineDirs = stop.line_directions ?? {};
  const stopDir = stop.direction ?? null;

  // One row per (line, direction) pair, never per (line, direction, terminus):
  // `towards` flips poll-to-poll on branching termini, so a triple-keyed
  // threshold would silently miss every vehicle labelled with the other
  // terminus. See lineDirKey.
  const pairs = pairsAtStop(attrs).filter((p) => {
    if (picked.size > 0 && !picked.has(p.line)) return false;
    const eff = lineDirs[p.line] ?? stopDir;
    return !eff || p.direction === eff;
  });
  if (!pairs.length) return nothing;

  return html`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${opts.et("section_walk_time")}</span>
        <span class="wl-note">${opts.et("walk_time_unit")}</span>
      </div>
      <span class="wl-note">${opts.et("walk_time_hint")}</span>
      <div class="wl-walk-list">
        ${pairs.map((p) => {
          const key = lineDirKey(p.line, p.direction);
          const val = stop.walk_times?.[key];
          const terminus = p.termini.join(" / ");
          const aria = opts
            .et("walk_time_aria")
            .replace("{line}", p.line)
            .replace("{towards}", terminus);
          const bump = (delta: number): void => {
            const next = (val ?? 0) + delta;
            cb.setWalkTime(
              stop.entity,
              key,
              next < WALK_MIN ? null : Math.min(WALK_MAX, next),
            );
          };
          return html`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${styleMap({ background: colorOf(p.line) })}
                >${p.line}</span
              >
              <span
                class="wl-walk-dest"
                title=${p.termini.length > 1
                  ? opts.et("walk_time_branching_hint")
                  : terminus}
                >→ ${terminus}</span
              >
              <span class="wl-stepper">
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${val === undefined}
                  aria-label=${opts.et("walk_time_less_aria").replace("{line}", p.line)}
                  @click=${() => bump(-1)}
                >
                  <ha-icon icon="mdi:minus" aria-hidden="true"></ha-icon>
                </button>
                <input
                  type="number"
                  class="wl-step-value"
                  min=${WALK_MIN}
                  max=${WALK_MAX}
                  step="1"
                  inputmode="numeric"
                  placeholder=${opts.et("walk_time_placeholder")}
                  aria-label=${aria}
                  .value=${live(val !== undefined ? String(val) : "")}
                  @keydown=${swallowEditorKeys}
                  @keyup=${swallowEditorKeys}
                  @keypress=${swallowEditorKeys}
                  @change=${(ev: Event) =>
                    cb.setWalkTime(
                      stop.entity,
                      key,
                      coerceWalkTime((ev.target as HTMLInputElement).value, `${stop.entity}/${key}`),
                    )}
                />
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${(val ?? 0) >= WALK_MAX}
                  aria-label=${opts.et("walk_time_more_aria").replace("{line}", p.line)}
                  @click=${() => bump(1)}
                >
                  <ha-icon icon="mdi:plus" aria-hidden="true"></ha-icon>
                </button>
              </span>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
