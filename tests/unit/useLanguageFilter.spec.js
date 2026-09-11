import { describe, it, expect } from 'vitest'
import { useLanguageFilter } from '../../src/composables/useLanguageFilter'

const languages = [
  { slug: 'java', name: 'Java' },
  { slug: 'python', name: 'Python' },
  { slug: 'abap', name: 'ABAP' },
]

describe('useLanguageFilter', () => {
  it('matches a full name case-insensitively', () => {
    expect(useLanguageFilter(languages, 'java')).toEqual([languages[0]])
    expect(useLanguageFilter(languages, 'JAVA')).toEqual([languages[0]])
  })

  it('matches a partial substring', () => {
    expect(useLanguageFilter(languages, 'pyt')).toEqual([languages[1]])
  })

  it('returns every language, unmutated and in order, for an empty query', () => {
    const result = useLanguageFilter(languages, '')
    expect(result).toBe(languages)
  })

  it('returns every language for a whitespace-only query', () => {
    const result = useLanguageFilter(languages, '   ')
    expect(result).toBe(languages)
  })

  it('returns an empty array when nothing matches', () => {
    expect(useLanguageFilter(languages, 'xyzxyz')).toEqual([])
  })
})
