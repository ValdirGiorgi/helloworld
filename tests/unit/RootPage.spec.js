import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import RootPage from '../../src/pages/RootPage.vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

function mockLanguages(languages) {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true })
  Object.defineProperty(window.navigator, 'language', {
    value: languages[0] ?? '',
    configurable: true,
  })
}

async function mountRoot() {
  const router = await createTestRouter('/')
  const replace = vi.spyOn(router, 'replace')
  const wrapper = mount(RootPage, { global: { plugins: [createSiteI18n(), router] } })
  await flushPromises()
  return { wrapper, replace }
}

describe('RootPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders a plain link to each of the three homes', async () => {
    mockLanguages(['en-US'])
    const { wrapper } = await mountRoot()
    const links = wrapper.findAll('a')
    expect(links.map((link) => link.attributes('href'))).toEqual(['/pt-BR', '/en', '/es'])
    expect(links.map((link) => link.text())).toEqual([
      expect.stringContaining('Português'),
      expect.stringContaining('English'),
      expect.stringContaining('Español'),
    ])
  })

  it('redirects after mount to the stored preference', async () => {
    mockLanguages(['en-US'])
    window.localStorage.setItem('site-locale', 'es')
    const { replace } = await mountRoot()
    expect(replace).toHaveBeenCalledWith('/es')
  })

  it('redirects after mount by the country rule when nothing is stored', async () => {
    mockLanguages(['pt-BR'])
    const { replace } = await mountRoot()
    expect(replace).toHaveBeenCalledWith('/pt-BR')
  })
})
