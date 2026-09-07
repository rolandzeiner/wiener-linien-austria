import { describe, expect, it } from "vitest";

import {
  chipPalette,
  colorForLine,
  filterPassthrough,
  normaliseModernConfig,
  normaliseRetroConfig,
  normaliseWalkTimes,
} from "./config.js";
import type { WienerLinienRetroCardConfig } from "../types.js";

/** Minimal valid retro config — every test starts from this and overrides
 *  only the key under test, so a default assertion can't be satisfied by
 *  an unrelated field the fixture happened to set. */
function retro(
  over: Partial<WienerLinienRetroCardConfig> = {},
): WienerLinienRetroCardConfig {
  return { type: "custom:wiener-linien-austria-retro-card", ...over };
}

describe("normaliseRetroConfig — defaults", () => {
  it("pins every default a card renders from", () => {
    const c = normaliseRetroConfig(retro());
    expect(c.direction).toBe("H");
    expect(c.show_platform).toBe(true);
    expect(c.platform_side).toBe("auto");
    expect(c.show_station_name).toBe(false);
    expect(c.station_bg).toBe("default");
    expect(c.size).toBe("regular");
    expect(c.style).toBe("classic");
    expect(c.flicker).toBe(false);
    expect(c.wheelchair_race).toBe(false);
    expect(c.accessibility_only).toBe(false);
    expect(c.message_ticker).toBe(false);
    expect(c.message_text).toBeUndefined();
    expect(c.show_header).toBe(false);
    expect(c.show_line_pill).toBe(false);
    expect(c.line_stripe).toBe(false);
    expect(c.housing).toBe(false);
    expect(c.show_unit).toBe(false);
  });

  it("keeps the card type the user configured", () => {
    expect(normaliseRetroConfig(retro()).type).toBe(
      "custom:wiener-linien-austria-retro-card",
    );
    expect(normaliseRetroConfig(retro({ type: "custom:renamed" })).type).toBe(
      "custom:renamed",
    );
  });

  it("collapses direction to H unless R is explicitly asked for", () => {
    // The retro card has no "both directions" state by design — the
    // editor no-ops that option to match. Anything but "R" is "H".
    expect(normaliseRetroConfig(retro({ direction: "R" })).direction).toBe("R");
    expect(normaliseRetroConfig(retro({ direction: "H" })).direction).toBe("H");
    // `""` is not in the retro type, but untyped YAML can still supply it.
    expect(
      normaliseRetroConfig(retro({ direction: "" as never })).direction,
    ).toBe("H");
    expect(normaliseRetroConfig(retro({ direction: undefined })).direction).toBe(
      "H",
    );
  });

  it("accepts only sensor-domain entities", () => {
    expect(normaliseRetroConfig(retro({ entity: "sensor.wl" })).entity).toBe(
      "sensor.wl",
    );
    expect(
      normaliseRetroConfig(retro({ entity: "light.kitchen" })).entity,
    ).toBeUndefined();
    expect(normaliseRetroConfig(retro({ entity: "" })).entity).toBeUndefined();
  });

  it("coerces non-boolean YAML values rather than passing them through", () => {
    // `?? true` used to hand `0` straight back, hiding the platform column
    // where modern and flap both showed it. asBool is the shared guard.
    expect(
      normaliseRetroConfig(retro({ show_platform: 0 as never })).show_platform,
    ).toBe(true);
    expect(
      normaliseRetroConfig(retro({ show_platform: "false" as never }))
        .show_platform,
    ).toBe(true);
    expect(
      normaliseRetroConfig(retro({ show_platform: false })).show_platform,
    ).toBe(false);
    expect(
      normaliseRetroConfig(retro({ show_station_name: 1 as never }))
        .show_station_name,
    ).toBe(false);
  });

  it("agrees with the other two cards on how a non-boolean is read", () => {
    // The concrete cross-card inconsistency finding 6 was about.
    const retroVal = normaliseRetroConfig(
      retro({ show_platform: 0 as never }),
    ).show_platform;
    const modernVal = normaliseModernConfig({
      show_platform: 0 as never,
    }).show_platform;
    expect(retroVal).toBe(modernVal);
  });

  it("rejects out-of-whitelist enum values instead of passing them through", () => {
    expect(normaliseRetroConfig(retro({ size: "huge" as never })).size).toBe(
      "regular",
    );
    expect(normaliseRetroConfig(retro({ style: "neon" as never })).style).toBe(
      "classic",
    );
    expect(
      normaliseRetroConfig(retro({ station_bg: "puce" as never })).station_bg,
    ).toBe("default");
    expect(
      normaliseRetroConfig(retro({ platform_side: "up" as never }))
        .platform_side,
    ).toBe("auto");
  });

  it("treats a blank marquee message as no message, and bounds a long one", () => {
    expect(
      normaliseRetroConfig(retro({ message_text: "   " })).message_text,
    ).toBeUndefined();
    const long = "x".repeat(400);
    expect(
      normaliseRetroConfig(retro({ message_text: long })).message_text?.length,
    ).toBe(160);
  });
});

