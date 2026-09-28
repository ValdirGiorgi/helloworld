# Research: English-Only Code Examples

## 1. What exactly is Portuguese today, and where?

**Decision**: Treat as in scope exactly the occurrences found by searching the repo (excluding
`specs/`, `node_modules`, `dist`) for `Olá`, `Maior que`, `Menor ou igual`, `somar`, `idade`:

| Where | Old wording |
|-------|-------------|
| `content/languages/{java,python,dart,abap,php,typescript,rust,go}.md` | Conditional messages; `somar`; `Olá, ` + declared `- result: Olá, Mary`; `idade` |
| `content/language-template.md` | placeholder `- result: Olá, Mary` |
| `src/content/parseLanguageFile.js` line 7 | `expectedResult: 'Olá, Mary'` |
| `src/i18n/locales/pt-BR.js` | labels `Função: somar(2, 3)`, `Concatenação: "Olá, " + name`, `Booleano: idade >= 18` |
| `src/i18n/locales/es.js` | labels `Función: sumar(2, 3)`, `Concatenación: "Hola, " + name`, `Booleano: edad >= 18` |
| `CONTRIBUTING.md` | `- result: Olá, Mary`; `idade >= 18` / `idade = 18` |
| Tests | `LanguageCard.spec.js`, `LanguageList.spec.js`, `parseLanguageFile.spec.js`, `browse-and-expand.spec.js`, `contribute-language.spec.js` |

`src/i18n/locales/en.js` already reads `add(2, 3)`, `"Hello, " + name`, `age >= 18`, so English is
the reference the other two locales are brought in line with. The spec's assumption that the chosen
English names match what the site already shows is confirmed.

**Rationale**: A search-based inventory is the only reliable way to guarantee SC-001 (zero
Portuguese matches) and avoids missing places like the locale labels, which the request did not
name explicitly but which would contradict the code beside them (FR-009).

**Alternatives considered**: Only editing the eight content files and the parser (rejected — leaves
es/pt-BR labels quoting identifiers that no longer exist in the code shown right under them).

## 2. Parser and content must change atomically

**Decision**: Change `expectedResult` in `src/content/parseLanguageFile.js` in the same change as
the eight content files and the template. Do not add a backward-compatible "accept either value"
mode.

**Rationale**: The parser throws if a `- result:` differs from its constant (its error message
already names the file, the section, and the expected value), which satisfies spec Story 2
scenario 2 without new code. Accepting both values would let Portuguese examples keep sneaking in,
defeating the feature; the only cost of the strict approach is that in-flight contributions must
update one line, and the error message tells them which.

**Alternatives considered**: Accept both `Olá, Mary` and `Hello, Mary` for a transition period
(rejected — no such transition is needed for a project with one maintainer and no published
contributors depending on the old value).

## 3. Fixed example values and per-language casing

**Decision**: One set of values for all eight languages (full table in
`contracts/example-content-contract.md`):

| Item | Value |
|------|-------|
| Conditional true branch | `Greater than 5` |
| Conditional false branch | `Less than or equal to 5` |
| String Concatenation | `"Hello, "` + `"Mary"`, declared outcome `Hello, Mary` |
| Function name | `add` (all eight languages already use lowercase for functions) |
| Boolean identifier | `age` (with value `18`, comparison `age >= 18`) |

Since Java, Python, Dart, ABAP, PHP, TypeScript, Rust, and Go all conventionally use a lowercase
`add`/`age` (PHP variable is `$age`), no language needs a casing exception today; the contract
still allows one, as long as the English word is the same.

**ABAP caveat**: `FORM add …` / `PERFORM add …` uses `ADD`, which is also the name of an obsolete
ABAP statement. FORM names are their own namespace and ABAP does not reserve statement keywords as
identifiers, so this is expected to be valid — but there is no ABAP system available here to
compile it. It is recorded as an unverified, low-risk point; if a reviewer with an ABAP system
finds a clash, the fallback is to keep `add` as the concept word and document the ABAP-specific
exception in the contract rather than change the other seven.

**Rationale**: Matches the labels the English interface already displays, and a single shared name
per concept is what makes the comparison fair.

**Alternatives considered**: `sum`/`add_numbers` for the function (rejected — the site's English
label is already `add(2, 3)`); `is_adult`/`can_vote` for the boolean (rejected — the request only
asks for translation, not a change of the example's concept, and the fixed comparison is
`value >= 18`).

