import { FormEvent, useMemo, useState } from "react";
import { Edit3, ImagePlus, LogIn, Plus, Save, Search, Trash2, X } from "lucide-react";
import { orangeButton, yellowButton } from "../constants";
import { SectionTitle } from "../components/SectionTitle";
import type { AdminTripForm, AdminTripSubmitHandler, Booking, ContactMessage, Trip, TripStatus } from "../types";
import { formatDate } from "../utils";

const tripFilters = ["All", "Published", "Draft"] as const;
const bookingStatuses = ["New", "Confirmed", "Cancelled"];
const messageStatuses = ["New", "Replied"];

const inputClass =
  "rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500";

function tripToForm(trip: Trip): AdminTripForm {
  return {
    title: trip.title,
    destination: trip.destination,
    date: trip.date,
    duration: trip.duration,
    price: String(trip.price),
    difficulty: trip.difficulty,
    availableSeats: String(trip.availableSeats),
    meetingPoint: trip.meetingPoint,
    departureTime: trip.departureTime,
    returnTime: trip.returnTime,
    includes: trip.includes.join(", "),
    whatToBring: trip.whatToBring.join(", "),
    description: trip.description,
    coverImage: trip.coverImage,
    status: trip.status
  };
}

export function AdminPage({
  loggedIn,
  setLoggedIn,
  trips,
  form,
  setForm,
  submitTrip,
  updateTripStatus,
  updateAdminTrip,
  deleteAdminTrip,
  updateBookingStatus,
  updateMessageStatus,
  bookings,
  messages
}: {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  trips: Trip[];
  form: AdminTripForm;
  setForm: (form: AdminTripForm) => void;
  submitTrip: AdminTripSubmitHandler;
  updateTripStatus: (trip: Trip, status: TripStatus) => void;
  updateAdminTrip: (trip: Trip, form: AdminTripForm) => void;
  deleteAdminTrip: (trip: Trip) => void;
  updateBookingStatus: (booking: Booking, status: string) => void;
  updateMessageStatus: (message: ContactMessage, status: string) => void;
  bookings: Booking[];
  messages: ContactMessage[];
}) {
  const [tripQuery, setTripQuery] = useState("");
  const [tripFilter, setTripFilter] = useState<(typeof tripFilters)[number]>("All");
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editForm, setEditForm] = useState<AdminTripForm | null>(null);

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const matchesStatus = tripFilter === "All" || trip.status === tripFilter;
        const searchable = `${trip.title} ${trip.destination} ${trip.duration} ${trip.difficulty}`.toLowerCase();
        const matchesQuery = !tripQuery.trim() || searchable.includes(tripQuery.trim().toLowerCase());
        return matchesStatus && matchesQuery;
      }),
    [tripFilter, tripQuery, trips]
  );

  const confirmedBookings = bookings.filter((booking) => booking.status === "Confirmed").length;
  const unrepliedMessages = messages.filter((message) => message.status === "New").length;

  const beginEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setEditForm(tripToForm(trip));
  };

  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTrip || !editForm) {
      return;
    }
    updateAdminTrip(editingTrip, editForm);
    setEditingTrip(null);
    setEditForm(null);
  };

  if (!loggedIn) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
          <LogIn className="h-10 w-10 text-[#F54C0D]" />
          <h1 className="mt-5 text-3xl font-black text-[#114F3C] dark:text-[#F8A900]">Staff login</h1>
          <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-300">Version 1 uses a simple staff gate for demo/admin flow. Replace this with JWT, Supabase Auth, or Firebase Auth before production.</p>
          <button type="button" onClick={() => setLoggedIn(true)} className={`mt-6 w-full rounded-lg px-5 py-4 text-base font-black transition ${yellowButton}`}>
            Enter Admin Dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow="Admin portal" title="Manage trips, bookings, and messages" text="Use this dashboard to keep public packages fresh and follow up with interested guests." />

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <AdminStat label="Trips" value={trips.length} />
          <AdminStat label="Published" value={trips.filter((trip) => trip.status === "Published").length} />
          <AdminStat label="Confirmed bookings" value={confirmedBookings} />
          <AdminStat label="New messages" value={unrepliedMessages} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <TripForm form={form} setForm={setForm} onSubmit={submitTrip} title="Add upcoming trip" actionLabel="Save Trip" actionIcon={<Plus className="h-5 w-5" />} />
            <div className="rounded-lg border-2 border-dashed border-[#114F3C]/20 bg-white p-5 text-sm text-stone-700 transition-colors duration-300 dark:border-white/15 dark:bg-[#10241C] dark:text-stone-300">
              <ImagePlus className="mb-3 h-6 w-6 text-[#F54C0D]" />
              Cover image preview appears when a valid image URL is entered. Cloud uploads can be connected later with Cloudinary, Supabase Storage, or S3.
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-white p-5 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]">Trip inventory</p>
                  <h2 className="mt-2 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">Search and manage packages</h2>
                </div>
                <select className={inputClass} value={tripFilter} onChange={(event) => setTripFilter(event.target.value as (typeof tripFilters)[number])}>
                  {tripFilters.map((filter) => (
                    <option key={filter}>{filter}</option>
                  ))}
                </select>
              </div>
              <label className="relative mt-5 block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input className={`${inputClass} w-full pl-12`} value={tripQuery} onChange={(event) => setTripQuery(event.target.value)} placeholder="Search trip title, destination, duration..." />
              </label>
            </div>

            {filteredTrips.map((trip) => (
              <TripAdminCard key={trip.id} trip={trip} onEdit={beginEdit} onDelete={deleteAdminTrip} onStatusChange={updateTripStatus} />
            ))}

            {!filteredTrips.length ? (
              <div className="rounded-lg border border-dashed border-[#114F3C]/20 bg-white p-8 text-center text-sm font-bold text-stone-600 dark:border-white/15 dark:bg-[#10241C] dark:text-stone-300">
                No trips match the current search.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <AdminInbox title="Recent bookings">
            {bookings.length ? (
              bookings.map((booking) => {
                const trip = trips.find((item) => item.id === booking.tripId);
                return (
                  <article key={booking.id} className="rounded-lg border border-stone-200 p-4 dark:border-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-[#114F3C] dark:text-[#F8A900]">{booking.customerName}</h3>
                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{trip?.title || booking.tripId}</p>
                      </div>
                      <StatusSelect value={booking.status} options={bookingStatuses} onChange={(status) => updateBookingStatus(booking, status)} />
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-stone-700 dark:text-stone-300 sm:grid-cols-2">
                      <p>Phone: {booking.phone}</p>
                      <p>People: {booking.numberOfPeople}</p>
                      <p className="sm:col-span-2">Message: {booking.message || "No message"}</p>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-300">No bookings yet.</p>
            )}
          </AdminInbox>

          <AdminInbox title="Contact messages">
            {messages.length ? (
              messages.map((message) => (
                <article key={message.id} className="rounded-lg border border-stone-200 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-[#114F3C] dark:text-[#F8A900]">{message.name}</h3>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{message.phone}{message.email ? ` - ${message.email}` : ""}</p>
                    </div>
                    <StatusSelect value={message.status} options={messageStatuses} onChange={(status) => updateMessageStatus(message, status)} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-300">{message.message}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-300">No contact messages yet.</p>
            )}
          </AdminInbox>
        </div>
      </div>

      {editingTrip && editForm ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl rounded-lg bg-white p-5 shadow-2xl dark:bg-[#10241C]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]">Edit trip</p>
                <h2 className="mt-2 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{editingTrip.title}</h2>
              </div>
              <button type="button" onClick={() => setEditingTrip(null)} className="rounded-lg bg-stone-100 p-3 text-[#114F3C] transition hover:bg-stone-200 dark:bg-white/10 dark:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <TripForm form={editForm} setForm={setEditForm} onSubmit={submitEdit} title="Update trip details" actionLabel="Save Changes" actionIcon={<Save className="h-5 w-5" />} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
      <p className="text-sm font-bold text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#114F3C] dark:text-[#F8A900]">{value}</p>
    </div>
  );
}

function TripForm({
  form,
  setForm,
  onSubmit,
  title,
  actionLabel,
  actionIcon
}: {
  form: AdminTripForm;
  setForm: (form: AdminTripForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
}) {
  return (
    <form className="rounded-lg bg-white p-6 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20" onSubmit={onSubmit}>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.42fr]">
        <div>
          <h2 className="text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <input required className={inputClass} placeholder="Trip Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <input required className={inputClass} placeholder="Destination" value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} />
            <input required type="date" className={inputClass} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
            <select className={inputClass} value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })}>
              <option>Day Trip</option>
              <option>Weekend</option>
              <option>Multi-day</option>
            </select>
            <input required type="number" className={inputClass} placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            <input required type="number" className={inputClass} placeholder="Available Seats" value={form.availableSeats} onChange={(event) => setForm({ ...form, availableSeats: event.target.value })} />
            <select className={inputClass} value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TripStatus })}>
              <option>Draft</option>
              <option>Published</option>
            </select>
            <input className={inputClass} placeholder="Meeting Point" value={form.meetingPoint} onChange={(event) => setForm({ ...form, meetingPoint: event.target.value })} />
            <input className={inputClass} placeholder="Cover Image URL" value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} />
            <input className={inputClass} placeholder="Departure Time" value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} />
            <input className={inputClass} placeholder="Return Time" value={form.returnTime} onChange={(event) => setForm({ ...form, returnTime: event.target.value })} />
          </div>
          <input className={`${inputClass} mt-4 w-full`} placeholder="Package Includes, comma separated" value={form.includes} onChange={(event) => setForm({ ...form, includes: event.target.value })} />
          <input className={`${inputClass} mt-4 w-full`} placeholder="What to Bring, comma separated" value={form.whatToBring} onChange={(event) => setForm({ ...form, whatToBring: event.target.value })} />
          <textarea required className={`${inputClass} mt-4 min-h-32 w-full`} placeholder="Trip Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>

        <aside className="rounded-lg bg-stone-50 p-4 dark:bg-white/5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F54C0D]">Image preview</p>
          {form.coverImage ? (
            <img className="mt-4 h-56 w-full rounded-lg object-cover" src={form.coverImage} alt="Trip cover preview" />
          ) : (
            <div className="mt-4 grid h-56 place-items-center rounded-lg border border-dashed border-[#114F3C]/20 text-center text-sm font-bold text-stone-500 dark:border-white/15 dark:text-stone-400">
              Paste a cover image URL
            </div>
          )}
          <button type="submit" className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-4 text-base font-black transition ${orangeButton}`}>
            {actionIcon}
            {actionLabel}
          </button>
        </aside>
      </div>
    </form>
  );
}

function TripAdminCard({ trip, onEdit, onDelete, onStatusChange }: { trip: Trip; onEdit: (trip: Trip) => void; onDelete: (trip: Trip) => void; onStatusChange: (trip: Trip, status: TripStatus) => void }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
      <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr]">
        <img className="h-32 w-full rounded-lg object-cover sm:h-full" src={trip.coverImage} alt={trip.title} />
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#114F3C] dark:text-[#F8A900]">{trip.title}</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{trip.destination} - {formatDate(trip.date)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${trip.status === "Published" ? "bg-[#9EC26D] text-[#114F3C]" : "bg-[#FCE4B4] text-[#114F3C]"}`}>
              {trip.status}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onStatusChange(trip, "Published")} className="rounded-lg bg-[#114F3C] px-3 py-2 text-sm font-bold text-white">
              Publish
            </button>
            <button type="button" onClick={() => onStatusChange(trip, "Draft")} className="rounded-lg bg-[#FCE4B4] px-3 py-2 text-sm font-bold text-[#114F3C]">
              Draft
            </button>
            <button type="button" onClick={() => onEdit(trip)} className="inline-flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm font-bold text-[#114F3C] dark:bg-white/10 dark:text-white">
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${trip.title}? This cannot be undone.`)) {
                  onDelete(trip);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 dark:bg-red-500/15 dark:text-red-200"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <span className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700 dark:bg-white/10 dark:text-stone-200">{trip.bookingsCount || 0} bookings</span>
            <span className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700 dark:bg-white/10 dark:text-stone-200">{trip.availableSeats} seats</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function AdminInbox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
      <h2 className="text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function StatusSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-full border border-[#114F3C]/10 bg-[#FCE4B4] px-3 py-2 text-xs font-black text-[#114F3C] outline-none dark:border-white/10">
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
