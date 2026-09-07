import { describe, expect, it } from "vitest";

import { normaliseFlapConfig } from "./flap-config.js";
import { normaliseRetroConfig } from "./config.js";
import type {
  WienerLinienFlapCardConfig,
  WienerLinienRetroCardConfig,
} from "../types.js";

function flap(
  over: Partial<WienerLinienFlapCardConfig> = {},
): WienerLinienFlapCardConfig {
  return { type: "custom:wiener-linien-austria-flap-card", ...over };
}

function retro(
  over: Partial<WienerLinienRetroCardConfig> = {},
): WienerLinienRetroCardConfig {
  return { type: "custom:wiener-linien-austria-retro-card", ...over };
}

describe("normaliseFlapConfig — defaults", () => {
  it("pins every default a board renders from", () => {
    const c = normaliseFlapConfig(flap());
    expect(c.size).toBe("small");
    expect(c.max_rows).toBe(2);
    expect(c.show_platform).toBe(true);
    expect(c.show_station_name).toBe(true);
    expect(c.station_bg).toBe("line");
    expect(c.show_min_unit).toBe(true);
    expect(c.show_accessibility).toBe(true);
    expect(c.accessibility_only).toBe(false);
    expect(c.show_header).toBe(false);
    expect(c.hide_attribution).toBe(false);
    expect(c.show_line_column).toBe(true);
    expect(c.housing).toBe(true);
    expect(c.entities).toEqual([]);
  });

  it("clamps max_rows to 1..8 and falls back to 2 on non-numbers", () => {
    expect(normaliseFlapConfig(flap({ max_rows: 0 })).max_rows).toBe(1);
    expect(normaliseFlapConfig(flap({ max_rows: 99 })).max_rows).toBe(8);
    expect(normaliseFlapConfig(flap({ max_rows: 3.4 })).max_rows).toBe(3);
    expect(
      normaliseFlapConfig(flap({ max_rows: "many" as never })).max_rows,
    ).toBe(2);
  });

  it("accepts the line: prefix for station_bg but rejects a bare prefix", () => {
    expect(normaliseFlapConfig(flap({ station_bg: "line:U3" })).station_bg).toBe(
      "line:U3",
    );
    expect(normaliseFlapConfig(flap({ station_bg: "white" })).station_bg).toBe(
      "white",
    );
    expect(
      normaliseFlapConfig(flap({ station_bg: "line:" as never })).station_bg,
    ).toBe("line");
    expect(
      normaliseFlapConfig(flap({ station_bg: "puce" as never })).station_bg,
    ).toBe("line");
  });

  it("promotes the legacy flat shape into entities[0]", () => {
    const c = normaliseFlapConfig(
      flap({ entity: "sensor.wl", line: "U1", direction: "H" }),
    );
    expect(c.entities).toHaveLength(1);
    expect(c.entities[0]?.entity).toBe("sensor.wl");
    expect(c.entities[0]?.lines).toEqual(["U1"]);
    expect(c.entities[0]?.direction).toBe("H");
  });

  it("drops malformed stops and de-duplicates the rest", () => {
    const c = normaliseFlapConfig(
      flap({
        entities: [
          "sensor.a",
          "light.nope",
          { entity: "sensor.b" },
          "sensor.a",
        ] as never,
      }),
    );
    expect(c.entities.map((s) => s.entity)).toEqual(["sensor.a", "sensor.b"]);
  });

  it("accepts the legacy show_station_header alias, new key winning", () => {
    expect(
      normaliseFlapConfig(flap({ show_station_header: false }))
        .show_station_name,
    ).toBe(false);
    expect(
      normaliseFlapConfig(
        flap({ show_station_header: false, show_station_name: true }),
      ).show_station_name,
    ).toBe(true);
  });

  it("does not leak the legacy show_station_header into the config", () => {
    const c = normaliseFlapConfig(flap({ show_station_header: false }));
    expect(c).not.toHaveProperty("show_station_header");
  });
});

describe("normaliseFlapConfig — the v2.0.0 line_pill migration", () => {
  it("inverts the old key so an existing board renders identically", () => {
    // v1 flap: `line_pill === true` HID the column. v2 renamed it to
    // `show_line_column` with the polarity flipped, so the inversion is
    // what preserves the look. Getting this backwards silently rewrites
    // how every upgraded board renders.
    expect(
      normaliseFlapConfig(flap({ line_pill: true })).show_line_column,
    ).toBe(false);
    expect(
      normaliseFlapConfig(flap({ line_pill: false })).show_line_column,
    ).toBe(true);
    expect(normaliseFlapConfig(flap()).show_line_column).toBe(true);
  });

  it("lets the new key win when both are present", () => {
    expect(
      normaliseFlapConfig(flap({ line_pill: true, show_line_column: true }))
        .show_line_column,
    ).toBe(true);
    expect(
      normaliseFlapConfig(flap({ line_pill: false, show_line_column: false }))
        .show_line_column,
    ).toBe(false);
  });

  it("does not leak the deprecated key into the normalised config", () => {
    // A leaked key is written straight back to the user's YAML by the
    // editor's config-changed commit, so the deprecation never completes.
    const c = normaliseFlapConfig(flap({ line_pill: true }));
    expect(c).not.toHaveProperty("line_pill");
  });
});

describe("cross-card config vocabulary", () => {
  // These assertions are the drift table from the audit, made executable.
  // They document what IS, not what ought to be — several of these pairs
  // disagree on purpose. Change one only with a deliberate decision.

  it("line_pill means the opposite thing on retro and flap", () => {
    const r = normaliseRetroConfig(retro({ line_pill: true }));
    const f = normaliseFlapConfig(flap({ line_pill: true }));
    expect(r.show_line_pill).toBe(true); // retro: true = SHOW a pill
    expect(f.show_line_column).toBe(false); // flap: true = HIDE a column
  });

  it("show_station_name defaults opposite ways on retro and flap", () => {
    expect(normaliseRetroConfig(retro()).show_station_name).toBe(false);
    expect(normaliseFlapConfig(flap()).show_station_name).toBe(true);
  });

  it("housing defaults opposite ways on retro and flap", () => {
    expect(normaliseRetroConfig(retro()).housing).toBe(false);
    expect(normaliseFlapConfig(flap()).housing).toBe(true);
  });

  it("size shares an enum but not a default", () => {
    expect(normaliseRetroConfig(retro()).size).toBe("regular");
    expect(normaliseFlapConfig(flap()).size).toBe("small");
  });

  it("the unit caption uses a different key and default on each card", () => {
    expect(normaliseRetroConfig(retro()).show_unit).toBe(false);
    expect(normaliseFlapConfig(flap()).show_min_unit).toBe(true);
  });

  it("the station_bg default sentinel is spelled differently on each card", () => {
    expect(normaliseRetroConfig(retro()).station_bg).toBe("default");
    expect(normaliseFlapConfig(flap()).station_bg).toBe("line");
  });
});
