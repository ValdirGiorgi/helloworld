# Research: Pre-rendered Pages with Per-Page SEO

Facts checked against the repo and the npm registry on 2026-11-07: Node 20.19.2 locally (CI uses
`node-version: '20'`), Vite 5.4.21, Vue 3.5.42, vue-router 4.6.4, vue-i18n 9.14.5. E2E tests run
against the Vite dev server (`playwright.config.js`). `.htaccess` lives in `public/` and is copied to
`dist/` as-is.

## 1. Pre-rendering mechanism

**Decision**: `vite-ssg` `^28.3.0`, building with `vite-ssg build` instead of `vite build`. The app
entry (`src/main.js`) exports `createApp = ViteSSG(App, { routes }, setup)`. The list of routes to
render comes from `ssgOptions.includedRoutes`, which returns the paths from the page catalog
(§3). Output uses `dirStyle: 'flat'` (the default): `/pt-BR/languages/rust` →
`dist/pt-BR/languages/rust.html`, `/` → `dist/index.html`.

**Rationale**: vite-ssg 28.3.0 lists `vite ^5`, `vue ^3.2.10` and `vue-router ^4` as peers, so it
fits the current stack without upgrades. It renders each route with Vue's own server renderer and
then hydrates the same app on the client, so the existing components, router and i18n keep working
as an SPA after load (FR-005). Dev mode (`vite`) is unchanged, so the existing E2E suite keeps
running against the dev server. Flat output (rather than `rust/index.html`) is what lets the
address without a trailing slash answer 200 directly (FR-007, §5).

**Alternatives considered**:
- *Nuxt (static generation)*: Rejected. It would mean rewriting routing, i18n, entry and folder
  layout for a 13-page-type site; vite-ssg covers every requirement with a much smaller change.
- *Headless-browser prerender plugin (Puppeteer/Playwright snapshot)*: Rejected. It captures the
  DOM after the scripts run, so it does not hydrate cleanly (the client re-renders over it), and it
  needs a browser during the build.
- *Own SSR script with `vue/server-renderer`*: Rejected. It would mean writing and maintaining
  route iteration, head injection and asset-manifest handling ourselves. vite-ssg already does
  exactly that.

## 2. Head management (title, meta, links, JSON-LD, `<html lang>`)

**Decision**: `@unhead/vue` `^2` (the same major version vite-ssg 28 depends on and installs into
the app automatically). A new composable `usePageHead()` (replaces `useLocaleSeoTags`) calls
`useHead()` with the output of a **pure** function `buildPageHead({ page, t, languageName,
lastmod })`. That function returns title, meta, links, `htmlAttrs.lang` and JSON-LD scripts, and
uses only the page catalog's absolute URLs, never `window.location`.

**Rationale**: `useHead` is rendered into the HTML during SSG and also updated reactively during
client navigation (FR-011, FR-012). Keeping the head content in a pure function makes it
unit-testable without a DOM and satisfies FR-030. Unhead v3 requires Vite ≥ 6 and would duplicate
the copy vite-ssg already ships, so v2 it is.

**Alternatives considered**:
- *Keep `useLocaleSeoTags` (direct `document` manipulation)*: Rejected. `document` does not exist
  during the build, so the generated HTML would have no head tags.
- *Static `<head>` per route written by a post-build script*: Rejected. It would make a second
  source of truth for titles, and client-side navigation would still need the composable.

## 3. Single source of page data (FR-002, FR-013)

**Decision**: A pure module `src/seo/pageCatalog.js` exports `PAGE_KINDS` (moved from
`scripts/generate-sitemap.mjs`), `SITE_ORIGIN` and `buildPageCatalog({ locales, languageSlugs })`.
That function returns every indexable page with its absolute URL and alternates (see
[data-model.md](./data-model.md)). Three consumers use it:
`vite.config.js` (`includedRoutes`), `scripts/generate-sitemap.mjs` (sitemap) and `usePageHead`
(canonical/alternates). Language slugs come from `content/languages/*.md`: in Node by reading the
directory, in the app through the existing `useLanguages()` glob. Both use the same slug rule as
`parseLanguageFile`.

