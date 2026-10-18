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
  const [selectedPhotos, setSelectedPhotos] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [open]);
  const albums = photos.reduce<Record<string, GalleryImage[]>>((groups, photo) => {
    const album = photo.destination.trim() || "General adventures";
    groups[album] = groups[album] ? [...groups[album], photo] : [photo];
    return groups;
  }, {});

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
    {open ? <form ref={formRef} onSubmit={save} className="scroll-mt-5 space-y-4 rounded-xl border-2 border-[#F8A900] bg-[#fffaf0] p-4 shadow-sm dark:border-[#F8A900] dark:bg-white/5">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#F54C0D]">{editing ? "Editing photo" : "New album photos"}</p><h3 className="mt-1 font-bold text-[#114F3C] dark:text-white">{editing ? editing.title : "Add gallery photos"}</h3></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold dark:border-white/20">Close</button></div>
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <label className="block text-sm font-semibold">Title<input required maxLength={150} className={field} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="block text-sm font-semibold">Album name<input maxLength={150} className={field} placeholder="e.g. Wenchi Crater Lake, Bale Mountains" value={destination} onChange={(event) => setDestination(event.target.value)} /><span className="mt-1 block text-xs font-normal text-stone-500 dark:text-stone-400">Use the same album name for photos that belong together.</span></label>
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
        <p className="text-sm text-stone-600 dark:text-stone-300">Select several photos with Ctrl or Shift, or choose files again to add more. All selected images will be saved in the album named above.</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">JPG, PNG, WebP or GIF. Maximum 6 MB each. Photos are public after saving. Multiple photos share the title and album; you can edit them individually afterward.</p>
        <div className="flex gap-3"><button type="submit" className="rounded-lg bg-[#114F3C] px-4 py-2 font-bold text-white">{busy ? progress || "Saving..." : editing ? "Save changes & added photos" : `Upload ${files.length || ""} photos`}</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-stone-300 px-4 py-2 dark:border-white/20">Cancel</button></div>
      </fieldset>
    </form> : null}
    {photos.length ? <div className="space-y-6">{Object.entries(albums).map(([album, albumPhotos]) => <section key={album} className="rounded-xl border border-stone-200 p-4 dark:border-white/15 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#F54C0D]">Album</p><h3 className="mt-1 text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{album}</h3><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{albumPhotos.length} {albumPhotos.length === 1 ? "photo" : "photos"}</p></div><button type="button" disabled={busy} onClick={() => { begin(null); setDestination(album); }} className="inline-flex items-center gap-2 rounded-lg bg-[#F8A900] px-3 py-2 text-sm font-bold text-[#114F3C] disabled:opacity-50"><ImagePlus className="h-4 w-4" /> Add photos</button></div>
      {(() => {
        const selectedId = selectedPhotos[album] || albumPhotos[0].id;
        const selected = albumPhotos.find((photo) => photo.id === selectedId) || albumPhotos[0];
        return <div className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-white/15 dark:bg-black/20">
            <img src={selected.image} alt={selected.title} className="h-56 w-full object-cover sm:h-72" loading="lazy" />
            <div className="space-y-2 bg-white p-4 dark:bg-[#183329]
              "><h4 className="font-bold">{selected.title}</h4><p className="text-sm">{selected.description}</p><div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => begin(selected)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-white/20 disabled:opacity-50"><Edit3 className="h-4 w-4" /> Edit</button><button type="button" disabled={busy} onClick={() => remove(selected)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-300 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Remove</button></div></div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{albumPhotos.map((photo) => <button type="button" key={photo.id} onClick={() => setSelectedPhotos((current) => ({ ...current, [album]: photo.id }))} className={`overflow-hidden rounded-lg border-2 bg-stone-100 dark:bg-black/20 ${selected.id === photo.id ? "border-[#F8A900] ring-2 ring-[#F8A900]/30" : "border-transparent"}`} aria-label={`View ${photo.title}`}><img src={photo.image} alt="" className="aspect-square w-full object-cover" loading="lazy" /></button>)}</div>
        </div>;
      })()}
    </section>)}</div> : <p className="rounded-lg border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500 dark:border-white/20 dark:text-stone-400 sm:p-6">No independent photos yet. Select Add photos to share your first adventure.</p>}
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
