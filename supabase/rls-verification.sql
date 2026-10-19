-- Run this after schema.sql in Supabase SQL Editor.
-- These checks verify the intended security model. Do not run the write tests
-- against production unless you are comfortable deleting the test rows.

-- 1. Confirm RLS is enabled on every application table.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('ermija_trips', 'ermija_site_settings', 'ermija_bookings', 'ermija_contact_messages')
order by tablename;

-- Expected: rowsecurity = true for all four rows.

-- 2. Review active policies.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
  and (tablename like 'ermija_%' or tablename = 'objects')
order by schemaname, tablename, policyname;

-- 3. Confirm no public read policy exists for private bookings/messages.
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename in ('ermija_bookings', 'ermija_contact_messages')
  and cmd in ('SELECT', 'ALL');

-- Expected for a normal unauthenticated visitor: zero rows returned.
-- Admin reads are allowed by the admin policies when the JWT email is one of
-- the approved admin emails in is_ermija_admin().

-- 4. Confirm the public settings allowlist does not expose arbitrary keys.
select policyname, qual
from pg_policies
where schemaname = 'public'
  and tablename = 'ermija_site_settings';

-- 5. Confirm the booking consent column exists and is required by the insert policy.
select column_name, is_nullable, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'ermija_bookings'
  and column_name = 'consent_accepted_at';

-- 6. Confirm the seat/status function is callable only by authenticated users.
select routine_schema, routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name in ('is_ermija_admin', 'update_ermija_booking_status')
order by routine_name, grantee;
