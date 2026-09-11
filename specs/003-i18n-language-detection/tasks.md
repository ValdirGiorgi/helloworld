# Tasks: Internationalization with Automatic Language Detection

**Input**: Design documents from `/specs/003-i18n-language-detection/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/component-contracts.md](./contracts/component-contracts.md), [quickstart.md](./quickstart.md)

**Tests**: Included — Constitution Principle II (Testing Standards, NON-NEGOTIABLE) requires automated tests for every new behavior's happy path and known critical edge cases.

**Organization**: Tasks are grouped by user story (as prioritized in spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in every task description

## Path Conventions

Single Vue SPA project (see plan.md Structure Decision): `src/`, `content/`, `tests/` at repository root.

---

## Phase 1: Setup

**Purpose**: Add the one new dependency this feature needs.

- [X] T001 Run `npm install vue-i18n@^9` and confirm the resolved version lands in `package.json`/`package-lock.json` (plan.md Primary Dependencies, research.md §1) — package.json (Installed vue-i18n@9.14.5; v11 was tried first but requires Node >=22 while this project's runtime is Node 20.19.2, so stayed on the actively-compatible v9 line)

**Checkpoint**: vue-i18n available to import.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stand up the i18n plumbing (message dictionaries, the vue-i18n instance, and the
`useLocale` composable with its detection/persistence logic) that both User Story 1 (automatic
detection) and User Story 2 (manual switch) are built on top of.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create `src/i18n/locales/en.js`: default-export the canonical nested message tree (namespaces: `header`, `nav`, `home`, `search`, `languageList`, `sidebar`, `languageCard`, `fixedOutcome`, `expandable`, `variables`, `footer`, `history`, `languageDetail` — see contracts/component-contracts.md's key-namespace convention) covering every string enumerated in plan.md's Scope, in English — src/i18n/locales/en.js
- [X] T003 [P] Create `src/i18n/locales/pt-BR.js`: same key tree as `en.js` (data-model.md `TranslatedMessage`: "every key path present in one locale's message tree MUST be present in all three"), values taken from the site's existing hardcoded Portuguese text (e.g. `header.title` = "Hello World em Muitas Linguagens", `nav.languages` = "Linguagens", `languageList.noResults` = "Nenhuma linguagem encontrada.", etc.) — src/i18n/locales/pt-BR.js
- [X] T004 [P] Create `src/i18n/locales/es.js`: same key tree as `en.js`, Spanish translations for every key (data-model.md `TranslatedMessage` same-key-set rule) — src/i18n/locales/es.js
- [X] T005 [P] Create `src/i18n/spanishSpeakingCountries.js`: default-export a `string[]` of uppercase ISO 3166-1 alpha-2 codes for Spanish-speaking countries (Spain + Spanish-speaking Latin American countries), no duplicates (data-model.md `SpanishSpeakingCountries`) — src/i18n/spanishSpeakingCountries.js
- [X] T006 Create `src/i18n/index.js`: `export default createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en, 'pt-BR': ptBR, es } })`, importing the three locale files from T002-T004 (contracts/component-contracts.md `src/i18n/index.js` contract) — src/i18n/index.js (depends on T002, T003, T004)
- [X] T007 Wire `app.use(i18n)` into `src/main.js`, importing the default export from T006 (contracts/component-contracts.md) — src/main.js (depends on T006)
- [X] T008 [P] Unit test: every key path present in `en.js` is present in `pt-BR.js` and `es.js`, and vice versa (a recursive key-path diff over the three nested objects) — tests/unit/locales.spec.js
- [X] T009 Implement `useLocale()` in `src/composables/useLocale.js` per contracts/component-contracts.md: reads `navigator.languages` (falling back to `navigator.language`), takes the first tag with an explicit `Intl.Locale(tag).region` (no `.maximize()` — research.md §2), applies the country rule (`BR` → `pt-BR`; region in `spanishSpeakingCountries.js` → `es`; anything else or no region found → `en` — data-model.md `LocalePreference` derivation rule 2), checks the `site-locale` `localStorage` key first and skips detection entirely if it holds one of the three supported codes (data-model.md `LocalePreference` derivation rule 1), wraps vue-i18n's `useI18n()` for the returned `locale`/`t`, implements `setLocale(code)` to update `locale` and write `site-locale` only for a manual call (research.md §4), and exposes `supportedLocales` as the three `{ code, name }` entries — src/composables/useLocale.js (depends on T005, T007)
- [X] T010 [P] Unit test: `useLocale()` country-rule detection — a browser locale list with a `BR` region resolves to `pt-BR`; one with a region from `spanishSpeakingCountries.js` (e.g. `MX`) resolves to `es`; one with an unrelated region (e.g. `US`) resolves to `en`; a locale list with no tag carrying an explicit region resolves to `en` (data-model.md `DetectedCountry`/`LocalePreference` derivation rules) — tests/unit/useLocale.spec.js
- [X] T011 [P] Unit test: `useLocale()` manual override + persistence — calling `setLocale('es')` updates `locale` and writes `'es'` to the `site-locale` `localStorage` key; a subsequent fresh call to `useLocale()`'s initialization logic with that key already set skips detection and uses the stored value directly; a stored value outside the three supported codes is treated as absent, per data-model.md `ManualLocaleChoice` validation rule — tests/unit/useLocale.spec.js

**Checkpoint**: i18n plumbing (dictionaries, vue-i18n instance, `useLocale`) is in place and tested — user story implementation can now begin.

---

## Phase 3: User Story 1 - The site opens in the visitor's own language automatically (Priority: P1) 🎯 MVP

**Goal**: Every piece of app-generated interface text and the History article render in the
correct locale — Portuguese for Brazil, Spanish for a Spanish-speaking country, English otherwise
or when undeterminable — with no visitor action required.

**Independent Test**: Simulate visitors with different browser locales loading the site fresh and
confirm each sees every translated string (not just a subset) in the correct language, including
the History page — independent of the manual switcher built in User Story 2.

### Implementation for User Story 1

- [X] T012 [P] [US1] Replace the hardcoded brand text in `AppHeader.vue`'s header link with `t('header.title')` — src/components/layout/AppHeader.vue
- [X] T013 [P] [US1] Replace the hardcoded `links` labels in `NavMenu.vue` with `t('nav.languages')` and `t('nav.history')` — src/components/layout/NavMenu.vue
- [X] T014 [P] [US1] Replace the hardcoded h1/tagline/toggle-button text in `HomePage.vue` with `t('home.title')`, `t('home.tagline')`, and `t('home.sidebarToggle')` — src/pages/HomePage.vue
- [X] T015 [P] [US1] Replace the hardcoded label/placeholder in `LanguageSearch.vue` with `t('search.label')` and `t('search.placeholder')` — src/components/language/LanguageSearch.vue
- [X] T016 [P] [US1] Replace the hardcoded "Nenhuma linguagem encontrada." in `LanguageList.vue` with `t('languageList.noResults')` — src/components/language/LanguageList.vue
- [X] T017 [P] [US1] Replace the hardcoded "Linguagens" heading in `LanguageSidebar.vue` with `t('sidebar.heading')` — src/components/layout/LanguageSidebar.vue
- [X] T018 [P] [US1] Replace `LanguageCard.vue`'s hardcoded section labels with `t('languageCard.helloWorld')`, `t('languageCard.conditional')`, `t('languageCard.calculation')`, `t('languageCard.loop')`, `t('languageCard.function')`, `t('languageCard.stringConcatenation')`, `t('languageCard.list')`, `t('languageCard.boolean')`, and pass `t('expandable.showMore')`/`t('expandable.showLess')` as `<ExpandableSection>`'s `expand-label`/`collapse-label` props — src/components/language/LanguageCard.vue
- [X] T019 [P] [US1] Replace the hardcoded "Resultado exibido:" in `FixedOutcomeExample.vue` with `t('fixedOutcome.result')` — src/components/language/FixedOutcomeExample.vue
- [X] T020 [P] [US1] Replace `VariableList.vue`'s hardcoded `KIND_LABELS` object with `t('variables.integer')`, `t('variables.string')`, `t('variables.float')` — src/components/language/VariableList.vue
- [X] T021 [P] [US1] Replace `AppFooter.vue`'s hardcoded text with `t('footer.contribute')` (text before the link) and `t('footer.github')` (the link label) — src/components/layout/AppFooter.vue
- [X] T022 [P] [US1] Replace `LanguageDetailPage.vue`'s hardcoded not-found text with `t('languageDetail.notFound', { slug })` and `t('languageDetail.backToList')` — src/pages/LanguageDetailPage.vue
- [X] T023 [US1] Rename `content/history.md` to `content/history.pt-BR.md`, preserving its existing Portuguese text unchanged (research.md §6) — content/history.pt-BR.md
- [X] T024 [P] [US1] Write `content/history.en.md`: a complete, faithful English translation of the History article (data-model.md `LocalizedArticle`, SC-007) — content/history.en.md
- [X] T025 [P] [US1] Write `content/history.es.md`: a complete, faithful Spanish translation of the History article (data-model.md `LocalizedArticle`, SC-007) — content/history.es.md
- [X] T026 [US1] Update `HistoryPage.vue` to load `import.meta.glob('/content/history.*.md', { query: '?raw', import: 'default', eager: true })`, select the entry matching the active `locale` from `useLocale()` (falling back to the English entry if the active locale's file is unexpectedly absent — data-model.md `LocalizedArticle`), and pass `t('history.title')` as `<HistoryArticle>`'s `title` prop instead of the hardcoded string (contracts/component-contracts.md `HistoryPage.vue` contract) — src/pages/HistoryPage.vue (depends on T023, T024, T025)
- [X] T027 [P] [US1] e2e test: using Playwright's per-test `locale` context option, a `pt-BR` context shows Portuguese interface text (e.g. the header title and nav labels), an `es-MX` context shows Spanish, an `en-US` context shows English, and a bare `es` context (no region) falls back to English (spec.md User Story 1 Acceptance Scenarios 1-5) — tests/e2e/locale-detection.spec.js
- [X] T028 [P] [US1] e2e test: the History page's title and article body render in the currently active locale, for all three locales — tests/e2e/locale-detection.spec.js

**Checkpoint**: User Story 1 is fully functional and independently testable — automatic detection visibly changes every translated string and the History article.

---

## Phase 4: User Story 2 - Switching languages manually from anywhere on the site (Priority: P1)

**Goal**: A visible control at the top of every page lets a visitor pick any of the three
supported locales at any time; the choice applies immediately and is remembered for later
navigation and visits.

**Independent Test**: Starting from any auto-detected locale, use the top-of-page control to pick
a different one of the three, and confirm the interface immediately switches and stays switched
across navigation and reload — independent of which locale User Story 1's detection selected.

### Tests for User Story 2 ⚠️

- [X] T029 [P] [US2] Unit test: `<LocaleSwitcher>` renders one control per entry in `supportedLocales`, each labeled with that locale's own-language `name`; the currently active locale's control carries `aria-current="true"`; activating a different control calls `setLocale` with that locale's `code` — tests/unit/LocaleSwitcher.spec.js

### Implementation for User Story 2

- [X] T030 [US2] Implement `<LocaleSwitcher>` in `src/components/layout/LocaleSwitcher.vue` per contracts/component-contracts.md: no props/emits; reads `supportedLocales`, `locale`, and `setLocale` from `useLocale()`; marks the active one with `aria-current="true"` (depends on T029 failing first, and T009). **Design change during implementation** (user request): each control shows a flag emoji (🇧🇷/🇺🇸/🇪🇸, added as a `flag` field on `SUPPORTED_LOCALES` in `useLocale.js`) as its visible content instead of the language name, with `name` moved to `aria-label`/`title` so the accessible name — and every existing `getByRole('button', { name: ... })` lookup in tests — is unaffected
- [X] T031 [US2] Render `<LocaleSwitcher>` inside `AppHeader.vue`, visible at the top of every page alongside `<NavMenu>` (FR-007) — src/components/layout/AppHeader.vue (depends on T030; touches the same file as T012 — land T012 first)
- [X] T032 [P] [US2] e2e test: selecting a different locale from the top-of-page control immediately re-renders the interface in that locale with no full navigation to a different URL (spec.md User Story 2 Acceptance Scenarios 1-2) — tests/e2e/locale-detection.spec.js
- [X] T033 [P] [US2] e2e test: a manually chosen locale remains active after navigating to another page and after a full page reload, overriding what automatic detection would otherwise select (spec.md User Story 2 Acceptance Scenarios 3-4) — tests/e2e/locale-detection.spec.js

**Checkpoint**: User Stories 1 and 2 both work independently and together — the switcher is visible everywhere, and automatic detection still governs first-time visitors who haven't used it.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality gates across both stories before calling the feature done.

- [X] T034 [P] Run `npm run lint` and fix any issues in the new/changed files (0 errors; 41 pre-existing style warnings remain in unrelated files, same `vue/max-attributes-per-line`/`singleline-html-element-content-newline` baseline noise seen in `001`/`002`)
- [X] T035 Re-run `npm run build`, compare the new gzipped JS size against the ≈90.4KB baseline from `specs/002-responsive-sidebar-search/quickstart.md`, and confirm it stays comfortably under the 150KB budget after vue-i18n's expected ~10-15KB addition (plan.md Constraints) — record the result in specs/003-i18n-language-detection/quickstart.md (Result: 0.36+3.01+0.48+1.86+4.30+47.84+58.96 ≈ 113.4KB total incl. CSS, ~113KB JS gzip — a ~23KB increase over the 90.4KB baseline, somewhat more than the ~10-15KB estimate but still comfortably under the 150KB budget; recorded in quickstart.md)
- [X] T036 Walk through every "Validate" section of specs/003-i18n-language-detection/quickstart.md manually in a real browser across all three locales (automatic detection, manual switch + persistence, translated-content coverage) (Done via the in-app Browser pane: confirmed pt-BR/en/es full-interface translation, flag-based switcher, and immediate re-render on click; the full detection/History/persistence matrix is additionally covered by the automated `tests/e2e/locale-detection.spec.js` suite, all passing)
- [X] T037 [P] Verify accessibility: `<LocaleSwitcher>`'s controls are native, keyboard-operable elements with `aria-current` correctly indicating the active locale (Constitution Principle III) — src/components/layout/LocaleSwitcher.vue (Confirmed: native `<button>` elements, `aria-current="true"` on the active locale, `aria-label`/`title` giving each control an accessible name independent of its flag-emoji visual content)
- [X] T038 [P] Verify layout: at mobile width, in Portuguese and in Spanish (the locales with the longest strings), confirm no translated text is cut off, overlapping, or causes horizontal scrolling (spec.md SC-006, ties to `002-responsive-sidebar-search`'s existing no-distortion requirement) (Confirmed via Browser pane at 375px: header wraps onto multiple rows instead of overflowing — required a fix to `AppHeader.vue`, see below — and `tests/e2e/responsive-layout.spec.js` continues to pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS both User Story 1 and User
  Story 2 (both need the message dictionaries, the vue-i18n instance, and `useLocale()` to exist).
- **User Stories (Phase 3-4)**: Both depend on Foundational phase completion.
  - User Story 1 (automatic detection + translated content) and User Story 2 (manual switcher) can
    proceed largely in parallel once Phase 2 is done — see the shared-file note below.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### User Story Dependencies

- **User Story 1 (P1 — Automatic detection)**: No dependency on User Story 2. Independently
  testable once Phase 2 is done (detection and translated strings work with or without a visible
  switcher control).
- **User Story 2 (P1 — Manual switch)**: No dependency on User Story 1's string-extraction tasks,
  but does depend on the same Foundational `useLocale()` (T009). Independently testable once
  Phase 2 is done — the switcher can be exercised even before every string in User Story 1 has been
  extracted, since `useLocale()`'s `setLocale`/`locale` already work from Phase 2.

**Shared-file note**: User Story 1's T012 and User Story 2's T031 both edit
`src/components/layout/AppHeader.vue`. Land T012 first (translate the existing brand text), then
T031 (add the switcher) on top of it, rather than editing concurrently.

### Within Each User Story

- Tests MUST be written and FAIL before their corresponding implementation task (T029 before T030).
- Within User Story 1, T023 (rename) MUST precede T026 (which reads all three history files);
  T024/T025 (write the other two translations) can happen in parallel with T023.

### Parallel Opportunities

- T002, T003, T004, T005 (Foundational) can all be drafted in parallel — independent files with no
  cross-dependencies until T006 imports the three locale files.
- T008, T010, T011 (Foundational tests) can run in parallel once their corresponding implementation
  exists.
- Once Phase 2 is complete, most of User Story 1's string-extraction tasks (T012-T022) can run in
  parallel — each touches a different component file.
- T024 and T025 (the two non-Portuguese History translations) can be written in parallel.
- T027 and T028 (User Story 1 e2e tests) can run in parallel with each other; both after T012-T026.
- T032 and T033 (User Story 2 e2e tests) can run in parallel with each other, after T031.
- T034 and T037/T038 in Polish can run in parallel; T035 and T036 are sequential (build before
  manual walkthrough) and depend on both stories being complete.

---

## Parallel Example: Foundational Phase

```bash
# Launch the three locale dictionaries together:
Task: "Create src/i18n/locales/en.js"
Task: "Create src/i18n/locales/pt-BR.js"
Task: "Create src/i18n/locales/es.js"
Task: "Create src/i18n/spanishSpeakingCountries.js"

