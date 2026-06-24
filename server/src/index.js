import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "..", "..", ".env") });
dotenv.config();

const dataDir = join(__dirname, "..", "data");
const uploadDir = join(__dirname, "..", "uploads");
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5174";
const whatsappNumber = process.env.WHATSAPP_NUMBER || "251913181343";
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const normalizedSupabaseUrl = supabaseUrl.replace(/\/$/, "");

const ensureTrustedSupabaseUrl = (value) => {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) {
      throw new Error("SUPABASE_URL must be an https://*.supabase.co URL.");
    }
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid SUPABASE_URL.");
  }
};

const trustedSupabaseUrl = ensureTrustedSupabaseUrl(normalizedSupabaseUrl);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    }
  })
);
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(express.json({ limit: "2mb" }));
mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

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
    id: "entoto-sunrise-walk",
    title: "Entoto Sunrise Walk",
    destination: "Entoto Hills",
    description:
      "A refreshing early-morning walk above Addis Ababa with forest air, city views, sunrise stops, and a slow coffee finish.",
    date: "2026-09-20",
    duration: "Morning Trip",
    price: 1800,
    difficulty: "Easy",
    availableSeats: 20,
    meetingPoint: "Shiro Meda, Addis Ababa",
    departureTime: "05:30",
    returnTime: "11:30",
    includes: ["Guide", "Coffee stop", "Photography", "Route support"],
    whatToBring: ["Walking shoes", "Water bottle", "Light jacket", "Sun protection"],
    notIncluded: ["Breakfast", "Personal transport", "Personal expenses"],
    itinerary: [
      "Meet before sunrise at Shiro Meda.",
      "Walk through Entoto's forest trails and viewpoint route.",
      "Stop for photos as the city wakes up below.",
      "Finish with coffee and return before midday."
    ],
    safetyNotes: "This is a light walk, but mornings can be cold. Bring a layer and stay with the group on forest paths.",
    coverImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
    ],
    status: "Published",
    createdBy: "admin",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "menagesha-forest-escape",
    title: "Menagesha Forest Escape",
    destination: "Menagesha Suba Forest",
    description:
      "A green forest trail day with shaded climbs, old-growth trees, picnic pauses, and a calmer pace outside the city.",
    date: "2026-09-27",
    duration: "Day Trip",
    price: 2600,
    difficulty: "Medium",
    availableSeats: 16,
    meetingPoint: "Megenagna, Addis Ababa",
    departureTime: "06:30",
    returnTime: "18:00",
    includes: ["Transport", "Guide", "Entrance fee", "Lunch snack"],
    whatToBring: ["Trail shoes", "Rain jacket", "Water bottle", "Small backpack"],
    notIncluded: ["Full lunch", "Personal snacks", "Personal insurance"],
    itinerary: [
      "Depart Addis Ababa and drive toward Menagesha.",
      "Begin the forest trail with guided pacing.",
      "Take a picnic and photo break under the trees.",
      "Return to Addis after an easy afternoon descent."
    ],
    safetyNotes: "Forest trails can be muddy after rain. Wear shoes with grip and keep water-resistant layers nearby.",
    coverImage:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80"
    ],
    status: "Published",
    createdBy: "admin",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "blue-nile-falls-weekend",
    title: "Blue Nile Falls Weekend",
    destination: "Bahir Dar and Blue Nile Falls",
    description:
      "A weekend route built around waterfall views, relaxed lakeside time, easy walking, and warm group travel rhythm.",
    date: "2026-10-24",
    duration: "Weekend",
    price: 11200,
    difficulty: "Easy",
    availableSeats: 12,
    meetingPoint: "Bole area, Addis Ababa",
    departureTime: "07:00",
    returnTime: "20:30",
    includes: ["Transport", "Guide", "Hotel stay", "Breakfast", "Entrance fee"],
    whatToBring: ["Comfortable shoes", "Light rain jacket", "Power bank", "Camera"],
    notIncluded: ["Dinner", "Boat extras", "Personal expenses"],
    itinerary: [
      "Travel from Addis Ababa toward Bahir Dar.",
      "Settle in and enjoy a relaxed lakeside evening.",
      "Walk the Blue Nile Falls route with the guide.",
      "Return after breakfast and a final viewpoint stop."
    ],
    safetyNotes: "Waterfall paths may be slippery in wet weather. Follow the guide at viewpoints and bridges.",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
    ],
    status: "Published",
    createdBy: "admin",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "debre-libanos-gorge-walk",
    title: "Debre Libanos Gorge Walk",
    destination: "Debre Libanos and Jemma Gorge",
    description:
      "A scenic day trip with monastery history, big gorge views, a guided walking route, and a strong photography finish.",
    date: "2026-11-21",
    duration: "Day Trip",
    price: 2900,
    difficulty: "Medium",
    availableSeats: 18,
    meetingPoint: "Piassa, Addis Ababa",
    departureTime: "06:00",
    returnTime: "19:00",
    includes: ["Transport", "Guide", "Entrance fee", "Lunch"],
    whatToBring: ["Comfortable shoes", "Hat", "Water bottle", "Light jacket"],
    notIncluded: ["Personal purchases", "Extra snacks", "Personal insurance"],
    itinerary: [
      "Depart Addis Ababa in the morning.",
      "Visit Debre Libanos and continue to the gorge viewpoint.",
      "Walk the guided route with photo stops.",
      "Share lunch and return to Addis in the evening."
    ],
    safetyNotes: "Some viewpoint edges are exposed. Keep distance from cliff edges and follow guide instructions.",
    coverImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
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

