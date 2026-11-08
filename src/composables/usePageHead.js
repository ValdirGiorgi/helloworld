import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import lastmodByPath from 'virtual:page-lastmod'
import { useLocale, SUPPORTED_CODES } from './useLocale.js'
import { LANGUAGE_NAMES } from '../content/languageNames.js'
import { buildPageCatalog, findCatalogPage } from '../seo/pageCatalog.js'
import { buildPageHead } from '../seo/buildPageHead.js'

/**
 * Drives the document head from the current route through @unhead/vue, so the
 * same tags are rendered into the pre-rendered HTML and updated on client
 * navigation (research.md §2). Call once, at the app's top level (App.vue).
 */
export function usePageHead() {
  const route = useRoute()
  const { locale } = useLocale()
  const { t } = useI18n({ useScope: 'global' })
  const catalog = buildPageCatalog({
    locales: SUPPORTED_CODES,
    languageSlugs: Object.keys(LANGUAGE_NAMES),
  })

  const head = computed(() => {
    const path = route.path.length > 1 ? route.path.replace(/\/$/, '') : route.path
    // Anything outside the catalog that is not the root — the not-found routes
    // and a language page with an unknown slug — gets the not-found head, so
    // there is never a title with an empty name or a canonical for a 404.
    const page = findCatalogPage(catalog, path) ?? {
      kind: route.name === 'root' ? 'root' : 'not-found',
      locale: locale.value,
    }

    return buildPageHead({
      page,
      t: (key, params) => t(key, params ?? {}, { locale: page.locale }),
      languageName: page.slug ? LANGUAGE_NAMES[page.slug] : undefined,
      lastmod: lastmodByPath[page.path],
    })
  })

  useHead(head)
}
