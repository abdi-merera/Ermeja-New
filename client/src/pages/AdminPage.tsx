import { StandaloneGalleryEditor } from "../components/StandaloneGalleryEditor";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Edit3, ImagePlus, LogIn, LogOut, Mail, MessageCircle, Mountain, Phone, Plus, Save, Search, Trash2, Users, X } from "lucide-react";
import { orangeButton, whatsappNumber, yellowButton } from "../constants";
import { uploadTripImage } from "../services/api";
import type { AdminLoginForm, AdminTripForm, AdminTripSubmitHandler, Booking, ContactMessage, GalleryHighlight, GalleryImage, Trip, TripStatus } from "../types";
import { formatDate, formatPrice, splitCommaList } from "../utils";

const tripFilters = ["All", "Published", "Draft"] as const;
const bookingStatuses = ["New", "Confirmed", "Cancelled"];
const messageStatuses = ["New", "Replied"];
const adminSections = [
  { id: "trips", label: "Trips", text: "Create and manage packages.", icon: Mountain },
  { id: "bookings", label: "Bookings", text: "Review and confirm requests", icon: Users },
  { id: "messages", label: "Messages", text: "Read and reply to guests", icon: Mail },
  { id: "gallery", label: "Gallery", text: "Manage photos and highlights", icon: ImagePlus }
] as const;

const inputClass =
  "rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-900 outline-none transition focus:border-[#114F3C] focus:ring-4 focus:ring-[#114F3C]/10 dark:border-white/10 dark:bg-[#183329] dark:text-white dark:placeholder:text-stone-400 dark:[color-scheme:dark]";

