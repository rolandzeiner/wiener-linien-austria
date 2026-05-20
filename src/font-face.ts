// WL Sans / WL Sans Condensed / WL Mono — subsetted derivatives of
// the TeX Gyre family (TeX Gyre Heros, Heros Cn, Cursor). Bundled at
// custom_components/wiener_linien_austria/www/fonts/, served via the
// integration's directory-level StaticPathConfig at
// /wiener-linien-austria/fonts/. font-display: swap so cards render
// instantly in fallback and upgrade when the woff2 lands.
//
// IMPORTANT — these @font-face rules MUST be registered on the *main
// document*, NOT inside a card's Shadow DOM `static styles`. A
// @font-face declared inside a shadow root is honoured by recent
// desktop Chromium/WebKit but silently ignored by older engines —
// notably the Android System WebView that backs the HA Companion app
// on many tablets. There the card fell through to the system stack
// ("Courier New" / "Courier" don't exist on Android → generic
// monospace), so the same card looked different on a tablet than on
// macOS. Registering the faces once on `document.head` — where
// @font-face has always been visible to shadow trees — makes every
// card render identically across engines. This mirrors Lit's own FAQ:
// "@font-face rules need to be defined in the main document."
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
const WL_FONT_FACE_CSS = `
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

const WL_FONTS_STYLE_ID = "wl-austria-fonts";

/**
 * Register the WL webfont @font-face rules on the main document.
 *
 * Idempotent: guarded by the `<style>`'s id, so calling it from every
 * card's `connectedCallback()` — which HA may fire repeatedly as it
 * attaches/detaches the card — injects the block exactly once, and a
 * page mixing the modern and retro cards still ends up with a single
 * declaration. Safe to call before first render: the browser keeps
 * lazy-fetching each woff2 only on first use of its family, so a card
 * that never renders (say) WL Sans Condensed pays nothing for it.
 */
export function registerWlFonts(): void {
  // `document` is always the real browser document inside HA; the guard
  // is just defensive against a non-DOM module-evaluation context.
  if (typeof document === "undefined") return;
  if (document.getElementById(WL_FONTS_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = WL_FONTS_STYLE_ID;
  style.textContent = WL_FONT_FACE_CSS;
  document.head.appendChild(style);
}