**Rationale**: The sitemap already derives its list this way (feature 007). Lifting it into a shared
module lets the prerender list, the sitemap and hreflang come from the same function. A unit test
checks that every catalog path resolves to its named route rather than to the not-found route, so
the router cannot drift away from the catalog.

**Alternatives considered**: *Derive the catalog from the router's route records*: Rejected. The
routes use regex params (`:locale(pt-BR|en|es)`) and lazy imports, so expanding them would need
the Vue app loaded in a Node script. The feature 007 research reached the same conclusion.

## 4. i18n and routing under SSG

**Decision**:
- The i18n instance is created **per app instance** (`createSiteI18n()` called inside the vite-ssg
  setup function), not as a module-level singleton. The router sets its locale in a per-instance
  `beforeEach`.
- `src/router/index.js` exports `routes` (vite-ssg creates the router). It drops the global
  no-locale redirect guard and adds:
  - `/` → `RootPage`: links to the three homes. On the client only (`onMounted`), it
    `router.replace`s to `resolveInitialLocale()`.
  - `/:locale(pt-BR|en|es)/:pathMatch(.*)*` → `NotFoundPage` in that locale.
  - `/:pathMatch(.*)*` → `NotFoundPage` in English.
  - `LanguageDetailPage` with an unknown slug renders `NotFoundPage`.
- Browser-only reads (`localStorage`, `navigator`) run only in client hooks (`onMounted`) or
  behind `import.meta.env.SSR` checks.

**Rationale**: vite-ssg renders routes **concurrently** in one Node process. A shared i18n singleton
would leak one route's language into another's HTML. Running the root redirect in `onMounted`
(instead of a router guard before mount) keeps hydration matching: the HTML for `/` is the
chooser page, and the client hydrates the same chooser and then navigates. The not-found routes
render identical markup whether reached through the server 404 document or through client
navigation, so hydrating a 404 response does not mismatch.

**Alternatives considered**: *Keep the redirect guard client-side only*: Rejected. Redirecting
during the initial navigation means the client renders `/{locale}` over HTML rendered for `/`,
which produces a hydration mismatch.

## 5. Apache rules: clean URLs, trailing slash, real 404 per language

**Decision**: Rewrite `public/.htaccess` (full contract in
[contracts/htaccess-contract.md](./contracts/htaccess-contract.md)):
1. Trailing slash on anything but `/` → `301` to the form without the slash.
2. Direct requests for the not-found documents (`/404`, `/{locale}/404`, with or without `.html`)
   → 404, so they are never indexable at 200. These rules apply only to the original request
   (`REDIRECT_STATUS` empty), so `ErrorDocument` can still serve them internally.
3. If `{path}.html` exists → internal rewrite to it (200, no redirect).
4. Anything else that is not a regular file → `R=404`. This includes bare directories such as
   `/pt-BR/languages`, which avoids a `mod_dir` slash redirect loop.
5. `ErrorDocument 404 /404.html`, overridden inside `<If>` blocks per locale prefix
   (`/pt-BR/404.html`, `/en/404.html`, `/es/404.html`).

**Rationale**: Existing files keep priority (FR-023). mod_rewrite's per-directory fixup runs before
mod_dir's `DirectorySlash` fixup, so `/pt-BR` is rewritten to `pt-BR.html` before mod_dir can add
a slash, even though `dist/pt-BR/` is a directory. The mod_rewrite rules (1–5) and `ErrorDocument`
only need `AllowOverride FileInfo`. The `<If>` blocks in rule 6 need `AllowOverride All` (Apache
core docs list `Override: All` for `<If>`), which is the usual setting on shared hosting. If the
host only grants `FileInfo`, any `<If>` in `.htaccess` makes the whole site answer 500. The
fallback is a single `ErrorDocument 404 /404.html` (English) without `<If>`: the 404 status is
unaffected, and only the language of the not-found page stops following the URL. The owner
accepted this as an explicit exception to FR-022 (spec Assumptions). `DirectorySlash
Off` is avoided for the same reason: it needs `AllowOverride Indexes`.

