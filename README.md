# Wiener Linien Austria

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.6-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/github/v/release/rolandzeiner/wiener-linien-austria?label=version&color=blue)](https://github.com/rolandzeiner/wiener-linien-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)
[![Live demo](https://img.shields.io/badge/live-demo-2196F3.svg)](https://demo.rolandzeiner.at/#wien)

Vienna public transport departures for Home Assistant. Start typing your stop, choose the lines you care about — done. Uses the official [Wiener Linien OGD real-time API](https://www.wienerlinien.at/open-data): no API key, no YAML, no RBL lookups.

<!-- toc -->

## Contents

- [Supported Functions](#supported-functions)
- [Screenshots](#screenshots)
- [Requirements](#requirements)
- [Installation](#installation)
- [Setup](#setup)
- [Lovelace Cards](#lovelace-cards)
- [Sensor Attributes](#sensor-attributes)
- [Data Updates](#data-updates)
- [Actions](#actions)
- [Use Cases](#use-cases)
- [Automation Examples](#automation-examples)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [Removal](#removal)
- [Attribution](#attribution)
- [License](#license)
- [Disclaimer](#disclaimer)

<!-- tocstop -->

## Supported Functions

- **Live departures** for any U-Bahn, Straßenbahn, Autobus or Nightline stop. One sensor per stop; the state is the next-departure countdown, attributes carry the full board.
- **Four Lovelace cards** — modern board, retro LED panel, Solari split-flap and a route card — each painted in the official line colours from the Wiener Linien GTFS feed. See [Lovelace Cards](#lovelace-cards).
- **Visual card editors** — pick lines as coloured chips, set each stop's direction inline, and build the station header strip by tapping the side you want to fill. Shared by the modern, retro and flap cards *(2.0.0)*.
- **Stops-ahead trail** — expand any departure on the modern card into a metro-style trail of every upcoming stop, with transfer-line chips. Air-conditioned vehicles get a snowflake, off by default *(1.8.0)*.
- **S-Bahn transfers on the stops-ahead trail** *(2.0.0)* — a U-Bahn, tram or bus trail shows S-Bahn chips next to the U-Bahn ones wherever you can change to the S-Bahn. They come from the timetable, so a chip means the S-Bahn stops there, not that a train is due. This works whether or not you track any S-Bahn lines.
- **S-Bahn on departure boards** *(2.0.0)* — track a stop's S-Bahn lines next to its Wiener Linien lines. They show timetable times only, since no live data exists for them, and every card marks those rows *Timetable only*. On the modern card, an S-Bahn departure expands into its stops ahead like any other, with the lines you can change to.
- **Service + elevator alerts** for your tracked lines and stop, surfaced as `traffic_info` / `elevator_info` and rendered inline. Each notice breaks out per line with the reason and expected duration *(1.7.3)*. Stop-display notices — moved boarding points, works detours, closed stops — appear in the same banner, and only for the platforms and lines your card shows *(2.0.0)*.
- **Resilient polling** — stops sharing an interval fetch in one request instead of one each, and a board the upstream feed has frozen is reported as stale rather than as end of service *(1.7.8)*.
- **Routes from A to B** *(experimental)* — pick two stops and get the next connections, with live departure times for Wiener Linien rides and a buffer grade on every change. A second sensor turns on when a change no longer fits, and the `plan_trip` action answers "when do I have to leave?" for scripts and voice assistants, for a route or between any two stops by name. The route card can also plan between any two stops on the spot, without setting up a route. See [Routes](#routes) *(2.0.0)*.
- **A stale-data sensor per stop** — the departure sensor keeps showing the last known board through a brief outage, so a second entity tells you when that board stopped being refreshed. Gate outage automations on it *(2.0.0)*.

## Screenshots

### Cards

<table>
  <tr>
    <td align="center" valign="top">
      <img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/screenshots/card.webp" height="320" alt="Modern card" />
      <br/><em>Modern</em>
    </td>
    <td align="center" valign="top">
      <img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/screenshots/card-2.webp" width="264" alt="Retro LED card" />
      <br/>
      <img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/screenshots/card-3.webp" width="264" alt="Split-flap card" />
      <br/><em>Retro LED · Split-flap</em>
    </td>
    <td align="center" valign="top">
      <img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/screenshots/card-4.webp" height="320" alt="Route card" />
      <br/><em>Route</em>
    </td>
  </tr>
</table>

### Setup

<table>
  <tr>
    <td align="center" valign="top">
      <img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/screenshots/card-config.webp" height="300" alt="Card editor" />
      <br/><em>Card editor</em>
    </td>
    <td align="center" valign="top">
      <img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/screenshots/config-flow.webp" height="300" alt="Integration setup dialog" />
      <br/><em>Config flow</em>
    </td>
    <td align="center" valign="top">
      <img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/screenshots/action-editor.webp" height="300" alt="Plan trip action in the action editor" />
      <br/><em>Action editor</em>
    </td>
  </tr>
</table>

## Requirements

- Home Assistant **2025.6** or newer
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

1. **Settings → Devices & Services → + Add Integration**, search **Wiener Linien Austria**, and choose **Departure board for a stop**.
2. Start typing in **Stop** (e.g. `Stephans`) and pick a suggestion. The list opens on the stops nearest your Home Assistant location, with distances shown. Submit a partial name instead to see every stop that matches.
3. Pick the lines to track. Off-service lines — nightlines during the day, day-only lines after midnight — stay selectable. At a stop the S-Bahn serves, its lines are listed too, marked *timetable only*.
4. Set a polling interval (default 60 s, range 30–600 s) and save.

Change tracked lines via **Reconfigure**, the polling interval via **Configure**.

### Routes

*Experimental.* A route plans connections between two stops with the Wiener Linien trip planner.

1. Add the integration again and choose **Route from A to B**.
2. Pick **From** and **To**. Both fields filter as you type, like the stop picker.
3. Choose how to plan:
   - **Prefer** — fastest trip, fewest changes or least walking.
   - **Most changes** and **Avoid** — limit changes, or leave out trains, S-Bahn, U-Bahn, trams or buses.
   - **Walking speed** — how long the trip planner allows for walking between platforms.
   - **Transfer buffer** — changes with less time to spare are marked tight. Default 2 min.
   - **Step-free** *(2.0.0)* — plan only with lifts or ramps instead of stairs and escalators, and with low-floor vehicles.
   - **Time-to-leave alert** *(2.0.0)* — how many minutes before the best connection leaves the **Time to leave** sensor turns on. Default 5.
4. Optionally set a refresh window, such as weekdays 06:30–09:00. Outside it the route makes no requests.
5. Set an update interval (default 300 s, range 120–1800 s). The route also refreshes right after its best connection leaves.
6. Save. The integration plans the route once first, so a pair of stops the trip planner can't route is caught right away.

Change the planning options via **Reconfigure**, the update interval via **Configure**. Start and destination can't change, because they identify the route: add a new route instead.

## Lovelace Cards

Four cards ship with the integration. All four register themselves as Lovelace resources and find Wiener Linien sensors automatically — no entity-name prefix needed. Each version-checks itself over WebSocket and shows a reload banner when your browser holds stale JS, so hard-refresh (⌘⇧R / Ctrl⇧R) after upgrading.

| Card | Best for | Stops | Style |
|---|---|---|---|
| **Modern** | Everyday dashboard, full feature set | Multi-stop | Themed HA card |
| **Retro** | Wall-tablet kiosks, entryway displays | Single stop / direction | Wiener Linien LED platform sign |
| **Flap** | Decorative boards, signage walls | Multi-stop | Solari split-flap mechanical board |
| **Route** *(experimental)* | "When do I leave?" at a glance | One route, or any two stops | Themed HA card |

### Modern card — `wiener-linien-austria-card`

The everyday departure board. Themed to your HA palette; each stop auto-tints to its next-departure line colour.

- **Multi-stop layout** — stacked or tabbed; up to 20 departures per stop.
- **Hero countdown** — next departure rendered large, full board beneath.
- **Stops-ahead trail** — click any row to expand a metro-map trail down to the terminus, with transfer chips at each station.
- **Per-line walking time** — hides departures you can't reach in time.
- **QR map button** — encodes the stop as a `geo:` URI for phone scanners.
- **Disruption + elevator banners** — collapsible rows above the board.

Add via Dashboard → **Add card** → "Wiener Linien Austria".

#### Card configuration

```yaml
type: custom:wiener-linien-austria-card
entities:
  - entity: sensor.stephansplatz_departures
    lines: [U1, U3]
    line_directions:
      U3: R
    walk_times:
      "U1|H": 4
```

| Option | Default | Description |
|---|---|---|
| `entities` | first stop found | The stops to show. Each entry is a departure sensor, or an object with the options below. |
| `entities[].entity` | required | A stop's departure sensor. |
| `entities[].lines` | all | Lines to show at this stop, such as `[U1, U3]`. |
| `entities[].direction` | both | `H` or `R` to show one direction only. |
| `entities[].line_directions` | none | A direction per line, such as `{U3: R}`. Overrides `direction` for that line. |
| `entities[].walk_times` | none | Minutes it takes you to reach each line, keyed `"line\|direction"`, `0`–`120`. Departures you can't catch are hidden. |
| `max_departures` | `6` | Departures per stop, `0`–`20`. `0` shows only the large next departure. |
| `layout` | `stacked` | `stacked` or `tabs`. Only matters with two or more stops. |
| `line_colors` | none | Your own colour per line, such as `{U1: "#e20d17"}`. Without one, the official line colour applies. |
| `show_hero_metric` | `true` | Shows the next departure large. |
| `show_departures` | `true` | Shows the departure list. |
| `show_stops_ahead` | `true` | Lets you expand a departure into its stops ahead. |
| `show_platform` | `true` | Shows the platform or track. |
| `show_type_icon` | `false` | Shows the vehicle-type icon. |
| `show_delay` | `true` | Shows delays. |
| `show_delay_colors` | `true` | Colours the countdown red when late and green when early. Needs `show_delay`. |
| `show_accessibility` | `false` | Shows the step-free icon. |
| `accessibility_only` | `false` | Shows only step-free departures. Needs `show_accessibility`. |
| `show_cooling` | `false` | Shows a snowflake for air-conditioned vehicles. |
| `show_traffic_info` | `true` | Shows disruption alerts. |
| `show_elevator_info` | `true` | Shows elevator outages. |
| `show_qr_button` | `true` | Shows the QR-code button. |
| `hide_header` | `false` | Hides the card's title bar. |
| `hide_attribution` | `false` | Hides the data-source credit. |

### Retro card — `wiener-linien-austria-retro-card`

A focused LED panel, modelled on the amber-on-violet signs hanging from Wiener Linien platforms. The station-name tile picks up the configured line's colour (nightline blue + yellow on N-lines).

- **Three style variants** — *Classic*, *Warm*, *Dot matrix* (screen-door overlay).
- **GLEIS / STEIG panel** — amber platform tile when the API reports one.
- **Signage header strip** — exit icon, sign text, clock, date, WC / escalator / elevator tiles, free-form MDI icons and short labels. Per side.
- **Wheelchair race** — when ≥ 2 departures are step-free, runs a "3, 2, 1" countdown to the trophy finish. Tap to trigger.
- **Scrolling message** — custom text scrolls every 5 min, then hands back to live departures.

Add via Dashboard → **Add card** → "Wiener Linien Austria — Retro".

#### Card configuration

```yaml
type: custom:wiener-linien-austria-retro-card
entity: sensor.stephansplatz_departures
line: U1
direction: R
```

| Option | Default | Description |
|---|---|---|
| `entity` | first stop found | A stop's departure sensor. |
| `line` | all lines | The line to show. |
| `direction` | `H` | `H` or `R`. |
| `walk_times` | none | Minutes it takes you to reach the line, keyed `"line\|direction"`, `0`–`120`. Departures you can't catch are hidden. |
| `size` | `regular` | `small`, `medium` or `regular`. |
| `style` | `classic` | `classic`, `warm` or `pixel` (dot matrix). |
| `show_platform` | `true` | Shows the GLEIS / STEIG tile. |
| `platform_side` | `auto` | `auto` (platform 2 on the left, otherwise right), `left` or `right`. |
| `show_station_name` | `false` | Shows the station-name band. |
| `station_bg` | `default` | Station-name background: `default` (the line's colour), `white` or `black`. |
| `accessibility_only` | `false` | Shows only step-free departures. |
| `wheelchair_race` | `false` | Turns on the wheelchair race. |
| `flicker` | `false` | Simulates LED flicker. |
| `message_ticker` | `false` | Scrolls `message_text` across the panel every 5 min. |
| `message_text` | none | The scrolling message, up to 160 characters. |
| `show_line_pill` | `false` | Shows the line as a badge in its line colour. |
| `line_stripe` | `false` | Adds a thin bar in the line colour at the left of each row. |
| `housing` | `false` | Adds a dark frame around the LED panel. |
| `show_unit` | `false` | Adds "min" after each countdown. |
| `show_header` | `false` | Shows the station sign above the station name. |
| `header_left`, `header_right` | none | What each side of the station sign shows. See [Station sign options](#station-sign-options). |

#### Station sign options

`header_left` and `header_right` take the same options, on the retro and the flap card:

| Option | Default | Description |
|---|---|---|
| `exit` | `none` | `none`, `regular` (exit), `accessible` (step-free exit), or one of `mdi:exit-run`, `mdi:exit-to-app`, `mdi:door-open`, `mdi:stairs`. |
| `text` | none | Sign text, such as the next station, up to 64 characters. |
| `show_wc`, `show_escalator`, `show_elevator` | `false` | Show the WC, escalator and elevator tiles. |
| `show_clock` | `false` | Shows the time. |
| `show_date` | `false` | Shows the date. |
| `date_format` | `d.m.Y` | Date format, in PHP style (`d`, `m`, `Y`, `D`, `M` and so on). |
| `chips` | none | Short text labels, up to 6, each up to 16 characters. |
| `extra_icons` | none | Up to 3 MDI icons, such as `mdi:parking`. |

### Flap card — `wiener-linien-austria-flap-card`

A Solari split-flap board — characters cascade one tile at a time toward the target letter, mimicking the rattle of the mechanical originals from European stations.

- **Multi-stop merge** — add as many stops as you like; the board shows 1–8 rows, sorted by countdown across all of them.
- **Column headers** — *LINIE / RICHTUNG / STUFENLOS / GLEIS / ANKUNFT* above the board. The platform column reads *STEIG* outside the U-Bahn, and drops out when the API reports no platform.
- **Per-row GLEIS / STEIG tile** — own column, aligned across all rows.
- **Station-name band** — tints to the first tracked line by default; the editor also offers any tracked line, plus solid *White* and *Black*.
- **Signage header strip** — same grammar as the retro card, recoloured for the cabinet palette.
- **Compact mode** — hide the line column on single-line boards, or drop the cabinet for a flush mount.

Add via Dashboard → **Add card** → "Wiener Linien Austria — Flap Board".

#### Card configuration

```yaml
type: custom:wiener-linien-austria-flap-card
entities:
  - sensor.stephansplatz_departures
  - entity: sensor.karlsplatz_departures
    lines: [U4]
max_rows: 4
```

| Option | Default | Description |
|---|---|---|
| `entities` | first stop found | The stops to merge onto the board. Each entry is a departure sensor, or an object with `entity`, `lines`, `direction`, `line_directions` and `walk_times`, as on the [modern card](#modern-card--wiener-linien-austria-card). |
| `max_rows` | `2` | Departure rows, `1`–`8`, sorted by countdown across all stops. |
| `size` | `small` | `small`, `medium` or `regular`. The editor calls `small` *Normal*. |
| `show_platform` | `true` | Shows a GLEIS / STEIG tile per row. |
| `show_station_name` | `true` | Shows the station-name band. |
| `station_bg` | `line` | Station-name background: `line` (the first tracked line's colour), `line:U3` for a specific line, `white` or `black`. |
| `show_min_unit` | `true` | Adds "min" after each countdown. |
| `show_accessibility` | `true` | Shows the step-free tile. |
| `accessibility_only` | `false` | Shows only step-free departures. Needs `show_accessibility`. |
| `show_line_column` | `true` | Shows the line column. Turn it off on single-line boards. |
| `housing` | `true` | Shows the cabinet around the board. Off mounts the board flush. |
| `show_header` | `false` | Shows the station sign above the station name. |
| `header_left`, `header_right` | none | What each side of the station sign shows. See [Station sign options](#station-sign-options). |
| `hide_attribution` | `false` | Hides the data-source credit. |

### Route card — `wiener-linien-austria-route-card`

*Experimental.* The next connection for one route, or between any two stops you pick on the card, drawn the way the network map draws it.

The card works in one of two ways:

- **With a route.** Pick a route you set up under [Routes](#routes). The card shows what that route's sensor reports.
- **Without a route.** Leave the route empty and the card shows **From** and **To** pickers instead. It plans on the spot, so you don't need to set up a route first.

What the card shows:

- **Leave-in countdown** — minutes until the best connection departs, with departure and arrival time. For a trip at a chosen time, the departure time and day instead.
- **Line-coloured trip** — each ride is a segment in its line's colour, with platform, direction and number of stops. Before a change, the ride ends with its arrival time at the stop where you get off *(2.0.0)*.
- **Stops on the map** *(2.0.0)* — a pin after each boarding stop and the destination opens that stop in Vienna's city map. Where you get off at a different stop from the one you change to, that stop gets a pin too. For a stop the map can't place, such as an S-Bahn-only station, the pin searches for it on OpenStreetMap.
- **Stops along each ride** *(2.0.0)* — tap the number of stops to see every stop in between with its time, on the ride's own line. Live delays move these times too.
- **Live times and frequency** *(2.0.0)* — a U-Bahn, tram or bus ride with a live time gets a live icon next to its departure; a late one also shows its planned time struck through and the expected time in red (for example ~~09:22~~ 09:25). A line running every 5 min or more often shows *every 3 min*; a less frequent one shows its next two departures instead. S-Bahn and train rides stay on the timetable.
- **Buffer on every change** — walking time plus a grade: enough time, tight, or at risk when the current times say the change no longer fits. The grade is written out, not just coloured.
- **Disruptions** for the lines the trip uses.
- **Lifts and stairs** *(2.0.0)* — on a step-free trip, each lift on the way to the platform, at a change and at the destination, for example *Lift down*. A lift at a station with an outage says *out of service*, and a warning names the station. Rides planned with a low-floor vehicle show a wheelchair icon.
- **More connections** — up to three later options, folded away until you open them.
- **Last connection** *(2.0.0)* — for a route, from 22:00: the night's last connection without a night bus, for example *Last connection without night bus 00:20*.
- **Last updated** (*Zuletzt aktualisiert* on a German install) — the time the trip planner last answered, next to the heading, so a plan kept on screen can't pass for a fresh one.

Picking stops without a route:

- **Type to narrow the list.** Case and accents don't matter, so `wahringer strasse` finds Währinger Straße. Or open the list and pick. The nearest stops to your Home Assistant location come first.
- **Swap** start and destination with one tap.
- The connections appear as soon as both stops are set.
- **Now, Depart at or Arrive by** *(2.0.0)* — plan for right now, or pick a date and time to leave at or arrive by. Times are Vienna time, like the signs at the stop. The card starts at **Now** again after a reload.
- The card remembers your last pick on each device. In the card editor you can also preselect a start and destination.

Add via Dashboard → **Add card** → "Wiener Linien Austria — Route".

#### Card configuration

With a route:

```yaml
type: custom:wiener-linien-austria-route-card
entity: sensor.home_work_next_connection
```

Without a route, preselecting Hauptbahnhof → Gregorygasse:

```yaml
type: custom:wiener-linien-austria-route-card
from: "60201349"
to: "60200421"
```

| Option | Default | Description |
|---|---|---|
| `entity` | none | A route's next-connection sensor. Leave it out to pick stops on the card. |
| `from` / `to` | none | Stops to preselect when there's no `entity`, as DIVA numbers. A departure sensor shows its stop's DIVA in the `diva` attribute, and the card editor lists stops by name. A pick remembered on a device wins there, until you change these options. |
| `title` | see note | Heading text. Without it the card shows the route's start and destination, or "Plan a trip" when you pick stops on the card. |
| `alternatives` | `2` | Later connections to offer, `0`–`3`. |
| `show_map_pins` | `true` | Shows the map pins after the stop names. |
| `hide_attribution` | `false` | Hides the data-source line. |
| `step_free` | `false` | Plans step-free connections when there's no `entity`. A route uses its own **Step-free** setting. |

**How the card plans between any two stops.** Requests go through Home Assistant, never from the browser to Wiener Linien. The card refreshes every 2 minutes while it's on screen and the browser tab is visible, and shortly after the best connection leaves. After 30 minutes without a tap or key press it pauses until someone touches it, so a wall tablet left open stops asking. Home Assistant reuses an answer for up to a minute, whichever dashboard asks. Each Home Assistant user gets up to 60 trip-planner requests an hour, and all users together up to 120.

## Sensor Attributes

Each stop gets two entities, and Home Assistant names both in your interface language — check **Developer tools → States** if you're unsure which you have:

| | English install | German install |
|---|---|---|
| Departure board | `sensor.<stop>_departures` | `sensor.<stop>_abfahrten` |
| Stale-data flag | `binary_sensor.<stop>_departure_data_stale` | `binary_sensor.<stop>_abfahrtsdaten_veraltet` |

Each route gets three entities:

| | English install | German install |
|---|---|---|
| Next connection | `sensor.<route>_next_connection` | `sensor.<route>_nachste_verbindung` |
| Connection at risk | `binary_sensor.<route>_connection_at_risk` | `binary_sensor.<route>_anschluss_gefahrdet` |
| Time to leave *(2.0.0)* | `binary_sensor.<route>_time_to_leave` | `binary_sensor.<route>_zeit_zu_gehen` |

The next-connection sensor's state is the departure time of the best connection. Its attributes:

| Attribute | Notes |
|---|---|
| `origin`, `destination` | Stop names. |
| `active` | `false` outside the refresh window. |
| `active_window` | The window you set: `from`, `to` and `days`, each `null` when unset. |
| `fetched_at` | When the trip planner last answered. |
| `arrival`, `duration_minutes`, `interchanges`, `risk` | The best connection's arrival, length, number of changes and worst change (`ok`, `tight` or `at_risk`). |
| `min_transfer_minutes`, `step_free` | The route's transfer buffer and step-free setting. |
| `trips` | Up to four ranked connections. See [Trip shape](#trip-shape). |
| `last_connection` | From 22:00 to 03:00, the night's last connection without a bus. See below. |
| `line_colors` | Official colours for the lines the trips use. |
| `traffic_info` | Disruptions for those lines, in the same shape as on the departure sensor. |
| `elevator_info` | Lift outages at stations whose lifts the trips use, each with `stop_ids` naming those stations. Empty unless a trip lists lifts, which step-free trips do. |

`trips`, `last_connection`, `line_colors`, `traffic_info` and `elevator_info` aren't recorded in history.

From 22:00 to 03:00 the sensor also carries `last_connection`: the latest connection that night without a bus, in the same shape as a trip, or `null`. It's asked as "arrive by 04:00" with buses left out, and trips that wait out the night for the first morning train are dropped. On nights the U-Bahn runs through (Friday, Saturday and before public holidays) it can be a U-Bahn shortly before 04:00.

The time-to-leave sensor turns on the set number of minutes before the next connection leaves, and off when it leaves. Its attributes are `leave_at`, `departure`, `leave_minutes` and `lines`. When connections run more often than the set minutes, the next one is already due as one leaves, so the sensor stays on.

The at-risk sensor turns on only when the current times say a change no longer fits. A `tight` change doesn't turn it on: the trip planner plans changes with no time to spare all the time, so that would keep the sensor on most of the day. Live times count for U-Bahn, tram and bus rides; they come from the departure boards, because the trip planner itself sends none. Its attributes are `risk` (the best connection's grade), `transfer_at` and `slack_minutes` (where its tightest change is, and how many minutes it leaves).

### Trip shape

Each connection in `trips`, `last_connection` and the `plan_trip` response has:

- `departure`, `arrival` (ISO times), `duration_minutes`, `interchanges`, `risk` and `cancelled`.
- `legs`: every ride and walk, in order.
- `transfers`: every change between two rides, with `at` (the stop), `walk_minutes`, `slack_minutes`, `risk` and `access`.

Each leg has:

- `walk` (`true` for a walk), `line`, `type` (such as `ptMetro` or `ptTrainS`), `product`, `towards` and `direction` (`H` or `R`).
- `origin` and `destination`, each with `name`, `stop_id`, `platform`, `planned`, `estimated` and `delay_minutes`.
- `stop_count`, `duration_minutes`, `walk_after_minutes` (the walk to the next ride) and `cancelled`.
- `stops`: the stops between boarding and alighting, each with `name`, `stop_id` and `time`.
- `realtime`: `true` when the ride has a live time. Its `estimated` departure is then live, and its arrival and `stops` times move by the same delay.
- `next_departures` (the next two, as ISO times) and `headway_minutes` (how often the line typically runs there), from the departure boards.
- `low_floor`: planned with a low-floor vehicle.
- `access`: the lifts and stairs on the leg's own walk, each with `kind` (such as `elevator` or `stairs`), `level` (`up` or `down`) and the station's `stop_id`. A change's `access` lists the ones between two rides. A lift outage in `elevator_info` is matched by station, so it can concern a different lift at the same station.

In `trips` and the `plan_trip` response, a stop in the Wiener Linien stop list, whether a leg's `origin`, its `destination` or one of its `stops`, also carries `latitude` and `longitude`. Other stops, such as S-Bahn-only stations, have neither.

### Stale-data sensor

The stale-data flag turns on when the board stops being refreshed — either a poll failed, or the last `serverTime` is older than three polling intervals. Its attributes show the reason: `server_time`, `seconds_since_server_time`, `stale_after_seconds` and `last_update_success`.

Use it instead of the departure sensor's availability. The departure sensor stays available through a short outage on purpose, so it keeps a populated board on screen rather than blanking your cards — which also means `is_state(..., 'unavailable')` and `availability_template` never fire for it. This entity carries that signal instead.

### Departure sensor

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
| `tracked_line_keys` | list[str] | Raw `{line}\|{direction}` keys. The modern, retro and flap card editors use them to offer only directions this stop actually serves. |
| `stale_departures` | int | Records dropped this poll because the feed stopped advancing them. |
| `stale_since` | ISO string \| None | Newest planned time among those dropped — roughly when the feed froze. |
| `traffic_info` | list[dict] | Service disruptions. `category` says which feed a notice came from: `stoerunglang` matches your tracked lines. `stoerungkurz` is the stop's own display text. It needs one of this stop's RBLs plus one of your tracked lines — named in the notice or, if it names none, calling at that platform per the timetable. A notice with no lines of its own lists those tracked lines in `inferred_lines`, which the card shows as badges. Every `stoerungkurz` notice has the platform's station name in `location`. Fields: `name`, `title`, `description`, `description_html`, `related_lines`, `related_stops`, `inferred_lines`, `line_types`, `location`, `time_start`, `time_end`, `time_created`, `time_last_update`, `status`, `category`. |
| `elevator_info` | list[dict] | Elevator outages matching the stop's RBLs. Fields: `name`, `station`, `description`, `reason`, `status`, `related_lines`, `related_stops`, `time_start`, `time_end`. |

`departures`, `next_by_line`, `line_colors`, `lines_at_stop`, `tracked_lines`, `tracked_line_keys`, `traffic_info` and `elevator_info` aren't recorded in history, since they are large at busy stops.

### Departure shape

Each entry in `departures` carries the service (`line`, `towards`, `direction` `"H"` / `"R"`, `type` — `ptMetro` / `ptTram` / `ptBusCity` / `ptBusNight`), the timing (`countdown`, `time_planned` and `time_real` as ISO strings, `realtime`), and the vehicle and stop context (`barrier_free`, `traffic_jam`, `platform`, `cooling`).

An S-Bahn departure has `type` `ptTrainS` and `timetable: true`. Its `countdown` runs off `time_planned`, `time_real` is `null`, and it leaves the list once its planned time has passed. Live departures don't carry `timetable` at all.

When the static schedule resolves a matching trip, `stops_ahead` adds an ordered list of `{name, is_terminus?, lines?}` down to the terminus. `lines` holds the *other* lines passing through each stop, S-Bahn included, which the card renders as transfer chips.

## Data Updates

Four live endpoints and five static files, on separate cadences:

| What | Endpoint | Cadence |
|---|---|---|
| Live departures | `/monitor?stopId=…` | One request per interval group, default 60 s (30–600 s) |
| Service, stop and elevator alerts | `/trafficInfoList` — `stoerunglang` + `stoerungkurz` + `aufzugsinfo`, all three in one request | Domain-wide, 5 min — shared across all entries |
| Stop catalogue | `wienerlinien-ogd-haltestellen.csv` + `-haltepunkte.csv` | Weekly, cached to HA storage |
| Line catalogue + trip patterns | `wienerlinien-ogd-linien.csv` + `-fahrwegverlaeufe.csv` | Weekly, cached — powers the stops-ahead trail |
| Line colours | `gtfs/routes.txt` | Weekly, cached — powers `line_colors` |
| Planned S-Bahn departures | `ogd_routing/XML_DM_REQUEST` | Only for stops with an S-Bahn line picked: the next 30 trains with their stops, fetched again after 2 h or when fewer than 6 are left, never more often than every 5 min. After a failed request the wait doubles, up to 30 min, until it answers again. Counted down locally in between, and shares the routes' 15 s cooldown slot |
| S-Bahn lines per stop | `ogd_routing/XML_DM_REQUEST` | Weekly, cached — 40 trains with their stops at each of 7 hub stations, for the S-Bahn transfer chips. Checked daily, so a failed station is retried the next day. Only with a departure board set up; shares the routes' 15 s cooldown slot |
| Route connections *(experimental)* | `ogd_routing/XML_TRIP_REQUEST2` | Per route, default 300 s (120–1800 s), only inside its refresh window. Pulled forward to 30 s after the best connection leaves, but never sooner than 60 s after the last refresh |
| Connections between any two stops *(experimental)* | `ogd_routing/XML_TRIP_REQUEST2` | On demand from the route card and `plan_trip`. The card refreshes every 120 s while visible, sooner right after the best connection leaves (never within 60 s), every 10 min for a plan at a chosen time, and pauses after 30 min idle. Answers reused for 1 min; at most 60 requests/h per user and 120/h per Home Assistant |
| Last connection of the night *(experimental)* | `ogd_routing/XML_TRIP_REQUEST2` | One request per route per night, at its first refresh between 22:00 and 03:00. Not retried if it fails |
| Live times on connections *(experimental)* | `/monitor?stopId=…` | Rides in the departure boards' request. A request of its own only for a stop that has no answer yet, or when no departure board is set up (then once per route refresh, shared by all routes for 1 min) |

**The polling interval is per entry; the request is not.** Every entry configured
with the same interval joins one group that issues a single `/monitor` request
carrying all their stops, then fans the response out. Adding stops at the same
cadence costs no extra requests. The five static files likewise refresh as one
weekly burst, not five schedules.

Recurring calls share a **15 s domain-wide cooldown** plus a 30 s per-entry
floor — that is the departure poll, the alerts refresh, the live-times request
a route makes on its own, and the weekly static burst (which takes one slot for
all five files rather than stalling a background refresh five times over). The
exceptions are the probes the setup dialog runs while you pick lines or save a
route: the `/monitor` line probe, the S-Bahn line probe and the route test plan.
Someone is watching the dialog, each runs once per step, and making them wait
would stall it for no meaningful saving. The floor sits at or above the 15-second minimum interval
conventionally cited for the OGD real-time endpoint — Wiener Linien publish no
numeric cap, so the figure is convention rather than rule.

**Routes run on their own schedule.** The trip planner is a separate Wiener
Linien service, so route refreshes take their own 15 s cooldown slot and never
delay a departure poll. A route also refreshes right after its best connection
leaves, so the list moves on without a faster interval. Like departures, it
backs off from the second failure in a row, capped at 30 min.

**Live times on routes cost no extra polling.** A route and a plan on the card
add their boarding stops to the departure boards' combined `/monitor` request,
so live times follow the boards' cadence without asking the trip planner
again. A new plan makes one request of its own only when its stops have no
answer yet. Without any departure board, a route refresh makes that request
itself, taking the 15 s cooldown slot, and one answer serves every route for a
minute. If it fails, the plan simply stays on the timetable.

Planning between any two stops on the card, and the `plan_trip` action, skip
that cooldown slot, because someone is waiting for the answer. Three other
limits keep them in check: an identical request within a minute gets the same
answer, a request already under way is shared rather than repeated, and each
Home Assistant user gets at most 60 trip-planner requests an hour, all users
together 120. Once a user's requests are used up, the card keeps showing its
last plan for up to 5 minutes and says so. Plans stay in memory for 5 minutes
at most and are dropped when you remove the integration. The integration
doesn't write stop pairs to diagnostics, the recorder or its log.

Responses arrive gzip-compressed, which does most of the work: a 60-stop `/monitor` response measures 345,872 bytes raw against 20,894 on the wire. Requests do **not** send conditional-GET validators, because the upstream cannot answer them — `/monitor` and `/trafficInfoList` return no `ETag` or `Last-Modified` at all, and the static CSVs return both but ignore them, answering `200` even to `If-None-Match: *`. An identifying User-Agent (`HomeAssistant/{ver} wiener_linien_austria/{ver}`) goes on every request so Wiener Linien can traffic-shape this integration specifically.

> **After a Home Assistant restart**: alerts (`traffic_info` / `elevator_info`) refresh on a 5-min cadence, so they may be empty for up to 5 min. Departures fetch immediately.

**Failure handling.** A single failed poll keeps the cadence and serves the last successful board. Watch the stale-data flag ([Sensor Attributes](#sensor-attributes)) to catch that, or compare `server_time` to `now()` in a template. From the second consecutive failure the interval doubles each tick, capped at 30 min, until a fetch succeeds; because the request is shared, that backoff applies to the whole interval group. Rate-limit error 316 is the exception: it widens on the first failure instead, since upstream has already said the poll is too fast. It also raises a Repairs issue per entry, which clears itself when the API recovers. Only an integration that has never succeeded stays unavailable.

## Actions

### `wiener_linien_austria.plan_trip`

*Experimental.* Plans connections for a route you've set up, or between any two stops, and returns them soonest first — the same shape as the sensor's `trips` attribute.

| Field | Required | Description |
|---|---|---|
| `config_entry_id` | one of the two | The route to plan. |
| `origin`, `destination` | one of the two | Two stops, by name or DIVA number, instead of a route. *(2.0.0)* |
| `datetime` | no | When to leave. Leave empty for now. |
| `arrive_by` | no | Treat `datetime` as the latest arrival instead. Default `false`. |

```yaml
action: wiener_linien_austria.plan_trip
data:
  config_entry_id: 01J8EXAMPLEROUTEENTRY
  datetime: "2026-09-15 08:30:00"
  arrive_by: true
response_variable: plan
```

**Planning between two stops.** Give `origin` and `destination` instead of a route, for example from a voice assistant sentence like "how do I get from Stephansplatz to Westbahnhof". Trip options such as walking speed use their defaults.

```yaml
action: wiener_linien_austria.plan_trip
data:
  origin: Stephansplatz
  destination: Westbahnhof
response_variable: plan
```

Names don't have to match the stop list exactly, since speech recognition rarely does:

- Case, accents and punctuation don't matter: `schoenbrunn` finds Schönbrunn.
- The everyday name works: `Hütteldorf` finds *Bhf. Hütteldorf*, `Wien Mitte` finds *Mitte-Landstraße*.
- One wrong letter is fine: `Karlsplats` finds Karlsplatz.
- If two stops share a name in the same place, such as Schottenring, the busier one is used.

The response's `origin` and `destination` hold the stop names that were picked, so a reply can say them back. If no stop matches, or a name fits several different stops, the action fails with a message listing them. Use a longer name or the DIVA number then. A departure sensor shows its stop's DIVA in the `diva` attribute. To ask for a trip by voice, see [Ask Assist for a trip](#ask-assist-for-a-trip).

The action skips the request cooldown, because someone is waiting for the answer, and shares the route card's limits instead. Calling it again for the same route and time within a minute returns the same answer without a new request. A script can make 5 requests in a row, then about one a minute; beyond that the action fails with a message saying when to try again. Automations, which run without a user, share one allowance. Targeting a departure board, or a route that isn't loaded, fails with a message saying so.

### WebSocket API (for card and dashboard developers)

*Experimental.* The route card plans between any two stops through two WebSocket commands. The route card is the intended caller. You can call them from your own card too, but they may change while routes are experimental. Any signed-in user can call them, not only admins, so a wall tablet signed in as a regular user works.

**`wiener_linien_austria/stops`** takes no fields. It returns every stop you can plan from, nearest to your Home Assistant location first. It's the same list the setup dialog offers.

```json
{"stops": [{"value": "60201349", "label": "Hauptbahnhof (Wien) — 450 m"}]}
```

**`wiener_linien_austria/plan`** plans connections between two stops, leaving now or at a chosen time.

| Field | Required | Values |
|---|---|---|
| `origin`, `destination` | yes | Stop DIVAs from the `stops` list. |
| `route_type` | no | `leasttime` (default), `leastinterchange` or `leastwalking`. Case doesn't matter. |
| `max_changes` | no | `"0"`–`"3"`, or `"any"` (default). |
| `walk_speed` | no | `slow`, `normal` (default) or `fast`. |
| `excluded_means` | no | Any of `train`, `sbahn`, `metro`, `tram`, `bus`. Default: none. |
| `min_transfer_minutes` | no | `0`–`15`, default `2`. |
| `datetime` | no | When to leave, as an ISO date and time. Without an offset it's Vienna time. Leave out for now. |
| `arrive_by` | no | `true` treats `datetime` as the latest arrival instead. Default `false`. |
| `step_free` | no | `true` plans only step-free connections. Default `false`. |

The answer has the same shape as the next-connection sensor's attributes, so one renderer handles both: `origin` and `destination` (stop names), `fetched_at`, `min_transfer_minutes`, `step_free`, `trips` (up to four), `line_colors`, `traffic_info`, `elevator_info` and `attribution`. `planned_for` echoes the chosen time (`null` for now) and `arrive_by` how it was meant. A plan for a chosen time keeps every connection it found, even ones that already left. Two more fields cover a used-up allowance. `stale` is `true` when this is an older plan served in place of a new one, and `retry_after` then gives the seconds until a new one is possible. Otherwise `stale` is `false` and `retry_after` is `null`.

`plan` shares the limits described under [Data Updates](#data-updates): answers reused for a minute, and at most 60 requests an hour per user and 120 for all users together.

Errors come back with one of these codes:

| Code | Meaning |
|---|---|
| `not_loaded` | The integration has no loaded entry. Both commands answer this until one loads. |
| `catalogue_unavailable` | The stop list couldn't be loaded. |
| `invalid_stop` | A DIVA isn't in the `stops` list. |
| `same_stop` | Origin and destination are the same stop. |
| `invalid_query` | The trip planner refused this pair, for example because the stops are too close together. Asking again soon gets the same answer. |
| `rate_limited` | The allowance is used up and there's no recent plan to fall back on. `translation_placeholders.retry_after` gives the seconds to wait. |
| `upstream` | The trip planner couldn't be reached or sent an error. |

A request that doesn't match the schema gets Home Assistant's own `invalid_format` error.

## Use Cases

- **Leave-now notifications** — "if the next U1 toward Leopoldau is under 3 min, notify me".
- **Dashboard departure board** — one of the bundled cards, or your own attribute-driven card.
- **Line-triggered automations** — turn on the entrance light when the tram is approaching.
- **Travel-time comparison** — track two stops and take whichever leaves sooner.
- **Commute check** *(experimental)* — a route with a weekday morning window, and a notification when a delay puts your change at risk.
- **Ask by voice** *(experimental)* — "wie komme ich von Stephansplatz nach Westbahnhof" to Assist, and it tells you which line to take *(2.0.0)*.

## Automation Examples

Notify your phone when it's time to leave, as a blueprint. Save it as `blueprints/automation/wiener_linien_austria/time_to_leave.yaml` in your configuration folder, reload automations, then create an automation from it under **Settings → Automations & scenes → Blueprints**:

```yaml
blueprint:
  name: Wiener Linien — time to leave
  description: Notifies a phone when a route's Time to leave sensor turns on.
  domain: automation
  input:
    leave_sensor:
      name: Time to leave sensor
      selector:
        entity:
          filter:
            - integration: wiener_linien_austria
              domain: binary_sensor
    notify_device:
      name: Phone
      selector:
        device:
          filter:
            - integration: mobile_app
mode: single
variables:
  leave_sensor: !input leave_sensor
triggers:
  - trigger: state
    entity_id: !input leave_sensor
    to: "on"
actions:
  - domain: mobile_app
    type: notify
    device_id: !input notify_device
    title: Time to leave
    message: >-
      {{ state_attr(leave_sensor, 'lines') | join(' → ') }} leaves at
      {{ as_timestamp(state_attr(leave_sensor, 'departure')) | timestamp_custom('%H:%M') }}.
```

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

Notify when a delay puts the commute's change at risk:

```yaml
alias: "Commute change at risk"
trigger:
  - platform: state
    entity_id: binary_sensor.home_work_connection_at_risk
    to: "on"
action:
  - service: notify.mobile_app_phone
    data:
      title: "Your change is at risk"
      message: >
        {{ state_attr('binary_sensor.home_work_connection_at_risk', 'transfer_at') }}:
        {{ state_attr('binary_sensor.home_work_connection_at_risk', 'slack_minutes') }} min to spare
```

### Ask Assist for a trip

Ask Home Assistant's Assist for a connection between any two stops, typed or spoken. This works with the built-in conversation agent, so you don't need an AI service. Create an automation, switch to **Edit in YAML** and paste:

```yaml
alias: "Assist: plan a trip"
mode: parallel
triggers:
  - trigger: conversation
    command:
      - "wie komme ich von {von} nach {nach}"
      - "[nächste] (Verbindung|Fahrt) von {von} nach {nach}"
actions:
  - action: wiener_linien_austria.plan_trip
    data:
      origin: "{{ trigger.slots.von }}"
      destination: "{{ trigger.slots.nach }}"
    response_variable: plan
    continue_on_error: true
  - if:
      - condition: template
        value_template: "{{ plan is defined and plan.trips | count > 0 }}"
    then:
      - variables:
          trip: "{{ plan.trips[0] }}"
          ride: "{{ trip.legs | rejectattr('walk') | first | default(none) }}"
      - set_conversation_response: >-
          Von {{ plan.origin }} nach {{ plan.destination }}:
          {% if ride %}{% set t = ride.origin.estimated or ride.origin.planned %}Nimm um
          {{ as_timestamp(t) | timestamp_custom('%H:%M') }} die {{ ride.line }}
          Richtung {{ ride.towards }}.{% endif %}
          Du bist um {{ as_timestamp(trip.arrival) | timestamp_custom('%H:%M') }} da
          {%- if trip.interchanges %}, mit {{ trip.interchanges }}-mal Umsteigen{% endif %}.
    else:
      - set_conversation_response: >-
          Dafür habe ich keine Verbindung gefunden. Probier die Haltestellen
          etwas genauer, zum Beispiel „Wien Mitte“ statt „Mitte“.
```

To try it, open Assist from the top of the Overview page and type *wie komme ich von Stephansplatz nach Westbahnhof*. The answer reads like *Von Stephansplatz nach Westbahnhof: Nimm um 14:32 die U3 Richtung Ottakring. Du bist um 14:41 da.*

- **Language:** the sentences are German, so set your Assist language to German, or write the sentences and replies in your own language.
- **Live times:** the reply gives the live departure time when there is one, otherwise the timetable time.
- **When a stop isn't found:** if a name matches no stop or several, Assist gives the fallback reply. The automation's **Traces** show the action's message, including which stops a name matched.
- **Speaking instead of typing:** results depend on your speech-to-text. Name matching allows for small mistakes, like a wrong letter or a missing accent, but not a misheard word.

## Troubleshooting

**"Cannot reach the Wiener Linien real-time API" during setup.** The integration asks `/monitor` which lines serve the stop before it lists them. Either the API is down or outbound HTTPS from your HA host is blocked. Retry in a minute.

**"Can't reach the Wiener Linien trip planner" when adding a route.** The integration plans the route once before saving. The trip planner runs separately from the departure API, so one can be down while the other works. Retry in a minute.

**A route shows "Outside the refresh window".** That's the window you set, not an error. Change it via **Reconfigure**.

**The route card says "Too many route requests right now".** The card has used up its trip-planner requests for the moment. Each Home Assistant user gets 60 an hour, and all users together 120, so several tablets signed in as the same user share one allowance. The card tries again on its own once a request is free, usually within a minute.

**The route card says "Updates paused".** Nobody has touched the card for 30 minutes. Tap it, or select **Resume updates**, and it plans again.

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

- **Wiener Linien stops only.** Departure boards, and a route's start and destination, use stops from the Wiener Linien stop list. A station served only by the S-Bahn can't be picked.
- **S-Bahn shows timetable times, not live ones.** There is no live data for the S-Bahn, so a departure board can't show delays, cancellations or platform changes for it, and a late train leaves the board at its planned time. On a route, S-Bahn and train rides keep their timetable times too.
- **No S-Bahn between Praterstern and Hauptbahnhof until the end of October 2027.** ÖBB has closed this stretch for construction since 7 September 2026, so Wien Mitte, Rennweg and Quartier Belvedere have no S-Bahn lines to pick, and routes don't use it. The lines return to the picker once trains run there again. Regional trains (REX, R, CJX) aren't in the departure data at all.
- **The card's last pick stays on that device.** It's saved in the browser, not in Home Assistant, so a phone and a wall tablet each remember their own. Two route cards without a route on the same device share that pick.
- **Routes are experimental and stop to stop.** Start and destination are stops, not addresses, and the trip planner decides the walking between platforms.
- **Live times on routes come from the departure boards.** The trip planner sends none, so a ride gets its live time from `/monitor`, which lists about the next hour. Rides more than about an hour away stay on the timetable. `/monitor` has no arrival times, so a ride's arrival moves by its departure delay.
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
