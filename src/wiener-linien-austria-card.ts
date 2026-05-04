import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import QrCreator from "qr-creator";
import {
  mdiBus,
  mdiBusStop,
  mdiSubwayVariant,
  mdiTram,
} from "@mdi/js";
import type { HomeAssistant, LovelaceCardEditor } from "./types.js";

import { cardStyles } from "./card-styles.js";
import { CARD_VERSION } from "./const.js";
import { translate } from "./localize/localize.js";
import {
  checkCardVersionWS,
  renderVersionBanner,
} from "./shared-render.js";
import { deText, safeHttpsUri } from "./utils.js";
import {
  LINE_TYPE_METRO,
  headerIconForType,
  lineTypeIcon,
} from "./utils/mot.js";
import type {
  DepartureAttr,
  ElevatorInfoAttr,
  LineColorsMap,
  TrafficInfoAttr,
  WienerLinienAttrs,
  WienerLinienCardConfig,
} from "./types.js";
import {
  chipPalette,
  colorForLine,
  normaliseModernConfig,
  type NormalisedModernConfig,
  type NormalisedModernStop,
} from "./utils/config.js";
import {
  findWienerLinienEntities,
  firstLineColorsMap,
  lineColorsFor,
} from "./utils/entities.js";
import { filterDepartures, shouldShowStopsAhead } from "./utils/departures.js";
import { safeTrafficHtml } from "./utils/html.js";
import { delayMinutes, formatTime } from "./utils/time.js";

// Eager import — a dynamic `await import("./editor.js")` would race
// HA's synchronous `document.createElement('…-editor')` call when the
// editor opens for the first time.
import "./editor.js";

// Register the card with HA's picker so it shows up in the visual editor's
// "+ Add card" dialog.
// Dedupe by `type` so a double-load (cache-bust race during a version
// banner reload, HMR during dev, URL-deduplication failure on the
// resource registration path) doesn't surface the same card twice in
// the picker.
{
  const win = window as unknown as {
    customCards?: Array<Record<string, unknown>>;
  };
  win.customCards = win.customCards ?? [];
  if (!win.customCards.some((c) => c["type"] === "wiener-linien-austria-card")) {
    win.customCards.push({
      type: "wiener-linien-austria-card",
      name: "Wiener Linien Austria",
      description: "Abfahrtsmonitor mit Störungen und Aufzugsinfo",
      preview: true,
    });
  }
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

// Cache `Intl.DateTimeFormat` instances by IANA timezone — building one
// per call is surprisingly expensive (~hundreds of µs on Safari WebKit),
// and `_isNightlineHour` is invoked from inside `_renderStopAhead` for
// every departure on every panel on every render. With a busy 4-stop
// dashboard that's >150 instantiations per render; caching collapses
// to a single lookup once the active timezone has been seen.
const _nightlineHourFormatters = new Map<string, Intl.DateTimeFormat>();

function _nightlineHourFormatter(tz: string): Intl.DateTimeFormat {
  let fmt = _nightlineHourFormatters.get(tz);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    _nightlineHourFormatters.set(tz, fmt);
  }
  return fmt;
}

