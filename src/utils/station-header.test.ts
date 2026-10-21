// @vitest-environment happy-dom
//
// Renders the strip into a real DOM to read the order of its children.
import { render } from "lit";
import { describe, expect, it } from "vite-plus/test";

import type { RetroHeaderSide } from "../types.js";
import { renderStationHeader } from "./station-header.js";

const SERVER_TIME = "2026-09-14T08:05:00+02:00";

function mount(left?: RetroHeaderSide, right?: RetroHeaderSide): HTMLElement {
  const host = document.createElement("div");
  render(
    renderStationHeader({ left, right, serverTime: SERVER_TIME, t: (k) => k, lang: "de" }),
    host,
  );
  return host;
}

/** One token per child of a side: "clock" / "date" for those chips, otherwise
 *  an icon tile's aria-label, otherwise the text. */
function order(host: HTMLElement, pos: "left" | "right"): string[] {
  const side = host.querySelector(`.retro-station-header__side--${pos}`)!;
  return [...side.children].map((el) => {
    if (el.classList.contains("retro-station-header__chip--clock")) return "clock";
    if (el.classList.contains("retro-station-header__chip--date")) return "date";
    return el.getAttribute("aria-label") ?? el.textContent.trim();
  });
}

const FULL: RetroHeaderSide = {
  exit: "regular",
  text: "Westbahnhof",
  show_wc: true,
  show_escalator: true,
  show_elevator: true,
  extra_icons: ["mdi:coffee", "mdi:bike"],
  chips: ["Gleis 1", "Gleis 2"],
  show_date: true,
  show_clock: true,
};

describe("renderStationHeader", () => {
  it("renders nothing when neither side is configured", () => {
    expect(mount().querySelector(".retro-station-header")).toBeNull();
  });

  it("orders the left side outward from the exit to the clock", () => {
    expect(order(mount(FULL), "left")).toEqual([
      "header.icon_exit",
      "Westbahnhof",
      "header.icon_elevator",
      "header.icon_escalator",
      "header.icon_wc",
      "mdi:coffee",
      "mdi:bike",
      "Gleis 1",
      "Gleis 2",
      "date",
      "clock",
    ]);
  });

  it("mirrors the right side, so each item keeps its distance from the name", () => {
    const left = order(mount(FULL), "left");
    const right = order(mount(undefined, FULL), "right");
    expect(right).toEqual([...left].reverse());
  });

  it("drops the clock and date until server_time has arrived", () => {
    const host = document.createElement("div");
    const side: RetroHeaderSide = { text: "Karlsplatz", show_clock: true, show_date: true };
    render(
      renderStationHeader({
        left: side,
        right: undefined,
        serverTime: null,
        t: (k) => k,
        lang: "de",
      }),
      host,
    );
    expect(order(host, "left")).toEqual(["Karlsplatz"]);
  });
});
