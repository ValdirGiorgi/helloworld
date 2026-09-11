import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryArticle from '../../src/components/history/HistoryArticle.vue'

describe('HistoryArticle', () => {
  it('renders the given title and body', () => {
    const wrapper = mount(HistoryArticle, {
      props: {
        title: 'A história do Hello World',
        body: '<p>Texto de teste</p>',
      },
    })

    expect(wrapper.text()).toContain('A história do Hello World')
    expect(wrapper.text()).toContain('Texto de teste')
  })
})
