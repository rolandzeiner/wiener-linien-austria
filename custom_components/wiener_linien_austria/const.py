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

# Exponential-backoff ceiling, shared by the monitor batch groups (batch.py)
# and the route coordinators. Sustained API outages settle at this cadence
# instead of hammering at the user-configured interval. Cap chosen to keep an outage visible
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
# `/trafficInfoList` feed names. Both travel as repeated `name=` params in
# ONE request; the response tags each entry with a `refTrafficInfoCategoryId`
# resolved through `data.trafficInfoCategories`. See alerts.py.
ALERT_FEED_TRAFFIC: Final = "stoerunglang"
ALERT_FEED_ELEVATOR: Final = "aufzugsinfo"
# The text the physical stop display shows — works detours, moved boarding
# points, permanently closed stops. Scoped to individual platforms rather
# than whole lines, so it is matched on RBL. Surfaced in the same card
# banner as `stoerunglang`; see alerts.TrafficInfo.
ALERT_FEED_TRAFFIC_SHORT: Final = "stoerungkurz"
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

# Line labels where `wienerlinien-ogd-linien.csv` and the realtime
# `/monitor` feed disagree about the same line. Keyed by `LineID`, which
# both sources carry (`LineID` in the CSV, `line.lineId` in the feed), so
# an entry can never be applied to the wrong line — a label-keyed table
# could, because the CSV reuses labels across modes.
#
# Verified 2026-09-12 by joining every live `line.lineId` seen across one
# probe per line (195 stops) against the CSV; exactly two lines diverge:
#
#     LineID | linien.csv | /monitor | line
#     -------+------------+----------+---------------------------------
#     399    | LB         | WLB      | Badner Bahn (Wiener Lokalbahnen)
#     825    | 25BR       | 25B      | 25B Rufbus (AST)
#
# Each value is `(linien.csv spelling, realtime spelling)`. The CSV half is
# checked before the override is applied, so if Wiener Linien ever fixes
# `LineText` upstream the entry quietly becomes a no-op rather than
# pinning a stale label.
#
# The feed's spelling wins: it is what `line.name` puts on every departure
# the cards render, so the catalogue has to speak the same vocabulary or
# a selected line silently matches nothing (issue #110).
#
# This table is the *display* half of the fix and only covers lines we
# could observe running. The coordinator additionally joins live rows to
# the catalogue by `lineId` at match time, so a divergence not listed here
# (the night Rufbus lines, which never run during a daytime probe) still
# filters correctly — it just keeps the catalogue's spelling on the chips.
REALTIME_LINE_LABELS: Final[dict[int, tuple[str, str]]] = {
    399: ("LB", "WLB"),
    825: ("25BR", "25B"),
}

# Derived reverse view: linien.csv spelling -> realtime spelling. Saved
# selections (`CONF_LINES`) written before the catalogue learned the feed's
# vocabulary carry the CSV spelling, and so does anything downstream that
# reads them back — the `tracked_lines` attribute the cards filter on, the
# alert line-matcher, the reconfigure form's preselection. Mapping through
# this on read keeps those entries working without rewriting stored data.
LEGACY_LINE_LABELS: Final[dict[str, str]] = dict(REALTIME_LINE_LABELS.values())

# GTFS `routes.txt` is a third vocabulary: it labels the Badner Bahn "BB"
# (agency 03, Wiener Lokalbahnen) where the realtime feed says "WLB".
# Without this the line's published navy (#0A295D) never reaches the
# cards and it renders in the neutral fallback. Applied on the GTFS side
# only — `REALTIME_LINE_LABELS` above cannot help here because routes.txt
# carries no LineID.
GTFS_LINE_LABEL_ALIASES: Final[dict[str, str]] = {
    "BB": "WLB",
}

# --- A→B routing (experimental) -------------------------------------
# A config entry is either a stop board (the original shape, which carries
# no `entry_type` key at all) or a route between two stations. Absent means
# stop, so every entry created before routing existed keeps loading as-is
# and nothing needs migrating.
CONF_ENTRY_TYPE: Final = "entry_type"
ENTRY_TYPE_STOP: Final = "stop"
ENTRY_TYPE_ROUTE: Final = "route"

