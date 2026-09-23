import type { ItineraryDay } from "./types";

export const emptyItineraryDay = (): ItineraryDay => ({ activities: [{ title: "", description: "" }], overnight: "", meals: "" });

// Legacy prose remains intact. Explicit DAY headings determine day boundaries;
// otherwise the existing steps become activities within one day.
export function getItineraryDays(trip: { itinerary: string[]; itineraryDays?: ItineraryDay[] }): ItineraryDay[] {
  if (trip.itineraryDays?.length) return trip.itineraryDays;
  const days: ItineraryDay[] = [];
  for (const text of trip.itinerary) {
    if (!days.length || /^\s*DAY\s+\d+\b/i.test(text)) days.push({ activities: [], overnight: "", meals: "" });
    days[days.length - 1].activities.push({ title: "", description: text });
  }
  return days.length ? days : [emptyItineraryDay()];
}

export function serializeItinerary(days: ItineraryDay[]): string[] {
  return days.map((day, index) => [
    `Day ${index + 1}`,
    ...day.activities.map(activity => [activity.title, activity.description].filter(Boolean).join("\n")),
    day.overnight ? `Overnight: ${day.overnight}` : "",
    day.meals ? `Meals: ${day.meals}` : ""
  ].filter(Boolean).join("\n\n"));
}
