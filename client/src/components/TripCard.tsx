import { CalendarDays, Gauge, MapPin, Ticket, Users } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import type { Trip } from "../types";
import { formatDate, formatPrice } from "../utils";

export function TripCard({ trip, onSelect }: { trip: Trip; onSelect: (trip: Trip) => void }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[#114F3C]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#114F3C]/15 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
      <div className="relative h-56 overflow-hidden">
        <img className="h-full w-full object-cover" src={trip.coverImage} alt={trip.destination} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-90" />
        <div className="absolute left-4 top-4 rounded-full bg-[#F8A900] px-3 py-1 text-sm font-black text-[#114F3C] shadow-lg">
          {trip.duration}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-white/85">
              <MapPin className="h-4 w-4 text-[#F8A900]" />
              {trip.destination}
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">{trip.title}</h3>
          </div>
          <p className="rounded-lg bg-white px-3 py-2 text-sm font-black text-[#114F3C] dark:bg-[#F8A900]">{formatPrice(trip.price)}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-700 dark:text-stone-300">{trip.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-stone-700 dark:text-stone-300">
          <span className="flex items-center gap-2 rounded-lg bg-stone-50 p-3 dark:bg-white/5">
            <CalendarDays className="h-4 w-4 text-[#F54C0D]" />
            {formatDate(trip.date)}
          </span>
          <span className="flex items-center gap-2 rounded-lg bg-stone-50 p-3 dark:bg-white/5">
            <Gauge className="h-4 w-4 text-[#F54C0D]" />
            {trip.difficulty}
          </span>
          <span className="flex items-center gap-2 rounded-lg bg-stone-50 p-3 dark:bg-white/5">
            <Users className="h-4 w-4 text-[#F54C0D]" />
            {trip.availableSeats} seats
          </span>
          <span className="flex items-center gap-2 rounded-lg bg-stone-50 p-3 dark:bg-white/5">
            <Ticket className="h-4 w-4 text-[#F54C0D]" />
            Inclusive
          </span>
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => onSelect(trip)} className={`flex-1 rounded-lg px-4 py-3 text-sm font-black transition ${yellowButton}`}>
            View Trip
          </button>
          <a
            className={`rounded-lg px-4 py-3 text-sm font-black transition ${orangeButton}`}
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Ermija Hiking, I want to book ${trip.title}.`)}`}
          >
            Book
          </a>
        </div>
      </div>
    </article>
  );
}
