<script setup>
import { computed, ref } from 'vue'
import LanguageList from '../components/language/LanguageList.vue'
import LanguageSearch from '../components/language/LanguageSearch.vue'
import LanguageSidebar from '../components/layout/LanguageSidebar.vue'
import BaseIcon from '../components/base/BaseIcon.vue'
import { useLanguages } from '../composables/useLanguages'
import { useLanguageFilter } from '../composables/useLanguageFilter'
import { useLocale } from '../composables/useLocale'

const { t } = useLocale()
const { languages } = useLanguages()

const query = ref('')
const filteredLanguages = computed(() => useLanguageFilter(languages.value, query.value))

const isSidebarOpen = ref(false)
</script>

<template>
  <section class="lg:flex lg:items-start lg:gap-8">
    <LanguageSidebar
      :languages="languages"
      :is-open="isSidebarOpen"
      @close="isSidebarOpen = false"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-ink-900">{{ t('home.title') }}</h1>
          <p class="mt-2 max-w-2xl text-ink-600">{{ t('home.tagline') }}</p>
        </div>
        <button
          type="button"
          class="mt-1 inline-flex shrink-0 items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 lg:hidden"
          :aria-expanded="isSidebarOpen"
          aria-controls="language-sidebar"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <BaseIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
            </svg>
          </BaseIcon>
          {{ t('home.sidebarToggle') }}
        </button>
      </div>

      <div class="mt-6 max-w-sm">
        <LanguageSearch v-model="query" />
      </div>

      <div class="mt-8">
        <LanguageList :languages="filteredLanguages" />
      </div>
    </div>
  </section>
</template>
