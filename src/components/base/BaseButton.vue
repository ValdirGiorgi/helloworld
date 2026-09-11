<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'ghost'].includes(value),
  },
})

defineEmits(['click'])

const variantClasses = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50 focus-visible:outline-brand-600',
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="variantClasses[variant]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
