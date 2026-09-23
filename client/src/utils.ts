import type { Trip } from "./types";

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export const formatPrice = (value: number) => `ETB ${new Intl.NumberFormat("en").format(value)}`;

export function splitCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isHotTrip(trip: Trip, now = new Date()): boolean {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const departure = new Date(`${trip.date}T00:00:00`);
  const days = Math.ceil((departure.getTime() - today.getTime()) / 86_400_000);
  return trip.status === "Published" && days >= 0 && days <= (trip.hotLeadDays ?? 5);
}
