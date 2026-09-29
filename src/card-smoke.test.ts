// @vitest-environment happy-dom

// Component-level coverage for the three departure-board card entrypoints.
// The route card and its editor have their own suite, route-card.test.ts.
//
// These three files are 6,568 lines — the entire user-visible surface of the
// integration — and until this test existed not one of them was ever loaded by
// the suite. That is worse than it sounds: v8 coverage instruments only what a
// run imports, so the cards were not merely uncovered, they were absent from
// the coverage report altogether, and the headline percentage was computed
// over a denominator that excluded the largest files in the tree.
//
// Deliberately thin, in the same spirit as editor-smoke.test.ts. It pins the
// invariants that are load-bearing, silent when broken, and cheap to assert:
//
//   * each card is defined under the tag Lovelace looks up, and self-registers
//     in window.customCards so the "Add card" picker can find it
//   * setConfig rejects the shapes Lovelace should show an error card for,
//     and accepts the shapes the editors emit
//   * each card renders against a populated hass without throwing
//   * each card renders against an empty/missing entity without throwing —
//     the state a dashboard is in for the first seconds after a restart
//
// The HA components the cards host (ha-card, ha-icon, ha-alert) are never
// defined. An unknown element is inert in the DOM and Lit renders straight
// through it, which is why this costs a docblock rather than a test harness.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "./wiener-linien-austria-card.js";
import "./wiener-linien-austria-retro-card.js";
import "./wiener-linien-austria-flap-card.js";

import type { HomeAssistant } from "./types.js";

interface CardElement extends HTMLElement {
  hass: HomeAssistant | undefined;
  setConfig(config: Record<string, unknown>): void;
  getCardSize(): number;
  updateComplete: Promise<unknown>;
}

const ENTITY = "sensor.westbahnhof_abfahrten";

const MODERN = "wiener-linien-austria-card";
const RETRO = "wiener-linien-austria-retro-card";
const FLAP = "wiener-linien-austria-flap-card";

/** A stop mid-service: two lines, both directions, colours and alerts. */
function busyHass(): HomeAssistant {
  return {
    language: "de",
    themes: { darkMode: false },
    localize: (key: string) => key,
    states: {
      [ENTITY]: {
        entity_id: ENTITY,
        state: "3",
        attributes: {
          stop_name: "Westbahnhof",
          diva: 60200959,
          server_time: "2026-09-09T16:35:58.000+0200",
          line_colors: { U3: { bg: "EF7C00", fg: "FFFFFF" } },
          lines_at_stop: ["U3", "52"],
          departures: [
            {
              line: "U3",
              direction: "H",
              towards: "Simmering",
              type: "ptMetro",
              countdown: 3,
              time_planned: "2026-09-09T16:38:00.000+0200",
              time_real: "2026-09-09T16:38:30.000+0200",
              realtime: true,
              barrier_free: true,
              traffic_jam: false,
            },
            {
              line: "52",
              direction: "R",
              towards: "Baumgarten",
              type: "ptTram",
              countdown: 7,
              time_planned: "2026-09-09T16:42:00.000+0200",
              time_real: null,
              realtime: false,
              barrier_free: false,
              traffic_jam: false,
            },
          ],
          traffic_info: [],
          elevator_info: [],
        },
      },
    },
  } as unknown as HomeAssistant;
}

/** The state a dashboard holds for the first seconds after an HA restart. */
function emptyHass(): HomeAssistant {
  return {
    language: "de",
    themes: { darkMode: false },
    localize: (key: string) => key,
    states: {},
  } as unknown as HomeAssistant;
}

/** Each card with a config its own normaliser accepts, and a fragment its
 *  own rendering is expected to produce (matched against whitespace-stripped
 *  shadow text). Retro is the single-stop card, so its config shape is flat.
 *
 *  The fragments differ per card because the cards genuinely render
 *  differently, and pretending otherwise produces a test that fails for
 *  reasons unrelated to correctness:
 *    * the retro card is a bare LED panel and renders no station name at
 *      all by default, so "Westbahnhof" is absent there and present in the
 *      other two;
 *    * the flap card renders every glyph twice — the current and the next
 *      face of each split-flap tile — so its board text for line U3 is
 *      "U U 3 3", not "U3".
 */
