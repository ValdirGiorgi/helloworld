# Implementation Plan: About Page

**Branch**: `005-about-page` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-about-page/spec.md`

## Summary

Add a new `/:locale/about` page to the existing router, reachable from the main navigation
alongside Languages and History, stating the project was created by Valdir Giorgi to test the
Spec Kit tool, with links to Spec Kit's own repository, the author's blog article about the
experience, and this project's own repository (also used to find the contribution guide). Also
correct the footer's existing placeholder GitHub link to the same real repository address. Reuses
the site's existing i18n (`useLocale`), routing, and SEO-tag infrastructure unchanged — no new
architecture is introduced.

## Technical Context

**Language/Version**: JavaScript (ES2022), Vue 3.4 (`<script setup>`, Composition API) — unchanged.

**Primary Dependencies**: None new. Reuses `vue-router` (a new route, following the exact
`/:locale(pt-BR|en|es)/...` pattern already used by `history`/`language-detail`) and `vue-i18n`
(new message keys under a `about` namespace, following the existing convention).

**Storage**: None. The three external URLs this page links to (research.md §1) are constants, not
translated content or persisted data.

**Testing**: Vitest + `@vue/test-utils` for the new `AboutPage.vue` (content, all three links'
`href` attributes) and the corrected `AppFooter.vue` link; Playwright e2e for reaching the page via
the nav in each of the three locales and for the footer link's `href` on any page — same tooling
already used throughout this project.

**Target Platform**: Unchanged — static site, same hosting, same routing/rewrite requirements
already established in `003-i18n-language-detection`'s amendment (no new infrastructure need).

**Project Type**: Unchanged — single Vue SPA.

**Performance Goals**: N/A — one small additional page and a few new translated strings; no
measurable impact on the existing 150KB gzip budget expected.

**Constraints**: None new.

**Scale/Scope**: One new page component, one new route, ~7 new message keys × 3 locales, one new
small shared constants module (the three external URLs, reused by both the About page and the
footer fix), and a one-line fix to `AppFooter.vue`'s existing link.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: The three external URLs are defined once, in one new shared module, and
  imported by both `AboutPage.vue` and `AppFooter.vue` — avoiding the exact kind of duplicated
  literal this principle's consistency concern exists to prevent (a future URL change would
  otherwise require finding and updating it in two places). PASS.
- **II. Testing Standards (NON-NEGOTIABLE)**: New behavior (the About page's content and links, the
  corrected footer link) each get a test before being considered done. PASS.
- **III. User Experience Consistency**: The About page reuses the exact same page-shell, nav-link,
  and translated-content patterns already established by the History page and `useLocale()` —
  no new visual or interaction pattern is introduced. PASS.
- **IV. Performance Requirements**: No budget-relevant change (plan.md Performance Goals above);
  re-verified by comparing the build's gzip size to the existing baseline after implementation.
  PASS.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-about-page/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── siteLinks.js                     # NEW: the three external URLs (Spec Kit repo, this
│                                     #      project's repo, the blog article) as shared
│                                     #      constants — not translated content
├── pages/
│   └── AboutPage.vue                # NEW: renders the About content + three links, per
│                                     #      contracts/page-contract.md
├── router/
│   └── index.js                     # CHANGED: adds the `/:locale(pt-BR|en|es)/about` route
│                                     #          (name: "about"), same shape as `history`
├── components/layout/
│   ├── NavMenu.vue                  # CHANGED: adds a third link to the About page
│   └── AppFooter.vue                # CHANGED: `href="https://github.com/"` → imports and uses
│                                     #          siteLinks.js's project repository URL (FR-008)
└── i18n/locales/
    ├── en.js                        # CHANGED: new `about.*` and `nav.about` keys
    ├── pt-BR.js                     # CHANGED: same keys, Portuguese
    └── es.js                        # CHANGED: same keys, Spanish

tests/
├── unit/
│   ├── AboutPage.spec.js            # NEW
│   └── AppFooter.spec.js            # NEW (covers the corrected link; none existed before)
└── e2e/
    └── about-page.spec.js           # NEW
```

**Structure Decision**: Single Vue SPA project, unchanged. This feature adds one page, one route,
one small constants module, and translated strings — no new top-level directories, no backend, no
content-file format change.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
