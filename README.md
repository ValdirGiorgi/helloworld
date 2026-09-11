# Hello World em Muitas Linguagens

Um site estático que reúne o "Hello, World!" — e um pouco mais — em várias linguagens de
programação (hoje: Java, Python, Dart, ABAP e PHP), além da história por trás dessa tradição.
Cada linguagem mostra o Hello World por padrão e, ao expandir, revela também um condicional,
um cálculo simples e declarações básicas de variáveis, para comparar a sintaxe entre
linguagens lado a lado.

Hospedado em [helloworld.valdir.dev.br](https://helloworld.valdir.dev.br) e mantido neste
repositório GitHub — contribuições de novas linguagens são bem-vindas, veja
[CONTRIBUTING.md](CONTRIBUTING.md).

Este projeto foi desenvolvido seguindo o fluxo do
[GitHub Spec Kit](https://github.com/github/spec-kit) (spec → plan → tasks → implement); os
artefatos da funcionalidade estão em
[specs/001-hello-world-multilang-site](specs/001-hello-world-multilang-site).

## Stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Conteúdo de cada linguagem em Markdown (`content/languages/*.md`), lido em tempo de build —
  sem banco de dados, sem backend
- [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/) (testes
  unitários) e [Playwright](https://playwright.dev/) (testes e2e)
- Deploy automático via GitHub Actions + FTP a cada push na `main`

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Testes

```bash
npm run test:unit   # Vitest
npm run test:e2e    # Playwright
```

## Build de produção

```bash
npm run build       # gera dist/ (arquivos estáticos)
npm run preview     # serve o build gerado localmente
```

## Adicionando uma linguagem

Veja [CONTRIBUTING.md](CONTRIBUTING.md) — basta copiar
[`content/language-template.md`](content/language-template.md), preencher e abrir um pull
request.
