/**
 * Wiener Linien Austria Card v1.0.0
 * Custom Lovelace card for Wiener Linien departure boards.
 * https://github.com/rolandzeiner/wiener-linien-austria
 */

const CARD_VERSION = "1.0.0";

// Metro line colours (authoritative per Wiener Linien CI). Non-metro lines
// stay neutral until the user supplies overrides via `line_colors`.
const METRO_COLORS = {
  U1: "#E3000F",
  U2: "#A862A4",
  U3: "#EF7C00",
  U4: "#00963F",
  U5: "#008F95",
  U6: "#9D6830",
};

const TRANSLATIONS = {
  de: {
    no_data: "Keine Abfahrten verfügbar",
    betriebsschluss: "Betriebsschluss",
    min: "min",
    now: "jetzt",
    version_update:
      "Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",
    version_reload: "Neu laden",
    no_entities_picked: "Keine Haltestelle ausgewählt",
    no_entities_available: "Keine Wiener-Linien-Sensoren gefunden",
    barrier_free_title: "Barrierefrei zugänglich",
    disturbance_title: "Verkehrsbehinderung gemeldet",
    dir_h: "H",
    dir_r: "R",
    dir_both: "Beide",
    traffic_label: "Störung",
    traffic_until: "Bis",
    traffic_updated: "aktualisiert",
    elevator_label: "Aufzug außer Betrieb",
    elevator_until: "Bis",
    open_in_maps: "In Karte öffnen",
    delay_singular: "1 Minute verspätet",
    delay_plural: "{n} Minuten verspätet",
    devmode_title: "DEV",
    devmode_traffic_btn: "Test Störung",
    devmode_elevator_btn: "Test Aufzug",
    devmode_clear_btn: "Löschen",
    editor: {
      section_sensors: "Haltestellen",
      sensors_hint: "Eine oder mehrere Haltestellen auswählen",
      section_filters: "Filter pro Haltestelle",
      filters_hint: "Linien und/oder Richtung pro Haltestelle einschränken",
      lines_label: "Linien",
      direction_label: "Richtung",
      section_colors: "Linienfarben",
      colors_hint:
        "Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",
      reset_color: "Zurücksetzen",
      section_display: "Anzeige",
      max_departures: "Anzahl Abfahrten pro Haltestelle",
      show_accessibility: "Barrierefrei-Symbol anzeigen",
      show_traffic_info: "Störungen anzeigen",
      show_elevator_info: "Aufzugsinfo anzeigen",
      show_delay: "Verspätungen anzeigen",
      hide_attribution: "Datenquelle ausblenden",
      layout_label: "Layout mehrerer Haltestellen",
      layout_stacked: "Gestapelt",
      layout_tabs: "Reiter",
      no_sensors_available:
        "Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",
      no_lines_available:
        "Linien erscheinen hier, sobald Haltestellen ausgewählt wurden.",
    },
  },
  en: {
    no_data: "No departures available",
    betriebsschluss: "End of service",
    min: "min",
    now: "now",
    version_update:
      "Wiener Linien Austria updated to v{v} — please reload",
    version_reload: "Reload",
    no_entities_picked: "No stop selected",
    no_entities_available: "No Wiener Linien sensors found",
    barrier_free_title: "Step-free access",
    disturbance_title: "Traffic disruption reported",
    dir_h: "H",
    dir_r: "R",
    dir_both: "Both",
    traffic_label: "Disruption",
    traffic_until: "Until",
    traffic_updated: "updated",
    elevator_label: "Elevator out of service",
    elevator_until: "Until",
    open_in_maps: "Open in maps",
    delay_singular: "1 minute late",
    delay_plural: "{n} minutes late",
    devmode_title: "DEV",
    devmode_traffic_btn: "Test disruption",
    devmode_elevator_btn: "Test elevator",
    devmode_clear_btn: "Clear",
    editor: {
      section_sensors: "Stops",
      sensors_hint: "Pick one or more stops to display",
      section_filters: "Per-stop filters",
      filters_hint: "Optionally restrict lines or direction per stop",
      lines_label: "Lines",
      direction_label: "Direction",
      section_colors: "Line colours",
      colors_hint:
        "Optional overrides. Metro defaults are already set.",
      reset_color: "Reset",
      section_display: "Display",
      max_departures: "Departures per stop",
      show_accessibility: "Show step-free icon",
      show_traffic_info: "Show disruption alerts",
      show_elevator_info: "Show elevator outages",
      show_delay: "Show delays",
      hide_attribution: "Hide data source",
      layout_label: "Multi-stop layout",
      layout_stacked: "Stacked",
      layout_tabs: "Tabs",
      no_sensors_available:
        "No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",
      no_lines_available:
        "Lines appear here once stops are selected.",
    },
  },
};

const _esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Escape everything, then re-allow only <br> variants (<br>, <br/>, <br />).
// Wiener Linien's descriptionHTML uses <br> for paragraph breaks and nothing
// else; keeping the allowlist minimal is defense-in-depth against upstream
// ever embedding a <script> or similar.
function _safeTrafficHtml(html) {
  if (typeof html !== "string" || !html) return "";
  return _esc(html).replace(/&lt;br\s*\/?&gt;/gi, "<br>");
}

function _findWienerLinienEntities(hass) {
  if (!hass || !hass.states) return [];
  return Object.keys(hass.states).filter((eid) => {
    if (!eid.startsWith("sensor.")) return false;
    const a = hass.states[eid].attributes;
    return (
      a &&
      typeof a.diva === "number" &&
      Array.isArray(a.departures) &&
      typeof a.attribution === "string" &&
      a.attribution.startsWith("Datenquelle: Wiener Linien")
    );
  });
}

function _normaliseStopEntry(raw) {
  if (typeof raw === "string") {
    return raw.includes(".") ? { entity: raw } : null;
  }
  if (!raw || typeof raw !== "object" || typeof raw.entity !== "string") {
    return null;
  }
  const out = { entity: raw.entity };
  if (Array.isArray(raw.lines)) {
    const lines = raw.lines.filter(
      (l) => typeof l === "string" && l.length > 0,
    );
    if (lines.length) out.lines = lines;
  }
  if (raw.direction === "H" || raw.direction === "R") {
    out.direction = raw.direction;
  }
  return out;
}

