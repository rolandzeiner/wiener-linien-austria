# Contributing to Wiener Linien Austria

Thanks for taking the time to look. This file is the single answer to "how do I work on this repo?" — read it once and you'll have everything you need.

## Dev setup

```bash
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + checks on every commit

npm ci                  # Lovelace card deps
npm run build           # Rolldown builds four bundles into
                        # custom_components/wiener_linien_austria/www/:
                        #   wiener-linien-austria-card.js
                        #   wiener-linien-austria-retro-card.js
                        #   wiener-linien-austria-flap-card.js
                        #   wiener-linien-austria-route-card.js
```

`npm run dev` watches `src/` and rebuilds all four bundles on save.

## Branching & releases

- Work on `dev`. PRs target `dev`.
- A release is a `dev → main` PR, squash-merged. The tag is cut from `main` after the merge, and `dev` is then reset to `main` so the two don't diverge.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Card-version sync

Four cards, four version constants. `manifest.json` is the single source of truth: `const.py` reads it at import and aliases `CARD_VERSION`, `RETRO_CARD_VERSION`, `FLAP_CARD_VERSION` and `ROUTE_CARD_VERSION` to it, so the Python side needs no manual edit. The four literals in `src/const.ts` do — each must equal `manifest.json::version` byte-for-byte. `tests/test_card_version.py` checks every constant against the manifest independently, so a failure names exactly which one drifted.

A version bump is therefore two files: `manifest.json` and `src/const.ts`. The TS constants drive the served `?v=…` query string; the Python constants drive the WebSocket version check. If they drift, users get an infinite reload-banner loop — the card sees a mismatch, shows the reload banner, the reload re-serves the same JS, and the banner comes straight back.

Because the TS literals are asserted equal to the manifest, none of the four can carry a `-beta-N` suffix on its own; the manifest version is whatever the cards say. Bump both files in the same commit as a rebuilt bundle — `validate.yml` asserts the committed `www/` matches a fresh `npm run build`. The README badge auto-fetches the latest release tag, so it needs no manual edit.

## Tooling & config

