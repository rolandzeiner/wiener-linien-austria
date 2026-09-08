"""HTTP helpers for the Wiener Linien integration.

Centralises the outbound identity headers so the four call sites — the batch
`/monitor` fetch, the `/trafficInfoList` alerts refresh, the config-flow probe
and the static CSV downloads — cannot drift in what they send.

Deliberately **absent**: `Accept-Encoding`. `aiohttp` already sets one of its
own (`ClientRequest.DEFAULT_HEADERS`, built by `_gen_default_accept_encoding()`),
and a value passed here *replaces* that default rather than adding to it.
Measured 2026-09-08 on aiohttp 3.14.3 / Python 3.14: the default offer is
`gzip, deflate, zstd`, while an explicit `{"Accept-Encoding": "gzip"}` narrows
what reaches the server to exactly `gzip`.

An earlier revision pinned `gzip` here on the premise that "aiohttp does not add
it on its own". That holds for `curl` — which sends nothing unless asked, and is
where the original measurements were taken — but not for aiohttp. Omitting the
header keeps the full offer, so if the ÖDV edge ever enables brotli or zstd we
pick it up with no code change.

On today's wire it makes no difference, because the upstream is gzip-only.
Measured 2026-09-08 against `/monitor` with three stops: `identity` 22,290 B,
explicit `gzip` 1,636 B, aiohttp's `gzip, deflate, zstd` 1,636 B — and a
`br`-only or `zstd`-only offer comes back *uncompressed*, which is what proves
gzip is the ceiling here rather than merely the server's preference.

Compression itself is worth keeping and then some: a 60-stop `/monitor` response
measured 345,872 bytes raw against 20,894 on the wire (16.6x), and a 200-stop
response 929,689 against 52,316 (17.8x). The four OGD CSVs ignore encoding
negotiation entirely; `/monitor`, `/trafficInfoList` and `routes.txt` all honour
it.

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
"""

from __future__ import annotations


def base_request_headers(user_agent: str) -> dict[str, str]:
    """Common request headers shared by every outbound call.

    Carries identity only. `Accept-Encoding` is intentionally left out so
    `aiohttp` sends its own full offer — see the module docstring for why
    setting it here would narrow rather than widen what we ask for.

    Returns a fresh dict on each call so a call site that needs extras can
    mutate its copy without leaking back into the shared shape.
    """
    return {
        "User-Agent": user_agent,
    }
