# Wiener Linien Austria

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.1-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/rolandzeiner/wiener-linien-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)

Home Assistant integration for Vienna public transport departures. Uses the official [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data) — no API key, no YAML editing, no manual RBL lookups.

Type a stop name, pick it from a list, choose which lines to track. Done.

## Supported Functions

- Real-time departures for any Wiener Linien stop (U-Bahn, Straßenbahn, Autobus, Nightline). One sensor per configured stop; state is the next-departure countdown, attributes carry the full board (see [Sensor Attributes](#sensor-attributes)).
- Multi-step config flow (search → pick stop → pick lines) with a live `/monitor` probe so you only see lines actually serving the stop.
- Reconfigure flow to add/remove lines without losing the entry; options flow to change the polling interval.
- **Service disruption alerts** (`trafficInfoList`) and **elevator outage alerts** (`Aufzugsinfo`) filtered to your tracked lines and stop RBLs — surfaced as `traffic_info` / `elevator_info` sensor attributes and rendered inline by both bundled cards.
- **Two bundled Lovelace cards** — modern full-feature board + retro LED-display style. Both auto-register as Lovelace resources.

## Screenshots

<table>
  <tr>
    <td align="center"><img src="screenshots/card.webp" height="320" alt="Lovelace card" /></td>
    <td align="center"><img src="screenshots/card-config.webp" height="320" alt="Card editor" /></td>
    <td align="center"><img src="screenshots/config-flow.webp" height="320" alt="Config flow" /></td>
  </tr>
  <tr>
    <td align="center"><em>Lovelace card</em></td>
    <td align="center"><em>Card editor</em></td>
    <td align="center"><em>Config flow</em></td>
  </tr>
</table>

## Requirements

- Home Assistant **2025.1** or newer.
- **No API key** needed — the Wiener Linien OGD service is key-free since 2019.
- Outbound HTTPS access to `wienerlinien.at`.

## Installation

### HACS (recommended)

1. HACS → **Integrations** → ⋯ → **Custom repositories**.
2. Add `https://github.com/rolandzeiner/wiener-linien-austria` as type **Integration**.
3. Search for "Wiener Linien Austria" and install.
4. Restart Home Assistant.

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rolandzeiner&repository=wiener-linien-austria&category=integration)

### Manual

1. Copy `custom_components/wiener_linien_austria/` into your HA `config/custom_components/`.
2. Restart Home Assistant.

## Setup

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=wiener_linien_austria)

1. **Settings → Devices & Services → + Add Integration**, search **Wiener Linien Austria**.
2. Type part of a stop name (e.g. `Stephans`) and submit.
3. Pick the matching stop from the dropdown.
4. The integration calls `/monitor` live and lists every line currently serving that stop. Pick the one or two you want to track — busy stops list 20+ lines.
5. Set a polling interval (default 60 s, min 30 s, max 600 s) and save.

Change tracked lines later via **Reconfigure**; change polling interval via **Configure** (options).

## Lovelace Cards

Two custom cards ship with the integration. Both register themselves as Lovelace resources automatically and discover Wiener Linien sensors by attribute fingerprint (no entity-name prefix required). Hard-refresh the browser (⌘⇧R / Ctrl⇧R) after upgrading to pick up new JS.

Each card is served under a versioned URL (`/wiener-linien-austria/*-card.js?v=X.Y.Z`). A WebSocket version check warns users with a reload banner if old JS is cached. The two cards version independently.

### Modern card — `wiener-linien-austria-card`

The everyday departure board. Dashboard → Add card → "Wiener Linien Austria" (under *Custom*).

Visual editor covers:
- **Stops** — multi-select chip picker. For each stop, a second row picks lines, direction (H / R / both, also per-line for mixed routing like "U1 toward city, U3 toward home"), and per-line **walking time** in minutes (departures leaving before you can reach the platform are hidden; inclusive, so you can run for the last minute).
- **Line colours** — pill swatch picker. Wiener Linien metro CI defaults are built in; tram/bus fall back to the theme primary until overridden.
- **Display** — multi-stop layout (*stacked* or *tabs*), departures-per-stop slider (1–20), and toggles for hero countdown, departure list, step-free icon, disruption banner, elevator badge, delay text, vehicle-type icon, and "hide attribution" (the sensor attribute keeps the CC-BY string regardless).

Each station section auto-tints to the next-departure's line colour and picks an icon for that vehicle type. Departure rows show a colour-coded line badge, destination + optional inline delay ("3 Minuten verspätet" when `time_real` lags `time_planned` by ≥ 1 min), optional traffic-jam and step-free icons, and a countdown cell (`N min` or `jetzt`). Stop titles link to Google Maps pinned by `latitude` / `longitude` (short names like "Ottakring" otherwise resolve to the district centroid). Empty boards render "Betriebsschluss" / "End of service".

