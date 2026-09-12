# Tasks: About Page

**Input**: Design documents from `/specs/005-about-page/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/page-contract.md](./contracts/page-contract.md), [quickstart.md](./quickstart.md)

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

**Purpose**: Create the one shared piece of static reference data every story either uses directly
or (for User Story 3) uses exclusively.

- [X] T001 Create `src/siteLinks.js` exporting three named constants per data-model.md `SiteLink` and contracts/page-contract.md: `SPEC_KIT_REPO_URL = 'https://github.com/github/spec-kit'`, `PROJECT_REPO_URL = 'https://github.com/ValdirGiorgi/helloworld'`, `BLOG_ARTICLE_URL = 'https://blog.valdir.dev.br/speckit'` — src/siteLinks.js

**Checkpoint**: The shared URL constants exist and are ready to import.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the translated content keys User Story 1 and User Story 2 both need (User Story 3
does not depend on this phase — see Dependencies below).

**⚠️ CRITICAL**: User Story 1 and User Story 2 cannot begin until this phase is complete.

- [X] T002 [P] Add an `about` namespace with keys `title`, `intro`, `specKitLinkLabel`, `blogIntro`, `blogLinkLabel`, `repoIntro`, `repoLinkLabel`, `contribute` (data-model.md `AboutPageContent` table) plus `nav.about`, to `src/i18n/locales/en.js`, in English — src/i18n/locales/en.js
- [X] T003 [P] Add the same key tree to `src/i18n/locales/pt-BR.js`, in Portuguese (data-model.md `TranslatedMessage` same-key-set rule) — src/i18n/locales/pt-BR.js
- [X] T004 [P] Add the same key tree to `src/i18n/locales/es.js`, in Spanish — src/i18n/locales/es.js

**Checkpoint**: All `about.*`/`nav.about` keys exist, identically shaped, in all three locales —
User Story 1 and User Story 2 implementation can now begin.

---

## Phase 3: User Story 1 - A visitor learns the project's origin and purpose (Priority: P1) 🎯 MVP

**Goal**: An About page, reachable from the main navigation at `/:locale/about`, states the project
was created by Valdir Giorgi to test the Spec Kit tool, with working links to Spec Kit's own
repository and the author's blog article, displayed in whichever of the three languages is active.

**Independent Test**: Open the About page in each of the three languages and confirm it states who
created the project and why, with working links to Spec Kit's repository and the blog article —
independent of the contribute-specific content (User Story 2) or the footer link fix (User Story 3).

### Tests for User Story 1 ⚠️

- [X] T005 [P] [US1] Unit test: `AboutPage.vue` renders text mentioning the project was created by Valdir Giorgi to test Spec Kit, and includes a link whose `href` equals `SPEC_KIT_REPO_URL` and another whose `href` equals `BLOG_ARTICLE_URL`, both with `target="_blank"` and `rel="noopener noreferrer"` — tests/unit/AboutPage.spec.js

### Implementation for User Story 1

- [X] T006 [US1] Add the `/:locale(pt-BR|en|es)/about` route (`name: 'about'`) to `src/router/index.js`'s `routes` array, in the same shape as the existing `history` route, per contracts/page-contract.md — src/router/index.js
- [X] T007 [US1] Implement `src/pages/AboutPage.vue` per contracts/page-contract.md: reads `t` from `useLocale()` and the three constants from `src/siteLinks.js`; renders a heading (`t('about.title')`), the origin/purpose statement (`t('about.intro')`), the Spec Kit repository link (`t('about.specKitLinkLabel')` → `SPEC_KIT_REPO_URL`), and the blog intro + link (`t('about.blogIntro')`, `t('about.blogLinkLabel')` → `BLOG_ARTICLE_URL`) (depends on T001, T002-T004, T005 failing first) — src/pages/AboutPage.vue
- [X] T008 [US1] Add a third entry `{ name: 'about', label: t('nav.about') }` to `NavMenu.vue`'s existing `links` computed array, after the `history` entry, rendered by its existing `router-link` loop with no other markup change — src/components/layout/NavMenu.vue
- [X] T009 [P] [US1] e2e test: from any page, click "About" (in each of the three languages) and confirm the address becomes `/<locale>/about` and the page displays the origin/purpose statement plus working Spec Kit and blog links — tests/e2e/about-page.spec.js

**Checkpoint**: The About page is reachable, correctly translated, and links to Spec Kit's
repository and the author's blog article — independently functional.

---

## Phase 4: User Story 2 - A visitor finds how to contribute (Priority: P1)

**Goal**: The About page also links to this project's own repository and states that's where the
contribution guide is found.

**Independent Test**: Open the About page and confirm it includes a working link to this project's
own repository, with surrounding text making clear that's where to find contribution instructions —
independent of the page's origin-story content (User Story 1, though it shares the same file).

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] Unit test: `AboutPage.vue` includes a link whose `href` equals `PROJECT_REPO_URL`, and renders text stating that repository is where the contribution guide is found — tests/unit/AboutPage.spec.js

### Implementation for User Story 2

- [X] T011 [US2] Add the project-repository link (`t('about.repoIntro')`, `t('about.repoLinkLabel')` → `PROJECT_REPO_URL`) and the contribute note (`t('about.contribute')`) to `src/pages/AboutPage.vue`, using the same external-link convention as the other two links (depends on T007, T010 failing first) — src/pages/AboutPage.vue
- [X] T012 [P] [US2] e2e test: on the About page (any locale), confirm the project-repository link's `href` is exactly `https://github.com/ValdirGiorgi/helloworld` — tests/e2e/about-page.spec.js

