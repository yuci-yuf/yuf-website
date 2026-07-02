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

// Event artwork sourced from Unsplash (free to use). Cropped to a wide card
// ratio with the same query params so every image loads at a consistent size.
// `IMG(id)` builds the delivery URL; per-title matches fall back to per-category.
const IMG = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

// Per-title images (most specific).
const TITLE_IMAGES = {
  // Sports & Games
  "Cricket": IMG("1531415074968-036ba1b575da"),
  "Throwball": IMG("1612872087720-bb876e2e67d1"),
  "Volleyball": IMG("1592656094267-764a45160876"),
  "Kabaddi": IMG("1517649763962-0c623066013b"),
  "Badminton Doubles": IMG("1626224583764-f87db24ac4ea"),
  "Badminton Singles": IMG("1519861531473-9200262188bf"),
  "Chess": IMG("1528819622765-d6bcf132f793"),
  "Shot Put (Senior)": IMG("1552674605-db6ffd4facb5"),
  "Long Jump (Senior)": IMG("1461896836934-ffe607ba8211"),
  "High Jump (Senior)": IMG("1574629810360-7efbbe195018"),
  "Yoga": IMG("1544367567-0f2fcb009e0b"),
  "Silambam": IMG("1555597673-b21d5c935865"),
  "Swimming": IMG("1530549387789-4c1017266635"),
  "Table Tennis Singles": IMG("1534158914592-062992fbe900"),
  "Kho-Kho": IMG("1571902943202-507ec2618e8f"),
  // Athletics
  "100 Metres": IMG("1571019613454-1cb2f99b2d8b"),
  "200 Metres": IMG("1546519638-68e109498ffc"),
  "4×100m Relay (Senior)": IMG("1627627256672-027a4613d028"),
  // Arts & Culturals
  "Battle of Bands": IMG("1501386761578-eac5c94b800a"),
  "Solo Singing": IMG("1516280440614-37939bbacd81"),
  "Acoustics / Instrumental": IMG("1511671782779-c97d3d27a1d4"),
  "Solo Dance": IMG("1508700115892-45ecd05ae2ad"),
  "Group Dance": IMG("1504609773096-104ff2c73ba4"),
  "Poetry": IMG("1455390582262-044cdead277a"),
  "Face Painting": IMG("1596464716127-f2a82984de30"),
  "Pencil Sketching": IMG("1607962837359-5e7e89f86776"),
  "Painting": IMG("1513364776144-60967b0f800f"),
  "Youth Talent Icon": IMG("1516450360452-9312f5e86fc7"),
  // Technical
  "Quiz": IMG("1503676260728-1c00da094a0b"),
  "Debate": IMG("1475721027785-f74eccf877e2"),
  "Indian Youth Parliament": IMG("1529107386315-e1a2ed48a620"),
  "India's Young Scientist": IMG("1532094349884-543bc11b234d"),
  // Fun Events
  "Treasure Hunt": IMG("1533174072545-7a4b6ad7a6c3"),
  "Guess the Song": IMG("1470225620780-dba8ba36b745"),
};

// Per-category fallback (used when a title has no explicit image).
const CATEGORY_IMAGES = {
  "Sports & Games": IMG("1461896836934-ffe607ba8211"),
  "Athletics": IMG("1552674605-db6ffd4facb5"),
  "Arts & Culturals": IMG("1508700115892-45ecd05ae2ad"),
  "Technical": IMG("1503676260728-1c00da094a0b"),
  "Fun Events": IMG("1533174072545-7a4b6ad7a6c3"),
};

function eventImage(category, title) {
  return TITLE_IMAGES[title] ?? CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["Sports & Games"];
}

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
      image: eventImage(category, title),
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
