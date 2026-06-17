import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const now = new Date().toISOString();

const seedTrips = [
  {
    id: "wenchi-day-trip",
    title: "Wenchi Day Trip",
    destination: "Wenchi Crater Lake",
    description:
      "Walk the green crater rim, ride down to the lake, visit the island monastery, and share a calm group day outside Addis Ababa.",
    date: "2026-10-12",
    duration: "Day Trip",
    price: 3200,
    difficulty: "Easy",
    availableSeats: 18,
    meetingPoint: "Mexico Square, Addis Ababa",
    departureTime: "06:00",
    returnTime: "19:30",
    includes: ["Transport", "Local guide", "Lunch", "Entrance fee", "Photography"],
    whatToBring: ["Comfortable walking shoes", "Water bottle", "Sun hat", "Light jacket"],
    notIncluded: ["Personal snacks", "Horse ride fees", "Personal insurance"],
    itinerary: [
      "Meet the group in Addis Ababa and depart early.",
      "Arrive at Wenchi and start the crater-view walk.",
      "Visit the lakeside area and island monastery.",
      "Enjoy lunch, photos, and relaxed free time before returning."
    ],
    safetyNotes: "This is a guided group trip. Stay with the guide during the crater walk and follow local boat safety instructions.",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"
    ],
    status: "Published",
    createdBy: "admin",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "erta-ale-expedition",
    title: "Erta Ale Expedition",
    destination: "Erta Ale Volcano",
    description:
      "A multi-day desert adventure to one of Ethiopia's most dramatic volcanic landscapes with local Afar support.",
    date: "2026-11-08",
    duration: "Multi-day",
    price: 18500,
    difficulty: "Hard",
    availableSeats: 10,
    meetingPoint: "Bole International Airport domestic terminal",
    departureTime: "08:00",
    returnTime: "21:00",
    includes: ["4x4 transport", "Guides", "Camping gear", "Meals", "Permits"],
    whatToBring: ["Headlamp", "Hiking boots", "Power bank", "Light sleeping layer"],
    notIncluded: ["Flights", "Travel insurance", "Personal gear"],
    itinerary: [
      "Travel toward Afar and meet the local support crew.",
      "Drive through desert landscapes toward Erta Ale.",
      "Hike to the volcano camp and visit the crater area.",
      "Return through Afar villages and continue back to Addis Ababa."
    ],
    safetyNotes: "This trip requires heat tolerance and good walking fitness. Guides may adjust timing for weather and volcanic conditions.",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80"
    ],
    status: "Published",
    createdBy: "admin",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "bale-mountains-weekend",
    title: "Bale Mountains Weekend",
    destination: "Bale Mountains National Park",
    description:
      "A cool highland escape with moorland views, forest walks, wildlife spotting, and fresh mountain air.",
    date: "2026-12-04",
    duration: "Weekend",
    price: 9800,
    difficulty: "Medium",
    availableSeats: 14,
    meetingPoint: "Megenagna, Addis Ababa",
    departureTime: "05:30",
    returnTime: "20:00",
    includes: ["Transport", "Guide", "Lodge stay", "Park entrance", "Breakfast"],
    whatToBring: ["Warm jacket", "Rain shell", "Reusable bottle", "Trail snacks"],
    notIncluded: ["Dinner", "Personal purchases", "Horse trekking"],
    itinerary: [
      "Depart Addis Ababa and drive toward Bale.",
      "Explore forest trails and viewpoints.",
      "Visit Sanetti Plateau and nearby scenic stops.",
      "Return after breakfast and a short morning walk."
    ],
    safetyNotes: "Highland weather changes quickly. Bring warm layers and follow the guide during wildlife areas.",
    coverImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
    ],
    status: "Draft",
    createdBy: "admin",
    createdAt: now,
    updatedAt: now
  }
];

const ensureDataDir = () => {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
};

