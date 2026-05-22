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

alter table public.catalog_settings enable row level security;
alter table public.catalog_products enable row level security;

drop policy if exists "catalog_settings_public_rw" on public.catalog_settings;
create policy "catalog_settings_public_rw"
on public.catalog_settings
for all
to anon
using (true)
with check (true);

drop policy if exists "catalog_products_public_rw" on public.catalog_products;
create policy "catalog_products_public_rw"
on public.catalog_products
for all
to anon
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('catalog-assets', 'catalog-assets', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "catalog_assets_public_read" on storage.objects;
create policy "catalog_assets_public_read"
on storage.objects
for select
to public
using (bucket_id = 'catalog-assets');

drop policy if exists "catalog_assets_anon_insert" on storage.objects;
create policy "catalog_assets_anon_insert"
on storage.objects
for insert
to anon
with check (bucket_id = 'catalog-assets');

drop policy if exists "catalog_assets_anon_update" on storage.objects;
create policy "catalog_assets_anon_update"
on storage.objects
for update
to anon
using (bucket_id = 'catalog-assets')
with check (bucket_id = 'catalog-assets');
