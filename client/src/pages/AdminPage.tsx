import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Edit3, ImagePlus, LayoutDashboard, LogIn, LogOut, Mail, MessageCircle, Mountain, Phone, Plus, Save, Search, Trash2, Users, X } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import { uploadTripImage } from "../services/api";
import type { AdminLoginForm, AdminTripForm, AdminTripSubmitHandler, Booking, ContactMessage, GalleryHighlight, Trip, TripStatus } from "../types";
import { formatDate, formatPrice, splitCommaList } from "../utils";

const tripFilters = ["All", "Published", "Draft"] as const;
const bookingStatuses = ["New", "Confirmed", "Cancelled"];
const messageStatuses = ["New", "Replied"];
const adminSections = [
  { id: "trips", label: "Trips", text: "Create and manage packages.", icon: Mountain },
  { id: "gallery", label: "Media", text: "Organize gallery images.", icon: ImagePlus },
  { id: "operations", label: "Operations", text: "Bookings and messages.", icon: LayoutDashboard }
] as const;

const inputClass =
  "rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:ring-4 focus:ring-[#114F3C]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500";

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
  galleryHighlight,
  updateGalleryHighlight,
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
  galleryHighlight: GalleryHighlight;
  updateGalleryHighlight: (highlight: GalleryHighlight) => void;
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
  const [creatingTrip, setCreatingTrip] = useState(false);

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
    <section className="min-h-screen bg-canvas px-4 py-6 transition-colors dark:bg-[#071711] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 overflow-hidden rounded-2xl bg-[#114F3C] p-6 text-white shadow-xl shadow-[#114F3C]/10 sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8A900]">Ermija administration</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Operations dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Manage trips, media and customer activity from one workspace.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F8A900] font-black text-[#114F3C]">{adminEmail.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white/60">Signed in as</p>
              <p className="truncate text-sm font-black">{adminEmail}</p>
            </div>
            <button type="button" onClick={logoutAdmin} className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AdminStat label="Total trips" value={trips.length} icon={<Mountain className="h-5 w-5" />} />
          <AdminStat label="Published" value={trips.filter((trip) => trip.status === "Published").length} icon={<CheckCircle2 className="h-5 w-5" />} />
          <AdminStat label="Confirmed" value={confirmedBookings} icon={<Users className="h-5 w-5" />} />
          <AdminStat label="New messages" value={unrepliedMessages} icon={<Mail className="h-5 w-5" />} />
        </div>

        <nav className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-[#114F3C]/10 bg-surface p-2 shadow-sm dark:border-white/10 dark:bg-[#10241C]">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex min-w-44 flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                activeSection === section.id
                  ? "bg-[#114F3C] text-white shadow-md shadow-[#114F3C]/15"
                  : "text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${activeSection === section.id ? "bg-white/10 text-[#F8A900]" : "bg-stone-100 text-[#114F3C] dark:bg-white/10 dark:text-[#F8A900]"}`}><Icon className="h-5 w-5" /></span>
              <span><span className="block text-sm font-black">{section.label}</span><span className={`mt-0.5 block text-xs font-semibold ${activeSection === section.id ? "text-white/65" : "text-stone-400"}`}>{section.text}</span></span>
            </button>
          );})}
        </nav>

        {activeSection === "trips" ? (
          <div className="space-y-4">
              <div className="rounded-xl border border-[#114F3C]/10 bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F54C0D]">Trip inventory</p>
                    <h2 className="mt-1 text-xl font-black text-[#114F3C] dark:text-[#F8A900]">Search and manage packages</h2>
                  </div>
                  <div className="flex gap-2"><select className={inputClass} value={tripFilter} onChange={(event) => setTripFilter(event.target.value as (typeof tripFilters)[number])}>
                    {tripFilters.map((filter) => (
                      <option key={filter}>{filter}</option>
                    ))}
                  </select><button type="button" onClick={() => setCreatingTrip(true)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-black ${orangeButton}`}><Plus className="h-4 w-4" /> New trip</button></div>
                </div>
                <label className="relative mt-5 block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input className={`${inputClass} w-full pl-12`} value={tripQuery} onChange={(event) => setTripQuery(event.target.value)} placeholder="Search trip title, destination, duration..." />
                </label>
              </div>

              {filteredTrips.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredTrips.map((trip) => (
                    <TripAdminCard key={trip.id} trip={trip} onEdit={beginEdit} onDelete={deleteAdminTrip} onStatusChange={updateTripStatus} />
                  ))}
                </div>
              ) : <EmptyAdminState text="No trips match the current search." />}
          </div>
        ) : null}

        {activeSection === "gallery" ? (
          <div className="space-y-6">
            <AdminInbox title="Circular gallery highlight">
              <GalleryHighlightEditor highlight={galleryHighlight} onSave={updateGalleryHighlight} />
            </AdminInbox>

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

      {creatingTrip ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#10241C]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="text-sm font-black uppercase tracking-[0.2em] text-[#F54C0D]">New package</p><h2 className="mt-2 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">Create an upcoming trip</h2></div>
              <button type="button" onClick={() => setCreatingTrip(false)} className="rounded-lg bg-stone-100 p-3 text-[#114F3C] transition hover:bg-stone-200 dark:bg-white/10 dark:text-white" aria-label="Close new trip form"><X className="h-5 w-5" /></button>
            </div>
            <TripForm form={form} setForm={setForm} onSubmit={submitTrip} title="Trip details" actionLabel="Save Trip" actionIcon={<Plus className="h-5 w-5" />} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AdminStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#114F3C]/10 bg-surface p-4 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FCE4B4] text-[#114F3C]">{icon}</span>
      <div><p className="text-xs font-bold text-stone-500 dark:text-stone-400">{label}</p><p className="mt-0.5 text-2xl font-black text-[#114F3C] dark:text-[#F8A900]">{value}</p></div>
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

function GalleryHighlightEditor({ highlight, onSave }: { highlight: GalleryHighlight; onSave: (highlight: GalleryHighlight) => void }) {
  const [draft, setDraft] = useState<GalleryHighlight>(highlight);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setDraft(highlight);
  }, [highlight]);

  const updateItem = (index: number, key: keyof GalleryHighlight["items"][number], value: string) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    }));
  };

  const uploadHighlightImage = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    setUploadError("");
    setUploadingIndex(index);

    try {
      const result = await uploadTripImage(file);
      updateItem(index, "image", result.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Highlight image upload failed.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const submitHighlight = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draft);
  };

  return (
    <form className="space-y-4" onSubmit={submitHighlight}>
      <FieldLabel label="Small label above the title">
        <input className={`${inputClass} w-full`} value={draft.eyebrow} onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })} />
      </FieldLabel>

      <div className="grid gap-4 xl:grid-cols-2">
        {draft.items.map((item, index) => (
          <article key={index} className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <div>
                <img className="h-28 w-full rounded-lg object-cover" src={item.image} alt={item.title || `Highlight ${index + 1}`} />
                <label className={`mt-2 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#114F3C]/25 px-3 py-2 text-center text-xs font-black text-[#114F3C] transition hover:border-[#F8A900] hover:bg-[#F8A900]/15 dark:border-white/15 dark:text-white ${uploadingIndex === index ? "pointer-events-none opacity-70" : ""}`}>
                  {uploadingIndex === index ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => {
                      uploadHighlightImage(index, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <FieldLabel label={`${String(index + 1).padStart(2, "0")} title`}>
                  <input className={`${inputClass} w-full`} value={item.title} onChange={(event) => updateItem(index, "title", event.target.value)} />
                </FieldLabel>
                <FieldLabel label="Description">
                  <textarea className={`${inputClass} min-h-20 w-full`} value={item.text} onChange={(event) => updateItem(index, "text", event.target.value)} />
                </FieldLabel>
                <FieldLabel label="Image URL">
                  <input className={`${inputClass} w-full`} value={item.image} onChange={(event) => updateItem(index, "image", event.target.value)} />
                </FieldLabel>
              </div>
            </div>
          </article>
        ))}
      </div>

      {uploadError ? <p className="text-sm font-bold text-red-600 dark:text-red-300">{uploadError}</p> : null}

      <button
        type="submit"
        disabled={uploadingIndex !== null}
        className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-black transition ${uploadingIndex !== null ? "cursor-not-allowed bg-stone-300 text-stone-600 dark:bg-white/10 dark:text-stone-400" : orangeButton}`}
      >
        <Save className="h-4 w-4" />
        Save gallery highlight
      </button>
    </form>
  );
}

function FormSection({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-white/10 dark:bg-white/5">
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
    <form noValidate className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20 sm:p-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
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

        <aside className="h-fit rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-4">
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
    <article className="overflow-hidden rounded-xl border border-[#114F3C]/10 bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
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
    <section className="rounded-xl border border-[#114F3C]/10 bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20 sm:p-6">
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
