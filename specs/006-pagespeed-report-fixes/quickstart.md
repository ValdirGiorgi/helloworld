# Quickstart: PageSpeed Report Fixes

## Prerequisites

- No new dependencies — `npm install` is unchanged.

## Validate: robots.txt (User Story 1 / FR-001, FR-002, SC-001, SC-004)

1. Run `npm run dev` and open `http://localhost:5173/robots.txt` directly.
2. Confirm the response is plain text starting with `User-agent: *` — not the site's HTML shell.
3. Confirm it contains `Allow: /`.

## Validate: llms.txt (User Story 2 / FR-003-FR-005, SC-002, SC-004)

1. Open `http://localhost:5173/llms.txt` directly.
2. Confirm the response is plain text, not the site's HTML shell.
3. Confirm it starts with a `# ` heading naming the project.
4. Confirm it contains working links to the Home, About, and History pages, and to the project's
   GitHub repository.

## Validate: build output (both files)

```bash
npm run build
ls dist/robots.txt dist/llms.txt
```

Both files MUST exist in `dist/`, copied byte-for-byte from `public/` (same mechanism already
verified for `public/.htaccess` in `003-i18n-language-detection`).

## Validate: the report itself (SC-001, SC-002, SC-003)

Once deployed, re-run PageSpeed Insights against the live site and confirm:
- The SEO category no longer lists an invalid-`robots.txt` finding, and its score reaches 100.
- The agentic-browsing category no longer lists the `llms.txt`-doesn't-follow-best-practices
  finding, and its score reaches its maximum.
- No previously-passing item in either category regressed (spec.md FR-006).

## Automated checks

```bash
npm run lint
npx vitest run
npx playwright test
npm run build
```

Expected: 0 lint errors; all existing unit/e2e tests still pass; a new
`tests/e2e/static-files.spec.js` passes, verifying both files' reachability and required content
per contracts/static-files-contract.md; the production build succeeds with `dist/robots.txt` and
`dist/llms.txt` present and no bundle-size change (no application code is touched).
