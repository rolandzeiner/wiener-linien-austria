// Wiener Linien Austria — Route Card (experimental).
//
// Shows the best A→B connection from a route entry's
// `sensor.<route>_next_connection`: a "leave in" countdown, the trip drawn as
// a strand whose ride segments carry each line's own colour (the way the
// network map draws it), a buffer badge on every change, and the next few
// connections behind a disclosure.
//
// Colour discipline: nothing here introduces a palette. Line colours come off
// the same GTFS ladder as every other card (`chipPalette`), and the transfer
// grades use the portfolio's semantic tokens as a tint plus an edge stripe —
// never as the text colour — so the label keeps body-text contrast in both
// themes and the grade is carried by icon + words, not hue (WCAG 1.4.1).

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
import type {
  HomeAssistant,
  LovelaceCardEditor,
  RouteAttrs,
  RouteLegAttr,
  RouteTransferAttr,
  RouteTripAttr,
  WienerLinienRouteCardConfig,
  WindowWithCustomCards,
} from "./types.js";
import { chipPalette } from "./utils/config.js";
import { lineTypeIcon, LINE_TYPE_METRO } from "./utils/mot.js";
import { safeDomId } from "./utils/html.js";
import {
  clockOf,
  findRouteEntities,
  minutesUntil,
  normaliseRouteConfig,
  RISK_ICON,
  ROUTE_CARD_TYPE,
  transitLegs,
  upcomingTrips,
  windowDays,
  windowRange,
  type NormalisedRouteConfig,
} from "./utils/route.js";

