<<<<<<< HEAD
# Ermija Hiking Website

Node.js backend with a React TypeScript frontend for Ermija Hiking.

## Setup

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5174` and proxies API calls to the backend on `http://localhost:5000`.

On Windows PowerShell, use:

```powershell
npm.cmd run dev
```

Tailwind is loaded in `client/index.html`, and styling is applied with inline Tailwind utility classes in React components. No separate CSS files are used.

## Version 1 Features

- Public home page with hero, upcoming trips, destinations, gallery preview, and booking CTA
- Trips/packages listing with search, filters, featured package, and rich trip detail pages
- Booking form with WhatsApp confirmation link
- About, gallery, and contact pages
- Interactive gallery page with visual categories and circular split-gallery feature
- Light and dark mode toggle with saved user preference
- Admin/staff dashboard for adding, editing, deleting, publishing, and drafting trips
- Admin controls for booking status and contact message status
- Route-style URLs for `/trips`, `/gallery`, `/about`, `/contact`, and `/admin`
- Local JSON persistence for trips, bookings, and contact messages in `server/data`

## Preview

Run the dev server and open:

- Public site: `http://localhost:5174`
- Trips: `http://localhost:5174/trips`
- Admin: `http://localhost:5174/admin`

## Notes

The admin login is a first-version staff gate only. Replace it with real authentication before production.

The local JSON files are useful for development, but a production launch should move this data to MongoDB, PostgreSQL, or Supabase.

Replace the placeholder phone, email, social links, and image URLs with final Ermija Hiking business details before launch.
=======
# Ermeja-New
>>>>>>> b5a7d9bdf2034bf0d3154fd060c268bd6e1adf8d
