import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { cardStyles } from "./card-styles.js";
import {
  CARD_VERSION,
  LINE_TYPE_BUS_DAY,
  LINE_TYPE_BUS_NIGHT,
  LINE_TYPE_METRO,
  LINE_TYPE_TRAM,
} from "./const.js";
import { translate } from "./localize/localize.js";
import type {
  DepartureAttr,
  ElevatorInfoAttr,
  TrafficInfoAttr,
  WienerLinienAttrs,
  WienerLinienCardConfig,
} from "./types.js";
import {
  colorForLine,
  normaliseModernConfig,
  type NormalisedModernConfig,
  type NormalisedModernStop,
} from "./utils/config.js";
import { findWienerLinienEntities } from "./utils/entities.js";
import { filterDepartures } from "./utils/departures.js";
import { safeTrafficHtml } from "./utils/html.js";
import { delayMinutes, formatTime } from "./utils/time.js";

// Eager editor import — the skill's gotcha about `await import("./editor")`
// racing against HA's `document.createElement(…-editor)` applies here.
import "./editor.js";

console.info(
  `%c WIENER-LINIEN-AUSTRIA-CARD %c ${CARD_VERSION} `,
  "color: white; background: #E3000F; font-weight: 700;",
  "color: #E3000F; background: white; font-weight: 700;",
);

// Register the card with HA's picker so it shows up in the visual editor's
// "+ Add card" dialog.
(window as unknown as { customCards?: unknown[] }).customCards =
  (window as unknown as { customCards?: unknown[] }).customCards ?? [];
(window as unknown as { customCards: Array<Record<string, unknown>> }).customCards.push({
  type: "wiener-linien-austria-card",
  name: "Wiener Linien Austria",
  description: "Abfahrtsmonitor mit Störungen und Aufzugsinfo",
  preview: true,
});

// Wrap API-sourced German strings (station names, destinations, disturbance
// text) so assistive tech pronounces them correctly even when HA's dashboard
// locale is not German. ASCII fallbacks like the raw entity ID are rendered
// unwrapped — the lang hint would be inaccurate and AT handles ASCII fine.
function deText(raw: string | undefined | null, fallback?: string): TemplateResult | string {
  if (raw) return html`<span lang="de">${raw}</span>`;
  return fallback ?? "";
}

function iconForType(type: string | undefined): string | null {
  switch (type) {
    case LINE_TYPE_METRO:
      return "mdi:subway-variant";
    case LINE_TYPE_TRAM:
      return "mdi:tram";
    case LINE_TYPE_BUS_DAY:
    case LINE_TYPE_BUS_NIGHT:
      return "mdi:bus";
    default:
      return null;
  }
}

// Header tile icon: derives from the next departure's vehicle type so the
// card visually announces *what's coming* (bus / tram / metro). Falls back
// to a generic transit glyph when no rows are available.
function headerIconForType(type: string | undefined): string {
  return iconForType(type) ?? "mdi:bus-stop";
}

// Platform-prefix translation key by vehicle type. U-Bahn stations use
// "Gleis" on platform signage; tram and bus stops use "Steig". Unknown
// types fall back to the bus prefix because most Wien stops are bus
// stops.
function platformLabelKey(type: string | undefined): string {
  if (type === LINE_TYPE_METRO) {
    return "platform_short_rail";
  }
  return "platform_short_bus";
}

