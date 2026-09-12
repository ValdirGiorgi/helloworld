# Data Model: Sitemap for Search Engine Discovery

No application/persisted data is introduced. The entities below describe the shape of the generated
file and the in-memory structures the generator builds on its way to producing it.

## SitemapUrlEntry

One `<url>` block in the generated `sitemap.xml`.

| Field        | Type                          | Notes                                                                                     |
|--------------|--------------------------------|---------------------------------------------------------------------------------------------|
| `loc`        | absolute URL string            | The page's canonical address, e.g. `https://helloworld.valdir.dev.br/en/languages/python`. Required, unique within the sitemap (FR-003: no duplicate entries for the same effective page). |
| `alternates` | array of `{ hreflang, href }`  | One entry per supported locale (`pt-BR`, `en`, `es`) pointing at that same page's address in that locale, plus one `{ hreflang: 'x-default', href: <en address> }` (FR-002). |

**Validation rules** (enforced by `generateSitemap.js` and checked by its unit test):
- `loc` MUST start with the fixed site origin (`https://helloworld.valdir.dev.br`) and MUST match one
  of the addresses the app's own router would resolve (FR-007).
- `alternates` MUST contain exactly `SUPPORTED_CODES.length + 1` entries (one per locale + x-default) —
  never fewer, since every page kind in this site currently exists in all three locales (see spec
  Assumptions).
- No two `SitemapUrlEntry` values may share the same `loc` (FR-003).

## PageKind (generation input, not a persisted entity)

Describes one class of route the generator must enumerate, sourced directly from
`src/router/index.js`'s route list — not a separate hand-maintained list.

| Field         | Type   | Example                                    |
|---------------|--------|---------------------------------------------|
| `name`        | string | `home`, `history`, `about`, `language-detail` |
| `pathBuilder` | function | `(locale) => \`/${locale}\`` for `home`; `(locale, slug) => \`/${locale}/languages/${slug}\`` for `language-detail` |
| `slugs`       | array of string \| `null` | `null` for single-page kinds; the list of language slugs (from `content/languages/*.md`) for `language-detail` |

## Sitemap (the generated file, as a whole)

| Field     | Type                        | Notes                                                                 |
|-----------|------------------------------|------------------------------------------------------------------------|
| `entries` | array of `SitemapUrlEntry`   | Built from every `PageKind` × every supported locale (× every slug for `language-detail`). |

**State/lifecycle**: Regenerated in full on every build (no incremental/partial updates, no persisted
state between builds) — see research.md §1–2.
