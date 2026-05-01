# Sponsor logos

Ficheiros usados pelo componente [`<Sponsors />`](../../components/sponsors.tsx).

| Ficheiro | Patrocinador | Estado |
|---|---|---|
| `copia.jpg` | Copia Group of Companies, SA | Logo oficial (escudo, fundo branco) |
| `huawei.svg` | Huawei | Placeholder textual — substituir pelo logo oficial |

## Como o componente os mostra
Cada logo aparece dentro de um *cartão branco* arredondado (`<LogoCard>`),
para que funcionem bem sobre o fundo navy do app sem precisarem de fundo transparente.

## Substituir o logo Huawei pelo oficial
1. Coloca o ficheiro oficial em `huawei.svg` ou `huawei.png` neste diretório.
2. Se mudares o nome/extensão, edita a referência em `components/sponsors.tsx`.
3. Recomendado: SVG ou PNG ≥ 512px de largura, fundo transparente ou branco.

## Substituir/atualizar o logo Copia
- Mantém o nome `copia.jpg` (ou troca para `.png`/`.svg` e edita `components/sponsors.tsx`).
- Aspect ratio quadrado funciona melhor com este componente; o escudo atual encaixa perfeitamente.
