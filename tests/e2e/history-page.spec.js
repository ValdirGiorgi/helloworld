import { test, expect } from '@playwright/test'

// Pinned so this navigation-focused test is unaffected by the OS/CI's
// default locale (003-i18n-language-detection made the interface language
// depend on the browser's reported locale).
test.use({ locale: 'en-US' })

test('visitor can navigate to the History page via the nav menu', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'History' }).click()

  await expect(page).toHaveURL(/\/en\/history$/)
  await expect(page.getByRole('heading', { name: 'The history of Hello World' })).toBeVisible()
  await expect(page.getByRole('article')).toContainText('Brian Kernighan')
})
