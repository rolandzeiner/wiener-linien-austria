import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import { CARD_VERSION } from "./const.js";
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

@customElement("wiener-linien-austria-card")
export class WienerLinienAustriaCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedModernConfig;
  @state() private _activeTab = 0;
  @state() private _versionMismatch: string | null = null;
  @state() private _expandedTraffic = new Set<string>();
  @state() private _expandedElevator = new Set<string>();
  @state() private _debugTraffic: TrafficInfoAttr[] = [];
  @state() private _debugElevator: Array<ElevatorInfoAttr & { __debug_entity?: string }> = [];

  private _versionCheckDone = false;

  public setConfig(config: WienerLinienCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("wiener-linien-austria-card: config must be an object");
    }
    this._config = normaliseModernConfig(config);
  }

  public getCardSize(): number {
    const n = this._config?.entities.length ?? 1;
    return Math.min(12, 3 + n * 3);
  }

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement("wiener-linien-austria-card-editor");
  }

  public static getStubConfig(hass: HomeAssistant): WienerLinienCardConfig {
    const entities = findWienerLinienEntities(hass);
    return {
      type: "custom:wiener-linien-austria-card",
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

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    if (
      changed.has("_config") ||
      changed.has("_activeTab") ||
      changed.has("_versionMismatch") ||
      changed.has("_expandedTraffic") ||
      changed.has("_expandedElevator") ||
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
    if (!this.hass) return html`<ha-card><div class="wl-card"></div></ha-card>`;

    const cfg = this._config;
    const stops = this._resolveStops();
    const useTabs = cfg.layout === "tabs" && stops.length >= 2;

    if (useTabs && this._activeTab >= stops.length) {
      this._activeTab = 0;
    }

    const attribution = cfg.hide_attribution
      ? ""
      : stops
          .map((s) => this._attrs(s.entity).attribution)
          .find((v): v is string => typeof v === "string" && v.length > 0) ||
        "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";

    return html`
      <ha-card>
        <div class="wl-card">
          ${this._versionMismatch ? this._renderBanner() : nothing}
          ${cfg.show_traffic_info ? this._renderTrafficBanner(stops) : nothing}
          ${this._renderBody(stops, useTabs)}
          ${attribution ? html`<div class="wl-attr">${attribution}</div>` : nothing}
          ${this._renderDevModePanel()}
        </div>
      </ha-card>
    `;
  }

  private _renderBody(stops: NormalisedModernStop[], useTabs: boolean): TemplateResult {
    if (!stops.length) return this._renderEmpty();
    if (useTabs) {
      const active = stops[this._activeTab];
      return html`
        ${this._renderTabs(stops, this._activeTab)}
        ${this._renderStop(active)}
      `;
    }
    return html`${stops.map((s) => this._renderStop(s))}`;
  }

  private _renderEmpty(): TemplateResult {
    const available = findWienerLinienEntities(this.hass);
    const key = available.length ? "no_entities_picked" : "no_entities_available";
    return html`<div class="wl-empty">${this._t(key)}</div>`;
  }

  private _renderTabs(stops: NormalisedModernStop[], activeIndex: number): TemplateResult {
    return html`
      <div class="wl-tabs">
        ${stops.map((s, i) => {
          const attrs = this._attrs(s.entity);
          const label = attrs.stop_name || attrs.friendly_name || s.entity;
          const classes = { "wl-tab": true, "wl-tab-active": i === activeIndex };
          return html`<button
            type="button"
            class=${classMap(classes)}
            @click=${() => this._setActiveTab(i)}
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

  private _renderStop(stopCfg: NormalisedModernStop): TemplateResult {
    const attrs = this._attrs(stopCfg.entity);
    const title = attrs.stop_name || attrs.friendly_name || stopCfg.entity;
    const departures = Array.isArray(attrs.departures) ? attrs.departures : [];
    const filtered = filterDepartures(departures, stopCfg);
    const rows = filtered.slice(0, this._config!.max_departures);

    const realElevator = Array.isArray(attrs.elevator_info) ? attrs.elevator_info : [];
    const debugElevator = this._debugElevator.filter((e) => e.__debug_entity === stopCfg.entity);
    const elevatorInfos: ElevatorInfoAttr[] = [...realElevator, ...debugElevator];
    const showElevator = this._config!.show_elevator_info && elevatorInfos.length > 0;

    const mapUrl = this._stopMapUrl(title, attrs.latitude, attrs.longitude);
    const openInMaps = this._t("open_in_maps");

    return html`
      <div class="wl-stop">
        <div class="wl-header">
          ${mapUrl
            ? html`<a
                class="wl-stop-link"
                href=${mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                title=${openInMaps}
                aria-label="${title} — ${openInMaps}"
              ><span>${title}</span><ha-icon icon="mdi:open-in-new"></ha-icon></a>`
            : html`<span>${title}</span>`}
          ${showElevator ? this._renderElevatorBadge(elevatorInfos) : nothing}
        </div>
        ${showElevator ? this._renderElevatorDetails(elevatorInfos) : nothing}
        ${rows.length
          ? rows.map((d) => this._renderRow(d))
          : html`<div class="wl-empty">
              ${this._t(attrs.server_time ? "betriebsschluss" : "no_data")}
            </div>`}
      </div>
    `;
  }

  private _renderElevatorBadge(infos: ElevatorInfoAttr[]): TemplateResult {
    const label = this._t("elevator_label");
    const tooltip = infos
      .map((e) => [e.station, e.description, e.reason].filter((x): x is string => !!x).join(" — "))
      .join("\n");
    return html`
      <span class="wl-elevator-badge" title="${label}:\n${tooltip}">
        <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
        <span class="wl-elevator-badge-text">${label}</span>
      </span>
    `;
  }

  private _renderElevatorDetails(infos: ElevatorInfoAttr[]): TemplateResult {
    return html`
      <div class="wl-elevator-details">
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
      "wl-elevator-detail": true,
      "wl-elevator-expanded": expanded,
      "wl-elevator-nodetail": !hasDetail,
    };
    return html`
      <div
        class=${classMap(classes)}
        @click=${() => hasDetail && this._toggleElevator(e.name)}
      >
        <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
        <div class="wl-elevator-detail-body">
          <div class="wl-elevator-summary">
            <div class="wl-elevator-detail-location">${location}</div>
          </div>
          ${hasDetail
            ? html`<div class="wl-elevator-detail-expand">
                ${reason ? html`<div class="wl-elevator-detail-reason">${reason}</div>` : nothing}
                ${until
                  ? html`<div class="wl-elevator-detail-time">
                      ${this._t("elevator_until")} ${until}
                    </div>`
                  : nothing}
              </div>`
            : nothing}
        </div>
        ${hasDetail
          ? html`<ha-icon class="wl-elevator-detail-chevron" icon="mdi:chevron-down"></ha-icon>`
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
      <div class="wl-traffic-list">
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
      "wl-traffic": true,
      "wl-traffic-expanded": expanded,
      "wl-traffic-nodetail": !hasDetail,
    };
    return html`
      <div
        class=${classMap(classes)}
        @click=${() => hasDetail && this._toggleTraffic(t.name)}
      >
        <ha-icon icon="mdi:alert-octagon"></ha-icon>
        <div class="wl-traffic-body">
          <div class="wl-traffic-summary">
            ${lines.length
              ? html`<div class="wl-traffic-lines">
                  ${lines.map(
                    (l) => html`<span
                      class="wl-traffic-line-badge"
                      style=${styleMap({ background: colorForLine(l, overrides) })}
                    >${l}</span>`,
                  )}
                </div>`
              : nothing}
            <div class="wl-traffic-title">${t.title || this._t("traffic_label")}</div>
          </div>
          ${hasDetail
            ? html`<div class="wl-traffic-detail">
                ${descHtml ? html`<div class="wl-traffic-desc">${unsafeHTML(descHtml)}</div>` : nothing}
                ${hasMeta
                  ? html`<div class="wl-traffic-meta">
                      ${t.location
                        ? html`<span class="wl-traffic-location-chip">
                            <ha-icon icon="mdi:map-marker"></ha-icon>${t.location}
                          </span>`
                        : nothing}
                      ${until ? html`<span>${this._t("traffic_until")} ${until}</span>` : nothing}
                      ${updated
                        ? html`<span>${this._t("traffic_updated")} ${updated}</span>`
                        : nothing}
                    </div>`
                  : nothing}
              </div>`
            : nothing}
        </div>
        ${hasDetail
          ? html`<ha-icon class="wl-traffic-chevron" icon="mdi:chevron-down"></ha-icon>`
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

  private _renderRow(d: DepartureAttr): TemplateResult {
    const overrides = this._config!.line_colors;
    const line = d.line || "?";
    const color = colorForLine(line, overrides);
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const cdLabel = cd === null ? "—" : cd <= 0 ? this._t("now") : `${cd} ${this._t("min")}`;

    const delay = this._config!.show_delay ? delayMinutes(d.time_planned, d.time_real) : null;
    const delayText =
      delay !== null && delay >= 1
        ? delay === 1
          ? this._t("delay_singular")
          : this._t("delay_plural", { n: delay })
        : "";

    const showA11y = this._config!.show_accessibility;
    const hasFlags = Boolean(d.traffic_jam || (showA11y && d.barrier_free));

    return html`
      <div class="wl-row">
        <div class="wl-line" style=${styleMap({ background: color })}>${line}</div>
        <div class="wl-towards">
          ${d.towards || ""}${delayText
            ? html` <span class="wl-delay">${delayText}</span>`
            : nothing}
        </div>
        ${hasFlags
          ? html`<span class="wl-flags">
              ${d.traffic_jam
                ? html`<ha-icon
                    class="disturbance"
                    icon="mdi:alert-circle"
                    title=${this._t("disturbance_title")}
                  ></ha-icon>`
                : nothing}
              ${showA11y && d.barrier_free
                ? html`<ha-icon
                    class="a11y"
                    icon="mdi:wheelchair-accessibility"
                    title=${this._t("barrier_free_title")}
                  ></ha-icon>`
                : nothing}
            </span>`
          : html`<span></span>`}
        <div class="wl-countdown">${cdLabel}</div>
      </div>
    `;
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
      <div class="wl-banner">
        <span>${msg}</span>
        <button type="button" @click=${this._reload}>${this._t("version_reload")}</button>
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
      <div class="wl-devmode">
        <span class="wl-devmode-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button type="button" class="wl-devmode-clear" @click=${this._devClear}>
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

  // ------------------------------------------------------------------
  // Styles (ported from vanilla CARD_STYLE; layout-exact)
  // ------------------------------------------------------------------

  static styles = css`
    :host { display: block; }
    .wl-card { padding: 12px 16px; }
    .wl-banner {
      background: var(--warning-color, #ffa000);
      color: #fff;
      padding: 8px 12px;
      margin: -12px -16px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .wl-banner button {
      background: #fff;
      color: var(--warning-color, #ffa000);
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-weight: 600;
      cursor: pointer;
    }
    /* Tab bar — full-width evenly-distributed tabs, matching the
       tankstellen-austria card. Each tab takes an equal share of the
       row (flex: 1), with ellipsis on overflow so long stop names
       don't break layout. Ports the tankstellen pattern verbatim
       except for the min-width: 0 + text-overflow pair. */
    .wl-tabs {
      display: flex;
      border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.12));
      margin-bottom: 10px;
    }
    .wl-tab {
      flex: 1;
      min-width: 0;
      padding: 12px 8px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--secondary-text-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      font-family: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wl-tab.wl-tab-active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }
    .wl-tab:hover { color: var(--primary-text-color); }
    .wl-stop { margin-bottom: 14px; }
    .wl-stop:last-of-type { margin-bottom: 0; }
    .wl-header {
      font-size: 1.05em;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .wl-header ha-icon {
      --mdc-icon-size: 18px;
      color: var(--warning-color, #ffa000);
      cursor: help;
    }
    .wl-stop-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: inherit;
      text-decoration: none;
    }
    .wl-stop-link:hover { text-decoration: underline; }
    .wl-stop-link ha-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
      cursor: pointer;
      opacity: 0.55;
    }
    .wl-stop-link:hover ha-icon { opacity: 1; }
    .wl-elevator-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      padding: 2px 8px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--warning-color, #ffa000) 14%, transparent);
      color: var(--warning-color, #ffa000);
      cursor: help;
    }
    .wl-elevator-badge-text {
      font-size: 0.75em;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .wl-elevator-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
      padding: 8px 10px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--warning-color, #ffa000) 10%, transparent);
      border-left: 3px solid var(--warning-color, #ffa000);
    }
    .wl-elevator-detail {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      font-size: 0.85em;
      cursor: pointer;
      user-select: none;
    }
    .wl-elevator-detail.wl-elevator-nodetail { cursor: default; }
    .wl-elevator-detail ha-icon {
      --mdc-icon-size: 18px;
      color: var(--warning-color, #ffa000);
      flex-shrink: 0;
      margin-top: 1px;
    }
    .wl-elevator-detail-chevron {
      margin-left: auto;
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      transition: transform 0.15s ease-out;
      flex-shrink: 0;
    }
    .wl-elevator-detail.wl-elevator-expanded .wl-elevator-detail-chevron {
      transform: rotate(180deg);
    }
    .wl-elevator-detail-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      line-height: 1.4;
      min-width: 0;
      flex: 1;
    }
    .wl-elevator-summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 8px;
    }
    .wl-elevator-summary .wl-traffic-lines { margin: 0; }
    .wl-elevator-detail-location {
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .wl-elevator-detail-expand {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
      max-height: 600px;
      transition: max-height 0.2s ease-out, opacity 0.15s ease-out;
    }
    .wl-elevator-detail:not(.wl-elevator-expanded) .wl-elevator-detail-expand {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }
    .wl-elevator-detail-reason { color: var(--secondary-text-color); }
    .wl-elevator-detail-time {
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
      font-size: 0.92em;
    }
    .wl-traffic-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }
    .wl-traffic {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 8px 10px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--warning-color, #ffa000) 14%, transparent);
      border-left: 3px solid var(--warning-color, #ffa000);
      font-size: 0.85em;
      cursor: pointer;
      user-select: none;
    }
    .wl-traffic-chevron {
      margin-left: auto;
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      transition: transform 0.15s ease-out;
      flex-shrink: 0;
    }
    .wl-traffic.wl-traffic-expanded .wl-traffic-chevron {
      transform: rotate(180deg);
    }
    .wl-traffic-detail {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
      max-height: 600px;
      transition: max-height 0.2s ease-out, opacity 0.15s ease-out;
    }
    .wl-traffic:not(.wl-traffic-expanded) .wl-traffic-detail {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }
    .wl-traffic.wl-traffic-nodetail { cursor: default; }
    .wl-traffic ha-icon {
      --mdc-icon-size: 18px;
      color: var(--warning-color, #ffa000);
      flex-shrink: 0;
    }
    .wl-traffic-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }
    .wl-traffic-summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 8px;
    }
    .wl-traffic-lines {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .wl-traffic-line-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 0.85em;
      font-weight: 700;
      color: #fff;
      background: var(--primary-color);
    }
    .wl-traffic-title { font-weight: 600; }
    .wl-traffic-desc {
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .wl-traffic-meta {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
      font-variant-numeric: tabular-nums;
    }
    .wl-traffic-location-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .wl-traffic-location-chip ha-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }
    .wl-empty {
      padding: 18px 0;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .wl-row {
      display: grid;
      grid-template-columns: 44px 1fr auto auto;
      align-items: center;
      gap: 8px;
      padding: 5px 0;
      border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
    }
    .wl-row:last-child { border-bottom: none; }
    .wl-line {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.9em;
      background: var(--primary-color);
    }
    .wl-towards {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wl-flags {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--secondary-text-color);
    }
    .wl-flags ha-icon { --mdc-icon-size: 16px; }
    .wl-flags .disturbance { color: var(--warning-color, #ffa000); }
    .wl-countdown {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      min-width: 50px;
      text-align: right;
    }
    .wl-delay {
      color: var(--warning-color, #ffa000);
      font-size: 0.88em;
      font-weight: 500;
      margin-left: 4px;
    }
    .wl-attr {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--divider-color, rgba(0,0,0,0.08));
      font-size: 0.75em;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .wl-devmode {
      margin-top: 10px;
      padding: 6px 8px;
      border: 1px dashed var(--secondary-text-color, rgba(0,0,0,0.3));
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    .wl-devmode-label {
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .wl-devmode button {
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, rgba(0,0,0,0.2));
      background: transparent;
      color: var(--primary-text-color);
      font-size: 0.95em;
      cursor: pointer;
    }
    .wl-devmode button:hover { opacity: 0.8; }
    .wl-devmode .wl-devmode-clear {
      margin-left: auto;
      color: var(--secondary-text-color);
    }
  `;
}
