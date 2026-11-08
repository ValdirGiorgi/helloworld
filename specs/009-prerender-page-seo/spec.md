# Feature Specification: Pre-rendered Pages with Per-Page SEO

**Feature Branch**: `009-prerender-page-seo`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Pré-renderização e SEO por página — cada página do site
helloworld.valdir.dev.br deve ser entregue pelo servidor como HTML completo, já com conteúdo,
título, descrição e metadados próprios, sem depender de JavaScript para ser lida por buscadores e
robôs. A experiência interativa atual (busca, expandir cards, troca de idioma) deve continuar igual
para o visitante." (Full description, including context, user stories US1–US5, constraints,
out-of-scope items and measurable criteria, was provided with the `/speckit-specify` command and is
reflected below.)

## Context

An SEO review of the published site found that:

1. Every address returns the same empty page shell (no content, language always declared as
   English). Content only appears after scripts run, so search engines that don't run scripts,
   AI crawlers and link-preview services (WhatsApp, LinkedIn, X) see a blank page, and Google
   indexes with delay.
2. Every page shares the same title and description within a language (duplicate content), so
   language pages don't surface for searches like "hello world em rust".
3. The per-language detail pages (`/{locale}/languages/{slug}`) are listed in the sitemap, but no
   internal link points to them; the sidebar only uses in-page anchors.
4. Any non-existent address answers "200 OK" with the app shell ("soft 404"), including
   `/favicon.ico`, because the site has no favicon.
5. The root address `/` only redirects to a language once scripts run.
6. Link-preview metadata (Open Graph / Twitter Card), structured data and last-modified dates in
   the sitemap are missing.

## Clarifications

### Session 2026-11-07

- Q: What should happen for an address without a valid language prefix other than `/` (e.g.
  `/history`, `/about`, `/languages/rust`)? → A: Answer 404 with an English "not found" page linking
  to the three language home pages; no redirect of any kind (server or script).
- Q: Where should each home card's link to the programming-language page go? → A: A separate,
  translated text link inside the card that includes the language name (e.g. "Ver todos os exemplos
  de Rust" / "See all Rust examples" / "Ver todos los ejemplos de Rust"); the card title stays plain
  text.
- Q: Where should each sitemap address's last-modified date come from? → A: The date of the last
  version-control commit that changed that page's source files (the programming-language content
  file; for fixed pages, their translated texts and page template). The deploy checkout must fetch
  full history so these dates are real.
- Q: What should happen when a page is requested with a trailing slash (e.g.
  `/pt-BR/languages/rust/`)? → A: Permanently redirect (301) to the form without the trailing slash,
  which is the one used in the sitemap and canonical.
- Q: Since the expanded card and the programming-language page show the same examples, should the
  card's "show more" be replaced by the link? → A: No — keep both: "show more" keeps expanding the
  card in place on the home page, and the separate link leads to the programming-language page. The
  overlap is accepted (it is visitor-facing only; collapsed content is not in the home page document,
  so there is no duplicate content for search engines).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A crawler reads the real content of every page (Priority: P1)

A search engine or AI crawler that does not run scripts requests a page of the site — for example
`/pt-BR/languages/rust` — and receives a complete document: declared in the page's language, with
that page's own title and description, the full code examples for that programming language, and
correct language-alternate and canonical references.

**Why this priority**: This is the root cause of most findings. Without real content in the
delivered document, titles, links, previews and structured data have nothing to attach to and most
crawlers see a blank site.

**Independent Test**: Request any page address listed in the sitemap with a client that does not
run scripts and confirm the response contains the page's visible content, the correct document
language and the page's own title.

**Acceptance Scenarios**:

1. **Given** the published site, **When** a client that does not run scripts requests
   `/pt-BR/languages/rust`, **Then** the response declares the document language as `pt-BR`,
   carries the title "Hello World em Rust — exemplos de código", and contains all 9 example
   sections with their code (including `println!("Hello, World!")`).
2. **Given** the 3 supported site languages and the current pages (home, history, about, plus one
   page per programming language), **When** the site is built, **Then** there is exactly one
   ready-to-serve document per language × page combination — today 3 × (3 + 10) = 39 documents.
3. **Given** a contributor adds a new programming-language content file, **When** the site is
   built, **Then** that language's page exists in all 3 site languages, appears in the sitemap and
   carries correct alternates, with no other configuration change.
