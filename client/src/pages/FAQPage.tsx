const faqs = [
  ["How do I book a trip?", "Choose a trip, complete the booking request form, and our team will contact you to confirm availability and arrangements."],
  ["Is my booking confirmed immediately?", "No. Submitting a request does not confirm your seats. Your booking is confirmed after our team reviews availability and contacts you."],
  ["What payment currencies do you accept?", "Local guest prices are shown in ETB. Foreign visitor prices are shown in USD and may be paid in USD or the equivalent ETB amount."],
  ["What is the difference between a group and private trip?", "A group trip is shared with other guests on a scheduled departure. A private trip is arranged exclusively for your group with more flexibility."],
  ["What is included in the trip price?", "Each trip has its own Included and Not included sections. Review the trip details or contact us if you need clarification."],
  ["What should I bring?", "Bring water, comfortable walking shoes, weather-appropriate clothing, personal medication, and any items listed in the trip details."],
  ["What happens if the weather changes?", "Our guides monitor conditions and may adjust timing, routes, or activities to keep guests safe. We will communicate important changes."],
  ["Can I cancel or change my booking?", "Contact us as early as possible. Cancellation, payment, and refund arrangements depend on the trip and how close it is to departure."],
  ["Do you arrange private group trips?", "Yes. Tell us your preferred destination, date, group size, difficulty, and transport needs, and we can recommend an arrangement."],
  ["Where do trips usually meet?", "Many departures begin from central Addis Ababa meeting points. The exact meeting point and time are confirmed before departure."]
];

export function FAQPage() {
  return <main className="min-h-screen bg-canvas px-4 py-12 transition-colors dark:bg-[#071711] sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Need to know</p><h1 className="mt-3 text-4xl font-black text-[#114F3C] dark:text-[#F8A900] sm:text-5xl">Frequently asked questions</h1><p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">Everything you need to know before planning and booking an Ermija Hiking adventure.</p><div className="mt-8 space-y-3">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-[#114F3C]/10 bg-surface p-5 shadow-sm dark:border-white/10 dark:bg-[#10241C]"><summary className="cursor-pointer list-none pr-8 text-lg font-black text-[#114F3C] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8A900] dark:text-white [&::-webkit-details-marker]:hidden">{question}<span aria-hidden="true" className="float-right text-2xl leading-5 text-[#F54C0D] transition group-open:rotate-45">+</span></summary><p className="pt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">{answer}</p></details>)}</div></div></main>;
}
