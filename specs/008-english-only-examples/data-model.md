# Data Model: English-Only Code Examples

This feature adds no new stored entities. It tightens the *values* of existing ones. Fields and
relationships below are the ones the feature touches; everything else in the language entry shape
(see `specs/001-hello-world-multilang-site/data-model.md`) is unchanged.

## Language Entry (parsed from `content/languages/<slug>.md`)

| Field | Change |
|-------|--------|
| `slug`, `name`, `helloWorld`, `calculation`, `loop`, `list`, `variables` | none |
| `conditional.code` | MUST print `Greater than 5` / `Less than or equal to 5` |
| `function.code` | MUST define and call `add` with 2 and 3; `function.result` stays `5` |
| `stringConcatenation.code` | MUST join `"Hello, "` and `"Mary"` |
| `stringConcatenation.result` | **`Olá, Mary` → `Hello, Mary`** (the only declared-outcome change) |
| `boolean.code` | MUST use identifier `age` = `18` and comparison `age >= 18`; `boolean.result` stays `true` |

**Validation rules**
- Enforced by the parser today (unchanged mechanism): every fixed-outcome section has a code block
  and a `- result:` equal to its constant. Only the String Concatenation constant changes.
- Enforced by the new unit test `tests/unit/languageContent.spec.js` (parser does not inspect code):
  the four code contents above, and absence of any Portuguese token from the deny-list.
- Deny-list of legacy tokens: `Olá`, `Maior que`, `Menor ou igual`, `somar`, `idade`.

**Relationships**: one Language Entry per file; the filename is the slug and the uniqueness key
(unchanged).

## Fixed Example Values (shared by all eight entries)

A conceptual, language-independent record; it lives in `contracts/example-content-contract.md` and
is copied into the docs. Not a runtime structure except for the single constant in the parser.

| Field | Value |
|-------|-------|
| `conditional.trueMessage` | `Greater than 5` |
| `conditional.falseMessage` | `Less than or equal to 5` |
| `string.greeting` | `Hello, ` |
| `string.name` | `Mary` |
| `string.declaredOutcome` | `Hello, Mary` |
| `function.name` | `add` |
| `boolean.identifier` | `age` |
| `boolean.value` | `18` |

## Declared Outcome constants (parser)

Source of truth: the `FIXED_OUTCOME_SECTIONS` list in `src/content/parseLanguageFile.js`.

| Section | Expected result |
|---------|-----------------|
| Calculation | `4` |
| Loop | `1 2 3 4 5` |
| Function | `5` |
| String Concatenation | `Hello, Mary` *(was `Olá, Mary`)* |
| List | `6` |
| Boolean Comparison | `true` |

## Interface Label (i18n)

Keys under `languageCard` in `src/i18n/locales/{en,es,pt-BR}.js`.

| Key | en (already correct) | es (new) | pt-BR (new) |
|-----|----------------------|----------|-------------|
| `function` | `Function: add(2, 3)` | `Función: add(2, 3)` | `Função: add(2, 3)` |
| `stringConcatenation` | `Concatenation: "Hello, " + name` | `Concatenación: "Hello, " + name` | `Concatenação: "Hello, " + name` |
| `boolean` | `Boolean: age >= 18` | `Booleano: age >= 18` | `Booleano: age >= 18` |

Rule: the words around the quoted code stay in the interface language; the quoted code is the
exact English text shown in the example beneath it. Other keys (`loop`, `list`, `calculation`,
`conditional`, …) do not quote example identifiers and are unchanged. `tests/unit/locales.spec.js`
already checks the three locales stay key-for-key aligned; no key is added or removed.
