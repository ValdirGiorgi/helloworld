<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span
    class="inline-flex h-5 w-5 items-center justify-center"
    :aria-label="label || null"
    :aria-hidden="label ? null : 'true'"
    :role="label ? 'img' : null"
  >
    <slot />
  </span>
</template>