CONF_ORIGIN_DIVA: Final = "origin_diva"
CONF_ORIGIN_NAME: Final = "origin_name"
CONF_DESTINATION_DIVA: Final = "destination_diva"
CONF_DESTINATION_NAME: Final = "destination_name"
CONF_ROUTE_TYPE: Final = "route_type"
CONF_MAX_CHANGES: Final = "max_changes"
CONF_WALK_SPEED: Final = "walk_speed"
CONF_MIN_TRANSFER_MINUTES: Final = "min_transfer_minutes"
CONF_EXCLUDED_MEANS: Final = "excluded_means"
# Plan only step-free connections: lifts or ramps instead of stairs and
# escalators, and low-floor vehicles. Absent on routes saved before the
# option existed, which reads as off, so no migration is needed.
CONF_STEP_FREE: Final = "step_free"
# Minutes before the best connection leaves that the "Time to leave" binary
# sensor turns on. Counted to the first departure of the trip, which on a
# step-free route is the walk to the platform, not the vehicle.
CONF_LEAVE_MINUTES: Final = "leave_minutes"
DEFAULT_LEAVE_MINUTES: Final = 5
MAX_LEAVE_MINUTES: Final = 30
CONF_ACTIVE_FROM: Final = "active_from"
CONF_ACTIVE_TO: Final = "active_to"
CONF_ACTIVE_DAYS: Final = "active_days"

# The EFA `routeType` optimisation targets (Mentz EFA XML interface, §5.2),
# stored lower-case. They double as selector translation keys, which hassfest
# requires to match `[a-z0-9-_]+`; `build_trip_params` upper-cases them for the
# request. Entries saved in upper case before 2.0.0 shipped are read through
# `routing.route_type_option`, so they keep working without a migration.
ROUTE_TYPES: Final = ("leasttime", "leastinterchange", "leastwalking")
DEFAULT_ROUTE_TYPE: Final = "leasttime"
# `changeSpeed` accepts named speeds; "normal" is the server default.
WALK_SPEEDS: Final = ("slow", "normal", "fast")
DEFAULT_WALK_SPEED: Final = "normal"
# "any" is stored instead of a number so the request simply omits
# `maxChanges`, leaving the server's own ceiling in charge.
MAX_CHANGES_ANY: Final = "any"
MAX_CHANGES_CHOICES: Final = ("0", "1", "2", "3", MAX_CHANGES_ANY)
DEFAULT_MIN_TRANSFER_MINUTES: Final = 2
MAX_MIN_TRANSFER_MINUTES: Final = 15
WEEKDAYS: Final = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")

# Transport modes a route may exclude: stored name -> EFA `motType` code
# (the `code` field on a leg's `mode`, and the `exclMOT_<code>` request
# parameter). Names rather than codes are stored so entry data reads on its
# own. Only the modes that actually run inside Vienna are offered.
EXCLUDABLE_MEANS: Final[dict[str, str]] = {
    "train": "0",
    "sbahn": "1",
    "metro": "2",
    "tram": "4",
    "bus": "5",
}

ROUTING_BASE_URL: Final = "https://www.wienerlinien.at/ogd_routing"
ROUTING_TRIP_ENDPOINT: Final = "/XML_TRIP_REQUEST2"
# --- Upstream capabilities, measured 2026-09-14 -------------------
#   XML_TRIP_REQUEST2 (outputFormat=JSON), Floridsdorf -> Meidling, 3 trips.
#   Compression: honoured (gzip). 85144 B identity -> 10698 B wire (8.0x).
#   Conditional GET: impossible -- no ETag, no Last-Modified, and the
#   response says `Cache-Control: no-cache`. Served by the VOR EFA backend
#   (`serverID` VOR-OGD02-PR), not the `ogd_realtime` backend /monitor uses,
#   so it gets its own cooldown slot (see rate_limit.py). No published
#   rate limit; no API key. Re-probe with api-polling/scripts/probe_endpoint.py
#   before changing any of this.
# ----------------------------------------------------------------
# How many connections to ask for. The Pareto filter in routing.py drops the
# dominated ones, so asking for a few more than the card shows is what gives
# the filter something to choose between.
ROUTING_TRIPS_REQUESTED: Final = 5
ROUTING_REQUEST_TIMEOUT_SECONDS: Final = 20

