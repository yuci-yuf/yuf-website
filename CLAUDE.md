# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Serve the production build
npm run lint             # ESLint (eslint-config-next)

npm run upload:preview   # Dry-run the Cloudinary asset upload (no writes)
npm run upload:assets    # Upload assets/ to Cloudinary, write the manifest
```

There is no test runner configured.

## Architecture

Marketing/event site for the Youth United Festival 2026. Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4. Module alias `@/*` maps to the repo root.

### Three subsystems wired together

1. **Next.js App Router** — the root `app/layout.tsx` owns the `<html>`/`<body>` shell, loads the Poppins + Roboto Slab Google fonts as CSS variables, and sets site-wide metadata. Below it, `app/` splits into two **route groups** with their own layouts:
   - `app/(public)/` — the marketing site (`page.tsx` home, plus `about`, `events`, `contact`, `register`). Its `layout.tsx` wraps every page in `Navbar` / `Footer` / `BackToTop`.
   - `app/admin/` — the gated panel. `app/admin/layout.tsx` mounts the `AuthProvider`; `app/admin/login/` is public; `app/admin/(panel)/` (dashboard, registrations, contacts, events) sits behind an auth gate (see below) and renders the `AdminSidebar`. `app/admin/page.tsx` redirects to `/admin/dashboard`.

   Styling is Tailwind v4, configured through `@tailwindcss/postcss` in `postcss.config.mjs` (no `tailwind.config.js`); design tokens live in `app/globals.css`. Reusable presentational pieces are under `components/` (`ui/` primitives, `public/`, `admin/`); the `cn()` helper in `lib/utils.ts` joins conditional class names.

2. **Firebase + auth/admin model** — `lib/firebase.ts` is the single initialization point, exporting `app`, `auth`, and `db` (Firestore). It guards against hot-reload re-init via `getApps()`. All config comes from `NEXT_PUBLIC_FIREBASE_*` env vars, so import from `@/lib/firebase` rather than calling `initializeApp` again. `firebase.json` provisions Firestore plus Auth (email/password + Google sign-in).

   `contexts/AuthContext.tsx` (`AuthProvider` / `useAuth`) tracks the signed-in user and resolves `isAdmin` by checking for a doc at `admins/{uid}` in Firestore. The `(panel)` layout uses this to redirect non-admins to `/admin/login`. **Admin access is granted by manually creating a doc in the `admins` collection keyed by the user's auth UID** — there is no self-serve signup.

   **`firestore.rules` is the open getting-started ruleset that expires 2026-07-27** — all client reads/writes break after that date until real rules are written (the planned rules let the public `create` in `contactSubmissions`/`registrations` but reserve reads for admins).

3. **Cloudinary asset pipeline** — Images live in `assets/` (git-tracked source of truth). `scripts/upload-to-cloudinary.mjs` walks that tree, uploads to Cloudinary preserving folder structure under the `yuf-website` root folder (`--folder` to override), and writes `scripts/cloudinary-manifest.json` mapping each local path → secure URL + dimensions. The manifest is the bridge used to seed Firestore with image URLs. Requires `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` in `.env.local` (the script loads `.env.local` itself; uploads skip files that already exist).

### Data flow

All Firestore access is **client-side** via the Firebase client SDK; there are no API routes or server actions for data. Types for both content and Firestore documents live in `types/index.ts`.

- `lib/content.ts` — typed, hardcoded defaults for public-site copy (hero, events, partners, advisors, site config), shaped to mirror the eventual Firestore CMS schema so pages won't change when a Firestore loader is swapped in.
- `lib/submissions.ts` — public write helpers: `submitContact` → `contactSubmissions`, `submitRegistration` → `registrations` (created with `pending` status; a future Razorpay flow will set it `paid`/`confirmed`).
- `lib/admin-data.ts` — admin reads/writes: list registrations & contact messages (Firestore `Timestamp`s normalized to ISO strings), mark messages read, set registration status.

### Environment

`.env.local` holds both the `NEXT_PUBLIC_FIREBASE_*` config (consumed by the app at build/runtime) and the `CLOUDINARY_*` credentials (consumed only by the upload script). It is not committed.
