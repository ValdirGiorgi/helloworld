import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { SUPPORTED_CODES } from './src/composables/useLocale.js'
import { buildPageCatalog } from './src/seo/pageCatalog.js'
import { readLanguageSlugs } from './scripts/lib/readLanguageSlugs.mjs'
import { buildLastModMap } from './scripts/lib/getLastModified.mjs'
import { readLanguageName } from './src/content/parseLanguageFile.js'

const ROOT = fileURLToPath(new URL('.', import.meta.url))

function readCatalog() {
  return buildPageCatalog({ locales: SUPPORTED_CODES, languageSlugs: readLanguageSlugs(ROOT) })
}

/**
 * Exposes `virtual:page-lastmod` (`{ [path]: 'YYYY-MM-DD' }`, from git) to the
 * app for JSON-LD `dateModified`, without committing a generated file
 * (research.md §6).
 */
function pageLastmodPlugin() {
  const id = 'virtual:page-lastmod'
  const resolvedId = `\0${id}`
  return {
    name: 'page-lastmod',
    resolveId: (source) => (source === id ? resolvedId : undefined),
    load(loadId) {
      if (loadId !== resolvedId) return undefined
      const lastmod = buildLastModMap({ catalog: readCatalog(), cwd: ROOT })
      return `export default ${JSON.stringify(lastmod)}`
    },
  }
}

/**
 * `content/languages/x.md?name` → `export default "<frontmatter name>"`, so a
 * module can list language names without bundling the examples
 * (src/content/languageNames.js).
 */
function languageNamePlugin() {
  return {
    name: 'language-name',
    load(id) {
      const [file, query] = id.split('?')
      if (query !== 'name' || !file.endsWith('.md')) return undefined
      return `export default ${JSON.stringify(readLanguageName(fs.readFileSync(file, 'utf8')))}`
    },
  }
}

export default defineConfig({
  plugins: [vue(), pageLastmodPlugin(), languageNamePlugin()],
  ssgOptions: {
    dirStyle: 'flat',
    formatting: 'none',
    // Pre-render the page catalog (research.md §3) plus the root chooser and
    // the not-found documents that Apache serves through ErrorDocument.
    includedRoutes: () => [
      ...readCatalog().map((page) => page.path),
      '/',
      '/404',
      ...SUPPORTED_CODES.map((locale) => `/${locale}/404`),
    ],
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.js'],
    coverage: { provider: 'v8', include: ['src/**', 'scripts/**'], reporter: ['text-summary'] },
  },
})
