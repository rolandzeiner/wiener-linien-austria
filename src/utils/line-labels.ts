// Line labels where Wiener Linien's static catalogue and its realtime
// `/monitor` feed disagree about the same line. Mirrors
// `LEGACY_LINE_LABELS` in `custom_components/wiener_linien_austria/const.py`;
// test_legacy_line_labels_match_python_and_ts pins the two copies together.
//
// The integration normalises everything it publishes, so live data always
// carries the realtime spelling. This map exists for the other direction:
// a saved card config whose `lines:` was picked before v2.0.1 still names
// the Badner Bahn "LB", and filtering live "WLB" departures against it
// leaves the board empty (issue #110).
const LEGACY_LINE_LABELS: Readonly<Record<string, string>> = {
  LB: "WLB",
  "25BR": "25B",
};

/** Map a configured line label onto the spelling live departures use.
 *  Anything not in the table passes through untouched. */
export function canonicalLineLabel(label: string): string {
  return LEGACY_LINE_LABELS[label] ?? label;
}
