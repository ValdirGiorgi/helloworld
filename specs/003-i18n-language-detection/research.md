# Phase 0 Research: Internationalization with Automatic Language Detection

No items in the Technical Context were marked `NEEDS CLARIFICATION` — the two ambiguous points in
the spec itself (translation scope, country-detection mechanism) were already resolved by the user
during `/speckit-specify` (see spec.md FR-010, FR-011). The research below documents the concrete
technical decisions needed to implement those resolved requirements.

## 1. Use vue-i18n (Composition API mode) for message storage, lookup, and fallback

**Decision**: Add `vue-i18n` (`^9`, Composition API / `legacy: false` mode) as a dependency.
`src/i18n/index.js` creates the `createI18n({ legacy: false, locale, fallbackLocale: 'en', messages })`
instance; `src/i18n/locales/{en,pt-BR,es}.js` each export a nested messages object consumed by it.
A thin `useLocale.js` composable wraps vue-i18n's own `useI18n()` and adds only what vue-i18n does
not provide: the country-based detection rule, manual override, and `localStorage` persistence
(research.md §2 and §4 below, both unchanged by this decision).

**Rationale**: This reverses an earlier draft of this research (a hand-rolled dictionary + custom
lookup), revisited at the user's explicit direction: the project wants room to grow — more locales,
pluralization, date/number formatting — without having to migrate off a hand-rolled solution later.
vue-i18n is the established, well-tested Vue 3 library for exactly this, so adopting it now avoids
a costlier rewrite once a genuinely library-shaped need (plurals, formatting, more locales) shows
up, which is itself a reading of Constitution Principle I's "avoid unjustified complexity" — the
complexity being avoided is the *future* cost of an outgrown hand-rolled dictionary, not the
library itself. At the project's current size (3 locales, a few dozen strings) vue-i18n is more
than the bare minimum, but the user weighed that against the cost of a later migration and chose to
take the dependency now while the surface area to migrate is still small.

**Alternatives considered**:
- *Hand-rolled dictionary + custom `t()` lookup* (the original draft decision): rejected on
  reconsideration — while sufficient for the current 3-locale, no-plurals scope, it would need a
  disruptive rewrite (or a growing pile of ad hoc plural/format helpers) the moment the project adds
  a fourth locale or any date/number formatting, which is exactly the "grow without complicating"
  outcome the project wants to avoid.
- *A generic lightweight i18n micro-library*: rejected — narrower community support and fewer
  guarantees than vue-i18n for the same integration cost; vue-i18n is the de facto standard for Vue
  3 specifically, minimizing future contributor ramp-up.
- *`unplugin-vue-i18n` (build-time message precompilation/tree-shaking)*: not adopted for this
  feature — it reduces bundle size further and enables SFC `<i18n>` custom blocks, but adds a Vite
  plugin and build-config surface the project doesn't need yet at 3 locales/a few dozen strings;
  revisit if the message set grows large enough for its bundle savings to matter (see plan.md
  Constraints — plenty of headroom remains under the 150KB budget without it).

## 2. Country detection: explicit region subtag only, no guessing

**Decision**: Read `navigator.languages` (falling back to the single `navigator.language` if the
array is unavailable); for each tag in order, attempt `new Intl.Locale(tag).region` and use the
**first tag that already carries an explicit region subtag** (e.g., `pt-BR` → region `BR`,
`es-MX` → region `MX`, `en-US` → region `US`). Do **not** call `Intl.Locale.prototype.maximize()` to
guess a region from a bare language tag (e.g., a generic `es` or `pt` with no region attached).

**Rationale**: The resolved clarification (spec.md FR-011) says the country is inferred "from the
region/country information the visitor's own browser **already reports**" — `maximize()` would
instead *invent* a region using CLDR likely-subtag data (e.g., a bare `pt` tag maximizes to
`pt-Latn-PT`, not `pt-BR`), which could silently steer a Brazilian visitor with a generically
configured browser to Portuguese-flavored assumptions or the wrong branch of the country rule. Only
trusting an explicitly reported region keeps the behavior predictable and matches the literal
resolved requirement; a visitor whose browser reports no region at all correctly falls through to
the English default (FR-004), which is an accepted, spec'd edge case (see spec.md Edge Cases).

