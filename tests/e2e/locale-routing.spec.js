import { test, expect } from '@playwright/test'

test.describe('Each language has its own address (US3)', () => {
  test('requesting /pt-BR, /en, and /es directly each shows that exact language', async ({
    browser,
  }) => {
    // No stored preference, and the context's own browser locale is
    // irrelevant here — the requested address itself must win.
    const context = await browser.newContext({ locale: 'en-US' })
    const page = await context.newPage()

    await page.goto('/pt-BR')
    await expect(
      page.getByRole('heading', { name: 'Hello World em muitas linguagens' }),
    ).toBeVisible()

    await page.goto('/en')
    await expect(page.getByRole('heading', { name: 'Hello World in many languages' })).toBeVisible()

    await page.goto('/es')
    await expect(
      page.getByRole('heading', { name: 'Hello World en muchos lenguajes' }),
    ).toBeVisible()

    await context.close()
  })

  test('requesting /en directly shows English even from a Spanish-speaking browser locale', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'es-MX' })
    const page = await context.newPage()
    await page.goto('/en')

    await expect(page.getByRole('heading', { name: 'Hello World in many languages' })).toBeVisible()

    await context.close()
  })

  test('a fresh visitor with no stored preference requesting the bare home address is redirected per the country rule', async ({
    browser,
  }) => {
    const ptContext = await browser.newContext({ locale: 'pt-BR' })
    const ptPage = await ptContext.newPage()
    await ptPage.goto('/')
    await expect(ptPage).toHaveURL(/\/pt-BR\/?$/)
    await ptContext.close()

    const enContext = await browser.newContext({ locale: 'en-US' })
    const enPage = await enContext.newPage()
    await enPage.goto('/')
    await expect(enPage).toHaveURL(/\/en\/?$/)
    await enContext.close()
  })

  test('a visitor with a stored manual preference requesting the bare home address is redirected to that preference, not fresh detection', async ({
    page,
  }) => {
    // First visit (English browser) manually switches to Spanish, storing the preference.
    await page.goto('/en')
    await page.getByRole('button', { name: 'Español' }).click()
    await expect(page).toHaveURL(/\/es\/?$/)

    // A later visit to the bare home address must honor the stored preference,
    // not fall back to fresh detection (which would resolve to English here).
    await page.goto('/')
    await expect(page).toHaveURL(/\/es\/?$/)
    await expect(
      page.getByRole('heading', { name: 'Hello World en muchos lenguajes' }),
    ).toBeVisible()
  })

  test('the switcher updates the address to the equivalent page under the new locale', async ({
    page,
  }) => {
    await page.goto('/en/history')
    await expect(page).toHaveURL(/\/en\/history$/)

    await page.getByRole('button', { name: 'Español' }).click()

    await expect(page).toHaveURL(/\/es\/history$/)
    await expect(page.getByRole('heading', { name: 'La historia de Hello World' })).toBeVisible()
  })

  test('the rendered page declares its language and links to its two counterparts', async ({
    page,
  }) => {
    await page.goto('/en/history')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    const alternates = page.locator('link[rel="alternate"]')
    await expect(alternates).toHaveCount(4)

    const ptBRHref = await page
      .locator('link[rel="alternate"][hreflang="pt-BR"]')
      .getAttribute('href')
    expect(ptBRHref).toContain('/pt-BR/history')

    const esHref = await page.locator('link[rel="alternate"][hreflang="es"]').getAttribute('href')
    expect(esHref).toContain('/es/history')

    const xDefaultHref = await page
      .locator('link[rel="alternate"][hreflang="x-default"]')
      .getAttribute('href')
    expect(xDefaultHref).toContain('/en/history')

    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonicalHref).toContain('/en/history')
  })
})
