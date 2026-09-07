// Logic shared by the three card editors.
//
// v2 extracted the shared *widgets* — the tab shell, the stop block, the header
// strip — but left the shared *class* unextracted, so each editor still carried
// its own copy of the stop mutations, the entity rebuild, the header-side patch
// and the label resolvers. Ten of twelve clone groups in the repo sat entirely
// inside the editors, and every copy could drift on its own: the modern and
// flap entity handlers had already diverged on whether to re-normalise, and the
// three `computeLabel`s had produced three different words for one control.
//
// These are plain functions rather than a base class on purpose. The editors
// differ in config shape (retro is flat and single-stop, modern and flap carry
// an `entities` array) and in which of these they need at all; a base class
// would have to be generic over the config type to express that, which buys
// nothing over passing the two or three values each function actually reads.
// It also matches how the rest of the editor surface is already factored.

import type { StopBlockCallbacks } from "./stop-block.js";
import type { EditorTranslators } from "./editor-i18n.js";
import type { HomeAssistant, RetroHeaderSide } from "../types.js";

/** The per-stop shape the multi-stop editors mutate. `NormalisedModernStop`
 *  and `NormalisedFlapStop` are structurally identical and both satisfy it.
 *
 *  Optional fields use the bare `?:` form, matching both normalisers: under
 *  `exactOptionalPropertyTypes` the callbacks below only ever produce absence
 *  (via `delete`), never an explicit `undefined`, which is what the renderers
 *  branch on. */
export interface MutableStop {
  entity: string;
  lines?: string[];
  direction?: "H" | "R";
  line_directions?: Record<string, "H" | "R">;
  walk_times?: Record<string, number>;
}

/**
 * The four stop-block callbacks for a multi-stop editor.
 *
 * `commit` receives the whole rebuilt entities array and is responsible for
 * assigning `_config` before dispatching `config-changed` — the invariant that
 * keeps a custom editor's form from reverting on the next render.
 *
 * Every mutation tidies to absence rather than an empty container, so saved
 * YAML never accumulates `lines: []` or `walk_times: {}`.
 */
export function multiStopCallbacks<S extends MutableStop>(
  getStops: () => ReadonlyArray<S> | undefined,
  commit: (next: S[]) => void,
): StopBlockCallbacks {
  const update = (eid: string, mutator: (s: S) => S): void => {
    const stops = getStops();
    if (!stops) return;
    commit(stops.map((s) => (s.entity === eid ? mutator({ ...s }) : s)));
  };

  return {
    toggleLine: (eid, line) =>
      update(eid, (s) => {
        const cur = new Set(s.lines ?? []);
        if (cur.has(line)) cur.delete(line);
        else cur.add(line);
        if (cur.size) s.lines = [...cur];
        else delete s.lines;
        return s;
      }),
    // One atomic write for both direction levels — the block hands over the
    // whole desired state, so the editor never has to reason about inheritance.
    setDirections: (eid, next) =>
      update(eid, (s) => {
        if (next.direction === null) delete s.direction;
        else s.direction = next.direction;
        if (Object.keys(next.lineDirections).length) {
          s.line_directions = next.lineDirections;
        } else {
          delete s.line_directions;
        }
        return s;
      }),
    setWalkTime: (eid, key, minutes) =>
      update(eid, (s) => {
        const cur = { ...(s.walk_times ?? {}) };
        if (minutes === null) delete cur[key];
        else cur[key] = minutes;
        if (Object.keys(cur).length) s.walk_times = cur;
        else delete s.walk_times;
        return s;
      }),
    remove: (eid) => {
      const stops = getStops();
      if (!stops) return;
      commit(stops.filter((s) => s.entity !== eid));
    },
  };
}

/**
 * Rebuild the entities array from the entity selector's flat `string[]`,
 * preserving each surviving stop's saved overrides.
 *
 * Without this every add/remove cycle would silently wipe every stop's lines,
 * direction and walk times — ha-form's entity selector knows nothing about the
 * per-stop config hanging off each id. Order follows the selector so the
 * user-visible order tracks what they dragged; a newly added entity gets a bare
 * placeholder for the normaliser to fill in.
 */
export function rebuildStops<S extends MutableStop>(
  current: ReadonlyArray<S>,
  raw: unknown,
): S[] {
  const ids = Array.isArray(raw)
    ? raw.filter((s): s is string => typeof s === "string" && s.length > 0)
    : [];
  const byEntity = new Map(current.map((s) => [s.entity, s]));
  return ids.map((eid) => byEntity.get(eid) ?? ({ entity: eid } as S));
}

/**
 * Merge one field into one side of the header strip.
 *
 * An `undefined` write removes the key outright so the saved YAML never carries
 * `text: undefined`.
 */
export function patchHeaderSide(
  current: RetroHeaderSide | undefined,
  field: keyof RetroHeaderSide,
  value: unknown,
): RetroHeaderSide {
  const next: RetroHeaderSide = { ...(current ?? {}), [field]: value };
  if (value === undefined) delete next[field];
  return next;
}

/**
 * Resolve an `ha-form` field label.
 *
 * The card's own catalogue wins, and HA core's generic labels are the fallback.
 * That order is deliberate and was previously inverted: HA core defines
 * `entity` / `entities` but none of this integration's own field names, so
 * core-first meant the one control all three editors share was the only one
 * core could answer for — and it answered "Entität" while the flap editor,
 * which bypassed this resolver entirely, said "Haltestellen". Card-first gives
 * the whole editor surface one vocabulary and keeps core as the safety net for
 * anything the catalogue has not named.
 */
export function editorLabel(
  hass: HomeAssistant | undefined,
  i18n: EditorTranslators,
  name: string,
): string {
  const own = i18n.et(name);
  if (own !== name) return own;
  return hass?.localize?.(`ui.panel.lovelace.editor.card.generic.${name}`) || name;
}

/**
 * Resolve an `ha-form` field helper from the `<field>_helper` convention,
 * returning undefined when the catalogue has no entry (which is how `et`
 * signals a miss — it echoes the key back).
 *
 * Dependency reasons ("needs X switched on") are passed in by the caller as
 * `overrides`, because which field gates which is per-card. Putting the reason
 * on the field it gates rather than in a loose note is what lets a disabled row
 * teach its own rule.
 */
export function editorHelper(
  i18n: EditorTranslators,
  name: string,
  overrides?: Record<string, string | undefined>,
): string | undefined {
  const override = overrides?.[name];
  if (override !== undefined) return override;
  const key = `${name}_helper`;
  const value = i18n.et(key);
  return value === key ? undefined : value;
}
