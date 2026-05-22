# 3DPrint Master Manager

Aplicacao web para gestao de operacoes de impressao 3D, com foco em:

- orcamentos e acompanhamento de status
- cadastro de clientes, produtos, insumos e canais
- catalogo visual de produtos
- relatorios e indicadores operacionais
- importacao de catalogo a partir de pastas locais de imagens

## Estado atual

O projeto roda como SPA em React + Vite. O catálogo compartilhado pode funcionar de duas formas:

- API Node local/remota atendendo `/api` e `/uploads`
- Supabase configurado direto no frontend para produtos, configuracoes e imagens

Sem uma dessas opcoes, o app continua funcionando no navegador atual com `localStorage`, mas o link publico do cliente nao recebe as alteracoes automaticamente.

## Como rodar localmente

Prerequisitos:
- Node.js 18+

Passos:
1. Instale as dependencias com `npm install`
2. Rode o frontend com `npm run dev`
3. Escolha uma forma de publicacao compartilhada:
   - rode a API do catálogo em outro terminal com `npm run dev:server`
   - ou configure as variaveis do Supabase mostradas em `.env.example`
4. Gere build de producao com `npm run build`
5. Valide tipos com `npm run lint`

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

## Supabase para site estatico

Se o painel estiver publicado sem a API Node, configure o Supabase para que:

- o cadastro de produtos publique no link do cliente
- as imagens enviadas fiquem acessiveis por URL publica
- o catalogo continue funcionando no Netlify/Vercel sem backend proprio

Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para criar as tabelas e o bucket.

## Deploy no Netlify

Este projeto já está preparado para deploy no Netlify via arquivo `netlify.toml`.

Resumo:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: habilitado (`/*` para `/index.html`)

Guia rápido:
- Veja [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)
