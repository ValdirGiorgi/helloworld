# Feature Specification: Sitemap for Search Engine Discovery

**Feature Branch**: `007-sitemap-xml`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "sitemap.xml use a melhores praticas para maiarmos as paginas analise" (create a sitemap.xml following best practices to map/list the site's pages; analyze what's needed)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search engines discover every page of the site (Priority: P1)

As a search engine crawler (Google, Bing, etc.), when I visit the site, I need a single, authoritative
list of every publicly reachable page — in every language the site offers — so I can index the full
site efficiently instead of relying only on following links.

**Why this priority**: This is the core value of the feature. Without it, crawlers must discover pages
purely by following internal links, which is slower and can miss pages, directly hurting the site's
search visibility — the exact class of problem this project has already been fixing (per-language
routing, `robots.txt`, `llms.txt`).

**Independent Test**: Request the sitemap file directly and confirm it lists a valid, complete set of
page addresses, each one reachable and returning real page content.

**Acceptance Scenarios**:

1. **Given** the published site, **When** a crawler requests the sitemap file, **Then** it receives a
   well-formed file listing every publicly reachable page address on the site.
2. **Given** the sitemap file, **When** each listed address is requested, **Then** it returns a real
   page (HTTP 200), not an error or a redirect loop.
3. **Given** a page that exists in all three site languages (Portuguese, English, Spanish), **When**
   the sitemap lists that page, **Then** all three language versions are listed, and each one tells
   crawlers about its other-language equivalents (so search results in each language point to the
   matching translated page rather than the wrong-language version).

---

### User Story 2 - Search engines learn where the sitemap is without being told out-of-band (Priority: P2)

As a search engine crawler, when I read the site's crawling rules, I want to be pointed straight at the
sitemap file so I don't have to be told about it separately (e.g., only via manual submission in a
webmaster console).

**Why this priority**: This closes the discovery loop opened by User Story 1 — a sitemap that nothing
points to is only found if a crawler happens to already know its address or if the site owner manually
submits it. Referencing it from the crawling-rules file makes discovery automatic for every crawler that
respects that file, which this site already publishes.

**Independent Test**: Request the site's crawling-rules file directly and confirm it references the
sitemap's address; then request that address and confirm it resolves to the sitemap content from User
Story 1.

**Acceptance Scenarios**:

1. **Given** the site's crawling-rules file, **When** a crawler reads it, **Then** it finds a
   reference to the sitemap's exact, full address.

---

### Edge Cases

- A page that only exists in one language must not be listed under the other languages' addresses.
- If a new language or a new page is added to the site later, the sitemap must reflect it without
  manual, per-entry editing (i.e., the list must be generated from the same source of truth the site
  itself uses for its pages, not hand-maintained).
- The sitemap itself must not appear as one of its own listed pages.
- Addresses must match exactly what the site actually serves (no trailing-slash mismatches, no
  `http`/`https` or `www`/non-`www` inconsistencies) so crawlers don't treat the sitemap entry and the
  real page as different addresses.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST publish a single sitemap file at a fixed, well-known address that lists
  every publicly reachable page.
- **FR-002**: The sitemap MUST include, for every page that exists in more than one language, an
  indication of that page's equivalent address in each of the site's other languages, so crawlers can
  serve the correct language version in search results.
- **FR-003**: The sitemap MUST list only real, currently reachable pages — no removed pages, no
  internal/non-public addresses, and no duplicate entries for the same effective page.
- **FR-004**: The sitemap MUST be regenerated automatically whenever the site's set of pages changes
  (e.g., a new language example is added), so it never has to be hand-edited to stay accurate.
- **FR-005**: The site's crawling-rules file MUST reference the sitemap's full, exact address so
  crawlers can find it without manual submission.
- **FR-006**: The sitemap MUST follow the standard, widely-supported sitemap format so that any
  compliant crawler (not just one specific search engine) can parse it correctly.
- **FR-007**: Every address listed in the sitemap MUST resolve directly to real page content (HTTP
  200), not to an error, a redirect, or the wrong page.

### Key Entities

- **Sitemap**: The single published file listing the site's pages for crawlers. Attributes: its own
  address, the list of page entries it contains, last-generated time.
- **Sitemap Entry**: One listed page. Attributes: the page's full address, its language, and the
  addresses of that same page's equivalents in the site's other languages (when they exist).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the site's publicly reachable pages, across all three supported languages,
  appear in the sitemap.
- **SC-002**: 100% of addresses listed in the sitemap return real page content when requested directly
  (no errors, no redirects).
- **SC-003**: A subsequent search-engine technical audit of the site (the same class of report already
  used to validate this project's `robots.txt`/`llms.txt` work) shows no sitemap-related error or
  warning.
- **SC-004**: Adding a new page to the site (e.g., a sixth reference language) requires zero manual
  edits to the sitemap for that page to appear in it.

## Assumptions

- The site's three supported languages (Portuguese, English, Spanish) and its existing page types
  (home, history, about, and one detail page per reference language) are the full current page set to
  include; any future page type is covered automatically per FR-004 without a spec change.
- "Best practices" (from the user's request) means: the standard sitemap XML format, one entry per
  page with its cross-language alternates declared, no stale or unreachable entries, and a reference
  to the sitemap from the site's crawling-rules file — matching the same discovery mechanism already
  established for `robots.txt` and `llms.txt` in this project.
- The sitemap does not need to declare per-page priority or update-frequency hints — major search
  engines already disregard those fields, so omitting them keeps the file simpler without any loss of
  practical benefit.
- The sitemap's own address is a single fixed, well-known path at the site's root, consistent with
  where `robots.txt` and `llms.txt` already live.
