import { FormEvent, useEffect, useMemo, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { brandGreen, destinations, emptyAdminTripForm, navItems, whatsappNumber, yellowButton } from "./constants";
import { Footer } from "./components/Footer";
import { Logo } from "./components/Logo";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/AdminPage";
import { ContactPage } from "./pages/ContactPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { TripDetailPage } from "./pages/TripDetailPage";
import { TripsPage } from "./pages/TripsPage";
import type { AdminTripForm, Booking, BookingForm, ContactForm, ContactMessage, Page, Trip, TripStatus } from "./types";
import { splitCommaList } from "./utils";

const pagePaths: Record<Page, string> = {
  home: "/",
  trips: "/trips",
  gallery: "/gallery",
  about: "/about",
  contact: "/contact",
  admin: "/admin"
};

function pageFromPath(pathname: string): Page {
  if (pathname.startsWith("/trips")) {
    return "trips";
  }

  const match = Object.entries(pagePaths).find(([, path]) => path === pathname);
  return match ? (match[0] as Page) : "home";
}

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
  const [apiMessage, setApiMessage] = useState("");
  const [bookingForm, setBookingForm] = useState<BookingForm>({ customerName: "", phone: "", numberOfPeople: "1", message: "" });
  const [contactForm, setContactForm] = useState<ContactForm>({ name: "", phone: "", email: "", message: "" });
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminForm, setAdminForm] = useState<AdminTripForm>(emptyAdminTripForm);

  async function loadTrips() {
    const [publicResponse, adminResponse] = await Promise.all([fetch("/api/trips"), fetch("/api/trips?includeDrafts=true")]);
    const publicTrips = await publicResponse.json();
    setTrips(publicTrips);
    setAdminTrips(await adminResponse.json());

    const tripIdFromPath = window.location.pathname.startsWith("/trips/") ? window.location.pathname.replace("/trips/", "") : "";
    if (tripIdFromPath) {
      setSelectedTrip(publicTrips.find((trip: Trip) => trip.id === tripIdFromPath) || null);
      setPage("trips");
    }
  }

  async function loadAdminData() {
    const [bookingsResponse, messagesResponse] = await Promise.all([fetch("/api/admin/bookings"), fetch("/api/admin/messages")]);
    setBookings(await bookingsResponse.json());
    setMessages(await messagesResponse.json());
  }

  useEffect(() => {
    loadTrips().catch(() => setApiMessage("Unable to load trips. Make sure the backend is running."));
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
    if (adminLoggedIn) {
      loadAdminData().catch(() => setApiMessage("Unable to load admin inbox."));
    }
  }, [adminLoggedIn]);

  const galleryImages = useMemo(
    () => [
      ...destinations.map((destination) => destination.image),
      ...trips.flatMap((trip) => [trip.coverImage, ...trip.galleryImages])
    ].slice(0, 9),
    [trips]
  );

  const choosePage = (target: Page) => {
    setPage(target);
    setSelectedTrip(null);
    setMobileOpen(false);
    window.history.pushState({}, "", pagePaths[target]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setPage("trips");
    window.history.pushState({}, "", `/trips/${trip.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTrip) {
      return;
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bookingForm, tripId: selectedTrip.id })
    });

    const result = await response.json();

    if (!response.ok) {
      setApiMessage(result.message || "Booking failed.");
      return;
    }

    setApiMessage("Booking received. Please confirm on WhatsApp.");
    setBookingForm({ customerName: "", phone: "", numberOfPeople: "1", message: "" });
    await loadTrips();
    if (adminLoggedIn) {
      await loadAdminData();
    }
    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm)
    });

    if (!response.ok) {
      const result = await response.json();
      setApiMessage(result.message || "Message failed.");
      return;
    }

    setApiMessage("Message sent. Ermija Hiking will contact you soon.");
    setContactForm({ name: "", phone: "", email: "", message: "" });
    if (adminLoggedIn) {
      await loadAdminData();
    }
  }

  async function submitAdminTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/admin/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...adminForm,
        includes: splitCommaList(adminForm.includes),
        whatToBring: splitCommaList(adminForm.whatToBring)
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setApiMessage(result.message || "Trip was not saved.");
      return;
    }

    setApiMessage(`${adminForm.title} saved as ${adminForm.status}.`);
    setAdminForm(emptyAdminTripForm);
    await loadTrips();
    if (adminLoggedIn) {
      await loadAdminData();
    }
  }

  async function updateTripStatus(trip: Trip, status: TripStatus) {
    await fetch(`/api/admin/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await loadTrips();
  }

  async function updateAdminTrip(trip: Trip, form: AdminTripForm) {
    const response = await fetch(`/api/admin/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        includes: splitCommaList(form.includes),
        whatToBring: splitCommaList(form.whatToBring)
      })
    });

    if (!response.ok) {
      const result = await response.json();
      setApiMessage(result.message || "Trip was not updated.");
      return;
    }

    setApiMessage(`${form.title} updated.`);
    await loadTrips();
  }

  async function deleteAdminTrip(trip: Trip) {
    const response = await fetch(`/api/admin/trips/${trip.id}`, { method: "DELETE" });

    if (!response.ok) {
      const result = await response.json();
      setApiMessage(result.message || "Trip was not deleted.");
      return;
    }

    setApiMessage(`${trip.title} deleted.`);
    await loadTrips();
  }

  async function updateBookingStatus(booking: Booking, status: string) {
    await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await loadAdminData();
  }

  async function updateMessageStatus(message: ContactMessage, status: string) {
    await fetch(`/api/admin/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await loadAdminData();
  }

  const backToTrips = () => {
    setSelectedTrip(null);
    window.history.pushState({}, "", pagePaths.trips);
  };

  return (
    <main className="min-h-screen bg-[#fffaf0] text-stone-900 transition-colors duration-300 dark:bg-[#071711] dark:text-stone-100">
      <header className={`sticky top-0 z-40 ${brandGreen} border-b border-white/10 shadow-lg shadow-[#114F3C]/20`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => choosePage(item.page)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${page === item.page ? "bg-white text-[#114F3C] shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <a className={`rounded-lg px-4 py-3 text-sm font-black transition ${yellowButton}`} href={`https://wa.me/${whatsappNumber}`}>
              WhatsApp
            </a>
          </div>
          <button type="button" className="rounded-lg bg-white/10 p-3 text-white lg:hidden" onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen ? (
          <div className="border-t border-white/10 px-4 pb-4 lg:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <button key={item.page} type="button" onClick={() => choosePage(item.page)} className="rounded-lg px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10">
                  {item.label}
                </button>
              ))}
              <div className="pt-2 sm:hidden">
                <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
              </div>
            </div>
          </div>
        ) : null}
      </header>

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

      {page === "home" ? <HomePage trips={trips} galleryImages={galleryImages} choosePage={choosePage} chooseTrip={chooseTrip} /> : null}
      {page === "trips" && !selectedTrip ? <TripsPage trips={trips} chooseTrip={chooseTrip} /> : null}
      {page === "trips" && selectedTrip ? (
        <TripDetailPage
          trip={selectedTrip}
          relatedTrips={trips.filter((trip) => trip.id !== selectedTrip.id).slice(0, 2)}
          bookingForm={bookingForm}
          setBookingForm={setBookingForm}
          submitBooking={submitBooking}
          chooseTrip={chooseTrip}
          onBack={backToTrips}
        />
      ) : null}
      {page === "gallery" ? <GalleryPage images={galleryImages} /> : null}
      {page === "about" ? <AboutPage /> : null}
      {page === "contact" ? <ContactPage contactForm={contactForm} setContactForm={setContactForm} submitContact={submitContact} /> : null}
      {page === "admin" ? (
        <AdminPage
          loggedIn={adminLoggedIn}
          setLoggedIn={setAdminLoggedIn}
          trips={adminTrips}
          form={adminForm}
          setForm={setAdminForm}
          submitTrip={submitAdminTrip}
          updateTripStatus={updateTripStatus}
          updateAdminTrip={updateAdminTrip}
          deleteAdminTrip={deleteAdminTrip}
          updateBookingStatus={updateBookingStatus}
          updateMessageStatus={updateMessageStatus}
          bookings={bookings}
          messages={messages}
        />
      ) : null}

      <Footer />
    </main>
  );
}

function ThemeToggle({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean; setIsDarkMode: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-sm font-black text-white transition hover:bg-white/20"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Light mode" : "Dark mode"}
    >
      {isDarkMode ? <Sun className="h-5 w-5 text-[#F8A900]" /> : <Moon className="h-5 w-5 text-[#F8A900]" />}
      <span className="hidden lg:inline">{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}
