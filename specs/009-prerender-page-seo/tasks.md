---

description: "Task list for 009-prerender-page-seo"
---

# Tasks: Pre-rendered Pages with Per-Page SEO

**Input**: Design documents from `/specs/009-prerender-page-seo/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. Constitution Principle II (NON-NEGOTIABLE) requires tests for new
functionality, and spec FR-029 requires an automated build-output check.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on
its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story the task belongs to (US1–US5)

## Path Conventions

Single project at the repository root: app code in `src/`, Node build helpers in `scripts/`,
static files in `public/`, tests in `tests/unit/` (Vitest) and `tests/e2e/` (Playwright).

---

## Phase 1: Setup

**Purpose**: Add the dependencies and switch the entry point to vite-ssg while keeping today's
behavior.

- [X] T001 Add `vite-ssg@^28.3.0` and `@unhead/vue@^2` to `dependencies` in `package.json`
  (`npm install vite-ssg@^28.3.0 @unhead/vue@^2`). Do not install @unhead/vue v3, which requires
  Vite ≥ 6 (research.md §2). Also add `@vitest/coverage-v8@1.6.1` to `devDependencies`. It must
  match the installed Vitest 1.6.1 exactly, so it can measure the coverage ratchet required by
  Constitution Principle II. Add the script `"test:coverage": "vitest run --coverage"` and add
  `coverage: { provider: 'v8', include: ['src/**', 'scripts/**'], reporter: ['text-summary'] }`
  to the `test` block in `vite.config.js`. `coverage/` is already gitignored. Commit the updated
  `package-lock.json`.
- [X] T002 Change the `build` script in `package.json` from `vite build` to `vite-ssg build`. Keep
  the `prebuild` sitemap script as it is.
- [ ] T003 Record the baseline numbers before any code change:
  - PageSpeed mobile and desktop for production `/en` and `/pt-BR/languages/rust`, in the §0 table
    of `specs/009-prerender-page-seo/quickstart.md`;
  - the gzip size of the initial JS bundle from the current `vite build` output, added as a note
    under the same table;
  - the unit-test coverage baseline (statements, branches, functions, lines) from
    `npm run test:coverage`. Run it on the current code with only the T001 change applied, before
    T002, and add it as a note under the same table.
  - Status: bundle and coverage baselines recorded. PageSpeed is still open: the public API
    answered "Quota exceeded", so the site owner fills in those rows from pagespeed.web.dev.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: An SSR-safe app with a per-instance i18n, a single page catalog and the lastmod
helper. Every story depends on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Replace the singleton in `src/i18n/index.js` with an exported factory
  `createSiteI18n()` that returns a new `createI18n({ legacy: false, locale: 'en', fallbackLocale:
  'en', messages })` on every call. vite-ssg renders routes concurrently, and a shared instance
  would leak one route's locale into another's HTML (research.md §4). Update every importer of the
  default export (`grep -rn "i18n'" src tests`), including `tests/unit/helpers/testRouter.js` if it
  uses it.
- [X] T005 Refactor `src/router/index.js`:
  - export the `routes` array as a named export instead of creating and exporting a router
    instance;
  - export the no-locale redirect logic as a named function `localeRedirectGuard(to)` (same body as
    today) so `main.js` can register it;
  - keep the routes and the guard's behavior unchanged for now. US5 removes the guard.
  - Update `tests/unit/router.spec.js` and `tests/unit/helpers/testRouter.js` to build their router
    from `routes` and `localeRedirectGuard` with `createRouter({ history: createMemoryHistory(),
    routes })`.
- [X] T006 Rewrite `src/main.js`:
  - `export const createApp = ViteSSG(App, { routes }, ({ app, router, isClient }) => { ... })`;
  - inside the setup callback: `const i18n = createSiteI18n()`, `app.use(i18n)`,
    `router.beforeEach(localeRedirectGuard)`, then
    `router.beforeEach((to) => { if (to.params.locale) i18n.global.locale.value = to.params.locale })`;
  - keep `import './assets/main.css'`;
  - remove the manual `router.isReady().then(() => app.mount('#app'))`, because vite-ssg mounts
    and hydrates.
- [X] T007 Make `src/composables/useLocale.js` safe to run during SSR:
  - `readStoredLocale()` returns `null` when `import.meta.env.SSR` is true or `typeof window ===
    'undefined'`;
  - `detectCountry()` returns `null` when `typeof navigator === 'undefined'`;
  - `useLocale().locale` becomes `computed(() => route.params.locale ?? 'en')` (data-model.md:
    "`en` is the default").

  Add cases to `tests/unit/useLocale.spec.js`: no `window`/`navigator` → `resolveInitialLocale()`
  returns `'en'` without throwing; a route without a `locale` param → `locale.value === 'en'`.
- [X] T008 [P] Create `src/seo/pageCatalog.js`, a pure module with no Vue, DOM or Node imports. It
  exports:
  - `SITE_ORIGIN = 'https://helloworld.valdir.dev.br'`;
  - `OG_LOCALES = { 'pt-BR': 'pt_BR', en: 'en_US', es: 'es_ES' }`;
  - `PAGE_KINDS`, moved from `scripts/generate-sitemap.mjs`, each with:
    - `name` (`'home' | 'history' | 'about' | 'language-detail'`, equal to the vue-router route
      name);
    - `path(locale, slug?)` (no trailing slash);
    - `perSlug`;
    - `sourceFiles(locale, slug?)`:
      - home → `['src/pages/HomePage.vue', 'src/i18n/locales/{locale}.js']`;
      - history → `['src/pages/HistoryPage.vue', 'content/history.{locale}.md']`;
      - about → `['src/pages/AboutPage.vue', 'src/i18n/locales/{locale}.js']`;
      - language-detail → `['content/languages/{slug}.md']`;
    - `jsonLdType` (`'WebSite'` for home, `'TechArticle'` for language-detail, `null` otherwise);
  - `buildPageCatalog({ locales, languageSlugs })`, which returns one `CatalogPage` per locale ×
    page (`{ kind, locale, slug, path, url, alternates }`). `alternates` holds the 3 locales plus
    `x-default` → `en`, all absolute URLs;
  - `findCatalogPage(catalog, path)`.

  Rules (data-model.md): "`path` values are unique; count = `locales.length × (3 +
  languageSlugs.length)`".
- [X] T009 [P] Create `tests/unit/pageCatalog.spec.js`:
  - 3 locales × (3 + 10 slugs) = 39 unique paths;
  - `/pt-BR/languages/rust` has `url` `https://helloworld.valdir.dev.br/pt-BR/languages/rust` and 4
    alternates, with x-default → `/en/languages/rust`;
  - no path ends in `/`;
  - adding a slug adds exactly 3 pages;
  - each path resolved by a router built from `routes` (T005) has `name === kind`.
