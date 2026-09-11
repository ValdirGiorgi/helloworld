# Quickstart: Internationalization with Automatic Language Detection

## Prerequisites

- Node.js + npm already set up for this repo.
- `npm install` — this feature adds one new dependency, `vue-i18n` (see research.md §1).

## Run the app

```bash
npm run dev
```

Because automatic detection reads your own browser's locale settings, what you see on a plain
`npm run dev` visit depends on your browser/OS locale. To reliably exercise every branch of the
country rule, use a Playwright browser context with an explicit `locale` (see "Automated checks"
below) or temporarily change your OS/browser language settings.

## Validate: automatic detection (User Story 1 / FR-002–FR-005, FR-011, SC-001–SC-003)

Using a browser context (or a browser profile) set to each locale in turn:

1. Set the browser locale to `pt-BR` → load the site → confirm the interface (header, nav, search
   placeholder, footer, etc.) is in Brazilian Portuguese.
2. Set the browser locale to a Spanish-speaking country, e.g. `es-MX` or `es-AR` → load the site →
   confirm the interface is in Spanish.
3. Set the browser locale to something else with a region, e.g. `en-US` or `fr-FR` → load the site
   → confirm the interface is in English.
4. Set the browser locale to a bare language with no region, e.g. `es` (no country) → load the site
   → confirm the interface falls back to English (per FR-004/FR-011 — no explicit region to detect
   a country from).

## Validate: manual switch and persistence (User Story 2 / FR-007–FR-009, SC-004, SC-005)

1. On any page, locate the language control at the top of the page — confirm all three locales
   ("Português", "English", "Español") are listed.
2. Select a different locale than the one currently active — confirm the whole page immediately
   re-renders in that locale, with no full navigation to a different URL.
3. Navigate to another page (e.g., History, or a language detail page) — confirm the manually
   chosen locale is still active.
4. Reload the page (or close and reopen the tab) — confirm the manually chosen locale is still
   shown, not the automatically detected one.

## Validate: translated content coverage (FR-010, SC-006, SC-007)

1. In each of the three locales, click through: the home page's header, tagline, search
   placeholder, the sidebar heading, a language card's "show more"/"show less" toggle and its
   section labels (Conditional, Calculation, Loop, Function, etc.), the footer, and the History
   page's title and full article body — confirm nothing is left in the wrong language or blank.
