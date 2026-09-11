# Contributing a new language

This site is maintained as an open-source project and grows through community contributions.
Adding a new language doesn't require touching any of the site's code — just filling in a
Markdown file.

## Step by step

1. Copy [`content/language-template.md`](content/language-template.md) to
   `content/languages/<language-slug>.md`. The **filename** is the language's unique
   identifier (the language's URL on the site is derived from it), so use lowercase,
   hyphen-separated words — for example `java.md`, `c-sharp.md`.
2. Fill in the `name` field in the frontmatter with the language's display name.
3. Fill in all nine sections, keeping the headings exactly as they are (the site parses the
   content by these exact headings):
   - **Hello World**: the program that prints "Hello, World!" (or the language's closest
     equivalent).
   - **Conditional**: a simple conditional (if/else or equivalent).
   - **Calculation**: computes the fixed equation `(1 + 1) * 2`. Keep the `- result: 4` line
     exactly as-is.
   - **Loop**: counts from 1 to 5. Keep `- result: 1 2 3 4 5`.
   - **Function**: a function that adds two numbers, called with `2` and `3`. Keep
     `- result: 5`.
   - **String Concatenation**: joins a fixed greeting with the name `"Mary"`. Keep
     `- result: Olá, Mary`.
   - **List**: declares the fixed list `[1, 2, 3]` and sums its elements. Keep
     `- result: 6`.
   - **Boolean Comparison**: evaluates the fixed comparison `idade >= 18` (with
     `idade = 18`). Keep `- result: true` — this is the _declared_ outcome, not necessarily
     the literal text your language prints for a boolean (each language represents booleans
     differently; what matters is the declaration, exactly as already works for Calculation).
   - **Variables**: one basic declaration for each of the three types — `integer`, `string`,
     and `float` — keeping the labels exactly as shown in the template. The `string`
     declaration MUST use the same fixed name `"Mary"` used in the String Concatenation
     section.

   The six sections carrying `- result:` (Calculation, Loop, Function, String Concatenation,
   List, Boolean Comparison) MUST keep that value identical across every language — only the
   code above it changes. This is what makes every language's examples directly comparable.

4. Open a pull request against the GitHub repository with your new file.

If a required section is missing, or a `- result:` doesn't match its expected fixed value, the
site's build will fail with a message pointing exactly at what needs fixing.

## The raw-syntax rule

Every example above MUST be written using the language's own basic, built-in control-flow and
operators for the capability it demonstrates — **never** a convenience function or
standard-library call that performs the operation for you. The goal is a fair, apples-to-apples
comparison: if one language's List example manually loops over `[1, 2, 3]` while another just
calls a built-in "sum a list" function, they aren't actually being compared at the same level,
even though both print `6`.

This applies to Calculation, Loop, String Concatenation, List, and Boolean Comparison. It does
**not** apply to:

- The **Function** example — defining and calling a function is literally what that example is
  meant to demonstrate.
- Whatever minimal statement is needed to print output (e.g., `print`, `echo`,
  `System.out.println`) — there's no raw alternative to producing visible output, and printing
  isn't the capability being demonstrated anyway.

It doesn't matter whether the shortcut you're tempted to use is a separately imported library or
a function built into the language itself — if it's a named, independently-callable function that
does the work for you instead of your own loop/operator, it's not allowed here. A language's own
native statement for an operation (for example, a dedicated string-joining keyword instead of a
`+` operator) is fine — the test is whether the language's own basic grammar expresses the
operation directly, not whether a separately-callable function performs it instead.

**Worked example — summing a list (PHP):**

```php
// ✅ Compliant — manually loops and accumulates, using only basic language syntax
$numbers = [1, 2, 3];
$total = 0;
foreach ($numbers as $n) {
    $total += $n;
}
echo $total;
```

```php
// ❌ Not compliant — delegates the actual summing to a built-in convenience function
$numbers = [1, 2, 3];
echo array_sum($numbers);
```

Both print `6`, but only the first one shows PHP's own raw mechanics for the operation — which is
what makes it comparable to every other language's List example.

**Base your submission directly on the five existing reference languages** (Java, Python, Dart,
ABAP, PHP) under [`content/languages/`](content/languages/). Don't invent a different, more
"modern," or more "efficient" approach than what those reference languages already demonstrate —
consistency across languages matters more than showing off any one language's newer features.

## Running locally before submitting

```bash
npm install
npm run dev
```

Open the local site and confirm your language appears in the list, showing only Hello World by
default, and that expanding it correctly reveals the other eight examples.
