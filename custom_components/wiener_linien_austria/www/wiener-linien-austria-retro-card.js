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
    dir_h: "H",
    dir_r: "R",
    gleis: "GLEIS",
    version_update:
      "Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",
    version_reload: "Neu laden",
    editor: {
      section_sensor: "Haltestelle",
      section_direction: "Richtung",
      sensor_hint: "Eine Haltestelle auswählen.",
      direction_hint:
        "Hin- oder Rückfahrt — die Retro-Anzeige zeigt nur eine Richtung.",
      no_sensors:
        "Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",
    },
  },
  en: {
    no_entity: "No stop selected",
    no_data: "No departures",
    dir_h: "H",
    dir_r: "R",
    gleis: "PLATF.",
    version_update:
      "Retro card updated to v{v} — please reload",
    version_reload: "Reload",
    editor: {
      section_sensor: "Stop",
      section_direction: "Direction",
      sensor_hint: "Pick a single stop.",
      direction_hint:
        "Outbound or return — the retro display only shows one direction.",
      no_sensors:
        "No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",
    },
  },
};

// ------------------------------------------------------------------
// Config normalisation
// ------------------------------------------------------------------

function _normaliseConfig(config) {
  const out = { ...(config || {}) };
  if (typeof out.entity !== "string" || !out.entity.includes(".")) {
    delete out.entity;
  }
  if (out.direction !== "H" && out.direction !== "R") {
    out.direction = "H";
  }
  return out;
}

// ------------------------------------------------------------------
// LED-display styling
// ------------------------------------------------------------------

const LED_AMBER = "#FFC700";
const LED_GREEN = "#3DF500";
const LED_BG = "#000";
const LED_SUBSTRATE = "#2a1a4a";  // violet LED substrate (unlit cell colour)

// Number of character cells per row. 18 fits a line code + destination +
// countdown with a few empty cells in the middle for visual breathing room
// (matches the density of the reference photo).
const RETRO_CELLS_PER_ROW = 18;