- [X] T010 [P] Create `scripts/lib/getLastModified.mjs`, which exports
  `getLastModified(files, { cwd })`:
  - runs `git log -1 --format=%cs -- <files...>` through `child_process.execFileSync`;
  - returns `YYYY-MM-DD`;
  - falls back to today's UTC date when the output is empty or git fails.

  Also export `buildLastModMap({ catalog, cwd })`, which returns `{ [path]: 'YYYY-MM-DD' }` using
  each page kind's `sourceFiles`. Create `tests/unit/getLastModified.spec.js` with
  `execFileSync` mocked: a commit date, empty output (fallback), a git error (fallback), and the
  map built per page.
- [X] T011 Update `scripts/generate-sitemap.mjs` to import `PAGE_KINDS`, `SITE_ORIGIN` and
  `buildPageCatalog` from `src/seo/pageCatalog.js` instead of defining them locally. The output must
  stay byte-identical to today's `public/sitemap.xml`; check it with `git diff` after
  `npm run prebuild`. `tests/unit/generateSitemap.spec.js` must still pass.
- [X] T012 Configure `vite.config.js`:
  - add `ssgOptions: { dirStyle: 'flat', formatting: 'none', includedRoutes: () => [...] }`;
  - `includedRoutes` returns the catalog paths, built from `buildPageCatalog({ locales:
    SUPPORTED_CODES, languageSlugs })`;
  - `languageSlugs` comes from reading `content/languages/*.md` with `fs` and the same lowercase
    rule as `slugFromFilename` in `src/content/parseLanguageFile.js`.
- [X] T013 Smoke test the foundation:
  - `npm run build` produces `dist/pt-BR/languages/rust.html` and 38 other catalog files;
  - `npm run dev` still works;
  - `npm run lint`, `npm run test:unit` and `npm run test:e2e` all pass.

  Fix any SSR-only errors (browser globals touched at module scope or in `setup`) before moving
  on.

**Checkpoint**: The app is pre-rendered (content present, head still generic) and behaves as before
in the browser.

---

## Phase 3: User Story 1 — A crawler reads the real content of every page (Priority: P1) 🎯 MVP

**Goal**: Every catalog URL is served as a complete HTML document with its content and the correct
`<html lang>`, and then hydrates into the same interactive app.

**Independent Test**: Run `npm run build`, then request `/pt-BR/languages/rust` with JS disabled. It
has `lang="pt-BR"` and all 9 example sections, including `println!("Hello, World!")`. Search,
expand/collapse and the locale switch still work with JS enabled.

### Tests for User Story 1 ⚠️

- [X] T014 [P] [US1] Create `scripts/verify-build.mjs`. It reads the catalog the same way as T012,
  walks `dist/**/*.html`, parses each file with `jsdom` (already a devDependency) and collects
  every failure before exiting `1` with a list of offending files. Checks in this story:
  - every catalog path has its flat file (`dist{path}.html`);
  - `<html lang>` equals the page locale;
  - the app root (`#app`) is not empty;
  - on language pages, the 9 section labels are present and there are ≥ 9 `<pre>`/code blocks;
  - each file is ≤ 100 KB.

  Export the check functions so they can be unit tested.
- [X] T015 [P] [US1] Create `tests/unit/verifyBuild.spec.js`. It feeds the exported check
  functions small HTML strings:
  - a passing language page;
  - wrong `lang`;
  - an empty `#app`;
  - 8 sections instead of 9;
  - a file over 100 KB.
- [X] T016 [US1] First, verify the assumption in research.md §8. Run `npm run build`, then
  `npx vite preview --port 4174`, and `curl -s -o /dev/null -w '%{http_code}'` the addresses
  `/pt-BR` (both `dist/pt-BR.html` and the directory `dist/pt-BR/` exist), `/pt-BR/history` and
  `/pt-BR/languages/rust`. Each must return 200 with that page's own HTML, not the root
  `index.html`. Check by body content, not by `<title>`/`lang`: until T018 and T026 every file
  still has the template's `lang="en"` and generic title.
  - `/pt-BR/languages/rust` contains `println!`;
  - `/pt-BR/history` contains "A história do Hello World";
  - `/pt-BR` contains "Hello World em Muitas Linguagens" and no `println!`.

  Use `curl -s http://localhost:4174{path} | grep -c '<text>'`.

  If any of them fails, do not use `vite preview`. Add `scripts/serve-dist.mjs` instead: a
  minimal `node:http` static server for `dist/` that maps `/{path}` to `dist/{path}.html` when
  that file exists, serves other existing files as they are, and answers 404 otherwise. Use it as
  the `prerendered` webServer command below, and record the outcome in research.md §8.

  Then add a `prerendered` project to `playwright.config.js`:
  - keep the existing dev server as project `dev`, `baseURL: http://localhost:4173`;
  - add a second `webServer` entry, `command: 'npm run build && npx vite preview --port 4174
    --strictPort'`, `port: 4174`;
  - project `prerendered` uses `testMatch: /prerendered\.spec\.js/` and `baseURL:
    http://localhost:4174`;
  - project `dev` ignores that file (`testIgnore`).
