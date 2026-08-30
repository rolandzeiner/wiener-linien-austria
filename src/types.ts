// Local mirror of the HA / Lovelace types this card actually uses.
// Replaces the `custom-card-helpers` dependency — the package is
// effectively unmaintained and bundled HA-internal types drift faster
// than its release cadence. `fireEvent` is duplicated as a 6-line shim
// inside the editor modules (see `editor.ts` and `retro-editor.ts`),
// keeping the types layer free of any value-side helper.

/** Single entity in `hass.states`. The attributes bag is open-ended —
 *  the integration's coordinator emits the keys these cards read
 *  (`departures`, `traffic_info`, `attribution`, `lift_info`, …). */
export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
  entity_id?: string;
}

/** Slim mirror of an `hass.entities` registry entry. The 2026.6 card
 *  picker's `getEntitySuggestion` reads `platform` to decide whether an
 *  entity belongs to this integration; the rest of the registry record
 *  is open-ended and untyped here. */
export interface HassEntityRegistryEntry {
  platform?: string;
  [key: string]: unknown;
}

/** Minimal HA shape — only the fields these cards touch. `language` is
 *  the user-profile locale; `localize` is HA's own UI translation
 *  lookup the editors reuse for built-in field names; `callWS` powers
 *  the card-version probe; `themes.darkMode` is reserved for future
 *  adaptive-logo work; `entities` is the registry map the 2026.6 card
 *  picker's `getEntitySuggestion` hook consults for platform gating.
 *  Anything beyond these lives untyped and is read with a cast at the
 *  call site. */
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities?: Record<string, HassEntityRegistryEntry>;
  language?: string;
  themes?: { darkMode?: boolean } & Record<string, unknown>;
  config?: { time_zone?: string } & Record<string, unknown>;
  localize?: (key: string, ...args: unknown[]) => string;
  callWS?<T = unknown>(msg: { type: string; [key: string]: unknown }): Promise<T>;
}

/** Marker every card config extends. */
export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

/** Custom-card editor contract — Lovelace expects an HTMLElement that
 *  accepts `setConfig(config)` and reads `hass`. */
export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}

/** `LovelaceCard` is only referenced as the `hui-error-card` tag-map
 *  entry below, so an HTMLElement alias suffices. */
export type LovelaceCard = HTMLElement;

// Register editor element tags with the global customElements registry so
// TypeScript autocompletes them inside html`…` templates.
declare global {
  interface HTMLElementTagNameMap {
    "wiener-linien-austria-card-editor": LovelaceCardEditor;
    "wiener-linien-austria-retro-card-editor": LovelaceCardEditor;
    "hui-error-card": LovelaceCard;
    "ha-form": HaFormElement;
  }
}

/** One descriptor in `window.customCards`. The base picker fields are
 *  open-ended (`type`, `name`, `description`, `preview`, …); HA 2026.6
 *  adds the optional `getEntitySuggestion` hook that lets a card opt into
 *  the entity-first picker by returning a card-config stub (or an array of
 *  them, or `null`) for a given entity. Older HA simply ignores the key,
 *  so it is fully backward-compatible. */
export interface CustomCardEntry extends Record<string, unknown> {
  getEntitySuggestion?: (
    hass: HomeAssistant,
    entityId: string,
  ) => Record<string, unknown> | Array<Record<string, unknown>> | null;
}

/** Window shape for the HA `customCards` registry. All three card
 *  entrypoints push their picker descriptor into `window.customCards` at
 *  module load — this interface is the canonical cast target so the
 *  registration blocks read identically and a future maintainer can't
 *  drift the field name (`customCards` vs `customCardsRegistry`). */
export interface WindowWithCustomCards extends Window {
  customCards?: CustomCardEntry[];
}

// ---------------------------------------------------------------------------
// ha-form schema types — keep narrow on purpose so the schema builder stays
// strictly typed. `expandable` + `flatten: true` is non-negotiable —
// without `flatten`, ha-form scopes inner-schema values under `data[name]`
// and the card's flat-key reads silently default. The interface declares
// `flatten?: boolean` explicitly so a future maintainer can't add an
// expandable that quietly nests its values.
// ---------------------------------------------------------------------------

export interface DeviceSelectorFilter {
  integration?: string;
  manufacturer?: string;
  model?: string;
  model_id?: string;
}

