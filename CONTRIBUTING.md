# Contributing to Wiener Linien Austria

Thanks for taking the time to look. This file is the single answer to "how do I work on this repo?" — read it once and you'll have everything you need.

## Dev setup

```bash
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + checks on every commit

npm ci                  # Lovelace card deps
npm run build           # vp builds four bundles into
                        # custom_components/wiener_linien_austria/www/:
                        #   wiener-linien-austria-card.js
                        #   wiener-linien-austria-retro-card.js
                        #   wiener-linien-austria-flap-card.js
                        #   wiener-linien-austria-route-card.js
```

`npm run dev` watches `src/` and rebuilds all four bundles on save.

## Branching & releases

- Work on `dev`. PRs target `dev`.
- A release is a `dev → main` PR, squash-merged. The tag is cut from `main` after the merge. `dev` is then rebuilt on top of `main`, keeping any commits that landed on `dev` after the PR, such as a Dependabot bump. A plain reset to `main` would drop them.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Card-version sync

Four cards, four version constants. `manifest.json` is the single source of truth: `const.py` reads it at import and aliases `CARD_VERSION`, `RETRO_CARD_VERSION`, `FLAP_CARD_VERSION` and `ROUTE_CARD_VERSION` to it, so the Python side needs no manual edit. The four literals in `src/const.ts` do — each must equal `manifest.json::version` byte-for-byte. `tests/test_card_version.py` checks every constant against the manifest independently, so a failure names exactly which one drifted.

A version bump is therefore two files: `manifest.json` and `src/const.ts`. The TS constants drive the served `?v=…` query string; the Python constants drive the WebSocket version check. If they drift, users get an infinite reload-banner loop — the card sees a mismatch, shows the reload banner, the reload re-serves the same JS, and the banner comes straight back.

Because the TS literals are asserted equal to the manifest, none of the four can carry a `-beta-N` suffix on its own; the manifest version is whatever the cards say. Bump both files in the same commit as a rebuilt bundle — `validate.yml` asserts the committed `www/` matches a fresh `npm run build`. The README badge auto-fetches the latest release tag, so it needs no manual edit.

## Tooling & config

