---

description: "Task list template for feature implementation"
---

# Tasks: Hello World Multi-Language Showcase Site

**Input**: Design documents from `/specs/001-hello-world-multilang-site/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Included — the constitution's Testing Standards principle (NON-NEGOTIABLE, see `.specify/memory/constitution.md`) requires automated coverage of every feature's happy path and known edge cases before it is done, and `plan.md` commits this feature to a Vitest + Playwright stack.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Single frontend-only project at the repository root (no backend — see `plan.md` Structure Decision):
`src/`, `content/`, `public/`, `tests/`, `.github/workflows/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vue 3 + Vite + Tailwind project so every later task has somewhere to land.

- [X] T001 Create the project directory structure per `plan.md` Project Structure: `src/{assets,components/{base,layout,language,history},composables,content,pages,router}`, `content/languages/`, `public/`, `tests/{unit,e2e}`, `.github/workflows/` at the repository root
- [X] T002 Initialize `package.json` and install dependencies: `vue`, `vue-router`, `tailwindcss`, `postcss`, `autoprefixer`, `gray-matter`, `markdown-it` (runtime) and `vite`, `@vitejs/plugin-vue`, `vitest`, `@vue/test-utils`, `jsdom`, `@playwright/test`, `eslint`, `eslint-plugin-vue`, `prettier` (dev), per `plan.md` Primary Dependencies
- [X] T003 [P] Create `vite.config.js` configuring the Vue plugin and a Vitest `test` block (environment: `jsdom`)
- [X] T004 [P] Configure Tailwind: `tailwind.config.js` (content globs covering `index.html` and `src/**/*.vue`) and `postcss.config.js`, with centralized design tokens (colors, spacing, font scale) per `research.md` §3
- [X] T005 [P] Configure ESLint (`eslint-plugin-vue` recommended config) and Prettier, with `lint` and `format` scripts in `package.json`
- [X] T006 [P] Configure Playwright: `playwright.config.js` and a `test:e2e` script in `package.json`; add a `test:unit` script running Vitest
- [X] T007 Create `index.html` and `src/main.js` bootstrapping the Vue app and importing the Tailwind CSS entry file (depends on T003, T004)

**Checkpoint**: `npm run dev` serves an empty Vue app with Tailwind loaded; `npm run lint`, `npm run test:unit`, `npm run test:e2e` all run (with nothing to test yet).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure every user story depends on — content parsing, the language loader, base/layout components, routing, and the five launch languages' content files.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 Implement `src/content/parseLanguageFile.js`: parse a raw Markdown string's frontmatter (`name`) and extract the four fixed `##` sections (Hello World, Conditional, Calculation, Variables) into the `LanguageEntry` shape from `data-model.md`. Note: uses a small custom frontmatter reader instead of `gray-matter` — that library depends on Node's `Buffer` global, which isn't available in the browser bundle. Includes the T031/T046 validation (missing sections, missing/incorrect `- result:` label) since it lives in the same function.
- [X] T009 Implement `src/composables/useLanguages.js`: use `import.meta.glob('/content/languages/*.md', { query: '?raw', import: 'default', eager: true })`, map each raw file through `parseLanguageFile` (T008), and expose a reactive `languages` array sorted by `name` (depends on T008). Includes the T032 duplicate-slug validation.
- [X] T010 [P] Author `content/languages/java.md` following `contracts/language-template.md`: Hello World, a conditional, the calculation `(1 + 1) * 2` printing `4`, and integer/string/float variable declarations, in Java
- [X] T011 [P] Author `content/languages/python.md` following `contracts/language-template.md` (same four sections, calculation result `4`), in Python
- [X] T012 [P] Author `content/languages/dart.md` following `contracts/language-template.md` (same four sections, calculation result `4`), in Dart
- [X] T013 [P] Author `content/languages/abap.md` following `contracts/language-template.md` (same four sections, calculation result `4`), in ABAP
- [X] T014 [P] Author `content/languages/php.md` following `contracts/language-template.md` (same four sections, calculation result `4`), in PHP
- [X] T015 [P] Implement `src/components/base/BaseButton.vue`: a single-responsibility, Tailwind-styled button primitive accepting a `variant` prop
- [X] T016 [P] Implement `src/components/base/BaseCard.vue`: a generic card container primitive
- [X] T017 [P] Implement `src/components/base/BaseBadge.vue`: a small label primitive (e.g. for a language tag)
- [X] T018 [P] Implement `src/components/base/BaseIcon.vue`: wraps an SVG icon via a default slot
- [X] T019 [P] Implement `src/components/layout/AppHeader.vue`: site title/banner, using `BaseIcon`/`BaseBadge` as needed
- [X] T020 [P] Implement `src/components/layout/NavMenu.vue`: primary navigation shell. Note: the History link (T045) was included directly here rather than added later, since there was no reason to write it twice.
- [X] T021 [P] Implement `src/components/layout/AppFooter.vue`: site footer (e.g. link to the GitHub repository per FR-016). GitHub URL is a placeholder pending the real repo — flagged in the completion report.
- [X] T022 Configure `src/router/index.js` with `vue-router`'s `createWebHashHistory` (per `research.md` §6) and three routes: `/` → `HomePage`, `/history` → `HistoryPage`, `/languages/:slug` → `LanguageDetailPage`, each lazy-imported from `src/pages/` (depends on T002)
- [X] T023 Wire `src/App.vue` as the root layout (`AppHeader` + `RouterView` + `AppFooter`) and mount the router and app in `src/main.js` (depends on T019, T020, T021, T022, T007)

