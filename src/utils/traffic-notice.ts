// Structure recovery for Wiener Linien disruption notices.
//
// Upstream ships `descriptionHTML` as bare <p> and <br> — no emphasis, no
// lists, no classes (verified across all 218 live trafficInfos entries: 102
// <p>, 44 <br>, nothing else). The STRUCTURE is there, but only as a writing
// convention inside the prose:
//
//   Linie 5:                          ← per-line section header
//   Kein Betrieb zwischen A und B.    ← statements about that line
//   Linien 40, 41, 42:
//   Kein Betrieb. …
//   Voraussichtliche Dauer: 31. August.   ← labelled fact
//   Grund: Bauarbeiten im Bereich …       ← labelled fact
//
// This module turns that convention into a model the card can lay out:
// headings, prose, and labelled facts as a separate block. Multi-line
// disruptions (one notice covering seven tram lines) are the case that
// benefits most — as flat prose they are a wall of text.
//
// It also repairs a real upstream defect: in 4 of the 10 entries carrying
// HTML, the labelled facts are glued to the preceding sentence with no
// separator at all — "…auf die Linie 43A aus.Voraussichtliche Dauer:
// 31.07.2026.Grund: Gleisbauarbeiten." Splitting is anchored ONLY to the
// literal label strings the operator templates (see FACT_LABELS), never to
// general punctuation: a generic "period followed by capital" rule would
// break "Betrieb ab 8.Mai" and "Station St.Marx".
//
// Output is plain text in a typed model, rendered through ordinary Lit
// bindings — so unlike the previous `unsafeHTML` path, nothing from upstream
// is ever interpreted as markup. Inline emphasis from upstream would be
// dropped, which costs nothing today (zero occurrences) and is the reason
// this can be escaped rather than sanitised.
//
// The module also carries two helpers for the LIFT feed —
// `iconForElevatorReason` and `splitLocationPath`. They live here rather
// than in their own module because the reason vocabulary is shared: the
// lift feed writes "wegen Bauarbeiten" and "AUFZUGSERNEUERUNG" against the
// same REASON_ICONS table the traffic reasons match on. Splitting them out
// would mean either duplicating that table or exporting it just to be
// re-imported next door.

/** Labels the operator uses for trailing facts, longest first so a prefix
 *  can't shadow a longer label. These are matched literally — extending the
 *  list is the intended way to cover new operator wording. */
const FACT_LABELS = ["Voraussichtliche Dauer", "Grund"] as const;

/** `Linie 43:` / `Linien 40, 41, 42:` — a per-line section header. Bounded
 *  length so a sentence that merely starts with "Linie" and happens to
 *  contain a colon later can't be swallowed as a heading. */
const HEADING_RE = /^(Linien?\s+[^:]{1,60}):\s*/;

/** The same heading, but consuming the whole piece — nothing follows the
 *  colon. Built from {@link HEADING_RE}'s source rather than written out
 *  again so the bounded length can't drift between the two. */
const HEADING_ONLY_RE = new RegExp(`${HEADING_RE.source}$`);

const FACT_RE = new RegExp(`^(${FACT_LABELS.join("|")}):\\s*(.+)$`);

/** Split point before a glued label: any label occurrence that isn't already
 *  at the start of its line. */
const GLUED_FACT_RE = new RegExp(`(?<=\\S)\\s*(?=(?:${FACT_LABELS.join("|")}):)`, "g");

export interface TrafficBlock {
  kind: "heading" | "para";
  text: string;
}

export interface TrafficFact {
  label: string;
  value: string;
  /** MDI key for the pictogram shown beside the label. */
  icon: string;
}

/** Neutral fallback — a circled "i". Used whenever the reason doesn't match
 *  a known category, which is the safe default: a wrong pictogram states
 *  something false about the disruption, a generic one only states that
 *  there is information. */
const FALLBACK_ICON = "mdi:information-outline";

/** Reason → pictogram, first match wins, so put the specific patterns above
 *  the general ones. Keyed off the operator's own vocabulary: the live feed
 *  is dominated by Gleisbauarbeiten / Bauarbeiten / Verkehrsunfall, with
 *  Rettungseinsatz and the Störung family close behind. Matching is on a
 *  substring so the compounds work — "Gleisbauarbeiten" contains
 *  "bauarbeiten", "Weichenstörung" contains "störung". */