4. **Given** any page document, **When** it is read without scripts, **Then** its declared document
   language matches the language segment of its address.
5. **Given** a visitor with scripts enabled opens any page, **When** the page finishes loading,
   **Then** search, card expand/collapse, language switching and in-app navigation behave exactly as
   today, and in-app navigation does not reload the full page.

---

### User Story 2 - Each page has its own title and description (Priority: P1)

Each page presents a title and description that describe that specific page in its own language,
so search results and browser tabs distinguish the pages and language pages match searches such as
"hello world em rust".

**Why this priority**: Duplicate titles/descriptions across the whole site are a direct ranking and
click-through problem, and per-page titles are what make language pages findable.

**Independent Test**: Collect the title of every address in the sitemap and confirm they are all
distinct and follow the expected patterns; confirm canonical and alternate references point to the
page's own absolute address.

**Acceptance Scenarios**:

1. **Given** a programming-language page, **When** its title is read, **Then** it follows the
   pattern for its site language, changing only the programming-language name:
   - pt-BR: "Hello World em {Linguagem} — exemplos de código"
   - en: "Hello World in {Language} — code examples"
   - es: "Hello World en {Lenguaje} — ejemplos de código"
2. **Given** the home, history and about pages, **When** their titles and descriptions are read in
   each language, **Then** the three pages have titles and descriptions distinct from each other.
3. **Given** every address listed in the sitemap, **When** their titles are compared, **Then** no two
   addresses share the same title.
4. **Given** any page document, **When** its canonical and language-alternate references are read
   without scripts, **Then** the canonical points to the page's own absolute address on
   `https://helloworld.valdir.dev.br`, and alternates exist for `pt-BR`, `en`, `es` and
   `x-default` (pointing to the `en` version), each pointing to the matching absolute address of
   the same page.

---

### User Story 3 - Language pages receive internal links (Priority: P2)

A visitor or crawler on the home page can follow a real link from each programming-language card to
that language's dedicated page, and from that page back to the home page in the same site language.

**Why this priority**: Pages without internal links are treated as low-importance (or orphaned) by
search engines even when listed in the sitemap. It builds on US1/US2 (the pages must have real
content and titles for the links to pay off).

**Independent Test**: Read the home page without scripts and confirm each language card contains a
followable link to `/{locale}/languages/{slug}`; open a language page and confirm a link back to
`/{locale}`.

**Acceptance Scenarios**:

1. **Given** the home page in any site language, **When** it is read without scripts, **Then** each
   programming-language card contains a followable text link to `/{locale}/languages/{slug}` in that
   same site language, whose text includes the language name (e.g. "See all Rust examples").
2. **Given** a programming-language page, **When** it is read, **Then** it contains a followable link
   back to the home page of the same site language.
3. **Given** a visitor on the home page, **When** they expand or collapse a language card, **Then** it
   behaves as today; following the new link is a separate, explicit action that does not interfere
   with expand/collapse.

---

### User Story 4 - Rich link previews and structured data (Priority: P2)

When someone shares a page of the site on WhatsApp, LinkedIn, X or similar, the preview shows that
page's title, description and a share image. Search engines receive structured data describing the
site and each programming-language page.

**Why this priority**: Improves how the site looks when shared and its eligibility for richer search
results, but depends on US1 (metadata must be present in the delivered document).

**Independent Test**: Run any page address through a link-preview validator and a structured-data
validator; confirm the preview shows the page's own title/description/image and that there are no
errors. Request `/favicon.ico` and confirm an actual icon is returned.

**Acceptance Scenarios**:

1. **Given** any page, **When** its preview metadata is read, **Then** it declares the page title,
   description, absolute address, locale and content type, plus a large-image card, all consistent
   with the page's own title and description.
2. **Given** any page, **When** its preview metadata is read, **Then** it references a default share
   image that is reachable at an absolute address.
3. **Given** the home page in any language, **When** its structured data is read, **Then** it
   describes the website.
4. **Given** a programming-language page, **When** its structured data is read, **Then** it describes
   a technical article with the page's name, language and address.
5. **Given** the published site, **When** a browser or crawler requests the site icon, **Then** a real
   icon is returned (not an HTML page).

---

### User Story 5 - Non-existent addresses and the root address (Priority: P3)

