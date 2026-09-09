// @vitest-environment happy-dom

// Coverage for the station-signage strip editor.
//
// At 373 lines this was the single largest untested file in the frontend
// (4.22% statements), and it is the one control in the editors whose whole
// premise is direct manipulation: the bar IS the preview, so a rendering bug
// here is not a cosmetic problem, it is the control lying about what the sign
// will look like.
//
// `renderHeaderStrip` is a plain function returning a Lit template, so these
// tests render it into a detached container rather than mounting an element —
// no custom element, no editor host, no HA stubs. `ha-icon` is never defined
// and does not need to be: an unknown element is inert and Lit renders
// straight through it, so the icon's `icon` attribute is still assertable.

import { render } from "lit";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import {
  renderHeaderStrip,
  type HeaderSideKey,
  type HeaderStripCallbacks,
} from "./header-strip.js";
import type { RetroHeaderSide } from "../types.js";
import { HEADER_MAX_TEXT_LEN } from "../utils/config.js";

/** Identity translator: assertions then read the translation KEY, which is
 *  what we actually want pinned — a renamed key is a broken string, and the
 *  German text is not this file's contract. */
const et = (key: string): string => key;

type Patch = HeaderStripCallbacks["patch"];
type SelectSide = HeaderStripCallbacks["selectSide"];

interface Spies extends HeaderStripCallbacks {
  patch: Mock<Patch>;
  selectSide: Mock<SelectSide>;
}

function callbacks(): Spies {
  return { patch: vi.fn<Patch>(), selectSide: vi.fn<SelectSide>() };
}

/** Index into a NodeList result under `noUncheckedIndexedAccess`, failing
 *  with a useful message rather than a bare "possibly undefined". */
function at<T>(items: readonly T[], i: number, what: string): T {
  const item = items[i];
  if (item === undefined) {
    throw new Error(`expected a ${what} at index ${i}, found ${items.length}`);
  }
  return item;
}

/** Query one element that must exist. */
function one<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`no element matched ${selector}`);
  return el;
}

let host: HTMLElement;

function strip(
  opts: {
    left?: RetroHeaderSide;
    right?: RetroHeaderSide;
    selected?: HeaderSideKey;
  },
  cb: HeaderStripCallbacks,
): HTMLElement {
  render(
    renderHeaderStrip(
      {
        left: opts.left,
        right: opts.right,
        selected: opts.selected ?? "header_left",
        et,
      },
      cb,
    ),
    host,
  );
  return host;
}

const zones = (el: HTMLElement): HTMLElement[] =>
  Array.from(el.querySelectorAll<HTMLElement>(".wl-strip-bar > button"));

const icons = (el: Element): string[] =>
  Array.from(el.querySelectorAll("ha-icon")).map(
    (i) => i.getAttribute("icon") ?? "",
  );

beforeEach(() => {
  host = document.createElement("div");
  document.body.innerHTML = "";
  document.body.appendChild(host);
});

