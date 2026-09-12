import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SUPPORTED_CODES } from '../src/composables/useLocale.js'
import { generateSitemap } from '../src/build/generateSitemap.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const ORIGIN = 'https://helloworld.valdir.dev.br'

// Mirrors src/router/index.js's own route list (data-model.md `PageKind`) —
// kept here rather than imported from the router module, since importing
// vue-router's route config would pull in the Vue app itself just to read a
// handful of path templates.
const PAGE_KINDS = [
  { name: 'home', path: (locale) => `/${locale}` },
  { name: 'history', path: (locale) => `/${locale}/history` },
  { name: 'about', path: (locale) => `/${locale}/about` },
  {
    name: 'language-detail',
    path: (locale, slug) => `/${locale}/languages/${slug}`,
    perSlug: true,
  },
]

// Same slug rule as slugFromFilename() in src/content/parseLanguageFile.js.
const languagesDir = path.join(ROOT, 'content', 'languages')
const languageSlugs = fs
  .readdirSync(languagesDir)
  .filter((filename) => filename.endsWith('.md'))
  .map((filename) => filename.replace(/\.md$/, '').toLowerCase())

const xml = generateSitemap({
  origin: ORIGIN,
  locales: SUPPORTED_CODES,
  pageKinds: PAGE_KINDS,
  languageSlugs,
})

fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml)

console.log(
  `Wrote public/sitemap.xml: ${languageSlugs.length} language slugs × ${SUPPORTED_CODES.length} locales.`,
)