@customElement("wiener-linien-austria-card")
export class WienerLinienAustriaCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedModernConfig;
  @state() private _activeTab = 0;
  @state() private _versionMismatch: string | null = null;
  @state() private _expandedTraffic = new Set<string>();
  @state() private _expandedElevator = new Set<string>();
  // Per-row expanded state for the stops_ahead collapsible. Keyed by a
  // stable per-row identifier (entity + line + direction + countdown +
  // planned-time) so re-renders that re-sort the list keep the right row
  // open. Naturally invalidates when a row's countdown changes — closing
  // the panel as the row "ages out" is the right UX.
  @state() private _expandedRows = new Set<string>();
  @state() private _debugTraffic: TrafficInfoAttr[] = [];
  @state() private _debugElevator: Array<ElevatorInfoAttr & { __debug_entity?: string }> = [];

  private _versionCheckDone = false;

  public setConfig(config: WienerLinienCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("wiener-linien-austria-card: config must be an object");
    }
    // Lovelace surfaces the throw verbatim under hui-error-card. Validate
    // the *shape* (not just the type) so a misconfigured YAML produces a
    // clear "what's missing" message instead of a silent empty card.
    const hasEntities = Array.isArray(
      (config as { entities?: unknown }).entities,
    );
    const hasEntity = typeof (config as { entity?: unknown }).entity === "string";
    if (!hasEntities && !hasEntity) {
      throw new Error(
        "wiener-linien-austria-card: 'entities' (array) or legacy 'entity' (string) is required",
      );
    }
    this._config = normaliseModernConfig(config);
  }

  public getCardSize(): number {
    const n = this._config?.entities.length ?? 1;
    return Math.min(12, 3 + n * 3);
  }

  public getGridOptions(): {
    columns: number | "full";
    rows: number | "auto";
    min_columns: number;
    min_rows: number;
  } {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: 3,
    };
  }

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement("wiener-linien-austria-card-editor");
  }

  // Per the dev guide, getStubConfig must NOT include `type:` — HA
  // prepends it. Including it can yield "custom:custom:…" if HA's
  // _createCardElement adds its own prefix. Return type is intentionally
  // partial so the missing `type` doesn't break the WienerLinienCardConfig
  // contract.
  public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
    const entities = findWienerLinienEntities(hass);
    return {
      entities: entities.length ? [entities[0]] : [],
      max_departures: 6,
    };
  }

  public connectedCallback(): void {
    super.connectedCallback();
    // One-shot WS version probe — per-instance, but cheap (HA caches the
    // command registration). Gated by _versionCheckDone so re-adding the
    // card in edit mode doesn't hammer the backend.
    if (!this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
  }

  protected willUpdate(changed: PropertyValues): void {
    // Bounds-check `_activeTab` *before* render so we don't mutate
    // reactive state from inside render() (which would queue a redundant
    // update + log a Lit warning in dev mode). Only re-evaluate when
    // either the config or hass changed — _activeTab itself flipping is
    // a user click, never an out-of-bounds source.
    if (!this._config) return;
    if (changed.has("_config") || changed.has("hass")) {
      const stops = this._resolveStops();
      if (stops.length && this._activeTab >= stops.length) {
        this._activeTab = 0;
      }
    }
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (
      changed.has("_config") ||
      changed.has("_activeTab") ||
      changed.has("_versionMismatch") ||
      changed.has("_expandedTraffic") ||
      changed.has("_expandedElevator") ||
      changed.has("_expandedRows") ||
      changed.has("_debugTraffic") ||
      changed.has("_debugElevator")
    ) {
      return true;
    }
    // hass fires on every state change anywhere in HA — compare identity on
    // only the entities this card actually reads. HA state objects are
    // immutable so === is enough.
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (!prev || !this.hass) return true;
    const eids = this._resolveStops().map((s) => s.entity);
    return eids.some((eid) => prev.states[eid] !== this.hass!.states[eid]);
  }

  private _lang(): string {
    return this.hass?.language?.startsWith("de") ? "de" : "en";
  }

  private _t(key: string, replacements?: Record<string, string | number>): string {
    return translate(`modern.${key}`, { hassLanguage: this.hass?.language }, replacements);
  }

  private async _checkCardVersion(): Promise<void> {
    try {
      const result = (await this.hass!.callWS({
        type: "wiener_linien_austria/card_version",
      })) as { version?: string } | undefined;
      if (result?.version && result.version !== CARD_VERSION) {
        this._versionMismatch = result.version;
      }
    } catch {
      // backend may not yet support the command (older integration version)
    }
  }

  // ------------------------------------------------------------------
  // Resolution helpers
  // ------------------------------------------------------------------

  private _resolveStops(): NormalisedModernStop[] {
    const picked = (this._config?.entities ?? []).filter(
      (s) => this.hass?.states?.[s.entity],
    );
    if (picked.length) return picked;
    const available = findWienerLinienEntities(this.hass);
    return available.length ? [{ entity: available[0] }] : [];
  }

  private _attrs(entityId: string): WienerLinienAttrs {
    return (this.hass?.states?.[entityId]?.attributes ?? {}) as WienerLinienAttrs;
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    if (!this.hass) return html`<ha-card><div class="wrap"></div></ha-card>`;

    const cfg = this._config;
    const stops = this._resolveStops();
    const useTabs = cfg.layout === "tabs" && stops.length >= 2;

    // _activeTab is clamped in willUpdate() — no mutation needed in render.

    const attribution = cfg.hide_attribution
      ? ""
      : stops
          .map((s) => this._attrs(s.entity).attribution)
          .find((v): v is string => typeof v === "string" && v.length > 0) ||
        "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";

    return html`
      <ha-card>
        ${useTabs ? this._renderTabs(stops, this._activeTab) : nothing}
        <div class="wrap">
          ${this._versionMismatch ? this._renderBanner() : nothing}
          ${cfg.show_traffic_info ? this._renderTrafficBanner(stops) : nothing}
          ${this._renderBody(stops, useTabs)}
          ${this._renderFooter(attribution)}
        </div>
      </ha-card>
    `;
  }

  private _renderFooter(attribution: string): TemplateResult | typeof nothing {
    const dev = this._isDevMode();
    if (!attribution && !dev) return nothing;
    return html`
      ${attribution
        ? html`<div class="foot">
            <span class="timestamp">${attribution}</span>
          </div>`
        : nothing}
      ${dev ? this._renderDevModePanel() : nothing}
    `;
  }

  private _renderBody(stops: NormalisedModernStop[], useTabs: boolean): TemplateResult {
    if (!stops.length) return this._renderEmpty();
    if (useTabs) {
      const active = stops[this._activeTab];
      return html`${this._renderStop(active, this._activeTab)}`;
    }
    return html`${stops.map((s) => this._renderStop(s))}`;
  }

  private _renderEmpty(): TemplateResult {
    const available = findWienerLinienEntities(this.hass);
    const key = available.length ? "no_entities_picked" : "no_entities_available";
    return html`<div class="empty" role="status" aria-live="polite">${this._t(key)}</div>`;
  }

  private _renderTabs(stops: NormalisedModernStop[], activeIndex: number): TemplateResult {
    return html`
      <div class="tabs" role="tablist">
        ${stops.map((s, i) => {
          const attrs = this._attrs(s.entity);
          const label = attrs.stop_name || attrs.friendly_name || s.entity;
          const classes = { tab: true, active: i === activeIndex };
          const selected = i === activeIndex;
          return html`<button
            type="button"
            role="tab"
            id=${`wl-tab-${i}`}
            aria-controls=${`wl-tabpanel-${i}`}
            class=${classMap(classes)}
            aria-selected=${selected ? "true" : "false"}
            tabindex=${selected ? "0" : "-1"}
            @click=${() => this._setActiveTab(i)}
            @keydown=${(ev: KeyboardEvent) =>
              this._onTabKeydown(ev, i, stops.length)}
          >${label}</button>`;
        })}
      </div>
    `;
  }

  private _setActiveTab(i: number): void {
    if (Number.isFinite(i) && i !== this._activeTab) {
      this._activeTab = i;
    }
  }

  private _onTabKeydown(ev: KeyboardEvent, index: number, count: number): void {
    let next = index;
    switch (ev.key) {
      case "ArrowRight":
        next = (index + 1) % count;
        break;
      case "ArrowLeft":
        next = (index - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    ev.preventDefault();
    this._setActiveTab(next);
    this.updateComplete.then(() => {
      const tabs = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(
        '.tabs [role="tab"]',
      );
      tabs?.[next]?.focus();
    });
  }

  private _renderStop(stopCfg: NormalisedModernStop, tabIndex?: number): TemplateResult {
    const attrs = this._attrs(stopCfg.entity);
    const apiName = attrs.stop_name || attrs.friendly_name;
    const title = apiName || stopCfg.entity;
    const departures = Array.isArray(attrs.departures) ? attrs.departures : [];
    const filtered = filterDepartures(departures, {
      ...stopCfg,
      accessibility_only: this._config!.accessibility_only,
    });

    const realElevator = Array.isArray(attrs.elevator_info) ? attrs.elevator_info : [];
    const debugElevator = this._debugElevator.filter((e) => e.__debug_entity === stopCfg.entity);
    const elevatorInfos: ElevatorInfoAttr[] = [...realElevator, ...debugElevator];
    const showElevator = this._config!.show_elevator_info && elevatorInfos.length > 0;

    const mapUrl = this._stopMapUrl(title, attrs.latitude, attrs.longitude);
    const openInMaps = this._t("open_in_maps");

    // Hero group — the set of departures shown in the big hero block.
    // Mirrors linz-linien-austria's _computeHeroGroup verbatim: the
    // soonest departure leads, and any others tied on the exact same
    // countdown ride along. When the lead is at "Jetzt" (cd <= 0), we
    // group every other Jetzt departure too — a tram and a bus both
    // showing as Jetzt simultaneously is the case where surfacing
    // both is most useful, even though either has technically already
    // arrived.
    const heroGroup = this._computeHeroGroup(filtered);
    const heroLead = heroGroup[0];

    // When show_hero_metric is on, drop any departure that's already
    // surfaced in the hero from the row list below. Object identity
    // works as the dedupe key because heroGroup members are references
    // into the same `filtered` array. After dedupe, cap at max_departures
    // so "max 6" continues to mean "6 rendered rows" rather than "6
    // rows including any duplicates of the hero".
    const heroDedupe = this._config!.show_hero_metric
      ? new Set<DepartureAttr>(heroGroup)
      : new Set<DepartureAttr>();
    const remaining = filtered.filter((d) => !heroDedupe.has(d));
    const rows = remaining.slice(0, this._config!.max_departures);

    const accent = heroLead
      ? colorForLine(heroLead.line || "", this._config!.line_colors)
      : "var(--primary-color)";
    const headerIcon = headerIconForType(heroLead?.type);

    const cd =
      heroLead && Number.isFinite(heroLead.countdown) ? heroLead.countdown : null;
    const heroValue =
      cd === null ? "—" : cd <= 0 ? this._t("now") : String(cd);
    const heroUnit = cd !== null && cd > 0 ? this._t("min") : "";

    const isPanel = tabIndex !== undefined;
    return html`
      <section
        class="station"
        style="--nb-accent: ${accent};"
        id=${isPanel ? `wl-tabpanel-${tabIndex}` : nothing}
        role=${isPanel ? "tabpanel" : nothing}
        aria-labelledby=${isPanel ? `wl-tab-${tabIndex}` : nothing}
        tabindex=${isPanel ? "0" : nothing}
        aria-label=${title}
      >
        ${this._config!.hide_header
          ? nothing
          : html`<header class="head">
              <span class="icon-tile" aria-hidden="true">
                <ha-icon icon=${headerIcon}></ha-icon>
              </span>
              <div class="title-block">
                <h3 class="title">${deText(apiName, stopCfg.entity)}</h3>
                ${heroLead?.line
                  ? html`<p class="subtitle">${deText(heroLead.towards)}</p>`
                  : nothing}
              </div>
              ${mapUrl
                ? html`<div class="head-actions">
                    <a
                      class="icon-action"
                      href=${mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title=${openInMaps}
                      aria-label="${openInMaps}: ${title}"
                    ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>
                  </div>`
                : nothing}
            </header>`}

        ${this._config!.show_hero_metric && heroLead
          ? html`<div class="hero">
              <div class="hero-time" aria-live="polite" aria-atomic="true">
                <span class="hero-min">${heroValue}</span>
                ${heroUnit
                  ? html`<span class="hero-unit">${heroUnit}</span>`
                  : nothing}
              </div>
              <div class="hero-meta">
                ${heroGroup.map((d) => this._renderHeroEntry(d))}
              </div>
            </div>`
          : nothing}
        ${showElevator ? this._renderElevatorDetails(elevatorInfos) : nothing}
        ${this._config!.show_departures && this._config!.max_departures > 0
          ? rows.length
            ? html`<ul class="dep-list" role="list" aria-label=${this._t("departures_list")}>
                ${rows.map((d) => this._renderRow(d, stopCfg.entity))}
              </ul>`
            : html`<div class="empty" role="status" aria-live="polite">
                ${this._t(attrs.server_time ? "betriebsschluss" : "no_data")}
              </div>`
          : nothing}
      </section>
    `;
  }

  private _renderElevatorDetails(infos: ElevatorInfoAttr[]): TemplateResult {
    return html`
      <div class="alert-list">
        ${infos.map((e) => this._renderElevatorDetail(e))}
      </div>
    `;
  }

  private _renderElevatorDetail(e: ElevatorInfoAttr): TemplateResult {
    const location = e.description || e.station || "";
    const reason = e.reason || "";
    const until = formatTime(e.time_end, this._lang());
    const hasDetail = Boolean(reason || until);
    const expanded = this._expandedElevator.has(e.name);
    const classes = {
      alert: true,
      expanded,
      "no-detail": !hasDetail,
    };
    return html`
      <div
        class=${classMap(classes)}
        role=${hasDetail ? "button" : "group"}
        tabindex=${hasDetail ? "0" : "-1"}
        aria-expanded=${hasDetail ? (expanded ? "true" : "false") : nothing}
        aria-label=${location}
        @click=${() => hasDetail && this._toggleElevator(e.name)}
        @keydown=${(ev: KeyboardEvent) =>
          this._onExpanderKeydown(ev, hasDetail, () =>
            this._toggleElevator(e.name),
          )}
      >
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="alert-title">${deText(location)}</div>
          </div>
          ${hasDetail
            ? html`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${reason ? html`<div class="alert-desc">${deText(reason)}</div>` : nothing}
                  ${until
                    ? html`<div class="alert-meta">
                        <span>${this._t("elevator_until")} ${until}</span>
                      </div>`
                    : nothing}
                </div>
              </div>`
            : nothing}
        </div>
        ${hasDetail
          ? html`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`
          : nothing}
      </div>
    `;
  }

  private _toggleElevator(name: string): void {
    const next = new Set(this._expandedElevator);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    this._expandedElevator = next;
  }

  // Shared Enter/Space handler for expander rows whose parent element is
  // a <div role="button"> rather than a real <button>. The nested markup
  // of elevator and traffic rows (icons + description spans) is stable
  // with a div, but keyboard users still need activation — Enter and
  // Space both trigger the click-equivalent.
  private _onExpanderKeydown(
    ev: KeyboardEvent,
    hasDetail: boolean,
    activate: () => void,
  ): void {
    if (!hasDetail) return;
    if (ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();
    activate();
  }

  private _renderTrafficBanner(stops: NormalisedModernStop[]): TemplateResult | typeof nothing {
    const seen = new Set<string>();
    const items: TrafficInfoAttr[] = [];
    for (const s of stops) {
      for (const t of this._attrs(s.entity).traffic_info ?? []) {
        if (seen.has(t.name)) continue;
        seen.add(t.name);
        items.push(t);
      }
    }
    for (const t of this._debugTraffic) {
      if (seen.has(t.name)) continue;
      seen.add(t.name);
      items.push(t);
    }
    if (!items.length) return nothing;
    return html`
      <div class="alert-list">
        ${items.map((t) => this._renderTrafficItem(t))}
      </div>
    `;
  }

  private _renderTrafficItem(t: TrafficInfoAttr): TemplateResult {
    const overrides = this._config!.line_colors;
    const lines = Array.isArray(t.related_lines) ? t.related_lines : [];
    const descHtml = t.description_html
      ? safeTrafficHtml(t.description_html)
      : t.description
        ? safeTrafficHtml(t.description)
        : "";
    const until = formatTime(t.time_end, this._lang());
    const updatedRaw = formatTime(t.time_last_update, this._lang());
    const created = formatTime(t.time_created, this._lang());
    const updated = updatedRaw && updatedRaw !== created ? updatedRaw : "";
    const hasMeta = Boolean(t.location || until || updated);
    const hasDetail = Boolean(descHtml || hasMeta);
    const expanded = this._expandedTraffic.has(t.name);
    const classes = {
      alert: true,
      expanded,
      "no-detail": !hasDetail,
    };
    const trafficAriaLabel = t.title || this._t("traffic_label");
    return html`
      <div
        class=${classMap(classes)}
        role=${hasDetail ? "button" : "group"}
        tabindex=${hasDetail ? "0" : "-1"}
        aria-expanded=${hasDetail ? (expanded ? "true" : "false") : nothing}
        aria-label=${trafficAriaLabel}
        @click=${() => hasDetail && this._toggleTraffic(t.name)}
        @keydown=${(ev: KeyboardEvent) =>
          this._onExpanderKeydown(ev, hasDetail, () =>
            this._toggleTraffic(t.name),
          )}
      >
        <ha-icon icon="mdi:alert-octagon" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            ${lines.length
              ? html`<div class="alert-lines">
                  ${lines.map(
                    (l) => html`<span
                      class="alert-line-badge"
                      style=${styleMap({ background: colorForLine(l, overrides) })}
                    >${l}</span>`,
                  )}
                </div>`
              : nothing}
            <div class="alert-title">${t.title ? deText(t.title) : this._t("traffic_label")}</div>
          </div>
          ${hasDetail
            ? html`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${descHtml ? html`<div class="alert-desc">${unsafeHTML(descHtml)}</div>` : nothing}
                  ${hasMeta
                    ? html`<div class="alert-meta">
                        ${t.location
                          ? html`<span class="alert-location-chip">
                              <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${deText(t.location)}
                            </span>`
                          : nothing}
                        ${until ? html`<span>${this._t("traffic_until")} ${until}</span>` : nothing}
                        ${updated
                          ? html`<span>${this._t("traffic_updated")} ${updated}</span>`
                          : nothing}
                      </div>`
                    : nothing}
                </div>
              </div>`
            : nothing}
        </div>
        ${hasDetail
          ? html`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`
          : nothing}
      </div>
    `;
  }

  private _toggleTraffic(name: string): void {
    const next = new Set(this._expandedTraffic);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    this._expandedTraffic = next;
  }

  /**
   * Compute the hero group: the lead departure plus any others tied
   * on the exact same countdown. Mirrors linz-linien-austria's
   * _computeHeroGroup verbatim. When the lead is at Jetzt (cd <= 0),
   * group every entry that's also at Jetzt — multiple lines all
   * arriving simultaneously is precisely the case where surfacing all
   * of them in the hero is most useful. Outside the Jetzt case, fall
   * back to strict tie-only grouping so a 5-min lead doesn't pull a
   * 6-min entry into the hero. Returns [] if there are no usable
   * departures.
   */
  private _computeHeroGroup(filtered: DepartureAttr[]): DepartureAttr[] {
    if (filtered.length === 0) return [];
    const cdOf = (d: DepartureAttr): number =>
      Number.isFinite(d.countdown) ? d.countdown : Number.POSITIVE_INFINITY;

    let minCd = Number.POSITIVE_INFINITY;
    for (const d of filtered) {
      const cd = cdOf(d);
      if (cd < minCd) minCd = cd;
    }
    if (!Number.isFinite(minCd)) {
      const first = filtered[0];
      return first ? [first] : [];
    }
    if (minCd <= 0) {
      return filtered.filter((d) => cdOf(d) <= 0);
    }
    return filtered.filter((d) => cdOf(d) === minCd);
  }

  /**
   * Render one hero-entry row (line badge + direction + optional
   * platform pill + optional wheelchair pill). Used inside the
   * hero-meta column; one entry per departure in the hero group.
   */
  private _renderHeroEntry(d: DepartureAttr): TemplateResult {
    const accent = colorForLine(d.line || "", this._config!.line_colors);
    const platform =
      this._config!.show_platform && d.platform ? String(d.platform) : null;
    const isBarrierFree =
      !!d.barrier_free && this._config!.show_accessibility;
    return html`
      <div class="hero-entry">
        <span
          class="line-badge"
          style=${styleMap({ background: accent })}
        >${d.line}</span>
        <span class="hero-direction">${deText(d.towards)}</span>
        ${platform
          ? html`<span class="hero-platform"
              >${this._t(platformLabelKey(d.type))} ${platform}</span
            >`
          : nothing}
        ${isBarrierFree
          ? html`<span
              class="hero-a11y"
              role="img"
              aria-label=${this._t("barrier_free_title")}
              title=${this._t("barrier_free_title")}
            >
              <ha-icon
                icon="mdi:wheelchair-accessibility"
                aria-hidden="true"
              ></ha-icon>
            </span>`
          : nothing}
      </div>
    `;
  }

  private _renderRow(
    d: DepartureAttr,
    entityId: string,
  ): TemplateResult | TemplateResult[] {
    const overrides = this._config!.line_colors;
    const line = d.line || "?";
    const color = colorForLine(line, overrides);
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const cdLabel = cd === null ? "—" : cd <= 0 ? this._t("now") : `${cd} ${this._t("min")}`;

    // Signed delay (positive = late, negative = early). Computed
    // independently of show_delay so the state-colour classes still
    // light up even when the verbose "1 Minute verspätet" text is off.
    const signedDelay = delayMinutes(d.time_planned, d.time_real);
    const showDelayText = this._config!.show_delay;
    const delayText =
      showDelayText && signedDelay !== null && signedDelay >= 1
        ? signedDelay === 1
          ? this._t("delay_singular")
          : this._t("delay_plural", { n: signedDelay })
        : "";

    // Row state — Linz parity. `now` overrides late/early when cd<=0.
    const cdState =
      cd !== null && cd <= 0
        ? "now"
        : signedDelay !== null && signedDelay >= 1
          ? "late"
          : signedDelay !== null && signedDelay <= -1
            ? "early"
            : "";

    const showA11y = this._config!.show_accessibility;
    const hasFlags = Boolean(d.traffic_jam || (showA11y && d.barrier_free));
    const rowPlatform =
      this._config!.show_platform && d.platform ? String(d.platform) : null;

    const typeIcon = this._config!.show_type_icon ? iconForType(d.type) : null;

    // Stops-ahead expandability: an empty list means "we matched but you
    // are at the terminus" — still no panel, no chevron. A truncated list
    // (head + ellipsis + terminus) renders the same affordance as a full
    // short list.
    const hasStopsAhead = Array.isArray(d.stops_ahead) && d.stops_ahead.length > 0;
    const rowKey = `${entityId}|${d.line}|${d.direction}|${d.countdown}|${d.time_planned ?? ""}`;
    const expanded = hasStopsAhead && this._expandedRows.has(rowKey);
    const panelId = `wl-stopsahead-${entityId.replace(/[^a-z0-9_]/gi, "_")}-${d.line}-${d.direction}-${d.countdown}`;
    const ariaLabelKey = expanded ? "stops_ahead_aria_hide" : "stops_ahead_aria_show";
    const ariaLabel = hasStopsAhead
      ? this._t(ariaLabelKey, { line, towards: d.towards || "" })
      : "";

    const rowClasses = {
      "dep-row": true,
      expandable: hasStopsAhead,
      expanded,
    };

    const rowTpl = html`
      <li
        class=${classMap(rowClasses)}
        role=${hasStopsAhead ? "button" : nothing}
        tabindex=${hasStopsAhead ? "0" : nothing}
        aria-expanded=${hasStopsAhead ? (expanded ? "true" : "false") : nothing}
        aria-controls=${hasStopsAhead ? panelId : nothing}
        aria-label=${hasStopsAhead ? ariaLabel : nothing}
        @click=${() => hasStopsAhead && this._toggleRow(rowKey)}
        @keydown=${(ev: KeyboardEvent) =>
          this._onExpanderKeydown(ev, hasStopsAhead, () => this._toggleRow(rowKey))}
      >
        <div class="line-badge" style=${styleMap({ background: color })}>${line}</div>
        <div class="towards">
          ${typeIcon
            ? html`<ha-icon class="type-icon" icon=${typeIcon} aria-hidden="true"></ha-icon>`
            : nothing}${deText(d.towards)}${delayText
            ? html` <span class="delay">${delayText}</span>`
            : nothing}
        </div>
        ${rowPlatform || hasFlags
          ? html`<span class="row-end">
              ${rowPlatform
                ? html`<span class="row-platform"
                    >${this._t(platformLabelKey(d.type))} ${rowPlatform}</span
                  >`
                : nothing}
              ${hasFlags
                ? html`<span class="row-flags">
                    ${d.traffic_jam
                      ? html`<ha-icon
                          class="disturbance"
                          icon="mdi:alert-circle"
                          role="img"
                          aria-label=${this._t("disturbance_title")}
                          title=${this._t("disturbance_title")}
                        ></ha-icon>`
                      : nothing}
                    ${showA11y && d.barrier_free
                      ? html`<ha-icon
                          class="a11y"
                          icon="mdi:wheelchair-accessibility"
                          role="img"
                          aria-label=${this._t("barrier_free_title")}
                          title=${this._t("barrier_free_title")}
                        ></ha-icon>`
                      : nothing}
                  </span>`
                : nothing}
            </span>`
          : html`<span></span>`}
        <div class=${classMap({ countdown: true, [cdState]: !!cdState })}>${cdLabel}</div>
        ${hasStopsAhead
          ? html`<ha-icon
              class="row-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`
          : nothing}
      </li>
    `;

    if (!hasStopsAhead) {
      return rowTpl;
    }

    return [rowTpl, this._renderStopsAheadPanel(d.stops_ahead!, panelId, expanded, line)];
  }

  private _renderStopsAheadPanel(
    stops: NonNullable<DepartureAttr["stops_ahead"]>,
    panelId: string,
    expanded: boolean,
    currentLine: string,
  ): TemplateResult {
    const overrides = this._config!.line_colors;
    return html`
      <li
        class=${classMap({ "dep-row-detail": true, expanded })}
        id=${panelId}
        role="region"
        aria-hidden=${expanded ? "false" : "true"}
      >
        <div class="dep-row-detail-inner">
          <ol
            class="stops-ahead"
            style=${styleMap({ "--stops-ahead-line": colorForLine(currentLine, overrides) })}
          >
            ${stops.map((s) => {
              const classes = {
                "stops-ahead-stop": true,
                terminus: !!s.is_terminus,
              };
              return html`
                <li class=${classMap(classes)}>
                  <span class="stops-ahead-dot" aria-hidden="true"></span>
                  <span class="stops-ahead-name">${deText(s.name)}</span>
                  ${s.lines && s.lines.length
                    ? html`<span class="stops-ahead-transfers" aria-label=${this._t("stops_ahead_transfer_aria", { lines: s.lines.join(", ") })}>
                        ${s.lines.map(
                          (line) => html`<span
                            class="stops-ahead-line-chip"
                            style=${styleMap({ background: colorForLine(line, overrides) })}
                            >${line}</span
                          >`,
                        )}
                      </span>`
                    : nothing}
                </li>
              `;
            })}
          </ol>
        </div>
      </li>
    `;
  }

  private _toggleRow(key: string): void {
    const next = new Set(this._expandedRows);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this._expandedRows = next;
  }

  private _stopMapUrl(
    stopName: string | undefined,
    lat: number | null | undefined,
    lon: number | null | undefined,
  ): string | null {
    if (typeof lat === "number" && typeof lon === "number") {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    }
    if (!stopName) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stopName}, Wien`)}`;
  }

  private _renderBanner(): TemplateResult {
    const msg = this._t("version_update", { v: this._versionMismatch ?? "" });
    return html`
      <div class="banner" role="alert">
        <span>${msg}</span>
        <button type="button" class="btn-primary" @click=${this._reload}>
          <ha-icon icon="mdi:refresh" aria-hidden="true"></ha-icon>
          ${this._t("version_reload")}
        </button>
      </div>
    `;
  }

  private async _reload(): Promise<void> {
    try {
      if (window.caches?.keys) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
    } catch {
      // best-effort cache wipe
    }
    window.location.reload();
  }

  // ------------------------------------------------------------------
  // Dev-mode panel — only visible on rpi25 or with ?wl_debug=1
  // ------------------------------------------------------------------

  private _isDevMode(): boolean {
    try {
      const host = window.location.hostname || "";
      if (host === "rpi25" || host.startsWith("rpi25.")) return true;
      const search = window.location.search || "";
      if (search.includes("wl_debug=1")) return true;
    } catch {
      // SSR / restricted ctx — default off
    }
    return false;
  }

  private _renderDevModePanel(): TemplateResult | typeof nothing {
    if (!this._isDevMode()) return nothing;
    return html`
      <div class="dev-strip">
        <span class="dev-strip-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button type="button" class="dev-strip-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
    `;
  }

  private _randomFrom<T>(arr: T[]): T | null {
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
  }

  private _devTestTraffic = (): void => {
    const stops = this._resolveStops();
    const pool: DepartureAttr[] = [];
    for (const s of stops) {
      for (const d of this._attrs(s.entity).departures ?? []) {
        if (d.line && d.towards) pool.push(d);
      }
    }
    const pick = this._randomFrom(pool);
    const line = pick?.line || "U?";
    const towards = pick?.towards || "Unbekannt";
    const now = new Date();
    this._debugTraffic = [
      ...this._debugTraffic,
      {
        name: `DEBUG-T-${Date.now()}`,
        title: `${line}: Testmeldung`,
        description: `Debug-Eintrag für Linie ${line} Richtung ${towards}.`,
        description_html: `Debug-Eintrag für Linie ${line} Richtung ${towards}.<br><br>Grund: Dev-Mode-Test.`,
        location: "Debug-Stelle",
        related_lines: [line],
        time_start: new Date(now.getTime() - 30 * 60_000).toISOString(),
        time_end: new Date(now.getTime() + 3 * 60 * 60_000).toISOString(),
        time_created: new Date(now.getTime() - 30 * 60_000).toISOString(),
        time_last_update: now.toISOString(),
        status: "active",
      },
    ];
  };

  private _devTestElevator = (): void => {
    const stops = this._resolveStops();
    const pick = this._randomFrom(stops);
    if (!pick) return;
    const attrs = this._attrs(pick.entity);
    const station = attrs.stop_name || pick.entity;
    const deps = attrs.departures ?? [];
    const anyLine = this._randomFrom(deps)?.line || "";
    const towards = this._randomFrom(deps)?.towards || "Unbekannt";
    const now = new Date();
    this._debugElevator = [
      ...this._debugElevator,
      {
        __debug_entity: pick.entity,
        name: `DEBUG-E-${Date.now()}`,
        station,
        description: `${anyLine || "Station"} Bahnsteig Richtung ${towards} — Ausgang ${station}`,
        reason: "AUFZUGSERNEUERUNG Voraussichtlich bis Ende Mai außer Betrieb! (Dev-Mode-Test)",
        status: "außer Betrieb",
        related_lines: anyLine ? [anyLine] : [],
        time_start: new Date(now.getTime() - 45 * 60_000).toISOString(),
        time_end: new Date(now.getTime() + 4 * 60 * 60_000).toISOString(),
      },
    ];
  };

  private _devClear = (): void => {
    this._debugTraffic = [];
    this._debugElevator = [];
  };


  static styles = cardStyles;
}
