# Feature Specification: Responsive Layout with Sidebar Navigation and Language Search

**Feature Branch**: `002-responsive-sidebar-search`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Preciso que tenha mais responsividade pra celular, preciso de um menu lateral e uma forma de buscar a o nome da linguagem e encontrar ela. Eu não achei muito legal uma linguagem ao lado da outra porque quando eu amplio parece que distorce, de repente fazer um menu lateral e também todas as linguagens na vertical, né? E de fato que se eu expandir não não vai danificar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find a language by name (Priority: P1)

A visitor who knows (or partially remembers) the name of a programming language wants to jump straight to it instead of scrolling through the whole page.

**Why this priority**: This is the concrete pain point the user called out ("uma forma de buscar o nome da linguagem e encontrar ela") and delivers value on its own even before the layout changes.

**Independent Test**: Can be fully tested by typing a full or partial language name into the search field and confirming that only matching languages remain visible (or are highlighted/scrolled to), independent of any sidebar or layout change.

**Acceptance Scenarios**:

1. **Given** the site is loaded with all languages, **When** the visitor types a full language name (e.g., "Java") into the search field, **Then** only the matching language entry is shown (or clearly highlighted as the match).
2. **Given** the site is loaded, **When** the visitor types a partial, lowercase, or accented-variant term (e.g., "jav", "PYTHON", "abap"), **Then** the search still matches the corresponding language(s) case-insensitively.
3. **Given** the visitor types a term that matches no language, **When** the search executes, **Then** the system shows a clear "no results" message instead of an empty blank area.
4. **Given** the visitor clears the search field, **When** the field becomes empty, **Then** all languages are shown again in their normal order.

---

### User Story 2 - Navigate the full language list from a sidebar (Priority: P2)

A visitor wants a persistent way to see all available languages and jump to any of them without scrolling through the whole page, on both desktop and mobile.

**Why this priority**: Explicitly requested ("preciso de um menu lateral") and complements search by giving a browsable overview, but the site remains usable via scrolling/search alone without it, so it is independently valuable but secondary to search.

**Independent Test**: Can be fully tested by opening the sidebar, confirming it lists every available language, and clicking an entry to confirm the corresponding language becomes visible in the main content — independent of search or layout stacking changes.

**Acceptance Scenarios**:

1. **Given** the site is loaded on a desktop-sized screen, **When** the visitor looks at the page, **Then** a sidebar listing every language is visible alongside the main content.
2. **Given** the site is loaded on a mobile-sized screen, **When** the visitor opens the sidebar via a menu control, **Then** the sidebar appears (e.g., as an overlay/drawer) without permanently reducing the space available for the language content.
3. **Given** the sidebar is open, **When** the visitor selects a language from it, **Then** the main content scrolls to (or otherwise reveals) that language's entry, and on mobile the sidebar closes afterward so the content is visible.

---

### User Story 3 - View language entries without layout distortion on any screen size (Priority: P1)

A visitor on a phone or a zoomed-in desktop browser wants each language's content to display cleanly, without languages being squeezed side-by-side, and without expanding one language's details breaking the layout of the page.

**Why this priority**: This is the core complaint driving the whole request ("uma linguagem ao lado da outra... quando eu amplio parece que distorce" and "se eu expandir não vai danificar") — without fixing it, search and the sidebar are navigating toward a broken destination. Equal priority to search since it is foundational to every other story.

**Independent Test**: Can be fully tested by loading the site at a narrow mobile width and at a magnified desktop zoom level, confirming languages stack in a single vertical column with no horizontal scrolling, and then expanding a language's details and confirming no other entry shifts size, shrinks, or overlaps.

**Acceptance Scenarios**:

1. **Given** the site is loaded on any screen width (mobile, tablet, desktop) or at any browser zoom level, **When** the visitor views the language list, **Then** languages are stacked vertically in a single column rather than side-by-side.
2. **Given** a language entry is collapsed, **When** the visitor expands it, **Then** only that entry grows to show its content; no other entry's width, proportions, or position distorts as a result.
3. **Given** a language entry is expanded, **When** the visitor collapses it again, **Then** the page returns to its normal compact layout without leftover blank space or shifted content.
4. **Given** the visitor increases browser zoom significantly, **When** the page reflows, **Then** content remains readable in a single column with no horizontal scrolling or overlapping text.

