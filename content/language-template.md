<!--
CONTRIBUTOR CONTRACT — Hello World Multi-Language Showcase Site

How to add a new language:
1. Copy this file to `content/languages/<your-language-slug>.md`
   (the FILENAME is the language's slug — use lowercase, hyphen-separated, e.g. `java.md`,
   `c-sharp.md`). This filename becomes the language's URL and its uniqueness key: two files
   cannot share a slug.
2. Fill in the `name` field below and every code block in the nine sections. Do not rename,
   remove, or reorder the sections — the build parses them by these exact headings.
3. Six of the sections (Calculation, Loop, Function, String Concatenation, List, Boolean
   Comparison) each carry a `- result: <value>` line. Keep that exact value in every language —
   only the code above it changes. This is what makes every language's examples directly
   comparable: the code differs, the declared outcome never does.
4. Open a pull request against the GitHub repository with your new file.

ENGLISH-ONLY RULE: all text inside the examples MUST be in English — string literals, printed
messages, identifier names, and the declared `- result:` values. Use these exact values in every
language: the Conditional prints "Greater than 5" (when number > 5) or "Less than or equal to 5";
the Function is named `add`; the String Concatenation joins "Hello, " with "Mary"; the Boolean
Comparison uses the identifier `age`. Only what the language itself forces may vary (identifier
casing or prefix, quoting style, how a boolean prints). See CONTRIBUTING.md, "The English-only
rule".

RAW-SYNTAX RULE: every example below MUST use the language's own basic, built-in control-flow
and operators for the capability it demonstrates — never a convenience function or
standard-library call that performs the operation for you (e.g., a manual loop to sum a list,
not a built-in "sum" function). The only exceptions are the Function example itself (defining
and calling a function is its whole point) and whatever minimal statement is needed to print
output. See CONTRIBUTING.md's "The raw-syntax rule" section for a worked example, and base your
submission on the existing files under content/languages/ rather than inventing a different
approach.
-->

---

name: "REPLACE_WITH_LANGUAGE_DISPLAY_NAME"
---

## Hello World

<!-- The program that prints "Hello, World!" (or your language's closest idiom) to standard output. -->

```
REPLACE_WITH_HELLO_WORLD_CODE
```

## Conditional

<!--
  A minimal conditional (if/else or equivalent) that demonstrates the language's branching syntax.
  MUST set number = 10 and print "Greater than 5" when number > 5, otherwise
  "Less than or equal to 5" (English only).
-->

```
REPLACE_WITH_CONDITIONAL_CODE
```

## Calculation

<!-- MUST compute the fixed equation (1 + 1) * 2. Keep the "- result: 4" line exactly as-is. -->

- result: 4
  ```
  REPLACE_WITH_CALCULATION_CODE
  ```

## Loop

<!-- MUST count from 1 to 5 and print each number in order. Keep the "- result:" line as-is. -->

- result: 1 2 3 4 5
  ```
  REPLACE_WITH_LOOP_CODE
  ```

## Function

<!--
  MUST define a function/procedure named `add` that adds two numbers, called with 2 and 3. Keep
  the "- result:" line as-is.
-->

- result: 5
  ```
  REPLACE_WITH_FUNCTION_CODE
  ```

## String Concatenation

<!--
  MUST join the fixed greeting "Hello, " with the fixed name "Mary" (the same name used for the
  `string` variable below). Keep the "- result:" line as-is.
-->

- result: Hello, Mary
  ```
  REPLACE_WITH_STRING_CONCATENATION_CODE
  ```

## List

<!-- MUST declare the fixed list [1, 2, 3] and print the sum of its elements. Keep the "- result:" line as-is. -->

- result: 6
  ```
  REPLACE_WITH_LIST_CODE
  ```

## Boolean Comparison

<!--
  MUST declare a fixed value 18 in an identifier named `age` and evaluate the fixed comparison
  (age >= 18). Keep the
  "- result:" line as-is — this is the declared outcome, not necessarily the literal text your
  language prints for a boolean.
-->

- result: true
  ```
  REPLACE_WITH_BOOLEAN_COMPARISON_CODE
  ```

## Variables

<!--
  Provide one basic declaration for EACH of the three kinds below, keeping the "kind:" labels
  exactly as shown so the build can identify each one. The string declaration MUST use the same
  fixed name "Mary" used in the String Concatenation section above.
-->

- integer:
  ```
  REPLACE_WITH_INTEGER_DECLARATION
  ```
- string:
  ```
  REPLACE_WITH_STRING_DECLARATION_USING_MARY
  ```
- float:
  ```
  REPLACE_WITH_FLOAT_DECLARATION
  ```
