// Styles for the station header strip.
//
// Split out of editor-styles.ts rather than living in it: only the retro and
// flap editors render the strip, and a shared sheet meant every rule below
// also shipped inside the modern bundle, which has no header strip at all.
// Roughly 4 KB of CSS the modern card could never match.
//
// The strip's surfaces are literal colours rather than theme tokens — the bar
// mocks a physical black sign, and themed chrome here would stop the widget
// looking like the thing it edits. The signage custom properties therefore sit
// here too, beside their only consumers, rather than in editor-tokens.ts.

import { css } from "lit";

export const headerStripStyles = css`
  :host {
    --wl-signage-housing: #0d0d0d;
    --wl-signage-selected: #171717;
    --wl-signage-outline: #3a3a3a;
    --wl-signage-chip: #2a2a2a;
    --wl-signage-ink: #f2f2f2;
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

  /* Forced colours.
     .wl-token opts out so the sign keeps its near-white ink — but its
     container did not, so the bar was forced to Canvas while the ink stayed
     #f2f2f2. White on white, in the one control whose entire premise is that
     the bar IS the preview. The housing and the zones opt out alongside it so
     ground and ink stay a matched pair; the bar then takes a CanvasText edge
     so the widget still has a findable boundary against the forced page. */
  @media (forced-colors: active) {
    .wl-strip-bar,
    .wl-zone {
      forced-color-adjust: none;
    }

    .wl-strip-bar {
      outline: 1px solid CanvasText;
    }

    .wl-seg-btn[aria-pressed="true"]:not(:focus-visible),
    .wl-pict[aria-pressed="true"]:not(:focus-visible),
    .wl-tray-btn[aria-pressed="true"]:not(:focus-visible) {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;
