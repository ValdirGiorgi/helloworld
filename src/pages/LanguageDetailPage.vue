<script setup>
import { computed } from 'vue'
import LanguageCard from '../components/language/LanguageCard.vue'
import { useLanguages } from '../composables/useLanguages'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { findBySlug } = useLanguages()
const entry = computed(() => findBySlug(props.slug))
</script>

<template>
  <section v-if="entry">
    <LanguageCard :entry="entry" :start-expanded="true" />
  </section>
  <p v-else class="text-ink-600">
    Linguagem "{{ slug }}" não encontrada.
    <router-link to="/" class="text-brand-700 hover:underline">Voltar para a lista</router-link>.
  </p>
</template>