**Checkpoint**: The About page fully satisfies User Story 1 and User Story 2 — origin story, Spec
Kit link, blog link, and the contribute/repository link all present and correctly translated.

---

## Phase 5: User Story 3 - Existing placeholder repository links are corrected (Priority: P1)

**Goal**: The footer's existing "contribute a new language" GitHub link points at the real project
repository instead of a placeholder address.

**Independent Test**: Click the footer's GitHub link on any page and confirm it opens the real
project repository — independent of whether the About page (User Story 1/2) exists, since this
story only needs `src/siteLinks.js` from Setup.

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Unit test: `AppFooter.vue`'s GitHub link `href` equals `PROJECT_REPO_URL` (imported from `src/siteLinks.js`), not the previous placeholder `https://github.com/` — tests/unit/AppFooter.spec.js

### Implementation for User Story 3

- [X] T014 [US3] Update `AppFooter.vue`: import `PROJECT_REPO_URL` from `src/siteLinks.js` and use it as the existing GitHub `<a>` element's `href`, replacing the literal `"https://github.com/"`; no other markup changes (depends on T001, T013 failing first) — src/components/layout/AppFooter.vue
- [X] T015 [P] [US3] e2e test: on any page (Home, History, a language detail page), confirm the footer's GitHub link `href` is `https://github.com/ValdirGiorgi/helloworld` — tests/e2e/about-page.spec.js

**Checkpoint**: All three user stories independently functional — the About page (origin story +
Spec Kit/blog/repo links) and the corrected footer link.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all three stories before calling the feature done.

- [X] T016 [P] Run `npm run lint` and fix any issues in the new/changed files
- [X] T017 Run `npx vitest run` (confirm the existing `tests/unit/locales.spec.js` dictionary-completeness check passes with the new `about.*`/`nav.about` keys, with no changes needed to that test file), `npx playwright test`, and `npm run build` (confirm no material gzipped-JS growth — plan.md Performance Goals: no new dependency)
- [X] T018 Walk through every "Validate" section of specs/005-about-page/quickstart.md manually in a real browser across all three locales

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS User Story 1 and User Story 2
  (both need the `about.*`/`nav.about` keys). Does **not** block User Story 3.
