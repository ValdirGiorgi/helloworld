import { test, expect } from '@playwright/test'

test.describe('About page (US1, US2)', () => {
  for (const [browserLocale, routeLocale, navLabel] of [
    ['pt-BR', 'pt-BR', 'Sobre'],
    ['en-US', 'en', 'About'],
    ['es-MX', 'es', 'Acerca de'],
  ]) {
    test(`reachable from the nav and translated in ${browserLocale}`, async ({ browser }) => {
      const context = await browser.newContext({ locale: browserLocale })
      const page = await context.newPage()
      await page.goto('/')

      await page.getByRole('link', { name: navLabel }).click()

      await expect(page).toHaveURL(new RegExp(`/${routeLocale}/about$`))
      await expect(page.getByRole('heading', { name: navLabel })).toBeVisible()
      await expect(page.getByText('Valdir Giorgi')).toBeVisible()

      await context.close()
    })
  }

  test.use({ locale: 'en-US' })

  test('links to Spec Kit, the blog article, and the project repository', async ({ page }) => {
    await page.goto('/en/about')

    const specKitLink = page.getByRole('link', { name: 'Spec Kit repository' })
    await expect(specKitLink).toHaveAttribute('href', 'https://github.com/github/spec-kit')
    await expect(specKitLink).toHaveAttribute('target', '_blank')

    const blogLink = page.getByRole('link', { name: 'Blog post about this project' })
    await expect(blogLink).toHaveAttribute('href', 'https://blog.valdir.dev.br/speckit')

    const repoLink = page.getByRole('link', { name: 'Project repository' })
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/ValdirGiorgi/helloworld')

    await expect(page.getByText(/contribution guide/i)).toBeVisible()
  })
})

test.describe('Footer repository link (US3)', () => {
  test.use({ locale: 'en-US' })

  test('points at the real project repository on every page', async ({ page }) => {
    for (const path of ['/en', '/en/history', '/en/about']) {
      await page.goto(path)
      const link = page.getByRole('link', { name: 'GitHub' })
      await expect(link).toHaveAttribute('href', 'https://github.com/ValdirGiorgi/helloworld')
    }
  })
})
