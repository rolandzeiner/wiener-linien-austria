// @vitest-environment happy-dom

// Component-level coverage for the three card editors.
//
// The rest of the suite tests pure functions in a node environment, which left
// the v2 editor rewrite — the largest change in this release, and ~3,700 lines
// of it — with no test that ever rendered a component. Every regression in the
// editors would have been caught by a human opening the dialog, or not at all.
//
// This file is deliberately thin. It is not a substitute for looking at the
// editor; it pins the handful of invariants that are (a) load-bearing, (b)
// silent when broken, and (c) cheap to assert:
//
//   * every editor mounts, takes a config and renders without throwing
//   * a control writes the change back through `config-changed`
//   * the empty / missing / one-way states are reachable and say something
//   * the tablist's ARIA wiring matches the DOM it actually produces
//
// The HA components the editors host (ha-form, ha-icon, ha-alert,
// ha-icon-picker) are never defined here. They do not need to be: an unknown
// element is inert in the DOM, Lit renders straight through it, and none of
// the invariants above depend on their internals. That is the whole reason
// this layer costs a docblock rather than a test harness — no vitest config,
// no HA stubs, no shims.

import { describe, expect, it } from "vitest";

import "../editor.js";
import "../retro-editor.js";
import "../flap-editor.js";

import type { HomeAssistant } from "../types.js";

/** The slice of a Lovelace editor element these tests drive. */
interface EditorElement extends HTMLElement {
  hass: HomeAssistant | undefined;
  setConfig(config: Record<string, unknown>): void;
  updateComplete: Promise<unknown>;
}

const ENTITY = "sensor.westbahnhof_abfahrten";

function hassWith(attributes: Record<string, unknown>): HomeAssistant {
  return {
    language: "de",
    themes: { darkMode: false },
    localize: (key: string) => key,
    states: { [ENTITY]: { entity_id: ENTITY, state: "3", attributes } },
  } as unknown as HomeAssistant;
}

/** Two lines, both served in both directions — the ordinary case. */
const BUSY_STOP = hassWith({
  stop_name: "Westbahnhof",
  line_colors: { U3: "#EF7C00", "52": "#E20D17" },
  departures: [
    { line: "U3", direction: "H", towards: "Simmering", type: "ptMetro", countdown: 3 },
    { line: "U3", direction: "R", towards: "Ottakring", type: "ptMetro", countdown: 5 },
    { line: "52", direction: "H", towards: "Baumgarten", type: "ptTram", countdown: 7 },
  ],
});

async function mount(
  tag: string,
  hass: HomeAssistant | undefined,
  config: Record<string, unknown>,
): Promise<EditorElement> {
  const el = document.createElement(tag) as EditorElement;
  document.body.appendChild(el);
  el.hass = hass;
  el.setConfig(config);
  await el.updateComplete;
  return el;
}

const shadow = (el: EditorElement): ShadowRoot => {
  const root = el.shadowRoot;
  if (!root) throw new Error("editor rendered no shadow root");
  return root;
};

const text = (el: EditorElement): string =>
  (shadow(el).textContent ?? "").replace(/\s+/g, " ").trim();

const MODERN = "wiener-linien-austria-card-editor";
const RETRO = "wiener-linien-austria-retro-card-editor";
const FLAP = "wiener-linien-austria-flap-card-editor";

/** Each editor with a config its own normaliser accepts. Retro is the
 *  single-stop card, so its shape is flat. */
const EDITORS: ReadonlyArray<readonly [string, Record<string, unknown>]> = [
  [MODERN, { type: "custom:wiener-linien-austria-card", entities: [{ entity: ENTITY }] }],
  [RETRO, { type: "custom:wiener-linien-austria-retro-card", entity: ENTITY }],
  [FLAP, { type: "custom:wiener-linien-austria-flap-card", entities: [{ entity: ENTITY }] }],
];

describe("every editor renders", () => {
  it.each(EDITORS)("%s mounts and shows three tabs", async (tag, config) => {
    const el = await mount(tag, BUSY_STOP, config);
    expect(shadow(el).querySelectorAll('[role="tab"]')).toHaveLength(3);
    // The stop's name comes from the live sensor, so this also proves the
    // editor read `hass` rather than rendering a bare entity id.
    expect(text(el)).toContain("Westbahnhof");
  });

  it.each(EDITORS)("%s survives being given no hass", async (tag, config) => {
    // Lovelace constructs the editor before it assigns hass. Rendering has to
    // survive that gap; v1 shipped a card editor that threw in it.
    const el = await mount(tag, undefined, config);
    expect(shadow(el).querySelectorAll('[role="tab"]')).toHaveLength(3);
  });
});

