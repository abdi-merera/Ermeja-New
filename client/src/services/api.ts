import type { AdminLoginForm, AdminSession, AdminTripForm, Booking, BookingForm, ContactForm, ContactMessage, Trip, TripStatus } from "../types";
import { splitCommaList } from "../utils";

const adminSessionKey = "ermija-admin-session";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new ApiError(result.message || result.error_description || result.error || "Request failed.");
  }

  return result;
}

function jsonRequest<T>(url: string, method: string, body: unknown) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then((response) => parseResponse<T>(response));
}

function getStoredAdminSession() {
  const storedSession = window.localStorage.getItem(adminSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AdminSession;
  } catch {
    window.localStorage.removeItem(adminSessionKey);
    return null;
  }
}

function requireAdminToken() {
  const session = getStoredAdminSession();

  if (!session?.accessToken) {
    throw new ApiError("Please log in to manage admin data.");
  }

  return session.accessToken;
}

function adminJsonRequest<T>(url: string, method: string, body: unknown) {
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireAdminToken()}`
    },
    body: JSON.stringify(body)
  }).then((response) => parseResponse<T>(response));
}

function adminFetch<T>(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${requireAdminToken()}`
    }
  }).then((response) => parseResponse<T>(response));
}

function tripPayload(form: AdminTripForm) {
  const itinerary = form.itinerary
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    ...form,
    includes: splitCommaList(form.includes),
    whatToBring: splitCommaList(form.whatToBring),
    notIncluded: splitCommaList(form.notIncluded),
    itinerary,
    galleryImages: splitCommaList(form.galleryImages)
  };
}

function trustedSupabaseProjectUrl() {
  if (!supabaseUrl) {
    throw new ApiError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) {
      throw new ApiError("VITE_SUPABASE_URL must be an https://*.supabase.co URL.");
    }
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("VITE_SUPABASE_URL is invalid.");
  }
}

export function getTrips() {
  return fetch("/api/trips").then((response) => parseResponse<Trip[]>(response));
}

export function getAdminTrips() {
  return adminFetch<Trip[]>("/api/admin/trips");
}

export function createBooking(form: BookingForm, tripId: string) {
  return jsonRequest<{ booking: Booking; whatsappUrl: string }>("/api/bookings", "POST", { ...form, tripId });
}

export function sendContactMessage(form: ContactForm) {
  return jsonRequest<ContactMessage>("/api/contact", "POST", form);
}

export function uploadTripImage(file: File) {
  return fetch("/api/admin/uploads", {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      Authorization: `Bearer ${requireAdminToken()}`
    },
    body: file
  }).then((response) => parseResponse<{ url: string }>(response));
}

export function createTrip(form: AdminTripForm) {
  return adminJsonRequest<Trip>("/api/admin/trips", "POST", tripPayload(form));
}

export function updateTrip(trip: Trip, form: AdminTripForm) {
  return adminJsonRequest<Trip>(`/api/admin/trips/${trip.id}`, "PATCH", tripPayload(form));
}

export function updateTripStatus(trip: Trip, status: TripStatus) {
  return adminJsonRequest<Trip>(`/api/admin/trips/${trip.id}`, "PATCH", { status });
}

export function deleteTrip(trip: Trip) {
  return adminFetch<void>(`/api/admin/trips/${trip.id}`, { method: "DELETE" });
}

export function getBookings() {
  return adminFetch<Booking[]>("/api/admin/bookings");
}

export function updateBookingStatus(booking: Booking, status: string) {
  return adminJsonRequest<Booking>(`/api/admin/bookings/${booking.id}`, "PATCH", { status });
}

export function getMessages() {
  return adminFetch<ContactMessage[]>("/api/admin/messages");
}

export function updateMessageStatus(message: ContactMessage, status: string) {
  return adminJsonRequest<ContactMessage>(`/api/admin/messages/${message.id}`, "PATCH", { status });
}

export function getSavedAdminSession() {
  const session = getStoredAdminSession();

  if (!session || session.expiresAt <= Date.now()) {
    window.localStorage.removeItem(adminSessionKey);
    return null;
  }

  return session;
}

export async function loginAdmin(form: AdminLoginForm) {
  if (!supabaseAnonKey) {
    throw new ApiError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const result = await fetch(`${trustedSupabaseProjectUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: form.email,
      password: form.password
    })
  }).then((response) => parseResponse<{ access_token: string; refresh_token: string; expires_in: number; user: { email?: string } }>(response));

  const session: AdminSession = {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    email: result.user.email || form.email,
    expiresAt: Date.now() + result.expires_in * 1000
  };

  window.localStorage.setItem(adminSessionKey, JSON.stringify(session));
  return session;
}

export function logoutAdmin() {
  window.localStorage.removeItem(adminSessionKey);
}
