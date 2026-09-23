import { ArrowRight, CheckCircle2, Flame, MessageCircle } from "lucide-react";
import { beigePanel, brandGreen, destinations, experienceHighlights, heroStats, orangeButton, trustItems, whatsappNumber, yellowButton } from "../constants";
import { GalleryPreview } from "../components/GalleryPreview";
import { SectionTitle } from "../components/SectionTitle";
import { TripCard } from "../components/TripCard";
import type { GalleryImage, Page, Trip } from "../types";
import { formatPrice, isHotTrip } from "../utils";

const googleReviewUrl = "https://search.google.com/local/writereview?placeid=ChIJ0Z_w4jt5SxYRGwjl68dCYq0";

export function HomePage({ trips, galleryImages, choosePage, chooseTrip }: { trips: Trip[]; galleryImages: GalleryImage[]; choosePage: (page: Page) => void; chooseTrip: (trip: Trip) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTrips = [...trips]
    .filter((trip) => {
      const tripDate = new Date(`${trip.date}T00:00:00`);
      return !Number.isNaN(tripDate.getTime()) && tripDate >= today;
    })
    .sort((first, second) => first.date.localeCompare(second.date));
  const daysUntil = (trip: Trip) => Math.ceil((new Date(`${trip.date}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
  const hotTrip = upcomingTrips.find((trip) => isHotTrip(trip)) || null;
  const daysUntilHotTrip = hotTrip ? daysUntil(hotTrip) : null;
  const countdown = daysUntilHotTrip === 0 ? "Leaving today" : daysUntilHotTrip === 1 ? "Leaving tomorrow" : `Leaving in ${daysUntilHotTrip} days`;

  return (
    <>
      <section className="relative overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.jpg"
          alt="Hikers walking through mountain nature"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09251C]/95 via-[#114F3C]/78 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-canvas to-transparent dark:from-[#071711]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:py-20 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8">
          <div className="max-w-3xl py-4 lg:self-start lg:pb-0 lg:pt-16">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#F8A900] backdrop-blur">
              Guided Ethiopian adventures
            </p>
            <h1 className="max-w-4xl text-center [container-type:inline-size] text-[clamp(1.875rem,8vw,3rem)] font-black leading-tight text-white sm:text-6xl lg:text-6xl"><span className="block whitespace-nowrap">እርምጃ Hiking</span><span className="mt-2 block whitespace-nowrap text-[6.6cqw] leading-tight">Explore Ethiopia with us</span></h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
              Discover upcoming hikes, compare packages, book a group trip, and step into Ethiopia's mountains, lakes, forests, and hidden places with local guides.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => choosePage("trips")} className={`inline-flex items-center gap-2 rounded-lg px-6 py-4 text-base font-black transition ${yellowButton}`}>
                View Trips
                <ArrowRight className="h-5 w-5" />
              </button>
              <a className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-4 text-base font-black text-white backdrop-blur transition hover:bg-white/20" href={`https://wa.me/${whatsappNumber}`}>
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            </div>
            <div className="mt-6 grid max-w-2xl grid-cols-3 gap-3">
              {heroStats.map((stat) => stat.label === "Guest rating" ? (
                <a key={stat.label} href={googleReviewUrl} target="_blank" rel="noopener noreferrer" aria-label={`${stat.value} guest rating. Review us on Google (opens in a new tab)`} className="rounded-lg border border-white/15 bg-white/10 p-4 text-white backdrop-blur transition hover:border-[#F8A900] hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8A900]">
                  <p className="text-2xl font-black text-[#F8A900]">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/75">{stat.label} <ArrowRight aria-hidden="true" className="inline h-3 w-3 -rotate-45" /></p>
                </a>
              ) : (
                <div key={stat.label} className="rounded-lg border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
                  <p className="text-2xl font-black text-[#F8A900]">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative hidden lg:block">
            <button
              type="button"
              disabled={!hotTrip}
              onClick={() => hotTrip && chooseTrip(hotTrip)}
              className={`w-full rounded-lg border border-white/20 bg-white/10 p-4 text-left shadow-2xl shadow-black/40 backdrop-blur-md transition ${hotTrip ? "cursor-pointer hover:-translate-y-1 hover:border-[#F8A900]/70" : "cursor-default"}`}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img className={`h-[clamp(380px,52vh,500px)] w-full object-cover transition duration-700 ${hotTrip ? "hover:scale-105" : "object-bottom opacity-75"}`} src={hotTrip?.coverImage || "/hero.jpg"} alt={hotTrip?.title || "A future Ermija Hiking adventure"} />
                {hotTrip ? (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#F54C0D] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg">
                    <Flame className="h-4 w-4" /> Hot trip
                  </span>
                ) : null}
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F8A900]">{hotTrip ? countdown : "Next adventure"}</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{hotTrip?.title || "Something memorable is taking shape"}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/75">{hotTrip ? `${hotTrip.destination} / ${hotTrip.duration} / ${hotTrip.difficulty}` : "Looking for your next adventure? Browse our trips or ask us about a private group outing."}</p>
                </div>
                {hotTrip ? <div className="rounded-lg bg-[#F8A900] px-4 py-3 text-center text-[#114F3C]"><p className="text-xs font-black uppercase">From</p><p className="text-xl font-black">{formatPrice(hotTrip.price)}</p></div> : null}
              </div>
            </button>
            <div className="relative mt-3 ml-6 mr-6 rounded-lg border border-[#114F3C]/10 bg-surface p-4 shadow-xl dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/30">
              <p className="text-sm font-black text-[#114F3C] dark:text-[#F8A900]">{hotTrip ? "Why it is hot" : "Plan your next walk"}</p>
              <div className="mt-3 space-y-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                {(hotTrip ? [countdown, `${hotTrip.availableSeats} seats available`, "Tap to view trip"] : ["Ask about upcoming dates", "Plan a private group trip", "Browse available trips"]).map((item) => (
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
          <SectionTitle eyebrow="Upcoming trips" title="Choose your next walk" text="Explore upcoming walks and find the right date, destination, and pace for you." />
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
          <SectionTitle eyebrow="Experience" title="Your next adventure starts here" text="Find a walk that suits you, see what is included, and get in touch when you are ready to join." />
          <div className="grid gap-5 md:grid-cols-3">
            {experienceHighlights.map(({ title, text, Icon }) => (
              <article key={title} className="rounded-lg border border-[#114F3C]/10 bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
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
              <article key={destination.name} className="flex h-full flex-col overflow-hidden rounded-lg border border-[#114F3C]/10 bg-surface shadow-sm dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
                <img className="h-56 w-full object-cover" src={destination.image} alt={destination.name} />
                <div className={`${beigePanel} flex-1 p-5 dark:bg-[#162C22]`}>
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
          <SectionTitle eyebrow="Guest stories" title="See experiences shared by the Ermija community" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Google Reviews", "Hiked with us? Share your experience to help other travelers plan their next adventure.", googleReviewUrl],
              ["Instagram", "Trip photos, tagged guests and comments from recent walks.", "https://www.instagram.com/ermja__hiking?igsh=a3pneGhxNnJ5ejQ0&utm_source=qr"],
              ["Facebook", "Catch up on trip updates and stories from our hiking community.", "https://www.facebook.com/share/1jlnaqcqen/?mibextid=wwxifr"],
              ["Linktree", "Find all our social pages and contact links in one place.", "https://linktr.ee/ermja_hiking"]
            ].map(([name, text, url]) => <a key={name} href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-[#114F3C]/10 bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#10241C]">
              <p className="text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{name}</p><p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-300">{text}</p><p className="mt-5 text-sm font-black text-[#F54C0D]">{name === "Google Reviews" ? "Review us on Google" : "View guest posts"} <span aria-hidden="true">&rarr;</span></p>
            </a>)}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-[#F54C0D] text-white shadow-2xl shadow-[#F54C0D]/20">
          <div className="grid md:grid-cols-[1.4fr_1fr]">
            <div className="flex items-center p-6 sm:p-8">
          <div className="grid justify-items-start gap-5">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-white/80">Ready for your next walk?</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Book a seat or ask Ermija Hiking about the next group trip.</h2>
            </div>
            <a className="rounded-lg bg-white px-6 py-4 text-center text-base font-black text-[#114F3C] transition hover:bg-[#FCE4B4]" href={`https://wa.me/${whatsappNumber}`}>
              WhatsApp Ermija
            </a>
          </div>
            </div>
            <div className="relative h-64 md:h-auto md:min-h-80">
              <img className="absolute inset-0 h-full w-full object-cover" src="/Redfox.JPG" alt="Red fox in its natural habitat" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
