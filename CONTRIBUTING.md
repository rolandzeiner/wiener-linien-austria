# Contributing to Wiener Linien Austria

Thanks for taking a look. This repo is a Home Assistant integration with four Lovelace cards. Everything you need to work on it is on this page, and the gate in *Verification gate* has to pass before a change lands.

## Quick start

```bash
git clone https://github.com/rolandzeiner/wiener-linien-austria.git
cd wiener-linien-austria
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install
npm ci && npm run build
```

Before a PR, run the gate in *Verification gate*. It is what CI runs, so failing locally only costs you a push.

## Branching and releases

- Work on `dev`; PRs target `dev`. Nothing is committed or force-pushed to `main`.
- For anything bigger than a fix, open an issue first so the shape is agreed before the code is written.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`. A subject line, then bullets that say what changed and why.
- The built bundles are committed and travel with the `src/` change that produced them: users install through the Marketplace and never run `npm`, and CI fails when a committed bundle differs from a fresh build by a byte.
- Releases are the maintainer's: a `dev → main` PR, squash-merged, then a tag from `main`. Publishing the release runs `release.yml`, which attaches `wiener_linien_austria.zip`, a flat archive of `custom_components/wiener_linien_austria/`. `hacs.json` sets `zip_release`, so the Marketplace downloads that file, and a release without it can't be installed. If the job fails, `gh workflow run release.yml -f tag=vX.Y.Z` re-runs it against the existing tag.
- Contributions are accepted under the repo's MIT licence.

## Python environment

- The project uses [`uv`](https://docs.astral.sh/uv/) for Python environments, the same tool CI installs with (`astral-sh/setup-uv` and `uv pip install --system`), so a gate that passes locally resolves what CI resolves. Plain `python -m venv` and `pip` work too.
- `3.14` is the CI interpreter and what `pytest-homeassistant-custom-component` requires. It is deliberately not the support floor; see *Two Python versions*.
- `pre-commit install` runs ruff, ruff-format, mypy and `vp check` on every commit, plus the whitespace hooks, from which the built bundles are excluded (see *Card toolchain*).
- A venv built months ago drifts from `requirements_test.txt`. Re-run `uv pip install -U -r requirements_test.txt` after a pin bump and whenever you come back to the repo; the `-U` is what moves a floating range such as PHACC's.
- `requirements_test.txt` carries its own rules in its header comment: PHACC governs the test stack, and nothing it pins is declared again.
- `custom_components/wiener_linien_austria/_dev_fixture.py` is gitignored and the `no-dev-fixture` CI job fails if it ever lands. It injects synthetic data for local card work.

## Two Python versions

Every change has to respect both, and conflating them has shipped a broken release in this portfolio.

| Axis | Version | Where it is declared |
|---|---|---|
| **Runtime**: what we develop and test on | 3.14 | `validate.yml` `tests` job, your local venv |
| **Floor**: the oldest Python we must still run on | 3.13 | `pyproject.toml` `[tool.ruff] target-version`, the `compile-floor-python` CI job |

The floor is whatever `hacs.json`'s `homeassistant` value requires. HA 2025.6.0 declares `REQUIRED_PYTHON_VER = (3, 13, …)`, which you can check rather than remember:

```bash
gh api "repos/home-assistant/core/contents/homeassistant/const.py?ref=2025.6.0" \
  --jq .content | base64 -d | grep REQUIRED_PYTHON_VER
