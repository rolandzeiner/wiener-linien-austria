// @vitest-environment happy-dom
//
// `parseTrafficNotice` extracts through `DOMParser`, which the default node
// environment doesn't provide. Opted in per-file rather than globally so the
// other suites keep the faster node environment.
import { describe, expect, it } from "vitest";

import {
  iconForElevatorReason,
  parseTrafficNotice,
  splitLocationPath,
} from "./traffic-notice.js";

/** The two live `stoerunglang` entries on 2026-09-08, one per wording. */
const TEMPLATED = [
  "<p>Die Linie D wird in Richtung Nu&szlig;dorf S zwischen Absberggasse und",
  "Quartier Belvedere S &uuml;ber Quellenstra&szlig;e und Laxenburger Stra&szlig;e",
  "umgeleitet.</p><p>Voraussichtliche Dauer: 15:00 Uhr.</p>",
  "<p>Grund: Gleisschaden im Haltestellenbereich Quartier Belvedere S.</p>",
].join(" ");

const PROSE = [
  "<p>Die Linie U1 f&auml;hrt derzeit zwischen den Stationen Vorgartenstra&szlig;e",
  "und Kaiserm&uuml;hlen-VIC in beiden Richtungen &uuml;ber Gleis 2.</p>",
  "<p>Weichen Sie ersatzweise auf die Linien U2, O, 12, und 92A aus.</p>",
  "<p>Die St&ouml;rung dauert voraussichtlich bis 12:00 Uhr.</p>",
  "<p>Grund daf&uuml;r ist ein Rettungseinsatz im Haltestellenbereich Donauinsel.</p>",
].join(" ");

describe("parseTrafficNotice — templated facts", () => {
  it("extracts both labelled facts with their pictograms", () => {
    const { facts } = parseTrafficNotice(TEMPLATED);
    expect(facts).toEqual([
      {
        label: "Voraussichtliche Dauer",
        value: "15:00 Uhr",
        icon: "mdi:clock-outline",
      },
      {
        label: "Grund",
        value: "Gleisschaden im Haltestellenbereich Quartier Belvedere S",
        icon: "mdi:wrench",
      },
    ]);
  });

  it("leaves only the prose behind in blocks", () => {
    const { blocks } = parseTrafficNotice(TEMPLATED);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe("para");
    expect(blocks[0]?.text).toContain("umgeleitet.");
  });
});

describe("parseTrafficNotice — prose facts", () => {
  it("reads the sentence forms of the same two facts", () => {
    const { facts } = parseTrafficNotice(PROSE);
    expect(facts).toEqual([
      {
        label: "Voraussichtliche Dauer",
        value: "12:00 Uhr",
        icon: "mdi:clock-outline",
      },
      {
        label: "Grund",
        // Indefinite article dropped so the value reads like the templated
        // form's.
        value: "Rettungseinsatz im Haltestellenbereich Donauinsel",
        icon: "mdi:ambulance",
      },
    ]);
  });

  it("does not leave the extracted sentences in the prose blocks", () => {
    const { blocks } = parseTrafficNotice(PROSE);
    expect(blocks).toHaveLength(2);
    expect(blocks.map((b) => b.text).join(" ")).not.toMatch(/Grund|dauert/);
  });

  it("accepts the alternative connectives the operator may use", () => {
    const { facts } = parseTrafficNotice(
      "<p>Grund hierf&uuml;r sind Bauarbeiten im Bereich Praterstern.</p>",
    );
    expect(facts).toEqual([
      {
        label: "Grund",
        value: "Bauarbeiten im Bereich Praterstern",
        icon: "mdi:excavator",
      },
    ]);
  });

  it("keeps a definite article, which carries meaning", () => {
    const { facts } = parseTrafficNotice(
      "<p>Grund daf&uuml;r ist die Sperre der Station Praterstern.</p>",
    );
    expect(facts[0]?.value).toBe("die Sperre der Station Praterstern");
  });

  it("picks the calendar pictogram when the duration carries a date", () => {
    const { facts } = parseTrafficNotice(
      "<p>Die Sperre dauert voraussichtlich bis Montag, 03. August 2026, 04:00 Uhr.</p>",
    );
    expect(facts[0]).toEqual({
      label: "Voraussichtliche Dauer",
      value: "Montag, 03. August 2026, 04:00 Uhr",
      icon: "mdi:calendar-clock",
    });
  });
});

