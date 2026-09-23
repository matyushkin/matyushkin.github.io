# matyushkin

👦 My personal web page host. All projects and applications together on one map. I will be glad to see you there: [matyushkin.github.io](https://matyushkin.github.io/). For static page generation [11ty](https://github.com/11ty/eleventy) is used. Repo for site generation is [here](https://github.com/matyushkin/mgio).

## Languages

Every word of the interface lives in one file, `source/i18n.json`; pages hold
none of their own. `source/site.js` picks the reader's language and fills the
page from it.

To add a language:

1. Add it to `languages` in `source/i18n.json` (code, label, locale, and
   `dir: "rtl"` for a right-to-left script) and add its block under `strings`.
   A key left out falls back to English.
2. Run the site refresh, which writes the static parts every page needs
   (hreflang links, the early language snippet, the selector options) and
   rebuilds the work pages with the new language:

   ```
   /Users/leo/life/.agents/scripts/site_refresh_launchd.sh run
   ```

3. `npx playwright test` — the translation checks read the language list from
   `i18n.json`, so they cover the new language without edits.

A script that isn't in the font (Computer Modern carries Latin and Cyrillic)
also needs a subset font next to `fonts/heebo-hebrew.woff2` and one line in the
`font-family` stack.
