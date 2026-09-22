import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { Trip } from "../types";
import { formatDate, formatPrice } from "../utils";

export function TripCard({ trip, onSelect }: { trip: Trip; onSelect: (trip: Trip) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = new Date(`${trip.date}T00:00:00`) < today;
  const soldOut = trip.availableSeats <= 0;
  return (
    <article
      onClick={() => onSelect(trip)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(trip);
        }
      }}
      role="button"
      tabIndex={0}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-[#114F3C]/10 bg-surface shadow-sm outline-none transition duration-300 hover:-translate-y-2 hover:border-[#F8A900]/45 hover:shadow-2xl hover:shadow-[#114F3C]/15 focus-visible:ring-4 focus-visible:ring-[#F8A900]/50 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20"
    >
      <div className="relative h-48 overflow-hidden bg-[#FCE4B4]">
        <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={trip.coverImage} alt={trip.destination} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        {isPast || soldOut ? <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-stone-800">{isPast ? "Past trip" : "Sold out"}</span> : null}
        <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-xs font-black text-[#114F3C] shadow-lg backdrop-blur">
          <Clock className="h-3.5 w-3.5 text-[#F54C0D]" />
          {trip.duration}
        </span>
        <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur">
          {trip.difficulty}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-black leading-tight text-[#1e2a2f] dark:text-[#F8A900]">{trip.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-300">
          <MapPin className="h-4 w-4 text-[#F8A900]" />
          {trip.destination}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{trip.description}</p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-100 pt-4 text-sm font-semibold text-stone-500 dark:border-white/10 dark:text-stone-300">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#F8A900]" />
            {formatDate(trip.date)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-[#F8A900]" />
            {isPast ? "Completed" : soldOut ? "Sold out" : `${trip.availableSeats} seats available`}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-white/10">
          <div>
            <p className="text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{formatPrice(trip.price)}</p>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">per person</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold bg-[#FCE4B4] text-[#114F3C] transition group-hover:translate-x-1 group-hover:bg-[#F8A900]">
            View trip <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
