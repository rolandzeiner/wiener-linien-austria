// Version banner for the portfolio's integration cards, revision 1.
//
// Canonical copy: ~/.claude/skills/ha-lovelace-card/assets/src/version-banner.ts.
// Every integration card repo carries it byte for byte as src/version-banner.ts,
// next to src/version-banner.test.ts, and Spanish Breakfast's
// version-banner-check.py compares both with the canonical pair. Never edit
// the copy in a repo. A change goes into the canonical copy with the next
// revision number in TAG: two bundles on one dashboard share whichever class
// defined the tag first, which is only safe while equal tags mean equal code.
//
// The banner asks the integration for its version (<domain>/card_version)
// and shows itself when that differs from the version this bundle was built
// as: the browser still runs the card from before an update. Reload wipes
// Cache Storage first, so a service worker can't serve the old bundle again.
// If the same mismatch is back after that reload, the banner says how to
// clear the cache by hand and offers Hide instead of a second Reload, so it
// can't loop. It asks again whenever the WebSocket reconnects, which is how
// an open tab learns about the HA restart that finished an update.
//
// Wiring, in each card:
//
//   import { versionBanner } from "./version-banner";
//
//   <ha-card>
//     ${versionBanner(this.hass, { domain: DOMAIN, version: CARD_VERSION, name: "Acme Energy", preview: this.preview })}
//
// First child of <ha-card>, in every branch of render() that draws one. That
// is all: the banner is its own element, so the card's shouldUpdate gate and
// stylesheet can't hold it back, and it brings its own English and German.

import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";

const TAG = "rz-version-banner-r1";

/** What the banner reads from hass. Loose, so every card's own
 *  HomeAssistant type fits without a cast. */
interface BannerHass {
  readonly callWS?: unknown;
  readonly connection?: unknown;
  readonly locale?: { readonly language?: string | undefined } | undefined;
  readonly language?: string | undefined;
}

interface BannerOptions {
  /** The integration's domain; the banner asks `<domain>/card_version`. */
  readonly domain: string;
  /** CARD_VERSION: the version this bundle was built as. */
  readonly version: string;
  /** The integration's name as users see it, e.g. "Tankstellen Austria". */
  readonly name: string;
  /** The card's `preview` property: no banner in the edit dialog. */
  readonly preview?: boolean | undefined;
}

type Lang = "en" | "de";
type Stage = "update" | "stuck";

const STRINGS: Record<
  Lang,
  {
    readonly update: (name: string, version: string) => string;
    readonly reload: string;
    readonly reloading: string;
    readonly stuck: string;
    readonly hide: string;
  }
> = {
  en: {
    update: (name, version) =>
      `${name} ${version} is installed. Reload the page to finish the update.`,
    reload: "Reload",
    reloading: "Reloading…",
    stuck:
      "The old card is still in the cache. Clear the site data for Home Assistant in your browser, or reset the frontend cache in the app settings.",
    hide: "Hide",
  },
  de: {
    update: (name, version) =>
      `${name} ${version} ist installiert. Lade die Seite neu, um das Update abzuschließen.`,
    reload: "Neu laden",
    reloading: "Wird neu geladen…",
    stuck:
      "Die alte Karte liegt noch im Cache. Lösche im Browser die Websitedaten für Home Assistant oder setze in den App-Einstellungen den Frontend-Cache zurück.",
    hide: "Ausblenden",
  },
};

// mdi:update and mdi:alert-circle-outline (@mdi/js 7.4.47). Inline, so the
// icon paints at once and needs no icon set loaded.
const ICON_UPDATE =
  "M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z";
const ICON_STUCK =
  "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z";

// ── Shared state ─────────────────────────────────────────────────────────
// One answer per connection and command, shared by every banner on the page:
// ten cards of one integration send one request, not ten. A reconnect clears
// the answers and bumps the generation, so a request still in flight from
// before it can't overwrite the fresh one.

type Signal =
  | { readonly kind: "answer"; readonly key: object; readonly type: string }
  | { readonly kind: "reconnect"; readonly key: object }
  | { readonly kind: "hide"; readonly type: string };

const listeners = new Set<(signal: Signal) => void>();
const answers = new WeakMap<object, Map<string, string | null>>();
const asking = new WeakMap<object, Map<string, number>>();
const generations = new WeakMap<object, number>();
const watched = new WeakSet<object>();
// Mismatches already announced to screen readers on this page: the first
// banner of each speaks, the copies in other cards stay quiet.
const announced = new Set<string>();
// Reloads started and banners hidden on this page. sessionStorage carries
// both across the reload; these keep this page right when it is unavailable.
const reloadedHere = new Set<string>();
const hiddenHere = new Set<string>();
const NO_CONNECTION = {};
const STORAGE_PREFIX = "rz-version-banner:";

