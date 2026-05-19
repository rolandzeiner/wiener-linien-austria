// Inlined Wiener-Linien U-Bahn station-signage icons for the retro
// card's header strip.
//
// Why inlined — the icons are bespoke transit-system glyphs (door +
// directional arrow, door + wheelchair person, escalator zigzag,
// lift box). MDI has no equivalents at the right level of fidelity.
// Source SVGs live in `assets/retro-header/` for provenance; the
// runtime authoritative copies are the `html\`…\`` templates below.
//
// The WC tile is the exception: rather than tracing the monogram as
// SVG paths we just type "WC" inside the white square — the result
// is visually equivalent and avoids ~300 bytes of bezier data plus a
// font-coupling failure mode (path-traced letterforms can't restyle
// with the rest of the card's text). Marked with `kind: "text"`.
//
// All SVG glyphs use *default fill*, which inherits the parent's CSS
// `color`. The header strip is `color: #fff`, so the icons render
// white on the black strip without any explicit `fill` attribute.
//
// `exit` glyph's arrow points LEFT; `exit-access` glyph's arrow
// points RIGHT. The card's render auto-flips them via the
// `--flip-x` class so the arrow always points outward from the side
// of the strip the icon sits on — see `_renderStationHeader` in
// `wiener-linien-austria-retro-card.ts`.

import { html, svg, type SVGTemplateResult, type TemplateResult } from "lit";

export type RetroHeaderIconKey =
  | "exit"
  | "exit-access"
  | "wc"
  | "escalator"
  | "elevator";

/** Discriminated by `kind`. The SVG variant is the default —
 *  bespoke station-signage glyphs traced as path data. The TEXT
 *  variant is the "letterform monogram" path used by WC: the tile
 *  itself is already a white square, so we just type the letters
 *  inside it. */
type IconDef =
  | {
      kind: "svg";
      /** SVG viewBox — preserved verbatim from the source asset. */
      viewBox: string;
      /** Renderer for the inner SVG shapes. MUST be built with the
       *  `svg\`\`` tag, NOT `html\`\``: Lit creates DOM nodes from a
       *  template based on the tag, so `html\`<polygon/>\`` would
       *  produce an unknown HTMLElement that the browser can't
       *  render. Wrapped in `<svg>` by `renderRetroHeaderIcon` —
       *  outer `<svg>` and Adobe `<g id="Ebene_*">` wrappers were
       *  stripped on ingestion. */
      shapes: () => SVGTemplateResult;
      /** Localisation key under `retro.header.*` for the screen-
       *  reader name. Composed at render time via `translate()`. */
      labelKey: string;
      /** Glyph's natural arrow direction. Consumed by the card
       *  render to compute `flipX` per side (exit on right side
       *  auto-flips so the arrow points right). `undefined` for
       *  amenity icons that never flip. */
      glyphPointsTo?: "left" | "right";
    }
  | {
      kind: "text";
      /** Literal characters typed inside the white tile (e.g. "WC"). */
      text: string;
      /** Same role as the SVG variant's labelKey. */
      labelKey: string;
    };

/** Narrow-typed key sets so `RETRO_HEADER_ICONS[k]` can produce the
 *  right variant at the call site without runtime narrowing — exit
 *  / exit-access / escalator / elevator are statically known SVG. */
export type RetroSvgIconKey = "exit" | "exit-access" | "escalator" | "elevator";
export type RetroTextIconKey = "wc";

