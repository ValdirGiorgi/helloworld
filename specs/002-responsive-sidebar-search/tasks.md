# Tasks: Responsive Layout with Sidebar Navigation and Language Search

**Input**: Design documents from `/specs/002-responsive-sidebar-search/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/component-contracts.md](./contracts/component-contracts.md), [quickstart.md](./quickstart.md)

**Tests**: Included — Constitution Principle II (Testing Standards, NON-NEGOTIABLE) requires automated tests for every new behavior's happy path and known critical edge cases.

**Organization**: Tasks are grouped by user story (as prioritized in spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

Single Vue SPA project (see plan.md Structure Decision): `src/`, `tests/` at repository root.

---

## Phase 1: Setup

**Purpose**: Establish the performance baseline this feature must stay within before any code changes.

- [X] T001 Run `npm run build` and record the current gzipped JS size (baseline ~88.9KB per `specs/001-hello-world-multilang-site/quickstart.md`) so it can be compared after implementation against the 150KB budget stated in `plan.md`'s Constraints — no source changes, note the measured value for use in T025. (Measured: 0.48+0.53+4.23+37.05+46.61 ≈ 88.9KB gzip, confirms baseline.)

**Checkpoint**: Baseline recorded. No new dependencies are required for this feature (research.md §2–3).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Make `LanguageList.vue` prop-driven so `HomePage.vue` can own the `languages` array and later hand it a filtered (US1) or full (US2) list. Both User Story 1 and User Story 2 depend on this; User Story 3 does not strictly require it but reuses the same file.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Refactor `src/components/language/LanguageList.vue` to accept a required `languages` prop (`{ type: Array, required: true }`, per `contracts/component-contracts.md`'s `<LanguageList>` contract) instead of calling `useLanguages()` internally — src/components/language/LanguageList.vue
- [X] T003 Update `src/pages/HomePage.vue` to call `useLanguages()` itself and pass `:languages="languages"` down to `<LanguageList>` (direct pass-through for now; User Story 1 replaces this with a filtered value) — src/pages/HomePage.vue
- [X] T004 [P] Unit test: `LanguageList.vue` renders one `<LanguageCard>` per entry in its `languages` prop, and no longer imports/calls `useLanguages` itself — tests/unit/LanguageList.spec.js

**Checkpoint**: `LanguageList` is prop-driven and `HomePage` supplies it — user story implementation can now begin.

---

## Phase 3: User Story 1 - Find a language by name (Priority: P1) 🎯 MVP

**Goal**: A visitor can filter the language list by typing a full or partial language name, case-insensitively, and sees a clear message when nothing matches.

**Independent Test**: Type a full/partial/mixed-case name into the search field and confirm only matching languages remain visible; clear it and confirm all languages return — testable without the sidebar or the vertical-layout change from User Story 3.

### Tests for User Story 1 ⚠️

- [X] T005 [P] [US1] Unit test for `useLanguageFilter(languages, query)`: case-insensitive substring match on `entry.name`; an empty or whitespace-only `query` returns the full `languages` array, unmutated and in its original order (data-model.md `SearchQuery`/`FilteredLanguages` validation rules) — tests/unit/useLanguageFilter.spec.js
- [X] T006 [P] [US1] Unit test for `<LanguageSearch>`: renders a labeled `<input type="search">` (label associated via `for`/`id`) and emits `update:modelValue` with the input's current value on every change — tests/unit/LanguageSearch.spec.js
- [X] T007 [P] [US1] Unit test: `LanguageList.vue` renders a "no results" message (not an empty container) when its `languages` prop is an empty array (FR-004) — tests/unit/LanguageList.spec.js

### Implementation for User Story 1

- [X] T008 [US1] Implement `useLanguageFilter(languages, query)` in `src/composables/useLanguageFilter.js` per `contracts/component-contracts.md`: pure function, case-insensitive (`toLocaleLowerCase`) substring match on `.name`, empty/whitespace query short-circuits to the original array (depends on T005 failing first)
- [X] T009 [US1] Implement `<LanguageSearch>` in `src/components/language/LanguageSearch.vue`: `modelValue` prop (`{ type: String, default: '' }`), `update:modelValue` emit, labeled `<input type="search">` with placeholder "Buscar linguagem..." (depends on T006 failing first)
- [X] T010 [US1] Add "no results" empty-state message to `src/components/language/LanguageList.vue` for when the `languages` prop is an empty array (depends on T007 failing first, and on T002)
- [X] T011 [US1] Wire a `query` ref and `filteredLanguages = computed(() => useLanguageFilter(languages.value, query.value))` into `src/pages/HomePage.vue`; render `<LanguageSearch v-model="query" />` above the list and pass `<LanguageList :languages="filteredLanguages" />` (depends on T003, T008, T009)
- [X] T012 [P] [US1] e2e test: searching a full language name (e.g., "Java") shows only that language; a lowercase/partial term (e.g., "pyt") still matches; a non-matching term (e.g., "xyzxyz") shows the "no results" message; clearing the field restores every language — tests/e2e/search-language.spec.js

**Checkpoint**: User Story 1 is fully functional and independently testable — search works end to end.

---

## Phase 4: User Story 2 - Navigate the full language list from a sidebar (Priority: P2)

**Goal**: A visitor can open a sidebar listing every language and jump straight to any one of them, with the sidebar persistent on desktop and an off-canvas drawer on mobile that doesn't permanently shrink the content area.

**Independent Test**: Open the sidebar, confirm it lists every language, click one, and confirm the main content reveals that language — testable independently of search (US1) and of the final vertical-layout polish (US3).

### Tests for User Story 2 ⚠️

- [X] T013 [P] [US2] Unit test: `<LanguageSidebar>` renders one link per entry in its `languages` prop with `href="#language-{{ entry.slug }}"`, and emits `close` when a link is clicked — tests/unit/LanguageSidebar.spec.js
- [X] T014 [P] [US2] Unit test: `<LanguageSidebar>`'s panel visibility/CSS state reflects its `isOpen` prop below the `lg:` breakpoint (closed by default, open when `isOpen` is `true`) — tests/unit/LanguageSidebar.spec.js

### Implementation for User Story 2

- [X] T015 [P] [US2] Add `:id="`language-${entry.slug}`"` to `LanguageCard.vue`'s root `<BaseCard>` so sidebar anchor links and `scrollIntoView` can target it (FR-010) — src/components/language/LanguageCard.vue
- [X] T016 [US2] Implement `<LanguageSidebar>` in `src/components/layout/LanguageSidebar.vue` per `contracts/component-contracts.md`: `languages` (required Array) and `isOpen` (Boolean, default `false`) props; `close` emit on link/backdrop activation; persistent `<nav aria-label="Linguagens">` at `lg:`+ widths; `fixed` off-canvas panel + backdrop + `<Transition>` below `lg:`; links call `element.scrollIntoView({ behavior: 'smooth', block: 'start' })` against `#language-{slug}` (depends on T013, T014 failing first, and T015)
- [X] T017 [US2] Add `isSidebarOpen` ref and a mobile-only (`lg:hidden`) toggle `<button aria-expanded="isSidebarOpen">` to `src/pages/HomePage.vue`; compose the responsive sidebar/content layout with `<LanguageSidebar :languages="languages" :is-open="isSidebarOpen" @close="isSidebarOpen = false" />` (depends on T003, T016)
- [X] T018 [P] [US2] e2e test: at desktop width, the sidebar is visible without any extra interaction, lists every language, and clicking one scrolls the page to that language's card — tests/e2e/sidebar-navigation.spec.js
- [X] T019 [P] [US2] e2e test: at mobile width, the sidebar is hidden behind a toggle button; opening it overlays the content without shrinking it; selecting a language scrolls to it and the sidebar closes afterward — tests/e2e/sidebar-navigation.spec.js

