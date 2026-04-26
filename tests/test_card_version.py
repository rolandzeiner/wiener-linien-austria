"""Invariant: Python card-version constants must match the TS bundle.

If these drift, HA's frontend WebSocket check sees a mismatch, shows a
reload banner, the reload re-serves the same mismatched JS, and the
banner reappears — infinite loop for every user on an old card.
Locking the equality in a test catches one-sided bumps in CI before they
ship.

Wiener Linien ships *two* card variants (modern + retro), each with its
own constant. The test asserts both pairs separately so a failure
points at exactly which constant drifted.
"""
from __future__ import annotations

import re
from pathlib import Path

from custom_components.wiener_linien_austria.const import (
    CARD_VERSION,
    RETRO_CARD_VERSION,
)

_TS_CONST = Path(__file__).parent.parent / "src" / "const.ts"
_CARD_PATTERN = re.compile(r'\bCARD_VERSION\s*=\s*"([^"]+)"')
_RETRO_PATTERN = re.compile(r'\bRETRO_CARD_VERSION\s*=\s*"([^"]+)"')


def _read_ts_source() -> str:
    assert _TS_CONST.is_file(), f"expected TS const at {_TS_CONST}"
    return _TS_CONST.read_text(encoding="utf-8")


def test_card_version_matches_ts() -> None:
    """`const.py:CARD_VERSION` must be byte-identical to `src/const.ts:CARD_VERSION`.

    `\\b` excludes the `RETRO_CARD_VERSION` line because `_` is a regex word
    character — there is no word-boundary between the underscore and `C`.
    """
    ts_source = _read_ts_source()
    match = _CARD_PATTERN.search(ts_source)
    assert match is not None, (
        f"CARD_VERSION literal not found in {_TS_CONST}; regex may be stale"
    )
    ts_version = match.group(1)
    assert ts_version == CARD_VERSION, (
        f"CARD_VERSION drift: const.py={CARD_VERSION!r} vs "
        f"src/const.ts={ts_version!r} — bump both in the same commit"
    )


def test_retro_card_version_matches_ts() -> None:
    """`const.py:RETRO_CARD_VERSION` must be byte-identical to `src/const.ts:RETRO_CARD_VERSION`."""
    ts_source = _read_ts_source()
    match = _RETRO_PATTERN.search(ts_source)
    assert match is not None, (
        f"RETRO_CARD_VERSION literal not found in {_TS_CONST}; regex may be stale"
    )
    ts_version = match.group(1)
    assert ts_version == RETRO_CARD_VERSION, (
        f"RETRO_CARD_VERSION drift: const.py={RETRO_CARD_VERSION!r} vs "
        f"src/const.ts={ts_version!r} — bump both in the same commit"
    )
