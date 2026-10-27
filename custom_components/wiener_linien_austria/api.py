"""Transport for every Wiener Linien upstream: realtime, routing and OGD files.

Three hosts' worth of endpoints, all on www.wienerlinien.at:

- `ogd_realtime` — `/monitor` (departure boards, live times, the config
  flow's line probe) and `/trafficInfoList` (disruptions, elevators).
- `ogd_routing` — the Mentz EFA server: `XML_TRIP_REQUEST2` (A→B trips) and
  `XML_DM_REQUEST` (planned S-Bahn departures).
- `ogd_realtime/doku` — the weekly static CSVs and GTFS `routes.txt`.

This module owns the URLs, the request headers and turning every transport
failure into one of the `WienerLinienApiError` subclasses below. It returns
decoded bodies and leaves their meaning to the callers: `messageCode`
handling, rate limits, parsing, cooldowns and translated errors all stay
with the module that owns that feature. Callers pass in the
`aiohttp.ClientSession` and the User-Agent.

It deliberately imports nothing from Home Assistant and nothing from the
rest of the package (`const.py` pulls in HA for its User-Agent), and
`tests/test_api.py` enforces that.

Request headers
---------------

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

No conditional GET
------------------

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

from collections.abc import Iterable, Sequence
from typing import Any, Final

import aiohttp

API_BASE_URL: Final = "https://www.wienerlinien.at/ogd_realtime"
MONITOR_ENDPOINT: Final = "/monitor"
TRAFFIC_INFO_ENDPOINT: Final = "/trafficInfoList"

ROUTING_BASE_URL: Final = "https://www.wienerlinien.at/ogd_routing"
ROUTING_TRIP_ENDPOINT: Final = "/XML_TRIP_REQUEST2"
ROUTING_DEPARTURE_ENDPOINT: Final = "/XML_DM_REQUEST"

STATIC_FILES: Final = {
    "haltestellen": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-haltestellen.csv",
    "haltepunkte": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-haltepunkte.csv",
    "linien": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-linien.csv",
    "fahrwegverlaeufe": (
        f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-fahrwegverlaeufe.csv"
    ),
    # GTFS routes.txt — authoritative `route_color` + `route_text_color`
    # per line label. Roughly 8 KB on the wire (gzipped). Keeps the card's
    # default palette in sync with whatever Wiener Linien publishes
    # (e.g. the U5 launch will rev every metro colour at once).
    "routes": f"{API_BASE_URL}/doku/ogd/gtfs/routes.txt",
}


class WienerLinienApiError(Exception):
    """Base class for every failure talking to a Wiener Linien endpoint."""


class ApiTimeoutError(WienerLinienApiError):
    """The request didn't finish within its timeout."""

    def __init__(self, seconds: float) -> None:
        super().__init__(f"timed out after {seconds:g} s")
        self.seconds = seconds


class ApiConnectionError(WienerLinienApiError):
    """The request never got an HTTP answer (DNS, refused, reset, …)."""

    def __init__(self, err: aiohttp.ClientError) -> None:
        super().__init__(f"{type(err).__name__}: {err}")
        self.error_type = type(err).__name__
        self.error = str(err)


class ApiHttpError(WienerLinienApiError):
    """The server answered with a 4xx or 5xx status."""

    def __init__(self, status: int, reason: str) -> None:
        super().__init__(f"HTTP {status}: {reason}")
        self.status = status
        self.reason = reason


class ApiPayloadError(WienerLinienApiError):
    """A 2xx answer whose body isn't the JSON the endpoint promises."""

    def __init__(self, status: int, error: str) -> None:
        super().__init__(error)
        self.status = status
        self.error = error


class ApiResponseShapeError(ApiPayloadError):
    """The body parses as JSON, but isn't an object."""

    def __init__(self, status: int, got: str) -> None:
        super().__init__(status, f"expected an object, got {got}")
        self.got = got


