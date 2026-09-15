// Pure helpers for the route card. Nothing here touches Lit or the DOM, so the
// whole decision layer — which entity is a route, what the countdown says,
// how a transfer is graded — is testable without rendering a card.

import { filterPassthrough } from "./config.js";
import { findSensors } from "./entities.js";
import { lineTypeIcon } from "./mot.js";
import type {
  AdhocStopOption,
  HomeAssistant,
  RouteAccessStepAttr,
  RouteActiveWindow,
  RouteAttrs,
  RouteLegAttr,
  RouteRisk,
  RouteStopAttr,
  RouteTransferAttr,
  RouteTripAttr,
  WienerLinienRouteCardConfig,
} from "../types.js";

export const ROUTE_CARD_TYPE = "wiener-linien-austria-route-card";
const DEFAULT_ALTERNATIVES = 2;

/** Keys `normaliseRouteConfig` validates; everything else passes through. */
const ROUTE_VALIDATED_KEYS: ReadonlySet<string> = new Set([
  "type",
  "entity",
  "from",
  "to",
  "title",
  "alternatives",
  "hide_attribution",
  "step_free",
  "show_map_pins",
]);
export const MAX_ALTERNATIVES = 3;

// Discover route sensors by attribute fingerprint, like findWienerLinienEntities
// does for stops. `trips` + `origin` + `destination` + boolean `active` only
// appear together on the route sensor (sensor.py WienerLinienRouteSensor), and
// none of them on a stop sensor — so neither card's discovery can pick up the
// other's entities.
export function findRouteEntities(hass: HomeAssistant | undefined): string[] {
  return findSensors<RouteAttrs>(
    hass,
    (attrs) =>
      Array.isArray(attrs.trips) &&
      typeof attrs.origin === "string" &&
      typeof attrs.destination === "string" &&
      typeof attrs.active === "boolean",
  );
}

export interface NormalisedRouteConfig {
  /** HA's dashboard layout keys (grid_options, view_layout, visibility,
   *  layout_options) ride along untouched — see `filterPassthrough`. */
  [key: string]: unknown;
  type: string;
  entity: string;
  /** Ad-hoc defaults; "" when unset. Ignored while `entity` is set. */
  from: string;
  to: string;
  title: string;
  alternatives: number;
  hide_attribution: boolean;
  /** Ad-hoc only: plan step-free. Ignored while `entity` is set. */
  step_free: boolean;
  /** The map pin after each boarding stop and the destination. */
  show_map_pins: boolean;
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
    // Without this, every editor change dropped `grid_options`, and a card
    // resized to full width snapped back to the 6-column default.
    ...filterPassthrough(config, ROUTE_VALIDATED_KEYS),
    type: config.type,
    entity: config.entity ?? "",
    from,
    to,
    title: typeof config.title === "string" ? config.title : "",
    alternatives,
    hide_attribution: config.hide_attribution === true,
    step_free: config.step_free === true,
    show_map_pins: config.show_map_pins !== false,
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
 *  them; this only drops the ones that have left since its last refresh.
 *  A plan for a chosen time (`planned_for`) keeps them all: that is what
 *  was asked for, whatever the clock says now. */
export function upcomingTrips(
  attrs: RouteAttrs | undefined,
  nowMs: number,
): RouteTripAttr[] {
  const trips = Array.isArray(attrs?.trips) ? attrs.trips : [];
  const planned = !!attrs?.planned_for;
  return trips.filter((trip) => {
    if (trip.cancelled) return false;
    if (planned) return true;
    const ts = trip.departure ? Date.parse(trip.departure) : Number.NaN;
    return !Number.isFinite(ts) || ts >= nowMs - 30_000;
  });
}

/** HH:MM in Vienna rounded to the nearest minute. Live estimates carry
 *  seconds; slicing them off would print 09:37:40 as 09:37 next to a
 *  departure that rounded 09:36:40 up to 09:37. */
export function roundedClock(iso: string | null | undefined): string {
  const ts = iso ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(ts)) return "";
  return viennaClock(new Date(Math.round(ts / 60_000) * 60_000).toISOString());
}

/** For a change that no longer fits: the first later departure of the next
 *  ride that can still be reached, arrival plus walk, from the departure
 *  board's times. Null when the change isn't at risk or no such departure
 *  is known. */
export function catchableDeparture(
  arriving: RouteLegAttr,
  transfer: RouteTransferAttr,
  departing: RouteLegAttr,
): string | null {
  if (transfer.risk !== "at_risk") return null;
  const arrival = Date.parse(arriving.destination.estimated ?? arriving.destination.planned ?? "");
  if (!Number.isFinite(arrival)) return null;
  const ready = arrival + transfer.walk_minutes * 60_000;
  return (departing.next_departures ?? []).find((iso) => Date.parse(iso) >= ready) ?? null;
}

