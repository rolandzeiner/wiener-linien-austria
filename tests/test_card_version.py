"""Invariant: card-version constants must match manifest + TS bundle.

Three places carry the version: `manifest.json`, `src/const.ts`, and
`const.py` (which now reads `manifest.json` at import for INTEGRATION_VERSION
and aliases both card consts to it). The tests below derive expected values
from `INTEGRATION_VERSION`, which itself derives from the manifest — so a
manifest-only bump still trips CI when `src/const.ts` is forgotten.

If these drift, HA's frontend WebSocket check sees a mismatch, shows a
reload banner, the reload re-serves the same mismatched JS, and the
banner reappears — infinite loop for every user on an old card.

Wiener Linien ships *two* card variants (modern + retro), each with its
own constant. The test asserts both pairs separately so a failure
points at exactly which constant drifted.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from custom_components.wiener_linien_austria.const import (
    CARD_VERSION,
    INTEGRATION_VERSION,
    RETRO_CARD_VERSION,
)

_TS_CONST = Path(__file__).parent.parent / "src" / "const.ts"
_MANIFEST = (
    Path(__file__).parent.parent
    / "custom_components"
    / "wiener_linien_austria"
    / "manifest.json"
)
_CARD_PATTERN = re.compile(r'\bCARD_VERSION\s*=\s*"([^"]+)"')
_RETRO_PATTERN = re.compile(r'\bRETRO_CARD_VERSION\s*=\s*"([^"]+)"')


def _read_ts_source() -> str:
    assert _TS_CONST.is_file(), f"expected TS const at {_TS_CONST}"
    return _TS_CONST.read_text(encoding="utf-8")


def _expected_version() -> str:
    """Authoritative version string. Reads manifest.json directly so the
    test can't be fooled by a const.py that aliases to a stale INTEGRATION_VERSION."""
    return json.loads(_MANIFEST.read_text(encoding="utf-8"))["version"]


def test_integration_version_matches_manifest() -> None:
    """`INTEGRATION_VERSION` must equal `manifest.json::version` byte-for-byte."""
    expected = _expected_version()
    assert INTEGRATION_VERSION == expected, (
        f"INTEGRATION_VERSION drift: const.py={INTEGRATION_VERSION!r} vs "
        f"manifest.json={expected!r} — const.py should derive from manifest"
    )


def test_card_version_aliases_integration_version() -> None:
    """`CARD_VERSION` is in lockstep with `INTEGRATION_VERSION` (no separate string)."""
    assert CARD_VERSION == INTEGRATION_VERSION, (
        f"CARD_VERSION drift: {CARD_VERSION!r} vs INTEGRATION_VERSION={INTEGRATION_VERSION!r} "
        "— CARD_VERSION should alias INTEGRATION_VERSION"
    )


def test_retro_card_version_aliases_integration_version() -> None:
    """`RETRO_CARD_VERSION` is in lockstep with `INTEGRATION_VERSION`."""
    assert RETRO_CARD_VERSION == INTEGRATION_VERSION, (
        f"RETRO_CARD_VERSION drift: {RETRO_CARD_VERSION!r} vs "
        f"INTEGRATION_VERSION={INTEGRATION_VERSION!r} "
        "— RETRO_CARD_VERSION should alias INTEGRATION_VERSION"
    )


def test_card_version_matches_ts() -> None:
    """`src/const.ts:CARD_VERSION` must equal the manifest version.

    `\\b` excludes the `RETRO_CARD_VERSION` line because `_` is a regex word
    character — there is no word-boundary between the underscore and `C`.
    """
    expected = _expected_version()
    ts_source = _read_ts_source()
    match = _CARD_PATTERN.search(ts_source)
    assert match is not None, (
        f"CARD_VERSION literal not found in {_TS_CONST}; regex may be stale"
    )
    ts_version = match.group(1)
    assert ts_version == expected, (
        f"CARD_VERSION drift: src/const.ts={ts_version!r} vs "
        f"manifest.json={expected!r} — bump both in the same commit"
    )


def test_retro_card_version_matches_ts() -> None:
    """`src/const.ts:RETRO_CARD_VERSION` must equal the manifest version."""
    expected = _expected_version()
    ts_source = _read_ts_source()
    match = _RETRO_PATTERN.search(ts_source)
    assert match is not None, (
        f"RETRO_CARD_VERSION literal not found in {_TS_CONST}; regex may be stale"
    )
    ts_version = match.group(1)
    assert ts_version == expected, (
        f"RETRO_CARD_VERSION drift: src/const.ts={ts_version!r} vs "
        f"manifest.json={expected!r} — bump both in the same commit"
    )
