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
2. **Expected**: The card reveals a conditional example, a calculation example, and variable
   declarations (integer, string, float) for that language (FR-002).
3. Check the calculation result shown — it must read `4` for every language you expand (FR-007,
   SC-003).
4. Click the card again.
5. **Expected**: The card collapses back to showing only Hello World (FR-003).

## Validate: history content (User Story 3)

Navigate to `/#/history` (or use the nav menu's "History" link).

**Expected**: Readable content describing the origin and evolution of the Hello World tradition
renders (FR-004).

## Validate: contribute a new language (User Story 4)

1. Copy [contracts/language-template.md](contracts/language-template.md) to
   `content/languages/<new-language-slug>.md`.
2. Fill in the `name` frontmatter field and all four sections (Hello World, Conditional,
   Calculation, Variables), keeping the Calculation section's result equal to `4`.
3. Restart the dev server (`npm run dev`).
4. **Expected**: The new language appears on the home page, collapsed to Hello World by default,
   and expands the same way as the launch languages (FR-008, FR-009).
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

## Validate the deploy pipeline (once FTP credentials are configured)

1. Confirm `.github/workflows/deploy.yml` exists and is configured to trigger `on: push:
   branches: [main]`.
2. Confirm the workflow reads `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` from GitHub Actions
   secrets rather than hardcoded values.
3. Push a change to `main` (after credentials are set by the project owner) and confirm, in the
   Actions tab, that lint + tests run and pass before the FTP upload step executes.

**Expected**: A failing lint/test step blocks the FTP deploy step from running (Constitution
Quality Gates).
