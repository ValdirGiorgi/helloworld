# Contract: Documentation of the English-Only Rule

What each document must state so the rule is clear where people read and edit examples (spec User
Story 3, FR-010 – FR-014). The values here are the single source; the documents copy them
verbatim (see `example-content-contract.md`).

## 1. `CONTRIBUTING.md` (full statement)

1. In "Step by step" → item 3, the String Concatenation bullet MUST read `Keep
   - result: Hello, Mary` and the Boolean Comparison bullet MUST use `age >= 18` (with
   `age = 18`); the Conditional and Function bullets MUST name their fixed wording/name.
2. A new section, **"The English-only rule"**, placed right after "The raw-syntax rule", MUST:
   - state that all text inside examples (string literals, printed messages, identifier names,
     declared outcomes) is English, and that interface language is unrelated;
   - list the fixed values table from the example contract;
   - say that only language-forced variation (casing, quoting, boolean print format) is allowed;
   - state that a file still declaring the old outcome fails the build and the unit test with a
     message naming the expected value.
3. Any sample code elsewhere in the document MUST already be English (the PHP raw-syntax example
   is; keep it that way).
4. Its language-related sentences ("the five existing reference languages") stay as they are
   (research.md §7).

## 2. `content/language-template.md` (where people edit)

1. The top contributor-contract comment MUST gain step-level text: "All text inside examples MUST
   be English — see CONTRIBUTING.md 'The English-only rule'", with the fixed values.
2. The Conditional, Function, String Concatenation, and Boolean Comparison section comments MUST
   each state their fixed English wording/name.
3. The String Concatenation placeholder outcome MUST be `- result: Hello, Mary`.
4. The `Mary` note in the Variables comment stays (already correct).

## 3. `README.md` (first thing visitors read)

1. The opening description MUST list all eight languages: Java, Python, Dart, ABAP, PHP,
   TypeScript, Rust, and Go.
2. The "Adding a language" section MUST include one sentence: examples are written entirely in
   English (messages, strings, identifiers), with a link to CONTRIBUTING.md's English-only rule.

## 4. `public/llms.txt` (machine-readable summary)

The Home entry MUST name all eight languages. No other change. `tests/e2e/static-files.spec.js`
assertions (real file, `/en`, `/en/about`, `/en/history`, no HTML) remain valid.

## Consistency check (FR-014, SC-005)

After editing, the fixed values in documents 1 and 2 are compared literally against the example
contract: `Greater than 5`, `Less than or equal to 5`, `Hello, Mary`, `add`, `age`. README carries
none of the individual values, only the rule and the link.