export const RETRO_HEADER_ICONS: { [K in RetroSvgIconKey]: Extract<IconDef, { kind: "svg" }> } & {
  [K in RetroTextIconKey]: Extract<IconDef, { kind: "text" }>;
} = {
  exit: {
    kind: "svg",
    viewBox: "0 0 36.29 29.04",
    glyphPointsTo: "left",
    labelKey: "icon_exit",
    shapes: () => svg`
      <polygon points="31.29 0 18.99 0 13.99 0 13.99 5 13.99 10.31 18.99 10.31 18.99 5 31.29 5 31.29 24.04 18.99 24.04 18.99 18.44 13.99 18.44 13.99 24.04 13.99 29.04 18.99 29.04 31.29 29.04 36.29 29.04 36.29 24.04 36.29 5 36.29 0 31.29 0"/>
      <polygon points="24.22 12.38 7.65 12.38 12.5 7.53 6.85 7.53 0 14.37 6.85 21.23 12.51 21.23 12.51 21.23 7.66 16.38 24.22 16.38 24.22 12.38"/>
    `,
  },
  "exit-access": {
    kind: "svg",
    viewBox: "0 0 36.29 29.04",
    glyphPointsTo: "right",
    labelKey: "icon_exit_access",
    shapes: () => svg`
      <polygon points="17.3 18.73 17.3 24.04 5 24.04 5 5 17.3 5 17.3 10.59 22.3 10.59 22.3 5 22.3 0 17.3 0 5 0 0 0 0 5 0 24.04 0 29.04 5 29.04 17.3 29.04 22.3 29.04 22.3 24.04 22.3 18.73 17.3 18.73"/>
      <circle cx="9.97" cy="8.73" r="1.05"/>
      <path d="M9.04,10.69h0v4.12h0c0,.36.5.66,1.12.66h3.48l1.2,2.87h1l-1.2-2.87-.39-.93h-2.97v-1.47h2.32s-.09-.68-.58-.68h-1.74v-1.7h0c0-.36-.5-.66-1.12-.66s-1.12.29-1.12.66Z"/>
      <path d="M11.67,18.74c1.04-.58,1.78-1.63,1.91-2.87h-.72c-.18,1.49-1.45,2.64-2.98,2.64-1.66,0-3.01-1.35-3.01-3.01,0-1.21.71-2.24,1.74-2.72v-.77c-1.43.52-2.45,1.89-2.45,3.49,0,2.05,1.67,3.72,3.72,3.72h6.32v-.48h-4.53Z"/>
      <polygon points="29.44 7.81 23.79 7.81 23.79 7.81 28.63 12.66 17.3 12.66 17.3 16.66 28.64 16.66 23.79 21.51 29.45 21.51 36.29 14.66 29.44 7.81"/>
    `,
  },
  wc: {
    kind: "text",
    text: "WC",
    labelKey: "icon_wc",
  },
  escalator: {
    kind: "svg",
    viewBox: "0 0 36.74 28.3",
    labelKey: "icon_escalator",
    shapes: () => svg`
      <polygon points="27.05 0 27.05 3.08 23.69 3.08 23.69 6.17 20.32 6.17 20.32 9.25 16.96 9.25 16.96 12.33 13.64 12.33 13.64 15.42 10.28 15.42 10.28 18.5 6.91 18.5 6.91 22.14 0 22.14 0 28.3 7.97 28.3 30.42 6.17 36.74 6.17 36.74 0 27.05 0"/>
    `,
  },
  elevator: {
    kind: "svg",
    viewBox: "0 0 24.01 36.69",
    labelKey: "icon_elevator",
    shapes: () => svg`
      <path d="M14.82,19.29h-5.63c-.37,0-.68.3-.68.68v5.15c0,.37.3.68.68.68s.68-.3.68-.68v-4.48h.42v12.32c0,.37.3.68.68.68s.68-.3.68-.68v-7.42h.73v7.42c0,.37.3.68.68.68s.68-.3.68-.68v-12.32h.42v4.48c0,.37.3.68.68.68s.68-.3.68-.68v-5.15c0-.37-.3-.68-.68-.68Z"/>
      <circle cx="12" cy="17.3" r="1.57"/>
      <path d="M22.6,14.1v21.18H1.41V14.1h21.18M24.01,12.68H0v24.01h24.01V12.68h0Z"/>
      <polygon points="11.11 4.94 6.17 0 1.23 4.94 1.23 7.6 5.23 3.61 5.23 11.48 7.11 11.48 7.11 3.61 11.11 7.6 11.11 4.94"/>
      <polygon points="12.9 6.54 17.84 11.48 22.78 6.54 22.78 3.87 18.78 7.87 18.78 0 16.9 0 16.9 7.87 12.9 3.87 12.9 6.54"/>
    `,
  },
};

interface RenderOpts {
  /** Localised name read aloud by screen readers. Required —
   *  amenity icons carry information independent of the sign text
   *  next to them, so no decorative variant. */
  ariaLabel: string;
  /** When true, applies the `--flip-x` class which transforms the
   *  glyph with `scaleX(-1)`. Computed by the card render per side
   *  so exit arrows always point outward. */
  flipX?: boolean;
}