const ATTRIBUTION = "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";
// The countdown only shows whole minutes, so a 15 s tick is at most a quarter
// minute stale while costing nothing measurable.
const TICK_MS = 15_000;
const MAX_NOTICES = 2;

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

  private _tick: ReturnType<typeof setInterval> | null = null;
  private _versionCheckDone = false;

  public setConfig(config: WienerLinienRouteCardConfig): void {
    this._config = normaliseRouteConfig(config);
  }

  public getCardSize(): number {
    return 6;
  }

  public getGridOptions(): {
    columns: number;
    rows: "auto";
    min_columns: number;
    min_rows: number;
  } {
    return { columns: 6, rows: "auto", min_columns: 4, min_rows: 4 };
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
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._tick !== null) clearInterval(this._tick);
    this._tick = null;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has("hass") && !this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (!changed.has("hass") || changed.size > 1) return true;
    const prev = changed.get("hass") as HomeAssistant | undefined;
    const eid = this._config.entity;
    return !prev || !eid || prev.states[eid] !== this.hass?.states[eid];
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

  private get _lang(): string {
    return (this.hass?.language ?? "de").startsWith("en") ? "en" : "de";
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    const cfg = this._config;
    if (!cfg) return nothing;
    const state = cfg.entity ? this.hass?.states[cfg.entity] : undefined;
    const attrs = (state?.attributes ?? {}) as RouteAttrs;
    const heading =
      cfg.title ||
      (attrs.origin && attrs.destination
        ? `${attrs.origin} → ${attrs.destination}`
        : this._t("heading_fallback"));
    const attribution = cfg.hide_attribution
      ? ""
      : (typeof attrs.attribution === "string" && attrs.attribution) || ATTRIBUTION;

    return html`
      <ha-card>
        <div class="wrap">
          ${renderVersionBanner(this._versionMismatch, (k) => this._t(k))}
          <h2 class="heading">
            <ha-icon icon="mdi:map-marker-path" aria-hidden="true"></ha-icon>
            <span>${heading}</span>
          </h2>
          ${this._renderBody(cfg, state?.state, attrs)}
          ${attribution ? html`<div class="attribution">${attribution}</div>` : nothing}
        </div>
      </ha-card>
    `;
  }

  private _renderBody(
    cfg: NormalisedRouteConfig,
    stateValue: string | undefined,
    attrs: RouteAttrs,
  ): TemplateResult {
    if (!cfg.entity) return this._empty("mdi:routes", this._t("no_entity"));
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
    const best = trips[0];
    if (!best) {
      return this._empty(
        "mdi:timetable",
        this._t("no_trips"),
        this._t("no_trips_detail"),
      );
    }
    const alternatives = trips.slice(1, 1 + cfg.alternatives);
    return html`
      ${this._renderHero(best)}
      ${this._renderNotices(best, attrs)}
      ${this._renderStrand(best, attrs)}
      ${alternatives.length ? this._renderAlternatives(alternatives, attrs) : nothing}
    `;
  }

  private _empty(icon: string, title: string, detail?: string): TemplateResult {
    return html`
      <div class="empty" role="status">
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

  private _renderHero(trip: RouteTripAttr): TemplateResult {
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

  private _renderNotices(trip: RouteTripAttr, attrs: RouteAttrs): TemplateResult | typeof nothing {
    const lines = new Set(transitLegs(trip).map((leg) => leg.line ?? ""));
    const notices = (attrs.traffic_info ?? [])
      .filter((n) => (n.related_lines ?? []).some((line) => lines.has(line)))
      .slice(0, MAX_NOTICES);
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
            ${this._renderLeg(leg, colour, i === 0, attrs)}
            ${transfer && i < legs.length - 1 ? this._renderTransfer(transfer) : nothing}
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
  ): TemplateResult {
    const departs = leg.origin.estimated ?? leg.origin.planned;
    const late = leg.origin.delay_minutes ?? 0;
    const icon = lineTypeIcon(leg.type ?? undefined);
    const stops =
      leg.stop_count === 1
        ? this._t("stops_one")
        : this._t("stops_many", { n: leg.stop_count });
    const platform = this._platformText(leg);
    return html`
      <li class="leg" style=${styleMap({ "--leg-colour": colour })}>
        <div class="stop">
          <span class=${first ? "node node--start" : "node"} aria-hidden="true"></span>
          <time datetime=${departs ?? ""}>${clockOf(departs)}</time>
          <span class="stop-name">${leg.origin.name}</span>
          ${platform ? html`<span class="platform">${platform}</span>` : nothing}
        </div>
        <div class="ride">
          ${this._renderBadge(leg, attrs)}
          ${icon
            ? html`<ha-icon class="type-icon" icon=${icon} aria-hidden="true"></ha-icon>`
            : nothing}
          <span class="towards">
            ${leg.towards ? this._t("towards", { towards: leg.towards }) : ""}
          </span>
          <span class="ride-meta">${stops}</span>
          ${late > 0
            ? html`<span class="late">
                <ha-icon icon="mdi:clock-alert-outline" aria-hidden="true"></ha-icon>
                ${this._t("late", { n: late })}
              </span>`
            : nothing}
        </div>
      </li>
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

  private _renderTransfer(transfer: RouteTransferAttr): TemplateResult {
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

    .heading {
      display: flex;
      align-items: center;
      gap: 8px;
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
    .leg::before {
      content: "";
      position: absolute;
      inset-inline-start: calc(var(--strand-x) + var(--node-size) / 2 - var(--strand-width) / 2);
      top: 10px;
      bottom: -10px;
      width: var(--strand-width);
      border-radius: 2px;
      background: var(--leg-colour);
    }
    .transfer::before {
      content: "";
      position: absolute;
      inset-inline-start: calc(var(--strand-x) + var(--node-size) / 2 - 1px);
      top: 0;
      bottom: 0;
      border-inline-start: 2px dotted var(--secondary-text-color);
    }
    .node {
      position: absolute;
      inset-inline-start: var(--strand-x);
      top: 5px;
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

    /* Transfer grade: tint + edge stripe in the semantic token, text in the
       theme's body colour. The 16% mix keeps body-text contrast on both the
       light and the dark card ground. */
    .risk {
      --risk: var(--wl-rt);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px 2px 10px;
      border-radius: var(--wl-radius-sm);
      background: color-mix(in srgb, var(--risk) 16%, transparent);
      box-shadow: inset 3px 0 0 var(--risk);
      color: var(--primary-text-color);
      font-size: 0.8rem;
      font-weight: 600;
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
      background: color-mix(in srgb, var(--wl-warning) 16%, transparent);
      box-shadow: inset 3px 0 0 var(--wl-warning);
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
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
      border-radius: 6px;
    }

    @media (forced-colors: active) {
      .line-badge,
      .risk,
      .notice {
        outline: 1px solid CanvasText;
      }
      .leg::before,
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