describe("parseTrafficNotice — prose matching stays conservative", () => {
  it("ignores a timed sentence that is not about the disruption", () => {
    const raw = "<p>Die Fahrt dauert voraussichtlich bis 12:00 Uhr.</p>";
    const { blocks, facts } = parseTrafficNotice(raw);
    expect(facts).toEqual([]);
    expect(blocks[0]?.text).toBe("Die Fahrt dauert voraussichtlich bis 12:00 Uhr.");
  });

  it("does not split a prose fact out of the middle of a paragraph", () => {
    // Only whole-line sentences are classified; mid-paragraph prose reads
    // correctly as prose, so it is left alone.
    const raw =
      "<p>Weichen Sie auf die Linie 43A aus. Grund daf&uuml;r ist ein Unfall.</p>";
    const { blocks, facts } = parseTrafficNotice(raw);
    expect(facts).toEqual([]);
    expect(blocks).toHaveLength(1);
  });

  it("lets the templated form win and keeps the prose sentence as prose", () => {
    const raw =
      "<p>Grund: Gleisschaden.</p><p>Grund daf&uuml;r ist ein Rettungseinsatz.</p>";
    const { blocks, facts } = parseTrafficNotice(raw);
    expect(facts).toHaveLength(1);
    expect(facts[0]?.value).toBe("Gleisschaden");
    expect(blocks[0]?.text).toBe("Grund dafür ist ein Rettungseinsatz.");
  });
});

describe("parseTrafficNotice — structure recovery", () => {
  it("detaches a heading glued to its first statement", () => {
    const { blocks } = parseTrafficNotice(
      "<p>Linie 43:Betrieb nur zwischen A und B.</p>",
    );
    expect(blocks).toEqual([
      { kind: "heading", text: "Linie 43" },
      { kind: "para", text: "Betrieb nur zwischen A und B." },
    ]);
  });

  it("splits labelled facts glued to the preceding sentence", () => {
    const { blocks, facts } = parseTrafficNotice(
      "Weichen Sie auf die Linie 43A aus.Voraussichtliche Dauer: 31.07.2026.Grund: Gleisbauarbeiten.",
    );
    expect(blocks).toHaveLength(1);
    expect(facts.map((f) => f.label)).toEqual([
      "Voraussichtliche Dauer",
      "Grund",
    ]);
    expect(facts[0]?.value).toBe("31.07.2026");
  });

  it("returns empty collections for empty input", () => {
    expect(parseTrafficNotice("")).toEqual({ blocks: [], facts: [] });
    expect(parseTrafficNotice(null)).toEqual({ blocks: [], facts: [] });
  });

  it("drops script content rather than descending into it", () => {
    const { blocks } = parseTrafficNotice("<p>Hallo</p><script>alert(1)</script>");
    expect(blocks).toEqual([{ kind: "para", text: "Hallo" }]);
  });
});

describe("reason pictograms — substring landmines", () => {
  const iconFor = (reason: string): string | undefined =>
    parseTrafficNotice(`<p>Grund: ${reason}.</p>`).facts[0]?.icon;

  it("does not read the ice pattern out of unrelated words", () => {
    // "Gl-eis-schaden", "Pr-eis", "Kr-eis", "R-eis-ende" all contain "eis".
    expect(iconFor("Gleisschaden im Haltestellenbereich")).toBe("mdi:wrench");
    expect(iconFor("Bauarbeiten Kreisverkehr")).toBe("mdi:excavator");
  });

  it("still recognises genuine winter weather", () => {
    expect(iconFor("Schneefall")).toBe("mdi:snowflake");
    expect(iconFor("Eisregen")).toBe("mdi:snowflake");
    expect(iconFor("Vereisung der Oberleitung")).toBe("mdi:snowflake");
    expect(iconFor("Glatteis")).toBe("mdi:snowflake");
    expect(iconFor("Glätte")).toBe("mdi:snowflake");
  });

  it("prefers the specific category over the broad technical bucket", () => {
    expect(iconFor("Gleisbauarbeiten")).toBe("mdi:excavator");
    expect(iconFor("Weichenstörung")).toBe("mdi:wrench");
    expect(iconFor("Verkehrsunfall")).toBe("mdi:car-emergency");
  });

  it("falls back to the neutral pictogram for an unknown reason", () => {
    expect(iconFor("etwas völlig anderes")).toBe("mdi:information-outline");
  });
});

describe("lift helpers", () => {
  it("maps a lift reason onto the shared reason table", () => {
    expect(iconForElevatorReason("wegen Bauarbeiten")).toBe("mdi:excavator");
    expect(iconForElevatorReason("AUFZUGSERNEUERUNG")).toBe("mdi:wrench");
    expect(iconForElevatorReason("völlig unbekannt")).toBe(
      "mdi:information-outline",
    );
  });

  it("segments a location path without breaking hyphenated names", () => {
    expect(
      splitLocationPath("U3 Mittelbahnsteig - Ausgang Schlachthausgasse"),
    ).toEqual(["U3 Mittelbahnsteig", "Ausgang Schlachthausgasse"]);
    expect(splitLocationPath("Franz-Josefs-Bahnhof")).toEqual([
      "Franz-Josefs-Bahnhof",
    ]);
  });
});
