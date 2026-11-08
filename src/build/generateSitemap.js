/**
 * Builds the sitemap.xml content (data-model.md `Sitemap`) from the same
 * sources of truth the app itself reads — the locale list, the router's own
 * page kinds, and the language slugs — so it can never drift from what the
 * site actually serves (research.md §1, §3).
 *
 * @param {object} input
 * @param {string} input.origin - Site origin, e.g. "https://helloworld.valdir.dev.br".
 * @param {string[]} input.locales - Supported locale codes (e.g. SUPPORTED_CODES).
 * @param {{ name: string, path: (locale: string, slug?: string) => string, perSlug?: boolean }[]} input.pageKinds
 * @param {string[]} input.languageSlugs - Slugs for `perSlug` page kinds.
 * @param {Record<string, string>} input.lastmodByPath - `YYYY-MM-DD` per page path.
 * @returns {string} The full sitemap.xml document.
 */
export function generateSitemap({ origin, locales, pageKinds, languageSlugs, lastmodByPath }) {
  const pages = pageKinds.flatMap((pageKind) =>
    pageKind.perSlug
      ? languageSlugs.map((slug) => buildPathsByLocale(pageKind, locales, slug))
      : [buildPathsByLocale(pageKind, locales)],
  )

  const urls = pages.flatMap((pathsByLocale) =>
    locales.map((locale) =>
      buildUrlEntry({ origin, locales, pathsByLocale, locale, lastmodByPath }),
    ),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

function buildPathsByLocale(pageKind, locales, slug) {
  return Object.fromEntries(locales.map((locale) => [locale, pageKind.path(locale, slug)]))
}

function buildUrlEntry({ origin, locales, pathsByLocale, locale, lastmodByPath }) {
  const alternates = [
    ...locales.map((code) => ({ hreflang: code, href: `${origin}${pathsByLocale[code]}` })),
    { hreflang: 'x-default', href: `${origin}${pathsByLocale.en}` },
  ]

  return [
    '  <url>',
    `    <loc>${origin}${pathsByLocale[locale]}</loc>`,
    `    <lastmod>${lastmodByPath[pathsByLocale[locale]]}</lastmod>`,
    ...alternates.map(
      ({ hreflang, href }) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`,
    ),
    '  </url>',
  ].join('\n')
}