Disruption and elevator entries render as collapsible rows above the stop list — always-visible summary, click to expand details + timestamps.

### Retro card — `wiener-linien-austria-retro-card`

A focused single-stop, single-direction LED-display card mimicking real Wiener Linien platform signs. Dashboard → Add card → "Wiener Linien Austria Retro".

- Next 2 departures for one direction; amber `#FFC700` glyphs in a system monospace stack on a violet (classic) or warm-brown LED substrate. No Google-Fonts fetch (GDPR-clean).
- Amber **GLEIS** / **STEIG** panel when the API reports a platform — left-aligned for Gleis "2", right-aligned otherwise, mirroring the real signs.
- Wheelchair glyph after destinations on step-free departures; alternating asterisks blink in place of the countdown when a train is at the platform (`countdown ≤ 0`).
- "Betriebsschluss" / "End of service" rendering when the board is empty; differentiated empty-state hints for wrong direction or filtered-out lines.
- Three size variants (small / medium / regular). Defaults to a full 12-column row in HA section view.
- Editor: stop chip picker, H/R direction toggle, optional single-line filter, size picker, style picker (classic / warm), show-platform toggle, and per-line walking-time inputs.
- Optional **wheelchair race** (toggle in editor) — when ≥ 2 upcoming departures are barrier-free, runs a "3, 2, 1" pre-race countdown and a finish overlay with a trophy badge for the winning lane. Gated by `prefers-reduced-motion`.

Designed for wall-tablet kiosks, entryway displays, and anyone who wants their HA dashboard to feel like an actual station board.

## Sensor Attributes

Every `sensor.{stop}_abfahrten` entity carries:

| Attribute | Type | Example / notes |
|---|---|---|
| `state` (native value) | int \| None | Countdown of the next overall departure, in minutes. `None` at end of service. |
| `attribution` | string | `"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0"` — always present. |
| `diva` | int | Station identifier (e.g. `60201012` for Stephansplatz). |
| `stop_name` | string | Human-readable station name. |
| `latitude` / `longitude` | float \| None | Station coordinates from the static catalogue. |
| `server_time` | ISO string \| None | Wiener Linien `serverTime` from the last successful fetch. |
| `departures` | list[dict] | Capped at 30 entries, sorted by countdown. Each dict: `line`, `towards`, `direction` ("H"/"R"), `type` (`ptMetro`/`ptTram`/`ptBusCity`/`ptBusNight`), `countdown`, `time_planned` (ISO), `time_real` (ISO), `realtime` (bool), `barrier_free` (bool), `traffic_jam` (bool), `platform` (string, e.g. `"1"`). |
| `next_by_line` | dict[str, int] | Per-line map to the earliest countdown. E.g. `{"U1": 2, "U4": 6}`. |
| `traffic_info` | list[dict] | Service disruptions matching the tracked lines. Fields: `name`, `title`, `description`, `description_html`, `related_lines`, `line_types`, `location`, `time_start`, `time_end`, `time_created`, `time_last_update`, `status`. |
| `elevator_info` | list[dict] | Elevator outages matching the stop's RBLs. Fields: `name`, `station`, `description`, `reason`, `status`, `related_lines`, `related_stops`, `time_start`, `time_end`. |

The 30-departure cap keeps busy multi-line stops under HA's 16 KB recorder attribute limit. The card's `max_departures` slider tops out at 20, so nothing displayed is ever clipped.

## Data Updates

Three Wiener Linien OGD endpoints, on different cadences:

| What | Endpoint | Cadence |
|---|---|---|
| Live departures per stop | `/monitor?stopId=…` | Per-entry, default 60 s (min 30 s, max 600 s) |
| Traffic + elevator alerts | `/trafficInfoList` (×2) | Domain-wide, 5 min — shared across all entries |
| Static stop catalogue | `wienerlinien-ogd-haltestellen.csv` + `-haltepunkte.csv` | Weekly, cached to HA storage |

All outbound calls share a **15 s domain-wide cooldown** plus a 30 s per-entry floor — both within Wiener Linien's fair-use policy. Every request sends `Accept-Encoding: gzip` and conditional-GET validators (`If-None-Match` / `If-Modified-Since`) so unchanged ticks return `304 Not Modified` and reuse the previously-parsed payload, halving steady-state bandwidth without changing freshness. An identifying User-Agent (`HomeAssistant/{ver} wiener_linien_austria/{ver}`) goes on every request so Wiener Linien can traffic-shape this integration specifically.

