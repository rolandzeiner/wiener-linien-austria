# Handoff: Wiener Linien Austria v2.0.0 — unified card-editor system

## Overview

Redesign of the three Lovelace card configuration editors shipped by the **Wiener Linien
Austria** HACS integration (Modern, Retro, Flap). One shared spatial grammar, one component
set, three configured instances. The cards themselves are unchanged — this covers only the
editor that opens in the left column of Home Assistant's card-editor dialog.

The design answers four briefed problems: three divergent architectures, inconsistent option
vocabulary, an unstructured endless scroll, and the ~20-row nested "station header strip"
form.

## About the design files

`Editor System.dc.html` in this bundle is a **design reference created in HTML** — a
clickable prototype of look and behaviour, not production code to copy. The task is to
recreate it in the integration's real environment: **Lit 3 + TypeScript inside Home
Assistant**, using HA's own form controls (`ha-form`, `ha-entity-picker`, `ha-selector`,
`ha-expansion-panel`, `ha-switch`, `ha-slider`, `ha-textfield`, `ha-icon-picker`,
`ha-alert`) wherever the spec below maps onto them. Shadow DOM, no external assets, icons
from `mdi:*` only.

The prototype draws pictograms with Unicode glyphs (`↑ ⇗ ⇕ ◷ ▦ ▭ ⬭`) purely because it
cannot load MDI. **Every one of those is an `mdi:*` icon in the real build** — mapping table
below.

## Fidelity

**High-fidelity.** Colours, type scale, spacing, radii, states and copy (German) are final
and should be reproduced as specified. The only deliberately low-fidelity element is the
right-hand "Live-Vorschau" panel, which is a stand-in for HA's real preview and is not part
of the deliverable.

## How to open the prototype

