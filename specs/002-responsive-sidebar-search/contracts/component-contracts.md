# Component & Composable Contracts: Responsive Layout, Sidebar, Search

This feature has no external API/CLI/content-format surface — its only "interfaces" are the
props/emits of new Vue components and the signature of one new composable, consumed by
`HomePage.vue`. Documented here so implementation (tasks.md) and tests agree on the exact shape
before code is written.

## `useLanguageFilter(languages, query)`

Pure, framework-agnostic filter — no reactivity of its own; callers wrap the inputs in `computed()`.

- **Input**: `languages` — array of `LanguageEntry` (each with at least `.slug` and `.name`).
- **Input**: `query` — string, the raw search text (may be empty, whitespace-only, mixed case,
  accented).
- **Output**: array of `LanguageEntry`, a filtered (never re-ordered, never mutated) subset of
  `languages`, containing every entry whose `.name` contains `query` as a case-insensitive
  substring. Returns the full `languages` array unchanged when `query` is empty/whitespace-only.
- **Errors**: none — invalid/missing `query` is treated as empty string, not an error condition
  (this is a display filter, not a form field with validation feedback).

## `<LanguageSearch>`

- **Props**: `modelValue: { type: String, default: '' }` — the current search text (v-model).
- **Emits**: `update:modelValue` (string) — on every input change, enabling `v-model="query"` from
  the parent.
- **Renders**: a labeled text `<input type="search">` (native label association via `for`/`id`,
  per Constitution Principle III's accessibility requirement) with a placeholder describing its
  purpose (e.g., "Buscar linguagem...").
- **Does not**: perform the filtering itself, know about the `languages` array, or render results —
  it only reports the query string upward, keeping it independently testable (FR-002/FR-003).

## `<LanguageSidebar>`

- **Props**:
  - `languages: { type: Array, required: true }` — full, unfiltered `LanguageEntry` list (the
    sidebar always lists every language regardless of the current search, per User Story 2's own
    scope — search and sidebar are independent, per the spec's Edge Cases).
  - `isOpen: { type: Boolean, default: false }` — whether the mobile off-canvas panel is visible;
    ignored visually at `lg:`+ widths where the sidebar is always shown.
- **Emits**: `close` — requested when a language link is activated (parent is responsible for
  closing on mobile per FR-006/User Story 2 Acceptance Scenario 3) or when the backdrop is clicked.
- **Renders**: a `<nav aria-label="Linguagens">` with one link per language (`href="#language-{{
  entry.slug }}"`), plus (below `lg:`) a backdrop `<div>` and `<Transition>`-wrapped panel.
- **Does not**: own the `isOpen` state — it is fully controlled by the parent (`HomePage.vue`),
  keeping the component pure/presentational and simple to unit test.

## `<LanguageList>` (changed)

- **Props**: `languages: { type: Array, required: true }` — the list to render (now typically the
  *filtered* list, passed down from `HomePage.vue`; previously it read `useLanguages()` internally
  — this change lets `HomePage.vue` own filtering and keeps `LanguageList` a pure renderer).
- **Renders**: each entry via `<LanguageCard>` inside a single vertical column (`flex flex-col
  gap-6`, no multi-column classes at any breakpoint — FR-001).
- **Empty state**: when `languages` is an empty array, renders a "no results" message (FR-004)
  instead of an empty container.

## `<LanguageCard>` (changed)

- **New prop-derived behavior**: root `<BaseCard>` gains `:id="`language-${entry.slug}`"` so the
  sidebar's `#language-{{ slug }}` anchor links and `scrollIntoView` targeting resolve to it
  (FR-010). No prop/emit signature change — `entry` and `startExpanded` are unchanged from
  `001-hello-world-multilang-site`.

## `HomePage.vue` (composition, not a reusable component — documented for completeness)

Owns `query` (string ref) and `isSidebarOpen` (boolean ref) as local state; computes
`filteredLanguages = useLanguageFilter(languages, query)`; wires:
- `<LanguageSearch v-model="query" />`
- `<LanguageSidebar :languages="languages" :is-open="isSidebarOpen" @close="isSidebarOpen = false" />`
- `<LanguageList :languages="filteredLanguages" />`
- a mobile-only `<button>` (`lg:hidden`) toggling `isSidebarOpen`.
