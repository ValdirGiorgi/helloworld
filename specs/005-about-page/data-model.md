# Data Model: About Page

This feature introduces no persisted data or backend state. The "entities" below are the new
translated content keys and the shared link constants.

## AboutPageContent (new `TranslatedMessage` keys — see `003-i18n-language-detection/data-model.md`)

Added under a new `about` namespace in each of `src/i18n/locales/{en,pt-BR,es}.js`, following the
same nested-key, same-key-set-across-locales convention already established:

| Key | Purpose |
|-----|---------|
| `about.title` | Page heading / document title for the About page. |
| `about.intro` | States the project was created by Valdir Giorgi to test the Spec Kit tool (spec.md FR-002). |
| `about.specKitLinkLabel` | Visible text for the link to Spec Kit's own repository (FR-003). |
| `about.blogIntro` | Introduces the author's blog / the article about this project's experience (FR-004). |
| `about.blogLinkLabel` | Visible text for the blog article link. |
| `about.repoIntro` | Introduces this project's own repository (FR-005). |
| `about.repoLinkLabel` | Visible text for the project repository link. |
| `about.contribute` | States that contributing a new language starts at the project's repository (FR-006). |

Plus one new key alongside the existing `nav.*` namespace:

| Key | Purpose |
|-----|---------|
| `nav.about` | The About page's label in the main navigation (spec.md FR-001). |

**Validation rules** (inherited from `003-i18n-language-detection`'s `TranslatedMessage` entity):
every key above MUST be present, with a non-empty value, in all three locale files — enforced by
the existing `tests/unit/locales.spec.js` recursive key-path check; no new completeness test is
needed for this feature specifically.

## SiteLink (new, static reference data — not translated)

Defined once in `src/siteLinks.js`, imported wherever needed; not part of any `TranslatedMessage`
dictionary since a URL doesn't vary by locale (research.md §2).

| Constant | Value | Used by |
|----------|-------|---------|
| `SPEC_KIT_REPO_URL` | `https://github.com/github/spec-kit` | `AboutPage.vue` (FR-003) |
| `PROJECT_REPO_URL` | `https://github.com/ValdirGiorgi/helloworld` | `AboutPage.vue` (FR-005) and `AppFooter.vue` (FR-008) — same constant, two call sites |
| `BLOG_ARTICLE_URL` | `https://blog.valdir.dev.br/speckit` | `AboutPage.vue` (FR-004) |

**Validation rules**:
- `PROJECT_REPO_URL` MUST be the single source of truth for the project's repository address — no
  other file may hardcode this URL as a separate literal (research.md §2; spec.md FR-005/FR-008
  both resolve to this one constant).
