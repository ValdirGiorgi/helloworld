import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageDetailPage from '../../src/pages/LanguageDetailPage.vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import ptBR from '../../src/i18n/locales/pt-BR.js'
import { createTestRouter } from './helpers/testRouter.js'

describe('LanguageDetailPage', () => {
  it('links back to the home of its locale and hides the card\'s own "See all" link', async () => {
    const router = await createTestRouter('/pt-BR/languages/rust')
    const i18n = createSiteI18n()
    const wrapper = mount(LanguageDetailPage, {
      props: { slug: 'rust' },
      global: { plugins: [i18n, router] },
    })

    const back = wrapper.get('a[href="/pt-BR"]')
    expect(back.text()).toContain(ptBR.languageDetail.backToList)
    expect(back.get('[aria-hidden="true"]').text()).toBe('←')
    expect(wrapper.find('[data-testid="language-page-link-rust"]').exists()).toBe(false)
  })
})