/** Whether a ride's arrival and the next ride's boarding are one stop: the
 *  same DIVA, or the same coordinates. The trip planner names one stop
 *  differently by platform area ("Ottakring" / "Ottakring (Huttengasse)"),
 *  so names don't count. Without either to compare, they are not known to be
 *  the same. */
export function sameStop(
  a: Pick<RouteStopAttr, "stop_id" | "latitude" | "longitude">,
  b: Pick<RouteStopAttr, "stop_id" | "latitude" | "longitude">,
): boolean {
  if (a.stop_id && b.stop_id && a.stop_id === b.stop_id) return true;
  return (
    typeof a.latitude === "number" &&
    typeof a.longitude === "number" &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude
  );
}

/** The planned and the expected clock time of a stop that runs late, or null
 *  when it doesn't (or the two print as the same minute). The expected time
 *  rounds to the nearest minute: a live estimate carries seconds, and a
 *  vehicle 40 s late shouldn't show "09:22 → 09:22". */
export function delayedClock(
  stop: Pick<RouteStopAttr, "planned" | "estimated">,
): { planned: string; expected: string } | null {
  if (!stop.planned || !stop.estimated) return null;
  const planned = Date.parse(stop.planned);
  const estimated = Date.parse(stop.estimated);
  if (!Number.isFinite(planned) || !Number.isFinite(estimated) || estimated <= planned) {
    return null;
  }
  const expected = roundedClock(stop.estimated);
  const plannedClock = clockOf(stop.planned);
  return expected && expected !== plannedClock ? { planned: plannedClock, expected } : null;
}

/** Up to this headway a line counts as frequent: "alle 3 min" says all
 *  anyone needs, and the next exact times would only add reading. */
const FREQUENT_HEADWAY_MINUTES = 5;

export type RideFrequency = { every: number } | { then: string[] } | null;

/** What the card says about how often a ride's line runs: the headway for a
 *  frequent line, otherwise the next departures, otherwise the headway if
 *  that is all there is. */
export function rideFrequency(leg: RouteLegAttr): RideFrequency {
  const headway = leg.headway_minutes ?? null;
  const next = (leg.next_departures ?? []).map(clockOf).filter(Boolean);
  if (headway !== null && headway <= FREQUENT_HEADWAY_MINUTES) return { every: headway };
  if (next.length) return { then: next };
  if (headway !== null) return { every: headway };
  return null;
}

/** A ride's identity across refreshes: line, direction and boarding stop
 *  and time, all of which a new plan for the same vehicle repeats. */
export function rideKey(leg: RouteLegAttr): string {
  return [leg.line, leg.direction, leg.origin.stop_id, leg.origin.planned].join("|");
}

export function transitLegs(trip: RouteTripAttr): RouteLegAttr[] {
  return trip.legs.filter((leg) => !leg.walk && !!leg.line);
}

/** Lifts and stairs on the walk before the first ride ("start") or after
 *  the last one ("end"): the way to and from the platform. */
export function walkAccess(trip: RouteTripAttr, where: "start" | "end"): RouteAccessStepAttr[] {
  const legs = where === "start" ? trip.legs : [...trip.legs].reverse();
  const steps: RouteAccessStepAttr[] = [];
  for (const leg of legs) {
    if (!leg.walk) break;
    steps.push(...(leg.access ?? []));
  }
  return where === "start" ? steps : steps.reverse();
}

/** Every lift and stairs step the trip takes, walks and changes alike. */
export function tripAccessSteps(trip: RouteTripAttr): RouteAccessStepAttr[] {
  return [
    ...trip.legs.flatMap((leg) => leg.access ?? []),
    ...trip.transfers.flatMap((transfer) => transfer.access ?? []),
  ];
}

const ACCESS_ICON: Record<string, string> = {
  elevator: "mdi:elevator-passenger",
  stairs: "mdi:stairs",
  escalator: "mdi:escalator",
  ramp: "mdi:slope-uphill",
};

/** The icon for a step. A ramp down gets the downhill slope; the other
 *  kinds have no up/down pair in MDI and keep one icon either way. */
export function accessIcon(step: RouteAccessStepAttr): string {
  if (step.kind === "ramp" && step.level === "down") return "mdi:slope-downhill";
  return ACCESS_ICON[step.kind] ?? "mdi:walk";
}

/** Written out rather than built from parts, so every key is findable. */
const ACCESS_KEYS: Record<string, { any: string; up: string; down: string }> = {
  elevator: { any: "access_elevator", up: "access_elevator_up", down: "access_elevator_down" },
  stairs: { any: "access_stairs", up: "access_stairs_up", down: "access_stairs_down" },
  escalator: { any: "access_escalator", up: "access_escalator_up", down: "access_escalator_down" },
  ramp: { any: "access_ramp", up: "access_ramp_up", down: "access_ramp_down" },
};

