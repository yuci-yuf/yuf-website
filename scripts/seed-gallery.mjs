#!/usr/bin/env node

/**
 * seed-gallery.mjs
 *
 * Adds curated event photos from `assets/` to the Firestore `gallery`
 * collection — the same thing an admin does via the Gallery panel, but in bulk.
 *
 * For each photo it (1) uploads to Cloudinary (creds from .env.local, same as
 * the admin's browser upload target) and (2) writes a `gallery` doc with the
 * secure URL. Writes are admin-only per firestore.rules, so it signs in with
 * the admin email/password first.
 *
 * Deterministic doc IDs + Cloudinary public_ids make it idempotent: re-running
 * updates the same docs/assets instead of creating duplicates.
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='****' \
 *     node scripts/seed-gallery.mjs
 *   Options:  --dry-run   List the curated photos, no upload / no writes.
 */

import { readFile, access } from "node:fs/promises";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const ASSETS_DIR = join(PROJECT_ROOT, "assets");
const DRY_RUN = process.argv.includes("--dry-run");

// Order base — puts these after any hand-added gallery images (which use small
// order values) and stays stable across re-runs.
const ORDER_BASE = 100;

async function loadEnv() {
  try {
    const envContent = await readFile(join(PROJECT_ROOT, ".env.local"), "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* rely on system env */
  }
}

// Curated real event photos (logos, officials, and scheme graphics excluded).
// [ relative path under assets/, alt text ]
const PHOTOS = [
  ["IMG-20250525-WA0020.jpg", "Youth United Festival participants"],
  ["IMG-20250525-WA0021.jpg", "Youth United Festival participants"],
  ["IMG-20250525-WA0030.jpg", "Youth United Festival gathering"],
  ["IMG-20250924-WA0003.jpg", "Youth United Festival event moment"],
  ["IMG-20250924-WA0006.jpg", "Youth United Festival event moment"],
  ["IMG-20250925-WA0030.jpg", "Youth United Festival event moment"],
  ["Table-tennis-competition.jpg", "Table tennis competition"],
  ["Wheelchair-Basketball.jpg", "Wheelchair basketball match"],
  ["Pole-Mallakhamb-1024x810-1.webp", "Mallakhamb performance"],
  ["four-people-playing-badminton-doubles.png", "Badminton doubles match"],
  ["Thearitical.jpg", "Theatrical performance"],
  ["pondicherry_event/IMG-20250924-WA0004.jpg", "Pondicherry festival event"],
  ["pondicherry_event/IMG-20250924-WA0008.jpg", "Pondicherry festival event"],
  ["pondicherry_event/IMG-20250925-WA0031.jpg", "Pondicherry festival event"],
  ["pondicherry_event/IMG-20250925-WA0032.jpg", "Pondicherry festival event"],
  ["pondicherry_event/IMG-20250925-WA0033.jpg", "Pondicherry festival event"],
  ["pondicherry_event/IMG-20250925-WA0034.jpg", "Pondicherry festival event"],
  ["Recent_Events/IMG-20250924-WA0001.jpg", "Youth United Festival highlight"],
  ["Recent_Events/IMG-20250924-WA0002.jpg", "Youth United Festival highlight"],
  ["Recent_Events/IMG-20250924-WA0005.jpg", "Youth United Festival highlight"],
  ["Recent_Events/IMG-20250924-WA0072.jpg", "Youth United Festival highlight"],
  ["Awards_Slide(RAJ BHAVAN)/Awards-slide-1.jpg", "Award recognition at Raj Bhavan"],
  ["Awards_Slide(RAJ BHAVAN)/Awards-slide-2.jpg", "Award recognition at Raj Bhavan"],
  ["Awards_Slide(RAJ BHAVAN)/Awards-slide-3.jpg", "Award recognition at Raj Bhavan"],
  ["Awards_Slide(RAJ BHAVAN)/Awards-slide-4.jpg", "Award recognition at Raj Bhavan"],
  ["colleges_connections/276321074_507999070839404_4582252188558234710_n.jpg", "College connect programme"],
  ["colleges_connections/322732632_5981019165295240_8305168599800046427_n.jpg", "College connect programme"],
  ["colleges_connections/360399408_852113809644513_9005858241203788292_n.jpg", "College connect programme"],
];

function slugify(file) {
  return basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await loadEnv();

  console.log(`Curated ${PHOTOS.length} gallery photos from assets/.`);

  if (DRY_RUN) {
    for (const [file, alt] of PHOTOS) {
      let exists = "OK ";
      try {
        await access(join(ASSETS_DIR, file));
      } catch {
        exists = "MISSING";
      }
      console.log(`  [${exists}] ${slugify(file)} — ${alt}  (${file})`);
    }
    console.log("\n(dry run — nothing uploaded or written)");
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!email || !password) {
    console.error(
      "\n✗ Missing admin credentials. Set SEED_ADMIN_EMAIL and " +
        "SEED_ADMIN_PASSWORD (in .env.local or the environment) and re-run.\n",
    );
    process.exit(1);
  }
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("\n✗ Missing CLOUDINARY_* credentials in .env.local.\n");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  const db = getFirestore(app);

  console.log(`Signing in as ${email}…`);
  await signInWithEmailAndPassword(getAuth(app), email, password);
  console.log("✓ Authenticated.\n");

  let done = 0;
  for (let i = 0; i < PHOTOS.length; i++) {
    const [file, alt] = PHOTOS[i];
    const slug = slugify(file);
    const absPath = join(ASSETS_DIR, file);
    try {
      const res = await cloudinary.uploader.upload(absPath, {
        public_id: slug,
        folder: "yuf-website/gallery",
        overwrite: true,
        resource_type: "image",
      });
      await setDoc(
        doc(db, "gallery", `asset-${slug}`),
        {
          src: res.secure_url,
          alt,
          order: ORDER_BASE + i,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      done++;
      console.log(`  ✓ ${slug}`);
    } catch (err) {
      console.error(`  ✗ ${slug}: ${err?.message || err}`);
    }
  }

  console.log(`\nDone. Added/updated ${done}/${PHOTOS.length} gallery images.`);
  console.log("Refresh /gallery to see them.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err?.code || "", err?.message || err);
  process.exit(1);
});
