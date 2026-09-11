# Phase 0 Research: Raw-Syntax Contribution Standard

No items in the Technical Context were marked `NEEDS CLARIFICATION`. The research below documents
the concrete findings and decisions needed to write the rule clearly and apply it correctly.

## 1. Enforcement: documentation + human review, not a new linter

**Decision**: The raw-syntax rule is enforced by (a) stating it explicitly and unambiguously in
`CONTRIBUTING.md` and `content/language-template.md`, and (b) the existing human PR-review
requirement (Constitution Principle I). No automated "convenience-function detector" is built.

**Rationale**: What counts as a disallowed convenience function is language- and operation-specific
(`array_sum()` in PHP, `sum()`/`reduce()`/`itertools` helpers in Python, `.reduce()`/`.fold()` in
Dart, and so on, with new languages potentially introducing new ones no static list could
anticipate). Building a genuinely reliable linter for this would mean maintaining an open-ended,
per-language blocklist — real, ongoing complexity for a rule this project already has a working
enforcement mechanism for (a human reviewing a small, template-shaped pull request). This matches
Constitution Principle IV's "do not add complexity for a performance [or correctness] gain that has
not been demonstrated to matter" — human review already caught this exact class of problem when it
was raised for this feature.

**Alternatives considered**:
- *A custom lint script scanning contributed code for a blocklist of known convenience functions
  per language*: rejected — open-ended maintenance burden (every new language needs its own
  blocklist entries) for a project whose actual contribution volume does not yet justify it; the
  existing template + PR review is a lower-complexity fit for the current scale.
- *A stricter contract schema (e.g., extending `contracts/language-entry.schema.json` from
  `001-hello-world-multilang-site`) that somehow validates "raw-ness"*: rejected — that schema
  validates structure and declared-outcome values (data it can see), not code semantics (whether a
  specific function call constitutes "the language doing the work" vs. "a library doing the work"),
  which isn't something a JSON Schema can express.

## 2. Empirical audit of the five reference languages

**Decision**: Reviewed all six fixed-outcome example types across all five reference languages by
reading `content/languages/{java,python,dart,abap,php}.md` directly. Findings:

| Language | Calculation | Loop | Function | String Concat | List | Boolean |
|----------|:-----------:|:----:|:--------:|:--------------:|:----:|:-------:|
| Java     | ✅ raw      | ✅ raw | ✅ (function is the point) | ✅ `+` operator | ✅ manual loop | ✅ `>=` operator |
| Python   | ✅ raw      | ✅ raw | ✅ | ✅ `+` operator | ❌ `sum(numbers)` | ✅ `>=` operator |
| Dart     | ✅ raw      | ✅ raw | ✅ | ✅ `+` operator | ❌ `numbers.reduce((a, b) => a + b)` | ✅ `>=` operator |
| ABAP     | ✅ raw      | ✅ raw | ✅ | ✅ `CONCATENATE` statement (ABAP's own native joining statement, not a library call — see §3) | ✅ manual `LOOP AT` | ✅ `>=` operator |
| PHP      | ✅ raw      | ✅ raw | ✅ | ✅ `.` operator | ❌ `array_sum($numbers)` | ✅ ternary (native operator, not a function) |

Only the **List** example is non-compliant, in exactly three languages: PHP (`array_sum()`),
Python (`sum()`), and Dart (`.reduce()`). Java and ABAP already sum via a manual loop and need no
change.

**Rationale**: Grounds FR-005/User Story 2 in a verified starting state rather than a guess, and
scopes the actual content-fix work precisely (three files, one section each) rather than requiring
a full re-audit at implementation time.

## 3. What counts as a language's own "native statement" vs. a convenience function

**Decision**: A language's own dedicated statement or operator for an operation (e.g., ABAP's
`CONCATENATE` keyword, PHP's `.` operator, a language's `+` for string joining) counts as raw syntax
even though, under the hood, it may be implemented via a runtime call — the test is whether the
*language's own basic grammar* expresses the operation directly, not whether a named,
separately-invokable function (callable by the contributor with different arguments, imported from
a standard library or built-ins namespace) performs it instead.

**Rationale**: Spec Edge Cases already anticipate this ("a dedicated string-joining statement
instead of a `+` operator"). Drawing the line at "grammar keyword/operator" vs. "named,
independently-callable function" is the same distinction PHP's own violation makes obvious:
`echo $a . $b` (operator, kept) vs. `array_sum($numbers)` (a named function replacing manual
iteration, not kept). This line is applied consistently in the table in §2 above (e.g., Boolean
Comparison's ternary operators are kept; List's named summing functions are not).

## 4. Translating README.md and CONTRIBUTING.md: rewrite, not add an i18n layer

**Decision**: `README.md` and `CONTRIBUTING.md` are rewritten directly in English, replacing their
current Portuguese text — not wrapped in any translation mechanism.

**Rationale**: These are static Markdown files read directly on GitHub (by people, and by GitHub's
own rendering), completely unrelated to the Vue application's `vue-i18n`-based runtime
internationalization from `003-i18n-language-detection` (which translates the deployed site's UI,
not the source repository's own documentation). There is exactly one required audience/language per
spec.md FR-007/FR-008 (English, for public GitHub presentation) — no runtime switching applies here,
so a straight rewrite is the entire solution.

**Alternatives considered**:
- *Keep both languages (e.g., `README.pt-BR.md` alongside an English `README.md`)*: not requested
  by spec.md (FR-007/FR-008 say these documents MUST be in English, not "available in English");
  adding a second maintained copy is scope the user did not ask for and that would need its own
  translation-currency upkeep going forward.

## Outcome

No new dependency, no application code change. The three-file content fix and the two-document
translation are both direct, well-scoped edits with an already-adequate testing/review safety net.
Proceeding to Phase 1 design.
