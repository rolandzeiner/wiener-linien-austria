"""Constants for Wiener Linien Austria."""
from __future__ import annotations

from typing import Final

from homeassistant.const import __version__ as _HA_VERSION

DOMAIN: Final = "wiener_linien_austria"

# Integration version — manifest.json carries the clean target ("1.3.0");
# this constant is allowed to carry a "-beta-N" suffix during development.
INTEGRATION_VERSION: Final = "1.3.0"

# User-Agent header sent on every outbound request. Identifying ourselves
# beyond HA's default clientsession UA lets Wiener Linien traffic-shape or
# reach out to *this* integration specifically rather than blanket-blocking
# the HA UA for everyone. HA convention: "HomeAssistant/{ver} {slug}/{ver}".
USER_AGENT: Final = f"HomeAssistant/{_HA_VERSION} {DOMAIN}/{INTEGRATION_VERSION}"

# Config entry keys
CONF_DIVA: Final = "diva"
CONF_STOP_NAME: Final = "stop_name"
CONF_RBLS: Final = "rbls"
CONF_LINES: Final = "lines"  # selected {rbl}_{line}_{direction} ids
CONF_SEARCH_QUERY: Final = "search_query"

# Polling policy
# Wiener Linien fair-use rule = 15s minimum. We enforce 30s as a hard floor
# so two concurrent entries still leave headroom. Default is a comfortable 60s.
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
# than a few times an hour and fetching more often just eats the fair-use
# budget that belongs to live departure polling.
ALERTS_REFRESH_SECONDS: Final = 300

# hass.data keys for the shared alert caches + scheduler unsub.
TRAFFIC_INFO_KEY: Final = "traffic_info"
ELEVATOR_INFO_KEY: Final = "elevator_info"
ALERTS_REFRESH_UNSUB_KEY: Final = "alerts_refresh_unsub"
# Cache validators (ETag / Last-Modified) per alert feed, captured from
# the previous /trafficInfoList response so unchanged feeds come back
# as 304 Not Modified instead of full bodies.
ALERT_CACHE_VALIDATORS_KEY: Final = "alert_cache_validators"
# Reference-count of live config entries — used to drive the domain-wide
# cleanup (cancelling the alerts + static refresh timers, dropping the
# in-memory caches) when the *last* entry is removed.
ENTRY_COUNT_KEY: Final = "entry_count"

STATIC_FILES: Final = {
    "haltestellen": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-haltestellen.csv",
    "haltepunkte": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-haltepunkte.csv",
    "linien": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-linien.csv",
    "fahrwegverlaeufe": (
        f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-fahrwegverlaeufe.csv"
    ),
}

# Response attribution (CC-BY mandated)
ATTRIBUTION: Final = (
    "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0"
)

# Error code 316 = rate limit exceeded per Wiener Linien fair-use.
ERR_RATE_LIMIT: Final = 316

# MeansOfTransport values → rough categorisation for UI icons
LINE_TYPE_METRO: Final = "ptMetro"
LINE_TYPE_TRAM: Final = "ptTram"
LINE_TYPE_BUS_DAY: Final = "ptBusCity"
LINE_TYPE_BUS_NIGHT: Final = "ptBusNight"

# Lovelace cards — each JS file carries a `const CARD_VERSION` that must
# match the corresponding Python constant below byte-for-byte, else the
# reload banner loops. Retro card iterates independently from the modern
# one so the two can rev at different paces without spurious reloads.
CARD_VERSION: Final = "1.3.0"
CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-card.js"
RETRO_CARD_VERSION: Final = "1.3.0"
RETRO_CARD_URL: Final = (
    "/wiener-linien-austria/wiener-linien-austria-retro-card.js"
)

# Cap on how many departures we surface in sensor attributes. The card maxes
# out at 20 per stop; 30 gives buffer for diagnostics and templates while
# keeping the full payload comfortably under HA's 16 KB recorder attribute
# cap at busy multi-line stops (Stephansplatz tracks U1/U3/U4).
MAX_DEPARTURES_IN_ATTRS: Final = 30

# Hybrid truncation for per-departure `stops_ahead`: when the route from the
# current stop to the terminus has more than (HEAD + 1 ellipsis + terminus)
# entries, surface only the first HEAD + an ellipsis marker + the terminus.
# Keeps the recorder attribute payload bounded on long lines (U6 end-to-end
# is ~24 stops) while preserving the user's mental anchor (the destination)
# and immediate next stops.
STOPS_AHEAD_HEAD_COUNT: Final = 4
STOPS_AHEAD_MAX_FULL: Final = STOPS_AHEAD_HEAD_COUNT + 1 + 1  # head + ellipsis + terminus
