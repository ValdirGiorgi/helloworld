# Data Model: Raw-Syntax Contribution Standard

This feature introduces no application data, storage, or runtime state — it is a documentation and
content-correctness change. The "entities" below are conceptual, existing only as documented rules
and as the content files they govern.

## RawSyntaxRule (documented rule, not stored data)

The standard itself, as it must appear in `CONTRIBUTING.md` and `content/language-template.md`.

| Field | Type | Notes |
|-------|------|-------|
| `appliesTo` | list of example-type names | The example types the rule governs: Calculation, Loop, String Concatenation, List, Boolean Comparison (Hello World's output statement and Function's own function-call are exempt — see `exemptions` below). |
| `statement` | text | "Use the language's own basic control-flow/operators for the capability being demonstrated; never a convenience function or library call that performs it for you" (spec.md FR-001). |
| `exemptions` | list | (1) The Function example itself (defining/calling a function is its point). (2) Whatever minimal output statement (e.g., `print`) is unavoidable to show a result. |
| `contrastExample` | worked example | At least one side-by-side "compliant vs. non-compliant" snippet for a commonly-tempting shortcut — List/summing, using one of the three languages found non-compliant in research.md §2 (FR-003). |
| `modelLanguages` | list | The five reference languages (Java, Python, Dart, ABAP, PHP) — contributors are told to model submissions on these, not invent a different approach (FR-004). |

**Validation rules**:
- `statement` and at least one `contrastExample` MUST be present in `CONTRIBUTING.md`'s rendered
  text (not only in a code comment) — human contributors read the rendered page, not the template's
  source comments (spec.md User Story 1, Acceptance Scenario 1-2).
- `contrastExample` and `exemptions` MUST both be explicit enough that a reader can classify a
  snippet correctly without asking anyone (spec.md SC-002).

## ReferenceLanguageExample (existing content, three files changed)

The specific example sections found violating `RawSyntaxRule` in research.md §2, and how each is
corrected.

| File | Section | Before (non-compliant) | After (raw) | Declared outcome |
|------|---------|--------------------------|--------------|-------------------|
| `content/languages/php.md` | List | `array_sum($numbers)` | manual loop accumulating a running total | `- result: 6` (unchanged) |
| `content/languages/python.md` | List | `sum(numbers)` | manual loop accumulating a running total | `- result: 6` (unchanged) |
| `content/languages/dart.md` | List | `numbers.reduce((a, b) => a + b)` | manual loop accumulating a running total | `- result: 6` (unchanged) |

**Validation rules**:
- The `- result: 6` line MUST remain byte-for-byte identical after the rewrite (spec.md FR-006) —
  enforced today by `tests/unit/parseLanguageFile.spec.js` and
  `tests/e2e/browse-and-expand.spec.js`, which already assert this value; no new test is added
  (plan.md Technical Context/Testing).
- No other section of these three files changes (data-model scope is exactly the List section in
  each).
- `content/languages/java.md` and `content/languages/abap.md` are out of scope for this table —
  already compliant (research.md §2).

## PublicDocument (existing files, translated)

| File | Current language | Target language | Content change |
|------|-------------------|-------------------|------------------|
| `README.md` | Portuguese | English | Meaning/structure unchanged — direct translation. |
| `CONTRIBUTING.md` | Portuguese | English | Translation, plus the new `RawSyntaxRule` content (statement, exemptions, contrast example, model-languages instruction) added to the existing step-by-step structure. |

**Validation rules**:
- 100% of the rendered text in both files MUST be in English (spec.md FR-007/FR-008, SC-003) — no
  mixed-language sentences.
- `content/language-template.md` is not a `PublicDocument` for translation purposes — it is already
  in English (research.md context) and only gains the new rule text as an instructional comment
  (FR-009), not a translation.
