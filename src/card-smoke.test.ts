// @vitest-environment happy-dom

// Component-level coverage for the three departure-board card entrypoints.
// The route card and its editor have their own suite, route-card.test.ts.
//
// These three files were 6,568 lines when this suite was added — the entire
// user-visible surface of the integration — and until this test existed not
// one of them was ever loaded by the suite. That is worse than it sounds: v8 coverage instruments only what a
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
    // With no per-line override, a board set to every direction filters
    // nothing by direction, so an empty result comes from the line filter.
    // Reading "both" as a value to compare each departure against matched
    // nothing, which sent every empty both-directions board to "wrong
    // direction" instead.
    const el = await mount(RETRO, busyHass(), {
      type: `custom:${RETRO}`,
      entity: ENTITY,
      lines: ["U6"],
      direction: "both",
    });
    const empty = shadow(el).querySelector(".retro-empty");
    expect(empty?.textContent?.trim()).toBe("Keine Abfahrten für diese Linie");
  });

  it("the retro card blames the direction when a picked line only runs the other way", async () => {
    // The U3 runs only towards Simmering (H) here, but the board wants it R.
    // The 52 still running must not turn that into "wrong line".
    const el = await mount(RETRO, busyHass(), {
      type: `custom:${RETRO}`,
      entity: ENTITY,
      lines: ["U3"],
      direction: "both",
      line_directions: { U3: "R" },
    });
    const empty = shadow(el).querySelector(".retro-empty");
    expect(empty?.textContent?.trim()).toBe("Keine Abfahrten in dieser Richtung");
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

describe("step-free-only filter", () => {
  // busyHass: the U3 is step-free, the 52 is not.
  const lines = (el: CardElement): string => (shadow(el).textContent ?? "").replace(/\s+/g, "");

  it("hides the departures that aren't step-free", async () => {
    const el = await mount(MODERN, busyHass(), {
      type: `custom:${MODERN}`,
      entities: [{ entity: ENTITY }],
      show_accessibility: true,
      accessibility_only: true,
    });
    expect(lines(el)).toContain("Simmering");
    expect(lines(el)).not.toContain("Baumgarten");
  });

  it("hides nothing once the step-free icon it needs is switched off", async () => {
    // The editor greys the filter out then; it used to go on filtering.
    const el = await mount(MODERN, busyHass(), {
      type: `custom:${MODERN}`,
      entities: [{ entity: ENTITY }],
      show_accessibility: false,
      accessibility_only: true,
    });
    expect(lines(el)).toContain("Simmering");
    expect(lines(el)).toContain("Baumgarten");
  });
});

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
    // The retro board defaults to direction H and paints only two rows;
    // filter it to the S2 towards R so the planned row is on it.
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

  // The inline U/S chips and the `+N` panel are two halves of one list, so a
  // filter applied to only the panel would leave these visible — the bug this
  // pins is "metro off, U-chip still there".
  it("drops the U-chips when metro is off", async () => {
    const { inline, total } = trailChips(
      await mountTrail(["sbahn", "tram", "badner", "bus", "night"]),
    );
    expect(total).toBe(5);
    expect(inline).not.toContain("U3");
    expect(inline).toContain("S45");
  });

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

  it("keeps only metro and S-Bahn when every other category is off", async () => {
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

// ---------------------------------------------------------------------------
// show_stop_times — estimated arrival beside each stop of the trail.
// ---------------------------------------------------------------------------

type CallWS = NonNullable<HomeAssistant["callWS"]>;

/** The trail stop with three stops ahead and a `callWS` to ask for their run
 *  times. The U3 leaves at 16:38:30 live. */
function timesHass(callWS: CallWS, timeReal?: string): HomeAssistant {
  const hass = trailHass();
  const departure = (
    hass.states[ENTITY]!.attributes as {
      departures: Array<{ stops_ahead: unknown; time_real: string }>;
    }
  ).departures[0]!;
  departure.stops_ahead = [
    { name: "Zieglergasse" },
    { name: "Neubaugasse", lines: ["13A"] },
    { name: "Simmering", is_terminus: true },
  ];
  if (timeReal) departure.time_real = timeReal;
  return { ...hass, callWS };
}

function runTimesAnswer(runTimes: Record<string, Record<string, number>>): unknown {
  return {
    diva: 60200959,
    fetched_at: "2026-09-09T14:30:00+00:00",
    valid_until: "2099-01-01T00:00:00+00:00",
    run_times: runTimes,
  };
}

async function mountTimes(
  callWS: CallWS,
  config: Record<string, unknown> = { show_stop_times: true },
): Promise<CardElement> {
  return mount(MODERN, timesHass(callWS), {
    type: `custom:${MODERN}`,
    entities: [{ entity: ENTITY }],
    ...config,
  });
}

/** Let the ask resolve and the render it triggers finish. */
async function settle(el: CardElement): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
  }
}

async function openTrail(el: CardElement): Promise<void> {
  shadow(el).querySelector<HTMLElement>("[aria-controls]")?.click();
  await settle(el);
}

const stopTimes = (el: CardElement): string[] =>
  [...shadow(el).querySelectorAll(".stops-ahead-time")].map(
    (n) => n.textContent?.trim() ?? "",
  );

describe("show_stop_times", () => {
  const U3 = { Zieglergasse: 2, Neubaugasse: 3 };
  const asked = (callWS: CallWS): number =>
    (callWS as unknown as { mock: { calls: unknown[] } }).mock.calls.length;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks nothing and shows no times while the option is off", async () => {
    const callWS = vi.fn().mockResolvedValue(runTimesAnswer({ "U3|H": U3 }));
    const el = await mountTimes(callWS, {});
    await openTrail(el);
    expect(callWS).not.toHaveBeenCalled();
    expect(stopTimes(el)).toEqual([]);
  });

  it("asks nothing until a trail is opened", async () => {
    const callWS = vi.fn().mockResolvedValue(runTimesAnswer({ "U3|H": U3 }));
    const el = await mountTimes(callWS);
    await settle(el);
    expect(callWS).not.toHaveBeenCalled();
  });

  it("asks once for the stop when a trail opens, and adds the minutes to the live departure", async () => {
    const callWS = vi.fn().mockResolvedValue(runTimesAnswer({ "U3|H": U3 }));
    const el = await mountTimes(callWS);
    await openTrail(el);

    expect(callWS).toHaveBeenCalledTimes(1);
    expect(callWS).toHaveBeenCalledWith({
      type: "wiener_linien_austria/run_times",
      diva: 60200959,
      line: "U3",
      direction: "H",
    });
    // 16:38:30 + 2 min and + 3 min, seconds cut off. The terminus has no run
    // time in the answer and keeps an empty slot, so the names stay aligned.
    expect(stopTimes(el)).toEqual(["16:40", "16:41", ""]);
    const time = shadow(el).querySelector("time.stops-ahead-time");
    expect(time?.getAttribute("datetime")).toBe("2026-09-09T14:40:00.000Z");
    expect(time?.getAttribute("title")).toBe("Voraussichtliche Ankunft 16:40");
  });

  it("answers later renders and reopened trails from what it holds", async () => {
    const callWS = vi.fn().mockResolvedValue(runTimesAnswer({ "U3|H": U3 }));
    const el = await mountTimes(callWS);
    await openTrail(el);
    await openTrail(el); // close
    await openTrail(el); // reopen
    el.hass = timesHass(callWS); // the next poll
    await settle(el);

    expect(callWS).toHaveBeenCalledTimes(1);
    expect(stopTimes(el)).toEqual(["16:40", "16:41", ""]);
  });

  it("reads the time out on a stop whose row is a button", async () => {
    // The row's label replaces its content for a screen reader.
    const callWS = vi.fn().mockResolvedValue(runTimesAnswer({ "U3|H": U3 }));
    const el = await mountTimes(callWS);
    await openTrail(el);
    const row = shadow(el).querySelector('.stops-ahead-row[role="button"]');
    expect(row?.getAttribute("aria-label")).toBe(
      "1 weitere Linien bei Neubaugasse anzeigen · Voraussichtliche Ankunft 16:41",
    );
  });

  it("drops the time column for a line the answer doesn't know", async () => {
    const callWS = vi.fn().mockResolvedValue(runTimesAnswer({ "52|R": { Baumgarten: 9 } }));
    const el = await mountTimes(callWS);
    // Before the answer the column is held open, empty.
    expect(stopTimes(el)).toEqual(["", "", ""]);
    await openTrail(el);
    expect(stopTimes(el)).toEqual([]);
    // Asked about once, not on every render that follows.
    el.hass = timesHass(callWS);
    await settle(el);
    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it("keeps the trail without times when the ask fails, and doesn't ask again right away", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const callWS = vi.fn().mockRejectedValue({ code: "upstream", message: "api_timeout" });
    const el = await mountTimes(callWS);
    await openTrail(el);

    expect(stopTimes(el)).toEqual([]);
    expect(shadow(el).querySelectorAll(".stops-ahead-name")).toHaveLength(3);
    expect(warn).toHaveBeenCalledTimes(1);
    el.hass = timesHass(callWS);
    await settle(el);
    expect(asked(callWS)).toBe(1);
  });

  it("asks nothing for a row whose direction the command doesn't take", async () => {
    const callWS = vi.fn().mockResolvedValue(runTimesAnswer({}));
    const hass = timesHass(callWS);
    (
      hass.states[ENTITY]!.attributes as { departures: Array<{ direction: string }> }
    ).departures[0]!.direction = "";
    const el = await mount(MODERN, hass, {
      type: `custom:${MODERN}`,
      entities: [{ entity: ENTITY }],
      show_stop_times: true,
    });
    await openTrail(el);
    expect(callWS).not.toHaveBeenCalled();
    expect(stopTimes(el)).toEqual([]);
  });
});

describe("show_stop_times on a late departure", () => {
  // Planned 16:38:00, leaving 16:40:30: two and a half minutes behind.
  const LATE = "2026-09-09T16:40:30.000+0200";
  const answer = (): unknown =>
    runTimesAnswer({ "U3|H": { Zieglergasse: 2, Neubaugasse: 3 } });

  async function mountLate(config: Record<string, unknown> = {}): Promise<CardElement> {
    const callWS = vi.fn().mockResolvedValue(answer());
    const el = await mount(MODERN, timesHass(callWS, LATE), {
      type: `custom:${MODERN}`,
      entities: [{ entity: ENTITY }],
      show_stop_times: true,
      ...config,
    });
    await openTrail(el);
    return el;
  }

  const texts = (el: CardElement, selector: string): string[] =>
    [...shadow(el).querySelectorAll(selector)].map((n) => n.textContent?.trim() ?? "");

  it("strikes the timetable's arrival through and prints the expected one after it", async () => {
    const el = await mountLate();
    expect(texts(el, "s.stops-ahead-time--planned")).toEqual(["16:40", "16:41"]);
    expect(texts(el, "time.stops-ahead-time")).toEqual(["16:42", "16:43"]);
    // The struck time comes first in each pair, as it reads.
    const pair = shadow(el).querySelector(".stops-ahead-times");
    expect(pair?.firstElementChild?.tagName).toBe("S");
    expect(shadow(el).querySelectorAll("time.stops-ahead-time.late")).toHaveLength(2);
  });

  it("says the delay in words, since a strike-through isn't read out", async () => {
    const el = await mountLate();
    expect(
      shadow(el).querySelector("s.stops-ahead-time--planned")?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(texts(el, ".stops-ahead-times .sr-only")).toEqual([
      "geplant 16:40, 2 min später",
      "geplant 16:41, 2 min später",
    ]);
    const row = shadow(el).querySelector('.stops-ahead-row[role="button"]');
    expect(row?.getAttribute("aria-label")).toBe(
      "1 weitere Linien bei Neubaugasse anzeigen · Voraussichtliche Ankunft 16:43, geplant 16:41, 2 min später",
    );
  });

  it("keeps a stop without a time as wide as its neighbours' two", async () => {
    const el = await mountLate();
    const slot = shadow(el).querySelector("span.stops-ahead-time[aria-hidden]");
    expect(slot?.classList.contains("stops-ahead-time--pair")).toBe(true);
  });

  it("prints only the expected time with delays switched off", async () => {
    const el = await mountLate({ show_delay: false });
    expect(texts(el, "s.stops-ahead-time--planned")).toEqual([]);
    expect(texts(el, "time.stops-ahead-time")).toEqual(["16:42", "16:43"]);
    // The delay colours need delays, so they are off too.
    expect(shadow(el).querySelectorAll(".stops-ahead-time.late")).toHaveLength(0);
    const slot = shadow(el).querySelector("span.stops-ahead-time[aria-hidden]");
    expect(slot?.classList.contains("stops-ahead-time--pair")).toBe(false);
  });

  it("strikes through without the red when delay colours are off", async () => {
    const el = await mountLate({ show_delay_colors: false });
    expect(texts(el, "s.stops-ahead-time--planned")).toEqual(["16:40", "16:41"]);
    expect(shadow(el).querySelectorAll(".stops-ahead-time.late")).toHaveLength(0);
  });

  it("leaves a departure under a minute late alone", async () => {
    // The trail stop's own live time: 30 s behind.
    const callWS = vi.fn().mockResolvedValue(answer());
    const el = await mountTimes(callWS);
    await openTrail(el);
    expect(texts(el, "s.stops-ahead-time--planned")).toEqual([]);
    expect(shadow(el).querySelectorAll(".stops-ahead-time.late")).toHaveLength(0);
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
        ["48A", "Dr.-Karl-Renner-Ring", 1],
        ["U1", "Leopoldau", 3],
        ["U1", "Oberlaa", 5],
      ]),
      { ...CARDS[2]![1], max_rows: 3 },
    );
    expect(column(el, "line")).toEqual(["48A", "_U1", "_U1"]);

    el.hass = boardHass([
      ["U1", "Leopoldau", 3],
      ["U1", "Oberlaa", 5],
      ["U6", "Floridsdorf", 8],
    ]);
    await el.updateComplete;
    await vi.advanceTimersByTimeAsync(30_000);
    await el.updateComplete;

    // The lines stay right-aligned, next to the destination, with no
    // blank tile stranded where the 48A's third character was; the
    // destinations shrink from the Ring's 20 tiles to Floridsdorf's 11.
    expect(column(el, "line")).toEqual(["U1", "U1", "U6"]);
    expect(column(el, "dest").map((d) => d.length)).toEqual([11, 11, 11]);
  });
});

