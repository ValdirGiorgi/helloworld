# Data Model: Internationalization with Automatic Language Detection

This feature introduces no server-side or build-time-parsed business data — it adds a small amount
of static reference data (message dictionaries, a country list) and one piece of transient
per-visitor UI state (the active locale). Documented below for clarity.

## SupportedLocale (static reference data)

One of the three interface locales the site can display.

| Field  | Type   | Notes                                                                 |
|--------|--------|------------------------------------------------------------------------|
| `code` | string | One of `'pt-BR'`, `'en'`, `'es'`. `'en'` is the default/fallback (FR-005). |
| `name` | string | Human-readable name used as the locale switcher control's accessible name (e.g., "Português", "English", "Español") — itself not translated, always in its own language, per common practice for language pickers. |
| `flag` | string | Emoji flag shown as the switcher control's visible content (🇧🇷/🇺🇸/🇪🇸) — a per-user design choice; `name` remains the accessible label so the control stays screen-reader- and keyboard-friendly regardless of the visual treatment. |

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

## TranslatedMessage (static reference data — the vue-i18n message sets)

Each of the three locale message files (`src/i18n/locales/{en,pt-BR,es}.js`) exports a nested
object — vue-i18n's native `messages` shape — of key → string entries covering every piece of
app-generated interface text in scope per FR-010 (navigation, buttons, section labels, the search
placeholder, the sidebar heading, the footer, the page title/tagline, the "no results" message,
etc.). These feed `createI18n({ messages: { en, 'pt-BR': ptBR, es } })` in `src/i18n/index.js`.

**Validation rules**:
- **Every key path present in one locale's message tree MUST be present in all three** — this is
  the single most important invariant for this feature (an untranslated string is a functional gap,
  not a cosmetic one). vue-i18n's own `fallbackLocale: 'en'` means a missing key would otherwise
  silently render the English text with no visible error, so this invariant MUST still be covered
  by an automated completeness test (see quickstart.md) rather than relying on the runtime fallback
  or manual review to catch a gap.
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

---

## Amendment (2026-09-11): Per-Language URL Routing

### LocalePreference (revised)

The `source` field gains a fourth, highest-priority value:

| Field    | Type                                          | Notes                                    |
|----------|------------------------------------------------|-------------------------------------------|
| `code`   | one of `SupportedLocale.code`                  | Unchanged.                                |
| `source` | `'url'` \| `'manual'` \| `'detected'`          | `'url'` (new): the visitor opened a specific locale's address directly (FR-014) — this is now the actual source of truth for what renders, since `code` is read from the current route's `:locale` segment rather than from a standalone piece of state. |

**Revised derivation rule** (supersedes the original rule 1–3, per FR-013–FR-017):
1. A request for an address with a valid `:locale` segment (`pt-BR`, `en`, or `es`) renders with
   `{ code: <that segment>, source: 'url' }` — no detection or stored-preference lookup happens at
   all in this case (FR-014).
2. A request for an address with **no** `:locale` segment (or an unrecognized one) is redirected,
   before rendering, to the same path prefixed with a resolved locale: the stored `ManualLocaleChoice`
   if present (`{ code, source: 'manual' }`), otherwise the original detection algorithm
   (`{ code, source: 'detected' }`) — see FR-016. After the redirect, rule 1 applies to the new
   address.
3. Using the switcher (`setLocale`) now performs a navigation to the equivalent address under the
   new locale segment (FR-017), which is then handled by rule 1 for the destination address; it
   still also writes `ManualLocaleChoice` (unchanged), so a later no-locale address still resolves
   correctly via rule 2.

### LocaleAddress (new — the `Language Address` entity from spec.md)

| Field       | Type   | Notes                                                                   |
|-------------|--------|----------------------------------------------------------------------------|
| `locale`    | string | One of the three supported codes.                                        |
| `path`      | string | The route's path with the locale segment stripped (e.g., `/`, `/history`, `/languages/java`). |
| `full path` | string | `path` prefixed with `/{locale}` — the actual browser-visible address.    |

**Derivation**: for any rendered page, the other two `LocaleAddress` values (same `path`, other
`locale`s) are exactly what the `hreflang` alternate links (see `SeoHeadTags` below) point to —
they always exist by construction, since every route is defined once and reused under all three
locale prefixes (there is no route that exists under only one locale).

### SeoHeadTags (new, transient, derived per rendered page — not persisted)

| Field         | Type     | Notes                                                                 |
|---------------|----------|--------------------------------------------------------------------------|
| `lang`        | string   | The active locale's code; written to `<html lang>`.                    |
| `title`       | string   | Translated page title (`TranslatedMessage`), per FR-015's "declares its own language" (via `lang`) — title content itself was already required by FR-010. |
| `description` | string   | Translated meta description (a new `TranslatedMessage` key, one per locale, site-wide rather than per-page — see plan.md Amendment §Constraints for why per-page descriptions are out of scope). |
| `alternates`  | `LocaleAddress[]` | The current page's address under each of the three locales, rendered as `hreflang` alternate links (FR-015), plus one marked `x-default` pointing at the English `LocaleAddress`. |
| `canonical`   | `LocaleAddress` | Always the current page's own address (self-referencing) — never a different locale's address, so each language is treated as indexable in its own right rather than as a duplicate of another (research.md §9). |

**Validation rules**:
- `alternates` MUST include exactly the three `LocaleAddress` values for the current `path`, no
  more and no fewer (data model's own consistency: every route exists under every locale).
- These tags are only observable in the rendered DOM, not the raw HTTP response body (research.md
  §10) — this is a stated, accepted characteristic of this data, not a validation failure to fix.
