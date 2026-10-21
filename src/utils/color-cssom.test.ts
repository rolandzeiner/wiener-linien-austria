// @vitest-environment happy-dom

// The non-hex colours a hand-written `line_colors` override can carry go
// through CSSOM, which needs a document; color.test.ts runs without one.
//
// happy-dom rejects junk with "" like a browser, but keeps `rgb()`, named
// and `hsl()` colours as written where a browser serialises them to
// `rgb()` / `rgba()`. Only `rgb()` is pinned here, because parseColor reads
// it the same in either form.

import { describe, expect, it } from "vite-plus/test";

import { contrastRatio } from "./color.js";

describe("colour parsing through CSSOM", () => {
  it("reads comma-separated rgb() like the matching hex", () => {
    expect(contrastRatio("rgb(239, 124, 0)", "#fff")).toBeCloseTo(
      contrastRatio("#EF7C00", "#fff")!,
      10,
    );
  });

  it("reads space-separated rgb() and ignores the alpha part", () => {
    expect(contrastRatio("rgb(239 124 0 / 50%)", "#fff")).toBeCloseTo(
      contrastRatio("#EF7C00", "#fff")!,
      10,
    );
  });

  it("gives up on a value the engine rejects", () => {
    expect(contrastRatio("not-a-colour", "#fff")).toBeNull();
  });
});
