<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <article class="prose prose-slate max-w-none">
    <h1 class="text-3xl font-bold text-ink-900">{{ title }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="body"></div>
  </article>
</template>