const CARDS: ReadonlyArray<
  readonly [string, Record<string, unknown>, string]
> = [
  [MODERN, { type: `custom:${MODERN}`, entities: [{ entity: ENTITY }] }, "U3"],
  [RETRO, { type: `custom:${RETRO}`, entity: ENTITY }, "U3"],
  [FLAP, { type: `custom:${FLAP}`, entities: [{ entity: ENTITY }] }, "UU33"],
];

async function mount(
  tag: string,
  hass: HomeAssistant | undefined,
  config: Record<string, unknown>,
): Promise<CardElement> {
  const el = document.createElement(tag) as CardElement;
  document.body.appendChild(el);
  el.hass = hass;
  el.setConfig(config);
  await el.updateComplete;
  return el;
}

const shadow = (el: CardElement): ShadowRoot => {
  const root = el.shadowRoot;
  if (!root) throw new Error("card rendered no shadow root");
  return root;
};

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("custom element registration", () => {
  it.each(CARDS)("%s is defined", (tag) => {
    expect(customElements.get(tag)).toBeTypeOf("function");
  });

  it("every card self-registers in window.customCards", () => {
    // The only thing that puts a card in the dashboard's "Add card" picker.
    // It happens at import time, so a bundling change that tree-shakes the
    // side effect away is silent — the card still works if you hand-write
    // the YAML, and is undiscoverable if you don't.
    const registered = (
      window as unknown as { customCards?: Array<{ type: string }> }
    ).customCards;
    expect(registered).toBeDefined();
    const types = new Set((registered ?? []).map((c) => c.type));
    for (const [tag] of CARDS) {
      expect(types).toContain(tag);
    }
  });
});

describe("setConfig validation", () => {
  it.each(CARDS)("%s rejects a non-object config", (tag) => {
    const el = document.createElement(tag) as CardElement;
    expect(() => el.setConfig(undefined as never)).toThrow();
  });

  it.each(CARDS)("%s rejects a non-string entity", (tag) => {
    // Lovelace surfaces the throw verbatim under hui-error-card, which is
    // the whole reason all three validate shape rather than failing silent.
    const el = document.createElement(tag) as CardElement;
    expect(() => el.setConfig({ type: `custom:${tag}`, entity: 42 })).toThrow();
  });

  it("the modern card requires an entity; retro and flap do not", () => {
    // A deliberate divergence, not drift, and worth pinning because it
    // looks like an inconsistency to anyone reading the three setConfigs
    // side by side. The retro and flap cards accept a config with no
    // entity because that is the entity picker's stub state and their
    // editors have to be able to load on it (see the comment above the
    // check in wiener-linien-austria-retro-card.ts). The modern card has
    // no such stub state, so a config naming nothing is a user error.
    const modern = document.createElement(MODERN) as CardElement;
    expect(() => modern.setConfig({ type: `custom:${MODERN}` })).toThrow();

    for (const tag of [RETRO, FLAP]) {
      const el = document.createElement(tag) as CardElement;
      expect(() => el.setConfig({ type: `custom:${tag}` })).not.toThrow();
    }
  });

  it.each(CARDS)("%s accepts the shape its editor emits", (tag, config) => {
    const el = document.createElement(tag) as CardElement;
    expect(() => el.setConfig(config)).not.toThrow();
  });
});

