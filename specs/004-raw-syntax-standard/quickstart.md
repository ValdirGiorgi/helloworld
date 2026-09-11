# Quickstart: Raw-Syntax Contribution Standard

## Prerequisites

- No new dependencies or setup — this feature only edits Markdown documentation and three existing
  content files.

## Validate: the rule is documented (User Story 1 / FR-001-FR-004, SC-002)

1. Open `CONTRIBUTING.md` and confirm it is entirely in English.
2. Confirm it explicitly states the raw-syntax rule (contracts/documentation-contract.md item 1)
   and both exemptions (item 2).
3. Confirm it includes a worked raw-vs-convenience-function contrast example for summing a list
   (item 3), and an instruction to model submissions on the five reference languages, not invent a
   different approach (item 4).
4. Open `content/language-template.md` and confirm it now carries an instructional comment stating
   the same rule, visible before a contributor writes any code.
5. Hand `CONTRIBUTING.md` to someone unfamiliar with the project and ask them to classify 2-3 code
   snippets (one raw, one using a convenience function) as compliant or not — they should get it
   right without asking follow-up questions (SC-002).

## Validate: the five reference languages comply (User Story 2 / FR-005-FR-006, SC-001, SC-004)

1. Open `content/languages/php.md`, `python.md`, and `dart.md` and confirm each List section now
   sums via a manual loop, not `array_sum()`/`sum()`/`.reduce()`.
2. Confirm each still declares `- result: 6` exactly as before.
3. Confirm `content/languages/java.md` and `abap.md` are unchanged (they already complied).
4. Run the existing regression checks (no new tests are added for this feature — plan.md Technical
   Context):
   ```bash
   npx vitest run tests/unit/parseLanguageFile.spec.js
   npx playwright test tests/e2e/browse-and-expand.spec.js
   ```
   Both MUST still pass — confirming the declared List outcome ("6") is unchanged for every
   language after the rewrite.
5. In a running dev server, expand each of PHP, Python, and Dart's cards and visually confirm the
   List example still displays `6`.

## Validate: public documentation is in English (User Story 3 / FR-007-FR-008, SC-003)

1. Read `README.md` end to end and confirm every sentence is in English.
2. Read `CONTRIBUTING.md` end to end and confirm every sentence is in English.

## Automated checks

```bash
npm run lint
npx vitest run
npx playwright test
npm run build
```

Expected: 0 lint errors; all existing unit and e2e tests still pass unchanged (this feature adds no
new test files — see plan.md Technical Context for why the existing `parseLanguageFile.spec.js` and
`browse-and-expand.spec.js` already provide the needed regression coverage); the production build
succeeds with no bundle-size change (no application code is touched).
