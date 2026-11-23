-- ============================================================
-- FinTrack · Esquema inicial (Postgres / Supabase)
-- Migración 001 · aplicar con: npx supabase db push
-- ============================================================

-- ------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  currency text not null default 'USD' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  type text not null default 'checking'
    check (type in ('checking', 'savings', 'cash', 'credit', 'investment')),
  currency text not null default 'USD' check (char_length(currency) = 3),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- El saldo actual es la suma de las transacciones no anuladas de la cuenta:
--   opening (con signo)
--   + income
--   - expense
--   - transferencias salientes
--   + transferencias entrantes

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  kind text not null check (kind in ('income', 'expense')),
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name, kind)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null,
  category_id uuid references public.categories (id) on delete set null,
  transfer_account_id uuid,
  type text not null check (type in ('income', 'expense', 'transfer', 'opening')),
  amount numeric(14, 2) not null,
  description text not null,
  notes text,
  payee text,
  receipt_path text,
  occurred_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_account_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete cascade,
  constraint transactions_transfer_account_fk
    foreign key (transfer_account_id, user_id)
    references public.accounts (id, user_id)
    on delete cascade,
  constraint transactions_shape_check check (
    (type = 'opening'
      and amount <> 0
      and transfer_account_id is null
      and category_id is null)
    or (type in ('income', 'expense')
      and amount > 0
      and transfer_account_id is null)
    or (type = 'transfer'
      and amount > 0
      and transfer_account_id is not null
      and transfer_account_id <> account_id
      and category_id is null)
  )
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------

create index if not exists accounts_user_id_idx on public.accounts (user_id);
create index if not exists categories_user_id_idx on public.categories (user_id);
create index if not exists transactions_user_occurred_idx
  on public.transactions (user_id, occurred_at desc)
  where deleted_at is null;
create index if not exists transactions_account_idx on public.transactions (account_id);
create index if not exists transactions_category_idx on public.transactions (category_id);

-- ------------------------------------------------------------
-- updated_at automático
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Perfil automático al registrarse
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Perfiles para usuarios que ya existían antes de este esquema
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Crear cuenta + saldo inicial (atómico)
-- ------------------------------------------------------------

create or replace function public.create_account(
  p_name text,
  p_type text default 'checking',
  p_currency text default 'USD',
  p_initial_balance numeric default 0
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_account_id uuid;
begin
  insert into public.accounts (user_id, name, type, currency)
  values (auth.uid(), p_name, p_type, p_currency)
  returning id into v_account_id;

  if p_initial_balance <> 0 then
    insert into public.transactions
      (user_id, account_id, type, amount, description)
    values
      (auth.uid(), v_account_id, 'opening', p_initial_balance, 'Saldo inicial');
  end if;

  return v_account_id;
end;
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using ((select auth.uid()) = id);

-- accounts
drop policy if exists "accounts_select_own" on public.accounts;
create policy "accounts_select_own" on public.accounts
  for select using ((select auth.uid()) = user_id);

drop policy if exists "accounts_insert_own" on public.accounts;
create policy "accounts_insert_own" on public.accounts
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "accounts_update_own" on public.accounts;
create policy "accounts_update_own" on public.accounts
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "accounts_delete_own" on public.accounts;
create policy "accounts_delete_own" on public.accounts
  for delete using ((select auth.uid()) = user_id);

-- categories
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select using ((select auth.uid()) = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using ((select auth.uid()) = user_id);

-- transactions
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using ((select auth.uid()) = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete using ((select auth.uid()) = user_id);


