// Derived editor tokens for the v2 editor system.
//
// The design spec names three surfaces — `--sunken`, `--hover`, `--ripple` —
// that Home Assistant has no token for. The prototype hardcoded a light and a
// dark value for each. Hardcoding them here would break under any custom
// theme (HA themes are user-authored and routinely swap card/text colours
// without touching ours), so each is derived from a real HA token with
// `color-mix()` instead.
//
// `color-mix()` is Baseline since 2023 — comfortably below the repo's
// `hacs.json` floor of HA 2025.1.0, whose bundled Chromium/WebKit targets all
// support it. No fallback needed.
//
// Why these three exist at all:
//   --wl-sunken  inset panel behind the selected header slot and empty states;
//                must read as "recessed" in both themes, so it is a small
//                push of the text colour into the card background rather than
//                a fixed grey.
//   --wl-hover   row / dashed-button hover. Text-colour-derived so it darkens
//                in light themes and lightens in dark ones automatically.
//   --wl-ripple  selected fill for chips, segmented and direction buttons.
//                Primary-colour-derived so it tracks the user's accent.

import { css } from "lit";

export const editorTokens = css`
  :host {
    --wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
    --wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
    --wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
  }
`;
