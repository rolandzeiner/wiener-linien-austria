# Wiener Linien Austria

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.1-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/rolandzeiner/wiener-linien-austria/releases)
[![Quality Scale](https://img.shields.io/badge/quality%20scale-platinum-e5e4e2.svg)](https://developers.home-assistant.io/docs/core/integration-quality-scale/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)

Home Assistant integration for Vienna public transport departures. Uses the official [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data) — no API key, no YAML editing, no manual RBL lookups.

Type a stop name, pick it from a list, choose which lines to track. Done.

## Supported Functions

- Real-time departures for any Wiener Linien stop (U-Bahn, Straßenbahn, Autobus, Nightline).
- One sensor per configured stop. State is the countdown of the next overall departure; attributes carry the full board (every line × direction) plus grouped views for easy dashboard access.
- Multi-step config flow: search → pick stop → pick lines. Live API probe during setup confirms connectivity and shows the exact lines you'll be tracking.
- Reconfigure flow to add/remove lines at a stop without losing the entry.
- Options flow to change the polling interval without re-doing selection.
- **Service disruption alerts** (`trafficInfoList`) filtered to the lines you're tracking — surfaced in the `traffic_info` sensor attribute and as a banner on the Lovelace card.
- **Elevator outage alerts** (`Aufzugsinfo`) filtered to your stop's RBLs — surfaced in the `elevator_info` sensor attribute and as a badge on the card.
- Diagnostics download with attribution, coordinator state, last error code, server time, and currently matched alerts.

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

1. **Settings → Devices & Services → + Add Integration**.
2. Search for **Wiener Linien Austria**.
3. Type part of a stop name (e.g. `Stephans`) and submit.
4. Pick the matching stop from the dropdown.
5. The integration calls the live `/monitor` endpoint and shows every line currently serving that stop. All pre-selected. Deselect any you don't care about.
6. Set a polling interval (default 60 s, minimum 30 s) and save.

Change tracked lines later via **Reconfigure**; change polling interval via **Configure** (options).

## Data Updates

The integration polls the Wiener Linien `/monitor` endpoint per entry on a user-configurable interval.

| Setting | Value |
|---|---|
| Default polling interval | 60 seconds |
| Minimum | 30 seconds |
| Maximum | 600 seconds |
| Domain-wide cooldown | 15 seconds between any two outbound calls |

Wiener Linien's fair-use policy allows **≥ 15 s** between requests; we enforce a **30 s floor** per entry and a **15 s domain-wide cooldown** across all entries so multi-entry setups can't accidentally aggregate into a rate-limit hit. If Wiener Linien ever responds with error code 316 (rate limit exceeded), the integration raises a **Repairs issue** and automatically backs off until the next successful fetch.

Static stop metadata is refreshed weekly in the background.

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

**"Cannot reach the Wiener Linien real-time API" during setup.** The integration probes `/monitor` with all RBLs of the chosen station before saving. If the probe fails, either the API is temporarily down or outbound HTTPS from your HA host is blocked. Retry after a minute.

**"No stops match this search".** The static catalogue was loaded but your query didn't match. Try shorter or partial names (e.g. `Karls` → matches Karlsplatz, Karlskirche, …). Umlauts matter — "Wien Mitte" works, "wien mitte" also works (search is case-insensitive).

**A Repairs issue "Wiener Linien rate limit hit" appeared.** Wiener Linien returned error 316. The default 60 s interval is well within their fair-use policy, so this only happens if many HA instances behind the same outbound IP (e.g. a corporate NAT) saturate the shared allowance. Raise the scan interval in Options, reduce concurrent entries, or ignore it — the integration recovers automatically.

**Collecting diagnostics for a bug report.** Settings → Devices & Services → Wiener Linien Austria → ⋯ → Download diagnostics. The JSON includes attribution, the RBL list, last error code, and coordinator timing. No personal data.

**Debug logs:**

```yaml
# configuration.yaml
logger:
  default: info
  logs:
    custom_components.wiener_linien_austria: debug
```

## Known Limitations

- **Vienna only.** The Wiener Linien API covers Wiener Linien routes; ÖBB / VOR / regional services are outside its scope.
- **Polling floor of 30 s** per entry, 15 s domain-wide cooldown across all entries. You cannot go below these; they exist to respect Wiener Linien's fair-use policy.
- **No journey planning.** The OGD monitor endpoint returns departures at a stop; it does not do routing.
- **Static catalogue refreshes weekly.** Brand-new stops may take up to a week to appear in search until the cache rebuilds.

## U-Bahn Line Colors (reference)

For users building dashboards / custom cards. Wiener Linien doesn't publish a standalone CI PDF, but the hex values match in-station signage and every community reference:

| Line | Hex | Name |
|---|---|---|
| U1 | `#E3000F` | red |
| U2 | `#A862A4` | violet |
| U3 | `#EF7C00` | orange |
| U4 | `#00963F` | green |
| U5 | `#008F95` | turquoise (opening phased) |
| U6 | `#9D6830` | brown / ochre |

## Attribution

All live data is © Wiener Linien and published under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. The integration emits this attribution on every sensor (`attribution` attribute) and in every diagnostics download:

> Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0

If you build a Lovelace card or other user-facing UI on top of this integration, please keep the attribution visible.

## Removal

1. **Settings → Devices & Services** → find Wiener Linien Austria → ⋯ → **Delete**.
2. Remove `custom_components/wiener_linien_austria/` from the HA config (manual installs only; HACS removes it automatically).

## Contributors

- **Roland Zeiner** — maintainer ([@rolandzeiner](https://github.com/rolandzeiner))
- **[Claude](https://claude.com/claude-code)** (Anthropic) — pair-programming partner via Claude Code; helped shape the Platinum scaffolding, config-flow UX, and the Wiener Linien OGD client

## License

MIT — see [LICENSE](LICENSE). The integration code is MIT; the Wiener Linien data flowing through it is CC BY 4.0.

## Disclaimer

This integration is not affiliated with or endorsed by Wiener Linien GmbH & Co KG. All departure and stop data is provided by the [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data) and published under the Creative Commons Attribution (CC BY 4.0) license. The developer assumes no liability for the accuracy, completeness, or timeliness of the displayed departures, including delays, cancellations, or disruptions. Use at your own risk.

---

Diese Integration steht in keiner Verbindung zur Wiener Linien GmbH & Co KG und wird von dieser nicht unterstützt. Alle Abfahrts- und Haltestellendaten stammen von der [Wiener Linien OGD Echtzeit-API](https://www.wienerlinien.at/open-data) und werden unter der Creative-Commons-Lizenz Namensnennung 4.0 (CC BY 4.0) veröffentlicht. Für die Richtigkeit, Vollständigkeit und Aktualität der angezeigten Abfahrten — einschließlich Verspätungen, Ausfällen oder Störungen — wird keine Haftung übernommen. Nutzung auf eigene Verantwortung.
