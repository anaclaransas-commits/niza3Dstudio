# Supabase Setup

Use este caminho quando o painel estiver publicado como site estático e você quiser que os produtos e imagens apareçam automaticamente no catálogo do cliente.

## 1. Variáveis de ambiente

Preencha no `.env` local e também no host do frontend:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_SUPABASE_STORAGE_BUCKET=catalog-assets
VITE_SUPABASE_PRODUCTS_TABLE=catalog_products
VITE_SUPABASE_SETTINGS_TABLE=catalog_settings
```

## 2. SQL das tabelas

Execute este SQL no Supabase SQL Editor:

```sql
create table if not exists public.catalog_settings (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_products (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);
```

## 3. Bucket de imagens

Crie um bucket público chamado `catalog-assets`.

Se quiser outro nome, troque em `VITE_SUPABASE_STORAGE_BUCKET`.

O arquivo [catalog-setup.sql](/C:/Users/Isaac/Desktop/3dprint%20app/3dprint-master-manager/supabase/catalog-setup.sql) já cria esse bucket e as políticas básicas.

## 4. Políticas mínimas

Para um catálogo simples sem login, as políticas precisam permitir leitura e escrita com a chave `anon`.

Exemplo direto:

```sql
alter table public.catalog_settings enable row level security;
alter table public.catalog_products enable row level security;

create policy "catalog_settings_public_rw"
on public.catalog_settings
for all
to anon
using (true)
with check (true);

create policy "catalog_products_public_rw"
on public.catalog_products
for all
to anon
using (true)
with check (true);
```

Para o bucket, permita pelo menos `select`, `insert` e `update`. O SQL pronto já faz isso para o bucket `catalog-assets`.

## 5. Observação importante

Esse modo é prático, mas não é o mais seguro para um painel administrativo aberto. O ideal, depois, é proteger escrita com autenticação ou mover as operações sensíveis para backend.

## 6. Primeiro sincronismo

Na primeira vez que abrir o painel com as variáveis do Supabase preenchidas:

- se o Supabase ainda estiver vazio, o app publica para lá os produtos e configurações que já estão no navegador atual
- depois disso, o link público do cliente passa a ler do Supabase
