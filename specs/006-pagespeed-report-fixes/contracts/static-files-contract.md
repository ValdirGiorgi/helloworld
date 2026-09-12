# Static File Contracts: PageSpeed Report Fixes

## `public/robots.txt` → served at `/robots.txt`

- **MUST** respond with the file's literal content (not the SPA's `index.html`) — verifiable by the
  absence of any HTML tag (`<html`, `<!doctype`) in the response body.
- **MUST** contain the lines `User-agent: *` and `Allow: /` (data-model.md `RobotsFile`).

## `public/llms.txt` → served at `/llms.txt`

- **MUST** respond with the file's literal content (not the SPA's `index.html`) — same
  no-HTML-tag check as above.
- **MUST** start with (or otherwise contain) a line beginning with `# ` (a Markdown H1).
- **MUST** contain at least one Markdown link in `[text](url)` form.
- **MUST** contain links whose `url` includes `/en` (Home), `/en/about` (About), and `/en/history`
  (History) — data-model.md `LlmsFile`.

## Test contract (`tests/e2e/static-files.spec.js`)

- Uses Playwright's `request` fixture (`context.request.get(path)`) rather than `page.goto`, since
  these are non-HTML static assets, not pages to render.
- One test per file, each asserting: HTTP 200, content does not look like the SPA shell, and the
  file's own required structural elements (per the two contracts above) are present.