**Alternatives considered**:
- *`Intl.Locale.maximize()` region guessing*: rejected per the rationale above — risks a wrong or
  surprising country guess for a requirement that explicitly asked for detection based on what the
  browser "already reports," not inference.
- *IP-based geolocation*: already rejected during `/speckit-specify` (spec.md FR-011 resolution) —
  would add a network dependency and a privacy consideration the static, backend-free architecture
  doesn't otherwise have (see `specs/001-hello-world-multilang-site/plan.md`).

## 3. Naming: "locale" everywhere, never "language," for the new concept

**Decision**: All new identifiers for this feature — the composable, the dictionaries directory, the
switcher component, storage keys, test files — use "locale" (`useLocale`, `LocaleSwitcher.vue`,
`src/i18n/locales/`), never "language."

**Rationale**: This codebase already has a well-established, unrelated meaning for "language" — a
*programming* language (`LanguageCard`, `LanguageList`, `LanguageSearch`, `LanguageSidebar`,
`useLanguages`, `LanguageEntry`). Reusing that word for the UI's *display* language would be
genuinely confusing in code review, tests, and future contributions (e.g., "does `useLanguage`
return the app's locale or a `LanguageEntry`?"). Consistent naming that avoids this collision is a
direct application of Constitution Principle I's requirement that naming follow the conventions
already established elsewhere in the codebase — here, that means deliberately *not* overloading an
existing, load-bearing term. This also happens to match vue-i18n's own vocabulary (`useI18n()`
returns a `locale` ref, `createI18n({ locale, fallbackLocale })`), so no translation layer is needed
between "how the library talks" and "how this codebase talks."

**Alternatives considered**:
- *Reuse "language" for the new UI-locale concept* (e.g., `useLanguagePreference`): rejected — the
  ambiguity risk against the existing `useLanguages`/`LanguageEntry` concept is exactly the kind of
  naming collision Principle I's consistency rule exists to prevent.

## 4. Persisting only the manual choice, not the auto-detected one

**Decision**: `useLocale.js` reads a `localStorage` key (e.g., `site-locale`) once on startup; if it
holds one of the three supported codes, that locale is used immediately and automatic detection is
skipped entirely for that visitor. If the key is absent, detection runs (§2 above) but its result is
**not** written back to `localStorage` — only an explicit manual selection via `LocaleSwitcher.vue`
writes the key.

**Rationale**: Spec.md's User Story 2 and FR-009 only require persistence for a *manually chosen*
language ("Once a visitor has manually chosen a language, the system MUST continue showing that
language... on later visits"); User Story 1's automatic detection is not required to be "sticky"
beyond a given visit, and re-running the same deterministic detection on a later visit produces the
same result anyway (a visitor's browser locale settings rarely change between sessions). Not writing
on every load also keeps the behavior simple to reason about: the presence of the storage key alone
tells you whether a visitor has ever manually overridden the automatic choice.

**Alternatives considered**:
- *Always persist the resolved locale, whether detected or manual*: rejected — indistinguishable
  from a manual choice once written, which would incorrectly "lock in" a first-visit detection result
  even if the visitor's underlying browser locale later changes (e.g., a shared/library computer
  reused by a different person), contradicting the spirit of FR-002's "automatically determine...
  on first load."

## 5. Spanish-speaking countries: a static reference list

**Decision**: A static array of ISO 3166-1 alpha-2 country codes for Spanish-speaking countries
(Spain and the Spanish-speaking countries of Latin America) lives in
`src/i18n/spanishSpeakingCountries.js`, matching spec.md's own Assumptions section describing this
as "a standard, well-known list... treated as static reference data."

**Rationale**: The spec explicitly scopes changing this list as out of this feature's bounds; a
plain, well-commented array is the simplest possible representation and needs no build step or
external data source.

**Alternatives considered**:
- *An npm package of country/language mappings*: rejected — the list is short, static, and already
  fully specified in scope by spec.md; a dependency for ~20 hardcoded strings is unjustified.

## 6. Localized History content as per-locale Markdown files

**Decision**: Rename `content/history.md` to `content/history.pt-BR.md` (preserving its existing
Portuguese text unchanged) and add `content/history.en.md` and `content/history.es.md`. Load all
three at build time via `import.meta.glob` (the same pattern `useLanguages.js` already uses for
`content/languages/*.md`), and have `HistoryPage.vue` render whichever one matches the active
locale, with `history.en.md` used as the content-level fallback if a locale's file were ever missing
(defensive; all three are always authored as part of this feature).

**Rationale**: This is the smallest change consistent with the project's existing "content lives in
plain Markdown files, parsed/loaded at build time" architecture (see
`specs/001-hello-world-multilang-site/research.md`); it needs no new parsing logic beyond selecting
which pre-rendered file to show, and keeps translators working in the same familiar file format
already used for contributed language content.

