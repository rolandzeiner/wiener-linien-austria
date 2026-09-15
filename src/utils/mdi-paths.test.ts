import { describe, expect, it } from "vitest";

import { mdiPathForIcon } from "./mdi-paths.js";
import { LINE_TYPE_METRO, LINE_TYPE_S_BAHN, headerIconForType, lineTypeIcon } from "./mot.js";

describe("mdiPathForIcon", () => {
  it("has its own path for every vehicle icon the boards use", () => {
    // The QR canvas draws raw path data, so an icon missing here silently
    // falls back to the bus-stop glyph. That is how the S-Bahn got a bus stop
    // in the QR code: `mdi:train` reached the canvas before its path did.
    const fallback = mdiPathForIcon("mdi:bus-stop");
    for (const type of [LINE_TYPE_METRO, "ptTram", "ptBusCity", "ptBusNight", LINE_TYPE_S_BAHN]) {
      const icon = lineTypeIcon(type);
      expect(icon, type).not.toBeNull();
      expect(mdiPathForIcon(icon!), `${type} → ${icon}`).not.toBe(fallback);
    }
  });

  it("falls back to the bus-stop glyph for an unknown type", () => {
    expect(mdiPathForIcon(headerIconForType("ptSomethingNew"))).toBe(
      mdiPathForIcon("mdi:bus-stop"),
    );
  });
});
