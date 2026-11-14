# Open checks from the 2.4.0 audit

Left over from the audit of `audit/2.4.0-fixes` on 14.11.2026. Delete this
file once the two checks are done.

## Needs a running Home Assistant

- [ ] **Count the real upstream requests for 24 h.** The audit only
  simulated them from the scheduling rules, with a guessed timetable:
  about 2,100 a day for one stop (60 s) and one route (300 s), split
  1,440 `/monitor`, 288 `/trafficInfoList`, about 366 trip planner.
  `api.py` logs one debug line per request ("GET <url>"). Set
  `custom_components.wiener_linien_austria.api` to debug with
  `logger.set_level` (it lasts until the next restart), count the lines
  per endpoint after a day and compare. Look for what the rules don't
  predict: retries, restarts, a second request per rollover.

## Needs a real device

- [ ] **Route card in the Companion app on Android.** The stale note
  ("Älterer Stand von 07:49") and the pager note were checked in desktop
  Chromium only, at 280 to 400 px, in German and English, with icon
  placeholders. Check the same on a phone in the Android System WebView,
  with the real icons: the stale note on one line, the pager note on two
  at most.

## Not built, on purpose (open-data check of 14.11.2026)

- Grouping follow-up messages by `parentName`: in three requests the
  list never held a message together with its follow-up.
- The `/version` endpoint: an extra request a day to announce a change
  the parser already tolerates.
- English notice texts (`languageId=en`): `languages` was null on all 95
  notices asked for. Nothing to show until Wiener Linien fill it.
- `relatedLinesDetails.relatedStops`, `scenarioId`, `scenarioName`:
  documented in V1.6, not sent.
- A cause the icon table doesn't know shows with the neutral icon. Add
  its wording to `REASON_ICONS` in `src/utils/traffic-notice.ts` when one
  turns up; the sensors publish it as `reason`.
