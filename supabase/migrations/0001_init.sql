-- ============================================================================
-- rumamu - 0001_init.sql
-- Schema, indexes, Row Level Security, admin helper, auth trigger, storage.
--
-- PK note: the brief mandates uuid primary keys, so we use them here.
-- (Supabase Postgres best practice would otherwise favour bigint identity or
--  uuidv7 to avoid index fragmentation; at this catalog size it is negligible.)
-- ============================================================================

create extension if not exists pgcrypto;

-- Private schema (NOT exposed to the Data API) for the admin-check helper.
create schema if not exists private;

-- Sequence backing the human-readable order number RUM-2026-XXXXXX.
create sequence if not exists public.order_number_seq start 100001;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  slug text unique not null,
  category_id uuid references public.categories (id) on delete set null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  dimensions text,
  description text,
  image_url text,
  status text not null default 'Tersedia',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address text not null,
  city text not null,
  postal_code text not null,
  order_note text,
  shipping_method text not null,
  shipping_fee numeric(12, 2) not null default 0,
  payment_method text not null,
  payment_status text not null default 'Menunggu Pembayaran (Simulasi)',
  order_status text not null default 'Menunggu Konfirmasi Simulasi',
  subtotal numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  subtotal numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (foreign keys + columns used in filters / RLS)
-- ---------------------------------------------------------------------------
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Admin check helper.
-- SECURITY DEFINER + search_path='' so it bypasses RLS on profiles (no policy
-- recursion) and always checks the *calling* user's identity. Kept in the
-- private schema (not exposed to the Data API). Execute granted only to
-- authenticated, since only authenticated users (admins) trigger it via policy.
-- ---------------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up.
-- Without this trigger, profiles is never populated and admin login breaks.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles: a user reads their own row; admins read all + manage.
create policy "profiles_select_self_or_admin" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));

create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- categories: public read; admin full control.
create policy "categories_public_read" on public.categories
  for select to anon, authenticated
  using (true);

create policy "categories_admin_all" on public.categories
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- products: public reads ACTIVE only; admin reads all + full control.
create policy "products_public_read_active" on public.products
  for select to anon, authenticated
  using (is_active = true);

create policy "products_admin_all" on public.products
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- orders / order_items: only admins touch the tables directly.
-- Customers create + read their own order through SECURITY DEFINER RPCs
-- (see 0002), so anon never gets blanket table access.
create policy "orders_admin_all" on public.orders
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "order_items_admin_all" on public.order_items
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Table grants (RLS still governs which rows are visible).
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant select, insert, update, delete on public.orders, public.order_items to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: product-images bucket (public read, admin write).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));

create policy "product_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));

create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));
