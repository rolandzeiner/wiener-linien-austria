# Wiener Linien Austria

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.1-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/github/v/release/rolandzeiner/wiener-linien-austria?label=version&color=blue)](https://github.com/rolandzeiner/wiener-linien-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)
[![Live demo](https://img.shields.io/badge/live-demo-2196F3.svg)](https://demo.rolandzeiner.at/#wien)

Vienna public transport departures for Home Assistant. Type a stop name, pick the lines you care about — done. Uses the official [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data): no API key, no YAML, no RBL lookups.

## Supported Functions

- **Live departures** for any U-Bahn, Straßenbahn, Autobus or Nightline stop. One sensor per stop; state is the next-departure countdown, attributes carry the full board.
- **Three Lovelace cards** — modern board, retro LED panel, Solari split-flap. See [Lovelace Cards](#lovelace-cards).
- **Service + elevator alerts** filtered to your tracked lines and stop, surfaced as `traffic_info` / `elevator_info` attributes and rendered inline by every card.
- **Stops-ahead trail** — expand any departure on the modern card into a metro-style trail showing every upcoming stop on that trip with transfer-line chips.
- **Multi-step setup** — search → pick stop → pick lines, with a live `/monitor` probe so the picker only lists lines actually serving the stop.
- **Reconfigure** to add or remove lines without losing the entry; **Configure** to change the polling interval.

## Screenshots

<table>
  <tr>
    <td align="center" valign="top">
      <img src="screenshots/card-2.webp" width="264" alt="Lovelace card (retro LED)" />
      <br/>
      <img src="screenshots/card.webp" height="320" alt="Lovelace card (modern)" />
    </td>
    <td align="center"><img src="screenshots/card-config.webp" height="320" alt="Card editor" /></td>
    <td align="center"><img src="screenshots/config-flow.webp" height="320" alt="Config flow" /></td>
  </tr>
  <tr>
    <td align="center"><em>Lovelace cards (Retro · Modern)</em></td>
    <td align="center"><em>Card editor</em></td>
    <td align="center"><em>Config flow</em></td>
  </tr>
</table>

## Requirements

- Home Assistant **2025.1** or newer
- Outbound HTTPS to `wienerlinien.at`
- No API key (Wiener Linien OGD has been key-free since 2019)

## Installation

### HACS (recommended)

1. HACS → **Integrations** → ⋯ → **Custom repositories**
2. Add `https://github.com/rolandzeiner/wiener-linien-austria`, category **Integration**
3. Search for "Wiener Linien Austria" and install
4. Restart Home Assistant

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rolandzeiner&repository=wiener-linien-austria&category=integration)

### Manual

Copy `custom_components/wiener_linien_austria/` into your HA `config/custom_components/` and restart.

## Setup

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=wiener_linien_austria)

1. **Settings → Devices & Services → + Add Integration**, search **Wiener Linien Austria**.
2. Type part of a stop name (e.g. `Stephans`) and submit. Search is case-insensitive; umlauts matter.
3. Pick the matching stop from the dropdown.
4. Pick the lines to track. Off-service lines (nightlines during the day, day-only lines after midnight) stay selectable — the picker merges live `/monitor` data with the static catalogue.
5. Set a polling interval (default 60 s, range 30–600 s) and save.

Tracked lines change via **Reconfigure**; polling interval via **Configure**.

## Lovelace Cards

Three cards ship with the integration. All three auto-register as Lovelace resources, discover Wiener Linien sensors by attribute fingerprint (no entity-name prefix required), and version independently with a WebSocket handshake — a reload banner appears if your browser is on stale JS. Hard-refresh (⌘⇧R / Ctrl⇧R) after upgrading.

| Card | Best for | Stops | Style |
|---|---|---|---|
| **Modern** | Everyday dashboard, full feature set | Multi-stop | Themed HA card |
| **Retro** | Wall-tablet kiosks, entryway displays | Single stop / direction | Wiener Linien LED platform sign |
| **Flap** | Decorative boards, signage walls | Multi-stop | Solari split-flap mechanical board |

### Modern card — `wiener-linien-austria-card`

The everyday departure board. Add via Dashboard → **Add card** → "Wiener Linien Austria".

Visual editor:
- **Stops** — multi-select picker. Each stop carries its own line list (drawn from what you tracked in the integration's config flow), direction filter (H / R / both, also per-line), and per-line walking time in minutes (departures leaving before you can reach the platform are hidden).
- **Line colours** — per-line override pills; defaults come from the GTFS `routes.txt` palette the integration ships as a sensor attribute.
- **Display** — multi-stop layout (*stacked* / *tabs*), departures-per-stop slider (0–20), and toggles for hero countdown, departure list, stops-ahead trail, QR map button, platform pill, step-free icon, accessibility-only filter, vehicle-type icon, disruption banner, elevator badge, delay text, header, and attribution.

Each station section auto-tints to the next-departure line colour. Rows show a colour-coded line badge, destination with optional inline delay text, optional traffic-jam / step-free icons, and a countdown (`N min` or `jetzt`). Stop titles link to the official [Vienna city map](https://stadtplan.wien.gv.at) pinned by coordinates, with OpenStreetMap as fallback; an optional QR button encodes a `geo:` URI for phone scanners. Empty boards render `Betriebsschluss` / `End of service`.

**Stops-ahead trail.** Click any row (or the hero block) to expand a metro-map trail beneath: vertical line in the operating line's brand colour, dot per stop, hollow ring at the terminus. Each station carries inline transfer chips for U-Bahn lines; tram, bus, and nightlines fold behind a `+N` toggle. Nightlines get promoted to inline during night service hours (~23:55–05:15). Panels survive realtime polls (keyed by scheduled time, not the live countdown).

Disruption and elevator entries render as collapsible rows above the stop list.

### Retro card — `wiener-linien-austria-retro-card`

A focused single-stop, single-direction LED-display card mimicking real Wiener Linien platform signs.

- Next 2 departures; amber glyphs in **WL Mono** (a subsetted TeX Gyre Cursor face bundled with the integration — no external font fetch).
- Three style variants: *classic* (amber-on-violet), *warm* (deeper amber on brown), *pixel* (screen-door overlay).
- Amber **GLEIS** / **STEIG** panel when the API reports a platform.
- Optional **station header strip** modelled on real WL U-Bahn signage — per side: exit icon, sign text, WC / escalator / elevator amenity tiles, up to 3 free-form `mdi:*` icons, up to 6 short text labels. Rendered in **WL Sans Condensed**; exit arrows auto-flip to point outward.
- Wheelchair glyph on step-free departures; alternating asterisks when a train is at the platform.
- Three size variants (small / medium / regular); defaults to a full 12-column row in HA section view.
- Station-name tile picks up the **configured line's** signage palette (nightline blue + yellow for N-prefix lines; GTFS palette otherwise) so a nightline retro card renders in nightline colours at noon.
- Optional **wheelchair race** — when ≥ 2 departures are barrier-free, runs a "3, 2, 1" countdown and a trophy finish overlay. Tap to trigger immediately. Gated by `prefers-reduced-motion`.
- Optional **scrolling message** — custom text scrolls across the LED panel every 5 min, then hands back to live departures. Up to 160 characters. Tap to skip; gated by `prefers-reduced-motion`.

Designed for wall-tablet kiosks and entryway displays.

### Flap card — `wiener-linien-austria-flap-card`

A Solari-style split-flap board, modelled on the Italian mechanical displays that dominated European stations and airports from the 1960s to the 1990s. Each character lands as a warm-cream flap on a dark housing — tiles cycle one step per ~130 ms toward the target letter until they settle, mimicking the cascading rattle of the real boards.

- **Multi-stop merge.** Configure up to 8 stops; departures merge and sort by countdown across the whole board. Per-stop filters for direction, lines, and walking time.
- Up to **8 rows**, each with a per-row GLEIS / STEIG tile in its own column so the platform numbers line up across rows regardless of width.
- **Station header strip** — same per-side grammar as the retro card (exit icon, sign text, amenities, MDI icons, labels) recoloured for the cream / dark housing.
- **Accessibility column** — a blue ISA-style wheelchair tile on step-free departures, blank cream tile otherwise. Column stays the same width regardless.
- **Light / dark palette** follows the active HA theme (`hass.themes.darkMode`) — not the OS — so a light HA theme on a dark OS still renders the light board.
- **Reduced motion** swaps the rotation for a 60 ms cross-fade per WCAG 2.3.3.

Add via Dashboard → **Add card** → "Wiener Linien Austria — Flap Board".

## Sensor Attributes

Every `sensor.{stop}_abfahrten` entity carries:

| Attribute | Type | Notes |
|---|---|---|
| `state` (native value) | int \| None | Next-departure countdown in minutes. `None` at end of service. |
| `attribution` | string | `Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0` |
| `diva` | int | Station identifier (e.g. `60201012` for Stephansplatz). |
| `stop_name` | string | Human-readable station name. |
| `latitude` / `longitude` | float \| None | Station coordinates from the static catalogue. |
| `server_time` | ISO string \| None | `serverTime` from the last successful fetch. |
| `departures` | list[dict] | See [Departure shape](#departure-shape) below. Capped at 20 entries, sorted by countdown. |
| `next_by_line` | dict[str, int] | Per-line map to the earliest countdown — e.g. `{"U1": 2, "U4": 6}`. |
| `lines_at_stop` | list[str] | Every line serving this DIVA per the static schedule, regardless of live status. Populated once the trip-pattern catalogue has loaded. |
| `tracked_lines` | list[str] | Lines tracked in this entry. Card editors filter their pickers to this set. |
| `tracked_line_keys` | list[str] | Raw `{line}\|{direction}` keys used by the retro card editor to filter by direction. |
| `traffic_info` | list[dict] | Service disruptions matching tracked lines. Fields: `name`, `title`, `description`, `description_html`, `related_lines`, `line_types`, `location`, `time_start`, `time_end`, `time_created`, `time_last_update`, `status`. |
| `elevator_info` | list[dict] | Elevator outages matching the stop's RBLs. Fields: `name`, `station`, `description`, `reason`, `status`, `related_lines`, `related_stops`, `time_start`, `time_end`. |

The 20-departure cap keeps busy multi-line stops under HA's 16 KB recorder attribute limit even when each row carries the full `stops_ahead` trail. The card's `max_departures` slider tops out at 20, so nothing displayed is clipped.

### Departure shape

Each entry in `departures` is a dict with: `line`, `towards`, `direction` (`"H"` / `"R"`), `type` (`ptMetro` / `ptTram` / `ptBusCity` / `ptBusNight`), `countdown`, `time_planned` (ISO), `time_real` (ISO), `realtime` (bool), `barrier_free` (bool), `traffic_jam` (bool), `platform` (e.g. `"1"`), and — when the static schedule resolves a matching trip — `stops_ahead`, an ordered list of `{name, is_terminus?, lines?}` down to the terminus. `lines` carries the *other* lines passing through each stop, used by the card to render transfer chips.

## Data Updates

Four OGD endpoints, on different cadences:

| What | Endpoint | Cadence |
|---|---|---|
| Live departures per stop | `/monitor?stopId=…` | Per-entry, default 60 s (30–600 s) |
| Traffic + elevator alerts | `/trafficInfoList` (×2) | Domain-wide, 5 min — shared across all entries |
| Static stop catalogue | `wienerlinien-ogd-haltestellen.csv` + `-haltepunkte.csv` | Weekly, cached to HA storage |
| Line catalogue + trip patterns | `wienerlinien-ogd-linien.csv` + `-fahrwegverlaeufe.csv` | Weekly, cached — powers the stops-ahead trail |

All outbound calls share a **15 s domain-wide cooldown** plus a 30 s per-entry floor — well below the conventional 15-second minimum circulated for the OGD real-time endpoint. Every request sends `Accept-Encoding: gzip` and conditional-GET validators (`If-None-Match` / `If-Modified-Since`) so unchanged ticks return `304 Not Modified` and reuse the cached payload, halving steady-state bandwidth. An identifying User-Agent (`HomeAssistant/{ver} wiener_linien_austria/{ver}`) goes on every request so Wiener Linien can traffic-shape this integration specifically.

> **After a Home Assistant restart**: the alert feeds (`traffic_info` / `elevator_info`) refresh on a 5-min cadence, so they may be empty for up to 5 min before the first refresh lands. Departures fetch immediately on the per-entry cadence.

**Failure handling.** A single failed poll keeps the user-configured cadence and serves the last successful board (templates can detect staleness via `server_time`). From the second consecutive failure, the interval doubles each tick, capped at 30 min, until a successful fetch resets it. If the API responds with rate-limit error 316, a Repairs issue is raised and cleared automatically when the API recovers. Only a never-successful integration stays unavailable.

## Use Cases

- **Leave-now notifications** — "if the next U1 toward Leopoldau is under 3 min, notify me".
- **Dashboard departure board** — one of the bundled cards, or your own attribute-driven card.
- **Line-triggered automations** — turn on the entrance light when the tram is approaching.
- **Travel-time comparison** — track two stops and pick whichever has the sooner departure.

## Automation Examples

Notify when the next train is close:

```yaml
alias: "Train coming — leave now"
trigger:
  - platform: numeric_state
    entity_id: sensor.stephansplatz_abfahrten
    below: 3
action:
  - service: notify.mobile_app_phone
    data:
      title: "Next departure at Stephansplatz"
      message: >
        {% set next = state_attr('sensor.stephansplatz_abfahrten', 'departures')[0] %}
        {{ next.line }} → {{ next.towards }} in {{ next.countdown }} min
```

Template sensor for the next U1 to Leopoldau only:

```yaml
template:
  - sensor:
      - name: "Next U1 Leopoldau"
        state: >
          {% set board = state_attr('sensor.stephansplatz_abfahrten', 'departures') or [] %}
          {% set matches = board
               | selectattr('line', 'eq', 'U1')
               | selectattr('towards', 'eq', 'Leopoldau') | list %}
          {{ matches[0].countdown if matches else 'none' }}
        unit_of_measurement: min
```

## Troubleshooting

**"Cannot reach the Wiener Linien real-time API" during setup.** The integration probes `/monitor` with the chosen stop's RBLs before saving. The API is temporarily down or outbound HTTPS from your HA host is blocked. Retry in a minute.

**"No stops match this search".** Try shorter or partial names (`Karls` matches Karlsplatz, Karlskirche, …). Case-insensitive; umlauts matter.

**Repairs issue "Wiener Linien rate limit hit".** Usually means many HA instances behind the same outbound IP share the OGD allowance. Raise the scan interval, reduce concurrent entries, or ignore — the integration recovers automatically.

**Bug reports.** Settings → Devices & Services → Wiener Linien Austria → ⋯ → **Download diagnostics**. The JSON includes attribution, RBL list, last error code, and coordinator timing. No personal data.

**Debug logs:**

```yaml
# configuration.yaml
logger:
  default: info
  logs:
    custom_components.wiener_linien_austria: debug
```

## Known Limitations

- **Vienna only.** ÖBB, VOR, and regional services are out of scope.
- **No journey planning.** The OGD monitor returns departures at a stop; routing is not provided.
- **Static catalogue refreshes weekly.** Brand-new stops may take up to a week to appear in search.
- **Stops-ahead is best-effort.** Short-turn services may show the full scheduled path. Replacement bus (SEV) and unscheduled detours produce no panel — the row stays as today, no chevron.

## Removal

1. **Settings → Devices & Services** → Wiener Linien Austria → ⋯ → **Delete**.
2. Remove `custom_components/wiener_linien_austria/` from HA config (manual installs only; HACS handles it).

## Attribution

All live data is © Wiener Linien and published under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. The integration surfaces this on every sensor (`attribution` attribute) and in every diagnostics download:

> Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0

If you build a Lovelace card or other user-facing UI on top of this integration, please keep the attribution visible.

## License

MIT — see [LICENSE](LICENSE). Integration code is MIT; the Wiener Linien data flowing through it is CC BY 4.0.

**Bundled webfonts** (`custom_components/wiener_linien_austria/www/fonts/`) — `WL Sans`, `WL Sans Condensed`, and `WL Mono` are subsetted derivatives of the [TeX Gyre](https://www.gust.org.pl/projects/e-foundry/tex-gyre) family (Heros / Heros Cn / Cursor) by Bogusław Jackowski and Janusz M. Nowacki on behalf of GUST. The fonts ship under the [GUST Font License](custom_components/wiener_linien_austria/www/fonts/GUST-FONT-LICENSE.txt) (LPPL 1.3c+) and were renamed per the GFL's request that derivatives use new names. See [`www/fonts/NOTICE.md`](custom_components/wiener_linien_austria/www/fonts/NOTICE.md) for provenance, the exact subset, and reproduction steps.

## Disclaimer

This integration is not affiliated with or endorsed by Wiener Linien GmbH & Co KG. All departure and stop data is provided by the [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data) under the Creative Commons Attribution (CC BY 4.0) license. The developer assumes no liability for the accuracy, completeness, or timeliness of the displayed departures, including delays, cancellations, or disruptions. Use at your own risk.

---

Diese Integration steht in keiner Verbindung zur Wiener Linien GmbH & Co KG und wird von dieser nicht unterstützt. Alle Abfahrts- und Haltestellendaten stammen von der [Wiener Linien OGD Echtzeit-API](https://www.wienerlinien.at/open-data) und werden unter der Creative-Commons-Lizenz Namensnennung 4.0 (CC BY 4.0) veröffentlicht. Für die Richtigkeit, Vollständigkeit und Aktualität der angezeigten Abfahrten — einschließlich Verspätungen, Ausfällen oder Störungen — wird keine Haftung übernommen. Nutzung auf eigene Verantwortung.
