import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageCard from '../../src/components/language/LanguageCard.vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

const i18n = createSiteI18n()

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

  it('links to its own language page with a translated "See all" link, collapsed and expanded', async () => {
    const router = await createTestRouter('/en')
    const wrapper = mount(LanguageCard, { props: { entry }, global: { plugins: [i18n, router] } })

    const link = () => wrapper.get('[data-testid="language-page-link-fixture-lang"]')
    expect(link().element.tagName).toBe('A')
    expect(link().attributes('href')).toBe('/en/languages/fixture-lang')
    expect(link().text()).toBe('See all Fixture Lang examples')

    await wrapper.get('button').trigger('click')
    expect(wrapper.find('[data-testid="expandable-section"]').exists()).toBe(true)
    expect(link().attributes('href')).toBe('/en/languages/fixture-lang')
  })

  it('clicking the page link does not toggle the card', async () => {
    const router = await createTestRouter('/en')
    const wrapper = mount(LanguageCard, { props: { entry }, global: { plugins: [i18n, router] } })

    await wrapper.get('[data-testid="language-page-link-fixture-lang"]').trigger('click')
    expect(wrapper.find('[data-testid="expandable-section"]').exists()).toBe(false)
  })

  it('clicking "Show more examples" expands in place without navigating', async () => {
    const router = await createTestRouter('/en')
    const wrapper = mount(LanguageCard, { props: { entry }, global: { plugins: [i18n, router] } })

    await wrapper.get('button').trigger('click')
    await new Promise((resolve) => setTimeout(resolve))
    expect(wrapper.find('[data-testid="expandable-section"]').exists()).toBe(true)
    expect(router.currentRoute.value.fullPath).toBe('/en')
  })

  it('renders no page link when showPageLink is false', async () => {
    const router = await createTestRouter('/en')
    const wrapper = mount(LanguageCard, {
      props: { entry, showPageLink: false },
      global: { plugins: [i18n, router] },
    })
    expect(wrapper.find('[data-testid="language-page-link-fixture-lang"]').exists()).toBe(false)
  })
})
