# Contribuindo com uma nova linguagem

Este site é mantido como um projeto de código aberto e cresce com a contribuição da
comunidade. Adicionar uma nova linguagem não exige tocar em nenhum código do site — apenas
preencher um arquivo Markdown.

## Passo a passo

1. Copie [`content/language-template.md`](content/language-template.md) para
   `content/languages/<slug-da-linguagem>.md`. O **nome do arquivo** é o identificador único
   da linguagem (a URL da linguagem no site é derivada dele), então use letras minúsculas e
   hífens — por exemplo `java.md`, `c-sharp.md`.
2. Preencha o campo `name` no frontmatter com o nome de exibição da linguagem.
3. Preencha as nove seções, mantendo os títulos exatamente como estão (o site usa esses
   títulos para ler o conteúdo):
   - **Hello World**: o programa que imprime "Hello, World!" (ou o idioma equivalente da
     linguagem).
   - **Conditional**: um condicional simples (if/else ou equivalente).
   - **Calculation**: calcula a equação fixa `(1 + 1) * 2`. Mantenha a linha `- result: 4`
     exatamente como está.
   - **Loop**: conta de 1 a 5. Mantenha `- result: 1 2 3 4 5`.
   - **Function**: uma função que soma dois números, chamada com `2` e `3`. Mantenha
     `- result: 5`.
   - **String Concatenation**: junta uma saudação fixa com o nome `"Mary"`. Mantenha
     `- result: Olá, Mary`.
   - **List**: declara a lista fixa `[1, 2, 3]` e soma os elementos. Mantenha `- result: 6`.
   - **Boolean Comparison**: avalia a comparação fixa `idade >= 18` (com `idade = 18`).
     Mantenha `- result: true` — essa é a saída _declarada_, não necessariamente o texto
     literal que sua linguagem imprime para um booleano (cada linguagem representa booleanos
     de um jeito; o que importa é a declaração, igual já funciona para o Calculation).
   - **Variables**: uma declaração básica para cada um dos três tipos — `integer`, `string`
     e `float` — mantendo os rótulos exatamente como no modelo. A declaração `string` MUST
     usar o mesmo nome fixo `"Mary"` usado na seção String Concatenation.

   As seis seções com `- result:` (Calculation, Loop, Function, String Concatenation, List,
   Boolean Comparison) precisam manter esse valor idêntico em toda linguagem — só o código
   acima muda. É isso que torna os exemplos comparáveis entre linguagens.

4. Abra um pull request no repositório do GitHub com o novo arquivo.

Se alguma seção obrigatória estiver ausente ou algum `- result:` não bater com o valor fixo
esperado, a construção do site falhará com uma mensagem apontando exatamente o que falta
corrigir.

## Rodando localmente antes de enviar

```bash
npm install
npm run dev
```

Abra o site local e confirme que sua linguagem aparece na lista, mostrando apenas o Hello
World por padrão, e que expandi-la revela os outros oito exemplos corretamente.
