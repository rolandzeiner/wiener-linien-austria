/**
 * Wiener Linien Austria Retro Card v0.1.0
 * LED-style departure display mimicking the classic Wiener Linien platform
 * signs: amber dot-matrix text on black, green Gleis panel on the right.
 * https://github.com/rolandzeiner/wiener-linien-austria
 */

const CARD_VERSION = "0.1.0";

// ------------------------------------------------------------------
// Shared helpers. Duplicated from the modern card so the two files
// stay independently revable (see project feedback memory on
// versioning). If duplication grows, extract a _shared.js module.
// ------------------------------------------------------------------

const _esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

const TRANSLATIONS = {
  de: {
    no_entity: "Keine Haltestelle ausgewählt",
    no_data: "Keine Abfahrten",
    no_data_wrong_direction: "Keine Abfahrten in dieser Richtung",
    no_data_wrong_line: "Keine Abfahrten für diese Linie",
    dir_h: "H",
    dir_r: "R",
    gleis: "GLEIS",
    steig: "STEIG",
    version_update:
      "Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",
    version_reload: "Neu laden",
    editor: {
      section_sensor: "Haltestelle",
      section_direction: "Richtung",
      section_line: "Linie",
      section_display: "Darstellung",
      sensor_hint: "Eine Haltestelle auswählen.",
      direction_hint:
        "Hin- oder Rückfahrt — die Retro-Anzeige zeigt nur eine Richtung.",
      direction_no_data: "Keine Abfahrten in dieser Richtung",
      line_hint:
        "Optional: nur eine Linie anzeigen. Aktiven Chip erneut antippen = alle Linien.",
      show_platform: "Gleis/Steig anzeigen",
      size_label: "Größe",
      size_small: "Klein",
      size_medium: "Mittel",
      size_regular: "Normal",
      no_sensors:
        "Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",
      no_lines:
        "Für diese Haltestelle und Richtung sind aktuell keine Linien im Sensor.",
    },
  },
  en: {
    no_entity: "No stop selected",
    no_data: "No departures",
    no_data_wrong_direction: "No departures in this direction",
    no_data_wrong_line: "No departures for this line",
    dir_h: "H",
    dir_r: "R",
    gleis: "PLATF.",
    steig: "STAND",
    version_update:
      "Retro card updated to v{v} — please reload",
    version_reload: "Reload",
    editor: {
      section_sensor: "Stop",
      section_direction: "Direction",
      section_line: "Line",
      section_display: "Display",
      sensor_hint: "Pick a single stop.",
      direction_hint:
        "Outbound or return — the retro display only shows one direction.",
      direction_no_data: "No departures in this direction",
      line_hint:
        "Optional: restrict to a single line. Tap the active chip again to show all lines.",
      show_platform: "Show platform",
      size_label: "Size",
      size_small: "Small",
      size_medium: "Medium",
      size_regular: "Regular",
      no_sensors:
        "No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",
      no_lines:
        "The sensor currently reports no lines for this stop + direction.",
    },
  },
};

// ------------------------------------------------------------------
// Config normalisation
// ------------------------------------------------------------------

const RETRO_SIZES = new Set(["small", "medium", "regular"]);

function _normaliseConfig(config) {
  const out = { ...(config || {}) };
  if (typeof out.entity !== "string" || !out.entity.includes(".")) {
    delete out.entity;
  }
  if (out.direction !== "H" && out.direction !== "R") {
    out.direction = "H";
  }
  // Optional single-line filter. Empty / missing = show all lines.
  if (typeof out.line === "string") {
    const trimmed = out.line.trim();
    if (trimmed) out.line = trimmed;
    else delete out.line;
  } else if (out.line != null) {
    delete out.line;
  }
  // Show Gleis/Steig panel by default (matches v0 behaviour). Explicit
  // `false` hides it — useful on narrow mobile cards or when the user
  // prioritises destination text width over platform info.
  out.show_platform = out.show_platform !== false;
  // Card size: regular = previous sizing, medium / small scale
  // font + padding proportionally for denser or cramped layouts.
  if (!RETRO_SIZES.has(out.size)) out.size = "regular";
  return out;
}

