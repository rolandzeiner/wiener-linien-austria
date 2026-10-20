// One config for the whole card toolchain under Vite+ (`vp`): build (Vite 8
// library mode on Rolldown), test (Vitest), lint + type-check (Oxlint with
// tsgolint) and format (Oxfmt). Replaces rolldown.config.mjs.
//
// Decorators are deliberately not configured here. Rolldown reads
// tsconfig.json itself and turns on Lit's legacy (experimental) decorators
// from it; the card and editor suites catch a regression.
import { defineConfig } from "vite-plus";

// A Rolldown `transform` hook runs unchanged as a Vite plugin.
import stripCssComments from "./scripts/strip-css-comments.mjs";

// Four cards, four entrypoints, four bundles (modern + retro + flap + route).
// Each card has an independent CARD_VERSION / RETRO_CARD_VERSION /
// FLAP_CARD_VERSION / ROUTE_CARD_VERSION in src/const.ts so they can rev
// without spurious reload banners on the others.
const CARDS = [
  "wiener-linien-austria-card",
  "wiener-linien-austria-retro-card",
  "wiener-linien-austria-flap-card",
  "wiener-linien-austria-route-card",
];

// Environment names allow only letters, digits, `$` and `_`.
const envName = (card: string) => card.replaceAll("-", "_");

// MUST be a legal comment — `/*! ... */` — not `//`. The minifier strips
// ordinary comments including a `//` banner, silently. `comments: { legal:
// true }` below is the other half of the same requirement.
const banner =
  "/*! Wiener Linien Austria — bundled by Rolldown. Edit sources in src/, then `npm run build`. */";

// Dev vs prod comes from Vite's mode, not from a watch env var: `npm run dev`
// passes `--mode development`, a plain `vp build` is production.
export default defineConfig(({ command, mode }) => {
  const dev = mode === "development";

  // One Vite environment per card. Rolldown rejects several inputs while
  // codeSplitting is off, so `build.lib.entry` cannot be an object; each card
  // keeps its own copy of Lit, as it did under rolldown.config.mjs.
  const card = (name: string) => ({
    consumer: "client" as const,
    build: {
      // Library mode: one ES module, no index.html, no hashed file name.
      lib: { entry: `src/${name}.ts`, formats: ["es" as const], fileName: () => `${name}.js` },
      outDir: "custom_components/wiener_linien_austria/www",
      // www/ sits inside the integration package and holds the vendored
      // fonts; never let Vite wipe it.
      emptyOutDir: false,
      copyPublicDir: false,
      target: "es2022",
      sourcemap: dev,
      rolldownOptions: {
        output: {
          banner,
          // HACS users get a single .js file per card, not a chunked dist/.
          codeSplitting: false,
          comments: { legal: true },
          // Set on the Rolldown output, not `build.minify`: Vite's library
          // mode skips whitespace minification for ES output. Keep console.*
          // (dropConsole: false): the cards' console calls are their only
          // client-side failure signal, and the console.info banner shows
          // which bundle the browser actually loaded. Rolldown's dropConsole
          // is all-or-nothing, so keeping warn/error means keeping everything.
          minify: dev ? false : { compress: { dropConsole: false }, mangle: true, codegen: true },
        },
      },
    },
  });

  return {
    // Production builds only. Off during `npm run dev`, where readable output
    // and working sourcemaps are worth more than bytes, and off under
    // `vp test`, so the suites run against the source as written.
    plugins: [command === "build" && !dev && stripCssComments()].filter(Boolean),
    // The two language packs are over 10 kB each. Vite's defaults would turn
    // them into quoted-key `JSON.parse('…')` strings, which gzip worse than
    // the object literals Rolldown emitted. Both options must be off together
    // (the native plugin ignores `stringify` while `namedExports` is on), and
    // the packs are default-imported in src/localize/localize.ts.
    json: { namedExports: false, stringify: false },
    environments: Object.fromEntries(CARDS.map((c) => [envName(c), card(c)])),
    builder: {
      // Build only the card environments. The default `client` environment
      // would look for an index.html and fail.
      async buildApp(builder) {
        for (const c of CARDS) await builder.build(builder.environments[envName(c)]!);
      },
    },
    fmt: {
      // Leave Lit html/css templates alone. Formatting them rewrites the
      // whitespace inside rendered elements, which changes the DOM.
      embeddedLanguageFormatting: "off",
      // Format the card source only. The bundle is build output; Markdown,
      // YAML and TOML keep their hand formatting.
      ignorePatterns: [
        "custom_components/**",
        "**/*.md",
        ".github/**",
        "*.toml",
        "**/__snapshots__/**",
      ],
    },
    lint: {
      ignorePatterns: ["custom_components/**/www/**"],
      jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
      rules: {
        "vite-plus/prefer-vite-plus-imports": "error",
        // Opt-in rules from the `suspicious` category; the rest of that
        // category is mostly noise for Lit code (e.g. `_private` names).
        "typescript/no-unnecessary-type-assertion": "error",
        "eslint/no-shadow": "error",
        "unicorn/no-array-sort": "error",
      },
      // typeCheck makes `vp check` report tsc's errors (strict tsconfig
      // included), so it can stand in for `tsc --noEmit`.
      // denyWarnings: a warning fails `vp check` (and CI) instead of
      // scrolling past with exit 0.
      options: { typeAware: true, typeCheck: true, denyWarnings: true },
    },
  };
});