**Alternatives considered**:
- *One `history.md` with all three languages concatenated/sectioned*: rejected — would require a new
  custom section-splitting parser for no benefit over three independent files, and would make each
  translation's Git history/diffs harder to follow.
- *Embedding the History text as strings inside the locale dictionaries*: rejected — Markdown
  content (headings, paragraphs, possibly links) is a poor fit for a flat string-dictionary format
  designed for short UI labels, and would lose the existing Markdown-to-HTML rendering pipeline
  (`markdown-it`) already used for this exact content.

## Outcome

All Technical Context items are resolved. One new runtime dependency is introduced — vue-i18n — a
deliberate, recorded choice (§1) rather than an unexamined addition; everything else (country
detection, naming, persistence scope, the static country list, and per-locale History files) uses
only the existing stack. Proceeding to Phase 1 design.

---

## Amendment (2026-09-11): Per-Language URL Routing

### 7. Locale as a URL path prefix, using vue-router's existing dynamic segments

**Decision**: Add a `:locale` dynamic segment as a prefix on every existing route (`/:locale`,
`/:locale/history`, `/:locale/languages/:slug`), constrained by a regex to the three supported
codes (`pt-BR|en|es`). A global `router.beforeEach` guard checks `to.params.locale`: if it's one of
the three codes, navigation proceeds normally; otherwise (a "no-locale" address, e.g. bare `/` or
`/history`), the guard computes the locale to use — the visitor's stored manual preference
(`localStorage`, unchanged from the original feature) if present, otherwise the same country-based
detection algorithm from the original feature (research.md §2 above) — and redirects to the same
path with that locale prepended.

**Rationale**: This is the standard, widely-recognized pattern for multilingual SPAs and is exactly
what Google's own multilingual-sites guidance expects: one clean, human-readable URL per language,
implemented as ordinary framework routing rather than a new subsystem. Reusing `vue-router`'s
existing dynamic-segment and navigation-guard features means no new dependency and no parallel
routing mechanism to maintain alongside the router the app already has.

**Alternatives considered**:
- *Subdomains* (`pt-br.helloworld...`, `es.helloworld...`): rejected — requires additional DNS
  records and hosting/vhost configuration per subdomain, a heavier operational cost than one
  routing change, for a static personal project with a single hosting account.
- *Query parameter* (`?lang=es`): rejected — Google's own guidance explicitly discourages
  parameter-based language variants for `hreflang` purposes; parameters are also more prone to
  being stripped or normalized away by crawlers and sharing platforms than path segments.

### 8. Switching from hash-based to path-based routing, and why this is safe now

