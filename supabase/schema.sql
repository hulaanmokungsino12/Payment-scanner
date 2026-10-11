-- Run this in Supabase SQL Editor before using registration/login.
-- Public registration always creates a staff profile; never accept a role from the client.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- A signed-in user can read only their own profile.
create policy "Users can read own profile" on public.profiles
for select to authenticated using (auth.uid() = id);

-- Do not grant users the ability to change their own role.
-- Role promotion should be performed by the project owner using the SQL Editor.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- Initial setup: after you register your account, run this with your account email.
-- Replace owner@example.com with your actual email:
-- update public.profiles p set role = 'admin'
-- from auth.users u where p.id = u.id and u.email = 'owner@example.com';

-- Shared order table used by the app for cloud-backed order CRUD.
-- AsyncStorage is retained only for Supabase Auth session persistence and one-time legacy import.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer text not null check (length(trim(customer)) > 0),
  payment_method text not null check (payment_method in ('GCash','Cash','Unknown')),
  items jsonb not null default '[]'::jsonb,
  paid boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "Staff and admins can read business orders" on public.orders
for select to authenticated using (public.current_user_role() in ('admin','staff'));

create policy "Staff and admins can create business orders" on public.orders
for insert to authenticated with check (public.current_user_role() in ('admin','staff') and created_by = auth.uid());

create policy "Staff and admins can update business orders" on public.orders
for update to authenticated using (public.current_user_role() in ('admin','staff'))
with check (public.current_user_role() in ('admin','staff'));

create policy "Only admins can delete business orders" on public.orders
for delete to authenticated using (public.current_user_role() = 'admin');