// Entity picker filter. Keys inside one object are ANDed; a list of objects
// is ORed. Matching is exact, case-sensitive string equality. `device` needs
// HA 2026.8+ — older frontends ignore the key, so the picker simply narrows
// less rather than erroring, which is safe under this repo's HA floor.
export interface EntitySelectorFilter {
  integration?: string;
  domain?: string | string[];
  device_class?: string | string[];
  supported_features?: string[];
  unit_of_measurement?: string | string[];
  device?: DeviceSelectorFilter;
}

// Filters belong under `filter`. The flat `domain` / `integration` /
// `device_class` keys are deprecated upstream (LegacyEntitySelector) and are
// dropped without warning when a `filter` key is present, so never mix them.
export interface EntitySelectorConfig {
  filter?: EntitySelectorFilter | ReadonlyArray<EntitySelectorFilter>;
  multiple?: boolean;
  reorder?: boolean;
  include_entities?: string[];
  exclude_entities?: string[];
}

export type HASelector =
  | { entity: EntitySelectorConfig }
  | { boolean: Record<string, never> }
  | { icon: Record<string, never> }
  | { text: { type?: "text" | "password" | "url" | "email"; multiline?: boolean } }
  | {
      number: {
        min?: number;
        max?: number;
        step?: number;
        mode?: "box" | "slider";
        unit_of_measurement?: string;
      };
    }
  | {
      select: {
        mode?: "dropdown" | "list";
        multiple?: boolean;
        custom_value?: boolean;
        options: ReadonlyArray<{ value: string; label: string }>;
      };
    };

export interface HaFormBaseSchema {
  name: string;
  required?: boolean;
}

export interface HaFormSelectorSchema extends HaFormBaseSchema {
  selector: HASelector;
}

export interface HaFormGridSchema {
  type: "grid";
  name: "";
  schema: ReadonlyArray<HaFormSchema>;
}

export interface HaFormExpandableSchema {
  type: "expandable";
  name: string;
  title?: string;
  /** When true, ha-form keeps the inner schema's values flat in
   *  `data` (i.e. `data.show_platform` rather than `data.display.show_platform`).
   *  Required for cards whose render() reads flat config keys —
   *  forgetting it silently leaves every flag at its default. */
  flatten?: boolean;
  schema: ReadonlyArray<HaFormSchema>;
}

export type HaFormSchema =
  | HaFormSelectorSchema
  | HaFormGridSchema
  | HaFormExpandableSchema;

// `<ha-form>` element shape — mirror the props the editor sets so
// `tsc --noEmit` validates the template at compile time.
interface HaFormElement extends HTMLElement {
  hass?: HomeAssistant;
  data?: Record<string, unknown>;
  schema?: ReadonlyArray<HaFormSchema>;
  computeLabel?: (field: { name: string }) => string;
  computeHelper?: (field: { name: string }) => string | undefined;
}

// ---------------------------------------------------------------------------
// Entity-attribute shapes as surfaced by the Python sensor.
// Keep in sync with sensor.extra_state_attributes in custom_components/.
// ---------------------------------------------------------------------------

export type DepartureDirection = "H" | "R";

// One entry on the per-departure "stops ahead" trail. `is_terminus`
// only appears on the final stop. `lines` is the list of OTHER lines
// (excluding the one this departure runs on) that pass through this
// stop — sourced from the static trip-pattern index. Stops with no
// transfers omit the field entirely.
export interface StopAheadAttr {
  name: string;
  is_terminus?: boolean;
  lines?: string[];
}

export interface DepartureAttr {
  line: string;
  towards: string;
  direction: DepartureDirection | string;
  type: string;
  countdown: number;
  time_planned?: string | null;
  time_real?: string | null;
  realtime?: boolean;
  barrier_free?: boolean;
  traffic_jam?: boolean;
  platform?: string | null;
  /** Vehicle is air conditioned. Reported per vehicle, not per line, and
   *  omitted entirely by older feeds — absent reads as "not reported". */
  cooling?: boolean;
  // Via / over routing — when present, the retro card alternates the
  // destination text with `ÜBER {via}` / `VIA {via}` every few seconds.
  // Absent on every departure today; reserved for a future sensor
  // extension so the renderer is forward-compatible without a schema
  // change later.
  via?: string | null;
  // Optional per-departure list of upcoming stops on this trip. Absent
  // (or empty) means "no panel" — the row renders without a chevron.
  stops_ahead?: StopAheadAttr[];
}

