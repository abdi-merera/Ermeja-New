import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { Trip } from "../types";
import { formatDate, formatPrice } from "../utils";

export function TripCard({ trip, onSelect }: { trip: Trip; onSelect: (trip: Trip) => void }) {
  return (
    <article
      onClick={() => onSelect(trip)}
      className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-[#114F3C]/5 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#F8A900]/45 hover:shadow-2xl hover:shadow-[#114F3C]/15 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20"
    >
      <div className="relative h-56 overflow-hidden bg-[#FCE4B4]">
        <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={trip.coverImage} alt={trip.destination} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-xs font-black text-[#114F3C] shadow-lg backdrop-blur">
          <Clock className="h-3.5 w-3.5 text-[#F54C0D]" />
          {trip.duration}
        </span>
        <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur">
          {trip.difficulty}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-black leading-tight text-[#1e2a2f] dark:text-[#F8A900]">{trip.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-300">
          <MapPin className="h-4 w-4 text-[#F8A900]" />
          {trip.destination}
        </p>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{trip.description}</p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-100 pt-4 text-sm font-semibold text-stone-500 dark:border-white/10 dark:text-stone-300">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#F8A900]" />
            {formatDate(trip.date)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-[#F8A900]" />
            {trip.availableSeats} seats
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-white/10">
          <div>
            <p className="text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{formatPrice(trip.price)}</p>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">per person</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FCE4B4] text-[#114F3C] transition group-hover:translate-x-1 group-hover:bg-[#F8A900]">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </article>
  );
}
