import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import ptBR from './locales/pt-BR.js'
import es from './locales/es.js'

const messages = {
  en,
  'pt-BR': ptBR,
  es,
}

/**
 * Creates a new vue-i18n instance for one app instance. vite-ssg renders
 * routes concurrently in one Node process, so a module-level singleton would
 * leak one route's locale into another route's HTML (research.md §4).
 */
export function createSiteI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
  })
}
