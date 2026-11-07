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

function generate() {
  return generateSitemap({
    origin: ORIGIN,
    locales: LOCALES,
    pageKinds: PAGE_KINDS,
    languageSlugs: LANGUAGE_SLUGS,
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

  it('never includes priority, changefreq, or lastmod', () => {
    const xml = generate()
    expect(xml).not.toContain('<priority>')
    expect(xml).not.toContain('<changefreq>')
    expect(xml).not.toContain('<lastmod>')
  })

  it('builds language-detail addresses from the given slugs, for every locale', () => {
    const xml = generate()
    expect(xml).toContain(`<loc>${ORIGIN}/en/languages/python</loc>`)
    expect(xml).toContain(`<loc>${ORIGIN}/pt-BR/languages/python</loc>`)
    expect(xml).toContain(`<loc>${ORIGIN}/es/languages/python</loc>`)
  })
})
