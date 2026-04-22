// Realtime minus planned, in minutes. Returns null when either value is
// missing or when the realtime timestamp doesn't parse. Upstream occasionally
// emits equal time_real / time_planned even when no delay — we still report 0
// in that case so the caller can decide whether to label it.
export function delayMinutes(
  timePlanned: string | null | undefined,
  timeReal: string | null | undefined,
): number | null {
  if (!timePlanned || !timeReal) return null;
  const planned = Date.parse(timePlanned);
  const real = Date.parse(timeReal);
  if (!Number.isFinite(planned) || !Number.isFinite(real)) return null;
  return Math.round((real - planned) / 60_000);
}

// Format an ISO string with the browser's locale; falls back to the raw
// string on parse failure so upstream-injected oddities don't crash render.
export function formatTime(iso: string | null | undefined, lang = "de"): string {
  if (!iso) return "";
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return iso;
  try {
    return new Date(ts).toLocaleString(lang === "en" ? "en-GB" : "de-AT", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return iso;
  }
}