export interface TrafficInfoAttr {
  name: string;
  title: string;
  description?: string;
  description_html?: string;
  location?: string;
  related_lines?: string[];
  related_stops?: number[];
  time_start?: string;
  time_end?: string;
  time_created?: string;
  time_last_update?: string;
  status?: string;
}

export interface ElevatorInfoAttr {
  name: string;
  station: string;
  description?: string;
  reason?: string;
  status?: string;
  time_start?: string;
  time_end?: string;
  related_stops?: number[];
  related_lines?: string[];
}

// GTFS-derived line palette: { "U1": { bg: "E3000F", fg: "FFFFFF" }, … }.
// Hex is 6-digit uppercase WITHOUT a leading `#` (matches the `routes.txt`
// payload — the card prepends `#` at use-site). `fg` is omitted when the
// upstream `route_text_color` was blank for that line.
export interface LineColorPair {
  bg: string;
  fg?: string;
}

export type LineColorsMap = Record<string, LineColorPair>;

export interface WienerLinienAttrs {
  attribution?: string;
  stop_name?: string;
  friendly_name?: string;
  diva?: number;
  latitude?: number | null;
  longitude?: number | null;
  server_time?: string | null;
  // Upstream plausibility signals from the coordinator. `stale_departures`
  // is how many records the last poll dropped because their planned times
  // had stopped advancing; `stale_since` is the newest planned time among
  // them — roughly when the feed froze. Absent on integration versions
  // older than 1.7.8, which is why every read treats them as optional.
  stale_departures?: number;
  stale_since?: string | null;
  departures?: DepartureAttr[];
  next_by_line?: Record<string, number>;
  // Static-catalogue line list for this stop — every line serving the
  // DIVA per the Wiener Linien schedule, regardless of whether it has
  // a live departure right now. Empty array (or absent) until the
  // catalogue's trip-pattern index has loaded.
  lines_at_stop?: string[];
  // User-tracked subset of `lines_at_stop` — line names selected in
  // the integration's config flow. Card editors prefer this so the
  // per-stop pickers only surface lines the user opted into.
  tracked_lines?: string[];
  // Raw `{line}|{direction}` keys for tracked lines. Used by the retro
  // card editor to filter the line list by direction without losing
  // off-service lines.
  tracked_line_keys?: string[];
  // GTFS-derived per-line colours, scoped to the lines at this stop.
  // Empty when the static catalogue hasn't been loaded yet.
  line_colors?: LineColorsMap;
  traffic_info?: TrafficInfoAttr[];
  elevator_info?: ElevatorInfoAttr[];
}

// ---------------------------------------------------------------------------
// Modern card config (multi-stop, rich filters, tabs/stacked layout).
// ---------------------------------------------------------------------------

export type WalkTimes = Record<string, number>;

export interface ModernStopConfig {
  entity: string;
  lines?: string[];
  direction?: "H" | "R" | "";
  // Per-line direction override. Absence of an entry for a given line
  // means the stop-wide `direction` (or "Both" if that's also unset)
  // applies to it. Allows mixed routing: "U1 toward city, U3 toward
  // home" at the same stop.
  line_directions?: Record<string, "H" | "R">;
  walk_times?: WalkTimes;
}

export interface WienerLinienCardConfig extends LovelaceCardConfig {
  type: string;
  entities?: Array<ModernStopConfig | string> | undefined;
  // v0.1.x back-compat: single-entity legacy shape is promoted to entities[0]
  // inside normaliseConfig. Both shapes read here; only `entities` survives.
  // `?: T | undefined` dual form for exactOptionalPropertyTypes compatibility.
  entity?: string | undefined;
  lines?: string[] | undefined;
  direction?: "H" | "R" | "" | undefined;
  walk_times?: WalkTimes | undefined;

  max_departures?: number | undefined;
  line_colors?: Record<string, string> | undefined;

