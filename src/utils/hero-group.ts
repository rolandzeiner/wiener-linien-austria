// Which departures go in the modern card's hero block, and which fall
// through to the row list beneath it.
//
// Extracted from the card's render path so it can be unit tested — it
// decides the most prominent thing on the card, so it is worth pinning.

import type { DepartureAttr } from "../types.js";

function countdownOf(d: DepartureAttr): number {
  return Number.isFinite(d.countdown) ? d.countdown : Number.POSITIVE_INFINITY;
}

/**
 * The departures sharing the soonest countdown — the hero group.
 *
 * Two edge cases carry real behaviour:
 * - When anything is already due or overdue (countdown <= 0), the hero is
 *   EVERY such departure, not just the soonest. Two trams both at the
 *   platform both belong in the hero.
 * - When no departure has a usable countdown, the first is surfaced
 *   anyway rather than showing an empty hero — the caller has already
 *   guaranteed there is at least one.
 */
export function computeHeroGroup(filtered: DepartureAttr[]): DepartureAttr[] {
  if (filtered.length === 0) return [];

  const minCd = Math.min(...filtered.map(countdownOf));
  if (!Number.isFinite(minCd)) return [filtered[0]!];
  if (minCd <= 0) return filtered.filter((d) => countdownOf(d) <= 0);
  return filtered.filter((d) => countdownOf(d) === minCd);
}

export interface HeroSplit {
  heroGroup: DepartureAttr[];
  /** The single departure the hero metric leads with, if any. */
  heroLead: DepartureAttr | undefined;
  /** Rows for the list below the hero, already capped. */
  rows: DepartureAttr[];
}

/**
 * Split a filtered feed into the hero block and the row list.
 *
 * With the hero metric off, nothing is removed from the row list — the
 * hero group is still computed (callers may still want the lead) but the
 * rows show everything, because there is no hero above them duplicating
 * it. The dedupe relies on object identity, which holds because
 * `computeHeroGroup` returns references into the same array.
 */
export function splitHeroAndRows(
  filtered: DepartureAttr[],
  opts: { showHeroMetric: boolean; maxDepartures: number },
): HeroSplit {
  const heroGroup = computeHeroGroup(filtered);
  const dedupe = opts.showHeroMetric
    ? new Set<DepartureAttr>(heroGroup)
    : new Set<DepartureAttr>();
  const remaining = filtered.filter((d) => !dedupe.has(d));
  return {
    heroGroup,
    heroLead: heroGroup[0],
    rows: remaining.slice(0, opts.maxDepartures),
  };
}