```

Setting `target-version` to the CI interpreter lets `ruff format` emit syntax the floor cannot parse and then stay silent about it; that is how this repo once shipped a `SyntaxError` with green CI, because every check ran on the newer interpreter. Raise the floor only by changing all three declarations in one commit, plus the README's requirement line and badge.

## Card toolchain

The cards live in `src/` and build to `custom_components/wiener_linien_austria/www/`, one bundle per card: `wiener-linien-austria-card.js`, `wiener-linien-austria-retro-card.js`, `wiener-linien-austria-flap-card.js` and `wiener-linien-austria-route-card.js`. Their whole toolchain runs through [Vite+](https://viteplus.dev/) (`vp`), configured in `vite.config.ts`: `vp build` (Vite library mode on Rolldown), `vp test` (Vitest) and `vp check` (Oxfmt, Oxlint and the type-check). The card `devDependencies` are `vite-plus`, `happy-dom` and the coverage provider; Vitest, Rolldown and the type-checker ship inside `vite-plus`, and `typescript` is not installed. `npx vp` runs the copy in `node_modules`; a global `vp` works too. Each card is its own Vite environment with its own bundle and its own copy of Lit, and `builder.buildApp` builds exactly those four.

| Command | What it does |
|---|---|
| `npm run dev` | Watches `src/` and rebuilds all four bundles on save, with sourcemaps (`--mode development`). |
| `npm run build` | Production build of the four bundles into `www/`. |
| `npm test` | `vp test run`: the card suites. |
| `npm run check` | `vp check`: Oxfmt, Oxlint and the type-check. `npx vp check --fix` rewrites what it can. |
| `npm run test:coverage` | The card suites with coverage: a text report and `coverage/coverage-final.json`. |
| `npm run test:coverage:gate` | The same run with the thresholds CI enforces. |

Node 24.11 or newer (26 works too) and npm 11.

Commit the built bundles. End users install through the Marketplace and never run `npm`, so `custom_components/wiener_linien_austria/www/*.js` is tracked. CI asserts each committed bundle matches a fresh build byte for byte; a stale bundle is the infinite reload-banner bug. A dev build writes `.map` files next to them; they are gitignored.

Things in `vite.config.ts` that fail silently if you change them:

- The banner must be a **legal** comment, `/*! ... */`, with `comments: { legal: true }`. The minifier strips a `//` banner without a word; only the built file's first bytes show it.
- **`minify` lives on `rolldownOptions.output`, with `dropConsole: false`.** Vite's library mode skips whitespace minification for ES output, so `build.minify` alone ships the bundle with its whitespace left in. `dropConsole` is all-or-nothing, and the `console.*` calls here sit in `catch` blocks, where dropping them turns a caught error into a silent one.
- **Dev vs prod comes from `--mode development`** (`npm run dev`). A plain `vp build` is production: minified, no sourcemap, CSS comments stripped.
- **`fmt.embeddedLanguageFormatting` stays `"off"`.** Otherwise Oxfmt reformats Lit `html` and `css` templates and changes the whitespace inside rendered elements, which is a DOM change, not a style change.
- **Decorators are not configured.** Rolldown reads `tsconfig.json` itself and enables Lit's legacy decorators from it. If that ever regresses, class fields overwrite Lit's accessors and reactivity dies while the build stays green; diff the reactive-property list of a built bundle to catch it.
- **`lint.plugins` replaces Oxlint's defaults.** It names `typescript`, `unicorn` and `oxc` next to `vitest`; drop one and its rules stop running without a word. The `vitest/*` rules fail a committed `.only` or `.skip`, a test without an assertion, a duplicate title, an `expect` inside an `if` and a bare `toThrow()`, and `reportUnusedDisableDirectives` fails a disable comment that no longer suppresses anything.
- **`lint.options.denyWarnings: true`.** Without it `vp check` exits 0 on warnings, and CI and pre-commit let them through.
- **`codeSplitting: false`.** Each card is one file; a dashboard resource can't load a second chunk the bundler decided on.
- **`emptyOutDir: false`.** Vite empties the output directory before each build by default, and `www/` also holds the vendored fonts.
- **`json: { namedExports: false, stringify: false }`**, with default imports (`import de from "./languages/de.json"`). With named exports off, `import * as de` yields only `{ default }`: every lookup misses and the card shows raw keys. The card suites catch that.
- **`scripts/strip-css-comments.mjs` is the only plugin**, and it is there because nothing built in does its job: a minifier only minifies JavaScript, and a tagged template's contents are string data, so without it every explanatory CSS comment shipped to users. It runs after the transpile step, which a plugin without `enforce` does, and leaves comments intact under `npm run dev` and `vp test`. Its tests are in `src/strip-css-comments.test.ts`, typed through the `.d.mts` beside it. Any plugin that changes output is part of the byte-for-byte contract CI asserts, so a plugin is load-bearing or it is removed.

