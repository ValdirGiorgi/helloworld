# Implementation Plan: PageSpeed Report Fixes

**Branch**: `006-pagespeed-report-fixes` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-pagespeed-report-fixes/spec.md`

## Summary

Add two static files — `public/robots.txt` and `public/llms.txt` — so requests for them are served
as real content instead of falling through to the SPA's `index.html` via the existing
`public/.htaccess` rewrite rule (the confirmed root cause of both failing PageSpeed audits, per
spec.md's Findings). `robots.txt` allows crawling everything (no private content exists on this
site); `llms.txt` follows the format's basic structure (a top-level heading and links) and
summarizes the project with links to its Home, About, and History pages plus its GitHub
repository. Both are static, English-only, locale-independent content — no application code
changes.

## Technical Context

**Language/Version**: Plain text files (`robots.txt` directives format; `llms.txt`'s Markdown-based
format). No JavaScript/Vue changes.

**Primary Dependencies**: None new. Relies entirely on Vite's existing `public/` → `dist/`
passthrough (the same mechanism already used for `public/.htaccess` in
`003-i18n-language-detection`'s amendment).

**Storage**: N/A.

**Testing**: Playwright e2e, using the `request` API to fetch `/robots.txt` and `/llms.txt`
directly (no page render needed) and assert their content — same tooling already used throughout
this project, applied to static-file responses rather than rendered pages.

**Target Platform**: Unchanged — static site, same hosting; both files are served as ordinary
static files, requiring no server logic beyond what already exists (Vite dev server and the
production Apache host both already serve `public/`'s contents directly for any request matching a
real file, before the SPA-fallback rewrite rule ever applies).

**Project Type**: Unchanged — single Vue SPA; this feature only adds two files under `public/`.

**Performance Goals**: N/A — two small static text files, no measurable impact on the existing
bundle/load-time budget.

**Constraints**: Per spec.md FR-006, neither file may change or interfere with any
currently-passing SEO/agentic-browsing audit item.

**Scale/Scope**: Two new static files (`public/robots.txt`, `public/llms.txt`) and one new e2e
test file.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: Both files are small, single-purpose, static content with no logic —
  nothing to keep consistent internally. One accepted, documented exception to the "define a URL
  once" precedent set in `005-about-page`'s `siteLinks.js`: `llms.txt` is a static file outside the
  JS bundle, so it cannot `import` that module — its links are written directly as literal URLs
  (research.md §2 records this as a deliberate, unavoidable exception, not an oversight). PASS.
- **II. Testing Standards (NON-NEGOTIABLE)**: Each new file's required content and reachability get
  an e2e test before being considered done (contracts/static-files-contract.md). PASS.
- **III. User Experience Consistency**: N/A for human-facing UI (these files target crawlers/agents,
  not visitors); the `llms.txt` content stays consistent with how the site already describes itself
  elsewhere (README.md, the About page) rather than introducing a new description of the project.
  PASS.
- **IV. Performance Requirements**: N/A — no runtime/bundle impact (plan.md Performance Goals
  above). PASS.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-pagespeed-report-fixes/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
public/
├── .htaccess          # UNCHANGED
├── robots.txt         # NEW: allows crawling everything (FR-001, FR-002)
└── llms.txt           # NEW: project summary + links, per llmstxt.org's basic structure
                        #      (FR-003-FR-005)

tests/
└── e2e/
    └── static-files.spec.js   # NEW: fetches both files directly and asserts their content/
                                 #      reachability, per contracts/static-files-contract.md
```

**Structure Decision**: No new top-level directories, no application code touched — this feature
adds exactly two static files already covered by the existing `public/` → `dist/` build mechanism.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
