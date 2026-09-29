import { describe, expect, it } from "vitest";

import {
  TRANSFER_MODES,
  TRANSFER_MODE_ICONS,
  headerIconForType,
  lineTypeIcon,
  transferModeOf,
} from "./mot.js";

describe("lineTypeIcon", () => {
  it("maps every published MeansOfTransport to a glyph", () => {
    expect(lineTypeIcon("ptMetro")).toBe("mdi:subway-variant");
    expect(lineTypeIcon("ptTram")).toBe("mdi:tram");
    expect(lineTypeIcon("ptBusCity")).toBe("mdi:bus");
    expect(lineTypeIcon("ptBusNight")).toBe("mdi:bus");
    expect(lineTypeIcon("ptTrainS")).toBe("mdi:train");
  });

  it("returns null for a type Wiener Linien has not published before", () => {
    expect(lineTypeIcon("ptTouristTrain")).toBeNull();
    expect(lineTypeIcon(undefined)).toBeNull();
  });

  it("supplies the generic fallback where a glyph is mandatory", () => {
    expect(headerIconForType("ptTouristTrain")).toBe("mdi:bus-stop");
    expect(headerIconForType("ptTram")).toBe("mdi:tram");
  });
});

describe("transferModeOf", () => {
  it("classifies the U-Bahn lines", () => {
    for (const l of ["U1", "U2", "U3", "U4", "U5", "U6"]) {
      expect(transferModeOf(l)).toBe("metro");
    }
  });

  it("classifies the S-Bahn lines, including the two-digit ones", () => {
    for (const l of ["S1", "S2", "S3", "S7", "S40", "S45", "S60", "S80"]) {
      expect(transferModeOf(l)).toBe("sbahn");
    }
  });

  // A NightLine is a bus by vehicle but its own category on the toggle row.
  // It doesn't match the city-bus shape (that needs a leading digit), so
  // without the N branch it would fall into the tram fallback.
  it("classifies NightLines as night rather than bus", () => {
    for (const l of ["N25", "N29", "N60", "N66"]) {
      expect(transferModeOf(l)).toBe("night");
    }
  });

  it("classifies city buses by their trailing letter", () => {
    for (const l of ["2A", "13A", "39A", "57A", "25B", "26B"]) {
      expect(transferModeOf(l)).toBe("bus");
    }
  });

  it("classifies trams — the numeric and letter lines", () => {
    for (const l of ["1", "2", "6", "18", "43", "71", "D", "O"]) {
      expect(transferModeOf(l)).toBe("tram");
    }
  });

  // Its own category, not a tram: linien.csv tags LineID 399 `ptTramWLB`,
  // _MOT_SORT_RANK gives it a dedicated tier, and it carries the palette's
  // only pure-black colour. The toggle row was the last card-side place
  // calling it a tram.
  it("classifies the Badner Bahn as its own mode", () => {
    expect(transferModeOf("WLB")).toBe("badner");
    expect(transferModeOf("wlb")).toBe("badner");
  });

  // `LB` is the linien.csv spelling; the integration rewrites it to WLB when
  // it parses the catalogue, so transferModeOf never meets it. This pins that
  // transferModeOf doesn't special-case it; it can't detect the upstream
  // rewrite breaking.
  it("does not special-case the legacy LB spelling, which is folded upstream", () => {
    expect(transferModeOf("LB")).toBe("tram");
  });

  it("is case-insensitive, so a hand-written config label still classifies", () => {
    expect(transferModeOf("u1")).toBe("metro");
    expect(transferModeOf("n25")).toBe("night");
    expect(transferModeOf("13a")).toBe("bus");
    expect(transferModeOf("wlb")).toBe("badner");
  });

  // Falling through to `tram` is the deliberate choice: a toggle the user
  // left ON must not silently swallow a label the heuristic has not met.
  it("files an unrecognised label under tram rather than dropping it", () => {
    expect(transferModeOf("VRT")).toBe("tram");
    expect(transferModeOf("")).toBe("tram");
  });
});

describe("TRANSFER_MODE_ICONS", () => {
  it("carries a glyph for every mode, so no chip can render blank", () => {
    for (const mode of TRANSFER_MODES) {
      expect(TRANSFER_MODE_ICONS[mode]).toMatch(/^mdi:/);
    }
  });
});