The `vite` override in `package.json` must name the same version as `vite-plus`, and `@vitest/coverage-v8`, `vitest` and the `vitest` override must equal the Vitest that `vite-plus` bundles (`npx vp toolchain`). The `vite` override keeps npm from installing upstream Vite next to Vite+'s core; `vitest` is declared because the coverage provider has a required `vitest` peer. Dependabot bumps `vite-plus` but not the override, and `src/toolchain.test.ts` fails until every pin follows. Bump with `npx --package=vite-plus@<new> vp migrate --no-interactive`, which moves them together; `npm install vite-plus@<new>` fails with ERESOLVE.

The build does not type-check. `vp check` is the only thing between a type error and a green build, which is why the gate runs it as its own step. It also catches a backtick inside a Lit `css` or `html` template, comments included, which ends the template early and fails the card at load while the build stays green.

The bundles are excluded from the `end-of-file-fixer` and `trailing-whitespace` hooks: the bundler emits no trailing newline, and a hook that fixes the file after the build leaves it out of sync with a fresh one, which CI asserts byte for byte. `vp check` runs as a local hook on card source; don't switch to Vite+'s own `vp staged` hooks, which take over `core.hooksPath` and silently disable ruff and mypy.

`tsconfig.json`'s `lib` is the cards' browser floor: ES2022. That is why `sorted()` from `src/utils.ts` stands in for `toSorted()`, and why the ES2023 array methods stay out: the bundle doesn't polyfill them. Raising it raises the browser requirement in the README's Requirements section; change both together.

### Trying it in Home Assistant

Copy `custom_components/wiener_linien_austria/` into your Home Assistant config's `custom_components/` and restart Home Assistant. After a card change, copy the rebuilt `www/` files the same way and hard-refresh the browser: the resource URL only changes with the version.

## Verification gate

```bash
# Python
pytest tests/ -v
python scripts/check_module_coverage.py   # the per-module floor, reads coverage.json
mypy --strict --ignore-missing-imports custom_components/wiener_linien_austria
ruff check .
ruff format --check .                     # separate: `ruff check` never inspects formatting

# The oldest Python we support, derived from pyproject.toml, never hardcoded
FLOOR=$(sed -n 's/^target-version = "py3\([0-9]*\)"/3.\1/p' pyproject.toml)
uv run --python "$FLOOR" --no-project python -m compileall -q custom_components/wiener_linien_austria

# Card
npx vp check                              # format, lint and the only type-check
npm test                                  # vp test run
npm run test:coverage:gate                # the card coverage thresholds
npm run build                             # commit the rebuilt bundles with the src/ change
git diff --exit-code -- custom_components/wiener_linien_austria/www/*.js
node -c custom_components/wiener_linien_austria/www/wiener-linien-austria-card.js
node -c custom_components/wiener_linien_austria/www/wiener-linien-austria-retro-card.js
node -c custom_components/wiener_linien_austria/www/wiener-linien-austria-flap-card.js
node -c custom_components/wiener_linien_austria/www/wiener-linien-austria-route-card.js
```

CI runs the same checks plus hassfest, HACS validation, `npm audit --omit=dev --audit-level=high`, a check that the committed bundles match a fresh build, the dev-fixture guard and CodeQL. Failing locally only costs you a push.

Two of these are easy to skip and expensive to skip:

- **`ruff format --check`** is separate from `ruff check`, which never inspects formatting. Without it the formatter drifts silently until someone runs it.
- **`npx vp check`** is the only type-check anywhere. The build strips types without checking them, so a type error builds cleanly all the way to a shipped bundle.

