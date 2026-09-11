import { describe, it, expect } from 'vitest'
import en from '../../src/i18n/locales/en.js'
import ptBR from '../../src/i18n/locales/pt-BR.js'
import es from '../../src/i18n/locales/es.js'

function collectKeyPaths(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeyPaths(value, path)
    }
    return [path]
  })
}

describe('locale message dictionaries', () => {
  const locales = { en, 'pt-BR': ptBR, es }
  const keyPathsByLocale = Object.fromEntries(
    Object.entries(locales).map(([name, dict]) => [name, collectKeyPaths(dict).sort()]),
  )

  it('every locale has at least one message key', () => {
    for (const paths of Object.values(keyPathsByLocale)) {
      expect(paths.length).toBeGreaterThan(0)
    }
  })

  it('pt-BR has exactly the same key paths as en', () => {
    expect(keyPathsByLocale['pt-BR']).toEqual(keyPathsByLocale.en)
  })

  it('es has exactly the same key paths as en', () => {
    expect(keyPathsByLocale.es).toEqual(keyPathsByLocale.en)
  })
})
