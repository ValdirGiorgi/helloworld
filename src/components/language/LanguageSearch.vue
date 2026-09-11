<script setup>
import { useLocale } from '../../composables/useLocale'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])

const { t } = useLocale()
</script>

<template>
  <div>
    <label for="language-search" class="sr-only">{{ t('search.label') }}</label>
    <input
      id="language-search"
      type="search"
      :placeholder="t('search.placeholder')"
      class="w-full rounded-lg border border-ink-200 px-4 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
