# Data Model: Internationalization with Automatic Language Detection

This feature introduces no server-side or build-time-parsed business data — it adds a small amount
of static reference data (message dictionaries, a country list) and one piece of transient
per-visitor UI state (the active locale). Documented below for clarity.

## SupportedLocale (static reference data)

One of the three interface locales the site can display.

| Field  | Type   | Notes                                                                 |
|--------|--------|------------------------------------------------------------------------|
| `code` | string | One of `'pt-BR'`, `'en'`, `'es'`. `'en'` is the default/fallback (FR-005). |
| `name` | string | Human-readable name shown in the locale switcher (e.g., "Português", "English", "Español") — itself not translated, always shown in its own language, per common practice for language pickers. |

**Validation rules**:
- Exactly these three codes are valid (FR-001); no other value may be treated as a supported locale.

## LocalePreference (transient, per-visitor UI state)

Represents which locale currently governs what a given visitor sees.

| Field      | Type                        | Notes                                                                |
|------------|-----------------------------|-------------------------------------------------------------------------|
| `code`     | one of `SupportedLocale.code` | The currently active locale.                                          |
| `source`   | `'manual'` \| `'detected'`  | Whether `code` came from an explicit switcher choice or from automatic detection. Not persisted itself — only used to decide whether to write to storage (research.md §4). |

**Derivation rules** (FR-002–FR-005, FR-009, FR-011):
1. On startup, read the manual-choice storage key (see `ManualLocaleChoice` below). If it holds a
   valid `SupportedLocale.code`, `LocalePreference` = `{ code: <that value>, source: 'manual' }` and
   detection is skipped entirely.
2. Otherwise, run country detection (see `DetectedCountry` below) and apply the country rule:
   - country is Brazil → `{ code: 'pt-BR', source: 'detected' }`
   - country is in the Spanish-speaking country list → `{ code: 'es', source: 'detected' }`
   - country is anything else, or could not be determined → `{ code: 'en', source: 'detected' }`
3. When a visitor uses the locale switcher, `LocalePreference` immediately becomes
   `{ code: <selected>, source: 'manual' }`, and the manual-choice storage key is written (FR-008,
   FR-009).

## DetectedCountry (derived, not stored)

An ISO 3166-1 alpha-2 country code inferred from the browser, or `null` if none could be determined.

**Derivation rule** (FR-011, research.md §2): iterate `navigator.languages` (or the single
`navigator.language` as a fallback) in the browser's own stated preference order; for the first tag
that carries an explicit region subtag, use that region as the country. If no tag in the list
carries an explicit region, the result is `null` (undeterminable — falls through to English per
FR-004).

## SpanishSpeakingCountries (static reference data)

A fixed list of ISO 3166-1 alpha-2 codes for countries where Spanish is an official or de facto
national language (spec.md Assumptions). Used only as a membership check by the country rule above.
Out of scope for this feature to edit/expand (spec.md Assumptions).

## ManualLocaleChoice (persisted, per-visitor, per-browser)

| Field         | Type                  | Notes                                                          |
|---------------|-----------------------|------------------------------------------------------------------|
| storage key   | string constant       | e.g. `site-locale`, stored in the visitor's browser (`localStorage`). |
| stored value  | one of `SupportedLocale.code`, or absent | Written only when the visitor uses the locale switcher (research.md §4); never written for an automatically detected result. |

**Validation rules**:
- A stored value outside the three supported codes (e.g., from a future/older version of the site)
  MUST be treated as absent — detection runs as if no manual choice existed.

## TranslatedMessage (static reference data — the dictionaries)

Each of the three locale dictionaries (`src/i18n/locales/{en,pt-BR,es}.js`) is a flat set of
key → string entries covering every piece of app-generated interface text in scope per FR-010
(navigation, buttons, section labels, the search placeholder, the sidebar heading, the footer, the
page title/tagline, the "no results" message, etc.).

**Validation rules**:
- **Every key present in one locale's dictionary MUST be present in all three** — this is the
  single most important invariant for this feature (an untranslated string is a functional gap, not
  a cosmetic one) and MUST be covered by an automated test (see quickstart.md), not left to manual
  review.
- Per-language (programming-language) contributed content (`content/languages/*.md`) is explicitly
  **not** a `TranslatedMessage` and is unaffected by locale switching (FR-010).

## LocalizedArticle (the History page's content)

| Field    | Type   | Notes                                                                    |
|----------|--------|---------------------------------------------------------------------------|
| `locale` | string | One of the three supported codes.                                        |
| `body`   | string | Raw Markdown for that locale, from `content/history.{locale}.md`.        |

**Validation rules**:
- All three locale files MUST exist and contain a complete translation of the article (SC-007); a
  missing file falls back to the English version at render time (research.md §6) as a defensive
  measure, not as an accepted normal state.
