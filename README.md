# BrightSmile Dental — Clinic Website & Practice Management Demo

A complete, fully functional dental clinic platform: a modern marketing website, a real
online booking system with live availability, and a practice-management admin panel with
a drag-and-drop calendar, patient records, and staff roles.

![Home page](docs/screenshots/home.png)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components, Turbopack) + **TypeScript** |
| Styling | **Tailwind CSS v4** + **shadcn/ui** (Base UI) + **Framer Motion** |
| Database | **Prisma 7** + **SQLite** via `better-sqlite3` adapter (swap to Postgres by changing the adapter) |
| Calendar | **react-big-calendar** with drag-and-drop rescheduling |
| Forms | **react-hook-form + zod** — shared client/server validation |
| Email | **EmailJS** (sends via your own connected Gmail to any recipient), **Resend** fallback, console fallback with zero config |
| Icons / fonts | lucide-react · Figtree + Noto Sans via `next/font` |

## Getting started

```bash
npm install                 # also runs prisma generate (postinstall)
npx prisma db push          # creates prisma/dev.db from the schema
npx tsx prisma/seed.ts      # seeds 20 treatments, 3 dentists, staff accounts, booking rules
cp .env.example .env        # then fill in values (email is optional — see below)
npm run dev                 # http://localhost:3000
```

Production build: `npm run build && npm start`

## Features

### Public website
- Home, About, Contact, Smile Gallery (lightbox), Blog (4 articles)
- **Services**: 20 treatments across 9 filterable categories, each with its own detail page
- SEO: per-page metadata, `sitemap.xml`, `robots.txt`, `Dentist` JSON-LD schema
- Accessibility: skip link, aria states, focus rings, reduced-motion support, 44px touch targets

### Online booking (`/book`)
- Choose treatment → dentist (or "any available" — auto-assigns the least-busy) → date →
  **live availability** computed from the scheduling engine
- Per-treatment durations, transactional double-booking prevention, booking reference
- Branded confirmation email (see `emailjs-template.html`)

![Booking flow](docs/screenshots/booking.png)

### Scheduling engine (all DB-driven, editable in the admin UI)
- Per-dentist weekly working hours
- Per-treatment durations and prices
- Closed dates / holidays and time-off blocks (per dentist or whole clinic)
- Minimum booking notice and maximum advance window

### Admin panel (`/admin`)
- **Calendar** — day view with a column per dentist, week view per dentist,
  color-coded status, availability shading, and **drag-and-drop rescheduling**
  (server re-validates every move)
- **Walk-in / phone booking** from the calendar with existing-patient typeahead and a
  "squeeze in" override for out-of-hours bookings
- **Status lifecycle**: unconfirmed → confirmed → arrived → completed / cancelled / no-show
- **Patients** — records auto-created from bookings: visit history, notes, no-show count, search
- **Day sheet** — printable daily schedule for the front desk
- **Settings** — treatments & pricing, working hours, closed dates, time blocks, staff accounts
- **Audit log** — who changed what, when

![Admin calendar — day view](docs/screenshots/admin-calendar.png)
![Admin calendar — week view](docs/screenshots/admin-calendar-week.png)

## Admin access

`/admin` redirects to `/admin/login`. Seeded demo staff accounts:

| Account | Password | Role |
|---|---|---|
| `owner@brightsmile.demo` | `admin123` | **Owner** — everything incl. settings, staff, audit log |
| `desk@brightsmile.demo` | `desk123` | **Receptionist** — calendar, patients, bookings, blocks |
| `dr.mitchell@brightsmile.demo` | `dentist123` | **Dentist** — schedule access |

Re-running `npx tsx prisma/seed.ts` is idempotent (safe to repeat).

## Environment variables

Copy `.env.example` to `.env`. The app runs with no email configuration
(confirmations are logged to the server console). For real emails:

### EmailJS setup (preferred)

1. Sign up at [emailjs.com](https://www.emailjs.com) → add an **Email Service**
   connected to your Gmail → copy the **Service ID**.
2. Create an **Email Template** → paste the contents of
   [`emailjs-template.html`](emailjs-template.html) into its code editor, and set:
   - **To Email**: `{{to_email}}`
   - **Subject**: `Appointment request received — {{reference}}`
3. In **Account → General**: copy the **Public Key** and **Private Key**, and enable
   **"Allow EmailJS API for non-browser applications"** (this app sends server-side,
   so keys never reach the browser).
4. Fill the four `EMAILJS_*` values in `.env` and restart.

Emails then deliver through your own Gmail to any patient address:

![Confirmation email](docs/screenshots/email.png)

### Resend (fallback)

Set `RESEND_API_KEY` — without a verified domain, Resend only delivers to your own
account email from `onboarding@resend.dev`.

## Project structure

```
src/
  app/(site)/          public pages (home, services, about, gallery, blog, contact, book)
  app/admin/           admin panel: dashboard, calendar, patients, day-sheet, settings, login
  components/
    sections/          home-page sections (hero, stats, testimonials, FAQ, …)
    booking/           public booking form
    admin/             calendar view, modals, settings panels, patient detail
    ui/                shadcn/ui primitives
  data/                marketing content (services copy, team, testimonials, FAQs, blog)
  lib/
    availability.ts    the scheduling engine (slots from hours/durations/blocks/closures)
    actions/           server actions: booking, contact, admin
    auth.ts + proxy.ts staff sessions (HMAC cookie) + /admin route guard
prisma/                schema, seed script, SQLite database (gitignored)
scripts/               dev utilities (check-db, migrate-legacy)
```

## Production notes

Before deploying for a real clinic:
- Swap SQLite for Postgres/Turso (Prisma adapter change) — required on serverless hosts
- Rotate `AUTH_SECRET`, all email keys, and every seeded password
- Add rate limiting to the public forms, plus privacy/terms pages
- See the project roadmap for Phase 2 (patient reschedule links, automated reminders,
  staff notifications) and Phase 3 (reviews, patient portal, intake forms)

> This is a demo — the clinic, its people, and all testimonials are fictional.