/** The `route.` localisation key for a step, or null for a kind the card
 *  has no words for (it is then left out rather than shown raw). */
export function accessKey(step: RouteAccessStepAttr): string | null {
  const keys = ACCESS_KEYS[step.kind];
  if (!keys) return null;
  return step.level === "up" ? keys.up : step.level === "down" ? keys.down : keys.any;
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

const VIENNA_PARTS = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Vienna",
});

/** `{year, month, day, hour, minute}` of an instant on a Vienna wall clock. */
function viennaParts(ms: number): Record<string, string> {
  const parts: Record<string, string> = {};
  for (const part of VIENNA_PARTS.formatToParts(ms)) parts[part.type] = part.value;
  return parts;
}

/** A `datetime-local` value ("2026-09-15T07:35") for `nowMs` on the Vienna
 *  clock, rounded up to the next five minutes: the time field's starting
 *  point when someone switches away from "now". */
export function viennaInputValue(nowMs: number): string {
  const step = 5 * 60_000;
  const p = viennaParts(Math.ceil(nowMs / step) * step);
  return `${p["year"]}-${p["month"]}-${p["day"]}T${p["hour"]}:${p["minute"]}`;
}

/** A well-formed `datetime-local` value, as the plan command accepts it. */
export function isInputDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
}

/** Calendar days from today to the day of `iso`, both on the Vienna clock:
 *  0 today, 1 tomorrow, -1 yesterday. Null when unparseable. */
export function viennaDayOffset(iso: string | null | undefined, nowMs: number): number | null {
  const ts = iso ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(ts)) return null;
  const day = (ms: number): number => {
    const p = viennaParts(ms);
    return Date.UTC(Number(p["year"]), Number(p["month"]) - 1, Number(p["day"]));
  };
  return Math.round((day(ts) - day(nowMs)) / 86_400_000);
}

/** "Tue, 15/09" / "Di., 15.09." for a Vienna calendar day. */
export function viennaShortDate(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-AT", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Vienna",
  }).format(Date.parse(iso));
}

// ---------------------------------------------------------------------------
// Ad-hoc mode
// ---------------------------------------------------------------------------

/** When a plan is for: now, departing at a time, or arriving by it. */
export type AdhocTimeMode = "now" | "depart" | "arrive";

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

/** Refresh cadence for a plan at a chosen time. Its connections don't roll
 *  over as the clock runs, so the usual two minutes would only spend budget;
 *  this still picks up a timetable change or a disruption within minutes. */
export const ADHOC_PLANNED_REFRESH_MS = 10 * 60_000;

/** When to refresh after a plan arrived. A stale plan means the request
 *  budget is spent, so asking before `retry_after` would only get it again. */
export function adhocPlanRefreshDelay(plan: RouteAttrs, nowMs: number): number {
  const base = plan.planned_for
    ? ADHOC_PLANNED_REFRESH_MS
    : adhocRefreshDelay(plan.trips ?? [], nowMs);
  const retryAfter = plan.stale ? Number(plan.retry_after) : NaN;
  return Number.isFinite(retryAfter) && retryAfter > 0 ? Math.max(base, retryAfter * 1000) : base;
}

/** How long a card with no loaded integration waits before asking again.
 *  Right after an HA restart the card can reach HA before the integration
 *  has loaded, so this can't be a dead end. */
export const ADHOC_NOT_LOADED_RETRY_MS = 60_000;
/** A query the trip planner has no timetable for won't change within
 *  minutes; ask again much later rather than on the usual cadence. */
export const ADHOC_NO_TIMETABLE_RETRY_MS = 10 * 60_000;

/** How the card presents one backend error and whether it retries.
 *
 *  `retry`: `"countdown"` retries after the backend's `retry_after` (or
 *  `ADHOC_RETRY_MS`) and says so in the detail line; a number retries
 *  quietly after that many ms; `null` waits for the user to change
 *  something. `title` and `detail` are keys under `route.`. */
export interface AdhocErrorSpec {
  icon: string;
  title: string;
  detail?: string;
  retry: "countdown" | number | null;
}

const ADHOC_UNKNOWN_ERROR: AdhocErrorSpec = {
  icon: "mdi:alert-circle-outline",
  title: "adhoc_error_unknown",
  retry: "countdown",
};

/** Keyed by the WebSocket error code, the one table both the message and the
 *  retry decision read from. */