---

### Edge Cases

- What happens when the visitor searches while the sidebar is also open on mobile? (Both should remain usable together; search should not require closing the sidebar.)
- How does the system handle a very long list of languages in the sidebar as the community contributes more entries (e.g., scrolling within the sidebar itself rather than growing the page)?
- What happens if the visitor expands a language entry and then filters it out via search? (The filtered-out entry's expanded state should not cause layout issues when it reappears later.)
- How does the search behave with special characters or languages whose names contain punctuation (none currently, but contributed entries might)?
- What happens on very small phone screens (e.g., under 360px wide) — content must still avoid horizontal scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display language entries stacked vertically in a single column, at every supported screen width and browser zoom level, replacing any side-by-side/multi-column arrangement.
- **FR-002**: System MUST provide a text search input that filters or highlights languages by name as the visitor types.
- **FR-003**: Search matching MUST be case-insensitive and MUST match partial names (substring match), not only exact full names.
- **FR-004**: System MUST display a clear "no results" state when the search term matches no language.
- **FR-005**: System MUST provide a sidebar navigation element that lists every available language and lets the visitor jump directly to any one of them.
- **FR-006**: On narrow (mobile) viewports, the sidebar MUST be presented in a way that does not permanently consume space from the main content (e.g., an openable/closable panel), and MUST remain reachable via a visible control.
- **FR-007**: On wide (desktop/tablet) viewports, the sidebar MAY remain persistently visible alongside the main content.
- **FR-008**: Expanding a language entry's details MUST NOT change the size, proportions, or position of any other language entry on the page.
- **FR-009**: The overall page layout MUST remain free of horizontal scrolling and visual distortion (e.g., squeezed or overlapping content) across mobile, tablet, and desktop viewport widths and under increased browser zoom.
- **FR-010**: Selecting a language from the sidebar MUST bring that language's entry into view within the main content area.
- **FR-011**: All previously existing language-entry functionality (collapsed-by-default Hello World display, expand/collapse of the 9 content sections, declared outcomes) MUST continue to work unchanged within the new vertical, searchable, sidebar-navigable layout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a mobile-width screen (≈375px), a visitor can locate a specific language using search in under 10 seconds without any horizontal scrolling.
- **SC-002**: 100% of language entries render in a single vertical column at every tested viewport width (mobile, tablet, desktop) and at increased browser zoom levels (up to 200%).
- **SC-003**: Expanding any language entry produces zero observable size or position changes in any other entry on the page.
- **SC-004**: A visitor can reach any language on the site from the sidebar in 2 interactions or fewer (open sidebar if needed, then select the language).
- **SC-005**: Search results update to reflect the current search term with no perceptible delay (visitor does not notice a lag while typing).

## Assumptions

- The existing side-by-side/grid presentation of language cards is being replaced by a single vertical column for all screen sizes, not just mobile — this directly addresses the zoom-distortion complaint and matches the user's explicit request ("todas as linguagens na vertical").
- The sidebar behaves as a standard responsive navigation pattern: persistently visible on desktop/tablet, and an openable/closable off-canvas panel on mobile — a widely understood UX convention, chosen since the user did not specify exact sidebar behavior.
- Search operates on language display names only (not on code content within each language's sections), matching the user's own wording ("buscar o nome da linguagem").
- No pagination or virtualization is needed for the sidebar or main list at this time, since the current catalog is small (5 languages) and expected to grow gradually through community contributions.
- Search and sidebar navigation run entirely client-side against the already-loaded static content; no new backend, API, or build-time data source is required.
- This feature only changes navigation, search, and layout/responsiveness; it does not change the content, structure, or declared-outcome values of any existing language entry (see `specs/001-hello-world-multilang-site/spec.md`).