# Then, once those land, wire up the instance and composable:
Task: "Create src/i18n/index.js importing the three locale files"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install vue-i18n).
2. Complete Phase 2: Foundational (dictionaries, vue-i18n instance, `useLocale`) — CRITICAL, blocks
   both stories.
3. Complete Phase 3: User Story 1 (translate every string + the History article).
4. **STOP and VALIDATE**: Run `tests/e2e/locale-detection.spec.js`'s detection-related tests and
   the automatic-detection section of quickstart.md independently — the site should already show
   the fully correct language per visitor with no switcher UI yet.
5. Deploy/demo if ready — automatic detection alone already delivers the feature's stated "final
   requirement" (guaranteeing detection + English fallback work).

### Incremental Delivery

1. Setup + Foundational → i18n plumbing ready.
2. Add User Story 1 (translate everything, automatic detection visibly works) → validate
   independently → demo.
3. Add User Story 2 (top-of-page switcher, persistence) → validate independently → demo.
4. Polish (lint, bundle-size re-check against the new vue-i18n baseline, manual quickstart pass,
   accessibility and layout checks across all three locales).

### Parallel Team Strategy

With multiple developers, after Setup + Foundational:
- Developer A: User Story 1's component string-extraction tasks (T012-T022).
- Developer B: User Story 1's History translations and page wiring (T023-T026).
- Developer C: User Story 2's switcher (T029-T031).
- Coordinate on `AppHeader.vue` (T012 then T031) since both touch it.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within their phase.
- [Story] label maps each task to its user story for traceability back to spec.md.
- One new dependency is introduced in this feature: `vue-i18n` (T001), a deliberate choice recorded
  in research.md §1 — everything else (detection, persistence, the country list, localized History
  content) uses only the existing stack.