- **User Stories (Phase 3-5)**: User Story 1 and User Story 2 depend on Phase 2; User Story 3
  depends only on Phase 1 (T001) and can proceed the moment Setup is done, in parallel with
  Phase 2/User Story 1/User Story 2.
- **Polish (Phase 6)**: Depends on all three stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2). No dependency on User Story 2 or 3.
- **User Story 2 (P1)**: Depends on Foundational (Phase 2) **and** on User Story 1's T007 (both
  stories' content lives in the same `AboutPage.vue` file — User Story 2 adds to what User Story 1
  creates, rather than each writing an independent file). Still independently *testable* once
  User Story 1 has landed.
- **User Story 3 (P1)**: Depends only on Setup (T001). No dependency on User Story 1 or 2 — can be
  delivered entirely on its own.

**Shared-file note**: `src/pages/AboutPage.vue` is created by User Story 1 (T007) and extended by
User Story 2 (T011) — land T007 before T011. `AppFooter.vue` (User Story 3) is a separate file with
no overlap.

### Within Each User Story

- Tests MUST be written and FAIL before their corresponding implementation task (T005 before
  T007/T006; T010 before T011; T013 before T014).
- Within User Story 1: T006 (route) and T008 (nav entry) can happen in either order relative to
  T007 (the page itself), but T009 (e2e) needs all three landed first.

### Parallel Opportunities

- T002, T003, T004 (Foundational locale files) can all run in parallel.
- User Story 3 (T013-T015) can be worked entirely in parallel with Foundational/User Story 1/User
  Story 2, once T001 is done.
- T005 and T009 within User Story 1 touch different files and can be drafted in parallel with each
  other (though T005 must still fail before T007 is implemented).
- T010 and T012 within User Story 2 similarly.
- T016 in Polish can run in parallel with the rest of Phase 6's prep; T017/T018 are sequential
  (automated checks before manual walkthrough) and depend on every story being complete.

---

## Parallel Example: Foundational + User Story 3 together

```bash
# Once T001 (siteLinks.js) lands, launch these together:
Task: "Add about.*/nav.about keys to src/i18n/locales/en.js (T002)"
Task: "Add about.*/nav.about keys to src/i18n/locales/pt-BR.js (T003)"
Task: "Add about.*/nav.about keys to src/i18n/locales/es.js (T004)"
Task: "Unit test AppFooter.vue's corrected link (T013)"
Task: "Update AppFooter.vue to use PROJECT_REPO_URL (T014)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`siteLinks.js`).
2. Complete Phase 2: Foundational (translated keys).
3. Complete Phase 3: User Story 1 (the About page itself, reachable and translated).
4. **STOP and VALIDATE**: Run `tests/e2e/about-page.spec.js`'s User Story 1 tests and the
   corresponding quickstart.md section independently.
5. Deploy/demo if ready — the origin-story page alone already delivers most of what was asked for.

### Incremental Delivery

1. Setup + Foundational → translated content ready.
2. Add User Story 1 (the page exists, reachable, with Spec Kit/blog links) → validate → demo.
3. Add User Story 2 (the contribute/repository link) → validate → demo.
4. Add User Story 3 (footer link fixed) — can actually be done at any point after Setup, even
   before User Story 1/2, since it's fully independent.
5. Polish (lint, full test suite, bundle-size re-check, manual quickstart pass).

### Parallel Team Strategy

With multiple developers, after Setup:
- Developer A: Foundational (i18n keys) → User Story 1 → User Story 2 (same file, sequential).
- Developer B: User Story 3 (footer fix) — entirely independent, can finish first.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within their phase.
- [Story] label maps each task to its user story for traceability back to spec.md.
- No new dependency is introduced by this feature (plan.md Primary Dependencies).
- `useLocaleSeoTags.js` is not touched — its `hreflang`/canonical logic is already route-agnostic
  and will handle `/about` automatically (research.md §3).
- Verify each test fails before implementing its corresponding task.
- Stop at any checkpoint to validate a story independently before moving on.
