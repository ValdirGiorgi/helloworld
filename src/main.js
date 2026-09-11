import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'

const app = createApp(App).use(router).use(i18n)

// Wait for the router's initial navigation (including the no-locale redirect
// guard in src/router/index.js) to resolve before the first render, so
// components can rely on route.params.locale always being one of the three
// supported codes by the time they mount.
router.isReady().then(() => app.mount('#app'))
