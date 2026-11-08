# Contract: `public/.htaccess` (Apache 2.4)

Replaces the current SPA fallback (`RewriteRule ^ index.html`). The rules run in this order:

```apache
RewriteEngine On

# 1. Trailing slash → canonical form without it (301). `/` itself never matches (empty per-dir path).
RewriteRule ^(.+)/$ /$1 [R=301,L]

# 2. Not-found documents are reachable only through ErrorDocument, never at 200.
#    REDIRECT_STATUS is empty only on the original request, not on the internal ErrorDocument fetch.
RewriteCond %{ENV:REDIRECT_STATUS} ^$
RewriteRule ^((pt-BR|en|es)/)?404(\.html)?$ - [R=404,L]

# 3. Existing files are served as they are (assets, robots.txt, sitemap.xml, llms.txt, icons, index.html).
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# 4. Clean URL → prerendered flat file (200, no redirect).
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+)$ /$1.html [L]

# 5. Anything else (unknown page, bare directory like /pt-BR/languages) → real 404.
RewriteRule ^(.+)$ - [R=404,L]

# 6. Not-found document per language prefix; English for everything else.
ErrorDocument 404 /404.html
<If "%{REQUEST_URI} =~ m#^/pt-BR(/|$)#">
  ErrorDocument 404 /pt-BR/404.html
</If>
<If "%{REQUEST_URI} =~ m#^/en(/|$)#">
  ErrorDocument 404 /en/404.html
</If>
<If "%{REQUEST_URI} =~ m#^/es(/|$)#">
  ErrorDocument 404 /es/404.html
</If>
```

`%{DOCUMENT_ROOT}` assumes `dist/` is uploaded to the document root, as it is today. If the host
puts the site in a subfolder, replace it with `%{CONTEXT_DOCUMENT_ROOT}` or use a `RewriteBase`.

## Expected responses

| Request | Status | Body / Location |
|---|---|---|
| `/` | 200 | `index.html` (chooser) |
| `/pt-BR` | 200 | `pt-BR.html` |
| `/pt-BR/` | 301 | `Location: /pt-BR` |
| `/pt-BR/languages/rust` | 200 | `pt-BR/languages/rust.html` |
| `/pt-BR/languages/rust/` | 301 | `Location: /pt-BR/languages/rust` |
| `/pt-BR/languages` | 404 | `pt-BR/404.html` |
| `/pt-BR/nao-existe` | 404 | `pt-BR/404.html` |
| `/pt-BR/languages/xyz` | 404 | `pt-BR/404.html` |
| `/es/languages/cobol` | 404 | `es/404.html` |
| `/history`, `/fr/about`, `/pt-br` | 404 | `404.html` (English) |
| `/pt-BR/404`, `/404.html` | 404 | the matching not-found document |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | 200 | the file |
| `/favicon.ico` | 200 | `image/x-icon` |
| `/assets/index-OLDHASH.js` (missing) | 404 | `404.html` |

## Constraints

- Rules 1–5 and the plain `ErrorDocument` need only `AllowOverride FileInfo`. The `<If>` blocks in
  rule 6 need `AllowOverride All`; with only `FileInfo`, Apache answers 500 for the whole site.
- **Fallback when the host does not grant `AllowOverride All`**: drop the three `<If>` blocks and
  keep only `ErrorDocument 404 /404.html`. Every 404 is then served in English, which is the
  hosting exception accepted in spec FR-022 and Assumptions. Status codes and
  every other row of the table above stay the same, except that the "Body" column shows
  `404.html` for the locale-prefixed rows.
- No `DirectorySlash`, `Options` or `DirectoryIndex` changes.
- Rule 4 runs in mod_rewrite's fixup phase, before mod_dir's `DirectorySlash` fixup, so `/pt-BR`
  (also a directory in `dist/`) is never slash-redirected.
