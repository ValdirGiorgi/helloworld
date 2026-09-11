import { computed } from 'vue'
import { parseLanguageFile } from '../content/parseLanguageFile'

const rawFiles = import.meta.glob('/content/languages/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function filenameFromPath(path) {
  return path.split('/').pop()
}

function loadLanguages() {
  const entries = Object.entries(rawFiles).map(([path, raw]) =>
    parseLanguageFile(raw, filenameFromPath(path)),
  )

  const seenSlugs = new Map()
  for (const entry of entries) {
    if (seenSlugs.has(entry.slug)) {
      throw new Error(
        `Duplicate language slug "${entry.slug}": both "${seenSlugs.get(entry.slug)}.md" and ` +
          `"${entry.slug}.md" resolve to the same slug. Rename one of the files so each language ` +
          'has a unique filename (see data-model.md).',
      )
    }
    seenSlugs.set(entry.slug, entry.slug)
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

const languages = loadLanguages()

/**
 * Exposes the site's LanguageEntry list, parsed at build time from
 * content/languages/*.md (see data-model.md).
 */
export function useLanguages() {
  return {
    languages: computed(() => languages),
    findBySlug: (slug) => languages.find((entry) => entry.slug === slug),
  }
}
