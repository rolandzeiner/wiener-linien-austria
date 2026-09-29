// View-state derivation for the retro card.
//
// The retro card's `render()` derived what to show and then drew it. This
// module owns the first half: given a normalised config and the sensor's
// attributes, work out which departures are visible and how the platform
// column resolves. Pure, so unlike the template it is unit tested.
//
// Translation stays with the card: this returns the platform label's
// translation KEY, not a translated string, so the module has no
// dependency on the card's `_t()` or on the active language.

import { LINE_TYPE_METRO } from "./mot.js";
import { filterDepartures } from "./departures.js";
import { canonicalLineLabel } from "./line-labels.js";
import { ROW_CAP } from "./card-vocabulary.js";
import type { DepartureAttr, WienerLinienAttrs } from "../types.js";
import { retroDirectionFilter, type NormalisedRetroConfig } from "./config.js";

export interface RetroView {
  /** Departures the panel will paint, already filtered and capped. */
  rows: DepartureAttr[];
  /** Every departure passing the filters, uncapped. With no line
   *  configured, the station-name band tints from its first entry. */
  matching: DepartureAttr[];
  /** The unfiltered feed, as the sensor reported it. */
  departures: DepartureAttr[];
  /** Platform to show, or null when there is none or the user hid it. */
  platform: string | null;
  /** Whether the GLEIS/STEIG column sits on the left. */
  gleisLeft: boolean;
  /** Translation key for the platform caption — "gleis" for metro
   *  (U-Bahn platforms are Gleise), "steig" for everything else. */
  platformLabelKey: "gleis" | "steig";
  /** Station name for the orange band, or "" when unknown. */
  stopName: string;
}

export function deriveRetroView(
  cfg: NormalisedRetroConfig,
  attrs: WienerLinienAttrs,
): RetroView {
  const departures = Array.isArray(attrs.departures) ? attrs.departures : [];

  const matching = filterDepartures(departures, {
    direction: retroDirectionFilter(cfg.direction),
    lines: cfg.lines,
    line_directions: cfg.line_directions,
    walk_times: cfg.walk_times,
    accessibility_only: cfg.accessibility_only,
  });
  // The LED panel's layout is built for exactly two rows, so this cap is a
  // constant rather than a config key — named in card-vocabulary alongside
  // modern's `max_departures` and flap's `max_rows`.
  const rows = matching.slice(0, ROW_CAP.retro);

  const rawPlatform = rows.find((d) => d.platform)?.platform ?? null;
  const platform = cfg.show_platform ? rawPlatform : null;

  // Side resolution: an explicit user override wins over the auto rule
  // (platform "2" lands on the left, else right — the U-Bahn signage
  // convention). "auto" preserves pre-feature behaviour; "left" / "right"
  // let users mirror a real-station view that disagrees with the
  // heuristic (e.g. a tram stop whose published platform is "1" but the
  // user wants the GLEIS column left, matching the next card along).
  let gleisLeft: boolean;
  switch (cfg.platform_side) {
    case "left":
      gleisLeft = true;
      break;
    case "right":
      gleisLeft = false;
      break;
    default:
      gleisLeft = platform === "2";
  }

  const isMetro = (rows[0]?.type ?? "") === LINE_TYPE_METRO;

  return {
    rows,
    matching,
    departures,
    platform,
    gleisLeft,
    platformLabelKey: isMetro ? "gleis" : "steig",
    stopName: attrs.stop_name || attrs.friendly_name || "",
  };
}

/** Translation key for an empty board, so the user knows whether to flip
 *  direction, drop the line filter, or just wait for data. */
export function retroEmptyStateKey(
  cfg: NormalisedRetroConfig,
  allDepartures: readonly DepartureAttr[],
  serverTime: string | null | undefined,
  staleDropped: number,
): string {
  if (allDepartures.length === 0) {
    // Upstream froze: records arrived but had stopped advancing, so the
    // coordinator dropped them. Checked before end-of-service — both look
    // like "nothing left at this stop" from here, and calling a frozen feed
    // Betriebsschluss is the bug in #103. A stop the API still answers for
    // (server_time present) with nothing left is end-of-service, not an
    // outage.
    if (staleDropped > 0) return "stale_feed";
    return serverTime ? "betriebsschluss" : "no_data";
  }
  // Diagnose against the picked lines only: another line running at the
  // stop says nothing about why these are missing. Canonicalised the way
  // filterDepartures does, so a legacy "LB" still finds the WLB.
  const picked = cfg.lines?.length ? new Set(cfg.lines.map(canonicalLineLabel)) : null;
  const onLine = picked ? allDepartures.filter((d) => picked.has(d.line)) : allDepartures;
  if (onLine.length === 0) return "no_data_wrong_line";
  // Each line's own direction wins, then the stop-wide one. "both" sets no
  // stop-wide direction, so it is never compared against d.direction.
  const stopWide = cfg.direction === "both" ? undefined : cfg.direction;
  const anyInDirection = onLine.some((d) => {
    const want = cfg.line_directions?.[d.line] ?? stopWide;
    return !want || d.direction === want;
  });
  return anyInDirection ? "no_data" : "no_data_wrong_direction";
}
