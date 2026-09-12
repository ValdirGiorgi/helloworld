<script setup>
import { useLocale } from '../composables/useLocale'
import { SPEC_KIT_REPO_URL, PROJECT_REPO_URL, BLOG_ARTICLE_URL } from '../siteLinks'

const { t } = useLocale()
</script>

<template>
  <section class="max-w-2xl">
    <h1 class="text-3xl font-bold text-ink-900">{{ t('about.title') }}</h1>

    <p class="mt-4 text-ink-600">{{ t('about.intro') }}</p>

    <p class="mt-4 text-ink-600">
      <a
        :href="SPEC_KIT_REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-brand-700 hover:underline"
      >
        {{ t('about.specKitLinkLabel') }}
      </a>
    </p>

    <p class="mt-6 text-ink-600">
      {{ t('about.blogIntro') }}
      <a
        :href="BLOG_ARTICLE_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-brand-700 hover:underline"
      >
        {{ t('about.blogLinkLabel') }}
      </a>
    </p>

    <p class="mt-6 text-ink-600">
      {{ t('about.repoIntro') }}
      <a
        :href="PROJECT_REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-brand-700 hover:underline"
      >
        {{ t('about.repoLinkLabel') }}
      </a>
    </p>

    <p class="mt-6 text-ink-600">{{ t('about.contribute') }}</p>
  </section>
</template>
