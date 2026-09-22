import type { Trip } from "./types";

export function bookingUnavailable(trip: Trip, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Addis_Ababa", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  const today = `${value("year")}-${value("month")}-${value("day")}`;
  if (trip.status !== "Published") return "This trip is not open for booking.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trip.date) || trip.date < today) return "This trip has already departed. Explore our upcoming trips for another date.";
  if (trip.availableSeats <= 0) return "This trip is sold out. Contact us about another departure.";
  return "";
}
