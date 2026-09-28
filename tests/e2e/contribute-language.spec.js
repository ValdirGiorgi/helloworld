import fs from 'node:fs'
import path from 'node:path'
import { test, expect } from '@playwright/test'

const FIXTURE_PATH = path.resolve(
  new URL('.', import.meta.url).pathname,
  '../../content/languages/e2e-fixture-lang.md',
)

const FIXTURE_CONTENT = `---
name: "E2E Fixture Lang"
---

## Hello World

\`\`\`
print("Hello, World!")
\`\`\`

## Conditional

\`\`\`
if (n > 5) { print("big") }
\`\`\`

## Calculation

- result: 4
  \`\`\`
  result = (1 + 1) * 2
  \`\`\`

## Loop

- result: 1 2 3 4 5
  \`\`\`
  for i in 1..5 { print(i) }
  \`\`\`

## Function

- result: 5
  \`\`\`
  add(2, 3)
  \`\`\`

## String Concatenation

- result: Hello, Mary
  \`\`\`
  "Hello, " + name
  \`\`\`

## List

- result: 6
  \`\`\`
  sum([1, 2, 3])
  \`\`\`

## Boolean Comparison

- result: true
  \`\`\`
  age >= 18
  \`\`\`

## Variables

- integer:
  \`\`\`
  age = 25
  \`\`\`
- string:
  \`\`\`
  name = "Mary"
  \`\`\`
- float:
  \`\`\`
  price = 9.99
  \`\`\`
`

test.describe('Contributing a new language (US4)', () => {
  test.beforeAll(() => {
    fs.writeFileSync(FIXTURE_PATH, FIXTURE_CONTENT, 'utf8')
  })

  test.afterAll(() => {
    fs.rmSync(FIXTURE_PATH, { force: true })
  })

  test('a language added from the template appears and expands like the launch languages', async ({
    page,
  }) => {
    await page.goto('/')

    const card = page.getByTestId('language-card-e2e-fixture-lang')
    await expect(card).toBeVisible()
    await expect(card).toContainText('Hello, World!')
    await expect(card.getByTestId('expandable-section')).toBeHidden()

    await card.getByRole('button').click()
    const expanded = card.getByTestId('expandable-section')
    await expect(expanded).toBeVisible()
    for (const declaredResult of ['4', '1 2 3 4 5', '5', 'Hello, Mary', '6', 'true']) {
      await expect(expanded).toContainText(declaredResult)
    }
  })
})
