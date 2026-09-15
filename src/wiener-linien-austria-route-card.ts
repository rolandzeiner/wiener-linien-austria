// Wiener Linien Austria — Route Card (experimental).
//
// Shows the best A→B connection: a "leave in" countdown, the trip drawn as a
// strand whose ride segments carry each line's own colour (the way the
// network map draws it), a buffer badge on every change, and the next few
// connections behind a disclosure.
//
// Two modes, one renderer. With `entity` set it reads a route entry's
// `sensor.<route>_next_connection`. Without one it shows From / To stop
// comboboxes and plans on demand over the `wiener_linien_austria/plan`
// WebSocket command (websocket.py), which answers in the sensor's attribute
// shape. Refresh cadence, idle pause and error handling for that mode live in
// utils/route.ts; the backend's cache and request budget in adhoc.py.
//
// Colour discipline: nothing here introduces a palette. Line colours come off
// the same GTFS ladder as every other card (`chipPalette`), and the transfer
// grades use the portfolio's semantic tokens as a flat tint — never as the
// text colour — so the label keeps body-text contrast in both themes and the
// grade is carried by icon + words, not hue (WCAG 1.4.1).

import {
  LitElement,
  css,
  html,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { ROUTE_CARD_VERSION } from "./const.js";
import { registerWlFonts } from "./font-face.js";
import { translate } from "./localize/localize.js";
import "./route-editor.js";
import { checkCardVersionWS, renderVersionBanner } from "./shared-render.js";
import "./stop-combobox.js";
import type { StopComboboxStrings } from "./stop-combobox.js";
import type {
  AdhocStopOption,
  HassWsError,
  HomeAssistant,
  LovelaceCardEditor,
  RouteAttrs,
  RouteAccessStepAttr,
  RouteLegAttr,
  RouteTransferAttr,
  RouteTripAttr,
  WienerLinienRouteCardConfig,
  WindowWithCustomCards,
} from "./types.js";
import { chipPalette } from "./utils/config.js";
import { LINE_TYPE_METRO } from "./utils/mot.js";
import { safeDomId } from "./utils/html.js";
import {
  ACCESS_ICON,
  accessKey,
  ADHOC_DEBOUNCE_MS,
  ADHOC_IDLE_MS,
  ADHOC_RETRY_MS,
  adhocPlanRefreshDelay,
  adhocErrorSpec,
  adhocRetryDelay,
  type AdhocTimeMode,
  clockOf,
  findRouteEntities,
  isInputDateTime,
  legTypeIcon,
  loadAdhocSelection,
  rideKey,
  minutesUntil,
  normaliseRouteConfig,
  RISK_ICON,
  ROUTE_CARD_TYPE,
  saveAdhocSelection,
  transitLegs,
  tripAccessSteps,
  upcomingTrips,
  walkAccess,
  viennaClock,
  viennaDayOffset,
  viennaInputValue,
  viennaShortDate,
  windowDays,
  windowRange,
  type NormalisedRouteConfig,
} from "./utils/route.js";

const ATTRIBUTION = "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";
// The countdown only shows whole minutes, so a 15 s tick is at most a quarter
// minute stale while costing nothing measurable.
const TICK_MS = 15_000;
const MAX_NOTICES = 2;

type AdhocPhase = "idle" | "loading" | "ready" | "error" | "paused";

/** A backend error as the card keeps it: the WebSocket code, how long the
 *  backend asked to wait, and its translation key where the code alone
 *  doesn't say enough (`invalid_query`). */
interface AdhocError {
  code: string;
  retryAfter: number | null;
  translationKey: string | null;
}

function adhocErrorOf(err: unknown): AdhocError {
  const wsError = err as HassWsError | undefined;
  const retryAfter = Number(wsError?.translation_placeholders?.["retry_after"]);
  return {
    code: typeof wsError?.code === "string" ? wsError.code : "unknown",
    retryAfter: Number.isFinite(retryAfter) ? retryAfter : null,
    translationKey: wsError?.translation_key ?? null,
  };
}
type Which = "from" | "to";

const TIME_MODES: readonly AdhocTimeMode[] = ["now", "depart", "arrive"];


{
  const win = window as unknown as WindowWithCustomCards;
  win.customCards = win.customCards ?? [];
  if (!win.customCards.some((c) => c.type === ROUTE_CARD_TYPE)) {
    win.customCards.push({
      type: ROUTE_CARD_TYPE,
      name: "Wiener Linien Austria — Route",
      description: "Next connection from A to B, with transfer buffers",
      preview: true,
      getEntitySuggestion: (hass: HomeAssistant, entityId: string) => {
        if (!entityId.startsWith("sensor.")) return null;
        if (hass?.entities?.[entityId]?.platform !== "wiener_linien_austria") {
          return null;
        }
        if (!findRouteEntities(hass).includes(entityId)) return null;
        return { config: { type: `custom:${ROUTE_CARD_TYPE}`, entity: entityId } };
      },
    });
  }
}

@customElement(ROUTE_CARD_TYPE)
export class WienerLinienAustriaRouteCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRouteConfig;
  @state() private _versionMismatch: string | null = null;
  @state() private _now = Date.now();
  @state() private _alternativesOpen = false;
  /** Rides whose stops are open, by `rideKey`. Survives refreshes, so a list
   *  someone opened doesn't snap shut when the plan updates under it. */
  @state() private _openRides: ReadonlySet<string> = new Set();

  // --- Ad-hoc mode (no `entity`) ---------------------------------------
  @state() private _stops: AdhocStopOption[] | null = null;
  @state() private _stopsError: AdhocError | null = null;
  @state() private _from = "";
  @state() private _to = "";
  /** "Now", or a Vienna wall-clock `datetime-local` value to depart at or
   *  arrive by. Not remembered across reloads: yesterday's "depart at 07:30"
   *  coming back would read as today's plan. */
  @state() private _timeMode: AdhocTimeMode = "now";
  @state() private _when = "";
  @state() private _plan: RouteAttrs | null = null;
  @state() private _phase: AdhocPhase = "idle";
  @state() private _error: AdhocError | null = null;
  @state() private _announcement = "";

  private _tick: ReturnType<typeof setInterval> | null = null;
  private _versionCheckDone = false;
  private _adhocStarted = false;
  private _planKey = "";
  private _planSeq = 0;
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;
  /** When the scheduled refresh is due (epoch ms). Survives a disconnect, so
   *  a card HA re-attaches on a view switch waits out the rest instead of
   *  asking again straight away. */
  private _nextRefreshAt: number | null = null;
  private _comboStringsCache = new Map<string, StopComboboxStrings>();
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _stopsRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private _stopsLoading = false;
  private _pendingRefresh = false;
  private _onScreen = true;
  private _lastInteraction = Date.now();
  private _observer: IntersectionObserver | null = null;

  public setConfig(config: WienerLinienRouteCardConfig): void {
    const previous = this._config;
    this._config = normaliseRouteConfig(config);
    if (this._config.entity) {
      this._stopAdhoc();
      return;
    }
    // A changed default in the editor is the editor's intent: apply it now.
    const cfg = this._config;
    if (
      this._adhocStarted &&
      previous &&
      (previous.from !== cfg.from || previous.to !== cfg.to || previous.step_free !== cfg.step_free)
    ) {
      if (cfg.from) this._from = cfg.from;
      if (cfg.to) this._to = cfg.to;
      this._requestPlan(false);
    }
    this._startAdhoc();
  }

  private get _isAdhoc(): boolean {
    return !!this._config && !this._config.entity;
  }

  public getCardSize(): number {
    return 6;
  }

  /** Sections-view sizing, per the HA custom-card docs: half the 12-column
   *  section by default (a multiple of 3, as the docs recommend), never
   *  narrower than the pickers and strand stay readable at. `rows` is left out
   *  on purpose — the docs' way to say "size to content", which this card
   *  needs because opening the alternatives or a stop list grows it. A size
   *  set in the dashboard's layout tab lands in `grid_options` and wins over
   *  these defaults. */
  public getGridOptions(): { columns: number; min_columns: number } {
    return { columns: 6, min_columns: 4 };
  }

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement(`${ROUTE_CARD_TYPE}-editor`) as LovelaceCardEditor;
  }

  public static getStubConfig(hass: HomeAssistant): Partial<WienerLinienRouteCardConfig> {
    const first = findRouteEntities(hass)[0];
    return first ? { entity: first } : {};
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    registerWlFonts();
    this._now = Date.now();
    this._tick = setInterval(() => {
      this._now = Date.now();
    }, TICK_MS);
    if (!this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
    this._lastInteraction = Date.now();
    document.addEventListener("visibilitychange", this._onVisibilityChange);
    this._startAdhoc();
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._tick !== null) clearInterval(this._tick);
    this._tick = null;
    document.removeEventListener("visibilitychange", this._onVisibilityChange);
    this._stopAdhoc();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has("hass") && !this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
    if (changed.has("hass")) this._startAdhoc();
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (!changed.has("hass") || changed.size > 1) return true;
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev) return true;
    const eid = this._config.entity;
    // Ad-hoc mode reads nothing from the state machine, and re-rendering two
    // 1,800-option pickers on every state change anywhere in HA is not free.
    if (!eid) return prev.language !== this.hass?.language;
    return prev.states[eid] !== this.hass?.states[eid];
  }

  // ------------------------------------------------------------------
  // Ad-hoc mode: lifecycle
  // ------------------------------------------------------------------

  private _startAdhoc(): void {
    if (this._adhocStarted || !this._isAdhoc || !this.isConnected || !this.hass?.callWS) {
      return;
    }
    this._adhocStarted = true;
    const cfg = this._config!;
    if (!this._from && !this._to) {
      const saved = loadAdhocSelection();
      this._from = saved?.from || cfg.from;
      this._to = saved?.to || cfg.to;
    }
    void this._loadStops();
    if (typeof IntersectionObserver !== "undefined") {
      this._observer = new IntersectionObserver((entries) => {
        this._onScreen = entries.some((entry) => entry.isIntersecting);
        this._catchUp();
      });
      this._observer.observe(this);
    }
    if (this._from && this._to) {
      // Reconnecting with a plan already on screen: refresh only once due.
      if (this._plan && this._planKey === this._queryKey()) {
        const remaining =
          this._nextRefreshAt === null ? 0 : this._nextRefreshAt - Date.now();
        if (remaining > 0) {
          this._schedule(remaining);
        } else {
          this._pendingRefresh = true;
          this._catchUp();
        }
      } else {
        void this._runPlan(false);
      }
    }
  }

  private _stopAdhoc(): void {
    this._adhocStarted = false;
    for (const timer of [this._refreshTimer, this._debounceTimer, this._stopsRetryTimer]) {
      if (timer !== null) clearTimeout(timer);
    }
    this._refreshTimer = this._debounceTimer = this._stopsRetryTimer = null;
    this._observer?.disconnect();
    this._observer = null;
  }

  private _onVisibilityChange = (): void => {
    this._catchUp();
  };

  /** Whether a refresh would be seen. Off screen or in a background tab it
   *  would only spend the upstream's time. */
  private _canRefresh(): boolean {
    return this.isConnected && this._onScreen && document.visibilityState !== "hidden";
  }

  private _catchUp(): void {
    if (this._pendingRefresh && this._canRefresh()) {
      this._pendingRefresh = false;
      this._refreshDue();
    }
  }

  private _refreshDue(): void {
    if (!this._canRefresh()) {
      this._pendingRefresh = true;
      return;
    }
    if (Date.now() - this._lastInteraction > ADHOC_IDLE_MS) {
      this._phase = "paused";
      return;
    }
    void this._runPlan(false);
  }

  private _schedule(delayMs: number): void {
    if (this._refreshTimer !== null) clearTimeout(this._refreshTimer);
    this._refreshTimer = null;
    this._nextRefreshAt = Date.now() + delayMs;
    // An answer landing after the card was removed must not start a timer.
    if (!this._adhocStarted) return;
    this._refreshTimer = setTimeout(() => {
      this._refreshTimer = null;
      this._refreshDue();
    }, delayMs);
  }

  private _requestPlan(userInitiated: boolean): void {
    if (this._debounceTimer !== null) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._debounceTimer = null;
      void this._runPlan(userInitiated);
    }, ADHOC_DEBOUNCE_MS);
  }

  /** Any touch or key press inside the card counts as someone looking, and
   *  resumes a paused card. */
  private _onCardActivity = (): void => {
    if (!this._isAdhoc) return;
    this._lastInteraction = Date.now();
    if (this._phase === "paused") void this._runPlan(true);
  };

  private async _loadStops(): Promise<void> {
    if (this._stops || this._stopsLoading || !this.hass?.callWS) return;
    this._stopsLoading = true;
    try {
      const result = await this.hass.callWS<{ stops: AdhocStopOption[] }>({
        type: "wiener_linien_austria/stops",
      });
      const stops = Array.isArray(result?.stops) ? result.stops : [];
      this._stops = stops;
      this._stopsError = null;
    } catch (err) {
      const error = adhocErrorOf(err);
      this._stopsError = error;
      const delay = adhocRetryDelay(adhocErrorSpec(error.code), error.retryAfter);
      if (delay !== null && this._adhocStarted) {
        this._stopsRetryTimer = setTimeout(() => {
          this._stopsRetryTimer = null;
          void this._loadStops();
        }, delay);
      }
    } finally {
      this._stopsLoading = false;
    }
  }

  private async _runPlan(userInitiated: boolean): Promise<void> {
    if (this._refreshTimer !== null) clearTimeout(this._refreshTimer);
    this._refreshTimer = null;
    this._nextRefreshAt = null;
    this._pendingRefresh = false;
    const { _from: from, _to: to } = this;
    const seq = ++this._planSeq;
    if (!from || !to) {
      this._plan = null;
      this._planKey = "";
      this._error = null;
      this._phase = "idle";
      return;
    }
    if (from === to) {
      this._plan = null;
      this._planKey = "";
      this._error = { code: "same_stop", retryAfter: null, translationKey: null };
      this._phase = "error";
      if (userInitiated) this._announce(this._adhocError(this._error).title);
      return;
    }
    if (!this.hass?.callWS) return;

    const key = this._queryKey();
    if (this._planKey !== key) {
      this._plan = null;
      this._alternativesOpen = false;
    }
    if (!this._plan) this._phase = "loading";
    try {
      const planned = this._timeMode !== "now" && isInputDateTime(this._when);
      const plan = await this.hass.callWS<RouteAttrs>({
        type: "wiener_linien_austria/plan",
        origin: Number(from),
        destination: Number(to),
        ...(planned ? { datetime: this._when, arrive_by: this._timeMode === "arrive" } : {}),
        ...(this._config?.step_free ? { step_free: true } : {}),
      });
      if (seq !== this._planSeq) return;
      this._plan = plan;
      this._planKey = key;
      this._error = null;
      this._phase = "ready";
      if (userInitiated) this._announce(this._planAnnouncement(plan));
      this._schedule(adhocPlanRefreshDelay(plan, Date.now()));
    } catch (err) {
      if (seq !== this._planSeq) return;
      const error = adhocErrorOf(err);
      this._error = error;
      // A stale plan through an outage reads as "these still run"; show the
      // problem instead, as the route sensor does when it goes unavailable.
      this._plan = null;
      this._planKey = "";
      this._phase = "error";
      if (userInitiated) this._announce(this._adhocError(error).title);
      const delay = adhocRetryDelay(
        adhocErrorSpec(error.code, error.translationKey),
        error.retryAfter,
      );
      if (delay !== null) this._schedule(delay);
    }
  }

  private _onPick(which: Which, value: unknown): void {
    const next = typeof value === "string" || typeof value === "number" ? String(value) : "";
    if (which === "from") this._from = next;
    else this._to = next;
    saveAdhocSelection({ from: this._from, to: this._to });
    this._lastInteraction = Date.now();
    this._requestPlan(true);
  }

  /** Identifies what is being asked, so an answer for an older question
   *  never stands in for the current one. */
  private _queryKey(): string {
    const when = this._timeMode === "now" ? "now" : `${this._timeMode}@${this._when}`;
    return `${this._from}>${this._to}|${when}|${this._config?.step_free ? "step-free" : ""}`;
  }

  private _onTimeMode(mode: AdhocTimeMode): void {
    if (mode === this._timeMode) return;
    if (mode !== "now" && !isInputDateTime(this._when)) {
      this._when = viennaInputValue(Date.now());
    }
    this._timeMode = mode;
    this._lastInteraction = Date.now();
    this._requestPlan(true);
  }

  private _onWhen = (ev: Event): void => {
    const value = (ev.target as HTMLInputElement).value;
    // A cleared field leaves the last valid time in charge rather than
    // quietly planning for "now" under a "depart at" label.
    if (!isInputDateTime(value) || value === this._when) return;
    this._when = value;
    this._lastInteraction = Date.now();
    this._requestPlan(true);
  };

  private _swap = (): void => {
    [this._from, this._to] = [this._to, this._from];
    saveAdhocSelection({ from: this._from, to: this._to });
    this._lastInteraction = Date.now();
    this._requestPlan(true);
  };


  /** Re-setting identical text wouldn't be announced, so nudge it. */
  private _announce(text: string): void {
    this._announcement = text === this._announcement ? `${text} ` : text;
  }

  private _planAnnouncement(plan: RouteAttrs): string {
    const best = upcomingTrips(plan, Date.now())[0];
    if (!best) return this._t("adhoc_no_trips");
    const summary = this._tripSummary(best);
    if (plan.planned_for) {
      return this._t("adhoc_announce_planned", {
        day: this._dayText(best.departure),
        time: clockOf(best.departure),
        summary,
      });
    }
    const minutes = minutesUntil(best.departure, Date.now());
    return minutes === 0
      ? this._t("adhoc_announce_now", { summary })
      : this._t("adhoc_announce", { n: minutes ?? 0, summary });
  }

  private _adhocError(error: AdhocError): { icon: string; title: string; detail?: string } {
    const spec = adhocErrorSpec(error.code, error.translationKey);
    const detail =
      spec.retry === "countdown"
        ? this._t("adhoc_error_retry_detail", {
            s: error.retryAfter ?? Math.round(ADHOC_RETRY_MS / 1000),
          })
        : spec.detail && this._t(spec.detail);
    return { icon: spec.icon, title: this._t(spec.title), ...(detail ? { detail } : {}) };
  }

  private async _checkCardVersion(): Promise<void> {
    try {
      this._versionMismatch = await checkCardVersionWS(
        this.hass,
        "wiener_linien_austria/route_card_version",
        ROUTE_CARD_VERSION,
      );
    } catch (err) {
      console.warn(`[${ROUTE_CARD_TYPE}] version probe failed`, err);
    }
  }

  private _t(key: string, replacements?: Record<string, string | number>): string {
    return translate(`route.${key}`, { hassLanguage: this.hass?.language }, replacements);
  }

  /** "heute", "morgen" or "Di., 15.09." for a departure. */
  private _dayText(iso: string | null): string {
    const offset = viennaDayOffset(iso, this._now);
    if (offset === 0) return this._t("day_today");
    if (offset === 1) return this._t("day_tomorrow");
    return iso ? viennaShortDate(iso, this._lang) : "";
  }

  private get _lang(): string {
    return (this.hass?.language ?? "de").startsWith("en") ? "en" : "de";
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    const cfg = this._config;
    if (!cfg) return nothing;
    const adhoc = !cfg.entity;
    const state = cfg.entity ? this.hass?.states[cfg.entity] : undefined;
    const attrs = ((adhoc ? this._plan : state?.attributes) ?? {}) as RouteAttrs;
    const heading =
      cfg.title ||
      (adhoc
        ? this._t("adhoc_heading")
        : attrs.origin && attrs.destination
          ? `${attrs.origin} → ${attrs.destination}`
          : this._t("heading_fallback"));
    const attribution = cfg.hide_attribution
      ? ""
      : (typeof attrs.attribution === "string" && attrs.attribution) || ATTRIBUTION;

    return html`
      <ha-card @pointerdown=${this._onCardActivity} @keydown=${this._onCardActivity}>
        <div class="wrap">
          ${renderVersionBanner(this._versionMismatch, (k) => this._t(k))}
          <div class="header">
            <h2 class="heading">
              <ha-icon icon="mdi:map-marker-path" aria-hidden="true"></ha-icon>
              <span>${heading}</span>
            </h2>
            ${this._renderUpdated(attrs.fetched_at)}
          </div>
          ${adhoc
            ? html`
                ${this._renderPickers()} ${this._renderTimeControl()}
                <p class="sr-only" role="status" aria-live="polite">${this._announcement}</p>
                <div class="results" aria-busy=${this._phase === "loading" ? "true" : "false"}>
                  ${this._renderAdhocBody(cfg)}
                </div>
              `
            : this._renderBody(cfg, state?.state, attrs)}
          ${attribution ? html`<div class="attribution">${attribution}</div>` : nothing}
        </div>
      </ha-card>
    `;
  }

  /** "Zuletzt aktualisiert 07:40": when the upstream last answered, so a
   *  plan kept on screen through an outage can't pass for a fresh one. */
  private _renderUpdated(fetchedAt: string | null | undefined): TemplateResult | typeof nothing {
    const clock = viennaClock(fetchedAt);
    if (!clock || !fetchedAt) return nothing;
    return html`<p class="updated">
      <ha-icon icon="mdi:update" aria-hidden="true"></ha-icon>
      <time datetime=${fetchedAt}>${this._t("updated", { time: clock })}</time>
    </p>`;
  }

  // ------------------------------------------------------------------
  // Ad-hoc mode: render
  // ------------------------------------------------------------------

  private _renderPickers(): TemplateResult {
    if (this._stops === null) {
      if (this._stopsError) return html``;
      return html`<p class="picker-status">${this._t("adhoc_stops_loading")}</p>`;
    }
    return html`
      <fieldset class="pickers">
        <legend class="sr-only">${this._t("adhoc_legend")}</legend>
        ${this._renderPicker("from", this._t("adhoc_from"))}
        <button
          type="button"
          class="swap"
          aria-label=${this._t("adhoc_swap")}
          title=${this._t("adhoc_swap")}
          ?disabled=${!this._from && !this._to}
          @click=${this._swap}
        >
          <ha-icon icon="mdi:swap-vertical" aria-hidden="true"></ha-icon>
        </button>
        ${this._renderPicker("to", this._t("adhoc_to"))}
      </fieldset>
    `;
  }

  /** Now / depart at / arrive by, plus the time field once it matters.
   *  Native radios give arrow-key movement and one tab stop for free. */
  private _renderTimeControl(): TemplateResult | typeof nothing {
    if (this._stops === null) return nothing;
    const labels: Record<AdhocTimeMode, string> = {
      now: this._t("when_now"),
      depart: this._t("when_depart"),
      arrive: this._t("when_arrive"),
    };
    return html`
      <fieldset class="when">
        <legend class="sr-only">${this._t("when_legend")}</legend>
        <div class="when-modes">
          ${TIME_MODES.map(
            (mode) => html`<label class="when-mode">
              <input
                type="radio"
                name="wl-adhoc-when"
                .checked=${this._timeMode === mode}
                @change=${() => this._onTimeMode(mode)}
              />
              <span>${labels[mode]}</span>
            </label>`,
          )}
        </div>
        ${this._timeMode === "now"
          ? nothing
          : html`<label class="when-field">
              <span class="sr-only">${this._t("when_input")}</span>
              <input type="datetime-local" .value=${this._when} @change=${this._onWhen} />
            </label>`}
      </fieldset>
    `;
  }

  /** One strings object per picker and language: a fresh object on every
   *  render (the clock ticks every 15 s) would re-render both pickers. */
  private _comboStrings(label: string): StopComboboxStrings {
    const cacheKey = `${this.hass?.language ?? ""}|${label}`;
    let strings = this._comboStringsCache.get(cacheKey);
    if (!strings) {
      strings = {
        label,
        toggle: this._t("adhoc_show_stops"),
        noMatch: this._t("adhoc_no_match"),
        noResults: this._t("adhoc_no_results"),
        count: (shown, total) =>
          shown < total
            ? this._t("adhoc_matches_more", { shown, total })
            : this._t("adhoc_matches", { n: total }),
      };
      this._comboStringsCache.set(cacheKey, strings);
    }
    return strings;
  }

  private _renderPicker(which: Which, label: string): TemplateResult {
    return html`<wiener-linien-austria-stop-combobox
      class=${`picker picker--${which}`}
      .stops=${this._stops ?? []}
      .value=${which === "from" ? this._from : this._to}
      .idBase=${`wl-adhoc-${which}`}
      .strings=${this._comboStrings(label)}
      @stop-picked=${(ev: CustomEvent<{ value: string }>) => this._onPick(which, ev.detail.value)}
    ></wiener-linien-austria-stop-combobox>`;
  }

  private _renderAdhocBody(cfg: NormalisedRouteConfig): TemplateResult {
    // Live announcements go through the one status line above, so these
    // empties stay silent (`live` false) instead of speaking twice.
    if (this._stopsError) {
      const { icon, title, detail } = this._adhocError(this._stopsError);
      return this._empty(icon, title, detail, false);
    }
    if (this._stops === null) return html``;
    if (!this._from || !this._to) {
      return this._empty(
        "mdi:map-search-outline",
        this._t("adhoc_pick"),
        this._t("adhoc_pick_detail"),
        false,
      );
    }
    if (this._phase === "error" && this._error) {
      const { icon, title, detail } = this._adhocError(this._error);
      return this._empty(icon, title, detail, false);
    }
    const paused =
      this._phase === "paused"
        ? html`<div class="paused">
            <ha-icon icon="mdi:pause-circle-outline" aria-hidden="true"></ha-icon>
            <span>${this._t("adhoc_paused")}</span>
            <button type="button" @click=${this._onCardActivity}>${this._t("adhoc_resume")}</button>
          </div>`
        : nothing;
    const plan = this._plan;
    if (!plan) {
      return this._phase === "paused"
        ? html`${paused}`
        : this._empty("mdi:timer-sand", this._t("adhoc_loading"), undefined, false);
    }
    // Budget spent: the plan on screen is older than usual. The header's
    // "Zuletzt aktualisiert" already says how old; this says why.
    const stale =
      plan.stale && this._phase !== "paused"
        ? html`<p class="stale-note">
            <ha-icon icon="mdi:timer-sand" aria-hidden="true"></ha-icon>
            <span>${this._t("adhoc_stale")}</span>
          </p>`
        : nothing;
    const trips = upcomingTrips(plan, this._now);
    if (!trips[0]) {
      return html`${paused}${stale}${this._empty(
        "mdi:timetable",
        this._t("adhoc_no_trips"),
        this._t("adhoc_no_trips_detail"),
        false,
      )}`;
    }
    return html`${paused}${stale}${this._renderTrips(trips, plan, cfg)}`;
  }

  // ------------------------------------------------------------------
  // Route entity mode + shared trip rendering
  // ------------------------------------------------------------------

  private _renderBody(
    cfg: NormalisedRouteConfig,
    stateValue: string | undefined,
    attrs: RouteAttrs,
  ): TemplateResult {
    if (stateValue === undefined) {
      return this._empty(
        "mdi:help-circle-outline",
        this._t("entity_missing", { entity: cfg.entity }),
      );
    }
    if (!findRouteEntities(this.hass).includes(cfg.entity) && stateValue !== "unavailable") {
      // A departure board (or any other sensor) picked by hand in YAML. Say
      // so, instead of the "no connection right now" a missing trips list
      // would otherwise fall through to.
      return this._empty("mdi:swap-horizontal", this._t("not_a_route"));
    }
    if (stateValue === "unavailable") {
      return this._empty(
        "mdi:cloud-off-outline",
        this._t("unavailable"),
        this._t("unavailable_detail"),
      );
    }
    if (attrs.active === false) {
      const days = windowDays(attrs.active_window, this._lang);
      const range = windowRange(attrs.active_window);
      const when = [days, range].filter(Boolean).join(" ");
      return this._empty(
        "mdi:sleep",
        this._t("inactive"),
        when ? this._t("inactive_detail", { when }) : undefined,
      );
    }
    const trips = upcomingTrips(attrs, this._now);
    if (!trips[0]) {
      return this._empty(
        "mdi:timetable",
        this._t("no_trips"),
        this._t("no_trips_detail"),
      );
    }
    return this._renderTrips(trips, attrs, cfg);
  }

  /** The best connection expanded, then the alternatives. Both modes render
   *  through here: an ad-hoc plan arrives in the route sensor's attribute
   *  shape precisely so this stays one path. */
  private _renderTrips(
    trips: RouteTripAttr[],
    attrs: RouteAttrs,
    cfg: NormalisedRouteConfig,
  ): TemplateResult {
    const best = trips[0]!;
    const alternatives = trips.slice(1, 1 + cfg.alternatives);
    return html`
      ${this._renderHero(best, attrs)}
      ${this._renderNotices(best, attrs)}
      ${this._renderStrand(best, attrs)}
      ${alternatives.length ? this._renderAlternatives(alternatives, attrs) : nothing}
      ${this._renderLastConnection(attrs)}
    `;
  }

  /** "Letzte Verbindung ohne Nachtbus 00:20" with its lines, late in the
   *  evening. Gone once it has left, like any other connection. */
  private _renderLastConnection(attrs: RouteAttrs): TemplateResult | typeof nothing {
    const last = attrs.last_connection;
    if (!last || !upcomingTrips({ trips: [last] }, this._now).length) return nothing;
    return html`
      <p class="last-connection">
        <ha-icon icon="mdi:weather-night" aria-hidden="true"></ha-icon>
        <span>${this._t("last_connection", { time: clockOf(last.departure) })}</span>
        <span class="alt-lines">
          ${transitLegs(last).map((leg) => this._renderBadge(leg, attrs))}
        </span>
      </p>
    `;
  }

  private _empty(icon: string, title: string, detail?: string, live = true): TemplateResult {
    return html`
      <div class="empty" role=${live ? "status" : nothing}>
        <ha-icon icon=${icon} aria-hidden="true"></ha-icon>
        <p class="empty-title">${title}</p>
        ${detail ? html`<p class="empty-detail">${detail}</p>` : nothing}
      </div>
    `;
  }

  private _changesText(trip: RouteTripAttr): string {
    if (trip.interchanges === 0) return this._t("direct");
    if (trip.interchanges === 1) return this._t("changes_one");
    return this._t("changes_many", { n: trip.interchanges });
  }

  /** "07:57 to 08:11, 1 change" — the spoken form of a times range. */
  private _tripSummary(trip: RouteTripAttr): string {
    return this._t("trip_summary", {
      dep: clockOf(trip.departure),
      arr: clockOf(trip.arrival),
      changes: this._changesText(trip),
    });
  }

  private _renderHero(trip: RouteTripAttr, attrs: RouteAttrs): TemplateResult {
    if (attrs.planned_for) return this._renderPlannedHero(trip);
    const minutes = minutesUntil(trip.departure, this._now);
    const isNow = minutes === 0;
    const spoken = isNow
      ? this._t("now")
      : this._t("minutes_long", { n: minutes ?? 0 });
    const sub = [
      trip.duration_minutes !== null
        ? this._t("trip_minutes", { n: trip.duration_minutes })
        : "",
      this._changesText(trip),
    ]
      .filter(Boolean)
      .join(", ");
    return html`
      <div class="hero">
        <p class="hero-count">
          <span class="hero-label">${this._t("leave_in")}</span>
          <span class="hero-metric" aria-hidden="true">
            ${isNow
              ? this._t("now")
              : html`${minutes ?? "–"}<span class="hero-unit">min</span>`}
          </span>
          <span class="sr-only">${spoken}</span>
        </p>
        <div class="hero-meta">
          <p class="hero-times">
            <span aria-hidden="true">${clockOf(trip.departure)} – ${clockOf(trip.arrival)}</span>
            <span class="sr-only">${this._tripSummary(trip)}</span>
          </p>
          <p class="hero-sub">${sub}</p>
        </div>
      </div>
    `;
  }

  /** A plan for a chosen time answers "when do I leave?" with a clock time
   *  and its day; a countdown to tomorrow morning would say nothing useful. */
  private _renderPlannedHero(trip: RouteTripAttr): TemplateResult {
    const sub = [
      trip.duration_minutes !== null ? this._t("trip_minutes", { n: trip.duration_minutes }) : "",
      this._changesText(trip),
    ]
      .filter(Boolean)
      .join(", ");
    return html`
      <div class="hero">
        <p class="hero-count">
          <span class="hero-label">${this._t("planned_departs", { day: this._dayText(trip.departure) })}</span>
          <time class="hero-metric" datetime=${trip.departure ?? ""}>${clockOf(trip.departure)}</time>
        </p>
        <div class="hero-meta">
          <p class="hero-times">${this._t("planned_arrives", { time: clockOf(trip.arrival) })}</p>
          <p class="hero-sub">${sub}</p>
        </div>
      </div>
    `;
  }

  private _renderNotices(trip: RouteTripAttr, attrs: RouteAttrs): TemplateResult | typeof nothing {
    const lines = new Set(transitLegs(trip).map((leg) => leg.line ?? ""));
    const lifts = this._liftOutages(trip, attrs).map((outage) => ({
      title: this._t("lift_out_notice", { station: outage.station ?? "" }),
    }));
    const notices = [
      ...lifts,
      ...(attrs.traffic_info ?? []).filter((n) =>
        (n.related_lines ?? []).some((line) => lines.has(line)),
      ),
    ].slice(0, MAX_NOTICES + lifts.length);
    if (!notices.length) return nothing;
    return html`
      <ul class="notices">
        ${notices.map(
          (n) => html`
            <li class="notice">
              <ha-icon icon="mdi:alert-outline" aria-hidden="true"></ha-icon>
              <span>
                <span class="sr-only">${this._t("disruption")}: </span>${n.title ?? ""}
              </span>
            </li>
          `,
        )}
      </ul>
    `;
  }

  /** Lift outages at a station this trip takes a lift at. */
  private _liftOutages(trip: RouteTripAttr, attrs: RouteAttrs): NonNullable<RouteAttrs["elevator_info"]> {
    const stations = new Set(
      tripAccessSteps(trip)
        .filter((step) => step.kind === "elevator" && step.stop_id)
        .map((step) => step.stop_id!),
    );
    return (attrs.elevator_info ?? []).filter((outage) =>
      (outage.stop_ids ?? []).some((id) => stations.has(id)),
    );
  }

  /** "Aufzug nach unten" and friends, with "außer Betrieb" on a lift at a
   *  station that has an outage. Words and an icon, never colour alone. */
  private _renderAccess(
    steps: RouteAccessStepAttr[] | undefined,
    attrs: RouteAttrs,
  ): TemplateResult | typeof nothing {
    const known = (steps ?? []).filter((step) => accessKey(step));
    if (!known.length) return nothing;
    const broken = new Set((attrs.elevator_info ?? []).flatMap((outage) => outage.stop_ids ?? []));
    return html`${known.map((step) => {
      const out = step.kind === "elevator" && !!step.stop_id && broken.has(step.stop_id);
      return html`<span class=${out ? "access access--out" : "access"}>
        <ha-icon
          icon=${out ? "mdi:alert-outline" : ACCESS_ICON[step.kind] ?? "mdi:walk"}
          aria-hidden="true"
        ></ha-icon>
        ${this._t(accessKey(step)!)}${out ? html` · ${this._t("lift_out")}` : nothing}
      </span>`;
    })}`;
  }

  private _lineStyle(line: string, attrs: RouteAttrs): { background: string; color?: string } {
    return chipPalette(line, {}, attrs.line_colors ?? {});
  }

  private _renderBadge(leg: RouteLegAttr, attrs: RouteAttrs): TemplateResult {
    const palette = this._lineStyle(leg.line ?? "", attrs);
    return html`<span
      class="line-badge"
      style=${styleMap({ background: palette.background, color: palette.color ?? "#fff" })}
      >${leg.line}</span
    >`;
  }

  private _platformText(leg: RouteLegAttr): string {
    const platform = leg.origin.platform;
    if (!platform) return "";
    const track = leg.type === LINE_TYPE_METRO || leg.type?.startsWith("ptTrain");
    return this._t(track ? "platform_track" : "platform_stop", { p: platform });
  }

  private _renderStrand(trip: RouteTripAttr, attrs: RouteAttrs): TemplateResult {
    const legs = transitLegs(trip);
    const last = legs[legs.length - 1];
    return html`
      <ol class="strand">
        ${legs.map((leg, i) => {
          const colour = this._lineStyle(leg.line ?? "", attrs).background;
          const transfer: RouteTransferAttr | undefined = trip.transfers[i];
          return html`
            ${this._renderLeg(
              leg,
              colour,
              i === 0,
              attrs,
              !!transfer && i < legs.length - 1,
              i === 0 ? walkAccess(trip, "start") : undefined,
            )}
            ${transfer && i < legs.length - 1 ? this._renderTransfer(transfer, attrs) : nothing}
          `;
        })}
        ${last
          ? html`
              <li class="stop stop--end">
                <span class="node node--end" aria-hidden="true"></span>
                <time datetime=${last.destination.estimated ?? last.destination.planned ?? ""}
                  >${clockOf(last.destination.estimated ?? last.destination.planned)}</time
                >
                <span class="stop-name">${last.destination.name}</span>
                ${this._renderAccess(walkAccess(trip, "end"), attrs)}
              </li>
            `
          : nothing}
      </ol>
    `;
  }

  private _renderLeg(
    leg: RouteLegAttr,
    colour: string,
    first: boolean,
    attrs: RouteAttrs,
    beforeTransfer: boolean,
    accessBefore?: RouteAccessStepAttr[],
  ): TemplateResult {
    const departs = leg.origin.estimated ?? leg.origin.planned;
    const late = leg.origin.delay_minutes ?? 0;
    const icon = legTypeIcon(leg.type, leg.line);
    const stops =
      leg.stop_count === 1
        ? this._t("stops_one")
        : this._t("stops_many", { n: leg.stop_count });
    const between = leg.stops ?? [];
    const key = rideKey(leg);
    const open = between.length > 0 && this._openRides.has(key);
    const listId = safeDomId(`route-stops-${key}`);
    const platform = this._platformText(leg);
    return html`
      <li
        class=${beforeTransfer ? "leg leg--before-transfer" : "leg"}
        style=${styleMap({ "--leg-colour": colour })}
      >
        <div class="stop">
          <span class=${first ? "node node--start" : "node"} aria-hidden="true"></span>
          <time datetime=${departs ?? ""}>${clockOf(departs)}</time>
          <span class="stop-name">${leg.origin.name}</span>
          ${platform ? html`<span class="platform">${platform}</span>` : nothing}
          ${first ? this._renderAccess(accessBefore, attrs) : nothing}
        </div>
        <div class="ride">
          ${this._renderBadge(leg, attrs)}
          ${icon
            ? html`<ha-icon class="type-icon" icon=${icon} aria-hidden="true"></ha-icon>`
            : nothing}
          ${leg.low_floor && attrs.step_free
            ? html`<ha-icon
                  class="type-icon"
                  icon="mdi:wheelchair-accessible"
                  aria-hidden="true"
                ></ha-icon
                ><span class="sr-only">${this._t("low_floor")}</span>`
            : nothing}
          <span class="towards">
            ${leg.towards ? this._t("towards", { towards: leg.towards }) : ""}
          </span>
          ${between.length
            ? html`<button
                type="button"
                class="stops-toggle"
                aria-expanded=${open ? "true" : "false"}
                aria-controls=${listId}
                @click=${() => this._toggleRide(key)}
              >
                ${stops}
                <ha-icon
                  icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}
                  aria-hidden="true"
                ></ha-icon>
              </button>`
            : html`<span class="ride-meta">${stops}</span>`}
          ${this._renderFrequency(leg)}
          ${late > 0
            ? html`<span class="late">
                <ha-icon icon="mdi:clock-alert-outline" aria-hidden="true"></ha-icon>
                ${this._t("late", { n: late })}
              </span>`
            : nothing}
        </div>
        ${between.length
          ? html`<ol
              class="leg-stops"
              id=${listId}
              aria-label=${this._t("stops_between", { line: leg.line ?? "" })}
              ?hidden=${!open}
            >
              ${between.map(
                (stop) => html`<li class="leg-stop">
                  <span class="leg-stop-dot" aria-hidden="true"></span>
                  <time datetime=${stop.time ?? ""}>${clockOf(stop.time)}</time>
                  <span class="leg-stop-name">${stop.name}</span>
                </li>`,
              )}
            </ol>`
          : nothing}
      </li>
    `;
  }

  private _toggleRide(key: string): void {
    const next = new Set(this._openRides);
    if (!next.delete(key)) next.add(key);
    this._openRides = next;
  }

  /** "Echtzeit · alle 5 min · danach 06:23, 06:29": what the departure
   *  boards know about this ride. The live marker is words plus an icon,
   *  never colour alone. */
  private _renderFrequency(leg: RouteLegAttr): TemplateResult | typeof nothing {
    const next = (leg.next_departures ?? []).map(clockOf).filter(Boolean);
    const headway = leg.headway_minutes;
    if (!leg.realtime && !headway && !next.length) return nothing;
    return html`
      ${leg.realtime
        ? html`<span class="live">
            <ha-icon icon="mdi:access-point" aria-hidden="true"></ha-icon>${this._t("live")}
          </span>`
        : nothing}
      ${headway ? html`<span class="ride-meta">${this._t("every_minutes", { n: headway })}</span>` : nothing}
      ${next.length
        ? html`<span class="ride-meta">${this._t("then_at", { times: next.join(", ") })}</span>`
        : nothing}
    `;
  }

  private _riskText(transfer: RouteTransferAttr): string {
    switch (transfer.risk) {
      case "at_risk":
        return this._t("risk_at_risk", { n: Math.abs(transfer.slack_minutes) });
      case "tight":
        return this._t("risk_tight", { n: transfer.slack_minutes });
      default:
        return this._t("risk_ok", { n: transfer.slack_minutes });
    }
  }

  private _renderRisk(transfer: RouteTransferAttr): TemplateResult {
    return html`
      <span class="risk" data-risk=${transfer.risk}>
        <ha-icon icon=${RISK_ICON[transfer.risk]} aria-hidden="true"></ha-icon>
        <span>${this._riskText(transfer)}</span>
      </span>
    `;
  }

  private _renderTransfer(transfer: RouteTransferAttr, attrs: RouteAttrs): TemplateResult {
    return html`
      <li class="transfer" data-risk=${transfer.risk}>
        <span class="node node--transfer" aria-hidden="true"></span>
        <span class="transfer-at">${this._t("transfer_at", { at: transfer.at })}</span>
        ${transfer.walk_minutes > 0
          ? html`<span class="walk">
              <ha-icon icon="mdi:walk" aria-hidden="true"></ha-icon>
              ${this._t("walk", { n: transfer.walk_minutes })}
            </span>`
          : nothing}
        ${this._renderAccess(transfer.access, attrs)}
        ${this._renderRisk(transfer)}
      </li>
    `;
  }

  private _renderAlternatives(trips: RouteTripAttr[], attrs: RouteAttrs): TemplateResult {
    const listId = safeDomId(`route-alt-${this._config?.entity ?? ""}`);
    return html`
      <div class="alternatives">
        <button
          type="button"
          class="alt-toggle"
          aria-expanded=${this._alternativesOpen ? "true" : "false"}
          aria-controls=${listId}
          @click=${() => {
            this._alternativesOpen = !this._alternativesOpen;
          }}
        >
          <ha-icon
            icon=${this._alternativesOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
            aria-hidden="true"
          ></ha-icon>
          ${this._t("alternatives", { n: trips.length })}
        </button>
        <ul class="alt-list" id=${listId} ?hidden=${!this._alternativesOpen}>
          ${trips.map((trip) => this._renderAlternative(trip, attrs))}
        </ul>
      </div>
    `;
  }

  private _renderAlternative(trip: RouteTripAttr, attrs: RouteAttrs): TemplateResult {
    const worst = trip.transfers.reduce<RouteTransferAttr | undefined>(
      (acc, t) => (acc === undefined || t.slack_minutes < acc.slack_minutes ? t : acc),
      undefined,
    );
    return html`
      <li class="alt">
        <span class="alt-times">
          <span aria-hidden="true">${clockOf(trip.departure)} – ${clockOf(trip.arrival)}</span>
          <span class="sr-only">${this._tripSummary(trip)}</span>
        </span>
        <span class="alt-lines">
          ${transitLegs(trip).map((leg) => this._renderBadge(leg, attrs))}
        </span>
        <span class="alt-meta">
          ${trip.duration_minutes !== null
            ? this._t("minutes", { n: trip.duration_minutes })
            : ""}
        </span>
        ${worst ? this._renderRisk(worst) : nothing}
      </li>
    `;
  }

  static override styles = css`
    :host {
      color-scheme: light dark;
      display: block;
      container-type: inline-size;

      /* Portfolio tokens. Values mirror the :host block in card-styles.ts
         byte-for-byte — route-card.test.ts pins them, so a theme change
         made there cannot quietly leave this card behind. */
      --wl-rt: var(--success-color, #43a047);
      --wl-warning: var(--warning-color, #ffa000);
      --wl-error: var(--error-color, #db4437);
      --wl-radius-sm: var(--ha-border-radius-sm, 4px);
      --wl-radius-md: var(--ha-border-radius-md, 8px);
      --wl-pad-x: var(--ha-space-4, 16px);
      --wl-pad-y: var(--ha-space-3, 12px);
      --wl-row-gap: var(--ha-space-3, 12px);
      --wl-metric-size: 2.25rem;

      --strand-width: 4px;
      --node-size: 12px;
      --node-top: 5px;
      /* Where a stop's node is centred, measured from the top of its row.
         Every rail segment starts or ends here, so nodes sit exactly on the
         joins instead of the segments guessing at a shared offset. */
      --node-centre: calc(var(--node-top) + var(--node-size) / 2);
      --strand-x: 6px;
      --leg-colour: var(--primary-color);
    }

    ha-card {
      overflow: hidden;
      font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
    }
    .wrap {
      display: flex;
      flex-direction: column;
      gap: var(--wl-row-gap);
      padding: var(--wl-pad-y) var(--wl-pad-x);
    }
    p {
      margin: 0;
    }
    time {
      font-variant-numeric: tabular-nums;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    /* Heading left, "Zuletzt aktualisiert" right on the same line. On a
       narrow card the time wraps under the heading and stays right-aligned. */
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 2px 12px;
    }
    .heading {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.3;
      color: var(--primary-text-color);
    }
    .heading ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      flex: none;
    }

    /* Hero: the countdown is the answer to "when do I go?" */
    .hero {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 4px 16px;
    }
    .hero-count {
      display: flex;
      flex-direction: column;
    }
    .hero-label {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .hero-metric {
      font-size: var(--wl-metric-size);
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: var(--primary-text-color);
    }
    .hero-unit {
      font-size: 1rem;
      font-weight: 600;
      margin-inline-start: 4px;
    }
    .hero-meta {
      text-align: end;
    }
    .hero-times {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .hero-sub {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }

    /* The strand. Each ride leg paints its own segment in the line colour
       via --leg-colour; transfers and the end stop sit on nodes. The rail is
       decorative: every fact it shows is also written out as text. */
    .strand {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .leg,
    .transfer,
    .stop--end {
      position: relative;
      padding-inline-start: calc(var(--strand-x) * 2 + var(--node-size));
    }
    /* A ride runs from its boarding node down into the next stop's node.
       Before a change it stops at the row's edge instead, and the transfer's
       dotted walk takes over from there. */
    .leg::before {
      content: "";
      position: absolute;
      inset-inline-start: calc(var(--strand-x) + var(--node-size) / 2 - var(--strand-width) / 2);
      top: var(--node-centre);
      bottom: calc(-1 * var(--node-centre));
      width: var(--strand-width);
      border-radius: 2px;
      background: var(--leg-colour);
    }
    .leg--before-transfer::before {
      bottom: 0;
    }
    /* The walk spans the whole transfer row and reaches down into the next
       ride's boarding node, which covers the end of it. */
    .transfer::before {
      content: "";
      position: absolute;
      inset-inline-start: calc(var(--strand-x) + var(--node-size) / 2 - 1px);
      top: 0;
      bottom: calc(-1 * var(--node-centre));
      border-inline-start: 2px dotted var(--secondary-text-color);
    }
    .node {
      position: absolute;
      inset-inline-start: var(--strand-x);
      top: var(--node-top);
      width: var(--node-size);
      height: var(--node-size);
      box-sizing: border-box;
      border-radius: 50%;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      border: 3px solid var(--leg-colour);
      z-index: 1;
    }
    .node--start {
      background: var(--leg-colour);
    }
    .node--transfer {
      top: 50%;
      transform: translateY(-50%);
      border-color: var(--secondary-text-color);
    }
    .node--end {
      border-color: var(--primary-text-color);
      background: var(--primary-text-color);
    }

    .stop {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 2px 8px;
      min-height: 22px;
    }
    .stop time {
      font-weight: 700;
      color: var(--primary-text-color);
    }
    .stop-name {
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .platform {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .ride {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 8px;
      padding-block: 6px 12px;
      font-size: 0.9rem;
      color: var(--secondary-text-color);
    }
    .line-badge {
      display: inline-block;
      min-width: 2.4em;
      padding: 2px 8px;
      border-radius: 6px;
      text-align: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: #fff;
      forced-color-adjust: none;
    }
    .type-icon {
      --mdc-icon-size: 18px;
    }
    .towards {
      color: var(--primary-text-color);
    }
    .late {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .live {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .live ha-icon {
      --mdc-icon-size: 16px;
      color: var(--wl-rt);
    }
    .access {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .access ha-icon {
      --mdc-icon-size: 16px;
    }
    .access--out {
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .access--out ha-icon {
      color: var(--wl-error);
    }
    /* Stops along a ride: the departure board's stops-ahead dots, sat on
       this ride's own rail so they read as stations the line passes. */
    .stops-toggle {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      min-height: 32px;
      padding: 0 4px;
      margin-inline-start: -4px;
      border: none;
      border-radius: var(--wl-radius-sm);
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .stops-toggle ha-icon {
      --mdc-icon-size: 18px;
    }
    .leg-stops {
      --stops-ahead-dot-size: 8px;
      list-style: none;
      margin: 0;
      /* Padding, not margin: a bottom margin collapses through the ride's
         <li>, which ends the ride's box early and leaves a gap before the
         dotted transfer walk (or the end node) picks the line up. */
      padding: 0 0 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .leg-stops[hidden] {
      display: none;
    }
    .leg-stop {
      position: relative;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .leg-stop time {
      font-variant-numeric: tabular-nums;
    }
    .leg-stop-name {
      color: var(--primary-text-color);
    }
    /* Centred on the rail: back out of the row's indent to the strand. */
    .leg-stop-dot {
      position: absolute;
      inset-inline-start: calc(
        var(--strand-x) + var(--node-size) / 2 - var(--stops-ahead-dot-size) / 2 -
          (var(--strand-x) * 2 + var(--node-size))
      );
      top: 50%;
      width: var(--stops-ahead-dot-size);
      height: var(--stops-ahead-dot-size);
      box-sizing: border-box;
      transform: translateY(-50%);
      border-radius: 50%;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      border: 2px solid var(--leg-colour);
      z-index: 1;
    }
    .late ha-icon {
      --mdc-icon-size: 16px;
      color: var(--wl-error);
    }

    .transfer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 8px;
      padding-block: 8px;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .walk {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .walk ha-icon {
      --mdc-icon-size: 16px;
    }
    .stop--end {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 2px 8px;
    }

    /* Transfer grade: a flat tint of the semantic token, text in the theme's
       body colour. The 18% mix keeps body-text contrast on both the light and
       the dark card ground. */
    .risk {
      --risk: var(--wl-rt);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: var(--wl-radius-sm);
      background: color-mix(in srgb, var(--risk) 18%, transparent);
      color: var(--primary-text-color);
      font-size: 0.8rem;
      font-weight: 600;
      /* The inherited line box carries the font's tall ascender, which sat
         the words visibly below the icon's centre. */
      line-height: 1;
    }
    .risk > span {
      text-box: trim-both cap alphabetic;
    }
    .risk ha-icon {
      display: block;
    }
    .risk[data-risk="tight"] {
      --risk: var(--wl-warning);
    }
    .risk[data-risk="at_risk"] {
      --risk: var(--wl-error);
    }
    .risk ha-icon {
      --mdc-icon-size: 16px;
    }

    .notices {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .notice {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 8px 10px;
      border-radius: var(--wl-radius-md);
      background: color-mix(in srgb, var(--wl-warning) 18%, transparent);
      color: var(--primary-text-color);
      font-size: 0.85rem;
    }
    .notice ha-icon {
      --mdc-icon-size: 18px;
      flex: none;
    }

    .alternatives {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      padding-top: 8px;
    }
    .alt-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 44px;
      padding: 0 8px 0 0;
      border: none;
      background: none;
      color: var(--primary-text-color);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .alt-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .alt-list[hidden] {
      display: none;
    }
    .alt {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 10px;
      padding-block: 8px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .alt:first-child {
      border-top: none;
    }
    .alt-times {
      font-weight: 700;
      color: var(--primary-text-color);
    }
    .alt-lines {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .alt-meta {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }

    .last-connection {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 8px;
      font-size: 0.85rem;
      color: var(--primary-text-color);
    }
    .last-connection ha-icon {
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
    }
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 18px 12px;
      text-align: center;
    }
    .empty ha-icon {
      --mdc-icon-size: 28px;
      color: var(--secondary-text-color);
    }
    .empty-title {
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .empty-detail {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }

    .attribution {
      font-size: 0.7rem;
      color: var(--secondary-text-color);
    }
    .updated {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-inline-start: auto;
      font-size: 0.75rem;
      white-space: nowrap;
      color: var(--secondary-text-color);
    }
    .updated ha-icon {
      --mdc-icon-size: 14px;
    }

    /* Ad-hoc pickers: From above To, the swap button beside both. DOM order
       (From, swap, To) is the tab order, so the grid only places. */
    .pickers {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
      margin: 0;
      padding: 0;
      border: none;
      min-inline-size: 0;
    }
    .pickers > .picker--from {
      grid-column: 1;
      grid-row: 1;
    }
    .pickers > .picker--to {
      grid-column: 1;
      grid-row: 2;
    }
    .pickers > .picker {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .swap {
      grid-column: 2;
      grid-row: 1 / span 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 50%;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .swap:disabled {
      cursor: default;
      color: var(--disabled-text-color, var(--secondary-text-color));
    }
    .combo-label {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .combo-field {
      position: relative;
      display: flex;
      align-items: center;
    }
    .combo-field input {
      min-height: 44px;
      box-sizing: border-box;
      width: 100%;
      padding: 0 44px 0 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      border-radius: var(--wl-radius-md);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
    .combo-field[data-open] input {
      border-color: var(--primary-color);
    }
    .combo-field input[aria-invalid="true"] {
      border-color: var(--wl-error);
    }
    .combo-toggle {
      position: absolute;
      inset-inline-end: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: none;
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    /* In flow, not an overlay: ha-card clips anything that pokes out. */
    .combo-list {
      list-style: none;
      margin: 0;
      padding: 4px 0;
      max-height: 240px;
      overflow-y: auto;
      overscroll-behavior: contain;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: var(--wl-radius-md);
      background: var(--card-background-color, var(--ha-card-background, #fff));
    }
    .combo-list[hidden] {
      display: none;
    }
    .combo-option {
      display: flex;
      align-items: center;
      min-height: 40px;
      padding: 4px 12px;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .combo-option[data-enter] {
      background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
      box-shadow: inset 3px 0 0 var(--primary-color);
    }
    .combo-option[data-current] {
      font-weight: 600;
    }
    .combo-option:hover {
      background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    }
    .combo-option[aria-selected="true"] {
      background: color-mix(in srgb, var(--primary-color) 20%, transparent);
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }
    .combo-note {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .field-error {
      font-size: 0.8rem;
      color: var(--primary-text-color);
    }
    /* Time control: three compact chips, the field beside them when needed. */
    .when {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 0;
      border: none;
      min-inline-size: 0;
    }
    .when-modes {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .when-mode {
      position: relative;
      display: inline-flex;
    }
    .when-mode input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }
    .when-mode span {
      display: inline-flex;
      align-items: center;
      /* 32px keeps the chips compact beside the pickers and still clears
         the 24px target minimum (WCAG 2.5.8); the radio covers the chip. */
      min-height: 32px;
      padding: 0 12px;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      border-radius: 999px;
      color: var(--primary-text-color);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .when-mode input:checked + span {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 20%, transparent);
    }
    .when-mode input:focus-visible + span {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .when-field {
      display: inline-flex;
      flex: 1 1 12rem;
      min-width: 0;
    }
    .when-field input {
      width: 100%;
      min-height: 32px;
      box-sizing: border-box;
      padding: 0 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      border-radius: var(--wl-radius-md);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
    .picker-status {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .results {
      display: flex;
      flex-direction: column;
      gap: var(--wl-row-gap);
    }
    .paused {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: var(--wl-radius-md);
      background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
      color: var(--primary-text-color);
      font-size: 0.85rem;
    }
    .paused > span {
      flex: 1;
    }
    .paused ha-icon {
      --mdc-icon-size: 18px;
    }
    .stale-note {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .stale-note ha-icon {
      --mdc-icon-size: 16px;
    }
    .paused > button {
      min-height: 44px;
      padding: 0 14px;
      border: 1px solid var(--primary-text-color);
      border-radius: 999px;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--wl-radius-md);
      background: color-mix(in srgb, var(--wl-warning) 16%, transparent);
      color: var(--primary-text-color);
      font-size: 0.85rem;
    }
    .banner > span {
      flex: 1;
    }
    .banner > button {
      min-height: 32px;
      padding: 0 14px;
      border: 1px solid var(--primary-text-color);
      border-radius: 999px;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    @container (max-width: 320px) {
      .hero-meta {
        text-align: start;
      }
    }

    .alt-toggle:focus-visible,
    .stops-toggle:focus-visible,
    .combo-field input:focus-visible,
    .when-field input:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
      border-radius: 6px;
    }

    @media (forced-colors: active) {
      .when-mode input:checked + span {
        forced-color-adjust: none;
        background: Highlight;
        color: HighlightText;
      }
      .line-badge,
      .risk,
      .notice {
        outline: 1px solid CanvasText;
      }
      .combo-option[aria-selected="true"] {
        forced-color-adjust: none;
        background: Highlight;
        color: HighlightText;
      }
      .combo-option[data-enter] {
        outline: 1px dashed Highlight;
        outline-offset: -2px;
      }
      .leg::before,
      .leg-stop-dot,
      .node {
        forced-color-adjust: none;
        background: CanvasText;
        border-color: CanvasText;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wiener-linien-austria-route-card": WienerLinienAustriaRouteCard;
  }
}
