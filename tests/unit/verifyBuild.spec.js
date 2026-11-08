import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  BRAND_ASSETS,
  checkBrandAssets,
  checkCatalogDocument,
  checkFileSet,
  checkFileSize,
  checkNonIndexedDocument,
  checkSitemap,
  nonIndexedDocuments,
  verifyBuild,
  checkUniqueTitles,
  htmlFileForPath,
  MAX_HTML_BYTES,
} from '../../scripts/verify-build.mjs'
import { buildPageCatalog, findCatalogPage } from '../../src/seo/pageCatalog.js'
import ptBR from '../../src/i18n/locales/pt-BR.js'

const catalog = buildPageCatalog({ locales: ['pt-BR', 'en', 'es'], languageSlugs: ['rust'] })
const rustPage = findCatalogPage(catalog, '/pt-BR/languages/rust')

const SECTION_LABELS = [
  ptBR.languageCard.helloWorld,
  ptBR.languageCard.conditional,
  ptBR.languageCard.calculation,
  ptBR.languageCard.loop,
  ptBR.languageCard.function,
  ptBR.languageCard.stringConcatenation,
  ptBR.languageCard.list,
  ptBR.languageCard.boolean,
  ptBR.variables.integer,
]

const backLink = '<a href="/pt-BR"><span aria-hidden="true">←</span> Voltar para a lista</a>'

function section(label) {
  return `<div><p>${label}</p><pre><code>println!("Hello, World!");</code></pre></div>`
}

const TECH_ARTICLE = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Hello World em Rust — exemplos de código',
  image: 'https://helloworld.valdir.dev.br/og-image.png',
  author: { '@type': 'Person', name: 'Valdir Giorgi' },
  dateModified: '2026-01-01',
  inLanguage: 'pt-BR',
  url: 'https://helloworld.valdir.dev.br/pt-BR/languages/rust',
}