const readCollection = (fileName, fallback) => {
  ensureDataDir();
  const filePath = join(dataDir, fileName);

  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const writeCollection = (fileName, value) => {
  ensureDataDir();
  writeFileSync(join(dataDir, fileName), JSON.stringify(value, null, 2));
};

let trips = readCollection("trips.json", seedTrips);
let bookings = readCollection("bookings.json", []);
let contactMessages = readCollection("messages.json", []);

const saveTrips = () => writeCollection("trips.json", trips);
const saveBookings = () => writeCollection("bookings.json", bookings);
const saveMessages = () => writeCollection("messages.json", contactMessages);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const publicTrip = (trip) => ({
  ...trip,
  bookingsCount: bookings.filter((booking) => booking.tripId === trip.id).length
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Ermija Hiking API",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/trips", (req, res) => {
  const includeDrafts = req.query.includeDrafts === "true";
  const visibleTrips = includeDrafts ? trips : trips.filter((trip) => trip.status === "Published");
  res.json(visibleTrips.map(publicTrip));
});

app.get("/api/trips/:id", (req, res) => {
  const trip = trips.find((item) => item.id === req.params.id);

  if (!trip) {
    res.status(404).json({ message: "Trip not found" });
    return;
  }

  res.json(publicTrip(trip));
});

app.post("/api/bookings", (req, res) => {
  const { tripId, customerName, phone, numberOfPeople, message } = req.body;

  if (!tripId || !customerName || !phone || !numberOfPeople) {
    res.status(400).json({ message: "Trip, name, phone, and number of people are required." });
    return;
  }

  const trip = trips.find((item) => item.id === tripId && item.status === "Published");

  if (!trip) {
    res.status(404).json({ message: "Published trip not found." });
    return;
  }

  const people = Number(numberOfPeople);

  if (!Number.isFinite(people) || people < 1 || people > trip.availableSeats) {
    res.status(400).json({ message: "Number of people must fit available seats." });
    return;
  }

  const booking = {
    id: `booking-${Date.now()}`,
    tripId,
    customerName,
    phone,
    numberOfPeople: people,
    message: message || "",
    status: "New",
    createdAt: new Date().toISOString()
  };

  bookings = [booking, ...bookings];
  trip.availableSeats -= people;
  trip.updatedAt = new Date().toISOString();
  saveBookings();
  saveTrips();

  res.status(201).json({
    booking,
    whatsappUrl: `https://wa.me/251911234567?text=${encodeURIComponent(
      `Hello Ermija Hiking, I want to book ${trip.title} for ${people} people. My name is ${customerName}.`
    )}`
  });
});

app.get("/api/admin/bookings", (_req, res) => {
  res.json(bookings);
});

app.patch("/api/admin/bookings/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((booking) => booking.id === req.params.id);

  if (bookingIndex === -1) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    status: req.body.status || bookings[bookingIndex].status,
    updatedAt: new Date().toISOString()
  };

  saveBookings();
  res.json(bookings[bookingIndex]);
});

app.post("/api/contact", (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !phone || !message) {
    res.status(400).json({ message: "Name, phone, and message are required." });
    return;
  }

  const contactMessage = {
    id: `message-${Date.now()}`,
    name,
    phone,
    email: email || "",
    message,
    status: "New",
    createdAt: new Date().toISOString()
  };

  contactMessages = [contactMessage, ...contactMessages];
  saveMessages();
  res.status(201).json(contactMessage);
});

app.get("/api/admin/messages", (_req, res) => {
  res.json(contactMessages);
});

app.patch("/api/admin/messages/:id", (req, res) => {
  const messageIndex = contactMessages.findIndex((message) => message.id === req.params.id);

  if (messageIndex === -1) {
    res.status(404).json({ message: "Message not found" });
    return;
  }

  contactMessages[messageIndex] = {
    ...contactMessages[messageIndex],
    status: req.body.status || contactMessages[messageIndex].status,
    updatedAt: new Date().toISOString()
  };

  saveMessages();
  res.json(contactMessages[messageIndex]);
});

app.post("/api/admin/trips", (req, res) => {
  const { title, destination, date, duration, price, difficulty, availableSeats, meetingPoint, departureTime, returnTime, includes, whatToBring, description, coverImage, galleryImages, status } = req.body;

  if (!title || !destination || !date || !duration || !price || !difficulty || !availableSeats || !description) {
    res.status(400).json({ message: "Missing required trip fields." });
    return;
  }

  const idBase = slugify(title);
  const id = trips.some((trip) => trip.id === idBase) ? `${idBase}-${Date.now()}` : idBase;
  const createdAt = new Date().toISOString();
  const trip = {
    id,
    title,
    destination,
    description,
    date,
    duration,
    price: Number(price),
    difficulty,
    availableSeats: Number(availableSeats),
    meetingPoint: meetingPoint || "To be announced",
    departureTime: departureTime || "To be announced",
    returnTime: returnTime || "To be announced",
    includes: Array.isArray(includes) ? includes : String(includes || "").split(",").map((item) => item.trim()).filter(Boolean),
    whatToBring: Array.isArray(whatToBring) ? whatToBring : String(whatToBring || "").split(",").map((item) => item.trim()).filter(Boolean),
    notIncluded: ["Personal expenses"],
    itinerary: ["Meet the guide and group.", "Travel to the destination.", "Enjoy the guided hiking experience.", "Return with the group."],
    safetyNotes: "Trip details are checked by Ermija Hiking staff before publication.",
    coverImage: coverImage || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
    status: status === "Published" ? "Published" : "Draft",
    createdBy: "admin",
    createdAt,
    updatedAt: createdAt
  };

  trips = [trip, ...trips];
  saveTrips();
  res.status(201).json(trip);
});

app.patch("/api/admin/trips/:id", (req, res) => {
  const tripIndex = trips.findIndex((trip) => trip.id === req.params.id);

  if (tripIndex === -1) {
    res.status(404).json({ message: "Trip not found" });
    return;
  }

  trips[tripIndex] = {
    ...trips[tripIndex],
    ...req.body,
    price: req.body.price === undefined ? trips[tripIndex].price : Number(req.body.price),
    availableSeats: req.body.availableSeats === undefined ? trips[tripIndex].availableSeats : Number(req.body.availableSeats),
    updatedAt: new Date().toISOString()
  };

  saveTrips();
  res.json(trips[tripIndex]);
});

app.delete("/api/admin/trips/:id", (req, res) => {
  const beforeCount = trips.length;
  trips = trips.filter((trip) => trip.id !== req.params.id);

  if (trips.length === beforeCount) {
    res.status(404).json({ message: "Trip not found" });
    return;
  }

  saveTrips();
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
