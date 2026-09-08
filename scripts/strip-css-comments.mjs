// Bundler transform (Rollup plugin API, run by rolldown): drop authoring
// whitespace and comments from Lit `css`
// templates before they reach the bundle.
//
// Why this is needed at all: a minifier minifies JavaScript, and the contents
// of a tagged template literal are not JavaScript — they are string data. So every
// explanatory CSS comment and every level of indentation in card-styles.ts and
// the editor sheets shipped verbatim to every user. Measured before this
// plugin existed: 38 KB of block comments inside a 216 KB modern bundle, 17.8%
// of the file, and that is before counting indentation.
//
// The `comments: { legal: true }` output option is unrelated — it governs JS
// comments, and its job is keeping the build banner.
//
// Scope and safety
// ----------------
// * Only files under src/ are touched, and only `css` templates inside them.
//   `html` templates are left alone: their comments are HTML comments, and
//   their bodies carry `${}` interpolations this scanner does not model.
// * A template body containing `${` is skipped outright. There are none today;
//   if one is added later the plugin backs off rather than corrupting it.
// * A stray backtick inside a css template terminates the literal early and
//   silently breaks the card at load. That is already a CI gate
//   (validate.yml → "Guard against backticks inside Lit css/html templates"),
//   so scanning to the first unescaped backtick is sound.
// * Whitespace is only ever collapsed at line boundaries — each line is
//   trimmed, empty lines are dropped, and the rest are rejoined with a
//   newline. Nothing inside a line moves, so multi-line values keep the token
//   separation CSS requires, and CSS strings cannot span lines.
//
// This plugin must run AFTER the transpiler. The rule outlived the plugin that
// motivated it: @rollup/plugin-typescript emitted from a TS program that read
// the file off disk rather than from the bundler's transform chain, so anything
// done upstream of it was silently discarded. swc, and now rolldown's built-in
// transpile, are well-behaved — but ordering still matters, because they reprint
// the source, so running before them means re-expanded templates downstream.
// Note the pattern below tolerates whitespace before the backtick, because an
// emitter may reprint the tag as `css \`` with a space; rolldown emits it
// without one. Both forms match.
//
// Disabled during `npm run dev` (rolldown -c -w), where readable output and
// working sourcemaps are worth more than bytes.

const CSS_TEMPLATE = /\bcss\s*`/g;

/** Body of the template whose opening backtick is at `open`. */
function findBody(code, open) {
  for (let i = open + 1; i < code.length; i += 1) {
    if (code[i] === "\\") {
      i += 1;
      continue;
    }
    if (code[i] === "`") return { body: code.slice(open + 1, i), end: i };
  }
  return null;
}

function compress(body) {
  return body
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .join("\n");
}

export default function stripCssComments({ include = "/src/" } = {}) {
  let saved = 0;
  return {
    name: "strip-css-comments",
    transform(code, id) {
      if (!id.includes(include) || !id.endsWith(".ts")) return null;

      let out = "";
      let cursor = 0;
      let changed = false;
      CSS_TEMPLATE.lastIndex = 0;
      for (let m = CSS_TEMPLATE.exec(code); m; m = CSS_TEMPLATE.exec(code)) {
        const open = m.index + m[0].length - 1;
        const found = findBody(code, open);
        if (!found) break;
        // Interpolations are not modelled; leave such a template untouched.
        const keep = found.body.includes("${");
        const next = keep ? found.body : compress(found.body);
        out += code.slice(cursor, open + 1) + next;
        if (next !== found.body) {
          changed = true;
          saved += found.body.length - next.length;
        }
        cursor = found.end;
        CSS_TEMPLATE.lastIndex = found.end;
      }
      if (!changed) return null;
      return { code: out + code.slice(cursor), map: null };
    },
    buildEnd() {
      if (saved > 0) {
        this.warn(`strip-css-comments: removed ${saved.toLocaleString()} bytes`);
        saved = 0;
      }
    },
  };
}
