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
// Extraction goes through `DOMParser`, not regex tag-stripping. Regex is the
// obvious first reach and the wrong tool: removing a tag can reassemble the
// tag it was removing (`<scr<script>ipt src=x>`), so it needs iterating to a
// fixpoint, and it still mis-reads `>` inside an attribute value. The
// browser's parser has neither problem and decodes entities on the way, so
// there is no entity table to maintain either.
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

/** Elements whose END tag is a line break in the rendered prose. */
const BLOCK_TAGS: ReadonlySet<string> = new Set([
  "P",
  "DIV",
  "LI",
  "UL",
  "OL",
  "TR",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
]);

/** Elements whose content is markup or styling, never prose — dropped
 *  wholesale rather than descended into. */
const SKIP_TAGS: ReadonlySet<string> = new Set([
  "SCRIPT",
  "STYLE",
  "TEMPLATE",
  "IFRAME",
  "SVG",
  "NOSCRIPT",
]);

/** Reduce the payload to plain-text lines. Accepts either `descriptionHTML`
 *  or the plain `description`; markup handling is simply inert on the latter,
 *  and the run-on repair in `splitRunOns` is what makes the plain variant
 *  readable at all.
 *
 *  Uses the browser's own HTML parser rather than regex tag-stripping. The
 *  regex version had to be iterated to a fixpoint because removing a tag
 *  could reassemble the tag it was removing — `<scr<script>ipt src=x>` — and
 *  it still mis-read attribute values containing ">" (`<p title="a>b">`).
 *  Both are whole classes of bug that a real parser doesn't have, and it
 *  decodes entities for free, so there is no named-entity table to keep in
 *  sync with whatever the operator's CMS emits.
 *
 *  `parseFromString` is inert by construction: it neither executes scripts
 *  nor fetches resources, and the document it returns is detached — never
 *  adopted into the live tree. Nothing here is an injection boundary anyway,
 *  since the extracted text reaches the DOM through ordinary escaped Lit
 *  bindings; that is why the `unsafeHTML` path was dropped. */
function toLines(raw: string): string[] {
  const doc = new DOMParser().parseFromString(raw, "text/html");

  const lines: string[] = [];
  let buffer = "";

  const flush = (): void => {
    const line = buffer.replace(/\s+/g, " ").trim();
    if (line) lines.push(line);
    buffer = "";
  };

  // A newline inside a text node is a break too — the plain `description`
  // variant separates its per-line sections that way, with no markup at all.
  const addText = (value: string): void => {
    const parts = value.split(/\r?\n/);
    buffer += parts[0] ?? "";
    for (let i = 1; i < parts.length; i += 1) {
      flush();
      buffer += parts[i] ?? "";
    }
  };

  const walk = (node: Node): void => {
    const children = node.childNodes;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (!child) continue;
      if (child.nodeType === Node.TEXT_NODE) {
        addText(child.nodeValue ?? "");
        continue;
      }
      // Comments, doctypes and processing instructions carry no prose.
      if (child.nodeType !== Node.ELEMENT_NODE) continue;

      const tag = (child as Element).tagName.toUpperCase();
      if (SKIP_TAGS.has(tag)) continue;
      if (tag === "BR") {
        flush();
        continue;
      }
      walk(child);
      if (BLOCK_TAGS.has(tag)) flush();
    }
  };

  walk(doc.body);
  flush();
  return lines;
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
