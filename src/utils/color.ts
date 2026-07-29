// Accent → legible-glyph colour, computed here rather than in CSS.
//
// The GTFS palette is a set of *background* colours; several of them are
// illegible painted as text (bus navy 0A295D is 1.21:1 on HA's dark card).
// The fix is to clamp the accent's OKLCh lightness into a readable band and
// leave hue and chroma alone, so the countdown still reads as *that line's*
// colour instead of going flat white. Issue #93.
//
// v1.7.3 did that clamp in CSS via `oklch(from var(--wl-accent) …)` behind an
// `@supports` probe. That is not safe: `@supports` can only test parse-time
// validity, and any declaration containing `var()` parses fine — so the probe
// can never test the declaration we actually ship. On a Shelly Wall Display's
// embedded WebView the probe passed and the relative colour still resolved to
// near-black (1.01:1). Nor can a `var()` fallback rescue it: the `.station`
// declaration wins the cascade, and a value that fails later is invalid at
// computed-value time — it never falls back to the `:host` default. Computing
// the sRGB value here removes the CSS feature dependency entirely; every
// engine gets the same colour the modern desktop already renders. Issue #95.

/** Lightness band for the accent-as-text token, per scheme (OKLCh L, 0–1). */
const DARK_FLOOR = 0.72;
const LIGHT_CEILING = 0.45;

type Rgb = readonly [number, number, number];

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

const srgbToLinear = (v: number): number =>
  v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (v: number): number =>
  v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;

/**
 * Parse a CSS colour into linear-light sRGB, or null when it isn't a colour
 * we can resolve up front.
 *
 * Hex is handled directly (the GTFS palette and the editor's colour picker
 * both emit `#rrggbb`); anything else is normalised through CSSOM, which
 * serialises named colours, `rgb()` and `hsl()` to `rgb(…)` and yields ""
 * for values it rejects. `var(--primary-color)` — the card's neutral
 * fallback accent — deliberately lands in the null branch: it can't be
 * resolved without a live element, and the caller wants the theme's own
 * text colour there anyway.
 */
function parseColor(value: string): Rgb | null {
  const input = value.trim();
  if (!input || input.includes("var(")) return null;

  let hex = /^#[0-9a-f]{3,8}$/i.test(input) ? input.slice(1) : "";
  if (!hex) {
    // CSSOM normalisation, for the named / rgb() / hsl() colours a
    // hand-written `line_colors` override can carry. `style.color` stays ""
    // if the engine rejects the value, so unparseable input falls through
    // to the null return below.
    let serialised = "";
    try {
      const probe = document.createElement("span").style;
      probe.color = input;
      serialised = probe.color.trim();
    } catch {
      return null;
    }
    const match = /^rgba?\(([^)]+)\)$/.exec(serialised);
    if (!match?.[1]) return null;
    const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    const [r, g, b] = parts;
    if (r === undefined || g === undefined || b === undefined) return null;
    if (![r, g, b].every(Number.isFinite)) return null;
    return [srgbToLinear(r / 255), srgbToLinear(g / 255), srgbToLinear(b / 255)];
  }

  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex.slice(0, 3)].map((c) => c + c).join("");
  }
  if (hex.length !== 6 && hex.length !== 8) return null;
  const int = Number.parseInt(hex.slice(0, 6), 16);
  if (!Number.isFinite(int)) return null;
  return [
    srgbToLinear(((int >> 16) & 0xff) / 255),
    srgbToLinear(((int >> 8) & 0xff) / 255),
    srgbToLinear((int & 0xff) / 255),
  ];
}

/** Linear sRGB → OKLab (Björn Ottosson's matrices, as used by CSS Color 4). */
function linearToOklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab → linear sRGB. May land outside the gamut; the caller clips. */
function oklabToLinear([lightness, a, b]: Rgb): Rgb {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const toHex = ([r, g, b]: Rgb): string =>
  "#" +
  [r, g, b]
    .map((v) =>
      Math.round(clamp01(linearToSrgb(v)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/**
 * Return `accent` with its OKLCh lightness clamped into the legible band for
 * `scheme`, as `#rrggbb` — or null when the accent isn't resolvable or the
 * scheme is unknown, in which case the caller should leave the token unset so
 * the theme's own text colour stands (legible but hueless, never invisible).
 *
 * Being a clamp rather than a blend, it only moves the lines that need it:
 * U3 orange passes through nearly unchanged, bus navy is lifted to #80A5E3.
 * Lifting lightness can push a saturated accent outside sRGB; the channels are
 * then clipped, which is what browsers do for `oklch()` in practice — so these
 * values are byte-identical to what v1.7.3's relative-colour CSS painted
 * wherever it worked (verified against a canvas read-back of Chrome's own
 * output for all eight published lines, both schemes). Deliberately NOT the
 * CSS Color 4 §13.2 chroma-reduction gamut map: that is the more correct
 * algorithm, but it lands U1 on #FF7163 where the browser paints #FF5347, and
 * matching the shipped colour matters more than matching the spec.
 *
 * Worst case across the published palette, measured against the 12%
 * accent-tinted row the countdown actually sits on (not the flat card):
 * 5.06:1 dark, 5.70:1 light — AA for normal text, not just large.
 */
export function accentTextColor(
  accent: string,
  scheme: "dark" | "light" | undefined,
): string | null {
  if (scheme === undefined) return null;
  const linear = parseColor(accent);
  if (!linear) return null;

  const [lightness, a, b] = linearToOklab(linear);
  const clamped =
    scheme === "dark"
      ? Math.max(DARK_FLOOR, lightness)
      : Math.min(LIGHT_CEILING, lightness);
  if (clamped === lightness) return toHex(linear);

  const chroma = Math.hypot(a, b);
  const hue = Math.atan2(b, a);
  const lifted = oklabToLinear([
    clamped,
    chroma * Math.cos(hue),
    chroma * Math.sin(hue),
  ]);
  return toHex([clamp01(lifted[0]), clamp01(lifted[1]), clamp01(lifted[2])]);
}
