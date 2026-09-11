# Quickstart: Responsive Layout with Sidebar Navigation and Language Search

## Prerequisites

- Node.js + npm already set up for this repo (see repo root `README.md`).
- Dependencies installed: `npm install` (no new dependencies are added by this feature — see
  research.md §2–3).

## Run the app

```bash
npm run dev
```

Open the printed local URL. The home page (`/#/`) should show:
1. A search input above the language list.
2. A sidebar listing every language — visible beside the content on a wide window, hidden behind a
   toggle button on a narrow one.
3. Every language card stacked in a single vertical column, never side-by-side.

## Validate: single-column layout at every width (User Story 3 / FR-001, FR-009, SC-002)

1. With the browser window wide (desktop size), confirm language cards stack vertically, one per
   row — not two per row.
2. Resize the window down to a mobile width (~375px) and confirm: still one column, no horizontal
   scrollbar, no overlapping/clipped text.
3. At desktop width, increase browser zoom to 150–200% and confirm the layout still reflows to a
   single readable column with no horizontal scroll.

## Validate: expanding a card does not distort others (User Story 3 / FR-008, SC-003)

1. Note the horizontal position/width of two adjacent language cards.
2. Expand the first card (click to reveal its conditional/loop/function/etc. sections).
3. Confirm the second card's horizontal position and width are unchanged, and it has only moved
   down by exactly the height the first card grew.
4. Collapse the first card again and confirm the layout returns to its original compact state with
   no leftover gap.

## Validate: search (User Story 1 / FR-002–FR-004, SC-001, SC-005)

1. Type a full language name (e.g., "Java") into the search input — confirm only that language's
   card remains visible.
2. Clear the input and type a lowercase partial term (e.g., "pyt") — confirm the matching
   language(s) still show up.
3. Type a term that matches nothing (e.g., "xyzxyz") — confirm a clear "no results" message
   appears instead of a blank area.
4. Clear the search box — confirm every language reappears.

## Validate: sidebar navigation (User Story 2 / FR-005–FR-007, FR-010, SC-004)

1. At desktop width, confirm the sidebar is visible without any extra click and lists every
   language.
2. Click a language in the sidebar — confirm the page scrolls to that language's card.
3. Resize to mobile width, confirm the sidebar is hidden and a menu/toggle button is visible.
4. Open the sidebar via the toggle — confirm it appears without breaking the page layout (e.g., as
   an overlay), lists every language, and does not permanently shrink the main content area.
5. Select a language from the open mobile sidebar — confirm it scrolls to that language's card
   *and* the sidebar closes afterward, so the card is actually visible.

## Automated checks

```bash
npm run lint
npx vitest run
npx playwright test
npm run build
```

Expected: 0 lint errors; all unit tests pass, including the new
`useLanguageFilter`/`LanguageSearch`/`LanguageSidebar`/`LanguageList` suites; all e2e tests pass,
including the new responsive-layout, search, and sidebar-navigation specs; the production build
succeeds with gzipped JS still comfortably under the project's 150KB budget (baseline: ~88.9KB —
see `specs/001-hello-world-multilang-site/quickstart.md`).

**Result (2026-09-11)**: 0 lint errors (42 pre-existing style warnings in unrelated files,
unchanged from before this feature); 30/30 unit tests pass; 10/10 e2e tests pass; production build
gzipped JS ≈ 90.4KB (0.48+1.97+4.25+37.06+46.61KB across chunks), a ~1.5KB increase over the
88.9KB baseline — comfortably under the 150KB budget.
