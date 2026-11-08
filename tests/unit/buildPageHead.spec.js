import { describe, it, expect, vi } from 'vitest'
import { buildPageHead } from '../../src/seo/buildPageHead.js'
import { buildPageCatalog, findCatalogPage } from '../../src/seo/pageCatalog.js'
import { createSiteI18n } from '../../src/i18n/index.js'

const LOCALES = ['pt-BR', 'en', 'es']
const LANGUAGE_NAMES = {
  abap: 'ABAP',
  assembly: 'Assembly',
  c: 'C',
  dart: 'Dart',
  go: 'Go',
  java: 'Java',
  php: 'PHP',
  python: 'Python',
  rust: 'Rust',
  typescript: 'TypeScript',
}
const catalog = buildPageCatalog({ locales: LOCALES, languageSlugs: Object.keys(LANGUAGE_NAMES) })
const i18n = createSiteI18n()

/** A `t` bound to one locale, as usePageHead passes it. */
function tFor(locale) {
  return (key, params) => i18n.global.t(key, params ?? {}, { locale })
}

function headFor(path, extra = {}) {
  const page = findCatalogPage(catalog, path)
  return buildPageHead({
    page,
    t: tFor(page.locale),
    languageName: page.slug ? LANGUAGE_NAMES[page.slug] : undefined,
    ...extra,
  })
}

/** Finds a meta tag by name or property (og:locale:alternate has two, see below). */
function metaContent(head, nameOrProperty) {
  return head.meta.find(
    (entry) => entry.name === nameOrProperty || entry.property === nameOrProperty,
  )?.content
}

function linksByRel(head, rel) {
  return head.link.filter((entry) => entry.rel === rel)
}

