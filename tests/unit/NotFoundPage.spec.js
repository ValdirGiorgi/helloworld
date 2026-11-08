import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotFoundPage from '../../src/pages/NotFoundPage.vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import en from '../../src/i18n/locales/en.js'
import ptBR from '../../src/i18n/locales/pt-BR.js'
import { createTestRouter } from './helpers/testRouter.js'

async function mountAt(path) {
  const router = await createTestRouter(path)
  const i18n = createSiteI18n()
  const locale = router.currentRoute.value.params.locale
  if (locale) i18n.global.locale.value = locale
  return mount(NotFoundPage, { global: { plugins: [i18n, router] } })
}

describe('NotFoundPage', () => {
  it('speaks the locale of the address and links to that home', async () => {
    const wrapper = await mountAt('/pt-BR/nao-existe')
    expect(wrapper.get('h1').text()).toBe(ptBR.notFound.heading)
    expect(wrapper.text()).toContain(ptBR.notFound.body)
    expect(wrapper.get('a[href="/pt-BR"]').text()).toBe(ptBR.notFound.backHome)
    expect(wrapper.findAll('a')).toHaveLength(1)
  })

  it('falls back to English with links to all three homes when the address has no locale', async () => {
    const wrapper = await mountAt('/history')
    expect(wrapper.get('h1').text()).toBe(en.notFound.heading)
    expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual([
      '/pt-BR',
      '/en',
      '/es',
    ])
  })

  it('never includes the requested path in its markup', async () => {
    const wrapper = await mountAt('/pt-BR/some-unique-missing-path')
    expect(wrapper.html()).not.toContain('some-unique-missing-path')
  })
})
