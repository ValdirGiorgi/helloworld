# Phase 0 Research: Internationalization with Automatic Language Detection

No items in the Technical Context were marked `NEEDS CLARIFICATION` — the two ambiguous points in
the spec itself (translation scope, country-detection mechanism) were already resolved by the user
during `/speckit-specify` (see spec.md FR-010, FR-011). The research below documents the concrete
technical decisions needed to implement those resolved requirements.

## 1. No i18n library — plain composable + JS dictionaries

**Decision**: Implement locale detection, fallback, manual override, and persistence in one small
`useLocale.js` composable, and store translated strings as plain JS objects in
`src/i18n/locales/{en,pt-BR,es}.js`. Do not add vue-i18n or any other i18n library.

**Rationale**: The project's scale is small and fixed by spec: exactly 3 locales, a few dozen short
interface strings, and one short article, with no pluralization, date/number formatting, or
ICU-message-format needs mentioned anywhere in spec.md. `002-responsive-sidebar-search`'s own
research.md already established the project's precedent of preferring a small amount of custom code
over a new dependency when the built-in platform (or a trivial function) already covers the need —
the same reasoning applies here. A hand-rolled dictionary lookup is also easier for a first-time
contributor to this teaching-oriented project to read end-to-end than a library's configuration
surface.

**Alternatives considered**:
- *vue-i18n*: rejected — the de facto standard for larger Vue apps, but its plural rules, message
  compiler, and legacy/composition-mode configuration solve problems this project doesn't have; it
  would also add several KB to the gzip budget for capability that goes unused, working against the
  stated performance budget (plan.md Constraints) and Constitution Principle IV's "do not add
  complexity for a performance gain [or capability] that has not been demonstrated to matter."
- *A generic lightweight i18n micro-library*: rejected for the same reason — even a small library is
  an unjustified dependency when the actual need (look up a string by key in one of three flat
  objects) is a few lines of code.

## 2. Country detection: explicit region subtag only, no guessing

**Decision**: Read `navigator.languages` (falling back to the single `navigator.language` if the
array is unavailable); for each tag in order, attempt `new Intl.Locale(tag).region` and use the
**first tag that already carries an explicit region subtag** (e.g., `pt-BR` → region `BR`,
`es-MX` → region `MX`, `en-US` → region `US`). Do **not** call `Intl.Locale.prototype.maximize()` to
guess a region from a bare language tag (e.g., a generic `es` or `pt` with no region attached).

**Rationale**: The resolved clarification (spec.md FR-011) says the country is inferred "from the
region/country information the visitor's own browser **already reports**" — `maximize()` would
instead *invent* a region using CLDR likely-subtag data (e.g., a bare `pt` tag maximizes to
`pt-Latn-PT`, not `pt-BR`), which could silently steer a Brazilian visitor with a generically
configured browser to Portuguese-flavored assumptions or the wrong branch of the country rule. Only
trusting an explicitly reported region keeps the behavior predictable and matches the literal
resolved requirement; a visitor whose browser reports no region at all correctly falls through to
the English default (FR-004), which is an accepted, spec'd edge case (see spec.md Edge Cases).

**Alternatives considered**:
- *`Intl.Locale.maximize()` region guessing*: rejected per the rationale above — risks a wrong or
  surprising country guess for a requirement that explicitly asked for detection based on what the
  browser "already reports," not inference.
- *IP-based geolocation*: already rejected during `/speckit-specify` (spec.md FR-011 resolution) —
  would add a network dependency and a privacy consideration the static, backend-free architecture
  doesn't otherwise have (see `specs/001-hello-world-multilang-site/plan.md`).

## 3. Naming: "locale" everywhere, never "language," for the new concept

**Decision**: All new identifiers for this feature — the composable, the dictionaries directory, the
switcher component, storage keys, test files — use "locale" (`useLocale`, `LocaleSwitcher.vue`,
`src/i18n/locales/`), never "language."

