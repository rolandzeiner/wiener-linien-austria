// @vitest-environment happy-dom

// Every card fills its sections-view grid cell instead of painting over the
// card below it, and only there, so the add-card picker preview keeps its
// own height.
//
// A sections view gives the card a fixed-height cell whenever rows is
// numeric, which the user causes by dragging the height or width handle: a
// stored grid_options overrides getGridOptions(), so rows: "auto" exempts no
// one. Only the pair below makes the card take that height. It is gated on
// the layout attribute HA sets ("grid" in a sections view, "panel" in a
// panel view); the picker sets none and centres each preview in a tile as
// tall as the tallest one in its row, so an ungated 100% stretches the
// preview down to it. The selectors match only while the card reflects its
// `layout` property.
//
// happy-dom does no layout, so the guard reads the CSS text.

import { describe, expect, it } from "vite-plus/test";

import type { CSSResult, ReactiveElement } from "lit";

import { isFixedHeight } from "./utils.js";
import "./wiener-linien-austria-card.js";
import "./wiener-linien-austria-retro-card.js";
import "./wiener-linien-austria-flap-card.js";
import "./wiener-linien-austria-route-card.js";

const CARDS = [
  "wiener-linien-austria-card",
  "wiener-linien-austria-retro-card",
  "wiener-linien-austria-flap-card",
  "wiener-linien-austria-route-card",
];

const GRID_HOST = ':host([layout="grid"]), :host([layout="panel"])';
const GRID_CARD = ':host([layout="grid"]) ha-card, :host([layout="panel"]) ha-card';

function cardClass(tag: string): typeof ReactiveElement {
  const cls = customElements.get(tag) as typeof ReactiveElement | undefined;
  if (!cls) throw new Error(`${tag} is not defined`);
  return cls;
}

/** Top-level rules of the card's stylesheets as selector → declarations,
 *  comments dropped and whitespace collapsed. */
function rules(tag: string): Map<string, string> {
  const css = cardClass(tag)
    .elementStyles.map((s) => (s as CSSResult).cssText)
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Map<string, string>();
  for (const m of css.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)) {
    const selector = m[1]!.replace(/\s+/g, " ").trim();
    out.set(selector, (out.get(selector) ?? "") + m[2]!);
  }
  return out;
}

describe.each(CARDS)("%s in a grid cell", (tag) => {
  it("reflects the layout HA sets", () => {
    expect(cardClass(tag).getPropertyOptions("layout").reflect).toBe(true);
  });

  it("takes the cell's height on the host and on ha-card in grid and panel layouts", () => {
    const r = rules(tag);
    expect(r.get(GRID_HOST)).toMatch(/block-size:\s*100%/);
    expect(r.get(GRID_CARD)).toMatch(/block-size:\s*100%/);
  });

  it("is a block on the host and never fills ungated", () => {
    const r = rules(tag);
    expect(r.get(":host")).toMatch(/display:\s*block/);
    expect(r.get(":host")).not.toMatch(/block-size|(?<![-\w])height:\s*100%/);
    expect(r.get("ha-card") ?? "").not.toMatch(/block-size|(?<![-\w])height:\s*100%/);
  });
});

describe("layout reaches the attribute", () => {
  it.each(CARDS)("%s writes layout to the host", async (tag) => {
    const el = document.createElement(tag) as ReactiveElement & {
      layout?: string;
      setConfig(c: Record<string, unknown>): void;
    };
    el.setConfig(
      tag.endsWith("route-card")
        ? { type: `custom:${tag}`, from: 60201468, to: 60201040 }
        : { type: `custom:${tag}`, entity: "sensor.wl_stop" },
    );
    document.body.append(el);
    el.layout = "grid";
    await el.updateComplete;
    expect(el.getAttribute("layout")).toBe("grid");
    el.remove();
  });
});

