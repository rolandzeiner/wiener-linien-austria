"""HTTP helpers for the Wiener Linien integration.

Centralises the one cross-cutting concern we want on every outbound call:
an explicit `Accept-Encoding: gzip`. `aiohttp` does not add it on its own,
so without this header the server has no way to know the client accepts
compression; decompression on the response is transparent.

There is deliberately no conditional-GET (`If-None-Match` /
`If-Modified-Since`) support here. An earlier revision threaded a
`CacheValidators` pair through all three call families on the assumption
that "the Wiener Linien CDN sets ETag and Last-Modified on every endpoint
we hit". That assumption was wrong, and the machinery could never fire.
Measured against the live API on 2026-09-07:

- `/monitor` and `/trafficInfoList` send **no** `ETag`, `Last-Modified` or
  `Cache-Control` at all, so there is no validator to echo back.
- The four `doku/ogd/wienerlinien-ogd-*.csv` files DO send both, but the
  edge ignores them: `If-None-Match: *` — which RFC 9110 13.1.2 says MUST
  return 304 for a resource that exists — comes back `200`, and so does
  `If-Modified-Since` with a far-future date. Their `ETag` carries a
  per-request Dynatrace nonce, and their `Last-Modified` is synthetic
  (every file reports the same value, rounded to the hour), so neither is
  a change signal even in principle.
- `doku/ogd/gtfs/routes.txt` is served by a different origin with a real
  Apache `ETag` and a real `Last-Modified`, and still answers `200` to
  both validators.

`HEAD` (answers `text/html` with no length and no validators) and `Range`
(ignored; returns the full body with `200`) are equally dead as cheap
freshness probes. If you are tempted to reintroduce any of this, re-run
those probes first — and note that a content hash would detect change but
save no bytes, because the body has to be downloaded either way.

`gzip` is worth keeping and then some: a 60-stop `/monitor` response
measured 345,872 bytes raw against 20,894 on the wire (16.6x), and a
200-stop response 929,689 against 52,316 (17.8x). The four OGD CSVs
ignore the header, but `/monitor`, `/trafficInfoList` and `routes.txt`
all honour it.
"""

from __future__ import annotations


def base_request_headers(user_agent: str) -> dict[str, str]:
    """Common request headers shared by every outbound call.

    `gzip` matters: payloads at busy multi-line stops are an order of
    magnitude smaller when compressed. `aiohttp` decompresses
    transparently; without the explicit header the server has no way to
    know the client accepts it.
    """
    return {
        "User-Agent": user_agent,
        "Accept-Encoding": "gzip",
    }