**Decision**: Replace `createWebHashHistory()` with `createWebHistory()`, and ship a
`public/.htaccess` file (passed through to `dist/` unmodified by Vite's `public/` convention) with
an SPA-fallback rewrite rule, so every deploy automatically includes it.

**Rationale**: `001-hello-world-multilang-site`'s original research chose hash-based routing
specifically because the FTP host's rewrite-rule support was unknown at the time. Since then, a
manual diagnostic test against a domain hosted on the same account confirmed the host runs Apache
and already relies on a `mod_rewrite`-based SPA fallback for its existing site at that domain
(a request to a nonexistent path returned that domain's `index.html` instead of a 404, and `.htaccess`
itself returned Apache's standard 403-on-direct-access, both signs of a working, Apache-backed
rewrite setup) — so the original blocking unknown is now resolved favorably. Checking the rewrite
rule into `public/.htaccess` (rather than a manual one-off upload) makes it a durable part of the
deployed build, consistent with Constitution Principle I's "no unexplained, undocumented setup
steps."

**Fallback if this assumption turns out wrong for `helloworld.valdir.dev.br`'s own hosting
account/document root** (spec.md Assumptions): revert `router/index.js` to
`createWebHashHistory()` and drop the `:locale` path segment back to a query-free, address-
independent switch — i.e., User Stories 1 and 2 exactly as already implemented, without User
Story 3. This amendment's tasks should keep that revert cheap: the detection algorithm and
translation dictionaries are entirely unchanged and unaffected either way.

**Alternatives considered**:
- *Ship both: hash routing plus locale prefix inside the hash* (`/#/pt-BR/history`): rejected — this
  does not solve the actual problem (Google still cannot see anything after `#` as a distinct URL),
  so it would add routing complexity for zero SEO benefit.

### 9. SEO head tags: plain DOM APIs, no head-management library

**Decision**: A new `useLocaleSeoTags()` composable, called once from `App.vue`, watches the active
route and locale and directly sets `document.title`, finds-or-creates a
`<meta name="description">` element, sets `document.documentElement.lang`, and finds-or-creates
`<link rel="alternate" hreflang="...">` elements for all three locales plus one
`hreflang="x-default"` (pointing at the English version, consistent with English being the
fallback/default per FR-005), and a `<link rel="canonical">` pointing at the current page's own
absolute URL (self-referencing per page/locale — not a single shared canonical, which would tell
search engines to ignore the other two languages entirely).

**Rationale**: The full set of tags this feature needs is small and fixed (one title, one
description, one `lang` attribute, four `hreflang` links, one canonical link) and does not grow
with future content the way the translation dictionaries might — there is no analogous "future
growth" argument here that justified adding vue-i18n in §1. Direct, well-understood DOM APIs are
simpler to read and test than learning a library's reactive-head-merging model for a handful of
tags that change together on every route change.

**Alternatives considered**:
- *`@vueuse/head` or `vue-meta`*: rejected — solve head-tag *merging* across nested/async
  components, a problem this app doesn't have (one composable, called once, is the sole writer of
  these tags); would add a dependency for a capability that goes unused, the same reasoning
  Principle IV already applies elsewhere in this plan.

### 10. Accepted limitation: SEO tags are JavaScript-rendered, not present in the raw HTML

**Decision**: No server-side rendering or static prerendering is added in this amendment; the
`hreflang`/canonical/title/description tags described in §9 exist only after the page's JavaScript
runs, exactly like the rest of this SPA's content already does.

**Rationale**: Google's crawler does execute JavaScript before extracting these signals (its Web
Rendering Service renders pages much like a browser), so this remains workable for Google
specifically — the same reliance the whole site already has for its content to be indexed at all.
Adding SSR or prerendering to remove this reliance would be a much larger architectural change than
"add routes and head tags," and is out of scope for what this amendment set out to fix (the
*absence of distinct URLs*, not the JS-rendering dependency, which predates this amendment).
Verifying these tags therefore requires an actual rendered-DOM inspection (e.g., browser DevTools,
or a tool that executes JavaScript like Google's own URL Inspection tool in Search Console) —
`curl`/`view-source` will not show them, which is worth knowing before concluding the feature
"isn't working" during manual testing.

**Alternatives considered**:
- *Static prerendering (e.g., a build-time prerender step producing real per-locale HTML files)*:
  deferred, not rejected outright — would remove the JS-execution dependency entirely and is a
  reasonable future improvement, but is a materially larger change (a new build step, a decision
  about which routes to prerender) than this amendment's scope of "give each language its own
  address"; can be revisited later if indexing data shows Google is not picking up the non-English
  languages despite the routing fix.

### Amendment Outcome

No new dependency is introduced by this amendment. The routing-mode switch
(`createWebHistory`/`.htaccess`) is the one item with external-environment risk, already
substantially de-risked by manual testing and with an explicit, low-cost fallback documented above
and in spec.md's Assumptions. Proceeding to the amended Phase 1 design below.
