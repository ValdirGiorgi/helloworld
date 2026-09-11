<script setup>
import { useLocale } from '../../composables/useLocale'

const { locale, setLocale, supportedLocales } = useLocale()
</script>

<template>
  <div class="flex items-center gap-1 text-sm">
    <button
      v-for="entry in supportedLocales"
      :key="entry.code"
      type="button"
      class="rounded-md px-2 py-1 text-lg leading-none hover:bg-ink-50"
      :class="{ 'bg-ink-50 ring-1 ring-brand-600': entry.code === locale }"
      :aria-label="entry.name"
      :aria-current="entry.code === locale ? 'true' : null"
      :title="entry.name"
      @click="setLocale(entry.code)"
    >
      {{ entry.flag }}
    </button>
  </div>
</template>
