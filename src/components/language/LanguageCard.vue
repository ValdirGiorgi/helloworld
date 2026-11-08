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
  // Off on the language page itself, which would otherwise link to itself.
  showPageLink: {
    type: Boolean,
    default: true,
  },
})

const { isExpanded, toggle } = useExpandable(props.startExpanded)
const { t, locale } = useLocale()
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

    <div v-if="showPageLink" class="mt-4">
      <router-link
        :to="{ name: 'language-detail', params: { locale, slug: entry.slug } }"
        :data-testid="`language-page-link-${entry.slug}`"
        class="text-sm font-medium text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        {{ t('languageCard.seeAll', { name: entry.name }) }}
      </router-link>
    </div>
  </BaseCard>
</template>
