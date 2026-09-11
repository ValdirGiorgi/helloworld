# Implementation Plan: Raw-Syntax Contribution Standard

**Branch**: `004-raw-syntax-standard` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-raw-syntax-standard/spec.md`

## Summary

Document, in English, an explicit "raw syntax" rule for contributed language examples (use the
language's own basic control-flow/operators for the capability an example demonstrates, never a
convenience function that performs it internally), with a worked contrast example; apply that rule
retroactively by rewriting the three reference-language examples already found violating it
(PHP's `array_sum()`, Python's `sum()`, Dart's `.reduce()` in the List example); and translate the
two GitHub-facing documents (`README.md`, `CONTRIBUTING.md`) to English. This is a documentation and
content-correctness change — no application code, dependency, or architecture changes.

## Technical Context

**Language/Version**: Markdown documentation; PHP, Python, and Dart code snippets inside
`content/languages/*.md` (the three found violating the rule) — no change to the Vue application
itself.

**Primary Dependencies**: None new. No application code is touched.

**Storage**: N/A.

**Testing**: The existing automated checks already guard the one thing that must not change here —
the declared outcome value: `tests/unit/parseLanguageFile.spec.js` validates every language file's
`- result:` lines against the fixed expected values, and `tests/e2e/browse-and-expand.spec.js`
asserts the List example still displays `6` for every launch language. Since this feature only
changes the *code above* an already-correct `- result: 6` line (research.md §1), these existing
tests are sufficient regression coverage — no new automated test is added. Compliance with the raw-
syntax rule itself is enforced by documentation + human PR review (research.md §1), consistent with
Constitution Principle I's existing review requirement, not by a new linter.

**Target Platform**: Unchanged — static site, same hosting.

**Project Type**: Unchanged — single Vue SPA with Markdown content; this feature only touches
`content/languages/*.md`, `content/language-template.md`, `CONTRIBUTING.md`, and `README.md`.

**Performance Goals**: N/A — no runtime code changes.

**Constraints**: The rewritten List examples MUST keep declaring `- result: 6` (FR-006); no other
section of the three corrected files may change.

**Scale/Scope**: 2 documents translated to English (`README.md`, `CONTRIBUTING.md`), 1 template
updated with the rule (`content/language-template.md`), 3 language files corrected (`php.md`,
`python.md`, `dart.md`). Java's and ABAP's List examples already comply (research.md §2) and are
left untouched.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: The rule itself exists specifically to keep contributed examples honest and
  consistent (no hidden convenience function skewing a comparison) — a direct application of this
  principle to content, not just application code. Enforcement is via documentation + the existing
  human PR review requirement, not a new automated gate, which matches the principle's own
  "when working solo, review the diff against a checklist" allowance rather than inventing new
  tooling for a one-time content fix. PASS.
- **II. Testing Standards (NON-NEGOTIABLE)**: The one behavior that must not regress — the declared
  outcome value — is already covered by existing unit and e2e tests (Technical Context/Testing
  above); re-running them after the rewrite is this feature's regression check. PASS.
- **III. User Experience Consistency**: Standardizing on English for GitHub-facing docs and on raw
  syntax for every language's examples both directly serve consistency — the exact concern this
  principle exists for. PASS.
- **IV. Performance Requirements**: N/A — no runtime/performance-sensitive code is touched. PASS
  (no budget needed).

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-raw-syntax-standard/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
CONTRIBUTING.md                    # CHANGED: rewritten in English; states the raw-syntax rule;
                                    #          includes a worked raw-vs-convenience-function
                                    #          contrast example (List/sum); tells contributors to
                                    #          model submissions on the five reference languages
README.md                          # CHANGED: rewritten in English (content/meaning unchanged)
content/
├── language-template.md           # CHANGED: adds an instructional comment stating the raw-syntax
│                                   #          rule at the point where a contributor writes code
│                                   #          (template is already in English — no translation
│                                   #          needed, only the new rule text)
└── languages/
    ├── php.md                     # CHANGED: List section rewritten to sum via a manual loop
    │                               #          instead of array_sum(); `- result: 6` unchanged
    ├── python.md                  # CHANGED: List section rewritten to sum via a manual loop
    │                               #          instead of sum(); `- result: 6` unchanged
    ├── dart.md                    # CHANGED: List section rewritten to sum via a manual loop
    │                               #          instead of .reduce(); `- result: 6` unchanged
    ├── java.md                    # UNCHANGED: already uses a manual loop (research.md §2)
    └── abap.md                    # UNCHANGED: already uses a manual loop (research.md §2)

tests/                              # UNCHANGED: existing parseLanguageFile.spec.js and
                                    #            browse-and-expand.spec.js already cover this
                                    #            feature's one regression risk (Technical Context)
```

**Structure Decision**: No new files or directories beyond this feature's own `specs/` folder —
this is a targeted edit to two root-level docs, one content template, and three existing language
content files, all within the project's existing structure.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
