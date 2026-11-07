import { test, expect } from '@playwright/test'

// Pinned so this mechanics-focused test is unaffected by the OS/CI's default
// locale (003-i18n-language-detection made the interface language depend on
// the browser's reported locale).
test.use({ locale: 'en-US' })

test.describe('Searching for a language by name (US1)', () => {
  test('filters by full name, partial/lowercase term, shows no-results, and clears', async ({
    page,
  }) => {
    await page.goto('/')

    const search = page.getByLabel('Search language by name')

    await search.fill('Java')
    await expect(page.getByTestId('language-card-java')).toBeVisible()
    await expect(page.getByTestId('language-card-python')).toBeHidden()

    await search.fill('pyt')
    await expect(page.getByTestId('language-card-python')).toBeVisible()
    await expect(page.getByTestId('language-card-java')).toBeHidden()

    await search.fill('xyzxyz')
    await expect(page.getByText('No language found')).toBeVisible()
    await expect(page.getByTestId('language-card-java')).toBeHidden()

    await search.fill('')
    for (const slug of ['java', 'python', 'dart', 'abap', 'php', 'typescript', 'rust', 'go', 'c', 'assembly']) {
      await expect(page.getByTestId(`language-card-${slug}`)).toBeVisible()
    }
  })
})
