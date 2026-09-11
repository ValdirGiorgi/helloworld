# Implementation Plan: Hello World Multi-Language Showcase Site

**Branch**: `001-hello-world-multilang-site` | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-hello-world-multilang-site/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A static Vue 3 + Tailwind CSS site that lists Hello World examples across programming languages
(launching with Java, Python, Dart, ABAP, PHP), collapsed to just Hello World by default and
expandable per language to reveal a conditional, an arithmetic calculation, and basic variable
declarations, plus dedicated content on the history of Hello World. Each language's content lives
in its own Markdown file authored against a predefined template, bundled at build time (no
database, no server runtime) with Vite, and deployed automatically via GitHub Actions over FTP on
every push to `main`. The UI is built from small, single-responsibility components to maximize
readability and teaching value.

## Technical Context

**Language/Version**: JavaScript (ES2022+), Vue 3 (Composition API, `<script setup>`), Node.js 20 LTS for tooling

**Primary Dependencies**: Vue 3, Vite, Tailwind CSS, vue-router (hash mode), gray-matter (frontmatter parsing), markdown-it (Markdown section parsing/rendering)

**Storage**: None (N/A) — content is static Markdown files bundled at build time; no database

**Testing**: Vitest + @vue/test-utils (unit/component), Playwright (e2e smoke suite)

**Target Platform**: Static web hosting reachable at helloworld.valdir.dev.br, served to modern desktop and mobile browsers

**Project Type**: Web application — frontend-only static SPA (no backend/API component)

**Performance Goals**: Lighthouse Performance ≥ 90 (mobile emulation); Time to Interactive < 2s on simulated Fast 4G

**Constraints**: Must build to static assets only (no server-side runtime); deploy exclusively via FTP upload of the built `dist/` folder; initial gzipped JS payload < 150KB; client-side routing must work on a plain static file host with no guaranteed server rewrite rules (hence hash-based routing)

**Scale/Scope**: 5 languages at launch (Java, Python, Dart, ABAP, PHP), designed to grow via community-contributed Markdown files; single-page app with 3 route types (home, history, language deep link)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Code Quality | ESLint (`eslint-plugin-vue`) + Prettier configured and run in CI; every PR reviewed (self-review checklist when solo) before merge to `main` | PASS — planned in tasks, no violation |
| II. Testing Standards (NON-NEGOTIABLE) | Vitest unit/component tests + Playwright e2e smoke suite; CI runs full suite on every push and blocks deploy on failure | PASS — testing stack chosen in research.md §5, wired into the same CI workflow that gates the FTP deploy |
| III. UX Consistency | Shared `base/` component set + centralized Tailwind design tokens ensure one visual language; expand/collapse interaction pattern is identical across every language entry (spec SC-002) | PASS — enforced by componentization approach (research.md §7) |
| IV. Performance Requirements | Budget stated above (Lighthouse ≥ 90, TTI < 2s, <150KB gzipped JS) before implementation, per research.md §10 | PASS — budget defined; measurement via manual Lighthouse run documented in quickstart.md |

No violations identified. Complexity Tracking table below is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-hello-world-multilang-site/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── deploy.yml            # lint + test + build + FTP deploy on push to main

content/
├── language-template.md      # predefined template contributors copy to add a language
├── history.md                # Hello World history content
└── languages/
    ├── java.md
    ├── python.md
    ├── dart.md
    ├── abap.md
    └── php.md

public/
└── favicon.svg

src/
├── assets/                   # static images/icons bundled by Vite
├── components/
│   ├── base/                 # BaseButton, BaseBadge, BaseCard, BaseIcon
│   ├── layout/                # AppHeader, AppFooter, NavMenu
│   ├── language/               # LanguageCard, LanguageList, ExpandableSection, CodeBlock, VariableList
│   └── history/                # HistoryArticle
├── composables/
│   ├── useLanguages.js        # loads + exposes parsed LanguageEntry[]
│   └── useExpandable.js       # shared expand/collapse state logic
├── content/
│   └── parseLanguageFile.js   # frontmatter + section parser (raw .md -> LanguageEntry)
├── pages/
│   ├── HomePage.vue
│   ├── HistoryPage.vue
│   └── LanguageDetailPage.vue
├── router/
│   └── index.js               # vue-router, hash history
├── App.vue
└── main.js

tests/
├── unit/
│   ├── parseLanguageFile.spec.js
│   ├── ExpandableSection.spec.js
│   └── LanguageCard.spec.js
└── e2e/
    └── browse-and-expand.spec.js

index.html
tailwind.config.js
postcss.config.js
vite.config.js
package.json
```

**Structure Decision**: Single frontend-only project (no backend/API to separate out — FR-010
rules out a server/database), following the standard Vite + Vue 3 scaffold layout. Content lives
outside `src/` in a top-level `content/` directory so contributors adding a new language (per
FR-008/009) touch only `content/languages/<slug>.md` and never need to open the application
source. Components are split into four role-based folders under `src/components/` to satisfy the
user's explicit componentization requirement and Constitution Principle I.

## Complexity Tracking

> No Constitution Check violations were identified — this section is intentionally left empty.