function jsonLdHtml(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

function defaultJsonLd(page) {
  if (page.kind === 'language-detail') return jsonLdHtml({ ...TECH_ARTICLE, url: page.url })
  if (page.kind === 'home') {
    return jsonLdHtml({
      '@type': 'WebSite',
      name: 'Hello World',
      url: page.url,
      inLanguage: page.locale,
    })
  }
  return ''
}

/** A head that passes every check for `page`; `overrides` swaps single parts. */
function headHtml(page, overrides = {}) {
  const og = {
    'og:title': 'Hello World em Rust',
    'og:description': 'Hello World em Rust.',
    'og:url': page.url,
    'og:locale': 'pt_BR',
    'og:type': 'article',
    'og:image': 'https://helloworld.valdir.dev.br/og-image.png',
  }
  const parts = {
    title: '<title>Hello World em Rust — exemplos de código</title>',
    description: '<meta name="description" content="Hello World em Rust.">',
    canonical: `<link rel="canonical" href="${page.url}">`,
    alternates: page.alternates
      .map(({ hreflang, href }) => `<link rel="alternate" hreflang="${hreflang}" href="${href}">`)
      .join(''),
    og: Object.entries(og)
      .map(([property, content]) => `<meta property="${property}" content="${content}">`)
      .join(''),
    twitter: '<meta name="twitter:card" content="summary_large_image">',
    jsonLd: defaultJsonLd(page),
    ...overrides,
  }
  return Object.values(parts).join('')
}

function languagePageHtml({ lang = 'pt-BR', labels = SECTION_LABELS, app, head } = {}) {
  const body = app ?? `<main>${backLink}${labels.map(section).join('')}</main>`
  return `<!doctype html><html lang="${lang}"><head>${head ?? headHtml(rustPage)}</head><body><div id="app">${body}</div></body></html>`
}

function errorsWithHead(overrides) {
  return checkCatalogDocument({
    page: rustPage,
    html: languagePageHtml({ head: headHtml(rustPage, overrides) }),
  }).join('\n')
}

describe('verify-build checks (US1)', () => {
  it('passes a complete language page', () => {
    expect(checkCatalogDocument({ page: rustPage, html: languagePageHtml() })).toEqual([])
  })

  it('fails a page whose <html lang> is not its locale', () => {
    const errors = checkCatalogDocument({ page: rustPage, html: languagePageHtml({ lang: 'en' }) })
    expect(errors.join('\n')).toContain('lang')
  })

  it('fails a page whose #app is empty', () => {
    const errors = checkCatalogDocument({ page: rustPage, html: languagePageHtml({ app: '' }) })
    expect(errors.join('\n')).toContain('#app is empty')
  })

  it('fails a language page with 8 sections instead of 9', () => {
    const errors = checkCatalogDocument({
      page: rustPage,
      html: languagePageHtml({ labels: SECTION_LABELS.slice(0, 8) }),
    })
    expect(errors.join('\n')).toContain(`missing example section "${ptBR.variables.integer}"`)
    expect(errors.join('\n')).toContain('only 8 code blocks')
  })

  it('fails a file over 100 KB', () => {
    expect(checkFileSize(MAX_HTML_BYTES)).toEqual([])
    expect(checkFileSize(MAX_HTML_BYTES + 1)).toHaveLength(1)

    const padding = `<p>${'x'.repeat(MAX_HTML_BYTES)}</p>`
    const errors = checkCatalogDocument({
      page: rustPage,
      html: languagePageHtml({
        app: `<main>${backLink}${SECTION_LABELS.map(section).join('')}${padding}</main>`,
      }),
    })
    expect(errors.join('\n')).toContain('over the')
  })

  it('reports catalog pages whose flat file is missing', () => {
    const files = catalog.map((page) => htmlFileForPath(page.path))
    expect(checkFileSet(catalog, [], files)).toEqual([])
    expect(
      checkFileSet(
        catalog,
        [],
        files.filter((f) => f !== 'pt-BR.html'),
      ),
    ).toEqual(['missing pre-rendered file pt-BR.html'])
  })

  it('maps paths to flat file names', () => {
    expect(htmlFileForPath('/pt-BR/languages/rust')).toBe('pt-BR/languages/rust.html')
    expect(htmlFileForPath('/en')).toBe('en.html')
    expect(htmlFileForPath('/')).toBe('index.html')
  })
})

describe('verify-build checks (US2)', () => {
  it('fails an empty <title>', () => {
    expect(errorsWithHead({ title: '<title></title>' })).toContain('empty <title>')
  })

  it('fails a missing meta description', () => {
    expect(errorsWithHead({ description: '' })).toContain('meta description')
  })

  it("fails a canonical that is not the page's URL", () => {
    expect(
      errorsWithHead({
        canonical: '<link rel="canonical" href="https://helloworld.valdir.dev.br/pt-BR">',
      }),
    ).toContain('canonical')
    expect(errorsWithHead({ canonical: '' })).toContain('expected 1 canonical link, found 0')
  })

  it('fails when an alternate is missing or relative', () => {
    const [ptBRAlt, ...rest] = rustPage.alternates
    const relative = `<link rel="alternate" hreflang="pt-BR" href="/pt-BR/languages/rust">`
    const others = rest
      .map(({ hreflang, href }) => `<link rel="alternate" hreflang="${hreflang}" href="${href}">`)
      .join('')
    expect(errorsWithHead({ alternates: others })).toContain(
      'expected 4 hreflang alternates, found 3',
    )
    expect(errorsWithHead({ alternates: relative + others })).toContain(
      `missing alternate "pt-BR ${ptBRAlt.href}"`,
    )
  })

  it('fails a head that mentions localhost', () => {
    expect(
      errorsWithHead({
        description: '<meta name="description" content="see http://localhost:4173">',
      }),
    ).toContain('localhost')
  })

  it('reports titles shared by more than one file', () => {
    expect(checkUniqueTitles({ 'en.html': 'A', 'es.html': 'B' })).toEqual([])
    expect(checkUniqueTitles({ 'en.html': 'A', 'es.html': 'A', 'pt-BR.html': 'B' })).toEqual([
      'title "A" is shared by en.html, es.html',
    ])
  })
})

describe('verify-build checks (US3)', () => {
  const homePage = findCatalogPage(catalog, '/pt-BR')

  function homeHtml(links) {
    const head = headHtml(homePage)
    return `<!doctype html><html lang="pt-BR"><head>${head}</head><body><div id="app"><main>${links}</main></div></body></html>`
  }

  it('passes a home with one link per language page', () => {
    const errors = checkCatalogDocument({
      page: homePage,
      html: homeHtml('<a href="/pt-BR/languages/rust">Ver todos os exemplos de Rust</a>'),
      languageSlugs: ['rust'],
    })
    expect(errors).toEqual([])
  })

  it('fails a home that does not link to a language page', () => {
    const errors = checkCatalogDocument({
      page: homePage,
      html: homeHtml('<a href="/pt-BR/languages/go">Go</a>'),
      languageSlugs: ['rust', 'go'],
    })
    expect(errors).toEqual(['expected 1 link to /pt-BR/languages/rust, found 0'])
  })

  it('fails a language page without a link back to its home', () => {
    const errors = checkCatalogDocument({
      page: rustPage,
      html: languagePageHtml({
        app: `<main>${SECTION_LABELS.map(section).join('')}</main>`,
      }),
    })
    expect(errors).toEqual(['no link back to /pt-BR'])
  })
})

describe('verify-build checks (US4)', () => {
  it('fails a page missing an Open Graph tag or the Twitter card', () => {
    const errors = errorsWithHead({ twitter: '', og: '<meta property="og:title" content="x">' })
    for (const property of ['og:description', 'og:url', 'og:locale', 'og:type', 'og:image']) {
      expect(errors).toContain(`missing ${property}`)
    }
    expect(errors).toContain('missing twitter:card')
  })

  it('fails an og:url that differs from the canonical', () => {
    const og = headHtml(rustPage)
      .match(/<meta property="og:[^>]*>/g)
      .join('')
    const wrong = og.replace(rustPage.url, 'https://helloworld.valdir.dev.br/pt-BR')
    expect(errorsWithHead({ og: wrong })).toContain('og:url')
  })

  it('fails a language page whose TechArticle JSON-LD lacks a field the validators require', () => {
    for (const field of ['headline', 'image', 'dateModified', 'inLanguage', 'url']) {
      const data = { ...TECH_ARTICLE, [field]: '' }
      expect(errorsWithHead({ jsonLd: jsonLdHtml(data) })).toContain(`has no ${field}`)
    }
    const noAuthor = { ...TECH_ARTICLE, author: { '@type': 'Person' } }
    expect(errorsWithHead({ jsonLd: jsonLdHtml(noAuthor) })).toContain('has no author.name')
  })

  it('fails a malformed dateModified, a wrong inLanguage or url, and unparseable JSON', () => {
    expect(
      errorsWithHead({ jsonLd: jsonLdHtml({ ...TECH_ARTICLE, dateModified: '2026-1-1' }) }),
    ).toContain('is not YYYY-MM-DD')
    expect(errorsWithHead({ jsonLd: jsonLdHtml({ ...TECH_ARTICLE, inLanguage: 'en' }) })).toContain(
      'inLanguage',
    )
    expect(
      errorsWithHead({ jsonLd: jsonLdHtml({ ...TECH_ARTICLE, url: 'https://example.com' }) }),
    ).toContain('JSON-LD url')
    expect(
      errorsWithHead({ jsonLd: '<script type="application/ld+json">{oops</script>' }),
    ).toContain('does not parse')
    expect(errorsWithHead({ jsonLd: '' })).toContain('expected 1 JSON-LD block, found 0')
  })

  it('fails a home whose WebSite JSON-LD has no name', () => {
    const homePage = findCatalogPage(catalog, '/pt-BR')
    const head = headHtml(homePage, {
      jsonLd: jsonLdHtml({ '@type': 'WebSite', url: homePage.url, inLanguage: 'pt-BR' }),
    })
    const links = '<a href="/pt-BR/languages/rust">Rust</a>'
    const errors = checkCatalogDocument({
      page: homePage,
      html: `<html lang="pt-BR"><head>${head}</head><body><div id="app">${links}</div></body></html>`,
      languageSlugs: ['rust'],
    })
    expect(errors).toEqual(['JSON-LD WebSite has no name'])
  })

  it('reports missing brand assets in dist/', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-build-'))
    try {
      expect(checkBrandAssets(dir)).toEqual(BRAND_ASSETS.map((file) => `missing ${file}`))
      for (const file of BRAND_ASSETS) fs.writeFileSync(path.join(dir, file), '')
      expect(checkBrandAssets(dir)).toEqual([])
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })
})

describe('verify-build checks (US5)', () => {
  const nonIndexed = nonIndexedDocuments(['pt-BR', 'en', 'es'])
  const allFiles = [...catalog, ...nonIndexed].map((page) => htmlFileForPath(page.path))

  it('expects the catalog plus index.html, 404.html and one 404 per locale', () => {
    expect(nonIndexed.map((document) => htmlFileForPath(document.path))).toEqual([
      'index.html',
      '404.html',
      'pt-BR/404.html',
      'en/404.html',
      'es/404.html',
    ])
    expect(checkFileSet(catalog, nonIndexed, allFiles)).toEqual([])
  })

  it('fails an extra or a missing HTML file', () => {
    expect(checkFileSet(catalog, nonIndexed, [...allFiles, 'pt-BR/languages/zz.html'])).toEqual([
      'unexpected HTML file pt-BR/languages/zz.html',
    ])
    expect(
      checkFileSet(
        catalog,
        nonIndexed,
        allFiles.filter((f) => f !== 'es/404.html'),
      ),
    ).toEqual(['missing pre-rendered file es/404.html'])
  })

  function notFoundHtml(head, lang = 'pt-BR') {
    return `<html lang="${lang}"><head><title>Página não encontrada</title>${head}</head><body><div id="app"><h1>x</h1></div></body></html>`
  }
  const ptBRNotFound = { path: '/pt-BR/404', locale: 'pt-BR' }
  const noindex = '<meta name="robots" content="noindex, follow">'

  it('passes a noindex not-found document with no indexable claims', () => {
    expect(
      checkNonIndexedDocument({ document: ptBRNotFound, html: notFoundHtml(noindex) }),
    ).toEqual([])
  })

  it('fails a not-found document without noindex, or with a canonical, og:url, alternates or JSON-LD', () => {
    expect(checkNonIndexedDocument({ document: ptBRNotFound, html: notFoundHtml('') })).toEqual([
      'missing robots noindex',
    ])
    const claims = [
      '<link rel="canonical" href="https://helloworld.valdir.dev.br/pt-BR/404">',
      '<meta property="og:url" content="https://helloworld.valdir.dev.br/pt-BR/404">',
      '<link rel="alternate" hreflang="en" href="https://helloworld.valdir.dev.br/en/404">',
      '<script type="application/ld+json">{}</script>',
    ].join('')
    expect(
      checkNonIndexedDocument({ document: ptBRNotFound, html: notFoundHtml(noindex + claims) }),
    ).toEqual([
      'unexpected canonical link',
      'unexpected og:url',
      'unexpected hreflang alternates',
      'unexpected JSON-LD',
    ])
  })

  it('fails a not-found document in the wrong language', () => {
    expect(
      checkNonIndexedDocument({ document: ptBRNotFound, html: notFoundHtml(noindex, 'en') }),
    ).toEqual(['<html lang="en"> should be "pt-BR"'])
  })

  function sitemapXml(urls) {
    return urls
      .map(
        ({ loc, lastmod }) =>
          `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
      )
      .join('')
  }

  it('passes a sitemap that lists exactly the catalog URLs with dates', () => {
    const xml = sitemapXml(catalog.map((page) => ({ loc: page.url, lastmod: '2026-01-01' })))
    expect(checkSitemap(xml, catalog)).toEqual([])
  })

  it('fails a sitemap entry without <lastmod>, a missing URL and an extra URL', () => {
    const [first, second, ...rest] = catalog
    const xml = sitemapXml([
      { loc: first.url },
      ...rest.map((page) => ({ loc: page.url, lastmod: '2026-01-01' })),
      { loc: 'https://helloworld.valdir.dev.br/', lastmod: '2026-01-01' },
    ])
    expect(checkSitemap(xml, catalog)).toEqual([
      `sitemap entry ${first.url} has no YYYY-MM-DD <lastmod>`,
      `sitemap is missing ${second.url}`,
      'sitemap lists unexpected https://helloworld.valdir.dev.br/',
    ])
  })
})

describe('verifyBuild (a whole dist/ directory)', () => {
  function writeFile(root, file, content) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    fs.writeFileSync(path.join(root, file), content)
  }

  it('walks nested HTML files and collects every failure, file by file', () => {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-build-dist-'))
    try {
      writeFile(dist, 'pt-BR/languages/rust.html', languagePageHtml({ lang: 'en' }))
      writeFile(
        dist,
        'pt-BR/404.html',
        '<html lang="pt-BR"><head><title>x</title></head><body><div id="app"><p>x</p></div></body></html>',
      )
      writeFile(dist, 'stray.html', '<html></html>')

      const { fileCount, failures } = verifyBuild({ distDir: dist, catalog, locales: ['pt-BR'] })
      const byFile = Object.fromEntries(failures.map(({ file, errors }) => [file, errors]))

      expect(fileCount).toBe(3)
      expect(byFile['dist/']).toEqual(
        expect.arrayContaining([
          'missing pre-rendered file pt-BR.html',
          'missing pre-rendered file index.html',
          'unexpected HTML file stray.html',
          'missing og-image.png',
        ]),
      )
      expect(byFile['sitemap.xml']).toEqual(['missing sitemap.xml'])
      expect(byFile['pt-BR/languages/rust.html']).toEqual(['<html lang="en"> should be "pt-BR"'])
      expect(byFile['pt-BR/404.html']).toEqual(['missing robots noindex'])
    } finally {
      fs.rmSync(dist, { recursive: true })
    }
  })

  it('reports titles shared across catalog files', () => {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-build-dist-'))
    try {
      const enRust = findCatalogPage(catalog, '/en/languages/rust')
      writeFile(dist, 'pt-BR/languages/rust.html', languagePageHtml())
      writeFile(
        dist,
        'en/languages/rust.html',
        languagePageHtml({ lang: 'en', head: headHtml(enRust) }),
      )
      const { failures } = verifyBuild({ distDir: dist, catalog, locales: [] })
      const dirErrors = failures
        .filter(({ file }) => file === 'dist/')
        .flatMap(({ errors }) => errors)
      expect(dirErrors).toContain(
        'title "Hello World em Rust — exemplos de código" is shared by pt-BR/languages/rust.html, en/languages/rust.html',
      )
    } finally {
      fs.rmSync(dist, { recursive: true })
    }
  })
})