- `pyproject.toml` — source of truth for ruff (target-version, line-length), mypy (strict, ignore_missing_imports, files), and coverage config. Change rules here, not in CI flags.
  - **`target-version` tracks the oldest Python we support, never the one CI runs.** `hacs.json` promises HA ≥ 2025.6.0, which runs on Python 3.13, so `target-version = "py313"` — even though the venv and CI are on 3.14. Pointing it at the CI interpreter lets ruff rewrite code into syntax our users cannot parse and then stay silent about it; that is how v1.7.1 shipped a SyntaxError (issue #91). The `compile-floor-python` CI job byte-compiles the shipped package on 3.13 as an independent backstop. Raise all three together or not at all.
- `vite.config.ts` — the whole card toolchain, run through [Vite+](https://viteplus.dev/) (`vp`): `vp build` (Vite library mode on Rolldown), `vp test` (Vitest) and `vp check` (Oxfmt + Oxlint + type-check). Vitest, Rolldown and the type-checker all ship inside `vite-plus`; `typescript` is not installed. Each card is its own Vite environment with its own bundle and its own copy of Lit, and `builder.buildApp` builds exactly those four. Things there that fail silently if you change them:
  - **`minify` lives on `rolldownOptions.output`**, not `build.minify`: Vite's library mode skips whitespace minification for ES output.
  - **Dev vs prod comes from `--mode development`** (`npm run dev`). A plain `vp build` is production: minified, no sourcemap, CSS comments stripped. A dev build writes `.map` files into `www/`; they are gitignored, so they never get committed.
  - **`emptyOutDir: false`.** `www/` also holds the vendored fonts, and Vite empties the output directory by default.
  - **`json: { namedExports: false, stringify: false }`, with default imports** (`import de from "./languages/de.json"`). Both language packs are over 10 kB, and Vite's defaults would ship them as `JSON.parse('…')` strings that gzip worse. With named exports off, `import * as de` yields only `{ default }`: every lookup misses and the card shows raw keys. The card suites catch that.
  - **`fmt.embeddedLanguageFormatting: "off"`.** Oxfmt would otherwise reformat the Lit `html` / `css` templates, which changes the whitespace inside rendered elements.
  - **`lint.options.denyWarnings: true`.** Without it `vp check` exits 0 on warnings, and CI and pre-commit let them through.
- **The `vite` override in `package.json` must name the same version as `vite-plus`**, and `@vitest/coverage-v8`, `vitest` and the `vitest` override must equal the Vitest that `vite-plus` bundles (`npx vp toolchain`). The `vite` override keeps npm from installing upstream Vite next to Vite+'s core. `vitest` is declared because the coverage provider has a required `vitest` peer; `vp migrate` adds it and the override so the graph resolves a single Vitest. Dependabot bumps `vite-plus` alone, and `src/toolchain.test.ts` fails until every pin follows. Bump with `npx --package=vite-plus@<new> vp migrate --no-interactive` and keep what it writes.
- `scripts/strip-css-comments.mjs` — a `transform` plugin (Rollup plugin API,
  which Vite runs unchanged) that removes comments and indentation from Lit
  ``css`` templates in production builds. A minifier only minifies JavaScript,
  and a tagged template's contents are string data, so without this every
  explanatory CSS comment shipped to users; it was 17.8% of the modern bundle.
  Comments stay intact in `npm run dev` and under `vp test`. It has to run
  *after* the transpile step, which a plugin without `enforce` does. Its
  tests are in `src/strip-css-comments.test.ts`, typed through the
  `.d.mts` beside it, and the coverage run measures it with the card sources.
- `pytest.ini` — pytest config and the **`--cov-fail-under=95` coverage gate**. `pytest tests/` automatically runs with coverage; CI fails fast if a new commit drops coverage below the gate. Current measurement sits ~98% (98.70% on 2026-09-29).
  - **The package total is only half the gate.** The Silver `test-coverage` rule is per module, and a single number cannot express it: one module can slide to 80% while the others carry the average past the floor. That was this repo's actual state — 91.81% total with `diagnostics.py` at 84% and `quality_scale.yaml` claiming `done`. `--cov-report=json` writes `coverage.json`, and `scripts/check_module_coverage.py` fails on any module below 95%. CI runs it right after pytest; run it locally too, because pytest alone will not tell you a module regressed:

    ```bash
    .venv/bin/python -m pytest tests/ -q
    .venv/bin/python scripts/check_module_coverage.py
    ```
- `custom_components/wiener_linien_austria/api.py` — every request to Wiener Linien: the realtime, routing and OGD file URLs, the request headers, and the `WienerLinienApiError` exceptions every transport failure turns into. It returns decoded bodies and nothing more: `messageCode` handling, cooldowns, parsing and translated errors stay in the module that owns each feature. **It must not import Home Assistant or anything else from the package** (`const.py` pulls in HA for the User-Agent, so callers pass that in), and `tests/test_api.py` fails on any such import. Catch `WienerLinienApiError`, never `aiohttp` errors, outside `api.py`.
- `ATTRIBUTION` — canonical data-source statement (Wiener Linien OGD, CC BY 4.0) and licence terms; matches the `attribution` attribute every sensor emits. Update when the upstream API or licence wording changes, and keep the two code copies in sync: `const.ATTRIBUTION` for the sensors and diagnostics, and `ATTRIBUTION_FALLBACK` in `src/const.ts`, which the card footers show until a sensor reports its own.

## Dependency policy

`requirements_test.txt` carries its own rules in its header comment. This section covers `package.json`, which is JSON and cannot.

**Runtime vs dev is a real distinction here, not bookkeeping.** The package is `private` and nothing ever installs it, so the split looks cosmetic — but CI runs `npm audit --omit=dev --audit-level=high`, and that gate only means something because the packages that actually reach a user's browser inside the bundle are the ones in `dependencies`. A build-time tool belongs in `devDependencies` even though the build needs it; anything the build inlines into `www/*.js` belongs in `dependencies`.

**When to pin exactly vs. allow a caret:**

- **Caret (`^x.y.z`)** is for actively maintained runtime packages that keep semver honestly. `lit` is the only one left — everything else here meets one of the cases below.
- **Exact (`x.y.z`)** for four specific cases:
  1. **The package is unmaintained**, so a range floats over code nobody is watching. `qr-creator` is at its only release, built with a 2019 toolchain.
  2. **The "version" is really content, not an API.** A patch release can change what you get without changing any signature.
  3. **The version is mirrored somewhere else** and the two must move together. `@vitest/coverage-v8` must equal the Vitest bundled in `vite-plus` — the provider reaches into Vitest internals and refuses to load on a mismatch — `vitest` and its override follow the same version, and the `vite` override must equal `vite-plus` itself. `src/toolchain.test.ts` asserts all of them.
  4. **The package decides what the committed bundle looks like.** `validate.yml` asserts `www/*.js` matches a fresh build, so a floating `vite-plus` can turn a clean tree red with no source change — and a transpiler bump that alters decorator output breaks Lit reactivity while the build stays green. It is exact, and a bump commits the rebuilt bundles with it. `happy-dom` is exact on the same logic one layer down: it decides what the DOM suites see.

Bumping an exact pin is a deliberate act — say why in the commit message. Dependabot raises these as their own PRs rather than folding them into the monthly batch; the npm groups only cover minor and patch.

**Before adding a dependency, check it earns its place.** The bundle is served to every user on every dashboard load. Prefer inlining a constant over depending on a package that exports thousands of them: `utils/mdi-paths.ts` and `utils/retro-station-icons.ts` both vendor icon path geometry with provenance comments rather than pulling an icon library, because path data is content and the bundler was tree-shaking all but a handful of exports anyway.

**Build plugins are load-bearing or they are removed.** `validate.yml` asserts the committed bundles match a fresh build, so any plugin that changes output is part of that contract. Vite and Rolldown do resolution, JSON, CommonJS interop, transpilation and minification natively — `strip-css-comments` is the only plugin, and it is there because nothing built in does its job.

**Two output options are load-bearing and fail silently.** The banner must be a **legal** comment — `/*! ... */` — with `comments: { legal: true }`; a `//` banner is stripped by the minifier and only the built file's first bytes reveal it. And **`dropConsole` stays `false`**: Rolldown's option is a boolean rather than terser's per-method array, so it is all-or-nothing, and most `console.*` calls in these cards sit in `catch` blocks where dropping them turns a caught error into a silent one.

**The card bundles are excluded from the `end-of-file-fixer` / `trailing-whitespace` pre-commit hooks.** The exclude pattern, `^custom_components/.*/www/.*\.js$`, covers all four. The bundler emits no trailing newline, so a hook that "fixes" the file *after* the build leaves the committed bundle out of sync with a fresh one — exactly what `validate.yml` asserts byte-for-byte. `output.footer: "\n"` does not work around it; the minifier strips trailing whitespace.

**The bundler does not type-check; `vp check` does.** The build strips types without checking them. `vp check` runs the type-check (tsgolint on TypeScript 7, against the strict `tsconfig.json`) along with lint and format. Two consequences worth knowing:

- **The bundler checks nothing.** A type error will not fail `npm run build`. `vp check` is the single gate between a type error and a shipped bundle, which is why `validate.yml` runs it as its own step. It also catches a stray backtick inside a Lit template, which ends the template early.
- **Decorator settings live only in `tsconfig.json`.** Lit 3's `@customElement` / `@property` are legacy decorators that need `useDefineForClassFields: false`. Rolldown reads `tsconfig.json` itself, so don't restate them in `vite.config.ts`. If it ever regresses, class fields overwrite Lit's accessors and reactivity dies silently while the build stays green — diff the Lit reactive-property list of a built bundle to catch it.

There is no `tslib`: `tsconfig.json` sets no `importHelpers`, so `__decorate` is inlined into the bundles.

View per-file coverage locally:

```bash
pytest tests/ --cov-report=term-missing   # Python
npm run test:coverage                     # cards
```

`npm run test:coverage:gate` is the same run with thresholds attached, and is
what CI enforces. Both measure `src/**/*.ts` and the build plugins in
`scripts/**/*.mjs`. Both carry their whole configuration as CLI flags rather than
a `test` block in `vite.config.ts`, for the reason in **Card tests** below.

**Whether `--coverage.include` reports a file no test imports depends on the
vitest major, and it has flipped twice.** Vitest 3 did, through `coverage.all`.
Vitest 4 removed that, and the v8 provider instrumented only modules a run
actually loaded. Vitest 5 (current) reports them again, as 0% rows. Verify it in
one command rather than believing this paragraph:

```bash
npx vp test run src/utils/time.test.ts --coverage --coverage.provider=v8 \
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
the smoke tests fixed that at the source. `coverage/` is gitignored.

## Card tests

`npm test` runs Vitest (`vp test run`) over `src/**/*.test.ts`. Test files import
from `vite-plus/test`, not `vitest`. `vite.config.ts` has no `test` block, and
adding one is usually the wrong move — the suite runs in two environments and
picks between them per file:

- **node (the default)** for the pure functions: config normalisers, departure
  filtering, time and colour helpers, the catalogue-health checks in
  `src/localize/localize.test.ts`.
- **happy-dom**, opted into with a `@vitest-environment happy-dom` line in the
  file's leading comment, for anything that needs a DOM. Ten of the 30 test
  files today: `card-smoke.test.ts` mounts the three departure-board cards,
  `qr-panel.test.ts` draws the modern card's QR code on a stubbed canvas,
  `editor-smoke.test.ts` mounts their three editors and asserts the
  `config-changed` payload, `editor/board-editor.test.ts` checks which `hass`
  updates re-render an editor, `route-card.test.ts` covers the route card, its
  ad-hoc mode and its editor,
  `editor/header-strip.test.ts` drives the signage-strip editor,
  `utils/station-header.test.ts` checks the order of the strip the cards render,
  `shared-render.test.ts` covers the stale-cache reload machinery,
  `utils/color-cssom.test.ts` covers the colours that go through CSSOM, and
  `utils/traffic-notice.test.ts` needs `DOMParser` to extract notice prose.

Opt in per file rather than globally: only the suites that need a DOM should pay
for booting one.

**A new source file that names translation keys must join the list at the top of
`src/localize/localize.test.ts`.** The catalogue checks find keys by scanning
that fixed set of files. Keys used only in an unlisted file read as orphaned and
the test fails, even though they render fine.

The HA components the editors host (`ha-form`, `ha-icon`, `ha-alert`,
`ha-icon-picker`) are deliberately never defined in tests. An undefined element
is inert, Lit renders straight through it, and not stubbing them is what keeps
this layer free of a test harness.

Three things happy-dom gets wrong, so don't chase them: its `outline` shorthand
parser drops CSS system colours (`CanvasText`, `Highlight`) and mangles `var()`,
and `style.color` keeps `rgb()`, named and `hsl()` colours as written where a
browser serialises them to `rgb()` / `rgba()`. All are fine in every browser HA
supports — assert on the source, not on parsed `cssText`, and test colour
parsing with `rgb()` or hex, which `parseColor` reads the same either way.

## Card editors

The modern, retro and flap editors share their element plumbing through
`BoardEditor` in `src/editor/board-editor.ts`: the config and tab state, the
`hass` filter in `shouldUpdate`, the tab bar, and `_commit` / `_patch`. Modern
and flap extend `MultiStopEditor`, which adds the entity picker and one stop
block per stop. Retro shows a single stop and extends `BoardEditor` directly.
The route editor is one plain form and uses only the label and helper resolvers
in `src/editor/editor-common.ts`.

**Add a setting in its card's editor**, as a field in one of that card's section
schemas. The base class holds only what two or more editors render the same
way. A control that only one card has stays with that card.

**Every config write goes through `_commit`**, which sets `_config` before it
fires `config-changed`. Home Assistant never calls `setConfig` again after that
event, so a write that only fires the event leaves the form showing the old
value.

## On-demand route planning

The route card can plan between any two stops without a route entry. That path
has more moving parts than the rest of the integration, and a few of them are
easy to break without a test noticing.

**Where it lives.** `websocket.py` holds the two commands the route card calls,
`wiener_linien_austria/stops` and `wiener_linien_austria/plan`, plus the modern
card's `wiener_linien_austria/run_times` (see *WebSocket API*). `adhoc.py`
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
a 2 to 30 s rollover spread, a 30 min idle pause and a 400 ms debounce. They
were sized against the routing backend's measured capabilities (the block in
`const.py`) and the load a configured route already makes.
Changing any of them means re-measuring with the `api-polling` skill's probe
first, and updating the README's Data updates section in the same commit.

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

## WebSocket API

The cards reach the backend through three WebSocket commands. They are
experimental and may change while routes are: the bundled cards are the
intended callers, and a third-party card can use them on that understanding.
Any signed-in user can call them, not only admins, so a wall tablet signed in
as a regular user works.

**`wiener_linien_austria/stops`** takes no fields. It returns every stop you can
plan from, nearest to the Home Assistant location first: the same list the
setup dialog offers.

```json
{"stops": [{"value": "60201349", "label": "Hauptbahnhof (Wien) — 450 m"}]}
```

**`wiener_linien_austria/plan`** plans connections between two stops, leaving
now or at a chosen time.

| Field | Required | Values |
|---|---|---|
| `origin`, `destination` | yes | Stop DIVAs from the `stops` list. |
| `route_type` | no | `leasttime` (default), `leastinterchange` or `leastwalking`. Case doesn't matter. |
| `max_changes` | no | `"0"`–`"3"`, or `"any"` (default). |
| `walk_speed` | no | `slow`, `normal` (default) or `fast`. |
| `excluded_means` | no | Any of `train`, `sbahn`, `metro`, `tram`, `bus`. Default: none. |
| `min_transfer_minutes` | no | `0`–`15`, default `2`. |
| `datetime` | no | When to leave, as an ISO date and time. Without an offset it's Vienna time. Leave out for now. |
| `arrive_by` | no | `true` treats `datetime` as the latest arrival instead. Default `false`. |
| `step_free` | no | `true` plans only step-free connections. Default `false`. |

The answer has the same shape as the next-connection sensor's attributes, so
one renderer handles both: `origin` and `destination` (stop names),
`fetched_at`, `min_transfer_minutes`, `step_free`, `trips` (up to four),
`line_colors`, `traffic_info`, `elevator_info` and `attribution`. `planned_for`
echoes the chosen time (`null` for now) and `arrive_by` how it was meant. A plan
for a chosen time keeps every connection it found, even ones that already left.
Two more fields cover a used-up allowance: `stale` is `true` when this is an
older plan served in place of a new one, and `retry_after` then gives the
seconds until a new one is possible. Otherwise `stale` is `false` and
`retry_after` is `null`.

`plan` shares the limits in the README's *Data updates* section: answers reused
for a minute, and at most 60 requests an hour per user and 120 for all users
together.

Errors come back with one of these codes:

| Code | Meaning |
|---|---|
| `not_loaded` | The integration has no loaded entry. Every command here answers this until one loads. |
| `catalogue_unavailable` | The stop list couldn't be loaded. |
| `invalid_stop` | A DIVA isn't in the `stops` list. |
| `same_stop` | Origin and destination are the same stop. |
| `invalid_query` | The trip planner refused this pair, for example because the stops are too close together. Asking again soon gets the same answer. |
| `rate_limited` | The allowance is used up and there's no recent plan to fall back on. `translation_placeholders.retry_after` gives the seconds to wait. |
| `upstream` | The trip planner couldn't be reached or sent an error. |

A request that doesn't match the schema gets Home Assistant's own
`invalid_format` error.

**`wiener_linien_austria/run_times`** returns the scheduled minutes from a stop
to every stop ahead, for each line and direction. The modern card calls it for
`show_stop_times`.

| Field | Required | Values |
|---|---|---|
| `diva` | yes | The stop's DIVA, from the departure sensor's `diva` attribute. Only a stop with a departure board set up gets an answer. |
| `line`, `direction` | no | The line about to be shown, such as `U1` and `H`. If the answer doesn't hold it yet, the integration may request it. |

```json
{
  "diva": 60201040,
  "fetched_at": "2026-10-08T10:30:00+00:00",
  "valid_until": "2026-10-08T19:00:00+02:00",
  "run_times": {"U1|H": {"Vorgartenstraße": 1.0, "Donauinsel": 2.6}}
}
```

`run_times` is keyed by line and direction, then by stop name as the
stops-ahead trail spells it. The minutes can carry a decimal. Add a stop's
minutes to a departure's `time_real`, or `time_planned` without one, to get its
estimated arrival there. Ask again after `valid_until`. The README's *Data
updates* section says when a call costs a request. It answers `not_loaded`,
`catalogue_unavailable` and `upstream` like the commands above, and
`invalid_stop` for a DIVA without a departure board.

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
npx vp check            # format, lint, type-check
npm test
npm run test:coverage:gate
npm run build           # commit the rebuilt www/*.js with any src/ change
```

CI runs the same checks plus hassfest + HACS validation, `npm audit`, a byte-for-byte check that the committed bundles match a fresh build, a syntax check of each bundle, and a guard that `_dev_fixture.py` is never committed. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Wiener Linien Austria version
- Diagnostics download (Settings → Devices & Services → Wiener Linien Austria → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
