# Quickstart: Internationalization with Automatic Language Detection

## Prerequisites

- Node.js + npm already set up for this repo.
- `npm install` (no new dependencies are added by this feature — see research.md §1).

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
present in `en.js`, `pt-BR.js`, and `es.js`) and `useLocale`'s detection/fallback/persistence logic;
all e2e tests pass, including a new locale-detection spec that uses Playwright's per-test
`locale` context option to simulate visitors from Brazil, a Spanish-speaking country, another
country, and an undeterminable locale, plus the manual-switch-and-persistence flow; the production
build succeeds with gzipped JS still comfortably under the project's 150KB budget (baseline after
`002-responsive-sidebar-search`: ≈90.4KB — see `specs/002-responsive-sidebar-search/quickstart.md`).
