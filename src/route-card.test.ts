/**
 * @vitest-environment happy-dom
 *
 * Component coverage for the route card and its editor.
 *
 * Same thin spirit as card-smoke.test.ts: registration, config guards, one
 * render per user-visible state, the disclosure's ARIA wiring, the editor's
 * write-back, and the token parity that keeps this card on the portfolio's
 * colour scheme. HA's own elements (ha-card, ha-icon, ha-form) stay undefined
 * — inert in the DOM, which is all the render path needs.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import cardStylesSource from "./card-styles.ts?raw";
import routeCardSource from "./wiener-linien-austria-route-card.ts?raw";

import "./wiener-linien-austria-route-card.js";
import "./route-editor.js";

import type { HomeAssistant, RouteTripAttr } from "./types.js";

const TAG = "wiener-linien-austria-route-card";
const ENTITY = "sensor.westbahnhof_praterstern_naechste_verbindung";

interface CardElement extends HTMLElement {
  hass: HomeAssistant | undefined;
  setConfig(config: Record<string, unknown>): void;
  updateComplete: Promise<unknown>;
}

function stop(name: string, time: string, platform: string | null = "1") {
  const iso = `2026-09-14T${time}:00+02:00`;
  return { name, stop_id: null, platform, planned: iso, estimated: iso, delay_minutes: 0 };
}

function trip(dep: string, arr: string, risk: RouteTripAttr["risk"] = "tight"): RouteTripAttr {
  return {
    departure: `2026-09-14T${dep}:00+02:00`,
    arrival: `2026-09-14T${arr}:00+02:00`,
    duration_minutes: 14,
    interchanges: 1,
    risk,
    cancelled: false,
    legs: [
      {
        walk: false, line: "U3", type: "ptMetro", product: "U-Bahn", towards: "Simmering",
        origin: { ...stop("Westbahnhof", dep), delay_minutes: 2 },
        destination: stop("Stephansplatz", "08:04"),
        realtime: true, stop_count: 5, duration_minutes: 7, walk_after_minutes: 4, cancelled: false,
      },
      {
        walk: false, line: "N31", type: "ptBusNight", product: "Nachtbus", towards: "Leopoldau",
        origin: stop("Stephansplatz", "08:08", null),
        destination: stop("Praterstern", arr),
        realtime: false, stop_count: 1, duration_minutes: 3, walk_after_minutes: 0, cancelled: false,
      },
    ],
    transfers: [{ at: "Stephansplatz", walk_minutes: 4, slack_minutes: risk === "at_risk" ? -2 : 0, risk }],
  };
}

function hass(state: string, attributes: Record<string, unknown>, language = "de"): HomeAssistant {
  return {
    language,
    themes: { darkMode: false },
    localize: (key: string) => key,
    states: { [ENTITY]: { entity_id: ENTITY, state, attributes } },
  } as unknown as HomeAssistant;
}

const ACTIVE = {
  origin: "Westbahnhof",
  destination: "Praterstern",
  active: true,
  trips: [trip("07:57", "08:11"), trip("08:00", "08:16", "ok"), trip("08:03", "08:19", "at_risk")],
  line_colors: { U3: { bg: "EF7C00", fg: "FFFFFF" } },
  traffic_info: [{ title: "U3: Verspätungen", related_lines: ["U3"] }],
};

async function mount(h: HomeAssistant | undefined, config: Record<string, unknown>): Promise<CardElement> {
  const el = document.createElement(TAG) as CardElement;
  document.body.appendChild(el);
  el.hass = h;
  el.setConfig({ type: `custom:${TAG}`, ...config });
  await el.updateComplete;
  return el;
}

const root = (el: HTMLElement): ShadowRoot => {
  if (!el.shadowRoot) throw new Error("no shadow root");
  return el.shadowRoot;
};
const text = (el: HTMLElement): string => (root(el).textContent ?? "").replace(/\s+/g, " ");

beforeEach(() => {
  document.body.innerHTML = "";
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-14T07:50:00+02:00"));
});

describe("registration + config", () => {
  it("defines the element and registers in the picker", () => {
    expect(customElements.get(TAG)).toBeTypeOf("function");
    const entry = (window as unknown as { customCards?: Array<Record<string, unknown>> })
      .customCards?.find((c) => c["type"] === TAG);
    expect(entry).toBeDefined();
    const suggest = entry?.["getEntitySuggestion"] as (h: HomeAssistant, e: string) => unknown;
    const withRegistry = {
      ...hass("2026-09-14T05:57:00+00:00", ACTIVE),
      entities: { [ENTITY]: { platform: "wiener_linien_austria" } },
    } as unknown as HomeAssistant;
    expect(suggest(withRegistry, ENTITY)).toEqual({
      config: { type: `custom:${TAG}`, entity: ENTITY },
    });
    expect(suggest(withRegistry, "light.x")).toBeNull();
    expect(suggest(hass("x", ACTIVE), ENTITY)).toBeNull();
  });

  it("stubs the first route entity", () => {
    const Card = customElements.get(TAG) as unknown as {
      getStubConfig(h: HomeAssistant): Record<string, unknown>;
    };
    expect(Card.getStubConfig(hass("x", ACTIVE))).toEqual({ entity: ENTITY });
    expect(Card.getStubConfig({ states: {} } as unknown as HomeAssistant)).toEqual({});
  });

  it("throws for configs Lovelace should show as an error card", () => {
    const el = document.createElement(TAG) as CardElement;
    expect(() => el.setConfig(undefined as never)).toThrow();
    expect(() => el.setConfig({ type: TAG, entity: "light.kitchen" })).toThrow();
  });
});

describe("rendering", () => {
  it("renders the best connection, its transfer and the alternatives", async () => {
    const el = await mount(hass("2026-09-14T05:57:00+00:00", ACTIVE), { entity: ENTITY });
    const t = text(el);
    expect(t).toContain("Westbahnhof → Praterstern");
    expect(t).toContain("Abfahrt in");
    expect(t).toContain("7 Minuten");
    expect(t).toContain("Gleis 1");
    expect(t).toContain("Richtung Simmering");
    expect(t).toContain("5 Stationen");
    expect(t).toContain("2 min später");
    expect(t).toContain("Umstieg Stephansplatz");
    expect(t).toContain("4 min Fußweg");
    expect(t).toContain("Knapp: 0 min Puffer");
    expect(t).toContain("U3: Verspätungen");
    expect(t).toContain("Datenquelle: Wiener Linien");

    const badge = root(el).querySelector<HTMLElement>(".line-badge");
    expect(badge?.style.background).toMatch(/ef7c00|239, 124, 0/i);
    // The nightline keeps its signage pairing off the shared ladder.
    const night = [...root(el).querySelectorAll<HTMLElement>(".line-badge")].find(
      (b) => b.textContent === "N31",
    );
    expect(night?.style.color).toMatch(/fef200|254, 242, 0/i);

    const risks = [...root(el).querySelectorAll(".risk")].map((r) => r.getAttribute("data-risk"));
    expect(risks).toContain("tight");
  });

  it("toggles the alternatives with matching ARIA state", async () => {
    const el = await mount(hass("x", ACTIVE), { entity: ENTITY });
    const button = root(el).querySelector<HTMLButtonElement>(".alt-toggle");
    const list = root(el).querySelector<HTMLElement>(".alt-list");
    expect(button?.getAttribute("aria-expanded")).toBe("false");
    expect(button?.getAttribute("aria-controls")).toBe(list?.id);
    expect(list?.hidden).toBe(true);
    expect(text(el)).toContain("Weitere Verbindungen (2)");
    button?.click();
    await el.updateComplete;
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    expect(list?.hidden).toBe(false);
    expect(text(el)).toContain("Anschluss gefährdet: 2 min zu wenig");
    expect(text(el)).toContain("08:00 bis 08:16, 1 Umstieg");
  });

  it("hides the alternatives and the credit when configured to", async () => {
    const el = await mount(hass("x", ACTIVE), {
      entity: ENTITY,
      alternatives: 0,
      hide_attribution: true,
      title: "Zur Arbeit",
    });
    expect(root(el).querySelector(".alt-toggle")).toBeNull();
    expect(text(el)).not.toContain("Datenquelle");
    expect(text(el)).toContain("Zur Arbeit");
  });

  it("drops a connection that has left and shows Jetzt at zero", async () => {
    vi.setSystemTime(new Date("2026-09-14T07:57:20+02:00"));
    const el = await mount(hass("x", ACTIVE), { entity: ENTITY });
    expect(text(el)).toContain("Jetzt");
    vi.setSystemTime(new Date("2026-09-14T07:59:00+02:00"));
    vi.advanceTimersByTime(15_000);
    await el.updateComplete;
    // 07:57 is gone; 08:00 leads now.
    expect(root(el).querySelector(".hero-times")?.textContent).toContain("08:00");
  });

  it.each([
    [{ entity: "" }, undefined, "Keine Verbindung ausgewählt"],
    [{ entity: ENTITY }, { states: {} }, "existiert nicht mehr"],
    [{ entity: ENTITY }, hass("unavailable", {}), "Routenplaner nicht erreichbar"],
    [
      { entity: ENTITY },
      hass("unknown", { ...ACTIVE, active: false, trips: [], active_window: { from: "06:30:00", to: "09:00:00", days: ["mon", "tue", "wed", "thu", "fri"] } }),
      "Aktualisiert Mo",
    ],
    [{ entity: ENTITY }, hass("unknown", { ...ACTIVE, trips: [] }), "Gerade keine Verbindung"],
  ])("empty state %#", async (config, h, expected) => {
    const el = await mount(
      (h ?? { states: {}, language: "de" }) as HomeAssistant,
      config,
    );
    expect(text(el)).toContain(expected);
    expect(root(el).querySelector('[role="status"]')).not.toBeNull();
  });

  it("speaks English when HA does", async () => {
    const el = await mount(hass("x", ACTIVE, "en"), { entity: ENTITY });
    expect(text(el)).toContain("Leave in");
    expect(text(el)).toContain("Tight: 0 min to spare");
  });

  it("stops ticking once removed", async () => {
    const el = await mount(hass("x", ACTIVE), { entity: ENTITY });
    const clear = vi.spyOn(globalThis, "clearInterval");
    el.remove();
    expect(clear).toHaveBeenCalled();
  });
});

describe("colour scheme parity", () => {
  it("uses the same semantic token values as the modern card", () => {
    const tokens = ["--wl-rt", "--wl-warning", "--wl-error", "--wl-radius-sm", "--wl-radius-md"];
    const read = (source: string): Record<string, string> => {
      return Object.fromEntries(
        tokens.map((token) => {
          const match = new RegExp(`${token}:\\s*([^;]+);`).exec(source);
          return [token, match?.[1]?.replace(/\s+/g, " ").trim() ?? ""];
        }),
      );
    };
    const modern = read(cardStylesSource);
    expect(modern["--wl-rt"]).not.toBe("");
    expect(read(routeCardSource)).toEqual(modern);
  });
});

describe("editor", () => {
  it("writes changes back without restating defaults", async () => {
    const el = document.createElement(`${TAG}-editor`) as CardElement;
    document.body.appendChild(el);
    el.hass = hass("x", ACTIVE);
    el.setConfig({ type: `custom:${TAG}`, entity: ENTITY });
    await el.updateComplete;
    const form = root(el).querySelector("ha-form");
    expect(form).not.toBeNull();

    let config: Record<string, unknown> | undefined;
    el.addEventListener("config-changed", (ev) => {
      config = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    });
    form?.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: { entity: ENTITY, title: "", alternatives: 1, hide_attribution: false } },
      }),
    );
    expect(config).toEqual({ type: `custom:${TAG}`, entity: ENTITY, alternatives: 1 });

    const labels = (form as unknown as { computeLabel(f: { name: string }): string }).computeLabel;
    expect(labels({ name: "alternatives" })).toBe("Weitere Verbindungen");
    const helper = (form as unknown as { computeHelper(f: { name: string }): string | undefined })
      .computeHelper;
    expect(helper({ name: "title" })).toContain("Start → Ziel");
  });

  it("renders nothing before it has a config", async () => {
    const el = document.createElement(`${TAG}-editor`) as CardElement;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(root(el).querySelector("ha-form")).toBeNull();
  });
});
