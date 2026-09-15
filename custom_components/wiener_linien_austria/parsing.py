"""Defensive coercions shared by the upstream response parsers.

The `/monitor` feed, the routing server's trip and departure responses and
the live-times board all arrive as loosely typed JSON, and every parser
needs the same few "take it if it has the right shape, else a neutral
value" steps. They lived as private copies in each parsing module; one
home keeps them from drifting apart.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any


def as_mapping(value: Any) -> Mapping[str, Any]:
    """The value when it is a mapping, else an empty one."""
    return value if isinstance(value, Mapping) else {}


def as_text(value: Any) -> str | None:
    """Stripped string, or None for missing / blank."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def as_int(value: Any) -> int | None:
    """Best-effort integer coercion; returns None on failure."""
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def s_bahn_number(label: str) -> int:
    """`S45` → 45, so S2 sorts before S45; 0 when no number follows."""
    digits = label[1:]
    return int(digits) if digits.isdigit() else 0
