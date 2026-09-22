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
