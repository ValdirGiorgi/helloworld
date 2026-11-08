# Quickstart: validating pre-rendered pages and per-page SEO

## 0. Baseline (before merging)

Record the production PageSpeed mobile and desktop scores for `/en` and `/pt-BR/languages/rust`
here. They are the floor for SC-009.

| Page | Mobile | Desktop | Date |
|---|---|---|---|
| `/en` | | | |
| `/pt-BR/languages/rust` | | | |

| Unit coverage (`npm run test:coverage`) | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Before (T003) | | | | |
| After (T059) | | | | |

## 1. Automated checks (same as CI)

```bash
npm ci
```

```bash
npm run lint
```

```bash
npm run test:unit
```

```bash
npm run test:e2e
```

```bash
npm run build
```

Expected:
- `test:e2e` runs both Playwright projects (`dev` and `prerendered`), and both pass.
- `npm run build` ends with `verify-build` reporting 44 HTML files (39 catalog + root + 4
  not-found) and no errors. Any failed check exits non-zero. See
  [routes-and-output-contract.md](./contracts/routes-and-output-contract.md).

## 2. Read a page as a crawler (no JavaScript)

```bash
grep -o 'lang="pt-BR"\|<title>[^<]*</title>\|println!(&quot;Hello, World!&quot;)\|println!("Hello, World!")' dist/pt-BR/languages/rust.html
```

Expected: `lang="pt-BR"`, `<title>Hello World em Rust — exemplos de código</title>`, and the
`println!` line (HTML-escaped or not).

## 3. New language → new pages with no other change (SC-008)

Copy any file in `content/languages/` to `content/languages/zz-test.md` and change its `name`.
Run `npm run build`: `verify-build` must report 47 files, and `dist/sitemap.xml` must list 3 more
URLs. Then delete the test file and build again: back to 44 files, and no `zz-test` page or
sitemap entry left.

## 4. Apache rules locally (optional, before the first deploy)

```bash
docker run --rm -d --name hw-httpd -p 8080:80 -v "$PWD/dist":/usr/local/apache2/htdocs:ro httpd:2.4 sh -c "sed -i -e 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' -e 's/AllowOverride None/AllowOverride All/g' conf/httpd.conf && httpd-foreground"
```

This mirrors the usual shared-hosting setting (`AllowOverride All`), which the per-language 404
`<If>` blocks require.

```bash
for p in / /pt-BR /pt-BR/ /pt-BR/languages/rust /pt-BR/languages/rust/ /pt-BR/languages /pt-BR/nao-existe /pt-BR/languages/xyz /history /pt-BR/404 /robots.txt /favicon.ico; do printf '%-26s ' "$p"; curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "http://localhost:8080$p"; done
```

```bash
docker stop hw-httpd
```

Expected: matches the table in [htaccess-contract.md](./contracts/htaccess-contract.md). Also
check that the 404 body is in Portuguese:
`curl -s http://localhost:8080/pt-BR/nao-existe | grep -o '<html lang="[^"]*"'` → `lang="pt-BR"`.

**Stricter host check (`AllowOverride FileInfo`)**: run the same container again, this time
replacing `AllowOverride None` with `AllowOverride FileInfo` in the `sed`, and request `/pt-BR`.
With the `<If>` blocks in `.htaccess`, expect `500`. This confirms that a host granting only
`FileInfo` needs the fallback in [htaccess-contract.md](./contracts/htaccess-contract.md)
(Constraints). After deleting the `<If>` blocks from a copy of `dist/.htaccess`, the same loop must
match the table, except that every 404 body is the English `404.html`.

Before the first US5 deploy, confirm the AllowOverride level with the hosting panel or support.
If it is not `All`, deploy the fallback.

## 5. Production, right after the first deploy (SC-001, SC-005)

```bash
curl -s https://helloworld.valdir.dev.br/pt-BR/languages/rust | grep -o 'Hello World em Rust — exemplos de código\|lang="pt-BR"\|println!' | sort -u
```

```bash
curl -o /dev/null -s -w "%{http_code}\n" https://helloworld.valdir.dev.br/pt-BR/nao-existe
```

```bash
curl -sI https://helloworld.valdir.dev.br/favicon.ico | grep -i 'content-type'
```

Expected: the three strings listed, `404`, `content-type: image/…`. If Cloudflare serves a stale
`200` for an unknown URL, purge the cache for that URL. Cloudflare configuration itself is out of
scope.

## 6. Manual validators (SC-007)

- Google Rich Results Test / Schema Markup Validator on `/pt-BR/languages/rust` and `/en`: 0
  errors.
- An Open Graph validator (e.g. opengraph.xyz or LinkedIn Post Inspector) on
  `/es/languages/python`: shows the page's title, description and the share image.

## 7. Interactive behavior (manual spot check)

On `/pt-BR`:
- search filters the cards;
- "Mostrar mais exemplos" expands and collapses without navigating;
- "Ver todos os exemplos de Rust" opens `/pt-BR/languages/rust` without a full reload (the Network
  panel shows no document request);
- switching to English lands on `/en/languages/rust`, and the tab title changes.

Clear the `site-locale` key in localStorage and open `/`: you land on the language for your
browser region.
