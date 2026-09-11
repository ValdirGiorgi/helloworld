<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useLocaleSeoTags } from './composables/useLocaleSeoTags'

useLocaleSeoTags()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-ink-50">
    <AppHeader />
    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>
