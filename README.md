# <sub><sub><img src="https://raw.githubusercontent.com/rolandzeiner/wiener-linien-austria/main/custom_components/wiener_linien_austria/brand/icon.png" width="40" height="40" alt=""></sub></sub> Wiener Linien Austria

[![Marketplace](https://img.shields.io/badge/Marketplace-Catalog-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.6-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/github/v/release/rolandzeiner/wiener-linien-austria?label=version&color=blue)](https://github.com/rolandzeiner/wiener-linien-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)
[![Live demo](https://img.shields.io/badge/live-demo-2196F3.svg)](https://demo.rolandzeiner.at/#wien)

Live departures for Vienna's public transport in Home Assistant, from the official [Wiener Linien open data](https://www.wienerlinien.at/open-data). Pick a stop and the lines you take, and you get a departure sensor and four dashboard cards. Routes from A to B are optional. No API key and no YAML.

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

## Features

- Live departures for every U-Bahn, tram, bus and NightLine stop, plus S-Bahn timetable times where the S-Bahn stops.
- Four cards: a modern board, a retro LED sign, a split-flap board and a route card, all in the official line colours.
- Open a departure to see every stop ahead, with the lines you can change to and estimated arrival times.
- Disruption, stop and lift notices for the lines and platforms you track.
- Routes from A to B (experimental): the next connections with live times, a grade for every change, and a time-to-leave sensor.
- A `plan_trip` action that answers "when do I have to leave?" for scripts and Assist, between any two stops by name.
- Visual card editors: pick lines as coloured chips, with a direction and walking time per line.
- During an outage the last board stays on screen, a sensor flags it as stale, and a repair says whether Wiener Linien is down.

## Requirements

- Home Assistant **2025.6** or newer.
- Outbound HTTPS to `wienerlinien.at`.
- No account and no API key: Wiener Linien open data has been key free since 2019.

## Installation

### Marketplace (recommended)

The Marketplace is HACS, built into Home Assistant since 2026.11.

1. In Home Assistant, go to **Settings → Marketplace** and search for **Wiener Linien Austria**.
2. Select it, then select **Install**. The setup starts right away, no restart needed.

[![Open this repository in the Marketplace of your Home Assistant.](https://my.home-assistant.io/badges/marketplace_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rolandzeiner&repository=wiener-linien-austria&category=integration)

On Home Assistant older than 2026.11, use HACS instead: search for **Wiener Linien Austria**, select **Download**, then restart Home Assistant.

### Manual

1. Download `wiener_linien_austria.zip` from the [latest release](https://github.com/rolandzeiner/wiener-linien-austria/releases/latest).
2. Extract it into `config/custom_components/wiener_linien_austria/`.
3. Restart Home Assistant.

## Setup

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=wiener_linien_austria)

1. Go to **Settings → Devices & services → Add integration**, search for **Wiener Linien Austria** and choose **Departure board for a stop**.
2. Start typing in **Stop**, such as `Stephans`, and pick a suggestion. The list opens on the stops nearest your Home Assistant location, with their distances. To see every stop that matches, submit a partial name instead.
3. Pick the lines to track, check the update interval, and save.

| Field | Description |
|---|---|
| **Stop** | The stop to follow. Each stop is its own entry; add the integration again for another one. |
| **Lines to track** | The lines this stop's sensor reports. Lines that aren't running right now, such as NightLines during the day, can still be picked. At a stop the S-Bahn serves, its lines are listed too, marked *timetable only*. |
| **Update interval (seconds)** | How often the board refreshes. Default 60, from 30 to 600. |

To change the tracked lines later, select **Reconfigure** on the entry.

### Routes

A route plans connections between two stops with the Wiener Linien trip planner.

1. Add the integration again and choose **Route from A to B**.
2. Pick **From** and **To**. Both fields filter as you type, like the stop picker.
3. Choose how to plan, then save. The integration plans the route once before it saves, so a pair of stops the trip planner can't route is caught right away.

| Field | Default | Description |
|---|---|---|
| **From**, **To** | none | Where the trip starts and ends. They identify the route and can't change later: add a new route instead. |
| **Prefer** | Fastest trip | Fastest trip, fewest changes or least walking. |
| **Most changes** | No limit | Direct only, 1, 2, 3 or no limit. |
| **Walking speed** | Normal | How much time the trip planner allows for walking between platforms. |
| **Transfer buffer** | 2 min | Changes with less time to spare are marked tight. From 0 to 15 minutes. |
| **Avoid** | none | Leave out trains, S-Bahn, U-Bahn, trams or buses. |
| **Step-free** | off | Plan only with lifts or ramps instead of stairs and escalators, and with low-floor vehicles. |
| **Time-to-leave alert** | 5 min | How many minutes before the best connection leaves the **Time to leave** sensor turns on. From 1 to 30. |
| **Refresh from**, **Refresh until** | none | A time window, such as 06:30 to 09:00. Outside it the route makes no requests. Set both or neither. |
| **Refresh on** | every day | The days the window applies to. |
| **Update interval (seconds)** | 300 | How often the route refreshes, from 120 to 1800. It also refreshes right after its best connection leaves. |

To change the planning options later, select **Reconfigure** on the route's entry.

## Options

Under **Settings → Devices & services → Wiener Linien Austria**, select **Configure** on an entry:

| Option | Default | Description |
|---|---|---|
| **Update interval (seconds)** | 60 for a stop, 300 for a route | From 30 to 600 for a stop, and from 120 to 1800 for a route. |

## Entities

Each stop gets two entities, and each route three:

| Entity | Platform | For | Notes |
|---|---|---|---|
| Departures | `sensor` | stop | Minutes until the next departure. The attributes hold the whole board. |
| Departure data stale | `binary_sensor` | stop | On when the board has stopped being refreshed. |
| Next connection | `sensor` | route | The departure time of the best connection. The attributes hold up to four connections. |
| Connection at risk | `binary_sensor` | route | On when the current times say a change no longer fits. |
| Time to leave | `binary_sensor` | route | On from the set number of minutes before the next connection leaves until it leaves. |

Home Assistant names the entities in your interface language. If you're not sure which you have, check **Developer tools → States**:

| Entity | English install | German install |
|---|---|---|
| Departures | `sensor.<stop>_departures` | `sensor.<stop>_abfahrten` |
| Departure data stale | `binary_sensor.<stop>_departure_data_stale` | `binary_sensor.<stop>_abfahrtsdaten_veraltet` |
| Next connection | `sensor.<route>_next_connection` | `sensor.<route>_nachste_verbindung` |
| Connection at risk | `binary_sensor.<route>_connection_at_risk` | `binary_sensor.<route>_anschluss_gefahrdet` |
| Time to leave | `binary_sensor.<route>_time_to_leave` | `binary_sensor.<route>_zeit_zu_gehen` |

### Departures

| Attribute | Type | Notes |
|---|---|---|
| `state` (native value) | int \| None | Minutes until the next departure. `None` at end of service. |
| `attribution` | string | `Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0` |
| `diva` | int | The station's number, such as `60201012` for Stephansplatz. |
| `stop_name` | string | The station's name. |
| `latitude` / `longitude` | float \| None | The station's position, from the stop list. |
| `server_time` | ISO string \| None | `serverTime` from the last successful fetch. |
| `departures` | list[dict] | Up to 20 departures, soonest first. 20 is also the most the cards show, so nothing on screen is cut off. See *Departure shape*. |
| `next_by_line` | dict[str, int] | The earliest countdown per line, such as `{"U1": 2, "U4": 6}`. |
| `line_colors` | dict[str, dict] | The official colours per line, such as `{"U1": {"bg": "E20D17", "fg": "FFFFFF"}}`. |
| `lines_at_stop` | list[str] | Every line serving this stop in the timetable, running or not. |
| `tracked_lines` | list[str] | The lines tracked in this entry. The card editors offer only these. |
| `tracked_line_keys` | list[str] | Raw `{line}\|{direction}` keys. The modern, retro and flap card editors use them to offer only the directions this stop has. |
| `stale_departures` | int | Departures dropped in this poll because the feed stopped updating them. |
| `stale_since` | ISO string \| None | The newest planned time among those dropped: roughly when the feed froze. |
| `connection_lost_since` | ISO string \| None | When polling started failing, once two polls in a row have failed. The other attributes then hold the last board that arrived. `None` while polls succeed. |
| `traffic_info` | list[dict] | Disruptions. `category` says which feed a notice came from. `stoerunglang` matches your tracked lines. `stoerungkurz` is the stop's own display text, shown when it names one of this stop's platforms (RBLs) and one of your tracked lines, or names no line and the timetable has a tracked line calling at that platform. A notice with no lines of its own lists those tracked lines in `inferred_lines`, which the card shows as badges. Every `stoerungkurz` notice has the platform's station name in `location`. Fields: `name`, `title`, `description`, `description_html`, `related_lines`, `related_stops`, `inferred_lines`, `line_types`, `location`, `time_start`, `time_end`, `time_created`, `time_last_update`, `status`, `category`. |
| `elevator_info` | list[dict] | Lift outages on this stop's platforms. Fields: `name`, `station`, `description`, `reason`, `status`, `related_lines`, `related_stops`, `time_start`, `time_end`. |

`departures`, `next_by_line`, `line_colors`, `lines_at_stop`, `tracked_lines`, `tracked_line_keys`, `traffic_info` and `elevator_info` aren't recorded in history, since they are large at busy stops.

#### Departure shape

Each entry in `departures` has:

- The service: `line`, `towards`, `direction` (`"H"` or `"R"`) and `type` (`ptMetro`, `ptTram`, `ptBusCity` or `ptBusNight`).
- The timing: `countdown`, `time_planned` and `time_real` as ISO strings, and `realtime`.
- The vehicle and stop: `barrier_free`, `traffic_jam`, `platform` and `cooling`.

An S-Bahn departure has `type` `ptTrainS` and `timetable: true`. Its `countdown` runs off `time_planned`, `time_real` is `null`, and it leaves the list once its planned time has passed. Live departures have no `timetable` field.

When the timetable has a matching trip, `stops_ahead` lists the stops down to the terminus as `{name, is_terminus?, lines?}`. `lines` holds the other lines at each stop, S-Bahn included, which the card shows as transfer chips.

### Departure data stale

Turns on when the board stops being refreshed: a poll failed, or the last `serverTime` is older than three polling intervals. Its attributes give the reason: `server_time`, `seconds_since_server_time`, `stale_after_seconds` and `last_update_success`.

Use it in place of the departure sensor's availability. The departure sensor stays available through a short outage so your cards keep the last board instead of going blank, which means `is_state(..., 'unavailable')` and `availability_template` never fire for it.

### Next connection

| Attribute | Notes |
|---|---|
| `origin`, `destination` | Stop names. |
| `active` | `false` outside the refresh window. |
| `active_window` | The window you set: `from`, `to` and `days`, each `null` when unset. |
| `fetched_at` | When the trip planner last answered. |
| `arrival`, `duration_minutes`, `interchanges`, `risk` | The best connection's arrival, length, number of changes and worst change (`ok`, `tight` or `at_risk`). |
| `min_transfer_minutes`, `step_free` | The route's transfer buffer and step-free setting. |
| `trips` | Up to four connections, best first. See *Trip shape*. |
| `last_connection` | From 22:00 to 03:00, the night's last connection without a bus. |
| `line_colors` | The official colours of the lines the trips use. |
| `traffic_info` | Disruptions on those lines, shaped as on the departure sensor. |
| `elevator_info` | Lift outages at stations whose lifts the trips use, each with `stop_ids` naming those stations. Empty unless a trip lists lifts, which step-free trips do. |

`trips`, `last_connection`, `line_colors`, `traffic_info` and `elevator_info` aren't recorded in history.

`last_connection` has the same shape as a trip, or is `null`. The integration asks the trip planner to arrive by 04:00 with buses left out, and drops trips that wait for the first morning train. On nights the U-Bahn runs through (Friday, Saturday and before public holidays) it can be a U-Bahn shortly before 04:00.

#### Trip shape

Each connection in `trips`, `last_connection` and the `plan_trip` response has:

- `departure`, `arrival` (ISO times), `duration_minutes`, `interchanges`, `risk` and `cancelled`.
- `legs`: every ride and walk, in order.
- `transfers`: every change between two rides, with `at` (the stop), `walk_minutes`, `slack_minutes`, `risk` and `access`.

Each leg has:

- `walk` (`true` for a walk), `line`, `type` (such as `ptMetro` or `ptTrainS`), `product`, `towards` and `direction` (`H` or `R`).
- `origin` and `destination`, each with `name`, `stop_id`, `platform`, `planned`, `estimated` and `delay_minutes`.
- `stop_count`, `duration_minutes`, `walk_after_minutes` (the walk to the next ride) and `cancelled`.
- `stops`: the stops between boarding and getting off, each with `name`, `stop_id` and `time`.
- `realtime`: `true` when the ride has a live time. Its `estimated` departure is then live, and its arrival and `stops` times move by the same delay.
- `next_departures` (the next two, as ISO times) and `headway_minutes` (how often the line usually runs there), from the departure boards.
- `low_floor`: planned with a low-floor vehicle.
- `access`: the lifts and stairs on the leg's own walk, each with `kind` (such as `elevator` or `stairs`), `level` (`up` or `down`) and the station's `stop_id`. A change's `access` lists the ones between two rides. A lift outage in `elevator_info` is matched by station, so it can concern a different lift at the same station.

In `trips` and the `plan_trip` response, every stop on the Wiener Linien stop list also has `latitude` and `longitude`, whether it's a leg's `origin`, its `destination` or one of its `stops`. Other stops, such as S-Bahn-only stations, have neither.

### Connection at risk

Turns on only when the current times say a change no longer fits. A `tight` change doesn't count: the trip planner often plans changes with no time to spare, so the sensor would be on most of the day. Live times count for U-Bahn, tram and bus rides. They come from the departure boards, because the trip planner sends none. Attributes: `risk` (the best connection's grade), `transfer_at` and `slack_minutes` (where its tightest change is, and how many minutes it leaves).

### Time to leave

Turns on the set number of minutes before the next connection leaves, and off when it leaves. When connections run more often than that, the next one is already due as one leaves, so the sensor stays on. Attributes: `leave_at`, `departure`, `leave_minutes` and `lines`.

## Actions

### `wiener_linien_austria.plan_trip`

Plans connections for a route you've set up, or between any two stops, and returns them soonest first, in the same shape as the sensor's `trips` attribute.

| Field | Label | Required | Description |
|---|---|---|---|
| `config_entry_id` | Route | one of the two | The route to plan. |
| `origin`, `destination` | From, To | one of the two | Two stops, by name or DIVA number, instead of a route. |
| `datetime` | Time | no | When to leave. Leave empty for now. |
| `arrive_by` | Arrive by | no | Treat `datetime` as the latest arrival instead. Default `false`. |

```yaml
action: wiener_linien_austria.plan_trip
data:
  config_entry_id: 01J8EXAMPLEROUTEENTRY
  datetime: "2026-09-15 08:30:00"
  arrive_by: true
response_variable: plan
```

To plan between two stops, give `origin` and `destination` instead of a route, for example from a voice sentence like "how do I get from Stephansplatz to Westbahnhof". Trip options such as walking speed use their defaults.

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

The response's `origin` and `destination` hold the stop names that were picked, so a reply can say them back. If no stop matches, or a name fits several different stops, the action fails with a message that lists them. Use a longer name or the DIVA number then; a departure sensor has its stop's DIVA in the `diva` attribute.

Calling it again for the same route and time within a minute returns the same answer without a new request. A script can make 5 requests in a row, then about one a minute. Beyond that the action fails with a message saying when to try again. Automations, which run without a user, share one allowance. Targeting a departure board, or a route that isn't loaded, fails with a message saying so.

The cards plan trips and look up travel times through three WebSocket commands. If you write your own card, they are documented in [CONTRIBUTING.md](https://github.com/rolandzeiner/wiener-linien-austria/blob/main/CONTRIBUTING.md).

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

- The sentences are German, so set your Assist language to German, or write the sentences and replies in your own language.
- The reply gives the live departure time when there is one, otherwise the timetable time.
- If a name matches no stop or several, Assist gives the fallback reply. The automation's **Traces** show the action's message, including which stops a name matched.
- Spoken requests depend on your speech-to-text. Name matching allows for a wrong letter or a missing accent, but not a misheard word.

## Cards

The four cards install and register with the integration, and find your Wiener Linien sensors on their own. Add them to a dashboard with **Add card**. Each card checks its version and shows a reload banner when your browser holds an older copy, so hard-refresh the page (⌘⇧R or Ctrl⇧R) after an update.

| Card | Best for | Stops | Style |
|---|---|---|---|
| **Modern** | Everyday dashboard, all features | Several | Themed Home Assistant card |
| **Retro** | Wall tablets and entrance displays | One | Wiener Linien LED platform sign |
| **Flap** | Decorative boards | Several | Split-flap board |
| **Route** | "When do I leave?" at a glance | One route, or any two stops | Themed Home Assistant card |

### Modern card

The everyday departure board. In the card picker it's **Wiener Linien Austria**. It follows your theme, and each stop takes the colour of its next line.

- Several stops, stacked or in tabs, with up to 20 departures each and the next one shown large.
- Select a departure to see its stops down to the terminus, with transfer chips and, if you turn them on, estimated arrival times.
- A walking time per line hides departures you can't reach.
- A QR button encodes the stop's position for your phone.
- Disruption and lift notices fold out above the board.

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
| `show_departure_time` | `false` | Shows the estimated departure time next to the countdown, in the large next departure and in the list: the live time, or the scheduled one when there is no live data. A departure a minute or more late shows the scheduled time struck through, unless `show_delay` is off, and the expected one in red, unless `show_delay_colors` is off. |
| `show_stops_ahead` | `true` | Lets you expand a departure into its stops ahead. |
| `show_stop_times` | `false` | Shows an estimated arrival time beside each stop ahead: the live departure plus the scheduled travel time. A departure a minute or more late shows the scheduled arrival struck through, unless `show_delay` is off, and the expected one in red, unless `show_delay_colors` is off. Needs `show_stops_ahead`. *Data updates* says what it requests. |
| `stops_ahead_modes` | all | Which vehicle types get a transfer chip on the trail: `metro`, `sbahn`, `tram`, `badner`, `bus`, `night`. List only the ones you want. Needs `show_stops_ahead`. |
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

### Retro card

An LED panel modelled on the amber-on-violet signs above Wiener Linien platforms. In the card picker it's **Wiener Linien Austria — Retro**. Filter it to one line and the station name takes that line's colour, blue and yellow for NightLines.

- Three styles: classic, warm and dot matrix.
- A GLEIS or STEIG tile when the stop reports a platform.
- A station sign above the panel, with an exit, sign text, clock, date, WC, escalator and lift tiles, and your own icons and labels on either side.
- Any set of lines on one panel, each with its own direction, or every direction.
- A wheelchair race: when two or more departures are step free, a "3, 2, 1" countdown runs to a trophy finish. Tap to start it.
- A scrolling message every 5 minutes, between the live departures.

```yaml
type: custom:wiener-linien-austria-retro-card
entity: sensor.stephansplatz_departures
lines: [U1, U4]
direction: both
```

| Option | Default | Description |
|---|---|---|
| `entity` | first stop found | A stop's departure sensor. |
| `lines` | all lines | The lines to show, for example `[U1, U4]`. |
| `line` | all lines | A single line. The older spelling of `lines`, still read. |
| `direction` | `H` | `H`, `R`, or `both` for every direction. |
| `line_directions` | none | One direction per line, for example `{U1: R}`. Beats `direction` for that line. |
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
| `header_left`, `header_right` | none | What each side of the station sign shows. See *Station sign options*. |

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

### Flap card

A split-flap board whose characters flip one tile at a time to the next letter, like the mechanical boards in old European stations. In the card picker it's **Wiener Linien Austria — Flap Board**.

- Any number of stops on one board, 1 to 8 rows, sorted by countdown across all of them.
- Column headers *LINIE / RICHTUNG / STUFENLOS / GLEIS / ANKUNFT*. The platform column reads *STEIG* outside the U-Bahn and drops out when the stop reports no platform.
- A station-name band in the first tracked line's colour, any other tracked line's, or white or black.
- The same station sign as the retro card, in the board's colours.
- For a compact board, hide the line column on single-line boards, or drop the cabinet to mount it flush.

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
| `entities` | first stop found | The stops to merge onto the board. Each entry is a departure sensor, or an object with `entity`, `lines`, `direction`, `line_directions` and `walk_times`, as on the modern card. |
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
| `header_left`, `header_right` | none | What each side of the station sign shows. See *Station sign options* under the retro card. |
| `hide_attribution` | `false` | Hides the data-source credit. |

### Route card

The next connection for a route, or between any two stops you pick on the card, drawn the way the network map draws it. In the card picker it's **Wiener Linien Austria — Route**.

Pick a route you've set up (see *Routes* under *Setup*), and the card shows what its sensor reports. Leave the route empty and the card shows **From** and **To** pickers instead, and plans on the spot.

What the card shows:

- Minutes until the best connection leaves, with its departure and arrival time. For a trip at a chosen time, the departure time and day instead.
- Each ride as a segment in its line's colour, with platform, direction and number of stops. Before a change, the ride ends with its arrival time where you get off.
- A map pin after each boarding stop and the destination that opens the stop in Vienna's city map. Where you get off at a different stop from the one you change to, that stop gets a pin too. For a stop the city map can't place, such as an S-Bahn-only station, the pin searches OpenStreetMap.
- Tap the number of stops to see every stop of the ride with its time. Live delays move these times too.
- A live icon next to a U-Bahn, tram or bus departure with a live time. A late one also shows its planned time struck through and the expected time in red, for example ~~09:22~~ 09:25. A line running every 5 minutes or more often shows *every 3 min*; a less frequent one shows its next two departures. S-Bahn and train rides stay on the timetable.
- For every change, the walking time and a grade, written out as well as coloured: enough time, tight, or at risk when the current times say the change no longer fits.
- Disruptions on the lines the trip uses.
- On a step-free trip, each lift on the way to the platform, at a change and at the destination, for example *Lift down*. A lift with an outage says *out of service*, and a warning names the station, the lift and the reason, so you can tell an exit you don't use from the one on your way. Rides planned with a low-floor vehicle show a wheelchair icon.
- Up to three later connections, folded away. Tap one to see its rides, stops and changes.
- For a route, from 22:00, the night's last connection without a night bus, for example *Last connection without night bus 00:20*.
- When the trip planner last answered, next to the heading (*Zuletzt aktualisiert* on a German install), so an old plan on screen can't pass for a fresh one.

Picking stops on the card:

- Type to narrow the list. Case and accents don't matter, so `wahringer strasse` finds Währinger Straße. The stops nearest your Home Assistant location come first.
- **Swap** start and destination with one tap. The connections appear as soon as both stops are set.
- Plan for **Now**, or pick a date and time with **Depart at** or **Arrive by**. Times are Vienna time, like the signs at the stop. After a reload the card starts at **Now** again.
- With `replan_from_change` on, each change gets a **Search from here** button that looks up what else leaves that station, timed for when you'd get there. The trip planner keeps one onward ride per connection, so turn this on if your changes are often tight. One tap goes back to the journey you entered.
- The card remembers your last pick on each device. In the card editor you can also preselect a start and destination.

With a route:

```yaml
type: custom:wiener-linien-austria-route-card
entity: sensor.home_work_next_connection
```

Without a route, preselecting Hauptbahnhof to Gregorygasse:

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
| `replan_from_change` | `false` | Adds a **Search from here** button at each change, when there's no `entity`. |

## Data updates

Four live endpoints and five static files, each on its own schedule:

| What | Endpoint | Cadence |
|---|---|---|
| Live departures | `/monitor?stopId=…` | One request per interval group, default 60 s (30–600 s) |
| Disruption, stop and lift notices | `/trafficInfoList` (`stoerunglang`, `stoerungkurz` and `aufzugsinfo` in one request) | Every 5 min, shared by all entries. From the second failed request in a row the wait doubles, up to about 30 min, until it answers again |
| Stop list | `wienerlinien-ogd-haltestellen.csv` + `-haltepunkte.csv` | Weekly, counted from the last download, cached in Home Assistant's storage |
| Line list and trip patterns | `wienerlinien-ogd-linien.csv` + `-fahrwegverlaeufe.csv` | Weekly, cached. Used for the stops-ahead trail |
| Line colours | `gtfs/routes.txt` | Weekly, cached. Used for `line_colors` |
| Planned S-Bahn departures | `ogd_routing/XML_DM_REQUEST` | Only for stops with an S-Bahn line picked: the next 60 trains with their stops, fetched again after 2 h or once your picked lines have fewer than 6 trains left, never more often than every 5 min. After a failed request the wait doubles, up to 30 min, until it answers again. Counted down locally in between, and shares the routes' 15 s cooldown slot |
| S-Bahn lines per stop | `ogd_routing/XML_DM_REQUEST` | Weekly, cached: 40 trains with their stops at each of 7 hub stations, for the S-Bahn transfer chips. Checked daily, so a failed station is retried the next day. Only with a departure board set up; shares the routes' 15 s cooldown slot |
| Travel times to the stops ahead | `ogd_routing/XML_DM_REQUEST` | Only with `show_stop_times` on, and only when you open a stops-ahead trail: the next 60 departures at that stop with their stops, which covers every line there in one request. Kept for a week per stop, cached in Home Assistant's storage |
| Route connections | `ogd_routing/XML_TRIP_REQUEST2` | Per route, default 300 s (120–1800 s), only inside its refresh window. Pulled forward to 32–60 s after the best connection leaves, at a random moment so installs don't all ask at once, but never sooner than 60 s after the last refresh |
| Connections between any two stops | `ogd_routing/XML_TRIP_REQUEST2` | On demand from the route card and `plan_trip`. The card refreshes every 120 s while visible, or 32–60 s after the best connection leaves when that comes first (never within 60 s of its last refresh), every 10 min for a plan at a chosen time, and pauses after 30 min idle. Answers reused for 1 min; at most 60 requests/h per user and 120/h per Home Assistant |
| Last connection of the night | `ogd_routing/XML_TRIP_REQUEST2` | One request per route per night, at its first refresh between 22:00 and 03:00. Not retried if it fails |
| Live times on connections | `/monitor?stopId=…` | Rides in the departure boards' request. A request of its own only for a stop that has no answer yet, or when no departure board is set up (then once per route refresh, shared by all routes for 1 min) |

### Departures and notices

The polling interval is set per entry, but the request isn't per entry. All entries with the same interval form one group that sends a single `/monitor` request for all their stops and splits the answer. Adding stops at an interval you already use costs no extra requests.

The five static files also refresh together, once a week. The week counts from the last download, not from the last restart: their age is checked once a day, and once more 5 to 60 minutes after Home Assistant starts, at a random moment so installs that restart together don't download together. A failed refresh is tried again at the next check.

Scheduled requests share a 15 s cooldown across all entries, plus a 30 s minimum per entry. That covers the departure poll, the notices, a route's own live-times request and the weekly static download, which takes one slot for all five files. The requests the setup dialog makes while you pick lines or save a route skip the cooldown: the line check on `/monitor`, the S-Bahn line check and the route's test plan. Each runs once per step while you watch the dialog, and waiting would stall it to save a single request. The 15 s floor matches the minimum interval usually cited for the open-data real-time endpoint. Wiener Linien publish no numeric limit, so it's a convention, not a rule.

Responses arrive gzip-compressed, which does most of the work: a 60-stop `/monitor` response measures 345,872 bytes raw against 20,894 on the wire. Requests send no conditional-GET validators, because the upstream can't answer them. `/monitor` and `/trafficInfoList` return no `ETag` or `Last-Modified` at all, and the static CSVs return both but ignore them, answering `200` even to `If-None-Match: *`. Every request carries an identifying User-Agent (`HomeAssistant/{ver} wiener_linien_austria/{ver}`), so Wiener Linien can tell this integration's traffic apart and throttle it on its own.

After a Home Assistant restart, departures load right away. The notices (`traffic_info` and `elevator_info`) follow within 5 minutes.

### Routes and trip planning

The trip planner is a separate Wiener Linien service, so route refreshes take their own 15 s cooldown slot and never delay a departure poll. A route also refreshes right after its best connection leaves, so the list moves on without a faster interval. Like departures, it backs off from the second failure in a row, up to 30 minutes.

Live times on routes cost no extra polling. A route, or a plan on the card, adds its boarding stops to the departure boards' combined `/monitor` request, so live times follow the boards' interval without asking the trip planner again. A new plan makes one request of its own only when its stops have no answer yet. Without any departure board, a route refresh makes that request itself, in the 15 s cooldown slot, and one answer serves every route for a minute. If it fails, the plan stays on the timetable.

Planning between any two stops, on the route card or with `plan_trip`, skips the cooldown because someone is waiting for the answer. Requests go through Home Assistant, never from the browser to Wiener Linien. Three other limits keep them in check: an identical request within a minute gets the same answer, a request already under way is shared, and each Home Assistant user gets at most 60 trip-planner requests an hour, all users together 120. Several tablets signed in as the same user share one allowance. Once a user's requests are used up, the card keeps showing its last plan for up to 5 minutes and says so. The card stops refreshing after 30 minutes without a tap or key press, so a wall tablet left open stops asking. Plans stay in memory for 5 minutes at most and are dropped when you remove the integration. The integration doesn't write stop pairs to diagnostics, the recorder or its log.

### Arrival times on the trail

With `show_stop_times` on, opening a trail asks the timetable once for the whole stop, every line and direction, and keeps the answer for a week. That's about one request a week per stop. Trams and buses are timetabled a few minutes slower by day than in the evening, so the daytime answer (06:00 to 19:00) and the evening one are kept apart, and a second request happens only if you open a trail in the other part of the day. A line neither answer holds costs one more request, once. A stop whose trail nobody opens is never asked for.

Nothing here runs on the clock except the switch between the two parts of the day. An answer stays valid for up to 15 minutes past it, picked at random, so installs with a trail open at 06:00 or 19:00 don't all ask at once. The request skips the cooldown, because someone is waiting for the times. A failed one is retried no sooner than 5 minutes later, doubling up to 30.

### When Wiener Linien fails

A single failed poll keeps the interval and serves the last successful board. The *Departure data stale* sensor catches that, or compare `server_time` to `now()` in a template. From the second failure in a row the interval doubles each time, up to 30 minutes, until a fetch succeeds. Because the request is shared, the backoff applies to the whole interval group.

Rate-limit error 316 widens the interval on the first failure instead, since the upstream has already said the polling is too fast. It also raises a repair issue per entry, which clears itself once the API recovers.

After 10 minutes of server errors from Wiener Linien, a repair issue says the fault is on their side, and it clears itself once departures return. The boards then show *Can't reach Wiener Linien* in place of an empty board. Only an entry that has never fetched successfully becomes unavailable.

## Examples

- Get a notification when the next U1 toward Leopoldau is less than 3 minutes away.
- Turn on the hall light when your tram is approaching.
- Track two nearby stops and take whichever leaves sooner.
- Set up your commute as a route with a weekday morning window, and get a notification when a delay puts your change at risk.
- Ask Assist "wie komme ich von Stephansplatz nach Westbahnhof" and hear which line to take (see *Ask Assist for a trip*).

Get a notification when the next departure at a stop is less than 3 minutes away:

```yaml
alias: "Train coming, leave now"
triggers:
  - trigger: numeric_state
    entity_id: sensor.stephansplatz_departures
    below: 3
actions:
  - action: notify.mobile_app_phone
    data:
      title: "Next departure at Stephansplatz"
      message: >
        {% set next = state_attr('sensor.stephansplatz_departures', 'departures')[0] %}
        {{ next.line }} → {{ next.towards }} in {{ next.countdown }} min
```

<details>
<summary>Blueprint: notify your phone when it's time to leave</summary>

Save it as `blueprints/automation/wiener_linien_austria/time_to_leave.yaml` in your configuration folder, reload automations, then create an automation from it under **Settings → Automations & scenes → Blueprints**.

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

</details>

<details>
<summary>Get a notification when a delay puts your commute's change at risk</summary>

```yaml
alias: "Commute change at risk"
triggers:
  - trigger: state
    entity_id: binary_sensor.home_work_connection_at_risk
    to: "on"
actions:
  - action: notify.mobile_app_phone
    data:
      title: "Your change is at risk"
      message: >
        {{ state_attr('binary_sensor.home_work_connection_at_risk', 'transfer_at') }}:
        {{ state_attr('binary_sensor.home_work_connection_at_risk', 'slack_minutes') }} min to spare
```

</details>

<details>
<summary>Template sensor: the next U1 toward Leopoldau</summary>

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

</details>

## Known limitations

- **Wiener Linien stops only.** Departure boards, and a route's start and destination, use stops from the Wiener Linien stop list. A station served only by the S-Bahn can't be picked.
- **S-Bahn shows timetable times, not live ones.** There is no live data for the S-Bahn, so a departure board can't show delays, cancellations or platform changes for it, and a late train leaves the board at its planned time. On a route, S-Bahn and train rides keep their timetable times too.
- **No S-Bahn between Praterstern and Hauptbahnhof until the end of October 2027.** ÖBB has closed this stretch for construction since 7 September 2026, so Wien Mitte, Rennweg and Quartier Belvedere have no S-Bahn lines to pick, and routes don't use it. The lines return to the picker once trains run there again. Regional trains (REX, R, CJX) aren't in the departure data at all.
- **Routes run from stop to stop.** Start and destination are stops, not addresses, and the trip planner decides the walking between platforms.
- **Live times on routes come from the departure boards.** The trip planner sends none, so a ride gets its live time from `/monitor`, which lists about the next hour. Rides more than about an hour away stay on the timetable. `/monitor` has no arrival times, so a ride's arrival moves by its departure delay.
- **The route card's last pick stays on that device.** It's saved in the browser, not in Home Assistant, so a phone and a wall tablet each remember their own. Two route cards without a route on the same device share that pick.
- **New stops can take a week to appear.** The stop list refreshes weekly.
- **Arrival times on the trail are estimates.** They add the timetable's travel time to the departure's live time, so a delay the vehicle picks up further down the line isn't in them. They're usually within a minute or two; the far end of a long tram or bus line can be off by a few minutes, because its timetable changes through the day. A line the timetable doesn't list at your stop shows no times.
- **The stops ahead are best effort.** Short-turn services may show the full scheduled path. Replacement buses (SEV) and unscheduled detours have no trail, so their row doesn't expand.

## Troubleshooting

- **"Cannot reach the Wiener Linien real-time API" during setup.** The integration asks `/monitor` which lines serve the stop before it lists them. Either the API is down or your Home Assistant host can't make outbound HTTPS requests. Try again in a minute.
- **"Can't reach the Wiener Linien trip planner" when adding a route.** The integration plans the route once before saving. The trip planner runs separately from the departure API, so one can be down while the other works. Try again in a minute.
- **"No stop matches that."** Try a shorter or partial name: `Karls` matches Karlsplatz, Karlskirche and more. Search ignores case, but umlauts matter.
- **A route shows "Outside the refresh window".** That's the window you set, not an error. Change it with **Reconfigure**.
- **The route card says "Too many route requests right now".** The card has used up its trip-planner requests for the moment. Each Home Assistant user gets 60 an hour, so tablets signed in as the same user share one allowance. The card tries again on its own once a request is free, usually within a minute.
- **The route card says "Updates paused".** Nobody has touched the card for 30 minutes. Tap it, or select **Resume updates**, and it plans again.
- **Repair issue "Wiener Linien isn't delivering departures".** The Wiener Linien real-time service has answered with errors (HTTP 5xx or unreadable data) for more than 10 minutes. Nothing on your side needs fixing: departures come back on their own, and the issue clears itself with the first good answer. Timeouts and connection errors don't count toward it, because those can come from your own network.
- **A board says *Can't reach Wiener Linien* or *No connection*.** Home Assistant has missed the last two answers from Wiener Linien, or hasn't had one since it started. Check **Settings → Repairs**. If the outage issue is there, the fault is on Wiener Linien's side. If it isn't, check that your Home Assistant host can reach the internet.
- **Repair issue "Wiener Linien rate limit hit".** Usually several Home Assistant instances behind one public IP share the open-data allowance. Raise the update interval, or put your stops on the same interval so they share one request: adding stops at an interval you already use costs nothing, while each new interval starts its own requests. Or ignore it; the integration recovers on its own.
- **Bug reports.** Go to **Settings → Devices & services → Wiener Linien Austria**, open the entry's menu and select **Download diagnostics**. The file has the attribution, the stop's platform numbers (RBLs), the last error code and the polling timings, and no personal data.
- **Debug logging.** Add this to `configuration.yaml`, restart, and reproduce the problem:

  ```yaml
  logger:
    default: info
    logs:
      custom_components.wiener_linien_austria: debug
  ```

## Removal

1. Go to **Settings → Devices & services → Wiener Linien Austria**, open the entry's menu and select **Delete**.
2. To uninstall, go to **Settings → Marketplace**, open **Wiener Linien Austria**, then ⋮ → **Uninstall**. Restart Home Assistant when a repair asks you to. On Home Assistant older than 2026.11, remove it in HACS. For a manual install, delete `config/custom_components/wiener_linien_austria/`.

## Attribution

Every sensor, every diagnostics download and the cards' footer carry:

> Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0

In full: Wiener Linien GmbH & Co KG. The departure, stop, line and trip-planner data come from [Wiener Linien open data](https://www.wienerlinien.at/open-data), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), whose only condition is attribution. If you build your own card or dashboard on this data, keep the credit visible.

The cards' fonts *WL Sans*, *WL Sans Condensed* and *WL Mono* are subsets of [TeX Gyre](https://www.gust.org.pl/projects/e-foundry/tex-gyre) Heros, Heros Cn and Cursor by Bogusław Jackowski and Janusz M. Nowacki for GUST. They ship under the [GUST Font License](https://github.com/rolandzeiner/wiener-linien-austria/blob/main/custom_components/wiener_linien_austria/www/fonts/GUST-FONT-LICENSE.txt) (LPPL 1.3c or later) and were renamed, as the licence asks of derivatives. Their origin, the exact subset and how to rebuild them are in [NOTICE.md](https://github.com/rolandzeiner/wiener-linien-austria/blob/main/custom_components/wiener_linien_austria/www/fonts/NOTICE.md).

## License

MIT, see [LICENSE](https://github.com/rolandzeiner/wiener-linien-austria/blob/main/LICENSE).

Dev setup, tests and the verification gate: [CONTRIBUTING.md](https://github.com/rolandzeiner/wiener-linien-austria/blob/main/CONTRIBUTING.md).

## Disclaimer

This integration is not affiliated with or endorsed by Wiener Linien GmbH & Co KG. Departure, stop and route data comes from [Wiener Linien open data](https://www.wienerlinien.at/open-data) under CC BY 4.0. **Departures can be late, cancelled or diverted at short notice, and the data can lag behind. Check the displays at the stop before you rely on a connection.** The developer assumes no liability for the accuracy, completeness or timeliness of the displayed data. Use at your own risk.

---

Diese Integration steht in keiner Verbindung zur Wiener Linien GmbH & Co KG und wird von ihr nicht unterstützt. Abfahrts-, Haltestellen- und Routendaten stammen von [Wiener Linien Open Data](https://www.wienerlinien.at/open-data) und stehen unter CC BY 4.0. **Abfahrten können sich kurzfristig verspäten, ausfallen oder umgeleitet werden, und die Daten können nachhinken. Schau auf die Anzeigen an der Haltestelle, bevor du dich auf eine Verbindung verlässt.** Für die Richtigkeit, Vollständigkeit und Aktualität der angezeigten Daten wird keine Haftung übernommen. Nutzung auf eigene Verantwortung.
