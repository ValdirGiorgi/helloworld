# Implementation Plan: Internationalization with Automatic Language Detection

**Branch**: `003-i18n-language-detection` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-i18n-language-detection/spec.md`

## Summary

Add three interface locales (Brazilian Portuguese, English, Spanish) to the existing single-page
Vue app, auto-selected on first load from a country signal inferred from the visitor's own browser
locale settings (no network geolocation call), falling back to English whenever that signal is
absent or unmapped. A visible control at the top of every page lets a visitor override the
automatic choice at any time; a manual choice is remembered for later visits. Translated content
covers every app-generated interface string plus the History page's article; the per-language
(programming-language) contributed content files are unchanged. Implemented with **vue-i18n**
(Composition API mode) for message storage/lookup/fallback, wrapped by a thin project composable
that adds the country-based detection, manual override, and persistence behavior spec.md requires.

## Technical Context

**Language/Version**: JavaScript (ES2022), Vue 3.4 (`<script setup>`, Composition API) — unchanged.

**Primary Dependencies**: Vue 3, vue-router 4 (already in use), **vue-i18n ^9 (Composition API /
`legacy: false` mode)** — new dependency. Locale *detection* (the country rule) still uses only the
browser's built-in `navigator.languages` and `Intl.Locale` — no network call — but message storage,
lookup, and locale-fallback are handled by vue-i18n rather than hand-rolled. See research.md §1 for
why the earlier no-dependency approach was revisited: the project wants room to add more locales,
pluralization, or date/number formatting later without a costly migration off a hand-rolled
dictionary, and vue-i18n is the established, well-tested way to get that headroom without building
it in-house.

**Storage**: Browser `localStorage`, used only to remember a visitor's *manual* locale choice
(FR-009); nothing is sent to or read from a server. No new persisted data beyond this.

**Testing**: Vitest + `@vue/test-utils` for the detection/fallback logic and the locale-switcher
component (unit, including a "every locale has every message key" completeness check); Playwright
for end-to-end scenarios using per-test browser-context locale emulation to simulate visitors from
Brazil, a Spanish-speaking country, another country, and an undeterminable locale (e2e) — same
tooling already used by `001-hello-world-multilang-site` and `002-responsive-sidebar-search`.

**Target Platform**: Static site, evergreen browsers, mobile and desktop viewports — unchanged.
`Intl.Locale` and `navigator.languages` are both supported by all evergreen browsers.

**Project Type**: Web — single Vue SPA (`src/`), no backend — unchanged.

**Performance Goals**: Switching locales MUST feel instant (all three vue-i18n message sets and the
three History translations are already loaded at build time via static imports/`import.meta.glob`,
same pattern as `useLanguages.js`; switching is a pure client-side re-render, no network request).
Detection on first load MUST add no perceptible startup delay (a few synchronous string/array
operations on `navigator.languages`, plus vue-i18n's own lightweight initialization).

**Constraints**: Must not grow the production gzipped JS bundle beyond the project's established
150KB budget (current baseline after `002-responsive-sidebar-search`: ≈90.4KB). vue-i18n's
Composition-API runtime typically adds roughly 10-15KB gzip; combined with three short message
dictionaries and three short History translations, this MUST be re-measured against the 150KB
budget after implementation (plenty of headroom exists: ≈90.4KB + ~15KB ≈ 105KB, well under 150KB).

**Scale/Scope**: 3 locales × (≈30–40 short interface strings + 1 short article, currently 15 lines
of Markdown). Touches most existing UI components to replace hardcoded Portuguese text with
dictionary lookups, adds one new composable and one new switcher component, and adds two new
localized History content files. No change to `content/languages/*.md`, `parseLanguageFile.js`, or
the `LanguageEntry` shape from `001-hello-world-multilang-site`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: A single, focused `useLocale` composable wraps vue-i18n's `useI18n()` and
  owns exactly the behavior vue-i18n doesn't provide out of the box — country-based detection,
  manual override, and persistence — rather than duplicating what the library already does well
  (message lookup, fallback). Message files are one per locale with a shared key shape, enabling an
  automated completeness check rather than relying on review alone. New identifiers use "locale"
  (not "language") throughout to avoid colliding with the app's existing domain meaning of
  "language" (a programming language) — see research.md §3; this also matches vue-i18n's own
  terminology, so the naming choice needs no translation layer between "how vue-i18n talks" and
  "how this codebase talks." Adding vue-i18n itself is a deliberate, recorded choice (research.md
  §1) to avoid a larger, harder-to-justify complexity cost later (a hand-rolled dictionary growing
  ad hoc plural/format logic as the project adds locales), not an unexamined dependency add. PASS.
- **II. Testing Standards (NON-NEGOTIABLE)**: Every behavior in spec.md gets a test: country-rule
  detection (Brazil → pt-BR, Spanish-speaking country → es, other/undetermined → en), the
  dictionary-completeness invariant (every key present in all three locales, preventing silent
  missing-translation regressions), manual switch + persistence across reload, and the History
  article rendering correctly in all three locales. PASS.
- **III. User Experience Consistency**: The locale switcher reuses the project's existing button
  visual language (`BaseButton`-style styling) and sits at the top of every page, consistent with
  the "opção no topo" requirement and with `002-responsive-sidebar-search`'s existing header/top
  area. Accessibility: native `<button>`/`<select>` elements, current locale indicated via
  `aria-current`, keyboard-operable by default. PASS.
- **IV. Performance Requirements**: Budget stated above (instant switch, negligible detection cost,
  bundle growth kept well inside the 150KB gzip ceiling); verified by re-running `npm run build`
  after implementation and comparing to the ≈90.4KB baseline recorded in
  `specs/002-responsive-sidebar-search/quickstart.md`. PASS.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-i18n-language-detection/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── i18n/
│   ├── index.js                     # NEW: createI18n({ legacy: false, locale, fallbackLocale: 'en', messages })
│   ├── locales/
│   │   ├── en.js                    # NEW: English messages (default/fallback), nested by area
│   │   ├── pt-BR.js                 # NEW: Brazilian Portuguese messages
│   │   └── es.js                    # NEW: Spanish messages
│   └── spanishSpeakingCountries.js  # NEW: static ISO 3166-1 alpha-2 reference list
├── composables/
│   ├── useLocale.js                 # NEW: wraps vue-i18n's useI18n(); adds country-rule detection, manual override, persistence
│   └── useLanguages.js              # UNCHANGED
├── main.js                          # CHANGED: app.use(i18n)
├── components/
│   └── layout/
│       ├── LocaleSwitcher.vue       # NEW: top-of-page control to pick pt-BR/en/es
│       └── AppHeader.vue            # CHANGED: renders <LocaleSwitcher>, translates its own strings
├── pages/
│   ├── HomePage.vue                 # CHANGED: translated strings
│   ├── HistoryPage.vue              # CHANGED: loads the History translation for the active locale
│   └── LanguageDetailPage.vue       # CHANGED: translated strings
└── ... (LanguageCard.vue, LanguageList.vue, LanguageSearch.vue, LanguageSidebar.vue,
        ExpandableSection.vue, VariableList.vue, AppFooter.vue, NavMenu.vue — CHANGED:
        hardcoded Portuguese strings replaced with `t('...')` calls via useLocale)

content/
├── history.md             # RENAMED to history.pt-BR.md (existing Portuguese text preserved)
├── history.en.md           # NEW: English translation
└── history.es.md           # NEW: Spanish translation

tests/
├── unit/
│   ├── useLocale.spec.js            # NEW: detection/country-rule/persistence (vue-i18n handles message fallback itself)
│   ├── locales.spec.js              # NEW: dictionary-completeness (same keys in all 3 locales)
│   └── LocaleSwitcher.spec.js       # NEW
└── e2e/
    └── locale-detection.spec.js     # NEW: per-locale auto-detect, manual switch, persistence, History
```

**Structure Decision**: Single Vue SPA project (matches the existing, unchanged layout from
`001-hello-world-multilang-site` and `002-responsive-sidebar-search`). No backend/frontend split
and no new top-level directories beyond a new `src/i18n/` folder for locale data — consistent with
the project's existing `src/composables/` and `src/content/` conventions.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*

## Amendment (2026-09-11): Per-Language URL Routing

**Why**: See spec.md's Amendment note and User Story 3 — search engines cannot discover the two
non-default languages without a distinct, crawlable address per language. This amendment adds
locale-prefixed routing on top of the already-implemented detection/translation/switcher work
above (Summary through Project Structure), without changing any of it.

### Updated Technical Context (delta only)

**Primary Dependencies**: No new dependency. `vue-router` (already in use) gains dynamic
locale-prefixed routes and a global navigation guard; page-level SEO tags (title, meta description,
`<html lang>`, `hreflang` alternates, canonical link) are set with plain DOM APIs
(`document.title`, `element.setAttribute`, etc.) from a small new composable — see research.md
§7 for why a head-management library (e.g., `@vueuse/head`, `vue-meta`) is not justified for this
fixed, small set of tags.

**Routing mode**: `vue-router`'s `createWebHistory()` replaces `createWebHashHistory()` — real
paths like `/pt-BR/history` instead of `/#/history` — because search engines and the `hreflang`
mechanism need distinct real URLs, and (per research.md §2) the hash fragment is invisible to
crawlers and to the server. This requires the hosting to rewrite any unknown path back to
`index.html` (a standard SPA server requirement); see research.md §2 and §5 for the verification
done and the fallback if a given deployment target cannot support it.

**Constraints (addition)**: The dynamically injected SEO tags (title/description/`hreflang`/
canonical) exist only in the post-JavaScript-execution DOM, not in the raw HTML response, since
this remains a client-rendered SPA with no server-side rendering or prerendering step (out of
scope for this amendment — see research.md §6 for the accepted limitation and why full SSR/
prerendering was not adopted here).

### Constitution Check (re-verified for this amendment)

- **I. Code Quality**: The redirect/locale-resolution logic lives in one router navigation guard
  (single responsibility); the SEO-tag logic lives in one new composable, not scattered across
  page components. PASS.
- **II. Testing Standards**: New behaviors (opening a locale-specific address, the no-locale
  redirect, the switcher navigating instead of just re-rendering, and the presence of
  `hreflang`/canonical/`lang` tags after render) each get a test — see the amended tasks when
  `/speckit-tasks` is run for this amendment. PASS.
- **III. User Experience Consistency**: No visible UI change for a human visitor beyond the address
  bar reflecting the language — the switcher, layout, and translated content behave exactly as
  before this amendment. PASS.
- **IV. Performance Requirements**: No new dependency and no new network requests; the guard and
  head-tag updates are synchronous, in-memory operations on data already loaded. Bundle-size
  re-check still applies (plan.md Constraints) but no material growth is expected. PASS.

No violations — Complexity Tracking remains empty.

### Updated Project Structure (delta only)

```text
src/
├── router/
│   └── index.js                     # CHANGED: createWebHistory(); routes gain a `:locale` prefix
│                                     #          segment; a beforeEach guard resolves/redirects a
│                                     #          no-locale address per FR-016
├── composables/
│   ├── useLocale.js                 # CHANGED: `locale` now derives from the route's `:locale`
│                                     #          param (source of truth); `setLocale` now navigates
│                                     #          (router.push) instead of mutating a standalone ref;
│                                     #          the detection algorithm itself (research.md §2 of
│                                     #          the original plan) is unchanged and reused by the
│                                     #          router guard
│   └── useLocaleSeoTags.js          # NEW: on route/locale change, sets document.title, the meta
│                                     #      description, <html lang>, hreflang alternate links
│                                     #      (+ x-default), and the canonical link
├── App.vue                          # CHANGED: calls useLocaleSeoTags() once at the top level
└── ... (AppHeader.vue, NavMenu.vue, and any other internal navigation call sites) — CHANGED: every
        router-link/programmatic navigation includes the current `:locale` segment

public/
└── .htaccess                        # NEW: SPA fallback rewrite rule, shipped with every build via
                                      #      Vite's public/ passthrough (research.md §5)
```

**Structure Decision (unchanged)**: Still a single Vue SPA project, single build. This amendment
adds one router file change, one changed composable, one new small composable, and one new static
asset (`public/.htaccess`) — no new top-level directories, no backend, no duplicated build.
