# Implementation Plan: Responsive Layout with Sidebar Navigation and Language Search

**Branch**: `002-responsive-sidebar-search` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-responsive-sidebar-search/spec.md`

## Summary

Replace the current two-column card grid (`LanguageList.vue`'s `grid gap-6 sm:grid-cols-2`) with a
single vertical column at every screen width, add a client-side, case-insensitive substring search
over language names, and add a sidebar that lists every language and lets a visitor jump straight
to one — persistently visible on desktop/tablet, an off-canvas drawer on mobile. All three pieces
are pure front-end additions on top of the existing build-time-parsed `LanguageEntry` data
(`useLanguages.js`); no new dependency, backend, or content-format change is required.

## Technical Context

**Language/Version**: JavaScript (ES2022), Vue 3.4 (`<script setup>`, Composition API) — same as
the rest of the project, no version change.

**Primary Dependencies**: Vue 3, vue-router 4 (already in use). No new runtime dependency: search
is a plain substring filter, and the sidebar drawer is built with existing Tailwind utility classes
plus Vue's built-in `<Transition>` — introducing a UI/animation library for one toggle would
violate Constitution Principle I (no unjustified complexity).

**Storage**: N/A — filtering and navigation operate on the already-loaded, build-time-parsed
`languages` array from `useLanguages.js`; nothing is persisted.

**Testing**: Vitest + `@vue/test-utils` for the filter logic and the new components (unit);
Playwright for the end-to-end mobile-drawer, search, and no-distortion-on-expand flows (e2e) — same
tooling already used for `001-hello-world-multilang-site`.

**Target Platform**: Static site, evergreen browsers, mobile and desktop viewports (same as the
base feature) — this feature is specifically about making that existing target work well down to
narrow mobile widths and high zoom levels.

**Project Type**: Web — single Vue SPA (`src/`), no backend. Matches the existing "Option 1:
Single project" layout already used for `001-hello-world-multilang-site`, just with new files under
`src/components/` and `src/composables/`.

**Performance Goals**: Filtering and sidebar toggle MUST feel instantaneous (no visitor-perceptible
delay) for the current and near-term catalog size (single-digit to low-tens of languages) — a plain
in-memory `Array.prototype.filter` over language names is O(n) and comfortably meets this without
debouncing or virtualization.

**Constraints**: Must not grow the production gzipped JS bundle beyond the 150KB budget already
established in `001-hello-world-multilang-site/plan.md` (currently ~88.9KB); the new components are
small (a text input, a nav list, a toggle button) and are expected to add only a few KB.

**Scale/Scope**: 3 new/changed UI pieces — a search input, a sidebar/drawer, and a re-laid-out
language list — touching `HomePage.vue`, `LanguageList.vue`, and adding two new components plus one
new composable. No change to `content/languages/*.md`, `parseLanguageFile.js`, or the
`LanguageEntry` shape from the base feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: New components follow the existing single-responsibility split (a search
  input, a sidebar, a filtering composable are each separate files) and existing naming/formatting
  conventions (`PascalCase.vue` under `src/components/<area>/`, `useXxx.js` under
  `src/composables/`). PASS.
- **II. Testing Standards (NON-NEGOTIABLE)**: Every new behavior (substring filter, no-results
  state, sidebar open/close on mobile, jump-to-language, single-column layout, expand-does-not-
  distort-siblings) gets a unit and/or e2e test before being considered done. PASS (see Testing
  above and quickstart.md).
- **III. User Experience Consistency**: Reuses the existing `BaseButton`/`BaseCard`/`BaseIcon`
  primitives and the existing collapsed-by-default card pattern from `001-hello-world-multilang-
  site` rather than inventing new visual language; the sidebar is a well-understood, industry-
  standard responsive nav pattern rather than a novel interaction. Accessibility: sidebar toggle is
  a native `<button>` with an `aria-label`/`aria-expanded`, search input has an associated
  `<label>`, sidebar links are real `<a>`/`router-link`-style elements — all keyboard-operable.
  PASS.
- **IV. Performance Requirements**: Budget stated above (instantaneous filter, bundle growth kept
  well inside the existing 150KB gzip ceiling); verified by re-running `npm run build` after
  implementation and comparing gzip size to the 88.9KB baseline. PASS.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-responsive-sidebar-search/
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
├── components/
│   ├── language/
│   │   ├── LanguageList.vue        # CHANGED: single vertical column instead of sm:grid-cols-2
│   │   ├── LanguageSearch.vue       # NEW: search input, filters by language name
│   │   ├── LanguageCard.vue         # CHANGED: gains an id/anchor for sidebar jump-to-language
│   │   └── ...                      # (CodeBlock, ExpandableSection, FixedOutcomeExample, VariableList — unchanged)
│   └── layout/
│       ├── LanguageSidebar.vue      # NEW: lists every language, jump-to on select
│       └── ...                      # (AppHeader, AppFooter, NavMenu — unchanged)
├── composables/
│   ├── useLanguages.js              # UNCHANGED: still the single source of parsed LanguageEntry data
│   ├── useLanguageFilter.js         # NEW: pure filter (languages, query) -> filtered languages
│   └── ...                          # (useExpandable — unchanged)
└── pages/
    └── HomePage.vue                 # CHANGED: composes LanguageSearch + LanguageSidebar + LanguageList
                                      #          into the responsive two-region (sidebar/content) layout

tests/
├── unit/
│   ├── useLanguageFilter.spec.js    # NEW
│   ├── LanguageSearch.spec.js       # NEW
│   ├── LanguageSidebar.spec.js      # NEW
│   └── LanguageList.spec.js         # NEW (vertical layout, no side-by-side classes)
└── e2e/
    ├── responsive-layout.spec.js    # NEW: mobile viewport, no horizontal scroll, single column
    ├── search-language.spec.js      # NEW: search filters/no-results
    └── sidebar-navigation.spec.js   # NEW: open/close drawer on mobile, jump-to-language
```

**Structure Decision**: Single Vue SPA project (matches the existing, unchanged `001-hello-world-
multilang-site` layout). No backend/frontend split and no new top-level directories — this feature
only adds files under the existing `src/components/`, `src/composables/`, and `tests/` trees, plus
edits to three existing files (`LanguageList.vue`, `LanguageCard.vue`, `HomePage.vue`).

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