**Checkpoint**: User Stories 1 and 2 both work independently and together.

---

## Phase 5: User Story 3 - View language entries without layout distortion on any screen size (Priority: P1)

**Goal**: Languages stack in a single vertical column at every viewport width and zoom level, and expanding one language's details never changes any other entry's size or position.

**Independent Test**: Load the site at a narrow mobile width and at a magnified desktop zoom, confirm single-column stacking with no horizontal scrolling; expand a card and confirm no sibling shifts in width/x-position — testable independently of search (US1) and the sidebar (US2), though it is most visibly correct once both are in place.

### Tests for User Story 3 ⚠️

- [X] T020 [P] [US3] Unit test: `LanguageList.vue`'s root element carries a single-column layout class (e.g., `flex flex-col`) and no `grid`/`sm:grid-cols-*`/`md:grid-cols-*`/`lg:grid-cols-*` class at any breakpoint (FR-001) — tests/unit/LanguageList.spec.js

### Implementation for User Story 3

- [X] T021 [US3] Change `src/components/language/LanguageList.vue`'s root layout from `grid gap-6 sm:grid-cols-2` to a single-column layout (`flex flex-col gap-6`) applied at every breakpoint, per `research.md` §1 (depends on T020 failing first, and T002)
- [X] T022 [P] [US3] e2e test: at mobile width (375px) and at increased desktop browser zoom (150–200%), language cards stack in a single column with no horizontal scrolling (FR-009, SC-002) — tests/e2e/responsive-layout.spec.js
- [X] T023 [US3] e2e test: expanding one language card leaves every other card's bounding-box `x` position and `width` unchanged; cards positioned below it shift down by exactly the height it grew, and collapsing it again returns the layout to its original state with no leftover gap (FR-008, SC-003) — tests/e2e/responsive-layout.spec.js