describe("retro wheelchair race", () => {
  const animate = vi.fn((_frames: Keyframe[], _timing: KeyframeAnimationOptions) => ({
    currentTime: 0 as number | null,
    pause: (): void => {},
    cancel: (): void => {},
  }));
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  const original = { animate: proto.animate, rect: proto.getBoundingClientRect };

  beforeEach(() => {
    vi.useFakeTimers();
    animate.mockClear();
    proto.animate = animate;
    // happy-dom lays nothing out, and the card measures its own width and
    // each racer's start before it rolls a race.
    proto.getBoundingClientRect = function (this: HTMLElement): DOMRect {
      const width = this.classList.contains("retro") ? 580 : 20;
      const left = this.classList.contains("retro-wheelchair") ? 200 : 0;
      return { width, height: 20, left, top: 0, right: left + width, bottom: 20, x: left, y: 0, toJSON: () => ({}) };
    };
  });

  afterEach(() => {
    proto.animate = original.animate;
    proto.getBoundingClientRect = original.rect;
    vi.useRealTimers();
  });

  /** Both rows step-free, so both carry a wheelchair to race. */
  function raceHass(): HomeAssistant {
    const hass = busyHass();
    const departures = hass.states[ENTITY]!.attributes.departures as Array<Record<string, unknown>>;
    for (const d of departures) d.barrier_free = true;
    return hass;
  }

  const RACE_CONFIG = { type: `custom:${RETRO}`, entity: ENTITY, direction: "both", wheelchair_race: true };

  it("starts on a tap and plays both racers through the Web Animations API", async () => {
    const el = await mount(RETRO, raceHass(), RACE_CONFIG);
    shadow(el).querySelector<HTMLElement>(".retro")!.click();
    await el.updateComplete;
    expect(shadow(el).querySelector(".retro--race-countdown")).not.toBeNull();

    await vi.advanceTimersByTimeAsync(2_500); // past the 3-2-1 countdown
    await el.updateComplete;

    expect(animate).toHaveBeenCalledTimes(2);
    const [frames, timing] = animate.mock.calls[0]!;
    // px, not cqw: a container unit keeps the animation off the compositor.
    expect(frames[0]!.transform).toMatch(/^translate\(-?[\d.]+px, 0\.12em\)$/);
    expect(timing.duration).toBeGreaterThan(0);
  });

  it("ignores the tap under prefers-reduced-motion", async () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    try {
      const el = await mount(RETRO, raceHass(), RACE_CONFIG);
      shadow(el).querySelector<HTMLElement>(".retro")!.click();
      await el.updateComplete;
      await vi.advanceTimersByTimeAsync(2_500);
      expect(shadow(el).querySelector(".retro--race-countdown")).toBeNull();
      expect(animate).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = matchMedia;
    }
  });
});

describe("modern card dev mode", () => {
  beforeEach(() => window.localStorage.setItem("wl_debug", "1"));
  afterEach(() => window.localStorage.removeItem("wl_debug"));

  it("injects a test disruption and lift outage, and opens the colour palette", async () => {
    const el = await mount(MODERN, busyHass(), CARDS[0]![1]);
    const root = shadow(el);
    const [traffic, elevator, colours] = root.querySelectorAll<HTMLButtonElement>(".dev-strip button");
    const alerts = (): number => root.querySelectorAll(".alert-title").length;
    const before = alerts();

    traffic!.click();
    await el.updateComplete;
    expect(alerts()).toBe(before + 1);

    elevator!.click();
    await el.updateComplete;
    expect(root.querySelectorAll(".lift-path")).toHaveLength(1);

    colours!.click();
    await el.updateComplete;
    expect(root.querySelectorAll(".dev-pal-chip").length).toBeGreaterThan(0);
  });
});
