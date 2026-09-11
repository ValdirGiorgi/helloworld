<script setup>
import LanguageList from '../components/language/LanguageList.vue'
</script>

<template>
  <section>
    <h1 class="text-3xl font-bold text-ink-900">Hello World em muitas linguagens</h1>
    <p class="mt-2 max-w-2xl text-ink-600">
      Veja como cada linguagem escreve "Hello, World!" e, ao expandir, compare também condicionais,
      um cálculo simples e declarações básicas de variáveis.
    </p>
    <div class="mt-8">
      <LanguageList />
    </div>
  </section>
</template>
