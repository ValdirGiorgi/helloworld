# Documentation Contract: Raw-Syntax Contribution Standard

This feature's only "interface" is the required content shape of two documents. No code contract
applies (plan.md: no application code is touched). Documented here so the actual edits (tasks.md)
and the quickstart validation agree on the exact required shape before writing prose.

## `CONTRIBUTING.md` (English, rewritten)

MUST contain, in addition to its existing step-by-step structure (copy template → fill sections →
open PR → local verification):

1. **A explicit raw-syntax rule statement**, placed where the six `- result:` sections are already
   introduced (the existing "As seis seções..." paragraph's English equivalent), stating: every
   example demonstrating a specific capability MUST use the language's own basic control-flow/
   operators for that capability, not a convenience function or library call — data-model.md
   `RawSyntaxRule.statement`.
2. **The two stated exemptions**, called out explicitly so they aren't mistaken for loopholes:
   the Function example (defining/calling a function is its own point) and unavoidable output
   statements — `RawSyntaxRule.exemptions`.
3. **One worked contrast example**: a compliant (raw loop) vs. non-compliant (convenience function)
   snippet for summing a list, using one of the three languages research.md §2 found non-compliant
   (e.g., PHP's corrected List example next to its old `array_sum()` form, explicitly labeled which
   is acceptable and which is not) — `RawSyntaxRule.contrastExample`.
4. **An instruction to model new submissions on the five reference languages**, and not to invent a
   different/"more efficient" approach — `RawSyntaxRule.modelLanguages`.

MUST NOT contain any non-English sentence (data-model.md `PublicDocument` validation rule).

## `README.md` (English, rewritten)

MUST preserve its existing sections and meaning (project description, stack, local development,
tests, production build, "adding a language" pointer to `CONTRIBUTING.md`), translated to English.
No new content is required here beyond the language change — the raw-syntax rule itself belongs in
`CONTRIBUTING.md`, not the README.

MUST NOT contain any non-English sentence.

## `content/language-template.md` (already English — instructional comment added)

MUST gain one additional instructional HTML comment (in the same style as the file's existing
per-section comments) stating the raw-syntax rule at the point where a contributor is about to write
code — placed near the top-of-file contributor instructions (alongside the existing numbered
"How to add a new language" comment block) so it is seen before any section-specific comment, per
spec.md FR-009. Existing section headings, `- result:` values, and placeholder text are unchanged.

## `content/languages/{php,python,dart}.md` (List section rewritten)

Each file's **List** section MUST be changed to:
- Keep `- result: 6` exactly as-is (data-model.md `ReferenceLanguageExample` validation rule).
- Replace its convenience-function call (`array_sum()` / `sum()` / `.reduce()`) with a manual loop
  that declares a running-total variable, iterates the fixed list `[1, 2, 3]`, and accumulates the
  sum into that variable before printing it — mirroring the shape already used by
  `content/languages/java.md` and `content/languages/abap.md`'s compliant List sections.
- Leave every other section of the file (Hello World, Conditional, Calculation, Loop, Function,
  String Concatenation, Boolean Comparison, Variables) byte-for-byte unchanged.
