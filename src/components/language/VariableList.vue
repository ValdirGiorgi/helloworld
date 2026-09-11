<script setup>
import { computed } from 'vue'
import CodeBlock from './CodeBlock.vue'
import { useLocale } from '../../composables/useLocale'

defineProps({
  variables: {
    type: Array,
    required: true,
  },
})

const { t } = useLocale()

const kindLabels = computed(() => ({
  integer: t('variables.integer'),
  string: t('variables.string'),
  float: t('variables.float'),
}))
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <CodeBlock
      v-for="variable in variables"
      :key="variable.kind"
      :code="variable.code"
      :label="kindLabels[variable.kind] ?? variable.kind"
    />
  </div>
</template>
