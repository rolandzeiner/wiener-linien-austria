// Top-level helpers shared across the cards, their editors and src/utils/*.
// Extracted so security-critical primitives like the URL-trust gate
// have one canonical implementation rather than several near-copies.
//
// Kept narrow on purpose: card-specific helpers stay in src/utils/*.

import { html, type PropertyValues, type TemplateResult } from "lit";

import type { HomeAssistant } from "./types.js";

/**
 * Trust-boundary guard for upstream-supplied URIs that get rendered into
 * `<a href>` attributes. Lit's `${}` interpolation is safe against
 * tag/attribute injection but does NOT block `javascript:` or `data:`
 * URIs — a compromised upstream feed could otherwise execute arbitrary
 * JS in HA's frontend origin when the user clicks the link. Allowlist
 * HTTP/HTTPS only; everything else collapses to an empty string and the
 * call site treats it as "no link available".
 *
 * Defence in depth: apply at every URL boundary even when the URL is
 * built from hardcoded `https://` literals — the next contributor adding
 * a different upstream URL field shouldn't have to remember the trust
 * boundary.
 */
export function safeHttpsUri(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return /^https?:\/\//i.test(raw) ? raw : "";
}

/**
 * Wrap API-sourced German strings (station names, destinations,
 * disturbance text) in a `<span lang="de">` so screen readers pick the
 * German voice even when the dashboard locale is non-German. ASCII
 * fallbacks (entity ids, etc.) are returned unwrapped — the lang hint
 * would be inaccurate and AT handles ASCII fine.
 */
export function deText(raw: string | undefined | null, fallback?: string): TemplateResult | string {
  if (raw) return html`<span lang="de">${raw}</span>`;
  return fallback ?? "";
}

/**
 * Dispatch a CustomEvent that crosses Shadow DOM. `bubbles: true` +
 * `composed: true` are required so dashboard / card-editor listeners
 * outside the card's shadow root receive it.
 */
export function fireEvent(node: HTMLElement, type: string, detail: unknown): void {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

/**
 * Whether a sections-view cell gives the card a fixed height: the user set a
 * row count (a stored `grid_options.rows`), or nothing is stored and the
 * card's own default is a number. Outside a sections cell (masonry, a stack,
 * the add-card picker) the card takes its natural height.
 */
export function isFixedHeight(
  layout: string | undefined,
  config: object | undefined,
  defaultRows: unknown,
): boolean {
  if (layout !== "grid") return false;
  const grid = config && "grid_options" in config ? config.grid_options : undefined;
  const stored = grid && typeof grid === "object" && "rows" in grid ? grid.rows : undefined;
  return typeof (stored ?? defaultRows) === "number";
}

/**
 * The cards' shouldUpdate past the config guard. `hass` is reassigned on
 * every state change anywhere in HA, so a change to it alone renders only
 * when the language switched or one of `entityIds()` changed; HA state
 * objects are immutable, so identity is enough. Any other change renders:
 * the card's own state, its config, and `layout`, which Lit reflects inside
 * update(), so a false in that cycle would leave the attribute stale.
 * `entityIds` runs only for a lone hass change.
 */
export function cardShouldUpdate(
  changed: PropertyValues,
  hass: HomeAssistant | undefined,
  entityIds: () => readonly string[],
): boolean {
  if (!changed.has("hass") || changed.size > 1) return true;
  const prev = changed.get("hass") as HomeAssistant | undefined;
  if (!prev || !hass) return true;
  // A language switch changes no entity state; without this the card keeps
  // the old language until its sensor next updates.
  if (prev.language !== hass.language) return true;
  return entityIds().some((eid) => prev.states[eid] !== hass.states[eid]);
}

/**
 * A sorted copy of `items`; the input is never touched. Stands in for
 * `Array#toSorted()`, which is ES2023 and missing on the older tablets HA
 * still serves its legacy frontend build to.
 */
export function sorted<T>(items: Iterable<T>, compare?: (a: T, b: T) => number): T[] {
  const out = [...items];
  out.sort(compare);
  return out;
}