**Checkpoint**: Foundation ready — `useLanguages()` returns 5 parsed `LanguageEntry` objects, site chrome renders, routing works with empty pages. User story implementation can now begin.

---

## Phase 3: User Story 1 - Browse Hello World across languages (Priority: P1) 🎯 MVP

**Goal**: A visitor sees all 5 launch languages listed, each showing only its Hello World code by default (spec FR-001, SC-001).

**Independent Test**: Open the site and confirm each of the 5 launch languages displays its Hello World example by default, with no interaction required.

### Tests for User Story 1 ⚠️

> Write these tests first; confirm they FAIL before starting the Implementation tasks below.

- [X] T024 [P] [US1] Unit test in `tests/unit/parseLanguageFile.spec.js`: given a fixture Markdown string matching `contracts/language-template.md`, assert the parsed result has a non-empty `slug`, `name`, `helloWorld.code`, `conditional.code`, `calculation.code`, `calculation.result`, and a `variables` array containing all three kinds — integer, string, and float (per `data-model.md`: "MUST include at least one entry each of kind `integer`, `string`, `float`")
- [X] T025 [P] [US1] Component test in `tests/unit/LanguageCard.spec.js`: given a `LanguageEntry` prop, assert only the Hello World code is rendered/visible, and that conditional/calculation/variables content is absent from the default (collapsed) render
- [X] T026 [P] [US1] E2e test in `tests/e2e/browse-and-expand.spec.js`: load the home page and assert all 5 launch languages (Java, Python, Dart, ABAP, PHP) are listed, each showing only its Hello World code by default (spec Acceptance Scenario US1-1)

### Implementation for User Story 1

- [X] T027 [P] [US1] Implement `src/components/language/CodeBlock.vue`: renders one labeled, monospaced code snippet (language + code text)
- [X] T028 [US1] Implement `src/components/language/LanguageCard.vue`: renders the language name and a `CodeBlock` for `helloWorld` only, with no other section visible by default (depends on T027, T016)
- [X] T029 [US1] Implement `src/components/language/LanguageList.vue`: iterates `useLanguages()` (T009) and renders one `LanguageCard` per entry (depends on T028)
- [X] T030 [US1] Implement `src/pages/HomePage.vue` rendering `LanguageList`, mounted at route `/` (depends on T022, T029)
- [X] T031 [P] [US1] Add build-time validation to `src/content/parseLanguageFile.js` (T008): throw a clear error naming the missing section when `helloWorld`, `conditional`, `calculation`, or `variables` is absent or empty in a source file — per `data-model.md`: "a `LanguageEntry` missing a required section fails build-time validation rather than silently publishing an incomplete entry" (done as part of T008)
- [X] T032 [P] [US1] Add build-time validation to `src/composables/useLanguages.js` (T009): throw a clear error naming the colliding filenames when two `content/languages/*.md` files resolve to the same `slug` — per `data-model.md`: "`slug` MUST be unique across all `LanguageEntry` records... a collision fails the build" (done as part of T009)

