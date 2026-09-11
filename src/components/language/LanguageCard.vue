<script setup>
import BaseCard from '../base/BaseCard.vue'
import CodeBlock from './CodeBlock.vue'
import ExpandableSection from './ExpandableSection.vue'
import FixedOutcomeExample from './FixedOutcomeExample.vue'
import VariableList from './VariableList.vue'
import { useExpandable } from '../../composables/useExpandable'

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
  startExpanded: {
    type: Boolean,
    default: false,
  },
})

const { isExpanded, toggle } = useExpandable(props.startExpanded)
</script>

<template>
  <BaseCard
    :id="`language-${entry.slug}`"
    :data-testid="`language-card-${entry.slug}`"
    class="scroll-mt-6 p-6"
  >
    <h2 class="text-lg font-bold text-ink-900">{{ entry.name }}</h2>
    <div class="mt-4">
      <CodeBlock :code="entry.helloWorld.code" label="Hello World" />
    </div>

    <div class="mt-4">
      <ExpandableSection :is-expanded="isExpanded" @toggle="toggle">
        <CodeBlock :code="entry.conditional.code" label="Condicional" />
        <FixedOutcomeExample
          label="Cálculo: (1 + 1) * 2"
          :code="entry.calculation.code"
          :result="entry.calculation.result"
        />
        <FixedOutcomeExample
          label="Loop: contar de 1 a 5"
          :code="entry.loop.code"
          :result="entry.loop.result"
        />
        <FixedOutcomeExample
          label="Função: somar(2, 3)"
          :code="entry.function.code"
          :result="entry.function.result"
        />
        <FixedOutcomeExample
          label='Concatenação: "Olá, " + name'
          :code="entry.stringConcatenation.code"
          :result="entry.stringConcatenation.result"
        />
        <FixedOutcomeExample
          label="Lista: soma de [1, 2, 3]"
          :code="entry.list.code"
          :result="entry.list.result"
        />
        <FixedOutcomeExample
          label="Booleano: idade >= 18"
          :code="entry.boolean.code"
          :result="entry.boolean.result"
        />
        <VariableList :variables="entry.variables" />
      </ExpandableSection>
    </div>
  </BaseCard>
</template>