function _normaliseConfig(config) {
  // Back-compat: accept a single `entity` string at top level (v0.1.0 shape).
  const out = { ...(config || {}) };
  if (typeof out.entity === "string" && out.entity.includes(".")) {
    if (!Array.isArray(out.entities) || out.entities.length === 0) {
      out.entities = [out.entity];
    }
  }
  delete out.entity;

  const rawList = Array.isArray(out.entities) ? out.entities : [];
  out.entities = rawList
    .map(_normaliseStopEntry)
    .filter((e) => e !== null);

  const n = parseInt(out.max_departures, 10);
  out.max_departures = Number.isFinite(n) ? Math.max(1, Math.min(20, n)) : 6;

  if (out.line_colors && typeof out.line_colors === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(out.line_colors)) {
      if (typeof k === "string" && typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v)) {
        clean[k.toUpperCase()] = v;
      }
    }
    out.line_colors = clean;
  } else {
    out.line_colors = {};
  }

  out.show_accessibility = out.show_accessibility === true;
  // Alert toggles default ON — if nothing is active, nothing renders anyway,
  // so opt-in would hide useful info without saving screen real estate.
  out.show_traffic_info = out.show_traffic_info !== false;
  out.show_elevator_info = out.show_elevator_info !== false;
  // Delays default ON — matches v0.1.0 behaviour. Users who find the
  // "3 Minuten verspätet" inline text distracting can opt out.
  out.show_delay = out.show_delay !== false;
  // Attribution is shown by default. The sensor's `attribution` attribute
  // still carries the canonical CC-BY string regardless of this flag —
  // hiding only affects the card footer on a private dashboard.
  out.hide_attribution = out.hide_attribution === true;
  // Multi-stop layout: "stacked" (default) or "tabs". Single-stop cards
  // ignore this — only one body ever renders anyway.
  if (out.layout !== "tabs") out.layout = "stacked";

  return out;
}

function _colorForLine(line, overrides) {
  const key = String(line || "").toUpperCase();
  if (overrides && overrides[key]) return overrides[key];
  if (METRO_COLORS[key]) return METRO_COLORS[key];
  return "var(--primary-color)";
}

function _filterDepartures(departures, stopCfg) {
  if (!Array.isArray(departures)) return [];
  const wantLines = stopCfg.lines && stopCfg.lines.length ? new Set(stopCfg.lines) : null;
  const wantDir = stopCfg.direction || null;
  return departures.filter((d) => {
    if (wantLines && !wantLines.has(d.line)) return false;
    if (wantDir && d.direction !== wantDir) return false;
    return true;
  });
}

function _collectLinesInSelection(hass, entities) {
  const seen = new Set();
  for (const stop of entities) {
    const a = hass?.states[stop.entity]?.attributes;
    const deps = Array.isArray(a?.departures) ? a.departures : [];
    for (const d of deps) {
      if (d && typeof d.line === "string" && d.line) seen.add(d.line);
    }
  }
  return [...seen].sort();
}

function _linesAtStop(attrs) {
  const seen = new Set();
  const deps = Array.isArray(attrs?.departures) ? attrs.departures : [];
  for (const d of deps) {
    if (d && typeof d.line === "string" && d.line) seen.add(d.line);
  }
  return [...seen].sort();
}