const REASON_ICONS: ReadonlyArray<readonly [RegExp, string]> = [
  [/bauarbeit|baustelle|gleisbau|bauma(ß|ss)nahme/i, "mdi:excavator"],
  [/verkehrsunfall|unfall|kollision|zusammensto(ß|ss)/i, "mdi:car-emergency"],
  [/rettung|sanit(ä|ae)|notarzt/i, "mdi:ambulance"],
  [/feuerwehr|brand/i, "mdi:fire-truck"],
  [/polizei/i, "mdi:police-badge"],
  [/demonstration|kundgebung|veranstaltung|umzug|marathon/i, "mdi:account-group"],
  [/schnee|eis|glatt/i, "mdi:snowflake"],
  [/sturm|unwetter|witterung|gewitter|hitze/i, "mdi:weather-lightning-rainy"],
  // Broadest technical bucket last — "Störung" appears inside several of
  // the more specific compounds above. The maintenance vocabulary here is
  // what the lift feed uses ("AUFZUGSERNEUERUNG", "An der Instandsetzung
  // wird bereits gearbeitet", "Die erforderlichen Maßnahmen wurden
  // eingeleitet").
  [
    /gebrechen|defekt|schaden|st(ö|oe)rung|reparatur|erneuerung|instandsetzung|ma(ß|ss)nahme|wartung/i,
    "mdi:wrench",
  ],
];

/** Pictogram for a lift outage reason. Same category table as the traffic
 *  reasons — the lift feed shares the operator's vocabulary ("wegen
 *  Bauarbeiten", "AUFZUGSERNEUERUNG") — with the same neutral fallback when
 *  nothing matches. */
export function iconForElevatorReason(reason: string): string {
  for (const [pattern, icon] of REASON_ICONS) {
    if (pattern.test(reason)) return icon;
  }
  return FALLBACK_ICON;
}

/** Split a lift location into its path segments.
 *
 *  The feed writes these as a route through the station — "U3
 *  Mittelbahnsteig - Ausgang Schlachthausgasse - Ausgang Hainburger Weg" —
 *  using " - " as the separator in all 14 live entries. Segmenting lets the
 *  card show it as the path it is instead of one long hyphenated run.
 *
 *  Requires spaces around the hyphen, so hyphenated names ("Franz-Josefs-
 *  Bahnhof", "Stefan-Fadinger-Platz") stay intact. Returns a single-element
 *  array when there is no separator, so callers need no special case. */
export function splitLocationPath(location: string): string[] {
  return location
    .split(/\s+-\s+/)
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

/** A bare clock time ("11:30 Uhr") means later today; anything else carries
 *  a date ("31. August.", "Montag, 03. August 2026, 04:00 Uhr"). */
const TIME_ONLY_RE = /^\d{1,2}[:.]\d{2}(\s*Uhr)?\.?$/i;

/** Drop the sentence-final period the operator writes on a fact value
 *  ("31. August." → "31. August"). In a label→value block the value reads
 *  as data, not prose, and the terminal period looks like a typo —
 *  especially next to a German ordinal, where the value already ends in a
 *  date that contains its own dots ("31.07.2026.").
 *
 *  Only ONE trailing period is removed, and never from a bare ordinal
 *  ("31." would lose its meaning), so "31. August" keeps the ordinal dot
 *  that belongs to the day. */
function trimTerminalPeriod(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.endsWith(".")) return trimmed;
  if (/^\d+\.$/.test(trimmed)) return trimmed;
  return trimmed.slice(0, -1);
}

/** Pictogram for one labelled fact. "Grund" reads its category off the
 *  value's own wording; "Voraussichtliche Dauer" splits on whether the
 *  value is a bare clock time (today — clock) or carries a date (calendar),
 *  which is the distinction a reader is actually making when they glance
 *  at it. Unknown labels take the neutral fallback. */
function iconForFact(label: string, value: string): string {
  if (label === "Grund") {
    for (const [pattern, icon] of REASON_ICONS) {
      if (pattern.test(value)) return icon;
    }
    return FALLBACK_ICON;
  }
  if (label === "Voraussichtliche Dauer") {
    return TIME_ONLY_RE.test(value.trim())
      ? "mdi:clock-outline"
      : "mdi:calendar-clock";
  }
  return FALLBACK_ICON;
}

export interface TrafficNotice {
  blocks: TrafficBlock[];
  facts: TrafficFact[];
}

/** The named entities the operator's CMS actually emits: German umlauts and
 *  ß, typographic quotes and dashes, and the handful of XML basics. Not a
 *  complete HTML5 table — an unknown entity is left verbatim rather than
 *  guessed at, so a miss shows up as visible `&foo;` in the card instead of
 *  silently becoming the wrong glyph.
 *
 *  `shy` maps to the empty string deliberately: a soft hyphen is a *break
 *  opportunity*, not a character. Once the prose is re-wrapped into the
 *  card's own layout the operator's break points are meaningless, and
 *  keeping U+00AD leaves stray hyphens mid-word on some renderers. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
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

/** Resolve numeric (`&#8211;` / `&#x2013;`) and named entities. Out-of-range
 *  or unparseable code points are left as the original text — the input is
 *  a display string, so a visible `&#99999999;` beats throwing or emitting
 *  U+FFFD. */
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

