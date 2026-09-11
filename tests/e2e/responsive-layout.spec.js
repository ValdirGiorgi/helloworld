import { test, expect } from '@playwright/test'

test.describe('Single-column layout without distortion (US3)', () => {
  test('stacks language cards in a single column with no horizontal scroll on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const javaBox = await page.getByTestId('language-card-java').boundingBox()
    const pythonBox = await page.getByTestId('language-card-python').boundingBox()
    expect(javaBox.x).toBeCloseTo(pythonBox.x, 0)
    expect(pythonBox.y).toBeGreaterThan(javaBox.y)

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })

  test('stacks in a single column with no horizontal scroll at increased desktop zoom', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.evaluate(() => {
      document.body.style.zoom = '2'
    })

    const javaBox = await page.getByTestId('language-card-java').boundingBox()
    const pythonBox = await page.getByTestId('language-card-python').boundingBox()
    expect(javaBox.x).toBeCloseTo(pythonBox.x, 0)
    expect(pythonBox.y).toBeGreaterThan(javaBox.y)

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(hasHorizontalScroll).toBe(false)
  })

  test('expanding a card does not shift the x-position or width of other cards', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const javaCard = page.getByTestId('language-card-java')
    const pythonCard = page.getByTestId('language-card-python')

    // Use document-relative Y (bounding box + scroll offset) since clicking a
    // button below the fold can auto-scroll the page, which would otherwise
    // look like a layout shift even though nothing actually moved.
    const absoluteBox = async (locator) => {
      const box = await locator.boundingBox()
      const scrollY = await page.evaluate(() => window.scrollY)
      return { ...box, y: box.y + scrollY }
    }

    const pythonBefore = await absoluteBox(pythonCard)

    await javaCard.getByRole('button').click()
    await expect(javaCard.getByTestId('expandable-section')).toBeVisible()

    const pythonAfter = await absoluteBox(pythonCard)
    expect(pythonAfter.x).toBeCloseTo(pythonBefore.x, 0)
    expect(pythonAfter.width).toBeCloseTo(pythonBefore.width, 0)
    expect(pythonAfter.y).toBeGreaterThan(pythonBefore.y)

    await javaCard.getByRole('button').click()
    await expect(javaCard.getByTestId('expandable-section')).toBeHidden()
    const pythonCollapsed = await absoluteBox(pythonCard)
    expect(pythonCollapsed.y).toBeCloseTo(pythonBefore.y, 0)
  })
})
