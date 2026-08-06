import { yellowButton } from "../constants";
import type { GalleryImage } from "../types";

export function GalleryPreview({ images, onOpen }: { images: GalleryImage[]; onOpen: () => void }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#F54C0D]">Gallery</p>
            <h2 className="mt-3 text-3xl font-black text-[#114F3C] sm:text-4xl">Imagine yourself there</h2>
          </div>
          <button type="button" onClick={onOpen} className={`rounded-lg px-5 py-3 text-sm font-black transition ${yellowButton}`}>
            View Gallery
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.slice(0, 8).map((item, index) => (
            <img
              key={item.id}
              className={`w-full rounded-lg object-cover shadow-sm ${index === 0 ? "col-span-2 h-72 md:row-span-2 md:h-full" : "h-40 md:h-52"}`}
              src={item.image}
              alt={`${item.title} in ${item.destination}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
