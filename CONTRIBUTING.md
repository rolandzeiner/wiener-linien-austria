# Contributing to Wiener Linien Austria

Thanks for taking the time to look. This file is the single answer to "how do I work on this repo?" — read it once and you'll have everything you need.

## Dev setup

```bash
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + checks on every commit

npm ci                  # Lovelace card deps
npm run build           # Rollup builds three bundles into
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

Two cards, two version constants. Both `CARD_VERSION` and `RETRO_CARD_VERSION` in `src/const.ts` must stay byte-identical to the same names in `custom_components/wiener_linien_austria/const.py` — `tests/test_card_version.py` enforces both pairs. Bump all four in the same commit (TS constants drive the served `?v=…` query string, the Python constants drive the WebSocket version check). If they drift, users get an infinite reload-banner loop.

`manifest.json` stays at the clean (non-beta) version; the TS + Python constants can carry a `-beta-N` suffix during development. The README badge auto-fetches the latest release tag, so it needs no manual edit.

## Tooling & config

- `pyproject.toml` — source of truth for ruff (target-version, line-length), mypy (strict, ignore_missing_imports, files), and coverage config. Change rules here, not in CI flags.
  - **`target-version` tracks the oldest Python we support, never the one CI runs.** `hacs.json` promises HA ≥ 2025.1.0, which runs on Python 3.12, so `target-version = "py312"` — even though the venv and CI are on 3.14. Pointing it at the CI interpreter lets ruff rewrite code into syntax our users cannot parse and then stay silent about it; that is how v1.7.1 shipped a SyntaxError (issue #91). The `compile-floor-python` CI job byte-compiles the shipped package on 3.12 as an independent backstop. Raise all three together or not at all.
- `pytest.ini` — pytest config and the **`--cov-fail-under=90` coverage gate**. `pytest tests/` automatically runs with coverage; CI fails fast if a new commit drops coverage below the gate. Current measurement sits ~91%.
- `ATTRIBUTION` — canonical data-source statement (Wiener Linien OGD, CC BY 4.0) and licence terms; matches the `attribution` attribute every sensor emits. Update when the upstream API or licence wording changes (and keep `const.ATTRIBUTION` in sync).

## Dependency policy

`requirements_test.txt` carries its own rules in its header comment. This section covers `package.json`, which is JSON and cannot.

**Runtime vs dev is a real distinction here, not bookkeeping.** The package is `private` and nothing ever installs it, so the split looks cosmetic — but CI runs `npm audit --omit=dev --audit-level=high`, and that gate only means something because the packages that actually reach a user's browser inside the bundle are the ones in `dependencies`. A build-time tool belongs in `devDependencies` even though the build needs it; anything Rollup inlines into `www/*.js` belongs in `dependencies`.

**When to pin exactly vs. allow a caret:**

- **Caret (`^x.y.z`)** is the default. Use it for actively maintained packages that keep semver honestly — `lit`, `rollup`, `typescript`, the `@rollup/plugin-*` family.
- **Exact (`x.y.z`)** for three specific cases:
  1. **The package is unmaintained**, so a range floats over code nobody is watching. `qr-creator` is at its only release, built with a 2019 toolchain.
  2. **The "version" is really content, not an API.** A patch release can change what you get without changing any signature.
  3. **The version is mirrored somewhere else** and the two must move together. `vitest` is exact because its version and the `vite`/`rolldown` stack under it decide whether `?raw` imports keep working.

Bumping an exact pin is a deliberate act — say why in the commit message.

**Before adding a dependency, check it earns its place.** The bundle is served to every user on every dashboard load. Prefer inlining a constant over depending on a package that exports thousands of them: `utils/mdi-paths.ts` and `utils/retro-station-icons.ts` both vendor icon path geometry with provenance comments rather than pulling an icon library, because path data is content and Rollup was tree-shaking all but a handful of exports anyway.

**Rollup plugins are load-bearing or they are removed.** `validate.yml` asserts the committed bundles match a fresh build, so any plugin that changes output is part of that contract. `@rollup/plugin-commonjs` was dropped once every runtime dependency shipped ESM — the three bundles built byte-identically without it. If you add a CJS-only dependency, Rollup fails loudly and the plugin goes back in.

**`tslib` looks removable and is not.** `.fallowrc.json` lists it under `ignoreDependencies`, and that entry is not hiding a real finding — the config is strict JSON and rejects unknown keys, so the explanation has to live here:

- Nothing imports `tslib` from source, and the built bundles contain zero references to it. `tsconfig.json` sets no `importHelpers`, so `tsc` inlines `__decorate` rather than importing helpers.
- But `@rollup/plugin-typescript` resolves `tslib` unconditionally in its preflight hook — `if (!inputPreserveModules && tslib === null) context.error(...)`. Not conditional on `importHelpers`. Remove the package and `npm run build` dies before it reads a single source file.

That combination — invisible to static analysis, mandatory at build time — is exactly why it reads as dead weight. Verified the hard way on 2026-09-07. Keep the dependency and keep the ignore entry.

View per-file coverage locally:

```bash
pytest tests/ --cov-report=term-missing
```

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
npm run build
```

CI runs the same checks plus hassfest + HACS validation. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Wiener Linien Austria version
- Diagnostics download (Settings → Devices & Services → Wiener Linien Austria → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
