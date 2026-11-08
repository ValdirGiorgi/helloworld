# Contract: Routes, build output and page markup

## Router (`src/router/index.js` exports `routes`; vite-ssg creates the router)

| Name | Path | Component | Notes |
|---|---|---|---|
| `root` | `/` | `RootPage` | Shows links to `/pt-BR`, `/en`, `/es`. On the client only, `onMounted` → `router.replace('/' + resolveInitialLocale())`. |
| `home` | `/:locale(pt-BR\|en\|es)` | `HomePage` | unchanged |
| `history` | `/:locale(pt-BR\|en\|es)/history` | `HistoryPage` | unchanged |
| `about` | `/:locale(pt-BR\|en\|es)/about` | `AboutPage` | unchanged |
| `language-detail` | `/:locale(pt-BR\|en\|es)/languages/:slug` | `LanguageDetailPage` | Unknown slug renders `NotFoundPage` as the template root (no wrapper, no back link), so the DOM matches `/{locale}/404`; the head is the not-found head (noindex). |
| `not-found-locale` | `/:locale(pt-BR\|en\|es)/:pathMatch(.*)*` | `NotFoundPage` | Text in `:locale`, link to `/{locale}`. |
| `not-found` | `/:pathMatch(.*)*` | `NotFoundPage` | English, links to the three homes. |

The global `beforeEach` redirect for addresses without a locale is **removed**. `useLocale().locale`
falls back to `'en'` when the route has no `locale` param. On such routes (`root`, `not-found`),
`setLocale(code)` stores the preference and navigates to `/{code}` (home). On routes with a
`locale` param it keeps today's behavior: same route, other locale.

## Build (`npm run build`)

```text
prebuild:  node scripts/generate-sitemap.mjs     # now with <lastmod>, from the page catalog
build:     vite-ssg build && node scripts/verify-build.mjs
```

`vite.config.js` → `ssgOptions`: `dirStyle: 'flat'`, `formatting: 'none'`,
`includedRoutes: () => [...catalogPaths, '/', '/404', '/pt-BR/404', '/en/404', '/es/404']`.

### Expected `dist/` HTML files (today)

```text
dist/index.html
dist/404.html
dist/{pt-BR,en,es}.html                       # 3 homes
dist/{pt-BR,en,es}/history.html               # 3
dist/{pt-BR,en,es}/about.html                 # 3
dist/{pt-BR,en,es}/404.html                   # 3
dist/{pt-BR,en,es}/languages/{slug}.html      # 3 × 10
```

That is 39 catalog pages + 1 root + 4 not-found = **44** HTML files. `verify-build` fails when
there is any extra or missing file.

## `verify-build` checks (fails the build with a list of offending files)

1. The set of HTML files equals the catalog paths + root + not-found documents.
2. Every catalog document:
   - `<html lang>` = its locale;
   - `<title>` is non-empty and unique across the catalog;
   - it has a meta description;
   - its canonical = its URL;
   - it has 4 alternates with absolute URLs;
   - it has `og:title`, `og:description`, `og:url`, `og:locale`, `og:type`, `og:image` and
     `twitter:card`.
3. Language documents contain 9 example sections with code inside the app root, and the
   `TechArticle` JSON-LD parses and has non-empty `headline`, `image`, `author.name`,
   `dateModified` (`YYYY-MM-DD`), `inLanguage` and `url`. Home documents contain parseable `WebSite` JSON-LD.
4. Home documents contain one `a[href="/{locale}/languages/{slug}"]` per language. Language
   documents contain `a[href="/{locale}"]`.
5. Root and not-found documents contain `noindex`, and no canonical, alternates, `og:url` or
   JSON-LD.
6. Every HTML file is ≤ 100 KB.
7. `dist/sitemap.xml` lists exactly the catalog URLs, each with a `<lastmod>` in `YYYY-MM-DD`
   format.

## Page markup additions

- `LanguageCard` gets the prop `showPageLink` (default `true`; `LanguageDetailPage` passes `false`).
  When true, it renders, outside `ExpandableSection` so it shows whether the card is expanded or
  collapsed:
  `<router-link :to="{ name: 'language-detail', params: { locale, slug } }">{{ t('languageCard.seeAll', { name }) }}</router-link>`
  - It renders as a real `<a href="/{locale}/languages/{slug}">`.
  - It uses the existing link style (`font-medium text-brand-700 hover:underline` + focus ring).
  - `data-testid="language-page-link-{slug}"`.
- `LanguageDetailPage` renders a back link above the card:
  `<router-link :to="{ name: 'home', params: { locale } }"><span aria-hidden="true">←</span> {{ t('languageDetail.backToList') }}</router-link>`
  (the key already exists).
- New i18n keys:
  - `languageCard.seeAll`:
    - pt-BR: "Ver todos os exemplos de {name}"
    - en: "See all {name} examples"
    - es: "Ver todos los ejemplos de {name}"
  - `notFound.heading`, `notFound.body`, `notFound.backHome`
  - `root.heading`
  - `seo.*` (see seo-head-contract.md)
- `index.html` (template): drop the hard-coded `<title>` and description (unhead injects them);
  keep the charset and viewport meta.