/** Curated MDI icons offered alongside the WL-traced "regular" /
 *  "accessible" exit glyphs on the header strip's exit corner.
 *  Scope: exit-corner pictograms only — alternative exit arrows
 *  (`mdi:exit-run`, `mdi:exit-to-app`) for when the WL traced glyph
 *  isn't quite the right idiom, plus pedestrian-connection icons
 *  (`mdi:door-open`, `mdi:stairs`) for non-arrow signage cases.
 *
 *  `glyphPointsTo` mirrors the WL svg variant's meaning — set ONLY on
 *  exit-arrow style MDI icons so the render auto-flips them outward.
 *  Doorway / stairs icons aren't directional and stay un-flipped on
 *  both sides. */
export const RETRO_HEADER_MDI_EXIT_KEYS = [
  "mdi:exit-run",
  "mdi:exit-to-app",
  "mdi:door-open",
  "mdi:stairs",
] as const;

export type RetroHeaderMdiExit = (typeof RETRO_HEADER_MDI_EXIT_KEYS)[number];

interface MdiExitDef {
  /** Localisation key under `retro.header.*` for the screen-reader
   *  name and the editor dropdown label (the same key serves both
   *  consumers — they want the same human noun phrase). */
  labelKey: string;
  /** Auto-flip metadata. Same semantics as the SVG variant —
   *  `undefined` means "never flips" (used for non-directional
   *  symbol glyphs like doorways or stairs). */
  glyphPointsTo?: "left" | "right";
}

export const RETRO_HEADER_MDI_EXITS: Record<RetroHeaderMdiExit, MdiExitDef> = {
  "mdi:exit-run":    { labelKey: "icon_mdi_exit_run",    glyphPointsTo: "right" },
  "mdi:exit-to-app": { labelKey: "icon_mdi_exit_to_app", glyphPointsTo: "right" },
  "mdi:door-open":   { labelKey: "icon_mdi_door_open"    },
  "mdi:stairs":      { labelKey: "icon_mdi_stairs"       },
};

/** Runtime guard — narrows a `string` to a `RetroHeaderMdiExit`. The
 *  config normaliser uses this to validate user-supplied values
 *  against the curated set, dropping anything outside the registry. */
export function isRetroHeaderMdiExit(v: unknown): v is RetroHeaderMdiExit {
  return typeof v === "string" && v in RETRO_HEADER_MDI_EXITS;
}

/** Render a retro-header glyph wrapped in a white-background tile
 *  so the (black) glyph reads against the black header strip the
 *  way the original Wiener Linien signage does.
 *
 *  Two render paths, picked by `def.kind`:
 *   - `"svg"`: inline `<svg>`. Browser auto-namespace-promotes the
 *     element; child shapes inherit that namespace and the tile's
 *     `color: #000` cascades into the glyph's currentColor fill.
 *   - `"text"`: a centred `<span>` containing literal characters
 *     (WC). The tile's flex centering positions them — no manual
 *     transform needed. */
export function renderRetroHeaderIcon(
  key: RetroHeaderIconKey,
  opts: RenderOpts,
): TemplateResult {
  const def = RETRO_HEADER_ICONS[key];
  if (def.kind === "text") {
    return html`<span class="retro-station-header__tile" role="img" aria-label=${opts.ariaLabel}>
      <span class="retro-station-header__monogram" aria-hidden="true">${def.text}</span>
    </span>`;
  }
  const iconClass = opts.flipX
    ? "retro-station-header__icon retro-station-header__icon--flip-x"
    : "retro-station-header__icon";
  return html`<span class="retro-station-header__tile" role="img" aria-label=${opts.ariaLabel}>
    <svg
      class=${iconClass}
      viewBox=${def.viewBox}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >${def.shapes()}</svg>
  </span>`;
}

/** Render an MDI icon for the header strip's exit corner — wrapped
 *  in the same white tile the WL traced glyphs use, so MDI and SVG
 *  variants compose visually on the same row. `<ha-icon>` inherits
 *  the tile's `color: #000` via `currentColor`; the icon size token
 *  set in the card's CSS keeps the glyph inside the tile padding. */
export function renderRetroHeaderMdiIcon(
  mdiIcon: RetroHeaderMdiExit,
  opts: RenderOpts,
): TemplateResult {
  const iconClass = opts.flipX
    ? "retro-station-header__mdi retro-station-header__mdi--flip-x"
    : "retro-station-header__mdi";
  // `--mdi` modifier on the tile drops its padding from 0.12em to
  // 0.06em so MDI icons (which carry their own viewBox padding) read
  // at the same visual weight as the WL-traced tiles next to them.
  return html`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${opts.ariaLabel}>
    <ha-icon class=${iconClass} icon=${mdiIcon}></ha-icon>
  </span>`;
}
