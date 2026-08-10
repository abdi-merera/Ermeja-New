import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
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

const inputClass =
  "w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:ring-4 focus:ring-[#114F3C]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:border-[#F8A900]";

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
  const galleryImages = [trip.coverImage, ...trip.galleryImages].filter(Boolean).slice(0, 5);

  return (
    <section className="bg-canvas pb-24 transition-colors duration-300 dark:bg-[#071711] lg:pb-0">
      <TripHero trip={trip} galleryImages={galleryImages} onBack={onBack} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
        <main className="min-w-0 space-y-8">
          <RouteSnapshot trip={trip} />
          <ItinerarySection trip={trip} />
          <div className="grid gap-5 md:grid-cols-3">
            <InfoPanel title="Included" icon="check" items={trip.includes} />
            <InfoPanel title="Not included" icon="minus" items={trip.notIncluded} />
            <InfoPanel title="What to bring" icon="spark" items={trip.whatToBring} />
          </div>
          <SafetySection trip={trip} />
        </main>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <BookingPanel trip={trip} bookingForm={bookingForm} setBookingForm={setBookingForm} submitBooking={submitBooking} />
        </aside>
      </div>

      {relatedTrips.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Keep exploring</p>
              <h2 className="mt-2 text-3xl font-black text-[#114F3C] dark:text-[#F8A900]">Other trips guests compare</h2>
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

      <MobileBookingBar trip={trip} />
    </section>
  );
}

