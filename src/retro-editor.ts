// Retro card editor — placeholder. Real editor lands in the next commit.
// Registered here so the main retro card's eager `import "./retro-editor.js"`
// resolves and customElements.define runs before any visual-editor flow
// calls document.createElement("wiener-linien-austria-retro-card-editor").
import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import type { WienerLinienRetroCardConfig } from "./types.js";

@customElement("wiener-linien-austria-retro-card-editor")
export class WienerLinienAustriaRetroCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: WienerLinienRetroCardConfig;

  public setConfig(config: WienerLinienRetroCardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    return html`
      <div class="wl-retro-editor-placeholder">
        <p>Editor lands in the next commit. Use the YAML editor for now.</p>
      </div>
    `;
  }
}
