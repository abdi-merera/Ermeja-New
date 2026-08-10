import { CalendarCheck, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { brandGreen, orangeButton, whatsappNumber, yellowButton } from "../constants";
import type { ContactForm, ContactSubmitHandler } from "../types";
import contactImage from "../../../public/Sof Oumer.jpg";

const contactHeroImage = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85";

const contactCards = [
  { title: "WhatsApp", text: "Fastest way to confirm seats, ask for prices, or plan a group trip.", value: "+251 913 181 343", Icon: MessageCircle },
  { title: "Phone", text: "Call when you need quick timing, meeting point, or package details.", value: "+251 913 181 343", Icon: Phone },
  { title: "Email", text: "Best for company outings, school groups, and detailed private requests.", value: "hello@ermijahiking.com", Icon: Mail }
];

const planningSteps = [
  "Tell us your group size, preferred date, and destination idea.",
  "We recommend a route, timing, transport plan, and package estimate.",
  "You confirm the seats and receive the final meeting details."
];

export function ContactPage({ contactForm, setContactForm, submitContact }: { contactForm: ContactForm; setContactForm: (form: ContactForm) => void; submitContact: ContactSubmitHandler }) {
  return (
    <section className="bg-canvas transition-colors duration-300 dark:bg-[#071711]">
      <div className="relative overflow-hidden bg-[#114F3C] px-4 py-16 text-white sm:px-6 lg:px-8">
        <img className="absolute inset-0 h-full w-full object-cover opacity-30" src={contactHeroImage} alt="Guided hiking path in Ethiopia" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061B15] via-[#114F3C]/90 to-[#114F3C]/40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#F8A900] backdrop-blur">
              Contact Ermija
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">Start with a message. We will help shape the trip.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Ask about an upcoming package, request a private group walk, or confirm the details you need before booking.
            </p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <HeroStat value="Same day" label="Reply window" Icon={Clock} />
              <HeroStat value="Group" label="Trip planning" Icon={Users} />
              <HeroStat value="WhatsApp" label="Booking flow" Icon={MessageCircle} />
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur">
            <div className="overflow-hidden rounded-lg">
              <img className="h-80 w-full object-cover" src={contactImage} alt="Sof Omar cave destination in Ethiopia" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Private groups", "Weekend packages", "Company outings", "Route advice"].map((item) => (
                <p key={item} className="flex items-center gap-3 rounded-lg bg-white/10 p-3 text-sm font-bold text-white/80">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#9EC26D]" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-5 md:grid-cols-3">
          {contactCards.map(({ title, text, value, Icon }) => (
            <ContactCard key={title} title={title} text={text} value={value} Icon={Icon} />
          ))}
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className={`${brandGreen} h-fit rounded-lg p-6 text-white shadow-xl shadow-[#114F3C]/15 lg:sticky lg:top-24`}>
            <MapPin className="h-10 w-10 text-[#F8A900]" />
            <h2 className="mt-5 text-3xl font-black">Based in Addis Ababa, planning trips across Ethiopia</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Most group departures begin from central Addis Ababa meeting points. Exact pickup, departure time, and packing details are confirmed after booking.
            </p>

            <div className="mt-6 space-y-3">
              {[
                ["Main city", "Addis Ababa, Ethiopia"],
                ["Common meeting", "Mexico Square or Bole area"],
                ["Best channel", "WhatsApp for quick confirmation"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/50">{label}</p>
                  <p className="mt-1 text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <a className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-4 text-sm font-black transition ${yellowButton}`} href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Ermija Hiking, I want help planning a trip.")}`}>
              <MessageCircle className="h-5 w-5" />
              Open WhatsApp
            </a>
          </aside>

          <div>
            <form className="rounded-lg border border-[#114F3C]/10 bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20 sm:p-8" onSubmit={submitContact}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Send inquiry</p>
                  <h2 className="mt-2 text-3xl font-black text-[#114F3C]">Tell us what kind of trip you want</h2>
                </div>
                <p className="rounded-lg bg-[#FCE4B4] px-4 py-3 text-sm font-black text-[#114F3C]">Reply within 24h</p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <input required className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Full name" value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} />
                </Field>
                <Field label="Phone">
                  <input required className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Phone / WhatsApp" value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Email">
                  <input className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Email address" value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Message">
                  <textarea required className="min-h-44 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:focus:bg-white/10" placeholder="Example: We are 8 people and want a weekend trip near Addis in October..." value={contactForm.message} onChange={(event) => setContactForm({ ...contactForm, message: event.target.value })} />
                </Field>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="submit" className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-4 text-base font-black transition ${orangeButton}`}>
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
                <p className="text-sm font-semibold leading-6 text-stone-500 dark:text-stone-400">Use the form for detailed requests, or WhatsApp for the fastest seat confirmation.</p>
              </div>
            </form>

            <section className="mt-6 rounded-lg bg-[#FCE4B4] p-6 shadow-sm transition-colors duration-300 dark:bg-[#162C22] sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <CalendarCheck className="h-10 w-10 text-[#F54C0D]" />
                  <h2 className="mt-4 text-3xl font-black text-[#114F3C]">Planning a private group trip?</h2>
                  <p className="mt-3 text-sm leading-7 text-[#114F3C]/75">
                    Send the date range, number of people, preferred difficulty, and whether you need transport from Addis Ababa.
                  </p>
                </div>
                <div className="space-y-3">
                  {planningSteps.map((step, index) => (
                    <div key={step} className="flex gap-4 rounded-lg bg-white/70 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#114F3C] text-sm font-black text-[#F8A900]">{index + 1}</span>
                      <p className="text-sm font-bold leading-6 text-stone-700 dark:text-stone-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </section>
  );
}

function HeroStat({ value, label, Icon }: { value: string; label: string; Icon: LucideIcon }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-[#F8A900]" />
      <p className="mt-3 text-lg font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/60">{label}</p>
    </div>
  );
}

function ContactCard({ title, text, value, Icon }: { title: string; text: string; value: string; Icon: LucideIcon }) {
  return (
    <article className="rounded-lg border border-[#114F3C]/10 bg-surface p-6 shadow-xl shadow-[#114F3C]/10 transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
      <Icon className="h-9 w-9 text-[#F54C0D]" />
      <h2 className="mt-4 text-2xl font-black text-[#114F3C]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{text}</p>
      <p className="mt-5 rounded-lg bg-stone-50 px-4 py-3 text-sm font-black text-[#114F3C] dark:bg-white/5 dark:text-[#F8A900]">{value}</p>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">{label}</span>
      {children}
    </label>
  );
}
