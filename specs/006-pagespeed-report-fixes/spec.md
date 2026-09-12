# Feature Specification: PageSpeed Report Fixes

**Feature Branch**: `006-pagespeed-report-fixes`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Analisar o relatório do Google PageSpeed Insights para
https://helloworld.valdir.dev.br e corrigir os erros encontrados."

## Findings from the report

The live site's PageSpeed Insights report (desktop) was reviewed directly. Scores: Performance 99,
Accessibility 100, Best Practices 100, SEO 92, Agentic browsing 2/3. Only two audits are actually
failing, and both share the same underlying cause:

1. **SEO — "robots.txt is not valid" (17 syntax errors)**: the site has no real `robots.txt` file,
   so a request for one falls through to the site's own single-page-application content instead,
   which the auditor then tries (and fails) to parse as robots directives.
2. **Agentic browsing — "The llms.txt file doesn't follow best practices"**: the site has no real
   `llms.txt` file either, so the same thing happens — the auditor gets the site's own page content
   back instead of a real `llms.txt`, and finds it's missing the required heading and links that
   file format expects.

Every other audited item in both categories already passes (page title, meta description,
successful HTTP status, descriptive/crawlable links, valid `hreflang`, valid canonical link, "not
blocked from indexing", well-structured accessibility tree) — this feature's scope is exactly these
two missing files.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search engines can read the site's crawling directives (Priority: P1)

A search engine (or any automated crawler) requesting the site's `robots.txt` address receives an
actual, valid robots-directives file instead of the site's own page content, so it can correctly
understand which parts of the site it's allowed to crawl.

**Why this priority**: This is a currently-failing, externally-visible audit item directly
lowering the site's SEO score; fixing it is the most direct, unambiguous item in the report.

**Independent Test**: Can be fully tested by requesting the site's `robots.txt` address directly
and confirming it returns valid robots-directive content (not the site's own HTML), and that
re-running the PageSpeed report's SEO check on it no longer reports invalid-`robots.txt` errors.

**Acceptance Scenarios**:

1. **Given** the deployed site, **When** its `robots.txt` address is requested, **Then** the
   response is a real, valid robots-directives file, not the site's own page content.
2. **Given** that valid file, **When** it's evaluated the way PageSpeed Insights' SEO audit
   evaluates it, **Then** it reports zero syntax/validity errors.

---

### User Story 2 - AI agents can read a standard summary of the site (Priority: P1)

An AI agent or tool that looks for a site's `llms.txt` file (a page meant to help language models
understand a site's purpose and structure) receives an actual file following that format's basic
expectations, instead of the site's own page content.

**Why this priority**: Equally a currently-failing, externally-visible audit item (lowering the
"agentic browsing" score), and it is thematically central to this project's own stated purpose —
this site exists as a demonstration of AI-assisted, spec-driven development, so giving AI agents a
well-formed entry point into it is a natural extension of that purpose, not just a score fix.

**Independent Test**: Can be fully tested by requesting the site's `llms.txt` address directly and
confirming it returns a file with the required heading and links (not the site's own HTML), and
that re-running the report's agentic-browsing check on it no longer reports the "doesn't follow
best practices" finding.

**Acceptance Scenarios**:

1. **Given** the deployed site, **When** its `llms.txt` address is requested, **Then** the response
   is a real file with a top-level heading and at least one link, not the site's own page content.
2. **Given** that file, **When** it's evaluated the way the report's agentic-browsing audit
   evaluates it, **Then** it no longer reports the file as failing to follow the format's
   recommendations.

---

### Edge Cases

- What happens to every other already-passing audit item in the SEO and agentic-browsing
  categories? (Unaffected — this feature only adds the two missing files; it does not change
  anything already working, such as the page title, meta description, `hreflang`, or canonical
  link.)
- What happens for languages/locales other than the one requested? (Both files are
  locale-independent — a crawler or agent requests one `robots.txt` and one `llms.txt` per site,
  not per language, so neither file needs per-locale variants.)
- What happens if a future page is added to the site? (Whoever adds it MUST consider whether it
  should be reflected in `llms.txt`'s list of links — this expectation is called out so it isn't
  silently forgotten, but keeping the two files exhaustively up to date on every future change is
  not itself measured by this feature's success criteria.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST serve a real, valid `robots.txt` file at its conventional address,
  rather than falling back to the site's own page content for that request.
- **FR-002**: The `robots.txt` file's directives MUST allow search engines to crawl the site's
  public content (this site has no visitor accounts, private areas, or content that should be kept
  out of search results).
- **FR-003**: The site MUST serve a real `llms.txt` file at its conventional address, rather than
  falling back to the site's own page content for that request.
- **FR-004**: The `llms.txt` file MUST include a top-level heading naming the project and at least
  one link, per that file format's basic structural expectations.
- **FR-005**: The `llms.txt` file's content MUST summarize what this site is and, at minimum, link
  to its home page, its About page, and its History page.
- **FR-006**: Neither new file may change or interfere with any currently-passing audit item in the
  SEO or agentic-browsing categories (spec Edge Cases).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A fresh PageSpeed Insights report for the deployed site no longer lists an invalid
  `robots.txt` finding.
- **SC-002**: A fresh PageSpeed Insights report for the deployed site no longer lists the
  `llms.txt`-doesn't-follow-best-practices finding.
- **SC-003**: The site's SEO score and agentic-browsing score both reach their maximum after this
  feature ships, with no other audited item in either category regressing.
- **SC-004**: Requesting the site's `robots.txt` and `llms.txt` addresses directly returns their
  own real content, distinguishable from the site's own pages, 100% of the time.

## Assumptions

- The site currently has no content that needs to be excluded from search engines (no visitor
  accounts, admin areas, or non-public pages exist anywhere on this static, backend-free site) —
  `robots.txt` therefore allows crawling everything, per FR-002.
- "The site's conventional address" for both files means the site's own root address (e.g., the
  address a crawler or agent would try by default for a site's `robots.txt`/`llms.txt`), consistent
  with how every browser and crawler already looks for these files.
- Both files are static content, unrelated to the site's three interface languages (pt-BR/en/es)
  from `003-i18n-language-detection` — they are written once, in English, since `robots.txt` is a
  directives format with no natural-language content to translate, and `llms.txt`'s primary
  audience (automated agents/crawlers) does not need a localized version any more than
  `robots.txt` does.
- This feature's scope is limited to the two specific findings verified in the report above; it
  does not include a broader SEO or "agentic readiness" audit beyond what was actually found
  failing.
