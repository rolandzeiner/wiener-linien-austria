import { describe, expect, it } from "vitest";

import { deriveRetroView } from "./retro-view.js";
import { normaliseRetroConfig } from "./config.js";
import type {
  DepartureAttr,
  WienerLinienAttrs,
  WienerLinienRetroCardConfig,
} from "../types.js";

function cfg(over: Partial<WienerLinienRetroCardConfig> = {}) {
  return normaliseRetroConfig({
    type: "custom:wiener-linien-austria-retro-card",
    ...over,
  });
}

function dep(over: Partial<DepartureAttr> = {}): DepartureAttr {
  return {
    line: "U1",
    towards: "Oberlaa",
    direction: "H",
    type: "ptMetro",
    countdown: 5,
    ...over,
  };
}

function attrs(over: Partial<WienerLinienAttrs> = {}): WienerLinienAttrs {
  return { departures: [dep()], ...over } as WienerLinienAttrs;
}

describe("deriveRetroView — row selection", () => {
  it("caps the panel at two rows, the layout it is built for", () => {
    const v = deriveRetroView(
      cfg(),
      attrs({
        departures: [
          dep({ countdown: 1 }),
          dep({ countdown: 3 }),
          dep({ countdown: 7 }),
        ],
      }),
    );
    expect(v.rows).toHaveLength(2);
    expect(v.rows.map((d) => d.countdown)).toEqual([1, 3]);
    // The uncapped filtered list stays available for the station band.
    expect(v.matching).toHaveLength(3);
    expect(v.departures).toHaveLength(3);
  });

  it("applies the card's direction and line filters", () => {
    const feed = attrs({
      departures: [
        dep({ line: "U1", direction: "H" }),
        dep({ line: "U3", direction: "H" }),
        dep({ line: "U1", direction: "R" }),
      ],
    });
    expect(deriveRetroView(cfg({ line: "U3" }), feed).rows.map((d) => d.line))
      .toEqual(["U3"]);
    // Retro always filters to one direction — default H.
    expect(
      deriveRetroView(cfg(), feed).rows.every((d) => d.direction === "H"),
    ).toBe(true);
  });

  it("survives a sensor with no departures attribute at all", () => {
    const v = deriveRetroView(cfg(), {} as WienerLinienAttrs);
    expect(v.rows).toEqual([]);
    expect(v.platform).toBeNull();
    expect(v.stopName).toBe("");
  });
});

describe("deriveRetroView — platform column", () => {
  it("takes the first row that actually reports a platform", () => {
    const v = deriveRetroView(
      cfg(),
      attrs({
        departures: [dep({ platform: null }), dep({ platform: "3" })],
      }),
    );
    expect(v.platform).toBe("3");
  });

  it("returns null when the user hid the platform", () => {
    const v = deriveRetroView(
      cfg({ show_platform: false }),
      attrs({ departures: [dep({ platform: "3" })] }),
    );
    expect(v.platform).toBeNull();
  });

  it("puts platform 2 on the left and everything else right, on auto", () => {
    const at = (p: string): boolean =>
      deriveRetroView(cfg(), attrs({ departures: [dep({ platform: p })] }))
        .gleisLeft;
    expect(at("2")).toBe(true);
    expect(at("1")).toBe(false);
    expect(at("3")).toBe(false);
  });

  it("lets an explicit side override the auto rule in both directions", () => {
    const feed = attrs({ departures: [dep({ platform: "1" })] });
    expect(deriveRetroView(cfg({ platform_side: "left" }), feed).gleisLeft).toBe(
      true,
    );
    const feed2 = attrs({ departures: [dep({ platform: "2" })] });
    expect(
      deriveRetroView(cfg({ platform_side: "right" }), feed2).gleisLeft,
    ).toBe(false);
  });

  it("hiding the platform also flips the auto side, since there is no 2", () => {
    // `platform` is null once hidden, so the auto rule cannot match "2".
    const v = deriveRetroView(
      cfg({ show_platform: false }),
      attrs({ departures: [dep({ platform: "2" })] }),
    );
    expect(v.gleisLeft).toBe(false);
  });
});

describe("deriveRetroView — caption and station name", () => {
  it("says GLEIS for metro and STEIG for everything else", () => {
    expect(
      deriveRetroView(cfg(), attrs({ departures: [dep({ type: "ptMetro" })] }))
        .platformLabelKey,
    ).toBe("gleis");
    expect(
      deriveRetroView(cfg(), attrs({ departures: [dep({ type: "ptTram" })] }))
        .platformLabelKey,
    ).toBe("steig");
  });

  it("decides the caption from the first row, not the whole feed", () => {
    const v = deriveRetroView(
      cfg(),
      attrs({
        departures: [dep({ type: "ptTram" }), dep({ type: "ptMetro" })],
      }),
    );
    expect(v.platformLabelKey).toBe("steig");
  });

  it("falls back from stop_name to friendly_name, then to empty", () => {
    expect(
      deriveRetroView(cfg(), attrs({ stop_name: "Karlsplatz" })).stopName,
    ).toBe("Karlsplatz");
    expect(
      deriveRetroView(cfg(), attrs({ friendly_name: "WL Karlsplatz" }))
        .stopName,
    ).toBe("WL Karlsplatz");
    expect(deriveRetroView(cfg(), attrs()).stopName).toBe("");
  });
});
