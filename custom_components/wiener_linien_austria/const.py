"""Constants for Wiener Linien Austria."""

from __future__ import annotations

import json
from datetime import timedelta
from pathlib import Path
from typing import Final, Literal

from homeassistant.const import __version__ as _HA_VERSION

DOMAIN: Final = "wiener_linien_austria"

# Integration version — read from manifest.json at module import so the
# string can never drift from HACS's authoritative source. Sync read of a
# ~600-byte file happens once per process; the manifest is required for
# HACS anyway. Release workflow: bump only manifest.json "version".
INTEGRATION_VERSION: Final = json.loads(
    (Path(__file__).parent / "manifest.json").read_text(encoding="utf-8")
)["version"]

# User-Agent header sent on every outbound request. Identifying ourselves
# beyond HA's default clientsession UA lets Wiener Linien traffic-shape or
# reach out to *this* integration specifically rather than blanket-blocking
# the HA UA for everyone. HA convention: "HomeAssistant/{ver} {slug}/{ver}".
# The trailing "(+<repo-url>)" comment follows RFC-9110 product-token-comment
# convention so the upstream operator has a direct contact point for abuse
# / coordination without having to find the repo by guessing.
USER_AGENT: Final = (
    f"HomeAssistant/{_HA_VERSION} {DOMAIN}/{INTEGRATION_VERSION} "
    f"(+https://github.com/rolandzeiner/wiener-linien-austria)"
)

# Config entry keys
CONF_DIVA: Final = "diva"
CONF_STOP_NAME: Final = "stop_name"
CONF_RBLS: Final = "rbls"
CONF_LINES: Final = "lines"  # selected "{line}|{direction}" keys (see _line_key)
# Nearby-stop block pinned to the top of the stop picker.
# The catalogue carries lat/lon for every DIVA, so the picker can lead with
# the stations closest to `hass.config.latitude/longitude`. 2 km is roughly
# "still walkable, definitely your stop" in Vienna, where the median gap
# between stops is ~350 m; past that a distance-sorted row stops being a
# shortcut and the alphabetical remainder serves better. 10 entries keeps
# the pinned block from crowding out the rest of the list.
NEARBY_STOP_LIMIT: Final = 10
NEARBY_STOP_MAX_METERS: Final = 2000

# Polling policy.
# The conventional minimum interval circulated for the Wiener Linien OGD
# real-time endpoint is 15 s — the WL `open-data` page documents the
# CC-BY licence and "no API key required" but does not currently publish
# a numeric request-rate cap, so 15 s is convention rather than written
# rule. We enforce 30 s as a hard floor (twice the conventional minimum)
# so two concurrent entries still leave headroom. Default is 60 s.
MIN_POLL_SECONDS: Final = 30
DEFAULT_SCAN_INTERVAL: Final = 60  # seconds
MAX_POLL_SECONDS: Final = 600

# Domain-wide cooldown: keeps the aggregate request rate from this
# integration (all entries combined) above the 15s floor.
DOMAIN_LAST_CALL_KEY: Final = "last_call_ts"
DOMAIN_COOLDOWN_SECONDS: Final = 15

# Exponential-backoff ceiling for the per-entry monitor coordinator.
# Sustained API outages settle at this cadence instead of hammering at
# the user-configured interval. Cap chosen to keep an outage visible
# without amplifying load — 30 min is comfortably below "user thinks
# the integration is broken" and well above any realistic transient hiccup.
BACKOFF_CAP_SECONDS: Final = 1800

# Static cache refresh interval (weekly is plenty for Wiener Linien's
# stop catalogue; it changes only when routes do).
STATIC_CACHE_REFRESH_HOURS: Final = 24 * 7

# Upstream API
API_BASE_URL: Final = "https://www.wienerlinien.at/ogd_realtime"
MONITOR_ENDPOINT: Final = "/monitor"
TRAFFIC_INFO_ENDPOINT: Final = "/trafficInfoList"

# Alerts (traffic disruptions + elevator outages) refresh cadence. Domain-wide,
# shared across all entries. 5 min is plenty — these don't change any faster
# than a few times an hour and fetching more often just eats the request
# budget that belongs to live departure polling.
ALERTS_REFRESH_SECONDS: Final = 300

# hass.data keys for the shared alert caches + scheduler unsub.
TRAFFIC_INFO_KEY: Final = "traffic_info"
ELEVATOR_INFO_KEY: Final = "elevator_info"
ALERTS_REFRESH_UNSUB_KEY: Final = "alerts_refresh_unsub"
# Monotonic counter bumped on every successful alerts refresh. Sensors
# memoise their `extra_state_attributes` dict (which embeds the matched
# alerts) and use this counter as the cache-validity tag — when alerts
# refresh on their own ~5-min cadence (independent of the per-stop
# coordinator tick), the sensor sees the bump and rebuilds.
ALERTS_SEQ_KEY: Final = "alerts_seq"
# Cache validators (ETag / Last-Modified) per alert feed, captured from
# the previous /trafficInfoList response so unchanged feeds come back
# as 304 Not Modified instead of full bodies.
ALERT_CACHE_VALIDATORS_KEY: Final = "alert_cache_validators"
# Reference-count of live config entries — used to drive the domain-wide
# cleanup (cancelling the alerts + static refresh timers, dropping the
# in-memory caches) when the *last* entry is removed.
ENTRY_COUNT_KEY: Final = "entry_count"
# Registry of shared monitor batch groups, keyed by scan-interval seconds.
# Each group collapses every config entry that shares a polling cadence
# into ONE combined /monitor request per tick (repeated `stopId` params),
# then fans the response out to each member coordinator's own slice. See
# batch.py. Popped by `_teardown_domain_state` on last-entry removal.
BATCH_REGISTRY_KEY: Final = "monitor_batch_registry"
# Sentinel that the Lovelace resources have been registered for the
# current "run" (first entry → last entry → … → first entry again).
# Popped by `_teardown_domain_state` so the next first-entry boot
# re-registers after an async_remove_entry tore the resources down.
RESOURCES_REGISTERED_KEY: Final = "resources_registered"

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

