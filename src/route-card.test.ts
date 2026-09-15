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
import { pickerText } from "./localize/localize.js";
import type { HomeAssistant, RouteAccessStepAttr, RouteTripAttr } from "./types.js";

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

/** "07:57" plus `minutes`, as "07:59". */
function later(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h! * 60 + m! + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
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
        origin: {
          ...stop("Westbahnhof", dep),
          stop_id: "60201468",
          estimated: stop("Westbahnhof", later(dep, 2)).planned,
          delay_minutes: 2,
        },
        destination: stop("Stephansplatz", "08:04"),
        direction: "H",
        stops: [
          { name: "Zieglergasse", stop_id: "60201530", time: `2026-09-14T${dep}:00+02:00` },
          { name: "Neubaugasse", stop_id: "60200056", time: "2026-09-14T07:59:00+02:00" },
        ],
        realtime: true, stop_count: 5, duration_minutes: 7, walk_after_minutes: 4, cancelled: false,
      },
      {
        walk: false, line: "N31", type: "ptBusNight", product: "Nachtbus", towards: "Leopoldau",
        origin: stop("Stephansplatz", "08:08", null),
        destination: stop("Praterstern", arr),
        realtime: false, stop_count: 1, duration_minutes: 3, walk_after_minutes: 0, cancelled: false,
        headway_minutes: 10, next_departures: ["2026-09-14T08:18:00+02:00", "2026-09-14T08:28:40+02:00"],
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

/** happy-dom here leaves `window.localStorage` undefined, so `beforeEach`
 *  hands the card a fresh in-memory one per test. Every test therefore starts
 *  with an empty store, never a missing one; the missing-store path (private
 *  mode, blocked storage) is the `?.` and `try` in utils/route.ts's
 *  `loadAdhocSelection` / `saveAdhocSelection`. */
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

  it("sizes to content in sections view", () => {
    const el = document.createElement(TAG) as CardElement & {
      getGridOptions(): Record<string, unknown>;
    };
    // No `rows`: the HA docs' way to let the card size itself.
    expect(el.getGridOptions()).toEqual({ columns: 6, min_columns: 4 });
  });

  it("throws for configs Lovelace should show as an error card", () => {
    const el = document.createElement(TAG) as CardElement;
    expect(() => el.setConfig(undefined as never)).toThrow();
    expect(() => el.setConfig({ type: TAG, entity: "light.kitchen" })).toThrow();
    expect(() => el.setConfig({ type: TAG, from: "Westbahnhof" })).toThrow(/stop number/);
    expect(() => el.setConfig({ type: TAG, from: 60201468, to: "60201040" })).not.toThrow();
  });
});

describe("card picker text", () => {
  it("follows the page language HA sets, then the stored pick", () => {
    document.documentElement.lang = "de-AT";
    expect(pickerText("picker_route")).toBe("Nächste Verbindung von A nach B, mit Puffer beim Umsteigen");
    document.documentElement.lang = "en";
    expect(pickerText("picker_route")).toBe("Next connection from A to B, with time to spare at each change");
    document.documentElement.lang = "";
    window.localStorage.setItem("selectedLanguage", JSON.stringify("de"));
    expect(pickerText("picker_modern")).toBe("Abfahrten mit Störungen und Aufzugsinfos");
    // A corrupt stored value falls through to the browser language, never throws.
    window.localStorage.setItem("selectedLanguage", "{");
    expect(() => pickerText("picker_flap")).not.toThrow();
  });
});

describe("live state and frequency", () => {
  it("marks an on-time live ride at its time and says how often a frequent line runs", async () => {
    const base = trip("07:57", "08:11");
    const onTime = {
      ...base,
      legs: [
        { ...base.legs[0]!, origin: { ...base.legs[0]!.origin, estimated: base.legs[0]!.origin.planned, delay_minutes: 0 }, headway_minutes: 3,
          next_departures: ["2026-09-14T08:00:00+02:00"] },
        base.legs[1]!,
      ],
    };
    const el = await mount(hass("x", { ...ACTIVE, trips: [onTime] }), { entity: ENTITY });
    const first = root(el).querySelector(".strand .leg")!;
    expect(first.querySelector(".stop .live-mark")).not.toBeNull();
    expect(first.querySelector(".stop .delay")).toBeNull();
    expect(first.querySelector(".stop")?.textContent).toContain("Echtzeit");
    expect(first.querySelector(".ride-frequency")?.textContent?.trim()).toBe("alle 3 min");
    // A ride that isn't live gets neither mark.
    const second = root(el).querySelectorAll(".strand .leg")[1]!;
    expect(second.querySelector(".live-mark, .delay")).toBeNull();
    // The hero drops "unterwegs".
    expect(root(el).querySelector(".hero-sub")?.textContent).toBe("14 min, 1 Umstieg");
  });
});

