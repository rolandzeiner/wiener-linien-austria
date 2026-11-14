# Open checks from the 2.4.0 audit

Left over from the audit of `audit/2.4.0-fixes` on 14.11.2026. Each needs
something a cloud session doesn't have: a running Home Assistant, a real
device, or a document it couldn't open. Delete this file once they're done.

## Needs a running Home Assistant

- [ ] **Count the real upstream requests for 24 h.** The audit only
  simulated them from the scheduling rules, with a guessed timetable:
  about 2,100 a day for one stop (60 s) and one route (300 s), split
  1,440 `/monitor`, 288 `/trafficInfoList`, about 366 trip planner.
  Log the outbound requests per endpoint for a day and compare. Look for
  what the rules don't predict: retries, restarts, a second request per
  rollover.

## Needs a real device

- [ ] **Route card in the Companion app on Android.** The stale note
  ("Älterer Stand von 07:49") and the pager note were checked in desktop
  Chromium only, at 280 to 400 px, in German and English, with icon
  placeholders. Check the same on a phone in the Android System WebView,
  with the real icons: the stale note on one line, the pager note on two
  at most.
- [ ] **A view change during an outage.** `7aa5963` keeps an error's
  countdown when the card is taken out and put back. Tested by detaching
  the element; confirm on a dashboard that switching views and leaving
  edit mode behave the same, and that the countdown goes on from where it
  was.
- [ ] **A wall tablet left alone.** `6362fff`: after 30 minutes without a
  tap the card says "Aktualisierung pausiert" and nothing else, also once
  every connection of the plan has left. Confirm on the tablet.

## From the open-data check of 14.11.2026

The real-time API went to V1.6.0 on 19.10.2026 (the maintenance). Sources:
the documentation V1.6
(<https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-echtzeitdaten-dokumentation.pdf>),
`https://www.wienerlinien.at/ogd_realtime/version?history=1`, and the
dataset on data.gv.at
(<https://www.data.gv.at/katalog/datasets/cfba4373-a654-3e0b-80f8-348738169f95>).
Every figure below is from one live `/trafficInfoList` request that day
(32 notices). Check each against a few more days before building on it.

Done: the fair-use rule (15 s between requests, only the stops needed, an
IP may be blocked) is written on the dataset page, and the README, the
comments and the UI strings now say so instead of "convention".

Could add, all in requests the integration already makes:

- [ ] **Escalator outages (`fahrtreppeninfo`).** 16 notices that day,
  the same shape as `aufzugsinfo`. `alerts.py` already names it as a later
  change: it needs sensor attributes, translations and card rendering.
  Check first how many a stop gets on a normal day, so the card isn't
  flooded.
- [ ] **Group follow-up messages by `parentName`.** A follow-up is named
  `I20261114-0026-F01` and carries `parentName` `I20261114-0026`; the
  first message has both equal. Check whether the list ever holds a
  message and its follow-up at once, and if so show one disruption once.
- [ ] **A structured cause: `reasonName`, `alertCause`.** Each notice
  carries a coarse English category (`alertCauseId` / `alertCause`) and
  Wiener Linien's own finer German reason (`reasonId` / `reasonName`).
  The cards already pick a cause icon, but from the wording of the
  description's "Grund:" line (`REASON_ICONS` in
  `src/utils/traffic-notice.ts`); these fields would cover the notices
  that have no such line. The
  documentation spells one field `alterCause`; the API sends `alertCause`,
  and gives no list of values. See the table below for what was seen.

  Seen on 14.11.2026 in two `/trafficInfoList` requests and one
  `/newsList` (about 240 notices): 7 categories and 10 reasons. The ids
  run to 258, so this is a small part of the list; collect them for a few
  weeks before fixing a mapping. Icon names checked against MDI 7.4.47,
  the set Home Assistant ships.

  | `alertCauseId` | `alertCause` | `reasonId` | `reasonName` | Seen in | Icon |
  |---|---|---|---|---|---|
  | 14 | emergency medical services | 9 | Rettungseinsatz | disruptions | `mdi:ambulance` (as today) |
  | 77 | accident | 12 | Verkehrsunfall | disruptions | `mdi:car-emergency` (as today) |
  | 77 | accident | 13 | Fremder Verkehrsunfall | disruptions | `mdi:car-emergency` (as today) |
  | 71 | vehicle on the line | 25 | Falschparker | disruptions | `mdi:tow-truck` (or `mdi:car-off`); none today |
  | 45 | construction work | 21 | Bauarbeiten | disruptions (documentation), news | `mdi:excavator` (as today) |
  | 45 | construction work | 27 | Gleisbauarbeiten | disruptions, news | `mdi:excavator` (as today) |
  | 120 | special event | 35 | Veranstaltung | news | `mdi:account-group` (as today) |
  | 0 | unknown | 223 | Haltestellenverlegung | news | `mdi:bus-stop`; none today |
  | 255 | undefined alert cause | 258 | Netzänderung | news | `mdi:transit-detour`; none today |
  | 255 | undefined alert cause | 0 | undefined | every lift, escalator and `stoerungkurz` notice, some disruptions, most news | none: keep today's icon |

  Against today's behaviour, on the 11 distinct disruptions of that day
  (8 active, 3 resolved; the backend keeps only the active ones):

  | | of 8 active | of all 11 |
  |---|---|---|
  | Cause icon today, from the "Grund:" line | 3 | 4 |
  | Cause icon from `reasonId` alone | 6 | 9 |
  | Both together | 7 | 10 |
  | Newly given an icon | 4 | 6 |

  The ones gained are follow-ups whose text no longer names the cause:
  "25: Rettungseinsatz" with the description "Nach einer Fahrtbehinderung
  kommt es zu unterschiedlichen Intervallen", and "60: Falschparker",
  which `REASON_ICONS` has no pattern for. One notice went the other way:
  "25, 26, 27: Gleisbauarbeiten" has a "Grund:" line but `reasonId` 0, so
  the text has to stay as the fallback. "26E: Gleisbauarbeiten" has
  neither. A cheaper half-step without the new fields: run `REASON_ICONS`
  over the title when the description has no "Grund:" line, and add
  Falschparker to it; on that day it would have given the same 7 of 8.

  Things to settle:
  - Map by `reasonId`, with `alertCauseId` as the fallback for a reason
    not in the table. Two rows show why: Haltestellenverlegung and
    Netzänderung have a reason but "unknown" / "undefined" as category.
  - An id not in the table, and 255 / 0, keep the icon the card uses
    today (`mdi:alert-outline` and its relatives), so a new value never
    leaves a notice without one.
  - Whether the ids are stable. Only the pairs above were seen; nothing
    says the numbers won't move between releases, so key on the id and
    keep the name in a comment and a test fixture.
  - The cards read `/trafficInfoList` only. The three news-only rows
    matter once `/newsList` texts are shown beyond the works notices.
