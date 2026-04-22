// Stub entrypoint — replaced with the real Lit port in a follow-up commit.
// Exists now so `npm run build` produces a valid bundle and CI's
// validate-card job has something to node-c against.
import { LitElement, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { CARD_VERSION } from "./const.js";

console.info(
  `%c WIENER-LINIEN-AUSTRIA-CARD %c ${CARD_VERSION} `,
  "color: white; background: #E3000F; font-weight: 700;",
  "color: #E3000F; background: white; font-weight: 700;",
);

@customElement("wiener-linien-austria-card")
export class WienerLinienAustriaCard extends LitElement {
  render(): TemplateResult {
    return html`<ha-card>Wiener Linien Austria ${CARD_VERSION}</ha-card>`;
  }
}
