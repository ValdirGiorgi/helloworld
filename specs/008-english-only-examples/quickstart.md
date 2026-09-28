# Quickstart: Validating English-Only Code Examples

## Prerequisites

- Dependencies installed: `npm install`. No other setup — this feature edits Markdown content, one
  parser constant, two locale files, docs, and tests.

## 1. No Portuguese remains in examples (User Story 1 / FR-001 – FR-006, SC-001)

```bash
grep -rnE "Olá|Maior que|Menor ou igual|somar|idade" content/
```

Expected: no output. Then for each of the eight files in `content/languages/` confirm the four
examples match the per-language table in
[contracts/example-content-contract.md](./contracts/example-content-contract.md) and that the
`- result:` lines other than String Concatenation are unchanged
(`git diff --stat content/languages/` should show small, symmetrical edits).

## 2. The site accepts the new contract (User Story 2 / FR-007 – FR-009, SC-002, SC-006)

```bash
npx vitest run tests/unit/parseLanguageFile.spec.js tests/unit/languageContent.spec.js
```

Expected: pass. Then negative check — temporarily change one file's outcome back to `Olá, Mary`:
the unit test fails naming that file and the expected `Hello, Mary`; revert the edit.

```bash
npm run dev
```

Open `/en`, `/es`, and `/pt-BR`: expand any language and confirm the String Concatenation outcome
reads `Hello, Mary`, and that the labels above the Function, String Concatenation, and Boolean
examples quote `add(2, 3)`, `"Hello, " + name`, `age >= 18` in every interface language.

## 3. The rule is documented (User Story 3 / FR-010 – FR-014, SC-003, SC-005)

1. `CONTRIBUTING.md`: fixed values in "Step by step", new "The English-only rule" section, and
   `Hello, Mary` — compare against
   [contracts/documentation-contract.md](./contracts/documentation-contract.md) §1.
2. `content/language-template.md`: rule paragraph, per-section comments, `Hello, Mary` placeholder
   (§2).
3. `README.md`: one-sentence rule with link (§3).
4. Hand `CONTRIBUTING.md` and the template to someone unfamiliar with the project and ask them to
   write the four affected examples for a new language; they should match the fixed values first
   time (SC-003).

## 4. All eight languages are listed (User Story 4 / FR-013, SC-004)

```bash
grep -rnE "Java, Python, Dart, ABAP,? (and )?PHP" README.md public/llms.txt tests
```

Expected: no line that stops at PHP; each occurrence now continues with TypeScript, Rust, and Go
(or the file uses an eight-entry list). Also confirm the four test files that enumerate languages
list all eight (`browse-and-expand`, `sidebar-navigation`, `search-language`,
`generateSitemap.spec.js`).

## Automated checks

```bash
npm run lint
npx prettier --check .
npx vitest run
npx playwright test
npm run build
```

All MUST pass. After `npm run build`, `public/sitemap.xml` contains 8 languages × 3 locales = 24
language-detail URLs (`grep -c "<loc>.*/languages/" public/sitemap.xml` → `24`).

## Known unverifiable point

The ABAP `FORM add` name (research.md §3) cannot be compiled here; a reviewer with an ABAP system
should confirm it, and the deviation (if any) is documented in the example contract only.
