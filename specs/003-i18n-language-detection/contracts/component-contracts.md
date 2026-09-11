# Component & Composable Contracts: Internationalization

This feature's only "interfaces" are a composable's return shape, the message-dictionary file
shape, and one new component's props/emits. Documented here so implementation (tasks.md) and tests
agree on the exact shape before code is written.

## `src/i18n/locales/{en,pt-BR,es}.js`

Each file's default export is a flat, plain JS object: `{ [key: string]: string }`.

- **Required**: the three files' exported objects MUST have exactly the same set of keys (see
  data-model.md `TranslatedMessage` validation rules). `en.js` is treated as the canonical key set
  other locales are checked against.
- Keys are dot-namespaced by area for readability (e.g., `'header.title'`, `'search.placeholder'`,
  `'footer.contribute'`, `'languageList.noResults'`, `'expandable.showMore'`,
  `'expandable.showLess'`, `'variables.integer'`), but this is a naming convention, not a
  structural requirement — the contract only requires flat string values and matching key sets.

## `src/i18n/spanishSpeakingCountries.js`

Default export: `string[]` — ISO 3166-1 alpha-2 codes, uppercase, no duplicates.

## `useLocale()`

A composable, called once per component that needs it (backed by module-level singleton reactive
state — same pattern as `useLanguages.js` — so every caller shares one active locale).

- **Returns**:
  - `locale: ComputedRef<string>` — the currently active `SupportedLocale.code`.
  - `t: (key: string) => string` — looks up `key` in the active locale's dictionary; if the key is
    missing in the active dictionary (should not happen given the completeness invariant, but
    defensively), falls back to the English dictionary's value for that key, then to the key itself
    as a last resort so a missing translation never renders as a blank string.
  - `setLocale: (code: string) => void` — if `code` is one of the three supported codes: updates
    `locale`, and writes it to the `ManualLocaleChoice` storage key (data-model.md). Ignores an
    unsupported `code` (no-op).
  - `supportedLocales: SupportedLocale[]` — the three `{ code, name }` entries, for rendering the
    switcher.
- **Initialization** (runs once, at module load): resolves the initial `locale` per
  data-model.md's `LocalePreference` derivation rules (manual storage value if present and valid,
  else browser-based country detection + the country rule, else English).
- **Does not**: perform any network request, or depend on Vue Router.

## `<LocaleSwitcher>`

- **Props**: none — reads everything it needs from `useLocale()` internally (this component is a
  thin, self-contained UI over the composable, similar in spirit to how `LanguageSidebar.vue` owns
  its own list rendering).
- **Emits**: none.
- **Renders**: one control (e.g., three buttons or a `<select>`) per entry in `supportedLocales`,
  each labeled with that locale's own `name`; the currently active one is marked via
  `aria-current="true"` (or `aria-selected` if implemented as a listbox/select). Activating an
  entry calls `setLocale(code)`.
- **Placement**: rendered inside `AppHeader.vue`, visible at the top of every page (FR-007),
  alongside the existing `NavMenu` — not nested inside any per-page content, so it survives
  navigation between the Home, History, and language-detail pages unchanged.

## `HistoryPage.vue` (changed)

- Reads `locale` from `useLocale()`; selects the matching entry from the `import.meta.glob('/content/history.*.md', { query: '?raw', import: 'default', eager: true })` map (falls back to the
  English entry if the active locale's file is unexpectedly absent — data-model.md `LocalizedArticle`); renders it exactly as `history.md` is rendered today (same `markdown-it` pipeline, same
  `HistoryArticle` component). The page's own title (`title` prop to `HistoryArticle`) comes from
  `t('history.title')` rather than a hardcoded string.

## Every other changed component (`AppHeader`, `AppFooter`, `NavMenu`, `HomePage`, `LanguageList`,
`LanguageSearch`, `LanguageSidebar`, `LanguageCard`, `ExpandableSection`, `VariableList`,
`LanguageDetailPage`)

- **Contract**: no prop/emit signature changes. Each simply calls `const { t } = useLocale()` and
  replaces its hardcoded Portuguese string literals with `t('some.key')` calls, using the key
  namespace convention above. `ExpandableSection.vue`'s existing `expandLabel`/`collapseLabel` props
  keep their current default values as a safety net, but callers (e.g., `LanguageCard.vue`) now pass
  `t('expandable.showMore')`/`t('expandable.showLess')` explicitly instead of relying on the
  Portuguese-only defaults.