describe("isFixedHeight", () => {
  it("is fixed only in a sections cell with a numeric row count", () => {
    expect(isFixedHeight(undefined, {}, 4)).toBe(false);
    expect(isFixedHeight("panel", {}, 4)).toBe(false);
    expect(isFixedHeight("grid", {}, "auto")).toBe(false);
    expect(isFixedHeight("grid", {}, undefined)).toBe(false);
  });

  it("takes the default rows when nothing is stored: the fresh-dashboard case", () => {
    expect(isFixedHeight("grid", {}, 4)).toBe(true);
    expect(isFixedHeight("grid", undefined, 4)).toBe(true);
  });

  it("lets a stored row count win over the default, either way", () => {
    expect(isFixedHeight("grid", { grid_options: { rows: 3 } }, "auto")).toBe(true);
    expect(isFixedHeight("grid", { grid_options: { rows: "auto" } }, 4)).toBe(false);
    expect(isFixedHeight("grid", { grid_options: { columns: 6 } }, "auto")).toBe(false);
  });
});

describe("fixed-height class", () => {
  it.each(CARDS)("%s scrolls inside a cell with a set row count only", async (tag) => {
    const base = tag.endsWith("route-card")
      ? { type: `custom:${tag}`, from: 60201468, to: 60201040 }
      : { type: `custom:${tag}`, entity: "sensor.wl_stop" };
    const el = document.createElement(tag) as ReactiveElement & {
      layout?: string;
      hass?: unknown;
      setConfig(c: Record<string, unknown>): void;
    };
    el.hass = {
      language: "de",
      themes: { darkMode: false },
      localize: (k: string) => k,
      states: {},
    };
    el.setConfig({ ...base, grid_options: { rows: 3 } });
    document.body.append(el);
    const card = () => el.shadowRoot?.querySelector("ha-card");

    el.layout = "grid";
    await el.updateComplete;
    expect(card()?.classList.contains("fixed-height")).toBe(true);

    el.layout = "masonry";
    await el.updateComplete;
    expect(card()?.classList.contains("fixed-height")).toBe(false);
    el.remove();
  });
});

describe("edit-dialog preview", () => {
  it.each(CARDS)("%s shows the version banner on the dashboard, not in the editor", async (tag) => {
    const el = document.createElement(tag) as ReactiveElement & {
      preview: boolean;
      hass?: unknown;
      setConfig(c: Record<string, unknown>): void;
    };
    el.hass = {
      language: "de",
      themes: { darkMode: false },
      localize: (k: string) => k,
      states: {},
    };
    el.setConfig(
      tag.endsWith("route-card")
        ? { type: `custom:${tag}`, from: 60201468, to: 60201040 }
        : { type: `custom:${tag}`, entity: "sensor.wl_stop" },
    );
    document.body.append(el);
    // The mismatch the version check sets when the browser holds old JS.
    (el as unknown as { _versionMismatch: string })._versionMismatch = "9.9.9";
    el.requestUpdate();
    await el.updateComplete;
    const banner = () => el.shadowRoot?.querySelector('[role="alert"]');
    expect(banner()?.textContent).toContain("9.9.9");

    el.preview = true;
    await el.updateComplete;
    expect(banner()).toBeNull();
    el.remove();
  });
});

describe("retro board minimum width", () => {
  // Measured per LED size: the narrowest cell that still shows about five
  // letters of the destination beside a timetable and a step-free icon.
  it.each([
    ["small", 7],
    ["medium", 9],
    ["regular", 11],
  ] as const)("%s needs %i columns", (size, columns) => {
    const el = document.createElement("wiener-linien-austria-retro-card") as ReactiveElement & {
      setConfig(c: Record<string, unknown>): void;
      getGridOptions(): { min_columns: number };
    };
    el.setConfig({ type: "custom:wiener-linien-austria-retro-card", entity: "sensor.x", size });
    expect(el.getGridOptions().min_columns).toBe(columns);
  });

  it("defaults to the regular size's minimum", () => {
    const el = document.createElement("wiener-linien-austria-retro-card") as ReactiveElement & {
      setConfig(c: Record<string, unknown>): void;
      getGridOptions(): { min_columns: number };
    };
    el.setConfig({ type: "custom:wiener-linien-austria-retro-card", entity: "sensor.x" });
    expect(el.getGridOptions().min_columns).toBe(11);
  });
});
