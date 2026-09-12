# Phase 0 Research: PageSpeed Report Fixes

No items in the Technical Context were marked `NEEDS CLARIFICATION` — the report was read directly
(spec.md Findings) before writing the spec, so the root cause and fix were already established.
The research below documents the concrete decisions for the two files' content.

## 1. Why adding the files (not changing the rewrite rule) is the correct fix

**Decision**: Add real `public/robots.txt` and `public/llms.txt` files. Do not modify
`public/.htaccess`'s SPA-fallback rule.

**Rationale**: The `.htaccess` rule (`003-i18n-language-detection`'s amendment) is working exactly
as designed — it serves `index.html` for any request that doesn't match a real file or directory,
which is the correct, standard behavior a single-page application needs for its actual routes
(`/en/history`, `/pt-BR/about`, etc.). `/robots.txt` and `/llms.txt` falling through to it isn't a
bug in the rule; it's the expected fallback firing because those two files simply don't exist yet.
Once they exist as real files under `public/`, Apache (and Vite's dev server, which serves
`public/` the same way) will serve them directly and never reach the fallback rule for those two
specific requests — no rewrite-rule change is needed or appropriate.

**Alternatives considered**:
- *Add an explicit rewrite exception for `robots.txt`/`llms.txt`*: rejected — unnecessary
  complexity; Apache's rewrite conditions in `public/.htaccess` (`RewriteCond %{REQUEST_FILENAME}
  !-f`) already skip the fallback for any request that resolves to a real file, which adding the
  two files achieves for free.

## 2. `llms.txt` cannot import `siteLinks.js` — literal URLs are an accepted exception

**Decision**: `public/llms.txt`'s links are written as plain, literal URLs, not sourced from
`src/siteLinks.js` (the shared-constant module `005-about-page` introduced for exactly this kind of
duplication concern).

**Rationale**: `llms.txt` is a static text file copied byte-for-byte from `public/` to `dist/` by
Vite — it is never processed as JavaScript and cannot `import` anything. This is a hard technical
constraint, not a preference, so the single-source-of-truth precedent from `005-about-page`
research.md §2 cannot be mechanically extended here. Documented explicitly so a future reader
doesn't mistake this for an overlooked duplication — if the project's repository URL ever changes,
both `src/siteLinks.js` and `public/llms.txt` need updating by hand.

**Alternatives considered**:
- *Generate `llms.txt` at build time from `siteLinks.js` (e.g., a small Vite plugin or prebuild
  script)*: rejected as over-engineering for two files' worth of URLs that change extremely rarely
  (the project's own repository address, chosen once); would add a build-step dependency and
  maintenance surface for a problem that a one-line comment in the file itself already mitigates
  (research.md's own cross-reference, plus a comment inside `llms.txt` pointing back to
  `siteLinks.js` as the other place the repository URL lives).

## 3. `robots.txt` content: allow everything, no sitemap directive

**Decision**: `public/robots.txt` contains only:
```
User-agent: *
Allow: /
```

**Rationale**: Spec.md FR-002/Assumptions establish there is no private content to exclude, so a
blanket allow is both correct and the simplest valid file — exactly what the failing audit needs
(a syntactically valid `robots.txt`, not a complex one). No `Sitemap:` directive is included because
the project has no `sitemap.xml` today and generating one is not something the spec asked for or
found failing in the report — adding an unrelated feature here would be scope creep.

**Alternatives considered**:
- *Add a `Sitemap:` directive pointing at a not-yet-existing `sitemap.xml`*: rejected — would
  itself be invalid (pointing at a 404, likely triggering the SPA fallback again for the
  Sitemap request) and is out of this feature's verified scope.

## 4. `llms.txt` content: follows llmstxt.org's structure, summarizes the project, links to key pages

**Decision**: `public/llms.txt` has: an H1 with the project's name, a short blockquote summary, and
one or more `##` sections containing Markdown links — to the Home, About, and History pages (in
English, per spec.md Assumptions) and to the project's GitHub repository (research.md §2's literal
URL). This directly addresses the two specific errors the report found (`ref_1565`/`ref_1566` in
the read report: missing required H1 heading, and the file "doesn't appear to contain links").

**Rationale**: This matches the emerging `llms.txt` convention (llmstxt.org) precisely enough to
satisfy Lighthouse's structural check (H1 + links present), and reuses content already established
elsewhere (the About page's own description of the project, from `005-about-page`) rather than
inventing a new, separately-maintained description.

**Alternatives considered**:
- *A minimal file with just an H1 and one link*: rejected as technically sufficient but a missed
  opportunity — since this project's whole purpose is demonstrating AI-assisted, spec-driven
  development (`005-about-page`'s own content), a slightly fuller summary better serves the file's
  actual purpose (helping an AI agent understand the site) without meaningfully increasing
  maintenance burden (a handful of static lines).

## Outcome

No new dependency, no application code change. Two small static files with content fully
determined by the two verified report findings. Proceeding to Phase 1 design.
