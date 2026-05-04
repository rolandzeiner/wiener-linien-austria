# Contributing to Wiener Linien Austria

Thanks for taking the time to look. This file is the single answer to "how do I work on this repo?" — read it once and you'll have everything you need.

## Dev setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + checks on every commit

npm ci                  # Lovelace card deps
npm run build           # Rollup builds two bundles into
                        # custom_components/wiener_linien_austria/www/:
                        #   wiener-linien-austria-card.js
                        #   wiener-linien-austria-retro-card.js
```

`npm run dev` watches `src/` and rebuilds both bundles on save.

## Branching & releases

- Work on `dev`. PRs target `dev`.
- Releases are tagged from `main` after merging `dev → main`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Card-version sync

Two cards, two version constants. Both `CARD_VERSION` and `RETRO_CARD_VERSION` in `src/const.ts` must stay byte-identical to the same names in `custom_components/wiener_linien_austria/const.py` — `tests/test_card_version.py` enforces both pairs. Bump all four in the same commit (TS constants drive the served `?v=…` query string, the Python constants drive the WebSocket version check). If they drift, users get an infinite reload-banner loop.

`manifest.json` stays at the clean (non-beta) version; the TS + Python constants can carry a `-beta-N` suffix during development. The README badge auto-fetches the latest release tag, so it needs no manual edit.

## Tooling & config

- `pyproject.toml` — source of truth for ruff (target-version, line-length), mypy (strict, ignore_missing_imports, files), and coverage config. Change rules here, not in CI flags.
- `pytest.ini` — pytest config and the **`--cov-fail-under=90` coverage gate**. `pytest tests/` automatically runs with coverage; CI fails fast if a new commit drops coverage below the gate. Current measurement sits ~96%.
- `ATTRIBUTION` — canonical data-source statement (Wiener Linien OGD, CC BY 4.0) and licence terms; matches the `attribution` attribute every sensor emits. Update when the upstream API or licence wording changes (and keep `const.ATTRIBUTION` in sync).

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
npx tsc --noEmit
npm run build
```

CI runs the same checks plus hassfest + HACS validation. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Wiener Linien Austria version
- Diagnostics download (Settings → Devices & Services → Wiener Linien Austria → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
