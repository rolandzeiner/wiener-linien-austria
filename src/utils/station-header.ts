// Shared station-header strip — the black signage band above the
// station name, rendered identically by the retro AND flap cards as a
// homage to real Wiener Linien U-Bahn station signage. Both cards drive
// it from the same per-side `RetroHeaderSide` config; the only card-
// specific concern is CSS — each shadow root styles the
// `.retro-station-header__*` classes for its own palette (LED amber vs
// cream/dark cabinet), and neither root's CSS can bleed into the other.
// So the markup + amenity-ordering logic lives here once.
//
// Conventions mirror shared-render.ts: pure functions, no `this`. Each
// card passes its flat-key translate callback (`t`) and HA language, so
// this module owns no hidden state. Icon primitives are reused from
// retro-station-icons.ts; the clock/date formatters from time.ts.

import { html, nothing, type TemplateResult } from "lit";
import type { RetroHeaderSide } from "../types.js";
import {
  RETRO_HEADER_ICONS,
  RETRO_HEADER_MDI_EXITS,
  isRetroHeaderMdiExit,
  renderRetroHeaderIcon,
  renderRetroHeaderMdiIcon,
  renderRetroHeaderMdiTile,
  type RetroHeaderIconKey,
} from "./retro-station-icons.js";
import { formatClock, formatDate } from "./time.js";

/** Format an ISO timestamp as a PHP-style date string for the optional
 *  header date chip. Returns `null` when server_time is missing /
 *  unparseable or the format string is empty — the caller omits the chip
 *  rather than painting an obvious placeholder. */
function formatDateChip(
  serverTime: string | null | undefined,
  format: string | undefined,
  lang: string | undefined,
): string | null {
  if (!serverTime || !format) return null;
  const ts = Date.parse(serverTime);
  if (!Number.isFinite(ts)) return null;
  return formatDate(new Date(ts), format, lang);
}