# Route poll cadence. A trip query costs the upstream a full routing run
# (~250 ms server-side, measured) rather than a table lookup, and a
# connection plan changes on the scale of minutes, so this is deliberately
# far slower than the departure board. The coordinator additionally pulls
# the next refresh forward to just after the best connection departs, so
# the list rolls on without the default having to be fast.
DEFAULT_ROUTE_SCAN_INTERVAL: Final = 300  # seconds
MIN_ROUTE_POLL_SECONDS: Final = 120
MAX_ROUTE_POLL_SECONDS: Final = 1800
# Never schedule the "departure just passed" refresh sooner than this.
MIN_ROUTE_ROLLOVER_SECONDS: Final = 60

# Planned S-Bahn departures on a departure board (timetable.py), from the
# same routing server's departure monitor.
# --- Upstream capabilities, measured 2026-09-15 -------------------
#   XML_DM_REQUEST (outputFormat=JSON), Praterstern, S-Bahn only, 12 rows:
#   20 KB identity, ~0.2-0.4 s. Same backend and caching story as the trip
#   request above: no ETag, no Last-Modified, `Cache-Control: no-cache`.
#   No realtime (`realtime: "0"` on every row). The only trains in the data
#   are S-Bahn (no REX / R / CJX at Meidling, Hauptbahnhof or Floridsdorf).
#   Wien Mitte, Rennweg and Quartier Belvedere answer empty: ÖBB closed the
#   Stammstrecke between Praterstern and Hauptbahnhof from 2026-09-07 to the
#   end of October 2027 (wien.gv.at/verkehr/sperre-stammstrecke), and the
#   timetable reflects it. Timetable period in the answer: 2025-12-14 to
#   2026-12-12.
# ----------------------------------------------------------------
ROUTING_DEPARTURE_ENDPOINT: Final = "/XML_DM_REQUEST"
# Rows per board refresh. At Handelskai, the busiest S-Bahn stop on the
# boards, 30 trains reach about 75 minutes ahead.
TIMETABLE_DEPARTURES_REQUESTED: Final = 30
# Rows the line picker asks for, enough to see every line and direction
# at a stop even where some run only every 30 minutes.
TIMETABLE_PICKER_DEPARTURES: Final = 100
# A board's planned rows are refetched when this old…
# Two hours, not 30 minutes: the running-low rule below already refetches
# a busy stop about once an hour, so the age only has to catch a replacement
# timetable published within the day. At 30 minutes it made 48 requests a
# day per stop at ~280 KB each before gzip (measured 2026-09-15, Meidling).
TIMETABLE_MAX_AGE: Final = timedelta(hours=2)
# …or when fewer than this many are still ahead, but never sooner than
# TIMETABLE_RETRY_AFTER after the last attempt.
TIMETABLE_MIN_UPCOMING: Final = 6
# After a failure the spacing doubles with each further failure (5, 10, 20,
# then BACKOFF_CAP_SECONDS) with +/-10% jitter, and resets on the next
# answer. A fixed 5 min kept a routing outage at 12 requests an hour per
# S-Bahn stop for as long as it lasted. The board keeps counting down the
# rows it has meanwhile, so a slower retry costs nothing visible.
TIMETABLE_RETRY_AFTER: Final = timedelta(minutes=5)

# The timetable server speaks Vienna wall-clock time with no offset, no
# matter which zone Home Assistant itself is configured in.
ROUTING_TIME_ZONE: Final = "Europe/Vienna"

