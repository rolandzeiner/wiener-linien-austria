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

// PHP-style date formatter — supports the subset of date() tokens the
// retro card header chip exposes. Locale-aware weekday / month names
// route through Intl so a user picking `l` ("Monday" in English /
// "Montag" in German) gets the right form for their HA language.
//
// Supported tokens (kept narrow on purpose — the chip is a tiny
// signage element, not a full Intl wrapper):
//   d - 01..31         j - 1..31
//   m - 01..12         n - 1..12
//   Y - 2026           y - 26
//   D - Mon..Sun       l - Monday..Sunday    (locale)
//   M - Jan..Dec       F - January..December (locale)
//   H - 00..23         G - 0..23
//   h - 01..12         g - 1..12
//   i - 00..59         s - 00..59
//   \X - literal X (escape: backslash passes the next char through)
// Any other character is emitted as-is, so separators (".", " ",
// "/", "," etc.) and literal words pass through naturally.
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(date: Date, format: string, lang = "de"): string {
  if (!format) return "";
  const locale = lang === "en" ? "en-GB" : "de-AT";
  const weekdayLong = (): string => date.toLocaleDateString(locale, { weekday: "long" });
  const weekdayShort = (): string => date.toLocaleDateString(locale, { weekday: "short" });
  const monthLong = (): string => date.toLocaleDateString(locale, { month: "long" });
  const monthShort = (): string => date.toLocaleDateString(locale, { month: "short" });
  let result = "";
  let i = 0;
  while (i < format.length) {
    const c = format[i];
    // Backslash escape — emit the next character literally.
    if (c === "\\" && i + 1 < format.length) {
      result += format[i + 1];
      i += 2;
      continue;
    }
    switch (c) {
      case "d": result += pad2(date.getDate()); break;
      case "j": result += String(date.getDate()); break;
      case "D": result += weekdayShort(); break;
      case "l": result += weekdayLong(); break;
      case "m": result += pad2(date.getMonth() + 1); break;
      case "n": result += String(date.getMonth() + 1); break;
      case "M": result += monthShort(); break;
      case "F": result += monthLong(); break;
      case "Y": result += String(date.getFullYear()); break;
      case "y": result += pad2(date.getFullYear() % 100); break;
      case "H": result += pad2(date.getHours()); break;
      case "G": result += String(date.getHours()); break;
      case "h": result += pad2(((date.getHours() + 11) % 12) + 1); break;
      case "g": result += String(((date.getHours() + 11) % 12) + 1); break;
      case "i": result += pad2(date.getMinutes()); break;
      case "s": result += pad2(date.getSeconds()); break;
      default: result += c ?? "";
    }
    i++;
  }
  return result;
}
