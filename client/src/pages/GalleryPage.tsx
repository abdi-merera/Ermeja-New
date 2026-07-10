import { CSSProperties, useMemo, useState } from "react";
import { Camera, ChevronRight, Film, Heart, Image, Instagram, MapPin, Play, Sparkles, Users } from "lucide-react";
import { defaultGalleryHighlight, orangeButton, whatsappNumber, yellowButton } from "../constants";
import type { GalleryHighlight } from "../types";

type GalleryCategory = "All" | "Destinations" | "Groups" | "Trails" | "Moments";

const categories: GalleryCategory[] = ["All", "Destinations", "Groups", "Trails", "Moments"];

const categoryIcons = {
  All: Sparkles,
  Destinations: MapPin,
  Groups: Users,
  Trails: Image,
  Moments: Camera
};

const galleryStories = [
  {
    title: "Crater lake calm",
    location: "Wenchi",
    category: "Destinations" as GalleryCategory,
    tone: "Lake views, green ridges, and slow scenic walking."
  },
  {
    title: "Group energy",
    location: "Addis day trip",
    category: "Groups" as GalleryCategory,
    tone: "Shared transport, shared photos, and a friendly trail rhythm. "
  },
  {
    title: "Highland routes",
    location: "Bale Mountains",
    category: "Trails" as GalleryCategory,
    tone: "Cool air, open paths, and mountain-style walking."
  },
  {
    title: "Golden hour stops",
    location: "Entoto",
    category: "Moments" as GalleryCategory,
    tone: "Short breaks, and photo-ready light."
  },
  {
    title: "Wild landscape",
    location: "Danakil",
    category: "Destinations" as GalleryCategory,
    tone: "A dramatic destination for bold multi-day explorers."
  },
  {
    title: "Trail friendship",
    location: "Community walks",
    category: "Groups" as GalleryCategory,
    tone: "The people you walk with become part of the memory."
  },
  {
    title: "Forest sections",
    location: "Menagesha",
    category: "Trails" as GalleryCategory,
    tone: "Shade, texture, fresh air, and quiet movement."
  },
  {
    title: "After-walk photos",
    location: "Trip moments",
    category: "Moments" as GalleryCategory,
    tone: "The proof that the day was worth stepping out for."
  }
];

const splitClipPaths = [
  "polygon(50% 50%,calc(50%*var(--_i,0)) calc(120%*var(--_i,0)),0 calc(100%*var(--_i,0)),0 0,100% 0,100% calc(100%*var(--_i,0)),calc(100% - 50%*var(--_i,0)) calc(120%*var(--_i,0)))",
  "polygon(50% 50%,calc(100% - 120%*var(--_i,0)) calc(50%*var(--_i,0)),calc(100% - 100%*var(--_i,0)) 0,100% 0,100% 100%,calc(100% - 100%*var(--_i,0)) 100%,calc(100% - 120%*var(--_i,0)) calc(100% - 50%*var(--_i,0)))",
  "polygon(50% 50%,calc(100% - 50%*var(--_i,0)) calc(100% - 120%*var(--_i,0)),100% calc(100% - 120%*var(--_i,0)),100% 100%,0 100%,0 calc(100% - 100%*var(--_i,0)),calc(50%*var(--_i,0)) calc(100% - 120%*var(--_i,0)))",
  "polygon(50% 50%,calc(120%*var(--_i,0)) calc(50%*var(--_i,0)),calc(100%*var(--_i,0)) 0,0 0,0 100%,calc(100%*var(--_i,0)) 100%,calc(120%*var(--_i,0)) calc(100% - 50%*var(--_i,0)))"
];

const splitTransforms = ["translate(0,-8px)", "translate(8px,0)", "translate(0,8px)", "translate(-8px,0)"];

function CircularSplitGallery({ images, activeImage, setActiveImage }: { images: string[]; activeImage: number; setActiveImage: (index: number) => void }) {
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const splitImages = images.slice(0, 4);

  return (
    <div className="grid justify-center">
      <div
        className="grid rounded-full"
        style={{ width: "min(78vw, 400px)", aspectRatio: "1" }}
        onMouseEnter={() => setIsGalleryHovered(true)}
        onMouseLeave={() => {
          setIsGalleryHovered(false);
          setHoveredImage(null);
        }}
      >
        {splitImages.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={galleryStories[index]?.title || "Ermija hiking visual story"}
            className="col-start-1 row-start-1 aspect-square w-full cursor-pointer object-cover shadow-2xl shadow-black/25"
            style={
              {
                "--_i": hoveredImage === index ? 1 : 0,
                borderRadius: "50%",
                clipPath: splitClipPaths[index],
                transform: isGalleryHovered ? "translate(0,0)" : splitTransforms[index],
                transition: hoveredImage === index ? "transform .12s, clip-path .18s .08s, z-index 0s" : ".18s, z-index 0s .18s",
                zIndex: hoveredImage === index ? 10 : 0
              } as CSSProperties
            }
            onMouseEnter={() => {
              setActiveImage(index);
              setHoveredImage(index);
            }}
            onMouseLeave={() => setHoveredImage(null)}
            onFocus={() => {
              setActiveImage(index);
              setHoveredImage(index);
            }}
            onBlur={() => setHoveredImage(null)}
            tabIndex={0}
          />
        ))}
      </div>
    </div>
  );
}