**Failure handling.** A single failed poll keeps the user-configured cadence and serves the last successful board (templates can detect staleness via `server_time`). From the second consecutive failure, the interval doubles each tick, capped at 30 minutes, until the next successful fetch resets it. If the API responds with error code 316 (rate limit), a Repairs issue is raised and cleared automatically when the API recovers. Only a never-successful integration stays unavailable.

## Use Cases

- **Leave-now notifications** — "if the next U1 towards Leopoldau is < 3 min, notify me".
- **Dashboard departure board** — multi-line attribute-driven card shows the next 5 departures per stop.
- **Automations triggered by specific lines** — e.g. turn on the entrance light when the tram arrives.
- **Travel time comparison** — track two stops (home + alternate) and let a template sensor pick whichever has the sooner departure.

## Automation Examples

Notify when the next train is close:

```yaml
alias: "Train coming — leave now"
trigger:
  - platform: numeric_state
    entity_id: sensor.stephansplatz_departures
    below: 3
action:
  - service: notify.mobile_app_phone
    data:
      title: "Next departure at Stephansplatz"
      message: >
        {% set next = state_attr('sensor.stephansplatz_departures', 'departures')[0] %}
        {{ next.line }} → {{ next.towards }} in {{ next.countdown }} min
```

Template sensor for the next U1 to Leopoldau only:

```yaml
template:
  - sensor:
      - name: "Next U1 Leopoldau"
        state: >
          {% set board = state_attr('sensor.stephansplatz_departures', 'departures') or [] %}
          {% set matches = board
               | selectattr('line', 'eq', 'U1')
               | selectattr('towards', 'eq', 'Leopoldau') | list %}
          {{ matches[0].countdown if matches else 'none' }}
        unit_of_measurement: min
```

## Troubleshooting

**"Cannot reach the Wiener Linien real-time API" during setup.** The integration probes `/monitor` with the chosen station's RBLs before saving. If the probe fails, either the API is temporarily down or outbound HTTPS from your HA host is blocked. Retry after a minute.

**"No stops match this search".** Try shorter/partial names (e.g. `Karls` matches Karlsplatz, Karlskirche, …). Search is case-insensitive but umlauts matter.

**A Repairs issue "Wiener Linien rate limit hit" appeared.** The default 60 s interval is well within the fair-use policy, so this typically only happens when many HA instances behind the same outbound IP saturate the shared allowance. Raise the scan interval, reduce concurrent entries, or ignore — the integration recovers automatically.

**Bug reports.** Settings → Devices & Services → Wiener Linien Austria → ⋯ → Download diagnostics. The JSON includes attribution, RBL list, last error code, and coordinator timing. No personal data.

**Debug logs:**

```yaml
# configuration.yaml
logger:
  default: info
  logs:
    custom_components.wiener_linien_austria: debug
```

## Known Limitations

- **Vienna only.** ÖBB / VOR / regional services are out of scope.
- **No journey planning.** The OGD monitor endpoint returns departures at a stop; routing is not provided.
- **Static catalogue refreshes weekly.** Brand-new stops may take up to a week to appear in search.

## Attribution

All live data is © Wiener Linien and published under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. The integration emits this attribution on every sensor (`attribution` attribute) and in every diagnostics download:

> Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0

If you build a Lovelace card or other user-facing UI on top of this integration, please keep the attribution visible.

## Removal

1. **Settings → Devices & Services** → find Wiener Linien Austria → ⋯ → **Delete**.
2. Remove `custom_components/wiener_linien_austria/` from the HA config (manual installs only; HACS removes it automatically).

## License

MIT — see [LICENSE](LICENSE). Integration code is MIT; the Wiener Linien data flowing through it is CC BY 4.0.

## Disclaimer

This integration is not affiliated with or endorsed by Wiener Linien GmbH & Co KG. All departure and stop data is provided by the [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data) and published under the Creative Commons Attribution (CC BY 4.0) license. The developer assumes no liability for the accuracy, completeness, or timeliness of the displayed departures, including delays, cancellations, or disruptions. Use at your own risk.

---

Diese Integration steht in keiner Verbindung zur Wiener Linien GmbH & Co KG und wird von dieser nicht unterstützt. Alle Abfahrts- und Haltestellendaten stammen von der [Wiener Linien OGD Echtzeit-API](https://www.wienerlinien.at/open-data) und werden unter der Creative-Commons-Lizenz Namensnennung 4.0 (CC BY 4.0) veröffentlicht. Für die Richtigkeit, Vollständigkeit und Aktualität der angezeigten Abfahrten — einschließlich Verspätungen, Ausfällen oder Störungen — wird keine Haftung übernommen. Nutzung auf eigene Verantwortung.
