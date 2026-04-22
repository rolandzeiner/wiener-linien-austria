// Modern card editor — minimal placeholder. Replaced with the real picker
// UI in the next commit. Kept as a valid LitElement so the main card's
// eager `import "./editor.js"` resolves and customElements.define runs.
import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import type { WienerLinienCardConfig } from "./types.js";

@customElement("wiener-linien-austria-card-editor")
export class WienerLinienAustriaCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: WienerLinienCardConfig;

  public setConfig(config: WienerLinienCardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    return html`
      <div class="wl-editor-placeholder">
        <p>Editor lands in the next commit. Use the YAML editor for now.</p>
      </div>
    `;
  }
}