export function GalleryPage({ images, highlight = defaultGalleryHighlight }: { images: string[]; highlight?: GalleryHighlight }) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("All");
  const [activeSplitImage, setActiveSplitImage] = useState(0);
  const splitHighlights = highlight.items.length === 4 ? highlight.items : defaultGalleryHighlight.items;

  const enrichedImages = useMemo(
    () =>
      galleryStories.map((story, index) => ({
        ...story,
        image: images[index % Math.max(images.length, 1)] || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=85"
      })),
    [images]
  );

  const featured = enrichedImages[0];
  const filteredImages = activeCategory === "All" ? enrichedImages : enrichedImages.filter((item) => item.category === activeCategory);

  return (
    <section className="bg-[#fffaf0] transition-colors duration-300 dark:bg-[#071711]">
      <div className="relative overflow-hidden bg-[#114F3C] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-25">
          <img className="h-full w-full object-cover" src={featured.image} alt={featured.title} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#09251C] via-[#114F3C]/90 to-[#114F3C]/50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#F8A900] backdrop-blur">
              Visual stories
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">See the walk before you book it</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              A gallery should make visitors picture themselves on the trail. This page highlights destinations, groups, route details, and the small moments that make a hiking trip feel real.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["9+", "Photo stories"],
                ["4", "Gallery moods"],
                ["1 tap", "Book on WhatsApp"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black text-[#F8A900]">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {enrichedImages.slice(0, 6).map((item, index) => (
              <article
                key={item.title}
                className={`group relative overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-2xl shadow-black/20 ${index === 0 ? "col-span-2 row-span-2 min-h-80" : "min-h-40"}`}
              >
                <img className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" src={item.image} alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F8A900]">{item.category}</p>
                  <h2 className={`${index === 0 ? "text-2xl" : "text-base"} mt-1 font-black text-white`}>{item.title}</h2>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${
                  activeCategory === category ? "bg-[#114F3C] text-white shadow-lg shadow-[#114F3C]/20" : "bg-white text-[#114F3C] hover:bg-[#FCE4B4] dark:bg-[#10241C] dark:text-[#F8A900] dark:hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((item, index) => (
            <article
              key={item.title}
              className={`group overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#114F3C]/12 dark:bg-[#10241C] dark:shadow-black/20 ${
                index === 0 && activeCategory === "All" ? "md:col-span-2" : ""
              }`}
            >
              <div className={`relative ${index === 0 && activeCategory === "All" ? "h-96" : "h-72"} overflow-hidden`}>
                <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={item.image} alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-[#F8A900] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#114F3C]">
                  {item.category}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="flex items-center gap-2 text-sm font-bold text-white/80">
                    <MapPin className="h-4 w-4 text-[#F8A900]" />
                    {item.location}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{item.title}</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-stone-700 dark:text-stone-300">{item.tone}</p>
                <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#F54C0D]">
                  View feeling
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 overflow-hidden rounded-lg bg-[#114F3C] p-6 text-white shadow-2xl shadow-[#114F3C]/15 sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#F8A900]">{highlight.eyebrow || defaultGalleryHighlight.eyebrow}</p>
              <h2 className="mt-3 text-4xl font-black">{splitHighlights[activeSplitImage].title}</h2>
              <p className="mt-5 text-base leading-8 text-white/75">{splitHighlights[activeSplitImage].text}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {splitHighlights.map((highlight, index) => (
                  <button
                    key={`${highlight.title}-${index}`}
                    type="button"
                    onMouseEnter={() => setActiveSplitImage(index)}
                    onFocus={() => setActiveSplitImage(index)}
                    onClick={() => setActiveSplitImage(index)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-black transition ${
                      activeSplitImage === index ? "border-[#F8A900] bg-[#F8A900] text-[#114F3C]" : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")} {highlight.title}
                  </button>
                ))}
              </div>
            </div>
            <CircularSplitGallery images={splitHighlights.map((item) => item.image)} activeImage={activeSplitImage} setActiveImage={setActiveSplitImage} />
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          {[
            { title: "Instagram reels", text: "Short clips for trails, group arrivals, food stops, and destination reveals.", Icon: Instagram },
            { title: "TikTok trail moments", text: "Vertical videos that show movement, mood, people, and the route energy.", Icon: Film },
            { title: "Trip teaser clips", text: "Use quick edits before each upcoming trip to help guests decide faster.", Icon: Play }
          ].map(({ title, text, Icon }) => (
            <article key={title} className="relative overflow-hidden rounded-lg border border-[#114F3C]/10 bg-[#114F3C] p-6 text-white shadow-sm">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#F8A900]/20" />
              <Icon className="h-8 w-8 text-[#F8A900]" />
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/72">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 overflow-hidden rounded-lg bg-white shadow-xl shadow-[#114F3C]/10 transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-80">
              <img className="absolute inset-0 h-full w-full object-cover" src={enrichedImages[2]?.image || featured.image} alt="Trail memory" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <Heart className="h-8 w-8 text-[#F8A900]" />
                <h2 className="mt-4 text-3xl font-black">Photos make the decision emotional.</h2>
              </div>
            </div>
            <div className="p-8 sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#F54C0D]">Gallery goal</p>
              <h2 className="mt-3 text-4xl font-black text-[#114F3C]">Turn browsing into confidence.</h2>
              <p className="mt-5 text-base leading-8 text-stone-700 dark:text-stone-300">
                The gallery is built to show more than scenery. It shows people, movement, route personality, and the feeling of joining Ermija Hiking before a customer sends a booking message.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className={`rounded-lg px-5 py-4 text-sm font-black transition ${orangeButton}`} href={`https://wa.me/${whatsappNumber}`}>
                  Book through WhatsApp
                </a>
                <a className={`rounded-lg px-5 py-4 text-sm font-black transition ${yellowButton}`} href="/trips">
                  See upcoming trips
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
