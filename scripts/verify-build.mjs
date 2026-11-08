import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { SUPPORTED_CODES } from '../src/composables/useLocale.js'
import { buildPageCatalog, findPageKind } from '../src/seo/pageCatalog.js'
import en from '../src/i18n/locales/en.js'
import ptBR from '../src/i18n/locales/pt-BR.js'
import es from '../src/i18n/locales/es.js'
import { readLanguageSlugs } from './lib/readLanguageSlugs.mjs'

// Checks the pre-rendered dist/ output (contracts/routes-and-output-contract.md,
// "verify-build checks") and fails `npm run build` — and so the deploy — when
// any file is missing or inconsistent. Each check returns a list of error
// messages (empty when it passes) so every failure is reported at once.

export const MAX_HTML_BYTES = 100 * 1024

const MESSAGES_BY_LOCALE = { en, 'pt-BR': ptBR, es }

// The 9 example sections of a language page: 8 labeled code examples plus the
// variables group (identified by its first label).
const SECTION_LABEL_KEYS = [
  ['languageCard', 'helloWorld'],
  ['languageCard', 'conditional'],
  ['languageCard', 'calculation'],
  ['languageCard', 'loop'],
  ['languageCard', 'function'],
  ['languageCard', 'stringConcatenation'],
  ['languageCard', 'list'],
  ['languageCard', 'boolean'],
  ['variables', 'integer'],
]

export function parseHtml(html) {
  return new JSDOM(html).window.document
}

/** `/pt-BR/languages/rust` → `pt-BR/languages/rust.html` (vite-ssg flat style). */
export function htmlFileForPath(pagePath) {
  return pagePath === '/' ? 'index.html' : `${pagePath.slice(1)}.html`
}

/**
 * The documents outside the catalog and the sitemap (data-model.md
 * `NonIndexedDocument`): the root chooser and the not-found pages.
 */
export function nonIndexedDocuments(locales) {
  return [
    { path: '/', locale: 'en' },
    { path: '/404', locale: 'en' },
    ...locales.map((locale) => ({ path: `/${locale}/404`, locale })),
  ]
}

/** dist/ must hold exactly the catalog files plus the non-indexed documents. */
export function checkFileSet(catalog, nonIndexed, htmlFiles) {
  const expected = [...catalog, ...nonIndexed].map((page) => htmlFileForPath(page.path))
  const present = new Set(htmlFiles)
  const expectedSet = new Set(expected)
  return [
    ...expected
      .filter((file) => !present.has(file))
      .map((file) => `missing pre-rendered file ${file}`),
    ...htmlFiles
      .filter((file) => !expectedSet.has(file))
      .map((file) => `unexpected HTML file ${file}`),
  ]
}

export function checkLang(doc, locale) {
  const lang = doc.documentElement.getAttribute('lang')
  return lang === locale ? [] : [`<html lang="${lang}"> should be "${locale}"`]
}

export function checkAppRoot(doc) {
  const root = doc.getElementById('app')
  if (!root) return ['no #app element']
  return root.children.length > 0 ? [] : ['#app is empty (page was not pre-rendered)']
}

export function checkLanguageSections(doc, locale) {
  const messages = MESSAGES_BY_LOCALE[locale]
  const root = doc.getElementById('app')
  const text = root?.textContent ?? ''
  const errors = SECTION_LABEL_KEYS.map(([group, key]) => messages[group][key])
    .filter((label) => !text.includes(label))
    .map((label) => `missing example section "${label}"`)

  const codeBlocks = root ? root.querySelectorAll('pre').length : 0
  if (codeBlocks < SECTION_LABEL_KEYS.length) {
    errors.push(`only ${codeBlocks} code blocks, expected at least ${SECTION_LABEL_KEYS.length}`)
  }
  return errors
}

export function checkFileSize(byteLength) {
  return byteLength <= MAX_HTML_BYTES
    ? []
    : [`${byteLength} bytes is over the ${MAX_HTML_BYTES}-byte limit`]
}

export function checkTitle(doc) {
  return doc.title.trim() ? [] : ['empty <title>']
}

export function checkDescription(doc) {
  const content = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
  return content.trim() ? [] : ['missing or empty meta description']
}

export function checkCanonical(doc, url) {
  const canonicals = [...doc.querySelectorAll('link[rel="canonical"]')]
  if (canonicals.length !== 1) return [`expected 1 canonical link, found ${canonicals.length}`]
  const href = canonicals[0].getAttribute('href')
  return href === url ? [] : [`canonical "${href}" should be "${url}"`]
}

export function checkAlternates(doc, page) {
  const links = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')]
  const actual = links.map(
    (link) => `${link.getAttribute('hreflang')} ${link.getAttribute('href')}`,
  )
  const expected = page.alternates.map(({ hreflang, href }) => `${hreflang} ${href}`)
  const errors = []
  if (links.length !== expected.length) {
    errors.push(`expected ${expected.length} hreflang alternates, found ${links.length}`)
  }
  for (const entry of expected) {
    if (!actual.includes(entry)) errors.push(`missing alternate "${entry}"`)
  }
  return errors
}

