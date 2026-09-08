// Transpiler note: this was @rollup/plugin-typescript until TypeScript 7.
// TS 7 is the Go-native compiler and its npm package no longer ships the JS
// compiler API — `require("typescript")` now resolves to lib/version.cjs, so
// ts.createProgram / ts.ScriptTarget are undefined and that plugin dies at
// load with "Cannot read properties of undefined (reading 'ES2015')".
// @rollup/plugin-typescript has had no release since 2025-10, i.e. none that
// knows about TS 7. swc transpiles instead; `tsc --noEmit` still type-checks.
import { readFileSync } from "node:fs";

import { swc } from "@rollup/plugin-swc";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

import stripCssComments from "./scripts/strip-css-comments.mjs";

const dev = !!process.env.ROLLUP_WATCH;

// Derive swc's transpile settings from tsconfig.json rather than restating
// them. swc has its own decorator implementation, so if these ever disagree
// with tsconfig the bundle silently stops matching what tsc type-checked —
// and the failure mode (Lit reactivity quietly dead) does not look like a
// config bug. Reading them here makes that class of drift impossible.
const tsconfig = JSON.parse(readFileSync("./tsconfig.json", "utf8"));
const { target, experimentalDecorators, useDefineForClassFields } =
  tsconfig.compilerOptions;

const banner =
  "// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.";

// No @rollup/plugin-commonjs here on purpose. Every runtime dependency
// (lit, qr-creator) ships an ESM `module` entry, so node-resolve picks
// the ESM build and there is no CJS left in the graph — verified by
// building all three bundles with and without the plugin and getting
// byte-identical output. If a future dependency is CJS-only, rollup
// fails loudly with "is not exported by", and the fix is to reinstate
// the plugin here.
const basePlugins = () =>
  [
    // `extensions` is required by the swc switch: @rollup/plugin-typescript
    // resolved module specifiers itself, swc does not, so Rollup must be told
    // .ts is resolvable. This also covers the repo's `.js`-suffixed relative
    // specifiers (`./types.js` -> src/types.ts), which node-resolve maps once
    // .ts is in `extensions`; verified by the bundles staying self-contained.
    nodeResolve({ extensions: [".ts", ".mjs", ".js", ".json"] }),
    swc({
      // Scope to .ts only, or swc also grabs src/localize/languages/*.json
      // (now resolvable via nodeResolve's `extensions`) and tries to parse
      // the translations as TypeScript.
      include: /\.ts$/,
      swc: {
        jsc: {
          // Lit 3's @customElement / @property are LEGACY (experimental)
          // decorators, and useDefineForClassFields must stay false or class
          // fields overwrite Lit's accessors and reactivity silently dies.
          // Both come from tsconfig above. swc does no type-checking at all —
          // `tsc --noEmit` is the only thing between a type error and a green
          // build, which is why CI runs it as a separate step.
          target,
          parser: { syntax: "typescript", decorators: experimentalDecorators },
          transform: {
            legacyDecorator: experimentalDecorators,
            decoratorMetadata: false,
            useDefineForClassFields,
          },
        },
      },
    }),
    // Strictly after the transpiler — see the plugin's header for why placing
    // it earlier makes it a silent no-op.
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
  },
];