const defaultGalleryHighlight = {
  eyebrow: "Interactive highlight",
  items: [
    {
      title: "Destination view",
      text: "The first frame sets the location: crater rim, lake edge, mountain road, or volcanic landscape.",
      image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Route texture",
      text: "The second frame shows what the walk feels like underfoot, from forest paths to open highland tracks.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Group rhythm",
      text: "The third frame captures people moving together, sharing breaks, photos, and the pace of the day.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "After-walk memory",
      text: "The fourth frame is the emotional close: the view, the light, and the moment guests remember later.",
      image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80"
    }
  ]
};

const ensureDataDir = () => {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
};

const readCollection = (fileName, fallback) => {
  ensureDataDir();
  const filePath = safeJoin(dataDir, fileName);

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
  writeFileSync(safeJoin(dataDir, fileName), JSON.stringify(value, null, 2));
};

let trips = readCollection("trips.json", seedTrips);
let bookings = readCollection("bookings.json", []);
let contactMessages = readCollection("messages.json", []);
let galleryHighlight = readCollection("gallery-highlight.json", defaultGalleryHighlight);

const saveTrips = () => writeCollection("trips.json", trips);
const saveBookings = () => writeCollection("bookings.json", bookings);
const saveMessages = () => writeCollection("messages.json", contactMessages);
const saveGalleryHighlight = () => writeCollection("gallery-highlight.json", galleryHighlight);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const publicTrip = (trip) => ({
  ...trip,
  bookingsCount: bookings.filter((booking) => booking.tripId === trip.id).length
});

function safeJoin(baseDir, fileName) {
  const basePath = resolve(baseDir);
  const targetPath = resolve(basePath, fileName);

  if (targetPath !== basePath && !targetPath.startsWith(`${basePath}\\`) && !targetPath.startsWith(`${basePath}/`)) {
    throw new Error("Invalid file path.");
  }

  return targetPath;
}

