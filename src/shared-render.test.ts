// @vitest-environment happy-dom

// The stale-cache reload machinery. Worth testing out of proportion to its
// size: the failure mode is an infinite reload loop in the user's browser.
// The card compares its bundled CARD_VERSION against the backend's over
// WebSocket, shows a banner on mismatch, and the banner's button wipes the
// cache and reloads. If the reload does not fix the mismatch — a Service
// Worker, a CDN, a proxy that will not revalidate — the banner comes back
// and the user is one click from doing it forever. `wasReloadAttemptedFor`
// is the guard that turns the second pass into a stuck-state message
// instead of a second reload button, and nothing else in the suite touched
// it.

import { render } from "lit";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

import {
  checkCardVersionWS,
  reloadAfterCacheWipe,
  renderVersionBanner,
  wasReloadAttemptedFor,
} from "./shared-render.js";
import type { HomeAssistant } from "./types.js";

const t = (key: string): string =>
  ({
    version_update: "New version {v} available",
    version_reload: "Reload",
    version_reload_stuck: "Still stale after reloading",
  })[key] ?? key;

let host: HTMLElement;

beforeEach(() => {
  window.sessionStorage.clear();
  document.body.innerHTML = "";
  host = document.createElement("div");
  document.body.appendChild(host);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const draw = (mismatch: string | null): HTMLElement => {
  render(renderVersionBanner(mismatch, t), host);
  return host;
};

describe("checkCardVersionWS", () => {
  it("returns null when the backend agrees with the bundle", async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ version: "2.0.0" }),
    } as unknown as HomeAssistant;
    expect(await checkCardVersionWS(hass, "x/card_version", "2.0.0")).toBeNull();
  });

  it("returns the backend version on a mismatch", async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ version: "2.1.0" }),
    } as unknown as HomeAssistant;
    expect(await checkCardVersionWS(hass, "x/card_version", "2.0.0")).toBe(
      "2.1.0",
    );
  });

  it("stays silent when the backend has no handler", async () => {
    // An older HA install without the WS command must not surface a
    // mismatch — the `?v=` cache-buster still applies, and a banner here
    // would be permanent because nothing can ever clear it.
    const hass = {
      callWS: vi.fn().mockRejectedValue(new Error("unknown command")),
    } as unknown as HomeAssistant;
    expect(await checkCardVersionWS(hass, "x/card_version", "2.0.0")).toBeNull();
  });

  it("stays silent without hass or without callWS", async () => {
    expect(await checkCardVersionWS(undefined, "x", "2.0.0")).toBeNull();
    expect(
      await checkCardVersionWS({} as HomeAssistant, "x", "2.0.0"),
    ).toBeNull();
  });
});

describe("the reload-attempt guard", () => {
  it("reports nothing attempted for a null version", () => {
    expect(wasReloadAttemptedFor(null)).toBe(false);
  });

  it("remembers an attempt per exact version", () => {
    window.sessionStorage.setItem("wl-reload-attempted-2.1.0", "1");
    expect(wasReloadAttemptedFor("2.1.0")).toBe(true);
    // A different mismatch is a fresh problem and gets a fresh attempt.
    expect(wasReloadAttemptedFor("2.2.0")).toBe(false);
  });

  it("degrades to false when sessionStorage throws", () => {
    // Safari private mode and friends. Worst case the user sees the
    // reload banner twice, which is strictly better than the card
    // throwing on every render.
    //
    // Swap the whole object rather than spying on `getItem`. happy-dom backs
    // Storage with a Proxy, and `vi.restoreAllMocks()` does not reliably
    // unwind a spy installed on it: the throwing stub leaked into the two
    // `wl-reload-attempted` tests below, which then read a storage that always
    // throws and saw the flag as unset. It reproduced on Node 24 (what CI
    // runs) and not on Node 26, so a green local run proved nothing. Swapping
    // the binding is the same idiom this file already uses for
    // `window.location`, and `finally` restores it whether or not the
    // assertion holds.
    const real = window.sessionStorage;
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      },
    });
    try {
      expect(wasReloadAttemptedFor("2.1.0")).toBe(false);
    } finally {
      Object.defineProperty(window, "sessionStorage", {
        configurable: true,
        value: real,
      });
    }
  });
});

describe("renderVersionBanner", () => {
  it("renders nothing when there is no mismatch", () => {
    expect(draw(null).childElementCount).toBe(0);
  });

  it("offers a reload button on the first mismatch", () => {
    const el = draw("2.1.0");
    const button = el.querySelector("button");
    expect(button).not.toBeNull();
    expect(el.textContent).toContain("New version 2.1.0 available");
  });

  it("switches to the stuck state once a reload was already tried", () => {
    // The whole point of the guard: a second reload button here is an
    // invitation to loop.
    window.sessionStorage.setItem("wl-reload-attempted-2.1.0", "1");
    const el = draw("2.1.0");
    expect(el.querySelector("button")).toBeNull();
    expect(el.textContent).toContain("Still stale after reloading");
  });

  it("announces itself assertively either way", () => {
    for (const attempted of [false, true]) {
      window.sessionStorage.clear();
      if (attempted) {
        window.sessionStorage.setItem("wl-reload-attempted-2.1.0", "1");
      }
      const banner = draw("2.1.0").querySelector("[role=alert]");
      expect(banner).not.toBeNull();
      expect(banner!.getAttribute("aria-live")).toBe("assertive");
    }
  });

  it("takes a card-specific class so retro styling still matches", () => {
    render(renderVersionBanner("2.1.0", t, "retro-banner"), host);
    expect(host.querySelector(".retro-banner")).not.toBeNull();
  });
});

describe("reloadAfterCacheWipe", () => {
  it("stamps the flag before reloading, so the next mount sees it", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });

    reloadAfterCacheWipe("2.1.0");

    expect(wasReloadAttemptedFor("2.1.0")).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });

  it("still reloads when no version is supplied", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });

    reloadAfterCacheWipe();

    expect(reload).toHaveBeenCalledOnce();
  });
});
