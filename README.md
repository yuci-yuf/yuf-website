# Youth United Festival 2026 (YUF) Website

Marketing site, event catalogue, participant **registration**, and a self-serve **admin CMS**
for the Youth United Council of India (YUCI). Built a Next.js App Router app backed by
Firebase (Firestore + Auth), with images on Cloudinary.

---

## Tech stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript
- **Styling:** Tailwind CSS v4 (design tokens in [`app/globals.css`](app/globals.css)) · Radix UI + `class-variance-authority` (shadcn-style primitives) · `framer-motion`
- **Backend (BaaS):** Firebase — **Firestore** (data) + **Auth** (admin login). Client SDK only today; no custom server tier yet.
- **Media:** Cloudinary (browser uploads + a Node upload script)
- **Charts:** Recharts (admin dashboard)

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` (never commit real secrets). Public Firebase config is safe in the client;
keep the Cloudinary/admin secrets server-side only.

```bash
# Firebase (public client config)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Cloudinary — browser unsigned uploads (public)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Cloudinary — signed uploads for the asset script (server-only, keep secret)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# One-time admin seeding (server-only)
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=

# Payments — Razorpay (server-only, except the public key id)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Firebase Admin SDK — service-account JSON (raw or base64), server-only.
# Powers the registration/payment API routes (bypasses client rules).
FIREBASE_ADMIN_SERVICE_ACCOUNT=
```

### Payments & registration API

Registration + payment run through **Node API routes** (require a Node host — dev works out of the box):

- `POST /api/registrations/order` — validates input, atomically reserves the event slot,
  creates a pending registration with a unique code, and opens a Razorpay order.
- `POST /api/payments/verify` — verifies the checkout callback signature (instant UX).
- `POST /api/payments/webhook` — **authoritative** confirmation; verifies the Razorpay
  webhook signature and marks the registration paid/confirmed (idempotent; releases the slot
  on failure). Point a Razorpay webhook (events `payment.captured`, `payment.failed`) at
  `https://<host>/api/payments/webhook` using `RAZORPAY_WEBHOOK_SECRET`.

Pricing (base fee + platform fee + GST) is computed server-side in [`lib/pricing.ts`](lib/pricing.ts).
See [`high-concurrency-registration.md`](high-concurrency-registration.md) for the full design
(idempotency, capacity, App Check, entry-pass QR + check-in).

> ⚠️ Do not commit `.env.local`. Rotate any secret that has been committed and store production
> secrets in your host's env / a secret manager.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run upload:assets` | Upload local `assets/` to Cloudinary (writes a manifest) |
| `npm run upload:preview` | Dry-run of the upload |

Seed helpers under `scripts/` (run with `node scripts/<file>.mjs`) sign in with the seed admin
credentials and populate Firestore (`seed-events.mjs`, `seed-gallery.mjs`).

---

## Project structure

```
app/
  (public)/          Public site — home, about, events, events/[id], gallery,
                     contact, register, legal pages (shared Navbar/Footer shell)
  admin/             Admin — /admin/login (public) + (panel) behind an auth gate
                     (dashboard, registrations, contacts, events, gallery)
components/
  home/ public/ admin/ ui/   Section, page, and shared UI components
lib/
  firebase.ts        Firebase client init (app / auth / db)
  cms-data.ts        Public reads of dynamic content (events, categories, gallery)
  content.ts         Static site copy (hero, about, legal, register steps, config)
  submissions.ts     Public form writes (contact + registration, transactional)
  admin-data.ts      Admin CRUD (events, categories, gallery, registrations, contacts)
types/index.ts       Shared content + Firestore schema types
firestore.rules      Security rules   ·   firestore.indexes.json   Indexes
```

**Content model:** dynamic content (events, categories, gallery) is read live from Firestore
via `lib/cms-data.ts` — empty collections render empty states, there is no fallback to hardcoded
defaults. Static marketing copy (hero text, legal pages, contact info, registration steps) lives
in `lib/content.ts`.

---

## Firebase

- **Project:** `yuf-web-db`. Firestore rules/indexes are deployed via `firebase.json`.
- **Collections:** `events`, `eventCategories`, `gallery` (public read; admin write),
  `registrations`, `contactSubmissions` (public create; admin read/update/delete), `admins`.
- **Admin model:** single-admin. Access is granted by creating an `admins/{uid}` document for the
  account; there is no public sign-up. The client checks this doc in `contexts/AuthContext.tsx`.
- **Registration capacity:** `submitRegistration` (`lib/submissions.ts`) runs a Firestore
  transaction that enforces each event's `registrationLimit` against `registrationCount` and
  atomically increments the counter, so slots can't be oversold.

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

---

## Roadmap: high-concurrency registration + online payment

Registration currently saves as **pending** (no online payment — the team follows up). The design
for handling **200–1,000+ simultaneous registrations** with Razorpay payment, verified webhooks,
unique registration codes, idempotency, abuse protection, and a **QR entry pass + entry-desk
check-in** is documented in **[`high-concurrency-registration.md`](high-concurrency-registration.md)**.

---

## Notes for contributors

- This Next.js version has breaking changes vs. older docs — see [`AGENTS.md`](AGENTS.md).
- Use the design tokens in `app/globals.css` (e.g. `text-heading`, `text-body`, `bg-festival-gradient`);
  avoid hardcoding hex values in components.
- Static image references point at `public/images/**` and are not build-checked — a wrong filename
  silently 404s.
