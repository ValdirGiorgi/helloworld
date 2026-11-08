# Hello World in Many Languages

A static site collecting "Hello, World!" — and a bit more — across several programming languages
(currently: Java, Python, Dart, ABAP, PHP, TypeScript, Rust, Go, C, and Assembly), along with the history behind that tradition. Each
language shows Hello World by default and, when expanded, also reveals a conditional, a simple
calculation, and basic variable declarations, to compare syntax across languages side by side.

Hosted at [helloworld.valdir.dev.br](https://helloworld.valdir.dev.br) and maintained in this
GitHub repository — contributions of new languages are welcome, see
[CONTRIBUTING.md](CONTRIBUTING.md).

This project was built following the [GitHub Spec Kit](https://github.com/github/spec-kit)
workflow (spec → plan → tasks → implement); the feature artifacts live under
[specs/001-hello-world-multilang-site](specs/001-hello-world-multilang-site).

## Stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Each language's content lives in Markdown (`content/languages/*.md`), read at build time — no
  database, no backend
- [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/) (unit tests)
  and [Playwright](https://playwright.dev/) (e2e tests)
- Automatic deploy via GitHub Actions + FTP on every push to `main`

## Local development

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test:unit   # Vitest
npm run test:e2e    # Playwright
```

## Production build

```bash
npm run build       # generates dist/ (static files)
npm run preview     # serves the generated build locally
```

The build pre-renders every page (with [vite-ssg](https://github.com/antfu-collective/vite-ssg))
into its own HTML file — each home, history, about and language page in all three interface
languages, plus the root language chooser and one not-found page per language — so crawlers and
link previews get the real content, title, description and structured data without running
JavaScript. It then runs `scripts/verify-build.mjs`, which fails the build (and so the deploy) if
any page is missing, untranslated, duplicated or inconsistent with the sitemap.

## Adding a language

See [CONTRIBUTING.md](CONTRIBUTING.md) — copy
[`content/language-template.md`](content/language-template.md), fill it in, and open a pull
request. The new file alone gives the language its own page in each interface language
(`/pt-BR/languages/<slug>`, `/en/languages/<slug>`, `/es/languages/<slug>`) and its sitemap
entries; no other change is needed.

All examples are written entirely in English (messages, strings, and identifier names), whatever
the interface language — see
[The English-only rule](CONTRIBUTING.md#the-english-only-rule).
