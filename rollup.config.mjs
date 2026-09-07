import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

import stripCssComments from "./scripts/strip-css-comments.mjs";

const dev = !!process.env.ROLLUP_WATCH;

const banner =
  "// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.";

const onwarn = (warning, warn) => {
  if (
    warning.code === "THIS_IS_UNDEFINED" &&
    warning.id?.includes("/node_modules/")
  ) {
    return;
  }
  warn(warning);
};

// No @rollup/plugin-commonjs here on purpose. Every runtime dependency
// (lit, qr-creator) ships an ESM `module` entry, so node-resolve picks
// the ESM build and there is no CJS left in the graph — verified by
// building all three bundles with and without the plugin and getting
// byte-identical output. If a future dependency is CJS-only, rollup
// fails loudly with "is not exported by", and the fix is to reinstate
// the plugin here.
const basePlugins = () =>
  [
    nodeResolve(),
    typescript(),
    // Strictly after typescript() — see the plugin's header for why placing it
    // earlier makes it a silent no-op.
    !dev && stripCssComments(),
    json(),
    !dev && terser({ format: { comments: /Wiener Linien Austria/ } }),
  ].filter(Boolean);

// Three cards, three entrypoints, three bundles (modern + retro + flap).
// Each card has an independent CARD_VERSION / RETRO_CARD_VERSION /
// FLAP_CARD_VERSION in src/const.ts so they can rev without spurious
// reload banners on the others.
export default [
  {
    input: "src/wiener-linien-austria-card.ts",
    output: {
      file: "custom_components/wiener_linien_austria/www/wiener-linien-austria-card.js",
      format: "es",
      sourcemap: dev,
      banner,
      inlineDynamicImports: true,
    },
    plugins: basePlugins(),
    onwarn,
  },
  {
    input: "src/wiener-linien-austria-retro-card.ts",
    output: {
      file: "custom_components/wiener_linien_austria/www/wiener-linien-austria-retro-card.js",
      format: "es",
      sourcemap: dev,
      banner,
      inlineDynamicImports: true,
    },
    plugins: basePlugins(),
    onwarn,
  },
  {
    input: "src/wiener-linien-austria-flap-card.ts",
    output: {
      file: "custom_components/wiener_linien_austria/www/wiener-linien-austria-flap-card.js",
      format: "es",
      sourcemap: dev,
      banner,
      inlineDynamicImports: true,
    },
    plugins: basePlugins(),
    onwarn,
  },
];
