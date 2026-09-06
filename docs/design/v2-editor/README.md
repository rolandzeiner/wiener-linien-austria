# v2.0.0 editor redesign — design source of truth

Handoff from Claude Design, 2026-09-06. These files are the reference the v2 editor
implementation is checked against.

| File | What it is |
|---|---|
| `DESIGN-SPEC.md` | The written spec — tokens, components, per-tab content, rationale. Authoritative for structure, vocabulary and copy. |
| `editor-system.dc.html` | Clickable prototype. Open in a browser; toolbar switches card / theme / editor width. |
| `support.js` | Runtime the prototype needs to render. Not part of the shipped card. |

## Deviations from the mockup, and why

The prototype hand-draws every control so it could render outside Home Assistant.
The implementation does **not** copy those controls. Per the portfolio house style
(`ha-portfolio-design` §9.1a / §9.5) we exhaust `ha-form` first and hand-build only
what it genuinely cannot express.

| Mockup | Implementation | Why |
|---|---|---|
| Custom 36×20 toggle switch | `ha-form` `boolean` selector (HA's own switch) | HA ships theming, i18n and a11y for it; a hand-rolled switch drifts from HA visual updates. |
| Custom segmented control for enums | `ha-form` `select` in `dropdown` mode | Keeps the one-row-per-enum rhythm the mockup wants without a bespoke widget. §9.1a: don't roll a custom dropdown when `select` works. |
| Custom slider | `ha-form` `number` selector, `mode: "slider"` | Same. |
| Custom text field / entity picker chrome | `ha-form` `text` / `entity` selectors | Same. |
| Walk-time `− value +` stepper | Stepper shell **with a typeable value in the middle** | Entering 12 minutes via twelve taps is worse than today's input. Keeps both affordances. |
| `--sunken` / `--hover` / `--ripple` literals | Derived with `color-mix()` from HA tokens | Those three are not HA tokens. Hardcoding the prototype's light/dark values would break under custom themes. |

Hand-built (unchanged from v1 or new in v2): line chips, direction buttons,
per-line direction overrides, walk-time rows, line-colour rows, and the new
station-header strip editor.

## Structural decisions taken at implementation time

- **Section chrome and the tab bar are ours**; each section's plain rows are one
  `<ha-form>` with that section's schema slice. This gets the mockup's grouping and
  headers while the rows stay HA-native.
- **Dependent options are `disabled: true` in the schema** with the reason supplied
  through `computeHelper`, matching the spec's "never hidden, always explained" rule.
  This replaces v1's conditional schema-array building.
