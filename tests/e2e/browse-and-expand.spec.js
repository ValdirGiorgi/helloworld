import { test, expect } from '@playwright/test'

// Pinned so these mechanics-focused tests are unaffected by the OS/CI's
// default locale (003-i18n-language-detection made the interface language
// depend on the browser's reported locale).
test.use({ locale: 'en-US' })

const LAUNCH_LANGUAGES = ['Java', 'Python', 'Dart', 'ABAP', 'PHP', 'TypeScript', 'Rust', 'Go', 'C', 'Assembly']

test.describe('Browsing Hello World across languages (US1)', () => {
  test('lists all 10 launch languages showing only Hello World by default', async ({ page }) => {
    await page.goto('/')

    for (const name of LAUNCH_LANGUAGES) {
      const card = page.getByTestId(`language-card-${name.toLowerCase()}`)
      await expect(card).toBeVisible()
      await expect(card).toContainText('Hello, World!')
      await expect(card.getByTestId('expandable-section')).toBeHidden()
    }
  })
})

test.describe('Expanding a language entry (US2)', () => {
  test('reveals conditional/calculation/variables with a matching result, then collapses back', async ({
    page,
  }) => {
    await page.goto('/')

    for (const name of LAUNCH_LANGUAGES) {
      const card = page.getByTestId(`language-card-${name.toLowerCase()}`)
      await card.getByRole('button').click()

      const expanded = card.getByTestId('expandable-section')
      await expect(expanded).toBeVisible()
      await expect(expanded).toContainText('Conditional')
      for (const declaredResult of ['4', '1 2 3 4 5', '5', 'Hello, Mary', '6', 'true']) {
        await expect(expanded).toContainText(declaredResult)
      }
      await expect(expanded).toContainText('Mary')

      await card.getByRole('button').click()
      await expect(card.getByTestId('expandable-section')).toBeHidden()
    }
  })
})
