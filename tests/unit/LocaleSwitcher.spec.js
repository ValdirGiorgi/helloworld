import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LocaleSwitcher from '../../src/components/layout/LocaleSwitcher.vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

const i18n = createSiteI18n()

function findByAriaLabel(wrapper, name) {
  return wrapper.findAll('button').find((btn) => btn.attributes('aria-label') === name)
}

describe('LocaleSwitcher', () => {
  it('renders one control per supported locale, accessibly labeled in its own language', async () => {
    const router = await createTestRouter('/en')
    const wrapper = mount(LocaleSwitcher, { global: { plugins: [i18n, router] } })
    for (const name of ['Português', 'English', 'Español']) {
      expect(findByAriaLabel(wrapper, name)).toBeTruthy()
    }
  })

  it('marks the active locale with aria-current', async () => {
    const router = await createTestRouter('/en')
    const wrapper = mount(LocaleSwitcher, { global: { plugins: [i18n, router] } })
    const active = findByAriaLabel(wrapper, 'English')
    expect(active.attributes('aria-current')).toBe('true')
  })

  it('calls setLocale, which navigates to the equivalent address under the new locale', async () => {
    const router = await createTestRouter('/en')
    const wrapper = mount(LocaleSwitcher, { global: { plugins: [i18n, router] } })
    const target = findByAriaLabel(wrapper, 'Español')
    await target.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.params.locale).toBe('es')
    expect(router.currentRoute.value.path).toBe('/es')
  })
})