describe('buildPageHead (US2)', () => {
  it.each([
    ['/pt-BR/languages/rust', 'Hello World em Rust — exemplos de código'],
    ['/en/languages/rust', 'Hello World in Rust — code examples'],
    ['/es/languages/rust', 'Hello World en Rust — ejemplos de código'],
  ])('titles the language page %s "%s"', (path, title) => {
    expect(headFor(path).title).toBe(title)
  })

  it.each([
    ['/pt-BR', 'Hello World em Muitas Linguagens'],
    ['/en', 'Hello World in Many Languages'],
    ['/es', 'Hello World en Muchos Lenguajes'],
    ['/pt-BR/history', 'A história do Hello World — Hello World em Muitas Linguagens'],
    ['/en/history', 'The history of Hello World — Hello World in Many Languages'],
    ['/es/history', 'La historia de Hello World — Hello World en Muchos Lenguajes'],
    ['/pt-BR/about', 'Sobre — Hello World em Muitas Linguagens'],
    ['/en/about', 'About — Hello World in Many Languages'],
    ['/es/about', 'Acerca de — Hello World en Muchos Lenguajes'],
  ])('titles %s "%s" (seo-head-contract.md)', (path, title) => {
    expect(headFor(path).title).toBe(title)
  })

  it('gives all 39 catalog pages a unique title and a non-empty description', () => {
    const heads = catalog.map((page) => headFor(page.path))
    expect(new Set(heads.map((head) => head.title)).size).toBe(39)
    for (const head of heads) {
      expect(metaContent(head, 'description')?.length).toBeGreaterThan(0)
    }
  })

  it('uses the language name in the language page description', () => {
    expect(metaContent(headFor('/en/languages/python'), 'description')).toContain('Python')
  })

  it('sets <html lang> to the page locale', () => {
    expect(headFor('/es/about').htmlAttrs).toEqual({ lang: 'es' })
  })

  it("points the canonical at the page's own catalog URL", () => {
    const page = findCatalogPage(catalog, '/pt-BR/languages/rust')
    const canonical = linksByRel(headFor(page.path), 'canonical')
    expect(canonical).toHaveLength(1)
    expect(canonical[0].href).toBe(page.url)
  })

  it('declares 4 absolute alternates with x-default → en', () => {
    const alternates = linksByRel(headFor('/es/history'), 'alternate')
    expect(alternates.map((link) => link.hreflang)).toEqual(['pt-BR', 'en', 'es', 'x-default'])
    for (const link of alternates) {
      expect(link.href.startsWith('https://helloworld.valdir.dev.br/')).toBe(true)
    }
    expect(alternates.find((link) => link.hreflang === 'x-default').href).toBe(
      'https://helloworld.valdir.dev.br/en/history',
    )
  })

  it('keys every tag so client navigation replaces it instead of adding another', () => {
    const head = headFor('/en')
    for (const entry of [...head.meta, ...head.link]) {
      expect(entry.key).toBeTruthy()
    }
  })

  it('never reads window (works while pre-rendering)', () => {
    // A plain `t`: vue-i18n's own dev build reads window.performance.
    const page = findCatalogPage(catalog, '/pt-BR/languages/rust')
    const t = (key, params) => `${key}${params ? JSON.stringify(params) : ''}`
    vi.stubGlobal('window', undefined)
    try {
      expect(() => buildPageHead({ page, t, languageName: 'Rust' })).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

function jsonLd(head) {
  const scripts = head.script ?? []
  expect(scripts.length).toBeLessThanOrEqual(1)
  return scripts[0] ? JSON.parse(scripts[0].innerHTML) : undefined
}

describe('buildPageHead previews and structured data (US4)', () => {
  it('mirrors title, description and canonical into og:title, og:description and og:url', () => {
    const head = headFor('/pt-BR/languages/rust')
    expect(metaContent(head, 'og:title')).toBe(head.title)
    expect(metaContent(head, 'og:description')).toBe(metaContent(head, 'description'))
    expect(metaContent(head, 'og:url')).toBe(linksByRel(head, 'canonical')[0].href)
  })

  it('uses og:type website on home and article on history, about and language pages', () => {
    expect(metaContent(headFor('/en'), 'og:type')).toBe('website')
    for (const path of ['/en/history', '/en/about', '/en/languages/go']) {
      expect(metaContent(headFor(path), 'og:type')).toBe('article')
    }
  })

  it.each([
    ['/pt-BR', 'pt_BR', ['en_US', 'es_ES']],
    ['/en', 'en_US', ['pt_BR', 'es_ES']],
    ['/es', 'es_ES', ['pt_BR', 'en_US']],
  ])('sets og:locale on %s to %s with the other two as alternates', (path, own, others) => {
    const head = headFor(path)
    expect(metaContent(head, 'og:locale')).toBe(own)
    const alternates = head.meta
      .filter((entry) => entry.property === 'og:locale:alternate')
      .map((entry) => entry.content)
    expect(alternates).toEqual(others)
  })

  it('points og:image at the absolute 1200×630 share image, with alt text', () => {
    const head = headFor('/es/languages/python')
    expect(metaContent(head, 'og:image')).toBe('https://helloworld.valdir.dev.br/og-image.png')
    expect(metaContent(head, 'og:image:width')).toBe('1200')
    expect(metaContent(head, 'og:image:height')).toBe('630')
    expect(metaContent(head, 'og:image:alt')).toBe('Hello World en Muchos Lenguajes')
    expect(metaContent(head, 'og:site_name')).toBe('Hello World en Muchos Lenguajes')
  })

  it('declares a summary_large_image Twitter card with title, description and image', () => {
    const head = headFor('/en/about')
    expect(metaContent(head, 'twitter:card')).toBe('summary_large_image')
    expect(metaContent(head, 'twitter:title')).toBe(head.title)
    expect(metaContent(head, 'twitter:description')).toBe(metaContent(head, 'description'))
    expect(metaContent(head, 'twitter:image')).toBe('https://helloworld.valdir.dev.br/og-image.png')
  })

  it('gives each home WebSite JSON-LD', () => {
    expect(jsonLd(headFor('/pt-BR'))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Hello World em Muitas Linguagens',
      url: 'https://helloworld.valdir.dev.br/pt-BR',
      inLanguage: 'pt-BR',
      description: metaContent(headFor('/pt-BR'), 'description'),
    })
  })

  it('gives each language page TechArticle JSON-LD', () => {
    const head = headFor('/en/languages/rust', { lastmod: '2026-01-01' })
    expect(jsonLd(head)).toMatchObject({
      '@type': 'TechArticle',
      headline: 'Hello World in Rust — code examples',
      inLanguage: 'en',
      url: 'https://helloworld.valdir.dev.br/en/languages/rust',
      mainEntityOfPage: 'https://helloworld.valdir.dev.br/en/languages/rust',
      image: 'https://helloworld.valdir.dev.br/og-image.png',
      dateModified: '2026-01-01',
      author: { '@type': 'Person', name: 'Valdir Giorgi' },
      about: { '@type': 'ComputerLanguage', name: 'Rust' },
      isPartOf: { '@type': 'WebSite', url: 'https://helloworld.valdir.dev.br/en' },
    })
  })

  it("falls back to today's date for dateModified when there is no lastmod", () => {
    expect(jsonLd(headFor('/en/languages/rust')).dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('has no JSON-LD on history and about pages', () => {
    expect(jsonLd(headFor('/en/history'))).toBeUndefined()
    expect(jsonLd(headFor('/en/about'))).toBeUndefined()
  })

  it('escapes "<" in the JSON-LD so content can never close the script tag', () => {
    const head = headFor('/en/languages/rust', { languageName: '</script><b>' })
    const raw = head.script[0].innerHTML
    expect(raw).not.toContain('<')
    expect(raw).toContain('\\u003c/script>')
    expect(JSON.parse(raw).about.name).toBe('</script><b>')
  })

  it('links the ICO and SVG favicons and the Apple touch icon', () => {
    const head = headFor('/en')
    expect(linksByRel(head, 'icon')).toEqual([
      expect.objectContaining({ href: '/favicon.ico', sizes: '32x32' }),
      expect.objectContaining({ href: '/favicon.svg', type: 'image/svg+xml' }),
    ])
    expect(linksByRel(head, 'apple-touch-icon')).toEqual([
      expect.objectContaining({ href: '/apple-touch-icon.png' }),
    ])
  })
})

describe('buildPageHead for non-indexed documents (US5)', () => {
  function nonIndexedHead(kind, locale) {
    return buildPageHead({ page: { kind, locale }, t: tFor(locale) })
  }

  it('titles the root chooser in English and marks it noindex', () => {
    const head = nonIndexedHead('root', 'en')
    expect(head.htmlAttrs).toEqual({ lang: 'en' })
    expect(head.title).toBe('Hello World in Many Languages — choose your language')
    expect(metaContent(head, 'robots')).toBe('noindex, follow')
    expect(metaContent(head, 'og:type')).toBe('website')
  })

  it.each([
    ['pt-BR', 'Página não encontrada — Hello World em Muitas Linguagens'],
    ['en', 'Page not found — Hello World in Many Languages'],
    ['es', 'Página no encontrada — Hello World en Muchos Lenguajes'],
  ])('titles the %s not-found page "%s"', (locale, title) => {
    const head = nonIndexedHead('not-found', locale)
    expect(head.htmlAttrs).toEqual({ lang: locale })
    expect(head.title).toBe(title)
    expect(metaContent(head, 'description')?.length).toBeGreaterThan(0)
  })

  it.each(['root', 'not-found'])(
    'gives the %s document previews and icons but no canonical, alternates, og:url or JSON-LD',
    (kind) => {
      const head = nonIndexedHead(kind, 'en')
      expect(metaContent(head, 'robots')).toBe('noindex, follow')
      for (const property of ['og:title', 'og:description', 'og:locale', 'og:image']) {
        expect(metaContent(head, property)).toBeTruthy()
      }
      expect(metaContent(head, 'twitter:card')).toBe('summary_large_image')
      expect(metaContent(head, 'og:url')).toBeUndefined()
      expect(linksByRel(head, 'canonical')).toEqual([])
      expect(linksByRel(head, 'alternate')).toEqual([])
      expect(linksByRel(head, 'icon')).toHaveLength(2)
      expect(head.script).toEqual([])
    },
  )

  it('never marks a catalog page noindex', () => {
    for (const page of catalog) {
      expect(metaContent(headFor(page.path), 'robots')).toBeUndefined()
    }
  })
})
