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

<!-- A minimal conditional (if/else or equivalent) that demonstrates the language's branching syntax. -->

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

<!-- MUST define a function/procedure that adds two numbers, called with 2 and 3. Keep the "- result:" line as-is. -->

- result: 5
  ```
  REPLACE_WITH_FUNCTION_CODE
  ```

## String Concatenation

<!--
  MUST join a fixed greeting with the fixed name "Mary" (the same name used for the `string`
  variable below). Keep the "- result:" line as-is.
-->

- result: Olá, Mary
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
  MUST declare a fixed value 18 and evaluate the fixed comparison (value >= 18). Keep the
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