describe("a change that no longer fits", () => {
  it("names the next departure that can still be reached", async () => {
    const el = await mount(hass("x", { ...ACTIVE, trips: [trip("07:57", "08:11", "at_risk")] }), {
      entity: ENTITY,
    });
    // Arrive 08:04, walk 4 min: the 08:08 is gone, the 08:18 isn't.
    expect(root(el).querySelector(".transfer .catchable")?.textContent?.trim()).toBe(
      "Nächster erreichbar: 08:18",
    );
  });

  it("stays quiet for a change that still fits", async () => {
    const el = await mount(hass("x", ACTIVE), { entity: ENTITY });
    expect(root(el).querySelector(".transfer .catchable")).toBeNull();
  });
});

describe("last connection", () => {
  it("shows the night's last connection until it leaves", async () => {
    const attrs = {
      ...ACTIVE,
      trips: [...ACTIVE.trips, trip("08:10", "08:25")],
      last_connection: trip("08:03", "08:19"),
    };
    const el = await mount(hass("2026-09-14T05:50:00+00:00", attrs), { entity: ENTITY });
    const line = root(el).querySelector(".last-connection");
    expect(line?.textContent?.replace(/\s+/g, " ")).toContain(
      "Letzte Verbindung ohne Nachtbus 08:03 U3N31",
    );
    // 08:03 has left; the later connections keep the trip list on screen.
    vi.setSystemTime(new Date("2026-09-14T08:03:40+02:00"));
    await vi.advanceTimersByTimeAsync(15_000);
    await el.updateComplete;
    expect(root(el).querySelector(".last-connection")).toBeNull();
  });
});

describe("stops along a ride", () => {
  it("opens a ride's stops on its rail and keeps them open through a refresh", async () => {
    const h = hass("2026-09-14T05:50:00+00:00", ACTIVE);
    const el = await mount(h, { entity: ENTITY });
    const toggle = root(el).querySelector<HTMLButtonElement>(".strand .stops-toggle")!;
    expect(toggle.textContent).toContain("5 Stationen");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    const list = root(el).getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(list.hidden).toBe(true);
    expect(list.getAttribute("aria-label")).toBe("Stationen dazwischen, U3");

    toggle.click();
    await el.updateComplete;
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(list.hidden).toBe(false);
    expect(
      [...list.querySelectorAll(".leg-stop")].map((li) => li.textContent?.replace(/\s+/g, " ").trim()),
    ).toEqual(["07:57 Zieglergasse", "07:59 Neubaugasse"]);

    // A new plan for the same ride keeps the list open.
    el.hass = hass("2026-09-14T05:51:00+00:00", { ...ACTIVE, fetched_at: "2026-09-14T05:51:00+00:00" });
    await el.updateComplete;
    expect(root(el).querySelector(".strand .stops-toggle")?.getAttribute("aria-expanded")).toBe("true");

    // A ride without a stop list keeps its plain count.
    expect(root(el).querySelectorAll(".strand .stops-toggle")).toHaveLength(1);
    expect(text(el)).toContain("1 Station");
  });
});

describe("step-free", () => {
  function stepFreeTrip(): RouteTripAttr {
    const base = trip("07:57", "08:11");
    const lift = (level: string, stop: string): RouteAccessStepAttr => ({
      kind: "elevator",
      level,
      stop_id: stop,
    });
    const walk = (at: string, access: RouteAccessStepAttr[]) => ({
      ...base.legs[0]!, walk: true, line: null, type: "walk", towards: null,
      origin: stop("Westbahnhof", at), destination: stop("Westbahnhof", at),
      realtime: false, stop_count: 0, headway_minutes: null, next_departures: [],
      low_floor: false, access,
    });
    return {
      ...base,
      legs: [
        walk("07:54", [lift("down", "60201468")]),
        { ...base.legs[0]!, low_floor: true },
        { ...base.legs[1]!, low_floor: true },
        walk("08:11", [lift("up", "60201040"), { kind: "teleporter", level: null, stop_id: null }]),
      ],
      transfers: [{ ...base.transfers[0]!, access: [lift("up", "60201320")] }],
    };
  }

  it("names every lift, flags an outage and marks low-floor rides", async () => {
    const attrs = {
      ...ACTIVE,
      step_free: true,
      trips: [stepFreeTrip()],
      traffic_info: [],
      elevator_info: [{ station: "Stephansplatz", stop_ids: ["60201320"] }],
    };
    const el = await mount(hass("2026-09-14T05:50:00+00:00", attrs), { entity: ENTITY });
    const t = text(el);
    expect(t).toContain("Aufzug nach unten");
    expect(t).toContain("Aufzug nach oben · außer Betrieb");
    expect(t).toContain("Aufzug außer Betrieb: Stephansplatz");
    expect(t).toContain("Niederflurfahrzeug");
    // An icon name MDI doesn't have renders as an empty 24px box, which
    // showed up as a gap before "Richtung …" on every low-floor ride.
    const ride = root(el).querySelector(".ride")!;
    expect(ride.querySelector('ha-icon[icon="mdi:wheelchair-accessibility"]')).not.toBeNull();
    // A step kind the card has no words for is left out, not shown raw.
    expect(t).not.toContain("teleporter");
    expect(root(el).querySelectorAll(".access--out")).toHaveLength(1);
  });

  it("sends step_free from the card config in ad-hoc mode", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass();
    const el = await mount(h, { step_free: true });
    await settle(el);
    expect(planCalls(callWS)[0]).toMatchObject({ step_free: true });
  });
});