describe("rendering", () => {
  it.each(CARDS)("%s renders a populated stop", async (tag, config, expected) => {
    const el = await mount(tag, busyHass(), config);
    const root = shadow(el);
    expect(root.childElementCount).toBeGreaterThan(0);
    const rendered = (root.textContent ?? "").replace(/\s+/g, "");
    expect(rendered).toContain(expected);
  });

  it.each(CARDS)("%s renders when the entity is missing", async (tag, config) => {
    // Not a hypothetical: between HA start and the integration's first
    // successful poll, every dashboard holding one of these cards is in
    // exactly this state. Throwing here replaces the card with a red box.
    const el = await mount(tag, emptyHass(), config);
    expect(shadow(el).childElementCount).toBeGreaterThan(0);
  });

  it.each(CARDS)("%s renders before hass is ever set", async (tag, config) => {
    const el = document.createElement(tag) as CardElement;
    document.body.appendChild(el);
    el.setConfig(config);
    await el.updateComplete;
    expect(el.shadowRoot).not.toBeNull();
  });

  it.each(CARDS)("%s reports a positive card size", async (tag, config) => {
    const el = await mount(tag, busyHass(), config);
    expect(el.getCardSize()).toBeGreaterThan(0);
  });

  it("the retro card blames the line filter, not the direction, on a both-directions board", async () => {
    // A board set to every direction filters nothing by direction, so an empty
    // result can only be the line filter. Reading "both" as a value to compare
    // each departure against matches nothing, which sent every empty
    // multi-line board to "wrong direction" instead.
    const el = await mount(RETRO, busyHass(), {
      type: `custom:${RETRO}`,
      entity: ENTITY,
      lines: ["U6"],
      direction: "both",
    });
    const empty = shadow(el).querySelector(".retro-empty");
    expect(empty?.textContent?.trim()).toBe("Keine Abfahrten für diese Linie");
  });

});

/** A stop with a live U3 on either side of a planned S-Bahn train. */
function timetableHass(): HomeAssistant {
  const hass = busyHass();
  const attrs = hass.states[ENTITY]!.attributes as Record<string, unknown>;
  const [u3] = attrs.departures as Array<Record<string, unknown>>;
  attrs.departures = [
    u3,
    {
      line: "S2",
      direction: "R",
      towards: "Wolkersdorf",
      type: "ptTrainS",
      countdown: 5,
      time_planned: "2026-09-09T16:40:00+02:00",
      time_real: null,
      realtime: false,
      barrier_free: false,
      traffic_jam: false,
      platform: "4",
      timetable: true,
    },
    { ...u3, countdown: 9, time_planned: "2026-09-09T16:44:00.000+0200" },
  ];
  return hass;
}

describe("tab strip", () => {
  it("renders inert scroll arrows while the tabs fit", async () => {
    const hass = busyHass();
    hass.states["sensor.second"] = {
      ...hass.states[ENTITY]!,
      entity_id: "sensor.second",
      attributes: { ...hass.states[ENTITY]!.attributes, stop_name: "Taubstummengasse" },
    };
    const el = await mount(MODERN, hass, {
      type: `custom:${MODERN}`,
      layout: "tabs",
      entities: [{ entity: ENTITY }, { entity: "sensor.second" }],
    });
    const root = shadow(el);
    const arrows = [...root.querySelectorAll<HTMLButtonElement>(".tab-scroll")];
    expect(arrows).toHaveLength(2);
    for (const arrow of arrows) {
      // A pointer shortcut only: keyboard users move through the tablist.
      expect(arrow.getAttribute("tabindex")).toBe("-1");
      expect(arrow.getAttribute("aria-hidden")).toBe("true");
      // happy-dom has no layout, so the strip reports no overflow.
      expect(arrow.classList.contains("visible")).toBe(false);
    }
    expect(root.querySelector(".tabs-viewport")!.className).not.toContain("fade");
    const tabs = root.querySelectorAll<HTMLElement>('[role="tab"]');
    expect(tabs[1]!.getAttribute("title")).toBe("Taubstummengasse");
  });
});

