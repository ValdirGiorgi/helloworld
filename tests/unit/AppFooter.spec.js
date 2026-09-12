import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../../src/components/layout/AppFooter.vue'
import i18n from '../../src/i18n/index.js'
import { PROJECT_REPO_URL } from '../../src/siteLinks.js'
import { createTestRouter } from './helpers/testRouter.js'

let globalMountOptions

beforeEach(async () => {
  globalMountOptions = { plugins: [i18n, await createTestRouter()] }
})

describe('AppFooter', () => {
  it("links to the project's real repository, not a placeholder", () => {
    const wrapper = mount(AppFooter, { global: globalMountOptions })
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe(PROJECT_REPO_URL)
    expect(link.attributes('href')).not.toBe('https://github.com/')
  })
})
