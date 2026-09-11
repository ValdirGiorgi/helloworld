# Data Model: Responsive Layout with Sidebar Navigation and Language Search

This feature introduces no new persisted or build-time-parsed data. It operates entirely on the
existing `LanguageEntry` array already produced by `useLanguages.js` (see
`specs/001-hello-world-multilang-site/data-model.md` for that shape, which is unchanged here). The
only "entities" below are transient, in-memory UI state — documented for clarity, not because they
require a schema or contract file.

## SearchQuery (UI state, not persisted)

Represents the visitor's current search input.

| Field   | Type   | Notes                                                                 |
|---------|--------|------------------------------------------------------------------------|
| `text`  | string | Raw value of the search `<input>`. Empty string means "no filter applied" (all languages shown). |

**Derived value — FilteredLanguages**: `languages.filter(entry => matches(entry.name, text))`,
computed reactively from the existing `languages` array (`useLanguages.js`) and `SearchQuery.text`.
Never mutates or re-orders the base `languages` array — filtering only changes which entries render.

**Validation rules**:
- Matching MUST be case-insensitive (FR-003).
- Matching MUST be substring-based, not exact-match-only (FR-003).
- An empty/whitespace-only query MUST behave as "no filter" (all languages shown), not "no matches."
- When the filtered result is empty, the UI MUST render a "no results" state (FR-004) rather than
  an empty list with no explanation.

## SidebarState (UI state, not persisted)

Represents whether the mobile off-canvas sidebar is open.

| Field    | Type    | Notes                                                                |
|----------|---------|------------------------------------------------------------------------|
| `isOpen` | boolean | Only meaningful below the `lg:` breakpoint. Ignored/always-visible at `lg:` and above (FR-006, FR-007). |

**Validation rules**:
- Selecting a language from the sidebar while `isOpen` is `true` (mobile) MUST close the sidebar
  after navigating, so the revealed content is visible (User Story 2, Acceptance Scenario 3).
- `isOpen` MUST NOT affect layout at `lg:`+ widths, where the sidebar is always persistently shown.

## No changes to LanguageEntry

`entry.slug` and `entry.name` (already present per `001-hello-world-multilang-site/data-model.md`)
are sufficient for both search (matches on `name`) and sidebar navigation (links to an anchor built
from `slug`, e.g. `#language-${entry.slug}`). No new field is added to the parsed content format,
and `content/languages/*.md` / `parseLanguageFile.js` are not touched by this feature.
