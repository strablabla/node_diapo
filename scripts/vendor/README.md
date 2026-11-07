# Vendored libraries

Every third-party file the pages load is served from here, under `/vendor/`
(`scripts/` is a static root of the server). They used to come from CDNs: on a
network that did not answer, the slides stayed blank or half-built, and some
of those addresses had died (`cdn.rawgit.com`, shut down in 2019).

Files are kept as published, in a `<library>/<version>/` folder, with the
assets their stylesheets point to (fonts, icon images) at the same relative
paths. Only `views/header.html`, `views/slider.html` and
`scripts/v/0.2/themes/simplex.min.css` refer to them.

| Library | Version | Fetched from | License |
|---|---|---|---|
| jQuery | 1.12.0 | ajax.googleapis.com | MIT |
| jQuery UI (script) | 1.11.4 | cdnjs | MIT |
| jQuery UI (stylesheet + icons) | 1.12.1 | cdnjs | MIT |
| jQuery contextMenu (+ icon font) | 2.1.1 | cdnjs | MIT |
| d3 | 3.5.5 | cdnjs | BSD-3-Clause |
| d3-queue (`queue.v1`) | 1 | d3js.org | BSD-3-Clause |
| alertify.js | 1.0.6 | github.com/alertifyjs/alertify.js (tag v1.0.6) | MIT |
| perfect-scrollbar | 0.6.11 | cdnjs | MIT |
| Bootstrap (+ Glyphicons) | 3.3.6 | maxcdn.bootstrapcdn.com | MIT |
| MathLive (script + KaTeX fonts) | 0.111.4 | npm `mathlive` | MIT (`LICENSE.txt`) |
| Enriqueta, Londrina Solid, Pathway Gothic One, Josefin Sans | — | Google Fonts | SIL Open Font License |

The jQuery UI script and stylesheet versions differ (1.11.4 / 1.12.1): that
is what the CDN links loaded, kept as is.

MathLive was unpinned before (`unpkg.com/mathlive`, i.e. whatever the latest
release was); 0.111.4 is the release it served when it was vendored. Only the
script and its `fonts/` are kept: `renderMathInDocument()` loads the fonts
from `./fonts` next to the script. Its `sounds/` serve the editable
`<math-field>`, which the slides do not use.

The Google Fonts stylesheets were requested with a current browser's
User-Agent (to get `woff2`) and rewritten to point at the files in `fonts/`.
