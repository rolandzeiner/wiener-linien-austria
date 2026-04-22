export function escHtml(s: unknown): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Wiener-Linien upstream traffic-info payloads contain short hand-authored
// HTML — the only permitted tag is <br> for line breaks. Escape everything,
// then re-permit <br>. No <a>, no <b>, no attributes; prevents XSS via
// upstream payload manipulation.
export function safeTrafficHtml(raw: unknown): string {
  return escHtml(raw).replace(/&lt;br\s*\/?&gt;/gi, "<br>");
}
