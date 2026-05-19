# Bundled webfonts — provenance & license

The five `wl-*.woff2` files in this directory are **subsetted derivatives of
the TeX Gyre font family** (maintained by GUST, the Polish TeX Users Group):

| Bundled file                       | Derived from                          | TeX Gyre family   | Purpose                                                  |
|------------------------------------|---------------------------------------|-------------------|----------------------------------------------------------|
| `wl-sans-regular.woff2`            | `texgyreheros-regular.otf`            | TeX Gyre Heros    | Helvetica-metric sans, body weight                       |
| `wl-sans-bold.woff2`               | `texgyreheros-bold.otf`               | TeX Gyre Heros    | Helvetica-metric sans, bold (line badges, hero metric)   |
| `wl-sans-condensed-bold.woff2`     | `texgyreheroscn-bold.otf`             | TeX Gyre Heros Cn | Helvetica-metric condensed, used by retro station header |
| `wl-mono-regular.woff2`            | `texgyrecursor-regular.otf`           | TeX Gyre Cursor   | Courier-metric monospace, retro LED rows                 |
| `wl-mono-bold.woff2`               | `texgyrecursor-bold.otf`              | TeX Gyre Cursor   | Courier-metric monospace, retro LED rows (bold weight)   |

## Modifications applied (subsetting only)

- Restricted to the Unicode ranges actually used by the cards:
  - U+0020–007F (Basic Latin)
  - U+00A0–00FF (Latin-1 Supplement — German diacritics äöüÄÖÜß etc.)
  - U+2013–2014 (en/em dash)
  - U+2019 (right single quotation mark — used in station names)
  - U+2026 (horizontal ellipsis)
  - U+2192 (rightwards arrow — used in "towards" formatting)
- OpenType layout features retained: kerning (`kern`) and standard ligatures (`liga`).
- Cleared `DSIG`, `FFTM`; no hinting (woff2 doesn't need TTF hints); CFF desubroutinized.
- Converted from OTF (CFF) to WOFF2.
- Renamed at the CSS `@font-face` layer to `WL Sans` / `WL Sans Condensed` /
  `WL Mono` per the GUST Font License's request that derivatives use new names.
  The underlying font's name table is preserved unchanged.

## License

Distributed under the **GUST Font License** (version 1.0, 22 June 2009), which
licenses the work under the LaTeX Project Public License 1.3c+. See
[`GUST-FONT-LICENSE.txt`](./GUST-FONT-LICENSE.txt) alongside this file.

Upstream copyright:

> Copyright 2006, 2009 for TeX Gyre extensions by B. Jackowski and J.M. Nowacki
> (on behalf of TeX users groups).

The original TeX Gyre work itself derives from the URW++ Nimbus Sans / Nimbus
Mono donations to the Ghostscript project (1996), extended with additional
glyphs by GUST.

This integration's own code remains MIT-licensed; the GFL applies only to
the binaries in this directory.

## How to reproduce

```bash
# Upstream zips
curl -fsSLO https://www.gust.org.pl/projects/e-foundry/tex-gyre/heros/qhv2.004otf.zip
curl -fsSLO https://www.gust.org.pl/projects/e-foundry/tex-gyre/cursor/qcr2.004otf.zip
unzip -j qhv2.004otf.zip 'texgyreheros-regular.otf' 'texgyreheros-bold.otf' 'texgyreheroscn-bold.otf'
unzip -j qcr2.004otf.zip 'texgyrecursor-regular.otf' 'texgyrecursor-bold.otf'

# Subset (requires pyftsubset from fonttools[woff])
for pair in \
  texgyreheros-regular.otf:wl-sans-regular.woff2 \
  texgyreheros-bold.otf:wl-sans-bold.woff2 \
  texgyreheroscn-bold.otf:wl-sans-condensed-bold.woff2 \
  texgyrecursor-regular.otf:wl-mono-regular.woff2 \
  texgyrecursor-bold.otf:wl-mono-bold.woff2; do
  src="${pair%:*}"; out="${pair##*:}"
  pyftsubset "$src" --output-file="$out" --flavor=woff2 \
    --unicodes='U+0020-007F,U+00A0-00FF,U+2013-2014,U+2019,U+2026,U+2192' \
    --layout-features='kern,liga' \
    --drop-tables+=DSIG,FFTM --no-hinting --desubroutinize
done
```