## 4. Existing tests: update in place vs. rewrite

**Decision**: Update the wording and the language lists in place:

- Wording/outcome: `parseLanguageFile.spec.js`, `LanguageCard.spec.js`, `LanguageList.spec.js`,
  `browse-and-expand.spec.js`, `contribute-language.spec.js` (fixtures such as `somar(2, 3)`,
  `"Olá, " + name`).
- Language lists (5 → 8): `browse-and-expand.spec.js` (`LAUNCH_LANGUAGES` and the test title
  that says "5"), `sidebar-navigation.spec.js`, `search-language.spec.js`,
  `generateSitemap.spec.js` (`LANGUAGE_SLUGS`).

**Watch-out**: `sidebar.getByRole('link', { name })` matches by case-insensitive substring by
default; the short name `Go` could match unrelated link text, so the loop should pass
`exact: true`.

**Rationale**: Each of these tests is doing the right job (fixtures mirror real content); only the
literal values are stale. Rewriting them would add risk for no benefit.

**Alternatives considered**: Deriving the language list from `content/languages/` in the tests
(rejected — the tests deliberately pin the launch set; auto-discovery would stop them noticing a
language that failed to load).

## 5. A guard that runs on the real content

**Decision**: Add `tests/unit/languageContent.spec.js`. For every `content/languages/*.md` it
reads the raw file, runs it through the real `parseLanguageFile`, and asserts: parse succeeds; the
String Concatenation outcome is `Hello, Mary`; the Conditional code contains the two English
messages; the Function code contains `add`; the Boolean code contains `age`; and no file contains
any of the old Portuguese tokens (`Olá`, `Maior que`, `Menor ou igual`, `somar`, `idade`). It also
asserts `content/language-template.md` declares `Hello, Mary` and contains none of those tokens.
It must also assert the supported set includes the eight known slugs so a missing file is noticed.

**Rationale**: Today no unit test parses the real files — they are only exercised by e2e through
the dev server and by the build, which is slow and fails with a generic error. A fast unit guard
gives contributors an immediate, specific failure, satisfies Constitution Principle II for the new
rule, and makes SC-001 mechanical instead of a manual search.

**Alternatives considered**: A lint rule or CI grep step (rejected — adds tooling outside the
existing Vitest setup for one check); relying on the e2e suite only (rejected — too slow and
does not check identifiers).

## 6. Where to document the rule and what to say

**Decision**: Put the full rule, with the table of fixed values, in `CONTRIBUTING.md` as a new
section next to "The raw-syntax rule". `content/language-template.md` gets a short "ENGLISH-ONLY
RULE" paragraph in its top contributor-contract comment and a one-line reminder inside the
Conditional, Function, String Concatenation, and Boolean Comparison section comments. `README.md`
gets one sentence in its opening description/"Adding a language" section pointing at the
CONTRIBUTING section, plus the eight-language list. The three documents state identical values
(spec FR-014); the values live once in `contracts/documentation-contract.md` and the docs copy
them verbatim.

**Rationale**: CONTRIBUTING is where people read the detailed rules (the raw-syntax rule already
lives there), the template is where they edit, and the README is what visitors see first — the
three places the request names.

**Alternatives considered**: Stating the full table in all three places (rejected as the README
copy — it would be a third place to keep in sync; README states the rule in one sentence and links
to CONTRIBUTING).

## 7. Which languages count as "reference languages"

**Decision**: Leave the wording "the five existing reference languages (Java, Python, Dart, ABAP,
PHP)" in `CONTRIBUTING.md` as-is; only the enumerations of *supported* languages (README, llms.txt,
tests) grow to eight.

**Rationale**: The raw-syntax rule is defined against those five (spec 004), and redefining the
reference set is outside this request. TypeScript, Rust, and Go follow the same conventions but are
not introduced as new authorities.

**Alternatives considered**: Renaming to "eight reference languages" (rejected — silently changes
a standing rule from a previous feature).

## 8. What stays untouched

**Decision**: `content/history.*.md`, the per-locale UI strings other than the three quoted-example
labels, page components, and the sitemap generator are not modified (sitemap only gets the longer
language list in its test — the generator itself derives slugs from the content files).

**Rationale**: FR-015 and the Assumptions in the spec.

**Alternatives considered**: Translating example content per interface language (rejected — the
whole point of the request is a single English set of examples).
