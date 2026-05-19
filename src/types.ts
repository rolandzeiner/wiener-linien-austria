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

/** Minimal HA shape — only the fields these cards touch. `language` is
 *  the user-profile locale; `localize` is HA's own UI translation
 *  lookup the editors reuse for built-in field names; `callWS` powers
 *  the card-version probe; `themes.darkMode` is reserved for future
 *  adaptive-logo work. Anything beyond these lives untyped and is read
 *  with a cast at the call site. */
export interface HomeAssistant {
  states: Record<string, HassEntity>;
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

/** Window shape for the HA `customCards` registry. Both card entrypoints
 *  push their picker descriptor into `window.customCards` at module
 *  load — this interface is the canonical cast target so the two
 *  registration blocks read identically and a future maintainer can't
 *  drift the field name (`customCards` vs `customCardsRegistry`). */
export interface WindowWithCustomCards extends Window {
  customCards?: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// ha-form schema types — keep narrow on purpose so the schema builder stays
// strictly typed. `expandable` + `flatten: true` is non-negotiable —
// without `flatten`, ha-form scopes inner-schema values under `data[name]`
// and the card's flat-key reads silently default. The interface declares
// `flatten?: boolean` explicitly so a future maintainer can't add an
// expandable that quietly nests its values.
// ---------------------------------------------------------------------------

export type HASelector =
  | {
      entity: {
        domain?: string | string[];
        integration?: string;
        multiple?: boolean;
      };
    }
  | { boolean: Record<string, never> }
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

/** Exit-icon variant for one side of the station header strip.
 *  `"none"` suppresses the icon entirely on that side. */
export type RetroHeaderExit = "none" | "regular" | "accessible";

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
}

export interface WienerLinienRetroCardConfig extends LovelaceCardConfig {
  type: string;
  // `?: T | undefined` — dual form for `exactOptionalPropertyTypes`
  // compatibility (callers may set or omit each field).
  entity?: string | undefined;
  direction?: "H" | "R" | undefined;
  line?: string | undefined;
  show_platform?: boolean | undefined;
  show_station_name?: boolean | undefined;
  station_bg?: RetroStationBg | undefined;
  size?: RetroSize | undefined;
  style?: RetroStyle | undefined;
  flicker?: boolean | undefined;
  wheelchair_race?: boolean | undefined;
  accessibility_only?: boolean | undefined;
  walk_times?: WalkTimes | undefined;
  header_left?: RetroHeaderSide | undefined;
  header_right?: RetroHeaderSide | undefined;
}