export function checkNoLocalhost(doc) {
  return /localhost|127\.0\.0\.1/.test(doc.head.innerHTML) ? ['the head mentions localhost'] : []
}

const REQUIRED_OG_PROPERTIES = [
  'og:title',
  'og:description',
  'og:url',
  'og:locale',
  'og:type',
  'og:image',
]

export const BRAND_ASSETS = ['og-image.png', 'favicon.ico', 'favicon.svg']

function metaContent(doc, attribute, value) {
  return doc.querySelector(`meta[${attribute}="${value}"]`)?.getAttribute('content') ?? ''
}

export function checkOpenGraph(doc, url) {
  const errors = REQUIRED_OG_PROPERTIES.filter(
    (property) => !metaContent(doc, 'property', property).trim(),
  ).map((property) => `missing ${property}`)
  if (!metaContent(doc, 'name', 'twitter:card').trim()) errors.push('missing twitter:card')

  const ogUrl = metaContent(doc, 'property', 'og:url')
  if (ogUrl && ogUrl !== url) errors.push(`og:url "${ogUrl}" should be "${url}"`)
  return errors
}

function readJsonLd(doc) {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')]
  return scripts.map((script) => {
    try {
      return JSON.parse(script.textContent)
    } catch {
      return { parseError: true }
    }
  })
}

function requireFields(data, fields) {
  return fields
    .filter((field) => {
      const value = field.split('.').reduce((object, key) => object?.[key], data)
      return typeof value !== 'string' || !value.trim()
    })
    .map((field) => `JSON-LD ${data['@type']} has no ${field}`)
}

/** Home pages carry WebSite JSON-LD, language pages TechArticle (seo-head-contract.md). */
export function checkJsonLd(doc, page) {
  const expectedType = findPageKind(page.kind)?.jsonLdType
  const blocks = readJsonLd(doc)
  if (!expectedType) {
    return blocks.length ? [`unexpected JSON-LD on a ${page.kind} page`] : []
  }
  if (blocks.length !== 1) return [`expected 1 JSON-LD block, found ${blocks.length}`]

  const [data] = blocks
  if (data.parseError) return ['JSON-LD does not parse']
  if (data['@type'] !== expectedType) {
    return [`JSON-LD @type "${data['@type']}" should be "${expectedType}"`]
  }

  if (expectedType === 'WebSite') return requireFields(data, ['name', 'url', 'inLanguage'])

  const errors = requireFields(data, [
    'headline',
    'image',
    'author.name',
    'dateModified',
    'inLanguage',
    'url',
  ])
  if (data.dateModified && !/^\d{4}-\d{2}-\d{2}$/.test(data.dateModified)) {
    errors.push(`dateModified "${data.dateModified}" is not YYYY-MM-DD`)
  }
  if (data.inLanguage && data.inLanguage !== page.locale) {
    errors.push(`JSON-LD inLanguage "${data.inLanguage}" should be "${page.locale}"`)
  }
  if (data.url && data.url !== page.url) {
    errors.push(`JSON-LD url "${data.url}" should be "${page.url}"`)
  }
  return errors
}

export function checkBrandAssets(distDir) {
  return BRAND_ASSETS.filter((file) => !fs.existsSync(path.join(distDir, file))).map(
    (file) => `missing ${file}`,
  )
}

/** A home must link to each language page of its own locale exactly once. */
export function checkHomeLinks(doc, locale, languageSlugs) {
  return languageSlugs.flatMap((slug) => {
    const href = `/${locale}/languages/${slug}`
    const count = doc.querySelectorAll(`#app a[href="${href}"]`).length
    return count === 1 ? [] : [`expected 1 link to ${href}, found ${count}`]
  })
}

/** A language page must link back to the home of its locale. */
export function checkBackLink(doc, locale) {
  return doc.querySelector(`#app a[href="/${locale}"]`) ? [] : [`no link back to /${locale}`]
}

/** Fails every title shared by more than one catalog file. */
export function checkUniqueTitles(titleByFile) {
  const filesByTitle = new Map()
  for (const [file, title] of Object.entries(titleByFile)) {
    filesByTitle.set(title, [...(filesByTitle.get(title) ?? []), file])
  }
  return [...filesByTitle]
    .filter(([, files]) => files.length > 1)
    .map(([title, files]) => `title "${title}" is shared by ${files.join(', ')}`)
}

/** Root and not-found documents: noindex, and nothing that claims an indexable URL. */
export function checkNonIndexedDocument({ document: { locale }, html }) {
  const doc = parseHtml(html)
  const errors = [...checkLang(doc, locale), ...checkAppRoot(doc), ...checkTitle(doc)]
  if (!metaContent(doc, 'name', 'robots').includes('noindex')) errors.push('missing robots noindex')
  if (doc.querySelector('link[rel="canonical"]')) errors.push('unexpected canonical link')
  if (doc.querySelector('meta[property="og:url"]')) errors.push('unexpected og:url')
  if (doc.querySelector('link[rel="alternate"][hreflang]'))
    errors.push('unexpected hreflang alternates')
  if (doc.querySelector('script[type="application/ld+json"]')) errors.push('unexpected JSON-LD')
  return [...errors, ...checkFileSize(Buffer.byteLength(html))]
}

