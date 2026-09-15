import { describe, expect, it } from "vitest";

import { stopMapUrl } from "./map-url.js";

describe("stopMapUrl", () => {
  it("puts coordinates into the city-map permalink, longitude first", () => {
    expect(stopMapUrl("Neubaugasse", 48.1982909, 16.3502006)).toBe(
      "https://stadtplan.wien.gv.at/#/@16.3502006,48.1982909,17.5,0,0,standard/themes",
    );
  });

  it("falls back to an OpenStreetMap search by name without coordinates", () => {
    expect(stopMapUrl("Wien Mitte/Landstraße", undefined, undefined)).toBe(
      "https://www.openstreetmap.org/search?query=Wien%20Mitte%2FLandstra%C3%9Fe%2C%20Wien",
    );
    // Half a coordinate pair is no coordinate.
    expect(stopMapUrl("Praterstern", 48.2, null)).toMatch(/^https:\/\/www\.openstreetmap\.org\//);
  });

  it("has nothing to link without coordinates or a name", () => {
    expect(stopMapUrl(undefined, null, null)).toBeNull();
    expect(stopMapUrl("", undefined, undefined)).toBeNull();
  });
});
