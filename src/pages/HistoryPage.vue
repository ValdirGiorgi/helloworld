<script setup>
import MarkdownIt from 'markdown-it'
import HistoryArticle from '../components/history/HistoryArticle.vue'
import rawHistory from '../../content/history.md?raw'

const md = new MarkdownIt()
const body = md.render(rawHistory)
</script>

<template>
  <HistoryArticle title="A história do Hello World" :body="body" />
</template>
