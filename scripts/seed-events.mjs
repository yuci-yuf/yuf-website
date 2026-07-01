#!/usr/bin/env node

/**
 * seed-events.mjs
 *
 * Populates the Firestore `eventCategories` and `events` collections with the
 * Youth United Festival 2026 schedule (see the Event Schedule source doc).
 *
 * Writes to `events` are admin-only per `firestore.rules` (request.auth != null),
 * so this signs in with the admin email/password using the Firebase *client*
 * SDK (same config the app uses) before writing.
 *
 * Doc IDs are deterministic slugs, and writes use { merge: true }, so the
 * script is idempotent — re-running updates the same docs instead of creating
 * duplicates, and never clobbers `registrationCount`.
 *
 * Usage:
 *   1. Ensure `.env.local` has the NEXT_PUBLIC_FIREBASE_* config (it does).
 *   2. Provide admin credentials (kept out of source) via env, e.g.:
 *        SEED_ADMIN_EMAIL=admin@example.com \
 *        SEED_ADMIN_PASSWORD='********' \
 *        node scripts/seed-events.mjs
 *      Options:  --dry-run   Print what would be written, no Firestore calls.
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
// --replace deletes ALL existing events before writing (clean slate). Without
// it, the script only merges/adds. Categories are always upserted, never wiped.
const REPLACE = process.argv.includes("--replace");

// ── Load .env.local (same loader as the cloudinary script) ──
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

// ── Categories (drive the filter tabs on /events) ──
const CATEGORIES = [
  { name: "Sports & Games", order: 0 },
  { name: "Athletics", order: 1 },
  { name: "Arts & Culturals", order: 2 },
  { name: "Technical", order: 3 },
  { name: "Fun Events", order: 4 },
];

// ── Schedule (category, title, venue, date) ──
const SCHEDULE = [
  // I. Sports
  ["Sports & Games", "Cricket", "Chennai", "11th – 13th Sept 2026"],
  ["Sports & Games", "Throwball", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Volleyball", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Kabaddi", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Kabaddi", "Velammal Bodhi Campus, Coimbatore", "7th Sept 2026"],
  ["Sports & Games", "Badminton Doubles", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Badminton Singles", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Chess", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Shot Put (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "Long Jump (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "High Jump (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "Yoga", "Dhanraj Baid Jain College, Thoraipakkam", "10th Sept 2026"],
  ["Sports & Games", "Silambam", "Velammal Bodhi Campus, Coimbatore", "8th Sept 2026"],
  ["Sports & Games", "Silambam", "Dhanraj Baid Jain College, Thoraipakkam", "11th Sept 2026"],
  ["Sports & Games", "Swimming", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "Table Tennis Singles", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Kho-Kho", "Chennai", ""],
  // II. Athletics
  ["Athletics", "100 Metres", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Athletics", "200 Metres", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Athletics", "4×100m Relay (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  // III. Arts & Cultural
  ["Arts & Culturals", "Battle of Bands", "Velammal Bodhi Campus, Ponneri", "10th Sept 2026"],
  ["Arts & Culturals", "Solo Singing", "Velammal Bodhi Campus, Ponneri", "10th Sept 2026"],
  ["Arts & Culturals", "Acoustics / Instrumental", "Velammal Bodhi Campus, Ponneri", "10th Sept 2026"],
  ["Arts & Culturals", "Solo Dance", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Group Dance", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Poetry", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Face Painting", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Pencil Sketching", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Painting", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Youth Talent Icon", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  // IV. Technical
  ["Technical", "Quiz", "Velammal Bodhi Campus, Ponneri", "15th Sept 2026"],
  ["Technical", "Debate", "Velammal Bodhi Campus, Ponneri", "11th Sept 2026"],
  ["Technical", "Indian Youth Parliament", "Velammal Bodhi Campus, Ponneri", "11th Sept 2026"],
  ["Technical", "India's Young Scientist", "Velammal Bodhi Campus, Ponneri", "11th Sept 2026"],
  // V. Fun
  ["Fun Events", "Treasure Hunt", "Velammal Bodhi Campus, Ponneri", "15th Sept 2026"],
  ["Fun Events", "Guess the Song", "Velammal Bodhi Campus, Ponneri", "15th Sept 2026"],
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[×]/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function describe(category, title) {
  switch (category) {
    case "Arts & Culturals":
      return `Take the stage for ${title} and showcase your talent at Youth United Festival 2026.`;
    case "Technical":
      return `Put your knowledge to the test in ${title} at Youth United Festival 2026.`;
    case "Fun Events":
      return `Join the fun with ${title} at Youth United Festival 2026.`;
    default:
      return `Compete in ${title} at Youth United Festival 2026.`;
  }
}

// Build event docs with deterministic, collision-free IDs.
function buildEvents() {
  const usedIds = new Set();
  return SCHEDULE.map(([category, title, venue, date], i) => {
    let id = slugify(title);
    if (usedIds.has(id)) {
      // Same event name in two places → suffix with a venue keyword.
      const place = slugify(venue.split(",").pop() || String(i));
      id = `${id}-${place}`;
    }
    usedIds.add(id);

    const data = {
      title,
      category,
      description: describe(category, title),
      isActive: true,
      registrationOpen: true,
      status: "upcoming",
      order: i,
    };
    if (venue) data.venue = venue;
    if (date) data.date = date;
    return { id, data };
  });
}

async function main() {
  await loadEnv();

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!DRY_RUN && (!email || !password)) {
    console.error(
      "\n✗ Missing admin credentials.\n" +
        "  Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD and re-run, e.g.:\n\n" +
        "    SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='****' \\\n" +
        "      node scripts/seed-events.mjs\n",
    );
    process.exit(1);
  }

  const events = buildEvents();
  console.log(
    `Prepared ${CATEGORIES.length} categories and ${events.length} events.`,
  );

  if (DRY_RUN) {
    for (const { id, data } of events) {
      console.log(`  [${data.category}] ${id} — ${data.title} (${data.date || "no date"})`);
    }
    console.log("\n(dry run — nothing written)");
    return;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Signing in as ${email}…`);
  await signInWithEmailAndPassword(auth, email, password);
  console.log("✓ Authenticated.");

  // Optional clean slate: delete every existing event first.
  if (REPLACE) {
    const existing = await getDocs(collection(db, "events"));
    if (existing.size > 0) {
      const del = writeBatch(db);
      existing.forEach((d) => del.delete(d.ref));
      await del.commit();
      console.log(`✓ Deleted ${existing.size} existing event(s).`);
    } else {
      console.log("• No existing events to delete.");
    }
  }

  // Categories
  for (const c of CATEGORIES) {
    await setDoc(
      doc(db, "eventCategories", slugify(c.name)),
      { name: c.name, order: c.order },
      { merge: true },
    );
  }
  console.log(`✓ Wrote ${CATEGORIES.length} categories.`);

  // Events — batched, merge so registrationCount is never clobbered.
  const batch = writeBatch(db);
  for (const { id, data } of events) {
    batch.set(doc(db, "events", id), data, { merge: true });
  }
  await batch.commit();
  console.log(`✓ Wrote ${events.length} events.`);

  console.log("\nDone. Refresh /events to see them.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err?.code || "", err?.message || err);
  process.exit(1);
});
