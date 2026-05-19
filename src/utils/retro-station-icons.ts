// Inlined Wiener-Linien U-Bahn station-signage icons for the retro
// card's header strip.
//
// Why inlined — the icons are bespoke transit-system glyphs (door +
// directional arrow, door + wheelchair person, WC monogram,
// escalator zigzag, lift box). MDI has no equivalents at the right
// level of fidelity. Source SVGs live in `assets/retro-header/` for
// provenance; the runtime authoritative copies are the `html\`…\``
// templates below.
//
// All glyphs use *default fill*, which inherits the parent's CSS
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

interface IconDef {
  /** SVG viewBox — preserved verbatim from the source asset. */
  viewBox: string;
  /** Renderer for the inner SVG shapes. MUST be built with the
   *  `svg\`\`` tag, NOT `html\`\``: Lit creates DOM nodes from a
   *  template based on the tag, so `html\`<polygon/>\`` would
   *  produce an unknown HTMLElement that the browser can't render.
   *  Wrapped in `<svg>` by `renderRetroHeaderIcon` — outer `<svg>`
   *  and Adobe `<g id="Ebene_*">` wrappers were stripped on
   *  ingestion. */
  shapes: () => SVGTemplateResult;
  /** Localisation key under `retro.header.*` for the screen-reader
   *  name. Composed at render time via `translate()`. */
  labelKey: string;
  /** Glyph's natural arrow direction. Consumed by the card render
   *  to compute `flipX` per side (exit on right side auto-flips so
   *  the arrow points right). `undefined` for amenity icons that
   *  never flip. */
  glyphPointsTo?: "left" | "right";
}

export const RETRO_HEADER_ICONS: Record<RetroHeaderIconKey, IconDef> = {
  exit: {
    viewBox: "0 0 36.29 29.04",
    glyphPointsTo: "left",
    labelKey: "icon_exit",
    shapes: () => svg`
      <polygon points="31.29 0 18.99 0 13.99 0 13.99 5 13.99 10.31 18.99 10.31 18.99 5 31.29 5 31.29 24.04 18.99 24.04 18.99 18.44 13.99 18.44 13.99 24.04 13.99 29.04 18.99 29.04 31.29 29.04 36.29 29.04 36.29 24.04 36.29 5 36.29 0 31.29 0"/>
      <polygon points="24.22 12.38 7.65 12.38 12.5 7.53 6.85 7.53 0 14.37 6.85 21.23 12.51 21.23 12.51 21.23 7.66 16.38 24.22 16.38 24.22 12.38"/>
    `,
  },
  "exit-access": {
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
    viewBox: "0 0 34.41 16.58",
    labelKey: "icon_wc",
    shapes: () => svg`
      <path d="M16.76.3h3.36l-4.46,15.83h-3.16l-1.91-9.26-.56-3.06-.56,3.06-1.91,9.26h-3.07L0,.3h3.51l2.09,9.07.45,2.52.46-2.47L8.3.3h3.49l1.88,9.07.48,2.52.48-2.43L16.76.3Z"/>
      <path d="M32.19,14.95c-1.18,1.08-2.69,1.62-4.53,1.62-2.28,0-4.07-.73-5.37-2.19-1.3-1.47-1.96-3.48-1.96-6.04,0-2.76.74-4.89,2.22-6.39,1.29-1.3,2.93-1.96,4.92-1.96,2.66,0,4.61.87,5.84,2.62.68.98,1.04,1.97,1.1,2.95h-3.31c-.21-.76-.49-1.33-.83-1.72-.6-.69-1.49-1.03-2.67-1.03s-2.15.49-2.85,1.46c-.7.97-1.04,2.34-1.04,4.12s.37,3.11,1.1,3.99c.73.88,1.67,1.33,2.8,1.33s2.04-.38,2.65-1.14c.34-.41.62-1.02.84-1.84h3.28c-.29,1.73-1.02,3.13-2.19,4.21Z"/>
    `,
  },
  escalator: {
    viewBox: "0 0 36.74 28.3",
    labelKey: "icon_escalator",
    shapes: () => svg`
      <polygon points="27.05 0 27.05 3.08 23.69 3.08 23.69 6.17 20.32 6.17 20.32 9.25 16.96 9.25 16.96 12.33 13.64 12.33 13.64 15.42 10.28 15.42 10.28 18.5 6.91 18.5 6.91 22.14 0 22.14 0 28.3 7.97 28.3 30.42 6.17 36.74 6.17 36.74 0 27.05 0"/>
    `,
  },
  elevator: {
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

/** Render an inline SVG icon for the retro header strip, wrapped in
 *  a white-background tile so the (black) glyph reads against the
 *  black header strip the way the original Wiener Linien signage
 *  does. The browser's HTML parser namespace-promotes the `<svg>`
 *  element automatically; child shapes inherit that namespace and
 *  the tile's `color: #000` cascades into the glyph's currentColor
 *  fill. */
export function renderRetroHeaderIcon(
  key: RetroHeaderIconKey,
  opts: RenderOpts,
): TemplateResult {
  const def = RETRO_HEADER_ICONS[key];
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
