// vite-ssg creates the router itself (memory history while pre-rendering, web
// history in the browser), so this module only exports the route records
// (contracts/routes-and-output-contract.md). There is no global redirect: an
// address without a locale is the English not-found page, and only the bare
// root redirects, from RootPage after mount.
//
// Matching is case-sensitive (`sensitive: true`), like the server's files: by
// default vue-router would match /pt-br as the home with locale "pt-br", while
// Apache answers that address with the English 404 document.
export const routes = [
  {
    path: '/',
    name: 'root',
    component: () => import('../pages/RootPage.vue'),
  },
  {
    path: '/:locale(pt-BR|en|es)',
    sensitive: true,
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
  },
  {
    path: '/:locale(pt-BR|en|es)/history',
    sensitive: true,
    name: 'history',
    component: () => import('../pages/HistoryPage.vue'),
  },
  {
    path: '/:locale(pt-BR|en|es)/languages/:slug',
    sensitive: true,
    name: 'language-detail',
    component: () => import('../pages/LanguageDetailPage.vue'),
    props: true,
  },
  {
    path: '/:locale(pt-BR|en|es)/about',
    sensitive: true,
    name: 'about',
    component: () => import('../pages/AboutPage.vue'),
  },
  {
    path: '/:locale(pt-BR|en|es)/:pathMatch(.*)*',
    sensitive: true,
    name: 'not-found-locale',
    component: () => import('../pages/NotFoundPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue'),
  },
]