**Checkpoint**: User Story 1 is fully functional and independently testable — `npm run test:unit`, `npm run test:e2e`, and a manual `npm run dev` check all confirm the 5 languages list with Hello World only.

---

## Phase 4: User Story 2 - Explore deeper examples per language (Priority: P2)

**Goal**: Expanding a language entry reveals its conditional, calculation, and variable examples; collapsing returns it to Hello-World-only (spec FR-002, FR-003, FR-007).

**Independent Test**: Expand a language entry, confirm the three extra examples appear (with the calculation result reading `4` for every language), collapse it again, confirm it returns to Hello-World-only.

### Tests for User Story 2 ⚠️

- [X] T033 [P] [US2] Unit test in `tests/unit/useExpandable.spec.js`: assert the composable's default state is collapsed (`false`) and that `toggle()` flips it
- [X] T034 [P] [US2] Component test in `tests/unit/ExpandableSection.spec.js`: assert slot content is hidden while collapsed, visible once expanded, and that a click toggles the state
- [X] T035 [US2] Extend `tests/e2e/browse-and-expand.spec.js` (T026): click a language card's expand control, assert the conditional, calculation, and variable sections become visible and the calculation result reads `4` (spec FR-007, SC-003), click again, assert the card returns to Hello-World-only (spec Acceptance Scenarios US2-1, US2-2, US2-3)

### Implementation for User Story 2

- [X] T036 [P] [US2] Implement `src/composables/useExpandable.js` exposing `isExpanded` (default `false`) and `toggle()`
- [X] T037 [US2] Implement `src/components/language/ExpandableSection.vue`: a collapsible container toggled via a `BaseButton`, reflecting state through `aria-expanded` (Constitution Principle III — accessibility) (depends on T036, T015). Uses `v-if` rather than `v-show` so collapsed content is genuinely absent, not just visually hidden (matches FR-001 and keeps text-based assertions meaningful).
- [X] T038 [P] [US2] Implement `src/components/language/VariableList.vue`: renders the `variables` entries (integer/string/float) from `data-model.md` as labeled `CodeBlock`s
- [X] T039 [US2] Update `src/components/language/LanguageCard.vue` (T028) to wrap the conditional `CodeBlock`, the calculation `CodeBlock` (with its visible result), and `VariableList` inside `ExpandableSection`, toggled by a `BaseButton` (depends on T037, T038, T036)

**Checkpoint**: User Stories 1 AND 2 both work independently — expand/collapse is consistent across every language card.

---

## Phase 5: User Story 3 - Read the history of Hello World (Priority: P2)

**Goal**: A visitor can read dedicated content on the origin and evolution of Hello World (spec FR-004).

**Independent Test**: Navigate to the history content and confirm it renders readable text describing Hello World's origin and evolution, independent of the language list.

### Tests for User Story 3 ⚠️

- [X] T040 [P] [US3] Component test in `tests/unit/HistoryArticle.spec.js`: given `title`/`body` props, assert both render
- [X] T041 [P] [US3] E2e test in `tests/e2e/history-page.spec.js`: navigate via the nav menu's "History" link and assert the history content is visible at `/#/history` (spec Acceptance Scenario US3-1)

### Implementation for User Story 3

- [X] T042 [P] [US3] Author `content/history.md`: narrative describing Hello World's origin (Brian Kernighan's 1972 example, its use in the K&R C book) and its spread as the traditional first program across languages
- [X] T043 [P] [US3] Implement `src/components/history/HistoryArticle.vue`: renders a `title` and a Markdown `body` (rendered via `markdown-it`) as HTML
- [X] T044 [US3] Implement `src/pages/HistoryPage.vue`: loads `content/history.md` (via a `?raw` import) and renders it through `HistoryArticle`, mounted at route `/history` (depends on T022, T042, T043)
- [X] T045 [P] [US3] Add a "History" link to `src/components/layout/NavMenu.vue` (T020) pointing to `/history` (done as part of T020)

**Checkpoint**: User Stories 1, 2, and 3 all work independently.

---

## Phase 6: User Story 4 - Contribute a new language via GitHub (Priority: P3)

**Goal**: A contributor can copy the published template, fill it in, and submit a new language through the GitHub repository (spec FR-008, FR-014, FR-016).

**Independent Test**: Copy the contribution template, fill in a new language's four sections, add the file, and confirm it appears on the site using the same collapsed/expandable pattern; confirm a missing section is caught rather than silently accepted.

