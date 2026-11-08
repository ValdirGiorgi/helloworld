# Contract: `public/.htaccess` (Apache 2.4)

Replaces the current SPA fallback (`RewriteRule ^ index.html`). The rules run in this order:

```apache
# 0. /pt-BR is both dist/pt-BR.html and the directory dist/pt-BR/. Added in T022: without these
#    two lines mod_dir 301s /pt-BR to /pt-BR/ (and rule 1 sends it back). Needs AllowOverride
#    Indexes (research.md §5, "Correction found during T022").
DirectorySlash Off
RewriteEngine On
RewriteOptions AllowNoSlash

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

- Rule 0 (`DirectorySlash Off`) needs `AllowOverride Indexes`; with only `FileInfo` the whole site
  answers 500. Rules 1–5 and the plain `ErrorDocument` need only `AllowOverride FileInfo`. The `<If>` blocks in
  rule 6 need `AllowOverride All`; with only `FileInfo`, Apache answers 500 for the whole site.
- **Fallback when the host does not grant `AllowOverride All`**: drop the three `<If>` blocks and
  keep only `ErrorDocument 404 /404.html`. Every 404 is then served in English, which is the
  hosting exception accepted in spec FR-022 and Assumptions. Status codes and
  every other row of the table above stay the same, except that the "Body" column shows
  `404.html` for the locale-prefixed rows.
- No `Options` or `DirectoryIndex` changes. `DirectorySlash Off` (rule 0) replaces the original
  "no DirectorySlash change" constraint, which the httpd check in T022 showed cannot hold.
- The fallback above (drop the `<If>` blocks) still needs `FileInfo Indexes`. A host with only
  `FileInfo` cannot serve `/pt-BR` with this output layout at all (research.md §5).
- `/pt-BR` (also a directory in `dist/`) is never slash-redirected because of rule 0, not because
  of hook order.