@customElement("wiener-linien-austria-card")
export class WienerLinienAustriaCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedModernConfig;
  @state() private _activeTab = 0;
  @state() private _versionMismatch: string | null = null;
  @state() private _expandedTraffic = new Set<string>();
  @state() private _expandedElevator = new Set<string>();
  // Per-row expanded state for the stops_ahead collapsible. Keyed by
  // `entity|line|direction|towards|time_planned` — `time_planned` is
  // the schedule clock, fixed for the life of a given departure, so
  // panels survive every realtime poll and only "close" when the
  // departure ages out of the board entirely. Falls back to countdown
  // when time_planned is unavailable.
  @state() private _expandedRows = new Set<string>();
  // Per-stop "show non-metro transfers" toggle inside an expanded panel.
  // Keyed by `${rowKey}|${stopIndex}` so each stop on each panel keeps
  // its own state. Hub stops (Karlsplatz, Praterstern) have many
  // tram/bus transfers; collapsing them by default keeps the trail
  // readable, U-Bahn chips always stay inline.
  @state() private _expandedTransfers = new Set<string>();
  @state() private _debugTraffic: TrafficInfoAttr[] = [];
  @state() private _debugElevator: Array<ElevatorInfoAttr & { __debug_entity?: string }> = [];
  // QR dialog open state, keyed by stop entity_id. null = closed.
  // Per-stop so that in `tabs` layout each tab keeps its own dialog.
  @state() private _qrOpenFor: string | null = null;

  private _versionCheckDone = false;
  // One-shot flag so the "configured entity missing → fell back to first WL
  // sensor" warning doesn't spam the console on every re-render.
  private _fallbackWarned = false;

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
      // Clear `_qrOpenFor` if the entity it references has been removed
      // from the card config (user reconfigured and dropped that stop).
      // Without this, the saved entity-id lingers and `aria-controls`
      // points at a panel that no longer exists in the DOM.
      if (this._qrOpenFor) {
        const liveEntities = new Set(stops.map((s) => s.entity));
        if (!liveEntities.has(this._qrOpenFor)) {
          this._qrOpenFor = null;
        }
      }
    }
  }

  protected updated(_changed: PropertyValues): void {
    // Re-render the QR canvas any time the panel is open AND its
    // target URL has actually changed since the last paint. Comparing
    // `data-qr-text` to `data-qr-rendered-for` covers all the moving
    // parts in one place: panel-open transition, tab switch (same DOM
    // element with a new URL), AND late-arriving station coords (user
    // opens the panel before the static catalogue resolves coords; the
    // URL flips from a text-search OSM fallback to a `geo:lat,lon`
    // link once the catalogue lands). Gating on `_qrOpenFor` alone
    // missed the coords-arrived case because coords land on a `hass`
    // change, not a `_qrOpenFor` change.
    if (!this._qrOpenFor) return;
    const host = this.renderRoot.querySelector<HTMLElement>(
      ".qr-panel.expanded .qr-canvas",
    );
    if (!host) return;
    const wantText = host.getAttribute("data-qr-text") ?? "";
    const haveText = host.getAttribute("data-qr-rendered-for") ?? "";
    if (wantText && wantText !== haveText) {
      // Don't clear `host` here — `_renderTintedQr` reads
      // `getComputedStyle` before mutating the DOM so the layout
      // engine doesn't have to flush twice (clear + re-append).
      this._renderTintedQr(host);
      host.setAttribute("data-qr-rendered-for", wantText);
    }
  }

  /**
   * Render the QR tinted with the per-station accent colour, then
   * overlay the MOT (mode-of-transport) MDI icon at the centre in
   * the same accent on a small white plate. Uses ecLevel "H"
   * (≈30% damage tolerance) so the obscured centre stays scannable.
   *
   * Accent comes from the closest `.station` ancestor's computed
   * `--wl-accent` — same token the icon-tile, line-badge, and hero
   * tints already track, so the QR shares the colour identity of
   * the station it belongs to.
   */
  private _renderTintedQr(host: HTMLElement): void {
    // Read accent FIRST — `getComputedStyle` triggers a layout flush,
    // and any DOM mutation done before it would force the engine to
    // recompute layout twice (once after our mutation, once for the
    // style read). Reading before any clear/append keeps it to one
    // pass per render.
    const station = host.closest<HTMLElement>(".station");
    const accent = station
      ? getComputedStyle(station).getPropertyValue("--wl-accent").trim() ||
        "#000"
      : "#000";
    // Clear any prior canvas now that we have the accent — the next
    // QrCreator.render appends a fresh canvas, and we don't want a
    // stack of canvases across re-renders.
    while (host.firstChild) host.removeChild(host.firstChild);
    const size = 220;
    QrCreator.render(
      {
        text: host.getAttribute("data-qr-text") ?? "",
        radius: 0,
        // ecLevel "H" tolerates ≈30% damage — required because the
        // MOT-icon overlay obscures ≈18% of the centre modules.
        ecLevel: "H",
        fill: accent,
        background: "#fff",
        size,
      },
      host,
    );
    const canvas = host.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const iconName = host.getAttribute("data-qr-icon") ?? "mdi:bus-stop";
    const iconPath = this._mdiPathFor(iconName);
    if (!iconPath) return;
    // Centred icon footprint: ≈22% of the QR width — stays well inside
    // the H-level error-correction headroom while reading clearly at
    // small sizes.
    const cw = canvas.width;
    const ch = canvas.height;
    const iconRatio = 0.22;
    const iconSize = Math.round(cw * iconRatio);
    const iconX = Math.round((cw - iconSize) / 2);
    const iconY = Math.round((ch - iconSize) / 2);
    // White plate around the icon — gives the QR detector clean
    // module boundaries to recover from rather than mixed accent /
    // icon pixels at the icon edge. Rounded corners (≈20% of icon
    // size) match the rest of the card's visual language; falls
    // through to a sharp rect on browsers without Path2D.roundRect
    // (pre-Chrome 99 / Safari 16) so the QR still scans correctly.
    const padding = Math.round(iconSize * 0.18);
    const plateX = iconX - padding;
    const plateY = iconY - padding;
    const plateSize = iconSize + padding * 2;
    const plateRadius = Math.round(iconSize * 0.2);
    ctx.fillStyle = "#fff";
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(plateX, plateY, plateSize, plateSize, plateRadius);
      ctx.fill();
    } else {
      ctx.fillRect(plateX, plateY, plateSize, plateSize);
    }
    // MDI icons use a 24×24 viewBox. Scale to fit the icon area and
    // tint with the same accent the QR modules use.
    ctx.save();
    ctx.translate(iconX, iconY);
    ctx.scale(iconSize / 24, iconSize / 24);
    ctx.fillStyle = accent;
    ctx.fill(new Path2D(iconPath));
    ctx.restore();
  }

  private _mdiPathFor(iconName: string): string | null {
    switch (iconName) {
      case "mdi:subway-variant":
        return mdiSubwayVariant;
      case "mdi:tram":
        return mdiTram;
      case "mdi:bus":
        return mdiBus;
      case "mdi:bus-stop":
      default:
        return mdiBusStop;
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
      changed.has("_expandedTransfers") ||
      changed.has("_qrOpenFor") ||
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
    this._versionMismatch = await checkCardVersionWS(
      this.hass,
      "wiener_linien_austria/card_version",
      CARD_VERSION,
    );
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
    const first = available[0];
    if (first) {
      // Configured entity exists in the saved config but not in HA's
      // current state map (renamed sensor, removed integration entry).
      // Falling back to the first WL sensor keeps the card functional,
      // but the user could be silently looking at the wrong stop —
      // surface a one-shot console warning so the cause is debuggable.
      if (!this._fallbackWarned && (this._config?.entities?.length ?? 0) > 0) {
        this._fallbackWarned = true;
        const requested = this._config?.entities.map((s) => s.entity).join(", ");
        // eslint-disable-next-line no-console
        console.warn(
          `[wiener-linien-austria-card] configured entity "${requested}" not in hass.states; falling back to "${first}"`,
        );
      }
      return [{ entity: first }];
    }
    return [];
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
          ${renderVersionBanner(this._versionMismatch, (k) => this._t(k))}
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
      // willUpdate clamps `_activeTab` to a valid index whenever stops
      // changes, so this lookup is safe — the `?? stops[0]` is belt-and-
      // braces against the strict-flag noUncheckedIndexedAccess narrowing
      // (and against any race where willUpdate hasn't fired yet).
      const active = stops[this._activeTab] ?? stops[0]!;
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
    if (!Number.isFinite(i) || i === this._activeTab) return;
    // If the QR panel was open on the previous tab, carry that
    // expanded state to the new tab so the user doesn't have to
    // re-tap the QR button after switching. Stops a config away
    // from `layout: tabs` would have at most one station to begin
    // with, so this only applies in tabs mode by definition.
    const stops = this._resolveStops();
    const prevEntity = stops[this._activeTab]?.entity;
    const nextEntity = stops[i]?.entity;
    if (
      prevEntity &&
      nextEntity &&
      this._qrOpenFor === prevEntity
    ) {
      this._qrOpenFor = nextEntity;
    }
    this._activeTab = i;
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
    // Phone-first QR target: geo: URI hands off to the user's default
    // maps app (Apple Maps, Organic Maps, OsmAnd, …), no Google preference.
    // Falls back to the HTTPS OSM URL when we don't have coordinates so
    // the QR still resolves to something useful.
    const geoUri =
      this._stopGeoUri(title, attrs.latitude, attrs.longitude) ?? mapUrl;
    // Click target stays on the HTTPS stadtplan URL across all devices.
    // The HA Companion app embeds the dashboard in a WebView whose
    // navigation interceptor only forwards http(s):// schemes to the
    // OS — geo: URIs are silently dropped, so a tap on the map button
    // would do nothing for most phone users (HA's primary mobile
    // surface). Desktop browsers and the QR-scan path still get the
    // full open-in-maps-app handoff: the QR encodes the geo: URI
    // separately, and OS camera apps decode + open it at the OS level
    // regardless of which app rendered the QR.
    const showQrButton =
      this._config!.show_qr_button !== false && geoUri !== null;
    const openInMaps = this._t("open_in_maps");
    const qrOpenLabel = this._t("qr_open");

    // Hero group — the set of departures shown in the big hero block.
    // The soonest departure leads, and any others tied on the exact
    // same countdown ride along. When the lead is at "Jetzt" (cd <= 0),
    // we group every other Jetzt departure too — a tram and a bus
    // both showing as Jetzt simultaneously is the case where surfacing
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

    const lineColors = lineColorsFor(this.hass, stopCfg.entity);
    const accent = heroLead
      ? colorForLine(heroLead.line || "", this._config!.line_colors, lineColors)
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
        style="--wl-accent: ${accent};"
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
              ${mapUrl || showQrButton
                ? html`<div class="head-actions">
                    ${showQrButton
                      ? html`<button
                          type="button"
                          class=${classMap({
                            "icon-action": true,
                            "qr-toggle": true,
                            expanded: this._qrOpenFor === stopCfg.entity,
                          })}
                          title=${qrOpenLabel}
                          aria-label="${qrOpenLabel}: ${title}"
                          aria-expanded=${this._qrOpenFor === stopCfg.entity ? "true" : "false"}
                          aria-controls="wl-qr-${stopCfg.entity.replace(/[^a-z0-9_]/gi, "_")}"
                          @click=${() => this._toggleQrFor(stopCfg.entity)}
                        ><ha-icon icon="mdi:qrcode" aria-hidden="true"></ha-icon></button>`
                      : nothing}
                    ${mapUrl
                      ? html`<a
                          class="icon-action"
                          href=${mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title=${openInMaps}
                          aria-label="${openInMaps}: ${title}"
                        ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>`
                      : nothing}
                  </div>`
                : nothing}
            </header>`}
        ${showQrButton && geoUri
          ? this._renderQrPanel(
              stopCfg.entity,
              title,
              geoUri,
              headerIcon,
              this._qrOpenFor === stopCfg.entity,
            )
          : nothing}

        ${this._config!.show_hero_metric && heroLead
          ? html`<div class="hero-host">
              <div class="hero">
                <div class="hero-time" aria-live="polite" aria-atomic="true">
                  <span class="hero-min">${heroValue}</span>
                  ${heroUnit
                    ? html`<span class="hero-unit">${heroUnit}</span>`
                    : nothing}
                </div>
                ${heroGroup.flatMap((d) => [
                  this._renderHeroEntry(d, stopCfg.entity),
                  this._renderHeroPanelForEntry(d, stopCfg.entity),
                ])}
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
    // Traffic items aren't scoped to a single stop — pick the first
    // entity's palette (every sensor publishes the same GTFS catalogue,
    // so any one of them resolves any line that might appear here).
    const lineColors = firstLineColorsMap(
      this.hass,
      this._config!.entities.map((s) => s.entity),
    );
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
                      style=${styleMap(chipPalette(l, overrides, lineColors))}
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
   * on the exact same countdown. When the lead is at Jetzt (cd <= 0),
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
  private _renderHeroEntry(d: DepartureAttr, entityId: string): TemplateResult {
    const accentLine = d.line || "";
    const accentStyle = chipPalette(
      accentLine,
      this._config!.line_colors,
      lineColorsFor(this.hass, entityId),
    );
    const platform =
      this._config!.show_platform && d.platform ? String(d.platform) : null;
    const isBarrierFree =
      !!d.barrier_free && this._config!.show_accessibility;

    // Same expand-to-show-stops_ahead affordance as the row list. The
    // hero entry shares the row's stable identifier so opening the
    // panel from the hero leaves the same row's panel open in the list
    // below (when both surface the same departure), and vice versa.
    const hasStopsAhead = shouldShowStopsAhead(
      this._config!.show_stops_ahead,
      d,
    );
    const rowKey = this._rowKey(d, entityId);
    const expanded = hasStopsAhead && this._expandedRows.has(rowKey);
    const panelId = this._panelId(d, entityId, "hero");
    const ariaLabelKey = expanded ? "stops_ahead_aria_hide" : "stops_ahead_aria_show";
    const ariaLabel = hasStopsAhead
      ? this._t(ariaLabelKey, { line: d.line || "?", towards: d.towards || "" })
      : "";

    const entryClasses = {
      "hero-entry": true,
      expandable: hasStopsAhead,
      expanded,
    };
    const line = d.line || "?";

    return html`
      <div
        class=${classMap(entryClasses)}
        role=${hasStopsAhead ? "button" : nothing}
        tabindex=${hasStopsAhead ? "0" : nothing}
        aria-expanded=${hasStopsAhead ? (expanded ? "true" : "false") : nothing}
        aria-controls=${hasStopsAhead ? panelId : nothing}
        aria-label=${hasStopsAhead ? ariaLabel : nothing}
        @click=${() => hasStopsAhead && this._toggleRow(rowKey)}
        @keydown=${(ev: KeyboardEvent) =>
          this._onExpanderKeydown(ev, hasStopsAhead, () => this._toggleRow(rowKey))}
      >
        <span
          class="line-badge"
          style=${styleMap(accentStyle)}
        >${line}</span>
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
        ${hasStopsAhead
          ? html`<ha-icon
              class="hero-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`
          : nothing}
      </div>
    `;
  }

  private _renderHeroPanelForEntry(
    d: DepartureAttr,
    entityId: string,
  ): TemplateResult | typeof nothing {
    const hasStopsAhead = shouldShowStopsAhead(
      this._config!.show_stops_ahead,
      d,
    );
    if (!hasStopsAhead) return nothing;
    const rowKey = this._rowKey(d, entityId);
    const expanded = this._expandedRows.has(rowKey);
    const panelId = this._panelId(d, entityId, "hero");
    const line = d.line || "?";
    return this._renderHeroStopsAheadPanel(
      d.stops_ahead!,
      panelId,
      expanded,
      line,
      rowKey,
      entityId,
    );
  }

  private _renderHeroStopsAheadPanel(
    stops: NonNullable<DepartureAttr["stops_ahead"]>,
    panelId: string,
    expanded: boolean,
    currentLine: string,
    rowKey: string,
    entityId: string,
  ): TemplateResult {
    const overrides = this._config!.line_colors;
    const lineColors = lineColorsFor(this.hass, entityId);
    return html`
      <div
        class=${classMap({ "hero-detail": true, expanded })}
        id=${panelId}
        role="region"
        aria-hidden=${expanded ? "false" : "true"}
      >
        <div class="hero-detail-inner">
          <ol
            class="stops-ahead"
            style=${styleMap({ "--stops-ahead-line": colorForLine(currentLine, overrides, lineColors) })}
          >
            ${stops.map((s, idx) => this._renderStopAhead(s, idx, rowKey, overrides, lineColors))}
          </ol>
        </div>
      </div>
    `;
  }

  private _renderRow(
    d: DepartureAttr,
    entityId: string,
  ): TemplateResult | TemplateResult[] {
    const overrides = this._config!.line_colors;
    const lineColors = lineColorsFor(this.hass, entityId);
    const line = d.line || "?";
    const badgeStyle = chipPalette(line, overrides, lineColors);
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

    // Row state — `now` overrides late/early when cd<=0.
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

    const typeIcon = this._config!.show_type_icon ? lineTypeIcon(d.type) : null;

    // Stops-ahead expandability: an empty list means "we matched but you
    // are at the terminus" — still no panel, no chevron. A truncated list
    // (head + ellipsis + terminus) renders the same affordance as a full
    // short list.
    const hasStopsAhead = shouldShowStopsAhead(
      this._config!.show_stops_ahead,
      d,
    );
    const rowKey = this._rowKey(d, entityId);
    const expanded = hasStopsAhead && this._expandedRows.has(rowKey);
    const panelId = this._panelId(d, entityId, "row");
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
        <div class="line-badge" style=${styleMap(badgeStyle)}>${line}</div>
        <div class="towards">
          ${typeIcon
            ? html`<ha-icon class="type-icon" icon=${typeIcon} aria-hidden="true"></ha-icon>`
            : nothing}
          <div class="towards-rows">
            <span class="towards-name">${deText(d.towards)}</span>${delayText
              ? html`<span class="delay">${delayText}</span>`
              : nothing}
          </div>
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

    return [
      rowTpl,
      this._renderStopsAheadPanel(d.stops_ahead!, panelId, expanded, line, rowKey, entityId),
    ];
  }

  private _renderStopsAheadPanel(
    stops: NonNullable<DepartureAttr["stops_ahead"]>,
    panelId: string,
    expanded: boolean,
    currentLine: string,
    rowKey: string,
    entityId: string,
  ): TemplateResult {
    const overrides = this._config!.line_colors;
    const lineColors = lineColorsFor(this.hass, entityId);
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
            style=${styleMap({ "--stops-ahead-line": colorForLine(currentLine, overrides, lineColors) })}
          >
            ${stops.map((s, idx) => this._renderStopAhead(s, idx, rowKey, overrides, lineColors))}
          </ol>
        </div>
      </li>
    `;
  }

  private _renderStopAhead(
    s: NonNullable<DepartureAttr["stops_ahead"]>[number],
    idx: number,
    rowKey: string,
    overrides: Record<string, string>,
    lineColors: LineColorsMap,
  ): TemplateResult {
    // Inline lines (always shown next to the station name): U-Bahn at
    // any time, plus night lines (N-prefix + digit) WHEN they're
    // actually running. Outside the night window the N-chips fold
    // back into the +N toggle so the daytime trail stays compact.
    // Wiener Linien NightLine runs daily ~00:30–05:00 with first/last
    // buses spreading from ~23:55 to ~05:15 across all routes — we
    // use that envelope as the active window.
    const allLines = s.lines ?? [];
    const nightActive = this._isNightlineHour();
    const inlineLines: string[] = [];
    const otherLines: string[] = [];
    for (const l of allLines) {
      if (/^U\d/.test(l) || (nightActive && /^N\d/.test(l))) {
        inlineLines.push(l);
      } else {
        otherLines.push(l);
      }
    }
    const transferKey = `${rowKey}|${idx}`;
    const transfersExpanded = this._expandedTransfers.has(transferKey);
    const stopClasses = {
      "stops-ahead-stop": true,
      terminus: !!s.is_terminus,
      "transfers-expanded": transfersExpanded,
    };

    const metroChips = inlineLines.length
      ? html`<span class="stops-ahead-metros">
          ${inlineLines.map(
            (line) => html`<span
              class="stops-ahead-line-chip"
              style=${styleMap(chipPalette(line, overrides, lineColors))}
              >${line}</span
            >`,
          )}
        </span>`
      : nothing;

    const otherToggle = otherLines.length
      ? html`<button
          type="button"
          class="stops-ahead-other-toggle"
          aria-expanded=${transfersExpanded ? "true" : "false"}
          aria-label=${this._t(
            transfersExpanded ? "stops_ahead_other_hide" : "stops_ahead_other_show",
            { count: otherLines.length, stop: s.name },
          )}
          @click=${(ev: MouseEvent) => {
            // Prevent the click from bubbling to the row's collapse handler.
            ev.stopPropagation();
            this._toggleTransfers(transferKey);
          }}
          @keydown=${(ev: KeyboardEvent) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.stopPropagation();
            }
          }}
        >
          <span class="stops-ahead-other-count">+${otherLines.length}</span>
          <ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon>
        </button>`
      : nothing;

    const otherPanel =
      otherLines.length && transfersExpanded
        ? html`<div class="stops-ahead-others">
            ${otherLines.map(
              (line) => html`<span
                class="stops-ahead-line-chip stops-ahead-line-chip--other"
                style=${styleMap(chipPalette(line, overrides, lineColors))}
                >${line}</span
              >`,
            )}
          </div>`
        : nothing;

    // When the stop has transfer-to-other-lines (`otherLines`), the WHOLE
    // row becomes clickable + keyboard-activatable so tapping the stop
    // name has the same effect as tapping the +N toggle button. Cleaner
    // hit target on touch and matches user expectation that the entire
    // row is the affordance, not just the small button on the right.
    // The toggle button still has its own click handler (with
    // stopPropagation) so its dedicated label + ARIA stay intact for
    // screen readers.
    const rowInteractive = otherLines.length > 0;
    const rowAriaLabel = rowInteractive
      ? this._t(
          transfersExpanded ? "stops_ahead_other_hide" : "stops_ahead_other_show",
          { count: otherLines.length, stop: s.name },
        )
      : "";

    return html`
      <li class=${classMap(stopClasses)}>
        <div
          class="stops-ahead-row"
          role=${rowInteractive ? "button" : nothing}
          tabindex=${rowInteractive ? "0" : nothing}
          aria-expanded=${rowInteractive ? (transfersExpanded ? "true" : "false") : nothing}
          aria-label=${rowInteractive ? rowAriaLabel : nothing}
          @click=${rowInteractive
            ? (ev: MouseEvent) => {
                ev.stopPropagation();
                this._toggleTransfers(transferKey);
              }
            : nothing}
          @keydown=${rowInteractive
            ? (ev: KeyboardEvent) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  ev.stopPropagation();
                  this._toggleTransfers(transferKey);
                }
              }
            : nothing}
        >
          <span class="stops-ahead-dot" aria-hidden="true"></span>
          <span class="stops-ahead-name">${deText(s.name)}</span>
          ${metroChips} ${otherToggle}
        </div>
        ${otherPanel}
      </li>
    `;
  }

  private _toggleTransfers(key: string): void {
    const next = new Set(this._expandedTransfers);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this._expandedTransfers = next;
  }

  // Daily envelope ~23:55–05:15 captures the first/last NightLine bus
  // spread across all routes. Computed in HA's configured timezone
  // (`hass.config.time_zone`) — `Date.getHours()` would use the
  // browser's local TZ, which diverges when a user remote-accesses
  // a Vienna instance from another country, when the HA Companion
  // app's WebView reports the device TZ, or for travellers checking
  // their stops on the road at 02:00. Falls back to Europe/Vienna
  // if hass isn't yet wired up (very early renders).
  private _isNightlineHour(): boolean {
    const tz = this.hass?.config?.time_zone || "Europe/Vienna";
    const parts = _nightlineHourFormatter(tz).formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const minutesIntoDay = hour * 60 + minute;
    return minutesIntoDay >= 23 * 60 + 55 || minutesIntoDay <= 5 * 60 + 15;
  }

  // Single source of truth for the cross-render row identity. `rowStableId`
  // uses `time_planned` so panels stay open across polls (countdown ticks
  // every minute and would re-key the row, snapping the panel closed).
  // The hero, hero-companion and row-list paths all key by exactly this
  // tuple — drift here used to desync expand-state across surfaces.
  private _rowKey(d: DepartureAttr, entityId: string): string {
    const stableId = d.time_planned ?? `cd${d.countdown}`;
    return `${entityId}|${d.line}|${d.direction}|${d.towards ?? ""}|${stableId}`;
  }

  // Per-surface DOM id for the stops-ahead panel. Distinct prefix between
  // hero and row-list panels so an in-page anchor can target either.
  // The id stays stable across polls by keying on `time_planned` (or a
  // countdown fallback when not available) — same recipe as `_rowKey`.
  // Previously included `d.countdown` directly, which mutates every
  // minute and left `aria-controls` pointing at a stale id mid-tick;
  // screen readers polled at the wrong moment chased a dead anchor.
  private _panelId(d: DepartureAttr, entityId: string, prefix: "hero" | "row"): string {
    const safeEid = entityId.replace(/[^a-z0-9_]/gi, "_");
    const suffix = prefix === "hero" ? "wl-hero-stopsahead" : "wl-stopsahead";
    const stableId = (d.time_planned ?? `cd${d.countdown}`).replace(
      /[^a-z0-9_-]/gi,
      "_",
    );
    return `${suffix}-${safeEid}-${d.line}-${d.direction}-${stableId}`;
  }

  private _toggleRow(key: string): void {
    const next = new Set(this._expandedRows);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this._expandedRows = next;
  }

  /**
   * Official Vienna city map (beta viewer) — stadtplan.wien.gv.at,
   * maintained by Magistrat der Stadt Wien. Built on basemap.at
   * tiles, renders the Wiener-Linien stop network natively, and
   * exposes a hash-based permalink with a stable WGS84 contract:
   *
   *   #/@<lon>,<lat>,<zoom>,<rotation>,<tilt>,<basemap>/<theme>
   *
   * Used by the header map button and the dialog "open in maps" link.
   * Falls back to OpenStreetMap search when the sensor doesn't expose
   * coordinates (rare — the integration normally seeds them from the
   * Wiener Linien static catalogue at config-flow time).
   */
  private _stopMapUrl(
    stopName: string | undefined,
    lat: number | null | undefined,
    lon: number | null | undefined,
  ): string | null {
    let url: string | null = null;
    if (typeof lat === "number" && typeof lon === "number") {
      // 17.5 is street-level zoom — close enough that the stop and its
      // platforms read clearly without losing the surrounding block.
      url = `https://stadtplan.wien.gv.at/#/@${lon},${lat},17.5,0,0,standard/themes`;
    } else if (stopName) {
      url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${stopName}, Wien`)}`;
    }
    return url ? safeHttpsUri(url) || null : null;
  }

  /**
   * Platform-native map intent. RFC 5870 + Android Intent extensions.
   * Encoded into the QR so phone scanners hand off to whichever maps
   * app the user has set as their default — Apple Maps on iOS,
   * Google Maps / OsmAnd / Organic Maps on Android, Magic Earth, etc.
   * No vendor preference baked in. Falls back to the HTTPS OSM URL
   * when we don't have lat/lon (the QR scanner will open the browser).
   */
  private _stopGeoUri(
    stopName: string | undefined,
    lat: number | null | undefined,
    lon: number | null | undefined,
  ): string | null {
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    const label = stopName ? `(${encodeURIComponent(stopName)})` : "";
    return `geo:${lat},${lon}?q=${lat},${lon}${label}`;
  }

  private _toggleQrFor(entityId: string): void {
    this._qrOpenFor = this._qrOpenFor === entityId ? null : entityId;
  }

  /**
   * Inline QR panel. Same 0fr↔1fr grid-template-rows trick as
   * `.dep-row-detail` and `.stops-ahead-detail` so the panel
   * animates to its intrinsic height. Renders below the header,
   * above the hero, so the QR feels like an extension of the
   * stop card rather than a modal interruption. The "open in
   * maps" link lives only in the header (the mdi:map-marker icon
   * sits right next to the QR toggle), so the panel doesn't
   * duplicate it.
   */
  private _renderQrPanel(
    entityId: string,
    title: string,
    qrTarget: string,
    motIcon: string,
    expanded: boolean,
  ): TemplateResult {
    const panelId = `wl-qr-${entityId.replace(/[^a-z0-9_]/gi, "_")}`;
    const dialogTitle = this._t("qr_dialog_title");
    const hint = this._t("qr_dialog_hint");
    return html`
      <div
        class=${classMap({ "qr-panel": true, expanded })}
        id=${panelId}
        role="region"
        aria-hidden=${expanded ? "false" : "true"}
        aria-label="${dialogTitle}: ${title}"
      >
        <div class="qr-panel-inner">
          <div
            class="qr-panel-body"
            @click=${() => this._toggleQrFor(entityId)}
          >
            <div
              class="qr-canvas"
              role="img"
              aria-label="${dialogTitle}: ${title}"
              data-qr-text=${qrTarget}
              data-qr-icon=${motIcon}
            ></div>
            <p class="qr-panel-hint">${hint}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Banner is rendered via the shared `renderVersionBanner` helper —
  // see shared-render.ts. Cache-wipe + reload also lives there.

  // ------------------------------------------------------------------
  // Dev-mode panel — opt-in via `?wl_debug=1` query string or a sticky
  // `localStorage.wl_debug = "1"` so the panel is intentional, not
  // accidentally exposed to anyone whose HA host happens to share a
  // hostname with the developer's box.
  // ------------------------------------------------------------------

  private _isDevMode(): boolean {
    // Cached on first access — `localStorage.getItem` and
    // `window.location.search` would otherwise run on every render
    // (footer + dev panel both call this), and the answer can't change
    // mid-session (URL flip or storage write doesn't propagate to a
    // running card without a reload anyway).
    if (this._devModeCached !== null) return this._devModeCached;
    let result = false;
    try {
      const search = window.location.search || "";
      if (search.includes("wl_debug=1")) result = true;
      else if (window.localStorage?.getItem("wl_debug") === "1") result = true;
    } catch {
      // SSR / restricted ctx (e.g. localStorage blocked) — default off
    }
    this._devModeCached = result;
    return result;
  }
  private _devModeCached: boolean | null = null;

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
    // `arr.length` truthy implies at least one element exists; the `?? null`
    // satisfies noUncheckedIndexedAccess (which widens arr[i] to T | undefined).
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] ?? null : null;
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
