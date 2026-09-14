// Pure helpers for the route card. Nothing here touches Lit or the DOM, so the
// whole decision layer — which entity is a route, what the countdown says,
// how a transfer is graded — is testable without rendering a card.

import { lineTypeIcon } from "./mot.js";
import type {
  HomeAssistant,
  RouteActiveWindow,
  RouteAttrs,
  RouteLegAttr,
  RouteRisk,
  RouteTripAttr,
  WienerLinienRouteCardConfig,
} from "../types.js";

export const ROUTE_CARD_TYPE = "wiener-linien-austria-route-card";
export const DEFAULT_ALTERNATIVES = 2;
export const MAX_ALTERNATIVES = 3;

// Discover route sensors by attribute fingerprint, like findWienerLinienEntities
// does for stops. `trips` + `origin` + `destination` + boolean `active` only
// appear together on the route sensor (sensor.py WienerLinienRouteSensor), and
// none of them on a stop sensor — so neither card's discovery can pick up the
// other's entities.
export function findRouteEntities(hass: HomeAssistant | undefined): string[] {
  if (!hass) return [];
  const matches: string[] = [];
  for (const [eid, state] of Object.entries(hass.states ?? {})) {
    if (!eid.startsWith("sensor.")) continue;
    const attrs = (state?.attributes ?? {}) as RouteAttrs;
    if (!Array.isArray(attrs.trips)) continue;
    if (typeof attrs.origin !== "string" || typeof attrs.destination !== "string") {
      continue;
    }
    if (typeof attrs.active !== "boolean") continue;
    matches.push(eid);
  }
  return matches.sort();
}

export interface NormalisedRouteConfig {
  type: string;
  entity: string;
  /** Ad-hoc defaults; "" when unset. Ignored while `entity` is set. */
  from: string;
  to: string;
  title: string;
  alternatives: number;
  hide_attribution: boolean;
}

/** Validate + default a route card config. Throws the messages Lovelace shows
 *  in its error card, exactly like the other three cards' setConfig guards. */
export function normaliseRouteConfig(
  config: WienerLinienRouteCardConfig,
): NormalisedRouteConfig {
  if (!config || typeof config !== "object") {
    throw new Error(`${ROUTE_CARD_TYPE}: config must be an object`);
  }
  if (config.entity !== undefined && typeof config.entity !== "string") {
    throw new Error(`${ROUTE_CARD_TYPE}: 'entity' must be a string`);
  }
  if (typeof config.entity === "string" && config.entity && !config.entity.startsWith("sensor.")) {
    throw new Error(`${ROUTE_CARD_TYPE}: 'entity' must be a sensor`);
  }
  const from = stopIdOf(config.from, "from");
  const to = stopIdOf(config.to, "to");
  const raw = Number(config.alternatives ?? DEFAULT_ALTERNATIVES);
  const alternatives = Number.isFinite(raw)
    ? Math.min(MAX_ALTERNATIVES, Math.max(0, Math.round(raw)))
    : DEFAULT_ALTERNATIVES;
  return {
    type: config.type,
    entity: config.entity ?? "",
    from,
    to,
    title: typeof config.title === "string" ? config.title : "",
    alternatives,
    hide_attribution: config.hide_attribution === true,
  };
}

function stopIdOf(value: unknown, field: string): string {
  if (value === undefined || value === null || value === "") return "";
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) {
    throw new Error(`${ROUTE_CARD_TYPE}: '${field}' must be a stop number (DIVA)`);
  }
  return text;
}

/** Whole minutes until `iso`, never negative. Null when unparseable.
 *  Floors, so "1 min" never turns up after the vehicle has gone. */
export function minutesUntil(iso: string | null | undefined, nowMs: number): number | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return null;
  return Math.max(0, Math.floor((ts - nowMs) / 60_000));
}

/** HH:MM in the server's own wall-clock time. The timestamps carry their
 *  Vienna offset; slicing the ISO string keeps the printed time identical to
 *  station signage even when the dashboard's browser sits in another zone. */
export function clockOf(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = /T(\d{2}:\d{2})/.exec(iso);
  return match?.[1] ?? "";
}

/** The connections still ahead, soonest first. The sensor already ranks
 *  them; this only drops the ones that have left since its last refresh. */
export function upcomingTrips(
  attrs: RouteAttrs | undefined,
  nowMs: number,
): RouteTripAttr[] {
  const trips = Array.isArray(attrs?.trips) ? attrs.trips : [];
  return trips.filter((trip) => {
    if (trip.cancelled) return false;
    const ts = trip.departure ? Date.parse(trip.departure) : Number.NaN;
    return !Number.isFinite(ts) || ts >= nowMs - 30_000;
  });
}

export function transitLegs(trip: RouteTripAttr): RouteLegAttr[] {
  return trip.legs.filter((leg) => !leg.walk && !!leg.line);
}

export const RISK_ICON: Record<RouteRisk, string> = {
  ok: "mdi:check-circle-outline",
  tight: "mdi:clock-alert-outline",
  at_risk: "mdi:alert-circle-outline",
};

/** "06:30–09:00", or "" when no window is set. */
export function windowRange(window: RouteActiveWindow | undefined): string {
  if (!window?.from || !window.to) return "";
  return `${window.from.slice(0, 5)}–${window.to.slice(0, 5)}`;
}

const WEEKDAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Localised short weekday names for a window's days, in week order, with
 *  runs of three or more collapsed ("Mo.–Fr."). Empty when every day (or
 *  none) is selected — "every day" needs no label. */
