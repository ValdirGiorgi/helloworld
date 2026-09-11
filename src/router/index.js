import { createRouter, createWebHistory } from 'vue-router'
import { SUPPORTED_CODES, resolveInitialLocale } from '../composables/useLocale.js'

const routes = [
  {
    path: '/:locale(pt-BR|en|es)',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
  },
  {
    path: '/:locale(pt-BR|en|es)/history',
    name: 'history',
    component: () => import('../pages/HistoryPage.vue'),
  },
  {
    path: '/:locale(pt-BR|en|es)/languages/:slug',
    name: 'language-detail',
    component: () => import('../pages/LanguageDetailPage.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// FR-016: an address with no (or an invalid) language resolves to one of the
// three language-specific addresses — the visitor's stored manual preference
// if present, otherwise the country-based detection rule.
//
// Checks the raw path segment (not `to.params.locale`) so this also
// correctly recognizes an already-locale-prefixed but otherwise unmatched
// address (e.g. a typo'd sub-path) and lets it through instead of
// re-prefixing it again and again — `to.params` is only populated when a
// route fully matches, which an unknown sub-path under a valid locale would
// not.
router.beforeEach((to) => {
  const firstSegment = to.path.split('/')[1]
  if (SUPPORTED_CODES.includes(firstSegment)) return true

  const locale = resolveInitialLocale()
  const suffix = to.fullPath === '/' ? '' : to.fullPath
  return `/${locale}${suffix}`
})

export default router
