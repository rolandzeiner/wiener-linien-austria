#!/usr/bin/env node
// Generate src/mdi-icon-names.json from @mdi/js's TypeScript declaration
// file. We parse mdi.d.ts (not mdi.js!) so we only ingest the icon names,
// not the ~5 MB of SVG path data they're attached to.
//
// Each MDI constant is exported as `mdi<CamelCase>: string` and corresponds
// to a kebab-case icon name (e.g. `mdiAccountCog` → `account-cog`). Numbers
// are word boundaries in MDI's naming convention (`mdiNumeric0Box` →
// `numeric-0-box`), so the camel→kebab transform inserts hyphens at every
// letter→digit and digit→letter transition as well as lowercase→uppercase.
//
// Output: a sorted JSON array of strings of the form "mdi:account-cog".
// Lives in src/ so the editor can `import` it through rollup's json plugin.

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const DTS_PATH = resolve(REPO_ROOT, "node_modules/@mdi/js/mdi.d.ts");
const OUT_PATH = resolve(REPO_ROOT, "src/mdi-icon-names.json");

const src = fs.readFileSync(DTS_PATH, "utf-8");
const names = new Set();

const DECL_RX = /^export declare const mdi([A-Z]\w+): string;/gm;
let match;
while ((match = DECL_RX.exec(src)) !== null) {
  // mdiAccountCog → AccountCog → kebab: account-cog
  // mdiNumeric0Box → Numeric0Box → kebab: numeric-0-box
  const camel = match[1];
  const kebab = camel
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-zA-Z])/g, "$1-$2")
    .toLowerCase();
  names.add(`mdi:${kebab}`);
}

const sorted = [...names].sort();
fs.writeFileSync(OUT_PATH, JSON.stringify(sorted));
console.log(`Wrote ${sorted.length} MDI icon names → ${OUT_PATH}`);
