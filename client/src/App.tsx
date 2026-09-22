import { bookingUnavailable } from "./bookingRules";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { defaultGalleryHighlight, emptyAdminTripForm } from "./constants";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";
import { pageFromPath, pagePaths } from "./routes/routeUtils";
import * as api from "./services/api";
import type { AdminLoginForm, AdminSession, AdminTripForm, Booking, BookingForm, ContactForm, ContactMessage, GalleryHighlight, GalleryImage, Page, PrivateTripRequest, Trip, TripStatus } from "./types";

export function App() {
  const [page, setPage] = useState<Page>(() => pageFromPath(window.location.pathname));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = window.localStorage.getItem("ermija-theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [adminTrips, setAdminTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [galleryHighlight, setGalleryHighlight] = useState<GalleryHighlight>(defaultGalleryHighlight);
  const [standalonePhotos, setStandalonePhotos] = useState<GalleryImage[]>([]);
  const [apiMessage, setApiMessage] = useState("");
  const [bookingForm, setBookingForm] = useState<BookingForm>({ customerName: "", phone: "", numberOfPeople: "1", message: "" });
  const [contactForm, setContactForm] = useState<ContactForm>({ name: "", phone: "", email: "", message: "" });
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => api.getSavedAdminSession());
  const [adminLoginForm, setAdminLoginForm] = useState<AdminLoginForm>({ email: "", password: "" });
  const [adminForm, setAdminForm] = useState<AdminTripForm>(emptyAdminTripForm);

  async function loadTrips() {
    const publicTrips = await api.getTrips();
    setTrips(publicTrips);

    if (api.getSavedAdminSession()) {
      const allTrips = await api.getAdminTrips();
      setAdminTrips(allTrips);
    } else {
      setAdminTrips([]);
    }

    const tripIdFromPath = window.location.pathname.startsWith("/trips/") ? window.location.pathname.replace("/trips/", "") : "";
    if (tripIdFromPath) {
      setSelectedTrip(publicTrips.find((trip: Trip) => trip.id === tripIdFromPath) || null);
      setPage("trips");
    }
  }

  async function loadAdminData() {
    const [nextBookings, nextMessages] = await Promise.all([api.getBookings(), api.getMessages()]);
    setBookings(nextBookings);
    setMessages(nextMessages);
  }

  useEffect(() => {
    loadTrips().catch(() => setApiMessage("Unable to load trips. Please refresh the page or try again shortly."));
    api.getStandaloneGalleryImages().then(setStandalonePhotos).catch(() => setApiMessage("Unable to load gallery photos."));
    api.getGalleryHighlight().then(setGalleryHighlight).catch(() => setGalleryHighlight(defaultGalleryHighlight));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
    window.localStorage.setItem("ermija-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (!apiMessage) return;
    const dismissTimer = window.setTimeout(() => setApiMessage(""), 30_000);
    return () => window.clearTimeout(dismissTimer);
  }, [apiMessage]);

  useEffect(() => {
    const handlePopState = () => {
      const nextPage = pageFromPath(window.location.pathname);
      setPage(nextPage);

      if (!window.location.pathname.startsWith("/trips/")) {
        setSelectedTrip(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (adminSession) {
      loadAdminData().catch(() => setApiMessage("Unable to load admin inbox."));
      loadTrips().catch(() => setApiMessage("Unable to load admin trips."));
    }
  }, [adminSession]);

  const galleryImages = useMemo<GalleryImage[]>(
    () => [
      ...standalonePhotos,
      ...trips.flatMap((trip) => [
        ...(trip.coverImage ? [{
          id: `${trip.id}-cover`,
          tripId: trip.id,
          image: trip.coverImage,
          title: trip.title,
          destination: trip.destination,
          description: trip.description,
          source: "cover" as const
        }] : []),
        ...trip.galleryImages.filter(Boolean).map((image, index) => ({
          id: `${trip.id}-gallery-${index}`,
          tripId: trip.id,
          image,
          title: trip.title,
          destination: trip.destination,
          description: trip.description,
          source: "gallery" as const
        }))
      ])
    ],
    [trips, standalonePhotos]
  );

  useEffect(() => {
    const title = selectedTrip ? `${selectedTrip.title} | Ermija Hiking` : page === "trips" ? "Hiking Trips in Ethiopia | Ermija Hiking" : page === "gallery" ? "Ethiopia Hiking Gallery | Ermija Hiking" : page === "about" ? "About Ermija Hiking | Local Ethiopia Guides" : page === "contact" ? "Contact Ermija Hiking | Private & Group Trips" : "Ermija Hiking | Guided Trips Across Ethiopia";
    const description = selectedTrip
      ? `${selectedTrip.title} in ${selectedTrip.destination}. ${selectedTrip.description}`.slice(0, 158)
      : page === "gallery" ? "Explore destination photo albums from Ermija Hiking trips across Ethiopia."
      : page === "trips" ? "Compare scheduled, private and group hiking trips across Ethiopia with Ermija Hiking."
      : "Discover guided hiking, camping and group trips across Ethiopia with Ermija Hiking.";
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [page, selectedTrip]);

  const choosePage = (target: Page) => {
    setPage(target);
    setSelectedTrip(null);
    setMobileOpen(false);
    window.history.pushState({}, "", pagePaths[target]);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const chooseTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setPage("trips");
    window.history.pushState({}, "", `/trips/${trip.id}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTrip) return false;

    try {
      const latestTrips = await api.getTrips();
      const latestTrip = latestTrips.find((trip) => trip.id === selectedTrip.id);
      if (!latestTrip) throw new Error("This trip is no longer available.");
      setSelectedTrip(latestTrip);
      const unavailable = bookingUnavailable(latestTrip);
      if (unavailable) throw new Error(unavailable);
      const people = Number(bookingForm.numberOfPeople);
      if (!Number.isInteger(people) || people < 1 || people > Math.min(100, latestTrip.availableSeats)) throw new Error("Choose a group size within the available seats.");
      if (bookingForm.customerName.trim().length < 2 || bookingForm.phone.trim().length < 7) throw new Error("Enter your full name and a valid contact number.");
      await api.createBooking(bookingForm, selectedTrip.id);
      setApiMessage("Booking request received. Your seats are not confirmed yet; our team will contact you.");
      setBookingForm({ customerName: "", phone: "", numberOfPeople: "1", message: "" });
      if (adminSession) loadAdminData().catch(() => {});
      return true;
    } catch (error) {
      setApiMessage(`Booking request failed: ${error instanceof Error ? error.message : "Please try again."}`);
      return false;
    }
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await api.sendContactMessage(contactForm);
      setApiMessage("Message sent. Ermija Hiking will contact you soon.");
      setContactForm({ name: "", phone: "", email: "", message: "" });
      if (adminSession) {
        await loadAdminData();
      }
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Message failed.");
      return;
    }
  }

  async function submitPrivateTripRequest(request: PrivateTripRequest) {
    const summary = `PRIVATE/GROUP TRIP REQUEST\nDestination: ${request.destination || "Flexible"}\nPreferred date: ${request.preferredDate || "Flexible"}\nGroup size: ${request.groupSize}\nNotes: ${request.notes || "None"}`;
    try {
      await api.sendContactMessage({ name: request.name, phone: request.phone, email: request.email, message: summary });
      setApiMessage("Private trip request saved. Complete the conversation on WhatsApp.");
      if (adminSession) await loadAdminData();
      window.open(`https://wa.me/251913181343?text=${encodeURIComponent(`Hello Ermija Hiking, I submitted this private/group trip request:\n${summary}\nName: ${request.name}\nPhone: ${request.phone}`)}`, "_blank", "noopener,noreferrer");
      return true;
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Private trip request failed.");
      return false;
    }
  }

  async function submitAdminTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await api.createTrip(adminForm);
      setApiMessage(`${adminForm.title} saved as ${adminForm.status}.`);
      setAdminForm(emptyAdminTripForm);
      await loadTrips();
      if (adminSession) {
        await loadAdminData();
      }
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Trip was not saved.");
      return;
    }
  }

  async function updateAdminTripStatus(trip: Trip, status: TripStatus) {
    await api.updateTripStatus(trip, status);
    await loadTrips();
  }

  async function updateAdminTrip(trip: Trip, form: AdminTripForm) {
    try {
      await api.updateTrip(trip, form);
      setApiMessage(`${form.title} updated.`);
      await loadTrips();
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Trip was not updated.");
      return;
    }
  }

  async function deleteAdminTrip(trip: Trip) {
    try {
      await api.deleteTrip(trip);
      setApiMessage(`${trip.title} deleted.`);
      await loadTrips();
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Trip was not deleted.");
      return;
    }
  }

  async function updateBookingStatus(booking: Booking, status: string): Promise<boolean> {
    try {
      const saved = await api.updateBookingStatus(booking, status);
      setBookings((current) => current.map((item) => item.id === saved.id ? saved : item));
      setApiMessage(`${booking.customerName}'s booking marked ${status.toLowerCase()}. The guest has not been notified yet.`);
    } catch (error) {
      setApiMessage(`Booking status was not updated: ${error instanceof Error ? error.message : "Please try again."}`);
      return false;
    }
    try {
      await Promise.all([loadAdminData(), loadTrips()]);
    } catch {
      setApiMessage("Booking status saved, but unable to refresh the dashboard. Refresh before making another change.");
    }
    return true;
  }

  async function updateMessageStatus(message: ContactMessage, status: string) {
    await api.updateMessageStatus(message, status);
    await loadAdminData();
  }

  async function updateGalleryHighlight(nextHighlight: GalleryHighlight) {
    try {
      const savedHighlight = await api.updateGalleryHighlight(nextHighlight);
      setGalleryHighlight(savedHighlight);
      setApiMessage("Gallery highlight updated.");
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Gallery highlight was not updated.");
    }
  }

  async function submitAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const nextSession = await api.loginAdmin(adminLoginForm);
      setAdminSession(nextSession);
      setAdminLoginForm({ email: "", password: "" });
      setApiMessage(`Logged in as ${nextSession.email}.`);
    } catch {
      setApiMessage("Sign-in failed. Check your email and password, then try again.");
    }
  }

  function logoutAdmin() {
    api.logoutAdmin();
    setAdminSession(null);
    setAdminTrips([]);
    setBookings([]);
    setMessages([]);
    setApiMessage("Logged out of admin.");
  }

  const backToTrips = () => {
    setSelectedTrip(null);
    window.history.pushState({}, "", pagePaths.trips);
  };

  const messageIsError = /failed|unable|invalid|incorrect|error|not saved|not updated|not deleted|too large|log in/i.test(apiMessage);
  const MessageIcon = messageIsError ? AlertCircle : CheckCircle2;

  return (
    <main className="min-h-screen bg-canvas text-stone-900 transition-colors duration-300 dark:bg-[#071711] dark:text-stone-100">
      <Navbar page={page} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} choosePage={choosePage} />

      {apiMessage ? (
        <div
          className={`fixed left-4 right-4 top-24 z-[70] mx-auto max-w-lg overflow-hidden rounded-xl border-2 bg-white px-5 py-4 text-stone-900 shadow-[0_20px_55px_rgba(0,0,0,0.32)] sm:left-auto sm:right-6 sm:mx-0 sm:w-full dark:bg-[#151A17] dark:text-white ${messageIsError ? "border-red-600" : "border-[#F8A900]"}`}
          role={messageIsError ? "alert" : "status"}
          aria-live={messageIsError ? "assertive" : "polite"}
        >
          <div className="flex items-start gap-4">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white ${messageIsError ? "bg-red-600" : "bg-[#114F3C]"}`}>
              <MessageIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-black uppercase tracking-[0.16em] ${messageIsError ? "text-red-700 dark:text-red-300" : "text-[#114F3C] dark:text-[#F8A900]"}`}>{messageIsError ? "Something went wrong" : "Success"}</p>
              <p className="mt-1 text-base font-bold leading-6">{apiMessage}</p>
            </div>
            <button type="button" onClick={() => setApiMessage("")} className="rounded-lg bg-stone-100 p-2 text-stone-600 transition hover:bg-stone-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20" aria-label="Dismiss notification">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <AppRoutes
        page={page}
        trips={trips}
        adminTrips={adminTrips}
        selectedTrip={selectedTrip}
        standalonePhotos={standalonePhotos}
        onStandalonePhotosChange={setStandalonePhotos}
        galleryImages={galleryImages}
        galleryHighlight={galleryHighlight}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        submitBooking={submitBooking}
        contactForm={contactForm}
        setContactForm={setContactForm}
        submitContact={submitContact}
        submitPrivateTripRequest={submitPrivateTripRequest}
        adminLoggedIn={Boolean(adminSession)}
        adminEmail={adminSession?.email || ""}
        adminLoginForm={adminLoginForm}
        setAdminLoginForm={setAdminLoginForm}
        submitAdminLogin={submitAdminLogin}
        logoutAdmin={logoutAdmin}
        adminForm={adminForm}
        setAdminForm={setAdminForm}
        submitAdminTrip={submitAdminTrip}
        updateTripStatus={updateAdminTripStatus}
        updateAdminTrip={updateAdminTrip}
        deleteAdminTrip={deleteAdminTrip}
        updateBookingStatus={updateBookingStatus}
        updateMessageStatus={updateMessageStatus}
        updateGalleryHighlight={updateGalleryHighlight}
        bookings={bookings}
        messages={messages}
        choosePage={choosePage}
        chooseTrip={chooseTrip}
        backToTrips={backToTrips}
      />

      <Footer />
    </main>
  );
}
