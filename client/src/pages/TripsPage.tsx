import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Compass, Filter, Gauge, MessageCircle, Search, Ticket, Users } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import { TripCard } from "../components/TripCard";
import type { Trip } from "../types";
import { formatDate, formatPrice } from "../utils";

type TripFilter = "All" | string;

const allFilter = "All";

function uniqueValues(values: string[]) {
  return [allFilter, ...Array.from(new Set(values.filter(Boolean)))] as TripFilter[];
}

export function TripsPage({ trips, chooseTrip }: { trips: Trip[]; chooseTrip: (trip: Trip) => void }) {
  const [difficulty, setDifficulty] = useState<TripFilter>(allFilter);
  const [duration, setDuration] = useState<TripFilter>(allFilter);
  const [query, setQuery] = useState("");

  const difficultyOptions = useMemo(() => uniqueValues(trips.map((trip) => trip.difficulty)), [trips]);
  const durationOptions = useMemo(() => uniqueValues(trips.map((trip) => trip.duration)), [trips]);

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const matchesDifficulty = difficulty === allFilter || trip.difficulty === difficulty;
        const matchesDuration = duration === allFilter || trip.duration === duration;
        const search = `${trip.title} ${trip.destination} ${trip.description} ${trip.includes.join(" ")}`.toLowerCase();
        const matchesQuery = !query.trim() || search.includes(query.trim().toLowerCase());
        return matchesDifficulty && matchesDuration && matchesQuery;
      }),
    [difficulty, duration, query, trips]
  );

  const totalSeats = trips.reduce((sum, trip) => sum + trip.availableSeats, 0);
  const lowestPrice = trips.length ? Math.min(...trips.map((trip) => trip.price)) : 0;
  const visibleSeats = filteredTrips.reduce((sum, trip) => sum + trip.availableSeats, 0);
  const visibleLowestPrice = filteredTrips.length ? Math.min(...filteredTrips.map((trip) => trip.price)) : 0;
  const nextTrip = trips
    .filter((trip) => new Date(trip.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const resetFilters = () => {
    setDifficulty(allFilter);
    setDuration(allFilter);
    setQuery("");
  };

  return (
    <section className="min-h-screen overflow-hidden bg-[#fffaf0] transition-colors duration-300 dark:bg-[#071711]">
      <div className="relative border-b border-[#114F3C]/10 bg-white transition-colors duration-300 dark:border-white/10 dark:bg-[#0B1F17]">
        <div className="absolute inset-x-0 top-0 h-44 bg-[#FCE4B4]/60 dark:bg-[#114F3C]/20" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#F8A900]/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#F54C0D]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_390px] lg:px-8 lg:py-16">
          <div className="flex min-h-[340px] flex-col justify-center">
            <p className="inline-flex w-fit rounded-full bg-[#FCE4B4] px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#114F3C] shadow-sm">
              Trip directory
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] text-[#114F3C] dark:text-[#F8A900] sm:text-5xl lg:text-6xl">
              Compare available hiking packages without the noise.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700 dark:text-stone-300 sm:text-lg">
              Filter by difficulty and duration, scan dates and seats, then open the full trip page when a route matches your pace.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HeroStat label="Packages" value={trips.length.toString()} />
              <HeroStat label="Open seats" value={totalSeats.toString()} />
              <HeroStat label="Starting from" value={lowestPrice ? formatPrice(lowestPrice) : "Soon"} />
            </div>
          </div>

          <aside className="self-center overflow-hidden rounded-[2rem] bg-[#114F3C] p-2 text-white shadow-2xl shadow-[#114F3C]/20">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F8A900]">Snapshot</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">A quick view of current availability.</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F8A900] text-[#114F3C]">
                  <Compass className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Metric value={trips.length.toString()} label="Trips" />
                <Metric value={totalSeats.toString()} label="Seats" />
                <Metric value={lowestPrice ? formatPrice(lowestPrice) : "Soon"} label="From" />
              </div>

              {nextTrip ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                  <div className="p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-white/55">Next departure</p>
                    <p className="mt-2 text-base font-black text-white">{nextTrip.title}</p>
                    <p className="mt-1 text-sm text-white/75">{formatDate(nextTrip.date)}</p>
                  </div>
                  <button type="button" onClick={() => chooseTrip(nextTrip)} className={`w-full px-4 py-3 text-sm font-black transition ${yellowButton}`}>
                    View next trip
                  </button>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard Icon={CheckCircle2} label="Matching now" value={`${filteredTrips.length} packages`} helper="Based on your current filters" />
          <InsightCard Icon={Users} label="Seats in view" value={`${visibleSeats} seats`} helper="Available across visible trips" />
          <InsightCard Icon={Ticket} label="Lowest visible price" value={visibleLowestPrice ? formatPrice(visibleLowestPrice) : "Soon"} helper="From the filtered results" />
          <InsightCard Icon={Clock} label="Next departure" value={nextTrip ? formatDate(nextTrip.date) : "Soon"} helper={nextTrip ? nextTrip.destination : "Upcoming date will appear here"} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8 lg:py-12">
        <aside className="h-fit rounded-[2rem] border border-[#114F3C]/10 bg-white p-4 shadow-xl shadow-[#114F3C]/5 transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20 lg:sticky lg:top-24">
          <div className="rounded-[1.5rem] bg-[#fffaf0] p-5 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]">Filters</p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-[#114F3C] dark:text-[#F8A900]">Narrow the list</h2>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FCE4B4] text-[#F54C0D]">
                <Filter className="h-5 w-5" />
              </div>
            </div>

            <label className="relative mt-6 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white py-4 pl-12 pr-4 text-sm font-semibold text-stone-800 shadow-sm outline-none transition focus:border-[#114F3C] focus:bg-white focus:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10"
                placeholder="Search routes..."
              />
            </label>

            <div className="mt-5 grid gap-4">
              <FilterSelect label="Difficulty" value={difficulty} options={difficultyOptions} onChange={setDifficulty} />
              <FilterSelect label="Duration" value={duration} options={durationOptions} onChange={setDuration} />
            </div>

            <div className="mt-5 rounded-2xl bg-[#FCE4B4] p-4 text-[#114F3C] dark:bg-white/10 dark:text-stone-200">
              <p className="text-sm font-black">
                {filteredTrips.length} of {trips.length} packages showing
              </p>
              <p className="mt-2 text-sm leading-6 dark:text-stone-300">Use filters for quick comparison, or message Ermija for a route recommendation.</p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#114F3C]/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F54C0D]">Planning guide</p>
              <div className="mt-4 grid gap-3">
                <GuideItem Icon={CalendarDays} title="Check the date" text="Start with the trip date that fits your weekend." />
                <GuideItem Icon={Gauge} title="Match your pace" text="Use difficulty to avoid routes that feel too easy or too heavy." />
                <GuideItem Icon={MessageCircle} title="Confirm on WhatsApp" text="Ask the team before booking if you need a route suggestion." />
              </div>
            </div>

            <button type="button" onClick={resetFilters} className="mt-4 w-full rounded-2xl border border-[#114F3C]/15 px-4 py-3 text-sm font-black text-[#114F3C] transition hover:bg-[#FCE4B4] dark:border-white/10 dark:text-white dark:hover:bg-white/10">
              Reset filters
            </button>
            <a className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${orangeButton}`} href={`https://wa.me/${whatsappNumber}`}>
              <MessageCircle className="h-4 w-4" />
              Ask for help
            </a>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 rounded-[2rem] border border-[#114F3C]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10241C]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Available packages</p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-[#114F3C] dark:text-[#F8A900]">Choose from the current trip list</h2>
              </div>
              <p className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#FCE4B4] px-4 py-3 text-sm font-black text-[#114F3C]">
                <CheckCircle2 className="h-4 w-4" />
                Updated by staff
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <SupportCard Icon={CalendarDays} title="Date-focused" text="Each card puts departure timing close to the main trip details." />
            <SupportCard Icon={Users} title="Seat-aware" text="Open seats are visible before users enter the full trip page." />
            <SupportCard Icon={Ticket} title="Package summary" text="Included items are shown as quick chips for easier scanning." />
          </div>

          {filteredTrips.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onSelect={chooseTrip} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#114F3C]/20 bg-white p-10 text-center shadow-sm dark:border-white/15 dark:bg-[#10241C]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#FCE4B4]">
                <Compass className="h-8 w-8 text-[#F54C0D]" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">No trips match these filters</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">Reset the filters or message Ermija Hiking for a custom group recommendation.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#114F3C]/10 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#F54C0D]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{value}</p>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <p className="text-xl font-black text-[#F8A900]">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/65">{label}</p>
    </div>
  );
}

function InsightCard({ Icon, label, value, helper }: { Icon: typeof CalendarDays; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#114F3C]/10 bg-white p-5 shadow-xl shadow-[#114F3C]/5 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F54C0D]">{label}</p>
          <p className="mt-2 truncate text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{value}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FCE4B4] text-[#114F3C]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{helper}</p>
    </div>
  );
}

function GuideItem({ Icon, title, text }: { Icon: typeof CalendarDays; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FCE4B4] text-[#F54C0D]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-black text-[#114F3C] dark:text-[#F8A900]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-stone-600 dark:text-stone-300">{text}</p>
      </div>
    </div>
  );
}

function SupportCard({ Icon, title, text }: { Icon: typeof CalendarDays; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#114F3C]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10241C]">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FCE4B4] text-[#F54C0D]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{text}</p>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: TripFilter; options: TripFilter[]; onChange: (value: TripFilter) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-black text-[#114F3C] shadow-sm outline-none transition focus:border-[#114F3C] focus:bg-white focus:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-[#F8A900] dark:focus:bg-white/10">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