A visitor or crawler requesting an address that does not exist gets a real "not found" answer in the
address's language, with a way back home. The root address works for crawlers that do not run
scripts, while still sending visitors to their language as today. The sitemap tells crawlers when
each page last changed.

**Why this priority**: Removes soft-404 noise from search consoles and closes the remaining crawler
gaps; lower impact than the content and title problems.

**Independent Test**: Request `/pt-BR/nao-existe` and `/pt-BR/languages/xyz` and confirm a "not
found" status with a Portuguese page linking to `/pt-BR`; request `/` without scripts and confirm
links to the three languages are visible; read the sitemap and confirm every entry has a last-modified
date.

**Acceptance Scenarios**:

1. **Given** an address under a valid language that matches no page (e.g. `/pt-BR/nao-existe` or
   `/pt-BR/languages/xyz`), **When** it is requested, **Then** the response has a "not found" (404)
   status and shows a "not found" page in that language with a link to that language's home page.
   Under the FR-022 hosting exception it shows the English "not found" page with links to the
   three home pages instead; the 404 status is the same.
2. **Given** a visitor with scripts enabled, **When** they open `/`, **Then** they are redirected to a
   language exactly as today (stored manual preference first, otherwise the existing country-based
   rule).
3. **Given** a client that does not run scripts, **When** it requests `/`, **Then** it receives a page
   with visible links to the home page of each of the 3 site languages.
4. **Given** the sitemap, **When** it is read, **Then** every listed address carries a last-modified
   date.

---

### Edge Cases

- **Address without trailing slash vs. with trailing slash**: the address exactly as listed in the
  sitemap and canonical (no trailing slash, e.g. `/pt-BR/languages/rust`) must answer 200 directly,
  without a redirect hop; the trailing-slash variant (`/pt-BR/languages/rust/`, `/pt-BR/`) answers a
  permanent redirect (301) to the form without the slash. The root `/` is the only address that keeps
  its slash.
- **Address without a valid language prefix** (e.g. `/history`, `/fr/about`, `/pt-br/`): `/` keeps its
  redirect behavior; any other address without a valid language prefix answers 404 with a "not found"
  page in English (the x-default language) offering links to the three language home pages — even
  when the rest of the address matches an existing page (`/history` is 404, not redirected to
  `/en/history`), and the "not found" page does not redirect the visitor by script either.
- **Unknown programming-language slug** under a valid language (`/es/languages/cobol`): 404 in
  Spanish, never an empty language page with status 200.
- **Existing static files** (`/robots.txt`, `/sitemap.xml`, `/llms.txt`, scripts, styles, images, the
  icon, the share image) keep being served as files and are never replaced by the "not found" page or
  the app shell.