describe("the bar preview", () => {
  it("renders two zones, one per side", () => {
    const el = strip({}, callbacks());
    expect(zones(el)).toHaveLength(2);
  });

  it("shows an empty-slot label for a side with nothing configured", () => {
    const el = strip({}, callbacks());
    expect(el.textContent).toContain("header_slot_empty");
  });

  it("renders tokens in the order the card draws them", () => {
    // Exit pictogram, free text, amenity icons, extra icons, then chips.
    // The order is the contract: if the preview and the card disagree, the
    // control is lying, and nothing else in the suite would notice.
    const el = strip(
      {
        left: {
          exit: "regular",
          text: "Ausgang",
          show_wc: true,
          show_clock: true,
          extra_icons: ["mdi:coffee"],
          chips: ["Gleis 1", "Gleis 2"],
        } as RetroHeaderSide,
      },
      callbacks(),
    );

    const left = at(zones(el), 0, "zone");
    expect(icons(left)).toEqual([
      "mdi:exit-run",
      "mdi:human-male-female",
      "mdi:clock-outline",
      "mdi:coffee",
    ]);
    // Per-token, not concatenated textContent: the tokens render as
    // adjacent spans with no whitespace between them, so the flat string is
    // "AusgangGleis 1Gleis 2" and any word-boundary assertion on it is a
    // coincidence waiting to break.
    const tokenText = Array.from(left.querySelectorAll(".wl-token"))
      .map((t) => (t.textContent ?? "").trim())
      .filter(Boolean);
    expect(tokenText).toEqual(["Ausgang", "Gleis 1", "Gleis 2"]);
  });

  it("omits the exit pictogram when the side is set to none", () => {
    const el = strip(
      { left: { exit: "none", text: "Nur Text" } as RetroHeaderSide },
      callbacks(),
    );
    expect(icons(at(zones(el), 0, "zone"))).toEqual([]);
  });

  it("names every token in the zone's aria-label", () => {
    // Icon tokens render no text, so without this a screen-reader user hears
    // only "left" and cannot tell what the sign is configured to show — on a
    // control whose entire premise is that the bar is the preview.
    const el = strip(
      {
        left: {
          exit: "regular",
          show_wc: true,
          chips: ["Gleis 1"],
        } as RetroHeaderSide,
      },
      callbacks(),
    );

    const label = at(zones(el), 0, "zone").getAttribute("aria-label") ?? "";
    expect(label).toContain("header_exit_regular");
    expect(label).toContain("show_wc_short");
    expect(label).toContain("Gleis 1");
  });

  it("falls back to the raw MDI key as the name of a user-picked icon", () => {
    const el = strip(
      { left: { extra_icons: ["mdi:coffee"] } as RetroHeaderSide },
      callbacks(),
    );
    expect(at(zones(el), 0, "zone").getAttribute("aria-label")).toContain(
      "mdi:coffee",
    );
  });
});

describe("side selection", () => {
  it("marks the selected zone pressed and the other not", () => {
    const el = strip({ selected: "header_right" }, callbacks());
    const found = zones(el);
    expect(at(found, 0, "zone").getAttribute("aria-pressed")).toBe("false");
    expect(at(found, 1, "zone").getAttribute("aria-pressed")).toBe("true");
  });

  it("selects a side when its zone is tapped", () => {
    const cb = callbacks();
    const el = strip({ selected: "header_left" }, cb);
    at(zones(el), 1, "zone").click();
    expect(cb.selectSide).toHaveBeenCalledWith("header_right");
    // Selection is editor-local UI state, never config.
    expect(cb.patch).not.toHaveBeenCalled();
  });

  it("selects a side from the segmented switch too", () => {
    const cb = callbacks();
    const el = strip({ selected: "header_left" }, cb);
    const seg = Array.from(
      el.querySelectorAll<HTMLButtonElement>(".wl-seg .wl-seg-btn"),
    );
    expect(seg).toHaveLength(2);
    at(seg, 1, "segment button").click();
    expect(cb.selectSide).toHaveBeenCalledWith("header_right");
  });

  it("edits the side that is selected, not always the left one", () => {
    const cb = callbacks();
    const el = strip({ selected: "header_right" }, cb);
    one<HTMLButtonElement>(el, '.wl-tray-btn[aria-label="show_wc_short"]').click();
    expect(cb.patch).toHaveBeenCalledWith("header_right", "show_wc", true);
  });
});

