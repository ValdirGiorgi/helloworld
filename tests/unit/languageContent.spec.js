import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseLanguageFile } from '../../src/content/parseLanguageFile'

// Vitest runs from the repository root; import.meta.url is an http: URL under jsdom.
const languagesDir = join(process.cwd(), 'content', 'languages')

const EXPECTED_SLUGS = ['java', 'python', 'dart', 'abap', 'php', 'typescript', 'rust', 'go', 'c', 'assembly']
const LEGACY_TOKENS = ['Olá', 'Maior que', 'Menor ou igual', 'somar', 'idade']

const files = readdirSync(languagesDir)
  .filter((filename) => filename.endsWith('.md'))
  .sort()

describe('real language content follows the English-only contract', () => {
  it('includes every expected language file', () => {
    const slugs = files.map((filename) => filename.replace(/\.md$/, ''))
    expect(slugs).toEqual(expect.arrayContaining(EXPECTED_SLUGS))
  })

  describe.each(files)('%s', (filename) => {
    const raw = readFileSync(join(languagesDir, filename), 'utf8')

    it('parses with the real parser', () => {
      expect(() => parseLanguageFile(raw, filename)).not.toThrow()
    })

    it('declares "Hello, Mary" for String Concatenation', () => {
      expect(parseLanguageFile(raw, filename).stringConcatenation.result).toBe('Hello, Mary')
    })

    it('uses the fixed English wording and names', () => {
      const entry = parseLanguageFile(raw, filename)
      expect(entry.conditional.code).toContain('Greater than 5')
      expect(entry.conditional.code).toContain('Less than or equal to 5')
      expect(entry.function.code).toContain('add')
      expect(entry.stringConcatenation.code).toContain('Hello, ')
      expect(entry.boolean.code).toContain('age')
    })

    it.each(LEGACY_TOKENS)('contains no legacy Portuguese token "%s"', (token) => {
      expect(raw).not.toContain(token)
    })
  })
})

describe('contributor template follows the English-only contract', () => {
  const template = readFileSync(join(process.cwd(), 'content', 'language-template.md'), 'utf8')

  it('declares "Hello, Mary" as the String Concatenation outcome', () => {
    expect(template).toContain('- result: Hello, Mary')
  })

  it('states the English-only rule and the fixed wording', () => {
    expect(template).toContain('ENGLISH-ONLY RULE')
    expect(template).toContain('Greater than 5')
    expect(template).toContain('Less than or equal to 5')
  })

  it.each(LEGACY_TOKENS)('contains no legacy Portuguese token "%s"', (token) => {
    expect(template).not.toContain(token)
  })
})
