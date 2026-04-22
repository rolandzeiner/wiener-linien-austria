// Stub entrypoint — replaced with the real Lit port in a follow-up commit.
// Exists now so `npm run build` produces a valid bundle and CI's
// validate-card job has something to node-c against.
import { LitElement, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { RETRO_CARD_VERSION } from "./const.js";

console.info(
  `%c WIENER-LINIEN-AUSTRIA-RETRO-CARD %c ${RETRO_CARD_VERSION} `,
  "color: white; background: #1a1a1a; font-weight: 700;",
  "color: #1a1a1a; background: #E3000F; font-weight: 700;",
);

@customElement("wiener-linien-austria-retro-card")
export class WienerLinienAustriaRetroCard extends LitElement {
  render(): TemplateResult {
    return html`<ha-card>Wiener Linien Austria Retro ${RETRO_CARD_VERSION}</ha-card>`;
  }
}
