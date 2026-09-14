// Lovelace editor for the route card. Everything it configures fits ha-form,
// so unlike the three departure-board editors there is no bespoke residue —
// one schema, no tabs.
//
// `_commit` assigns `this._config` BEFORE firing `config-changed` — see
// editor/editor-common.ts for why that ordering is load-bearing.

import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { editorHelper, editorLabel } from "./editor/editor-common.js";
import { editorTranslators, type EditorTranslators } from "./editor/editor-i18n.js";
import type {
  HaFormSchema,
  HomeAssistant,
  LovelaceCardEditor,
  WienerLinienRouteCardConfig,
} from "./types.js";
import { fireEvent } from "./utils.js";
import {
  findRouteEntities,
  MAX_ALTERNATIVES,
  normaliseRouteConfig,
  ROUTE_CARD_TYPE,
  type NormalisedRouteConfig,
} from "./utils/route.js";

/** Route setup lives in the integration, not the card: a route is polled
 *  once by the backend and shared by every dashboard showing it. This is the
 *  My-link that opens that flow from inside Home Assistant. */
const ADD_ROUTE_HREF = "/_my_redirect/config_flow_start?domain=wiener_linien_austria";

/** `include_entities` rather than an integration filter: the integration
 *  filter also matches every departure-board sensor, and picking one of those
 *  gives a card with nothing to show. */
function schema(routes: string[]): ReadonlyArray<HaFormSchema> {
  return [
    {
      name: "entity",
      required: true,
      selector: { entity: { include_entities: routes } },
    },
    { name: "title", selector: { text: {} } },
    {
      name: "alternatives",
      selector: {
        number: { min: 0, max: MAX_ALTERNATIVES, step: 1, mode: "slider" },
      },
    },
    { name: "hide_attribution", selector: { boolean: {} } },
  ] as unknown as ReadonlyArray<HaFormSchema>;
}

@customElement(`${ROUTE_CARD_TYPE}-editor`)
export class WienerLinienAustriaRouteCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: NormalisedRouteConfig;

  public setConfig(config: WienerLinienRouteCardConfig): void {
    this._config = normaliseRouteConfig(config);
  }

  private get _i18n(): EditorTranslators {
    return editorTranslators("route", this.hass?.language);
  }

  private _computeLabel = (field: { name: string }): string =>
    editorLabel(this.hass, this._i18n, field.name);

  private _computeHelper = (field: { name: string }): string | undefined =>
    editorHelper(this._i18n, field.name);

  private _onValueChanged(ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    if (!this._config) return;
    const value = ev.detail.value;
    const next: Record<string, unknown> = { ...this._config, ...value };
    // Keep YAML tidy: drop fields that only restate a default.
    if (!next.title) delete next.title;
    if (next.hide_attribution !== true) delete next.hide_attribution;
    this._config = normaliseRouteConfig(next as WienerLinienRouteCardConfig);
    fireEvent(this, "config-changed", { config: next });
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const routes = findRouteEntities(this.hass);
    const { et } = this._i18n;
    return html`
      ${routes.length === 0
        ? html`<ha-alert alert-type="info">
            ${et("no_routes")}
            <a slot="action" href=${ADD_ROUTE_HREF}>${et("add_route")}</a>
          </ha-alert>`
        : nothing}
      <ha-form
        .hass=${this.hass}
        .data=${this._config as unknown as Record<string, unknown>}
        .schema=${schema(routes)}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onValueChanged}
      ></ha-form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "wiener-linien-austria-route-card-editor": WienerLinienAustriaRouteCardEditor;
  }
}
