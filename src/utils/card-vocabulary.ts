// Shared config vocabulary for the three cards.
//
// WHY THIS FILE EXISTS
//
// Each card has its own normaliser, and each normaliser used to declare
// its own defaults independently. That made a disagreement between two
// cards invisible from inside either one — you could only see it by
// reading all three side by side. It is not a hypothetical failure mode:
// `line_pill` shipped for several versions meaning "show a pill" on the
// retro card and "hide an entire column" on the flap card, one key with
// opposite effects on two cards of the same integration.
//
// So every concept more than one card exposes is declared HERE, with each
// card's value next to its sibling's. Changing a default is then a diff in
// this file where the other card's value is on the adjacent line, rather
// than a one-line edit in a normaliser 300 lines away from its sibling.
//
// The divergences below are DELIBERATE. Each is annotated with why. This
// file documents what is, not what ought to be — do not "harmonise" a pair
// without an explicit decision, because every default here is load-bearing
// for existing installs: changing one silently restyles every dashboard
// that already uses that card.
//
// The matching assertions live in utils/flap-config.test.ts
// ("cross-card config vocabulary"), so a change here fails a test that
// names the other card.
//
// ---------------------------------------------------------------------
// DELIBERATE DIVERGENCES THAT ARE NOT DEFAULTS
//
// Some differences are structural rather than a value in the table below,
// and are recorded here so a future reader stops re-discovering them as
// bugs:
//
// - Direction. Modern and flap can show BOTH directions (`direction`
//   unset). The retro card cannot: `normaliseRetroConfig` coerces to
//   "H" | "R" with no third state, and the editor's shared stop block
//   no-ops its "both" option to match. The LED panel renders one
//   direction by design.
// - Row cap. Modern exposes `max_departures` (default 6), flap exposes
//   `max_rows` (default 2), and retro exposes nothing at all — it is
//   fixed at ROW_CAP.retro below. Three names for one idea; retro's is a
//   constant because the LED panel's layout is built for exactly two rows.
// - Line filter. Retro takes a single `line`; modern and flap take a
//   `lines` array per stop. Retro is a single-stop, single-line card.
// - Attribution. Modern and flap render a CC-BY footer gated by
//   `hide_attribution`. The retro card renders none and has no key for
//   it. This one is a known gap, not a deliberate divergence.
// - Visibility polarity. Modern words its toggles as `hide_*`
//   (`hide_header`, `hide_attribution`); retro and flap use `show_*`.
//   Flap carries both. Frozen: renaming any of them breaks saved YAML.

import type { FlapSize, FlapStationBg, RetroSize, RetroStationBg } from "../types.js";

interface CardDefault<R, F> {
  /** The retro card's value. */
  retro: R;
  /** The flap card's value. */
  flap: F;
}

/** Per-card defaults for every concept more than one card exposes.
 *  Read by the normalisers — these are the live values, not a copy. */
export const CARD_DEFAULTS: {
  show_station_name: CardDefault<boolean, boolean>;
  housing: CardDefault<boolean, boolean>;
  size: CardDefault<RetroSize, FlapSize>;
  unit_caption: CardDefault<boolean, boolean>;
  station_bg: CardDefault<RetroStationBg, FlapStationBg>;
  show_platform: CardDefault<boolean, boolean>;
} = {
  // The WL-orange station-name band. Same key, same meaning, opposite
  // default: the band is part of the Solari board's identity, while the
  // LED panel shipped without one and existing cards must stay that way.
  show_station_name: { retro: false, flap: true },

  // Bezel / cabinet around the display. Same key, same meaning
  // (off = flush, on = bezel), opposite default: the flap card's cream
  // cabinet is its original look, the retro panel's is flush.
  housing: { retro: false, flap: true },

  // Same three-value enum on both cards, different default — and the flap
  // editor additionally relabels "small" as "Normal" and "regular" as
  // "Groß", so the same enum value reads differently in the two editors.
  size: { retro: "regular", flap: "small" },

  // The "min" caption after a countdown. SAME CONCEPT, DIFFERENT KEY:
  // retro calls it `show_unit`, flap calls it `show_min_unit` — and the
  // defaults are opposite too. The LED board's canonical voice is digits
  // only; the split-flap board captions its countdown.
  unit_caption: { retro: false, flap: true },

  // Same key, but the "use the sensible default" sentinel is spelled
  // differently, and the two enums are not the same set: retro offers
  // "default" | "white" | "black", flap offers "line" | "white" |
  // "black" | "line:<X>" where the line variants resolve against the
  // live GTFS palette.
  station_bg: { retro: "default", flap: "line" },

  // One of the few that genuinely agree. Kept here so it stays that way.
  show_platform: { retro: true, flap: true },
};

/** Rows rendered by each card. Retro exposes no config key — the LED
 *  panel's layout is built for exactly two rows — so its cap lives here
 *  rather than as a bare `slice(0, 2)` in the render path. */
export const ROW_CAP: { retro: number } = { retro: 2 };