**Rationale**: This codebase already has a well-established, unrelated meaning for "language" — a
*programming* language (`LanguageCard`, `LanguageList`, `LanguageSearch`, `LanguageSidebar`,
`useLanguages`, `LanguageEntry`). Reusing that word for the UI's *display* language would be
genuinely confusing in code review, tests, and future contributions (e.g., "does `useLanguage`
return the app's locale or a `LanguageEntry`?"). Consistent naming that avoids this collision is a
direct application of Constitution Principle I's requirement that naming follow the conventions
already established elsewhere in the codebase — here, that means deliberately *not* overloading an
existing, load-bearing term.

**Alternatives considered**:
- *Reuse "language" for the new UI-locale concept* (e.g., `useLanguagePreference`): rejected — the
  ambiguity risk against the existing `useLanguages`/`LanguageEntry` concept is exactly the kind of
  naming collision Principle I's consistency rule exists to prevent.

## 4. Persisting only the manual choice, not the auto-detected one

**Decision**: `useLocale.js` reads a `localStorage` key (e.g., `site-locale`) once on startup; if it
holds one of the three supported codes, that locale is used immediately and automatic detection is
skipped entirely for that visitor. If the key is absent, detection runs (§2 above) but its result is
**not** written back to `localStorage` — only an explicit manual selection via `LocaleSwitcher.vue`
writes the key.

**Rationale**: Spec.md's User Story 2 and FR-009 only require persistence for a *manually chosen*
language ("Once a visitor has manually chosen a language, the system MUST continue showing that
language... on later visits"); User Story 1's automatic detection is not required to be "sticky"
beyond a given visit, and re-running the same deterministic detection on a later visit produces the
same result anyway (a visitor's browser locale settings rarely change between sessions). Not writing
on every load also keeps the behavior simple to reason about: the presence of the storage key alone
tells you whether a visitor has ever manually overridden the automatic choice.

**Alternatives considered**:
- *Always persist the resolved locale, whether detected or manual*: rejected — indistinguishable
  from a manual choice once written, which would incorrectly "lock in" a first-visit detection result
  even if the visitor's underlying browser locale later changes (e.g., a shared/library computer
  reused by a different person), contradicting the spirit of FR-002's "automatically determine...
  on first load."

## 5. Spanish-speaking countries: a static reference list

**Decision**: A static array of ISO 3166-1 alpha-2 country codes for Spanish-speaking countries
(Spain and the Spanish-speaking countries of Latin America) lives in
`src/i18n/spanishSpeakingCountries.js`, matching spec.md's own Assumptions section describing this
as "a standard, well-known list... treated as static reference data."

**Rationale**: The spec explicitly scopes changing this list as out of this feature's bounds; a
plain, well-commented array is the simplest possible representation and needs no build step or
external data source.

**Alternatives considered**:
- *An npm package of country/language mappings*: rejected — the list is short, static, and already
  fully specified in scope by spec.md; a dependency for ~20 hardcoded strings is unjustified.

## 6. Localized History content as per-locale Markdown files

**Decision**: Rename `content/history.md` to `content/history.pt-BR.md` (preserving its existing
Portuguese text unchanged) and add `content/history.en.md` and `content/history.es.md`. Load all
three at build time via `import.meta.glob` (the same pattern `useLanguages.js` already uses for
`content/languages/*.md`), and have `HistoryPage.vue` render whichever one matches the active
locale, with `history.en.md` used as the content-level fallback if a locale's file were ever missing
(defensive; all three are always authored as part of this feature).

**Rationale**: This is the smallest change consistent with the project's existing "content lives in
plain Markdown files, parsed/loaded at build time" architecture (see
`specs/001-hello-world-multilang-site/research.md`); it needs no new parsing logic beyond selecting
which pre-rendered file to show, and keeps translators working in the same familiar file format
already used for contributed language content.

**Alternatives considered**:
- *One `history.md` with all three languages concatenated/sectioned*: rejected — would require a new
  custom section-splitting parser for no benefit over three independent files, and would make each
  translation's Git history/diffs harder to follow.
- *Embedding the History text as strings inside the locale dictionaries*: rejected — Markdown
  content (headings, paragraphs, possibly links) is a poor fit for a flat string-dictionary format
  designed for short UI labels, and would lose the existing Markdown-to-HTML rendering pipeline
  (`markdown-it`) already used for this exact content.

## Outcome

All Technical Context items are resolved with existing tools; no new runtime dependency is
introduced. Proceeding to Phase 1 design.
