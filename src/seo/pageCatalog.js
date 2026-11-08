// Pure module (no Vue, DOM or Node imports): shared by vite.config.js (the
// pre-render list), scripts/generate-sitemap.mjs (the sitemap) and
// usePageHead (canonical/hreflang), so all three come from one function
// (research.md §3).

export const SITE_ORIGIN = 'https://helloworld.valdir.dev.br'

export const OG_LOCALES = { 'pt-BR': 'pt_BR', en: 'en_US', es: 'es_ES' }

/**
 * The indexable page kinds (data-model.md `PageKind`). `name` equals the
 * vue-router route name in src/router/index.js — tests/unit/pageCatalog.spec.js
 * checks that every catalog path resolves to it.
 */
export const PAGE_KINDS = [
  {
    name: 'home',
    path: (locale) => `/${locale}`,
    perSlug: false,
    sourceFiles: (locale) => ['src/pages/HomePage.vue', `src/i18n/locales/${locale}.js`],
    jsonLdType: 'WebSite',
  },
  {
    name: 'history',
    path: (locale) => `/${locale}/history`,
    perSlug: false,
    sourceFiles: (locale) => ['src/pages/HistoryPage.vue', `content/history.${locale}.md`],
    jsonLdType: null,
  },
  {
    name: 'about',
    path: (locale) => `/${locale}/about`,
    perSlug: false,
    sourceFiles: (locale) => ['src/pages/AboutPage.vue', `src/i18n/locales/${locale}.js`],
    jsonLdType: null,
  },
  {
    name: 'language-detail',
    path: (locale, slug) => `/${locale}/languages/${slug}`,
    perSlug: true,
    sourceFiles: (locale, slug) => [`content/languages/${slug}.md`],
    jsonLdType: 'TechArticle',
  },
]

function buildAlternates(pageKind, locales, slug) {
  return [
    ...locales.map((code) => ({
      hreflang: code,
      href: `${SITE_ORIGIN}${pageKind.path(code, slug)}`,
    })),
    { hreflang: 'x-default', href: `${SITE_ORIGIN}${pageKind.path('en', slug)}` },
  ]
}

/**
 * Builds one `CatalogPage` (data-model.md) per locale × indexable page:
 * `locales.length × (3 + languageSlugs.length)` pages with unique paths.
 *
 * @param {object} input
 * @param {string[]} input.locales - Supported locale codes (e.g. SUPPORTED_CODES).
 * @param {string[]} input.languageSlugs - Slugs from content/languages/*.md.
 * @returns {{ kind: string, locale: string, slug?: string, path: string, url: string, alternates: { hreflang: string, href: string }[] }[]}
 */
export function buildPageCatalog({ locales, languageSlugs }) {
  return PAGE_KINDS.flatMap((pageKind) => {
    const slugs = pageKind.perSlug ? languageSlugs : [undefined]
    return slugs.flatMap((slug) =>
      locales.map((locale) => {
        const path = pageKind.path(locale, slug)
        return {
          kind: pageKind.name,
          locale,
          slug,
          path,
          url: `${SITE_ORIGIN}${path}`,
          alternates: buildAlternates(pageKind, locales, slug),
        }
      }),
    )
  })
}

/** Returns the catalog page whose `path` equals `path`, or undefined. */
export function findCatalogPage(catalog, path) {
  return catalog.find((page) => page.path === path)
}

/** Returns the `PAGE_KINDS` entry named `name`, or undefined. */
export function findPageKind(name) {
  return PAGE_KINDS.find((pageKind) => pageKind.name === name)
}
