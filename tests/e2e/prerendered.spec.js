import fs from 'node:fs'
import { test, expect } from '@playwright/test'
import ptBR from '../../src/i18n/locales/pt-BR.js'

// Runs only in the `prerendered` Playwright project, against `vite preview` of
// the built dist/ (playwright.config.js): every page must already carry its
// content in the HTML, and then hydrate into the same interactive app.

/** Collects console errors/warnings and Vue hydration messages for a page. */
function watchConsole(page) {
  const problems = []
  page.on('console', (message) => {
    const text = message.text()
    if (message.type() === 'error' || /hydration/i.test(text)) problems.push(text)
  })
  page.on('pageerror', (error) => problems.push(error.message))
  return problems
}

/** Counts full document loads (a client-side navigation makes none). */
function countDocumentRequests(page) {
  const counter = { count: 0 }
  page.on('request', (request) => {
    if (request.resourceType() === 'document') counter.count += 1
  })
  return counter
}

test.describe('Pre-rendered content without JavaScript (US1)', () => {
  test.use({ javaScriptEnabled: false })

  test('a language page carries its lang, code and 9 example sections in the HTML', async ({
    page,
  }) => {
    await page.goto('/pt-BR/languages/rust')
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.locator('#app')).toContainText('println!("Hello, World!")')

    const card = page.getByTestId('language-card-rust')
    const { languageCard: labels } = ptBR
    for (const label of [
      labels.helloWorld,
      labels.conditional,
      labels.calculation,
      labels.loop,
      labels.function,
      labels.stringConcatenation,
      labels.list,
      labels.boolean,
      ptBR.variables.integer,
    ]) {
      await expect(card).toContainText(label)
    }
    expect(await card.locator('pre').count()).toBeGreaterThanOrEqual(9)
  })

  for (const [path, heading] of [
    ['/es', 'Hello World en muchos lenguajes'],
    ['/en/history', 'The history of Hello World'],
    ['/pt-BR/about', 'Sobre'],
  ]) {
    test(`${path} shows its heading`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    })
  }
})

test.describe('Hydration and interactivity (US1)', () => {
  for (const path of ['/pt-BR', '/en/history', '/es/languages/python']) {
    test(`${path} hydrates with no console errors or hydration warnings`, async ({ page }) => {
      const problems = watchConsole(page)
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      expect(problems).toEqual([])
    })
  }

  test('search filters the cards and "Ver mais exemplos" expands a card on /pt-BR', async ({
    page,
  }) => {
    await page.goto('/pt-BR')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Buscar linguagem pelo nome').fill('rust')
    await expect(page.getByTestId('language-card-rust')).toBeVisible()
    await expect(page.getByTestId('language-card-python')).toBeHidden()

    const card = page.getByTestId('language-card-rust')
    await card.getByRole('button', { name: 'Ver mais exemplos' }).click()
    await expect(card.getByTestId('expandable-section')).toBeVisible()
  })

  test('switching to English goes to /en without a document reload', async ({ page }) => {
    await page.goto('/pt-BR')
    await page.waitForLoadState('networkidle')
    const documents = countDocumentRequests(page)

    await page.getByRole('button', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.getByRole('heading', { name: 'Hello World in many languages' })).toBeVisible()
    expect(documents.count).toBe(0)
  })

  test('switching language on a language page lands on the same page in English', async ({
    page,
  }) => {
    await page.goto('/pt-BR/languages/rust')
    await page.waitForLoadState('networkidle')
    const documents = countDocumentRequests(page)

    await page.getByRole('button', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en\/languages\/rust$/)
    await expect(page.getByTestId('language-card-rust')).toContainText('Conditional')
    expect(documents.count).toBe(0)
  })
})

test.describe('Per-page head on client navigation (US2)', () => {
  test('title, canonical and lang follow client navigation and the language switch', async ({
    page,
  }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    const canonical = page.locator('link[rel="canonical"]')

    // Client-side navigation through the app's own router (no document load).
    await page.evaluate(() =>
      document
        .querySelector('#app')
        .__vue_app__.config.globalProperties.$router.push('/en/languages/rust'),
    )
    await expect(page).toHaveTitle('Hello World in Rust — code examples')
    await expect(canonical).toHaveAttribute(
      'href',
      'https://helloworld.valdir.dev.br/en/languages/rust',
    )

    await page.getByRole('button', { name: 'Español' }).click()
    await expect(page).toHaveURL(/\/es\/languages\/rust$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page).toHaveTitle('Hello World en Rust — ejemplos de código')
    await expect(canonical).toHaveAttribute(
      'href',
      'https://helloworld.valdir.dev.br/es/languages/rust',
    )
    await expect(canonical).toHaveCount(1)
  })
})

test.describe('Internal links to language pages (US3)', () => {
  test('"See all Rust examples" opens the language page without a document reload', async ({
    page,
  }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    const documents = countDocumentRequests(page)

    const card = page.getByTestId('language-card-rust')
    await card.getByRole('button', { name: 'Show more examples' }).click()
    await expect(card.getByTestId('expandable-section')).toBeVisible()
    await expect(page).toHaveURL(/\/en$/)

    await card.getByRole('link', { name: 'See all Rust examples' }).click()
    await expect(page).toHaveURL(/\/en\/languages\/rust$/)
    await expect(page).toHaveTitle('Hello World in Rust — code examples')
    expect(documents.count).toBe(0)
  })
})

/** Serves `file` from dist/ for `path`, as Apache's ErrorDocument does (status 404). */
async function serveNotFoundDocument(page, path, file) {
  const body = fs.readFileSync(new URL(`../../dist/${file}`, import.meta.url), 'utf8')
  await page.route(`**${path}`, (route) =>
    route.fulfill({ status: 404, contentType: 'text/html; charset=utf-8', body }),
  )
}

test.describe('Root chooser without JavaScript (US5)', () => {
  test.use({ javaScriptEnabled: false })

  test('/ links to the three homes', async ({ page }) => {
    await page.goto('/')
    const main = page.getByRole('main')
    for (const href of ['/pt-BR', '/en', '/es']) {
      await expect(main.locator(`a[href="${href}"]`)).toBeVisible()
    }
  })
})

test.describe('Root redirect and not-found pages (US5)', () => {
  test.use({ locale: 'pt-BR' })

  test('/ lands on /pt-BR for a Brazilian browser', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/pt-BR$/)
    await expect(
      page.getByRole('heading', { name: 'Hello World em muitas linguagens' }),
    ).toBeVisible()
  })

  for (const [path, file, heading] of [
    ['/pt-BR/languages/xyz', 'pt-BR/404.html', 'Página não encontrada'],
    ['/pt-BR/nao-existe', 'pt-BR/404.html', 'Página não encontrada'],
    ['/history', '404.html', 'Page not found'],
  ]) {
    test(`${path} hydrates the ${file} document with no hydration warnings`, async ({ page }) => {
      await serveNotFoundDocument(page, path, file)
      const problems = watchConsole(page)

      await page.goto(path)
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
      await expect(page).toHaveTitle(new RegExp(heading))
      // The fulfilled 404 status itself is reported as a failed resource load.
      expect(problems.filter((text) => !/404/.test(text))).toEqual([])
    })
  }
})