  show_accessibility?: boolean | undefined;
  accessibility_only?: boolean | undefined;
  /** Show a snowflake beside departures whose vehicle is air conditioned. */
  show_cooling?: boolean | undefined;
  show_traffic_info?: boolean | undefined;
  show_elevator_info?: boolean | undefined;
  show_delay?: boolean | undefined;
  show_type_icon?: boolean | undefined;
  show_platform?: boolean | undefined;
  show_hero_metric?: boolean | undefined;
  show_departures?: boolean | undefined;
  show_stops_ahead?: boolean | undefined;
  show_qr_button?: boolean | undefined;
  hide_header?: boolean | undefined;
  hide_attribution?: boolean | undefined;

  layout?: "stacked" | "tabs" | undefined;
}

// ---------------------------------------------------------------------------
// Retro card config (single stop, single direction, LED aesthetic).
// ---------------------------------------------------------------------------

export type RetroSize = "small" | "medium" | "regular";
export type RetroStationBg = "default" | "white" | "black";
export type RetroStyle = "classic" | "warm" | "pixel";
/** Side the GLEIS / STEIG column appears on. `"auto"` is the
 *  pre-feature default — platform "2" lands on the left, everything
 *  else on the right (the U-Bahn signage convention). `"left"` /
 *  `"right"` are explicit overrides for users who want their card to
 *  mirror a real station view that disagrees with the heuristic. */
export type RetroPlatformSide = "auto" | "left" | "right";

/** Exit-icon variant for one side of the station header strip.
 *  Either `"none"` (suppresses the icon), one of the two WL-traced
 *  signage glyphs (`"regular"` / `"accessible"`), or an MDI icon
 *  identifier from the curated `RetroHeaderMdiExit` set in
 *  utils/retro-station-icons.ts. Kept as a broad template literal
 *  here (`mdi:${string}`) to avoid a circular `types.ts ↔ utils`
 *  type import; the runtime normaliser validates against the
 *  curated set. */
export type RetroHeaderExit =
  | "none"
  | "regular"
  | "accessible"
  | `mdi:${string}`;

/** Per-side config for the retro card's optional U-Bahn-signage
 *  header strip (the black band above the orange station name).
 *  When every field is unset / falsy / `"none"`, the side renders
 *  nothing and — if both sides empty — the whole strip is omitted
 *  (backward-compatible). */
export interface RetroHeaderSide {
  exit?: RetroHeaderExit | undefined;
  /** Text label on this side — typically the name of the
   *  adjacent station or passage. Bounded to 64 chars at
   *  normalisation; ellipsised at render. */
  text?: string | undefined;
  show_wc?: boolean | undefined;
  show_escalator?: boolean | undefined;
  show_elevator?: boolean | undefined;
  /** Render the current server_time as a white HH:MM pill in this
   *  side's chip lane. The pill always sits at the innermost edge
   *  of its side (rightmost on `header_left`, leftmost on
   *  `header_right`), so the two clocks meet in the centre of the
   *  strip when both sides enable it. Off by default. */
  show_clock?: boolean | undefined;
  /** Render the current date as a white pill in this side's chip
   *  lane, formatted with `date_format`. Sits one slot outside the
   *  clock chip on the same side, so time stays innermost. Off by
   *  default. */
  show_date?: boolean | undefined;
  /** PHP-style date format string used by `show_date`. Supported
   *  tokens: d j (day), m n (month), Y y (year), D l (weekday),
   *  M F (month name), H G h g (hour), i (minute), s (second).
   *  Backslash escapes a literal character. Default `"d.m.Y"`.
   *  Bounded to 32 chars at normalisation. */
  date_format?: string | undefined;
  /** Optional sequence of short text chips rendered as white
   *  boxes after the WC tile (further from the sign text than
   *  any amenity icon). Useful for short labels like platform
   *  numbers, line designators, or auxiliary signage text.
   *  Each chip is trimmed and bounded to 16 chars; the list is
   *  capped at 6 entries to defensively guard against a
   *  runaway config blowing out the strip. */
  chips?: string[] | undefined;
  /** Free-form MDI icon keys rendered as black-on-white tiles
   *  between the WC tile and the text chips. Storage is a flat
   *  `string[]` of `mdi:*` identifiers — same chip-input pattern
   *  the editor uses for `chips`, because ha-form's icon selector
   *  doesn't reliably commit clicks when nested inside a
   *  `flatten: false` expandable (HA core only uses icon selectors
   *  at the root data level or inside `flatten: true` expandables).
   *  User types or pastes the MDI key (e.g. "mdi:parking"); the
   *  normaliser drops entries that don't start with `mdi:`. Capped
   *  at 3 entries. */
  extra_icons?: string[] | undefined;
}