function emit(signal: Signal): void {
  for (const listener of listeners) listener(signal);
}

function mapFor<V>(store: WeakMap<object, Map<string, V>>, key: object): Map<string, V> {
  let map = store.get(key);
  if (!map) {
    map = new Map();
    store.set(key, map);
  }
  return map;
}

async function ask(hass: BannerHass, type: string): Promise<string | null> {
  const callWS = hass.callWS;
  if (typeof callWS !== "function") return null;
  try {
    const reply: unknown = await (callWS as (msg: { type: string }) => Promise<unknown>).call(
      hass,
      { type },
    );
    const version = (reply as { version?: unknown } | null)?.version;
    return typeof version === "string" && version !== "" ? version : null;
  } catch {
    // An integration from before its card_version command, or a socket that
    // dropped mid-request. Nothing to show; the reconnect asks again.
    return null;
  }
}

function probe(hass: BannerHass, key: object, type: string): void {
  const inFlight = mapFor(asking, key);
  const generation = generations.get(key) ?? 0;
  if (inFlight.get(type) === generation) return;
  inFlight.set(type, generation);
  void ask(hass, type).then((version) => {
    if ((generations.get(key) ?? 0) !== generation) return;
    inFlight.delete(type);
    mapFor(answers, key).set(type, version);
    emit({ kind: "answer", key, type });
  });
}

function watch(key: object): void {
  if (watched.has(key)) return;
  watched.add(key);
  const addEventListener = (key as { addEventListener?: unknown }).addEventListener;
  if (typeof addEventListener !== "function") return;
  // "ready" fires each time the socket comes back, e.g. after the HA restart
  // that finished an update. One listener per connection, kept for the life
  // of the page (which the connection shares), not one per card.
  (addEventListener as (event: string, listener: () => void) => void).call(key, "ready", () => {
    generations.set(key, (generations.get(key) ?? 0) + 1);
    answers.get(key)?.clear();
    emit({ kind: "reconnect", key });
  });
}

function readFlag(name: "reload" | "hide", id: string): boolean {
  try {
    return window.sessionStorage.getItem(`${STORAGE_PREFIX}${name}:${id}`) === "1";
  } catch {
    return false;
  }
}