### Tests for User Story 4 ⚠️

- [X] T046 [US4] Extend `tests/unit/parseLanguageFile.spec.js` (T024): assert `parseLanguageFile` throws a clear, section-naming error for a fixture missing the Calculation section, and for a fixture whose `calculation.result` is not `"4"` (spec Acceptance Scenario US4-3; `data-model.md` calculation constraint)
- [X] T047 [P] [US4] E2e test in `tests/e2e/contribute-language.spec.js`: add a fixture sixth language file, assert it appears on the home page collapsed to Hello World and expands the same way as the launch languages (spec Acceptance Scenario US4-2)

### Implementation for User Story 4

- [X] T048 [P] [US4] Publish `content/language-template.md` at the project root, adapted from `contracts/language-template.md`, as the literal file contributors copy per language
- [X] T049 [US4] Add `CONTRIBUTING.md` documenting the contribution steps: copy `content/language-template.md` → name the file after the language slug → fill all four sections, keeping the Calculation result equal to `4` → open a pull request (references spec FR-008/FR-014) (depends on T048). Note (2026-09-11): the template now has nine sections, not four — `CONTRIBUTING.md` needs a follow-up update; tracked for the next `/speckit-tasks` pass rather than edited ad hoc here.
- [X] T050 [US4] Implement `src/pages/LanguageDetailPage.vue` for route `/languages/:slug`, rendering the matching `LanguageCard` pre-expanded, giving any language (including a newly contributed one) a shareable deep link (depends on T022, T028, T039)

**Checkpoint**: All 4 user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Deployment automation and quality/performance checks spanning every user story.

- [X] T051 Configure `.github/workflows/deploy.yml`: on push to `main`, run `npm ci`, `npm run lint`, `npm run test:unit`, `npm run test:e2e`, `npm run build`, then deploy the resulting `dist/` folder via FTP (per `research.md` §9) using `FTP_SERVER`/`FTP_USERNAME`/`FTP_PASSWORD` GitHub Actions secrets, failing the job — and skipping the deploy step — if any prior step fails (Constitution Quality Gates)
- [X] T052 [P] Run a Lighthouse audit against `npm run preview`'s served build and confirm the `plan.md` performance budget: Performance ≥ 90 (mobile emulation), Time to Interactive < 2s, initial gzipped JS < 150KB; record the result in `specs/001-hello-world-multilang-site/quickstart.md`. Result: 95/100, TTI 1.6s, ~88KB gzipped JS — all pass.
- [X] T053 [P] Accessibility pass over `BaseButton`, `ExpandableSection`, and `NavMenu`: confirm keyboard operability and sufficient color contrast (Constitution Principle III). Contrast ratios computed for every text/background pair in use: all ≥ 4.83:1 (WCAG AA passes). Keyboard operability confirmed by code review — all interactive elements are native `<button>`/`<a>` with no keydown interception, so Enter/Space/Tab activation is guaranteed by the HTML spec. Fixed one real issue found in passing: `BaseIcon`'s decorative header icon had a redundant `aria-label` duplicating adjacent visible text — now `aria-hidden` when no label is given.
- [X] T054 Execute the full `specs/001-hello-world-multilang-site/quickstart.md` validation guide end-to-end and fix any discrepancies found. All steps pass: dev server browse/expand/collapse/history verified in-browser, missing-section error verified, `npm run lint` (0 errors), `npm run test:unit` (11/11), `npm run test:e2e` (4/4), `npm run build` (within budget). Deploy-pipeline step is structural-only (workflow reads secrets rather than hardcoding) since no real FTP credentials exist yet.
- [X] T055 [P] Write `README.md`: project purpose, local dev setup (`npm install`, `npm run dev`, `npm run test:unit`, `npm run test:e2e`, `npm run build`), and a link to `CONTRIBUTING.md`

---

## Phase 8: Amendment — Five More Fixed-Outcome Examples (spec FR-009–FR-013)

**Purpose**: Add Loop, Function, String Concatenation, List, and Boolean Comparison as required
sections of every `LanguageEntry`, each with a declared, build-validated outcome identical across
languages — generalizing the pattern the Calculation section already uses (see `research.md` §11,
`data-model.md`, `contracts/language-template.md`, `contracts/language-entry.schema.json`, all
already updated). This phase implements those already-amended design artifacts in code.

