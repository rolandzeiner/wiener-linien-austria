// Top-level helpers shared by both bundled cards (modern + retro).
// Extracted so security-critical primitives like the URL-trust gate
// have one canonical implementation rather than two near-copies.
//
// Kept narrow on purpose: card-specific helpers (line-colour resolution,
// localisation, departure filtering) stay in src/utils/* — this module
// is reserved for primitives a future third card would also need.

import { html, type TemplateResult } from "lit";

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
export function deText(
  raw: string | undefined | null,
  fallback?: string,
): TemplateResult | string {
  if (raw) return html`<span lang="de">${raw}</span>`;
  return fallback ?? "";
}

/**
 * Dispatch a CustomEvent that crosses Shadow DOM. `bubbles: true` +
 * `composed: true` are required so dashboard / card-editor listeners
 * outside the card's shadow root receive it.
 */
export function fireEvent<T>(node: HTMLElement, type: string, detail: T): void {
  node.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true }),
  );
}
