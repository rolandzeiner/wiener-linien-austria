import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

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

const basePlugins = () =>
  [
    nodeResolve(),
    commonjs(),
    typescript(),
    json(),
    !dev && terser({ format: { comments: /Wiener Linien Austria/ } }),
  ].filter(Boolean);

// Two cards, two entrypoints, two bundles — mirrors the two JS files the
// integration has served since v0.1.0. Each card has an independent
// CARD_VERSION in src/const.ts so they can rev without spurious reload
// banners on the other.
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
];
