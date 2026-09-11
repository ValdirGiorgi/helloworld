<script setup>
import CodeBlock from './CodeBlock.vue'

defineProps({
  variables: {
    type: Array,
    required: true,
  },
})

const KIND_LABELS = {
  integer: 'Inteiro',
  string: 'Texto (string)',
  float: 'Ponto flutuante (float)',
}
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <CodeBlock
      v-for="variable in variables"
      :key="variable.kind"
      :code="variable.code"
      :label="KIND_LABELS[variable.kind] ?? variable.kind"
    />
  </div>
</template>