const CARD_STYLE = `
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
  .wl-tabs {
    display: flex;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
    margin-bottom: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .wl-tabs::-webkit-scrollbar { display: none; }
  .wl-tab {
    flex: 0 0 auto;
    padding: 8px 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
    font-size: 0.95em;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.15s, border-color 0.15s;
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
  .wl-elevator-detail.wl-elevator-nodetail {
    cursor: default;
  }
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
  .wl-elevator-summary .wl-traffic-lines {
    margin: 0;
  }
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
  .wl-elevator-detail-reason {
    color: var(--secondary-text-color);
  }
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
  .wl-traffic.wl-traffic-nodetail {
    cursor: default;
  }
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
  .wl-traffic-title {
    font-weight: 600;
  }
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

class WienerLinienAustriaCard extends HTMLElement {
  _config = {};
  _hass = null;
  _versionMismatch = null;
  _lastFingerprint = null;
  // Which selected stop is currently visible in `layout: tabs` mode.
  // Persists across re-renders; clamped to entities.length in _render.
  _activeTab = 0;

  // Dev-mode synthetic alerts. Populated by the dev-mode buttons that only
  // appear on rpi25 (or with ?wl_debug=1) — lets us visually test the
  // traffic-banner and elevator-badge rendering without waiting for the
  // real upstream to publish something that affects our tracked stops.
  _debugTraffic = [];
  _debugElevator = [];

  // Per-traffic-item expansion state. Keyed by the traffic info `name`
  // (stable upstream id) so that survives coordinator-tick re-renders.
  // Default = collapsed.
  _expandedTraffic = new Set();
  _expandedElevator = new Set();

  setConfig(config) {
    if (config === null || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("wiener-linien-austria-card: config must be an object");
    }
    this._config = _normaliseConfig(config);
    this._lastFingerprint = null;
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._checkCardVersion();
    }
    const fp = this._fingerprint();
    if (fp === this._lastFingerprint) return;
    this._lastFingerprint = fp;
    this._render();
  }

  _delayMinutes(d) {
    // Compare realtime vs planned arrival to detect lateness.
    // Returns null when either side is missing or the delta is < 1 min.
    const realMs = d && d.time_real ? Date.parse(d.time_real) : NaN;
    const plannedMs = d && d.time_planned ? Date.parse(d.time_planned) : NaN;
    if (!Number.isFinite(realMs) || !Number.isFinite(plannedMs)) return null;
    const deltaMin = Math.round((realMs - plannedMs) / 60000);
    return Math.abs(deltaMin) >= 1 ? deltaMin : null;
  }

  _delayText(delay) {
    // Only render positive delays — "early" isn't "delayed", it's noise.
    if (!Number.isFinite(delay) || delay <= 0) return "";
    if (delay === 1) return this._t("delay_singular");
    return this._t("delay_plural").replace("{n}", String(delay));
  }

  getCardSize() {
    const n = (this._config.entities || []).length || 1;
    return Math.min(12, 3 + n * 3);
  }

  static getConfigElement() {
    return document.createElement("wiener-linien-austria-card-editor");
  }

  static getStubConfig(hass) {
    const entities = _findWienerLinienEntities(hass);
    return {
      entities: entities.length ? [entities[0]] : [],
      max_departures: 6,
    };
  }

  async _checkCardVersion() {
    if (!this._hass?.callWS) return;
    try {
      const result = await this._hass.callWS({
        type: "wiener_linien_austria/card_version",
      });
      if (result?.version && result.version !== CARD_VERSION) {
        this._versionMismatch = result.version;
        this._lastFingerprint = null;
        this._render();
      }
    } catch (_) {
      /* backend may not support the command yet */
    }
  }

  _lang() {
    const hl = this._hass?.language || "en";
    return hl.startsWith("de") ? "de" : "en";
  }

  _t(key) {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  _resolveEntities() {
    const picked = Array.isArray(this._config.entities)
      ? this._config.entities.filter((s) => this._hass?.states[s.entity])
      : [];
    if (picked.length) return picked;
    const available = _findWienerLinienEntities(this._hass);
    return available.length ? [{ entity: available[0] }] : [];
  }

  _fingerprint() {
    if (!this._hass) return null;
    const cfgKey = JSON.stringify(this._config);
    const stops = this._resolveEntities();
    const stopKeys = stops.map((s) => {
      const a = this._hass.states[s.entity]?.attributes || {};
      const filtered = _filterDepartures(a.departures || [], s);
      const max = this._config.max_departures;
      const depKey = filtered
        .slice(0, max)
        .map(
          (d) =>
            `${d.line}|${d.towards}|${d.countdown}|${d.direction}|${
              d.traffic_jam ? 1 : 0
            }|${d.barrier_free ? 1 : 0}`,
        )
        .join(";");
      const trafficKey = (a.traffic_info || [])
        .map((t) => `${t.name}:${t.status}`)
        .join(",");
      const elevatorKey = (a.elevator_info || [])
        .map((e) => `${e.name}:${e.status}`)
        .join(",");
      return `${s.entity}@${a.server_time || ""}#${depKey}^T${trafficKey}^E${elevatorKey}`;
    });
    return `${this._versionMismatch || ""}||${cfgKey}||${stopKeys.join("|||")}`;
  }

  _render() {
    if (!this._hass) return;

    const stops = this._resolveEntities();
    const max = this._config.max_departures;
    const overrides = this._config.line_colors || {};
    const showA11y = this._config.show_accessibility;
    const showTraffic = this._config.show_traffic_info;
    const showElevator = this._config.show_elevator_info;

    const attribution =
      stops
        .map((s) => this._hass.states[s.entity]?.attributes?.attribution)
        .find((v) => typeof v === "string" && v.length > 0) ||
      "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";

    const trafficHtml = showTraffic ? this._renderTrafficBanner(stops) : "";

    // Multi-stop tabs layout: only one stop renders at a time, switched by
    // a tab bar at the top. Below two stops the tab bar would just be a
    // single button — not worth the clutter, so we fall through to stacked
    // rendering in that case.
    const useTabs = this._config.layout === "tabs" && stops.length >= 2;
    if (useTabs) {
      if (this._activeTab >= stops.length) this._activeTab = 0;
    }

    let body;
    if (!stops.length) {
      body = this._renderEmpty();
    } else if (useTabs) {
      const active = stops[this._activeTab];
      body =
        this._renderTabs(stops, this._activeTab) +
        this._renderStop(active, max, overrides, showA11y, showElevator);
    } else {
      body = stops
        .map((s) =>
          this._renderStop(s, max, overrides, showA11y, showElevator),
        )
        .join("");
    }
    const attrHtml = this._config.hide_attribution
      ? ""
      : `<div class="wl-attr">${_esc(attribution)}</div>`;

    this.innerHTML = `
      <ha-card>
        <style>${CARD_STYLE}</style>
        <div class="wl-card">
          ${this._versionMismatch ? this._renderBanner() : ""}
          ${trafficHtml}
          ${body}
          ${attrHtml}
          ${this._renderDevModePanel()}
        </div>
      </ha-card>
    `;

    const reloadBtn = this.querySelector(".wl-banner button");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", () => this._reload());
    }

    // Tab-bar click handler: switch active stop and re-render. We call
    // `_render()` directly rather than flip the fingerprint so the flicker
    // short-circuit stays intact for coordinator polls.
    this.querySelectorAll(".wl-tab[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.tab, 10);
        if (Number.isFinite(i) && i !== this._activeTab) {
          this._activeTab = i;
          this._render();
        }
      });
    });

    this.querySelectorAll("[data-dev-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.devAction;
        if (action === "traffic") this._devTestTraffic();
        else if (action === "elevator") this._devTestElevator();
        else if (action === "clear") this._devClear();
      });
    });

    // Toggle traffic-item expand/collapse.
    this.querySelectorAll("[data-traffic-name]").forEach((el) => {
      // Skip items that have no detail to reveal.
      if (!el.querySelector(".wl-traffic-detail")) return;
      el.addEventListener("click", () => {
        const name = el.dataset.trafficName;
        if (!name) return;
        if (this._expandedTraffic.has(name)) {
          this._expandedTraffic.delete(name);
        } else {
          this._expandedTraffic.add(name);
        }
        el.classList.toggle("wl-traffic-expanded");
      });
    });

    // Toggle elevator-detail expand/collapse.
    this.querySelectorAll("[data-elevator-name]").forEach((el) => {
      if (!el.querySelector(".wl-elevator-detail-expand")) return;
      el.addEventListener("click", () => {
        const name = el.dataset.elevatorName;
        if (!name) return;
        if (this._expandedElevator.has(name)) {
          this._expandedElevator.delete(name);
        } else {
          this._expandedElevator.add(name);
        }
        el.classList.toggle("wl-elevator-expanded");
      });
    });
  }

  _renderTrafficBanner(stops) {
    // Deduplicate by traffic-info name across all selected stops.
    const seen = new Set();
    const items = [];
    for (const s of stops) {
      const tis = this._hass.states[s.entity]?.attributes?.traffic_info || [];
      for (const t of tis) {
        if (!t || seen.has(t.name)) continue;
        seen.add(t.name);
        items.push(t);
      }
    }
    // Dev-mode synthetic alerts get appended after real ones.
    for (const t of this._debugTraffic) {
      if (!t || seen.has(t.name)) continue;
      seen.add(t.name);
      items.push(t);
    }
    if (!items.length) return "";
    return `
      <div class="wl-traffic-list">
        ${items.map((t) => this._renderTrafficItem(t)).join("")}
      </div>
    `;
  }

  _renderTrafficItem(t) {
    const overrides = this._config.line_colors || {};
    const lines = Array.isArray(t.related_lines) ? t.related_lines : [];
    const linesHtml = lines.length
      ? `<div class="wl-traffic-lines">${lines
          .map((l) => {
            const color = _colorForLine(l, overrides);
            return `<span class="wl-traffic-line-badge" style="background:${color}">${_esc(l)}</span>`;
          })
          .join("")}</div>`
      : "";

    const title = _esc(t.title || this._t("traffic_label"));

    // Prefer HTML body (preserves paragraph breaks via <br>); fall back
    // to plaintext escaped.
    const descHtml = t.description_html
      ? _safeTrafficHtml(t.description_html)
      : _esc(t.description || "");
    const descBlock = descHtml
      ? `<div class="wl-traffic-desc">${descHtml}</div>`
      : "";

    // Meta row: location chip + time window + last-update stamp.
    const metaParts = [];
    if (t.location) {
      metaParts.push(
        `<span class="wl-traffic-location-chip"><ha-icon icon="mdi:map-marker"></ha-icon>${_esc(t.location)}</span>`,
      );
    }
    const until = this._formatTime(t.time_end);
    if (until) {
      metaParts.push(
        `<span>${_esc(`${this._t("traffic_until")} ${until}`)}</span>`,
      );
    }
    const updated = this._formatTime(t.time_last_update);
    if (updated && updated !== this._formatTime(t.time_created)) {
      metaParts.push(
        `<span>${_esc(`${this._t("traffic_updated")} ${updated}`)}</span>`,
      );
    }
    const metaBlock = metaParts.length
      ? `<div class="wl-traffic-meta">${metaParts.join("")}</div>`
      : "";

    const hasDetail = Boolean(descBlock || metaBlock);
    const expanded = this._expandedTraffic.has(t.name);
    const chevron = hasDetail
      ? `<ha-icon class="wl-traffic-chevron" icon="mdi:chevron-down"></ha-icon>`
      : "";
    const detailBlock = hasDetail
      ? `<div class="wl-traffic-detail">${descBlock}${metaBlock}</div>`
      : "";
    const classes = [
      "wl-traffic",
      expanded ? "wl-traffic-expanded" : "",
      hasDetail ? "" : "wl-traffic-nodetail",
    ]
      .filter(Boolean)
      .join(" ");

    return `
      <div class="${classes}" data-traffic-name="${_esc(t.name || "")}">
        <ha-icon icon="mdi:alert-octagon"></ha-icon>
        <div class="wl-traffic-body">
          <div class="wl-traffic-summary">
            ${linesHtml}
            <div class="wl-traffic-title">${title}</div>
          </div>
          ${detailBlock}
        </div>
        ${chevron}
      </div>
    `;
  }

  _renderTabs(stops, activeIndex) {
    const buttons = stops
      .map((s, i) => {
        const attrs = this._hass.states[s.entity]?.attributes ?? {};
        const label = attrs.stop_name || attrs.friendly_name || s.entity;
        const cls = i === activeIndex ? "wl-tab wl-tab-active" : "wl-tab";
        return `<button type="button" class="${cls}" data-tab="${i}">${_esc(
          label,
        )}</button>`;
      })
      .join("");
    return `<div class="wl-tabs">${buttons}</div>`;
  }

  _renderEmpty() {
    const available = _findWienerLinienEntities(this._hass);
    const key = available.length ? "no_entities_picked" : "no_entities_available";
    return `<div class="wl-empty">${_esc(this._t(key))}</div>`;
  }

  _renderStop(stopCfg, max, overrides, showA11y, showElevator) {
    const state = this._hass.states[stopCfg.entity];
    const attrs = state?.attributes ?? {};
    const title = attrs.stop_name || attrs.friendly_name || stopCfg.entity;
    if (state && attrs.departures !== undefined && !Array.isArray(attrs.departures)) {
      console.warn(
        "[Wiener Linien Austria] unexpected 'departures' attribute shape on",
        stopCfg.entity,
        attrs.departures,
      );
    }
    const allDepartures = Array.isArray(attrs.departures) ? attrs.departures : [];
    const filtered = _filterDepartures(allDepartures, stopCfg);
    const rows = filtered.slice(0, max);
    const realElevator = Array.isArray(attrs.elevator_info)
      ? attrs.elevator_info
      : [];
    const debugElevator = this._debugElevator.filter(
      (e) => e && e.__debug_entity === stopCfg.entity,
    );
    const elevatorInfos = [...realElevator, ...debugElevator];

    let elevatorBadge = "";
    if (showElevator && elevatorInfos.length) {
      const tooltip = elevatorInfos
        .map((e) => {
          const bits = [
            e.station,
            e.description,
            e.reason,
          ].filter((x) => typeof x === "string" && x.length > 0);
          return bits.join(" — ");
        })
        .join("\n");
      const label = this._t("elevator_label");
      elevatorBadge = `
        <span class="wl-elevator-badge" title="${_esc(
          `${label}:\n${tooltip}`,
        )}">
          <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
          <span class="wl-elevator-badge-text">${_esc(label)}</span>
        </span>
      `;
    }

    let rowsHtml;
    if (rows.length) {
      rowsHtml = rows
        .map((d) => this._renderRow(d, overrides, showA11y))
        .join("");
    } else {
      // "Betriebsschluss" when upstream confirmed no trips (server_time set);
      // "No departures available" when we simply have no data yet.
      const key = attrs.server_time ? "betriebsschluss" : "no_data";
      rowsHtml = `<div class="wl-empty">${_esc(this._t(key))}</div>`;
    }

    const elevatorDetailsHtml =
      showElevator && elevatorInfos.length
        ? this._renderElevatorDetails(elevatorInfos)
        : "";

    const mapUrl = this._stopMapUrl(title, attrs.latitude, attrs.longitude);
    const headerTitleHtml = mapUrl
      ? `<a class="wl-stop-link"
           href="${mapUrl}"
           target="_blank"
           rel="noopener noreferrer"
           title="${_esc(this._t("open_in_maps"))}"
           aria-label="${_esc(`${title} — ${this._t("open_in_maps")}`)}"
        ><span>${_esc(title)}</span><ha-icon icon="mdi:open-in-new"></ha-icon></a>`
      : `<span>${_esc(title)}</span>`;

    return `
      <div class="wl-stop">
        <div class="wl-header">
          ${headerTitleHtml}
          ${elevatorBadge}
        </div>
        ${elevatorDetailsHtml}
        ${rowsHtml}
      </div>
    `;
  }

  _stopMapUrl(stopName, lat, lon) {
    // Prefer lat/lon — text search on short names like "Ottakring"
    // resolves to the district centroid, not the station itself.
    // The static catalogue ships coordinates per DIVA so we use them
    // whenever available. Fall back to a name search when a lookup
    // didn't populate coords yet.
    if (typeof lat === "number" && typeof lon === "number") {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    }
    if (!stopName || typeof stopName !== "string") return null;
    const q = encodeURIComponent(`${stopName}, Wien`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  _renderElevatorDetails(elevatorInfos) {
    const rows = elevatorInfos
      .map((e) => {
        // Prefer description (usually the specific elevator location);
        // fall back to station name if description is missing.
        const location = e.description || e.station || "";
        const reason = e.reason || "";
        const until = this._formatTime(e.time_end);

        const timeLine = until
          ? `<div class="wl-elevator-detail-time">${_esc(
              `${this._t("elevator_until")} ${until}`,
            )}</div>`
          : "";
        const reasonLine = reason
          ? `<div class="wl-elevator-detail-reason">${_esc(reason)}</div>`
          : "";
        const hasDetail = Boolean(reasonLine || timeLine);
        const expanded = this._expandedElevator.has(e.name);
        const chevron = hasDetail
          ? `<ha-icon class="wl-elevator-detail-chevron" icon="mdi:chevron-down"></ha-icon>`
          : "";
        const expandBlock = hasDetail
          ? `<div class="wl-elevator-detail-expand">${reasonLine}${timeLine}</div>`
          : "";
        const classes = [
          "wl-elevator-detail",
          expanded ? "wl-elevator-expanded" : "",
          hasDetail ? "" : "wl-elevator-nodetail",
        ]
          .filter(Boolean)
          .join(" ");

        return `
          <div class="${classes}" data-elevator-name="${_esc(e.name || "")}">
            <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
            <div class="wl-elevator-detail-body">
              <div class="wl-elevator-summary">
                <div class="wl-elevator-detail-location">${_esc(location)}</div>
              </div>
              ${expandBlock}
            </div>
            ${chevron}
          </div>
        `;
      })
      .join("");
    return `<div class="wl-elevator-details">${rows}</div>`;
  }

  _formatTime(iso) {
    if (!iso || typeof iso !== "string") return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const locale = this._lang() === "de" ? "de-DE" : "en-GB";
      return d.toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return "";
    }
  }

  _renderRow(d, overrides, showA11y) {
    const line = String(d.line || "?");
    const color = _colorForLine(line, overrides);
    const towards = _esc(d.towards || "");
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const cdLabel =
      cd === null ? "—" : cd <= 0 ? this._t("now") : `${cd} ${this._t("min")}`;
    // Only surface delays when the train is actually running late; early
    // departures are noise. Rendered inline after the destination as
    // muted warning text (e.g. "Alaudagasse 3 Minuten verspätet").
    // Suppressed entirely when the user toggles `show_delay` off.
    const delayText = this._config.show_delay !== false
      ? this._delayText(this._delayMinutes(d))
      : "";
    const towardsHtml = delayText
      ? `${towards} <span class="wl-delay">${_esc(delayText)}</span>`
      : towards;

    const flags = [];
    if (d.traffic_jam) {
      flags.push(
        `<ha-icon class="disturbance" icon="mdi:alert-circle" title="${_esc(
          this._t("disturbance_title"),
        )}"></ha-icon>`,
      );
    }
    if (showA11y && d.barrier_free) {
      flags.push(
        `<ha-icon class="a11y" icon="mdi:wheelchair-accessibility" title="${_esc(
          this._t("barrier_free_title"),
        )}"></ha-icon>`,
      );
    }
    const flagsHtml = flags.length
      ? `<span class="wl-flags">${flags.join("")}</span>`
      : `<span></span>`;

    return `
      <div class="wl-row">
        <div class="wl-line" style="background:${color}">${_esc(line)}</div>
        <div class="wl-towards">${towardsHtml}</div>
        ${flagsHtml}
        <div class="wl-countdown">${_esc(cdLabel)}</div>
      </div>
    `;
  }

  _renderBanner() {
    const msg = this._t("version_update").replace("{v}", this._versionMismatch);
    return `
      <div class="wl-banner">
        <span>${_esc(msg)}</span>
        <button type="button">${_esc(this._t("version_reload"))}</button>
      </div>
    `;
  }

  async _reload() {
    try {
      if (window.caches?.keys) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
    } catch (_) {
      /* best-effort cache wipe */
    }
    window.location.reload();
  }

  // --- Dev-mode helpers --------------------------------------------------

  _isDevMode() {
    // Baked detection for the rpi25 dev box. `?wl_debug=1` is the escape
    // hatch for testing from other origins (Nabu Casa, tailscale, etc.).
    try {
      const host = window.location.hostname || "";
      if (host === "rpi25" || host.startsWith("rpi25.")) return true;
      const search = window.location.search || "";
      if (search.includes("wl_debug=1")) return true;
    } catch (_) {
      /* SSR / restricted ctx — default to off */
    }
    return false;
  }

  _randomFrom(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _devTestTraffic() {
    // Pick a random line + direction from any selected stop's live board.
    const stops = this._resolveEntities();
    const pool = [];
    for (const s of stops) {
      const deps = this._hass.states[s.entity]?.attributes?.departures || [];
      for (const d of deps) {
        if (d && d.line && d.towards) pool.push(d);
      }
    }
    const pick = this._randomFrom(pool);
    const line = pick?.line || "U?";
    const towards = pick?.towards || "Unbekannt";
    const now = new Date();
    const endIso = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
    const startIso = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    this._debugTraffic.push({
      name: `DEBUG-T-${Date.now()}`,
      title: `${line}: Testmeldung`,
      description: `Debug-Eintrag für Linie ${line} Richtung ${towards}.`,
      description_html: `Debug-Eintrag für Linie ${line} Richtung ${towards}.<br><br>Grund: Dev-Mode-Test.`,
      location: "Debug-Stelle",
      related_lines: [line],
      line_types: {},
      time_start: startIso,
      time_end: endIso,
      time_created: startIso,
      time_last_update: now.toISOString(),
      status: "active",
    });
    this._render();
  }

  _devTestElevator() {
    // Pick a random selected stop and attach a fake elevator outage to it.
    const stops = this._resolveEntities();
    const pick = this._randomFrom(stops);
    if (!pick) return;
    const attrs = this._hass.states[pick.entity]?.attributes || {};
    const station = attrs.stop_name || pick.entity;
    const diva =
      typeof attrs.diva === "number" ? attrs.diva : Number(attrs.diva) || 0;
    const deps = Array.isArray(attrs.departures) ? attrs.departures : [];
    const anyLine = this._randomFrom(deps)?.line || "";
    const towards = this._randomFrom(deps)?.towards || "Unbekannt";
    const now = new Date();
    const startIso = new Date(now.getTime() - 45 * 60 * 1000).toISOString();
    const endIso = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    this._debugElevator.push({
      __debug_entity: pick.entity,
      name: `DEBUG-E-${Date.now()}`,
      station,
      description: `${anyLine || "Station"} Bahnsteig Richtung ${towards} — Ausgang ${station}`,
      reason:
        "AUFZUGSERNEUERUNG Voraussichtlich bis Ende Mai außer Betrieb! (Dev-Mode-Test)",
      status: "außer Betrieb",
      related_lines: anyLine ? [anyLine] : [],
      related_stops: diva ? [diva] : [],
      time_start: startIso,
      time_end: endIso,
    });
    this._render();
  }

  _devClear() {
    this._debugTraffic = [];
    this._debugElevator = [];
    this._render();
  }

  _renderDevModePanel() {
    if (!this._isDevMode()) return "";
    return `
      <div class="wl-devmode">
        <span class="wl-devmode-label">${_esc(this._t("devmode_title"))}</span>
        <button type="button" data-dev-action="traffic">${_esc(
          this._t("devmode_traffic_btn"),
        )}</button>
        <button type="button" data-dev-action="elevator">${_esc(
          this._t("devmode_elevator_btn"),
        )}</button>
        <button type="button" class="wl-devmode-clear" data-dev-action="clear">${_esc(
          this._t("devmode_clear_btn"),
        )}</button>
      </div>
    `;
  }
}

// ============================================================
// Visual Card Editor
// ============================================================

const EDITOR_STYLE = `
  .editor {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0,0,0,0.04));
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .section-header {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .editor-hint {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }
  .entity-chips, .line-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
  }
  .chip.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .chip:hover { opacity: 0.85; }
  .chip .stop-name { font-weight: 500; }
  .chip .eid {
    font-size: 11px;
    opacity: 0.7;
  }
  .stop-filter {
    padding: 8px 10px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .stop-filter-header {
    font-size: 13px;
    font-weight: 500;
  }
  .stop-filter-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .stop-filter-row-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--secondary-text-color);
  }
  .direction-buttons {
    display: inline-flex;
    gap: 4px;
  }
  .direction-buttons button {
    padding: 4px 12px;
    border-radius: 14px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
  }
  .direction-buttons button.active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .color-row {
    display: grid;
    grid-template-columns: 44px 1fr auto auto;
    align-items: center;
    gap: 10px;
  }
  .color-row .line-preview {
    text-align: center;
    font-weight: 700;
    color: #fff;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 0.9em;
  }
  .color-row input[type="color"] {
    width: 40px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
  }
  .color-row .reset-btn {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
  }
  .color-row .reset-btn[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .slider-row input[type="range"] {
    flex: 1;
    accent-color: var(--primary-color);
  }
  .slider-row .slider-label {
    font-size: 13px;
    color: var(--primary-text-color);
    min-width: 180px;
  }
  .slider-value {
    min-width: 24px;
    text-align: center;
    font-weight: 600;
    font-size: 14px;
    color: var(--primary-color);
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .toggle-row label {
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
  }
`;

class WienerLinienAustriaCardEditor extends HTMLElement {
  _config = {};
  _hass = null;

  setConfig(config) {
    if (config === null || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("wiener-linien-austria-card: config must be an object");
    }
    this._config = _normaliseConfig(config);
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._render();
  }

  _lang() {
    const hl = this._hass?.language || "en";
    return hl.startsWith("de") ? "de" : "en";
  }

  _et(key) {
    return (
      TRANSLATIONS[this._lang()]?.editor?.[key]
      ?? TRANSLATIONS.en.editor[key]
      ?? key
    );
  }

  _t(key) {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  _fireChanged() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config } },
      }),
    );
  }

  _updateStop(eid, mutator) {
    const entities = (this._config.entities || []).map((s) =>
      s.entity === eid ? mutator({ ...s }) : s,
    );
    this._config = { ...this._config, entities };
    this._fireChanged();
    this._render();
  }

  _toggleStop(eid) {
    const entities = [...(this._config.entities || [])];
    const idx = entities.findIndex((s) => s.entity === eid);
    const next = idx >= 0
      ? entities.filter((_, i) => i !== idx)
      : [...entities, { entity: eid }];
    this._config = { ...this._config, entities: next };
    this._fireChanged();
    this._render();
  }

  _toggleLine(eid, line) {
    this._updateStop(eid, (s) => {
      const cur = new Set(s.lines || []);
      if (cur.has(line)) cur.delete(line);
      else cur.add(line);
      if (cur.size > 0) s.lines = [...cur];
      else delete s.lines;
      return s;
    });
  }

  _setDirection(eid, dir) {
    this._updateStop(eid, (s) => {
      if (dir === null) delete s.direction;
      else s.direction = dir;
      return s;
    });
  }

  _setLineColor(line, color) {
    const colors = { ...(this._config.line_colors || {}) };
    colors[line.toUpperCase()] = color;
    this._config = { ...this._config, line_colors: colors };
    this._fireChanged();
    this._render();
  }

  _resetLineColor(line) {
    const colors = { ...(this._config.line_colors || {}) };
    delete colors[line.toUpperCase()];
    this._config = { ...this._config, line_colors: colors };
    this._fireChanged();
    this._render();
  }

  _setLayout(layout) {
    if (layout !== "stacked" && layout !== "tabs") return;
    this._config = { ...this._config, layout };
    this._fireChanged();
    this._render();
  }

  _render() {
    if (!this._hass) return;

    const available = _findWienerLinienEntities(this._hass);
    const selected = this._config.entities || [];
    const selectedIds = new Set(selected.map((s) => s.entity));
    const max = this._config.max_departures ?? 6;
    const overrides = this._config.line_colors || {};
    const showA11y = this._config.show_accessibility === true;
    const showTraffic = this._config.show_traffic_info !== false;
    const showElevator = this._config.show_elevator_info !== false;
    const showDelay = this._config.show_delay !== false;
    const hideAttr = this._config.hide_attribution === true;
    const layout = this._config.layout === "tabs" ? "tabs" : "stacked";

    // ----- Stop chips -----
    const stopChips = available.length
      ? available
          .map((eid) => {
            const a = this._hass.states[eid]?.attributes;
            const stopName = a?.stop_name || a?.friendly_name || eid;
            const isSelected = selectedIds.has(eid);
            return `
              <button
                type="button"
                class="chip ${isSelected ? "selected" : ""}"
                data-action="toggle-stop"
                data-entity="${_esc(eid)}"
              >
                <span class="stop-name">${_esc(stopName)}</span>
                <span class="eid">${_esc(eid.split(".")[1] || eid)}</span>
              </button>
            `;
          })
          .join("")
      : `<div class="editor-hint">${_esc(this._et("no_sensors_available"))}</div>`;

    // ----- Per-stop filter blocks -----
    const filterBlocks = selected.length
      ? selected
          .map((stop) => {
            const a = this._hass.states[stop.entity]?.attributes;
            if (!a) return "";
            const stopName = a.stop_name || stop.entity;
            const linesAtStop = _linesAtStop(a);
            const picked = new Set(stop.lines || []);
            const dir = stop.direction || null;

            const lineChips = linesAtStop.length
              ? linesAtStop
                  .map((line) => {
                    const isOn = picked.size === 0 || picked.has(line);
                    const color = _colorForLine(line, overrides);
                    return `
                      <button
                        type="button"
                        class="chip ${isOn ? "selected" : ""}"
                        data-action="toggle-line"
                        data-entity="${_esc(stop.entity)}"
                        data-line="${_esc(line)}"
                        style="${isOn ? `background:${color};border-color:${color};color:#fff` : ""}"
                      >${_esc(line)}</button>
                    `;
                  })
                  .join("")
              : `<div class="editor-hint">${_esc(this._et("no_lines_available"))}</div>`;

            return `
              <div class="stop-filter">
                <div class="stop-filter-header">${_esc(stopName)}</div>
                <div class="stop-filter-row">
                  <div class="stop-filter-row-label">${_esc(this._et("lines_label"))}</div>
                  <div class="line-chips">${lineChips}</div>
                </div>
                <div class="stop-filter-row">
                  <div class="stop-filter-row-label">${_esc(this._et("direction_label"))}</div>
                  <div class="direction-buttons" data-entity="${_esc(stop.entity)}">
                    <button type="button" data-dir="H" class="${dir === "H" ? "active" : ""}">${_esc(this._t("dir_h"))}</button>
                    <button type="button" data-dir="R" class="${dir === "R" ? "active" : ""}">${_esc(this._t("dir_r"))}</button>
                    <button type="button" data-dir="" class="${dir === null ? "active" : ""}">${_esc(this._t("dir_both"))}</button>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")
      : `<div class="editor-hint">${_esc(this._et("sensors_hint"))}</div>`;

    // ----- Line colour overrides -----
    const linesInPlay = _collectLinesInSelection(this._hass, selected);
    const colorRows = linesInPlay.length
      ? linesInPlay
          .map((line) => {
            const current = _colorForLine(line, overrides);
            const hasOverride = Boolean(overrides[line.toUpperCase()]);
            return `
              <div class="color-row">
                <div class="line-preview" style="background:${current}">${_esc(line)}</div>
                <span>${_esc(line)}</span>
                <input type="color" data-line="${_esc(line)}" value="${_esc(current.startsWith("#") ? current : "#888888")}" />
                <button type="button" class="reset-btn" data-reset-line="${_esc(line)}" ${hasOverride ? "" : "disabled"}>${_esc(this._et("reset_color"))}</button>
              </div>
            `;
          })
          .join("")
      : `<div class="editor-hint">${_esc(this._et("no_lines_available"))}</div>`;

    this.innerHTML = `
      <div class="editor">
        <style>${EDITOR_STYLE}</style>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_sensors"))}</div>
          <div class="editor-hint">${_esc(this._et("sensors_hint"))}</div>
          <div class="entity-chips">${stopChips}</div>
        </div>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_filters"))}</div>
          <div class="editor-hint">${_esc(this._et("filters_hint"))}</div>
          ${filterBlocks}
        </div>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_display"))}</div>
          <div class="toggle-row" style="gap:12px;">
            <span style="font-size:13px;">${_esc(this._et("layout_label"))}</span>
            <div class="direction-buttons">
              <button type="button" data-layout="stacked" class="${layout === "stacked" ? "active" : ""}">${_esc(this._et("layout_stacked"))}</button>
              <button type="button" data-layout="tabs" class="${layout === "tabs" ? "active" : ""}">${_esc(this._et("layout_tabs"))}</button>
            </div>
          </div>
          <div class="slider-row">
            <span class="slider-label">${_esc(this._et("max_departures"))}</span>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value="${max}"
              data-field="max_departures"
            />
            <span class="slider-value">${max}</span>
          </div>
          <div class="toggle-row">
            <label for="wl-a11y-toggle">${_esc(this._et("show_accessibility"))}</label>
            <ha-switch
              id="wl-a11y-toggle"
              data-field="show_accessibility"
              ${showA11y ? "checked" : ""}
            ></ha-switch>
          </div>
          <div class="toggle-row">
            <label for="wl-traffic-toggle">${_esc(this._et("show_traffic_info"))}</label>
            <ha-switch
              id="wl-traffic-toggle"
              data-field="show_traffic_info"
              ${showTraffic ? "checked" : ""}
            ></ha-switch>
          </div>
          <div class="toggle-row">
            <label for="wl-elevator-toggle">${_esc(this._et("show_elevator_info"))}</label>
            <ha-switch
              id="wl-elevator-toggle"
              data-field="show_elevator_info"
              ${showElevator ? "checked" : ""}
            ></ha-switch>
          </div>
          <div class="toggle-row">
            <label for="wl-delay-toggle">${_esc(this._et("show_delay"))}</label>
            <ha-switch
              id="wl-delay-toggle"
              data-field="show_delay"
              ${showDelay ? "checked" : ""}
            ></ha-switch>
          </div>
          <div class="toggle-row">
            <label for="wl-hide-attr-toggle">${_esc(this._et("hide_attribution"))}</label>
            <ha-switch
              id="wl-hide-attr-toggle"
              data-field="hide_attribution"
              ${hideAttr ? "checked" : ""}
            ></ha-switch>
          </div>
        </div>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_colors"))}</div>
          <div class="editor-hint">${_esc(this._et("colors_hint"))}</div>
          ${colorRows}
        </div>
      </div>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    // Stop toggle
    this.querySelectorAll('[data-action="toggle-stop"]').forEach((chip) => {
      chip.addEventListener("click", () => this._toggleStop(chip.dataset.entity));
    });

    // Line filter toggle
    this.querySelectorAll('[data-action="toggle-line"]').forEach((chip) => {
      chip.addEventListener("click", () =>
        this._toggleLine(chip.dataset.entity, chip.dataset.line),
      );
    });

    // Direction buttons
    this.querySelectorAll(".direction-buttons").forEach((grp) => {
      const eid = grp.dataset.entity;
      grp.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const dir = btn.dataset.dir;
          this._setDirection(eid, dir === "" ? null : dir);
        });
      });
    });

    // Colour pickers
    this.querySelectorAll('input[type="color"][data-line]').forEach((input) => {
      input.addEventListener("change", (e) => {
        this._setLineColor(input.dataset.line, e.target.value);
      });
    });
    this.querySelectorAll("[data-reset-line]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        this._resetLineColor(btn.dataset.resetLine);
      });
    });

    // Max-departures slider
    this.querySelectorAll('input[type="range"]').forEach((input) => {
      ["keydown", "keyup", "keypress"].forEach((evt) => {
        input.addEventListener(evt, (e) => e.stopPropagation());
      });
      input.addEventListener("input", (e) => {
        const label = e.target.nextElementSibling;
        if (label) label.textContent = e.target.value;
      });
      input.addEventListener("change", (e) => {
        const field = e.target.dataset.field;
        const v = parseInt(e.target.value, 10);
        if (!Number.isFinite(v)) return;
        this._config = { ...this._config, [field]: v };
        this._fireChanged();
      });
    });

    // Display-section switches (accessibility / traffic / elevator)
    this.querySelectorAll("ha-switch[data-field]").forEach((sw) => {
      sw.addEventListener("change", (e) => {
        const field = e.target.dataset.field;
        this._config = { ...this._config, [field]: e.target.checked };
        this._fireChanged();
        this._render();
      });
    });

    // Layout buttons (stacked / tabs)
    this.querySelectorAll("button[data-layout]").forEach((btn) => {
      btn.addEventListener("click", () => this._setLayout(btn.dataset.layout));
    });
  }
}

try {
  if (!customElements.get("wiener-linien-austria-card")) {
    customElements.define("wiener-linien-austria-card", WienerLinienAustriaCard);
  }
  if (!customElements.get("wiener-linien-austria-card-editor")) {
    customElements.define(
      "wiener-linien-austria-card-editor",
      WienerLinienAustriaCardEditor,
    );
  }
} catch (e) {
  console.error("[Wiener Linien Austria] custom element registration failed", e);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "wiener-linien-austria-card",
  name: "Wiener Linien Austria",
  description: "Abfahrtsmonitor für Wiener Linien Stationen.",
  preview: true,
  documentationURL: "https://github.com/rolandzeiner/wiener-linien-austria",
});
