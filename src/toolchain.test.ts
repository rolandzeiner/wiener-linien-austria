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
 *
 * The provider has a required `vitest` peer, so `vp migrate` also declares
 * `vitest` directly and overrides it to the same version, keeping the graph
 * on a single Vitest instead of relying on npm hoisting vite-plus's copy.
 * Both pins follow the bundled Vitest as well.
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

  it("pins vitest and its override to the Vitest bundled with vite-plus", () => {
    expect(pkg.devDependencies.vitest).toBe(vitePlusPkg.dependencies.vitest);
    expect(pkg.overrides.vitest).toBe(vitePlusPkg.dependencies.vitest);
  });
});
