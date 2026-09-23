import "./GalleryPage.css";
import { CSSProperties, TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Film, Heart, Images, Instagram, MapPin, Play, X } from "lucide-react";
import { defaultGalleryHighlight, orangeButton, whatsappNumber, yellowButton } from "../constants";
import type { GalleryHighlight, GalleryImage, Trip } from "../types";

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

export function GalleryPage({ images, trips, chooseTrip, highlight = defaultGalleryHighlight }: { images: GalleryImage[]; trips: Trip[]; chooseTrip: (trip: Trip) => void; highlight?: GalleryHighlight }) {
  const albumHeadingRef = useRef<HTMLHeadingElement>(null);
  const scrollToAlbum = useRef(false);
  const [activeDestination, setActiveDestination] = useState<string | null>(null);
  const [activeSplitImage, setActiveSplitImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showPhotoGrid, setShowPhotoGrid] = useState(false);
  const wheelStageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const splitHighlights = highlight.items.length === 4 ? highlight.items : defaultGalleryHighlight.items;

  const destinationGroups = useMemo(
    () => Array.from(new Set(images.map((item) => item.destination).filter(Boolean))).map((destination) => ({
      destination,
      images: images.filter((item) => item.destination === destination).sort((a, b) => Number(b.source === "cover") - Number(a.source === "cover"))
    })),
    [images]
  );
  const otherAlbums = destinationGroups.filter((group) => group.destination !== activeDestination);
  const openAlbum = (destination: string) => {
    scrollToAlbum.current = true;
    setLightboxIndex(null);
    setShowPhotoGrid(false);
    setActiveDestination(destination);
  };
  useEffect(() => {
    if (!scrollToAlbum.current || !activeDestination) return;
    scrollToAlbum.current = false;
    albumHeadingRef.current?.focus({ preventScroll: true });
    albumHeadingRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [activeDestination]);

  const selectedImages = activeDestination ? images.filter((item) => item.destination === activeDestination) : [];
  const featured = images[0];
  const selectedTrip = trips.find((trip) => selectedImages.some((image) => image.tripId === trip.id));
  const moveLightbox = (direction: number) => setLightboxIndex((current) => current === null || !selectedImages.length ? current : (current + direction + selectedImages.length) % selectedImages.length);

  useEffect(() => {
    if (activeDestination && !destinationGroups.some((group) => group.destination === activeDestination)) {
      setActiveDestination(null);
    }
  }, [activeDestination, destinationGroups]);

  const viewerOpen = lightboxIndex !== null && Boolean(selectedImages[lightboxIndex]);
  useEffect(() => {
    if (!viewerOpen) return;
    const dialog = viewerRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [viewerOpen]);

  useEffect(() => {
    const stage = wheelStageRef.current;
    if (!stage || !viewerOpen || showPhotoGrid || selectedImages.length < 2) return;
    let amount = 0;
    let lastMove = 0;
    let lastWheel = 0;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const now = Date.now();
      if (now - lastWheel > 180) amount = 0;
      lastWheel = now;
      if (now - lastMove < 420) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      amount += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 600 : 1);
      if (Math.abs(amount) >= 45) {
        const direction = amount > 0 ? 1 : -1;
        setLightboxIndex((current) => current === null ? null : (current + direction + selectedImages.length) % selectedImages.length);
        amount = 0; lastMove = now;
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [viewerOpen, showPhotoGrid, selectedImages.length]);

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 45) moveLightbox(distance > 0 ? -1 : 1);
    touchStartX.current = null;
  };

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
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#F8A900] backdrop-blur">
              Visual stories
            </p>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-6xl">See the walk before you book it</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Explore landscapes, shared adventures, and memorable moments from the trail. Find a place you would love to visit next.
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
                className={`group relative overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-2xl shadow-black/20 ${index === 0 ? "col-span-2 row-span-2 min-h-56 sm:min-h-80" : "min-h-40"}`}
              >
                <img loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" src={group.images[0].image} alt={group.destination} />
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
                <h2 ref={albumHeadingRef} tabIndex={-1} className="mt-2 scroll-mt-32 text-2xl sm:text-4xl font-black text-[#114F3C] outline-none dark:text-[#F8A900]">{activeDestination}</h2>
              </div>
              <p className="text-sm font-bold text-stone-600 dark:text-stone-300">{selectedImages.length} {selectedImages.length === 1 ? "photo" : "photos"}</p>
            </div>

            {selectedTrip ? <button type="button" onClick={() => chooseTrip(selectedTrip)} className={`mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black ${yellowButton}`}>View trip details <ExternalLink className="h-4 w-4" /></button> : null}

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {selectedImages.map((item, index) => (
                <button type="button" onClick={() => { setLightboxIndex(index); setShowPhotoGrid(false); }} key={item.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F8A900]" aria-label={`Open photo ${index + 1} of ${selectedImages.length}`}>
                  <img loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={item.image} alt={item.title || `${activeDestination} photo ${index + 1}`} />
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">{index + 1}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F54C0D]">Browse by place</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#114F3C] dark:text-[#F8A900]">Choose a destination</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">Open a destination to see every photo from its trips in one clean album.</p>
            </div>

            <DestinationAlbums groups={destinationGroups} onSelect={openAlbum} featuredFirst />
          </section>
        )}

        <section className="mt-12 overflow-hidden rounded-lg bg-[#114F3C] p-4 text-white shadow-2xl shadow-[#114F3C]/15 sm:p-8">
          <div className="grid items-center gap-5 sm:gap-8 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#F8A900]">{highlight.eyebrow || defaultGalleryHighlight.eyebrow}</p>
              <h2 className="mt-3 text-2xl sm:text-4xl font-black">{splitHighlights[activeSplitImage].title}</h2>
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

        {activeDestination && otherAlbums.length > 0 ? (
          <section className="mt-12" aria-labelledby="other-albums-heading">
            <h2 id="other-albums-heading" className="text-2xl sm:text-3xl font-black text-[#114F3C] dark:text-[#F8A900]">Explore other albums</h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Choose another destination to keep exploring.</p>
            <DestinationAlbums groups={otherAlbums} onSelect={openAlbum} />
          </section>
        ) : null}

        <section className="mt-12 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          {[
            { title: "Instagram reels", text: "See trail views, group adventures, and memorable stops from our walks.", Icon: Instagram, href: "https://www.instagram.com/ermja__hiking?igsh=a3pneGhxNnJ5ejQ0&utm_source=qr", platform: "Instagram" },
            { title: "TikTok trail moments", text: "Enjoy a glimpse of life on the trail with our hiking community.", Icon: Film, href: "https://www.tiktok.com/@ermjahikingg?_r=1&_t=zn-98ldwtbjfgk", platform: "TikTok" },
            { title: "Facebook adventures", text: "Discover new places and find inspiration for your next outing.", Icon: Play, href: "https://www.facebook.com/share/1jlnaqcqen/?mibextid=wwxifr", platform: "Facebook" }
          ].map(({ title, text, Icon, href, platform }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Visit Ermija Hiking on ${platform} (opens in a new tab)`} className="group relative overflow-hidden rounded-lg border border-[#114F3C]/10 bg-[#114F3C] p-4 sm:p-6 text-white shadow-sm transition hover:-translate-y-1 hover:border-[#F8A900]/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8A900]">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#F8A900]/20" />
              <Icon className="h-8 w-8 text-[#F8A900]" />
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/72">{text}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#F8A900]">Visit {platform} <ExternalLink className="h-4 w-4" /></span>
            </a>
          ))}
        </section>

        <section className="mt-12 overflow-hidden rounded-lg border border-[#114F3C]/10 bg-surface shadow-xl shadow-[#114F3C]/10 transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-56 sm:min-h-80">
              <img className="absolute inset-0 h-full w-full object-cover" src={images[2]?.image || featured.image} alt="Trail memory" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <Heart className="h-8 w-8 text-[#F8A900]" />
                <h2 className="mt-4 text-2xl sm:text-3xl font-black">Make memories beyond the city.</h2>
              </div>
            </div>
            <div className="p-5 sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#F54C0D]">Your next adventure</p>
              <h2 className="mt-3 text-2xl sm:text-4xl font-black text-[#114F3C]">Ready to join us?</h2>
              <p className="mt-5 text-base leading-8 text-stone-700 dark:text-stone-300">
                Choose an upcoming trip or tell us which destination caught your eye. We can help you find a walk for your group.
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

      {lightboxIndex !== null && selectedImages[lightboxIndex] ? (
        <dialog ref={viewerRef} onCancel={() => setLightboxIndex(null)} onKeyDown={(event) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); moveLightbox(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); moveLightbox(1); }
        }} aria-label={`${activeDestination} photo viewer`} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-full max-w-none overflow-hidden border-0 bg-[#071711] p-0 text-white backdrop:bg-black/80">
          <div className="flex h-full min-h-0 flex-col">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
              <div className="min-w-0"><p className="truncate font-bold">{activeDestination}</p><p className="mt-1 text-xs text-white/60" aria-live="polite">Photo {lightboxIndex + 1} of {selectedImages.length}</p></div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" aria-pressed={showPhotoGrid} onClick={() => setShowPhotoGrid(!showPhotoGrid)} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-sm hover:bg-white/10"><Images className="h-4 w-4" />{showPhotoGrid ? "View photo" : "All photos"}</button>
                <button autoFocus type="button" onClick={() => setLightboxIndex(null)} className="rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Close photo viewer"><X className="h-5 w-5" /></button>
              </div>
            </header>
            <div className={`grid min-h-0 flex-1 ${showPhotoGrid ? "grid-cols-1" : "grid-cols-1"}`}>
              {!showPhotoGrid ? <div className="flex min-h-0 min-w-0 flex-col">
                <div ref={wheelStageRef} className="album-wheel" aria-roledescription="carousel" aria-label="Album photos" onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }} onTouchEnd={handleTouchEnd}>
                  <div className="album-wheel-glow" aria-hidden="true" />
                  {selectedImages.map((photo, index) => {
                    let offset = index - lightboxIndex;
                    if (offset > selectedImages.length / 2) offset -= selectedImages.length;
                    if (offset < -selectedImages.length / 2) offset += selectedImages.length;
                    const distance = Math.abs(offset);
                    const angle = offset * 28;
                    return <button key={photo.id} type="button" tabIndex={distance <= 1 ? 0 : -1} aria-hidden={distance > 2 ? true : undefined} aria-label={`View photo ${index + 1} of ${selectedImages.length}`} aria-current={offset === 0 ? "true" : undefined} onClick={() => setLightboxIndex(index)} className="album-wheel-card" style={{
                      "--angle": `${angle}deg`,
                      "--scale": offset === 0 ? 1 : 0.9,
                      "--blur": `${Math.min(distance * 2, 6)}px`,
                      "--gray": Math.min(distance * 0.65, 1),
                      opacity: distance > 2 ? 0 : offset === 0 ? 1 : distance === 1 ? 0.55 : 0.16,
                      zIndex: 10 - Math.min(distance, 10),
                      pointerEvents: distance > 2 ? "none" : "auto"
                    } as CSSProperties}><img src={photo.image} loading={distance < 2 ? "eager" : "lazy"} alt={photo.title || `${activeDestination} photo ${index + 1}`} /></button>;
                  })}
                  {selectedImages.length > 1 ? <div className="album-wheel-controls"><button type="button" onClick={() => moveLightbox(-1)} aria-label="Previous photo"><ChevronLeft /></button><span aria-hidden="true">{String(lightboxIndex + 1).padStart(2, "0")} / {selectedImages.length}</span><button type="button" onClick={() => moveLightbox(1)} aria-label="Next photo"><ChevronRight /></button></div> : null}
                </div>
                <footer className="shrink-0 px-4 pb-4 text-center text-xs text-white/60">Scroll, swipe, or use the arrows to explore your album.</footer>
              </div> : null}
              <aside aria-label="Album photos" className={`${showPhotoGrid ? "block" : "hidden"} min-h-0 overflow-y-auto overscroll-contain border-l border-white/10 bg-white/[0.03] p-4`}>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">Explore the album / {selectedImages.length} photos</p>
                <div className={`grid gap-2 ${showPhotoGrid ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2"}`}>
                  {selectedImages.map((photo, index) => <button key={photo.id} type="button" aria-label={`View photo ${index + 1}`} aria-current={index === lightboxIndex ? "true" : undefined} onClick={() => { setLightboxIndex(index); setShowPhotoGrid(false); }} className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${index === lightboxIndex ? "border-[#F8A900]" : "border-transparent opacity-70"}`}><img loading="lazy" src={photo.image} alt="" className="h-full w-full object-cover" /><span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 text-xs">{index + 1}</span></button>)}
                </div>
              </aside>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}

function DestinationAlbums({ groups, onSelect, featuredFirst = false }: {
  groups: { destination: string; images: GalleryImage[] }[];
  onSelect: (destination: string) => void;
  featuredFirst?: boolean;
}) {
  return (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group, index) => (
                <button key={group.destination} type="button" onClick={() => onSelect(group.destination)} className={`group relative min-h-56 sm:min-h-80 overflow-hidden rounded-2xl bg-[#114F3C] text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${featuredFirst && index === 0 ? "md:col-span-2" : ""}`}>
                  <span className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 bg-[#114F3C]">
                    {group.images.slice(0, 4).map((item, imageIndex) => (
                      <img
                        key={item.id}
                        className={`h-full min-h-0 w-full object-cover transition duration-700 group-hover:scale-[1.03] ${group.images.length === 1 ? "col-span-2 row-span-2" : group.images.length === 2 ? "row-span-2" : imageIndex === 0 && group.images.length === 3 ? "row-span-2" : ""}`}
                        src={item.image}
                        loading="lazy"
                        decoding="async"
                        alt={`${group.destination} preview ${imageIndex + 1}`}
                      />
                    ))}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                    <p className="flex items-center gap-2 text-sm font-bold text-[#F8A900]"><Images className="h-4 w-4" /> {group.images.length} {group.images.length === 1 ? "photo" : "photos"}</p>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-black">{group.destination}</h3>
                    <p className="mt-2 text-sm font-bold text-white/70">View all photos</p>
                  </div>
                </button>
              ))}
            </div>
  );
}
