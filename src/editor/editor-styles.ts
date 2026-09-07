// Shared style layer for the v2 editor system.
//
// One visual grammar for all three card editors. v1 had two competing ones
// inside the modern editor alone (14px semibold sentence-case block headers
// directly above 11px uppercase letter-spaced section headers); the spec
// collapses everything to four type steps and no uppercase micro-headers.
// The only uppercase text in the editor is the tab bar.
//
// Font family is deliberately never declared — every rule sets size / weight /
// line-height only, so text inherits whatever family the HA dialog is using.
// Hardcoding "Roboto" would fight themes that ship their own face.

import { css } from "lit";

export const editorStyles = css`
  :host {
    display: block;
  }

  /* Shell: tab bar + scrolling column */

  .wl-editor {
    display: flex;
    flex-direction: column;
  }

  /* Sticky so the tabs stay reachable while a long Anzeige tab scrolls.
     z-index beats ha-form's own focused-field elevation. */
  .wl-tabs {
    display: flex;
    gap: 2px;
    padding: 0 8px;
    background: var(--card-background-color);
    border-bottom: 1px solid var(--divider-color);
    position: sticky;
    top: 0;
    z-index: 3;
  }

  .wl-tab {
    flex: 1;
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 12px 14px 0;
    font-size: 0.78125rem;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  .wl-tab[aria-selected="true"] {
    color: var(--primary-color);
  }

  /* The underline is a child element rather than a border-bottom so it can
     bleed past the button's horizontal padding to the full tab width. */
  .wl-tab-underline {
    display: block;
    height: 2px;
    margin: 7px -14px -1px;
    border-radius: 2px 2px 0 0;
    background: transparent;
  }

  .wl-tab[aria-selected="true"] .wl-tab-underline {
    background: var(--primary-color);
  }

  .wl-tab:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  .wl-panel {
    padding: 14px 16px 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .wl-panel--stops {
    gap: 14px;
  }

  /* Section */

  .wl-section {
    border: 1px solid var(--divider-color);
    border-radius: 10px;
    background: var(--card-background-color);
    overflow: hidden;
  }

  .wl-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--secondary-background-color);
    border-bottom: 1px solid var(--divider-color);
  }

  .wl-section-title {
    flex: 1;
    min-width: 0;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.35;
    color: var(--primary-text-color);
    overflow-wrap: anywhere;
  }

  .wl-section-hint {
    font-size: 0.71875rem;
    font-weight: 400;
    line-height: 1.35;
    color: var(--secondary-text-color);
    text-align: right;
  }

  .wl-section-body {
    padding: 6px 12px 12px;
    display: flex;
    flex-direction: column;
  }

  /* ha-form sets its own vertical rhythm between fields; the section already
     supplies the outer padding, so strip the top gap it would add. */
  .wl-section-body ha-form {
    display: block;
  }

  /* Bespoke rows (chips / direction / walk time / colour) */

  .wl-group {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .wl-group-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .wl-label {
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.4;
    color: var(--secondary-text-color);
  }

  .wl-label--grow {
    flex: 1;
    min-width: 0;
  }

  .wl-note {
    font-size: 0.71875rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--secondary-text-color);
  }

  .wl-divide {
    padding-top: 12px;
    border-top: 1px solid var(--divider-color);
  }

  /* Line chip — 34px tall for density, 44px hit area for WCAG 2.2 (2.5.8).
     The ::before overlay is what buys both; do not replace it with padding. */

  .wl-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  /* Three tokens, mirroring the cards' --wl-accent / --wl-accent-text split:
     --wl-chip-color is the line's FILL, --wl-chip-text is that same colour
     lightness-clamped for use as TEXT, and --wl-chip-ink is what gets written
     on top of the fill. The GTFS palette is a set of background colours;
     several are illegible painted as text (bus navy #0A295D is 1.21:1 on a
     dark card), which is why the outlined chip must never use the fill for
     its label. See utils/color.ts and lineChipColors(). */
  .wl-chip {
    --wl-chip-color: var(--primary-color);
    /* Hueless but legible default — the same policy the card applies when the
       theme polarity is unknown. Never fall back to the fill here. */
    --wl-chip-text: var(--primary-text-color);
    --wl-chip-ink: #fff;
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    height: 34px;
    padding: 0 10px;
    border-radius: 5px;
    border: 2px solid var(--wl-chip-text);
    background: transparent;
    color: var(--wl-chip-text);
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    forced-color-adjust: none;
  }

  .wl-chip::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -5px;
    bottom: -5px;
  }

  .wl-chip[aria-pressed="true"] {
    background: var(--wl-chip-color);
    /* Filled: the paired foreground the palette publishes for this line. */
    border-color: var(--wl-chip-color);
    color: var(--wl-chip-ink);
  }

  .wl-chip:hover {
    background: color-mix(in srgb, var(--wl-chip-color) 16%, transparent);
  }

  .wl-chip[aria-pressed="true"]:hover {
    background: color-mix(in srgb, var(--wl-chip-color) 88%, #000);
  }

  /* Offset outline rather than box-shadow: on a chip filled with its own line
     colour a shadow-based ring disappears into the fill. */
  .wl-chip:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .wl-chip-mode {
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
    opacity: 0.85;
  }

  .wl-chip-mode ha-icon {
    --mdc-icon-size: 14px;
    display: block;
  }

  /* Read-only line badge */

  /* Always a filled surface, so it takes the paired ink rather than a
     hardcoded white — a nightline badge is yellow-on-navy, as on the sign. */
  .wl-badge {
    --wl-chip-ink: #fff;
    flex: none;
    min-width: 34px;
    height: 24px;
    padding: 0 7px;
    box-sizing: border-box;
    border-radius: 5px;
    color: var(--wl-chip-ink);
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 24px;
    text-align: center;
    forced-color-adjust: none;
  }

  /* Direction buttons */

  .wl-dirs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .wl-dir {
    flex: 1;
    min-width: 0;
    min-height: 34px;
    padding: 4px 9px;
    border-radius: 6px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 0.78125rem;
    font-weight: 500;
    line-height: 1.3;
    text-align: center;
    overflow-wrap: anywhere;
    cursor: pointer;
  }

  .wl-dir[aria-pressed="true"] {
    border-color: var(--primary-color);
    background: var(--wl-ripple);
    color: var(--primary-color);
  }

  .wl-dir:hover:not([aria-disabled="true"]) {
    background: var(--wl-hover);
  }

  /* Dashed rather than merely faded: the border style survives forced-colors
     mode, where opacity does not. */
  .wl-dir[aria-disabled="true"] {
    border-style: dashed;
    background: transparent;
    color: var(--secondary-text-color);
    opacity: 0.65;
    cursor: not-allowed;
  }

  .wl-dir:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .wl-dir--compact {
    flex: 1 1 0;
    min-width: 44px;
  }

  .wl-dir--compact ha-icon {
    --mdc-icon-size: 16px;
  }

  .wl-override-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .wl-override-row .wl-dirs {
    flex: 1;
    min-width: 0;
    gap: 5px;
  }

  /* Walk-time row */

  .wl-walk-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .wl-walk-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
  }

  .wl-walk-dest {
    flex: 1;
    min-width: 0;
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.35;
    color: var(--primary-text-color);
    overflow-wrap: anywhere;
  }

  /* Stepper shell. The mockup specified −/value/+ only; the value stays a real
     text input so a 12-minute walk is one keystroke rather than twelve taps. */
  .wl-stepper {
    display: flex;
    align-items: center;
    flex: none;
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    overflow: hidden;
    background: var(--card-background-color);
  }

  .wl-step-btn {
    width: 34px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
  }

  .wl-step-btn ha-icon {
    --mdc-icon-size: 18px;
  }

  .wl-step-btn:hover:not(:disabled) {
    background: var(--wl-hover);
  }

  .wl-step-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .wl-step-btn:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  .wl-step-value {
    width: 38px;
    box-sizing: border-box;
    padding: 0 2px;
    border: 0;
    border-left: 1px solid var(--divider-color);
    border-right: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-text-color);
    font-size: 0.84375rem;
    font-weight: 500;
    line-height: 36px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    /* Native spinners duplicate the −/+ buttons and shrink the hit area. */
    -moz-appearance: textfield;
    appearance: textfield;
  }

  .wl-step-value::-webkit-outer-spin-button,
  .wl-step-value::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .wl-step-value:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  /* Colour override row */

  .wl-color-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .wl-color-field {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 10px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    cursor: pointer;
  }

  .wl-swatch {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    border: 1px solid var(--divider-color);
    forced-color-adjust: none;
  }

  .wl-color-hex {
    font-size: 0.78125rem;
    line-height: 1;
    font-family: ui-monospace, Menlo, monospace;
    color: var(--primary-text-color);
  }

  /* The real input is transparent and covers the field, so its own focus ring
     is invisible — lift the ring onto the field (WCAG 2.4.7). */
  .wl-color-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .wl-color-field:focus-within {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .wl-icon-btn {
    flex: none;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    color: var(--secondary-text-color);
    cursor: pointer;
  }

  .wl-icon-btn:hover:not(:disabled) {
    background: var(--wl-hover);
  }

  .wl-icon-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .wl-icon-btn:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Stop block, empty state, add button */

  .wl-stop-body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .wl-index {
    flex: none;
    width: 22px;
    height: 22px;
    box-sizing: border-box;
    border-radius: 11px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    color: var(--secondary-text-color);
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
  }

  .wl-empty {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    text-align: center;
    padding: 18px 14px;
    border: 1px dashed var(--divider-color);
    border-radius: 8px;
    background: var(--wl-sunken);
  }

  .wl-empty-title {
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--primary-text-color);
  }

  .wl-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    border: 1px dashed var(--divider-color);
    border-radius: 10px;
    background: transparent;
    color: var(--primary-color);
    font-size: 0.84375rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
  }

  .wl-add:hover {
    background: var(--wl-hover);
  }

  .wl-add:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Station header strip — direct manipulation.
     The bar mocks a physical black sign, so its surfaces are literal
     colours rather than theme tokens: themed chrome here would stop the
     widget looking like the thing it edits. */

  .wl-strip {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 8px 0 4px;
  }

  .wl-strip-bar {
    display: flex;
    gap: 6px;
    padding: 8px;
    border-radius: 10px;
    background: var(--wl-signage-housing);
    border: 1px solid var(--divider-color);
  }

  .wl-zone {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px dashed var(--wl-signage-outline);
    background: transparent;
    cursor: pointer;
  }

  .wl-zone--selected {
    border: 2px solid var(--primary-color);
    background: var(--wl-signage-selected);
  }

  .wl-zone:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .wl-zone-tokens {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    width: 100%;
  }

  /* Right zone right-aligns its tokens so the preview matches how the card
     lays the two sides out against the centre of the strip. */
  .wl-zone--right .wl-zone-tokens {
    justify-content: flex-end;
  }

  .wl-token {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 6px;
    border-radius: 3px;
    color: var(--wl-signage-ink);
    font-size: 0.6875rem;
    font-weight: 400;
    line-height: 1;
    white-space: nowrap;
    forced-color-adjust: none;
  }

  .wl-token ha-icon {
    --mdc-icon-size: 16px;
  }

  .wl-token--chip {
    background: var(--wl-signage-chip);
  }

  .wl-strip-switch {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Segmented control — used by the side switch. Enum config fields use
     ha-form's select instead; this exists for editor-local UI state that
     never reaches the config. */

  .wl-seg {
    display: flex;
    gap: 4px;
    padding: 3px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }

  .wl-seg-btn {
    border: 0;
    cursor: pointer;
    padding: 8px 12px;
    min-height: 34px;
    border-radius: 6px;
    background: transparent;
    color: var(--secondary-text-color);
    font-size: 0.78125rem;
    font-weight: 500;
    line-height: 1.2;
  }

  .wl-seg-btn[aria-pressed="true"] {
    background: var(--card-background-color);
    color: var(--primary-color);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);
  }

  .wl-seg-btn:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Slot panel — the four fields for whichever side is selected. */

  .wl-slot {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--primary-color);
    border-radius: 10px;
    background: var(--wl-sunken);
  }

  .wl-pict-grid,
  .wl-tray {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .wl-pict {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    cursor: pointer;
  }

  .wl-pict ha-icon,
  .wl-tray-btn ha-icon,
  .wl-pill ha-icon {
    --mdc-icon-size: 18px;
  }

  .wl-pict[aria-pressed="true"],
  .wl-tray-btn[aria-pressed="true"] {
    border-color: var(--primary-color);
    background: var(--wl-ripple);
    color: var(--primary-color);
  }

  .wl-pict:hover,
  .wl-tray-btn:hover {
    background: var(--wl-hover);
  }

  .wl-pict:focus-visible,
  .wl-tray-btn:focus-visible,
  .wl-pill-x:focus-visible,
  .wl-text:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .wl-tray-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 0.78125rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
  }

  .wl-text {
    width: 100%;
    box-sizing: border-box;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .wl-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 6px 0 11px;
    border: 1px solid var(--divider-color);
    border-radius: 18px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 0.78125rem;
    line-height: 1;
  }

  .wl-pill-x {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 12px;
    background: var(--wl-hover);
    color: var(--secondary-text-color);
    cursor: pointer;
  }

  .wl-pill-x ha-icon {
    --mdc-icon-size: 14px;
  }
`;
