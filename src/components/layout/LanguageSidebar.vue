<script setup>
import { useLocale } from '../../composables/useLocale'

const { t } = useLocale()

defineProps({
  languages: {
    type: Array,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

function goToLanguage(event, slug) {
  event.preventDefault()
  const target = document.getElementById(`language-${slug}`)
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
    data-testid="sidebar-backdrop"
    @click="emit('close')"
  />

  <aside
    id="language-sidebar"
    class="fixed inset-y-0 left-0 z-50 w-64 -translate-x-full overflow-y-auto border-r border-ink-100 bg-white p-6 transition-transform duration-200 lg:static lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0 lg:p-0 lg:transition-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    data-testid="language-sidebar"
  >
    <nav :aria-label="t('sidebar.heading')">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
        {{ t('sidebar.heading') }}
      </h2>
      <ul class="space-y-1">
        <li v-for="entry in languages" :key="entry.slug">
          <a
            :href="`#language-${entry.slug}`"
            class="block rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-brand-50 hover:text-brand-700"
            @click="goToLanguage($event, entry.slug)"
          >
            {{ entry.name }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>