describe("planned S-Bahn rows", () => {
  it("the modern card labels the timetable row and only that row", async () => {
    const el = await mount(MODERN, timetableHass(), CARDS[0]![1]);
    const root = shadow(el);
    const marks = root.querySelectorAll(".timetable-note, .hero-timetable");
    expect(marks).toHaveLength(1);
    expect(marks[0]!.textContent?.trim()).toBe("nur Fahrplan");
    expect(marks[0]!.getAttribute("title")).toBe("Fahrplanzeit, keine Echtzeitdaten");
  });

  it("the retro card marks the row and says so in its label", async () => {
    // The retro panel shows one line in one direction; point it at the S2.
    const el = await mount(RETRO, timetableHass(), {
      ...CARDS[1]![1],
      line: "S2",
      direction: "R",
    });
    const root = shadow(el);
    expect(root.querySelectorAll(".retro-timetable")).toHaveLength(1);
    const labels = [...root.querySelectorAll(".retro-row")].map((row) =>
      row.getAttribute("aria-label"),
    );
    expect(labels.filter((label) => label?.includes("keine Echtzeitdaten"))).toHaveLength(1);
  });

  it("the flap card marks the row with a cream-faced tile", async () => {
    const el = await mount(FLAP, timetableHass(), CARDS[2]![1]);
    const root = shadow(el);
    const tiles = root.querySelectorAll(".flap-tile--pictogram-plain");
    expect(tiles).toHaveLength(1);
    expect(tiles[0]!.getAttribute("aria-label")).toBe("Fahrplanzeit, keine Echtzeitdaten");
  });
});

describe("tab-scoped alert banner", () => {
  const OTHER = "sensor.taubstummengasse_abfahrten";

  /** Two stops, each carrying one disruption the other has nothing to do
   *  with. The banner sits above the tab panel, so nothing but the render
   *  scoping keeps them apart. */
  function twoStopHass(): HomeAssistant {
    const base = busyHass();
    const westbahnhof = base.states[ENTITY]!;
    westbahnhof.attributes.traffic_info = [
      { name: "W1", title: "U3: Verspätungen", description: "", related_lines: ["U3"] },
    ];
    base.states[OTHER] = {
      ...westbahnhof,
      entity_id: OTHER,
      attributes: {
        ...westbahnhof.attributes,
        stop_name: "Taubstummengasse",
        traffic_info: [
          { name: "T1", title: "U1: Gleisschaden", description: "", related_lines: ["U1"] },
        ],
      },
    } as (typeof base.states)[string];
    return base;
  }

  const alertBadges = (el: CardElement): string[] =>
    [...shadow(el).querySelectorAll(".alert-line-badge")].map(
      (n) => n.textContent?.trim() ?? "",
    );

  const tabsConfig = {
    type: `custom:${MODERN}`,
    layout: "tabs",
    show_traffic_info: true,
    entities: [{ entity: ENTITY }, { entity: OTHER }],
  };

  it("shows only the open tab's disruptions", async () => {
    const el = await mount(MODERN, twoStopHass(), tabsConfig);
    // The title drops the line list its badge already carries, so the line
    // is asserted on the badge and the fault on the title.
    expect(alertBadges(el)).toEqual(["U3"]);
    const text = shadow(el).textContent ?? "";
    expect(text).toContain("Verspätungen");
    // The bug this pins: the banner is rendered outside the tab panel, so
    // it used to pool traffic_info across every configured stop and
    // announce a Taubstummengasse fault under the Westbahnhof tab.
    expect(text).not.toContain("Gleisschaden");
  });

  it("follows the tab the reader switches to", async () => {
    const el = await mount(MODERN, twoStopHass(), tabsConfig);
    const tabs = shadow(el).querySelectorAll<HTMLElement>('[role="tab"]');
    expect(tabs.length).toBe(2);
    tabs[1]!.click();
    await el.updateComplete;
    expect(alertBadges(el)).toEqual(["U1"]);
    const text = shadow(el).textContent ?? "";
    expect(text).toContain("Gleisschaden");
    expect(text).not.toContain("Verspätungen");
  });

  it("badges a line-less stop notice with its inferred lines", async () => {
    const hass = busyHass();
    hass.states[ENTITY]!.attributes.traffic_info = [
      {
        name: "R483-0",
        title: "Rettungseinsatz",
        description: "Betrieb ab Eichenstraße",
        related_lines: [],
        inferred_lines: ["6", "18"],
        category: "stoerungkurz",
      },
      {
        name: "R401-106",
        title: "Fahrtbehinderung",
        description: "",
        related_lines: ["6"],
        inferred_lines: ["18"],
        category: "stoerungkurz",
      },
    ];
    const el = await mount(MODERN, hass, { ...tabsConfig, entities: [{ entity: ENTITY }] });
    const badges = [...shadow(el).querySelectorAll(".alert-lines")].map((row) =>
      [...row.querySelectorAll(".alert-line-badge")].map((b) => b.textContent),
    );
    // Upstream's own lines win whenever it published any.
    expect(badges).toEqual([["6", "18"], ["6"]]);
  });

  it("pools every stop's disruptions in stacked layout", async () => {
    // Stacked shows all stops at once, so one shared banner is correct.
    const el = await mount(MODERN, twoStopHass(), {
      ...tabsConfig,
      layout: "stacked",
    });
    expect(alertBadges(el)).toEqual(["U3", "U1"]);
    const text = shadow(el).textContent ?? "";
    expect(text).toContain("Verspätungen");
    expect(text).toContain("Gleisschaden");
  });
});

