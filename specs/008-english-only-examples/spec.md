# Feature Specification: English-Only Code Examples

**Feature Branch**: `008-english-only-examples`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Todo o texto dentro dos exemplos de código das linguagens deve estar em inglês (por exemplo, \"Olá, Mary\" deve virar \"Hello, Mary\"; \"Maior que 5\" etc. também; nomes de identificadores como somar/idade também em inglês). Isso vale para todas as linguagens existentes (Java, Python, Dart, ABAP, PHP) e para as recém-adicionadas (TypeScript, Rust, Go), e o valor declarado \"- result:\" da String Concatenation também muda para \"Hello, Mary\". Também é preciso revisar o código/testes/site que dependam desses textos (parser, template, testes unitários e e2e), e documentar essa regra de forma clara no CONTRIBUTING.md, no README.md e no template de contribuição, onde as pessoas leem e modificam os exemplos. Atualizar também as menções às linguagens suportadas (README, llms.txt, listas de testes) para incluir TypeScript, Rust e Go."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every language's examples read the same, in English (Priority: P1)

A visitor comparing languages side by side sees the same example, with the same wording, in every
language: the same greeting ("Hello, Mary"), the same branch messages, and the same English
identifier names. Nothing in one language's code is written in Portuguese while another's is in
English, so the only differences the visitor notices are the languages' own syntax.

**Why this priority**: This is the core of the request. The site exists to compare languages
fairly; mixed Portuguese/English text and identifiers add noise to that comparison and make the
examples harder to read for the international audience the site targets.

**Independent Test**: Can be fully tested by reading the code of every example in every language
(Java, Python, Dart, ABAP, PHP, TypeScript, Rust, Go) and confirming no string literal, printed
message, or identifier is written in Portuguese — independent of whether the documentation has been
updated yet.

**Acceptance Scenarios**:

1. **Given** the Conditional example of any language, **When** a visitor reads it, **Then** the
   printed messages are the English texts "Greater than 5" and "Less than or equal to 5" instead of
   the previous Portuguese texts.
2. **Given** the String Concatenation example of any language, **When** a visitor reads it,
   **Then** the greeting is "Hello, " joined with the fixed name "Mary", and the declared outcome
   shown next to it reads "Hello, Mary".
3. **Given** the Function example of any language, **When** a visitor reads it, **Then** the
   function is named `add` (not `somar`) and is still called with 2 and 3 for a declared outcome of
   5.
4. **Given** the Boolean Comparison example of any language, **When** a visitor reads it, **Then**
   the value is held in an identifier named `age` (not `idade`), the comparison is still
   `age >= 18`, and the declared outcome is still "true".
5. **Given** any language's examples after the change, **When** they are compared with one another
   for the same example type, **Then** the wording of every string and the naming of every
   identifier is the same across all eight languages (adjusted only for each language's own naming
   conventions, such as casing).
6. **Given** any example, **When** it is rewritten to English, **Then** its behavior and every
   declared outcome other than the String Concatenation one are unchanged, and it still complies
   with the raw-syntax rule.

---

### User Story 2 - The site and its checks accept the new English contract (Priority: P1)

The site keeps building and displaying every language after the wording changes: the check that
verifies each language's declared outcomes now expects "Hello, Mary" for String Concatenation, and
all the site's automated tests and sample data use the English wording.

**Why this priority**: The declared outcome is validated when the site loads its language content.
If the language files change but that expectation does not (or the reverse), every language would
be rejected and the site would show nothing. This has to move together with Story 1.

**Independent Test**: Can be fully tested by running the project's whole automated test suite and
building the site, then confirming every language appears and every declared outcome — including
"Hello, Mary" — is displayed.

**Acceptance Scenarios**:

1. **Given** a language whose String Concatenation declares "Hello, Mary", **When** the site loads
   its content, **Then** the language is accepted and displayed with that outcome.
2. **Given** a language that still declares the old Portuguese outcome, **When** the site loads its
   content, **Then** it is rejected with the same kind of clear message used for any other
   declared-outcome mismatch, naming the file and the expected value.
3. **Given** the site's automated tests and their sample language content, **When** the whole suite
   runs, **Then** none of them contain or expect the old Portuguese wording and the suite passes.
4. **Given** the labels shown above each example in every supported interface language
   (English, Spanish, Brazilian Portuguese), **When** they quote the example's content (the
   greeting, the function call, the comparison), **Then** they quote the English wording actually
   shown in the code (`"Hello, " + name`, `add(2, 3)`, `age >= 18`) while the rest of each label
   stays in that interface language.

