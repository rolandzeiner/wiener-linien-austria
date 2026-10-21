/**
 * Guards the hand-maintained pins in package.json.
 *
 * The `vite` override points every Vite consumer at Vite+'s core, so npm
 * installs one Vite instead of hoisting upstream vite next to it. It names
 * an exact core version, and Dependabot bumps `vite-plus` without touching
 * overrides. Left behind, npm would quietly run the new Vite+ CLI on the
 * old core. Bump both in the same commit.
 *
 * `@vitest/coverage-v8` stays a devDependency because CI enforces the
 * coverage floor. It must match the Vitest that Vite+ bundles exactly, or
 * the provider loads against a different Vitest. `vp migrate` re-pins it.
 */
import { describe, expect, it } from "vite-plus/test";

import pkg from "../package.json";
import vitePlusPkg from "../node_modules/vite-plus/package.json";

describe("toolchain pins", () => {
  it("keeps the vite override on the installed vite-plus version", () => {
    expect(pkg.overrides.vite).toBe(
      `npm:@voidzero-dev/vite-plus-core@${pkg.devDependencies["vite-plus"]}`,
    );
  });

  it("pins the coverage provider to the Vitest bundled with vite-plus", () => {
    expect(pkg.devDependencies["@vitest/coverage-v8"]).toBe(vitePlusPkg.dependencies.vitest);
  });
});
