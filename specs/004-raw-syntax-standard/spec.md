# Feature Specification: Raw-Syntax Contribution Standard

**Feature Branch**: `004-raw-syntax-standard`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Agora a gente precisa especificar a forma como as pessoas vão contribuir. Deve existir um padrão: por exemplo no PHP, para fazer a soma do array, ele usou uma função — isso não seria legal. Seria legal que fosse feito todos da mesma forma, da forma mais bruta da linguagem, sem usar nenhuma função de conveniência, para que haja uma comparação mais fiel. Sei que algumas linguagens evoluíram e criaram funções para facilitar, mas queremos os comandos brutos. Isso deve ficar explícito no documento de como contribuir, que deve ter exemplos usando as cinco linguagens de referência — não pode se criar algo novo, mais eficiente; tem que se basear naquelas linguagens. Esse documento deve ser em inglês, assim como os documentos que expõem o projeto no GitHub. Também revisar as cinco linguagens iniciais para ver se estão nesse mesmo padrão."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A contributor learns the raw-syntax rule before writing code (Priority: P1)

Someone who wants to add a new language reads the contribution documentation and understands,
without ambiguity, that every example demonstrating a specific capability (a calculation, a loop,
comparing two values, summing a list, and so on) must be written using that language's own basic,
built-in control-flow and operators — not a higher-level function or library call that performs
the operation for them.

**Why this priority**: This is the core rule the whole feature exists to communicate. Without it
being clearly documented, every future contribution risks repeating the exact problem already found
(a language quietly using a convenience function where another language spells out the raw steps),
undermining the site's purpose of a fair, side-by-side comparison.

**Independent Test**: Can be fully tested by having someone unfamiliar with the project read only
the contribution documentation and correctly judge, for a handful of example code snippets, which
ones follow the rule and which ones don't — without needing to ask anyone for clarification.

**Acceptance Scenarios**:

1. **Given** the contribution documentation, **When** a contributor reads the section describing
   how to write an example, **Then** it explicitly states that the language's own raw syntax must
   be used for the capability being demonstrated, instead of a convenience function or library call
   that performs it internally.
2. **Given** the contribution documentation, **When** a contributor looks for guidance on a
   commonly-tempting shortcut (such as summing the numbers in a list), **Then** they find a
   worked, side-by-side example contrasting the acceptable "raw" approach against the disallowed
   "convenience function" approach for at least one of the five reference languages.
3. **Given** the contribution documentation, **When** a contributor wants to know what a compliant
   submission looks like, **Then** they are directed to model their submission directly on the five
   existing reference languages, and told not to invent a different, "more modern" or "more
   efficient" approach instead.
4. **Given** the contribution documentation, **When** a contributor reaches the Function example
   (whose whole purpose is defining and calling a function) or any example that must produce
   visible output, **Then** the documentation makes clear these are expected uses of a function
   call, not violations of the rule.

---

### User Story 2 - The five reference languages themselves comply with the standard (Priority: P1)

A visitor comparing the five launch languages sees every example computed the same, fair way —
none of them secretly relies on a hidden helper that does the real work, making that language look
artificially shorter or more capable than the others at the primitive level.

**Why this priority**: The reference languages are the standard's own worked example and the
model every future contribution is told to copy — if they don't comply themselves, the standard has
no credible foundation, and the specific problem that triggered this feature (an existing language
already breaking the rule) remains unfixed.

**Independent Test**: Can be fully tested by reviewing each of the five reference languages' example
code, per example type, and confirming none of them delegates the demonstrated capability to a
built-in or library convenience function — independent of whether the documentation itself has been
finished yet.

**Acceptance Scenarios**:

1. **Given** each of the five reference languages' contributed content, **When** it is reviewed
   against the raw-syntax rule, **Then** any example found using a convenience function to perform
   the demonstrated capability is rewritten to use that language's own raw control-flow/operators
   instead.
2. **Given** a reference language's example is rewritten to comply with the rule, **When** the site
   displays that example afterward, **Then** it still declares exactly the same fixed outcome value
   it declared before (the visible result does not change, only how the code arrives at it).
3. **Given** all five reference languages after review, **When** compared to each other for the
   same example type (e.g., all five "List" examples), **Then** each one manually performs the
   operation using its own basic syntax, with none relying on a summing/reducing/searching
   convenience function the others don't get to use.

---

### User Story 3 - Contribution documentation and public project docs read in English (Priority: P2)

Someone outside the project, browsing it on GitHub, can read the documentation that explains how to
contribute and what the project is for, in English, regardless of the language the project's
original author writes in day to day.

**Why this priority**: This is about the project's public presentation once it's shared broadly;
important for reaching contributors and being taken seriously as an open-source project, but it
does not block the raw-syntax standard itself from being defined and applied (User Stories 1-2).

**Independent Test**: Can be fully tested by reading the contribution documentation and the
project's README end to end and confirming every sentence is in English, independent of whether any
particular language's example content has been reviewed yet.

**Acceptance Scenarios**:

1. **Given** the contribution documentation, **When** it is read by an English-speaking visitor,
   **Then** every instruction, heading, and example explanation is written in English.
2. **Given** the project's README (the document that explains what the project is and why it
   exists), **When** it is read by a visitor on GitHub, **Then** it is written in English.

