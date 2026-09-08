# Wiener Linien Austria

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.1-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/github/v/release/rolandzeiner/wiener-linien-austria?label=version&color=blue)](https://github.com/rolandzeiner/wiener-linien-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)
[![Live demo](https://img.shields.io/badge/live-demo-2196F3.svg)](https://demo.rolandzeiner.at/#wien)

Vienna public transport departures for Home Assistant. Start typing your stop, choose the lines you care about — done. Uses the official [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data): no API key, no YAML, no RBL lookups.

## Supported Functions

- **Live departures** for any U-Bahn, Straßenbahn, Autobus or Nightline stop. One sensor per stop; the state is the next-departure countdown, attributes carry the full board.
- **Three Lovelace cards** — modern board, retro LED panel, Solari split-flap — each painted in the official line colours from the Wiener Linien GTFS feed. See [Lovelace Cards](#lovelace-cards).
- **Visual card editors** — pick lines as coloured chips, set each stop's direction inline, and build the station header strip by tapping the side you want to fill. Shared across all three cards *(2.0.0)*.
- **Stops-ahead trail** — expand any departure on the modern card into a metro-style trail of every upcoming stop, with transfer-line chips. Air-conditioned vehicles get a snowflake, off by default *(1.8.0)*.
- **Service + elevator alerts** for your tracked lines and stop, surfaced as `traffic_info` / `elevator_info` and rendered inline. Each notice breaks out per line with the reason and expected duration *(1.7.3)*. Stop-display notices — moved boarding points, works detours, closed stops — appear in the same banner, and only for the platforms your card shows *(2.0.0)*.
- **Resilient polling** — stops sharing an interval fetch in one request instead of one each, and a board the upstream feed has frozen is reported as stale rather than as end of service *(1.7.8)*.

## Screenshots

<table>
  <tr>
    <td align="center" valign="top">
      <img src="screenshots/card-2.webp" width="264" alt="Lovelace card (retro LED)" />
      <br/>
      <img src="screenshots/card-3.webp" width="264" alt="Lovelace card (flap board)" />
      <br/>
      <img src="screenshots/card.webp" height="320" alt="Lovelace card (modern)" />
    </td>
    <td align="center"><img src="screenshots/card-config.webp" height="320" alt="Card editor" /></td>
    <td align="center"><img src="screenshots/config-flow.webp" height="320" alt="Config flow" /></td>
  </tr>
  <tr>
    <td align="center"><em>Lovelace cards (Retro · Flap · Modern)</em></td>
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
2. Start typing in **Stop** (e.g. `Stephans`) and pick a suggestion. The list opens on the stops nearest your Home Assistant location, with distances shown. Submit a partial name instead to see every stop that matches.
3. Pick the lines to track. Off-service lines — nightlines during the day, day-only lines after midnight — stay selectable.
4. Set a polling interval (default 60 s, range 30–600 s) and save.

Change tracked lines via **Reconfigure**, the polling interval via **Configure**.

## Lovelace Cards

Three cards ship with the integration. All three register themselves as Lovelace resources and find Wiener Linien sensors automatically — no entity-name prefix needed. Each version-checks itself over WebSocket and shows a reload banner when your browser holds stale JS, so hard-refresh (⌘⇧R / Ctrl⇧R) after upgrading.

| Card | Best for | Stops | Style |
|---|---|---|---|
| **Modern** | Everyday dashboard, full feature set | Multi-stop | Themed HA card |
| **Retro** | Wall-tablet kiosks, entryway displays | Single stop / direction | Wiener Linien LED platform sign |
| **Flap** | Decorative boards, signage walls | Multi-stop | Solari split-flap mechanical board |

### Modern card — `wiener-linien-austria-card`

The everyday departure board. Themed to your HA palette; each stop auto-tints to its next-departure line colour.

- **Multi-stop layout** — stacked or tabbed; up to 20 departures per stop.
- **Hero countdown** — next departure rendered large, full board beneath.
- **Stops-ahead trail** — click any row to expand a metro-map trail down to the terminus, with transfer chips at each station.
- **Per-line walking time** — hides departures you can't reach in time.
- **QR map button** — encodes the stop as a `geo:` URI for phone scanners.
- **Disruption + elevator banners** — collapsible rows above the board.

Add via Dashboard → **Add card** → "Wiener Linien Austria".

### Retro card — `wiener-linien-austria-retro-card`

A focused LED panel, modelled on the amber-on-violet signs hanging from Wiener Linien platforms. The station-name tile picks up the configured line's colour (nightline blue + yellow on N-lines).

- **Three style variants** — *Classic*, *Warm*, *Dot matrix* (screen-door overlay).
- **GLEIS / STEIG panel** — amber platform tile when the API reports one.
- **Signage header strip** — exit icon, sign text, clock, date, WC / escalator / elevator tiles, free-form MDI icons and short labels. Per side.
- **Wheelchair race** — when ≥ 2 departures are step-free, runs a "3, 2, 1" countdown to the trophy finish. Tap to trigger.
- **Scrolling message** — custom text scrolls every 5 min, then hands back to live departures.

Add via Dashboard → **Add card** → "Wiener Linien Austria — Retro".

### Flap card — `wiener-linien-austria-flap-card`

A Solari split-flap board — characters cascade one tile at a time toward the target letter, mimicking the rattle of the mechanical originals from European stations.

- **Multi-stop merge** — add as many stops as you like; the board shows 1–8 rows, sorted by countdown across all of them.
- **Column headers** — *LINIE / RICHTUNG / STUFENLOS / GLEIS / ANKUNFT* above the board. The platform column reads *STEIG* outside the U-Bahn, and drops out when the API reports no platform.
- **Per-row GLEIS / STEIG tile** — own column, aligned across all rows.
- **Station-name band** — tints to the first tracked line by default; the editor also offers any tracked line, plus solid *White* and *Black*.
- **Signage header strip** — same grammar as the retro card, recoloured for the cabinet palette.
- **Compact mode** — hide the line column on single-line boards, or drop the cabinet for a flush mount.

Add via Dashboard → **Add card** → "Wiener Linien Austria — Flap Board".

## Sensor Attributes

Each stop gets one sensor. Home Assistant names it in your interface language, so the entity ID is `sensor.<stop>_departures` on an English install and `sensor.<stop>_abfahrten` on a German one — check **Developer tools → States** if you're unsure which you have.

| Attribute | Type | Notes |
|---|---|---|
| `state` (native value) | int \| None | Next-departure countdown in minutes. `None` at end of service. |
| `attribution` | string | `Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0` |
| `diva` | int | Station identifier (e.g. `60201012` for Stephansplatz). |
| `stop_name` | string | Human-readable station name. |
| `latitude` / `longitude` | float \| None | Station coordinates from the static catalogue. |
| `server_time` | ISO string \| None | `serverTime` from the last successful fetch. |
| `departures` | list[dict] | See [Departure shape](#departure-shape). Capped at 20 entries, sorted by countdown — which is also where the card's `max_departures` slider tops out, so nothing shown is clipped. |
| `next_by_line` | dict[str, int] | Per-line map to the earliest countdown — e.g. `{"U1": 2, "U4": 6}`. |
| `line_colors` | dict[str, dict] | Official GTFS colours per line — `{"U1": {"bg": "E20D17", "fg": "FFFFFF"}}`. |
| `lines_at_stop` | list[str] | Every line serving this DIVA per the static schedule, regardless of live status. |
| `tracked_lines` | list[str] | Lines tracked in this entry. Card editors filter their pickers to this set. |
| `tracked_line_keys` | list[str] | Raw `{line}\|{direction}` keys. All three card editors use them to offer only directions this stop actually serves. |
| `stale_departures` | int | Records dropped this poll because the feed stopped advancing them. |
| `stale_since` | ISO string \| None | Newest planned time among those dropped — roughly when the feed froze. |
| `traffic_info` | list[dict] | Service disruptions. `category` says which feed a notice came from: `stoerunglang` matches your tracked lines, `stoerungkurz` is the stop's own display text and matches only this stop's RBLs. Fields: `name`, `title`, `description`, `description_html`, `related_lines`, `related_stops`, `line_types`, `location`, `time_start`, `time_end`, `time_created`, `time_last_update`, `status`, `category`. |
| `elevator_info` | list[dict] | Elevator outages matching the stop's RBLs. Fields: `name`, `station`, `description`, `reason`, `status`, `related_lines`, `related_stops`, `time_start`, `time_end`. |

### Departure shape

Each entry in `departures` carries the service (`line`, `towards`, `direction` `"H"` / `"R"`, `type` — `ptMetro` / `ptTram` / `ptBusCity` / `ptBusNight`), the timing (`countdown`, `time_planned` and `time_real` as ISO strings, `realtime`), and the vehicle and stop context (`barrier_free`, `traffic_jam`, `platform`, `cooling`).

When the static schedule resolves a matching trip, `stops_ahead` adds an ordered list of `{name, is_terminus?, lines?}` down to the terminus. `lines` holds the *other* lines passing through each stop, which the card renders as transfer chips.

## Data Updates

Two live endpoints and three static catalogues, on separate cadences:

| What | Endpoint | Cadence |
|---|---|---|
| Live departures | `/monitor?stopId=…` | One request per interval group, default 60 s (30–600 s) |
| Service, stop and elevator alerts | `/trafficInfoList` — `stoerunglang` + `stoerungkurz` + `aufzugsinfo`, all three in one request | Domain-wide, 5 min — shared across all entries |
| Stop catalogue | `wienerlinien-ogd-haltestellen.csv` + `-haltepunkte.csv` | Weekly, cached to HA storage |
| Line catalogue + trip patterns | `wienerlinien-ogd-linien.csv` + `-fahrwegverlaeufe.csv` | Weekly, cached — powers the stops-ahead trail |
| Line colours | `gtfs/routes.txt` | Weekly, cached — powers `line_colors` |

**The polling interval is per entry; the request is not.** Every entry configured
with the same interval joins one group that issues a single `/monitor` request
carrying all their stops, then fans the response out. Adding stops at the same
cadence costs no extra requests. The five static files likewise refresh as one
weekly burst, not five schedules.

Recurring calls share a **15 s domain-wide cooldown** plus a 30 s per-entry
floor — that is the departure poll, the alerts refresh, and the weekly static
burst (which takes one slot for all five files rather than stalling a
background refresh five times over). The one exception is the live probe the
config flow runs while you pick lines: it is user-initiated, happens at most
twice in an entry's life, and making it wait would stall the setup dialog for
no meaningful saving. The floor sits at or above the 15-second minimum interval
conventionally cited for the OGD real-time endpoint — Wiener Linien publish no
numeric cap, so the figure is convention rather than rule.

Responses arrive gzip-compressed, which does most of the work: a 60-stop `/monitor` response measures 345,872 bytes raw against 20,894 on the wire. Requests do **not** send conditional-GET validators, because the upstream cannot answer them — `/monitor` and `/trafficInfoList` return no `ETag` or `Last-Modified` at all, and the static CSVs return both but ignore them, answering `200` even to `If-None-Match: *`. An identifying User-Agent (`HomeAssistant/{ver} wiener_linien_austria/{ver}`) goes on every request so Wiener Linien can traffic-shape this integration specifically.

> **After a Home Assistant restart**: alerts (`traffic_info` / `elevator_info`) refresh on a 5-min cadence, so they may be empty for up to 5 min. Departures fetch immediately.

**Failure handling.** A single failed poll keeps the cadence and serves the last successful board — templates can spot staleness via `server_time`. From the second consecutive failure the interval doubles each tick, capped at 30 min, until a fetch succeeds; because the request is shared, that backoff applies to the whole interval group. Rate-limit error 316 is the exception: it widens on the first failure instead, since upstream has already said the poll is too fast. It also raises a Repairs issue per entry, which clears itself when the API recovers. Only an integration that has never succeeded stays unavailable.

## Use Cases

- **Leave-now notifications** — "if the next U1 toward Leopoldau is under 3 min, notify me".
- **Dashboard departure board** — one of the bundled cards, or your own attribute-driven card.
- **Line-triggered automations** — turn on the entrance light when the tram is approaching.
- **Travel-time comparison** — track two stops and take whichever leaves sooner.

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

**"Cannot reach the Wiener Linien real-time API" during setup.** The integration probes `/monitor` before saving. Either the API is down or outbound HTTPS from your HA host is blocked. Retry in a minute.

**"No stop matches that."** Try a shorter or partial name — `Karls` matches Karlsplatz, Karlskirche, and more. Search is case-insensitive, but umlauts matter.

**Repairs issue "Wiener Linien rate limit hit".** Usually several HA instances behind one outbound IP sharing the OGD allowance. Raise the scan interval, or put your stops on the *same* interval so they share one request — adding stops at a cadence you already use costs nothing, while each distinct interval starts its own request stream. Or ignore it; the integration recovers on its own.

**Bug reports.** Settings → Devices & Services → Wiener Linien Austria → ⋯ → **Download diagnostics**. The JSON carries attribution, RBL list, last error code, and coordinator timing. No personal data.

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
- **Stops-ahead is best-effort.** Short-turn services may show the full scheduled path. Replacement buses (SEV) and unscheduled detours produce no panel — the row stays as it is, with no chevron.

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
