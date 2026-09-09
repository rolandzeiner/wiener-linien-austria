#!/usr/bin/env python3
"""Enforce the Silver quality-scale rule: >95% coverage per module.

`--cov-fail-under` is a single number over the whole package, which is not
what the rule says and not what it protects against: one module can slide to
80% while the total stays comfortably above the gate, because the other
twelve carry it. That is exactly the state this repo was in — 91.81% total
with `diagnostics.py` at 84% and `quality_scale.yaml` claiming
`test-coverage: done`.

Reads the `coverage.json` that `pytest` writes (see `pytest.ini` addopts) and
fails if any module falls below the floor. Run it after the test suite:

    .venv/bin/python -m pytest tests/ -q
    .venv/bin/python scripts/check_module_coverage.py

Raise `FLOOR` only when every module clears the new number; lowering it needs
a reason written down here, not a quiet edit.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

FLOOR = 95.0
COVERAGE_JSON = Path("coverage.json")


def main() -> int:
    """Report every module under FLOOR; exit non-zero if any is."""
    if not COVERAGE_JSON.is_file():
        print(
            f"{COVERAGE_JSON} not found — run the test suite first "
            "(pytest writes it via the --cov-report=json addopt).",
            file=sys.stderr,
        )
        return 2

    data = json.loads(COVERAGE_JSON.read_text())
    files: dict[str, dict[str, Any]] = data.get("files", {})
    if not files:
        print("coverage.json carries no per-file data.", file=sys.stderr)
        return 2

    failures: list[tuple[str, float]] = []
    for path, entry in sorted(files.items()):
        percent = float(entry["summary"]["percent_covered"])
        # A module with no statements at all (a bare re-export) reports 100
        # and is not interesting either way.
        if entry["summary"]["num_statements"] == 0:
            continue
        if percent < FLOOR:
            failures.append((path, percent))

    if failures:
        print(f"Modules below the {FLOOR:.0f}% per-module floor:", file=sys.stderr)
        for path, percent in failures:
            print(f"  {percent:6.2f}%  {path}", file=sys.stderr)
        print(
            "\nThe Silver `test-coverage` rule is per module, not per package. "
            "Add tests, or correct quality_scale.yaml to say `todo`.",
            file=sys.stderr,
        )
        return 1

    worst = min(
        (
            (float(e["summary"]["percent_covered"]), p)
            for p, e in files.items()
            if e["summary"]["num_statements"]
        ),
        default=(100.0, "-"),
    )
    print(f"Every module clears {FLOOR:.0f}% (worst: {worst[1]} at {worst[0]:.2f}%).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