**Keep `--no-project`** on the `compileall` line. Without it `uv` treats the repo root as a project, finds no `requires-python`, and rebuilds `.venv` on the floor interpreter, taking every tool in it along. Recover with `uv venv --clear --python 3.14 && uv pip install -r requirements_test.txt pre-commit`.

## Tests

**Python.** `pytest tests/` runs on `pytest-homeassistant-custom-component`. `tests/conftest.py` holds the fixtures a new test starts from: `make_entry` and `route_entry` for the two entry types, `mock_fetch` and `mock_aiohttp_session` for the upstream, `mock_static_catalogue` for the OGD stop catalogue, `frozen` for the clock, `snapshot` for diagnostics. Two tests are AST guards: `test_api.py` fails on any Home Assistant or package import in `api.py`, and `test_user_agent.py` parametrises every outbound call site. The harness traps that cost an afternoon:

- `conftest.py` zeroes the domain cooldown for every test; a test that needs the real value takes `@pytest.mark.real_domain_cooldown`. Unknown markers fail the run (`strict_markers`), and a hung fixture fails after 15 s.
- The autouse `no_deprecated_ha_api` fixture fails any test that trips Home Assistant's deprecation channel, in both of HA's message shapes. A test that exercises a deprecated API on purpose takes `@pytest.mark.allow_deprecated_ha_api`; don't weaken the fixture.
- `tests/test_adhoc.py`'s `_connect` authenticates the WebSocket client **before** freezing time. The auth token is stamped with the real clock, and a clock frozen earlier than that rejects it, so a new test that freezes first fails at login rather than at the assertion.
- Patch the trip fetch at `custom_components.wiener_linien_austria.route_coordinator.async_fetch_trip_body`, the name `route_coordinator` imported, not in `routing.py`. The fixtures already do.

**Card.** The suites sit beside the sources as `src/**/*.test.ts` and import from `vite-plus/test`, not `vitest`. `vite.config.ts` has no `test` block, and adding one is usually the wrong move: the suite runs in two environments and picks between them per file. Pure functions run in plain Node (the config normalisers, departure filtering, the time and colour helpers, the catalogue checks in `src/localize/localize.test.ts`). Anything that needs a DOM opts in with a `@vitest-environment happy-dom` line in the file's leading comment: `card-smoke.test.ts` mounts the three departure-board cards, `qr-panel.test.ts` draws the modern card's QR code on a stubbed canvas, `editor/editor-smoke.test.ts` mounts their three editors and asserts the `config-changed` payload, `editor/board-editor.test.ts` checks which `hass` updates re-render an editor, `route-card.test.ts` covers the route card, its ad-hoc mode and its editor, `editor/header-strip.test.ts` drives the signage-strip editor, `utils/station-header.test.ts` checks the order of the strip the cards render, `shared-render.test.ts` covers the stale-cache reload machinery, `grid-cell.test.ts` guards the gated grid fill, `utils/color-cssom.test.ts` covers the colours that go through CSSOM, and `utils/traffic-notice.test.ts` needs `DOMParser` to extract notice prose. `toolchain.test.ts` pins the Vite+ pins named in *Card toolchain*.

- The HA components the cards and editors host (`ha-card`, `ha-form`, `ha-icon`, `ha-alert`, `ha-icon-picker`) are deliberately never defined in tests. An undefined element is inert, Lit renders straight through it, and not stubbing them is what keeps this layer free of a test harness.
- What happy-dom gets wrong where it matters, so don't chase it: no layout, no canvas, its `outline` shorthand parser drops CSS system colours and mangles `var()`, and `style.color` keeps `rgb()`, named and `hsl()` colours as written where a browser serialises them. Assert on the source, not on parsed `cssText`, and test colour parsing with `rgb()` or hex.
- A new source file that names translation keys must join the `SOURCES` list at the top of `src/localize/localize.test.ts`. The catalogue checks find keys by scanning that fixed set of files; keys used only in an unlisted file read as orphaned and the test fails, even though they render fine.
- `src/route-card.test.ts` installs an in-memory `localStorage` in `beforeEach`, because happy-dom leaves it undefined.