2. At a mobile viewport width, repeat step 1 for the locale with the longest strings (typically
   Portuguese or Spanish) — confirm no text is cut off, overlapping, or causes horizontal
   scrolling (SC-006; ties into `002-responsive-sidebar-search`'s existing layout requirements).

## Automated checks

```bash
npm run lint
npx vitest run
npx playwright test
npm run build
```

Expected: 0 lint errors; all unit tests pass, including a dictionary-completeness test (every key
path present in `en.js`, `pt-BR.js`, and `es.js`) and `useLocale`'s detection/country-rule/
persistence logic; all e2e tests pass, including a new locale-detection spec that uses Playwright's
per-test `locale` context option to simulate visitors from Brazil, a Spanish-speaking country,
another country, and an undeterminable locale, plus the manual-switch-and-persistence flow; the
production build succeeds with gzipped JS still comfortably under the project's 150KB budget
(baseline after `002-responsive-sidebar-search`: ≈90.4KB; adding vue-i18n is expected to bring this
to roughly 100-110KB, still well under budget — see `specs/002-responsive-sidebar-search/quickstart.md`
for the prior baseline).

**Result (2026-09-11)**: 0 lint errors (41 pre-existing style warnings in unrelated files,
unchanged from before this feature); 44/44 unit tests pass (12 test files); 19/19 e2e tests pass;
production build gzipped JS ≈113KB (0.48+1.86+4.30+47.84+58.96KB across chunks, plus 3.01KB CSS), a
~23KB increase over the 90.4KB baseline — comfortably under the 150KB budget. One layout regression
was found and fixed during manual verification: adding `<LocaleSwitcher>` next to `<NavMenu>` in
`AppHeader.vue` caused horizontal overflow at 375px width; fixed by making the header row wrap
(`flex-wrap` + `gap-y-2`) instead of forcing everything onto one line. The locale switcher's visible
content was also changed from text labels to flag emoji (🇧🇷/🇺🇸/🇪🇸) per a follow-up request, with the
language name moved to `aria-label`/`title` so accessibility is unaffected.

---

## Amendment (2026-09-11): Per-Language URL Routing

### Prerequisites (addition)

- The hosting target MUST rewrite unmatched paths back to `index.html` (research.md §2 and §5) —
  `public/.htaccess` in this repo provides this for the Apache-based hosting already confirmed to
  support it. If deployed somewhere that doesn't, see spec.md's Assumptions for the documented
  fallback (revert to hash-based routing, drop User Story 3).

## Validate: each language has its own address (User Story 3 / FR-013, FR-014, SC-008, SC-009)

1. Visit the home page's address prefixed with each locale in turn — `/pt-BR`, `/en`, `/es` — and
   confirm each shows the fully translated interface in that exact language, regardless of your own
   browser's locale settings.
2. Do the same for the History page (`/pt-BR/history`, `/en/history`, `/es/history`) and a language
   detail page (`/pt-BR/languages/java`, etc.) — confirm each loads correctly and in the right
   language.
3. Open a private/incognito window (no stored preference) with your browser set to a Spanish-speaking
   locale, and visit `/en` (a *different* language's address) directly — confirm English is shown,
   not Spanish (the address you opened wins over your browser's own detected language).

## Validate: the no-language address resolves correctly (FR-016)

1. Clear any stored preference (clear the site's local storage, or use a fresh private window), set
   your browser to a Spanish-speaking locale, and visit the bare home address (no locale in the
   path) — confirm you land on `/es` (the address bar itself changes).
2. With a manually chosen locale already stored (use the switcher once first), visit the bare home
   address again — confirm you land on your stored locale's address, not a freshly detected one.

## Validate: the switcher updates the address (FR-017)

1. On any page, use the top-of-page language switcher — confirm the browser's address bar updates
   to that language's address for the *same* page (e.g., switching from `/en/history` to Spanish
   lands on `/es/history`, not `/es`).

## Validate: search-engine-facing tags (User Story 3 / FR-015, SC-010)

Since these tags are added to the page by JavaScript after it loads (research.md §10), inspect the
**rendered** page, not the raw HTML response — use your browser's DevTools "Elements" panel (not
"View Page Source", which shows the pre-JavaScript HTML), or a tool that executes JavaScript such as
Google Search Console's URL Inspection tool once the site is live and indexed.

1. On any page, confirm `<html lang="...">` matches the currently displayed language.
2. In `<head>`, confirm there are three `<link rel="alternate" hreflang="...">` elements (one per
   supported locale) plus one with `hreflang="x-default"`, each pointing at the correct address for
   the current page.
3. Confirm a `<link rel="canonical">` element points at the **current** page's own address (not a
   different locale's).

## Automated checks (addition)

```bash
npm run lint
npx vitest run
npx playwright test
npm run build
```

Expected (in addition to the checks already listed above): new unit tests for the router's
no-locale redirect guard and `useLocaleSeoTags()`'s tag output; new e2e tests requesting each
locale's address directly, confirming the no-locale redirect, confirming the switcher changes the
address, and confirming the presence/correctness of the `hreflang`/canonical/`lang` tags in the
rendered DOM. Bundle size should show no material increase over the ≈113KB baseline recorded above
(no new dependency is introduced by this amendment).

**Result (2026-09-11)**: 0 lint errors (40 pre-existing style warnings, unchanged pattern from
before this amendment); 55/55 unit tests pass (14 test files, including new `router.spec.js` and
`useLocaleSeoTags.spec.js`, plus `useLocale.spec.js` rewritten to test the route-derived locale
instead of the now-moved detection logic); 25/25 e2e tests pass (including the new
`locale-routing.spec.js`); production build gzipped JS ≈114KB — no material change from the
≈113KB pre-amendment baseline, confirming no new dependency was introduced. `public/.htaccess`
confirmed present in `dist/` after build.

**Bug found and fixed during manual verification**: after switching to `createWebHistory()`, the
app was mounted (`app.mount('#app')`) before the router's initial navigation — including the
no-locale redirect guard — had resolved. The very first render then read `route.params.locale` as
`undefined`, which crashed `<router-link :to="{ name: 'home', params: { locale } }">` in
`AppHeader.vue` ("Missing required param 'locale'"), producing a blank page on every fresh load of
the bare site address. Fixed in `src/main.js` by awaiting `router.isReady()` before mounting, so
the app's first render always sees a fully resolved, locale-prefixed route.
