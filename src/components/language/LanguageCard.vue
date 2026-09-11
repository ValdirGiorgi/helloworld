<script setup>
import BaseCard from '../base/BaseCard.vue'
import CodeBlock from './CodeBlock.vue'
import ExpandableSection from './ExpandableSection.vue'
import FixedOutcomeExample from './FixedOutcomeExample.vue'
import VariableList from './VariableList.vue'
import { useExpandable } from '../../composables/useExpandable'
import { useLocale } from '../../composables/useLocale'

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
const { t } = useLocale()
</script>

<template>
  <BaseCard
    :id="`language-${entry.slug}`"
    :data-testid="`language-card-${entry.slug}`"
    class="scroll-mt-6 p-6"
  >
    <h2 class="text-lg font-bold text-ink-900">{{ entry.name }}</h2>
    <div class="mt-4">
      <CodeBlock :code="entry.helloWorld.code" :label="t('languageCard.helloWorld')" />
    </div>

    <div class="mt-4">
      <ExpandableSection
        :is-expanded="isExpanded"
        :expand-label="t('expandable.showMore')"
        :collapse-label="t('expandable.showLess')"
        @toggle="toggle"
      >
        <CodeBlock :code="entry.conditional.code" :label="t('languageCard.conditional')" />
        <FixedOutcomeExample
          :label="t('languageCard.calculation')"
          :code="entry.calculation.code"
          :result="entry.calculation.result"
        />
        <FixedOutcomeExample
          :label="t('languageCard.loop')"
          :code="entry.loop.code"
          :result="entry.loop.result"
        />
        <FixedOutcomeExample
          :label="t('languageCard.function')"
          :code="entry.function.code"
          :result="entry.function.result"
        />
        <FixedOutcomeExample
          :label="t('languageCard.stringConcatenation')"
          :code="entry.stringConcatenation.code"
          :result="entry.stringConcatenation.result"
        />
        <FixedOutcomeExample
          :label="t('languageCard.list')"
          :code="entry.list.code"
          :result="entry.list.result"
        />
        <FixedOutcomeExample
          :label="t('languageCard.boolean')"
          :code="entry.boolean.code"
          :result="entry.boolean.result"
        />
        <VariableList :variables="entry.variables" />
      </ExpandableSection>
    </div>
  </BaseCard>
</template>
