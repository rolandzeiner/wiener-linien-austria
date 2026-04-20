"""Constants for Wiener Linien Austria."""
from __future__ import annotations

from typing import Final

DOMAIN: Final = "wiener_linien_austria"

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

# Static cache refresh interval (weekly is plenty for Wiener Linien's
# stop catalogue; it changes only when routes do).
STATIC_CACHE_REFRESH_HOURS: Final = 24 * 7

# Upstream API
API_BASE_URL: Final = "https://www.wienerlinien.at/ogd_realtime"
MONITOR_ENDPOINT: Final = "/monitor"

STATIC_FILES: Final = {
    "haltestellen": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-haltestellen.csv",
    "haltepunkte": f"{API_BASE_URL}/doku/ogd/wienerlinien-ogd-haltepunkte.csv",
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

# Lovelace card — version must match the `const CARD_VERSION` in
# www/wiener-linien-austria-card.js byte-for-byte, else the reload banner loops.
CARD_VERSION: Final = "0.1.0"
CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-card.js"
