import { slugFromFilename } from './parseLanguageFile.js'

// Only each language's display name (a `?name` import, see vite.config.js),
// so the app-wide page head does not pull every example into the initial
// bundle. Language files added while the dev server runs are picked up like
// any glob import.
const namesByPath = import.meta.glob('/content/languages/*.md', {
  query: '?name',
  import: 'default',
  eager: true,
})

/** `{ [slug]: name }` for every content/languages/*.md file. */
export const LANGUAGE_NAMES = Object.fromEntries(
  Object.entries(namesByPath).map(([path, name]) => [slugFromFilename(path.split('/').pop()), name]),
)
