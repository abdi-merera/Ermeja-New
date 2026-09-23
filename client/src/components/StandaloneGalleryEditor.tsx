import { useState, useRef, useEffect, type FormEvent } from "react";
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
  const [replacement, setReplacement] = useState<File | null>(null);
  const savingRef = useRef(false);
  const [progress, setProgress] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function begin(photo: GalleryImage | null) {
    setEditing(photo);
    setTitle(photo?.title || "");
    setDestination(photo?.destination || "");
    setDescription(photo?.description || "");
    setFiles([]);
    setReplacement(null);
    setError("");
    setNotice("");
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    let next = [...photos];
    let saved = 0;
    try {
      if (!title.trim()) throw new Error("Enter a photo title.");
      if (!editing && !files.length) throw new Error("Choose at least one photo.");
      for (const file of [...files, ...(replacement ? [replacement] : [])]) {
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 6 * 1024 * 1024) {
          throw new Error("Choose JPG, PNG, WebP or GIF images, up to 6 MB each.");
        }
      }
      if (editing) {
        const image = replacement ? (await uploadTripImage(replacement)).url : editing.image;
        const updated = await saveStandaloneGalleryImage({ ...editing, image, title: title.trim(), destination: destination.trim() || "General adventures", description: description.trim() });
        next = next.map((item) => item.id === updated.id ? updated : item);
        onChange(next);
        setEditing(updated);
        setReplacement(null);
      }
      const entries = files;
      for (const file of entries) {
        setProgress(`Saving photo ${saved + 1} of ${entries.length}...`);
        const image = (await uploadTripImage(file)).url;
        const photo = await saveStandaloneGalleryImage({
          id: crypto.randomUUID(), tripId: "", image,
          title: title.trim(), destination: destination.trim() || "General adventures",
          description: description.trim(), source: "gallery"
        });
        next = [photo, ...next.filter((item) => item.id !== photo.id)];
        onChange(next);
        saved++;
        if (file) setFiles((remaining) => remaining.filter((item) => item !== file));
      }
      setOpen(false);
      setNotice(`${editing ? "Photo updated. " : ""}${saved} photo(s) added to the public gallery.`);
    } catch (cause) {
      setError(`${saved ? `${saved} photo(s) saved. ` : ""}${cause instanceof Error ? cause.message : "Unable to save photos."}`);
    } finally {
      savingRef.current = false;
      setProgress("");
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
        {editing ? <div className="rounded-lg border border-stone-200 p-3 dark:border-white/20">
          <p className="mb-2 text-sm font-bold">Existing photo</p>
          <img src={editing.image} alt={editing.title} className="h-32 w-44 rounded-lg object-cover" />
          <label className="mt-3 block text-sm font-semibold">Replace this photo (optional)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={field} onChange={(event) => { setReplacement(event.target.files?.[0] || null); event.target.value = ""; }} /></label>
          {replacement ? <p className="mt-2 text-sm">Replacement: {replacement.name} <button type="button" onClick={() => setReplacement(null)} className="ml-2 underline">Undo</button></p> : null}
        </div> : null}
        <label className="block rounded-lg border-2 border-dashed border-[#114F3C]/30 p-4 text-sm font-bold dark:border-white/25">Upload gallery images{editing ? " to this album" : ""}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className={field} onChange={(event) => {
            const selected = Array.from(event.target.files || []);
            setFiles((current) => [...current, ...selected.filter((file) => !current.some((existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified))]);
            event.target.value = "";
          }} />
        </label>
        {files.length ? <div className="rounded-lg border border-stone-200 p-3 dark:border-white/20">
          <p role="status" className="text-sm font-bold">{files.length} {files.length === 1 ? "photo selected" : "photos selected"}</p>
          <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">{files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 text-sm"><SelectedPhotoPreview file={file} /><span className="min-w-0 flex-1 truncate">{file.name} <span className="text-stone-500 dark:text-stone-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span></span><button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} aria-label={`Remove ${file.name} from selection`} className="shrink-0 text-red-600 dark:text-red-300">Remove</button></li>)}</ul>
        </div> : null}
        <p className="text-sm text-stone-600 dark:text-stone-300">Select several photos with Ctrl or Shift, or choose files again to add more. Added images are saved separately in the same album.</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">JPG, PNG, WebP or GIF. Maximum 6 MB each. Photos are public after saving. Multiple photos share the title and album; you can edit them individually afterward.</p>
        <div className="flex gap-3"><button type="submit" className="rounded-lg bg-[#114F3C] px-4 py-2 font-bold text-white">{busy ? progress || "Saving..." : editing ? "Save changes & added photos" : `Upload ${files.length || ""} photos`}</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-stone-300 px-4 py-2 dark:border-white/20">Cancel</button></div>
      </fieldset>
    </form> : null}
    {photos.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-xl border border-stone-200 dark:border-white/15">
      <img src={photo.image} alt={photo.title} className="h-44 w-full object-cover" loading="lazy" />
      <div className="space-y-2 p-4"><h3 className="font-bold">{photo.title}</h3><p className="text-sm text-stone-500 dark:text-stone-400">{photo.destination}</p><p className="text-sm">{photo.description}</p>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => { begin(null); setDestination(photo.destination); setTitle(photo.title); }} className="inline-flex items-center gap-1 rounded-lg bg-[#F8A900] px-3 py-2 text-sm font-bold text-[#114F3C] disabled:opacity-50"><ImagePlus className="h-4 w-4" /> Add to album</button><button type="button" disabled={busy} onClick={() => begin(photo)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-white/20 disabled:opacity-50"><Edit3 className="h-4 w-4" /> Edit</button><button type="button" disabled={busy} onClick={() => remove(photo)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-300 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Remove from gallery</button></div>
      </div>
    </article>)}</div> : <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-white/20 dark:text-stone-400">No independent photos yet. Select Add photos to share your first adventure.</p>}
  </div>;
}

function SelectedPhotoPreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const preview = URL.createObjectURL(file);
    setUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [file]);
  return url ? <img src={url} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" /> : null;
}