/** The sitemap lists exactly the catalog URLs, each with a YYYY-MM-DD <lastmod>. */
export function checkSitemap(xml, catalog) {
  const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1])
  const errors = []
  const locs = []
  for (const block of blocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]
    locs.push(loc)
    if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(block)) {
      errors.push(`sitemap entry ${loc} has no YYYY-MM-DD <lastmod>`)
    }
  }
  const expected = new Set(catalog.map((page) => page.url))
  const listed = new Set(locs)
  for (const url of expected) if (!listed.has(url)) errors.push(`sitemap is missing ${url}`)
  for (const loc of locs) if (!expected.has(loc)) errors.push(`sitemap lists unexpected ${loc}`)
  if (locs.length !== listed.size) errors.push('sitemap lists a URL more than once')
  return errors
}

/** Runs every per-document check that applies to one catalog page. */
export function checkCatalogDocument({ page, html, languageSlugs = [] }) {
  const doc = parseHtml(html)
  return [
    ...checkLang(doc, page.locale),
    ...checkAppRoot(doc),
    ...checkTitle(doc),
    ...checkDescription(doc),
    ...checkCanonical(doc, page.url),
    ...checkAlternates(doc, page),
    ...checkNoLocalhost(doc),
    ...checkOpenGraph(doc, page.url),
    ...checkJsonLd(doc, page),
    ...(page.kind === 'language-detail'
      ? [...checkLanguageSections(doc, page.locale), ...checkBackLink(doc, page.locale)]
      : []),
    ...(page.kind === 'home' ? checkHomeLinks(doc, page.locale, languageSlugs) : []),
    ...checkFileSize(Buffer.byteLength(html)),
  ]
}

function listHtmlFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listHtmlFiles(full, base)
    return entry.name.endsWith('.html') ? [path.relative(base, full).split(path.sep).join('/')] : []
  })
}

/**
 * Checks a whole dist/ directory against the page catalog.
 *
 * @returns {{ fileCount: number, failures: { file: string, errors: string[] }[] }}
 */
export function verifyBuild({ distDir, catalog, locales }) {
  const htmlFiles = listHtmlFiles(distDir)
  const nonIndexed = nonIndexedDocuments(locales)
  const failures = []

  const setErrors = [...checkFileSet(catalog, nonIndexed, htmlFiles), ...checkBrandAssets(distDir)]
  if (setErrors.length) failures.push({ file: 'dist/', errors: setErrors })

  const sitemapFile = path.join(distDir, 'sitemap.xml')
  const sitemapErrors = fs.existsSync(sitemapFile)
    ? checkSitemap(fs.readFileSync(sitemapFile, 'utf8'), catalog)
    : ['missing sitemap.xml']
  if (sitemapErrors.length) failures.push({ file: 'sitemap.xml', errors: sitemapErrors })

  for (const document of nonIndexed) {
    const file = htmlFileForPath(document.path)
    if (!htmlFiles.includes(file)) continue
    const errors = checkNonIndexedDocument({
      document,
      html: fs.readFileSync(path.join(distDir, file), 'utf8'),
    })
    if (errors.length) failures.push({ file, errors })
  }

  const languageSlugs = [...new Set(catalog.filter((page) => page.slug).map((page) => page.slug))]
  const titleByFile = {}
  for (const page of catalog) {
    const file = htmlFileForPath(page.path)
    if (!htmlFiles.includes(file)) continue
    const html = fs.readFileSync(path.join(distDir, file), 'utf8')
    titleByFile[file] = parseHtml(html).title
    const errors = checkCatalogDocument({ page, html, languageSlugs })
    if (errors.length) failures.push({ file, errors })
  }

  const titleErrors = checkUniqueTitles(titleByFile)
  if (titleErrors.length) failures.push({ file: 'dist/', errors: titleErrors })

  return { fileCount: htmlFiles.length, failures }
}

function main() {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const catalog = buildPageCatalog({
    locales: SUPPORTED_CODES,
    languageSlugs: readLanguageSlugs(root),
  })
  const { fileCount, failures } = verifyBuild({
    distDir: path.join(root, 'dist'),
    catalog,
    locales: SUPPORTED_CODES,
  })

  if (failures.length) {
    console.error(`verify-build: ${failures.length} file(s) failed:`)
    for (const { file, errors } of failures) {
      for (const error of errors) console.error(`  ${file}: ${error}`)
    }
    process.exit(1)
  }
  console.log(
    `verify-build: ${fileCount} HTML files OK (${catalog.length} catalog pages + root + not-found).`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
