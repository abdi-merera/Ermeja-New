-- Run this file once in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create or replace function public.is_ermija_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'abdimerera@gmail.com',
    'amanuelbereket330@gmail.com'
  );
$$;

create table if not exists public.ermija_trips (
  id text primary key,
  status text not null check (status in ('Draft', 'Published')),
  date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- If this project already contains an older table with this name, add the
-- fields used by the current application without deleting existing rows.
alter table public.ermija_trips add column if not exists status text not null default 'Draft';
alter table public.ermija_trips add column if not exists date date not null default current_date;
alter table public.ermija_trips add column if not exists payload jsonb not null default '{}'::jsonb;

create table if not exists public.ermija_site_settings (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ermija_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.ermija_trips(id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  number_of_people integer not null check (number_of_people between 1 and 100),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ermija_bookings add column if not exists status text not null default 'New';

create table if not exists public.ermija_contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  email text not null default '' check (char_length(email) <= 200),
  message text not null check (char_length(message) between 2 and 2000),
  status text not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ermija_contact_messages add column if not exists status text not null default 'New';

alter table public.ermija_trips enable row level security;
alter table public.ermija_site_settings enable row level security;
alter table public.ermija_bookings enable row level security;
alter table public.ermija_contact_messages enable row level security;

drop policy if exists "Published trips are public" on public.ermija_trips;
create policy "Published trips are public" on public.ermija_trips for select
using (status = 'Published' or public.is_ermija_admin());
drop policy if exists "Admins manage trips" on public.ermija_trips;
create policy "Admins manage trips" on public.ermija_trips for all
using (public.is_ermija_admin()) with check (public.is_ermija_admin());

drop policy if exists "Settings are public" on public.ermija_site_settings;
create policy "Settings are public" on public.ermija_site_settings for select using (true);
drop policy if exists "Admins manage settings" on public.ermija_site_settings;
create policy "Admins manage settings" on public.ermija_site_settings for all
using (public.is_ermija_admin()) with check (public.is_ermija_admin());

drop policy if exists "Anyone can create bookings" on public.ermija_bookings;
create policy "Anyone can create bookings" on public.ermija_bookings for insert with check (status = 'New');
drop policy if exists "Admins manage bookings" on public.ermija_bookings;
create policy "Admins manage bookings" on public.ermija_bookings for all
using (public.is_ermija_admin()) with check (public.is_ermija_admin());

drop policy if exists "Anyone can send contact messages" on public.ermija_contact_messages;
create policy "Anyone can send contact messages" on public.ermija_contact_messages for insert with check (status = 'New');
drop policy if exists "Admins manage contact messages" on public.ermija_contact_messages;
create policy "Admins manage contact messages" on public.ermija_contact_messages for all
using (public.is_ermija_admin()) with check (public.is_ermija_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-images', 'trip-images', true, 6291456, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 6291456,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads trip images" on storage.objects;
create policy "Public reads trip images" on storage.objects for select
using (bucket_id = 'trip-images');
drop policy if exists "Admins upload trip images" on storage.objects;
create policy "Admins upload trip images" on storage.objects for insert
with check (bucket_id = 'trip-images' and public.is_ermija_admin());
drop policy if exists "Admins update trip images" on storage.objects;
create policy "Admins update trip images" on storage.objects for update
using (bucket_id = 'trip-images' and public.is_ermija_admin());
drop policy if exists "Admins delete trip images" on storage.objects;
create policy "Admins delete trip images" on storage.objects for delete
using (bucket_id = 'trip-images' and public.is_ermija_admin());
