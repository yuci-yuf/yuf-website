# YUF Website — Product Requirements Document (PRD)

**Organization:** Youth United Council of India (YUCI)  
**Product:** Youth United Festival (YUF) Website  
**Stack:** Next.js 16 (App Router) · Firebase Auth · Firestore · Cloudinary · Razorpay · Tailwind CSS v4  
**Firebase Project:** `yuf-web-db`

---

## 1. Product Overview

A CMS-driven organizational website for YUCI where:
- **Admins** can dynamically manage all site content (events, hero sections, contact info, partners, team members, etc.) from a protected dashboard — no code changes needed.
- **Public users** can browse the organization, view events, register & pay for events, and contact YUCI.
- **Registrations** are stored in Firestore and visible in the admin panel with filtering, search, and export.
- **Email notifications** are sent to users on registration confirmation and to admins on new submissions.

---

## 2. Design Token System — Single Source of Truth

All colors, typography, spacing, and visual properties are defined as **CSS custom properties** in one file (`globals.css`). Every component uses these tokens — never hardcoded values. Changing `--color-primary` once updates the entire site instantly.

### 2.1 Color Tokens

Defined in `globals.css` under `:root` and consumed by Tailwind via `@theme`:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* ── Primary Brand ── */
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;   /* ← Main primary */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* ── Secondary / Accent ── */
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;

  /* ── Neutral / Surface ── */
  --color-surface:     #ffffff;
  --color-surface-alt: #f8fafc;
  --color-border:      #e2e8f0;
  --color-text:        #0f172a;
  --color-text-muted:  #64748b;

  /* ── Semantic ── */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;
  --color-info:    #3b82f6;

  /* ── Typography ── */
  --font-heading: 'Roboto Slab', serif;
  --font-body:    'Poppins', sans-serif;

  /* ── Spacing scale ── */
  --section-padding-y: 5rem;
  --section-padding-x: 1.5rem;
  --container-max:     80rem;

  /* ── Radius ── */
  --radius-sm:  0.375rem;
  --radius-md:  0.5rem;
  --radius-lg:  0.75rem;
  --radius-xl:  1rem;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-card:  0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-hover: 0 10px 25px rgba(0,0,0,0.1);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface:     #0f172a;
    --color-surface-alt: #1e293b;
    --color-border:      #334155;
    --color-text:        #f1f5f9;
    --color-text-muted:  #94a3b8;
  }
}
```

### 2.2 Usage in Components

With Tailwind CSS v4's `@theme` directive, these variables become Tailwind classes automatically:

```tsx
// ✅ Correct — uses design tokens
<button className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
  Register Now
</button>

<h1 className="font-heading text-text">Youth United Festival</h1>
<p className="font-body text-text-muted">Empowering the next generation</p>

// ❌ Wrong — hardcoded values
<button className="bg-blue-500 hover:bg-blue-600">Register</button>
```

### 2.3 Admin-Configurable Theme (Optional Future Enhancement)

The admin dashboard can include a **Theme Settings** section under `/admin/settings` where the admin picks a primary color. The selected color is stored in Firestore `siteConfig → theme` and injected as inline CSS variables on the `<html>` element via the root layout:

```tsx
// Root layout — injects theme from Firestore
<html style={{
  '--color-primary-500': themeConfig.primaryColor,
  '--color-primary-600': darken(themeConfig.primaryColor, 10),
  // ... auto-generate shade scale from one color
}}>
```

This is a **Phase 5 enhancement** — not needed for launch.

---

## 3. Data Fetching & Caching Strategy

> [!TIP]
> **"Editable by admin" does NOT mean "slow for users."** We use Next.js server-side rendering with aggressive caching. Users get instant page loads. Admins see updates reflected within 60 seconds.

### 3.1 The Problem

If every page load makes a Firestore query from the client:
- Users see a loading spinner on every visit
- Firestore read costs increase rapidly
- SEO suffers (search engines can't index client-rendered content)

### 3.2 The Solution: Hybrid Fetching

| Content Type | Where It's Fetched | Caching | User Experience |
|---|---|---|---|
| Site config, page content, partners | **Server Component** (runs on server) | ISR — cached, revalidated every **60 seconds** | ⚡ Instant — HTML arrives fully rendered |
| Events list | **Server Component** | ISR — revalidated every **60 seconds** | ⚡ Instant |
| Registration form data (event list for dropdown) | **Server Component** (initial) + **Client** (dynamic filtering) | Server-rendered on page load | Fast initial, interactive after |
| Form submissions (register, contact) | **Client-side** (on user action) | No caching — writes directly to Firestore | Normal — only runs when user submits |
| Admin dashboard data | **Client-side** (real-time listeners) | No caching — always live | Acceptable — only admin sees this |

### 3.3 How ISR (Incremental Static Regeneration) Works

```
User visits /events
        ↓
   Is there a cached page?
   ├── YES → Serve cached HTML instantly (< 50ms)
   │         └── In background: is cache older than 60s?
   │             ├── YES → Re-fetch from Firestore, update cache
   │             └── NO  → Do nothing
   └── NO  → Fetch from Firestore, render HTML, cache it, serve
