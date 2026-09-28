import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageCard from '../../src/components/language/LanguageCard.vue'
import i18n from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

const entry = {
  slug: 'fixture-lang',
  name: 'Fixture Lang',
  helloWorld: { code: 'print("Hello, World!")' },
  conditional: { code: 'if (n > 5) { print("big") }' },
  calculation: { code: 'result = (1 + 1) * 2', result: '4' },
  loop: { code: 'for i in 1..5 { print(i) }', result: '1 2 3 4 5' },
  function: { code: 'add(2, 3)', result: '5' },
  stringConcatenation: { code: '"Hello, " + name', result: 'Hello, Mary' },
  list: { code: 'sum([1, 2, 3])', result: '6' },
  boolean: { code: 'age >= 18', result: 'true' },
  variables: [
    { kind: 'integer', code: 'age = 25' },
    { kind: 'string', code: 'name = "Mary"' },
    { kind: 'float', code: 'price = 9.99' },
  ],
}

describe('LanguageCard', () => {
  it('shows only the Hello World example by default', async () => {
    const router = await createTestRouter()
    const wrapper = mount(LanguageCard, { props: { entry }, global: { plugins: [i18n, router] } })

    expect(wrapper.text()).toContain('Fixture Lang')
    expect(wrapper.text()).toContain('Hello, World!')
    expect(wrapper.text()).not.toContain(entry.conditional.code)
    expect(wrapper.text()).not.toContain(entry.calculation.code)
    expect(wrapper.text()).not.toContain(entry.loop.code)
    expect(wrapper.text()).not.toContain(entry.function.code)
    expect(wrapper.text()).not.toContain(entry.stringConcatenation.code)
    expect(wrapper.text()).not.toContain(entry.list.code)
    expect(wrapper.text()).not.toContain(entry.boolean.code)
    expect(wrapper.text()).not.toContain(entry.variables[0].code)
  })

  it('reveals every fixed-outcome example and its declared result once expanded', async () => {
    const router = await createTestRouter()
    const wrapper = mount(LanguageCard, {
      props: { entry, startExpanded: true },
      global: { plugins: [i18n, router] },
    })

    expect(wrapper.text()).toContain(entry.calculation.code)
    expect(wrapper.text()).toContain(entry.loop.code)
    expect(wrapper.text()).toContain(entry.function.code)
    expect(wrapper.text()).toContain(entry.stringConcatenation.code)
    expect(wrapper.text()).toContain(entry.list.code)
    expect(wrapper.text()).toContain(entry.boolean.code)

    for (const result of ['4', '1 2 3 4 5', '5', 'Hello, Mary', '6', 'true']) {
      expect(wrapper.text()).toContain(result)
    }
  })
})
