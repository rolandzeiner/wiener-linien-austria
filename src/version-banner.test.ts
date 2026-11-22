// @vitest-environment happy-dom
// Canonical copy: ~/.claude/skills/ha-lovelace-card/assets/src/version-banner.test.ts.
// Ships byte for byte with src/version-banner.ts; never edit it in a repo.
import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { versionBanner } from "./version-banner";

type Listener = () => void;

interface FakeHass {
  callWS: ReturnType<typeof vi.fn>;
  connection: {
    addEventListener: (event: string, listener: Listener) => void;
    ready: () => void;
  };
  locale: { language: string };
  language: string;
}

// Every test gets its own domain and connection: the banner keeps its
// answers per connection and its announcements per page, on purpose.
let counter = 0;
function domain(): string {
  counter += 1;
  return `acme_${counter}`;
}

function fakeHass(server: string | Error, language = "en"): FakeHass {
  const listeners: Listener[] = [];
  return {
    callWS: vi.fn(() =>
      server instanceof Error ? Promise.reject(server) : Promise.resolve({ version: server }),
    ),
    connection: {
      addEventListener: (event, listener) => {
        if (event === "ready") listeners.push(listener);
      },
      ready: () => {
        for (const listener of listeners) listener();
      },
    },
    locale: { language },
    language,
  };
}

const roots: HTMLElement[] = [];

function mount(hass: FakeHass | undefined, dom: string, preview = false): HTMLElement {
  const root = document.createElement("div");
  document.body.append(root);
  roots.push(root);
  render(
    versionBanner(hass, { domain: dom, version: "1.0.0", name: "Acme Energy", preview }),
    root,
  );
  return root;
}

function banner(root: HTMLElement): HTMLElement & { updateComplete: Promise<boolean> } {
  const el = root.querySelector("rz-version-banner-r1");
  if (!el) throw new Error("no banner element");
  return el;
}

async function settle(
  root: HTMLElement,
): Promise<HTMLElement & { updateComplete: Promise<boolean> }> {
  const el = banner(root);
  for (let i = 0; i < 3; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await el.updateComplete;
  }
  return el;
}

function text(el: HTMLElement): string {
  return el.shadowRoot?.querySelector(".message")?.textContent?.trim() ?? "";
}

