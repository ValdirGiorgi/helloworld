# Phase 0 Research: About Page

No items in the Technical Context were marked `NEEDS CLARIFICATION`. The research below documents
the concrete decisions needed to fit this feature into the existing architecture cleanly.

## 1. About page content lives in the i18n dictionaries, not a Markdown content file

**Decision**: The About page's text (the creation/purpose statement, link labels, the contribute
note) is added as new keys in `src/i18n/locales/{en,pt-BR,es}.js`, rendered via `t('about.*')` —
the same pattern already used for every other piece of app-generated UI chrome. It is **not**
implemented as a per-locale Markdown file the way the History page's long-form article is
(`content/history.{locale}.md`).

**Rationale**: The History page's Markdown-per-locale approach exists because that content is a
multi-paragraph narrative article — a good fit for Markdown's prose formatting and the existing
`markdown-it` rendering pipeline (`001-hello-world-multilang-site/research.md`). The About page's
content, by contrast, is a handful of short, structured sentences and three labeled links — exactly
the shape every other translated UI string on this site already takes. Using the same dictionary
mechanism keeps one way of doing translated short-form content instead of two, and automatically
gets covered by the existing dictionary-completeness test (`tests/unit/locales.spec.js`) with no
new test needed for that invariant.

**Alternatives considered**:
- *A fourth per-locale Markdown file (`content/about.{locale}.md`)*: rejected — over-fitted to a
  content shape (long narrative prose) this page doesn't have; would also need its own loading
  logic in `AboutPage.vue` duplicating `HistoryPage.vue`'s glob-and-pick pattern for no benefit.

## 2. The three external URLs: one shared constants module, not per-locale strings

**Decision**: `src/siteLinks.js` exports three plain string constants — the Spec Kit repository
URL, this project's own repository URL, and the blog article URL — imported by both `AboutPage.vue`
and (for the project repository URL specifically) `AppFooter.vue`.

**Rationale**: URLs are not translated content (an address is the same regardless of the visitor's
language), so they don't belong in the i18n dictionaries as translatable strings. `AppFooter.vue`
already needs the exact same project-repository URL that the About page links to (spec.md FR-008
reuses FR-005's address) — defining it once and importing it in both places is the direct
application of Constitution Principle I's consistency concern: one future URL change (e.g., if the
repository ever moves) updates in one place, not two independently-maintained literals that could
silently drift apart.

**Alternatives considered**:
- *Hardcode the repository URL separately in both `AboutPage.vue` and `AppFooter.vue`*: rejected —
  exactly the duplicated-literal risk described above.
- *Put the URLs in the i18n dictionaries alongside translated strings*: rejected — they don't vary
  by locale, so treating them as "translatable" content is a category error that would also trip
  the dictionary-completeness test for no reason (three identical values repeated across three
  locale files instead of one shared constant).

## 3. Reusing the existing route, nav, and SEO-tag patterns as-is

**Decision**: The new route follows the exact shape already used by `history`
(`/:locale(pt-BR|en|es)/about`, `name: 'about'`); `NavMenu.vue` gains a third `{ name: 'about',
label: t('nav.about') }` entry using its existing `computed()`/`router-link` loop; no change is
needed to `useLocaleSeoTags.js`, since its `hreflang`/canonical logic already derives alternate
addresses generically from the current route's path (swapping only the locale segment), not from a
hardcoded list of known routes.

**Rationale**: `003-i18n-language-detection`'s amendment already solved "how does a new page get a
locale-prefixed address, show up correctly for direct links, and get correct SEO tags" once, for
`history`/`language-detail`. Re-deriving a different pattern for this feature's one new page would
be pure unjustified complexity — the existing mechanism is already fully route-agnostic.

**Alternatives considered**: None seriously considered — this is a direct reuse of an
already-established, working pattern with no new requirement it doesn't already satisfy.

## Outcome

No new dependency, no new architecture. One new page, one new route entry, one small shared
constants module, and new translated strings, all following patterns this project already has.
Proceeding to Phase 1 design.
