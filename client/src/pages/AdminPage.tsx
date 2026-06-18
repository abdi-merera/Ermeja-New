import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Edit3, ImagePlus, LogIn, Mail, MessageCircle, Phone, Plus, Save, Search, Trash2, Users, X } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import { uploadTripImage } from "../services/api";
import type { AdminLoginForm, AdminTripForm, AdminTripSubmitHandler, Booking, ContactMessage, Trip, TripStatus } from "../types";
import { formatDate, formatPrice, splitCommaList } from "../utils";

const tripFilters = ["All", "Published", "Draft"] as const;
const bookingStatuses = ["New", "Confirmed", "Cancelled"];
const messageStatuses = ["New", "Replied"];
const adminSections = [
  { id: "trips", label: "Trip handling", text: "Create, edit, publish, and remove packages." },
  { id: "gallery", label: "Gallery & media", text: "Review cover and gallery images used across trips." },
  { id: "operations", label: "Admin activities", text: "Manage booking requests and contact messages." }
] as const;

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
    notIncluded: trip.notIncluded.join(", "),
    itinerary: trip.itinerary.join("\n"),
    safetyNotes: trip.safetyNotes,
    description: trip.description,
    coverImage: trip.coverImage,
    galleryImages: trip.galleryImages.join(", "),
    status: trip.status
  };
}

