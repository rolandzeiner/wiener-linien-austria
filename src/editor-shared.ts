// Editor helpers shared by the three card editors.
//
// v1's label / helper resolution chain lived here too. v2 resolves labels
// through `editor/editor-i18n.ts` (card namespace, then `common.editor`, then
// the raw key), so only the two input-behaviour helpers remain.

/** HA's card-editor dialog steals arrow keys (and others) for its own
 *  navigation. Number/text inputs in the bespoke editor sections must
 *  stop propagation so the user can actually edit values. Shared so the
 *  modern and retro editors bind one identical handler. */
export function swallowEditorKeys(ev: KeyboardEvent): void {
  ev.stopPropagation();
}

/** Coerce a raw walk-time input into a clamped minutes value, or null to
 *  clear. Shared by all three card editors so the parse / clamp / warn
 *  rules can't drift. Empty input clears silently; non-numeric input
 *  ("5min") warns — so a typo doesn't vanish without a signal — then
 *  clears. Valid values round and clamp to 1..120 minutes. `context`
 *  identifies the field in the warning (e.g. `"sensor.x/U1|H"`). */
export function coerceWalkTime(raw: string, context: string): number | null {
  const trimmed = raw.trim();
  const n = trimmed === "" ? NaN : Number(trimmed);
  if (trimmed !== "" && !Number.isFinite(n)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[wiener-linien-austria] walk-time "${raw}" for ${context} is not a number — clearing`,
    );
  }
  return Number.isFinite(n) && n > 0 ? Math.min(120, Math.round(n)) : null;
}
