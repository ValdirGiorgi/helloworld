# Quickstart: About Page

## Prerequisites

- No new dependencies — `npm install` is unchanged.

## Validate: the About page exists and is reachable (User Story 1 / FR-001, FR-002, SC-002)

1. Load the site and confirm "About" (or its translated equivalent) appears in the main
   navigation, alongside "Languages" and "History".
2. Click it and confirm the address becomes `/<locale>/about` and the page states the project was
   created by Valdir Giorgi to test the Spec Kit tool.

## Validate: the three links (User Story 1-2 / FR-003-FR-006, SC-003, SC-004)

1. On the About page, confirm a link to Spec Kit's own repository
   (`https://github.com/github/spec-kit`) is present and opens in a new tab.
2. Confirm a link to the author's blog article (`https://blog.valdir.dev.br/speckit`) is present.
3. Confirm a link to this project's own repository (`https://github.com/ValdirGiorgi/helloworld`)
   is present, and that the surrounding text makes clear this is where the contribution guide is
   found.

## Validate: all three languages (User Story 1 / FR-007, SC-001)

1. Switch the site's language to each of Portuguese, English, and Spanish in turn (top-of-page
   switcher).
2. On each, confirm the About page's every sentence and link label displays in that language, with
   nothing missing or left in the wrong language.

## Validate: the footer link is fixed (User Story 3 / FR-008, SC-003)

1. On any page (Home, History, a language detail page, or the new About page), scroll to the
   footer and confirm the "GitHub" contribution link's address is
   `https://github.com/ValdirGiorgi/helloworld`, not a placeholder.

## Automated checks

```bash
npm run lint
npx vitest run
npx playwright test
npm run build
```

Expected: 0 lint errors; all existing tests still pass plus new unit tests for `AboutPage.vue` and
the corrected `AppFooter.vue` link, and a new e2e spec covering reaching the About page via the nav
in each locale and verifying the footer link's address; the production build succeeds with no
material bundle-size change (no new dependency is introduced — plan.md Performance Goals).
