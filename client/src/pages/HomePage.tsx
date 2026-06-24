import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { beigePanel, brandGreen, destinations, experienceHighlights, heroStats, orangeButton, testimonials, trustItems, whatsappNumber, yellowButton } from "../constants";
import { GalleryPreview } from "../components/GalleryPreview";
import { SectionTitle } from "../components/SectionTitle";
import { TripCard } from "../components/TripCard";
import type { Page, Trip } from "../types";

export function HomePage({ trips, galleryImages, choosePage, chooseTrip }: { trips: Trip[]; galleryImages: string[]; choosePage: (page: Page) => void; chooseTrip: (trip: Trip) => void }) {
  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.jpg"
          alt="Hikers walking through mountain nature"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09251C]/95 via-[#114F3C]/78 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#fffaf0] to-transparent dark:from-[#071711]" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8">
          <div className="max-w-3xl pb-8 pt-8">
            <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#F8A900] backdrop-blur">
              Guided Ethiopian adventures
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">Explore Ethiopia with us</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Discover upcoming hikes, compare packages, book a group trip, and step into Ethiopia's mountains, lakes, forests, and hidden places with local guides.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => choosePage("trips")} className={`inline-flex items-center gap-2 rounded-lg px-6 py-4 text-base font-black transition ${yellowButton}`}>
                View Trips
                <ArrowRight className="h-5 w-5" />
              </button>
              <a className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-4 text-base font-black text-white backdrop-blur transition hover:bg-white/20" href={`https://wa.me/${whatsappNumber}`}>
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
                  <p className="text-2xl font-black text-[#F8A900]">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative hidden lg:block">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 shadow-2xl shadow-black/40 backdrop-blur-md">
              <img className="h-[430px] w-full rounded-lg object-cover" src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85" alt="Mountain walking route" />
              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F8A900]">Featured route</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Wenchi Day Trip</h2>
                  <p className="mt-2 text-sm leading-6 text-white/75">A clean, photo-rich trip poster style that keeps every booking detail visible.</p>
                </div>
                <div className="rounded-lg bg-[#F8A900] px-4 py-3 text-center text-[#114F3C]">
                  <p className="text-xs font-black uppercase">From</p>
                  <p className="text-xl font-black">ETB 3,200</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-7 -left-7 rounded-lg bg-white p-5 shadow-xl dark:bg-[#10241C] dark:shadow-black/30">
              <p className="text-sm font-black text-[#114F3C]">Package clarity</p>
              <div className="mt-3 space-y-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                {["Date and price", "Seats available", "WhatsApp booking"].map((item) => (
                  <p key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#9EC26D]" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="-mt-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Upcoming trips" title="Choose your next walk" text="Clear dates, prices, difficulty levels, and seats help travelers decide quickly." />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.slice(0, 3).map((trip) => (
              <TripCard key={trip.id} trip={trip} onSelect={chooseTrip} />
            ))}
          </div>
        </div>
      </section>

      <section className={`${brandGreen} px-4 py-16 text-white sm:px-6 lg:px-8`}>
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
          {trustItems.map(({ title, text, Icon }) => (
            <article key={title} className="rounded-lg border border-white/10 bg-white/10 p-5">
              <Icon className="h-7 w-7 text-[#F8A900]" />
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/75">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Experience" title="Built to make booking feel easy" text="The website gives visitors enough confidence to choose a route, understand the package, and contact Ermija without confusion." />
          <div className="grid gap-5 md:grid-cols-3">
            {experienceHighlights.map(({ title, text, Icon }) => (
              <article key={title} className="rounded-lg border border-[#114F3C]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FCE4B4] text-[#F54C0D]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Destinations" title="Popular places to explore" />
          <div className="grid gap-6 md:grid-cols-3">
            {destinations.map((destination) => (
              <article key={destination.name} className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-[#10241C] dark:shadow-black/20">
                <img className="h-56 w-full object-cover" src={destination.image} alt={destination.name} />
                <div className={`${beigePanel} p-5 dark:bg-[#162C22]`}>
                  <h3 className="text-2xl font-black text-[#114F3C]">{destination.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-300">{destination.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <GalleryPreview images={galleryImages} onOpen={() => choosePage("gallery")} />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Traveler trust" title="Designed around what guests need before booking" />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-lg bg-white p-6 shadow-sm dark:bg-[#10241C] dark:shadow-black/20">
                <p className="text-sm leading-7 text-stone-700 dark:text-stone-300">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-4 dark:border-white/10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#114F3C] text-sm font-black text-[#F8A900]">
                    {testimonial.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-black text-[#114F3C] dark:text-[#F8A900]">{testimonial.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-[#F54C0D] text-white shadow-2xl shadow-[#F54C0D]/20">
          <div className="grid md:grid-cols-[1fr_0.45fr]">
            <div className="p-8 sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-white/80">Ready for your next walk?</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Book a seat or ask Ermija Hiking about the next group trip.</h2>
            </div>
            <a className="rounded-lg bg-white px-6 py-4 text-center text-base font-black text-[#114F3C] transition hover:bg-[#FCE4B4]" href={`https://wa.me/${whatsappNumber}`}>
              WhatsApp Ermija
            </a>
          </div>
            </div>
            <img className="hidden h-full min-h-72 w-full object-cover md:block" src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85" alt="Trail landscape" />
          </div>
        </div>
      </section>
    </>
  );
}
