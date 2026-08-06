import { CSSProperties, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Film, Heart, Images, Instagram, MapPin, Play } from "lucide-react";
import { defaultGalleryHighlight, orangeButton, whatsappNumber, yellowButton } from "../constants";
import type { GalleryHighlight, GalleryImage } from "../types";

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
            alt="Ermija hiking visual story"
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

export function GalleryPage({ images, highlight = defaultGalleryHighlight }: { images: GalleryImage[]; highlight?: GalleryHighlight }) {
  const [activeDestination, setActiveDestination] = useState<string | null>(null);
  const [activeSplitImage, setActiveSplitImage] = useState(0);
  const splitHighlights = highlight.items.length === 4 ? highlight.items : defaultGalleryHighlight.items;

  const destinationGroups = useMemo(
    () => Array.from(new Set(images.map((item) => item.destination).filter(Boolean))).map((destination) => ({
      destination,
      images: images.filter((item) => item.destination === destination)
    })),
    [images]
  );
  const selectedImages = activeDestination ? images.filter((item) => item.destination === activeDestination) : [];
  const featured = images[0];

  useEffect(() => {
    if (activeDestination && !destinationGroups.some((group) => group.destination === activeDestination)) {
      setActiveDestination(null);
    }
  }, [activeDestination, destinationGroups]);

  if (!featured) {
    return <section className="px-4 py-24 text-center text-lg font-bold">No gallery images are available yet.</section>;
  }

  return (
    <section className="bg-canvas transition-colors duration-300 dark:bg-[#071711]">
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
                [String(images.length), "Photo stories"],
                [String(destinationGroups.length), "Destinations"],
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
            {destinationGroups.slice(0, 6).map((group, index) => (
              <article
                key={group.destination}
                className={`group relative overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-2xl shadow-black/20 ${index === 0 ? "col-span-2 row-span-2 min-h-80" : "min-h-40"}`}
              >
                <img className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" src={group.images[0].image} alt={group.destination} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F8A900]">{group.images.length} {group.images.length === 1 ? "photo" : "photos"}</p>
                  <h2 className={`${index === 0 ? "text-2xl" : "text-base"} mt-1 font-black text-white`}>{group.destination}</h2>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {activeDestination ? (
          <section>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <button type="button" onClick={() => setActiveDestination(null)} className="inline-flex items-center gap-2 text-sm font-black text-[#F54C0D] transition hover:text-[#114F3C] dark:hover:text-[#F8A900]">
                  <ArrowLeft className="h-4 w-4" /> All destinations
                </button>
                <p className="mt-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]"><MapPin className="h-4 w-4" /> Destination album</p>
                <h2 className="mt-2 text-4xl font-black text-[#114F3C] dark:text-[#F8A900]">{activeDestination}</h2>
              </div>
              <p className="text-sm font-bold text-stone-600 dark:text-stone-300">{selectedImages.length} {selectedImages.length === 1 ? "photo" : "photos"}</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {selectedImages.map((item, index) => (
                <figure key={item.id} className={`group overflow-hidden rounded-xl bg-stone-200 shadow-sm ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
                  <img className={`h-full min-h-52 w-full object-cover transition duration-500 group-hover:scale-105 ${index === 0 ? "md:min-h-[430px]" : "md:min-h-64"}`} src={item.image} alt={`${activeDestination} trip photo ${index + 1}`} />
                </figure>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Browse by place</p>
              <h2 className="mt-2 text-4xl font-black text-[#114F3C] dark:text-[#F8A900]">Choose a destination</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">Open a destination to see every photo from its trips in one clean album.</p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {destinationGroups.map((group, index) => (
                <button key={group.destination} type="button" onClick={() => setActiveDestination(group.destination)} className={`group relative min-h-80 overflow-hidden rounded-2xl bg-[#114F3C] text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${index === 0 ? "md:col-span-2" : ""}`}>
                  <span className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 bg-[#114F3C]">
                    {group.images.slice(0, 4).map((item, imageIndex) => (
                      <img
                        key={item.id}
                        className={`h-full min-h-0 w-full object-cover transition duration-700 group-hover:scale-[1.03] ${group.images.length === 1 ? "col-span-2 row-span-2" : group.images.length === 2 ? "row-span-2" : imageIndex === 0 && group.images.length === 3 ? "row-span-2" : ""}`}
                        src={item.image}
                        alt={`${group.destination} preview ${imageIndex + 1}`}
                      />
                    ))}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="flex items-center gap-2 text-sm font-bold text-[#F8A900]"><Images className="h-4 w-4" /> {group.images.length} {group.images.length === 1 ? "photo" : "photos"}</p>
                    <h3 className="mt-2 text-3xl font-black">{group.destination}</h3>
                    <p className="mt-2 text-sm font-bold text-white/70">View all photos</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

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

        <section className="mt-12 overflow-hidden rounded-lg border border-[#114F3C]/10 bg-surface shadow-xl shadow-[#114F3C]/10 transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-80">
              <img className="absolute inset-0 h-full w-full object-cover" src={images[2]?.image || featured.image} alt="Trail memory" />
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
