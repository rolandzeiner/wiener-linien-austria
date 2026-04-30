// Top-level helpers shared by both bundled cards (modern + retro).
// Extracted so security-critical primitives like the URL-trust gate
// have one canonical implementation rather than two near-copies.
//
// Kept narrow on purpose: card-specific helpers (line-colour resolution,
// localisation, departure filtering) stay in src/utils/* — this module
// is reserved for primitives a future third card would also need.

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
 * Format an ISO-8601 string OR a numeric epoch (seconds) as a relative
 * "n minutes ago" / "n hours ago" string. Returns null when the input
 * is unparseable. The Wiener Linien sensor surfaces ISO-8601 UTC; older
 * fixtures and YAML configs may still ship raw epoch seconds — accept
 * both shapes so a card-side bump doesn't gate on a coordinator update.
 *
 * `t` is the card's flat-key translate callback. Required keys:
 * `now`, `seconds_ago`, `minutes_ago`, `hours_ago`, each with `{n}`.
 */
export function relativeTime(
  ts: number | string | undefined | null,
  t: (key: string) => string,
): string | null {
  let tsSeconds: number | null = null;
  if (typeof ts === "number" && Number.isFinite(ts)) {
    tsSeconds = ts;
  } else if (typeof ts === "string" && ts.length > 0) {
    const ms = Date.parse(ts);
    if (Number.isFinite(ms)) tsSeconds = ms / 1000;
  }
  if (tsSeconds === null) return null;
  const ageSec = Math.max(0, Math.floor(Date.now() / 1000 - tsSeconds));
  if (ageSec < 10) return t("now");
  if (ageSec < 60) return t("seconds_ago").replace("{n}", String(ageSec));
  if (ageSec < 3600) {
    return t("minutes_ago").replace("{n}", String(Math.floor(ageSec / 60)));
  }
  return t("hours_ago").replace("{n}", String(Math.floor(ageSec / 3600)));
}