**Correction found during T022 (2026-11-07, httpd 2.4.69 container)**: the assumption above that
mod_rewrite's per-directory rule wins over mod_dir's `DirectorySlash` is wrong. In `.htaccess`,
mod_rewrite skips any address that maps to a directory without a trailing slash, and even with
`RewriteOptions AllowNoSlash` (the trace shows the internal rewrite to `/pt-BR.html`) mod_dir
still answers `/pt-BR` with a 301 to `/pt-BR/`, which rule 1 sends back: a redirect loop for the
three homes. `DirectoryCheckHandler On` does not help. What works, and is the combination the
Apache docs give for `AllowNoSlash`, is `DirectorySlash Off` + `RewriteOptions AllowNoSlash` at
the top of the file. `DirectorySlash` needs `AllowOverride Indexes` (with only `FileInfo`, the
whole site answers 500; with `FileInfo Indexes` every US1 row is correct). Consequences:
- the production host must grant at least `FileInfo Indexes`, and `All` for the per-language
  `<If>` blocks;
- the "FileInfo-only" fallback in the htaccess contract no longer exists for this output layout:
  on such a host the homes cannot be served at `/pt-BR` without `/pt-BR/` also being a
  directory. That case would need a different output layout (subpages stored outside a folder
  named after the locale), which is out of scope until the hosting level is confirmed.

**T056 results (2026-11-07, httpd 2.4.69 container serving the US5 `dist/`)**:
- `AllowOverride All`: every row of the "Expected responses" table in the htaccess contract
  matches, including the 404 body language (`/pt-BR/languages/xyz` → `lang="pt-BR"`,
  `/es/languages/cobol` → `lang="es"`, `/history`, `/fr/about`, `/pt-br` → `lang="en"`), direct
  `/pt-BR/404` and `/404.html` → 404, `/favicon.ico` → 200 `image/x-icon`, a missing
  `/assets/*.js` → 404.
- `AllowOverride FileInfo`: 500 for the whole site, with or without the `<If>` blocks
  (`DirectorySlash` alone is enough to trigger it).
- `AllowOverride FileInfo Indexes` with the `<If>` blocks deleted: the table matches, with every
  404 body in English (the accepted FR-022 hosting exception).
- **Production AllowOverride level: not yet confirmed.** The site owner checks it with the hosting
  panel or support before the first US5 deploy: `All` → ship as is; `FileInfo Indexes` → delete
  the three `<If>` blocks; `FileInfo` only → the homes cannot work with this layout (see the
  correction above) and the deploy must wait.

**Risk / verification**: The production Apache's module order and AllowOverride cannot be
inspected from the repo. The [quickstart](./quickstart.md) includes a local check against the
official `httpd:2.4` container serving `dist/` with `AllowOverride All`, a second run with
`AllowOverride FileInfo` to see what happens if the host is stricter, and the production `curl`
checks from SC-001/SC-005, all to run on the first deploy. Before the first US5 deploy, check the
hosting panel or support for the AllowOverride level. If it is not `All`, ship the fallback.

**Alternatives considered**: *Directory style (`rust/index.html`)*: Rejected. Apache answers
`/pt-BR/languages/rust` with a 301 to `.../rust/`, which is the opposite of the canonical form
chosen in Clarifications. *A single English 404 page*: Rejected by FR-022.

## 6. `lastmod` source (FR-025)

**Decision**: A Node helper `getLastModified(files)` runs
`git log -1 --format=%cs -- <files>` and falls back to today's date when there is no commit. The
page catalog assigns source files per page kind: language pages use
`content/languages/{slug}.md`; history uses `content/history.{locale}.md` plus
`src/pages/HistoryPage.vue`; home and about use their page component plus
`src/i18n/locales/{locale}.js`. The sitemap script uses it, and a small Vite plugin exposes the
same map to the app as the virtual module `virtual:page-lastmod`, for JSON-LD `dateModified`. In
`.github/workflows/deploy.yml`, the checkout step gets `fetch-depth: 0`.

