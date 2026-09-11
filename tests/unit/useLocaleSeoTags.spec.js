import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from 'vue'
import i18n from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

function clearHead() {
  document
    .querySelectorAll('link[rel="alternate"], link[rel="canonical"], meta[name="description"]')
    .forEach((el) => el.remove())
}

async function mountWithSeoTags(initialPath) {
  const router = await createTestRouter(initialPath)
  const { useLocaleSeoTags } = await import('../../src/composables/useLocaleSeoTags.js')
  const app = createApp({
    setup() {
      useLocaleSeoTags()
      return () => null
    },
  })
  app.use(i18n)
  app.use(router)
  const el = document.createElement('div')
  app.mount(el)
  await router.isReady()
  return router
}

describe('useLocaleSeoTags', () => {
  beforeEach(() => {
    clearHead()
    document.documentElement.lang = ''
  })

  it("sets <html lang> to the active locale", async () => {
    await mountWithSeoTags('/pt-BR')
    expect(document.documentElement.lang).toBe('pt-BR')
  })

  it('creates a meta description', async () => {
    await mountWithSeoTags('/en')
    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toBeTruthy()
    expect(meta.getAttribute('content')?.length).toBeGreaterThan(0)
  })

  it('creates three hreflang alternate links plus one x-default, and one canonical link', async () => {
    await mountWithSeoTags('/en/history')
    const alternates = document.querySelectorAll('link[rel="alternate"]')
    expect(alternates).toHaveLength(4)

    const hreflangs = Array.from(alternates).map((el) => el.getAttribute('hreflang'))
    expect(hreflangs.sort()).toEqual(['en', 'es', 'pt-BR', 'x-default'].sort())

    const ptBR = Array.from(alternates).find((el) => el.getAttribute('hreflang') === 'pt-BR')
    expect(ptBR.getAttribute('href')).toContain('/pt-BR/history')

    const xDefault = Array.from(alternates).find((el) => el.getAttribute('hreflang') === 'x-default')
    expect(xDefault.getAttribute('href')).toContain('/en/history')

    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical.getAttribute('href')).toContain('/en/history')
  })

  it('updates the tags again when the route/locale changes', async () => {
    const router = await mountWithSeoTags('/en')
    await router.push('/es')
    expect(document.documentElement.lang).toBe('es')
    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical.getAttribute('href')).toContain('/es')
    expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(4)
  })
})
