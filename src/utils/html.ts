function escHtml(s: unknown): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Named entities worth decoding out of upstream `descriptionHTML`. The
 *  numeric forms (`&#8211;` / `&#x2013;`) are handled generically below.
 *  Everything decoded here is re-escaped before it reaches the DOM, so the
 *  table can never widen the markup surface. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  shy: "",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  bdquo: "„",
  ldquo: "“",
  rdquo: "”",
  sbquo: "‚",
  euro: "€",
  deg: "°",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
};

function decodeEntities(s: string): string {
  return s.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi,
    (match, ref: string) => {
      if (ref[0] === "#") {
        const code =
          ref[1] === "x" || ref[1] === "X"
            ? Number.parseInt(ref.slice(2), 16)
            : Number.parseInt(ref.slice(1), 10);
        if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
        return String.fromCodePoint(code);
      }
      const named = NAMED_ENTITIES[ref];
      return named === undefined ? match : named;
    },
  );
}

/** Structural tags kept from upstream markup. Text-level formatting only —
 *  nothing that can navigate, load, or script. */
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
]);

/** Allowed tags that never take a closing tag. */
const VOID_TAGS = new Set(["br"]);

/** Elements whose *content* is dropped along with the tags — text inside
 *  them is markup/code, not prose. */
const DROP_CONTENT = /<\s*(script|style|template|iframe|svg)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;

// Wiener-Linien upstream traffic-info payloads contain short hand-authored
// HTML. Historically that was plain text plus the occasional <br>; since
// mid-2026 the U-Bahn disruption entries arrive as full <p>…</p> blocks.
// Those blocks carry the meaning (one paragraph per statement: what, detour,
// duration, reason), so they are rendered as real paragraphs rather than
// flattened.
//
// HARD CONTRACT — UPSTREAM MARKUP IS NEVER PASSED THROUGH VERBATIM.
//
// The output is rendered via Lit's `unsafeHTML` directive
// (wiener-linien-austria-card.ts). `unsafeHTML` does NOT re-sanitise — it
// trusts the caller. So this function re-emits markup rather than filtering
// it: the input is tokenised, text nodes are escaped, and every allowed tag
// is written out fresh from `ALLOWED_TAGS` as a bare `<tag>` with NO
// attributes. Anything else (tag or attribute) is dropped. There is no code
// path by which an upstream `href`, `on*`, `style` or unknown element can
// reach the DOM.
//
// Keep the allowlist text-level. Adding a tag that takes a URL (`a`, `img`)
// or that can be styled into an overlay would need attribute handling, and
// attribute handling needs a real sanitiser (DOMPurify) — not this function.
export function safeTrafficHtml(raw: unknown): string {
  const src = String(raw)
    .replace(DROP_CONTENT, " ")
    // Comments end at `-->` OR the legacy `--!>`, and an unterminated one
    // runs to the end of the input. Matching only `-->` (CodeQL
    // js/incomplete-multi-character-sanitization) left `<!--` sitting in the
    // text — harmless here, since leftovers are escaped and any tag inside
    // the comment still has to survive the allowlist, but the user saw the
    // stray marker rendered as literal text.
    .replace(/<!--[\s\S]*?(?:--!?>|$)/g, "")
    // Doctypes and bogus comments (`<!foo>`): never meaningful in a traffic
    // notice, and escaping them would show `<!doctype html>` as body text.
    .replace(/<![^>]*>/g, "");

  const out: string[] = [];
  const open: string[] = [];
  const token = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  let last = 0;

  const pushText = (chunk: string): void => {
    if (!chunk) return;
    const text = decodeEntities(chunk).replace(/\s+/g, " ");
    if (text) out.push(escHtml(text));
  };

  for (let m = token.exec(src); m !== null; m = token.exec(src)) {
    pushText(src.slice(last, m.index));
    last = token.lastIndex;

    const tag = (m[2] ?? "").toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) continue;

    if (VOID_TAGS.has(tag)) {
      out.push(`<${tag}>`);
    } else if (m[1]) {
      // Closing tag: unwind to the matching open element so the emitted
      // markup stays balanced even when upstream nesting is not.
      const at = open.lastIndexOf(tag);
      if (at === -1) continue;
      while (open.length > at) {
        out.push(`</${open.pop()!}>`);
      }
    } else {
      // Implied end tags: upstream writes `<li>a<li>b` and stray `<p>`
      // sequences. Close the previous sibling instead of nesting it.
      if ((tag === "li" || tag === "p") && open[open.length - 1] === tag) {
        out.push(`</${open.pop()!}>`);
      }
      open.push(tag);
      out.push(`<${tag}>`);
    }
  }
  pushText(src.slice(last));
  while (open.length) {
    out.push(`</${open.pop()}>`);
  }

  return (
    out
      .join("")
      // Upstream uses `<p><br></p>` as a spacer between paragraphs; the
      // paragraph margins already provide that rhythm.
      .replace(/<p>(?:\s|<br>)*<\/p>/g, "")
      .replace(/(?:<br>)+(?=<\/p>)/g, "")
      .trim()
  );
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
