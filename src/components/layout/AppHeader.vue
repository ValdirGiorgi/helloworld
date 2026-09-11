<script setup>
import NavMenu from './NavMenu.vue'
import BaseIcon from '../base/BaseIcon.vue'
</script>

<template>
  <header class="border-b border-ink-100 bg-white">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <router-link to="/" class="flex items-center gap-2 text-lg font-bold text-ink-900">
        <BaseIcon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M8 9l-3 3 3 3M16 9l3 3-3 3M14 4l-4 16"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </BaseIcon>
        Hello World em Muitas Linguagens
      </router-link>
      <NavMenu />
    </div>
  </header>
</template>