- **Missing static asset** (e.g. a stale hashed script name or `/favicon.png` that doesn't exist):
  answers 404, not the app shell with 200.
- **Visitor arrives on a language page and then uses search, language switching or in-app
  navigation**: behaves as an ordinary app session; switching language lands on the same page in the
  other language.
- **Hydration mismatch**: the content a visitor sees on first paint must be the same content the
  interactive app shows once loaded — no visible flash, content jump or change of language.
- **Programming-language name in titles**: the same display name is used in all three site
  languages (e.g. "Rust", "TypeScript", "Assembly").
- **Content file removed**: removing a programming-language content file removes its pages from the
  build, the sitemap and the alternates in the same build; its old addresses then answer 404.
- **"Not found" page indexing**: "not found" pages and the root language-chooser page are not listed
  in the sitemap and ask search engines not to index them.

## Requirements *(mandatory)*

### Functional Requirements

**Pre-rendered pages (US1)**

- **FR-001**: The build MUST produce one complete, ready-to-serve document for every combination of
  supported site language (pt-BR, en, es) × page (home, history, about, and one page per
  programming-language content file).
- **FR-002**: The list of pages to produce MUST be derived automatically from the supported site
  languages and the programming-language content files; adding or removing a content file MUST add or
  remove its pages in all site languages with no other configuration change.
- **FR-003**: Each produced document MUST contain, without running scripts, the page's visible
  content as a visitor would see it; for programming-language pages this includes all example
  sections with their code.
- **FR-004**: Each produced document MUST declare a document language equal to the language segment
  of its address.
- **FR-005**: After loading, each page MUST become the same interactive app visitors use today:
  search, card expand/collapse, language switching and in-app navigation keep their current
  behavior, and in-app navigation MUST NOT trigger a full page reload.
- **FR-006**: The content shown before and after the app becomes interactive MUST match (no visible
  replacement of content, no language change, no layout jump caused by the transition).
- **FR-007**: The address of each page as listed in the sitemap and canonical MUST answer 200
  directly, without a redirect. The same address with a trailing slash MUST answer a permanent
  redirect (301) to the form without the slash (the root `/` excepted).

**Per-page title, description, canonical and alternates (US2)**

- **FR-008**: Each programming-language page MUST have a title following the per-language pattern in
  US2 scenario 1, and a description specific to that programming language in that site language.
- **FR-009**: Home, history and about MUST each have a title and description distinct from each other
  in every site language.
- **FR-010**: No two addresses in the sitemap MAY share the same title.
- **FR-011**: Each produced document MUST include, without running scripts, a canonical reference to
  its own absolute address on `https://helloworld.valdir.dev.br` and language-alternate references
  for `pt-BR`, `en`, `es` and `x-default` (→ `en`) pointing to the absolute addresses of the same
  page in each language. These values MUST NOT depend on the address the document happened to be
  requested from.
- **FR-012**: When a visitor navigates inside the app, the title, description, canonical, alternates
  and document language MUST update to match the page now shown.
- **FR-013**: The sitemap, the language-alternate references and the list of produced pages MUST come
  from a single source of page data, so they cannot diverge.

**Internal links (US3)**

- **FR-014**: Each programming-language card on the home page MUST contain a separate, followable
  text link to that language's page in the same site language, present without running scripts and
  visible whether the card is expanded or collapsed. The link text MUST be translated in each site
  language and include the programming-language name (pt-BR "Ver todos os exemplos de {Linguagem}",
  en "See all {Language} examples", es "Ver todos los ejemplos de {Lenguaje}"). The card title
  remains plain text, not a link.
- **FR-015**: Each programming-language page MUST contain a followable link to the home page of the
  same site language.
- **FR-016**: Card expand/collapse on the home page MUST keep working as today; activating the new link
  MUST navigate to the page and MUST NOT toggle the card, and toggling the card MUST NOT navigate.

**Link previews, structured data and icon (US4)**

- **FR-017**: Each page MUST declare preview metadata — title, description, absolute address, locale,
  content type and large-image card type — consistent with its own title and description.
- **FR-018**: The site MUST provide one default share image, referenced by absolute address from every
  page's preview metadata.
- **FR-019**: The home page in each language MUST carry structured data describing the website; each
  programming-language page MUST carry structured data describing a technical article with its name,
  language and address. Structured data MUST validate without errors.
- **FR-020**: The site MUST serve a real site icon at `/favicon.ico` and declare it from every page.

**Not found, root address and sitemap dates (US5)**

- **FR-021**: Any address that matches no page and no existing file MUST answer with status 404.
- **FR-022**: The 404 response MUST show a "not found" page in the language of the address's language
  segment (English when there is no valid language segment), with a link to the corresponding home
  page. Hosting exception: if the web server does not allow per-path error pages (see Assumptions),
  every 404 response MAY show the English "not found" page with links to the three home pages. The
  404 status (FR-021) is never relaxed.
- **FR-023**: Existing files MUST keep priority over any fallback; the server configuration MAY change
  only as needed to serve real 404 responses, to serve each page at its address without a trailing
  slash, and to redirect the trailing-slash form (FR-007).
- **FR-024**: The root address `/` MUST have its own document that, with scripts enabled, redirects to
  a language using the current rule (stored manual preference first, otherwise the country-based
  rule), and that, without scripts, shows visible links to the home page of each of the 3 languages.
- **FR-025**: Every address in the sitemap MUST carry a last-modified date equal to the date of the
  last version-control commit that changed that page's source files (programming-language pages:
  their content file; home/history/about: their translated texts and page template). All three
  site-language versions of the same page MAY share that date. The build date is used only when no
  commit date can be found (e.g. a file not yet committed in a local build).
- **FR-026**: "Not found" pages and the root language-chooser page MUST NOT be listed in the sitemap
  and MUST ask search engines not to index them.

**Hosting, pipeline and quality constraints**

- **FR-027**: The published output MUST remain a folder of static files served by the existing web
  server: no backend service, no server-side runtime and no database in production.