export interface WienerLinienRetroCardConfig extends LovelaceCardConfig {
  type: string;
  // `?: T | undefined` — dual form for `exactOptionalPropertyTypes`
  // compatibility (callers may set or omit each field).
  entity?: string | undefined;
  direction?: "H" | "R" | undefined;
  line?: string | undefined;
  show_platform?: boolean | undefined;
  platform_side?: RetroPlatformSide | undefined;
  show_station_name?: boolean | undefined;
  station_bg?: RetroStationBg | undefined;
  size?: RetroSize | undefined;
  style?: RetroStyle | undefined;
  flicker?: boolean | undefined;
  wheelchair_race?: boolean | undefined;
  accessibility_only?: boolean | undefined;
  /** When `true`, every 5 minutes the LED panel clears and
   *  `message_text` scrolls across it once as a marquee, then the
   *  departures return. Default `false` — pre-feature cards render
   *  unchanged. Inert while `message_text` is empty. */
  message_ticker?: boolean | undefined;
  /** Custom text scrolled by `message_ticker`. Trimmed and bounded
   *  to 160 chars at normalisation. */
  message_text?: string | undefined;
  walk_times?: WalkTimes | undefined;
  /** Master toggle for the U-Bahn-style station-header strip above
   *  the orange station-name band. When `false` (the default), the
   *  strip is suppressed and the card renders as it did pre-1.5.0,
   *  even if `header_left` / `header_right` are configured.
   *  Per-side configs are preserved (so toggling back on restores
   *  them); this just gates the render. */
  show_header?: boolean | undefined;
  header_left?: RetroHeaderSide | undefined;
  header_right?: RetroHeaderSide | undefined;
  /** Tweak — render the line code as a filled rounded pill in the
   *  line's resolved colour (GTFS routes.txt → nightline rule →
   *  amber fallback) with a soft outer glow. Off by default; the LED
   *  panel's canonical voice is monochrome amber. */
  line_pill?: boolean | undefined;
  /** Tweak — paint a 4 px vertical bar at each row's left edge in the
   *  line's resolved colour with a faint matching glow. Off by default
   *  so pre-feature retro cards stay byte-identical. */
  line_stripe?: boolean | undefined;
  /** Tweak — wrap the LED panel in an outer dark bezel with a soft
   *  inner highlight and a subtle glass-reflection gradient over the
   *  display. Off by default; existing dashboards keep the flush
   *  edge-to-edge look. */
  housing?: boolean | undefined;
  /** Tweak — trail each countdown number with a small amber-caps
   *  unit ("min" / "min"). Off by default; the LED board's canonical
   *  voice is digits only. */
  show_unit?: boolean | undefined;
}

// ---------------------------------------------------------------------------
// Flap card config — the warm-cream Solari split-flap board card.
// A separate card type (not a retro-card theme); each visible character
// renders as its own mechanical flap tile and only changed positions
// animate.
// ---------------------------------------------------------------------------

export type FlapSize = "small" | "medium" | "regular";

/** Station-name band background.
 *  - `"line"`     — sentinel: use the first tracked line's GTFS colour
 *                   at render time (e.g. U1 → red, U3 → orange).
 *  - `"line:U1"`  — explicit per-line colour, picked from the editor's
 *                   per-line dropdown when the user wants a specific
 *                   line's tint on a multi-line board.
 *  - `"white"`    — solid white.
 *  - `"black"`    — solid black.
 *  String-template form keeps the union open without compile-time
 *  enumeration of every Wiener Linien line; the normaliser validates
 *  the prefix and the renderer falls back to WL-orange if the named
 *  line isn't in the live `line_colors` map. */
export type FlapStationBg = "line" | "white" | "black" | `line:${string}`;

/** Per-stop config inside `WienerLinienFlapCardConfig.entities`.
 *  Same grammar as the modern card's `ModernStopConfig`: an entity
 *  plus optional filters that scope the merged departure feed.
 *  `direction` `""` (or undefined) keeps both directions. */