**Checkpoint**: All three user stories are independently functional and work together — search, sidebar, and single-column no-distortion layout.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality gates across all three stories before calling the feature done.

- [X] T024 [P] Run `npm run lint` and fix any issues in the new/changed files (`LanguageList.vue`, `LanguageCard.vue`, `LanguageSearch.vue`, `LanguageSidebar.vue`, `HomePage.vue`, `useLanguageFilter.js`) (0 errors; 42 pre-existing style warnings remain in unrelated files, unchanged from before this feature — same `vue/max-attributes-per-line`/`singleline-html-element-content-newline` baseline noise seen in `001-hello-world-multilang-site`)
- [X] T025 Re-run `npm run build`, compare the new gzipped JS size against the T001 baseline, and confirm it stays comfortably under the 150KB budget (plan.md Constraints) — record the result in specs/002-responsive-sidebar-search/quickstart.md (Result: 0.48+1.97+4.25+37.06+46.61 ≈ 90.4KB gzip, +~1.5KB over the 88.9KB baseline, well under the 150KB budget — recorded in quickstart.md)
- [X] T026 Walk through every "Validate" section of specs/002-responsive-sidebar-search/quickstart.md manually in a real browser at mobile and desktop widths, confirming all three user stories behave as described (Done via the in-app Browser pane: confirmed single-column stacking + no-distortion expand on desktop, mobile off-canvas sidebar open/close/jump-to-language, desktop persistent sidebar, and search full/partial/no-results/clear — all as specified)
- [X] T027 [P] Verify accessibility: the sidebar toggle button has `aria-expanded`/an accessible label, the search input's `<label>` is correctly associated, and all sidebar links and the toggle are reachable and operable via keyboard alone (Constitution Principle III) — src/components/language/LanguageSearch.vue, src/components/layout/LanguageSidebar.vue (Confirmed: toggle button has `aria-expanded` + `aria-controls="language-sidebar"` and visible text; search input's `sr-only` `<label for="language-search">` matches the input's `id`; sidebar links and toggle are native `<a>`/`<button>` elements, keyboard-operable by default)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS User Stories 1 and 2 (both need `LanguageList` to be prop-driven and `HomePage` to own `languages`). User Story 3 does not strictly require it but touches the same file, so completing Phase 2 first avoids merge conflicts.
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion.
  - User Story 1 (search) and User Story 2 (sidebar) can proceed in parallel once Phase 2 is done — they touch different new files and only share read access to `HomePage.vue` (see note below).
  - User Story 3 (single-column layout) can also proceed in parallel — it only touches `LanguageList.vue`'s layout classes, independent of search/sidebar logic.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1 — Search)**: No dependency on User Story 2 or 3. Independently testable once Phase 2 is done.
