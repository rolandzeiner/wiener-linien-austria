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

Done: escalator outages (`fahrtreppeninfo`) ride in the same
`/trafficInfoList` request as the lifts. With them: an outage that names
no platforms now needs its station to be the stop's own (a lift at
Bahnhof Meidling was on every U6 stop), and a lift or escalator only
announced for a later day says "Geplant ab …".

Done: the fair-use rule (15 s between requests, only the stops needed, an
IP may be blocked) is written on the dataset page, and the README, the
comments and the UI strings now say so instead of "convention".

Could add, all in requests the integration already makes:

- [ ] **Group follow-up messages by `parentName`.** A follow-up is named
  `I20261114-0026-F01` and carries `parentName` `I20261114-0026`; the
  first message has both equal. Check whether the list ever holds a
  message and its follow-up at once, and if so show one disruption once.
  It didn't in either request of 14.11.2026; the evening one had no
  follow-up at all (5 disruptions, each its own parent).
- [ ] **A structured cause: `reasonName`, `alertCause`.** Each notice
  carries a coarse English category (`alertCauseId` / `alertCause`) and
  Wiener Linien's own finer German reason (`reasonId` / `reasonName`).
  The cards pick a cause icon from the wording (`REASON_ICONS` in
  `src/utils/traffic-notice.ts`): from the description's "Grund:" line,
  and since 14.11.2026 from the title ("25: Rettungseinsatz") when the
  description has none, with Falschparker added. That covered all 8
  active disruptions of that day, one more than the new fields would
  have, so the fields are only worth reading if titles turn up that name
  no cause. The
  documentation spells one field `alterCause`; the API sends `alertCause`,
  and gives no list of values. See the table below for what was seen.

  Seen on 14.11.2026 in three `/trafficInfoList` requests and one
  `/newsList` (about 300 notices): 8 categories and 11 reasons. The ids
  run to 258, so this is a small part of the list; collect them for a few
  weeks before fixing a mapping. Icon names checked against MDI 7.4.47,
  the set Home Assistant ships.

  | `alertCauseId` | `alertCause` | `reasonId` | `reasonName` | Seen in | Icon |
  |---|---|---|---|---|---|
  | 14 | emergency medical services | 9 | Rettungseinsatz | disruptions | `mdi:ambulance` (as today) |
  | 77 | accident | 12 | Verkehrsunfall | disruptions | `mdi:car-emergency` (as today) |
  | 77 | accident | 13 | Fremder Verkehrsunfall | disruptions | `mdi:car-emergency` (as today) |
  | 71 | vehicle on the line | 25 | Falschparker | disruptions | `mdi:tow-truck` (as today) |
  | 3 | police activity | 47 | Polizeieinsatz | disruptions | `mdi:police-badge` (as today) |
  | 45 | construction work | 21 | Bauarbeiten | disruptions (documentation), news | `mdi:excavator` (as today) |
  | 45 | construction work | 27 | Gleisbauarbeiten | disruptions, news | `mdi:excavator` (as today) |
  | 120 | special event | 35 | Veranstaltung | news | `mdi:account-group` (as today) |
  | 0 | unknown | 223 | Haltestellenverlegung | news | `mdi:bus-stop`; none today |
  | 255 | undefined alert cause | 258 | Netzänderung | news | `mdi:transit-detour`; none today |
  | 255 | undefined alert cause | 0 | undefined | every lift, escalator and `stoerungkurz` notice, some disruptions, most news | none: keep today's icon |

  On the 11 distinct disruptions of that day (8 active, 3 resolved; the
  backend keeps only the active ones), before the title was read:

  | | of 8 active | of all 11 |
  |---|---|---|
  | Cause icon from the "Grund:" line | 3 | 4 |
  | Cause icon from `reasonId` alone | 6 | 9 |
  | Both together | 7 | 10 |

  `reasonId` is no replacement for the text: "25, 26, 27:
  Gleisbauarbeiten" has a "Grund:" line but `reasonId` 0, and "26E:
  Gleisbauarbeiten" has neither, only the title.

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
- [ ] **Escalators on the route card.** The stop sensors publish
  `escalator_info` since 14.11.2026 and the modern card shows it
  (`show_escalator_info`). A trip's steps name escalators too (`kind`
  `escalator`); the route card could flag a broken one as it does a lift.
- [ ] **`elevatorId`.** On lift notices, e.g. "JS 02". A stable id per
  lift, if `elevator_info` ever needs to tell two lifts of a station apart.
- [ ] **The `/version` endpoint.** Gives the current version, its history
  and a `comingSoon` entry (V1.7.0 that day, with placeholder text only).
  An occasional check could log or raise a repair when the version moves,
  before a change surprises the parser. Decide how often; once a day would
  be plenty.

Documented in V1.6 but empty in that request, so not usable yet:

- [ ] **English notice texts (`languageId=en`, `languages`).** `languages`
  was null on all 32 notices with `languageId=en` sent, and on all 63 of
  a second request that evening. Ask again in a few weeks; if it fills,
  the English cards could show English notices.
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