A change to what the card does comes with a test that fails without it.

### Snapshots

Diagnostics output is pinned through `syrupy` under `tests/snapshots/`. After an intended change to the diagnostics shape, regenerate with `pytest tests/test_diagnostics.py --snapshot-update`, review the diff, and commit the `.ambr` file with the code change.

### Coverage

`pytest.ini` enforces `--cov-fail-under=95` on the package total and writes `coverage.json`. The package total is only half the gate: coverage holds per module, and a single number cannot express that, since one module can slide while the others carry the average past the floor. `scripts/check_module_coverage.py` reads `coverage.json` and fails on any module below 95 %; CI runs it right after pytest, and pytest alone will not tell you a module regressed. `pytest tests/ --cov-report=term-missing` gives the per-file view.

The card side is gated too: `npm run test:coverage:gate` enforces the thresholds in `package.json` over `src/**/*.ts` and the build plugins in `scripts/**/*.mjs`, and `npm run test:coverage` is the same run without them. Both carry their configuration as CLI flags rather than a `test` block in `vite.config.ts`, for the reason under *Card*. The thresholds are a ratchet, not a target: they sit a few points under the measured number so a legitimate refactor doesn't trip them while a chunk of newly untested code does. Raise them when coverage rises; don't lower them without saying why.

Whether `--coverage.include` reports a file no test imports depends on the Vitest major, and it has flipped twice: Vitest 3 did, Vitest 4 instrumented only modules a run loaded, Vitest 5 reports them again as 0 % rows. Verify it in one command rather than believing this paragraph:

```bash
npx vp test run src/utils/time.test.ts --coverage --coverage.provider=v8 \
  --coverage.reporter=text --coverage.include='src/stop-combobox.ts'
```

The consequence: a falling percentage can mean the denominator got honest. When a suite starts importing a large file for the first time, covered statements go up and the percentage can go down. Read the covered and total counts, not the percentage, before concluding anything about a coverage change.

`--coverage.reporter=json` writes `coverage/coverage-final.json` in Istanbul format, which is what `fallow health --coverage` reads; measured coverage keeps its CRAP scores honest where the estimate would flag covered code. `coverage/` is gitignored.

## Version sync

Four cards, four version constants, one source of truth. `manifest.json` `version` is it: `const.py` reads it at import and aliases `CARD_VERSION`, `RETRO_CARD_VERSION`, `FLAP_CARD_VERSION` and `ROUTE_CARD_VERSION` to it, so the Python side needs no edit. The four literals in `src/const.ts` must each equal it byte for byte, and `tests/test_card_version.py` checks every constant independently, so a failure names which one drifted. The failure mode: the card's version check sees a mismatch, shows the reload banner, the reload re-serves the same bundle, and the banner comes back, for every user. A bump edits `manifest.json` and `src/const.ts`, rebuilds the bundles and commits all of it together. No constant carries a `-beta` suffix: a pre-release has the final release's number and GitHub's pre-release flag. The README badge reads the latest release tag and needs no edit.

## Dependencies

| Package | Pin | Why |
|---|---|---|
| `ruff`, `mypy` | exact, `requirements_test.txt` | CI runs nightly; a floating linter turns the build red with no code change. The `rev:` in `.pre-commit-config.yaml` must match; check both tools when bumping either. |
| `pytest-homeassistant-custom-component` | `>=` floor with a `<` cap | it tracks HA core; pinning it would freeze the HA version tested against |
| `vite-plus` | exact, `package.json` | it decides what the committed bundles look like; the `vite` override names the same version |
| `@vitest/coverage-v8`, `vitest` | exact, equal to the Vitest inside `vite-plus` | the provider reaches into Vitest internals and refuses to load on a mismatch; `src/toolchain.test.ts` asserts it |
| `happy-dom` | exact | it decides what the DOM suites see; the siblings keep one version |
| `qr-creator` | exact | unmaintained, at its only release, built with a 2019 toolchain; a range would float over code nobody is watching |
| `lit` | caret | maintained, keeps semver |