export function AdminPage({
  loggedIn,
  adminEmail,
  loginForm,
  setLoginForm,
  submitLogin,
  logoutAdmin,
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
  adminEmail: string;
  loginForm: AdminLoginForm;
  setLoginForm: (form: AdminLoginForm) => void;
  submitLogin: (event: FormEvent<HTMLFormElement>) => void;
  logoutAdmin: () => void;
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
  const [bookingQuery, setBookingQuery] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");
  const [messageQuery, setMessageQuery] = useState("");
  const [messageFilter, setMessageFilter] = useState("All");
  const [activeSection, setActiveSection] = useState<(typeof adminSections)[number]["id"]>("trips");

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
  const bookingValue = bookings.reduce((total, booking) => {
    const trip = trips.find((item) => item.id === booking.tripId);
    return total + (trip ? trip.price * booking.numberOfPeople : 0);
  }, 0);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const trip = trips.find((item) => item.id === booking.tripId);
        const searchable = `${booking.customerName} ${booking.phone} ${booking.message} ${trip?.title || ""} ${trip?.destination || ""}`.toLowerCase();
        const matchesQuery = !bookingQuery.trim() || searchable.includes(bookingQuery.trim().toLowerCase());
        const matchesStatus = bookingFilter === "All" || booking.status === bookingFilter;
        return matchesQuery && matchesStatus;
      }),
    [bookingFilter, bookingQuery, bookings, trips]
  );

  const filteredMessages = useMemo(
    () =>
      messages.filter((message) => {
        const searchable = `${message.name} ${message.phone} ${message.email} ${message.message}`.toLowerCase();
        const matchesQuery = !messageQuery.trim() || searchable.includes(messageQuery.trim().toLowerCase());
        const matchesStatus = messageFilter === "All" || message.status === messageFilter;
        return matchesQuery && matchesStatus;
      }),
    [messageFilter, messageQuery, messages]
  );

  const mediaTrips = useMemo(
    () =>
      trips.map((trip) => ({
        trip,
        images: [trip.coverImage, ...trip.galleryImages].filter(Boolean)
      })),
    [trips]
  );

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
          <h1 className="mt-5 text-3xl font-black text-[#114F3C] dark:text-[#F8A900]">Admin login</h1>
          <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-300">Sign in with the approved Supabase admin account to manage trips, bookings, uploads, and messages.</p>
          <form className="mt-6 space-y-4" onSubmit={submitLogin}>
            <input
              required
              type="email"
              className={`${inputClass} w-full`}
              placeholder="Admin email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
            />
            <input
              required
              type="password"
              className={`${inputClass} w-full`}
              placeholder="Password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
            <button type="submit" className={`w-full rounded-lg px-5 py-4 text-base font-black transition ${yellowButton}`}>
              Sign In
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F54C0D]">Admin portal</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[#114F3C] dark:text-[#F8A900]">Manage trips, bookings, and messages</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700 dark:text-stone-300">Keep packages fresh and follow up with interested guests.</p>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-[#10241C]">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">Signed in</p>
            <p className="mt-1 text-sm font-black text-[#114F3C] dark:text-[#F8A900]">{adminEmail}</p>
            <button type="button" onClick={logoutAdmin} className="mt-2 rounded-lg bg-stone-100 px-3 py-2 text-sm font-black text-[#114F3C] transition hover:bg-stone-200 dark:bg-white/10 dark:text-white">
              Log out
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <AdminStat label="Trips" value={trips.length} />
          <AdminStat label="Published" value={trips.filter((trip) => trip.status === "Published").length} />
          <AdminStat label="Confirmed bookings" value={confirmedBookings} />
          <AdminStat label="New messages" value={unrepliedMessages} />
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-3">
          {adminSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`rounded-lg border p-4 text-left transition ${
                activeSection === section.id
                  ? "border-[#F8A900] bg-[#114F3C] text-white shadow-xl shadow-[#114F3C]/15"
                  : "border-[#114F3C]/10 bg-white text-stone-700 hover:border-[#F8A900]/60 dark:border-white/10 dark:bg-[#10241C] dark:text-stone-300"
              }`}
            >
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${activeSection === section.id ? "text-[#F8A900]" : "text-[#F54C0D]"}`}>{section.label}</p>
              <p className="mt-2 text-sm font-semibold leading-5">{section.text}</p>
            </button>
          ))}
        </div>

        {activeSection === "trips" ? (
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <TripForm form={form} setForm={setForm} onSubmit={submitTrip} title="Add upcoming trip" actionLabel="Save Trip" actionIcon={<Plus className="h-5 w-5" />} />
              <div className="rounded-lg border-2 border-dashed border-[#114F3C]/20 bg-white p-4 text-sm text-stone-700 transition-colors duration-300 dark:border-white/15 dark:bg-[#10241C] dark:text-stone-300">
                <ImagePlus className="mb-2 h-5 w-5 text-[#F54C0D]" />
                Upload a cover image and gallery images from your computer, or paste hosted image URLs directly into the fields.
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F54C0D]">Trip inventory</p>
                    <h2 className="mt-1 text-xl font-black text-[#114F3C] dark:text-[#F8A900]">Search and manage packages</h2>
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

              {!filteredTrips.length ? <EmptyAdminState text="No trips match the current search." /> : null}
            </div>
          </div>
        ) : null}

        {activeSection === "gallery" ? (
          <div className="space-y-6">
            <AdminInbox title="Gallery and media library">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniStat label="Trips with media" value={mediaTrips.filter((item) => item.images.length).length} />
                <MiniStat label="Cover images" value={trips.filter((trip) => trip.coverImage).length} />
                <MiniStat label="Gallery images" value={trips.reduce((total, trip) => total + trip.galleryImages.length, 0)} />
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {mediaTrips.map(({ trip, images }) => (
                  <article key={trip.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-[#114F3C] dark:text-[#F8A900]">{trip.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-stone-600 dark:text-stone-300">{trip.destination}</p>
                      </div>
                      <button type="button" onClick={() => beginEdit(trip)} className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-black text-[#114F3C] transition hover:bg-stone-200 dark:bg-white/10 dark:text-white">
                        Edit media
                      </button>
                    </div>
                    {images.length ? (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {images.slice(0, 6).map((image, index) => (
                          <div key={`${trip.id}-${image}-${index}`} className={`overflow-hidden rounded-lg bg-stone-100 dark:bg-black/20 ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
                            <img className="h-full min-h-24 w-full object-cover" src={image} alt={`${trip.title} media ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyAdminState text="No images added for this trip yet." />
                    )}
                  </article>
                ))}
              </div>
            </AdminInbox>
          </div>
        ) : null}

        {activeSection === "operations" ? (
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <AdminInbox title="Booking operations">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniStat label="Total requests" value={bookings.length} />
                <MiniStat label="Confirmed" value={confirmedBookings} />
                <MiniStat label="Possible value" value={formatPrice(bookingValue)} />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input className={`${inputClass} w-full pl-12`} value={bookingQuery} onChange={(event) => setBookingQuery(event.target.value)} placeholder="Search guest, phone, trip..." />
                </label>
                <select className={inputClass} value={bookingFilter} onChange={(event) => setBookingFilter(event.target.value)}>
                  {["All", ...bookingStatuses].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="mt-5 space-y-4">
                {filteredBookings.length ? (
                  filteredBookings.map((booking) => {
                    const trip = trips.find((item) => item.id === booking.tripId);
                    return (
                      <BookingAdminCard key={booking.id} booking={booking} trip={trip} onStatusChange={(status) => updateBookingStatus(booking, status)} />
                    );
                  })
                ) : (
                  <EmptyAdminState text="No bookings match the current filters." />
                )}
              </div>
            </AdminInbox>

            <AdminInbox title="Contact inbox">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input className={`${inputClass} w-full pl-12`} value={messageQuery} onChange={(event) => setMessageQuery(event.target.value)} placeholder="Search messages..." />
                </label>
                <select className={inputClass} value={messageFilter} onChange={(event) => setMessageFilter(event.target.value)}>
                  {["All", ...messageStatuses].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="mt-5 space-y-4">
                {filteredMessages.length ? (
                  filteredMessages.map((message) => <MessageAdminCard key={message.id} message={message} onStatusChange={(status) => updateMessageStatus(message, status)} />)
                ) : (
                  <EmptyAdminState text="No contact messages match the current filters." />
                )}
              </div>
            </AdminInbox>
          </div>
        ) : null}
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
    <div className="rounded-lg bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
      <p className="text-sm font-bold text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-stone-50 p-4 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-2 text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{value}</p>
    </div>
  );
}

function BookingAdminCard({
  booking,
  trip,
  onStatusChange
}: {
  booking: Booking;
  trip?: Trip;
  onStatusChange: (status: string) => void;
}) {
  const total = trip ? trip.price * booking.numberOfPeople : 0;
  const whatsappUrl = `https://wa.me/${booking.phone.replace(/\D/g, "") || whatsappNumber}?text=${encodeURIComponent(
    `Hello ${booking.customerName}, this is Ermija Hiking about your booking for ${trip?.title || booking.tripId}.`
  )}`;

  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="grid gap-4 p-4 md:grid-cols-[120px_1fr]">
        {trip ? (
          <img className="h-32 w-full rounded-lg object-cover md:h-full" src={trip.coverImage} alt={trip.title} />
        ) : (
          <div className="grid h-32 place-items-center rounded-lg bg-[#FCE4B4] text-sm font-black text-[#114F3C] md:h-full">Trip</div>
        )}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#114F3C] dark:text-[#F8A900]">{booking.customerName}</h3>
              <p className="mt-1 text-sm font-semibold text-stone-600 dark:text-stone-300">{trip?.title || booking.tripId}</p>
            </div>
            <StatusSelect value={booking.status} options={bookingStatuses} onChange={onStatusChange} />
          </div>
          <div className="mt-4 grid gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#F54C0D]" />
              {booking.phone}
            </p>
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#F54C0D]" />
              {booking.numberOfPeople} people
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#F54C0D]" />
              {trip ? formatDate(trip.date) : "Trip date unavailable"}
            </p>
            <p className="font-black text-[#114F3C] dark:text-[#F8A900]">{total ? formatPrice(total) : "Value unavailable"}</p>
          </div>
          <p className="mt-3 rounded-lg bg-stone-50 p-3 text-sm leading-6 text-stone-700 dark:bg-black/15 dark:text-stone-300">{booking.message || "No guest message."}</p>
          <a className={`mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${orangeButton}`} href={whatsappUrl}>
            <MessageCircle className="h-4 w-4" />
            WhatsApp guest
          </a>
        </div>
      </div>
    </article>
  );
}

function MessageAdminCard({ message, onStatusChange }: { message: ContactMessage; onStatusChange: (status: string) => void }) {
  const whatsappUrl = `https://wa.me/${message.phone.replace(/\D/g, "") || whatsappNumber}?text=${encodeURIComponent(
    `Hello ${message.name}, this is Ermija Hiking. Thanks for contacting us.`
  )}`;

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-[#114F3C] dark:text-[#F8A900]">{message.name}</h3>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-stone-600 dark:text-stone-300">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#F54C0D]" />
              {message.phone}
            </span>
            {message.email ? (
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#F54C0D]" />
                {message.email}
              </span>
            ) : null}
          </div>
        </div>
        <StatusSelect value={message.status} options={messageStatuses} onChange={onStatusChange} />
      </div>
      <p className="mt-4 rounded-lg bg-stone-50 p-3 text-sm leading-6 text-stone-700 dark:bg-black/15 dark:text-stone-300">{message.message}</p>
      <a className={`mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${yellowButton}`} href={whatsappUrl}>
        <MessageCircle className="h-4 w-4" />
        Reply on WhatsApp
      </a>
    </article>
  );
}

function EmptyAdminState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#114F3C]/20 bg-stone-50 p-5 text-center text-sm font-bold text-stone-600 dark:border-white/15 dark:bg-white/5 dark:text-stone-300">
      {text}
    </div>
  );
}

function FormSection({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#114F3C]/10 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4">
        <h3 className="text-base font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-stone-600 dark:text-stone-300">{text}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FieldLabel({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-black text-[#114F3C] dark:text-white">
        {label}
        {hint ? <span className="text-xs font-bold text-stone-500 dark:text-stone-400">{hint}</span> : null}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error ? <span className="mt-2 block text-sm font-bold text-red-600 dark:text-red-300">{error}</span> : null}
    </label>
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
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const galleryImages = splitCommaList(form.galleryImages);
  const isUploadingAnyImage = isUploading || isUploadingGallery;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const price = Number(form.price);
    const seats = Number(form.availableSeats);
    const itinerarySteps = form.itinerary
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (form.title.trim().length < 4) {
      errors.title = "Use at least 4 characters.";
    }

    if (form.destination.trim().length < 3) {
      errors.destination = "Use at least 3 characters.";
    }

    if (!form.date) {
      errors.date = "Choose a trip date.";
    }

    if (!Number.isFinite(price) || price <= 0) {
      errors.price = "Price must be a positive number.";
    }

    if (!Number.isInteger(seats) || seats <= 0) {
      errors.availableSeats = "Seats must be a positive whole number.";
    }

    if (form.status === "Published" && !form.coverImage.trim()) {
      errors.coverImage = "Add a cover image before publishing.";
    }

    if (itinerarySteps.length < 2) {
      errors.itinerary = "Add at least 2 itinerary steps.";
    }

    return errors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length || isUploadingAnyImage) {
      event.preventDefault();
      return;
    }

    onSubmit(event);
  };

  const setGalleryImages = (images: string[]) => {
    setForm({ ...form, galleryImages: images.join(", ") });
  };

  const uploadCoverImage = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const result = await uploadTripImage(file);
      setForm({ ...form, coverImage: result.url });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadGalleryImages = async (files: FileList | null) => {
    const selectedFiles = Array.from(files || []);

    if (!selectedFiles.length) {
      return;
    }

    setUploadError("");
    setIsUploadingGallery(true);

    try {
      const uploadedImages = await Promise.all(selectedFiles.map((file) => uploadTripImage(file)));
      setGalleryImages([...galleryImages, ...uploadedImages.map((image) => image.url)]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Gallery upload failed.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  return (
    <form noValidate className="rounded-lg bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[1fr_0.38fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#114F3C] dark:text-[#F8A900]">{title}</h2>
          <FormSection title="Basics" text="Name the package and describe why guests should join.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Trip title" error={fieldErrors.title}>
                <input required className={`${inputClass} w-full`} placeholder="Wenchi Day Trip" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </FieldLabel>
              <FieldLabel label="Destination" error={fieldErrors.destination}>
                <input required className={`${inputClass} w-full`} placeholder="Wenchi Crater Lake" value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} />
              </FieldLabel>
            </div>
            <FieldLabel label="Trip description">
            <textarea required className={`${inputClass} min-h-24 w-full`} placeholder="Short public description for the card and detail page." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </FieldLabel>
          </FormSection>

          <FormSection title="Schedule and pricing" text="Set date, timing, seats, price, and difficulty.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Trip date" error={fieldErrors.date}>
                <input required type="date" className={`${inputClass} w-full`} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              </FieldLabel>
              <FieldLabel label="Duration">
                <select className={`${inputClass} w-full`} value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })}>
                  <option>Day Trip</option>
                  <option>Weekend</option>
                  <option>Multi-day</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Price" error={fieldErrors.price}>
                <input required type="number" className={`${inputClass} w-full`} placeholder="3200" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              </FieldLabel>
              <FieldLabel label="Available seats" error={fieldErrors.availableSeats}>
                <input required type="number" className={`${inputClass} w-full`} placeholder="18" value={form.availableSeats} onChange={(event) => setForm({ ...form, availableSeats: event.target.value })} />
              </FieldLabel>
              <FieldLabel label="Difficulty">
                <select className={`${inputClass} w-full`} value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Publish status">
                <select className={`${inputClass} w-full`} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TripStatus })}>
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Meeting point">
                <input className={`${inputClass} w-full`} placeholder="Mexico Square, Addis Ababa" value={form.meetingPoint} onChange={(event) => setForm({ ...form, meetingPoint: event.target.value })} />
              </FieldLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldLabel label="Departure">
                  <input className={`${inputClass} w-full`} placeholder="06:00" value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} />
                </FieldLabel>
                <FieldLabel label="Return">
                  <input className={`${inputClass} w-full`} placeholder="19:30" value={form.returnTime} onChange={(event) => setForm({ ...form, returnTime: event.target.value })} />
                </FieldLabel>
              </div>
            </div>
          </FormSection>

          <FormSection title="Package details" text="Use commas for short lists and one itinerary step per line.">
            <FieldLabel label="Included" hint="Comma separated">
              <input className={`${inputClass} w-full`} placeholder="Transport, Guide, Entrance fee" value={form.includes} onChange={(event) => setForm({ ...form, includes: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="What to bring" hint="Comma separated">
              <input className={`${inputClass} w-full`} placeholder="Water bottle, Comfortable shoes, Light jacket" value={form.whatToBring} onChange={(event) => setForm({ ...form, whatToBring: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Not included" hint="Comma separated">
              <input className={`${inputClass} w-full`} placeholder="Personal expenses, Extra snacks, Personal insurance" value={form.notIncluded} onChange={(event) => setForm({ ...form, notIncluded: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Itinerary" hint="One step per line" error={fieldErrors.itinerary}>
              <textarea className={`${inputClass} min-h-28 w-full`} placeholder={"Meet the guide and group.\nTravel to the destination.\nEnjoy the route."} value={form.itinerary} onChange={(event) => setForm({ ...form, itinerary: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Safety notes">
              <textarea className={`${inputClass} min-h-20 w-full`} placeholder="Safety guidance shown on the trip detail page." value={form.safetyNotes} onChange={(event) => setForm({ ...form, safetyNotes: event.target.value })} />
            </FieldLabel>
          </FormSection>

          <FormSection title="Media URLs" text="Upload from the side panel or paste hosted URLs manually.">
            <FieldLabel label="Cover image URL" error={fieldErrors.coverImage}>
              <input className={`${inputClass} w-full`} placeholder="/uploads/photo.jpg or https://..." value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Gallery image URLs" hint="Comma separated">
              <textarea className={`${inputClass} min-h-20 w-full`} placeholder="/uploads/one.jpg, /uploads/two.jpg" value={form.galleryImages} onChange={(event) => setForm({ ...form, galleryImages: event.target.value })} />
            </FieldLabel>
          </FormSection>
        </div>

        <aside className="rounded-lg bg-stone-50 p-3 dark:bg-white/5">
          {Object.keys(fieldErrors).length ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              Fix the highlighted fields before saving.
            </div>
          ) : null}
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F54C0D]">Cover preview</p>
          {form.coverImage ? (
            <img className="mt-3 h-44 w-full rounded-lg object-cover" src={form.coverImage} alt="Trip cover preview" />
          ) : (
            <div className="mt-3 grid h-44 place-items-center rounded-lg border border-dashed border-[#114F3C]/20 text-center text-sm font-bold text-stone-500 dark:border-white/15 dark:text-stone-400">
              Paste a cover image URL
            </div>
          )}
          <label className={`mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#114F3C]/25 px-4 py-2.5 text-center text-sm font-black text-[#114F3C] transition hover:border-[#F8A900] hover:bg-[#F8A900]/15 dark:border-white/15 dark:text-white ${isUploading ? "pointer-events-none opacity-70" : ""}`}>
            {isUploading ? "Uploading image..." : "Upload from computer"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                uploadCoverImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <div className="mt-4 border-t border-[#114F3C]/10 pt-4 dark:border-white/10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F54C0D]">Gallery images</p>
            {galleryImages.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {galleryImages.map((image) => (
                  <div key={image} className="group relative overflow-hidden rounded-lg bg-stone-200 dark:bg-white/10">
                    <img className="h-20 w-full object-cover" src={image} alt="Trip gallery preview" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((item) => item !== image))}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Remove gallery image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid h-20 place-items-center rounded-lg border border-dashed border-[#114F3C]/20 text-center text-sm font-bold text-stone-500 dark:border-white/15 dark:text-stone-400">
                Add gallery images
              </div>
            )}
            <label className={`mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#114F3C]/25 px-4 py-2.5 text-center text-sm font-black text-[#114F3C] transition hover:border-[#F8A900] hover:bg-[#F8A900]/15 dark:border-white/15 dark:text-white ${isUploadingGallery ? "pointer-events-none opacity-70" : ""}`}>
              {isUploadingGallery ? "Uploading gallery..." : "Upload gallery images"}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => {
                  uploadGalleryImages(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {uploadError ? <p className="mt-3 text-sm font-bold text-red-600 dark:text-red-300">{uploadError}</p> : null}
          <button
            type="submit"
            disabled={isUploadingAnyImage}
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black transition ${isUploadingAnyImage ? "cursor-not-allowed bg-stone-300 text-stone-600 dark:bg-white/10 dark:text-stone-400" : orangeButton}`}
          >
            {actionIcon}
            {isUploadingAnyImage ? "Finish image upload first" : actionLabel}
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
