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

## Needs a source the session couldn't read

- [ ] **Is there a written request limit?** The 15 s floor in
  `rate_limit.py` is a convention; no official number was found. Read the
  current real-time documentation
  (<https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-echtzeitdaten-dokumentation.pdf>)
  and the terms on <https://www.wienerlinien.at/open-data>. If they name
  an interval or a limit, bring `const.py`, the README's *Data updates*
  and CONTRIBUTING in line.

## Not looked at yet

- [ ] **"Last connection of the night" on weekend nights.** It asks once
  between 22:00 and 03:00 for a trip arriving by 04:00
  (`route_coordinator.py`, `LAST_CONNECTION_*`). On Friday and Saturday
  nights and before public holidays the U-Bahn runs through, so there may
  be no last connection to show. Read the code and its tests for what the
  card says then. This one needs no device; it just wasn't done.
