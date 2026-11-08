import { test, expect } from '@playwright/test'

test.describe('robots.txt (US1)', () => {
  test('is served as a real file, not the SPA shell', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)

    const body = await response.text()
    expect(body.toLowerCase()).not.toContain('<html')
    expect(body.toLowerCase()).not.toContain('<!doctype')
    expect(body).toContain('User-agent: *')
    expect(body).toContain('Allow: /')
    expect(body).toContain('Sitemap: https://helloworld.valdir.dev.br/sitemap.xml')
  })
})

test.describe('llms.txt (US2)', () => {
  test('is served as a real file, not the SPA shell', async ({ request }) => {
    const response = await request.get('/llms.txt')
    expect(response.status()).toBe(200)

    const body = await response.text()
    expect(body.toLowerCase()).not.toContain('<html')
    expect(body.toLowerCase()).not.toContain('<!doctype')
    expect(body).toMatch(/^# /m)
    expect(body).toMatch(/\[[^\]]+\]\([^)]+\)/)
    expect(body).toContain('/en')
    expect(body).toContain('/en/about')
    expect(body).toContain('/en/history')
  })
})

test.describe('favicon.ico (US4)', () => {
  test('is served as a real image, not the SPA shell', async ({ request }) => {
    const response = await request.get('/favicon.ico')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toMatch(/^image\//)

    const body = (await response.body()).toString('latin1').toLowerCase()
    expect(body).not.toContain('<html')
    expect(body).not.toContain('<!doctype')
  })
})
