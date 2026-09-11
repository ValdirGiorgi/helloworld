<script setup>
import LanguageCard from './LanguageCard.vue'
import { useLocale } from '../../composables/useLocale'

defineProps({
  languages: {
    type: Array,
    required: true,
  },
})

const { t } = useLocale()
</script>

<template>
  <div v-if="languages.length" class="flex flex-col gap-6">
    <LanguageCard v-for="entry in languages" :key="entry.slug" :entry="entry" />
  </div>
  <p v-else class="text-ink-600">{{ t('languageList.noResults') }}</p>
</template>
