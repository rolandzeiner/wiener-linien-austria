// Scroll geometry for the modern card's tab strip.
//
// The strip scrolls sideways when its stop names don't fit. Kept pure so the
// decisions (is there more to the start / end, where to scroll to reveal a
// tab) can be tested without a layout engine; the card only feeds in the
// numbers it reads off the DOM.
//
// All positions are in the inline direction as a start offset, which is what
// `scrollLeft` is in a left-to-right strip. Right-to-left strips report a
// negative `scrollLeft` in current browsers; the card passes its absolute
// value, so the same maths holds with "start" meaning the right-hand side.

/** Sub-pixel slack: fractional `scrollLeft` values at the ends would
 *  otherwise leave an arrow showing with nothing left to scroll. */
const EDGE_SLACK_PX = 1;

export interface TabEdges {
  /** Tabs are hidden before the visible part of the strip. */
  start: boolean;
  /** Tabs are hidden after it. */
  end: boolean;
}

export function tabEdges(
  scrollStart: number,
  clientWidth: number,
  scrollWidth: number,
): TabEdges {
  const offset = Math.abs(scrollStart);
  return {
    start: offset > EDGE_SLACK_PX,
    end: offset + clientWidth < scrollWidth - EDGE_SLACK_PX,
  };
}

/**
 * The scroll offset that brings a tab fully into view, or null when it
 * already is.
 *
 * `inset` keeps the tab clear of the edge fade and the arrow sitting in it,
 * so a revealed tab reads in full rather than half-faded. Near either end of
 * the strip the target is clamped, and the first and last tabs land flush.
 */
export function revealOffset(
  tabStart: number,
  tabWidth: number,
  scrollStart: number,
  clientWidth: number,
  scrollWidth: number,
  inset: number,
): number | null {
  const max = Math.max(0, scrollWidth - clientWidth);
  const clamp = (value: number): number => Math.min(max, Math.max(0, value));
  if (tabStart - inset < scrollStart) {
    const target = clamp(tabStart - inset);
    return target === scrollStart ? null : target;
  }
  const tabEnd = tabStart + tabWidth;
  if (tabEnd + inset > scrollStart + clientWidth) {
    const target = clamp(tabEnd + inset - clientWidth);
    return target === scrollStart ? null : target;
  }
  return null;
}

/** How far one arrow press moves the strip: most of a view, so the tab
 *  that was cut off at the edge stays in sight as a landmark. */
export function arrowStep(clientWidth: number): number {
  return Math.max(48, Math.round(clientWidth * 0.7));
}
