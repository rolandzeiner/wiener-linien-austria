function escHtml(s: unknown): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Wiener-Linien upstream traffic-info payloads contain short hand-authored
// HTML — the only permitted tag is <br> for line breaks. Escape everything,
// then re-permit <br>. No <a>, no <b>, no attributes; prevents XSS via
// upstream payload manipulation.
//
// HARD CONTRACT — DO NOT WIDEN THE ALLOWLIST.
//
// The output of this function is rendered into the card via Lit's
// `unsafeHTML` directive (wiener-linien-austria-card.ts). `unsafeHTML` does
// NOT re-sanitise — it trusts the caller. Any tag that survives this
// function's escape pass becomes raw HTML in the user's DOM.
//
// `<br>` is safe: void element, no attributes accepted, no script context.
// Anything else (`<a>`, `<b>`, `<i>`, `<span>`, etc.) opens a route to
// XSS via attribute injection. Pinned by `tests/test_html.py` so a
// future contributor can't quietly add `<b>` without the test suite
// breaking. If you NEED a richer subset, drop a real sanitiser like
// DOMPurify into the bundle first; do not extend the regex chain here.
export function safeTrafficHtml(raw: unknown): string {
  return escHtml(raw).replace(/&lt;br\s*\/?&gt;/gi, "<br>");
}

/** Slugify an entity id (or any string) into a value safe for use in DOM
 *  id / aria-controls attributes. Replaces anything outside [A-Za-z0-9_]
 *  with `_`. Keeps the original casing because aria-controls is
 *  case-sensitive (lower-cased ids would mis-pair with refs). */
export function safeDomId(s: string): string {
  return s.replace(/[^A-Za-z0-9_]/g, "_");
}

/** Idempotent toggle on a reactive Set — returns a NEW Set with `key`
 *  present iff it wasn't before. Lit's change detection needs a fresh
 *  reference for the @state field to re-render, so in-place mutation
 *  via `.add` / `.delete` would silently drop the update. */
export function toggleInSet<T>(set: ReadonlySet<T>, key: T): Set<T> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}
