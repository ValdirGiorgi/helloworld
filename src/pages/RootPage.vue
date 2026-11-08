<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale, SUPPORTED_LOCALES, resolveInitialLocale } from '../composables/useLocale'

// The pre-rendered `/` is this chooser, so it works without JavaScript. In the
// browser it hydrates the same markup and only then redirects (stored
// preference, else the country rule) — redirecting before mount would not match
// the server HTML (research.md §4).
const router = useRouter()
const { t } = useLocale()

onMounted(() => {
  router.replace(`/${resolveInitialLocale()}`)
})
</script>

<template>
  <section class="max-w-2xl">
    <h1 class="text-3xl font-bold text-ink-900">{{ t('root.heading') }}</h1>
    <ul class="mt-6 space-y-2">
      <li v-for="entry in SUPPORTED_LOCALES" :key="entry.code">
        <router-link
          :to="{ name: 'home', params: { locale: entry.code } }"
          :lang="entry.code"
          class="font-medium text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <span aria-hidden="true">{{ entry.flag }}</span> {{ entry.name }}
        </router-link>
      </li>
    </ul>
  </section>
</template>
