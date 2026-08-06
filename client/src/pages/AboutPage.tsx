import { ArrowRight, CheckCircle2, Compass, HeartHandshake, Map, MessageCircle, Mountain, ShieldCheck, Users } from "lucide-react";
import { brandGreen, orangeButton, trustItems, whatsappNumber, yellowButton } from "../constants";

const storyStats = [
  { value: "Local", label: "Guides and route knowledge" },
  { value: "Group", label: "Friendly shared walks" },
  { value: "Clear", label: "Simple package details" }
];

const principles = [
  {
    title: "Walk with purpose",
    text: "Every trip is shaped around the route, the timing, the people joining, and the feeling guests should leave with.",
    Icon: Mountain
  },
  {
    title: "Show Ethiopia clearly",
    text: "The brand puts Ethiopian nature, culture, language, and local knowledge at the center of the experience.",
    Icon: Compass
  },
  {
    title: "Make joining simple",
    text: "Guests should understand the price, date, difficulty, seats, what to bring, and how to confirm without confusion.",
    Icon: CheckCircle2
  }
];

const processSteps = [
  { step: "01", title: "Route selection", text: "Destinations are chosen for scenery, walkability, timing, and group suitability." },
  { step: "02", title: "Trip preparation", text: "Each package is shaped with meeting point, inclusions, packing notes, and practical safety guidance." },
  { step: "03", title: "Guided experience", text: "Guests travel with a clear plan, local guidance, group pacing, and room for photos and rest." },
  { step: "04", title: "Follow-up", text: "Bookings, questions, and confirmations are handled through simple WhatsApp communication." }
];

export function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#071711] px-4 py-16 text-white sm:px-6 lg:px-8">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1800&q=85"
          alt="Hikers walking through mountain nature"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071711] via-[#114F3C]/90 to-black/35" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.76fr]">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#F8A900] backdrop-blur">
              About Ermija Hiking
            </p>
            <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">Walk Ethiopia with clarity, care, and local rhythm.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/84">
              Ermija means walk in Amharic. The company brings people together for guided outdoor experiences across Ethiopia's lakes, mountains, forests, highlands, and cultural routes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className={`inline-flex items-center gap-2 rounded-lg px-6 py-4 text-base font-black transition ${yellowButton}`} href={`https://wa.me/${whatsappNumber}`}>
                <MessageCircle className="h-5 w-5" />
                Talk to Ermija
              </a>
              <a className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-4 text-base font-black text-white backdrop-blur transition hover:bg-white/20" href="/trips">
                View trips
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          <aside className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/35 backdrop-blur">
            <img className="h-[420px] w-full rounded-lg object-cover" src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85" alt="Mountain walking route" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {storyStats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-white/10 p-4">
                  <p className="text-xl font-black text-[#F8A900]">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">The story</p>
            <h2 className="mt-3 text-4xl font-black text-[#114F3C] dark:text-[#F8A900]">A walking brand rooted in Ethiopian discovery.</h2>
          </div>
          <div className="grid gap-5 text-base leading-8 text-stone-700 dark:text-stone-300">
            <p>
              Ermija Hiking is built around a simple idea: people should be able to step out of the city, join a clear plan, and experience Ethiopia with guides who understand the routes, the timing, and the local context.
            </p>
            <p>
              The visual identity combines movement, exploration, and Ethiopian cultural cues. The service experience follows the same direction: direct, practical, welcoming, and easy to understand before a guest ever books.
            </p>
          </div>
        </div>
      </section>

      <section className={`${brandGreen} px-4 py-16 text-white sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F8A900]">What guides us</p>
            <h2 className="mt-3 text-4xl font-black">The experience should feel organized before it feels adventurous.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {principles.map(({ title, text, Icon }) => (
              <article key={title} className="rounded-lg border border-white/10 bg-white/10 p-6">
                <Icon className="h-8 w-8 text-[#F8A900]" />
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/74">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">How trips are shaped</p>
              <h2 className="mt-3 text-4xl font-black text-[#114F3C] dark:text-[#F8A900]">A simple operating rhythm for every route.</h2>
            </div>
            <p className="text-base leading-8 text-stone-700 dark:text-stone-300">
              Guests should know where to meet, what the route feels like, what is included, how hard the walk is, and what happens next. The website and admin system are built around that clarity.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {processSteps.map((item) => (
              <article key={item.step} className="rounded-lg border border-[#114F3C]/10 bg-surface p-6 shadow-sm dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
                <p className="text-sm font-black text-[#F54C0D]">{item.step}</p>
                <h3 className="mt-3 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-300">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
          {trustItems.map(({ title, text, Icon }) => (
            <article key={title} className="rounded-lg border border-[#114F3C]/10 bg-surface p-6 shadow-sm dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
              <Icon className="h-7 w-7 text-[#F54C0D]" />
              <h3 className="mt-5 text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-300">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-lg bg-[#F54C0D] text-white shadow-2xl shadow-[#F54C0D]/20 lg:grid-cols-[1fr_0.42fr]">
          <div className="p-8 sm:p-10">
            <HeartHandshake className="h-10 w-10 text-white/80" />
            <h2 className="mt-5 text-4xl font-black">Planning a group walk, company trip, or weekend escape?</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/84">
              Ermija Hiking can help shape a route, explain the package, and guide your group through the next available trip.
            </p>
            <a className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-4 text-base font-black text-[#114F3C] transition hover:bg-[#FCE4B4]" href={`https://wa.me/${whatsappNumber}`}>
              <MessageCircle className="h-5 w-5" />
              Start on WhatsApp
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-black/10 p-4">
            {[Map, Users, ShieldCheck, Compass].map((Icon, index) => (
              <div key={index} className="grid min-h-32 place-items-center rounded-lg bg-white/10">
                <Icon className="h-10 w-10 text-white" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
