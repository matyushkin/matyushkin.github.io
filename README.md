# matyushkin

👦 My personal web page: [matyushkin.github.io](https://matyushkin.github.io/).

## How the site is built

Every page is generated; none is edited by hand. The build (`build_site.py`) lives in
the owner's private repository and reads only this repository:

- `source/i18n.json` — every word of the interface, in every language;
- `science/data.json`, `technology/data.json`, `art/data.json` — the works;
- `art/feeds.json` — the Behance and Instagram tiles.

It writes one static page per language: English at the root (`/science/`),
every other language under its code (`/ru/science/`, `/de/science/`, …). Each
page carries its full content, a canonical link to itself and hreflang links
to all its language versions; `sitemap.xml` lists them all. `source/site.js`
only switches the theme, remembers a language picked in the menu, and offers
the reader's own language when they land on another one.

A weekly job rebuilds everything.

## Adding a language

1. Add it to `languages` in `source/i18n.json` (code, name, locale, `tag` if
   the hreflang tag differs from the code, and `dir: "rtl"` for a
   right-to-left script) and add its block under `strings`. A key left out
   falls back to English.
2. Rebuild with `build_site.py`.
3. Test against a local copy:

   ```
   python3 -m http.server 8123 &
   PLAYWRIGHT_BASE_URL=http://localhost:8123 npx playwright test
   ```

   The language checks read the language list from `i18n.json`, so they cover
   the new language without edits.

A script that isn't in the font (Computer Modern carries Latin and Cyrillic)
also needs a subset font next to `fonts/heebo-hebrew.woff2` and one line in the
`font-family` stack.
