import { test, expect } from '@playwright/test'

test.describe('Automatic locale detection (US1)', () => {
  test('a pt-BR browser locale shows the interface in Portuguese', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'pt-BR' })
    const page = await context.newPage()
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Hello World em muitas linguagens' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'História' })).toBeVisible()
    await expect(page.getByLabel('Buscar linguagem pelo nome')).toBeVisible()

    await context.close()
  })

  test('an es-MX browser locale shows the interface in Spanish', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'es-MX' })
    const page = await context.newPage()
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Hello World en muchos lenguajes' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Historia' })).toBeVisible()
    await expect(page.getByLabel('Buscar lenguaje por nombre')).toBeVisible()

    await context.close()
  })

  test('an en-US browser locale shows the interface in English', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' })
    const page = await context.newPage()
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Hello World in many languages' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'History' })).toBeVisible()
    await expect(page.getByLabel('Search language by name')).toBeVisible()

    await context.close()
  })

  test('a bare "es" locale with no region falls back to English', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'es' })
    const page = await context.newPage()
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Hello World in many languages' }),
    ).toBeVisible()

    await context.close()
  })
})

test.describe('History page translated for each locale (US1)', () => {
  for (const [locale, routeLocale, title] of [
    ['pt-BR', 'pt-BR', 'A história do Hello World'],
    ['es-MX', 'es', 'La historia de Hello World'],
    ['en-US', 'en', 'The history of Hello World'],
  ]) {
    test(`renders the History article in ${locale}`, async ({ browser }) => {
      const context = await browser.newContext({ locale })
      const page = await context.newPage()
      await page.goto(`/${routeLocale}/history`)

      await expect(page.getByRole('heading', { name: title })).toBeVisible()
      await expect(page.getByRole('article')).toContainText('Brian Kernighan')

      await context.close()
    })
  }

  // 009: an address without a locale is no longer redirected; it is the
  // English not-found page, whatever the browser locale (spec Clarifications).
  test('an address without a locale shows the English not-found page with the three homes', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'pt-BR' })
    const page = await context.newPage()
    await page.goto('/history')

    await expect(page).toHaveURL(/\/history$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
    const main = page.getByRole('main')
    for (const href of ['/pt-BR', '/en', '/es']) {
      await expect(main.locator(`a[href="${href}"]`)).toBeVisible()
    }

    await context.close()
  })
})

test.describe('Manual locale switch (US2)', () => {
  test.use({ locale: 'en-US' })

  test('switching locale immediately re-renders the page without a full navigation', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Hello World in many languages' })).toBeVisible()

    await page.getByRole('button', { name: 'Português' }).click()

    await expect(
      page.getByRole('heading', { name: 'Hello World em muitas linguagens' }),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/pt-BR\/?$/)
  })

  test('a manual choice persists across navigation and a full reload', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Español' }).click()
    await expect(
      page.getByRole('heading', { name: 'Hello World en muchos lenguajes' }),
    ).toBeVisible()

    await page.getByRole('link', { name: 'Historia' }).click()
    await expect(page.getByRole('heading', { name: 'La historia de Hello World' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'La historia de Hello World' })).toBeVisible()
  })
})
