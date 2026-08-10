import { css } from "lit";

// Tile-card visual language. Token-driven, container-query-paced.
// Per-station accent is piped in via inline `style="--wl-accent: …;"` on
// `.station`, so every accented SURFACE (icon-tile tint, line badge, alert
// surface, the radial wash) reads from one prop.
//
// Accented TEXT reads from `--wl-accent-text` instead — the GTFS palette is
// a set of background colours and several of them are illegible as glyphs.
// See `accentTextColor()` in utils/color.ts, which computes it. Two props,
// split by role: if a declaration sets `color`, it wants the text token.
//
// The focus ring is deliberately NOT on either — it uses `--primary-color`
// so it stays a consistent, theme-owned affordance rather than shifting hue
// per station.
//
// Webfonts (WL Sans / WL Sans Condensed / WL Mono) are NOT declared
// here: `@font-face` inside Shadow DOM is unreliable on older engines
// (Android System WebView). `registerWlFonts()` from `./font-face`
// injects the faces on `document.head` instead — the card just
// references the families by name. See font-face.ts / www/fonts/
// NOTICE.md for the rationale, provenance + GUST Font License terms.
export const cardStyles = css`
  :host {
    /* color-scheme enables light-dark() and steers forced-colors
       palette selection (WCAG 1.4.11). HA's active theme drives the
       resolution; the card just opts in. */
    color-scheme: light dark;
    display: block;
    container-type: inline-size;
    container-name: wlcard;

    /* Brand accent inherits HA's primary. Per-station accent override
       lands inline on .station via style="--wl-accent: …;". */
    --wl-accent: var(--primary-color);

    /* The .line-badge box, as one authoritative pair. The badge derives
       its min-width from these rather than declaring its own, so the
       token can never disagree with the element it describes — the
       departure trail aligns its stroke to the badge's right border and
       any drift between the two shows up as a misaligned connector.
       No line label is wide enough to beat the 2.4em min-width, so
       every badge is exactly --wl-badge-width across. */
    --wl-badge-pad-x: 8px;
    --wl-badge-width: calc(0.85rem * 2.4 + var(--wl-badge-pad-x) * 2);

    /* Gap between a trail dot and its station name. On :host because the
       departure row reads it too, to line its direction text up with the
       stop names below. */
    --stops-ahead-name-gap: var(--ha-space-2, 8px);

    /* Text-safe companion to --wl-accent. GTFS route_color is a
       *background* colour — Wiener Linien ships 0A295D for city buses
       and 000000 for the Badner Bahn, both fine behind white badge text
       and both around 1.19:1 when painted *as* text on a dark card.
       Anything colouring glyphs reads from this token; backgrounds keep
       using --wl-accent directly.

       The lightness-clamped value lands inline on .station alongside
       --wl-accent, computed in accentTextColor() (utils/color.ts) —
       not in CSS, because the relative-colour declaration that did the
       clamp until v1.7.3 mis-resolved on older embedded WebViews and
       @supports cannot probe it (issue #95). This declaration is the
       fallback for the cases the helper declines: no theme polarity
       yet, or an accent it can't resolve (the neutral
       var(--primary-color)). Legible but hueless, never invisible. */
    --wl-accent-text: var(--primary-text-color);

    /* Semantic state tokens layered over HA's official semantic palette
       so theme authors can recolour the whole portfolio in one place;
       hard-coded fallbacks for older HA versions. */
    --wl-rt:      var(--success-color, #43a047);
    --wl-warning: var(--warning-color, #ffa000);
    --wl-error:   var(--error-color,   #db4437);
    --wl-info:    var(--info-color,    #1565c0);
    /* ISA / ISO 7001 accessibility blue (Pantone 285 C). Kept on its
       own token — separate from --wl-info — so the wheelchair pill
       always renders in the standards-correct colour, while themes can
       still override if they need to. */
    --wl-a11y:    #0072CE;

    /* Spacing / radius / sizing — layered over the HA Design System
       so the card moves with HA when tokens evolve. Values match
       linz-linien-austria so a stacked dashboard reads as one
       family. */
    --wl-radius-sm: var(--ha-border-radius-sm, 4px);
    --wl-radius-md: var(--ha-border-radius-md, 8px);
    --wl-radius-lg: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
    /* These names were wrong until v1.7.6 and nothing complained: var()
       on a token HA does not define is not an error, it just resolves to
       the fallback. So the card ran entirely on its own literals while
       looking theme-aware — which is how --ha-spacing-3 came to mean
       14px on one line and 12px on the next.

       Verified against the frontend's src/resources/theme/core.globals.ts:
         --ha-space-N          4px grid, 1…14   (was --ha-spacing-N)
         --ha-border-radius-*  sm 4 / md 8 / lg 12 / xl 16 / pill / circle
                                                (was --ha-radius-*)
         --ha-animation-duration-*  none 1 / instant 75 / fast 150 /
                                    normal 250 / slow 350ms
                                                (was --ha-transition-duration-*)
       There is no easing token — --ha-transition-easing-standard never
       existed either, so easings are now named directly.

       Fallbacks are kept and now match the token they stand in for.
       Adopting a new --ha-* token means checking core.globals.ts first;
       a typo here is invisible. */
    --wl-pad-x:     var(--ha-space-4, 16px);
    --wl-pad-y:     var(--ha-space-3, 12px);
    --wl-row-gap:   var(--ha-space-3, 12px);
    --wl-tile-size: 40px;
    --wl-slot-radius: var(--ha-border-radius-md, 8px);
    --wl-slot-gap: 6px;
    --wl-slot-min-h: 44px;
    --wl-metric-size: 2.25rem;
  }

  ha-card {
    overflow: hidden;
  }

  .wrap {
    display: flex;
    flex-direction: column;
    gap: var(--wl-row-gap);
    padding: var(--wl-pad-y) var(--wl-pad-x);
  }

  /* Tabs sit flush with the card edge — direct child of <ha-card>, not
     inside .wrap. Three active cues (colour + weight + inset underline)
     so the active tab reads without colour vision. */
  /* The strip is split in two: .tabs scrolls horizontally on its own,
     .tab-actions stays pinned outside that scroller so the buttons
     don't drift off-screen with a long tab list. */
  .tabbar {
    display: flex;
    align-items: stretch;
    height: 44px;
    padding: 0 14px;
    border-bottom: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
  }
  .tabs {
    display: flex;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    flex: 0 0 auto;
    padding-left: 8px;
  }
  /* Two 32px buttons + the 2px gap. Held even when the active stop has
     no coordinates and the QR button drops out, so switching tabs never
     re-flows the tab widths. */
  .tab-actions.reserved {
    min-width: 66px;
  }
  .tab-actions .icon-action {
    width: 32px;
    height: 32px;
  }
  .tab-actions .icon-action ha-icon {
    --mdc-icon-size: 18px;
  }
  .tab {
    flex: 1 0 auto;
    min-width: 0;
    padding: 0 12px;
    background: none;
    border: none;
    color: var(--secondary-text-color);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color var(--ha-animation-duration-fast, 150ms) ease, box-shadow var(--ha-animation-duration-fast, 150ms) ease;
  }
  .tab:hover {
    color: var(--primary-text-color);
  }
  .tab.active {
    color: var(--primary-color);
    font-weight: var(--ha-font-weight-bold, 600);
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }

  /* Per-station section. Inline --wl-accent on this element drives the
     icon-tile tint, line-badge fallback, alert tints, and CTA fill —
     and the atmospheric radial wash below. */
  .station {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--wl-row-gap);
    /* Soft radial wash from the top-left in the station's line accent.
       Picks up the per-station --wl-accent automatically, adds depth
       without competing with user themes. Tuned conservatively (6%
       opacity, 70% radius) so it reads as a tint rather than a tile —
       theme-agnostic atmosphere, frontend-design audit. */
    background-image: radial-gradient(
      ellipse 80% 70% at top left,
      color-mix(in srgb, var(--wl-accent) 6%, transparent),
      transparent 70%
    );
  }
  .station + .station {
    margin-top: var(--wl-row-gap);
    padding-top: var(--wl-row-gap);
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  /* Header: square accent tile (left), title block (centre), circular
     icon-action (right). Mirrors HA's hui-tile-card composition. */
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .icon-tile {
    width: var(--wl-tile-size);
    height: var(--wl-tile-size);
    border-radius: var(--wl-radius-md);
    background: color-mix(in srgb, var(--wl-accent) 18%, transparent);
    color: var(--wl-accent-text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    forced-color-adjust: none;
  }
  .icon-tile ha-icon {
    --mdc-icon-size: 22px;
  }
  .title-block {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .title {
    margin: 0;
    font-size: var(--ha-font-size-m, 0.9375rem);
    font-weight: 600;
    color: var(--primary-text-color);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    margin: 2px 0 0;
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .head-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
  }
  .icon-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background-color var(--ha-animation-duration-fast, 150ms) ease, color var(--ha-animation-duration-fast, 150ms) ease;
  }
  .icon-action:hover {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-text-color);
  }
  .icon-action ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Hero block — Linz-Linien-aligned layout: tinted background, big
     countdown on the left, line-badge + direction column on the right.
     Matches linz-linien-austria so a stacked dashboard reads as one
     visual family. The per-station --wl-accent (set inline on .station)
     drives the tint and the big-number colour; the row beside lists
     the next departure's line, direction, platform, and a realtime
     pill if applicable. */
  .hero {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--ha-space-3, 12px);
    row-gap: 6px;
    align-items: center;
    /* Cosmetics (background, padding, radius) live on .hero-host so
       the tinted surface visually contains both the grid and any
       expanded stops_ahead panel below. The .hero grid itself just
       does layout — entries + their panels live in column 2 in
       interleaved row order so each panel sits directly below its
       trigger entry; .hero-time pins to row 1 of column 1 and stays
       vertically centred against the first entry regardless of
       which panels expand below. */
  }
  .hero > .hero-time {
    grid-column: 1;
    grid-row: 1;
  }
  .hero > .hero-entry {
    grid-column: 2;
  }
  /* Detail panel spans both columns so its dot column starts at the
     hero-host's left padding — long station names get the full inner
     width to render before they need to truncate. */
  .hero > .hero-detail {
    grid-column: 1 / -1;
  }
  .hero-time {
    display: flex;
    align-items: baseline;
    gap: 4px;
    color: var(--wl-accent-text);
  }
  .hero-min {
    font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
    font-size: var(--wl-metric-size);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.5px;
  }
  .hero-unit {
    font-size: var(--ha-font-size-m, 1rem);
    font-weight: 600;
    color: var(--secondary-text-color);
  }
  /* hero-host carries the cosmetics (background, padding, radius)
     so the tinted surface wraps both the .hero grid and any
     expanded stops_ahead panels in one continuous block. */
  .hero-host {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: var(--ha-space-3, 12px) var(--wl-pad-x);
    background: color-mix(in srgb, var(--wl-accent) 12%, transparent);
    border-radius: var(--wl-radius-lg);
  }
  .hero-entry {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .hero-entry.expandable {
    cursor: pointer;
    user-select: none;
    border-radius: 6px;
  }
  .hero-chevron {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    margin-left: auto;
    flex-shrink: 0;
    /* will-change promotes the chevron to its own composite layer so
       the rotation animates on the GPU instead of triggering a layout
       pass that nudges flex siblings during the transition. */
    will-change: transform;
    transition: transform
      var(--ha-animation-duration-fast, 150ms)
 ease;
  }
  .hero-entry.expanded .hero-chevron {
    transform: rotate(180deg);
  }
  /* Hero-side collapsible panel — same 0fr↔1fr trick as
     .dep-row-detail so the trail animates to intrinsic height. The
     entry itself reuses the same .stops-ahead inner styling. */
  .hero-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
  }
  .hero-detail-inner {
    overflow: hidden;
    min-height: 0;
  }
  .hero-detail.expanded {
    grid-template-rows: 1fr;
  }
  .hero-direction {
    font-weight: 500;
    color: var(--primary-text-color);
    /* Single-line ellipsis. Long Wiener Linien direction names like
       "Floridsdorf, U-Bahn-Station" otherwise wrap onto a 2nd or 3rd
       line and inflate the hero's vertical footprint. min-width: 0 is
       required for text-overflow: ellipsis to work inside flex. */
    flex: 1 1 0;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hero-platform {
    font-size: var(--ha-font-size-xs, 0.75rem);
    font-weight: 500;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-text-color) 10%,
      transparent
    );
  }
  /* Hero accessibility flag — small icon-only pill, only rendered
     when the next departure is barrier-free AND the user has
     show_accessibility enabled. */
  .hero-a11y {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: var(--wl-a11y);
    padding: 2px 6px;
    border-radius: 999px;
    flex-shrink: 0;
    forced-color-adjust: none;
  }
  .hero-a11y ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Version banner — accent surface that uses warning tokens. The
     button is rendered bare by renderVersionBanner (shared-render.ts);
     the .banner > button selector below tints it to match. */
  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--wl-radius-md);
    background: color-mix(in srgb, var(--wl-warning) 16%, transparent);
    color: var(--primary-text-color);
    font-size: 0.85rem;
  }
  .banner > span {
    flex: 1;
  }
  .banner > button {
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: 999px;
    background: var(--wl-warning);
    color: var(--text-primary-color, #fff);
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 1px 2px color-mix(in srgb, #000 12%, transparent);
    transition: filter var(--ha-animation-duration-fast, 150ms) ease, transform 0.06s ease;
    forced-color-adjust: none;
  }
  .banner > button:hover {
    filter: brightness(1.08);
  }
  .banner > button:active {
    transform: translateY(1px);
  }

  /* Alerts: traffic + elevator items use the same expandable surface. */
  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .alert {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: var(--wl-radius-md);
    background: color-mix(in srgb, var(--wl-warning) 12%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wl-warning) 22%, transparent);
    font-size: 0.85rem;
    cursor: pointer;
    user-select: none;
    forced-color-adjust: none;
  }
  .alert.no-detail {
    cursor: default;
  }
  .alert > ha-icon {
    --mdc-icon-size: 18px;
    color: var(--wl-warning);
    flex-shrink: 0;
    margin-top: 1px;
  }
  .alert-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }
  .alert-summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
  }
  .alert-title {
    font-weight: 600;
    color: var(--primary-text-color);
  }

  /* Lift location rendered as the path it is — "U3 Mittelbahnsteig ›
     Ausgang Schlachthausgasse › Ausgang Hainburger Weg". The separator is
     decorative and aria-hidden; the row's aria-label still carries the
     original unsegmented string, so the accessible name is unchanged. */
  .lift-path {
    display: inline;
  }
  .lift-path-sep {
    margin: 0 5px;
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  /* Reason line with its category pictogram. flex-start keeps the icon on
     the first line when the reason wraps to several. */
  .lift-reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  .lift-reason ha-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--wl-accent-text);
  }
  .alert-lines {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .alert-line-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: var(--ha-font-weight-bold, 600);
    color: #fff;
    background: var(--primary-color);
    forced-color-adjust: none;
  }
  /* Modern reveal: 0fr ↔ 1fr animates to intrinsic height without
     clipping multi-line traffic descriptions. */
  .alert-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
  }
  .alert-detail > .alert-detail-inner {
    overflow: hidden;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .alert.expanded .alert-detail {
    grid-template-rows: 1fr;
  }
  /* Disruption body. utils/traffic-notice.ts recovers the structure the
     operator writes in prose but never marks up — per-line headings,
     statements, and the trailing labelled facts — so the layout can do
     what the <p> soup can't: let someone scan for their own line, or for
     the reason, without reading the whole notice. */
  .alert-desc {
    color: var(--secondary-text-color);
    line-height: 1.45;
  }
  .alert-desc p {
    margin: 0 0 8px;
  }
  .alert-desc p:last-child {
    margin-bottom: 0;
  }

  /* "Linie 43:" / "Linien 40, 41, 42:" — the section header of a per-line
     block. Signage-style: accent rule, uppercase, tracked out. A notice
     covering seven tram lines is unreadable without these.

     Only rendered when a notice has two or more — a lone heading segments
     nothing and merely restates the line already in the alert title, so
     _renderTrafficNotice drops it. */
  .alert-desc-heading {
    margin: 14px 0 6px;
    padding-left: 8px;
    border-left: 3px solid var(--wl-accent);
    color: var(--primary-text-color);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.3;
  }
  /* No leading gap when the notice opens with a heading. */
  .alert-desc-heading:first-child {
    margin-top: 0;
  }

  /* Labelled facts (Grund / Voraussichtliche Dauer). Pulled out of the
     prose flow and set as label→value pairs above the timing meta row, so
     the two most-asked questions — why, and until when — are findable at
     a glance instead of buried in the last sentence. */
  .alert-facts {
    display: grid;
    gap: 4px 10px;
    margin: 10px 0 0;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
  }
  /* Label column sizes to its own text — no minimum. A floor here padded
     the short label ("Grund") out to a width set by nothing in particular,
     which reads as a stray gap rather than as alignment. Rows size
     independently on purpose: with two facts of very different label
     lengths, a shared column would push every value out to the width of
     "Voraussichtliche Dauer". */
  .alert-fact {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 10px;
    align-items: baseline;
  }
  .alert-fact dt {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.5;
    white-space: nowrap;
  }
  /* Pictogram for the reason category (excavator, ambulance, …) and the
     date/time distinction. Decorative — the label text beside it already
     names the field, so it carries aria-hidden and adds nothing for a
     screen reader. Sized off the label rather than the body text so it
     stays subordinate to the value. */
  .alert-fact dt ha-icon {
    --mdc-icon-size: 14px;
    flex-shrink: 0;
    color: var(--wl-accent-text);
  }
  .alert-fact dd {
    margin: 0;
    color: var(--primary-text-color);
  }
  /* Narrow cards can't hold a label column beside "Voraussichtliche
     Dauer" — stack instead of letting the value squeeze to two words a
     line. Matches the 360px breakpoint the rest of the card uses. */
  @container wlcard (inline-size < 360px) {
    .alert-fact {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
  .alert-meta {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    color: var(--secondary-text-color);
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
  }
  .alert-location-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .alert-location-chip ha-icon {
    --mdc-icon-size: 14px;
    color: var(--secondary-text-color);
  }
  .alert-chevron {
    margin-left: auto;
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
    transition: transform var(--ha-animation-duration-fast, 150ms) ease;
    flex-shrink: 0;
  }
  .alert.expanded .alert-chevron {
    transform: rotate(180deg);
  }

  /* Departure rows: rack-style repeated unit. Soft accent surface so the
     section reads as a single coherent block rather than a row of
     dividers. */
  /* Snap the badge box to whole pixels. Unrounded it is 48.64px
     (0.85rem × 2.4 + 16px at a 16px root), which leaves both the badge's
     right border and the trail aligned to it on a fractional x. The
     row's connector stub and the panel's segments resolve to the same
     coordinate but sit in different containing blocks, so the browser
     rounds their edges independently and the stub paints a device pixel
     wider than the line it continues.

     Rounding the token alone is not enough — that moves the trail off a
     badge which is still 48.64px, which is the misalignment this
     replaced. Because .line-badge derives its min-width from the same
     token, snapping here moves the badge and the trail together: badge
     48px, right border and stroke both landing on 52px.

     Guarded because a failing round() would make the token invalid at
     computed-value time, cascading into both the badge's min-width and
     --wl-trail-x. */
  @supports (width: round(down, 1px, 1px)) {
    :host {
      --wl-badge-width: round(
        down,
        calc(0.85rem * 2.4 + var(--wl-badge-pad-x) * 2),
        1px
      );
    }
  }
  .dep-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    /* x of the trail's stroke centre, measured from a row's left edge.
       The open row's connector stub, the trail's line and its dots all
       derive from this one value, which is what guarantees they meet.

       The stroke sits flush inside one of the badge's vertical borders,
       so it reads as that border carrying on downwards: the left one on
       narrow cards, where the trail stays at the card's edge and long
       station names keep their full width, and the right one once the
       container-query override further down has room to indent it.
       Either way the stroke is inside the badge's footprint, which is
       what lets the stub emerge from under the badge.

       --wl-badge-width (on :host) is exact rather than approximate:
       nothing resets box-sizing in this shadow root, so .line-badge is
       content-box, and it derives its min-width from that same token.
       Kept in rem, not em, so nothing re-resolves against a
       descendant's own font-size. */
    --stops-ahead-dot-size: 10px;
    --stops-ahead-line-width: 2px;
    /* The .dep-row grid's column gap, named so the direction cell can
       subtract it when aligning itself to the stop names. */
    --wl-dep-col-gap: var(--ha-space-2, 8px);
    /* A row's left padding, and so where the badge's left border falls.
       Derived rather than picked: the trail can't sit further left than
       half a dot without .stops-ahead needing negative padding, which
       would slide the dots off the line. So the badge moves to the
       trail instead of the other way round — the 2px this adds over the
       old flush-2px padding is imperceptible, and it costs the stop
       names none of their width on narrow cards. */
    --wl-row-pad-left: calc(
      var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2
    );
    --wl-trail-x: calc(var(--stops-ahead-dot-size) / 2);
  }
  .dep-row {
    display: grid;
    grid-template-columns: max-content 1fr auto auto auto;
    align-items: center;
    gap: var(--wl-dep-col-gap);
    /* Symmetric: the old right-hand 2px matched nothing and left every
       row sitting 2px left of centre in its container. */
    padding: var(--ha-space-2, 8px) var(--wl-row-pad-left);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    transition: background-color
      var(--ha-animation-duration-fast, 150ms)
 ease;
  }
  .dep-row:last-child {
    border-bottom: none;
  }
  /* Soft tint on hover so brushing the cursor across the list reads
     as interactive without flashing. Mirrors the Linz card. The
     prefers-reduced-motion block at the bottom of this stylesheet
     neutralises the transition for users who opt out. */
  .dep-row:hover {
    background: color-mix(
      in srgb,
      var(--primary-text-color) 4%,
      transparent
    );
  }
  /* When the row carries a stops_ahead panel, the entire row becomes a
     button-like surface. Cursor and user-select cues mirror the alert
     pattern (.alert) so the affordance is consistent across the card. */
  .dep-row.expandable {
    cursor: pointer;
    user-select: none;
    /* Containing block for the open row's connector stub below. */
    position: relative;
    /* Divider moves to the trailing .dep-row-detail (which an expandable
       row always emits, expanded or not) so the rule falls BELOW the
       stops-ahead trail: the trail reads as part of this departure and
       the line separates it from the next one. */
    border-bottom: none;
  }
  .row-chevron {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    flex-shrink: 0;
    transition: transform
      var(--ha-animation-duration-fast, 150ms)
 ease;
  }
  .dep-row.expanded .row-chevron {
    transform: rotate(180deg);
  }
  /* Connector stub: bridges the gap between the line-badge and the trail
     in the panel below, so the trail reads as growing out of the badge
     rather than floating under it. It spans from the row's vertical
     centre to the row's bottom edge, and .line-badge (z-index 1) paints
     over the upper half — that way the stub appears to start exactly at
     the badge's bottom edge without hard-coding the badge's height. The
     panel's own line starts at its top edge, which is flush against the
     row's bottom, so the two form one continuous stroke. */
  .dep-row.expanded::after {
    content: "";
    position: absolute;
    left: calc(var(--wl-trail-x) - var(--stops-ahead-line-width) / 2);
    top: 50%;
    bottom: 0;
    width: var(--stops-ahead-line-width);
    background: var(--stops-ahead-line, var(--primary-color));
  }
  /* Square off the badge corner the trail leaves from, so the stroke
     reads as continuing out of the badge rather than sliding past a
     rounded edge. Which corner that is follows --wl-trail-x: a
     flush-left trail leaves from the badge's leading edge, an indented
     one from its trailing edge (flipped in the wide-card override). */
  .dep-row.expanded .line-badge {
    border-bottom-left-radius: 0;
  }
  /* Detail panel: sibling <li> rendered immediately below an expandable
     .dep-row. The 0fr ↔ 1fr trick mirrors .alert-detail and animates to
     intrinsic height so the stop list never clips. The panel is always
     in the DOM (inside aria-hidden) so screen readers can step into it
     when expanded; collapse just zeroes the row track. */
  .dep-row-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
    list-style: none;
    /* Carries the divider on behalf of its .dep-row (see above). Applied
       in both states rather than only on .expanded: collapsed the panel
       is zero-height, so the rule lands exactly where the row's own
       border used to sit, and it then travels smoothly with the panel
       instead of snapping between two positions mid-animation. */
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }
  .dep-row-detail:last-child {
    border-bottom: none;
  }
  .dep-row-detail-inner {
    overflow: hidden;
    min-height: 0;
  }
  .dep-row-detail.expanded {
    grid-template-rows: 1fr;
  }
  /* Metro-map style trail: a vertical line in the line's brand colour
     with one filled dot per stop. Indent matches the row's line-badge
     (min-width 2.4em) + gap (8px) so the line visually descends from
     under the badge. The connecting line is drawn as a 3px-wide pseudo-
     element under the dot column; dots overlap it so they appear "on"
     the line. The terminus stop highlights with a hollow ring + bold
     name to anchor the destination. */
  .stops-ahead {
    --stops-ahead-line: var(--primary-color);
    --stops-ahead-dot-size: 10px;
    --stops-ahead-line-width: 2px;
    /* Doubles as the gap between stops and the panel's top padding, so
       a stop's connector segment can bridge either with one offset. */
    --stops-ahead-gap: var(--ha-space-2, 8px);
    list-style: none;
    margin: 0;
    /* Symmetric top and bottom. The old 10px bottom existed to feed the
       removed single stroke's end calculation (bottom: 10px + half a
       dot); with the line drawn per stop it described nothing. */
    padding: var(--stops-ahead-gap) var(--ha-space-2, 8px)
      var(--stops-ahead-gap) 0;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--stops-ahead-gap);
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    line-height: 1.3;
  }
  /* The vertical line, drawn per stop rather than as one stroke down the
     whole list. Each stop carries an upper segment (from the gap above
     down to its own dot) and a lower one (from its dot to its bottom
     edge); the first stop has no upper segment and the last no lower
     one, so the line begins and ends exactly on a dot.

     A single stroke pinned to the list's top and bottom was simpler but
     assumed every stop is one row tall. Expanding the terminus's
     transfer chips makes that entry taller while its dot stays centred
     in it, so the stroke overshot the ring. Segments are measured
     against each stop's own box, so any stop can grow without the ends
     drifting. They sit behind the dots, which carry z-index 1. */
  .stops-ahead-stop:not(:first-child)::before,
  .dep-row-detail .stops-ahead-stop::before,
  .stops-ahead-stop:not(:last-child)::after {
    content: "";
    position: absolute;
    left: calc(var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2);
    width: var(--stops-ahead-line-width);
    background: var(--stops-ahead-line);
    /* Square ends, deliberately. The single stroke this replaced carried
       border-radius: 2px, which only ever rounded the two far ends of a
       list-long bar. On segments a fraction of that length, a 2px radius
       on a 2px-wide bar curves away enough of both ends to read as a
       thinner line than the row's connector stub, and to pinch every
       join into an apparent gap. Butt joins are what make the segments
       read as one stroke. */
  }
  /* Upper segment. In a departure panel the first stop gets one too, so
     the line reaches the panel's top edge and meets the row's connector
     stub — the panel's top padding equals the inter-stop gap, so the
     same offset covers both cases. The hero panel has no stub, so its
     first stop keeps the line starting at the dot. */
  .stops-ahead-stop:not(:first-child)::before,
  .dep-row-detail .stops-ahead-stop::before {
    top: calc(-1 * var(--stops-ahead-gap));
    height: calc(50% + var(--stops-ahead-gap));
  }
  /* Lower segment: runs to the stop's bottom edge, where the next stop's
     upper segment picks it up across the gap. */
  .stops-ahead-stop:not(:last-child)::after {
    top: 50%;
    bottom: 0;
  }
  /* Departure-row trail: driven by --wl-trail-x so it always shares an
     axis with its row's connector stub. Indenting the list is enough —
     the dots and their segments are positioned inside each stop, so they
     follow. Two classes of specificity, so this wins over the wide-card
     override further down without being repeated inside that container
     query. The hero's copy of .stops-ahead is unaffected — it has no
     badge to grow from. */
  .dep-row-detail .stops-ahead {
    padding-left: calc(var(--wl-trail-x) - var(--stops-ahead-dot-size) / 2);
  }
  .stops-ahead-stop {
    position: relative;
    display: flex;
    flex-direction: column;
    /* Owns the space under the name row on its own — .stops-ahead-others
       used to add a further 2px margin-top, so the real gap was 6px and
       you had to find both declarations to know it. */
    gap: var(--ha-space-1, 4px);
    padding-left: calc(
      var(--stops-ahead-dot-size) + var(--stops-ahead-name-gap)
    );
    min-height: var(--stops-ahead-dot-size);
  }
  .stops-ahead-row {
    display: flex;
    align-items: center;
    gap: var(--ha-space-2, 8px);
    min-height: var(--stops-ahead-dot-size);
  }
  /* Pointer cursor on intermediate stops the user can actually click —
     the row gets role=button only when the stop has transfer-to-
     other-lines (otherLines length above zero) and is therefore an
     expand/collapse affordance for the +N transfer panel. Stops with
     U-Bahn-only inline chips (no toggle) stay text-cursor since
     there is nothing to click. */
  .stops-ahead-row[role="button"] {
    cursor: pointer;
  }
  .stops-ahead-dot {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: var(--stops-ahead-dot-size);
    height: var(--stops-ahead-dot-size);
    border-radius: 50%;
    background: var(--stops-ahead-line);
    z-index: 1;
    forced-color-adjust: none;
  }
  .stops-ahead-name {
    color: var(--primary-text-color);
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .stops-ahead-stop.terminus .stops-ahead-name {
    font-weight: 600;
  }
  .stops-ahead-stop.terminus .stops-ahead-dot {
    /* Hollow ring at the terminus, anchoring "this is where you end up". */
    background: var(--card-background-color, var(--ha-card-background, #fff));
    box-shadow: inset 0 0 0 var(--stops-ahead-line-width) var(--stops-ahead-line);
  }
  /* Transfer-line chips: small pill badges. U-Bahn chips sit inline
     immediately after the station name (always visible, brand-coloured).
     Tram/bus/night transfers sit behind the right-aligned toggle button
     ("+N" with a chevron) and wrap to a second row inside the same
     stop entry when expanded. */
  .stops-ahead-metros {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--ha-space-1, 4px);
    flex-shrink: 0;
  }
  .stops-ahead-line-chip {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: var(--ha-font-weight-bold, 600);
    color: #fff;
    background: var(--primary-color);
    line-height: 1.4;
    forced-color-adjust: none;
  }
  /* "+N ▾" toggle button: pill-shaped, neutral background, chevron
     rotates when the non-metro chip group below is expanded. Pinned
     to the right via margin-left:auto. */
  .stops-ahead-other-toggle {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 1px 4px 1px 6px;
    border: 0;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--secondary-text-color) 14%,
      transparent
    );
    color: var(--secondary-text-color);
    font-size: 0.7rem;
    font-weight: var(--ha-font-weight-bold, 600);
    cursor: pointer;
    flex-shrink: 0;
    line-height: 1.4;
  }
  .stops-ahead-other-toggle ha-icon {
    --mdc-icon-size: 14px;
    transition: transform
      var(--ha-animation-duration-fast, 150ms)
 ease;
  }
  .stops-ahead-stop.transfers-expanded .stops-ahead-other-toggle ha-icon {
    transform: rotate(180deg);
  }
  /* Second-row container for non-metro chips. Wraps freely; sits below
     the station-name row so its width never pushes the layout. */
  .stops-ahead-others {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ha-space-1, 4px);
  }
  /* Non-metro chips render slightly lighter so the inline U-Bahn chips
     stay the dominant signal. */
  .stops-ahead-line-chip--other {
    opacity: 0.92;
  }
  .line-badge {
    /* Paints over the upper half of an open row's connector stub, so the
       stub emerges from the badge's bottom edge. */
    position: relative;
    z-index: 1;
    /* Declared here rather than on the .expanded rule so the corner
       eases back on collapse too. The reduced-motion block at the foot
       of this stylesheet neutralises it for users who opt out. */
    transition: border-radius
      var(--ha-animation-duration-fast, 150ms)
 ease;
    text-align: center;
    font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
    font-weight: 700;
    color: #fff;
    border-radius: 6px;
    padding: 3px var(--wl-badge-pad-x);
    min-width: calc(var(--wl-badge-width) - var(--wl-badge-pad-x) * 2);
    font-size: 0.85rem;
    background: var(--primary-color);
    forced-color-adjust: none;
  }
  /* Towards cell: type-icon sits as a sibling of .towards-rows so when
     the delay wraps under the direction name, both rows share the same
     left edge — aligned with the direction's text, not the icon. */
  .towards {
    display: flex;
    align-items: baseline;
    min-width: 0;
    color: var(--primary-text-color);
  }
  .towards-rows {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 6px;
    row-gap: 2px;
    flex: 1 1 auto;
    min-width: 0;
  }
  .towards-name {
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .type-icon {
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
    margin-right: 4px;
    vertical-align: 1px;
  }
  .delay {
    color: var(--wl-warning);
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }
  /* Trailing column container — holds the optional platform pill and
     the optional flags icons in one grid cell. Inline-flex so platform
     sits left of flags (and thus left of the wheelchair icon, per the
     portfolio convention). */
  .row-end {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  /* Platform pill — small, muted, monospace digits so "Steig 7" /
     "Gleis 12" line up visually across rows. Same shape as Linz's
     .row-platform with the wiener-namespace tokens. */
  .row-platform {
    font-size: var(--ha-font-size-xs, 0.7rem);
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    padding: 1px 6px;
    border-radius: 4px;
    background: color-mix(
      in srgb,
      var(--secondary-text-color) 12%,
      transparent
    );
  }
  .row-flags {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
  }
  .row-flags ha-icon {
    --mdc-icon-size: 16px;
  }
  .row-flags .disturbance {
    color: var(--wl-warning);
  }
  .countdown {
    font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    min-width: 50px;
    text-align: right;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  /* State colours — Linz parity. now / late / early class lights up
     the countdown so the user catches the schedule deviation at a
     glance without parsing the delay text. The Wiener Linien API does
     not expose a realtime-vs-scheduled distinction, so the live-pulse
     dot Linz uses isn't applicable here — countdowns are coloured
     purely by their delay state. */
  /* .now is per-ROW, not per-station: the row re-declares
     --wl-accent-text from its own line (see _rowAccentText), because the
     value inherited from .station is the hero lead's colour — two lines
     both at Jetzt otherwise paint the same hue. Only this list surface
     resolves per row; the hero and header keep the station accent. */
  .countdown.now   { color: var(--wl-accent-text); }
  .countdown.late  { color: var(--wl-error); }
  .countdown.early { color: var(--wl-rt); }

  /* Empty / fallback states */
  .empty {
    padding: 18px 0;
    color: var(--secondary-text-color);
    text-align: center;
    font-size: 0.85rem;
  }

  /* Footer: attribution timestamp / etc. Right-pin via margin-left:auto.
     Lives inside .wrap (which already pads horizontally), so padding
     stays vertical-only. */
  .foot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    /* Eat .wrap's flex gap above and bottom padding below, so .foot
       butts up against the last row's bottom edge AND bottoms-out at
       the card edge — matching linz-linien (where .foot is a direct
       ha-card child with no gap above and no padding below). Without
       margin-top, .wrap's --wl-row-gap pushes the divider 12px below
       the last row; without margin-bottom, the timestamp sits 8px +
       --wl-pad-y above the card edge instead of being vertically
       centred between divider and edge. */
    margin-top: calc(-1 * var(--wl-row-gap));
    margin-bottom: calc(-1 * var(--wl-pad-y));
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .timestamp {
    margin-left: auto;
  }

  /* Dev-mode strip — visible only with ?wl_debug=1 or localStorage.wl_debug=1 */
  .dev-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.3));
    border-radius: var(--wl-radius-sm);
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .dev-strip-label {
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .dev-strip button {
    padding: 4px 10px;
    border-radius: var(--wl-radius-sm);
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
    background: transparent;
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: 0.78rem;
    cursor: pointer;
  }
  .dev-strip button:hover {
    opacity: 0.8;
  }
  .dev-strip .dev-strip-clear {
    margin-left: auto;
    color: var(--secondary-text-color);
  }

  /* Dev-mode palette panel. Every row shows one accent resolved for both
     schemes at once, on both accented surfaces the countdown lands on —
     so it deliberately does NOT follow the active theme: the two scheme
     blocks carry HA's stock card backgrounds inline. */
  .dev-palette {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
    padding: 8px;
    border: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.3));
    border-radius: var(--wl-radius-sm);
    overflow-x: auto;
  }
  .dev-pal-row {
    display: grid;
    grid-template-columns: 8.5rem 1fr 1fr;
    align-items: stretch;
    gap: 6px;
    min-width: 30rem;
  }
  .dev-pal-id {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    min-width: 0;
  }
  .dev-pal-id code {
    font-size: 0.62rem;
    color: var(--secondary-text-color);
  }
  .dev-pal-badge {
    align-self: flex-start;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.68rem;
    font-weight: 700;
    color: #fff;
    forced-color-adjust: none;
  }
  .dev-pal-scheme {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 6px;
    border-radius: var(--wl-radius-sm);
    border: 1px solid rgba(128, 128, 128, 0.35);
  }
  /* Deliberately a plain horizontal label: writing-mode + rotate would
     save a few px but this panel exists to be read on the old WebViews
     that motivated the fix in the first place. */
  .dev-pal-scheme-label {
    font-size: 0.58rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #8a8a8a;
    flex-shrink: 0;
  }
  .dev-pal-chip {
    display: flex;
    align-items: baseline;
    gap: 5px;
    padding: 4px 6px;
    border-radius: 4px;
    min-width: 0;
  }
  .dev-pal-word {
    font-weight: 700;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  .dev-pal-ratio {
    font-size: 0.62rem;
    font-variant-numeric: tabular-nums;
  }
  .dev-pal-ratio.pass {
    color: #4caf50;
  }
  .dev-pal-ratio.fail {
    color: #ff5252;
  }
  .dev-pal-surface {
    font-size: 0.55rem;
    color: #8a8a8a;
  }
  .dev-pal-out {
    margin-left: auto;
    font-size: 0.6rem;
    color: #8a8a8a;
  }

  /* QR icon button — gentle accent tint while the panel is expanded
     so the toggle state reads at a glance, mirroring how dep-row's
     row-chevron flips on expand. */
  .qr-toggle.expanded {
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-text-color);
  }
  /* Inline QR panel — same 0fr↔1fr grid-template-rows trick as
     .dep-row-detail and .stops-ahead-detail so the panel animates to
     its intrinsic height and never clips the canvas mid-transition.
     Sits between the header and the hero so the QR feels like an
     extension of the stop card rather than a modal interruption. */
  .qr-panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
  }
  .qr-panel.expanded {
    grid-template-rows: 1fr;
  }
  .qr-panel-inner {
    overflow: hidden;
    min-height: 0;
  }
  .qr-panel-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 0 4px;
    cursor: pointer;
  }
  /* Canvas wrapper — qr-creator appends a 220×220 canvas; the white
     plate gives the QR a quiet zone independent of theme background
     so contrast stays clean in dark mode too. */
  .qr-canvas {
    padding: 10px;
    background: #fff;
    border-radius: var(--wl-radius-md);
    line-height: 0;
    forced-color-adjust: none;
  }
  .qr-canvas canvas {
    display: block;
    width: 100%;
    max-width: 220px;
    height: auto;
  }
  .qr-panel-hint {
    margin: 0;
    text-align: center;
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    line-height: 1.4;
    max-width: 280px;
  }

  /* Container density ladder. One token tweak per breakpoint cascades
     through every component above. */
  @container wlcard (inline-size < 360px) {
    :host {
      --wl-pad-x: 12px;
      --wl-pad-y: 12px;
      --wl-tile-size: 36px;
      --wl-slot-min-h: 40px;
      --wl-metric-size: 2rem;
    }
    .tabs {
      padding: 0 8px;
    }
    .tab {
      padding: 0 8px;
      font-size: 0.8125rem;
    }
  }

  /* Narrow cards (sidebar dashboards, mobile portrait) — the hero
     stacks "Jetzt"/countdown above the line + towards row so the
     direction name gets the full container width instead of being
     truncated next to a wide "Jetzt". */
  @container wlcard (inline-size < 420px) {
    .hero {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }
  }

  @container wlcard (inline-size > 480px) {
    :host {
      --wl-pad-x: 20px;
      --wl-pad-y: 16px;
      --wl-tile-size: 44px;
      --wl-metric-size: 2.5rem;
    }
    .icon-tile ha-icon {
      --mdc-icon-size: 24px;
    }
    /* Wide enough to afford the metro-map indent. The stroke's right
       edge sits flush with the badge's right border (hence the half
       line-width back-off), so with that corner squared off the line
       reads as the border itself continuing downwards rather than as a
       separate stroke starting near it. Narrow cards keep the
       flush-left layout for readability of long station names. Moving
       the token moves the stub, the line and the dots together. */
    .dep-list {
      --wl-trail-x: calc(
        var(--wl-row-pad-left) + var(--wl-badge-width) -
          var(--stops-ahead-line-width) / 2
      );
    }
    /* Nudge the direction text onto the same axis as the stop names
       below it. The grid puts this cell at badge + column-gap; a stop
       name sits at the dot column + its name gap, and the dot column is
       inset from the badge's right border by half a dot less half the
       stroke. The difference is what's added back here — 6px at the
       default tokens. Wide cards only: on narrow ones the trail runs
       flush left, so the stop names are far to the LEFT of the direction
       and closing the gap would drag this text under the badge. */
    .towards {
      margin-left: calc(
        var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2 +
          var(--stops-ahead-name-gap) - var(--wl-dep-col-gap)
      );
    }
    /* Trail is indented out here, so it leaves the badge's trailing
       edge — square that corner instead of the leading one. */
    .dep-row.expanded .line-badge {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 0;
    }
    /* The hero panel has no badge to grow from, so it keeps the plain
       indent rather than following --wl-trail-x. */
    .hero-detail .stops-ahead {
      padding-left: calc(2.4em + 8px);
    }
    .hero > .hero-detail {
      grid-column: 2;
    }
  }

  /* Accessibility primitives — verbatim from the project spec. */
  .tab:focus-visible,
  .alert:focus-visible,
  .dep-row.expandable:focus-visible,
  .hero-entry.expandable:focus-visible,
  .stops-ahead-other-toggle:focus-visible,
  .icon-action:focus-visible,
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 6px;
  }
  @media (forced-colors: active) {
    .icon-tile,
    .line-badge,
    .alert,
    .dep-row {
      forced-color-adjust: none;
      outline: 1px solid CanvasText;
    }
  }

  /* First-paint stagger (frontend-design audit) — subtle cascading
     reveal on initial mount. Each departure row inlines its
     position-in-list via style="--row-i: N"; the keyframe runs once
     forwards. Capped at 6 rows so long lists don't take ages to
     settle. The motion-reduce catch-all below collapses the
     animation duration to 0.01ms, leaving the end-state visible
     instantly for users who opt out. */
  @keyframes wlRowReveal {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  .dep-row,
  .hero-host,
  .alert-row {
    animation: wlRowReveal 360ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
    animation-delay: calc(min(var(--row-i, 0), 6) * 55ms);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
