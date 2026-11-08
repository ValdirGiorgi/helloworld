<script setup>
import { computed } from 'vue'
import LanguageCard from '../components/language/LanguageCard.vue'
import NotFoundPage from './NotFoundPage.vue'
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
  <!-- Root branch with no wrapper: Apache serves /{locale}/404 for an unknown
       slug, and the client must hydrate that exact markup. -->
  <NotFoundPage v-if="!entry" />
  <section v-else>
    <router-link
      :to="{ name: 'home', params: { locale } }"
      class="text-sm font-medium text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <span aria-hidden="true">←</span> {{ t('languageDetail.backToList') }}
    </router-link>
    <div class="mt-4">
      <LanguageCard :entry="entry" :start-expanded="true" :show-page-link="false" />
    </div>
  </section>
</template>
