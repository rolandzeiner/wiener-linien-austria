// @vitest-environment happy-dom

// The hass filter in BoardEditor.shouldUpdate. `hass` is reassigned for every
// state change anywhere in HA, so the editors only re-render when an entity
// they show actually changed. Nothing else exercises a second `hass`
// assignment: the smoke tests mount once and read the first render.
//
// A skipped render is invisible in the DOM unless something else on the
// screen would have changed, so these tests switch the language along with
// the states: the tab labels follow `hass.language`, which makes a re-render
// visible as German labels turning English.

import { describe, expect, it } from "vitest";

import "../editor.js";
import "../retro-editor.js";

import type { HomeAssistant } from "../types.js";

interface EditorElement extends HTMLElement {
  hass: HomeAssistant | undefined;
  setConfig(config: Record<string, unknown>): void;
  updateComplete: Promise<unknown>;
}

const STOP = "sensor.westbahnhof_abfahrten";
const OTHER = "sensor.somewhere_else";

type States = Record<string, { entity_id: string; state: string; attributes: object }>;

const stateOf = (entity: string, value: string): States[string] => ({
  entity_id: entity,
  state: value,
  attributes: { stop_name: "Westbahnhof", departures: [] },
});

function hass(language: string, states: States): HomeAssistant {
  return {
    language,
    themes: { darkMode: false },
    localize: (key: string) => key,
    states,
  } as unknown as HomeAssistant;
}

async function mount(tag: string, config: Record<string, unknown>, h: HomeAssistant) {
  const el = document.createElement(tag) as EditorElement;
  document.body.appendChild(el);
  el.hass = h;
  el.setConfig(config);
  await el.updateComplete;
  return el;
}

async function assign(el: EditorElement, h: HomeAssistant | undefined): Promise<void> {
  el.hass = h;
  await el.updateComplete;
}

const firstTab = (el: EditorElement): string =>
  el.shadowRoot?.querySelector(".wl-tab-label")?.textContent?.trim() ?? "";

const MODERN = "wiener-linien-austria-card-editor";
const RETRO = "wiener-linien-austria-retro-card-editor";
const MODERN_CFG = { type: "custom:wiener-linien-austria-card", entities: [{ entity: STOP }] };

describe("BoardEditor re-renders on hass only when it has to", () => {
  it("renders nothing until it has a config", async () => {
    const el = document.createElement(MODERN) as EditorElement;
    document.body.appendChild(el);
    el.hass = hass("de", {});
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".wl-editor")).toBeNull();
  });

  it("skips a hass update that leaves the watched entity alone", async () => {
    const stop = stateOf(STOP, "3");
    const el = await mount(MODERN, MODERN_CFG, hass("de", { [STOP]: stop }));
    expect(firstTab(el)).toBe("Haltestellen");

    // Same state object for the stop, a changed one elsewhere.
    await assign(el, hass("en", { [STOP]: stop, [OTHER]: stateOf(OTHER, "1") }));
    expect(firstTab(el)).toBe("Haltestellen");
  });

  it("re-renders when the watched entity changes", async () => {
    const el = await mount(MODERN, MODERN_CFG, hass("de", { [STOP]: stateOf(STOP, "3") }));
    await assign(el, hass("en", { [STOP]: stateOf(STOP, "4") }));
    expect(firstTab(el)).toBe("Stops");
  });

  it.each([
    ["modern with no stops", MODERN, { type: "custom:wiener-linien-austria-card", entities: [] }],
    ["retro with no stop", RETRO, { type: "custom:wiener-linien-austria-retro-card" }],
  ])("re-renders on every hass update for %s", async (_label, tag, config) => {
    // Nothing to compare against, and the entity picker on screen takes its
    // options from hass.
    const el = await mount(tag, config, hass("de", {}));
    await assign(el, hass("en", { [OTHER]: stateOf(OTHER, "1") }));
    expect(firstTab(el)).toBe(tag === RETRO ? "Stop" : "Stops");
  });

  it("re-renders when hass goes away", async () => {
    const el = await mount(MODERN, MODERN_CFG, hass("en", { [STOP]: stateOf(STOP, "3") }));
    await assign(el, undefined);
    // Without hass the translator falls back to its default language.
    expect(firstTab(el)).toBe("Haltestellen");
  });
});
