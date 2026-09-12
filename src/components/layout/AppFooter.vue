<script setup>
import { useLocale } from '../../composables/useLocale'
import { PROJECT_REPO_URL } from '../../siteLinks'

const { t } = useLocale()
</script>

<template>
  <footer class="border-t border-ink-100 py-8 text-center text-sm text-ink-400">
    <p>
      {{ t('footer.contribute') }}
      <a
        :href="PROJECT_REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-brand-700 hover:underline"
      >
        {{ t('footer.github') }} </a
      >.
    </p>
  </footer>
</template>
