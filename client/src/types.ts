import type { FormEvent } from "react";

export type TripStatus = "Draft" | "Published";
export type Page = "home" | "trips" | "gallery" | "about" | "contact" | "admin";

export type Trip = {
  id: string;
  title: string;
  destination: string;
  description: string;
  date: string;
  duration: string;
  price: number;
  difficulty: string;
  availableSeats: number;
  hotLeadDays?: number;
  meetingPoint: string;
  departureTime: string;
  returnDate?: string;
  returnTime: string;
  includes: string[];
  whatToBring: string[];
  notIncluded: string[];
  itinerary: string[];
  safetyNotes: string;
  coverImage: string;
  galleryImages: string[];
  status: TripStatus;
  bookingsCount?: number;
};

export type BookingForm = {
  customerName: string;
  phone: string;
  numberOfPeople: string;
  message: string;
};

export type ContactForm = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export type PrivateTripRequest = {
  name: string;
  phone: string;
  email: string;
  destination: string;
  preferredDate: string;
  groupSize: string;
  notes: string;
};

export type AdminLoginForm = {
  email: string;
  password: string;
};

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  expiresAt: number;
};

export type Booking = {
  id: string;
  tripId: string;
  customerName: string;
  phone: string;
  numberOfPeople: number;
  message: string;
  status: string;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
};

export type GalleryHighlightItem = {
  title: string;
  text: string;
  image: string;
};

export type GalleryHighlight = {
  eyebrow: string;
  items: GalleryHighlightItem[];
};

export type GalleryImage = {
  id: string;
  tripId: string;
  image: string;
  title: string;
  destination: string;
  description: string;
  source: "destination" | "cover" | "gallery";
};

export type AdminTripForm = {
  title: string;
  destination: string;
  date: string;
  duration: string;
  price: string;
  difficulty: string;
  availableSeats: string;
  hotLeadDays: string;
  meetingPoint: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  includes: string;
  whatToBring: string;
  notIncluded: string;
  itinerary: string;
  safetyNotes: string;
  description: string;
  coverImage: string;
  galleryImages: string;
  status: TripStatus;
};

export type BookingSubmitHandler = (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
export type ContactSubmitHandler = (event: FormEvent<HTMLFormElement>) => void;
export type AdminTripSubmitHandler = (event: FormEvent<HTMLFormElement>) => void;