// ---------------------------------------------------------------------------
// stops_ahead_modes — which transfer categories get a chip in the trail.
// ---------------------------------------------------------------------------

/** One stop with a transfer from each of the six categories. `43` is the
 *  tram, `WLB` the Badner Bahn, `13A` the city bus, `N38` the NightLine. */
function trailHass(): HomeAssistant {
  return {
    language: "de",
    themes: { darkMode: false },
    localize: (key: string) => key,
    states: {
      [ENTITY]: {
        entity_id: ENTITY,
        state: "1",
        attributes: {
          stop_name: "Westbahnhof",
          diva: 60200959,
          server_time: "2026-09-09T16:35:58.000+0200",
          line_colors: {},
          lines_at_stop: ["U3"],
          departures: [
            {
              line: "U3",
              direction: "H",
              towards: "Simmering",
              type: "ptMetro",
              countdown: 3,
              time_planned: "2026-09-09T16:38:00.000+0200",
              time_real: "2026-09-09T16:38:30.000+0200",
              realtime: true,
              stops_ahead: [
                {
                  name: "Zieglergasse",
                  lines: ["U3", "S45", "43", "WLB", "13A", "N38"],
                },
              ],
            },
          ],
          traffic_info: [],
          elevator_info: [],
        },
      },
    },
  } as unknown as HomeAssistant;
}

/** Inline chip labels plus the count behind the `+N` toggle.
 *
 *  The two are read together because only the inline half is deterministic:
 *  U- and S-chips always sit inline, while a NightLine moves between inline
 *  and the `+N` panel depending on Vienna's clock (`_isNightlineHour`), and
 *  the `+N` panel's own chips only enter the DOM once expanded. Their SUM is
 *  stable at any hour, which is what makes `total` safe to assert on. */
function trailChips(el: CardElement): { inline: string[]; total: number } {
  const root = shadow(el);
  const inline = [...root.querySelectorAll(".stops-ahead-line-chip")].map(
    (n) => n.textContent?.trim() ?? "",
  );
  const counter = root.querySelector(".stops-ahead-other-count");
  const other = counter ? Number(counter.textContent?.replace("+", "") ?? "0") : 0;
  return { inline, total: inline.length + other };
}

async function mountTrail(modes?: unknown): Promise<CardElement> {
  return mount(MODERN, trailHass(), {
    type: `custom:${MODERN}`,
    entities: [{ entity: ENTITY }],
    ...(modes === undefined ? {} : { stops_ahead_modes: modes }),
  });
}