# Which S-Bahn lines call at which stop, for the transfer chips on the
# stops-ahead trails (s_bahn_network.py). Wiener Linien's trip patterns don't
# know the S-Bahn, and the routing server has no working per-line stop list
# (`XML_STOPSEQCOORD_REQUEST` answers with an empty `stopSeq`, probed
# 2026-09-15). What it does have: every train in a departure-monitor answer
# with `includeCompleteStopSeq` carries the stops it called at before
# (`prevStopSeq`) and after (`onwardStopSeq`), under the same DIVAs the
# catalogue uses (Floridsdorf 60200334, Handelskai 60201705, and the
# Hauptbahnhof S-Bahn platforms under the station's own 60201349). So a few
# hubs' departures map the whole network.
# --- Upstream capabilities, measured 2026-09-15 -------------------
#   XML_DM_REQUEST, S-Bahn only, 40 rows with stop sequences, 10:00 sample:
#   Praterstern 28 KB wire / 277 KB identity, Meidling 43 / 329,
#   Handelskai 36 / 303, Hütteldorf 34 / 326, Hauptbahnhof 52 / 397,
#   Heiligenstadt 42 / 349, Flughafen Wien 13 KB wire. ~250 KB a week.
#   `itdDate` / `itdTime` are honoured: the 40 rows start at the asked time.
#   Together the seven hubs saw S1 S2 S3 S4 S7 S40 S45 S50 S60 S80 at 43
#   stops in Vienna. The airport hub is not optional: with the Stammstrecke
#   closed (see ROUTING_DEPARTURE_ENDPOINT) the S7 runs Flughafen - St. Marx
#   on its own, and no other hub's trains call at that section.
# ----------------------------------------------------------------
S_BAHN_NETWORK_HUBS: Final[tuple[int, ...]] = (
    60201040,  # Praterstern
    60201015,  # Meidling
    60201705,  # Handelskai
    60200560,  # Hütteldorf
    60201349,  # Hauptbahnhof
    60200491,  # Heiligenstadt
    60204708,  # Flughafen Wien
)
# Rows per hub. At Praterstern 40 trains span 10:08 to 14:56, which reaches
# every line there including the half-hourly ones.
S_BAHN_NETWORK_DEPARTURES: Final = 40
# Every hub is sampled at this Vienna wall-clock time on the next day, not
# at whatever hour the refresh happens to run: a sample taken at 02:00 would
# see the night gap and map half the network.
S_BAHN_NETWORK_SAMPLE_HOUR: Final = 10
# A hub's sample is refetched once it is this old. Lines only change with a
# timetable change or a long closure, which a week covers.
S_BAHN_NETWORK_MAX_AGE: Final = timedelta(days=7)
# How often the domain checks for stale hubs. The check costs nothing when
# every hub is fresh; it is what retries a failed hub a day later instead of
# a week later.
S_BAHN_NETWORK_CHECK_INTERVAL: Final = timedelta(hours=24)

# S-Bahn line colours. Wiener Linien's GTFS `routes.txt` only carries its own
# lines, so an S-Bahn leg on a route would otherwise get the neutral fallback.
#
# The official line logos (Wikimedia Commons "S1 Wien.svg", "S45 Wien.svg")
# are white on #159DD9 and white on #BBD976. At chip size neither meets WCAG
# AA 1.4.3 (4.5:1): 3.06:1 and 1.58:1. So both keep their hue, darkened
# until white text clears AA, and every S-Bahn chip keeps white text like
# the signage (Roland, 2026-09-15):
#   * S-Bahn: #107AA8, 4.80:1, APCA Lc -78.
#   * S45: #566F1F, 5.69:1, APCA Lc -84. Darker than white alone needs
#     (#607B22 was 4.82:1) so the flap card's cream tile text (#F3EACD)
#     clears AA on it too, at 4.73:1. Dark text on the light green
#     (10.33:1) was tried and rejected for making the S45 the only chip
#     with dark text.
# Black on the blue was rejected although WCAG 2 passes it (6.97:1): APCA
# rates it below white (Lc 47 vs 62), and it reads that way. test_route.py
# checks every colour stays at 4.5:1 or above.
S_BAHN_DEFAULT_COLOR: Final = "107AA8"
S_BAHN_COLORS: Final[dict[str, str]] = {"S45": "566F1F"}
S_BAHN_TEXT_COLOR: Final = "FFFFFF"

# Response attribution (CC-BY mandated)
ATTRIBUTION: Final = "Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0"

# Error code 316 = rate limit exceeded — observed empirically from the
# OGD real-time endpoint when the conventional 15-second minimum
# interval is breached (the public dataset page does not currently
# publish the exact threshold, but 316 is what the API returns).
ERR_RATE_LIMIT: Final = 316

# Translation key for the 316 raise. Named here rather than inlined at the
# raise site because the batch group's backoff has to recognise a rate-limit
# failure to widen on the first one (see `MonitorBatchGroup._note_failure`),
# and a bare string compared against a bare string is a silent drift risk.
RATE_LIMIT_TRANSLATION_KEY: Final = "api_rate_limited"

