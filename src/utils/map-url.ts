import { safeHttpsUri } from "../utils.js";

/**
 * Link a stop to the official Vienna city map (beta viewer) —
 * stadtplan.wien.gv.at, maintained by Magistrat der Stadt Wien. Built on
 * basemap.at tiles, renders the Wiener-Linien stop network natively, and
 * exposes a hash-based permalink with a stable WGS84 contract:
 *
 *   #/@<lon>,<lat>,<zoom>,<rotation>,<tilt>,<basemap>/<theme>
 *
 * Used by the departure card (header map button, dialog link) and the route
 * card (the pin after each stop name). Falls back to an OpenStreetMap search
 * by name when there are no coordinates: a departure sensor seeds them from
 * the static catalogue at config-flow time, a route stop only when the
 * catalogue knows its DIVA (S-Bahn-only stations don't).
 *
 * Always `https://`: the HA Companion WebView drops `geo:` links.
 */
export function stopMapUrl(
  stopName: string | undefined,
  lat: number | null | undefined,
  lon: number | null | undefined,
): string | null {
  let url: string | null = null;
  if (typeof lat === "number" && typeof lon === "number") {
    // 17.5 is street-level zoom — close enough that the stop and its
    // platforms read clearly without losing the surrounding block.
    url = `https://stadtplan.wien.gv.at/#/@${lon},${lat},17.5,0,0,standard/themes`;
  } else if (stopName) {
    url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${stopName}, Wien`)}`;
  }
  return url ? safeHttpsUri(url) || null : null;
}
