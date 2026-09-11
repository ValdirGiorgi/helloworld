import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageList from '../../src/components/language/LanguageList.vue'

function makeEntry(slug, name) {
  return {
    slug,
    name,
    helloWorld: { code: `print("Hello, World!") // ${name}` },
    conditional: { code: 'if (n > 5) {}' },
    calculation: { code: '(1+1)*2', result: '4' },
    loop: { code: 'for i in 1..5 {}', result: '1 2 3 4 5' },
    function: { code: 'somar(2,3)', result: '5' },
    stringConcatenation: { code: '"Olá, " + name', result: 'Olá, Mary' },
    list: { code: 'sum([1,2,3])', result: '6' },
    boolean: { code: 'idade >= 18', result: 'true' },
    variables: [
      { kind: 'integer', code: 'age = 25' },
      { kind: 'string', code: 'name = "Mary"' },
      { kind: 'float', code: 'price = 9.99' },
    ],
  }
}

describe('LanguageList', () => {
  it('renders one LanguageCard per entry in the languages prop', () => {
    const languages = [makeEntry('java', 'Java'), makeEntry('python', 'Python')]
    const wrapper = mount(LanguageList, { props: { languages } })
    expect(wrapper.find('[data-testid="language-card-java"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="language-card-python"]').exists()).toBe(true)
  })

  it('renders its cards in a single-column layout with no multi-column class', () => {
    const languages = [makeEntry('java', 'Java')]
    const wrapper = mount(LanguageList, { props: { languages } })
    expect(wrapper.element.className).toContain('flex-col')
    expect(wrapper.element.className).not.toMatch(/grid-cols/)
  })

  it('shows a "no results" message when languages is empty', () => {
    const wrapper = mount(LanguageList, { props: { languages: [] } })
    expect(wrapper.text()).toContain('Nenhuma linguagem encontrada')
    expect(wrapper.find('[data-testid^="language-card-"]').exists()).toBe(false)
  })
})