- [X] T017 [US1] Create `tests/e2e/prerendered.spec.js`, US1 block:
  - with `javaScriptEnabled: false`, `/pt-BR/languages/rust` has `html[lang="pt-BR"]`, contains
    `println!("Hello, World!")` and shows 9 example sections;
  - `/es`, `/en/history` and `/pt-BR/about` show their headings with JS disabled;
  - with JS enabled, the console has no `Hydration` warnings or errors on `/pt-BR`, `/en/history`
    and `/es/languages/python`;
  - on `/pt-BR`, typing in the search filters the cards, and "Mostrar mais exemplos" expands a
    card;
  - switching to English goes to `/en` without a full document reload (no new `document` request
    in `page.on('request')`);
  - on `/pt-BR/languages/rust`, switching to English lands on `/en/languages/rust` (the same page
    in the other language, spec Edge Cases), also without a document reload.

### Implementation for User Story 1

- [X] T018 [US1] Create `src/composables/usePageHead.js`, US1 subset. It calls `useHead()` from
  `@unhead/vue` with a reactive function that sets `htmlAttrs: { lang: locale.value }`, using the
  locale from `useLocale()`. Replace `useLocaleSeoTags()` with `usePageHead()` in `src/App.vue`.
  Keep `src/composables/useLocaleSeoTags.js` until T025 so the existing title and description
  still update in the browser.
- [X] T019 [US1] Change `"build"` in `package.json` to `"vite-ssg build && node
  scripts/verify-build.mjs"`.
- [X] T020 [US1] Rewrite `public/.htaccess` with rules 1, 3 and 4 from
  `specs/009-prerender-page-seo/contracts/htaccess-contract.md`:
  - trailing slash → 301 to the form without it;
  - existing files are served as they are;
  - `%{DOCUMENT_ROOT}/$1.html -f` → internal rewrite to `$1.html`.

  As the last rule, keep a temporary SPA fallback **without the `!-d` condition**:
  `RewriteCond %{REQUEST_FILENAME} !-f` → `RewriteRule ^ index.html [L]`. With `!-d` kept, a bare
  directory such as `/pt-BR/languages` would be slash-redirected by `mod_dir` to
  `/pt-BR/languages/`, and rule 1 would send it back, creating a redirect loop. US5 replaces this
  fallback with the 404 rules. Comment every rule the way the current file is commented.
- [X] T021 [US1] Fix any hydration mismatch that T017 reports:
  - check that `LanguageCard` (`startExpanded`), `LanguageSidebar` (`isOpen`) and `HomePage`
    (`query`) render the same on the server and the client;
  - move any read of browser state into `onMounted`.
- [X] T022 [US1] Run `npm run build`, `npm run test:unit` and `npm run test:e2e`, and confirm
  `verify-build` passes for the 39 catalog files. Then run quickstart §4 (Docker `httpd:2.4`
  serving `dist/`) limited to the rules this story adds, before any deploy of the MVP:
  - `/pt-BR` → 200 with `pt-BR.html` (no slash redirect, even though `dist/pt-BR/` exists);
  - `/pt-BR/languages/rust` → 200 with `rust.html`;
  - `/pt-BR/` → 301 to `/pt-BR`;
  - `/pt-BR/languages/rust/` → 301 to `/pt-BR/languages/rust`;
  - `/pt-BR/languages` → 200 with the temporary `index.html` fallback and **no** redirect loop
    (`curl -sL --max-redirs 5` must not fail with "Maximum redirects");
  - `/robots.txt` → 200 with the file.

  If the host-equivalent container misbehaves, fix `public/.htaccess` before moving on.

**Checkpoint**: MVP. Deploying now gives crawlers real content on every catalog URL.

---

## Phase 4: User Story 2 — Each page has its own title and description (Priority: P1)

**Goal**: Unique, per-language titles and descriptions; canonical and hreflang with absolute URLs
in the HTML; tags updated on client navigation.

**Independent Test**: After `npm run build`, every catalog title is unique and follows the
contract, and `/pt-BR/languages/rust` has canonical
`https://helloworld.valdir.dev.br/pt-BR/languages/rust` plus 4 alternates.

### Tests for User Story 2 ⚠️

