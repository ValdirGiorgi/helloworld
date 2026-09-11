<script setup>
import { computed } from 'vue'
import LanguageCard from '../components/language/LanguageCard.vue'
import { useLanguages } from '../composables/useLanguages'
import { useLocale } from '../composables/useLocale'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { findBySlug } = useLanguages()
const { t, locale } = useLocale()
const entry = computed(() => findBySlug(props.slug))
</script>

<template>
  <section v-if="entry">
    <LanguageCard :entry="entry" :start-expanded="true" />
  </section>
  <p v-else class="text-ink-600">
    {{ t('languageDetail.notFound', { slug }) }}
    <router-link :to="{ name: 'home', params: { locale } }" class="text-brand-700 hover:underline">{{
      t('languageDetail.backToList')
    }}</router-link
    >.
  </p>
</template>
