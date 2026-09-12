# Page & Component Contracts: About Page

## Route

Added to `src/router/index.js`'s `routes` array, in the same shape as `history`:

```js
{
  path: '/:locale(pt-BR|en|es)/about',
  name: 'about',
  component: () => import('../pages/AboutPage.vue'),
}
```

No change to the `beforeEach` guard or `createWebHistory()` setup — both are already
route-agnostic (research.md §3).

## `src/siteLinks.js` (new)

Default-free named exports, three plain strings (data-model.md `SiteLink`):

```js
export const SPEC_KIT_REPO_URL = 'https://github.com/github/spec-kit'
export const PROJECT_REPO_URL = 'https://github.com/ValdirGiorgi/helloworld'
export const BLOG_ARTICLE_URL = 'https://blog.valdir.dev.br/speckit'
```

## `<AboutPage>` (new)

- **Props**: none — a top-level route component, like `HistoryPage.vue`.
- **Reads**: `t` from `useLocale()` for all text (data-model.md `AboutPageContent`); the three
  constants from `src/siteLinks.js` for link `href`s.
- **Renders**:
  - A heading using `t('about.title')`.
  - `t('about.intro')` (states the project was created by Valdir Giorgi to test Spec Kit).
  - A link to `SPEC_KIT_REPO_URL`, labeled `t('about.specKitLinkLabel')`, opened via
    `target="_blank" rel="noopener noreferrer"` (same external-link convention already used by
    `AppFooter.vue`'s GitHub link).
  - `t('about.blogIntro')` plus a link to `BLOG_ARTICLE_URL`, labeled `t('about.blogLinkLabel')`,
    same external-link convention.
  - `t('about.repoIntro')` plus a link to `PROJECT_REPO_URL`, labeled `t('about.repoLinkLabel')`,
    same external-link convention.
  - `t('about.contribute')` (states the repository above is where the contribution guide is
    found — no separate link needed here per spec.md Assumptions, since it refers back to the
    repository link already rendered above).
- **Does not**: fetch anything, accept route params, or depend on any content outside the three
  constants and the `about.*`/`nav.*` translated keys.

## `<NavMenu>` (changed)

- **Contract**: no prop/emit change. Its existing `links` computed array (already
  `[{ name, label }, ...]`, rendered via a `v-for` `<router-link :to="{ name, params: { locale } }">`
  loop) gains one more entry: `{ name: 'about', label: t('nav.about') }`, positioned after the
  existing `history` entry.

## `<AppFooter>` (changed)

- **Contract**: no prop/emit change. Its existing external `<a>` element's `href="https://github.com/"`
  literal is replaced with `PROJECT_REPO_URL` imported from `src/siteLinks.js` (spec.md FR-008;
  data-model.md `SiteLink` validation rule — this is the single other call site sharing that
  constant with `AboutPage.vue`). No other markup changes.
