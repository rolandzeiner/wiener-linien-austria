// Lovelace editor for the route card. Everything it configures fits ha-form,
// so unlike the three departure-board editors there is no bespoke residue —
// one schema, no tabs. Leaving the route empty switches the card to ad-hoc
// mode, and the schema then offers default From / To stops instead.
//
// `_commit` assigns `this._config` BEFORE firing `config-changed` — see
// editor/editor-common.ts for why that ordering is load-bearing.

import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { editorHelper, editorLabel } from "./editor/editor-common.js";
import { editorTranslators, type EditorTranslators } from "./editor/editor-i18n.js";
import type {
  AdhocStopOption,
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
function schema(
  routes: string[],
  adhoc: boolean,
  stopSelector: Record<string, unknown> | null,
): ReadonlyArray<HaFormSchema> {
  return [
    {
      name: "entity",
      selector: { entity: { include_entities: routes } },
    },
    // Second, like the siblings' editors: what the card is, then what it's called.
    { name: "title", selector: { text: {} } },
    ...(adhoc && stopSelector
      ? [
          { name: "from", selector: stopSelector },
          { name: "to", selector: stopSelector },
        ]
      : []),
    {
      name: "alternatives",
      selector: {
        number: { min: 0, max: MAX_ALTERNATIVES, step: 1, mode: "slider" },
      },
    },
    // Toggles last, in one run.
    ...(adhoc && stopSelector ? [{ name: "step_free", selector: { boolean: {} } }] : []),
    { name: "show_map_pins", selector: { boolean: {} } },
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
  /** The same stop list the card shows, so a default can't name a stop the
   *  card would reject. Built once: a fresh selector object per render would
   *  make ha-form re-process all ~1,800 options on every keystroke. */
  @state() private _stopSelector: Record<string, unknown> | null = null;

  private _stopsRequested = false;

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
    if (!next.entity) delete next.entity;
    // A route brings its own ends; stale ad-hoc defaults would only confuse.
    if (next.entity || !next.from) delete next.from;
    if (next.entity || !next.to) delete next.to;
    if (!next.title) delete next.title;
    if (next.entity || next.step_free !== true) delete next.step_free;
    if (next.show_map_pins !== false) delete next.show_map_pins;
    if (next.hide_attribution !== true) delete next.hide_attribution;
    this._config = normaliseRouteConfig(next as WienerLinienRouteCardConfig);
    fireEvent(this, "config-changed", { config: next });
  }

  protected override updated(): void {
    if (this._stopsRequested || !this._config || this._config.entity || !this.hass?.callWS) {
      return;
    }
    this._stopsRequested = true;
    this.hass
      .callWS<{ stops: AdhocStopOption[] }>({ type: "wiener_linien_austria/stops" })
      .then((result) => {
        const stops = Array.isArray(result?.stops) ? result.stops : [];
        this._stopSelector = { select: { mode: "dropdown", sort: false, options: stops } };
      })
      .catch((err: unknown) => {
        // The defaults are optional; the card explains a missing stop list.
        console.warn(`[${ROUTE_CARD_TYPE}-editor] stop list unavailable`, err);
      });
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
        .schema=${schema(routes, !this._config.entity, this._stopSelector)}
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