function TripHero({ trip, galleryImages, onBack }: { trip: Trip; galleryImages: string[]; onBack: () => void }) {
  const secondaryImages = galleryImages.length > 1 ? galleryImages.slice(1, 4) : [trip.coverImage, trip.coverImage, trip.coverImage];

  return (
    <header className="relative isolate overflow-hidden bg-[#071711] px-4 py-8 text-white sm:px-6 lg:px-8">
      <img className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" src={trip.coverImage} alt={trip.destination} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,#071711_0%,rgba(7,23,17,0.95)_38%,rgba(17,79,60,0.7)_100%)]" />

      <div className="mx-auto grid min-h-[660px] max-w-7xl items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
        <div>
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
            Back to trips
          </button>

          <div className="mt-12">
            <p className="inline-flex rounded-full bg-[#F8A900] px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#114F3C]">
              {trip.destination}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">{trip.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">{trip.description}</p>
          </div>

          <div className="mt-9 grid max-w-3xl gap-3 sm:grid-cols-2">
            <HeroFact Icon={CalendarDays} label="Trip date" value={formatDate(trip.date)} />
            <HeroFact Icon={Ticket} label="Price" value={formatPrice(trip.price)} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
          <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/35">
            <img className="absolute inset-0 h-full w-full object-cover" src={trip.coverImage} alt={trip.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-black text-[#114F3C] backdrop-blur">
                <MapPin className="h-4 w-4 text-[#F54C0D]" />
                {trip.meetingPoint}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {secondaryImages.map((image, index) => (
              <div key={`${image}-${index}`} className="h-32 overflow-hidden rounded-2xl border border-white/15 bg-white/10 lg:h-auto">
                <img className="h-full w-full object-cover transition duration-500 hover:scale-105" src={image} alt={`${trip.destination} gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function RouteSnapshot({ trip }: { trip: Trip }) {
  const returnDetails = trip.returnDate ? `${formatDate(trip.returnDate)}${trip.returnTime ? `, ${trip.returnTime}` : ""}` : (trip.returnTime || "To be announced");
  const facts = [
    { label: "Duration", value: trip.duration, Icon: Clock },
    { label: "Difficulty", value: trip.difficulty, Icon: Gauge },
    { label: "Open seats", value: `${trip.availableSeats} left`, Icon: Users },
    { label: trip.duration === "Day Trip" ? "Departure" : "Return", value: trip.duration === "Day Trip" ? trip.departureTime : returnDetails, Icon: Compass }
  ];

  return (
    <section className="rounded-[1.5rem] border border-[#114F3C]/10 bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {facts.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl bg-sage p-4 dark:bg-white/5">
            <Icon className="h-5 w-5 text-[#F54C0D]" />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">{label}</p>
            <p className="mt-1 text-base font-black text-[#114F3C] dark:text-[#F8A900]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ItinerarySection({ trip }: { trip: Trip }) {
  return (
    <section className="rounded-[1.5rem] border border-[#114F3C]/10 bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Route plan</p>
          <h2 className="mt-2 text-3xl font-black text-[#114F3C] dark:text-[#F8A900]">From first meet-up to final return</h2>
        </div>
        <p className="rounded-lg bg-[#FCE4B4] px-4 py-3 text-sm font-black text-[#114F3C]">{trip.departureTime} departure</p>
      </div>

      <div className="mt-8 grid gap-4">
        {trip.itinerary.map((item, index) => (
          <article key={item} className="grid gap-4 rounded-2xl border border-[#114F3C]/10 bg-sage p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[76px_1fr]">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#114F3C] text-sm font-black text-[#F8A900]">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-lg font-black text-[#114F3C] dark:text-white">Step {index + 1}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-700 dark:text-stone-300">{item}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SafetySection({ trip }: { trip: Trip }) {
  return (
    <section className="grid gap-5 overflow-hidden rounded-[1.5rem] bg-[#114F3C] p-6 text-white shadow-xl shadow-[#114F3C]/15 sm:p-8 lg:grid-cols-[0.72fr_1fr]">
      <div>
        <ShieldCheck className="h-10 w-10 text-[#F8A900]" />
        <h2 className="mt-4 text-3xl font-black">Guided with practical safety notes</h2>
        <p className="mt-4 text-sm leading-7 text-white/75">{trip.safetyNotes}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {["Confirm seats through WhatsApp", "Receive final meeting details", "Follow guide pacing on route"].map((item) => (
          <p key={item} className="flex gap-3 rounded-2xl bg-white/10 p-4 text-sm font-bold text-white/84">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9EC26D]" />
            {item}
          </p>
        ))}
      </div>
    </section>
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
    <section className="overflow-hidden rounded-[1.5rem] border border-[#114F3C]/10 bg-surface shadow-2xl shadow-[#114F3C]/12 transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/30">
      <div className="bg-[#114F3C] p-6 text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F8A900]">Book this trip</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black">{formatPrice(trip.price)}</h2>
            <p className="mt-1 text-sm font-bold text-white/60">per person</p>
          </div>
          <p className="rounded-lg bg-white/12 px-3 py-2 text-sm font-black text-white">{trip.availableSeats} seats</p>
        </div>
      </div>

      <form className="space-y-3 p-5" onSubmit={submitBooking}>
        <input required className={inputClass} placeholder="Full name" value={bookingForm.customerName} onChange={(event) => setBookingForm({ ...bookingForm, customerName: event.target.value })} />
        <input required className={inputClass} placeholder="Phone / WhatsApp" value={bookingForm.phone} onChange={(event) => setBookingForm({ ...bookingForm, phone: event.target.value })} />
        <input required min="1" max={trip.availableSeats} type="number" className={inputClass} placeholder="Number of people" value={bookingForm.numberOfPeople} onChange={(event) => setBookingForm({ ...bookingForm, numberOfPeople: event.target.value })} />
        <textarea className={`${inputClass} min-h-28`} placeholder="Message" value={bookingForm.message} onChange={(event) => setBookingForm({ ...bookingForm, message: event.target.value })} />
        <button type="submit" className={`w-full rounded-lg px-5 py-4 text-base font-black transition ${yellowButton}`}>
          Send Booking
        </button>
        <a className={`flex items-center justify-center gap-2 rounded-lg px-5 py-4 text-base font-black transition ${orangeButton}`} href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Ermija Hiking, I want to book ${trip.title}.`)}`}>
          <MessageCircle className="h-5 w-5" />
          WhatsApp Now
        </a>
      </form>
    </section>
  );
}

function HeroFact({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-[#F8A900]" />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-white/55">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function InfoPanel({ title, icon, items }: { title: string; icon: "check" | "minus" | "spark"; items: string[] }) {
  const Icon = icon === "minus" ? MinusCircle : icon === "spark" ? Sparkles : CheckCircle2;
  const iconColor = icon === "minus" ? "text-[#F54C0D]" : "text-[#9EC26D]";

  return (
    <section className="rounded-[1.5rem] border border-[#114F3C]/10 bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
      <h3 className="text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-700 dark:text-stone-300">
        {(items.length ? items : ["Details will be shared before departure."]).map((item) => (
          <li key={item} className="flex gap-3">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MobileBookingBar({ trip }: { trip: Trip }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#114F3C]/10 bg-white/95 p-3 shadow-2xl shadow-black/20 backdrop-blur dark:border-white/10 dark:bg-[#10241C]/95 lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[#114F3C] dark:text-[#F8A900]">{trip.title}</p>
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400">{formatPrice(trip.price)} per person</p>
        </div>
        <a className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${orangeButton}`} href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Ermija Hiking, I want to book ${trip.title}.`)}`}>
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
