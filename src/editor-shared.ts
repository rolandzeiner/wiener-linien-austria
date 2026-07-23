// Shared label / helper resolvers for the Lovelace card editors.
//
// Both the modern and retro editors run the same translation chain to
// resolve `<ha-form>` field labels and helper texts:
//   1. HA core's own `ui.panel.lovelace.editor.card.generic.<name>` keys
//      (so generic field names like "entity" pick up HA's translation).
//   2. The card's editor-namespaced bundle (`modern.editor.<name>` /
//      `retro.editor.<name>`).
//   3. (Label only, retro only) the card's main bundle as a final
//      fallback (`retro.<name>`).
//   4. Last resort: the raw field name (still functional; dev sees the gap).
//
// Keeping the chain in one place means a future change to step ordering
// can't drift between the two editors.

import type { HomeAssistant } from "./types.js";

interface ResolveLabelOpts {
  hass: HomeAssistant | undefined;
  /** Lookup against the editor-namespaced bundle. */
  et: (key: string) => string;
  /** Namespace prefix used by `et` (e.g. `"modern.editor"`). */
  editorNamespace: string;
  /** Optional second-level fallback against the card's main bundle —
   *  only used by the retro editor today. */
  cardLookup?: (key: string) => string;
  cardNamespace?: string;
}

export function resolveEditorLabel(
  field: { name: string },
  opts: ResolveLabelOpts,
): string {
  const haKey = `ui.panel.lovelace.editor.card.generic.${field.name}`;
  const ha = opts.hass?.localize?.(haKey);
  if (ha) return ha;
  const editorTrans = opts.et(field.name);
  if (
    editorTrans !== `${opts.editorNamespace}.${field.name}` &&
    editorTrans !== field.name
  ) {
    return editorTrans;
  }
  if (opts.cardLookup && opts.cardNamespace) {
    const cardTrans = opts.cardLookup(field.name);
    if (
      cardTrans !== `${opts.cardNamespace}.${field.name}` &&
      cardTrans !== field.name
    ) {
      return cardTrans;
    }
  }
  return field.name;
}

interface ResolveHelperOpts {
  et: (key: string) => string;
  editorNamespace: string;
}

export function resolveEditorHelper(
  field: { name: string },
  opts: ResolveHelperOpts,
): string | undefined {
  const key = `${field.name}_helper`;
  const editorTrans = opts.et(key);
  if (
    editorTrans !== `${opts.editorNamespace}.${key}` &&
    editorTrans !== key
  ) {
    return editorTrans;
  }
  return undefined;
}

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
