import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '../../../src/router/index.js'

/**
 * A real (in-memory) vue-router instance for unit-testing components/
 * composables that call useRoute()/useRouter() (e.g. useLocale()), built from
 * src/router/index.js's own route records without browser-only history mode.
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
