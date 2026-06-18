import { AboutPage } from "../pages/AboutPage";
import type { FormEvent } from "react";
import { AdminPage } from "../pages/AdminPage";
import { ContactPage } from "../pages/ContactPage";
import { GalleryPage } from "../pages/GalleryPage";
import { HomePage } from "../pages/HomePage";
import { TripDetailPage } from "../pages/TripDetailPage";
import { TripsPage } from "../pages/TripsPage";
import type { AdminLoginForm, AdminTripForm, AdminTripSubmitHandler, Booking, BookingForm, BookingSubmitHandler, ContactForm, ContactMessage, ContactSubmitHandler, Page, Trip, TripStatus } from "../types";

export function AppRoutes({
  page,
  trips,
  adminTrips,
  selectedTrip,
  galleryImages,
  bookingForm,
  setBookingForm,
  submitBooking,
  contactForm,
  setContactForm,
  submitContact,
  adminLoggedIn,
  adminEmail,
  adminLoginForm,
  setAdminLoginForm,
  submitAdminLogin,
  logoutAdmin,
  adminForm,
  setAdminForm,
  submitAdminTrip,
  updateTripStatus,
  updateAdminTrip,
  deleteAdminTrip,
  updateBookingStatus,
  updateMessageStatus,
  bookings,
  messages,
  choosePage,
  chooseTrip,
  backToTrips
}: {
  page: Page;
  trips: Trip[];
  adminTrips: Trip[];
  selectedTrip: Trip | null;
  galleryImages: string[];
  bookingForm: BookingForm;
  setBookingForm: (form: BookingForm) => void;
  submitBooking: BookingSubmitHandler;
  contactForm: ContactForm;
  setContactForm: (form: ContactForm) => void;
  submitContact: ContactSubmitHandler;
  adminLoggedIn: boolean;
  adminEmail: string;
  adminLoginForm: AdminLoginForm;
  setAdminLoginForm: (form: AdminLoginForm) => void;
  submitAdminLogin: (event: FormEvent<HTMLFormElement>) => void;
  logoutAdmin: () => void;
  adminForm: AdminTripForm;
  setAdminForm: (form: AdminTripForm) => void;
  submitAdminTrip: AdminTripSubmitHandler;
  updateTripStatus: (trip: Trip, status: TripStatus) => void;
  updateAdminTrip: (trip: Trip, form: AdminTripForm) => void;
  deleteAdminTrip: (trip: Trip) => void;
  updateBookingStatus: (booking: Booking, status: string) => void;
  updateMessageStatus: (message: ContactMessage, status: string) => void;
  bookings: Booking[];
  messages: ContactMessage[];
  choosePage: (page: Page) => void;
  chooseTrip: (trip: Trip) => void;
  backToTrips: () => void;
}) {
  if (page === "home") {
    return <HomePage trips={trips} galleryImages={galleryImages} choosePage={choosePage} chooseTrip={chooseTrip} />;
  }

  if (page === "trips" && !selectedTrip) {
    return <TripsPage trips={trips} chooseTrip={chooseTrip} />;
  }

  if (page === "trips" && selectedTrip) {
    return (
      <TripDetailPage
        trip={selectedTrip}
        relatedTrips={trips.filter((trip) => trip.id !== selectedTrip.id).slice(0, 2)}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        submitBooking={submitBooking}
        chooseTrip={chooseTrip}
        onBack={backToTrips}
      />
    );
  }

  if (page === "gallery") {
    return <GalleryPage images={galleryImages} />;
  }

  if (page === "about") {
    return <AboutPage />;
  }

  if (page === "contact") {
    return <ContactPage contactForm={contactForm} setContactForm={setContactForm} submitContact={submitContact} />;
  }

  if (page === "admin") {
    return (
      <AdminPage
        loggedIn={adminLoggedIn}
        adminEmail={adminEmail}
        loginForm={adminLoginForm}
        setLoginForm={setAdminLoginForm}
        submitLogin={submitAdminLogin}
        logoutAdmin={logoutAdmin}
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
    );
  }

  return <HomePage trips={trips} galleryImages={galleryImages} choosePage={choosePage} chooseTrip={chooseTrip} />;
}
