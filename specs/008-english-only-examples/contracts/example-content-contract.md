# Contract: English-Only Example Content

Applies to every file in `content/languages/` and to `content/language-template.md`. Supersedes
only the wording rules in `specs/001-hello-world-multilang-site/contracts/language-template.md`;
everything else there (nine sections, headings, `- result:` lines, variables) is unchanged.

## Rule

All text inside an example — string literals, printed messages, identifier names, and the declared
`- result:` — MUST be English. Accented characters are therefore never required inside examples.
Interface text (labels, buttons, page copy) is out of scope and stays localized.

## Fixed values (identical in every language)

| Example | Requirement |
|---------|-------------|
| Conditional | `number` set to 10; prints `Greater than 5` if `number > 5`, otherwise `Less than or equal to 5` |
| String Concatenation | greeting `Hello, ` + name `Mary`; declared `- result: Hello, Mary` |
| Function | function named `add`, called with `2` and `3`; declared `- result: 5` |
| Boolean Comparison | identifier `age` = `18`; evaluates `age >= 18`; declared `- result: true` |
| Variables → string | `name` = `"Mary"` (unchanged) |

Allowed variation: only what the language itself forces (identifier casing such as a leading `$`
in PHP, keyword and quoting style, how a boolean prints). The English word is never translated or
replaced by a synonym.

## Before → after, per language

Only the changed lines are shown. Everything else in each file is untouched (FR-006).

| Language | Conditional messages | Function | String Concatenation | Boolean |
|----------|----------------------|----------|----------------------|---------|
| Java | `System.out.println("Greater than 5")` / `"Less than or equal to 5"` | `int add(int a, int b)`; `add(2, 3)` | `"Hello, " + name`; `- result: Hello, Mary` | `int age = 18;` … `age >= 18` |
| Python | `print("Greater than 5")` / `print("Less than or equal to 5")` | `def add(a, b)`; `add(2, 3)` | `"Hello, " + name` | `age = 18`; `print(age >= 18)` |
| Dart | `print('Greater than 5')` / `print('Less than or equal to 5')` | `int add(int a, int b)`; `add(2, 3)` | `'Hello, ' + name` | `var age = 18;` … `age >= 18` |
| ABAP | `WRITE: 'Greater than 5'.` / `WRITE: 'Less than or equal to 5'.` | `FORM add USING …`; `PERFORM add USING 2 3 …` | `CONCATENATE 'Hello, ' name INTO greeting.` | `DATA age TYPE i VALUE 18.` `IF age >= 18.` |
| PHP | `echo "Greater than 5";` / `echo "Less than or equal to 5";` | `function add($a, $b)`; `add(2, 3)` | `"Hello, " . $name` | `$age = 18;` … `$age >= 18` |
| TypeScript | `console.log('Greater than 5')` / `console.log('Less than or equal to 5')` | `function add(a: number, b: number): number`; `add(2, 3)` | `'Hello, ' + name` | `const age: number = 18;` … `age >= 18` |
| Rust | `println!("Greater than 5")` / `println!("Less than or equal to 5")` | `fn add(a: i32, b: i32) -> i32`; `add(2, 3)` | `println!("Hello, {}", name)` | `let age = 18;` … `age >= 18` |
| Go | `fmt.Println("Greater than 5")` / `fmt.Println("Less than or equal to 5")` | `func add(a int, b int) int`; `add(2, 3)` | `"Hello, " + name` | `age := 18` … `age >= 18` |

The declared `- result:` for String Concatenation is `Hello, Mary` in all eight files.

## Machine checks

1. `parseLanguageFile()` (unchanged mechanism, new constant) rejects any String Concatenation
   whose declared result is not `Hello, Mary`, with the message
   `Language file "<file>" declares "String Concatenation" result "<found>", but every language MUST report "Hello, Mary" for this example …`.
2. `tests/unit/languageContent.spec.js` asserts, for every real language file and the template,
   that none of the deny-listed tokens (`Olá`, `Maior que`, `Menor ou igual`, `somar`, `idade`)
   appear, and that the four fixed values above are present in the corresponding sections.
