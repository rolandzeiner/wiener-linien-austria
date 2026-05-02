import * as de from "./languages/de.json";
import * as en from "./languages/en.json";

type Dict = Record<string, unknown>;

const languages: Record<string, Dict> = {
  de: de as unknown as Dict,
  en: en as unknown as Dict,
};

// Hoisted fallback dict — `noUncheckedIndexedAccess` makes
// `languages[lang]` and `languages.de` both `Dict | undefined`. The German
// dict is bundled at compile time so this assertion is safe; pull it out
// once so the lookup chain in `translate` doesn't have to keep narrowing.
const FALLBACK_DICT: Dict = languages.de ?? {};

function resolvePath(path: string, dictionary: Dict): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Dict)) {
      return (acc as Dict)[key];
    }
    return undefined;
  }, dictionary);
}

function resolveString(path: string, dictionary: Dict): string | undefined {
  const v = resolvePath(path, dictionary);
  return typeof v === "string" ? v : undefined;
}

// Use `?:` AND `T | undefined` together so callers can either omit the
// key or pass `undefined` explicitly — `exactOptionalPropertyTypes`
// rejects `undefined` values for `?:` fields whose type doesn't include
// `undefined`, and most callers in this codebase pass an explicit
// `hass?.language` (which is `string | undefined`).
export interface TranslateContext {
  configLanguage?: string | undefined;
  hassLanguage?: string | undefined;
}

// German first, English fallback — the integration originates in Vienna and
// every untranslated key defaults to the live-language string rather than
// an empty blob.
function resolveLang(ctx: TranslateContext): string {
  const raw = ctx.configLanguage || ctx.hassLanguage || "de";
  const code = raw.replace("-", "_").split("_")[0] ?? "de";
  return code === "en" ? "en" : "de";
}

export function translate(
  key: string,
  ctx: TranslateContext,
  replacements?: Record<string, string | number>,
): string {
  const lang = resolveLang(ctx);
  let s = resolveString(key, languages[lang] ?? FALLBACK_DICT);
  if (s === undefined) s = resolveString(key, FALLBACK_DICT);
  if (s === undefined) return key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}
