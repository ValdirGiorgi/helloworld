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
(programming-language) contributed content files are unchanged. Implemented with a small,
dependency-free composable and plain JS message dictionaries — no i18n library is added.

## Technical Context

**Language/Version**: JavaScript (ES2022), Vue 3.4 (`<script setup>`, Composition API) — unchanged.

**Primary Dependencies**: Vue 3, vue-router 4 (already in use). No new runtime dependency: locale
detection uses the browser's built-in `navigator.languages` and `Intl.Locale`, and translated
strings live in plain JS dictionary modules — see research.md §1 for why a full i18n library
(e.g., vue-i18n) is not justified at this project's scale.

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

**Performance Goals**: Switching locales MUST feel instant (all three dictionaries and the three
History translations are already loaded at build time via `import.meta.glob`, same pattern as
`useLanguages.js`; switching is a pure client-side re-render, no network request). Detection on
first load MUST add no perceptible startup delay (a few synchronous string/array operations on
`navigator.languages`).

**Constraints**: Must not grow the production gzipped JS bundle beyond the project's established
150KB budget (current baseline after `002-responsive-sidebar-search`: ≈90.4KB). Three short message
dictionaries and three short History translations are expected to add only a few KB.

**Scale/Scope**: 3 locales × (≈30–40 short interface strings + 1 short article, currently 15 lines
of Markdown). Touches most existing UI components to replace hardcoded Portuguese text with
dictionary lookups, adds one new composable and one new switcher component, and adds two new
localized History content files. No change to `content/languages/*.md`, `parseLanguageFile.js`, or
the `LanguageEntry` shape from `001-hello-world-multilang-site`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: A single, focused `useLocale` composable owns detection, fallback, manual
  override, and persistence (one responsibility each, per function); message dictionaries are one
  file per locale with a shared key shape, enabling an automated completeness check rather than
  relying on review alone. New identifiers use "locale" (not "language") throughout to avoid
  colliding with the app's existing domain meaning of "language" (a programming language) — see
  research.md §3. PASS.
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
│   ├── locales/
│   │   ├── en.js                    # NEW: English message dictionary (default/fallback)
│   │   ├── pt-BR.js                 # NEW: Brazilian Portuguese message dictionary
│   │   └── es.js                    # NEW: Spanish message dictionary
│   └── spanishSpeakingCountries.js  # NEW: static ISO 3166-1 alpha-2 reference list
├── composables/
│   ├── useLocale.js                 # NEW: detection, country rule, fallback, manual override, persistence
│   └── useLanguages.js              # UNCHANGED
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
        hardcoded Portuguese strings replaced with dictionary lookups via useLocale's `t`)

content/
├── history.md             # RENAMED to history.pt-BR.md (existing Portuguese text preserved)
├── history.en.md           # NEW: English translation
└── history.es.md           # NEW: Spanish translation

tests/
├── unit/
│   ├── useLocale.spec.js            # NEW: detection/country-rule/fallback/persistence
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