function writeFlag(name: "reload" | "hide", id: string): void {
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${name}:${id}`, "1");
  } catch {
    // Storage blocked (private mode): reloadedHere / hiddenHere cover this
    // page, and after a reload the plain banner shows once more.
  }
}

function clearFlags(type: string): void {
  try {
    const storage = window.sessionStorage;
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && key.includes(`:${type}@`)) storage.removeItem(key);
    }
  } catch {
    // Nothing stored, nothing to clear.
  }
}

async function wipeCachesAndReload(): Promise<void> {
  const wipe = (async (): Promise<void> => {
    // Cache Storage exists only in secure contexts: HA over plain http has none.
    const storage = (globalThis as { caches?: CacheStorage }).caches;
    if (!storage) return;
    const names = await storage.keys();
    await Promise.all(names.map((name) => storage.delete(name)));
  })().catch(() => undefined);
  // A wipe that hangs must not hold the reload back.
  await Promise.race([wipe, new Promise((resolve) => setTimeout(resolve, 2000))]);
  window.location.reload();
}

function languageOf(hass: BannerHass | undefined): Lang {
  const tag = hass?.locale?.language ?? hass?.language ?? "";
  return tag.toLowerCase().startsWith("de") ? "de" : "en";
}

// ── The element ──────────────────────────────────────────────────────────

class RzVersionBanner extends LitElement {
  static override properties = {
    domain: { attribute: false },
    version: { attribute: false },
    name: { attribute: false },
    _answer: { state: true },
    _busy: { state: true },
    _lang: { state: true },
  };

  // Declared, not initialised: a class field would shadow Lit's accessors
  // under useDefineForClassFields, and this file must work under either.
  declare domain: string;
  declare version: string;
  declare name: string;
  declare private _answer: string | null;
  declare private _busy: boolean;
  declare private _lang: Lang;

  private _hass: BannerHass | undefined;
  private _key: object | undefined;
  private _type = "";
  private _stage: Stage | null = null;
  private _id = "";
  private _speaks = "";

  constructor() {
    super();
    this.domain = "";
    this.version = "";
    this.name = "";
    this._answer = null;
    this._busy = false;
    this._lang = "en";
  }

  // Plain accessor, not a reactive property: hass changes on every state
  // change in HA, and the banner only cares about its connection and the
  // language. A language switch re-renders through _lang.
  get hass(): BannerHass | undefined {
    return this._hass;
  }

  set hass(value: BannerHass | undefined) {
    this._hass = value;
    const lang = languageOf(value);
    if (lang !== this._lang) this._lang = lang;
    this._sync();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    listeners.add(this._onSignal);
    this._sync();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    listeners.delete(this._onSignal);
    this._key = undefined;
  }

  private _sync(): void {
    const hass = this._hass;
    if (!hass || !this.domain || !this.isConnected) return;
    const connection = hass.connection;
    const key = typeof connection === "object" && connection !== null ? connection : NO_CONNECTION;
    const type = `${this.domain}/card_version`;
    if (key === this._key && type === this._type) return;
    this._key = key;
    this._type = type;
    watch(key);
    const known = answers.get(key)?.get(type);
    if (known === undefined) probe(hass, key, type);
    else this._answer = known;
  }

  private readonly _onSignal = (signal: Signal): void => {
    if (signal.kind === "hide") {
      if (signal.type === this._type) this.requestUpdate();
      return;
    }
    if (signal.key !== this._key) return;
    if (signal.kind === "reconnect") {
      if (this._hass) probe(this._hass, signal.key, this._type);
      return;
    }
    if (signal.type === this._type)
      this._answer = answers.get(signal.key)?.get(signal.type) ?? null;
  };

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("domain")) this._sync();
    const answer = this._answer;
    if (changed.has("_answer") && answer === this.version) clearFlags(this._type);
    this._stage = this._computeStage();
    this._id = this._stage && answer ? `${this._type}@${answer}` : "";
    const spoken = `${this._id}:${this._stage ?? ""}`;
    if (this._id && this._speaks !== spoken && !announced.has(spoken)) {
      announced.add(spoken);
      this._speaks = spoken;
    }
    // Out of the layout while there is nothing to say, so the empty element
    // adds no gap in a flex or grid card.
    this.hidden = this._stage === null;
  }

  private _computeStage(): Stage | null {
    const answer = this._answer;
    if (!answer || !this._type || answer === this.version) return null;
    const id = `${this._type}@${answer}`;
    if (hiddenHere.has(id) || readFlag("hide", id)) return null;
    // A reload flag from an earlier page means that reload didn't help.
    if (!reloadedHere.has(id) && readFlag("reload", id)) return "stuck";
    return "update";
  }

  private readonly _onReload = (): void => {
    if (this._busy || !this._id) return;
    this._busy = true;
    reloadedHere.add(this._id);
    writeFlag("reload", this._id);
    void wipeCachesAndReload();
  };

  private readonly _onHide = (): void => {
    if (!this._id) return;
    hiddenHere.add(this._id);
    writeFlag("hide", this._id);
    emit({ kind: "hide", type: this._type });
  };

  protected override render(): TemplateResult | typeof nothing {
    const answer = this._answer;
    if (!this._stage || !answer) return nothing;
    const strings = STRINGS[this._lang];
    const stuck = this._stage === "stuck";
    let label = strings.reload;
    if (stuck) label = strings.hide;
    else if (this._busy) label = strings.reloading;
    // role="alert" on the first banner per mismatch only: a dashboard with
    // five cards of one integration says it once, not five times.
    const role = this._speaks === `${this._id}:${this._stage}` ? "alert" : nothing;
    return html`<div class=${stuck ? "banner stuck" : "banner"} lang=${this._lang}>
      <div class="body">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d=${stuck ? ICON_STUCK : ICON_UPDATE}></path>
        </svg>
        <p class="message" role=${role}>${stuck ? strings.stuck : strings.update(this.name, answer)}</p>
      </div>
      <button
        class="action"
        type="button"
        aria-disabled=${this._busy ? "true" : nothing}
        @click=${stuck ? this._onHide : this._onReload}
      >${label}</button>
    </div>`;
  }

  // Every colour comes from the theme, mixed so it holds in light and dark:
  // the words and the button stay in --primary-text-color (9.6:1 or better on
  // the tint in every theme measured, HA's own at 14.6 light and 9.9 dark),
  // the icon is half warning, half text colour (3.8:1 or better). White on
  // --warning-color, the look this replaces, measured 2.0:1.
  //
  // - The tint sits over the theme's card colour, not over whatever the card
  //   paints, so a card with its own dark skin keeps a readable banner.
  // - The button is outlined, not filled: a fill would need the card colour
  //   as its text colour, which glass and gradient themes make translucent or
  //   invalid.
  // - The transparent border is the banner's edge in forced colours.
  // - The corner radius is concentric with the card corner the banner sits in.
  // - Lines break at real hyphens only. Automatic hyphenation also split words
  //   with room to spare ("in-stalled"), so only the narrowest card uses it.
  // - The layout switches through custom properties on .banner, so the three
  //   container widths override each other by order alone, never by
  //   specificity. Below 340px the button moves under the text (below 400px
  //   for the longer cache message); below 180px the icon goes and the button
  //   takes the full width.
  //
  // No comments inside the css template: Lit ships them in the bundle.
  static override styles = css`
    :host {
      display: block;
      container: rz-version-banner / inline-size;
    }
    :host([hidden]) {
      display: none;
    }
    .banner {
      --rz-vb-tint: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent);
      --rz-vb-mark: color-mix(
        in srgb,
        var(--warning-color, #ffa600) 50%,
        var(--primary-text-color, #212121)
      );
      display: grid;
      grid-template-columns: var(--rz-vb-columns, minmax(0, 1fr) auto);
      align-items: center;
      gap: var(--ha-space-2, 8px) var(--ha-space-3, 12px);
      margin: var(--rz-vb-margin, var(--ha-space-2, 8px));
      padding: var(--rz-vb-padding, var(--ha-space-2, 8px) var(--ha-space-2, 8px) var(--ha-space-2, 8px) var(--ha-space-3, 12px));
      border: 1px solid transparent;
      border-radius: max(4px, calc(var(--ha-card-border-radius, 12px) - var(--ha-space-2, 8px)));
      background-color: var(--card-background-color, #fff);
      background-image: linear-gradient(var(--rz-vb-tint), var(--rz-vb-tint));
      color: var(--primary-text-color, #212121);
      font-size: var(--ha-font-size-m, 14px);
      line-height: 1.43;
    }
    .body {
      display: flex;
      align-items: flex-start;
      gap: var(--ha-space-3, 12px);
      min-inline-size: 0;
    }
    .icon {
      flex: none;
      inline-size: 24px;
      block-size: 24px;
      margin-block: -2px;
      display: var(--rz-vb-icon, block);
      color: var(--rz-vb-mark);
      fill: currentColor;
    }
    .message {
      margin: 0;
      min-inline-size: 0;
      overflow-wrap: break-word;
      hyphens: var(--rz-vb-hyphens, manual);
      text-wrap: pretty;
    }
    .action {
      justify-self: var(--rz-vb-action-align, end);
      min-block-size: 40px;
      margin-inline-start: var(--rz-vb-action-indent, 0);
      padding: var(--rz-vb-action-padding, 0 var(--ha-space-4, 16px));
      border: 1px solid currentColor;
      border-radius: var(--ha-border-radius-pill, 9999px);
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: var(--ha-font-weight-medium, 500);
      white-space: var(--rz-vb-action-wrap, nowrap);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .action:hover {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
    .action:active {
      background: color-mix(in srgb, currentColor 16%, transparent);
    }
    .action[aria-disabled="true"] {
      cursor: progress;
    }
    .action:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    @container rz-version-banner (inline-size < 400px) {
      .stuck {
        --rz-vb-columns: minmax(0, 1fr);
        --rz-vb-action-align: start;
        --rz-vb-action-indent: calc(24px + var(--ha-space-3, 12px));
      }
    }
    @container rz-version-banner (inline-size < 340px) {
      .banner {
        --rz-vb-columns: minmax(0, 1fr);
        --rz-vb-action-align: start;
        --rz-vb-action-indent: calc(24px + var(--ha-space-3, 12px));
      }
    }
    @container rz-version-banner (inline-size < 180px) {
      .banner {
        --rz-vb-margin: var(--ha-space-1, 4px);
        --rz-vb-padding: var(--ha-space-2, 8px);
        --rz-vb-icon: none;
        --rz-vb-hyphens: auto;
        --rz-vb-action-align: stretch;
        --rz-vb-action-indent: 0px;
        --rz-vb-action-padding: 0 var(--ha-space-2, 8px);
        --rz-vb-action-wrap: normal;
      }
    }
    @media (forced-colors: active) {
      .icon {
        color: CanvasText;
      }
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, RzVersionBanner);

declare global {
  interface HTMLElementTagNameMap {
    "rz-version-banner-r1": RzVersionBanner;
  }
}

/**
 * The banner for one card, or `nothing` in the edit dialog and before hass
 * arrives. See the header of this file for where it goes.
 */
export function versionBanner(
  hass: BannerHass | undefined,
  options: BannerOptions,
): TemplateResult | typeof nothing {
  if (options.preview || !hass) return nothing;
  return html`<rz-version-banner-r1
    .hass=${hass}
    .domain=${options.domain}
    .version=${options.version}
    .name=${options.name}
  ></rz-version-banner-r1>`;
}