// ------------------------------------------------------------------
// LED-display styling
// ------------------------------------------------------------------

const LED_AMBER = "#FFC700";
const LED_GREEN = "#3DF500";
const LED_BG = "#000";
const LED_SUBSTRATE = "#1a0d2a";

const RETRO_STYLE = `
  :host, .retro {
    --led-amber: ${LED_AMBER};
    --led-green: ${LED_GREEN};
    --led-bg: ${LED_BG};
    --led-substrate: ${LED_SUBSTRATE};
  }
  .retro {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--led-bg);
    /* Faint LED-substrate dot pattern: violet dots every 4px echo the
       look of an unlit pixel between glowing ones. */
    background-image: radial-gradient(
      circle, var(--led-substrate) 0.5px, transparent 1px
    );
    background-size: 4px 4px;
    padding: 14px 18px;
    /* Pure system monospace stack — avoids a Google-Fonts CDN fetch
       (GDPR) and the @import-inside-Lovelace flakiness. Bold + wider
       letter-spacing gives the retro fixed-pitch LED feel without a
       custom font file. */
    font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
    font-weight: 700;
    letter-spacing: 0.08em;
    overflow: hidden;
    border-radius: var(--ha-card-border-radius, 12px);
    min-height: 110px;
  }
  .retro-main {
    display: flex;
    align-items: stretch;
    flex: 1;
  }
  /* Gleis "2" sits on the left per the station displays. */
  .retro--gleis-left .retro-gleis { order: -1; }
  .retro-rows {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    color: var(--led-amber);
    text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
    font-size: 1.9em;
    line-height: 1;
  }
  .retro-row {
    display: grid;
    grid-template-columns: 2.5em 1fr auto;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }
  .retro-line {
    font-weight: 400;
    text-align: left;
  }
  .retro-dest {
    display: flex;
    align-items: baseline;
    gap: 0.35em;
    overflow: hidden;
    text-transform: uppercase;
    min-width: 0;
  }
  .retro-dest-text {
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }
  /* Wheelchair icon — rendered via ha-icon (MDI path) so it inherits the
     amber LED color via currentColor and picks up the same drop-shadow
     glow as the text. Unicode ♿ would have rendered via the OS emoji
     font in blue/white, breaking the retro look. */
  .retro-wheelchair {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    --mdc-icon-size: 1em;
    color: inherit;
    filter: drop-shadow(0 0 4px rgba(255, 199, 0, 0.7));
  }
  .retro-cd {
    font-variant-numeric: tabular-nums;
    text-align: right;
    min-width: 2.5em;
  }
  .retro-gleis {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 14px 0 18px;
    margin-left: 12px;
    color: var(--led-amber);
    text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
    border-left: 1px solid rgba(255, 199, 0, 0.25);
  }
  .retro--gleis-left .retro-gleis {
    padding: 0 18px 0 14px;
    margin-left: 0;
    margin-right: 12px;
    border-left: none;
    border-right: 1px solid rgba(255, 199, 0, 0.25);
  }
  .retro-gleis-label {
    font-size: 0.9em;
    letter-spacing: 2px;
    margin-bottom: 2px;
    opacity: 0.9;
  }
  .retro-gleis-number {
    font-size: 3em;
    line-height: 1;
    font-weight: 400;
  }

  /* ---- size variants ---- */
  /* "regular" uses the base sizing above — no override needed. */
  .retro--size-medium {
    padding: 11px 14px;
    min-height: 92px;
  }
  .retro--size-medium .retro-rows { font-size: 1.55em; gap: 6px; }
  .retro--size-medium .retro-gleis { padding: 0 10px 0 14px; min-width: 48px; }
  .retro--size-medium.retro--gleis-left .retro-gleis {
    padding: 0 14px 0 10px;
  }
  .retro--size-medium .retro-gleis-number { font-size: 2.3em; }
  .retro--size-medium .retro-gleis-label {
    font-size: 0.8em;
    letter-spacing: 1.5px;
  }

  .retro--size-small {
    padding: 8px 10px;
    min-height: 72px;
  }
  .retro--size-small .retro-rows { font-size: 1.25em; gap: 4px; }
  .retro--size-small .retro-row {
    grid-template-columns: 2em 1fr auto;
    gap: 8px;
  }
  .retro--size-small .retro-gleis {
    padding: 0 8px 0 10px;
    min-width: 38px;
    margin-left: 8px;
  }
  .retro--size-small.retro--gleis-left .retro-gleis {
    padding: 0 10px 0 8px;
    margin-left: 0;
    margin-right: 8px;
  }
  .retro--size-small .retro-gleis-number { font-size: 1.75em; }
  .retro--size-small .retro-gleis-label {
    font-size: 0.68em;
    letter-spacing: 1px;
    margin-bottom: 0;
  }
  .retro-empty {
    flex: 1;
    text-align: center;
    align-self: center;
    color: var(--led-amber);
    text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
    font-size: 1.4em;
    padding: 20px 0;
    letter-spacing: 2px;
  }
  .retro-banner {
    background: #ffa000;
    color: #000;
    padding: 6px 10px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-family: sans-serif;
    border-radius: 4px;
    letter-spacing: normal;
    font-size: 0.75em;
  }
  .retro-banner button {
    background: #000;
    color: #ffa000;
    border: none;
    border-radius: 3px;
    padding: 3px 10px;
    font-weight: 600;
    cursor: pointer;
    font-family: sans-serif;
  }
`;