Open `Editor System.dc.html` in a browser. Toolbar at the top switches:
- **Karte** — Modern / Retro / Flap (changes which tabs' content is shown)
- **Theme** — Hell / Dunkel (HA light and dark)
- **Breite** — 420 px (desktop target) / 320 px (narrow; preview stacks above the editor)

Everything below the toolbar is live: tabs, line chips, direction buttons, per-line
overrides, walk-time rows, toggles, segmented controls, sliders, and the header-strip editor.
Below the dialog: the component/state sheet in both themes, and the written rationale.

---

## Structure — the answer to "how do the editors get organised"

**Three segmented tabs, identical in all three editors**, rendered as a sticky tab bar at the
top of the editor column:

| Tab | German label | Contains |
|---|---|---|
| 1 | **Stops** (Modern, Flap) / **Stop** (Retro) | Everything that is *per stop*: entity picker, line chips, direction, per-line direction override, walk times, entity-missing error |
| 2 | **Anzeige** | Everything that changes what the card *shows*: layout, counts, visibility toggles, station band, station header strip |
| 3 | **Feinheiten** | Cosmetics and easter eggs: line colour overrides, LED flicker, housing frame, ticker, "min" unit |

Rules:
- Tab set and tab order never vary between cards. A user who learns one card knows all three.
- **Inside a tab the content is a flat list of sections** — no second collapse level. The
  per-stop block is the only nested unit, because its length is data-driven (1–12 walk rows).
- Sections are named after **card regions** (Stationsband, Abfahrtszeile, Fußzeile,
  Stationsanzeige), which is the deliberate, cheap link to the live preview — no numbered
  region badges (explicitly not wanted).
- Dependent options are **never hidden**; they stay visible, disabled, with the reason in
  11.5 px secondary text beneath the label. See "Disabled with reason".

## Vocabulary normalisation (required for implementation)

- `size` is **Klein / Mittel / Standard** in all three cards. Retro's old "Regular" and
  Flap's old "Normal" collapse into "Standard".
- All toggles read **positively**. Flap's `hide_line_column` becomes the label
  "Linienspalte anzeigen" (invert on write). Only `hide_*` keys that follow HA's own
  convention (`hide_attribution`, `hide_header`) keep a negative label
  ("Datenquellen-Hinweis ausblenden").
- Direction filtering is **one control everywhere**: terminus-labelled buttons. Retro's
  direction dropdown and line dropdown are removed; retro uses the same chips + direction
  buttons, constrained to a single selection.
- `line_pill` (Retro "show the pill") and Flap's line-column flag no longer share a key.
  Use distinct keys: `show_line_pill` (retro) and `show_line_column` (flap).

---

## Design tokens

### Colours — HA custom properties only (no bespoke chrome palette)

Used verbatim: `--primary-color`, `--primary-text-color`, `--secondary-text-color`,
`--card-background-color`, `--secondary-background-color`, `--divider-color`,
`--error-color`, `--warning-color`, `--success-color`, `--text-primary-color`.

Two local aliases the prototype defines and that the real build should derive rather than
hardcode:

| Alias | Light | Dark | Use |
|---|---|---|---|
| `--sunken` | `#fafafa` | `#222222` | Inset panel behind the selected header slot |
| `--hover` | `rgba(0,0,0,.05)` | `rgba(255,255,255,.06)` | Row hover, chip delete button |
| `--ripple` | `rgba(3,169,244,.12)` | `rgba(3,169,244,.2)` | Selected segmented / direction button fill |

Reference values the prototype uses for the two themes (HA defaults, for eyeballing only):
light `#ffffff / #212121 / #727272 / #f5f5f5 / #e0e0e0 / #03a9f4 / #db4437 / #ffa600 / #43a047`;
dark `#1c1c1c / #e1e1e1 / #9b9b9b / #282828 / #3b3b3b / #03a9f4 / #e2544a / #ffb547 / #5cb860`.

**Line colours are data, not theme.** They come from the API and are used only on line
badges and chips. Prototype values: U1 `#c6252c`, U2 `#a066aa`, U3 `#e6740e`,
U4 `#3a8f3f`, U6 `#9a6635`, tram/bus fallback `#5b6470`. Every element painted in a line
colour carries `forced-color-adjust: none`.

Signage-bar mock (the black strip being edited) is the one intentionally non-token surface:
housing `#0d0d0d`, selected zone `#171717`, unselected zone border `1px dashed #3a3a3a`,
chip token `#2a2a2a`, token text `#f2f2f2`.

### Typography — Roboto (HA's own), four steps only

| Step | Style | Use |
|---|---|---|
| Section title | `500 14px/1.35` `--primary-text-color` | Section header, per-stop name |
| Row label | `400 13.5px/1.4` `--primary-text-color` | Toggle-row label |
| Field label / hint | `400 12px/1.4` `--secondary-text-color` | Label above a control, section hint |
| Reason / counter | `400 11.5px/1.5` `--secondary-text-color` | Disabled reason, chip counter, notes |

Additional: chips and line badges `700 13px/1`; badge text `700 12px/24px`; monospace
(`ui-monospace, Menlo, monospace`) only for entity ids and hex values. **No uppercase
letter-spaced micro-headers anywhere** — that was the second visual grammar in the old
Modern editor and it is gone. The only uppercase text is the tab bar
(`500 12.5px`, `letter-spacing:.02em`, `text-transform:uppercase`).

### Spacing rhythm

- Editor column padding: `14px 16px 22px`
- Gap between sections: `14px` (Stops) / `16px` (Anzeige, Feinheiten)
- Section header padding: `10px 12px`; section body padding: `6px 12px 12px` (panel) /
  `12px` (per-stop block)
- Inner group gap within a per-stop block: `14px`; label-to-control gap: `5–7px`
- Toggle row: `min-height:48px`, `padding:6px 0`, `gap:12px`, `border-bottom: 1px solid
  var(--divider-color)`
- Non-toggle row (segmented / slider / text / colour): column, `padding:10px 0 12px`,
  same bottom divider

### Radii, borders, elevation

- Section / block: `border-radius:10px`, `1px solid var(--divider-color)`
- Field, segmented button, direction button, icon button: `border-radius:6–8px`
  (fields 8px, direction buttons 6px)
- Line chip: `border-radius:5px`, `2px solid <line colour>`
- Banner: `border-radius:8px`, `1px solid <tone colour>` on
  `var(--secondary-background-color)` — **no left accent bar**
- Text chip in header slot: `border-radius:18px`, `1px solid var(--divider-color)`
- The dialog mock uses `box-shadow:0 10px 34px rgba(38,50,56,.16)`; the editor itself has
  **no shadows**.

---

## Components

### 1. Section

```
header: --secondary-background-color, 1px bottom divider,
        title (14/500) + right-aligned hint (11.5/400 secondary)
body:   flat list of rows, each row bottom-divided; last row's divider may remain
```
Maps to `ha-expansion-panel` where collapsing is wanted, but the default state in this
design is **expanded** — the tab already did the hiding.

### 2. Line chip (existing custom widget, restyled)

- `height:34px`, `padding:0 10px`, `border-radius:5px`, `border:2px solid <line colour>`,
  `font:700 13px/1`, `white-space:nowrap`, `position:relative`
- Off: transparent background, text in line colour. On: background = line colour, text `#fff`.
- Touch target: a `::before` with `left:0;right:0;top:-5px;bottom:-5px` extends the hit area
  to 44 px without inflating the visual pill. **Keep this** — it is how the design satisfies
  WCAG 2.2 target size with a compact chip.
- Mode glyph: **U-Bahn lines show no glyph** (the label "U1" already says U-Bahn). Tram
  (`mdi:tram`) and bus (`mdi:bus`) show theirs, `700 11px/1`, `opacity:.85`, `gap:5px`.
- `aria-pressed`, and `aria-label` "Linie U1 aktiv" / "Linie U1 inaktiv".
- Counter to the right of the group label: "2 von 5", or "leer = alle Linien" when empty.

### 3. Line badge (read-only)

`min-width:34px; height:24px; padding:0 7px; border-radius:5px; background:<line colour>;
color:#fff; font:700 12px/24px; text-align:center; forced-color-adjust:none`.
Used in per-line override rows, walk-time rows, colour rows.

### 4. Direction button

- `flex:1; min-height:34px; padding:4px 9px; border-radius:6px; font:500 12.5px/1.3;
  text-align:center; overflow-wrap:anywhere`
- Off: `1px solid var(--divider-color)` on `--card-background-color`
- On: `1px solid var(--primary-color)`, background `--ripple`, text `--primary-color`
- Disabled: `1px dashed var(--divider-color)`, secondary text, `opacity:.65`,
  `cursor:not-allowed`, `aria-disabled="true"`, `title` with the reason
- **Labels carry the real terminus**: `H: Oberlaa`, `R: Leopoldau`, `Beide`. Never a bare
  letter. If a direction is not served: `R: nicht bedient`, disabled, tooltip
  "Diese Haltestelle bedient keine Rückfahrt", plus a note under the group:
  "R deaktiviert: U1 endet hier."
- Per-line override rows use the compact form `H` / `R` / `⇄` (`mdi:swap-horizontal`) next
  to the line badge, with the terminus in `aria-label` and `title`.

### 5. Toggle row

Label left (13.5/400, wraps), switch right. Switch: 44×44 transparent button containing a
36×20 track (`border-radius:10px`, `--primary-color` on / `--divider-color` off) and a 16 px
white knob (`left:2px` off, `left:18px` on, `box-shadow:0 1px 2px rgba(0,0,0,.3)`).
`role="switch"`, `aria-checked`, `aria-label` = the label text.

### 6. Segmented control row

Field label above; buttons in a `display:flex; gap:6px; flex-wrap:wrap` row, each
`flex:1 1 auto; min-height:44px; padding:6px 12px; border-radius:8px`, same on/off styling as
the direction button. **Must wrap** — never three fixed thirds; German labels like
"Farbe der ersten Linie" break the row otherwise.

### 7. Numeric slider row

Field label above; 4 px track (`--divider-color`), fill and 16 px knob in `--primary-color`
with a `0 0 0 6px var(--ripple)` halo, and a bordered value box (`min-width:44px`,
`13.5/500`) to the right. Used for Max. Abfahrten (0–20) and Max. Zeilen (1–8).

### 8. Walk-time row (existing custom widget)

`min-height:44px`, badge · `→ Terminus` (flex:1, wraps) · stepper. Stepper is a
34×36 `−`, a 38 px value, a 34×36 `+`, inside one `1px solid var(--divider-color)` /
`border-radius:6px` shell with internal dividers. One row per (line, direction) pair, derived
from live data; group label "Gehzeit zur Haltestelle", right hint "Minuten".

### 9. Colour override row (existing custom widget)

Label above; row = line badge · colour field (swatch 22×22, `border-radius:5px` + hex in
monospace, inside a 44 px bordered field) · 44×44 reset button (`↺` = `mdi:restore`,
`aria-label` "Linienfarbe U1 auf Standard zurücksetzen", `opacity:.45` when already default).

### 10. Banner

`display:flex; gap:10px; padding:11px 12px; border-radius:8px;
background:var(--secondary-background-color); border:1px solid <tone>`, icon in the tone
colour, text 12.5/1.5 in `--primary-text-color`. Tones: `--error-color`
(`mdi:alert-circle`), `--warning-color` (`mdi:alert`), `--primary-color`
(`mdi:information-outline`). Maps to `ha-alert`.

### 11. Per-stop block

```
header  index pill (22px circle, 11/600) · stop name (14/500, wraps) · 32px chevron
body    [error banner if entity missing]
        entity picker (label 12/400 + 44px field; red border + red text when missing)
        line chips + counter  |  empty state when no lines
        direction buttons (+ note)
        per-line override rows        — only when 2+ lines active
        walk-time rows                — only when at least one (line, direction) pair exists
```
Order is fixed; length is not. Followed by a full-width dashed
`+ Haltestelle hinzufügen` button (44 px, `--primary-color` text, `--hover` on hover).

### 12. Empty state

Centred in a dashed `--divider-color` box on `--sunken`, `padding:18px 14px`:
"Noch keine Linien verfügbar" (13/500) + "Wähle zuerst eine Haltestelle — die Linien kommen
live aus der API." (12/400 secondary).

---

## The station header strip — direct manipulation

The one **new** custom widget. Everything else is an HA control or an existing custom one.

**The bar is the control.** Inside a `#0d0d0d` housing (`padding:8px`, `border-radius:10px`,
`gap:6px`) sit two tappable zones, left and right, each `flex:1; min-height:44px;
padding:6px 8px; border-radius:6px`. Unselected: `1px dashed #3a3a3a`, transparent.
Selected: `2px solid var(--primary-color)` on `#171717`.

Each zone renders its configured content as live tokens, left-aligned in the left zone and
right-aligned in the right zone, `flex-wrap:wrap; gap:5px`, token height 22 px:
pictogram and icon tokens `500 14px/1` `#f2f2f2` on transparent; free text
`400 11px/1`; text chips `400 11px/1` on `#2a2a2a`, `border-radius:3px`. An empty zone shows
the token "leer". The order is exactly the order the card renders — the user sees the bar
being assembled.

Below the bar: "Seite antippen, dann unten füllen" plus a **Links / Rechts** segmented
control (equivalent to tapping a zone; needed for keyboard users).

Below that, the **slot panel** for the selected side — one panel, four fields, framed
`1px solid var(--primary-color)`, `border-radius:10px`, background `--sunken`,
`padding:12px`, `gap:12px`:

1. **Ausgangs-Piktogramm** — a 7-button grid of 44×44 icon buttons, visual, `aria-pressed`,
   `title` = the name. This replaces choosing an exit pictogram from a 7,500-entry text
   autocomplete.
2. **Freitext-Beschriftung** — 44 px text field.
3. **Symbole in diesem Slot** — a tray of pressable 44 px pills: WC, Rolltreppe, Lift, Uhr,
   Datum. Pressed = primary border + `--ripple` fill. (A pill shows a glyph only when it
   differs from its label; "WC" shows text alone.)
4. **Textchips (max. 6) und Extra-Symbole (max. 3)** — existing chips with a 24 px `✕`
   delete, plus `+ Chip` and `+ Symbol` dashed pills. `+ Symbol` opens HA's real
   `ha-icon-picker` — this is where the three free MDI icons live.

Net effect: ~20 form rows two collapse levels deep become one bar plus a four-field panel.
Estimated implementation: one Lit element, roughly 200 lines, two zones and one slot panel.
Date format string stays a text field inside the panel, shown only when "Datum" is on.

### Glyph → MDI mapping (prototype glyph is a stand-in)

| Prototype | MDI |
|---|---|
| `↑` Ausgang | `mdi:exit-run` (or `mdi:arrow-up-bold`) |
| `⇕` Aufzug / Lift | `mdi:elevator` |
| `⇗` Rolltreppe | `mdi:escalator` |
| `⇞` Treppe | `mdi:stairs` |
| `⇄` Umsteigen / beide Richtungen | `mdi:swap-horizontal` |
| `▤` Bahnsteig | `mdi:table-row` (or `mdi:subway-variant`) |
| `∅` Kein | `mdi:close-circle-outline` |
| `◷` Uhr | `mdi:clock-outline` |
| `▦` Datum | `mdi:calendar` |
| `▭` Tram | `mdi:tram` |
| `⬭` Bus | `mdi:bus` |
| `↺` Reset | `mdi:restore` |
| `⌄` Chevron | `mdi:chevron-down` |
| `⚠ △ ⓘ` | `mdi:alert-circle`, `mdi:alert`, `mdi:information-outline` |
| WC | `mdi:human-male-female` (label "WC" is the primary signal) |

---

## Editor content, tab by tab

Labels below are the shipping German strings; English is the second locale and always
shorter, so the layout is stress-tested on German.

### Modern

**Stops** — multi-stop. Per-stop blocks as specified, plus `+ Haltestelle hinzufügen`.

**Anzeige**
- *Aufbau* — Layout bei mehreren Haltestellen (Gestapelt / Reiter) · Max. Abfahrten pro
  Haltestelle (slider 0–20) · Kopfzeile ausblenden · Nächste Abfahrt groß anzeigen ·
  Abfahrtsliste anzeigen · Zwischenstationen anzeigen · QR-Button anzeigen
- *Abfahrtszeile* — Gleis/Steig-Seite anzeigen · Barrierefrei-Symbol anzeigen · Nur
  barrierefreie Abfahrten (depends on the previous) · Klimaanlagen-Symbol anzeigen ·
  Verkehrsmittel-Symbol anzeigen
- *Störungen & Verspätungen* — Störungen anzeigen · Aufzugstörungen anzeigen ·
  Verspätungen anzeigen · Verspätungen farblich codieren (depends on the previous) ·
  Datenquellen-Hinweis ausblenden

**Feinheiten** — *Linienfarben* ("überschreibt API-Farbe"): one colour row per **active**
line. When no line is active, the section shows the empty note "Keine Linie aktiv — wähle im
Reiter Stops Linien aus" rather than an empty grid.

### Retro (single stop, single line, single direction)

**Stop** — one per-stop block. Line chips are single-select here, direction is single-select;
same components, constrained.

**Anzeige**
- *Stationsanzeige* — the header-strip editor
- *Stationsband* — Stationsnamen anzeigen · Bandhintergrund (Standard / Weiß / Schwarz)
- *Anzeige* — Steig anzeigen · Steig-Seite (Automatisch / Immer links / Immer rechts) ·
  Nur barrierefreie Abfahrten · Größe (Klein / Mittel / Standard) · Stil (Klassisch / Warm /
  Dot-Matrix)

**Feinheiten** — Einheit „min" anzeigen · Linien-Pille anzeigen · Seitlichen Linienstreifen
anzeigen · LED-Gehäuserahmen anzeigen · LED-Flackern simulieren · Lauftext anzeigen ·
Lauftext (text field, "Nur wirksam, wenn Lauftext aktiv ist") · Rollstuhl-Rennen (Easter Egg)

### Flap

**Stops** — multi-stop, same as Modern.

**Anzeige**
- *Stationsanzeige* — the header-strip editor
- *Stationsband* — Stationsnamen anzeigen · Bandhintergrund (Farbe der ersten Linie /
  Bestimmte Linie / Weiß / Schwarz)
- *Anzeige* — Max. Zeilen (slider 1–8) · Steig anzeigen · Barrierefrei-Symbol anzeigen ·
  Nur barrierefreie Abfahrten (depends on the previous) · Einheit „min" anzeigen ·
  Größe (Klein / Mittel / Standard) · Datenquellen-Hinweis ausblenden

**Feinheiten** — Linienspalte anzeigen (was `hide_line_column`; invert on write) ·
Gehäuserahmen anzeigen

---

## Interactions & behaviour

- **Tab switch** — instant, no animation, no config write. Tab state is editor-local and may
  reset on dialog reopen.
- **Every control writes on change** and fires `config-changed` so HA's preview updates on
  each keystroke, as today.
- **Chip toggle** — adds/removes the line from the stop's filter. Empty filter means all
  lines (stated by the counter and, if useful, an info banner).
- **Direction change** — recomputes the walk-time rows; rows for pairs that no longer exist
  disappear, remaining values are preserved by `(stop, line, direction)` key.
- **Per-line override rows appear only when 2+ lines are active** and default to the stop's
  direction value.
- **Header-strip zone tap** — selects the side; the slot panel swaps content. No animation
  beyond the border/background change.
- **Hover** — rows and dashed buttons take `--hover`; chips and direction buttons lighten
  their fill by the same amount. No transform, no shadow.
- **Focus** — 2 px `outline` in `--primary-color` at `outline-offset:2px` on every
  interactive element. Offset outline (not `box-shadow`) is deliberate: it stays visible on
  filled line-colour chips.
- **Responsive** — at ≤ 400 px the editor column is full width and HA stacks the preview
  above it. Nothing in the layout is column-based, so no breakpoint work is required beyond
  letting sections fill the width; segmented rows and chip rows wrap.

## State

Per editor instance, all derived from the card config except the first two:

| State | Type | Notes |
|---|---|---|
| `activeTab` | `'stops' \| 'anzeige' \| 'fein'` | Editor-local |
| `selectedHeaderSide` | `'left' \| 'right'` | Editor-local, header strip only |
| `stops[]` | entity id + per-stop config | Config |
| `stops[].lines[]` | line ids | Empty = all |
| `stops[].direction` | `'H' \| 'R' \| 'B'` | Config |
| `stops[].lineDirections{}` | line → direction | Override map |
| `stops[].walkTimes{}` | `line\|direction` → minutes | Sparse |
| visibility flags | booleans | Per card, see inventory |
| `size`, `style`, `bandBackground`, `platformSide`, `layout` | enums | Normalised values |
| `maxDepartures`, `maxRows` | numbers | 0–20, 1–8 |
| `lineColors{}` | line → hex | Override only; absent = API colour |
| `header.left`, `header.right` | slot objects | pictogram, text, wc, escalator, lift, clock, date, dateFormat, icons[≤3], chips[≤6] |

Derived from live entity data, never stored: available lines per stop, terminus names per
line/direction, which directions a stop serves, the walk-time row list.

**Entity-missing case**: a stop whose entity is gone keeps its saved config, shows the error
banner, renders the entity field with an error border, and disables the line/direction/walk
controls entirely (no available-line data exists). Offer "Haltestelle entfernen" in the
banner.

## Accessibility requirements to preserve

- `aria-pressed` on chips, direction buttons, pictogram buttons, tray pills
- `role="switch"` + `aria-checked` on toggles; localised `aria-label` on every icon-only and
  numeric control
- `aria-disabled` + `title` reason on unavailable directions and dependent toggles; the
  reason is also visible as 11.5 px text under the label
- 44 px minimum target on every control — chips and direction buttons are visually 34 px and
  reach 44 px via the `::before` hit-area extension / row padding
- `forced-color-adjust: none` on line-coloured elements only
- Visible 2 px offset focus outline everywhere
- WCAG 2.2 AA contrast: all body text is full-opacity `--primary-text-color` or
  `--secondary-text-color`; disabled rows use `opacity:.5` on non-essential rows only, with
  the reason text at full opacity

## Files

- `Editor System.dc.html` — the clickable prototype (toolbar switches card, theme, width;
  includes the component/state sheet in light and dark, and the written rationale in German)
- `support.js` — runtime needed to open the prototype in a browser; not part of the design

## Assets

None. No web fonts (Roboto is HA's own), no images, no icon fonts. All icons are `mdi:*` per
the mapping table above.

## Rationale in brief

1. Three tabs, not three architectures: Stops (what) · Anzeige (what you see) · Feinheiten
   (cosmetics), identical in all three cards.
2. Tabs beat endless scroll because the tasks are separable — "Steig ausblenden" is in
   Anzeige, not 25 rows below the entity picker.
3. Flat inside a tab: one collapse level only. The per-stop block is the sole nested unit,
   because only its length is data-driven.
4. One job, one control: chips for lines, terminus-labelled buttons for direction, in every
   card. Retro's dropdowns go away.
5. Vocabulary normalised: one `size` scale, positive toggle labels, no shared keys with
   opposite meanings.
6. Dependencies are shown disabled with a reason, not hidden — the user learns the rule
   instead of hunting a row.
7. Section names mirror card regions; that is the preview link. No numbered badges.
8. Exactly one new custom widget (the header-strip editor). Chips, colour rows and walk-time
   rows already exist; everything else is a stock HA control.
9. Compact-but-accessible: 34 px chips and direction buttons with extended hit areas, so
   density does not cost the 44 px target.
10. German is the measure: every label wraps, no fixed-width label column, segmented rows
    wrap rather than splitting into equal thirds.
