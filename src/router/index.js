import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../pages/HomePage.vue') },
  { path: '/history', name: 'history', component: () => import('../pages/HistoryPage.vue') },
  {
    path: '/languages/:slug',
    name: 'language-detail',
    component: () => import('../pages/LanguageDetailPage.vue'),
    props: true,
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