**Independent Test**: Expand any launch language and confirm all six declared outcomes appear and
match across every language: `4` (calculation), `1 2 3 4 5` (loop), `5` (function), `Olá, Mary`
(string concatenation), `6` (list), `true` (boolean) — and that the `string` variable now shows
`Mary`.

### Foundational (amendment) — blocks the story work below

- [X] T056 Update `src/content/parseLanguageFile.js`: extract the five new `##` sections (Loop, Function, String Concatenation, List, Boolean Comparison), each via the same `- result: <value>` + fenced-code-block pattern already used for Calculation. Add `loop`, `function`, `stringConcatenation`, `list`, `boolean` to the returned object as `{code, result}`. Validate each declared result against its fixed constant — per `data-model.md`: `loop` → `"1 2 3 4 5"`, `function` → `"5"`, `stringConcatenation` → `"Olá, Mary"`, `list` → `"6"`, `boolean` → `"true"` — throwing a clear, section-naming error on mismatch or missing section, exactly like the existing Calculation check (depends on T008/T031/T046, already done)
- [X] T057 [P] Extend `tests/unit/parseLanguageFile.spec.js`: update the fixture to include all five new sections; assert each field and declared result parses correctly; add a negative-path test asserting a clear error when one of the five declares a value other than its fixed constant (mirroring the existing Calculation negative-path test)
- [X] T058 [P] Implement `src/components/language/FixedOutcomeExample.vue`: a single reusable component rendering one `CodeBlock` plus a "Resultado exibido: `<result>`" note, taking `label`, `code`, and `result` props — replaces the ad hoc calculation-result markup inline in `LanguageCard.vue` and is reused for all six fixed-outcome examples (calculation, loop, function, string concatenation, list, boolean), per the componentization requirement (Constitution Principle I)

### Implementation for User Story 2 (Explore deeper examples)

- [X] T059 [P] [US2] Update `content/languages/java.md` per `contracts/language-template.md`: add Loop, Function, String Concatenation, List, and Boolean Comparison sections with their fixed `- result:` values in Java; change the `string` variable declaration to use `"Mary"` instead of its current value
- [X] T060 [P] [US2] Update `content/languages/python.md`: same five new sections and the `Mary` change, in Python
- [X] T061 [P] [US2] Update `content/languages/dart.md`: same five new sections and the `Mary` change, in Dart
- [X] T062 [P] [US2] Update `content/languages/abap.md`: same five new sections and the `Mary` change, in ABAP
- [X] T063 [P] [US2] Update `content/languages/php.md`: same five new sections and the `Mary` change, in PHP
- [X] T064 [US2] Update `src/components/language/LanguageCard.vue`: render `loop`, `function`, `stringConcatenation`, `list`, and `boolean` via `FixedOutcomeExample` (T058) inside the existing `ExpandableSection`, alongside the existing conditional/variables; replace the current inline calculation markup with `FixedOutcomeExample` too, for consistency (depends on T058, T056)
- [X] T065 [US2] Extend `tests/unit/LanguageCard.spec.js`: assert the five new examples' code and declared results are absent by default and visible once expanded (depends on T064)
- [X] T066 [US2] Extend `tests/e2e/browse-and-expand.spec.js`'s expand assertions to check all six declared outcomes (`4`, `1 2 3 4 5`, `5`, `Olá, Mary`, `6`, `true`) are visible for every launch language, and that the `string` variable shows `Mary` (depends on T064, T059–T063)

### Implementation for User Story 4 (Contribute a new language)

- [X] T067 [P] [US4] Update `content/language-template.md` at the project root to match the amended `contracts/language-template.md` (nine sections)
- [X] T068 [US4] Update `CONTRIBUTING.md` to list all nine sections and their fixed `- result:` values (depends on T067)
- [X] T069 [US4] Update the fixture in `tests/e2e/contribute-language.spec.js` to include all nine sections, so the "add a language" flow keeps passing against the updated parser (depends on T056)

### Polish

