#!/usr/bin/env python3
"""Keep the README's table of contents in step with its `##` headings.

The list lives between `<!-- toc -->` and `<!-- tocstop -->` and is generated,
never hand-edited. Two modes:

    python3 scripts/readme_toc.py           # rewrite the list in place
    python3 scripts/readme_toc.py --check   # exit 1 if the list is stale

The pre-commit hook runs the first, so a renamed or added section updates the
list on commit. CI runs the second, so a commit made without the hook can't
leave it stale.

Only `##` sections are listed: with the `###` ones the list would run longer
than most sections. Links use GitHub's heading anchors (lower case, spaces to
hyphens, punctuation dropped, `-1`, `-2` for repeats). HACS renders headings
without anchors, so there the links show but don't jump; nothing breaks.

Standard library only, so it runs on a bare CI runner without the venv.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

README = Path(__file__).resolve().parent.parent / "README.md"
START = "<!-- toc -->"
STOP = "<!-- tocstop -->"
TITLE = "## Contents"

_FENCE = re.compile(r"^\s*(```|~~~)")
_SECTION = re.compile(r"^## (?P<title>.+?)\s*#*\s*$")
# What GitHub drops from a heading before hyphenating it.
_NOT_ANCHOR = re.compile(r"[^\w\- ]")
_MARKDOWN_LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")


def _anchor(title: str, seen: dict[str, int]) -> str:
    """GitHub's anchor for a heading, numbered like GitHub for repeats."""
    text = _MARKDOWN_LINK.sub(r"\1", title).replace("`", "")
    base = _NOT_ANCHOR.sub("", text.strip().lower()).replace(" ", "-")
    count = seen.get(base, 0)
    seen[base] = count + 1
    return base if count == 0 else f"{base}-{count}"


def _sections(lines: list[str]) -> list[tuple[str, str]]:
    """(title, anchor) of every `##` heading outside code blocks and the list."""
    sections: list[tuple[str, str]] = []
    seen: dict[str, int] = {}
    in_fence = in_toc = False
    for line in lines:
        if _FENCE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if line.strip() == START:
            in_toc = True
        elif line.strip() == STOP:
            in_toc = False
        elif not in_toc and (match := _SECTION.match(line)):
            title = match["title"]
            sections.append((title, _anchor(title, seen)))
    return sections


def render(readme: str) -> str:
    """The README with a freshly generated list between the markers."""
    lines = readme.split("\n")
    try:
        start = lines.index(START)
        stop = lines.index(STOP, start)
    except ValueError:
        sys.exit(f"{README.name}: add {START} and {STOP} where the list goes.")
    # The list's own heading is inside the markers, so it isn't listed.
    toc = [TITLE, ""]
    toc += [f"- [{title}](#{anchor})" for title, anchor in _sections(lines)]
    return "\n".join([*lines[: start + 1], "", *toc, "", *lines[stop:]])


def main() -> int:
    current = README.read_text(encoding="utf-8")
    fresh = render(current)
    if fresh == current:
        return 0
    if "--check" in sys.argv[1:]:
        print(
            f"::error file={README.name}::The table of contents is out of date. "
            "Run `python3 scripts/readme_toc.py` and commit the result."
        )
        return 1
    README.write_text(fresh, encoding="utf-8")
    print(f"Updated the table of contents in {README.name}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
