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

1. **Next.js App Router** — `app/` holds `layout.tsx` (root HTML, Geist fonts, global CSS) and `page.tsx`. Styling is Tailwind v4, configured through `@tailwindcss/postcss` in `postcss.config.mjs` (no `tailwind.config.js`).

2. **Firebase** — `lib/firebase.ts` is the single initialization point, exporting `app`, `auth`, and `db` (Firestore). It guards against hot-reload re-init via `getApps()`. All config comes from `NEXT_PUBLIC_FIREBASE_*` env vars, so import from `@/lib/firebase` rather than calling `initializeApp` again. `firebase.json` provisions Firestore plus Auth (email/password + Google sign-in). **`firestore.rules` is the open getting-started ruleset that expires 2026-07-27** — all client reads/writes break after that date until real rules are written.

3. **Cloudinary asset pipeline** — Images live in `assets/` (git-tracked source of truth). `scripts/upload-to-cloudinary.mjs` walks that tree, uploads to Cloudinary preserving folder structure under the `yuf-website` root folder (`--folder` to override), and writes `scripts/cloudinary-manifest.json` mapping each local path → secure URL + dimensions. The manifest is the bridge used to seed Firestore with image URLs. Requires `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` in `.env.local` (the script loads `.env.local` itself; uploads skip files that already exist).

### Environment

`.env.local` holds both the `NEXT_PUBLIC_FIREBASE_*` config (consumed by the app at build/runtime) and the `CLOUDINARY_*` credentials (consumed only by the upload script). It is not committed.
