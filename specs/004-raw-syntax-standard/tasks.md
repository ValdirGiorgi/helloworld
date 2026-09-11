# Tasks: Raw-Syntax Contribution Standard

**Input**: Design documents from `/specs/004-raw-syntax-standard/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/documentation-contract.md](./contracts/documentation-contract.md), [quickstart.md](./quickstart.md)

**Tests**: No new automated tests are added — plan.md's Technical Context establishes that the
existing `parseLanguageFile.spec.js` (unit) and `browse-and-expand.spec.js` (e2e) already assert
the one thing that must not change here (the declared List outcome, "6"), and the raw-syntax rule
itself is enforced by documentation + human PR review (research.md §1), not a new automated check.
Verification tasks below re-run the *existing* suite rather than writing new tests.

**Organization**: Tasks are grouped by user story (as prioritized in spec.md) to enable independent
verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

Documentation and content files at the repository root and under `content/` (see plan.md Project
Structure) — no `src/`/`tests/` application code is touched by this feature.

---

## Phase 1: Setup

**Purpose**: Confirm the regression safety net this feature relies on is green before any edits.

- [X] T001 Run `npx vitest run tests/unit/parseLanguageFile.spec.js` and `npx playwright test tests/e2e/browse-and-expand.spec.js` and confirm both currently pass, recording this as the pre-change baseline (plan.md Technical Context) — no file changes

**Checkpoint**: Baseline confirmed green. No new dependencies are needed for this feature.

---

## Phase 2: Foundational

No cross-story blocking prerequisites exist for this feature — see the "Shared-file note" under
Dependencies below for the one real ordering consideration (`CONTRIBUTING.md` is touched by both
User Story 1 and User Story 3's own acceptance criteria, but is written once, not in two passes).

---

## Phase 3: User Story 1 - A contributor learns the raw-syntax rule before writing code (Priority: P1) 🎯 MVP

**Goal**: `CONTRIBUTING.md` (in English) and `content/language-template.md` explicitly state the
raw-syntax rule, its two exemptions, a worked contrast example, and the instruction to model
submissions on the five reference languages.

**Independent Test**: Hand `CONTRIBUTING.md` to someone unfamiliar with the project and have them
correctly classify a handful of example snippets as compliant or not, without asking follow-up
questions — independent of whether the reference languages (User Story 2) have been fixed yet or
`README.md` (User Story 3) has been translated.

### Implementation for User Story 1

- [X] T002 [US1] Rewrite `CONTRIBUTING.md` in English (translating its existing step-by-step content) and add: the raw-syntax rule statement (data-model.md `RawSyntaxRule.statement`); its two exemptions — the Function example and unavoidable output statements (`RawSyntaxRule.exemptions`); one worked contrast example for summing a list, showing PHP's corrected manual-loop form next to its old `array_sum($numbers)` form explicitly labeled compliant vs. non-compliant (`RawSyntaxRule.contrastExample`, research.md §2); and an instruction to model new submissions directly on the five reference languages (Java, Python, Dart, ABAP, PHP) without inventing a different or "more efficient" approach (`RawSyntaxRule.modelLanguages`) — per contracts/documentation-contract.md's `CONTRIBUTING.md` section — CONTRIBUTING.md
- [X] T003 [P] [US1] Add an instructional HTML comment to `content/language-template.md` stating the raw-syntax rule, placed near the existing top-of-file "How to add a new language" comment block so it is visible before any section-specific comment (spec.md FR-009; contracts/documentation-contract.md's `language-template.md` section) — leave every existing heading, `- result:` value, and placeholder text unchanged — content/language-template.md

**Checkpoint**: A new contributor reading `CONTRIBUTING.md` alone understands the rule, its
exemptions, and can check a submission against a worked example.

---

## Phase 4: User Story 2 - The five reference languages themselves comply with the standard (Priority: P1)

**Goal**: The three reference languages research.md §2 found non-compliant (PHP, Python, Dart) have
their List example rewritten to sum via a manual loop instead of a convenience function, with the
declared outcome unchanged; Java's and ABAP's already-compliant List examples are left untouched.

**Independent Test**: Review each of the five reference languages' List example code directly and
confirm none delegates the summation to a built-in/library function — independent of whether
`CONTRIBUTING.md` (User Story 1) or `README.md` (User Story 3) have been updated yet.

### Implementation for User Story 2

- [X] T004 [P] [US2] Rewrite the List section of `content/languages/php.md`: replace `array_sum($numbers)` with a manual loop that declares a running-total variable, iterates the fixed list `[1, 2, 3]`, and accumulates the sum before printing it — mirroring the shape already used by `content/languages/java.md`'s compliant List section; keep `- result: 6` and every other section of the file byte-for-byte unchanged (data-model.md `ReferenceLanguageExample`; contracts/documentation-contract.md) — content/languages/php.md
- [X] T005 [P] [US2] Rewrite the List section of `content/languages/python.md`: replace `sum(numbers)` with a manual loop that declares a running-total variable, iterates the fixed list `[1, 2, 3]`, and accumulates the sum before printing it; keep `- result: 6` and every other section of the file byte-for-byte unchanged — content/languages/python.md
- [X] T006 [P] [US2] Rewrite the List section of `content/languages/dart.md`: replace `numbers.reduce((a, b) => a + b)` with a manual loop that declares a running-total variable, iterates the fixed list `[1, 2, 3]`, and accumulates the sum before printing it; keep `- result: 6` and every other section of the file byte-for-byte unchanged — content/languages/dart.md
- [X] T007 [US2] Run `npx vitest run tests/unit/parseLanguageFile.spec.js` and `npx playwright test tests/e2e/browse-and-expand.spec.js` again and confirm both still pass with the declared List result unchanged at `6` for every one of the five languages (spec.md FR-006, SC-004) (depends on T004, T005, T006)

**Checkpoint**: All five reference languages' List examples verified to use raw, manual-loop
summation with zero change to the declared outcome.

---

## Phase 5: User Story 3 - Contribution documentation and public project docs read in English (Priority: P2)

**Goal**: `README.md` is fully in English; `CONTRIBUTING.md` (already rewritten in English as part of
User Story 1's own acceptance criteria) satisfies this story's requirement for that document too.

**Independent Test**: Read `README.md` and `CONTRIBUTING.md` end to end and confirm every sentence
in both is in English — independent of whether the reference-language content fixes (User Story 2)
have landed yet.

### Implementation for User Story 3

- [X] T008 [US3] Rewrite `README.md` in English, preserving its existing sections and meaning (project description, stack, local development, tests, production build, and the pointer to `CONTRIBUTING.md`) per contracts/documentation-contract.md's `README.md` section (spec.md FR-008) — README.md

**Note**: `CONTRIBUTING.md`'s English rewrite is delivered by T002 in User Story 1 — both stories
require it in English, and it is written once, not twice (research.md §4; see the shared-file note
under Dependencies below). No separate task is needed here for that document.

**Checkpoint**: Both GitHub-facing documents (`README.md`, `CONTRIBUTING.md`) read entirely in
English.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all three stories before calling the feature done.

- [X] T009 [P] Read through the final `CONTRIBUTING.md` and `README.md` end to end and confirm no non-English sentence remains in either (spec.md SC-003) (depends on T002, T008)
- [X] T010 Run `npm run lint`, `npx vitest run`, `npx playwright test`, and `npm run build`, and confirm everything passes with no bundle-size change (plan.md: no application code is touched) (depends on T002-T008)
- [X] T011 Start the local dev server, expand PHP's, Python's, and Dart's cards, and visually confirm each List example still displays `6` (quickstart.md) (depends on T004-T006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run immediately to confirm the baseline.
- **Foundational (Phase 2)**: None — see the shared-file note below instead of a blocking phase.
- **User Stories (Phase 3-5)**: All depend on Setup (T001) only. User Story 1, User Story 2, and
  User Story 3 touch entirely different files (`CONTRIBUTING.md`/`language-template.md` vs.
  `php.md`/`python.md`/`dart.md` vs. `README.md`) and can proceed in full parallel.
- **Polish (Phase 6)**: Depends on all three stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on User Story 2 or 3.
- **User Story 2 (P1)**: No dependency on User Story 1 or 3.
- **User Story 3 (P2)**: No dependency on User Story 2. Shares one file with User Story 1 — see
  below.

**Shared-file note**: `CONTRIBUTING.md` is required to be in English by both User Story 1 (as part
of adding the rule) and User Story 3 (as part of the general English requirement). T002 (User Story
1) delivers both requirements in a single rewrite rather than translating the file once and then
editing it again — do not schedule a separate "translate CONTRIBUTING.md" task under User Story 3.

### Within Each User Story

- T007 (re-run tests) MUST come after T004-T006 (the three rewrites it verifies).
- T009-T011 (Polish) MUST come after every task they check.

### Parallel Opportunities

- T002 and T003 (User Story 1) touch different files and can run in parallel.
- T004, T005, and T006 (User Story 2) each touch a different language file and can all run in
  parallel.
- T008 (User Story 3) can run in parallel with all of User Story 1 and User Story 2's tasks —
  different file, no dependency.
- T009 in Polish can run in parallel with T010/T011.

---

## Parallel Example: User Stories 1-3 together

```bash
# Once T001's baseline check passes, launch every story's independent work together:
Task: "Rewrite CONTRIBUTING.md in English with the raw-syntax rule (T002)"
Task: "Add the raw-syntax rule comment to content/language-template.md (T003)"
Task: "Rewrite php.md's List section to a manual loop (T004)"
Task: "Rewrite python.md's List section to a manual loop (T005)"
Task: "Rewrite dart.md's List section to a manual loop (T006)"
Task: "Rewrite README.md in English (T008)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (confirm the baseline).
2. Complete Phase 3: User Story 1 (document the rule).
3. **STOP and VALIDATE**: Hand `CONTRIBUTING.md` to someone unfamiliar with the project and confirm
   they can classify example snippets correctly (quickstart.md).
4. Deploy/demo if ready — the rule being clearly documented is itself valuable even before every
   existing language is fixed to match it.

### Incremental Delivery

1. Setup → baseline confirmed.
2. Add User Story 1 (the rule is documented) → validate independently → demo.
3. Add User Story 2 (the three non-compliant languages are fixed) → validate independently → demo.
4. Add User Story 3 (`README.md` in English) → validate independently → demo.
5. Polish (final English read-through, full test suite, visual spot-check).

### Parallel Team Strategy

With multiple contributors, after Setup:
- Contributor A: User Story 1 (`CONTRIBUTING.md`, `language-template.md`).
- Contributor B: User Story 2 (`php.md`, `python.md`, `dart.md`).
- Contributor C: User Story 3 (`README.md`).
- No coordination needed — all three touch entirely different files.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within their phase.
- [Story] label maps each task to its user story for traceability back to spec.md.
- No new dependency, application code change, or new automated test is introduced by this feature
  (plan.md Technical Context, research.md §1).
- `content/languages/java.md` and `content/languages/abap.md` are not touched — already compliant
  (research.md §2).
- Stop at any checkpoint to validate a story independently before moving on.