// ------------------------------------------------------------------
// Card
// ------------------------------------------------------------------

class WienerLinienAustriaRetroCard extends HTMLElement {
  _config = {};
  _hass = null;
  _versionMismatch = null;
  _lastFingerprint = null;

  setConfig(config) {
    this._config = _normaliseConfig(config);
    this._lastFingerprint = null;
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._checkCardVersion();
    const fp = this._fingerprint();
    if (fp === this._lastFingerprint) return;
    this._lastFingerprint = fp;
    this._render();
  }

  getCardSize() {
    return 2;
  }

  static getConfigElement() {
    return document.createElement("wiener-linien-austria-retro-card-editor");
  }

  static getStubConfig(hass) {
    const entities = _findWienerLinienEntities(hass);
    return {
      entity: entities[0] || "",
      direction: "H",
    };
  }

  async _checkCardVersion() {
    if (!this._hass?.callWS) return;
    try {
      const result = await this._hass.callWS({
        type: "wiener_linien_austria/retro_card_version",
      });
      if (result?.version && result.version !== CARD_VERSION) {
        this._versionMismatch = result.version;
        this._lastFingerprint = null;
        this._render();
      }
    } catch (_) {
      /* backend may be older; ignore */
    }
  }

  _lang() {
    const hl = this._hass?.language || "en";
    return hl.startsWith("de") ? "de" : "en";
  }

