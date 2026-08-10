import { useMemo, useState } from "react";
import { CheckCircle2, Compass, Filter, MessageCircle, Search } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import { TripCard } from "../components/TripCard";
import type { Trip } from "../types";
import { formatDate } from "../utils";

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

  const nextTrip = trips
    .filter((trip) => new Date(trip.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const resetFilters = () => {
    setDifficulty(allFilter);
    setDuration(allFilter);
    setQuery("");
  };

  return (
    <section className="min-h-screen overflow-hidden bg-canvas transition-colors duration-300 dark:bg-[#071711]">
      <div className="relative border-b border-[#114F3C]/10 bg-surface transition-colors duration-300 dark:border-white/10 dark:bg-[#0B1F17]">
        <div className="absolute inset-x-0 top-0 h-44 bg-[#FCE4B4]/60 dark:bg-[#114F3C]/20" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#F8A900]/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#F54C0D]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-12">
          <div className="flex min-h-[230px] flex-col justify-center">
            <p className="inline-flex w-fit rounded-full bg-[#FCE4B4] px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#114F3C] shadow-sm">
              Trip directory
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.05] text-[#114F3C] dark:text-[#F8A900] sm:text-5xl lg:text-6xl">
              Find your next hiking trip.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700 dark:text-stone-300 sm:text-lg">
              Compare destinations, dates, prices and available seats, then open the trip that matches your pace.
            </p>
          </div>

          <aside className="self-center overflow-hidden rounded-[1.5rem] bg-[#114F3C] p-5 text-white shadow-2xl shadow-[#114F3C]/20">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F8A900]">Next departure</p>
              {nextTrip ? (
                <div className="mt-3">
                  <p className="text-xl font-black text-white">{nextTrip.title}</p>
                  <p className="mt-2 text-sm text-white/75">{formatDate(nextTrip.date)} · {nextTrip.destination}</p>
                  <button type="button" onClick={() => chooseTrip(nextTrip)} className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-black transition ${yellowButton}`}>
                    View next trip
                  </button>
                </div>
              ) : <p className="mt-3 text-sm leading-6 text-white/70">New departure dates will appear here when published.</p>}
          </aside>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8 lg:py-10">
        <aside className="h-fit rounded-[2rem] border border-[#114F3C]/10 bg-surface p-4 shadow-xl shadow-[#114F3C]/5 transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20 lg:sticky lg:top-24">
          <div className="rounded-[1.5rem] bg-sage p-5 dark:bg-white/5">
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
              <p className="mt-2 text-sm leading-6 dark:text-stone-300">Change a filter to narrow the current trip list.</p>
            </div>

            <button type="button" onClick={resetFilters} className="mt-4 w-full rounded-2xl border border-[#114F3C]/15 px-4 py-3 text-sm font-black text-[#114F3C] transition hover:bg-[#FCE4B4] dark:border-white/10 dark:text-white dark:hover:bg-white/10">
              Reset filters
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 rounded-[2rem] border border-[#114F3C]/10 bg-surface p-5 shadow-sm dark:border-white/10 dark:bg-[#10241C]">
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

          {filteredTrips.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onSelect={chooseTrip} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#114F3C]/20 bg-surface p-10 text-center shadow-sm dark:border-white/15 dark:bg-[#10241C]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#FCE4B4]">
                <Compass className="h-8 w-8 text-[#F54C0D]" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">No trips match these filters</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">Reset the filters or message Ermija Hiking for a custom group recommendation.</p>
            </div>
          )}

          <section className="mt-8 grid gap-5 rounded-[1.5rem] border border-[#F8A900]/40 bg-[#FCE4B4] p-6 text-[#114F3C] shadow-lg dark:bg-[#10241C] dark:text-white sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]">Private & group trips</p>
              <h3 className="mt-2 text-2xl font-black">Choose your own date, destination and group size.</h3>
              <p className="mt-2 text-sm leading-6 opacity-80">Tell us what you have in mind. We will plan the route and confirm details and payment proof through WhatsApp.</p>
            </div>
            <a className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-black transition ${orangeButton}`} href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Ermija Hiking, I would like to request a private/group trip. Preferred destination/date/group size: ")}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-5 w-5" /> Request a private trip
            </a>
          </section>

          <section className="mt-8 flex flex-col justify-between gap-5 rounded-[1.5rem] bg-[#114F3C] p-6 text-white shadow-xl shadow-[#114F3C]/15 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F8A900]">Not sure which trip fits?</p>
              <h3 className="mt-2 text-2xl font-black">Ask us for a route recommendation.</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">Tell us your preferred date, group size and experience level.</p>
            </div>
            <a className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition ${orangeButton}`} href={`https://wa.me/${whatsappNumber}`}>
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </section>
        </div>
      </div>
    </section>
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