function button(el: HTMLElement): HTMLButtonElement {
  const b = el.shadowRoot?.querySelector("button");
  if (!b) throw new Error("no button");
  return b;
}

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  for (const root of roots.splice(0)) root.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("version banner", () => {
  it("stays hidden and empty when the versions match", async () => {
    const el = await settle(mount(fakeHass("1.0.0"), domain()));
    expect(el.hidden).toBe(true);
    expect(el.shadowRoot?.querySelector(".banner")).toBeNull();
  });

  it("names the integration and the installed version on a mismatch", async () => {
    const dom = domain();
    const hass = fakeHass("1.1.0");
    const el = await settle(mount(hass, dom));
    expect(hass.callWS).toHaveBeenCalledWith({ type: `${dom}/card_version` });
    expect(el.hidden).toBe(false);
    expect(text(el)).toBe("Acme Energy 1.1.0 is installed. Reload the page to finish the update.");
    expect(button(el).textContent?.trim()).toBe("Reload");
    expect(el.shadowRoot?.querySelector(".banner")?.getAttribute("lang")).toBe("en");
  });

  it("speaks German for a German profile and follows a language switch", async () => {
    const hass = fakeHass("1.1.0", "de-AT");
    const root = mount(hass, domain());
    const el = await settle(root);
    expect(text(el)).toBe(
      "Acme Energy 1.1.0 ist installiert. Lade die Seite neu, um das Update abzuschließen.",
    );
    expect(button(el).textContent?.trim()).toBe("Neu laden");
    (el as unknown as { hass: FakeHass }).hass = {
      ...hass,
      locale: { language: "en" },
      language: "en",
    };
    await el.updateComplete;
    expect(button(el).textContent?.trim()).toBe("Reload");
  });

  it("asks once for every banner of one integration and announces once", async () => {
    const dom = domain();
    const hass = fakeHass("1.1.0");
    const first = await settle(mount(hass, dom));
    const second = await settle(mount(hass, dom));
    expect(hass.callWS).toHaveBeenCalledTimes(1);
    expect(text(second)).toContain("1.1.0");
    const roles = [first, second].map((el) =>
      el.shadowRoot?.querySelector(".message")?.getAttribute("role"),
    );
    expect(roles).toEqual(["alert", null]);
  });

  it("renders nothing in the edit dialog or before hass arrives", () => {
    expect(
      mount(fakeHass("1.1.0"), domain(), true).querySelector("rz-version-banner-r1"),
    ).toBeNull();
    expect(mount(undefined, domain()).querySelector("rz-version-banner-r1")).toBeNull();
  });

  it("shows nothing when the integration can't answer", async () => {
    const failing = await settle(mount(fakeHass(new Error("unknown_command")), domain()));
    expect(failing.hidden).toBe(true);
    const hass = fakeHass("1.1.0");
    hass.callWS.mockResolvedValue({});
    const empty = await settle(mount(hass, domain()));
    expect(empty.hidden).toBe(true);
  });

  it("asks again after a reconnect and shows an update installed meanwhile", async () => {
    const hass = fakeHass("1.0.0");
    const el = await settle(mount(hass, domain()));
    expect(el.hidden).toBe(true);
    hass.callWS.mockResolvedValue({ version: "1.2.0" });
    hass.connection.ready();
    await settle(el.parentElement as HTMLElement);
    expect(hass.callWS).toHaveBeenCalledTimes(2);
    expect(text(el)).toContain("1.2.0");
  });

  it("wipes the caches, marks the attempt and reloads", async () => {
    const reload = vi.spyOn(window.location, "reload").mockImplementation(() => undefined);
    const deleted: string[] = [];
    vi.stubGlobal("caches", {
      keys: () => Promise.resolve(["a", "b"]),
      delete: (name: string) => {
        deleted.push(name);
        return Promise.resolve(true);
      },
    });
    const dom = domain();
    const el = await settle(mount(fakeHass("1.1.0"), dom));
    button(el).click();
    await el.updateComplete;
    expect(button(el).textContent?.trim()).toBe("Reloading…");
    expect(button(el).getAttribute("aria-disabled")).toBe("true");
    expect(text(el)).toContain("is installed");
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(deleted).toEqual(["a", "b"]);
    expect(
      window.sessionStorage.getItem(`rz-version-banner:reload:${dom}/card_version@1.1.0`),
    ).toBe("1");
    button(el).click();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("explains the cache after a reload that didn't help, and hides on request", async () => {
    const dom = domain();
    window.sessionStorage.setItem(`rz-version-banner:reload:${dom}/card_version@1.1.0`, "1");
    const hass = fakeHass("1.1.0");
    const first = await settle(mount(hass, dom));
    const second = await settle(mount(hass, dom));
    expect(text(first)).toMatch(/^The old card is still in the cache\./);
    expect(button(first).textContent?.trim()).toBe("Hide");
    button(first).click();
    await first.updateComplete;
    await second.updateComplete;
    expect(first.hidden).toBe(true);
    expect(second.hidden).toBe(true);
    expect(window.sessionStorage.getItem(`rz-version-banner:hide:${dom}/card_version@1.1.0`)).toBe(
      "1",
    );
  });

  it("clears its flags once the versions match", async () => {
    const dom = domain();
    window.sessionStorage.setItem(`rz-version-banner:reload:${dom}/card_version@1.1.0`, "1");
    window.sessionStorage.setItem("unrelated", "1");
    await settle(mount(fakeHass("1.0.0"), dom));
    expect(
      window.sessionStorage.getItem(`rz-version-banner:reload:${dom}/card_version@1.1.0`),
    ).toBeNull();
    expect(window.sessionStorage.getItem("unrelated")).toBe("1");
  });

  it("keeps a keyboard-reachable button with a visible name", async () => {
    const el = await settle(mount(fakeHass("1.1.0"), domain()));
    const b = button(el);
    expect(b.type).toBe("button");
    expect(b.tabIndex).toBe(0);
    expect(el.shadowRoot?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

// The rendered tag and the defined one must be the same string: the helper
// writes it literally in its template.
describe("registration", () => {
  it("defines the tag the helper renders", () => {
    const root = document.createElement("div");
    render(
      html`${versionBanner(fakeHass("1.0.0"), { domain: "x", version: "1", name: "X" })}`,
      root,
    );
    const tag = root.firstElementChild?.localName ?? "";
    expect(customElements.get(tag)).toBeDefined();
  });
});
