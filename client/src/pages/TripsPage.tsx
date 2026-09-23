import { useMemo, useState } from "react";
import { Compass, Filter, MessageCircle, Search } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import { TripCard } from "../components/TripCard";
import type { FormEvent } from "react";
import type { PrivateTripRequest, Trip } from "../types";
import { formatDate } from "../utils";

type TripFilter = "All" | string;

const allFilter = "All";

function uniqueValues(values: string[]) {
  return [allFilter, ...Array.from(new Set(values.filter(Boolean)))] as TripFilter[];
}

const emptyPrivateRequest: PrivateTripRequest = { name: "", phone: "", email: "", destination: "", preferredDate: "", groupSize: "", notes: "" };

export function TripsPage({ trips, chooseTrip, submitPrivateTripRequest }: { trips: Trip[]; chooseTrip: (trip: Trip) => void; submitPrivateTripRequest: (request: PrivateTripRequest) => Promise<boolean> }) {
  const [difficulty, setDifficulty] = useState<TripFilter>(allFilter);
  const [duration, setDuration] = useState<TripFilter>(allFilter);
  const [period, setPeriod] = useState("All");
  const [sort, setSort] = useState("Soonest first");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [privateOpen, setPrivateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [privateRequest, setPrivateRequest] = useState<PrivateTripRequest>(emptyPrivateRequest);
  const [sendingPrivateRequest, setSendingPrivateRequest] = useState(false);

  const submitPrivate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingPrivateRequest(true);
    try {
      const saved = await submitPrivateTripRequest(privateRequest);
      if (saved) setPrivateRequest(emptyPrivateRequest);
    } finally { setSendingPrivateRequest(false); }
  };

  const difficultyOptions = useMemo(() => uniqueValues(trips.map((trip) => trip.difficulty)), [trips]);
  const durationOptions = useMemo(() => uniqueValues(trips.map((trip) => trip.duration)), [trips]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const matchesDifficulty = difficulty === allFilter || trip.difficulty === difficulty;
        const matchesDuration = duration === allFilter || trip.duration === duration;
        const search = `${trip.title} ${trip.destination} ${trip.description} ${trip.includes.join(" ")}`.toLowerCase();
        const matchesQuery = !query.trim() || search.includes(query.trim().toLowerCase());
        const date = new Date(`${trip.date}T00:00:00`).getTime();
        const matchesPeriod = period === "All" || (period === "Upcoming" ? date >= todayTime : date < todayTime);
        return matchesPeriod && matchesDifficulty && matchesDuration && matchesQuery;
      }).sort((a, b) => sort === "Latest first" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)),
    [difficulty, duration, query, trips, period, sort, todayTime]
  );

  const nextTrip = trips
    .filter((trip) => new Date(`${trip.date}T00:00:00`).getTime() >= todayTime && trip.availableSeats > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const resetFilters = () => {
    setDifficulty(allFilter);
    setDuration(allFilter);
    setQuery("");
    setSort(period === "Past trips" ? "Latest first" : "Soonest first");
  };

  return (
    <section className="min-h-screen overflow-hidden bg-canvas transition-colors duration-300 dark:bg-[#071711]">
      <div className="relative border-b border-[#114F3C]/10 bg-surface transition-colors duration-300 dark:border-white/10 dark:bg-[#0B1F17]">
        <div className="absolute inset-x-0 top-0 h-44 bg-[#FCE4B4]/60 dark:bg-[#114F3C]/20" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#F8A900]/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#F54C0D]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit rounded-full bg-[#FCE4B4] px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#114F3C] shadow-sm">
              Explore Ethiopia
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black leading-[1.05] text-[#114F3C] dark:text-[#F8A900] sm:text-4xl">
              Find your next hiking trip.
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-stone-700 dark:text-stone-300 sm:text-lg">
              Compare destinations, dates, and available seats, then find the trip that matches your pace.
            </p>
          </div>

          <aside className="self-center overflow-hidden rounded-[1.5rem] bg-[#114F3C] p-5 text-white shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F8A900]">Next departure</p>
              {nextTrip ? (
                <div className="mt-3">
                  <p className="text-xl font-black text-white">{nextTrip.title}</p>
                  <p className="mt-2 text-sm text-white/75">{formatDate(nextTrip.date)} · {nextTrip.destination}</p>
                  <button type="button" onClick={() => chooseTrip(nextTrip)} className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-black transition ${yellowButton}`}>
                    View next trip
                  </button>
                </div>
              ) : <p className="mt-3 text-sm leading-6 text-white/70">Check back for new departure dates, or ask us about a private trip.</p>}
          </aside>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-xl border border-[#114F3C]/15 bg-surface p-4 dark:border-white/15 dark:bg-[#10241C]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2" aria-label="Trip dates">
              {["All", "Upcoming", "Past trips"].map((value) => <button key={value} type="button" aria-pressed={period === value} onClick={() => { setPeriod(value); setSort(value === "Past trips" ? "Latest first" : "Soonest first"); }} className={`rounded-lg px-4 py-2 text-sm font-bold ${period === value ? "bg-[#114F3C] text-white dark:bg-[#F8A900] dark:text-[#114F3C]" : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"}`}>{value}</button>)}
            </div>
            <button type="button" aria-expanded={filtersOpen} aria-controls="trip-filters" onClick={() => setFiltersOpen(!filtersOpen)} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-white/20 md:hidden"><Filter className="h-4 w-4" /> Filters</button>
          </div>
          <div className="mt-4 grid items-end gap-3 md:grid-cols-[minmax(180px,1.5fr)_3fr]">
            <label className="grid gap-2"><span className="text-xs font-bold text-stone-600 dark:text-stone-300">Search trips</span><span className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Destination or trip name" className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-900 dark:border-white/20 dark:bg-[#183329] dark:text-white" /></span></label>
            <div id="trip-filters" className={`${filtersOpen ? "grid" : "hidden"} gap-3 sm:grid-cols-3 md:grid`}>
              <FilterSelect label="Difficulty" value={difficulty} options={difficultyOptions} onChange={setDifficulty} />
              <FilterSelect label="Duration" value={duration} options={durationOptions} onChange={setDuration} />
              <FilterSelect label="Sort by" value={sort} options={["Soonest first", "Latest first"]} onChange={setSort} />
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-bold text-[#114F3C] dark:text-[#F8A900]">{period === "All" ? "All adventures" : period === "Upcoming" ? "Upcoming adventures" : "Past adventures"}</h2><p role="status" className="mt-1 text-sm text-stone-600 dark:text-stone-300">{filteredTrips.length} {filteredTrips.length === 1 ? "trip" : "trips"}{period === "Past trips" ? " / Previous departures, for inspiration" : ""}</p></div>
            {(query || difficulty !== allFilter || duration !== allFilter) ? <button type="button" onClick={resetFilters} className="text-sm font-bold text-[#114F3C] underline dark:text-[#F8A900]">Clear filters</button> : null}
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
              <h3 className="mt-5 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{query || difficulty !== allFilter || duration !== allFilter ? "No trips match these filters" : period === "Upcoming" ? "New adventures are on the way" : period === "Past trips" ? "No past trips to show yet" : "No trips to show yet"}</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">Try another search, clear your filters, or ask us to plan a private trip for your group.</p>
            </div>
          )}

          <section className="mt-8 rounded-[1.5rem] border border-[#F8A900]/40 bg-[#FCE4B4] p-6 text-[#114F3C] shadow-lg dark:bg-[#10241C] dark:text-white">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]">Private & group trips</p>
              <h3 className="mt-2 text-2xl font-black">Choose your own date, destination and group size.</h3>
              <p className="mt-2 text-sm leading-6 opacity-80">Tell us your preferred date and destination. We will discuss availability, pricing, and arrangements with you on WhatsApp.</p>
            </div>
            <button type="button" aria-expanded={privateOpen} aria-controls="private-trip-form" onClick={() => setPrivateOpen(!privateOpen)} className={`mt-4 rounded-lg px-4 py-3 text-sm font-bold ${yellowButton}`}>{privateOpen ? "Close request form" : "Plan a private trip"}</button>
            {privateOpen ? <form id="private-trip-form" onSubmit={submitPrivate} className="mt-6 grid gap-3 sm:grid-cols-2">
              <input required minLength={2} value={privateRequest.name} onChange={(e) => setPrivateRequest({ ...privateRequest, name: e.target.value })} placeholder="Your name" className="rounded-xl border border-[#114F3C]/15 bg-white px-4 py-3 text-stone-900" />
              <input required minLength={7} value={privateRequest.phone} onChange={(e) => setPrivateRequest({ ...privateRequest, phone: e.target.value })} placeholder="Phone / WhatsApp" className="rounded-xl border border-[#114F3C]/15 bg-white px-4 py-3 text-stone-900" />
              <input type="email" value={privateRequest.email} onChange={(e) => setPrivateRequest({ ...privateRequest, email: e.target.value })} placeholder="Email (optional)" className="rounded-xl border border-[#114F3C]/15 bg-white px-4 py-3 text-stone-900" />
              <input value={privateRequest.destination} onChange={(e) => setPrivateRequest({ ...privateRequest, destination: e.target.value })} placeholder="Preferred destination" className="rounded-xl border border-[#114F3C]/15 bg-white px-4 py-3 text-stone-900" />
              <input type="date" min={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`} value={privateRequest.preferredDate} onChange={(e) => setPrivateRequest({ ...privateRequest, preferredDate: e.target.value })} aria-label="Preferred date" className="rounded-xl border border-[#114F3C]/15 bg-white px-4 py-3 text-stone-900" />
              <input required type="number" min="1" max="100" value={privateRequest.groupSize} onChange={(e) => setPrivateRequest({ ...privateRequest, groupSize: e.target.value })} placeholder="Group size" className="rounded-xl border border-[#114F3C]/15 bg-white px-4 py-3 text-stone-900" />
              <textarea value={privateRequest.notes} onChange={(e) => setPrivateRequest({ ...privateRequest, notes: e.target.value })} placeholder="Trip preferences or questions" className="min-h-28 rounded-xl border border-[#114F3C]/15 bg-white px-4 py-3 text-stone-900 sm:col-span-2" />
              <button disabled={sendingPrivateRequest} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-black transition disabled:opacity-60 sm:col-span-2 ${orangeButton}`}>
                <MessageCircle className="h-5 w-5" /> {sendingPrivateRequest ? "Saving request..." : "Send request & continue on WhatsApp"}
              </button>
            </form> : null}
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
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-black text-[#114F3C] shadow-sm outline-none transition focus:border-[#114F3C] focus:bg-white focus:shadow-md dark:border-white/10 dark:bg-[#183329] dark:text-white dark:[color-scheme:dark] dark:focus:bg-[#183329]">
        {options.map((option) => (
          <option key={option} className="bg-white text-stone-900 dark:bg-[#183329] dark:text-white">{option}</option>
        ))}
      </select>
    </label>
  );
}