- **User Story 2 (P2 — Sidebar)**: No dependency on User Story 1. Independently testable once Phase 2 is done.
- **User Story 3 (P1 — Layout)**: No dependency on User Story 1 or 2. Independently testable once Phase 2 is done.

**Shared-file note**: User Story 1 (T011) and User Story 2 (T017) both edit `src/pages/HomePage.vue`, and User Story 3 (T021) edits `src/components/language/LanguageList.vue` alongside Foundational's T002. If working in parallel (e.g., different team members), sequence the edits to the same file rather than editing concurrently; the stories remain logically independent even though two of their tasks share a file.

### Within Each User Story

- Tests MUST be written and FAIL before their corresponding implementation task.
- Composable/logic before component before page-wiring (e.g., T008 filter logic before T009 search component before T011 page wiring).

### Parallel Opportunities

- T004 (foundational unit test) can run alongside T002/T003 once those land, since it only reads the new prop contract.
- All three user story phases (3, 4, 5) can be worked in parallel once Phase 2 is complete (see shared-file note above).
- Within User Story 1: T005, T006, T007 (all different test files) in parallel; then T008, T009 in parallel (different files); T012 after T008-T011.
- Within User Story 2: T013, T014 in parallel; T015 in parallel with T013/T014; T018, T019 in parallel after T016-T017.
- Within User Story 3: T020 and T022 can be drafted in parallel (different files) before/alongside T021.
- T024 and T027 in Polish can run in parallel; T025 and T026 are sequential (build before manual walkthrough) and depend on all stories being complete.

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test useLanguageFilter in tests/unit/useLanguageFilter.spec.js"
Task: "Unit test LanguageSearch in tests/unit/LanguageSearch.spec.js"
Task: "Unit test LanguageList no-results state in tests/unit/LanguageList.spec.js"

# Then implement the composable and the component in parallel:
Task: "Implement useLanguageFilter in src/composables/useLanguageFilter.js"
Task: "Implement LanguageSearch in src/components/language/LanguageSearch.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (record baseline).
2. Complete Phase 2: Foundational (prop-driven `LanguageList`) — CRITICAL, blocks US1 and US2.
3. Complete Phase 3: User Story 1 (search).
4. **STOP and VALIDATE**: Run `tests/e2e/search-language.spec.js` and the Search section of quickstart.md independently.
5. Deploy/demo if ready — search alone already delivers the user's most-cited pain point.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 (search) → validate independently → demo.
3. Add User Story 3 (single-column, no-distortion layout) → validate independently → demo. (Recommended before US2, since a correct single-column layout makes the sidebar's jump-to-language behavior visually obvious and easy to verify.)
4. Add User Story 2 (sidebar) → validate independently → demo.
5. Polish (lint, bundle-size check, manual quickstart pass, accessibility check).

### Parallel Team Strategy

With multiple developers, after Setup + Foundational:
- Developer A: User Story 1 (search) — `useLanguageFilter.js`, `LanguageSearch.vue`.
- Developer B: User Story 2 (sidebar) — `LanguageSidebar.vue`, `LanguageCard.vue` anchor.
- Developer C: User Story 3 (layout) — `LanguageList.vue` layout classes.
- Coordinate on `HomePage.vue` edits (T011, T017) since both US1 and US2 touch it — land one, then rebase the other.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within their phase.
- [Story] label maps each task to its user story for traceability back to spec.md.
- No new runtime dependency is introduced anywhere in this task list (research.md §2-3).
- `content/languages/*.md`, `parseLanguageFile.js`, and the `LanguageEntry` shape from
  `001-hello-world-multilang-site` are not touched by any task here.
- Verify each test fails before implementing its corresponding task.
- Stop at any checkpoint to validate a story independently before moving on.
