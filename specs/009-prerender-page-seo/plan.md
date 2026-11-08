# Implementation Plan: Pre-rendered Pages with Per-Page SEO

**Branch**: `009-prerender-page-seo` (spec directory; work happens on `main`) | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-prerender-page-seo/spec.md`

## Summary

The SPA is pre-rendered at build time with **vite-ssg** into one flat HTML file per locale × page.
That is 39 today, plus the root chooser and 4 language-specific not-found documents. Every file
already contains the page's content, `<html lang>`, title, description, canonical/hreflang, Open
Graph/Twitter tags and JSON-LD, and then hydrates into the same interactive app. Head tags move from
`document` manipulation (`useLocaleSeoTags`) to `@unhead/vue` driven by a pure `buildPageHead()`.
A single **page catalog** module feeds the prerender list, the sitemap (now with git-based
`<lastmod>`) and hreflang. `.htaccess` changes so that clean URLs serve the flat files with 200,
trailing slashes 301 to the canonical form, and anything else answers a real 404 with the right
language's page. Home cards get a "See all {Language} examples" link. A `verify-build` step inside
`npm run build` blocks deploy if the output is incomplete or inconsistent.

## Technical Context

**Language/Version**: JavaScript (ES modules), Node 20.19 (CI `node-version: '20'`)

**Primary Dependencies**: Vue 3.5, vue-router 4.6, vue-i18n 9.14, Vite 5.4, markdown-it 14. **New**:
`vite-ssg ^28.3.0`, `@unhead/vue ^2` (the major version vite-ssg 28 uses)

**Storage**: N/A (content in `content/*.md`; output is static files)

**Testing**: Vitest + @vue/test-utils (jsdom), with coverage through the new devDependency
`@vitest/coverage-v8@1.6.1`; Playwright (new `prerendered` project next to
`dev`); new `scripts/verify-build.mjs` that checks `dist/` (uses jsdom)

**Target Platform**: Static files on Apache 2.4 (shared hosting, `.htaccess`; rewrite rules need
`AllowOverride FileInfo`, while the per-language 404 `<If>` blocks need `AllowOverride All`, to be
confirmed with the host), behind Cloudflare; evergreen browsers

**Project Type**: Static multi-language website (Vue SPA + build-time pre-rendering)

**Performance Goals**: Each HTML file ≤ 100 KB; initial JS grows ≤ 15 KB gzip; PageSpeed mobile and
desktop ≥ the production baseline recorded in quickstart §0; content visible before JS loads (LCP
from HTML)

**Constraints**: No backend, Node server or database in production; the deploy pipeline keeps its
stages (only the build command and checkout `fetch-depth: 0` change); no browser APIs during the
build; `.htaccess` changes limited to real 404s and trailing-slash/clean URLs; visual design
unchanged

**Scale/Scope**: 3 locales × (3 fixed pages + 10 languages) = 39 indexable pages + 5 non-indexed
documents; around 25 files touched or added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Code Quality | Lint stays blocking; each new module has one job (`pageCatalog`, `buildPageHead`, `usePageHead`, `getLastModified`, `verify-build`); follows existing naming and the JSDoc comment style | ✅ Pass |
| II. Testing (non-negotiable) | Unit tests for the catalog, head builder, sitemap `lastmod`, router, card link, NotFound/Root pages; E2E `prerendered` project (no-JS content, hydration, interactions); `verify-build` fails the build on bad output; existing tests changed only for intended behavior (soft-404 → 404, no redirect for addresses without a locale, card link); coverage ratchet: `@vitest/coverage-v8` added, baseline measured before any change (T003) and compared at the end (T059), so no percentage may drop | ✅ Pass |
| III. UX Consistency | New links reuse the existing link style and keys (`languageDetail.backToList`); all strings translated ×3; keyboard-focusable `<a>` elements; the expand/collapse behavior is kept; the intended behavior change (paths without a locale → 404) is recorded in the spec's Clarifications | ✅ Pass |
| IV. Performance | Budget stated (Performance Goals); measured: baseline PageSpeed before, bundle size from build output before/after, HTML size enforced by `verify-build` | ✅ Pass |
| Quality Gates / Workflow | CI order unchanged; build failure blocks the FTP upload; spec → clarify → plan followed | ✅ Pass |

No violations, so Complexity Tracking stays empty.

**Post-design re-check (after Phase 1)**: Still passes. The design adds two runtime dependencies,
both justified in [research.md](./research.md) §1–2 against simpler alternatives. It adds no new
pipeline stage, no server code and no new visual pattern.

## Project Structure

### Documentation (this feature)

```text
specs/009-prerender-page-seo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── seo-head-contract.md
│   ├── htaccess-contract.md
│   └── routes-and-output-contract.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
index.html                         # drop the hard-coded title/description (unhead injects them)
vite.config.js                     # ssgOptions (flat, includedRoutes from the catalog) + lastmod virtual-module plugin
package.json                       # build: "vite-ssg build && node scripts/verify-build.mjs"; new deps
.github/workflows/deploy.yml       # checkout: fetch-depth: 0 (only change)
public/
├── .htaccess                      # rewritten per contracts/htaccess-contract.md
├── og-image.png                   # new, 1200×630
├── favicon.ico, favicon.svg, apple-touch-icon.png   # new
design/
├── og-image.svg, favicon.svg      # new: sources for the brand assets
scripts/
├── generate-sitemap.mjs           # uses pageCatalog + lastmod
├── verify-build.mjs               # new: dist/ checks
├── render-brand-assets.mjs        # new, one-off: SVG → PNG/ICO via Playwright
└── lib/getLastModified.mjs        # new: git log -1 --format=%cs
src/
├── main.js                        # export createApp = ViteSSG(App, { routes }, setup)
├── App.vue                        # usePageHead() instead of useLocaleSeoTags()
├── router/index.js                # export routes; root + not-found routes; no global redirect guard
├── i18n/index.js                  # createSiteI18n() factory (one per app instance)
├── i18n/locales/{en,pt-BR,es}.js  # seo.*, languageCard.seeAll, notFound.*, root.*
├── seo/
│   ├── pageCatalog.js             # new: PAGE_KINDS, SITE_ORIGIN, buildPageCatalog()
│   └── buildPageHead.js           # new: pure head builder
├── composables/
│   ├── usePageHead.js             # new (replaces useLocaleSeoTags.js, which is deleted)
│   └── useLocale.js               # locale falls back to 'en'; browser reads stay client-only
├── build/generateSitemap.js       # adds <lastmod>
├── components/language/LanguageCard.vue   # "See all {name} examples" link (showPageLink prop)
└── pages/
    ├── LanguageDetailPage.vue     # back link; unknown slug → NotFoundPage
    ├── NotFoundPage.vue           # new
    └── RootPage.vue               # new
tests/
├── unit/  pageCatalog.spec.js, buildPageHead.spec.js, NotFoundPage.spec.js, RootPage.spec.js (new);
│          generateSitemap, router, LanguageCard, locales, useLocale specs updated;
│          useLocaleSeoTags.spec.js replaced by usePageHead.spec.js
└── e2e/   prerendered.spec.js (new, runs in the `prerendered` project);
           locale-routing/locale-detection updated (no redirect for addresses without a locale; root chooser)
playwright.config.js               # projects: dev (vite dev :4173) + prerendered (build + vite preview :4174)
```

**Structure Decision**: Keep the existing single-project layout. SEO logic that has to run in both
Node and the browser goes into a new `src/seo/` folder of pure modules. Node-only build helpers
stay in `scripts/`. This follows the feature 007 split (`src/build/` pure function + `scripts/`
CLI).

## Implementation Order (for /speckit-tasks)

1. **Foundation**:
   - add vite-ssg and @unhead/vue;
   - `createSiteI18n` factory;
   - `routes` export and the `ViteSSG` entry, with the build still producing a working SPA;
   - `pageCatalog` + tests.
2. **US1 + US2 (P1)**:
   - `includedRoutes` from the catalog;
   - `buildPageHead`/`usePageHead` (title, description, lang, canonical, hreflang);
   - SSR-safe `useLocale`;
   - `verify-build` (file set, lang, titles, canonical);
   - `prerendered` E2E project.
3. **US3 (P2)**: card link and back link, plus i18n keys and tests.
4. **US4 (P2)**: OG/Twitter, JSON-LD, brand assets (image + favicon), `lastmod` virtual module for
   `dateModified`.
5. **US5 (P3)**:
   - Root/NotFound pages and routes, with the global guard removed;
   - `.htaccess`;
   - sitemap `<lastmod>` + `fetch-depth: 0`;
   - update the E2E tests affected by the behavior change;
   - Docker httpd check.
6. **Polish**:
   - bundle/PageSpeed measurement against the baseline;
   - README/CONTRIBUTING notes (a new language now also produces pages);
   - quickstart §5–6 after deploy.

## Risks

| Risk | Mitigation |
|---|---|
| The host grants only `AllowOverride FileInfo`, so `<If>` makes the whole site answer 500; or Apache orders mod_dir before mod_rewrite | Confirm the AllowOverride level with the host before the first US5 deploy. Docker httpd check with `All` and with `FileInfo` (quickstart §4); production curl right after the deploy. Fallback: delete the `<If>` blocks and keep a single English `ErrorDocument`; the 404 status is unaffected (htaccess-contract.md, Constraints). This is the FR-022 hosting exception accepted in the spec |
| Hydration mismatch (locale, expanded state, root redirect) | Per-instance i18n; redirect only in `onMounted`; the `prerendered` E2E project fails on Vue hydration warnings in the console |
| Concurrent SSG rendering leaks state between routes | No module-level mutable state in render paths (i18n factory; the language list stays read-only) |
| `vite preview` does not resolve `/pt-BR` to `pt-BR.html` when `dist/pt-BR/` also exists | T016 checks it first; fallback is a minimal `scripts/serve-dist.mjs` static server for the `prerendered` E2E project |
| Cloudflare caches old `200` soft-404 responses | Purge after the first deploy (manual, outside this scope; noted in the quickstart) |

## Complexity Tracking

No Constitution violations to justify.