- Bumping an exact pin is a deliberate act; say why in the commit message. Dependabot raises these as their own PRs rather than folding them into the monthly batch; the npm groups only cover minor and patch.
- **Dependabot's blind spots.** It bumps the `requirements_test.txt` pin and leaves the hook `rev` alone (it is told to); it bumps `vite-plus` and leaves the override alone. The toolchain test catches the second; nothing catches the first except reading both files.
- **Runtime vs dev.** What the build inlines into the bundles is a `dependency`; a build-time tool is a `devDependency` even though the build needs it. CI's `npm audit --omit=dev` only means something because of that split.
- **Adding a dependency.** The bundles load on every dashboard, so a new runtime dependency is discussed in an issue first; today the cards have `lit` and `qr-creator`. Its licence must be compatible with MIT and its notice must survive the build (`comments: { legal: true }` keeps the `@license` comments). Prefer vendoring a few constants with a provenance comment over depending on a package that exports thousands: `utils/mdi-paths.ts` and `utils/retro-station-icons.ts` carry icon path geometry that way rather than pulling an icon library.

## Translations

Adding or changing a user-visible string means touching four files together: `strings.json`, `translations/en.json`, `translations/de.json`, and `icons.json` for a new entity. hassfest checks the keys in CI, and the German copy uses **du**, never **Sie**.

The cards' strings live in `src/localize/languages/{de,en}.json`, one namespace per card (`modern`, `retro`, `flap`, `route`) plus `common` for the picker and the shared editor copy. `src/localize/localize.test.ts` guards them: both languages carry the same keys and placeholders, no string is empty, and no key is orphaned. It finds keys by scanning the files in its `SOURCES` list, so a new source file that names keys joins that list.

## Home Assistant conventions

