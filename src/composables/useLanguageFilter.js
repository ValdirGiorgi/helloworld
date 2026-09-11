/**
 * Pure, case-insensitive substring filter over a LanguageEntry array's `.name`
 * field (see data-model.md `SearchQuery`/`FilteredLanguages`). An empty or
 * whitespace-only query is treated as "no filter" and returns the original
 * array unchanged (same reference, same order) rather than an empty result.
 */
export function useLanguageFilter(languages, query) {
  const trimmed = (query ?? '').trim()
  if (!trimmed) return languages

  const needle = trimmed.toLocaleLowerCase()
  return languages.filter((entry) => entry.name.toLocaleLowerCase().includes(needle))
}
