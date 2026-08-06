import { CheckCircle2 } from "lucide-react";
import type { Trip } from "../types";

export function DetailGrid({ trip }: { trip: Trip }) {
  const blocks = [
    { title: "Meeting point", items: [trip.meetingPoint, `Departure: ${trip.departureTime}`, `Return: ${trip.returnTime}`] },
    { title: "Included", items: trip.includes },
    { title: "What to bring", items: trip.whatToBring },
    { title: "Not included", items: trip.notIncluded },
    { title: "Itinerary", items: trip.itinerary },
    { title: "Safety notes", items: [trip.safetyNotes] }
  ];

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {blocks.map((block) => (
        <section key={block.title} className="rounded-lg border border-[#114F3C]/10 bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
          <h3 className="text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{block.title}</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700 dark:text-stone-300">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9EC26D]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