- Every `UpdateFailed`, `ConfigEntryNotReady` and `ConfigEntryAuthFailed` carries `translation_domain`, `translation_key` and placeholders; never a bare string. `outage.py` turns a sustained upstream failure into the translated states the sensors show.
- Icons live in `icons.json`; `_attr_icon = "mdi:…"` appears nowhere.
- Every platform module sets `PARALLEL_UPDATES = 0`.
- `api.py` imports nothing from Home Assistant or the package: it owns the URLs, headers, requests and the `WienerLinienApiError` hierarchy every transport failure turns into, and returns decoded bodies and nothing more. `messageCode` handling, cooldowns, parsing and translated errors stay in the module that owns each feature. Callers pass in the session and the User-Agent, because `const.py` imports HA. `tests/test_api.py` fails on any such import. Outside `api.py`, catch `WienerLinienApiError`, never `aiohttp`'s errors.
- The `User-Agent` constant goes on every outbound call and no `Accept-Encoding` is pinned (aiohttp's own offer already gets gzip). The poll floors, the domain-wide cooldown in `rate_limit.py` and the ad-hoc budgets are fair use towards Wiener Linien: don't lower them without thinking about the multi-entry install. `tests/test_user_agent.py` parametrises every call site; a new HTTP call joins the table.
- `unique_id` formulas are frozen: changing one wipes every existing install.
- `ATTRIBUTION` in `const.py` is the data-source statement every entity emits (Wiener Linien OGD, CC BY 4.0). `ATTRIBUTION_FALLBACK` in `src/const.ts` is what the card footers show until a sensor reports its own; keep the two in step when the upstream wording changes.
- Diagnostics redact the fields in `TO_REDACT` in `diagnostics.py`, coordinates among them; the set only grows. Test payloads are synthetic: never a real id, contract number or credential, not even in a fixture.

## Where things are

| Module | Owns |
|---|---|
| `api.py` | Transport for every upstream: realtime, routing and OGD files. HA-free. |
| `coordinator.py`, `batch.py` | The departure-board poll; `batch.py` makes one `/monitor` request per interval group across entries. |
| `route_coordinator.py`, `routing.py` | The A→B route entries and the connection planning against the OGD routing service. `route_coordinator.async_plan_trips` is the only function that fetches, parses and ranks a trip request. |
| `adhoc.py`, `websocket.py`, `stops.py` | On-demand planning for the route card and the `plan_trip` action; the WebSocket commands; the stop picker options. See *On-demand route planning*. |
| `live.py`, `run_times.py`, `timetable.py`, `s_bahn_network.py` | Live times for planned connections, run times to the stops ahead, planned S-Bahn departures, and which S-Bahn lines call where. |
| `alerts.py`, `outage.py`, `rate_limit.py`, `parsing.py` | Disruptions and lift status; sustained-outage detection; the domain-wide rate limit and backoff; the coercions the parsers share. |
| `static.py` | The OGD stop catalogue, DIVA → RBL mapping and line trip patterns, cached in `.storage`. |
| `config_flow.py`, `services.py`, `diagnostics.py`, `card_registration.py` | The setup and options flows, the `plan_trip` action, diagnostics, and the Lovelace resource registration for the four bundles. |
| `src/wiener-linien-austria-*.ts`, `src/card-styles.ts` | The four cards; the modern card's styles. |
| `src/editor.ts`, `src/retro-editor.ts`, `src/flap-editor.ts`, `src/route-editor.ts`, `src/editor/` | The editors and what they share. |
| `src/utils/` | Pure helpers: config normalisers, departure filtering, colours, time, the route helpers. |
| `src/localize/` | The card strings and their guard test. |
| `src/shared-render.ts`, `src/stop-combobox.ts`, `src/font-face.ts` | The version banner and cache-wipe reload; the stop picker; the vendored WL fonts served from `www/fonts/`. |

The modern, retro and flap editors share their element plumbing through `BoardEditor` in `src/editor/board-editor.ts`: the config and tab state, the `hass` filter in `shouldUpdate`, the tab bar, and `_commit` / `_patch`. Modern and flap extend `MultiStopEditor`, which adds the entity picker and one stop block per stop. Retro shows a single stop and extends `BoardEditor` directly. The route editor is one plain form and uses only the label and helper resolvers in `src/editor/editor-common.ts`.

### Adding a card setting

Add it as a field in one of that card's section schemas, in that card's editor. The base class holds only what two or more editors render the same way; a control that only one card has stays with that card. Every config write goes through `_commit`, which sets `_config` before it fires `config-changed`: Home Assistant never calls `setConfig` again after that event, so a write that only fires the event leaves the form showing the old value.

## On-demand route planning

The route card can plan between any two stops without a route entry. That path has more moving parts than the rest of the integration, and a few of them are easy to break without a test noticing.

**Where it lives.** `websocket.py` holds the two commands the route card calls, `wiener_linien_austria/stops` and `wiener_linien_austria/plan`, plus the modern card's `wiener_linien_austria/run_times` (see *WebSocket API*). `adhoc.py` holds the planner behind `plan` and the `plan_trip` action: cache, coalescing, per-user and instance budgets, and the stale fallback. `stops.py` builds the stop list the setup dialog and the card share. On the card side, `src/stop-combobox.ts` is the picker and `src/utils/route.ts` holds the refresh cadence, error table and stop filter.

**Why the commands are registered in `async_setup`.** `websocket_api` has no deregister hook, so a command can't be tied to an entry's lifetime: whatever registers it, it stays until HA restarts. `async_setup` runs once per HA process, which makes it the one place a single registration is guaranteed. The trade-off is that the handlers outlive a removed integration, so every command answers `not_loaded` unless an entry of the domain is loaded. Keep that check in any command you add.

**One planning path.** `route_coordinator.async_plan_trips` is the only function that fetches, parses and ranks a trip request. Route entries, `plan_trip`, the card's `plan` command and the config flow's setup probe all go through it, so they can't disagree about the same query.

**The fair-use numbers are measured, not picked.** The backend constants sit at the top of `adhoc.py`: a 60 s cache, a 5 min stale limit, 120 requests an hour (burst 10) for the instance and 60 (burst 5) per user. The card's sit in `src/utils/route.ts`: a 120 s refresh while on screen, a 60 s rollover floor, a 2 to 30 s rollover spread, a 30 min idle pause and a 400 ms debounce. They were sized against the routing backend's measured capabilities (the block in `const.py`) and the load a configured route already makes. Changing any of them means re-measuring first, and updating the README's *Data updates* section in the same commit.

**Privacy.** A stop pair picked on a dashboard is a movement pattern. The card keeps the last pick in the browser's `localStorage`, and the backend keeps plans in memory for at most 5 minutes and clears them when the last entry unloads. Don't add stop pairs to diagnostics, the recorder or any log above `debug`.

## WebSocket API

The cards reach the backend through three WebSocket commands. They are experimental and may change while routes are: the bundled cards are the intended callers, and a third-party card can use them on that understanding. Any signed-in user can call them, not only admins, so a wall tablet signed in as a regular user works.

**`wiener_linien_austria/stops`** takes no fields. It returns every stop you can plan from, nearest to the Home Assistant location first: the same list the setup dialog offers.

```json
{"stops": [{"value": "60201349", "label": "Hauptbahnhof (Wien) — 450 m"}]}
```

**`wiener_linien_austria/plan`** plans connections between two stops, leaving now or at a chosen time.

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

The answer has the same shape as the next-connection sensor's attributes, so one renderer handles both: `origin` and `destination` (stop names), `fetched_at`, `min_transfer_minutes`, `step_free`, `trips` (up to four), `line_colors`, `traffic_info`, `elevator_info` and `attribution`. `planned_for` echoes the chosen time (`null` for now) and `arrive_by` how it was meant. A plan for a chosen time keeps every connection it found, even ones that already left. Two more fields cover a used-up allowance: `stale` is `true` when this is an older plan served in place of a new one, and `retry_after` then gives the seconds until a new one is possible. Otherwise `stale` is `false` and `retry_after` is `null`.

`plan` shares the limits in the README's *Data updates* section: answers reused for a minute, and at most 60 requests an hour per user and 120 for all users together.

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

A request that doesn't match the schema gets Home Assistant's own `invalid_format` error.

**`wiener_linien_austria/run_times`** returns the scheduled minutes from a stop to every stop ahead, for each line and direction. The modern card calls it for `show_stop_times`.

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

`run_times` is keyed by line and direction, then by stop name as the stops-ahead trail spells it. The minutes can carry a decimal. Add a stop's minutes to a departure's `time_real`, or `time_planned` without one, to get its estimated arrival there. Ask again after `valid_until`. The README's *Data updates* section says when a call costs a request. It answers `not_loaded`, `catalogue_unavailable` and `upstream` like the commands above, and `invalid_stop` for a DIVA without a departure board.

## Style

- TypeScript strict; the `tsconfig.json` flags are not negotiable, and `vp check` reports no warnings (`denyWarnings`).
- Comments say why, not what; identifiers carry the what.
- The browser floor is ES2022: `sorted()` from `src/utils.ts` instead of `toSorted()`, and no other ES2023 built-in. Imports carry `.js` extensions, as the built bundle resolves them.
- Runtime dependencies are `lit` and `qr-creator`; adding one goes through *Dependencies*.
- Python: `pyproject.toml` is the source of truth for ruff, mypy and coverage; change rules there, never in CI flags or hook args. A rule that is noise in tests goes into `per-file-ignores`, not off.
- German copy uses du.

## Reporting issues

Open an issue with:

- your Home Assistant version and the Wiener Linien Austria version
- the diagnostics download: **Settings → Devices & services → Wiener Linien Austria** → ⋮ → **Download diagnostics**. Coordinates and the other fields in `TO_REDACT` are redacted before the file is written.
- the steps to reproduce, and the log lines from `custom_components.wiener_linien_austria`

A security problem goes through **Report a vulnerability** under the repository's **Security** tab, not a public issue.
