import { describe, it, expect, beforeEach, vi } from 'vitest'

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

describe('router locale guard (FR-016)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.resetModules()
    window.history.replaceState(null, '', '/')
  })

  it('lets a request with a valid :locale segment through unchanged', async () => {
    mockLanguages(['en-US'])
    const { default: router } = await import('../../src/router/index.js')
    await router.push('/pt-BR/history')
    await router.isReady()
    expect(router.currentRoute.value.fullPath).toBe('/pt-BR/history')
    expect(router.currentRoute.value.params.locale).toBe('pt-BR')
  })

  it('redirects a no-locale address to the detected locale when no preference is stored', async () => {
    mockLanguages(['es-MX'])
    const { default: router } = await import('../../src/router/index.js')
    await router.push('/history')
    await router.isReady()
    expect(router.currentRoute.value.fullPath).toBe('/es/history')
  })

  it('redirects the bare root address to the detected locale', async () => {
    mockLanguages(['pt-BR'])
    const { default: router } = await import('../../src/router/index.js')
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/pt-BR')
  })

  it('redirects to the stored manual preference instead of running detection', async () => {
    window.localStorage.setItem('site-locale', 'pt-BR')
    mockLanguages(['en-US'])
    const { default: router } = await import('../../src/router/index.js')
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.params.locale).toBe('pt-BR')
  })

  it('falls back to en for an undeterminable locale with no stored preference', async () => {
    mockLanguages(['es'])
    const { default: router } = await import('../../src/router/index.js')
    await router.push('/languages/java')
    await router.isReady()
    expect(router.currentRoute.value.fullPath).toBe('/en/languages/java')
  })
})
