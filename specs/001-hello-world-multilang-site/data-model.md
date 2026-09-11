# Data Model: Hello World Multi-Language Showcase Site

This is a static, database-free site (spec FR-010). "Data" here means the in-memory shape that
build-time content (Markdown files) is parsed into for Vue components to consume — not persisted
storage. See [contracts/language-entry.schema.json](contracts/language-entry.schema.json) for the
machine-readable form of the shapes below.

## LanguageEntry

Represents one programming language featured on the site (spec: Key Entities → Language Entry).
Produced by parsing exactly one file at `content/languages/<slug>.md` against
[contracts/language-template.md](contracts/language-template.md).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `slug` | string | yes | Derived from the filename (e.g. `java.md` → `"java"`); used in URLs (`/languages/:slug`) and as the uniqueness key |
| `name` | string | yes | Display name from frontmatter (e.g. `"Java"`) |
| `helloWorld` | CodeSample | yes | The default, always-visible example (spec FR-001) |
| `conditional` | CodeSample | yes | Shown only when the entry is expanded (spec FR-002); no declared/fixed outcome |
| `calculation` | CodeSample (fixed outcome `"4"`) | yes | `(1 + 1) * 2`; MUST be identical across all `LanguageEntry` records (spec FR-007, SC-003) |
| `loop` | CodeSample (fixed outcome `"1 2 3 4 5"`) | yes | Counts 1 to 5 (spec FR-009) |
| `function` | CodeSample (fixed outcome `"5"`) | yes | Adds the fixed arguments 2 and 3 (spec FR-010) |
| `stringConcatenation` | CodeSample (fixed outcome `"Olá, Mary"`) | yes | Joins a fixed greeting with the fixed name `"Mary"` (spec FR-011) |
| `list` | CodeSample (fixed outcome `"6"`) | yes | Sums the fixed list `[1, 2, 3]` (spec FR-012) |
| `boolean` | CodeSample (fixed outcome `"true"`) | yes | Evaluates the fixed comparison `18 >= 18` (spec FR-013) |
| `variables` | VariableSample[] | yes | Shown only when expanded; MUST include at least one entry each of kind `integer`, `string`, `float` (spec FR-002); the `string` entry MUST use the fixed name `"Mary"` (spec FR-011) |

**Validation rules**:
- `slug` MUST be unique across all `LanguageEntry` records (two files cannot resolve to the same
  slug) — enforced at build time; a collision fails the build (spec Edge Cases: duplicate
  submission).
- All nine sections (`helloWorld`, `conditional`, `calculation`, `loop`, `function`,
  `stringConcatenation`, `list`, `boolean`, `variables`) MUST be present and non-empty; a
  `LanguageEntry` missing a required section fails build-time validation rather than silently
  publishing an incomplete entry (spec Edge Cases: missing section).
- Every fixed-outcome sample's `result` (see CodeSample below) MUST match that example's single
  shared expected-outcome constant used across every language — `calculation` → `"4"`, `loop` →
  `"1 2 3 4 5"`, `function` → `"5"`, `stringConcatenation` → `"Olá, Mary"`, `list` → `"6"`,
  `boolean` → `"true"` (spec FR-007, FR-009–FR-013). This is a declared-value check, not code
  execution: the contributor states the outcome in a `- result:` label and the build validates
  that label, the same way it already does for `calculation`.

## CodeSample

An embedded value object, not a standalone entity — one labeled code snippet plus, for the six
fixed-outcome examples, its declared expected output.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `code` | string | yes | The raw source snippet as written in the language, preserved verbatim (whitespace/indentation intact) |
| `result` | string | only for the six fixed-outcome examples (`calculation`, `loop`, `function`, `stringConcatenation`, `list`, `boolean`) | The declared value the snippet is asserted to print/evaluate to; used to verify FR-007/FR-009–FR-013/SC-003/SC-007 across languages |

## VariableSample

An embedded value object listing one basic variable declaration.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `kind` | enum(`integer`, `string`, `float`) | yes | Which basic type this declaration demonstrates |
| `code` | string | yes | The declaration snippet in that language; for `kind: "string"`, MUST declare the fixed name `"Mary"` (spec FR-011), the same name used in the `stringConcatenation` example |

## HistoryContent

Represents the site's Hello World history/editorial content (spec: Key Entities → Hello World
History Content). Sourced from the single file `content/history.md` — not per-language, and not
repeated per `LanguageEntry`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Page/section title |
| `body` | string (rendered HTML from Markdown) | yes | The narrative content describing Hello World's origin and evolution |

## ContributionTemplate

Not a runtime data object — this is the authored file `content/language-template.md` itself,
which defines the required shape every `LanguageEntry` source file must follow (frontmatter key
`name`, plus the nine fixed `##` sections in order: Hello World, Conditional, Calculation, Loop,
Function, String Concatenation, List, Boolean Comparison, Variables). See
[contracts/language-template.md](contracts/language-template.md) for the exact, literal template
contributors copy.

## UI-only state (not persisted data)

The expand/collapse state of a `LanguageEntry` card (spec User Story 2) is transient, per-visit
component state (a boolean held in `useExpandable()`), reset on every page load. It is explicitly
**not** modeled as a data entity — there is nothing to persist, since the site has no database and
no user accounts (spec FR-010).
