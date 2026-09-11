<script setup>
defineProps({
  isExpanded: {
    type: Boolean,
    required: true,
  },
  expandLabel: {
    type: String,
    default: 'Ver mais exemplos',
  },
  collapseLabel: {
    type: String,
    default: 'Ver menos',
  },
})

defineEmits(['toggle'])
</script>

<template>
  <div>
    <button
      type="button"
      class="text-sm font-medium text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      :aria-expanded="isExpanded"
      @click="$emit('toggle')"
    >
      {{ isExpanded ? collapseLabel : expandLabel }}
    </button>
    <div v-if="isExpanded" data-testid="expandable-section" class="mt-4 space-y-4">
      <slot />
    </div>
  </div>
</template>
