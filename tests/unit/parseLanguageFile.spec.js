import { describe, it, expect } from 'vitest'
import { parseLanguageFile } from '../../src/content/parseLanguageFile'

function validFixture({ calculationResult = '4', loopResult = '1 2 3 4 5' } = {}) {
  return `---
name: "Fixture Lang"
---

## Hello World

\`\`\`fixture
print("Hello, World!")
\`\`\`

## Conditional

\`\`\`fixture
if (n > 5) { print("big") } else { print("small") }
\`\`\`

## Calculation

- result: ${calculationResult}
  \`\`\`fixture
  result = (1 + 1) * 2
  \`\`\`

## Loop

- result: ${loopResult}
  \`\`\`fixture
  for i in 1..5 { print(i) }
  \`\`\`

## Function

- result: 5
  \`\`\`fixture
  function add(a, b) { return a + b }
  print(add(2, 3))
  \`\`\`

## String Concatenation

- result: Hello, Mary
  \`\`\`fixture
  name = "Mary"
  print("Hello, " + name)
  \`\`\`

## List

- result: 6
  \`\`\`fixture
  numbers = [1, 2, 3]
  print(sum(numbers))
  \`\`\`

## Boolean Comparison

- result: true
  \`\`\`fixture
  age = 18
  print(age >= 18)
  \`\`\`

## Variables

- integer:
  \`\`\`fixture
  age = 25
  \`\`\`
- string:
  \`\`\`fixture
  name = "Mary"
  \`\`\`
- float:
  \`\`\`fixture
  price = 9.99
  \`\`\`
`
}

describe('parseLanguageFile', () => {
  it('extracts a full LanguageEntry from a valid template file', () => {
    const entry = parseLanguageFile(validFixture(), 'fixture-lang.md')

    expect(entry.slug).toBe('fixture-lang')
    expect(entry.name).toBe('Fixture Lang')
    expect(entry.helloWorld.code).toContain('Hello, World!')
    expect(entry.conditional.code).toContain('if (n > 5)')
    expect(entry.calculation.code).toContain('(1 + 1) * 2')
    expect(entry.calculation.result).toBe('4')
    expect(entry.loop.code).toContain('for i in 1..5')
    expect(entry.loop.result).toBe('1 2 3 4 5')
    expect(entry.function.code).toContain('add')
    expect(entry.function.result).toBe('5')
    expect(entry.stringConcatenation.code).toContain('Mary')
    expect(entry.stringConcatenation.result).toBe('Hello, Mary')
    expect(entry.list.code).toContain('[1, 2, 3]')
    expect(entry.list.result).toBe('6')
    expect(entry.boolean.code).toContain('age')
    expect(entry.boolean.result).toBe('true')

    const kinds = entry.variables.map((v) => v.kind)
    expect(kinds).toContain('integer')
    expect(kinds).toContain('string')
    expect(kinds).toContain('float')
    const stringVariable = entry.variables.find((v) => v.kind === 'string')
    expect(stringVariable.code).toContain('Mary')
  })

  it('derives the slug from the filename', () => {
    const entry = parseLanguageFile(validFixture(), 'java.md')
    expect(entry.slug).toBe('java')
  })

  it('reads the frontmatter name whether it is single- or double-quoted', () => {
    const singleQuoted = validFixture().replace('name: "Fixture Lang"', "name: 'Fixture Lang'")
    const entry = parseLanguageFile(singleQuoted, 'fixture-lang.md')
    expect(entry.name).toBe('Fixture Lang')
  })

  it('throws a clear, section-naming error when the Calculation section is missing', () => {
    const withoutCalculation = validFixture().replace(/## Calculation[\s\S]*?(?=## Loop)/, '')
    expect(() => parseLanguageFile(withoutCalculation, 'broken.md')).toThrowError(
      /broken\.md.*Calculation/s,
    )
  })

  it('throws a clear error when the declared calculation result is not "4"', () => {
    const wrongResult = validFixture({ calculationResult: '7' })
    expect(() => parseLanguageFile(wrongResult, 'broken.md')).toThrowError(
      /broken\.md.*declares "Calculation" result "7"/s,
    )
  })

  it('throws a clear error when a required variable kind is missing', () => {
    const withoutFloat = validFixture().replace(/- float:[\s\S]*?```\n/, '')
    expect(() => parseLanguageFile(withoutFloat, 'broken.md')).toThrowError(/broken\.md.*float/s)
  })

  it('throws a clear, section-naming error when the Loop section is missing', () => {
    const withoutLoop = validFixture().replace(/## Loop[\s\S]*?(?=## Function)/, '')
    expect(() => parseLanguageFile(withoutLoop, 'broken.md')).toThrowError(/broken\.md.*Loop/s)
  })

  it('throws a clear error when the declared loop result is not "1 2 3 4 5"', () => {
    const wrongResult = validFixture({ loopResult: '1 2 3' })
    expect(() => parseLanguageFile(wrongResult, 'broken.md')).toThrowError(
      /broken\.md.*declares "Loop" result "1 2 3"/s,
    )
  })

  it('throws a clear error when String Concatenation still declares the old Portuguese outcome', () => {
    const legacy = validFixture().replace('- result: Hello, Mary', '- result: Olá, Mary')
    expect(() => parseLanguageFile(legacy, 'broken.md')).toThrowError(
      /broken\.md.*"String Concatenation" result "Olá, Mary".*"Hello, Mary"/s,
    )
  })
})
