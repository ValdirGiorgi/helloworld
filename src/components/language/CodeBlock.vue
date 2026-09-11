<script setup>
defineProps({
  code: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div>
    <p v-if="label" class="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
      {{ label }}
    </p>
    <pre
      class="overflow-x-auto rounded-lg bg-ink-900 p-4 font-mono text-sm leading-relaxed text-ink-50"
    ><code>{{ code }}</code></pre>
  </div>
</template>