---

### Edge Cases

- What about a language whose only realistic way to sum a list without extreme, unreadable
  verbosity is a very common built-in shortcut (not an imported library, just part of the language
  itself)? (Still disallowed — the rule cares about hiding the raw mechanics, not about how
  "official" or built-in the shortcut is; the example must still manually iterate and accumulate.)
- What about a `print`/output statement, or any language facility with no raw alternative to
  produce visible output at all? (Not a violation — the rule targets the specific capability an
  example is meant to demonstrate, e.g., looping or summing, not the unavoidable act of showing a
  result.)
- What about the Function example, whose entire purpose is defining and calling a function? (Not a
  violation — using a function is literally what that example demonstrates.)
- What about a language whose own native syntax for an operation is a keyword or statement rather
  than an infix operator (for example, a dedicated string-joining statement instead of a `+`
  operator)? (Not a violation, as long as it is the language's own basic built-in facility for that
  operation and not a call to a separate library/utility function — the comparison is against
  "delegates the work to a convenience function," not against a specific keyword shape.)
- What happens if reviewing a reference language finds more than one non-compliant example? (Every
  one found is corrected — this is not limited to a single, pre-identified case.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Contribution documentation MUST explicitly state that every example demonstrating a
  specific capability MUST be written using that language's own basic, built-in control-flow
  and/or operators for that capability, rather than a higher-level convenience function or library
  call that performs the operation on the contributor's behalf.
- **FR-002**: The rule in FR-001 applies to every example type defined by the current contribution
  template (Hello World, Conditional, Calculation, Loop, Function, String Concatenation, List,
  Boolean Comparison), except: (a) the Function example, whose purpose is specifically to
  demonstrate defining and calling a function, and (b) whatever minimal language facility is needed
  to produce visible output, which is unavoidable and not itself the capability being demonstrated.
- **FR-003**: Contribution documentation MUST include at least one worked, side-by-side example
  contrasting a compliant "raw" approach against a disallowed "convenience function" approach, for
  an operation contributors are commonly tempted to shortcut (e.g., summing the numbers in a list).
- **FR-004**: Contribution documentation MUST instruct contributors to model a new language
  submission directly on the five existing reference languages (Java, Python, Dart, ABAP, PHP), and
  MUST NOT suggest inventing a different, more modern, or more efficient approach instead.
- **FR-005**: Each of the five reference languages' existing contributed content MUST be reviewed
  against FR-001-FR-002, and every example found violating the rule MUST be rewritten to use that
  language's own raw/primitive syntax for the capability in question.
- **FR-006**: A reference language's example, after being rewritten to comply with FR-005, MUST
  continue to declare exactly the same fixed outcome value it declared before the rewrite.
- **FR-007**: The contribution documentation MUST be written in English.
- **FR-008**: The project's README MUST be written in English, consistent with the contribution
  documentation, since both are part of the project's public presentation on GitHub.
- **FR-009**: The contribution content template (the file contributors copy to start a new
  language) MUST reflect the same raw-syntax rule at the point where a contributor writes code, not
  only in a separate document.

### Key Entities

- **Raw-Syntax Rule**: The standard itself — for a given example type, the requirement that its
  code use the language's own basic control-flow/operators for the capability being demonstrated,
  rather than delegating that capability to a convenience function; documented once and referenced
  by every example type it applies to.
- **Reference Language**: One of the five launch languages (Java, Python, Dart, ABAP, PHP) that
  serves as the canonical, standard-compliant model every new contribution is told to follow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the five reference languages' code examples use only that language's own raw
  syntax for the capability each example is meant to demonstrate, with zero remaining
  convenience-function shortcuts after this feature ships.
- **SC-002**: Someone who has read only the contribution documentation can correctly classify, on
  their first attempt and without outside help, whether each of several example code snippets
  complies with the raw-syntax rule.
- **SC-003**: 100% of the project's public-facing GitHub documentation (the contribution
  documentation and the README) is written in English.
- **SC-004**: Every fixed outcome value declared by the five reference languages' examples is
  unchanged before and after this feature's review (e.g., the List example still declares "6" in
  all five languages).

## Assumptions

- "Raw/primitive syntax" means a language's own control-flow keywords, operators, and basic literal
  syntax (loops, conditionals, arithmetic/comparison operators, array/list literals) rather than a
  named function, method, or standard-library call that performs the demonstrated operation
  internally — regardless of whether that shortcut is a built-in language feature or an imported
  library, and regardless of how idiomatic or commonly recommended it is in that language's own
  community.
- The exemptions for the Function example and for unavoidable output statements (spec Edge Cases)
  are treated as permanent, inherent parts of the rule, not something each future contribution needs
  to re-justify individually.
- "Other project documentation that exposes the project on GitHub," per the original request, refers
  to the repository's README; internal working documents (e.g., the project constitution or the
  `specs/` planning artifacts) are not public-facing in the same sense and are out of scope for
  translation under this feature.
- Correcting a non-compliant reference-language example only requires rewriting the specific
  section(s) found in violation, not re-authoring that language's entire file.
- This feature does not change any example's fixed/declared outcome value (e.g., "4", "6", "true")
  — only how a non-compliant example's code arrives at that already-declared value.
