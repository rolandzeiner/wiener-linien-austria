// Vendored Material Design Icons path geometry for the QR-code canvas.
//
// WHY THESE ARE INLINE AND NOT AN `@mdi/js` IMPORT
//
// These four strings are consumed by `new Path2D(...)` when the modern
// card paints its QR code onto a <canvas> — see `_drawStopIcon` in
// wiener-linien-austria-card.ts. That is a geometry API: it needs the
// literal SVG path data, so HA's <ha-icon> / <ha-svg-icon> elements (used
// elsewhere in this repo, e.g. the editor's reset button) cannot serve
// this call site. Only the raw `d` attribute will do.
//
// Depending on `@mdi/js` to obtain four constants meant carrying a
// 6.3 MB package that exports 7,447 icons. Rollup tree-shook it correctly
// — only these four reached the bundle — so this vendoring changes no
// shipped byte. What it removes is the install-time and supply-chain
// weight of the dependency, and it follows the precedent already set by
// utils/retro-station-icons.ts, which inlines its glyphs for the same
// reason: icon path data is content, not an API.
//
// PROVENANCE — Material Design Icons v7.4.47, Apache-2.0. Copied verbatim
// from @mdi/js's `mdi.js` exports named below. All four use MDI's
// standard 24x24 viewBox, which is what the canvas scale factor in
// `_drawStopIcon` assumes. To refresh, reinstall @mdi/js at the desired
// version and re-copy; do not hand-edit the geometry.

/** MDI `mdiSubwayVariant` (v7.4.47) — 24x24 viewBox. */
const mdiSubwayVariant = "M18,11H13V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M11,11H6V6H11M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M12,2C7.58,2 4,2.5 4,6V15.5A3.5,3.5 0 0,0 7.5,19L6,20.5V21H18V20.5L16.5,19A3.5,3.5 0 0,0 20,15.5V6C20,2.5 16.42,2 12,2Z";

/** MDI `mdiTram` (v7.4.47) — 24x24 viewBox. */
const mdiTram = "M19,16.94V8.5C19,5.71 16.39,5.1 13,5L13.75,3.5H17V2H7V3.5H11.75L11,5C7.86,5.11 5,5.73 5,8.5V16.94C5,18.39 6.19,19.6 7.59,19.91L6,21.5V22H8.23L10.23,20H14L16,22H18V21.5L16.5,20H16.42C18.11,20 19,18.63 19,16.94M12,18.5A1.5,1.5 0 0,1 10.5,17A1.5,1.5 0 0,1 12,15.5A1.5,1.5 0 0,1 13.5,17A1.5,1.5 0 0,1 12,18.5M17,14H7V9H17V14Z";

/** MDI `mdiBus` (v7.4.47) — 24x24 viewBox. */
const mdiBus = "M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z";

/** MDI `mdiBusStop` (v7.4.47) — 24x24 viewBox. */
const mdiBusStop = "M22 7V16C22 16.71 21.62 17.36 21 17.72V19.25C21 19.66 20.66 20 20.25 20H19.75C19.34 20 19 19.66 19 19.25V18H12V19.25C12 19.66 11.66 20 11.25 20H10.75C10.34 20 10 19.66 10 19.25V17.72C9.39 17.36 9 16.71 9 16V7C9 4 12 4 15.5 4S22 4 22 7M13 15C13 14.45 12.55 14 12 14S11 14.45 11 15 11.45 16 12 16 13 15.55 13 15M20 15C20 14.45 19.55 14 19 14S18 14.45 18 15 18.45 16 19 16 20 15.55 20 15M20 7H11V11H20V7M7 9.5C6.97 8.12 5.83 7 4.45 7.05C3.07 7.08 1.97 8.22 2 9.6C2.03 10.77 2.86 11.77 4 12V20H5V12C6.18 11.76 7 10.71 7 9.5Z";

/**
 * Map an MDI icon NAME (as returned by `lineTypeIcon` /
 * `headerIconForType` in ./mot.ts) to its raw SVG path data.
 *
 * Unknown names fall through to the generic stop glyph, mirroring
 * `headerIconForType`'s own fallback: Wiener Linien has added new
 * MeansOfTransport values before, and the QR canvas should degrade to a
 * generic icon rather than throw inside Path2D.
 */
export function mdiPathForIcon(iconName: string): string {
  switch (iconName) {
    case "mdi:subway-variant":
      return mdiSubwayVariant;
    case "mdi:tram":
      return mdiTram;
    case "mdi:bus":
      return mdiBus;
    case "mdi:bus-stop":
    default:
      return mdiBusStop;
  }
}