**Rationale**: This follows the Clarifications answer. Without full history, a shallow clone
would give every file the date of the latest commit. A virtual module avoids committing generated
files and also works in dev and Vitest.

## 7. Share image and favicon

**Decision**: Hand-authored SVG sources in `design/` (`og-image.svg`, `favicon.svg`), rendered
once by a one-off script `scripts/render-brand-assets.mjs`. The script uses the Playwright
Chromium already in devDependencies to screenshot the SVG to PNG, and it wraps a 32 px and a 16 px
PNG in an ICO container (the ICO format allows PNG payloads). The outputs are committed in
`public/`: `og-image.png` (1200 × 630), `favicon.ico`, `favicon.svg` and `apple-touch-icon.png`
(180 × 180).

**Rationale**: No new image dependency (sharp etc.) is needed. The assets change rarely, so they
are committed rather than generated on every build. The colors come from the existing Tailwind
`brand`/`ink` tokens, so the visual design does not change.

## 8. Testing strategy (Constitution II)

**Decision**:
- **Unit (Vitest)**:
  - `pageCatalog` (counts, URLs, alternates, a new slug produces 3 pages);
  - `buildPageHead` (title patterns ×3 locales, canonical/hreflang absolute URLs, OG/Twitter,
    JSON-LD shapes, noindex on not-found/root);
  - `generateSitemap` with `lastmod`;
  - router (catalog paths resolve to named routes, unknown paths go to the not-found route);
  - `LanguageCard` (page link present, text includes the name, clicking it does not toggle);
  - `NotFoundPage`;
  - `RootPage`.
- **Build verification**: `scripts/verify-build.mjs` runs inside `npm run build`, after
  `vite-ssg build`. It parses every HTML file in `dist/` and fails the build if any of these holds:
  - the set of HTML files is not exactly sitemap URLs + `/` + 4 not-found documents;
  - a title is duplicated;
  - `lang`, canonical, alternates or OG tags are missing or wrong;
  - a language page lacks its 9 sections;
  - a not-found or root document lacks `noindex`.

  It parses with `jsdom`, which is already a devDependency (Vitest environment), so no new
  parser is added.
- **E2E (Playwright)**: The existing `dev` project keeps testing interaction. A second project,
  `prerendered`, runs against `vite preview` of the built `dist/`. Vite 5's preview code looks up
  `pathname + ".html"`, but whether that works when a directory with the same name also exists
  (`dist/pt-BR.html` + `dist/pt-BR/`) is **unverified**. T016 checks it first and falls back to a
  minimal `scripts/serve-dist.mjs` static server if it fails.

  **Outcome (T016, 2026-11-07)**: verified. `vite preview` (Vite 5.4.21) serves `/pt-BR` from
  `dist/pt-BR.html` even though `dist/pt-BR/` exists, and `/pt-BR/history` and
  `/pt-BR/languages/rust` from their own flat files (200, each with its own body content; the root
  `index.html` is the empty template). `scripts/serve-dist.mjs` is not needed. Note: `/pt-BR`
  does contain one `println!`, from the Rust card's Hello World on the home page; the language
  page has 8.

  It covers:
  - every page works with JavaScript disabled (content, title, `lang`);
  - hydration with no console errors or warnings;
  - card expand/collapse and the new link;
  - language switch;
  - the root redirect.

  HTTP status codes and redirects are Apache behavior, so they are verified in the quickstart
  (Docker httpd plus production curl), not in Playwright.

**Rationale**: The pipeline keeps its steps (FR-028). `test:e2e` now also builds once for the
prerendered project, and a broken build output fails `npm run build` before the FTP upload.

## 9. Performance budget (Constitution IV)

**Decision / budget**:
- Each generated HTML file ≤ 100 KB uncompressed (a language page is estimated at about 25 KB).
- JS added to the initial bundle by vite-ssg client + unhead ≤ 15 KB gzip.
- PageSpeed mobile and desktop scores ≥ the baseline measured on production before merge, recorded
  in the quickstart.
- LCP should improve, because content arrives in the HTML.

The bundle size is measured from `vite-ssg build` output before and after; `verify-build` enforces
the HTML size limit.