function tripToForm(trip: Trip): AdminTripForm {
  const defaultReturnDate = new Date(`${trip.date}T00:00:00`);
  defaultReturnDate.setDate(defaultReturnDate.getDate() + 1);

  return {
    title: trip.title,
    destination: trip.destination,
    date: trip.date,
    duration: trip.duration,
    price: String(trip.price),
    difficulty: trip.difficulty,
    availableSeats: String(trip.availableSeats),
    hotLeadDays: String(trip.hotLeadDays ?? 5),
    meetingPoint: trip.meetingPoint,
    departureTime: trip.departureTime,
    returnDate: trip.duration === "Day Trip" ? "" : (trip.returnDate || defaultReturnDate.toISOString().slice(0, 10)),
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
  standalonePhotos,
  onStandalonePhotosChange,
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
  updateBookingStatus: (booking: Booking, status: string) => Promise<boolean>;
  updateMessageStatus: (message: ContactMessage, status: string) => void;
  standalonePhotos: GalleryImage[];
  onStandalonePhotosChange: (photos: GalleryImage[]) => void;
  galleryHighlight: GalleryHighlight;
  updateGalleryHighlight: (highlight: GalleryHighlight) => void;
  bookings: Booking[];
  messages: ContactMessage[];
}) {
  const [tripQuery, setTripQuery] = useState("");
  const [tripFilter, setTripFilter] = useState<(typeof tripFilters)[number]>("All");
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editForm, setEditForm] = useState<AdminTripForm | null>(null);
  const [bookingPage, setBookingPage] = useState(1);
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

  const bookingPageCount = Math.max(1, Math.ceil(filteredBookings.length / 20));
  const currentBookingPage = Math.min(bookingPage, bookingPageCount);
  const visibleBookings = filteredBookings.slice((currentBookingPage - 1) * 20, currentBookingPage * 20);

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

  const sectionStats = {
    trips: [
      { label: "Total trips", value: trips.length, icon: Mountain },
      { label: "Published trips", value: trips.filter((trip) => trip.status === "Published").length, icon: CheckCircle2 },
      { label: "Draft trips", value: trips.filter((trip) => trip.status === "Draft").length, icon: Edit3 },
      { label: "Available seats (published)", value: trips.filter((trip) => trip.status === "Published").reduce((total, trip) => total + trip.availableSeats, 0), icon: Users }
    ],
    bookings: [
      { label: "Total bookings", value: bookings.length, icon: Users },
      { label: "New bookings", value: bookings.filter((booking) => booking.status === "New").length, icon: CalendarDays },
      { label: "Confirmed bookings", value: confirmedBookings, icon: CheckCircle2 },
      { label: "Cancelled bookings", value: bookings.filter((booking) => booking.status === "Cancelled").length, icon: X }
    ],
    messages: [
      { label: "Total messages", value: messages.length, icon: Mail },
      { label: "Awaiting reply", value: unrepliedMessages, icon: MessageCircle },
      { label: "Replied messages", value: messages.filter((message) => message.status === "Replied").length, icon: CheckCircle2 },
      { label: "Unique phone numbers", value: new Set(messages.map((message) => message.phone.trim()).filter(Boolean)).size, icon: Phone }
    ],
    gallery: [
      { label: "Trips with media", value: mediaTrips.filter((item) => item.images.length > 0).length, icon: Mountain },
      { label: "Cover images", value: trips.filter((trip) => trip.coverImage).length, icon: ImagePlus },
      { label: "Gallery images", value: trips.reduce((total, trip) => total + trip.galleryImages.filter(Boolean).length, 0), icon: ImagePlus },
      { label: "Independent photos", value: standalonePhotos.length, icon: ImagePlus }
    ]
  }[activeSection];

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
        <header className="mb-4 overflow-hidden rounded-xl bg-[#114F3C] p-4 text-white">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8A900]">Ermija administration</p>
            <h1 className="mt-1 text-2xl font-black leading-tight">Admin dashboard</h1>

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

        <nav aria-label="Admin sections" className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-white p-2 dark:border-white/15 dark:bg-[#10241C] lg:grid-cols-4">
          {adminSections.map((section) => {
            const Icon = section.icon;
            const selected = activeSection === section.id;
            const count = section.id === "bookings" ? bookings.filter((booking) => booking.status === "New").length : section.id === "messages" ? unrepliedMessages : null;
            return (
              <button
                key={section.id}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => setActiveSection(section.id)}
                className={`flex min-w-0 items-center gap-3 rounded-xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8A900] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#10241C] sm:px-4 sm:py-2 ${selected ? "border-[#F8A900] bg-[#F8A900] text-[#092F23] shadow-sm" : "border-transparent text-stone-700 hover:border-stone-200 hover:bg-stone-50 dark:text-stone-200 dark:hover:border-white/20 dark:hover:bg-white/5"}`}
              >
                <Icon className="hidden h-5 w-5 shrink-0 sm:block" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-base font-bold">
                    {section.label}
                    {count !== null && count > 0 ? <span className={`rounded-full px-2 py-0.5 text-xs ${selected ? "bg-[#114F3C] text-white" : "bg-[#F8A900] text-[#092F23]"}`}>{count} new</span> : null}
                  </span>

                </span>
              </button>
            );
          })}
        </nav>

        <div aria-label={`${adminSections.find((section) => section.id === activeSection)?.label} summary`} className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {sectionStats.map(({ label, value, icon: Icon }) => (
            <AdminStat key={label} label={label} value={value} icon={<Icon className="h-5 w-5" />} />
          ))}
        </div>

        {activeSection === "trips" ? (
          <div className="space-y-4">
              <div className="rounded-xl border border-[#114F3C]/10 bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#10241C] dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F54C0D]">Trip inventory</p>
                    <h2 className="mt-1 text-xl font-black text-[#114F3C] dark:text-[#F8A900]">Search and manage packages</h2>
                  </div>
                  <div className="flex gap-2"><select aria-label="Filter trips by status" className={inputClass} value={tripFilter} onChange={(event) => setTripFilter(event.target.value as (typeof tripFilters)[number])}>
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
            <AdminInbox title="Independent gallery photos">
              <StandaloneGalleryEditor photos={standalonePhotos} onChange={onStandalonePhotosChange} />
            </AdminInbox>
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

        {activeSection === "bookings" ? (
          <div>
            <AdminInbox title="Bookings">
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input className={`${inputClass} w-full pl-12`} value={bookingQuery} onChange={(event) => { setBookingQuery(event.target.value); setBookingPage(1); }} placeholder="Search guest, phone, trip..." />
                </label>
                <select aria-label="Filter bookings by status" className={inputClass} value={bookingFilter} onChange={(event) => { setBookingFilter(event.target.value); setBookingPage(1); }}>
                  {["All", ...bookingStatuses].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 space-y-2">
                {filteredBookings.length ? (
                  visibleBookings.map((booking) => {
                    const trip = trips.find((item) => item.id === booking.tripId);
                    return (
                      <BookingAdminCard key={booking.id} booking={booking} trip={trip} onStatusChange={(status) => updateBookingStatus(booking, status)} />
                    );
                  })
                ) : (
                  <EmptyAdminState text="No bookings match the current filters." />
                )}
              </div>
            {filteredBookings.length > 0 ? <nav aria-label="Booking pages" className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3 text-sm dark:border-white/15">
                <p role="status">Showing {(currentBookingPage - 1) * 20 + 1}-{Math.min(currentBookingPage * 20, filteredBookings.length)} of {filteredBookings.length} requests</p>
                <div className="flex items-center gap-3">
                  <button type="button" disabled={currentBookingPage === 1} onClick={() => setBookingPage(currentBookingPage - 1)} className="rounded-lg border border-stone-300 px-3 py-2 disabled:opacity-40 dark:border-white/20">Previous</button>
                  <span>Page {currentBookingPage} of {bookingPageCount}</span>
                  <button type="button" disabled={currentBookingPage === bookingPageCount} onClick={() => setBookingPage(currentBookingPage + 1)} className="rounded-lg border border-stone-300 px-3 py-2 disabled:opacity-40 dark:border-white/20">Next</button>
                </div>
              </nav> : null}
            </AdminInbox>

          </div>
        ) : null}

        {activeSection === "messages" ? (
          <div>
            <AdminInbox title="Messages">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input className={`${inputClass} w-full pl-12`} value={messageQuery} onChange={(event) => setMessageQuery(event.target.value)} placeholder="Search messages..." />
                </label>
                <select aria-label="Filter messages by status" className={inputClass} value={messageFilter} onChange={(event) => setMessageFilter(event.target.value)}>
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
  onStatusChange: (status: string) => Promise<boolean>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("");
  const [statusError, setStatusError] = useState("");
  const statusPending = useRef(false);
  async function changeStatus(status: string) {
    if (statusPending.current) return;
    statusPending.current = true; setSaving(true); setStatusError(""); setNotificationStatus("");
    try {
      if (await onStatusChange(status)) setNotificationStatus(status);
      else setStatusError("Status was not updated. The guest has not been notified.");
    } catch { setStatusError("Unable to update the booking. Please try again."); }
    finally { statusPending.current = false; setSaving(false); }
  }
  const total = trip ? trip.price * booking.numberOfPeople : 0;
  const phoneDigits = booking.phone.replace(/\D/g, "");
  const whatsappPhone = phoneDigits.startsWith("251") ? phoneDigits : phoneDigits.startsWith("0") ? `251${phoneDigits.slice(1)}` : phoneDigits.length === 9 ? `251${phoneDigits}` : (phoneDigits || whatsappNumber);
  const tripName = trip?.title || booking.tripId;
  const tripDate = trip ? formatDate(trip.date) : "the selected date";
  const whatsappUrl = (status?: string) => {
    const message = status === "Confirmed"
      ? `Hello ${booking.customerName}, your booking for ${tripName} on ${tripDate} is confirmed for ${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? "person" : "people"}${total ? ` (${formatPrice(total)})` : ""}. Please reply so we can finalize payment and meeting details.`
      : status === "Cancelled"
        ? `Hello ${booking.customerName}, regarding your booking for ${tripName} on ${tripDate}: unfortunately, this request has been cancelled. Please reply if you would like another date or a different trip.`
        : `Hello ${booking.customerName}, this is Ermija Hiking about your booking for ${tripName}.`;
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <article className="overflow-hidden rounded-xl border border-[#B5CCBF] bg-[#E7EEE4] shadow-sm dark:border-white/15 dark:bg-white/5">
      <div className="grid items-center gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_auto_auto_auto]">
        <div className="min-w-0">
          <h3 className="font-bold text-[#114F3C] dark:text-[#F8A900]">{booking.customerName}</h3>
          <p className="truncate text-sm text-stone-600 dark:text-stone-300" title={tripName}>{tripName}</p>
        </div>
        <div className="text-sm text-stone-600 dark:text-stone-300">
          <p>{trip ? formatDate(trip.date) : "Trip date unavailable"}</p>
          <p>{booking.numberOfPeople} {booking.numberOfPeople === 1 ? "person" : "people"}</p>
        </div>
        <p className="text-sm font-bold text-[#114F3C] dark:text-[#F8A900]">{total ? formatPrice(total) : "Value unavailable"}</p>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${booking.status === "Confirmed" ? "bg-green-100 text-green-900" : booking.status === "Cancelled" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-950"}`}>{booking.status}</span>
        <button type="button" aria-expanded={expanded} aria-controls={`booking-${booking.id}`} onClick={() => setExpanded(!expanded)} className="w-fit rounded-lg border border-[#114F3C]/30 px-3 py-2 text-sm font-bold text-[#114F3C] hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-[#114F3C] dark:border-white/25 dark:text-white dark:hover:bg-white/10">{expanded ? "Hide details" : "View details"}</button>
      </div>
      {expanded ? <div id={`booking-${booking.id}`} className="border-t border-[#B5CCBF] p-4 dark:border-white/15">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {trip?.coverImage ? <img src={trip.coverImage} alt="" className="h-12 w-12 rounded-lg object-cover" /> : null}
              <div><p className="text-sm font-semibold">{tripName}</p><p className="text-sm">Phone: {booking.phone}</p></div>
            </div>
            <label className="flex items-center gap-2 text-sm">Status <StatusSelect value={booking.status} options={bookingStatuses} onChange={changeStatus} disabled={saving} /></label>
          </div>
          <p className="mt-4 rounded-lg border border-[#B5CCBF] bg-white p-3 text-sm leading-6 text-stone-700 dark:border-white/10 dark:bg-black/15 dark:text-stone-300"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#114F3C] dark:text-stone-300">Guest message</span>{booking.message || "No guest message."}</p>
          {saving ? <p role="status" className="mt-3 text-sm">Saving booking status...</p> : null}
          {statusError ? <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{statusError}</p> : null}
          {notificationStatus && notificationStatus === booking.status ? <div role="status" className="mt-3 rounded-lg bg-white p-3 text-sm dark:bg-white/10"><p>Status saved. Review and send the message to notify the guest.</p><a className="mt-2 inline-block font-bold underline" href={whatsappUrl(notificationStatus)} target="_blank" rel="noopener noreferrer">Notify guest on WhatsApp</a></div> : null}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#B5CCBF] pt-4 dark:border-white/15">
            {booking.status !== "Confirmed" ? (
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#114F3C] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0b392b]" type="button" disabled={saving} onClick={() => changeStatus("Confirmed")}>
                <CheckCircle2 className="h-4 w-4" /> Confirm booking
              </button>
            ) : null}
            {booking.status !== "Cancelled" ? (
              <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700" type="button" disabled={saving} onClick={() => changeStatus("Cancelled")}>
                <X className="h-4 w-4" /> Cancel booking
              </button>
            ) : null}
            <a className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${orangeButton}`} href={whatsappUrl()} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Message guest
            </a>
          </div>
      </div> : null}
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
        <input className={`${inputClass} w-full border-[#A6BFAF] dark:border-white/15`} value={draft.eyebrow} onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })} />
      </FieldLabel>

      <div className="grid gap-4 xl:grid-cols-2">
        {draft.items.map((item, index) => (
          <article key={index} className="rounded-xl border border-[#B5CCBF] bg-[#E7EEE4] p-4 shadow-sm sm:p-5 dark:border-white/15 dark:bg-white/5">
            <h3 className="mb-4 flex items-center gap-2 border-b border-[#B5CCBF] pb-3 text-base font-bold text-[#114F3C] dark:border-white/15 dark:text-white">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#114F3C] text-xs text-white dark:bg-[#F8A900] dark:text-[#114F3C]">{index + 1}</span>
              Highlight {index + 1}
            </h3>
            <div className="grid min-w-0 gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div>
                <img className="h-44 w-full rounded-lg border border-[#114F3C]/15 object-cover dark:border-white/15" src={item.image} alt={item.title || `Highlight ${index + 1}`} />
                <label className={`mt-3 flex cursor-pointer items-center justify-center rounded-lg bg-[#114F3C] px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0B392B] focus-within:ring-2 focus-within:ring-[#114F3C] focus-within:ring-offset-2 dark:bg-[#F8A900] dark:text-[#114F3C] dark:hover:bg-[#ffc247] ${uploadingIndex !== null ? "pointer-events-none opacity-70" : ""}`}>
                  {uploadingIndex === index ? "Uploading..." : "Replace photo"}
                  <input
                    type="file"
                    disabled={uploadingIndex !== null}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => {
                      uploadHighlightImage(index, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="min-w-0 space-y-4">
                <FieldLabel label="Title">
                  <input className={`${inputClass} w-full border-[#A6BFAF] dark:border-white/15`} value={item.title} onChange={(event) => updateItem(index, "title", event.target.value)} />
                </FieldLabel>
                <FieldLabel label="Description">
                  <textarea className={`${inputClass} min-h-28 w-full border-[#A6BFAF] dark:border-white/15`} value={item.text} onChange={(event) => updateItem(index, "text", event.target.value)} />
                </FieldLabel>
                <details className="rounded-lg border border-[#B5CCBF] bg-white/50 p-3 dark:border-white/15 dark:bg-black/10">
                  <summary className="cursor-pointer text-sm font-semibold text-[#114F3C] dark:text-stone-200">Advanced</summary>
                  <div className="mt-3">
                    <FieldLabel label="Image URL">
                      <input className={`${inputClass} w-full border-[#A6BFAF] dark:border-white/15`} value={item.image} onChange={(event) => updateItem(index, "image", event.target.value)} />
                    </FieldLabel>
                  </div>
                </details>
              </div>
            </div>
          </article>
        ))}
      </div>

      {uploadError ? <p className="text-sm font-bold text-red-600 dark:text-red-300">{uploadError}</p> : null}

      <div className="flex flex-col gap-4 rounded-xl border border-[#B5CCBF] bg-[#E7EEE4] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/15 dark:bg-white/5">
        <div>
          <p className="text-sm font-bold text-[#114F3C] dark:text-white">Ready to update your gallery?</p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Photo and text changes appear on the website after you save.</p>
        </div>
      <button
        type="submit"
        disabled={uploadingIndex !== null}
        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black transition ${uploadingIndex !== null ? "cursor-not-allowed bg-stone-300 text-stone-600 dark:bg-white/10 dark:text-stone-400" : orangeButton}`}
      >
        <Save className="h-4 w-4" />
        Save highlights
      </button>
      </div>
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
    const hotLeadDays = Number(form.hotLeadDays);
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

    if (!Number.isInteger(hotLeadDays) || hotLeadDays < 1 || hotLeadDays > 365) {
      errors.hotLeadDays = "Choose a whole number between 1 and 365 days.";
    }

    if (form.duration !== "Day Trip" && !form.returnDate) {
      errors.returnDate = "Choose the return day for this overnight trip.";
    }

    if (form.duration !== "Day Trip" && form.returnDate && form.date && form.returnDate <= form.date) {
      errors.returnDate = "Return day must be after the departure day.";
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
                <select className={`${inputClass} w-full`} value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value, returnDate: event.target.value === "Day Trip" ? "" : form.returnDate })}>
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
              <FieldLabel label="Hot trip starts" hint="Days before departure" error={fieldErrors.hotLeadDays}>
                <input required type="number" min="1" max="365" step="1" className={`${inputClass} w-full`} placeholder="5" value={form.hotLeadDays} onChange={(event) => setForm({ ...form, hotLeadDays: event.target.value })} />
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
              <FieldLabel label="Departure time">
                <input type="time" className={`${inputClass} w-full`} value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} />
              </FieldLabel>
              {form.duration !== "Day Trip" ? (
                <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                  <FieldLabel label="Return day" error={fieldErrors.returnDate}>
                    <input required type="date" min={form.date || undefined} className={`${inputClass} w-full`} value={form.returnDate} onChange={(event) => setForm({ ...form, returnDate: event.target.value })} />
                  </FieldLabel>
                  <FieldLabel label="Return time">
                    <input type="time" className={`${inputClass} w-full`} value={form.returnTime} onChange={(event) => setForm({ ...form, returnTime: event.target.value })} />
                  </FieldLabel>
                </div>
              ) : null}
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
            <FieldLabel label="Cover image / destination album cover URL" error={fieldErrors.coverImage}>
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

function StatusSelect({ value, options, onChange, disabled = false }: { value: string; options: string[]; onChange: (value: string) => void; disabled?: boolean }) {
  const statusColor = value === "Confirmed" || value === "Published" || value === "Replied"
    ? "border-green-300 bg-green-100 text-green-900"
    : value === "Cancelled"
      ? "border-red-300 bg-red-100 text-red-900"
      : "border-amber-300 bg-amber-100 text-amber-950";
  return (
    <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} aria-label="Change status" className={`rounded-lg border px-3 py-2 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-[#114F3C] focus-visible:ring-offset-2 [color-scheme:light] ${statusColor}`}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