describe("normaliseRetroConfig — the v2.0.0 line_pill migration", () => {
  it("carries the old key's meaning across unchanged (same polarity)", () => {
    // v1 retro: `line_pill === true` showed the pill. v2 renamed it to
    // `show_line_pill` without inverting, so old YAML must render the same.
    expect(normaliseRetroConfig(retro({ line_pill: true })).show_line_pill).toBe(
      true,
    );
    expect(
      normaliseRetroConfig(retro({ line_pill: false })).show_line_pill,
    ).toBe(false);
    expect(normaliseRetroConfig(retro()).show_line_pill).toBe(false);
  });

  it("lets the new key win when both are present", () => {
    expect(
      normaliseRetroConfig(retro({ line_pill: true, show_line_pill: false }))
        .show_line_pill,
    ).toBe(false);
    expect(
      normaliseRetroConfig(retro({ line_pill: false, show_line_pill: true }))
        .show_line_pill,
    ).toBe(true);
  });

  it("does not leak the deprecated key into the normalised config", () => {
    // A leaked key is written straight back to the user's YAML by the
    // editor's config-changed commit, so the deprecation never completes.
    const c = normaliseRetroConfig(retro({ line_pill: true }));
    expect(c).not.toHaveProperty("line_pill");
  });
});

describe("normaliseModernConfig — defaults", () => {
  it("pins every default a card renders from", () => {
    const c = normaliseModernConfig({});
    expect(c.max_departures).toBe(6);
    expect(c.show_accessibility).toBe(false);
    expect(c.accessibility_only).toBe(false);
    expect(c.show_cooling).toBe(false);
    expect(c.show_traffic_info).toBe(true);
    expect(c.show_elevator_info).toBe(true);
    expect(c.show_delay).toBe(true);
    expect(c.show_delay_colors).toBe(true);
    expect(c.show_type_icon).toBe(false);
    expect(c.show_platform).toBe(true);
    expect(c.show_hero_metric).toBe(true);
    expect(c.show_departures).toBe(true);
    expect(c.show_stops_ahead).toBe(true);
    expect(c.show_qr_button).toBe(true);
    expect(c.hide_header).toBe(false);
    expect(c.hide_attribution).toBe(false);
    expect(c.layout).toBe("stacked");
    expect(c.entities).toEqual([]);
    expect(c.line_colors).toEqual({});
  });

  it("clamps max_departures to 0..20 and falls back on non-numbers", () => {
    expect(normaliseModernConfig({ max_departures: -5 }).max_departures).toBe(0);
    expect(normaliseModernConfig({ max_departures: 0 }).max_departures).toBe(0);
    expect(normaliseModernConfig({ max_departures: 99 }).max_departures).toBe(
      20,
    );
    expect(normaliseModernConfig({ max_departures: 4.6 }).max_departures).toBe(
      5,
    );
    expect(
      normaliseModernConfig({ max_departures: "seven" }).max_departures,
    ).toBe(6);
  });

  it("promotes the legacy flat entity shape into entities[0]", () => {
    const c = normaliseModernConfig({
      entity: "sensor.wl",
      lines: ["U1"],
      direction: "H",
    });
    expect(c.entities).toHaveLength(1);
    expect(c.entities[0]?.entity).toBe("sensor.wl");
    expect(c.entities[0]?.lines).toEqual(["U1"]);
    expect(c.entities[0]?.direction).toBe("H");
  });

  it("drops duplicate stops, keeping first-seen order", () => {
    const c = normaliseModernConfig({
      entities: ["sensor.a", "sensor.b", "sensor.a"],
    });
    expect(c.entities.map((s) => s.entity)).toEqual(["sensor.a", "sensor.b"]);
  });

  it("keeps only the four valid CSS hex shapes, upper-casing the line key", () => {
    const c = normaliseModernConfig({
      line_colors: {
        u1: "#abc",
        u2: "#abcd",
        u3: "#aabbcc",
        u4: "#aabbccdd",
        u5: "#abcde", // 5 digits — CSS silently ignores, so we must too
        u6: "not-a-colour",
      },
    });
    expect(c.line_colors).toEqual({
      U1: "#abc",
      U2: "#abcd",
      U3: "#aabbcc",
      U4: "#aabbccdd",
    });
  });

  it("coerces non-boolean YAML values rather than passing them through", () => {
    // asBool is the guard: untyped YAML can hand us 0, "false" or null.
    expect(
      normaliseModernConfig({ show_platform: 0 as never }).show_platform,
    ).toBe(true);
    expect(
      normaliseModernConfig({ show_platform: "false" as never }).show_platform,
    ).toBe(true);
    expect(
      normaliseModernConfig({ show_platform: false }).show_platform,
    ).toBe(false);
  });
});