---

### User Story 3 - Contributors are told the English-only rule where they read and edit (Priority: P2)

Someone adding or editing a language reads the contribution guide, the project overview, and the
contributor template, and in each of them finds a clear, consistent statement: all text inside
examples — printed messages, string values, identifier names, and declared outcomes — must be
in English, with the exact fixed values to use.

**Why this priority**: Without the rule stated where contributors work, the next submission will
reintroduce Portuguese (the template itself currently shows the Portuguese outcome), and reviewers
would have nothing to point to. It depends on the rule from Story 1 being settled, so it ranks just
below it.

**Independent Test**: Can be fully tested by having someone unfamiliar with the project read only
the contribution guide and the template and correctly write the Conditional, String Concatenation,
Function, and Boolean Comparison examples for a new language with the exact expected wording and
names.

**Acceptance Scenarios**:

1. **Given** the contribution guide, **When** a contributor reads how to write an example,
   **Then** it states that all text inside examples must be in English and lists the fixed values
   to use ("Greater than 5", "Less than or equal to 5", "Hello, Mary", `add`, `age`).
2. **Given** the project overview, **When** a visitor or contributor reads it, **Then** it
   mentions the English-only rule for examples (or points directly to the section that states it),
   and lists the currently supported languages including TypeScript, Rust, and Go.
3. **Given** the contributor template, **When** a contributor copies it, **Then** its instructions
   and its placeholder outcome for String Concatenation show "Hello, Mary", and its comments
   state the English-only rule and the fixed wording for the Conditional, Function, and Boolean
   Comparison sections.
4. **Given** the contribution guide's worked example of the raw-syntax rule and any other sample
   code in the documentation, **When** they are read, **Then** they also use English wording and
   identifiers.

---

### User Story 4 - Supported-language mentions include TypeScript, Rust, and Go (Priority: P3)

Every place that lists the supported languages — the project overview, the machine-readable
summary for AI agents, and the automated checks that enumerate the languages — includes
TypeScript, Rust, and Go alongside Java, Python, Dart, ABAP, and PHP.

**Why this priority**: The three languages already exist on the site; this only makes the rest of
the project consistent with that. It has no effect on the examples themselves, so it is lowest.

**Independent Test**: Can be fully tested by searching the project for the old five-language lists
and confirming each one now names all eight, and that the automated checks that enumerate
languages cover all eight.

**Acceptance Scenarios**:

1. **Given** the project overview and the machine-readable summary for AI agents, **When** they
   list the supported languages, **Then** the list contains all eight languages.
2. **Given** the automated checks that enumerate the launch languages (browsing, sidebar,
   search, sitemap), **When** they run, **Then** they cover all eight languages and pass.

---

### Edge Cases

- **A contribution prepared before this change**: a pull request whose language file still
  declares "Olá, Mary" is rejected with a clear message stating the expected value, so the
  contributor knows exactly what to change.
- **A language with a required output format**: a language whose boolean prints differently (for
  example as capitalized or numeric text) keeps the declared outcome "true" and only the code's
  wording and names must be English; the outcome value itself is not translated.
- **Accented characters**: after the change, no example text needs accented characters, so no
  language's syntax or encoding can break because of them.
- **Interface language versus example language**: labels, buttons, and page text remain
  translated per interface language; only the code examples and their declared outcomes are
  English-only. A visitor viewing the Portuguese interface still sees English code.
- **Identifiers that are not translated**: identifiers already in English (`name`, `number`,
  `result`, `total`, `numbers`, `price`) are left as they are; only Portuguese ones change.
- **Language-mandated naming**: an identifier may change casing to follow the language's own
  convention (for example `Add` in a language that capitalizes function names) but must remain the
  same English word.
- **Stale references elsewhere**: any other file that quotes the old Portuguese wording (sample
  data in tests, documentation excerpts) is updated in the same change so the project has one
  consistent set of example values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every example of every language on the site (Java, Python, Dart, ABAP, PHP,
  TypeScript, Rust, Go) MUST contain only English text: string literals, printed messages, and
  identifier names.
- **FR-002**: The Conditional example MUST print "Greater than 5" when the branch condition is
  true and "Less than or equal to 5" otherwise, in every language.
- **FR-003**: The String Concatenation example MUST join the greeting "Hello, " with the fixed
  name "Mary", and its declared outcome MUST be "Hello, Mary" in every language.
