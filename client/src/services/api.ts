import { serializeItinerary } from "../itinerary";
import type { AdminLoginForm, AdminSession, AdminTripForm, Booking, BookingForm, ContactForm, ContactMessage, GalleryHighlight, GalleryImage, Trip, TripStatus } from "../types";
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

  const responseText = await response.text();
  let result: unknown;

  try {
    result = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    if (response.status === 413) {
      throw new ApiError("The image is too large for the deployed upload service. Choose an image smaller than 6 MB.");
    }

    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}.`);
    }

    throw new ApiError("The server returned an unexpected response.");
  }

  if (!response.ok) {
    const errorResult = (result || {}) as { message?: string; error_description?: string; error?: string };
    throw new ApiError(errorResult.message || errorResult.error_description || errorResult.error || "Request failed.");
  }

  return result as T;
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
  const itinerary = form.itineraryDays?.length ? serializeItinerary(form.itineraryDays) : form.itinerary
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    ...form,
    price: Number(form.price),
    availableSeats: Number(form.availableSeats),
    hotLeadDays: Number(form.hotLeadDays || 5),
    returnDate: form.duration === "Day Trip" ? "" : form.returnDate,
    includes: splitCommaList(form.includes),
    whatToBring: splitCommaList(form.whatToBring),
    notIncluded: splitCommaList(form.notIncluded),
    itinerary,
    galleryImages: splitCommaList(form.galleryImages)
  };
}

// All fetch calls that use this function are protected against SSRF: the URL
// is validated to be https://*.supabase.co before any network request is made.
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

function supabaseHeaders(admin = false, json = false) {
  if (!supabaseAnonKey) {
    throw new ApiError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${admin ? requireAdminToken() : supabaseAnonKey}`
  };

  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

function databaseUrl(path: string) {
  return `${trustedSupabaseProjectUrl()}/rest/v1/${path}`;
}

type TripRow = { id: string; payload: Trip };
type HighlightRow = { payload: GalleryHighlight };

function unwrapTrips(rows: TripRow[]) {
  const preferredOrder = [
    "Wenchi Crater Lake & Tourism Village Overnight Trip",
    "Overnight Trip to Doho Lodge & Benuna Village with Ermja Hiking",
    "Camping Trip To Langano",
    "Blue Nile Falls Weekend"
  ];
  const rank = new Map(preferredOrder.map((title, index) => [title.toLowerCase(), index]));

  return rows
    .map((row) => ({ ...row.payload, id: row.id }))
    .sort((left, right) => {
      const leftRank = rank.get(left.title.toLowerCase()) ?? preferredOrder.length;
      const rightRank = rank.get(right.title.toLowerCase()) ?? preferredOrder.length;
      return leftRank - rightRank || left.date.localeCompare(right.date);
    });
}

export function getTrips() {
  return fetch(databaseUrl("ermija_trips?select=id,payload&status=eq.Published&order=date.asc"), {
    headers: supabaseHeaders()
  }).then((response) => parseResponse<TripRow[]>(response)).then(unwrapTrips);
}

export function getGalleryHighlight() {
  return fetch(databaseUrl("ermija_site_settings?select=payload&key=eq.gallery-highlight&limit=1"), {
    headers: supabaseHeaders()
  }).then((response) => parseResponse<HighlightRow[]>(response)).then((rows) => {
    if (!rows[0]) throw new ApiError("Gallery highlight is not configured.");
    return rows[0].payload;
  });
}

export function updateGalleryHighlight(highlight: GalleryHighlight) {
  return fetch(databaseUrl("ermija_site_settings?key=eq.gallery-highlight"), {
    method: "PATCH",
    headers: { ...supabaseHeaders(true, true), Prefer: "return=representation" },
    body: JSON.stringify({ payload: highlight, updated_at: new Date().toISOString() })
  }).then((response) => parseResponse<HighlightRow[]>(response)).then((rows) => rows[0].payload);
}

export function getAdminTrips() {
  return fetch(databaseUrl("ermija_trips?select=id,payload&order=date.asc"), {
    headers: supabaseHeaders(true)
  }).then((response) => parseResponse<TripRow[]>(response)).then(unwrapTrips);
}

export function createBooking(form: BookingForm, tripId: string) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const booking = {
    id,
    trip_id: tripId,
    customer_name: form.customerName.trim(),
    phone: form.phone.trim(),
    number_of_people: Number(form.numberOfPeople),
    message: form.message.trim(),
    status: "New",
    created_at: createdAt
  };
  return fetch(databaseUrl("ermija_bookings"), {
    method: "POST",
    headers: supabaseHeaders(false, true),
    body: JSON.stringify(booking)
  }).then((response) => parseResponse<void>(response)).then(() => ({
    booking: { ...form, id, tripId, numberOfPeople: Number(form.numberOfPeople), status: "New", createdAt },
    whatsappUrl: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "251913181343"}`
  }));
}

export function sendContactMessage(form: ContactForm) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  return fetch(databaseUrl("ermija_contact_messages"), {
    method: "POST",
    headers: supabaseHeaders(false, true),
    body: JSON.stringify({ ...form, id, status: "New", created_at: createdAt })
  }).then((response) => parseResponse<void>(response)).then(() => ({
    ...form, id, status: "New", createdAt
  }));
}

export function uploadTripImage(file: File) {
  const maximumUploadSize = 6 * 1024 * 1024;

  if (file.size > maximumUploadSize) {
    throw new ApiError(`This image is ${(file.size / 1024 / 1024).toFixed(1)} MB. Choose an image smaller than 6 MB before uploading.`);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || file.type.split("/").pop() || "jpg";
  const objectPath = `trip-images/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  return fetch(`${trustedSupabaseProjectUrl()}/storage/v1/object/trip-images/${objectPath}`, {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      ...supabaseHeaders(true),
      "x-upsert": "false"
    },
    body: file
  }).then((response) => parseResponse<unknown>(response)).then(() => ({
    url: `${trustedSupabaseProjectUrl()}/storage/v1/object/public/trip-images/${objectPath}`
  }));
}