describe("filterPassthrough", () => {
  it("keeps dashboard layout fields and drops validated ones", () => {
    const out = filterPassthrough(
      { type: "x", grid_options: { columns: 6 }, view_layout: { position: 1 } },
      new Set(["type"]),
    );
    expect(out).toEqual({
      grid_options: { columns: 6 },
      view_layout: { position: 1 },
    });
  });

  it("returns an empty object for non-object input", () => {
    expect(filterPassthrough(null, new Set())).toEqual({});
    expect(filterPassthrough("nope", new Set())).toEqual({});
  });
});

describe("normaliseWalkTimes", () => {
  it("keeps finite minutes in 0..120 and drops everything else", () => {
    expect(
      normaliseWalkTimes({ "U1|H": 5, "U2|R": "7", "U3|H": -1, "U4|H": 999 }),
    ).toEqual({ "U1|H": 5, "U2|R": 7 });
  });

  it("returns undefined for a non-object", () => {
    expect(normaliseWalkTimes(undefined)).toBeUndefined();
    expect(normaliseWalkTimes("nope")).toBeUndefined();
  });
});

describe("chipPalette — the four-step precedence ladder", () => {
  const gtfs = { U1: { bg: "E20613", fg: "FFFFFF" }, N60: { bg: "0A295D" } };

  it("puts a user override above everything else", () => {
    expect(chipPalette("U1", { U1: "#123456" }, gtfs)).toEqual({
      background: "#123456",
    });
  });

  it("matches an override case-insensitively", () => {
    expect(chipPalette("u1", { U1: "#123456" }, gtfs).background).toBe(
      "#123456",
    );
  });

  it("lets the nightline rule beat GTFS — deliberate, not a bug", () => {
    // GTFS publishes nightlines as bus navy; WL signage pairs a deeper
    // navy with yellow numerals. The rule must win or N-lines read wrong.
    const n = chipPalette("N60", {}, gtfs);
    expect(n.background).not.toBe("#0A295D");
    expect(n.color).toBeDefined();
  });

  it("uses GTFS when there is no override and no nightline match", () => {
    expect(chipPalette("U1", {}, gtfs)).toEqual({
      background: "#E20613",
      color: "#FFFFFF",
    });
  });

  it("falls back for an unknown line", () => {
    expect(chipPalette("X99", {}, gtfs)).toEqual({
      background: "var(--primary-color)",
    });
    expect(chipPalette("X99", {}, gtfs, "#000").background).toBe("#000");
  });

  it("colorForLine returns exactly chipPalette's background", () => {
    for (const line of ["U1", "N60", "X99"]) {
      expect(colorForLine(line, {}, gtfs)).toBe(
        chipPalette(line, {}, gtfs).background,
      );
    }
  });
});
