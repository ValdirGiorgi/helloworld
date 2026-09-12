# Tasks: PageSpeed Report Fixes

**Input**: Design documents from `/specs/006-pagespeed-report-fixes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/static-files-contract.md](./contracts/static-files-contract.md), [quickstart.md](./quickstart.md)

**Tests**: Included — Constitution Principle II (Testing Standards, NON-NEGOTIABLE) requires automated tests for every new behavior's happy path.

**Organization**: Tasks are grouped by user story (as prioritized in spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in every task description

## Path Conventions

Static files under `public/` and one e2e test file — see plan.md Project Structure. No `src/`
application code is touched.

---

## Phase 1: Setup

No setup tasks are needed — no new dependency, no project configuration change (plan.md Primary
Dependencies).

---

## Phase 2: Foundational

No cross-story blocking prerequisites exist — User Story 1 (`robots.txt`) and User Story 2
(`llms.txt`) are two entirely independent static files with no shared code. See the "Shared-file
note" under Dependencies below for the one thing they do share (a test file).

---

## Phase 3: User Story 1 - Search engines can read the site's crawling directives (Priority: P1) 🎯 MVP

**Goal**: Requesting `/robots.txt` returns a real, valid robots-directives file instead of the
site's own page content.

**Independent Test**: Request `/robots.txt` directly and confirm it returns valid robots-directive
content, not the SPA's HTML — independent of User Story 2's `llms.txt` work.

### Tests for User Story 1 ⚠️

- [X] T001 [P] [US1] e2e test: `context.request.get('/robots.txt')` returns HTTP 200, a body containing no HTML tag (`<html`/`<!doctype`), and lines `User-agent: *` and `Allow: /` (contracts/static-files-contract.md `public/robots.txt` contract) — tests/e2e/static-files.spec.js

### Implementation for User Story 1

- [X] T002 [US1] Create `public/robots.txt` containing exactly `User-agent: *` and `Allow: /` (data-model.md `RobotsFile`; research.md §3 — no `Sitemap:` directive) (depends on T001 failing first) — public/robots.txt

**Checkpoint**: `/robots.txt` is reachable and valid — independently functional.

---

## Phase 4: User Story 2 - AI agents can read a standard summary of the site (Priority: P1)

**Goal**: Requesting `/llms.txt` returns a real file with a top-level heading and links, instead of
the site's own page content.

**Independent Test**: Request `/llms.txt` directly and confirm it returns a file with a `#` heading
and at least one Markdown link — independent of User Story 1's `robots.txt` work.

### Tests for User Story 2 ⚠️

- [X] T003 [P] [US2] e2e test: `context.request.get('/llms.txt')` returns HTTP 200, a body containing no HTML tag, a line starting with `# `, at least one `[text](url)` Markdown link, and links whose URLs include `/en`, `/en/about`, and `/en/history` (contracts/static-files-contract.md `public/llms.txt` contract) — tests/e2e/static-files.spec.js

### Implementation for User Story 2

- [X] T004 [US2] Create `public/llms.txt` per data-model.md `LlmsFile`: an `# Hello World in Many Languages` heading, a one-sentence blockquote summary (reusing the About page's description), and Markdown links to the Home (`/en`), About (`/en/about`), and History (`/en/history`) pages plus the project's GitHub repository (the same literal URL as `PROJECT_REPO_URL` in `src/siteLinks.js` — research.md §2: cannot import it from a static file) (depends on T003 failing first) — public/llms.txt

**Checkpoint**: `/llms.txt` is reachable and structurally valid — independently functional. Both
user stories now complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification before calling the feature done.

- [X] T005 [P] Run `npm run lint` and fix any issues
- [X] T006 Run `npx vitest run`, `npx playwright test`, and `npm run build`; confirm `dist/robots.txt` and `dist/llms.txt` both exist after the build and no bundle-size change occurred (depends on T002, T004)
- [X] T007 Walk through specs/006-pagespeed-report-fixes/quickstart.md's local-validation sections manually
- [ ] T008 **PENDING external state** — once deployed, re-run PageSpeed Insights against the live site and confirm the SEO and agentic-browsing findings from spec.md's Findings section are gone and neither category's score regressed elsewhere (spec.md SC-001-SC-003); not blocking — every other task in this feature is verified locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup / Foundational**: None (both phases empty — see notes above).
- **User Stories (Phase 3-4)**: No dependency on each other; both can proceed immediately and in
  parallel.
- **Polish (Phase 5)**: Depends on both stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on User Story 2.
- **User Story 2 (P1)**: No dependency on User Story 1.

**Shared-file note**: T001 (US1) and T003 (US2) both add tests to the same
`tests/e2e/static-files.spec.js` file. Land one test block before the other (e.g., T001 then T003)
rather than editing concurrently — the two stories remain logically and functionally independent
even though this one file is shared.

### Within Each User Story

- T001 MUST be written and fail before T002 is implemented.
- T003 MUST be written and fail before T004 is implemented.

### Parallel Opportunities

- User Story 1 and User Story 2 can be implemented fully in parallel by different people (different
  target files, `public/robots.txt` vs. `public/llms.txt`), coordinating only on the shared test
  file's edits.
- T005 in Polish can run in parallel with the rest of Phase 5's prep; T006 and T007 are sequential
  (automated checks before manual walkthrough) and depend on both stories being complete.
- T008 is gated on external state (deployment) and does not block closing out the rest of the
  feature.

---

## Parallel Example: Both User Stories together

```bash
# Independent work, once the shared test file's structure is agreed:
Task: "Create public/robots.txt (T002)"
Task: "Create public/llms.txt (T004)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (`robots.txt`).
2. **STOP and VALIDATE**: Request `/robots.txt` directly and confirm it's valid.
3. Deploy/demo if ready — fixes the SEO score regardless of `llms.txt`'s status.

### Incremental Delivery

1. Add User Story 1 (`robots.txt`) → validate → demo.
2. Add User Story 2 (`llms.txt`) → validate → demo.
3. Polish (lint, full suite, build check, manual quickstart pass).
4. Once deployed, re-run PageSpeed Insights (T008) to close the loop.

### Parallel Team Strategy

With two people: one does User Story 1, the other User Story 2 — fully independent files, only
touching the same test file for their own new test block.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within their phase.
- [Story] label maps each task to its user story for traceability back to spec.md.
- No new dependency, no application code change (plan.md Primary Dependencies).
- Verify each test fails before implementing its corresponding task.
