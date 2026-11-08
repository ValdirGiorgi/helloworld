# Contract: Per-page head (title, description, links, previews, JSON-LD)

Produced by the pure function `buildPageHead()` (`src/seo/buildPageHead.js`) and applied with
`useHead()` from `usePageHead()`. The same output is rendered into the prerendered HTML and
updated on client navigation. `SITE = https://helloworld.valdir.dev.br`.

## Titles

New i18n keys live under `seo.*`. Existing keys are reused where they already hold the right text.

| Page | Pattern | pt-BR | en | es |
|---|---|---|---|---|
| home | `header.title` | Hello World em Muitas Linguagens | Hello World in Many Languages | Hello World en Muchos Lenguajes |
| history | `{history.title} — {header.title}` | A história do Hello World — Hello World em Muitas Linguagens | The history of Hello World — Hello World in Many Languages | La historia de Hello World — Hello World en Muchos Lenguajes |
| about | `{about.title} — {header.title}` | Sobre — Hello World em Muitas Linguagens | About — Hello World in Many Languages | Acerca de — Hello World en Muchos Lenguajes |
| language | `seo.language.title` with `{name}` | Hello World em {name} — exemplos de código | Hello World in {name} — code examples | Hello World en {name} — ejemplos de código |
| not found | `seo.notFound.title` | Página não encontrada — Hello World em Muitas Linguagens | Page not found — Hello World in Many Languages | Página no encontrada — Hello World en Muchos Lenguajes |
| root `/` | fixed | — | Hello World in Many Languages — choose your language | — |

## Descriptions

| Page | Key | en (reference wording; pt-BR/es translated at implementation) |
|---|---|---|
| home | `meta.description` (existing) | See how each programming language writes "Hello, World!"… |
| history | `seo.history.description` | Where "Hello, World!" came from: from Brian Kernighan's 1970s tutorials to every language's first program. |
| about | `seo.about.description` | Who built Hello World in Many Languages, how it was made with Spec Kit, and how to contribute a new language. |
| language | `seo.language.description` with `{name}` | Hello World in {name}, plus conditionals, a calculation, a loop, a function, string concatenation, a list, a boolean comparison and variables — side by side. |
| not found | `seo.notFound.description` | The page you are looking for does not exist. |

The history wording must match what `content/history.*.md` actually says; adjust it at
implementation if the article covers other facts.

## Links (indexable pages)

```html
<link rel="canonical" href="{SITE}{path}">
<link rel="alternate" hreflang="pt-BR" href="{SITE}/pt-BR{rest}">
<link rel="alternate" hreflang="en" href="{SITE}/en{rest}">
<link rel="alternate" hreflang="es" href="{SITE}/es{rest}">
<link rel="alternate" hreflang="x-default" href="{SITE}/en{rest}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

Non-indexed documents are the root and the not-found pages, including `language-detail` with an
unknown slug. They have **no** canonical, no alternates, no `og:url` and no JSON-LD. They have
`<meta name="robots" content="noindex, follow">`. Their `og:url` would point at an address that
answers 404 when requested directly.

## Open Graph / Twitter (every document unless noted)

```html
<meta property="og:type" content="website|article">       <!-- website: home, root, not-found; article: history, about, language -->
<meta property="og:site_name" content="{header.title}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{SITE}{path}">             <!-- indexable pages only -->
<meta property="og:locale" content="pt_BR|en_US|es_ES">
<meta property="og:locale:alternate" content="…">         <!-- the other two -->
<meta property="og:image" content="{SITE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{header.title}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="{SITE}/og-image.png">
```

## JSON-LD

Home (each locale):

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{header.title}",
  "url": "{SITE}/{locale}",
  "inLanguage": "{locale}",
  "description": "{meta.description}"
}
```

Language page:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "{title}",
  "name": "{title}",
  "description": "{description}",
  "inLanguage": "{locale}",
  "url": "{SITE}{path}",
  "mainEntityOfPage": "{SITE}{path}",
  "image": "{SITE}/og-image.png",
  "dateModified": "{lastmod}",
  "author": { "@type": "Person", "name": "Valdir Giorgi" },
  "about": { "@type": "ComputerLanguage", "name": "{languageName}" },
  "isPartOf": { "@type": "WebSite", "name": "{header.title}", "url": "{SITE}/{locale}" }
}
```

JSON is serialized with `<` escaped as `<` so content can never close the script tag.

## Invariants (checked by unit tests and `verify-build`)

1. No two catalog pages share a `title`.
2. On indexable pages, `canonical` = `og:url` = the page's own catalog `url`, never derived from
   the request. Non-indexed documents have neither.
3. `<html lang>` = the locale of the path, or `en` for `/` and `/404`.
4. The head contains no `localhost` or relative URL in canonical, alternates, `og:url` or
   `og:image`.
5. On client navigation, all of the above change to the new page's values; no tag from the
   previous page remains (unhead deduplicates by key).
