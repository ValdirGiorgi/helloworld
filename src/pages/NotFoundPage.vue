<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale, SUPPORTED_LOCALES } from '../composables/useLocale'

// The markup never includes the requested path: Apache serves the same
// pre-rendered /{locale}/404 document for every unknown address, and the client
// must hydrate it identically whatever the URL (research.md §4).
const route = useRoute()
const { t, locale } = useLocale()
const hasLocale = computed(() => Boolean(route.params.locale))

const linkClass =
  'font-medium text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
</script>

<template>
  <section class="max-w-2xl">
    <h1 class="text-3xl font-bold text-ink-900">{{ t('notFound.heading') }}</h1>
    <p class="mt-4 text-ink-600">{{ t('notFound.body') }}</p>

    <p v-if="hasLocale" class="mt-6">
      <router-link :to="{ name: 'home', params: { locale } }" :class="linkClass">
        {{ t('notFound.backHome') }}
      </router-link>
    </p>
    <ul v-else class="mt-6 space-y-2">
      <li v-for="entry in SUPPORTED_LOCALES" :key="entry.code">
        <router-link :to="{ name: 'home', params: { locale: entry.code } }" :class="linkClass">
          <span aria-hidden="true">{{ entry.flag }}</span> {{ entry.name }}
        </router-link>
      </li>
    </ul>
  </section>
</template>
