<script setup>
import CodeBlock from './CodeBlock.vue'
import { useLocale } from '../../composables/useLocale'

const { t } = useLocale()

defineProps({
  label: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <CodeBlock :code="code" :label="label" />
    <p class="mt-1 text-xs text-ink-400">
      {{ t('fixedOutcome.result') }} <strong>{{ result }}</strong>
    </p>
  </div>
</template>
