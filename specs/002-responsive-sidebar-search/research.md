# Phase 0 Research: Responsive Layout with Sidebar Navigation and Language Search

No items in the Technical Context were marked `NEEDS CLARIFICATION` — this feature reuses the
existing Vue 3 + Tailwind + Vitest + Playwright stack from `001-hello-world-multilang-site`
unchanged. The research below documents the concrete UI/architecture decisions made to satisfy the
spec's requirements without adding new dependencies.

## 1. Single-column layout for every screen width

**Decision**: Change `LanguageList.vue` from `grid gap-6 sm:grid-cols-2` to a single flex/grid
column (`flex flex-col gap-6`) applied at all breakpoints — no `sm:`/`md:`/`lg:` column-count
override.

**Rationale**: The user's core complaint was that side-by-side cards "distort" at higher zoom
levels, and the spec (FR-001, User Story 3) explicitly asks for vertical stacking at *every* width,
not just mobile. A single column is also what makes "expanding one entry must not affect any other
entry's width" (FR-008) trivially true — in a multi-column grid, one card's content can influence
row height/alignment of siblings depending on grid auto-sizing; in a single column, each card's
box is independent and expansion only pushes content below it down (standard block flow).

**Alternatives considered**:
- *Keep `sm:grid-cols-2`, only force single-column below a breakpoint*: rejected — does not fix the
  desktop zoom-distortion the user specifically reported, and re-introduces the exact sibling-
  interference risk during expand/collapse that FR-008 rules out.
- *CSS `columns` (masonry-style)*: rejected — masonry layouts reflow item positions as content
  above them changes height, which is the opposite of "expanding must not move other entries."

## 2. Search: plain case-insensitive substring match, no new dependency

**Decision**: Implement `useLanguageFilter(languages, query)` as a pure function/composable doing
`entry.name.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())`, with no fuzzy-matching
or ranking library.

**Rationale**: Spec FR-003 only requires case-insensitive partial-name matching, and the catalog
size (Assumptions: currently 5, growing gradually via community contributions) is far too small to
need fuzzy search, ranking, or indexing. `toLocaleLowerCase` (rather than `toLowerCase`) handles
accented language names correctly for the project's Portuguese-speaking audience. Keeping this as a
pure function (not a component) makes it trivially unit-testable in isolation from any DOM/Vue
rendering, matching Constitution Principle II's "happy path and known critical edge cases" bar with
minimal test setup.

**Alternatives considered**:
- *Fuzzy-match library (e.g., Fuse.js)*: rejected — new dependency for a scale (tens of names) and
  requirement (exact substring, per FR-003's own wording "buscar o nome da linguagem") that doesn't
  need it; would grow the bundle for no measurable user benefit, conflicting with the stated
  performance budget and Constitution Principle IV ("do not add complexity for a performance gain
  that has not been demonstrated to matter" — inverted here to "do not add a dependency for
  matching quality nobody asked for").
- *Server-side/build-time search index*: rejected — the site is static with build-time content and
  a small catalog; an index adds build complexity with no runtime benefit at this scale.

## 3. Sidebar: plain Vue + Tailwind, no UI/animation library

**Decision**: Build `LanguageSidebar.vue` as a `<nav>` listing `router-link`-free anchor links (or
`@click` handlers using native scroll, since this is same-page navigation, not route navigation) to
each language's card, shown:
- persistently (`static`/normal flow) on `lg:` and wider viewports,
- as a `fixed` off-canvas panel with a semi-transparent backdrop, toggled by a `<button>` with
  `aria-expanded`, below `lg:`.

Use Vue's built-in `<Transition>` for the open/close slide, and native `Element.scrollIntoView({
behavior: 'smooth', block: 'start' })` for jump-to-language, rather than a headless-UI or animation
package.

**Rationale**: This is a well-understood, industry-standard responsive nav pattern (persistent
sidebar ⟷ off-canvas drawer) achievable with Tailwind's existing utility classes (`fixed`,
`translate-x-*`, `lg:static`, `lg:translate-x-0`) and Vue's built-in transition primitive — no
dependency needed, keeping bundle growth minimal (Constitution Principle IV / the plan's stated
150KB gzip budget) and avoiding Constitution Principle I's "no unjustified complexity" for
something the existing toolchain already covers.

**Alternatives considered**:
- *Headless UI / Radix-style component library*: rejected — solves focus-trapping and transition
  edge cases the project doesn't need at this scale (a handful of links, not a complex modal), and
  would be the project's first UI library dependency for one toggle.
- *Route-based sidebar (e.g., `/#/java` as a real route rendering a filtered view)*: rejected — the
  existing single-page `HomePage.vue` already renders every language; turning "jump to a language"
  into route navigation would duplicate `LanguageDetailPage.vue`'s existing responsibility and
  complicate the already-decided `createWebHashHistory` routing scheme (see
  `001-hello-world-multilang-site/research.md`) for no added user value over an in-page anchor
  scroll.

## 4. Verifying "no layout distortion" is testable, not just visual

**Decision**: Express FR-008/FR-009/SC-002/SC-003 as automated checks: (a) a unit test asserting
`LanguageList.vue`'s root element never carries a multi-column grid class, and (b) an e2e test that
reads each card's bounding-box `x`/`width` before and after expanding one card, asserting siblings'
`x`/`width` are unchanged (only `y`-position of cards *below* the expanded one may shift, per normal
block flow).

**Rationale**: "Distortion" is otherwise a subjective, screenshot-only judgment; pinning it to
bounding-box invariants makes Constitution Principle II's testability bar achievable and gives a
concrete, automatable definition of "did not damage the layout" that matches the user's own
wording ("não vai danificar").

**Alternatives considered**:
- *Visual regression screenshots*: rejected as the primary check — useful as a supplementary
  manual/quickstart step, but brittle as an automated CI gate (font-rendering/anti-aliasing noise)
  compared to a bounding-box assertion; not worth adding a new dependency (e.g., a screenshot-diff
  tool) for this feature's scope.

## Outcome

All Technical Context items are resolved with existing tools; no new runtime dependency is
introduced. Proceeding to Phase 1 design.
