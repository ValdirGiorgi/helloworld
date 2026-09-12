# Data Model: PageSpeed Report Fixes

This feature introduces no application data or runtime state — both new files are static content.

## RobotsFile (`public/robots.txt`)

| Field | Value | Notes |
|-------|-------|-------|
| `user-agent` | `*` | Applies to every crawler. |
| `directive` | `Allow: /` | Everything is crawlable (spec.md FR-002, Assumptions: no private content exists). |

**Validation rules**:
- MUST be valid robots-directives syntax (spec.md FR-001, SC-001) — every line must be a
  recognized directive, not arbitrary text (this is exactly what the failing audit checks).
- MUST NOT include a `Sitemap:` directive pointing at a file that doesn't exist (research.md §3).

## LlmsFile (`public/llms.txt`)

| Field | Value | Notes |
|-------|-------|-------|
| Heading | `# Hello World in Many Languages` | Required top-level (H1) heading (spec.md FR-004). |
| Summary | One-sentence blockquote | What the project is, reusing the About page's/README's existing description. |
| Links | Home, About, History (English addresses), GitHub repository | Spec.md FR-005's minimum link set; addresses are literal strings (research.md §2 — cannot import `src/siteLinks.js` from a static file). |

**Validation rules**:
- MUST contain a top-level (`#`) heading (spec.md FR-004; this is the first of the two errors the
  report found — data-model.md ties directly back to spec.md's Findings section).
- MUST contain at least one Markdown link (`[text](url)`) (spec.md FR-004; the second error found).
- MUST link, at minimum, to the Home, About, and History pages (spec.md FR-005).
- The GitHub repository URL here MUST match `PROJECT_REPO_URL` in `src/siteLinks.js`
  (`005-about-page/data-model.md`) — kept as two literal, independently-updated values by
  necessity (research.md §2), not two sources of truth by choice.
