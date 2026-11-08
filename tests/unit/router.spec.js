import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '../../src/router/index.js'
import { buildPageCatalog } from '../../src/seo/pageCatalog.js'

function createRouterUnderTest() {
  return createRouter({ history: createMemoryHistory(), routes })
}

describe('routes', () => {
  it('resolves the bare root to the language chooser', () => {
    expect(createRouterUnderTest().resolve('/').name).toBe('root')
  })

  it("resolves an unknown address under a locale to that locale's not-found page", () => {
    const route = createRouterUnderTest().resolve('/pt-BR/nao-existe')
    expect(route.name).toBe('not-found-locale')
    expect(route.params.locale).toBe('pt-BR')
  })

  it.each(['/history', '/fr/about', '/pt-br', '/languages/java'])(
    'resolves %s (no supported locale) to the English not-found page, with no redirect',
    async (path) => {
      const router = createRouterUnderTest()
      await router.push(path)
      expect(router.currentRoute.value.name).toBe('not-found')
      expect(router.currentRoute.value.fullPath).toBe(path)
    },
  )

  it('still resolves every catalog path to its own page kind', () => {
    const router = createRouterUnderTest()
    const catalog = buildPageCatalog({ locales: ['pt-BR', 'en', 'es'], languageSlugs: ['rust'] })
    for (const page of catalog) {
      expect(router.resolve(page.path).name).toBe(page.kind)
    }
  })
})
