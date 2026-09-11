<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import HistoryArticle from '../components/history/HistoryArticle.vue'
import { useLocale } from '../composables/useLocale'

const rawHistoryByLocale = import.meta.glob('/content/history.*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function localeFromPath(path) {
  return path.replace('/content/history.', '').replace('.md', '')
}

const historyByLocale = Object.fromEntries(
  Object.entries(rawHistoryByLocale).map(([path, raw]) => [localeFromPath(path), raw]),
)

const { locale, t } = useLocale()

const md = new MarkdownIt()
const body = computed(() => {
  const raw = historyByLocale[locale.value] ?? historyByLocale.en
  return md.render(raw)
})
</script>

<template>
  <HistoryArticle :title="t('history.title')" :body="body" />
</template>
