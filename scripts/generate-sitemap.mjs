import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SUPPORTED_CODES } from '../src/composables/useLocale.js'
import { generateSitemap } from '../src/build/generateSitemap.js'
import { PAGE_KINDS, SITE_ORIGIN, buildPageCatalog } from '../src/seo/pageCatalog.js'
import { readLanguageSlugs } from './lib/readLanguageSlugs.mjs'
import { buildLastModMap } from './lib/getLastModified.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const languageSlugs = readLanguageSlugs(ROOT)

const catalog = buildPageCatalog({ locales: SUPPORTED_CODES, languageSlugs })

const xml = generateSitemap({
  origin: SITE_ORIGIN,
  locales: SUPPORTED_CODES,
  pageKinds: PAGE_KINDS,
  languageSlugs,
  lastmodByPath: buildLastModMap({ catalog, cwd: ROOT }),
})

fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml)

console.log(
  `Wrote public/sitemap.xml: ${languageSlugs.length} language slugs × ${SUPPORTED_CODES.length} locales.`,
)