export function windowDays(
  window: RouteActiveWindow | undefined,
  lang: string,
): string {
  const days = (window?.days ?? []).filter((d) => WEEKDAY_ORDER.includes(d));
  if (days.length === 0 || days.length === 7) return "";
  // 2024-01-01 was a Monday, so index i is WEEKDAY_ORDER[i].
  const formatter = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-AT", {
    weekday: "short",
    timeZone: "UTC",
  });
  const name = (index: number): string => formatter.format(Date.UTC(2024, 0, 1 + index));
  const indices = WEEKDAY_ORDER.map((d, i) => (days.includes(d) ? i : -1)).filter(
    (i) => i >= 0,
  );
  const parts: string[] = [];
  let start = 0;
  while (start < indices.length) {
    let end = start;
    while (end + 1 < indices.length && indices[end + 1] === indices[end]! + 1) end++;
    const run = indices.slice(start, end + 1);
    if (run.length >= 3) {
      parts.push(`${name(run[0]!)}–${name(run[run.length - 1]!)}`);
    } else {
      parts.push(...run.map(name));
    }
    start = end + 1;
  }
  return parts.join(", ");
}

/** Vehicle icon for a route leg. Routes reach modes a stop board never shows
 *  (S-Bahn, regional trains and buses), so this extends `lineTypeIcon` rather
 *  than widening it for all four cards. An "S" + number label is always the
 *  S-Bahn, whatever type the trip planner reported. */
export function legTypeIcon(type: string | null | undefined, line: string | null | undefined): string | null {
  if (line && /^S\d/i.test(line)) return "mdi:train";
  switch (type) {
    case "ptTrain":
    case "ptTrainS":
      return "mdi:train";
    case "ptBusRegion":
    case "ptBusOnDemand":
      return "mdi:bus";
    case "ptCableCar":
      return "mdi:gondola";
    case "ptShip":
      return "mdi:ferry";
    default:
      return lineTypeIcon(type ?? undefined);
  }
}

/** "07:40" in Vienna time for a UTC stamp such as `fetched_at`. `clockOf`
 *  slices the ISO string, which is right for timetable stamps carrying their
 *  Vienna offset but would print UTC for these. Empty when unparseable. */
export function viennaClock(iso: string | null | undefined): string {
  if (!iso) return "";
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "";
  return new Intl.DateTimeFormat("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Vienna",
  }).format(ts);
}

// ---------------------------------------------------------------------------
// Ad-hoc mode
// ---------------------------------------------------------------------------

/** Refresh cadence while the card is on screen. Matches the route entries'
 *  poll floor (`MIN_ROUTE_POLL_SECONDS`): a connection plan changes on the
 *  scale of minutes, and every open dashboard multiplies this. */
export const ADHOC_REFRESH_MS = 120_000;
/** Never refresh sooner than this after the best connection leaves
 *  (`MIN_ROUTE_ROLLOVER_SECONDS`), so a departure in ten seconds can't turn
 *  into a tight loop. */
export const ADHOC_ROLLOVER_FLOOR_MS = 60_000;
/** No interaction for this long pauses refreshing, so a wall tablet left open
 *  stops asking the upstream after half an hour. */
export const ADHOC_IDLE_MS = 30 * 60_000;
/** Coalesces a swap and a pick made in quick succession into one request. */
export const ADHOC_DEBOUNCE_MS = 400;
/** Wait after an upstream failure that didn't say how long to wait. */
export const ADHOC_RETRY_MS = 60_000;

/** When to refresh next: shortly after the best connection departs, but
 *  within [floor, cadence]. */
export function adhocRefreshDelay(trips: RouteTripAttr[], nowMs: number): number {
  // Only a departure still ahead can roll the list over. Trips that already
  // left would pin every refresh to the floor for no new information.
  const next = trips
    .filter((trip) => !trip.cancelled && trip.departure)
    .map((trip) => Date.parse(trip.departure!))
    .find((ts) => Number.isFinite(ts) && ts + 30_000 > nowMs);
  if (next === undefined) return ADHOC_REFRESH_MS;
  const untilRollover = next + 30_000 - nowMs;
  return Math.min(ADHOC_REFRESH_MS, Math.max(ADHOC_ROLLOVER_FLOOR_MS, untilRollover));
}

/** Error codes the backend answers that are worth retrying on their own,
 *  and after how long. The rest need the user to change something. */
export function adhocRetryDelay(code: string, retryAfterSeconds: number | null): number | null {
  if (code === "rate_limited") {
    return Math.max(1, retryAfterSeconds ?? ADHOC_RETRY_MS / 1000) * 1000;
  }
  if (code === "not_loaded" || code === "invalid_stop" || code === "same_stop") return null;
  return ADHOC_RETRY_MS;
}

const ADHOC_STORAGE_KEY = "wiener-linien-austria-route-adhoc";

export interface AdhocSelection {
  from: string;
  to: string;
}

/** The last pick on this device, or null. Stays in this browser: a stop pair
 *  is a movement pattern and has no business in HA's storage. */
export function loadAdhocSelection(): AdhocSelection | null {
  try {
    const raw = window.localStorage?.getItem(ADHOC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdhocSelection>;
    const from = typeof parsed.from === "string" && /^\d*$/.test(parsed.from) ? parsed.from : "";
    const to = typeof parsed.to === "string" && /^\d*$/.test(parsed.to) ? parsed.to : "";
    return from || to ? { from, to } : null;
  } catch {
    return null;
  }
}

export function saveAdhocSelection(selection: AdhocSelection): void {
  try {
    window.localStorage?.setItem(ADHOC_STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // Private mode or blocked storage: the pick just isn't remembered.
  }
}
