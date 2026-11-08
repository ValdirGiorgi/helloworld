import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSearch from '../../src/components/language/LanguageSearch.vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

const i18n = createSiteI18n()

let globalMountOptions

beforeEach(async () => {
  globalMountOptions = { plugins: [i18n, await createTestRouter()] }
})

describe('LanguageSearch', () => {
  it('renders a labeled search input', () => {
    const wrapper = mount(LanguageSearch, { global: globalMountOptions })
    const input = wrapper.find('input[type="search"]')
    expect(input.exists()).toBe(true)
    const label = wrapper.find(`label[for="${input.attributes('id')}"]`)
    expect(label.exists()).toBe(true)
  })

  it('emits update:modelValue with the input value on input', async () => {
    const wrapper = mount(LanguageSearch, { props: { modelValue: '' }, global: globalMountOptions })
    const input = wrapper.find('input[type="search"]')
    await input.setValue('Java')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Java']])
  })

  it('reflects the modelValue prop in the input', () => {
    const wrapper = mount(LanguageSearch, {
      props: { modelValue: 'Python' },
      global: globalMountOptions,
    })
    expect(wrapper.find('input[type="search"]').element.value).toBe('Python')
  })
})
