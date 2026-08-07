import "dotenv/config";
import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "trip-images";

if (!supabaseUrl || !serviceKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env");

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
const json = (path) => readFile(resolve(root, path), "utf8").then(JSON.parse);
const contentTypes = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };

async function setBucketLimit(bytes) {
  const response = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ public: true, file_size_limit: bytes, allowed_mime_types: Object.values(contentTypes) })
  });
  if (!response.ok) throw new Error(`Unable to configure Storage bucket: ${await response.text()}`);
}

await setBucketLimit(10 * 1024 * 1024);

async function uploadLocalImage(value) {
  if (!value?.startsWith("/uploads/")) return value;
  const fileName = basename(value);
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const body = await readFile(resolve(root, "server", "uploads", fileName));
  const objectPath = `migrated/${fileName}`;
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
  try {
    const existing = await fetch(publicUrl, { method: "HEAD" });
    if (existing.ok) return publicUrl;
  } catch {
    // Continue with the authenticated upload when the existence check fails.
  }
  let response;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": contentTypes[extension] || "application/octet-stream", "x-upsert": "true" },
        body
      });
      break;
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1000));
    }
  }
  if (!response.ok) throw new Error(`Image upload failed (${fileName}): ${await response.text()}`);
  return publicUrl;
}

async function rest(table, rows, conflict = "id") {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?on_conflict=${conflict}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows)
  });
  if (!response.ok) throw new Error(`${table} import failed: ${await response.text()}`);
}

const trips = await json("server/data/trips.json");
const highlight = await json("server/data/gallery-highlight.json");
const imageValues = [...new Set([
  ...trips.flatMap((trip) => [trip.coverImage, ...(trip.galleryImages || [])]),
  ...(highlight.items || []).map((item) => item.image)
])];
const migratedImages = new Map();
for (let index = 0; index < imageValues.length; index += 3) {
  const batch = imageValues.slice(index, index + 3);
  const urls = await Promise.all(batch.map(uploadLocalImage));
  batch.forEach((original, itemIndex) => migratedImages.set(original, urls[itemIndex]));
}
for (const trip of trips) {
  trip.coverImage = migratedImages.get(trip.coverImage) || trip.coverImage;
  trip.galleryImages = (trip.galleryImages || []).map((image) => migratedImages.get(image) || image);
}
for (const item of highlight.items || []) item.image = migratedImages.get(item.image) || item.image;

await rest("ermija_trips", trips.map((trip) => ({ id: trip.id, status: trip.status, date: trip.date, payload: trip })), "id");
await rest("ermija_site_settings", [{ key: "gallery-highlight", payload: highlight }], "key");

const bookings = await json("server/data/bookings.json");
if (bookings.length) await rest("ermija_bookings", bookings.map((item) => ({
  id: item.id.startsWith("booking-") ? crypto.randomUUID() : item.id,
  trip_id: item.tripId, customer_name: item.customerName, phone: item.phone,
  number_of_people: item.numberOfPeople, message: item.message, status: item.status, created_at: item.createdAt
})));

const messages = await json("server/data/messages.json");
if (messages.length) await rest("ermija_contact_messages", messages.map((item) => ({
  id: item.id, name: item.name, phone: item.phone, email: item.email,
  message: item.message, status: item.status, created_at: item.createdAt
})));

await setBucketLimit(6 * 1024 * 1024);

console.log(`Migrated ${trips.length} trips, ${bookings.length} bookings, ${messages.length} messages, and all referenced images.`);
