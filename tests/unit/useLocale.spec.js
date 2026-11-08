import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

const i18n = createSiteI18n()

function mockLanguages(languages) {
  Object.defineProperty(window.navigator, 'languages', {
    value: languages,
    configurable: true,
  })
  Object.defineProperty(window.navigator, 'language', {
    value: languages[0] ?? '',
    configurable: true,
  })
}

async function callUseLocale(initialPath = '/en', prepareRouter = async () => {}) {
  const router = await createTestRouter(initialPath)
  await prepareRouter(router)
  const { useLocale } = await import('../../src/composables/useLocale.js')
  let result
  const app = createApp({
    setup() {
      result = useLocale()
      return () => null
    },
  })
  app.use(i18n)
  app.use(router)
  const el = document.createElement('div')
  app.mount(el)
  return { ...result, router }
}

describe('resolveInitialLocale (used by the root redirect)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.resetModules()
  })

  it('detects Brazil (BR region) as pt-BR', async () => {
    mockLanguages(['pt-BR'])
    const { resolveInitialLocale } = await import('../../src/composables/useLocale.js')
    expect(resolveInitialLocale()).toBe('pt-BR')
  })

  it('detects a Spanish-speaking country region as es', async () => {
    mockLanguages(['es-MX'])
    const { resolveInitialLocale } = await import('../../src/composables/useLocale.js')
    expect(resolveInitialLocale()).toBe('es')
  })

  it('detects an unrelated region as en', async () => {
    mockLanguages(['en-US'])
    const { resolveInitialLocale } = await import('../../src/composables/useLocale.js')
    expect(resolveInitialLocale()).toBe('en')
  })

  it('falls back to en when no reported tag carries a region', async () => {
    mockLanguages(['es'])
    const { resolveInitialLocale } = await import('../../src/composables/useLocale.js')
    expect(resolveInitialLocale()).toBe('en')
  })

  it('uses a previously stored manual choice instead of running detection', async () => {
    mockLanguages(['pt-BR'])
    window.localStorage.setItem('site-locale', 'es')
    const { resolveInitialLocale } = await import('../../src/composables/useLocale.js')
    expect(resolveInitialLocale()).toBe('es')
  })

  it('returns en without throwing when there is no window or navigator (pre-rendering)', async () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('navigator', undefined)
    try {
      const { resolveInitialLocale } = await import('../../src/composables/useLocale.js')
      expect(resolveInitialLocale()).toBe('en')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('treats an invalid stored value as absent and falls back to detection', async () => {
    mockLanguages(['pt-BR'])
    window.localStorage.setItem('site-locale', 'fr')
    const { resolveInitialLocale } = await import('../../src/composables/useLocale.js')
    expect(resolveInitialLocale()).toBe('pt-BR')
  })
})

describe('useLocale', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("reflects the current route's :locale param", async () => {
    const { locale } = await callUseLocale('/pt-BR')
    expect(locale.value).toBe('pt-BR')
  })

  it('falls back to en on a route without a :locale param', async () => {
    const { locale } = await callUseLocale('/en', async (router) => {
      router.addRoute({ path: '/no-locale', name: 'no-locale', component: { render: () => null } })
      await router.push('/no-locale')
    })
    expect(locale.value).toBe('en')
  })

  it('updates when the route navigates to a different locale', async () => {
    const { locale, router } = await callUseLocale('/en')
    await router.push('/es')
    expect(locale.value).toBe('es')
  })

  it('setLocale persists the choice and navigates to the equivalent address under the new locale', async () => {
    const { setLocale, router } = await callUseLocale('/en/history')
    setLocale('pt-BR')
    await new Promise((resolve) => setTimeout(resolve))
    expect(window.localStorage.getItem('site-locale')).toBe('pt-BR')
    expect(router.currentRoute.value.fullPath).toBe('/pt-BR/history')
  })

  it.each([
    ['/', 'es', '/es'],
    ['/history', 'pt-BR', '/pt-BR'],
    ['/en/about', 'es', '/es/about'],
  ])('on %s, setLocale(%s) navigates to %s', async (from, code, to) => {
    const { setLocale, router } = await callUseLocale(from)
    setLocale(code)
    await new Promise((resolve) => setTimeout(resolve))
    expect(router.currentRoute.value.fullPath).toBe(to)
    expect(window.localStorage.getItem('site-locale')).toBe(code)
  })

  it('ignores an unsupported code passed to setLocale', async () => {
    const { setLocale, locale, router } = await callUseLocale('/en')
    setLocale('fr')
    await new Promise((resolve) => setTimeout(resolve))
    expect(locale.value).toBe('en')
    expect(router.currentRoute.value.path).toBe('/en')
  })
})