```

**In code** (Next.js App Router):

```tsx
// app/(public)/events/page.tsx — Server Component (default)
import { collection, getDocs } from 'firebase/firestore';

export const revalidate = 60; // ← Cache this page for 60 seconds

export default async function EventsPage() {
  // This runs on the SERVER, not in the user's browser
  const events = await getEventsFromFirestore();
  const pageContent = await getPageContent('events');

  return (
    <div>
      <HeroSection data={pageContent.hero} />
      <EventsList events={events} /> {/* client component for filtering */}
    </div>
  );
}
```

### 3.4 On-Demand Revalidation (Admin Saves Content)

When an admin saves content in the CMS, we call a Next.js `revalidatePath()` or `revalidateTag()` API to **instantly** bust the cache — users see updates in seconds, not 60:

```tsx
// API route called after admin saves
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  // ... save to Firestore ...
  revalidatePath('/events');  // ← Bust cache for events page
  revalidatePath('/');        // ← Bust cache for home page
  return Response.json({ success: true });
}
```

### 3.5 Performance Summary

| Metric | Without ISR (client-only) | With ISR (our approach) |
|---|---|---|
| First page load | 1.5–3s (spinner → fetch → render) | **< 200ms** (pre-rendered HTML) |
| Firestore reads per visitor | 5–10 per page view | **~0** (served from cache) |
| SEO | ❌ Poor (empty HTML until JS loads) | ✅ Excellent (full HTML for crawlers) |
| Admin content update delay | Instant | **< 60s** (or instant with on-demand revalidation) |
| Monthly Firestore cost (10k visitors) | ~50k–100k reads | **< 5k reads** |

---

## 4. User Roles & Authentication

### 4.1 Roles

| Role | Access | Auth Method |
|------|--------|-------------|
| **Public Visitor** | Browse site, register for events, submit contact form | None required |
| **Admin** | Full CMS dashboard — manage content, view registrations, manage events | Firebase Auth (Email/Password + Google Sign-In) |

### 4.2 Admin Authentication Flow

1. Admin navigates to `/admin/login`.
2. Signs in via **Email/Password** or **Google Sign-In** (already configured in Firebase).
3. On successful auth, the system checks Firestore `admins` collection for a document matching the user's `uid`.
4. If found → redirect to `/admin/dashboard`. If not found → show "Access Denied" and sign out.
5. All `/admin/*` routes are protected by an auth guard middleware/layout.

> [!IMPORTANT]
> Admin accounts are **invite-only**. There is no public admin sign-up. A super-admin adds new admin UIDs to the `admins` Firestore collection manually or via a "Manage Admins" section in the dashboard.

---

## 5. Public Website — Pages & Features

All public pages pull content dynamically from Firestore collections so admins can update copy, images, and structure without touching code.

### 5.1 Global Layout (shared across all public pages)

| Element | Dynamic Fields (from Firestore `siteConfig` doc) |
|---------|--------------------------------------------------|
| **Navbar** | Logo image URL, nav links (label + path), CTA button text/link |
| **Footer** | About blurb, social links (platform + URL), quick links, useful links, phone, email, address, copyright text |
| **Back-to-top** | Static behavior, no CMS needed |
| **SEO Defaults** | Site name, default OG image, fallback description |

### 5.2 Home Page (`/`)

| Section | Content Source | Key Fields |
|---------|---------------|------------|
| Hero Banner | `pages/home → hero` | background image, badge text, title, subtitle, CTA buttons |
| Marquee Ticker | `pages/home → ticker` | Array of ticker items |
| Who We Are | `pages/home → about` | label, title, subhead, body paragraphs, feature list, image, button |
| Statistics | `siteConfig → stats` | Array of `{ number, suffix, label }` — animated counters |
| Join Us at YUF | `pages/home → joinUs` | label, title, image, body, buttons |
| Raj Bhavan Recognition | `pages/home → recognition` | label, title, subtitle, details array, slider images |
| Government Initiatives | `pages/home → govInitiatives` | label, title, subtitle, cards array `{ title, description, image }` |
| Principal Advisor | `siteConfig → advisor` | quote, name, title, image, badge |
| Events Preview | Derived from `events` collection | Shows latest 3 events with category filter |
| Steps to Register | `pages/home → registrationSteps` | Array of `{ step, title, description }` |
| Why Join Us | `pages/home → whyJoinUs` | label, title, subtitle, cards array |
| Supporting Partners | `partners` collection | Array of `{ name, logo URL, link }` |
| CTA Banner | `pages/home → ctaBanner` | background, label, title, body, buttons |

### 5.3 About Page (`/about`)

| Section | Content Source |
|---------|---------------|
| Hero Banner | `pages/about → hero` |
| Who We Are | `pages/about → about` |
| Our Mission | `pages/about → mission` (body, vision card, values card) |
| What We Do | `pages/about → activities` (4 activity cards) |
| Why Join Us | `pages/about → whyJoinUs` |
| Our Impact | `pages/about → impact` (body, stats, image) |
| Principal Advisor | Shared from `siteConfig → advisor` |
| CTA Banner | `pages/about → ctaBanner` |

### 5.4 Events Page (`/events`)

| Feature | Details |
|---------|---------|
| Hero Banner | `pages/events → hero` |
| Marquee Ticker | Reuses ticker component |
| Filter Tabs | Dynamically generated from distinct `category` values in the `events` collection |
| Event Cards | Each card: image, title, category tag, description, "Register" button → `/register?event={eventId}` |
| Steps to Register | Shared component |
| Stats | Shared component |
| CTA Banner | `pages/events → ctaBanner` |

**Event Card Data Model** (from `events` collection):
```
{
  id, title, category, subCategory, tag, description,
  image (Cloudinary URL), registrationFee, ageCategories,
  isActive, order, createdAt, updatedAt
}
```

### 5.5 Register Page (`/register`)

| Feature | Details |
|---------|---------|
| Hero Banner | `pages/register → hero` |
| Progress Indicator | 4 steps: Personal Info → Event Selection → Review → Payment |
| Registration Form | Multi-step form with client-side validation |
| Dynamic Event Dropdown | Category → filtered events (from `events` collection) |
| Age Category | Radio buttons (configurable from `siteConfig → ageCategories`) |
| Registration Fee | Dynamically displayed based on selected event |
| Sidebar Summary | Selected event, price, included perks (from `siteConfig → registrationPerks`), deadline, support phone |
| Payment | **Razorpay Checkout** integration |
| On Success | Save registration to Firestore `registrations` collection, send confirmation email to user, notify admin |

**Registration Data Model** (saved to `registrations` collection):
```
{
  id, firstName, lastName, email, phone,
  location, institution,
  eventCategory, eventId, eventTitle,
  ageCategory, message,
  amountPaid, paymentId (Razorpay), paymentStatus,
  createdAt, status (confirmed/pending/cancelled)
}
```

### 5.6 Contact Page (`/contact`)

| Feature | Details |
|---------|---------|
| Hero Banner | `pages/contact → hero` |
| Contact Form | firstName, lastName, email, phone, subject (dropdown), message |
| Sidebar | Phone, email, address (from `siteConfig → contact`), social links, Google Maps embed |
| Help Cards | `pages/contact → helpCards` |
| CTA Banner | `pages/contact → ctaBanner` |
| On Submit | Save to Firestore `contactSubmissions` collection, send notification email to admin |

---

## 6. Admin Dashboard (`/admin/*`)

Protected behind Firebase Auth + Firestore role check.

### 6.1 Dashboard Overview (`/admin/dashboard`)

| Widget | Data Source |
|--------|------------|
| Total Registrations | Count of `registrations` collection |
| Registrations This Month | Filtered count |
| Total Revenue | Sum of `amountPaid` from registrations |
| Active Events | Count of `events` where `isActive === true` |
| Recent Registrations | Latest 10 registrations (table) |
| Recent Contact Submissions | Latest 5 contact messages |

### 6.2 Event Management (`/admin/events`)

| Action | Details |
|--------|---------|
| **List Events** | Table with columns: Image, Title, Category, Fee, Status (active/inactive), Actions |
| **Add Event** | Form: title, category (select/create), tag, description (rich text), image upload (Cloudinary), registration fee, age categories, active toggle |
| **Edit Event** | Pre-filled form, same fields |
| **Delete Event** | Soft delete (set `isActive: false`) or hard delete with confirmation |
| **Reorder** | Drag-and-drop or order field |

### 6.3 Registrations (`/admin/registrations`)

| Feature | Details |
|---------|---------|
| **Table View** | Columns: Name, Email, Phone, Event, Category, Amount, Payment Status, Date, Actions |
| **Filters** | By event, category, payment status, date range |
| **Search** | By name, email, phone |
| **Export** | CSV download of filtered results |
| **View Details** | Slide-out panel or modal with full registration data |
| **Status Update** | Mark as confirmed/cancelled |

### 6.4 Contact Submissions (`/admin/contacts`)

| Feature | Details |
|---------|---------|
| **Table View** | Name, Email, Subject, Date, Read/Unread |
| **View Message** | Expand to read full message |
| **Mark as Read** | Toggle |
| **Delete** | Hard delete with confirmation |

### 6.5 Site Content Manager (`/admin/content`)

This is the core CMS feature — admins edit all dynamic content from here.

| Section | Editable Fields |
|---------|----------------|
| **Site Config** | Logo, site name, tagline, phone, email, address, social links, copyright text, advisor info, stats, registration perks, age categories, registration deadline |
| **Home Page** | Hero (bg image, badge, title, subtitle, buttons), About section, Join Us, Recognition slider, Government initiatives cards, Why Join Us cards, CTA banner |
| **About Page** | Hero, About, Mission, Activities, Why Join Us, Impact, CTA |
| **Events Page** | Hero, Ticker items, CTA |
| **Register Page** | Hero |
| **Contact Page** | Hero, Help cards, CTA |

Each section is an expandable accordion/tab with inline editing and a "Save" button that writes to the corresponding Firestore document.

**Image uploads** in the CMS go through **Cloudinary** (via a Next.js API route that handles the upload and returns the URL).

### 6.6 Partners Management (`/admin/partners`)

| Action | Details |
|--------|---------|
| List | Grid of partner logos with name |
| Add | Name, logo upload (Cloudinary), optional link |
| Edit | Update name/logo/link |
| Delete | Remove with confirmation |
| Reorder | Drag-and-drop |

### 6.7 Admin Management (`/admin/settings`)

| Feature | Details |
|---------|---------|
| **View Admins** | List of admin emails/names |
| **Add Admin** | Enter email → creates entry in `admins` collection (user must already have a Firebase Auth account) |
| **Remove Admin** | Delete from `admins` collection (cannot remove self) |

---

## 7. Firestore Data Model

### 7.1 Collections

```
firestore/
├── siteConfig/              (single document: "main")
│   ├── logo, siteName, tagline
│   ├── theme: { primaryColor, accentColor }      ← NEW: admin-configurable
│   ├── contact: { phone, email, address }
│   ├── socialLinks: [{ platform, url, icon }]
│   ├── quickLinks: [{ label, path }]
│   ├── usefulLinks: [{ label, path }]
│   ├── copyrightText
│   ├── advisor: { name, title, quote, image, badge }
│   ├── stats: [{ number, suffix, label }]
│   ├── registrationPerks: [string]
│   ├── ageCategories: [{ label, value }]
│   ├── registrationDeadline
│   └── navLinks: [{ label, path, isCTA }]
│
├── pages/                   (one document per page)
│   ├── home/     → { hero, ticker, about, joinUs, recognition, ... }
│   ├── about/    → { hero, about, mission, activities, ... }
│   ├── events/   → { hero, ticker, ctaBanner }
│   ├── register/ → { hero }
│   └── contact/  → { hero, helpCards, ctaBanner }
│
├── events/                  (one document per event)
│   └── {eventId} → { title, category, tag, description, image,
│                      registrationFee, ageCategories, isActive,
│                      order, createdAt, updatedAt }
│
├── registrations/           (one document per registration)
│   └── {regId}   → { firstName, lastName, email, phone, location,
│                      institution, eventCategory, eventId, eventTitle,
│                      ageCategory, message, amountPaid, paymentId,
│                      paymentStatus, createdAt, status }
│
├── contactSubmissions/      (one document per form submission)
│   └── {subId}   → { firstName, lastName, email, phone, subject,
│                      message, isRead, createdAt }
│
├── partners/                (one document per partner)
│   └── {partnerId} → { name, logoUrl, link, order, createdAt }
│
└── admins/                  (one document per admin user)
    └── {uid}     → { email, name, role, addedAt, addedBy }
```

### 7.2 Firestore Security Rules (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read for site content, events, partners
    match /siteConfig/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /pages/{page} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /events/{event} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /partners/{partner} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Registrations — public can create, only admin can read/update
    match /registrations/{reg} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Contact submissions — public can create, only admin can read/update/delete
    match /contactSubmissions/{sub} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Admins collection — only admins can read, only super-admin can write
    match /admins/{uid} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

---

## 8. API Routes (Next.js Route Handlers)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/upload` | POST | Receives image file, uploads to **Cloudinary**, returns URL. Protected — admin only. |
| `/api/payment/create-order` | POST | Creates a Razorpay order with amount. Called before checkout. |
| `/api/payment/verify` | POST | Verifies Razorpay payment signature. On success → saves registration to Firestore, sends confirmation email. |
| `/api/email/registration-confirmation` | POST | Sends confirmation email to user (triggered internally after payment verify). |
| `/api/email/admin-notification` | POST | Sends notification email to admin (new registration or new contact form). |
| `/api/email/contact-notification` | POST | Sends contact form submission notification to admin. |

### 8.1 Email Service

Use a transactional email provider. Recommended options:

| Option | Notes |
|--------|-------|
| **Resend** | Simple API, free tier covers needs, great DX |
| **Nodemailer + Gmail** | Zero cost but rate-limited, fine for low volume |
| **Firebase Extensions (Trigger Email)** | Uses a Firestore-trigger → sends email via configured SMTP |

> [!IMPORTANT]  
> **Decision needed:** Which email service do you prefer? Resend is the cleanest option for a Next.js app. Nodemailer + Gmail works if you want zero additional services.

### 8.2 Cloudinary Integration

- **Upload flow:** Admin selects image in CMS → frontend sends to `/api/upload` → API route uploads to Cloudinary using the server-side SDK → returns the secure URL → saved to Firestore.
- **Image transformations:** Cloudinary auto-optimizes (format, quality, resize) via URL parameters. No local image processing needed.
- **Environment variables needed:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## 9. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, Route Handlers) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Fonts | Poppins + Roboto Slab (Google Fonts via `next/font`) |
| Icons | Lucide React (lightweight, tree-shakable — replaces Font Awesome) |
| Auth | Firebase Auth (Email/Password + Google Sign-In) |
| Database | Cloud Firestore |
| Image Storage | Cloudinary |
| Payments | Razorpay Checkout |
| Email | Resend or Nodemailer (TBD) |
| Deployment | **Vercel** (native Next.js support, zero config) |
| State | React Context for auth state; SWR or React Query for data fetching (optional) |

---

## 10. Project Structure

```
yuf-website/
├── app/
│   ├── (public)/                    # Public route group
│   │   ├── layout.tsx               # Public layout (Navbar + Footer)
│   │   ├── page.tsx                 # Home
│   │   ├── about/page.tsx
│   │   ├── events/page.tsx
│   │   ├── register/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── admin/                       # Admin route group
│   │   ├── layout.tsx               # Admin layout (sidebar + auth guard)
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx             # Event list
│   │   │   └── [id]/page.tsx        # Add/Edit event
│   │   ├── registrations/page.tsx
│   │   ├── contacts/page.tsx
│   │   ├── content/page.tsx         # Site content CMS
│   │   ├── partners/page.tsx
│   │   └── settings/page.tsx        # Admin management
│   │
│   ├── api/
│   │   ├── upload/route.ts
│   │   ├── payment/
│   │   │   ├── create-order/route.ts
│   │   │   └── verify/route.ts
│   │   └── email/
│   │       ├── registration/route.ts
│   │       └── contact/route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx                   # Root layout
│   └── favicon.ico
│
├── components/
│   ├── public/                      # Public site components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── StatsCounter.tsx
│   │   ├── MarqueeTicker.tsx
│   │   ├── EventCard.tsx
│   │   ├── PartnerCarousel.tsx
│   │   ├── CTABanner.tsx
│   │   ├── StepsToRegister.tsx
│   │   └── ...
│   │
│   ├── admin/                       # Admin components
│   │   ├── Sidebar.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ContentEditor.tsx
│   │   └── ...
│   │
│   └── ui/                          # Shared primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       └── ...
│
├── lib/
│   ├── firebase.ts                  # Firebase client init (exists)
│   ├── firebase-admin.ts            # Firebase Admin SDK (for API routes)
│   ├── cloudinary.ts                # Cloudinary config
│   ├── razorpay.ts                  # Razorpay config
│   ├── email.ts                     # Email service config
│   └── utils.ts                     # Shared helpers
│
├── hooks/
│   ├── useAuth.ts                   # Auth state hook
│   ├── useFirestore.ts              # Firestore CRUD hooks
│   └── useAdmin.ts                  # Admin role check hook
│
├── types/
│   ├── index.ts                     # All TypeScript interfaces
│   └── firestore.ts                 # Firestore document types
│
├── contexts/
│   └── AuthContext.tsx               # Firebase Auth context provider
│
├── assets/                          # Local images (to be migrated to Cloudinary)
├── public/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 11. Decisions Log

| Decision | Choice | Notes |
|----------|--------|-------|
| Deployment | **Vercel** | Native Next.js support, zero config. `firebase.json` kept for Firestore rules/indexes only. |
| Email Service | **Deferred** | Will decide in a later phase. Code will use an abstracted `sendEmail()` helper so we can plug in any provider. |
| Razorpay | **Ready** | User has API keys. Store in `.env.local` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. |
| Image Strategy | **Hybrid** | See below. Upload script created at `scripts/upload-to-cloudinary.mjs`. |

### 11.1 Image Strategy — Hybrid Approach

**Static brand assets** stay in `/public` (served instantly from Vercel's CDN, no external dependency):

| Image | Location |
|-------|----------|
| YUF Logo (`YUF-Logo.png`) | `/public/images/logo.png` |
| YUCI Logo (`YUCI-Logo.png`) | `/public/images/yuci-logo.png` |
| Favicon | `/public/favicon.ico` |
| Government logos (Make in India, Fit India, Skill India) | `/public/images/gov/` |
| Partner org logos (if they rarely change) | `/public/images/partners/` |

**CMS-managed images** go to **Cloudinary** (uploadable/replaceable by admin from the dashboard):

| Image Type | Storage |
|------------|----------|
| Hero section backgrounds | Cloudinary |
| Event photos/thumbnails | Cloudinary |
| Awards/recognition slider images | Cloudinary |
| Advisor photo | Cloudinary |
| Any image an admin uploads via the CMS | Cloudinary |

> [!TIP]
> This hybrid approach gives the best of both worlds — brand assets load with **zero latency** (bundled with the app), while admins can still update event images, hero banners, and other dynamic visuals without code changes.

### 11.2 Open Questions (Remaining)

> [!NOTE]
> All major decisions have been resolved. The only remaining item is the **content seeding script** which will be created during Phase 2 to populate Firestore with initial content from `site-content.md`.

---

## 12. Implementation Phases

### Phase 1 — Foundation
- **Design token system** — define all CSS variables in `globals.css`, wire to Tailwind `@theme`
- Project structure setup, fonts (Poppins + Roboto Slab), global styles
- Firebase Admin SDK setup, Cloudinary config
- Auth context, admin guard, login page
- Firestore types and utility hooks
- Shared UI components (Button, Input, Select, Modal, etc.) — all using design tokens, zero hardcoded colors

### Phase 2 — Public Website
- Global layout (Navbar + Footer) pulling from Firestore
- Home page with all sections
- About page
- Events page with filter tabs
- Contact page with form submission to Firestore
- Interactive behaviors (marquee, counters, scroll animations)

### Phase 3 — Registration & Payments
- Multi-step registration form
- Dynamic event selection
- Razorpay integration (create order → checkout → verify)
- Registration confirmation email
- Save to Firestore

### Phase 4 — Admin Dashboard
- Admin layout with sidebar navigation
- Dashboard overview with stats
- Event CRUD (with Cloudinary image upload)
- Registrations table with filters, search, export
- Contact submissions viewer

### Phase 5 — CMS & Polish
- Site content editor (all pages, all sections)
- Partners management
- Admin user management
- Firestore security rules (production)
- Content seeding script
- SEO optimization (meta tags, OG tags per page)
- Performance optimization (image lazy loading, ISR/caching)

---

## Verification Plan

### Automated Tests
- Firestore security rules tested with `firebase emulators`
- Registration form validation unit tests
- API route tests (payment verify, upload, email)

### Manual Verification
- Full user flow: browse site → select event → register → pay → receive email
- Admin flow: login → add event → view registrations → edit site content → verify changes on public site
- Mobile responsiveness across all pages
- Dark mode consistency
