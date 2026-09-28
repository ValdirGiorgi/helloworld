# Implementation Plan: English-Only Code Examples

**Branch**: `008-english-only-examples` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-english-only-examples/spec.md`

## Summary

Make every code example on the site English-only: rewrite the Conditional, Function, String
Concatenation, and Boolean Comparison examples (and the declared String Concatenation outcome) in
all eight language files to the fixed English values (`"Greater than 5"`,
`"Less than or equal to 5"`, `add`, `"Hello, "` + `"Mary"`, `age`); move the outcome validated by
the content parser from `Olá, Mary` to `Hello, Mary`; update the tests and fixtures that quote the
old wording; sync the three interface-language labels that quote example code (es/pt-BR); document
the rule with the exact fixed values in `CONTRIBUTING.md`, `README.md`, and
`content/language-template.md`; and list TypeScript, Rust, and Go everywhere the five original
languages are enumerated (`README.md`, `public/llms.txt`, four test files). The one new automated
guard is a unit test that runs the real content files through the real parser and fails on
Portuguese wording, so the rule cannot silently regress. No new dependency, no application-logic
change beyond one constant.

## Technical Context

**Language/Version**: Markdown content (`content/languages/*.md`, template, docs); JavaScript (ES
modules) for the parser constant, i18n locale files, and tests. No Vue component changes.

**Primary Dependencies**: None new. Existing: Vue 3, Vite, Vitest 1.x, Playwright.

**Storage**: N/A — content is Markdown files read at build time.

**Testing**: Vitest for unit tests (`npx vitest run`), Playwright for e2e (`npx playwright test`).
Existing tests updated in place (research.md §4). One new unit test,
`tests/unit/languageContent.spec.js`, parses every real file under `content/languages/` plus the
template and asserts the English contract (research.md §5).

**Target Platform**: Unchanged — static site built by Vite and deployed by the existing GitHub
Actions workflow.

**Project Type**: Unchanged — single Vue SPA with Markdown content.

**Performance Goals**: N/A — no runtime code path changes; the parser still validates the same six
fixed outcomes.

**Constraints**:
- Declared outcomes `4`, `1 2 3 4 5`, `5`, `6`, `true` and the raw-syntax rule MUST be untouched
  (FR-006); only the String Concatenation outcome changes.
- Content files, parser constant, tests, and docs MUST land together — the parser rejects any
  file whose outcome differs from its constant (research.md §2).
- Interface text, translated history pages, and page structure are out of scope (FR-015).
- Code-example fixed values must be identical across all eight languages, modulo each language's
  own casing conventions (research.md §3).

**Scale/Scope**: 8 language files (`java`, `python`, `dart`, `abap`, `php`, `typescript`, `rust`,
`go`), 1 template, 2 docs (`CONTRIBUTING.md`, `README.md`) + `public/llms.txt`, 1 parser constant,
2 locale files (`es.js`, `pt-BR.js`, three labels each), 9 existing test files touched, 1 new test
file.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: The change is consistency work — one set of fixed values applied uniformly,
  which is exactly what "conventions beat local preference" asks for. Enforcement of the content
  rule becomes automated (new unit test) rather than review-only, which is stricter than the
  principle requires. The parser change is a one-constant edit; no dead code. Lint (`npm run
  lint`) and Prettier (`npm run format` check) remain in the gate list. PASS.
- **II. Testing Standards (NON-NEGOTIABLE)**: Existing tests that pin the old wording are updated
  in the same change, and a new unit test covers the happy path (all eight files parse and match
  the contract) and the critical edge case (a file that still declares `Olá, Mary` is rejected
  with a clear message). The full unit + e2e suites must be green. Coverage does not decrease.
  PASS.
- **III. User Experience Consistency**: The whole feature serves this principle — identical
  example wording across languages, and interface labels that quote exactly what the code beneath
  them shows. Interface language switching keeps working unchanged. Breaking change for
  contributors is called out with a rationale and a clear parser error message (spec Edge Cases).
  PASS.
- **IV. Performance Requirements**: N/A — no runtime, hot-path, or performance-sensitive code is
  touched; content size is unchanged to within a few bytes. No budget needed. PASS.

No violations — Complexity Tracking table is not needed.

**Post-design re-check (after Phase 1)**: The design adds one test file and touches no
architecture; the contracts in `contracts/` state every fixed value once and the documents
reference them, so no principle is newly strained. PASS.

## Project Structure

### Documentation (this feature)

```text
specs/008-english-only-examples/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   ├── example-content-contract.md   # fixed values + per-language before/after
│   └── documentation-contract.md     # what each of the three documents must state
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
content/
├── language-template.md          # UPDATED: outcome + English-only rule + fixed wording comments
└── languages/
    ├── java.md  python.md  dart.md  abap.md  php.md        # UPDATED: 4 examples + 1 outcome each
    └── typescript.md  rust.md  go.md                       # UPDATED: same

src/
├── content/parseLanguageFile.js  # UPDATED: expectedResult 'Olá, Mary' -> 'Hello, Mary'
└── i18n/locales/
    ├── es.js                     # UPDATED: 3 labels quote English example content
    └── pt-BR.js                  # UPDATED: 3 labels quote English example content
                                  # (en.js already correct — no change)

public/llms.txt                   # UPDATED: language list -> 8
README.md                         # UPDATED: language list -> 8, English-only rule
CONTRIBUTING.md                   # UPDATED: fixed values, outcome, new "English-only rule" section

tests/
├── unit/
│   ├── languageContent.spec.js   # NEW: real content files + template vs. English contract
│   ├── parseLanguageFile.spec.js # UPDATED: fixture wording + expected outcome
│   ├── LanguageCard.spec.js      # UPDATED: fixture wording
│   ├── LanguageList.spec.js      # UPDATED: fixture wording
│   └── generateSitemap.spec.js   # UPDATED: LANGUAGE_SLUGS -> 8
└── e2e/
    ├── browse-and-expand.spec.js    # UPDATED: launch list -> 8, declared outcome
    ├── contribute-language.spec.js  # UPDATED: fixture wording + declared outcome
    ├── search-language.spec.js      # UPDATED: slug list -> 8
    └── sidebar-navigation.spec.js   # UPDATED: name list -> 8 (exact link match for "Go")
```

**Structure Decision**: Keep the existing single-project layout. All changes are in-place edits to
content, one parser constant, two locale files, docs, and existing tests, plus one new unit test
alongside the other unit tests. No new directories outside `specs/`.

## Complexity Tracking

No constitution violations to justify.
