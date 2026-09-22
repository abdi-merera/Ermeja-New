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
    text: "Immerse yourself in the breathtaking beauty of an extinct volcanic crater, featuring a serene alpine lake, lush mountain ridges, and soothing hot springs. Hike or ride horseback down to the shore, take a tranquil boat trip across the water to visit the historic 13th-century island monastery, and experience one of Ethiopia's premier eco-tourism villages.",
    image: "/Wenchi.jpg"
  },
  {
    name: "Awash Doho Lodge & Beynuna Village",
    text: "Escape to a tropical palm oasis nestled on the edge of Awash National Park. Unwind in therapeutic natural thermal hot spring pools, explore stunning waterfalls, and spot wild baboons and birdlife. Cap off the experience with an immersive cultural walk through Beynuna Village and relaxing evening campfires under the stars.",
    image: "/Doho.JPG"
  },
  {
    name: "Bale Mountains",
    text: "Journey into a wild, high-altitude sanctuary famous for its Afro-alpine plateaus, ancient cloud forests, and dramatic mountain peaks. Trek across the vast Sanetti Plateau—home to the endangered Ethiopian wolf and endemic mountain nyala—and venture into the mysterious subterranean limestone caverns of Sof Omar Cave.",
    image: "/Bale.jpg"
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
  { title: "Know before you go", text: "Check dates, prices, walking difficulty, and what is included before choosing your trip.", Icon: Star },
  { title: "Find your kind of adventure", text: "Explore photos of the places you could visit and find inspiration for your next walk.", Icon: Camera },
  { title: "Talk to our team", text: "Ask us about a route, check availability, or arrange your booking on WhatsApp.", Icon: Map }
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
  hotLeadDays: "5",
  meetingPoint: "",
  departureTime: "",
  returnDate: "",
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
  eyebrow: "Along the trail",
  items: [
    {
      title: "Views worth the walk",
      text: "Take in wide horizons and discover somewhere new.",
      image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Follow the trail",
      text: "Enjoy the changing scenery as you explore on foot.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Better together",
      text: "Share the walk, swap stories, and make time for a photo along the way.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Bring home a memory",
      text: "A new place, a shared moment, and a story to take home.",
      image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80"
    }
  ]
};