  _t(key) {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  _resolveEntity() {
    if (this._config.entity && this._hass?.states[this._config.entity]) {
      return this._config.entity;
    }
    const available = _findWienerLinienEntities(this._hass);
    return available[0] || null;
  }

  _fingerprint() {
    if (!this._hass) return null;
    const eid = this._resolveEntity();
    if (!eid) return `${this._versionMismatch || ""}||no-entity`;
    const a = this._hass.states[eid]?.attributes || {};
    const dir = this._config.direction;
    const lineFilter = this._config.line || "";
    const deps = (a.departures || [])
      .filter((d) => d && d.direction === dir)
      .filter((d) => !lineFilter || d.line === lineFilter)
      .slice(0, 2)
      .map(
        (d) =>
          `${d.line}|${d.towards}|${d.countdown}|${d.platform || ""}|${
            d.barrier_free ? 1 : 0
          }`,
      )
      .join(";");
    return `${this._versionMismatch || ""}||${eid}@${a.server_time || ""}|${dir}|${lineFilter}#${deps}`;
  }

  _render() {
    if (!this._hass) return;
    const eid = this._resolveEntity();
    const state = eid ? this._hass.states[eid] : null;
    const attrs = state?.attributes ?? {};
    const dir = this._config.direction;
    const lineFilter = this._config.line || "";
    const matching = Array.isArray(attrs.departures)
      ? attrs.departures
          .filter((d) => d && d.direction === dir)
          .filter((d) => !lineFilter || d.line === lineFilter)
      : [];
    const rows = matching.slice(0, 2);
    const showPlatform = this._config.show_platform !== false;
    const rawPlatform = rows.find((d) => d.platform)?.platform || null;
    const platform = showPlatform ? rawPlatform : null;
    // Gleis "2" sits on the left, anything else (including "1") on the
    // right — matches Wiener Linien's platform-display convention.
    const gleisLeft = platform === "2";
    // Buses don't run on Gleise — Wiener Linien uses "Steig" for bus
    // platform positions. Pick the label off the first row's type.
    const type = rows[0]?.type || "";
    const isBus = type === "ptBusCity" || type === "ptBusNight";
    const platformLabel = this._t(isBus ? "steig" : "gleis");
    const size = this._config.size || "regular";

    const banner = this._versionMismatch ? this._renderBanner() : "";

    let mainHtml;
    if (!eid) {
      mainHtml = `<div class="retro-empty">${_esc(this._t("no_entity"))}</div>`;
    } else if (rows.length === 0) {
      // Figure out why it's empty so we can give a useful hint:
      // - nothing at this stop in this direction
      // - nothing at this stop matching the line filter
      // - or just nothing at all
      const allDeps = Array.isArray(attrs.departures) ? attrs.departures : [];
      const inDirection = allDeps.filter((d) => d && d.direction === dir);
      let messageKey = "no_data";
      if (allDeps.length > 0 && inDirection.length === 0) {
        messageKey = "no_data_wrong_direction";
      } else if (lineFilter && inDirection.length > 0) {
        messageKey = "no_data_wrong_line";
      }
      mainHtml = `<div class="retro-empty">${_esc(this._t(messageKey))}</div>`;
    } else {
      mainHtml = `
        <div class="retro-rows">
          ${rows.map((d) => this._renderRow(d)).join("")}
        </div>
        ${platform ? this._renderGleis(platform, platformLabel) : ""}
      `;
    }

    const retroClass = [
      "retro",
      gleisLeft ? "retro--gleis-left" : "",
      size !== "regular" ? `retro--size-${size}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    this.innerHTML = `
      <ha-card style="background:${LED_BG};padding:0;overflow:hidden;">
        <style>${RETRO_STYLE}</style>
        <div class="${retroClass}">
          ${banner}
          <div class="retro-main">${mainHtml}</div>
        </div>
      </ha-card>
    `;

    const reloadBtn = this.querySelector(".retro-banner button");
    if (reloadBtn) reloadBtn.addEventListener("click", () => this._reload());
  }

  _renderRow(d) {
    const line = _esc(d.line || "?");
    const towards = _esc(d.towards || "");
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    const cdLabel = cd === null ? "--" : String(Math.max(0, cd));
    // Wheelchair icon after the destination, mirroring real Wiener Linien
    // station boards that mark step-free departures. Using ha-icon (MDI
    // SVG) rather than the ♿ emoji so it stays in the amber LED tone —
    // OS emoji fonts would force blue/white and ruin the retro look.
    const wheelchairHtml = d.barrier_free
      ? '<ha-icon class="retro-wheelchair" icon="mdi:wheelchair-accessibility" title="Barrierefrei"></ha-icon>'
      : "";
    return `
      <div class="retro-row">
        <div class="retro-line">${line}</div>
        <div class="retro-dest"><span class="retro-dest-text">${towards}</span>${wheelchairHtml}</div>
        <div class="retro-cd">${_esc(cdLabel)}</div>
      </div>
    `;
  }

  _renderGleis(platform, label) {
    return `
      <div class="retro-gleis">
        <div class="retro-gleis-label">${_esc(label)}</div>
        <div class="retro-gleis-number">${_esc(platform)}</div>
      </div>
    `;
  }

  _renderBanner() {
    const msg = this._t("version_update").replace("{v}", this._versionMismatch);
    return `
      <div class="retro-banner">
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
}

// ------------------------------------------------------------------
// Editor — chip picker (single-select) + H/R toggle
// ------------------------------------------------------------------

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
  .entity-chips {
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
  .direction-buttons {
    display: inline-flex;
    gap: 6px;
  }
  .direction-buttons button {
    padding: 6px 16px;
    border-radius: 16px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
    min-width: 48px;
  }
  .direction-buttons button.active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .direction-buttons button.no-data {
    opacity: 0.45;
  }
  .direction-warning {
    margin-top: 4px;
    font-size: 12px;
    color: var(--warning-color, #ffa000);
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

class WienerLinienAustriaRetroCardEditor extends HTMLElement {
  _config = {};
  _hass = null;

  setConfig(config) {
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

  _t(key) {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  _et(key) {
    return (
      TRANSLATIONS[this._lang()]?.editor?.[key]
      ?? TRANSLATIONS.en.editor[key]
      ?? key
    );
  }

  _fire() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config } },
      }),
    );
  }

  _pickEntity(eid) {
    this._config = { ...this._config, entity: eid };
    this._fire();
    this._render();
  }

  _setDirection(dir) {
    if (dir !== "H" && dir !== "R") return;
    this._config = { ...this._config, direction: dir };
    this._fire();
    this._render();
  }

  _pickLine(line) {
    // Click an active chip → clear to "all lines". Otherwise set it.
    const next = { ...this._config };
    if (next.line === line) delete next.line;
    else next.line = line;
    this._config = next;
    this._fire();
    this._render();
  }

  _setShowPlatform(on) {
    this._config = { ...this._config, show_platform: !!on };
    this._fire();
    this._render();
  }

  _setSize(size) {
    if (!RETRO_SIZES.has(size)) return;
    this._config = { ...this._config, size };
    this._fire();
    this._render();
  }

  _linesForCurrent() {
    // Lines that actually have departures for the selected
    // (entity, direction). Used to populate the line-chip picker.
    const eid = this._config.entity;
    const dir = this._config.direction || "H";
    const a = eid ? this._hass?.states[eid]?.attributes : null;
    const deps = Array.isArray(a?.departures) ? a.departures : [];
    const seen = new Set();
    for (const d of deps) {
      if (d && d.direction === dir && typeof d.line === "string" && d.line) {
        seen.add(d.line);
      }
    }
    return [...seen].sort();
  }

  _directionsWithData() {
    // Returns a Set of directions ("H" / "R") that actually carry
    // departures at the currently-selected stop. RBLs are typically
    // one-direction platforms (especially for trams/buses), so the
    // editor shouldn't let the user get stuck on an empty direction.
    const eid = this._config.entity;
    const a = eid ? this._hass?.states[eid]?.attributes : null;
    const deps = Array.isArray(a?.departures) ? a.departures : [];
    const seen = new Set();
    for (const d of deps) {
      if (d && (d.direction === "H" || d.direction === "R")) {
        seen.add(d.direction);
      }
    }
    return seen;
  }

  _render() {
    if (!this._hass) return;

    const available = _findWienerLinienEntities(this._hass);
    const selected = this._config.entity || "";
    const direction = this._config.direction || "H";
    const selectedLine = this._config.line || "";
    const directionsWithData = this._directionsWithData();
    const showPlatform = this._config.show_platform !== false;
    const size = RETRO_SIZES.has(this._config.size)
      ? this._config.size
      : "regular";

    const chips = available.length
      ? available
          .map((eid) => {
            const a = this._hass.states[eid]?.attributes;
            const stopName = a?.stop_name || a?.friendly_name || eid;
            const isSel = eid === selected;
            return `
              <button
                type="button"
                class="chip ${isSel ? "selected" : ""}"
                data-entity="${_esc(eid)}"
              >
                <span class="stop-name">${_esc(stopName)}</span>
                <span class="eid">${_esc(eid.split(".")[1] || eid)}</span>
              </button>
            `;
          })
          .join("")
      : `<div class="editor-hint">${_esc(this._et("no_sensors"))}</div>`;

    const lines = this._linesForCurrent();
    const lineChips = lines.length
      ? lines
          .map((line) => {
            const isSel = line === selectedLine;
            return `
              <button
                type="button"
                class="chip ${isSel ? "selected" : ""}"
                data-line="${_esc(line)}"
              ><span class="stop-name">${_esc(line)}</span></button>
            `;
          })
          .join("")
      : `<div class="editor-hint">${_esc(this._et("no_lines"))}</div>`;

    this.innerHTML = `
      <div class="editor">
        <style>${EDITOR_STYLE}</style>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_sensor"))}</div>
          <div class="editor-hint">${_esc(this._et("sensor_hint"))}</div>
          <div class="entity-chips">${chips}</div>
        </div>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_direction"))}</div>
          <div class="editor-hint">${_esc(this._et("direction_hint"))}</div>
          <div class="direction-buttons">
            <button type="button" data-dir="H" class="${[
              direction === "H" ? "active" : "",
              directionsWithData.has("H") ? "" : "no-data",
            ].filter(Boolean).join(" ")}">${_esc(this._t("dir_h"))}</button>
            <button type="button" data-dir="R" class="${[
              direction === "R" ? "active" : "",
              directionsWithData.has("R") ? "" : "no-data",
            ].filter(Boolean).join(" ")}">${_esc(this._t("dir_r"))}</button>
          </div>
          ${
            selected && !directionsWithData.has(direction)
              ? `<div class="direction-warning">${_esc(this._et("direction_no_data"))}</div>`
              : ""
          }
        </div>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_line"))}</div>
          <div class="editor-hint">${_esc(this._et("line_hint"))}</div>
          <div class="entity-chips">${lineChips}</div>
        </div>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_display"))}</div>
          <div class="toggle-row">
            <label for="retro-show-platform">${_esc(this._et("show_platform"))}</label>
            <ha-switch
              id="retro-show-platform"
              data-field="show_platform"
              ${showPlatform ? "checked" : ""}
            ></ha-switch>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:4px;">
            <span style="font-size:13px;">${_esc(this._et("size_label"))}</span>
            <div class="direction-buttons">
              <button type="button" data-size="small" class="${size === "small" ? "active" : ""}">${_esc(this._et("size_small"))}</button>
              <button type="button" data-size="medium" class="${size === "medium" ? "active" : ""}">${_esc(this._et("size_medium"))}</button>
              <button type="button" data-size="regular" class="${size === "regular" ? "active" : ""}">${_esc(this._et("size_regular"))}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.querySelectorAll(".chip[data-entity]").forEach((chip) => {
      chip.addEventListener("click", () =>
        this._pickEntity(chip.dataset.entity),
      );
    });
    this.querySelectorAll(".direction-buttons button").forEach((btn) => {
      btn.addEventListener("click", () => this._setDirection(btn.dataset.dir));
    });
    this.querySelectorAll(".chip[data-line]").forEach((chip) => {
      chip.addEventListener("click", () =>
        this._pickLine(chip.dataset.line),
      );
    });
    this.querySelectorAll("ha-switch[data-field='show_platform']").forEach(
      (sw) => {
        sw.addEventListener("change", (e) =>
          this._setShowPlatform(e.target.checked),
        );
      },
    );
    this.querySelectorAll("button[data-size]").forEach((btn) => {
      btn.addEventListener("click", () => this._setSize(btn.dataset.size));
    });
  }
}

// ------------------------------------------------------------------
// Registration
// ------------------------------------------------------------------

try {
  if (!customElements.get("wiener-linien-austria-retro-card")) {
    customElements.define(
      "wiener-linien-austria-retro-card",
      WienerLinienAustriaRetroCard,
    );
  }
  if (!customElements.get("wiener-linien-austria-retro-card-editor")) {
    customElements.define(
      "wiener-linien-austria-retro-card-editor",
      WienerLinienAustriaRetroCardEditor,
    );
  }
} catch (e) {
  console.error(
    "[Wiener Linien Austria Retro] custom element registration failed",
    e,
  );
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "wiener-linien-austria-retro-card",
  name: "Wiener Linien Austria Retro",
  description:
    "Retro-LED-Anzeige für eine Haltestelle und eine Richtung — Gleis inklusive.",
  preview: false,
  documentationURL: "https://github.com/rolandzeiner/wiener-linien-austria",
});
