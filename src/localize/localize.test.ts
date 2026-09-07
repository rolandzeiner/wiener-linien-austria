import { describe, expect, it } from "vitest";

import de from "./languages/de.json";
import en from "./languages/en.json";

// Every source file that names a translation key, in any form.
import modernCard from "../wiener-linien-austria-card.ts?raw";
import retroCard from "../wiener-linien-austria-retro-card.ts?raw";
import flapCard from "../wiener-linien-austria-flap-card.ts?raw";
import modernEditor from "../editor.ts?raw";
import retroEditor from "../retro-editor.ts?raw";
import flapEditor from "../flap-editor.ts?raw";
import stopBlock from "../editor/stop-block.ts?raw";
import headerStrip from "../editor/header-strip.ts?raw";
import editorCommon from "../editor/editor-common.ts?raw";
import editorI18n from "../editor/editor-i18n.ts?raw";
import stationHeader from "../utils/station-header.ts?raw";
import retroView from "../utils/retro-view.ts?raw";
import stationIcons from "../utils/retro-station-icons.ts?raw";
import sharedRender from "../shared-render.ts?raw";

// Catalogue health, guarded mechanically.
//
// Every failure mode here is SILENT at runtime: `translate()` echoes the key
// back when it resolves nothing, so a missing string renders as
// "walk_time_hint" in the UI rather than throwing, and an orphaned one just
// sits there. Two audits found real instances — three editors showing three
// different words for one control, sixteen keys stranded by the v2 editor
// rewrite, and a column header left in German — so the invariants are pinned
// here instead of being re-derived by hand each time.

type Dict = { [key: string]: string | Dict };

function flatten(dict: Dict, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

const DE = flatten(de as unknown as Dict);
const EN = flatten(en as unknown as Dict);

const SOURCES: Record<string, string> = {
  modernCard,
  retroCard,
  flapCard,
  modernEditor,
  retroEditor,
  flapEditor,
  stopBlock,
  headerStrip,
  editorCommon,
  editorI18n,
  stationHeader,
  retroView,
  stationIcons,
  sharedRender,
};
const ALL_SOURCE = Object.values(SOURCES).join("\n");

const leafOf = (key: string): string => key.split(".").slice(-1)[0]!;
const literals = (src: string, pattern: RegExp): string[] => [
  ...new Set([...src.matchAll(pattern)].map((m) => m[1]!)),
];

const T_CALL = /_t\(\s*"([a-z0-9_]+)"/g;
const ET_CALL = /\bet\(\s*"([a-z0-9_]+)"/g;
const DOT_T_CALL = /\.t\(\s*"([a-z0-9_]+)"/g;
const FORM_FIELD = /\bname:\s*"([a-z0-9_]+)"/g;

describe("catalogue parity", () => {
  it("de and en carry exactly the same keys", () => {
    expect(Object.keys(DE).sort()).toEqual(Object.keys(EN).sort());
  });

  it("has no empty strings", () => {
    expect(Object.keys(DE).filter((k) => !DE[k]!.trim() || !EN[k]!.trim())).toEqual([]);
  });

  // A `{token}` present in one language and not the other means the
  // interpolation silently does nothing there — the string renders with a
  // literal `{line}` in it, or drops the substitution entirely.
  it("uses the same placeholders in both languages", () => {
    const tokens = (s: string): string =>
      [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort().join();
    expect(Object.keys(DE).filter((k) => tokens(DE[k]!) !== tokens(EN[k]!))).toEqual([]);
  });
});

describe("no orphaned keys", () => {
  const FORM_FIELDS = new Set(literals(ALL_SOURCE, FORM_FIELD));

  /** Tolerant by design for ordinary keys: a leaf name appearing anywhere in
   *  any key-bearing source file counts, which accepts every dynamic
   *  construction in the codebase (`et(field.name)`, the labelKey
   *  indirections). A false positive here would argue for deleting a live
   *  string, so the check errs toward keeping.
   *
   *  `_helper` keys are the exception, and have to be exact. `editorHelper`
   *  builds them as `${field.name}_helper`, so the key never appears literally
   *  and the substring rule would pass any key whose base word occurs anywhere
   *  — which is how eight helpers for v1 ha-form fields survived the v2 editor
   *  rewrite (`chips_helper` looked referenced because `chips` is all over the
   *  header strip). A helper is reachable exactly when an ha-form field carries
   *  its base name. */
  const referenced = (key: string): boolean => {
    const leaf = leafOf(key);
    const HELPER = "_helper";
    if (leaf.endsWith(HELPER)) return FORM_FIELDS.has(leaf.slice(0, -HELPER.length));
    return ALL_SOURCE.includes(leaf);
  };

  it("every key is reachable from the source", () => {
    expect(Object.keys(DE).filter((k) => !referenced(k))).toEqual([]);
  });
});

describe("every key the code asks for resolves", () => {
  it.each([
    ["modern", modernCard],
    ["retro", retroCard],
    ["flap", flapCard],
  ])("%s card _t() keys exist", (ns, src) => {
    const missing = literals(src, T_CALL).filter((k) => DE[`${ns}.${k}`] === undefined);
    expect(missing).toEqual([]);
  });

  // `et()` resolves card-scoped first, then falls back to `common.editor`.
  const editorKeyResolves = (ns: string, key: string): boolean =>
    DE[`${ns}.editor.${key}`] !== undefined || DE[`common.editor.${key}`] !== undefined;

  it.each([
    ["modern", modernEditor],
    ["retro", retroEditor],
    ["flap", flapEditor],
  ])("%s editor et() keys and ha-form field labels exist", (ns, src) => {
    const keys = [...literals(src, ET_CALL), ...literals(src, FORM_FIELD)];
    expect(keys.filter((k) => !editorKeyResolves(ns, k))).toEqual([]);
  });

  // The shared editor modules render under every namespace that mounts them,
  // so their keys have to resolve for each one — this is what caught the
  // header strip's strings being absent from a namespace that renders it.
  it.each([
    ["stop-block", stopBlock, ["modern", "retro", "flap"]],
    ["header-strip", headerStrip, ["retro", "flap"]],
  ])("%s keys resolve for every namespace that renders it", (_name, src, namespaces) => {
    const missing: string[] = [];
    for (const ns of namespaces as string[]) {
      for (const k of literals(src as string, ET_CALL)) {
        if (!editorKeyResolves(ns, k)) missing.push(`${ns}.editor.${k}`);
      }
      for (const k of literals(src as string, DOT_T_CALL)) {
        if (DE[`${ns}.${k}`] === undefined) missing.push(`${ns}.${k}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
