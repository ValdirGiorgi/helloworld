# Quickstart: Sitemap for Search Engine Discovery

## Prerequisites

- No new dependencies — `npm install` is unchanged.

## Validate: the generator's output (unit)

```bash
npx vitest run tests/unit/generateSitemap.spec.js
```

Expected: passes, confirming the entry count, `<loc>` well-formedness, and per-entry alternates
described in [contracts/sitemap-contract.md](./contracts/sitemap-contract.md).

## Validate: the generated file, manually

```bash
node scripts/generate-sitemap.mjs
cat public/sitemap.xml
```

Confirm:
1. The root element is `<urlset>` with the `xhtml` namespace.
2. There are 24 `<url>` entries (3 page kinds × 3 locales + 5 language slugs × 3 locales, as of this
   writing — see [data-model.md](./data-model.md)).
3. Each entry has 4 `<xhtml:link rel="alternate">` children (`pt-BR`, `en`, `es`, `x-default`).
4. No `<priority>`, `<changefreq>`, or `<lastmod>` elements appear anywhere.

Then delete the file (`rm public/sitemap.xml`) — it's a build artifact, not meant to be committed
(research.md §2).

## Validate: build output

```bash
npm run build
ls dist/sitemap.xml
```

`dist/sitemap.xml` MUST exist after the build (the `prebuild` npm script runs
`scripts/generate-sitemap.mjs` automatically before `vite build`, writing into `public/` so Vite's
existing `public/` → `dist/` passthrough picks it up — the same mechanism already verified for
`.htaccess`, `robots.txt`, and `llms.txt`).

## Validate: `robots.txt` references the sitemap

```bash
npx playwright test tests/e2e/static-files.spec.js
```

Expected: passes, including the new assertion that `robots.txt` contains
`Sitemap: https://helloworld.valdir.dev.br/sitemap.xml`.

## Validate: every listed address is real (spot check)

```bash
npm run build && npm run preview
```

Open a handful of addresses from `dist/sitemap.xml` (at least one of each page kind, in at least two
locales) in a browser and confirm each returns real page content, not an error (FR-007).

## Validate: the report itself (SC-003)

Once deployed, re-run the same class of search-engine technical audit already used to validate this
project's `robots.txt`/`llms.txt` work (e.g., PageSpeed Insights / Search Console) and confirm no
sitemap-related error or warning appears.

## Automated checks

```bash
npm run lint
npx vitest run
npx playwright test
npm run build
```

Expected: 0 lint errors; all existing unit/e2e tests still pass; the new
`tests/unit/generateSitemap.spec.js` passes; the updated `tests/e2e/static-files.spec.js` passes; the
production build succeeds with `dist/sitemap.xml` present.
