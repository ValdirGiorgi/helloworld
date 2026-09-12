import { createRouter, createMemoryHistory } from 'vue-router'

const routes = [
  { path: '/:locale(pt-BR|en|es)', name: 'home', component: { template: '<div />' } },
  { path: '/:locale(pt-BR|en|es)/history', name: 'history', component: { template: '<div />' } },
  {
    path: '/:locale(pt-BR|en|es)/languages/:slug',
    name: 'language-detail',
    component: { template: '<div />' },
  },
  { path: '/:locale(pt-BR|en|es)/about', name: 'about', component: { template: '<div />' } },
]

/**
 * A real (in-memory) vue-router instance for unit-testing components/
 * composables that call useRoute()/useRouter() (e.g. useLocale()), mirroring
 * src/router/index.js's route shape without its browser-only history mode.
 */
export async function createTestRouter(initialPath = '/en') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  router.push(initialPath)
  await router.isReady()
  return router
}