# The remaining documented `messageCode` values (Schnittstellendokumentation
# V1.5, 21.05.2026, §3.1.4). Each gets its own translated message, because
# they ask different things of whoever reads the log: 311 clears itself,
# 322 is an empty answer, 320/321 mean the integration built a bad request,
# and 312 means the stop is gone.
#
# 312 is included for completeness but is not reachable through this
# integration today: it is raised for the `diva` request parameter, and both
# request sites send `stopId`. Measured against the live API — an unknown
# `stopId` comes back `messageCode: 1` with zero monitors, and in a batch the
# other stops still return their data. Kept mapped so the day a `diva` call
# is added (or the API starts applying 312 to `stopId`) the message is
# already right rather than a bare code.
ERR_DB_UNAVAILABLE: Final = 311
ERR_STOP_UNKNOWN: Final = 312
ERR_PARAM_INVALID: Final = 320
ERR_PARAM_MISSING: Final = 321
ERR_NO_DATA: Final = 322

# messageCode -> `exceptions.<key>` in strings.json. Codes absent here fall
# back to `api_upstream_error`, which prints the raw code and value.
UPSTREAM_ERROR_KEYS: Final[dict[int, str]] = {
    ERR_DB_UNAVAILABLE: "api_db_unavailable",
    ERR_STOP_UNKNOWN: "api_stop_unknown",
    ERR_PARAM_INVALID: "api_request_rejected",
    ERR_PARAM_MISSING: "api_request_rejected",
    ERR_NO_DATA: "api_no_data",
}

# MeansOfTransport values → rough categorisation for UI icons. Mirrored in
# src/utils/mot.ts; test_line_type_constants_match_python_and_ts pins these
# five names against it by name — a sixth constant added to one side only
# would pass.
LINE_TYPE_METRO: Final = "ptMetro"
LINE_TYPE_TRAM: Final = "ptTram"
LINE_TYPE_BUS_DAY: Final = "ptBusCity"
LINE_TYPE_BUS_NIGHT: Final = "ptBusNight"
# Not a `/monitor` type: the S-Bahn rows timetable.py adds to a board.
LINE_TYPE_S_BAHN: Final = "ptTrainS"

# Direction codes from the /monitor feed. "H" = Hinfahrt (outbound),
# "R" = Rückfahrt (return). Used as keys in CONF_LINES ("U1|H").
Direction = Literal["H", "R"]

# Lovelace cards — this integration ships FOUR (modern, retro, flap, route).
# Each JS file carries a `const CARD_VERSION` that must match the
# corresponding Python constant below byte-for-byte, else the reload
# banner loops. All four version in lockstep with the integration
# (mirrored in src/const.ts; tests/test_card_version.py checks each
# constant here AND each literal there against manifest.json). Each card
# still ships an independent WS probe so a mismatch on one bundle doesn't
# show a banner on the others.
CARD_VERSION: Final = INTEGRATION_VERSION
CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-card.js"
CARD_FILENAME: Final = "wiener-linien-austria-card.js"
RETRO_CARD_VERSION: Final = INTEGRATION_VERSION
RETRO_CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-retro-card.js"
RETRO_CARD_FILENAME: Final = "wiener-linien-austria-retro-card.js"
FLAP_CARD_VERSION: Final = INTEGRATION_VERSION
FLAP_CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-flap-card.js"
FLAP_CARD_FILENAME: Final = "wiener-linien-austria-flap-card.js"
# Fourth card (experimental): an A→B connection, fed by a route entry's
# `sensor.<route>_next_connection`, or planned on demand between two stops
# over the `wiener_linien_austria/plan` WebSocket command when no entity is
# set. Same lockstep versioning as the others.
ROUTE_CARD_VERSION: Final = INTEGRATION_VERSION
ROUTE_CARD_URL: Final = "/wiener-linien-austria/wiener-linien-austria-route-card.js"
ROUTE_CARD_FILENAME: Final = "wiener-linien-austria-route-card.js"

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
# `_unrecorded_attributes`, so the 16 KB attribute cap does not apply. What
# this bounds is
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

# How many polling intervals the board may go unrefreshed before
# `binary_sensor.<stop>_stale` reports a problem. Three: two consecutive
# missed polls plus slack. One missed poll is routine — a 5xx, a rate
# limit, a domain-cooldown collision — and absorbing exactly that is why
# the stop sensor's `available` override exists in the first place. A
# multiplier rather than a constant because the cadence is per entry
# (MIN_POLL_SECONDS 30 .. MAX_POLL_SECONDS 600).
STALE_INTERVAL_MULTIPLIER: Final = 3

# Hard safety cap on `stops_ahead` length per departure. The longest Wiener
# Linien lines are ~25 stops end-to-end; 30 gives generous headroom while
# still protecting against runaway data on a future schema surprise.
MAX_STOPS_AHEAD: Final = 30