function renderHeaderSide(
  side: RetroHeaderSide,
  pos: "left" | "right",
  serverTime: string | null | undefined,
  t: (key: string) => string,
  lang: string | undefined,
): TemplateResult {
  // Resolve the exit corner to a render node. Three paths:
  //   "regular" / "accessible" → WL traced SVG glyph (auto-flips per
  //                              side via glyphPointsTo).
  //   "mdi:…"                  → curated MDI icon inside the same tile
  //                              (auto-flip only for icons whose registry
  //                              entry declares a `glyphPointsTo`).
  //   anything else            → no icon.
  let exitNode: TemplateResult | typeof nothing = nothing;
  if (side.exit === "regular" || side.exit === "accessible") {
    const key: "exit" | "exit-access" =
      side.exit === "regular" ? "exit" : "exit-access";
    exitNode = renderRetroHeaderIcon(key, {
      ariaLabel: t(`header.${RETRO_HEADER_ICONS[key].labelKey}`),
      // Glyph's native direction is `pointsTo`. Flip when the side it
      // sits on doesn't match — e.g. `exit` (points left) on the right
      // side flips to point right.
      flipX: RETRO_HEADER_ICONS[key].glyphPointsTo !== pos,
    });
  } else if (side.exit && isRetroHeaderMdiExit(side.exit)) {
    const meta = RETRO_HEADER_MDI_EXITS[side.exit];
    exitNode = renderRetroHeaderMdiIcon(side.exit, {
      ariaLabel: t(`header.${meta.labelKey}`),
      // Only directional MDI icons (exit-run / exit-to-app) declare
      // glyphPointsTo. Vehicle / amenity glyphs don't flip.
      flipX: meta.glyphPointsTo !== undefined && meta.glyphPointsTo !== pos,
    });
  }
  const textNode = side.text
    ? html`<span class="retro-station-header__text">${side.text}</span>`
    : nothing;
  const amenityKey = (key: RetroHeaderIconKey) =>
    renderRetroHeaderIcon(key, {
      ariaLabel: t(`header.${RETRO_HEADER_ICONS[key].labelKey}`),
    });
  const wc = side.show_wc ? amenityKey("wc") : nothing;
  const esc = side.show_escalator ? amenityKey("escalator") : nothing;
  const elv = side.show_elevator ? amenityKey("elevator") : nothing;
  // Free-form MDI tiles — same-tile styling as the curated MDI exit
  // variants (white square, --mdi padding modifier). Sit between the WC
  // tile and the text chips. Aria-label is the MDI key itself, the
  // closest semantic label we have without an explicit per-row label.
  const mdiTileNodes = (side.extra_icons ?? []).map((icon) =>
    renderRetroHeaderMdiTile(icon, icon),
  );
  const mdiTilesRightOrder = [...mdiTileNodes].reverse();
  // Text chips — same-height white boxes with dynamic width. Sit beyond
  // the MDI tiles (further from the sign text than any amenity icon or
  // extra icon) so they read as the outer-edge content on each side.
  // Mirrored across sides so chip[0] is always the closest-to-extra-icons
  // entry regardless of which side it lives on.
  const chipNodes = (side.chips ?? []).map(
    (chipText) =>
      html`<span class="retro-station-header__chip">${chipText}</span>`,
  );
  const chipsRightOrder = [...chipNodes].reverse();
  // Optional clock + date chips — `show_clock` / `show_date` per side.
  // Both sit beyond the chips at the innermost edge of their side
  // (rightmost on `left`, leftmost on `right`). Order from outermost to
  // innermost: chips → date → clock. So when a side enables both, the
  // time is closest to the centre of the strip (the primary station-
  // board info), with the supporting date one slot further out.
  // Suppressed if server_time hasn't arrived yet (no "NaN:NaN" while the
  // integration warms up) or the user's format string evaluates empty.
  const clockText = side.show_clock ? formatClock(serverTime) : null;
  const clockNode = clockText
    ? html`<span
        class="retro-station-header__chip retro-station-header__chip--clock"
      >
        <ha-icon
          class="retro-station-header__chip-icon"
          icon="mdi:clock-outline"
        ></ha-icon>
        <span>${clockText}</span>
      </span>`
    : nothing;
  const dateText = side.show_date
    ? formatDateChip(serverTime, side.date_format ?? "d.m.Y", lang)
    : null;
  // Date chip — text-only, no leading icon. The calendar glyph fought
  // the chip's signage-label voice (it read more like a UI element than
  // part of the sign); plain text matches the user-provided chips in the
  // same lane. The clock chip keeps its icon because the icon there reads
  // as the station-clock symbol, not a UI affordance.
  const dateNode = dateText
    ? html`<span
        class="retro-station-header__chip retro-station-header__chip--date"
        >${dateText}</span
      >`
    : nothing;
  // Canonical render order mirrors the original signage. Right side
  // mirrors the left: exit always at the outer edge of the card,
  // amenities ordered so the *same* glyph (elevator) is always closest to
  // the text on both sides — wheelchair-relevant info gets the same
  // visual prominence regardless of header side. Mirror invariant for
  // extra_icons + chips: index 0 of either array sits closest to the WC
  // tile on both sides. Date and clock chips sit at the innermost edge:
  // date one slot out, clock at the very edge so time stays closest to
  // the centre.
  return pos === "left"
    ? html`${exitNode}${textNode}${elv}${esc}${wc}${mdiTileNodes}${chipNodes}${dateNode}${clockNode}`
    : html`${clockNode}${dateNode}${chipsRightOrder}${mdiTilesRightOrder}${wc}${esc}${elv}${textNode}${exitNode}`;
}

/** Render the black header strip above the orange/cream station band.
 *  Returns `nothing` when neither side is configured, so a card with no
 *  `header_left` / `header_right` in YAML is byte-identical to its
 *  pre-header behaviour.
 *
 *  Per-side render order — amenity order is mirrored so the same glyph
 *  always sits the same distance from the station name on both sides:
 *  elevator nearest the text, then escalator, then WC:
 *   - LEFT:  [exit] [text] [Elevator] [Escalator] [WC] …
 *   - RIGHT: … [WC] [Escalator] [Elevator] [text] [exit]
 *
 *  `t` is the card's flat-key translate callback; `lang` is the HA
 *  language for the date chip's locale-aware tokens. */
export function renderStationHeader(opts: {
  left: RetroHeaderSide | undefined;
  right: RetroHeaderSide | undefined;
  serverTime: string | null | undefined;
  t: (key: string) => string;
  lang: string | undefined;
}): TemplateResult | typeof nothing {
  const { left, right, serverTime, t, lang } = opts;
  if (!left && !right) return nothing;
  return html`
    <div class="retro-station-header" role="group">
      <div class="retro-station-header__side retro-station-header__side--left">
        ${left ? renderHeaderSide(left, "left", serverTime, t, lang) : nothing}
      </div>
      <div class="retro-station-header__side retro-station-header__side--right">
        ${right
          ? renderHeaderSide(right, "right", serverTime, t, lang)
          : nothing}
      </div>
    </div>
  `;
}
