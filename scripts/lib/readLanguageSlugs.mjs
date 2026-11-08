import fs from 'node:fs'
import path from 'node:path'

/**
 * Lists the language slugs from content/languages/*.md, with the same slug
 * rule as slugFromFilename() in src/content/parseLanguageFile.js. Shared by
 * the sitemap script, vite.config.js (pre-render list) and verify-build.
 *
 * @param {string} root - Repository root.
 * @returns {string[]}
 */
export function readLanguageSlugs(root) {
  return fs
    .readdirSync(path.join(root, 'content', 'languages'))
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => filename.replace(/\.md$/, '').toLowerCase())
}
