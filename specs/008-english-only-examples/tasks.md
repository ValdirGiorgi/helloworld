# Tasks: English-Only Code Examples

**Input**: Design documents from `/specs/008-english-only-examples/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/example-content-contract.md](./contracts/example-content-contract.md), [contracts/documentation-contract.md](./contracts/documentation-contract.md), [quickstart.md](./quickstart.md)

**Tests**: Included. plan.md (Constitution Check, Principle II) requires the existing tests that pin
the old wording to be updated in the same change and one new unit test
(`tests/unit/languageContent.spec.js`) to guard the English contract on the real content files
(research.md §4–§5).

**Organization**: Tasks are grouped by user story (as prioritized in spec.md). Fixed values used
throughout: `Greater than 5`, `Less than or equal to 5`, `Hello, Mary`, `add`, `age` — the
per-language before → after table is in contracts/example-content-contract.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every task description

## Path Conventions

Single Vue SPA with Markdown content (see plan.md Project Structure): content in `content/`,
parser in `src/content/`, locale files in `src/i18n/locales/`, docs at the repository root,
tests in `tests/unit/` and `tests/e2e/`.

**Landing rule**: the parser constant (T002), the eight language files (T005–T012), and the
template (T023) must all be in place before the site loads again — the parser rejects any file
whose String Concatenation outcome differs from its constant. Work them in one branch and only
run the dev server / e2e after T012 and T023.

---

## Phase 1: Setup

**Purpose**: Record the green baseline this change is measured against.

- [X] T001 Run `npx vitest run` and `npm run lint` from the repository root and confirm both pass on the untouched tree (expected: 17 test files / 66 tests passing), recording this as the pre-change baseline — no file changes

**Checkpoint**: Baseline confirmed green. No new dependencies are needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Move the validated declared outcome; everything else depends on this contract.

- [X] T002 Change the String Concatenation entry in `FIXED_OUTCOME_SECTIONS` in `src/content/parseLanguageFile.js` from `expectedResult: 'Olá, Mary'` to `expectedResult: 'Hello, Mary'` (data-model.md "Declared Outcome constants"; the other five constants `4`, `1 2 3 4 5`, `5`, `6`, `true` MUST NOT change)
- [X] T003 Update `tests/unit/parseLanguageFile.spec.js`: in the fixture, change the String Concatenation section to `- result: Hello, Mary` with code `print("Hello, " + name)` (currently lines ~43–48), change the assertion at ~line 99 to `expect(entry.stringConcatenation.result).toBe('Hello, Mary')`, and add a test that a file still declaring `- result: Olá, Mary` throws an error whose message contains the filename, `String Concatenation`, and `Hello, Mary` (spec Story 2 scenario 2; research.md §2)

**Checkpoint**: Parser contract updated; the real language files now fail validation until Phase 3 is done.

---

## Phase 3: User Story 1 - Every language's examples read the same, in English (Priority: P1) 🎯 MVP

**Goal**: All eight `content/languages/*.md` files contain only English text and identifiers in the
Conditional, Function, String Concatenation, and Boolean Comparison examples, and declare
`- result: Hello, Mary`; every other section and outcome is unchanged.

**Independent Test**: `npx vitest run tests/unit/languageContent.spec.js` passes, and
`grep -rnE "Olá|Maior que|Menor ou igual|somar|idade" content/languages/` prints nothing —
independent of the docs, labels, or other test updates.

### Tests for User Story 1

> Write first; it MUST fail until T005–T012 are done.

- [X] T004 [US1] Create `tests/unit/languageContent.spec.js` (Vitest): read every `content/languages/*.md` with `node:fs`, assert the set of slugs includes `java`, `python`, `dart`, `abap`, `php`, `typescript`, `rust`, `go`; run each through `parseLanguageFile(raw, filename)` from `src/content/parseLanguageFile.js`; assert `stringConcatenation.result` is `Hello, Mary`; assert `conditional.code` contains `Greater than 5` and `Less than or equal to 5`; `function.code` contains `add`; `boolean.code` contains `age`; and that the raw file text contains none of the deny-listed tokens `Olá`, `Maior que`, `Menor ou igual`, `somar`, `idade` (data-model.md validation rules; contracts/example-content-contract.md "Machine checks"). Template assertions are added later in T024.

### Implementation for User Story 1

Each task edits ONE file, changing only the lines listed in the contract's before → after table
(FR-006: no other section changes; the raw-syntax rule still holds).

- [X] T005 [P] [US1] Edit `content/languages/java.md`: Conditional prints `"Greater than 5"` / `"Less than or equal to 5"`; Function `int add(int a, int b)` called as `add(2, 3)`; String Concatenation `"Hello, " + name` with `- result: Hello, Mary`; Boolean `int age = 18;` and `age >= 18`
- [X] T006 [P] [US1] Edit `content/languages/python.md`: Conditional `print("Greater than 5")` / `print("Less than or equal to 5")`; `def add(a, b)` and `print(add(2, 3))`; `print("Hello, " + name)` with `- result: Hello, Mary`; `age = 18` and `print(age >= 18)`
- [X] T007 [P] [US1] Edit `content/languages/dart.md`: Conditional `print('Greater than 5')` / `print('Less than or equal to 5')`; `int add(int a, int b)` and `print(add(2, 3))`; `print('Hello, ' + name)` with `- result: Hello, Mary`; `var age = 18;` and `print(age >= 18)`
- [X] T008 [P] [US1] Edit `content/languages/abap.md`: Conditional `WRITE: 'Greater than 5'.` / `WRITE: 'Less than or equal to 5'.`; `FORM add USING a TYPE i b TYPE i CHANGING result TYPE i.` and `PERFORM add USING 2 3 CHANGING result.`; `CONCATENATE 'Hello, ' name INTO greeting.` with `- result: Hello, Mary`; `DATA age TYPE i VALUE 18.` and `IF age >= 18.` (note: `FORM add` cannot be compiled here — research.md §3 ABAP caveat; leave a note for the reviewer in the final report, do not rename)
- [X] T009 [P] [US1] Edit `content/languages/php.md`: Conditional `echo "Greater than 5";` / `echo "Less than or equal to 5";`; `function add($a, $b)` and `echo add(2, 3);`; `echo "Hello, " . $name;` with `- result: Hello, Mary`; `$age = 18;` and `echo $age >= 18 ? 'true' : 'false';`
- [X] T010 [P] [US1] Edit `content/languages/typescript.md`: Conditional `console.log('Greater than 5')` / `console.log('Less than or equal to 5')`; `function add(a: number, b: number): number` and `console.log(add(2, 3))`; `console.log('Hello, ' + name)` with `- result: Hello, Mary`; `const age: number = 18;` and `console.log(age >= 18)`
- [X] T011 [P] [US1] Edit `content/languages/rust.md`: Conditional `println!("Greater than 5")` / `println!("Less than or equal to 5")`; `fn add(a: i32, b: i32) -> i32` and `println!("{}", add(2, 3))`; `println!("Hello, {}", name)` with `- result: Hello, Mary`; `let age = 18;` and `println!("{}", age >= 18)`
- [X] T012 [P] [US1] Edit `content/languages/go.md`: Conditional `fmt.Println("Greater than 5")` / `fmt.Println("Less than or equal to 5")` (keep the file's existing tab indentation); `func add(a int, b int) int` and `fmt.Println(add(2, 3))`; `fmt.Println("Hello, " + name)` with `- result: Hello, Mary`; `age := 18` and `fmt.Println(age >= 18)`
- [X] T013 [US1] Run `npx vitest run tests/unit/languageContent.spec.js tests/unit/parseLanguageFile.spec.js` and `npx prettier --check content/languages/` — both MUST pass; then run the grep from this phase's Independent Test and confirm empty output

**Checkpoint**: User Story 1 complete — every language reads the same, in English, and the parser and the new guard agree.

---

## Phase 4: User Story 2 - The site and its checks accept the new English contract (Priority: P1)

**Goal**: The site keeps loading and displaying every language; interface labels quote the English
code; no test fixture or expectation contains the old Portuguese wording.

**Independent Test**: `npx vitest run` and `npx playwright test tests/e2e/browse-and-expand.spec.js tests/e2e/contribute-language.spec.js` pass, and `/es` and `/pt-BR` labels above Function, String Concatenation, and Boolean quote `add(2, 3)`, `"Hello, " + name`, `age >= 18`.

### Tests for User Story 2

- [X] T014 [P] [US2] Add a test to `tests/unit/locales.spec.js` asserting that for each of `en`, `es`, and `pt-BR` the `languageCard.function`, `languageCard.stringConcatenation`, and `languageCard.boolean` labels contain `add(2, 3)`, `"Hello, " + name`, and `age >= 18` respectively (spec FR-009, SC-006); the existing key-alignment tests must keep passing (no key added or removed)

### Implementation for User Story 2

- [X] T015 [P] [US2] Edit `src/i18n/locales/es.js` `languageCard`: `function: 'Función: add(2, 3)'`, `stringConcatenation: 'Concatenación: "Hello, " + name'`, `boolean: 'Booleano: age >= 18'` (data-model.md "Interface Label"; leave every other key unchanged)
- [X] T016 [P] [US2] Edit `src/i18n/locales/pt-BR.js` `languageCard`: `function: 'Função: add(2, 3)'`, `stringConcatenation: 'Concatenação: "Hello, " + name'`, `boolean: 'Booleano: age >= 18'` (leave every other key unchanged; `src/i18n/locales/en.js` is already correct — do not touch)
- [X] T017 [P] [US2] Edit `tests/unit/LanguageCard.spec.js`: change the fixture `stringConcatenation` to `{ code: '"Hello, " + name', result: 'Hello, Mary' }` (line ~15) and the `['4', '1 2 3 4 5', '5', 'Olá, Mary', '6', 'true']` list (line ~56) to use `'Hello, Mary'`
- [X] T018 [P] [US2] Edit `tests/unit/LanguageList.spec.js`: change the fixture `stringConcatenation` (line ~22) to `{ code: '"Hello, " + name', result: 'Hello, Mary' }`
- [X] T019 [P] [US2] Edit `tests/e2e/contribute-language.spec.js`: in the inline fixture, change `somar(2, 3)` to `add(2, 3)`, the String Concatenation block to `"Hello, " + name` with `- result: Hello, Mary` (lines ~40–52), and the declared-results list at line ~106 to use `'Hello, Mary'`
- [X] T020 [US2] Edit `tests/e2e/browse-and-expand.spec.js`: change `'Olá, Mary'` to `'Hello, Mary'` in the declared-results list (line ~36); the language list in this file is updated later in T032 (same file — do not run in parallel with T032)
- [X] T021 [US2] Run `npx vitest run` (all unit tests) and `npx playwright test tests/e2e/browse-and-expand.spec.js tests/e2e/contribute-language.spec.js`, then start the dev server (`preview_start`) and confirm at `/en`, `/es`, `/pt-BR` that expanding a language shows `Hello, Mary` and that the three labels quote the English code (quickstart.md §2) — requires T005–T012 done

**Checkpoint**: User Stories 1 and 2 complete — the site builds and displays the English contract in all three interface languages.

---

## Phase 5: User Story 3 - Contributors are told the English-only rule where they read and edit (Priority: P2)

**Goal**: `CONTRIBUTING.md`, `content/language-template.md`, and `README.md` state the same rule and the same fixed values.

**Independent Test**: Someone unfamiliar with the project reads only `CONTRIBUTING.md` and the template and writes the Conditional, String Concatenation, Function, and Boolean examples for a new language with the exact expected wording and names (SC-003); a literal comparison against contracts/example-content-contract.md finds no conflicting value (SC-005).

### Implementation for User Story 3

- [X] T022 [P] [US3] Edit `CONTRIBUTING.md` per contracts/documentation-contract.md §1: in "Step by step" item 3 change the String Concatenation bullet to `Keep - result: Hello, Mary`, the Boolean Comparison bullet to `age >= 18` (with `age = 18`), and name the fixed wording in the Conditional bullet (`Greater than 5` / `Less than or equal to 5`) and the function name `add` in the Function bullet; add a new section **"The English-only rule"** immediately after "The raw-syntax rule" that states the rule (all text inside examples — string literals, printed messages, identifier names, declared outcomes — is English; interface language is unrelated), includes the fixed-values table from the example contract, states that only language-forced variation is allowed (casing, quoting, how a boolean prints), and says a file still declaring the old outcome fails the build and the unit test with a message naming `Hello, Mary`; leave the "five existing reference languages" sentence unchanged (research.md §7)
- [X] T023 [P] [US3] Edit `content/language-template.md` per contracts/documentation-contract.md §2: change the String Concatenation placeholder to `- result: Hello, Mary`; add an "ENGLISH-ONLY RULE" paragraph to the top contributor-contract comment (all text inside examples MUST be English; see CONTRIBUTING.md "The English-only rule"; list the fixed values); add the fixed wording/name to the section comments of Conditional (`Greater than 5` / `Less than or equal to 5`), Function (`add`), String Concatenation (`Hello, ` + `Mary`), and Boolean Comparison (`age`); do not rename, remove, or reorder any heading
- [X] T024 [US3] Extend `tests/unit/languageContent.spec.js` (created in T004) with template checks: read `content/language-template.md`, assert it contains `- result: Hello, Mary` and none of the deny-listed tokens `Olá`, `Maior que`, `Menor ou igual`, `somar`, `idade`
- [X] T025 [US3] Edit `README.md` per contracts/documentation-contract.md §3: in "Adding a language" add one sentence that examples are written entirely in English (messages, strings, identifiers) with a link to CONTRIBUTING.md's "The English-only rule" section; do not add individual fixed values here (research.md §6). The language list in this file is updated later in T027 (same file — do not run in parallel)
- [X] T026 [US3] Run `npx vitest run tests/unit/languageContent.spec.js` and `npx prettier --check CONTRIBUTING.md README.md content/language-template.md`, then compare the fixed values in `CONTRIBUTING.md` and the template literally against contracts/example-content-contract.md (`Greater than 5`, `Less than or equal to 5`, `Hello, Mary`, `add`, `age`) and confirm they agree (FR-014, SC-005)

**Checkpoint**: The rule is documented consistently in all three places.

---

## Phase 6: User Story 4 - Supported-language mentions include TypeScript, Rust, and Go (Priority: P3)

**Goal**: Every list of supported languages names all eight.

**Independent Test**: `grep -rnE "Java, Python, Dart, ABAP,? (and )?PHP" README.md public/llms.txt tests` shows no list that stops at PHP, and the four enumerating tests cover eight languages and pass.

### Implementation for User Story 4

- [X] T027 [US4] Edit `README.md` opening description: change "(currently: Java, Python, Dart, ABAP, and PHP)" to list all eight — Java, Python, Dart, ABAP, PHP, TypeScript, Rust, and Go (after T025, same file)
- [X] T028 [P] [US4] Edit `public/llms.txt`: in the Home entry replace "across Java, Python, Dart, ABAP, and PHP" with a list of all eight languages; change nothing else (`tests/e2e/static-files.spec.js` assertions stay valid)
- [X] T029 [P] [US4] Edit `tests/unit/generateSitemap.spec.js`: extend `LANGUAGE_SLUGS` (line ~16) to `['java', 'python', 'dart', 'abap', 'php', 'typescript', 'rust', 'go']`; adjust any hard-coded count in the file if one exists
- [X] T030 [P] [US4] Edit `tests/e2e/search-language.spec.js`: extend the slug list (line ~29) to all eight slugs
- [X] T031 [P] [US4] Edit `tests/e2e/sidebar-navigation.spec.js`: extend the name list (line ~16) to all eight names (`TypeScript`, `Rust`, `Go` added) and pass `{ name, exact: true }` to `getByRole('link', …)` so `Go` cannot match by substring (research.md §4)
- [X] T032 [US4] Edit `tests/e2e/browse-and-expand.spec.js`: extend `LAUNCH_LANGUAGES` (line 8) to `['Java', 'Python', 'Dart', 'ABAP', 'PHP', 'TypeScript', 'Rust', 'Go']` and change the test title "lists all 5 launch languages…" to say 8 (after T020, same file)
- [X] T033 [US4] Run `npx vitest run tests/unit/generateSitemap.spec.js` and `npx playwright test tests/e2e/browse-and-expand.spec.js tests/e2e/search-language.spec.js tests/e2e/sidebar-navigation.spec.js tests/e2e/static-files.spec.js`, and run the grep from this phase's Independent Test — all must pass / show no five-language lists

**Checkpoint**: All four stories complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Whole-repo verification per quickstart.md and the constitution's quality gates.

- [X] T034 Run `npm run lint` and `npx prettier --check .` and fix any finding in the files touched by this feature (Constitution Principle I; keep the Go file's tabs)
- [X] T035 Run the full suites: `npx vitest run` then `npx playwright test` — all MUST pass, and test-file count/coverage must not drop below the T001 baseline (Constitution Principle II)
- [X] T036 Run `npm run build` and confirm it succeeds and `public/sitemap.xml` contains 24 language-detail URLs (`grep -c "<loc>.*/languages/" public/sitemap.xml` → `24`)
- [X] T037 Run the repository-wide leftover search `grep -rnE "Olá|Maior que|Menor ou igual|somar|idade|sumar|edad|Hola," --exclude-dir=node_modules --exclude-dir=specs --exclude-dir=.git --exclude-dir=dist --exclude-dir=.specify .` and confirm the only remaining matches are legitimate interface translations (for example the words `Concatenación`/`Función` are fine; example wording is not) — fix anything else (SC-001, SC-006)
- [X] T038 Walk through quickstart.md end to end (§1–§4), including the negative check in §2 (temporarily revert one file's outcome to `Olá, Mary`, confirm the unit test names that file and `Hello, Mary`, then restore it), and note in the final report that the ABAP `FORM add` remains unverified by a compiler

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none — start immediately.
- **Foundational (Phase 2)**: after Phase 1. Blocks the site loading until Phase 3 is complete (see Landing rule).
- **User Story 1 (Phase 3)**: after Phase 2. T004 first (must fail), then T005–T012 in parallel, then T013.
- **User Story 2 (Phase 4)**: after Phase 2; T014–T020 do not depend on Phase 3's files but T021 (running the site) needs T005–T012 and T023.
- **User Story 3 (Phase 5)**: after Phase 2; T024 needs T004 (extends that file); T026 needs T022–T025.
- **User Story 4 (Phase 6)**: after Phase 2; T027 after T025; T032 after T020; T033 after T005–T012 and T027–T032.
- **Polish (Phase 7)**: after all stories.

### Shared-file ordering

- `tests/unit/languageContent.spec.js`: T004 → T024
- `README.md`: T025 → T027
- `tests/e2e/browse-and-expand.spec.js`: T020 → T032

### Within Each Story

- Write the test first and see it fail (T004) before the content edits it guards.
- One task per file; the eight language files are fully independent of each other.

### Parallel Opportunities

- US1: T005–T012 (eight different files) all together.
- US2: T014–T019 (six different files) all together.
- US3: T022 and T023 together.
- US4: T028–T031 together.
- Different stories can be worked in parallel by different people once Phase 2 is done, subject to the shared-file ordering above.

### Parallel Example: User Story 1

```text
Task: "T005 Edit content/languages/java.md"
Task: "T006 Edit content/languages/python.md"
Task: "T007 Edit content/languages/dart.md"
Task: "T008 Edit content/languages/abap.md"
Task: "T009 Edit content/languages/php.md"
Task: "T010 Edit content/languages/typescript.md"
Task: "T011 Edit content/languages/rust.md"
Task: "T012 Edit content/languages/go.md"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2, both P1)

1. Phase 1 → Phase 2 (T001–T003).
2. Phase 3: T004, then T005–T012, then T013 — the examples are English and guarded.
3. Phase 4: T014–T021 — the site and its tests agree, labels are in sync. **STOP and VALIDATE**:
   the site works end to end with English examples. US1 alone leaves the site unusable until US2's
   test/label updates land, so treat US1 + US2 as the deliverable MVP.

### Incremental Delivery

1. MVP (US1 + US2) → visible fix for the user.
2. US3 → contributors are told the rule (prevents regression).
3. US4 → remaining enumerations updated.
4. Phase 7 → full verification.

All of it is one coordinated change (spec Assumptions): the phases order the work; they are not
separate releases.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- Commits are made by the user, not by the agent (repository owner's rule) — suggest commands at the end instead of running them.
- Never translate `Mary` or change any declared outcome other than String Concatenation.
- Verify the language-file edits change only the lines listed in the contract (`git diff` per file).
