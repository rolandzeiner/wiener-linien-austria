// Shared render helpers used by BOTH bundled cards (modern + retro).
// Extracted so the version-banner + the WS card-version probe live in
// one place — each card stays focused on its own rendering rather than
// carrying its own copy of the integration-upgrade plumbing. Each card
// passes its own WS probe `type` string and bundle version so the two
// banners don't cross-fire when both cards sit on the same dashboard.
//
// Conventions:
// - Pure functions: no `this`, take what they need as arguments,
//   return a TemplateResult or a Promise. Each card keeps its own
//   reactive state (@state _versionMismatch) and calls these helpers
//   from connectedCallback() / render().
// - Localisation goes through the card's flat-key translate callback
//   so the helper does not own a hidden module-level language state.

import { html, nothing, type TemplateResult } from "lit";
import type { HomeAssistant } from "./types.js";

/**
 * Probe the backend's card-version WebSocket command. Returns the
 * server-reported version when it differs from the bundled version
 * (i.e. banner should appear), or null otherwise. Silent on transport
 * error — older HA installs without the handler simply don't surface a
 * mismatch, which is correct (cache-buster URL still applies).
 */
export async function checkCardVersionWS(
  hass: HomeAssistant | undefined,
  type: string,
  bundleVersion: string,
): Promise<string | null> {
  if (!hass?.callWS) return null;
  try {
    const r = await hass.callWS<{ version?: string }>({ type });
    if (r?.version && r.version !== bundleVersion) return r.version;
  } catch {
    // Silent: older backend without the WS handler.
  }
  return null;
}

/**
 * Best-effort cache-storage wipe followed by a hard reload. The reload
 * picks up the freshly-cached JS bundle so the version-mismatch banner
 * clears on next mount. Stamps a sessionStorage flag BEFORE reloading
 * so the next mount can detect a stuck-reload loop (Service Worker /
 * CDN refusing to invalidate) and short-circuit instead of looping the
 * banner forever — see `wasReloadAttemptedFor` below.
 */
export function reloadAfterCacheWipe(forVersion?: string | null): void {
  try {
    window.caches?.keys?.().then((keys) => {
      keys.forEach((k) => window.caches?.delete?.(k));
    });
  } catch {
    // best-effort cache wipe
  }
  if (forVersion) {
    try {
      window.sessionStorage?.setItem(
        `wl-reload-attempted-${forVersion}`,
        "1",
      );
    } catch {
      // sessionStorage may be disabled (Safari private mode etc.) —
      // fall through; worst case the user gets the regular reload
      // banner twice instead of the stuck-state branch.
    }
  }
  window.location.reload();
}

/**
 * Did the user already click reload for this exact mismatch in the
 * current tab session? When true, the banner should switch from
 * "Reload" to a stuck-state message (caches/Service Worker/CDN won't
 * invalidate; reloading again will just loop). sessionStorage survives
 * page reloads in the same tab but clears when the tab closes, which
 * is the right scope: after closing and reopening, the user gets a
 * fresh reload attempt.
 */
export function wasReloadAttemptedFor(version: string | null): boolean {
  if (!version) return false;
  try {
    return (
      window.sessionStorage?.getItem(`wl-reload-attempted-${version}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

/**
 * Render the version-mismatch banner. Returns the lit `nothing` sentinel
 * when there is no mismatch so call sites can splat it unconditionally
 * into their template.
 *
 * `t` is the card's flat-key translate callback — the `version_update`
 * string carries a `{v}` placeholder; this helper substitutes it inline.
 * Localisation strings stay in each card's bundle, not in this module.
 *
 * `className` defaults to "banner" (modern card); pass "retro-banner"
 * for the retro card so its styled CSS class still matches.
 */
export function renderVersionBanner(
  mismatch: string | null,
  t: (key: string) => string,
  className = "banner",
): TemplateResult | typeof nothing {
  if (!mismatch) return nothing;
  // Stuck-reload anti-loop: if the user already clicked reload for
  // this exact mismatch in the current tab session and the mismatch
  // is STILL present, the cache invalidation didn't take effect
  // (Service Worker, aggressive CDN, or a browser ignoring the
  // versioned URL). Surface a "stuck" state instead of a second
  // reload button so the banner can't loop indefinitely.
  if (wasReloadAttemptedFor(mismatch)) {
    const stuckMsg = t("version_reload_stuck");
    return html`
      <div class=${className} role="alert" aria-live="assertive">
        <span>${stuckMsg}</span>
      </div>
    `;
  }
  const updateMsg = t("version_update").replace("{v}", mismatch);
  const reloadLabel = t("version_reload");
  return html`
    <div class=${className} role="alert" aria-live="assertive">
      <span>${updateMsg}</span>
      <button
        type="button"
        aria-label=${reloadLabel}
        @click=${() => reloadAfterCacheWipe(mismatch)}
      >
        ${reloadLabel}
      </button>
    </div>
  `;
}
