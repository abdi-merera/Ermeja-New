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

-- Confirms/cancels a booking and changes seats exactly once. Run this updated
-- schema in the SQL editor after deploying the matching client code.
create or replace function public.update_ermija_booking_status(p_booking_id uuid, p_status text)
returns public.ermija_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_row public.ermija_bookings;
  trip_row public.ermija_trips;
  seats integer;
begin
  if not public.is_ermija_admin() then raise exception 'Admin access required'; end if;
  if p_status not in ('New', 'Confirmed', 'Cancelled') then raise exception 'Invalid booking status'; end if;

  select * into booking_row from public.ermija_bookings where id = p_booking_id for update;
  if not found then raise exception 'Booking not found'; end if;
  select * into trip_row from public.ermija_trips where id = booking_row.trip_id for update;
  if not found then raise exception 'Trip not found'; end if;
  seats := greatest(coalesce((trip_row.payload ->> 'availableSeats')::integer, 0), 0);

  if booking_row.status <> 'Confirmed' and p_status = 'Confirmed' then
    if seats < booking_row.number_of_people then raise exception 'Not enough seats available'; end if;
    update public.ermija_trips set payload = jsonb_set(payload, '{availableSeats}', to_jsonb(seats - booking_row.number_of_people)), updated_at = now() where id = trip_row.id;
  elsif booking_row.status = 'Confirmed' and p_status <> 'Confirmed' then
    update public.ermija_trips set payload = jsonb_set(payload, '{availableSeats}', to_jsonb(seats + booking_row.number_of_people)), updated_at = now() where id = trip_row.id;
  end if;

  update public.ermija_bookings set status = p_status, updated_at = now() where id = p_booking_id returning * into booking_row;
  return booking_row;
end;
$$;

revoke all on function public.update_ermija_booking_status(uuid, text) from public;
grant execute on function public.update_ermija_booking_status(uuid, text) to authenticated;

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

-- Run in Supabase SQL Editor to enforce booking availability at the database.
create or replace function public.validate_ermija_booking_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_trip public.ermija_trips;
begin
  select * into selected_trip from public.ermija_trips where id = new.trip_id for update;
  if not found or selected_trip.status <> 'Published' then
    raise exception 'This trip is not open for booking.';
  end if;
  if selected_trip.date < (now() at time zone 'Africa/Addis_Ababa')::date then
    raise exception 'This trip has already departed.';
  end if;
  if coalesce((selected_trip.payload ->> 'availableSeats')::integer, 0) < new.number_of_people then
    raise exception 'Not enough seats are available for this request.';
  end if;
  if new.status <> 'New' then
    raise exception 'New booking requests must await confirmation.';
  end if;
  return new;
end;
$$;
revoke all on function public.validate_ermija_booking_request() from public;
drop trigger if exists validate_ermija_booking_request on public.ermija_bookings;
create trigger validate_ermija_booking_request
before insert on public.ermija_bookings
for each row execute function public.validate_ermija_booking_request();
