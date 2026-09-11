import { test, expect } from '@playwright/test'

test.describe('Sidebar navigation on desktop (US2)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('sidebar is visible without interaction, lists every language, and jumps to it', async ({
    page,
  }) => {
    await page.goto('/')

    const sidebar = page.getByTestId('language-sidebar')
    await expect(sidebar).toBeVisible()
    for (const name of ['Java', 'Python', 'Dart', 'ABAP', 'PHP']) {
      await expect(sidebar.getByRole('link', { name })).toBeVisible()
    }

    await sidebar.getByRole('link', { name: 'Python' }).click()
    await expect(page.getByTestId('language-card-python')).toBeInViewport()
  })
})

test.describe('Sidebar navigation on mobile (US2)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('sidebar is hidden behind a toggle, opens as an overlay, and closes after selecting a language', async ({
    page,
  }) => {
    await page.goto('/')

    const sidebar = page.getByTestId('language-sidebar')
    await expect(sidebar).not.toBeInViewport()

    const toggle = page.getByRole('button', { name: 'Linguagens' })
    await toggle.click()
    await expect(sidebar).toBeInViewport()

    await sidebar.getByRole('link', { name: 'Dart' }).click()
    await expect(page.getByTestId('language-card-dart')).toBeInViewport()
    await expect(sidebar).not.toBeInViewport()
  })
})