/** Hard stop on the fixpoint loop below. Eight passes strips any nesting
 *  depth the operator's CMS could plausibly produce; a crafted payload that
 *  is still changing after that is pathological and gets returned as-is
 *  rather than spun on. */
const MAX_STRIP_PASSES = 8;

/** Remove tags repeatedly until the string stops changing.
 *
 *  A single pass is not enough, because removing a sequence can reassemble
 *  the very sequence it was removing: `<scr<script>ipt src=x></scr</script>ipt>`
 *  loses the inner pair and the remainder closes back up into a live
 *  `<script src=x>` (CodeQL js/incomplete-multi-character-sanitization).
 *
 *  The replacements are written inline in the loop body on purpose. Factoring
 *  them into a `stripMarkupOnce` helper reads better but hides the loop from
 *  static analysis — the helper then looks like an unguarded single-pass
 *  sanitizer and the query fires on it (alert #7) even though every caller
 *  iterates to a fixpoint.
 *
 *  This is not an injection boundary — the parsed text is rendered through
 *  ordinary Lit bindings and is escaped on the way to the DOM, which is the
 *  whole reason the `unsafeHTML` path was dropped. The fixpoint is about the
 *  text the reader actually sees, and about not leaving a sanitizer that can
 *  be walked backwards for the next person who wires up a different sink. */
function stripMarkup(input: string): string {
  let out = input;
  let previous: string;
  let passes = 0;
  do {
    previous = out;
    out = out
      // Elements whose content is markup, not prose.
      .replace(
        /<\s*(script|style|template|iframe|svg)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
        " ",
      )
      // Comments terminate at --> or the legacy --!>; an unterminated one
      // runs to the end of input.
      .replace(/<!--[\s\S]*?(?:--!?>|$)/g, "")
      .replace(/<![^>]*>/g, "")
      // Block boundaries become line breaks; every other tag is dropped.
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\s*\/\s*(?:p|div|li|ul|ol|tr|h[1-6])\s*>/gi, "\n")
      .replace(/<\/?[a-z][^>]*>/gi, "");
  } while (out !== previous && ++passes < MAX_STRIP_PASSES);
  return out;
}

/** Reduce the payload to plain-text lines. Accepts either `descriptionHTML`
 *  or the plain `description` — the tag handling is simply inert on the
 *  latter, and the run-on repair below is what makes the plain variant
 *  readable at all.
 *
 *  Entities are decoded AFTER the tags are stripped, never before: decoding
 *  first would turn `&lt;script&gt;` into a live-looking tag for the
 *  stripper to chew on, and the operator writing that entity meant it to be
 *  read as text. */
function toLines(raw: string): string[] {
  const text = decodeEntities(stripMarkup(raw));

  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Detach a heading that upstream glued to its first statement
 *  ("Linie 43:Betrieb nur zwischen…") and split off glued facts. */
function splitRunOns(line: string): string[] {
  const out: string[] = [];
  let rest = line;

  const heading = HEADING_RE.exec(rest);
  if (heading) {
    out.push(`${heading[1]}:`);
    rest = rest.slice(heading[0].length);
  }

  for (const part of rest.split(GLUED_FACT_RE)) {
    const trimmed = part.trim();
    if (trimmed) out.push(trimmed);
  }
  return out;
}

/** Parse one disruption description into headings, prose and labelled facts.
 *  Returns empty collections for empty input — callers can test
 *  `blocks.length || facts.length` for "is there anything to show". */
export function parseTrafficNotice(raw: unknown): TrafficNotice {
  const blocks: TrafficBlock[] = [];
  const facts: TrafficFact[] = [];
  const seenFacts = new Set<string>();

  for (const line of toLines(String(raw ?? ""))) {
    for (const piece of splitRunOns(line)) {
      const fact = FACT_RE.exec(piece);
      if (fact?.[1] && fact[2]) {
        // A repeated label would render as a duplicate row in the facts
        // block; first occurrence wins.
        if (seenFacts.has(fact[1])) continue;
        seenFacts.add(fact[1]);
        const value = trimTerminalPeriod(fact[2]);
        facts.push({
          label: fact[1],
          value,
          icon: iconForFact(fact[1], value),
        });
        continue;
      }
      const headingOnly = HEADING_ONLY_RE.exec(piece);
      if (headingOnly?.[1]) {
        blocks.push({ kind: "heading", text: headingOnly[1] });
        continue;
      }
      blocks.push({ kind: "para", text: piece });
    }
  }

  return { blocks, facts };
}