describe("stops_ahead_modes", () => {
  it("chips every category when the key is absent", async () => {
    const { inline, total } = trailChips(await mountTrail());
    expect(total).toBe(6);
    expect(inline).toContain("U3");
    expect(inline).toContain("S45");
  });

  it("drops the U-chips when metro is off", async () => {
    const { inline, total } = trailChips(
      await mountTrail(["sbahn", "tram", "badner", "bus", "night"]),
    );
    expect(total).toBe(5);
    expect(inline).not.toContain("U3");
    expect(inline).toContain("S45");
  });

  // The inline U/S chips and the `+N` panel are two halves of one list, so a
  // filter applied to only the panel would leave these visible — the bug this
  // pins is "metro off, U-chip still there".
  it("drops the S-chips when sbahn is off", async () => {
    const { inline, total } = trailChips(
      await mountTrail(["metro", "tram", "badner", "bus", "night"]),
    );
    expect(total).toBe(5);
    expect(inline).not.toContain("S45");
    expect(inline).toContain("U3");
  });

  // The Badner Bahn used to fall into `tram`, so this is the case that pins
  // the split: hiding trams must leave the WLB chip alone, and vice versa.
  it("hides the Badner Bahn without touching the trams", async () => {
    const { total } = trailChips(
      await mountTrail(["metro", "sbahn", "tram", "bus", "night"]),
    );
    expect(total).toBe(5);
  });

  it("hides the trams without touching the Badner Bahn", async () => {
    const { total } = trailChips(
      await mountTrail(["metro", "sbahn", "badner", "bus", "night"]),
    );
    expect(total).toBe(5);
  });

  it("keeps only the rail categories when tram, bus and night are off", async () => {
    const { inline, total } = trailChips(await mountTrail(["metro", "sbahn"]));
    expect(total).toBe(2);
    expect(inline.sort()).toEqual(["S45", "U3"]);
  });

  it("renders no chip and no +N toggle when every category is off", async () => {
    const el = await mountTrail([]);
    expect(trailChips(el)).toEqual({ inline: [], total: 0 });
    expect(shadow(el).querySelector(".stops-ahead-other-toggle")).toBeNull();
  });

  // The stop itself is not a transfer — hiding every category must not empty
  // the trail, only strip it of chips.
  it("still renders the stop name when every category is off", async () => {
    const el = await mountTrail([]);
    const names = [...shadow(el).querySelectorAll(".stops-ahead-name")].map(
      (n) => n.textContent?.trim(),
    );
    expect(names).toContain("Zieglergasse");
  });
});

describe("flap board column width", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function boardHass(rows: ReadonlyArray<[string, string, number]>): HomeAssistant {
    const hass = busyHass();
    hass.states[ENTITY]!.attributes.departures = rows.map(([line, towards, countdown]) => ({
      line,
      direction: "H",
      towards,
      type: "ptMetro",
      countdown,
      time_planned: null,
      time_real: null,
      realtime: true,
      barrier_free: true,
      traffic_jam: false,
    }));
    return hass;
  }

  /** Each row's tiles in one column, as a string with blanks as "_". */
  function column(el: CardElement, cell: "line" | "dest"): string[] {
    return [...shadow(el).querySelectorAll(".flap-row")].map((row) =>
      [...row.querySelectorAll(`.flap-cell--${cell} .flap-tiles > .flap-tile`)]
        .map((tile) =>
          tile.classList.contains("flap-tile--blank")
            ? "_"
            : tile.querySelector(".flap-tile__glyph")?.textContent,
        )
        .join(""),
    );
  }

  it("re-fits both columns when their widest entry leaves", async () => {
    vi.useFakeTimers();
    const el = await mount(
      FLAP,
      boardHass([
        ["48A", "Dornbach", 1],
        ["U1", "Leopoldau", 3],
        ["U1", "Oberlaa", 5],
      ]),
      { ...CARDS[2]![1], max_rows: 3 },
    );
    expect(column(el, "line")).toEqual(["48A", "_U1", "_U1"]);

    el.hass = boardHass([
      ["U1", "Leopoldau", 3],
      ["U1", "Oberlaa", 5],
      ["U6", "Siebenhirten", 8],
    ]);
    await el.updateComplete;
    await vi.advanceTimersByTimeAsync(30_000);
    await el.updateComplete;

    // The lines stay right-aligned, next to the destination, with no
    // blank tile stranded where the 48A's third character was.
    expect(column(el, "line")).toEqual(["U1", "U1", "U6"]);
    expect(column(el, "dest").map((d) => d.length)).toEqual([12, 12, 12]);
  });
});
