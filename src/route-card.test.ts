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

import { ROUTE_CARD_VERSION } from "./const.js";
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
  fetched_at: "2026-09-14T05:48:00+00:00",
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

/** happy-dom here leaves `window.localStorage` undefined, so hand the card an
 *  in-memory one per test. The card itself treats a missing store as "don't
 *  remember", which the first ad-hoc test exercises implicitly. */
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, String(value)),
  };
}

beforeEach(() => {
  document.body.innerHTML = "";
  Object.defineProperty(window, "localStorage", { value: memoryStorage(), configurable: true });
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
    expect(() => el.setConfig({ type: TAG, from: "Westbahnhof" })).toThrow(/stop number/);
    expect(() => el.setConfig({ type: TAG, from: 60201468, to: "60201040" })).not.toThrow();
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

  it("says when the connections were last updated, in Vienna time", async () => {
    const el = await mount(hass("x", ACTIVE), { entity: ENTITY });
    const updated = root(el).querySelector(".updated time");
    expect(updated?.textContent).toContain("Zuletzt aktualisiert 07:48");
    expect(updated?.getAttribute("datetime")).toBe(ACTIVE.fetched_at);

    const never = await mount(hass("unknown", { ...ACTIVE, fetched_at: null, trips: [] }), {
      entity: ENTITY,
    });
    expect(root(never).querySelector(".updated")).toBeNull();
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

  it("names a departure board picked as the entity", async () => {
    const board = {
      language: "de",
      states: { [ENTITY]: { state: "3", attributes: { diva: 1, departures: [], next_by_line: {} } } },
    } as unknown as HomeAssistant;
    const el = await mount(board, { entity: ENTITY });
    expect(text(el)).toContain("Das ist ein Abfahrtsmonitor, keine Verbindung");
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

// ---------------------------------------------------------------------------
// Ad-hoc mode
// ---------------------------------------------------------------------------

const WESTBAHNHOF = "60201468";
const PRATERSTERN = "60201040";
const STOPS = [
  { value: WESTBAHNHOF, label: "Westbahnhof (Wien) — 450 m" },
  { value: PRATERSTERN, label: "Praterstern (Wien)" },
];
const PLAN = { ...ACTIVE, fetched_at: "2026-09-14T05:49:00+00:00" };

type WsMessage = { type: string; origin?: number; destination?: number };

function adhocHass(plan: (msg: WsMessage) => Promise<unknown> = async () => PLAN) {
  const callWS = vi.fn(async (msg: WsMessage) => {
    if (msg.type === "wiener_linien_austria/stops") return { stops: STOPS };
    if (msg.type === "wiener_linien_austria/plan") return plan(msg);
    return { version: ROUTE_CARD_VERSION };
  });
  const h = { language: "de", states: {}, localize: (k: string) => k, callWS } as unknown as HomeAssistant;
  return { h, callWS };
}

const planCalls = (callWS: ReturnType<typeof vi.fn>): WsMessage[] =>
  callWS.mock.calls.map((c) => c[0] as WsMessage).filter((m) => m.type === "wiener_linien_austria/plan");

async function settle(el: CardElement, ms = 0): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  await el.updateComplete;
}

function remember(from: string, to: string): void {
  window.localStorage.setItem("wiener-linien-austria-route-adhoc", JSON.stringify({ from, to }));
}

describe("ad-hoc mode", () => {
  it("asks for both stops and offers the native fallback while HA's picker loads", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Verbindung suchen");
    expect(text(el)).toContain("Wähle Start und Ziel");
    const inputs = root(el).querySelectorAll<HTMLInputElement>(".fallback input");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]?.getAttribute("list")).toBe("wl-adhoc-stops");
    expect(root(el).querySelectorAll("#wl-adhoc-stops option")).toHaveLength(2);
    expect(root(el).querySelector("legend")?.textContent).toContain("Start und Ziel");
    expect(root(el).querySelector('.swap[aria-label="Start und Ziel tauschen"]')).not.toBeNull();
    expect(planCalls(callWS)).toHaveLength(0);
    // Nothing chosen, nothing fetched, nothing to date.
    expect(root(el).querySelector(".updated")).toBeNull();
  });

  it("restores the last pick on this device and plans it", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass();
    const el = await mount(h, { from: PRATERSTERN, to: WESTBAHNHOF });
    await settle(el);
    expect(planCalls(callWS)).toEqual([
      { type: "wiener_linien_austria/plan", origin: 60201468, destination: 60201040 },
    ]);
    expect(text(el)).toContain("Abfahrt in");
    expect(text(el)).toContain("Umstieg Stephansplatz");
    expect(text(el)).toContain("Zuletzt aktualisiert 07:49");
    // A plan that wasn't asked for right now isn't announced.
    expect(root(el).querySelector('p[role="status"]')?.textContent).toBe("");
    const inputs = root(el).querySelectorAll<HTMLInputElement>(".fallback input");
    expect(inputs[0]?.value).toBe("Westbahnhof (Wien) — 450 m");
  });

  it("falls back to the card's defaults without a remembered pick", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, { from: WESTBAHNHOF, to: PRATERSTERN });
    await settle(el);
    expect(planCalls(callWS)[0]?.origin).toBe(60201468);
  });

  it("plans a pick after the debounce, remembers it and announces the answer", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const [from, to] = root(el).querySelectorAll<HTMLInputElement>(".fallback input");
    from!.value = "Westbahnhof (Wien) — 450 m";
    from!.dispatchEvent(new Event("change"));
    to!.value = "Praterstern (Wien)";
    to!.dispatchEvent(new Event("change"));
    await settle(el, 399);
    expect(planCalls(callWS)).toHaveLength(0);
    await settle(el, 1);
    expect(planCalls(callWS)).toHaveLength(1);
    await settle(el);
    expect(root(el).querySelector('p[role="status"]')?.textContent).toContain(
      "Abfahrt in 6 Minuten. 07:57 bis 08:11, 1 Umstieg",
    );
    expect(JSON.parse(window.localStorage.getItem("wiener-linien-austria-route-adhoc")!)).toEqual({
      from: WESTBAHNHOF,
      to: PRATERSTERN,
    });
  });

  it("flags text that matches no stop instead of planning it", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const from = root(el).querySelector<HTMLInputElement>(".fallback input")!;
    from.value = "Westbhf";
    from.dispatchEvent(new Event("change"));
    await settle(el, 500);
    const input = root(el).querySelector<HTMLInputElement>(".fallback input")!;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const errorId = input.getAttribute("aria-describedby");
    expect(root(el).getElementById(errorId!)?.textContent).toContain("Keine passende Haltestelle");
    expect(planCalls(callWS)).toHaveLength(0);
  });

  it("swaps the two stops and plans the reverse", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    root(el).querySelector<HTMLButtonElement>(".swap")!.click();
    await settle(el, 400);
    expect(planCalls(callWS).at(-1)).toMatchObject({ origin: 60201040, destination: 60201468 });
  });

  it("explains the same stop twice without asking the backend", async () => {
    remember(WESTBAHNHOF, WESTBAHNHOF);
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Start und Ziel sind dieselbe Haltestelle");
    expect(planCalls(callWS)).toHaveLength(0);
  });

  it("refreshes on its cadence only while visible", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    expect(planCalls(callWS)).toHaveLength(1);
    await settle(el, 120_000);
    expect(planCalls(callWS)).toHaveLength(2);

    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    await settle(el, 600_000);
    expect(planCalls(callWS)).toHaveLength(2);
    visibility.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    await settle(el);
    expect(planCalls(callWS)).toHaveLength(3);
    visibility.mockRestore();
  });

  it("pauses after half an hour without interaction and resumes on request", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    await settle(el, 32 * 60_000);
    const before = planCalls(callWS).length;
    // One initial plan plus one per 120 s until the half hour is up.
    expect(before).toBeLessThanOrEqual(17);
    expect(text(el)).toContain("Aktualisierung pausiert");
    await settle(el, 60 * 60_000);
    expect(planCalls(callWS)).toHaveLength(before);

    root(el).querySelector<HTMLButtonElement>(".paused button")!.click();
    await settle(el);
    expect(planCalls(callWS)).toHaveLength(before + 1);
    expect(text(el)).not.toContain("Aktualisierung pausiert");
  });

  it("waits out a rate limit for as long as the backend says", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    let limited = true;
    const { h, callWS } = adhocHass(async () => {
      if (limited) {
        throw { code: "rate_limited", translation_placeholders: { retry_after: "30" } };
      }
      return PLAN;
    });
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Gerade zu viele Abfragen");
    expect(text(el)).toContain("Neuer Versuch in 30 s");
    limited = false;
    await settle(el, 30_000);
    expect(planCalls(callWS)).toHaveLength(2);
    expect(text(el)).toContain("Abfahrt in");
  });

  it("drops the plan when the trip planner fails, and doesn't retry what can't succeed", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass(async () => {
      throw { code: "not_loaded" };
    });
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Wiener Linien Austria ist nicht geladen");
    await settle(el, 600_000);
    expect(planCalls(callWS)).toHaveLength(1);
  });

  it("stops every timer once removed", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    el.remove();
    await vi.advanceTimersByTimeAsync(600_000);
    expect(planCalls(callWS)).toHaveLength(1);
  });

  it("uses HA's own picker once it is defined", async () => {
    if (!customElements.get("ha-selector")) {
      customElements.define("ha-selector", class extends HTMLElement {});
    }
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const pickers = root(el).querySelectorAll("ha-selector");
    expect(pickers).toHaveLength(2);
    expect(root(el).querySelector(".fallback")).toBeNull();
    const selector = (pickers[0] as unknown as { selector: { select: { options: unknown[] } } })
      .selector;
    expect(selector.select.options).toEqual(STOPS);
    expect((pickers[0] as unknown as { label: string }).label).toBe("Von");

    pickers[0]!.dispatchEvent(new CustomEvent("value-changed", { detail: { value: WESTBAHNHOF } }));
    pickers[1]!.dispatchEvent(new CustomEvent("value-changed", { detail: { value: PRATERSTERN } }));
    await settle(el, 400);
    expect(planCalls(callWS)).toHaveLength(1);
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

  it("offers only route sensors and links to route setup when there are none", async () => {
    const el = document.createElement(`${TAG}-editor`) as CardElement;
    document.body.appendChild(el);
    const mixed = hass("x", ACTIVE);
    (mixed.states as Record<string, unknown>)["sensor.taubstummengasse_abfahrten"] = {
      state: "3",
      attributes: { diva: 1, departures: [], next_by_line: {} },
    };
    el.hass = mixed;
    el.setConfig({ type: `custom:${TAG}` });
    await el.updateComplete;
    const form = root(el).querySelector("ha-form") as unknown as {
      schema: Array<{ name: string; selector: { entity?: { include_entities: string[] } } }>;
    };
    expect(form.schema[0]?.selector.entity?.include_entities).toEqual([ENTITY]);
    expect(root(el).querySelector("ha-alert")).toBeNull();

    el.hass = { states: {}, language: "de" } as unknown as HomeAssistant;
    await el.updateComplete;
    const alert = root(el).querySelector("ha-alert");
    expect(alert?.textContent).toContain("Noch keine Verbindung eingerichtet");
    expect(alert?.querySelector("a")?.getAttribute("href")).toContain(
      "config_flow_start?domain=wiener_linien_austria",
    );
  });

  it("offers default stops when no route is picked, and drops them for a route", async () => {
    const el = document.createElement(`${TAG}-editor`) as CardElement;
    document.body.appendChild(el);
    el.hass = adhocHass().h;
    el.setConfig({ type: `custom:${TAG}` });
    await el.updateComplete;
    await vi.advanceTimersByTimeAsync(0);
    await el.updateComplete;
    const form = root(el).querySelector("ha-form") as unknown as {
      schema: Array<{ name: string; required?: boolean }>;
    };
    expect(form.schema.map((f) => f.name)).toEqual([
      "entity", "from", "to", "title", "alternatives", "hide_attribution",
    ]);
    expect(form.schema[0]?.required).toBeUndefined();

    let config: Record<string, unknown> | undefined;
    el.addEventListener("config-changed", (ev) => {
      config = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    });
    const formEl = root(el).querySelector("ha-form")!;
    formEl.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { from: WESTBAHNHOF, to: "" } } }),
    );
    expect(config).toEqual({ type: `custom:${TAG}`, from: WESTBAHNHOF, alternatives: 2 });

    formEl.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { entity: ENTITY, from: WESTBAHNHOF } } }),
    );
    expect(config).toEqual({ type: `custom:${TAG}`, entity: ENTITY, alternatives: 2 });
  });

  it("renders nothing before it has a config", async () => {
    const el = document.createElement(`${TAG}-editor`) as CardElement;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(root(el).querySelector("ha-form")).toBeNull();
  });
});
