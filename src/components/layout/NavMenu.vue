<script setup>
const links = [
  { to: '/', label: 'Linguagens' },
  { to: '/history', label: 'História' },
]
</script>

<template>
  <nav class="flex gap-6" aria-label="Navegação principal">
    <router-link
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="text-sm font-medium text-ink-600 hover:text-brand-700"
      active-class="text-brand-700"
    >
      {{ link.label }}
    </router-link>
  </nav>
</template>
