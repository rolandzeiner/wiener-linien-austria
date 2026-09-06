// Translator pair for the v2 editors.
//
// The shared components (tab shell, stop block, header strip) need roughly
// thirty strings that are identical across the three cards. v1 had no shared
// namespace, so every string lived under `modern.editor.*`, `retro.editor.*`
// and `flap.editor.*` — which is how "Fußweg (min)" / "Fußweg zur Haltestelle"
// / "Fußweg" ended up as three labels for one field.
//
// `et()` therefore resolves card-scoped first, then falls back to
// `common.editor.*`. A card that genuinely needs its own wording for a shared
// field just declares the key in its own namespace and wins; everything else
// stays defined once.

import { translate, type TranslateContext } from "../localize/localize.js";

export interface EditorTranslators {
  /** Card-namespaced lookup (`retro.dir_h`). For strings the card itself
   *  renders too, so the editor cannot drift from the card's own wording. */
  t(key: string): string;
  /** Editor lookup: `<card>.editor.<key>`, falling back to
   *  `common.editor.<key>`, then to the raw key so a missing string is visible
   *  in the UI rather than silently blank. */
  et(key: string): string;
}

export function editorTranslators(
  cardNamespace: "modern" | "retro" | "flap",
  language: string | undefined,
): EditorTranslators {
  const ctx: TranslateContext = { hassLanguage: language };
  return {
    t: (key) => translate(`${cardNamespace}.${key}`, ctx),
    et: (key) => {
      const scopedKey = `${cardNamespace}.editor.${key}`;
      const scoped = translate(scopedKey, ctx);
      // `translate` echoes the key back when it resolves nothing, which is the
      // only signal available that the card had no override.
      if (scoped !== scopedKey) return scoped;
      const commonKey = `common.editor.${key}`;
      const common = translate(commonKey, ctx);
      return common === commonKey ? key : common;
    },
  };
}