- `content/languages/*.md` and `parseLanguageFile.js` (the per-programming-language content model
  from `001-hello-world-multilang-site`) are not touched by any task here (spec.md FR-010 scope).
- Verify each test fails before implementing its corresponding task.
- Stop at any checkpoint to validate a story independently before moving on.

---

## Phase 6 (Amendment 2026-09-11): User Story 3 - Per-Language URL Routing (Priority: P2)

**Goal**: Each of the three languages is reachable at its own distinct, shareable address; opening
one directly always shows that language; the address with no language redirects to a resolved one;
the switcher updates the address; every page declares its language and links to its two
counterparts so search engines can associate all three.

**Independent Test**: Request each of the three languages' addresses directly (as a search engine
or a fresh visitor with a shared link would) and confirm each shows the correct, complete language
every time, independent of the visitor's own detected country or any stored preference — see
quickstart.md's "Amendment" validation sections.

**Prerequisite**: Phases 1-5 above (already complete) — this phase builds routing on top of the
already-working detection/translation/switcher, without changing their logic.

### Foundational for this phase (blocking — every other task here depends on the routing shape)

- [X] T039 Create `public/.htaccess` with an Apache SPA-fallback rewrite rule (rewrite any request that isn't an existing file/directory to `index.html`) so `createWebHistory()` routes resolve on a full page load or crawler request (research.md §5, contracts/component-contracts.md `public/.htaccess` contract) — public/.htaccess
- [X] T040 Update `src/router/index.js`: replace `createWebHashHistory()` with `createWebHistory()`; prefix all three existing routes with a `:locale(pt-BR|en|es)` dynamic segment (`/:locale`, `/:locale/history`, `/:locale/languages/:slug`); add a global `router.beforeEach` guard that lets a request through unchanged when `to.params.locale` is one of the three codes, and otherwise redirects to `to.fullPath` prefixed with the resolved locale — the stored `ManualLocaleChoice` (`localStorage` key `site-locale`) if present and valid, else the existing country-based detection algorithm from `useLocale.js` (data-model.md `LocalePreference` derivation rule 2, FR-016) — src/router/index.js (depends on T039)
- [X] T041 Revise `src/composables/useLocale.js` per contracts/component-contracts.md's amended `useLocale()` contract: `locale` becomes a `computed` derived from `useRoute().params.locale`, synced into vue-i18n's own `locale` via a watcher so `t()` matches the current address; `setLocale(code)` now writes `ManualLocaleChoice` (unchanged) and calls `router.push` to the current route's `name`/`params` with `params.locale` replaced by `code` instead of mutating a ref directly (FR-017) — src/composables/useLocale.js (depends on T040)
- [X] T042 [P] Add a `meta.description` key to `src/i18n/locales/en.js`, `pt-BR.js`, and `es.js` (data-model.md `SeoHeadTags.description`) — a single, page-independent translated description per locale, reusing the existing tagline text as its value — src/i18n/locales/en.js, src/i18n/locales/pt-BR.js, src/i18n/locales/es.js
- [X] T043 [P] Update `AppHeader.vue`'s brand `<router-link>` to navigate with `:to="{ name: 'home', params: { locale } }"` (reading `locale` from `useLocale()`) instead of a bare `to="/"` (contracts/component-contracts.md "Amendment addition" note) — src/components/layout/AppHeader.vue (depends on T041)
- [X] T044 [P] Update `NavMenu.vue`'s two links to navigate with `params: { locale }` for both the home and history routes instead of bare `/` and `/history` — src/components/layout/NavMenu.vue (depends on T041)
- [X] T045 [P] Update `LanguageDetailPage.vue`'s "back to list" `<router-link>` to navigate with `params: { locale }` instead of a bare `to="/"` — src/pages/LanguageDetailPage.vue (depends on T041)

**Checkpoint**: Every internal navigation stays inside the current locale; opening any bare/legacy
address resolves to a locale-prefixed one.

### Tests for User Story 3 ⚠️

- [X] T046 [P] [US3] Unit test: the router guard lets a request through unchanged when `to.params.locale` is `'pt-BR'`, `'en'`, or `'es'` — tests/unit/router.spec.js
- [X] T047 [P] [US3] Unit test: the router guard redirects a no-locale (or invalid-locale) request to the same path prefixed with the stored `ManualLocaleChoice` when one is set, and to the detected locale otherwise (reusing the same detection fixtures as `tests/unit/useLocale.spec.js`) — tests/unit/router.spec.js
- [X] T048 [P] [US3] Unit test: `useLocale()`'s `setLocale` performs a navigation to the equivalent path under the new locale (e.g., from `/en/history` to `/es/history`), not only an in-place value change — tests/unit/useLocale.spec.js
- [X] T049 [P] [US3] Unit test: `useLocaleSeoTags()` sets `document.documentElement.lang` to the active locale and creates exactly three `hreflang` alternate `<link>` elements plus one `hreflang="x-default"` and one `rel="canonical"` link, each with the expected `href`, and updates them again on a route/locale change — tests/unit/useLocaleSeoTags.spec.js

### Implementation for User Story 3

- [X] T050 [US3] Implement `useLocaleSeoTags()` in `src/composables/useLocaleSeoTags.js` per contracts/component-contracts.md: watches route + locale; sets `document.title` and finds-or-creates `<meta name="description">` from `t('meta.description')`; sets `document.documentElement.lang`; finds-or-creates the three `hreflang` links + `x-default` (pointing at the English address) and the self-referencing `canonical` link (data-model.md `SeoHeadTags`) (depends on T042, T049 failing first)
- [X] T051 [US3] Call `useLocaleSeoTags()` once at the top level of `src/App.vue` — src/App.vue (depends on T050)
- [X] T052 [US3] Update `tests/e2e/history-page.spec.js`'s URL assertion from the hash-based regex (`/#\/history$/`) to the new locale-prefixed path shape (e.g. `/\/en\/history$/`, since that spec is pinned to `locale: 'en-US'`) — tests/e2e/history-page.spec.js
- [X] T053 [US3] Update `tests/e2e/locale-detection.spec.js`'s existing History-page sub-tests to `page.goto` the locale-prefixed History address directly (e.g. `/pt-BR/history`) instead of the old hash-based `/#/history`, and update the "manual locale switch" tests' URL assertions to expect the new locale-prefixed path instead of the old hash-root regex — tests/e2e/locale-detection.spec.js
- [X] T054 [P] [US3] e2e test: requesting `/pt-BR`, `/en`, and `/es` directly (fresh browser contexts, no stored preference) each show that exact language's interface, regardless of the context's own browser locale — tests/e2e/locale-routing.spec.js
- [X] T055 [P] [US3] e2e test: a browser context set to a Spanish-speaking locale that requests `/en` directly sees English, not Spanish (the opened address wins over detection — spec.md User Story 3 Acceptance Scenario 2) — tests/e2e/locale-routing.spec.js
- [X] T056 [P] [US3] e2e test: a fresh context (no stored preference) set to a Spanish-speaking locale that requests the bare home address is redirected to `/es` (address bar changes); an English-locale context is redirected to `/en` (FR-016, spec.md User Story 3 Acceptance Scenario 1) — tests/e2e/locale-routing.spec.js
- [X] T057 [P] [US3] e2e test: with a manually chosen locale already stored (set via the switcher), requesting the bare home address again redirects to the stored locale's address, not a freshly detected one — tests/e2e/locale-routing.spec.js
- [X] T058 [P] [US3] e2e test: using the top-of-page switcher on `/en/history` navigates the browser to `/es/history` (same page, new locale) rather than just re-rendering text in place (FR-017, spec.md User Story 3 Acceptance Scenario 4) — tests/e2e/locale-routing.spec.js
- [X] T059 [P] [US3] e2e test: after loading any page, the rendered DOM contains `<html lang>` matching the active locale, three `hreflang` alternate links + one `x-default`, and one self-referencing `canonical` link, each with the expected addresses (SC-010) — tests/e2e/locale-routing.spec.js

**Checkpoint**: User Story 3 is functional and independently testable — every language has its own
working, correctly cross-linked address, and the existing detection/switcher/translation behavior
(User Stories 1 and 2) continues to pass unchanged.

### Polish for this phase

- [X] T060 [P] Run `npm run lint` and fix any issues in the new/changed files
- [X] T061 Re-run `npm run build` and confirm no material gzipped-JS growth over the ≈113KB baseline recorded in quickstart.md (no new dependency is introduced by this amendment — plan.md Amendment Constraints) — record the result in specs/003-i18n-language-detection/quickstart.md
- [X] T062 Run the full existing test suite (`npx vitest run`, `npx playwright test`) and fix any other pre-existing spec broken by the switch to locale-prefixed, hash-free URLs beyond the ones already called out in T052-T053 (e.g., any remaining hardcoded `/#/...` path or bare, locale-free URL assertion)
- [X] T063 Walk through the "Amendment" section of specs/003-i18n-language-detection/quickstart.md manually in a real browser, including inspecting the rendered DOM (not "View Page Source") for the `hreflang`/canonical/`lang` tags (Done via the Browser pane: confirmed `<html lang>`, title, meta description, all 4 `hreflang` alternates, and the self-referencing canonical link on `/en/history`; confirmed the switcher navigates `/en/history` → `/pt-BR/history` with fully translated content)
- [ ] T064 **PENDING external state** — Once `helloworld.valdir.dev.br` is live, perform the real-world confirmation test described in the chat history (upload/verify the `.htaccess` SPA fallback actually works on that exact hosting account/document root) and record the outcome in quickstart.md; if it fails, apply the documented fallback (research.md §8: revert to `createWebHashHistory()`, drop this phase's routes) rather than leaving the site broken. Not blocking: all other tasks in this phase are complete and verified against the local dev server, which already exercises the same `createWebHistory()` routing `.htaccess` exists to support in production.

---

## Dependencies & Execution Order (Amendment)

- Phase 6 depends on Phases 1-5 (the already-implemented feature) being complete — confirmed done.
- Within Phase 6: the "Foundational for this phase" block (T039-T045) is a hard prerequisite for
  everything else in the phase (router shape must exist before tests or `useLocaleSeoTags` can be
  written against it).
- T046-T049 (tests) MUST be written and FAIL before T050-T051 (implementation) — same TDD
  convention as the rest of this file.
- T052-T053 (fixing pre-existing specs) can happen any time after T040-T041, in parallel with
  T046-T059.
- T054-T059 (new e2e tests) can all run in parallel with each other (same file, but independent
  `test()` blocks with their own browser contexts) once T039-T051 are done.
- T064 is gated on external state (DNS propagation and hosting access) outside this repository's
  control — do not block the rest of the phase on it; it can be completed whenever that access is
  available, even after the rest of this phase ships.

## Notes (Amendment)

- No new dependency is introduced by this phase (research.md §7-10 Outcome).
- If T064's real-world hosting test fails, research.md §8 and spec.md's Assumptions already specify
  the fallback: revert `router/index.js` to `createWebHashHistory()` and remove the `:locale`
  segment, leaving User Stories 1 and 2 exactly as they already work today.