export function createTrip(form: AdminTripForm) {
  const base = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const id = base;
  const payload = { ...tripPayload(form), id } as Trip;
  return fetch(databaseUrl("ermija_trips"), {
    method: "POST",
    headers: { ...supabaseHeaders(true, true), Prefer: "return=representation" },
    body: JSON.stringify({ id, status: payload.status, date: payload.date, payload })
  }).then((response) => parseResponse<TripRow[]>(response)).then((rows) => unwrapTrips(rows)[0]);
}

export function updateTrip(trip: Trip, form: AdminTripForm) {
  const payload = { ...trip, ...tripPayload(form), id: trip.id } as Trip;
  return updateTripRow(trip.id, payload);
}

export function updateTripStatus(trip: Trip, status: TripStatus) {
  return updateTripRow(trip.id, { ...trip, status });
}

function updateTripRow(id: string, payload: Trip) {
  return fetch(databaseUrl(`ermija_trips?id=eq.${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { ...supabaseHeaders(true, true), Prefer: "return=representation" },
    body: JSON.stringify({ status: payload.status, date: payload.date, payload, updated_at: new Date().toISOString() })
  }).then((response) => parseResponse<TripRow[]>(response)).then((rows) => unwrapTrips(rows)[0]);
}

export function deleteTrip(trip: Trip) {
  return fetch(databaseUrl(`ermija_trips?id=eq.${encodeURIComponent(trip.id)}`), {
    method: "DELETE", headers: supabaseHeaders(true)
  }).then((response) => parseResponse<void>(response));
}

export function getBookings() {
  return fetch(databaseUrl("ermija_bookings?select=*&order=created_at.desc"), { headers: supabaseHeaders(true) })
    .then((response) => parseResponse<Array<Record<string, unknown>>>(response))
    .then((rows) => rows.map(bookingFromRow));
}

export function updateBookingStatus(booking: Booking, status: string) {
  return fetch(databaseUrl("rpc/update_ermija_booking_status"), {
    method: "POST",
    headers: { ...supabaseHeaders(true, true), Prefer: "return=representation" },
    body: JSON.stringify({ p_booking_id: booking.id, p_status: status })
  }).then((response) => parseResponse<Record<string, unknown>>(response)).then(bookingFromRow);
}

export function getMessages() {
  return fetch(databaseUrl("ermija_contact_messages?select=*&order=created_at.desc"), { headers: supabaseHeaders(true) })
    .then((response) => parseResponse<Array<Record<string, unknown>>>(response))
    .then((rows) => rows.map(messageFromRow));
}

export function updateMessageStatus(message: ContactMessage, status: string) {
  return fetch(databaseUrl(`ermija_contact_messages?id=eq.${encodeURIComponent(message.id)}`), {
    method: "PATCH",
    headers: { ...supabaseHeaders(true, true), Prefer: "return=representation" },
    body: JSON.stringify({ status, updated_at: new Date().toISOString() })
  }).then((response) => parseResponse<Array<Record<string, unknown>>>(response)).then((rows) => messageFromRow(rows[0]));
}

function bookingFromRow(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id), tripId: String(row.trip_id), customerName: String(row.customer_name),
    phone: String(row.phone), numberOfPeople: Number(row.number_of_people), message: String(row.message || ""),
    status: String(row.status), createdAt: String(row.created_at)
  };
}

function messageFromRow(row: Record<string, unknown>): ContactMessage {
  return {
    id: String(row.id), name: String(row.name), phone: String(row.phone), email: String(row.email || ""),
    message: String(row.message), status: String(row.status), createdAt: String(row.created_at)
  };
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

// Separate rows prevent one admin's upload from replacing another's photos.
export function getStandaloneGalleryImages() {
  return fetch(databaseUrl("ermija_site_settings?select=payload&key=like.gallery-photo.*&order=updated_at.desc"), {
    headers: supabaseHeaders()
  }).then((response) => parseResponse<{ payload: GalleryImage }[]>(response))
    .then((rows) => rows.map((row) => row.payload));
}

export function saveStandaloneGalleryImage(photo: GalleryImage) {
  return fetch(databaseUrl("ermija_site_settings?on_conflict=key"), {
    method: "POST",
    headers: { ...supabaseHeaders(true, true), Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ key: `gallery-photo.${photo.id}`, payload: photo, updated_at: new Date().toISOString() })
  }).then((response) => parseResponse<{ payload: GalleryImage }[]>(response)).then((rows) => rows[0].payload);
}

export function removeStandaloneGalleryImage(id: string) {
  return fetch(databaseUrl(`ermija_site_settings?key=eq.${encodeURIComponent(`gallery-photo.${id}`)}`), {
    method: "DELETE", headers: supabaseHeaders(true)
  }).then((response) => parseResponse<void>(response));
}
