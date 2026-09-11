# Phase 0 Research: Hello World Multi-Language Showcase Site

**Input**: Technical Context unknowns from [plan.md](plan.md), constrained by the user's explicit
choice of Vue + Tailwind CSS, FTP-based deploy, per-language Markdown content files, aggressive
componentization, and a standard web-project folder layout.

## 1. Frontend framework & build tooling

**Decision**: Vue 3 (Composition API, `<script setup>` SFCs) built with Vite.

**Rationale**: Explicitly requested by the user ("Desenvolva este projeto utilizando Vue"). Vite
is Vue's own recommended scaffold (`npm create vue@latest`), gives a fast dev server, and its
`vite build` output is plain static HTML/CSS/JS — a perfect match for the spec's "static site, no
database" constraint (FR-010) and for FTP upload (nothing to run server-side).

**Alternatives considered**: Nuxt (Vue meta-framework with SSR/SSG) — rejected: adds a Node
server/build-target decision the user didn't ask for, and this project has no need for
server-side rendering or dynamic routing. Vue CLI (webpack-based) — rejected: legacy tooling,
slower dev loop, no longer Vue's recommended default.

## 2. Application language (JS vs TypeScript)

**Decision**: Plain JavaScript (ES2022+), no TypeScript.

**Rationale**: Not requested by the user; the project's own teaching goal is about comparing
Hello World across *other* languages, not about TypeScript. Keeping the app in JS keeps the
codebase approachable for a "learning spec-kit" project and avoids an unrequested tooling layer.

**Alternatives considered**: TypeScript — reasonable and common best practice, but rejected for
now to avoid adding complexity beyond what was requested; nothing in this plan blocks adding it
later (Vite/Vue support incremental TS adoption).

## 3. Styling

**Decision**: Tailwind CSS, with design tokens (colors, spacing, font scale, radii) centralized in
`tailwind.config.js`.

**Rationale**: Explicitly requested by the user. Centralizing tokens (rather than ad hoc utility
values scattered across components) is what makes Tailwind usage satisfy Constitution Principle
III (User Experience Consistency) — every component pulls from the same palette/spacing scale.

**Alternatives considered**: Component library (e.g., PrimeVue, Vuetify) — rejected: the user
asked to componentize the UI themselves for didactic value (requirement 3), which a heavy prebuilt
component library would work against.

## 4. Per-language content storage & parsing

**Decision**: One Markdown file per language under `content/languages/<slug>.md`, each following a
fixed template (YAML frontmatter for `name`/`slug`, plus four required `##` sections in a fixed
order: Hello World, Conditional, Calculation, Variables — each holding one fenced code block). At
build time, Vite's `import.meta.glob` reads all files as raw text; a small parsing utility
(frontmatter via `gray-matter`, section splitting via a plain Markdown AST from `markdown-it`)
converts each file into a `LanguageEntry` object (see [data-model.md](data-model.md)) that Vue
components consume directly — no runtime network fetch is needed because content is bundled at
build time.

**Rationale**: Matches spec FR-008/FR-014 (one structured `.md` file per language, filename =
language) and FR-010 (static, no database) exactly, while resolving the spec's open point ("maybe
JavaScript to load languages, not yet decided") — since the user now chose Vue/Vite, build-time
bundling is the natural, zero-backend way to "load" the languages.

**Alternatives considered**: Runtime `fetch()` of raw `.md` files from `public/content/` at page
load, parsed client-side — rejected as the primary mechanism: it ships a Markdown parser to every
visitor and adds a loading state for content that never changes between deploys; content only
changes when a contributor's PR is merged and the site is rebuilt anyway. A CMS or database —
explicitly out of scope per FR-010.

## 5. Testing stack

**Decision**: Vitest + `@vue/test-utils` for unit/component tests (the Markdown-parsing utility,
the expand/collapse component, card rendering); Playwright for a small end-to-end smoke suite
covering the P1–P2 acceptance scenarios (default collapsed view, expand reveals the three extra
sections, collapse returns to Hello-World-only, history page renders).

**Rationale**: Idiomatic pairing with Vite (Vitest shares Vite's config/transform pipeline, so no
separate build step for tests); Playwright is the standard modern choice for Vue e2e testing.
Required by Constitution Principle II (Testing Standards, NON-NEGOTIABLE) — every feature needs
automated coverage of its happy path and edge cases before it is done.

**Alternatives considered**: Jest — rejected: needs extra config to work with Vite/ESM, no benefit
over Vitest here. Cypress — a reasonable alternative to Playwright; Playwright chosen for faster
multi-browser support out of the box.

## 6. Routing

**Decision**: `vue-router` in hash mode (`createWebHashHistory`), with routes for `/` (home
language list), `/history` (Hello World history), and `/languages/:slug` (deep link to a single
language, pre-expanded).

**Rationale**: Gives shareable/bookmarkable URLs for a specific language or the history page,
which is nice-to-have UX beyond the minimum spec. Hash mode is chosen specifically because the
site is deployed via plain FTP to a host whose server configuration is not controlled by this
project (FR-012 just names a domain) — history-mode client-side routing needs a server-side
rewrite rule (e.g. Apache `.htaccess`) that cannot be guaranteed on arbitrary shared hosting, while
hash mode works on any static file server with zero server configuration.

**Alternatives considered**: `createWebHistory` (clean URLs) — rejected for now due to the FTP
host's unknown server configuration; can be revisited once the hosting environment is confirmed
and a rewrite rule can be guaranteed.

## 7. Componentization approach

