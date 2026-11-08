import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import { createSiteI18n } from './i18n'
import './assets/main.css'

// vite-ssg renders every route to HTML at build time and, in the browser,
// hydrates that HTML (instead of re-rendering it) when `hydration` is on. The
// dev server serves an empty #app, so it keeps a plain client-side mount there.
export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router }) => {
    // One i18n instance per app instance: routes are pre-rendered concurrently.
    const i18n = createSiteI18n()
    app.use(i18n)

    // Routes without a :locale param (root, English not-found) are English.
    // afterEach, not beforeEach: the labels must switch language together with
    // the route (and so the links' hrefs), never while the old route is still
    // on screen.
    router.afterEach((to) => {
      i18n.global.locale.value = to.params.locale ?? 'en'
    })
  },
  { hydration: import.meta.env.PROD },
)
