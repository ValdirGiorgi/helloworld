# Data Model: Pre-rendered Pages with Per-Page SEO

All entities are in-memory build/runtime values. Nothing is persisted beyond the generated files in
`dist/`.

## SiteLocale (existing: `SUPPORTED_LOCALES` in `src/composables/useLocale.js`)

Terminology: spec.md calls this a **site language**, while plan, contracts and tasks use
**locale**. Both name the same thing. **Programming language** (Rust, Python…) always means a
`LanguageEntry`, never a locale.

| Field | Type | Notes |
|---|---|---|
| `code` | `'pt-BR' \| 'en' \| 'es'` | URL segment and `<html lang>`. |
| `ogLocale` | `'pt_BR' \| 'en_US' \| 'es_ES'` | **New.** Value for `og:locale` / `og:locale:alternate`. |

- `en` is the default: `x-default` alternates and the not-found page for addresses with no locale
  use it.

## PageKind (moved from `scripts/generate-sitemap.mjs` to `src/seo/pageCatalog.js`)

| Field | Type | Notes |
|---|---|---|
| `name` | `'home' \| 'history' \| 'about' \| 'language-detail'` | Must equal the vue-router route name. |
| `path` | `(locale, slug?) => string` | No trailing slash. Examples: `/pt-BR`, `/es/languages/rust`. |
| `perSlug` | `boolean` | `true` only for `language-detail`. |
| `sourceFiles` | `(locale, slug?) => string[]` | Repo-relative files whose last commit date is the page's `lastmod` (research §6). |
| `jsonLdType` | `'WebSite' \| 'TechArticle' \| null` | `WebSite` for `home`, `TechArticle` for `language-detail`, `null` for the others. |

## CatalogPage (output of `buildPageCatalog`; one per indexable locale × page)

| Field | Type | Notes |
|---|---|---|
| `kind` | `PageKind['name']` | |
| `locale` | `SiteLocale['code']` | |
| `slug` | `string \| undefined` | Only for `language-detail`. |
| `path` | `string` | Example: `/pt-BR/languages/rust`. |
| `url` | `string` | `SITE_ORIGIN + path`, where `SITE_ORIGIN = 'https://helloworld.valdir.dev.br'`. |
| `alternates` | `{ hreflang: string, href: string }[]` | 3 locales + `x-default` (→ `en`), absolute URLs. |
| `lastmod` | `string` (`YYYY-MM-DD`) | Filled in only by Node callers through `getLastModified`. |

**Validation rules**
- `path` values are unique; count = `locales.length × (3 + languageSlugs.length)`, which is 39 today.
- Every `path` resolves through the router to the route named `kind` (unit test).
- Slugs come from the filename by the same rule as `slugFromFilename` (lowercase basename without
  `.md`). Duplicate slugs already throw in `useLanguages`.

## NonIndexedDocument (prerendered, outside the catalog and the sitemap)

| Path | File | Locale | Purpose |
|---|---|---|---|
| `/` | `dist/index.html` | `en` (lang) | Language chooser + client redirect (FR-024). |
| `/404` | `dist/404.html` | `en` | 404 for addresses with no locale. Links to all three homes. |
| `/{locale}/404` | `dist/{locale}/404.html` | each | 404 for that locale. Link to `/{locale}`. |

All carry `<meta name="robots" content="noindex, follow">`, and none has a canonical,
alternates, `og:url` or JSON-LD.

## PageHead (output of the pure `buildPageHead`)

| Field | Content |
|---|---|
| `htmlAttrs.lang` | locale code |
| `title` | per [contracts/seo-head-contract.md](./contracts/seo-head-contract.md) |
| `meta` | description; `og:title`, `og:description`, `og:url` (indexable pages only), `og:type` (`website` for home, root and not-found; `article` for history, about and language pages), `og:locale`, `og:locale:alternate` ×2, `og:site_name`, `og:image` (+ `:width`, `:height`, `:alt`); `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`; `robots` only on non-indexed documents |
| `link` | `canonical` (own `url`); `alternate` ×4; `icon` (ico + svg); `apple-touch-icon` |
| `script` | 0 or 1 `application/ld+json`, per the page kind's `jsonLdType` |

## LanguageEntry (existing, from `parseLanguageFile`)

No change. `name` is used in titles, descriptions, link text and JSON-LD. `slug` is used in paths.

## State transitions

- **Root `/`**: server HTML (chooser) → hydrate → `onMounted` → `router.replace('/{resolved}')`,
  using the stored preference or the country rule. Without JS, the visitor stays on the chooser.
- **Locale-prefixed unknown address**: Apache 404 + `{locale}/404.html` → hydrate → the router
  matches the locale catch-all (or `language-detail` with an unknown slug) → renders the same
  not-found markup.