export interface FlapStopConfig {
  entity: string;
  lines?: string[];
  direction?: "H" | "R" | "";
  /** Per-line direction override. Absence of an entry for a given
   *  line means the stop-wide `direction` applies. */
  line_directions?: Record<string, "H" | "R">;
  walk_times?: WalkTimes;
}

export interface WienerLinienFlapCardConfig extends LovelaceCardConfig {
  type: string;
  /** Multi-stop array. Each entry is either a bare sensor entity id
   *  (string) or a full `FlapStopConfig` object. Mirrors the
   *  modern card so a flap card can show departures from up to 8
   *  stops on one board, sorted by countdown across the whole
   *  feed. */
  entities?: Array<FlapStopConfig | string> | undefined;
  /** v1.5.x back-compat: single-entity legacy shape — promoted into
   *  `entities[0]` inside the normaliser. Both shapes round-trip;
   *  only `entities` survives the normalise pass. */
  entity?: string | undefined;
  direction?: "H" | "R" | "" | undefined;
  line?: string | undefined;
  lines?: string[] | undefined;
  size?: FlapSize | undefined;
  /** Number of departure rows rendered. Clamped to 1..8. Default 2. */
  max_rows?: number | undefined;
  /** Render a per-row GLEIS / STEIG platform tile in its own column,
   *  immediately before the countdown. Each row carries its OWN
   *  platform value (multi-stop boards can mix platforms from
   *  different stops). Fixed position, no side configuration —
   *  per-row platforms remove the "global column jumps when the
   *  first row's platform changes" problem the old side-toggle was
   *  there to work around. */
  show_platform?: boolean | undefined;
  /** Show the WL-orange station-name band. Mirrors the retro card's
   *  field of the same name. Default `true`. */
  show_station_name?: boolean | undefined;
  /** Background colour for the station-name band. Defaults to the
   *  first tracked line's GTFS colour (sentinel `"line"`); user can
   *  pick a specific line (`"line:U3"`), `"white"`, or `"black"`. */
  station_bg?: FlapStationBg | undefined;
  /** @deprecated Renamed to `show_station_name` to match retro card.
   *  Accepted by the normaliser for back-compat (existing configs
   *  using the old key keep working); new configs should use
   *  `show_station_name`. */
  show_station_header?: boolean | undefined;
  /** Show a small "min" caption after each countdown number. */
  show_min_unit?: boolean | undefined;
  /** Show the wheelchair pictogram tile when a departure is step-free. */
  show_accessibility?: boolean | undefined;
  /** Filter to step-free departures only. */
  accessibility_only?: boolean | undefined;
  walk_times?: WalkTimes | undefined;
  /** Master toggle for the U-Bahn-style signage strip ABOVE the
   *  orange station-name band. Black band with exit icons, amenity
   *  tiles, chips, clock + date — visually identical to the retro
   *  card's strip but recoloured with the flap card's cream
   *  palette so chips read as flap-pocket material, not as bright
   *  white. Defaults to `false`; per-side configs are preserved
   *  when toggled, so flipping it back on restores everything. */
  show_header?: boolean | undefined;
  header_left?: RetroHeaderSide | undefined;
  header_right?: RetroHeaderSide | undefined;
  /** Hide the CC-BY data-source attribution footer. Default `false`
   *  (footer visible) — mirrors the modern card's `hide_attribution`
   *  and complies with the Wiener Linien OGD licence requirement
   *  unless the user explicitly opts out. */
  hide_attribution?: boolean | undefined;
  /** Tweak — hide the line column entirely. Useful for single-line
   *  setups where the line is implicit (e.g. a card scoped to one
   *  metro line via per-stop `lines` filter). Default `false`. The
   *  name mirrors the retro card's `line_pill` toggle by convention,
   *  even though the flap-card effect is different (column hide vs
   *  pill render); both are presentation tweaks on the line slot. */
  line_pill?: boolean | undefined;
  /** Tweak — wrap the board in the cream-cabinet housing (bevel +
   *  drop shadow). Default `true` (preserves the original flap-card
   *  look). When `false`, the board sits flush against the dashboard
   *  with no surround — matches the retro card's `housing` semantics
   *  (off = flush, on = bezel). */
  housing?: boolean | undefined;
}