describe("the field panel", () => {
  it("patches the exit pictogram when one is picked", () => {
    const cb = callbacks();
    const el = strip({ selected: "header_left" }, cb);
    one<HTMLButtonElement>(
      el,
      '.wl-pict[aria-label="header_exit_accessible"]',
    ).click();
    expect(cb.patch).toHaveBeenCalledWith(
      "header_left",
      "exit",
      "accessible",
    );
  });

  it("marks the active exit choice pressed", () => {
    const el = strip(
      { left: { exit: "accessible" } as RetroHeaderSide },
      callbacks(),
    );
    const active = el.querySelector(
      '.wl-pict[aria-label="header_exit_accessible"]',
    );
    expect(active?.getAttribute("aria-pressed")).toBe("true");
  });

  it("treats an unset exit as none", () => {
    const el = strip({ left: {} as RetroHeaderSide }, callbacks());
    const none = el.querySelector('.wl-pict[aria-label="header_exit_none"]');
    expect(none?.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles an amenity off when it is already on", () => {
    const cb = callbacks();
    const el = strip({ left: { show_wc: true } as RetroHeaderSide }, cb);
    one<HTMLButtonElement>(el, '.wl-tray-btn[aria-label="show_wc_short"]').click();
    expect(cb.patch).toHaveBeenCalledWith("header_left", "show_wc", false);
  });

  it("offers every amenity the card renders", () => {
    const el = strip({}, callbacks());
    for (const label of [
      "show_wc_short",
      "show_escalator_short",
      "show_elevator_short",
      "show_clock_short",
      "show_date_short",
    ]) {
      expect(
        el.querySelector(`.wl-tray-btn[aria-label="${label}"]`),
      ).not.toBeNull();
    }
  });
});

describe("chips and icons", () => {
  // Removal controls all carry the same aria-label, because the real
  // translator substitutes the chip/icon name into a `{chip}` / `{icon}`
  // placeholder and the identity translator used here leaves the raw key.
  // So these select by kind and then by position — which is the stronger
  // assertion anyway: the bug worth catching is a remove button wired to
  // the wrong index, and a name-based selector would hide exactly that.
  const removers = (el: HTMLElement, kind: "chip" | "icon"): HTMLButtonElement[] =>
    Array.from(
      el.querySelectorAll<HTMLButtonElement>(
        `.wl-pill-x[aria-label="remove_${kind}_aria"]`,
      ),
    );

  it("renders one remove control per configured chip and icon", () => {
    const el = strip(
      {
        left: {
          chips: ["Gleis 1", "Gleis 2"],
          extra_icons: ["mdi:coffee"],
        } as RetroHeaderSide,
      },
      callbacks(),
    );
    expect(removers(el, "chip")).toHaveLength(2);
    expect(removers(el, "icon")).toHaveLength(1);
  });

  it("removes the chip at the tapped index, not the first one", () => {
    const cb = callbacks();
    const el = strip(
      { left: { chips: ["Gleis 1", "Gleis 2", "Gleis 3"] } as RetroHeaderSide },
      cb,
    );
    at(removers(el, "chip"), 1, "chip remover").click();
    expect(cb.patch).toHaveBeenCalledWith("header_left", "chips", [
      "Gleis 1",
      "Gleis 3",
    ]);
  });

  it("removes the extra icon at the tapped index", () => {
    const cb = callbacks();
    const el = strip(
      {
        left: {
          extra_icons: ["mdi:coffee", "mdi:bike", "mdi:train"],
        } as RetroHeaderSide,
      },
      cb,
    );
    at(removers(el, "icon"), 1, "icon remover").click();
    expect(cb.patch).toHaveBeenCalledWith("header_left", "extra_icons", [
      "mdi:coffee",
      "mdi:train",
    ]);
  });

  it("keeps chip and icon removal independent", () => {
    // Both lists render into the same `.wl-tray`, so an index computed
    // across the tray rather than within its own list would delete the
    // wrong thing — silently, and only when both lists are non-empty.
    const cb = callbacks();
    const el = strip(
      {
        left: {
          extra_icons: ["mdi:coffee"],
          chips: ["Gleis 1", "Gleis 2"],
        } as RetroHeaderSide,
      },
      cb,
    );
    at(removers(el, "chip"), 0, "chip remover").click();
    expect(cb.patch).toHaveBeenCalledWith("header_left", "chips", ["Gleis 2"]);
  });

  it("writes the free-text field back on change", () => {
    const cb = callbacks();
    const el = strip({ selected: "header_left" }, cb);
    const input = one<HTMLInputElement>(el, '.wl-text[aria-label="text"]');
    input.value = "Ausgang Mariahilfer Straße";
    input.dispatchEvent(new Event("change"));
    expect(cb.patch).toHaveBeenCalledWith(
      "header_left",
      "text",
      "Ausgang Mariahilfer Straße",
    );
  });

  it("caps the free-text field at the configured length", () => {
    // The cap exists because the card draws this into a fixed-width bar.
    // Enforcing it only in the normaliser would let the user type past the
    // limit and watch the preview disagree with what they typed.
    const el = strip({}, callbacks());
    const input = one<HTMLInputElement>(el, '.wl-text[aria-label="text"]');
    expect(Number(input.getAttribute("maxlength"))).toBe(HEADER_MAX_TEXT_LEN);
  });
});