**Decision**: Small, single-responsibility SFCs grouped by role under `src/components/`:
`base/` (generic UI primitives: `BaseButton`, `BaseBadge`, `BaseCard`, `BaseIcon`), `layout/`
(`AppHeader`, `AppFooter`, `NavMenu`), `language/` (`LanguageCard`, `LanguageList`,
`ExpandableSection`, `CodeBlock`, `VariableList`), `history/` (`HistoryArticle`). Shared reactive
logic (loading parsed languages, expand/collapse state) extracted into composables under
`src/composables/` (`useLanguages`, `useExpandable`).

**Rationale**: Directly satisfies the user's requirement 3 ("componentize ao máximo... quanto mais
granular, maior o valor didático") and Constitution Principle I (single, clear responsibility per
unit).

**Alternatives considered**: Fewer, larger "page-level" components — rejected: explicitly against
the user's stated instruction and the project's own didactic goal.

## 8. Folder architecture

**Decision**: Standard Vue 3 + Vite single-project layout (industry-standard for this project
type — a frontend-only static app with no backend service to separate out). See
[plan.md](plan.md) Project Structure for the concrete tree.

**Rationale**: Matches Vite's own scaffold conventions and the official Vue style guide; the
generic "frontend/ + backend/" split template option does not apply here because this feature has
no backend/API component at all (FR-010).

**Alternatives considered**: Monorepo with separate `content/` package — rejected as unnecessary
overhead for a single static site at this scale (5 initial languages).

## 9. CI/CD & FTP deploy

**Decision**: A GitHub Actions workflow (`.github/workflows/deploy.yml`) triggered on every push
to `main`: install dependencies → lint → run unit tests → run e2e smoke tests → `vite build` →
deploy the resulting `dist/` folder via FTP using an established FTP-deploy GitHub Action (e.g.
`SamKirkland/FTP-Deploy-Action`), reading the FTP server address, username, and password from
GitHub Actions encrypted repository secrets (e.g. `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`).
Actual credential values are explicitly **not** part of this plan — the user stated they will be
defined later; the workflow only references the secret names.

**Rationale**: Matches the user's explicit requirement 1 (auto-deploy on push to `main`, via FTP,
credentials TBD). Running lint/tests before deploy enforces Constitution Quality Gates (a failing
test or lint error must block deploy, not just merge).

**Alternatives considered**: GitHub Pages — rejected: the user explicitly requires FTP deploy to
their own hosting at `helloworld.valdir.dev.br`, not GitHub's static hosting.

## 10. Performance budget (Constitution Principle IV)

**Decision**: For this feature: Lighthouse Performance score ≥ 90 (mobile emulation), initial
gzipped JS payload < 150KB, Time to Interactive < 2s on a simulated Fast 4G connection. Measured
via a manual Lighthouse run recorded in `quickstart.md`'s validation steps before each release;
automating this into CI (Lighthouse CI action) is a nice-to-have left for a future task, not a
blocker for this feature's initial delivery.

**Rationale**: Resolves the constitution's TODO(PERFORMANCE_BUDGETS) for this feature specifically
(product-wide budgets remain undefined until more features exist). A static Vue/Vite SPA with 5
small content files comfortably fits this budget by construction — no heavy dependencies are
introduced above (no component library, no runtime Markdown parsing).

**Alternatives considered**: No stated budget — rejected: violates Constitution Principle IV
outright (a user-facing feature MUST state a performance budget before implementation).

## 11. Generalizing the declared-outcome pattern (5 new fixed-outcome examples)

**Decision**: The `- result: <value>` pattern already used for the Calculation section (a
labeled, build-validated declaration rather than something derived from executing the code) is
generalized to five more sections: Loop (`1 2 3 4 5`), Function (`5`), String Concatenation
(`Olá, Mary`), List (`6`), and Boolean Comparison (`true`). Each is parsed and validated exactly
like Calculation is today — same regex-based section/result extraction in
`parseLanguageFile.js`, same "wrong declared value fails the build" behavior. The fixed name used
in the string examples (both String Concatenation and the `string` variable) is `"Mary"`.

**Rationale**: Directly implements spec FR-009–FR-013, added after the user identified that
comparing languages usefully in the future (e.g., measuring textual/structural similarity between
two languages' implementations of the same example) requires every language's examples to use the
exact same values and names — not just the same *kind* of example. Reusing the existing
declared-value mechanism (rather than inventing a new one per example) keeps the parser and
template simple and consistent: nine sections, six of which are "code + declared result," in the
same shape.

**Alternatives considered**: Deriving each example's actual printed output by executing the
snippet in each language's runtime — rejected: the site has no backend or build-time code
execution step (would require installing and invoking five different language toolchains during
a static-site build), and it is unnecessary since the site never claims to execute the code, only
to display it; the declared-value convention already used for Calculation makes this a
non-issue. Requiring boolean examples to print the literal word "true" verbatim in every
language's own output — rejected: booleans print very differently across languages (`True` in
Python, `X`/space in ABAP, etc.); forcing identical raw output would mean adding unidiomatic
formatting code just to satisfy the site's convention, which contradicts showing natural,
idiomatic code. The declared `- result:` label solves this without changing what languages
naturally print.

## Outcome

All Technical Context unknowns are resolved; no `NEEDS CLARIFICATION` markers remain. Proceeding
to Phase 1 design.

**Amendment (2026-09-11)**: §11 was added after initial Phase 1 design to incorporate five new
fixed-outcome examples (spec FR-009–FR-013); Phase 1 artifacts (`data-model.md`, `contracts/`)
have been updated to match. No other Technical Context decisions changed.
