import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { buildPageCatalog, findCatalogPage, SITE_ORIGIN } from '../../src/seo/pageCatalog.js'
import { routes } from '../../src/router/index.js'

const LOCALES = ['pt-BR', 'en', 'es']
const LANGUAGE_SLUGS = [
  'abap',
  'assembly',
  'c',
  'dart',
  'go',
  'java',
  'php',
  'python',
  'rust',
  'typescript',
]

function build(languageSlugs = LANGUAGE_SLUGS) {
  return buildPageCatalog({ locales: LOCALES, languageSlugs })
}

describe('buildPageCatalog', () => {
  it('builds 3 locales × (3 fixed pages + 10 slugs) = 39 pages with unique paths', () => {
    const catalog = build()
    expect(catalog).toHaveLength(39)
    expect(new Set(catalog.map((page) => page.path)).size).toBe(39)
  })

  it('gives /pt-BR/languages/rust its absolute URL and 4 alternates with x-default → en', () => {
    const page = findCatalogPage(build(), '/pt-BR/languages/rust')
    expect(page).toMatchObject({ kind: 'language-detail', locale: 'pt-BR', slug: 'rust' })
    expect(page.url).toBe('https://helloworld.valdir.dev.br/pt-BR/languages/rust')
    expect(page.alternates).toEqual([
      { hreflang: 'pt-BR', href: `${SITE_ORIGIN}/pt-BR/languages/rust` },
      { hreflang: 'en', href: `${SITE_ORIGIN}/en/languages/rust` },
      { hreflang: 'es', href: `${SITE_ORIGIN}/es/languages/rust` },
      { hreflang: 'x-default', href: `${SITE_ORIGIN}/en/languages/rust` },
    ])
  })

  it('never produces a path ending in a slash', () => {
    for (const page of build()) {
      expect(page.path.endsWith('/')).toBe(false)
    }
  })

  it('adds exactly 3 pages when a language slug is added', () => {
    expect(build([...LANGUAGE_SLUGS, 'zz-test']).length - build().length).toBe(3)
  })

  it('returns undefined for a path outside the catalog', () => {
    expect(findCatalogPage(build(), '/pt-BR/languages/xyz')).toBeUndefined()
  })

  it('resolves every catalog path to the router route named after its kind', () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    for (const page of build()) {
      expect(router.resolve(page.path).name).toBe(page.kind)
    }
  })
})