function textValue(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeGalleryHighlight(value) {
  const items = Array.isArray(value?.items) ? value.items : [];

  return {
    eyebrow: textValue(value?.eyebrow || defaultGalleryHighlight.eyebrow, 60),
    items: defaultGalleryHighlight.items.map((fallback, index) => {
      const item = items[index] || {};
      return {
        title: textValue(item.title || fallback.title, 80),
        text: textValue(item.text || fallback.text, 280),
        image: textValue(item.image || fallback.image, 600)
      };
    })
  };
}

function isTooLong(value, maxLength) {
  return String(value || "").length > maxLength;
}

function requireTrustedOrigin(req, res, next) {
  const origin = req.get("origin");

  if (origin && origin !== allowedOrigin) {
    res.status(403).json({ message: "Request origin is not allowed." });
    return;
  }

  next();
}

function requireJsonBody(req, res, next) {
  if (!req.is("application/json")) {
    res.status(415).json({ message: "Content-Type must be application/json." });
    return;
  }

  next();
}

function createRateLimiter({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const nowMs = Date.now();
    const current = hits.get(key) || { count: 0, resetAt: nowMs + windowMs };

    if (current.resetAt <= nowMs) {
      current.count = 0;
      current.resetAt = nowMs + windowMs;
    }

    current.count += 1;
    hits.set(key, current);

    if (current.count > max) {
      res.status(429).json({ message: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}

const publicWriteLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

const requireAdmin = async (req, res, next) => {
  if (!trustedSupabaseUrl || !supabaseAnonKey || !adminEmails.length) {
    res.status(500).json({ message: "Admin auth is not configured." });
    return;
  }

  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    res.status(401).json({ message: "Admin login required." });
    return;
  }

  try {
    const response = await fetch(`${trustedSupabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      res.status(401).json({ message: "Admin session expired. Please log in again." });
      return;
    }

    const user = await response.json();
    const email = String(user.email || "").toLowerCase();

    if (!adminEmails.includes(email)) {
      res.status(403).json({ message: "This account is not allowed to manage the admin dashboard." });
      return;
    }

    req.adminUser = user;
    next();
  } catch {
    res.status(503).json({ message: "Unable to verify admin session." });
  }
};

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Ermija Hiking API",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/trips", (req, res) => {
  const visibleTrips = trips.filter((trip) => trip.status === "Published");
  res.json(visibleTrips.map(publicTrip));
});

app.get("/api/gallery-highlight", (_req, res) => {
  res.json(normalizeGalleryHighlight(galleryHighlight));
});

app.use("/api/admin", requireTrustedOrigin);

app.get("/api/admin/trips", requireAdmin, (_req, res) => {
  res.json(trips.map(publicTrip));
});

app.patch("/api/admin/gallery-highlight", requireAdmin, (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (items.length !== 4) {
    res.status(400).json({ message: "Gallery highlight needs exactly four items." });
    return;
  }

  if (items.some((item) => !item?.title || !item?.text || !item?.image)) {
    res.status(400).json({ message: "Each gallery highlight item needs title, text, and image." });
    return;
  }

  galleryHighlight = normalizeGalleryHighlight(req.body);
  saveGalleryHighlight();
  res.json(galleryHighlight);
});

app.get("/api/trips/:id", (req, res) => {
  const trip = trips.find((item) => item.id === req.params.id);

  if (!trip) {
    res.status(404).json({ message: "Trip not found" });
    return;
  }

  res.json(publicTrip(trip));
});

app.post("/api/bookings", requireTrustedOrigin, requireJsonBody, publicWriteLimiter, (req, res) => {
  const { tripId, customerName, phone, numberOfPeople, message } = req.body;

  if (!tripId || !customerName || !phone || !numberOfPeople) {
    res.status(400).json({ message: "Trip, name, phone, and number of people are required." });
    return;
  }

  if (isTooLong(tripId, 140) || isTooLong(customerName, 80) || isTooLong(phone, 32) || isTooLong(message, 800)) {
    res.status(400).json({ message: "Booking fields are too long." });
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
    customerName: textValue(customerName, 80),
    phone: textValue(phone, 32),
    numberOfPeople: people,
    message: textValue(message, 800),
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
    whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `Hello Ermija Hiking, I want to book ${trip.title} for ${people} people. My name is ${customerName}.`
    )}`
  });
});

app.get("/api/admin/bookings", requireAdmin, (_req, res) => {
  res.json(bookings);
});

app.patch("/api/admin/bookings/:id", requireAdmin, (req, res) => {
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

app.post("/api/contact", requireTrustedOrigin, requireJsonBody, publicWriteLimiter, (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !phone || !message) {
    res.status(400).json({ message: "Name, phone, and message are required." });
    return;
  }

  if (isTooLong(name, 80) || isTooLong(phone, 32) || isTooLong(email, 120) || isTooLong(message, 1200)) {
    res.status(400).json({ message: "Contact fields are too long." });
    return;
  }

  const contactMessage = {
    id: `message-${Date.now()}`,
    name: textValue(name, 80),
    phone: textValue(phone, 32),
    email: textValue(email, 120),
    message: textValue(message, 1200),
    status: "New",
    createdAt: new Date().toISOString()
  };

  contactMessages = [contactMessage, ...contactMessages];
  saveMessages();
  res.status(201).json(contactMessage);
});

app.get("/api/admin/messages", requireAdmin, (_req, res) => {
  res.json(contactMessages);
});

app.patch("/api/admin/messages/:id", requireAdmin, (req, res) => {
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

app.post(
  "/api/admin/uploads",
  requireAdmin,
  express.raw({ type: ["image/jpeg", "image/png", "image/webp", "image/gif"], limit: "8mb" }),
  (req, res) => {
    const extensionByType = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif"
    };
    const contentType = req.get("content-type") || "";
    const extension = extensionByType[contentType];

    if (!extension) {
      res.status(415).json({ message: "Please upload a JPG, PNG, WEBP, or GIF image." });
      return;
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ message: "No image file was received." });
      return;
    }

    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    writeFileSync(safeJoin(uploadDir, fileName), req.body);
    res.status(201).json({ url: `/uploads/${fileName}` });
  }
);

app.post("/api/admin/trips", requireAdmin, (req, res) => {
  const { title, destination, date, duration, price, difficulty, availableSeats, meetingPoint, departureTime, returnTime, includes, whatToBring, notIncluded, itinerary, safetyNotes, description, coverImage, galleryImages, status } = req.body;

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
    notIncluded: Array.isArray(notIncluded) && notIncluded.length ? notIncluded : ["Personal expenses"],
    itinerary: Array.isArray(itinerary) && itinerary.length ? itinerary : ["Meet the guide and group.", "Travel to the destination.", "Enjoy the guided hiking experience.", "Return with the group."],
    safetyNotes: safetyNotes || "Trip details are checked by Ermija Hiking staff before publication.",
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

app.patch("/api/admin/trips/:id", requireAdmin, (req, res) => {
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

app.delete("/api/admin/trips/:id", requireAdmin, (req, res) => {
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
