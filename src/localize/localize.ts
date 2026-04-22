import * as de from "./languages/de.json";
import * as en from "./languages/en.json";

type Dict = Record<string, unknown>;

const languages: Record<string, Dict> = {
  de: de as unknown as Dict,
  en: en as unknown as Dict,
};

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

export interface TranslateContext {
  configLanguage?: string;
  hassLanguage?: string;
}

// German first, English fallback — the integration originates in Vienna and
// every untranslated key defaults to the live-language string rather than
// an empty blob.
export function resolveLang(ctx: TranslateContext): string {
  const raw = ctx.configLanguage || ctx.hassLanguage || "de";
  const code = raw.replace("-", "_").split("_")[0];
  return code === "en" ? "en" : "de";
}

export function translate(
  key: string,
  ctx: TranslateContext,
  replacements?: Record<string, string | number>,
): string {
  const lang = resolveLang(ctx);
  let s = resolveString(key, languages[lang] ?? languages.de);
  if (s === undefined) s = resolveString(key, languages.de);
  if (s === undefined) return key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}