- [ ] **`elevatorId`.** On lift notices, e.g. "JS 02". A stable id per
  lift, if `elevator_info` ever needs to tell two lifts of a station apart.
- [ ] **The `/version` endpoint.** Gives the current version, its history
  and a `comingSoon` entry (V1.7.0 that day, with placeholder text only).
  An occasional check could log or raise a repair when the version moves,
  before a change surprises the parser. Decide how often; once a day would
  be plenty.

Documented in V1.6 but empty in that request, so not usable yet:

- [ ] **English notice texts (`languageId=en`, `languages`).** `languages`
  was null on all 32 notices with `languageId=en` sent. Ask again in a few
  weeks; if it fills, the English cards could show English notices.
- [ ] **`relatedLinesDetails.relatedStops`, `scenarioId`,
  `scenarioName`.** Not in that request; `relatedLinesDetails` had only
  `lineId`, `lineName` and `vehicleType`.

Checked, nothing to do:

- XML responses were removed in V1.6. The integration asks for JSON only.
- `cooling` and `onStop` (V1.5.0, 21.05.2026) are already read.
- data.gv.at lists 17 Wiener Linien datasets. Only the real-time one
  changed recently (12.10.2026). No GTFS-Realtime, no vehicle positions.
- Of the open-data CSVs the integration leaves three alone:
  `-verbindungen`, `-gps-punkte` (the lines' geometry, about 70,000 rows)
  and `-steige`. None is new.

## Not looked at yet

- [ ] **"Last connection of the night" on weekend nights.** It asks once
  between 22:00 and 03:00 for a trip arriving by 04:00
  (`route_coordinator.py`, `LAST_CONNECTION_*`). On Friday and Saturday
  nights and before public holidays the U-Bahn runs through, so there may
  be no last connection to show. Read the code and its tests for what the
  card says then. This one needs no device; it just wasn't done.
