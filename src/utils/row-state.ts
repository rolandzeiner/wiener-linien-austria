// Per-row view state for the modern card.
//
// Extracted from `_renderRow` for the same reason as utils/retro-view.ts:
// the decisions a row makes — due now, late, flag strip — were tangled into
// the template and could not be tested. The label text stays in the card,
// because it needs the translate callback; everything here is
// language-independent.

import { delayMinutes } from "./time.js";
import type { DepartureAttr } from "../types.js";

/** Countdown colour state. `""` means "no special state". */
export type CountdownState = "now" | "late" | "early" | "";

export interface RowState {
  /** Countdown in minutes, or null when the feed reported no usable one. */
  countdown: number | null;
  /** Signed delay in minutes — positive is late, negative early. */
  signedDelay: number | null;
  cdState: CountdownState;
  /** Whether the row renders a flag strip (jam / step-free / cooled). */
  hasFlags: boolean;
  /** Platform to show on this row, or null. */
  platform: string | null;
}

export interface RowStateOptions {
  /** Gates the late/early colours only — never `now`. */
  showDelayColors: boolean;
  showAccessibility: boolean;
  showCooling: boolean;
  showPlatform: boolean;
}

export function deriveRowState(
  d: DepartureAttr,
  opts: RowStateOptions,
): RowState {
  const countdown = Number.isFinite(d.countdown) ? d.countdown : null;

  // Computed independently of `show_delay` so the state colours still
  // light up when the verbose "1 Minute verspätet" text is switched off.
  const signedDelay = delayMinutes(d.time_planned, d.time_real);

  // `now` outranks late/early: a departure at the platform is announced
  // as here, not as late. `showDelayColors` gates late/early only —
  // `now` is the line's own accent, not a schedule-deviation signal, so
  // it survives with the colours off.
  let cdState: CountdownState = "";
  if (countdown !== null && countdown <= 0) cdState = "now";
  else if (!opts.showDelayColors || signedDelay === null) cdState = "";
  else if (signedDelay >= 1) cdState = "late";
  else if (signedDelay <= -1) cdState = "early";

  const hasFlags = Boolean(
    d.traffic_jam ||
      (opts.showAccessibility && d.barrier_free) ||
      (opts.showCooling && d.cooling),
  );

  return {
    countdown,
    signedDelay,
    cdState,
    hasFlags,
    platform: opts.showPlatform && d.platform ? String(d.platform) : null,
  };
}