# Response attribution (CC-BY mandated)
ATTRIBUTION: Final = "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0"

# Error code 316 = rate limit exceeded — observed empirically from the
# OGD real-time endpoint when the conventional 15-second minimum
# interval is breached (the public dataset page does not currently
# publish the exact threshold, but 316 is what the API returns).
ERR_RATE_LIMIT: Final = 316

# MeansOfTransport values → rough categorisation for UI icons. Mirrored
# in src/utils/mot.ts; tests/test_card_version.py:test_line_type_constants
# asserts byte-identity. `LineType` carries the same set as a Literal so
# call sites can declare the narrow shape without restating the strings.
LINE_TYPE_METRO: Final = "ptMetro"
LINE_TYPE_TRAM: Final = "ptTram"
LINE_TYPE_BUS_DAY: Final = "ptBusCity"
LINE_TYPE_BUS_NIGHT: Final = "ptBusNight"
LineType = Literal["ptMetro", "ptTram", "ptBusCity", "ptBusNight"]

# Direction codes from the /monitor feed. "H" = Hinfahrt (outbound),
# "R" = Rückfahrt (return). Used as keys in CONF_LINES ("U1|H").
Direction = Literal["H", "R"]

# Lovelace cards — this integration ships THREE (modern, retro, flap).
# Each JS file carries a `const CARD_VERSION` that must match the
# corresponding Python constant below byte-for-byte, else the reload
# banner loops. All three version in lockstep with the integration
# (mirrored in src/const.ts; tests/test_card_version.py asserts both
# directions). Each card still ships an independent WS probe so a
# mismatch on one bundle doesn't show a banner on the others.
CARD_VERSION: Final = INTEGRATION_VERSION
CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-card.js"
CARD_FILENAME: Final = "wiener-linien-austria-card.js"
RETRO_CARD_VERSION: Final = INTEGRATION_VERSION
RETRO_CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-retro-card.js"
RETRO_CARD_FILENAME: Final = "wiener-linien-austria-retro-card.js"
FLAP_CARD_VERSION: Final = INTEGRATION_VERSION
FLAP_CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-flap-card.js"
FLAP_CARD_FILENAME: Final = "wiener-linien-austria-flap-card.js"

# Webfonts directory — subsetted woff2 derivatives of TeX Gyre Heros +
# TeX Gyre Cursor (GUST Font License). Served from www/fonts/ as a
# directory-level static path so every card's @font-face URL resolves.
# Provenance + license at www/fonts/NOTICE.md.
FONTS_URL: Final = "/wiener-linien-austria/fonts"
FONTS_DIRNAME: Final = "fonts"

# Cap on how many departures we surface in sensor attributes, matching the
# card's own 20-per-stop maximum — surfacing more than the card can render
# costs payload for nothing.
#
# Not a recorder budget: `departures` is in sensor.py's
# `_unrecorded_attributes`, so the 16 KB attribute cap does not apply. (It
# used to, and is why the attribute was excluded.) What this bounds now is
# the live payload pushed to the frontend, WebSocket subscribers, and
# `/api/states` on every state write — which at busy multi-line stops
# (Stephansplatz tracks U1/U3/U4) is the cost that actually matters.
MAX_DEPARTURES_IN_ATTRS: Final = 20

# How far into the past a departure's `timePlanned` may sit before we treat
# the record as stale upstream data and drop it. Wiener Linien's /monitor
# endpoint can keep answering 200 OK with a well-formed but frozen payload:
# on 2026-08-27 the entire ptMetro feed stopped advancing and every U-Bahn
# stop served a single record whose `timePlanned` stayed put while
# `timeReal` tracked `serverTime` and `countdown` sat at 0 — rendering as a
# four-digit delay next to a permanent "Jetzt" for two and a half days.
#
# 3 h is deliberately generous. A survey of 1283 departures across every
# transport mode during that outage put the widest *legitimate* record at
# ~1.1 h ahead of serverTime, and a genuinely delayed vehicle runs minutes
# — not hours — behind its planned time, so the real-traffic margin is
# large. The ghost records sat 60 h out. Anything we cannot prove stale
# (no `timePlanned`, unparseable timestamp) is kept: fail open, never
# hide a departure on a guess.
STALE_DEPARTURE_MAX_AGE: Final = timedelta(hours=3)

# Hard safety cap on `stops_ahead` length per departure. The longest Wiener
# Linien lines are ~25 stops end-to-end; 30 gives generous headroom while
# still protecting against runaway data on a future schema surprise.
MAX_STOPS_AHEAD: Final = 30
