import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale, SUPPORTED_CODES } from './useLocale.js'

function findOrCreate(selector, tagName, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(tagName)
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  return el
}

function pathWithLocale(path, locale) {
  const segments = path.split('/').filter(Boolean)
  segments[0] = locale
  return `/${segments.join('/')}`
}

/**
 * Keeps the document head in sync with the active route/locale (data-model.md
 * `SeoHeadTags`): <html lang>, the meta description, three hreflang alternate
 * links (one per supported locale) plus one x-default, and a self-referencing
 * canonical link. Call once, at the app's top level (App.vue) — see
 * contracts/component-contracts.md.
 */
export function useLocaleSeoTags() {
  const route = useRoute()
  const { t } = useLocale()

  watchEffect(() => {
    const currentLocale = route.params.locale
    if (!SUPPORTED_CODES.includes(currentLocale)) return

    document.title = t('header.title')
    document.documentElement.lang = currentLocale

    findOrCreate('meta[name="description"]', 'meta', {
      name: 'description',
      content: t('meta.description'),
    })

    const origin = window.location.origin
    const currentPath = route.path

    for (const code of SUPPORTED_CODES) {
      findOrCreate(`link[rel="alternate"][hreflang="${code}"]`, 'link', {
        rel: 'alternate',
        hreflang: code,
        href: `${origin}${pathWithLocale(currentPath, code)}`,
      })
    }

    findOrCreate('link[rel="alternate"][hreflang="x-default"]', 'link', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${origin}${pathWithLocale(currentPath, 'en')}`,
    })

    findOrCreate('link[rel="canonical"]', 'link', {
      rel: 'canonical',
      href: `${origin}${currentPath}`,
    })
  })
}
