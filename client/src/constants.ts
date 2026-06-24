import { Camera, Compass, Leaf, Map, ShieldCheck, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminTripForm, GalleryHighlight, Page } from "./types";

export const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "251913181343";
export const telegramUrl = "https://t.me/ermjahiking";
export const brandGreen = "bg-[#114F3C]";
export const yellowButton = "bg-[#F8A900] text-[#114F3C] hover:bg-[#ffc247]";
export const orangeButton = "bg-[#F54C0D] text-white hover:bg-[#d63f07]";
export const beigePanel = "bg-[#FCE4B4]";

export const destinations = [
  {
    name: "Wenchi",
    text: "Crater lake walks, calm water views, and a perfect day escape from Addis.",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Danakil",
    text: "Salt flats, volcanic terrain, and one of Ethiopia's most unforgettable landscapes.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Bale",
    text: "Highland air, forest trails, moorland views, and wildlife-rich mountain routes.",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80"
  }
];

export const navItems: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Trips", page: "trips" },
  { label: "Gallery", page: "gallery" },
  { label: "About", page: "about" },
  { label: "Contact", page: "contact" }
];

export const trustItems: { title: string; text: string; Icon: LucideIcon }[] = [
  { title: "Local experience", text: "Guides who know the routes, culture, language, and timing.", Icon: Leaf },
  { title: "Safe guided trips", text: "Planned meeting points, group guidance, and practical safety notes.", Icon: ShieldCheck },
  { title: "Group adventure", text: "Friendly group trips for new walkers, friends, and company outings.", Icon: Users },
  { title: "Hidden Ethiopia", text: "Lakes, highlands, forests, volcanic views, and local communities.", Icon: Compass }
];

export const heroStats = [
  { value: "12+", label: "Curated routes" },
  { value: "4.9", label: "Guest rating" },
  { value: "250+", label: "Happy walkers" }
];

export const experienceHighlights: { title: string; text: string; Icon: LucideIcon }[] = [
  { title: "Poster-ready trips", text: "Every package is presented with clear date, price, difficulty, seats, and inclusions.", Icon: Star },
  { title: "Visual-first planning", text: "Destination photography and galleries help guests picture the route before booking.", Icon: Camera },
  { title: "Simple journey flow", text: "Visitors can move from discovery to trip detail to WhatsApp confirmation in a few taps.", Icon: Map }
];

export const testimonials = [
  {
    name: "Mahi",
    role: "Weekend hiker",
    text: "The details were clear before we booked, and the group experience felt organized from meeting point to return."
  },
  {
    name: "Nahom",
    role: "Group trip guest",
    text: "The route, price, and what to bring were easy to understand. That made it simple to invite friends."
  },
  {
    name: "Sara",
    role: "Nature traveler",
    text: "The photos and itinerary helped me imagine the trip before joining. It felt professional and trustworthy."
  }
];

export const emptyAdminTripForm: AdminTripForm = {
  title: "",
  destination: "",
  date: "",
  duration: "Day Trip",
  price: "",
  difficulty: "Easy",
  availableSeats: "",
  meetingPoint: "",
  departureTime: "",
  returnTime: "",
  includes: "Transport, Guide, Entrance fee",
  whatToBring: "Water bottle, Comfortable shoes, Light jacket",
  notIncluded: "Personal expenses, Extra snacks, Personal insurance",
  itinerary: "Meet the guide and group.\nTravel to the destination.\nEnjoy the guided hiking experience.\nReturn with the group.",
  safetyNotes: "Trip details are checked by Ermija Hiking staff before publication.",
  description: "",
  coverImage: "",
  galleryImages: "",
  status: "Draft"
};

export const defaultGalleryHighlight: GalleryHighlight = {
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
