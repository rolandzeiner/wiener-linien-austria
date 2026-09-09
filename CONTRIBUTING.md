# Contributing to Wiener Linien Austria

Thanks for taking the time to look. This file is the single answer to "how do I work on this repo?" — read it once and you'll have everything you need.

## Dev setup

```bash
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + checks on every commit

npm ci                  # Lovelace card deps
npm run build           # Rolldown builds three bundles into
                        # custom_components/wiener_linien_austria/www/:
                        #   wiener-linien-austria-card.js
                        #   wiener-linien-austria-retro-card.js
                        #   wiener-linien-austria-flap-card.js
```

`npm run dev` watches `src/` and rebuilds all three bundles on save.

## Branching & releases

- Work on `dev`. PRs target `dev`.
- Releases are tagged from `main` after merging `dev → main`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Card-version sync

Three cards, three version constants. `manifest.json` is the single source of truth: `const.py` reads it at import and aliases `CARD_VERSION`, `RETRO_CARD_VERSION` and `FLAP_CARD_VERSION` to it, so the Python side needs no manual edit. The three literals in `src/const.ts` do — each must equal `manifest.json::version` byte-for-byte. `tests/test_card_version.py` checks every constant against the manifest independently, so a failure names exactly which one drifted.

A version bump is therefore two files: `manifest.json` and `src/const.ts`. The TS constants drive the served `?v=…` query string; the Python constants drive the WebSocket version check. If they drift, users get an infinite reload-banner loop — the card sees a mismatch, shows the reload banner, the reload re-serves the same JS, and the banner comes straight back.

Because the TS literals are asserted equal to the manifest, none of the three can carry a `-beta-N` suffix on its own; the manifest version is whatever the cards say. Bump both files in the same commit as a rebuilt bundle — `validate.yml` asserts the committed `www/` matches a fresh `npm run build`. The README badge auto-fetches the latest release tag, so it needs no manual edit.

## Tooling & config

