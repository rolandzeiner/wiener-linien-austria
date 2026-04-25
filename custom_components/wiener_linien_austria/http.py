"""HTTP helpers for the Wiener Linien integration.

Centralises two cross-cutting concerns we want on every outbound call:

- `gzip` request encoding — `aiohttp` does not auto-add `Accept-Encoding`,
  so we ship it explicitly. Decompression is transparent on the response.
- `If-None-Match` / `If-Modified-Since` conditional GET — the Wiener Linien
  CDN sets `ETag` and `Last-Modified` on every endpoint we hit, so we can
  short-circuit identical responses with a `304 Not Modified` (no body) and
  reuse the previously-parsed payload. Saves bandwidth on the 5-min alerts
  refresh, the weekly static catalogue refresh, and the per-tick monitor
  poll when nothing has changed upstream.
"""
from __future__ import annotations

from dataclasses import dataclass

import aiohttp


@dataclass(slots=True)
class CacheValidators:
    """Conditional-GET validators captured from a previous response."""

    etag: str | None = None
    last_modified: str | None = None

    def to_request_headers(self) -> dict[str, str]:
        """Build the conditional-GET request headers from this validator pair."""
        out: dict[str, str] = {}
        if self.etag:
            out["If-None-Match"] = self.etag
        if self.last_modified:
            out["If-Modified-Since"] = self.last_modified
        return out

    def update_from_response(self, resp: aiohttp.ClientResponse) -> None:
        """Capture validators from the response for the next request."""
        etag = resp.headers.get("ETag")
        last_modified = resp.headers.get("Last-Modified")
        if etag:
            self.etag = etag
        if last_modified:
            self.last_modified = last_modified


def base_request_headers(user_agent: str) -> dict[str, str]:
    """Common request headers shared by every outbound call.

    `gzip` matters: payloads at busy multi-line stops are 3-5x smaller
    when compressed. `aiohttp` decompresses transparently; without the
    explicit header the server has no way to know the client accepts it.
    """
    return {
        "User-Agent": user_agent,
        "Accept-Encoding": "gzip",
    }
