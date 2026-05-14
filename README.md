# 3DPrint Master Manager

Aplicacao web para gestao de operacoes de impressao 3D, com foco em:

- orcamentos e acompanhamento de status
- cadastro de clientes, produtos, insumos e canais
- catalogo visual de produtos
- relatorios e indicadores operacionais
- importacao de catalogo a partir de pastas locais de imagens

## Estado atual

O projeto roda como SPA em React + Vite e hoje persiste os dados localmente no navegador. Isso facilita validacao de fluxo e interface, mas ainda nao substitui um backend com autenticacao, banco e armazenamento de arquivos.

## Como rodar localmente

Prerequisitos:
- Node.js 18+

Passos:
1. Instale as dependencias com `npm install`
2. Rode o ambiente local com `npm run dev`
3. Gere build de producao com `npm run build`
4. Valide tipos com `npm run lint`

## Estrutura principal

- `src/components`: telas principais do produto
- `src/store.ts`: estado global e persistencia local
- `src/lib/utils.ts`: utilitarios de calculo, CSV e formatacao
- `src/types.ts`: contratos de dominio

## Proximos passos recomendados

- conectar catalogo de modelos a arquivos STL/3MF e metadados
- migrar persistencia para backend com autenticacao e backup
- evoluir o fluxo de pedido para producao, envio e entrega
- aprofundar o motor financeiro da calculadora

## Deploy no Netlify

Este projeto já está preparado para deploy no Netlify via arquivo `netlify.toml`.

Resumo:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: habilitado (`/*` para `/index.html`)

Guia rápido:
- Veja [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)
