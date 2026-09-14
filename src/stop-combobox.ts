// Stop picker for the route card's ad-hoc mode: type to narrow the list, or
// open it and pick. Follows the WAI-ARIA APG "combobox with list autocomplete"
// pattern — the input keeps focus throughout, and the highlighted option is
// conveyed with aria-activedescendant.
//
// Why not HA's own picker: `ha-selector` with a select selector renders
// `ha-combo-box` on HA 2025.6 but `ha-generic-picker` (a button opening a
// popover) on current HA, so the same card would type inline on one version
// and not the other. This element behaves the same everywhere.
//
// It renders into the light DOM, i.e. into the route card's shadow root: the
// card's styles apply, and the IDREFs (aria-controls, aria-activedescendant,
// aria-describedby) resolve in the same tree as the ids they point at.
//
// The list renders in flow rather than as an overlay. `ha-card` clips its
// content, so an absolutely positioned popup would be cut off at the card edge.

import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { AdhocStopOption } from "./types.js";
import { filterStops, foldStopLabels, foldStopText } from "./utils/route.js";

export const STOP_COMBOBOX_TAG = "wiener-linien-austria-stop-combobox";

/** How long typing has to pause before the match count is announced, so a
 *  screen reader doesn't read out a count for every keystroke. */
export const STOP_STATUS_DELAY_MS = 500;

export interface StopPickedDetail {
  value: string;
}

export interface StopComboboxStrings {
  label: string;
  toggle: string;
  noMatch: string;
  noResults: string;
  count: (shown: number, total: number) => string;
}

@customElement(STOP_COMBOBOX_TAG)
export class WienerLinienStopCombobox extends LitElement {
  @property({ attribute: false }) public stops: AdhocStopOption[] = [];
  /** The committed stop (DIVA as a string), "" for none. */
  @property({ attribute: false }) public value = "";
  /** Prefix for the ids this instance renders; unique within the card. */
  @property({ attribute: false }) public idBase = "stop";
  @property({ attribute: false }) public strings: StopComboboxStrings = {
    label: "",
    toggle: "",
    noMatch: "",
    noResults: "",
    count: () => "",
  };

  @state() private _text = "";
  @state() private _open = false;
  @state() private _active = -1;
  @state() private _invalid = false;
  /** True once the user has typed since the last pick. An opened list that
   *  still shows the committed label lists every stop, not just that one. */
  @state() private _filtering = false;
  /** The match count as announced, trailing the typing by
   *  `STOP_STATUS_DELAY_MS`. */
  @state() private _status = "";

