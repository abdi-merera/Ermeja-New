import { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { defaultGalleryHighlight, emptyAdminTripForm } from "./constants";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";
import { pageFromPath, pagePaths } from "./routes/routeUtils";
import * as api from "./services/api";
import type { AdminLoginForm, AdminSession, AdminTripForm, Booking, BookingForm, ContactForm, ContactMessage, GalleryHighlight, GalleryImage, Page, Trip, TripStatus } from "./types";

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
    loadTrips().catch(() => setApiMessage("Unable to load trips. Make sure the backend is running."));
    api.getGalleryHighlight().then(setGalleryHighlight).catch(() => setGalleryHighlight(defaultGalleryHighlight));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
    window.localStorage.setItem("ermija-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

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
      ...trips.flatMap((trip) => [
        ...(trip.coverImage ? [{
          id: `${trip.id}-cover`,
          image: trip.coverImage,
          title: trip.title,
          destination: trip.destination,
          description: trip.description,
          source: "cover" as const
        }] : []),
        ...trip.galleryImages.filter(Boolean).map((image, index) => ({
          id: `${trip.id}-gallery-${index}`,
          image,
          title: trip.title,
          destination: trip.destination,
          description: trip.description,
          source: "gallery" as const
        }))
      ])
    ],
    [trips]
  );

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

    if (!selectedTrip) {
      return;
    }

    try {
      const result = await api.createBooking(bookingForm, selectedTrip.id);
      setApiMessage("Booking received. Please confirm on WhatsApp.");
      setBookingForm({ customerName: "", phone: "", numberOfPeople: "1", message: "" });
      await loadTrips();
      if (adminSession) {
        await loadAdminData();
      }
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Booking failed.");
      return;
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

  async function updateBookingStatus(booking: Booking, status: string) {
    await api.updateBookingStatus(booking, status);
    await loadAdminData();
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
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "Admin login failed.");
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

  return (
    <main className="min-h-screen bg-canvas text-stone-900 transition-colors duration-300 dark:bg-[#071711] dark:text-stone-100">
      <Navbar page={page} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} choosePage={choosePage} />

      {apiMessage ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-lg bg-[#114F3C] px-5 py-4 text-sm font-bold text-white shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <span>{apiMessage}</span>
            <button type="button" onClick={() => setApiMessage("")} className="rounded-md bg-white/10 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <AppRoutes
        page={page}
        trips={trips}
        adminTrips={adminTrips}
        selectedTrip={selectedTrip}
        galleryImages={galleryImages}
        galleryHighlight={galleryHighlight}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        submitBooking={submitBooking}
        contactForm={contactForm}
        setContactForm={setContactForm}
        submitContact={submitContact}
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
