import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSidebar from '../../src/components/layout/LanguageSidebar.vue'
import { createSiteI18n } from '../../src/i18n/index.js'
import { createTestRouter } from './helpers/testRouter.js'

const i18n = createSiteI18n()

let globalMountOptions

beforeEach(async () => {
  globalMountOptions = { plugins: [i18n, await createTestRouter()] }
})

const languages = [
  { slug: 'java', name: 'Java' },
  { slug: 'python', name: 'Python' },
]

describe('LanguageSidebar', () => {
  it('renders one link per language pointing at its anchor', () => {
    const wrapper = mount(LanguageSidebar, { props: { languages, isOpen: false }, global: globalMountOptions })
    const links = wrapper.findAll('nav a')
    expect(links).toHaveLength(2)
    expect(links[0].attributes('href')).toBe('#language-java')
    expect(links[1].attributes('href')).toBe('#language-python')
  })

  it('emits close when a language link is activated', async () => {
    const wrapper = mount(LanguageSidebar, { props: { languages, isOpen: true }, global: globalMountOptions })
    await wrapper.find('nav a').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('reflects isOpen in the panel translate class (closed vs open)', () => {
    const closed = mount(LanguageSidebar, { props: { languages, isOpen: false }, global: globalMountOptions })
    expect(closed.get('[data-testid="language-sidebar"]').classes()).toContain('-translate-x-full')

    const open = mount(LanguageSidebar, { props: { languages, isOpen: true }, global: globalMountOptions })
    expect(open.get('[data-testid="language-sidebar"]').classes()).toContain('translate-x-0')
  })

  it('only shows the backdrop when open', () => {
    const closed = mount(LanguageSidebar, { props: { languages, isOpen: false }, global: globalMountOptions })
    expect(closed.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false)

    const open = mount(LanguageSidebar, { props: { languages, isOpen: true }, global: globalMountOptions })
    expect(open.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true)
  })
})