  private _labelByValue = new Map<string, string>();
  private _folded: string[] = [];
  private _statusTimer: ReturnType<typeof setTimeout> | null = null;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearStatus();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("stops")) {
      this._labelByValue = new Map(this.stops.map((stop) => [stop.value, stop.label]));
      this._folded = foldStopLabels(this.stops);
    }
    // Follow outside changes (swap, restored pick) unless the user is typing
    // in this very field right now.
    if ((changed.has("value") || changed.has("stops")) && !this._hasFocus()) {
      this._revert();
    }
  }

  protected override updated(): void {
    if (this._open && this._active >= 0) {
      this.querySelector(`#${this.idBase}-option-${this._active}`)?.scrollIntoView?.({
        block: "nearest",
      });
    }
  }

  private get _results(): { matches: AdhocStopOption[]; total: number } {
    return filterStops(this.stops, this._filtering ? this._text : "", undefined, this._folded);
  }

  private _hasFocus(): boolean {
    const input = this._input;
    const root = this.getRootNode() as Document | ShadowRoot;
    return !!input && root.activeElement === input;
  }

  private get _input(): HTMLInputElement | null {
    return this.querySelector("input");
  }

  private _pick(stop: AdhocStopOption | null): void {
    const value = stop?.value ?? "";
    this._text = stop?.label ?? "";
    this._filtering = false;
    this._invalid = false;
    this._open = false;
    this._active = -1;
    this._clearStatus();
    if (value !== this.value) {
      this.dispatchEvent(
        new CustomEvent<StopPickedDetail>("stop-picked", { detail: { value } }),
      );
    }
  }

  private _onInput(ev: Event): void {
    this._text = (ev.target as HTMLInputElement).value;
    this._filtering = true;
    this._invalid = false;
    this._open = true;
    this._active = -1;
    this._scheduleStatus();
  }

  private _scheduleStatus(): void {
    if (this._statusTimer !== null) clearTimeout(this._statusTimer);
    this._statusTimer = setTimeout(() => {
      this._statusTimer = null;
      if (!this._open || !this._filtering) return;
      const { matches, total } = this._results;
      this._status = this.strings.count(matches.length, total);
    }, STOP_STATUS_DELAY_MS);
  }

  private _clearStatus(): void {
    if (this._statusTimer !== null) clearTimeout(this._statusTimer);
    this._statusTimer = null;
    this._status = "";
  }

  private _onKeyDown(ev: KeyboardEvent): void {
    const { matches } = this._results;
    switch (ev.key) {
      case "ArrowDown":
        ev.preventDefault();
        if (!this._open) {
          this._open = true;
          if (!ev.altKey) this._active = matches.length ? 0 : -1;
          return;
        }
        this._active = Math.min(this._active + 1, matches.length - 1);
        return;
      case "ArrowUp":
        ev.preventDefault();
        if (!this._open) {
          this._open = true;
          this._active = matches.length - 1;
          return;
        }
        // With nothing listed there is no option to point at.
        this._active = matches.length ? Math.max(this._active - 1, 0) : -1;
        return;
      case "Enter": {
        if (!this._open) return;
        ev.preventDefault();
        // Enter with nothing highlighted takes the best match, so typing
        // "stephan" + Enter is enough.
        const choice = matches[this._active >= 0 ? this._active : 0];
        if (choice) this._pick(choice);
        return;
      }
      case "Escape":
        if (this._open) {
          ev.preventDefault();
          this._open = false;
          this._active = -1;
          this._clearStatus();
        } else if (this._filtering || this._invalid) {
          ev.preventDefault();
          this._revert();
        }
        return;
      default:
        return;
    }
  }

  /** Leaving the field commits an exact match, clears on empty text, and
   *  otherwise keeps the text but flags it, instead of silently guessing. */
  private _onBlur(): void {
    this._open = false;
    this._active = -1;
    this._clearStatus();
    if (!this._filtering) return;
    const text = foldStopText(this._text.trim());
    if (!text) {
      this._pick(null);
      return;
    }
    const exact = this.stops[this._folded.indexOf(text)];
    if (exact) {
      this._pick(exact);
      return;
    }
    this._invalid = true;
  }

  private _revert(): void {
    this._text = this._labelByValue.get(this.value) ?? "";
    this._filtering = false;
    this._invalid = false;
  }

  private _toggle(): void {
    this._open = !this._open;
    this._active = -1;
    this._clearStatus();
    if (this._open) this._filtering = false;
    this._input?.focus();
  }

  protected override render(): TemplateResult {
    const id = this.idBase;
    const { matches, total } = this._results;
    const listId = `${id}-list`;
    const activeId = this._open && this._active >= 0 ? `${id}-option-${this._active}` : "";
    const describedBy = this._invalid ? `${id}-error` : nothing;
    // Enter with nothing highlighted takes the best match; mark it, so what
    // Enter will pick is visible before it happens.
    const enterTarget = this._filtering && this._active < 0 ? 0 : -1;
    return html`
      <label class="combo-label" for=${`${id}-input`}>${this.strings.label}</label>
      <div class="combo-field" ?data-open=${this._open}>
        <input
          id=${`${id}-input`}
          type="text"
          role="combobox"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-autocomplete="list"
          aria-expanded=${this._open ? "true" : "false"}
          aria-controls=${listId}
          aria-activedescendant=${activeId || nothing}
          aria-invalid=${this._invalid ? "true" : "false"}
          aria-describedby=${describedBy}
          .value=${this._text}
          @input=${this._onInput}
          @keydown=${this._onKeyDown}
          @blur=${this._onBlur}
          @focus=${(ev: FocusEvent) => (ev.target as HTMLInputElement).select()}
        />
        <button
          type="button"
          class="combo-toggle"
          tabindex="-1"
          aria-label=${this.strings.toggle}
          aria-controls=${listId}
          aria-expanded=${this._open ? "true" : "false"}
          @pointerdown=${(ev: Event) => ev.preventDefault()}
          @click=${this._toggle}
        >
          <ha-icon
            icon=${this._open ? "mdi:chevron-up" : "mdi:chevron-down"}
            aria-hidden="true"
          ></ha-icon>
        </button>
      </div>
      <ul
        class="combo-list"
        id=${listId}
        role="listbox"
        aria-label=${this.strings.label}
        ?hidden=${!this._open}
      >
        ${this._open
          ? matches.map(
              (stop, index) => html`<li
                id=${`${id}-option-${index}`}
                role="option"
                class="combo-option"
                aria-selected=${index === this._active ? "true" : "false"}
                ?data-current=${stop.value === this.value}
                ?data-enter=${index === enterTarget}
                @pointerdown=${(ev: Event) => ev.preventDefault()}
                @click=${() => this._pick(stop)}
              >
                ${stop.label}
              </li>`,
            )
          : nothing}
      </ul>
      ${this._open && total === 0
        ? html`<p class="combo-note">${this.strings.noResults}</p>`
        : nothing}
      ${this._open && total > matches.length
        ? html`<p class="combo-note" aria-hidden="true">${this.strings.count(matches.length, total)}</p>`
        : nothing}
      <span class="sr-only" role="status">${this._open ? this._status : ""}</span>
      ${this._invalid
        ? html`<p class="field-error" id=${`${id}-error`}>${this.strings.noMatch}</p>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "wiener-linien-austria-stop-combobox": WienerLinienStopCombobox;
  }
  interface HTMLElementEventMap {
    "stop-picked": CustomEvent<StopPickedDetail>;
  }
}