const ADHOC_ERRORS: Readonly<Record<string, AdhocErrorSpec>> = {
  same_stop: {
    icon: "mdi:map-marker-alert-outline",
    title: "adhoc_error_same_stop",
    detail: "adhoc_error_same_stop_detail",
    retry: null,
  },
  rate_limited: { icon: "mdi:timer-sand", title: "adhoc_error_rate_limited", retry: "countdown" },
  not_loaded: {
    icon: "mdi:power-plug-off-outline",
    title: "adhoc_error_not_loaded",
    detail: "adhoc_error_not_loaded_detail",
    retry: ADHOC_NOT_LOADED_RETRY_MS,
  },
  invalid_stop: {
    icon: "mdi:map-marker-question-outline",
    title: "adhoc_error_invalid_stop",
    detail: "adhoc_error_invalid_stop_detail",
    retry: null,
  },
  catalogue_unavailable: {
    icon: "mdi:cloud-off-outline",
    title: "adhoc_error_catalogue",
    retry: "countdown",
  },
  upstream: { icon: "mdi:cloud-off-outline", title: "adhoc_error_upstream", retry: "countdown" },
};

/** `invalid_query` — the trip planner refused the query itself — told apart
 *  by the backend's translation key. Asking again soon gets the same answer. */
const ADHOC_QUERY_ERRORS: Readonly<Record<string, AdhocErrorSpec>> = {
  route_too_close: {
    icon: "mdi:map-marker-distance",
    title: "adhoc_error_too_close",
    detail: "adhoc_error_too_close_detail",
    retry: null,
  },
  route_stop_invalid: {
    icon: "mdi:map-marker-question-outline",
    title: "adhoc_error_stop_unknown",
    detail: "adhoc_error_stop_unknown_detail",
    retry: null,
  },
  route_outside_timetable: {
    icon: "mdi:calendar-remove-outline",
    title: "adhoc_error_no_timetable",
    detail: "adhoc_error_no_timetable_detail",
    retry: ADHOC_NO_TIMETABLE_RETRY_MS,
  },
};

const ADHOC_QUERY_ERROR_FALLBACK: AdhocErrorSpec = {
  icon: "mdi:map-marker-alert-outline",
  title: "adhoc_error_refused",
  detail: "adhoc_error_refused_detail",
  retry: null,
};

export function adhocErrorSpec(code: string, translationKey?: string | null): AdhocErrorSpec {
  if (code === "invalid_query") {
    return (translationKey && ADHOC_QUERY_ERRORS[translationKey]) || ADHOC_QUERY_ERROR_FALLBACK;
  }
  return ADHOC_ERRORS[code] ?? ADHOC_UNKNOWN_ERROR;
}

/** After how long to retry an error on its own, or null to wait for the user. */
export function adhocRetryDelay(spec: AdhocErrorSpec, retryAfterSeconds: number | null): number | null {
  if (spec.retry === "countdown") {
    return Math.max(1, retryAfterSeconds ?? ADHOC_RETRY_MS / 1000) * 1000;
  }
  return spec.retry;
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

/** Lower-case, accents and ß folded, so "wahringer" finds "Währinger" and
 *  "strasse" finds "Straße". */
export function foldStopText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

/** Every label folded by `foldStopText`, index for index. */
export function foldStopLabels(stops: readonly AdhocStopOption[]): string[] {
  return stops.map((stop) => foldStopText(stop.label));
}

/** How many suggestions the stop combobox lists at once. Enough to scroll
 *  through, few enough that each keystroke re-renders instantly. */
const STOP_SUGGESTION_LIMIT = 50;

/** Stops matching `query`, best first, capped at `limit`.
 *
 *  Every word of the query has to appear. A label that starts with the query
 *  ranks first, then one where a word starts with it, then any other hit.
 *  Within a rank the list keeps its order, which is nearest to home first, so
 *  "Stephansplatz" near home beats a namesake across town. An empty query
 *  returns the list as it came.
 *
 *  `folded` is `foldStopLabels(stops)`, passed in by a caller that filters the
 *  same list on every keystroke so ~1,800 labels aren't folded each time. */
export function filterStops(
  stops: readonly AdhocStopOption[],
  query: string,
  limit = STOP_SUGGESTION_LIMIT,
  folded?: readonly string[],
): { matches: AdhocStopOption[]; total: number } {
  const words = foldStopText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return { matches: stops.slice(0, limit), total: stops.length };
  const first = words[0]!;
  const ranked: Array<{ stop: AdhocStopOption; rank: number; index: number }> = [];
  stops.forEach((stop, index) => {
    const label = folded?.[index] ?? foldStopText(stop.label);
    if (!words.every((word) => label.includes(word))) return;
    const rank = label.startsWith(first)
      ? 0
      : new RegExp(`(^|[\\s(\\-/·])${first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(label)
        ? 1
        : 2;
    ranked.push({ stop, rank, index });
  });
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
  return { matches: ranked.slice(0, limit).map((r) => r.stop), total: ranked.length };
}
