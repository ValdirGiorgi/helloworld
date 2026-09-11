<script setup>
import { computed } from 'vue'
import { useLocale } from '../../composables/useLocale'

const { t, locale } = useLocale()

const links = computed(() => [
  { name: 'home', label: t('nav.languages') },
  { name: 'history', label: t('nav.history') },
])
</script>

<template>
  <nav class="flex gap-6" :aria-label="t('nav.ariaLabel')">
    <router-link
      v-for="link in links"
      :key="link.name"
      :to="{ name: link.name, params: { locale } }"
      class="text-sm font-medium text-ink-600 hover:text-brand-700"
      active-class="text-brand-700"
    >
      {{ link.label }}
    </router-link>
  </nav>
</template>