- `pyproject.toml` — source of truth for ruff (target-version, line-length), mypy (strict, ignore_missing_imports, files), and coverage config. Change rules here, not in CI flags.
  - **`target-version` tracks the oldest Python we support, never the one CI runs.** `hacs.json` promises HA ≥ 2025.6.0, which runs on Python 3.13, so `target-version = "py313"` — even though the venv and CI are on 3.14. Pointing it at the CI interpreter lets ruff rewrite code into syntax our users cannot parse and then stay silent about it; that is how v1.7.1 shipped a SyntaxError (issue #91). The `compile-floor-python` CI job byte-compiles the shipped package on 3.13 as an independent backstop. Raise all three together or not at all.
- `scripts/strip-css-comments.mjs` — a Rollup-API `transform` plugin that removes
  comments and indentation from Lit ``css`` templates in production builds. A
  minifier only minifies JavaScript, and a tagged template's contents are string
  data, so without this every explanatory CSS comment shipped to users; it was
  17.8% of the modern bundle. Comments stay intact in `npm run dev`. It carried
  over to `rolldown.config.mjs` unchanged — rolldown implements the Rollup plugin
  API — and still runs *after* the transpile step, which is the ordering it needs.
- `pytest.ini` — pytest config and the **`--cov-fail-under=90` coverage gate**. `pytest tests/` automatically runs with coverage; CI fails fast if a new commit drops coverage below the gate. Current measurement sits ~91%.
- `ATTRIBUTION` — canonical data-source statement (Wiener Linien OGD, CC BY 4.0) and licence terms; matches the `attribution` attribute every sensor emits. Update when the upstream API or licence wording changes (and keep `const.ATTRIBUTION` in sync).

## Dependency policy

`requirements_test.txt` carries its own rules in its header comment. This section covers `package.json`, which is JSON and cannot.

**Runtime vs dev is a real distinction here, not bookkeeping.** The package is `private` and nothing ever installs it, so the split looks cosmetic — but CI runs `npm audit --omit=dev --audit-level=high`, and that gate only means something because the packages that actually reach a user's browser inside the bundle are the ones in `dependencies`. A build-time tool belongs in `devDependencies` even though the build needs it; anything Rolldown inlines into `www/*.js` belongs in `dependencies`.

**When to pin exactly vs. allow a caret:**

- **Caret (`^x.y.z`)** is the default. Use it for actively maintained packages that keep semver honestly — `lit`, `rolldown`, `typescript`.
- **Exact (`x.y.z`)** for three specific cases:
  1. **The package is unmaintained**, so a range floats over code nobody is watching. `qr-creator` is at its only release, built with a 2019 toolchain.
  2. **The "version" is really content, not an API.** A patch release can change what you get without changing any signature.
  3. **The version is mirrored somewhere else** and the two must move together. `vitest` is exact because its version and the `vite`/`rolldown` stack under it decide whether `?raw` imports keep working. `@vitest/coverage-v8` is exact for the same reason and must be bumped in lockstep with `vitest` — the provider reaches into vitest internals and refuses to load on a mismatched minor.

Bumping an exact pin is a deliberate act — say why in the commit message.

**Before adding a dependency, check it earns its place.** The bundle is served to every user on every dashboard load. Prefer inlining a constant over depending on a package that exports thousands of them: `utils/mdi-paths.ts` and `utils/retro-station-icons.ts` both vendor icon path geometry with provenance comments rather than pulling an icon library, because path data is content and the bundler was tree-shaking all but a handful of exports anyway.

**Build plugins are load-bearing or they are removed.** `validate.yml` asserts the committed bundles match a fresh build, so any plugin that changes output is part of that contract. Rolldown does resolution, JSON, CommonJS interop, transpilation and minification natively, which is why the whole `@rollup/plugin-*` stack is gone rather than ported — `strip-css-comments` is the only plugin left, and it is there because nothing built in does its job.

**Two output options are load-bearing and fail silently.** The banner must be a **legal** comment — `/*! ... */` — with `comments: { legal: true }`; a `//` banner is stripped by the minifier and only the built file's first bytes reveal it. And **`dropConsole` stays `false`**: rolldown's option is a boolean rather than terser's per-method array, so it is all-or-nothing, and most `console.*` calls in these cards sit in `catch` blocks where dropping them turns a caught error into a silent one.

**The three bundles are excluded from the `end-of-file-fixer` / `trailing-whitespace` pre-commit hooks.** Rolldown emits no trailing newline where Rollup did, so a hook that "fixes" the file *after* the build leaves the committed bundle out of sync with a fresh one — exactly what `validate.yml` asserts byte-for-byte. `output.footer: "\n"` does not work around it; the minifier strips trailing whitespace.

**The bundler does not type-check, and `tsc` is the only type-checker.** This has been true since the move off `@rollup/plugin-typescript` (TypeScript 7 is the Go-native compiler and its npm package no longer ships the JS compiler API, so that plugin dies at load). swc filled the gap for one release cycle; rolldown does the transpile now. `npx tsc --noEmit` still type-checks. Two consequences worth knowing:

- **The bundler checks nothing.** A type error will not fail `npm run build`. `tsc --noEmit` is the single gate between a type error and a shipped bundle, which is why `validate.yml` runs it as its own step.
- **Decorator settings are no longer restated anywhere.** Lit 3's `@customElement` / `@property` are legacy decorators that need `useDefineForClassFields: false`. swc needed that spelled out, and `rollup.config.mjs` derived it from `tsconfig.json` to stop the two drifting; rolldown reads `tsconfig.json` itself, so there is only one copy now. If it ever regresses, class fields overwrite Lit's accessors and reactivity dies silently while the build stays green — diff the Lit reactive-property list of a built bundle to catch it.

`tslib` went with `@rollup/plugin-typescript`. Nothing imports it from source and the bundles contain zero references to it — `tsconfig.json` sets no `importHelpers`, so `__decorate` is inlined. It was only ever a hard preflight check inside that plugin, which is why it read as dead weight for so long. Its `.fallowrc.json` `ignoreDependencies` entry went with it.

View per-file coverage locally:

```bash
pytest tests/ --cov-report=term-missing   # Python
npm run test:coverage                     # cards
```

`npm run test:coverage:gate` is the same run with thresholds attached, and is
what CI enforces. Both carry their whole configuration as CLI flags rather than
a vitest config file, for the reason in **Card tests** below.

**`--coverage.include` does not make vitest report a file no test imports.**
That was true under vitest 3's `coverage.all`; vitest 4 removed it, and the v8
provider instruments only modules a run actually loads. An earlier revision of
this file claimed the opposite. Verify it in one command rather than believing
either version:

```bash
npx vitest run --coverage --coverage.provider=v8 \
  --coverage.reporter=text --coverage.include='src/some-unimported-file.ts'
# -> empty table, "100% (0/0)" — not a 0% row
```

This is why the three card entrypoints — 6,568 lines, the entire user-visible
surface — were absent from the coverage report until `src/card-smoke.test.ts`
existed, rather than listed at 0%. The headline percentage was computed over a
denominator that excluded the largest files in the tree. Adding the smoke tests
moved covered statements from 833 to 1480 and the reported percentage *down*
from 56.35% to 52.59%. **A falling number here can mean the denominator got
honest**; read the covered/total counts, not the percentage, before concluding
anything about a coverage change.

The thresholds are a ratchet, not a target: they sit a few points under the
measured number so a legitimate refactor doesn't trip them while a chunk of
newly-untested code does. Raise them when coverage rises; don't lower them
without saying why.

`--coverage.reporter=json` writes `coverage/coverage-final.json` in Istanbul
format, which is what `fallow health --coverage` reads. Feeding fallow real
coverage instead of its estimate cut the findings above threshold from 128 to
100 and the criticals from 53 to 36 — the difference was all false alarms on
covered code. The three card files used to report as `estimated` there because
no test imported them, leaving V8 to emit a stub entry with an empty `fnMap`;
the smoke tests fixed that at the source. `coverage/` is gitignored, and
excluded from `scripts/dev-push.sh` — `.gitignore` does not filter rsync.

## Card tests

`npm test` runs vitest over `src/**/*.test.ts`. There is no vitest config file,
and adding one is usually the wrong move — the suite runs in two environments and
picks between them per file:

- **node (the default)** for the pure functions: config normalisers, departure
  filtering, time and colour helpers, the catalogue-health checks in
  `src/localize/localize.test.ts`.
- **happy-dom**, opted into with a `// @vitest-environment happy-dom` docblock on
  the first line, for anything that renders a component. `src/editor/editor-smoke.test.ts`
  is the only such file today; it mounts the three card editors, drives a control
  and asserts the `config-changed` payload.

The HA components the editors host (`ha-form`, `ha-icon`, `ha-alert`,
`ha-icon-picker`) are deliberately never defined in tests. An undefined element
is inert, Lit renders straight through it, and not stubbing them is what keeps
this layer free of a test harness.

Two things happy-dom gets wrong, so don't chase them: its `outline` shorthand
parser drops CSS system colours (`CanvasText`, `Highlight`) and mangles `var()`.
Both are fine in every browser HA supports — assert on the source, not on parsed
`cssText`.

## Snapshot tests

Diagnostics output is pinned via `syrupy`. Snapshots live under `tests/snapshots/`. After an intentional change to the diagnostics shape (new field, redaction-set drift), regenerate:

```bash
pytest tests/test_diagnostics.py --snapshot-update
```

Commit the updated `.ambr` file alongside the code change so the diff is reviewable.

## Verification gate (must pass before pushing)

```bash
pytest tests/ -v
mypy --strict --ignore-missing-imports custom_components/wiener_linien_austria
ruff check .
ruff format --check .   # separate: `ruff check` never inspects formatting
npx tsc --noEmit
npm test
npm run build
```

CI runs the same checks plus hassfest + HACS validation. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Wiener Linien Austria version
- Diagnostics download (Settings → Devices & Services → Wiener Linien Austria → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
