<!--
CONTRIBUTOR CONTRACT — Hello World Multi-Language Showcase Site

How to add a new language:
1. Copy this file to `content/languages/<your-language-slug>.md`
   (the FILENAME is the language's slug — use lowercase, hyphen-separated, e.g. `java.md`,
   `c-sharp.md`). This filename becomes the language's URL and its uniqueness key: two files
   cannot share a slug.
2. Fill in the `name` field below and every code block in the four sections. Do not rename,
   remove, or reorder the sections — the build parses them by these exact headings.
3. For the "Calculation" section, keep the exact equation `(1 + 1) * 2` and show it printing
   `4` in your language's own syntax — every language on the site must show this same equation
   and the same result, so visitors can compare syntax without the numbers differing.
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

<!-- MUST compute the fixed equation (1 + 1) * 2 and print its result: 4. -->

```
REPLACE_WITH_CALCULATION_CODE
```

## Variables

<!--
  Provide one basic declaration for EACH of the three kinds below, keeping the "kind:" labels
  exactly as shown so the build can identify each one.
-->

- integer:
  ```
  REPLACE_WITH_INTEGER_DECLARATION
  ```
- string:
  ```
  REPLACE_WITH_STRING_DECLARATION
  ```
- float:
  ```
  REPLACE_WITH_FLOAT_DECLARATION
  ```
