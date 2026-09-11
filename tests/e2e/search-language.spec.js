import { test, expect } from '@playwright/test'

test.describe('Searching for a language by name (US1)', () => {
  test('filters by full name, partial/lowercase term, shows no-results, and clears', async ({
    page,
  }) => {
    await page.goto('/')

    const search = page.getByLabel('Buscar linguagem pelo nome')

    await search.fill('Java')
    await expect(page.getByTestId('language-card-java')).toBeVisible()
    await expect(page.getByTestId('language-card-python')).toBeHidden()

    await search.fill('pyt')
    await expect(page.getByTestId('language-card-python')).toBeVisible()
    await expect(page.getByTestId('language-card-java')).toBeHidden()

    await search.fill('xyzxyz')
    await expect(page.getByText('Nenhuma linguagem encontrada')).toBeVisible()
    await expect(page.getByTestId('language-card-java')).toBeHidden()

    await search.fill('')
    for (const slug of ['java', 'python', 'dart', 'abap', 'php']) {
      await expect(page.getByTestId(`language-card-${slug}`)).toBeVisible()
    }
  })
})