describe("map links", () => {
  const links = (el: HTMLElement): HTMLAnchorElement[] => [
    ...root(el).querySelectorAll<HTMLAnchorElement>(".strand a.map-link"),
  ];

  it("links each boarding stop, arrival and the destination to the city map, or a search without coordinates", async () => {
    const base = trip("07:57", "08:11");
    const first = base.legs[0]!;
    const located = {
      ...base,
      legs: [
        { ...first, origin: { ...first.origin, latitude: 48.1966562, longitude: 16.3376511 } },
        base.legs[1]!,
      ],
    };
    const el = await mount(hass("2026-09-14T05:50:00+00:00", { ...ACTIVE, trips: [located] }), {
      entity: ENTITY,
    });
    const [westbahnhof, arrival, stephansplatz, praterstern, ...rest] = links(el);
    expect(rest).toEqual([]);
    expect(westbahnhof!.getAttribute("href")).toBe(
      "https://stadtplan.wien.gv.at/#/@16.3376511,48.1966562,17.5,0,0,standard/themes",
    );
    expect(westbahnhof!.getAttribute("aria-label")).toBe("Im Stadtplan öffnen: Westbahnhof");
    expect(westbahnhof!.getAttribute("target")).toBe("_blank");
    expect(westbahnhof!.getAttribute("rel")).toBe("noopener noreferrer");
    expect(arrival!.closest(".stop--arrive")).not.toBeNull();
    expect(stephansplatz!.getAttribute("aria-label")).toBe("In Karte suchen: Stephansplatz");
    expect(praterstern!.getAttribute("href")).toBe(
      "https://www.openstreetmap.org/search?query=Praterstern%2C%20Wien",
    );
    expect(praterstern!.closest("li")!.classList.contains("stop--end")).toBe(true);
    // Not inside the stop list's toggle, and not on the stops in between.
    expect(root(el).querySelector(".stops-toggle a, .leg-stop a")).toBeNull();
  });

  it("leaves the pin off an arrival at the stop the next ride leaves from", async () => {
    const base = trip("07:57", "08:11");
    const [first, second] = base.legs as [RouteTripAttr["legs"][0], RouteTripAttr["legs"][0]];
    const change = (sameDiva: boolean) => ({
      ...base,
      legs: [
        { ...first, destination: { ...first.destination, stop_id: "60201320" } },
        { ...second, origin: { ...second.origin, stop_id: sameDiva ? "60201320" : "60201198" } },
      ],
    });
    for (const [sameDiva, pins] of [[true, 3], [false, 4]] as const) {
      document.body.innerHTML = "";
      const el = await mount(hass("2026-09-14T05:50:00+00:00", { ...ACTIVE, trips: [change(sameDiva)] }), {
        entity: ENTITY,
      });
      expect(links(el)).toHaveLength(pins);
      expect(root(el).querySelector(".stop--arrive .map-link") !== null).toBe(!sameDiva);
    }
  });

  it("gives walks no pin of their own", async () => {
    const base = trip("07:57", "08:11");
    const walk = {
      ...base.legs[0]!, walk: true, line: null, type: "walk", towards: null,
      origin: stop("Wohnung", "07:50"), destination: stop("Westbahnhof", "07:55"),
      stops: [], stop_count: 0,
    };
    const walking = { ...base, legs: [walk, ...base.legs, { ...walk, origin: stop("Praterstern", "08:11") }] };
    const el = await mount(hass("2026-09-14T05:50:00+00:00", { ...ACTIVE, trips: [walking] }), {
      entity: ENTITY,
    });
    const labels = links(el).map((a) => a.getAttribute("aria-label"));
    expect(labels).toEqual([
      "In Karte suchen: Westbahnhof",
      "In Karte suchen: Stephansplatz",
      "In Karte suchen: Stephansplatz",
      "In Karte suchen: Praterstern",
    ]);
  });

  it("speaks English when HA does", async () => {
    const el = await mount(hass("2026-09-14T05:50:00+00:00", ACTIVE, "en"), { entity: ENTITY });
    expect(links(el)[0]!.getAttribute("aria-label")).toBe("Find on map: Westbahnhof");
  });

  it("ends each ride before a change at its arrival, and the last one at the destination", async () => {
    const base = trip("07:57", "08:11");
    const first = base.legs[0]!;
    const late = {
      ...base,
      legs: [
        {
          ...first,
          destination: {
            ...first.destination,
            estimated: "2026-09-14T08:06:00+02:00",
            delay_minutes: 2,
          },
        },
        base.legs[1]!,
      ],
    };
    const el = await mount(hass("2026-09-14T05:50:00+00:00", { ...ACTIVE, trips: [late] }), {
      entity: ENTITY,
    });
    const [ride, lastRide] = [...root(el).querySelectorAll(".strand .leg")];
    const arrival = ride!.querySelector(".stop--arrive")!;
    expect(arrival.querySelector(".stop-name")?.textContent).toBe("Stephansplatz");
    expect(arrival.querySelector(".sr-only")?.textContent).toBe("Ankunft");
    // A late arrival reads like a late departure: planned struck, new time red.
    expect(arrival.querySelector("s.time-planned")?.textContent).toBe("08:04");
    expect(arrival.querySelector(".time-late")?.textContent).toBe("08:06");
    expect(arrival.querySelector(".node")).not.toBeNull();
    // It comes after the stops in between, and before the change.
    expect(ride!.lastElementChild).toBe(arrival);
    expect(ride!.nextElementSibling?.classList.contains("transfer")).toBe(true);
    // The last ride has no arrival row; the destination row is its end.
    expect(lastRide!.querySelector(".stop--arrive")).toBeNull();
    expect(root(el).querySelector(".stop--end .stop-name")?.textContent).toBe("Praterstern");
  });

  it("puts the platform with the ride's direction, not the stop name", async () => {
    const el = await mount(hass("2026-09-14T05:50:00+00:00", ACTIVE), { entity: ENTITY });
    const leg = root(el).querySelector(".strand .leg")!;
    expect(leg.querySelector(".stop .platform")).toBeNull();
    expect(leg.querySelector(".ride .towards > .platform")?.textContent).toBe("Gleis 1");
  });

  it("shows no pins when turned off", async () => {
    const el = await mount(hass("2026-09-14T05:50:00+00:00", ACTIVE), {
      entity: ENTITY,
      show_map_pins: false,
    });
    expect(links(el)).toEqual([]);
    expect(text(el)).toContain("Westbahnhof");
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
    // A late ride strikes the planned time through and shows the expected
    // one beside it; a screen reader hears both in words.
    const change = root(el).querySelector(".strand .stop .time-change")!;
    expect(change.querySelector("s.time-planned")?.textContent).toBe("07:57");
    expect(change.querySelector("time.time-late")?.textContent).toBe("07:59");
    // The red must survive `.stop time`, which colours every stop time as
    // body text; a selector that loses to it paints the late time white.
    expect(routeCardSource).toMatch(
      /\.time-change \.time-late,\s*\.alt-times \.time-late,\s*\.leg-stop \.time-late \{\s*color: color-mix\(in srgb, var\(--wl-error\)/,
    );
    // The stops in between carry the ride's delay, so they show late too.
    const between = [...root(el).querySelectorAll(".strand .leg-stop time")];
    expect(between.every((time) => time.classList.contains("time-late"))).toBe(true);
    expect(change.querySelector(".sr-only")?.textContent).toBe("geplant 07:57, 2 min später");
    // Alternatives show the same, so an at-risk change there has its reason.
    const alt = root(el).querySelector(".alt-times")!;
    expect(alt.querySelector("s.time-planned")?.textContent).toBe("08:00");
    expect(alt.querySelector(".time-late")?.textContent).toBe("08:02");
    expect(alt.querySelector(".sr-only")?.textContent).toContain("geplant 08:00, 2 min später");
    // A late ride is live too, so it keeps the live icon beside its strike.
    expect(root(el).querySelector(".strand .leg .stop .live-mark")).not.toBeNull();
    // Every 10 min is not frequent, so the next departures are shown instead.
    expect(t).toContain("danach 08:18, 08:28");
    expect(t).not.toContain("alle 10 min");
    // Each ride reads in two lines: what you board, then its detail.
    const legRow = root(el).querySelector(".strand .leg")!;
    expect(legRow.querySelector(".ride .towards")?.textContent).toContain("Richtung Simmering");
    expect(legRow.querySelector(".ride-detail .stops-toggle")).not.toBeNull();
    expect(root(el).querySelector(".transfer-at")?.textContent).toBe("Umstieg");
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

    // The ride before a change hands over to the dotted walk; the last ride
    // runs on into the destination node.
    const legs = [...root(el).querySelectorAll(".strand > .leg")];
    expect(legs.map((leg) => leg.classList.contains("leg--before-transfer"))).toEqual([true, false]);
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

  it("puts the update time on the heading's line, not under the credit", async () => {
    const el = await mount(hass("x", ACTIVE), { entity: ENTITY });
    const header = root(el).querySelector(".header");
    expect(header?.querySelector("h2")).not.toBeNull();
    expect(header?.querySelector(".updated")).not.toBeNull();
    const wrap = root(el).querySelector(".wrap")!;
    expect(wrap.lastElementChild?.classList.contains("attribution")).toBe(true);
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
  { value: "60201091", label: "Währinger Straße-Volksoper (Wien)" },
  { value: "60201012", label: "Stephansplatz (Wien)" },
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

const combos = (el: CardElement): HTMLInputElement[] => [
  ...root(el).querySelectorAll<HTMLInputElement>('input[role="combobox"]'),
];

async function typeInto(el: CardElement, input: HTMLInputElement, value: string): Promise<void> {
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input"));
  await settle(el);
}

async function press(el: CardElement, input: HTMLInputElement, key: string): Promise<void> {
  input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  await settle(el);
}

const options = (el: CardElement, which: "from" | "to"): string[] =>
  [...root(el).querySelectorAll(`#wl-adhoc-${which}-list [role="option"]`)].map(
    (o) => o.textContent?.trim() ?? "",
  );

function remember(from: string, to: string): void {
  window.localStorage.setItem("wiener-linien-austria-route-adhoc", JSON.stringify({ from, to }));
}

describe("ad-hoc mode", () => {
  it("asks for both stops with two labelled comboboxes", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Verbindung suchen");
    expect(text(el)).toContain("Wähle Start und Ziel");
    const inputs = combos(el);
    expect(inputs).toHaveLength(2);
    const [from] = inputs;
    expect(from!.getAttribute("aria-expanded")).toBe("false");
    expect(from!.getAttribute("aria-autocomplete")).toBe("list");
    expect(root(el).getElementById(from!.getAttribute("aria-controls")!)?.getAttribute("role")).toBe(
      "listbox",
    );
    expect(root(el).querySelector(`label[for="${from!.id}"]`)?.textContent).toBe("Von");
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
    expect(root(el).querySelector(".transfer-at")?.textContent).toBe("Umstieg");
    expect(text(el)).toContain("Zuletzt aktualisiert 07:49");
    // A plan that wasn't asked for right now isn't announced.
    expect(root(el).querySelector('p[role="status"]')?.textContent).toBe("");
    expect(combos(el)[0]?.value).toBe("Westbahnhof (Wien) — 450 m");
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
    const [from, to] = combos(el);
    await typeInto(el, from!, "westb");
    await press(el, from!, "Enter");
    await typeInto(el, to!, "prater");
    await press(el, to!, "Enter");
    await settle(el, 399 - 0);
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

  it("plans for a chosen time and shows it as a clock time, not a countdown", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass(async (msg) =>
      "datetime" in msg
        ? { ...PLAN, planned_for: "2026-09-15T07:55:00+02:00", arrive_by: false }
        : PLAN,
    );
    const el = await mount(h, {});
    await settle(el);
    const radios = [...root(el).querySelectorAll<HTMLInputElement>('.when input[type="radio"]')];
    expect(radios.map((r) => r.nextElementSibling?.textContent)).toEqual([
      "Jetzt",
      "Abfahrt um",
      "Ankunft bis",
    ]);
    expect(radios[0]!.checked).toBe(true);
    expect(root(el).querySelector('input[type="datetime-local"]')).toBeNull();

    radios[2]!.checked = true;
    radios[2]!.dispatchEvent(new Event("change"));
    await settle(el);
    const field = root(el).querySelector<HTMLInputElement>('input[type="datetime-local"]')!;
    // Starts at the next five minutes on the Vienna clock.
    expect(field.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:(00|05|10|15|20|25|30|35|40|45|50|55)$/);
    field.value = "2026-09-15T08:30";
    field.dispatchEvent(new Event("change"));
    await settle(el, 400);
    await settle(el);
    expect(planCalls(callWS).at(-1)).toMatchObject({
      origin: 60201468,
      destination: 60201040,
      datetime: "2026-09-15T08:30",
      arrive_by: true,
    });
    // The day comes from the connection itself (today in this answer), and
    // the times show as clock times rather than a countdown.
    expect(text(el)).toContain("Abfahrt heute 07:57");
    expect(text(el)).not.toContain("Abfahrt in");
    expect(root(el).querySelector("time.hero-metric")?.textContent).toBe("07:57");

    // A cleared field keeps the last valid time rather than planning "now".
    const calls = planCalls(callWS).length;
    field.value = "";
    field.dispatchEvent(new Event("change"));
    await settle(el, 400);
    expect(planCalls(callWS)).toHaveLength(calls);
  });

  it("flags text that matches no stop instead of planning it", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const from = combos(el)[0]!;
    await typeInto(el, from, "Westbhf");
    expect(root(el).querySelector("#wl-adhoc-from-list + .combo-note")?.textContent).toContain(
      "Keine Haltestelle gefunden",
    );
    from.blur();
    from.dispatchEvent(new FocusEvent("blur"));
    await settle(el, 500);
    const input = combos(el)[0]!;
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
    // 07:50, then every 120 s, pulled forward to 30 s after each of the three
    // connections leaves (07:57, 08:00, 08:03): 9 requests up to 08:03:30 and
    // 8 more, every 120 s, until the half hour is up.
    expect(before).toBe(17);
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
    expect(text(el)).toContain("Gerade zu viele Verbindungsabfragen");
    expect(text(el)).toContain("Neuer Versuch in 30 s");
    limited = false;
    await settle(el, 30_000);
    expect(planCalls(callWS)).toHaveLength(2);
    expect(text(el)).toContain("Abfahrt in");
  });

  it("shows a stale plan with a note, and waits out the budget before asking again", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass(async () => ({ ...PLAN, stale: true, retry_after: 600 }));
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Abfahrt in");
    expect(text(el)).toContain("etwas älterer Stand");
    expect(text(el)).toContain("Zuletzt aktualisiert 07:49");
    // Past the usual 120 s cadence, but before retry_after: no new request.
    await settle(el, 300_000);
    expect(planCalls(callWS)).toHaveLength(1);
    await settle(el, 300_000);
    expect(planCalls(callWS)).toHaveLength(2);
  });

  it("drops the plan when the trip planner fails, and tries again", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    let failing = false;
    const { h } = adhocHass(async () => {
      if (failing) throw { code: "upstream", translation_key: "api_timeout" };
      return PLAN;
    });
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Abfahrt in");
    failing = true;
    await settle(el, 120_000);
    expect(text(el)).toContain("Routenplaner nicht erreichbar");
    expect(text(el)).not.toContain("Abfahrt in");
    failing = false;
    await settle(el, 60_000);
    expect(text(el)).toContain("Abfahrt in");
  });

  it("recovers when the integration loads after the card asked", async () => {
    // Right after an HA restart the card can be quicker than the integration.
    remember(WESTBAHNHOF, PRATERSTERN);
    let loaded = false;
    const { h, callWS } = adhocHass();
    callWS.mockImplementation(async (msg: WsMessage) => {
      if (msg.type === "wiener_linien_austria/route_card_version") {
        return { version: ROUTE_CARD_VERSION };
      }
      if (!loaded) throw { code: "not_loaded" };
      return msg.type === "wiener_linien_austria/stops" ? { stops: STOPS } : PLAN;
    });
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Wiener Linien Austria ist nicht geladen");
    loaded = true;
    await settle(el, 60_000);
    expect(combos(el)).toHaveLength(2);
    expect(text(el)).toContain("Abfahrt in");
  });

  it("explains a query the trip planner refuses, and doesn't ask again on its own", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass(async () => {
      throw { code: "invalid_query", translation_key: "route_too_close" };
    });
    const el = await mount(h, {});
    await settle(el);
    expect(text(el)).toContain("Die Haltestellen liegen zu nah beieinander");
    expect(text(el)).not.toContain("Neuer Versuch");
    await settle(el, 3_600_000);
    expect(planCalls(callWS)).toHaveLength(1);
  });

  it("keeps the answer to the latest pick when an older one arrives last", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const answers: Array<(plan: unknown) => void> = [];
    const { h, callWS } = adhocHass(
      () => new Promise((resolve) => answers.push(resolve)),
    );
    const el = await mount(h, {});
    await settle(el);
    root(el).querySelector<HTMLButtonElement>(".swap")!.click();
    await settle(el, 400);
    expect(planCalls(callWS)).toHaveLength(2);
    // The reversed pick answers first; the original one lands afterwards.
    answers[1]!({ ...PLAN, origin: "Praterstern", destination: "Westbahnhof" });
    await settle(el);
    answers[0]!({ ...PLAN, fetched_at: "2026-09-14T05:40:00+00:00" });
    await settle(el);
    expect(text(el)).toContain("Zuletzt aktualisiert 07:49");
    expect(text(el)).not.toContain("07:40");
  });

  it("waits out the rest of the refresh interval when re-attached", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    expect(planCalls(callWS)).toHaveLength(1);
    // A view switch detaches the card and attaches it again.
    await settle(el, 30_000);
    el.remove();
    document.body.appendChild(el);
    await settle(el);
    expect(planCalls(callWS)).toHaveLength(1);
    await settle(el, 89_999);
    expect(planCalls(callWS)).toHaveLength(1);
    await settle(el, 1);
    expect(planCalls(callWS)).toHaveLength(2);

    // Detached past its due time, it refreshes as soon as it's back.
    el.remove();
    await settle(el, 600_000);
    document.body.appendChild(el);
    await settle(el);
    expect(planCalls(callWS)).toHaveLength(3);
  });

  it("holds a due refresh while scrolled out of view", async () => {
    let observerCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
          observerCallback = callback;
        }
        observe(): void {}
        disconnect(): void {}
      },
    );
    try {
      remember(WESTBAHNHOF, PRATERSTERN);
      const { h, callWS } = adhocHass();
      const el = await mount(h, {});
      await settle(el);
      expect(planCalls(callWS)).toHaveLength(1);
      observerCallback!([{ isIntersecting: false }]);
      await settle(el, 600_000);
      expect(planCalls(callWS)).toHaveLength(1);
      observerCallback!([{ isIntersecting: true }]);
      await settle(el);
      expect(planCalls(callWS)).toHaveLength(2);
    } finally {
      vi.unstubAllGlobals();
    }
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

  it("narrows the list while typing, ignoring case and accents", async () => {
    const { h } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const from = combos(el)[0]!;
    await typeInto(el, from, "WAHRINGER str");
    expect(from.getAttribute("aria-expanded")).toBe("true");
    expect(options(el, "from")).toEqual(["Währinger Straße-Volksoper (Wien)"]);
    await typeInto(el, from, "");
    expect(options(el, "from")).toHaveLength(STOPS.length);
  });

  it("opens the full list from the button and picks with the arrow keys", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const from = combos(el)[0]!;
    root(el).querySelector<HTMLButtonElement>(".picker--from .combo-toggle")!.click();
    await settle(el);
    expect(options(el, "from")).toHaveLength(STOPS.length);

    await press(el, from, "ArrowDown");
    await press(el, from, "ArrowDown");
    const active = from.getAttribute("aria-activedescendant");
    expect(root(el).getElementById(active!)?.textContent).toContain("Praterstern");
    expect(root(el).getElementById(active!)?.getAttribute("aria-selected")).toBe("true");
    await press(el, from, "Enter");
    expect(from.getAttribute("aria-expanded")).toBe("false");
    expect(from.value).toBe("Praterstern (Wien)");

    const to = combos(el)[1]!;
    await typeInto(el, to, "stephan");
    // A mouse pick works too.
    root(el).querySelector<HTMLElement>('#wl-adhoc-to-list [role="option"]')!.click();
    await settle(el, 400);
    expect(planCalls(callWS).at(-1)).toMatchObject({ origin: 60201040, destination: 60201012 });
  });

  it("closes on Escape, then restores the committed stop on a second Escape", async () => {
    remember(WESTBAHNHOF, PRATERSTERN);
    const { h } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const from = combos(el)[0]!;
    await typeInto(el, from, "steph");
    await press(el, from, "Escape");
    expect(from.getAttribute("aria-expanded")).toBe("false");
    expect(from.value).toBe("steph");
    await press(el, from, "Escape");
    expect(combos(el)[0]!.value).toBe("Westbahnhof (Wien) — 450 m");
  });

  it("commits an exactly typed stop on blur and follows a swap", async () => {
    const { h, callWS } = adhocHass();
    const el = await mount(h, { to: PRATERSTERN });
    await settle(el);
    const from = combos(el)[0]!;
    await typeInto(el, from, "westbahnhof (wien) — 450 m");
    from.blur();
    from.dispatchEvent(new FocusEvent("blur"));
    await settle(el, 400);
    expect(planCalls(callWS)).toHaveLength(1);
    root(el).querySelector<HTMLButtonElement>(".swap")!.click();
    await settle(el);
    expect(combos(el).map((i) => i.value)).toEqual([
      "Praterstern (Wien)",
      "Westbahnhof (Wien) — 450 m",
    ]);
  });

  it("marks the stop Enter will pick, and never points at an option that isn't there", async () => {
    const { h } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const from = combos(el)[0]!;
    await typeInto(el, from, "platz");
    const marked = root(el).querySelectorAll("#wl-adhoc-from-list [data-enter]");
    expect([...marked].map((o) => o.textContent?.trim())).toEqual(["Stephansplatz (Wien)"]);
    await press(el, from, "ArrowDown");
    expect(root(el).querySelector("#wl-adhoc-from-list [data-enter]")).toBeNull();

    await typeInto(el, from, "nowhere");
    await press(el, from, "ArrowUp");
    expect(from.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("announces the match count once typing pauses", async () => {
    const { h } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const from = combos(el)[0]!;
    const status = () =>
      root(el).querySelector<HTMLElement>('.picker--from [role="status"]')!.textContent!.trim();
    await typeInto(el, from, "w");
    await typeInto(el, from, "wa");
    expect(status()).toBe("");
    await settle(el, 499);
    expect(status()).toBe("");
    await settle(el, 1);
    expect(status()).toBe("1 Treffer");
    await press(el, from, "Escape");
    expect(status()).toBe("");
  });

  it("hands the pickers the same strings on every tick", async () => {
    const { h } = adhocHass();
    const el = await mount(h, {});
    await settle(el);
    const picker = root(el).querySelector<HTMLElement & { strings: unknown }>(".picker--from")!;
    const before = picker.strings;
    await settle(el, 60_000);
    expect(picker.strings).toBe(before);
  });

  it("caps the list and says how many more there are", async () => {
    const many = Array.from({ length: 80 }, (_, i) => ({
      value: String(60200000 + i),
      label: `Gasse ${i} (Wien)`,
    }));
    const { h, callWS } = adhocHass();
    callWS.mockImplementation(async (msg: WsMessage) =>
      msg.type === "wiener_linien_austria/stops" ? { stops: many } : { version: ROUTE_CARD_VERSION },
    );
    const el = await mount(h, {});
    await settle(el);
    const from = combos(el)[0]!;
    await typeInto(el, from, "gasse");
    expect(options(el, "from")).toHaveLength(50);
    expect(text(el)).toContain("50 von 80 Treffern");
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
        detail: {
          value: { entity: ENTITY, title: "", alternatives: 1, show_map_pins: true, hide_attribution: false },
        },
      }),
    );
    // Defaults stay out of the YAML; only turning the pins off is written.
    expect(config).toEqual({ type: `custom:${TAG}`, entity: ENTITY, alternatives: 1 });
    form?.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { show_map_pins: false } } }),
    );
    expect(config).toMatchObject({ show_map_pins: false });

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
      "entity", "title", "from", "to", "alternatives", "step_free", "show_map_pins", "hide_attribution",
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
      new CustomEvent("value-changed", { detail: { value: { step_free: true } } }),
    );
    expect(config).toMatchObject({ from: WESTBAHNHOF, step_free: true });
    // A route brings its own options; step-free only applies without one.
    formEl.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { entity: ENTITY, from: WESTBAHNHOF } } }),
    );
    expect(config).toEqual({ type: `custom:${TAG}`, entity: ENTITY, alternatives: 2 });
  });

  it("keeps the dashboard layout keys through every change", async () => {
    const el = document.createElement(`${TAG}-editor`) as CardElement;
    document.body.appendChild(el);
    el.hass = hass("x", ACTIVE);
    const layout = {
      grid_options: { columns: "full", rows: 8 },
      visibility: [{ condition: "screen", media_query: "(min-width: 0px)" }],
    };
    el.setConfig({ type: `custom:${TAG}`, entity: ENTITY, ...layout });
    await el.updateComplete;
    let config: Record<string, unknown> | undefined;
    el.addEventListener("config-changed", (ev) => {
      config = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    });
    const form = root(el).querySelector("ha-form")!;
    form.dispatchEvent(new CustomEvent("value-changed", { detail: { value: { title: "Arbeit" } } }));
    expect(config).toMatchObject({ title: "Arbeit", ...layout });
    form.dispatchEvent(new CustomEvent("value-changed", { detail: { value: { alternatives: 1 } } }));
    expect(config).toMatchObject({ title: "Arbeit", alternatives: 1, ...layout });
  });

  it("renders nothing before it has a config", async () => {
    const el = document.createElement(`${TAG}-editor`) as CardElement;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(root(el).querySelector("ha-form")).toBeNull();
  });
});
