import { useState, type FormEvent } from "react";
import { ImagePlus, Edit3, Trash2 } from "lucide-react";
import { uploadTripImage, saveStandaloneGalleryImage, removeStandaloneGalleryImage } from "../services/api";
import type { GalleryImage } from "../types";

const field = "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-white/20 dark:bg-[#183329] dark:text-white";

export function StandaloneGalleryEditor({ photos, onChange }: { photos: GalleryImage[]; onChange: (photos: GalleryImage[]) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function begin(photo: GalleryImage | null) {
    setEditing(photo);
    setTitle(photo?.title || "");
    setDestination(photo?.destination || "");
    setDescription(photo?.description || "");
    setFiles([]);
    setError("");
    setNotice("");
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    let next = [...photos];
    let saved = 0;
    try {
      if (!title.trim()) throw new Error("Enter a photo title.");
      if (!editing && !files.length) throw new Error("Choose at least one photo.");
      for (const file of files) {
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 6 * 1024 * 1024) {
          throw new Error("Choose JPG, PNG, WebP or GIF images, up to 6 MB each.");
        }
      }
      const entries: (File | undefined)[] = files.length ? files : [undefined];
      for (const file of entries) {
        const image = file ? (await uploadTripImage(file)).url : editing!.image;
        const photo = await saveStandaloneGalleryImage({
          id: editing?.id || crypto.randomUUID(), tripId: "", image,
          title: title.trim(), destination: destination.trim() || "General adventures",
          description: description.trim(), source: "gallery"
        });
        next = [photo, ...next.filter((item) => item.id !== photo.id)];
        onChange(next);
        saved++;
        if (file) setFiles((remaining) => remaining.filter((item) => item !== file));
      }
      setOpen(false);
      setNotice(editing ? "Photo updated." : `${saved} photo(s) added to the public gallery.`);
    } catch (cause) {
      setError(`${saved ? `${saved} photo(s) saved. ` : ""}${cause instanceof Error ? cause.message : "Unable to save photos."}`);
    } finally {
      setBusy(false);
    }
  }

  async function remove(photo: GalleryImage) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await removeStandaloneGalleryImage(photo.id);
      onChange(photos.filter((item) => item.id !== photo.id));
      setNotice("Photo removed from the gallery.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove photo.");
    } finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-stone-600 dark:text-stone-300">Share past adventures and hiking moments. No trip required.</p>
      <button type="button" disabled={busy} onClick={() => begin(null)} className="inline-flex items-center gap-2 rounded-lg bg-[#F8A900] px-4 py-3 font-bold text-[#114F3C] disabled:opacity-50"><ImagePlus className="h-4 w-4" /> Add photos</button>
    </div>
    {notice ? <p role="status" className="text-sm text-green-700 dark:text-green-300">{notice}</p> : null}
    {error ? <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    {open ? <form onSubmit={save} className="space-y-4 rounded-xl border border-stone-200 p-4 dark:border-white/15">
      <h3 className="font-bold text-[#114F3C] dark:text-white">{editing ? "Edit photo" : "Add gallery photos"}</h3>
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <label className="block text-sm font-semibold">Title<input required maxLength={150} className={field} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="block text-sm font-semibold">Location or album (optional)<input maxLength={150} className={field} placeholder="e.g. Wenchi, Past adventures" value={destination} onChange={(event) => setDestination(event.target.value)} /></label>
        <label className="block text-sm font-semibold">Caption (optional)<textarea maxLength={1000} className={field} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="block text-sm font-semibold">{editing ? "Replace photo (optional)" : "Photos"}<input key={editing?.id || "new"} type="file" multiple={!editing} accept="image/jpeg,image/png,image/webp,image/gif" className={field} onChange={(event) => setFiles(Array.from(event.target.files || []))} /></label>
        <p className="text-xs text-stone-500 dark:text-stone-400">JPG, PNG, WebP or GIF. Maximum 6 MB each. Photos are public after saving. Multiple photos share the title and album; you can edit them individually afterward.</p>
        <div className="flex gap-3"><button type="submit" className="rounded-lg bg-[#114F3C] px-4 py-2 font-bold text-white">{busy ? "Saving..." : "Save photos"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-stone-300 px-4 py-2 dark:border-white/20">Cancel</button></div>
      </fieldset>
    </form> : null}
    {photos.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-xl border border-stone-200 dark:border-white/15">
      <img src={photo.image} alt={photo.title} className="h-44 w-full object-cover" loading="lazy" />
      <div className="space-y-2 p-4"><h3 className="font-bold">{photo.title}</h3><p className="text-sm text-stone-500 dark:text-stone-400">{photo.destination}</p><p className="text-sm">{photo.description}</p>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => begin(photo)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-white/20 disabled:opacity-50"><Edit3 className="h-4 w-4" /> Edit</button><button type="button" disabled={busy} onClick={() => remove(photo)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-300 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Remove from gallery</button></div>
      </div>
    </article>)}</div> : <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-white/20 dark:text-stone-400">No independent photos yet. Select Add photos to share your first adventure.</p>}
  </div>;
}
