import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import QrCreator from "qr-creator";
import {
  mdiBus,
  mdiBusStop,
  mdiSubwayVariant,
  mdiTram,
} from "@mdi/js";
import type {
  HomeAssistant,
  LovelaceCardEditor,
  WindowWithCustomCards,
} from "./types.js";

import { cardStyles } from "./card-styles.js";
import { registerWlFonts } from "./font-face.js";
import { CARD_VERSION, NIGHTLINE_BG } from "./const.js";
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
import { safeDomId, toggleInSet } from "./utils/html.js";
import {
  iconForElevatorReason,
  parseTrafficNotice,
  splitLocationPath,
  type TrafficNotice,
} from "./utils/traffic-notice.js";
import { delayMinutes, formatTime } from "./utils/time.js";
import {
  accentTextColor,
  contrastRatio,
  mixOver,
  NEUTRAL_ACCENT_TEXT,
} from "./utils/color.js";

// Eager import — a dynamic `await import("./editor.js")` would race
// HA's synchronous `document.createElement('…-editor')` call when the
// editor opens for the first time.
import "./editor.js";

// Dedupe by type so a double-load (cache-bust race, HMR, duplicate
// resource registration) doesn't surface the card twice in the picker.
{
  const win = window as unknown as WindowWithCustomCards;
  win.customCards = win.customCards ?? [];
  if (!win.customCards.some((c) => c.type === "wiener-linien-austria-card")) {
    win.customCards.push({
      type: "wiener-linien-austria-card",
      name: "Wiener Linien Austria",
      description: "Abfahrtsmonitor mit Störungen und Aufzugsinfo",
      preview: true,
      // HA 2026.6 entity-first picker: only suggest this card for
      // sensors owned by this integration. Older HA ignores the key.
      getEntitySuggestion: (hass: HomeAssistant, entityId: string) => {
        if (!entityId.startsWith("sensor.")) return null;
        if (hass?.entities?.[entityId]?.platform !== "wiener_linien_austria") {
          return null;
        }
        return {
          config: {
            type: "custom:wiener-linien-austria-card",
            entities: [entityId],
          },
        };
      },
    });
  }
}

