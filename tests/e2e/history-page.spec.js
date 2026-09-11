import { test, expect } from '@playwright/test'

test('visitor can navigate to the History page via the nav menu', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'História' }).click()

  await expect(page).toHaveURL(/#\/history$/)
  await expect(page.getByRole('heading', { name: 'A história do Hello World' })).toBeVisible()
  await expect(page.getByRole('article')).toContainText('Brian Kernighan')
})
