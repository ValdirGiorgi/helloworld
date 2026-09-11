<script setup>
import { useLocale } from '../../composables/useLocale'

const { t } = useLocale()
</script>

<template>
  <footer class="border-t border-ink-100 py-8 text-center text-sm text-ink-400">
    <p>
      {{ t('footer.contribute') }}
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-brand-700 hover:underline"
      >
        {{ t('footer.github') }} </a
      >.
    </p>
  </footer>
</template>
