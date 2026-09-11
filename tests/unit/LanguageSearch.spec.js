import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSearch from '../../src/components/language/LanguageSearch.vue'

describe('LanguageSearch', () => {
  it('renders a labeled search input', () => {
    const wrapper = mount(LanguageSearch)
    const input = wrapper.find('input[type="search"]')
    expect(input.exists()).toBe(true)
    const label = wrapper.find(`label[for="${input.attributes('id')}"]`)
    expect(label.exists()).toBe(true)
  })

  it('emits update:modelValue with the input value on input', async () => {
    const wrapper = mount(LanguageSearch, { props: { modelValue: '' } })
    const input = wrapper.find('input[type="search"]')
    await input.setValue('Java')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Java']])
  })

  it('reflects the modelValue prop in the input', () => {
    const wrapper = mount(LanguageSearch, { props: { modelValue: 'Python' } })
    expect(wrapper.find('input[type="search"]').element.value).toBe('Python')
  })
})
