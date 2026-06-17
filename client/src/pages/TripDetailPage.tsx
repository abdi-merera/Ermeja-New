import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Gauge,
  MapPin,
  MessageCircle,
  MinusCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import { TripCard } from "../components/TripCard";
import type { BookingForm, BookingSubmitHandler, Trip } from "../types";
import { formatDate, formatPrice } from "../utils";

export function TripDetailPage({
  trip,
  relatedTrips,
  bookingForm,
  setBookingForm,
  submitBooking,
  chooseTrip,
  onBack
}: {
  trip: Trip;
  relatedTrips: Trip[];
  bookingForm: BookingForm;
  setBookingForm: (form: BookingForm) => void;
  submitBooking: BookingSubmitHandler;
  chooseTrip: (trip: Trip) => void;
  onBack: () => void;
}) {
  const galleryImages = [trip.coverImage, ...trip.galleryImages].slice(0, 4);

  return (
    <section className="bg-[#fffaf0] pb-24 transition-colors duration-300 dark:bg-[#071711] lg:pb-0">
      <div className="relative min-h-[620px] overflow-hidden bg-[#114F3C] px-4 py-8 text-white sm:px-6 lg:px-8">
        <img className="absolute inset-0 h-full w-full object-cover opacity-50" src={trip.coverImage} alt={trip.destination} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061B15] via-[#114F3C]/90 to-[#114F3C]/40" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#fffaf0] to-transparent" />

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.42fr]">
          <article className="pt-4 lg:pt-12">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
              Back to trips
            </button>

            <div className="mt-12 max-w-4xl">
              <p className="inline-flex rounded-full bg-[#F8A900] px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#114F3C]">
                {trip.destination}
              </p>
              <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">{trip.title}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/84">{trip.description}</p>
            </div>

            <div className="mt-9 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <HeroFact Icon={CalendarDays} label="Date" value={formatDate(trip.date)} />
              <HeroFact Icon={Clock} label="Duration" value={trip.duration} />
              <HeroFact Icon={Gauge} label="Difficulty" value={trip.difficulty} />
              <HeroFact Icon={Users} label="Open seats" value={`${trip.availableSeats} left`} />
            </div>
          </article>

          <BookingPanel trip={trip} bookingForm={bookingForm} setBookingForm={setBookingForm} submitBooking={submitBooking} />
        </div>
      </div>

      <div className="mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative grid gap-6 rounded-lg border border-[#114F3C]/10 bg-white p-4 shadow-2xl shadow-[#114F3C]/12 transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20 sm:p-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg bg-[#114F3C] p-6 text-white">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F8A900]">Trip rhythm</p>
            <h2 className="mt-3 text-3xl font-black">Clear timing from meeting point to return</h2>
            <div className="mt-6 grid gap-3">
              {[
                { label: "Meeting point", value: trip.meetingPoint, Icon: MapPin },
                { label: "Departure", value: trip.departureTime, Icon: Clock },
                { label: "Return", value: trip.returnTime, Icon: CalendarDays },
                { label: "Package price", value: formatPrice(trip.price), Icon: Ticket }
              ].map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                  <Icon className="h-5 w-5 shrink-0 text-[#F8A900]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-white/55">{label}</p>
                    <p className="mt-1 text-sm font-black text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {galleryImages.map((image, index) => (
              <div key={image} className={`relative overflow-hidden rounded-lg ${index === 0 ? "sm:row-span-2" : ""}`}>
                <img className="h-full min-h-48 w-full object-cover transition duration-500 hover:scale-105" src={image} alt={`${trip.destination} view ${index + 1}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.36fr]">
          <article className="min-w-0">
            <section className="rounded-lg bg-white p-6 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20 sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Day plan</p>
                  <h2 className="mt-2 text-3xl font-black text-[#114F3C]">What the trip feels like hour by hour</h2>
                </div>
                <p className="rounded-lg bg-[#FCE4B4] px-4 py-3 text-sm font-black text-[#114F3C]">{trip.duration}</p>
              </div>

              <div className="mt-8 space-y-5">
                {trip.itinerary.map((item, index) => (
                  <div key={item} className="grid gap-4 sm:grid-cols-[80px_1fr]">
                    <div className="flex items-center gap-3 sm:block">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#114F3C] text-sm font-black text-[#F8A900]">{String(index + 1).padStart(2, "0")}</span>
                      {index < trip.itinerary.length - 1 ? <span className="hidden h-16 w-px bg-[#114F3C]/16 sm:mx-6 sm:mt-3 sm:block" /> : null}
                    </div>
                    <div className="rounded-lg border border-stone-100 bg-stone-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <p className="text-base font-bold leading-7 text-stone-800 dark:text-stone-200">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 grid gap-5 md:grid-cols-3">
              <InfoPanel title="Included" icon="check" items={trip.includes} />
              <InfoPanel title="Not included" icon="minus" items={trip.notIncluded} />
              <InfoPanel title="What to bring" icon="spark" items={trip.whatToBring} />
            </section>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-lg bg-[#114F3C] p-6 text-white shadow-xl shadow-[#114F3C]/15">
              <ShieldCheck className="h-9 w-9 text-[#F8A900]" />
              <h2 className="mt-4 text-2xl font-black">Prepared, guided, and simple to confirm</h2>
              <p className="mt-3 text-sm leading-6 text-white/72">{trip.safetyNotes}</p>
              <div className="mt-5 space-y-3">
                {["Confirm seats through WhatsApp", "Receive final meeting details", "Arrive ready with the packing list"].map((item) => (
                  <p key={item} className="flex gap-3 text-sm font-bold text-white/80">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9EC26D]" />
                    {item}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#114F3C]/10 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C]">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F54C0D]">Availability</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#FCE4B4] p-4">
                  <p className="text-2xl font-black text-[#114F3C]">{trip.availableSeats}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#114F3C]/60">Seats left</p>
                </div>
                <div className="rounded-lg bg-stone-50 p-4 dark:bg-white/5">
                  <p className="text-2xl font-black text-[#114F3C]">{formatPrice(trip.price)}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">Per person</p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {relatedTrips.length ? (
          <section className="mt-14 pb-14">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Keep exploring</p>
                <h2 className="mt-2 text-3xl font-black text-[#114F3C]">Other trips guests compare</h2>
              </div>
              <button type="button" onClick={onBack} className="rounded-lg bg-[#FCE4B4] px-5 py-3 text-sm font-black text-[#114F3C] transition hover:bg-[#f8d58b]">
                View all trips
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedTrips.map((relatedTrip) => (
                <TripCard key={relatedTrip.id} trip={relatedTrip} onSelect={chooseTrip} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#114F3C]/10 bg-white/95 p-3 shadow-2xl shadow-black/20 backdrop-blur dark:border-white/10 dark:bg-[#10241C]/95 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-[#114F3C]">{trip.title}</p>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400">{formatPrice(trip.price)} per person</p>
          </div>
          <a className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${orangeButton}`} href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Ermija Hiking, I want to book ${trip.title}.`)}`}>
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function HeroFact({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-[#F8A900]" />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-white/60">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function BookingPanel({
  trip,
  bookingForm,
  setBookingForm,
  submitBooking
}: {
  trip: Trip;
  bookingForm: BookingForm;
  setBookingForm: (form: BookingForm) => void;
  submitBooking: BookingSubmitHandler;
}) {
  return (
    <aside className="rounded-lg border border-white/15 bg-white p-5 text-stone-900 shadow-2xl shadow-black/28 transition-colors duration-300 dark:bg-[#10241C] dark:text-stone-100 lg:sticky lg:top-24 lg:mt-10 lg:h-fit">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]">Book this trip</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#114F3C]">{formatPrice(trip.price)}</h2>
          <p className="mt-1 text-sm font-bold text-stone-500 dark:text-stone-400">per person</p>
        </div>
        <p className="rounded-lg bg-[#FCE4B4] px-3 py-2 text-sm font-black text-[#114F3C]">{trip.availableSeats} seats</p>
      </div>

      <form className="mt-6 space-y-3" onSubmit={submitBooking}>
        <input required className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Full name" value={bookingForm.customerName} onChange={(event) => setBookingForm({ ...bookingForm, customerName: event.target.value })} />
        <input required className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Phone / WhatsApp" value={bookingForm.phone} onChange={(event) => setBookingForm({ ...bookingForm, phone: event.target.value })} />
        <input required min="1" max={trip.availableSeats} type="number" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Number of people" value={bookingForm.numberOfPeople} onChange={(event) => setBookingForm({ ...bookingForm, numberOfPeople: event.target.value })} />
        <textarea className="min-h-28 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Message" value={bookingForm.message} onChange={(event) => setBookingForm({ ...bookingForm, message: event.target.value })} />
        <button type="submit" className={`w-full rounded-lg px-5 py-4 text-base font-black transition ${yellowButton}`}>
          Send Booking
        </button>
      </form>
      <a className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-[#114F3C]/15 px-5 py-4 text-base font-black text-[#114F3C] transition hover:bg-[#114F3C]/5" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Ermija Hiking, I want to book ${trip.title}.`)}`}>
        <MessageCircle className="h-5 w-5" />
        WhatsApp Now
      </a>
    </aside>
  );
}

function InfoPanel({ title, icon, items }: { title: string; icon: "check" | "minus" | "spark"; items: string[] }) {
  const Icon = icon === "minus" ? MinusCircle : icon === "spark" ? Sparkles : CheckCircle2;
  const iconColor = icon === "minus" ? "text-[#F54C0D]" : "text-[#9EC26D]";

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
      <h3 className="text-xl font-black text-[#114F3C]">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-700 dark:text-stone-300">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
