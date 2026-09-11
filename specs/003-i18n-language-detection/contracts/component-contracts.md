# Component & Composable Contracts: Internationalization

This feature's only "interfaces" are a composable's return shape, the message-dictionary file
shape, and one new component's props/emits. Documented here so implementation (tasks.md) and tests
agree on the exact shape before code is written.

## `src/i18n/locales/{en,pt-BR,es}.js`

Each file's default export is a nested, plain JS object in vue-i18n's native `messages` shape
(e.g., `{ header: { title: '...' }, search: { placeholder: '...' } }`), consumed directly by
`createI18n({ messages: { en, 'pt-BR': ptBR, es } })` in `src/i18n/index.js`.

- **Required**: the three files' exported objects MUST have exactly the same set of key paths (see
  data-model.md `TranslatedMessage` validation rules). `en.js` is treated as the canonical key set
  other locales are checked against; it also doubles as vue-i18n's `fallbackLocale`.
- Keys are namespaced by area (e.g., `header.title`, `search.placeholder`, `footer.contribute`,
  `languageList.noResults`, `expandable.showMore`, `expandable.showLess`, `variables.integer`),
  using vue-i18n's native nested-object resolution (`t('header.title')` walks the object path) —
  this is the idiomatic vue-i18n convention, not a project-specific one.

## `src/i18n/spanishSpeakingCountries.js`

Default export: `string[]` — ISO 3166-1 alpha-2 codes, uppercase, no duplicates. Unrelated to
vue-i18n; consumed only by the country-rule detection logic in `useLocale()`.

## `src/i18n/index.js`

Default export: a vue-i18n instance from `createI18n({ legacy: false, locale: 'en', fallbackLocale:
'en', messages: { en, 'pt-BR': ptBR, es } })`. `legacy: false` selects Composition API mode
(`useI18n()` inside `<script setup>`), matching the rest of the codebase's Composition API style.
Installed once via `app.use(i18n)` in `src/main.js`.

## `useLocale()` *(revised by the 2026-09-11 Per-Language URL Routing amendment)*

A composable, called once per component that needs it. Internally calls vue-i18n's own `useI18n()`
for message lookup/reactivity and Vue Router's `useRoute()`/`useRouter()`, and adds the
project-specific behavior neither library provides: country-based detection (unchanged from the
original feature), the no-locale redirect, and locale-aware navigation.

- **Returns**:
  - `locale: ComputedRef<string>` — now derived from `route.params.locale` (the URL is the source
    of truth per data-model.md's revised `LocalePreference`), kept in sync with vue-i18n's own
    `locale` via a watcher so `t()` always matches the current address. Always one of
    `SupportedLocale.code` — a route with an invalid/missing `:locale` never reaches a component,
    because the router guard (below) redirects it first.
  - `t: (key: string) => string` — unchanged: vue-i18n's own `t()`, re-exported.
  - `setLocale: (code: string) => void` — **changed**: if `code` is one of the three supported
    codes, writes it to the `ManualLocaleChoice` storage key (unchanged) and navigates
    (`router.push`) to the current route's `name`/`params` with `params.locale` replaced by `code`
    — i.e., switching locale now changes the address (FR-017), not just vue-i18n's in-memory
    `locale`. Ignores an unsupported `code` (no-op), same as before.
  - `supportedLocales: SupportedLocale[]` — unchanged: the three `{ code, name, flag }` entries.
- **Does not**: perform any network request. Still owns no UI of its own.

## Router `:locale` guard (new)

Not a component or composable, but a contract every route and every internal link depends on —
documented here since it has no other natural home.

- Every route is defined once, under a `/:locale(pt-BR|en|es)` path prefix (the parenthesized group
  is a regex constraint vue-router evaluates against the URL segment) — `/:locale`,
  `/:locale/history`, `/:locale/languages/:slug`.
- A global `router.beforeEach(to => ...)` guard: if `to.params.locale` is one of the three codes,
  returns `true` (proceed) unchanged. Otherwise, resolves a locale per data-model.md's revised
  `LocalePreference` rule 2 (stored `ManualLocaleChoice` else country-based detection) and returns
  a redirect to `to.fullPath` prefixed with that locale (FR-016).
- **Required of every caller**: any `<router-link>` or programmatic `router.push`/`router.replace`
  elsewhere in the app MUST include the current `locale` in its target — e.g.,
  `:to="{ name: 'history', params: { locale } }"` — never a bare, locale-free path, or the guard
  above will bounce it through an extra redirect unnecessarily.

## `useLocaleSeoTags()` (new)

Called once, from `App.vue`'s top level (not per-page) — it watches the active route and `locale`
and keeps the document head in sync; renders nothing itself.

- **Input**: none (reads `useRoute()` and `useLocale()` internally).
- **Effect** (re-run on every route/locale change, per data-model.md's `SeoHeadTags`):
  - Sets `document.title` and finds-or-creates `<meta name="description">`, from translated
    messages (a new, page-independent `meta.description` key per locale — see data-model.md
    `SeoHeadTags.description`).
  - Sets `document.documentElement.lang` to the active locale code.
  - Finds-or-creates exactly three `<link rel="alternate" hreflang="{code}">` elements (one per
    supported locale, pointing at that locale's `LocaleAddress` for the current `path`) plus one
    `<link rel="alternate" hreflang="x-default">` pointing at the English `LocaleAddress`.
  - Finds-or-creates one `<link rel="canonical">` pointing at the **current** page's own absolute
    address (never a different locale's address).
- **Does not**: fetch anything, or persist anything — purely a DOM side effect derived from
  already-available reactive state.

## `<LocaleSwitcher>` *(contract unchanged by the routing amendment)*

- **Props**: none — reads everything it needs from `useLocale()` internally (this component is a
  thin, self-contained UI over the composable, similar in spirit to how `LanguageSidebar.vue` owns
  its own list rendering).
- **Emits**: none.
- **Renders**: one button per entry in `supportedLocales`, showing that locale's `flag` emoji as
  its visible content and `name` as its `aria-label` (so the accessible name is always the
  language's own name, regardless of the flag-based visual treatment); the currently active one is
  marked via `aria-current="true"`. Activating an entry calls `setLocale(code)` — as of this
  amendment, that now navigates to the equivalent address under the new locale (see `useLocale()`
  above) rather than only re-rendering in place; the component itself required no change.
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
- **Amendment addition**: `AppHeader.vue`'s brand `<router-link>` (to the home page) and
  `NavMenu.vue`'s two links (Languages/History) MUST include `params: { locale }` (from
  `useLocale()`) so internal navigation never produces a locale-free address (see the router
  guard's "Required of every caller" note above).

## `public/.htaccess` (new static asset)

Not code — a static file Vite copies to `dist/.htaccess` unmodified (research.md §5), giving the
deployed site an Apache rewrite rule so any address that isn't a real file falls back to
`index.html`, which `vue-router`'s `createWebHistory()` then resolves client-side. Contract: MUST
NOT rewrite requests for files that actually exist (assets, images) — only requests with no
matching file/directory.
