import { describe, it, expect } from 'vitest'
import { generateSitemap } from '../../src/build/generateSitemap.js'

const ORIGIN = 'https://helloworld.valdir.dev.br'
const LOCALES = ['pt-BR', 'en', 'es']
const PAGE_KINDS = [
  { name: 'home', path: (locale) => `/${locale}` },
  { name: 'history', path: (locale) => `/${locale}/history` },
  { name: 'about', path: (locale) => `/${locale}/about` },
  {
    name: 'language-detail',
    path: (locale, slug) => `/${locale}/languages/${slug}`,
    perSlug: true,
  },
]
const LANGUAGE_SLUGS = ['java', 'python', 'dart', 'abap', 'php', 'typescript', 'rust', 'go', 'c', 'assembly']

// One date per page path, as scripts/generate-sitemap.mjs passes from git.
const LASTMOD_BY_PATH = Object.fromEntries(
  PAGE_KINDS.flatMap((pageKind) =>
    (pageKind.perSlug ? LANGUAGE_SLUGS : [undefined]).flatMap((slug) =>
      LOCALES.map((locale, index) => [pageKind.path(locale, slug), `2026-0${index + 1}-15`]),
    ),
  ),
)

function generate() {
  return generateSitemap({
    origin: ORIGIN,
    locales: LOCALES,
    pageKinds: PAGE_KINDS,
    languageSlugs: LANGUAGE_SLUGS,
    lastmodByPath: LASTMOD_BY_PATH,
  })
}

function parseUrls(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1])
}

describe('generateSitemap', () => {
  it('declares the sitemap namespace and the xhtml alternate-language namespace', () => {
    const xml = generate()
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
  })

  it('contains exactly one <url> per (page kind × locale) plus (language slug × locale)', () => {
    const urls = parseUrls(generate())
    const expectedCount = 3 * LOCALES.length + LANGUAGE_SLUGS.length * LOCALES.length
    expect(urls).toHaveLength(expectedCount)
  })

  it('gives every <loc> an absolute address under the site origin, with no duplicates', () => {
    const xml = generate()
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

    for (const loc of locs) {
      expect(loc.startsWith(ORIGIN)).toBe(true)
    }
    expect(new Set(locs).size).toBe(locs.length)
  })

  it('declares one alternate per locale plus x-default pointing at English, for every entry', () => {
    const urls = parseUrls(generate())

    for (const urlBlock of urls) {
      const alternates = [
        ...urlBlock.matchAll(
          /<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)" \/>/g,
        ),
      ]
      expect(alternates).toHaveLength(LOCALES.length + 1)

      const hreflangs = alternates.map(([, hreflang]) => hreflang)
      expect(hreflangs).toEqual(expect.arrayContaining([...LOCALES, 'x-default']))

      const xDefault = alternates.find(([, hreflang]) => hreflang === 'x-default')
      const en = alternates.find(([, hreflang]) => hreflang === 'en')
      expect(xDefault[2]).toBe(en[2])
    }
  })

  it('never includes priority or changefreq', () => {
    const xml = generate()
    expect(xml).not.toContain('<priority>')
    expect(xml).not.toContain('<changefreq>')
  })

  it('gives every <url> a <lastmod> right after <loc>, taken from lastmodByPath', () => {
    for (const urlBlock of parseUrls(generate())) {
      const match = urlBlock.match(/<loc>[^<]+<\/loc>\n\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/)
      expect(match).not.toBeNull()
      const path = urlBlock.match(/<loc>([^<]+)<\/loc>/)[1].replace(ORIGIN, '')
      expect(match[1]).toBe(LASTMOD_BY_PATH[path])
    }
  })

  it('lists neither the root chooser nor the not-found documents', () => {
    const locs = [...generate().matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    expect(locs).not.toContain(`${ORIGIN}/`)
    expect(locs.some((loc) => loc.endsWith('/404'))).toBe(false)
  })

  it('builds language-detail addresses from the given slugs, for every locale', () => {
    const xml = generate()
    expect(xml).toContain(`<loc>${ORIGIN}/en/languages/python</loc>`)
    expect(xml).toContain(`<loc>${ORIGIN}/pt-BR/languages/python</loc>`)
    expect(xml).toContain(`<loc>${ORIGIN}/es/languages/python</loc>`)
  })
})
