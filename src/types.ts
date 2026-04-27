import type { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from "custom-card-helpers";

// Register editor element tags with the global customElements registry so
// TypeScript autocompletes them inside html`…` templates.
declare global {
  interface HTMLElementTagNameMap {
    "wiener-linien-austria-card-editor": LovelaceCardEditor;
    "wiener-linien-austria-retro-card-editor": LovelaceCardEditor;
    "hui-error-card": LovelaceCard;
  }
}

// ---------------------------------------------------------------------------
// Entity-attribute shapes as surfaced by the Python sensor.
// Keep in sync with sensor.extra_state_attributes in custom_components/.
// ---------------------------------------------------------------------------

export type DepartureDirection = "H" | "R";

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
  entities?: Array<ModernStopConfig | string>;
  // v0.1.x back-compat: single-entity legacy shape is promoted to entities[0]
  // inside normaliseConfig. Both shapes read here; only `entities` survives.
  entity?: string;
  lines?: string[];
  direction?: "H" | "R" | "";
  walk_times?: WalkTimes;

  max_departures?: number;
  line_colors?: Record<string, string>;

  show_accessibility?: boolean;
  accessibility_only?: boolean;
  show_traffic_info?: boolean;
  show_elevator_info?: boolean;
  show_delay?: boolean;
  show_type_icon?: boolean;
  show_platform?: boolean;
  show_hero_metric?: boolean;
  show_departures?: boolean;
  hide_header?: boolean;
  hide_attribution?: boolean;

  layout?: "stacked" | "tabs";
}

// ---------------------------------------------------------------------------
// Retro card config (single stop, single direction, LED aesthetic).
// ---------------------------------------------------------------------------

export type RetroSize = "small" | "medium" | "regular";
export type RetroStationBg = "default" | "white" | "black";
export type RetroStyle = "classic" | "warm" | "pixel";

export interface WienerLinienRetroCardConfig extends LovelaceCardConfig {
  type: string;
  entity?: string;
  direction?: "H" | "R";
  line?: string;
  show_platform?: boolean;
  show_station_name?: boolean;
  station_bg?: RetroStationBg;
  size?: RetroSize;
  style?: RetroStyle;
  flicker?: boolean;
  wheelchair_race?: boolean;
  accessibility_only?: boolean;
  walk_times?: WalkTimes;
}