- **FR-028**: The deploy pipeline MUST keep its stages and order (lint → unit tests → end-to-end tests
  → build → upload); only the build step's command MAY change, plus the source checkout fetching full
  version-control history (needed by FR-025), and lint and tests MUST keep blocking deploy on
  failure.
- **FR-029**: An automated test MUST verify that the build produced exactly one document per sitemap
  address, plus the root document and the "not found" page(s), and that no two sitemap addresses
  share a title.
- **FR-030**: Producing page metadata at build time MUST NOT rely on browser-only facilities (such as
  the live document or the current browser address).
- **FR-031**: Existing unit and end-to-end tests MUST keep passing, changed only where behavior changes
  on purpose (e.g. soft-404 → 404, new links on cards).

### Key Entities *(include if feature involves data)*

- **Site language**: one of the supported languages (pt-BR, en, es); has a code used in addresses, a
  locale for previews, and translated page texts. `en` is the default (x-default).
- **Page**: a page type (home, history, about, programming-language detail, not found, root chooser)
  in a given site language; has an absolute address, title, description, preview metadata, optional
  structured data, alternates, and whether it is listed/indexable.
- **Programming language**: derived from one content file; has a slug (used in addresses), a display
  name (used in titles), its example sections, and a last-modified date.
- **Page catalog**: the single list of indexable pages (site language × page) from which the produced
  documents, the sitemap and the alternates are all generated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A client that does not run scripts requesting
  `https://helloworld.valdir.dev.br/pt-BR/languages/rust` receives a document that declares language
  `pt-BR`, has the title "Hello World em Rust — exemplos de código" and contains
  `println!("Hello, World!")`.
- **SC-002**: 100% of sitemap addresses (39 today) return their full visible content and their own
  title to a client that does not run scripts.
- **SC-003**: The build yields exactly one document per sitemap address, plus the root and "not found"
  documents, and an automated check confirms it on every build.
- **SC-004**: 0 sitemap addresses share a title with another.
- **SC-005**: Requesting `https://helloworld.valdir.dev.br/pt-BR/nao-existe` returns status 404, and
  `/favicon.ico` returns an image.
- **SC-006**: Each of the 30 programming-language pages (today) is reachable from its home page in
  one click via a followable link.
- **SC-007**: A structured-data validator and a link-preview validator report 0 errors on the
  programming-language pages.
- **SC-008**: Adding one programming-language content file results in 3 new pages, 3 new sitemap
  entries and correct alternates after one build, with no other file changed.
- **SC-009**: All existing unit and end-to-end tests pass (adjusted only for intended behavior
  changes), and the site's mobile and desktop page-speed scores are not lower than before the change.

## Assumptions

- The technical approach suggested by the owner (build-time pre-rendering of the page list generated
  from site languages × content files, with a framework migration as a fallback) is to be confirmed
  in the planning phase; this spec does not depend on that choice.
- Programming-language display names are the same in all three site languages.
- Descriptions for programming-language pages follow a per-language template that includes the
  programming-language name (e.g. "Exemplos de Hello World em Rust: …"); exact wording is decided in
  planning/implementation and is not a change to the examples' content.
- The home page is pre-rendered as a first-time visitor sees it today: every card collapsed, showing
  only its Hello World example; the full set of examples per language lives on the
  programming-language pages, which avoids duplicating that content on the home page.
- The default share image uses the common large-preview format (1200 × 630) and is the same for all
  pages; per-page images are out of scope.
- Addresses without a valid language prefix (other than `/`) stop being redirected client-side and
  answer 404 in English with links to the three languages (confirmed in Clarifications); this is an
  intended behavior change that replaces the earlier "address with no language resolves to a
  language" rule for every address except `/`.
- Address casing is significant (`/pt-br/` is not `/pt-BR/`) as today.
- The existing visual design is kept; the new card link and back link reuse existing styles and are
  keyboard-accessible.
- Registering the site in search-engine webmaster consoles, analytics, CDN (Cloudflare)
  configuration, adding new site languages and changing the examples' content are out of scope.
- The CDN in front of the server forwards the server's status codes (including 404) unchanged.
- Serving a different "not found" page per address language depends on the hosting allowing
  per-path error pages in the site's server configuration. If the host does not allow it (to be
  confirmed before the first deploy of User Story 5), the owner accepts a single English "not found"
  page for every 404, with links to the three home pages. Status codes and every other requirement
  stay unchanged (FR-022 exception).
