# Quickstart: Hello World Multi-Language Showcase Site

Validation guide for the feature described in [spec.md](spec.md), designed per [plan.md](plan.md).
This proves the feature end-to-end; it does not contain implementation code (see `tasks.md` for
that once generated).

## Prerequisites

- Node.js 20 LTS and npm installed
- Repository cloned locally, on branch `001-hello-world-multilang-site`
- Dependencies installed: `npm install`

## Run the site locally

```bash
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

**Expected**: The home page lists 5 languages (Java, Python, Dart, ABAP, PHP), each showing only
its Hello World code by default — nothing else visible (validates User Story 1 / FR-001).

## Validate: expand/collapse a language (User Story 2)

1. Click/tap any language card.
2. **Expected**: The card reveals a conditional example, a calculation example, a loop example, a
   function example, a string concatenation example, a list/array example, a boolean comparison
   example, and variable declarations (integer, string, float) for that language (FR-002).
3. Check every declared outcome shown — across every language you expand, it must read: `4`
   (calculation, FR-007), `1 2 3 4 5` (loop, FR-009), `5` (function, FR-010), `Olá, Mary` (string
   concatenation, FR-011), `6` (list, FR-012), `true` (boolean, FR-013). The `string` variable
   declaration must also show the name `Mary`.
4. Click the card again.
5. **Expected**: The card collapses back to showing only Hello World (FR-003).

## Validate: history content (User Story 3)

Navigate to `/#/history` (or use the nav menu's "History" link).

**Expected**: Readable content describing the origin and evolution of the Hello World tradition
renders (FR-004).

## Validate: contribute a new language (User Story 4)

1. Copy [contracts/language-template.md](contracts/language-template.md) to
   `content/languages/<new-language-slug>.md`.
2. Fill in the `name` frontmatter field and all nine sections (Hello World, Conditional,
   Calculation, Loop, Function, String Concatenation, List, Boolean Comparison, Variables),
   keeping every `- result:` line at its fixed value (`4`, `1 2 3 4 5`, `5`, `Olá, Mary`, `6`,
   `true` respectively).
3. Restart the dev server (`npm run dev`).
4. **Expected**: The new language appears on the home page, collapsed to Hello World by default,
   and expands the same way as the launch languages (FR-008, FR-014).
5. Try deleting one required section from your test file and reload.
   **Expected**: The build/dev server surfaces a validation error identifying the missing section
   rather than silently publishing an incomplete entry (spec Edge Cases).

## Run automated tests

```bash
npm run test:unit   # Vitest — parseLanguageFile, ExpandableSection, LanguageCard
npm run test:e2e    # Playwright — full browse/expand/collapse/history smoke flow
```

**Expected**: All tests pass (Constitution Principle II — a red suite blocks merge/deploy).

## Build the static site

```bash
npm run build
```

**Expected**: A `dist/` folder is produced containing only static HTML/CSS/JS assets — no server
process required to serve it (FR-010).

## Validate the performance budget

Run Lighthouse (Chrome DevTools → Lighthouse tab, or `npx lighthouse <preview-url> --preset=perf`)
against `npm run preview`'s served `dist/` build.

**Expected**: Performance score ≥ 90, Time to Interactive < 2s (per plan.md Performance Goals).

**Result (2026-09-10, mobile emulation, simulated throttling, local build)**: Performance
score **95/100**. First Contentful Paint 1.2s, Largest Contentful Paint 1.6s, Time to
Interactive 1.6s, Total Blocking Time 10ms. Initial gzipped JS across all launch routes totals
~88KB (see `npm run build` output), under the 150KB budget. All three budgeted metrics pass
with margin. (Cumulative Layout Shift read 0.128 — not part of the stated budget, but worth a
follow-up if a future pass wants to tighten it, e.g. by reserving space for the header icon.)

## Validate the deploy pipeline (once FTP credentials are configured)

1. Confirm `.github/workflows/deploy.yml` exists and is configured to trigger `on: push:
   branches: [main]`.
2. Confirm the workflow reads `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` from GitHub Actions
   secrets rather than hardcoded values.
3. Push a change to `main` (after credentials are set by the project owner) and confirm, in the
   Actions tab, that lint + tests run and pass before the FTP upload step executes.

**Expected**: A failing lint/test step blocks the FTP deploy step from running (Constitution
Quality Gates).
