// Small DOM/state helpers for the card templates.
//
// The name is historical: this module used to hold the HTML escaper and
// entity table for the `unsafeHTML` disruption path. That path is gone —
// utils/traffic-notice.ts now parses notices into a typed model rendered
// through ordinary Lit bindings, so nothing here escapes or decodes markup
// any more. Worth renaming to utils/dom.ts; only one import site.

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
