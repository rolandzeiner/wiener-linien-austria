// @vitest-environment happy-dom

// Component-level coverage for the three card entrypoints.
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

import { beforeEach, describe, expect, it } from "vitest";

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

  const tabsConfig = {
    type: `custom:${MODERN}`,
    layout: "tabs",
    show_traffic_info: true,
    entities: [{ entity: ENTITY }, { entity: OTHER }],
  };

  it("shows only the open tab's disruptions", async () => {
    const el = await mount(MODERN, twoStopHass(), tabsConfig);
    const text = shadow(el).textContent ?? "";
    expect(text).toContain("U3: Verspätungen");
    // The bug this pins: the banner is rendered outside the tab panel, so
    // it used to pool traffic_info across every configured stop and
    // announce a Taubstummengasse fault under the Westbahnhof tab.
    expect(text).not.toContain("U1: Gleisschaden");
  });

  it("follows the tab the reader switches to", async () => {
    const el = await mount(MODERN, twoStopHass(), tabsConfig);
    const tabs = shadow(el).querySelectorAll<HTMLElement>('[role="tab"]');
    expect(tabs.length).toBe(2);
    tabs[1]!.click();
    await el.updateComplete;
    const text = shadow(el).textContent ?? "";
    expect(text).toContain("U1: Gleisschaden");
    expect(text).not.toContain("U3: Verspätungen");
  });

  it("pools every stop's disruptions in stacked layout", async () => {
    // Stacked shows all stops at once, so one shared banner is correct.
    const el = await mount(MODERN, twoStopHass(), {
      ...tabsConfig,
      layout: "stacked",
    });
    const text = shadow(el).textContent ?? "";
    expect(text).toContain("U3: Verspätungen");
    expect(text).toContain("U1: Gleisschaden");
  });
});
