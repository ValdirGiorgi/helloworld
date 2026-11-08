import { OG_LOCALES, SITE_ORIGIN, findPageKind } from './pageCatalog.js'

// Pure head builder (contracts/seo-head-contract.md): the same output is
// rendered into the pre-rendered HTML and applied on client navigation by
// usePageHead. It never reads `window`; every URL comes from the page catalog.

const OG_IMAGE = `${SITE_ORIGIN}/og-image.png`
const AUTHOR = 'Valdir Giorgi'

const ICON_LINKS = [
  { key: 'icon-ico', rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
  { key: 'icon-svg', rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { key: 'apple-touch-icon', rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
]

// The root chooser has no locale of its own, so its title is fixed English.
const ROOT_TITLE = 'Hello World in Many Languages — choose your language'

function titleFor(kind, t, languageName) {
  switch (kind) {
    case 'root':
      return ROOT_TITLE
    case 'not-found':
      return t('seo.notFound.title')
    case 'home':
      return t('header.title')
    case 'history':
      return `${t('history.title')} — ${t('header.title')}`
    case 'about':
      return `${t('about.title')} — ${t('header.title')}`
    case 'language-detail':
      return t('seo.language.title', { name: languageName })
  }
}

function descriptionFor(kind, t, languageName) {
  switch (kind) {
    case 'not-found':
      return t('seo.notFound.description')
    case 'root':
    case 'home':
      return t('meta.description')
    case 'history':
      return t('seo.history.description')
    case 'about':
      return t('seo.about.description')
    case 'language-detail':
      return t('seo.language.description', { name: languageName })
  }
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

/** Open Graph + Twitter tags shared by every document (`url` only on indexable ones). */
function previewMeta({ locale, type, title, description, siteName, url }) {
  const otherLocales = Object.keys(OG_LOCALES).filter((code) => code !== locale)
  return [
    { key: 'og:type', property: 'og:type', content: type },
    { key: 'og:site_name', property: 'og:site_name', content: siteName },
    { key: 'og:title', property: 'og:title', content: title },
    { key: 'og:description', property: 'og:description', content: description },
    ...(url ? [{ key: 'og:url', property: 'og:url', content: url }] : []),
    { key: 'og:locale', property: 'og:locale', content: OG_LOCALES[locale] },
    ...otherLocales.map((code) => ({
      key: `og:locale:alternate-${OG_LOCALES[code]}`,
      property: 'og:locale:alternate',
      content: OG_LOCALES[code],
    })),
    { key: 'og:image', property: 'og:image', content: OG_IMAGE },
    { key: 'og:image:width', property: 'og:image:width', content: '1200' },
    { key: 'og:image:height', property: 'og:image:height', content: '630' },
    { key: 'og:image:alt', property: 'og:image:alt', content: siteName },
    { key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { key: 'twitter:title', name: 'twitter:title', content: title },
    { key: 'twitter:description', name: 'twitter:description', content: description },
    { key: 'twitter:image', name: 'twitter:image', content: OG_IMAGE },
  ]
}

function jsonLdFor({ page, title, description, siteName, languageName, lastmod }) {
  const homeUrl = `${SITE_ORIGIN}/${page.locale}`
  switch (findPageKind(page.kind)?.jsonLdType) {
    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: page.url,
        inLanguage: page.locale,
        description,
      }
    case 'TechArticle':
      return {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: title,
        name: title,
        description,
        inLanguage: page.locale,
        url: page.url,
        mainEntityOfPage: page.url,
        image: OG_IMAGE,
        dateModified: lastmod ?? todayUtc(),
        author: { '@type': 'Person', name: AUTHOR },
        about: { '@type': 'ComputerLanguage', name: languageName },
        isPartOf: { '@type': 'WebSite', name: siteName, url: homeUrl },
      }
    default:
      return null
  }
}

/** JSON with `<` escaped, so no content can close the surrounding script tag. */
function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/**
 * Builds the unhead input for one page. Every tag carries a `key`, so client
 * navigation replaces it instead of adding another.
 *
 * `page` is either a catalog page or a non-indexed document, `{ kind: 'root' |
 * 'not-found', locale }` with no `url`: those get `robots: noindex, follow` and
 * no canonical, alternates, `og:url` or JSON-LD (seo-head-contract.md).
 *
 * @param {object} input
 * @param {import('./pageCatalog.js').CatalogPage | { kind: 'root' | 'not-found', locale: string }} input.page
 * @param {(key: string, params?: object) => string} input.t - Bound to `page.locale`.
 * @param {string} [input.languageName] - For language pages.
 * @param {string} [input.lastmod] - `YYYY-MM-DD`; today (UTC) when unknown.
 */
export function buildPageHead({ page, t, languageName, lastmod }) {
  const title = titleFor(page.kind, t, languageName)
  const description = descriptionFor(page.kind, t, languageName)
  const siteName = t('header.title')
  const preview = previewMeta({
    locale: page.locale,
    type: page.kind === 'home' || !page.url ? 'website' : 'article',
    title,
    description,
    siteName,
    url: page.url,
  })

  if (!page.url) {
    return {
      htmlAttrs: { lang: page.locale },
      title,
      meta: [
        { key: 'description', name: 'description', content: description },
        { key: 'robots', name: 'robots', content: 'noindex, follow' },
        ...preview,
      ],
      link: ICON_LINKS,
      script: [],
    }
  }

  const jsonLd = jsonLdFor({ page, title, description, siteName, languageName, lastmod })
  return {
    htmlAttrs: { lang: page.locale },
    title,
    meta: [{ key: 'description', name: 'description', content: description }, ...preview],
    link: [
      { key: 'canonical', rel: 'canonical', href: page.url },
      ...page.alternates.map(({ hreflang, href }) => ({
        key: `alternate-${hreflang}`,
        rel: 'alternate',
        hreflang,
        href,
      })),
      ...ICON_LINKS,
    ],
    script: jsonLd
      ? [{ key: 'json-ld', type: 'application/ld+json', innerHTML: serializeJsonLd(jsonLd) }]
      : [],
  }
}
