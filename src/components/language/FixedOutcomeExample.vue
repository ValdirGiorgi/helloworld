<script setup>
import CodeBlock from './CodeBlock.vue'

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
      Resultado exibido: <strong>{{ result }}</strong>
    </p>
  </div>
</template>