describe("controls write back through config-changed", () => {
  it("toggling a line chip adds it to that stop's lines", async () => {
    const el = await mount(MODERN, BUSY_STOP, {
      type: "custom:wiener-linien-austria-card",
      entities: [{ entity: ENTITY }],
    });

    let config: Record<string, unknown> | undefined;
    el.addEventListener("config-changed", (ev) => {
      config = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    });

    // Chips are sorted, so the first is line "52".
    const chip = shadow(el).querySelector<HTMLButtonElement>(".wl-chip");
    expect(chip, "expected a line chip to be rendered").toBeTruthy();
    chip?.click();
    await el.updateComplete;

    expect(config).toBeDefined();
    expect(config?.["entities"]).toEqual([{ entity: ENTITY, lines: ["52"] }]);
  });

  it("a second toggle removes the key rather than leaving an empty array", async () => {
    // Saved YAML should never accumulate `lines: []`; the normaliser tidies to
    // absence, and this is the only place that contract is checked.
    const el = await mount(MODERN, BUSY_STOP, {
      type: "custom:wiener-linien-austria-card",
      entities: [{ entity: ENTITY, lines: ["52"] }],
    });

    let config: Record<string, unknown> | undefined;
    el.addEventListener("config-changed", (ev) => {
      config = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    });

    shadow(el).querySelector<HTMLButtonElement>(".wl-chip")?.click();
    await el.updateComplete;

    expect(config?.["entities"]).toEqual([{ entity: ENTITY }]);
  });
});

describe("edge states are reachable", () => {
  it("a stop whose entity is gone says so, and offers a way out", async () => {
    const el = await mount(MODERN, hassWith({}), {
      type: "custom:wiener-linien-austria-card",
      entities: [{ entity: "sensor.renamed_away" }],
    });
    const alert = shadow(el).querySelector("ha-alert");
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain("sensor.renamed_away");
    expect(shadow(el).querySelector("[slot=\"action\"]")).toBeTruthy();
  });

  it("a sensor that has not reported yet shows the empty state", async () => {
    const el = await mount(MODERN, hassWith({ stop_name: "Kalt", departures: [] }), {
      type: "custom:wiener-linien-austria-card",
      entities: [{ entity: ENTITY }],
    });
    const empty = shadow(el).querySelector(".wl-empty");
    expect(empty).toBeTruthy();
    // The empty state can only ever render inside a stop block, so a stop is
    // always already chosen and named in the header directly above it. That is
    // why its hint must describe what the sensor is doing rather than tell the
    // user to pick a stop — which is what it used to say.
    expect(shadow(el).querySelector(".wl-section-title")?.textContent).toContain("Kalt");
  });

  it("a line the API no longer reports keeps its chip, so it can be removed", async () => {
    // Dropping it stranded the config invisibly: the line stayed in the saved
    // YAML with no control able to clear it.
    const el = await mount(MODERN, BUSY_STOP, {
      type: "custom:wiener-linien-austria-card",
      entities: [{ entity: ENTITY, lines: ["U3", "GONE"] }],
    });
    const chips = [...shadow(el).querySelectorAll(".wl-chip")].map((c) =>
      (c.textContent ?? "").trim(),
    );
    expect(chips).toContain("GONE");
  });

  it("a one-way stop disables the other direction without hiding it", async () => {
    const oneWay = hassWith({
      stop_name: "Endstation",
      line_colors: { "49": "#E20D17" },
      departures: [
        { line: "49", direction: "H", towards: "Hütteldorf", type: "ptTram", countdown: 4 },
      ],
    });
    const el = await mount(MODERN, oneWay, {
      type: "custom:wiener-linien-austria-card",
      entities: [{ entity: ENTITY, lines: ["49"] }],
    });

    const dirs = [...shadow(el).querySelectorAll<HTMLElement>(".wl-dir")];
    expect(dirs.length).toBeGreaterThanOrEqual(2);
    // aria-disabled rather than the `disabled` attribute, so the option stays
    // in the tab order and can explain itself. Losing that is silent.
    const unavailable = dirs.filter((d) => d.getAttribute("aria-disabled") === "true");
    expect(unavailable.length).toBeGreaterThan(0);
    for (const d of unavailable) expect(d.hasAttribute("disabled")).toBe(false);
  });
});

describe("tablist ARIA matches the DOM it produces", () => {
  it.each(EDITORS)("%s only claims panels that exist", async (tag, config) => {
    const el = await mount(tag, BUSY_STOP, config);
    const root = shadow(el);

    // Exactly one panel is rendered at a time, so an aria-controls on an
    // inactive tab would name an id that is not in the document.
    expect(root.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);

    for (const tab of root.querySelectorAll('[role="tab"]')) {
      const controls = tab.getAttribute("aria-controls");
      if (tab.getAttribute("aria-selected") === "true") {
        expect(controls).toBeTruthy();
        expect(root.querySelector(`#${CSS.escape(controls!)}`)).toBeTruthy();
      } else {
        expect(controls).toBeNull();
      }
    }
  });

  it.each(EDITORS)("%s keeps exactly one tab in the tab order", async (tag, config) => {
    const el = await mount(tag, BUSY_STOP, config);
    const tabs = [...shadow(el).querySelectorAll('[role="tab"]')];
    expect(tabs.filter((t) => t.getAttribute("tabindex") === "0")).toHaveLength(1);
  });

  it("tab labels are ellipsable, so a long translation cannot break the bar", async () => {
    // German renders "Haltestellen" where English renders "Stops"; the label
    // needs its own element because clipping on the button would cut off the
    // underline's negative-margin bleed.
    const el = await mount(MODERN, BUSY_STOP, {
      type: "custom:wiener-linien-austria-card",
      entities: [{ entity: ENTITY }],
    });
    const labels = shadow(el).querySelectorAll(".wl-tab-label");
    expect(labels).toHaveLength(3);
    expect(labels[0]?.textContent?.trim()).toBe("Haltestellen");
  });
});
