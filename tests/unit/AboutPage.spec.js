import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutPage from '../../src/pages/AboutPage.vue'
import i18n from '../../src/i18n/index.js'
import { SPEC_KIT_REPO_URL, PROJECT_REPO_URL, BLOG_ARTICLE_URL } from '../../src/siteLinks.js'
import { createTestRouter } from './helpers/testRouter.js'

let globalMountOptions

beforeEach(async () => {
  globalMountOptions = { plugins: [i18n, await createTestRouter('/en/about')] }
})

function findLink(wrapper, href) {
  return wrapper.findAll('a').find((a) => a.attributes('href') === href)
}

describe('AboutPage', () => {
  it('mentions the project was created by Valdir Giorgi to test Spec Kit', () => {
    const wrapper = mount(AboutPage, { global: globalMountOptions })
    expect(wrapper.text()).toContain('Valdir Giorgi')
    expect(wrapper.text()).toContain('Spec Kit')
  })

  it('links to the Spec Kit repository, opened in a new tab', () => {
    const wrapper = mount(AboutPage, { global: globalMountOptions })
    const link = findLink(wrapper, SPEC_KIT_REPO_URL)
    expect(link).toBeTruthy()
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('links to the blog article about the project', () => {
    const wrapper = mount(AboutPage, { global: globalMountOptions })
    const link = findLink(wrapper, BLOG_ARTICLE_URL)
    expect(link).toBeTruthy()
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('links to the project repository and states it holds the contribution guide', () => {
    const wrapper = mount(AboutPage, { global: globalMountOptions })
    const link = findLink(wrapper, PROJECT_REPO_URL)
    expect(link).toBeTruthy()
    expect(wrapper.text().toLowerCase()).toContain('contribut')
  })
})