def request_headers(user_agent: str) -> dict[str, str]:
    """Headers sent with every request: identity only (see module docstring).

    Returns a fresh dict on each call so a caller that needs extras can
    mutate its copy without leaking back into the shared shape.
    """
    return {"User-Agent": user_agent}


async def get_json(
    session: aiohttp.ClientSession,
    url: str,
    *,
    params: Sequence[tuple[str, str]],
    user_agent: str,
    timeout_seconds: float,
    any_content_type: bool = False,
) -> dict[str, Any]:
    """GET `url` and return its JSON object, or raise a WienerLinienApiError.

    `any_content_type` skips aiohttp's `application/json` check. The routing
    server labels its JSON `text/html`, so it needs this, not as a defence.
    """
    try:
        async with session.get(
            url,
            params=list(params),
            headers=request_headers(user_agent),
            timeout=aiohttp.ClientTimeout(total=timeout_seconds),
        ) as resp:
            status = resp.status
            resp.raise_for_status()
            try:
                if any_content_type:
                    body = await resp.json(content_type=None)
                else:
                    body = await resp.json()
            # ContentTypeError first: it is also a ClientResponseError.
            except (aiohttp.ContentTypeError, ValueError) as err:
                raise ApiPayloadError(status, str(err)) from err
    except TimeoutError as err:
        raise ApiTimeoutError(timeout_seconds) from err
    except aiohttp.ClientResponseError as err:
        raise ApiHttpError(err.status, err.message or "") from err
    except aiohttp.ClientError as err:
        raise ApiConnectionError(err) from err
    if not isinstance(body, dict):
        raise ApiResponseShapeError(status, type(body).__name__)
    return body


async def get_text(
    session: aiohttp.ClientSession, url: str, *, user_agent: str, timeout_seconds: float
) -> str:
    """GET `url` and return its body as text, or raise a WienerLinienApiError."""
    try:
        async with session.get(
            url,
            headers=request_headers(user_agent),
            timeout=aiohttp.ClientTimeout(total=timeout_seconds),
        ) as resp:
            resp.raise_for_status()
            return await resp.text()
    except TimeoutError as err:
        raise ApiTimeoutError(timeout_seconds) from err
    except aiohttp.ClientResponseError as err:
        raise ApiHttpError(err.status, err.message or "") from err
    except aiohttp.ClientError as err:
        raise ApiConnectionError(err) from err


async def fetch_monitor(
    session: aiohttp.ClientSession,
    rbls: Iterable[int],
    *,
    user_agent: str,
    timeout_seconds: float,
) -> dict[str, Any]:
    """`/monitor` for the given stop points (RBLs), one `stopId` per stop.

    The body is returned whatever its `messageCode`: what a non-OK code
    means (rate limit, unknown stop, …) depends on who is asking.
    """
    return await get_json(
        session,
        f"{API_BASE_URL}{MONITOR_ENDPOINT}",
        params=[("stopId", str(rbl)) for rbl in rbls],
        user_agent=user_agent,
        timeout_seconds=timeout_seconds,
    )


async def fetch_traffic_info(
    session: aiohttp.ClientSession,
    names: Iterable[str],
    *,
    user_agent: str,
    timeout_seconds: float,
) -> dict[str, Any]:
    """`/trafficInfoList` for the given feed names, in one request."""
    return await get_json(
        session,
        f"{API_BASE_URL}{TRAFFIC_INFO_ENDPOINT}",
        params=[("name", name) for name in names],
        user_agent=user_agent,
        timeout_seconds=timeout_seconds,
    )


async def fetch_routing(
    session: aiohttp.ClientSession,
    endpoint: str,
    params: Sequence[tuple[str, str]],
    *,
    user_agent: str,
    timeout_seconds: float,
) -> dict[str, Any]:
    """One request to the EFA routing server (trip or departure monitor)."""
    return await get_json(
        session,
        f"{ROUTING_BASE_URL}{endpoint}",
        params=params,
        user_agent=user_agent,
        timeout_seconds=timeout_seconds,
        any_content_type=True,
    )