- [X] T023 [P] [US2] Create `tests/unit/buildPageHead.spec.js` for the pure
  `buildPageHead({ page, t, languageName })`, using the real locale messages:
  - title patterns for language pages in all 3 locales ("Hello World em Rust — exemplos de
    código", "Hello World in Rust — code examples", "Hello World en Rust — ejemplos de código");
  - home, history and about titles per `contracts/seo-head-contract.md`;
  - all 39 catalog titles are unique;
  - canonical equals `page.url`;
  - 4 alternates, x-default → en, all starting with `https://helloworld.valdir.dev.br/`;
  - no `window` access (run with `window` undefined).
- [X] T024 [P] [US2] Extend `scripts/verify-build.mjs` and `tests/unit/verifyBuild.spec.js`:
  - `<title>` is non-empty and unique across catalog files;
  - `meta[name=description]` is non-empty;
  - `link[rel=canonical]` equals the page URL;
  - exactly 4 `link[rel=alternate][hreflang]` (`pt-BR`, `en`, `es`, `x-default`) with absolute
    `https://helloworld.valdir.dev.br/` hrefs;
  - no `localhost` anywhere in the head.

  Add to `tests/e2e/prerendered.spec.js`: navigating client-side from `/en` to
  `/en/languages/rust` changes `document.title` to "Hello World in Rust — code examples" and the
  canonical href to match. Then switching the language to Español changes
  `document.documentElement.lang` to `es`, the title to "Hello World en Rust — ejemplos de
  código" and the canonical to `https://helloworld.valdir.dev.br/es/languages/rust` (FR-012).

### Implementation for User Story 2

- [X] T025 [US2] Add the i18n keys from `contracts/seo-head-contract.md` to
  `src/i18n/locales/en.js`, `src/i18n/locales/pt-BR.js` and `src/i18n/locales/es.js`:
  - `seo.language.title`:
    - pt-BR "Hello World em {name} — exemplos de código"
    - en "Hello World in {name} — code examples"
    - es "Hello World en {name} — ejemplos de código"
  - `seo.language.description`, `seo.history.description` and `seo.about.description`, translated
    ×3. The history description must reflect what `content/history.{locale}.md` actually says.

  Keep `tests/unit/locales.spec.js` key-parity passing.
- [X] T026 [US2] Create `src/seo/buildPageHead.js`, a pure function
  `buildPageHead({ page, t, languageName })`. It returns `{ htmlAttrs, title, meta, link }`:
  - titles: home `t('header.title')`; history `` `${t('history.title')} — ${t('header.title')}` ``;
    about `` `${t('about.title')} — ${t('header.title')}` ``; language
    `t('seo.language.title', { name: languageName })`;
  - matching descriptions;
  - `link`: canonical (`page.url`) and alternates (`page.alternates`).

  Use unhead `key`s (`'canonical'`, `'alternate-{hreflang}'`, `'description'`) so client
  navigation replaces tags instead of piling them up.
- [X] T027 [US2] Complete `src/composables/usePageHead.js`:
  - resolve the current `CatalogPage` with `buildPageCatalog` + `findCatalogPage(route.path)`,
    using the slugs from `useLanguages()`;
  - get `languageName` from `findBySlug`;
  - pass `buildPageHead(...)` to `useHead` as a computed.

  Delete `src/composables/useLocaleSeoTags.js` and replace `tests/unit/useLocaleSeoTags.spec.js`
  with `tests/unit/usePageHead.spec.js`: it mounts with a test router and `createHead()` and checks
  the head entries for `/pt-BR/languages/rust` and that they update after `router.push('/en')`.
- [X] T028 [US2] Remove the hard-coded `<title>` and `<meta name="description">` from `index.html`
  (unhead injects them). Keep `charset` and `viewport`.
- [X] T029 [US2] Run `npm run build` (verify-build green), `npm run test:unit` and
  `npm run test:e2e`.

**Checkpoint**: US1 + US2 make up the full P1 scope; search snippets now differ per page.

---

## Phase 5: User Story 3 — Language pages receive internal links (Priority: P2)

**Goal**: Each home card links to its language page with a translated text link; each language page
links back home. Expand/collapse keeps working.

**Independent Test**: On `/pt-BR` with JS disabled there are 10 `a[href^="/pt-BR/languages/"]`
whose text is "Ver todos os exemplos de {Linguagem}". On `/pt-BR/languages/rust` there is an
`a[href="/pt-BR"]`.

### Tests for User Story 3 ⚠️

- [X] T030 [P] [US3] Extend `tests/unit/LanguageCard.spec.js`:
  - with the default `showPageLink`, an `<a>` with `href` `/en/languages/{slug}` and text
    "See all {name} examples" is present both collapsed and expanded;
  - clicking it does not toggle `isExpanded`;
  - clicking "Show more examples" does not navigate;
  - with `showPageLink: false` there is no link.

  Create `tests/unit/LanguageDetailPage.spec.js`: for a known slug, the back link points to
  `/{locale}` with the text from `languageDetail.backToList`, and the card has no "See all …"
  link.
- [X] T031 [P] [US3] Extend `scripts/verify-build.mjs` (+ unit cases):
  - each home file has one `a[href="/{locale}/languages/{slug}"]` per language;
  - each language file has `a[href="/{locale}"]`.

  Add to `tests/e2e/prerendered.spec.js`: clicking "See all Rust examples" on `/en` opens
  `/en/languages/rust` without a document reload, and "Show more examples" still expands in place.

### Implementation for User Story 3

- [X] T032 [US3] Add `languageCard.seeAll` to all three locale files:
  - pt-BR "Ver todos os exemplos de {name}"
  - en "See all {name} examples"
  - es "Ver todos los ejemplos de {name}"
- [X] T033 [US3] In `src/components/language/LanguageCard.vue`:
  - add the prop `showPageLink` (Boolean, default `true`);
  - when true, render after the `ExpandableSection` block, outside it, so it shows whether the
    card is collapsed or expanded:
    `<router-link :to="{ name: 'language-detail', params: { locale, slug: entry.slug } }"
    :data-testid="`language-page-link-${entry.slug}`" class="...">{{ t('languageCard.seeAll',
    { name: entry.name }) }}</router-link>`;
  - reuse the existing link classes (`text-sm font-medium text-brand-700 hover:underline` plus the
    `focus-visible` ring used in `ExpandableSection.vue`);
  - keep the title (`h2`) as plain text.
- [X] T034 [US3] In `src/pages/LanguageDetailPage.vue`:
  - pass `:show-page-link="false"` to `LanguageCard`;
  - add above it a `router-link` to `{ name: 'home', params: { locale } }` with the content
    `<span aria-hidden="true">←</span> {{ t('languageDetail.backToList') }}` and the same link
    classes. The arrow is hidden from screen readers so the accessible name is just "Back to the
    list" (Constitution III).
- [X] T035 [US3] Update any existing E2E selectors in `tests/e2e/browse-and-expand.spec.js` and
  `tests/e2e/sidebar-navigation.spec.js` that broke because of the new link (only where behavior
  changed on purpose). Run the full test suite.

**Checkpoint**: Language pages are no longer orphans.

---

## Phase 6: User Story 4 — Rich link previews and structured data (Priority: P2)

**Goal**: OG/Twitter tags, a default share image, `WebSite` and `TechArticle` JSON-LD, and a real
favicon.

**Independent Test**: After the build, `/es/languages/python` has every OG/Twitter tag from the
contract with an absolute `og:image`. `/en` has `WebSite` JSON-LD and the language page has
`TechArticle`. `dist/favicon.ico` is a real ICO.

### Tests for User Story 4 ⚠️

- [X] T036 [P] [US4] Extend `tests/unit/buildPageHead.spec.js`:
  - `og:title`/`og:description`/`og:url` equal the title/description/canonical;
  - `og:type` is `website` on home (and, after T051, root and not-found) and `article` on
    history, about and language pages;
  - `og:locale` is `pt_BR`/`en_US`/`es_ES` with the other two as `og:locale:alternate`;
  - `og:image` is `https://helloworld.valdir.dev.br/og-image.png` with width 1200, height 630 and
    alt;
  - `twitter:card` is `summary_large_image` with title, description and image;
  - the home JSON-LD parses to `@type: WebSite` with `name`, `url`, `inLanguage`, `description`;
  - the language JSON-LD parses to `@type: TechArticle` with `headline`, `inLanguage`, `url`,
    `dateModified`, `image`, `author.name: "Valdir Giorgi"` and `about.name`;
  - a `<` in content is serialized as `<`;
  - icon links are present.
- [X] T037 [P] [US4] Extend `scripts/verify-build.mjs` (+ unit cases):
  - every catalog file has `og:title`, `og:description`, `og:url`, `og:locale`, `og:type`,
    `og:image` and `twitter:card`;
  - `og:url` equals the canonical;
  - home files have parseable `WebSite` JSON-LD with non-empty `name`, `url` and `inLanguage`;
  - language files have parseable `TechArticle` JSON-LD with non-empty `headline`, `image`,
    `author.name`, `dateModified` (matching `^\d{4}-\d{2}-\d{2}$`), `inLanguage` (equal to the page
    locale) and `url` (equal to the canonical). These are the fields the Rich Results and Schema
    validators flag as missing, so FR-019 is enforced automatically and not only by the manual
    check in T042/T062;
  - `dist/og-image.png`, `dist/favicon.ico` and `dist/favicon.svg` exist.

  Add to `tests/e2e/static-files.spec.js`: `/favicon.ico` returns 200 with an `image/` content
  type and a body that is not HTML.

### Implementation for User Story 4

- [X] T038 [P] [US4] Create `design/og-image.svg` (1200 × 630) and `design/favicon.svg`:
  - the site name "Hello World in Many Languages";
  - a `<>`/code motif;
  - colors from the existing Tailwind `brand`/`ink` tokens in `tailwind.config.js`;
  - no new visual pattern.
- [X] T039 [US4] Create `scripts/render-brand-assets.mjs`, a one-off script run with `node`. It
  uses Playwright Chromium (already a devDependency) to screenshot the SVGs into:
  - `public/og-image.png` (1200×630);
  - `public/apple-touch-icon.png` (180×180);
  - 32×32 and 16×16 PNGs, wrapped in an ICO container (PNG payloads) written to
    `public/favicon.ico`.

  It also copies `design/favicon.svg` to `public/favicon.svg`. Run it once and commit the
  generated files.
- [X] T040 [US4] Add a Vite plugin in `vite.config.js` that exposes the virtual module
  `virtual:page-lastmod` (`export default { [path]: 'YYYY-MM-DD' }`), built with
  `buildLastModMap` from `scripts/lib/getLastModified.mjs` (T010). Make sure `npm run lint`
  passes with the `import lastmod from 'virtual:page-lastmod'` in `usePageHead.js` (the project
  is plain JS with `eslint-plugin-vue`, so no type declaration is needed). If a rule flags the
  unresolved import, disable it for that one line with an explanatory comment (Constitution
  Principle I). In `tests/unit/usePageHead.spec.js`, mock the module with
  `vi.mock('virtual:page-lastmod', () => ({ default: { '/pt-BR/languages/rust': '2026-01-01' } }))`
  so unit tests don't run git.
- [X] T041 [US4] Extend `src/seo/buildPageHead.js` (and the `lastmod` argument passed by
  `usePageHead.js` from `virtual:page-lastmod`):
  - OG/Twitter meta, `og:site_name`, `og:image` + `:width`/`:height`/`:alt`;
  - icon links (`/favicon.ico` sizes 32x32, `/favicon.svg` type image/svg+xml,
    `/apple-touch-icon.png`);
  - one `script` with `type: 'application/ld+json'`, by the page kind's `jsonLdType`, following
    the shapes in `contracts/seo-head-contract.md`.

  Serialize with `JSON.stringify(...).replace(/</g, '\\u003c')`.

  When `virtual:page-lastmod` has no entry for the path (e.g. a language file added while the dev
  server is running, as the `contribute-language` E2E does), `dateModified` falls back to today's
  UTC date (`YYYY-MM-DD`), so it is never empty or `undefined`. Add a case to
  `tests/unit/buildPageHead.spec.js`: `lastmod` undefined → `dateModified` matches
  `^\d{4}-\d{2}-\d{2}$`.
- [X] T042 [US4] Run `npm run build`, `npm run test:unit` and `npm run test:e2e`. Paste one built
  `dist/pt-BR/languages/rust.html` head into the Schema Markup Validator (validator.schema.org) to
  check the JSON-LD shape before deploy.
  - Done locally: the built head was inspected and `verify-build` checks the TechArticle fields.
    The validator paste itself was left to the site owner (it submits a form to an external
    site); T062 runs the validators after deploy.

**Checkpoint**: Shared links show a proper preview, and the site has an icon.

---

## Phase 7: User Story 5 — Non-existent addresses and the root address (Priority: P3)

**Goal**:
- real 404 in the address's language;
- the root `/` gets a chooser page and keeps the redirect;
- addresses without a locale are no longer redirected (Clarifications);
- the sitemap carries `<lastmod>`.

**Independent Test**: With the Docker httpd check (quickstart §4), `/pt-BR/nao-existe` →
404 with `lang="pt-BR"`, `/history` → 404 in English, `/pt-BR/` → 301 to `/pt-BR`, and `/` shows
3 language links. `dist/sitemap.xml` has `<lastmod>` on every URL.

### Tests for User Story 5 ⚠️

- [X] T043 [P] [US5] Update `tests/unit/router.spec.js`:
  - `/` resolves to `root`;
  - `/pt-BR/nao-existe` resolves to `not-found-locale` with `locale: 'pt-BR'`;
  - `/history` and `/fr/about` resolve to `not-found` (no redirect);
  - catalog paths still resolve to their kinds.

  Create `tests/unit/NotFoundPage.spec.js`:
  - pt-BR text and a link to `/pt-BR` under a locale route;
  - English text and links to `/pt-BR`, `/en`, `/es` without a locale.

  Create `tests/unit/RootPage.spec.js`:
  - renders 3 links;
  - after mount calls `router.replace` with the stored preference (`site-locale` in
    localStorage), or with the country rule when nothing is stored.
- [X] T044 [P] [US5] Update `tests/unit/generateSitemap.spec.js`: every `<url>` has
  `<lastmod>YYYY-MM-DD</lastmod>` taken from the passed `lastmodByPath` map, and the root and 404
  paths are absent.
- [X] T045 [P] [US5] Extend `scripts/verify-build.mjs` (+ unit cases):
  - the set of HTML files equals the catalog + `index.html` + `404.html` + `{pt-BR,en,es}/404.html`
    exactly (44 today; extras or missing files fail);
  - root and not-found files have `meta[name=robots]` containing `noindex`, and no canonical,
    `og:url`, alternates or JSON-LD;
  - `dist/sitemap.xml` lists exactly the catalog URLs, each with a `<lastmod>` matching
    `^\d{4}-\d{2}-\d{2}$`.
- [X] T046 [US5] Update `tests/e2e/locale-routing.spec.js` and
  `tests/e2e/locale-detection.spec.js` for the intended behavior change:
  - the bare-root redirect tests (stored preference, country rule) stay and must pass;
  - tests that expected a non-root address without a locale to redirect now expect the English
    not-found page with links to the 3 homes.

  Add to `tests/e2e/prerendered.spec.js`:
  - `/` with JS disabled shows links to `/pt-BR`, `/en`, `/es`;
  - with JS enabled and `locale: 'pt-BR'` + a BR region, it lands on `/pt-BR`;
  - `/pt-BR/languages/xyz` shows the Portuguese not-found text (status is Apache's job, quickstart
    §4);
  - hydration check: load the built `dist/pt-BR/404.html` markup at the URL
    `/pt-BR/languages/xyz`, and the console must have no Vue `Hydration` warnings. Do it by
    intercepting that request with `page.route()` and fulfilling it with the file's contents,
    because `vite preview` cannot emulate Apache's `ErrorDocument`. Repeat for
    `/pt-BR/nao-existe`, and for `/history` with `dist/404.html`.

### Implementation for User Story 5

- [X] T047 [US5] Add the i18n keys `notFound.heading`, `notFound.body`, `notFound.backHome`,
  `seo.notFound.title` and `seo.notFound.description` (pt-BR "Página não encontrada — Hello World
  em Muitas Linguagens", en "Page not found — Hello World in Many Languages", es "Página no
  encontrada — Hello World en Muchos Lenguajes"), plus `root.heading`, to the three locale files.
- [X] T048 [P] [US5] Create `src/pages/NotFoundPage.vue`:
  - heading + body + link to `/{locale}` when the route has a locale;
  - otherwise English text and links to the three homes (labels from `SUPPORTED_LOCALES`);
  - the markup must not include the requested path, so the server-rendered `/{locale}/404`
    document hydrates identically on any unknown URL.
- [X] T049 [P] [US5] Create `src/pages/RootPage.vue`:
  - `root.heading` + a list of `<a href="/pt-BR|/en|/es">` with each language's own name and flag
    from `SUPPORTED_LOCALES`;
  - `onMounted(() => router.replace('/' + resolveInitialLocale()))`, client only (research.md §4).
- [X] T050 [US5] In `src/router/index.js`:
  - add the routes `root` (`/`), `not-found-locale` (`/:locale(pt-BR|en|es)/:pathMatch(.*)*`) and
    `not-found` (`/:pathMatch(.*)*`) per `contracts/routes-and-output-contract.md`;
  - delete `localeRedirectGuard` and its registration in `src/main.js`.

  In `src/composables/useLocale.js`, change `setLocale(code)` so that when the current route has
  no `locale` param (`root` and the English `not-found`), it pushes `{ name: 'home', params:
  { locale: code } }` after writing the stored preference. Routes that have a `locale` param keep
  today's behavior (same route, other locale). Without this, the header's language switcher does
  nothing on `/` and on the English 404, because vue-router discards a param the route doesn't
  declare. Add cases to `tests/unit/useLocale.spec.js`: on `/`, `setLocale('es')` →
  `/es`; on `/history` (not-found), `setLocale('pt-BR')` → `/pt-BR`; on `/en/about`,
  `setLocale('es')` → `/es/about`.

  In `src/pages/LanguageDetailPage.vue`, render `<NotFoundPage />` when `entry` is missing,
  replacing the inline "not found" paragraph. Use `<NotFoundPage v-if="!entry" />` as the
  template's root branch, with no wrapper element and without the back link. The DOM must be
  identical to what the `not-found-locale` route renders for `/{locale}/404`, because Apache
  serves that document for `/{locale}/languages/{unknown}` and the client hydrates it with the
  `language-detail` route. Remove the now-unused `languageDetail.notFound` key
  from the locales only if nothing else uses it.
- [X] T051 [US5] Extend `src/seo/buildPageHead.js` and `src/composables/usePageHead.js` for
  non-catalog routes:
  - root: `lang="en"`, the fixed title "Hello World in Many Languages — choose your language",
    `og:type` website;
  - not-found: `seo.notFound.*` in the route locale (or `en`). This covers the `not-found` and
    `not-found-locale` routes **and** `language-detail` with a slug that `findBySlug` doesn't
    know (e.g. `/pt-BR/languages/xyz`). `usePageHead` treats any route with no matching
    `CatalogPage` as not-found, so it never builds a language title with an empty name or a
    canonical for an unknown slug;
  - both: `lang`, `robots: noindex, follow`, `og:type` website, `og:title`, `og:description`,
    `og:locale`, `og:image`, `twitter:*` and the icon links; **no** canonical, alternates,
    `og:url` or JSON-LD (seo-head-contract.md, "Non-indexed documents").

  Extend `tests/unit/buildPageHead.spec.js` and `tests/unit/usePageHead.spec.js` accordingly,
  including a `/pt-BR/languages/xyz` case: noindex, the pt-BR not-found title, no canonical.
- [X] T052 [US5] Add `'/'`, `'/404'`, `'/pt-BR/404'`, `'/en/404'` and `'/es/404'` to
  `includedRoutes` in `vite.config.js`.
- [X] T053 [US5] Replace the SPA fallback in `public/.htaccess` with the remaining rules from
  `contracts/htaccess-contract.md`:
  - rule 2: block direct requests to the 404 documents when `REDIRECT_STATUS` is empty;
  - rule 5: `^(.+)$ - [R=404,L]`;
  - rule 6: `ErrorDocument 404 /404.html` plus `<If>` overrides for `/pt-BR`, `/en`, `/es`.

  Rules 2 and 5 and the plain `ErrorDocument` only need `AllowOverride FileInfo`. The `<If>`
  blocks need `AllowOverride All`, and with only `FileInfo` the whole site answers 500. Put the
  three `<If>` blocks last, together, under a comment that says this and describes the fallback:
  delete the blocks and keep the single English `ErrorDocument`. That way they are easy to remove
  if T056 or the hosting check shows `All` is not available.
- [X] T054 [US5] Update `src/build/generateSitemap.js` to accept `lastmodByPath` and emit
  `<lastmod>` after `<loc>`. Update `scripts/generate-sitemap.mjs` to pass
  `buildLastModMap({ catalog, cwd: ROOT })` (T010).
- [X] T055 [US5] In `.github/workflows/deploy.yml`, add `with: fetch-depth: 0` to the
  `actions/checkout@v4` step, so the `lastmod` dates are real (Clarifications). Change nothing
  else in the workflow.
- [ ] T056 [US5] Run quickstart §4 (Docker `httpd:2.4` serving `dist/`) and confirm every row of
  the "Expected responses" table in `contracts/htaccess-contract.md`, with the container on
  `AllowOverride All`. Also run the stricter `AllowOverride FileInfo` check from the same section
  (it must give 500 with the `<If>` blocks and match the table without them).

  Confirm the production AllowOverride level with the hosting panel or support, and record it in
  research.md §5. If it is not `All`, delete the `<If>` blocks from `public/.htaccess` per the
  fallback in the htaccess contract (Constraints). This is the FR-022 hosting exception accepted
  in spec Assumptions; the tests that check the language of not-found pages (T043, T046) keep
  passing because they test the app, not Apache. Write down any deviation.
  - Status: the Docker checks are done and recorded in research.md §5 (all rows match with
    `All`; `FileInfo` alone gives 500 even without `<If>`, because of `DirectorySlash Off`, added
    in T022). Still open: the site owner confirms the production AllowOverride level.

**Checkpoint**: No more soft 404s; the root works without JS; the sitemap carries dates.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T057 [P] Update `README.md` and `CONTRIBUTING.md`: adding `content/languages/{slug}.md` now
  also generates `/{locale}/languages/{slug}` pages in all 3 languages and their sitemap entries,
  with no other change; `npm run build` runs `verify-build`. Mention the build in the contribution
  template only if it describes the build today.
- [X] T058 [P] Update `public/llms.txt` to list one language page per locale (e.g.
  `/en/languages/rust`), if it currently lists only the fixed pages. Keep
  `tests/e2e/static-files.spec.js` passing.
- [X] T059 Check the performance budget (plan.md):
  - compare the initial JS gzip size from `vite-ssg build` with the T003 baseline (≤ +15 KB);
  - confirm `verify-build` enforced ≤ 100 KB per HTML file;
  - record the results in `specs/009-prerender-page-seo/quickstart.md` §0.
  - Run `npm run test:coverage` and compare each of the four percentages with the T003 baseline.
    None may be lower (Constitution Principle II ratchet). If one is, add unit tests for the
    uncovered new code in `src/seo/`, `src/pages/` or `scripts/` until it is back at or above the
    baseline. Record the before/after numbers in quickstart §0.
- [X] T060 Run quickstart §3 (temporary `content/languages/zz-test.md` → 47 HTML files and 3 more
  sitemap URLs). Then delete the test file and run `npm run build` again: `verify-build` must
  report 44 files, there must be no `dist/*/languages/zz-test.html`, and `dist/sitemap.xml` must not
  list `zz-test`. This covers the spec's "Content file removed" edge case; Apache then answers 404
  for the old addresses through rule 5.
- [X] T061 Run the full CI sequence locally, `npm run lint && npm run test:unit && npm run test:e2e
  && npm run build`, and review the diff against the constitution's review checklist (correctness,
  readability, no dead code such as leftover `useLocaleSeoTags` references, no unjustified
  complexity).
- [ ] T062 After the first deploy, the site owner runs quickstart §5–§6:
  - the production `curl` checks;
  - Rich Results / Schema validator and OG validator with 0 errors;
  - PageSpeed against the T003 baseline;
  - a Cloudflare purge if stale 200s appear.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup and blocks every story.
- **US1 (Phase 3)**: depends on Foundational.
- **US2 (Phase 4)**: depends on Foundational. It builds on `usePageHead.js` from T018 and on
  `verify-build.mjs` from T014, so in practice do it after US1.
- **US3 (Phase 5)**: depends on Foundational only. The verify-build additions (T031) need T014.
- **US4 (Phase 6)**: depends on US2, because it extends `buildPageHead`/`usePageHead`.
- **US5 (Phase 7)**: depends on Foundational. T051 extends `buildPageHead` from US2, and T053
  replaces the fallback that US1's `.htaccess` left in place.
- **Polish (Phase 8)**: after all the stories you intend to ship.

### Within Each User Story

- Tests and verify-build checks are written first and fail before the implementation.
- i18n keys before the components and head builder that read them.
- `buildPageHead` before `usePageHead`.
- Each story ends with a full local run (lint, unit, e2e, build).

### Parallel Opportunities

- Phase 2: T008/T009 (catalog + test) and T010 (lastmod helper) run in parallel with each other,
  after T004–T007.
- US1: T014/T015 in parallel; T016 → T017 sequential (same config, then spec).
- US2: T023 and T024 in parallel.
- US3: T030 and T031 in parallel; can run alongside US2 (different files), except that both touch
  the locale files (T025/T032), so serialize those two tasks.
- US4: T038 (SVG design) can start any time after Setup.
- US5: T043, T044, T045 in parallel; T048 and T049 in parallel.
- Polish: T057, T058 in parallel.

---

## Parallel Example: User Story 5

```text
Task: "T043 [US5] Router/NotFound/Root unit tests in tests/unit/"
Task: "T044 [US5] Sitemap lastmod unit test in tests/unit/generateSitemap.spec.js"
Task: "T045 [US5] Exact file-set + noindex + sitemap checks in scripts/verify-build.mjs"
# then
Task: "T048 [US5] NotFoundPage.vue"
Task: "T049 [US5] RootPage.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 + Phase 2 → the app is pre-rendered and behaves as before.
2. Phase 3 (US1) → crawlers get real content; `.htaccess` serves clean URLs.
3. **Stop and validate**: `verify-build` is green, the `prerendered` E2E passes, and the Docker
   httpd check of `/pt-BR/languages/rust` returns 200 with content. Deployable.

### Incremental Delivery

1. US1 → deploy (content for crawlers).
2. US2 → deploy (unique titles, canonical, hreflang). This completes P1.
3. US3 → deploy (internal links).
4. US4 → deploy (previews, JSON-LD, favicon).
5. US5 → deploy (real 404s, root chooser, `lastmod`) and run quickstart §5 right after.

Each step keeps lint, unit, e2e and build green, so each one can go out on its own push to `main`.

---

## Implementation notes (deviations found while implementing)

- **T006**: vite-ssg only hydrates when its fourth argument has `hydration: true` (otherwise the
  client re-renders over the server HTML). `src/main.js` passes `{ hydration:
  import.meta.env.PROD }`, so the dev server keeps a plain mount.
- **T006 / T050**: the i18n locale is set in `router.afterEach`, not `beforeEach`. With
  `beforeEach`, the root redirect left a short window where labels were already Spanish but the
  links still pointed at `/en/...` (caught by a flaky `about-page` E2E).
- **T022**: `.htaccess` needs `DirectorySlash Off` + `RewriteOptions AllowNoSlash` at the top, or
  Apache 301s `/pt-BR` to `/pt-BR/` (redirect loop with rule 1). This needs `AllowOverride
  Indexes`, so a `FileInfo`-only host can no longer use the fallback. See research.md §5 and the
  htaccess contract.
- **T050**: the locale routes are `sensitive: true`. vue-router matches case-insensitively by
  default, so `/pt-br` was the home with locale `pt-br` while Apache serves the English 404 there.
- **T059**: the first build exceeded the JS budget (+15.85 kB) because `usePageHead` imported
  every language example. It now reads only the names (`src/content/languageNames.js`, a `?name`
  import served by a small plugin in `vite.config.js`): +12.29 kB.
- Shared helper `scripts/lib/readLanguageSlugs.mjs` replaces three copies of the slug-listing code
  (sitemap script, `vite.config.js`, `verify-build`).

## Notes

- [P] = different files, no dependency on an incomplete task.
- Commit after each task or logical group, but only when the owner asks (see the global
  instructions): prepare the `git add`/`git commit` commands instead of running them.
- Behavior changes on purpose (adjust tests only for these): soft-404 → 404; addresses without a
  locale (other than `/`) → English 404, no redirect; the new link on home cards; the back link on
  language pages.