- `pyproject.toml` — source of truth for ruff (target-version, line-length), mypy (strict, ignore_missing_imports, files), and coverage config. Change rules here, not in CI flags.
  - **`target-version` tracks the oldest Python we support, never the one CI runs.** `hacs.json` promises HA ≥ 2025.6.0, which runs on Python 3.13, so `target-version = "py313"` — even though the venv and CI are on 3.14. Pointing it at the CI interpreter lets ruff rewrite code into syntax our users cannot parse and then stay silent about it; that is how v1.7.1 shipped a SyntaxError (issue #91). The `compile-floor-python` CI job byte-compiles the shipped package on 3.13 as an independent backstop. Raise all three together or not at all.
- `scripts/strip-css-comments.mjs` — a `transform` plugin (Rolldown speaks the
  Rollup plugin API) that removes comments and indentation from Lit ``css``
  templates in production builds. A minifier only minifies JavaScript, and a
  tagged template's contents are string data, so without this every explanatory
  CSS comment shipped to users; it was 17.8% of the modern bundle. Comments stay
  intact in `npm run dev`. It has to run *after* the transpile step.
- `pytest.ini` — pytest config and the **`--cov-fail-under=95` coverage gate**. `pytest tests/` automatically runs with coverage; CI fails fast if a new commit drops coverage below the gate. Current measurement sits ~98% (98.54% on 2026-09-15).
  - **The package total is only half the gate.** The Silver `test-coverage` rule is per module, and a single number cannot express it: one module can slide to 80% while the others carry the average past the floor. That was this repo's actual state — 91.81% total with `diagnostics.py` at 84% and `quality_scale.yaml` claiming `done`. `--cov-report=json` writes `coverage.json`, and `scripts/check_module_coverage.py` fails on any module below 95%. CI runs it right after pytest; run it locally too, because pytest alone will not tell you a module regressed:

    ```bash
    .venv/bin/python -m pytest tests/ -q
    .venv/bin/python scripts/check_module_coverage.py
    ```
- `ATTRIBUTION` — canonical data-source statement (Wiener Linien OGD, CC BY 4.0) and licence terms; matches the `attribution` attribute every sensor emits. Update when the upstream API or licence wording changes, and keep the two code copies in sync: `const.ATTRIBUTION` for the sensors and diagnostics, and `ATTRIBUTION_FALLBACK` in `src/const.ts`, which the card footers show until a sensor reports its own.

## Dependency policy

`requirements_test.txt` carries its own rules in its header comment. This section covers `package.json`, which is JSON and cannot.

**Runtime vs dev is a real distinction here, not bookkeeping.** The package is `private` and nothing ever installs it, so the split looks cosmetic — but CI runs `npm audit --omit=dev --audit-level=high`, and that gate only means something because the packages that actually reach a user's browser inside the bundle are the ones in `dependencies`. A build-time tool belongs in `devDependencies` even though the build needs it; anything Rolldown inlines into `www/*.js` belongs in `dependencies`.

**When to pin exactly vs. allow a caret:**

- **Caret (`^x.y.z`)** is for actively maintained runtime packages that keep semver honestly. `lit` is the only one left — everything else here meets one of the cases below.
- **Exact (`x.y.z`)** for four specific cases:
  1. **The package is unmaintained**, so a range floats over code nobody is watching. `qr-creator` is at its only release, built with a 2019 toolchain.
  2. **The "version" is really content, not an API.** A patch release can change what you get without changing any signature.
  3. **The version is mirrored somewhere else** and the two must move together. `vitest` is exact because its version and the `vite`/`rolldown` stack under it decide whether `?raw` imports keep working. `@vitest/coverage-v8` is exact for the same reason and must be bumped in lockstep with `vitest` — the provider reaches into vitest internals and refuses to load on a mismatched minor.
  4. **The package decides what the committed bundle looks like.** `validate.yml` asserts `www/*.js` matches a fresh build, so a floating `rolldown` or `typescript` can turn a clean tree red with no source change — and a transpiler bump that alters decorator output breaks Lit reactivity while the build stays green. Both are exact. `happy-dom` is exact on the same logic one layer down: it decides what the DOM suites see.

Bumping an exact pin is a deliberate act — say why in the commit message. Dependabot raises these as their own PRs rather than folding them into the monthly batch; the npm groups only cover minor and patch.

**Before adding a dependency, check it earns its place.** The bundle is served to every user on every dashboard load. Prefer inlining a constant over depending on a package that exports thousands of them: `utils/mdi-paths.ts` and `utils/retro-station-icons.ts` both vendor icon path geometry with provenance comments rather than pulling an icon library, because path data is content and the bundler was tree-shaking all but a handful of exports anyway.

**Build plugins are load-bearing or they are removed.** `validate.yml` asserts the committed bundles match a fresh build, so any plugin that changes output is part of that contract. Rolldown does resolution, JSON, CommonJS interop, transpilation and minification natively, which is why the whole `@rollup/plugin-*` stack is gone rather than ported — `strip-css-comments` is the only plugin left, and it is there because nothing built in does its job.

**Two output options are load-bearing and fail silently.** The banner must be a **legal** comment — `/*! ... */` — with `comments: { legal: true }`; a `//` banner is stripped by the minifier and only the built file's first bytes reveal it. And **`dropConsole` stays `false`**: rolldown's option is a boolean rather than terser's per-method array, so it is all-or-nothing, and most `console.*` calls in these cards sit in `catch` blocks where dropping them turns a caught error into a silent one.

**The card bundles are excluded from the `end-of-file-fixer` / `trailing-whitespace` pre-commit hooks.** The exclude pattern, `^custom_components/.*/www/.*\.js$`, covers all four. Rolldown emits no trailing newline, so a hook that "fixes" the file *after* the build leaves the committed bundle out of sync with a fresh one — exactly what `validate.yml` asserts byte-for-byte. `output.footer: "\n"` does not work around it; the minifier strips trailing whitespace.

**The bundler does not type-check, and `tsc` is the only type-checker.** Rolldown strips types without checking them, and TypeScript 7's npm package ships no JS compiler API a bundler plugin could drive. `npx tsc --noEmit` type-checks. Two consequences worth knowing:

- **The bundler checks nothing.** A type error will not fail `npm run build`. `tsc --noEmit` is the single gate between a type error and a shipped bundle, which is why `validate.yml` runs it as its own step.
- **Decorator settings live only in `tsconfig.json`.** Lit 3's `@customElement` / `@property` are legacy decorators that need `useDefineForClassFields: false`. Rolldown reads `tsconfig.json` itself, so don't restate them in `rolldown.config.mjs`. If it ever regresses, class fields overwrite Lit's accessors and reactivity dies silently while the build stays green — diff the Lit reactive-property list of a built bundle to catch it.

There is no `tslib`: `tsconfig.json` sets no `importHelpers`, so `__decorate` is inlined into the bundles.

View per-file coverage locally:

```bash
pytest tests/ --cov-report=term-missing   # Python
npm run test:coverage                     # cards
```

`npm run test:coverage:gate` is the same run with thresholds attached, and is
what CI enforces. Both carry their whole configuration as CLI flags rather than
a vitest config file, for the reason in **Card tests** below.

**Whether `--coverage.include` reports a file no test imports depends on the
vitest major, and it has flipped twice.** Vitest 3 did, through `coverage.all`.
Vitest 4 removed that, and the v8 provider instrumented only modules a run
actually loaded. Vitest 5 (current) reports them again, as 0% rows. Verify it in
one command rather than believing this paragraph:

```bash
npx vitest run src/utils/time.test.ts --coverage --coverage.provider=v8 \
  --coverage.reporter=text --coverage.include='src/stop-combobox.ts'
# vitest 5 -> a 0% row for stop-combobox.ts; vitest 4 printed an empty table
```

Under vitest 4 that is why the three departure-board card entrypoints, then the
largest files in the tree, were absent from the coverage report until
`src/card-smoke.test.ts` existed, rather than listed at 0%. The headline
percentage was computed over a denominator that excluded them. Adding the smoke
tests moved covered statements from 833 to 1480 and the reported percentage
*down* from 56.35% to 52.59%. **A falling number here can mean the denominator
got honest**; read the covered/total counts, not the percentage, before
concluding anything about a coverage change. Every card source is imported by
some test today, so the move to vitest 5 left the totals where they were
(68.14% to 68.15% statements).

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
the smoke tests fixed that at the source. `coverage/` is gitignored and sits
outside `custom_components/`, so `scripts/dev-push.sh` never ships it (a file
inside `custom_components/` would ship regardless: `.gitignore` does not filter
rsync).

## Card tests

`npm test` runs vitest over `src/**/*.test.ts`. There is no vitest config file,
and adding one is usually the wrong move — the suite runs in two environments and
picks between them per file:

- **node (the default)** for the pure functions: config normalisers, departure
  filtering, time and colour helpers, the catalogue-health checks in
  `src/localize/localize.test.ts`.
- **happy-dom**, opted into with a `@vitest-environment happy-dom` line in the
  file's leading comment, for anything that needs a DOM. Six of the 24 test
  files today: `card-smoke.test.ts` mounts the three departure-board cards,
  `editor-smoke.test.ts` mounts their three editors and asserts the
  `config-changed` payload, `route-card.test.ts` covers the route card, its
  ad-hoc mode and its editor,
  `editor/header-strip.test.ts` drives the signage-strip editor,
  `shared-render.test.ts` covers the stale-cache reload machinery, and
  `utils/traffic-notice.test.ts` needs `DOMParser` to extract notice prose.

Opt in per file rather than globally: only the suites that need a DOM should pay
for booting one.

The HA components the editors host (`ha-form`, `ha-icon`, `ha-alert`,
`ha-icon-picker`) are deliberately never defined in tests. An undefined element
is inert, Lit renders straight through it, and not stubbing them is what keeps
this layer free of a test harness.

Two things happy-dom gets wrong, so don't chase them: its `outline` shorthand
parser drops CSS system colours (`CanvasText`, `Highlight`) and mangles `var()`.
Both are fine in every browser HA supports — assert on the source, not on parsed
`cssText`.

## On-demand route planning

The route card can plan between any two stops without a route entry. That path
has more moving parts than the rest of the integration, and a few of them are
easy to break without a test noticing.

**Where it lives.** `websocket.py` holds the two commands the card calls,
`wiener_linien_austria/stops` and `wiener_linien_austria/plan`. `adhoc.py`
holds the planner behind `plan` and the `plan_trip` action: cache, coalescing,
per-user and instance budgets, and the stale fallback. `stops.py` builds the
stop list the setup dialog and the card share. On the card side,
`src/stop-combobox.ts` is the picker and `src/utils/route.ts` holds the refresh
cadence, error table and stop filter.

**Why the commands are registered in `async_setup`.** `websocket_api` has no
deregister hook, so a command can't be tied to an entry's lifetime: whatever
registers it, it stays until HA restarts. `async_setup` runs once per HA
process, which makes it the one place a single registration is guaranteed. The trade-off is that the
handlers outlive a removed integration, so every command answers `not_loaded`
unless an entry of the domain is loaded. Keep that check in any command you add.

**One planning path.** `route_coordinator.async_plan_trips` is the only function
that fetches, parses and ranks a trip request. Route entries, `plan_trip`, the
card's `plan` command and the config flow's setup probe all go through it, so
they can't disagree about the same query. In tests, patch the fetch at
`custom_components.wiener_linien_austria.route_coordinator.async_fetch_trip_body`
(the name `route_coordinator` imported), not in `routing.py`. The fixtures in
`tests/conftest.py` already do.

**The fair-use numbers are measured, not picked.** The backend constants sit at
the top of `adhoc.py`: a 60 s cache, a 5 min stale limit, 120 requests an hour
(burst 10) for the instance and 60 (burst 5) per user. The card's sit in
`src/utils/route.ts`: a 120 s refresh while on screen, a 60 s rollover floor,
a 30 min idle pause and a 400 ms debounce. They were sized against the routing
backend's measured capabilities (the block in `const.py`) and the load a
configured route already makes.
Changing any of them means re-measuring with the `api-polling` skill's probe
first, and updating the README's Data Updates section in the same commit.

**Privacy.** A stop pair picked on a dashboard is a movement pattern. The card
keeps the last pick in the browser's `localStorage`, and the backend keeps plans
in memory for at most 5 minutes and clears them when the last entry unloads.
Don't add stop pairs to diagnostics, the recorder or any log above `debug`.

**Tests.** `tests/test_adhoc.py` covers both commands and the planner. Its
`_connect` helper authenticates the WebSocket client **before** freezing time.
The auth token is stamped with the real clock, and a clock frozen earlier than
that rejects it, so a new test that freezes first fails at login rather than at
the assertion. On the card side, `src/route-card.test.ts` installs an in-memory
`localStorage` in `beforeEach`, because happy-dom leaves it undefined.

## Snapshot tests

Diagnostics output is pinned via `syrupy`. Snapshots live under `tests/snapshots/`. After an intentional change to the diagnostics shape (new field, redaction-set drift), regenerate:

```bash
pytest tests/test_diagnostics.py --snapshot-update
```

Commit the updated `.ambr` file alongside the code change so the diff is reviewable.

## Verification gate (must pass before pushing)

```bash
source .venv/bin/activate
pytest tests/ -q
python scripts/check_module_coverage.py   # per-module floor, reads coverage.json
mypy --strict --ignore-missing-imports custom_components/wiener_linien_austria
ruff check .
ruff format --check .   # separate: `ruff check` never inspects formatting
FLOOR=$(sed -n 's/^target-version = "py3\([0-9]*\)"/3.\1/p' pyproject.toml)
uv run --python "$FLOOR" --no-project python -m compileall -q custom_components/wiener_linien_austria
npx tsc --noEmit
npm test
npm run test:coverage:gate
npm run build           # commit the rebuilt www/*.js with any src/ change
python3 scripts/readme_toc.py --check   # README table of contents matches its ## headings
```

**The README's table of contents is generated.** Don't edit the list between `<!-- toc -->` and `<!-- tocstop -->`: `python3 scripts/readme_toc.py` rebuilds it from the `##` headings, and the `readme-toc` pre-commit hook does that on every commit that touches `README.md`.

CI runs the same checks plus hassfest + HACS validation, the Lit template backtick guard, `npm audit`, and a byte-for-byte check that the committed bundles match a fresh build. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Wiener Linien Austria version
- Diagnostics download (Settings → Devices & Services → Wiener Linien Austria → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