- [X] T070 Run `npm run lint`, `npm run test:unit`, `npm run test:e2e`, and `npm run build`; re-run the Lighthouse check from T052 if the bundle size grew meaningfully, and update `specs/001-hello-world-multilang-site/quickstart.md`'s recorded result if it changed. Result: 0 lint errors, 15/15 unit tests, 4/4 e2e tests, build succeeds; gzipped JS grew from ~88KB to ~88.9KB (negligible) — Lighthouse re-run skipped per the task's own condition. Also fixed a real bug found along the way: `npm run format` had reformatted `content/languages/*.md` frontmatter from double- to single-quoted `name:` values, and the frontmatter regex only stripped double quotes, so `name` became `"'Java'"` instead of `"Java"`. Fixed the regex to accept either quote style and excluded `content/` from Prettier's scope (content is data, not app code), with a regression test added.

**Checkpoint**: All 5 launch languages show all 9 sections; every declared outcome matches across
languages; the contribution template and docs are in sync with the new 9-section shape.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational completion
  - Can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P2 → P3)
  - US2, US3, and US4 each build on artifacts from US1 (`LanguageCard`, the router, the parser) but are independently testable once US1 exists
- **Polish (Phase 7)**: Depends on all four user stories being complete (the deploy workflow needs `lint`/`test:unit`/`test:e2e`/`build` to all be meaningful)
- **Amendment (Phase 8)**: Added after Phases 1–7 were already complete, to implement the spec/plan amendment (FR-009–FR-013). Its Foundational sub-phase (T056–T058) blocks its own US2/US4 work the same way Phase 2 blocks Phases 3–6; it does not reopen or block Phases 1–7

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational — no dependency on other stories
- **User Story 2 (P2)**: Starts after Foundational — extends US1's `LanguageCard` (T028/T039), so is built after US1 in practice even though its acceptance scenarios are independently testable once integrated
- **User Story 3 (P2)**: Starts after Foundational — uses the shared router/nav (Foundational) but no dependency on US1/US2 components
- **User Story 4 (P3)**: Starts after Foundational — reuses `LanguageCard`/router from US1/US2 for `LanguageDetailPage` (T050) and the parser from Foundational for its validation tests

### Within Each User Story

- Tests MUST be written and FAIL before the Implementation tasks in the same phase
- Components before the pages that assemble them
- Story complete and checkpoint validated before moving to the next priority

### Parallel Opportunities

- All Setup tasks marked `[P]` (T003–T006) can run in parallel once T001/T002 are done
- Within Foundational: the five language content files (T010–T014), the four base components (T015–T018), and the three layout components (T019–T021) are each independent-file groups that can run in parallel
- Within each user story, all `[P]` test tasks can run in parallel with each other, and independent-file implementation tasks marked `[P]` can run in parallel
- Different user stories can be worked on in parallel by different team members once Foundational is complete

---

## Parallel Example: User Story 1

```bash
# Tests for User Story 1 (run together):
Task: "Unit test in tests/unit/parseLanguageFile.spec.js"
Task: "Component test in tests/unit/LanguageCard.spec.js"
Task: "E2e test in tests/e2e/browse-and-expand.spec.js"

# Independent implementation tasks (run together):
Task: "Implement src/components/language/CodeBlock.vue"
Task: "Add build-time missing-section validation to src/content/parseLanguageFile.js"
Task: "Add build-time slug-uniqueness validation to src/composables/useLanguages.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run `tests/e2e/browse-and-expand.spec.js` and manually confirm the 5 languages list with Hello World only
5. Deploy/demo if ready (Phase 7's `deploy.yml` can be pulled forward once FTP credentials exist)

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate independently → MVP
3. Add User Story 2 → validate independently (expand/collapse across all 5 languages)
4. Add User Story 3 → validate independently (history page)
5. Add User Story 4 → validate independently (template + contribution flow)
6. Phase 7 → deploy automation, performance/accessibility checks, docs

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1, then User Story 2 (extends the same `LanguageCard`)
   - Developer B: User Story 3 (history page — no overlap with A)
   - Developer C: User Story 4 (template/CONTRIBUTING/detail page, once US1's `LanguageCard` exists)
3. Stories complete and integrate independently; Phase 7 lands last

---

## Notes

- `[P]` tasks touch different files with no unmet dependencies
- `[Story]` labels map every user-story-phase task back to `spec.md` for traceability
- Constitution Principle II (Testing Standards, NON-NEGOTIABLE) means every story phase's tests must exist and fail before its implementation tasks are started
- Commit after each task or logical group; stop at any checkpoint to validate a story independently
- Avoid: vague tasks, two tasks editing the same file marked `[P]`, cross-story dependencies that break independent testability
