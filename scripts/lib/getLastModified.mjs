import { execFileSync } from 'node:child_process'
import { PAGE_KINDS } from '../../src/seo/pageCatalog.js'

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Returns the last commit date (`YYYY-MM-DD`) that touched any of `files`,
 * from `git log -1 --format=%cs` (research.md §6). Falls back to today's UTC
 * date when the files have no commit yet or git is unavailable.
 *
 * @param {string[]} files - Repo-relative paths.
 * @param {{ cwd: string }} options
 */
export function getLastModified(files, { cwd }) {
  try {
    const output = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return output || todayUtc()
  } catch {
    return todayUtc()
  }
}

/**
 * Maps every catalog page path to its `lastmod`, using each page kind's
 * `sourceFiles`.
 *
 * @returns {Record<string, string>}
 */
export function buildLastModMap({ catalog, cwd }) {
  return Object.fromEntries(
    catalog.map((page) => {
      const pageKind = PAGE_KINDS.find((kind) => kind.name === page.kind)
      return [page.path, getLastModified(pageKind.sourceFiles(page.locale, page.slug), { cwd })]
    }),
  )
}
