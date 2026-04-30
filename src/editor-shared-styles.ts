// Shared editor base styles consumed by both Lovelace editors
// (modern + retro). Covers the rules that ended up identical after
// the ha-form migration: the outer `.editor` flex container, the
// `.editor-section` panel, headers / hints, and the bespoke walk-time
// row template (kept below ha-form because the row list is per-stop
// and can't be expressed statically).
//
// Each editor still owns its own bespoke selectors via a second `css`
// block — see `static styles: CSSResultGroup = [editorBaseStyles, css\`…\`]`
// in editor.ts / retro-editor.ts.

import { css } from "lit";

export const editorBaseStyles = css`
  :host {
    display: block;
  }
  .editor {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .section-header {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .editor-hint {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }
  .walk-time-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .walk-time-row {
    display: grid;
    grid-template-columns: 44px 1fr 72px;
    align-items: center;
    gap: 8px;
  }
  .walk-time-badge {
    text-align: center;
    font-weight: 700;
    color: #fff;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 0.9em;
    background: var(--primary-color);
  }
  .walk-time-towards {
    font-size: 0.8125rem;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .walk-time-input {
    width: 100%;
    box-sizing: border-box;
    padding: 4px 8px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color, transparent);
    color: var(--primary-text-color);
    font-size: 0.8125rem;
    text-align: right;
  }
`;