// Unknown vehicle types fall back to the bus prefix — most Wien stops
// are bus stops.
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
  @state() private _devPaletteOpen = false;

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
    const normalised = normaliseModernConfig(config);
    // If the user configured stops but every single one was rejected
    // (wrong domain, malformed shape), surface that as a Lovelace
    // error card instead of a silent empty board. Per-entry reasons
    // are already in the console via normaliseStopEntry.
    const rawCount = Array.isArray(
      (config as { entities?: unknown }).entities,
    )
      ? ((config as { entities: unknown[] }).entities.length)
      : (hasEntity ? 1 : 0);
    if (rawCount > 0 && normalised.entities.length === 0) {
      throw new Error(
        "wiener-linien-austria-card: every configured entity was rejected (must start with `sensor.`) — see browser console for per-entry details",
      );
    }
    this._config = normalised;
    // Reset per-board UI state on config swap. Expand-Set keys embed
    // entity + time_planned, so a stale key would never re-hit but
    // also never GC. Also clears _fallbackWarned so the next
    // misconfiguration still warns.
    this._expandedRows = new Set();
    this._expandedTraffic = new Set();
    this._expandedElevator = new Set();
    this._expandedTransfers = new Set();
    this._qrOpenFor = null;
    this._activeTab = 0;
    this._fallbackWarned = false;
    this._debugTraffic = [];
    this._debugElevator = [];
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

  // HA prepends `type:` itself — including it here yields "custom:custom:…".
  // Return type stays partial for the same reason.
  public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
    const entities = findWienerLinienEntities(hass);
    // entities[0] is `string | undefined` under noUncheckedIndexedAccess —
    // explicit so an empty discovery doesn't seed the stub with `[undefined]`.
    const first = entities[0];
    return {
      entities: first ? [first] : [],
      max_departures: 6,
    };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    // Register the WL webfaces on document.head — see font-face.ts for
    // why Shadow-DOM @font-face can't be trusted on Android WebView.
    registerWlFonts();
    // One-shot WS version probe — per-instance, but cheap (HA caches the
    // command registration). Gated by _versionCheckDone so re-adding the
    // card in edit mode doesn't hammer the backend.
    if (!this._versionCheckDone && this.hass?.callWS) {
      this._versionCheckDone = true;
      void this._checkCardVersion();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    // Drop the per-render memo BEFORE Lit calls render() so every cycle
    // recomputes `_resolveStops()` / `_isNightlineHour()` exactly once
    // and threads the cached result through the rest of the pass.
    this._resolvedStopsMemo = null;
    this._nightlineHourMemo = null;
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

  // Render-scoped memos cleared at the top of every willUpdate so each
  // Lit cycle gets one stable value for _resolveStops / _isNightlineHour
  // (constant within a render; both have measurable per-call cost).
  private _resolvedStopsMemo: NormalisedModernStop[] | null = null;
  private _nightlineHourMemo: boolean | null = null;

  protected override updated(changed: PropertyValues): void {
    // Re-render the QR canvas only on changes that could flip the
    // target URL: panel-open transition, hass change (late-arriving
    // catalogue coords swap the OSM fallback for a `geo:lat,lon`
    // link), or config change (user picked a different stop).
    // Pre-gating on the relevant property changes keeps `updated()`
    // a no-op for the typical render where nothing QR-relevant moved.
    if (
      !changed.has("_qrOpenFor") &&
      !changed.has("hass") &&
      !changed.has("_config")
    ) {
      return;
    }
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
    if (!(canvas instanceof HTMLCanvasElement)) {
      console.error("[wiener-linien-austria-card] QR canvas unavailable");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("[wiener-linien-austria-card] QR canvas unavailable");
      return;
    }
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

  protected override shouldUpdate(changed: PropertyValues): boolean {
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
    try {
      this._versionMismatch = await checkCardVersionWS(
        this.hass,
        "wiener_linien_austria/card_version",
        CARD_VERSION,
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        "[wiener-linien-austria-card] version probe failed",
        err,
      );
    }
  }

  // ------------------------------------------------------------------
  // Resolution helpers
  // ------------------------------------------------------------------

  private _resolveStops(): NormalisedModernStop[] {
    if (this._resolvedStopsMemo !== null) return this._resolvedStopsMemo;
    const result = this._computeResolvedStops();
    this._resolvedStopsMemo = result;
    return result;
  }

  private _computeResolvedStops(): NormalisedModernStop[] {
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

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    if (!this.hass) return html`<ha-card><div class="wrap"></div></ha-card>`;

    const cfg = this._config;
    const stops = this._resolveStops();
    const useTabs = cfg.layout === "tabs" && stops.length >= 2;

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
      <div class="tabbar">
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
        ${this._renderTabActions(stops, activeIndex)}
      </div>
    `;
  }

  /** Tab-strip home for the QR + map actions.
   *
   *  Only used when `hide_header` is set — otherwise the header owns
   *  them and rendering here too would duplicate the pair. The strip is
   *  a card-level sibling of the body, so unlike the header path the
   *  active stop's geo data has to be resolved here rather than
   *  inherited from `_renderStop`. Both helpers are pure functions of
   *  (title, lat, lon), so this stays a derivation, not a second source
   *  of truth.
   *
   *  The slot keeps a fixed width whenever the config asks for a QR
   *  button: a stop with no coordinates yields `geoUri === null` and
   *  drops the button, and without the reservation the tabs
   *  (`flex: 1 0 auto`) would visibly re-flow as you switch between a
   *  stop that has coordinates and one that doesn't. */
  private _renderTabActions(
    stops: NormalisedModernStop[],
    activeIndex: number,
  ): TemplateResult | typeof nothing {
    if (!this._config!.hide_header) return nothing;
    const active = stops[activeIndex] ?? stops[0];
    if (!active) return nothing;

    const attrs = this._attrs(active.entity);
    const title = attrs.stop_name || attrs.friendly_name || active.entity;
    const mapUrl = this._stopMapUrl(title, attrs.latitude, attrs.longitude);
    const geoUri = this._stopGeoUri(title, attrs.latitude, attrs.longitude);
    const qrConfigured = this._config!.show_qr_button !== false;
    const showQrButton = qrConfigured && geoUri !== null;
    if (!mapUrl && !showQrButton) return nothing;

    return html`<div
      class=${classMap({ "tab-actions": true, reserved: qrConfigured })}
    >
      ${this._renderStopActions(active.entity, title, mapUrl, showQrButton)}
    </div>`;
  }

  private _setActiveTab(i: number): void {
    if (!Number.isFinite(i)) return;
    const stops = this._resolveStops();
    // Clamp at the setter — keyboard nav already wraps via modulo, but
    // a future caller (or a stale event after Reconfigure shrunk the
    // stop list) could otherwise queue an out-of-bounds activeTab that
    // willUpdate would have to reset on the next cycle.
    const clamped = Math.max(0, Math.min(stops.length - 1, Math.floor(i)));
    if (clamped === this._activeTab) return;
    // If the QR panel was open on the previous tab, carry that
    // expanded state to the new tab so the user doesn't have to
    // re-tap the QR button after switching. Stops a config away
    // from `layout: tabs` would have at most one station to begin
    // with, so this only applies in tabs mode by definition.
    const prevEntity = stops[this._activeTab]?.entity;
    const nextEntity = stops[clamped]?.entity;
    if (
      prevEntity &&
      nextEntity &&
      this._qrOpenFor === prevEntity
    ) {
      this._qrOpenFor = nextEntity;
    }
    this._activeTab = clamped;
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
    this.updateComplete
      .then(() => {
        const tabs = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(
          '.tabs [role="tab"]',
        );
        tabs?.[next]?.focus();
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[wiener-linien-austria-card] tab focus skipped", err);
      });
  }

  /** The `<header>` block of the stop section: icon tile, title +
   *  subtitle, action buttons (QR + open-in-maps). Self-contained
   *  except for the locals it shares with the hero block (heroLead,
   *  headerIcon) — those stay computed in `_renderStop`. */
  private _renderStopHeader(
    stopCfg: NormalisedModernStop,
    apiName: string | undefined,
    title: string,
    heroLead: DepartureAttr | undefined,
    headerIcon: string,
    mapUrl: string | null,
    showQrButton: boolean,
  ): TemplateResult {
    return html`<header class="head">
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
            ${this._renderStopActions(stopCfg.entity, title, mapUrl, showQrButton)}
          </div>`
        : nothing}
    </header>`;
  }

  /** The QR toggle + open-in-maps pair, without a container — the two
   *  call sites bring their own. Normally they sit in `<header>`; when
   *  `hide_header` is set they move to the tab strip instead, which is
   *  why this takes a bare entity id rather than the stop config. */
  private _renderStopActions(
    entity: string,
    title: string,
    mapUrl: string | null,
    showQrButton: boolean,
  ): TemplateResult {
    const openInMaps = this._t("open_in_maps");
    const qrOpenLabel = this._t("qr_open");
    return html`
      ${showQrButton
        ? html`<button
            type="button"
            class=${classMap({
              "icon-action": true,
              "qr-toggle": true,
              expanded: this._qrOpenFor === entity,
            })}
            title=${qrOpenLabel}
            aria-label="${qrOpenLabel}: ${title}"
            aria-expanded=${this._qrOpenFor === entity ? "true" : "false"}
            aria-controls="wl-qr-${safeDomId(entity)}"
            @click=${() => this._toggleQrFor(entity)}
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
    `;
  }

  /** The hero block: big countdown number + per-entry chip rows. The
   *  hero panels (stops_ahead detail) are interleaved with the entries
   *  via `_renderHeroPanelForEntry`. */
  private _renderStopHero(
    stopCfg: NormalisedModernStop,
    heroGroup: DepartureAttr[],
    heroValue: string,
    heroUnit: string,
  ): TemplateResult {
    return html`<div class="hero-host">
      <div class="hero">
        <div class="hero-time" aria-live="polite" aria-atomic="true">
          <span class="hero-min">${heroValue}</span>
          ${heroUnit ? html`<span class="hero-unit">${heroUnit}</span>` : nothing}
        </div>
        ${heroGroup.flatMap((d) => [
          this._renderHeroEntry(d, stopCfg.entity),
          this._renderHeroPanelForEntry(d, stopCfg.entity),
        ])}
      </div>
    </div>`;
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
    // Stays null when coords are missing — falling back to the OSM web
    // URL would make the QR open a browser tab, breaking the button's
    // "hands off to your maps app" promise. The button is suppressed
    // instead.
    const geoUri = this._stopGeoUri(title, attrs.latitude, attrs.longitude);
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
    // Where the toggle lives: the header normally, the tab strip when
    // the header is hidden. `tabIndex` is only passed in tabs mode, so
    // it doubles as "a tab strip exists". With neither, nothing can
    // expand the panel — render no panel rather than leaving an
    // unreachable one in the DOM.
    const hasQrToggle = !this._config!.hide_header || tabIndex !== undefined;

    const heroGroup = this._computeHeroGroup(filtered);
    const heroLead = heroGroup[0];

    // Object-identity dedupe works because heroGroup holds references
    // into the same `filtered` array.
    const heroDedupe = this._config!.show_hero_metric
      ? new Set<DepartureAttr>(heroGroup)
      : new Set<DepartureAttr>();
    const remaining = filtered.filter((d) => !heroDedupe.has(d));
    const rows = remaining.slice(0, this._config!.max_departures);
    // Records the coordinator dropped this poll because upstream stopped
    // advancing them. Drives both the "some lines are missing" note above
    // a partially-filled list and the empty-state copy below it.
    const staleDropped =
      typeof attrs.stale_departures === "number" ? attrs.stale_departures : 0;

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

    const accentText = accentTextColor(accent, this._colorScheme());

    const isPanel = tabIndex !== undefined;
    return html`
      <section
        class="station"
        style="--wl-accent: ${accent};${accentText
          ? ` --wl-accent-text: ${accentText};`
          : ""}"
        id=${isPanel ? `wl-tabpanel-${tabIndex}` : nothing}
        role=${isPanel ? "tabpanel" : nothing}
        aria-labelledby=${isPanel ? `wl-tab-${tabIndex}` : nothing}
        tabindex=${isPanel ? "0" : nothing}
        aria-label=${title}
      >
        ${this._config!.hide_header
          ? nothing
          : this._renderStopHeader(
              stopCfg,
              apiName,
              title,
              heroLead,
              headerIcon,
              mapUrl,
              showQrButton,
            )}
        ${showQrButton && geoUri && hasQrToggle
          ? this._renderQrPanel(
              stopCfg.entity,
              title,
              geoUri,
              headerIcon,
              this._qrOpenFor === stopCfg.entity,
            )
          : nothing}

        ${this._config!.show_hero_metric && heroLead
          ? this._renderStopHero(stopCfg, heroGroup, heroValue, heroUnit)
          : nothing}
        ${showElevator ? this._renderElevatorDetails(elevatorInfos) : nothing}
        ${this._config!.show_departures && this._config!.max_departures > 0
          ? rows.length
            ? html`${staleDropped > 0
                  ? html`<div class="stale-note" role="status" aria-live="polite">
                      ${this._t("stale_feed_partial")}
                    </div>`
                  : nothing}
                <ul class="dep-list" role="list" aria-label=${this._t("departures_list")}>
                  ${rows.map((d, i) => this._renderRow(d, stopCfg.entity, i))}
                </ul>`
            : this._renderEmptyState(attrs, staleDropped)
          : nothing}
      </section>
    `;
  }

  /** Empty departure board, with the reason. Three distinct causes, and
   *  conflating them is what made a frozen upstream feed read as a normal
   *  end-of-service board for two and a half days (issue #103):
   *
   *  - stale feed — the coordinator dropped every record because upstream
   *    stopped advancing their planned times. Named explicitly, because
   *    the user's first instinct is otherwise that the card is broken.
   *  - end of service — the API answered (server_time present) and the
   *    stop genuinely has nothing left tonight.
   *  - no data — no successful poll yet.
   */
  private _renderEmptyState(
    attrs: WienerLinienAttrs,
    staleDropped: number,
  ): TemplateResult {
    if (staleDropped > 0) {
      const frozenAt = attrs.stale_since
        ? formatTime(attrs.stale_since, this._lang())
        : "";
      return html`<div class="empty stale" role="status" aria-live="polite">
        <div class="empty-title">${this._t("stale_feed")}</div>
        <div class="empty-detail">${this._t("stale_feed_detail")}</div>
        ${frozenAt
          ? html`<div class="empty-meta">
              ${this._t("stale_feed_since", { time: frozenAt })}
            </div>`
          : nothing}
      </div>`;
    }
    return html`<div class="empty" role="status" aria-live="polite">
      ${this._t(attrs.server_time ? "betriebsschluss" : "no_data")}
    </div>`;
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
    // The feed writes the location as a path through the station; showing
    // the segments separately makes "which lift is this" answerable at a
    // glance. Falls back to a single segment when there's no separator.
    const path = splitLocationPath(location);
    const reason = e.reason || "";
    const reasonIcon = iconForElevatorReason(reason);
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
            <div class="alert-title">
              <span lang="de" class="lift-path"
                >${path.map(
                  (seg, i) =>
                    html`${i
                      ? html`<span class="lift-path-sep" aria-hidden="true">›</span>`
                      : nothing}<span>${seg}</span>`,
                )}</span
              >
            </div>
          </div>
          ${hasDetail
            ? html`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${reason
                    ? html`<div class="alert-desc lift-reason">
                        <ha-icon icon=${reasonIcon} aria-hidden="true"></ha-icon>
                        <span lang="de">${reason}</span>
                      </div>`
                    : nothing}
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
    this._expandedElevator = toggleInSet(this._expandedElevator, name);
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
    // Resolve the GTFS palette once per banner render — every sensor
    // publishes the same catalogue, so the result is identical across
    // every traffic item. Previously rebuilt per item.
    const lineColors = firstLineColorsMap(
      this.hass,
      this._config!.entities.map((s) => s.entity),
    );
    return html`
      <div class="alert-list">
        ${items.map((t) => this._renderTrafficItem(t, lineColors))}
      </div>
    `;
  }

  /** Lay out a parsed disruption notice: per-line headings, prose, then the
   *  labelled facts as a definition list.
   *
   *  Everything here is a plain Lit text binding — upstream text is escaped
   *  by the template, never interpreted as markup. `lang="de"` because the
   *  ÖDV publishes German only, whatever locale the card is running in;
   *  without it a screen reader in an English UI reads street names with
   *  English phonetics. */
  private _renderTrafficNotice(notice: TrafficNotice): TemplateResult {
    // A lone heading segments nothing — it just restates the line the
    // alert title already names ("U1: Verspätungen" followed by "LINIE
    // U1"). Headings earn their keep only from two upwards, where they
    // separate the per-line blocks of a notice covering several lines.
    const headings = notice.blocks.reduce(
      (n, b) => (b.kind === "heading" ? n + 1 : n),
      0,
    );
    const blocks =
      headings > 1 ? notice.blocks : notice.blocks.filter((b) => b.kind !== "heading");

    return html`
      <div class="alert-desc" lang="de">
        ${blocks.map((b) =>
          b.kind === "heading"
            ? html`<p class="alert-desc-heading">${b.text}</p>`
            : html`<p>${b.text}</p>`,
        )}
        ${notice.facts.length
          ? html`<dl class="alert-facts">
              ${notice.facts.map(
                (f) => html`<div class="alert-fact">
                  <dt>
                    <ha-icon icon=${f.icon} aria-hidden="true"></ha-icon>${f.label}
                  </dt>
                  <dd>${f.value}</dd>
                </div>`,
              )}
            </dl>`
          : nothing}
      </div>
    `;
  }

  private _renderTrafficItem(
    t: TrafficInfoAttr,
    lineColors: LineColorsMap,
  ): TemplateResult {
    const overrides = this._config!.line_colors;
    const lines = Array.isArray(t.related_lines) ? t.related_lines : [];
    const descSource = t.description_html || t.description || "";
    const notice = parseTrafficNotice(descSource);
    const hasNotice = notice.blocks.length > 0 || notice.facts.length > 0;
    const until = formatTime(t.time_end, this._lang());
    const updatedRaw = formatTime(t.time_last_update, this._lang());
    const created = formatTime(t.time_created, this._lang());
    const updated = updatedRaw && updatedRaw !== created ? updatedRaw : "";
    const hasMeta = Boolean(t.location || until || updated);
    const hasDetail = Boolean(hasNotice || hasMeta);
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
                  ${hasNotice ? this._renderTrafficNotice(notice) : nothing}
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
    this._expandedTraffic = toggleInSet(this._expandedTraffic, name);
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

    const minCd = Math.min(...filtered.map(cdOf));
    if (!Number.isFinite(minCd)) {
      // Every entry had non-finite countdown — `_resolveStops` already
      // guaranteed we have one entry, surface it as the single hero.
      return [filtered[0]!];
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
  /** Resolve the expand-to-show-stops_ahead state for a departure rendered
   *  either in the hero block or in the row list. Both surfaces share the
   *  same `rowKey`, so opening the panel from one leaves the same panel
   *  open on the other when both currently surface the same departure. */
  private _expandState(
    d: DepartureAttr,
    entityId: string,
    kind: "hero" | "row",
  ): {
    hasStopsAhead: boolean;
    rowKey: string;
    expanded: boolean;
    panelId: string;
    ariaLabel: string;
  } {
    const hasStopsAhead = shouldShowStopsAhead(
      this._config!.show_stops_ahead,
      d,
    );
    const rowKey = this._rowKey(d, entityId);
    const expanded = hasStopsAhead && this._expandedRows.has(rowKey);
    const panelId = this._panelId(d, entityId, kind);
    const ariaLabelKey = expanded
      ? "stops_ahead_aria_hide"
      : "stops_ahead_aria_show";
    const ariaLabel = hasStopsAhead
      ? this._t(ariaLabelKey, {
          line: d.line || "?",
          towards: d.towards || "",
        })
      : "";
    return { hasStopsAhead, rowKey, expanded, panelId, ariaLabel };
  }

  /** The shared `<ol>` body rendered inside both the hero detail panel
   *  and the row detail panel. Wrappers (`<div class="hero-detail">` /
   *  `<li class="dep-row-detail">`) differ because each lives in a
   *  different container, but the inner stops list is identical. */
  private _renderStopsAheadInner(
    stops: NonNullable<DepartureAttr["stops_ahead"]>,
    currentLine: string,
    rowKey: string,
    entityId: string,
  ): TemplateResult {
    const overrides = this._config!.line_colors;
    const lineColors = lineColorsFor(this.hass, entityId);
    return html`
      <ol
        class="stops-ahead"
        style=${styleMap({
          "--stops-ahead-line": colorForLine(currentLine, overrides, lineColors),
        })}
      >
        ${stops.map((s, idx) =>
          this._renderStopAhead(s, idx, rowKey, overrides, lineColors),
        )}
      </ol>
    `;
  }

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
    const typeIcon = this._config!.show_type_icon ? lineTypeIcon(d.type) : null;

    const { hasStopsAhead, rowKey, expanded, panelId, ariaLabel } =
      this._expandState(d, entityId, "hero");

    const entryClasses = {
      "hero-entry": true,
      expandable: hasStopsAhead,
      expanded,
    };
    const line = d.line || "?";

    return html`
      <div
        class=${classMap(entryClasses)}
        style=${hasStopsAhead
          ? // Colours the connector stub joining the badge to the trail.
            `--stops-ahead-line: ${accentStyle.background};`
          : nothing}
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
        ${typeIcon
          ? html`<ha-icon
              class="type-icon"
              icon=${typeIcon}
              aria-hidden="true"
            ></ha-icon>`
          : nothing}
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
    const { hasStopsAhead, rowKey, expanded, panelId } = this._expandState(
      d,
      entityId,
      "hero",
    );
    if (!hasStopsAhead) return nothing;
    return this._renderHeroStopsAheadPanel(
      d.stops_ahead!,
      panelId,
      expanded,
      d.line || "?",
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
    return html`
      <div
        class=${classMap({ "hero-detail": true, expanded })}
        id=${panelId}
        role="region"
        aria-hidden=${expanded ? "false" : "true"}
      >
        <div class="hero-detail-inner">
          ${this._renderStopsAheadInner(stops, currentLine, rowKey, entityId)}
        </div>
      </div>
    `;
  }

  /**
   * Scheme polarity for `--wl-accent-text` (see utils/color.ts). Follows
   * HA's own theme rather than light-dark() / prefers-color-scheme, both
   * of which read the OS and would pick the wrong branch for a dark HA
   * theme on a light-mode desktop — same call the flap card makes for
   * .flap--light. Tri-state on purpose: `undefined` before themes have
   * loaded yields no token, so the hueless `:host` fallback stands
   * instead of us guessing a polarity.
   */
  private _colorScheme(): "dark" | "light" | undefined {
    if (this.hass?.themes?.darkMode === true) return "dark";
    if (this.hass?.themes?.darkMode === false) return "light";
    return undefined;
  }

  /**
   * Accent-as-text colour for one departure row's OWN line.
   *
   * `.station` sets `--wl-accent-text` from the hero lead, and every row
   * inherits it — so a row at Jetzt painted the hero line's colour rather
   * than its own. Invisible until two lines are at Jetzt at once, where
   * both countdowns came out the same hue.
   *
   * Returns null when the polarity isn't known yet — there the station
   * leaves the token unset too, so the hueless `:host` default already
   * stands for every row. An accent the clamp can't resolve (the neutral
   * `var(--primary-color)`) falls back to that same default explicitly:
   * "unset" would mean inheriting the hero's hue, which is the bug.
   */
  private _rowAccentText(accent: string): string | null {
    const scheme = this._colorScheme();
    if (scheme === undefined) return null;
    return accentTextColor(accent, scheme) ?? NEUTRAL_ACCENT_TEXT;
  }

  private _renderRow(
    d: DepartureAttr,
    entityId: string,
    rowIndex = 0,
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

    // Row state — `now` overrides late/early when cd<=0. Empty string
    // when none apply; the classMap below skips falsy entries.
    let cdState: "now" | "late" | "early" | "" = "";
    if (cd !== null && cd <= 0) cdState = "now";
    else if (signedDelay !== null && signedDelay >= 1) cdState = "late";
    else if (signedDelay !== null && signedDelay <= -1) cdState = "early";

    // Only `now` reads --wl-accent-text inside a row, so only `now` needs
    // the override — late/early carry their own semantic tokens. Same
    // ladder as the badge beside it, so the countdown and the badge can
    // never disagree about which line this row is.
    const nowColor =
      cdState === "now" ? this._rowAccentText(badgeStyle.background) : null;

    const showA11y = this._config!.show_accessibility;
    const hasFlags = Boolean(d.traffic_jam || (showA11y && d.barrier_free));
    const rowPlatform =
      this._config!.show_platform && d.platform ? String(d.platform) : null;

    const typeIcon = this._config!.show_type_icon ? lineTypeIcon(d.type) : null;

    // Stops-ahead expandability: an empty list means "we matched but you
    // are at the terminus" — still no panel, no chevron. A truncated list
    // (head + ellipsis + terminus) renders the same affordance as a full
    // short list.
    const { hasStopsAhead, rowKey, expanded, panelId, ariaLabel } =
      this._expandState(d, entityId, "row");

    const rowClasses = {
      "dep-row": true,
      expandable: hasStopsAhead,
      expanded,
    };

    const rowTpl = html`
      <li
        class=${classMap(rowClasses)}
        style=${`--row-i: ${rowIndex};${nowColor ? ` --wl-accent-text: ${nowColor};` : ""}${
          // Colours the connector stub that joins the badge to the trail
          // below. colorForLine() is chipPalette().background, so this is
          // the same value the panel resolves for the trail itself.
          hasStopsAhead ? ` --stops-ahead-line: ${badgeStyle.background};` : ""
        }`}
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
        <!-- Conditional spread avoids classMap({ "": true }) when cdState is "". -->
        <div class=${classMap({ countdown: true, ...(cdState ? { [cdState]: true } : {}) })}>${cdLabel}</div>
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
    return html`
      <li
        class=${classMap({ "dep-row-detail": true, expanded })}
        id=${panelId}
        role="region"
        aria-hidden=${expanded ? "false" : "true"}
      >
        <div class="dep-row-detail-inner">
          ${this._renderStopsAheadInner(stops, currentLine, rowKey, entityId)}
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
    const transferKey = this._transferKey(rowKey, idx);
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
    this._expandedTransfers = toggleInSet(this._expandedTransfers, key);
  }

  // Daily envelope ~23:55–05:15 captures the first/last NightLine bus
  // spread across all routes. Evaluated in Europe/Vienna unconditionally:
  // Wiener Linien NightLine service hours are a fixed property of the
  // Vienna transit network, not of the viewer or the HA host. The
  // browser TZ (`Date.getHours()`), and even `hass.config.time_zone`,
  // would all be wrong for a traveller abroad, an HA Companion WebView
  // reporting a device TZ, or an HA instance whose server TZ isn't
  // Vienna — in every such case the buses still run on Vienna's clock.
  private _isNightlineHour(): boolean {
    if (this._nightlineHourMemo !== null) return this._nightlineHourMemo;
    const parts = _nightlineHourFormatter("Europe/Vienna").formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const minutesIntoDay = hour * 60 + minute;
    const result =
      minutesIntoDay >= 23 * 60 + 55 || minutesIntoDay <= 5 * 60 + 15;
    this._nightlineHourMemo = result;
    return result;
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
  // Stable id keyed on time_planned (countdown mutates every minute and
  // would break aria-controls mid-tick). hero / row variants get
  // different prefixes so an in-page anchor can target either surface.
  private _panelId(d: DepartureAttr, entityId: string, prefix: "hero" | "row"): string {
    const safeEid = safeDomId(entityId);
    const suffix = prefix === "hero" ? "wl-hero-stopsahead" : "wl-stopsahead";
    const stableId = (d.time_planned ?? `cd${d.countdown}`).replace(
      /[^a-z0-9_-]/gi,
      "_",
    );
    return `${suffix}-${safeEid}-${d.line}-${d.direction}-${stableId}`;
  }

  private _toggleRow(key: string): void {
    this._expandedRows = toggleInSet(this._expandedRows, key);
  }

  /** Composite key for the per-stop "show transfers" toggle inside an
   *  expanded panel. Symmetric with `_rowKey` — every read + write goes
   *  through this so the `|`-delimited grammar lives in one place. */
  private _transferKey(rowKey: string, stopIndex: number): string {
    return `${rowKey}|${stopIndex}`;
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

  /** Same 0fr↔1fr grid-template-rows trick as `.dep-row-detail` /
   *  `.stops-ahead-detail` so the panel animates to its intrinsic
   *  height. */
  private _renderQrPanel(
    entityId: string,
    title: string,
    qrTarget: string,
    motIcon: string,
    expanded: boolean,
  ): TemplateResult {
    const panelId = `wl-qr-${safeDomId(entityId)}`;
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
            role="button"
            tabindex=${expanded ? "0" : "-1"}
            aria-label=${this._t("qr_dialog_close")}
            @click=${() => this._toggleQrFor(entityId)}
            @keydown=${(ev: KeyboardEvent) =>
              this._onExpanderKeydown(ev, true, () => this._toggleQrFor(entityId))}
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
    // Read live, not cached: both reads are cheap, and a per-instance
    // cache would miss a mid-session `localStorage`/URL flip while the
    // card instance persists (HA reuses card instances across dashboard
    // edit/exit cycles without a page reload).
    try {
      const search = window.location.search || "";
      if (search.includes("wl_debug=1")) return true;
      if (window.localStorage?.getItem("wl_debug") === "1") return true;
    } catch (err) {
      console.warn(
        "[wiener-linien-austria-card] dev-mode probe failed (SSR/restricted ctx?)",
        err,
      );
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
        <button
          type="button"
          aria-expanded=${this._devPaletteOpen ? "true" : "false"}
          @click=${this._devTogglePalette}
        >
          ${this._t("devmode_colors_btn")}
        </button>
        <button type="button" class="dev-strip-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
      ${this._devPaletteOpen ? this._renderDevPalette() : nothing}
    `;
  }

  // ------------------------------------------------------------------
  // Dev-mode palette panel — every accent the card can be handed, run
  // through accentTextColor() for BOTH schemes at once, on BOTH accented
  // surfaces the countdown actually lands on: the hero block's 12% plate
  // and the station's 6% radial wash. Rendered against HA's stock card
  // backgrounds rather than the live theme, so one screenshot covers
  // both themes without toggling anything.
  // ------------------------------------------------------------------

  /** HA stock card backgrounds — the reference grounds the panel measures against. */
  private static readonly DEV_GROUNDS = { dark: "#1c1c1c", light: "#ffffff" } as const;

  /** Accent surfaces defined in card-styles.ts, as (label, accent share). */
  private static readonly DEV_SURFACES = [
    { label: "hero", ratio: 0.12 },
    { label: "row", ratio: 0.06 },
  ] as const;

  /**
   * The distinct published palette plus the two edge cases that motivated
   * the clamp — pure black (Badner Bahn) and pure white. Live GTFS colours
   * not in this list are appended at render time, so a new line shows up
   * here the day it appears in the feed.
   */
  private static readonly DEV_PALETTE: ReadonlyArray<{
    readonly label: string;
    readonly hex: string;
  }> = [
    { label: "U1", hex: "#E3000F" },
    { label: "U2", hex: "#A862A4" },
    { label: "U3", hex: "#EF7C00" },
    { label: "U4", hex: "#319F49" },
    { label: "U6", hex: "#9D6830" },
    { label: "Tram", hex: "#C00808" },
    { label: "Bus", hex: "#0A295D" },
    { label: "Nightline", hex: NIGHTLINE_BG },
    { label: "Badner Bahn", hex: "#000000" },
    { label: "Weiß", hex: "#FFFFFF" },
  ];

  /** Fixture first, then any live GTFS colour the fixture doesn't already cover. */
  private _devPaletteEntries(): ReadonlyArray<{
    label: string;
    hex: string;
    live: boolean;
  }> {
    const entries = WienerLinienAustriaCard.DEV_PALETTE.map((e) => ({
      ...e,
      live: false,
    }));
    const seen = new Set(entries.map((e) => e.hex.toUpperCase()));
    const live = firstLineColorsMap(
      this.hass,
      (this._config?.entities ?? []).map((s) => s.entity),
    );
    for (const [line, colors] of Object.entries(live)) {
      if (!colors?.bg) continue;
      const hex = `#${colors.bg}`.toUpperCase();
      if (seen.has(hex)) continue;
      seen.add(hex);
      entries.push({ label: line, hex, live: true });
    }
    return entries;
  }

  private _renderDevPalette(): TemplateResult {
    return html`
      <div class="dev-palette">
        ${this._devPaletteEntries().map((entry) => this._renderDevPaletteRow(entry))}
      </div>
    `;
  }

  private _renderDevPaletteRow(entry: {
    label: string;
    hex: string;
    live: boolean;
  }): TemplateResult {
    return html`
      <div class="dev-pal-row">
        <div class="dev-pal-id">
          <span class="dev-pal-badge" style="background: ${entry.hex};">${entry.label}</span>
          <code>${entry.hex.toUpperCase()}${entry.live ? " ·live" : ""}</code>
        </div>
        ${(["dark", "light"] as const).map((scheme) => {
          const text = accentTextColor(entry.hex, scheme);
          const ground = WienerLinienAustriaCard.DEV_GROUNDS[scheme];
          return html`
            <div class="dev-pal-scheme" style="background: ${ground};">
              <span class="dev-pal-scheme-label">${scheme}</span>
              ${WienerLinienAustriaCard.DEV_SURFACES.map((surface) => {
                const plate = mixOver(entry.hex, ground, surface.ratio) ?? ground;
                const ratio = text ? contrastRatio(text, plate) : null;
                const pass = ratio !== null && ratio >= 4.5;
                return html`
                  <div class="dev-pal-chip" style="background: ${plate};">
                    <span
                      class="dev-pal-word"
                      style=${text ? `color: ${text};` : nothing}
                      >${this._t("now")}</span
                    >
                    <span class="dev-pal-ratio ${pass ? "pass" : "fail"}">
                      ${ratio === null ? "—" : ratio.toFixed(2)}
                    </span>
                    <span class="dev-pal-surface">${surface.label}</span>
                  </div>
                `;
              })}
              <code class="dev-pal-out">${(text ?? "—").toUpperCase()}</code>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _devTogglePalette = (): void => {
    this._devPaletteOpen = !this._devPaletteOpen;
  };

  private _randomFrom<T>(arr: readonly T[]): T | null {
    if (arr.length === 0) return null;
    // Length-guarded: `arr[idx]` is definitely `T`, but
    // `noUncheckedIndexedAccess` widens any computed-index read to
    // `T | undefined`. Cast at the boundary so callers don't pay for
    // a synthetic `?? null` they can never observe.
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx] as T;
  }

  // Successive clicks walk through the payload SHAPES the notice renderer
  // has to survive, rather than injecting the same entry repeatedly. Each
  // variant is modelled on a real trafficInfoList entry — including the
  // malformed ones, which are the whole point: 4 of the 10 live entries
  // carrying HTML glue their facts onto the preceding sentence with no
  // separator, and that path is otherwise unreachable in dev.
  private _devTrafficVariant = 0;
  private _devElevatorVariant = 0;

  /** `descriptionHTML` fixtures, keyed to what each one exercises. */
  private static readonly DEV_TRAFFIC_SHAPES: ReadonlyArray<{
    readonly label: string;
    readonly html: (line: string, towards: string) => string;
  }> = [
    {
      // Well-formed multi-paragraph notice — the U3 Bauarbeiten shape.
      // Date duration (calendar icon) + construction reason (excavator).
      label: "Bauarbeiten",
      html: (line, towards) =>
        `<p>Die Linie ${line} fährt derzeit nicht Richtung ${towards}.</p><p><br></p>` +
        `<p>Weichen Sie ersatzweise auf die Linien E3, 46 und 49 aus.</p><p><br></p>` +
        `<p>Voraussichtliche Dauer: 31. August.</p><p><br></p>` +
        `<p>Grund: Bauarbeiten im Bereich zwischen Westbahnhof U und Hütteldorfer Straße U.</p>`,
    },
    {
      // Everything glued into one paragraph, no space after the colon or
      // the periods — the 43/31/U4 shape. Exercises heading detach AND
      // fact splitting in a single line.
      label: "Run-on (ungetrennt)",
      html: (line) =>
        `<p>Linie ${line}:Betrieb nur zwischen Schottentor U und Dornbach. ` +
        `Weichen Sie ersatzweise auf die Linie 43A aus.Voraussichtliche Dauer: ` +
        `31.07.2026.Grund: Gleisbauarbeiten im Bereich Dornbacher Straße.</p>`,
    },
    {
      // Several per-line sections — the 5/12/37/38/40/41/42 shape, the
      // case the headings exist for.
      label: "Mehrere Linien",
      html: (line) =>
        `<p>Linie ${line}:</p>` +
        `<p>Kein Betrieb zwischen Lerchenfelder Straße und Franz-Josefs-Bahnhof S.</p>` +
        `<p>Betrieb zwischen Westbahnhof S U und Lerchenfelder Straße.</p>` +
        `<p>Linie 12:</p>` +
        `<p>Betrieb nur zwischen Hillerstraße und Franz-Josefs-Bahnhof S.</p>` +
        `<p>Linien 40, 41, 42:</p>` +
        `<p>Kein Betrieb. Die Außenäste werden von den Linien 37 und 38 übernommen.</p>` +
        `<p>Die Störung dauert voraussichtlich bis Ende August.</p>`,
    },
    {
      // Clock-only duration (clock icon, not calendar) + accident reason.
      label: "Unfall, Uhrzeit",
      html: (line) =>
        `<p>Linie ${line}:</p><p>Unregelmäßige Intervalle in beiden Richtungen.</p>` +
        `<p>Voraussichtliche Dauer: 11:30 Uhr.</p>` +
        `<p>Grund: Verkehrsunfall im Bereich Gersthofer Straße 140.</p>`,
    },
    {
      // Reason matching no category — must fall back to the neutral
      // circled "i" rather than guessing a pictogram.
      label: "Unbekannter Grund",
      html: (line) =>
        `<p>Linie ${line}:</p><p>Es kommt zu Verzögerungen im Betrieb.</p>` +
        `<p>Voraussichtliche Dauer: Ende August.</p>` +
        `<p>Grund: Vorübergehend nicht näher bekannte Ursache.</p>`,
    },
  ];

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
    const shapes = WienerLinienAustriaCard.DEV_TRAFFIC_SHAPES;
    const shape = shapes[this._devTrafficVariant % shapes.length]!;
    this._devTrafficVariant += 1;
    const html = shape.html(line, towards);
    this._debugTraffic = [
      ...this._debugTraffic,
      {
        name: `DEBUG-T-${Date.now()}`,
        title: `${line}: ${shape.label}`,
        // Plain-text twin of the HTML, mirroring the feed: `description`
        // is the same prose with the tags removed.
        description: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        description_html: html,
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
    // Pull both fields off ONE departure — two independent draws would
    // happily pair the line "U6" with a "towards" from a U1 row,
    // producing nonsense in the dev-mode preview banner.
    const sample = this._randomFrom(deps);
    const anyLine = sample?.line || "";
    const towards = sample?.towards || "Unbekannt";
    const now = new Date();
    // Location strings use " - " between path segments in every live
    // entry; the variants cover three, two and — the case with no
    // separator at all — one segment, alongside the three reason
    // categories the pictogram has to distinguish.
    const shapes: ReadonlyArray<{ description: string; reason: string }> = [
      {
        description: `${anyLine || "U3"} Mittelbahnsteig - Zwischengeschoss Zugang ${station} - Ausgang ${station}`,
        reason: "Aufzug ist wegen Bauarbeiten bis 03.08.2026 außer Betrieb!",
      },
      {
        description: `${anyLine || "U6"} Bahnsteig Richtung ${towards} - Ausgang ${station}`,
        reason: "An der Instandsetzung wird bereits gearbeitet.",
      },
      {
        // No " - " anywhere: the single-segment path, plus a reason that
        // matches no category and must land on the neutral fallback icon.
        description: `Ausgang ${station}`,
        reason: "Der Aufzug steht aus nicht näher bekannter Ursache still.",
      },
    ];
    const shape = shapes[this._devElevatorVariant % shapes.length]!;
    this._devElevatorVariant += 1;
    this._debugElevator = [
      ...this._debugElevator,
      {
        __debug_entity: pick.entity,
        name: `DEBUG-E-${Date.now()}`,
        station,
        description: shape.description,
        reason: shape.reason,
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
    this._devPaletteOpen = false;
  };


  static override styles = cardStyles;
}