- **FR-004**: The Function example MUST define a function named `add` (adjusted only for the
  language's own naming convention) that adds two numbers and is called with 2 and 3, keeping the
  declared outcome 5.
- **FR-005**: The Boolean Comparison example MUST use an identifier named `age` with the value 18
  and the comparison `age >= 18`, keeping the declared outcome "true".
- **FR-006**: The behavior and declared outcome of every example other than String Concatenation
  MUST remain exactly as they are today, and every example MUST continue to comply with the
  raw-syntax rule.
- **FR-007**: The check that validates a language's declared outcomes when the site loads MUST
  expect "Hello, Mary" for String Concatenation and MUST reject the previous Portuguese outcome
  with a clear message naming the file and the expected value.
- **FR-008**: All automated tests, sample language content, and test fixtures that use the old
  Portuguese wording or identifiers MUST be updated to the English contract, and the whole test
  suite MUST pass.
- **FR-009**: The labels shown above examples in every supported interface language MUST quote the
  English example content (`"Hello, " + name`, `add(2, 3)`, `age >= 18`) while keeping the rest of
  the label in that interface language.
- **FR-010**: The contribution guide MUST state that all text inside examples must be in English,
  MUST list the fixed values (messages, greeting, function name, identifier name, declared
  outcomes) contributors must use, and MUST update its own sample code and outcome values
  accordingly.
- **FR-011**: The contributor template MUST show "Hello, Mary" as the String Concatenation
  outcome and MUST state the English-only rule and the fixed wording and names in its
  instructions and section comments.
- **FR-012**: The project overview MUST state the English-only rule for examples (or link to the
  section that does) and MUST list all eight supported languages.
- **FR-013**: The machine-readable summary for AI agents and every automated check that enumerates
  the launch languages MUST list all eight languages.
- **FR-014**: The rule statements in the contribution guide, the project overview, and the
  contributor template MUST be consistent with each other, using the same fixed values.
- **FR-015**: The change MUST NOT alter interface text, the translated history content, or the
  page structure beyond what FR-009 requires.

### Key Entities

- **Example**: One of the nine content sections of a language (Hello World, Conditional,
  Calculation, Loop, Function, String Concatenation, List, Boolean Comparison, Variables), each
  containing code and, for six of them, a declared outcome.
- **Declared Outcome**: The fixed value shown next to an example and validated on load. Only the
  String Concatenation one changes, from "Olá, Mary" to "Hello, Mary".
- **Fixed Example Values**: The shared, language-independent wording and names every language must
  use: the two Conditional messages, the greeting and name, the function name, and the comparison
  identifier.
- **Contribution Documentation**: The guide, the project overview, and the contributor template
  where the rule is stated for people who read and edit examples.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the code examples across all 8 languages contain no Portuguese word,
  verified by searching the language content and finding zero matches for the previous Portuguese
  wording and identifiers.
- **SC-002**: 100% of the 8 languages load and display with the "Hello, Mary" outcome, and the
  full automated test suite and site build pass with zero failures.
- **SC-003**: A contributor who reads only the contribution guide and template writes the four
  affected examples for a new language with the exact expected wording and names on the first
  attempt.
- **SC-004**: Zero occurrences of the old five-language list remain in the project overview, the
  machine-readable summary, and the automated checks; all now list all 8 languages.
- **SC-005**: All three documents that state the rule agree with each other; a side-by-side
  comparison finds no conflicting value.
- **SC-006**: In every interface language, the label above each of the three quoted examples
  matches the code shown beneath it, with no leftover Portuguese example wording.

## Assumptions

- "Text inside the examples" means string literals, printed messages, identifier names, and the
  declared outcome; comments are not part of any example today, and none are added.
- The English wordings chosen for the Conditional messages ("Greater than 5", "Less than or equal
  to 5"), the function name (`add`), and the comparison identifier (`age`) are the defaults for
  this feature; they match the English labels already shown on the site (`add(2, 3)`,
  `age >= 18`).
- Only the code examples and their declared outcomes become English-only. The site's interface
  text, its Portuguese and Spanish translations, and the translated history pages keep being
  localized.
- The labels above examples in the Spanish and Portuguese interfaces are updated only where they
  quote example content; the English labels already quote the English wording.
- The three recently added languages (TypeScript, Rust, Go) already exist as content files and are
  brought into the same English contract along with the five older ones.
- The raw-syntax rule and the fixed values for the other declared outcomes (4, "1 2 3 4 5", 5, 6,
  "true") are unchanged.
- The change is delivered as one coordinated set so content, validation, tests, and documentation
  never disagree with one another.
