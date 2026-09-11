import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExpandableSection from '../../src/components/language/ExpandableSection.vue'

describe('ExpandableSection', () => {
  it('hides slot content while collapsed and shows it once expanded', async () => {
    const wrapper = mount(ExpandableSection, {
      props: { isExpanded: false },
      slots: { default: '<p>Extra content</p>' },
    })

    expect(wrapper.find('[data-testid="expandable-section"]').exists()).toBe(false)

    await wrapper.setProps({ isExpanded: true })

    expect(wrapper.find('[data-testid="expandable-section"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Extra content')
  })

  it('emits toggle when the button is clicked', async () => {
    const wrapper = mount(ExpandableSection, { props: { isExpanded: false } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
