import { css } from "lit";

// WL Sans / WL Sans Condensed / WL Mono — subsetted derivatives of
// the TeX Gyre family (TeX Gyre Heros, Heros Cn, Cursor). Bundled at
// custom_components/wiener_linien_austria/www/fonts/, served via the
// integration's directory-level StaticPathConfig at
// /wiener-linien-austria/fonts/. font-display: swap so cards render
// instantly in fallback and upgrade when the woff2 lands.
//
// Shared module: imported once by each card's `static styles` so the
// declarations live in one place. Browsers lazy-fetch each face only
// on first use of its family, so a card that doesn't render (say)
// WL Sans Condensed pays nothing for declaring it here.
//
// Caveat — WL Sans Condensed ships ONLY at weight 700. If a future
// selector requests `font-family: "WL Sans Condensed"` at any other
// weight, the browser falls through to the next family in that
// selector's fallback chain (typically "WL Sans" 400 / 700 →
// system stack). Intentional: the U-Bahn signage's condensed face is
// bold by design, a regular-weight variant has no real-world referent.
//
// See custom_components/wiener_linien_austria/www/fonts/NOTICE.md for
// provenance, license (GUST Font License / LPPL 1.3c+), and
// subset reproducibility.
export const wlFontFaces = css`
  @font-face {
    font-family: "WL Sans";
    src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "WL Sans";
    src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "WL Sans Condensed";
    src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "WL Mono";
    src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "WL Mono";
    src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
`;
