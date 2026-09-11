<script setup>
import LanguageCard from './LanguageCard.vue'
import { useLanguages } from '../../composables/useLanguages'

const { languages } = useLanguages()
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <LanguageCard v-for="entry in languages" :key="entry.slug" :entry="entry" />
  </div>
</template>
