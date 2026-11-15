"""Defensive coercions shared by the upstream response parsers.

The `/monitor` feed, the routing server's trip and departure responses and
the live-times board all arrive as loosely typed JSON, and every parser
needs the same few "take it if it has the right shape, else a neutral
value" steps. They lived as private copies in each parsing module; one
home keeps them from drifting apart.
"""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime
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


def parse_aware_datetime(value: Any) -> datetime | None:
    """`2026-12-31T23:59:00.000+0100` → aware datetime; None if unreadable.

    For the real-time feeds' stamps, which always carry an offset. A value
    without one is unreadable here: guessing a zone would move the time.
    """
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None


def as_str_list(value: Any) -> list[str]:
    """The non-empty strings of a list (or the keys of a mapping), stripped.

    For `relatedLines` in `/trafficInfoList` and `/newsList`, which arrives
    as a list of labels and, on some lift notices, as a mapping keyed by
    them.
    """
    if isinstance(value, (list, Mapping)):
        return [
            item.strip() for item in value if isinstance(item, str) and item.strip()
        ]
    return []


def as_int_list(value: Any) -> list[int]:
    """The whole numbers of a list, as ints; everything else is dropped.

    For `relatedStops` (RBLs), sent as numbers and now and then as digit
    strings. A bool is not a platform number.
    """
    if not isinstance(value, list):
        return []
    found: list[int] = []
    for item in value:
        if isinstance(item, int) and not isinstance(item, bool):
            found.append(item)
        elif isinstance(item, str) and item.strip().isdigit():
            found.append(int(item))
    return found
