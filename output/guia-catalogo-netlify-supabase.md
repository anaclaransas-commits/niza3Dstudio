# Guia para corrigir o catálogo público no Netlify + Supabase

## Diagnóstico
O problema do seu catálogo é este:
- no navegador do admin, os produtos aparecem porque ficam salvos no `localStorage`
- no navegador do cliente, o catálogo precisa ler de um backend compartilhado
- no seu projeto, esse backend compartilhado é o Supabase
- se o Netlify for publicado sem as variáveis do Supabase, o catálogo público fica vazio em outro navegador

## Onde o projeto espera essas variáveis
Arquivos do projeto:
- `.env.example`
- `.env.supabase.example`
- `src/lib/catalogSupabase.ts`

Variáveis esperadas:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET`
- `VITE_SUPABASE_PRODUCTS_TABLE`
- `VITE_SUPABASE_SETTINGS_TABLE`

Valores padrão usados neste projeto:
- bucket: `catalog-assets`
- tabela de produtos: `catalog_products`
- tabela de configurações: `catalog_settings`

## Onde achar cada variável no Supabase
### 1. `VITE_SUPABASE_URL`
No painel do Supabase:
- abra seu projeto
- vá em `Settings`
- depois em `API`
- copie `Project URL`

Exemplo:
`https://seu-projeto.supabase.co`

### 2. `VITE_SUPABASE_ANON_KEY`
No mesmo lugar:
- `Settings`
- `API`
- procure `Project API keys`
- copie a chave `anon` ou `public anon key`

Use a chave `anon` no frontend. Não use `service_role` no Netlify.

### 3. `VITE_SUPABASE_STORAGE_BUCKET`
Esse valor é o nome do bucket de imagens.
Neste projeto, use:
`catalog-assets`

Você vai ver isso em:
- `Storage`
- bucket `catalog-assets`

### 4. `VITE_SUPABASE_PRODUCTS_TABLE`
Nome da tabela dos produtos publicados.
Neste projeto, use:
`catalog_products`

### 5. `VITE_SUPABASE_SETTINGS_TABLE`
Nome da tabela das configurações visuais do catálogo.
Neste projeto, use:
`catalog_settings`

## Passo 1: configurar o Supabase
1. Abra o Supabase e entre no projeto certo.
2. Vá em `SQL Editor`.
3. Abra o arquivo `supabase/catalog-setup.sql` deste projeto.
4. Copie todo o conteúdo e rode no SQL Editor.

Esse SQL faz 3 coisas:
- cria as tabelas `catalog_settings` e `catalog_products`
- ativa as policies de leitura e escrita para `anon`
- cria o bucket público `catalog-assets`

## Passo 2: conferir se o SQL funcionou
No Supabase, confirme:
- `Table Editor` mostra `catalog_products`
- `Table Editor` mostra `catalog_settings`
- `Storage` mostra `catalog-assets`

## Passo 3: cadastrar as variáveis no Netlify
No Netlify:
1. Abra o site.
2. Vá em `Site configuration`.
3. Vá em `Environment variables`.
4. Clique em `Add variable`.
5. Cadastre estas 5 variáveis:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
VITE_SUPABASE_STORAGE_BUCKET=catalog-assets
VITE_SUPABASE_PRODUCTS_TABLE=catalog_products
VITE_SUPABASE_SETTINGS_TABLE=catalog_settings
```

Observação:
- o arquivo `.env.local` da sua máquina não sobe sozinho para o Netlify
- o Netlify só usa as variáveis cadastradas no painel dele

## Passo 4: fazer novo deploy
Depois de salvar as variáveis:
1. vá em `Deploys`
2. clique em `Trigger deploy`
3. use `Deploy site` ou `Clear cache and deploy site`

Se quiser garantir, use `Clear cache and deploy site`.

## Passo 5: forçar a primeira sincronização
Depois que o deploy terminar:
1. abra o painel admin do site publicado
2. vá em `Produtos`
3. edite qualquer produto e salve
4. ou crie um produto novo
5. abra a tela de `Catálogo`

Isso força o frontend a publicar os dados no Supabase.

## Passo 6: testar do jeito certo
Teste assim:
1. copie o link público do catálogo
2. abra em aba anônima
3. abra também em outro navegador ou no celular
4. confirme se produtos e imagens aparecem

## Se ainda ficar vazio
Verifique nesta ordem:
1. `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão no Netlify
2. o SQL foi executado sem erro no Supabase
3. o bucket `catalog-assets` existe e está público
4. o deploy do Netlify foi refeito depois de cadastrar as variáveis
5. ao salvar um produto no admin, aparece algum alerta de falha de publicação

## Arquivos importantes deste projeto
- `supabase/catalog-setup.sql`
- `SUPABASE_SETUP.md`
- `DEPLOY_NETLIFY.md`
- `.env.example`
- `.env.supabase.example`

## Atalho importante
O seu projeto já tem essas 5 variáveis preenchidas em:
- `.env.local`

Então, para o Netlify, você pode copiar diretamente dali:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET`
- `VITE_SUPABASE_PRODUCTS_TABLE`
- `VITE_SUPABASE_SETTINGS_TABLE`

O que está faltando não é descobrir os valores locais. O que falta é colocar esses mesmos valores no painel do Netlify e redeployar.
