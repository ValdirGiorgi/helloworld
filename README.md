# Hello World in Many Languages

A static site collecting "Hello, World!" — and a bit more — across several programming languages
(currently: Java, Python, Dart, ABAP, PHP, TypeScript, Rust, and Go), along with the history behind that tradition. Each
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

## Adding a language

See [CONTRIBUTING.md](CONTRIBUTING.md) — copy
[`content/language-template.md`](content/language-template.md), fill it in, and open a pull
request.

All examples are written entirely in English (messages, strings, and identifier names), whatever
the interface language — see
[The English-only rule](CONTRIBUTING.md#the-english-only-rule).