const RETRO_STYLE = `
  :host, .retro {
    --led-amber: ${LED_AMBER};
    --led-green: ${LED_GREEN};
    --led-bg: ${LED_BG};
    --led-substrate: ${LED_SUBSTRATE};
  }
  .retro {
    display: flex;
    align-items: stretch;
    background: var(--led-bg);
    padding: 10px 12px;
    overflow: hidden;
    border-radius: var(--ha-card-border-radius, 12px);
    font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
    font-weight: 700;
    gap: 10px;
    min-height: 110px;
  }
  /* When platform == "2", the Gleis panel swaps to the left via order. */
  .retro--gleis-left .retro-gleis { order: -1; }

  /* ---- character-cell grid for the two departure rows ---- */
  .retro-rows {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }
  .retro-row {
    display: grid;
    grid-template-columns: repeat(${RETRO_CELLS_PER_ROW}, 1fr);
    gap: 2px;
  }
  .retro-cell {
    aspect-ratio: 0.6;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--led-substrate);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: transparent;
    font-size: calc(0.85 * 100% / ${RETRO_CELLS_PER_ROW} * 10);
    line-height: 1;
  }
  /* Slightly smaller container — scale char to roughly match cell height. */
  .retro-row {
    font-size: 1.05em;
  }
  .retro-cell--lit {
    color: var(--led-amber);
    text-shadow: 0 0 4px currentColor, 0 0 1px rgba(255, 255, 255, 0.4);
  }

  /* ---- green Gleis panel ---- */
  .retro-gleis {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    color: var(--led-green);
    text-shadow: 0 0 6px rgba(61, 245, 0, 0.7);
    background: var(--led-substrate);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    min-width: 58px;
  }
  .retro-gleis-label {
    font-size: 0.72em;
    letter-spacing: 2px;
    margin-bottom: 4px;
    opacity: 0.95;
  }
  .retro-gleis-number {
    font-size: 2.2em;
    line-height: 1;
  }

  /* ---- empty/fallback states ---- */
  .retro-empty {
    flex: 1;
    text-align: center;
    align-self: center;
    color: var(--led-amber);
    text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
    font-size: 1.2em;
    padding: 18px 0;
    letter-spacing: 2px;
  }

  /* ---- version-reload banner ---- */
  .retro-banner {
    background: #ffa000;
    color: #000;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-family: sans-serif;
    border-radius: 4px;
    font-size: 0.75em;
    font-weight: 500;
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
  .retro-banner-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 6px;
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
    const deps = (a.departures || [])
      .filter((d) => d && d.direction === dir)
      .slice(0, 2)
      .map(
        (d) =>
          `${d.line}|${d.towards}|${d.countdown}|${d.platform || ""}`,
      )
      .join(";");
    return `${this._versionMismatch || ""}||${eid}@${a.server_time || ""}|${dir}#${deps}`;
  }

  _render() {
    if (!this._hass) return;
    const eid = this._resolveEntity();
    const state = eid ? this._hass.states[eid] : null;
    const attrs = state?.attributes ?? {};
    const dir = this._config.direction;
    const matching = Array.isArray(attrs.departures)
      ? attrs.departures.filter((d) => d && d.direction === dir)
      : [];
    const rows = matching.slice(0, 2);
    const platform = rows.find((d) => d.platform)?.platform || null;

    // Gleis "2" sits on the left per the reference photo; "1" and all
    // other values default to the right.
    const gleisLeft = platform === "2";

    const banner = this._versionMismatch ? this._renderBanner() : "";

    let body;
    if (!eid) {
      body = `<div class="retro-empty">${_esc(this._t("no_entity"))}</div>`;
    } else if (rows.length === 0) {
      body = `<div class="retro-empty">${_esc(this._t("no_data"))}</div>`;
    } else {
      const rowsHtml = `
        <div class="retro-rows">
          ${rows.map((d) => this._renderRow(d)).join("")}
        </div>
      `;
      const gleisHtml = platform ? this._renderGleis(platform) : "";
      body = `${rowsHtml}${gleisHtml}`;
    }

    const innerClass = `retro${gleisLeft ? " retro--gleis-left" : ""}`;
    const wrapped = banner
      ? `<div class="retro-banner-wrap">${banner}<div class="${innerClass}">${body}</div></div>`
      : `<div class="${innerClass}">${body}</div>`;

    this.innerHTML = `
      <ha-card style="background:${LED_BG};padding:0;overflow:hidden;">
        <style>${RETRO_STYLE}</style>
        ${wrapped}
      </ha-card>
    `;

    const reloadBtn = this.querySelector(".retro-banner button");
    if (reloadBtn) reloadBtn.addEventListener("click", () => this._reload());
  }

  _renderRow(d) {
    const line = String(d.line || "?").toUpperCase();
    const towards = String(d.towards || "").toUpperCase();
    const cd = Number.isFinite(d.countdown) ? d.countdown : null;
    // Countdown takes the rightmost 1-3 cells. Empty / zero renders as
    // a single "0" (we already collapse the whole card to "no data"
    // when there are no departures at all).
    const cdStr = cd === null ? "" : String(Math.max(0, cd));

    // Left segment: "U4 HÜTTELDORF" style — line code, one space, then
    // as much destination as fits before the countdown.
    const reserved = cdStr.length; // right-reserved cells for countdown
    const leftBudget = RETRO_CELLS_PER_ROW - reserved;
    const prefix = `${line} ${towards}`.slice(0, leftBudget);

    // Build cell array: fill leftBudget with prefix chars + spaces, then
    // right-align the countdown in the remaining cells.
    const cells = new Array(RETRO_CELLS_PER_ROW).fill("");
    for (let i = 0; i < prefix.length; i++) cells[i] = prefix[i];
    for (let i = 0; i < cdStr.length; i++) {
      cells[RETRO_CELLS_PER_ROW - cdStr.length + i] = cdStr[i];
    }

    const cellsHtml = cells
      .map((ch) => {
        // Space between words isn't lit; empty cells either.
        const lit = ch && ch !== " ";
        const cls = lit ? "retro-cell retro-cell--lit" : "retro-cell";
        return `<span class="${cls}">${_esc(ch || "")}</span>`;
      })
      .join("");

    return `<div class="retro-row">${cellsHtml}</div>`;
  }

  _renderGleis(platform) {
    return `
      <div class="retro-gleis">
        <div class="retro-gleis-label">${_esc(this._t("gleis"))}</div>
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

  _render() {
    if (!this._hass) return;

    const available = _findWienerLinienEntities(this._hass);
    const selected = this._config.entity || "";
    const direction = this._config.direction || "H";

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
            <button type="button" data-dir="H" class="${direction === "H" ? "active" : ""}">${_esc(this._t("dir_h"))}</button>
            <button type="button" data-dir="R" class="${direction === "R" ? "active" : ""}">${_esc(this._t("dir_r"))}</button>
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
